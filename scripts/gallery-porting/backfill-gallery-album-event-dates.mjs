#!/usr/bin/env node
/**
 * Backfill eventDateStart, eventDateEnd, eventLocation (+ albumYear) on imported albums.
 *
 * Usage:
 *   node scripts/gallery-porting/backfill-gallery-album-event-dates.mjs
 *   node scripts/gallery-porting/backfill-gallery-album-event-dates.mjs --dry-run
 */
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import {
  TENANT_ID,
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
const REPORT_PATH = resolve('scripts/gallery-porting/event-date-backfill-report.json');

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

async function patchAlbumFromManifest(token, album, payload) {
  const body = {
    id: album.id,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  if (DRY_RUN) {
    console.log(`  [dry-run] PATCH album ${album.id}`, payload);
    return;
  }

  const { res, text } = await apiFetch(token, `/api/gallery-albums/${album.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`patch album ${album.id}: ${res.status} ${text}`);
  }
}

async function main() {
  assertEnv();
  console.log(`Gallery album event date backfill (dry-run=${DRY_RUN})`);

  const manifestRaw = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const manifest = Array.isArray(manifestRaw) ? manifestRaw : manifestRaw.albums || [];
  const metaBySlug = new Map(manifest.map((a) => [a.slug, a]));

  const token = DRY_RUN ? null : await getServiceJwt();
  const albums = DRY_RUN ? [] : await fetchGalleryAlbums(token);

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    albumsPatched: [],
    albumsSkipped: [],
    albumsMissingMeta: [],
    albumsFailed: [],
  };

  for (const album of albums) {
    const staticSlug = parseStaticSlugFromDescription(album.description);
    if (!staticSlug) {
      report.albumsSkipped.push({ id: album.id, title: album.title, reason: 'no static_slug' });
      continue;
    }

    const meta = metaBySlug.get(staticSlug);
    if (!meta) {
      report.albumsMissingMeta.push({ id: album.id, staticSlug, title: album.title });
      continue;
    }

    const fields = eventFieldsFromManifestAlbum(meta);
    if (!albumNeedsManifestPatch(album, album.galleryCategoryId, fields)) {
      report.albumsSkipped.push({ id: album.id, staticSlug, reason: 'already up to date' });
      continue;
    }

    const payload = {
      albumYear: fields.albumYear,
      eventDateStart: fields.eventDateStart,
      eventDateEnd: fields.eventDateEnd,
      eventLocation: fields.eventLocation,
    };

    try {
      await patchAlbumFromManifest(token, album, payload);
      report.albumsPatched.push({ id: album.id, staticSlug, ...payload });
      console.log(
        `  ✓ ${staticSlug} (id=${album.id}) → start=${payload.eventDateStart ?? '—'} end=${payload.eventDateEnd ?? '—'} loc=${payload.eventLocation ?? '—'}`,
      );
    } catch (err) {
      report.albumsFailed.push({ id: album.id, staticSlug, error: String(err.message || err) });
      console.warn(`  ⚠ ${staticSlug} (id=${album.id}): ${err.message}`);
    }
  }

  report.finishedAt = new Date().toISOString();
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(
    `\nDone: ${report.albumsPatched.length} patched, ${report.albumsSkipped.length} skipped, ${report.albumsFailed.length} failed`,
  );
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
