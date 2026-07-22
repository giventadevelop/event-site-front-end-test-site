/**
 * Server-side data for Training CMS (Strapi GET /api/training-programs).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
  fetchStrapiEntryBySlug,
} from '@/lib/strapi';
import { findByStrapiSlug, unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import {
  EMPTY_DIRECTORY_PAGINATION,
  DIRECTORY_PAGE_SIZE,
  type DirectoryListPagination,
} from '@/app/mosc-redesign/(syro)/directory/types/listPagination';
import type {
  TrainingProgramEntry,
  TrainingProgramsListOptions,
  TrainingProgramsListResult,
} from './types';

const DEFAULT_IMAGE_BY_SLUG: Record<string, string> = {
  'sruti-school-of-liturgical-music': '/images/training/sruti.jpg',
  divyabodhanam: '/images/training/dvm.jpg',
  'st-basil-bible-school': '/images/training/bs.jpg',
};

const DEFAULT_PROGRAMS: TrainingProgramEntry[] = [
  {
    documentId: 'sruti',
    name: 'Sruti School of Liturgical Music',
    slug: 'sruti-school-of-liturgical-music',
    excerpt:
      'The Sruti School of Liturgical Music is the realization of a long-cherished desire of the Orthodox Theological Seminary to effect a systematised and organised form to the music and hymnody...',
    body: null,
    address: null,
    email: null,
    phones: null,
    website: null,
    imageUrl: DEFAULT_IMAGE_BY_SLUG['sruti-school-of-liturgical-music'],
    imageAlt: 'Sruti School of Liturgical Music',
    order: 0,
  },
  {
    documentId: 'divyabodhanam',
    name: 'Divyabodhanam (Theological Education Programme for the Laity)',
    slug: 'divyabodhanam',
    excerpt:
      'A novel step in the field of theological studies of Malankara Orthodox Syrian Church was officially inaugurated in 1984 July 28 as a laymen training course of the church. The...',
    body: null,
    address: null,
    email: null,
    phones: null,
    website: null,
    imageUrl: DEFAULT_IMAGE_BY_SLUG.divyabodhanam,
    imageAlt: 'Divyabodhanam',
    order: 1,
  },
  {
    documentId: 'st-basil',
    name: 'St. Basil Bible School',
    slug: 'st-basil-bible-school',
    excerpt:
      'St. Basil Bible School and Orientation Center - The origin of the St. Basil Bible School is attributed to the vision and efforts of H. H. Baselios Marthoma Mathews II. It began with...',
    body: null,
    address: null,
    email: null,
    phones: null,
    website: null,
    imageUrl: DEFAULT_IMAGE_BY_SLUG['st-basil-bible-school'],
    imageAlt: 'St. Basil Bible School',
    order: 2,
  },
];

function parseEntry(raw: Record<string, unknown>, baseUrl: string): TrainingProgramEntry {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const excerpt = typeof item.excerpt === 'string' ? item.excerpt : null;
  const body = typeof item.body === 'string' ? item.body : null;
  const address = typeof item.address === 'string' ? item.address : null;
  const email = typeof item.email === 'string' ? item.email : null;
  const phones = typeof item.phones === 'string' ? item.phones : null;
  const website = typeof item.website === 'string' ? item.website : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : DEFAULT_IMAGE_BY_SLUG[slug] ?? null;
  const imageAlt = image ? getMediaAlt(image) ?? null : name || null;

  return {
    documentId,
    name,
    slug,
    excerpt,
    body,
    address,
    email,
    phones,
    website,
    imageUrl,
    imageAlt,
    order,
  };
}

function filterDefaultPrograms(nameSearch?: string): TrainingProgramEntry[] {
  const q = nameSearch?.trim().toLowerCase();
  if (!q) return DEFAULT_PROGRAMS;
  return DEFAULT_PROGRAMS.filter((p) => p.name.toLowerCase().includes(q));
}

function paginateDefaults(
  entries: TrainingProgramEntry[],
  page: number,
  pageSize: number
): TrainingProgramsListResult {
  const total = entries.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = entries.slice(start, start + pageSize);
  return {
    entries: slice,
    pagination: {
      page: safePage,
      pageCount: total === 0 ? 0 : pageCount,
      pageSize,
      total,
    },
  };
}

const EMPTY_LIST: TrainingProgramsListResult = {
  entries: [],
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

export async function getTrainingProgramsData(
  options?: TrainingProgramsListOptions
): Promise<TrainingProgramsListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();

  const loadAll =
    options?.loadAll === true ||
    options == null ||
    (options.page == null && options.pageSize == null && !options.nameSearch?.trim());

  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE));

  if (!baseUrl || !base || !tenantId) {
    const filtered = filterDefaultPrograms(options?.nameSearch);
    if (loadAll) {
      return {
        entries: filtered,
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: filtered.length,
          total: filtered.length,
        },
      };
    }
    return paginateDefaults(filtered, page, pageSize);
  }

  try {
    if (!loadAll) {
      const params = buildBaseParams(tenantId, options?.nameSearch);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const url = `${base}/training-programs?${params.toString()}`;
      const res = await fetch(url, {
        headers: getStrapiHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) {
        return paginateDefaults(filterDefaultPrograms(options?.nameSearch), page, pageSize);
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
      if (entries.length === 0 && !options?.nameSearch?.trim()) {
        return paginateDefaults(DEFAULT_PROGRAMS, page, pageSize);
      }
      const meta = json?.meta?.pagination;
      const pagination: DirectoryListPagination = {
        page: meta?.page ?? page,
        pageCount: meta?.pageCount ?? 0,
        pageSize: meta?.pageSize ?? pageSize,
        total: meta?.total ?? 0,
      };
      return { entries, pagination };
    }

    const params = buildBaseParams(tenantId);
    params.set('pagination[pageSize]', '100');
    const url = `${base}/training-programs?${params.toString()}`;
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return {
        entries: DEFAULT_PROGRAMS,
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: DEFAULT_PROGRAMS.length,
          total: DEFAULT_PROGRAMS.length,
        },
      };
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const entries = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseEntry(item, baseUrl));
    const finalEntries = entries.length > 0 ? entries : DEFAULT_PROGRAMS;
    return {
      entries: finalEntries,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: finalEntries.length,
        total: finalEntries.length,
      },
    };
  } catch {
    if (loadAll) {
      return {
        entries: DEFAULT_PROGRAMS,
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: DEFAULT_PROGRAMS.length,
          total: DEFAULT_PROGRAMS.length,
        },
      };
    }
    return paginateDefaults(filterDefaultPrograms(options?.nameSearch), page, pageSize);
  }
}

export async function getTrainingProgramBySlug(slug: string): Promise<TrainingProgramEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return findByStrapiSlug(DEFAULT_PROGRAMS, slug) ?? null;
  }

  const fromApi = await fetchStrapiEntryBySlug({
    collectionPath: 'training-programs',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseEntry,
    fetchList: async () => (await getTrainingProgramsData({ loadAll: true })).entries,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });

  return fromApi ?? findByStrapiSlug(DEFAULT_PROGRAMS, slug) ?? null;
}

export { DEFAULT_IMAGE_BY_SLUG };
