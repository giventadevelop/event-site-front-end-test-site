/**
 * Server-side data for Directory Parishes (Strapi GET /api/parishes).
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §5
 */

import 'server-only';
import { getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { unwrapStrapiRecord, unwrapStrapiRelation } from '@/lib/strapi/unwrapRecord';
import type { Parish, ParishesListResult, StrapiPagination } from './types';

function parseParish(raw: Record<string, unknown>): Parish {
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
  return {
    documentId,
    name,
    slug,
    dioceseName,
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
  page?: number;
  pageSize?: number;
}): Promise<ParishesListResult> {
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!base || !tenantId) return { parishes: [], pagination: DEFAULT_PAGINATION };

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const nameQuery = options.nameSearch?.trim();
  if (nameQuery) params.set('filters[name][$containsi]', nameQuery);
  params.set('sort', 'name:asc');
  params.set('populate[0]', 'diocese');
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
      .map(parseParish);
    return { parishes, pagination };
  } catch {
    return { parishes: [], pagination: DEFAULT_PAGINATION };
  }
}

export async function getParishByDocumentId(documentId: string): Promise<Parish | null> {
  const base = getStrapiApiBase();
  if (!base || !documentId) return null;
  try {
    const res = await fetch(`${base}/parishes/${documentId}?populate[0]=diocese`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const raw = json?.data;
    if (!raw || typeof raw !== 'object') return null;
    return parseParish(raw);
  } catch {
    return null;
  }
}
