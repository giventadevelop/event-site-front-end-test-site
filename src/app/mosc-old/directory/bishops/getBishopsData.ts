/**
 * Server-side data for Directory Bishops (Strapi GET /api/bishops).
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §3
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '@/app/mosc/directory/lib/strapiMedia';
import { unwrapStrapiRecord, unwrapStrapiRelation } from '@/lib/strapi/unwrapRecord';
import type { Bishop, BishopType, BishopsListResult, StrapiPagination } from './types';

function parseBishop(raw: Record<string, unknown>, baseUrl: string): Bishop {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const bishopType = (item.bishopType as BishopType) ?? 'diocesan';
  const order = typeof item.order === 'number' ? item.order : 0;
  const address = typeof item.address === 'string' ? item.address : null;
  const email = typeof item.email === 'string' ? item.email : null;
  const phones = typeof item.phones === 'string' ? item.phones : null;
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;
  let dioceseName: string | null = null;
  const diocese = unwrapStrapiRelation(item.diocese);
  if (diocese && typeof diocese.name === 'string') {
    dioceseName = diocese.name;
  }
  return {
    documentId,
    name,
    slug,
    bishopType,
    imageUrl,
    imageAlt,
    address,
    email,
    phones,
    dioceseName,
    order,
  };
}

const DEFAULT_PAGINATION: StrapiPagination = {
  page: 1,
  pageCount: 0,
  pageSize: 10,
  total: 0,
};

/**
 * Fetches bishops list from Strapi with optional bishopType filter, name search, and pagination.
 * Returns empty list and default pagination on failure.
 * Name search uses case-insensitive contains (Strapi filters[name][$containsi]).
 */
export async function getBishopsData(options: {
  bishopType?: BishopType;
  nameSearch?: string;
  page?: number;
  pageSize?: number;
}): Promise<BishopsListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return { bishops: [], pagination: DEFAULT_PAGINATION };
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  if (options.bishopType) {
    params.set('filters[bishopType][$eq]', options.bishopType);
  }
  const nameQuery = options.nameSearch?.trim();
  if (nameQuery) {
    params.set('filters[name][$containsi]', nameQuery);
  }
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'diocese');
  params.set('populate[1]', 'image');
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));

  const path = `bishops?${params.toString()}`;
  const url = `${base}/${path}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return { bishops: [], pagination: DEFAULT_PAGINATION };
    }
    const json = (await res.json()) as {
      data?: unknown[];
      meta?: { pagination?: { page?: number; pageCount?: number; pageSize?: number; total?: number } };
    };
    const list = Array.isArray(json?.data) ? json.data : [];
    const meta = json?.meta?.pagination;
    const pagination: StrapiPagination = {
      page: meta?.page ?? page,
      pageCount: meta?.pageCount ?? 0,
      pageSize: meta?.pageSize ?? pageSize,
      total: meta?.total ?? 0,
    };
    const bishops = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseBishop(item, baseUrl));
    return { bishops, pagination };
  } catch {
    return { bishops: [], pagination: DEFAULT_PAGINATION };
  }
}

/**
 * Fetches a single bishop by documentId. Returns null if not found or on error.
 */
export async function getBishopByDocumentId(documentId: string): Promise<Bishop | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (process.env.NODE_ENV === 'development') {
    console.log('[Bishop] getBishopByDocumentId called', { documentId, baseUrl: baseUrl || '(empty)', hasBase: !!base });
  }
  if (!baseUrl || !base || !documentId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Bishop] early return: missing baseUrl, base, or documentId');
    }
    return null;
  }

  // Try populate=* to include all relations (image, diocese); Strapi 5 may not populate image with array syntax
  const path = `bishops/${documentId}?populate=*`;
  const url = `${base}/${path}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as {
      data?: Record<string, unknown> | { data?: Record<string, unknown> };
    };
    let raw = json?.data;
    // Strapi 5 Document Service can wrap the document: { data: { data: document } }
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) {
      const inner = (raw as { data?: Record<string, unknown> }).data;
      if (inner && typeof inner === 'object') {
        raw = inner;
      }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return null;
    }
    const record = unwrapStrapiRecord(raw as Record<string, unknown>);
    let bishop = parseBishop(record, baseUrl);

    // Fallback: when bishops API returns no image, try Strapi catholicos-entries (Directory - The Catholicos).
    // API: GET /api/catholicos-entries?populate[image]=* (plural name in schema is catholicos-entries).
    const isCatholicos = String(bishop.bishopType).toLowerCase() === 'catholicos';
    if (!bishop.imageUrl && isCatholicos) {
      const tenantId = getStrapiTenantId();
      if (tenantId) {
        try {
          const opts = { headers: getStrapiHeaders(), cache: 'no-store' as RequestCache };
          const pathsToTry = [
            `catholicos-entries?pagination[pageSize]=1&populate[0]=image`,
            `catholicos-entries?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&pagination[pageSize]=1&populate[0]=image`,
          ];
          let catholicosRes: Response | null = null;
          let lastUrl = '';
          for (const path of pathsToTry) {
            lastUrl = `${base}/${path}`;
            if (process.env.NODE_ENV === 'development') {
              console.log('[Bishop] catholicos-entries try:', lastUrl);
            }
            catholicosRes = await fetch(lastUrl, opts);
            if (process.env.NODE_ENV === 'development') {
              console.log('[Bishop] catholicos-entries response:', catholicosRes.status);
            }
            if (catholicosRes.ok) break;
          }
          if (catholicosRes?.ok) {
            const catholicosJson = (await catholicosRes.json()) as { data?: unknown[] | Record<string, unknown> };
            const data = catholicosJson?.data;
            const catholicosRaw = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
            if (catholicosRaw?.image) {
              const url = getMediaUrl(catholicosRaw.image, baseUrl);
              const alt = getMediaAlt(catholicosRaw.image);
              if (process.env.NODE_ENV === 'development') {
                console.log('[Bishop] catholicos-entries image:', url ? 'got url' : 'no url', url ?? '(null)');
              }
              if (url) {
                bishop = { ...bishop, imageUrl: url, imageAlt: alt ?? bishop.imageAlt };
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.log('[Bishop] catholicos-entries: no image in response. keys:', catholicosRaw ? Object.keys(catholicosRaw).join(', ') : 'no data');
            }
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Bishop] catholicos-entries fallback error:', e);
          }
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log('[Bishop] catholicos-entries fallback: no tenantId');
      }
    }

    if (process.env.NODE_ENV === 'development') {
      const hasImage = record.image != null;
      const hasUrl = Boolean(bishop.imageUrl);
      console.log('[Bishop] result', documentId, '| raw.image:', hasImage ? 'present' : 'absent', '| imageUrl:', hasUrl ? bishop.imageUrl : '(null)');
      if (!hasImage) {
        console.log('[Bishop] Strapi response keys:', Object.keys(record).sort().join(', '));
      }
      if (hasImage && !hasUrl) {
        console.log('[Bishop] Strapi raw.image:', JSON.stringify(record.image, null, 2));
      }
    }
    return bishop;
  } catch {
    return null;
  }
}
