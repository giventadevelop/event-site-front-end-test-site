# Default Hero Images — Backend Implementation Prompt (Index)

> **Split into two PRDs (March 2026).** Use the documents below instead of this file for implementation.

| Document | Purpose |
|----------|---------|
| **[DEFAULT_HERO_IMAGES_DATABASE_PRD.md](./DEFAULT_HERO_IMAGES_DATABASE_PRD.md)** | PostgreSQL migration, columns, constraints, seed SQL, verification queries |
| **[DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md](./DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md)** | JPA entity, DTO, REST API, validation, onboarding, optional upload endpoint |
| **[DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md](./DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md)** | Admin Homepage Hero tab, multi-file upload, reorder, walkthrough |

**Related:** [DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html](./DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html) · [hero-image-selection-overlay-logic.md](./hero-image-selection-overlay-logic.md)

## Quick summary

The frontend stores per-tenant default homepage hero URLs on `tenant_settings`:

- `default_hero_image_urls_json` — JSON array of HTTPS URLs
- `default_hero_display_mode` — `slideshow` \| `random` \| `single`
- `default_hero_include_with_events` — boolean (default `true`)

Phase 1: extend existing `/api/tenant-settings` GET/PATCH. Phase 2 (optional): upload endpoint like tenant-logo.

Frontend onboarding: `node scripts/seed-tenant-default-hero-images.js`
