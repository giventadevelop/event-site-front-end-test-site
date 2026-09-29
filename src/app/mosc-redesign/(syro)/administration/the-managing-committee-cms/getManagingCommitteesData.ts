/**
 * Server-side data for Managing Committee CMS
 * (Strapi GET /api/managing-committees — api::managing-committee.managing-committee).
 */

import 'server-only';
import { getStrapiUrl, getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '../../directory/lib/strapiMedia';
import {
  EMPTY_DIRECTORY_PAGINATION,
  DIRECTORY_PAGE_SIZE,
  type DirectoryListPagination,
} from '../../directory/types/listPagination';
import type {
  ManagingCommitteeEntry,
  ManagingCommitteeSection,
  ManagingCommitteesListOptions,
  ManagingCommitteesListResult,
} from './types';

/** Parse Strapi description like "Elected — THIRUVANANTHAPURAM — 2022-2027". */
export function parseManagingCommitteeDescription(description: string | null): {
  section: ManagingCommitteeSection;
  diocese: string;
  term: string | null;
} {
  const raw = (description ?? '').trim();

  const elected = raw.match(
    /^Elected\s*[—–-]\s*(.+?)\s*[—–-]\s*(\d{4}-\d{4})\s*$/i
  );
  if (elected) {
    return {
      section: 'elected',
      diocese: elected[1].trim() || 'Other',
      term: elected[2],
    };
  }

  const nominated = raw.match(/^Nominated\s*[—–-]\s*(\d{4}-\d{4})\s*$/i);
  if (nominated) {
    return {
      section: 'nominated',
      diocese: 'Nominated Members',
      term: nominated[1],
    };
  }

  if (/^Nominated/i.test(raw)) {
    return {
      section: 'nominated',
      diocese: 'Nominated Members',
      term: raw.match(/(\d{4}-\d{4})/)?.[1] ?? null,
    };
  }

  if (/^Elected/i.test(raw)) {
    const term = raw.match(/(\d{4}-\d{4})/)?.[1] ?? null;
    const diocese = raw
      .replace(/^Elected\s*[—–-]?\s*/i, '')
      .replace(/\s*[—–-]?\s*\d{4}-\d{4}\s*$/, '')
      .trim();
    return {
      section: 'elected',
      diocese: diocese || 'Other',
      term,
    };
  }

  return { section: 'elected', diocese: 'Other', term: null };
}

function parseEntry(raw: Record<string, unknown>, baseUrl: string): ManagingCommitteeEntry {
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
  const { section, diocese, term } = parseManagingCommitteeDescription(description);

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
    section,
    diocese,
    term,
  };
}

const EMPTY_LIST: ManagingCommitteesListResult = {
  entries: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

const LOAD_ALL_PAGE_SIZE = 100;

function buildBaseParams(tenantId: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  return params;
}

export function filterManagingCommitteeEntries(
  entries: ManagingCommitteeEntry[],
  searchTerm: string
): ManagingCommitteeEntry[] {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((m) => {
    const haystack = [
      m.name,
      m.address,
      m.email,
      m.phones,
      m.diocese,
      m.description,
      m.term,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function groupManagingCommitteeEntriesByDiocese(
  members: ManagingCommitteeEntry[]
): {
  diocese: string;
  section: ManagingCommitteeSection;
  members: ManagingCommitteeEntry[];
}[] {
  const groups: {
    diocese: string;
    section: ManagingCommitteeSection;
    members: ManagingCommitteeEntry[];
  }[] = [];

  for (const member of members) {
    const last = groups[groups.length - 1];
    if (last && last.diocese === member.diocese && last.section === member.section) {
      last.members.push(member);
    } else {
      groups.push({
        diocese: member.diocese,
        section: member.section,
        members: [member],
      });
    }
  }

  return groups;
}

/**
 * Fetches managing-committee members for the current tenant.
 * Default loadAll=true so client-side search can match diocese/address too.
 */
export async function getManagingCommitteesData(
  options?: ManagingCommitteesListOptions
): Promise<ManagingCommitteesListResult> {
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
      const pageSize = Math.min(
        100,
        Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE)
      );
      const params = buildBaseParams(tenantId);
      const nameQuery = options?.nameSearch?.trim();
      if (nameQuery) {
        params.set('filters[name][$containsi]', nameQuery);
      }
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const url = `${base}/managing-committees?${params.toString()}`;
      const res = await fetch(url, {
        headers: getStrapiHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) return EMPTY_LIST;

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
    params.set('pagination[pageSize]', String(LOAD_ALL_PAGE_SIZE));

    const allRows: Record<string, unknown>[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      params.set('pagination[page]', String(page));
      const url = `${base}/managing-committees?${params.toString()}`;
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
        total: total || entries.length,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}
