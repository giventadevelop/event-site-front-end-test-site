#!/usr/bin/env node
/**
 * Remove all Catholicate Day Book Cover, Brochure rows before CDC fix re-upload.
 * Also removes id 789 (mislabeled CDC duplicate under Official circulars).
 */
import { API_BASE_URL, TENANT_ID, apiFetch, assertEnv } from './migration-api-lib.mjs';

const CATEGORY_SLUG = 'catholicate-day-book-cover-brochure';
const MISLABELED_CIRCULARS_ID = 789;

async function fetchCategoryIdBySlug(slug) {
  const params = new URLSearchParams();
  params.append('tenantId.equals', TENANT_ID);
  params.append('slug.equals', slug);
  params.append('size', '5');
  const { res, json } = await apiFetch(`/api/official-document-categories?${params}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`categories fetch failed ${res.status}`);
  const rows = Array.isArray(json) ? json : json?.content ?? [];
  const match = rows.find((r) => r.slug === slug);
  return match?.id ?? null;
}

async function fetchAllOfficialDocs() {
  const out = [];
  let page = 0;
  const size = 500;
  while (true) {
    const params = new URLSearchParams();
    params.append('tenantId.equals', TENANT_ID);
    params.append('eventMediaType.equals', 'TENANT_OFFICIAL_DOCUMENT');
    params.append('page', String(page));
    params.append('size', String(size));
    params.append('sort', 'id,asc');
    const { res, json } = await apiFetch(`/api/event-medias?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`event-medias fetch failed ${res.status}`);
    const batch = Array.isArray(json) ? json : json?.content ?? [];
    out.push(...batch);
    if (batch.length < size) break;
    page += 1;
  }
  return out;
}

async function deleteMedia(id) {
  const { res, text } = await apiFetch(`/api/event-medias/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    throw new Error(`delete ${id} failed (${res.status}): ${text.slice(0, 240)}`);
  }
  console.log(`[deleted] id=${id}`);
}

async function main() {
  assertEnv();
  console.log(`API: ${API_BASE_URL} tenant: ${TENANT_ID}`);

  const categoryId = await fetchCategoryIdBySlug(CATEGORY_SLUG);
  if (!categoryId) throw new Error(`Category not found: ${CATEGORY_SLUG}`);

  const all = await fetchAllOfficialDocs();
  const toDelete = all.filter(
    (row) =>
      Number(row.officialDocumentCategoryId) === Number(categoryId) ||
      Number(row.id) === MISLABELED_CIRCULARS_ID
  );

  console.log(`Found ${toDelete.length} rows to delete (categoryId=${categoryId}, includes id ${MISLABELED_CIRCULARS_ID})`);
  for (const row of toDelete) {
    console.log(`  id=${row.id} title=${row.title} label=${row.hierarchyCategoryLabel ?? ''}`);
  }

  for (const row of toDelete) {
    await deleteMedia(Number(row.id));
  }

  console.log('Purge complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
