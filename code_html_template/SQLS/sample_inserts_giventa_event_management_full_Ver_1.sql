
--SET ROLE giventa_event_management;

INSERT INTO public.event_type_details VALUES (1, 'tenant_demo_001', 'Gala', 'Formal gala event', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (2, 'tenant_demo_001', 'Conference', 'Tech conference', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (3, 'tenant_demo_001', 'Run', 'Charity run', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (4, 'tenant_demo_001', 'Picnic', 'Family picnic', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (5, 'tenant_demo_001', 'Dinner', 'VIP dinner', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (6, 'tenant_demo_001', 'Festival', 'Summer festival', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');

INSERT INTO public.user_profile VALUES (
  1, 'tenant_demo_001', 'user001', 'Alice', 'Johnson', 'alice.johnson@example.com', '555-1001', '123 Main St', NULL, 'Springfield', 'IL', '62701', 'USA', NULL, NULL, NULL, NULL, NULL, NULL,
  false, NULL, false, -- is_email_subscribed, email_subscription_token, is_email_subscription_token_used
  'ACTIVE', 'MEMBER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.user_profile VALUES (
  2, 'tenant_demo_001', 'user002', 'Bob', 'Smith', 'bob.smith@example.com', '555-1002', '456 Oak Ave', NULL, 'Springfield', 'IL', '62702', 'USA', NULL, NULL, NULL, NULL, NULL, NULL,
  false, NULL, false,
  'ACTIVE', 'ADMIN', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.user_profile VALUES (
  3, 'tenant_demo_001', 'user003', 'Carol', 'Williams', 'carol.williams@example.com', '555-1003', '789 Pine Rd', NULL, 'Springfield', 'IL', '62703', 'USA', NULL, NULL, NULL, NULL, NULL, NULL,
  false, NULL, false,
  'INACTIVE', 'VOLUNTEER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.user_profile VALUES (
  4, 'tenant_demo_001', 'user004', 'David', 'Brown', 'david.brown@example.com', '555-1004', '321 Maple St', NULL, 'Springfield', 'IL', '62704', 'USA', NULL, NULL, NULL, NULL, NULL, NULL,
  false, NULL, false,
  'PENDING_APPROVAL', 'ORGANIZER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.user_profile VALUES (
  5, 'tenant_demo_001', 'user005', 'Eve', 'Davis', 'eve.davis@example.com', '555-1005', '654 Cedar Ave', NULL, 'Springfield', 'IL', '62705', 'USA', NULL, NULL, NULL, NULL, NULL, NULL,
  false, NULL, false,
  'SUSPENDED', 'SUPER_ADMIN', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.user_profile VALUES (
  6, 'tenant_demo_001', 'user006', 'Frank', 'Miller', 'frank.miller@example.com', '555-1006', '987 Birch Blvd', NULL, 'Springfield', 'IL', '62706', 'USA', NULL, NULL, NULL, NULL, NULL, NULL,
  false, NULL, false,
  'BANNED', 'MEMBER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.user_profile VALUES (
  4651, 'tenant_demo_001', 'user_2vVLxhPnsIPGYf6qpfozk383Slr', 'Gain Joseph', 'Joseph', 'giventauser@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydlZMeGVDUnFWTnpkTDBLUXMySXNWekFBVG8ifQ',
  false, NULL, false,
  'PENDING_APPROVAL', 'MEMBER', NULL, NULL, '2025-06-22 16:44:08.782', '2025-06-22 23:01:49.434045', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(4, 'tenant_demo_001', 'VIP Dinner', 'Exclusive VIP Dinner', 'A dinner event for VIP guests.', '2025-09-15', '2025-01-15', '2025-09-15', '19:00', '22:00', 'America/New_York', 'Skyline Restaurant', NULL, 50, 'INVITATION_ONLY', true, 0, false, true, false, '2025-09-12 23:59:00.000', '2025-09-12 23:59:00.000', NULL, NULL, false, true, false, NULL, 5, 5, '2025-06-14 23:13:02.565', '2025-06-14 23:13:02.565', false, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(7, 'tenant_demo_001', 'Spring Gala', 'Annual Spring Gala', 'A celebration of spring with music and food.', '2025-08-10', '2025-01-10', '2025-08-10', '18:00', '23:00', 'America/New_York', 'Grand Hall', NULL, 200, 'TICKETED', true, 2, true, false, true, '2025-08-05 23:59:00.000', '2025-08-05 23:59:00.000', NULL, NULL, false, true, false, NULL, 1, 1, '2025-06-14 23:13:02.565', '2025-09-04 04:48:18.789', true, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(8, 'tenant_demo_001', 'Spring Gala', 'Annual Spring Gala', 'A celebration of spring with music and food.', '2025-08-10', '2025-01-12', '2025-08-10', '18:00', '23:00', 'America/New_York', 'Grand Hall', NULL, 200, 'TICKETED', true, 2, true, false, true, '2025-08-05 23:59:00.000', '2025-08-05 23:59:00.000', NULL, NULL, false, true, false, NULL, 1, 1, '2025-06-14 23:13:02.565', '2025-09-04 04:48:18.789', true, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(9, 'tenant_demo_001', 'Spring Gala', 'Annual Spring Gala', 'A celebration of spring with music and food.', '2025-08-10', '2025-01-14', '2025-08-10', '18:00', '23:00', 'America/New_York', 'Grand Hall', NULL, 200, 'TICKETED', true, 2, true, false, true, '2025-08-05 23:59:00.000', '2025-08-05 23:59:00.000', NULL, NULL, false, true, false, NULL, 1, 1, '2025-06-14 23:13:02.565', '2025-09-04 04:48:18.789', true, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(10, 'tenant_demo_001', 'Spring Gala', 'Annual Spring Gala', 'A celebration of spring with music and food.', '2025-08-10', '2025-01-16', '2025-08-10', '18:00', '23:00', 'America/New_York', 'Grand Hall', NULL, 200, 'TICKETED', true, 2, true, false, true, '2025-08-05 23:59:00.000', '2025-08-05 23:59:00.000', NULL, NULL, false, true, false, NULL, 1, 1, '2025-06-14 23:13:02.565', '2025-09-04 04:48:18.789', true, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(1, 'tenant_demo_001', 'KHNJ Mega Onam 2025', 'KHNJ Mega Onam 2025', 'Grand Vazhayila Onasadhya, Mega Thiruvathira, Mahabali Procession with Thalapoli, Chendamelam, Pulikali, Cultural Programs, Meet & Greet with Friends & Family, Mega Stage Show.', '2025-09-10', '2025-01-05', '2025-09-10', '11:00 AM', '06:00 PM', 'America/New_York', 'Jo Ann Arts Center, 200 Rues Ln, East Brunswick, NJ 08816', NULL, 500, 'ticketed', true, 5, true, true, false, '2025-08-12 23:59:00.000', '2025-08-12 23:59:00.000', NULL, NULL, false, true, false, NULL, 2, 6, '2025-06-14 23:13:02.565', '2025-09-04 04:48:18.789', false, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(2, 'tenant_demo_001', 'Spark of Kerala', 'A Showcase Of Performance Arts & Rhythm.', '"Spark of Kerala," a showcase of performance arts and rhythm organized by MCEFEE, taking place in the USA from August to September 2025.  •	Featured Artists: Swasika, Afsal, Mokksha, Akhila Anand, Veda Mithra, Sidhique Roshan, Kukku, Minnale Nazeer, Shiju, Vipin Kumar, Jojo Mathew, Suneeshmon.
•	Contact Information: Booking contacts Sujith (+1 551-283-2437) and Arun (+1 551-221-1972), and email contactus@mcefee.org.
', '2025-09-14', '2025-01-08', '2025-09-14', '05:00 PM', '09:00 PM', 'America/New_York', 'Breslin Performing Arts Center, 262 S Main St, Lodi, NJ 07644', NULL, 300, 'ticketed', true, 8, false, false, false, '2025-08-28 23:59:00.000', '2025-08-28 23:59:00.000', NULL, NULL, false, true, false, NULL, 3, 3, '2025-06-14 23:13:02.565', '2025-09-04 05:37:26.522', false, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(3, 'tenant_demo_001', 'STAGE SHOW', 'Community / Family Entertainment Day', 'Swasika | Afsal | Mokksha | Akhila Anand | Sidique Roshan | Kukku Shiju | Vipin Kumar | Jojo Mathew | Suneeshmon', '2025-09-21', '2025-01-20', '2025-09-21', '05:00 PM', '08:00 PM', 'America/New_York', 'IKCC Knanaya Community Center, 400 Willow Grv Rd, Stony Point, NY 10980', NULL, 200, 'ticketed', true, 4, true, false, false, '2025-09-05 23:59:00.000', '2025-09-05 23:59:00.000', NULL, NULL, false, true, false, NULL, 4, 1, '2025-06-14 23:13:02.565', '2025-09-04 15:40:43.740', false, false, false, false, 0, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(6, 'tenant_demo_001', 'Spring Gala', 'Annual Spring Gala', 'A celebration of spring with music and food.', '2025-09-20', '2025-01-18', '2025-09-20', '10:00 AM', '08:00 PM', 'America/New_York', 'Grand Hall', NULL, 200, 'TICKETED', true, 2, true, false, true, '2025-08-05 23:59:00.000', '2025-08-05 23:59:00.000', NULL, NULL, false, true, false, NULL, 1, 1, '2025-06-14 23:13:02.565', '2025-09-07 18:14:15.542', true, false, false, false, 2, 0);
INSERT INTO public.event_details
(id, tenant_id, title, caption, description, start_date, promotion_start_date, end_date, start_time, end_time, timezone, "location", directions_to_venue, capacity, admission_type, is_active, max_guests_per_attendee, allow_guests, require_guest_approval, enable_guest_pricing, registration_deadline, cancellation_deadline, minimum_age, maximum_age, requires_approval, enable_waitlist, enable_qr_code, external_registration_url, created_by_id, event_type_id, created_at, updated_at, is_registration_required, is_sports_event, is_live, is_featured_event, featured_event_priority_ranking, live_event_priority_ranking)
VALUES(5, 'tenant_demo_001', 'Summer Fest', 'Summer Festival', 'A festival with games, food, and music.', '2025-09-20', '2025-01-22', '2025-09-20', '10:00', '20:00', 'America/New_York', 'Downtown Plaza', NULL, 400, 'TICKETED', true, 3, true, true, true, '2025-09-12 23:59:00.000', '2025-09-12 23:59:00.000', NULL, NULL, false, true, false, NULL, 6, 6, '2025-06-14 23:13:02.565', '2025-09-07 18:33:43.178', false, false, false, true, 4, 0);


INSERT INTO public.event_guest_pricing VALUES (1, 'tenant_demo_001', 1, 'ADULT', 50.00, true, '2025-03-01', '2025-04-10', 'Adult pricing for Spring Gala', 2, 'Standard', 40.00, '2025-03-15 23:59:00', 5, 10.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (2, 'tenant_demo_001', 1, 'CHILD', 25.00, true, '2025-03-01', '2025-04-10', 'Child pricing for Spring Gala', 2, 'Standard', 20.00, '2025-03-15 23:59:00', 5, 10.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (3, 'tenant_demo_001', 2, 'ADULT', 100.00, true, '2025-04-01', '2025-05-15', 'Adult pricing for Tech Conference', 1, 'Premium', 80.00, '2025-04-20 23:59:00', 3, 15.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (4, 'tenant_demo_001', 2, 'TEEN', 60.00, true, '2025-04-01', '2025-05-15', 'Teen pricing for Tech Conference', 1, 'Premium', 50.00, '2025-04-20 23:59:00', 3, 15.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (5, 'tenant_demo_001', 3, 'ADULT', 0.00, true, '2025-05-01', '2025-06-01', 'Free for Charity Run', NULL, 'Free', NULL, NULL, NULL, NULL, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (6, 'tenant_demo_001', 4, 'ADULT', 10.00, true, '2025-07-01', '2025-07-20', 'Adult pricing for Family Picnic', 4, 'Standard', 8.00, '2025-07-10 23:59:00', 2, 5.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');

INSERT INTO public.event_admin VALUES (1, 'tenant_demo_001', 'ADMIN', '{CREATE_EVENT,EDIT_EVENT}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 2, 1);
INSERT INTO public.event_admin VALUES (2, 'tenant_demo_001', 'SUPER_ADMIN', '{ALL}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 5, 2);
INSERT INTO public.event_admin VALUES (3, 'tenant_demo_001', 'ORGANIZER', '{MANAGE_ATTENDEES}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 4, 2);
INSERT INTO public.event_admin VALUES (4, 'tenant_demo_001', 'VOLUNTEER', '{ASSIST}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 3, 1);
INSERT INTO public.event_admin VALUES (5, 'tenant_demo_001', 'MEMBER', '{VIEW}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 1, 2);
INSERT INTO public.event_admin VALUES (6, 'tenant_demo_001', 'ADMIN', '{CREATE_EVENT,EDIT_EVENT}', false, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 6, 1);
INSERT INTO public.event_admin_audit_log VALUES (1, 'tenant_demo_001', 'UPDATE', 'event_details', '1', '{"field": "title"}', '{"title": "Old"}', '{"title": "New"}', '192.168.1.1', 'Mozilla/5.0', 'sess1', '2025-06-22 11:31:26.48504', 1);
INSERT INTO public.event_admin_audit_log VALUES (2, 'tenant_demo_001', 'INSERT', 'event_details', '2', '{"field": "caption"}', NULL, '{"caption": "Added"}', '192.168.1.2', 'Mozilla/5.0', 'sess2', '2025-06-22 11:31:26.48504', 2);
INSERT INTO public.event_admin_audit_log VALUES (3, 'tenant_demo_001', 'DELETE', 'event_details', '3', NULL, '{"id": 3}', NULL, '192.168.1.3', 'Mozilla/5.0', 'sess3', '2025-06-22 11:31:26.48504', 3);
INSERT INTO public.event_admin_audit_log VALUES (4, 'tenant_demo_001', 'UPDATE', 'event_admin', '4', '{"field": "role"}', '{"role": "MEMBER"}', '{"role": "ADMIN"}', '192.168.1.4', 'Mozilla/5.0', 'sess4', '2025-06-22 11:31:26.48504', 4);
INSERT INTO public.event_admin_audit_log VALUES (5, 'tenant_demo_001', 'INSERT', 'event_admin', '5', '{"field": "permissions"}', NULL, '{"permissions": ["ALL"]}', '192.168.1.5', 'Mozilla/5.0', 'sess5', '2025-06-22 11:31:26.48504', 5);
INSERT INTO public.event_admin_audit_log VALUES (6, 'tenant_demo_001', 'DELETE', 'event_admin', '6', NULL, '{"id": 6}', NULL, '192.168.1.6', 'Mozilla/5.0', 'sess6', '2025-06-22 11:31:26.48504', 6);

INSERT INTO public.event_attendee (
    id, tenant_id, event_id, user_id, registration_status, registration_date, confirmation_date, cancellation_date, cancellation_reason, attendee_type, special_requirements, dietary_restrictions, accessibility_needs, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, total_number_of_guests, number_of_guests_checked_in, check_in_status, check_in_time, check_out_time, attendance_rating, feedback, notes, qr_code_data, qr_code_generated, qr_code_generated_at, registration_source, waitlist_position, priority_score, created_at, updated_at, first_name, last_name, email, phone, is_member
) VALUES
(1, 'tenant_demo_001', 1, 1, 'CONFIRMED', '2025-06-22 11:31:26.559053', NULL, NULL, NULL, 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:1|EVENT:1|TENANT:tenant_demo_001|NAME:Alice Johnson|EVENT_TITLE:Tech Conference|TIMESTAMP:1750606286.559053|TYPE:MEMBER', true, '2025-06-22 11:31:26.559053', 'DIRECT', NULL, 0, '2025-06-22 11:31:26.559053', '2025-06-22 11:31:26.559053', 'Alice', 'Johnson', 'alice.johnson@example.com', '555-1001', true),
(2, 'tenant_demo_001', 1, 2, 'CONFIRMED', '2025-06-22 11:31:26.559053', NULL, NULL, NULL, 'ADMIN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:2|EVENT:1|TENANT:tenant_demo_001|NAME:Bob Smith|EVENT_TITLE:Tech Conference|TIMESTAMP:1750606286.559053|TYPE:ADMIN', true, '2025-06-22 11:31:26.559053', 'DIRECT', NULL, 0, '2025-06-22 11:31:26.559053', '2025-06-22 11:31:26.559053', 'Bob', 'Smith', 'bob.smith@example.com', '555-1002', true),
(3, 'tenant_demo_001', 2, 3, 'PENDING', '2025-06-22 11:31:26.559053', NULL, NULL, NULL, 'VOLUNTEER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'DIRECT', NULL, 0, '2025-06-22 11:31:26.559053', '2025-06-22 11:31:26.559053', 'Carol', 'Williams', 'carol.williams@example.com', '555-1003', false),
(4, 'tenant_demo_001', 3, 4, 'WAITLISTED', '2025-06-22 11:31:26.559053', NULL, NULL, NULL, 'ORGANIZER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'DIRECT', NULL, 0, '2025-06-22 11:31:26.559053', '2025-06-22 11:31:26.559053', 'David', 'Brown', 'david.brown@example.com', '555-1004', true),
(5, 'tenant_demo_001', 4, 5, 'CANCELLED', '2025-06-22 11:31:26.559053', NULL, NULL, NULL, 'SUPER_ADMIN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NO_SHOW', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'DIRECT', NULL, 0, '2025-06-22 11:31:26.559053', '2025-06-22 11:31:26.559053', 'Eve', 'Davis', 'eve.davis@example.com', '555-1005', false),
(6, 'tenant_demo_001', 5, 6, 'CONFIRMED', '2025-06-22 11:31:26.559053', NULL, NULL, NULL, 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:6|EVENT:5|TENANT:tenant_demo_001|NAME:Frank Miller|EVENT_TITLE:Summer Fest|TIMESTAMP:1750606286.559053|TYPE:MEMBER', true, '2025-06-22 11:31:26.559053', 'DIRECT', NULL, 0, '2025-06-22 11:31:26.559053', '2025-06-22 11:31:26.559053', 'Frank', 'Miller', 'frank.miller@example.com', '555-1006', true);


INSERT INTO public.event_attendee_guest VALUES (1, 'tenant_demo_001', 1, 'CHILD', 'CHILD', NULL, NULL, NULL, 'CONFIRMED', 'CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-22 11:31:26.631934', '2025-06-22 11:31:26.631934', 'Sally', 'Guest', 'sally.guest@example.com', '555-2001');
INSERT INTO public.event_attendee_guest VALUES (2, 'tenant_demo_001', 2, 'ADULT', 'SPOUSE', NULL, NULL, NULL, 'CONFIRMED', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-22 11:31:26.631934', '2025-06-22 11:31:26.631934', 'Tom', 'Guest', 'tom.guest@example.com', '555-2002');
INSERT INTO public.event_attendee_guest VALUES (3, 'tenant_demo_001', 3, 'TEEN', 'FRIEND', NULL, NULL, NULL, 'PENDING', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-22 11:31:26.631934', '2025-06-22 11:31:26.631934', 'Jerry', 'Guest', 'jerry.guest@example.com', '555-2003');
INSERT INTO public.event_attendee_guest VALUES (4, 'tenant_demo_001', 4, 'INFANT', 'CHILD', NULL, NULL, NULL, 'WAITLISTED', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-22 11:31:26.631934', '2025-06-22 11:31:26.631934', 'Linda', 'Guest', 'linda.guest@example.com', '555-2004');
INSERT INTO public.event_attendee_guest VALUES (5, 'tenant_demo_001', 5, 'ADULT', 'COLLEAGUE', NULL, NULL, NULL, 'CANCELLED', 'NO_SHOW', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-22 11:31:26.631934', '2025-06-22 11:31:26.631934', 'Sam', 'Guest', 'sam.guest@example.com', '555-2005');
INSERT INTO public.event_attendee_guest VALUES (6, 'tenant_demo_001', 6, 'CHILD', 'RELATIVE', NULL, NULL, NULL, 'CONFIRMED', 'CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-22 11:31:26.631934', '2025-06-22 11:31:26.631934', 'Nina', 'Guest', 'nina.guest@example.com', '555-2006');
INSERT INTO public.event_calendar_entry VALUES (1, 'tenant_demo_001', 'Google', 'gcal_1', 'https://calendar.google.com/event1', 'PENDING', '2025-06-22 11:31:26.679295', NULL, '2025-06-22 11:31:26.679295', '2025-06-22 11:31:26.679295', 1, 1);
INSERT INTO public.event_calendar_entry VALUES (2, 'tenant_demo_001', 'Outlook', 'outlook_2', 'https://outlook.com/event2', 'COMPLETED', '2025-06-22 11:31:26.679295', NULL, '2025-06-22 11:31:26.679295', '2025-06-22 11:31:26.679295', 2, 2);
INSERT INTO public.event_calendar_entry VALUES (3, 'tenant_demo_001', 'Apple', 'apple_3', 'https://apple.com/event3', 'FAILED', '2025-06-22 11:31:26.679295', 'Error syncing', '2025-06-22 11:31:26.679295', '2025-06-22 11:31:26.679295', 3, 3);
INSERT INTO public.event_calendar_entry VALUES (4, 'tenant_demo_001', 'Google', 'gcal_4', 'https://calendar.google.com/event4', 'PENDING', '2025-06-22 11:31:26.679295', NULL, '2025-06-22 11:31:26.679295', '2025-06-22 11:31:26.679295', 4, 4);
INSERT INTO public.event_calendar_entry VALUES (5, 'tenant_demo_001', 'Outlook', 'outlook_5', 'https://outlook.com/event5', 'COMPLETED', '2025-06-22 11:31:26.679295', NULL, '2025-06-22 11:31:26.679295', '2025-06-22 11:31:26.679295', 5, 5);
INSERT INTO public.event_calendar_entry VALUES (6, 'tenant_demo_001', 'Apple', 'apple_6', 'https://apple.com/event6', 'FAILED', '2025-06-22 11:31:26.679295', 'Error syncing', '2025-06-22 11:31:26.679295', '2025-06-22 11:31:26.679295', 6, 6);
INSERT INTO public.event_live_update VALUES (1, 1, 'INFO', 'Welcome to Spring Gala!', NULL, NULL, NULL, NULL, 1, true, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (2, 2, 'ALERT', 'Tech Conference Keynote at 10am', NULL, NULL, NULL, NULL, 2, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (3, 3, 'INFO', 'Charity Run starts at 7am', NULL, NULL, NULL, NULL, 3, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (4, 4, 'INFO', 'Family Picnic games at noon', NULL, NULL, NULL, NULL, 4, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (5, 5, 'ALERT', 'VIP Dinner seating at 7pm', NULL, NULL, NULL, NULL, 5, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (6, 6, 'INFO', 'Summer Fest parade at 5pm', NULL, NULL, NULL, NULL, 6, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update_attachment VALUES (1, 1, 'IMAGE', 'https://example.com/image1.jpg', 1, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (2, 2, 'VIDEO', 'https://example.com/video2.mp4', 2, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (3, 3, 'IMAGE', 'https://example.com/image3.jpg', 3, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (4, 4, 'IMAGE', 'https://example.com/image4.jpg', 4, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (5, 5, 'VIDEO', 'https://example.com/video5.mp4', 5, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (6, 6, 'IMAGE', 'https://example.com/image6.jpg', 6, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');


INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4050, 'tenant_demo_001', 'street_fair.jfif', '115941', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/street_fair_1750026381257_f70e40cf.jfif', NULL, 'image/jpeg', 10551, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/street_fair_1750026381257_f70e40cf.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=7b739490bda78d4127fbeb267d77856a11cc59a83b24e90c666a76783393e15d', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-15', '2025-06-15 22:26:21.363', '2025-06-15 22:26:21.363', 2, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4100, 'tenant_demo_001', 'night_party.jfif', '115942', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/night_party_1750026381113_69263496.jfif', NULL, 'image/jpeg', 8851, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/night_party_1750026381113_69263496.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=976a14bab785e95765850160c250285fa2408035afc3b3eb7354e497769c5ffa', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-10', '2025-06-15 22:26:21.256', '2025-06-15 22:26:21.256', 3, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4150, 'tenant_demo_001', 'music_fest.jfif', '115943', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/music_fest_1750026380991_16eac442.jfif', NULL, 'image/jpeg', 13369, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/music_fest_1750026380991_16eac442.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=fe05c34013a10da60e63df0cc7bcf34a493ff96dbd9a732408bebcff759afe96', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-12', '2025-06-15 22:26:21.112', '2025-06-15 22:26:21.112', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4200, 'tenant_demo_001', 'mens_party.jfif', '115944', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/mens_party_1750026380857_14c08f34.jfif', NULL, 'image/jpeg', 11908, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/mens_party_1750026380857_14c08f34.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=9b8f1373e82b4c9ef900736e3955434b27150e958e7816aa6e65bd9ae42e1080', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-14', '2025-06-15 22:26:20.990', '2025-06-15 22:26:20.990', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4250, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', '115945', 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif', NULL, 'image/avif', 76564, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=c73013131cf421a28789e4fa611ce521b4c6d2f7998fa2e72551c10aa70e8070', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-16', '2025-06-15 22:26:20.856', '2025-06-15 22:26:20.856', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4300, 'tenant_demo_001', 'glow_party.jfif', '115946', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/glow_party_1750026380446_f58e53cd.jfif', NULL, 'image/jpeg', 14345, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/glow_party_1750026380446_f58e53cd.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=67f5380e4492f8716887259519c3d1e98ac6b969079e15f80396d38c6a1a4273', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-18', '2025-06-15 22:26:20.583', '2025-06-15 22:26:20.583', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4350, 'tenant_demo_001', 'zxz', '115947', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/event-poster-music-event_1749958343913_61cef052.jpg', NULL, 'image/jpeg', 26137, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/event-poster-music-event_1749958343913_61cef052.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T033224Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f4a4017dbd783d610b73d436526f49fede315bf8f99b7c11e11f765fa0bcd712', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-20', '2025-06-15 03:32:24.279', '2025-06-15 03:32:24.279', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4400, 'tenant_demo_001', 'xcxcxcxxcxcxc', '115948', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/glow_party_1750045122643_236bc54f.jfif', NULL, 'image/jpeg', 14345, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/glow_party_1750045122643_236bc54f.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f58364d96ff6d0a6127e70f1bd13fa54fe5dda93961360cfb8f3048cc208ee3f', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-22', '2025-06-16 03:38:43.045', '2025-06-16 03:38:43.045', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4450, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', NULL, 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/kanj_cine_star_nite_2025_1750045123063_470db4ac.avif', NULL, 'image/avif', 76564, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/kanj_cine_star_nite_2025_1750045123063_470db4ac.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=96f8190f8b95f7185b5d7f92423c3682577db0728032abee59b781f82e280718', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-24', '2025-06-16 03:38:43.228', '2025-06-16 03:38:43.228', 2, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4500, 'tenant_demo_001', 'mens_party.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/mens_party_1750045123229_c2447fa3.jfif', NULL, 'image/jpeg', 11908, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/mens_party_1750045123229_c2447fa3.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=74d7c46ca459bfa5e451dd145e63b4b845b87fb8979796ee8dfd77e77262864c', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-26', '2025-06-16 03:38:43.330', '2025-06-16 03:38:43.330', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4550, 'tenant_demo_001', 'street_fair.jfif', '115941', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/street_fair_1750026381257_f70e40cf.jfif', NULL, 'image/jpeg', 10551, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/street_fair_1750026381257_f70e40cf.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=7b739490bda78d4127fbeb267d77856a11cc59a83b24e90c666a76783393e15d', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-15', '2025-06-15 22:26:21.363', '2025-06-15 22:26:21.363', 2, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4600, 'tenant_demo_001', 'night_party.jfif', '115942', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/night_party_1750026381113_69263496.jfif', NULL, 'image/jpeg', 8851, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/night_party_1750026381113_69263496.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=976a14bab785e95765850160c250285fa2408035afc3b3eb7354e497769c5ffa', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-10', '2025-06-15 22:26:21.256', '2025-06-15 22:26:21.256', 3, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4650, 'tenant_demo_001', 'music_fest.jfif', '115943', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/music_fest_1750026380991_16eac442.jfif', NULL, 'image/jpeg', 13369, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/music_fest_1750026380991_16eac442.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=fe05c34013a10da60e63df0cc7bcf34a493ff96dbd9a732408bebcff759afe96', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-12', '2025-06-15 22:26:21.112', '2025-06-15 22:26:21.112', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4700, 'tenant_demo_001', 'mens_party.jfif', '115944', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/mens_party_1750026380857_14c08f34.jfif', NULL, 'image/jpeg', 11908, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/mens_party_1750026380857_14c08f34.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=9b8f1373e82b4c9ef900736e3955434b27150e958e7816aa6e65bd9ae42e1080', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-14', '2025-06-15 22:26:20.990', '2025-06-15 22:26:20.990', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4750, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', '115945', 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif', NULL, 'image/avif', 76564, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=c73013131cf421a28789e4fa611ce521b4c6d2f7998fa2e72551c10aa70e8070', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-16', '2025-06-15 22:26:20.856', '2025-06-15 22:26:20.856', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4800, 'tenant_demo_001', 'glow_party.jfif', '115946', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/glow_party_1750026380446_f58e53cd.jfif', NULL, 'image/jpeg', 14345, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/glow_party_1750026380446_f58e53cd.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=67f5380e4492f8716887259519c3d1e98ac6b969079e15f80396d38c6a1a4273', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-18', '2025-06-15 22:26:20.583', '2025-06-15 22:26:20.583', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4850, 'tenant_demo_001', 'zxz', '115947', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/event-poster-music-event_1749958343913_61cef052.jpg', NULL, 'image/jpeg', 26137, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/event-poster-music-event_1749958343913_61cef052.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T033224Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f4a4017dbd783d610b73d436526f49fede315bf8f99b7c11e11f765fa0bcd712', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-20', '2025-06-15 03:32:24.279', '2025-06-15 03:32:24.279', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4900, 'tenant_demo_001', 'xcxcxcxxcxcxc', '115948', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/glow_party_1750045122643_236bc54f.jfif', NULL, 'image/jpeg', 14345, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/glow_party_1750045122643_236bc54f.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f58364d96ff6d0a6127e70f1bd13fa54fe5dda93961360cfb8f3048cc208ee3f', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-22', '2025-06-16 03:38:43.045', '2025-06-16 03:38:43.045', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(4950, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', NULL, 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/kanj_cine_star_nite_2025_1750045123063_470db4ac.avif', NULL, 'image/avif', 76564, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/kanj_cine_star_nite_2025_1750045123063_470db4ac.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=96f8190f8b95f7185b5d7f92423c3682577db0728032abee59b781f82e280718', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-24', '2025-06-16 03:38:43.228', '2025-06-16 03:38:43.228', 2, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5000, 'tenant_demo_001', 'mens_party.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/mens_party_1750045123229_c2447fa3.jfif', NULL, 'image/jpeg', 11908, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/mens_party_1750045123229_c2447fa3.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=74d7c46ca459bfa5e451dd145e63b4b845b87fb8979796ee8dfd77e77262864c', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-26', '2025-06-16 03:38:43.330', '2025-06-16 03:38:43.330', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5050, 'tenant_demo_001', 'music_fest.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/music_fest_1750045123331_4703ef82.jfif', NULL, 'image/jpeg', 13369, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/music_fest_1750045123331_4703ef82.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=ccafab0578292825faf548600cc8c7b7b97623ed7dff502f5bc3da8d9be5dd2c', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-28', '2025-06-16 03:38:43.437', '2025-06-16 03:38:43.437', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5100, 'tenant_demo_001', 'night_party.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/night_party_1750045123438_59d4ca6c.jfif', NULL, 'image/jpeg', 8851, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/night_party_1750045123438_59d4ca6c.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=89011e0a4126acad5b6e9c231c6813f3079fca0ad3a8bf3276fedb8b69b948', NULL, NULL, NULL, NULL, false, NULL, false, false, '2025-01-30', '2025-06-16 03:38:43.540', '2025-06-16 03:38:43.540', 1, 1, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5150, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', NULL, 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750611778776_7cd3457e.avif', NULL, 'image/avif', 76564, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750611778776_7cd3457e.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250622T170300Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250622%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=b57df8d480ce0e14365a1fe584665d8bc32608b186c5ce0a562a8010e014b690', NULL, NULL, NULL, NULL, NULL, NULL, false, false, '2025-01-05', '2025-06-22 17:03:00.151', '2025-06-22 17:03:00.151', 1, 4651, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5200, 'tenant_demo_001', 'spark_kerala_event_2025_1920px', 'spark_kerala_event_2025_1920px.jpeg', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/spark_kerala_event_2025_1756990296631_42abe2fa.jpeg', NULL, NULL, 194143, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/spark_kerala_event_2025_1756990296631_42abe2fa.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250904T125136Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250904%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=d99cbd7351a1a8a69e0704c007328d7f0dc931fba9f76948e97008a45a1685ce', NULL, NULL, NULL, NULL, NULL, NULL, false, false, '2025-01-08', '2025-09-04 12:51:36.975', '2025-09-04 12:51:36.975', 2, 4651, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5250, 'tenant_demo_001', 'sdsdsdsds', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/buy_tickets_sep_15_parsippany_1756991584906_90744672.jpeg', NULL, NULL, 784621, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/buy_tickets_sep_15_parsippany_1756991584906_90744672.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250904T131305Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250904%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=2d3625454d2ece527eaa30d040cb768fee4f83dc6353bb5ff73ba2fc87992aee', NULL, NULL, NULL, NULL, NULL, NULL, false, false, '2025-01-12', '2025-09-04 13:13:05.128', '2025-09-04 13:13:05.128', 2, 4651, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5300, 'tenant_demo_001', 'zxzxzxzx', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/email_header_image_1756991610137_e08b48f1.jpeg', NULL, NULL, 193978, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/email_header_image_1756991610137_e08b48f1.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250904T131330Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250904%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=8d7ac38ab728bbf45e195682f5d973881daa8275e91ab4100ca5c76614b4291e', NULL, NULL, NULL, NULL, NULL, NULL, false, false, '2025-01-14', '2025-09-04 13:13:30.272', '2025-09-04 13:13:30.272', 2, 4651, false, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5350, 'tenant_demo_001', 'xcxcxcxcxcx', '', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/spark_kerala_event_2025_1756991634380_5a3890d1.jpeg', NULL, NULL, 194143, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/spark_kerala_event_2025_1756991634380_5a3890d1.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250904T131354Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250904%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f969bf5b8e8a6dae8a94982f2361649a8d23dd66cf3954c01d7c1ef1297249ba', NULL, '', NULL, NULL, false, '', false, false, '2025-01-16', '2025-09-04 13:13:54.508', '2025-09-09 16:47:27.529', 2, 4651, true, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5402, 'tenant_demo_001', 'khnk', NULL, 'image/png', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/khnj_onam_2025_1920px_with_bgc_1757362420545_1f202d92.png', NULL, NULL, 610808, true, false, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/khnj_onam_2025_1920px_with_bgc_1757362420545_1f202d92.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250908T201341Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250908%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=26e42a666e09bc9746d8d70b17835b513d1030ab54d5c27afcf3be9261bc3025', NULL, NULL, NULL, NULL, false, '', false, false, '2025-09-08', '2025-09-08 20:13:41.173', '2025-09-09 18:30:53.715', 1, 4651, true, false, false);
INSERT INTO public.event_media
(id, tenant_id, title, description, event_media_type, storage_type, file_url, file_data_content_type, content_type, file_size, is_public, event_flyer, is_event_management_official_document, pre_signed_url, pre_signed_url_expires_at, alt_text, display_order, download_count, is_featured_video, featured_video_url, is_hero_image, is_active_hero_image, start_displaying_from_date, created_at, updated_at, event_id, uploaded_by_id, is_home_page_hero_image, is_featured_event_image, is_live_event_image)
VALUES(5451, 'tenant_demo_001', 'khnj live and feature', '', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/khnj_onam_2025_1920px_1757429409289_4693cd88.jpg', NULL, NULL, 246487, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/khnj_onam_2025_1920px_1757429409289_4693cd88.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250909T145010Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250909%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=4ee19c1217837ca7002149666f76c23868cad2d68902614eb2e24d647a693437', NULL, '', NULL, NULL, false, '', true, false, '2025-09-09', '2025-09-09 14:50:10.906', '2025-09-09 20:06:20.229', 1, 4651, true, true, true);

INSERT INTO public.event_organizer VALUES (1, 'tenant_demo_001', 'Lead Organizer', 'Manager', 'lead1@example.com', '555-3001', true, 1, 'Lead for Spring Gala', 'https://example.com/lead1.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 1, 1);
INSERT INTO public.event_organizer VALUES (2, 'tenant_demo_001', 'Co-Organizer', 'Assistant', 'co2@example.com', '555-3002', false, 2, 'Co-lead for Tech Conference', 'https://example.com/co2.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 2, 2);
INSERT INTO public.event_organizer VALUES (3, 'tenant_demo_001', 'Volunteer Lead', 'Volunteer', 'vol3@example.com', '555-3003', false, 3, 'Volunteer for Charity Run', 'https://example.com/vol3.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 3, 3);
INSERT INTO public.event_organizer VALUES (4, 'tenant_demo_001', 'Family Host', 'Host', 'host4@example.com', '555-3004', true, 4, 'Host for Family Picnic', 'https://example.com/host4.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 4, 4);
INSERT INTO public.event_organizer VALUES (5, 'tenant_demo_001', 'VIP Host', 'Manager', 'vip5@example.com', '555-3005', true, 5, 'Host for VIP Dinner', 'https://example.com/vip5.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 5, 5);
INSERT INTO public.event_organizer VALUES (6, 'tenant_demo_001', 'Summer Fest Lead', 'Manager', 'summer6@example.com', '555-3006', true, 6, 'Lead for Summer Fest', 'https://example.com/summer6.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 6, 6);
INSERT INTO public.event_poll VALUES (1, 'tenant_demo_001', 'Spring Gala Feedback', 'Feedback poll for Spring Gala', true, false, false, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 1, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 1, 1);
INSERT INTO public.event_poll VALUES (2, 'tenant_demo_001', 'Tech Conference Topics', 'Vote for topics', true, false, true, '2025-06-22 11:31:26.972218', '2025-06-24 11:31:26.972218', 2, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 2, 2);
INSERT INTO public.event_poll VALUES (3, 'tenant_demo_001', 'Charity Run Survey', 'Survey for runners', true, true, false, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 1, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 3, 3);
INSERT INTO public.event_poll VALUES (4, 'tenant_demo_001', 'Family Picnic Games', 'Vote for games', true, false, true, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 3, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 4, 4);
INSERT INTO public.event_poll VALUES (5, 'tenant_demo_001', 'VIP Dinner Menu', 'Choose menu items', true, false, false, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 1, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 5, 5);
INSERT INTO public.event_poll VALUES (6, 'tenant_demo_001', 'Summer Fest Events', 'Vote for events', true, false, true, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 2, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 6, 6);
INSERT INTO public.event_poll_option VALUES (1, 'tenant_demo_001', 'Excellent', 1, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 1);
INSERT INTO public.event_poll_option VALUES (2, 'tenant_demo_001', 'Good', 2, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 1);
INSERT INTO public.event_poll_option VALUES (3, 'tenant_demo_001', 'Average', 3, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 1);
INSERT INTO public.event_poll_option VALUES (4, 'tenant_demo_001', 'Topic A', 1, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 2);
INSERT INTO public.event_poll_option VALUES (5, 'tenant_demo_001', 'Topic B', 2, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 2);
INSERT INTO public.event_poll_option VALUES (6, 'tenant_demo_001', 'Fun', 1, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 4);
INSERT INTO public.event_poll_response VALUES (1, 'tenant_demo_001', 'Great event!', 'Excellent', false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 1, 1, 1);
INSERT INTO public.event_poll_response VALUES (2, 'tenant_demo_001', 'Loved it', 'Good', false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 1, 2, 2);
INSERT INTO public.event_poll_response VALUES (3, 'tenant_demo_001', 'Could be better', 'Average', true, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 1, 3, 3);
INSERT INTO public.event_poll_response VALUES (4, 'tenant_demo_001', 'Vote for Topic A', NULL, false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 2, 4, 4);
INSERT INTO public.event_poll_response VALUES (5, 'tenant_demo_001', 'Vote for Topic B', NULL, false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 2, 5, 5);
INSERT INTO public.event_poll_response VALUES (6, 'tenant_demo_001', 'Fun games', 'Fun', false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 4, 6, 6);
INSERT INTO public.event_score_card VALUES (1, 1, 'Team Red', 'Team Blue', 10, 8, 'Close match', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (2, 2, 'Team Alpha', 'Team Beta', 15, 12, 'Exciting', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (3, 3, 'Team One', 'Team Two', 7, 9, 'Well played', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (4, 4, 'Team A', 'Team B', 5, 5, 'Draw', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (5, 5, 'Team X', 'Team Y', 20, 18, 'High scoring', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (6, 6, 'Team Sun', 'Team Moon', 13, 14, 'Nail-biter', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card_detail VALUES (1, 1, 'Team Red', 'Alice', 5, 'Great play', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (2, 1, 'Team Blue', 'Bob', 4, 'Strong defense', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (3, 2, 'Team Alpha', 'Carol', 8, 'Top scorer', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (4, 2, 'Team Beta', 'David', 7, 'Good effort', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (5, 3, 'Team One', 'Eve', 3, 'Quick start', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (6, 3, 'Team Two', 'Frank', 6, 'Solid finish', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.discount_code VALUES (2, 'VIP50', '50% off for VIPs', 'PERCENT', 50.00, 10, 2, '2025-04-01 00:00:00', '2025-08-01 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 2, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (4, 'EARLYBIRD', 'Early bird discount', 'PERCENT', 20.00, 200, 20, '2025-01-01 00:00:00', '2025-04-10 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 4, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (5, 'SUMMERFEST', 'Summer Fest special', 'PERCENT', 15.00, 150, 15, '2025-07-01 00:00:00', '2025-08-16 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 5, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (6, 'FAMILY5', 'Family Picnic 5% off', 'PERCENT', 5.00, 50, 3, '2025-07-01 00:00:00', '2025-07-21 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 6, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (1, 'SPRING10', '10% off Spring events', 'PERCENTAGE', 10.00, 100, 5, '2025-03-01 00:00:00', '2025-06-01 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 1, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (3, 'FREERUN', 'Free entry for Charity Run', 'FIXED_AMOUNT', 100.00, 50, 10, '2025-05-01 00:00:00', '2025-06-02 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 3, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (4851, 'SPRING12', 'xcxcxc', 'FIXED_AMOUNT', 4.00, 100, NULL, NULL, NULL, true, '2025-06-23 05:29:02.585', '2025-06-23 05:29:02.585', 1, 'tenant_demo_001');

-- Fixed INSERT statements for event_ticket_type table
INSERT INTO public.event_ticket_type VALUES (1, 'tenant_demo_001', 'Standard', 'Standard ticket for Spring Gala', 50.00, false, NULL, 'STD', 100, 12, 88, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 6);

INSERT INTO public.event_ticket_type VALUES (3, 'tenant_demo_001', 'Runner', 'Runner ticket for Charity Run', 0.00, false, NULL, 'RUN', 300, 103, 197, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 3);

INSERT INTO public.event_ticket_type VALUES (4, 'tenant_demo_001', 'Family', 'Family ticket for Picnic', 20.00, false, NULL, 'FAM', 30, 14, 16, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 4);

INSERT INTO public.event_ticket_type VALUES (5, 'tenant_demo_001', 'Dinner', 'Dinner ticket for VIP Dinner', 100.00, false, NULL, 'DIN', 20, 9, 11, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 5);

INSERT INTO public.event_ticket_type VALUES (6, 'tenant_demo_001', 'Festival', 'Festival ticket for Summer Fest', 30.00, false, NULL, 'FEST', 200, 52, 148, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 6);

INSERT INTO public.event_ticket_type VALUES (2, 'tenant_demo_001', 'VIP', 'VIP ticket for Tech Conference', 200.00, false, NULL, 'VIP', 48, 8, 40, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 14:03:04.384515', 2);

INSERT INTO public.event_ticket_type VALUES (4752, 'tenant_demo_001', 'FAMILY5', 'xzxzxzxz', 10.00, false, 0.00, 'FAMILY5', 83, 6, 77, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 17:50:20.591', '2025-06-22 16:46:15.904713', 1);

INSERT INTO public.event_ticket_type VALUES (4751, 'tenant_demo_001', 'zxzxz', 'xzxzxzxz', 20.00, false, 0.00, 'DIN', 84, 25, 59, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 17:48:59.275', '2025-06-23 01:17:30.642189', 1);


-- here the column transaction_reference  is omitted since its auto generated in the db sql


INSERT INTO public.event_ticket_transaction (
    id, tenant_id,  email, first_name, last_name, phone, quantity, price_per_unit, total_amount, tax_amount, platform_fee_amount, discount_code_id, discount_amount, final_amount, status, payment_method, payment_reference, stripe_checkout_session_id, stripe_payment_intent_id, purchase_date, confirmation_sent_at, refund_amount, refund_date, refund_reason, stripe_customer_id, stripe_payment_status, stripe_customer_email, stripe_payment_currency, stripe_amount_discount, stripe_amount_tax, stripe_fee_amount, qr_code_image_url, event_id, user_id, created_at, updated_at, number_of_guests_checked_in, check_in_status, check_in_time, check_out_time
) VALUES
(1, 'tenant_demo_001',  'alice.johnson@example.com', 'Alice', 'Johnson', '555-1001', 2, 50.00, 100.00, 5.00, 2.00, 1, 10.00, 87.00, 'COMPLETED', 'CARD', 'REF001', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, NULL, NULL, NULL),
(2, 'tenant_demo_001',  'bob.smith@example.com', 'Bob', 'Smith', '555-1002', 1, 200.00, 200.00, 10.00, 5.00, 2, 20.00, 185.00, 'COMPLETED', 'CARD', 'REF002', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 2, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, NULL, NULL, NULL),
(3, 'tenant_demo_001',  'carol.williams@example.com', 'Carol', 'Williams', '555-1003', 3, 0.00, 0.00, 0.00, 0.00, 3, 0.00, 0.00, 'COMPLETED', 'CASH', 'REF003', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, NULL, NULL, NULL),
(4, 'tenant_demo_001',  'david.brown@example.com', 'David', 'Brown', '555-1004', 4, 20.00, 80.00, 4.00, 1.00, 4, 5.00, 70.00, 'COMPLETED', 'CARD', 'REF004', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, NULL, NULL, NULL),
(5, 'tenant_demo_001',  'eve.davis@example.com', 'Eve', 'Davis', '555-1005', 1, 100.00, 100.00, 5.00, 2.00, 5, 10.00, 87.00, 'COMPLETED', 'CARD', 'REF005', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, 5, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, NULL, NULL, NULL),
(6, 'tenant_demo_001',  'frank.miller@example.com', 'Frank', 'Miller', '555-1006', 2, 30.00, 60.00, 3.00, 1.00, 6, 2.00, 54.00, 'COMPLETED', 'CARD', 'REF006', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, 6, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, NULL, NULL, NULL);


INSERT INTO public.qr_code_usage VALUES (1, 'tenant_demo_001', 1, 'QR1', 'CHECK_IN', '2025-06-22 11:31:27.426132', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, true, NULL, NULL, '2025-06-22 11:31:27.426132');
INSERT INTO public.qr_code_usage VALUES (2, 'tenant_demo_001', 2, 'QR2', 'CHECK_IN', '2025-06-22 11:31:27.426132', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, true, NULL, NULL, '2025-06-22 11:31:27.426132');
INSERT INTO public.qr_code_usage VALUES (3, 'tenant_demo_001', 3, 'QR3', 'CHECK_IN', '2025-06-22 11:31:27.426132', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, true, NULL, NULL, '2025-06-22 11:31:27.426132');
INSERT INTO public.qr_code_usage VALUES (4, 'tenant_demo_001', 4, 'QR4', 'CHECK_IN', '2025-06-22 11:31:27.426132', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, true, NULL, NULL, '2025-06-22 11:31:27.426132');
INSERT INTO public.qr_code_usage VALUES (5, 'tenant_demo_001', 5, 'QR5', 'CHECK_IN', '2025-06-22 11:31:27.426132', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, true, NULL, NULL, '2025-06-22 11:31:27.426132');
INSERT INTO public.qr_code_usage VALUES (6, 'tenant_demo_001', 6, 'QR6', 'CHECK_IN', '2025-06-22 11:31:27.426132', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, true, NULL, NULL, '2025-06-22 11:31:27.426132');
INSERT INTO public.tenant_organization VALUES (1, 'tenant_demo_001', 'Malayalees US', NULL, NULL, NULL, NULL, 'contact1@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (2, 'tenant_demo_002', 'Techies US', NULL, NULL, NULL, NULL, 'contact2@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (3, 'tenant_demo_003', 'Charity Org', NULL, NULL, NULL, NULL, 'contact3@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (4, 'tenant_demo_004', 'Family Org', NULL, NULL, NULL, NULL, 'contact4@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (5, 'tenant_demo_005', 'VIP Org', NULL, NULL, NULL, NULL, 'contact5@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (6, 'tenant_demo_006', 'Summer Org', NULL, NULL, NULL, NULL, 'contact6@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');

	INSERT INTO public.tenant_settings
	(id, tenant_id, allow_user_registration, require_admin_approval, enable_whatsapp_integration, enable_email_marketing, whatsapp_api_key, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, created_at, updated_at, tenant_organization_id)
	VALUES(1, 'tenant_demo_001', true, false, false, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 5, 100, NULL, '2025-06-22 11:31:27.571', '2025-09-11 22:08:43.520', 1);
	INSERT INTO public.tenant_settings
	(id, tenant_id, allow_user_registration, require_admin_approval, enable_whatsapp_integration, enable_email_marketing, whatsapp_api_key, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, created_at, updated_at, tenant_organization_id)
	VALUES(2, 'tenant_demo_002', true, true, true, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 10, 200, NULL, '2025-06-22 11:31:27.571', '2025-09-11 22:08:43.520', 2);
	INSERT INTO public.tenant_settings
	(id, tenant_id, allow_user_registration, require_admin_approval, enable_whatsapp_integration, enable_email_marketing, whatsapp_api_key, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, created_at, updated_at, tenant_organization_id)
	VALUES(3, 'tenant_demo_003', false, false, false, true, NULL, NULL, NULL, NULL, NULL, NULL, false, 3, 50, NULL, '2025-06-22 11:31:27.571', '2025-09-11 22:08:43.520', 3);
	INSERT INTO public.tenant_settings
	(id, tenant_id, allow_user_registration, require_admin_approval, enable_whatsapp_integration, enable_email_marketing, whatsapp_api_key, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, created_at, updated_at, tenant_organization_id)
	VALUES(4, 'tenant_demo_004', true, false, true, true, NULL, NULL, NULL, NULL, NULL, NULL, true, 8, 150, NULL, '2025-06-22 11:31:27.571', '2025-09-11 22:08:43.520', 4);
	INSERT INTO public.tenant_settings
	(id, tenant_id, allow_user_registration, require_admin_approval, enable_whatsapp_integration, enable_email_marketing, whatsapp_api_key, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, created_at, updated_at, tenant_organization_id)
	VALUES(5, 'tenant_demo_005', true, true, false, true, NULL, NULL, NULL, NULL, NULL, NULL, false, 2, 75, NULL, '2025-06-22 11:31:27.571', '2025-09-11 22:08:43.520', 5);
	INSERT INTO public.tenant_settings
	(id, tenant_id, allow_user_registration, require_admin_approval, enable_whatsapp_integration, enable_email_marketing, whatsapp_api_key, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, created_at, updated_at, tenant_organization_id)
	VALUES(6, 'tenant_demo_006', false, true, true, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 6, 120, NULL, '2025-06-22 11:31:27.571', '2025-09-11 22:08:43.520', 6);

INSERT INTO public.user_payment_transaction VALUES (1, 'tenant_demo_001', 'TICKET_SALE', 100.00, 'USD', NULL, NULL, 0.00, 0.00, 'COMPLETED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 1, 1, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (2, 'tenant_demo_001', 'SUBSCRIPTION', 200.00, 'USD', NULL, NULL, 0.00, 0.00, 'COMPLETED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 2, NULL, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (3, 'tenant_demo_001', 'COMMISSION', 50.00, 'USD', NULL, NULL, 0.00, 0.00, 'PENDING', 0.00, NULL, NULL, 'CASH', NULL, NULL, 3, 2, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (4, 'tenant_demo_001', 'REFUND', 75.00, 'USD', NULL, NULL, 0.00, 0.00, 'FAILED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 4, 3, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (5, 'tenant_demo_001', 'TICKET_SALE', 120.00, 'USD', NULL, NULL, 0.00, 0.00, 'COMPLETED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 5, 4, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (6, 'tenant_demo_001', 'SUBSCRIPTION', 60.00, 'USD', NULL, NULL, 0.00, 0.00, 'REFUNDED', 0.00, NULL, NULL, 'CASH', NULL, NULL, 6, NULL, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_subscription VALUES (1, 'tenant_demo_001', 'cus_001', 'sub_001', 'price_001', '2025-07-22 11:31:27.659946', 'ACTIVE', '2025-06-29 11:31:27.659946', false, 1, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (2, 'tenant_demo_001', 'cus_002', 'sub_002', 'price_002', '2025-07-22 11:31:27.659946', 'TRIAL', '2025-07-06 11:31:27.659946', false, 2, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (3, 'tenant_demo_001', 'cus_003', 'sub_003', 'price_003', '2025-07-22 11:31:27.659946', 'CANCELLED', '2025-06-29 11:31:27.659946', true, 3, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (4, 'tenant_demo_001', 'cus_004', 'sub_004', 'price_004', '2025-07-22 11:31:27.659946', 'EXPIRED', '2025-06-29 11:31:27.659946', false, 4, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (5, 'tenant_demo_001', 'cus_005', 'sub_005', 'price_005', '2025-07-22 11:31:27.659946', 'SUSPENDED', '2025-06-29 11:31:27.659946', false, 5, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (6, 'tenant_demo_001', 'cus_006', 'sub_006', 'price_006', '2025-07-22 11:31:27.659946', 'ACTIVE', '2025-06-29 11:31:27.659946', false, 6, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_task VALUES (1, 'tenant_demo_001', 'Setup Venue', 'Setup the venue for Spring Gala', 'PENDING', 'HIGH', '2025-06-24 11:31:27.727601', false, NULL, 5.00, NULL, 0, 1, 'Alice', '555-1001', 'alice.johnson@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 1);
INSERT INTO public.user_task VALUES (2, 'tenant_demo_001', 'Arrange Catering', 'Arrange food for Tech Conference', 'PENDING', 'MEDIUM', '2025-06-25 11:31:27.727601', false, NULL, 3.00, NULL, 0, 2, 'Bob', '555-1002', 'bob.smith@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 2);
INSERT INTO public.user_task VALUES (3, 'tenant_demo_001', 'Distribute Flyers', 'Distribute flyers for Charity Run', 'COMPLETED', 'LOW', '2025-06-21 11:31:27.727601', true, '2025-06-22 11:31:27.727601', 2.00, 2.00, 100, 3, 'Carol', '555-1003', 'carol.williams@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 3);
INSERT INTO public.user_task VALUES (4, 'tenant_demo_001', 'Book Park', 'Book park for Family Picnic', 'PENDING', 'HIGH', '2025-06-27 11:31:27.727601', false, NULL, 1.00, NULL, 0, 4, 'David', '555-1004', 'david.brown@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 4);
INSERT INTO public.user_task VALUES (5, 'tenant_demo_001', 'Send Invites', 'Send invitations for VIP Dinner', 'PENDING', 'MEDIUM', '2025-06-23 11:31:27.727601', false, NULL, 1.50, NULL, 0, 5, 'Eve', '555-1005', 'eve.davis@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 5);
INSERT INTO public.user_task VALUES (6, 'tenant_demo_001', 'Setup Stage', 'Setup stage for Summer Fest', 'PENDING', 'HIGH', '2025-06-26 11:31:27.727601', false, NULL, 4.00, NULL, 0, 6, 'Frank', '555-1006', 'frank.miller@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 6);

--INSERT INTO public.event_discount_code VALUES (1, 1);
--INSERT INTO public.event_discount_code VALUES (2, 2);
--INSERT INTO public.event_discount_code VALUES (3, 3);
--INSERT INTO public.event_discount_code VALUES (4, 4);
--INSERT INTO public.event_discount_code VALUES (5, 5);
--INSERT INTO public.event_discount_code VALUES (6, 6);

INSERT INTO public.executive_committee_team_members (first_name,last_name,title,designation,bio,email,priority_order,profile_image_url,expertise,image_background,image_style,department,join_date,is_active,linkedin_url,twitter_url,website_url,created_at,updated_at) VALUES
	 ('Gain','Joseph','bnbnbbnb','','bnbnbbnb','giventauser@gmail.com',0,'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/tenantId/tenant_demo_001/executive-team-members/arun_sadasivan_1757093414753_3e098d44.jpeg',NULL,'','','',NULL,true,'','','','2025-09-05 13:30:12.146626-04','2025-09-05 13:30:12.146626-04'),
	 ('ddddddd','Joseph','nbnbnbnbnbbnb','','bvbvbvbv','giventauser@gmail.com',0,'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/tenantId/tenant_demo_001/executive-team-members/latha_krishnan_1757093444035_7cfd3510.jpeg',NULL,'','','',NULL,true,'','','','2025-09-05 13:30:43.745627-04','2025-09-05 13:30:43.745627-04'),
	 ('Manaoj','Joseph','nnnbnbbnbnbnbnbb','','','giventauser@gmail.com',0,'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/tenantId/tenant_demo_001/executive-team-members/Manoj_Kizhakkoot_1757093467818_a471c9c7.png',NULL,'','','',NULL,true,'','','','2025-09-05 13:31:07.135061-04','2025-09-05 13:31:07.135061-04');



INSERT INTO public.rel_event_details__discount_codes VALUES (1, 1);
INSERT INTO public.rel_event_details__discount_codes VALUES (2, 2);
INSERT INTO public.rel_event_details__discount_codes VALUES (3, 3);
INSERT INTO public.rel_event_details__discount_codes VALUES (4, 4);
INSERT INTO public.rel_event_details__discount_codes VALUES (5, 5);
INSERT INTO public.rel_event_details__discount_codes VALUES (6, 6);
INSERT INTO public.bulk_operation_log VALUES (1, 'tenant_demo_001', 'IMPORT', 'Import Users', 1, 100, 98, 1, 1, 'Imported users', NULL, 5000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (2, 'tenant_demo_001', 'EXPORT', 'Export Events', 2, 50, 50, 0, 0, 'Exported events', NULL, 2000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (3, 'tenant_demo_001', 'SYNC', 'Sync Calendar', 3, 20, 19, 1, 0, 'Synced calendar', '1 error', 1000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (4, 'tenant_demo_001', 'DELETE', 'Delete Old Data', 4, 10, 10, 0, 0, 'Deleted old data', NULL, 500, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (5, 'tenant_demo_001', 'UPDATE', 'Update Settings', 5, 5, 5, 0, 0, 'Updated settings', NULL, 100, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (6, 'tenant_demo_001', 'IMPORT', 'Import Events', 6, 60, 59, 1, 0, 'Imported events', '1 error', 3000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.databasechangelog VALUES ('1', 'admin', 'changelog1.sql', '2025-06-22 11:31:27.814868', 1, 'EXECUTED', 'abc123', 'Initial', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('2', 'admin', 'changelog2.sql', '2025-06-22 11:31:27.814868', 2, 'EXECUTED', 'def456', 'Add tables', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('3', 'admin', 'changelog3.sql', '2025-06-22 11:31:27.814868', 3, 'EXECUTED', 'ghi789', 'Add data', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('4', 'admin', 'changelog4.sql', '2025-06-22 11:31:27.814868', 4, 'EXECUTED', 'jkl012', 'Update schema', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('5', 'admin', 'changelog5.sql', '2025-06-22 11:31:27.814868', 5, 'EXECUTED', 'mno345', 'Patch', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('6', 'admin', 'changelog6.sql', '2025-06-22 11:31:27.814868', 6, 'EXECUTED', 'pqr678', 'Hotfix', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangeloglock VALUES (1, false, '2025-06-22 11:31:27.859976', 'admin1');
INSERT INTO public.databasechangeloglock VALUES (2, false, '2025-06-22 11:31:27.859976', 'admin2');
INSERT INTO public.databasechangeloglock VALUES (3, false, '2025-06-22 11:31:27.859976', 'admin3');
INSERT INTO public.databasechangeloglock VALUES (4, false, '2025-06-22 11:31:27.859976', 'admin4');
INSERT INTO public.databasechangeloglock VALUES (5, false, '2025-06-22 11:31:27.859976', 'admin5');
INSERT INTO public.databasechangeloglock VALUES (6, false, '2025-06-22 11:31:27.859976', 'admin6');


-- Event Management New Tables - Sample Insert Statements
-- Generated: January 2025
-- Purpose: Sample data for testing and development
-- Note: All backend development is complete - this is for reference only

-- =====================================================
-- DELETE STATEMENTS - CLEAR EXISTING DATA
-- =====================================================

-- Clear all data from new event management tables (in correct order due to foreign key constraints)
DELETE FROM public.event_sponsors_join;
DELETE FROM public.event_featured_performers;
DELETE FROM public.event_contacts;
DELETE FROM public.event_emails;
DELETE FROM public.event_program_directors;
DELETE FROM public.event_sponsors;

-- Note: Delete from join table first, then dependent tables, then parent tables
-- This ensures foreign key constraints are satisfied

-- =====================================================
-- SAMPLE DATA FOR EVENT FEATURED PERFORMERS
-- =====================================================

INSERT INTO public.event_featured_performers VALUES (
  1, 1, 'K.J. Yesudas', 'Yesudas', 'Vocalist',
  'Renowned Malayalam classical singer with over 50 years of experience in the music industry. Known for his melodious voice and classical renditions.',
  'Indian', '1940-01-10', 'yesudas@example.com', '+91-9847012345', 'https://yesudas.com',
  'https://s3.amazonaws.com/bucket/performers/1/portrait/yesudas_portrait.jpg',
  'https://s3.amazonaws.com/bucket/performers/1/performance/yesudas_performance.jpg',
  '["https://s3.amazonaws.com/bucket/performers/1/gallery/img1.jpg", "https://s3.amazonaws.com/bucket/performers/1/gallery/img2.jpg"]',
  45, 1, true, 'https://facebook.com/yesudas', 'https://twitter.com/yesudas', 'https://instagram.com/yesudas',
  'https://youtube.com/yesudas', 'https://linkedin.com/in/yesudas', 'https://tiktok.com/@yesudas',
  true, 100, '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_featured_performers VALUES (
  2, 1, 'Kalamandalam Gopi', 'Gopi Asan', 'Kathakali Performer',
  'Legendary Kathakali artist known for his exceptional performances and traditional Kerala dance form mastery.',
  'Indian', '1937-05-15', 'gopi@example.com', '+91-9847012346', 'https://gopiasan.com',
  'https://s3.amazonaws.com/bucket/performers/2/portrait/gopi_portrait.jpg',
  'https://s3.amazonaws.com/bucket/performers/2/performance/gopi_performance.jpg',
  '["https://s3.amazonaws.com/bucket/performers/2/gallery/img1.jpg"]',
  60, 2, false, 'https://facebook.com/gopiasan', NULL, 'https://instagram.com/gopiasan',
  'https://youtube.com/gopiasan', NULL, NULL,
  true, 90, '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_featured_performers VALUES (
  3, 2, 'Zakir Hussain', 'Zakir Hussain', 'Percussionist',
  'World-renowned tabla player and percussionist with international acclaim.',
  'Indian', '1951-03-09', 'zakir@example.com', '+91-9847012347', 'https://zakirhussain.com',
  'https://s3.amazonaws.com/bucket/performers/3/portrait/zakir_portrait.jpg',
  'https://s3.amazonaws.com/bucket/performers/3/performance/zakir_performance.jpg',
  '["https://s3.amazonaws.com/bucket/performers/3/gallery/img1.jpg", "https://s3.amazonaws.com/bucket/performers/3/gallery/img2.jpg", "https://s3.amazonaws.com/bucket/performers/3/gallery/img3.jpg"]',
  30, 3, false, 'https://facebook.com/zakirhussain', 'https://twitter.com/zakirhussain', 'https://instagram.com/zakirhussain',
  'https://youtube.com/zakirhussain', 'https://linkedin.com/in/zakirhussain', NULL,
  true, 80, '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

-- =====================================================
-- SAMPLE DATA FOR EVENT CONTACTS
-- =====================================================

INSERT INTO public.event_contacts VALUES (
  1, 1, 'Sarah Johnson', '+1-555-0101', 'sarah.johnson@example.com',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_contacts VALUES (
  2, 1, 'Michael Chen', '+1-555-0102', 'michael.chen@example.com',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_contacts VALUES (
  3, 2, 'Emily Rodriguez', '+1-555-0103', 'emily.rodriguez@example.com',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_contacts VALUES (
  4, 2, 'David Kim', '+1-555-0104', 'david.kim@example.com',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_contacts VALUES (
  5, 3, 'Lisa Wang', '+1-555-0105', 'lisa.wang@example.com',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

-- =====================================================
-- SAMPLE DATA FOR EVENT SPONSORS
-- =====================================================

INSERT INTO public.event_sponsors VALUES (
  1, 'Kerala Tourism Development Corporation', 'Title Sponsor', 'KTDC', 'Explore Gods Own Country',
  'Official tourism partner promoting Keralass rich cultural heritage and natural beauty.',
  'https://www.ktdc.com', 'contact@ktdc.com', '+91-471-2321132',
  'https://s3.amazonaws.com/bucket/sponsors/1/logo/ktdc_logo.png',
  'https://s3.amazonaws.com/bucket/sponsors/1/hero/ktdc_hero.jpg',
  'https://s3.amazonaws.com/bucket/sponsors/1/banner/ktdc_banner.jpg',
  true, 100, 'https://facebook.com/keralatourism', 'https://twitter.com/keralatourism',
  'https://linkedin.com/company/kerala-tourism', 'https://instagram.com/keralatourism',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors VALUES (
  2, 'Tata Consultancy Services', 'Platinum Sponsor', 'TCS', 'Building on Belief',
  'Leading IT services and consulting company supporting cultural events and community development.',
  'https://www.tcs.com', 'sponsorship@tcs.com', '+91-22-67789999',
  'https://s3.amazonaws.com/bucket/sponsors/2/logo/tcs_logo.png',
  'https://s3.amazonaws.com/bucket/sponsors/2/hero/tcs_hero.jpg',
  'https://s3.amazonaws.com/bucket/sponsors/2/banner/tcs_banner.jpg',
  true, 90, 'https://facebook.com/tcs', 'https://twitter.com/tcs',
  'https://linkedin.com/company/tcs', 'https://instagram.com/tcs',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors VALUES (
  3, 'Federal Bank', 'Gold Sponsor', 'Federal Bank', 'Your Perfect Banking Partner',
  'Premier private sector bank committed to supporting cultural and community events.',
  'https://www.federalbank.co.in', 'events@federalbank.co.in', '+91-484-2630606',
  'https://s3.amazonaws.com/bucket/sponsors/3/logo/federal_logo.png',
  'https://s3.amazonaws.com/bucket/sponsors/3/hero/federal_hero.jpg',
  'https://s3.amazonaws.com/bucket/sponsors/3/banner/federal_banner.jpg',
  true, 80, 'https://facebook.com/federalbank', 'https://twitter.com/federalbank',
  'https://linkedin.com/company/federal-bank', 'https://instagram.com/federalbank',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors VALUES (
  4, 'Kerala State Beverages Corporation', 'Silver Sponsor', 'KSBC', 'Quality in Every Drop',
  'Government corporation supporting cultural events and promoting responsible consumption.',
  'https://www.ksbc.kerala.gov.in', 'info@ksbc.kerala.gov.in', '+91-471-2321234',
  'https://s3.amazonaws.com/bucket/sponsors/4/logo/ksbc_logo.png',
  'https://s3.amazonaws.com/bucket/sponsors/4/hero/ksbc_hero.jpg',
  'https://s3.amazonaws.com/bucket/sponsors/4/banner/ksbc_banner.jpg',
  true, 70, 'https://facebook.com/ksbc', NULL,
  'https://linkedin.com/company/ksbc', 'https://instagram.com/ksbc',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors VALUES (
  5, 'Malayalam Manorama', 'Media Partner', 'Manorama', 'Truth Above All',
  'Leading Malayalam newspaper and media group promoting cultural events and community engagement.',
  'https://www.manoramaonline.com', 'events@manoramaonline.com', '+91-471-2518000',
  'https://s3.amazonaws.com/bucket/sponsors/5/logo/manorama_logo.png',
  'https://s3.amazonaws.com/bucket/sponsors/5/hero/manorama_hero.jpg',
  'https://s3.amazonaws.com/bucket/sponsors/5/banner/manorama_banner.jpg',
  true, 60, 'https://facebook.com/manoramaonline', 'https://twitter.com/manoramaonline',
  'https://linkedin.com/company/manorama', 'https://instagram.com/manoramaonline',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

-- =====================================================
-- SAMPLE DATA FOR EVENT SPONSORS JOIN (Many-to-Many)
-- =====================================================

INSERT INTO public.event_sponsors_join VALUES (
  1, 1, 1, '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors_join VALUES (
  2, 1, 2, '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors_join VALUES (
  3, 1, 3, '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors_join VALUES (
  4, 2, 2, '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors_join VALUES (
  5, 2, 4, '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors_join VALUES (
  6, 3, 1, '2025-01-10 10:00:00'
);

INSERT INTO public.event_sponsors_join VALUES (
  7, 3, 5, '2025-01-10 10:00:00'
);

-- =====================================================
-- SAMPLE DATA FOR EVENT EMAILS
-- =====================================================

INSERT INTO public.event_emails VALUES (
  1, 1, 'info@malayaleesfestival.com', '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_emails VALUES (
  2, 1, 'tickets@malayaleesfestival.com', '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_emails VALUES (
  3, 1, 'sponsorship@malayaleesfestival.com', '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_emails VALUES (
  4, 2, 'contact@culturalnight.com', '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_emails VALUES (
  5, 2, 'media@culturalnight.com', '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_emails VALUES (
  6, 3, 'admin@musicconcert.com', '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

-- =====================================================
-- SAMPLE DATA FOR EVENT PROGRAM DIRECTORS
-- =====================================================

INSERT INTO public.event_program_directors VALUES (
  1, 1, 'Dr. Rajesh Kumar', 'https://s3.amazonaws.com/bucket/directors/1/photo/rajesh_photo.jpg',
  'Dr. Rajesh Kumar is a distinguished cultural director with over 25 years of experience in organizing large-scale cultural events. He has been instrumental in promoting Malayalam arts and culture across the globe.',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_program_directors VALUES (
  2, 1, 'Ms. Priya Menon', 'https://s3.amazonaws.com/bucket/directors/2/photo/priya_photo.jpg',
  'Ms. Priya Menon is an accomplished event director specializing in traditional Kerala cultural programs. She has successfully organized numerous festivals and cultural events with a focus on authentic representation of Malayalam traditions.',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_program_directors VALUES (
  3, 2, 'Mr. Suresh Nair', 'https://s3.amazonaws.com/bucket/directors/3/photo/suresh_photo.jpg',
  'Mr. Suresh Nair brings extensive experience in cultural event management and has been associated with several prestigious cultural organizations. His expertise lies in coordinating diverse artistic performances and managing large audiences.',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

INSERT INTO public.event_program_directors VALUES (
  4, 3, 'Dr. Anitha Pillai', 'https://s3.amazonaws.com/bucket/directors/4/photo/anitha_photo.jpg',
  'Dr. Anitha Pillai is a renowned music director and cultural consultant with deep knowledge of classical and contemporary music. She has curated numerous musical events and has been recognized for her contributions to promoting Indian classical music.',
  '2025-01-10 10:00:00', '2025-01-10 10:00:00'
);

-- =====================================================
-- NOTES FOR FRONTEND DEVELOPERS
-- =====================================================

/*
IMPORTANT NOTES FOR FRONTEND INTEGRATION:

1. BACKEND STATUS: All backend development is complete and ready for frontend integration
2. DATABASE: All tables are created with proper relationships and constraints
3. API ENDPOINTS: 50+ REST endpoints are implemented and documented
4. AUTHENTICATION: JWT-based security is configured
5. IMAGE UPLOAD: AWS S3 integration with dynamic path construction is ready
6. VALIDATION: Comprehensive input validation and error handling is implemented

FRONTEND DEVELOPERS ONLY NEED TO:
- Create UI components for entity management
- Integrate with existing REST API endpoints
- Implement image upload UI using documented endpoints
- Handle frontend validation to complement backend validation
- Design user experience workflows

NO BACKEND DEVELOPMENT, DATABASE SETUP, OR INFRASTRUCTURE CONFIGURATION IS REQUIRED.

SAMPLE DATA REFERENCE:
- Event IDs 1, 2, 3 correspond to existing events in the event_details table
- All image URLs are placeholder S3 URLs - backend handles actual URL generation
- Phone numbers follow international format
- Email addresses are example domains
- All timestamps are in ISO format
- Priority rankings are used for sorting and display order
- Boolean flags control visibility and active status

RELATIONSHIPS:
- EventFeaturedPerformers → EventDetails (Many-to-One)
- EventContacts → EventDetails (Many-to-One)
- EventEmails → EventDetails (Many-to-One)
- EventProgramDirectors → EventDetails (Many-to-One)
- EventSponsorsJoin → EventDetails (Many-to-One)
- EventSponsorsJoin → EventSponsors (Many-to-One)
- EventDetails ↔ EventSponsors (Many-to-Many via EventSponsorsJoin)

API ENDPOINTS AVAILABLE:
- GET /api/event-featured-performers
- POST /api/event-featured-performers
- GET /api/event-contacts
- POST /api/event-contacts
- GET /api/event-sponsors
- POST /api/event-sponsors
- GET /api/event-sponsors-join
- POST /api/event-sponsors-join
- GET /api/event-emails
- POST /api/event-emails
- GET /api/event-program-directors
- POST /api/event-program-directors

IMAGE UPLOAD ENDPOINTS:
- POST /api/event-medias/upload/featured-performer/{entityId}/{imageType}
- POST /api/event-medias/upload/sponsor/{entityId}/{imageType}
- POST /api/event-medias/upload/contact/{entityId}/photo
- POST /api/event-medias/upload/program-director/{entityId}/photo
- POST /api/event-medias/upload (enhanced general endpoint)
*/
