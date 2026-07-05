#!/usr/bin/env node
/**
 * Re-upload MA 2022-2027 manifest items whose hierarchyPath is missing from DB
 * (after --force upload deleted primary rows when uploading (2) variants).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { DEFAULT_DOWNLOAD_ROOT } from './config.mjs';
import { apiFetch, assertEnv, TENANT_ID, API_BASE_URL } from './migration-api-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOAD_ROOT = (process.env.MOSC_DOWNLOAD_ROOT || DEFAULT_DOWNLOAD_ROOT).trim();
const UPLOAD_DELAY_MS = Number(process.env.MOSC_UPLOAD_DELAY_MS || '400');

const TREE_PATH_MARKER = '[[MOSC_TREE_PATH]]';
const TREE_PRIORITY_MARKER = '[[MOSC_PRIORITY]]';
const TREE_CATEGORY_LABEL_MARKER = '[[MOSC_CATEGORY_LABEL]]';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toS3SafeTitle(value, fallback = 'document') {
  const ascii = String(value || fallback)
    .normalize('NFKD')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
  return ascii || fallback;
}

function buildDescription({ categoryLabel, treePath, priority }) {
  return [
    `${TREE_CATEGORY_LABEL_MARKER} ${categoryLabel}`,
    `${TREE_PATH_MARKER} ${treePath}`,
    `${TREE_PRIORITY_MARKER} ${priority}`,
  ].join('\n');
}

function guessContentType(fileName) {
  return fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
}

function getExistingPaths() {
  const sql = `SELECT hierarchy_path FROM event_media WHERE hierarchy_category_label = 'Malankara Association (2022 - 2027)' AND tenant_id = 'mosc_malankara_orthodox_2'`;
  const raw = execSync(
    `docker exec event_site_manager_db-postgresql-1 psql -U event_site_admin -d event_site_manager_db -t -A -c "${sql}"`,
    { encoding: 'utf8' }
  );
  return new Set(raw.trim().split(/\r?\n/).filter(Boolean));
}

async function ensureCategoriesMap() {
  const { res, json } = await apiFetch('/api/official-document-categories?size=500', {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to load categories');
  const rows = Array.isArray(json) ? json : json?.content || [];
  const bySlug = new Map();
  for (const row of rows) {
    if (row?.slug) bySlug.set(String(row.slug).toLowerCase(), row);
  }
  return bySlug;
}

async function uploadItem(item, categoryId, priority) {
  const filePath = path.join(
    DOWNLOAD_ROOT,
    item.categorySlug,
    String(item.year),
    item.filename
  );
  const bytes = await readFile(filePath);
  const categoryLabel = item.displayName || 'Malankara Association (2022 - 2027)';
  const treePath = item.hierarchyPath;
  const fileTitle = toS3SafeTitle(treePath, item.filename.replace(/\.[^.]+$/, ''));
  const description = buildDescription({ categoryLabel, treePath, priority });

  const form = new FormData();
  form.append('tenantId', TENANT_ID);
  form.append('categorySlug', item.categorySlug);
  form.append('officialDocumentYear', String(item.year));
  form.append('isPublic', 'true');
  form.append('title', fileTitle);
  form.append('description', description);
  form.append('hierarchyPath', treePath);
  form.append('hierarchyCategoryLabel', categoryLabel);
  form.append('displayPriority', String(priority));
  form.append('file', new File([bytes], item.filename, { type: guessContentType(item.filename) }));

  const { res, json, text } = await apiFetch(`${API_BASE_URL}/api/event-medias/upload/tenant-official-document`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${text.slice(0, 2000)}`);
  }
  return json;
}

async function main() {
  assertEnv();
  const manifestPath = path.join(__dirname, 'url-list.ma-2022-2027-fix.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const items = manifest.items || [];
  const existing = getExistingPaths();
  const missing = items.filter((i) => !existing.has(i.hierarchyPath));

  console.log(`Existing paths: ${existing.size}, manifest: ${items.length}, missing: ${missing.length}`);
  if (missing.length === 0) {
    console.log('Nothing to upload.');
    return;
  }

  const categories = await ensureCategoriesMap();
  const cat = categories.get('malankara-association-2022-2027');
  if (!cat?.id) throw new Error('Category malankara-association-2022-2027 not found');

  let ok = 0;
  let failed = 0;
  for (let idx = 0; idx < missing.length; idx++) {
    const item = missing[idx];
    const priority = 90 + idx;
    try {
      const uploaded = await uploadItem(item, cat.id, priority);
      ok += 1;
      console.log(`[ok] ${idx + 1}/${missing.length}: ${item.hierarchyPath} -> id=${uploaded?.id}`);
    } catch (err) {
      failed += 1;
      console.error(`[error] ${item.hierarchyPath}:`, String(err));
    }
    if (UPLOAD_DELAY_MS > 0 && idx < missing.length - 1) await sleep(UPLOAD_DELAY_MS);
  }

  const after = getExistingPaths();
  console.log(`Done. success=${ok}, failed=${failed}, paths now=${after.size}`);
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exitCode = 1;
});
