#!/usr/bin/env node
/**
 * Generate Gas Station COO HeyGen videos from script HTML (investor + developer).
 *
 * Usage:
 *   node scripts/heygen/generate-gas-station-videos.js
 *   node scripts/heygen/generate-gas-station-videos.js --dry-run
 *   node scripts/heygen/generate-gas-station-videos.js --only series
 *   node scripts/heygen/generate-gas-station-videos.js --only investor
 *   node scripts/heygen/generate-gas-station-videos.js --resume
 *
 * Requires heygen_video_gen_key in .env.local (not committed).
 * Output: documentation/.../videos/generated/ (gitignored)
 */
const fs = require('fs');
const path = require('path');

const {
  curlDownload,
  generateVideo,
  getVideoStatus,
} = require('./heygen-client');
const { buildJobs, loadScriptPackage } = require('./parse-gas-station-scripts');

const ROOT = path.join(__dirname, '../..');
const OUTPUT_DIR = path.join(
  ROOT,
  'documentation/tenant_management/gas_station_site/videos/generated'
);
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const AVATARS = {
  investor: process.env.HEYGEN_INVESTOR_AVATAR_ID || 'Ann_Business_Front_public',
  developer: process.env.HEYGEN_DEVELOPER_AVATAR_ID || 'Brandon_Business_Standing_Front_public',
};

const VOICES = {
  investor: process.env.HEYGEN_INVESTOR_VOICE_ID || '6458ca9a09ba411b9487dfe105dd05dc', // Jenny
  developer: process.env.HEYGEN_DEVELOPER_VOICE_ID || 'ff465a8dab0d42c78f874a135b11d47d', // Davis - Professional
};

const BACKGROUNDS = {
  investor: '#0066cc',
  developer: '#0d3b66',
};

function loadApiKey() {
  const envPath = path.join(ROOT, '.env.local');
  const envText = fs.readFileSync(envPath, 'utf8');
  const m = envText.match(/^heygen_video_gen_key=(.+)$/m);
  if (!m) throw new Error('heygen_video_gen_key not found in .env.local');
  return m[1].trim();
}

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    resume: true,
    only: null, // series | full | investor | developer
    pollSec: 15,
    maxPollMin: 45,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-resume') opts.resume = false;
    else if (a === '--resume') opts.resume = true;
    else if (a === '--only' && argv[i + 1]) opts.only = argv[++i];
    else if (a === '--poll-sec' && argv[i + 1]) opts.pollSec = Number(argv[++i]);
    else if (a === '--max-poll-min' && argv[i + 1]) opts.maxPollMin = Number(argv[++i]);
  }
  return opts;
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: 1, startedAt: new Date().toISOString(), jobs: {} };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function saveManifest(manifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function filterJobs(jobs, only) {
  if (!only) return jobs;
  if (only === 'series') return jobs.filter((j) => j.kind === 'series');
  if (only === 'full') return jobs.filter((j) => j.kind === 'full');
  if (only === 'investor') return jobs.filter((j) => j.audience === 'investor');
  if (only === 'developer') return jobs.filter((j) => j.audience === 'developer');
  throw new Error(`Unknown --only value: ${only}`);
}

function buildPayload(job) {
  const avatarId = AVATARS[job.audience];
  const voiceId = VOICES[job.audience];
  const bg = BACKGROUNDS[job.audience];

  return {
    title: job.title.slice(0, 120),
    caption: true,
    dimension: { width: 1920, height: 1080 },
    video_inputs: job.scenes.map((scene, idx) => ({
      character: {
        type: 'avatar',
        avatar_id: avatarId,
        avatar_style: idx === 0 ? 'normal' : 'normal',
      },
      voice: {
        type: 'text',
        voice_id: voiceId,
        input_text: scene.text,
        speed: 1.0,
      },
      background: { type: 'color', value: bg },
    })),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForVideo(apiKey, videoId, pollSec, maxPollMin) {
  const maxAttempts = Math.ceil((maxPollMin * 60) / pollSec);
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = getVideoStatus(apiKey, videoId);
    const status = data?.status;
    if (status === 'completed') {
      return data;
    }
    if (status === 'failed') {
      throw new Error(data?.error || 'HeyGen reported failed status');
    }
    process.stdout.write(`  poll ${i + 1}/${maxAttempts}: ${status || 'pending'}...\n`);
    await sleep(pollSec * 1000);
  }
  throw new Error(`Timed out after ${maxPollMin} minutes`);
}

/** Download MP4 (prefer HeyGen burn-in caption track) + optional .srt sidecar. */
function downloadCompletedVideo(statusData, outPath) {
  const mp4Url = statusData.video_url_caption || statusData.video_url;
  if (!mp4Url) throw new Error('No video URL in HeyGen status');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  curlDownload(mp4Url, outPath);
  const srtPath = outPath.replace(/\.mp4$/i, '.srt');
  if (statusData.caption_url) {
    try {
      curlDownload(statusData.caption_url, srtPath, 300);
    } catch (err) {
      console.warn(`  [warn] SRT download failed: ${err.message}`);
    }
  }
  return {
    videoUrl: statusData.video_url,
    videoUrlCaption: statusData.video_url_caption || null,
    captionUrl: statusData.caption_url || null,
    srtFile: statusData.caption_url ? path.basename(srtPath) : null,
    burnedInCaptions: Boolean(statusData.video_url_caption),
  };
}

async function processJob(apiKey, job, manifest, opts) {
  const existing = manifest.jobs[job.key];
  const outPath = path.join(OUTPUT_DIR, job.outputFile);

  if (opts.resume && existing?.status === 'completed' && fs.existsSync(outPath)) {
    console.log(`[skip] ${job.key} already completed → ${job.outputFile}`);
    return;
  }

  if (opts.resume && existing?.videoId && existing?.status === 'processing') {
    console.log(`[resume] ${job.key} video_id=${existing.videoId}`);
    try {
      const statusData = await waitForVideo(apiKey, existing.videoId, opts.pollSec, opts.maxPollMin);
      const captionMeta = downloadCompletedVideo(statusData, outPath);
      manifest.jobs[job.key] = {
        ...existing,
        status: 'completed',
        ...captionMeta,
        outputFile: job.outputFile,
        completedAt: new Date().toISOString(),
      };
      saveManifest(manifest);
      console.log(`[done] ${job.key} → ${job.outputFile}`);
      return;
    } catch (err) {
      console.error(`[resume failed] ${job.key}: ${err.message}`);
      manifest.jobs[job.key] = { ...existing, status: 'failed', error: err.message };
      saveManifest(manifest);
      throw err;
    }
  }

  const payload = buildPayload(job);
  const sceneChars = job.scenes.reduce((n, s) => n + s.text.length, 0);
  console.log(`\n[submit] ${job.key} (${job.scenes.length} scene(s), ~${sceneChars} chars)`);
  console.log(`  title: ${job.title}`);

  if (opts.dryRun) {
    console.log('  dry-run: skipping API call');
    return;
  }

  const createRes = generateVideo(apiKey, payload);
  const videoId = createRes.data?.video_id;
  if (!videoId) throw new Error(`No video_id returned for ${job.key}`);

  manifest.jobs[job.key] = {
    key: job.key,
    audience: job.audience,
    kind: job.kind,
    title: job.title,
    videoId,
    status: 'processing',
    sceneCount: job.scenes.length,
    outputFile: job.outputFile,
    submittedAt: new Date().toISOString(),
  };
  saveManifest(manifest);

  console.log(`  video_id: ${videoId}`);
  const statusData = await waitForVideo(apiKey, videoId, opts.pollSec, opts.maxPollMin);
  const captionMeta = downloadCompletedVideo(statusData, outPath);
  manifest.jobs[job.key] = {
    ...manifest.jobs[job.key],
    status: 'completed',
    ...captionMeta,
    completedAt: new Date().toISOString(),
  };
  saveManifest(manifest);
  console.log(`[done] ${job.key} → ${job.outputFile}`);
}

async function main() {
  const opts = parseArgs(process.argv);
  const apiKey = loadApiKey();
  const scripts = loadScriptPackage();
  const allJobs = filterJobs(buildJobs(scripts), opts.only);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const manifest = loadManifest();

  console.log('Gas Station COO — HeyGen video generation');
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Jobs: ${allJobs.length} (only=${opts.only || 'all'})`);
  console.log(`Investor avatar: ${AVATARS.investor} / voice: ${VOICES.investor}`);
  console.log(`Developer avatar: ${AVATARS.developer} / voice: ${VOICES.developer}`);

  const summary = { completed: 0, failed: 0, skipped: 0 };

  for (const job of allJobs) {
    try {
      const outPath = path.join(OUTPUT_DIR, job.outputFile);
      const existing = manifest.jobs[job.key];
      if (opts.resume && existing?.status === 'completed' && fs.existsSync(outPath)) {
        summary.skipped++;
        console.log(`[skip] ${job.key}`);
        continue;
      }
      await processJob(apiKey, job, manifest, opts);
      summary.completed++;
    } catch (err) {
      summary.failed++;
      console.error(`[error] ${job.key}: ${err.message}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Manifest: ${MANIFEST_PATH}`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
