import { cache } from 'react';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { isTicketedEventCube } from '@/lib/eventcube/utils';
import type { EventDetailsDTO } from '@/types';

interface EventMedia {
  id: number;
  fileUrl: string;
  eventFlyer?: boolean;
  isFeaturedImage?: boolean;
  isHeroImage?: boolean;
  isHomePageHeroImage?: boolean;
}

export interface EventcubeCheckoutData {
  event: EventDetailsDTO;
  heroImageUrl: string;
  eventcubeEmbedUrl: string;
  /** Optional order/checkout URL – when set, user can load it in same iframe to keep checkout embedded */
  eventcubeOrderUrl?: string;
}

const DEFAULT_HERO_IMAGE = '/images/default_placeholder_hero_image.jpeg';

/**
 * Cached server-side data fetcher for eventcube-checkout page.
 * Only for ticketed events with Event Cube embed URL.
 * Returns hero image and Event Cube embed URL.
 */
export const getEventcubeCheckoutData = cache(async (eventId: string): Promise<EventcubeCheckoutData> => {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

  if (!getApiBase()) {
    throw new Error('API_BASE_URL not configured');
  }

  try {
    const eventRes = await fetchWithJwtRetry(
      `${getApiBase()}/api/event-details/${eventId}`,
      { cache: 'no-store' }
    );

    if (!eventRes.ok) {
      if (eventRes.status === 404) throw new Error('Event not found');
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventDetailsDTO = await eventRes.json();

    if (!isTicketedEventCube(event)) {
      throw new Error('This event does not support Event Cube embed checkout. Use the standard checkout flow.');
    }

    const embedUrl = event.eventcubeEmbedUrl?.trim();
    if (!embedUrl) {
      throw new Error('Event Cube is not configured for this event. Please set the Event Cube embed URL.');
    }
    const orderUrl = event.eventcubeOrderUrl?.trim() || undefined;

    // Resolve hero image (same priority as givebutter-checkout)
    let heroImageUrl = DEFAULT_HERO_IMAGE;
    const baseUrl = getAppUrl();

    try {
      let mediaRes = await fetch(
        `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`,
        { cache: 'no-store' }
      );
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        const mediaArray: EventMedia[] = Array.isArray(mediaData) ? mediaData : mediaData ? [mediaData] : [];
        if (mediaArray.length > 0 && mediaArray[0].fileUrl) heroImageUrl = mediaArray[0].fileUrl;
      }

      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        mediaRes = await fetch(
          `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`,
          { cache: 'no-store' }
        );
        if (mediaRes.ok) {
          const heroMediaData = await mediaRes.json();
          const heroMediaArray: EventMedia[] = Array.isArray(heroMediaData) ? heroMediaData : heroMediaData ? [heroMediaData] : [];
          if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) heroImageUrl = heroMediaArray[0].fileUrl;
        }
      }

      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        mediaRes = await fetch(
          `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`,
          { cache: 'no-store' }
        );
        if (mediaRes.ok) {
          const flyerData = await mediaRes.json();
          const flyerArray: EventMedia[] = Array.isArray(flyerData) ? flyerData : flyerData ? [flyerData] : [];
          if (flyerArray.length > 0 && flyerArray[0].fileUrl) heroImageUrl = flyerArray[0].fileUrl;
        }
      }

      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        mediaRes = await fetch(
          `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`,
          { cache: 'no-store' }
        );
        if (mediaRes.ok) {
          const featuredData = await mediaRes.json();
          const featuredArray = Array.isArray(featuredData) ? featuredData : featuredData ? [featuredData] : [];
          if (featuredArray.length > 0 && featuredArray[0].fileUrl) heroImageUrl = featuredArray[0].fileUrl;
        }
      }
    } catch (err) {
      console.error('[EventcubeCheckoutServerData] Error fetching hero image:', err);
    }

    return {
      event,
      heroImageUrl,
      eventcubeEmbedUrl: embedUrl,
      eventcubeOrderUrl: orderUrl,
    };
  } catch (error) {
    console.error('[EventcubeCheckoutServerData] Error:', error);
    if (error instanceof Error) throw error;
    throw new Error('Unable to load checkout data. Please try again later.');
  }
});
