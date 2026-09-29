import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { logServerFetchFailure } from '@/lib/logServerFetchFailure';
import type { EventDetailsDTO } from '@/types';
import {
  computeFeaturedEventsFromMedia,
  MAX_FEATURED_EVENTS_HOMEPAGE,
  type EventWithMedia,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';
import {
  isTruthyApiFlag,
  normalizeEventDetailsList,
  normalizeEventMediasList,
} from '@/lib/homepage/homepageApiNormalize';

function isEventInNextYear(eventDate: string, today: Date): boolean {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  oneYearFromNow.setHours(23, 59, 59, 999);
  const [year, month, day] = eventDate.split('-').map(Number);
  const eventStartDate = new Date(year, month - 1, day);
  eventStartDate.setHours(0, 0, 0, 0);
  return eventStartDate >= today && eventStartDate <= oneYearFromNow;
}

function eventIsFeatured(event: EventDetailsDTO): boolean {
  const row = event as EventDetailsDTO & Record<string, unknown>;
  return isTruthyApiFlag(row.isFeaturedEvent) || isTruthyApiFlag(row.is_featured_event);
}

/**
 * Server-only: featured events for homepage SSR / later UI wiring.
 * Prefers upcoming active featured; falls back to any active featured (incl. past).
 * Fails closed to [].
 */
export async function fetchFeaturedEventsForHomepageServer(): Promise<FeaturedEventWithMedia[]> {
  try {
    const apiBase = getApiBaseUrl();
    const tenantId = getTenantId();

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
      console.warn('[fetchFeaturedEventsForHomepageServer] event-details failed:', eventsResponse.status);
      return [];
    }

    const events = normalizeEventDetailsList(await eventsResponse.json());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(
      (event) => event.startDate && isEventInNextYear(event.startDate, today) && event.isActive !== false
    );

    const featuredCandidates = upcomingEvents.filter(eventIsFeatured);
    const anyFeaturedActive = events.filter(
      (event) => event.isActive !== false && eventIsFeatured(event)
    );

    // Prefer upcoming featured → any featured (incl. past) → all upcoming (legacy media-flag path)
    const eventsToLoad =
      featuredCandidates.length > 0
        ? featuredCandidates
        : anyFeaturedActive.length > 0
          ? anyFeaturedActive
          : upcomingEvents;

    const eventsWithMedia: EventWithMedia[] = [];

    for (const event of eventsToLoad) {
      try {
        let mediaResponse = await fetchWithJwtRetry(
          `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isFeaturedEventImage.equals=true`,
          { cache: 'no-store' }
        );
        let mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHomePageHeroImage.equals=true`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        }

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHeroImage.equals=true`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        }

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&size=50`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        }

        eventsWithMedia.push({ event, media: mediaArray });
      } catch {
        eventsWithMedia.push({ event, media: [] });
      }
    }

    const featured = computeFeaturedEventsFromMedia(eventsWithMedia);
    return featured.slice(0, MAX_FEATURED_EVENTS_HOMEPAGE);
  } catch (e) {
    logServerFetchFailure('fetchFeaturedEventsForHomepageServer', e);
    return [];
  }
}
