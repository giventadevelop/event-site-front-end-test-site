#!/usr/bin/env node
/**
 * Shared deduplication keys for tenant official documents (migration + purge).
 * Mirrors src/lib/downloads/deduplicateOfficialDocuments.ts
 */
import { parseTreePathFromDescription } from './official-docs-query.mjs';

export function normalizeStoragePath(url) {
  if (!url) return '';
  return String(url).split('?')[0].trim().toLowerCase();
}

export function getRowFileName(row) {
  const fromFile = String(row?.fileName || '').trim();
  if (fromFile) return fromFile;

  const url = String(row?.fileUrl || '').trim();
  if (url) {
    const base = url.split('?')[0].split('/').pop();
    if (base) return base;
  }

  const tree = getRowTreePath(row);
  if (tree) {
    const seg = tree.split(/[\\/]/).pop();
    if (seg) return seg;
  }

  return String(row?.title || '').trim();
}

export function getRowTreePath(row) {
  const rawPath = String(row?.hierarchyPath || '').trim();
  const markerPath = parseTreePathFromDescription(row?.description);
  const fileName = getRowFileName(row);
  return rawPath || markerPath || fileName;
}

export function normalizeLogicalFileName(name) {
  const base = String(name || '').trim();
  if (!base) return '';
  // Strip unique S3 upload suffix: Original_1782619014443_67398298.xlsx -> Original.xlsx
  return base.replace(/_\d{10,}_[a-f0-9]{6,}(?=\.[^.]+$)/i, '').toLowerCase();
}

/**
 * Stable key for collapsing duplicate rows.
 * Re-uploads get new S3 URLs and suffixed filenames; logical identity is category + tree path.
 */
export function getOfficialDocumentDedupeKey(row) {
  const categoryId = Number(row?.officialDocumentCategoryId) || 0;
  const tree = getRowTreePath(row).trim().toLowerCase();
  if (categoryId && tree) {
    return `logical:${categoryId}:${tree}`;
  }

  const fileUrl = normalizeStoragePath(row?.fileUrl);
  if (fileUrl) return `url:${fileUrl}`;

  const logicalName = normalizeLogicalFileName(getRowFileName(row));
  return `meta:${categoryId}:${logicalName}`;
}

export function getRowPriority(row) {
  const p = row?.displayPriority ?? row?.priorityRanking;
  return Number.isFinite(Number(p)) ? Number(p) : 999999;
}

export function shouldPreferKeeper(candidate, incumbent) {
  const candidatePriority = getRowPriority(candidate);
  const incumbentPriority = getRowPriority(incumbent);
  if (candidatePriority !== incumbentPriority) {
    return candidatePriority < incumbentPriority;
  }

  const candidateId = Number(candidate?.id);
  const incumbentId = Number(incumbent?.id);
  const safeCandidate = Number.isFinite(candidateId) && candidateId > 0 ? candidateId : Number.MAX_SAFE_INTEGER;
  const safeIncumbent = Number.isFinite(incumbentId) && incumbentId > 0 ? incumbentId : Number.MAX_SAFE_INTEGER;
  return safeCandidate < safeIncumbent;
}

/**
 * Group rows by dedupe key. Each group value is the row to keep.
 */
export function pickKeeperRows(rows) {
  const keepers = new Map();
  for (const row of rows) {
    const key = getOfficialDocumentDedupeKey(row);
    const existing = keepers.get(key);
    if (!existing || shouldPreferKeeper(row, existing)) {
      keepers.set(key, row);
    }
  }
  return keepers;
}

/**
 * Returns { keepers: Map<key, row>, duplicates: Array<{ key, keeper, row }> }
 */
export function findDuplicateOfficialDocuments(rows) {
  const keepers = pickKeeperRows(rows);
  const keeperIds = new Set(
    [...keepers.values()]
      .map((row) => Number(row?.id))
      .filter((id) => Number.isFinite(id) && id > 0)
  );

  const duplicates = [];
  for (const row of rows) {
    const id = Number(row?.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    if (keeperIds.has(id)) continue;

    const key = getOfficialDocumentDedupeKey(row);
    const keeper = keepers.get(key);
    duplicates.push({ key, keeper, row });
  }

  return { keepers, duplicates };
}

export function manifestUploadKey(item) {
  const categorySlug = String(item?.categorySlug || '').trim().toLowerCase();
  const year = Number(item?.year) || 0;
  const treePath = String(item?.hierarchyPath || item?.filename || '').trim().toLowerCase();
  const filename = String(item?.filename || '').trim().toLowerCase();
  return `${categorySlug}|${year}|${treePath}|${filename}`;
}

/** Remove duplicate manifest rows before upload (same category/year/path/filename). */
export function deduplicateManifestItems(items) {
  const seen = new Set();
  const unique = [];
  let dropped = 0;
  for (const item of items) {
    const key = manifestUploadKey(item);
    if (seen.has(key)) {
      dropped += 1;
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return { unique, dropped };
}

/**
 * In-memory upload guard: hierarchy + filename per category/year bucket, plus global fileUrl keys.
 */
export function buildUploadDedupeState(cache) {
  const bucketKeys = new Map();
  const globalFileUrlKeys = new Set();

  for (const row of cache) {
    const fileUrl = normalizeStoragePath(row?.fileUrl);
    if (fileUrl) globalFileUrlKeys.add(fileUrl);

    const categoryId = Number(row?.officialDocumentCategoryId);
    const year = Number(row?.officialDocumentYear);
    if (!Number.isFinite(categoryId) || categoryId <= 0 || !Number.isFinite(year)) continue;

    const bucketKey = `${categoryId}:${year}`;
    if (!bucketKeys.has(bucketKey)) bucketKeys.set(bucketKey, new Set());

    const set = bucketKeys.get(bucketKey);
    const treePath = getRowTreePath(row).toLowerCase();
    const fileName = getRowFileName(row).toLowerCase();
    const logicalFileName = normalizeLogicalFileName(fileName);
    const fileStem = fileName.replace(/\.[^.]+$/, '');

    if (treePath) set.add(`path:${treePath}`);
    if (fileName) set.add(`file:${fileName}`);
    if (logicalFileName) set.add(`logical:${logicalFileName}`);
    if (fileStem) set.add(`stem:${fileStem}`);
  }

  return { bucketKeys, globalFileUrlKeys };
}

export function isManifestItemAlreadyUploaded(state, categoryId, year, treePath, filename) {
  if (!categoryId) return false;

  const bucketKey = `${categoryId}:${year}`;
  const set = state.bucketKeys.get(bucketKey);
  if (!set) return false;

  const treeKey = String(treePath || '').trim().toLowerCase();
  const fileKey = String(filename || '').trim().toLowerCase();
  const logicalFileKey = normalizeLogicalFileName(filename);
  const fileStem = fileKey.replace(/\.[^.]+$/, '');

  return (
    (treeKey && set.has(`path:${treeKey}`)) ||
    (fileKey && set.has(`file:${fileKey}`)) ||
    (logicalFileKey && set.has(`logical:${logicalFileKey}`)) ||
    (fileStem && treeKey && set.has(`stem:${fileStem}`) && treeKey === fileStem)
  );
}

export function registerUploadedManifestItem(state, categoryId, year, treePath, filename, uploadedRow) {
  const bucketKey = `${categoryId}:${year}`;
  if (!state.bucketKeys.has(bucketKey)) state.bucketKeys.set(bucketKey, new Set());
  const set = state.bucketKeys.get(bucketKey);

  const treeKey = String(treePath || '').trim().toLowerCase();
  const fileKey = String(filename || '').trim().toLowerCase();
  const logicalFileKey = normalizeLogicalFileName(filename);
  const fileStem = fileKey.replace(/\.[^.]+$/, '');
  if (treeKey) set.add(`path:${treeKey}`);
  if (fileKey) set.add(`file:${fileKey}`);
  if (logicalFileKey) set.add(`logical:${logicalFileKey}`);
  if (fileStem) set.add(`stem:${fileStem}`);

  const fileUrl = normalizeStoragePath(uploadedRow?.fileUrl);
  if (fileUrl) state.globalFileUrlKeys.add(fileUrl);
}
