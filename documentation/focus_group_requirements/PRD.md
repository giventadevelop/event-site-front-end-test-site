# Focus Groups Integration PRD (KANJ.org parity)

---
Description: Integrate multiple specialized focus groups (Career Guidance, Cultural, IT, NextGen) into the existing multi-tenant event system, including landing pages, event association, and membership management.
Globs: documentation/focus_group_requirements/*.md
AlwaysApply: false
---

## Scope Update (Full Feature)
- Implement Phase 1 (filters), Phase 2 (groups + event linking), Phase 3 (membership).
- Add landing pages at `/focus-groups` and `/focus-groups/[slug]` with About | Events | Members tabs.
- Admin pages for groups, linking, and membership management.

## Data Model (Final)
- Reuse existing `event_details`.
- New tables (added to schema):
  - `focus_group` (tenant_id, name, slug, description, cover_image_url, is_active, created_at, updated_at)
  - `focus_group_members` (tenant_id, focus_group_id, user_profile_id, role: MEMBER/LEAD/ADMIN, status: ACTIVE/INACTIVE/PENDING)
  - `event_focus_groups` (tenant_id, event_id, focus_group_id)
- Columns for role/status use `VARCHAR(50)` to match existing backend domain mapping; enums `focus_group_member_role_type`, `focus_group_member_status_type` are created but not applied to columns yet (reserved for future migration).
- Composite uniques per tenant for name/slug and joins.

## API (Proxy-First)
- `GET /api/proxy/focus-groups?isActive.equals=true&sort=name,asc`
- `GET /api/proxy/focus-groups/by-slug/{slug}` (optional convenience)
- `GET /api/proxy/focus-group-members?focusGroupId.equals={id}` (admin)
- `POST /api/proxy/focus-groups` (admin)
- `PATCH /api/proxy/focus-groups/{id}` (admin)
- `POST /api/proxy/event-focus-groups` (admin)
- `DELETE /api/proxy/event-focus-groups/{id}` (admin)
- All handlers use `createProxyHandler` (tenantId injection, JWT, query forwarding). No DTO redeclarations.

## Backend (malayalees-us-site-boot) Changes
- Add JPA entities and repositories:
  - `FocusGroup { id, tenantId, name, slug, description, coverImageUrl, isActive, createdAt, updatedAt }`
  - `FocusGroupMember { id, tenantId, focusGroupId, userProfileId, role:String, status:String, createdAt, updatedAt }`
  - `EventFocusGroup { id, tenantId, eventId, focusGroupId, createdAt, updatedAt }`
- Criteria support: expose filters like `tenantId.equals`, `slug.equals`, `name.contains`, `focusGroupId.equals`, `eventId.equals`.
- REST controllers:
  - `/api/focus-groups` (GET list, GET by id, POST create, PATCH update)
  - `/api/focus-group-members` (GET, POST, PATCH)
  - `/api/event-focus-groups` (GET, POST, DELETE)
- Validation:
  - Uppercase normalization for `role` and `status` on create/update.
  - Composite unique constraints enforced at DB and validated in service.
- Security: service JWT for server-side PATCH/PUT where needed; proxy handles JWT for public/GET.

## UI Pages
- `/focus-groups` (public): grid of active groups; hero + cards.
- `/focus-groups/[slug]` (public): hero; tabs
  - About: description, leads
  - Events: list + calendar filtered by group
  - Members: optional public roster (configurable)
- Admin:
  - `/admin/focus-groups` CRUD
  - `/admin/focus-groups/[id]/events` link/unlink events
  - `/admin/focus-groups/[id]/members` manage membership

## Middleware
- Add `/focus-groups(.*)` to `publicRoutes`.

## DTOs (to be added in `src/types/index.ts`)
- `FocusGroupDTO`, `FocusGroupMemberDTO`, `EventFocusGroupDTO` (flat, serializable, uppercase enums).

## Implementation Notes
- Server actions only for authenticated admin mutations; public reads can be direct to proxy.
- Client components never call backend APIs directly.
- Use `fetchWithJwtRetry` in server actions; absolute URLs in server components.
- Calendar supports `?focusGroup=slug` filter.

## Acceptance Criteria
- Group pages render with associated events.
- Admin can create groups and link events.
- Membership roles and statuses enforce at API level; tenant-scoped.
- All enums and statuses are uppercase.

## Troubleshooting: Joined member not listed in admin
- If a user joins via the public "Join" button but does not appear on `/admin/focus-groups/[id]/members`, (1) the admin page uses `dynamic = 'force-dynamic'` and a "Refresh list" link so each visit/click refetches; (2) the backend must persist `focus_group_members.tenant_id` from the **request** (body `tenantId` or `X-Tenant-ID` header), not from the user profile. If the backend uses the user profile’s tenant when creating the row, the list (filtered by `tenantId.equals` = app tenant) will not return that row.

## Tasks (high-level)
1) Schema applied in backend repo.
2) Add proxy handlers: `/api/proxy/focus-groups`, `/api/proxy/focus-group-members`, `/api/proxy/event-focus-groups`.
3) Add public route entry in middleware.
4) Add DTOs and server actions.
5) Build UI pages and admin screens.
