import { cache } from 'react';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import { isDonationBasedEvent, getDonationMetadata, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import type { EventDetailsDTO } from '@/types';

interface TicketType {
  id: number;
  name: string;
  description: string;
  price: number;
  availableQuantity?: number;
  soldQuantity?: number;
  remainingQuantity?: number;
  maxQuantityPerOrder?: number;
  isActive: boolean;
}

interface DiscountCode {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  usesCount: number;
  maxUses?: number;
}

interface EventMedia {
  id: number;
  fileUrl: string;
  eventFlyer?: boolean;
  isFeaturedImage?: boolean;
  isHeroImage?: boolean;
  isHomePageHeroImage?: boolean;
}

export interface DonationCheckoutData {
  event: EventDetailsDTO;
  ticketTypes: TicketType[];
  discounts: DiscountCode[];
  heroImageUrl: string;
  isDonationBased: boolean;
  isTicketedFundraiser: boolean;
  isFundraiserEvent: boolean;
  isCharityEvent: boolean;
  givebutterCampaignId?: string;
  isOffering: boolean; // Check if event is OFFERING type
}

const DEFAULT_HERO_IMAGE = '/images/default_placeholder_hero_image.jpeg';

/**
 * Cached server-side data fetcher for donation-checkout page
 * This page handles:
 * - DONATION_BASED events
 * - OFFERING events
 * - Ticketed fundraiser/charity events (TICKETED + donation-based)
 * 
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
    console.log('[DonationCheckoutServerData] Fetching event data server-side for eventId:', eventId);

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
      console.error('[DonationCheckoutServerData] Network error fetching event:', fetchError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    if (!eventRes.ok) {
      if (eventRes.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventDetailsDTO = await eventRes.json();

    // Check event type
    const isDonationBased = isDonationBasedEvent(event);
    const isTicketedFundraiser = isTicketedFundraiserEvent(event);
    const isOffering = event.admissionType?.toUpperCase() === 'OFFERING';
    const donationMeta = getDonationMetadata(event);

    // Verify this page is appropriate for this event
    if (!isDonationBased && !isOffering && !isTicketedFundraiser) {
      throw new Error('This event does not support donation-based checkout. Please use the standard checkout flow.');
    }

    // Fetch ticket types (only for ticketed fundraisers)
    let ticketTypes: TicketType[] = [];
    if (isTicketedFundraiser || event.admissionType?.toUpperCase() === 'TICKETED') {
      try {
        const ticketRes = await fetchWithJwtRetry(
          `${getApiBase()}/api/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true&tenantId.equals=${tenantId}`,
          {
            cache: 'no-store',
          }
        );

        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          ticketTypes = Array.isArray(ticketData) ? ticketData : [];
        }
      } catch (error) {
        console.error('[DonationCheckoutServerData] Error fetching tickets:', error);
        // Continue without tickets
      }
    }

    // Fetch discount codes
    let discounts: DiscountCode[] = [];
    try {
      const discountRes = await fetchWithJwtRetry(
        `${getApiBase()}/api/discount-codes?eventId.equals=${eventId}&isActive.equals=true&tenantId.equals=${tenantId}`,
        {
          cache: 'no-store',
        }
      );

      if (discountRes.ok) {
        const discountData = await discountRes.json();
        discounts = Array.isArray(discountData) ? discountData : [];
      }
    } catch (error) {
      console.error('[DonationCheckoutServerData] Error fetching discounts:', error);
      // Continue without discounts
    }

    // Fetch hero image - Priority: Homepage Hero > Regular Hero > Flyer > Featured Image
    let heroImageUrl = DEFAULT_HERO_IMAGE;
    const baseUrl = getAppUrl();

    try {
      console.log('[DonationCheckoutServerData] 🔍 Starting hero image fetch for eventId:', eventId);

      // 1. Try homepage hero image first
      const homepageHeroUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`;
      let mediaRes = await fetch(homepageHeroUrl, { cache: 'no-store' });

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        const mediaArray: EventMedia[] = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
        if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
          heroImageUrl = mediaArray[0].fileUrl;
          console.log('[DonationCheckoutServerData] ✅ Using homepage hero image:', heroImageUrl);
        }
      }

      // 2. If no homepage hero, try regular hero image
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const regularHeroUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`;
        mediaRes = await fetch(regularHeroUrl, { cache: 'no-store' });

        if (mediaRes.ok) {
          const heroMediaData = await mediaRes.json();
          const heroMediaArray: EventMedia[] = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
          if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
            heroImageUrl = heroMediaArray[0].fileUrl;
            console.log('[DonationCheckoutServerData] ✅ Using regular hero image:', heroImageUrl);
          }
        }
      }

      // 3. If no hero image, try flyer
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const flyerUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`;
        const flyerRes = await fetch(flyerUrl, { cache: 'no-store' });

        if (flyerRes.ok) {
          const flyerData = await flyerRes.json();
          const flyerArray: EventMedia[] = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
          if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
            heroImageUrl = flyerArray[0].fileUrl;
            console.log('[DonationCheckoutServerData] ✅ Using flyer image:', heroImageUrl);
          }
        }
      }

      // 4. If no flyer, try featured image
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const featuredUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`;
        const featuredRes = await fetch(featuredUrl, { cache: 'no-store' });

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          const featuredArray = Array.isArray(featuredData) ? featuredData : (featuredData ? [featuredData] : []);
          if (featuredArray.length > 0 && featuredArray[0].fileUrl) {
            heroImageUrl = featuredArray[0].fileUrl;
            console.log('[DonationCheckoutServerData] ✅ Using featured image:', heroImageUrl);
          }
        }
      }

      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        console.warn('[DonationCheckoutServerData] ⚠️ No hero image found, using default:', DEFAULT_HERO_IMAGE);
      }
    } catch (error) {
      console.error('[DonationCheckoutServerData] ❌ Error fetching hero image:', error);
      // Use default image
    }

    console.log('[DonationCheckoutServerData] ✅ Server-side fetch complete:', {
      eventId,
      hasEvent: !!event,
      isDonationBased,
      isTicketedFundraiser,
      isOffering,
      ticketCount: ticketTypes.length,
      discountCount: discounts.length,
      heroImageUrl,
    });

    return {
      event,
      ticketTypes,
      discounts,
      heroImageUrl,
      isDonationBased,
      isTicketedFundraiser,
      isFundraiserEvent: donationMeta.isFundraiserEvent,
      isCharityEvent: donationMeta.isCharityEvent,
      givebutterCampaignId: donationMeta.givebutterCampaignId,
      isOffering,
    };
  } catch (error) {
    console.error('[DonationCheckoutServerData] Error fetching donation checkout data:', error);
    console.error('[DonationCheckoutServerData] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[DonationCheckoutServerData] Error message:', error instanceof Error ? error.message : String(error));

    // Re-throw with user-friendly message if not already wrapped
    if (error instanceof Error) {
      if (error.message.includes('Unable to connect') || error.message.includes('check your internet')) {
        throw error;
      }
      throw new Error('Unable to load donation checkout data. Please check your connection and try again.');
    }

    throw new Error('Unable to load donation checkout data. Please try again later.');
  }
});
