/**
 * Server-side data layer for the Directory Portal homepage.
 * Fetches directory-home single type from Strapi and returns normalized data.
 *
 * API reference: documentation/parish_directory_portal/directory_api_reference.md
 */

import 'server-only';
import { fetchStrapi, getStrapiUrl, getStrapiTenantId } from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import type { DirectoryHomeData, DirectorySectionCard } from './types';

/** Strapi 5: array-style populate only (no comma-separated). */
const POPULATE = 'populate[sectionCards][populate][0]=image';

/**
 * Extracts media URL from Strapi 4 or Strapi 5 media structure.
 * Strapi 5: media.url or media.data.url (flattened).
 */
function getMediaUrl(media: unknown, baseUrl: string): string | null {
  if (!media || !baseUrl) return null;
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) {
    m = media[0] as Record<string, unknown>;
  }
  let url: string | undefined = m?.url as string | undefined;
  if (!url) {
    const data = m?.data as Record<string, unknown> | undefined;
    url = data?.url as string | undefined;
  }
  if (!url) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url && m?.formats) {
    const formats = m.formats as Record<string, { url?: string }>;
    url = formats?.thumbnail?.url ?? formats?.small?.url ?? formats?.medium?.url;
  }
  if (!url || typeof url !== 'string') return null;
  return url.startsWith('http') ? url : `${baseUrl}${url}`;
}

/** Extracts alternativeText/caption from Strapi media structure. */
function getMediaAlt(media: unknown): string | undefined {
  if (!media) return undefined;
  const m = media as Record<string, unknown>;
  let alt = m?.alternativeText as string | undefined;
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    alt = data?.alternativeText as string | undefined;
  }
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    alt = attrs?.alternativeText as string | undefined;
  }
  return alt;
}

/** Safe default when Strapi is unavailable or returns no data. */
const DEFAULT: DirectoryHomeData = {
  introText: null,
  sectionCards: [],
};

/**
 * Fetches directory-home from Strapi and normalizes to DirectoryHomeData.
 * On missing env, fetch error, or parse error, returns a safe default so the page still renders.
 */
export async function getDirectoryHomeData(): Promise<DirectoryHomeData> {
  const baseUrl = getStrapiUrl();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !tenantId) {
    return DEFAULT;
  }

  const filter = `filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}`;
  const path = `directory-home?${filter}&${POPULATE}`;

  const result = await fetchStrapi<{
    introText?: string | null;
    sectionCards?: Array<{
      title?: string;
      description?: string | null;
      linkUrl?: string | null;
      image?: unknown;
    }>;
  }>(path);

  if (!result?.data) {
    return DEFAULT;
  }

  const raw = result.data;
  const data = unwrapStrapiRecord(
    typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  );
  const introText =
    typeof data.introText === 'string' && data.introText.trim()
      ? data.introText.trim()
      : null;

  const sectionCards: DirectorySectionCard[] = [];
  const cards = data.sectionCards;
  if (Array.isArray(cards)) {
    for (const card of cards) {
      const title = typeof card?.title === 'string' ? card.title : '';
      const description =
        typeof card?.description === 'string' ? card.description : null;
      const linkUrl =
        typeof card?.linkUrl === 'string' && card.linkUrl.trim()
          ? card.linkUrl.trim()
          : null;
      const imageUrl = card?.image
        ? getMediaUrl(card.image, baseUrl)
        : null;
      const imageAlt = card?.image ? getMediaAlt(card.image) ?? null : null;

      sectionCards.push({
        title,
        description: description || null,
        linkUrl,
        imageUrl,
        imageAlt,
      });
    }
  }

  return {
    introText,
    sectionCards,
  };
}
