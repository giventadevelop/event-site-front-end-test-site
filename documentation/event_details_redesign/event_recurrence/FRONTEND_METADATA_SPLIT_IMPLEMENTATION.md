# Frontend Implementation: Split Metadata into donation_metadata and event_recurrence_metadata

## Overview

The frontend currently sends both fundraiser/charity configuration and recurrence configuration in a single `metadata` field. We need to split this into two separate fields: `donation_metadata` and `event_recurrence_metadata`.

---

## Database Schema Changes (Backend)

The backend will add two new columns:
- `donation_metadata TEXT NULL` - For fundraiser/charity configuration
- `event_recurrence_metadata TEXT NULL` - For recurrence configuration

---

## Frontend Changes Required

### Step 1: Update EventDetailsDTO Type

**File**: `src/types/index.ts`

```typescript
export interface EventDetailsDTO {
  // ... existing fields ...

  /** Metadata - DEPRECATED: Use donation_metadata and event_recurrence_metadata instead */
  metadata?: string;

  /** Donation metadata - For fundraiser/charity configuration (JSON string) */
  donationMetadata?: string;

  /** Event recurrence metadata - For recurrence configuration (JSON string) */
  eventRecurrenceMetadata?: string;

  // ... rest of fields ...
}
```

### Step 2: Update EventForm Component

**File**: `src/components/EventForm.tsx`

#### 2.1: Update Metadata Creation Functions

```typescript
// Update the handleSubmit function
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // ... existing validation ...

  // Build donation metadata (fundraiser/charity) - SEPARATE from recurrence
  const donationMetadataObj = createDonationMetadata({
    isFundraiserEvent,
    isCharityEvent,
    zeroFeeProvider: useZeroFeeProvider ? zeroFeeProvider : undefined,
    givebutterCampaignId: (isFundraiserOrCharity || zeroFeeProvider === 'GIVEBUTTER')
      ? (givebutterCampaignId || undefined)
      : undefined,
  });

  // Build recurrence metadata - SEPARATE from donation
  const recurrenceMetadataObj = isRecurring ? {
    pattern: recurrencePattern || undefined,
    interval: recurrenceInterval,
    endType: recurrenceEndType,
    endDate: recurrenceEndDate || undefined,
    occurrences: recurrenceOccurrences,
    weeklyDays: recurrenceWeeklyDays.length > 0 ? recurrenceWeeklyDays : undefined,
    monthlyDay: recurrenceMonthlyDay || undefined,
  } : null;

  // Serialize metadata objects
  const donationMetadataJson = recurrenceMetadataObj
    ? serializeEventMetadata(donationMetadataObj)
    : null;

  const recurrenceMetadataJson = recurrenceMetadataObj
    ? JSON.stringify(removeNullUndefined(recurrenceMetadataObj))
    : null;

  // Prepare form data with separate metadata fields
  const sanitizedForm = {
    ...form,
    // NEW: Send as separate fields
    donationMetadata: donationMetadataJson,
    eventRecurrenceMetadata: recurrenceMetadataJson,
    // OLD: Keep metadata for backward compatibility during migration
    metadata: serializeEventMetadata({
      ...donationMetadataObj,
      ...(recurrenceMetadataObj ? { isRecurring: true, recurrenceConfig: recurrenceMetadataObj } : {})
    }),
    // ... rest of fields ...
    startDate: formatDateForStorage(formatDateForDisplay(form.startDate)),
    endDate: formatDateForStorage(formatDateForDisplay(form.endDate)),
    promotionStartDate: formatDateForStorage(formatDateForDisplay(form.promotionStartDate)),
    isActive: !!form.isActive,
    allowGuests: !!form.allowGuests,
    requireGuestApproval: !!form.requireGuestApproval,
    enableGuestPricing: !!form.enableGuestPricing,
    isRegistrationRequired: !!form.isRegistrationRequired,
    isSportsEvent: !!form.isSportsEvent,
    isLive: !!form.isLive,
    isFeaturedEvent: !!form.isFeaturedEvent,
    featuredEventPriorityRanking: Number(form.featuredEventPriorityRanking) || 0,
    liveEventPriorityRanking: Number(form.liveEventPriorityRanking) || 0,
  };

  onSubmit(sanitizedForm);
};
```

#### 2.2: Update Event Loading Logic

```typescript
// Update the useEffect that loads event data
useEffect(() => {
  if (event) {
    // ... existing basic field loading ...

    // Load donation metadata (NEW - preferred)
    if (event.donationMetadata) {
      try {
        const donationMetadata = JSON.parse(event.donationMetadata);
        setIsFundraiserEvent(Boolean(donationMetadata.isFundraiserEvent));
        setIsCharityEvent(Boolean(donationMetadata.isCharityEvent));
        setZeroFeeProvider(donationMetadata.zeroFeeProvider || '');
        setGivebutterCampaignId(donationMetadata.givebutterCampaignId || '');
        setUseZeroFeeProvider(Boolean(donationMetadata.zeroFeeProvider));
      } catch (e) {
        console.error('Failed to parse donation metadata', e);
      }
    }
    // Fallback: Load from old metadata field (backward compatibility)
    else if (event.metadata) {
      const metadata = parseEventMetadata(event.metadata);
      setIsFundraiserEvent(Boolean(metadata.isFundraiserEvent));
      setIsCharityEvent(Boolean(metadata.isCharityEvent));
      setZeroFeeProvider(metadata.zeroFeeProvider || '');
      setGivebutterCampaignId(metadata.givebutterCampaignId || '');
      setUseZeroFeeProvider(Boolean(metadata.zeroFeeProvider));
    }

    // Load recurrence metadata (NEW - preferred)
    if (event.eventRecurrenceMetadata) {
      try {
        const recurrenceConfig = JSON.parse(event.eventRecurrenceMetadata);
        setIsRecurring(true);
        setRecurrencePattern((recurrenceConfig.pattern as RecurrencePattern) || '');
        setRecurrenceInterval(recurrenceConfig.interval || 1);
        setRecurrenceEndType((recurrenceConfig.endType as RecurrenceEndType) || 'END_DATE');
        setRecurrenceEndDate(recurrenceConfig.endDate || '');
        setRecurrenceOccurrences(recurrenceConfig.occurrences || 1);
        setRecurrenceWeeklyDays(recurrenceConfig.weeklyDays || []);
        if (recurrenceConfig.monthlyDay === 'LAST') {
          setRecurrenceMonthlyDay('LAST');
          setRecurrenceMonthlyDayType('LAST_DAY');
        } else if (recurrenceConfig.monthlyDay) {
          setRecurrenceMonthlyDay(recurrenceConfig.monthlyDay);
          setRecurrenceMonthlyDayType('DAY_NUMBER');
        }
      } catch (e) {
        console.error('Failed to parse recurrence metadata', e);
      }
    }
    // Fallback: Load from old metadata field (backward compatibility)
    else if (event.metadata) {
      const metadata = parseEventMetadata(event.metadata);
      if (metadata.isRecurring) {
        const recurrenceConfig = metadata.recurrenceConfig;
        if (recurrenceConfig) {
          setIsRecurring(true);
          setRecurrencePattern((recurrenceConfig.pattern as RecurrencePattern) || '');
          setRecurrenceInterval(recurrenceConfig.interval || 1);
          setRecurrenceEndType((recurrenceConfig.endType as RecurrenceEndType) || 'END_DATE');
          setRecurrenceEndDate(recurrenceConfig.endDate || '');
          setRecurrenceOccurrences(recurrenceConfig.occurrences || 1);
          setRecurrenceWeeklyDays(recurrenceConfig.weeklyDays || []);
          if (recurrenceConfig.monthlyDay === 'LAST') {
            setRecurrenceMonthlyDay('LAST');
            setRecurrenceMonthlyDayType('LAST_DAY');
          } else if (recurrenceConfig.monthlyDay) {
            setRecurrenceMonthlyDay(recurrenceConfig.monthlyDay);
            setRecurrenceMonthlyDayType('DAY_NUMBER');
          }
        }
      }
    }
  }
}, [event]);
```

### Step 3: Create Helper Function for Donation Metadata

**File**: `src/lib/eventUtils.ts`

```typescript
/**
 * Creates donation metadata object for fundraiser/charity configuration
 */
export function createDonationMetadata(options: {
  isFundraiserEvent?: boolean;
  isCharityEvent?: boolean;
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
  if (options.zeroFeeProvider) {
    metadata.zeroFeeProvider = options.zeroFeeProvider;
  }
  if (options.givebutterCampaignId) {
    metadata.givebutterCampaignId = options.givebutterCampaignId;
  }

  return metadata;
}
```

### Step 4: Update API Request Format

The frontend will now send:

```json
{
  "title": "New Year 2026",
  "startDate": "2025-12-31",
  "donationMetadata": "{\"isFundraiserEvent\":false,\"isCharityEvent\":false}",
  "eventRecurrenceMetadata": "{\"pattern\":\"DAILY\",\"interval\":1,\"endType\":\"OCCURRENCES\",\"occurrences\":7}",
  "metadata": "..." // Keep for backward compatibility
}
```

---

## Testing Checklist

### Create Event
- [ ] Create event with donation metadata only
- [ ] Create event with recurrence metadata only
- [ ] Create event with both donation and recurrence metadata
- [ ] Verify both fields are sent in API request
- [ ] Verify backend receives and stores correctly

### Update Event
- [ ] Update recurrence occurrences (e.g., 2 → 7) and verify it's sent correctly
- [ ] Update recurrence pattern and verify new metadata is sent
- [ ] Update donation settings and verify it doesn't affect recurrence
- [ ] Verify backend updates recurrence columns correctly

### Load Event
- [ ] Load event with new format (donationMetadata + eventRecurrenceMetadata)
- [ ] Load event with old format (metadata only) - backward compatibility
- [ ] Verify form fields are populated correctly from new format
- [ ] Verify form fields are populated correctly from old format

---

## Backward Compatibility

During migration period:
- Frontend sends BOTH new fields (donationMetadata, eventRecurrenceMetadata) AND old field (metadata)
- Frontend reads from new fields first, falls back to old metadata field
- This ensures compatibility with both old and new backend versions

After migration is complete:
- Remove old `metadata` field handling
- Use only `donationMetadata` and `eventRecurrenceMetadata`

---

## Example: Complete Data Flow

### Creating Event with Recurrence

**Frontend sends**:
```json
{
  "title": "New Year 2026",
  "donationMetadata": "{\"isFundraiserEvent\":false,\"isCharityEvent\":false}",
  "eventRecurrenceMetadata": "{\"pattern\":\"DAILY\",\"interval\":1,\"endType\":\"OCCURRENCES\",\"occurrences\":7}"
}
```

**Backend stores**:
- `donation_metadata` = `'{"isFundraiserEvent":false,"isCharityEvent":false}'`
- `event_recurrence_metadata` = `'{"pattern":"DAILY","interval":1,"endType":"OCCURRENCES","occurrences":7}'`
- `recurrence_occurrences` = `7` ✅

### Updating Recurrence Occurrences

**Frontend sends** (changed from 7 to 10):
```json
{
  "eventRecurrenceMetadata": "{\"pattern\":\"DAILY\",\"interval\":1,\"endType\":\"OCCURRENCES\",\"occurrences\":10}"
}
```

**Backend should**:
1. Parse `eventRecurrenceMetadata`
2. Update `recurrence_occurrences` = `10` ✅
3. Delete old child events
4. Generate new child events (10 occurrences)

---

## Priority Implementation Order

1. **CRITICAL**: Update EventForm to send separate metadata fields
2. **CRITICAL**: Update EventForm to read from separate metadata fields
3. **HIGH**: Add helper function for donation metadata
4. **HIGH**: Update TypeScript types
5. **MEDIUM**: Remove old metadata handling after migration complete

