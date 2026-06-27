import type { EventMediaDTO } from '@/types';
import { isAwsPresignedQueryUrl, isPresignedUrlExpired } from '@/lib/officialDocumentDownload';

/** Event media row as returned by the API (camelCase and snake_case). */
export type HeroMediaRow = EventMediaDTO & {
  event_id?: number | null;
  file_url?: string;
  pre_signed_url?: string;
  pre_signed_url_expires_at?: string | null;
  is_hero_image?: boolean;
  is_home_page_hero_image?: boolean;
  start_displaying_from_date?: string;
  home_page_hero_display_duration_seconds?: number | null;
  display_order?: number | null;
};

export function normalizeEventMediasResponse(data: unknown): EventMediaDTO[] {
  if (Array.isArray(data)) return data as EventMediaDTO[];
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: EventMediaDTO[] }).content;
  }
  if (data && typeof data === 'object') return [data as EventMediaDTO];
  return [];
}

/** Hero media is shown only if startDisplayingFromDate is null or <= today. */
export function isHeroMediaDisplayDateValid(media: HeroMediaRow): boolean {
  const displayDateValue = media.startDisplayingFromDate ?? media.start_displaying_from_date;
  if (!displayDateValue) return true;
  try {
    const [year, month, day] = displayDateValue.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day);
    displayDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return displayDate <= today;
  } catch {
    return true;
  }
}

/** True when media is flagged for the homepage hero slider. */
export function isHeroFlaggedMedia(media: HeroMediaRow): boolean {
  const homePage = media.isHomePageHeroImage === true || media.is_home_page_hero_image === true;
  const hero = media.isHeroImage === true || media.is_hero_image === true;
  return homePage || hero;
}

function readStringField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickUsableUrl(
  preSigned?: string | null,
  stable?: string | null,
  expiresAtIso?: string | null
): string | null {
  const pre = preSigned?.trim();
  if (pre && !isPresignedUrlExpired(pre, expiresAtIso)) {
    return pre;
  }

  const stableUrl = stable?.trim();
  if (!stableUrl) {
    return null;
  }

  if (isAwsPresignedQueryUrl(stableUrl)) {
    return isPresignedUrlExpired(stableUrl, expiresAtIso) ? null : stableUrl;
  }

  return stableUrl;
}

/** Resolved image URL for the homepage hero slideshow (prefers fresh presign when needed). */
export function getHeroSliderImageUrl(media: HeroMediaRow): string | undefined {
  const row = media as Record<string, unknown>;
  const preSigned =
    readStringField(row, 'preSignedUrl', 'pre_signed_url') || media.preSignedUrl?.trim() || '';
  const fileUrl = readStringField(row, 'fileUrl', 'file_url') || media.fileUrl?.trim() || '';
  const expiresAt =
    readStringField(row, 'preSignedUrlExpiresAt', 'pre_signed_url_expires_at') ||
    media.preSignedUrlExpiresAt ||
    null;

  return pickUsableUrl(preSigned, fileUrl, expiresAt) ?? undefined;
}

export function heroDisplayOrderValue(media: HeroMediaRow): number {
  const order = media.displayOrder ?? media.display_order;
  if (order == null || Number.isNaN(Number(order))) return 9999;
  return Number(order);
}

export function compareHeroMediaByDisplayOrder(a: HeroMediaRow, b: HeroMediaRow): number {
  const diff = heroDisplayOrderValue(a) - heroDisplayOrderValue(b);
  if (diff !== 0) return diff;
  return (a.id ?? 0) - (b.id ?? 0);
}

export function getHeroMediaDurationMs(media: HeroMediaRow): number {
  const sec = media.homePageHeroDisplayDurationSeconds ?? media.home_page_hero_display_duration_seconds;
  return sec != null && sec > 0 ? Math.max(1000, Math.min(600000, sec * 1000)) : 8000;
}

const HERO_FETCH_PAGE_SIZE = 100;

/**
 * Load all homepage hero candidates (isHeroImage OR isHomePageHeroImage), sorted by displayOrder ascending.
 * Includes event-linked and standalone media — matches Admin → Media “Hero images only” expectations.
 */
export async function fetchHomepageHeroMediaList(tenantId: string): Promise<HeroMediaRow[]> {
  const seenIds = new Set<number>();
  const merged: HeroMediaRow[] = [];

  const append = (raw: HeroMediaRow[]) => {
    for (const item of raw) {
      if (!isHeroFlaggedMedia(item) || !isHeroMediaDisplayDateValid(item)) continue;
      const id = item.id;
      if (id == null || seenIds.has(id)) continue;
      seenIds.add(id);
      merged.push(item);
    }
  };

  const queries = [
    `isHeroImage.equals=true`,
    `isHomePageHeroImage.equals=true`,
  ] as const;

  for (const flag of queries) {
    const res = await fetch(
      `/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&${flag}&size=${HERO_FETCH_PAGE_SIZE}&sort=displayOrder,asc`,
      { cache: 'no-store' }
    );
    if (!res.ok) continue;
    const data = await res.json();
    append(normalizeEventMediasResponse(data) as HeroMediaRow[]);
  }

  merged.sort(compareHeroMediaByDisplayOrder);
  return merged;
}
