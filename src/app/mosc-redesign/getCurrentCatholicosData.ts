/**
 * Server-side data for MOSC redesign homepage Catholicos profile
 * (Strapi GET /api/current-catholicos-entries — api::current-catholicos.current-catholicos).
 */

import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
  getStrapiTenantDocumentId,
} from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { CurrentCatholicosProfile } from './types/currentCatholicos';

const STRAPI_LIST_FETCH: RequestInit = {
  cache: 'no-store',
  next: { revalidate: 0 },
};

/** Canonical Strapi slug (editors update this row in Content Manager). */
export const CURRENT_CATHOLICOS_SLUG = 'his-holiness-baselios-marthoma-mathews-iii';

const FALLBACK_IMAGE = '/images/holy-synod/H.H-Baselios-Marthoma-Mathews-III.jpg';
const FALLBACK_PROFILE_PATH = '/mosc-redesign/holy-synod/his-holiness-baselios-marthoma-mathews-iii';

export const DEFAULT_CURRENT_CATHOLICOS: CurrentCatholicosProfile = {
  documentId: '',
  name: 'His Holiness Baselios Marthoma Mathews III',
  headingPrimary: 'His Holiness Baselios',
  headingAccent: 'Marthoma Mathews III',
  badge: 'Malankara Metropolitan',
  roleTitle: 'Catholicos of the East and Malankara Metropolitan',
  excerpt:
    'His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.',
  imageUrl: FALLBACK_IMAGE,
  imageAlt:
    'His Holiness Baselios Marthoma Mathews III, Catholicos of the East and Malankara Metropolitan, in full episcopal vestments',
  profilePath: FALLBACK_PROFILE_PATH,
};

/** Matches homepage layout: first line before “Marthoma”, accent line from “Marthoma” onward. */
export function splitCatholicosDisplayName(name: string): {
  headingPrimary: string;
  headingAccent: string;
} {
  const marker = 'Marthoma';
  const idx = name.indexOf(marker);
  if (idx > 0) {
    return {
      headingPrimary: name.slice(0, idx).trimEnd(),
      headingAccent: name.slice(idx).trim(),
    };
  }
  return { headingPrimary: name.trim(), headingAccent: '' };
}

async function applyTenantFilter(params: URLSearchParams, tenantId: string): Promise<void> {
  const tenantDocumentId = await getStrapiTenantDocumentId();
  if (tenantDocumentId) {
    params.set('filters[$or][0][tenant][tenantId][$eq]', tenantId);
    params.set('filters[$or][1][tenant][documentId][$eq]', tenantDocumentId);
  } else {
    params.set('filters[tenant][tenantId][$eq]', tenantId);
  }
}

function parseEntry(raw: Record<string, unknown>, baseUrl: string): CurrentCatholicosProfile | null {
  const item = unwrapStrapiRecord(raw);
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!name) return null;

  const { headingPrimary, headingAccent } = splitCatholicosDisplayName(name);
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAltFromMedia = image ? getMediaAlt(image) : null;
  const imageAlt =
    (typeof item.imageAlt === 'string' && item.imageAlt.trim()) ||
    imageAltFromMedia ||
    name;

  return {
    documentId: typeof item.documentId === 'string' ? item.documentId : '',
    name,
    headingPrimary,
    headingAccent,
    badge: typeof item.badge === 'string' ? item.badge : DEFAULT_CURRENT_CATHOLICOS.badge,
    roleTitle: typeof item.roleTitle === 'string' ? item.roleTitle : DEFAULT_CURRENT_CATHOLICOS.roleTitle,
    excerpt: typeof item.excerpt === 'string' ? item.excerpt : DEFAULT_CURRENT_CATHOLICOS.excerpt,
    imageUrl: imageUrl ?? DEFAULT_CURRENT_CATHOLICOS.imageUrl,
    imageAlt,
    profilePath:
      typeof item.profilePath === 'string' && item.profilePath.trim()
        ? item.profilePath.trim()
        : DEFAULT_CURRENT_CATHOLICOS.profilePath,
  };
}

/**
 * Prefer canonical slug (no -mo2) — editors maintain content on tenant_demo_002 rows.
 * Fall back to tenant-scoped -mo2 copy when canonical is missing.
 */
async function fetchCurrentCatholicosEntryBySlug(
  slug: string,
  options?: { tenantId?: string },
): Promise<CurrentCatholicosProfile | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !slug.trim()) {
    return null;
  }

  const params = new URLSearchParams();
  if (options?.tenantId) {
    await applyTenantFilter(params, options.tenantId);
  }
  params.set('filters[slug][$eqi]', slug.trim());
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '1');

  try {
    const res = await fetch(`${base}/current-catholicos-entries?${params.toString()}`, {
      headers: getStrapiHeaders(),
      ...STRAPI_LIST_FETCH,
    });
    if (!res.ok) return null;

    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const raw = list[0];
    if (!raw || typeof raw !== 'object') return null;

    return parseEntry(raw as Record<string, unknown>, baseUrl);
  } catch {
    return null;
  }
}

function mergeCanonicalOverTenant(
  canonical: CurrentCatholicosProfile,
  tenant: CurrentCatholicosProfile,
): CurrentCatholicosProfile {
  return {
    ...tenant,
    documentId: canonical.documentId || tenant.documentId,
    name: canonical.name,
    headingPrimary: canonical.headingPrimary,
    headingAccent: canonical.headingAccent,
    badge: canonical.badge,
    roleTitle: canonical.roleTitle,
    excerpt: canonical.excerpt,
    imageAlt: canonical.imageAlt,
    profilePath: canonical.profilePath || tenant.profilePath,
    imageUrl:
      canonical.imageUrl !== DEFAULT_CURRENT_CATHOLICOS.imageUrl
        ? canonical.imageUrl
        : tenant.imageUrl,
  };
}

export async function getCurrentCatholicosData(): Promise<CurrentCatholicosProfile> {
  noStore();
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base) {
    return DEFAULT_CURRENT_CATHOLICOS;
  }

  const canonical =
    (await fetchCurrentCatholicosEntryBySlug(CURRENT_CATHOLICOS_SLUG)) ??
    (tenantId ? await fetchCurrentCatholicosEntryBySlug(CURRENT_CATHOLICOS_SLUG, { tenantId }) : null);

  const tenantCopy =
    (await fetchCurrentCatholicosEntryBySlug(`${CURRENT_CATHOLICOS_SLUG}-mo2`)) ??
    (tenantId
      ? await fetchCurrentCatholicosEntryBySlug(`${CURRENT_CATHOLICOS_SLUG}-mo2`, { tenantId })
      : null);

  if (canonical && tenantCopy && canonical.documentId !== tenantCopy.documentId) {
    return mergeCanonicalOverTenant(canonical, tenantCopy);
  }

  const resolved = canonical ?? tenantCopy;
  return resolved ?? DEFAULT_CURRENT_CATHOLICOS;
}
