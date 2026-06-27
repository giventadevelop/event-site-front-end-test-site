INSERT INTO public.bulk_operation_log VALUES (1, 'tenant_demo_001', 'IMPORT', 'Import Users', 1, 100, 98, 1, 1, 'Imported users', NULL, 5000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (2, 'tenant_demo_001', 'EXPORT', 'Export Events', 2, 50, 50, 0, 0, 'Exported events', NULL, 2000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (3, 'tenant_demo_001', 'SYNC', 'Sync Calendar', 3, 20, 19, 1, 0, 'Synced calendar', '1 error', 1000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (4, 'tenant_demo_001', 'DELETE', 'Delete Old Data', 4, 10, 10, 0, 0, 'Deleted old data', NULL, 500, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (5, 'tenant_demo_001', 'UPDATE', 'Update Settings', 5, 5, 5, 0, 0, 'Updated settings', NULL, 100, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');
INSERT INTO public.bulk_operation_log VALUES (6, 'tenant_demo_001', 'IMPORT', 'Import Events', 6, 60, 59, 1, 0, 'Imported events', '1 error', 3000, '2025-06-22 11:31:27.770938', '2025-06-22 11:31:27.770938');


--
-- TOC entry 3958 (class 0 OID 189005)
-- Dependencies: 256
-- Data for Name: communication_campaign; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3922 (class 0 OID 188344)
-- Dependencies: 220
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.databasechangelog VALUES ('1', 'admin', 'changelog1.sql', '2025-06-22 11:31:27.814868', 1, 'EXECUTED', 'abc123', 'Initial', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('2', 'admin', 'changelog2.sql', '2025-06-22 11:31:27.814868', 2, 'EXECUTED', 'def456', 'Add tables', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('3', 'admin', 'changelog3.sql', '2025-06-22 11:31:27.814868', 3, 'EXECUTED', 'ghi789', 'Add data', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('4', 'admin', 'changelog4.sql', '2025-06-22 11:31:27.814868', 4, 'EXECUTED', 'jkl012', 'Update schema', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('5', 'admin', 'changelog5.sql', '2025-06-22 11:31:27.814868', 5, 'EXECUTED', 'mno345', 'Patch', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');
INSERT INTO public.databasechangelog VALUES ('6', 'admin', 'changelog6.sql', '2025-06-22 11:31:27.814868', 6, 'EXECUTED', 'pqr678', 'Hotfix', NULL, NULL, '3.8.0', NULL, NULL, 'dep1');


--
-- TOC entry 3923 (class 0 OID 188349)
-- Dependencies: 221
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.databasechangeloglock VALUES (1, false, '2025-06-22 11:31:27.859976', 'admin1');
INSERT INTO public.databasechangeloglock VALUES (2, false, '2025-06-22 11:31:27.859976', 'admin2');
INSERT INTO public.databasechangeloglock VALUES (3, false, '2025-06-22 11:31:27.859976', 'admin3');
INSERT INTO public.databasechangeloglock VALUES (4, false, '2025-06-22 11:31:27.859976', 'admin4');
INSERT INTO public.databasechangeloglock VALUES (5, false, '2025-06-22 11:31:27.859976', 'admin5');
INSERT INTO public.databasechangeloglock VALUES (6, false, '2025-06-22 11:31:27.859976', 'admin6');


--
-- TOC entry 3954 (class 0 OID 188717)
-- Dependencies: 252
-- Data for Name: discount_code; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.discount_code VALUES (2, 'VIP50', '50% off for VIPs', 'PERCENT', 50.00, 10, 2, '2025-04-01 00:00:00', '2025-08-01 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 2, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (4, 'EARLYBIRD', 'Early bird discount', 'PERCENT', 20.00, 200, 20, '2025-01-01 00:00:00', '2025-04-10 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 4, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (5, 'SUMMERFEST', 'Summer Fest special', 'PERCENT', 15.00, 150, 15, '2025-07-01 00:00:00', '2025-08-16 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 5, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (6, 'FAMILY5', 'Family Picnic 5% off', 'PERCENT', 5.00, 50, 3, '2025-07-01 00:00:00', '2025-07-21 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 6, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (3, 'FREERUN', 'Free entry for Charity Run', 'FIXED_AMOUNT', 100.00, 50, 10, '2025-05-01 00:00:00', '2025-06-02 00:00:00', true, '2025-06-22 11:31:27.135034', '2025-06-22 11:31:27.135034', 3, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (4851, 'SPRING12', 'xcxcxc', 'FIXED_AMOUNT', 4.00, 100, NULL, NULL, NULL, true, '2025-06-23 05:29:02.585', '2025-06-23 05:29:02.585', 1, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (1, 'SPRING10', 'string', 'PERCENTAGE', 5.00, 0, 0, '2025-07-06 21:15:01.9', '2025-07-06 21:15:01.9', true, '2025-07-06 21:15:01.9', '2025-07-06 21:15:01.9', 1, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (6651, 'fdfdfd', 'dfdfdfd', 'PERCENTAGE', 8.00, 100, NULL, NULL, NULL, true, '2025-07-06 21:48:04.462', '2025-07-06 21:48:16.234', 1, 'tenant_demo_001');
INSERT INTO public.discount_code VALUES (6652, 'vbvbvb', 'vbvvb', 'PERCENTAGE', 10.00, 100, NULL, NULL, NULL, true, '2025-07-07 03:44:24.207', '2025-07-07 04:14:02.01', 1, 'tenant_demo_001');


--
-- TOC entry 3959 (class 0 OID 189018)
-- Dependencies: 257
-- Data for Name: email_log; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3930 (class 0 OID 188414)
-- Dependencies: 228
-- Data for Name: event_admin; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_admin VALUES (1, 'tenant_demo_001', 'ADMIN', '{CREATE_EVENT,EDIT_EVENT}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 2, 1);
INSERT INTO public.event_admin VALUES (2, 'tenant_demo_001', 'SUPER_ADMIN', '{ALL}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 5, 2);
INSERT INTO public.event_admin VALUES (3, 'tenant_demo_001', 'ORGANIZER', '{MANAGE_ATTENDEES}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 4, 2);
INSERT INTO public.event_admin VALUES (4, 'tenant_demo_001', 'VOLUNTEER', '{ASSIST}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 3, 1);
INSERT INTO public.event_admin VALUES (5, 'tenant_demo_001', 'MEMBER', '{VIEW}', true, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 1, 2);
INSERT INTO public.event_admin VALUES (6, 'tenant_demo_001', 'ADMIN', '{CREATE_EVENT,EDIT_EVENT}', false, '2025-06-22 11:31:26.430806', '2025-06-22 11:31:26.430806', 6, 1);


--
-- TOC entry 3931 (class 0 OID 188423)
-- Dependencies: 229
-- Data for Name: event_admin_audit_log; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_admin_audit_log VALUES (1, 'tenant_demo_001', 'UPDATE', 'event_details', '1', '{"field": "title"}', '{"title": "Old"}', '{"title": "New"}', '192.168.1.1', 'Mozilla/5.0', 'sess1', '2025-06-22 11:31:26.48504', 1);
INSERT INTO public.event_admin_audit_log VALUES (2, 'tenant_demo_001', 'INSERT', 'event_details', '2', '{"field": "caption"}', NULL, '{"caption": "Added"}', '192.168.1.2', 'Mozilla/5.0', 'sess2', '2025-06-22 11:31:26.48504', 2);
INSERT INTO public.event_admin_audit_log VALUES (3, 'tenant_demo_001', 'DELETE', 'event_details', '3', NULL, '{"id": 3}', NULL, '192.168.1.3', 'Mozilla/5.0', 'sess3', '2025-06-22 11:31:26.48504', 3);
INSERT INTO public.event_admin_audit_log VALUES (4, 'tenant_demo_001', 'UPDATE', 'event_admin', '4', '{"field": "role"}', '{"role": "MEMBER"}', '{"role": "ADMIN"}', '192.168.1.4', 'Mozilla/5.0', 'sess4', '2025-06-22 11:31:26.48504', 4);
INSERT INTO public.event_admin_audit_log VALUES (5, 'tenant_demo_001', 'INSERT', 'event_admin', '5', '{"field": "permissions"}', NULL, '{"permissions": ["ALL"]}', '192.168.1.5', 'Mozilla/5.0', 'sess5', '2025-06-22 11:31:26.48504', 5);
INSERT INTO public.event_admin_audit_log VALUES (6, 'tenant_demo_001', 'DELETE', 'event_admin', '6', NULL, '{"id": 6}', NULL, '192.168.1.6', 'Mozilla/5.0', 'sess6', '2025-06-22 11:31:26.48504', 6);


--
-- TOC entry 3932 (class 0 OID 188430)
-- Dependencies: 230
-- Data for Name: event_attendee; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_attendee VALUES (4351, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 19:50:56.581', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 19:50:56.581', '2025-07-03 19:50:56.581', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4503, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:08:31.398', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:08:31.398', '2025-07-03 20:08:31.398', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4501, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:08:19.518', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:08:19.518', '2025-07-03 20:08:19.518', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4504, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:08:19.535', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:08:19.535', '2025-07-03 20:08:19.535', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4502, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:08:31.331', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:08:31.331', '2025-07-03 20:08:31.331', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4651, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:37:29.078', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:37:29.078', '2025-07-03 20:37:29.078', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4652, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:37:21.809', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:37:21.809', '2025-07-03 20:37:21.809', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4653, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:37:19.957', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:37:19.957', '2025-07-03 20:37:19.957', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4654, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:37:19.978', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:37:19.978', '2025-07-03 20:37:19.978', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4655, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:37:31.198', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:37:31.198', '2025-07-03 20:37:31.198', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4656, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-03 20:37:58.245', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-03 20:37:58.245', '2025-07-03 20:37:58.245', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4801, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:31:01.98', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:31:01.98', '2025-07-04 04:31:01.98', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4951, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:36:02.907', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:36:02.907', '2025-07-04 04:36:02.907', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (4952, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:37:44.416', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:37:44.416', '2025-07-04 04:37:44.416', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5101, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:47:39.878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:47:39.878', '2025-07-04 04:47:39.878', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5102, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:49:49.457', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:49:49.457', '2025-07-04 04:49:49.457', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5103, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:49:53.74', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:49:53.74', '2025-07-04 04:49:53.74', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5104, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:49:53.733', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:49:53.733', '2025-07-04 04:49:53.733', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5105, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:49:49.564', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:49:49.564', '2025-07-04 04:49:49.564', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5107, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:57:11.568', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:57:11.568', '2025-07-04 04:57:11.568', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5108, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:57:11.325', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:57:11.325', '2025-07-04 04:57:11.325', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5109, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:57:11.624', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:57:11.624', '2025-07-04 04:57:11.624', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5106, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 04:57:11.337', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 04:57:11.337', '2025-07-04 04:57:11.337', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5251, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-04 05:04:53.61', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-04 05:04:53.61', '2025-07-04 05:04:53.61', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5801, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:16:25.174', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:16:25.174', '2025-07-05 03:16:25.174', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5802, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:16:25.184', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:16:25.184', '2025-07-05 03:16:25.184', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5803, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:17:29.237', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:17:29.237', '2025-07-05 03:17:29.237', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5804, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:17:59.95', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:17:59.95', '2025-07-05 03:17:59.95', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5805, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:33:41.152', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:33:41.152', '2025-07-05 03:33:41.152', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5808, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:33:41.119', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:33:41.119', '2025-07-05 03:33:41.119', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5806, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:33:41.11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:33:41.11', '2025-07-05 03:33:41.11', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5807, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:33:41.137', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:33:41.137', '2025-07-05 03:33:41.137', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5809, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:34:58.614', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:34:58.614', '2025-07-05 03:34:58.614', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5810, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:34:58.638', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:34:58.638', '2025-07-05 03:34:58.638', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5811, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:34:58.585', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:34:58.585', '2025-07-05 03:34:58.585', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5812, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:34:58.606', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:34:58.606', '2025-07-05 03:34:58.606', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5813, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:41:16.633', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:41:16.633', '2025-07-05 03:41:16.633', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5814, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:41:16.43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:41:16.43', '2025-07-05 03:41:16.43', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5815, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:41:16.456', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:41:16.456', '2025-07-05 03:41:16.456', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5816, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:41:16.387', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:41:16.387', '2025-07-05 03:41:16.387', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5817, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:42:55.293', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:42:55.293', '2025-07-05 03:42:55.293', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5818, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:42:55.399', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:42:55.399', '2025-07-05 03:42:55.399', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5819, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:42:55.352', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:42:55.352', '2025-07-05 03:42:55.352', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5820, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:42:55.392', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:42:55.392', '2025-07-05 03:42:55.392', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5821, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:52:29.438', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:52:29.438', '2025-07-05 03:52:29.438', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5822, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:52:29.487', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:52:29.487', '2025-07-05 03:52:29.487', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5823, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:52:25.204', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:52:25.204', '2025-07-05 03:52:25.204', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5824, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:52:29.46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:52:29.46', '2025-07-05 03:52:29.46', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5825, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:55:22.452', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:55:22.452', '2025-07-05 03:55:22.452', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5826, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:55:22.412', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:55:22.412', '2025-07-05 03:55:22.412', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5828, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:55:22.436', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:55:22.436', '2025-07-05 03:55:22.436', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5827, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:55:22.472', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:55:22.472', '2025-07-05 03:55:22.472', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5829, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:59:57.56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:59:57.56', '2025-07-05 03:59:57.56', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5830, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:59:57.553', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:59:57.553', '2025-07-05 03:59:57.553', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5831, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:59:57.545', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:59:57.545', '2025-07-05 03:59:57.545', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5832, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 03:59:57.571', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 03:59:57.571', '2025-07-05 03:59:57.571', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5834, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:13:48.5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:13:48.5', '2025-07-05 04:13:48.5', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5833, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:13:48.515', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:13:48.515', '2025-07-05 04:13:48.515', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5835, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:13:48.524', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:13:48.524', '2025-07-05 04:13:48.524', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5836, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:20:43.116', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:20:43.116', '2025-07-05 04:20:43.116', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5837, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:20:43.132', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:20:43.132', '2025-07-05 04:20:43.132', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5838, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:20:42.821', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:20:42.821', '2025-07-05 04:20:42.821', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5839, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:26:16.436', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:26:16.436', '2025-07-05 04:26:16.436', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5840, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:26:38.904', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:26:38.904', '2025-07-05 04:26:38.904', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5841, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:26:59.295', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:26:59.295', '2025-07-05 04:26:59.295', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5842, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:27:16.578', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:27:16.578', '2025-07-05 04:27:16.578', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5843, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:28:41.822', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:28:41.822', '2025-07-05 04:28:41.822', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5845, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:28:41.793', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:28:41.793', '2025-07-05 04:28:41.793', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5844, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:28:41.81', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:28:41.81', '2025-07-05 04:28:41.81', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5846, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:28:41.816', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:28:41.816', '2025-07-05 04:28:41.816', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5847, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:31:19.646', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:31:19.646', '2025-07-05 04:31:19.646', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5848, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:31:19.634', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:31:19.634', '2025-07-05 04:31:19.634', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5849, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:31:19.627', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:31:19.627', '2025-07-05 04:31:19.627', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5850, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:31:19.621', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:31:19.621', '2025-07-05 04:31:19.621', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5951, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:38:47.205', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:38:47.205', '2025-07-05 04:38:47.205', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5952, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:38:47.256', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:38:47.256', '2025-07-05 04:38:47.256', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5953, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:38:36.583', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:38:36.583', '2025-07-05 04:38:36.583', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5954, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:38:58.16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:38:58.16', '2025-07-05 04:38:58.16', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5955, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:40:40.415', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:40:40.415', '2025-07-05 04:40:40.415', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5956, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:40:40.442', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:40:40.442', '2025-07-05 04:40:40.442', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5957, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:40:40.461', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:40:40.461', '2025-07-05 04:40:40.461', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5958, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:40:40.495', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:40:40.495', '2025-07-05 04:40:40.495', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5959, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:41:54.851', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:41:54.851', '2025-07-05 04:41:54.851', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5960, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:41:54.707', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:41:54.707', '2025-07-05 04:41:54.707', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5961, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:41:54.816', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:41:54.816', '2025-07-05 04:41:54.816', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5962, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:41:54.829', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:41:54.829', '2025-07-05 04:41:54.829', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5964, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:48:02.958', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:48:02.958', '2025-07-05 04:48:02.958', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5965, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:48:02.985', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:48:02.985', '2025-07-05 04:48:02.985', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5963, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:48:02.945', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:48:02.945', '2025-07-05 04:48:02.945', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5966, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:48:02.969', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:48:02.969', '2025-07-05 04:48:02.969', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5968, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:55:56.827', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:55:56.827', '2025-07-05 04:55:56.827', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5969, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:55:56.856', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:55:56.856', '2025-07-05 04:55:56.856', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5971, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:55:56.844', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:55:56.844', '2025-07-05 04:55:56.844', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5967, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:55:57.138', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:55:57.138', '2025-07-05 04:55:57.138', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5970, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:55:57.23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:55:57.23', '2025-07-05 04:55:57.23', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5972, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:56:13.085', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:56:13.085', '2025-07-05 04:56:13.085', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5974, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:56:13.073', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:56:13.073', '2025-07-05 04:56:13.073', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5973, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:56:13.08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:56:13.08', '2025-07-05 04:56:13.08', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5975, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 04:59:01.569', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 04:59:01.569', '2025-07-05 04:59:01.569', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5976, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:04:49.435', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:04:49.435', '2025-07-05 05:04:49.435', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5977, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:05:45.437', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:05:45.437', '2025-07-05 05:05:45.437', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5978, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:09:28.596', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:09:28.596', '2025-07-05 05:09:28.596', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5979, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:11:16.998', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:11:16.998', '2025-07-05 05:11:16.998', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5980, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:14:16.182', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:14:16.182', '2025-07-05 05:14:16.182', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5981, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:14:47.322', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:14:47.322', '2025-07-05 05:14:47.322', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5982, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:15:51.22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:15:51.22', '2025-07-05 05:15:51.22', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5983, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:16:07.824', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:16:07.824', '2025-07-05 05:16:07.824', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5984, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:16:42.735', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:16:42.735', '2025-07-05 05:16:42.735', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5985, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 05:16:42.674', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 05:16:42.674', '2025-07-05 05:16:42.674', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5986, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:26:30.798', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:26:30.798', '2025-07-05 09:26:30.798', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5987, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:39:07.217', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:39:07.217', '2025-07-05 09:39:07.217', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5988, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:41:28.18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:41:28.18', '2025-07-05 09:41:28.18', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5989, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:41:20.142', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:41:20.142', '2025-07-05 09:41:20.142', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5990, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:48:30.103', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:48:30.103', '2025-07-05 09:48:30.103', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5993, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:55:03.727', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:55:03.727', '2025-07-05 09:55:03.727', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5991, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:48:29.844', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:48:29.844', '2025-07-05 09:48:29.844', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5992, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 09:54:56.694', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 09:54:56.694', '2025-07-05 09:54:56.694', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5995, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 10:53:36.118', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 10:53:36.118', '2025-07-05 10:53:36.118', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5994, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 10:53:20.099', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 10:53:20.099', '2025-07-05 10:53:20.099', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5996, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 10:53:20.129', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 10:53:20.129', '2025-07-05 10:53:20.129', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5997, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:09:26.534', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:09:26.534', '2025-07-05 11:09:26.534', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5998, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:14:36.971', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:14:36.971', '2025-07-05 11:14:36.971', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (5999, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:19:31.194', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:19:31.194', '2025-07-05 11:19:31.194', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6000, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:19:38.294', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:19:38.294', '2025-07-05 11:19:38.294', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6101, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:22:10.715', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:22:10.715', '2025-07-05 11:22:10.715', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6102, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:27:45.446', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:27:45.446', '2025-07-05 11:27:45.446', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6103, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:27:45.427', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:27:45.427', '2025-07-05 11:27:45.427', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6104, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:30:28.097', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:30:28.097', '2025-07-05 11:30:28.097', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6105, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:40:49.632', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:40:49.632', '2025-07-05 11:40:49.632', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6108, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:47:51.511', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:47:51.511', '2025-07-05 11:47:51.511', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6107, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:47:56.445', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:47:56.445', '2025-07-05 11:47:56.445', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6106, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:47:55.177', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:47:55.177', '2025-07-05 11:47:55.177', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6109, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:47:52.581', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:47:52.581', '2025-07-05 11:47:52.581', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6110, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:50:02.842', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:50:02.842', '2025-07-05 11:50:02.842', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6111, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:59:32.587', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:59:32.587', '2025-07-05 11:59:32.587', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6112, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:59:32.559', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:59:32.559', '2025-07-05 11:59:32.559', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6113, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:59:32.611', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:59:32.611', '2025-07-05 11:59:32.611', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6114, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 11:59:32.57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 11:59:32.57', '2025-07-05 11:59:32.57', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6115, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 12:02:15.695', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 12:02:15.695', '2025-07-05 12:02:15.695', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6116, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 12:02:15.727', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 12:02:15.727', '2025-07-05 12:02:15.727', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6117, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 12:02:15.743', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 12:02:15.743', '2025-07-05 12:02:15.743', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6118, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 12:03:20.239', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 12:03:20.239', '2025-07-05 12:03:20.239', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);
INSERT INTO public.event_attendee VALUES (6119, 'tenant_demo_001', 1, NULL, 'REGISTERED', '2025-07-05 12:03:19.997', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-05 12:03:19.997', '2025-07-05 12:03:19.997', 'Gain Joseph', '', 'giventauser@gmail.com', '', NULL);


--
-- TOC entry 3933 (class 0 OID 188459)
-- Dependencies: 231
-- Data for Name: event_attendee_guest; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3934 (class 0 OID 188473)
-- Dependencies: 232
-- Data for Name: event_calendar_entry; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3924 (class 0 OID 188352)
-- Dependencies: 222
-- Data for Name: event_details; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_details VALUES (2, 'tenant_demo_001', 'Charity Run', '5K Charity Run', 'A 5K run to raise funds for charity.', '2025-09-01', '2025-09-01', '07:00 PM', '10:00 PM', 'America/New_York', 'City Park', NULL, 300, 'DONATION_BASED', true, 0, false, false, false, '2025-08-28 23:59:00', '2025-08-28 23:59:00', NULL, NULL, false, true, false, NULL, 4651, 1, '2025-06-14 23:13:02.565996', '2025-06-14 23:13:02.565996', false, false, false);
INSERT INTO public.event_details VALUES (3, 'tenant_demo_001', 'Family Picnic', 'Community Family Picnic', 'A fun picnic for families in the community.', '2025-09-10', '2025-09-10', '11:00', '16:00', 'America/New_York', 'Lakeside Park', NULL, 150, 'FREE', true, 4, true, false, false, '2025-09-05 23:59:00', '2025-09-05 23:59:00', NULL, NULL, false, true, false, NULL, 4651, 1, '2025-06-14 23:13:02.565996', '2025-06-14 23:13:02.565996', false, false, false);
INSERT INTO public.event_details VALUES (4, 'tenant_demo_001', 'VIP Dinner', 'Exclusive VIP Dinner', 'A dinner event for VIP guests.', '2025-09-15', '2025-09-15', '19:00', '22:00', 'America/New_York', 'Skyline Restaurant', NULL, 50, 'INVITATION_ONLY', true, 0, false, true, false, '2025-09-12 23:59:00', '2025-09-12 23:59:00', NULL, NULL, false, true, false, NULL, 4651, 1, '2025-06-14 23:13:02.565996', '2025-06-14 23:13:02.565996', false, false, false);
INSERT INTO public.event_details VALUES (5, 'tenant_demo_001', 'Summer Fest', 'Summer Festival', 'A festival with games, food, and music.', '2025-09-20', '2025-09-20', '10:00', '20:00', 'America/New_York', 'Downtown Plaza', NULL, 400, 'TICKETED', true, 3, true, true, true, '2025-09-12 23:59:00', '2025-09-12 23:59:00', NULL, NULL, false, true, false, NULL, 4651, 1, '2025-06-14 23:13:02.565996', '2025-06-14 23:13:02.565996', false, false, false);
INSERT INTO public.event_details VALUES (1, 'tenant_demo_001', 'Tech Conference', '2025 Tech Innovations', 'A conference on the latest in technology.', '2025-08-07', '2025-08-07', '09:00 AM', '07:00 PM', 'America/Los_Angeles', 'Convention Center', NULL, 500, 'ticketed', true, 3, true, true, false, '2025-08-12 23:59:00', '2025-08-12 23:59:00', NULL, NULL, false, true, false, NULL, 4651, 2, '2025-06-14 23:13:02.565996', '2025-07-06 23:54:36.366237', false, false, false);
INSERT INTO public.event_details VALUES (6, 'tenant_demo_001', 'Spring Gala', 'Annual Spring Gala', 'A celebration of spring with music and food.', '2025-08-10', '2025-08-10', '18:00', '23:00', 'America/New_York', 'Grand Hall', NULL, 200, 'TICKETED', true, 2, true, false, true, '2025-08-05 23:59:00', '2025-08-05 23:59:00', NULL, NULL, false, true, false, NULL, 4651, 3, '2025-06-14 23:13:02.565996', '2025-07-07 00:22:35.874333', true, false, false);


--
-- TOC entry 3918 (class 0 OID 122038)
-- Dependencies: 216
-- Data for Name: event_discount_code; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_discount_code VALUES (1, 1);
INSERT INTO public.event_discount_code VALUES (2, 2);
INSERT INTO public.event_discount_code VALUES (3, 3);
INSERT INTO public.event_discount_code VALUES (4, 4);
INSERT INTO public.event_discount_code VALUES (5, 5);
INSERT INTO public.event_discount_code VALUES (6, 6);


--
-- TOC entry 3925 (class 0 OID 188378)
-- Dependencies: 223
-- Data for Name: event_guest_pricing; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_guest_pricing VALUES (1, 'tenant_demo_001', 1, 'ADULT', 50.00, true, '2025-03-01', '2025-04-10', 'Adult pricing for Spring Gala', 2, 'Standard', 40.00, '2025-03-15 23:59:00', 5, 10.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (2, 'tenant_demo_001', 1, 'CHILD', 25.00, true, '2025-03-01', '2025-04-10', 'Child pricing for Spring Gala', 2, 'Standard', 20.00, '2025-03-15 23:59:00', 5, 10.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (3, 'tenant_demo_001', 2, 'ADULT', 100.00, true, '2025-04-01', '2025-05-15', 'Adult pricing for Tech Conference', 1, 'Premium', 80.00, '2025-04-20 23:59:00', 3, 15.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (4, 'tenant_demo_001', 2, 'TEEN', 60.00, true, '2025-04-01', '2025-05-15', 'Teen pricing for Tech Conference', 1, 'Premium', 50.00, '2025-04-20 23:59:00', 3, 15.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (5, 'tenant_demo_001', 3, 'ADULT', 0.00, true, '2025-05-01', '2025-06-01', 'Free for Charity Run', NULL, 'Free', NULL, NULL, NULL, NULL, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');
INSERT INTO public.event_guest_pricing VALUES (6, 'tenant_demo_001', 4, 'ADULT', 10.00, true, '2025-07-01', '2025-07-20', 'Adult pricing for Family Picnic', 4, 'Standard', 8.00, '2025-07-10 23:59:00', 2, 5.00, '2025-06-22 11:31:26.374558', '2025-06-22 11:31:26.374558');


--
-- TOC entry 3926 (class 0 OID 188393)
-- Dependencies: 224
-- Data for Name: event_live_update; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_live_update VALUES (1, 1, 'INFO', 'Welcome to Spring Gala!', NULL, NULL, NULL, NULL, 1, true, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (2, 2, 'ALERT', 'Tech Conference Keynote at 10am', NULL, NULL, NULL, NULL, 2, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (3, 3, 'INFO', 'Charity Run starts at 7am', NULL, NULL, NULL, NULL, 3, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (4, 4, 'INFO', 'Family Picnic games at noon', NULL, NULL, NULL, NULL, 4, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (5, 5, 'ALERT', 'VIP Dinner seating at 7pm', NULL, NULL, NULL, NULL, 5, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');
INSERT INTO public.event_live_update VALUES (6, 6, 'INFO', 'Summer Fest parade at 5pm', NULL, NULL, NULL, NULL, 6, false, '2025-06-22 11:31:26.727266', '2025-06-22 11:31:26.727266');


--
-- TOC entry 3927 (class 0 OID 188404)
-- Dependencies: 225
-- Data for Name: event_live_update_attachment; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_live_update_attachment VALUES (1, 1, 'IMAGE', 'https://example.com/image1.jpg', 1, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (2, 2, 'VIDEO', 'https://example.com/video2.mp4', 2, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (3, 3, 'IMAGE', 'https://example.com/image3.jpg', 3, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (4, 4, 'IMAGE', 'https://example.com/image4.jpg', 4, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (5, 5, 'VIDEO', 'https://example.com/video5.mp4', 5, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');
INSERT INTO public.event_live_update_attachment VALUES (6, 6, 'IMAGE', 'https://example.com/image6.jpg', 6, NULL, '2025-06-22 11:31:26.770391', '2025-06-22 11:31:26.770391');


--
-- TOC entry 3935 (class 0 OID 188482)
-- Dependencies: 233
-- Data for Name: event_media; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_media VALUES (4050, 'tenant_demo_001', 'birthday_party.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/birthday_party_1750026379828_bacbecdc.jfif', NULL, 'image/jpeg', NULL, 17757, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/birthday_party_1750026379828_bacbecdc.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=a8d7ab16523489684d14fdd1e5bfa063183664cb6788e5d0a54bc85142721fbc', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:20.4035', '2025-06-15 22:26:20.4035', 1, 1);
INSERT INTO public.event_media VALUES (4100, 'tenant_demo_001', 'street_fair.jfif', '115941', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/street_fair_1750026381257_f70e40cf.jfif', NULL, 'image/jpeg', NULL, 10551, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/street_fair_1750026381257_f70e40cf.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=7b739490bda78d4127fbeb267d77856a11cc59a83b24e90c666a76783393e15d', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:21.363353', '2025-06-15 22:26:21.363353', 1, 1);
INSERT INTO public.event_media VALUES (4150, 'tenant_demo_001', 'night_party.jfif', '115942', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/night_party_1750026381113_69263496.jfif', NULL, 'image/jpeg', NULL, 8851, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/night_party_1750026381113_69263496.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=976a14bab785e95765850160c250285fa2408035afc3b3eb7354e497769c5ffa', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:21.256044', '2025-06-15 22:26:21.256044', 1, 1);
INSERT INTO public.event_media VALUES (4200, 'tenant_demo_001', 'music_fest.jfif', '115943', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/music_fest_1750026380991_16eac442.jfif', NULL, 'image/jpeg', NULL, 13369, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/music_fest_1750026380991_16eac442.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222621Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=fe05c34013a10da60e63df0cc7bcf34a493ff96dbd9a732408bebcff759afe96', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:21.112602', '2025-06-15 22:26:21.112602', 1, 1);
INSERT INTO public.event_media VALUES (4250, 'tenant_demo_001', 'mens_party.jfif', '115944', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/mens_party_1750026380857_14c08f34.jfif', NULL, 'image/jpeg', NULL, 11908, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/mens_party_1750026380857_14c08f34.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=9b8f1373e82b4c9ef900736e3955434b27150e958e7816aa6e65bd9ae42e1080', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:20.990864', '2025-06-15 22:26:20.990864', 1, 1);
INSERT INTO public.event_media VALUES (4300, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', '115945', 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif', NULL, 'image/avif', NULL, 76564, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750026380584_8b2bfa97.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=c73013131cf421a28789e4fa611ce521b4c6d2f7998fa2e72551c10aa70e8070', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:20.856032', '2025-06-15 22:26:20.856032', 1, 1);
INSERT INTO public.event_media VALUES (4350, 'tenant_demo_001', 'glow_party.jfif', '115946', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/glow_party_1750026380446_f58e53cd.jfif', NULL, 'image/jpeg', NULL, 14345, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/glow_party_1750026380446_f58e53cd.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T222620Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=67f5380e4492f8716887259519c3d1e98ac6b969079e15f80396d38c6a1a4273', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 22:26:20.583355', '2025-06-15 22:26:20.583355', 1, 1);
INSERT INTO public.event_media VALUES (4400, 'tenant_demo_001', 'zxz', '115947', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/event-poster-music-event_1749958343913_61cef052.jpg', NULL, 'image/jpeg', NULL, 26137, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/event-poster-music-event_1749958343913_61cef052.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250615T033224Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250615%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f4a4017dbd783d610b73d436526f49fede315bf8f99b7c11e11f765fa0bcd712', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-15 03:32:24.279795', '2025-06-15 03:32:24.279795', 1, 1);
INSERT INTO public.event_media VALUES (4450, 'tenant_demo_001', 'xcxcxcxxcxcxc', '115948', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/glow_party_1750045122643_236bc54f.jfif', NULL, 'image/jpeg', NULL, 14345, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/glow_party_1750045122643_236bc54f.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f58364d96ff6d0a6127e70f1bd13fa54fe5dda93961360cfb8f3048cc208ee3f', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-16 03:38:43.045378', '2025-06-16 03:38:43.045378', 1, 1);
INSERT INTO public.event_media VALUES (4500, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', NULL, 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/kanj_cine_star_nite_2025_1750045123063_470db4ac.avif', NULL, 'image/avif', NULL, 76564, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/kanj_cine_star_nite_2025_1750045123063_470db4ac.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=96f8190f8b95f7185b5d7f92423c3682577db0728032abee59b781f82e280718', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-16 03:38:43.228752', '2025-06-16 03:38:43.228752', 2, 1);
INSERT INTO public.event_media VALUES (4550, 'tenant_demo_001', 'mens_party.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/mens_party_1750045123229_c2447fa3.jfif', NULL, 'image/jpeg', NULL, 11908, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/mens_party_1750045123229_c2447fa3.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=74d7c46ca459bfa5e451dd145e63b4b845b87fb8979796ee8dfd77e77262864c', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-16 03:38:43.330859', '2025-06-16 03:38:43.330859', 1, 1);
INSERT INTO public.event_media VALUES (4600, 'tenant_demo_001', 'music_fest.jfif', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/music_fest_1750045123331_4703ef82.jfif', NULL, 'image/jpeg', NULL, 13369, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/music_fest_1750045123331_4703ef82.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=ccafab0578292825faf548600cc8c7b7b97623ed7dff502f5bc3da8d9be5dd2c', NULL, NULL, NULL, NULL, false, NULL, false, false, false, '2025-06-16 03:38:43.437199', '2025-06-16 03:38:43.437199', 1, 1);
INSERT INTO public.event_media VALUES (4701, 'tenant_demo_001', 'kanj_cine_star_nite_2025.avif', '189075', 'image/avif', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750611778776_7cd3457e.avif', NULL, 'image/avif', NULL, 76564, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/kanj_cine_star_nite_2025_1750611778776_7cd3457e.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250622T170300Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250622%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=b57df8d480ce0e14365a1fe584665d8bc32608b186c5ce0a562a8010e014b690', NULL, NULL, NULL, NULL, false, '', false, false, false, '2025-06-22 17:03:00.151361', '2025-07-07 00:30:34.802', 1, 4651);
INSERT INTO public.event_media VALUES (4650, 'tenant_demo_001', 'night_party.jfif', '189078', 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/night_party_1750045123438_59d4ca6c.jfif', NULL, 'image/jpeg', NULL, 8851, true, true, false, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/4500/night_party_1750045123438_59d4ca6c.jfif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250616T033843Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250616%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=89011e0a4126acad5b6e6a9c231c6813f3079fca0ad3a8bf3276fedb8b69b948', NULL, NULL, NULL, NULL, false, '', false, false, false, '2025-06-16 03:38:43.540827', '2025-07-07 04:16:38.357', 1, 1);
INSERT INTO public.event_media VALUES (6701, 'tenant_demo_001', 'bok_Onam.jpeg', NULL, 'image/jpeg', 'S3', 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/bok_Onam_1751862317942_25ae23ae.jpeg', NULL, 'image/jpeg', NULL, 310777, true, false, true, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/2/bok_Onam_1751862317942_25ae23ae.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250707T042519Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAXXXXXXXXXXXXXXXX%2F20250707%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=be68845d91efa2f5c3bced9f33c5ced1ddba0f9321f3a8ea3245d67e55d3ec1f', NULL, NULL, NULL, NULL, NULL, NULL, false, false, false, '2025-07-07 04:25:19.112609', '2025-07-07 04:25:19.112609', 2, 4651);


--
-- TOC entry 3936 (class 0 OID 188501)
-- Dependencies: 234
-- Data for Name: event_organizer; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_organizer VALUES (1, 'tenant_demo_001', 'Lead Organizer', 'Manager', 'lead1@example.com', '555-3001', true, 1, 'Lead for Spring Gala', 'https://example.com/lead1.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 1, 1);
INSERT INTO public.event_organizer VALUES (2, 'tenant_demo_001', 'Co-Organizer', 'Assistant', 'co2@example.com', '555-3002', false, 2, 'Co-lead for Tech Conference', 'https://example.com/co2.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 2, 2);
INSERT INTO public.event_organizer VALUES (3, 'tenant_demo_001', 'Volunteer Lead', 'Volunteer', 'vol3@example.com', '555-3003', false, 3, 'Volunteer for Charity Run', 'https://example.com/vol3.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 3, 3);
INSERT INTO public.event_organizer VALUES (4, 'tenant_demo_001', 'Family Host', 'Host', 'host4@example.com', '555-3004', true, 4, 'Host for Family Picnic', 'https://example.com/host4.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 4, 4);
INSERT INTO public.event_organizer VALUES (5, 'tenant_demo_001', 'VIP Host', 'Manager', 'vip5@example.com', '555-3005', true, 5, 'Host for VIP Dinner', 'https://example.com/vip5.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 5, 5);
INSERT INTO public.event_organizer VALUES (6, 'tenant_demo_001', 'Summer Fest Lead', 'Manager', 'summer6@example.com', '555-3006', true, 6, 'Lead for Summer Fest', 'https://example.com/summer6.jpg', '2025-06-22 11:31:26.928238', '2025-06-22 11:31:26.928238', 6, 6);


--
-- TOC entry 3937 (class 0 OID 188512)
-- Dependencies: 235
-- Data for Name: event_poll; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_poll VALUES (1, 'tenant_demo_001', 'Spring Gala Feedback', 'Feedback poll for Spring Gala', true, false, false, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 1, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 1, 1);
INSERT INTO public.event_poll VALUES (2, 'tenant_demo_001', 'Tech Conference Topics', 'Vote for topics', true, false, true, '2025-06-22 11:31:26.972218', '2025-06-24 11:31:26.972218', 2, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 2, 2);
INSERT INTO public.event_poll VALUES (3, 'tenant_demo_001', 'Charity Run Survey', 'Survey for runners', true, true, false, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 1, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 3, 3);
INSERT INTO public.event_poll VALUES (4, 'tenant_demo_001', 'Family Picnic Games', 'Vote for games', true, false, true, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 3, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 4, 4);
INSERT INTO public.event_poll VALUES (5, 'tenant_demo_001', 'VIP Dinner Menu', 'Choose menu items', true, false, false, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 1, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 5, 5);
INSERT INTO public.event_poll VALUES (6, 'tenant_demo_001', 'Summer Fest Events', 'Vote for events', true, false, true, '2025-06-22 11:31:26.972218', '2025-06-23 11:31:26.972218', 2, 'ALL', '2025-06-22 11:31:26.972218', '2025-06-22 11:31:26.972218', 6, 6);


--
-- TOC entry 3938 (class 0 OID 188529)
-- Dependencies: 236
-- Data for Name: event_poll_option; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_poll_option VALUES (1, 'tenant_demo_001', 'Excellent', 1, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 1);
INSERT INTO public.event_poll_option VALUES (2, 'tenant_demo_001', 'Good', 2, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 1);
INSERT INTO public.event_poll_option VALUES (3, 'tenant_demo_001', 'Average', 3, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 1);
INSERT INTO public.event_poll_option VALUES (4, 'tenant_demo_001', 'Topic A', 1, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 2);
INSERT INTO public.event_poll_option VALUES (5, 'tenant_demo_001', 'Topic B', 2, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 2);
INSERT INTO public.event_poll_option VALUES (6, 'tenant_demo_001', 'Fun', 1, true, '2025-06-22 11:31:27.027301', '2025-06-22 11:31:27.027301', 4);


--
-- TOC entry 3939 (class 0 OID 188541)
-- Dependencies: 237
-- Data for Name: event_poll_response; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_poll_response VALUES (1, 'tenant_demo_001', 'Great event!', 'Excellent', false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 1, 1, 1);
INSERT INTO public.event_poll_response VALUES (2, 'tenant_demo_001', 'Loved it', 'Good', false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 1, 2, 2);
INSERT INTO public.event_poll_response VALUES (3, 'tenant_demo_001', 'Could be better', 'Average', true, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 1, 3, 3);
INSERT INTO public.event_poll_response VALUES (4, 'tenant_demo_001', 'Vote for Topic A', NULL, false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 2, 4, 4);
INSERT INTO public.event_poll_response VALUES (5, 'tenant_demo_001', 'Vote for Topic B', NULL, false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 2, 5, 5);
INSERT INTO public.event_poll_response VALUES (6, 'tenant_demo_001', 'Fun games', 'Fun', false, '2025-06-22 11:31:27.074568', '2025-06-22 11:31:27.074568', 4, 6, 6);


--
-- TOC entry 3940 (class 0 OID 188550)
-- Dependencies: 238
-- Data for Name: event_score_card; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_score_card VALUES (1, 1, 'Team Red', 'Team Blue', 10, 8, 'Close match', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (2, 2, 'Team Alpha', 'Team Beta', 15, 12, 'Exciting', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (3, 3, 'Team One', 'Team Two', 7, 9, 'Well played', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (4, 4, 'Team A', 'Team B', 5, 5, 'Draw', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (5, 5, 'Team X', 'Team Y', 20, 18, 'High scoring', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');
INSERT INTO public.event_score_card VALUES (6, 6, 'Team Sun', 'Team Moon', 13, 14, 'Nail-biter', '2025-06-22 11:31:27.19135', '2025-06-22 11:31:27.19135');


--
-- TOC entry 3941 (class 0 OID 188561)
-- Dependencies: 239
-- Data for Name: event_score_card_detail; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_score_card_detail VALUES (1, 1, 'Team Red', 'Alice', 5, 'Great play', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (2, 1, 'Team Blue', 'Bob', 4, 'Strong defense', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (3, 2, 'Team Alpha', 'Carol', 8, 'Top scorer', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (4, 2, 'Team Beta', 'David', 7, 'Good effort', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (5, 3, 'Team One', 'Eve', 3, 'Quick start', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');
INSERT INTO public.event_score_card_detail VALUES (6, 3, 'Team Two', 'Frank', 6, 'Solid finish', '2025-06-22 11:31:27.245277', '2025-06-22 11:31:27.245277');


--
-- TOC entry 3944 (class 0 OID 188573)
-- Dependencies: 242
-- Data for Name: event_ticket_transaction; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_ticket_transaction VALUES (1, 'tenant_demo_001', 'TXN001', 'alice.johnson@example.com', 'Alice', 'Johnson', '555-1001', 2, 50.00, 100.00, 5.00, 2.00, 1, 10.00, 87.00, 'COMPLETED', 'CARD', 'REF001', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, 'NOT_CHECKED_IN', NULL, NULL);
INSERT INTO public.event_ticket_transaction VALUES (2, 'tenant_demo_002', 'TXN002', 'bob.smith@example.com', 'Bob', 'Smith', '555-1002', 1, 200.00, 200.00, 10.00, 5.00, 2, 20.00, 185.00, 'COMPLETED', 'CARD', 'REF002', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 2, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, 'NOT_CHECKED_IN', NULL, NULL);
INSERT INTO public.event_ticket_transaction VALUES (3, 'tenant_demo_003', 'TXN003', 'carol.williams@example.com', 'Carol', 'Williams', '555-1003', 3, 0.00, 0.00, 0.00, 0.00, 3, 0.00, 0.00, 'COMPLETED', 'CASH', 'REF003', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, 'NOT_CHECKED_IN', NULL, NULL);
INSERT INTO public.event_ticket_transaction VALUES (4, 'tenant_demo_004', 'TXN004', 'david.brown@example.com', 'David', 'Brown', '555-1004', 4, 20.00, 80.00, 4.00, 1.00, 4, 5.00, 70.00, 'COMPLETED', 'CARD', 'REF004', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, 'NOT_CHECKED_IN', NULL, NULL);
INSERT INTO public.event_ticket_transaction VALUES (5, 'tenant_demo_005', 'TXN005', 'eve.davis@example.com', 'Eve', 'Davis', '555-1005', 1, 100.00, 100.00, 5.00, 2.00, 5, 10.00, 87.00, 'COMPLETED', 'CARD', 'REF005', NULL, NULL, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, 5, '2025-06-22 11:31:27.363866', '2025-06-22 11:31:27.363866', NULL, 'NOT_CHECKED_IN', NULL, NULL);
INSERT INTO public.event_ticket_transaction VALUES (6751, 'tenant_demo_001', NULL, 'giventauser@gmail.com', 'Gain Joseph', '', '', 1, 10.00, 10.00, 0.00, 0.10, NULL, 0.00, 9.31, 'COMPLETED', 'card', 'pi_3RiGbpK5BrggeAHM1HhHh1kX', 'cs_test_a15jfvx9tfQSfTgKcs7gOYKXjKrvjLLdAlJmjSNryEunj5ZY3gBWqn4WjI', 'pi_3RiGbpK5BrggeAHM1HhHh1kX', '2025-07-07 15:06:10.327', NULL, NULL, NULL, NULL, NULL, 'paid', 'giventauser@gmail.com', 'usd', 0.00, 0.00, 0.59, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/tickets/qrcode_6751_1751900783601_7611b5f5.png', 1, NULL, '2025-07-07 15:06:10.327', '2025-07-07 15:06:10.327', NULL, NULL, NULL, NULL);
INSERT INTO public.event_ticket_transaction VALUES (6568, 'tenant_demo_001', NULL, 'giventauser@gmail.com', 'Gain Joseph', '', '', 1, 10.00, 10.00, 0.00, 0.10, NULL, 0.00, 9.90, 'REFUNDED', 'card', 'pi_3Ri3sGK5BrggeAHM1lsoDuyY', 'cs_test_a10y7sbWlZTC4m0BvC6Us0vCvIToOUqK47oHPNkPygWlngV3fJzeXAcIwW', 'pi_3Ri3sGK5BrggeAHM1lsoDuyY', '2025-07-07 01:30:01.727', NULL, 10.00, '2025-07-07 04:00:21.565', '189077', NULL, 'refunded', 'giventauser@gmail.com', 'usd', 0.00, 0.00, 0.00, 'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/tenantId/tenant_demo_001/event-id/1/tickets/qrcode_6568_1751851811103_00980bd4.png', 1, NULL, '2025-07-07 01:30:01.727', '2025-07-07 04:00:21.565', NULL, NULL, NULL, NULL);


--
-- TOC entry 3947 (class 0 OID 188623)
-- Dependencies: 245
-- Data for Name: event_ticket_transaction_item; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_ticket_transaction_item VALUES (6621, 'tenant_demo_001', 6568, 4752, 1, 10.00, 10.00, '2025-07-07 01:30:01.727', '2025-07-07 01:30:01.727');
INSERT INTO public.event_ticket_transaction_item VALUES (6801, 'tenant_demo_001', 6751, 4752, 1, 10.00, 10.00, '2025-07-07 15:06:10.327', '2025-07-07 15:06:10.327');


--
-- TOC entry 3945 (class 0 OID 188601)
-- Dependencies: 243
-- Data for Name: event_ticket_type; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_ticket_type VALUES (1, 'tenant_demo_001', 'Standard', 'Standard ticket for Spring Gala', 50.00, false, NULL, 'STD', 100, 12, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 6);
INSERT INTO public.event_ticket_type VALUES (3, 'tenant_demo_001', 'Runner', 'Runner ticket for Charity Run', 0.00, false, NULL, 'RUN', 300, 103, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 3);
INSERT INTO public.event_ticket_type VALUES (4, 'tenant_demo_001', 'Family', 'Family ticket for Picnic', 20.00, false, NULL, 'FAM', 30, 14, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 4);
INSERT INTO public.event_ticket_type VALUES (5, 'tenant_demo_001', 'Dinner', 'Dinner ticket for VIP Dinner', 100.00, false, NULL, 'DIN', 20, 9, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 5);
INSERT INTO public.event_ticket_type VALUES (6, 'tenant_demo_001', 'Festival', 'Festival ticket for Summer Fest', 30.00, false, NULL, 'FEST', 200, 52, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 11:31:27.363866', 6);
INSERT INTO public.event_ticket_type VALUES (2, 'tenant_demo_001', 'VIP', 'VIP ticket for Tech Conference', 200.00, false, NULL, 'VIP', 48, 8, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 11:31:27.305395', '2025-06-22 14:03:04.384515', 2);
INSERT INTO public.event_ticket_type VALUES (4751, 'tenant_demo_001', 'zxzxz', 'xzxzxzxz', 20.00, false, 0.00, 'DIN', 84, 25, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 17:48:59.275', '2025-07-06 21:17:40.751528', 1);
INSERT INTO public.event_ticket_type VALUES (4752, 'tenant_demo_001', 'FAMILY5', 'xzxzxzxz', 10.00, false, 0.00, 'FAMILY5', 83, 8, true, NULL, NULL, 1, 10, false, 0, '2025-06-22 17:50:20.591', '2025-07-07 11:06:23.520233', 1);


--
-- TOC entry 3948 (class 0 OID 188641)
-- Dependencies: 246
-- Data for Name: event_type_details; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.event_type_details VALUES (1, 'tenant_demo_001', 'Gala', 'Formal gala event', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (2, 'tenant_demo_001', 'Conference', 'Tech conference', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (3, 'tenant_demo_001', 'Run', 'Charity run', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (4, 'tenant_demo_001', 'Picnic', 'Family picnic', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (5, 'tenant_demo_001', 'Dinner', 'VIP dinner', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');
INSERT INTO public.event_type_details VALUES (6, 'tenant_demo_001', 'Festival', 'Summer festival', '#3B82F6', NULL, true, 0, '2025-06-22 11:31:26.181502', '2025-06-22 11:31:26.181502');


--
-- TOC entry 3949 (class 0 OID 188655)
-- Dependencies: 247
-- Data for Name: qr_code_usage; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3950 (class 0 OID 188668)
-- Dependencies: 248
-- Data for Name: rel_event_details__discount_codes; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.rel_event_details__discount_codes VALUES (1, 1);
INSERT INTO public.rel_event_details__discount_codes VALUES (2, 2);
INSERT INTO public.rel_event_details__discount_codes VALUES (3, 3);
INSERT INTO public.rel_event_details__discount_codes VALUES (4, 4);
INSERT INTO public.rel_event_details__discount_codes VALUES (5, 5);
INSERT INTO public.rel_event_details__discount_codes VALUES (6, 6);


--
-- TOC entry 3951 (class 0 OID 188671)
-- Dependencies: 249
-- Data for Name: tenant_organization; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.tenant_organization VALUES (1, 'tenant_demo_001', 'Malayalees US', NULL, NULL, NULL, NULL, 'contact1@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (2, 'tenant_demo_002', 'Techies US', NULL, NULL, NULL, NULL, 'contact2@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (3, 'tenant_demo_003', 'Charity Org', NULL, NULL, NULL, NULL, 'contact3@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (4, 'tenant_demo_004', 'Family Org', NULL, NULL, NULL, NULL, 'contact4@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (5, 'tenant_demo_005', 'VIP Org', NULL, NULL, NULL, NULL, 'contact5@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');
INSERT INTO public.tenant_organization VALUES (6, 'tenant_demo_006', 'Summer Org', NULL, NULL, NULL, NULL, 'contact6@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-06-22 11:31:27.518852', '2025-06-22 11:31:27.518852');


--
-- TOC entry 3952 (class 0 OID 188688)
-- Dependencies: 250
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.tenant_settings VALUES (2, 'tenant_demo_002', true, true, true, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 10, 200, 0.0000, '2025-06-22 11:31:27.571132', '2025-06-22 11:31:27.571132');
INSERT INTO public.tenant_settings VALUES (3, 'tenant_demo_003', false, false, false, true, NULL, NULL, NULL, NULL, NULL, NULL, false, 3, 50, 0.0000, '2025-06-22 11:31:27.571132', '2025-06-22 11:31:27.571132');
INSERT INTO public.tenant_settings VALUES (4, 'tenant_demo_004', true, false, true, true, NULL, NULL, NULL, NULL, NULL, NULL, true, 8, 150, 0.0000, '2025-06-22 11:31:27.571132', '2025-06-22 11:31:27.571132');
INSERT INTO public.tenant_settings VALUES (5, 'tenant_demo_005', true, true, false, true, NULL, NULL, NULL, NULL, NULL, NULL, false, 2, 75, 0.0000, '2025-06-22 11:31:27.571132', '2025-06-22 11:31:27.571132');
INSERT INTO public.tenant_settings VALUES (6, 'tenant_demo_006', false, true, true, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 6, 120, 0.0000, '2025-06-22 11:31:27.571132', '2025-06-22 11:31:27.571132');
INSERT INTO public.tenant_settings VALUES (1, 'tenant_demo_001', true, false, false, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 5, 100, 1.0000, '2025-06-22 11:31:27.571132', '2025-07-04 11:00:36.413833');


--
-- TOC entry 3955 (class 0 OID 188735)
-- Dependencies: 253
-- Data for Name: user_payment_transaction; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.user_payment_transaction VALUES (1, 'tenant_demo_001', 'TICKET_SALE', 100.00, 'USD', NULL, NULL, 0.00, 0.00, 'COMPLETED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 1, 1, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (2, 'tenant_demo_001', 'SUBSCRIPTION', 200.00, 'USD', NULL, NULL, 0.00, 0.00, 'COMPLETED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 2, NULL, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (3, 'tenant_demo_001', 'COMMISSION', 50.00, 'USD', NULL, NULL, 0.00, 0.00, 'PENDING', 0.00, NULL, NULL, 'CASH', NULL, NULL, 3, 2, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (4, 'tenant_demo_001', 'REFUND', 75.00, 'USD', NULL, NULL, 0.00, 0.00, 'FAILED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 4, 3, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (5, 'tenant_demo_001', 'TICKET_SALE', 120.00, 'USD', NULL, NULL, 0.00, 0.00, 'COMPLETED', 0.00, NULL, NULL, 'CARD', NULL, NULL, 5, 4, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');
INSERT INTO public.user_payment_transaction VALUES (6, 'tenant_demo_001', 'SUBSCRIPTION', 60.00, 'USD', NULL, NULL, 0.00, 0.00, 'REFUNDED', 0.00, NULL, NULL, 'CASH', NULL, NULL, 6, NULL, '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757');


--
-- TOC entry 3920 (class 0 OID 188319)
-- Dependencies: 218
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.user_profile VALUES (1, 'tenant_demo_001', 'user001', 'Alice', 'Johnson', 'alice.johnson@example.com', '555-1001', '123 Main St', NULL, 'Springfield', 'IL', '62701', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'MEMBER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.user_profile VALUES (2, 'tenant_demo_001', 'user002', 'Bob', 'Smith', 'bob.smith@example.com', '555-1002', '456 Oak Ave', NULL, 'Springfield', 'IL', '62702', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'ADMIN', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.user_profile VALUES (3, 'tenant_demo_001', 'user003', 'Carol', 'Williams', 'carol.williams@example.com', '555-1003', '789 Pine Rd', NULL, 'Springfield', 'IL', '62703', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, 'INACTIVE', 'VOLUNTEER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.user_profile VALUES (4, 'tenant_demo_001', 'user004', 'David', 'Brown', 'david.brown@example.com', '555-1004', '321 Maple St', NULL, 'Springfield', 'IL', '62704', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, 'PENDING_APPROVAL', 'ORGANIZER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.user_profile VALUES (5, 'tenant_demo_001', 'user005', 'Eve', 'Davis', 'eve.davis@example.com', '555-1005', '654 Cedar Ave', NULL, 'Springfield', 'IL', '62705', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, 'SUSPENDED', 'SUPER_ADMIN', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.user_profile VALUES (6, 'tenant_demo_001', 'user006', 'Frank', 'Miller', 'frank.miller@example.com', '555-1006', '987 Birch Blvd', NULL, 'Springfield', 'IL', '62706', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, 'BANNED', 'MEMBER', NULL, NULL, '2025-06-22 11:31:26.252573', '2025-06-22 11:31:26.252573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.user_profile VALUES (4651, 'tenant_demo_001', 'user_2vVLxhPnsIPGYf6qpfozk383Slr', 'Gain Joseph', 'Joseph', 'giventauser@gmail.com', '3123440073', '165 Hopkins Ave, APT #7', '', 'Jersey City', 'New Jersey', '07306', 'United States', 'fdfdfdfdfdf', 'fdfdfd', 'dfdfd', 'dfdfdf', '', 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydlZMeGVDUnFWTnpkTDBLUXMySXNWekFBVG8ifQ', 'PENDING_APPROVAL', 'MEMBER', NULL, NULL, '2025-06-22 16:44:08.782', '2025-07-07 00:17:11.309888', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 3917 (class 0 OID 86604)
-- Dependencies: 215
-- Data for Name: user_registration_request; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3956 (class 0 OID 188749)
-- Dependencies: 254
-- Data for Name: user_subscription; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.user_subscription VALUES (1, 'tenant_demo_001', 'cus_001', 'sub_001', 'price_001', '2025-07-22 11:31:27.659946', 'ACTIVE', '2025-06-29 11:31:27.659946', false, 1, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (2, 'tenant_demo_001', 'cus_002', 'sub_002', 'price_002', '2025-07-22 11:31:27.659946', 'TRIAL', '2025-07-06 11:31:27.659946', false, 2, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (3, 'tenant_demo_001', 'cus_003', 'sub_003', 'price_003', '2025-07-22 11:31:27.659946', 'CANCELLED', '2025-06-29 11:31:27.659946', true, 3, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (4, 'tenant_demo_001', 'cus_004', 'sub_004', 'price_004', '2025-07-22 11:31:27.659946', 'EXPIRED', '2025-06-29 11:31:27.659946', false, 4, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (5, 'tenant_demo_001', 'cus_005', 'sub_005', 'price_005', '2025-07-22 11:31:27.659946', 'SUSPENDED', '2025-06-29 11:31:27.659946', false, 5, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');
INSERT INTO public.user_subscription VALUES (6, 'tenant_demo_001', 'cus_006', 'sub_006', 'price_006', '2025-07-22 11:31:27.659946', 'ACTIVE', '2025-06-29 11:31:27.659946', false, 6, '2025-06-22 11:31:27.659946', '2025-06-22 11:31:27.659946');


--
-- TOC entry 3957 (class 0 OID 188758)
-- Dependencies: 255
-- Data for Name: user_task; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--

INSERT INTO public.user_task VALUES (1, 'tenant_demo_001', 'Setup Venue', 'Setup the venue for Spring Gala', 'PENDING', 'HIGH', '2025-06-24 11:31:27.727601', false, NULL, 5.00, NULL, 0, 1, 'Alice', '555-1001', 'alice.johnson@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 1);
INSERT INTO public.user_task VALUES (2, 'tenant_demo_001', 'Arrange Catering', 'Arrange food for Tech Conference', 'PENDING', 'MEDIUM', '2025-06-25 11:31:27.727601', false, NULL, 3.00, NULL, 0, 2, 'Bob', '555-1002', 'bob.smith@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 2);
INSERT INTO public.user_task VALUES (3, 'tenant_demo_001', 'Distribute Flyers', 'Distribute flyers for Charity Run', 'COMPLETED', 'LOW', '2025-06-21 11:31:27.727601', true, '2025-06-22 11:31:27.727601', 2.00, 2.00, 100, 3, 'Carol', '555-1003', 'carol.williams@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 3);
INSERT INTO public.user_task VALUES (4, 'tenant_demo_001', 'Book Park', 'Book park for Family Picnic', 'PENDING', 'HIGH', '2025-06-27 11:31:27.727601', false, NULL, 1.00, NULL, 0, 4, 'David', '555-1004', 'david.brown@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 4);
INSERT INTO public.user_task VALUES (5, 'tenant_demo_001', 'Send Invites', 'Send invitations for VIP Dinner', 'PENDING', 'MEDIUM', '2025-06-23 11:31:27.727601', false, NULL, 1.50, NULL, 0, 5, 'Eve', '555-1005', 'eve.davis@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 5);
INSERT INTO public.user_task VALUES (6, 'tenant_demo_001', 'Setup Stage', 'Setup stage for Summer Fest', 'PENDING', 'HIGH', '2025-06-26 11:31:27.727601', false, NULL, 4.00, NULL, 0, 6, 'Frank', '555-1006', 'frank.miller@example.com', '2025-06-22 11:31:27.727601', '2025-06-22 11:31:27.727601', 6);
