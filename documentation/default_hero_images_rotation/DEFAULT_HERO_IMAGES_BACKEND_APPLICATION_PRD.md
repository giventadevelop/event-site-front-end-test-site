# Backend Application PRD: Default Hero Images (Tenant Settings API)

**Related:** [DEFAULT_HERO_IMAGES_DATABASE_PRD.md](./DEFAULT_HERO_IMAGES_DATABASE_PRD.md) · [DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md](./DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md) · [DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html](./DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html) · [hero-image-selection-overlay-logic.md](./hero-image-selection-overlay-logic.md)

## Document information

| Field | Value |
|-------|--------|
| **Version** | 1.0 |
| **Status** | Draft — blocks full tenant-default hero behavior until deployed |
| **Backend stack** | Spring Boot / JHipster-style REST (existing `tenant_settings` resource) |
| **Frontend repo** | `event-site-manager` (Next.js) — already consumes these fields when present |

---

## 1. Executive summary

Expose and persist three new **tenant settings** fields that configure per-tenant default homepage hero images. The frontend resolver (`src/lib/hero/defaultHeroImages.ts`) already reads them from `GET /api/tenant-settings` (via proxy) and PATCHes them from admin onboarding scripts.

**Phase 1 (required):** Entity, DTO, validation, CRUD on existing `/api/tenant-settings` endpoints.

**Phase 2 (optional):** `POST /api/tenant-settings/upload/default-hero-image` mirroring tenant-logo upload.

---

## 2. Goals and non-goals

### In scope

- Map DB columns to `TenantSettings` entity and `TenantSettingsDTO`
- Return fields on GET (list and by id)
- Accept fields on POST, PUT, PATCH (`application/merge-patch+json`)
- Validate JSON URL list and display mode enum
- Tenant scoping via existing `tenant_id` + `X-Tenant-ID` / JWT patterns
- OpenAPI documentation for new properties

### Out of scope (Phase 1)

- New REST resource or separate hero-settings table
- Homepage event media API changes
- Image resizing or CDN invalidation
- Criteria filter `defaultHeroDisplayMode.equals` (optional later)
- Dedicated upload endpoint (Phase 2)

---

## 3. Frontend contract

### 3.1 DTO fields (API JSON — camelCase)

| API field | Type | Required on write | Default when omitted |
|-----------|------|-------------------|----------------------|
| `defaultHeroImageUrlsJson` | `string` | No | `null` |
| `defaultHeroDisplayMode` | `string` | No | `"slideshow"` |
| `defaultHeroIncludeWithEvents` | `boolean` | No | `true` |

Optional convenience (nice-to-have): expose parsed `defaultHeroImageUrls` as `List<String>` on GET only (computed from JSON column). Frontend already parses JSON client-side if only `defaultHeroImageUrlsJson` is returned.

### 3.2 Frontend usage map

| Consumer | Behavior |
|----------|----------|
| `TenantSettingsProvider` | Loads settings; `parseTenantDefaultHeroUrls()` |
| `HeroSection.tsx` / charity hero | `resolveHeroImages()` for slideshow |
| `useHeroFallbackUrl` / `getTenantHeroFallbackUrl` | Single URL fallback on event/checkout pages |
| `TenantSettingsForm` | Serializes textarea lines → `defaultHeroImageUrlsJson` on save |
| `scripts/seed-tenant-default-hero-images.js` | PATCH settings by `tenantId` |
| `createTenantSetting()` | Seeds from `DEFAULT_HERO_TEMPLATE_URLS` env when set |

### 3.3 Example GET fragment

```json
{
  "id": 12,
  "tenantId": "tenant_demo_002",
  "logoImageUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/...",
  "defaultHeroImageUrlsJson": "[\"https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/tenant_demo_002/hero-defaults/slide-01.webp\"]",
  "defaultHeroDisplayMode": "slideshow",
  "defaultHeroIncludeWithEvents": true
}
```

### 3.4 Example PATCH (merge-patch)

```http
PATCH /api/tenant-settings/12
Content-Type: application/merge-patch+json
Authorization: Bearer <token>
X-Tenant-ID: tenant_demo_002

{
  "id": 12,
  "defaultHeroImageUrlsJson": "[\"https://.../slide-01.webp\",\"https://.../slide-02.webp\"]",
  "defaultHeroDisplayMode": "random",
  "defaultHeroIncludeWithEvents": false
}
```

---

## 4. Entity and persistence layer

### 4.1 JPA entity (`TenantSettings`)

Add fields (names align with [DATABASE PRD](./DEFAULT_HERO_IMAGES_DATABASE_PRD.md)):

```java
@Column(name = "default_hero_image_urls_json", columnDefinition = "text")
private String defaultHeroImageUrlsJson;

@Column(name = "default_hero_display_mode", length = 32)
private String defaultHeroDisplayMode;

@Column(name = "default_hero_include_with_events")
private Boolean defaultHeroIncludeWithEvents;
```

### 4.2 Liquibase / Flyway

- Include changelog entry from database PRD migration.
- Regenerate or hand-update JHipster entity if using entity generator.

### 4.3 Mapper

- MapStruct (or existing mapper) must copy all three fields entity ↔ DTO.
- Do not strip unknown fields on PATCH; merge-patch should update only provided keys.

---

## 5. Validation rules

| Field | Validation |
|-------|------------|
| `defaultHeroImageUrlsJson` | If non-null: valid JSON array; each element non-empty string; each must start with `https://` (recommended). Max length e.g. 16KB to match TEXT column policy. |
| `defaultHeroDisplayMode` | If non-null: one of `slideshow`, `random`, `single` (case-sensitive). |
| `defaultHeroIncludeWithEvents` | If non-null: boolean. |

**Invalid JSON:** return `400 Bad Request` with field error (JHipster `ErrorVM` / `FieldErrorVM` pattern).

**Empty array `[]`:** allowed — treated as “no tenant defaults” by frontend (bundled fallback).

---

## 6. REST API — existing `tenant-settings` resource

No new base path required for Phase 1.

### 6.1 Endpoints (extend behavior)

| Method | Path | Change |
|--------|------|--------|
| `GET` | `/api/tenant-settings` | Include new fields in each DTO; support existing criteria e.g. `tenantId.equals` |
| `GET` | `/api/tenant-settings/{id}` | Include new fields |
| `POST` | `/api/tenant-settings` | Accept new fields on create; apply defaults |
| `PUT` | `/api/tenant-settings/{id}` | Full update includes new fields |
| `PATCH` | `/api/tenant-settings/{id}` | Partial update — **primary path for frontend seed script and admin** |

### 6.2 Authentication and tenancy

- Same as existing tenant settings: service JWT for scripts; admin JWT for dashboard.
- Honor `X-Tenant-ID` where `TenantContextFilter` applies.
- Frontend proxy: `/api/proxy/tenant-settings` via `createProxyHandler`.

### 6.3 Criteria / filtering (Phase 2 optional)

- Optional: `defaultHeroDisplayMode.equals=slideshow` for admin search.
- Not required for homepage or Phase 1 onboarding.

---

## 7. Onboarding integration

When provisioning a new tenant (manual or automated):

1. Ops copies S3 template → `tenants/{tenantId}/hero-defaults/`.
2. Backend or script sets `tenant_settings`:
   - `defaultHeroImageUrlsJson` = JSON array of public URLs
   - `defaultHeroDisplayMode` = `slideshow`
   - `defaultHeroIncludeWithEvents` = `true`

**Frontend script (already in repo):**

```text
node scripts/seed-tenant-default-hero-images.js
```

Requires env: `TENANT_ID`, `DEFAULT_HERO_IMAGE_URLS`, `NEXT_PUBLIC_API_BASE_URL`, `API_JWT_USER`, `API_JWT_PASS`.

**Admin create path:** `getOnboardingDefaultHeroPayload()` in `src/app/admin/tenant-management/settings/ApiServerActions.ts` when `DEFAULT_HERO_TEMPLATE_URLS` / `AMPLIFY_DEFAULT_HERO_TEMPLATE_URLS` is set (supports `{tenantId}` in URL template).

---

## 8. Phase 2 — optional upload endpoint

Mirror [EMAIL_HEADER_IMAGE_UPLOAD_BACKEND_PROMPT.md](../tenant_management/EMAIL_HEADER_IMAGE_UPLOAD_BACKEND_PROMPT.md) and `POST /api/tenant-settings/upload/tenant-logo`.

| Item | Value |
|------|--------|
| Path | `POST /api/tenant-settings/upload/default-hero-image` |
| Body | `multipart/form-data`, field `file` |
| Storage | S3 under `tenants/{tenantId}/hero-defaults/{filename}` |
| Response | `{ "url": "https://..." }` or append URL to settings JSON server-side |
| Frontend proxy | `src/pages/api/proxy/tenant-settings/upload/default-hero-image.ts` (to be added when endpoint exists) |

Admin UI currently accepts pasted HTTPS URLs; upload endpoint is not blocking Phase 1.

---

## 9. OpenAPI / Swagger

Add to `TenantSettings` schema:

```yaml
defaultHeroImageUrlsJson:
  type: string
  description: JSON array of HTTPS URLs for default homepage hero slides
  example: '["https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/tenants/x/hero-defaults/slide-01.webp"]'
defaultHeroDisplayMode:
  type: string
  enum: [slideshow, random, single]
  default: slideshow
defaultHeroIncludeWithEvents:
  type: boolean
  default: true
```

---

## 10. Testing and verification

### 10.1 API tests

- [ ] `GET /api/tenant-settings?tenantId.equals={id}` returns three fields (null or populated).
- [ ] `PATCH` with only `defaultHeroImageUrlsJson` updates JSON without clearing other settings fields.
- [ ] `PATCH` with invalid `defaultHeroDisplayMode` returns 400.
- [ ] `PATCH` with malformed JSON string returns 400.
- [ ] Create tenant settings with defaults; `defaultHeroDisplayMode` is `slideshow` if omitted.

### 10.2 Integration with frontend

- [ ] Homepage shows tenant S3 URLs when no upcoming `isHomePageHeroImage` events.
- [ ] Admin **Tenant Settings → Customization** save/load round-trips JSON.
- [ ] `node scripts/seed-tenant-default-hero-images.js` succeeds against deployed API.

### 10.3 Regression

- [ ] Existing `logoImageUrl`, `emailHeaderImageUrl`, feature flags unchanged on unrelated PATCH.

---

## 11. Implementation checklist

| # | Task | Owner |
|---|------|--------|
| 1 | Apply DB migration ([DATABASE PRD](./DEFAULT_HERO_IMAGES_DATABASE_PRD.md)) | DBA / backend |
| 2 | Add entity columns + Liquibase sync | Backend |
| 3 | Extend DTO and mapper | Backend |
| 4 | Add validation service or Bean Validation annotations | Backend |
| 5 | Ensure PATCH merge includes new fields | Backend |
| 6 | Update OpenAPI spec | Backend |
| 7 | Deploy API; run seed script for pilot tenant | DevOps |
| 8 | Verify homepage on satellite domain | QA |

---

## 12. References (frontend repo)

| Path | Role |
|------|------|
| `src/lib/hero/defaultHeroImages.ts` | Resolver |
| `src/components/TenantSettingsProvider.tsx` | Settings fetch + parse |
| `src/app/admin/tenant-management/components/TenantSettingsForm.tsx` | Admin UI |
| `scripts/seed-tenant-default-hero-images.js` | Onboarding PATCH |
| `documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html` | Full architecture |

---

## 13. Supersedes

This PRD splits application/API concerns from the combined prompt [DEFAULT_HERO_IMAGES_BACKEND_PROMPT.md](./DEFAULT_HERO_IMAGES_BACKEND_PROMPT.md). Database-only details live in [DEFAULT_HERO_IMAGES_DATABASE_PRD.md](./DEFAULT_HERO_IMAGES_DATABASE_PRD.md).
