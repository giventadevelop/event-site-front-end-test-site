-- ===================================================
-- Legacy cleanup: orphan sequences for join tables without id column
-- ===================================================
-- Canonical Latest_Schema_Post__Blob_Claude_12.sql never creates these sequences.
-- Run only on databases that previously applied an older Liquibase
-- create_per_table_id_sequences.sql which incorrectly created rel_*_id_seq.
-- Safe to run multiple times. Not required after full canonical schema rebuild.
-- ===================================================

DROP SEQUENCE IF EXISTS public.rel_event_details__discount_codes_id_seq;
