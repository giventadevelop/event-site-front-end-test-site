# Gallery Album Feature - Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    user_profile                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id (PK)                                              │  │
│  │ tenant_id                                            │  │
│  │ user_id                                              │  │
│  │ email                                                │  │
│  │ ...                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │
                          │ (created_by_id)
                          │
┌─────────────────────────────────────────────────────────────┐
│                  gallery_album (NEW)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id (PK)                                              │  │
│  │ tenant_id (NOT NULL)                                 │  │
│  │ title (NOT NULL)                                     │  │
│  │ description                                          │  │
│  │ cover_image_url                                      │  │
│  │ is_public (DEFAULT true)                            │  │
│  │ display_order (DEFAULT 0)                           │  │
│  │ created_at                                           │  │
│  │ updated_at                                           │  │
│  │ created_by_id (FK → user_profile.id)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │
                          │ (album_id)
                          │
┌─────────────────────────────────────────────────────────────┐
│                    event_media (MODIFIED)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id (PK)                                              │  │
│  │ tenant_id                                            │  │
│  │ title (NOT NULL)                                     │  │
│  │ description                                          │  │
│  │ event_media_type (NOT NULL)                          │  │
│  │ storage_type (NOT NULL)                              │  │
│  │ file_url                                             │  │
│  │ content_type                                         │  │
│  │ file_size                                            │  │
│  │ is_public (DEFAULT true)                            │  │
│  │ display_order (DEFAULT 0)                           │  │
│  │ ... (other fields)                                   │  │
│  │                                                       │  │
│  │ event_id (FK → event_details.id) [NULLABLE]         │  │
│  │ album_id (FK → gallery_album.id) [NULLABLE] [NEW]   │  │
│  │ uploaded_by_id (FK → user_profile.id)               │  │
│  │                                                       │  │
│  │ CONSTRAINT: check_event_album_mutually_exclusive    │  │
│  │   (event_id IS NULL AND album_id IS NULL) OR         │  │
│  │   (event_id IS NOT NULL AND album_id IS NULL) OR     │  │
│  │   (event_id IS NULL AND album_id IS NOT NULL)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │ (event_id)                        │ (album_id)
         │                                    │
         ▼                                    ▼
┌─────────────────────────┐    ┌──────────────────────────────┐
│    event_details        │    │      gallery_album           │
│  ┌───────────────────┐  │    │  ┌────────────────────────┐  │
│  │ id (PK)           │  │    │  │ id (PK)                │  │
│  │ tenant_id         │  │    │  │ title                  │  │
│  │ title             │  │    │  │ description            │  │
│  │ start_date        │  │    │  │ cover_image_url        │  │
│  │ ...               │  │    │  │ is_public              │  │
│  └───────────────────┘  │    │  │ display_order          │  │
└─────────────────────────┘    │  └────────────────────────┘  │
                               └──────────────────────────────┘
```

## Media Association Patterns

### Pattern 1: Event Media
```
event_media
├── event_id = 123 (NOT NULL)
└── album_id = NULL
```
**Meaning**: Media belongs to event #123, not to any album.

### Pattern 2: Album Media
```
event_media
├── event_id = NULL
└── album_id = 456 (NOT NULL)
```
**Meaning**: Media belongs to album #456, not to any event.

### Pattern 3: Standalone Media
```
event_media
├── event_id = NULL
└── album_id = NULL
```
**Meaning**: Media is not associated with any event or album (standalone).

### Pattern 4: Invalid (Prevented by Constraint)
```
event_media
├── event_id = 123 (NOT NULL)
└── album_id = 456 (NOT NULL)
```
**Meaning**: ❌ INVALID - Constraint violation, not allowed.

## Index Strategy

### `gallery_album` Table Indexes
```
idx_gallery_album_tenant_id          ON (tenant_id)
idx_gallery_album_is_public          ON (is_public) WHERE is_public = true
idx_gallery_album_display_order      ON (display_order)
idx_gallery_album_created_at         ON (created_at DESC)
```

### `event_media` Table Indexes (New)
```
idx_event_media_album_id             ON (album_id) WHERE album_id IS NOT NULL
idx_event_media_album_public         ON (album_id, is_public)
                                     WHERE album_id IS NOT NULL AND is_public = true
```

### `event_media` Table Indexes (Existing)
```
idx_event_media_event_id             ON (event_id) WHERE event_id IS NOT NULL
idx_event_media_is_public            ON (is_public) WHERE is_public = true
idx_event_media_tenant_id            ON (tenant_id)
```

## Query Patterns

### Query 1: List Public Albums
```sql
SELECT * FROM gallery_album
WHERE tenant_id = 'tenant_demo_002'
  AND is_public = true
ORDER BY display_order ASC, created_at DESC
LIMIT 20 OFFSET 0;
```
**Uses Indexes**: `idx_gallery_album_tenant_id`, `idx_gallery_album_is_public`, `idx_gallery_album_display_order`

### Query 2: Get Media for Album
```sql
SELECT * FROM event_media
WHERE album_id = 1
  AND is_public = true
ORDER BY display_order ASC
LIMIT 50;
```
**Uses Indexes**: `idx_event_media_album_public` (composite index)

### Query 3: Get Media for Event (Existing)
```sql
SELECT * FROM event_media
WHERE event_id = 123
  AND is_public = true
ORDER BY display_order ASC
LIMIT 50;
```
**Uses Indexes**: `idx_event_media_event_id`, `idx_event_media_is_public`

### Query 4: Find Standalone Media
```sql
SELECT * FROM event_media
WHERE event_id IS NULL
  AND album_id IS NULL
  AND tenant_id = 'tenant_demo_002';
```
**Uses Indexes**: `idx_event_media_tenant_id` (full table scan for NULL checks, but filtered by tenant)

## Foreign Key Relationships

### `gallery_album.created_by_id`
- **References**: `user_profile.id`
- **On Delete**: `SET NULL` (preserve album if user deleted)
- **Nullable**: Yes (album can exist without creator reference)

### `event_media.album_id`
- **References**: `gallery_album.id`
- **On Delete**: `SET NULL` (preserve media if album deleted)
- **Nullable**: Yes (media can exist without album)

### `event_media.event_id` (Existing)
- **References**: `event_details.id`
- **On Delete**: `CASCADE` (delete media if event deleted)
- **Nullable**: Yes (media can exist without event)

## Data Integrity Rules

### Rule 1: Mutual Exclusivity
- Media **cannot** belong to both an event AND an album
- Enforced by CHECK constraint: `check_event_album_mutually_exclusive`
- Application should also validate before update

### Rule 2: Soft Delete for Media
- When album is deleted, media `album_id` is set to NULL (not deleted)
- Enforced by foreign key: `ON DELETE SET NULL`
- Media files are preserved

### Rule 3: Tenant Isolation
- All queries must filter by `tenant_id`
- Enforced by application layer (TenantContextFilter)
- Database indexes support tenant filtering

## Migration Impact

### Before Migration
```
event_media
├── event_id (nullable) ✅
└── album_id ❌ (does not exist)
```

### After Migration
```
event_media
├── event_id (nullable) ✅
└── album_id (nullable) ✅ NEW
```

**Impact on Existing Data**:
- ✅ All existing `event_media` records have `album_id = NULL` (no data migration needed)
- ✅ All existing queries continue to work (backward compatible)
- ✅ New queries can filter by `album_id` for album media

## Sample Data

### Sample Album Record
```sql
INSERT INTO gallery_album (
    tenant_id, title, description, cover_image_url,
    is_public, display_order, created_at, updated_at, created_by_id
) VALUES (
    'tenant_demo_002',
    'Annual Highlights 2024',
    'Best moments from 2024',
    'https://storage.example.com/media/cover.jpg',
    true,
    0,
    NOW(),
    NOW(),
    1
);
```

### Sample Media Association
```sql
-- Before: Media belongs to event
UPDATE event_media
SET event_id = 123, album_id = NULL
WHERE id = 100;

-- After: Move media to album
UPDATE event_media
SET event_id = NULL, album_id = 1
WHERE id = 100;
```

---

**End of Database Schema Diagram**

