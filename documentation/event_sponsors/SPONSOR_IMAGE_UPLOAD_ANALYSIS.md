# Sponsor Image Upload Analysis Report

## Executive Summary

**Current Status**: ✅ Images ARE being stored in `event_media` table correctly
**Issue**: ⚠️ URLs are ALSO being redundantly stored in `event_sponsors` table
**S3 Configuration**: ✅ Correct - matches backend expectations
**Recommendation**: Keep current implementation but document redundancy for future cleanup

---

## 1. Current Implementation Flow

### 1.1 Frontend Upload Process (`/admin/event-sponsors/4`)

**Component**: `SponsorImageUploadArea.tsx`
- User uploads image via drag-and-drop or file picker
- Calls `uploadSponsorImageServer()` from `ApiServerActions.ts`

**API Call**:
```typescript
POST /api/proxy/event-medias/upload
Query Params:
  - eventId: 0 (for sponsor-level images)
  - entityId: sponsorId
  - entityType: 'SPONSOR'
  - imageType: 'logo' | 'hero' | 'banner'
  - isSponsorLogo: true (if logo)
  - isSponsorHero: true (if hero)
  - isSponsorBanner: true (if banner)
  - title, description, tenantId, etc.
```

**Proxy Handler**: `src/pages/api/proxy/event-medias/upload/sponsor.ts`
- Forwards to backend: `/api/event-medias/upload/sponsor-image`

---

### 1.2 Backend Processing

**Endpoint**: `POST /api/event-medias/upload/sponsor-image`
**Handler**: `EventMediaResource.uploadSponsorImage()`
**Service**: `EventMediaServiceImpl.uploadFile()`

**Process**:
1. ✅ **S3 Upload**: Uses `s3Service.generateSponsorImagePath()`
   - Path: `{profilePrefix}/media/tenantId/{tenantId}/sponsor/sponsor_id/{sponsorId}/{filename}`
   - Example: `dev/media/tenantId/tenant_demo_001/sponsor/sponsor_id/4/logo_1734567890_a1b2c3d4.jpg`

2. ✅ **EventMedia Record Created**:
   ```java
   eventMedia.setSponsorId(sponsorId);
   eventMedia.setEventMediaType("SPONSOR_BANNER" | "SPONSOR_LOGO" | "SPONSOR_HERO");
   eventMedia.setFileUrl(s3Url);
   eventMedia.setPriorityRanking(0);
   eventMedia.setStorageType("S3");
   eventMedia.setTenantId(tenantId);
   ```

3. ⚠️ **Redundant Update**: Also updates `event_sponsors` table:
   ```java
   sponsor.setBannerImageUrl(s3Url);  // or logoUrl/heroImageUrl
   eventSponsorsRepository.save(sponsor);
   ```

---

## 2. S3 Configuration Analysis

### 2.1 Backend S3 Path Generation

**File**: `S3ServiceImpl.java`
**Method**: `generateSponsorImagePath()`

```java
String.format(
    "%s/media/tenantId/%s/sponsor/sponsor_id/%d/%s_%s_%s%s",
    profilePrefix,        // "dev" or "prod"
    tenantId,
    sponsorId,
    baseName,
    timestamp,
    uuid,
    extension
)
```

**Result**: ✅ Matches PRD specification
**Example Path**: `dev/media/tenantId/tenant_demo_001/sponsor/sponsor_id/4/banner_1734567890_a1b2c3d4.jpg`

### 2.2 S3 Bucket Configuration

**File**: `S3Config.java`
- Uses AWS credentials from `application.yml`
- Region configured via `aws.s3.region`
- Bucket name from `aws.s3.bucket-name`

**Status**: ✅ Correctly configured

---

## 3. Database Schema Analysis

### 3.1 Current Schema (`Latest_Schema_Post__Blob_Claude_11.sql`)

#### `event_sponsors` Table
```sql
logo_url varchar(1024) NULL,
hero_image_url varchar(1024) NULL,
banner_image_url varchar(1024) NULL,
```

#### `event_sponsors_join` Table
```sql
custom_poster_url varchar(1024) NULL,
```

#### `event_media` Table
```sql
sponsor_id bigint NULL,
event_sponsors_join_id bigint NULL,
priority_ranking INT4 NOT NULL DEFAULT 0,
event_media_type varchar(255) NOT NULL,
file_url varchar(2048) NULL,
```

### 3.2 Schema Redundancy Analysis

**Question**: Do we still need URL columns in `event_sponsors` and `event_sponsors_join`?

**Answer**: ⚠️ **PARTIALLY REDUNDANT**

**Current Usage**:
- ✅ `event_media` table: **PRIMARY SOURCE** - All images stored here with proper metadata
- ⚠️ `event_sponsors.logo_url/hero_image_url/banner_image_url`: **REDUNDANT** - Only stores URL of first uploaded image per type
- ⚠️ `event_sponsors_join.custom_poster_url`: **REDUNDANT** - Only stores URL of first uploaded poster

**Recommendation**:
1. **Short-term**: Keep URL columns for backward compatibility (legacy code may reference them)
2. **Long-term**: Deprecate URL columns after verifying all queries use `event_media` table
3. **Migration Path**:
   - Update all queries to use `event_media` table
   - Add database migration to mark URL columns as deprecated
   - Eventually remove URL columns in future schema version

---

## 4. Event Media Type Values

### 4.1 Current Values Used

From backend code (`EventMediaServiceImpl.java`):
- `SPONSOR_LOGO` - For logo images
- `SPONSOR_HERO` - For hero images
- `SPONSOR_BANNER` - For banner images
- `EVENT_SPONSOR_POSTER` - For event-sponsor custom posters
- `SPONSOR_MEDIA` - For general sponsor media files

### 4.2 Query Pattern for Banner Images

**Current Implementation** (from `src/app/events/[id]/page.tsx`):
```typescript
GET /api/proxy/event-medias?
  eventId.equals=2&
  sponsorId.equals=5&
  eventMediaType.equals=SPONSOR_BANNER&
  eventSponsorsJoinId.equals=123&
  sort=priorityRanking,asc
```

**Status**: ✅ Correct - Uses `event_media` table with proper criteria

---

## 5. Issues Found

### 5.1 Backend Bug: Image Type Mismatch

**Location**: `EventMediaServiceImpl.uploadSponsorImage()` (line 798-808)

**Issue**: Backend checks for `"LOGO_IMAGE"`, `"HERO_IMAGE"`, `"BANNER_IMAGE"` but frontend sends `"logo"`, `"hero"`, `"banner"`

**Current Code**:
```java
switch (imageType.toLowerCase()) {
    case "LOGO_IMAGE":  // ❌ Never matches "logo"
        sponsor.setLogoUrl(s3Url);
        break;
    case "HERO_IMAGE":  // ❌ Never matches "hero"
        sponsor.setHeroImageUrl(s3Url);
        break;
    case "BANNER_IMAGE":  // ❌ Never matches "banner"
        sponsor.setBannerImageUrl(s3Url);
        break;
}
```

**Impact**: ⚠️ **MINOR** - The `uploadFile()` method (line 170-299) handles sponsor images correctly via `isSponsorLogo/isSponsorHero/isSponsorBanner` flags, so EventMedia records are created correctly. However, the `uploadSponsorImage()` method (line 763) won't update sponsor URLs correctly.

**Fix Required**: Update switch cases to match lowercase values:
```java
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
```

### 5.2 Frontend Endpoint Mismatch

**Current**: Frontend calls `/api/proxy/event-medias/upload` (generic endpoint)
**Available**: Backend has `/api/event-medias/upload/sponsor-image` (dedicated endpoint)

**Status**: ✅ **WORKING** - Generic endpoint handles sponsor images correctly via entity flags

**Recommendation**: Consider switching to dedicated endpoint for clarity, but current implementation works.

---

## 6. Verification Checklist

### 6.1 Image Storage ✅
- [x] Images stored in `event_media` table
- [x] `sponsor_id` field populated correctly
- [x] `event_media_type` set to `SPONSOR_BANNER/LOGO/HERO`
- [x] `file_url` contains S3 URL
- [x] `priority_ranking` set (defaults to 0)

### 6.2 S3 Configuration ✅
- [x] S3 paths match PRD specification
- [x] Path includes tenant ID
- [x] Path includes sponsor ID
- [x] Filenames sanitized and unique
- [x] Profile prefix (`dev`/`prod`) included

### 6.3 Database Schema ⚠️
- [x] `event_media` table has all required fields
- [x] `event_sponsors` table has URL columns (redundant but present)
- [x] `event_sponsors_join` table has `custom_poster_url` (redundant but present)
- [ ] URL columns can be deprecated in future (recommendation)

---

## 7. Recommendations

### 7.1 Immediate Actions

1. **Fix Backend Bug**: Update `uploadSponsorImage()` switch statement to handle lowercase image types
2. **Document Redundancy**: Add comments explaining why URL columns exist in sponsor tables
3. **Verify Queries**: Ensure all frontend queries use `event_media` table (not URL columns)

### 7.2 Future Improvements

1. **Deprecate URL Columns**:
   - Add database migration marking `logo_url`, `hero_image_url`, `banner_image_url` as deprecated
   - Update all queries to use `event_media` table exclusively
   - Remove URL columns in future schema version

2. **Consolidate Endpoints**:
   - Consider using dedicated `/upload/sponsor-image` endpoint instead of generic `/upload`
   - Provides better API clarity and type safety

3. **Event-Sponsor Join Images**:
   - Currently uses `event_sponsors_join.custom_poster_url`
   - Should also query `event_media` table with `eventSponsorsJoinId` filter
   - Consider deprecating `custom_poster_url` column

---

## 8. Conclusion

**Current Implementation**: ✅ **MOSTLY CORRECT**

- ✅ Images ARE being stored in `event_media` table
- ✅ S3 paths are correct and match backend configuration
- ✅ Event media types are set correctly (`SPONSOR_BANNER`, `SPONSOR_LOGO`, `SPONSOR_HERO`)
- ⚠️ Redundant URL storage in `event_sponsors` table (backward compatibility)
- ⚠️ Minor backend bug in `uploadSponsorImage()` method (doesn't affect EventMedia creation)

**Action Items**:
1. Fix backend switch statement bug (low priority - doesn't break current functionality)
2. Document URL column redundancy for future cleanup
3. Verify all queries use `event_media` table (already verified for banner images)

**Database Schema**: URL columns can remain for backward compatibility but should be deprecated in future versions.

