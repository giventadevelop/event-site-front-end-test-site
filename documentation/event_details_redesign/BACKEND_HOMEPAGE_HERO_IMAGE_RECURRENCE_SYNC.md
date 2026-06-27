# Backend Implementation: Homepage Hero Image Replication for Recurring Events

## Problem Statement

When a homepage hero image (`isHomePageHeroImage = true`) is uploaded for a **parent recurring event**, the system should automatically create corresponding media file records for all child events in the recurrence series. This ensures that all occurrences of a recurring event share the same homepage hero image.

## Current Behavior

- When an image is uploaded with `isHomePageHeroImage = true` for a parent event, only that parent event gets the media record.
- Child events in the recurrence series do not automatically receive the same homepage hero image.

## Required Behavior

1. **After successful media upload** (POST `/api/event-medias/upload-multiple` or similar endpoint)
2. **Check if the uploaded media has `isHomePageHeroImage = true`**
3. **Check if the event is a parent event** (`parentEventId` is null/undefined)
4. **If both conditions are true:**
   - Fetch all child events for this parent event (using `recurrenceSeriesId` or `parentEventId`)
   - For each child event, create a new `EventMedia` record with:
     - Same `fileUrl` as the parent's media
     - Same `isHomePageHeroImage = true`
     - Same `title`, `description`, `altText`, `displayOrder`, etc.
     - Same `startDisplayingFromDate`
     - Same `isPublic`, `isHeroImage`, `isActiveHeroImage`, `isFeaturedEventImage`, `isLiveEventImage` flags
     - Same `eventMediaType`, `storageType`, `contentType`, `fileSize`
     - Same `uploadedById` (user who uploaded the parent media)
     - **Different `eventId`** (set to the child event's ID)
     - **Different `id`** (new record, auto-generated)
     - Same `tenantId`
     - Current timestamp for `createdAt` and `updatedAt`

## Implementation Location

**File**: `src/main/java/com/nextjstemplate/service/impl/EventMediaServiceImpl.java` (or similar service implementation)

**Method**: The method that handles media upload (likely `create()` or `uploadMultiple()`)

## Implementation Steps

### Step 1: Identify Upload Completion Point

Find where media records are created after successful file upload. This is typically after:
- File is uploaded to S3/storage
- `EventMedia` entity is saved to database
- Response is prepared

### Step 2: Add Recurrence Sync Logic

After the parent event's media record is successfully created, add the following logic:

```java
// After successfully creating the parent event's media record
if (savedMedia.getIsHomePageHeroImage() != null && savedMedia.getIsHomePageHeroImage()) {
    // Check if this is a parent event (parentEventId is null)
    EventDetails eventDetails = eventDetailsRepository.findById(savedMedia.getEventId())
        .orElse(null);

    if (eventDetails != null && eventDetails.getParentEventId() == null) {
        // This is a parent event - replicate media to all child events
        replicateHomePageHeroImageToChildren(savedMedia, eventDetails);
    }
}
```

### Step 3: Implement Replication Method

```java
private void replicateHomePageHeroImageToChildren(EventMedia parentMedia, EventDetails parentEvent) {
    try {
        // Fetch all child events in the recurrence series
        Long recurrenceSeriesId = parentEvent.getRecurrenceSeriesId() != null
            ? parentEvent.getRecurrenceSeriesId()
            : parentEvent.getId();

        List<EventDetails> childEvents = eventDetailsRepository
            .findByRecurrenceSeriesIdAndParentEventIdIsNotNull(recurrenceSeriesId);

        // Alternative query if the above doesn't exist:
        // List<EventDetails> childEvents = eventDetailsRepository
        //     .findByParentEventId(parentEvent.getId());

        log.info("Replicating homepage hero image from parent event {} to {} child events",
            parentEvent.getId(), childEvents.size());

        for (EventDetails childEvent : childEvents) {
            // Check if child event already has a homepage hero image
            // Only create a new record if the child doesn't already have one
            List<EventMedia> existingHomePageHeroImages = eventMediaRepository
                .findByEventIdAndIsHomePageHeroImageTrue(childEvent.getId());

            if (!existingHomePageHeroImages.isEmpty()) {
                log.debug("Child event {} already has homepage hero image, skipping replication", childEvent.getId());
                continue; // Skip this child - preserve existing homepage hero image
            }

            // Child doesn't have homepage hero image - create one
            EventMedia childMedia = new EventMedia();

            // Copy all fields from parent media
            childMedia.setTitle(parentMedia.getTitle());
            childMedia.setDescription(parentMedia.getDescription());
            childMedia.setEventMediaType(parentMedia.getEventMediaType());
            childMedia.setStorageType(parentMedia.getStorageType());
            childMedia.setFileUrl(parentMedia.getFileUrl()); // Same URL
            childMedia.setContentType(parentMedia.getContentType());
            childMedia.setFileSize(parentMedia.getFileSize());
            childMedia.setIsPublic(parentMedia.getIsPublic());
            childMedia.setEventFlyer(parentMedia.getEventFlyer());
            childMedia.setIsEventManagementOfficialDocument(parentMedia.getIsEventManagementOfficialDocument());
            childMedia.setAltText(parentMedia.getAltText());
            childMedia.setDisplayOrder(parentMedia.getDisplayOrder());
            childMedia.setIsFeaturedVideo(parentMedia.getIsFeaturedVideo());
            childMedia.setFeaturedVideoUrl(parentMedia.getFeaturedVideoUrl());
            childMedia.setIsHeroImage(parentMedia.getIsHeroImage());
            childMedia.setIsActiveHeroImage(parentMedia.getIsActiveHeroImage());
            childMedia.setIsHomePageHeroImage(true); // Explicitly set to true
            childMedia.setIsFeaturedEventImage(parentMedia.getIsFeaturedEventImage());
            childMedia.setIsLiveEventImage(parentMedia.getIsLiveEventImage());
            childMedia.setStartDisplayingFromDate(parentMedia.getStartDisplayingFromDate());

            // Set child-specific fields
            childMedia.setEventId(childEvent.getId()); // Child event ID
            childMedia.setUploadedById(parentMedia.getUploadedById()); // Same uploader
            childMedia.setTenantId(parentMedia.getTenantId()); // Same tenant

            // Set timestamps
            childMedia.setCreatedAt(ZonedDateTime.now());
            childMedia.setUpdatedAt(ZonedDateTime.now());

            // Save child media record
            eventMediaRepository.save(childMedia);

            log.debug("Created homepage hero image media record for child event {}", childEvent.getId());
        }

        log.info("Successfully replicated homepage hero image to {} child events", childEvents.size());

    } catch (Exception e) {
        log.error("Failed to replicate homepage hero image to child events for parent event {}",
            parentEvent.getId(), e);
        // Don't throw - parent media upload should still succeed even if replication fails
        // Log the error for investigation
    }
}
```

### Step 4: Handle Edge Cases

1. **Child events don't exist yet**: If child events haven't been generated yet, the replication will simply create 0 records. This is acceptable.

2. **Child event already has homepage hero image**:
   - **REQUIRED BEHAVIOR**: Skip replication for that child (preserve existing homepage hero image)
   - Check if child has any EventMedia with `isHomePageHeroImage = true`
   - If yes, skip creating a new record for that child
   - This preserves child-specific homepage hero images that may have been customized

3. **Replication fails**: Don't fail the parent upload. Log the error and continue.

4. **Partial replication**: If some children succeed and others fail, log which ones failed but don't rollback the successful ones.

5. **Multiple homepage hero images**: If a child has multiple records with `isHomePageHeroImage = true`, skip replication (treat as "already has one").

### Step 5: Check for Existing Homepage Hero Images (Required)

**IMPORTANT**: Before creating a media record for a child event, check if it already has a homepage hero image. If it does, skip replication for that child.

```java
// Check if child already has homepage hero image
List<EventMedia> existingHomePageHeroImages = eventMediaRepository
    .findByEventIdAndIsHomePageHeroImageTrue(childEvent.getId());

if (!existingHomePageHeroImages.isEmpty()) {
    // Child already has homepage hero image - skip replication
    log.debug("Child event {} already has {} homepage hero image(s), skipping replication",
        childEvent.getId(), existingHomePageHeroImages.size());
    continue; // Skip to next child
}
```

**Rationale**: This preserves child-specific homepage hero images that may have been customized or uploaded separately. Only child events without a homepage hero image will receive the parent's image.

## Database Query Requirements

You may need to add repository methods:

### For finding child events:
```java
// In EventDetailsRepository
List<EventDetails> findByRecurrenceSeriesIdAndParentEventIdIsNotNull(Long recurrenceSeriesId);

// Or if using parentEventId directly:
List<EventDetails> findByParentEventId(Long parentEventId);
```

### For checking existing homepage hero images:
```java
// In EventMediaRepository
List<EventMedia> findByEventIdAndIsHomePageHeroImageTrue(Long eventId);
```

**Note**: If this method doesn't exist, you can use:
```java
List<EventMedia> findByEventIdAndIsHomePageHeroImage(eventId, true);
// Or
List<EventMedia> existing = eventMediaRepository.findByEventId(childEvent.getId())
    .stream()
    .filter(media -> media.getIsHomePageHeroImage() != null && media.getIsHomePageHeroImage())
    .collect(Collectors.toList());
```

## Testing Checklist

1. ✅ Upload homepage hero image for parent event → Should create media for all child events
2. ✅ Upload homepage hero image for child event → Should NOT replicate (only parent triggers replication)
3. ✅ Upload non-homepage-hero image for parent → Should NOT replicate
4. ✅ Upload homepage hero image for non-recurring event → Should NOT replicate (no children)
5. ✅ Upload homepage hero image when child events don't exist yet → Should handle gracefully (0 replications)
6. ✅ Upload homepage hero image when child already has one → Should **skip** (preserve existing)
7. ✅ Verify all child media records have same `fileUrl` as parent
8. ✅ Verify all child media records have `isHomePageHeroImage = true`
9. ✅ Verify all child media records have correct `eventId` (child's ID)

## API Endpoint Considerations

This logic should be triggered in:
- `POST /api/event-medias/upload-multiple` (multiple file upload)
- `POST /api/event-medias` (single file upload)
- `PATCH /api/event-medias/{id}` (if `isHomePageHeroImage` is changed from false to true)

## Performance Considerations

- If a parent event has many child events (e.g., 100+), batch the saves or use bulk insert
- Consider async processing for large recurrence series
- Add database indexes on `recurrenceSeriesId` and `parentEventId` for faster queries

## Logging

Add comprehensive logging:
- When replication starts
- How many child events found
- Success/failure for each child
- Total replication summary

## Error Handling

- Replication failures should NOT fail the parent media upload
- Log errors for investigation
- Consider adding a retry mechanism or manual sync endpoint for failed replications

## Related Frontend Changes

The frontend does NOT need changes - this is purely a backend enhancement. The frontend will automatically see the new media records for child events when it queries the API.

## Example Flow

1. User uploads image on `/admin/events/6356/media` with `isHomePageHeroImage = true`
2. Backend saves media record for event 6356 (parent)
3. Backend detects `isHomePageHeroImage = true` and `parentEventId = null`
4. Backend queries: `findByRecurrenceSeriesId(6356)` → Returns [6356 (parent), 6507 (child), 6508 (child)]
5. Backend filters to children: [6507, 6508]
6. For each child:
   - **Child 6507**: Check `findByEventIdAndIsHomePageHeroImageTrue(6507)` → Returns empty list → **CREATE** new record
   - **Child 6508**: Check `findByEventIdAndIsHomePageHeroImageTrue(6508)` → Returns 1 existing record → **SKIP** (preserve existing)
7. Backend creates EventMedia record only for child 6507:
   - EventMedia(eventId=6507, fileUrl="https://s3.../image.jpg", isHomePageHeroImage=true, ...)
8. Frontend queries `/api/event-medias?eventId.equals=6507&isHomePageHeroImage.equals=true` → Returns the replicated media
9. Frontend queries `/api/event-medias?eventId.equals=6508&isHomePageHeroImage.equals=true` → Returns the existing media (not replicated)

## Success Criteria

- ✅ Parent event homepage hero image upload succeeds
- ✅ Only child events **without** existing homepage hero images receive the replicated image
- ✅ Child events that already have `isHomePageHeroImage = true` are **preserved** (not overwritten)
- ✅ Child events' media records have same `fileUrl` as parent (when created)
- ✅ No manual intervention required
- ✅ Frontend automatically displays homepage hero images for child events (either replicated or existing)

