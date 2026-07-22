# Personal Profile Site — Documentation Index

Hand this folder to backend, frontend, and ops teams. **Frontend (`mosc-temp`) Phase A/B and Audience CRM are implemented.** Backend Phase B (booking / projects / media_kind) is implemented in `event-site-manager-service` — **deploy so Liquibase 003 applies**.

## Start here

| Audience | Document |
|----------|----------|
| **Everyone** | [personal_profile_site_prd.html](./personal_profile_site_prd.html) — goals, site types, repo map |
| **Audience CRM v2** | [personal_profile_audience_crm_prd.html](./personal_profile_audience_crm_prd.html) — capture, import, bulk email |
| **Backend API team** | [backend_event_site_manager_service_prd.html](./backend_event_site_manager_service_prd.html) — **primary implementation spec** |
| **Batch jobs team** | [backend_event_site_manager_batch_jobs_prd.html](./backend_event_site_manager_batch_jobs_prd.html) — shared entities + `PROFILE_AUDIENCE` email batch |
| **DBA / Liquibase** | [personal_profile_database_schema.html](./personal_profile_database_schema.html) + [migrations/001_personal_profile_site.sql](./migrations/001_personal_profile_site.sql) + [migrations/002_profile_audience_contact.sql](./migrations/002_profile_audience_contact.sql) + [migrations/003_profile_booking_projects_media_kind.sql](./migrations/003_profile_booking_projects_media_kind.sql) |
| **Field reference** | [personal_profile_attribute_catalog.md](./personal_profile_attribute_catalog.md) |
| **REST summary** | [personal_profile_backend_api.html](./personal_profile_backend_api.html) + [personal_profile_audience_backend_api.html](./personal_profile_audience_backend_api.html) |
| **Frontend (done)** | [personal_profile_frontend.html](./personal_profile_frontend.html) + [personal_profile_audience_frontend.html](./personal_profile_audience_frontend.html) |
| **Build loops** | [personal_profile_iterative_loops.html](./personal_profile_iterative_loops.html) — Loops 0–9 |
| **Pilot go-live** | [pilot_tenant_acceptance.md](./pilot_tenant_acceptance.md) |
| **Task Master PRD** | [profile_audience_crm_prd.txt](./profile_audience_crm_prd.txt) |

## Repositories

| Repo | Role | Required for v1? |
|------|------|------------------|
| `mosc-temp` | Next.js app, proxies, admin CMS, public profile UI, Audience tab | Done |
| `event-site-manager` | Multi-tenant admin; Audience tab parity | Done |
| `event-site-manager-service` | Spring Boot REST API, Liquibase migrations, JPA entities | **Deploy Phase B Liquibase + `/api/profile-projects`** |
| `event-site-manager-batch-jobs` | Spring Batch; `PROFILE_AUDIENCE` email; Phase B = SQL mirror only | **Yes for bulk send**; no Java for Phase B |

Canonical SQL (all repos): `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`

Build script (v2): `scripts/build-profile-audience-v2.ps1`

Frontend DTO contract: `src/types/profileSite.ts`
