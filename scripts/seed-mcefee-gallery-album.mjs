#!/usr/bin/env node
/**
 * Create "Mcefee Album" and upload homepage + events page images (and logos)
 * into gallery_album + event_media via existing backend / Next proxy APIs.
 *
 * Does NOT modify application code. Reuses scripts/gallery-porting/gallery-porting-lib.mjs.
 *
 * Usage:
 *   node scripts/seed-mcefee-gallery-album.mjs
 *   node scripts/seed-mcefee-gallery-album.mjs --dry-run
 *   node scripts/seed-mcefee-gallery-album.mjs --app-url http://localhost:3002
 *   node scripts/seed-mcefee-gallery-album.mjs --force
 *   node scripts/seed-mcefee-gallery-album.mjs --link-only
 *
 * Env (.env.local): NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TENANT_ID, JWT creds
 * Requires Next.js running for multipart upload (--app-url, default http://localhost:3002).
 */
import { readdirSync, existsSync, readFileSync, statSync } from 'fs';
import { join, basename, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { File } from 'node:buffer';
import {
  TENANT_ID,
  API_BASE_URL,
  APP_BASE_URL as LIB_APP_BASE,
  apiFetch,
  assertEnv,
  getServiceJwt,
  guessContentType,
  sleep,
  GALLERY_CATEGORY_SEEDS,
} from './gallery-porting/gallery-porting-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const LINK_ONLY = process.argv.includes('--link-only');

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const APP_BASE_URL = (argValue('--app-url', null) || process.env.MOSC_APP_BASE_URL || 'http://localhost:3002').replace(
  /\/$/,
  ''
);
const ALBUM_TITLE = 'Mcefee Album';
const ALBUM_SLUG_MARKER = 'static_slug=mcefee-album';
const CATEGORY_SLUG = 'special-events';
const CHARITY_IMAGES =
  process.env.MCEFEE_EVENTS_IMAGE_DIR ||
  'F:\\project_workspace\\NJ-Malayalees-MCEEFEE-Charity-Site\\images';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

/** Local folders / files shown on modernist home + events (and related logos / flyers). */
function collectImageEntries() {
  const entries = [];
  const seen = new Set();

  function add(absPath, alt) {
    if (!absPath || !existsSync(absPath)) return;
    const st = statSync(absPath);
    if (!st.isFile()) return;
    const ext = extname(absPath).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return;
    const key = absPath.replace(/\\/g, '/').toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      absPath,
      fileName: basename(absPath),
      alt: alt || basename(absPath, ext).replace(/[_-]+/g, ' '),
    });
  }

  function addDir(dir, altPrefix) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      add(join(dir, name), `${altPrefix}: ${name}`);
    }
  }

  addDir(join(REPO_ROOT, 'public/images/modernist/mcefee'), 'MCEFEE modernist');
  addDir(join(REPO_ROOT, 'public/images/logos/Mcefee'), 'MCEFEE logo');
  add(join(REPO_ROOT, 'public/images/default event image.png'), 'Default event image');
  add(join(REPO_ROOT, 'public/images/default_placeholder_hero_image.jpeg'), 'Default hero placeholder');
  add(join(REPO_ROOT, 'public/images/hero_section/spark_kerala_event_2026_aug_wide.jpg'), 'Spark of Kerala wide');
  add(join(REPO_ROOT, 'public/images/mcefee_event/spark of kerala.jpg'), 'Spark of Kerala event');

  // Charity-site flyers used for seeded events / home banners
  const charityNames = [
    'spark_kerala_event_2026_aug_wide.jpg',
    'spark_kerala_event_2026_aug_thum_higgs.png',
    'spark_kerala_event_2026_fb_banner.jpg',
    'spark_kerala_event_2026_fb_banner_1.jpg',
    'spark_kerala_event_2026_1.jpg',
    'spark_kerala_event_2026.jpeg',
    'spark_kerala_event_2025.jpeg',
    'spark_kerala_event_2025_1.jpeg',
    'veena_concert_2026_wide.jpg',
    'veena_concert_2026.jpeg',
    'veena_concert_2026_wide_thumbnail.jpg',
  ];
  for (const name of charityNames) {
    add(join(CHARITY_IMAGES, name), `Event flyer: ${name}`);
  }

  return entries;
}

async function fetchCategories(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    sort: 'sortOrder,asc',
    size: '100',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-categories?${qs}`);
  if (!res.ok) throw new Error(`gallery-categories: ${res.status}`);
  const rows = Array.isArray(json) ? json : json?.content || [];
  return rows;
}

/** Prefer special-events; otherwise any existing category (avoid flaky sequence inserts). */
async function resolveCategoryId(token) {
  const rows = await fetchCategories(token);
  const preferred =
    rows.find((r) => r.slug === CATEGORY_SLUG) ||
    rows.find((r) => (r.displayName || '').toLowerCase() === 'special events') ||
    rows.find((r) => r.isActive !== false) ||
    rows[0];
  if (preferred?.id) {
    console.log(`✓ Using category id=${preferred.id} (${preferred.slug || preferred.displayName})`);
    return preferred.id;
  }

  const seed = GALLERY_CATEGORY_SEEDS.find((s) => s.slug === CATEGORY_SLUG) || {
    slug: CATEGORY_SLUG,
    displayName: 'Special Events',
    description: 'Special occasions',
    sortOrder: 50,
  };
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
    console.log('[dry-run] POST gallery-category', seed.slug);
    return -1;
  }
  const { res, text, json } = await apiFetch(token, '/api/gallery-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.ok && json?.id) {
    console.log(`✓ Created category ${seed.slug} id=${json.id}`);
    return json.id;
  }
  console.warn(`⚠ Category create failed (${res.status}); continuing with null category. ${text.slice(0, 160)}`);
  return null;
}

async function findExistingAlbum(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    'title.contains': 'Mcefee',
    size: '50',
    sort: 'id,desc',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-albums?${qs}`);
  if (!res.ok) return null;
  const rows = Array.isArray(json) ? json : json?.content || [];
  return (
    rows.find((a) => a.title === ALBUM_TITLE) ||
    rows.find((a) => (a.description || '').includes(ALBUM_SLUG_MARKER)) ||
    null
  );
}

async function createAlbum(token, categoryId, coverHint) {
  const now = new Date().toISOString();
  const payload = {
    tenantId: TENANT_ID,
    title: ALBUM_TITLE,
    description: `Homepage, events, and logo imagery for MCEFEE. ${ALBUM_SLUG_MARKER}`,
    coverImageUrl: coverHint || '',
    isPublic: true,
    displayOrder: 1,
    albumYear: new Date().getFullYear(),
    galleryCategoryId: categoryId,
    eventLocation: 'New Jersey, USA',
    createdAt: now,
    updatedAt: now,
  };
  if (DRY_RUN) {
    console.log('[dry-run] POST gallery-album', payload);
    return { id: -1, ...payload };
  }
  const { res, text, json } = await apiFetch(token, '/api/gallery-albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create album: ${res.status} ${text}`);
  console.log(`✓ Created album "${ALBUM_TITLE}" id=${json.id}`);
  return json;
}

async function listAlbumMediaTitles(token, albumId) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    'albumId.equals': String(albumId),
    size: '500',
  });
  const { res, json } = await apiFetch(token, `/api/event-medias?${qs}`);
  if (!res.ok) return new Set();
  const rows = Array.isArray(json) ? json : json?.content || [];
  return new Set(rows.map((m) => (m.title || m.fileUrl || '').toLowerCase()));
}

async function uploadOneViaProxy(albumId, entry, displayOrder) {
  const bytes = readFileSync(entry.absPath);
  const contentType = guessContentType(entry.absPath);
  const form = new FormData();
  form.append('files', new Blob([bytes], { type: contentType }), entry.fileName);
  form.append('titles', entry.fileName);
  form.append('descriptions', entry.alt);
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
  if (!res.ok) throw new Error(`proxy upload ${res.status}: ${text.slice(0, 280)}`);
  let uploaded = [];
  try {
    uploaded = JSON.parse(text);
  } catch {
    uploaded = [];
  }
  return Array.isArray(uploaded) ? uploaded[0] : uploaded;
}

async function uploadOneViaBackend(token, albumId, entry, displayOrder) {
  const buf = readFileSync(entry.absPath);
  const contentType = guessContentType(entry.absPath);
  const formData = new FormData();
  formData.append('file', new File([buf], entry.fileName, { type: contentType }));

  const params = new URLSearchParams({
    eventFlyer: 'false',
    isEventManagementOfficialDocument: 'false',
    isHeroImage: 'false',
    isActiveHeroImage: 'false',
    isHomePageHeroImage: 'false',
    isFeaturedEventImage: 'false',
    isFeaturedImage: 'false',
    isPublic: 'true',
    title: entry.fileName.slice(0, 120),
    description: (entry.alt || entry.fileName).slice(0, 200),
    tenantId: TENANT_ID,
    displayOrder: String(displayOrder),
    albumId: String(albumId),
  });

  const url = `${API_BASE_URL}/api/event-medias/upload?${params.toString()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': TENANT_ID,
    },
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`backend upload ${res.status}: ${text.slice(0, 280)}`);
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (Array.isArray(json?.data)) return json.data[0];
  return json;
}

async function patchAlbumId(token, media, albumId, displayOrder) {
  if (!media?.id || media.id < 0) return;
  // Backend merge-patch requires the same non-null fields as admin AlbumMediaClientPage
  const payload = {
    id: media.id,
    title: media.title || '',
    eventMediaType: media.eventMediaType || media.contentType || 'image/jpeg',
    storageType: media.storageType || 'S3',
    createdAt: media.createdAt || new Date().toISOString(),
    isHomePageHeroImage: Boolean(media.isHomePageHeroImage ?? false),
    isFeaturedEventImage: Boolean(media.isFeaturedEventImage ?? false),
    isLiveEventImage: Boolean(media.isLiveEventImage ?? false),
    albumId,
    eventId: null,
    tenantId: TENANT_ID || media.tenantId,
    updatedAt: new Date().toISOString(),
    description: media.description ?? null,
    fileUrl: media.fileUrl,
    contentType: media.contentType ?? null,
    fileSize: media.fileSize ?? null,
    isPublic: media.isPublic !== undefined ? Boolean(media.isPublic) : true,
    eventFlyer: Boolean(media.eventFlyer ?? false),
    isEventManagementOfficialDocument: Boolean(media.isEventManagementOfficialDocument ?? false),
    altText: media.altText ?? null,
    displayOrder: displayOrder ?? media.displayOrder ?? null,
    isHeroImage: Boolean(media.isHeroImage ?? false),
    isActiveHeroImage: Boolean(media.isActiveHeroImage ?? false),
    uploadedById: media.uploadedById ?? null,
    startDisplayingFromDate: media.startDisplayingFromDate ?? null,
    priorityRanking: media.priorityRanking ?? 0,
  };
  const { res, text } = await apiFetch(token, `/api/event-medias/${media.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.warn(`  ⚠ PATCH albumId for media ${media.id}: ${res.status} ${text.slice(0, 220)}`);
    return false;
  }
  return true;
}

/** Relink media that were uploaded without albumId (title match against local file list). */
async function linkOrphanMediaToAlbum(token, albumId, images) {
  const titleSet = new Set(images.map((e) => e.fileName.toLowerCase()));
  let linked = 0;
  let failed = 0;
  // Walk recent media for this tenant (uploaded in this seed run)
  for (let page = 0; page < 10; page++) {
    const qs = new URLSearchParams({
      'tenantId.equals': TENANT_ID,
      page: String(page),
      size: '50',
      sort: 'id,desc',
    });
    const { res, json } = await apiFetch(token, `/api/event-medias?${qs}`);
    if (!res.ok) break;
    const rows = Array.isArray(json) ? json : json?.content || [];
    if (rows.length === 0) break;
    for (const media of rows) {
      const title = (media.title || '').toLowerCase();
      if (!titleSet.has(title)) continue;
      if (media.albumId === albumId) continue;
      const ok = await patchAlbumId(token, media, albumId, media.displayOrder);
      if (ok) {
        linked++;
        console.log(`  ✓ linked media ${media.id} (${media.title}) → album ${albumId}`);
      } else {
        failed++;
      }
      await sleep(80);
    }
  }
  return { linked, failed };
}

async function patchAlbumCover(token, albumId, fileUrl) {
  if (!fileUrl) return;
  const { res, text } = await apiFetch(token, `/api/gallery-albums/${albumId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({
      id: albumId,
      coverImageUrl: fileUrl,
      updatedAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    console.warn(`  ⚠ cover PATCH: ${res.status} ${text.slice(0, 160)}`);
  } else {
    console.log(`✓ Cover image set`);
  }
}

async function main() {
  assertEnv();
  const images = collectImageEntries();
  console.log(`[mcefee-album] API=${API_BASE_URL} tenant=${TENANT_ID}`);
  console.log(`[mcefee-album] Next upload base=${APP_BASE_URL} (lib default was ${LIB_APP_BASE})`);
  console.log(`[mcefee-album] Found ${images.length} image file(s)`);
  if (images.length === 0) throw new Error('No images collected');

  if (DRY_RUN) {
    images.forEach((e, i) => console.log(`  ${i + 1}. ${e.absPath}`));
    console.log('[dry-run] Would create album + upload iteratively. Done.');
    return;
  }

  const token = await getServiceJwt();
  const categoryId = await resolveCategoryId(token);

  let album = await findExistingAlbum(token);
  if (album && FORCE) {
    console.log(`Existing album id=${album.id} — --force will add any missing media`);
  }
  if (!album) {
    if (LINK_ONLY) throw new Error('No Mcefee Album found to link media into');
    album = await createAlbum(token, categoryId, null);
  } else {
    console.log(`✓ Using existing album id=${album.id} "${album.title}"`);
  }

  if (LINK_ONLY) {
    const { linked, failed } = await linkOrphanMediaToAlbum(token, album.id, images);
    console.log(`[mcefee-album] link-only done. linked=${linked} failed=${failed}`);
    return;
  }

  const existingTitles = await listAlbumMediaTitles(token, album.id);
  let created = 0;
  let skipped = 0;
  let failed = 0;
  let firstFileUrl = album.coverImageUrl || null;

  for (let i = 0; i < images.length; i++) {
    const entry = images[i];
    const displayOrder = i + 1;
    const titleKey = entry.fileName.toLowerCase();
    if (!FORCE && existingTitles.has(titleKey)) {
      skipped++;
      console.log(`  · skip (exists) ${entry.fileName}`);
      continue;
    }

    process.stdout.write(`  → [${displayOrder}/${images.length}] ${entry.fileName} … `);
    try {
      let media = null;
      try {
        media = await uploadOneViaProxy(album.id, entry, displayOrder);
      } catch (proxyErr) {
        console.log(`\n    proxy failed (${proxyErr.message.slice(0, 100)}), trying backend upload…`);
        media = await uploadOneViaBackend(token, album.id, entry, displayOrder);
      }
      await patchAlbumId(token, media, album.id, displayOrder);
      const url = media?.fileUrl || media?.url || null;
      if (url && !firstFileUrl) firstFileUrl = url;
      existingTitles.add(titleKey);
      created++;
      console.log(`ok id=${media?.id ?? '?'}`);
    } catch (err) {
      failed++;
      console.log(`FAIL ${err.message}`);
    }
    await sleep(250);
  }

  if (firstFileUrl && (!album.coverImageUrl || FORCE)) {
    await patchAlbumCover(token, album.id, firstFileUrl);
  }

  console.log('');
  console.log(`[mcefee-album] Done. albumId=${album.id}`);
  console.log(`  created=${created} skipped=${skipped} failed=${failed}`);
  console.log(`  Admin: ${APP_BASE_URL}/admin/gallery/albums`);
  console.log(`  Public: ${APP_BASE_URL}/gallery`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
