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