import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { logServerFetchFailure } from '@/lib/logServerFetchFailure';
import type { EventDetailsDTO } from '@/types';
import type { FeaturedEventWithMedia } from '@/lib/homepage/featuredEvents';
import {
  normalizeEventDetailsList,
  normalizeEventMediasList,
} from '@/lib/homepage/homepageApiNormalize';
import { mediaImageUrl } from '@/lib/homepage/featuredEvents';

const MAX_LIVE_EVENTS_HOMEPAGE = 3;

function toLocalDate(dateValue?: string | null): Date | null {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isLiveToday(event: EventDetailsDTO, today: Date): boolean {
  if (event.isActive === false) return false;
  const start = toLocalDate(event.startDate);
  if (!start) return false;
  const end = toLocalDate(event.endDate) ?? start;
  return start <= today && end >= today;
}

/**
 * Server-only: events happening today for homepage "Live Events" SSR / later wiring.
 * Only returns rows with a resolvable media URL (classic UI expects `media.fileUrl`).
 */
export async function fetchLiveEventsForHomepageServer(): Promise<FeaturedEventWithMedia[]> {
  try {
    const apiBase = getApiBaseUrl();
    const tenantId = getTenantId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let eventsResponse = await fetchWithJwtRetry(
      `${apiBase}/api/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,asc`,
      { cache: 'no-store' }
    );

    if (!eventsResponse.ok) {
      eventsResponse = await fetchWithJwtRetry(
        `${apiBase}/api/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,desc`,
        { cache: 'no-store' }
      );
    }

    if (!eventsResponse.ok) {
      console.warn('[fetchLiveEventsForHomepageServer] event-details failed:', eventsResponse.status);
      return [];
    }

    const events = normalizeEventDetailsList(await eventsResponse.json());
    const todayLiveEvents = events.filter((event) => isLiveToday(event, today)).slice(0, MAX_LIVE_EVENTS_HOMEPAGE);

    const liveItems: FeaturedEventWithMedia[] = [];
    for (const event of todayLiveEvents) {
      try {
        const mediaResponse = await fetchWithJwtRetry(
          `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&size=30&sort=updatedAt,desc`,
          { cache: 'no-store' }
        );
        const mediaRows = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        const chosenMedia = mediaRows.find((row) => mediaImageUrl(row));
        if (!chosenMedia) continue;

        liveItems.push({
          event,
          media: chosenMedia,
          imageUrl: mediaImageUrl(chosenMedia) ?? null,
        });
      } catch {
        // skip event if media load fails
      }
    }

    return liveItems;
  } catch (error) {
    logServerFetchFailure('fetchLiveEventsForHomepageServer', error);
    return [];
  }
}
