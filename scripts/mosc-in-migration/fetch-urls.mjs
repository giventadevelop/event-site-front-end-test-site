#!/usr/bin/env node
/**
 * One-off migration: download explicitly listed URLs only (no crawling).
 * Respects delay between requests, optional robots.txt rules for User-agent: *,
 * and streams files to MOSC_DOWNLOAD_ROOT / categorySlug / year / filename.
 *
 * Usage:
 *   node scripts/mosc-in-migration/fetch-urls.mjs --manifest ./url-list.json
 *   MOSC_DOWNLOAD_ROOT=D:\\custom node scripts/mosc-in-migration/fetch-urls.mjs --manifest ./url-list.json
 *   node scripts/mosc-in-migration/fetch-urls.mjs --manifest ./url-list.json --dry-run
 */

import { mkdir, writeFile, stat } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseRobotsForAllUserAgents, isPathDisallowedByRobots } from './robots.mjs';
import { DEFAULT_DOWNLOAD_ROOT, DEFAULT_DELAY_MS, DEFAULT_USER_AGENT } from './config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const out = { manifest: null, dryRun: false, skipExisting: false, forceRobots: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--manifest' && argv[i + 1]) {
      out.manifest = argv[++i];
    } else if (argv[i] === '--dry-run') {
      out.dryRun = true;
    } else if (argv[i] === '--skip-existing') {
      out.skipExisting = true;
    } else if (argv[i] === '--ignore-robots') {
      out.forceRobots = true;
    }
  }
  return out;
}

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.manifest) {
    console.error('Usage: node fetch-urls.mjs --manifest <path-to-url-list.json> [--dry-run] [--skip-existing] [--ignore-robots]');
    process.exit(1);
  }

  const manifestPath = path.isAbsolute(args.manifest) ? args.manifest : path.resolve(process.cwd(), args.manifest);
  const raw = await import('fs/promises').then((fs) => fs.readFile(manifestPath, 'utf8'));
  /** @type {any} */
  const manifest = JSON.parse(raw);

  const root = process.env.MOSC_DOWNLOAD_ROOT || DEFAULT_DOWNLOAD_ROOT;
  const delayMs = typeof manifest.delayMs === 'number' ? manifest.delayMs : DEFAULT_DELAY_MS;
  const userAgent = manifest.userAgent || DEFAULT_USER_AGENT;
  const siteOrigin = manifest.siteOrigin || 'https://mosc.in';
  const fetchRobots = manifest.fetchRobotsTxt !== false;

  await mkdir(root, { recursive: true });

  let disallowPrefixes = [];
  if (fetchRobots && !args.forceRobots) {
    const robotsUrl = new URL('/robots.txt', siteOrigin).href;
    console.log(`Fetching ${robotsUrl}`);
    try {
      const rr = await fetch(robotsUrl, { headers: { 'User-Agent': userAgent } });
      if (rr.ok) {
        const text = await rr.text();
        await writeFile(path.join(root, '_robots_snapshot.txt'), text, 'utf8');
        const parsed = parseRobotsForAllUserAgents(text);
        disallowPrefixes = parsed.disallowPrefixes;
        console.log(`robots.txt: ${disallowPrefixes.length} Disallow rule(s) for User-agent *`);
        disallowPrefixes.forEach((d) => console.log(`  Disallow: ${d}`));
      } else {
        console.warn(`robots.txt returned ${rr.status} — proceeding without path blocks`);
      }
    } catch (e) {
      console.warn('Could not fetch robots.txt:', e.message);
    }
  }

  const items = Array.isArray(manifest.items) ? manifest.items : [];
  if (items.length === 0) {
    console.error('No items in manifest.');
    process.exit(1);
  }

  const log = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const urlStr = item.url;
    if (!urlStr || typeof urlStr !== 'string') {
      log.push({ index: i, ok: false, error: 'missing url' });
      continue;
    }

    let u;
    try {
      u = new URL(urlStr);
    } catch {
      log.push({ index: i, ok: false, error: 'invalid url' });
      continue;
    }

    if (!args.forceRobots && disallowPrefixes.length && isPathDisallowedByRobots(u.pathname, disallowPrefixes)) {
      console.warn(`SKIP (robots): ${urlStr}`);
      log.push({ index: i, ok: false, skipped: 'robots', url: urlStr });
      if (i < items.length - 1) await sleep(delayMs);
      continue;
    }

    const categorySlug = String(item.categorySlug || 'uncategorized').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const year = Number(item.year) || new Date().getFullYear();
    const baseName =
      item.filename ||
      path.basename(u.pathname) ||
      `download-${i}.bin`;

    const dir = path.join(root, categorySlug, String(year));
    const destPath = path.join(dir, baseName);

    if (args.skipExisting && (await fileExists(destPath))) {
      console.log(`SKIP (exists): ${destPath}`);
      log.push({ index: i, ok: true, skipped: 'exists', dest: destPath });
      if (i < items.length - 1) await sleep(delayMs);
      continue;
    }

    if (args.dryRun) {
      console.log(`DRY-RUN would download:\n  ${urlStr}\n  -> ${destPath}`);
      log.push({ index: i, ok: true, dryRun: true, dest: destPath });
      if (i < items.length - 1) await sleep(delayMs);
      continue;
    }

    await mkdir(dir, { recursive: true });
    console.log(`[${i + 1}/${items.length}] GET ${urlStr}`);

    try {
      const res = await fetch(urlStr, {
        headers: { 'User-Agent': userAgent, Accept: '*/*' },
        redirect: 'follow',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.body) throw new Error('empty body');
      const nodeReadable = Readable.fromWeb(res.body);
      await pipeline(nodeReadable, createWriteStream(destPath));
      console.log(`  saved ${destPath}`);
      log.push({ index: i, ok: true, url: urlStr, dest: destPath });
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      log.push({ index: i, ok: false, url: urlStr, error: String(e.message) });
    }

    if (i < items.length - 1) await sleep(delayMs);
  }

  const reportPath = path.join(root, `_fetch-report-${Date.now()}.json`);
  await writeFile(reportPath, JSON.stringify({ root, manifest: manifestPath, log }, null, 2), 'utf8');
  console.log(`\nReport written: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
