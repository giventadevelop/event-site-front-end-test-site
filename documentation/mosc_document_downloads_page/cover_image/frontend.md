# Frontend: official document cover (`official_document_year_bundle`)

## Current state (Next.js)

- **Admin bulk upload:** [`OfficialDocumentsClient.tsx`](../../../src/app/admin/official-documents/OfficialDocumentsClient.tsx) posts to `/api/proxy/event-medias/upload/bulk-tenant-official` with `files`, `categorySlug`, `officialDocumentYear`, etc.
- **Year bundle + cover:** Same page includes **Year bundle cover** — `fetchOfficialDocumentYearBundlesServer` on load; **Create year bundle** (`POST` via `createOfficialDocumentYearBundleServer`); **Save cover** (`PATCH` `coverEventMediaId`) choosing an image from `event_media` rows for the same category id + year (image types only).
- **Proxy:** [`official-document-year-bundles/index.ts`](../../../src/pages/api/proxy/official-document-year-bundles/index.ts) and [`[...slug].ts`](../../../src/pages/api/proxy/official-document-year-bundles/[...slug].ts) with `createProxyHandler({ backendPath: '/api/official-document-year-bundles' })` (slug route has `bodyParser: false` for PATCH).
- **Categories:** [`fetchOfficialDocumentCategoriesServer`](../../../src/app/admin/official-documents/ApiServerActions.ts) calls `GET /api/official-document-categories` (with 404 fallback).
- **Types:** [`OfficialDocumentCategoryDTO`](../../../src/types/index.ts), [`OfficialDocumentYearBundleDTO`](../../../src/types/index.ts), [`EventMediaDTO`](../../../src/types/index.ts).

## Target workflow (after backend ships)

1. User selects **category** + **year** (same as today).
2. **Optional:** **Create year bundle** — `POST /api/official-document-year-bundles` (or backend upsert if you add it later).
3. **Optional:** Set **cover** — pick an existing uploaded **image** `event_media` for that category+year → **`PATCH`** bundle with `coverEventMediaId`.
4. **Bulk upload** documents (multi-file / folder) as today; files link via existing official-document fields on `event_media`.

## Frontend work items

| Item | Status |
|------|--------|
| **DTO** | `OfficialDocumentYearBundleDTO` in `src/types/index.ts` (`coverEventMedia` optional nested for API display). |
| **Server actions** | `fetchOfficialDocumentYearBundlesServer`, `createOfficialDocumentYearBundleServer`, `patchOfficialDocumentYearBundleServer` in [`ApiServerActions.ts`](../../../src/app/admin/official-documents/ApiServerActions.ts) using `fetchWithJwtRetry` + `withTenantId` on POST. |
| **Proxy** | `official-document-year-bundles` index + `[...slug].ts` as above. |
| **Admin UI** | Year bundle panel on official documents page (create bundle, pick cover, thumbnail preview). |
| **Public downloads** | Optional: resolve cover from bundle for category+year cards when data-driven flag is on — **not** implemented here. |

## UX copy

The **Workflow & capabilities** panel describes the year bundle + cover flow and links to `documentation/mosc_document_downloads_page/cover_image/`.

## Constraints (from project rules)

- **No** `tenantId.equals` duplication in client calls to proxy where the handler injects it — follow [`nextjs_api_routes.mdc`](../../../.cursor/rules/nextjs_api_routes.mdc).
- Authenticated mutations: **server actions** + `fetchWithJwtRetry` for direct backend calls.
- Client components must not call backend URLs directly with raw `fetch` for protected APIs.

## Verification

- [x] Bundle list loads on server (`initialBundles`); client refreshes after create/PATCH.
- [x] PATCH updates cover; UI shows thumbnail when URLs are available (`router.refresh` + local state).
- [x] Bulk document upload unchanged for users who skip cover.
- [x] Folder / multi-file upload behavior unchanged ([`OfficialDocumentsClient`](../../../src/app/admin/official-documents/OfficialDocumentsClient.tsx)).
