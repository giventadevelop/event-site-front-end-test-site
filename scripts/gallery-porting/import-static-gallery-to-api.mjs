#!/usr/bin/env node
/**
 * Import static MOSC gallery albums + photos into dynamic gallery API (no backend code changes).
 *
 * Uses service JWT + tenant from .env.local (same pattern as promote-profile-admin.mjs).
 *
 * Usage:
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --dry-run
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --albums-only
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --media-only
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --slug russia-visit
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --limit 3 --batch-size 10
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --media-mode file
 *   node scripts/gallery-porting/import-static-gallery-to-api.mjs --manifest scripts/gallery-porting/static-gallery-manifest.json
 *
 * Env (.env.local):
 *   NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TENANT_ID, API_JWT_USER, API_JWT_PASS
 *   MOSC_APP_BASE_URL or NEXT_PUBLIC_APP_URL (for --media-mode file uploads via Next proxy)
 */
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, join, basename } from 'path';
import {
  APP_BASE_URL,
  TENANT_ID,
  GALLERY_CATEGORY_SEEDS,
  apiFetch,
  assertEnv,
  buildAlbumManifest,
  getServiceJwt,
  guessContentType,
  parseStaticSlugFromDescription,
  sleep,
} from './gallery-porting-lib.mjs';
import {
  eventFieldsFromManifestAlbum,
  albumNeedsManifestPatch,
} from './parse-manifest-album-date.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const ALBUMS_ONLY = process.argv.includes('--albums-only');
const MEDIA_ONLY = process.argv.includes('--media-only');
const SKIP_EXISTING = !process.argv.includes('--force');

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const SLUG_FILTER = argValue('--slug', null);
const LIMIT = Number(argValue('--limit', '0')) || 0;
const BATCH_SIZE = Math.max(1, Number(argValue('--batch-size', '8')) || 8);
const MEDIA_MODE = argValue('--media-mode', 'url');
const MANIFEST_PATH = argValue('--manifest', null);
const REPORT_PATH = argValue(
  '--report',
  resolve('scripts/gallery-porting/import-report.json')
);

async function loadManifest() {
  if (MANIFEST_PATH) {
    const raw = JSON.parse(await readFile(resolve(MANIFEST_PATH), 'utf8'));
    return Array.isArray(raw) ? raw : raw.albums || [];
  }
  return buildAlbumManifest();
}

async function fetchGalleryCategories(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    'isActive.equals': 'true',
    sort: 'sortOrder,asc',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-categories?${qs}`);
  if (!res.ok) throw new Error(`gallery-categories list failed: ${res.status}`);
  const rows = Array.isArray(json) ? json : json?.content || [];
  const bySlug = new Map();
  for (const row of rows) {
    if (row?.slug) bySlug.set(row.slug, row);
  }
  return bySlug;
}

async function ensureGalleryCategories(token, categoriesBySlug) {
  let created = 0;
  for (const seed of GALLERY_CATEGORY_SEEDS) {
    if (categoriesBySlug.has(seed.slug)) continue;

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
      created++;
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
    created++;
    console.log(`  ✓ Seeded category ${seed.slug} → id=${json.id}`);
  }
  if (created > 0) {
    console.log(`Seeded ${created} gallery categor${created === 1 ? 'y' : 'ies'}`);
  }
}

async function patchAlbumFromManifest(token, albumId, albumMeta, categoryId) {
  const fields = eventFieldsFromManifestAlbum(albumMeta);
  const now = new Date().toISOString();
  const payload = {
    id: albumId,
    galleryCategoryId: categoryId,
    updatedAt: now,
  };
  if (fields.albumYear != null) payload.albumYear = fields.albumYear;
  if (fields.eventDateStart != null) payload.eventDateStart = fields.eventDateStart;
  if (fields.eventDateEnd != null) payload.eventDateEnd = fields.eventDateEnd;
  if (fields.eventLocation != null) payload.eventLocation = fields.eventLocation;

  if (DRY_RUN) {
    console.log(`  [dry-run] PATCH album ${albumId}`, payload);
    return;
  }

  const { res, text } = await apiFetch(token, `/api/gallery-albums/${albumId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`patch album ${albumId}: ${res.status} ${text}`);
}

async function fetchGalleryAlbums(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    size: '200',
    sort: 'displayOrder,asc',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-albums?${qs}`);
  if (!res.ok) throw new Error(`gallery-albums list failed: ${res.status}`);
  return Array.isArray(json) ? json : json?.content || [];
}

function indexAlbumsByStaticSlug(albums) {
  const map = new Map();
  for (const album of albums) {
    const slug = parseStaticSlugFromDescription(album.description);
    if (slug) map.set(slug, album);
  }
  return map;
}

async function createAlbum(token, albumMeta, categoryId, displayOrder) {
  const fields = eventFieldsFromManifestAlbum(albumMeta);
  const now = new Date().toISOString();
  const payload = {
    tenantId: TENANT_ID,
    title: albumMeta.title,
    description: albumMeta.description,
    coverImageUrl: albumMeta.coverImageUrl,
    isPublic: true,
    displayOrder,
    albumYear: fields.albumYear ?? albumMeta.albumYear,
    galleryCategoryId: categoryId,
    createdAt: now,
    updatedAt: now,
  };
  if (fields.eventDateStart != null) payload.eventDateStart = fields.eventDateStart;
  if (fields.eventDateEnd != null) payload.eventDateEnd = fields.eventDateEnd;
  if (fields.eventLocation != null) payload.eventLocation = fields.eventLocation;

  if (DRY_RUN) {
    console.log('[dry-run] POST gallery-album', payload.title);
    return { id: -1, ...payload };
  }

  const { res, text, json } = await apiFetch(token, '/api/gallery-albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create album "${albumMeta.title}": ${res.status} ${text}`);
  return json;
}

async function fetchAlbumMediaCount(token, albumId) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    'albumId.equals': String(albumId),
    'isPublic.equals': 'true',
    size: '1',
  });
  const { res, json } = await apiFetch(token, `/api/event-medias?${qs}`);
  if (!res.ok) return 0;
  const total = Number(res.headers.get('x-total-count') || '0');
  if (total > 0) return total;
  const rows = Array.isArray(json) ? json : json?.content || [];
  return rows.length;
}

async function createMediaUrl(token, albumId, photo, displayOrder) {
  const now = new Date().toISOString();
  const title = basename(photo.src);
  const payload = {
    tenantId: TENANT_ID,
    title,
    description: photo.alt || title,
    eventMediaType: guessContentType(photo.src),
    storageType: 'URL',
    fileUrl: photo.src,
    albumId,
    eventId: null,
    isPublic: true,
    displayOrder,
    altText: photo.alt || title,
    isHomePageHeroImage: false,
    isFeaturedEventImage: false,
    isLiveEventImage: false,
    startDisplayingFromDate: now,
    createdAt: now,
    updatedAt: now,
  };

  if (DRY_RUN) {
    console.log(`  [dry-run] POST event-media ${photo.src}`);
    return { id: -displayOrder, fileUrl: photo.src };
  }

  let { res, text, json } = await apiFetch(token, '/api/event-medias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok && /storageType|storage_type/i.test(text)) {
    payload.storageType = 'S3';
    ({ res, text, json } = await apiFetch(token, '/api/event-medias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }));
  }

  if (!res.ok) throw new Error(`create media ${photo.src}: ${res.status} ${text.slice(0, 240)}`);
  return json;
}

async function uploadMediaFile(token, albumId, photo, displayOrder) {
  const localPath = join(process.cwd(), 'public', photo.src.replace(/^\//, ''));
  if (!existsSync(localPath)) {
    throw new Error(`file missing: ${localPath}`);
  }

  const title = basename(photo.src);
  if (DRY_RUN) {
    console.log(`  [dry-run] upload ${localPath}`);
    return { id: -displayOrder, fileUrl: photo.src };
  }

  const bytes = await readFile(localPath);
  const form = new FormData();
  form.append('files', new Blob([bytes], { type: guessContentType(localPath) }), basename(localPath));
  form.append('titles', title);
  form.append('descriptions', photo.alt || title);
  form.append('tenantId', TENANT_ID);
  form.append('isPublic', 'true');
  form.append('albumId', String(albumId));
  form.append('eventId', '');
  form.append('displayOrder', String(displayOrder));
  form.append('startDisplayingFromDate', new Date().toISOString());

  const url = `${APP_BASE_URL}/api/proxy/event-medias/upload-multiple`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'X-Tenant-ID': TENANT_ID },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`upload ${photo.src}: ${res.status} ${text.slice(0, 240)}`);

  let uploaded = [];
  try {
    uploaded = JSON.parse(text);
  } catch {
    uploaded = [];
  }
  const media = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  if (!media?.id) return media;

  await apiFetch(token, `/api/event-medias/${media.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({
      id: media.id,
      albumId,
      eventId: null,
      displayOrder,
      updatedAt: new Date().toISOString(),
    }),
  });

  return media;
}

async function importAlbumMedia(token, albumId, photos) {
  let created = 0;
  let failed = 0;

  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    for (let j = 0; j < batch.length; j++) {
      const photo = batch[j];
      const displayOrder = i + j + 1;
      try {
        if (MEDIA_MODE === 'file') {
          await uploadMediaFile(token, albumId, photo, displayOrder);
        } else {
          await createMediaUrl(token, albumId, photo, displayOrder);
        }
        created++;
      } catch (err) {
        failed++;
        console.error(`  ✗ ${photo.src}: ${err.message}`);
      }
    }
    if (i + BATCH_SIZE < photos.length) await sleep(300);
  }

  return { created, failed };
}

async function main() {
  assertEnv();
  let manifest = await loadManifest();

  if (SLUG_FILTER) {
    manifest = manifest.filter((a) => a.slug === SLUG_FILTER);
    if (manifest.length === 0) throw new Error(`No album for slug: ${SLUG_FILTER}`);
  }
  if (LIMIT > 0) manifest = manifest.slice(0, LIMIT);

  console.log(`Gallery import: ${manifest.length} album(s), media-mode=${MEDIA_MODE}, dry-run=${DRY_RUN}`);

  const token = DRY_RUN ? null : await getServiceJwt();
  const categoriesBySlug = DRY_RUN ? new Map() : await fetchGalleryCategories(token);
  if (!DRY_RUN) {
    await ensureGalleryCategories(token, categoriesBySlug);
  }
  const existingAlbums = DRY_RUN ? [] : await fetchGalleryAlbums(token);
  const albumsBySlug = indexAlbumsByStaticSlug(existingAlbums);

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    mediaMode: MEDIA_MODE,
    albums: [],
  };

  let displayOrderBase = 10;

  for (const albumMeta of manifest) {
    const categoryId = albumMeta.categorySlug
      ? categoriesBySlug.get(albumMeta.categorySlug)?.id ?? null
      : null;

    if (!categoryId && albumMeta.categorySlug) {
      console.warn(`  ⚠ No category id for slug ${albumMeta.categorySlug} (${albumMeta.category})`);
    }

    let album = albumsBySlug.get(albumMeta.slug);
    const albumReport = {
      slug: albumMeta.slug,
      title: albumMeta.title,
      photoCount: albumMeta.photos.length,
      albumId: album?.id ?? null,
      createdAlbum: false,
      mediaCreated: 0,
      mediaFailed: 0,
      skipped: false,
    };

    if (!MEDIA_ONLY) {
      if (album && SKIP_EXISTING) {
        console.log(`• ${albumMeta.slug}: album exists (id=${album.id}), skipping create`);
        const fields = eventFieldsFromManifestAlbum(albumMeta);
        if (
          categoryId &&
          albumNeedsManifestPatch(album, categoryId, fields)
        ) {
          await patchAlbumFromManifest(token, album.id, albumMeta, categoryId);
          console.log(
            `  ✓ Updated album ${albumMeta.slug} (category + event dates/location)`,
          );
        }
      } else if (!album) {
        album = await createAlbum(token, albumMeta, categoryId, displayOrderBase);
        albumsBySlug.set(albumMeta.slug, album);
        albumReport.createdAlbum = true;
        albumReport.albumId = album.id;
        console.log(`✓ Created album ${albumMeta.slug} → id=${album.id}`);
      }
      displayOrderBase += 10;
    } else if (!album) {
      console.warn(`• ${albumMeta.slug}: no existing album — run without --media-only first`);
      albumReport.skipped = true;
      report.albums.push(albumReport);
      continue;
    } else {
      albumReport.albumId = album.id;
    }

    if (!ALBUMS_ONLY && album?.id) {
      const existingMedia = DRY_RUN ? 0 : await fetchAlbumMediaCount(token, album.id);
      if (existingMedia > 0 && SKIP_EXISTING) {
        console.log(`  ↷ ${albumMeta.slug}: ${existingMedia} media row(s) exist, skipping photos`);
        albumReport.skipped = true;
      } else if (albumMeta.photos.length === 0) {
        console.warn(`  ⚠ ${albumMeta.slug}: no photos in manifest`);
      } else {
        console.log(`  → Importing ${albumMeta.photos.length} photo(s) for ${albumMeta.slug}…`);
        const { created, failed } = await importAlbumMedia(token, album.id, albumMeta.photos);
        albumReport.mediaCreated = created;
        albumReport.mediaFailed = failed;
        console.log(`  ✓ ${albumMeta.slug}: ${created} created, ${failed} failed`);
      }
    }

    report.albums.push(albumReport);
  }

  report.finishedAt = new Date().toISOString();
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReport written: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
