#!/usr/bin/env node
/**
 * Upload official documents from a flat manifest layout:
 *   {MOSC_DOWNLOAD_ROOT}/{categorySlug}/{year}/{filename}
 *
 * Dedupes by (categoryId, electionYear, hierarchyPath) before upload.
 * Uses client-side filtering on TENANT_OFFICIAL_DOCUMENT rows (backend category/year criteria are unreliable).
 *
 * Usage:
 *   node scripts/mosc-in-migration/upload-manifest-to-official-docs.mjs --manifest scripts/mosc-in-migration/url-list.malankara-remapped.json --dry-run
 *   node scripts/mosc-in-migration/upload-manifest-to-official-docs.mjs --manifest ... --missing-only
 *   node scripts/mosc-in-migration/upload-manifest-to-official-docs.mjs --manifest ... --backfill-thumbnails
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_DOWNLOAD_ROOT } from './config.mjs';
import { API_BASE_URL, TENANT_ID, apiFetch, assertEnv } from './migration-api-lib.mjs';
import {
  TREE_PATH_MARKER,
  buildHierarchyKeySet,
  computeMissingManifestItems,
  fetchAllOfficialDocuments,
  findExistingMediaRowsInCache,
  manifestItemKey,
  parseTreePathFromDescription,
  rowMatchesBucket,
} from './official-docs-query.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOWNLOAD_ROOT = (process.env.MOSC_DOWNLOAD_ROOT || DEFAULT_DOWNLOAD_ROOT).trim();
const BATCH_LIMIT = Number(process.env.MOSC_UPLOAD_LIMIT || '0');
const AUTO_CREATE_CATEGORIES = process.env.MOSC_AUTO_CREATE_CATEGORIES === 'true';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE_UPLOAD =
  process.argv.includes('--force') || process.env.MOSC_UPLOAD_FORCE === 'true';
const MISSING_ONLY = process.argv.includes('--missing-only');
const BACKFILL_THUMBNAILS = process.argv.includes('--backfill-thumbnails');
const ENSURE_YEAR_BUNDLES = process.argv.includes('--ensure-year-bundles');
const INSECURE_TLS =
  process.argv.includes('--insecure-tls') || process.env.MOSC_INSECURE_TLS === 'true';
const UPLOAD_DELAY_MS = Number(process.env.MOSC_UPLOAD_DELAY_MS || '400');
const UPLOAD_MAX_RETRIES = Number(process.env.MOSC_UPLOAD_MAX_RETRIES || '3');

const TREE_PRIORITY_MARKER = '[[MOSC_PRIORITY]]';
const TREE_CATEGORY_LABEL_MARKER = '[[MOSC_CATEGORY_LABEL]]';

const COVERS_PATH = path.join(__dirname, 'downloads-category-covers.json');
const COVERS_FALLBACK_PATH = path.join(__dirname, 'malankara-category-covers.json');

function parseArgs(argv) {
  const manifestIdx = argv.indexOf('--manifest');
  return {
    manifestPath:
      manifestIdx >= 0 && argv[manifestIdx + 1]
        ? path.resolve(argv[manifestIdx + 1])
        : path.join(__dirname, 'url-list.malankara-remapped.json'),
  };
}

function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function buildDescription({ categoryLabel, treePath, priority }) {
  return [
    `${TREE_CATEGORY_LABEL_MARKER} ${categoryLabel}`,
    `${TREE_PATH_MARKER} ${treePath}`,
    `${TREE_PRIORITY_MARKER} ${priority}`,
  ].join('\n');
}

/** S3 user-metadata (title) must be US-ASCII; Unicode en-dashes in hierarchyPath cause SignatureDoesNotMatch. */
function toS3SafeTitle(value, fallback = 'document') {
  const ascii = String(value || fallback)
    .normalize('NFKD')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
  return ascii || fallback;
}

async function loadCategoryCovers() {
  const map = new Map();
  for (const coversPath of [COVERS_PATH, COVERS_FALLBACK_PATH]) {
    try {
      const raw = await readFile(coversPath, 'utf8');
      const data = JSON.parse(raw);
      for (const [slug, entry] of Object.entries(data)) {
        if (slug.startsWith('_')) continue;
        if (entry?.coverUrl && !map.has(slug)) map.set(slug, String(entry.coverUrl).trim());
      }
    } catch {
      /* try fallback */
    }
  }
  if (map.size === 0) {
    console.warn(`[warn] No category covers at ${COVERS_PATH} or ${COVERS_FALLBACK_PATH}`);
  }
  return map;
}

async function fetchRemoteBytes(url) {
  if (INSECURE_TLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mosc-in-migration/1.0' },
  });
  if (!res.ok) {
    throw new Error(`Fetch ${url} failed (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const fileName = path.basename(new URL(url).pathname) || 'cover.jpg';
  return { bytes: buf, contentType, fileName };
}

const coverBytesCache = new Map();

async function getCategoryCoverBytes(categorySlug, coverUrlBySlug) {
  const url = coverUrlBySlug.get(categorySlug);
  if (!url) return null;
  if (coverBytesCache.has(url)) return coverBytesCache.get(url);
  const data = await fetchRemoteBytes(url);
  coverBytesCache.set(url, data);
  return data;
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
  const bySlug = new Map();
  const byLabel = new Map();
  const idToSlug = new Map();
  for (const row of rows) {
    const slug = String(row?.slug || '').trim();
    const label = String(row?.displayName || '').trim();
    if (!slug) continue;
    bySlug.set(slug, row);
    idToSlug.set(Number(row.id), slug);
    if (label) byLabel.set(label.toLowerCase(), row);
  }
  return { bySlug, byLabel, idToSlug };
}

async function ensureCategoryBySlug(categorySlug, displayName, maps) {
  const existing = maps.bySlug.get(categorySlug);
  if (existing) return existing;

  if (DRY_RUN) {
    return { id: null, slug: categorySlug, displayName };
  }

  if (!AUTO_CREATE_CATEGORIES) {
    throw new Error(
      `Missing category slug "${categorySlug}". Create it in /admin/official-document-categories or set MOSC_AUTO_CREATE_CATEGORIES=true.`
    );
  }

  const createBody = {
    slug: categorySlug,
    displayName: displayName || categorySlug,
    description: `Auto-created from manifest upload on ${new Date().toISOString()}`,
    sortOrder: 999,
    isActive: true,
    tenantId: TENANT_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const { res, json, text } = await apiFetch(`/api/official-document-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createBody),
  });
  if (!res.ok) {
    throw new Error(`Create category failed (${res.status}) for "${categorySlug}": ${text.slice(0, 280)}`);
  }
  maps.bySlug.set(categorySlug, json);
  maps.idToSlug.set(Number(json.id), categorySlug);
  if (json?.displayName) maps.byLabel.set(String(json.displayName).toLowerCase(), json);
  return json;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function guessContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.ppt' || ext === '.pptx') {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  if (ext === '.doc' || ext === '.docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  return 'application/octet-stream';
}

function rowHasThumbnail(row) {
  const thumb = String(row?.thumbnailUrl || row?.thumbnailPreSignedUrl || '').trim();
  return thumb.length > 0;
}

async function uploadSingleFile(filePath, payload, thumbnailBytes = null, thumbnailFileName = 'cover.jpg') {
  const bytes = await readFile(filePath);
  const contentType = guessContentType(payload.fileName);
  const uploadUrl = `${API_BASE_URL}/api/event-medias/upload/tenant-official-document`;

  let lastError = null;
  for (let attempt = 1; attempt <= UPLOAD_MAX_RETRIES; attempt += 1) {
    const form = new FormData();
    form.append('tenantId', TENANT_ID);
    form.append('categorySlug', payload.categorySlug);
    form.append('officialDocumentYear', String(payload.year));
    form.append('isPublic', 'true');
    form.append('title', payload.fileTitle);
    form.append('description', payload.description);
    form.append('hierarchyPath', payload.treePath);
    form.append('hierarchyCategoryLabel', payload.categoryLabel);
    form.append('displayPriority', String(payload.priority));
    form.append('file', new File([bytes], payload.fileName, { type: contentType }));
    if (thumbnailBytes) {
      form.append(
        'thumbnailFile',
        new File([thumbnailBytes], thumbnailFileName, { type: guessContentType(thumbnailFileName) })
      );
    }

    const { res, json, text } = await apiFetch(uploadUrl, {
      method: 'POST',
      body: form,
    });
    if (res.ok) {
      if (!json || typeof json !== 'object' || Array.isArray(json)) {
        throw new Error(`Upload succeeded (${res.status}) but body is not a single EventMediaDTO object.`);
      }
      return json;
    }

    const detail = json && typeof json === 'object' ? JSON.stringify(json, null, 2) : text || '';
    lastError = new Error(`Upload failed (${res.status}) for "${filePath}": ${detail.slice(0, 12000)}`);
    const retryable =
      res.status >= 500 ||
      detail.includes('SignatureDoesNotMatch') ||
      detail.includes('SlowDown') ||
      detail.includes('RequestTimeout');
    if (!retryable || attempt >= UPLOAD_MAX_RETRIES) {
      throw lastError;
    }
    const backoffMs = UPLOAD_DELAY_MS * attempt * 2;
    console.warn(`[retry ${attempt}/${UPLOAD_MAX_RETRIES}] ${payload.fileName} in ${backoffMs}ms`);
    await sleep(backoffMs);
  }

  throw lastError || new Error(`Upload failed for "${filePath}"`);
}

async function uploadThumbnailForMedia(mediaId, thumbnailBytes, thumbnailFileName) {
  const form = new FormData();
  form.append(
    'thumbnailFile',
    new File([thumbnailBytes], thumbnailFileName, { type: guessContentType(thumbnailFileName) })
  );
  const { res, json, text } = await apiFetch(
    `/api/event-medias/${mediaId}/upload-official-document-thumbnail`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    const detail = json && typeof json === 'object' ? JSON.stringify(json) : text || '';
    throw new Error(`Thumbnail upload failed (${res.status}) for media ${mediaId}: ${detail.slice(0, 2000)}`);
  }
  return json;
}

function deleteExistingMediaFromCache(officialDocsCache, categoryId, year, treePath, filename) {
  const rows = findExistingMediaRowsInCache(officialDocsCache, categoryId, year, treePath, filename);
  return rows;
}

async function deleteExistingMedia(officialDocsCache, categoryId, year, treePath, filename) {
  const rows = deleteExistingMediaFromCache(officialDocsCache, categoryId, year, treePath, filename);
  for (const row of rows) {
    const id = Number(row?.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    const { res, text } = await apiFetch(`/api/event-medias/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Delete media ${id} failed (${res.status}): ${text.slice(0, 240)}`);
    }
    console.log(`[deleted-existing] id=${id} ${filename}`);
    const idx = officialDocsCache.findIndex((r) => Number(r.id) === id);
    if (idx >= 0) officialDocsCache.splice(idx, 1);
  }
}

async function fetchEventMediaById(id) {
  const { res, json } = await apiFetch(`/api/event-medias/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok || json == null || typeof json !== 'object' || Array.isArray(json)) {
    return null;
  }
  return json;
}

async function patchUploadedMedia(media, payload) {
  const id = Number(media?.id);
  if (!Number.isFinite(id) || id <= 0) return;
  const fromGet = await fetchEventMediaById(id);
  const base = {
    ...(fromGet ? fromGet : {}),
    ...(media && typeof media === 'object' ? media : {}),
  };
  const patchBody = {
    ...base,
    id,
    title: payload.fileTitle,
    description: payload.description,
    hierarchyPath: payload.treePath,
    hierarchyCategoryLabel: payload.categoryLabel,
    isPublic: true,
    isEventManagementOfficialDocument: true,
    officialDocumentYear: payload.year,
    officialDocumentCategoryId: payload.categoryId ?? base.officialDocumentCategoryId ?? null,
    displayPriority: payload.priority,
    priorityRanking: payload.priority,
    updatedAt: new Date().toISOString(),
  };
  const { res, text, json } = await apiFetch(`/api/event-medias/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(patchBody),
  });
  if (!res.ok) {
    const detail = json && typeof json === 'object' ? JSON.stringify(json, null, 2) : text || '';
    throw new Error(`Patch failed (${res.status}) for media ${id}: ${detail.slice(0, 12000)}`);
  }
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function backfillThumbnails(officialDocsCache, coverUrlBySlug, idToSlug) {
  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of officialDocsCache) {
    const slug = idToSlug.get(Number(row.officialDocumentCategoryId)) || '';
    if (!slug) continue;
    if (rowHasThumbnail(row)) {
      skipped += 1;
      continue;
    }
    try {
      const cover = await getCategoryCoverBytes(slug, coverUrlBySlug);
      if (!cover) {
        console.warn(`[thumb-skip] no cover URL for ${slug} (media ${row.id})`);
        skipped += 1;
        continue;
      }
      if (DRY_RUN) {
        console.log(`[thumb-dry-run] media ${row.id} ${slug}`);
        ok += 1;
        continue;
      }
      await uploadThumbnailForMedia(row.id, cover.bytes, cover.fileName);
      ok += 1;
      console.log(`[thumb-ok] media ${row.id} ${slug}`);
      if (UPLOAD_DELAY_MS > 0) await sleep(UPLOAD_DELAY_MS);
    } catch (error) {
      failed += 1;
      console.error(`[thumb-error] media ${row.id}:`, String(error));
    }
  }

  console.log(`Thumbnail backfill: success=${ok}, failed=${failed}, skipped=${skipped}`);
  return { ok, failed, skipped };
}

async function fetchYearBundles() {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    size: '500',
    sort: 'documentYear,desc',
  });
  const { res, json } = await apiFetch(`/api/official-document-year-bundles?${qs.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return [];
  return Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
}

async function ensureYearBundleCovers(officialDocsCache, maps) {
  const bundles = await fetchYearBundles();
  const bundleKey = (catId, year) => `${catId}:${year}`;
  const bundleByKey = new Map();
  for (const b of bundles) {
    const catId = Number(b.officialDocumentCategoryId ?? b.official_document_category_id);
    const year = Number(b.documentYear ?? b.document_year);
    if (catId && year) bundleByKey.set(bundleKey(catId, year), b);
  }

  const categoryBuckets = new Map();
  for (const row of officialDocsCache) {
    const slug = maps.idToSlug.get(Number(row.officialDocumentCategoryId)) || '';
    if (!slug) continue;
    const key = bundleKey(row.officialDocumentCategoryId, row.officialDocumentYear);
    if (!categoryBuckets.has(key)) categoryBuckets.set(key, []);
    categoryBuckets.get(key).push(row);
  }

  let ok = 0;
  let failed = 0;

  for (const [key, rows] of categoryBuckets) {
    const [catIdStr, yearStr] = key.split(':');
    const catId = Number(catIdStr);
    const year = Number(yearStr);
    const slug = maps.idToSlug.get(catId) || '';
    const coverRow = rows.find((r) => rowHasThumbnail(r)) || rows[0];
    if (!coverRow?.id) continue;

    let bundle = bundleByKey.get(key);
    if (!bundle && !DRY_RUN) {
      const { res, json, text } = await apiFetch('/api/official-document-year-bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: TENANT_ID,
          officialDocumentCategoryId: catId,
          documentYear: year,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        bundle = json;
        bundleByKey.set(key, bundle);
      } else if (res.status !== 409) {
        console.warn(`[bundle-create-fail] ${slug}/${year}: ${text.slice(0, 200)}`);
        failed += 1;
        continue;
      }
    }

    bundle = bundle || bundleByKey.get(key);
    const bundleId = Number(bundle?.id);
    const existingCoverId = Number(bundle?.coverEventMediaId ?? bundle?.cover_event_media_id);
    if (existingCoverId === Number(coverRow.id)) {
      ok += 1;
      continue;
    }

    if (DRY_RUN) {
      console.log(`[bundle-dry-run] ${slug}/${year} cover -> media ${coverRow.id}`);
      ok += 1;
      continue;
    }

    if (!bundleId) {
      failed += 1;
      continue;
    }

    try {
      const { res, text } = await apiFetch(`/api/official-document-year-bundles/${bundleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify({
          id: bundleId,
          coverEventMediaId: Number(coverRow.id),
          updatedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        throw new Error(text.slice(0, 400));
      }
      ok += 1;
      console.log(`[bundle-ok] ${slug}/${year} cover -> media ${coverRow.id}`);
    } catch (error) {
      failed += 1;
      console.error(`[bundle-error] ${slug}/${year}:`, String(error));
    }
  }

  console.log(`Year bundle covers: success=${ok}, failed=${failed}`);
}

async function uploadItems(selected, coverUrlBySlug, officialDocsCache, maps) {
  const dedupeCache = new Map();
  let ok = 0;
  let failed = 0;
  let skipped = 0;
  let missingFile = 0;

  for (let idx = 0; idx < selected.length; idx += 1) {
    const item = selected[idx];
    const categorySlug = String(item.categorySlug || '').trim();
    const year = Number(item.year) || new Date().getFullYear();
    const filename = String(item.filename || '').trim();
    const filePath = path.join(DOWNLOAD_ROOT, categorySlug, String(year), filename);
    const treePath = String(item.hierarchyPath || filename.replace(/\.[^.]+$/, '')).trim();
    const categoryLabel = String(item.displayName || categorySlug).trim();
    const fileTitle = toS3SafeTitle(treePath, filename.replace(/\.[^.]+$/, '') || 'document');
    const priority = Math.max(0, idx);

    if (!(await fileExists(filePath))) {
      missingFile += 1;
      console.warn(`[missing-file] ${idx + 1}/${selected.length}: ${filePath}`);
      continue;
    }

    try {
      const category = await ensureCategoryBySlug(categorySlug, categoryLabel, maps);
      const categoryId = Number(category?.id || 0) || null;
      const description = buildDescription({ categoryLabel, treePath, priority });
      const dedupeBucketKey = `${categoryId || 0}:${year}`;

      if (categoryId && !FORCE_UPLOAD && !MISSING_ONLY) {
        if (!dedupeCache.has(dedupeBucketKey)) {
          dedupeCache.set(dedupeBucketKey, buildHierarchyKeySet(officialDocsCache, categoryId, year));
        }
        const existing = dedupeCache.get(dedupeBucketKey);
        if (existing.has(treePath.toLowerCase()) || existing.has(filename.toLowerCase())) {
          skipped += 1;
          console.log(`[skip-duplicate] ${idx + 1}/${selected.length}: ${categorySlug}/${year}/${treePath}`);
          continue;
        }
      }

      let thumbnailPayload = null;
      try {
        thumbnailPayload = await getCategoryCoverBytes(categorySlug, coverUrlBySlug);
      } catch (err) {
        console.warn(`[thumb-warn] cover fetch failed for ${categorySlug}: ${String(err)}`);
      }

      if (DRY_RUN) {
        console.log(
          `[dry-run] ${idx + 1}/${selected.length} -> ${categorySlug}/${year}/${filename}${FORCE_UPLOAD ? ' (force)' : ''}${thumbnailPayload ? ' +thumb' : ''}`
        );
        ok += 1;
        continue;
      }

      if (FORCE_UPLOAD && categoryId) {
        await deleteExistingMedia(officialDocsCache, categoryId, year, treePath, filename);
      }

      const uploaded = await uploadSingleFile(
        filePath,
        {
          categorySlug,
          year,
          fileName: filename,
          fileTitle,
          description,
          treePath,
          categoryLabel,
          priority,
        },
        thumbnailPayload?.bytes ?? null,
        thumbnailPayload?.fileName ?? 'cover.jpg'
      );
      await patchUploadedMedia(uploaded, {
        year,
        fileTitle,
        description,
        treePath,
        categoryLabel,
        categoryId,
        priority,
      });

      officialDocsCache.push(uploaded);

      if (categoryId && dedupeCache.has(dedupeBucketKey)) {
        dedupeCache.get(dedupeBucketKey).add(treePath.toLowerCase());
        dedupeCache.get(dedupeBucketKey).add(filename.toLowerCase());
      }
      ok += 1;
      console.log(`[ok] ${idx + 1}/${selected.length}: ${categorySlug}/${year}/${filename}`);
      if (UPLOAD_DELAY_MS > 0 && idx < selected.length - 1) {
        await sleep(UPLOAD_DELAY_MS);
      }
    } catch (error) {
      failed += 1;
      console.error(`[error] ${idx + 1}/${selected.length}: ${categorySlug}/${year}/${filename}`, String(error));
    }
  }

  console.log(
    `Done. success=${ok}, failed=${failed}, skipped=${skipped}, missingFile=${missingFile}, total=${selected.length}`
  );
  return { ok, failed, skipped, missingFile };
}

async function main() {
  assertEnv();
  const args = parseArgs(process.argv);
  const raw = await readFile(args.manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  const items = Array.isArray(manifest.items) ? manifest.items : [];
  const coverUrlBySlug = await loadCategoryCovers();

  console.log(`Manifest: ${args.manifestPath}`);
  console.log(`Download root: ${DOWNLOAD_ROOT}`);
  console.log(`Tenant: ${TENANT_ID}`);
  console.log(`Backend API: ${API_BASE_URL}`);
  console.log(`Force overwrite: ${FORCE_UPLOAD}`);
  console.log(`Missing only: ${MISSING_ONLY}`);
  console.log(`Backfill thumbnails: ${BACKFILL_THUMBNAILS}`);
  console.log(`Ensure year bundles: ${ENSURE_YEAR_BUNDLES}`);
  console.log(`Category covers loaded: ${coverUrlBySlug.size}`);
  console.log(`Upload delay: ${UPLOAD_DELAY_MS}ms, max retries: ${UPLOAD_MAX_RETRIES}`);

  if (INSECURE_TLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('WARNING: TLS certificate verification disabled (--insecure-tls).');
  }

  const maps = await ensureCategoriesMap();
  const officialDocsCache = await fetchAllOfficialDocuments();
  console.log(`Official documents in DB: ${officialDocsCache.length}`);

  if (BACKFILL_THUMBNAILS) {
    await backfillThumbnails(officialDocsCache, coverUrlBySlug, maps.idToSlug);
    if (ENSURE_YEAR_BUNDLES) {
      await ensureYearBundleCovers(officialDocsCache, maps);
    }
    if (!MISSING_ONLY && BATCH_LIMIT === 0 && !process.argv.includes('--manifest')) {
      return;
    }
  }

  let selected = BATCH_LIMIT > 0 ? items.slice(0, BATCH_LIMIT) : items;

  if (MISSING_ONLY) {
    const missing = computeMissingManifestItems(items, officialDocsCache, maps.idToSlug);
    selected = missing;
    console.log(`Missing unique manifest items: ${missing.length}`);
    if (missing.length === 0) {
      console.log('Nothing to upload.');
      if (ENSURE_YEAR_BUNDLES) await ensureYearBundleCovers(officialDocsCache, maps);
      return;
    }
  }

  console.log(`Items to process: ${selected.length}${BATCH_LIMIT > 0 ? ` (limit ${BATCH_LIMIT})` : ''}`);

  await uploadItems(selected, coverUrlBySlug, officialDocsCache, maps);

  if (BACKFILL_THUMBNAILS || ENSURE_YEAR_BUNDLES) {
    const refreshed = await fetchAllOfficialDocuments();
    if (BACKFILL_THUMBNAILS) {
      await backfillThumbnails(refreshed, coverUrlBySlug, maps.idToSlug);
    }
    if (ENSURE_YEAR_BUNDLES) {
      await ensureYearBundleCovers(refreshed, maps);
    }
  }
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exitCode = 1;
});
