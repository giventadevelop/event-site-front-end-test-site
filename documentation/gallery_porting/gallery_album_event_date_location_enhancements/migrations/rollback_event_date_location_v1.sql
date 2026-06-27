-- Rollback event date & location columns (v1.0)
-- WARNING: drops event_date_start, event_date_end, event_location data.

DROP INDEX IF EXISTS public.idx_gallery_album_event_date_start;

ALTER TABLE public.gallery_album
    DROP CONSTRAINT IF EXISTS chk_gallery_album_event_date_order;

ALTER TABLE public.gallery_album
    DROP COLUMN IF EXISTS event_location,
    DROP COLUMN IF EXISTS event_date_end,
    DROP COLUMN IF EXISTS event_date_start;
