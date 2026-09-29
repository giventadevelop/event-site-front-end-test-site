# SQL export / import guardrails

Prevents truncated dumps and schema lag from wiping lookup/config data during refresh.

## Files

- `sql_export_import_guardrails.manifest.json` — mins, critical tables, tracked tables, schema-sync list
- `backups/` — last **5** timestamped copies per file (gitignored), named `yyyy-MM-ddTHH-mm-ss-sssZ__<basename>.sql`:
  - `export.sql`
  - `corrected_event_media_inserts.ordered.sql`
  - `corrected_event_media_inserts.renumbered.sql` (local import file)
  - `corrected_event_media_inserts.ordered_PROD.sql`
  - `Event_Site_Manager_Latest_Schema.sql` (canonical schema)
- Script: `mosc-temp/scripts/sql_export_import_guardrails.cjs`
- Canonical schema (live): `Current_Sqls/Event_Site_Manager_Latest_Schema.sql`
- One-time rename archive (not the rotating 5): `Current_Sqls/archive/*__yyyy-MM-dd_HHmmss.sql`

## Tightened checks (v2)

- `failOnMissingTrackedTables: true` — any tracked table with **0** INSERTs fails
- `schemaColumnSyncTables: ["*"]` — **every** table with INSERTs must have matching columns in `Event_Site_Manager_Latest_Schema.sql`
- Critical table minimum row counts still apply

## Wired into

`code_html_template/batch_files/database_export_import_refresh.bat`  
Phases: `backup` → `post-export` → `post-prepare` → `pre-import` (before schema apply).

Emergency bypass: `/SKIP-GUARDRAILS`

## New tables

1. Export successfully once with the new table present  
2. `node scripts/sql_export_import_guardrails.cjs update-manifest`  
3. Commit the updated manifest (and schema SQL if Liquibase added columns)
