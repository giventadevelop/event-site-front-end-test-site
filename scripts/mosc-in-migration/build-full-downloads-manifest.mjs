#!/usr/bin/env node
/**
 * Build a complete downloads manifest from local legacy HTML mirrors + optional live pages.
 * Correct category slugs, hierarchyPath from anchor labels, nested subpage links (one hop).
 *
 * Usage:
 *   node scripts/mosc-in-migration/build-full-downloads-manifest.mjs
 *   node scripts/mosc-in-migration/build-full-downloads-manifest.mjs --write
 *   node scripts/mosc-in-migration/build-full-downloads-manifest.mjs --write --fetch-live
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ORIGIN,
  extractDownloadsSubpageLinks,
  extractFileLinksFromHtml,
  extractPageTitle,
  hierarchyPathFromLabel,
  pageUrlFromLegacyPath,
  readHtmlFile,
  yearFromUploadUrl,
  filenameFromUrl,
} from './lib/legacy-downloads-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const LEGACY_ROOT = path.join(REPO_ROOT, 'code_clone_ref/mosc_in/downloads');
const MAP_PATH = path.join(__dirname, 'legacy-page-category-map.json');
const MALANKARA_MAP_PATH = path.join(__dirname, 'malankara-category-map.json');
const OUT_PATH = path.join(__dirname, 'url-list.full-remapped.json');
const UA = 'MOSC-MigrationScript/1.0 (full downloads manifest)';

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
    fetchLive: argv.includes('--fetch-live'),
  };
}

function resolvePageConfig(pageDir, folderOverrides, malankaraPages) {
  if (malankaraPages[pageDir]) {
    const cfg = malankaraPages[pageDir];
    return {
      categorySlug: cfg.categorySlug,
      displayName: cfg.displayName,
      year: cfg.electionYear,
    };
  }
  if (folderOverrides[pageDir]) {
    const cfg = folderOverrides[pageDir];
    return {
      categorySlug: cfg.categorySlug,
      displayName: cfg.displayName,
      year: cfg.year ?? null,
    };
  }
  return {
    categorySlug: pageDir,
    displayName: pageDir.replace(/-/g, ' '),
    year: null,
  };
}

function disambiguateHierarchyPath(hierarchyPath, categorySlug, seenInCategory) {
  const key = `${categorySlug}::${hierarchyPath.toLowerCase()}`;
  const count = seenInCategory.get(key) || 0;
  seenInCategory.set(key, count + 1);
  if (count === 0) return hierarchyPath;
  return `${hierarchyPath} (${count + 1})`;
}

async function collectFromHtml(html, pageDir, pageConfig, byUrl, seenInCategory, nestedSubpages, htmlPath) {
  const pageUrl = htmlPath
    ? pageUrlFromLegacyPath(LEGACY_ROOT, htmlPath)
    : `${ORIGIN}/downloads/${pageDir}/`;
  const pageTitle = extractPageTitle(html) || pageConfig.displayName;
  const links = extractFileLinksFromHtml(html, pageUrl);

  for (const link of links) {
    const filename = filenameFromUrl(link.url);
    let hierarchyPath = hierarchyPathFromLabel(link.label, filename, null);
    hierarchyPath = disambiguateHierarchyPath(hierarchyPath, pageConfig.categorySlug, seenInCategory);
    const year = pageConfig.year ?? yearFromUploadUrl(link.url);

    const item = {
      url: link.url,
      categorySlug: pageConfig.categorySlug,
      year,
      filename,
      hierarchyPath,
      sourcePage: pageDir,
      displayName: pageConfig.displayName || pageTitle,
    };

    const existing = byUrl.get(link.url);
    if (!existing) {
      byUrl.set(link.url, item);
    } else if (pageDir.includes('malankara-association') && !existing.sourcePage.includes('malankara')) {
      byUrl.set(link.url, item);
    }
  }

  for (const sub of extractDownloadsSubpageLinks(html, pageUrl)) {
    try {
      const u = new URL(sub);
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('downloads');
      const childDir = idx >= 0 ? parts.slice(idx + 1).join('/') : null;
      if (childDir && childDir !== pageDir && !childDir.startsWith(`${pageDir}/`)) {
        nestedSubpages.add(sub);
      }
      if (childDir && childDir.startsWith(`${pageDir}/`)) {
        nestedSubpages.add(sub);
      }
    } catch {
      /* ignore */
    }
  }
}

async function fetchLivePage(livePath) {
  const url = `${ORIGIN}${livePath}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Live fetch failed ${res.status} ${url}`);
  return res.text();
}

async function walkLegacyHtmlFiles(legacyRoot, prefix = '') {
  const entries = await readdir(path.join(legacyRoot, prefix), { withFileTypes: true });
  const htmlFiles = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      htmlFiles.push(...(await walkLegacyHtmlFiles(legacyRoot, rel)));
    } else if (entry.name === 'index.html' || entry.name.endsWith('.html')) {
      htmlFiles.push(rel.replace(/\/index\.html$/, '').replace(/\.html$/, ''));
    }
  }
  return htmlFiles;
}

async function main() {
  const args = parseArgs(process.argv);
  const mapRaw = JSON.parse(await readFile(MAP_PATH, 'utf8'));
  const malankaraRaw = JSON.parse(await readFile(MALANKARA_MAP_PATH, 'utf8'));
  const folderOverrides = mapRaw.folderOverrides || {};
  const malankaraPages = malankaraRaw.pages || {};
  const livePages = mapRaw.livePages || {};

  const byUrl = new Map();
  const seenInCategory = new Map();
  const nestedSubpages = new Set();
  const pageDirs = await walkLegacyHtmlFiles(LEGACY_ROOT);

  for (const pageDir of pageDirs) {
    const read = await readHtmlFile(LEGACY_ROOT, pageDir);
    if (!read) continue;
    const topFolder = pageDir.split('/')[0];
    const pageConfig = resolvePageConfig(topFolder, folderOverrides, malankaraPages);
    await collectFromHtml(read.html, pageDir, pageConfig, byUrl, seenInCategory, nestedSubpages, read.htmlPath);
  }

  if (args.fetchLive) {
    for (const [key, cfg] of Object.entries(livePages)) {
      try {
        const html = await fetchLivePage(cfg.livePath);
        const pageConfig = {
          categorySlug: cfg.categorySlug,
          displayName: cfg.displayName,
          year: cfg.electionYear ?? 2026,
        };
        await collectFromHtml(html, key, pageConfig, byUrl, seenInCategory, nestedSubpages);
        console.log(`[live] ${key}: collected from ${cfg.livePath}`);
      } catch (err) {
        console.warn(`[live-skip] ${key}: ${String(err)}`);
      }
    }
  }

  const items = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
  const manifest = {
    _comment:
      'Full downloads manifest from legacy HTML mirrors with correct category slugs. Use fetch-urls.mjs then upload-manifest-to-official-docs.mjs.',
    delayMs: 1500,
    userAgent: UA,
    siteOrigin: ORIGIN,
    fetchRobotsTxt: true,
    items,
  };

  const byCategory = new Map();
  for (const item of items) {
    byCategory.set(item.categorySlug, (byCategory.get(item.categorySlug) || 0) + 1);
  }

  console.log(`\nTotal unique file URLs: ${items.length}`);
  for (const [slug, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${slug}: ${count}`);
  }

  if (args.write) {
    await writeFile(OUT_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\nWrote ${OUT_PATH}`);
  } else {
    console.log('\nDry run — pass --write to create url-list.full-remapped.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
