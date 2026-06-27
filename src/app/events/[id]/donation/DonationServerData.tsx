import { cache } from 'react';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { isDonationBasedEvent, getDonationMetadata } from '@/lib/donation/utils';
import type { EventDetailsDTO } from '@/types';

export interface DonationCheckoutData {
  event: EventDetailsDTO;
  isDonationBased: boolean;
  isFundraiserEvent: boolean;
  isCharityEvent: boolean;
  givebutterCampaignId?: string;
  heroImageUrl: string;
}

const DEFAULT_HERO_IMAGE = '/images/default_placeholder_hero_image.jpeg';

/**
 * Cached server-side data fetcher for donation checkout
 * Uses fetchWithJwtRetry for backend API calls (cursor rules pattern)
 */
export const getDonationCheckoutData = cache(async (eventId: string): Promise<DonationCheckoutData> => {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

  if (!getApiBase()) {
    throw new Error('API_BASE_URL not configured');
  }

  const tenantId = getTenantId();

  try {
    console.log('[DonationServerData] Fetching event data server-side for eventId:', eventId);

    // Fetch event details
    let eventRes;
    try {
      eventRes = await fetchWithJwtRetry(
        `${getApiBase()}/api/event-details/${eventId}`,
        {
          cache: 'no-store',
        }
      );
    } catch (fetchError) {
      console.error('[DonationServerData] Network error fetching event:', fetchError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    if (!eventRes.ok) {
      if (eventRes.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventDetailsDTO = await eventRes.json();

    // Check if event is donation-based
    const isDonationBased = isDonationBasedEvent(event);
    const donationMeta = getDonationMetadata(event);

    // Fetch hero image
    let heroImageUrl = DEFAULT_HERO_IMAGE;
    if (event.id) {
      try {
        const mediaRes = await fetchWithJwtRetry(
          `${getApiBase()}/api/event-medias?eventId.equals=${event.id}&isActiveHeroImage.equals=true&size=1`,
          { cache: 'no-store' }
        );

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData) && mediaData.length > 0) {
            const heroMedia = mediaData[0];
            heroImageUrl = heroMedia.fileUrl || heroMedia.preSignedUrl || DEFAULT_HERO_IMAGE;
          }
        }
      } catch (mediaError) {
        console.warn('[DonationServerData] Error fetching hero image, using default:', mediaError);
      }
    }

    return {
      event,
      isDonationBased,
      isFundraiserEvent: donationMeta.isFundraiserEvent,
      isCharityEvent: donationMeta.isCharityEvent,
      givebutterCampaignId: donationMeta.givebutterCampaignId,
      heroImageUrl,
    };
  } catch (error) {
    console.error('[DonationServerData] Error:', error);
    throw error;
  }
});
