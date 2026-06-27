# Event Sponsors Image Upload Feature - Product Requirements Document (PRD)

## Document Information
- **Version**: 2.1
- **Date**: 2025-01-17
- **Status**: Implementation Ready
- **Project Phase**: Mid-Development (Infrastructure Complete)
- **Changelog v2.1**: Added support for multiple media files per sponsor and per event-sponsor combination with priority ranking system
- **Related Documents**:
  - Existing PRD: `documentation/event_sponsors/PRD.md` (v1.0)
  - UI Style Guide: `@ui_style_guide.mdc`
  - API Routes Rules: `nextjs_api_routes.mdc`
  - Swagger API Docs: `documentation/Swagger_API_Docs/api-docs.json`
  - Database Schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the requirements for implementing comprehensive image upload functionality for event sponsors, including:
- **Individual Sponsor Images**: Logo, hero, and banner images for sponsors (stored in `event_sponsors` table)
- **Multiple Sponsor Media Files**: Support for uploading multiple media files per sponsor using the existing `event_media` table (e.g., additional logos, promotional images, videos)
- **Event-Sponsor Custom Posters**: Custom images for each event-sponsor combination (stored in `event_sponsors_join` table)
- **Multiple Event-Sponsor Media Files**: Support for uploading multiple media files per event-sponsor combination using the `event_media` table (e.g., event-specific promotional materials)

**Priority Ranking System**: Each media file uploaded for sponsors or event-sponsor combinations includes a priority ranking field (`priority_ranking`) that determines which image is displayed when multiple files are available. Lower priority numbers indicate higher priority (e.g., 0 = highest priority).

The system supports multi-tenant domain-agnostic authentication using Clerk satellite domain features, following the same patterns established in the executive committee image upload implementation.

### 1.2 Scope
- ✅ Drag-and-drop image upload functionality (similar to executive committee page)
- ✅ Image upload for individual sponsors (logo, hero, banner)
- ✅ Custom poster upload for event-sponsor combinations
- ✅ Multiple media file support via `event_medias` table
- ✅ Dynamic S3 path creation in backend
- ✅ Frontend UI components for image management
- ✅ Integration with existing sponsor management pages

### 1.3 Out of Scope
- ❌ Infrastructure setup (database, authentication, API framework) - **Already exists**
- ❌ Basic development toolset configuration - **Already exists**
- ❌ Database schema design - **Already exists, only modifications needed**
- ❌ JSON schema definition - **Already exists in Swagger docs**
- ❌ Backend API framework setup - **Backend project exists at `E:\project_workspace\malayalees-us-site-boot`**

---

## 2. Current State Assessment

### 2.1 What's Already Implemented

#### ✅ Backend Infrastructure
- **Database Schema**: `event_sponsors` and `event_sponsors_join` tables exist
- **Event Media Table**: `event_media` table exists for storing multiple media files
- **Backend API**: REST endpoints available (backend project at `E:\project_workspace\malayalees-us-site-boot`)
- **API Documentation**: Swagger/OpenAPI schema available at `documentation/Swagger_API_Docs/api-docs.json`
- **Proxy Routes**: API proxy handlers exist for event-medias upload

#### ✅ Frontend Components
- **Admin Pages**:
  - `/admin/event-sponsors` - Main sponsors management page
  - `/admin/events/[id]/sponsors` - Event-specific sponsors page
- **ImageUpload Component**: `src/components/ui/ImageUpload.tsx` exists and supports sponsor entity type
- **Executive Committee Upload**: Complete implementation at `/admin/executive-committee` with drag-and-drop functionality

#### ✅ Reference Implementation
- **Executive Committee Image Upload**: Fully functional implementation with:
  - Drag-and-drop upload dialog (`ImageUploadDialog.tsx`)
  - Server actions for upload (`ApiServerActions.ts`)
  - Proxy handler for media upload (`/api/proxy/event-medias/upload.ts`)
  - Integration with `event_media` table

### 2.2 What's Missing or Needs Enhancement

#### ❌ Custom Poster Field in event_sponsors_join
- **Current**: `event_sponsors_join` table only has basic fields (id, tenant_id, event_id, sponsor_id, created_at)
- **Required**: Add `custom_poster_url` field to store event-specific sponsor poster images

#### ❌ Multiple Media Files Support
- **Current**: Only single image URLs stored in `event_sponsors` table (logo_url, hero_image_url, banner_image_url)
- **Required**: Utilize `event_media` table to support multiple media files per sponsor
- **Required**: Add filtering/querying capability for sponsor-related media files

#### ❌ Backend S3 Path Configuration
- **Current**: Backend may not have dynamic path creation for sponsor images
- **Required**: Implement dynamic S3 path generation:
  - Sponsor images: `dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}`
  - Event-sponsor join images: `dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}`

#### ❌ Frontend UI Components
- **Current**: Basic image upload exists, but not comprehensive drag-and-drop dialog
- **Required**: Implement drag-and-drop upload dialog similar to executive committee
- **Required**: Add support for event-sponsor custom posters
- **Required**: Add media gallery view for multiple sponsor media files

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: Individual Sponsor Image Upload
**Priority**: High

**Description**: Upload and manage images for individual sponsors (logo, hero, banner).

**Acceptance Criteria**:
- [ ] Upload logo image with drag-and-drop interface
- [ ] Upload hero image with drag-and-drop interface
- [ ] Upload banner image with drag-and-drop interface
- [ ] Replace existing images
- [ ] Display image preview after upload
- [ ] Images stored in S3 with dynamic path: `dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}`
- [ ] Image URLs automatically updated in `event_sponsors` table

**Image Types**:
- **Logo**: Square format, recommended 512x512px
- **Hero Image**: Landscape format, recommended 1920x1080px
- **Banner Image**: Wide format, recommended 1600x400px

**Technical Implementation**:
- Use existing `ImageUpload` component or create enhanced version
- API endpoint: `/api/proxy/event-medias/upload/sponsor?eventId={eventId}&entityId={sponsorId}&imageType={logo|hero|banner}`
- Backend updates `event_sponsors.logo_url`, `hero_image_url`, or `banner_image_url` after upload

#### FR-2: Event-Sponsor Custom Poster Upload
**Priority**: High

**Description**: Upload custom posters for each event-sponsor combination.

**Acceptance Criteria**:
- [ ] Upload custom poster for event-sponsor combination
- [ ] Each event-sponsor pair can have unique poster
- [ ] Drag-and-drop upload interface
- [ ] Display poster preview
- [ ] Replace existing poster
- [ ] Images stored in S3 with dynamic path: `dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}`
- [ ] Image URL stored in `event_sponsors_join.custom_poster_url` field

**Image Type**:
- **Custom Poster**: Landscape format, recommended 1920x1080px

**Technical Implementation**:
- New API endpoint: `/api/proxy/event-medias/upload/event-sponsor-poster?eventId={eventId}&sponsorId={sponsorId}`
- Backend creates `EventMedia` record and updates `event_sponsors_join.custom_poster_url`
- Accessible from event-specific sponsors page: `/admin/events/[id]/sponsors`

#### FR-3: Multiple Media Files Support for Sponsors
**Priority**: Medium

**Description**: Support uploading multiple media files per sponsor using `event_media` table. Each sponsor can have multiple media files (images, videos) stored in the `event_media` table with a `sponsor_id` reference.

**Acceptance Criteria**:
- [ ] Upload multiple images/videos per sponsor
- [ ] Store media files in `event_media` table with `sponsor_id` reference
- [ ] Each media file includes a `priority_ranking` field (INT4, default 0) to determine display order
- [ ] Display media gallery for each sponsor sorted by priority ranking
- [ ] Delete individual media files
- [ ] Filter media by sponsor
- [ ] Update priority ranking for media files to control display order
- [ ] Support both images and videos
- [ ] Media files stored in S3 with appropriate paths
- [ ] When displaying sponsor media, use the file with the lowest priority_ranking value (0 = highest priority)

**Technical Implementation**:
- Use existing `event_media` table with `sponsor_id` foreign key reference
- Add `priority_ranking INT4 NOT NULL DEFAULT 0` field to `event_media` table for sponsor media
- Use `event_media_type` = 'SPONSOR_MEDIA' to identify sponsor-specific media
- API endpoint: `/api/proxy/event-medias/upload/sponsor-media?sponsorId={sponsorId}`
- Backend creates `EventMedia` record linked to sponsor with priority_ranking
- Query sponsor media sorted by `priority_ranking ASC` to get display order

#### FR-3.1: Multiple Media Files Support for Event-Sponsor Combinations
**Priority**: Medium

**Description**: Support uploading multiple media files per event-sponsor combination using `event_media` table. Each event-sponsor join record can have multiple media files (e.g., event-specific promotional posters, banners).

**Acceptance Criteria**:
- [ ] Upload multiple images/videos per event-sponsor combination
- [ ] Store media files in `event_media` table with `event_sponsors_join_id` reference
- [ ] Each media file includes a `priority_ranking` field (INT4, default 0) to determine display order
- [ ] Display media gallery for each event-sponsor combination sorted by priority ranking
- [ ] Delete individual media files
- [ ] Filter media by event-sponsor combination
- [ ] Update priority ranking for media files to control display order
- [ ] Support both images and videos
- [ ] Media files stored in S3 with appropriate paths
- [ ] When displaying event-sponsor media, use the file with the lowest priority_ranking value (0 = highest priority)

**Technical Implementation**:
- Use existing `event_media` table with `event_sponsors_join_id` foreign key reference
- Use `priority_ranking INT4 NOT NULL DEFAULT 0` field in `event_media` table for event-sponsor media
- Use `event_media_type` = 'EVENT_SPONSOR_POSTER' or 'EVENT_SPONSOR_MEDIA' to identify event-sponsor-specific media
- API endpoint: `/api/proxy/event-medias/upload/event-sponsor-media?eventId={eventId}&sponsorId={sponsorId}`
- Backend creates `EventMedia` record linked to event_sponsors_join with priority_ranking
- Query event-sponsor media sorted by `priority_ranking ASC` to get display order

#### FR-4: Drag-and-Drop Upload Interface
**Priority**: High

**Description**: Implement drag-and-drop upload interface similar to executive committee page.

**Acceptance Criteria**:
- [ ] Drag-and-drop file upload area
- [ ] File preview before upload
- [ ] Upload progress indicator
- [ ] Error handling and validation
- [ ] Success/error notifications
- [ ] Support for multiple file types (images: jpg, png, gif, webp; videos: mp4, webm)

**Technical Implementation**:
- Create `SponsorImageUploadDialog.tsx` component (similar to `ImageUploadDialog.tsx`)
- Reuse existing drag-and-drop patterns from executive committee
- Integrate with existing `ImageUpload` component where applicable

### 3.2 Non-Functional Requirements

#### NFR-1: Dynamic S3 Path Creation
**Priority**: High

**Description**: Backend must dynamically create S3 paths based on tenant, sponsor, and event IDs.

**Acceptance Criteria**:
- [ ] Sponsor images: `dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{sanitized_filename}`
- [ ] Event-sponsor join images: `dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{sanitized_filename}`
- [ ] Filenames sanitized (remove special characters, ensure uniqueness)
- [ ] Paths parameterized in backend configuration
- [ ] Tenant ID extracted from request or context

**Example Paths**:
```
Sponsor Image:
https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/media/tenantId/tenant_demo_001/sponsor/sponsor_id/2/arun_sadasivan_1756304627263_a4cb7a4b.jpeg

Event-Sponsor Join Image:
https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/events/tenantId/tenant_demo_001/event-id/1/sponsor/sponsor_id/2/birthday_party_1750026379828_bacbecdc.jfif
```

#### NFR-2: Authentication & Authorization
**Priority**: High

**Description**: All operations require Clerk authentication with multi-tenant support.

**Acceptance Criteria**:
- [ ] Admin pages protected by Clerk middleware
- [ ] Only authenticated users can upload images
- [ ] Multi-domain support via Clerk satellite domain features
- [ ] Tenant isolation enforced

#### NFR-3: UI/UX Consistency
**Priority**: High

**Description**: Follow established UI style guide and patterns.

**Acceptance Criteria**:
- [ ] Use sacred design system colors and typography
- [ ] Match executive committee upload dialog styling
- [ ] Consistent form layouts and spacing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states and error handling
- [ ] Toast notifications for success/error messages

---

## 4. Database Schema Changes

### 4.1 event_sponsors_join Table Modifications

**Add Custom Poster Field**:

```sql
-- Add custom_poster_url field to event_sponsors_join table
ALTER TABLE public.event_sponsors_join
ADD COLUMN custom_poster_url varchar(1024) NULL;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_event_sponsors_join_custom_poster
ON public.event_sponsors_join(custom_poster_url)
WHERE custom_poster_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.event_sponsors_join.custom_poster_url IS
'Custom poster image URL for this specific event-sponsor combination. Stored in S3 with path: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}';

-- Add URL format constraint
ALTER TABLE public.event_sponsors_join
ADD CONSTRAINT check_custom_poster_url_format
CHECK (custom_poster_url IS NULL OR custom_poster_url ~* '^https?://.*');
```

### 4.2 event_media Table Modifications

**Add Sponsor Reference** (if not exists):

```sql
-- Check if sponsor_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'sponsor_id'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN sponsor_id bigint NULL;

        -- Add foreign key constraint
        ALTER TABLE public.event_media
        ADD CONSTRAINT fk_event_media_sponsor_id
        FOREIGN KEY (sponsor_id)
        REFERENCES public.event_sponsors(id)
        ON DELETE CASCADE;

        -- Add index for efficient queries
        CREATE INDEX idx_event_media_sponsor_id
        ON public.event_media(sponsor_id)
        WHERE sponsor_id IS NOT NULL;

        -- Add comment
        COMMENT ON COLUMN public.event_media.sponsor_id IS
        'Reference to sponsor for sponsor-specific media files. When set, this media file belongs to a specific sponsor.';
    END IF;
END $$;

-- Add event_sponsors_join_id for custom posters (optional, for better organization)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'event_sponsors_join_id'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN event_sponsors_join_id bigint NULL;

        -- Add foreign key constraint
        ALTER TABLE public.event_media
        ADD CONSTRAINT fk_event_media_event_sponsors_join_id
        FOREIGN KEY (event_sponsors_join_id)
        REFERENCES public.event_sponsors_join(id)
        ON DELETE CASCADE;

        -- Add index
        CREATE INDEX idx_event_media_event_sponsors_join_id
        ON public.event_media(event_sponsors_join_id)
        WHERE event_sponsors_join_id IS NOT NULL;

        -- Add comment
        COMMENT ON COLUMN public.event_media.event_sponsors_join_id IS
        'Reference to event-sponsor join record for custom posters. When set, this media file is a custom poster for a specific event-sponsor combination.';
    END IF;
END $$;

-- Add priority_ranking field for sponsor and event-sponsor media files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'priority_ranking'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN priority_ranking INT4 NOT NULL DEFAULT 0;

        -- Add index for efficient sorting queries
        CREATE INDEX idx_event_media_priority_ranking
        ON public.event_media(priority_ranking)
        WHERE sponsor_id IS NOT NULL OR event_sponsors_join_id IS NOT NULL;

        -- Add composite indexes for efficient queries with priority sorting
        CREATE INDEX idx_event_media_sponsor_priority
        ON public.event_media(sponsor_id, priority_ranking)
        WHERE sponsor_id IS NOT NULL;

        CREATE INDEX idx_event_media_event_sponsor_join_priority
        ON public.event_media(event_sponsors_join_id, priority_ranking)
        WHERE event_sponsors_join_id IS NOT NULL;

        -- Add constraint to ensure non-negative priority
        ALTER TABLE public.event_media
        ADD CONSTRAINT check_priority_ranking_non_negative
        CHECK (priority_ranking >= 0);

        -- Add comment
        COMMENT ON COLUMN public.event_media.priority_ranking IS
        'Priority ranking for media files (sponsor or event-sponsor). Lower values indicate higher priority (0 = highest priority). Used to determine which image to display when multiple files are available.';
    END IF;
END $$;
```

### 4.3 Complete SQL Migration Script

**File**: `code_html_template/SQLS/migration_add_sponsor_image_upload.sql`

```sql
-- =============================================
-- Migration: Add Sponsor Image Upload Support
-- Date: 2025-01-17
-- Description: Adds custom poster support and sponsor media file references
-- =============================================

-- 1. Add custom_poster_url to event_sponsors_join
ALTER TABLE public.event_sponsors_join
ADD COLUMN IF NOT EXISTS custom_poster_url varchar(1024) NULL;

-- 2. Add URL format constraint
ALTER TABLE public.event_sponsors_join
DROP CONSTRAINT IF EXISTS check_custom_poster_url_format;

ALTER TABLE public.event_sponsors_join
ADD CONSTRAINT check_custom_poster_url_format
CHECK (custom_poster_url IS NULL OR custom_poster_url ~* '^https?://.*');

-- 3. Add index for custom_poster_url
CREATE INDEX IF NOT EXISTS idx_event_sponsors_join_custom_poster
ON public.event_sponsors_join(custom_poster_url)
WHERE custom_poster_url IS NOT NULL;

-- 4. Add sponsor_id to event_media (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'sponsor_id'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN sponsor_id bigint NULL;

        ALTER TABLE public.event_media
        ADD CONSTRAINT fk_event_media_sponsor_id
        FOREIGN KEY (sponsor_id)
        REFERENCES public.event_sponsors(id)
        ON DELETE CASCADE;

        CREATE INDEX idx_event_media_sponsor_id
        ON public.event_media(sponsor_id)
        WHERE sponsor_id IS NOT NULL;
    END IF;
END $$;

-- 5. Add event_sponsors_join_id to event_media (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'event_sponsors_join_id'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN event_sponsors_join_id bigint NULL;

        ALTER TABLE public.event_media
        ADD CONSTRAINT fk_event_media_event_sponsors_join_id
        FOREIGN KEY (event_sponsors_join_id)
        REFERENCES public.event_sponsors_join(id)
        ON DELETE CASCADE;

        CREATE INDEX idx_event_media_event_sponsors_join_id
        ON public.event_media(event_sponsors_join_id)
        WHERE event_sponsors_join_id IS NOT NULL;
    END IF;
END $$;

-- 6. Add priority_ranking field to event_media for sponsor and event-sponsor media (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'priority_ranking'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN priority_ranking INT4 NOT NULL DEFAULT 0;

        -- Add index for efficient sorting queries
        CREATE INDEX idx_event_media_priority_ranking
        ON public.event_media(priority_ranking)
        WHERE sponsor_id IS NOT NULL OR event_sponsors_join_id IS NOT NULL;

        -- Add composite indexes for efficient queries with priority sorting
        CREATE INDEX idx_event_media_sponsor_priority
        ON public.event_media(sponsor_id, priority_ranking)
        WHERE sponsor_id IS NOT NULL;

        CREATE INDEX idx_event_media_event_sponsor_join_priority
        ON public.event_media(event_sponsors_join_id, priority_ranking)
        WHERE event_sponsors_join_id IS NOT NULL;

        -- Add constraint to ensure non-negative priority
        ALTER TABLE public.event_media
        ADD CONSTRAINT check_priority_ranking_non_negative
        CHECK (priority_ranking >= 0);
    END IF;
END $$;

-- 7. Add comments for documentation
COMMENT ON COLUMN public.event_sponsors_join.custom_poster_url IS
'Custom poster image URL for this specific event-sponsor combination. Stored in S3 with path: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}';

COMMENT ON COLUMN public.event_media.sponsor_id IS
'Reference to sponsor for sponsor-specific media files. When set, this media file belongs to a specific sponsor.';

COMMENT ON COLUMN public.event_media.event_sponsors_join_id IS
'Reference to event-sponsor join record for custom posters. When set, this media file is a custom poster for a specific event-sponsor combination.';

COMMENT ON COLUMN public.event_media.priority_ranking IS
'Priority ranking for media files (sponsor or event-sponsor). Lower values indicate higher priority (0 = highest priority). Used to determine which image to display when multiple files are available.';

-- 7. Verify changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'event_sponsors_join'
AND column_name = 'custom_poster_url';

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'event_media'
AND column_name IN ('sponsor_id', 'event_sponsors_join_id');
```

### 4.4 Update Main Schema File

**File**: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

**Changes Required**:
1. Add `custom_poster_url` field to `event_sponsors_join` table definition (already exists)
2. Add `sponsor_id` field to `event_media` table definition (already exists)
3. Add `event_sponsors_join_id` field to `event_media` table definition (already exists)
4. Add `priority_ranking INT4 NOT NULL DEFAULT 0` field to `event_media` table definition for sponsor/event-sponsor media
5. Add foreign key constraints (already exist)
6. Add indexes for priority ranking queries
7. Add comments for priority_ranking field

**Location**: Update the table definitions around lines 3240 and 1292 respectively. Add priority_ranking field to event_media table definition.

---

## 5. Backend Implementation Requirements

### 5.1 Backend Project Location
- **Path**: `E:\project_workspace\malayalees-us-site-boot`
- **Framework**: Spring Boot
- **Database**: PostgreSQL

### 5.2 Required Backend Changes

#### 5.2.1 S3 Path Configuration

**File**: `src/main/java/com/nextjstemplate/config/S3Config.java` (or similar)

**Requirements**:
- Implement dynamic path generation for sponsor images
- Implement dynamic path generation for event-sponsor join images
- Support parameterized path templates

**Path Templates**:

```java
// Sponsor image path template
String sponsorImagePath = "dev/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}";

// Event-sponsor join image path template
String eventSponsorJoinImagePath = "dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}";
```

**Implementation Example**:

```java
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

private String sanitizeFilename(String filename) {
    // Remove special characters, keep alphanumeric, dots, hyphens, underscores
    return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
}

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

#### 5.2.2 Event Media Service Updates

**File**: `src/main/java/com/nextjstemplate/service/EventMediaService.java` (or similar)

**New Methods Required**:

```java
/**
 * Upload sponsor image (logo, hero, or banner)
 * Updates the corresponding field in event_sponsors table
 */
public EventMediaDTO uploadSponsorImage(
    Long sponsorId,
    Long eventId,  // Can be 0 for main sponsors page
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
    EventSponsorsDTO sponsor = eventSponsorsRepository.findById(sponsorId).orElseThrow();
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
    }
    eventSponsorsRepository.save(sponsor);

    return savedMedia;
}

/**
 * Upload custom poster for event-sponsor combination
 * Updates event_sponsors_join.custom_poster_url field
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
        .orElseThrow(() -> new RuntimeException("Event-sponsor association not found"));

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
 */
public EventMediaDTO uploadSponsorMedia(
    Long sponsorId,
    MultipartFile file,
    String title,
    String description,
    String tenantId
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
    mediaDTO.setPriorityRanking(0); // Default to highest priority, can be updated later

    return eventMediaRepository.save(mediaDTO);
}
```

#### 5.2.3 REST Controller Updates

**File**: `src/main/java/com/nextjstemplate/web/rest/EventMediaResource.java` (or similar)

**New Endpoints Required**:

```java
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
    @RequestParam(required = false, defaultValue = "true") Boolean isPublic
) {
    EventMediaDTO media = eventMediaService.uploadSponsorMedia(
        sponsorId,
        file,
        title,
        description,
        tenantId
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
```

#### 5.2.4 Entity/DTO Updates

**File**: `src/main/java/com/nextjstemplate/service/dto/EventSponsorsJoinDTO.java`

**Add Field**:

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

**File**: `src/main/java/com/nextjstemplate/domain/EventSponsorsJoin.java`

**Add Field**:

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

**File**: `src/main/java/com/nextjstemplate/service/dto/EventMediaDTO.java`

**Add Fields** (if not exists):

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

**File**: `src/main/java/com/nextjstemplate/domain/EventMedia.java`

**Add Fields** (if not exists):

```java
/**
 * Reference to sponsor for sponsor-specific media files
 */
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "sponsor_id")
private EventSponsors sponsor;

@Column(name = "sponsor_id", insertable = false, updatable = false)
private Long sponsorId;

/**
 * Reference to event-sponsor join record for custom posters
 */
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "event_sponsors_join_id")
private EventSponsorsJoin eventSponsorsJoin;

@Column(name = "event_sponsors_join_id", insertable = false, updatable = false)
private Long eventSponsorsJoinId;

/**
 * Priority ranking for media files (sponsor or event-sponsor).
 * Lower values indicate higher priority (0 = highest priority).
 */
@Column(name = "priority_ranking", nullable = false)
private Integer priorityRanking = 0;

// Getters and setters
public EventSponsors getSponsor() {
    return sponsor;
}

public void setSponsor(EventSponsors sponsor) {
    this.sponsor = sponsor;
}

public Long getSponsorId() {
    return sponsorId;
}

public void setSponsorId(Long sponsorId) {
    this.sponsorId = sponsorId;
}

public EventSponsorsJoin getEventSponsorsJoin() {
    return eventSponsorsJoin;
}

public void setEventSponsorsJoin(EventSponsorsJoin eventSponsorsJoin) {
    this.eventSponsorsJoin = eventSponsorsJoin;
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

#### 5.2.5 Repository Updates

**File**: `src/main/java/com/nextjstemplate/repository/EventMediaRepository.java`

**Add Methods**:

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
 * Find custom poster for event-sponsor combination, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.eventSponsorsJoinId = :eventSponsorsJoinId AND e.eventMediaType = 'EVENT_SPONSOR_POSTER' ORDER BY e.priorityRanking ASC")
Optional<EventMedia> findCustomPosterByEventSponsorsJoinId(@Param("eventSponsorsJoinId") Long eventSponsorsJoinId);

/**
 * Find all media files for an event-sponsor combination, sorted by priority ranking (ascending)
 */
@Query("SELECT e FROM EventMedia e WHERE e.eventSponsorsJoinId = :eventSponsorsJoinId ORDER BY e.priorityRanking ASC")
List<EventMedia> findByEventSponsorsJoinId(@Param("eventSponsorsJoinId") Long eventSponsorsJoinId);
```

---

## 6. Frontend Implementation Requirements

### 6.1 Frontend Project Location
- **Path**: Current project (`E:\project_workspace\mosc-temp`)
- **Framework**: Next.js 15+
- **UI Library**: React + Tailwind CSS

### 6.2 Required Frontend Changes

#### 6.2.1 New Components

**File**: `src/components/sponsors/SponsorImageUploadDialog.tsx`

**Description**: Drag-and-drop upload dialog for sponsor images (similar to executive committee).

**Features**:
- Drag-and-drop file upload
- File preview
- Upload progress
- Error handling
- Success/error notifications

**Props**:
```typescript
interface SponsorImageUploadDialogProps {
  sponsor: EventSponsorsDTO;
  imageType: 'logo' | 'hero' | 'banner';
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
  eventId?: number; // Optional, for event-specific context
}
```

**File**: `src/components/sponsors/EventSponsorPosterUploadDialog.tsx`

**Description**: Drag-and-drop upload dialog for event-sponsor custom posters.

**Props**:
```typescript
interface EventSponsorPosterUploadDialogProps {
  eventId: number;
  sponsorId: number;
  currentPosterUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
}
```

**File**: `src/components/sponsors/SponsorMediaGallery.tsx`

**Description**: Gallery component to display multiple media files for a sponsor.

**Props**:
```typescript
interface SponsorMediaGalleryProps {
  sponsorId: number;
  onMediaSelect?: (media: EventMediaDTO) => void;
  onMediaDelete?: (mediaId: number) => void;
}
```

#### 6.2.2 API Server Actions

**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`

**Add Functions**:

```typescript
/**
 * Upload custom poster for event-sponsor combination
 */
export async function uploadEventSponsorPosterServer(
  eventId: number,
  sponsorId: number,
  file: File,
  title?: string,
  description?: string
): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.append('eventId', String(eventId));
  params.append('sponsorId', String(sponsorId));
  params.append('tenantId', getTenantId());
  params.append('isPublic', 'true');
  if (title) params.append('title', title);
  if (description) params.append('description', description);

  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-medias/upload/event-sponsor-poster?${params.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload poster: ${errorText}`);
  }

  const media = await response.json();
  return media.fileUrl || null;
}

/**
 * Upload multiple media files for a sponsor
 */
export async function uploadSponsorMediaServer(
  sponsorId: number,
  file: File,
  title?: string,
  description?: string
): Promise<EventMediaDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.append('sponsorId', String(sponsorId));
  params.append('tenantId', getTenantId());
  params.append('isPublic', 'true');
  if (title) params.append('title', title);
  if (description) params.append('description', description);

  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-medias/upload/sponsor-media?${params.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload media: ${errorText}`);
  }

  return await response.json();
}

/**
 * Get all media files for a sponsor
 */
export async function fetchSponsorMediaServer(sponsorId: number): Promise<EventMediaDTO[]> {
  const baseUrl = getAppUrl();
  const tenantId = getTenantId();
  const url = `${baseUrl}/api/proxy/event-medias/sponsor/${sponsorId}?tenantId=${tenantId}`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sponsor media: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}
```

#### 6.2.3 Proxy Handlers

**File**: `src/pages/api/proxy/event-medias/upload/event-sponsor-poster.ts`

**Create New File**:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
};

async function fetchWithJwtRetry(apiUrl: string, options: any = {}) {
  let token = await getCachedApiJwt();
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    token = await generateApiJwt();
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { eventId, sponsorId, title, description, tenantId, isPublic } = req.query;

    if (!eventId || !sponsorId || !tenantId) {
      return res.status(400).json({
        error: 'Missing required parameters: eventId, sponsorId, tenantId'
      });
    }

    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/event-sponsor-poster?${new URLSearchParams({
      eventId: String(eventId),
      sponsorId: String(sponsorId),
      tenantId: String(tenantId),
      isPublic: String(isPublic || 'true'),
      ...(title && { title: String(title) }),
      ...(description && { description: String(description) }),
    }).toString()}`;

    // Forward the multipart form data
    const fetch = (await import('node-fetch')).default;
    const token = await getCachedApiJwt() || await generateApiJwt();

    const response = await fetchWithJwtRetry(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: req, // Stream the request body
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
```

**File**: `src/pages/api/proxy/event-medias/upload/sponsor-media.ts`

**Create Similar File** for sponsor media uploads.

**File**: `src/pages/api/proxy/event-medias/sponsor/[...slug].ts`

**Create File** for fetching sponsor media:

```typescript
import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/event-medias/sponsor',
  allowedMethods: ['GET'],
});
```

#### 6.2.4 Page Updates

**File**: `src/app/admin/event-sponsors/page.tsx`

**Updates Required**:
- Replace URL input fields with `ImageUpload` components or `SponsorImageUploadDialog`
- Add upload buttons for logo, hero, and banner images
- Add media gallery section for multiple media files

**File**: `src/app/admin/events/[id]/sponsors/page.tsx`

**Updates Required**:
- Add custom poster upload button for each event-sponsor combination
- Display custom poster if available
- Add upload dialog integration

#### 6.2.5 DTO Type Updates

**File**: `src/types/index.ts`

**Update Types**:

```typescript
export interface EventSponsorsJoinDTO {
  id?: number;
  tenantId?: string;
  eventId: number;
  sponsorId: number;
  customPosterUrl?: string; // NEW FIELD
  createdAt: string;
  event?: EventDetailsDTO;
  sponsor?: EventSponsorsDTO;
}

export interface EventMediaDTO {
  // ... existing fields ...
  sponsorId?: number; // NEW FIELD
  eventSponsorsJoinId?: number; // NEW FIELD
  // ... rest of fields ...
}
```

---

## 7. Implementation Steps

### Phase 1: Database Schema Updates
1. ✅ Run SQL migration script to add `custom_poster_url` to `event_sponsors_join`
2. ✅ Run SQL migration script to add `sponsor_id` and `event_sponsors_join_id` to `event_media`
3. ✅ Update main schema file with new fields
4. ✅ Verify database changes

### Phase 2: Backend Implementation
1. ✅ Update S3 configuration for dynamic path generation
2. ✅ Add new service methods for sponsor image uploads
3. ✅ Add new REST endpoints for event-sponsor poster uploads
4. ✅ Update entity classes and DTOs
5. ✅ Update repository interfaces
6. ✅ Test backend endpoints

### Phase 3: Frontend Implementation
1. ✅ Create proxy handlers for new endpoints
2. ✅ Create API server actions
3. ✅ Create upload dialog components
4. ✅ Update sponsor management pages
5. ✅ Update event-specific sponsors page
6. ✅ Test frontend integration

### Phase 4: Testing & Validation
1. ✅ Test individual sponsor image uploads
2. ✅ Test event-sponsor custom poster uploads
3. ✅ Test multiple media file uploads
4. ✅ Verify S3 path generation
5. ✅ Test drag-and-drop functionality
6. ✅ Test error handling
7. ✅ Verify tenant isolation

---

## 8. Testing Requirements

### 8.1 Functional Testing

**Test Cases**:
1. **Individual Sponsor Image Upload**:
   - Upload logo image
   - Upload hero image
   - Upload banner image
   - Replace existing images
   - Verify S3 path generation
   - Verify database updates

2. **Event-Sponsor Custom Poster Upload**:
   - Upload custom poster for event-sponsor combination
   - Verify unique poster per event-sponsor pair
   - Verify S3 path generation
   - Verify database updates

3. **Multiple Media Files**:
   - Upload multiple images for a sponsor
   - Upload videos for a sponsor
   - View media gallery
   - Delete individual media files

4. **Drag-and-Drop Interface**:
   - Drag file to upload area
   - Drop file to upload
   - File preview before upload
   - Upload progress indicator
   - Error handling

### 8.2 Non-Functional Testing

**Performance**:
- Image upload < 5 seconds
- Page load time < 2 seconds
- S3 upload time acceptable

**Security**:
- Authentication required
- Tenant isolation enforced
- File type validation
- File size limits

**Usability**:
- Responsive design
- Clear error messages
- Intuitive UI

---

## 9. Success Criteria

### 9.1 Functional Success
- ✅ All image upload types work correctly
- ✅ S3 paths generated dynamically
- ✅ Database updates correct
- ✅ Drag-and-drop interface functional
- ✅ Multiple media files supported

### 9.2 Non-Functional Success
- ✅ UI matches style guide
- ✅ Performance acceptable
- ✅ Security enforced
- ✅ Error handling robust

---

## 10. References

### 10.1 Related Documentation
- **Executive Committee Upload**: `documentation/EXECUTIVE_COMMITTEE_UPLOAD_FEATURE_SUMMARY.md`
- **UI Style Guide**: `@ui_style_guide.mdc`
- **API Routes Rules**: `nextjs_api_routes.mdc`
- **Swagger API Docs**: `documentation/Swagger_API_Docs/api-docs.json`
- **Database Schema**: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

### 10.2 Related Files
- **Executive Committee Upload Dialog**: `src/app/admin/executive-committee/ImageUploadDialog.tsx`
- **ImageUpload Component**: `src/components/ui/ImageUpload.tsx`
- **Sponsor Management Pages**:
  - `src/app/admin/event-sponsors/page.tsx`
  - `src/app/admin/events/[id]/sponsors/page.tsx`

---

## Document Approval

**Prepared By**: AI Assistant
**Date**: 2025-01-17
**Status**: Ready for Implementation
**Next Steps**:
1. Review with team
2. Apply database schema changes
3. Implement backend changes
4. Implement frontend changes
5. Test and validate

---

**End of Document**
