#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const APP_BASE_URL = process.env.MOSC_APP_BASE_URL || 'http://localhost:3000';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || process.env.MOSC_TENANT_ID || 'tenant_demo_002';
const REPORT_PATH =
  process.env.MOSC_MIRROR_REPORT ||
  'C:/E_Drive/code_backup/mosc_downloads/mosc-in-downloads-by-title/_mirror-report-1774530653757.json';
const DOWNLOADS_ROOT =
  process.env.MOSC_MIRROR_DOWNLOADS_ROOT || 'C:/E_Drive/code_backup/mosc_downloads/mosc-in-downloads-by-title/Downloads';
const BATCH_LIMIT = Number(process.env.MOSC_UPLOAD_LIMIT || '0');
const AUTO_CREATE_CATEGORIES = process.env.MOSC_AUTO_CREATE_CATEGORIES === 'true';
const DRY_RUN = process.argv.includes('--dry-run');

const TREE_PATH_MARKER = '[[MOSC_TREE_PATH]]';
const TREE_PRIORITY_MARKER = '[[MOSC_PRIORITY]]';
const TREE_CATEGORY_LABEL_MARKER = '[[MOSC_CATEGORY_LABEL]]';

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

function yearFromUrl(url) {
  const match = String(url || '').match(/\/uploads\/(\d{4})\//i);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function toRelativeTreePath(destPath) {
  const normalized = destPath.replaceAll('/', '\\');
  const root = DOWNLOADS_ROOT.replaceAll('/', '\\').replace(/\\+$/, '');
  if (normalized.toLowerCase().startsWith(root.toLowerCase() + '\\')) {
    return normalized.slice(root.length + 1);
  }
  const marker = '\\Downloads\\';
  const idx = normalized.toLowerCase().indexOf(marker.toLowerCase());
  return idx >= 0 ? normalized.slice(idx + marker.length) : path.basename(normalized);
}

function buildDescription({ categoryLabel, treePath, priority }) {
  return [
    `${TREE_CATEGORY_LABEL_MARKER} ${categoryLabel}`,
    `${TREE_PATH_MARKER} ${treePath}`,
    `${TREE_PRIORITY_MARKER} ${priority}`,
  ].join('\n');
}

function parseTreePathFromDescription(description) {
  const lines = String(description || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(TREE_PATH_MARKER)) {
      return trimmed.slice(TREE_PATH_MARKER.length).trim();
    }
  }
  return '';
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, text, json };
}

async function ensureCategoriesMap() {
  const url = `${APP_BASE_URL}/api/proxy/official-document-categories?size=500&sort=sortOrder,asc`;
  const { res, json, text } = await fetchJson(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_ID,
    },
  });
  if (!res.ok) {
    throw new Error(`Category list failed (${res.status}): ${text.slice(0, 240)}`);
  }
  const rows = Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
  const bySlug = new Map();
  const byLabel = new Map();
  for (const row of rows) {
    const slug = String(row?.slug || '').trim();
    const label = String(row?.displayName || '').trim();
    if (!slug) continue;
    bySlug.set(slug, row);
    if (label) byLabel.set(label.toLowerCase(), row);
  }
  return { bySlug, byLabel };
}

async function fetchExistingHierarchySet(categoryId, year) {
  const keys = new Set();
  if (!Number.isFinite(categoryId) || categoryId <= 0) return keys;
  const pageSize = 500;
  let page = 0;

  while (true) {
    const qs = new URLSearchParams();
    qs.set('tenantId.equals', TENANT_ID);
    qs.set('isEventManagementOfficialDocument.equals', 'true');
    qs.set('officialDocumentCategoryId.equals', String(categoryId));
    qs.set('officialDocumentYear.equals', String(year));
    qs.set('size', String(pageSize));
    qs.set('page', String(page));
    qs.append('sort', 'createdAt,desc');
    const url = `${APP_BASE_URL}/api/proxy/event-medias?${qs.toString()}`;
    const { res, json, text } = await fetchJson(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
      },
    });
    if (!res.ok) {
      throw new Error(`Dedupe read failed (${res.status}) for category=${categoryId}, year=${year}: ${text.slice(0, 240)}`);
    }

    const content = Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
    for (const row of content) {
      const rawPath = String(row?.hierarchyPath || '').trim();
      const markerPath = parseTreePathFromDescription(row?.description);
      const finalPath = rawPath || markerPath;
      if (finalPath) keys.add(finalPath.toLowerCase());
    }

    const totalPages = Array.isArray(json) ? 1 : Number(json?.totalPages ?? 1);
    if (page >= totalPages - 1) break;
    page += 1;
  }

  return keys;
}

async function ensureCategory(categoryLabel, maps) {
  const normalizedLabel = categoryLabel.trim().toLowerCase();
  const existingByLabel = maps.byLabel.get(normalizedLabel);
  if (existingByLabel) return existingByLabel;

  const slug = slugify(categoryLabel);
  const existingBySlug = maps.bySlug.get(slug);
  if (existingBySlug) return existingBySlug;

  if (DRY_RUN) {
    return { id: null, slug, displayName: categoryLabel };
  }

  if (!AUTO_CREATE_CATEGORIES) {
    throw new Error(
      `Missing category "${categoryLabel}" (slug: ${slug}). Auto-create is disabled. ` +
      `Create it in /admin/official-document-categories or set MOSC_AUTO_CREATE_CATEGORIES=true.`
    );
  }

  const createBody = {
    slug,
    displayName: categoryLabel,
    description: `Auto-created from mirror upload on ${new Date().toISOString()}`,
    sortOrder: 999,
    isActive: true,
    tenantId: TENANT_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const createUrl = `${APP_BASE_URL}/api/proxy/official-document-categories`;
  const { res, json, text } = await fetchJson(createUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_ID,
    },
    body: JSON.stringify(createBody),
  });
  if (!res.ok) {
    throw new Error(`Create category failed (${res.status}) for "${categoryLabel}": ${text.slice(0, 280)}`);
  }
  maps.bySlug.set(slug, json);
  maps.byLabel.set(normalizedLabel, json);
  return json;
}

async function uploadSingleFile(filePath, payload) {
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.append('tenantId', TENANT_ID);
  form.append('categorySlug', payload.categorySlug);
  form.append('officialDocumentYear', String(payload.year));
  form.append('isPublic', 'true');
  form.append('title', payload.fileTitle);
  form.append('description', payload.description);
  form.append('file', new Blob([bytes]), payload.fileName);

  const uploadUrl = `${APP_BASE_URL}/api/proxy/event-medias/upload/tenant-official-document`;
  const { res, json, text } = await fetchJson(uploadUrl, {
    method: 'POST',
    headers: { 'X-Tenant-ID': TENANT_ID },
    body: form,
  });
  if (!res.ok) {
    const detail =
      json && typeof json === 'object'
        ? JSON.stringify(json, null, 2)
        : text || '';
    throw new Error(`Upload failed (${res.status}) for "${filePath}": ${detail.slice(0, 12000)}`);
  }
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error(
      `Upload succeeded (${res.status}) but body is not a single EventMediaDTO object (see PRD_FRONTEND.md).`
    );
  }
  return json;
}

/** GET current row — fuller than upload JSON when Jackson omits nulls on POST response. */
async function fetchEventMediaById(id) {
  const url = `${APP_BASE_URL}/api/proxy/event-medias/${id}`;
  const { res, json } = await fetchJson(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_ID,
    },
  });
  if (!res.ok || json == null || typeof json !== 'object' || Array.isArray(json)) {
    return null;
  }
  return json;
}

async function patchUploadedMedia(media, payload) {
  const id = Number(media?.id);
  if (!Number.isFinite(id) || id <= 0) return;
  const patchUrl = `${APP_BASE_URL}/api/proxy/event-medias/${id}`;
  const fromGet = await fetchEventMediaById(id);
  if (!fromGet) {
    console.warn(`[patch] GET event-medias/${id} did not return a body; relying on upload response only.`);
  }
  // Merge GET + upload: backend merge-patch needs all @NotNull fields present in JSON; upload alone may omit keys.
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
  const { res, text, json } = await fetchJson(patchUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      'X-Tenant-ID': TENANT_ID,
    },
    body: JSON.stringify(patchBody),
  });
  if (!res.ok) {
    const detail =
      json && typeof json === 'object'
        ? JSON.stringify(json, null, 2)
        : text || '';
    throw new Error(`Patch failed (${res.status}) for media ${id}: ${detail.slice(0, 12000)}`);
  }
}

async function main() {
  const raw = await readFile(REPORT_PATH, 'utf8');
  const report = JSON.parse(raw);
  const logs = Array.isArray(report?.logs) ? report.logs : [];
  const fileLogs = logs.filter((x) => x?.type === 'file' && x?.ok === true && typeof x?.destPath === 'string');
  const selected = BATCH_LIMIT > 0 ? fileLogs.slice(0, BATCH_LIMIT) : fileLogs;
  const maps = await ensureCategoriesMap();
  const uniqueCategoryLabels = Array.from(
    new Set(
      selected
        .map((row) => toRelativeTreePath(String(row.destPath)))
        .map((rel) => rel.split(/[\\/]+/).filter(Boolean)[0])
        .filter(Boolean)
    )
  );

  const missingBeforeRun = uniqueCategoryLabels
    .map((label) => ({ label, slug: slugify(label) }))
    .filter(({ label, slug }) => !maps.byLabel.has(label.trim().toLowerCase()) && !maps.bySlug.has(slug));

  if (missingBeforeRun.length > 0 && !AUTO_CREATE_CATEGORIES) {
    console.error(
      `[fatal] ${missingBeforeRun.length} category labels are missing in backend and auto-create is disabled.`
    );
    for (const item of missingBeforeRun.slice(0, 50)) {
      console.error(`  - ${item.label} (slug: ${item.slug})`);
    }
    if (missingBeforeRun.length > 50) {
      console.error(`  ... and ${missingBeforeRun.length - 50} more`);
    }
    console.error(
      'Create categories first in /admin/official-document-categories, then rerun upload.'
    );
    process.exitCode = 1;
    return;
  }
  const dedupeCache = new Map();

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (let idx = 0; idx < selected.length; idx += 1) {
    const row = selected[idx];
    const absolutePath = String(row.destPath);
    const relativeTreePath = toRelativeTreePath(absolutePath);
    const segments = relativeTreePath.split(/[\\/]+/).filter(Boolean);
    if (segments.length < 2) {
      skipped += 1;
      continue;
    }
    const categoryLabel = segments[0];
    const treePath = segments.slice(1).join('\\');
    const fileName = segments[segments.length - 1];
    const fileTitle = fileName.replace(/\.[^.]+$/, '');
    const year = yearFromUrl(row.url);
    const priority = Math.max(0, idx);

    try {
      const category = await ensureCategory(categoryLabel, maps);
      const categorySlug = String(category?.slug || slugify(categoryLabel));
      const categoryId = Number(category?.id || 0) || null;
      const description = buildDescription({ categoryLabel, treePath, priority });
      const dedupeBucketKey = `${categoryId || 0}:${year}`;

      if (categoryId) {
        if (!dedupeCache.has(dedupeBucketKey)) {
          const existingSet = await fetchExistingHierarchySet(categoryId, year);
          dedupeCache.set(dedupeBucketKey, existingSet);
        }
        const existing = dedupeCache.get(dedupeBucketKey);
        if (existing.has(treePath.toLowerCase())) {
          skipped += 1;
          console.log(`[skip-duplicate] ${idx + 1}/${selected.length}: ${treePath}`);
          continue;
        }
      }

      if (DRY_RUN) {
        console.log(`[dry-run] ${idx + 1}/${selected.length} -> ${categorySlug}/${year}/${treePath}`);
        ok += 1;
        continue;
      }

      const uploaded = await uploadSingleFile(absolutePath, {
        categorySlug,
        year,
        fileName,
        fileTitle,
        description,
      });
      await patchUploadedMedia(uploaded, {
        year,
        fileTitle,
        description,
        treePath,
        categoryLabel,
        categoryId,
        priority,
      });

      if (categoryId && dedupeCache.has(dedupeBucketKey)) {
        dedupeCache.get(dedupeBucketKey).add(treePath.toLowerCase());
      }
      ok += 1;
      console.log(`[ok] ${idx + 1}/${selected.length}: ${relativeTreePath}`);
    } catch (error) {
      failed += 1;
      console.error(`[error] ${idx + 1}/${selected.length}: ${relativeTreePath}`, String(error));
    }
  }

  console.log(`Done. success=${ok}, failed=${failed}, skipped=${skipped}, total=${selected.length}`);
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exitCode = 1;
});

