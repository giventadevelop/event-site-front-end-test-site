-- Fix incorrect file_url values for events 2 and 3
-- The file_url values are pointing to event-id/1/ instead of the correct event-id

-- Update Event 2 media records
UPDATE event_media
SET file_url = REPLACE(file_url, 'event-id/1/', 'event-id/2/'),
    pre_signed_url = REPLACE(pre_signed_url, 'event-id/1/', 'event-id/2/')
WHERE event_id = 2
  AND file_url LIKE '%event-id/1/%';

-- Update Event 3 media records
UPDATE event_media
SET file_url = REPLACE(file_url, 'event-id/1/', 'event-id/3/'),
    pre_signed_url = REPLACE(pre_signed_url, 'event-id/1/', 'event-id/3/')
WHERE event_id = 3
  AND file_url LIKE '%event-id/1/%';

-- Verify the fix
SELECT id, event_id, title, file_url
FROM event_media
WHERE event_id IN (2, 3)
  AND event_flyer = true
ORDER BY event_id, id;