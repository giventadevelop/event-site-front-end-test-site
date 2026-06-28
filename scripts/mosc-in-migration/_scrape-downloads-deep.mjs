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
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  extractFileLinksFromHtml,
  extractDownloadsSubpageLinks,
  filenameFromUrl,
  hierarchyPathFromLabel,
  yearFromUploadUrl,
} from './lib/legacy-downloads-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORIGIN = 'https://mosc.in';
const START = `${ORIGIN}/downloads/`;
const DELAY_MS = 1500;
const UA = 'MOSC-MigrationScript/1.0 (deep url-list generator)';
const MAP_PATH = path.join(__dirname, 'legacy-page-category-map.json');
const MALANKARA_MAP_PATH = path.join(__dirname, 'malankara-category-map.json');

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

function pageFolderFromSubpageUrl(u) {
  try {
    const parts = new URL(u).pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('downloads');
    return idx >= 0 ? parts[idx + 1] : parts[parts.length - 1];
  } catch {
    return null;
  }
}

async function loadCategoryMaps() {
  const folderOverrides = {};
  const malankaraPages = {};
  try {
    const mapRaw = JSON.parse(await readFile(MAP_PATH, 'utf8'));
    Object.assign(folderOverrides, mapRaw.folderOverrides || {});
    Object.assign(folderOverrides, mapRaw.livePages || {});
  } catch {
    /* optional */
  }
  try {
    const malRaw = JSON.parse(await readFile(MALANKARA_MAP_PATH, 'utf8'));
    Object.assign(malankaraPages, malRaw.pages || {});
  } catch {
    /* optional */
  }
  return { folderOverrides, malankaraPages };
}

function resolveCategoryForSubpage(subpageUrl, { folderOverrides, malankaraPages }) {
  const folder = pageFolderFromSubpageUrl(subpageUrl);
  if (!folder) {
    return { categorySlug: 'mosc-in-downloads', displayName: 'Downloads', year: null };
  }
  if (malankaraPages[folder]) {
    const cfg = malankaraPages[folder];
    return {
      categorySlug: cfg.categorySlug,
      displayName: cfg.displayName,
      year: cfg.electionYear ?? null,
    };
  }
  const override = folderOverrides[folder];
  if (override?.categorySlug) {
    return {
      categorySlug: override.categorySlug,
      displayName: override.displayName || folder,
      year: override.year ?? override.electionYear ?? null,
    };
  }
  return { categorySlug: folder, displayName: folder.replace(/-/g, ' '), year: null };
}

const writeUrlList = process.argv.includes('--write-url-list');
const maps = await loadCategoryMaps();
const { folderOverrides, malankaraPages } = maps;

const res = await fetch(START, { headers: { 'User-Agent': UA } });
const indexHtml = await res.text();
const fromIndex = extractHrefs(indexHtml, START);
const subpages = fromIndex.filter(isDownloadsSubpage);
const uniqueSub = [...new Set(subpages)].sort();

/** @type {Map<string, object>} */
const itemsByUrl = new Map();

function addItem(url, subpageUrl, label) {
  const cfg = resolveCategoryForSubpage(subpageUrl, { folderOverrides, malankaraPages });
  const filename = filenameFromUrl(url);
  itemsByUrl.set(url, {
    url,
    categorySlug: cfg.categorySlug,
    year: cfg.year ?? yearFromUploadUrl(url),
    filename,
    hierarchyPath: hierarchyPathFromLabel(label, filename),
    sourcePage: pageFolderFromSubpageUrl(subpageUrl),
    displayName: cfg.displayName,
  });
}

for (const u of fromIndex) {
  if (isDirectFile(u)) addItem(u, START, null);
}

console.error(`Subpages to fetch: ${uniqueSub.length}`);
for (let i = 0; i < uniqueSub.length; i++) {
  const u = uniqueSub[i];
  try {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    const h = await r.text();
    const fileLinks = extractFileLinksFromHtml(h, u);
    for (const link of fileLinks) {
      addItem(link.url, u, link.label);
    }
    for (const nested of extractDownloadsSubpageLinks(h, u)) {
      if (!uniqueSub.includes(nested) && isDownloadsSubpage(nested)) {
        try {
          const nr = await fetch(nested, { headers: { 'User-Agent': UA } });
          const nh = await nr.text();
          const nestedLinks = extractFileLinksFromHtml(nh, nested);
          for (const link of nestedLinks) {
            addItem(link.url, nested, link.label);
          }
        } catch (e) {
          console.error(`FAIL nested ${nested}`, e.message);
        }
        await sleep(DELAY_MS);
      }
    }
    for (const x of extractHrefs(h, u)) {
      if (isDirectFile(x)) addItem(x, u, null);
    }
  } catch (e) {
    console.error(`FAIL ${u}`, e.message);
  }
  if (i < uniqueSub.length - 1) await sleep(DELAY_MS);
}

const sorted = [...itemsByUrl.values()].sort((a, b) => a.url.localeCompare(b.url));

const manifest = {
  _comment:
    'Generated from https://mosc.in/downloads/ subpages with per-page category slugs. For fetch-urls.mjs use: node scripts/mosc-in-migration/fetch-urls.mjs --manifest <this-file> --ignore-robots',
  delayMs: DELAY_MS,
  userAgent: UA,
  siteOrigin: ORIGIN,
  fetchRobotsTxt: true,
  items: sorted,
};

if (writeUrlList) {
  const outPath = path.join(__dirname, 'url-list.mosc-in.generated.json');
  await writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.error(`Wrote ${manifest.items.length} items to ${outPath}`);
}

console.log(JSON.stringify({ directFilesFound: sorted.length, urls: sorted.map((x) => x.url) }, null, 2));
