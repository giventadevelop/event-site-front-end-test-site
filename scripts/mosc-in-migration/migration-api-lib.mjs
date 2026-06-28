#!/usr/bin/env node
/**
 * Shared JWT + direct backend API helpers for mosc-in-migration scripts.
 * Calls Spring Boot at NEXT_PUBLIC_API_BASE_URL (default http://localhost:8080), not Next.js proxy.
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

export const API_BASE_URL =
  process.env.MOSC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8080';

export const TENANT_ID =
  process.env.MOSC_TENANT_ID ||
  process.env.NEXT_PUBLIC_TENANT_ID ||
  process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID;

export const JWT_USER =
  process.env.AMPLIFY_API_JWT_USER ||
  process.env.API_JWT_USER ||
  process.env.NEXT_PUBLIC_API_JWT_USER;

export const JWT_PASS =
  process.env.AMPLIFY_API_JWT_PASS ||
  process.env.API_JWT_PASS ||
  process.env.NEXT_PUBLIC_API_JWT_PASS;

let cachedToken = null;
let tokenExpiry = 0;

export function assertEnv() {
  const missing = [];
  if (!API_BASE_URL) missing.push('NEXT_PUBLIC_API_BASE_URL or MOSC_API_BASE_URL');
  if (!TENANT_ID) missing.push('NEXT_PUBLIC_TENANT_ID');
  if (!JWT_USER || !JWT_PASS) missing.push('API_JWT_USER / API_JWT_PASS');
  if (missing.length) {
    throw new Error(`Missing required env (.env.local): ${missing.join(', ')}`);
  }
}

export async function getServiceJwt() {
  assertEnv();
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiry && now < tokenExpiry - 60) {
    return cachedToken;
  }
  const res = await fetch(`${API_BASE_URL}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: JWT_USER, password: JWT_PASS, rememberMe: true }),
  });
  if (!res.ok) {
    throw new Error(`authenticate failed (${res.status}): ${(await res.text()).slice(0, 400)}`);
  }
  const data = await res.json();
  if (!data.id_token) throw new Error('authenticate: no id_token in response');
  cachedToken = data.id_token;
  try {
    const [, payloadB64] = cachedToken.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    tokenExpiry = payload.exp || now + 3600;
  } catch {
    tokenExpiry = now + 3600;
  }
  return cachedToken;
}

export async function apiFetch(path, init = {}, token = null) {
  const jwt = token || (await getServiceJwt());
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${jwt}`,
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
