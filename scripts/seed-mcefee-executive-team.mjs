#!/usr/bin/env node
/**
 * Replace executive committee team members for the current tenant with the
 * MCEFEE charity-site volunteer roster (images + titles from NJ-Malayalees static HTML).
 *
 * Usage (from repo root):
 *   node scripts/seed-mcefee-executive-team.mjs
 *
 * Requires .env.local: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TENANT_ID, API_JWT_USER/PASS
 */
import { config } from 'dotenv';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { File } from 'node:buffer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
config({ path: resolve(REPO_ROOT, '.env.local') });

const {
  assertEnv,
  getServiceJwt,
  apiFetch,
  API_BASE_URL,
  TENANT_ID,
} = await import('./mosc-in-migration/migration-api-lib.mjs');

const IMAGE_DIR =
  process.env.MCEFEE_TEAM_IMAGE_DIR ||
  'F:\\project_workspace\\NJ-Malayalees-MCEEFEE-Charity-Site\\images\\team_members';

/** Roster from NJ-Malayalees-MCEEFEE-Charity-Site/index.html#team-section */
const TEAM = [
  {
    firstName: 'Shaji',
    lastName: 'Varghese',
    title: 'Head Volunteer',
    designation: 'Head Volunteer',
    image: 'shaji_varghese.jpeg',
    websiteUrl: undefined,
    priorityOrder: 0,
  },
  {
    firstName: 'Sujith',
    lastName: 'Karakkadan',
    title: 'Volunteer',
    designation: 'Volunteer',
    image: 'sujith_karakkadan.jpeg',
    websiteUrl: 'https://www.facebook.com/sujith.thottan',
    priorityOrder: 10,
  },
  {
    firstName: 'Arun',
    lastName: 'Sadasivan',
    title: 'Volunteer',
    designation: 'Volunteer',
    image: 'arun_sadasivan.jpeg',
    websiteUrl: 'https://www.facebook.com/arun.sadasivan.3',
    priorityOrder: 20,
  },
  {
    firstName: 'Latha',
    lastName: 'Krishnan',
    title: 'Volunteer',
    designation: 'Volunteer',
    image: 'latha_krishnan.jpeg',
    websiteUrl: undefined,
    priorityOrder: 30,
  },
  {
    firstName: 'Varun',
    lastName: 'Lal',
    title: 'Volunteer',
    designation: 'Volunteer',
    image: 'varun_lal.jpeg',
    websiteUrl: undefined,
    priorityOrder: 40,
  },
];

async function listAllMembers(token) {
  const params = new URLSearchParams({
    'tenantId.equals': TENANT_ID,
    page: '0',
    size: '200',
    sort: 'id,asc',
  });
  const { res, json, text } = await apiFetch(
    `/api/executive-committee-team-members?${params}`,
    { method: 'GET' },
    token
  );
  if (!res.ok) {
    throw new Error(`List members failed (${res.status}): ${text.slice(0, 400)}`);
  }
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.content)) return json.content;
  if (Array.isArray(json?._embedded?.['executive-committee-team-members'])) {
    return json._embedded['executive-committee-team-members'];
  }
  return [];
}

async function deleteMember(id, token) {
  const { res, text } = await apiFetch(
    `/api/executive-committee-team-members/${id}`,
    { method: 'DELETE' },
    token
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Delete ${id} failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

async function createMember(member, token) {
  const payload = {
    firstName: member.firstName,
    lastName: member.lastName,
    title: member.title,
    designation: member.designation,
    bio: '',
    email: '',
    isActive: true,
    priorityOrder: member.priorityOrder,
    tenantId: TENANT_ID,
    joinDate: new Date().toISOString(),
  };
  if (member.websiteUrl) payload.websiteUrl = member.websiteUrl;

  const { res, json, text } = await apiFetch(
    '/api/executive-committee-team-members',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    token
  );
  if (!res.ok) {
    throw new Error(
      `Create ${member.firstName} ${member.lastName} failed (${res.status}): ${text.slice(0, 500)}`
    );
  }
  return json;
}

function extractUploadUrl(result) {
  if (!result || typeof result !== 'object') return null;
  if (Array.isArray(result.data) && result.data[0]) {
    return result.data[0].fileUrl || result.data[0].url || null;
  }
  return result.fileUrl || result.url || null;
}

async function uploadProfileImage(memberId, imagePath, token) {
  const buf = readFileSync(imagePath);
  const filename = imagePath.split(/[/\\]/).pop();
  const file = new File([buf], filename, { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams({
    eventId: '0',
    executiveTeamMemberID: String(memberId),
    eventFlyer: 'false',
    isEventManagementOfficialDocument: 'false',
    isHeroImage: 'false',
    isActiveHeroImage: 'false',
    isFeaturedImage: 'false',
    isPublic: 'true',
    isTeamMemberProfileImage: 'true',
    title: `Team Member Profile Image - ${memberId}`,
    description: 'Profile image from MCEFEE charity site seed',
    tenantId: TENANT_ID,
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
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(`Upload for member ${memberId} failed (${res.status}): ${text.slice(0, 400)}`);
  }
  return extractUploadUrl(json);
}

async function patchProfileImage(memberId, imageUrl, token) {
  const { res, text } = await apiFetch(
    `/api/executive-committee-team-members/${memberId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify({
        id: memberId,
        tenantId: TENANT_ID,
        profileImageUrl: imageUrl,
      }),
    },
    token
  );
  if (!res.ok) {
    throw new Error(`PATCH profileImageUrl ${memberId} failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

async function main() {
  assertEnv();
  console.log(`[seed-team] API=${API_BASE_URL} tenant=${TENANT_ID}`);
  console.log(`[seed-team] images=${IMAGE_DIR}`);

  for (const m of TEAM) {
    const p = join(IMAGE_DIR, m.image);
    if (!existsSync(p)) {
      throw new Error(`Missing image: ${p}`);
    }
  }

  const token = await getServiceJwt();
  const existing = await listAllMembers(token);
  console.log(`[seed-team] Found ${existing.length} existing member(s) for tenant — deleting…`);
  for (const row of existing) {
    if (row?.id == null) continue;
    await deleteMember(row.id, token);
    console.log(`  deleted id=${row.id} ${row.firstName || ''} ${row.lastName || ''}`);
  }

  console.log(`[seed-team] Creating ${TEAM.length} volunteers…`);
  for (const m of TEAM) {
    const created = await createMember(m, token);
    const id = created?.id;
    if (id == null) {
      throw new Error(`Create returned no id for ${m.firstName} ${m.lastName}: ${JSON.stringify(created)}`);
    }
    const imagePath = join(IMAGE_DIR, m.image);
    const imageUrl = await uploadProfileImage(id, imagePath, token);
    if (imageUrl) {
      await patchProfileImage(id, imageUrl, token);
      console.log(`  ✓ ${m.firstName} ${m.lastName} (id=${id}) image=${imageUrl}`);
    } else {
      console.warn(`  ✓ ${m.firstName} ${m.lastName} (id=${id}) — created but no image URL returned`);
    }
  }

  const after = await listAllMembers(token);
  console.log(`[seed-team] Done. Tenant now has ${after.length} member(s):`);
  for (const row of after.sort((a, b) => (a.priorityOrder ?? 0) - (b.priorityOrder ?? 0))) {
    console.log(
      `  ${String(row.priorityOrder ?? '').padStart(3)}  ${row.firstName} ${row.lastName} — ${row.designation || row.title} — ${row.profileImageUrl ? 'img ok' : 'NO IMG'}`
    );
  }
}

main().catch((err) => {
  console.error('[seed-team] FAILED:', err);
  process.exit(1);
});
