import type { EventDetailsDTO } from '@/types';
import { calculateNextOccurrence, type RecurrencePattern } from '@/lib/recurrenceUtils';

/**
 * Parse event metadata JSON string to object
 * @param metadata - JSON string from event_details.metadata column
 * @returns Parsed metadata object or empty object if parsing fails
 */
export function parseEventMetadata(metadata?: string): Record<string, any> {
  if (!metadata || metadata.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(metadata);
  } catch (error) {
    console.error('Failed to parse event metadata:', error);
    return {};
  }
}

/**
 * Check if event is a fundraiser event
 * @param event - Event details DTO
 * @returns true if event is configured as a fundraiser event
 */
export function isFundraiserEvent(event: EventDetailsDTO): boolean {
  const metadata = parseEventMetadata(event.metadata);
  return Boolean(metadata.isFundraiserEvent);
}

/**
 * Check if event is a charity event
 * @param event - Event details DTO
 * @returns true if event is configured as a charity event
 */
export function isCharityEvent(event: EventDetailsDTO): boolean {
  const metadata = parseEventMetadata(event.metadata);
  return Boolean(metadata.isCharityEvent);
}

/**
 * Get Givebutter campaign ID from event metadata
 * @param event - Event details DTO
 * @returns Givebutter campaign ID or null if not configured
 */
export function getGivebutterCampaignId(event: EventDetailsDTO): string | null {
  const metadata = parseEventMetadata(event.metadata);
  const donationConfig = metadata.donationConfig;
  if (donationConfig && donationConfig.zeroFeeProvider === 'GIVEBUTTER') {
    return donationConfig.givebutterCampaignId || null;
  }
  return null;
}

/**
 * Check if event uses zero-fee provider (Givebutter)
 * @param event - Event details DTO
 * @returns true if event is configured to use zero-fee provider
 */
export function usesZeroFeeProvider(event: EventDetailsDTO): boolean {
  const metadata = parseEventMetadata(event.metadata);
  const donationConfig = metadata.donationConfig;
  return Boolean(donationConfig?.useZeroFeeProvider);
}

/**
 * Get zero-fee provider name from event metadata
 * @param event - Event details DTO
 * @returns Zero-fee provider name (e.g., 'GIVEBUTTER') or null if not configured
 */
export function getZeroFeeProvider(event: EventDetailsDTO): string | null {
  const metadata = parseEventMetadata(event.metadata);
  const donationConfig = metadata.donationConfig;
  return donationConfig?.zeroFeeProvider || null;
}

/**
 * Get donation configuration from event metadata
 * @param event - Event details DTO
 * @returns Donation configuration object or null if not configured
 */
export function getDonationConfig(event: EventDetailsDTO): {
  useZeroFeeProvider?: boolean;
  zeroFeeProvider?: string;
  givebutterCampaignId?: string;
} | null {
  const metadata = parseEventMetadata(event.metadata);
  return metadata.donationConfig || null;
}

/**
 * Remove null and undefined values from an object recursively
 */
export function removeNullUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeNullUndefined).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key in obj) {
      const value = removeNullUndefined(obj[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Serialize metadata object to JSON string for saving to database
 * Removes null and undefined values to prevent backend binding errors
 * @param metadataObj - Metadata object to serialize
 * @returns JSON string ready for database storage
 */
export function serializeEventMetadata(metadataObj: Record<string, any>): string {
  try {
    // Remove null and undefined values before serialization
    const cleaned = removeNullUndefined(metadataObj);
    return JSON.stringify(cleaned);
  } catch (error) {
    console.error('Failed to serialize event metadata:', error);
    return '{}';
  }
}

/**
 * Create fundraiser event metadata object
 * @param options - Fundraiser configuration options
 * @returns Metadata object ready for serialization
 */
export function createFundraiserMetadata(options: {
  isFundraiserEvent?: boolean;
  isCharityEvent?: boolean;
  useZeroFeeProvider?: boolean;
  zeroFeeProvider?: string;
  givebutterCampaignId?: string;
}): Record<string, any> {
  const metadata: Record<string, any> = {};

  if (options.isFundraiserEvent !== undefined) {
    metadata.isFundraiserEvent = options.isFundraiserEvent;
  }

  if (options.isCharityEvent !== undefined) {
    metadata.isCharityEvent = options.isCharityEvent;
  }

  // CRITICAL: Always create donationConfig structure if fundraiser or charity event is enabled
  // This ensures backend routing logic can properly check for GiveButter configuration
  if (options.isFundraiserEvent === true || options.isCharityEvent === true) {
    metadata.donationConfig = {
      useZeroFeeProvider: options.useZeroFeeProvider ?? false,
      zeroFeeProvider: options.zeroFeeProvider || null,
      givebutterCampaignId: options.givebutterCampaignId || null,
    };
  } else if (options.useZeroFeeProvider || options.zeroFeeProvider || options.givebutterCampaignId) {
    // Fallback: Create donationConfig if explicitly provided even if not fundraiser/charity
    metadata.donationConfig = {
      useZeroFeeProvider: options.useZeroFeeProvider ?? false,
      zeroFeeProvider: options.zeroFeeProvider || null,
      givebutterCampaignId: options.givebutterCampaignId || null,
    };
  }

  return metadata;
}

/**
 * Create recurrence event metadata object
 * @param options - Recurrence configuration options
 * @returns Metadata object ready for serialization (null/undefined values are omitted)
 */
export function createRecurrenceMetadata(options: {
  isRecurring?: boolean;
  pattern?: string;
  interval?: number;
  endType?: string;
  endDate?: string;
  occurrences?: number;
  weeklyDays?: number[];
  monthlyDay?: number | 'LAST';
}): Record<string, any> {
  const metadata: Record<string, any> = {};

  if (options.isRecurring !== undefined) {
    metadata.isRecurring = options.isRecurring;
  }

  if (options.isRecurring === true) {
    const recurrenceConfig: Record<string, any> = {};

    // Only include fields that have values (omit null/undefined)
    if (options.pattern) {
      recurrenceConfig.pattern = options.pattern;
    }
    if (options.interval !== undefined && options.interval !== null) {
      recurrenceConfig.interval = options.interval;
    }
    if (options.endType) {
      recurrenceConfig.endType = options.endType;
    }
    if (options.endDate) {
      recurrenceConfig.endDate = options.endDate;
    }
    if (options.occurrences !== undefined && options.occurrences !== null) {
      recurrenceConfig.occurrences = options.occurrences;
    }
    if (options.weeklyDays && options.weeklyDays.length > 0) {
      recurrenceConfig.weeklyDays = options.weeklyDays;
    }
    if (options.monthlyDay !== undefined && options.monthlyDay !== null) {
      recurrenceConfig.monthlyDay = options.monthlyDay;
    }

    metadata.recurrenceConfig = recurrenceConfig;
  }

  return metadata;
}

/**
 * Get recurrence configuration from event metadata
 * @param event - Event details DTO
 * @returns Recurrence configuration object or null if not configured
 */
export function getRecurrenceConfig(event: EventDetailsDTO): {
  pattern?: string;
  interval?: number;
  endType?: string;
  endDate?: string;
  occurrences?: number;
  weeklyDays?: number[];
  monthlyDay?: number | 'LAST';
} | null {
  // Check new eventRecurrenceMetadata field first
  if (event.eventRecurrenceMetadata) {
    try {
      const recurrenceConfig = JSON.parse(event.eventRecurrenceMetadata);
      return recurrenceConfig;
    } catch (error) {
      console.error('Failed to parse eventRecurrenceMetadata:', error);
    }
  }

  // Fallback to old metadata field
  const metadata = parseEventMetadata(event.metadata);
  return metadata.recurrenceConfig || null;
}

/**
 * Get the next occurrence date for a recurring event
 * @param event - Event details DTO
 * @param currentDate - Current date to calculate from (defaults to today)
 * @returns Next occurrence date or null if event is not recurring or no next occurrence
 */
export function getNextOccurrenceDate(
  event: EventDetailsDTO,
  currentDate: Date = new Date()
): Date | null {
  if (!event.isRecurring || !event.startDate) {
    return null;
  }

  const recurrenceConfig = getRecurrenceConfig(event);
  if (!recurrenceConfig || !recurrenceConfig.pattern) {
    return null;
  }

  try {
    // Parse start date
    const [year, month, day] = event.startDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    startDate.setHours(0, 0, 0, 0);

    // Normalize current date
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    // Calculate next occurrence
    const nextDate = calculateNextOccurrence(
      startDate,
      recurrenceConfig.pattern as RecurrencePattern,
      recurrenceConfig.interval || 1,
      today,
      recurrenceConfig.weeklyDays,
      recurrenceConfig.monthlyDay
    );

    // Check if next occurrence is within end date (if specified)
    if (recurrenceConfig.endType === 'END_DATE' && recurrenceConfig.endDate && nextDate) {
      const [endYear, endMonth, endDay] = recurrenceConfig.endDate.split('-').map(Number);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      endDate.setHours(23, 59, 59, 999);

      if (nextDate > endDate) {
        return null; // Beyond end date
      }
    }

    return nextDate;
  } catch (error) {
    console.error('Error calculating next occurrence date:', error);
    return null;
  }
}

/**
 * Check if event is a recurring event
 * @param event - Event details DTO
 * @returns true if event is configured as a recurring event
 */
export function isRecurringEvent(event: EventDetailsDTO): boolean {
  // Check new field first
  if (event.eventRecurrenceMetadata) {
    return true;
  }
  // Fallback to old metadata field
  const metadata = parseEventMetadata(event.metadata);
  return Boolean(metadata.isRecurring);
}

/**
 * Creates donation metadata object for fundraiser/charity configuration
 * This is a simplified version that returns only the donation-related fields
 * without the nested donationConfig structure
 */
export function createDonationMetadata(options: {
  isFundraiserEvent?: boolean;
  isCharityEvent?: boolean;
  zeroFeeProvider?: string;
  givebutterCampaignId?: string;
  givebutterWidgetId?: string;
}): Record<string, any> {
  const metadata: Record<string, any> = {};

  if (options.isFundraiserEvent !== undefined) {
    metadata.isFundraiserEvent = options.isFundraiserEvent;
  }
  if (options.isCharityEvent !== undefined) {
    metadata.isCharityEvent = options.isCharityEvent;
  }
  if (options.zeroFeeProvider) {
    metadata.zeroFeeProvider = options.zeroFeeProvider;
  }
  if (options.givebutterCampaignId) {
    metadata.givebutterCampaignId = options.givebutterCampaignId;
  }
  if (options.givebutterWidgetId) {
    metadata.givebutterWidgetId = options.givebutterWidgetId;
  }

  return metadata;
}


