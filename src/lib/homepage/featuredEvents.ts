import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { isTruthyApiFlag } from '@/lib/homepage/homepageApiNormalize';

/** Same shape as `useEventsData` / `useFilteredEvents` input */
export interface EventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
}

/**
 * One featured card. `media` stays non-null for classic FeaturedEventsSection /
 * LiveEventsSection (`media.fileUrl`). Optional `imageUrl` for later UI upgrades.
 */
export interface FeaturedEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
  imageUrl?: string | null;
}

export const MAX_FEATURED_EVENTS_HOMEPAGE = 3;

type MediaRow = EventMediaDTO & Record<string, unknown>;

function readStringField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function mediaIsDisplayableNow(mediaItem: MediaRow, today: Date): boolean {
  const displayDateValue =
    readStringField(mediaItem, 'startDisplayingFromDate', 'start_displaying_from_date') || undefined;
  if (!displayDateValue) return true;
  try {
    const [year, month, day] = displayDateValue.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day);
    displayDate.setHours(0, 0, 0, 0);
    return displayDate <= today;
  } catch {
    return true;
  }
}

function isFeaturedImageFlag(mediaItem: MediaRow): boolean {
  return isTruthyApiFlag(mediaItem.isFeaturedEventImage) || isTruthyApiFlag(mediaItem.is_featured_event_image);
}

function isHeroLikeFlag(mediaItem: MediaRow): boolean {
  return (
    isTruthyApiFlag(mediaItem.isHomePageHeroImage) ||
    isTruthyApiFlag(mediaItem.is_home_page_hero_image) ||
    isTruthyApiFlag(mediaItem.isHeroImage) ||
    isTruthyApiFlag(mediaItem.is_hero_image) ||
    isTruthyApiFlag(mediaItem.eventFlyer) ||
    isTruthyApiFlag(mediaItem.event_flyer)
  );
}

/** Resolve a usable image URL from a media row (camelCase + snake_case). */
export function mediaImageUrl(mediaItem: EventMediaDTO | null | undefined): string | undefined {
  if (!mediaItem) return undefined;
  const row = mediaItem as MediaRow;
  return (
    readStringField(row, 'preSignedUrl', 'pre_signed_url') ||
    readStringField(row, 'fileUrl', 'file_url') ||
    readStringField(
      row,
      'thumbnailPreSignedUrl',
      'thumbnail_pre_signed_url',
      'thumbnailUrl',
      'thumbnail_url'
    ) ||
    undefined
  );
}

function pickBestMedia(media: EventMediaDTO[], today: Date): EventMediaDTO | null {
  const rows = media as MediaRow[];
  const withUrl = rows.filter((m) => mediaImageUrl(m));
  if (withUrl.length === 0) return null;

  const displayable = withUrl.filter((m) => mediaIsDisplayableNow(m, today));
  const pool = displayable.length > 0 ? displayable : withUrl;

  return (
    pool.find((m) => isFeaturedImageFlag(m)) ||
    pool.find((m) => isHeroLikeFlag(m)) ||
    pool[0] ||
    null
  );
}

function pickLegacyFeaturedImageMedia(media: EventMediaDTO[], today: Date): EventMediaDTO | null {
  const rows = (media as MediaRow[]).filter(
    (m) => isFeaturedImageFlag(m) && mediaImageUrl(m) && mediaIsDisplayableNow(m, today)
  );
  return rows[0] || null;
}

function eventIsFeatured(event: EventDetailsDTO): boolean {
  const row = event as EventDetailsDTO & Record<string, unknown>;
  return isTruthyApiFlag(row.isFeaturedEvent) || isTruthyApiFlag(row.is_featured_event);
}

/**
 * Featured strip logic for homepage.
 * - Preferred: event `isFeaturedEvent` + best image (featured / hero / any URL).
 * - Legacy: media `isFeaturedEventImage` only (older tenants without event checkbox).
 * Sorted by `featuredEventPriorityRanking` ascending when present.
 */
export function computeFeaturedEventsFromMedia(eventsWithMedia: EventWithMedia[]): FeaturedEventWithMedia[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const results: FeaturedEventWithMedia[] = [];

  for (const { event, media } of eventsWithMedia) {
    const chosen = eventIsFeatured(event)
      ? pickBestMedia(media, today)
      : pickLegacyFeaturedImageMedia(media, today);

    if (!chosen) continue;

    results.push({
      event,
      media: chosen,
      imageUrl: mediaImageUrl(chosen) ?? null,
    });
  }

  return results.sort(
    (a, b) =>
      ((a.event as EventDetailsDTO & { featuredEventPriorityRanking?: number })
        .featuredEventPriorityRanking ?? 0) -
      ((b.event as EventDetailsDTO & { featuredEventPriorityRanking?: number })
        .featuredEventPriorityRanking ?? 0)
  );
}

export function getFeaturedEventImageUrl(item: FeaturedEventWithMedia): string | null {
  if (item.imageUrl) return item.imageUrl;
  return mediaImageUrl(item.media) ?? null;
}
