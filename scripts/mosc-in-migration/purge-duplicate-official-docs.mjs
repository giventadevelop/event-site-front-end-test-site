#!/usr/bin/env node
/**
 * Permanently delete duplicate tenant official-document rows from the backend.
 *
 * Keeps one row per dedupe key (lowest displayPriority / priorityRanking, then lowest id).
 * Dedupe key: normalized fileUrl first, else categoryId + hierarchyPath + filename.
 *
 * Usage:
 *   node scripts/mosc-in-migration/purge-duplicate-official-docs.mjs --dry-run
 *   node scripts/mosc-in-migration/purge-duplicate-official-docs.mjs --confirm
 *   node scripts/mosc-in-migration/purge-duplicate-official-docs.mjs --confirm --category-slug fcra-statements
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertEnv, apiFetch, TENANT_ID } from './migration-api-lib.mjs';
import { fetchAllOfficialDocuments } from './official-docs-query.mjs';
import {
  findDuplicateOfficialDocuments,
  getOfficialDocumentDedupeKey,
  getRowFileName,
  getRowTreePath,
} from './official-doc-dedupe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--confirm');
const DELETE_DELAY_MS = Number(process.env.MOSC_PURGE_DELAY_MS || '200');

function parseArgs(argv) {
  const slugIdx = argv.indexOf('--category-slug');
  return {
    categorySlug: slugIdx >= 0 && argv[slugIdx + 1] ? String(argv[slugIdx + 1]).trim() : '',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureCategoriesMap() {
  const url = `/api/official-document-categories?tenantId.equals=${encodeURIComponent(TENANT_ID)}&size=500&sort=sortOrder,asc`;
  const { res, json, text } = await apiFetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Category list failed (${res.status}): ${text.slice(0, 240)}`);
  }
  const rows = Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
  const slugToId = new Map();
  const idToSlug = new Map();
  for (const row of rows) {
    const id = Number(row?.id);
    const slug = String(row?.slug || '').trim();
    if (Number.isFinite(id) && id > 0 && slug) {
      slugToId.set(slug, id);
      idToSlug.set(id, slug);
    }
  }
  return { slugToId, idToSlug };
}

async function deleteMediaRow(id) {
  const { res, text } = await apiFetch(`/api/event-medias/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Delete media ${id} failed (${res.status}): ${text.slice(0, 400)}`);
  }
}

function summarizeDuplicate(entry, idToSlug) {
  const { key, keeper, row } = entry;
  const categoryId = Number(row?.officialDocumentCategoryId);
  const slug = idToSlug.get(categoryId) || `category-${categoryId}`;
  return {
    key,
    deleteId: Number(row?.id),
    keepId: Number(keeper?.id),
    categorySlug: slug,
    year: row?.officialDocumentYear ?? null,
    treePath: getRowTreePath(row),
    fileName: getRowFileName(row),
    title: row?.title ?? '',
  };
}

async function main() {
  assertEnv();
  const args = parseArgs(process.argv);

  console.log(`Tenant: ${TENANT_ID}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (pass --confirm to delete)' : 'DELETE (--confirm)'}`);

  const { slugToId, idToSlug } = await ensureCategoriesMap();
  let allRows = await fetchAllOfficialDocuments();
  console.log(`Official documents loaded: ${allRows.length}`);

  if (args.categorySlug) {
    const categoryId = slugToId.get(args.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug "${args.categorySlug}"`);
    }
    allRows = allRows.filter((row) => Number(row.officialDocumentCategoryId) === categoryId);
    console.log(`Filtered to category ${args.categorySlug} (id=${categoryId}): ${allRows.length} rows`);
  }

  const { keepers, duplicates } = findDuplicateOfficialDocuments(allRows);
  const summary = duplicates.map((entry) => summarizeDuplicate(entry, idToSlug));

  console.log(`Unique dedupe keys (keepers): ${keepers.size}`);
  console.log(`Duplicate rows to remove: ${summary.length}`);

  if (summary.length === 0) {
    console.log('No duplicates found.');
    return;
  }

  const reportPath = path.join(__dirname, `_purge-duplicates-report-${Date.now()}.json`);
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        tenantId: TENANT_ID,
        dryRun: DRY_RUN,
        categorySlugFilter: args.categorySlug || null,
        totalRows: allRows.length,
        keeperCount: keepers.size,
        duplicateCount: summary.length,
        duplicates: summary,
      },
      null,
      2
    ),
    'utf8'
  );
  console.log(`Report written: ${reportPath}`);

  const preview = summary.slice(0, 15);
  for (const row of preview) {
    console.log(
      `[dup] delete id=${row.deleteId} keep id=${row.keepId} ${row.categorySlug}/${row.year} ${row.fileName} key=${row.key}`
    );
  }
  if (summary.length > preview.length) {
    console.log(`... and ${summary.length - preview.length} more (see report)`);
  }

  if (DRY_RUN) {
    console.log('Dry run complete. Re-run with --confirm to permanently delete duplicate rows.');
    return;
  }

  let deleted = 0;
  let failed = 0;
  for (const row of summary) {
    try {
      await deleteMediaRow(row.deleteId);
      deleted += 1;
      console.log(`[deleted] id=${row.deleteId} (kept id=${row.keepId})`);
      if (DELETE_DELAY_MS > 0) await sleep(DELETE_DELAY_MS);
    } catch (error) {
      failed += 1;
      console.error(`[delete-error] id=${row.deleteId}:`, String(error));
    }
  }

  console.log(`Purge complete. deleted=${deleted}, failed=${failed}, duplicates=${summary.length}`);
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exitCode = 1;
});
