# Personal Profile Site — Documentation Index

Hand this folder to backend, frontend, and ops teams. **Frontend (`mosc-temp`) is implemented**; backend and batch-jobs repos still need the work below.

## Start here

| Audience | Document |
|----------|----------|
| **Everyone** | [personal_profile_site_prd.html](./personal_profile_site_prd.html) — goals, site types, repo map |
| **Backend API team** | [backend_event_site_manager_service_prd.html](./backend_event_site_manager_service_prd.html) — **primary implementation spec** |
| **Batch jobs team** | [backend_event_site_manager_batch_jobs_prd.html](./backend_event_site_manager_batch_jobs_prd.html) — shared-entity schema parity only |
| **DBA / Liquibase** | [personal_profile_database_schema.html](./personal_profile_database_schema.html) + [migrations/001_personal_profile_site.sql](./migrations/001_personal_profile_site.sql) |
| **Field reference** | [personal_profile_attribute_catalog.md](./personal_profile_attribute_catalog.md) |
| **REST summary** | [personal_profile_backend_api.html](./personal_profile_backend_api.html) |
| **Frontend (done)** | [personal_profile_frontend.html](./personal_profile_frontend.html) |
| **Pilot go-live** | [pilot_tenant_acceptance.md](./pilot_tenant_acceptance.md) |

## Repositories

| Repo | Role | Required for v1? |
|------|------|------------------|
| `mosc-temp` | Next.js app, proxies, admin CMS, public profile UI | Done |
| `event-site-manager-service` | Spring Boot REST API, Liquibase migrations, JPA entities | **Yes — blocks pilot** |
| `event-site-manager-batch-jobs` | Spring Batch jobs; shares PostgreSQL + some JPA entities | **Partial — schema parity on shared tables** |

Canonical SQL (all repos): `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`

Frontend DTO contract: `src/types/profileSite.ts`
