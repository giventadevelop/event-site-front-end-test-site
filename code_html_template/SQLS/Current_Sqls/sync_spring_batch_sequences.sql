-- Script to reset/sync Spring Batch sequences after deleting records or recreating schema
-- Run this script if you've deleted all records from Spring Batch tables and want to start fresh
-- OR if you've manually inserted records and need to sync sequences to avoid duplicate key errors

-- Method 1: Reset sequences to start from 1 (use this if you've deleted ALL records)
-- Uncomment the following lines if you want to reset sequences to 1:

-- ALTER SEQUENCE public.batch_job_seq RESTART WITH 1;
-- ALTER SEQUENCE public.batch_job_execution_seq RESTART WITH 1;
-- ALTER SEQUENCE public.batch_step_execution_seq RESTART WITH 1;

-- Method 2: Sync sequences to current max ID + 1 (RECOMMENDED - use this if tables have data)
-- This ensures sequences start after the highest existing ID, preventing duplicate key errors

-- Get current max IDs from tables
DO $$
DECLARE
    max_job_instance_id BIGINT;
    max_job_execution_id BIGINT;
    max_step_execution_id BIGINT;
    new_job_seq_value BIGINT;
    new_job_execution_seq_value BIGINT;
    new_step_execution_seq_value BIGINT;
BEGIN
    -- Get max IDs (handle NULL case if tables are empty)
    SELECT COALESCE(MAX(JOB_INSTANCE_ID), 0) INTO max_job_instance_id
    FROM public.BATCH_JOB_INSTANCE;

    SELECT COALESCE(MAX(JOB_EXECUTION_ID), 0) INTO max_job_execution_id
    FROM public.BATCH_JOB_EXECUTION;

    SELECT COALESCE(MAX(STEP_EXECUTION_ID), 0) INTO max_step_execution_id
    FROM public.BATCH_STEP_EXECUTION;

    -- Set sequences to max + 1 (or 1 if table is empty)
    new_job_seq_value := GREATEST(max_job_instance_id + 1, 1);
    new_job_execution_seq_value := GREATEST(max_job_execution_id + 1, 1);
    new_step_execution_seq_value := GREATEST(max_step_execution_id + 1, 1);

    -- Reset sequences
    EXECUTE format('ALTER SEQUENCE public.batch_job_seq RESTART WITH %s', new_job_seq_value);
    EXECUTE format('ALTER SEQUENCE public.batch_job_execution_seq RESTART WITH %s', new_job_execution_seq_value);
    EXECUTE format('ALTER SEQUENCE public.batch_step_execution_seq RESTART WITH %s', new_step_execution_seq_value);

    -- Display results
    RAISE NOTICE 'Spring Batch sequences synchronized:';
    RAISE NOTICE '  batch_job_seq: restarted at % (max JOB_INSTANCE_ID was %)', new_job_seq_value, max_job_instance_id;
    RAISE NOTICE '  batch_job_execution_seq: restarted at % (max JOB_EXECUTION_ID was %)', new_job_execution_seq_value, max_job_execution_id;
    RAISE NOTICE '  batch_step_execution_seq: restarted at % (max STEP_EXECUTION_ID was %)', new_step_execution_seq_value, max_step_execution_id;
END $$;

-- Verify the sequences are synced correctly
SELECT
    'batch_job_seq' AS sequence_name,
    last_value AS current_sequence_value,
    (SELECT COALESCE(MAX(JOB_INSTANCE_ID), 0) FROM public.BATCH_JOB_INSTANCE) AS max_table_id,
    CASE
        WHEN last_value > (SELECT COALESCE(MAX(JOB_INSTANCE_ID), 0) FROM public.BATCH_JOB_INSTANCE)
        THEN 'OK - Sequence is ahead of max ID'
        ELSE 'WARNING - Sequence may cause duplicate key errors'
    END AS status
FROM pg_sequences
WHERE sequencename = 'batch_job_seq'

UNION ALL

SELECT
    'batch_job_execution_seq' AS sequence_name,
    last_value AS current_sequence_value,
    (SELECT COALESCE(MAX(JOB_EXECUTION_ID), 0) FROM public.BATCH_JOB_EXECUTION) AS max_table_id,
    CASE
        WHEN last_value > (SELECT COALESCE(MAX(JOB_EXECUTION_ID), 0) FROM public.BATCH_JOB_EXECUTION)
        THEN 'OK - Sequence is ahead of max ID'
        ELSE 'WARNING - Sequence may cause duplicate key errors'
    END AS status
FROM pg_sequences
WHERE sequencename = 'batch_job_execution_seq'

UNION ALL

SELECT
    'batch_step_execution_seq' AS sequence_name,
    last_value AS current_sequence_value,
    (SELECT COALESCE(MAX(STEP_EXECUTION_ID), 0) FROM public.BATCH_STEP_EXECUTION) AS max_table_id,
    CASE
        WHEN last_value > (SELECT COALESCE(MAX(STEP_EXECUTION_ID), 0) FROM public.BATCH_STEP_EXECUTION)
        THEN 'OK - Sequence is ahead of max ID'
        ELSE 'WARNING - Sequence may cause duplicate key errors'
    END AS status
FROM pg_sequences
WHERE sequencename = 'batch_step_execution_seq';

