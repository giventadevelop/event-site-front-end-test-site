/**
 * Server-side data for Saints CMS (Strapi GET /api/saint-entries).
 */

import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
  getStrapiTenantDocumentId,
  fetchStrapiEntryBySlug,
} from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import {
  EMPTY_DIRECTORY_PAGINATION,
  DIRECTORY_PAGE_SIZE,
  type DirectoryListPagination,
} from '@/app/mosc-redesign/(syro)/directory/types/listPagination';
import type {
  SaintEntry,
  SaintEntriesListOptions,
  SaintEntriesListResult,
} from './types';

const STRAPI_LIST_FETCH: RequestInit = {
  cache: 'no-store',
  next: { revalidate: 0 },
};

const LOAD_ALL_PAGE_SIZE = 100;

function parseStrapiOrder(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

/** Strapi Display Order field is `order` (admin label); `priority` kept as optional alias. Lower = first. */
function parseSaintDisplayOrder(item: Record<string, unknown>): number {
  return parseStrapiOrder(item.order ?? item.priority);
}

/** Matches Strapi list view: Display Order ascending, then name for ties. */
function sortSaintEntriesByDisplayOrder(entries: SaintEntry[]): void {
  entries.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

async function applyTenantFilter(params: URLSearchParams, tenantId: string): Promise<void> {
  const tenantDocumentId = await getStrapiTenantDocumentId();
  if (tenantDocumentId) {
    params.set('filters[$or][0][tenant][tenantId][$eq]', tenantId);
    params.set('filters[$or][1][tenant][documentId][$eq]', tenantDocumentId);
  } else {
    params.set('filters[tenant][tenantId][$eq]', tenantId);
  }
}

function parseEntry(raw: Record<string, unknown>, baseUrl: string): SaintEntry {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const excerpt = typeof item.excerpt === 'string' ? item.excerpt : null;
  const body = typeof item.body === 'string' ? item.body : null;
  const order = parseSaintDisplayOrder(item);
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    excerpt,
    body,
    imageUrl,
    imageAlt,
    order,
  };
}

function parsePagination(
  meta: { page?: number; pageCount?: number; pageSize?: number; total?: number } | undefined,
  page: number,
  pageSize: number
): DirectoryListPagination {
  return {
    page: meta?.page ?? page,
    pageCount: meta?.pageCount ?? 0,
    pageSize: meta?.pageSize ?? pageSize,
    total: meta?.total ?? 0,
  };
}

const EMPTY_LIST: SaintEntriesListResult = {
  entries: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

async function buildBaseParams(tenantId: string, nameSearch?: string): Promise<URLSearchParams> {
  const params = new URLSearchParams();
  await applyTenantFilter(params, tenantId);
  const nameQuery = nameSearch?.trim();
  if (nameQuery) {
    params.set('filters[name][$containsi]', nameQuery);
  }
  params.set('sort[0]', 'order:asc');
  params.set('sort[1]', 'name:asc');
  params.set('populate[0]', 'image');
  return params;
}

async function fetchSaintEntryBySlugFromStrapi(
  slug: string,
  options?: { tenantId?: string }
): Promise<SaintEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !slug.trim()) {
    return null;
  }

  const params = new URLSearchParams();
  if (options?.tenantId) {
    await applyTenantFilter(params, options.tenantId);
  }
  params.set('filters[slug][$eqi]', slug.trim());
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '1');

  try {
    const res = await fetch(`${base}/saint-entries?${params.toString()}`, {
      headers: getStrapiHeaders(),
      ...STRAPI_LIST_FETCH,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown[] };
    const raw = Array.isArray(json?.data) ? json.data[0] : null;
    if (!raw || typeof raw !== 'object') return null;
    return parseEntry(raw as Record<string, unknown>, baseUrl);
  } catch {
    return null;
  }
}

/**
 * Homepage carousel: resolve each saint by canonical slug (no -mo2 suffix) so the
 * card title matches the Strapi entry detail page, then fall back to tenant-scoped list.
 */
export async function getHomepageSaintCarouselEntries(
  slugBases: readonly string[]
): Promise<SaintEntry[]> {
  const tenantId = getStrapiTenantId();
  const resolved: SaintEntry[] = [];

  for (const baseSlug of slugBases) {
    const canonical =
      (await fetchSaintEntryBySlugFromStrapi(baseSlug)) ??
      (tenantId ? await fetchSaintEntryBySlugFromStrapi(baseSlug, { tenantId }) : null) ??
      (await fetchSaintEntryBySlugFromStrapi(`${baseSlug}-mo2`)) ??
      (tenantId ? await fetchSaintEntryBySlugFromStrapi(`${baseSlug}-mo2`, { tenantId }) : null);

    if (canonical) {
      resolved.push(canonical);
    }
  }

  if (resolved.length === slugBases.length) {
    return resolved;
  }

  const { entries } = await getSaintEntriesData({ loadAll: true });
  const picked = slugBases
    .map((base) => {
      const candidates = entries.filter((entry) => entry.slug.replace(/-mo2$/, '') === base);
      if (candidates.length === 0) return null;
      return candidates.sort((a, b) => {
        const aMo2 = a.slug.endsWith('-mo2') ? 1 : 0;
        const bMo2 = b.slug.endsWith('-mo2') ? 1 : 0;
        if (aMo2 !== bMo2) return aMo2 - bMo2;
        return b.name.length - a.name.length;
      })[0];
    })
    .filter((entry): entry is SaintEntry => entry != null);

  return picked.length > 0 ? picked : resolved;
}

/**
 * Fetches saint entries for the current tenant.
 * Pass page/pageSize for paginated list+search; omit (or loadAll) for full list.
 */
export async function getSaintEntriesData(
  options?: SaintEntriesListOptions
): Promise<SaintEntriesListResult> {
  noStore();
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return EMPTY_LIST;
  }

  const loadAll =
    options?.loadAll === true ||
    options == null ||
    (options.page == null && options.pageSize == null && !options.nameSearch?.trim());

  try {
    if (!loadAll) {
      const page = Math.max(1, options?.page ?? 1);
      const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE));
      const params = await buildBaseParams(tenantId, options?.nameSearch);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const res = await fetch(`${base}/saint-entries?${params.toString()}`, {
        headers: getStrapiHeaders(),
        ...STRAPI_LIST_FETCH,
      });
      if (!res.ok) {
        return EMPTY_LIST;
      }
      const json = (await res.json()) as {
        data?: unknown[];
        meta?: {
          pagination?: {
            page?: number;
            pageCount?: number;
            pageSize?: number;
            total?: number;
          };
        };
      };
      const list = Array.isArray(json?.data) ? json.data : [];
      const entries = list
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => parseEntry(item, baseUrl));
      sortSaintEntriesByDisplayOrder(entries);
      return {
        entries,
        pagination: parsePagination(json?.meta?.pagination, page, pageSize),
      };
    }

    const allEntries: SaintEntry[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      const params = await buildBaseParams(tenantId, options?.nameSearch);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(LOAD_ALL_PAGE_SIZE));

      const res = await fetch(`${base}/saint-entries?${params.toString()}`, {
        headers: getStrapiHeaders(),
        ...STRAPI_LIST_FETCH,
      });
      if (!res.ok) {
        return EMPTY_LIST;
      }
      const json = (await res.json()) as {
        data?: unknown[];
        meta?: {
          pagination?: {
            page?: number;
            pageCount?: number;
            pageSize?: number;
            total?: number;
          };
        };
      };
      const list = Array.isArray(json?.data) ? json.data : [];
      allEntries.push(
        ...list
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => parseEntry(item, baseUrl))
      );
      const meta = json?.meta?.pagination;
      pageCount = meta?.pageCount ?? 1;
      total = meta?.total ?? allEntries.length;
      page += 1;
      if (list.length === 0) break;
    }

    sortSaintEntriesByDisplayOrder(allEntries);
    return {
      entries: allEntries,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: allEntries.length || DIRECTORY_PAGE_SIZE,
        total: total || allEntries.length,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}

/**
 * Fetches a single saint entry by slug. Returns null if not found or on error.
 */
export async function getSaintEntryBySlug(slug: string): Promise<SaintEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  return fetchStrapiEntryBySlug({
    collectionPath: 'saint-entries',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseEntry,
    fetchList: async () => (await getSaintEntriesData({ loadAll: true })).entries,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });
}
