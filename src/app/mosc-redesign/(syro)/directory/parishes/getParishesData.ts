/**
 * Server-side data for Directory Parishes (Strapi GET /api/parishes).
 * API reference: documentation/parish_directory_portal/api_reference.md and directory_api_reference.md §5
 */

import 'server-only';
import { getStrapiUrl, getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '../lib/strapiMedia';
import { unwrapStrapiRecord, unwrapStrapiRelation } from '@/lib/strapi/unwrapRecord';
import type { Parish, ParishesListResult, StrapiPagination } from './types';

function parseParish(raw: Record<string, unknown>, baseUrl: string): Parish {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const address = typeof item.address === 'string' ? item.address : null;
  const addressLine1 = typeof item.addressLine1 === 'string' ? item.addressLine1 : null;
  const addressLine2 = typeof item.addressLine2 === 'string' ? item.addressLine2 : null;
  const email = typeof item.email === 'string' ? item.email : null;
  const phones = typeof item.phones === 'string' ? item.phones : null;
  const phoneSecondary = typeof item.phoneSecondary === 'string' ? item.phoneSecondary : null;
  const city = typeof item.city === 'string' ? item.city : null;
  const state = typeof item.state === 'string' ? item.state : null;
  const postalCode = typeof item.postalCode === 'string' ? item.postalCode : null;
  const country = typeof item.country === 'string' ? item.country : null;
  let dioceseName: string | null = null;
  const diocese = unwrapStrapiRelation(item.diocese);
  if (diocese && typeof diocese.name === 'string') dioceseName = diocese.name;
  let vicarName: string | null = null;
  const vicar = unwrapStrapiRelation(item.vicar);
  if (vicar && typeof vicar.name === 'string') vicarName = vicar.name;
  const image = item.image;
  const imageUrl = image && baseUrl ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? (getMediaAlt(image) ?? null) : null;
  return {
    documentId,
    name,
    slug,
    dioceseName,
    vicarName,
    address,
    addressLine1,
    addressLine2,
    email,
    phones,
    phoneSecondary,
    city,
    state,
    postalCode,
    country,
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

export async function getParishesData(options: {
  nameSearch?: string;
  /** Case-insensitive match on parish vicar (priest) name — Strapi `filters[vicar][name][$containsi]`. */
  vicarNameSearch?: string;
  /** Strapi `filters[diocese][documentId][$eq]` — parishes linked to this diocese. */
  dioceseDocumentId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ParishesListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) return { parishes: [], pagination: DEFAULT_PAGINATION };

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const dioceseId = options.dioceseDocumentId?.trim();
  if (dioceseId) params.set('filters[diocese][documentId][$eq]', dioceseId);
  const nameQuery = options.nameSearch?.trim();
  if (nameQuery) params.set('filters[name][$containsi]', nameQuery);
  const vicarQuery = options.vicarNameSearch?.trim();
  if (vicarQuery) params.set('filters[vicar][name][$containsi]', vicarQuery);
  params.set('sort', 'name:asc');
  params.set('populate[0]', 'diocese');
  params.set('populate[1]', 'image');
  params.set('populate[2]', 'vicar');
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));

  try {
    const res = await fetch(`${base}/parishes?${params.toString()}`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return { parishes: [], pagination: DEFAULT_PAGINATION };
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
    const parishes = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseParish(item, baseUrl));
    return { parishes, pagination };
  } catch {
    return { parishes: [], pagination: DEFAULT_PAGINATION };
  }
}

export async function getParishByDocumentId(documentId: string): Promise<Parish | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !documentId) return null;
  try {
    const res = await fetch(`${base}/parishes/${documentId}?populate[0]=diocese&populate[1]=image&populate[2]=vicar`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const raw = json?.data;
    if (!raw || typeof raw !== 'object') return null;
    return parseParish(raw, baseUrl);
  } catch {
    return null;
  }
}
