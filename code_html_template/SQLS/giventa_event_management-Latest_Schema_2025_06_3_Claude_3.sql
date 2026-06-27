
CREATE ROLE giventa_event_management WITH LOGIN CREATEDB PASSWORD 'giventa_event_management';

ALTER DATABASE giventa_event_management OWNER to giventa_event_management ;

REASSIGN OWNED BY nextjs_template_boot TO giventa_event_management;

GRANT USAGE ON SCHEMA public TO giventa_event_management;

GRANT INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public TO giventa_event_management;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO giventa_event_management;

-- For the table
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'event_details';



-- For the schema
SELECT nspname, usename, has_schema_privilege(usename, nspname, 'USAGE')
FROM pg_namespace, pg_user
WHERE nspname = 'public';

SELECT datname, usename AS owner
FROM pg_database
JOIN pg_user ON pg_database.datdba = pg_user.usesysid;


DELETE FROM public.user_task WHERE user_id NOT IN (SELECT id FROM public.user_profile);

ALTER TABLE EVENT
ALTER COLUMN start_time TYPE VARCHAR(100) USING start_time::VARCHAR,
ALTER COLUMN end_time TYPE VARCHAR(100) USING end_time::VARCHAR;

ALTER TABLE EVENT_MEDIA ADD COLUMN pre_signed_url VARCHAR(400);

INSERT INTO public.event_media
(

id, title, description, event_media_type, storage_type, file_url, file_data, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, created_at, updated_at, event_id, uploaded_by_id, pre_signed_url)
VALUES(1756, 'xxcx', 'xxxx', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/event-id/1502/hanzh_1747836718150_f0603b68.jpg', NULL, NULL, 'image/jpeg', 51594, false, false, false, '2025-05-21 14:11:58.661', '2025-05-21 14:11:58.661', 1502, NULL, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/event-id/1502/hanzh_1747836718150_f0603b68.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250521T141158Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250521%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=edaa7bb0b8fb5bc6f27370959fa184a86daf04542b7b601d7b12abcc9b9042c7');


ALTER TABLE public.event_media
ALTER COLUMN file_url TYPE varchar(1200),
ALTER COLUMN pre_signed_url TYPE varchar(2048);

SELECT * FROM public.event_media
WHERE tenant_id = 'tenant_demo_001'
AND event_flyer = TRUE
AND event_id = 2251
LIMIT 20 OFFSET 0;


SELECT pid, datname, usename, application_name, client_addr
FROM pg_stat_activity
WHERE datname = 'giventa_event_management';

CREATE DATABASE giventa_event_management;

SELECT current_database();

SELECT rolname FROM pg_roles;

REASSIGN OWNED BY postgres TO giventa_event_management;


DROP TABLE IF EXISTS public.bulk_operation_log CASCADE;
DROP TABLE IF EXISTS public.qr_code_usage CASCADE;
DROP TABLE IF EXISTS public.user_registration_request CASCADE;
DROP TABLE IF EXISTS public.event_attendee_guest CASCADE;
DROP TABLE IF EXISTS public.event_guest_pricing CASCADE;
DROP TABLE IF EXISTS public.event_attendee CASCADE;
DROP TABLE IF EXISTS public.event_admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.event_calendar_entry CASCADE;
DROP TABLE IF EXISTS public.event_media CASCADE;
DROP TABLE IF EXISTS public.event_poll_response CASCADE;
DROP TABLE IF EXISTS public.event_poll_option CASCADE;
DROP TABLE IF EXISTS public.event_poll CASCADE;
DROP TABLE IF EXISTS public.event_ticket_transaction CASCADE;
DROP TABLE IF EXISTS public.user_payment_transaction CASCADE;
DROP TABLE IF EXISTS public.event_ticket_type CASCADE;
DROP TABLE IF EXISTS public.event_organizer CASCADE;
DROP TABLE IF EXISTS public.event_details CASCADE;
DROP TABLE IF EXISTS public.event_admin CASCADE;
DROP TABLE IF EXISTS public.user_task CASCADE;
DROP TABLE IF EXISTS public.user_subscription CASCADE;
DROP TABLE IF EXISTS public.event_type_details CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;
DROP TABLE IF EXISTS public.tenant_organization CASCADE;
DROP TABLE IF EXISTS public.databasechangeloglock CASCADE;
DROP TABLE IF EXISTS public.databasechangelog CASCADE;

-- same as above

DROP TABLE public.event_details CASCADE;
DROP TABLE public.event_attendee CASCADE;

DROP TABLE public.event_poll  CASCADE;

DROP TABLE public.event_poll_option   CASCADE;

DROP TABLE public.event_ticket_transaction CASCADE;

DROP TABLE public.tenant_organization  CASCADE;

DROP TABLE public.user_profile   CASCADE;

 SELECT unnest(enum_range(NULL::user_role_type));
SELECT unnest(enum_range(NULL::user_status_type));

SELECT tablename, tableowner
FROM pg_tables
WHERE schemaname = 'public';
