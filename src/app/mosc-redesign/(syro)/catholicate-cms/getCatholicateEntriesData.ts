/**
 * Server-side data for Catholicate CMS (Strapi GET /api/catholicate-entries).
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
} from '@/app/mosc-redesign/(syro)/directory/types/listPagination';
import {
  CATHOLICATE_INTRO_SLUGS,
  isCatholicateIntroEntry,
  sortCatholicateHubEntries,
  type CatholicateEntry,
  type CatholicateEntriesListOptions,
  type CatholicateEntriesListResult,
} from './types';

const LOAD_ALL_PAGE_SIZE = 100;

function parseEntry(raw: Record<string, unknown>, baseUrl: string): CatholicateEntry {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const subtitle = typeof item.subtitle === 'string' ? item.subtitle : null;
  const excerpt = typeof item.excerpt === 'string' ? item.excerpt : null;
  const body = typeof item.body === 'string' ? item.body : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    subtitle,
    excerpt,
    body,
    imageUrl,
    imageAlt,
    order,
  };
}

const EMPTY_LIST: CatholicateEntriesListResult = {
  entries: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

function buildBaseParams(tenantId: string, nameSearch?: string, excludeIntro?: boolean): URLSearchParams {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const nameQuery = nameSearch?.trim();
  if (nameQuery) {
    params.set('filters[name][$containsi]', nameQuery);
  }
  if (excludeIntro) {
    let i = 0;
    for (const slug of CATHOLICATE_INTRO_SLUGS) {
      params.set(`filters[slug][$notIn][${i}]`, slug);
      i += 1;
    }
  }
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  return params;
}

export async function getCatholicateEntriesData(
  options?: CatholicateEntriesListOptions
): Promise<CatholicateEntriesListResult> {
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
      // Hub cards use custom slug order — load matching rows, sort, then slice.
      const all = await getCatholicateEntriesData({
        loadAll: true,
        nameSearch: options?.nameSearch,
        excludeIntro: options?.excludeIntro,
      });
      let entries = all.entries;
      if (options?.excludeIntro) {
        entries = sortCatholicateHubEntries(entries.filter((e) => !isCatholicateIntroEntry(e)));
      }
      const page = Math.max(1, options?.page ?? 1);
      const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE));
      const total = entries.length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
      const safePage = Math.min(page, pageCount);
      const start = (safePage - 1) * pageSize;
      return {
        entries: entries.slice(start, start + pageSize),
        pagination: {
          page: safePage,
          pageCount,
          pageSize,
          total,
        },
      };
    }

    const allEntries: CatholicateEntry[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      const params = buildBaseParams(tenantId, options?.nameSearch, options?.excludeIntro);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(LOAD_ALL_PAGE_SIZE));

      const res = await fetch(`${base}/catholicate-entries?${params.toString()}`, {
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

    let entries = allEntries;
    if (options?.excludeIntro) {
      entries = sortCatholicateHubEntries(entries.filter((e) => !isCatholicateIntroEntry(e)));
    }

    return {
      entries,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: entries.length || DIRECTORY_PAGE_SIZE,
        total: options?.excludeIntro ? entries.length : total || entries.length,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}

export async function getCatholicateEntryBySlug(slug: string): Promise<CatholicateEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  return fetchStrapiEntryBySlug({
    collectionPath: 'catholicate-entries',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseEntry,
    fetchList: async () => (await getCatholicateEntriesData({ loadAll: true })).entries,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });
}
