/**
 * Fetch https://mosc.in/downloads/ then each subsection page; collect file URLs (pdf, zip, images, etc.).
 * Rate-limited (DELAY_MS between subpage requests).
 *
 * Usage:
 *   node scripts/mosc-in-migration/_scrape-downloads-deep.mjs
 *   node scripts/mosc-in-migration/_scrape-downloads-deep.mjs --write-url-list
 *
 * --write-url-list writes url-list.mosc-in.generated.json (fetch-urls.mjs format).
 */
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORIGIN = 'https://mosc.in';
const START = `${ORIGIN}/downloads/`;
const DELAY_MS = 1500;
const UA = 'MOSC-MigrationScript/1.0 (deep url-list generator)';
/** Default official-document category slug for bulk upload (adjust in DB/UI to match). */
const DEFAULT_CATEGORY_SLUG = 'mosc-in-downloads';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractHrefs(html, base) {
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const out = new Set();
  for (const h of hrefs) {
    try {
      const u = new URL(h, base);
      if (u.hostname.endsWith('mosc.in')) out.add(u.href.split('#')[0]);
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

function isDirectFile(u) {
  return /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|jpg|jpeg|png|gif|webp)(\?|$)/i.test(u);
}

function isDownloadsSubpage(u) {
  try {
    const x = new URL(u);
    return (
      x.hostname.endsWith('mosc.in') &&
      x.pathname.startsWith('/downloads/') &&
      x.pathname.length > '/downloads/'.length &&
      !/\.(css|js|xml|json)$/i.test(u) &&
      !u.includes('/vendor/') &&
      !u.includes('/wp-includes/')
    );
  } catch {
    return false;
  }
}

function yearFromUploadUrl(u) {
  const m = u.match(/\/uploads\/(\d{4})\//);
  if (m) return parseInt(m[1], 10);
  return new Date().getFullYear();
}

function filenameFromUrl(u) {
  const seg = new URL(u).pathname.split('/').filter(Boolean).pop() || 'file.bin';
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

const writeUrlList = process.argv.includes('--write-url-list');

const res = await fetch(START, { headers: { 'User-Agent': UA } });
const indexHtml = await res.text();
const fromIndex = extractHrefs(indexHtml, START);
const subpages = fromIndex.filter(isDownloadsSubpage);
const uniqueSub = [...new Set(subpages)].sort();

const fileUrls = new Set();
for (const u of fromIndex) {
  if (isDirectFile(u)) fileUrls.add(u);
}

console.error(`Subpages to fetch: ${uniqueSub.length}`);
for (let i = 0; i < uniqueSub.length; i++) {
  const u = uniqueSub[i];
  try {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    const h = await r.text();
    for (const x of extractHrefs(h, u)) {
      if (isDirectFile(x)) fileUrls.add(x);
    }
  } catch (e) {
    console.error(`FAIL ${u}`, e.message);
  }
  if (i < uniqueSub.length - 1) await sleep(DELAY_MS);
}

const sorted = [...fileUrls].sort();

const manifest = {
  _comment:
    'Generated from https://mosc.in/downloads/ subpages. Respect copyright and MOSC terms. For fetch-urls.mjs use: node scripts/mosc-in-migration/fetch-urls.mjs --manifest <this-file> --ignore-robots (only if needed; remove for production).',
  delayMs: DELAY_MS,
  userAgent: UA,
  siteOrigin: ORIGIN,
  fetchRobotsTxt: true,
  items: sorted.map((url) => ({
    url,
    categorySlug: DEFAULT_CATEGORY_SLUG,
    year: yearFromUploadUrl(url),
    filename: filenameFromUrl(url),
  })),
};

if (writeUrlList) {
  const outPath = path.join(__dirname, 'url-list.mosc-in.generated.json');
  await writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.error(`Wrote ${manifest.items.length} items to ${outPath}`);
}

console.log(JSON.stringify({ directFilesFound: sorted.length, urls: sorted }, null, 2));
