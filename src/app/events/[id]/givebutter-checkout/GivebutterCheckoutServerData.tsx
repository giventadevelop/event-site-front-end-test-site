import { cache } from 'react';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { getDonationMetadata, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import type { EventDetailsDTO } from '@/types';

interface EventMedia {
  id: number;
  fileUrl: string;
  eventFlyer?: boolean;
  isFeaturedImage?: boolean;
  isHeroImage?: boolean;
  isHomePageHeroImage?: boolean;
}

export interface GivebutterCheckoutData {
  event: EventDetailsDTO;
  heroImageUrl: string;
  givebutterWidgetId?: string;
  givebutterCampaignId?: string;
}

const DEFAULT_HERO_IMAGE = '/images/default_placeholder_hero_image.jpeg';

/**
 * Cached server-side data fetcher for givebutter-checkout page.
 * Only for ticketed fundraiser/charity events with GiveButter.
 * Returns hero image and GiveButter widget/campaign IDs from donation_metadata.
 */
export const getGivebutterCheckoutData = cache(async (eventId: string): Promise<GivebutterCheckoutData> => {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

  if (!getApiBase()) {
    throw new Error('API_BASE_URL not configured');
  }

  try {
    console.log('[GivebutterCheckoutServerData] Fetching event data for eventId:', eventId);

    const eventRes = await fetchWithJwtRetry(
      `${getApiBase()}/api/event-details/${eventId}`,
      { cache: 'no-store' }
    );

    if (!eventRes.ok) {
      if (eventRes.status === 404) throw new Error('Event not found');
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventDetailsDTO = await eventRes.json();
    const isTicketedFundraiser = isTicketedFundraiserEvent(event);
    const donationMeta = getDonationMetadata(event);

    if (!isTicketedFundraiser) {
      throw new Error('This event does not support GiveButter embed checkout. Use the standard checkout flow.');
    }

    // Prefer event-level GiveButter config; fall back to global env (NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID, NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID)
    const envWidgetId =
      typeof process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID === 'string'
        ? process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID.trim() || undefined
        : undefined;
    const envCampaignId =
      typeof process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID === 'string'
        ? process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID.trim() || undefined
        : undefined;
    const givebutterWidgetId =
      donationMeta.givebutterWidgetId?.trim() || envWidgetId;
    const givebutterCampaignId =
      donationMeta.givebutterCampaignId?.trim() || envCampaignId;
    const hasGivebutterConfig = Boolean(givebutterWidgetId || givebutterCampaignId);
    if (!hasGivebutterConfig) {
      throw new Error('GiveButter is not configured for this event. Please use donation checkout or contact the organizer.');
    }

    // Resolve hero image (same priority as donation-checkout)
    let heroImageUrl = DEFAULT_HERO_IMAGE;
    const baseUrl = getAppUrl();

    try {
      // 1. Homepage hero
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
      console.error('[GivebutterCheckoutServerData] Error fetching hero image:', err);
    }

    return {
      event,
      heroImageUrl,
      givebutterWidgetId,
      givebutterCampaignId: givebutterCampaignId || undefined,
    };
  } catch (error) {
    console.error('[GivebutterCheckoutServerData] Error:', error);
    if (error instanceof Error) throw error;
    throw new Error('Unable to load checkout data. Please try again later.');
  }
});
