import 'server-only';

import { findByStrapiSlug } from '@/lib/strapi/unwrapRecord';

function getStrapiFetchHeaders(): Record<string, string> {
  const token =
    process.env.AMPLIFY_STRAPI_API_TOKEN ||
    process.env.STRAPI_API_TOKEN;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

type FetchStrapiEntryBySlugOptions<T extends { slug?: string | null }> = {
  collectionPath: string;
  slug: string;
  baseUrl: string;
  apiBase: string;
  tenantId: string;
  populate?: string[];
  parse: (raw: Record<string, unknown>, baseUrl: string) => T;
  fetchList: () => Promise<T[]>;
  isValid?: (item: T) => boolean;
};

/**
 * Fetches a single Strapi collection entry by slug ($eqi), then falls back to an in-memory list match.
 */
export async function fetchStrapiEntryBySlug<T extends { slug?: string | null }>(
  options: FetchStrapiEntryBySlugOptions<T>
): Promise<T | null> {
  const {
    collectionPath,
    slug,
    baseUrl,
    apiBase,
    tenantId,
    populate = [],
    parse,
    fetchList,
    isValid,
  } = options;

  if (!baseUrl || !apiBase || !tenantId || !slug.trim()) {
    return null;
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('filters[slug][$eqi]', slug.trim());
  populate.forEach((field, index) => {
    params.set(`populate[${index}]`, field);
  });
  params.set('pagination[pageSize]', '1');

  try {
    const res = await fetch(`${apiBase}/${collectionPath}?${params.toString()}`, {
      headers: getStrapiFetchHeaders(),
      cache: 'no-store',
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: unknown[] };
      const list = Array.isArray(json?.data) ? json.data : [];
      const raw = list[0];
      if (raw && typeof raw === 'object') {
        const parsed = parse(raw as Record<string, unknown>, baseUrl);
        if (!isValid || isValid(parsed)) {
          return parsed;
        }
      }
    }
  } catch {
    // fall through to list lookup
  }

  try {
    const list = await fetchList();
    return findByStrapiSlug(list, slug) ?? null;
  } catch {
    return null;
  }
}
