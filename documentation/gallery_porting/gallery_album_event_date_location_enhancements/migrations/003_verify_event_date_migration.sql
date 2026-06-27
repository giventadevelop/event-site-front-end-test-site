-- Verification queries — gallery album event date & location migration
-- Replace :tenant_id with your tenant id.

-- 1. Column existence
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'gallery_album'
  AND column_name IN ('event_date_start', 'event_date_end', 'event_location')
ORDER BY column_name;

-- 2. Dharma-Dhamma conference (must have range + Indore)
SELECT id, title, album_year, event_date_start, event_date_end, event_location
FROM public.gallery_album
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=dharma-dhamma-conference%';

-- 3. Albums with full dates in manifest but null event_date_start (should be 0 after backfill)
-- Manual spot-check: list ported albums with static_slug
SELECT id, title, album_year, event_date_start, event_date_end, event_location, description
FROM public.gallery_album
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=%'
ORDER BY title;

-- 4. Constraint sanity — end before start (should return 0 rows)
SELECT id, title, event_date_start, event_date_end
FROM public.gallery_album
WHERE event_date_start IS NOT NULL
  AND event_date_end IS NOT NULL
  AND event_date_end < event_date_start;

-- 5. album_year vs start year mismatch (should return 0 after backfill)
SELECT id, title, album_year, event_date_start
FROM public.gallery_album
WHERE event_date_start IS NOT NULL
  AND album_year IS NOT NULL
  AND album_year <> EXTRACT(YEAR FROM event_date_start)::int;
