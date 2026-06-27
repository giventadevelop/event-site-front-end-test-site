# Official document cover image (option B)

This folder documents the **`official_document_year_bundle`** table and the end-to-end workflow for a **per–category + per–year** cover image on the MOSC / Church Resources downloads flow.

| Document | Audience |
|----------|----------|
| [backend.md](./backend.md) | Spring/JHipster API, Liquibase/Flyway, DBAs |
| [frontend.md](./frontend.md) | Next.js app (`/admin/official-documents`, public downloads) |

**Canonical schema (full rebuild):**  
`code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql` — includes `CREATE TABLE public.official_document_year_bundle` and `DROP` / `sequence_generator` updates.

**Incremental migration (existing database):**  
Use [migration_official_document_year_bundle.sql](./migration_official_document_year_bundle.sql) once per environment (review before apply).

## Troubleshooting

**`ERROR: there is no unique constraint matching given keys for referenced table "event_media"`** — Foreign keys require `event_media.id` to be a primary key (or unique). The canonical schema now includes `CONSTRAINT event_media_pkey PRIMARY KEY (id)` on `event_media`. Older dumps may omit it; the incremental [migration_official_document_year_bundle.sql](./migration_official_document_year_bundle.sql) adds the PK first if missing. If `ALTER TABLE ... ADD PRIMARY KEY` fails, check for duplicate `id` values in `event_media`.

## Intended workflow

1. Ensure `official_document_category` rows exist for the tenant.
2. **Upsert** an `official_document_year_bundle` row for `(tenant_id, official_document_category_id, document_year)` (create bundle “entity”).
3. Upload or pick **cover** media → set `cover_event_media_id` (FK to `event_media`).
4. Bulk-upload **document** files as today (`event_media` with `is_event_management_official_document`, category, year).

Cover is optional (`cover_event_media_id` nullable) until content is ready.
