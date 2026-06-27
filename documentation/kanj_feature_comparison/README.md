# KANJ Feature Comparison Documentation

This folder contains comparative analysis between KANJ.org (Kerala Association of New Jersey) and our event management/polling platform.

## Documents in This Folder

### 1. Event_Competitions_PRD.html
**Product Requirements Document — Event Competitions (generic)**

- Multi-competition events on any `event_details` record: youth (parent/child), adult (self/team), or mixed
- Catalog, registrations, fees, and **published winners** (placement, prizes, photos)
- Additive design: `is_competition_event` on `event_details` without breaking ticket checkout
- **KANJ KGT** is documented as a **YOUTH preset** reference, not the product name

**Open in browser:** [`Event_Competitions_PRD.html`](Event_Competitions_PRD.html)

**Legacy URL:** [`KGT_Youth_Festival_Kids_Events_PRD.html`](KGT_Youth_Festival_Kids_Events_PRD.html) redirects to the master PRD.

### 2. event_competitions/ — Layer-specific PRDs

Implementation guides for database, backend, frontend, and batch jobs (May 2026, v2.0).

| Document | Layer |
|----------|-------|
| [`event_competitions/generic_prd.html`](event_competitions/generic_prd.html) | Index — phases P0–P4, audience modes, open questions |
| [`event_competitions/database_schema_prd.html`](event_competitions/database_schema_prd.html) | PostgreSQL — `event_competition_*` DDL |
| [`event_competitions/backend_prd.html`](event_competitions/backend_prd.html) | `malayalees-us-site-boot` — JHipster REST |
| [`event_competitions/frontend_prd.html`](event_competitions/frontend_prd.html) | Next.js — proxy, `/competitions` routes, winners UI |
| [`event_competitions/batch_job_prd.html`](event_competitions/batch_job_prd.html) | Optional P4 emails |

**Start here for coding:** [`event_competitions/generic_prd.html`](event_competitions/generic_prd.html) → database → backend → frontend.

### 3. KANJ_vs_OurSite_Analysis.md
Comprehensive feature comparison and gap analysis (KANJ website vs our platform).

### 4. Related: Event Sports & Arts Results
[`../event_sports_arts_competition/Event_Sports_Arts_Competition_Results_Feature_Requirements.html`](../event_sports_arts_competition/Event_Sports_Arts_Competition_Results_Feature_Requirements.html) — scorecards for `is_sports_event`; see Event Competitions PRD for multi-competition festivals.

## Document History

| Date | Version | Changes |
|------|---------|---------|
| Oct 22, 2025 | 1.0 | Initial KANJ comparison |
| May 21, 2026 | 1.1 | Kids Festival PRD (superseded) |
| May 21, 2026 | 1.2 | `kids_festival/` layer PRDs |
| May 21, 2026 | 2.0 | **Event Competitions** — renamed folder, generic model, winners/photos |
