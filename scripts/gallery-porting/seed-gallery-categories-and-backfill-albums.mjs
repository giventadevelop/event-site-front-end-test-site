#!/usr/bin/env node
/**
 * Seed gallery_category rows (if missing) and backfill galleryCategoryId on imported albums.
 *
 * Usage:
 *   node scripts/gallery-porting/seed-gallery-categories-and-backfill-albums.mjs
 *   node scripts/gallery-porting/seed-gallery-categories-and-backfill-albums.mjs --dry-run
 *
 * Env (.env.local): NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TENANT_ID, API_JWT_USER, API_JWT_PASS
 */
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import {
  TENANT_ID,
  GALLERY_CATEGORY_SEEDS,
  assertEnv,
  getServiceJwt,
  apiFetch,
  parseStaticSlugFromDescription,
} from './gallery-porting-lib.mjs';
import {
  eventFieldsFromManifestAlbum,
  albumNeedsManifestPatch,
} from './parse-manifest-album-date.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const MANIFEST_PATH = resolve('scripts/gallery-porting/static-gallery-manifest.json');
const REPORT_PATH = resolve('scripts/gallery-porting/category-backfill-report.json');

function normalizeDisplayName(name) {
  return (name || '').trim().toLowerCase();
}

const SEED_SLUGS = new Set(GALLERY_CATEGORY_SEEDS.map((s) => s.slug));
const SEED_DISPLAY_NAME_TO_SLUG = new Map(
  GALLERY_CATEGORY_SEEDS.map((s) => [normalizeDisplayName(s.displayName), s.slug]),
);

async function fetchAllGalleryCategories(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    sort: 'id,asc',
    size: '200',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-categories?${qs}`);
  if (!res.ok) throw new Error(`gallery-categories list failed: ${res.status}`);
  return Array.isArray(json) ? json : json?.content || [];
}

function buildCategoriesBySlug(rows) {
  const bySlug = new Map();
  for (const row of rows) {
    if (row?.slug) bySlug.set(row.slug, row);
  }
  return bySlug;
}

async function fetchGalleryCategories(token) {
  const rows = await fetchAllGalleryCategories(token);
  return buildCategoriesBySlug(rows);
}

/** Resolve duplicate category rows (same slug or same seed displayName) → one canonical row per seed slug. */
async function deduplicateGalleryCategories(token, albums) {
  const all = await fetchAllGalleryCategories(token);
  const canonicalBySeedSlug = new Map();
  const duplicateIds = new Set();

  for (const seed of GALLERY_CATEGORY_SEEDS) {
    const sameSlug = all.filter((r) => r.slug === seed.slug);
    sameSlug.sort((a, b) => a.id - b.id);
    if (sameSlug.length) {
      canonicalBySeedSlug.set(seed.slug, sameSlug[0]);
      for (let i = 1; i < sameSlug.length; i++) duplicateIds.add(sameSlug[i].id);
    }
  }

  for (const row of all) {
    const seedSlug = SEED_DISPLAY_NAME_TO_SLUG.get(normalizeDisplayName(row.displayName));
    if (!seedSlug) continue;
    const canonical = canonicalBySeedSlug.get(seedSlug);
    if (canonical && row.id !== canonical.id) duplicateIds.add(row.id);
    else if (!canonical) canonicalBySeedSlug.set(seedSlug, row);
  }

  const report = { albumsReassigned: [], categoriesDeleted: [], categoriesSkipped: [] };
  if (!duplicateIds.size) return { categoriesBySlug: buildCategoriesBySlug(all), dedupe: report };

  const idToCanonical = new Map();
  for (const dupId of duplicateIds) {
    const dup = all.find((r) => r.id === dupId);
    if (!dup) continue;
    const seedSlug =
      SEED_DISPLAY_NAME_TO_SLUG.get(normalizeDisplayName(dup.displayName)) ||
      (SEED_SLUGS.has(dup.slug) ? dup.slug : null);
    const canonical = seedSlug ? canonicalBySeedSlug.get(seedSlug) : null;
    if (!canonical) {
      report.categoriesSkipped.push({ id: dupId, reason: 'no canonical seed match' });
      continue;
    }
    idToCanonical.set(dupId, canonical);
  }

  for (const album of albums) {
    const canonical = idToCanonical.get(album.galleryCategoryId);
    if (!canonical) continue;
    await patchAlbumCategoryOnly(token, album, canonical.id);
    report.albumsReassigned.push({
      albumId: album.id,
      fromCategoryId: album.galleryCategoryId,
      toCategoryId: canonical.id,
    });
    console.log(
      `  ✓ Reassigned album ${album.id} category ${album.galleryCategoryId} → ${canonical.id} (${canonical.slug})`,
    );
  }

  for (const dupId of duplicateIds) {
    if (!idToCanonical.has(dupId)) continue;
    if (DRY_RUN) {
      console.log(`  [dry-run] DELETE gallery-category id=${dupId}`);
      report.categoriesDeleted.push({ id: dupId });
      continue;
    }
    const { res, text } = await apiFetch(token, `/api/gallery-categories/${dupId}`, { method: 'DELETE' });
    if (!res.ok) {
      report.categoriesSkipped.push({ id: dupId, reason: `delete failed: ${res.status} ${text}` });
      console.warn(`  ⚠ Could not delete category id=${dupId}: ${res.status}`);
      continue;
    }
    report.categoriesDeleted.push({ id: dupId });
    console.log(`  ✓ Deleted duplicate category id=${dupId}`);
  }

  const remaining = await fetchAllGalleryCategories(token);
  return { categoriesBySlug: buildCategoriesBySlug(remaining), dedupe: report };
}

async function seedGalleryCategories(token, categoriesBySlug) {
  const created = [];
  for (const seed of GALLERY_CATEGORY_SEEDS) {
    if (categoriesBySlug.has(seed.slug)) {
      console.log(`  • ${seed.slug} already exists (id=${categoriesBySlug.get(seed.slug).id})`);
      continue;
    }

    const now = new Date().toISOString();
    const payload = {
      tenantId: TENANT_ID,
      slug: seed.slug,
      displayName: seed.displayName,
      description: seed.description,
      sortOrder: seed.sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    if (DRY_RUN) {
      console.log(`  [dry-run] POST gallery-category ${seed.slug}`);
      categoriesBySlug.set(seed.slug, { id: -1, ...payload });
      created.push(seed.slug);
      continue;
    }

    const { res, text, json } = await apiFetch(token, '/api/gallery-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`create category "${seed.slug}": ${res.status} ${text}`);
    }

    categoriesBySlug.set(seed.slug, json);
    created.push(seed.slug);
    console.log(`  ✓ Created category ${seed.slug} → id=${json.id}`);
  }
  return created;
}

async function fetchGalleryAlbums(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    sort: 'displayOrder,asc',
    size: '500',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-albums?${qs}`);
  if (!res.ok) throw new Error(`gallery-albums list failed: ${res.status}`);
  return Array.isArray(json) ? json : json?.content || [];
}

async function patchAlbumCategoryOnly(token, album, categoryId) {
  const payload = {
    id: album.id,
    galleryCategoryId: categoryId,
    updatedAt: new Date().toISOString(),
  };

  if (DRY_RUN) {
    console.log(`  [dry-run] PATCH album ${album.id} → galleryCategoryId=${categoryId}`);
    return;
  }

  const { res, text } = await apiFetch(token, `/api/gallery-albums/${album.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`patch album ${album.id}: ${res.status} ${text}`);
  }
}

async function patchAlbumFromManifest(token, album, categoryId, meta) {
  const fields = eventFieldsFromManifestAlbum(meta);
  const payload = {
    id: album.id,
    galleryCategoryId: categoryId,
    updatedAt: new Date().toISOString(),
  };

  if (fields.albumYear != null) payload.albumYear = fields.albumYear;
  if (fields.eventDateStart != null) payload.eventDateStart = fields.eventDateStart;
  if (fields.eventDateEnd != null) payload.eventDateEnd = fields.eventDateEnd;
  if (fields.eventLocation != null) payload.eventLocation = fields.eventLocation;

  if (DRY_RUN) {
    console.log(`  [dry-run] PATCH album ${album.id}`, payload);
    return fields;
  }

  const { res, text } = await apiFetch(token, `/api/gallery-albums/${album.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`patch album ${album.id}: ${res.status} ${text}`);
  }

  return fields;
}

async function main() {
  assertEnv();
  console.log(`Gallery category seed + album backfill (dry-run=${DRY_RUN})`);

  const manifestRaw = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const manifest = Array.isArray(manifestRaw) ? manifestRaw : manifestRaw.albums || [];
  const metaBySlug = new Map(manifest.map((a) => [a.slug, a]));

  const token = DRY_RUN ? null : await getServiceJwt();

  const albums = DRY_RUN ? [] : await fetchGalleryAlbums(token);

  console.log('\nStep 1: Deduplicate gallery_category rows (one row per seed slug / display name)');
  let categoriesBySlug = DRY_RUN ? new Map() : buildCategoriesBySlug(await fetchAllGalleryCategories(token));
  let dedupeReport = { albumsReassigned: [], categoriesDeleted: [], categoriesSkipped: [] };
  if (!DRY_RUN) {
    const dedupe = await deduplicateGalleryCategories(token, albums);
    categoriesBySlug = dedupe.categoriesBySlug;
    dedupeReport = dedupe.dedupe;
    console.log(
      `  Deduped: ${dedupeReport.categoriesDeleted.length} removed, ${dedupeReport.albumsReassigned.length} album(s) reassigned`,
    );
  }

  console.log('\nStep 2: Seed gallery_category rows');
  const createdSlugs = await seedGalleryCategories(token, categoriesBySlug);
  console.log(`  Categories ready: ${categoriesBySlug.size} (${createdSlugs.length} created)`);

  console.log('\nStep 3: Backfill galleryCategoryId, albumYear, and event date/location on albums');
  const albumsForBackfill = DRY_RUN ? [] : await fetchGalleryAlbums(token);
  const report = {
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    dedupe: dedupeReport,
    categoriesCreated: createdSlugs,
    albumsPatched: [],
    albumsSkipped: [],
    albumsMissingMeta: [],
  };

  for (const album of albumsForBackfill) {
    const staticSlug = parseStaticSlugFromDescription(album.description);
    if (!staticSlug) {
      report.albumsSkipped.push({ id: album.id, title: album.title, reason: 'no static_slug in description' });
      continue;
    }

    const meta = metaBySlug.get(staticSlug);
    if (!meta?.categorySlug) {
      report.albumsMissingMeta.push({ id: album.id, staticSlug, title: album.title });
      continue;
    }

    const category = categoriesBySlug.get(meta.categorySlug);
    if (!category?.id) {
      report.albumsMissingMeta.push({ id: album.id, staticSlug, categorySlug: meta.categorySlug });
      continue;
    }

    const fields = eventFieldsFromManifestAlbum(meta);
    if (!albumNeedsManifestPatch(album, category.id, fields)) {
      report.albumsSkipped.push({ id: album.id, staticSlug, reason: 'already up to date' });
      continue;
    }

    try {
      const patchedFields = await patchAlbumFromManifest(token, album, category.id, meta);
      report.albumsPatched.push({
        id: album.id,
        staticSlug,
        galleryCategoryId: category.id,
        categorySlug: meta.categorySlug,
        albumYear: patchedFields.albumYear,
        eventDateStart: patchedFields.eventDateStart,
        eventDateEnd: patchedFields.eventDateEnd,
        eventLocation: patchedFields.eventLocation,
      });
      console.log(
        `  ✓ ${staticSlug} (id=${album.id}) → category ${meta.categorySlug}, year=${patchedFields.albumYear ?? '—'}, dates=${patchedFields.eventDateStart ?? '—'}..${patchedFields.eventDateEnd ?? '—'}, loc=${patchedFields.eventLocation ?? '—'}`,
      );
    } catch (err) {
      report.albumsSkipped.push({ id: album.id, staticSlug, reason: `patch failed: ${err.message}` });
      console.warn(`  ⚠ ${staticSlug} (id=${album.id}): ${err.message}`);
    }
  }

  report.finishedAt = new Date().toISOString();
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\nDone: ${report.albumsPatched.length} album(s) patched, ${report.albumsSkipped.length} skipped`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
