import { getAppUrlFromRequestHeaders, getTenantId } from '@/lib/env';
import type { EventDetailsDTO } from '@/types';
import {
  computeFeaturedEventsFromMedia,
  MAX_FEATURED_EVENTS_HOMEPAGE,
  type EventWithMedia,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';

function isEventInNextYear(eventDate: string, today: Date): boolean {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  oneYearFromNow.setHours(23, 59, 59, 999);
  const [year, month, day] = eventDate.split('-').map(Number);
  const eventStartDate = new Date(year, month - 1, day);
  eventStartDate.setHours(0, 0, 0, 0);
  return eventStartDate >= today && eventStartDate <= oneYearFromNow;
}

/**
 * Server-only: same pipeline as `useEventsData` + featured filter, for SSR first paint.
 * Fails closed to [] so the home page still renders if the API is down.
 */
export async function fetchFeaturedEventsForHomepageServer(): Promise<FeaturedEventWithMedia[]> {
  try {
    const baseUrl = await getAppUrlFromRequestHeaders();
    const tenantId = getTenantId();

    let eventsResponse = await fetch(
      `${baseUrl}/api/proxy/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,asc`,
      { cache: 'no-store' }
    );

    if (!eventsResponse.ok) {
      eventsResponse = await fetch(
        `${baseUrl}/api/proxy/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,desc`,
        { cache: 'no-store' }
      );
    }

    if (!eventsResponse.ok) {
      console.warn('[fetchFeaturedEventsForHomepageServer] event-details failed:', eventsResponse.status);
      return [];
    }

    const events: EventDetailsDTO[] = await eventsResponse.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(
      (event) => event.startDate && isEventInNextYear(event.startDate, today) && event.isActive
    );

    const eventsWithMedia: EventWithMedia[] = [];

    for (const event of upcomingEvents) {
      try {
        const mediaResponse = await fetch(
          `${baseUrl}/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}`,
          { cache: 'no-store' }
        );

        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          const mediaArray = Array.isArray(mediaData) ? mediaData : mediaData ? [mediaData] : [];
          eventsWithMedia.push({ event, media: mediaArray });
        } else {
          eventsWithMedia.push({ event, media: [] });
        }
      } catch {
        eventsWithMedia.push({ event, media: [] });
      }
    }

    const featured = computeFeaturedEventsFromMedia(eventsWithMedia);
    return featured.slice(0, MAX_FEATURED_EVENTS_HOMEPAGE);
  } catch (e) {
    console.warn('[fetchFeaturedEventsForHomepageServer]', e);
    return [];
  }
}
