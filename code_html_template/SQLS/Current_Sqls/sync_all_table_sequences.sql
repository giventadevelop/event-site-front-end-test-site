-- ===================================================
-- Sync all application table sequences (per-table id_seq)
-- ===================================================
-- Replaces sync_sequence_after_inserts.sql after per-table sequence migration.
-- Spring Batch framework sequences: use sync_spring_batch_sequences.sql (step 7b).
-- ===================================================

BEGIN;

DO $$
DECLARE
    tbl text;
    seq_name text;
    max_id bigint;
    new_val bigint;
    tables text[] := ARRAY[
        'user_profile',
        'bulk_operation_log',
        'event_type_details',
        'event_details',
        'event_recurrence_series',
        'focus_group',
        'focus_group_members',
        'event_focus_groups',
        'event_guest_pricing',
        'event_live_update',
        'event_live_update_attachment',
        'event_admin',
        'event_admin_audit_log',
        'event_attendee',
        'event_attendee_guest',
        'event_attendee_attachment',
        'event_calendar_entry',
        'event_sponsors',
        'event_sponsors_join',
        'gallery_category',
        'gallery_album',
        'official_document_category',
        'event_media',
        'official_document_year_bundle',
        'event_organizer',
        'event_poll',
        'event_poll_option',
        'event_poll_response',
        'event_score_card',
        'event_score_card_detail',
        'discount_code',
        'event_ticket_transaction',
        'event_ticket_type',
        'event_ticket_transaction_item',
        'qr_code_usage',
        'tenant_organization',
        'tenant_settings',
        'tenant_email_addresses',
        'user_payment_transaction',
        'user_subscription',
        'user_task',
        'executive_committee_team_members',
        'team_groups',
        'team_members',
        'communication_campaign',
        'email_log',
        'whatsapp_log',
        'event_featured_performers',
        'event_contacts',
        'event_emails',
        'event_program_directors',
        'clerk_user_tenant',
        'clerk_organization_role',
        'clerk_webhook_event',
        'clerk_session',
        'payment_provider_config',
        'manual_payment_request',
        'manual_payment_summary_report',
        'platform_settlement',
        'platform_invoice',
        'membership_plan',
        'membership_subscription',
        'donation_transaction',
        'donation_statistics',
        'satellite_domain',
        'news_category',
        'news_article',
        'news_section_display_config',
        'news_sidebar_promotion',
        'news_flash',
        'news_live_stream_config',
        'news_article_category',
        'event_competition_settings',
        'event_competition_day',
        'event_competition',
        'event_competition_participant',
        'event_competition_registration',
        'event_competition_result',
        'event_competition_content_block',
        'event_competition_group_member'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        seq_name := tbl || '_id_seq';
        IF tbl = 'discount_code' THEN seq_name := 'discount_code_id_seq';
        ELSIF tbl = 'event_live_update' THEN seq_name := 'event_live_update_id_seq';
        ELSIF tbl = 'event_live_update_attachment' THEN seq_name := 'event_live_update_attachment_id_seq';
        ELSIF tbl = 'event_score_card' THEN seq_name := 'event_score_card_id_seq';
        ELSIF tbl = 'event_score_card_detail' THEN seq_name := 'event_score_card_detail_id_seq';
        ELSIF tbl = 'batch_job_execution_log' THEN seq_name := 'batch_job_execution_log_id_seq';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname = seq_name
        ) THEN
            RAISE NOTICE 'Skip % — sequence % not found', tbl, seq_name;
            CONTINUE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            RAISE NOTICE 'Skip % — table not found', tbl;
            CONTINUE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'id'
        ) THEN
            RAISE NOTICE 'Skip % — no id column', tbl;
            CONTINUE;
        END IF;

        EXECUTE format('SELECT COALESCE(MAX(id), 0) FROM public.%I', tbl) INTO max_id;
        new_val := GREATEST(max_id, 1);
        EXECUTE format('SELECT pg_catalog.setval(%L, %s, true)', 'public.' || seq_name, new_val);
        RAISE NOTICE 'Synced % -> % (max id %)', seq_name, new_val, max_id;
    END LOOP;
END $$;

COMMIT;

-- Verification sample
SELECT sequencename, last_value
FROM pg_sequences
WHERE schemaname = 'public'
  AND sequencename LIKE '%_id_seq'
ORDER BY sequencename
LIMIT 20;
