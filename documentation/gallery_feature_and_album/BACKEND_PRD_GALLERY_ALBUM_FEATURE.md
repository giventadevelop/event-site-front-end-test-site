# Backend PRD: Gallery Album Feature

## Document Information
- **Version**: 1.0
- **Date**: 2025-01-27
- **Status**: Draft
- **Backend Project Location**: `E:\project_workspace\malayalees-us-site-boot`
- **Batch Job Project Location**: `E:\project_workspace\event-site-manager-batch-jobs`

---

## 1. Executive Summary

### 1.1 Overview
This PRD defines the backend implementation for a new **Gallery Album** feature that allows administrators to create albums (collections of media files) that are **not associated with any event**. Albums will be displayed alongside event galleries on the public gallery page (`/gallery`).

### 1.2 Business Value
- **Flexibility**: Organize media collections independently of events (e.g., "Annual Highlights", "Community Photos", "Historical Archive")
- **Better Organization**: Group related media files under meaningful album titles
- **Public Access**: Display albums alongside event galleries for enhanced content discovery
- **Admin Control**: Full CRUD operations for albums and their media associations

### 1.3 Scope
- **In Scope**:
  - Database schema changes (new `gallery_album` table)
  - REST API endpoints for album CRUD operations
  - REST API endpoints for album-media associations
  - Multi-tenancy support (tenant-scoped albums)
  - Public API endpoints for gallery display
  - Integration with existing `event_media` table

- **Out of Scope**:
  - Media file upload/storage (reuses existing `event_media` infrastructure)
  - Batch job processing (no scheduled tasks required)
  - Advanced search/filtering (basic filtering only)

---

## 2. Current System Analysis

### 2.1 Existing Database Schema

#### `event_media` Table (Current)
```sql
CREATE TABLE public.event_media (
    id int8 DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id varchar(255) NULL,
    title varchar(255) NOT NULL,
    description varchar(2048) NULL,
    event_media_type varchar(255) NOT NULL,
    storage_type varchar(255) NOT NULL,
    file_url varchar(2048) NULL,
    content_type varchar(255) NULL,
    file_size int8 NULL,
    is_public bool DEFAULT true NULL,
    event_flyer bool DEFAULT false NULL,
    is_event_management_official_document bool DEFAULT false NULL,
    pre_signed_url varchar(2048) NULL,
    pre_signed_url_expires_at timestamp NULL,
    alt_text varchar(500) NULL,
    display_order int4 DEFAULT 0 NULL,
    download_count int4 DEFAULT 0 NULL,
    is_featured_video bool DEFAULT false NULL,
    featured_video_url varchar(2048) NULL,
    is_hero_image bool DEFAULT false NULL,
    is_active_hero_image bool DEFAULT false NULL,
    start_displaying_from_date date NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    event_id int8 NULL,  -- FOREIGN KEY to event_details(id), NULLABLE
    uploaded_by_id int8 NULL,  -- FOREIGN KEY to user_profile(id)
    sponsor_id bigint NULL,
    event_sponsors_join_id bigint NULL,
    performer_id bigint NULL,
    director_id bigint NULL,
    priority_ranking INT4 NOT NULL DEFAULT 0,
    is_home_page_hero_image bool DEFAULT false NOT NULL,
    is_featured_event_image bool DEFAULT false NOT NULL,
    is_live_event_image bool DEFAULT false NOT NULL,
    CONSTRAINT fk_event_media__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_media__uploaded_by_id FOREIGN KEY (uploaded_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);
```

**Key Observations**:
- `event_id` is **nullable**, meaning media can exist without an event association
- Media can be associated with sponsors, performers, directors (via foreign keys)
- Multi-tenant support via `tenant_id`
- Public visibility controlled via `is_public` flag

### 2.2 Existing API Endpoints

#### Event Media Endpoints (Current)
- `GET /api/event-medias` - List media with filters (eventId, isPublic, etc.)
- `POST /api/event-medias` - Create single media
- `POST /api/event-medias/upload-multiple` - Upload multiple media files
- `GET /api/event-medias/{id}` - Get media by ID
- `PATCH /api/event-medias/{id}` - Update media
- `DELETE /api/event-medias/{id}` - Delete media

**Query Parameters** (JHipster/Spring Data REST criteria):
- `eventId.equals` - Filter by event ID
- `isPublic.equals` - Filter by public visibility
- `isEventManagementOfficialDocument.equals` - Exclude official documents
- `tenantId.equals` - Multi-tenant filtering (auto-injected)
- `page`, `size`, `sort` - Pagination and sorting

### 2.3 Current Gallery Flow

**Public Gallery Page** (`/gallery`):
1. Fetches active events: `GET /api/event-details?isActive.equals=true&tenantId.equals={tenantId}`
2. For each event, fetches public media: `GET /api/event-medias?eventId.equals={eventId}&isPublic.equals=true`
3. Displays event cards with media previews

**Admin Media Management**:
- Upload media to events: `/admin/events/{id}/media`
- Manage all media: `/admin/media`

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: Album Entity
- **FR-1.1**: System shall support creating albums with:
  - Title (required, max 255 chars)
  - Description (optional, max 2048 chars)
  - Cover image URL (optional, max 2048 chars) - references `event_media.file_url`
  - Public visibility flag (`is_public`, default: `true`)
  - Display order (integer, default: 0)
  - Created/updated timestamps
  - Creator reference (`created_by_id` → `user_profile.id`)
  - Tenant ID (multi-tenant support)

#### FR-2: Album-Media Association
- **FR-2.1**: System shall support associating existing `event_media` records with albums
- **FR-2.2**: Media can belong to:
  - An event (`event_id` is set, `album_id` is NULL)
  - An album (`album_id` is set, `event_id` is NULL)
  - Neither (standalone media, both NULL)
  - **NOT both** (mutually exclusive: `event_id` XOR `album_id`)
- **FR-2.3**: Media can be moved between albums or from album to event (and vice versa)
- **FR-2.4**: When album is deleted, associated media records should be updated (`album_id` set to NULL), **NOT deleted** (media files are preserved)

#### FR-3: Album CRUD Operations
- **FR-3.1**: Create album (`POST /api/gallery-albums`)
- **FR-3.2**: List albums (`GET /api/gallery-albums`) with pagination, filtering, sorting
- **FR-3.3**: Get album by ID (`GET /api/gallery-albums/{id}`)
- **FR-3.4**: Update album (`PATCH /api/gallery-albums/{id}`)
- **FR-3.5**: Delete album (`DELETE /api/gallery-albums/{id}`)
- **FR-3.6**: All operations must be tenant-scoped (auto-inject `tenantId.equals`)

#### FR-4: Album Media Management
- **FR-4.1**: Add media to album (`POST /api/gallery-albums/{albumId}/media` or update `event_media.album_id`)
- **FR-4.2**: Remove media from album (`PATCH /api/event-medias/{id}` set `album_id` to NULL)
- **FR-4.3**: List media for album (`GET /api/event-medias?albumId.equals={albumId}&isPublic.equals=true`)
- **FR-4.4**: Reorder media within album (update `display_order`)

#### FR-5: Public Gallery API
- **FR-5.1**: List public albums (`GET /api/gallery-albums?isPublic.equals=true&tenantId.equals={tenantId}`)
- **FR-5.2**: Get album with media (`GET /api/gallery-albums/{id}?expand=media`)
- **FR-5.3**: Support pagination and sorting (by `display_order`, `created_at`)

### 3.2 Non-Functional Requirements

#### NFR-1: Performance
- Album list queries should support pagination (default: 20 items per page)
- Media queries for albums should be optimized with indexes
- Response time for album list should be < 500ms for 100 albums

#### NFR-2: Security
- All album operations require authentication (JWT)
- Public endpoints (`isPublic.equals=true`) are accessible without auth
- Tenant isolation enforced at database level (all queries filtered by `tenant_id`)

#### NFR-3: Data Integrity
- `album_id` and `event_id` are mutually exclusive (enforce via CHECK constraint or application logic)
- Foreign key constraints ensure referential integrity
- Soft delete not required (hard delete with cascade rules)

#### NFR-4: Compatibility
- Must work with existing `event_media` table without breaking changes
- Must support existing media upload workflows
- Must integrate with existing multi-tenant architecture

---

## 4. Database Schema Design

### 4.1 New Table: `gallery_album`

```sql
CREATE TABLE public.gallery_album (
    id int8 DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    description varchar(2048) NULL,
    cover_image_url varchar(2048) NULL,
    is_public bool DEFAULT true NOT NULL,
    display_order int4 DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    created_by_id int8 NULL,
    CONSTRAINT pk_gallery_album PRIMARY KEY (id),
    CONSTRAINT fk_gallery_album_created_by FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
    CONSTRAINT check_display_order_non_negative CHECK (display_order >= 0)
);

-- Indexes for performance
CREATE INDEX idx_gallery_album_tenant_id ON public.gallery_album(tenant_id);
CREATE INDEX idx_gallery_album_is_public ON public.gallery_album(is_public) WHERE is_public = true;
CREATE INDEX idx_gallery_album_display_order ON public.gallery_album(display_order);
CREATE INDEX idx_gallery_album_created_at ON public.gallery_album(created_at DESC);

-- Comments
COMMENT ON TABLE public.gallery_album IS 'Stores gallery albums (collections of media not associated with events)';
COMMENT ON COLUMN public.gallery_album.cover_image_url IS 'URL to cover image (references event_media.file_url). Used as album thumbnail in gallery view.';
COMMENT ON COLUMN public.gallery_album.display_order IS 'Order for displaying albums in gallery (lower values appear first). Default: 0.';
COMMENT ON COLUMN public.gallery_album.is_public IS 'Whether album is visible to public gallery. Default: true.';
```

### 4.2 Modified Table: `event_media`

**Add new column**:
```sql
ALTER TABLE public.event_media
ADD COLUMN album_id int8 NULL;

-- Foreign key constraint
ALTER TABLE public.event_media
ADD CONSTRAINT fk_event_media_album_id
FOREIGN KEY (album_id) REFERENCES public.gallery_album(id) ON DELETE SET NULL;

-- Index for album queries
CREATE INDEX idx_event_media_album_id ON public.event_media(album_id) WHERE album_id IS NOT NULL;

-- Composite index for album + public filtering
CREATE INDEX idx_event_media_album_public ON public.event_media(album_id, is_public) WHERE album_id IS NOT NULL AND is_public = true;

-- Comment
COMMENT ON COLUMN public.event_media.album_id IS 'Reference to gallery album. Mutually exclusive with event_id (media belongs to either an event OR an album, not both).';
```

**Add CHECK constraint** (mutually exclusive):
```sql
-- Ensure event_id and album_id are mutually exclusive
ALTER TABLE public.event_media
ADD CONSTRAINT check_event_album_mutually_exclusive
CHECK (
    (event_id IS NULL AND album_id IS NULL) OR  -- Standalone media
    (event_id IS NOT NULL AND album_id IS NULL) OR  -- Event media
    (event_id IS NULL AND album_id IS NOT NULL)  -- Album media
);
```

**Migration Notes**:
- Existing `event_media` records will have `album_id = NULL` (no data migration needed)
- Existing queries filtering by `event_id` will continue to work
- New queries can filter by `album_id` for album media

### 4.3 Database Migration Strategy

**Option 1: Liquibase Migration (Recommended)**
- Create changelog file: `db/changelog/db.changelog-gallery-album.xml`
- Add `gallery_album` table creation
- Add `album_id` column to `event_media`
- Add constraints and indexes
- Test migration on dev database first

**Option 2: Manual SQL Script**
- Create SQL script: `sql/migrations/add_gallery_album_feature.sql`
- Execute on dev → staging → production (in order)
- Backup database before migration

---

## 5. API Design

### 5.1 Album Endpoints

#### 5.1.1 Create Album
```
POST /api/gallery-albums
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Tenant-Id: {tenant_id}

Request Body:
{
  "title": "Annual Highlights 2024",
  "description": "Best moments from 2024",
  "coverImageUrl": "https://storage.example.com/media/cover.jpg",
  "isPublic": true,
  "displayOrder": 0
}

Response: 201 Created
{
  "id": 1,
  "tenantId": "tenant_demo_002",
  "title": "Annual Highlights 2024",
  "description": "Best moments from 2024",
  "coverImageUrl": "https://storage.example.com/media/cover.jpg",
  "isPublic": true,
  "displayOrder": 0,
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z",
  "createdById": 123
}
```

#### 5.1.2 List Albums
```
GET /api/gallery-albums?page=0&size=20&sort=displayOrder,asc&sort=createdAt,desc&isPublic.equals=true&tenantId.equals={tenant_id}
Authorization: Bearer {jwt_token}  (optional for public albums)

Query Parameters:
- page: Page number (default: 0)
- size: Page size (default: 20)
- sort: Sort fields (e.g., "displayOrder,asc", "createdAt,desc")
- isPublic.equals: Filter by public visibility (optional)
- tenantId.equals: Auto-injected by backend (do not include in request)

Response: 200 OK
[
  {
    "id": 1,
    "tenantId": "tenant_demo_002",
    "title": "Annual Highlights 2024",
    "description": "Best moments from 2024",
    "coverImageUrl": "https://storage.example.com/media/cover.jpg",
    "isPublic": true,
    "displayOrder": 0,
    "createdAt": "2025-01-27T10:00:00Z",
    "updatedAt": "2025-01-27T10:00:00Z",
    "createdById": 123
  },
  ...
]

Headers:
X-Total-Count: 50  (total albums matching filter)
```

#### 5.1.3 Get Album by ID
```
GET /api/gallery-albums/{id}?expand=media
Authorization: Bearer {jwt_token}  (optional for public albums)

Query Parameters:
- expand=media: Include associated media in response (optional)

Response: 200 OK
{
  "id": 1,
  "tenantId": "tenant_demo_002",
  "title": "Annual Highlights 2024",
  "description": "Best moments from 2024",
  "coverImageUrl": "https://storage.example.com/media/cover.jpg",
  "isPublic": true,
  "displayOrder": 0,
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z",
  "createdById": 123,
  "media": [  // Only if expand=media
    {
      "id": 100,
      "title": "Photo 1",
      "fileUrl": "https://...",
      "displayOrder": 0,
      ...
    },
    ...
  ]
}
```

#### 5.1.4 Update Album
```
PATCH /api/gallery-albums/{id}
Content-Type: application/merge-patch+json
Authorization: Bearer {jwt_token}
X-Tenant-Id: {tenant_id}

Request Body:
{
  "title": "Updated Title",
  "isPublic": false,
  "displayOrder": 5
}

Response: 200 OK
{
  "id": 1,
  "tenantId": "tenant_demo_002",
  "title": "Updated Title",
  "description": "Best moments from 2024",
  "coverImageUrl": "https://storage.example.com/media/cover.jpg",
  "isPublic": false,
  "displayOrder": 5,
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T10:30:00Z",
  "createdById": 123
}
```

#### 5.1.5 Delete Album
```
DELETE /api/gallery-albums/{id}
Authorization: Bearer {jwt_token}
X-Tenant-Id: {tenant_id}

Response: 204 No Content

Side Effects:
- Sets album_id = NULL for all associated event_media records
- Does NOT delete media files
```

### 5.2 Media Association Endpoints

#### 5.2.1 Add Media to Album
**Option A: Update existing media** (Recommended)
```
PATCH /api/event-medias/{mediaId}
Content-Type: application/merge-patch+json
Authorization: Bearer {jwt_token}
X-Tenant-Id: {tenant_id}

Request Body:
{
  "albumId": 1,
  "eventId": null  // Remove event association if present
}

Response: 200 OK
{
  "id": 100,
  "albumId": 1,
  "eventId": null,
  ...
}
```

**Option B: Bulk add media to album**
```
POST /api/gallery-albums/{albumId}/media
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Tenant-Id: {tenant_id}

Request Body:
{
  "mediaIds": [100, 101, 102]
}

Response: 200 OK
{
  "added": 3,
  "failed": 0,
  "media": [
    {"id": 100, "albumId": 1, ...},
    {"id": 101, "albumId": 1, ...},
    {"id": 102, "albumId": 1, ...}
  ]
}
```

#### 5.2.2 Remove Media from Album
```
PATCH /api/event-medias/{mediaId}
Content-Type: application/merge-patch+json
Authorization: Bearer {jwt_token}
X-Tenant-Id: {tenant_id}

Request Body:
{
  "albumId": null
}

Response: 200 OK
{
  "id": 100,
  "albumId": null,
  "eventId": null,
  ...
}
```

#### 5.2.3 List Media for Album
```
GET /api/event-medias?albumId.equals={albumId}&isPublic.equals=true&sort=displayOrder,asc&page=0&size=20
Authorization: Bearer {jwt_token}  (optional for public media)

Query Parameters:
- albumId.equals: Filter by album ID (required)
- isPublic.equals: Filter by public visibility (optional, default: true for public endpoints)
- sort: Sort fields (e.g., "displayOrder,asc", "createdAt,desc")
- page, size: Pagination

Response: 200 OK
[
  {
    "id": 100,
    "albumId": 1,
    "eventId": null,
    "title": "Photo 1",
    "fileUrl": "https://...",
    "displayOrder": 0,
    ...
  },
  ...
]

Headers:
X-Total-Count: 25  (total media in album)
```

### 5.3 Public Gallery Endpoints

#### 5.3.1 List Public Albums
```
GET /api/gallery-albums?isPublic.equals=true&tenantId.equals={tenant_id}&sort=displayOrder,asc&sort=createdAt,desc&page=0&size=12

No authentication required (public endpoint)

Response: 200 OK
[
  {
    "id": 1,
    "title": "Annual Highlights 2024",
    "description": "Best moments from 2024",
    "coverImageUrl": "https://storage.example.com/media/cover.jpg",
    "isPublic": true,
    "displayOrder": 0,
    "createdAt": "2025-01-27T10:00:00Z",
    "mediaCount": 25  // Count of public media in album
  },
  ...
]
```

#### 5.3.2 Get Public Album with Media
```
GET /api/gallery-albums/{id}?expand=media&isPublic.equals=true&tenantId.equals={tenant_id}

No authentication required (public endpoint)

Response: 200 OK
{
  "id": 1,
  "title": "Annual Highlights 2024",
  "description": "Best moments from 2024",
  "coverImageUrl": "https://storage.example.com/media/cover.jpg",
  "isPublic": true,
  "displayOrder": 0,
  "createdAt": "2025-01-27T10:00:00Z",
  "media": [
    {
      "id": 100,
      "title": "Photo 1",
      "fileUrl": "https://...",
      "altText": "Description",
      "displayOrder": 0,
      "eventMediaType": "image/jpeg",
      ...
    },
    ...
  ]
}
```

### 5.4 Query Parameters (JHipster/Spring Data REST Criteria)

**Supported Filters**:
- `tenantId.equals` - Auto-injected, do not include in requests
- `isPublic.equals` - Filter by public visibility
- `title.contains` - Search by title (case-insensitive)
- `createdById.equals` - Filter by creator
- `displayOrder.greaterThanOrEqual` - Filter by display order
- `createdAt.greaterThanOrEqual` - Filter by creation date

**Supported Sorts**:
- `displayOrder,asc` / `displayOrder,desc`
- `createdAt,asc` / `createdAt,desc`
- `title,asc` / `title,desc`

**Pagination**:
- `page` - Page number (0-based, default: 0)
- `size` - Page size (default: 20, max: 100)

---

## 6. Entity Design (JHipster/Spring Boot)

### 6.1 GalleryAlbum Entity

```java
package com.giventa.eventmanagement.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "gallery_album")
public class GalleryAlbum implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @NotNull
    @Size(max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @Size(max = 2048)
    @Column(name = "description", length = 2048)
    private String description;

    @Size(max = 2048)
    @Column(name = "cover_image_url", length = 2048)
    private String coverImageUrl;

    @NotNull
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @NotNull
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private UserProfile createdBy;

    // Getters and setters
    // ...
}
```

### 6.2 EventMedia Entity Modification

**Add field**:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "album_id")
private GalleryAlbum album;

// Getter and setter
public GalleryAlbum getAlbum() {
    return album;
}

public void setAlbum(GalleryAlbum album) {
    this.album = album;
}
```

**Add validation** (mutually exclusive):
```java
@AssertTrue(message = "Media must belong to either an event OR an album, not both")
public boolean isValidEventAlbumAssociation() {
    return (event == null && album == null) ||
           (event != null && album == null) ||
           (event == null && album != null);
}
```

### 6.3 Repository Interfaces

```java
package com.giventa.eventmanagement.repository;

import com.giventa.eventmanagement.domain.GalleryAlbum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface GalleryAlbumRepository extends JpaRepository<GalleryAlbum, Long>, JpaSpecificationExecutor<GalleryAlbum> {

    @Query("SELECT ga FROM GalleryAlbum ga WHERE ga.tenantId = :tenantId AND ga.isPublic = true")
    Page<GalleryAlbum> findPublicAlbumsByTenant(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT COUNT(em) FROM EventMedia em WHERE em.album.id = :albumId AND em.isPublic = true")
    Long countPublicMediaByAlbum(@Param("albumId") Long albumId);
}
```

### 6.4 Service Layer

```java
package com.giventa.eventmanagement.service;

import com.giventa.eventmanagement.domain.GalleryAlbum;
import com.giventa.eventmanagement.repository.GalleryAlbumRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GalleryAlbumService {

    private final GalleryAlbumRepository galleryAlbumRepository;

    public GalleryAlbumService(GalleryAlbumRepository galleryAlbumRepository) {
        this.galleryAlbumRepository = galleryAlbumRepository;
    }

    public GalleryAlbum create(GalleryAlbum album) {
        album.setCreatedAt(Instant.now());
        album.setUpdatedAt(Instant.now());
        return galleryAlbumRepository.save(album);
    }

    public Page<GalleryAlbum> findAll(Pageable pageable) {
        return galleryAlbumRepository.findAll(pageable);
    }

    public Optional<GalleryAlbum> findOne(Long id) {
        return galleryAlbumRepository.findById(id);
    }

    public GalleryAlbum update(GalleryAlbum album) {
        album.setUpdatedAt(Instant.now());
        return galleryAlbumRepository.save(album);
    }

    public void delete(Long id) {
        // Set album_id = NULL for all associated media before deleting album
        // This is handled by ON DELETE SET NULL foreign key constraint
        galleryAlbumRepository.deleteById(id);
    }
}
```

### 6.5 REST Controller

```java
package com.giventa.eventmanagement.web.rest;

import com.giventa.eventmanagement.domain.GalleryAlbum;
import com.giventa.eventmanagement.service.GalleryAlbumService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/gallery-albums")
public class GalleryAlbumResource {

    private final GalleryAlbumService galleryAlbumService;

    public GalleryAlbumResource(GalleryAlbumService galleryAlbumService) {
        this.galleryAlbumService = galleryAlbumService;
    }

    @PostMapping
    public ResponseEntity<GalleryAlbum> create(@RequestBody GalleryAlbum album) {
        GalleryAlbum result = galleryAlbumService.create(album);
        return ResponseEntity
            .created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(result.getId()).toUri())
            .body(result);
    }

    @GetMapping
    public ResponseEntity<List<GalleryAlbum>> findAll(Pageable pageable) {
        Page<GalleryAlbum> page = galleryAlbumService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/gallery-albums");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryAlbum> findOne(@PathVariable Long id) {
        Optional<GalleryAlbum> album = galleryAlbumService.findOne(id);
        return album.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GalleryAlbum> update(@PathVariable Long id, @RequestBody GalleryAlbum album) {
        if (album.getId() == null || !album.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }
        GalleryAlbum result = galleryAlbumService.update(album);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        galleryAlbumService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 7. Integration Points

### 7.1 Existing Event Media Endpoints

**Modify** `EventMediaResource` to support `albumId` filtering:
```java
@GetMapping("/event-medias")
public ResponseEntity<List<EventMedia>> findAll(
    @RequestParam(required = false) Long eventId,
    @RequestParam(required = false) Long albumId,  // NEW
    @RequestParam(required = false) Boolean isPublic,
    Pageable pageable
) {
    // Build criteria with eventId OR albumId filter
    // ...
}
```

**Query Parameter**:
- `albumId.equals` - Filter media by album ID

### 7.2 Multi-Tenancy

**TenantContextFilter** (existing):
- Auto-injects `tenantId.equals` for all queries
- Ensures tenant isolation at database level
- No changes required (works with new `gallery_album` table)

### 7.3 Authentication & Authorization

**JWT Authentication** (existing):
- All album CRUD operations require valid JWT token
- Public endpoints (`isPublic.equals=true`) accessible without auth
- Use existing `SecurityUtils.getCurrentUserJWT()` pattern

**Authorization**:
- Admin users can create/update/delete albums
- Public users can only view public albums
- Consider role-based access control (RBAC) if needed

---

## 8. Testing Requirements

### 8.1 Unit Tests

- **GalleryAlbumServiceTest**: Test CRUD operations, validation, business logic
- **GalleryAlbumRepositoryTest**: Test query methods, pagination, filtering
- **EventMediaServiceTest**: Test album association, mutual exclusivity validation

### 8.2 Integration Tests

- **GalleryAlbumResourceIT**: Test REST endpoints, request/response mapping
- **EventMediaResourceIT**: Test `albumId` filtering, association updates
- **MultiTenancyIT**: Test tenant isolation for albums

### 8.3 Test Scenarios

1. **Create Album**: Valid data, missing required fields, duplicate title
2. **List Albums**: Pagination, filtering by `isPublic`, sorting
3. **Update Album**: Partial update, full update, invalid ID
4. **Delete Album**: Cascade to media (set `album_id` to NULL), verify media preserved
5. **Associate Media**: Add media to album, remove from album, move between albums
6. **Mutual Exclusivity**: Try to set both `event_id` and `album_id`, verify validation error
7. **Public Access**: Verify public albums accessible without auth, private albums require auth
8. **Multi-Tenancy**: Verify albums isolated by tenant, cross-tenant access denied

---

## 9. Migration & Deployment

### 9.1 Database Migration Steps

1. **Backup Database**: Full backup before migration
2. **Create `gallery_album` Table**: Execute CREATE TABLE statement
3. **Add `album_id` Column**: ALTER TABLE `event_media` ADD COLUMN `album_id`
4. **Add Foreign Key**: ALTER TABLE ADD CONSTRAINT `fk_event_media_album_id`
5. **Add CHECK Constraint**: ALTER TABLE ADD CONSTRAINT `check_event_album_mutually_exclusive`
6. **Create Indexes**: CREATE INDEX statements
7. **Verify Migration**: Run SELECT queries to verify schema
8. **Test Application**: Deploy backend, test API endpoints

### 9.2 Rollback Plan

If migration fails:
1. **Drop Constraints**: ALTER TABLE DROP CONSTRAINT `check_event_album_mutually_exclusive`
2. **Drop Foreign Key**: ALTER TABLE DROP CONSTRAINT `fk_event_media_album_id`
3. **Drop Column**: ALTER TABLE `event_media` DROP COLUMN `album_id`
4. **Drop Table**: DROP TABLE `gallery_album`
5. **Restore Backup**: If data corruption occurred

### 9.3 Deployment Checklist

- [ ] Database migration script tested on dev environment
- [ ] Backend code deployed to dev
- [ ] API endpoints tested (Postman/curl)
- [ ] Integration tests passing
- [ ] Performance tested (pagination, filtering)
- [ ] Security tested (tenant isolation, auth)
- [ ] Deploy to staging
- [ ] User acceptance testing (UAT)
- [ ] Deploy to production
- [ ] Monitor logs for errors

---

## 10. API Documentation

### 10.1 OpenAPI/Swagger Schema

**Add to `api-docs.json`**:

```json
{
  "components": {
    "schemas": {
      "GalleryAlbum": {
        "type": "object",
        "required": ["title", "tenantId", "isPublic", "displayOrder"],
        "properties": {
          "id": {
            "type": "integer",
            "format": "int64",
            "readOnly": true
          },
          "tenantId": {
            "type": "string",
            "maxLength": 255
          },
          "title": {
            "type": "string",
            "maxLength": 255
          },
          "description": {
            "type": "string",
            "maxLength": 2048
          },
          "coverImageUrl": {
            "type": "string",
            "maxLength": 2048
          },
          "isPublic": {
            "type": "boolean",
            "default": true
          },
          "displayOrder": {
            "type": "integer",
            "default": 0
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "createdById": {
            "type": "integer",
            "format": "int64"
          }
        }
      }
    }
  },
  "paths": {
    "/api/gallery-albums": {
      "get": {
        "summary": "List albums",
        "tags": ["gallery-album"],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {"type": "integer", "default": 0}
          },
          {
            "name": "size",
            "in": "query",
            "schema": {"type": "integer", "default": 20}
          },
          {
            "name": "isPublic.equals",
            "in": "query",
            "schema": {"type": "boolean"}
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {"$ref": "#/components/schemas/GalleryAlbum"}
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create album",
        "tags": ["gallery-album"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {"$ref": "#/components/schemas/GalleryAlbum"}
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/GalleryAlbum"}
              }
            }
          }
        }
      }
    },
    "/api/gallery-albums/{id}": {
      "get": {
        "summary": "Get album by ID",
        "tags": ["gallery-album"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {"type": "integer", "format": "int64"}
          },
          {
            "name": "expand",
            "in": "query",
            "schema": {"type": "string", "enum": ["media"]}
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/GalleryAlbum"}
              }
            }
          }
        }
      },
      "patch": {
        "summary": "Update album",
        "tags": ["gallery-album"],
        "requestBody": {
          "required": true,
          "content": {
            "application/merge-patch+json": {
              "schema": {"$ref": "#/components/schemas/GalleryAlbum"}
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/GalleryAlbum"}
              }
            }
          }
        }
      },
      "delete": {
        "summary": "Delete album",
        "tags": ["gallery-album"],
        "responses": {
          "204": {
            "description": "No Content"
          }
        }
      }
    }
  }
}
```

---

## 11. Error Handling

### 11.1 Error Responses

**400 Bad Request**:
```json
{
  "type": "https://www.jhipster.tech/problem/constraint-violation",
  "title": "Constraint Violation",
  "status": 400,
  "message": "Media cannot belong to both an event and an album",
  "params": "event_media"
}
```

**404 Not Found**:
```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Not Found",
  "status": 404,
  "message": "Album not found",
  "params": "gallery-album"
}
```

**500 Internal Server Error**:
```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Internal Server Error",
  "status": 500,
  "message": "An error occurred while processing your request",
  "params": ""
}
```

---

## 12. Performance Considerations

### 12.1 Database Indexes

**Required Indexes**:
- `idx_gallery_album_tenant_id` - Tenant filtering
- `idx_gallery_album_is_public` - Public album queries
- `idx_gallery_album_display_order` - Sorting
- `idx_event_media_album_id` - Album media queries
- `idx_event_media_album_public` - Composite index for album + public filtering

### 12.2 Query Optimization

- Use `JOIN FETCH` for eager loading media when `expand=media` is requested
- Use pagination for all list endpoints (default: 20 items)
- Use database-level filtering (`WHERE` clauses) instead of application-level filtering
- Consider caching public albums (Redis) if high traffic expected

---

## 13. Security Considerations

### 13.1 Authentication

- All album CRUD operations require JWT authentication
- Public endpoints (`isPublic.equals=true`) accessible without auth
- Use existing `SecurityUtils.getCurrentUserJWT()` pattern

### 13.2 Authorization

- Admin users can create/update/delete albums
- Public users can only view public albums
- Consider role-based access control (RBAC) for fine-grained permissions

### 13.3 Data Validation

- Validate `tenant_id` matches authenticated user's tenant
- Validate `album_id` and `event_id` mutual exclusivity
- Sanitize user input (title, description) to prevent XSS
- Validate `cover_image_url` format (URL validation)

---

## 14. Dependencies

### 14.1 Existing Dependencies

- **Spring Data JPA** - Entity management, repositories
- **Spring Data REST** - REST API generation
- **JHipster** - Code generation, security
- **PostgreSQL** - Database
- **Liquibase** - Database migrations (if used)

### 14.2 No New Dependencies Required

All functionality can be implemented using existing Spring Boot/JHipster stack.

---

## 15. Success Criteria

### 15.1 Functional Success

- [ ] Albums can be created, updated, deleted via REST API
- [ ] Media can be associated with albums (not events)
- [ ] Public albums are accessible without authentication
- [ ] Album-media associations are mutually exclusive with event-media associations
- [ ] Multi-tenant isolation works correctly

### 15.2 Non-Functional Success

- [ ] API response time < 500ms for album list (100 albums)
- [ ] Database migration completes without errors
- [ ] All unit and integration tests pass
- [ ] API documentation (Swagger) is up-to-date
- [ ] No breaking changes to existing `event_media` endpoints

---

## 16. Future Enhancements (Out of Scope)

- **Album Categories/Tags**: Group albums by category
- **Album Sharing**: Share albums via unique URLs/tokens
- **Album Permissions**: Fine-grained access control (view/edit/delete)
- **Album Analytics**: Track views, downloads, engagement
- **Bulk Operations**: Bulk add/remove media from albums
- **Album Templates**: Pre-configured album structures
- **Album Search**: Full-text search across album titles/descriptions

---

## 17. References

- **Database Schema**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **API Documentation**: `documentation/Swagger_API_Docs/api-docs.json`
- **Backend Project**: `E:\project_workspace\malayalees-us-site-boot`
- **Batch Job Project**: `E:\project_workspace\event-site-manager-batch-jobs`
- **JHipster Documentation**: https://www.jhipster.tech/
- **Spring Data REST**: https://spring.io/projects/spring-data-rest

---

## 18. Appendix

### 18.1 Database Migration SQL (Complete)

```sql
-- Create gallery_album table
CREATE TABLE public.gallery_album (
    id int8 DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    description varchar(2048) NULL,
    cover_image_url varchar(2048) NULL,
    is_public bool DEFAULT true NOT NULL,
    display_order int4 DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    created_by_id int8 NULL,
    CONSTRAINT pk_gallery_album PRIMARY KEY (id),
    CONSTRAINT fk_gallery_album_created_by FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
    CONSTRAINT check_display_order_non_negative CHECK (display_order >= 0)
);

-- Add album_id column to event_media
ALTER TABLE public.event_media
ADD COLUMN album_id int8 NULL;

-- Add foreign key constraint
ALTER TABLE public.event_media
ADD CONSTRAINT fk_event_media_album_id
FOREIGN KEY (album_id) REFERENCES public.gallery_album(id) ON DELETE SET NULL;

-- Add CHECK constraint for mutual exclusivity
ALTER TABLE public.event_media
ADD CONSTRAINT check_event_album_mutually_exclusive
CHECK (
    (event_id IS NULL AND album_id IS NULL) OR
    (event_id IS NOT NULL AND album_id IS NULL) OR
    (event_id IS NULL AND album_id IS NOT NULL)
);

-- Create indexes
CREATE INDEX idx_gallery_album_tenant_id ON public.gallery_album(tenant_id);
CREATE INDEX idx_gallery_album_is_public ON public.gallery_album(is_public) WHERE is_public = true;
CREATE INDEX idx_gallery_album_display_order ON public.gallery_album(display_order);
CREATE INDEX idx_gallery_album_created_at ON public.gallery_album(created_at DESC);
CREATE INDEX idx_event_media_album_id ON public.event_media(album_id) WHERE album_id IS NOT NULL;
CREATE INDEX idx_event_media_album_public ON public.event_media(album_id, is_public) WHERE album_id IS NOT NULL AND is_public = true;

-- Add comments
COMMENT ON TABLE public.gallery_album IS 'Stores gallery albums (collections of media not associated with events)';
COMMENT ON COLUMN public.gallery_album.cover_image_url IS 'URL to cover image (references event_media.file_url). Used as album thumbnail in gallery view.';
COMMENT ON COLUMN public.gallery_album.display_order IS 'Order for displaying albums in gallery (lower values appear first). Default: 0.';
COMMENT ON COLUMN public.gallery_album.is_public IS 'Whether album is visible to public gallery. Default: true.';
COMMENT ON COLUMN public.event_media.album_id IS 'Reference to gallery album. Mutually exclusive with event_id (media belongs to either an event OR an album, not both).';
```

### 18.2 Sample Test Data

```sql
-- Insert sample album
INSERT INTO public.gallery_album (tenant_id, title, description, cover_image_url, is_public, display_order, created_at, updated_at, created_by_id)
VALUES ('tenant_demo_002', 'Annual Highlights 2024', 'Best moments from 2024', 'https://storage.example.com/media/cover.jpg', true, 0, NOW(), NOW(), 1);

-- Associate existing media with album (set album_id, clear event_id)
UPDATE public.event_media
SET album_id = 1, event_id = NULL
WHERE id IN (100, 101, 102) AND tenant_id = 'tenant_demo_002';
```

---

**End of Backend PRD**

