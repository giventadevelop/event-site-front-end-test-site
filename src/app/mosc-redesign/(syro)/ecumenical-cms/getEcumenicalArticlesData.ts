/**
 * Server-side data for Ecumenical CMS (Strapi GET /api/ecumenical-articles).
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
import type {
  EcumenicalArticle,
  EcumenicalArticlesListOptions,
  EcumenicalArticlesListResult,
} from './types';

const LOAD_ALL_PAGE_SIZE = 100;

function parseArticle(raw: Record<string, unknown>, baseUrl: string): EcumenicalArticle {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
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

const EMPTY_LIST: EcumenicalArticlesListResult = {
  articles: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

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

export async function getEcumenicalArticlesData(
  options?: EcumenicalArticlesListOptions
): Promise<EcumenicalArticlesListResult> {
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
      const params = buildBaseParams(tenantId, options?.nameSearch);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const res = await fetch(`${base}/ecumenical-articles?${params.toString()}`, {
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
      const articles = list
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => parseArticle(item, baseUrl));
      return {
        articles,
        pagination: parsePagination(json?.meta?.pagination, page, pageSize),
      };
    }

    const allArticles: EcumenicalArticle[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      const params = buildBaseParams(tenantId, options?.nameSearch);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(LOAD_ALL_PAGE_SIZE));

      const res = await fetch(`${base}/ecumenical-articles?${params.toString()}`, {
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
      allArticles.push(
        ...list
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => parseArticle(item, baseUrl))
      );
      const meta = json?.meta?.pagination;
      pageCount = meta?.pageCount ?? 1;
      total = meta?.total ?? allArticles.length;
      page += 1;
      if (list.length === 0) break;
    }

    return {
      articles: allArticles,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: allArticles.length || DIRECTORY_PAGE_SIZE,
        total: total || allArticles.length,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}

export async function getEcumenicalArticleBySlug(slug: string): Promise<EcumenicalArticle | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  return fetchStrapiEntryBySlug({
    collectionPath: 'ecumenical-articles',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseArticle,
    fetchList: async () => (await getEcumenicalArticlesData({ loadAll: true })).articles,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });
}
