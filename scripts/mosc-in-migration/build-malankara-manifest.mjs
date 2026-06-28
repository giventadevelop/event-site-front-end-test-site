#!/usr/bin/env node
/**
 * Build Malankara Association manifest from local legacy HTML mirrors.
 * Maps each file URL to the correct official-document category slug + election year.
 *
 * Usage:
 *   node scripts/mosc-in-migration/build-malankara-manifest.mjs
 *   node scripts/mosc-in-migration/build-malankara-manifest.mjs --write
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ORIGIN,
  extractFileLinksFromHtml,
  filenameFromUrl,
  hierarchyPathFromLabel,
  pageUrlFromLegacyPath,
  readHtmlFile,
} from './lib/legacy-downloads-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const LEGACY_ROOT = path.join(REPO_ROOT, 'code_clone_ref/mosc_in/downloads');
const MAP_PATH = path.join(__dirname, 'malankara-category-map.json');
const LEGACY_MAP_PATH = path.join(__dirname, 'legacy-page-category-map.json');
const OUT_PATH = path.join(__dirname, 'url-list.malankara-remapped.json');
const UA = 'MOSC-MigrationScript/1.0 (malankara manifest)';

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
    fetchLive: argv.includes('--fetch-live'),
  };
}

function disambiguateHierarchyPath(hierarchyPath, categorySlug, seenInCategory) {
  const key = `${categorySlug}::${hierarchyPath.toLowerCase()}`;
  const count = seenInCategory.get(key) || 0;
  seenInCategory.set(key, count + 1);
  if (count === 0) return hierarchyPath;
  return `${hierarchyPath} (${count + 1})`;
}

async function fetchLiveHtml(livePath) {
  const url = `${ORIGIN}${livePath}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Live fetch failed ${res.status} ${url}`);
  return res.text();
}

async function main() {
  const args = parseArgs(process.argv);
  const mapRaw = JSON.parse(await readFile(MAP_PATH, 'utf8'));
  const pageMap = mapRaw.pages || {};
  let livePages = {};
  try {
    const legacyMap = JSON.parse(await readFile(LEGACY_MAP_PATH, 'utf8'));
    livePages = legacyMap.livePages || {};
  } catch {
    /* optional */
  }

  const byUrl = new Map();
  const seenInCategory = new Map();

  const pageSources = { ...pageMap };
  if (args.fetchLive) {
    for (const [key, cfg] of Object.entries(livePages)) {
      if (!cfg.categorySlug?.includes('malankara')) continue;
      pageSources[key] = {
        categorySlug: cfg.categorySlug,
        electionYear: cfg.electionYear ?? 2026,
        displayName: cfg.displayName,
        livePath: cfg.livePath,
      };
    }
  }

  for (const pageDir of Object.keys(pageSources)) {
    const cfg = pageSources[pageDir];
    let html;
    let pageUrl;
    if (cfg.livePath && args.fetchLive) {
      try {
        html = await fetchLiveHtml(cfg.livePath);
        pageUrl = `${ORIGIN}${cfg.livePath}`;
        console.log(`${pageDir}: fetched live HTML`);
      } catch (err) {
        console.warn(`[skip-live] ${pageDir}: ${String(err)}`);
        continue;
      }
    } else {
      const read = await readHtmlFile(LEGACY_ROOT, pageDir);
      if (!read) {
        console.warn(`[skip] Missing HTML: ${pageDir}`);
        continue;
      }
      html = read.html;
      pageUrl = pageUrlFromLegacyPath(LEGACY_ROOT, read.htmlPath);
    }

    const links = extractFileLinksFromHtml(html, pageUrl);
    console.log(`${pageDir}: ${links.length} file link(s)`);

    for (const link of links) {
      const filename = filenameFromUrl(link.url);
      let hierarchyPath = hierarchyPathFromLabel(link.label, filename);
      hierarchyPath = disambiguateHierarchyPath(hierarchyPath, cfg.categorySlug, seenInCategory);
      const item = {
        url: link.url,
        categorySlug: cfg.categorySlug,
        year: cfg.electionYear,
        filename,
        hierarchyPath,
        sourcePage: pageDir,
        displayName: cfg.displayName,
      };

      const existing = byUrl.get(link.url);
      if (!existing) {
        byUrl.set(link.url, item);
        continue;
      }
      // Prefer malankara-association-2022 over generic pages when duplicate URLs appear
      if (pageDir === 'malankara-association-2022') {
        byUrl.set(link.url, item);
      }
    }
  }

  const items = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
  const manifest = {
    _comment:
      'Malankara Association only — remapped from code_clone_ref legacy HTML. Use with fetch-urls.mjs and upload-manifest-to-official-docs.mjs.',
    delayMs: 1500,
    userAgent: 'MOSC-MigrationScript/1.0 (malankara manifest)',
    siteOrigin: ORIGIN,
    fetchRobotsTxt: true,
    items,
  };

  console.log(`\nTotal unique Malankara file URLs: ${items.length}`);
  const byCategory = new Map();
  for (const item of items) {
    const key = item.categorySlug;
    byCategory.set(key, (byCategory.get(key) || 0) + 1);
  }
  for (const [slug, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${slug}: ${count}`);
  }

  if (args.write) {
    await writeFile(OUT_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\nWrote ${OUT_PATH}`);
  } else {
    console.log('\nDry run — pass --write to create url-list.malankara-remapped.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
