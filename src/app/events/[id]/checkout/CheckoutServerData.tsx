import { cache } from 'react';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';

/**
 * Server-side data fetching for checkout page
 * Uses Next.js cache() to prevent re-fetching on navigation
 * Follows cursor rules: nextjs_api_routes.mdc - uses fetchWithJwtRetry for backend calls
 */

interface EventData {
  id: number;
  title: string;
  caption?: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  venueName?: string;
}

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
}

export interface CheckoutData {
  event: EventData;
  ticketTypes: TicketType[];
  discounts: DiscountCode[];
  heroImageUrl: string;
}

const DEFAULT_HERO_IMAGE = '/images/default_placeholder_hero_image.jpeg';

/**
 * Cached server-side data fetcher
 * Next.js will automatically cache this per-request
 * Uses fetchWithJwtRetry for backend API calls (cursor rules pattern)
 *
 * NOTE: To force refresh, restart the dev server or clear Next.js cache
 */
export const getCheckoutData = cache(async (eventId: string): Promise<CheckoutData> => {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

  if (!getApiBase()) {
    throw new Error('API_BASE_URL not configured');
  }

  const tenantId = getTenantId();

  try {
    console.log('[CheckoutServerData] Fetching event data server-side for eventId:', eventId);

    // Fetch event details - using fetchWithJwtRetry per cursor rules
    let eventRes;
    try {
      eventRes = await fetchWithJwtRetry(
        `${getApiBase()}/api/event-details/${eventId}`,
        {
          cache: 'no-store', // Don't cache at fetch level, Next.js cache() handles it
        }
      );
    } catch (fetchError) {
      console.error('[CheckoutServerData] Network error fetching event:', fetchError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    if (!eventRes.ok) {
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventData = await eventRes.json();

    // Fetch ticket types (only active ones)
    // Use JHipster criteria syntax: field.operation=value
    let ticketRes;
    try {
      ticketRes = await fetchWithJwtRetry(
        `${getApiBase()}/api/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true&tenantId.equals=${tenantId}`,
        {
          cache: 'no-store',
        }
      );
    } catch (fetchError) {
      console.error('[CheckoutServerData] Network error fetching tickets:', fetchError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    if (!ticketRes.ok) {
      throw new Error(`Failed to fetch tickets: ${ticketRes.status}`);
    }

    const ticketData = await ticketRes.json();
    const ticketTypes: TicketType[] = Array.isArray(ticketData) ? ticketData : [];

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
      console.error('[CheckoutServerData] Error fetching discounts:', error);
      // Continue without discounts
    }

    // Fetch hero image - Priority: Homepage Hero > Regular Hero > Flyer > Featured Image
    // Use proxy route (same as success page) instead of direct backend calls
    let heroImageUrl = DEFAULT_HERO_IMAGE;
    const baseUrl = getAppUrl();

    try {
      console.log('[CheckoutServerData] 🔍 Starting hero image fetch for eventId:', eventId, 'tenantId:', tenantId);
      console.log('[CheckoutServerData] Using proxy route via:', baseUrl);

      // 1. Try homepage hero image first (same as success page - uses proxy route)
      const homepageHeroUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`;
      console.log('[CheckoutServerData] 📸 Attempting homepage hero image:', homepageHeroUrl);

      let mediaRes = await fetch(homepageHeroUrl, {
        cache: 'no-store',
      });

      console.log('[CheckoutServerData] Homepage hero response status:', mediaRes.status);

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        const mediaArray: EventMedia[] = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
        console.log('[CheckoutServerData] Homepage hero results:', mediaArray.length, 'items found');
        if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
          heroImageUrl = mediaArray[0].fileUrl;
          console.log('[CheckoutServerData] ✅ Using homepage hero image:', heroImageUrl);
        }
      } else {
        const errorText = await mediaRes.text();
        console.log('[CheckoutServerData] Homepage hero error response:', errorText);
      }

      // 2. If no homepage hero, try regular hero image
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const regularHeroUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`;
        console.log('[CheckoutServerData] 📸 Attempting regular hero image:', regularHeroUrl);

        mediaRes = await fetch(regularHeroUrl, {
          cache: 'no-store',
        });

        console.log('[CheckoutServerData] Regular hero response status:', mediaRes.status);

        if (mediaRes.ok) {
          const heroMediaData = await mediaRes.json();
          const heroMediaArray: EventMedia[] = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
          console.log('[CheckoutServerData] Regular hero results:', heroMediaArray.length, 'items found');
          if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
            heroImageUrl = heroMediaArray[0].fileUrl;
            console.log('[CheckoutServerData] ✅ Using regular hero image:', heroImageUrl);
          }
        } else {
          const errorText = await mediaRes.text();
          console.log('[CheckoutServerData] Regular hero error response:', errorText);
        }
      }

      // 3. If no hero image, try flyer
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const flyerUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`;
        console.log('[CheckoutServerData] 📸 Attempting flyer:', flyerUrl);

        const flyerRes = await fetch(flyerUrl, {
          cache: 'no-store',
        });

        console.log('[CheckoutServerData] Flyer response status:', flyerRes.status);

        if (flyerRes.ok) {
          const flyerData = await flyerRes.json();
          const flyerArray: EventMedia[] = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
          console.log('[CheckoutServerData] Flyer results:', flyerArray.length, 'items found');
          if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
            heroImageUrl = flyerArray[0].fileUrl;
            console.log('[CheckoutServerData] ✅ Using flyer image:', heroImageUrl);
          }
        } else {
          const errorText = await flyerRes.text();
          console.log('[CheckoutServerData] Flyer error response:', errorText);
        }
      }

      // 4. If no flyer, try featured image
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const featuredUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`;
        console.log('[CheckoutServerData] 📸 Attempting featured image:', featuredUrl);

        const featuredRes = await fetch(featuredUrl, {
          cache: 'no-store',
        });

        console.log('[CheckoutServerData] Featured response status:', featuredRes.status);

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          const featuredArray = Array.isArray(featuredData) ? featuredData : (featuredData ? [featuredData] : []);
          console.log('[CheckoutServerData] Featured results:', featuredArray.length, 'items found');
          if (featuredArray.length > 0 && featuredArray[0].fileUrl) {
            heroImageUrl = featuredArray[0].fileUrl;
            console.log('[CheckoutServerData] ✅ Using featured image:', heroImageUrl);
          }
        } else {
          const errorText = await featuredRes.text();
          console.log('[CheckoutServerData] Featured error response:', errorText);
        }
      }

      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        console.warn('[CheckoutServerData] ⚠️ No hero image found, using default:', DEFAULT_HERO_IMAGE);
      }
    } catch (error) {
      console.error('[CheckoutServerData] ❌ Error fetching hero image:', error);
      console.error('[CheckoutServerData] Error details:', error instanceof Error ? error.message : String(error));
      // Use default image
    }

    console.log('[CheckoutServerData] ✅ Server-side fetch complete:', {
      eventId,
      hasEvent: !!event,
      ticketCount: ticketTypes.length,
      discountCount: discounts.length,
      heroImageUrl,
    });

    return {
      event,
      ticketTypes,
      discounts,
      heroImageUrl,
    };
  } catch (error) {
    console.error('[CheckoutServerData] Error fetching checkout data:', error);
    console.error('[CheckoutServerData] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[CheckoutServerData] Error message:', error instanceof Error ? error.message : String(error));

    // Re-throw with user-friendly message if not already wrapped
    if (error instanceof Error) {
      // If it's already a user-friendly message, keep it
      if (error.message.includes('Unable to connect') || error.message.includes('check your internet')) {
        throw error;
      }
      // Otherwise, wrap it
      throw new Error('Unable to load checkout data. Please check your connection and try again.');
    }

    throw new Error('Unable to load checkout data. Please try again later.');
  }
});
