# Backend & Batch Job Integration Prompt: Social Media URL Fields

**Use this prompt in the backend project** (`E:\project_workspace\malayalees-us-site-boot`) **and in the batch job project** to integrate the new/updated social media URL fields. The frontend project is at `E:\project_workspace\mosc-temp` and the schema has already been updated there.

---

## Copy-paste prompt for backend (Java/JHipster) and batch job projects

```
Integrate the following schema changes into this Java/JHipster backend (and batch job if it shares or references these entities). The PostgreSQL schema has been updated in the frontend repo; this backend must stay in sync.

## Tables and new/updated columns

All social media URL columns are **varchar(1024) NULL**. Use the same type in entities (e.g. String, max length 1024, nullable).

### 1. tenant_settings

Ensure the entity has exactly these six social URL fields (add any that are missing; align names and types):

- facebook_url   varchar(1024) NULL
- instagram_url  varchar(1024) NULL
- twitter_url    varchar(1024) NULL  -- X (Twitter)
- linkedin_url   varchar(1024) NULL
- youtube_url    varchar(1024) NULL
- tiktok_url     varchar(1024) NULL

**Actions:**
- **Entity:** Add or update fields on `TenantSettings` (or equivalent) with `@Column(length = 1024)` and nullable. Use consistent naming (e.g. `facebookUrl`, `instagramUrl`, `twitterUrl`, `linkedinUrl`, `youtubeUrl`, `tiktokUrl` in Java).
- **DTO:** Add or update the same fields on the DTO(s) used for tenant settings (e.g. `TenantSettingsDTO`, create/update DTOs, response DTOs). Use String, nullable.
- **Query / Criteria:** In the JHipster query/criteria class for tenant settings (e.g. `TenantSettingsCriteria` or `TenantSettingsQueryService`), add filter support for any of these fields if you need search/filter by them (e.g. `StringFilter facebookUrl`, `instagramUrl`, etc.). If criteria are generated from the entity, regenerate or add the six filters.
- **MapStruct / Mapper:** Update entity-DTO mappers so the six fields are mapped in both directions.
- **Liquibase/Flyway:** If you use migrations, add a changelog that adds missing columns with `ADD COLUMN ... varchar(1024) NULL` (e.g. `instagram_url`, `tiktok_url` if they were missing). Match the exact column names used in the database (snake_case: `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`, `youtube_url`, `tiktok_url`).
- **API:** Ensure REST endpoints that return or accept tenant settings include these six fields in the JSON body and responses.

### 2. event_sponsors

Same six social URL fields:

- facebook_url   varchar(1024) NULL
- instagram_url  varchar(1024) NULL
- twitter_url    varchar(1024) NULL
- linkedin_url   varchar(1024) NULL
- youtube_url    varchar(1024) NULL
- tiktok_url     varchar(1024) NULL

**Actions:**
- **Entity:** Add or update `EventSponsors` (or equivalent) with the six fields; add any that are missing (e.g. `youtubeUrl`, `tiktokUrl`).
- **DTO:** Add or update DTOs (e.g. `EventSponsorsDTO`, create/update DTOs) with the six String fields.
- **Criteria / Query:** Add or update criteria filters for these fields if you use them in search.
- **MapStruct / Mapper:** Map the six fields between entity and DTO(s).
- **Liquibase/Flyway:** Add migration for any missing columns (e.g. `youtube_url`, `tiktok_url`).
- **API:** Ensure event-sponsors REST payloads and responses include all six social URL fields.

### 3. event_featured_performers

Same six social URL fields (this table may already have them; ensure all six exist and are varchar(1024) NULL):

- facebook_url   varchar(1024) NULL
- instagram_url  varchar(1024) NULL
- twitter_url    varchar(1024) NULL
- linkedin_url   varchar(1024) NULL
- youtube_url    varchar(1024) NULL
- tiktok_url     varchar(1024) NULL

**Actions:**
- **Entity:** Ensure `EventFeaturedPerformers` (or equivalent) has all six fields with length 1024, nullable.
- **DTO:** Ensure DTOs include all six fields.
- **Criteria / Query:** Ensure criteria classes include filters for these fields if used.
- **MapStruct / Mapper:** Map all six in both directions.
- **Liquibase/Flyway:** Add any missing columns.
- **API:** Ensure featured-performers REST includes all six in request/response.

## Summary checklist (per table)

For **tenant_settings**, **event_sponsors**, and **event_featured_performers**:

- [ ] Entity: six fields, String, length 1024, nullable; column names snake_case in DB.
- [ ] DTO(s): same six fields, String, nullable.
- [ ] Criteria / query service: add or update filters if needed.
- [ ] MapStruct/mappers: map all six entity ↔ DTO.
- [ ] Database migration: add any missing columns (varchar(1024) NULL).
- [ ] REST API: request/response JSON includes all six social URL fields.

## Context

- **Frontend project (schema source):** `E:\project_workspace\mosc-temp` — `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql` and `migration_tenant_settings_social_media_urls.sql`.
- **Backend project:** `E:\project_workspace\malayalees-us-site-boot` (this project).
- **Batch job project:** Apply the same entity/DTO/criteria and migration rules wherever it uses or persists tenant_settings, event_sponsors, or event_featured_performers.
```

---

## Short version (if you prefer a minimal prompt)

```
Sync backend and batch job with schema: tenant_settings, event_sponsors, and event_featured_performers now have six social URL fields (all varchar(1024) NULL): facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url, tiktok_url. Add any missing fields to Entity, DTO, criteria/query, MapStruct, and add a DB migration (Liquibase/Flyway) for new columns. Ensure REST API request/response JSON includes all six. Frontend schema is in E:\project_workspace\mosc-temp (Latest_Schema_Post__Blob_Claude_12.sql).
```

---

You can copy the **long prompt** (the content inside the code block) or the **short version** into the backend repo (and batch job repo) when asking for the integration.
