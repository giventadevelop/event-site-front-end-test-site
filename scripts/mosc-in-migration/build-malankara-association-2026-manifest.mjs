#!/usr/bin/env node
/**
 * Build a narrow manifest for https://mosc.in/downloads/malankara-association-2026/ only.
 *
 * Usage:
 *   node scripts/mosc-in-migration/build-malankara-association-2026-manifest.mjs
 *   node scripts/mosc-in-migration/build-malankara-association-2026-manifest.mjs --write
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ORIGIN,
  extractFileLinksFromHtml,
  filenameFromUrl,
  hierarchyPathFromLabel,
} from './lib/legacy-downloads-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, 'url-list.malankara-association-2026.json');
const LIVE_PATH = '/downloads/malankara-association-2026/';
const CATEGORY_SLUG = 'malankara-association-2026';
const ELECTION_YEAR = 2026;
const DISPLAY_NAME = 'Malankara Association 2026';
const UA = 'MOSC-MigrationScript/1.0 (malankara-association-2026)';

function parseArgs(argv) {
  return { write: argv.includes('--write') };
}

function disambiguateHierarchyPath(hierarchyPath, seen) {
  const key = hierarchyPath.toLowerCase();
  const count = seen.get(key) || 0;
  seen.set(key, count + 1);
  if (count === 0) return hierarchyPath;
  return `${hierarchyPath} (${count + 1})`;
}

async function main() {
  const args = parseArgs(process.argv);
  const pageUrl = `${ORIGIN}${LIVE_PATH}`;
  const res = await fetch(pageUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    throw new Error(`Live fetch failed ${res.status} ${pageUrl}`);
  }
  const html = await res.text();
  const links = extractFileLinksFromHtml(html, pageUrl);
  console.log(`Fetched ${pageUrl}: ${links.length} file link(s)`);

  const seen = new Map();
  const byUrl = new Map();
  for (const link of links) {
    const filename = filenameFromUrl(link.url);
    let hierarchyPath = hierarchyPathFromLabel(link.label, filename);
    hierarchyPath = disambiguateHierarchyPath(hierarchyPath, seen);
    byUrl.set(link.url, {
      url: link.url,
      categorySlug: CATEGORY_SLUG,
      year: ELECTION_YEAR,
      filename,
      hierarchyPath,
      sourcePage: 'malankara-association-2026',
      displayName: DISPLAY_NAME,
    });
  }

  const items = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
  const manifest = {
    _comment:
      'Malankara Association 2026 only — scraped from https://mosc.in/downloads/malankara-association-2026/. Use with fetch-urls.mjs --skip-existing and upload-manifest-to-official-docs.mjs --missing-only.',
    delayMs: 1500,
    userAgent: UA,
    siteOrigin: ORIGIN,
    fetchRobotsTxt: true,
    items,
  };

  console.log(`Unique file URLs: ${items.length}`);
  for (const item of items) {
    console.log(`  - ${item.filename} → ${item.hierarchyPath}`);
  }

  if (args.write) {
    await writeFile(OUT_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\nWrote ${OUT_PATH}`);
  } else {
    console.log('\nDry run — pass --write to create url-list.malankara-association-2026.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
