# Global Performers & Directors Media Upload Implementation Plan

## Overview
This document outlines all changes required to add media upload functionality (profile images, posters, hero images, etc.) for Global Performers and Global Directors, similar to the existing Global Sponsors implementation.

**Reference Implementation**: `http://localhost:3000/admin/event-sponsors/1`

---

## 1. Database Schema Changes

### 1.1 Add Columns to `event_media` Table

**File**: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql` (or migration script)

```sql
-- Add performer_id column to event_media table
ALTER TABLE public.event_media
ADD COLUMN performer_id bigint NULL;

-- Add director_id column to event_media table
ALTER TABLE public.event_media
ADD COLUMN director_id bigint NULL;

-- Add indexes for better query performance
CREATE INDEX idx_event_media_performer_id ON public.event_media(performer_id);
CREATE INDEX idx_event_media_director_id ON public.event_media(director_id);

-- Optional: Add foreign key constraints (if desired)
-- ALTER TABLE public.event_media
-- ADD CONSTRAINT fk_event_media_performer
-- FOREIGN KEY (performer_id) REFERENCES public.event_featured_performers(id) ON DELETE SET NULL;

-- ALTER TABLE public.event_media
-- ADD CONSTRAINT fk_event_media_director
-- FOREIGN KEY (director_id) REFERENCES public.event_program_directors(id) ON DELETE SET NULL;
```

---

## 2. Backend Changes

### 2.1 Update EventMedia Entity

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\domain\EventMedia.java`

**Add these fields after `sponsorId` field (around line 132-135):**

```java
@Column(name = "performer_id")
private Long performerId;

@Column(name = "director_id")
private Long directorId;
```

**Add getters and setters:**

```java
public Long getPerformerId() {
    return performerId;
}

public EventMedia performerId(Long performerId) {
    this.setPerformerId(performerId);
    return this;
}

public void setPerformerId(Long performerId) {
    this.performerId = performerId;
}

public Long getDirectorId() {
    return directorId;
}

public EventMedia directorId(Long directorId) {
    this.setDirectorId(directorId);
    return this;
}

public void setDirectorId(Long directorId) {
    this.directorId = directorId;
}
```

**Update `toString()` method** to include new fields.

---

### 2.2 Update EventMediaDTO

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\service\dto\EventMediaDTO.java`

**Add fields after `sponsorId` (around line 92-94):**

```java
private Long performerId;

private Long directorId;
```

**Add getters and setters:**

```java
public Long getPerformerId() {
    return performerId;
}

public void setPerformerId(Long performerId) {
    this.performerId = performerId;
}

public Long getDirectorId() {
    return directorId;
}

public void setDirectorId(Long directorId) {
    this.directorId = directorId;
}
```

**Update `toString()` method** to include new fields.

---

### 2.3 Update EventMediaCriteria

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\service\criteria\EventMediaCriteria.java`

**Add fields after `sponsorId` (around line 82-86):**

```java
private LongFilter performerId;

private LongFilter directorId;
```

**Add to copy constructor:**

```java
this.performerId = other.performerId == null ? null : other.performerId.copy();
this.directorId = other.directorId == null ? null : other.directorId.copy();
```

**Add getters, setters, and helper methods:**

```java
public LongFilter getPerformerId() {
    return performerId;
}

public LongFilter performerId() {
    if (performerId == null) {
        performerId = new LongFilter();
    }
    return performerId;
}

public void setPerformerId(LongFilter performerId) {
    this.performerId = performerId;
}

public LongFilter getDirectorId() {
    return directorId;
}

public LongFilter directorId() {
    if (directorId == null) {
        directorId = new LongFilter();
    }
    return directorId;
}

public void setDirectorId(LongFilter directorId) {
    this.directorId = directorId;
}
```

**Update `equals()`, `hashCode()`, and `toString()` methods** to include new fields.

---

### 2.4 Update EventMediaQueryService

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\service\EventMediaQueryService.java`

**Add to `createSpecification()` method** (after `priorityRanking` handling, around line 252-254):

```java
if (criteria.getPerformerId() != null) {
    specification = specification.and(buildSpecification(criteria.getPerformerId(), EventMedia_.performerId));
}
if (criteria.getDirectorId() != null) {
    specification = specification.and(buildSpecification(criteria.getDirectorId(), EventMedia_.directorId));
}
```

---

### 2.5 Update EventMediaRepository

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\repository\EventMediaRepository.java`

**Add count methods** (similar to sponsor count method):

```java
@Query("SELECT COUNT(e) FROM EventMedia e WHERE e.performerId = :performerId AND e.eventMediaType = :eventMediaType")
long countByPerformerIdAndEventMediaType(@Param("performerId") Long performerId, @Param("eventMediaType") String eventMediaType);

@Query("SELECT COUNT(e) FROM EventMedia e WHERE e.directorId = :directorId AND e.eventMediaType = :eventMediaType")
long countByDirectorIdAndEventMediaType(@Param("directorId") Long directorId, @Param("eventMediaType") String eventMediaType);
```

---

### 2.6 Update EventMediaServiceImpl

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\service\impl\EventMediaServiceImpl.java`

**In `uploadFile()` method**, add handling for PERFORMER and DIRECTOR entity types (similar to SPONSOR handling):

**For Performers** (add after SPONSOR handling):

```java
// Handle PERFORMER entity type
if ("PERFORMER".equals(entityType) && performerId != null) {
    EventFeaturedPerformers performer = eventFeaturedPerformersRepository
        .findById(performerId)
        .orElseThrow(() -> new BadRequestAlertException("Performer not found", "EventFeaturedPerformers", "idnotfound"));

    // Determine image type based on flags
    String imageType = null;
    String eventMediaType = null;

    if (isPerformerPortrait != null && isPerformerPortrait) {
        imageType = "portrait";
        eventMediaType = "PERFORMER_PORTRAIT";
    } else if (isPerformerPerformance != null && isPerformerPerformance) {
        imageType = "performance";
        eventMediaType = "PERFORMER_PERFORMANCE";
    } else if (isPerformerHero != null && isPerformerHero) {
        imageType = "hero";
        eventMediaType = "PERFORMER_HERO";
    } else if (isPerformerPoster != null && isPerformerPoster) {
        imageType = "poster";
        eventMediaType = "PERFORMER_POSTER";
    }

    if (imageType != null && eventMediaType != null) {
        // Check if this is the first image of this type
        long existingCount = eventMediaRepository.countByPerformerIdAndEventMediaType(performerId, eventMediaType);

        // Only update the primary URL in performer table if it's the first image
        if (existingCount == 0) {
            switch (imageType) {
                case "portrait":
                    performer.setPortraitImageUrl(fileUrl);
                    break;
                case "performance":
                    performer.setPerformanceImageUrl(fileUrl);
                    break;
                // Note: Performers table doesn't have hero/poster URL fields yet
                // You may need to add these fields to EventFeaturedPerformers entity
            }
            eventFeaturedPerformersRepository.save(performer);
        }

        // Set eventMediaType for the EventMedia record
        eventMedia.setEventMediaType(eventMediaType);
        eventMedia.setPerformerId(performerId);

        // Set eventId to null if not provided (for global performers)
        if (eventId == null || eventId == 0) {
            eventMedia.setEventId(null);
        }
    }
}
```

**For Directors** (add after PERFORMER handling):

```java
// Handle DIRECTOR entity type
if ("DIRECTOR".equals(entityType) && directorId != null) {
    EventProgramDirectors director = eventProgramDirectorsRepository
        .findById(directorId)
        .orElseThrow(() -> new BadRequestAlertException("Director not found", "EventProgramDirectors", "idnotfound"));

    // Determine image type based on flags
    String imageType = null;
    String eventMediaType = null;

    if (isDirectorPhoto != null && isDirectorPhoto) {
        imageType = "photo";
        eventMediaType = "DIRECTOR_PHOTO";
    } else if (isDirectorHero != null && isDirectorHero) {
        imageType = "hero";
        eventMediaType = "DIRECTOR_HERO";
    } else if (isDirectorPoster != null && isDirectorPoster) {
        imageType = "poster";
        eventMediaType = "DIRECTOR_POSTER";
    }

    if (imageType != null && eventMediaType != null) {
        // Check if this is the first image of this type
        long existingCount = eventMediaRepository.countByDirectorIdAndEventMediaType(directorId, eventMediaType);

        // Only update the primary URL in director table if it's the first image
        if (existingCount == 0 && "photo".equals(imageType)) {
            director.setPhotoUrl(fileUrl);
            eventProgramDirectorsRepository.save(director);
        }

        // Set eventMediaType for the EventMedia record
        eventMedia.setEventMediaType(eventMediaType);
        eventMedia.setDirectorId(directorId);

        // Set eventId to null if not provided (for global directors)
        if (eventId == null || eventId == 0) {
            eventMedia.setEventId(null);
        }
    }
}
```

**Update S3 path generation** to handle performer and director paths:

```java
// In uploadFile method, update path generation logic
if ("PERFORMER".equals(entityType) && (eventId == null || eventId == 0)) {
    // Use performer-specific path
    s3Path = s3Service.generatePerformerImagePath(tenantId, performerId, fileName);
} else if ("DIRECTOR".equals(entityType) && (eventId == null || eventId == 0)) {
    // Use director-specific path
    s3Path = s3Service.generateDirectorImagePath(tenantId, directorId, fileName);
}
```

**Note**: You'll need to add these methods to `S3ServiceImpl`:
- `generatePerformerImagePath(String tenantId, Long performerId, String fileName)`
- `generateDirectorImagePath(String tenantId, Long directorId, String fileName)`

---

### 2.7 Update EventMediaResource (REST Controller)

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\web\rest\EventMediaResource.java`

**In `uploadFile()` method**, add request parameters for performer and director:

```java
@RequestParam(value = "performerId", required = false) Long performerId,
@RequestParam(value = "directorId", required = false) Long directorId,
@RequestParam(value = "isPerformerPortrait", required = false) Boolean isPerformerPortrait,
@RequestParam(value = "isPerformerPerformance", required = false) Boolean isPerformerPerformance,
@RequestParam(value = "isPerformerHero", required = false) Boolean isPerformerHero,
@RequestParam(value = "isPerformerPoster", required = false) Boolean isPerformerPoster,
@RequestParam(value = "isDirectorPhoto", required = false) Boolean isDirectorPhoto,
@RequestParam(value = "isDirectorHero", required = false) Boolean isDirectorHero,
@RequestParam(value = "isDirectorPoster", required = false) Boolean isDirectorPoster,
```

**Pass these to the service method.**

---

### 2.8 Add Repository Dependencies

**File**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\service\impl\EventMediaServiceImpl.java`

**Add repository injections:**

```java
private final EventFeaturedPerformersRepository eventFeaturedPerformersRepository;
private final EventProgramDirectorsRepository eventProgramDirectorsRepository;

// In constructor:
public EventMediaServiceImpl(
    // ... existing parameters ...
    EventFeaturedPerformersRepository eventFeaturedPerformersRepository,
    EventProgramDirectorsRepository eventProgramDirectorsRepository
) {
    // ... existing assignments ...
    this.eventFeaturedPerformersRepository = eventFeaturedPerformersRepository;
    this.eventProgramDirectorsRepository = eventProgramDirectorsRepository;
}
```

---

## 3. Frontend Changes

### 3.1 Update TypeScript Types

**File**: `src/types/index.ts`

**Update `EventMediaDTO` interface:**

```typescript
export interface EventMediaDTO {
  // ... existing fields ...
  sponsorId?: number;
  performerId?: number;  // ADD THIS
  directorId?: number;  // ADD THIS
  eventSponsorsJoinId?: number;
  priorityRanking?: number;
}
```

---

### 3.2 Create Performer Detail Page

**File**: `src/app/admin/event-featured-performers/[id]/page.tsx`

**Create similar to**: `src/app/admin/event-sponsors/[id]/page.tsx`

```typescript
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchPerformerServer, fetchPerformerMediaServer } from '../ApiServerActions';
import PerformerEditClient from './PerformerEditClient';

interface PerformerEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function PerformerEditPage({ params, searchParams }: PerformerEditPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const sp = await searchParams;

  const performerId = parseInt(id, 10);
  if (isNaN(performerId)) {
    notFound();
  }

  // Fetch performer data
  let performer;
  try {
    performer = await fetchPerformerServer(performerId);
  } catch (error) {
    console.error('Failed to fetch performer:', error);
    notFound();
  }

  // Fetch media files
  const mediaList = await fetchPerformerMediaServer(performerId).catch(() => []);

  // Pagination parameters
  const page = Math.max(0, parseInt(sp.page || '0', 10));
  const pageSize = parseInt(sp.pageSize || '10', 10);

  // Calculate pagination
  const totalCount = mediaList.length;
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMedia = mediaList.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <PerformerEditClient
      performer={performer}
      initialMediaList={paginatedMedia}
      totalMediaCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      totalPages={totalPages}
    />
  );
}
```

---

### 3.3 Create Performer Edit Client Component

**File**: `src/app/admin/event-featured-performers/[id]/PerformerEditClient.tsx`

**Create similar to**: `src/app/admin/event-sponsors/[id]/SponsorEditClient.tsx`

**Key differences:**
- Use `PerformerImageUploadArea` instead of `SponsorImageUploadArea`
- Image types: `'portrait' | 'performance' | 'hero' | 'poster'`
- Use `uploadPerformerImageServer` instead of `uploadSponsorImageServer`
- Use `fetchPerformerMediaServer` instead of `fetchSponsorMediaServer`

---

### 3.4 Create Director Detail Page

**File**: `src/app/admin/event-program-directors/[id]/page.tsx`

**Create similar to**: `src/app/admin/event-sponsors/[id]/page.tsx`

---

### 3.5 Create Director Edit Client Component

**File**: `src/app/admin/event-program-directors/[id]/DirectorEditClient.tsx`

**Create similar to**: `src/app/admin/event-sponsors/[id]/SponsorEditClient.tsx`

**Key differences:**
- Use `DirectorImageUploadArea` instead of `SponsorImageUploadArea`
- Image types: `'photo' | 'hero' | 'poster'`
- Use `uploadDirectorImageServer` instead of `uploadSponsorImageServer`
- Use `fetchDirectorMediaServer` instead of `fetchSponsorMediaServer`

---

### 3.6 Create Performer Image Upload Components

**Files**:
- `src/components/performers/PerformerImageUploadArea.tsx` (similar to `SponsorImageUploadArea.tsx`)
- `src/components/performers/PerformerImageUploadDialog.tsx` (if needed, similar to `SponsorImageUploadDialog.tsx`)

---

### 3.7 Create Director Image Upload Components

**Files**:
- `src/components/directors/DirectorImageUploadArea.tsx` (similar to `SponsorImageUploadArea.tsx`)
- `src/components/directors/DirectorImageUploadDialog.tsx` (if needed)

---

### 3.8 Create API Server Actions

**File**: `src/app/admin/event-featured-performers/ApiServerActions.ts`

**Add functions:**

```typescript
/**
 * Upload performer image (portrait, performance, hero, or poster)
 */
export async function uploadPerformerImageServer(
  performerId: number,
  eventId: number,
  imageType: 'portrait' | 'performance' | 'hero' | 'poster',
  file: File,
  tenantId?: string
): Promise<EventMediaDTO> {
  // Similar to uploadSponsorImageServer but with:
  // - entityType: 'PERFORMER'
  // - entityId: performerId
  // - isPerformerPortrait, isPerformerPerformance, isPerformerHero, isPerformerPoster flags
}

/**
 * Fetch all media files for a performer
 */
export async function fetchPerformerMediaServer(
  performerId: number,
  tenantId?: string
): Promise<EventMediaDTO[]> {
  // Similar to fetchSponsorMediaServer but with:
  // - performerId.equals query parameter
}

/**
 * Fetch performer by ID
 */
export async function fetchPerformerServer(performerId: number): Promise<EventFeaturedPerformersDTO> {
  // Fetch from /api/proxy/event-featured-performers/{performerId}
}
```

**File**: `src/app/admin/event-program-directors/ApiServerActions.ts`

**Add similar functions for directors.**

---

### 3.9 Update Global Performers Page

**File**: `src/app/admin/event-featured-performers/page.tsx`

**Update to navigate to detail page** (similar to sponsors page):

```typescript
// In DataTable row click handler or edit button:
router.push(`/admin/event-featured-performers/${performer.id}`);
```

---

### 3.10 Update Global Directors Page

**File**: `src/app/admin/event-program-directors/page.tsx`

**Update to navigate to detail page** (similar to sponsors page):

```typescript
// In DataTable row click handler or edit button:
router.push(`/admin/event-program-directors/${director.id}`);
```

---

### 3.11 Create Paginated Media List Component (Reusable)

**Files**:
- `src/app/admin/event-featured-performers/[id]/PaginatedMediaList.tsx`
- `src/app/admin/event-program-directors/[id]/PaginatedMediaList.tsx`

**Or create a shared component**: `src/components/media/PaginatedMediaList.tsx`

---

## 4. Image Type Mappings

### 4.1 Performers
- **Portrait**: `PERFORMER_PORTRAIT` → Updates `portraitImageUrl` in `event_featured_performers`
- **Performance**: `PERFORMER_PERFORMANCE` → Updates `performanceImageUrl` in `event_featured_performers`
- **Hero**: `PERFORMER_HERO` → (May need to add `heroImageUrl` field to performers table)
- **Poster**: `PERFORMER_POSTER` → (May need to add `posterImageUrl` field to performers table)

### 4.2 Directors
- **Photo**: `DIRECTOR_PHOTO` → Updates `photoUrl` in `event_program_directors`
- **Hero**: `DIRECTOR_HERO` → (May need to add `heroImageUrl` field to directors table)
- **Poster**: `DIRECTOR_POSTER` → (May need to add `posterImageUrl` field to directors table)

---

## 5. Optional Enhancements

### 5.1 Add Hero/Poster URL Fields to Performers Table

If you want to support hero and poster images for performers:

```sql
ALTER TABLE public.event_featured_performers
ADD COLUMN hero_image_url varchar(1024) NULL;

ALTER TABLE public.event_featured_performers
ADD COLUMN poster_image_url varchar(1024) NULL;
```

### 5.2 Add Hero/Poster URL Fields to Directors Table

If you want to support hero and poster images for directors:

```sql
ALTER TABLE public.event_program_directors
ADD COLUMN hero_image_url varchar(1024) NULL;

ALTER TABLE public.event_program_directors
ADD COLUMN poster_image_url varchar(1024) NULL;
```

---

## 6. Testing Checklist

- [ ] Database migration runs successfully
- [ ] Backend compiles without errors
- [ ] Can upload performer portrait image
- [ ] Can upload performer performance image
- [ ] Can upload performer hero image (if supported)
- [ ] Can upload performer poster image (if supported)
- [ ] Can upload director photo image
- [ ] Can upload director hero image (if supported)
- [ ] Can upload director poster image (if supported)
- [ ] Media list displays correctly on performer detail page
- [ ] Media list displays correctly on director detail page
- [ ] Can edit media attributes (title, description, priority, etc.)
- [ ] Multiple images per type can be uploaded
- [ ] Primary image URLs update correctly in performer/director tables
- [ ] Pagination works correctly
- [ ] Filtering by performerId/directorId works in API

---

## 7. Implementation Order

1. **Database Changes** (Run migration)
2. **Backend Entity/DTO/Criteria** (Add fields)
3. **Backend Repository** (Add count methods)
4. **Backend Service** (Add upload handling)
5. **Backend Controller** (Add request parameters)
6. **Frontend Types** (Update TypeScript interfaces)
7. **Frontend API Actions** (Create server actions)
8. **Frontend Components** (Create upload components)
9. **Frontend Pages** (Create detail pages)
10. **Frontend Navigation** (Update list pages to navigate to detail pages)
11. **Testing** (Test all functionality)

---

## 8. Notes

- Follow the exact same pattern as sponsors implementation
- Ensure `eventId` can be `null` or `0` for global performers/directors
- Use the generic `/api/event-medias/upload` endpoint with appropriate flags
- Maintain consistency with existing code patterns
- Update Swagger documentation if needed

