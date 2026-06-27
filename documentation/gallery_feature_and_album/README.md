# Gallery Album Feature - Documentation Index

## Overview

This directory contains comprehensive documentation for implementing the **Gallery Album** feature, which enables administrators to create albums (collections of media files) that are **not associated with any event**. Albums are displayed alongside event galleries on the public gallery page.

## Documentation Files

### 1. [Backend PRD](./BACKEND_PRD_GALLERY_ALBUM_FEATURE.md)
**Purpose**: Complete backend implementation guide for the Gallery Album feature.

**Contents**:
- Database schema design (new `gallery_album` table, modified `event_media` table)
- REST API endpoint specifications
- Entity design (JHipster/Spring Boot)
- Service layer implementation
- Repository interfaces
- Testing requirements
- Migration strategy

**Target Audience**: Backend developers working on `E:\project_workspace\malayalees-us-site-boot`

### 2. [Frontend PRD](./FRONTEND_PRD_GALLERY_ALBUM_FEATURE.md)
**Purpose**: Complete frontend implementation guide for the Gallery Album feature.

**Contents**:
- Component design (new and modified components)
- Page structure (admin and public pages)
- API integration (proxy routes, server actions)
- Type definitions
- Styling guidelines
- User flows
- Implementation checklist

**Target Audience**: Frontend developers working on `E:\project_workspace\mosc-temp`

### 3. [Feature Analysis](./GALLERY_ALBUM_FEATURE_ANALYSIS.md)
**Purpose**: Comprehensive analysis of design decisions, data flow, edge cases, and implementation approach.

**Contents**:
- Executive summary
- Current system analysis
- Database schema rationale
- API design analysis
- Component analysis
- Data flow diagrams
- Edge cases & considerations
- Migration strategy
- Testing strategy
- Security considerations
- Performance optimization
- Risk assessment

**Target Audience**: Architects, tech leads, project managers

## Quick Start

### For Backend Developers

1. **Read**: [Backend PRD](./BACKEND_PRD_GALLERY_ALBUM_FEATURE.md) - Section 4 (Database Schema Design)
2. **Implement**: Database migration (Section 9.1)
3. **Implement**: Entity & Repository (Section 6)
4. **Implement**: REST Controller (Section 6.5)
5. **Test**: Follow testing requirements (Section 8)

### For Frontend Developers

1. **Read**: [Frontend PRD](./FRONTEND_PRD_GALLERY_ALBUM_FEATURE.md) - Section 4 (Component Design)
2. **Implement**: Type definitions (Section 7.1)
3. **Implement**: Proxy API routes (Section 6.1)
4. **Implement**: Server actions (Section 4.3)
5. **Implement**: Admin pages (Section 5.1)
6. **Implement**: Public gallery updates (Section 5.2)

## Key Design Decisions

### 1. Database Schema
- **New Table**: `gallery_album` - Stores album metadata
- **Modified Table**: `event_media` - Add `album_id` column (nullable)
- **Constraint**: `event_id` and `album_id` are mutually exclusive (CHECK constraint)

### 2. API Design
- **New Endpoints**: `/api/gallery-albums` (CRUD operations)
- **Modified Endpoints**: `/api/event-medias` (support `albumId.equals` filter)
- **Query Syntax**: JHipster/Spring Data REST criteria (`albumId.equals`, `isPublic.equals`, etc.)

### 3. Frontend Architecture
- **Admin Pages**: `/admin/gallery/albums` (list, create, edit, manage media)
- **Public Gallery**: `/gallery` (display albums alongside events)
- **Components**: Reuse existing patterns (`GalleryEventCard`, `EventMediaSlideshow`)

## Database Changes Summary

### New Table: `gallery_album`
```sql
CREATE TABLE public.gallery_album (
    id int8 PRIMARY KEY,
    tenant_id varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    description varchar(2048) NULL,
    cover_image_url varchar(2048) NULL,
    is_public bool DEFAULT true NOT NULL,
    display_order int4 DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    created_by_id int8 NULL
);
```

### Modified Table: `event_media`
```sql
-- Add column
ALTER TABLE public.event_media ADD COLUMN album_id int8 NULL;

-- Add foreign key
ALTER TABLE public.event_media
ADD CONSTRAINT fk_event_media_album_id
FOREIGN KEY (album_id) REFERENCES gallery_album(id) ON DELETE SET NULL;

-- Add CHECK constraint (mutually exclusive)
ALTER TABLE public.event_media
ADD CONSTRAINT check_event_album_mutually_exclusive
CHECK (
    (event_id IS NULL AND album_id IS NULL) OR
    (event_id IS NOT NULL AND album_id IS NULL) OR
    (event_id IS NULL AND album_id IS NOT NULL)
);
```

## API Endpoints Summary

### Album Endpoints
- `POST /api/gallery-albums` - Create album
- `GET /api/gallery-albums` - List albums (with pagination, filtering)
- `GET /api/gallery-albums/{id}` - Get album by ID
- `PATCH /api/gallery-albums/{id}` - Update album
- `DELETE /api/gallery-albums/{id}` - Delete album

### Media Association
- `GET /api/event-medias?albumId.equals={id}` - List media for album
- `PATCH /api/event-medias/{id}` - Update media (set `albumId`)

## Implementation Checklist

### Backend
- [ ] Database migration (create `gallery_album` table, add `album_id` column)
- [ ] Entity & Repository (JHipster generation)
- [ ] Service layer (CRUD operations)
- [ ] REST Controller (API endpoints)
- [ ] Update `EventMediaResource` (support `albumId` filter)
- [ ] Unit tests
- [ ] Integration tests

### Frontend
- [ ] Type definitions (`GalleryAlbumDTO`, `GalleryAlbumWithMedia`)
- [ ] Proxy API route (`/api/proxy/gallery-albums/[...slug].ts`)
- [ ] Server actions (admin and public)
- [ ] Admin album list page
- [ ] Admin album form page
- [ ] Admin album media management page
- [ ] Public gallery updates (fetch albums, display albums)
- [ ] `GalleryAlbumCard` component
- [ ] Album slideshow component

## Testing

### Backend Testing
- Unit tests for service layer
- Integration tests for REST endpoints
- Test mutual exclusivity validation
- Test tenant isolation

### Frontend Testing
- Component tests for new components
- Integration tests for CRUD operations
- E2E tests for user flows

## References

- **Database Schema**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **API Documentation**: `documentation/Swagger_API_Docs/api-docs.json`
- **UI Style Guide**: `shared-cursor-rules/ui_style_guide.mdc`
- **Media Gallery Grid Style**: `.cursor/rules/media_gallery_grid_style.mdc`
- **Icon and Button Styles**: `.cursor/rules/icons_buttons_styles.mdc`
- **Next.js API Routes**: `.cursor/rules/nextjs_api_routes.mdc`

## Project Locations

- **Frontend Project**: `E:\project_workspace\mosc-temp`
- **Backend Project**: `E:\project_workspace\malayalees-us-site-boot`
- **Batch Job Project**: `E:\project_workspace\event-site-manager-batch-jobs`

## Support & Questions

For questions or clarifications:
1. Review the relevant PRD document (Backend or Frontend)
2. Check the Analysis document for design rationale
3. Refer to existing code patterns (gallery, admin media pages)
4. Consult with tech lead or architect

---

**Last Updated**: 2025-01-27
**Version**: 1.0

