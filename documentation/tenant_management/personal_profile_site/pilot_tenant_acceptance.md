# Pilot Tenant Acceptance — Personal Profile Site

Use this checklist when launching the first `PERSONAL_PROFILE` tenant (one deployment = one public portfolio).

## Prerequisites

1. **Backend** (`event-site-manager-service`): apply `migrations/001_personal_profile_site.sql` (or Liquibase equivalent).
2. REST resources live: `/api/public-profiles`, `/api/profile-writings`, `/api/profile-achievements`, `/api/profile-affiliations`, `/api/profile-media-assets`.
3. `tenant_organization.site_type` column deployed; PATCH/PUT accepts `siteType`.
4. `tenant_settings` profile section flags deployed.

## Pilot setup (admin)

| Step | Action | Done when |
|------|--------|-----------|
| 1 | Edit organization → set **Site type** = `Personal profile / portfolio` | `site_type = PERSONAL_PROFILE` in DB |
| 2 | Save organization | Homepage presets applied (events/sponsors off; profile sections on) |
| 3 | Admin → **Profile Site** → Public profile tab | Display name, tagline, bio, images saved |
| 4 | Publish profile | `is_published = true` |
| 5 | Add 3–5 writings (mix `ORIGINAL`, `EXTERNAL_LINK`) | Status `PUBLISHED` |
| 6 | Add 2+ achievements | Visible on homepage |
| 7 | Add affiliations + 1 downloadable asset | CV/PDF link works |

## Public acceptance

| # | Criterion | Verify |
|---|-----------|--------|
| 1 | Homepage shows profile hero (not event hero strip) | Visit `/` signed out |
| 2 | Writings grid with external links open in new tab | Click newspaper/magazine link |
| 3 | Achievements timeline renders | Scroll homepage |
| 4 | Affiliations + downloads sections | Files download |
| 5 | Contact section shows email / CTA | `/profile` full page matches sections |
| 6 | No events/sponsors blocks (unless HYBRID) | Event sections absent |
| 7 | Mobile layout readable | iOS Safari + Android Chrome |

## HYBRID smoke (optional)

Set `site_type = HYBRID` → homepage shows **both** profile sections and events/sponsors.

## Rollback

- Set `site_type = EVENT_ORG` and re-save organization to restore event-org presets.
- Set `is_published = false` on `public_profile` to hide public content without deleting data.

## Known dependency

Until the backend ships profile APIs, admin saves and public fetches fail gracefully (empty sections). Complete backend work per [backend_event_site_manager_service_prd.html](./backend_event_site_manager_service_prd.html) and batch parity per [backend_event_site_manager_batch_jobs_prd.html](./backend_event_site_manager_batch_jobs_prd.html) before pilot go-live.
