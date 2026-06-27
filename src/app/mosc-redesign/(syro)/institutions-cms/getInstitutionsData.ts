/**
 * Server-side data for Institutions CMS (Strapi GET /api/institutions).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import {
  institutionBelongsToCategory,
  type InstitutionHubCategory,
} from './institutionHubCategories';
import type { InstitutionEntry, InstitutionsListResult } from './types';

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

const EMPTY_LIST: InstitutionsListResult = { entries: [] };

/** Strapi 5 caps pageSize at 100; paginate to load all tenant institutions. */
const INSTITUTIONS_PAGE_SIZE = 100;

/**
 * Fetches all institution entries for the current tenant, sorted by display order.
 */
export async function getInstitutionsData(): Promise<InstitutionsListResult> {
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
  params.set('pagination[pageSize]', String(INSTITUTIONS_PAGE_SIZE));

  try {
    const allRows: Record<string, unknown>[] = [];
    let page = 1;
    let pageCount = 1;

    while (page <= pageCount) {
      params.set('pagination[page]', String(page));
      const url = `${base}/institutions?${params.toString()}`;
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
