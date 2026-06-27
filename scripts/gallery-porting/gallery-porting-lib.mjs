#!/usr/bin/env node
/**
 * Shared helpers for static → dynamic gallery porting (JWT auth, API calls, category map).
 */
import { config } from 'dotenv';
import { resolve, join, extname } from 'path';
import { readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const APP_BASE_URL =
  process.env.MOSC_APP_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000';
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;
export const JWT_USER =
  process.env.AMPLIFY_API_JWT_USER ||
  process.env.API_JWT_USER ||
  process.env.NEXT_PUBLIC_API_JWT_USER;
export const JWT_PASS =
  process.env.AMPLIFY_API_JWT_PASS ||
  process.env.API_JWT_PASS ||
  process.env.NEXT_PUBLIC_API_JWT_PASS;

export const CATEGORY_DISPLAY_TO_SLUG = {
  'Ecumenical Visits': 'ecumenical-visits',
  'Major Events': 'major-events',
  Receptions: 'receptions',
  'Liturgical Events': 'liturgical-events',
  'Special Events': 'special-events',
  'Private Audiences': 'private-audiences',
  'Church Visits': 'church-visits',
  Conferences: 'conferences',
};

/** Matches documentation/gallery_album_category_year_enhancements/migrations/002_seed_gallery_category.sql */
export const GALLERY_CATEGORY_SEEDS = [
  { slug: 'ecumenical-visits', displayName: 'Ecumenical Visits', description: 'Ecumenical and inter-church visits', sortOrder: 10 },
  { slug: 'major-events', displayName: 'Major Events', description: 'Enthronements, ordinations, and major church events', sortOrder: 20 },
  { slug: 'receptions', displayName: 'Receptions', description: 'Official receptions and welcome ceremonies', sortOrder: 30 },
  { slug: 'liturgical-events', displayName: 'Liturgical Events', description: 'Liturgical services and sacred ceremonies', sortOrder: 40 },
  { slug: 'special-events', displayName: 'Special Events', description: 'Commemorations, inaugurations, and special occasions', sortOrder: 50 },
  { slug: 'private-audiences', displayName: 'Private Audiences', description: 'Private audiences with church leaders', sortOrder: 60 },
  { slug: 'church-visits', displayName: 'Church Visits', description: 'Parish and regional church visits', sortOrder: 70 },
  { slug: 'conferences', displayName: 'Conferences', description: 'Conferences and formal gatherings', sortOrder: 80 },
];

export const ROOT = process.cwd();
export const STATIC_ALBUMS_TS = join(ROOT, 'src/lib/gallery/moscStaticAlbums.ts');
export const GALLERY_PAGES_DIR = join(ROOT, 'src/app/mosc-redesign/(syro)/gallery');
export const PUBLIC_GALLERY_ROOT = join(ROOT, 'public/images/mosc/gallery');

export function assertEnv() {
  const missing = [];
  if (!API_BASE_URL) missing.push('NEXT_PUBLIC_API_BASE_URL');
  if (!TENANT_ID) missing.push('NEXT_PUBLIC_TENANT_ID');
  if (!JWT_USER || !JWT_PASS) missing.push('API_JWT_USER / API_JWT_PASS');
  if (missing.length) {
    throw new Error(`Missing required env (.env.local): ${missing.join(', ')}`);
  }
}

export async function getServiceJwt() {
  assertEnv();
  const res = await fetch(`${API_BASE_URL}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: JWT_USER, password: JWT_PASS, rememberMe: true }),
  });
  if (!res.ok) throw new Error(`authenticate failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  if (!data.id_token) throw new Error('authenticate: no id_token');
  return data.id_token;
}

export async function apiFetch(token, path, init = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-Tenant-ID': TENANT_ID,
    ...(init.headers || {}),
  };
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, text, json };
}

export function staticSlugMarker(slug) {
  return `static_slug=${slug}`;
}

export function parseStaticSlugFromDescription(description) {
  const match = String(description || '').match(/static_slug=([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

export async function parseStaticAlbumsFromTs() {
  const text = await readFile(STATIC_ALBUMS_TS, 'utf8');
  const albums = [];
  const blockRe =
    /\{\s*id:\s*'([^']+)',\s*title:\s*'((?:\\'|[^'])*)',\s*date:\s*'((?:\\'|[^'])*)',\s*albumYear:\s*(\d+),\s*photoCount:\s*(\d+),\s*category:\s*'((?:\\'|[^'])*)',\s*imageUrl:\s*'([^']+)'\s*\}/g;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    albums.push({
      slug: m[1],
      title: m[2].replace(/\\'/g, "'"),
      date: m[3].replace(/\\'/g, "'"),
      albumYear: Number(m[4]),
      photoCount: Number(m[5]),
      category: m[6].replace(/\\'/g, "'"),
      coverImageUrl: m[7],
    });
  }
  if (albums.length === 0) {
    throw new Error(`No albums parsed from ${STATIC_ALBUMS_TS}`);
  }
  return albums;
}

export async function extractPhotosFromAlbumPage(slug) {
  const pagePath = join(GALLERY_PAGES_DIR, slug, 'page.tsx');
  if (!existsSync(pagePath)) return [];

  const content = await readFile(pagePath, 'utf8');
  const photos = [];
  const seen = new Set();
  const srcRe = /src:\s*'([^']+)'/g;
  let m;
  while ((m = srcRe.exec(content)) !== null) {
    const src = m[1];
    if (!src.includes('/images/mosc/gallery/')) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    photos.push({ src, alt: slug });
  }
  return photos;
}

export async function listPhotosFromPublicFolder(slug) {
  const dir = join(PUBLIC_GALLERY_ROOT, slug);
  if (!existsSync(dir)) return [];

  const imageExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  const entries = await readdir(dir);
  const photos = [];
  for (const name of entries.sort()) {
    const ext = extname(name).toLowerCase();
    if (!imageExt.has(ext)) continue;
    photos.push({ src: `/images/mosc/gallery/${slug}/${name}`, alt: slug });
  }
  return photos;
}

export async function buildAlbumManifest() {
  const albums = await parseStaticAlbumsFromTs();
  const manifest = [];

  for (const album of albums) {
    let photos = await extractPhotosFromAlbumPage(album.slug);
    if (photos.length === 0) {
      photos = await listPhotosFromPublicFolder(album.slug);
    }
    manifest.push({
      ...album,
      categorySlug: CATEGORY_DISPLAY_TO_SLUG[album.category] || null,
      description: staticSlugMarker(album.slug),
      photos,
    });
  }

  return manifest;
}

export function guessContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
