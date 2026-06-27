# Implementation plan: official documents, S3 layout, and downloads mirroring

## Current state (verified)

### Frontend (`mosc-temp`)

- **Downloads hub:** `src/app/mosc-redesign/(syro)/downloads/page.tsx` — static `downloadItems` array; most `link` values are `'#'` with a client-side alert (“available soon”). Sub-routes exist for some sections (e.g. `application-forms`, `pdfs`, `photos`).
- **Admin media:** `src/app/admin/media/page.tsx` — manages `EventMediaDTO` including **`isEventManagementOfficialDocument`**. Upload flow is tied to **event selection** and existing proxy → backend upload endpoints.
- **Gap:** No admin screen dedicated to **tenant-level official documents** with **custom S3 subfolders** (e.g. `official-uploads/2025-budget`) and **bulk multi-file** upload in one action.

### Backend (`malayalees-us-site-boot`)

- **Upload:** `POST /api/event-medias/upload` (multipart) — see `EventMediaResource.java`. Supports `isEventManagementOfficialDocument` and stores metadata on `EventMedia` / S3 user metadata.
- **S3 layout** (`S3ServiceImpl.generateUniqueFilename`):
  - **Event-scoped:** `{profile}/events/tenantId/{tenantId}/event-id/{eventId}/event_media_{ts}_{uuid}.{ext}`
  - **Executive team (special flag):** `{profile}/media/tenantId/{tenantId}/executive-team-members/...`
  - **Other non-event uploads:** `{profile}/media/{baseName}_{ts}_{uuid}.{ext}` — **no `tenantId` segment** in the path (only in DB via DTO).
- **Enhanced upload doc** explicitly lists **bulk upload** under *Future Enhancements* — **not implemented** as a first-class API today.

### Why production vs localhost differs

- **mosc.in** serves real document URLs; the Next.js redesign page is a **UI shell** until each item is wired to `fileUrl` (or external URL) from the backend or static hosting.
- Local “Download” buttons on `#` placeholders will never download a file until links and assets exist.

---

## Target S3 layout (proposal)

Align with your example bucket prefix pattern:

`{profile}/media/tenantId/{tenantId}/...`

Proposed **non-event**, tenant-scoped tree for church official / miscellaneous uploads:

```
{profile}/media/tenantId/{tenantId}/official_document/{categorySlug}/{officialDocumentYear}/{sanitizedFileName}_{timestamp}_{uuid}.{ext}
```

Optional parallel roots if product prefers separation:

- `.../miscellaneous/{categorySlug}/{officialDocumentYear}/...`
- `.../official-uploads/{categorySlug}/{officialDocumentYear}/...`

**Rules:** `categorySlug` and `officialDocumentYear` come from validated admin inputs; `categorySlug` must match an active row in `public.official_document_category.slug`, and S3 paths reject `..`, absolute paths, and empty segments.

---

## Phase 1 — Backend (Spring Boot)

1. **Extend S3 path generation** (or add `uploadOfficialDocumentPath` in `S3Service`):
   - When `eventId` is null/0 **and** parameters `storageCategory` (or `folderSlug`) and `officialDocumentYear` are present, write under  
     `{profile}/media/tenantId/{tenantId}/official_document/{categorySlug}/{officialDocumentYear}/...`
   - Keep existing behaviors unchanged for current clients.

2. **API options** (pick one primary):
   - **A (recommended):** Extend existing `POST /api/event-medias/upload` with optional `storageCategory` / `folderSlug` validated and applied only when `eventId` is absent and a new flag e.g. `isTenantOfficialDocumentUpload=true`.
   - **B:** New dedicated endpoint `POST /api/event-medias/upload/tenant-official-document` with explicit `categorySlug` — clearer contract, easier to secure.

3. **Bulk upload:**
   - **Option A:** New endpoint `POST /api/event-medias/upload/bulk` — `multipart/form-data` with multiple files + shared metadata (same category, title prefix, tenant).
   - **Option B:** Loop single-file uploads from the admin client (simpler backend, more round-trips).

4. **Persistence:** Each file still creates an `event_media` row (or future dedicated entity if you want to decouple from events). If staying with `EventMedia`:
   - `eventId` nullable or sentinel for “tenant library” rows — confirm DB constraint and existing queries filter correctly.
   - Set `isEventManagementOfficialDocument=true` where appropriate.
   - Populate the official-document fields on the row (category FK + year): `official_document_category_id` (from `public.official_document_category`) and `official_document_year`.

5. **Security:** Admin-only (role check), JWT, tenant from `X-Tenant-ID` / DTO `tenantId` alignment with existing filters.

---

## Phase 2 — Frontend admin (`mosc-temp`)

1. New route e.g. **`/admin/official-documents`** (or extend `/admin/media` with a “Tenant documents” mode):
   - **Folder/category name** (single text field per batch) → maps to `categorySlug`.
   - **Multi-file** input; optional title/description per file or shared defaults.
   - Use **`ApiServerActions.ts`** pattern + proxy to new/extended backend endpoint(s); no direct client calls to backend base URL.

2. **List / filter** by `isEventManagementOfficialDocument`, `storageCategory`, date — reuse proxy `event-medias` criteria API.
   - In DB terms this maps to `event_media.official_document_category_id` (join via `official_document_category.slug`) and `event_media.official_document_year`.

---

## Phase 3 — Public downloads pages

1. **Data-driven downloads:** Replace or augment static `downloadItems` with content from API (or CMS) — categories, titles, `fileUrl`, sort order.
   - Public cards should also render the `year` segment, since S3 paths are `official_document/{categorySlug}/{year}/...`.
2. **Link strategy:** Prefer **signed URLs** or public CloudFront URLs depending on bucket policy; match existing `EventMedia` / presign behavior.
3. **Scraping mosc.in (one-time migration):**
   - Run a **standalone script** (Node/Python) outside the web app: fetch HTML, extract `<a href>` to PDFs/images, download to disk with folder names per section.
   - **Do not** scrape from the browser in production users’ sessions; respect **robots.txt**, **copyright**, and **rate limits**.
   - After files are local, use **admin bulk upload** to push to S3 under the agreed categories.

---

## Phase 4 — Documentation and handoff

- Backend team: implement using [PRD_BACKEND.md](./PRD_BACKEND.md).
- Frontend team: implement using [PRD_FRONTEND.md](./PRD_FRONTEND.md).
- Update `Enhanced_Upload_System_Documentation.md` in the backend repo once APIs are final.

---

## Risks and decisions

| Topic | Decision needed |
|-------|-----------------|
| `EventMedia` without `eventId` | Confirm JPA/DB allows null; adjust list endpoints so tenant library docs appear. |
| Duplicate titles | Uniqueness: S3 key already unique; UI may show duplicate labels. |
| Large PDFs | Max size, timeout, API Gateway / Lambda limits if applicable. |
| Legal | Rights to copy mosc.in assets into your bucket. |
