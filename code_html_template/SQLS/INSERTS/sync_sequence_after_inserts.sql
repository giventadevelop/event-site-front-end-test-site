-- ===================================================
-- Sequence Synchronization Script
-- ===================================================
-- Purpose: Dynamically synchronize sequence_generator after manual INSERT statements
--
-- Usage:
--   1. Run schema file (Latest_Schema_Post__Blob_Claude_11.sql)
--   2. Run manual INSERT statements (corrected_event_media_inserts.ordered.sql)
--   3. Run this script to sync the sequence
--
-- This script:
--   - Finds the maximum ID across ALL tables using sequence_generator
--   - Sets the sequence to MAX(id) + increment (50) to ensure next value is safe
--   - Handles empty tables gracefully
-- ===================================================

-- Step 1: Find maximum ID across all tables using sequence_generator
-- Note: Add any other tables that use sequence_generator to this list
WITH max_ids AS (
    SELECT MAX(id) as max_id FROM event_details
    UNION ALL
    SELECT MAX(id) FROM user_profile
    UNION ALL
    SELECT MAX(id) FROM user_payment_transaction
    UNION ALL
    SELECT MAX(id) FROM event_media
    UNION ALL
    SELECT MAX(id) FROM event_ticket_transaction
    UNION ALL
    SELECT MAX(id) FROM event_ticket_transaction_item
    UNION ALL
    SELECT MAX(id) FROM event_ticket_type
    UNION ALL
    SELECT MAX(id) FROM event_type_details
    UNION ALL
    SELECT MAX(id) FROM event_guest_pricing
    UNION ALL
    SELECT MAX(id) FROM discount_code
    UNION ALL
    SELECT MAX(id) FROM tenant_organization
    UNION ALL
    SELECT MAX(id) FROM tenant_settings
    UNION ALL
    SELECT MAX(id) FROM membership_plan
    UNION ALL
    SELECT MAX(id) FROM user_subscription
    UNION ALL
    SELECT MAX(id) FROM user_task
    UNION ALL
    SELECT MAX(id) FROM event_poll
    UNION ALL
    SELECT MAX(id) FROM event_poll_option
    UNION ALL
    SELECT MAX(id) FROM event_poll_response
    UNION ALL
    SELECT MAX(id) FROM event_calendar_entry
    UNION ALL
    SELECT MAX(id) FROM event_attendee
    UNION ALL
    SELECT MAX(id) FROM event_attendee_guest
    UNION ALL
    SELECT MAX(id) FROM event_admin_audit_log
    UNION ALL
    SELECT MAX(id) FROM bulk_operation_log
    UNION ALL
    SELECT MAX(id) FROM qr_code_usage
    UNION ALL
    SELECT MAX(id) FROM payment_provider_config
--    UNION ALL
--    SELECT MAX(id) FROM user_registration_request
    -- Add any other tables using sequence_generator here
)
SELECT COALESCE(MAX(max_id), 0) as global_max_id INTO TEMP TABLE temp_max_id FROM max_ids;

-- Step 2: Calculate the next safe sequence value
-- Sequence increments by 50, so we need to round up to the next multiple of 50
-- Formula: CEIL((max_id + 1) / 50) * 50
-- This ensures the next sequence value is always >= max_id + 1
DO $$
DECLARE
    max_id_value BIGINT;
    next_sequence_value BIGINT;
    sequence_increment BIGINT := 50;
BEGIN
    -- Get the maximum ID
    SELECT global_max_id INTO max_id_value FROM temp_max_id;

    -- If no data exists, start from sequence default (1050)
    IF max_id_value IS NULL OR max_id_value = 0 THEN
        next_sequence_value := 1050;
    ELSE
        -- Round up to next multiple of 50
        -- Example: max_id = 4651, next = CEIL(4651/50) * 50 = CEIL(93.02) * 50 = 94 * 50 = 4700
        -- This ensures nextval() returns 4700, which is safe
        next_sequence_value := CEIL(max_id_value::NUMERIC / sequence_increment) * sequence_increment;

        -- Ensure we're at least one increment ahead
        IF next_sequence_value <= max_id_value THEN
            next_sequence_value := next_sequence_value + sequence_increment;
        END IF;
    END IF;

    -- Set the sequence value
    -- The 'true' parameter means nextval() will return next_sequence_value + increment
    -- So we set it to next_sequence_value - increment to get the desired next value
    PERFORM setval('public.sequence_generator', next_sequence_value - sequence_increment, true);

    -- Log the result
    RAISE NOTICE 'Sequence synchronized: Max ID found = %, Next sequence value = %',
        max_id_value, next_sequence_value;
END $$;

-- Step 3: Verify the synchronization
SELECT
    (SELECT last_value FROM sequence_generator) as sequence_last_value,
    (SELECT COALESCE(MAX(global_max_id), 0) FROM temp_max_id) as max_id_in_tables,
    CASE
        WHEN (SELECT last_value FROM sequence_generator) >= (SELECT COALESCE(MAX(global_max_id), 0) FROM temp_max_id)
        THEN 'OK: Sequence is synchronized'
        ELSE 'WARNING: Sequence may still be out of sync'
    END as sync_status;

-- Cleanup
DROP TABLE IF EXISTS temp_max_id;

