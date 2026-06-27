# Event Details Admin Pages Analysis

## Overview
This document analyzes the admin pages for managing event-related entities (Featured Performers, Contacts, Program Directors, and Sponsors) and their association with events.

---

## 1. Event Featured Performers

### ✅ What Exists

#### **Global Admin Page** (`/admin/event-featured-performers`)
- **Location**: `src/app/admin/event-featured-performers/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations (Create, Read, Update, Delete)
  - ✅ Search and filter functionality
  - ✅ DataTable with sorting
- **Event Association**:
  - ❌ **NO event selection field in create/edit forms**
  - ❌ Records can be created **without** event association
  - ✅ DTO supports `event?: EventDetailsDTO` (optional)
  - ✅ API supports filtering by `eventId.equals` (optional parameter)

#### **Event-Specific Admin Page** (`/admin/events/[id]/performers`)
- **Location**: `src/app/admin/events/[id]/performers/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations
  - ✅ Automatically associates performers with the event (via URL `eventId`)
  - ✅ Shows performers filtered by event ID
  - ✅ Image upload support via `ImageUpload` component
- **Event Association**:
  - ✅ **Always associated** with the event (from URL parameter)
  - ✅ Form includes `event: { id: parseInt(eventId) }` in payload

### ❌ What's Missing

1. **Global Admin Page Event Association**:
   - ❌ No event dropdown/selection in create/edit forms
   - ❌ Cannot associate existing performers with events from global page
   - ❌ Cannot view which events a performer is associated with
   - ❌ No way to associate/disassociate performers from events

2. **Navigation**:
   - ✅ Linked from event edit page (`/admin/events/[id]/edit`)
   - ✅ Linked from event overview page (`/admin/events/[id]`)
   - ✅ Global admin navigation includes "Global Performers"

---

## 2. Event Contacts

### ✅ What Exists

#### **Global Admin Page** (`/admin/event-contacts`)
- **Location**: `src/app/admin/event-contacts/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations
  - ✅ Search and filter functionality
  - ✅ DataTable with sorting
- **Event Association**:
  - ❌ **NO event selection field in create/edit forms**
  - ❌ Records can be created **without** event association
  - ✅ DTO supports `event?: EventDetailsDTO` (optional)
  - ✅ API supports filtering by `eventId.equals` (optional parameter)

#### **Event-Specific Admin Page** (`/admin/events/[id]/contacts`)
- **Location**: `src/app/admin/events/[id]/contacts/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations
  - ✅ Automatically associates contacts with the event (via URL `eventId`)
  - ✅ Shows contacts filtered by event ID
- **Event Association**:
  - ✅ **Always associated** with the event (from URL parameter)
  - ✅ Form includes `event: { id: parseInt(eventId) }` in payload

### ❌ What's Missing

1. **Global Admin Page Event Association**:
   - ❌ No event dropdown/selection in create/edit forms
   - ❌ Cannot associate existing contacts with events from global page
   - ❌ Cannot view which events a contact is associated with
   - ❌ No way to associate/disassociate contacts from events

2. **Form Field Mismatch**:
   - ⚠️ Global form uses `contactType`, `contactName`, `organization`, `title`, `isPrimary`, `notes`
   - ⚠️ Event-specific form uses `name`, `phone`, `email`
   - ⚠️ DTO only has `name`, `phone`, `email` - global form fields don't match DTO

3. **Navigation**:
   - ✅ Linked from event edit page (`/admin/events/[id]/edit`)
   - ✅ Linked from event overview page (`/admin/events/[id]`)
   - ✅ Global admin navigation includes "Global Contacts"

---

## 3. Event Program Directors

### ✅ What Exists

#### **Global Admin Page** (`/admin/event-program-directors`)
- **Location**: `src/app/admin/event-program-directors/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations
  - ✅ Search and filter functionality
  - ✅ DataTable with sorting
- **Event Association**:
  - ❌ **NO event selection field in create/edit forms**
  - ❌ Records can be created **without** event association
  - ✅ DTO supports `event?: EventDetailsDTO` (optional)
  - ✅ API supports filtering by `eventId.equals` (optional parameter)

#### **Event-Specific Admin Page** (`/admin/events/[id]/program-directors`)
- **Location**: `src/app/admin/events/[id]/program-directors/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations
  - ✅ Automatically associates directors with the event (via URL `eventId`)
  - ✅ Shows directors filtered by event ID
  - ✅ Image upload support via `ImageUpload` component
- **Event Association**:
  - ✅ **Always associated** with the event (from URL parameter)
  - ✅ Form includes `event: { id: parseInt(eventId) }` in payload

### ❌ What's Missing

1. **Global Admin Page Event Association**:
   - ❌ No event dropdown/selection in create/edit forms
   - ❌ Cannot associate existing directors with events from global page
   - ❌ Cannot view which events a director is associated with
   - ❌ No way to associate/disassociate directors from events

2. **Navigation**:
   - ✅ Linked from event edit page (`/admin/events/[id]/edit`)
   - ✅ Linked from event overview page (`/admin/events/[id]`)
   - ✅ Global admin navigation includes "Global Directors"

---

## 4. Event Sponsors

### ✅ What Exists

#### **Global Admin Page** (`/admin/event-sponsors`)
- **Location**: `src/app/admin/event-sponsors/page.tsx`
- **Functionality**:
  - ✅ Full CRUD operations for sponsor entities
  - ✅ Search and filter functionality
  - ✅ Image upload support (logo, hero, banner)
  - ✅ DTO-aligned form fields
- **Event Association**:
  - ❌ **NO direct event association** in global page
  - ⚠️ Database schema has `event_id` field, but DTO doesn't include it
  - ✅ Uses many-to-many relationship via `event_sponsors_join` table

#### **Event-Specific Admin Page** (`/admin/events/[id]/sponsors`)
- **Location**: `src/app/admin/events/[id]/sponsors/page.tsx`
- **Functionality**:
  - ✅ View sponsors assigned to event
  - ✅ Assign existing sponsors to event (via `EventSponsorsJoinDTO`)
  - ✅ Create new sponsor and assign to event
  - ✅ Remove sponsor from event
  - ✅ Edit sponsor details
  - ✅ Pagination for available sponsors
- **Event Association**:
  - ✅ Uses `EventSponsorsJoinDTO` for many-to-many relationship
  - ✅ Can assign/unassign sponsors to/from events
  - ✅ Shows only sponsors assigned to the specific event

### ✅ What's Working Well

1. **Many-to-Many Relationship**:
   - ✅ Properly implemented using join table
   - ✅ Allows sponsors to be reused across multiple events
   - ✅ Can assign/unassign sponsors dynamically

2. **Navigation**:
   - ✅ Linked from event edit page (`/admin/events/[id]/edit`)
   - ✅ Linked from event overview page (`/admin/events/[id]`)
   - ✅ Global admin navigation includes "Global Sponsors"

### ❌ What's Missing

1. **Global Admin Page Event Association**:
   - ⚠️ Cannot view which events a sponsor is assigned to from global page
   - ⚠️ No indication of event associations in global sponsor list

---

## Summary Table

| Entity | Global Admin Page | Event-Specific Page | Event Association in Global Page | Missing Features |
|--------|-------------------|-------------------|----------------------------------|------------------|
| **Featured Performers** | ✅ `/admin/event-featured-performers` | ✅ `/admin/events/[id]/performers` | ❌ No event selection | Event dropdown, view associations, associate/disassociate |
| **Contacts** | ✅ `/admin/event-contacts` | ✅ `/admin/events/[id]/contacts` | ❌ No event selection | Event dropdown, view associations, associate/disassociate, form field mismatch |
| **Program Directors** | ✅ `/admin/event-program-directors` | ✅ `/admin/events/[id]/program-directors` | ❌ No event selection | Event dropdown, view associations, associate/disassociate |
| **Sponsors** | ✅ `/admin/event-sponsors` | ✅ `/admin/events/[id]/sponsors` | ⚠️ Uses join table | View event associations in global page |

---

## TODO: Remaining Work

### 🔴 High Priority

1. **Add Event Association to Global Admin Pages**:
   - [ ] Add event dropdown/selector to create/edit forms in:
     - `/admin/event-featured-performers`
     - `/admin/event-contacts`
     - `/admin/event-program-directors`
   - [ ] Fetch events list for dropdown (use existing `fetchEventsFilteredServer` or similar)
   - [ ] Allow selecting event during create/edit
   - [ ] Display associated event in DataTable columns

2. **Fix Event Contacts Form Field Mismatch**:
   - [ ] Align global contacts form with DTO (`name`, `phone`, `email` only)
   - [ ] Remove non-existent fields (`contactType`, `contactName`, `organization`, `title`, `isPrimary`, `notes`)
   - [ ] Or update DTO to include these fields if backend supports them

3. **Add Event Association Display**:
   - [ ] Show associated event(s) in DataTable for all global admin pages
   - [ ] Add filter by event in global admin pages
   - [ ] Display event name/link in table rows

### 🟡 Medium Priority

4. **Improve Sponsor Global Page**:
   - [ ] Display list of events a sponsor is assigned to
   - [ ] Add filter by event in global sponsors page
   - [ ] Show event count for each sponsor

5. **Add Bulk Association Features**:
   - [ ] Allow associating multiple performers/contacts/directors to an event at once
   - [ ] Allow copying performers/contacts/directors from one event to another

6. **Add Event Association Validation**:
   - [ ] Ensure event association is required or optional based on business rules
   - [ ] Add validation messages for missing event associations

### 🟢 Low Priority

7. **UI/UX Improvements**:
   - [ ] Add "Associate with Event" button in global admin pages
   - [ ] Add quick actions menu (associate, view events, etc.)
   - [ ] Add tooltips explaining the difference between global and event-specific pages

8. **Documentation**:
   - [ ] Document the two-tier approach (global vs event-specific)
   - [ ] Add user guide for managing event associations
   - [ ] Document data flow between global and event-specific pages

---

## Architecture Notes

### Current Pattern

The system uses a **two-tier approach**:

1. **Global Admin Pages** (`/admin/event-*`):
   - Manage entities across all events
   - Entities can exist without event association (optional `event` field)
   - Used for creating reusable entities

2. **Event-Specific Admin Pages** (`/admin/events/[id]/*`):
   - Manage entities for a specific event
   - Always associates entities with the event (via URL parameter)
   - Used for event-specific management

### Data Flow

```
Global Admin Page → Create Entity (no event) → Can be associated later
Event-Specific Page → Create Entity (with event) → Immediately associated
```

### Recommendation

**Option A: Keep Current Pattern** (Recommended)
- Global pages for reusable entities
- Event-specific pages for event management
- Add event association to global pages via dropdown

**Option B: Make Event Required**
- Require event selection in all global admin pages
- Simplify data model (remove optional event field)
- Less flexible but more consistent

---

## DTO Structure

### EventFeaturedPerformersDTO
```typescript
event?: EventDetailsDTO; // Optional - can be null
```

### EventContactsDTO
```typescript
event?: EventDetailsDTO; // Optional - can be null
```

### EventProgramDirectorsDTO
```typescript
event?: EventDetailsDTO; // Optional - can be null
```

### EventSponsorsDTO
```typescript
// No event field - uses join table instead
```

### EventSponsorsJoinDTO
```typescript
event?: EventDetailsDTO; // Required for join records
sponsor?: EventSponsorsDTO; // Required for join records
```

---

## API Endpoints

All entities support filtering by `eventId.equals`:
- `/api/event-featured-performers?eventId.equals=2`
- `/api/event-contacts?eventId.equals=2`
- `/api/event-program-directors?eventId.equals=2`
- `/api/event-sponsors-join?eventId.equals=2` (for sponsors)

---

## Files Reference

### Global Admin Pages
- `src/app/admin/event-featured-performers/page.tsx`
- `src/app/admin/event-contacts/page.tsx`
- `src/app/admin/event-program-directors/page.tsx`
- `src/app/admin/event-sponsors/page.tsx`

### Event-Specific Admin Pages
- `src/app/admin/events/[id]/performers/page.tsx`
- `src/app/admin/events/[id]/contacts/page.tsx`
- `src/app/admin/events/[id]/program-directors/page.tsx`
- `src/app/admin/events/[id]/sponsors/page.tsx`

### API Server Actions
- `src/app/admin/event-featured-performers/ApiServerActions.ts`
- `src/app/admin/event-contacts/ApiServerActions.ts`
- `src/app/admin/event-program-directors/ApiServerActions.ts`
- `src/app/admin/event-sponsors/ApiServerActions.ts`
- `src/app/admin/events/[id]/performers/ApiServerActions.ts`
- `src/app/admin/events/[id]/contacts/ApiServerActions.ts`
- `src/app/admin/events/[id]/program-directors/ApiServerActions.ts`
- `src/app/admin/events/[id]/sponsors/ApiServerActions.ts`

### DTOs
- `src/types/index.ts` (EventFeaturedPerformersDTO, EventContactsDTO, EventProgramDirectorsDTO, EventSponsorsDTO, EventSponsorsJoinDTO)

---

## Conclusion

The admin pages for event-related entities are **mostly complete** with full CRUD functionality. The main gap is the **lack of event association in global admin pages**, which prevents administrators from:
1. Associating existing entities with events from the global pages
2. Viewing which events entities are associated with
3. Managing associations from a centralized location

The **event-specific pages work well** and properly associate entities with events. The **sponsor implementation is the most complete** with proper many-to-many relationship handling.

**Next Steps**: Implement event association dropdowns in global admin pages and fix the contacts form field mismatch.

