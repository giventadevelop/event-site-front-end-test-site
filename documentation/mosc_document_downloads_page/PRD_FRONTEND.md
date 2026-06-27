# PRD — Frontend: admin bulk official documents & downloads UX

**Project:** `mosc-temp` (Next.js)

## Problem

- `/mosc-redesign/downloads` uses many **placeholder** links (`#`) and alerts instead of real file URLs — see `src/app/mosc-redesign/(syro)/downloads/page.tsx`.
- `/admin/media` is **event-centric** and does not let admins specify a **tenant media subfolder** like `official_document/{categorySlug}/{year}` for non-event content.
- Localhost cannot “download” what was never uploaded or linked.

## Goals

1. **Admin:** New experience to upload **multiple files** in one batch with a **category/folder name** (tenant `public.official_document_category.slug`) and a **year** that maps to the S3 prefix `official_document/{categorySlug}/{year}`.
2. **Public:** Downloads section can load **document cards** from API (title, description, `fileUrl`, category, year) instead of a static array.
3. Follow project rules: **server actions** / `ApiServerActions.ts` for authenticated mutations; **proxy** routes for backend; **`fetchWithJwtRetry`** where applicable.

## User stories

### US1 — Admin bulk upload

- As a tenant admin, I open **Official documents** (or a new subsection under Media).
- I enter **Category / folder name** (e.g. “GST 2025”).
- I enter **Year** (e.g. `2025`).
- I select **multiple files** and submit.
- I see progress and a summary of successes/failures.
- Documents appear in a list with filter by category and year.

### US2 — Public downloads

- As a visitor, I open `/mosc-redesign/downloads` (or a subpage).
- I see resources with working **Download** links pointing to stored files (or presigned URLs).
- Placeholder `#` links are removed once data exists.

## UI placement

- **Option A:** New route `src/app/admin/official-documents/` with list + upload (recommended for clarity).
- **Option B:** Tab on `src/app/admin/media/page.tsx` — “Tenant documents” vs “Event media”.

Follow existing admin styling (button groups, action buttons patterns in `.cursor/rules`).

## Frontend architecture

| Layer | Responsibility |
|-------|------------------|
| `ApiServerActions.ts` (feature folder) | `uploadTenantOfficialDocumentsServer`, `listOfficialDocumentsServer` — call `getAppUrl()` + `/api/proxy/...` or direct backend per project rules |
| Proxy | Ensure `src/pages/api/proxy/event-medias/[...slug].ts` (or index) forwards multipart correctly; `bodyParser: false` for dynamic slug if needed |
| Public page | Server component fetch of document list (or client fetch to public proxy GET if unauthenticated catalog is required — align with middleware `publicRoutes`) |

## Backend API contract (implemented — `malayalees-us-site-boot`)

These endpoints live on the Spring Boot app under **`/api/event-medias`**. The Next.js app should call them **via your existing proxy** (e.g. `/api/proxy/...`) with JWT + tenant headers — **not** by exposing `NEXT_PUBLIC_API_BASE_URL` to the browser for protected uploads.

### Authentication and tenant

| Requirement | Notes |
|-------------|--------|
| **JWT** | `Authorization: Bearer <token>` — user must resolve to **`ROLE_ADMIN`** in Spring Security. |
| **Tenant** | **`X-Tenant-ID`** must be set and must **exactly match** the multipart field **`tenantId`**. If they differ, the API returns **400** (`tenantmismatch`). If tenant context is missing, **400** (`tenantrequired`). |

### Category slug and year

- **`categorySlug`**: Must correspond to an existing row in `public.official_document_category` for **`(tenant_id, slug)`**. The backend normalizes the slug (lowercase, `[a-z0-9-]`, max length 80, rejects `..` and path separators). If unknown, **400** (`invalidcategory`).
- **`officialDocumentYear`**: Four-digit year (e.g. `2025`). Invalid range → **400** (`invalidyear`).

### Response shape

Both endpoints return **`EventMediaDTO`** (single) or **`EventMediaDTO[]`** (bulk). Relevant fields for downloads/admin lists:

- `eventMediaType`: `"TENANT_OFFICIAL_DOCUMENT"` for these uploads  
- `isEventManagementOfficialDocument`: `true`  
- `eventId`: `null` (tenant library, not tied to an event)  
- **`officialDocumentCategoryId`**, **`officialDocumentYear`**: persisted for filtering/list UIs  
- `fileUrl`, `preSignedUrl`: as for other `event_media` rows  

---

### 1) Single file — `POST /api/event-medias/upload/tenant-official-document`

- **Content-Type:** `multipart/form-data`
- **Path (full):** `POST /api/event-medias/upload/tenant-official-document`

| Part / field | Required | Description |
|--------------|----------|-------------|
| `file` | Yes | One file (PDF, image, etc.). |
| `tenantId` | Yes | Must match `X-Tenant-ID`. |
| `categorySlug` | Yes | Lookup key in `official_document_category.slug` (after normalization). |
| `officialDocumentYear` | Yes | Integer, e.g. `2025`. |
| `title` | Yes | Display title for this document. |
| `description` | No | Optional description. |
| `isPublic` | No | Defaults to `false` if omitted. |

**Success:** HTTP **200** with body = single `EventMediaDTO`.

---

### 2) Bulk files — `POST /api/event-medias/upload/bulk-tenant-official`

- **Content-Type:** `multipart/form-data`
- **Path (full):** `POST /api/event-medias/upload/bulk-tenant-official`

| Part / field | Required | Description |
|--------------|----------|-------------|
| `files` | Yes | **Multiple** parts with the **same name** `files` (standard multipart array). All must be non-empty. |
| `tenantId` | Yes | Must match `X-Tenant-ID`. |
| `categorySlug` | Yes | Same semantics as single upload. |
| `officialDocumentYear` | Yes | Shared year for the whole batch. |
| `titlePrefix` | No | Prefix for generated titles; backend defaults if omitted (e.g. `"Official Document"`). Each row’s title is typically `titlePrefix + " - " + originalFilename`. |
| `description` | No | Shared description for all rows. |
| `isPublic` | No | Defaults to `false` if omitted. |

**Success:** HTTP **200** with body = **array** of `EventMediaDTO` (one per file).

---

### How the frontend should call these (suggestions)

1. **Prefer a Server Action or Route Handler** that builds `FormData` and forwards to the proxy URL your project already uses for `event-medias`, so the Clerk/session JWT and `X-Tenant-ID` stay server-side or flow through your proxy consistently.

2. **Set headers on every request:**
   - `Authorization: Bearer <token>`
   - `X-Tenant-ID: <same as tenantId field>`

3. **Do not** hand-craft JSON for these endpoints — they are **multipart only**. Example shape in browser/Node:

   ```ts
   const form = new FormData();
   form.append("tenantId", tenantId);
   form.append("categorySlug", categorySlug);
   form.append("officialDocumentYear", String(year)); // or number per fetch implementation
   form.append("title", title);
   // optional: form.append("description", ...); form.append("isPublic", "true");
   form.append("file", file);

   await fetch(proxyUrl, {
     method: "POST",
     headers: {
       Authorization: `Bearer ${token}`,
       "X-Tenant-ID": tenantId,
       // do NOT set Content-Type; let the browser set multipart boundary
     },
     body: form,
   });
   ```

   For **bulk**, append each file with the same field name:

   ```ts
   for (const f of files) {
     form.append("files", f);
   }
   ```

4. **Proxy route:** Ensure the Next.js API route that proxies to Spring forwards:
   - Raw **multipart** body (do not parse/re-stringify JSON).
   - `Authorization` and `X-Tenant-ID` headers upstream.

5. **Listing documents for the admin UI / public downloads:** Use **`GET /api/event-medias`** with existing JHipster-style criteria where supported (e.g. `tenantId`, `isEventManagementOfficialDocument.equals=true`). Response `EventMediaDTO` rows from these uploads include **`officialDocumentCategoryId`** and **`officialDocumentYear`** — filter in the UI or add server-side criteria filters in a follow-up if you need `officialDocumentYear.equals=` style query params.

## Acceptance criteria

1. Admin can upload ≥2 files in one batch with one category and one year; backend receives all files and stores `event_media.official_document_category_id` + `event_media.official_document_year`.
2. No direct `fetch` to `NEXT_PUBLIC_API_BASE_URL` from client components for protected operations.
3. Downloads page can be switched to **data-driven** rendering behind a feature flag or env.
4. Types: reuse / extend `EventMediaDTO` from `@/types`; no duplicate DTOs in handlers.

## Scraping / migration (frontend role)

- **Not** implemented inside the Next.js app for end users.
- Ops/content: one-off script downloads from mosc.in; then **admin bulk upload** ingests into S3. Document the script location in `IMPLEMENTATION_PLAN.md` when created.

## Dependencies

- Backend PRD: [PRD_BACKEND.md](./PRD_BACKEND.md) — tenant lookup table `public.official_document_category` + category/year S3 path + bulk API availability.
