/**
 * Server-side data for Directory Dioceses (Strapi GET /api/dioceses).
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §4
 */

import 'server-only';
import { getStrapiUrl, getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '../lib/strapiMedia';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import type { Diocese, DiocesesListResult, StrapiPagination } from './types';

function parseDiocese(raw: Record<string, unknown>, baseUrl: string): Diocese {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const description = typeof item.description === 'string' ? item.description : null;
  const address = typeof item.address === 'string' ? item.address : null;
  const email = typeof item.email === 'string' ? item.email : null;
  const phones = typeof item.phones === 'string' ? item.phones : null;
  const website = typeof item.website === 'string' ? item.website : null;
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
  };
}

const DEFAULT_PAGINATION: StrapiPagination = {
  page: 1,
  pageCount: 0,
  pageSize: 10,
  total: 0,
};

export async function getDiocesesData(options: {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
}): Promise<DiocesesListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return { dioceses: [], pagination: DEFAULT_PAGINATION };
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const nameQuery = options.nameSearch?.trim();
  if (nameQuery) params.set('filters[name][$containsi]', nameQuery);
  params.set('sort', 'name:asc');
  params.set('populate[0]', 'image');
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));

  const path = `dioceses?${params.toString()}`;
  const url = `${base}/${path}`;

  try {
    const res = await fetch(url, { headers: getStrapiHeaders(), cache: 'no-store' });
    if (!res.ok) return { dioceses: [], pagination: DEFAULT_PAGINATION };
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
    const dioceses = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseDiocese(item, baseUrl));
    return { dioceses, pagination };
  } catch {
    return { dioceses: [], pagination: DEFAULT_PAGINATION };
  }
}

export async function getDioceseByDocumentId(documentId: string): Promise<Diocese | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !documentId) return null;
  try {
    const res = await fetch(`${base}/dioceses/${documentId}?populate[0]=image`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const raw = json?.data;
    if (!raw || typeof raw !== 'object') return null;
    return parseDiocese(raw, baseUrl);
  } catch {
    return null;
  }
}
