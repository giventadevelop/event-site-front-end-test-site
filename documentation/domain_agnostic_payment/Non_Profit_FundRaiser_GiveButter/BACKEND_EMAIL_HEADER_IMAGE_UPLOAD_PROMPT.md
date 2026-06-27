# Backend Implementation Prompt: Email Header Image Upload for Event Details

## Date: 2025-01-XX
## Feature: Email Header Image Upload for Event Details

---

## Problem Statement

We need to implement an image upload feature for email header images in the event details edit page, similar to the existing sponsor image upload functionality. The uploaded image will be used as the header image in ticket confirmation emails sent to attendees.

**Reference Implementation**: Event Sponsors Image Upload (`/admin/event-sponsors/5`)

---

## Current Implementation Reference

### Existing Backend API (Sponsor Image Upload)

**Backend Endpoint**: `POST /api/event-medias/upload/sponsor-image`

**Frontend Proxy**: `/api/proxy/event-medias/upload/sponsor`

**Query Parameters**:
- `eventId` (required): Event ID
- `entityId` (required): Sponsor ID
- `imageType` (required): Image type (LOGO_IMAGE, HERO_IMAGE, BANNER_IMAGE)
- `title` (required): Image title
- `description` (optional): Image description
- `tenantId` (required): Tenant ID
- `isPublic` (optional): Boolean flag

**Request Body**: `multipart/form-data` with `file` field

**S3 Path Pattern (Sponsor Images)**:
```
dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}
```

**Example S3 URL**:
```
https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/media/tenantId/tenant_demo_001/sponsor/sponsor_id/4/banner_1734567890_a1b2c3d4.jpg
```

---

## Required Implementation

### 1. Database Schema Change

**Add new field to `event_details` table**:

```sql
ALTER TABLE event_details
ADD COLUMN email_header_image_url VARCHAR(2048) NULL;

COMMENT ON COLUMN event_details.email_header_image_url IS
'URL of the email header image for ticket confirmation emails. Stored in S3 with path: dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image.{ext}';
```

**Database Migration**:
- Create a migration script to add the `email_header_image_url` column
- Ensure the field is nullable (existing events won't have this field initially)
- Add appropriate index if needed for querying

---

### 2. Backend API Endpoint

**Option A: Extend Existing Upload Endpoint (Recommended)**

Extend the existing `/api/event-medias/upload/sponsor-image` endpoint to support email header images by adding a new `uploadType` or `entityType` parameter that differentiates between:
- `SPONSOR` (existing functionality)
- `EMAIL_HEADER` (new functionality)

**New Endpoint**: `POST /api/event-medias/upload/email-header-image`

**OR**

**Option B: Create New Dedicated Endpoint**

Create a new dedicated endpoint specifically for email header images:
- `POST /api/event-medias/upload/email-header-image`

**Query Parameters**:
- `eventId` (required): Event ID
- `tenantId` (required): Tenant ID
- `title` (optional, default: "Email Header Image"): Image title
- `description` (optional, default: "Email header image for ticket confirmation emails"): Image description
- `isPublic` (optional, default: true): Boolean flag

**Request Body**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "id": 12345,
  "fileUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/events/tenantId/tenant_demo_002/event-id/2/tickets/email-templates/email_header_image_1763231817178_ee76a405.jpeg",
  "eventId": 2,
  "tenantId": "tenant_demo_002",
  "title": "Email Header Image",
  "description": "Email header image for ticket confirmation emails",
  "storageType": "S3",
  "createdAt": "2025-01-XX...",
  "updatedAt": "2025-01-XX..."
}
```

---

### 3. S3 Path Generation

**Add new method to `S3Config.java` (or `S3Service.java`)**:

```java
/**
 * Generate S3 path for email header images
 * Path format: dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image.{ext}
 *
 * Example: dev/events/tenantId/tenant_demo_002/event-id/2/tickets/email-templates/email_header_image_1763231817178_ee76a405.jpeg
 *
 * @param tenantId Tenant ID
 * @param eventId Event ID
 * @param originalFilename Original filename from upload
 * @return S3 path string
 */
public String generateEmailHeaderImagePath(String tenantId, Long eventId, String originalFilename) {
    // Sanitize filename
    String sanitizedFilename = sanitizeFilename(originalFilename);
    String timestamp = String.valueOf(System.currentTimeMillis());
    String uniqueFilename = generateUniqueFilename("email_header_image", timestamp);

    // Extract file extension
    String extension = "";
    if (originalFilename != null && originalFilename.contains(".")) {
        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    } else {
        extension = ".jpeg"; // Default extension
    }

    return String.format(
        "dev/events/tenantId/%s/event-id/%d/tickets/email-templates/%s%s",
        tenantId,
        eventId,
        uniqueFilename,
        extension
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
private String generateUniqueFilename(String baseName, String timestamp) {
    String uuid = UUID.randomUUID().toString().substring(0, 8);
    return String.format("%s_%s_%s", baseName, timestamp, uuid);
}
```

**S3 Path Pattern**:
```
dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image_{timestamp}_{uuid}.{ext}
```

**Example S3 URL**:
```
https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/events/tenantId/tenant_demo_002/event-id/2/tickets/email-templates/email_header_image_1763231817178_ee76a405.jpeg
```

---

### 4. Service Layer Implementation

**File**: `EventMediaService.java` (or equivalent service class)

**Add new method**:

```java
/**
 * Upload email header image for an event
 *
 * @param eventId Event ID
 * @param file Multipart file to upload
 * @param tenantId Tenant ID
 * @return EventMediaDTO with uploaded image details
 */
public EventMediaDTO uploadEmailHeaderImage(Long eventId, MultipartFile file, String tenantId) {
    // 1. Validate event exists
    EventDetails event = eventRepository.findById(eventId)
        .orElseThrow(() -> new EntityNotFoundException("Event not found: " + eventId));

    // 2. Validate file
    if (file == null || file.isEmpty()) {
        throw new IllegalArgumentException("File is required");
    }

    // Validate file type (images only)
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
        throw new IllegalArgumentException("File must be an image");
    }

    // Validate file size (e.g., max 10MB)
    if (file.getSize() > 10 * 1024 * 1024) {
        throw new IllegalArgumentException("File size must be less than 10MB");
    }

    // 3. Generate S3 path
    String s3Path = s3Config.generateEmailHeaderImagePath(tenantId, eventId, file.getOriginalFilename());

    // 4. Upload to S3
    String s3Url = s3Service.uploadFile(file, s3Path);

    // 5. Create EventMedia record (optional - for tracking/audit)
    EventMediaDTO mediaDTO = new EventMediaDTO();
    mediaDTO.setEventId(eventId);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setTitle("Email Header Image");
    mediaDTO.setDescription("Email header image for ticket confirmation emails");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setStorageType("S3");
    mediaDTO.setEventMediaType("EMAIL_HEADER_IMAGE"); // New media type
    mediaDTO.setIsPublic(true);
    mediaDTO.setCreatedAt(LocalDateTime.now());
    mediaDTO.setUpdatedAt(LocalDateTime.now());

    EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

    // 6. Update event_details table with email header image URL
    event.setEmailHeaderImageUrl(s3Url);
    eventRepository.save(event);

    return savedMedia;
}
```

---

### 5. Controller Implementation

**File**: `EventMediaController.java` (or equivalent controller)

**Add new endpoint**:

```java
/**
 * Upload email header image for an event
 *
 * @param eventId Event ID
 * @param file Image file to upload
 * @param tenantId Tenant ID (from query parameter or context)
 * @param title Optional title
 * @param description Optional description
 * @param isPublic Optional public flag
 * @return EventMediaDTO with uploaded image details
 */
@PostMapping("/upload/email-header-image")
@Operation(summary = "Upload email header image for event", description = "Uploads an image to be used as the header in ticket confirmation emails")
public ResponseEntity<EventMediaDTO> uploadEmailHeaderImage(
    @RequestParam("eventId") Long eventId,
    @RequestParam("file") MultipartFile file,
    @RequestParam(value = "tenantId", required = false) String tenantId,
    @RequestParam(value = "title", required = false, defaultValue = "Email Header Image") String title,
    @RequestParam(value = "description", required = false, defaultValue = "Email header image for ticket confirmation emails") String description,
    @RequestParam(value = "isPublic", required = false, defaultValue = "true") Boolean isPublic
) {
    // Get tenantId from context if not provided
    String finalTenantId = tenantId != null ? tenantId : getTenantIdFromContext();

    if (finalTenantId == null) {
        return ResponseEntity.badRequest().build();
    }

    try {
        EventMediaDTO media = eventMediaService.uploadEmailHeaderImage(eventId, file, finalTenantId);
        return ResponseEntity.ok(media);
    } catch (Exception e) {
        log.error("Failed to upload email header image", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

---

### 6. Reuse Existing Functionality Pattern

**CRITICAL**: The implementation should reuse the existing image upload infrastructure:

1. **Reuse S3Service**: Use the same `S3Service.uploadFile()` method
2. **Reuse File Validation**: Use the same file validation logic (size, type checks)
3. **Reuse EventMedia Repository**: Store metadata in `event_media` table for audit/tracking
4. **Reuse Error Handling**: Use the same error handling patterns
5. **Reuse JWT Authentication**: Use the same authentication mechanism

**Differentiation Strategy**:

The existing upload endpoint can be extended to support both sponsor and email header images by:

**Option 1: Add `uploadType` parameter** (if extending existing endpoint):
```java
@RequestParam(value = "uploadType", required = false, defaultValue = "SPONSOR") String uploadType
```

Then in the service method:
```java
if ("EMAIL_HEADER".equals(uploadType)) {
    // Use email header S3 path generation
    s3Path = s3Config.generateEmailHeaderImagePath(tenantId, eventId, file.getOriginalFilename());
    // Update event_details.email_header_image_url
} else if ("SPONSOR".equals(uploadType)) {
    // Use existing sponsor S3 path generation
    s3Path = s3Config.generateSponsorImagePath(tenantId, entityId, file.getOriginalFilename());
    // Update event_sponsors table
}
```

**Option 2: Create separate endpoint** (recommended for clarity):
- Keep existing `/api/event-medias/upload/sponsor-image` unchanged
- Create new `/api/event-medias/upload/email-header-image` endpoint
- Both endpoints share the same underlying service methods (S3Service, validation, etc.)

---

### 7. EventMediaType Enum Update

**If using EventMediaType enum**, add new value:

```java
public enum EventMediaType {
    // ... existing types ...
    EMAIL_HEADER_IMAGE("EMAIL_HEADER_IMAGE");
}
```

---

### 8. DTO Updates

**Update `EventDetailsDTO`** (if using DTOs):

```java
public class EventDetailsDTO {
    // ... existing fields ...

    /**
     * URL of the email header image for ticket confirmation emails
     */
    private String emailHeaderImageUrl;

    // ... getters and setters ...
}
```

---

## Implementation Checklist

### Backend Tasks

- [ ] **Database Migration**: Add `email_header_image_url` column to `event_details` table
- [ ] **S3Config**: Add `generateEmailHeaderImagePath()` method
- [ ] **Service Layer**: Add `uploadEmailHeaderImage()` method in `EventMediaService`
- [ ] **Controller**: Add `POST /api/event-medias/upload/email-header-image` endpoint
- [ ] **DTO Update**: Add `emailHeaderImageUrl` field to `EventDetailsDTO`
- [ ] **EventMediaType**: Add `EMAIL_HEADER_IMAGE` enum value (if using enum)
- [ ] **Error Handling**: Implement proper error handling and validation
- [ ] **File Validation**: Validate file type (images only) and size (max 10MB)
- [ ] **Update Event**: Update `event_details.email_header_image_url` after successful upload
- [ ] **EventMedia Record**: Create `event_media` record for audit/tracking (optional but recommended)

### Testing Requirements

- [ ] **Unit Tests**: Test S3 path generation for email header images
- [ ] **Integration Tests**: Test full upload flow (file → S3 → database update)
- [ ] **Validation Tests**: Test file type validation, size limits, missing parameters
- [ ] **Error Handling Tests**: Test error scenarios (event not found, S3 upload failure, etc.)
- [ ] **S3 Path Verification**: Verify S3 path matches expected pattern:
  ```
  dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image_{timestamp}_{uuid}.{ext}
  ```
- [ ] **Database Verification**: Verify `event_details.email_header_image_url` is updated correctly
- [ ] **Backward Compatibility**: Verify existing sponsor image upload still works

---

## API Specification

### Endpoint: `POST /api/event-medias/upload/email-header-image`

**Request**:
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `eventId` (required, Long): Event ID
  - `tenantId` (required, String): Tenant ID
  - `title` (optional, String, default: "Email Header Image"): Image title
  - `description` (optional, String, default: "Email header image for ticket confirmation emails"): Image description
  - `isPublic` (optional, Boolean, default: true): Public visibility flag
- **Body**:
  - `file` (required, MultipartFile): Image file (JPEG, PNG, GIF, etc., max 10MB)

**Response** (200 OK):
```json
{
  "id": 12345,
  "fileUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/events/tenantId/tenant_demo_002/event-id/2/tickets/email-templates/email_header_image_1763231817178_ee76a405.jpeg",
  "eventId": 2,
  "tenantId": "tenant_demo_002",
  "title": "Email Header Image",
  "description": "Email header image for ticket confirmation emails",
  "storageType": "S3",
  "eventMediaType": "EMAIL_HEADER_IMAGE",
  "isPublic": true,
  "createdAt": "2025-01-XXT...",
  "updatedAt": "2025-01-XXT..."
}
```

**Error Responses**:
- `400 Bad Request`: Missing required parameters, invalid file type, file too large
- `404 Not Found`: Event not found
- `500 Internal Server Error`: S3 upload failure, database error

---

## S3 Path Examples

**Expected S3 Path Pattern**:
```
dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image_{timestamp}_{uuid}.{ext}
```

**Example URLs**:
```
https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/events/tenantId/tenant_demo_002/event-id/2/tickets/email-templates/email_header_image_1763231817178_ee76a405.jpeg

https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/events/tenantId/tenant_demo_002/event-id/4101/tickets/email-templates/email_header_image_1763231817178_a1b2c3d4.png
```

---

## Key Implementation Notes

1. **Reuse Existing Infrastructure**:
   - Use the same `S3Service.uploadFile()` method
   - Use the same file validation logic
   - Use the same error handling patterns
   - Use the same authentication mechanism

2. **Path Differentiation**:
   - Sponsor images: `dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}`
   - Email header images: `dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image_{timestamp}_{uuid}.{ext}`
   - The path is determined by the endpoint or `uploadType` parameter, not by entity type

3. **Database Updates**:
   - Update `event_details.email_header_image_url` after successful S3 upload
   - Optionally create `event_media` record for audit/tracking

4. **Backward Compatibility**:
   - **CRITICAL**: Do not break existing sponsor image upload functionality
   - Existing `/api/event-medias/upload/sponsor-image` endpoint must continue to work exactly as before
   - If extending existing endpoint, ensure default behavior remains unchanged

5. **File Naming**:
   - Use consistent naming: `email_header_image_{timestamp}_{uuid}.{ext}`
   - This ensures uniqueness and makes it easy to identify email header images in S3

6. **Error Handling**:
   - Validate event exists before processing
   - Validate file type (images only: JPEG, PNG, GIF, WebP)
   - Validate file size (recommended max: 10MB)
   - Handle S3 upload failures gracefully
   - Return appropriate HTTP status codes

---

## Frontend Integration Notes

The frontend will call this endpoint via a proxy route:
- **Frontend Proxy**: `/api/proxy/event-medias/upload/email-header-image`
- **Backend API**: `/api/event-medias/upload/email-header-image`

The proxy handler will:
1. Forward the multipart form data to the backend
2. Include JWT authentication
3. Inject `tenantId` if not provided
4. Handle errors and return appropriate responses

---

## References

- **Existing Sponsor Upload Implementation**:
  - Backend: `/api/event-medias/upload/sponsor-image`
  - Frontend Proxy: `/api/proxy/event-medias/upload/sponsor`
  - File: `src/pages/api/proxy/event-medias/upload/sponsor.ts`
- **S3 Path Generation**: See `S3Config.java` methods `generateSponsorImagePath()` and `generateEventSponsorPosterPath()`
- **Service Implementation**: See `EventMediaService.java` upload methods for sponsors
- **Controller Implementation**: See `EventMediaController.java` for existing upload endpoints

---

## Summary

This implementation should:
1. ✅ Add `email_header_image_url` field to `event_details` table
2. ✅ Create new endpoint `/api/event-medias/upload/email-header-image` (or extend existing with parameter)
3. ✅ Generate S3 paths in format: `dev/events/tenantId/{tenantId}/event-id/{eventId}/tickets/email-templates/email_header_image_{timestamp}_{uuid}.{ext}`
4. ✅ Reuse existing S3 upload, validation, and error handling infrastructure
5. ✅ Update `event_details.email_header_image_url` after successful upload
6. ✅ Maintain backward compatibility with existing sponsor image upload functionality
7. ✅ Follow the same patterns and conventions as the sponsor image upload feature


