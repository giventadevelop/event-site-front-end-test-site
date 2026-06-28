#!/usr/bin/env node
/**
 * Extract category cover image URLs from legacy downloads index + subpages.
 * Writes downloads-category-covers.json (merged with existing malankara covers).
 *
 * Usage:
 *   node scripts/mosc-in-migration/build-category-covers-from-legacy.mjs
 *   node scripts/mosc-in-migration/build-category-covers-from-legacy.mjs --write
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ORIGIN,
  extractPageHeroImage,
  readHtmlFile,
  stripTags,
  toAbsoluteUrl,
} from './lib/legacy-downloads-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const LEGACY_ROOT = path.join(REPO_ROOT, 'code_clone_ref/mosc_in/downloads');
const INDEX_PATH = path.join(LEGACY_ROOT, 'index.html');
const MAP_PATH = path.join(__dirname, 'legacy-page-category-map.json');
const MALANKARA_MAP_PATH = path.join(__dirname, 'malankara-category-map.json');
const EXISTING_COVERS = path.join(__dirname, 'malankara-category-covers.json');
const OUT_PATH = path.join(__dirname, 'downloads-category-covers.json');

function parseArgs(argv) {
  return { write: argv.includes('--write') };
}

function slugFromHref(href) {
  try {
    const u = new URL(href, `${ORIGIN}/downloads/`);
    const parts = u.pathname.replace(/\/index\.html$/, '').split('/').filter(Boolean);
    const idx = parts.indexOf('downloads');
    const folder = idx >= 0 ? parts[idx + 1] : parts[parts.length - 1];
    return folder || null;
  } catch {
    return null;
  }
}

function resolveCategorySlug(folder, mapData) {
  if (!folder) return null;
  const override = mapData.folderOverrides?.[folder];
  if (override?.categorySlug) return override.categorySlug;
  const malankara = mapData.malankaraPages?.[folder];
  if (malankara?.categorySlug) return malankara.categorySlug;
  return folder;
}

async function loadMalankaraPages() {
  try {
    const raw = JSON.parse(await readFile(MALANKARA_MAP_PATH, 'utf8'));
    return raw.pages || {};
  } catch {
    return {};
  }
}

function extractIndexCovers(html) {
  const covers = new Map();
  const boxRe =
    /<div class="col-md-4 col-sm-4">\s*<div class="cnt-box">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let boxMatch;
  while ((boxMatch = boxRe.exec(html)) !== null) {
    const block = boxMatch[1];
    const imgMatch = block.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    const titleMatch = block.match(/<h2>\s*([\s\S]*?)\s*<\/h2>/i);
    const hrefMatch = block.match(/<a\b[^>]*\bclass=["']more["'][^>]*\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const folder = slugFromHref(hrefMatch[1]);
    if (!folder) continue;
    const coverUrl = imgMatch ? toAbsoluteUrl(imgMatch[1], `${ORIGIN}/downloads/`) : null;
    const displayName = titleMatch ? stripTags(titleMatch[1]) : folder;
    covers.set(folder, { coverUrl, displayName, source: 'index-card' });
  }
  return covers;
}

async function main() {
  const args = parseArgs(process.argv);
  const mapRaw = JSON.parse(await readFile(MAP_PATH, 'utf8'));
  const malankaraPages = await loadMalankaraPages();
  mapRaw.malankaraPages = malankaraPages;

  const out = {};
  try {
    const existing = JSON.parse(await readFile(EXISTING_COVERS, 'utf8'));
    for (const [slug, entry] of Object.entries(existing)) {
      if (slug.startsWith('_')) continue;
      out[slug] = { ...entry };
    }
  } catch {
    /* no existing */
  }

  const indexHtml = await readFile(INDEX_PATH, 'utf8');
  const indexCovers = extractIndexCovers(indexHtml);

  for (const [folder, meta] of indexCovers) {
    const slug = resolveCategorySlug(folder, mapRaw);
    if (!slug || !meta.coverUrl) continue;
    if (!out[slug]?.coverUrl) {
      out[slug] = {
        coverUrl: meta.coverUrl,
        displayName: meta.displayName,
        source: meta.source,
      };
    }
  }

  const dirs = await readdir(LEGACY_ROOT, { withFileTypes: true });
  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    const pageDir = dirent.name;
    const read = await readHtmlFile(LEGACY_ROOT, pageDir);
    if (!read) continue;
    const pageUrl = `${ORIGIN}/downloads/${pageDir}/index.html`;
    const hero = extractPageHeroImage(read.html, pageUrl);
    if (!hero) continue;
    const slug = resolveCategorySlug(pageDir, mapRaw);
    if (!slug) continue;
    if (!out[slug]?.coverUrl) {
      out[slug] = { coverUrl: hero, displayName: pageDir, source: 'subpage-hero' };
    }
  }

  out._comment =
    'Category cover images from legacy mosc.in downloads index cards and subpage heroes. Used for card thumbnails and year-bundle covers.';

  console.log(`Cover entries: ${Object.keys(out).filter((k) => !k.startsWith('_')).length}`);
  for (const [slug, entry] of Object.entries(out).sort()) {
    if (slug.startsWith('_')) continue;
    console.log(`  ${slug}: ${entry.coverUrl?.slice(0, 80)}...`);
  }

  if (args.write) {
    await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
    console.log(`\nWrote ${OUT_PATH}`);
  } else {
    console.log('\nDry run — pass --write to create downloads-category-covers.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
