#!/usr/bin/env node
/**
 * Extract static MOSC gallery manifest (albums + photo paths) from TS sources and public folders.
 *
 * Usage:
 *   node scripts/gallery-porting/extract-static-gallery-manifest.mjs
 *   node scripts/gallery-porting/extract-static-gallery-manifest.mjs --out scripts/gallery-porting/static-gallery-manifest.json
 */
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { buildAlbumManifest } from './gallery-porting-lib.mjs';

function parseArgs(argv) {
  const outIdx = argv.indexOf('--out');
  return {
    out:
      outIdx >= 0
        ? resolve(argv[outIdx + 1])
        : resolve('scripts/gallery-porting/static-gallery-manifest.json'),
  };
}

async function main() {
  const { out } = parseArgs(process.argv);
  const manifest = await buildAlbumManifest();
  const payload = {
    generatedAt: new Date().toISOString(),
    albumCount: manifest.length,
    totalPhotos: manifest.reduce((n, a) => n + a.photos.length, 0),
    albums: manifest,
  };
  await writeFile(out, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${manifest.length} albums (${payload.totalPhotos} photos) → ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
