-- =============================================
-- Migration: Make event_id nullable for multi-event support
-- Date: 2025-11-04
-- Description: Allows entities to be associated with multiple events
--              and disassociated by setting event_id to NULL
--
-- Tables Modified:
--   - event_featured_performers
--   - event_contacts
--   - event_emails
--   - event_program_directors
--
-- Note: event_sponsors already has nullable event_id and uses join table
-- =============================================

BEGIN;

-- =============================================
-- Step 1: Drop existing foreign key constraints
-- =============================================

ALTER TABLE public.event_featured_performers
    DROP CONSTRAINT IF EXISTS fk_event_featured_performers_event_id;

ALTER TABLE public.event_contacts
    DROP CONSTRAINT IF EXISTS fk_event_contacts_event_id;

ALTER TABLE public.event_emails
    DROP CONSTRAINT IF EXISTS fk_event_emails_event_id;

ALTER TABLE public.event_program_directors
    DROP CONSTRAINT IF EXISTS fk_event_program_directors_event_id;

-- =============================================
-- Step 2: Make event_id nullable
-- =============================================

ALTER TABLE public.event_featured_performers
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_contacts
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_emails
    ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE public.event_program_directors
    ALTER COLUMN event_id DROP NOT NULL;

-- =============================================
-- Step 3: Re-add foreign key constraints (allowing NULL)
-- =============================================

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

-- =============================================
-- Step 4: Add unique constraints to prevent duplicate associations
-- Using partial unique indexes for better NULL handling
-- =============================================

-- event_contacts: Unique per tenant+event+name+phone
-- Prevents same contact (name+phone) from being added twice to same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_contact_tenant_event_name_phone
ON public.event_contacts (tenant_id, event_id, name, phone)
WHERE event_id IS NOT NULL;

-- event_contacts: Unique per tenant+event+email (if email provided)
-- Prevents same contact (email) from being added twice to same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_contact_tenant_event_email
ON public.event_contacts (tenant_id, event_id, email)
WHERE event_id IS NOT NULL AND email IS NOT NULL;

-- event_featured_performers: Unique per tenant+event+name+stage_name
-- Prevents same performer (name+stage_name) from being added twice to same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_performer_tenant_event_name_stage
ON public.event_featured_performers (tenant_id, event_id, name, stage_name)
WHERE event_id IS NOT NULL AND stage_name IS NOT NULL;

-- event_featured_performers: Unique per tenant+event+email (if email provided)
-- Prevents same performer (email) from being added twice to same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_performer_tenant_event_email
ON public.event_featured_performers (tenant_id, event_id, email)
WHERE event_id IS NOT NULL AND email IS NOT NULL;

-- event_emails: Unique per tenant+event+email
-- Prevents same email from being added twice to same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_email_tenant_event_email
ON public.event_emails (tenant_id, event_id, email)
WHERE event_id IS NOT NULL;

-- event_program_directors: Unique per tenant+event+name
-- Prevents same director name from being added twice to same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_director_tenant_event_name
ON public.event_program_directors (tenant_id, event_id, name)
WHERE event_id IS NOT NULL;

-- =============================================
-- Step 5: Add performance indexes for queries filtering by event_id
-- =============================================

CREATE INDEX IF NOT EXISTS idx_event_featured_performers_tenant_event
ON public.event_featured_performers (tenant_id, event_id)
WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_contacts_tenant_event
ON public.event_contacts (tenant_id, event_id)
WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_emails_tenant_event
ON public.event_emails (tenant_id, event_id)
WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_program_directors_tenant_event
ON public.event_program_directors (tenant_id, event_id)
WHERE event_id IS NOT NULL;

-- Index for finding tenant-level entities (where event_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_event_featured_performers_tenant_null_event
ON public.event_featured_performers (tenant_id)
WHERE event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_contacts_tenant_null_event
ON public.event_contacts (tenant_id)
WHERE event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_emails_tenant_null_event
ON public.event_emails (tenant_id)
WHERE event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_program_directors_tenant_null_event
ON public.event_program_directors (tenant_id)
WHERE event_id IS NULL;

COMMIT;

-- =============================================
-- Verification Queries
-- =============================================

-- Verify columns are nullable
SELECT
    table_name,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'event_featured_performers',
        'event_contacts',
        'event_emails',
        'event_program_directors'
    )
    AND column_name = 'event_id'
ORDER BY table_name;

-- Verify unique indexes were created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'unique_event_%'
ORDER BY indexname;

-- Verify foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
        'event_featured_performers',
        'event_contacts',
        'event_emails',
        'event_program_directors'
    )
    AND kcu.column_name = 'event_id'
ORDER BY tc.table_name;

