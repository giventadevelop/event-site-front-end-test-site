#!/usr/bin/env node
/**
 * Filter "Mcefee Album" (album 64): keep only images that
 *  1) contain the word "mcefee" (filename/title OR OCR via Tesseract), OR
 *  2) are executive-committee team member photos (upload if missing).
 * Delete all other album media.
 *
 * Uses Tesseract from image-edit-ai-tools workflow (local install):
 *   "C:\Program Files\Tesseract-OCR\tesseract.exe"
 *
 * Usage:
 *   node scripts/filter-mcefee-gallery-album.mjs
 *   node scripts/filter-mcefee-gallery-album.mjs --dry-run
 *   node scripts/filter-mcefee-gallery-album.mjs --album-id 64
 *   node scripts/filter-mcefee-gallery-album.mjs --skip-ocr   # title/filename only
 */
import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, basename, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { File } from 'node:buffer';
import {
  TENANT_ID,
  API_BASE_URL,
  apiFetch,
  assertEnv,
  getServiceJwt,
  guessContentType,
  sleep,
} from './gallery-porting/gallery-porting-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_OCR = process.argv.includes('--skip-ocr');

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const ALBUM_ID_ARG = argValue('--album-id', null);
const TESSERACT =
  process.env.TESSERACT_PATH ||
  (existsSync('C:\\Program Files\\Tesseract-OCR\\tesseract.exe')
    ? 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
    : 'tesseract');

const TEAM_IMAGE_DIR =
  process.env.MCEFEE_TEAM_IMAGE_DIR ||
  'F:\\project_workspace\\NJ-Malayalees-MCEEFEE-Charity-Site\\images\\team_members';

const TEAM_FILES = [
  'shaji_varghese.jpeg',
  'sujith_karakkadan.jpeg',
  'arun_sadasivan.jpeg',
  'latha_krishnan.jpeg',
  'varun_lal.jpeg',
];

const CHARITY_IMAGES =
  process.env.MCEFEE_EVENTS_IMAGE_DIR ||
  'F:\\project_workspace\\NJ-Malayalees-MCEEFEE-Charity-Site\\images';

const MCEFEE_RE = /mcefee/i;

/** OCR often splits logos as "M CE FE E" — also match collapsed text. */
function textHasMcefee(text) {
  if (!text) return false;
  if (MCEFEE_RE.test(text)) return true;
  const collapsed = text.replace(/[\s._-]+/g, '');
  return /mcefee/i.test(collapsed);
}

function memberImageUrl(m) {
  return m.profileImageUrl || m.imageUrl || m.photoUrl || '';
}

async function findAlbum(token) {
  if (ALBUM_ID_ARG) {
    const { res, json } = await apiFetch(token, `/api/gallery-albums/${ALBUM_ID_ARG}`);
    if (!res.ok || !json?.id) throw new Error(`Album ${ALBUM_ID_ARG} not found`);
    return json;
  }
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    size: '100',
  });
  const { res, json } = await apiFetch(token, `/api/gallery-albums?${qs}`);
  if (!res.ok) throw new Error('list albums failed');
  const rows = Array.isArray(json) ? json : json?.content || [];
  const album =
    rows.find((a) => (a.description || '').includes('static_slug=mcefee-album')) ||
    rows.find((a) => /mcefee\s*album/i.test(a.title || ''));
  if (!album) throw new Error('Mcefee Album not found');
  return album;
}

async function listAlbumMedia(token, albumId) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    'albumId.equals': String(albumId),
    size: '500',
  });
  const { res, json, text } = await apiFetch(token, `/api/event-medias?${qs}`);
  if (!res.ok) throw new Error(`list album media: ${res.status} ${text.slice(0, 200)}`);
  return Array.isArray(json) ? json : json?.content || [];
}

async function listTeamMembers(token) {
  const qs = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    size: '100',
    sort: 'priorityOrder,asc',
  });
  const { res, json, text } = await apiFetch(
    token,
    `/api/executive-committee-team-members?${qs}`
  );
  if (!res.ok) throw new Error(`list team: ${res.status} ${text.slice(0, 200)}`);
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.content)) return json.content;
  return [];
}

function filenameHasMcefee(media) {
  // Do NOT use description — seed wrote "MCEFEE modernist: …" on every file.
  const title = media.title || '';
  const urlBase = media.fileUrl ? basename(media.fileUrl.split('?')[0]) : '';
  return textHasMcefee(title) || textHasMcefee(urlBase);
}

function resolveLocalImagePath(media) {
  const title = media.title || '';
  if (!title) return null;
  const candidates = [
    join(CHARITY_IMAGES, title),
    join(CHARITY_IMAGES, 'team_members', title),
    join(REPO_ROOT, 'public/images/modernist/mcefee', title),
    join(REPO_ROOT, 'public/images/logos/Mcefee', title),
    join(REPO_ROOT, 'public/images/hero_section', title),
    join(REPO_ROOT, 'public/images/mcefee_event', title),
    join(REPO_ROOT, 'public/images', title),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function downloadToTemp(fileUrl, tmpDir) {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  let ext = '.jpg';
  if (ct.includes('png')) ext = '.png';
  else if (ct.includes('webp')) ext = '.webp';
  else if (ct.includes('gif')) ext = '.gif';
  else if (ct.includes('jpeg') || ct.includes('jpg')) ext = '.jpg';
  else {
    const m = fileUrl.match(/\.(jpe?g|png|webp|gif)(?:\?|$)/i);
    if (m) ext = `.${m[1].toLowerCase().replace('jpeg', 'jpg')}`;
  }
  const path = join(tmpDir, `img_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  writeFileSync(path, buf);
  return path;
}

function ocrContainsMcefee(imagePath) {
  const r = spawnSync(TESSERACT, [imagePath, 'stdout', '-l', 'eng', '--psm', '6'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  });
  if (r.error) {
    console.warn(`    OCR spawn error: ${r.error.message}`);
    return { hit: false, text: '' };
  }
  const out = r.stdout || '';
  return { hit: textHasMcefee(out), text: out.slice(0, 400) };
}

function isTeamMemberMedia(media, teamMembers) {
  // Modernist placeholders team_1…team_4 are NOT executive committee
  if (/^team_\d+\./i.test(media.title || '')) return false;

  const url = (media.fileUrl || '').toLowerCase();
  const title = (media.title || '').toLowerCase();
  for (const m of teamMembers) {
    const img = memberImageUrl(m).toLowerCase();
    if (img && url && (url === img || url.includes(basename(img).toLowerCase()))) {
      return true;
    }
    const stem = `${(m.firstName || '').toLowerCase()}_${(m.lastName || '').toLowerCase()}`.replace(
      /\s+/g,
      '_'
    );
    if (stem.length > 3 && (title.includes(stem) || url.includes(stem))) return true;
    if (url.includes('executive-team-members')) {
      const ln = (m.lastName || '').toLowerCase();
      const fn = (m.firstName || '').toLowerCase();
      if (ln && fn && url.includes(fn) && url.includes(ln)) return true;
    }
  }
  return false;
}

async function patchAlbumId(token, media, albumId, displayOrder) {
  if (!media?.id) return false;
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
    console.warn(`  ⚠ PATCH albumId media ${media.id}: ${res.status} ${text.slice(0, 180)}`);
    return false;
  }
  return true;
}

async function uploadTeamPhoto(token, albumId, absPath, displayOrder) {
  const fileName = basename(absPath);
  const buf = readFileSync(absPath);
  const contentType = guessContentType(absPath);
  const formData = new FormData();
  formData.append('file', new File([buf], fileName, { type: contentType }));
  const params = new URLSearchParams({
    eventFlyer: 'false',
    isEventManagementOfficialDocument: 'false',
    isHeroImage: 'false',
    isActiveHeroImage: 'false',
    isHomePageHeroImage: 'false',
    isFeaturedEventImage: 'false',
    isFeaturedImage: 'false',
    isPublic: 'true',
    title: fileName.slice(0, 120),
    description: `Executive committee: ${fileName}`,
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
  if (!res.ok) throw new Error(`upload ${fileName}: ${res.status} ${text.slice(0, 200)}`);
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  const media = Array.isArray(json?.data) ? json.data[0] : json;
  await patchAlbumId(token, media, albumId, displayOrder);
  return media;
}

async function deleteMedia(token, id) {
  const { res, text } = await apiFetch(token, `/api/event-medias/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE ${id}: ${res.status} ${text.slice(0, 200)}`);
  }
  return true;
}

async function ensureTeamPhotosInAlbum(token, albumId, existingMedia, teamMembers) {
  const keepIds = new Set();
  const titles = new Set(existingMedia.map((m) => (m.title || '').toLowerCase()));
  const urls = new Set(existingMedia.map((m) => (m.fileUrl || '').toLowerCase()));

  for (const m of existingMedia) {
    if (isTeamMemberMedia(m, teamMembers)) keepIds.add(m.id);
  }

  for (const member of teamMembers) {
    const img = memberImageUrl(member).toLowerCase();
    if (!img) continue;
    for (const media of existingMedia) {
      if ((media.fileUrl || '').toLowerCase() === img) keepIds.add(media.id);
    }
  }

  let uploaded = 0;
  let order = 900;
  for (const fileName of TEAM_FILES) {
    const abs = join(TEAM_IMAGE_DIR, fileName);
    const key = fileName.toLowerCase();
    const stem = key.replace(/\.[^.]+$/, '');
    const already =
      titles.has(key) ||
      [...urls].some((u) => u.includes(stem) && u.includes('executive-team-members'));
    const member = teamMembers.find((tm) =>
      memberImageUrl(tm).toLowerCase().includes(stem)
    );
    const memberUrl = member ? memberImageUrl(member) : '';
    if (memberUrl) {
      const inAlbum = existingMedia.find(
        (m) => (m.fileUrl || '').toLowerCase() === memberUrl.toLowerCase()
      );
      if (inAlbum) {
        keepIds.add(inAlbum.id);
        continue;
      }
      const qs = new URLSearchParams({
        'tenantId.equals': TENANT_ID,
        'fileUrl.equals': memberUrl,
        size: '5',
      });
      const { res, json } = await apiFetch(token, `/api/event-medias?${qs}`);
      const rows = res.ok ? (Array.isArray(json) ? json : json?.content || []) : [];
      if (rows[0]?.id) {
        if (DRY_RUN) {
          console.log(`  [dry-run] link team media ${rows[0].id} → album ${albumId}`);
          keepIds.add(rows[0].id);
          continue;
        }
        await patchAlbumId(token, rows[0], albumId, order++);
        keepIds.add(rows[0].id);
        console.log(`  ✓ linked exec photo media ${rows[0].id} (${fileName}) → album`);
        await sleep(100);
        continue;
      }
    }

    if (already) continue;
    if (!existsSync(abs)) {
      console.warn(`  ⚠ missing local team file: ${abs}`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`  [dry-run] upload team ${fileName}`);
      uploaded++;
      continue;
    }
    process.stdout.write(`  → upload team ${fileName} … `);
    try {
      const media = await uploadTeamPhoto(token, albumId, abs, order++);
      keepIds.add(media.id);
      uploaded++;
      console.log(`ok id=${media.id}`);
    } catch (err) {
      console.log(`FAIL ${err.message}`);
    }
    await sleep(250);
  }

  return { keepIds, uploaded };
}

async function main() {
  assertEnv();
  console.log(`[filter-album] API=${API_BASE_URL} tenant=${TENANT_ID}`);
  console.log(`[filter-album] tesseract=${TESSERACT} skipOcr=${SKIP_OCR} dryRun=${DRY_RUN}`);

  const token = await getServiceJwt();
  const album = await findAlbum(token);
  console.log(`✓ Album id=${album.id} "${album.title}"`);

  let media = await listAlbumMedia(token, album.id);
  console.log(`  album media: ${media.length}`);

  const teamMembers = await listTeamMembers(token);
  console.log(`  executive committee: ${teamMembers.length}`);
  teamMembers.forEach((m) =>
    console.log(`    - ${m.firstName} ${m.lastName} → ${memberImageUrl(m).slice(-55)}`)
  );

  const { keepIds: teamKeepIds, uploaded } = await ensureTeamPhotosInAlbum(
    token,
    album.id,
    media,
    teamMembers
  );
  console.log(`  team keep ids: ${[...teamKeepIds].join(', ') || '(none yet)'} uploaded=${uploaded}`);

  // Refresh media after linking/uploading
  media = await listAlbumMedia(token, album.id);

  const tmpDir = mkdtempSync(join(tmpdir(), 'mcefee-ocr-'));
  const keep = new Map(); // id -> reason
  const drop = [];

  try {
    for (const m of media) {
      const id = m.id;
      if (teamKeepIds.has(id) || isTeamMemberMedia(m, teamMembers)) {
        keep.set(id, 'executive-committee');
        console.log(`  KEEP ${id} ${m.title} [executive-committee]`);
        continue;
      }
      if (filenameHasMcefee(m)) {
        keep.set(id, 'filename mcefee');
        console.log(`  KEEP ${id} ${m.title} [filename]`);
        continue;
      }
      if (!SKIP_OCR) {
        process.stdout.write(`  OCR  ${id} ${m.title} … `);
        try {
          let path = resolveLocalImagePath(m);
          let source = path ? 'local' : null;
          if (!path && m.fileUrl) {
            path = await downloadToTemp(m.fileUrl, tmpDir);
            source = 's3';
          }
          if (!path) {
            console.log('no local/s3 source');
          } else {
            const { hit, text } = ocrContainsMcefee(path);
            if (hit) {
              keep.set(id, `ocr mcefee (${source})`);
              console.log(
                `KEEP [ocr/${source}] "${text.replace(/\s+/g, ' ').trim().slice(0, 80)}"`
              );
              continue;
            }
            console.log(`no mcefee (${source})`);
          }
        } catch (err) {
          console.log(`OCR fail (${err.message})`);
        }
      }
      drop.push(m);
      console.log(`  DROP ${id} ${m.title}`);
    }
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  console.log('');
  console.log(`[filter-album] keep=${keep.size} delete=${drop.length}`);
  for (const [id, reason] of keep) {
    const m = media.find((x) => x.id === id);
    console.log(`  keep ${id} ${m?.title} (${reason})`);
  }

  let deleted = 0;
  let failed = 0;
  for (const m of drop) {
    if (DRY_RUN) {
      console.log(`  [dry-run] DELETE ${m.id} ${m.title}`);
      deleted++;
      continue;
    }
    try {
      await deleteMedia(token, m.id);
      deleted++;
      console.log(`  ✓ deleted ${m.id} ${m.title}`);
    } catch (err) {
      failed++;
      console.log(`  ✗ delete ${m.id}: ${err.message}`);
    }
    await sleep(120);
  }

  const remaining = await listAlbumMedia(token, album.id);
  console.log('');
  console.log(`[filter-album] Done. albumId=${album.id}`);
  console.log(`  deleted=${deleted} failed=${failed} remaining=${remaining.length}`);
  remaining.forEach((m) => console.log(`  • ${m.id} ${m.title}`));
  console.log(`  Admin album: http://localhost:3002/admin/gallery/albums/${album.id}`);
  console.log(`  Gallery: http://localhost:3002/gallery`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
