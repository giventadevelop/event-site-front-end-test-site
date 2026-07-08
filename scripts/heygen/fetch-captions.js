#!/usr/bin/env node
/**
 * Fetch HeyGen burned-in caption MP4 + SRT sidecar for completed manifest jobs.
 *
 * HeyGen sets caption:true at generation time but returns captions separately:
 *   - video_url_caption  → MP4 with burned-in subtitles (best for local players)
 *   - caption_url        → .srt sidecar
 *
 * Usage:
 *   node scripts/heygen/fetch-captions.js
 *   node scripts/heygen/fetch-captions.js --only dev-full
 *   node scripts/heygen/fetch-captions.js --force
 */
const fs = require('fs');
const path = require('path');
const { curlDownload, getVideoStatus } = require('./heygen-client');

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

function parseArgs(argv) {
  const opts = { only: null, force: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--only' && argv[i + 1]) opts.only = argv[++i];
    else if (argv[i] === '--force') opts.force = true;
  }
  return opts;
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function saveManifest(manifest) {
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function fetchCaptionsForJob(apiKey, key, entry, opts) {
  const outPath = path.join(OUTPUT_DIR, entry.outputFile);
  const srtPath = outPath.replace(/\.mp4$/i, '.srt');

  if (!entry.videoId) {
    console.log(`[skip] ${key}: no videoId`);
    return 'skipped';
  }
  if (entry.status !== 'completed') {
    console.log(`[skip] ${key}: status=${entry.status}`);
    return 'skipped';
  }
  if (!opts.force && entry.burnedInCaptions && fs.existsSync(srtPath)) {
    console.log(`[skip] ${key}: captions already fetched`);
    return 'skipped';
  }
  if (!fs.existsSync(outPath) && !entry.videoUrlCaption) {
    console.log(`[skip] ${key}: MP4 missing and no caption URL cached`);
    return 'skipped';
  }

  console.log(`[fetch] ${key} (${entry.videoId})`);
  const { data } = getVideoStatus(apiKey, entry.videoId);
  if (data.status !== 'completed') {
    console.log(`  status=${data.status}, not ready`);
    return 'skipped';
  }

  const mp4Url = data.video_url_caption || data.video_url;
  if (!mp4Url) throw new Error('No video URL');

  if (data.video_url_caption && data.video_url) {
    const backup = outPath.replace(/\.mp4$/i, '.no-captions.mp4');
    if (fs.existsSync(outPath) && !fs.existsSync(backup)) {
      fs.copyFileSync(outPath, backup);
      console.log(`  backup → ${path.basename(backup)}`);
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  console.log(`  downloading ${data.video_url_caption ? 'captioned' : 'standard'} MP4...`);
  curlDownload(mp4Url, outPath, 1800);

  if (data.caption_url) {
    console.log('  downloading SRT...');
    curlDownload(data.caption_url, srtPath, 300);
  }

  entry.videoUrl = data.video_url || entry.videoUrl;
  entry.videoUrlCaption = data.video_url_caption || null;
  entry.captionUrl = data.caption_url || null;
  entry.srtFile = data.caption_url ? path.basename(srtPath) : null;
  entry.burnedInCaptions = Boolean(data.video_url_caption);
  entry.captionsFetchedAt = new Date().toISOString();

  const mb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
  console.log(`  done → ${entry.outputFile} (${mb} MB)`);
  return 'updated';
}

function main() {
  const opts = parseArgs(process.argv);
  const apiKey = loadApiKey();
  const manifest = loadManifest();
  const keys = Object.keys(manifest.jobs).filter((k) => !opts.only || k === opts.only);

  let updated = 0;
  let skipped = 0;

  for (const key of keys) {
    try {
      const result = fetchCaptionsForJob(apiKey, key, manifest.jobs[key], opts);
      if (result === 'updated') updated++;
      else skipped++;
    } catch (err) {
      console.error(`[error] ${key}: ${err.message}`);
    }
  }

  saveManifest(manifest);
  console.log(`\nUpdated: ${updated}, skipped: ${skipped}`);
}

main();
