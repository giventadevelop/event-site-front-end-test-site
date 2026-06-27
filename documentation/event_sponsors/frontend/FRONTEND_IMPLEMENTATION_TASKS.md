# Frontend Implementation Tasks: Event Sponsors Multi-File Upload with Priority Ranking

**Version**: 1.0
**Date**: 2025-01-17
**Status**: Ready for Task Generation
**Project**: MOSC Event Management System

---

## Table of Contents

1. [Overview](#overview)
2. [Task Categories](#task-categories)
3. [Detailed Task Breakdown](#detailed-task-breakdown)
4. [API Integration Tasks](#api-integration-tasks)
5. [Component Development Tasks](#component-development-tasks)
6. [Page Update Tasks](#page-update-tasks)
7. [Type & DTO Updates](#type--dto-updates)
8. [Proxy Handler Tasks](#proxy-handler-tasks)
9. [Testing Tasks](#testing-tasks)
10. [Dependencies & Prerequisites](#dependencies--prerequisites)
11. [Success Criteria](#success-criteria)

---

## Overview

This document outlines all frontend implementation tasks for the Event Sponsors Multi-File Upload feature with Priority Ranking. The backend implementation is **already complete**, so this document focuses exclusively on frontend development tasks.

### Key Features to Implement

1. **Sponsor Image Upload Dialogs**
   - Logo upload dialog
   - Hero image upload dialog
   - Banner image upload dialog
   - Drag-and-drop support
   - File preview and validation

2. **Event-Sponsor Custom Poster Upload**
   - Custom poster upload dialog for event-sponsor combinations
   - Multiple poster support per event-sponsor pair

3. **Multiple Media File Management**
   - Sponsor media gallery component
   - Event-sponsor media gallery component
   - Priority ranking management UI
   - Bulk upload support

4. **API Integration**
   - Server actions for all upload operations
   - Proxy handlers for new endpoints
   - Type-safe DTO updates

---

## Task Categories

### Category 1: Type Definitions & DTO Updates
- Update TypeScript types to match backend schema
- Add new fields to existing DTOs

### Category 2: API Server Actions
- Create/update server actions for media uploads
- Implement fetch functions for media retrieval
- Add priority ranking update functions

### Category 3: Proxy Handlers
- Create proxy routes for new upload endpoints
- Implement proxy handlers for media retrieval

### Category 4: UI Components
- Upload dialog components
- Media gallery components
- Priority ranking management components

### Category 5: Page Integration
- Update sponsor management pages
- Update event-specific sponsor pages
- Add media management sections

### Category 6: Testing & Validation
- Component testing
- Integration testing
- Error handling validation

---

## Detailed Task Breakdown

### Task Group 1: Type Definitions & DTO Updates

#### Task 1.1: Update EventMediaDTO Type
**File**: `src/types/index.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: None

**Description**: Add new fields to `EventMediaDTO` interface to support sponsor and event-sponsor media files.

**Fields to Add**:
```typescript
sponsorId?: number;              // Reference to sponsor for sponsor-specific media
eventSponsorsJoinId?: number;    // Reference to event-sponsor join for custom posters
priorityRanking?: number;        // Priority ranking (0 = highest priority, default: 0)
```

**Implementation Details**:
- Add fields after existing `eventId` field (around line 173)
- Ensure all fields are optional (nullable) to maintain backward compatibility
- Add JSDoc comments explaining each field's purpose
- Reference: Backend DTO includes these fields with `@NotNull` on `priorityRanking` (default: 0)

**Acceptance Criteria**:
- [ ] `EventMediaDTO` includes `sponsorId` field
- [ ] `EventMediaDTO` includes `eventSponsorsJoinId` field
- [ ] `EventMediaDTO` includes `priorityRanking` field (default: 0)
- [ ] All fields are properly typed (number | undefined)
- [ ] JSDoc comments added for clarity

---

#### Task 1.2: Update EventSponsorsJoinDTO Type
**File**: `src/types/index.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: None

**Description**: Add `customPosterUrl` field to `EventSponsorsJoinDTO` interface.

**Fields to Add**:
```typescript
customPosterUrl?: string;  // Custom poster URL for this event-sponsor combination
```

**Implementation Details**:
- Add field to existing `EventSponsorsJoinDTO` interface (around line 773)
- Field should be optional (nullable) to support existing records
- Add JSDoc comment explaining the field's purpose
- Reference: Backend DTO includes this field as `@Size(max = 1024)`

**Acceptance Criteria**:
- [ ] `EventSponsorsJoinDTO` includes `customPosterUrl` field
- [ ] Field is properly typed (string | undefined)
- [ ] JSDoc comment added
- [ ] Existing code remains compatible

---

### Task Group 2: API Server Actions

#### Task 2.1: Create Upload Sponsor Image Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 1.1

**Description**: Create server action to upload sponsor logo, hero, or banner image.

**Function Signature**:
```typescript
export async function uploadSponsorImageServer(
  sponsorId: number,
  eventId: number,
  imageType: 'logo' | 'hero' | 'banner',
  file: File,
  tenantId?: string
): Promise<EventMediaDTO>
```

**Implementation Details**:
- Use `FormData` to send multipart/form-data
- Call proxy endpoint: `/api/proxy/event-medias/upload/sponsor-image`
- Include query parameters: `sponsorId`, `eventId`, `imageType`, `tenantId`
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL (server-side fetch requires absolute URL)
- Handle errors and return appropriate response
- Reference: See `uploadTeamMemberProfileImage` in `src/app/admin/executive-committee/ApiServerActions.ts` for pattern

**API Endpoint Details** (from Swagger):
- **Method**: POST
- **Path**: `/api/event-medias/upload/sponsor-image`
- **Query Parameters**:
  - `sponsorId` (required): Long
  - `eventId` (required): Long
  - `imageType` (required): String (values: LOGO, HERO_IMAGE, BANNER_IMAGE)
  - `tenantId` (required): String
- **Request Body**: multipart/form-data with `file` field
- **Response**: `EventMediaDTO` (200 OK)

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] FormData properly constructed
- [ ] Query parameters correctly formatted
- [ ] Error handling implemented
- [ ] Returns `EventMediaDTO` on success
- [ ] Uses server-side fetch pattern (absolute URL)

---

#### Task 2.2: Create Upload Event-Sponsor Poster Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 1.2

**Description**: Create server action to upload custom poster for event-sponsor combination.

**Function Signature**:
```typescript
export async function uploadEventSponsorPosterServer(
  eventId: number,
  sponsorId: number,
  file: File,
  title?: string,
  description?: string,
  tenantId?: string
): Promise<EventMediaDTO>
```

**Implementation Details**:
- Use `FormData` to send multipart/form-data
- Call proxy endpoint: `/api/proxy/event-medias/upload/event-sponsor-poster`
- Include query parameters: `eventId`, `sponsorId`, `tenantId`, `isPublic=true`
- Optional: `title`, `description`
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL
- Handle errors appropriately

**API Endpoint Details** (from Swagger):
- **Method**: POST
- **Path**: `/api/event-medias/upload/event-sponsor-poster`
- **Query Parameters**:
  - `eventId` (required): Long
  - `sponsorId` (required): Long
  - `tenantId` (required): String
  - `isPublic` (optional): Boolean (default: true)
  - `title` (optional): String
  - `description` (optional): String
- **Request Body**: multipart/form-data with `file` field
- **Response**: `EventMediaDTO` (200 OK)

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] FormData properly constructed
- [ ] Query parameters correctly formatted
- [ ] Optional parameters handled correctly
- [ ] Error handling implemented
- [ ] Returns `EventMediaDTO` on success

---

#### Task 2.3: Create Upload Sponsor Media Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 1.1

**Description**: Create server action to upload multiple media files for a sponsor.

**Function Signature**:
```typescript
export async function uploadSponsorMediaServer(
  sponsorId: number,
  file: File,
  title?: string,
  description?: string,
  priorityRanking?: number,
  tenantId?: string
): Promise<EventMediaDTO>
```

**Implementation Details**:
- Use `FormData` to send multipart/form-data
- Call proxy endpoint: `/api/proxy/event-medias/upload/sponsor-media`
- Include query parameters: `sponsorId`, `tenantId`, `isPublic=true`
- Optional: `title`, `description`, `priorityRanking` (default: 0)
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL
- Handle errors appropriately

**API Endpoint Details** (from Swagger):
- **Method**: POST
- **Path**: `/api/event-medias/upload/sponsor-media`
- **Query Parameters**:
  - `sponsorId` (required): Long
  - `tenantId` (required): String
  - `isPublic` (optional): Boolean (default: true)
  - `title` (optional): String
  - `description` (optional): String
  - `priorityRanking` (optional): Integer (default: 0)
- **Request Body**: multipart/form-data with `file` field
- **Response**: `EventMediaDTO` (200 OK)

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] FormData properly constructed
- [ ] Query parameters correctly formatted
- [ ] Priority ranking parameter handled (default: 0)
- [ ] Error handling implemented
- [ ] Returns `EventMediaDTO` on success

---

#### Task 2.4: Create Upload Event-Sponsor Media Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 1.1, Task 1.2

**Description**: Create server action to upload multiple media files for an event-sponsor combination.

**Function Signature**:
```typescript
export async function uploadEventSponsorMediaServer(
  eventId: number,
  sponsorId: number,
  file: File,
  title?: string,
  description?: string,
  priorityRanking?: number,
  tenantId?: string
): Promise<EventMediaDTO>
```

**Implementation Details**:
- Use `FormData` to send multipart/form-data
- Call proxy endpoint: `/api/proxy/event-medias/upload/event-sponsor-media`
- Include query parameters: `eventId`, `sponsorId`, `tenantId`, `isPublic=true`
- Optional: `title`, `description`, `priorityRanking` (default: 0)
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL
- Handle errors appropriately

**API Endpoint Details** (from Swagger):
- **Method**: POST
- **Path**: `/api/event-medias/upload/event-sponsor-media`
- **Query Parameters**:
  - `eventId` (required): Long
  - `sponsorId` (required): Long
  - `tenantId` (required): String
  - `isPublic` (optional): Boolean (default: true)
  - `title` (optional): String
  - `description` (optional): String
  - `priorityRanking` (optional): Integer (default: 0)
- **Request Body**: multipart/form-data with `file` field
- **Response**: `EventMediaDTO` (200 OK)

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] FormData properly constructed
- [ ] Query parameters correctly formatted
- [ ] Priority ranking parameter handled (default: 0)
- [ ] Error handling implemented
- [ ] Returns `EventMediaDTO` on success

---

#### Task 2.5: Create Fetch Sponsor Media Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 1.1

**Description**: Create server action to fetch all media files for a sponsor, sorted by priority ranking.

**Function Signature**:
```typescript
export async function fetchSponsorMediaServer(
  sponsorId: number,
  tenantId?: string
): Promise<EventMediaDTO[]>
```

**Implementation Details**:
- Call proxy endpoint: `/api/proxy/event-medias/sponsor/{sponsorId}`
- Include query parameter: `tenantId` (optional, but recommended for tenant isolation)
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL
- Handle response as array (backend returns sorted by `priorityRanking ASC`)
- Handle errors appropriately
- Return empty array on error (graceful degradation)

**API Endpoint Details** (from Swagger):
- **Method**: GET
- **Path**: `/api/event-medias/sponsor/{sponsorId}`
- **Query Parameters**:
  - `tenantId` (optional): String
- **Response**: Array of `EventMediaDTO` (200 OK), sorted by `priorityRanking ASC`

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] Query parameters correctly formatted
- [ ] Response handled as array
- [ ] Error handling implemented (returns empty array on error)
- [ ] Returns `EventMediaDTO[]` on success

---

#### Task 2.6: Create Fetch Event-Sponsor Media Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 1.1, Task 1.2

**Description**: Create server action to fetch all media files for an event-sponsor combination, sorted by priority ranking.

**Function Signature**:
```typescript
export async function fetchEventSponsorMediaServer(
  eventId: number,
  sponsorId: number,
  tenantId?: string
): Promise<EventMediaDTO[]>
```

**Implementation Details**:
- Call proxy endpoint: `/api/proxy/event-medias/event-sponsor/{eventId}/{sponsorId}`
- Include query parameter: `tenantId` (optional, but recommended)
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL
- Handle response as array (backend returns sorted by `priorityRanking ASC`)
- Handle errors appropriately
- Return empty array on error (graceful degradation)

**API Endpoint Details** (from Swagger):
- **Method**: GET
- **Path**: `/api/event-medias/event-sponsor/{eventId}/{sponsorId}`
- **Query Parameters**:
  - `tenantId` (optional): String
- **Response**: Array of `EventMediaDTO` (200 OK), sorted by `priorityRanking ASC`

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] Query parameters correctly formatted
- [ ] Response handled as array
- [ ] Error handling implemented (returns empty array on error)
- [ ] Returns `EventMediaDTO[]` on success

---

#### Task 2.7: Create Update Media Priority Ranking Server Action
**File**: `src/app/admin/event-sponsors/ApiServerActions.ts`
**Status**: Pending
**Priority**: Medium
**Dependencies**: Task 1.1

**Description**: Create server action to update the priority ranking of a media file.

**Function Signature**:
```typescript
export async function updateMediaPriorityRankingServer(
  mediaId: number,
  priorityRanking: number,
  tenantId?: string
): Promise<EventMediaDTO>
```

**Implementation Details**:
- Call proxy endpoint: `/api/proxy/event-medias/{id}/priority-ranking`
- Use PATCH method with `Content-Type: application/merge-patch+json`
- Include `priorityRanking` in request body
- Use `getTenantId()` from `@/lib/env` for tenant ID
- Use `getAppUrl()` for base URL
- Validate priority ranking (must be >= 0)
- Handle errors appropriately

**API Endpoint Details** (from Swagger):
- **Method**: PATCH
- **Path**: `/api/event-medias/{id}/priority-ranking`
- **Request Body**: JSON with `priorityRanking` field (Integer, >= 0)
- **Response**: `EventMediaDTO` (200 OK)

**Acceptance Criteria**:
- [ ] Function created with correct signature
- [ ] PATCH method used correctly
- [ ] Priority ranking validation implemented
- [ ] Error handling implemented
- [ ] Returns `EventMediaDTO` on success

---

### Task Group 3: Proxy Handlers

#### Task 3.1: Create Proxy Handler for Sponsor Image Upload
**File**: `src/pages/api/proxy/event-medias/upload/sponsor-image.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.1

**Description**: Create Next.js API route proxy handler for sponsor image upload endpoint.

**Implementation Details**:
- Use `createProxyHandler` from `@/lib/proxyHandler` (if available) OR create custom handler
- Handle multipart/form-data (set `bodyParser: false` in config)
- Forward request to backend: `${API_BASE_URL}/api/event-medias/upload/sponsor-image`
- Include query parameters: `sponsorId`, `eventId`, `imageType`, `tenantId`
- Use JWT authentication (via `fetchWithJwtRetry` or similar)
- Forward multipart form data from request to backend
- Return response from backend
- Handle errors appropriately

**Reference Pattern**: See `src/pages/api/proxy/event-ticket-transactions/[...slug].ts` for multipart handling

**Config Required**:
```typescript
export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
};
```

**Acceptance Criteria**:
- [ ] Proxy handler created
- [ ] Config set to disable body parser
- [ ] Query parameters forwarded correctly
- [ ] Multipart form data forwarded correctly
- [ ] JWT authentication handled
- [ ] Error handling implemented
- [ ] Returns backend response

---

#### Task 3.2: Create Proxy Handler for Event-Sponsor Poster Upload
**File**: `src/pages/api/proxy/event-medias/upload/event-sponsor-poster.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.2

**Description**: Create Next.js API route proxy handler for event-sponsor poster upload endpoint.

**Implementation Details**:
- Use `createProxyHandler` from `@/lib/proxyHandler` (if available) OR create custom handler
- Handle multipart/form-data (set `bodyParser: false` in config)
- Forward request to backend: `${API_BASE_URL}/api/event-medias/upload/event-sponsor-poster`
- Include query parameters: `eventId`, `sponsorId`, `tenantId`, `isPublic`, `title`, `description`
- Use JWT authentication (via `fetchWithJwtRetry` or similar)
- Forward multipart form data from request to backend
- Return response from backend
- Handle errors appropriately

**Reference Pattern**: See `src/pages/api/proxy/event-ticket-transactions/[...slug].ts` for multipart handling

**Config Required**:
```typescript
export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
};
```

**Acceptance Criteria**:
- [ ] Proxy handler created
- [ ] Config set to disable body parser
- [ ] Query parameters forwarded correctly
- [ ] Multipart form data forwarded correctly
- [ ] JWT authentication handled
- [ ] Error handling implemented
- [ ] Returns backend response

---

#### Task 3.3: Create Proxy Handler for Sponsor Media Upload
**File**: `src/pages/api/proxy/event-medias/upload/sponsor-media.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.3

**Description**: Create Next.js API route proxy handler for sponsor media upload endpoint.

**Implementation Details**:
- Use `createProxyHandler` from `@/lib/proxyHandler` (if available) OR create custom handler
- Handle multipart/form-data (set `bodyParser: false` in config)
- Forward request to backend: `${API_BASE_URL}/api/event-medias/upload/sponsor-media`
- Include query parameters: `sponsorId`, `tenantId`, `isPublic`, `title`, `description`, `priorityRanking`
- Use JWT authentication (via `fetchWithJwtRetry` or similar)
- Forward multipart form data from request to backend
- Return response from backend
- Handle errors appropriately

**Reference Pattern**: See `src/pages/api/proxy/event-ticket-transactions/[...slug].ts` for multipart handling

**Config Required**:
```typescript
export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
};
```

**Acceptance Criteria**:
- [ ] Proxy handler created
- [ ] Config set to disable body parser
- [ ] Query parameters forwarded correctly
- [ ] Multipart form data forwarded correctly
- [ ] JWT authentication handled
- [ ] Error handling implemented
- [ ] Returns backend response

---

#### Task 3.4: Create Proxy Handler for Event-Sponsor Media Upload
**File**: `src/pages/api/proxy/event-medias/upload/event-sponsor-media.ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.4

**Description**: Create Next.js API route proxy handler for event-sponsor media upload endpoint.

**Implementation Details**:
- Use `createProxyHandler` from `@/lib/proxyHandler` (if available) OR create custom handler
- Handle multipart/form-data (set `bodyParser: false` in config)
- Forward request to backend: `${API_BASE_URL}/api/event-medias/upload/event-sponsor-media`
- Include query parameters: `eventId`, `sponsorId`, `tenantId`, `isPublic`, `title`, `description`, `priorityRanking`
- Use JWT authentication (via `fetchWithJwtRetry` or similar)
- Forward multipart form data from request to backend
- Return response from backend
- Handle errors appropriately

**Reference Pattern**: See `src/pages/api/proxy/event-ticket-transactions/[...slug].ts` for multipart handling

**Config Required**:
```typescript
export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
};
```

**Acceptance Criteria**:
- [ ] Proxy handler created
- [ ] Config set to disable body parser
- [ ] Query parameters forwarded correctly
- [ ] Multipart form data forwarded correctly
- [ ] JWT authentication handled
- [ ] Error handling implemented
- [ ] Returns backend response

---

#### Task 3.5: Create Proxy Handler for Sponsor Media Retrieval
**File**: `src/pages/api/proxy/event-medias/sponsor/[...slug].ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.5

**Description**: Create Next.js API route proxy handler for fetching sponsor media.

**Implementation Details**:
- Use `createProxyHandler` from `@/lib/proxyHandler` with `backendPath: '/api/event-medias/sponsor'`
- Handle GET requests only
- Forward query parameters (especially `tenantId`)
- Use JWT authentication (handled by `createProxyHandler`)
- Return response from backend

**Reference Pattern**: See `src/pages/api/proxy/event-details/[...slug].ts` for similar pattern

**Implementation**:
```typescript
import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/event-medias/sponsor',
  allowedMethods: ['GET'],
});
```

**Acceptance Criteria**:
- [ ] Proxy handler created using `createProxyHandler`
- [ ] GET method only
- [ ] Query parameters forwarded correctly
- [ ] JWT authentication handled
- [ ] Returns backend response

---

#### Task 3.6: Create Proxy Handler for Event-Sponsor Media Retrieval
**File**: `src/pages/api/proxy/event-medias/event-sponsor/[...slug].ts`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.6

**Description**: Create Next.js API route proxy handler for fetching event-sponsor media.

**Implementation Details**:
- Use `createProxyHandler` from `@/lib/proxyHandler` with `backendPath: '/api/event-medias/event-sponsor'`
- Handle GET requests only
- Forward query parameters (especially `tenantId`)
- Use JWT authentication (handled by `createProxyHandler`)
- Return response from backend

**Reference Pattern**: See `src/pages/api/proxy/event-details/[...slug].ts` for similar pattern

**Implementation**:
```typescript
import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/event-medias/event-sponsor',
  allowedMethods: ['GET'],
});
```

**Acceptance Criteria**:
- [ ] Proxy handler created using `createProxyHandler`
- [ ] GET method only
- [ ] Query parameters forwarded correctly
- [ ] JWT authentication handled
- [ ] Returns backend response

---

#### Task 3.7: Create Proxy Handler for Priority Ranking Update
**File**: `src/pages/api/proxy/event-medias/[...slug].ts` (or create new file)
**Status**: Pending
**Priority**: Medium
**Dependencies**: Task 2.7

**Description**: Create or update Next.js API route proxy handler for updating media priority ranking.

**Implementation Details**:
- Check if `src/pages/api/proxy/event-medias/[...slug].ts` exists
- If exists, ensure it handles PATCH requests to `/{id}/priority-ranking`
- If not, create new file or update existing handler
- Use `createProxyHandler` from `@/lib/proxyHandler` with `backendPath: '/api/event-medias'`
- Handle PATCH requests with `Content-Type: application/merge-patch+json`
- Forward request body with `priorityRanking` field
- Use JWT authentication (handled by `createProxyHandler`)
- Return response from backend

**Reference Pattern**: See `src/pages/api/proxy/event-details/[...slug].ts` for similar pattern

**Acceptance Criteria**:
- [ ] Proxy handler created or updated
- [ ] PATCH method handled for priority ranking endpoint
- [ ] Request body forwarded correctly
- [ ] JWT authentication handled
- [ ] Returns backend response

---

### Task Group 4: UI Components

#### Task 4.1: Create Sponsor Image Upload Dialog Component
**File**: `src/components/sponsors/SponsorImageUploadDialog.tsx`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.1, Task 3.1

**Description**: Create a drag-and-drop upload dialog component for sponsor images (logo, hero, banner).

**Component Props**:
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

**Features to Implement**:
- Drag-and-drop file upload area
- File input button (fallback)
- File preview before upload
- Upload progress indicator
- File validation (type, size)
- Error handling and display
- Success notification
- Close button
- Loading states

**UI Standards** (from `@ui_style_guide.mdc`):
- Use sacred design system colors (`bg-background`, `text-foreground`, etc.)
- Use `font-heading` for titles, `font-body` for descriptions
- Use `sacred-shadow` for card styling
- Use `reverent-transition` for animations
- Responsive design (mobile-first)
- Use `Button` component with proper variants
- Use `AppIcon` component for icons

**Reference Components**:
- `src/app/admin/executive-committee/ImageUploadDialog.tsx` - Similar upload dialog
- `src/components/ui/ImageUpload.tsx` - Image upload component
- `src/components/DragDropImageUpload.tsx` - Drag-and-drop component

**Implementation Details**:
- Use `'use client'` directive (client component)
- Use `useState` for file selection, preview, upload state, progress
- Use `useRef` for file input
- Implement drag handlers (`onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop`)
- Call `uploadSponsorImageServer` from ApiServerActions
- Display upload progress (0-100%)
- Show success/error dialogs (use `SuccessDialog` and `ErrorDialog` components)
- Reset form on close
- Validate file type (image/*) and size (10MB max)

**Acceptance Criteria**:
- [ ] Component created with correct props interface
- [ ] Drag-and-drop functionality working
- [ ] File preview working
- [ ] Upload progress indicator working
- [ ] File validation implemented
- [ ] Error handling implemented
- [ ] Success notification working
- [ ] UI matches style guide
- [ ] Responsive design implemented
- [ ] Loading states handled

---

#### Task 4.2: Create Event-Sponsor Poster Upload Dialog Component
**File**: `src/components/sponsors/EventSponsorPosterUploadDialog.tsx`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.2, Task 3.2

**Description**: Create a drag-and-drop upload dialog component for event-sponsor custom posters.

**Component Props**:
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

**Features to Implement**:
- Drag-and-drop file upload area
- File input button (fallback)
- File preview before upload
- Current poster preview (if available)
- Upload progress indicator
- File validation (type, size)
- Optional title and description fields
- Error handling and display
- Success notification
- Close button
- Loading states

**UI Standards**: Same as Task 4.1

**Reference Components**: Same as Task 4.1

**Implementation Details**:
- Use `'use client'` directive
- Use `useState` for file selection, preview, upload state, progress, title, description
- Use `useRef` for file input
- Implement drag handlers
- Call `uploadEventSponsorPosterServer` from ApiServerActions
- Display current poster if available
- Display upload progress (0-100%)
- Show success/error dialogs
- Reset form on close
- Validate file type (image/*) and size (10MB max)

**Acceptance Criteria**:
- [ ] Component created with correct props interface
- [ ] Drag-and-drop functionality working
- [ ] File preview working
- [ ] Current poster preview working (if available)
- [ ] Title and description fields implemented
- [ ] Upload progress indicator working
- [ ] File validation implemented
- [ ] Error handling implemented
- [ ] Success notification working
- [ ] UI matches style guide
- [ ] Responsive design implemented
- [ ] Loading states handled

---

#### Task 4.3: Create Sponsor Media Gallery Component
**File**: `src/components/sponsors/SponsorMediaGallery.tsx`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.5, Task 2.7

**Description**: Create a gallery component to display and manage multiple media files for a sponsor.

**Component Props**:
```typescript
interface SponsorMediaGalleryProps {
  sponsorId: number;
  onMediaSelect?: (media: EventMediaDTO) => void;
  onMediaDelete?: (mediaId: number) => void;
  onPriorityChange?: (mediaId: number, priorityRanking: number) => void;
  showPriorityControls?: boolean;
  allowUpload?: boolean;
}
```

**Features to Implement**:
- Grid layout for media files (sorted by priority ranking)
- Media thumbnail previews
- Click to view full size (lightbox or modal)
- Priority ranking display (badge or indicator)
- Priority ranking editor (inline input or modal)
- Delete button for each media item
- Upload new media button (opens upload dialog)
- Empty state message
- Loading state
- Error state

**UI Standards**: Same as Task 4.1

**Grid Layout**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8` pattern

**Priority Ranking Display**:
- Show priority ranking as badge (e.g., "Priority: 0", "Priority: 1")
- Color code: Higher priority (lower number) = more prominent color
- Allow inline editing or modal for priority changes

**Implementation Details**:
- Use `'use client'` directive
- Use `useState` for media list, selected media, loading state
- Use `useEffect` to fetch media on mount and when `sponsorId` changes
- Call `fetchSponsorMediaServer` from ApiServerActions
- Call `updateMediaPriorityRankingServer` for priority updates
- Display media in grid sorted by `priorityRanking ASC`
- Implement lightbox/modal for full-size viewing
- Implement delete confirmation dialog
- Implement priority ranking edit modal or inline input

**Acceptance Criteria**:
- [ ] Component created with correct props interface
- [ ] Grid layout implemented (responsive)
- [ ] Media thumbnails displayed
- [ ] Media sorted by priority ranking
- [ ] Priority ranking displayed
- [ ] Priority ranking editor working
- [ ] Delete functionality working
- [ ] Upload button working (opens upload dialog)
- [ ] Empty state message displayed
- [ ] Loading state handled
- [ ] Error state handled
- [ ] UI matches style guide
- [ ] Responsive design implemented

---

#### Task 4.4: Create Event-Sponsor Media Gallery Component
**File**: `src/components/sponsors/EventSponsorMediaGallery.tsx`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 2.6, Task 2.7

**Description**: Create a gallery component to display and manage multiple media files for an event-sponsor combination.

**Component Props**:
```typescript
interface EventSponsorMediaGalleryProps {
  eventId: number;
  sponsorId: number;
  onMediaSelect?: (media: EventMediaDTO) => void;
  onMediaDelete?: (mediaId: number) => void;
  onPriorityChange?: (mediaId: number, priorityRanking: number) => void;
  showPriorityControls?: boolean;
  allowUpload?: boolean;
}
```

**Features to Implement**: Same as Task 4.3, but for event-sponsor media

**Implementation Details**: Similar to Task 4.3, but:
- Call `fetchEventSponsorMediaServer` instead of `fetchSponsorMediaServer`
- Pass both `eventId` and `sponsorId` to fetch function

**Acceptance Criteria**: Same as Task 4.3

---

#### Task 4.5: Create Priority Ranking Editor Component
**File**: `src/components/sponsors/PriorityRankingEditor.tsx`
**Status**: Pending
**Priority**: Medium
**Dependencies**: Task 2.7

**Description**: Create a reusable component for editing priority ranking of media files.

**Component Props**:
```typescript
interface PriorityRankingEditorProps {
  mediaId: number;
  currentPriority: number;
  onSave: (mediaId: number, priorityRanking: number) => Promise<void>;
  onCancel?: () => void;
  isInline?: boolean;
}
```

**Features to Implement**:
- Number input for priority ranking (min: 0)
- Validation (>= 0)
- Save button
- Cancel button (if not inline)
- Loading state during save
- Error handling
- Success notification

**UI Standards**: Same as Task 4.1

**Implementation Details**:
- Use `'use client'` directive
- Use `useState` for input value, loading state, error message
- Validate input (must be >= 0, integer)
- Call `onSave` callback with mediaId and new priority
- Show loading state during save
- Handle errors appropriately

**Acceptance Criteria**:
- [ ] Component created with correct props interface
- [ ] Number input working
- [ ] Validation implemented
- [ ] Save functionality working
- [ ] Loading state handled
- [ ] Error handling implemented
- [ ] UI matches style guide
- [ ] Inline and modal modes supported

---

### Task Group 5: Page Integration

#### Task 5.1: Update Sponsor Management Page - Add Image Uploads
**File**: `src/app/admin/event-sponsors/page.tsx`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 4.1, Task 4.3

**Description**: Update the sponsor management page to replace URL input fields with image upload dialogs and add media gallery.

**Changes Required**:
1. **Replace URL Input Fields**:
   - Replace `logoUrl` text input with upload button and preview
   - Replace `heroImageUrl` text input with upload button and preview
   - Replace `bannerImageUrl` text input with upload button and preview

2. **Add Upload Buttons**:
   - "Upload Logo" button opens `SponsorImageUploadDialog` with `imageType='logo'`
   - "Upload Hero Image" button opens `SponsorImageUploadDialog` with `imageType='hero'`
   - "Upload Banner" button opens `SponsorImageUploadDialog` with `imageType='banner'`

3. **Add Media Gallery Section**:
   - Add `SponsorMediaGallery` component below sponsor details
   - Pass `sponsorId` prop
   - Enable upload and priority controls

4. **Update Form State**:
   - Remove URL input fields from form state
   - Update sponsor data after successful upload (refresh from server)

**Implementation Details**:
- Use `useState` for upload dialog open/close states
- Import `SponsorImageUploadDialog` and `SponsorMediaGallery` components
- Handle upload success by refreshing sponsor data
- Display current images as previews
- Use `Button` component for upload buttons
- Use `Image` component for previews (with fallback)

**UI Standards**: Same as Task 4.1

**Acceptance Criteria**:
- [ ] URL input fields replaced with upload buttons
- [ ] Upload dialogs working for all three image types
- [ ] Image previews displayed
- [ ] Media gallery section added
- [ ] Sponsor data refreshed after upload
- [ ] UI matches style guide
- [ ] Responsive design maintained

---

#### Task 5.2: Update Event-Specific Sponsors Page - Add Custom Poster Upload
**File**: `src/app/admin/events/[id]/sponsors/page.tsx`
**Status**: Pending
**Priority**: High
**Dependencies**: Task 4.2, Task 4.4

**Description**: Update the event-specific sponsors page to add custom poster upload for each event-sponsor combination and media gallery.

**Changes Required**:
1. **Add Custom Poster Upload**:
   - For each event-sponsor combination, add "Upload Custom Poster" button
   - Button opens `EventSponsorPosterUploadDialog`
   - Display current custom poster if available
   - Show poster preview in sponsor card

2. **Add Media Gallery Section**:
   - Add `EventSponsorMediaGallery` component for each sponsor
   - Pass `eventId` and `sponsorId` props
   - Enable upload and priority controls
   - Show in expandable section or modal

3. **Update Sponsor Display**:
   - Show custom poster prominently if available
   - Display priority ranking badge
   - Show media count badge

**Implementation Details**:
- Use `useState` for upload dialog open/close states per sponsor
- Import `EventSponsorPosterUploadDialog` and `EventSponsorMediaGallery` components
- Handle upload success by refreshing event sponsors data
- Display custom poster in sponsor card (use `Image` component)
- Add expandable section or modal for media gallery

**UI Standards**: Same as Task 4.1

**Acceptance Criteria**:
- [ ] Custom poster upload button added for each sponsor
- [ ] Upload dialog working
- [ ] Custom poster preview displayed
- [ ] Media gallery section added
- [ ] Event sponsors data refreshed after upload
- [ ] UI matches style guide
- [ ] Responsive design maintained

---

### Task Group 6: Testing & Validation

#### Task 6.1: Component Testing - Upload Dialogs
**Status**: Pending
**Priority**: Medium
**Dependencies**: Task 4.1, Task 4.2

**Description**: Test upload dialog components for all scenarios.

**Test Cases**:
1. **Drag-and-Drop**:
   - Drag valid image file to upload area
   - Drag invalid file type to upload area
   - Drag file larger than 10MB to upload area

2. **File Selection**:
   - Click file input button
   - Select valid image file
   - Select invalid file type
   - Select file larger than 10MB

3. **Upload Flow**:
   - Upload valid image file
   - Verify upload progress indicator
   - Verify success notification
   - Verify error handling

4. **Form Validation**:
   - Verify file type validation
   - Verify file size validation
   - Verify error messages displayed

**Acceptance Criteria**:
- [ ] All test cases pass
- [ ] Error messages clear and helpful
- [ ] Upload progress visible
- [ ] Success notification works
- [ ] Form resets on close

---

#### Task 6.2: Component Testing - Media Galleries
**Status**: Pending
**Priority**: Medium
**Dependencies**: Task 4.3, Task 4.4

**Description**: Test media gallery components for all scenarios.

**Test Cases**:
1. **Media Display**:
   - Verify media sorted by priority ranking
   - Verify thumbnails displayed
   - Verify empty state message
   - Verify loading state

2. **Priority Ranking**:
   - Update priority ranking
   - Verify media re-sorted after update
   - Verify validation (>= 0)

3. **Media Operations**:
   - Delete media file
   - View full-size image
   - Upload new media

**Acceptance Criteria**:
- [ ] All test cases pass
- [ ] Media sorted correctly
- [ ] Priority updates work
- [ ] Delete confirmation works
- [ ] Lightbox/modal works

---

#### Task 6.3: Integration Testing - Full Upload Flow
**Status**: Pending
**Priority**: High
**Dependencies**: All previous tasks

**Description**: Test complete upload flow from UI to backend.

**Test Cases**:
1. **Sponsor Image Upload**:
   - Upload logo image
   - Verify sponsor `logoUrl` updated in database
   - Verify media file stored in `event_media` table
   - Verify S3 path generated correctly

2. **Event-Sponsor Poster Upload**:
   - Upload custom poster
   - Verify `event_sponsors_join.custom_poster_url` updated
   - Verify media file stored in `event_media` table
   - Verify S3 path generated correctly

3. **Multiple Media Upload**:
   - Upload multiple sponsor media files
   - Verify all files stored with correct `priority_ranking`
   - Verify media gallery displays all files
   - Verify priority ranking updates work

**Acceptance Criteria**:
- [ ] All test cases pass
- [ ] Database updates correct
- [ ] S3 paths correct
- [ ] Media files accessible
- [ ] Priority ranking works

---

#### Task 6.4: Error Handling Testing
**Status**: Pending
**Priority**: Medium
**Dependencies**: All previous tasks

**Description**: Test error handling for all failure scenarios.

**Test Cases**:
1. **Network Errors**:
   - Simulate network failure during upload
   - Verify error message displayed
   - Verify user can retry

2. **Backend Errors**:
   - Simulate 400 Bad Request (invalid file)
   - Simulate 401 Unauthorized (JWT expired)
   - Simulate 500 Internal Server Error
   - Verify error messages displayed

3. **Validation Errors**:
   - Upload invalid file type
   - Upload file too large
   - Upload with missing required fields
   - Verify validation messages displayed

**Acceptance Criteria**:
- [ ] All error scenarios handled
- [ ] Error messages clear and helpful
- [ ] User can recover from errors
- [ ] No crashes or unhandled errors

---

## Dependencies & Prerequisites

### Backend Dependencies
- ✅ Backend implementation complete (all endpoints available)
- ✅ Database schema updated (fields added)
- ✅ S3 service configured
- ✅ JWT authentication working

### Frontend Dependencies
- ✅ Next.js 15+ installed
- ✅ React 18+ installed
- ✅ TypeScript configured
- ✅ Tailwind CSS configured
- ✅ UI component library available
- ✅ Existing API server actions pattern established
- ✅ Proxy handler pattern established

### External Dependencies
- ✅ AWS S3 bucket configured
- ✅ JWT credentials configured
- ✅ Tenant ID configured

---

## Success Criteria

### Functional Success
- [ ] All upload dialogs functional (logo, hero, banner, poster)
- [ ] Multiple media file uploads working
- [ ] Priority ranking system working
- [ ] Media galleries displaying correctly
- [ ] All API endpoints integrated
- [ ] Database updates correct
- [ ] S3 paths generated correctly

### Non-Functional Success
- [ ] UI matches style guide (sacred design system)
- [ ] Responsive design implemented
- [ ] Error handling robust
- [ ] Loading states handled
- [ ] Performance acceptable (< 5s upload, < 2s page load)
- [ ] Security enforced (authentication, tenant isolation)

### User Experience Success
- [ ] Drag-and-drop intuitive
- [ ] File preview helpful
- [ ] Upload progress visible
- [ ] Error messages clear
- [ ] Success notifications clear
- [ ] Priority ranking easy to manage

---

## Notes

### API Endpoint Reference
All API endpoints are documented in:
- **Swagger API Docs**: `documentation/Swagger_API_Docs/api-docs.json`
- **PRD**: `documentation/event_sponsors/PRD.md`

### UI Style Guide Reference
All UI components must follow:
- **UI Style Guide**: `@ui_style_guide.mdc`

### Code Patterns Reference
- **API Server Actions**: See `src/app/admin/executive-committee/ApiServerActions.ts`
- **Upload Dialogs**: See `src/app/admin/executive-committee/ImageUploadDialog.tsx`
- **Proxy Handlers**: See `src/pages/api/proxy/event-details/[...slug].ts`
- **Drag-and-Drop**: See `src/components/DragDropImageUpload.tsx`

### Database Schema Reference
- **Schema File**: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- **Key Tables**: `event_media`, `event_sponsors`, `event_sponsors_join`

---

## Task Generation Instructions

This document is structured for use with the task master system. Each task includes:
- **Task ID**: Unique identifier (e.g., Task 1.1, Task 2.1)
- **File Path**: Where the implementation should be done
- **Status**: Current status (Pending)
- **Priority**: High, Medium, or Low
- **Dependencies**: Other tasks that must be completed first
- **Description**: What needs to be implemented
- **Implementation Details**: How to implement it
- **Acceptance Criteria**: How to verify completion

To generate tasks from this document:
1. Use the task master system's `parse-prd` command with this file as input
2. Or manually create tasks using the structure provided
3. Follow the dependency chain when implementing (start with Task 1.1, then Task 2.1, etc.)

---

**End of Document**

