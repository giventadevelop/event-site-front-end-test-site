-- ===================================================
-- Sequence Synchronization Script
-- ===================================================
-- Purpose: Synchronize public.sequence_generator after manual INSERT statements
--
-- Usage:
--   1. Run schema file (Latest_Schema_Post__Blob_Claude_12.sql)
--   2. Run manual INSERT statements (corrected_event_media_inserts.ordered.sql)
--   3. Run this script to sync the sequence
--
-- Matches Latest_Schema_Post__Blob_Claude_12.sql and SequenceSynchronizationService.java.
-- sequence_generator uses INCREMENT BY 1 (Hibernate allocationSize = 1).
-- ===================================================

BEGIN;

-- Ensure increment matches Hibernate allocationSize = 1 (safe on legacy DBs still at 50)
ALTER SEQUENCE public.sequence_generator INCREMENT BY 1;

-- Align sequence to highest explicit ID in table data (do NOT use sequence last_value —
-- a bloated sequence from prior dev sessions must not survive a low-ID reimport).
SELECT pg_catalog.setval(
               'public.sequence_generator',
               GREATEST(
                   COALESCE((SELECT MAX(id) FROM public.user_profile), 0),
                   COALESCE((SELECT MAX(id) FROM public.bulk_operation_log), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_type_details), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_details), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_content_block), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_day), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_group_member), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_participant), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_registration), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_result), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_competition_settings), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_recurrence_series), 0),
                   COALESCE((SELECT MAX(id) FROM public.focus_group), 0),
                   COALESCE((SELECT MAX(id) FROM public.focus_group_members), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_focus_groups), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_guest_pricing), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_admin), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_admin_audit_log), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_attendee), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_attendee_guest), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_attendee_attachment), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_calendar_entry), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_sponsors), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_sponsors_join), 0),
                   COALESCE((SELECT MAX(id) FROM public.gallery_album), 0),
                   COALESCE((SELECT MAX(id) FROM public.gallery_category), 0),
                   COALESCE((SELECT MAX(id) FROM public.official_document_category), 0),
                   COALESCE((SELECT MAX(id) FROM public.official_document_year_bundle), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_media), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_organizer), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_poll), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_poll_option), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_poll_response), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_ticket_transaction), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_ticket_transaction_item), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_ticket_type), 0),
                   COALESCE((SELECT MAX(id) FROM public.qr_code_usage), 0),
                   COALESCE((SELECT MAX(id) FROM public.tenant_organization), 0),
                   COALESCE((SELECT MAX(id) FROM public.tenant_settings), 0),
                   COALESCE((SELECT MAX(id) FROM public.tenant_email_addresses), 0),
                   COALESCE((SELECT MAX(id) FROM public.user_payment_transaction), 0),
                   COALESCE((SELECT MAX(id) FROM public.user_subscription), 0),
                   COALESCE((SELECT MAX(id) FROM public.user_task), 0),
                   COALESCE((SELECT MAX(id) FROM public.executive_committee_team_members), 0),
                   COALESCE((SELECT MAX(id) FROM public.team_groups), 0),
                   COALESCE((SELECT MAX(id) FROM public.team_members), 0),
                   COALESCE((SELECT MAX(id) FROM public.communication_campaign), 0),
                   COALESCE((SELECT MAX(id) FROM public.email_log), 0),
                   COALESCE((SELECT MAX(id) FROM public.whatsapp_log), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_featured_performers), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_contacts), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_emails), 0),
                   COALESCE((SELECT MAX(id) FROM public.event_program_directors), 0),
                   COALESCE((SELECT MAX(id) FROM public.payment_provider_config), 0),
                   COALESCE((SELECT MAX(id) FROM public.manual_payment_request), 0),
                   COALESCE((SELECT MAX(id) FROM public.manual_payment_summary_report), 0),
                   COALESCE((SELECT MAX(id) FROM public.platform_settlement), 0),
                   COALESCE((SELECT MAX(id) FROM public.platform_invoice), 0),
                   COALESCE((SELECT MAX(id) FROM public.membership_plan), 0),
                   COALESCE((SELECT MAX(id) FROM public.membership_subscription), 0),
                   COALESCE((SELECT MAX(id) FROM public.membership_subscription_reconciliation_log), 0),
                   COALESCE((SELECT MAX(id) FROM public.promotion_email_template), 0),
                   COALESCE((SELECT MAX(id) FROM public.promotion_email_sent_log), 0),
                   COALESCE((SELECT MAX(id) FROM public.clerk_user_tenant), 0),
                   COALESCE((SELECT MAX(id) FROM public.clerk_organization_role), 0),
                   COALESCE((SELECT MAX(id) FROM public.clerk_webhook_event), 0),
                   COALESCE((SELECT MAX(id) FROM public.clerk_session), 0),
                   COALESCE((SELECT MAX(id) FROM public.donation_transaction), 0),
                   COALESCE((SELECT MAX(id) FROM public.donation_statistics), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_category), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_article), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_section_display_config), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_sidebar_promotion), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_flash), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_live_stream_config), 0),
                   COALESCE((SELECT MAX(id) FROM public.news_article_category), 0),
                   COALESCE((SELECT MAX(id) FROM public.satellite_domain), 0),
                   1
               ),
               true
       );

-- Verify
SELECT
    sequencename,
    increment_by,
    last_value
FROM pg_sequences
WHERE schemaname = 'public' AND sequencename = 'sequence_generator';

COMMIT;
