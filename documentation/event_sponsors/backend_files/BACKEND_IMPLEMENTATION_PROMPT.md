# Backend Implementation Prompt: Event Sponsors Multi-File Upload with Priority Ranking

## Project Context
**Backend Project Location**: `E:\project_workspace\malayalees-us-site-boot`
**Framework**: Spring Boot
**Database**: PostgreSQL
**PRD Reference**: `documentation/event_sponsors/PRD.md` (v2.1)

## Overview
Implement comprehensive image upload functionality for event sponsors with support for:
1. **Multiple media files per sponsor** - Each sponsor can have multiple media files stored in `event_media` table
2. **Multiple media files per event-sponsor combination** - Each event-sponsor join can have multiple media files
3. **Priority ranking system** - Each media file has a `priority_ranking` field (INT4, default 0) where lower values = higher priority (0 = highest priority)
4. **Dynamic S3 path generation** - Automatic path creation for sponsor and event-sponsor media files

---

## 1. Database Schema Changes (Already Applied)

The following database changes have already been applied to the database schema:
- ✅ `event_media` table now includes `priority_ranking INT4 NOT NULL DEFAULT 0` field
- ✅ `event_media` table already has `sponsor_id` and `event_sponsors_join_id` foreign key references
- ✅ Indexes for priority ranking queries have been created
- ✅ Foreign key constraints are in place

**No database migration needed** - schema is already updated. You only need to verify the `priority_ranking` column exists in your `EventMedia` entity.

---

## 2. Entity Updates

### 2.1 EventMedia Entity

**File**: `src/main/java/com/nextjstemplate/domain/EventMedia.java`

**Required Changes**:
1. Verify `sponsorId` and `eventSponsorsJoinId` fields exist
2. **Add `priorityRanking` field** if not present:

```java
/**
 * Priority ranking for media files (sponsor or event-sponsor).
 * Lower values indicate higher priority (0 = highest priority).
 * Used to determine which image to display when multiple files are available.
 */
@Column(name = "priority_ranking", nullable = false)
@NotNull
private Integer priorityRanking = 0;

// Getter and setter
public Integer getPriorityRanking() {
    return priorityRanking;
}

public void setPriorityRanking(Integer priorityRanking) {
    this.priorityRanking = priorityRanking;
}
```

**Note**: Ensure the entity already has:
- `@ManyToOne` relationship with `EventSponsors` (sponsor field)
- `@ManyToOne` relationship with `EventSponsorsJoin` (eventSponsorsJoin field)
- `sponsorId` and `eventSponsorsJoinId` fields

### 2.2 EventSponsorsJoin Entity

**File**: `src/main/java/com/nextjstemplate/domain/EventSponsorsJoin.java`

**Verify** that `customPosterUrl` field exists:

```java
/**
 * Custom poster image URL for this specific event-sponsor combination
 */
@Column(name = "custom_poster_url", length = 1024)
private String customPosterUrl;

// Getter and setter
public String getCustomPosterUrl() {
    return customPosterUrl;
}

public void setCustomPosterUrl(String customPosterUrl) {
    this.customPosterUrl = customPosterUrl;
}
```

---

## 3. DTO Updates

### 3.1 EventMediaDTO

**File**: `src/main/java/com/nextjstemplate/service/dto/EventMediaDTO.java`

**Required Changes**:
1. Verify `sponsorId` and `eventSponsorsJoinId` fields exist
2. **Add `priorityRanking` field**:

```java
/**
 * Reference to sponsor for sponsor-specific media files
 */
private Long sponsorId;

/**
 * Reference to event-sponsor join record for custom posters
 */
private Long eventSponsorsJoinId;

/**
 * Priority ranking for media files (sponsor or event-sponsor).
 * Lower values indicate higher priority (0 = highest priority).
 */
private Integer priorityRanking;

// Getters and setters
public Long getSponsorId() {
    return sponsorId;
}

public void setSponsorId(Long sponsorId) {
    this.sponsorId = sponsorId;
}

public Long getEventSponsorsJoinId() {
    return eventSponsorsJoinId;
}

public void setEventSponsorsJoinId(Long eventSponsorsJoinId) {
    this.eventSponsorsJoinId = eventSponsorsJoinId;
}

public Integer getPriorityRanking() {
    return priorityRanking;
}

public void setPriorityRanking(Integer priorityRanking) {
    this.priorityRanking = priorityRanking;
}
```

### 3.2 EventSponsorsJoinDTO

**File**: `src/main/java/com/nextjstemplate/service/dto/EventSponsorsJoinDTO.java`

**Verify** that `customPosterUrl` field exists:

```java
/**
 * Custom poster image URL for this specific event-sponsor combination
 */
private String customPosterUrl;

// Getter and setter
public String getCustomPosterUrl() {
    return customPosterUrl;
}

public void setCustomPosterUrl(String customPosterUrl) {
    this.customPosterUrl = customPosterUrl;
}
```

---

## 4. Repository Updates

### 4.1 EventMediaRepository

**File**: `src/main/java/com/nextjstemplate/repository/EventMediaRepository.java`

**Add/Update Methods**:

```java
/**
 * Find all media files for a specific sponsor, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.sponsorId = :sponsorId ORDER BY e.priorityRanking ASC")
List<EventMedia> findBySponsorId(@Param("sponsorId") Long sponsorId);

/**
 * Find all media files for a specific sponsor with tenant filter, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.sponsorId = :sponsorId AND e.tenantId = :tenantId ORDER BY e.priorityRanking ASC")
List<EventMedia> findBySponsorIdAndTenantId(@Param("sponsorId") Long sponsorId, @Param("tenantId") String tenantId);

/**
 * Find all media files for an event-sponsor combination, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.eventSponsorsJoinId = :eventSponsorsJoinId ORDER BY e.priorityRanking ASC")
List<EventMedia> findByEventSponsorsJoinId(@Param("eventSponsorsJoinId") Long eventSponsorsJoinId);

/**
 * Find all media files for an event-sponsor combination with tenant filter, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.eventSponsorsJoinId = :eventSponsorsJoinId AND e.tenantId = :tenantId ORDER BY e.priorityRanking ASC")
List<EventMedia> findByEventSponsorsJoinIdAndTenantId(@Param("eventSponsorsJoinId") Long eventSponsorsJoinId, @Param("tenantId") String tenantId);

/**
 * Find custom poster for event-sponsor combination, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.eventSponsorsJoinId = :eventSponsorsJoinId AND e.eventMediaType = 'EVENT_SPONSOR_POSTER' ORDER BY e.priorityRanking ASC")
Optional<EventMedia> findCustomPosterByEventSponsorsJoinId(@Param("eventSponsorsJoinId") Long eventSponsorsJoinId);
```

**Important**: All queries must include `ORDER BY e.priorityRanking ASC` to ensure results are sorted by priority (0 = highest priority first).

### 4.2 EventSponsorsJoinRepository

**File**: `src/main/java/com/nextjstemplate/repository/EventSponsorsJoinRepository.java`

**Verify** that this method exists:

```java
/**
 * Find event-sponsor join record by event ID and sponsor ID
 */
Optional<EventSponsorsJoin> findByEventIdAndSponsorId(Long eventId, Long sponsorId);
```

If it doesn't exist, add it.

---

## 5. S3 Configuration Updates

### 5.1 S3Config or S3Service

**File**: `src/main/java/com/nextjstemplate/config/S3Config.java` (or similar S3 configuration/service file)

**Required Changes**:
Add methods for dynamic S3 path generation for sponsor and event-sponsor media:

```java
/**
 * Generate S3 path for sponsor images
 * Path format: dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}
 */
public String generateSponsorImagePath(String tenantId, Long sponsorId, String originalFilename) {
    // Sanitize filename
    String sanitizedFilename = sanitizeFilename(originalFilename);
    String timestamp = String.valueOf(System.currentTimeMillis());
    String uniqueFilename = generateUniqueFilename(sanitizedFilename, timestamp);

    return String.format(
        "dev/media/tenantId/%s/sponsor/sponsor_id/%d/%s",
        tenantId,
        sponsorId,
        uniqueFilename
    );
}

/**
 * Generate S3 path for event-sponsor join images
 * Path format: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}
 */
public String generateEventSponsorJoinImagePath(String tenantId, Long eventId, Long sponsorId, String originalFilename) {
    // Sanitize filename
    String sanitizedFilename = sanitizeFilename(originalFilename);
    String timestamp = String.valueOf(System.currentTimeMillis());
    String uniqueFilename = generateUniqueFilename(sanitizedFilename, timestamp);

    return String.format(
        "dev/events/tenantId/%s/event-id/%d/sponsor/sponsor_id/%d/%s",
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
    // Extract name and extension
    int lastDot = filename.lastIndexOf('.');
    String name = lastDot > 0 ? filename.substring(0, lastDot) : filename;
    String extension = lastDot > 0 ? filename.substring(lastDot) : "";

    // Generate unique filename with timestamp and random string
    String randomString = UUID.randomUUID().toString().substring(0, 8);
    return String.format("%s_%s_%s%s", name, timestamp, randomString, extension);
}
```

**Note**: Reuse existing `sanitizeFilename` and `generateUniqueFilename` methods if they already exist in your codebase.

---

## 6. Service Layer Updates

### 6.1 EventMediaService

**File**: `src/main/java/com/nextjstemplate/service/EventMediaService.java`

**Required Changes**:
Add/update the following methods:

```java
/**
 * Upload sponsor image (logo, hero, or banner)
 * Updates the corresponding field in event_sponsors table
 * Also creates an EventMedia record with priority_ranking = 0
 */
public EventMediaDTO uploadSponsorImage(
    Long sponsorId,
    Long eventId,  // Can be null or 0 for main sponsors page
    String imageType,  // "logo", "hero", or "banner"
    MultipartFile file,
    String tenantId
) {
    // 1. Generate S3 path
    String s3Path = s3Config.generateSponsorImagePath(tenantId, sponsorId, file.getOriginalFilename());

    // 2. Upload to S3
    String s3Url = s3Service.uploadFile(file, s3Path);

    // 3. Create EventMedia record
    EventMediaDTO mediaDTO = new EventMediaDTO();
    mediaDTO.setSponsorId(sponsorId);
    mediaDTO.setEventId(eventId != null && eventId > 0 ? eventId : null);
    mediaDTO.setTitle(imageType + " - " + sponsorId);
    mediaDTO.setDescription("Sponsor " + imageType + " image");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setEventMediaType("SPONSOR_" + imageType.toUpperCase());
    mediaDTO.setStorageType("S3");
    mediaDTO.setIsPublic(true);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setPriorityRanking(0); // Default to highest priority

    EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

    // 4. Update event_sponsors table
    EventSponsorsDTO sponsor = eventSponsorsRepository.findById(sponsorId)
        .orElseThrow(() -> new RuntimeException("Sponsor not found: " + sponsorId));

    switch (imageType.toLowerCase()) {
        case "logo":
            sponsor.setLogoUrl(s3Url);
            break;
        case "hero":
            sponsor.setHeroImageUrl(s3Url);
            break;
        case "banner":
            sponsor.setBannerImageUrl(s3Url);
            break;
        default:
            throw new IllegalArgumentException("Invalid image type: " + imageType);
    }
    eventSponsorsRepository.save(sponsor);

    return savedMedia;
}

/**
 * Upload custom poster for event-sponsor combination
 * Updates event_sponsors_join.custom_poster_url field
 * Also creates an EventMedia record with priority_ranking = 0
 */
public EventMediaDTO uploadEventSponsorJoinPoster(
    Long eventId,
    Long sponsorId,
    MultipartFile file,
    String tenantId
) {
    // 1. Find or create event_sponsors_join record
    EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository
        .findByEventIdAndSponsorId(eventId, sponsorId)
        .orElseThrow(() -> new RuntimeException("Event-sponsor association not found: eventId=" + eventId + ", sponsorId=" + sponsorId));

    // 2. Generate S3 path
    String s3Path = s3Config.generateEventSponsorJoinImagePath(
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
    mediaDTO.setTitle("Custom Poster - Event " + eventId + " - Sponsor " + sponsorId);
    mediaDTO.setDescription("Custom poster for event-sponsor combination");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setEventMediaType("EVENT_SPONSOR_POSTER");
    mediaDTO.setStorageType("S3");
    mediaDTO.setIsPublic(true);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setPriorityRanking(0); // Default to highest priority

    EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

    // 5. Update event_sponsors_join table
    joinRecord.setCustomPosterUrl(s3Url);
    eventSponsorsJoinRepository.save(joinRecord);

    return savedMedia;
}

/**
 * Upload multiple media files for a sponsor
 * Creates EventMedia record with priority_ranking = 0 (can be updated later)
 */
public EventMediaDTO uploadSponsorMedia(
    Long sponsorId,
    MultipartFile file,
    String title,
    String description,
    String tenantId,
    Integer priorityRanking  // Optional, defaults to 0
) {
    // 1. Generate S3 path (similar to sponsor image)
    String s3Path = s3Config.generateSponsorImagePath(tenantId, sponsorId, file.getOriginalFilename());

    // 2. Upload to S3
    String s3Url = s3Service.uploadFile(file, s3Path);

    // 3. Create EventMedia record
    EventMediaDTO mediaDTO = new EventMediaDTO();
    mediaDTO.setSponsorId(sponsorId);
    mediaDTO.setTitle(title != null ? title : "Sponsor Media");
    mediaDTO.setDescription(description != null ? description : "Sponsor media file");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setEventMediaType("SPONSOR_MEDIA");
    mediaDTO.setStorageType("S3");
    mediaDTO.setIsPublic(true);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setPriorityRanking(priorityRanking != null ? priorityRanking : 0); // Default to highest priority

    return eventMediaRepository.save(mediaDTO);
}

/**
 * Upload multiple media files for an event-sponsor combination
 * Creates EventMedia record with priority_ranking = 0 (can be updated later)
 */
public EventMediaDTO uploadEventSponsorMedia(
    Long eventId,
    Long sponsorId,
    MultipartFile file,
    String title,
    String description,
    String tenantId,
    Integer priorityRanking  // Optional, defaults to 0
) {
    // 1. Find event_sponsors_join record
    EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository
        .findByEventIdAndSponsorId(eventId, sponsorId)
        .orElseThrow(() -> new RuntimeException("Event-sponsor association not found: eventId=" + eventId + ", sponsorId=" + sponsorId));

    // 2. Generate S3 path
    String s3Path = s3Config.generateEventSponsorJoinImagePath(
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
    mediaDTO.setTitle(title != null ? title : "Event-Sponsor Media");
    mediaDTO.setDescription(description != null ? description : "Event-sponsor media file");
    mediaDTO.setFileUrl(s3Url);
    mediaDTO.setEventMediaType("EVENT_SPONSOR_MEDIA");
    mediaDTO.setStorageType("S3");
    mediaDTO.setIsPublic(true);
    mediaDTO.setTenantId(tenantId);
    mediaDTO.setPriorityRanking(priorityRanking != null ? priorityRanking : 0); // Default to highest priority

    return eventMediaRepository.save(mediaDTO);
}

/**
 * Find all media files for a sponsor, sorted by priority ranking (ascending)
 */
public List<EventMediaDTO> findBySponsorId(Long sponsorId, String tenantId) {
    List<EventMedia> media;
    if (tenantId != null && !tenantId.isEmpty()) {
        media = eventMediaRepository.findBySponsorIdAndTenantId(sponsorId, tenantId);
    } else {
        media = eventMediaRepository.findBySponsorId(sponsorId);
    }
    return media.stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}

/**
 * Find all media files for an event-sponsor combination, sorted by priority ranking (ascending)
 */
public List<EventMediaDTO> findByEventSponsorsJoinId(Long eventSponsorsJoinId, String tenantId) {
    List<EventMedia> media;
    if (tenantId != null && !tenantId.isEmpty()) {
        media = eventMediaRepository.findByEventSponsorsJoinIdAndTenantId(eventSponsorsJoinId, tenantId);
    } else {
        media = eventMediaRepository.findByEventSponsorsJoinId(eventSponsorsJoinId);
    }
    return media.stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}

/**
 * Update priority ranking for a media file
 */
public EventMediaDTO updateMediaPriorityRanking(Long mediaId, Integer priorityRanking) {
    EventMedia media = eventMediaRepository.findById(mediaId)
        .orElseThrow(() -> new RuntimeException("Media not found: " + mediaId));

    media.setPriorityRanking(priorityRanking);
    EventMedia updated = eventMediaRepository.save(media);
    return toDTO(updated);
}
```

**Dependencies needed**:
- `S3Config` or `S3Service` for path generation and file upload
- `EventMediaRepository` for database operations
- `EventSponsorsRepository` for sponsor updates
- `EventSponsorsJoinRepository` for event-sponsor join operations

---

## 7. REST Controller Updates

### 7.1 EventMediaResource

**File**: `src/main/java/com/nextjstemplate/web/rest/EventMediaResource.java`

**Required Changes**:
Add the following endpoints:

```java
/**
 * Upload sponsor image (logo, hero, or banner)
 * POST /api/event-medias/upload/sponsor-image
 */
@PostMapping("/upload/sponsor-image")
public ResponseEntity<EventMediaDTO> uploadSponsorImage(
    @RequestParam Long sponsorId,
    @RequestParam(required = false) Long eventId,
    @RequestParam String imageType,  // "logo", "hero", or "banner"
    @RequestParam("file") MultipartFile file,
    @RequestParam String tenantId
) {
    EventMediaDTO media = eventMediaService.uploadSponsorImage(
        sponsorId,
        eventId,
        imageType,
        file,
        tenantId
    );
    return ResponseEntity.ok(media);
}

/**
 * Upload custom poster for event-sponsor combination
 * POST /api/event-medias/upload/event-sponsor-poster
 */
@PostMapping("/upload/event-sponsor-poster")
public ResponseEntity<EventMediaDTO> uploadEventSponsorPoster(
    @RequestParam Long eventId,
    @RequestParam Long sponsorId,
    @RequestParam("file") MultipartFile file,
    @RequestParam(required = false) String title,
    @RequestParam(required = false) String description,
    @RequestParam String tenantId,
    @RequestParam(required = false, defaultValue = "true") Boolean isPublic
) {
    EventMediaDTO media = eventMediaService.uploadEventSponsorJoinPoster(
        eventId,
        sponsorId,
        file,
        tenantId
    );
    return ResponseEntity.ok(media);
}

/**
 * Upload multiple media files for a sponsor
 * POST /api/event-medias/upload/sponsor-media
 */
@PostMapping("/upload/sponsor-media")
public ResponseEntity<EventMediaDTO> uploadSponsorMedia(
    @RequestParam Long sponsorId,
    @RequestParam("file") MultipartFile file,
    @RequestParam(required = false) String title,
    @RequestParam(required = false) String description,
    @RequestParam String tenantId,
    @RequestParam(required = false, defaultValue = "true") Boolean isPublic,
    @RequestParam(required = false, defaultValue = "0") Integer priorityRanking
) {
    EventMediaDTO media = eventMediaService.uploadSponsorMedia(
        sponsorId,
        file,
        title,
        description,
        tenantId,
        priorityRanking
    );
    return ResponseEntity.ok(media);
}

/**
 * Upload multiple media files for an event-sponsor combination
 * POST /api/event-medias/upload/event-sponsor-media
 */
@PostMapping("/upload/event-sponsor-media")
public ResponseEntity<EventMediaDTO> uploadEventSponsorMedia(
    @RequestParam Long eventId,
    @RequestParam Long sponsorId,
    @RequestParam("file") MultipartFile file,
    @RequestParam(required = false) String title,
    @RequestParam(required = false) String description,
    @RequestParam String tenantId,
    @RequestParam(required = false, defaultValue = "true") Boolean isPublic,
    @RequestParam(required = false, defaultValue = "0") Integer priorityRanking
) {
    EventMediaDTO media = eventMediaService.uploadEventSponsorMedia(
        eventId,
        sponsorId,
        file,
        title,
        description,
        tenantId,
        priorityRanking
    );
    return ResponseEntity.ok(media);
}

/**
 * Get all media files for a sponsor, sorted by priority ranking (ascending)
 * GET /api/event-medias/sponsor/{sponsorId}
 */
@GetMapping("/sponsor/{sponsorId}")
public ResponseEntity<List<EventMediaDTO>> getSponsorMedia(
    @PathVariable Long sponsorId,
    @RequestParam(required = false) String tenantId
) {
    List<EventMediaDTO> media = eventMediaService.findBySponsorId(sponsorId, tenantId);
    // Results are already sorted by priority_ranking ASC (highest priority first)
    return ResponseEntity.ok(media);
}

/**
 * Get all media files for an event-sponsor combination, sorted by priority ranking (ascending)
 * GET /api/event-medias/event-sponsor/{eventId}/{sponsorId}
 */
@GetMapping("/event-sponsor/{eventId}/{sponsorId}")
public ResponseEntity<List<EventMediaDTO>> getEventSponsorMedia(
    @PathVariable Long eventId,
    @PathVariable Long sponsorId,
    @RequestParam(required = false) String tenantId
) {
    // Find event_sponsors_join record first
    EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository
        .findByEventIdAndSponsorId(eventId, sponsorId)
        .orElseThrow(() -> new RuntimeException("Event-sponsor association not found"));

    List<EventMediaDTO> media = eventMediaService.findByEventSponsorsJoinId(joinRecord.getId(), tenantId);
    // Results are already sorted by priority_ranking ASC (highest priority first)
    return ResponseEntity.ok(media);
}

/**
 * Update priority ranking for a media file
 * PATCH /api/event-medias/{id}/priority-ranking
 */
@PatchMapping("/{id}/priority-ranking")
public ResponseEntity<EventMediaDTO> updateMediaPriorityRanking(
    @PathVariable Long id,
    @RequestParam Integer priorityRanking
) {
    EventMediaDTO media = eventMediaService.updateMediaPriorityRanking(id, priorityRanking);
    return ResponseEntity.ok(media);
}
```

**Important Notes**:
- All endpoints must validate tenant isolation
- All endpoints should include proper error handling
- Use appropriate HTTP status codes (200 OK, 400 Bad Request, 404 Not Found, 500 Internal Server Error)
- Include proper exception handling with meaningful error messages

---

## 8. Validation and Error Handling

### 8.1 Required Validations

1. **Tenant Validation**: Ensure all operations respect tenant isolation
2. **Sponsor ID Validation**: Verify sponsor exists before operations
3. **Event-Sponsor Association Validation**: Verify event-sponsor join exists before operations
4. **File Type Validation**: Validate file types (images: jpg, png, gif, webp; videos: mp4, webm)
5. **File Size Validation**: Implement reasonable file size limits
6. **Priority Ranking Validation**: Ensure priority_ranking >= 0

### 8.2 Error Handling

Use appropriate exceptions:
- `RuntimeException` for business logic errors (e.g., "Sponsor not found")
- `IllegalArgumentException` for invalid parameters (e.g., invalid image type)
- `DataAccessException` for database errors (already handled by Spring)

Return meaningful error messages in responses.

---

## 9. Testing Requirements

### 9.1 Unit Tests

Create unit tests for:
- `EventMediaService` methods
- `EventMediaRepository` queries
- S3 path generation methods
- Priority ranking sorting logic

### 9.2 Integration Tests

Create integration tests for:
- Upload sponsor image endpoint
- Upload event-sponsor poster endpoint
- Upload sponsor media endpoint
- Upload event-sponsor media endpoint
- Get sponsor media endpoint
- Get event-sponsor media endpoint
- Update priority ranking endpoint

### 9.3 Test Scenarios

1. **Upload sponsor logo** - Verify S3 upload, EventMedia creation, and event_sponsors.logo_url update
2. **Upload multiple sponsor media files** - Verify multiple files can be uploaded with different priority rankings
3. **Upload event-sponsor custom poster** - Verify S3 upload, EventMedia creation, and event_sponsors_join.custom_poster_url update
4. **Upload multiple event-sponsor media files** - Verify multiple files can be uploaded with different priority rankings
5. **Get sponsor media sorted by priority** - Verify results are sorted by priority_ranking ASC
6. **Update priority ranking** - Verify priority ranking can be updated
7. **Tenant isolation** - Verify users can only access their tenant's media
8. **Error handling** - Test invalid sponsor IDs, invalid event-sponsor associations, invalid file types

---

## 10. Code Review Checklist

Before submitting, verify:

- [ ] `priority_ranking` field added to `EventMedia` entity and DTO
- [ ] All repository queries include `ORDER BY priority_ranking ASC`
- [ ] S3 path generation methods implemented correctly
- [ ] All service methods set `priorityRanking = 0` by default
- [ ] All REST endpoints properly validate inputs
- [ ] Error handling is comprehensive
- [ ] Tenant isolation is enforced
- [ ] Unit tests are written and passing
- [ ] Integration tests are written and passing
- [ ] Code follows existing project patterns and conventions
- [ ] No hardcoded values (use constants or configuration)
- [ ] Proper logging is added for debugging

---

## 11. Implementation Priority

1. **High Priority**:
   - Entity/DTO updates (priority_ranking field)
   - Repository updates (queries with priority ranking sorting)
   - S3 path generation methods
   - Service methods for uploads
   - REST endpoints for uploads

2. **Medium Priority**:
   - Service methods for retrieving media (with priority sorting)
   - REST endpoints for retrieving media
   - Update priority ranking functionality

3. **Low Priority**:
   - Additional error handling improvements
   - Performance optimizations
   - Additional validation

---

## 12. Additional Notes

- **Priority Ranking Logic**: Lower values = higher priority (0 = highest priority). When displaying media, always sort by `priority_ranking ASC` to show highest priority files first.
- **Default Priority**: New uploads default to `priority_ranking = 0` (highest priority). Users can update this later if needed.
- **S3 Paths**: Follow the exact path format specified. This ensures consistency and makes it easier to locate files in S3.
- **Multiple Files**: The system supports multiple files per sponsor and per event-sponsor combination. Use priority ranking to control which file is displayed first.
- **Backward Compatibility**: Ensure existing code continues to work. The `priority_ranking` field has a default value, so existing records will have `priority_ranking = 0`.

---

## 13. References

- **PRD**: `documentation/event_sponsors/PRD.md` (v2.1)
- **Database Schema**: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- **Related Files**: Review existing `EventMedia` implementation to understand current patterns

---

**End of Implementation Prompt**

