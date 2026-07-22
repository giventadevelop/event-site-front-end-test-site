/**
 * Server-side data for Seminaries (Strapi GET /api/seminaries).
 * Collection: api::seminary.seminary
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
import { getMediaUrl, getMediaAlt } from '../lib/strapiMedia';
import type { SeminaryEntry, SeminariesListResult } from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): SeminaryEntry {
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

const EMPTY_LIST: SeminariesListResult = { entries: [] };

/** Strapi 5 caps pageSize at 100; paginate to load all tenant seminaries. */
const PAGE_SIZE = 100;

/**
 * Fetches all seminary entries for the current tenant, sorted by display order.
 */
export async function getSeminariesData(): Promise<SeminariesListResult> {
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
  params.set('pagination[pageSize]', String(PAGE_SIZE));

  try {
    const allRows: Record<string, unknown>[] = [];
    let page = 1;
    let pageCount = 1;

    while (page <= pageCount) {
      params.set('pagination[page]', String(page));
      const url = `${base}/seminaries?${params.toString()}`;
      const res = await fetch(url, {
        headers: getStrapiHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) {
        return page === 1 ? EMPTY_LIST : { entries: allRows.map((item) => parseEntry(item, baseUrl)) };
      }
      const json = (await res.json()) as {
        data?: unknown[];
        meta?: { pagination?: { pageCount?: number } };
      };
      const list = Array.isArray(json?.data) ? json.data : [];
      for (const item of list) {
        if (item != null && typeof item === 'object') {
          allRows.push(item as Record<string, unknown>);
        }
      }
      pageCount = json?.meta?.pagination?.pageCount ?? 1;
      page += 1;
    }

    return { entries: allRows.map((item) => parseEntry(item, baseUrl)) };
  } catch {
    return EMPTY_LIST;
  }
}

export async function getSeminaryBySlug(slug: string): Promise<SeminaryEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  return fetchStrapiEntryBySlug({
    collectionPath: 'seminaries',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseEntry,
    fetchList: async () => (await getSeminariesData()).entries,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });
}
