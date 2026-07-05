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
import type { HolySynodMember, HolySynodMemberType, HolySynodMembersListResult } from './types';

const STRAPI_LIST_FETCH: RequestInit = {
  cache: 'no-store',
  next: { revalidate: 0 },
};

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
  canonicalNames: Map<string, string>,
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

const EMPTY_LIST: HolySynodMembersListResult = { members: [] };

export async function getHolySynodMembersData(): Promise<HolySynodMembersListResult> {
  noStore();
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return EMPTY_LIST;
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '100');

  const url = `${base}/holy-synod-members?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      ...STRAPI_LIST_FETCH,
    });
    if (!res.ok) {
      return EMPTY_LIST;
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const members = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseMember(item, baseUrl));
    const canonicalNames = await fetchCanonicalNamesBySlugBases(
      members.map((member) => getHolySynodSlugBase(member.slug)),
    );
    applyCanonicalMemberNames(members, canonicalNames);
    return { members };
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
    fetchList: async () => (await getHolySynodMembersData()).members,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });

  if (!member) {
    return null;
  }

  const canonicalNames = await fetchCanonicalNamesBySlugBases([getHolySynodSlugBase(member.slug)]);
  applyCanonicalMemberNames([member], canonicalNames);
  return member;
}
