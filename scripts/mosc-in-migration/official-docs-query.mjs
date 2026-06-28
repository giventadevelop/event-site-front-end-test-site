#!/usr/bin/env node
/**
 * Shared helpers for querying official document rows via the backend API.
 * Backend criteria officialDocumentCategoryId.equals / officialDocumentYear.equals are unreliable;
 * always filter client-side after eventMediaType.equals=TENANT_OFFICIAL_DOCUMENT.
 */
import { TENANT_ID, apiFetch } from './migration-api-lib.mjs';

export const OFFICIAL_DOC_MEDIA_TYPE = 'TENANT_OFFICIAL_DOCUMENT';

export const TREE_PATH_MARKER = '[[MOSC_TREE_PATH]]';

export function parseTreePathFromDescription(description) {
  const lines = String(description || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(TREE_PATH_MARKER)) {
      return trimmed.slice(TREE_PATH_MARKER.length).trim();
    }
  }
  return '';
}

export function isOfficialDocumentRow(row) {
  return String(row?.eventMediaType || '') === OFFICIAL_DOC_MEDIA_TYPE;
}

export function rowMatchesBucket(row, categoryId, year) {
  return (
    isOfficialDocumentRow(row) &&
    Number(row?.officialDocumentCategoryId) === Number(categoryId) &&
    Number(row?.officialDocumentYear) === Number(year)
  );
}

export function manifestItemKey(item) {
  return `${item.categorySlug}|${item.year}|${String(item.hierarchyPath || '').toLowerCase()}`;
}

export function dbRowKey(row, slugById) {
  const slug = slugById.get(row.officialDocumentCategoryId) || '';
  const hp = (row.hierarchyPath || parseTreePathFromDescription(row.description) || '').toLowerCase();
  return `${slug}|${row.officialDocumentYear}|${hp}`;
}

/** Paginate all tenant official documents (reliable type filter). */
export async function fetchAllOfficialDocuments() {
  const all = [];
  let page = 0;
  while (true) {
    const qs = new URLSearchParams({
      'tenantId.equals': TENANT_ID,
      'eventMediaType.equals': OFFICIAL_DOC_MEDIA_TYPE,
      size: '100',
      page: String(page),
      sort: 'id,asc',
    });
    const { res, json, text } = await apiFetch(`/api/event-medias?${qs.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Official docs list failed (${res.status}): ${text.slice(0, 240)}`);
    }
    const rows = Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
    all.push(...rows.filter(isOfficialDocumentRow));
    if (rows.length < 100) break;
    page += 1;
  }
  return all;
}

export function findExistingMediaRowsInCache(cache, categoryId, year, treePath, filename) {
  const treeKey = treePath.toLowerCase();
  const fileKey = filename.toLowerCase();
  const logicalFileKey = fileKey.replace(/_\d{10,}_[a-f0-9]{6,}(?=\.[^.]+$)/i, '');
  const fileStem = fileKey.replace(/\.[^.]+$/, '');

  return cache.filter((row) => {
    if (!rowMatchesBucket(row, categoryId, year)) return false;
    const rawPath = String(row?.hierarchyPath || '').trim();
    const markerPath = parseTreePathFromDescription(row?.description);
    const rowFile = String(row?.fileName || row?.title || '').trim();
    const pathKey = (rawPath || markerPath || '').toLowerCase();
    const rowFileLower = rowFile.toLowerCase();
    const rowLogicalFile = rowFileLower.replace(/_\d{10,}_[a-f0-9]{6,}(?=\.[^.]+$)/i, '');
    return (
      (pathKey && pathKey === treeKey) ||
      (rowFileLower && rowFileLower === fileKey) ||
      (logicalFileKey && rowLogicalFile && rowLogicalFile === logicalFileKey) ||
      (pathKey && fileStem && pathKey === fileStem)
    );
  });
}

export function buildHierarchyKeySet(cache, categoryId, year) {
  const keys = new Set();
  for (const row of cache) {
    if (!rowMatchesBucket(row, categoryId, year)) continue;
    const rawPath = String(row?.hierarchyPath || '').trim();
    const markerPath = parseTreePathFromDescription(row?.description);
    const fileName = String(row?.fileName || row?.title || '').trim();
    const finalPath = rawPath || markerPath || fileName;
    if (finalPath) keys.add(finalPath.toLowerCase());
  }
  return keys;
}

export function computeMissingManifestItems(manifestItems, allOfficialDocs, slugById) {
  const dbKeys = new Set();
  for (const row of allOfficialDocs) {
    dbKeys.add(dbRowKey(row, slugById));
  }
  const seen = new Set();
  const missing = [];
  for (const item of manifestItems) {
    const key = manifestItemKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!dbKeys.has(key)) missing.push(item);
  }
  return missing;
}
