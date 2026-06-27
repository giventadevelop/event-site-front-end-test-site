import type { EventDetailsDTO } from '@/types';

/**
 * Determines if an event is donation-based
 * Event is donation-based if:
 * 1. admissionType === 'DONATION_BASED' OR
 * 2. (isFundraiserEvent === true OR isCharityEvent === true) AND zeroFeeProvider === 'GIVEBUTTER'
 */
export function isDonationBasedEvent(event: EventDetailsDTO): boolean {
  // Check admission type
  if (event.admissionType?.toUpperCase() === 'DONATION_BASED') {
    return true;
  }
  
  // Check fundraiser/charity configuration
  if (event.donationMetadata) {
    try {
      const donationMeta = JSON.parse(event.donationMetadata);
      const isFundraiser = donationMeta.isFundraiserEvent === true;
      const isCharity = donationMeta.isCharityEvent === true;
      const provider = donationMeta.zeroFeeProvider;
      
      if ((isFundraiser || isCharity) && provider === 'GIVEBUTTER') {
        return true;
      }
    } catch (error) {
      console.error('[isDonationBasedEvent] Error parsing donationMetadata:', error);
    }
  }
  
  return false;
}

/**
 * Donation metadata shape returned by getDonationMetadata
 */
export type DonationMetadata = {
  isFundraiserEvent: boolean;
  isCharityEvent: boolean;
  zeroFeeProvider?: string;
  givebutterCampaignId?: string;
  givebutterWidgetId?: string;
};

/**
 * Extracts donation metadata from event
 */
export function getDonationMetadata(event: EventDetailsDTO): DonationMetadata {
  const defaultMetadata: DonationMetadata = {
    isFundraiserEvent: false,
    isCharityEvent: false,
  };

  if (!event.donationMetadata) {
    return defaultMetadata;
  }

  try {
    const parsed = JSON.parse(event.donationMetadata);
    return {
      isFundraiserEvent: Boolean(parsed.isFundraiserEvent),
      isCharityEvent: Boolean(parsed.isCharityEvent),
      zeroFeeProvider: parsed.zeroFeeProvider,
      givebutterCampaignId: parsed.givebutterCampaignId,
      givebutterWidgetId: parsed.givebutterWidgetId,
    };
  } catch (error) {
    console.error('[getDonationMetadata] Error parsing donationMetadata:', error);
    return defaultMetadata;
  }
}

/**
 * Determines if an event is a ticketed fundraiser/charity event
 * Event is ticketed fundraiser/charity if:
 * 1. admissionType === 'TICKETED' AND
 * 2. isDonationBasedEvent(event) === true (fundraiser/charity with GiveButter)
 * 
 * This is used to show the special fundraiser image instead of regular buttons
 */
export function isTicketedFundraiserEvent(event: EventDetailsDTO): boolean {
  // Must be ticketed
  if (event.admissionType?.toUpperCase() !== 'TICKETED') {
    return false;
  }
  
  // Must also be donation-based (fundraiser/charity with GiveButter)
  return isDonationBasedEvent(event);
}
