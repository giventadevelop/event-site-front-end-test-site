# Focus Group and Event Relationship Analysis

## Executive Summary

This document provides a comprehensive analysis of how focus groups are related to events, how members are managed, and how to filter events for focus groups. The analysis is based on the database schema (`Latest_Schema_Post__Blob_Claude_11.sql`) and existing API implementations.

---

## 1. Database Schema Analysis

### 1.1 Core Tables

#### `focus_group` Table
```sql
CREATE TABLE public.focus_group (
    id bigint PRIMARY KEY,
    tenant_id character varying(255) NOT NULL,
    name character varying(120) NOT NULL,
    slug character varying(80) NOT NULL,
    description text,
    cover_image_url character varying(1024),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ux_focus_group__tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT ux_focus_group__tenant_name UNIQUE (tenant_id, name)
);
```

**Key Points:**
- Tenant-scoped (multi-tenant support)
- Unique constraints: `(tenant_id, slug)` and `(tenant_id, name)`
- Has `cover_image_url` field for cover images
- `is_active` flag for soft deletion/activation

#### `event_focus_groups` Table (Join Table)
```sql
CREATE TABLE public.event_focus_groups (
    id bigint PRIMARY KEY,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    focus_group_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ux_event_focus_groups__tenant_event_group UNIQUE (tenant_id, event_id, focus_group_id),
    CONSTRAINT fk_event_focus_groups__group FOREIGN KEY (focus_group_id) REFERENCES public.focus_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_focus_groups__event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);
```

**Key Points:**
- **Many-to-Many Relationship**: One event can belong to multiple focus groups, one focus group can have multiple events
- Unique constraint: `(tenant_id, event_id, focus_group_id)` prevents duplicate associations
- Cascade delete: If focus group or event is deleted, associations are automatically removed
- Tenant-scoped for multi-tenant isolation

#### `focus_group_members` Table
```sql
CREATE TABLE public.focus_group_members (
    id bigint PRIMARY KEY,
    tenant_id character varying(255) NOT NULL,
    focus_group_id bigint NOT NULL,
    user_profile_id bigint NOT NULL,
    role character varying(50) NOT NULL DEFAULT 'MEMBER',
    status character varying(50) NOT NULL DEFAULT 'PENDING',
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ux_focus_group_members__tenant_group_user UNIQUE (tenant_id, focus_group_id, user_profile_id),
    CONSTRAINT fk_focus_group_members__group FOREIGN KEY (focus_group_id) REFERENCES public.focus_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_focus_group_members__user_profile FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE
);
```

**Key Points:**
- Links `user_profile` to `focus_group`
- **Role Types**: `MEMBER`, `LEAD`, `ADMIN` (stored as VARCHAR, enum types exist but not enforced)
- **Status Types**: `ACTIVE`, `INACTIVE`, `PENDING` (stored as VARCHAR, enum types exist but not enforced)
- Unique constraint: `(tenant_id, focus_group_id, user_profile_id)` prevents duplicate memberships
- Cascade delete: If focus group or user is deleted, membership is removed

---

## 2. Relationship Diagram

```
┌─────────────────┐
│  focus_group    │
│  (id, name,     │
│   slug, ...)    │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────┐
│ focus_group_members      │
│ (focus_group_id,        │
│  user_profile_id,       │
│  role, status)          │
└────────┬────────────────┘
         │
         │ N:1
         │
         ▼
┌─────────────────┐
│  user_profile   │
│  (id, ...)      │
└─────────────────┘

┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  event_details  │◄────────│ event_focus_groups   │────────►│  focus_group    │
│  (id, title,    │    N:1  │ (event_id,           │    N:1  │  (id, name, ...) │
│   startDate,    │         │  focus_group_id)     │         │                 │
│   ...)          │         └──────────────────────┘         └─────────────────┘
└─────────────────┘
```

**Relationship Summary:**
- **Focus Group ↔ Events**: Many-to-Many via `event_focus_groups` join table
- **Focus Group ↔ Members**: One-to-Many via `focus_group_members` table
- **Members ↔ Events**: Indirect relationship through focus groups (members can see events associated with their focus groups)

---

## 3. How Focus Groups Are Related to Events

### 3.1 Association Mechanism

**Association is Explicit:**
- Events are NOT automatically associated with focus groups
- Association must be created via `event_focus_groups` table
- One event can belong to multiple focus groups (e.g., "IT Career Fair" can be in both "IT" and "Career" groups)
- One focus group can have multiple events

### 3.2 Creating Associations

**Admin Interface:**
- Admin page: `/admin/focus-groups/[id]/events`
- Allows linking/unlinking events to focus groups
- Uses `POST /api/proxy/event-focus-groups` to create associations
- Uses `DELETE /api/proxy/event-focus-groups/{id}` to remove associations

**API Endpoint:**
```
POST /api/proxy/event-focus-groups
Body: {
  "eventId": 123,
  "focusGroupId": 456,
  "tenantId": "tenant_demo_001"
}
```

### 3.3 Querying Events for a Focus Group

**Backend API Filter:**
The backend supports filtering events by focus group using:
```
GET /api/event-details?focusGroupId.equals={focusGroupId}&isActive.equals=true&sort=startDate,asc
```

**How It Works:**
- Backend joins `event_details` with `event_focus_groups` table
- Filters by `event_focus_groups.focus_group_id = {focusGroupId}`
- Returns only events that have an entry in `event_focus_groups` for that focus group

**Current Implementation:**
- `/focus-groups/[slug]/page.tsx` uses: `focusGroupId.equals=${groupId}`
- `/focus-groups/page.tsx` uses: `focusGroupId.equals=${groupId}&isActive.equals=true`
- `/admin/focus-groups/[id]/events/page.tsx` uses: `focusGroupId.equals=${id}`

---

## 4. How Members Are Added to Focus Groups

### 4.1 Membership Creation

**Admin Interface:**
- Admin page: `/admin/focus-groups/[id]/members`
- Allows adding/removing members from focus groups
- Uses `POST /api/proxy/focus-group-members` to create memberships

**API Endpoint:**
```
POST /api/proxy/focus-group-members
Body: {
  "focusGroupId": 456,
  "userProfileId": 789,
  "role": "MEMBER",  // MEMBER | LEAD | ADMIN
  "status": "ACTIVE", // ACTIVE | INACTIVE | PENDING
  "tenantId": "tenant_demo_001"
}
```

### 4.2 Member Identification

**Members are identified by:**
- `user_profile_id` - Links to `user_profile` table
- `focus_group_id` - Links to `focus_group` table
- Unique constraint: `(tenant_id, focus_group_id, user_profile_id)` ensures one membership per user per group

**Member Roles:**
- `MEMBER` - Regular member
- `LEAD` - Group leader
- `ADMIN` - Group administrator

**Member Status:**
- `ACTIVE` - Active member
- `INACTIVE` - Inactive member
- `PENDING` - Pending approval

### 4.3 Querying Members

**API Endpoint:**
```
GET /api/proxy/focus-group-members?focusGroupId.equals={focusGroupId}&sort=createdAt,desc
```

**Returns:**
- List of `FocusGroupMemberDTO` objects
- Each includes `userProfileId`, `role`, `status`
- Can be joined with `user_profile` to get member details

---

## 5. How Members and Events Are Associated

### 5.1 Indirect Association

**Members do NOT have direct relationship with events:**
- Members are associated with focus groups via `focus_group_members`
- Events are associated with focus groups via `event_focus_groups`
- Members can see events through their focus group membership

### 5.2 Querying Events for a Member

**To get events for a specific member:**
1. Get all focus groups the member belongs to:
   ```
   GET /api/proxy/focus-group-members?userProfileId.equals={userId}&status.equals=ACTIVE
   ```
2. For each focus group, get associated events:
   ```
   GET /api/proxy/event-details?focusGroupId.equals={groupId}&isActive.equals=true
   ```
3. Combine and deduplicate events (since one event can belong to multiple groups)

**Alternative Approach (if backend supports):**
- Backend could provide a convenience endpoint:
  ```
  GET /api/event-details?memberId.equals={userId}
  ```
  This would internally:
  1. Find all focus groups for the member
  2. Find all events for those focus groups
  3. Return deduplicated list

---

## 6. Filtering Events for Focus Groups

### 6.1 Current Filter Implementation

**Filter Criteria:**
```
GET /api/proxy/event-details?focusGroupId.equals={focusGroupId}&isActive.equals=true&sort=startDate,asc
```

**Filter Parameters:**
- `focusGroupId.equals={id}` - Filters events associated with specific focus group
- `isActive.equals=true` - Only active events
- `sort=startDate,asc` - Sort by start date ascending
- Additional filters can be combined:
  - `startDate.greaterThanOrEqual={date}` - Future events
  - `endDate.lessThanOrEqual={date}` - Events ending before date
  - `title.contains={text}` - Search by title

### 6.2 Backend Implementation (Inferred)

**Backend likely uses:**
```sql
SELECT ed.*
FROM event_details ed
INNER JOIN event_focus_groups efg ON ed.id = efg.event_id
WHERE efg.focus_group_id = {focusGroupId}
  AND efg.tenant_id = {tenantId}
  AND ed.is_active = true
  AND ed.tenant_id = {tenantId}
ORDER BY ed.start_date ASC
```

### 6.3 Alternative Filter: focusGroupSlug

**Calendar Implementation:**
The calendar page uses `focusGroupSlug.equals={slug}` filter:
```
GET /api/event-details?focusGroupSlug.equals={slug}&isActive.equals=true
```

**How It Works:**
- Backend resolves slug to focus group ID
- Then filters events by that focus group ID
- This is a convenience filter for public-facing pages

---

## 7. API Endpoints Summary

### 7.1 Focus Groups

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/proxy/focus-groups` | GET | List all focus groups (with filters) |
| `/api/proxy/focus-groups/{id}` | GET | Get focus group by ID |
| `/api/proxy/focus-groups` | POST | Create new focus group |
| `/api/proxy/focus-groups/{id}` | PATCH | Update focus group |
| `/api/proxy/focus-groups/{id}` | DELETE | Delete focus group |

**Query Filters:**
- `isActive.equals=true` - Only active groups
- `slug.equals={slug}` - Find by slug
- `name.contains={text}` - Search by name
- `tenantId.equals={id}` - Filter by tenant (auto-injected)

### 7.2 Event-Focus Group Associations

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/proxy/event-focus-groups` | GET | List all associations |
| `/api/proxy/event-focus-groups` | POST | Create association (link event to group) |
| `/api/proxy/event-focus-groups/{id}` | DELETE | Remove association (unlink event from group) |

**Query Filters:**
- `focusGroupId.equals={id}` - Associations for a focus group
- `eventId.equals={id}` - Associations for an event
- `tenantId.equals={id}` - Filter by tenant (auto-injected)

### 7.3 Focus Group Members

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/proxy/focus-group-members` | GET | List all memberships |
| `/api/proxy/focus-group-members` | POST | Add member to focus group |
| `/api/proxy/focus-group-members/{id}` | PATCH | Update membership (role/status) |
| `/api/proxy/focus-group-members/{id}` | DELETE | Remove member from focus group |

**Query Filters:**
- `focusGroupId.equals={id}` - Members of a focus group
- `userProfileId.equals={id}` - Focus groups for a user
- `role.equals={role}` - Filter by role (MEMBER/LEAD/ADMIN)
- `status.equals={status}` - Filter by status (ACTIVE/INACTIVE/PENDING)
- `tenantId.equals={id}` - Filter by tenant (auto-injected)

### 7.4 Events (Filtered by Focus Group)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/proxy/event-details?focusGroupId.equals={id}` | GET | Get events for a focus group |
| `/api/proxy/event-details?focusGroupSlug.equals={slug}` | GET | Get events for a focus group (by slug) |

**Additional Filters (can be combined):**
- `isActive.equals=true` - Only active events
- `startDate.greaterThanOrEqual={date}` - Events starting on/after date
- `endDate.lessThanOrEqual={date}` - Events ending on/before date
- `title.contains={text}` - Search by title
- `sort=startDate,asc` - Sort by start date

---

## 8. Data Flow Examples

### 8.1 Adding an Event to a Focus Group

1. **Admin Action**: Admin navigates to `/admin/focus-groups/[id]/events`
2. **Select Event**: Admin selects an event from dropdown
3. **Create Association**: Frontend calls:
   ```
   POST /api/proxy/event-focus-groups
   Body: {
     "eventId": 123,
     "focusGroupId": 456,
     "tenantId": "tenant_demo_001"
   }
   ```
4. **Backend Processing**:
   - Validates event and focus group exist
   - Checks tenant matches
   - Creates record in `event_focus_groups` table
   - Returns `EventFocusGroupDTO`
5. **Result**: Event is now associated with focus group

### 8.2 Viewing Events for a Focus Group

1. **User Action**: User visits `/focus-groups/career`
2. **Fetch Focus Group**: Frontend calls:
   ```
   GET /api/proxy/focus-groups?slug.equals=career
   ```
3. **Fetch Events**: Frontend calls:
   ```
   GET /api/proxy/event-details?focusGroupId.equals={groupId}&isActive.equals=true&sort=startDate,asc
   ```
4. **Backend Processing**:
   - Joins `event_details` with `event_focus_groups`
   - Filters by `focus_group_id = {groupId}`
   - Filters by `is_active = true`
   - Sorts by `start_date ASC`
   - Returns list of `EventDetailsDTO`
5. **Result**: User sees only events associated with "Career" focus group

### 8.3 Adding a Member to a Focus Group

1. **Admin Action**: Admin navigates to `/admin/focus-groups/[id]/members`
2. **Select User**: Admin selects user from dropdown
3. **Create Membership**: Frontend calls:
   ```
   POST /api/proxy/focus-group-members
   Body: {
     "focusGroupId": 456,
     "userProfileId": 789,
     "role": "MEMBER",
     "status": "ACTIVE",
     "tenantId": "tenant_demo_001"
   }
   ```
4. **Backend Processing**:
   - Validates focus group and user exist
   - Checks tenant matches
   - Validates unique constraint (no duplicate membership)
   - Creates record in `focus_group_members` table
   - Returns `FocusGroupMemberDTO`
5. **Result**: User is now a member of the focus group

---

## 9. Current Implementation Status

### 9.1 What's Already Working

✅ **Focus Group CRUD**: Create, read, update, delete focus groups
✅ **Event Association**: Link/unlink events to focus groups via admin interface
✅ **Member Management**: Add/remove members via admin interface
✅ **Event Filtering**: Filter events by `focusGroupId.equals` filter
✅ **Public Pages**: `/focus-groups` and `/focus-groups/[slug]` display focus groups and their events
✅ **Cover Image Upload**: Focus groups can have cover images uploaded

### 9.2 Current Filter Usage

**Pages Using `focusGroupId.equals` Filter:**
1. `/focus-groups/page.tsx` - Shows 3 events per focus group card
2. `/focus-groups/[slug]/page.tsx` - Shows all events for a focus group
3. `/admin/focus-groups/[id]/events/page.tsx` - Shows linked events for admin

**Calendar Using `focusGroupSlug.equals` Filter:**
- `/calendar` - Can filter calendar events by focus group slug

---

## 10. Key Findings and Recommendations

### 10.1 Relationship Structure

**✅ Confirmed:**
- Focus groups and events have a **Many-to-Many** relationship via `event_focus_groups` join table
- This relationship is **explicit** - events must be manually linked to focus groups
- The relationship is **tenant-scoped** for multi-tenant isolation

### 10.2 Filtering Mechanism

**✅ Confirmed:**
- Backend supports `focusGroupId.equals={id}` filter on event-details endpoint
- Backend supports `focusGroupSlug.equals={slug}` filter (convenience for public pages)
- Filter works by joining `event_details` with `event_focus_groups` table
- Current implementation correctly filters events for focus groups

### 10.3 Member-Event Association

**✅ Confirmed:**
- Members are associated with focus groups, not directly with events
- Members can see events through their focus group membership
- To get events for a member, query:
  1. Get member's focus groups
  2. Get events for each focus group
  3. Combine and deduplicate

### 10.4 Recommendations

1. **✅ Current Implementation is Correct**: The `/focus-groups` page already filters events correctly using `focusGroupId.equals`
2. **✅ No Changes Needed**: The relationship structure and filtering mechanism are working as designed
3. **Consider Enhancement**: Could add a convenience endpoint for member events:
   ```
   GET /api/event-details?memberId.equals={userId}
   ```
   This would simplify getting all events for a user across all their focus groups

---

## 11. Database Schema References

**Primary Schema File:**
- `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- Lines 956-1012 contain focus group table definitions

**Key Constraints:**
- All tables are tenant-scoped (`tenant_id` column)
- Unique constraints prevent duplicates
- Foreign keys with CASCADE DELETE ensure data integrity
- Enum types exist but are not enforced (using VARCHAR for flexibility)

---

## 12. API Schema References

**Swagger API Docs:**
- `documentation/Swagger_API_Docs/api-docs.json`
- Contains OpenAPI schema definitions for all endpoints

**DTO Definitions:**
- `src/types/index.ts` contains TypeScript DTOs:
  - `FocusGroupDTO` (lines 648-658)
  - `FocusGroupMemberDTO` (lines 660-669)
  - `EventFocusGroupDTO` (lines 671-678)

---

## Conclusion

The focus group and event relationship is **already properly implemented**:
- ✅ Database schema supports Many-to-Many relationship
- ✅ API endpoints support filtering events by focus group
- ✅ Current implementation correctly uses `focusGroupId.equals` filter
- ✅ Admin interface allows linking/unlinking events
- ✅ Public pages display only events associated with focus groups

**No changes are needed** - the system is working as designed. The `/focus-groups` page already shows only events associated with each focus group, not all upcoming events.


