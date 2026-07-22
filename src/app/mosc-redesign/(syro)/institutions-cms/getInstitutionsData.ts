/**
 * Server-side data for Institutions CMS (Strapi GET /api/institutions).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
  fetchStrapiEntryBySlug,
} from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import {
  EMPTY_DIRECTORY_PAGINATION,
  DIRECTORY_PAGE_SIZE,
  type DirectoryListPagination,
} from '@/app/mosc-redesign/(syro)/directory/types/listPagination';
import {
  institutionBelongsToCategory,
  type InstitutionHubCategory,
} from './institutionHubCategories';
import type {
  InstitutionEntry,
  InstitutionsListOptions,
  InstitutionsListResult,
} from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): InstitutionEntry {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const description = typeof item.description === 'string' ? item.description : null;
  const address = typeof item.address === 'string' ? item.address : null;
  const email = typeof item.email === 'string' ? item.email : null;
  const phones = typeof item.phones === 'string' ? item.phones : null;
  const website = typeof item.website === 'string' ? item.website : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    description,
    address,
    email,
    phones,
    website,
    imageUrl,
    imageAlt,
    order,
  };
}

const EMPTY_LIST: InstitutionsListResult = {
  entries: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

/** Strapi 5 caps pageSize at 100; used when loading all for CMS hub. */
const INSTITUTIONS_LOAD_ALL_PAGE_SIZE = 100;

function buildBaseParams(tenantId: string, nameSearch?: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const nameQuery = nameSearch?.trim();
  if (nameQuery) {
    params.set('filters[name][$containsi]', nameQuery);
  }
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  return params;
}

/**
 * Fetches institution entries for the current tenant.
 * - Default / `{ loadAll: true }`: loads all pages (CMS hub category grouping).
 * - With `{ page, pageSize, nameSearch }`: single Strapi page (directory list).
 */
export async function getInstitutionsData(
  options?: InstitutionsListOptions
): Promise<InstitutionsListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return EMPTY_LIST;
  }

  const loadAll =
    options?.loadAll === true ||
    (options == null) ||
    (options.page == null && options.pageSize == null && !options.nameSearch?.trim());

  try {
    if (!loadAll) {
      const page = Math.max(1, options?.page ?? 1);
      const pageSize = Math.min(
        100,
        Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE)
      );
      const params = buildBaseParams(tenantId, options?.nameSearch);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const url = `${base}/institutions?${params.toString()}`;
      const res = await fetch(url, {
        headers: getStrapiHeaders(),
        cache: 'no-store',
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
      const meta = json?.meta?.pagination;
      const pagination: DirectoryListPagination = {
        page: meta?.page ?? page,
        pageCount: meta?.pageCount ?? 0,
        pageSize: meta?.pageSize ?? pageSize,
        total: meta?.total ?? 0,
      };
      const entries = list
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => parseEntry(item, baseUrl));
      return { entries, pagination };
    }

    const params = buildBaseParams(tenantId);
    params.set('pagination[pageSize]', String(INSTITUTIONS_LOAD_ALL_PAGE_SIZE));

    const allRows: Record<string, unknown>[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      params.set('pagination[page]', String(page));
      const url = `${base}/institutions?${params.toString()}`;
      const res = await fetch(url, {
        headers: getStrapiHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) {
        return page === 1
          ? EMPTY_LIST
          : {
              entries: allRows.map((item) => parseEntry(item, baseUrl)),
              pagination: {
                page: 1,
                pageCount: 1,
                pageSize: allRows.length,
                total: allRows.length,
              },
            };
      }
      const json = (await res.json()) as {
        data?: unknown[];
        meta?: { pagination?: { pageCount?: number; total?: number } };
      };
      const list = Array.isArray(json?.data) ? json.data : [];
      for (const item of list) {
        if (item != null && typeof item === 'object') {
          allRows.push(item as Record<string, unknown>);
        }
      }
      pageCount = json?.meta?.pagination?.pageCount ?? 1;
      total = json?.meta?.pagination?.total ?? allRows.length;
      page += 1;
    }

    const entries = allRows.map((item) => parseEntry(item, baseUrl));
    return {
      entries,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: entries.length,
        total,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}

export async function getInstitutionBySlug(
  slug: string
): Promise<InstitutionEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  return fetchStrapiEntryBySlug({
    collectionPath: 'institutions',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseEntry,
    fetchList: async () => (await getInstitutionsData({ loadAll: true })).entries,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });
}

export function filterInstitutionsByCategory(
  entries: InstitutionEntry[],
  categorySlug: string
): InstitutionEntry[] {
  return entries.filter((entry) => institutionBelongsToCategory(entry.slug, categorySlug));
}

function firstLine(value: string | null): string | null {
  if (!value?.trim()) return null;
  return value.split('\n').map((line) => line.trim()).find(Boolean) ?? null;
}

function firstPhone(phones: string | null): string | null {
  if (!phones?.trim()) return null;
  const part = phones.split(/[,;\n/]+/).map((item) => item.trim()).find(Boolean);
  return part ?? null;
}

/** Builds hub card preview text from Strapi institutions in a category. */
export function buildCategoryCardDescription(
  entries: InstitutionEntry[],
  category: InstitutionHubCategory
): string {
  if (entries.length === 0) {
    return category.fallbackDescription;
  }

  const parts = entries.slice(0, 6).map((entry) => {
    const location = firstLine(entry.address);
    const phone = firstPhone(entry.phones);
    let segment = entry.name;
    if (location && location !== entry.name) {
      segment += ` - ${location}`;
    }
    if (phone) {
      segment += ` Ph: ${phone}`;
    }
    return segment;
  });

  let text = parts.join(', ');
  if (entries.length > parts.length) {
    text += '...';
  }
  if (text.length > 320) {
    return `${text.slice(0, 317)}...`;
  }
  return text || category.fallbackDescription;
}

export function pickCategoryCardImage(
  entries: InstitutionEntry[],
  category: InstitutionHubCategory
): string {
  const withImage = entries.find((entry) => entry.imageUrl);
  return withImage?.imageUrl ?? category.fallbackImage;
}
