-- Gallery album event date & location — schema v1.0
-- Apply after gallery_category + album_year columns exist (category/year pack).
-- Tenant: all tenants; columns nullable for backward compatibility.

ALTER TABLE public.gallery_album
    ADD COLUMN IF NOT EXISTS event_date_start date NULL,
    ADD COLUMN IF NOT EXISTS event_date_end date NULL,
    ADD COLUMN IF NOT EXISTS event_location varchar(256) NULL;

-- End date must not precede start date when both are set
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_gallery_album_event_date_order'
    ) THEN
        ALTER TABLE public.gallery_album
            ADD CONSTRAINT chk_gallery_album_event_date_order
                CHECK (
                    event_date_start IS NULL
                    OR event_date_end IS NULL
                    OR event_date_end >= event_date_start
                );
    END IF;
END $$;

COMMENT ON COLUMN public.gallery_album.event_date_start IS
    'Calendar start date of the visit/event shown on album cards (date only, no time).';
COMMENT ON COLUMN public.gallery_album.event_date_end IS
    'Optional end date for multi-day events; must be >= event_date_start when both set.';
COMMENT ON COLUMN public.gallery_album.event_location IS
    'Human-readable place (city/venue) shown after formatted date on cards, e.g. Indore, Beirut.';

CREATE INDEX IF NOT EXISTS idx_gallery_album_event_date_start
    ON public.gallery_album (tenant_id, event_date_start)
    WHERE event_date_start IS NOT NULL;
