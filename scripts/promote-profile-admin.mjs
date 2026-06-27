#!/usr/bin/env node
/**
 * Promote a user profile to ADMIN via direct backend PATCH (service JWT).
 *
 * Usage:
 *   node scripts/promote-profile-admin.mjs --profile-id 4101
 *   node scripts/promote-profile-admin.mjs --user-id user_xxx
 *   node scripts/promote-profile-admin.mjs --email someone@example.com
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const JWT_USER =
  process.env.AMPLIFY_API_JWT_USER ||
  process.env.API_JWT_USER ||
  process.env.NEXT_PUBLIC_API_JWT_USER;
const JWT_PASS =
  process.env.AMPLIFY_API_JWT_PASS ||
  process.env.API_JWT_PASS ||
  process.env.NEXT_PUBLIC_API_JWT_PASS;
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--profile-id') out.profileId = Number(argv[++i]);
    else if (a === '--user-id') out.userId = argv[++i];
    else if (a === '--email') out.email = argv[++i];
  }
  return out;
}

async function getToken() {
  const res = await fetch(`${API_BASE_URL}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: JWT_USER, password: JWT_PASS, rememberMe: true }),
  });
  if (!res.ok) throw new Error(`authenticate failed: ${res.status}`);
  const data = await res.json();
  if (!data.id_token) throw new Error('no id_token');
  return data.id_token;
}

async function findProfile(token, { profileId, userId, email }) {
  if (profileId) {
    const res = await fetch(`${API_BASE_URL}/api/user-profiles/${profileId}`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT_ID },
    });
    if (!res.ok) throw new Error(`GET profile ${profileId} failed: ${res.status}`);
    return res.json();
  }
  const params = new URLSearchParams();
  params.append('tenantId.equals', TENANT_ID);
  if (userId) params.append('userId.equals', userId);
  if (email) params.append('email.equals', email);
  params.append('size', '5');
  const res = await fetch(`${API_BASE_URL}/api/user-profiles?${params}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT_ID },
  });
  if (!res.ok) throw new Error(`list profiles failed: ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return list[0] ?? null;
}

async function patchAdmin(token, profile) {
  const payload = {
    id: profile.id,
    tenantId: TENANT_ID,
    userRole: 'ADMIN',
    userStatus: 'APPROVED',
    updatedAt: new Date().toISOString(),
  };
  const res = await fetch(`${API_BASE_URL}/api/user-profiles/${profile.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': TENANT_ID,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PATCH failed ${res.status}: ${text}`);
  return text ? JSON.parse(text) : payload;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!API_BASE_URL || !JWT_USER || !JWT_PASS || !TENANT_ID) {
    console.error('Missing NEXT_PUBLIC_API_BASE_URL, JWT credentials, or NEXT_PUBLIC_TENANT_ID in .env.local');
    process.exit(1);
  }
  if (!args.profileId && !args.userId && !args.email) {
    console.error('Provide --profile-id, --user-id, or --email');
    process.exit(1);
  }

  const token = await getToken();
  const before = await findProfile(token, args);
  if (!before) {
    console.error('No profile found for', args);
    process.exit(1);
  }
  console.log('Before:', { id: before.id, userId: before.userId, email: before.email, userRole: before.userRole, userStatus: before.userStatus });

  const after = await patchAdmin(token, before);
  console.log('After:', { id: after.id, userId: after.userId, email: after.email, userRole: after.userRole, userStatus: after.userStatus });
  console.log('Done. Hard-refresh the app and sign out/in if the Admin menu does not appear.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
