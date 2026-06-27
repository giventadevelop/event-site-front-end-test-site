# Backend Implementation: Add eventSponsorsJoinId Support

## Overview
Add `eventSponsorsJoinId` parameter support to the existing `/api/event-medias/upload` endpoint to enable event-sponsor custom poster uploads.

## Backend Project Location
`E:\project_workspace\malayalees-us-site-boot`

## Changes Required

### 1. EventMediaResource.java - Add Request Parameters

**File**: `src/main/java/com/nextjstemplate/web/rest/EventMediaResource.java`

**Method**: `uploadFile`

**Add these parameters to the method signature** (after `imageType` parameter):

```java
@RequestParam(value = "eventSponsorsJoinId", required = false) Long eventSponsorsJoinId,
@RequestParam(value = "sponsorId", required = false) Long sponsorId,
@RequestParam(value = "eventMediaType", required = false) String eventMediaType,
@RequestParam(value = "storageType", required = false) String storageType,
```

**Pass them to the service method**:

```java
EventMediaDTO mediaDTO = eventMediaService.uploadFile(
    // ... existing parameters ...
    eventSponsorsJoinId,  // ✅ ADD THIS
    sponsorId,            // ✅ ADD THIS
    eventMediaType,       // ✅ ADD THIS
    storageType,          // ✅ ADD THIS
    authentication
);
```

### 2. EventMediaService.java Interface - Add Method Parameters

**File**: `src/main/java/com/nextjstemplate/service/EventMediaService.java`

**Update the `uploadFile` method signature** to include:

```java
EventMediaDTO uploadFile(
    // ... existing parameters ...
    Long eventSponsorsJoinId,
    Long sponsorId,
    String eventMediaType,
    String storageType,
    Authentication authentication
);
```

### 3. EventMediaServiceImpl.java - Implement Logic

**File**: `src/main/java/com/nextjstemplate/service/impl/EventMediaServiceImpl.java`

**Update the `uploadFile` method**:

1. **Add parameters to method signature**:
```java
public EventMediaDTO uploadFile(
    // ... existing parameters ...
    Long eventSponsorsJoinId,  // ✅ ADD THIS
    Long sponsorId,            // ✅ ADD THIS
    String eventMediaType,     // ✅ ADD THIS
    String storageType,        // ✅ ADD THIS
    Authentication authentication
) {
```

2. **Add special handling for EVENT_SPONSOR_POSTER type** (before the existing upload logic):

```java
// ✅ ADD THIS: Handle EVENT_SPONSOR_POSTER type
if (eventMediaType != null && eventMediaType.equals("EVENT_SPONSOR_POSTER")
    && eventSponsorsJoinId != null && eventId != null && sponsorId != null) {

    // 1. Generate S3 path for event-sponsor poster
    String s3Path = s3Config.generateEventSponsorPosterPath(
        tenantId,
        eventId,
        sponsorId,
        file.getOriginalFilename()
    );

    // 2. Upload to S3
    String s3Url = s3Service.uploadFile(file, s3Path);

    // 3. Create EventMediaDTO
    EventMediaDTO mediaDTO = new EventMediaDTO();
    mediaDTO.setEventId(eventId);
    mediaDTO.setSponsorId(sponsorId);
    mediaDTO.setEventSponsorsJoinId(eventSponsorsJoinId); // ✅ CRITICAL: Set this field
    mediaDTO.setTitle(title);
    mediaDTO.setDescription(description != null ? description : "Custom poster for event-sponsor combination");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setEventMediaType(eventMediaType);
    mediaDTO.setStorageType(storageType != null ? storageType : "S3");
    mediaDTO.setIsPublic(isPublic != null ? isPublic : true);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setPriorityRanking(0);

    // Set startDisplayingFromDate
    if (startDisplayingFromDate != null && !startDisplayingFromDate.isEmpty()) {
        try {
            mediaDTO.setStartDisplayingFromDate(LocalDate.parse(startDisplayingFromDate));
        } catch (Exception e) {
            mediaDTO.setStartDisplayingFromDate(LocalDate.now());
        }
    } else {
        mediaDTO.setStartDisplayingFromDate(LocalDate.now());
    }

    // Set timestamps
    mediaDTO.setCreatedAt(LocalDateTime.now());
    mediaDTO.setUpdatedAt(LocalDateTime.now());

    // Set other required boolean fields (use existing logic or defaults)
    mediaDTO.setEventFlyer(eventFlyer != null ? eventFlyer : false);
    mediaDTO.setIsEventManagementOfficialDocument(isEventManagementOfficialDocument != null ? isEventManagementOfficialDocument : false);
    mediaDTO.setIsHeroImage(isHeroImage != null ? isHeroImage : false);
    mediaDTO.setIsActiveHeroImage(isActiveHeroImage != null ? isActiveHeroImage : false);
    mediaDTO.setIsHomePageHeroImage(isHomePageHeroImage != null ? isHomePageHeroImage : false);
    mediaDTO.setIsFeaturedEventImage(isFeaturedEventImage != null ? isFeaturedEventImage : false);
    mediaDTO.setIsLiveEventImage(isLiveEventImage != null ? isLiveEventImage : false);

    // 4. Save EventMedia record
    EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

    // 5. Update event_sponsors_join.custom_poster_url
    try {
        EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository.findById(eventSponsorsJoinId)
            .orElseThrow(() -> new RuntimeException(
                "Event-sponsor association not found: eventSponsorsJoinId=" + eventSponsorsJoinId
            ));

        joinRecord.setCustomPosterUrl(s3Url);
        eventSponsorsJoinRepository.save(joinRecord);
    } catch (Exception e) {
        // Log error but don't fail the upload
        System.err.println("Warning: Could not update event_sponsors_join.custom_poster_url: " + e.getMessage());
    }

    return savedMedia;
}
```

3. **For other upload types**, ensure `eventSponsorsJoinId` is set if provided:

```java
// In your existing upload logic, add:
if (eventSponsorsJoinId != null) {
    mediaDTO.setEventSponsorsJoinId(eventSponsorsJoinId);
}
```

### 4. S3Config.java - Add Path Generation Method

**File**: `src/main/java/com/nextjstemplate/config/S3Config.java`

**Add this method**:

```java
/**
 * Generate S3 path for event-sponsor poster images
 * Path format: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
 */
public String generateEventSponsorPosterPath(String tenantId, Long eventId, Long sponsorId, String originalFilename) {
    // Sanitize filename
    String sanitizedFilename = sanitizeFilename(originalFilename);
    String timestamp = String.valueOf(System.currentTimeMillis());
    String uniqueFilename = generateUniqueFilename(sanitizedFilename, timestamp);

    return String.format(
        "dev/events/tenantId/%s/event-id/%d/sponsors/sponsor_id/%d/%s",
        tenantId,
        eventId,
        sponsorId,
        uniqueFilename
    );
}

private String sanitizeFilename(String filename) {
    if (filename == null || filename.isEmpty()) {
        return "file";
    }
    return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
}

private String generateUniqueFilename(String filename, String timestamp) {
    String baseName = filename;
    String extension = "";

    int lastDot = filename.lastIndexOf('.');
    if (lastDot > 0) {
        baseName = filename.substring(0, lastDot);
        extension = filename.substring(lastDot);
    }

    String uuid = UUID.randomUUID().toString().substring(0, 8);
    return String.format("%s_%s_%s%s", baseName, timestamp, uuid, extension);
}
```

## Dependencies Required

Ensure these are injected in `EventMediaServiceImpl`:
- `EventSponsorsJoinRepository` - For updating `custom_poster_url`
- `S3Config` - For generating S3 paths
- `S3Service` - For uploading files

## Testing Checklist

- [ ] `eventSponsorsJoinId` parameter accepted in upload endpoint
- [ ] `eventSponsorsJoinId` set on `EventMediaDTO` before saving
- [ ] `event_sponsors_join_id` column populated in database (currently NULL)
- [ ] S3 path generated correctly: `dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}`
- [ ] `event_sponsors_join.custom_poster_url` updated with S3 URL
- [ ] Upload works for `eventMediaType = "EVENT_SPONSOR_POSTER"`

## Current Issue

From the SQL INSERT statement, `event_sponsors_join_id` is NULL:
```sql
event_sponsors_join_id,  -- Currently NULL, should be set
```

After implementing these changes, the INSERT should include the actual `eventSponsorsJoinId` value.

