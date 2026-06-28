# Downloads migration scripts (documentation folder)

These wrappers run the **canonical** scripts under `scripts/mosc-in-migration/` from the **mosc-temp repository root**, so you can invoke them from this documentation folder without changing directory manually.

## Prerequisites

- Node.js 20+
- Repo root `.env.local` with `NEXT_PUBLIC_TENANT_ID`, `API_JWT_USER`, `API_JWT_PASS`, `NEXT_PUBLIC_API_BASE_URL`
- Local Postgres (Docker) or RDS credentials via `MOSC_DB_*` env vars
- Spring Boot backend on `:8080` for upload steps

## Recommended `.env.local` (local Docker)

```env
NEXT_PUBLIC_TENANT_ID=mosc_malankara_orthodox_2
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
MOSC_DOWNLOAD_ROOT=f:\project_workspace\mosc-temp\mosc_downloads
MOSC_DB_HOST=localhost
MOSC_DB_NAME=event_site_manager_db
MOSC_DB_USER=postgres
MOSC_DB_PASSWORD=postgres
```

## Run from this folder

```powershell
cd F:\project_workspace\mosc-temp\documentation\mosc_redesign\downloads_malankara_association\scripts
node run-seed-categories.mjs
node list-missing-categories.mjs
node seed-manifest-categories.mjs
node seed-extra-categories.mjs
node seed-charge-category.mjs
```

Or use npm from repo root (preferred):

```powershell
cd F:\project_workspace\mosc-temp
npm run mosc:migration:seed:categories
npm run mosc:migration:list:missing-categories
```

## Full pipeline (PowerShell)

```powershell
.\run-full-pipeline.ps1 -Step seed
.\run-full-pipeline.ps1 -Step all
```

Steps: `seed`, `covers`, `manifest`, `fetch`, `upload-dry`, `upload`, `all`.

## Canonical script locations

| Wrapper (this folder) | Canonical path |
|----------------------|----------------|
| `run-seed-categories.mjs` | `scripts/mosc-in-migration/run-seed-categories.mjs` |
| `seed-manifest-categories.mjs` | `scripts/mosc-in-migration/seed-manifest-categories.mjs` |
| `seed-extra-categories.mjs` | `scripts/mosc-in-migration/seed-extra-categories.mjs` |
| `seed-charge-category.mjs` | `scripts/mosc-in-migration/seed-charge-category.mjs` |
| `list-missing-categories.mjs` | `scripts/mosc-in-migration/list-missing-categories.mjs` |

Manifest builders, fetch, and upload live only under `scripts/mosc-in-migration/` — see [full_downloads_migration_session_june_2026.html](../full_downloads_migration_session_june_2026.html).
