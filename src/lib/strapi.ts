/**
 * Strapi CMS client configuration for the News Portal (MOSC).
 * Used server-side only for fetching news, homepage, sidebar, and ads.
 * API token is server-only; do not expose via NEXT_PUBLIC_.
 *
 * See: documentation/news_portal/strapi/api_reference.md
 */

import { getTenantId } from '@/lib/env';

/**
 * Lazily loads Strapi server URL (e.g. http://localhost:1337 or https://cms.example.com).
 * Use for resolving media URLs (uploads). Strips trailing slash and /api suffix.
 * Prioritizes AMPLIFY_ prefix for AWS Amplify production.
 */
export function getStrapiUrl(): string {
  const url =
    process.env.AMPLIFY_NEXT_PUBLIC_STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!url) {
    return '';
  }
  const trimmed = url.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

/**
 * Returns the Content API base URL (server + /api).
 * Per api_reference.md: Base URL is server + /api (e.g. http://localhost:1337/api).
 */
export function getStrapiApiBase(): string {
  const base = getStrapiUrl();
  if (!base) return '';
  return `${base}/api`;
}

/**
 * Lazily loads Strapi API token for authenticated requests.
 * Per api_reference.md: Send as Authorization: Bearer <token>.
 * Server-only; not exposed to the client.
 */
export function getStrapiApiToken(): string | undefined {
  return (
    process.env.AMPLIFY_STRAPI_API_TOKEN ||
    process.env.STRAPI_API_TOKEN
  );
}

/**
 * Returns headers for Strapi API requests. Includes Authorization if token is set.
 * Uses native Strapi 5 response format (no v4 compatibility header).
 * Media extraction in getNewsHomePageData handles Strapi 5 flattened structure.
 */
export function getStrapiHeaders(): Record<string, string> {
  const token = getStrapiApiToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export { unwrapStrapiRecord, unwrapStrapiRelation, normalizeStrapiSlug, findByStrapiSlug } from '@/lib/strapi/unwrapRecord';
export { fetchStrapiEntryBySlug } from '@/lib/strapi/fetchBySlug';

const LOG_PREFIX = '[STRAPI-NEWS]';

/**
 * Fetches from Strapi Content API with auth. Returns null on failure (caller handles fallback).
 * Path should be relative to /api (e.g. /articles?... or /homepage?populate=*).
 */
export async function fetchStrapi<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T } | null> {
  const base = getStrapiApiBase();
  if (!base) {
    console.warn(`${LOG_PREFIX} Strapi URL not set (NEXT_PUBLIC_STRAPI_URL). Skipping fetch: ${path}`);
    return null;
  }
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${base}${fullPath}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getStrapiHeaders(),
        ...(options.headers as Record<string, string>),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      try {
        const err = body ? JSON.parse(body) : {};
        console.warn(`${LOG_PREFIX} Strapi ${path} ${res.status}:`, err?.error?.message || err?.message || body || res.statusText);
      } catch {
        console.warn(`${LOG_PREFIX} Strapi ${path} returned ${res.status} ${res.statusText}`);
      }
      return null;
    }
    const data = (await res.json()) as { data?: T };
    const payload = (data?.data ?? data) as T;
    const count = Array.isArray(payload) ? payload.length : 1;
    console.info(`${LOG_PREFIX} OK ${path} (${count} item(s))`);
    return { data: payload };
  } catch (err) {
    console.warn(`${LOG_PREFIX} Strapi fetch failed: ${path}`, err);
    return null;
  }
}

/**
 * Returns tenant ID for Strapi filters.
 * Per api_reference.md: filters[tenant][tenantId][$eq]=<tenantId>
 */
export function getStrapiTenantId(): string {
  return getTenantId();
}

/** Cached tenant documentId per tenantId (avoids repeated /tenants calls in one request). */
let cachedTenantDocumentId: { tenantId: string; documentId: string } | null = null;

/**
 * Resolves Strapi tenant documentId from tenantId (e.g. tenant_demo_002).
 * Strapi 5 may require filtering articles by relation documentId instead of nested tenantId.
 * Returns null if tenants endpoint fails or no match; caller should fall back to tenantId filter.
 */
export async function getStrapiTenantDocumentId(): Promise<string | null> {
  const tenantId = getStrapiTenantId();
  if (cachedTenantDocumentId?.tenantId === tenantId) return cachedTenantDocumentId.documentId;
  const base = getStrapiApiBase();
  if (!base) return null;
  // Try tenantId first (camelCase); Strapi may expose as tenant_id (snake_case)
  for (const key of ['tenantId', 'tenant_id']) {
    const path = `/tenants?filters[${key}][$eq]=${encodeURIComponent(tenantId)}&pagination[pageSize]=1`;
    const res = await fetchStrapi<unknown[]>(path);
    const list = Array.isArray(res?.data) ? res.data : [];
    const first = list[0] as { documentId?: string } | undefined;
    if (first?.documentId) {
      cachedTenantDocumentId = { tenantId, documentId: first.documentId };
      return first.documentId;
    }
  }
  return null;
}
