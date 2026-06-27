# PRD — Backend: tenant official documents, S3 paths, bulk upload

**Project:** `malayalees-us-site-boot`  
**Related:** `documentation/Enhanced_Upload_System_Documentation.md`

## Problem

- Today, non-event file uploads may land under `{profile}/media/{baseName}_...` without a **tenantId** path segment (`S3ServiceImpl.generateUniqueFilename`).
- There is **no** standard API to upload many files at once with a **shared folder/category** for S3 under  
  `prod/media/tenantId/{tenantId}/...`.
- `Enhanced_Upload_System_Documentation.md` lists **bulk upload** as a future enhancement.

## Goals

1. Store tenant-scoped official / miscellaneous documents under a **predictable prefix**, e.g.  
   `{profile}/media/tenantId/{tenantId}/official_document/{categorySlug}/{officialDocumentYear}/...`
2. Support **optional** `categorySlug` (admin-provided, server-slugified) for “directory” semantics (S3 has prefixes, not real folders).
   - In DB this is backed by tenant-scoped lookup rows in `public.official_document_category` via a stable `slug`.
3. Provide **bulk** upload (multiple `MultipartFile` in one request **or** document clear repeated single-upload semantics).
4. Persist metadata in existing **`event_media`** (or follow-up entity) with **`isEventManagementOfficialDocument`** where applicable.

## Non-goals (v1)

- Virus scanning pipeline (can be added later).
- Replacing all event-media paths for existing rows.

## Functional requirements

### FR1 — Path generation

- Given: `tenantId`, `categorySlug`, `officialDocumentYear`, original filename, active profile (`dev`/`prod`).
- When: upload is classified as **tenant official document** (not tied to an event).
- Then: S3 key must start with:  
  `{profile}/media/tenantId/{tenantId}/official_document/{categorySlug}/{officialDocumentYear}/`
- Slug rules: lowercase, `[a-z0-9-]`, max length TBD (e.g. 80), reject path traversal.
- Year rules: 4-digit integer (e.g. `2025`); reject empty/invalid when `isEventManagementOfficialDocument=true`.

### FR2 — API

- **Primary:** Either extend `POST /api/event-medias/upload` or add  
  `POST /api/event-medias/upload/tenant-official-document` with:
  - `file` (required)
  - `tenantId` (validated)
  - `categorySlug` or `category` (required for tenant-official flow)
  - `officialDocumentYear` (required for tenant-official flow)
  - `title`, `description`, `isPublic`, `isEventManagementOfficialDocument` (default true for this flow)
  - `eventId` omitted or null when using tenant library mode
- **Bulk:** `POST /api/event-medias/upload/bulk-tenant-official` with multiple files + shared `categorySlug` + optional per-file names in JSON part **or** repeated `files[]` parts.
  - Bulk also requires shared `officialDocumentYear`.
- **Thumbnails (v1):** Optional multipart `thumbnailFile` (image only) on single and bulk official-document uploads; optional `POST /api/event-medias/{id}/upload-official-document-thumbnail` to attach/replace after upload. See [thumbnail/README.md](./thumbnail/README.md).

### FR3 — Authorization

- Only **ADMIN** / **ORGANIZER** (define consistently with other admin uploads) may call the new/extended endpoints.
- Enforce tenant match with `TenantContextFilter` / `X-Tenant-ID`.

### FR4 — Database

- If `event_id` is NOT NULL in DB for all rows today, add migration to allow NULL for “tenant library” media **or** use a dedicated **system event** per tenant (less ideal). **Product/engineering must confirm.**

## Technical notes (code anchors)

- `EventMediaResource` — existing `upload` parameters include `isEventManagementOfficialDocument`.
- `S3ServiceImpl.generateUniqueFilename` — branch for `eventId > 0`, executive team, else flat `media/`; **new branch** for tenant official docs.
- `EventMediaServiceImpl.uploadFile` — wire new parameters into S3 call and entity mapping.

## Acceptance criteria

1. Uploading a PDF with `categorySlug=budget-2025-26` yields S3 key under  
   `{profile}/media/tenantId/{tenantId}/official_document/budget-2025-26/{officialDocumentYear}/...`
2. Existing event uploads without new flags behave as today (regression tests pass).
3. Bulk endpoint uploads N files under the same prefix and creates N `event_media` rows.
4. OpenAPI / internal API doc updated.

## Out of scope / follow-ups

- List/pagination endpoint specialized for “official documents only” (may use existing criteria `isEventManagementOfficialDocument.equals=true` + tenant).
