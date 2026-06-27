-- =============================================
-- Migration: Add Sponsor Image Upload Support
-- Date: 2025-01-17
-- Description: Adds custom poster support and sponsor media file references
-- =============================================

-- 1. Add custom_poster_url to event_sponsors_join
ALTER TABLE public.event_sponsors_join
ADD COLUMN IF NOT EXISTS custom_poster_url varchar(1024) NULL;

-- 2. Add URL format constraint
ALTER TABLE public.event_sponsors_join
DROP CONSTRAINT IF EXISTS check_custom_poster_url_format;

ALTER TABLE public.event_sponsors_join
ADD CONSTRAINT check_custom_poster_url_format
CHECK (custom_poster_url IS NULL OR custom_poster_url ~* '^https?://.*');

-- 3. Add index for custom_poster_url
CREATE INDEX IF NOT EXISTS idx_event_sponsors_join_custom_poster
ON public.event_sponsors_join(custom_poster_url)
WHERE custom_poster_url IS NOT NULL;

-- 4. Add sponsor_id to event_media (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'sponsor_id'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN sponsor_id bigint NULL;

        ALTER TABLE public.event_media
        ADD CONSTRAINT fk_event_media_sponsor_id
        FOREIGN KEY (sponsor_id)
        REFERENCES public.event_sponsors(id)
        ON DELETE CASCADE;

        CREATE INDEX idx_event_media_sponsor_id
        ON public.event_media(sponsor_id)
        WHERE sponsor_id IS NOT NULL;
    END IF;
END $$;

-- 5. Add event_sponsors_join_id to event_media (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_media'
        AND column_name = 'event_sponsors_join_id'
    ) THEN
        ALTER TABLE public.event_media
        ADD COLUMN event_sponsors_join_id bigint NULL;

        ALTER TABLE public.event_media
        ADD CONSTRAINT fk_event_media_event_sponsors_join_id
        FOREIGN KEY (event_sponsors_join_id)
        REFERENCES public.event_sponsors_join(id)
        ON DELETE CASCADE;

        CREATE INDEX idx_event_media_event_sponsors_join_id
        ON public.event_media(event_sponsors_join_id)
        WHERE event_sponsors_join_id IS NOT NULL;
    END IF;
END $$;

-- 6. Add comments for documentation
COMMENT ON COLUMN public.event_sponsors_join.custom_poster_url IS
'Custom poster image URL for this specific event-sponsor combination. Stored in S3 with path: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}';

COMMENT ON COLUMN public.event_media.sponsor_id IS
'Reference to sponsor for sponsor-specific media files. When set, this media file belongs to a specific sponsor.';

COMMENT ON COLUMN public.event_media.event_sponsors_join_id IS
'Reference to event-sponsor join record for custom posters. When set, this media file is a custom poster for a specific event-sponsor combination.';

-- 7. Verify changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'event_sponsors_join'
AND column_name = 'custom_poster_url';

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'event_media'
AND column_name IN ('sponsor_id', 'event_sponsors_join_id');
















