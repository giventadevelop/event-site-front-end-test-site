#!/usr/bin/env node
/**
 * Hierarchical MOSC downloads mirror:
 * - Traverses https://mosc.in/downloads/ and nested /downloads/... pages
 * - Extracts direct file links from primary content area
 * - Stores files under folders derived from page hierarchy + nearby labels
 *
 * Usage:
 *   node scripts/mosc-in-migration/mirror-downloads-tree.mjs --dry-run
 *   node scripts/mosc-in-migration/mirror-downloads-tree.mjs --ignore-robots --skip-existing
 */
import { mkdir, stat, writeFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import { DEFAULT_DOWNLOAD_ROOT } from './config.mjs';
import { parseRobotsForAllUserAgents, isPathDisallowedByRobots } from './robots.mjs';

const ORIGIN = 'https://mosc.in';
const START_URL = `${ORIGIN}/downloads/`;
const ROOT_DIR = process.env.MOSC_DOWNLOAD_ROOT || DEFAULT_DOWNLOAD_ROOT;
const OUTPUT_ROOT = path.join(ROOT_DIR, 'mosc-in-downloads-by-title');
const USER_AGENT = 'MOSC-MigrationScript/1.0 (hierarchical mirror)';
const DELAY_MS = 1200;

const EXT_RE = /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|jpg|jpeg|png|gif|webp)(\?|$)/i;
const DOWNLOAD_PATH_RE = /^\/downloads\/?[^?#]*$/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    ignoreRobots: argv.includes('--ignore-robots'),
    skipExisting: argv.includes('--skip-existing'),
  };
}

function htmlDecode(text) {
  const base = String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
  return base
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([a-f0-9]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function stripTags(text) {
  return htmlDecode(String(text || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function toSafeSegment(segment) {
  const cleaned = String(segment || '')
    .normalize('NFKD')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '');
  return cleaned || 'untitled';
}

function pickMeaningfulLabel(...labels) {
  for (const raw of labels) {
    const val = toSafeSegment(raw);
    if (!val) continue;
    if (/^downloads?\b[\s._-]*$/i.test(val)) continue;
    if (/^view$/i.test(val)) continue;
    return val;
  }
  return 'untitled';
}

function compactSegments(segments) {
  const out = [];
  for (const s of segments.map(toSafeSegment)) {
    if (!s) continue;
    const prev = out[out.length - 1];
    if (prev && prev.toLowerCase() === s.toLowerCase()) continue;
    out.push(s);
  }
  return out;
}

function fileNameFromUrl(url) {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop() || 'file.bin';
    return decodeURIComponent(last);
  } catch {
    return 'file.bin';
  }
}

function isDownloadsSubpage(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith('mosc.in') &&
      DOWNLOAD_PATH_RE.test(u.pathname) &&
      u.pathname.length > '/downloads/'.length &&
      !/\.(css|js|json|xml)$/i.test(u.pathname)
    );
  } catch {
    return false;
  }
}

function isDirectFileUrl(url) {
  return EXT_RE.test(url);
}

function resolveInternalUrl(rawHref, baseUrl) {
  try {
    const u = new URL(rawHref, baseUrl);
    if (!u.hostname.endsWith('mosc.in')) return null;
    u.hash = '';
    return u.href;
  } catch {
    return null;
  }
}

function pickPrimaryContent(html) {
  // Prefer WordPress content wrapper; fallback to article/body.
  const candidates = [
    /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<article[\s\S]*?>([\s\S]*?)<\/article>/i,
    /<body[\s\S]*?>([\s\S]*?)<\/body>/i,
  ];
  for (const re of candidates) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return html;
}

function extractPageTitle(html, currentUrl) {
  const titleCandidates =
    currentUrl === START_URL
      ? [/<h1[^>]*>([\s\S]*?)<\/h1>/i, /<h2[^>]*>([\s\S]*?)<\/h2>/i, /<title[^>]*>([\s\S]*?)<\/title>/i]
      : [/<h3[^>]*>([\s\S]*?)<\/h3>/i, /<h1[^>]*>([\s\S]*?)<\/h1>/i, /<h2[^>]*>([\s\S]*?)<\/h2>/i, /<title[^>]*>([\s\S]*?)<\/title>/i];
  for (const re of titleCandidates) {
    const m = html.match(re);
    const text = stripTags(m?.[1] || '');
    if (text) return text.replace(/\s*\|\s*Malankara Orthodox Syrian Church.*$/i, '').trim();
  }
  return 'Downloads';
}

function extractLinksWithContext(html, baseUrl) {
  const content = pickPrimaryContent(html);
  const tokenRe = /<(h1|h2|h3|h4|h5|h6)\b[^>]*>([\s\S]*?)<\/\1>|<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  let currentHeading = '';
  /** @type {Array<{href: string; text: string; heading: string}>} */
  const out = [];
  while ((match = tokenRe.exec(content)) !== null) {
    if (match[1]) {
      const headingText = stripTags(match[2]);
      if (headingText) currentHeading = headingText;
      continue;
    }
    const hrefRaw = match[3];
    const text = stripTags(match[4]);
    const href = resolveInternalUrl(hrefRaw, baseUrl);
    if (!href) continue;
    out.push({ href, text, heading: currentHeading });
  }
  return out;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchRobotsDisallowPrefixes() {
  const robotsUrl = `${ORIGIN}/robots.txt`;
  const rr = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!rr.ok) return [];
  const txt = await rr.text();
  await mkdir(OUTPUT_ROOT, { recursive: true });
  await writeFile(path.join(OUTPUT_ROOT, '_robots_snapshot.txt'), txt, 'utf8');
  return parseRobotsForAllUserAgents(txt).disallowPrefixes;
}

async function downloadTo(destPath, url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: '*/*' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error('empty body');
  await mkdir(path.dirname(destPath), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

async function main() {
  const args = parseArgs(process.argv);
  await mkdir(OUTPUT_ROOT, { recursive: true });

  let disallowPrefixes = [];
  if (!args.ignoreRobots) {
    try {
      disallowPrefixes = await fetchRobotsDisallowPrefixes();
      console.log(`robots.txt loaded with ${disallowPrefixes.length} disallow rule(s).`);
    } catch (e) {
      console.warn(`robots.txt unavailable: ${e.message}`);
    }
  }

  /** @type {Array<{url: string; trail: string[]}>} */
  const queue = [{ url: START_URL, trail: [] }];
  const seenPages = new Set();
  const seenFiles = new Set();
  const logs = [];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const { url, trail } = next;
    if (seenPages.has(url)) continue;
    seenPages.add(url);

    console.log(`PAGE: ${url}`);
    let html;
    try {
      const pr = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      html = await pr.text();
    } catch (e) {
      console.error(`  PAGE ERROR: ${e.message}`);
      logs.push({ type: 'page', ok: false, url, error: e.message });
      continue;
    }

    const pageTitle = toSafeSegment(extractPageTitle(html, url));
    const links = extractLinksWithContext(html, url);
    const fileItems = links.filter((l) => isDirectFileUrl(l.href));
    const pageItems = links.filter((l) => isDownloadsSubpage(l.href));

    // Download files in this page context.
    for (const item of fileItems) {
      if (seenFiles.has(item.href)) continue;
      seenFiles.add(item.href);

      const leafLabel = pickMeaningfulLabel(item.text, item.heading, pageTitle, 'file');
      const baseName = toSafeSegment(fileNameFromUrl(item.href));
      const relDir = path.join(...compactSegments([...trail, pageTitle, leafLabel]));
      const destPath = path.join(OUTPUT_ROOT, relDir, baseName);

      if (!args.ignoreRobots && disallowPrefixes.length) {
        const pathname = new URL(item.href).pathname;
        if (isPathDisallowedByRobots(pathname, disallowPrefixes)) {
          console.log(`  SKIP robots: ${item.href}`);
          logs.push({ type: 'file', ok: false, skipped: 'robots', url: item.href, destPath });
          continue;
        }
      }

      if (args.skipExisting && (await exists(destPath))) {
        console.log(`  SKIP exists: ${destPath}`);
        logs.push({ type: 'file', ok: true, skipped: 'exists', url: item.href, destPath });
        continue;
      }

      if (args.dryRun) {
        console.log(`  DRY: ${item.href} -> ${destPath}`);
        logs.push({ type: 'file', ok: true, dryRun: true, url: item.href, destPath });
      } else {
        try {
          await downloadTo(destPath, item.href);
          console.log(`  SAVED: ${destPath}`);
          logs.push({ type: 'file', ok: true, url: item.href, destPath });
        } catch (e) {
          console.error(`  FILE ERROR: ${e.message}`);
          logs.push({ type: 'file', ok: false, url: item.href, destPath, error: e.message });
        }
      }
      await sleep(DELAY_MS);
    }

    // Queue subpages with hierarchy path.
    for (const p of pageItems) {
      if (seenPages.has(p.href)) continue;
      const childLabel = pickMeaningfulLabel(p.text, p.heading, 'subpage');
      const childTrail = [...trail, pageTitle, childLabel];
      queue.push({ url: p.href, trail: childTrail });
    }

    await sleep(DELAY_MS);
  }

  const reportPath = path.join(OUTPUT_ROOT, `_mirror-report-${Date.now()}.json`);
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        root: OUTPUT_ROOT,
        startUrl: START_URL,
        pagesVisited: seenPages.size,
        filesSeen: seenFiles.size,
        args,
        logs,
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`\nDone. Report: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

