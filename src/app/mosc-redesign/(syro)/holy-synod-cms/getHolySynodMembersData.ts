/**
 * Server-side data for Holy Synod CMS (Strapi GET /api/holy-synod-members).
 */

import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
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
  HolySynodMember,
  HolySynodMemberType,
  HolySynodMembersListResult,
  HolySynodMembersListOptions,
} from './types';

const STRAPI_LIST_FETCH: RequestInit = {
  cache: 'no-store',
  next: { revalidate: 0 },
};

const LOAD_ALL_PAGE_SIZE = 100;

function getHolySynodSlugBase(slug: string): string {
  return slug.replace(/-mo2$/i, '');
}

/**
 * Loads display names from canonical holy-synod-member rows (slug without -mo2 suffix).
 * Tenant-scoped -mo2 copies may carry stale titles (e.g. "Holy Synod" on the Catholicos card).
 */
async function fetchCanonicalNamesBySlugBases(slugBases: string[]): Promise<Map<string, string>> {
  const base = getStrapiApiBase();
  const needed = new Set(slugBases.map(getHolySynodSlugBase));
  if (!base || needed.size === 0) {
    return new Map();
  }

  const params = new URLSearchParams();
  params.set('pagination[pageSize]', '100');
  params.set('sort', 'id:asc');

  try {
    const res = await fetch(`${base}/holy-synod-members?${params.toString()}`, {
      headers: getStrapiHeaders(),
      ...STRAPI_LIST_FETCH,
    });
    if (!res.ok) return new Map();

    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const names = new Map<string, string>();

    for (const raw of list) {
      if (!raw || typeof raw !== 'object') continue;
      const item = unwrapStrapiRecord(raw as Record<string, unknown>);
      const slug = typeof item.slug === 'string' ? item.slug : '';
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      if (!slug || !name || /-mo2$/i.test(slug)) continue;

      const slugBase = getHolySynodSlugBase(slug);
      if (!needed.has(slugBase)) continue;
      names.set(slugBase, name);
    }

    return names;
  } catch {
    return new Map();
  }
}

function applyCanonicalMemberNames(
  members: HolySynodMember[],
  canonicalNames: Map<string, string>
): void {
  for (const member of members) {
    const canonicalName = canonicalNames.get(getHolySynodSlugBase(member.slug));
    if (canonicalName) {
      member.name = canonicalName;
    }
  }
}

function parseMember(raw: Record<string, unknown>, baseUrl: string): HolySynodMember {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const memberType = (item.memberType as HolySynodMemberType) ?? 'metropolitan';
  const excerpt = typeof item.excerpt === 'string' ? item.excerpt : null;
  const body = typeof item.body === 'string' ? item.body : null;
  const address = typeof item.address === 'string' ? item.address : null;
  const email = typeof item.email === 'string' ? item.email : null;
  const phones = typeof item.phones === 'string' ? item.phones : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    memberType,
    excerpt,
    body,
    imageUrl,
    imageAlt,
    address,
    email,
    phones,
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

const EMPTY_LIST: HolySynodMembersListResult = {
  members: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

function buildBaseParams(
  tenantId: string,
  nameSearch?: string,
  memberType?: HolySynodMemberType
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  if (memberType) {
    params.set('filters[memberType][$eq]', memberType);
  }
  const nameQuery = nameSearch?.trim();
  if (nameQuery) {
    params.set('filters[name][$containsi]', nameQuery);
  }
  // memberType asc: "catholicos" before "metropolitan"; then order, then name
  params.set('sort', 'memberType:asc,order:asc,name:asc');
  params.set('populate[0]', 'image');
  return params;
}

async function finalizeMembers(members: HolySynodMember[]): Promise<HolySynodMember[]> {
  const canonicalNames = await fetchCanonicalNamesBySlugBases(
    members.map((member) => getHolySynodSlugBase(member.slug))
  );
  applyCanonicalMemberNames(members, canonicalNames);
  return members;
}

export async function getHolySynodMembersData(
  options?: HolySynodMembersListOptions
): Promise<HolySynodMembersListResult> {
  noStore();
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return EMPTY_LIST;
  }

  const memberType = options?.memberType;
  const loadAll =
    options?.loadAll === true ||
    options == null ||
    (options.page == null &&
      options.pageSize == null &&
      !options.nameSearch?.trim() &&
      !memberType);

  try {
    if (!loadAll) {
      const page = Math.max(1, options?.page ?? 1);
      const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE));
      const params = buildBaseParams(tenantId, options?.nameSearch, memberType);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const res = await fetch(`${base}/holy-synod-members?${params.toString()}`, {
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
      const members = await finalizeMembers(
        list
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => parseMember(item, baseUrl))
      );
      return {
        members,
        pagination: parsePagination(json?.meta?.pagination, page, pageSize),
      };
    }

    // Load all pages (detail fallback / full lists).
    const allMembers: HolySynodMember[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      const params = buildBaseParams(tenantId, options?.nameSearch, memberType);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(LOAD_ALL_PAGE_SIZE));

      const res = await fetch(`${base}/holy-synod-members?${params.toString()}`, {
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
      allMembers.push(
        ...list
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => parseMember(item, baseUrl))
      );
      const meta = json?.meta?.pagination;
      pageCount = meta?.pageCount ?? 1;
      total = meta?.total ?? allMembers.length;
      page += 1;
      if (list.length === 0) break;
    }

    const members = await finalizeMembers(allMembers);
    return {
      members,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: members.length || DIRECTORY_PAGE_SIZE,
        total: total || members.length,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}

export async function getHolySynodMemberBySlug(slug: string): Promise<HolySynodMember | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  const member = await fetchStrapiEntryBySlug({
    collectionPath: 'holy-synod-members',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseMember,
    fetchList: async () => (await getHolySynodMembersData({ loadAll: true })).members,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });

  if (!member) {
    return null;
  }

  const canonicalNames = await fetchCanonicalNamesBySlugBases([getHolySynodSlugBase(member.slug)]);
  applyCanonicalMemberNames([member], canonicalNames);
  return member;
}

/**
 * Resolve a directory bishop to a Holy Synod CMS member (by slug base or normalized name).
 * Used when redirecting legacy `/directory/bishops/[documentId]` URLs.
 */
export async function findHolySynodMemberForBishop(opts: {
  name: string;
  slug?: string | null;
}): Promise<HolySynodMember | null> {
  const { members } = await getHolySynodMembersData({ loadAll: true });
  if (members.length === 0) return null;

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '');

  const slug = opts.slug?.trim();
  if (slug) {
    const slugBase = getHolySynodSlugBase(slug);
    const bySlug = members.find(
      (m) => m.slug === slug || getHolySynodSlugBase(m.slug) === slugBase
    );
    if (bySlug) return bySlug;
  }

  const nameKey = normalize(opts.name);
  if (!nameKey) return null;

  const exact = members.find((m) => normalize(m.name) === nameKey);
  if (exact) return exact;

  return (
    members.find((m) => {
      const memberKey = normalize(m.name);
      return memberKey.includes(nameKey) || nameKey.includes(memberKey);
    }) ?? null
  );
}
