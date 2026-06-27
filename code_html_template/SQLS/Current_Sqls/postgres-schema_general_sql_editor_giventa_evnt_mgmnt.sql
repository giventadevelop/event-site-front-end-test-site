
CREATE ROLE giventa_event_management WITH LOGIN CREATEDB PASSWORD 'giventa_event_management';

ALTER DATABASE giventa_event_management OWNER to giventa_event_management ;

REASSIGN OWNED BY nextjs_template_boot TO giventa_event_management;

GRANT USAGE ON SCHEMA public TO giventa_event_management;

GRANT INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public TO giventa_event_management;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO giventa_event_management;


-- Connect as postgres user and run:
GRANT ALL PRIVILEGES ON DATABASE giventa_event_management TO giventa_event_management;
GRANT ALL PRIVILEGES ON SCHEMA public TO giventa_event_management;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO giventa_event_management;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO giventa_event_management;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO giventa_event_management;

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
VALUES(1756, 'xxcx', 'xxxx', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/event-id/1502/hanzh_1747836718150_f0603b68.jpg', NULL, NULL, 'image/jpeg', 51594, false, false, false, '2025-05-21 14:11:58.661', '2025-05-21 14:11:58.661', 1502, NULL, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/event-id/1502/hanzh_1747836718150_f0603b68.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250521T141158Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIATIT5HARDKCWNLQMU%2F20250521%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=edaa7bb0b8fb5bc6f27370959fa184a86daf04542b7b601d7b12abcc9b9042c7');


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


INSERT INTO public.event_details VALUES (2801, 'tenant_demo_001', 'Annual Tech Conference 2025', 'Join us for the biggest tech event of the year', 'A comprehensive conference featuring the latest in technology trends, networking opportunities, and expert speakers from around the globe.', '2025-07-15', '2025-07-17', '09:00', '17:00', 'Convention Center, Downtown', NULL, 500, 'TICKETED', true, 2, true, false, true, NULL, NULL, NULL, NULL, false, true, NULL, 2600, 2400, '2025-06-08 20:16:39.532111', '2025-06-08 20:16:39.532111', false, false, false);
--INSERT INTO public.event_details VALUES (2900, 'tenant_demo_002', 'Family Fun Day', 'Community event for all ages', 'A family-friendly event with activities for all age groups, food, games, and entertainment.', '2025-08-10', '2025-08-10', '10:00', '18:00', 'Community Park', NULL, 200, 'FREE', true, 4, true, true, true, NULL, NULL, NULL, NULL, false, true, NULL, 2700, 2450, '2025-06-08 20:16:39.532111', '2025-06-08 20:16:39.532111', false, false, false);
--INSERT INTO public.event_details VALUES (2850, 'tenant_demo_001', 'React Workshop for Beginners', 'Learn React from scratch in this hands-on workshop', 'A beginner-friendly workshop covering React fundamentals, component creation, state management, and building your first React application.', '2025-06-20', '2025-06-20', '10:00', '16:00', 'Tech Hub Building A', NULL, 30, 'FREE', true, 0, false, false, false, NULL, NULL, NULL, NULL, false, true, NULL, 2600, 2350, '2025-06-08 20:16:39.532111', '2025-06-08 20:46:43.612386', true, false, false);
--INSERT INTO public.event_details VALUES (3951, 'tenant_demo_001', 'xxxcxc', 'cxcx', 'cxcxcxc', '2025-06-22', '2025-06-22', '10:15 AM', '11:15 AM', 'xcxcx', 'xcxcxc', 2, 'free', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, true, NULL, NULL, 2350, '2025-06-09 01:16:21.63', '2025-06-08 21:17:06.742427', true, NULL, NULL);
I

INSERT INTO public.event_guest_pricing VALUES (3101, 'tenant_demo_001', 2800, 'ADULT', 150.00, true, '2025-06-01', '2025-07-14', 'Adult guest pricing for conference', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
--INSERT INTO public.event_guest_pricing VALUES (3151, 'tenant_demo_001', 2800, 'TEEN', 75.00, true, '2025-06-01', '2025-07-14', 'Teen guest pricing (13-17 years)', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
--INSERT INTO public.event_guest_pricing VALUES (3201, 'tenant_demo_001', 2800, 'CHILD', 25.00, true, '2025-06-01', '2025-07-14', 'Child guest pricing (5-12 years)', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');


	INSERT INTO public.event_ticket_type (id, tenant_id, event_id, code, name, description, price, available_quantity, sold_quantity, is_active, created_at, updated_at)
	VALUES
	(1, 'tenant_demo_001', 6151, 'STD', 'Standard', 'Standard ticket for Spring Gala', 50.00, 100, 10, true, now(), now()),
	(2, 'tenant_demo_001', 6151, 'VIP', 'VIP', 'VIP ticket for Tech Conference', 200.00, 50, 5, true, now(), now()),
	(3, 'tenant_demo_001', 6151, 'RUN', 'Runner', 'Runner ticket for Charity Run', 0.00, 300, 100, true, now(), now()),
	(4, 'tenant_demo_001', 6151, 'FAM', 'Family', 'Family ticket for Picnic', 20.00, 30, 10, true, now(), now()),
	(5, 'tenant_demo_001', 6151, 'DIN', 'Dinner', 'Dinner ticket for VIP Dinner', 100.00, 20, 8, true, now(), now()),
	(6, 'tenant_demo_001', 6151, 'FEST', 'Festival', 'Festival ticket for Summer Fest', 30.00, 200, 50, true, now(), now());
	
	UPDATE public.event_details
SET start_date = '2025-04-20';

   UPDATE public.event_details SET start_date = '2025-08-01', end_date = '2025-08-01' WHERE id = 1;
   UPDATE public.event_details SET start_date = '2025-08-15', end_date = '2025-08-15' WHERE id = 2;
   UPDATE public.event_details SET start_date = '2025-08-30', end_date = '2025-08-30' WHERE id = 3;
   UPDATE public.event_details SET start_date = '2025-09-10', end_date = '2025-09-10' WHERE id = 4;
   UPDATE public.event_details SET start_date = '2025-09-20', end_date = '2025-09-20' WHERE id = 5;
   UPDATE public.event_details SET start_date = '2025-09-30', end_date = '2025-09-30' WHERE id = 6;
   
   
  --  public.user_profile
     -- to enable email for users subscribed = true run/use all the three at once with setting token also--
   
    delete from public.user_profile
		WHERE id=4651;
   
   INSERT INTO public.user_profile
(id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, created_at, updated_at, request_id, request_reason, status, admin_comments,
submitted_at, reviewed_at, approved_at, rejected_at)
VALUES(4651, 'tenant_demo_001', 'guest_giventauser_gmail_com_1755451276831', '', '',
'giventauser@gmail.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
true, 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnaXZlbnRhdXNlckBnbWFpbC5jb20ifQ.gnZmiOIJmHJtrsx3OZtJRB6vcRvfhFUwiRdPU7dtgYrIdrRYsqPC7XiNKrLMSyDojGnnCt9R0Tp3efvtvNKmWQ', NULL, 'ACTIVE', 'MEMBER', NULL, NULL, '2025-08-17 17:21:15.246', '2025-08-17 17:21:15.246',
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
   
     SELECT id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at
FROM public.user_profile
WHERE id=4651;

 SELECT id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at
FROM public.user_profile
WHERE email in ('giventauser@gmail.com','gain@hotmail.com');

--for prod   where WHERE id=10651;
   
     UPDATE public.user_profile
		SET is_email_subscribed = true, is_email_subscription_token_used = false
		WHERE email in ('giventauser@gmail.com','gain@hotmail.com');
     
       UPDATE public.user_profile
		SET is_email_subscribed = true, is_email_subscription_token_used = false
		WHERE email = 'giventauser@gmail.com';
       
       UPDATE public.user_profile
		SET email_subscription_token  = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnYWluQGhvdG1haWwuY29tIn0.hQFTfyU4gHgoKhVAjXajSqvdgCiN3qEYpdSZuhXr-4_NUO69m3VeTEAMzyXceTr8WWRWpGM6qahTk2ZkAaxLzA';
   
   
     -- to enable email for users unsubscribed = false --
   
     UPDATE public.user_profile
		SET is_email_subscribed = false, is_email_subscription_token_used = true
		WHERE email = 'giventauser@gmail.com';
   
   UPDATE public.user_profile
		SET email_subscription_token  = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJnYWluQGhvdG1haWwuY29tIn0.hQFTfyU4gHgoKhVAjXajSqvdgCiN3qEYpdSZuhXr-4_NUO69m3VeTEAMzyXceTr8WWRWpGM6qahTk2ZkAaxLzA';
   
   commit;
   
   delete from public.event_media
		where description is null;
   
   
   -- Add sample media for events that don't have any media
-- This will give each event a unique image in the home page

INSERT INTO public.event_media (
    id, tenant_id, title, description, event_media_type, storage_type, 
    file_url, file_data, file_data_content_type, content_type, file_size, 
    is_public, event_flyer, is_event_management_official_document, 
    pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, 
    download_count, is_featured_video, featured_video_url, is_featured_image, 
    is_hero_image, is_active_hero_image, created_at, updated_at, event_id, uploaded_by_id
) VALUES 
-- Event 3: Family Picnic
(7001, 'tenant_demo_001', 'family_picnic.jpg', 'Family picnic event flyer', 'image/jpeg', 'S3', 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/3/family_picnic_sample.jpg', 
NULL, 'image/jpeg', 'image/jpeg', 45000, true, true, false, 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/3/family_picnic_sample.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=SAMPLE%2F20250101%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=sample', 
NULL, NULL, NULL, NULL, NULL, false, NULL, false, false, false, 
'2025-01-01 00:00:00', '2025-01-01 00:00:00', 3, 4651),

-- Event 4: VIP Dinner  
(7002, 'tenant_demo_001', 'vip_dinner.jpg', 'VIP dinner event flyer', 'image/jpeg', 'S3', 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4/vip_dinner_sample.jpg', 
NULL, 'image/jpeg', 'image/jpeg', 52000, true, true, false, 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4/vip_dinner_sample.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=SAMPLE%2F20250101%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=sample', 
NULL, NULL, NULL, NULL, NULL, false, NULL, false, false, false, 
'2025-01-01 00:00:00', '2025-01-01 00:00:00', 4, 4651),

-- Event 5: Summer Fest
(7003, 'tenant_demo_001', 'summer_fest.jpg', 'Summer festival event flyer', 'image/jpeg', 'S3', 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/5/summer_fest_sample.jpg', 
NULL, 'image/jpeg', 'image/jpeg', 38000, true, true, false, 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/5/summer_fest_sample.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=SAMPLE%2F20250101%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=sample', 
NULL, NULL, NULL, NULL, NULL, false, NULL, false, false, false, 
'2025-01-01 00:00:00', '2025-01-01 00:00:00', 5, 4651),

-- Event 6: Spring Gala
(7004, 'tenant_demo_001', 'spring_gala.jpg', 'Spring gala event flyer', 'image/jpeg', 'S3', 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/6/spring_gala_sample.jpg', 
NULL, 'image/jpeg', 'image/jpeg', 41000, true, true, false, 
'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/6/spring_gala_sample.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=SAMPLE%2F20250101%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=sample', 
NULL, NULL, NULL, NULL, NULL, false, NULL, false, false, false, 
'2025-01-01 00:00:00', '2025-01-01 00:00:00', 6, 4651);

--select e1_0.id,e1_0.alt_text,e1_0.content_type,e1_0.created_at,e1_0.description,e1_0.display_order,e1_0.download_count,e1_0.event_flyer,e1_0.event_id,e1_0.event_media_type,e1_0.featured_video_url,e1_0.file_size,e1_0.file_url,e1_0.is_active_hero_image,e1_0.is_event_management_official_document,e1_0.is_featured_image,e1_0.is_featured_video,e1_0.is_hero_image,e1_0.is_public,e1_0.pre_signed_url,e1_0.pre_signed_url_expires_at,e1_0.storage_type,e1_0.tenant_id,e1_0.title,e1_0.updated_at,e1_0.uploaded_by_id from event_media e1_0 where e1_0.event_flyer=? and e1_0.event_id=? offset ? rows fetch first ? rows only 
--Hibernate: select e1_0.id,e1_0.alt_text,e1_0.content_type,e1_0.created_at,e1_0.description,e1_0.display_order,e1_0.download_count,e1_0.event_flyer,e1_0.event_id,e1_0.event_media_type,e1_0.featured_video_url,e1_0.file_size,e1_0.file_url,e1_0.is_active_hero_image,e1_0.is_event_management_official_document,e1_0.is_featured_image,e1_0.is_featured_video,e1_0.is_hero_image,e1_0.is_public,e1_0.pre_signed_url,e1_0.pre_signed_url_expires_at,e1_0.storage_type,e1_0.tenant_id,e1_0.title,e1_0.updated_at,e1_0.uploaded_by_id from event_media e1_0 where e1_0.event_flyer=? and e1_0.event_id=?

SELECT 
    e1_0.id,
    e1_0.alt_text,
    e1_0.content_type,
    e1_0.created_at,
    e1_0.description,
    e1_0.display_order,
    e1_0.download_count,
    e1_0.event_flyer,
    e1_0.event_id,
    e1_0.event_media_type,
    e1_0.featured_video_url,
    e1_0.file_size,
    e1_0.file_url,
    e1_0.is_active_hero_image,
    e1_0.is_event_management_official_document,
    e1_0.is_featured_image,
    e1_0.is_featured_video,
    e1_0.is_hero_image,
    e1_0.is_public,
    e1_0.pre_signed_url,
    e1_0.pre_signed_url_expires_at,
    e1_0.storage_type,
    e1_0.tenant_id,
    e1_0.title,
    e1_0.updated_at,
    e1_0.uploaded_by_id 
FROM event_media e1_0 
WHERE e1_0.event_flyer = true 
    AND e1_0.event_id in (1,2,3)
LIMIT 20 OFFSET 0;


UPDATE event_media 
SET 
    file_url = 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif',
    file_data_content_type = 'image/avif'
WHERE event_id IN (2, 3);

delete from  event_media 
WHERE event_id not IN (1, 2, 3);

delete from  event_details 
WHERE id not IN (1, 2, 3); 

--  test media

-- Step 2: Delete event_attendee_guests records for events not in (1, 2, 3)
--DELETE FROM public.event_attendee_guest
--WHERE event_attendee_id IN (
--    SELECT id FROM event_attendee WHERE event_id NOT IN (1, 2, 3)
--);

DELETE FROM public.event_attendee 
WHERE event_id NOT IN (1, 2, 3);

-- Step 3: Delete event_media records for events not in (1, 2, 3)
DELETE FROM event_media 
WHERE event_id NOT IN (1, 2, 3);

-- Step 4: Delete event_ticket_transactions records for events not in (1, 2, 3)
DELETE FROM event_ticket_transaction 
WHERE event_id NOT IN (1, 2, 3);

-- Step 5: Delete event_ticket_types records for events not in (1, 2, 3)
DELETE FROM event_ticket_type 
WHERE event_id NOT IN (1, 2, 3);

-- Step 6: Finally, delete event_details records not in (1, 2, 3)



DELETE FROM event_attendee WHERE event_id IN (
    SELECT id FROM event_details 
    WHERE id NOT IN (1, 2, 3) AND tenant_id = 'tenant_demo_001'
);

DELETE FROM event_media WHERE event_id IN (
    SELECT id FROM event_details 
    WHERE id NOT IN (1, 2, 3) AND tenant_id = 'tenant_demo_001'
);

-- Then delete the main records
DELETE FROM event_details 
WHERE id NOT IN (1, 2, 3) AND tenant_id = 'tenant_demo_001';
   
  

UPDATE event_media
SET file_url = 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif'
WHERE event_id = 2 ;

UPDATE event_media
SET file_url = 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif'
WHERE event_id = 3 ;

-- Update Event 3 media records
UPDATE event_media
SET file_url = 'REPLACE(file_url, 'event-id/3/', 'event-id/1/'),
    pre_signed_url = REPLACE(pre_signed_url, 'event-id/3/', 'event-id/1/')'
WHERE event_id = 3
  AND file_url LIKE '%event-id/1/%';

-- Verify the fix
SELECT id, event_id, title, file_url
FROM event_media
WHERE event_id IN (2, 3)
  AND event_flyer = true
ORDER BY event_id, id;


UPDATE public.event_media
SET event_flyer = true where id =4001;
   
UPDATE public.event_media
SET event_flyer = false  where id = 4601;

UPDATE public.event_media
SET event_flyer = false  WHERE event_id IN (1, 2, 3);


-- To delete or edit event_ticket_type  run bebelow 2 stmnts
-- First, delete related transaction items
DELETE FROM event_ticket_transaction_item 
WHERE ticket_type_id = 4752;

-- Then delete the ticket type
DELETE FROM event_ticket_type 
WHERE id = 4752;
   
   
   SELECT id, tenant_id, transaction_reference, email, first_name, last_name, phone, quantity, price_per_unit, total_amount, tax_amount, platform_fee_amount, discount_code_id, discount_amount, final_amount, status, payment_method, payment_reference, stripe_checkout_session_id, stripe_payment_intent_id, purchase_date, confirmation_sent_at, refund_amount, refund_date, refund_reason, stripe_customer_id, stripe_payment_status, stripe_customer_email, stripe_payment_currency, stripe_amount_discount, stripe_amount_tax, stripe_fee_amount, qr_code_image_url, event_id, user_id, created_at, updated_at, number_of_guests_checked_in, check_in_status, check_in_time, check_out_time
FROM public.event_ticket_transaction
WHERE id=8551;	
	

SELECT id, tenant_id, transaction_id, ticket_type_id, quantity, price_per_unit, total_amount, created_at,
updated_at
FROM public.event_ticket_transaction_item
WHERE id=8551;

SELECT id, tenant_id, transaction_id, ticket_type_id, quantity, price_per_unit, total_amount, created_at,
updated_at
FROM public.event_ticket_transaction_item
WHERE transaction_id=8551;

	 --You already have ON DELETE CASCADE from items to transactions, so deleting the parent rows will automatically delete related items and fire the inventory trigger.
	 -- Use one of these:
	
	 -- Single event
	BEGIN;
	DELETE FROM public.event_ticket_transaction
	WHERE event_id = 3;
	COMMIT;

	 
	   --  ticket types quantity sold available..
	 SELECT id, tenant_id, "name", description, price, is_service_fee_included, service_fee, code, available_quantity, sold_quantity, is_active, sale_start_date, sale_end_date, min_quantity_per_order, max_quantity_per_order, requires_approval, sort_order, created_at, updated_at, event_id
FROM public.event_ticket_type
WHERE id IN (3,4801);


   -- Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('manage_ticket_inventory_trigger', 'update_ticket_sold_quantity_trigger');

-- Check trigger function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('manage_ticket_inventory', 'update_ticket_sold_quantity');

  -- Check current state of ticket types
SELECT 
    id,
    name,
    available_quantity,
    sold_quantity,
    (available_quantity - sold_quantity) as remaining_quantity
FROM event_ticket_type 
WHERE event_id = 1;

-- Check if there are any transaction items
SELECT 
    tti.id,
    tti.ticket_type_id,
    tti.quantity,
    ett.status,
    ett.id as transaction_id
FROM event_ticket_transaction_item tti
JOIN event_ticket_transaction ett ON tti.transaction_id = ett.id
WHERE ett.event_id = 3;


-- Test if triggers work by manually inserting a test record
INSERT INTO event_ticket_transaction_item (
    tenant_id, transaction_id, ticket_type_id, quantity, 
    price_per_unit, total_amount
) VALUES (
    'tenant_demo_001', 
    (SELECT id FROM event_ticket_transaction WHERE event_id = 3 LIMIT 1),
    3, -- ticket_type_id
    1, -- quantity
    0.74, -- price_per_unit
    0.74 -- total_amount
);

-- Check if sold_quantity was updated
SELECT id, name, available_quantity , sold_quantity , remaining_quantity
  FROM event_ticket_type WHERE id = 2;

SELECT id, name, available_quantity , sold_quantity , 
remaining_quantity FROM event_ticket_type WHERE event_id  = 3;


SELECT id, name, available_quantity, sold_quantity FROM event_ticket_type WHERE id = 2;

-- Calculate and update sold quantities based on actual transaction data
UPDATE event_ticket_type 
SET sold_quantity = (
    SELECT COALESCE(SUM(tti.quantity), 0)
    FROM event_ticket_transaction_item tti
    JOIN event_ticket_transaction ett ON tti.transaction_id = ett.id
    WHERE ett.status = 'COMPLETED' 
    AND tti.ticket_type_id = event_ticket_type.id
    AND ett.event_id = 3
),
updated_at = NOW()
WHERE event_id = 3;


  
  ALTER TABLE public.event_ticket_type
  ADD COLUMN remaining_quantity integer DEFAULT 0;

  UPDATE public.event_ticket_type
  SET remaining_quantity = COALESCE(available_quantity, 0) - COALESCE(sold_quantity, 0)
  WHERE remaining_quantity= 0;
  
  
  --  
--	ALTER TABLE public.event_details ADD is_featured_event bool DEFAULT false NULL;
--	COMMENT ON COLUMN public.event_details.is_featured_event IS 'If the event is featured the details about it including Age will be shown in the Featured event section in the home page if it falls within date range let''s say three or prior to the event day Prior to or equal to the event today based on the logic you set up this is to show the details all the time instead of looping in the hero section of the home page.';
	ALTER TABLE public.event_details ADD featured_event_priority int4 NULL;
	COMMENT ON COLUMN public.event_details.featured_event_priority IS 'A featured event could be shown in the home page based on the priority of the event and if there is a featured event in the next three or six months based on the logic you set in the homepage';
	ALTER TABLE public.event_details ADD live_event_priority int4 NULL;
	COMMENT ON COLUMN public.event_details.live_event_priority IS 'A live event could be shown in the home page based on the priority of the event and if there is a live event in the next three or six months based on the logic you set in the homepage';
  
  
--  ALTER TABLE public.event_media ADD is_home_page_hero_image bool DEFAULT false NULL;
--COMMENT ON COLUMN public.event_media.is_home_page_hero_image IS 'is_home_page_hero_image  This could be the image that will determine whether this can displayed as the hero image in the Heroes section second off the home page where the hero section image loops and if the event is selected as an upcoming event and needs to be displayed if this flag is set to be true this will be displayed in the hero section of the homepage.';
ALTER TABLE public.event_media ADD is_featured_event_strip_image bool DEFAULT false NULL;
COMMENT ON COLUMN public.event_media.is_featured_event_strip_image IS 'is_featured_event_strip_image  This is the flag that determines if if and even these strip image and needs attention in the home page which will be placed under the hero section to show the world that this is a featured upcoming event and this is a narrow horizontal image that will be displayed to get the users alert';
ALTER TABLE public.event_media ADD is_live_event_strip_image bool DEFAULT false NULL;
COMMENT ON COLUMN public.event_media.is_live_event_strip_image IS 'is_live_event_strip_image  This is the flag that determines which invites  attention in the home page which will be placed under the hero section to show the world that this is a live upcoming event and this is a narrow horizontal image that will be displayed to get the users alert  About the upcoming live event';



  -- Add new column
ALTER TABLE tenant_settings ADD COLUMN tenant_organization_id BIGINT;

-- Create foreign key
ALTER TABLE tenant_settings 
ADD CONSTRAINT fk_tenant_settings_organization_id 
FOREIGN KEY (tenant_organization_id) REFERENCES tenant_organization(id);

-- Migrate data

UPDATE tenant_settings ts 
SET tenant_organization_id = "to".id 
FROM tenant_organization "to" 
WHERE ts.tenant_id = "to".tenant_id;

-- Drop old foreign key and column (if desired)
-- ALTER TABLE tenant_settings DROP CONSTRAINT fk_tenant_settings__tenant_id;
-- ALTER TABLE tenant_settings DROP COLUMN tenant_id;

  -- Basic user list
SELECT usename, usesuper, usecreatedb FROM pg_user;

-- Detailed user list
SELECT 
    usename as username,
    usesuper as is_superuser,
    usecreatedb as can_create_db,
    usebypassrls as can_bypass_rls
FROM pg_user;

-- List all databases
SELECT datname FROM pg_database;
 
-- Create application database
CREATE DATABASE event_site_manager_db;

--Create application user
CREATE USER event_site_app WITH PASSWORD 'event_site_app!';

--Grant permissions
GRANT ALL PRIVILEGES ON DATABASE event_site_manager_db TO event_site_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO event_site_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO event_site_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO event_site_app;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO event_site_app;


GRANT USAGE ON SCHEMA public TO event_site_app;
GRANT CREATE ON SCHEMA public TO event_site_app;
GRANT CONNECT ON DATABASE event_site_manager_db TO event_site_app;
GRANT TEMPORARY ON DATABASE event_site_manager_db TO event_site_app;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO event_site_app;

-- Sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO event_site_app;

-- Function permissions (no PROCEDURES)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO event_site_app;

--GRANT ALL ON event_details TO event_site_app;
--GRANT ALL ON event_sponsors TO event_site_app;
--GRANT ALL ON executive_committee_team_members TO event_site_app;

GRANT ALL  ON DATABASE event_site_manager_db TO event_site_app;
GRANT ALL  ON SCHEMA public TO event_site_app;
GRANT ALL  ON ALL TABLES IN SCHEMA public TO event_site_app;
GRANT ALL  ON ALL SEQUENCES IN SCHEMA public TO event_site_app;
GRANT ALL  ON ALL FUNCTIONS IN SCHEMA public TO event_site_app;

ALTER USER event_site_app SET search_path = public;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO event_site_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO event_site_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO event_site_app;

SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'event_details';

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'event_details';


SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('event_details', 'event_sponsors', 'executive_committee_team_members')
ORDER BY schemaname, tablename;

SELECT 
    current_user,
    current_database(),
    session_user,
    current_schema(),
    current_schemas(true);


-- Check if the user exists and has the expected permissions
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin,
    rolconnlimit
FROM pg_roles 
WHERE rolname = 'event_site_app';

-- Check actual permissions on the problematic tables
SELECT 
    t.schemaname,
    t.tablename,
    t.tableowner,
    p.grantee,
    p.privilege_type,
    p.is_grantable
FROM pg_tables t
LEFT JOIN (
    SELECT 
        table_schema,
        table_name,
        grantee,
        privilege_type,
        is_grantable
    FROM information_schema.table_privileges 
    WHERE table_name IN ('event_details', 'event_sponsors', 'executive_committee_team_members')
) p ON t.tablename = p.table_name AND t.schemaname = p.table_schema
WHERE t.tablename IN ('event_details', 'event_sponsors', 'executive_committee_team_members')
ORDER BY t.schemaname, t.tablename, p.grantee;


UPDATE public.event_details
SET tenant_id='tenant_demo_002'
WHERE id in (1,2,3);

UPDATE public.event_media
SET  tenant_id='tenant_demo_002'
--title='hero_image_knanaya_ikcc_ny_800_X_1200_resized from_1920_width', description='hero_image_knanaya_ikcc_ny_800_X_1200_resized from_1920_width', event_media_type='image/jpeg', storage_type='S3', file_url='https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_002/event-id/3/hero_image_knanaya_ikcc_ny_800_X_1200_resized_from_1920_width_1762145367871_5cb9100b.jpeg', file_data_content_type=NULL, content_type=NULL, file_size=174308, is_public=true, event_flyer=false, is_event_management_official_document=false, pre_signed_url='https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_002/event-id/3/hero_image_knanaya_ikcc_ny_800_X_1200_resized_from_1920_width_1762145367871_5cb9100b.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20251103T044928Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIATIT5HARDH77LVIYW%2F20251103%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=2d337166dcc6f1d46f90d3b70465054e76a31f1a5d0ea3058fdff05143e81df2', pre_signed_url_expires_at=NULL, alt_text=NULL, display_order=NULL, download_count=NULL, is_featured_video=NULL, featured_video_url=NULL, is_hero_image=false, is_active_hero_image=false, 
--start_displaying_from_date='2025-11-02', created_at='2025-11-03 04:49:28.329', updated_at='2025-11-03 04:49:28.329', event_id=3, uploaded_by_id=4651, is_home_page_hero_image=true, is_featured_event_image=false, is_live_event_image=false;
WHERE event_id=3;

	UPDATE public.event_featured_performers
	SET tenant_id='tenant_demo_002'
	--, "name"='Kalamandalam Gopi', stage_name='Gopi Asan', "role"='Kathakali Performer', bio='Legendary Kathakali artist known for his exceptional performances and traditional Kerala dance form mastery.', nationality='Indian', date_of_birth='1937-05-15', email='gopi@example.com', phone='+91-9847012346', website_url='https://gopiasan.com', portrait_image_url='https://s3.amazonaws.com/bucket/performers/2/portrait/gopi_portrait.jpg', performance_image_url='https://s3.amazonaws.com/bucket/performers/2/performance/gopi_performance.jpg', gallery_image_urls='["https://s3.amazonaws.com/bucket/performers/2/gallery/img1.jpg"]', performance_duration_minutes=60, performance_order=2, is_headliner=false, facebook_url='https://facebook.com/gopiasan', twitter_url=NULL, instagram_url='https://instagram.com/gopiasan', youtube_url='https://youtube.com/gopiasan', linkedin_url=NULL, tiktok_url=NULL, is_active=true, priority_ranking=90, created_at='2025-01-10 10:00:00.000', updated_at='2025-01-10 10:00:00.000'
	WHERE  event_id=2;
	
	UPDATE public.event_contacts
    SET tenant_id='tenant_demo_002' 
--    "name"='Emily Rodriguez', phone='+1-555-0103', email='emily.rodriguez@example.com', created_at='2025-01-10 10:00:00.000', updated_at='2025-01-10 10:00:00.000'
    WHERE event_id=2;
	
	UPDATE public.event_program_directors
	SET tenant_id='tenant_demo_002' 
--	event_id=2, "name"='Mr. Suresh Nair', photo_url='https://s3.amazonaws.com/bucket/directors/3/photo/suresh_photo.jpg', bio='Mr. Suresh Nair brings extensive experience in cultural event management and has been associated with several prestigious cultural organizations. His expertise lies in coordinating diverse artistic performances and managing large audiences.', created_at='2025-01-10 10:00:00.000', updated_at='2025-01-10 10:00:00.000'
	WHERE event_id=2;
	
	UPDATE public.event_sponsors_join
	SET tenant_id='tenant_demo_002' 
--    SET id=4, tenant_id='tenant_demo_001', event_id=2, sponsor_id=2, created_at='2025-01-10 10:00:00.000';
	WHERE event_id=2;
	
  INSERT INTO public.event_featured_performers (id, tenant_id, event_id, name, stage_name, role, bio, nationality, date_of_birth, email, phone, website_url, portrait_image_url, performance_image_url, gallery_image_urls, performance_duration_minutes, performance_order, is_headliner, facebook_url, twitter_url, instagram_url, youtube_url, linkedin_url, tiktok_url, is_active, priority_ranking, created_at, updated_at) VALUES (3, 'tenant_demo_002', 2, 'Zakir Hussain', 'Zakir Hussain', 'Percussionist', 'World-renowned tabla player and percussionist with international acclaim.', 'Indian', '1951-03-09', 'zakir@example.com', '+91-9847012347', 'https://zakirhussain.com', 'https://s3.amazonaws.com/bucket/performers/3/portrait/zakir_portrait.jpg', 'https://s3.amazonaws.com/bucket/performers/3/performance/zakir_performance.jpg', '["https://s3.amazonaws.com/bucket/performers/3/gallery/img1.jpg", "https://s3.amazonaws.com/bucket/performers/3/gallery/img2.jpg", "https://s3.amazonaws.com/bucket/performers/3/gallery/img3.jpg"]', 30, 3, false, 'https://facebook.com/zakirhussain', 'https://twitter.com/zakirhussain', 'https://instagram.com/zakirhussain', 'https://youtube.com/zakirhussain', 'https://linkedin.com/in/zakirhussain', NULL, true, 80, '2025-01-10 10:00:00', '2025-01-10 10:00:00');

  INSERT INTO public.event_featured_performers (id, tenant_id, event_id, name, stage_name, role, bio, nationality, date_of_birth, email, phone, website_url, portrait_image_url, performance_image_url, gallery_image_urls, performance_duration_minutes, performance_order, is_headliner, facebook_url, twitter_url, instagram_url, youtube_url, linkedin_url, tiktok_url, is_active, priority_ranking, created_at, updated_at) VALUES (2, 'tenant_demo_002', 2, 'Kalamandalam Gopi', 'Gopi Asan', 'Kathakali Performer', 'Legendary Kathakali artist known for his exceptional performances and traditional Kerala dance form mastery.', 'Indian', '1937-05-15', 'gopi@example.com', '+91-9847012346', 'https://gopiasan.com', 'https://s3.amazonaws.com/bucket/performers/2/portrait/gopi_portrait.jpg', 'https://s3.amazonaws.com/bucket/performers/2/performance/gopi_performance.jpg', '["https://s3.amazonaws.com/bucket/performers/2/gallery/img1.jpg"]', 60, 2, false, 'https://facebook.com/gopiasan', NULL, 'https://instagram.com/gopiasan', 'https://youtube.com/gopiasan', NULL, NULL, true, 90, '2025-01-10 10:00:00', '2025-01-10 10:00:00');

  
       SELECT id, COUNT(*) as duplicate_count
   FROM user_payment_transaction
   GROUP BY id
   HAVING COUNT(*) > 1;
	
       
       SELECT
    (SELECT MAX(id) FROM user_payment_transaction) as max_id,
    (SELECT last_value FROM sequence_generator) as sequence_last_value,
    CASE
        WHEN (SELECT MAX(id) FROM user_payment_transaction) > (SELECT last_value FROM sequence_generator)
        THEN 'WARNING: Max ID exceeds sequence value - sequence may need reset'
        ELSE 'OK: Sequence is ahead of max ID'
    END as status;
	
   
       SELECT 
    id,
    tenant_id,
    transaction_type,
    amount,
    status,
    stripe_payment_intent_id,
    external_transaction_id,
    payment_method,
    -- Extract provider from metadata JSON
    CASE 
        WHEN metadata IS NOT NULL AND metadata::text LIKE '%"provider":"GIVEBUTTER"%' THEN 'GIVEBUTTER'
        WHEN metadata IS NOT NULL AND metadata::text LIKE '%"provider":"STRIPE"%' THEN 'STRIPE'
        WHEN stripe_payment_intent_id LIKE 'pi_%' THEN 'STRIPE'
        WHEN external_transaction_id IS NOT NULL AND stripe_payment_intent_id NOT LIKE 'pi_%' THEN 'GIVEBUTTER'
        ELSE 'UNKNOWN'
    END as detected_provider,
    metadata
FROM user_payment_transaction
WHERE id = 4407;

|id   |tenant_id      |transaction_type|amount|status |stripe_payment_intent_id   |external_transaction_id    |payment_method|detected_provider|metadata                                                                                                                                                                                                          |
|-----|---------------|----------------|------|-------|---------------------------|---------------------------|--------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|4,407|tenant_demo_002|TICKET_SALE     |10    |PENDING|pi_3SUVyGK5BrggeAHM0Gb3zVav|pi_3SUVyGK5BrggeAHM0Gb3zVav|              |STRIPE           |{"customerEmail":"giventauser@gmail.com","externalTransactionId":"pi_3SUVyGK5BrggeAHM0Gb3zVav","email":"giventauser@gmail.com","customerName":"Gain Joseph","stripePaymentIntentId":"pi_3SUVyGK5BrggeAHM0Gb3zVav"}|


SELECT 
    id,
    title,
    metadata,
    -- Check if fundraiser event
    CASE 
        WHEN metadata IS NOT NULL AND metadata::text LIKE '%"isFundraiserEvent":true%' THEN 'YES'
        ELSE 'NO'
    END as is_fundraiser_event,
    -- Check if Givebutter configured
    CASE 
        WHEN metadata IS NOT NULL AND metadata::text LIKE '%"zeroFeeProvider":"GIVEBUTTER"%' THEN 'YES'
        ELSE 'NO'
    END as givebutter_configured
FROM event_details
WHERE id = 4101;

|id   |title        |metadata                                         |is_fundraiser_event|givebutter_configured|
|-----|-------------|-------------------------------------------------|-------------------|---------------------|
|4,101|New Year 2026|{"isFundraiserEvent":true,"isCharityEvent":false}|YES                |NO                   |

       
  SELECT 
    id,
    tenant_id,
    provider_name,
    
    payment_use_case,
    is_active,
    fallback_order
FROM payment_provider_config
WHERE tenant_id = 'tenant_demo_002'
  ;
    
    |id   |tenant_id      |provider_name|payment_use_case |is_active|fallback_order|
|-----|---------------|-------------|-----------------|---------|--------------|
|4,050|tenant_demo_002|STRIPE       |                 |true     |0             |
|4,100|tenant_demo_002|GIVEBUTTER   |DONATION_ZERO_FEE|true     |1             |

  SELECT 
   *
FROM payment_provider_config
WHERE tenant_id = 'tenant_demo_002'
  ;
  
  SELECT 
   *
FROM payment_provider_config
WHERE tenant_id in ('tenant_demo_002','tenant_demo_001')
  ;
  
  SELECT 
   *
FROM payment_provider_config

  ;

