#!/usr/bin/env node
/**
 * Sync completed HeyGen videos to local generated/ folder.
 * Polls processing jobs in manifest + lists account videos from HeyGen API.
 */
const fs = require('fs');
const path = require('path');
const { curlDownload, getVideoStatus } = require('./heygen-client');
const { buildJobs, loadScriptPackage } = require('./parse-gas-station-scripts');

const ROOT = path.join(__dirname, '../..');
const OUTPUT_DIR = path.join(
  ROOT,
  'documentation/tenant_management/gas_station_site/videos/generated'
);
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

function loadApiKey() {
  const envText = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
  const m = envText.match(/^heygen_video_gen_key=(.+)$/m);
  if (!m) throw new Error('heygen_video_gen_key not found in .env.local');
  return m[1].trim();
}

function listAccountVideos(apiKey) {
  const { spawnSync } = require('child_process');
  const r = spawnSync(
    'curl.exe',
    ['-sS', '-k', 'https://api.heygen.com/v1/video.list', '-H', `X-Api-Key: ${apiKey}`],
    { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
  );
  const json = JSON.parse(r.stdout);
  return (json.data && json.data.videos) || [];
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: 1, jobs: {} };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function saveManifest(manifest) {
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function titleToJob(jobs) {
  const byTitle = new Map();
  for (const job of jobs) {
    byTitle.set(job.title, job);
  }
  return byTitle;
}

function downloadVideo(apiKey, videoId, destPath) {
  const { data } = getVideoStatus(apiKey, videoId);
  if (data.status !== 'completed' || !data.video_url) {
    return { ok: false, status: data.status, error: data.error };
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const mp4Url = data.video_url_caption || data.video_url;
  curlDownload(mp4Url, destPath);
  const srtPath = destPath.replace(/\.mp4$/i, '.srt');
  if (data.caption_url) {
    try {
      curlDownload(data.caption_url, srtPath, 300);
    } catch (_) { /* optional */ }
  }
  return {
    ok: true,
    status: 'completed',
    videoUrl: data.video_url,
    videoUrlCaption: data.video_url_caption || null,
    captionUrl: data.caption_url || null,
    burnedInCaptions: Boolean(data.video_url_caption),
  };
}

function main() {
  const apiKey = loadApiKey();
  const jobs = buildJobs(loadScriptPackage());
  const byTitle = titleToJob(jobs);
  const manifest = loadManifest();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const accountVideos = listAccountVideos(apiKey);
  console.log(`HeyGen account: ${accountVideos.length} video(s)`);

  let downloaded = 0;
  let processing = 0;
  let failed = 0;

  for (const v of accountVideos) {
    const videoId = v.video_id;
    const title = (v.title || v.video_title || '').trim();
    const status = v.status;
    console.log(`\n• ${title || videoId}`);
    console.log(`  status: ${status}`);

    let job =
      Object.values(manifest.jobs).find((j) => j.videoId === videoId) ||
      byTitle.get(title);

    if (!job && title === 'Gas Station COO Test') {
      job = {
        key: 'test',
        outputFile: 'test/gas-station-coo-test.mp4',
        title,
      };
    }

    if (!job) {
      console.log('  skip: no local job mapping');
      continue;
    }

    const destPath = path.join(OUTPUT_DIR, job.outputFile);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100000) {
      console.log(`  skip: already downloaded → ${job.outputFile}`);
      if (!manifest.jobs[job.key]) {
        manifest.jobs[job.key] = {
          key: job.key,
          videoId,
          status: 'completed',
          outputFile: job.outputFile,
          title: job.title || title,
        };
      }
      continue;
    }

    if (status !== 'completed') {
      if (status === 'failed') failed++;
      else processing++;
      if (manifest.jobs[job.key]) {
        manifest.jobs[job.key].status = status;
        manifest.jobs[job.key].videoId = videoId;
      }
      console.log(`  not ready for download`);
      continue;
    }

    try {
      const result = downloadVideo(apiKey, videoId, destPath);
      if (!result.ok) {
        console.log(`  download blocked: ${result.status}`);
        processing++;
        continue;
      }
      manifest.jobs[job.key] = {
        ...(manifest.jobs[job.key] || {}),
        key: job.key,
        audience: job.audience,
        kind: job.kind,
        title: job.title || title,
        videoId,
        status: 'completed',
        outputFile: job.outputFile,
        videoUrl: result.videoUrl,
        completedAt: new Date().toISOString(),
      };
      downloaded++;
      console.log(`  downloaded → ${job.outputFile}`);
    } catch (err) {
      failed++;
      console.log(`  error: ${err.message}`);
    }
  }

  saveManifest(manifest);

  const expected = jobs.length;
  const localMp4 = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.mp4')) localMp4.push(p);
    }
  }
  if (fs.existsSync(OUTPUT_DIR)) walk(OUTPUT_DIR);

  console.log('\n--- Sync summary ---');
  console.log(`Expected jobs: ${expected}`);
  console.log(`Downloaded this run: ${downloaded}`);
  console.log(`Still processing on HeyGen: ${processing}`);
  console.log(`Failed: ${failed}`);
  console.log(`Local MP4 files: ${localMp4.length}`);
  localMp4.forEach((p) => {
    const rel = path.relative(OUTPUT_DIR, p);
    const mb = (fs.statSync(p).size / (1024 * 1024)).toFixed(2);
    console.log(`  ${rel} (${mb} MB)`);
  });
  console.log(`\nManifest: ${MANIFEST_PATH}`);

  const completedJobs = Object.values(manifest.jobs).filter((j) => j.status === 'completed').length;
  if (completedJobs < expected) {
    console.log(`\nNote: ${expected - completedJobs} of ${expected} package videos not completed yet.`);
    console.log('Run: node scripts/heygen/generate-gas-station-videos.js --resume');
  }
}

main();
