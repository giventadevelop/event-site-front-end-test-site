# Backend Implementation: Split Metadata into donation_metadata and event_recurrence_metadata

## Overview

The `metadata` field in `event_details` table currently contains both fundraiser/charity configuration AND recurrence configuration mixed together. This causes confusion and makes it difficult to manage. We need to split this into two separate fields.

---

## Database Schema Changes

### Current Schema
```sql
metadata TEXT NULL  -- Contains both fundraiser/charity AND recurrence data
```

### New Schema (REQUIRED)
```sql
donation_metadata TEXT NULL  -- For fundraiser/charity configuration only
event_recurrence_metadata TEXT NULL  -- For recurrence configuration only
```

**Migration Required**: Add these two new columns and migrate existing data.

---

## Critical Issues to Fix

### Issue 1: Recurrence Updates Not Reflecting
**Problem**: When updating recurrence (e.g., changing occurrences from 2 to 7), the `recurrence_occurrences` column is not being updated correctly.

**Example**:
- Frontend sends: `"occurrences":7` in metadata
- Database shows: `recurrence_occurrences=2` (WRONG - should be 7)

**Root Cause**: Backend is not properly extracting and updating recurrence fields from metadata during UPDATE operations.

**Fix Required**: Ensure UPDATE operations parse `event_recurrence_metadata` and update all recurrence columns.

### Issue 2: Recurrence Series Not Being Managed
**Problem**: When recurrence configuration changes, the `event_recurrence_series` table and child events are not being updated/deleted/recreated.

**Expected Behavior**:
1. When recurrence config changes, delete existing child events
2. Delete existing `event_recurrence_series` record
3. Create new `event_recurrence_series` record with new config
4. Generate new child events based on new config

**Fix Required**: Implement proper recurrence series management on UPDATE.

---

## Implementation Steps

### Step 1: Database Migration

```sql
-- Add new columns
ALTER TABLE event_details
ADD COLUMN donation_metadata TEXT NULL,
ADD COLUMN event_recurrence_metadata TEXT NULL;

-- Migrate existing data from metadata field
UPDATE event_details
SET
  donation_metadata = CASE
    WHEN metadata IS NOT NULL THEN
      jsonb_build_object(
        'isFundraiserEvent', COALESCE((metadata::jsonb->>'isFundraiserEvent')::boolean, false),
        'isCharityEvent', COALESCE((metadata::jsonb->>'isCharityEvent')::boolean, false),
        'zeroFeeProvider', metadata::jsonb->>'zeroFeeProvider',
        'givebutterCampaignId', metadata::jsonb->>'givebutterCampaignId'
      )::text
    ELSE NULL
  END,
  event_recurrence_metadata = CASE
    WHEN metadata IS NOT NULL AND (metadata::jsonb->>'isRecurring')::boolean = true THEN
      (metadata::jsonb->'recurrenceConfig')::text
    ELSE NULL
  END
WHERE metadata IS NOT NULL;

-- After verification, you can drop the old metadata column (optional)
-- ALTER TABLE event_details DROP COLUMN metadata;
```

### Step 2: Update Entity Class

```java
// EventDetails.java
@Entity
@Table(name = "event_details")
public class EventDetails {

    // ... existing fields ...

    @Column(name = "donation_metadata", columnDefinition = "TEXT")
    private String donationMetadata;  // For fundraiser/charity config

    @Column(name = "event_recurrence_metadata", columnDefinition = "TEXT")
    private String eventRecurrenceMetadata;  // For recurrence config

    // Keep old metadata field for backward compatibility during migration
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;  // DEPRECATED - remove after migration

    // ... getters and setters ...
}
```

### Step 3: Update DTO Class

```java
// EventDetailsDTO.java
public class EventDetailsDTO {

    // ... existing fields ...

    private String donationMetadata;  // For fundraiser/charity
    private String eventRecurrenceMetadata;  // For recurrence

    // Keep old metadata for backward compatibility
    private String metadata;  // DEPRECATED

    // ... getters and setters ...
}
```

### Step 4: Update Service Layer - CREATE Operation

```java
// EventDetailsService.java

public EventDetailsDTO create(EventDetailsDTO dto) {
    EventDetails eventDetails = new EventDetails();

    // Map basic fields
    mapBasicFields(dto, eventDetails);

    // Handle donation metadata (fundraiser/charity)
    if (dto.getDonationMetadata() != null && !dto.getDonationMetadata().isEmpty()) {
        eventDetails.setDonationMetadata(dto.getDonationMetadata());
    } else if (dto.getMetadata() != null) {
        // Fallback: Extract donation metadata from old metadata field
        eventDetails.setDonationMetadata(extractDonationMetadata(dto.getMetadata()));
    }

    // Handle recurrence metadata
    if (dto.getEventRecurrenceMetadata() != null && !dto.getEventRecurrenceMetadata().isEmpty()) {
        eventDetails.setEventRecurrenceMetadata(dto.getEventRecurrenceMetadata());
        processRecurrenceConfig(eventDetails, dto.getEventRecurrenceMetadata());
    } else if (dto.getMetadata() != null) {
        // Fallback: Extract recurrence metadata from old metadata field
        String recurrenceMetadata = extractRecurrenceMetadata(dto.getMetadata());
        if (recurrenceMetadata != null) {
            eventDetails.setEventRecurrenceMetadata(recurrenceMetadata);
            processRecurrenceConfig(eventDetails, recurrenceMetadata);
        }
    }

    eventDetails = eventDetailsRepository.save(eventDetails);
    return convertToDto(eventDetails);
}
```

### Step 5: Update Service Layer - UPDATE Operation (CRITICAL FIX)

```java
// EventDetailsService.java

public EventDetailsDTO update(Long id, EventDetailsDTO dto) {
    EventDetails eventDetails = eventDetailsRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Event not found"));

    // Map basic fields
    mapBasicFields(dto, eventDetails);

    // Handle donation metadata
    if (dto.getDonationMetadata() != null) {
        eventDetails.setDonationMetadata(dto.getDonationMetadata());
    } else if (dto.getMetadata() != null) {
        // Fallback: Extract from old metadata
        eventDetails.setDonationMetadata(extractDonationMetadata(dto.getMetadata()));
    }

    // CRITICAL: Handle recurrence metadata and update recurrence columns
    String newRecurrenceMetadata = null;
    if (dto.getEventRecurrenceMetadata() != null && !dto.getEventRecurrenceMetadata().isEmpty()) {
        newRecurrenceMetadata = dto.getEventRecurrenceMetadata();
    } else if (dto.getMetadata() != null) {
        // Fallback: Extract from old metadata
        newRecurrenceMetadata = extractRecurrenceMetadata(dto.getMetadata());
    }

    // Get existing recurrence metadata for comparison
    String existingRecurrenceMetadata = eventDetails.getEventRecurrenceMetadata();

    // Check if recurrence config has changed
    boolean recurrenceChanged = !Objects.equals(newRecurrenceMetadata, existingRecurrenceMetadata);

    if (recurrenceChanged) {
        // CRITICAL FIX: Delete existing child events and recurrence series
        if (eventDetails.getIsRecurring() != null && eventDetails.getIsRecurring()) {
            deleteRecurringSeriesAndChildren(eventDetails.getId());
        }

        // Update recurrence metadata
        eventDetails.setEventRecurrenceMetadata(newRecurrenceMetadata);

        // Process new recurrence config
        if (newRecurrenceMetadata != null && !newRecurrenceMetadata.isEmpty()) {
            processRecurrenceConfig(eventDetails, newRecurrenceMetadata);
        } else {
            // Clear recurrence if metadata is empty
            clearRecurrenceColumns(eventDetails);
        }
    }

    eventDetails = eventDetailsRepository.save(eventDetails);
    return convertToDto(eventDetails);
}

// Helper method to delete existing recurrence series and child events
private void deleteRecurringSeriesAndChildren(Long parentEventId) {
    // Delete child events
    List<EventDetails> childEvents = eventDetailsRepository.findByParentEventId(parentEventId);
    for (EventDetails child : childEvents) {
        eventDetailsRepository.delete(child);
    }

    // Delete recurrence series record
    recurrenceSeriesRepository.findByParentEventId(parentEventId)
        .ifPresent(series -> recurrenceSeriesRepository.delete(series));
}
```

### Step 6: Process Recurrence Config (CRITICAL FIX)

```java
// EventDetailsService.java

private void processRecurrenceConfig(EventDetails eventDetails, String recurrenceMetadataJson) {
    if (recurrenceMetadataJson == null || recurrenceMetadataJson.isEmpty()) {
        clearRecurrenceColumns(eventDetails);
        return;
    }

    try {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> recurrenceConfig = mapper.readValue(recurrenceMetadataJson, Map.class);

        // CRITICAL: Extract and populate recurrence columns
        eventDetails.setIsRecurring(true);
        eventDetails.setRecurrencePattern((String) recurrenceConfig.get("pattern"));

        // CRITICAL FIX: Ensure interval is correctly extracted
        Object intervalObj = recurrenceConfig.get("interval");
        if (intervalObj != null) {
            if (intervalObj instanceof Number) {
                eventDetails.setRecurrenceInterval(((Number) intervalObj).intValue());
            } else {
                eventDetails.setRecurrenceInterval(Integer.parseInt(intervalObj.toString()));
            }
        }

        eventDetails.setRecurrenceEndType((String) recurrenceConfig.get("endType"));

        // CRITICAL FIX: Ensure occurrences is correctly extracted and updated
        Object occurrencesObj = recurrenceConfig.get("occurrences");
        if (occurrencesObj != null) {
            if (occurrencesObj instanceof Number) {
                eventDetails.setRecurrenceOccurrences(((Number) occurrencesObj).intValue());
            } else {
                eventDetails.setRecurrenceOccurrences(Integer.parseInt(occurrencesObj.toString()));
            }
        }

        // Handle endDate
        if (recurrenceConfig.containsKey("endDate")) {
            String endDateStr = (String) recurrenceConfig.get("endDate");
            eventDetails.setRecurrenceEndDate(LocalDate.parse(endDateStr));
        }

        // Handle weeklyDays (TEXT field)
        if (recurrenceConfig.containsKey("weeklyDays")) {
            List<Integer> weeklyDaysList = (List<Integer>) recurrenceConfig.get("weeklyDays");
            ObjectMapper jsonMapper = new ObjectMapper();
            String weeklyDaysJson = jsonMapper.writeValueAsString(weeklyDaysList);
            eventDetails.setRecurrenceWeeklyDays(weeklyDaysJson);  // Store as JSON string
        }

        // Handle monthlyDay
        if (recurrenceConfig.containsKey("monthlyDay")) {
            Object monthlyDayObj = recurrenceConfig.get("monthlyDay");
            if (monthlyDayObj instanceof Number) {
                eventDetails.setRecurrenceMonthlyDay(((Number) monthlyDayObj).intValue());
            } else if ("LAST".equals(monthlyDayObj)) {
                eventDetails.setRecurrenceMonthlyDay(null);
            }
        }

        // CRITICAL: Set recurrence_series_id
        eventDetails.setRecurrenceSeriesId(eventDetails.getId());
        eventDetails.setParentEventId(null);

        // Create/update recurrence series
        createOrUpdateRecurrenceSeries(eventDetails.getId(), recurrenceConfig);

        // Generate child events
        generateRecurringEvents(eventDetails, getRecurrenceSeries(eventDetails.getId()));

    } catch (Exception e) {
        log.error("Failed to process recurrence config", e);
        clearRecurrenceColumns(eventDetails);
    }
}

private void clearRecurrenceColumns(EventDetails eventDetails) {
    eventDetails.setIsRecurring(false);
    eventDetails.setRecurrencePattern(null);
    eventDetails.setRecurrenceInterval(null);
    eventDetails.setRecurrenceEndType(null);
    eventDetails.setRecurrenceEndDate(null);
    eventDetails.setRecurrenceOccurrences(null);
    eventDetails.setRecurrenceWeeklyDays(null);
    eventDetails.setRecurrenceMonthlyDay(null);
    eventDetails.setRecurrenceSeriesId(null);
    eventDetails.setParentEventId(null);
    eventDetails.setEventRecurrenceMetadata(null);
}
```

### Step 7: Helper Methods for Metadata Extraction

```java
// EventDetailsService.java

private String extractDonationMetadata(String metadataJson) {
    if (metadataJson == null || metadataJson.isEmpty()) {
        return null;
    }
    try {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> metadataMap = mapper.readValue(metadataJson, Map.class);

        Map<String, Object> donationMetadata = new HashMap<>();
        donationMetadata.put("isFundraiserEvent", metadataMap.get("isFundraiserEvent"));
        donationMetadata.put("isCharityEvent", metadataMap.get("isCharityEvent"));
        donationMetadata.put("zeroFeeProvider", metadataMap.get("zeroFeeProvider"));
        donationMetadata.put("givebutterCampaignId", metadataMap.get("givebutterCampaignId"));

        return mapper.writeValueAsString(donationMetadata);
    } catch (Exception e) {
        log.warn("Failed to extract donation metadata", e);
        return null;
    }
}

private String extractRecurrenceMetadata(String metadataJson) {
    if (metadataJson == null || metadataJson.isEmpty()) {
        return null;
    }
    try {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> metadataMap = mapper.readValue(metadataJson, Map.class);

        Boolean isRecurring = (Boolean) metadataMap.get("isRecurring");
        if (Boolean.TRUE.equals(isRecurring)) {
            Map<String, Object> recurrenceConfig = (Map<String, Object>) metadataMap.get("recurrenceConfig");
            return mapper.writeValueAsString(recurrenceConfig);
        }
    } catch (Exception e) {
        log.warn("Failed to extract recurrence metadata", e);
    }
    return null;
}
```

---

## Testing Checklist

### Create Operation
- [ ] Create event with donation metadata only
- [ ] Create event with recurrence metadata only
- [ ] Create event with both donation and recurrence metadata
- [ ] Verify `donation_metadata` column is populated correctly
- [ ] Verify `event_recurrence_metadata` column is populated correctly
- [ ] Verify recurrence columns are populated from `event_recurrence_metadata`
- [ ] Verify `event_recurrence_series` record is created
- [ ] Verify child events are generated

### Update Operation (CRITICAL)
- [ ] Update recurrence occurrences (e.g., 2 → 7) and verify `recurrence_occurrences` column updates
- [ ] Update recurrence pattern and verify old series is deleted and new one is created
- [ ] Update recurrence interval and verify it's reflected in database
- [ ] Verify old child events are deleted when recurrence changes
- [ ] Verify new child events are generated with new config
- [ ] Update donation metadata and verify it doesn't affect recurrence
- [ ] Update recurrence metadata and verify it doesn't affect donation

### Migration
- [ ] Verify existing events with metadata are migrated correctly
- [ ] Verify donation metadata is extracted correctly
- [ ] Verify recurrence metadata is extracted correctly
- [ ] Test backward compatibility with old `metadata` field

---

## Example Data Flow

### Frontend Sends (New Format)
```json
{
  "title": "New Year 2026",
  "donation_metadata": "{\"isFundraiserEvent\":false,\"isCharityEvent\":false}",
  "event_recurrence_metadata": "{\"pattern\":\"DAILY\",\"interval\":1,\"endType\":\"OCCURRENCES\",\"occurrences\":7}"
}
```

### Backend Should Store
```sql
donation_metadata = '{"isFundraiserEvent":false,"isCharityEvent":false}'
event_recurrence_metadata = '{"pattern":"DAILY","interval":1,"endType":"OCCURRENCES","occurrences":7}'
recurrence_occurrences = 7  -- CRITICAL: Must match occurrences in metadata
```

---

## Priority Fixes

1. **CRITICAL**: Fix recurrence updates not reflecting in database columns
2. **CRITICAL**: Implement proper recurrence series management (delete/recreate on update)
3. **HIGH**: Split metadata into two separate fields
4. **HIGH**: Ensure proper data extraction and type conversion (Integer, String, etc.)
5. **MEDIUM**: Add validation for metadata JSON format

---

## Backward Compatibility

During migration period, support both:
- Old format: `metadata` field with mixed data
- New format: `donation_metadata` and `event_recurrence_metadata` fields

After migration is complete and verified, the old `metadata` field can be deprecated.

