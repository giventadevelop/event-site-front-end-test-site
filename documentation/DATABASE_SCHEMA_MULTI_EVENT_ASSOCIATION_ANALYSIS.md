# Database Schema Multi-Event Association Analysis & Migration Plan

## Executive Summary

**Current State:**
- Most tables have `event_id` as `NOT NULL`, allowing only one event per entity
- `event_sponsors` already has nullable `event_id` but uses a join table for many-to-many
- Foreign keys use `ON DELETE CASCADE`

**Desired State:**
- Make `event_id` nullable for all entity tables
- Allow one entity to be associated with multiple events (one-to-many via multiple records)
- Allow disassociation by setting `event_id` to NULL
- Ensure uniqueness based on `(tenant_id, event_id, entity-specific-fields)`

**Recommendation:** ✅ **This approach is viable and recommended** with proper unique constraints.

---

## Current Schema Analysis

### Tables Requiring Changes

| Table | Current `event_id` | Foreign Key | Requires Change |
|-------|-------------------|-------------|-----------------|
| `event_featured_performers` | `bigint NOT NULL` | `ON DELETE CASCADE` | ✅ Yes |
| `event_contacts` | `bigint NOT NULL` | `ON DELETE CASCADE` | ✅ Yes |
| `event_sponsors` | `int8 NULL` | `ON DELETE CASCADE` | ⚠️ Already nullable but uses join table |
| `event_emails` | `bigint NOT NULL` | `ON DELETE CASCADE` | ✅ Yes |
| `event_program_directors` | `bigint NOT NULL` | `ON DELETE CASCADE` | ✅ Yes |

### Special Case: `event_sponsors`

**Current Implementation:**
- `event_sponsors.event_id` is already nullable
- Uses `event_sponsors_join` table for many-to-many relationships
- This is the **correct pattern** for sponsors

**Recommendation:** Keep sponsors as-is (join table approach). For other entities, use the nullable `event_id` approach.

---

## Proposed Schema Changes

### 1. Make `event_id` Nullable

**Tables to Modify:**
- `event_featured_performers`
- `event_contacts`
- `event_emails`
- `event_program_directors`

**SQL Migration:**
```sql
-- Step 1: Drop foreign key constraints
ALTER TABLE public.event_featured_performers
    DROP CONSTRAINT IF EXISTS fk_event_featured_performers_event_id;

ALTER TABLE public.event_contacts
    DROP CONSTRAINT IF EXISTS fk_event_contacts_event_id;

ALTER TABLE public.event_emails
    DROP CONSTRAINT IF EXISTS fk_event_emails_event_id;

ALTER TABLE public.event_program_directors
    DROP CONSTRAINT IF EXISTS fk_event_program_directors_event_id;

-- Step 2: Alter columns to allow NULL
ALTER TABLE public.event_featured_performers
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_contacts
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_emails
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_program_directors
    ALTER COLUMN event_id DROP NOT NULL;

-- Step 3: Re-add foreign key constraints with NULL handling
ALTER TABLE public.event_featured_performers
    ADD CONSTRAINT fk_event_featured_performers_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

ALTER TABLE public.event_contacts
    ADD CONSTRAINT fk_event_contacts_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

ALTER TABLE public.event_emails
    ADD CONSTRAINT fk_event_emails_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

ALTER TABLE public.event_program_directors
    ADD CONSTRAINT fk_event_program_directors_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;
```

### 2. Add Unique Constraints

**Purpose:** Prevent duplicate associations of the same entity with the same event.

**Unique Constraint Definitions:**

```sql
-- event_contacts: Prevent same contact (name+phone or email) for same event+tenant
ALTER TABLE public.event_contacts
    ADD CONSTRAINT unique_event_contact_tenant_event_name_phone
    UNIQUE NULLS NOT DISTINCT (tenant_id, event_id, name, phone);

-- Alternative: If email is primary identifier
ALTER TABLE public.event_contacts
    ADD CONSTRAINT unique_event_contact_tenant_event_email
    UNIQUE NULLS NOT DISTINCT (tenant_id, event_id, email)
    WHERE email IS NOT NULL;

-- event_featured_performers: Prevent same performer (name+stage_name or email) for same event+tenant
ALTER TABLE public.event_featured_performers
    ADD CONSTRAINT unique_event_performer_tenant_event_name_stage
    UNIQUE NULLS NOT DISTINCT (tenant_id, event_id, name, stage_name)
    WHERE stage_name IS NOT NULL;

ALTER TABLE public.event_featured_performers
    ADD CONSTRAINT unique_event_performer_tenant_event_email
    UNIQUE NULLS NOT DISTINCT (tenant_id, event_id, email)
    WHERE email IS NOT NULL;

-- event_emails: Prevent same email for same event+tenant
ALTER TABLE public.event_emails
    ADD CONSTRAINT unique_event_email_tenant_event_email
    UNIQUE NULLS NOT DISTINCT (tenant_id, event_id, email);

-- event_program_directors: Prevent same director name for same event+tenant
ALTER TABLE public.event_program_directors
    ADD CONSTRAINT unique_event_director_tenant_event_name
    UNIQUE NULLS NOT DISTINCT (tenant_id, event_id, name);
```

**Note:** PostgreSQL 15+ supports `NULLS NOT DISTINCT` which treats NULL values as equal for uniqueness. For older versions, use partial unique indexes.

---

## Use Cases Supported

### 1. **Disassociation**
```sql
-- Disassociate a contact from an event (keep contact in system)
UPDATE event_contacts
SET event_id = NULL
WHERE id = 4001;
```

### 2. **Multiple Event Associations**
```sql
-- Same contact associated with multiple events
INSERT INTO event_contacts (tenant_id, event_id, name, phone, email)
VALUES ('tenant_demo_002', 3, 'Sarah Johnson', '+1-555-0101', 'sarah.johnson@example.com');

INSERT INTO event_contacts (tenant_id, event_id, name, phone, email)
VALUES ('tenant_demo_002', 5, 'Sarah Johnson', '+1-555-0101', 'sarah.johnson@example.com');
```

### 3. **Tenant-Level Entities (No Event)**
```sql
-- Create a contact without event association (global to tenant)
INSERT INTO event_contacts (tenant_id, event_id, name, phone, email)
VALUES ('tenant_demo_002', NULL, 'Sarah Johnson', '+1-555-0101', 'sarah.johnson@example.com');
```

---

## Backend Spring Boot Changes Required

### 1. Entity Classes (`E:\project_workspace\malayalees-us-site-boot`)

**Files to Modify:**
- `EventFeaturedPerformers.java`
- `EventContacts.java`
- `EventEmails.java`
- `EventProgramDirectors.java`

**Changes Needed:**

```java
// Before:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "event_id", nullable = false)
private EventDetails event;

// After:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "event_id", nullable = true)  // Changed to nullable = true
private EventDetails event;
```

### 2. DTO Classes

**Files to Modify:**
- `EventFeaturedPerformersDTO.java`
- `EventContactsDTO.java`
- `EventEmailsDTO.java`
- `EventProgramDirectorsDTO.java`

**Changes Needed:**
- Ensure `event` field can be `null` in DTOs
- Update validation logic to allow `null` event

### 3. Repository/Search Logic

**Files to Review:**
- `EventFeaturedPerformersRepository.java`
- `EventContactsRepository.java`
- `EventEmailsRepository.java`
- `EventProgramDirectorsRepository.java`

**Changes Needed:**
- Update query methods to handle `event_id IS NULL` cases
- Add methods to find tenant-level entities (where `event_id IS NULL`)

### 4. Service Layer

**Files to Review:**
- `EventFeaturedPerformersService.java`
- `EventContactsService.java`
- `EventEmailsService.java`
- `EventProgramDirectorsService.java`

**Changes Needed:**
- Update business logic to handle nullable events
- Add validation for unique constraints
- Update disassociation logic

### 5. Resource/Controller Layer

**Files to Review:**
- `EventFeaturedPerformersResource.java`
- `EventContactsResource.java`
- `EventEmailsResource.java`
- `EventProgramDirectorsResource.java`

**Changes Needed:**
- Update API endpoints to accept `null` event
- Add filtering for tenant-level entities

---

## Migration Script

**File:** `code_html_template/SQLS/migration_make_event_id_nullable.sql`

```sql
-- =============================================
-- Migration: Make event_id nullable for multi-event support
-- Date: 2025-11-04
-- Description: Allows entities to be associated with multiple events
--              and disassociated by setting event_id to NULL
-- =============================================

BEGIN;

-- Step 1: Drop existing foreign key constraints
ALTER TABLE public.event_featured_performers
    DROP CONSTRAINT IF EXISTS fk_event_featured_performers_event_id;

ALTER TABLE public.event_contacts
    DROP CONSTRAINT IF EXISTS fk_event_contacts_event_id;

ALTER TABLE public.event_emails
    DROP CONSTRAINT IF EXISTS fk_event_emails_event_id;

ALTER TABLE public.event_program_directors
    DROP CONSTRAINT IF EXISTS fk_event_program_directors_event_id;

-- Step 2: Make event_id nullable
ALTER TABLE public.event_featured_performers
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_contacts
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_emails
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_program_directors
    ALTER COLUMN event_id DROP NOT NULL;

-- Step 3: Re-add foreign key constraints (allowing NULL)
ALTER TABLE public.event_featured_performers
    ADD CONSTRAINT fk_event_featured_performers_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

ALTER TABLE public.event_contacts
    ADD CONSTRAINT fk_event_contacts_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

ALTER TABLE public.event_emails
    ADD CONSTRAINT fk_event_emails_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

ALTER TABLE public.event_program_directors
    ADD CONSTRAINT fk_event_program_directors_event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;

-- Step 4: Add unique constraints to prevent duplicate associations
-- Note: Using partial unique indexes for better NULL handling in older PostgreSQL

-- event_contacts: Unique per tenant+event+name+phone
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_contact_tenant_event_name_phone
ON public.event_contacts (tenant_id, event_id, name, phone)
WHERE event_id IS NOT NULL;

-- event_contacts: Unique per tenant+event+email (if email provided)
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_contact_tenant_event_email
ON public.event_contacts (tenant_id, event_id, email)
WHERE event_id IS NOT NULL AND email IS NOT NULL;

-- event_featured_performers: Unique per tenant+event+name+stage_name
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_performer_tenant_event_name_stage
ON public.event_featured_performers (tenant_id, event_id, name, stage_name)
WHERE event_id IS NOT NULL AND stage_name IS NOT NULL;

-- event_featured_performers: Unique per tenant+event+email (if email provided)
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_performer_tenant_event_email
ON public.event_featured_performers (tenant_id, event_id, email)
WHERE event_id IS NOT NULL AND email IS NOT NULL;

-- event_emails: Unique per tenant+event+email
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_email_tenant_event_email
ON public.event_emails (tenant_id, event_id, email)
WHERE event_id IS NOT NULL;

-- event_program_directors: Unique per tenant+event+name
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_director_tenant_event_name
ON public.event_program_directors (tenant_id, event_id, name)
WHERE event_id IS NOT NULL;

COMMIT;
```

---

## Updated Schema File

**File:** `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

**Changes Required:**

1. **Line 3127:** Change `event_id bigint NOT NULL` to `event_id bigint NULL`
2. **Line 3184:** Change `event_id bigint NOT NULL` to `event_id bigint NULL`
3. **Line 3255:** Change `event_id bigint NOT NULL` to `event_id bigint NULL`
4. **Line 3267:** Change `event_id bigint NOT NULL` to `event_id bigint NULL`
5. **Add unique constraints** after table creation (see migration script above)

---

## Risks & Considerations

### 1. **Data Integrity**
- ✅ Foreign key constraints remain (NULL values bypass FK checks)
- ✅ Unique constraints prevent duplicate associations
- ⚠️ Need to handle orphaned records (where `event_id` is NULL)

### 2. **Query Performance**
- ✅ Partial unique indexes improve performance
- ⚠️ Queries filtering by `event_id IS NULL` may need indexes
- **Recommendation:** Add index on `(tenant_id, event_id)` for all tables

### 3. **Application Logic**
- ⚠️ Frontend and backend must handle NULL events
- ⚠️ API endpoints must support filtering by `event_id IS NULL`
- ⚠️ Validation logic must account for nullable events

### 4. **Backward Compatibility**
- ✅ Existing queries with `event_id = X` still work
- ✅ Cascade delete still works for non-NULL events
- ⚠️ Need to update queries that assume `event_id` is always present

---

## Testing Checklist

### Database Level
- [ ] Migration script runs successfully
- [ ] Foreign keys allow NULL values
- [ ] Unique constraints prevent duplicates
- [ ] Cascade delete works for non-NULL events
- [ ] NULL events don't trigger cascade delete

### Backend Level
- [ ] Entity classes compile with nullable event
- [ ] DTOs accept null event
- [ ] Repository queries handle NULL events
- [ ] Service layer validates unique constraints
- [ ] API endpoints return correct data for NULL events

### Frontend Level
- [ ] UI handles entities without events
- [ ] Disassociation sets event to null
- [ ] Multiple event associations work correctly
- [ ] Duplicate prevention shows proper errors

---

## Alternative Approach: Join Tables

**Consideration:** For true many-to-many relationships, join tables (like `event_sponsors_join`) are more normalized.

**Pros:**
- Cleaner separation of entity and association
- Easier to add metadata to associations (e.g., `priority`, `role`)
- Better for complex relationships

**Cons:**
- More complex queries
- Requires more code changes
- Overkill for simple associations

**Recommendation:** Current nullable `event_id` approach is sufficient for this use case.

---

## Conclusion

✅ **This change is feasible and recommended.**

**Benefits:**
- Allows flexible event associations
- Supports disassociation without deletion
- Maintains data integrity with unique constraints
- Minimal disruption to existing code

**Action Items:**
1. Run migration script on development database
2. Update Spring Boot entities and DTOs
3. Update repository/service/controller layers
4. Test thoroughly before production deployment
5. Update frontend to handle nullable events

**Estimated Effort:**
- Database migration: 1-2 hours
- Backend changes: 4-6 hours
- Testing: 2-3 hours
- **Total: 7-11 hours**

