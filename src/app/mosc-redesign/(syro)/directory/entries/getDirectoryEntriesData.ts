/**
 * Server-side data for Directory Entries (Strapi GET /api/directory-entries).
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §8
 */

import 'server-only';
import { getStrapiUrl, getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '../lib/strapiMedia';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import type { DirectoryEntry, DirectoryEntryType, DirectoryEntriesListResult, StrapiPagination } from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): DirectoryEntry {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const directoryType = (item.directoryType as DirectoryEntryType) ?? 'institutions';
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
    directoryType,
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

const DEFAULT_PAGINATION: StrapiPagination = {
  page: 1,
  pageCount: 0,
  pageSize: 10,
  total: 0,
};

export async function getDirectoryEntriesData(options: {
  directoryType: DirectoryEntryType;
  nameSearch?: string;
  page?: number;
  pageSize?: number;
}): Promise<DirectoryEntriesListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return { entries: [], pagination: DEFAULT_PAGINATION };
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('filters[directoryType][$eq]', options.directoryType);
  const nameQuery = options.nameSearch?.trim();
  if (nameQuery) params.set('filters[name][$containsi]', nameQuery);
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));

  try {
    const res = await fetch(`${base}/directory-entries?${params.toString()}`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return { entries: [], pagination: DEFAULT_PAGINATION };
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
    const entries = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseEntry(item, baseUrl));
    return { entries, pagination };
  } catch {
    return { entries: [], pagination: DEFAULT_PAGINATION };
  }
}

export async function getDirectoryEntryByDocumentId(documentId: string): Promise<DirectoryEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !documentId) return null;
  try {
    const res = await fetch(`${base}/directory-entries/${documentId}?populate[0]=image`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const raw = json?.data;
    if (!raw || typeof raw !== 'object') return null;
    return parseEntry(raw, baseUrl);
  } catch {
    return null;
  }
}
