# Backend Implementation: Event-Sponsor Poster Upload Endpoint

## Overview
This document describes the backend implementation required for the event-sponsor custom poster upload feature. The frontend is ready, but the backend endpoint `/api/event-medias/upload/event-sponsor-poster` needs to be implemented.

## Current Status
- ✅ Frontend proxy handler: `src/pages/api/proxy/event-medias/upload/event-sponsor-poster.ts`
- ✅ Frontend server action: `src/app/admin/event-sponsors/ApiServerActions.ts` → `uploadEventSponsorPosterServer()`
- ❌ Backend endpoint: `/api/event-medias/upload/event-sponsor-poster` - **NOT IMPLEMENTED** (returns 404)

## Required Backend Implementation

### 1. REST Controller Endpoint

**File**: `src/main/java/com/nextjstemplate/web/rest/EventMediaResource.java` (or similar)

**Endpoint**: `POST /api/event-medias/upload/event-sponsor-poster`

```java
/**
 * Upload custom poster for event-sponsor combination
 * POST /api/event-medias/upload/event-sponsor-poster
 *
 * Creates EventMedia record and updates event_sponsors_join.custom_poster_url
 */
@PostMapping("/upload/event-sponsor-poster")
public ResponseEntity<EventMediaDTO> uploadEventSponsorPoster(
    @RequestParam Long eventId,
    @RequestParam Long sponsorId,
    @RequestParam("file") MultipartFile file,
    @RequestParam String tenantId,
    @RequestParam(required = false, defaultValue = "true") Boolean isPublic,
    @RequestParam(required = false) String title,
    @RequestParam(required = false) String description,
    @RequestParam(required = false) String startDisplayingFromDate
) {
    EventMediaDTO media = eventMediaService.uploadEventSponsorJoinPoster(
        eventId,
        sponsorId,
        file,
        tenantId,
        isPublic,
        title,
        description,
        startDisplayingFromDate
    );
    return ResponseEntity.ok(media);
}
```

### 2. Service Implementation

**File**: `src/main/java/com/nextjstemplate/service/EventMediaService.java` (or `EventMediaServiceImpl.java`)

```java
/**
 * Upload custom poster for event-sponsor combination
 * Updates event_sponsors_join.custom_poster_url field
 *
 * @param eventId Event ID
 * @param sponsorId Sponsor ID
 * @param file Uploaded file
 * @param tenantId Tenant ID
 * @param isPublic Whether the media is public
 * @param title Optional title
 * @param description Optional description
 * @param startDisplayingFromDate Optional start date (YYYY-MM-DD format)
 * @return Created EventMediaDTO
 */
public EventMediaDTO uploadEventSponsorJoinPoster(
    Long eventId,
    Long sponsorId,
    MultipartFile file,
    String tenantId,
    Boolean isPublic,
    String title,
    String description,
    String startDisplayingFromDate
) {
    // 1. Find or create event_sponsors_join record
    EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository
        .findByEventIdAndSponsorId(eventId, sponsorId)
        .orElseThrow(() -> new RuntimeException(
            "Event-sponsor association not found: eventId=" + eventId + ", sponsorId=" + sponsorId
        ));

    // 2. Generate S3 path using the specified format:
    // dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
    String s3Path = s3Config.generateEventSponsorPosterPath(
        tenantId,
        eventId,
        sponsorId,
        file.getOriginalFilename()
    );

    // 3. Upload to S3
    String s3Url = s3Service.uploadFile(file, s3Path);

    // 4. Create EventMedia record
    EventMediaDTO mediaDTO = new EventMediaDTO();
    mediaDTO.setEventSponsorsJoinId(joinRecord.getId());
    mediaDTO.setEventId(eventId);
    mediaDTO.setSponsorId(sponsorId);
    mediaDTO.setTitle(title != null ? title : "Custom Poster - Event " + eventId + " - Sponsor " + sponsorId);
    mediaDTO.setDescription(description != null ? description : "Custom poster for event-sponsor combination");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setEventMediaType("EVENT_SPONSOR_POSTER");
    mediaDTO.setStorageType("S3");
    mediaDTO.setIsPublic(isPublic != null ? isPublic : true);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setPriorityRanking(0); // Default to highest priority

    // Set startDisplayingFromDate (required field)
    if (startDisplayingFromDate != null && !startDisplayingFromDate.isEmpty()) {
        mediaDTO.setStartDisplayingFromDate(LocalDate.parse(startDisplayingFromDate));
    } else {
        mediaDTO.setStartDisplayingFromDate(LocalDate.now());
    }

    // Set other required fields
    mediaDTO.setCreatedAt(LocalDateTime.now());
    mediaDTO.setUpdatedAt(LocalDateTime.now());

    EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

    // 5. Update event_sponsors_join table
    joinRecord.setCustomPosterUrl(s3Url);
    eventSponsorsJoinRepository.save(joinRecord);

    return savedMedia;
}
```

### 3. S3 Path Generation Method

**File**: `src/main/java/com/nextjstemplate/config/S3Config.java` (or similar)

**IMPORTANT**: The S3 path format is:
```
dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
```

**Note**: The path uses `sponsors/sponsor_id/` (with slashes) for consistency with other S3 paths.

```java
/**
 * Generate S3 path for event-sponsor poster images
 * Path format: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
 *
 * Example: dev/events/tenantId/tenant_demo_001/event-id/2/sponsors/sponsor_id/4/custom_image_name.jpg
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

/**
 * Sanitize filename - remove special characters, keep alphanumeric, dots, hyphens, underscores
 */
private String sanitizeFilename(String filename) {
    if (filename == null || filename.isEmpty()) {
        return "file";
    }
    // Remove special characters, keep alphanumeric, dots, hyphens, underscores
    return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
}

/**
 * Generate unique filename with timestamp and random string
 */
private String generateUniqueFilename(String filename, String timestamp) {
    String baseName = filename;
    String extension = "";

    int lastDot = filename.lastIndexOf('.');
    if (lastDot > 0) {
        baseName = filename.substring(0, lastDot);
        extension = filename.substring(lastDot);
    }

    // Generate random UUID (first 8 characters)
    String uuid = UUID.randomUUID().toString().substring(0, 8);

    return String.format("%s_%s_%s%s", baseName, timestamp, uuid, extension);
}
```

### 4. Repository Method (if not exists)

**File**: `src/main/java/com/nextjstemplate/repository/EventSponsorsJoinRepository.java`

Ensure this method exists:

```java
Optional<EventSponsorsJoinDTO> findByEventIdAndSponsorId(Long eventId, Long sponsorId);
```

## Database Schema Requirements

### event_sponsors_join Table
Must have `custom_poster_url` column:
```sql
ALTER TABLE public.event_sponsors_join
ADD COLUMN IF NOT EXISTS custom_poster_url varchar(1024) NULL;
```

### event_media Table
Must have these columns:
- `event_id` (bigint)
- `sponsor_id` (bigint)
- `event_sponsors_join_id` (bigint)
- `event_media_type` (varchar) - should support "EVENT_SPONSOR_POSTER"
- `file_url` (varchar)
- `start_displaying_from_date` (date) - NOT NULL
- `tenant_id` (varchar)
- Other standard fields (created_at, updated_at, etc.)

## Request/Response Format

### Request
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Query Parameters**:
  - `eventId` (required): Long
  - `sponsorId` (required): Long
  - `tenantId` (required): String
  - `isPublic` (optional, default: true): Boolean
  - `title` (optional): String
  - `description` (optional): String
  - `startDisplayingFromDate` (optional): String (YYYY-MM-DD format)
- **Body**: File upload (multipart/form-data with field name "file")

### Response
- **Status**: 200 OK (on success)
- **Body**: EventMediaDTO JSON object

### Error Responses
- **400 Bad Request**: Missing required parameters
- **404 Not Found**: Event-sponsor association not found
- **500 Internal Server Error**: Upload or database error

## Testing Checklist

- [ ] Endpoint accepts POST requests with multipart/form-data
- [ ] Validates required parameters (eventId, sponsorId, tenantId)
- [ ] Finds or creates event_sponsors_join record
- [ ] Generates correct S3 path format: `dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}`
- [ ] Uploads file to S3 successfully
- [ ] Creates EventMedia record with correct fields
- [ ] Updates event_sponsors_join.custom_poster_url field
- [ ] Returns EventMediaDTO on success
- [ ] Handles errors gracefully (404, 500, etc.)

## Frontend Integration

The frontend is already configured to call this endpoint:
- **Proxy Handler**: `src/pages/api/proxy/event-medias/upload/event-sponsor-poster.ts`
- **Server Action**: `src/app/admin/event-sponsors/ApiServerActions.ts` → `uploadEventSponsorPosterServer()`
- **UI Component**: `src/components/sponsors/EventSponsorPosterUploadDialog.tsx`

Once the backend endpoint is implemented, the upload should work immediately.

## Related Documentation

- See `documentation/event_sponsors/PRD.md` for full feature requirements
- See `documentation/event_sponsors/backend_files/BACKEND_IMPLEMENTATION_PROMPT.md` for similar implementation patterns
- See `src/pages/api/proxy/event-medias/upload/sponsor.ts` for reference implementation pattern

