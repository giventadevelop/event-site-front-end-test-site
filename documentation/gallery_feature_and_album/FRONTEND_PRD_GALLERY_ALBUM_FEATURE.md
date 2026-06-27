# Frontend PRD: Gallery Album Feature

## Document Information
- **Version**: 1.0
- **Date**: 2025-01-27
- **Status**: Draft
- **Frontend Project Location**: `E:\project_workspace\mosc-temp`
- **Framework**: Next.js 15+ (App Router)

---

## 1. Executive Summary

### 1.1 Overview
This PRD defines the frontend implementation for a new **Gallery Album** feature that allows administrators to create and manage albums (collections of media files) that are **not associated with any event**. Albums will be displayed alongside event galleries on the public gallery page (`/gallery`).

### 1.2 Business Value
- **Flexibility**: Organize media collections independently of events (e.g., "Annual Highlights", "Community Photos", "Historical Archive")
- **Better Organization**: Group related media files under meaningful album titles
- **Public Access**: Display albums alongside event galleries for enhanced content discovery
- **Admin Control**: Full CRUD operations for albums and their media associations via admin interface

### 1.3 Scope
- **In Scope**:
  - Admin page for album CRUD operations (`/admin/gallery/albums`)
  - Admin page for managing album media (`/admin/gallery/albums/[id]/media`)
  - Public gallery page updates to show albums alongside events (`/gallery`)
  - Album card component for gallery display
  - Album slideshow/viewer (reuse existing `EventMediaSlideshow` component)
  - Integration with existing media upload workflow

- **Out of Scope**:
  - Media file upload UI (reuses existing upload components)
  - Advanced album search/filtering (basic search only)
  - Album sharing features
  - Album analytics dashboard

---

## 2. Current System Analysis

### 2.1 Existing Gallery Implementation

#### Public Gallery Page (`/gallery`)
- **File**: `src/app/gallery/GalleryContent.tsx`
- **Current Flow**:
  1. Fetches events with media via `fetchEventsForGallery()` server action
  2. Displays event cards in grid layout with bold dark gradient background
  3. Each card shows event title, date, hero image, media preview thumbnails
  4. Supports search by event title and date range filtering
  5. Pagination for events (12 items per page)

#### Gallery Components
- **`GalleryEventCard`**: Displays event card with media previews
- **`GallerySearch`**: Search and filter controls
- **`GalleryPagination`**: Pagination controls
- **`EventMediaSlideshow`**: Full-screen slideshow viewer for media

#### Admin Media Management
- **`/admin/media`**: Global media library (all media across events)
- **`/admin/events/[id]/media`**: Event-specific media upload/management
- **Media Upload**: Uses existing upload workflow with drag-and-drop

### 2.2 Current Data Structures

#### `GalleryEventWithMedia` Interface
```typescript
export interface GalleryEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}
```

#### `GalleryPageData` Interface
```typescript
export interface GalleryPageData {
  eventsWithMedia: GalleryEventWithMedia[];
  totalEvents: number;
  currentPage: number;
  totalPages: number;
}
```

### 2.3 Current Styling Patterns

#### Gallery Grid Styling
- **Container**: Bold dark gradient (`from-gray-900 via-purple-900 to-indigo-900`)
- **Border**: `border-white/10`
- **Shadow**: `shadow-2xl`
- **Radial Overlay**: `opacity-70` with `rgba(255,255,255,0.18)`
- **Padding**: `px-6 py-10 sm:px-10 lg:px-14`
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

#### Event Card Styling
- **Background**: Colorful gradient based on event ID
- **Hero Image**: `h-48` with `object-cover`
- **Media Preview**: 4-column grid of thumbnails
- **Action Buttons**: Full-width buttons with icon + text pattern

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: Admin Album Management Page
- **FR-1.1**: Create new album page (`/admin/gallery/albums/new`)
  - Form fields: Title (required), Description (optional), Cover Image URL (optional), Is Public (checkbox), Display Order (number)
  - Submit creates album via API
  - Redirects to album list on success

- **FR-1.2**: Album list page (`/admin/gallery/albums`)
  - Displays all albums in grid layout (matching admin media page style)
  - Shows album title, cover image, media count, public/private badge
  - Actions: View, Edit, Delete, Manage Media
  - Search by album title
  - Pagination (12 items per page)
  - "Create New Album" button (top-right)

- **FR-1.3**: Album detail/edit page (`/admin/gallery/albums/[id]`)
  - Displays album details in form
  - Edit fields: Title, Description, Cover Image URL, Is Public, Display Order
  - Save updates album via PATCH API
  - Delete button (with confirmation)

- **FR-1.4**: Album media management page (`/admin/gallery/albums/[id]/media`)
  - Lists all media associated with album
  - Shows media grid (matching `/admin/events/[id]/media` style)
  - Actions: Add Media (from existing media library), Remove from Album, Reorder
  - Upload new media directly to album (reuse existing upload component)
  - Filter: Show only public media, Show only private media

#### FR-2: Public Gallery Page Updates
- **FR-2.1**: Display albums alongside events (`/gallery`)
  - Fetch albums and events in parallel
  - Display albums and events in unified grid (or separate sections)
  - Album cards show: Cover image, Title, Description, Media count
  - Click album card opens album slideshow/viewer

- **FR-2.2**: Album card component (`GalleryAlbumCard`)
  - Similar styling to `GalleryEventCard`
  - Shows cover image (or placeholder if no cover)
  - Displays album title and media count
  - "View Album" button opens slideshow

- **FR-2.3**: Album slideshow/viewer
  - Reuse existing `EventMediaSlideshow` component
  - Display album title and description
  - Show all media in album (paginated if large)
  - Navigation: Previous/Next, Close, Thumbnail grid

- **FR-2.4**: Search and filtering
  - Search by album title (in addition to event title)
  - Filter by date range (for albums: filter by `created_at`)
  - Toggle: Show Events Only, Show Albums Only, Show All

#### FR-3: Media Association
- **FR-3.1**: Add existing media to album
  - Modal/dialog to select media from media library
  - Filter by: Media type, Public/Private, Upload date
  - Multi-select checkboxes
  - "Add to Album" button updates media `album_id` via API

- **FR-3.2**: Remove media from album
  - "Remove from Album" button on media item
  - Confirmation dialog
  - Updates media `album_id` to NULL via API

- **FR-3.3**: Move media between albums
  - "Move to Album" dropdown on media item
  - Select target album
  - Updates media `album_id` via API

- **FR-3.4**: Upload media directly to album
  - Reuse existing upload component from `/admin/events/[id]/media`
  - Set `album_id` in upload payload (instead of `event_id`)
  - Set `event_id` to NULL

### 3.2 Non-Functional Requirements

#### NFR-1: Performance
- Album list should load in < 1 second
- Media grid should support lazy loading for large albums
- Pagination for albums (12 items per page)

#### NFR-2: User Experience
- Consistent styling with existing gallery pages
- Responsive design (mobile, tablet, desktop)
- Loading states for async operations
- Error handling with user-friendly messages
- Success notifications for CRUD operations

#### NFR-3: Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management in modals/dialogs

---

## 4. Component Design

### 4.1 New Components

#### `GalleryAlbumCard` Component
**File**: `src/app/gallery/components/GalleryAlbumCard.tsx`

**Props**:
```typescript
interface GalleryAlbumCardProps {
  album: GalleryAlbumDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}
```

**Features**:
- Displays album cover image (or placeholder)
- Shows album title and media count
- "View Album" button opens slideshow
- Styling matches `GalleryEventCard` (colorful gradient background)

**Styling**:
- Card background: Colorful gradient based on album ID
- Hero image: `h-48` with `object-cover`
- Media preview: 4-column grid of thumbnails (if available)
- Action button: Full-width "View Album" button

#### `AlbumMediaSlideshow` Component
**File**: `src/app/gallery/components/AlbumMediaSlideshow.tsx`

**Props**:
```typescript
interface AlbumMediaSlideshowProps {
  album: GalleryAlbumDTO;
  media: EventMediaDTO[];
  onClose: () => void;
}
```

**Features**:
- Reuse existing `EventMediaSlideshow` component logic
- Display album title and description at top
- Show all media in album
- Navigation: Previous/Next, Close, Thumbnail grid

#### `AdminAlbumList` Component
**File**: `src/app/admin/gallery/albums/components/AdminAlbumList.tsx`

**Features**:
- Grid layout matching admin media page style
- Album cards with cover image, title, media count
- Actions: View, Edit, Delete, Manage Media
- Search by title
- Pagination

**Styling**:
- Grid container: Medium dark gradient (`from-gray-700 via-gray-800 to-gray-700`)
- Album cards: White background with shadow
- Action buttons: Icon buttons matching admin action button pattern

#### `AlbumForm` Component
**File**: `src/app/admin/gallery/albums/components/AlbumForm.tsx`

**Features**:
- Form fields: Title, Description, Cover Image URL, Is Public, Display Order
- Validation: Title required, Display Order >= 0
- Submit handler: Create or update album
- Cancel button: Navigate back to list

**Styling**:
- Form container: White card with shadow
- Input fields: Matching UI style guide patterns
- Submit button: Full-width admin action button pattern

#### `AlbumMediaManager` Component
**File**: `src/app/admin/gallery/albums/[id]/media/components/AlbumMediaManager.tsx`

**Features**:
- Media grid (matching `/admin/events/[id]/media` style)
- "Add Media" button: Opens modal to select from media library
- "Upload Media" button: Opens upload dialog
- Media actions: Remove from Album, Edit, Delete
- Reorder: Drag-and-drop or up/down arrows

**Styling**:
- Grid container: Medium dark gradient background
- Media tiles: White cards with shadow
- Action buttons: Icon buttons matching admin action button pattern

### 4.2 Modified Components

#### `GalleryContent` Component
**File**: `src/app/gallery/GalleryContent.tsx`

**Changes**:
- Fetch albums in addition to events
- Combine albums and events in unified data structure
- Display albums and events in same grid (or separate sections)
- Update search to include album titles
- Update pagination to account for albums

**New State**:
```typescript
const [albums, setAlbums] = useState<GalleryAlbumWithMedia[]>([]);
const [showType, setShowType] = useState<'all' | 'events' | 'albums'>('all');
```

#### `GallerySearch` Component
**File**: `src/app/gallery/components/GallerySearch.tsx`

**Changes**:
- Add filter toggle: "Show Events Only", "Show Albums Only", "Show All"
- Update search to search both event titles and album titles
- Update date filter to work with albums (`created_at`)

### 4.3 Server Actions

#### `src/app/gallery/ApiServerActions.ts`

**New Functions**:
```typescript
export interface GalleryAlbumDTO {
  id?: number;
  tenantId?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
}

export interface GalleryAlbumWithMedia {
  album: GalleryAlbumDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}

export interface GalleryPageDataWithAlbums {
  eventsWithMedia: GalleryEventWithMedia[];
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalEvents: number;
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Fetch albums with their media for gallery display
 */
export async function fetchAlbumsForGallery(
  page: number = 0,
  size: number = 12,
  searchTerm: string = '',
  startDate?: string,
  endDate?: string
): Promise<{
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}> {
  // Implementation: Fetch albums, then fetch media for each album
}

/**
 * Fetch album by ID with media
 */
export async function fetchAlbumWithMedia(
  albumId: number
): Promise<GalleryAlbumWithMedia | null> {
  // Implementation: Fetch album, then fetch associated media
}
```

#### `src/app/admin/gallery/albums/ApiServerActions.ts`

**New File**: Server actions for admin album management

```typescript
'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId } from '@/lib/env';
import type { GalleryAlbumDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Create new album
 */
export async function createAlbumServer(album: Omit<GalleryAlbumDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryAlbumDTO> {
  // Implementation
}

/**
 * Fetch albums with pagination and filtering
 */
export async function fetchAlbumsServer(
  page: number = 0,
  size: number = 12,
  searchTerm?: string,
  isPublic?: boolean
): Promise<{ albums: GalleryAlbumDTO[]; totalCount: number }> {
  // Implementation
}

/**
 * Fetch album by ID
 */
export async function fetchAlbumServer(albumId: number): Promise<GalleryAlbumDTO | null> {
  // Implementation
}

/**
 * Update album
 */
export async function updateAlbumServer(albumId: number, updates: Partial<GalleryAlbumDTO>): Promise<GalleryAlbumDTO> {
  // Implementation
}

/**
 * Delete album
 */
export async function deleteAlbumServer(albumId: number): Promise<void> {
  // Implementation
}

/**
 * Add media to album
 */
export async function addMediaToAlbumServer(albumId: number, mediaIds: number[]): Promise<void> {
  // Implementation: PATCH each media item to set album_id
}

/**
 * Remove media from album
 */
export async function removeMediaFromAlbumServer(mediaId: number): Promise<void> {
  // Implementation: PATCH media item to set album_id to null
}

/**
 * Fetch media for album
 */
export async function fetchAlbumMediaServer(
  albumId: number,
  page: number = 0,
  size: number = 20
): Promise<{ media: EventMediaDTO[]; totalCount: number }> {
  // Implementation: GET /api/event-medias?albumId.equals={albumId}
}
```

---

## 5. Page Structure

### 5.1 Admin Pages

#### `/admin/gallery/albums` - Album List Page
**File**: `src/app/admin/gallery/albums/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Admin Navigation                        │
├─────────────────────────────────────────┤
│ Gallery Albums                          │
│ [Create New Album]                      │
├─────────────────────────────────────────┤
│ [Search: ________]                      │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Album│ │Album│ │Album│ │Album│       │
│ │Card │ │Card │ │Card │ │Card │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Album│ │Album│ │Album│ │Album│       │
│ │Card │ │Card │ │Card │ │Card │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────┤
│ [< Previous] [Page 1 of 3] [Next >]    │
└─────────────────────────────────────────┘
```

**Features**:
- Server component: Fetches albums server-side
- Client component: Handles search, pagination, interactions
- Album cards: Cover image, title, media count, public/private badge
- Actions: View, Edit, Delete, Manage Media

#### `/admin/gallery/albums/new` - Create Album Page
**File**: `src/app/admin/gallery/albums/new/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Admin Navigation                        │
├─────────────────────────────────────────┤
│ Create New Album                        │
│ [< Back to Albums]                     │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐ │
│ │ Title: [____________] *           │ │
│ │ Description: [____________]        │ │
│ │ Cover Image URL: [____________]    │ │
│ │ ☑ Is Public                       │ │
│ │ Display Order: [0]                │ │
│ │                                   │ │
│ │ [Cancel] [Create Album]            │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features**:
- Form validation: Title required
- Submit creates album via server action
- Redirects to album list on success
- Error handling with user-friendly messages

#### `/admin/gallery/albums/[id]` - Album Detail/Edit Page
**File**: `src/app/admin/gallery/albums/[id]/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Admin Navigation                        │
├─────────────────────────────────────────┤
│ Edit Album: "Annual Highlights 2024"   │
│ [< Back to Albums] [Manage Media]      │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐ │
│ │ Title: [Annual Highlights 2024]  │ │
│ │ Description: [____________]        │ │
│ │ Cover Image URL: [____________]    │ │
│ │ ☑ Is Public                       │ │
│ │ Display Order: [0]                │ │
│ │                                   │ │
│ │ [Delete Album] [Cancel] [Save]    │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features**:
- Server component: Fetches album by ID
- Client component: Form with pre-filled values
- Update via PATCH API
- Delete with confirmation dialog

#### `/admin/gallery/albums/[id]/media` - Album Media Management Page
**File**: `src/app/admin/gallery/albums/[id]/media/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Admin Navigation                        │
├─────────────────────────────────────────┤
│ Manage Media: "Annual Highlights 2024" │
│ [< Back to Album]                      │
├─────────────────────────────────────────┤
│ [Add Existing Media] [Upload New Media]│
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Media│ │Media│ │Media│ │Media│       │
│ │Tile │ │Tile │ │Tile │ │Tile │       │
│ │[Edit│ │[Edit│ │[Edit│ │[Edit│       │
│ │Del] │ │Del] │ │Del] │ │Del] │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────┤
│ [< Previous] [Page 1 of 2] [Next >]    │
└─────────────────────────────────────────┘
```

**Features**:
- Media grid matching `/admin/events/[id]/media` style
- "Add Existing Media" button: Opens modal to select from media library
- "Upload New Media" button: Opens upload dialog (reuse existing component)
- Media actions: Edit, Delete, Remove from Album
- Reorder: Drag-and-drop or up/down arrows

### 5.2 Public Pages

#### `/gallery` - Updated Gallery Page
**File**: `src/app/gallery/GalleryContent.tsx` (modified)

**Layout**:
```
┌─────────────────────────────────────────┐
│ Gallery                                │
├─────────────────────────────────────────┤
│ [Search: ________] [Date Filters ▼]    │
│ [Show: All | Events | Albums]          │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Event│ │Album│ │Event│ │Album│       │
│ │Card │ │Card │ │Card │ │Card │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │Event│ │Album│ │Event│ │Album│       │
│ │Card │ │Card │ │Card │ │Card │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────┤
│ [< Previous] [Page 1 of 5] [Next >]    │
└─────────────────────────────────────────┘
```

**Features**:
- Unified grid showing events and albums
- Filter toggle: Show All, Show Events Only, Show Albums Only
- Search searches both event titles and album titles
- Date filter works with events (`startDate`) and albums (`created_at`)
- Click album card opens album slideshow

#### `/gallery/albums/[id]` - Album View Page (Optional)
**File**: `src/app/gallery/albums/[id]/page.tsx`

**Alternative**: Use slideshow modal instead of separate page

**Layout**:
```
┌─────────────────────────────────────────┐
│ Annual Highlights 2024                   │
│ Best moments from 2024                  │
│ [× Close]                                │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │      [Media Slideshow Viewer]       │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [< Prev] [Thumbnails] [Next >]          │
└─────────────────────────────────────────┘
```

---

## 6. API Integration

### 6.1 Proxy API Routes

#### `/api/proxy/gallery-albums/[...slug].ts`
**File**: `src/pages/api/proxy/gallery-albums/[...slug].ts`

**Implementation**:
```typescript
import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/gallery-albums' });
```

**Routes**:
- `GET /api/proxy/gallery-albums` - List albums
- `POST /api/proxy/gallery-albums` - Create album
- `GET /api/proxy/gallery-albums/{id}` - Get album by ID
- `PATCH /api/proxy/gallery-albums/{id}` - Update album
- `DELETE /api/proxy/gallery-albums/{id}` - Delete album

#### `/api/proxy/event-medias/[...slug].ts` (Modified)
**File**: `src/pages/api/proxy/event-medias/[...slug].ts`

**Changes**:
- Support `albumId.equals` query parameter
- Support `albumId` in PATCH body for associating media with albums

### 6.2 Server Actions Pattern

**Follow existing pattern** from `src/app/gallery/ApiServerActions.ts`:
- Use `fetchWithJwtRetry` for all backend API calls
- Use `getTenantId()` for tenant scoping
- Handle errors gracefully
- Return typed DTOs

**Example**:
```typescript
'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId } from '@/lib/env';
import { getAppUrl } from '@/lib/env';
import type { GalleryAlbumDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = getAppUrl();

export async function fetchAlbumsForGallery(
  page: number = 0,
  size: number = 12,
  searchTerm: string = '',
  startDate?: string,
  endDate?: string
): Promise<{
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}> {
  try {
    const tenantId = getTenantId();

    // Build query parameters
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('isPublic.equals', 'true'); // Public albums only for gallery
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'createdAt,desc');

    if (searchTerm) {
      params.append('title.contains', searchTerm);
    }

    if (startDate) {
      params.append('createdAt.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      params.append('createdAt.lessThanOrEqual', endDate);
    }

    // Fetch albums
    const albumsUrl = `${API_BASE_URL}/api/gallery-albums?${params.toString()}`;
    const albumsResponse = await fetchWithJwtRetry(albumsUrl, { cache: 'no-store' });

    if (!albumsResponse.ok) {
      console.error(`Failed to fetch albums: ${albumsResponse.statusText}`);
      return {
        albumsWithMedia: [],
        totalAlbums: 0,
        currentPage: page,
        totalPages: 0
      };
    }

    const totalAlbums = parseInt(albumsResponse.headers.get('X-Total-Count') || '0', 10);
    const albums: GalleryAlbumDTO[] = await albumsResponse.json();
    const albumsArray = Array.isArray(albums) ? albums : [];

    // Fetch media for each album
    const albumsWithMedia: GalleryAlbumWithMedia[] = [];

    for (const album of albumsArray) {
      try {
        const mediaParams = new URLSearchParams();
        mediaParams.append('albumId.equals', album.id!.toString());
        mediaParams.append('isPublic.equals', 'true');
        mediaParams.append('sort', 'displayOrder,asc');
        mediaParams.append('sort', 'updatedAt,desc');
        mediaParams.append('size', '50');

        const mediaUrl = `${API_BASE_URL}/api/event-medias?${mediaParams.toString()}`;
        const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

        let media: EventMediaDTO[] = [];
        let totalMediaCount = 0;

        if (mediaResponse.ok) {
          totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
          const mediaData = await mediaResponse.json();
          media = Array.isArray(mediaData) ? mediaData : [];
        }

        albumsWithMedia.push({
          album,
          media,
          totalMediaCount
        });

      } catch (mediaError) {
        console.error(`Failed to fetch media for album ${album.id}:`, mediaError);
        albumsWithMedia.push({
          album,
          media: [],
          totalMediaCount: 0
        });
      }
    }

    const totalPages = Math.ceil(totalAlbums / size);

    return {
      albumsWithMedia,
      totalAlbums,
      currentPage: page,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching albums for gallery:', error);
    return {
      albumsWithMedia: [],
      totalAlbums: 0,
      currentPage: page,
      totalPages: 0
    };
  }
}
```

---

## 7. Type Definitions

### 7.1 New Types

**Add to `src/types/index.ts`**:

```typescript
/**
 * DTO for gallery album, matches backend schema.
 */
export interface GalleryAlbumDTO {
  id?: number;
  tenantId?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
}

/**
 * Album with associated media for gallery display.
 */
export interface GalleryAlbumWithMedia {
  album: GalleryAlbumDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}

/**
 * Extended gallery page data including albums.
 */
export interface GalleryPageDataWithAlbums {
  eventsWithMedia: GalleryEventWithMedia[];
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalEvents: number;
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}
```

### 7.2 Modified Types

**Update `EventMediaDTO`** (if not already present):
```typescript
export interface EventMediaDTO {
  // ... existing fields ...
  albumId?: number;  // NEW: Reference to gallery album
  // ... rest of fields ...
}
```

---

## 8. Styling Guidelines

### 8.1 Admin Pages Styling

#### Album List Page
- **Grid Container**: Medium dark gradient (`from-gray-700 via-gray-800 to-gray-700`)
- **Border**: `border-gray-600/30`
- **Shadow**: `shadow-2xl`
- **Radial Overlay**: `opacity-60` with `rgba(255, 255, 255, 0.12)`
- **Grid**: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`

#### Album Cards (Admin)
- **Background**: White (`bg-white`)
- **Border Radius**: `rounded-lg`
- **Shadow**: `shadow-md`
- **Cover Image**: `h-48` with `object-cover`
- **Action Buttons**: Icon buttons matching admin action button pattern

#### Album Form
- **Container**: White card (`bg-white rounded-lg shadow-md p-6`)
- **Input Fields**: Matching UI style guide patterns
- **Submit Button**: Full-width admin action button pattern

### 8.2 Public Gallery Styling

#### Album Cards (Public)
- **Background**: Colorful gradient based on album ID (matching event cards)
- **Hero Image**: `h-48` with `object-cover`
- **Media Preview**: 4-column grid of thumbnails
- **Action Button**: Full-width "View Album" button with icon + text

#### Unified Gallery Grid
- **Container**: Bold dark gradient (`from-gray-900 via-purple-900 to-indigo-900`)
- **Border**: `border-white/10`
- **Shadow**: `shadow-2xl`
- **Radial Overlay**: `opacity-70` with `rgba(255,255,255,0.18)`
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### 8.3 Component Styling References

- **Media Gallery Grid**: `.cursor/rules/media_gallery_grid_style.mdc`
- **Icon and Button Styles**: `.cursor/rules/icons_buttons_styles.mdc`
- **Admin Action Buttons**: `.cursor/rules/admin_action_buttons.mdc`
- **UI Style Guide**: `shared-cursor-rules/ui_style_guide.mdc`

---

## 9. User Flows

### 9.1 Admin: Create Album Flow

1. Navigate to `/admin/gallery/albums`
2. Click "Create New Album" button
3. Fill in form:
   - Title: "Annual Highlights 2024" (required)
   - Description: "Best moments from 2024" (optional)
   - Cover Image URL: "https://..." (optional)
   - Is Public: ☑ (checked)
   - Display Order: 0
4. Click "Create Album"
5. Redirected to album list
6. See new album in grid

### 9.2 Admin: Add Media to Album Flow

1. Navigate to `/admin/gallery/albums/[id]/media`
2. Click "Add Existing Media" button
3. Modal opens showing media library
4. Select media items (checkboxes)
5. Click "Add to Album"
6. Media items appear in album media grid
7. Media `album_id` updated via API

### 9.3 Admin: Upload Media to Album Flow

1. Navigate to `/admin/gallery/albums/[id]/media`
2. Click "Upload New Media" button
3. Upload dialog opens (reuse existing component)
4. Drag-and-drop or select files
5. Fill in title, description, etc.
6. Submit upload
7. Media uploaded with `album_id` set (not `event_id`)
8. Media appears in album media grid

### 9.4 Public: View Album Flow

1. Navigate to `/gallery`
2. See albums and events in unified grid
3. Click on album card
4. Album slideshow opens
5. View all media in album
6. Navigate: Previous/Next, Thumbnail grid
7. Close slideshow to return to gallery

---

## 10. Error Handling

### 10.1 API Error Handling

**Server Actions**:
```typescript
try {
  const response = await fetchWithJwtRetry(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error:', response.status, errorText);
    throw new Error(`Failed to ${action}: ${errorText}`);
  }
  return await response.json();
} catch (error) {
  console.error('Error:', error);
  throw error; // Re-throw for UI to handle
}
```

**Client Components**:
```typescript
try {
  await createAlbumServer(albumData);
  setMessage('Album created successfully!');
  router.push('/admin/gallery/albums');
} catch (error: any) {
  setError(error.message || 'Failed to create album');
  console.error('Create album error:', error);
}
```

### 10.2 User-Friendly Error Messages

- **Network Errors**: "Unable to connect to server. Please check your internet connection."
- **Validation Errors**: Display field-specific errors from API
- **Permission Errors**: "You don't have permission to perform this action."
- **Not Found**: "Album not found. It may have been deleted."

---

## 11. Testing Requirements

### 11.1 Unit Tests

- **`GalleryAlbumCard`**: Render album card with cover image, title, media count
- **`AlbumForm`**: Form validation, submit handler, error handling
- **`AdminAlbumList`**: Grid rendering, search, pagination
- **`AlbumMediaManager`**: Media grid, add/remove media, reorder

### 11.2 Integration Tests

- **Album CRUD**: Create, read, update, delete albums via UI
- **Media Association**: Add/remove media from albums
- **Public Gallery**: Display albums alongside events
- **Search/Filter**: Search albums, filter by type

### 11.3 E2E Tests (Optional)

- **Admin Flow**: Create album → Add media → View in public gallery
- **Public Flow**: Browse gallery → Click album → View slideshow

---

## 12. Implementation Checklist

### 12.1 Phase 1: Backend Integration

- [ ] Add `GalleryAlbumDTO` to `src/types/index.ts`
- [ ] Create proxy API route `/api/proxy/gallery-albums/[...slug].ts`
- [ ] Update `event-medias` proxy to support `albumId.equals` filter
- [ ] Create server actions in `src/app/admin/gallery/albums/ApiServerActions.ts`
- [ ] Create server actions in `src/app/gallery/ApiServerActions.ts` (album fetching)

### 12.2 Phase 2: Admin Pages

- [ ] Create `/admin/gallery/albums/page.tsx` (album list)
- [ ] Create `/admin/gallery/albums/new/page.tsx` (create album)
- [ ] Create `/admin/gallery/albums/[id]/page.tsx` (edit album)
- [ ] Create `/admin/gallery/albums/[id]/media/page.tsx` (manage media)
- [ ] Create `AdminAlbumList` component
- [ ] Create `AlbumForm` component
- [ ] Create `AlbumMediaManager` component

### 12.3 Phase 3: Public Gallery

- [ ] Update `GalleryContent.tsx` to fetch albums
- [ ] Create `GalleryAlbumCard` component
- [ ] Update `GallerySearch.tsx` to search albums
- [ ] Create `AlbumMediaSlideshow` component (or reuse `EventMediaSlideshow`)
- [ ] Update gallery grid to show albums and events

### 12.4 Phase 4: Testing & Polish

- [ ] Test album CRUD operations
- [ ] Test media association
- [ ] Test public gallery display
- [ ] Test search and filtering
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test error handling
- [ ] Update documentation

---

## 13. Dependencies

### 13.1 Existing Dependencies

- **Next.js 15+**: App Router, Server Components, Server Actions
- **React**: Hooks, state management
- **Tailwind CSS**: Styling
- **date-fns**: Date formatting
- **next/image**: Image optimization

### 13.2 No New Dependencies Required

All functionality can be implemented using existing dependencies.

---

## 14. Success Criteria

### 14.1 Functional Success

- [ ] Admins can create, edit, delete albums via admin interface
- [ ] Admins can add/remove media from albums
- [ ] Admins can upload media directly to albums
- [ ] Public gallery displays albums alongside events
- [ ] Users can view album slideshows
- [ ] Search works for both events and albums
- [ ] Filtering works (Show All, Events Only, Albums Only)

### 14.2 Non-Functional Success

- [ ] Album list loads in < 1 second
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Styling matches existing gallery pages
- [ ] Error handling provides user-friendly messages
- [ ] All accessibility requirements met

---

## 15. References

- **Backend PRD**: `documentation/gallery_feature_and_album/BACKEND_PRD_GALLERY_ALBUM_FEATURE.md`
- **Database Schema**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **API Documentation**: `documentation/Swagger_API_Docs/api-docs.json`
- **UI Style Guide**: `shared-cursor-rules/ui_style_guide.mdc`
- **Media Gallery Grid Style**: `.cursor/rules/media_gallery_grid_style.mdc`
- **Icon and Button Styles**: `.cursor/rules/icons_buttons_styles.mdc`
- **Next.js API Routes**: `.cursor/rules/nextjs_api_routes.mdc`
- **Current Gallery Implementation**: `src/app/gallery/GalleryContent.tsx`
- **Current Admin Media**: `src/app/admin/media/page.tsx`

---

## 16. Appendix

### 16.1 Component File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── gallery/
│   │       └── albums/
│   │           ├── page.tsx                    # Album list
│   │           ├── new/
│   │           │   └── page.tsx                # Create album
│   │           ├── [id]/
│   │           │   ├── page.tsx                # Edit album
│   │           │   └── media/
│   │           │       └── page.tsx            # Manage media
│   │           └── ApiServerActions.ts         # Server actions
│   └── gallery/
│       ├── GalleryContent.tsx                  # Modified: Fetch albums
│       ├── ApiServerActions.ts                 # Modified: Add album fetching
│       └── components/
│           ├── GalleryAlbumCard.tsx            # NEW: Album card
│           ├── AlbumMediaSlideshow.tsx         # NEW: Album slideshow
│           ├── GallerySearch.tsx               # Modified: Search albums
│           └── GalleryEventCard.tsx            # Existing: Event card
└── types/
    └── index.ts                                 # Modified: Add GalleryAlbumDTO
```

### 16.2 API Endpoint Summary

**Admin Endpoints** (require authentication):
- `GET /api/proxy/gallery-albums` - List albums (with filters)
- `POST /api/proxy/gallery-albums` - Create album
- `GET /api/proxy/gallery-albums/{id}` - Get album by ID
- `PATCH /api/proxy/gallery-albums/{id}` - Update album
- `DELETE /api/proxy/gallery-albums/{id}` - Delete album
- `GET /api/proxy/event-medias?albumId.equals={id}` - Get album media
- `PATCH /api/proxy/event-medias/{id}` - Update media (set `albumId`)

**Public Endpoints** (no authentication required):
- `GET /api/proxy/gallery-albums?isPublic.equals=true` - List public albums
- `GET /api/proxy/gallery-albums/{id}?expand=media` - Get public album with media

---

**End of Frontend PRD**

