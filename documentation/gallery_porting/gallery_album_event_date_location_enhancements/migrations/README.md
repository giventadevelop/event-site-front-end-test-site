# Gallery album event date & location — SQL migrations

Apply in order after **gallery category & year** schema (see `documentation/gallery_album_category_year_enhancements/migrations/`).

| File | Purpose |
|------|---------|
| `001_gallery_album_event_date_location_schema.sql` | ADD columns + CHECK + index |
| `002_backfill_event_dates_mosc_static.sql` | Optional manual SQL backfill (sample rows) |
| `003_verify_event_date_migration.sql` | QA verification queries |
| `rollback_event_date_location_v1.sql` | Drop columns (dev only) |

## Recommended approach

1. Run **001** via Liquibase in `malayalees-us-site-boot` (or psql).
2. Deploy backend with `eventDateStart`, `eventDateEnd`, `eventLocation` on DTO.
3. Run Node backfill (preferred): `npm run gallery:backfill-event-dates` — see [data_migration_enhancements_prd.html](../data_migration_enhancements_prd.html).
4. Run **003** verification queries.

## PRD index

[generic_enhancement_prd.html](../generic_enhancement_prd.html)
