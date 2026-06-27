/**
 * Server-side data for Kalpana edition detail (documents list per year).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { KalpanaDocument, KalpanaEdition } from './types';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import {
  DEFAULT_EDITIONS,
  findEditionBySlug,
  fetchKalpanaEditionBySlugDirect,
  getKalpanaCmsData,
  synthesizeKalpanaEditionFromSlug,
} from './getKalpanaData';

function parseDocument(raw: Record<string, unknown>, baseUrl: string): KalpanaDocument {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const title = typeof item.title === 'string' ? item.title : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const sourceUrl = typeof item.sourceUrl === 'string' && item.sourceUrl.trim() ? item.sourceUrl.trim() : null;
  const kalpanaNumber =
    typeof item.kalpanaNumber === 'string' && item.kalpanaNumber.trim() ? item.kalpanaNumber.trim() : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const pdf = item.pdf;
  const pdfUrl = pdf ? getMediaUrl(pdf, baseUrl) : sourceUrl;

  return {
    documentId,
    title,
    slug,
    pdfUrl,
    sourceUrl,
    kalpanaNumber,
    order,
  };
}

export async function getKalpanaEditionBySlug(editionSlug: string): Promise<KalpanaEdition | null> {
  if (!editionSlug?.trim()) return null;

  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();

  if (baseUrl && base && tenantId) {
    try {
      const direct = await fetchKalpanaEditionBySlugDirect(editionSlug, baseUrl, base, tenantId);
      if (direct) return direct;
    } catch {
      // fall through to cached list / defaults
    }
  }

  const { editions } = await getKalpanaCmsData();
  const fromList = findEditionBySlug(editions, editionSlug);
  if (fromList) return fromList;

  const fromDefaults = findEditionBySlug(DEFAULT_EDITIONS, editionSlug);
  if (fromDefaults) return fromDefaults;

  return synthesizeKalpanaEditionFromSlug(editionSlug);
}

async function fetchKalpanaDocumentsFromStrapi(
  base: string,
  baseUrl: string,
  tenantId: string,
  editionFilter: { slug?: string; year?: string },
): Promise<KalpanaDocument[]> {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  if (editionFilter.slug) {
    params.set('filters[edition][slug][$eqi]', editionFilter.slug);
  } else if (editionFilter.year) {
    params.set('filters[edition][year][$eq]', editionFilter.year);
  }
  params.set('sort', 'order:desc,title:asc');
  params.set('populate[0]', 'pdf');
  params.set('pagination[pageSize]', '500');

  const res = await fetch(`${base}/kalpana-documents?${params.toString()}`, {
    headers: getStrapiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];

  const json = (await res.json()) as { data?: unknown[] };
  const list = Array.isArray(json?.data) ? json.data : [];
  return list
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => parseDocument(item, baseUrl))
    .filter((doc) => doc.title);
}

export async function getKalpanaDocumentsByEditionSlug(editionSlug: string): Promise<KalpanaDocument[]> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !editionSlug) {
    return [];
  }

  try {
    let documents = await fetchKalpanaDocumentsFromStrapi(base, baseUrl, tenantId, { slug: editionSlug });

    // Strapi edition slugs may include a tenant suffix (e.g. kalpana-2025-mo2) while URLs use kalpana-2025
    if (documents.length === 0) {
      const yearMatch = /^kalpana-(\d{4})$/i.exec(editionSlug.trim());
      if (yearMatch) {
        documents = await fetchKalpanaDocumentsFromStrapi(base, baseUrl, tenantId, { year: yearMatch[1] });
      }
    }

    return documents;
  } catch {
    return [];
  }
}
