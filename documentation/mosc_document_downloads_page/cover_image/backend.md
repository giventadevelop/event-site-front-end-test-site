# Backend: `official_document_year_bundle` (cover image per category + year)

## Purpose

Support **option B**: a dedicated row per **(tenant, official document category, calendar year)** with an optional **`cover_event_media_id`** pointing at an `event_media` row used as the **thumbnail / cover** for that slice of the library (e.g. MOSC downloads tiles, admin preview).

This avoids overloading `official_document_category` alone (which would be only one cover for all years).

## Database

**Table:** `public.official_document_year_bundle`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `bigint` | PK, `DEFAULT nextval('public.sequence_generator')` |
| `tenant_id` | `varchar(255)` | NOT NULL |
| `official_document_category_id` | `bigint` | NOT NULL → `official_document_category(id)` **ON DELETE CASCADE** |
| `document_year` | `integer` | NOT NULL, CHECK 1900–2100; aligns with `event_media.official_document_year` |
| `cover_event_media_id` | `bigint` | NULL → `event_media(id)` **ON DELETE SET NULL** |
| `created_at` / `updated_at` | `timestamp` | NOT NULL, default `now()`; trigger updates `updated_at` |

**Unique:** `UNIQUE (tenant_id, official_document_category_id, document_year)` — at most one bundle per tenant/category/year.

**Indexes:** `idx_official_document_year_bundle_tenant_category_year` on `(tenant_id, official_document_category_id, document_year)`.

### Prerequisite: `event_media` must have a primary key on `id`

PostgreSQL only allows `FOREIGN KEY ... REFERENCES public.event_media(id)` if **`id` is part of a PRIMARY KEY or UNIQUE constraint** on `event_media`. Some older SQL dumps defined `event_media` with **`NOT NULL`** on `id` but **no `PRIMARY KEY`**, which caused:

`ERROR: there is no unique constraint matching given keys for referenced table "event_media"`

**What you need on the backend / DBA side:**

| Area | Action |
|------|--------|
| **Database** | Ensure `public.event_media` has **`CONSTRAINT event_media_pkey PRIMARY KEY (id)`** (or equivalent). The canonical app schema file `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql` includes this; the incremental script `documentation/mosc_document_downloads_page/cover_image/migration_official_document_year_bundle.sql` adds the PK first if it is missing, then creates `official_document_year_bundle`. |
| **Liquibase / Flyway (if separate from this repo)** | Add a changelog that runs **`ALTER TABLE event_media ADD CONSTRAINT event_media_pkey PRIMARY KEY (id);`** only when the constraint does not exist, *before* any migration that creates `official_document_year_bundle`. If `ADD PRIMARY KEY` fails, fix **duplicate `id`** rows in `event_media` first (data issue). |
| **JPA / Hibernate** | No change required for **`EventMedia`** beyond what you already have: **`@Id` on `Long id`** is standard and matches a single-column PK. **`OfficialDocumentYearBundle`** should map `cover_event_media_id` as **`@ManyToOne(optional = true)`** to `EventMedia` (or `Long coverEventMediaId` with optional `@ManyToOne`). Hibernate expects the referenced column to be the PK in typical mappings—your DB must match. |
| **Spring Data REST** | No change specific to the PK; exposing `EventMedia` by id already assumes a unique identifier. |
| **API contract** | None; `coverEventMediaId` in JSON still refers to **`event_media.id`**. The PK is a database integrity requirement, not a new field. |

**Summary:** If your database already matched the updated canonical schema (PK on `event_media`), **no extra backend Java code** is required solely because of the PK fix. If your **deployed** database was created from an older dump **without** PK on `event_media`, you **must** apply the PK (via migration above) **before** creating `official_document_year_bundle`—otherwise the bundle table’s FK cannot be created.

## Business rules (recommended)

1. **Tenant consistency:** `tenant_id` on the bundle should match the category’s tenant and, when set, the cover media’s `tenant_id`.
2. **Cover media validity:** `cover_event_media_id` (if set) should reference a row that is appropriate for display (e.g. image `event_media_type`, same `tenant_id`, and ideally `is_event_management_official_document = true` with matching `official_document_category_id` and `official_document_year`). Enforce in service layer or DB trigger if needed (optional).
3. **Upsert:** Creating a bundle before files exist is valid (`cover_event_media_id` NULL). Upload documents afterward as today via existing bulk official-document APIs.

## REST API (suggested)

Expose the resource as Spring Data REST or a dedicated controller under a stable path, consistent with existing resources:

- **Collection:** `GET /api/official-document-year-bundles`  
  - Criteria: `tenantId.equals`, optional `officialDocumentCategoryId.equals`, optional `documentYear.equals`, sort e.g. `documentYear,desc`.
- **Single:** `GET /api/official-document-year-bundles/{id}`
- **Create:** `POST /api/official-document-year-bundles`  
  - Body: `tenantId`, `officialDocumentCategoryId`, `documentYear`, optional `coverEventMediaId` (omit or null if no cover yet).
- **Update (PATCH):** `PATCH /api/official-document-year-bundles/{id}`  
  - Patch `coverEventMediaId` after uploading cover file to `event_media`.
- **Delete:** `DELETE /api/official-document-year-bundles/{id}` if needed (CASCADE from category already removes bundles when category is deleted).

Use **JHipster criteria** query style: `tenantId.equals`, `officialDocumentCategoryId.equals`, etc.

**Auth:** Same JWT + `X-Tenant-ID` pattern as `/api/official-document-categories` and `/api/event-medias`.

## Bulk upload integration (optional enhancement)

Current flow: `POST .../event-medias/upload/bulk-tenant-official` with multipart `files`, `categorySlug`, `officialDocumentYear`, etc.

Optional enhancements:

1. **Auto-upsert bundle:** On successful bulk upload, `INSERT ... ON CONFLICT DO NOTHING` (or service upsert) for `(tenant, category_id, year)` so a bundle row always exists for admin UI.
2. **Separate cover upload:** Accept optional `coverFile` in a dedicated endpoint **or** require: upload cover as first `event_media`, then `PATCH` bundle with `coverEventMediaId`.

Coordinate with frontend (see [frontend.md](./frontend.md)).

## Verification checklist

- [ ] **`event_media`** has **`PRIMARY KEY (id)`** (or bundle migration / FK creation will fail).
- [ ] Table exists (or migration applied) and FKs to `official_document_category` and `event_media` work.
- [ ] Unique constraint prevents duplicate tenant/category/year.
- [ ] `GET` list filtered by `tenantId.equals` returns bundles for downloads/admin.
- [ ] `PATCH` can set/clear `coverEventMediaId`.
- [ ] `sequence_generator` remains safe after inserts (see canonical schema `setval` block).

## Copy-paste prompt (for AI / team)

Implement Spring Data REST (or REST controller) for entity **`OfficialDocumentYearBundle`** mapped to table **`official_document_year_bundle`** with fields: `id`, `tenantId`, `officialDocumentCategory` (ManyToOne), `documentYear`, `coverEventMedia` (ManyToOne optional to `EventMedia`), `createdAt`, `updatedAt`. Expose **`/api/official-document-year-bundles`** with criteria **`tenantId.equals`**, **`officialDocumentCategoryId.equals`**, **`documentYear.equals`**, pagination and sort. Enforce unique **(tenantId, categoryId, documentYear)**. Use existing JWT and tenant filter. After upload of official documents, optionally upsert a bundle row for that tenant/category/year so the UI can attach a cover via PATCH.

**Database prerequisite:** Ensure **`event_media`** has **`PRIMARY KEY (id)`** before creating **`official_document_year_bundle`** (FK `cover_event_media_id` → `event_media(id)`). If the DB was created from an older dump without that PK, run a migration that adds **`event_media_pkey`** first; resolve any duplicate `id` values in `event_media` if `ADD PRIMARY KEY` fails.
