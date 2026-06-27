# Database PRD: Default Hero Images (Tenant Settings)

**Related:** [DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html](./DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html) · [DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md](./DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md) · [DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md](./DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md) · [hero-image-selection-overlay-logic.md](./hero-image-selection-overlay-logic.md)

## Document information

| Field | Value |
|-------|--------|
| **Version** | 1.0 |
| **Status** | Draft — required for frontend hero resolver |
| **Scope** | PostgreSQL schema on `tenant_settings` only |
| **Out of scope** | New tables, S3 upload logic, homepage event media schema |

---

## 1. Executive summary

The frontend multi-tenant hero system stores **per-tenant default homepage hero image URLs** on `tenant_settings`. Event hero media (`event_media.is_home_page_hero_image`) remains the primary source; these columns fill gaps when no upcoming event heroes exist or when configured to append slides after event images.

This PRD defines **only database changes**: three nullable columns on `public.tenant_settings`, migration scripts, defaults, and verification queries.

---

## 2. Business context

| Need | Database support |
|------|------------------|
| Multiple default slides per tenant | JSON array in `default_hero_image_urls_json` |
| Slideshow vs random vs single | `default_hero_display_mode` |
| Append defaults when events exist | `default_hero_include_with_events` |
| Per-tenant branding without redeploy | Rows scoped by existing `tenant_id` |
| Onboarding new satellite tenant | Seed row with template URLs after S3 copy |

**Frontend contract (read-only for DB design):** `src/types/index.ts` and `src/app/admin/tenant-management/types.ts` expect API fields `defaultHeroImageUrlsJson`, `defaultHeroDisplayMode`, `defaultHeroIncludeWithEvents`.

---

## 3. Current state

- Table: `public.tenant_settings` (one settings row per `tenant_id` in normal operation).
- Existing URL columns follow the same pattern: `logo_image_url`, `email_header_image_url` (`VARCHAR(2048)` nullable).
- No hero-default columns exist today; frontend falls back to bundled `/images/hero_section/hero_images/fallback/default-hero.webp` until API returns values.

---

## 4. Required schema changes

### 4.1 New columns on `tenant_settings`

| Column (DB) | Type | Nullable | Default | Notes |
|-------------|------|----------|---------|-------|
| `default_hero_image_urls_json` | `TEXT` | YES | `NULL` | JSON array of HTTPS URLs, ordered for slideshow |
| `default_hero_display_mode` | `VARCHAR(32)` | YES | `'slideshow'` | Allowed: `slideshow`, `random`, `single` |
| `default_hero_include_with_events` | `BOOLEAN` | YES | `TRUE` | When true, tenant defaults may trail event hero slides (frontend behavior) |

**Naming:** Snake case in PostgreSQL; Jackson maps to camelCase in API (`defaultHeroImageUrlsJson`, etc.).

**Why TEXT for JSON:** Matches existing patterns (e.g. flexible string fields); parse in application layer. `VARCHAR(4096)` is acceptable if the team prefers a length cap; prefer `TEXT` if tenants may store many URLs.

### 4.2 Migration script (PostgreSQL)

```sql
-- =====================================================
-- Default hero images — tenant_settings columns
-- Feature: Multi-tenant homepage hero fallback / slideshow
-- =====================================================

ALTER TABLE public.tenant_settings
    ADD COLUMN IF NOT EXISTS default_hero_image_urls_json TEXT NULL;

ALTER TABLE public.tenant_settings
    ADD COLUMN IF NOT EXISTS default_hero_display_mode VARCHAR(32) NULL
        DEFAULT 'slideshow';

ALTER TABLE public.tenant_settings
    ADD COLUMN IF NOT EXISTS default_hero_include_with_events BOOLEAN NULL
        DEFAULT TRUE;

COMMENT ON COLUMN public.tenant_settings.default_hero_image_urls_json IS
    'JSON array of HTTPS URLs for tenant default homepage hero images, e.g. ["https://.../slide-01.webp"]. Order defines slideshow sequence.';

COMMENT ON COLUMN public.tenant_settings.default_hero_display_mode IS
    'How tenant default hero URLs are used when no event heroes or as trailing slides: slideshow | random | single.';

COMMENT ON COLUMN public.tenant_settings.default_hero_include_with_events IS
    'When TRUE, frontend may append tenant default slides after upcoming event hero images.';
```

### 4.3 Optional check constraint (recommended)

```sql
ALTER TABLE public.tenant_settings
    ADD CONSTRAINT chk_tenant_settings_default_hero_display_mode
    CHECK (
        default_hero_display_mode IS NULL
        OR default_hero_display_mode IN ('slideshow', 'random', 'single')
    );
```

### 4.4 Rollback script

```sql
ALTER TABLE public.tenant_settings
    DROP CONSTRAINT IF EXISTS chk_tenant_settings_default_hero_display_mode;

ALTER TABLE public.tenant_settings
    DROP COLUMN IF EXISTS default_hero_include_with_events;

ALTER TABLE public.tenant_settings
    DROP COLUMN IF EXISTS default_hero_display_mode;

ALTER TABLE public.tenant_settings
    DROP COLUMN IF EXISTS default_hero_image_urls_json;
```

---

## 5. Data seeding and onboarding

### 5.1 S3 object layout (operations — not stored in DB)

```
s3://eventapp-media-bucket/tenant-templates/default-hero/
  slide-01.webp
  slide-02.webp
s3://eventapp-media-bucket/tenants/{tenantId}/hero-defaults/
  slide-01.webp
  slide-02.webp
```

Public URL pattern:

`https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/{tenantId}/hero-defaults/slide-01.webp`

### 5.2 Example seed UPDATE (after S3 copy)

```sql
UPDATE public.tenant_settings
SET
    default_hero_image_urls_json = '["https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/tenant_demo_002/hero-defaults/slide-01.webp","https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/tenant_demo_002/hero-defaults/slide-02.webp"]',
    default_hero_display_mode = 'slideshow',
    default_hero_include_with_events = TRUE,
    updated_at = NOW()
WHERE tenant_id = 'tenant_demo_002';
```

### 5.3 Existing tenants

- **No automatic backfill required.** NULL columns mean frontend uses bundled emergency image until admin or onboarding script sets URLs.
- Optional: one-time migration to copy template URLs per tenant after ops uploads S3 assets.

---

## 6. Data integrity rules

| Rule | Enforcement |
|------|-------------|
| Valid JSON array when `default_hero_image_urls_json` is non-null | Application validation (backend PRD); optional DB trigger not required Phase 1 |
| Each array element is HTTPS URL | Application validation |
| `default_hero_display_mode` in allowed set | CHECK constraint (optional) + application enum |
| Tenant isolation | Existing `tenant_id` on row; no cross-tenant column |

**Example valid JSON:**

```json
["https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/mosc-temp/hero-defaults/slide-01.webp"]
```

---

## 7. Verification queries

```sql
-- Columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tenant_settings'
  AND column_name IN (
    'default_hero_image_urls_json',
    'default_hero_display_mode',
    'default_hero_include_with_events'
  )
ORDER BY column_name;

-- Sample tenant row
SELECT
    id,
    tenant_id,
    default_hero_image_urls_json,
    default_hero_display_mode,
    default_hero_include_with_events
FROM public.tenant_settings
WHERE tenant_id = 'tenant_demo_002';
```

---

## 8. Acceptance criteria (database)

- [ ] Migration applies cleanly on dev/staging/prod without locking `tenant_settings` longer than maintenance window allows.
- [ ] All three columns exist with documented defaults where specified.
- [ ] Existing rows remain valid (NULL hero fields allowed).
- [ ] Rollback script tested on dev.
- [ ] Comments on columns present for DBA documentation.

---

## 9. Dependencies

| Dependency | Owner |
|------------|--------|
| JPA entity + Liquibase changelog | Backend application (see [DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md](./DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md)) |
| S3 template pack upload | DevOps / onboarding |
| Frontend admin + resolver | Already implemented in event-site-manager |

---

## 10. References

- Frontend onboarding script: `scripts/seed-tenant-default-hero-images.js`
- Similar URL column pattern: `logo_image_url`, `email_header_image_url` on `tenant_settings`
- Architecture guide: [DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html](./DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html)
