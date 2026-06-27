# Gallery Category & Year — SQL Migrations

Incremental scripts for **M1–M5** from [data_migration_enhancements_prd.html](../data_migration_enhancements_prd.html).

Canonical full schema (greenfield): `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`

## Apply order

| File | Phase | Purpose |
|------|-------|---------|
| `001_gallery_category_schema.sql` | M1 | DDL: `gallery_category` table + `gallery_album` columns |
| `002_seed_gallery_category.sql` | M2 | Seed 8 category rows per tenant |
| `003_import_mosc_static_albums_metadata.sql` | M4 (optional) | Insert 29 MOSC static albums (metadata only) |
| `004_backfill_gallery_album_category_year.sql` | M3 | UPDATE existing albums by title / static_slug |
| `005_verify_gallery_category_migration.sql` | M5 | Verification queries |
| `rollback_gallery_category_v1.sql` | — | Reverse M1 (destructive) |

## psql example

```bash
psql "$DATABASE_URL" -v tenant_id=tenant_demo_002 -f 001_gallery_category_schema.sql
psql "$DATABASE_URL" -v tenant_id=tenant_demo_002 -f 002_seed_gallery_category.sql
psql "$DATABASE_URL" -v tenant_id=tenant_demo_002 -f 003_import_mosc_static_albums_metadata.sql
psql "$DATABASE_URL" -v tenant_id=tenant_demo_002 -f 004_backfill_gallery_album_category_year.sql
psql "$DATABASE_URL" -v tenant_id=tenant_demo_002 -f 005_verify_gallery_category_migration.sql
```

Replace `tenant_demo_002` with your `NEXT_PUBLIC_TENANT_ID` (MOSC production tenant when ready).

## Notes

- Scripts use psql `:tenant_id` / `-v tenant_id=...` binding.
- `003` skips inserts when an album with the same title already exists for the tenant.
- `003` stores `static_slug=<id>` in `description` for v1.0 View Album route mapping until `album.slug` column (v1.1).
- Full photo import into `event_media` is out of scope for v1.0; use admin media UI after album rows exist.
