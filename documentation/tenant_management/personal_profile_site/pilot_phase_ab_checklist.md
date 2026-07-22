# Pilot checklist — Personal profile Phase A/B

## Backend (event-site-manager-service) — done in code

Liquibase + REST landed 2026-07-19. **Deploy/restart the service** so migration 003 runs against your DB.

| Item | Location |
|------|----------|
| Liquibase changelog | `event-site-manager-service/.../20260719120000_profile_booking_projects_media_kind.xml` |
| Manual SQL (same DDL) | `documentation/.../migrations/003_profile_booking_projects_media_kind.sql` |
| Batch-jobs SQL mirror (optional) | `event-site-manager-batch-jobs/database/migrations/003_*.sql` |
| `bookingUrl` | `PublicProfile` / `PublicProfileDTO` → `/api/public-profiles` |
| `mediaKind` | `ProfileMediaAsset` / DTO → `/api/profile-media-assets` |
| `showProfileProjectsSection` | `TenantSettings` / DTO → `/api/tenant-settings` |
| Projects CRUD | `/api/profile-projects` (full JHipster stack) |

Verify after deploy:

```text
GET /api/profile-projects?tenantId.equals=YOUR_TENANT&size=20
GET /api/public-profiles?tenantId.equals=YOUR_TENANT&size=1
```

Canonical DDL: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`

## Batch jobs — no runtime change for Phase B

- `PROFILE_AUDIENCE` email recipient type already exists.
- No new Java for booking/projects/media_kind.
- Optional: keep `database/migrations/003_*.sql` in sync with service Liquibase.

## Frontend verification (mosc-temp)

After backend deploy + PERSONAL_PROFILE presets:

1. Admin → Profile site: set Display name, bio, **Booking URL**, publish
2. Add a project with outcome metrics JSON; set Featured
3. Add SPEAKING achievement + VIDEO/PODCAST media asset
4. Homepage shows: hero, about, Perspectives, projects, talks strip, contact
5. Nav shows About → `/about`, Perspectives → `/#profile-writings`, Contact → `/contact`
6. `/about` and `/contact` load from published `public_profile` (+ org address on contact)

## Seed tenant

```sql
-- Example: set site type + enable section flags (adjust tenant_id)
UPDATE tenant_organization SET site_type = 'PERSONAL_PROFILE' WHERE tenant_id = 'YOUR_TENANT';
-- Or use Admin → Profile site → Apply personal profile presets
```
