-- =============================================================================
-- Fix: smoother ID generation (increment by 1 instead of 50)
-- Database: event_site_manager_db (local / dev / prod)
--
-- WHY IDs jump to 600000+:
--   1. MOSC seed file uses explicit IDs in the 600001+ block (tenant isolation).
--   2. One shared sequence (sequence_generator) serves 50+ tables — every insert
--      in ANY table advances the same counter.
--   3. INCREMENT BY 50 matches Hibernate/JHipster allocationSize=50 (gaps of 50).
--
-- REQUIRED with this SQL change:
--   Backend entities must use @SequenceGenerator(..., allocationSize = 1)
--   matching INCREMENT BY 1. If allocationSize stays 50, you will get duplicate
--   primary key errors.
--
-- Run on local first (stop Spring Boot / ECS task before applying in shared envs).
-- =============================================================================

BEGIN;

-- Show current state
SELECT sequencename, increment_by, last_value
FROM pg_sequences
WHERE schemaname = 'public' AND sequencename = 'sequence_generator';

-- Align sequence to highest ID in use (never decrease)
SELECT pg_catalog.setval(
    'public.sequence_generator',
    GREATEST(
        COALESCE((SELECT last_value FROM public.sequence_generator), 0),
        COALESCE((SELECT MAX(id) FROM public.user_profile), 0),
        COALESCE((SELECT MAX(id) FROM public.event_details), 0),
        COALESCE((SELECT MAX(id) FROM public.event_attendee), 0),
        COALESCE((SELECT MAX(id) FROM public.event_type_details), 0),
        COALESCE((SELECT MAX(id) FROM public.event_ticket_transaction), 0),
        COALESCE((SELECT MAX(id) FROM public.event_competition_registration), 0),
        1
    ),
    true
);

ALTER SEQUENCE public.sequence_generator INCREMENT BY 1;

-- Verify
SELECT sequencename, increment_by, last_value
FROM pg_sequences
WHERE schemaname = 'public' AND sequencename = 'sequence_generator';

COMMIT;
