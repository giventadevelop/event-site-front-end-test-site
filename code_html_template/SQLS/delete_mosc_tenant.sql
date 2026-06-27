-- Order-sensitive deletes before bulk tenant_id purge (FK constraints)
DELETE FROM public.membership_subscription WHERE tenant_id = 'mosc_malankara_orthodox_2';
DELETE FROM public.event_attendee_guest WHERE tenant_id = 'mosc_malankara_orthodox_2';
-- Legacy +500000 user_profile duplicates from earlier import scripts
DELETE FROM public.user_profile
WHERE tenant_id = 'mosc_malankara_orthodox_2'
  AND id BETWEEN 504000 AND 511999;

DO $do$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT DISTINCT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
  ) LOOP
    EXECUTE format(
      'DELETE FROM public.%I WHERE tenant_id = %L',
      r.table_name,
      'mosc_malankara_orthodox_2'
    );
  END LOOP;
END
$do$;

-- Child tables without tenant_id: remove rows tied to duplicated id range
DELETE FROM public.event_live_update_attachment WHERE id >= 600000;
DELETE FROM public.event_live_update WHERE id >= 600000;
DELETE FROM public.event_score_card_detail WHERE id >= 600000;
DELETE FROM public.event_score_card WHERE id >= 600000;
DELETE FROM public.event_details
WHERE id >= 600000
  AND (tenant_id IS NULL OR tenant_id = '' OR tenant_id <> 'mosc_malankara_orthodox_2');
