# Focus Group Cover Image Upload Implementation Plan

## Overview
Implement cover image upload functionality for focus groups, similar to the email header image upload feature. This will allow administrators to upload and manage cover images for focus groups through the admin interface.

## Current State Analysis

### Frontend
- **Focus Group Edit Page**: `src/app/admin/focus-groups/[id]/edit/page.tsx`
  - Currently has a text input field for `coverImageUrl`
  - Uses server action to PATCH focus group data
  - Field exists in form but no upload functionality

### Backend Structure
- **Database**: `focus_group` table has `cover_image_url` field (VARCHAR 1024)
- **DTO**: `FocusGroupDTO` includes `coverImageUrl?: string`
- **Proxy Endpoint**: `/api/proxy/focus-groups/[...slug].ts` uses shared `createProxyHandler`
- **Relationship**: Focus groups are connected to events via `event_focus_groups` join table

### Existing Upload Patterns
1. **Email Header Image**: `/api/proxy/event-medias/upload/email-header-image`
   - Requires `eventId` parameter
   - Returns `EventMediaDTO` with `fileUrl`
   - Updates event's `emailHeaderImageUrl` field

2. **Other Entity Types**: Use `/api/proxy/event-medias/upload/{entityType}` pattern
   - Examples: `sponsor`, `featured-performer`, `program-director`
   - Some require `eventId`, some don't

## Implementation Strategy

### Option 1: Use Event-Media Upload Endpoint (Recommended)
**Pros:**
- Leverages existing infrastructure
- Images stored in `event_media` table (centralized media management)
- Consistent with other entity uploads
- Automatic S3 storage handling

**Cons:**
- Requires `eventId` parameter (but can use `0` for non-event-specific images)
- May need backend support for `entityType=focus-group`

**Implementation:**
- Create proxy endpoint: `/api/proxy/event-medias/upload/focus-group-cover-image`
- Backend endpoint: `/api/event-medias/upload/focus-group-cover-image`
- Parameters: `focusGroupId`, `title`, `description`, `isPublic`, `tenantId`
- Returns: `EventMediaDTO` with `fileUrl`
- Update focus group's `coverImageUrl` via PATCH

### Option 2: Direct Focus Group Image Upload
**Pros:**
- Simpler - no event association needed
- Direct to focus group entity

**Cons:**
- Requires new backend endpoint
- May duplicate S3 upload logic
- Less consistent with existing patterns

**Implementation:**
- Create proxy endpoint: `/api/proxy/focus-groups/[id]/upload-cover-image`
- Backend endpoint: `/api/focus-groups/{id}/upload-cover-image`
- Returns: Image URL
- Update focus group's `coverImageUrl` via PATCH

## Recommended Approach: Option 1 (Dedicated Endpoint)

Following the existing pattern of email header images, we'll create a dedicated endpoint `/api/event-medias/upload/focus-group-cover-image` similar to `/api/event-medias/upload/email-header-image`.

**Backend Analysis:**
- Generic `/api/event-medias/upload` endpoint exists with `entityType` and `entityId` support
- Dedicated endpoints exist for specific use cases (email-header-image, featured-performer, sponsor, etc.)
- Focus groups don't have multiple image types (just cover image), so a dedicated endpoint is cleaner
- Backend already has infrastructure for S3 uploads via EventMediaService

## Implementation Steps

### Step 1: Backend API Endpoint (Backend Project)
**Location**: `E:\project_workspace\malayalees-us-site-boot`
**File**: `src/main/java/com/nextjstemplate/web/rest/EventMediaResource.java`

**Action**: Create new endpoint `/api/event-medias/upload/focus-group-cover-image`

**Pattern**: Similar to `uploadEmailHeaderImage` method (line ~656)

**Required Parameters:**
- `focusGroupId` (required) - Long
- `title` (default: "Focus Group Cover Image") - String
- `description` (optional, default: "Cover image for focus group") - String
- `isPublic` (default: true) - Boolean
- `tenantId` (required) - String
- `file` (multipart/form-data) - MultipartFile

**Implementation Notes:**
- Use `eventMediaService.uploadFile()` with appropriate parameters
- Set `eventId=0` or `null` since cover image is group-level, not event-specific
- Use `entityType="focus-group"` and `entityId=focusGroupId`
- After upload, update `FocusGroup.coverImageUrl` via `FocusGroupService`
- Return `EventMediaDTO` with `fileUrl`

**Response:**
```json
{
  "id": 123,
  "fileUrl": "https://s3.../focus-group-cover-4002.jpg",
  "title": "Focus Group Cover Image",
  "eventId": null,
  "entityType": "focus-group",
  "entityId": 4002,
  ...
}
```

**Backend Code Pattern:**
```java
@PostMapping(value = "/upload/focus-group-cover-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<EventMediaDTO> uploadFocusGroupCoverImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam("focusGroupId") Long focusGroupId,
    @RequestParam("title") @NotNull String title,
    @RequestParam(value = "description", required = false) String description,
    @RequestParam("tenantId") String tenantId,
    @RequestParam(value = "isPublic", required = false) Boolean isPublic,
    Authentication authentication
) {
    // Upload to S3 via eventMediaService
    // Update FocusGroup.coverImageUrl
    // Return EventMediaDTO
}
```

### Step 2: Frontend Proxy Endpoint
**File**: `src/pages/api/proxy/event-medias/upload/focus-group-cover-image.ts`

**Pattern**: Similar to `email-header-image.ts`

**Key Differences:**
- Uses `focusGroupId` instead of `eventId`
- May use `eventId=0` if backend requires it
- Title: "Focus Group Cover Image"

### Step 3: FocusGroupCoverImageUpload Component
**File**: `src/components/FocusGroupCoverImageUpload.tsx`

**Based on**: `EmailHeaderImageUpload.tsx`

**Key Changes:**
- Accepts `focusGroupId` instead of `eventId`
- Uses `/api/proxy/event-medias/upload/focus-group-cover-image`
- Icon: Use group/team icon instead of envelope icon
- Labels: "Focus Group Cover Image" instead of "Email Header Image"

**Props:**
```typescript
interface FocusGroupCoverImageUploadProps {
  focusGroupId: number;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}
```

### Step 4: Update Focus Group Edit Page
**File**: `src/app/admin/focus-groups/[id]/edit/page.tsx`

**Changes:**
1. Convert to client component or create client wrapper
2. Replace text input with `FocusGroupCoverImageUpload` component
3. Handle image upload callback to update form state
4. Ensure `coverImageUrl` is included in PATCH payload

**Current Form Structure:**
- Server action form
- Needs to be converted to client component with server action for save

### Step 5: Testing
1. Upload cover image for focus group
2. Verify image appears in preview
3. Save form and verify `coverImageUrl` is updated in database
4. Verify image displays correctly on focus group detail pages

## Technical Considerations

### Focus Group to Event Relationship
- Focus groups can be associated with multiple events via `event_focus_groups` table
- Cover image is group-level, not event-specific
- Use `eventId=0` or first associated event if backend requires eventId

### Image Storage
- Images stored in S3 via event-media upload system
- URL stored in `focus_group.cover_image_url`
- Consider image optimization/resizing if needed

### Error Handling
- File type validation (JPEG, PNG, GIF)
- File size validation (max 10MB)
- Upload error handling with user-friendly messages
- Network error handling

## Files to Create/Modify

### New Files
1. `src/components/FocusGroupCoverImageUpload.tsx`
2. `src/pages/api/proxy/event-medias/upload/focus-group-cover-image.ts`

### Modified Files
1. `src/app/admin/focus-groups/[id]/edit/page.tsx` - Add upload component
2. Backend: Add focus-group cover image upload endpoint (if needed)

## Dependencies
- Existing `EmailHeaderImageUpload` component pattern
- Event media upload infrastructure
- S3 storage configuration
- JWT authentication via proxy handler

## Next Steps
1. **Research Backend**: Check backend API for focus-group image upload support
2. **Create Component**: Build `FocusGroupCoverImageUpload` component
3. **Create Proxy**: Add proxy endpoint for focus-group cover image upload
4. **Update Edit Page**: Integrate upload component into focus group edit page
5. **Test**: Verify end-to-end functionality

