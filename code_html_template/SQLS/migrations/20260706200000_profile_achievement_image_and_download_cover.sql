-- Profile site: achievement images and download cover images
-- Apply via Liquibase in event-site-manager-service or run manually on Postgres.

ALTER TABLE public.profile_achievement
  ADD COLUMN IF NOT EXISTS image_url character varying(1024);

ALTER TABLE public.profile_media_asset
  ADD COLUMN IF NOT EXISTS cover_image_url character varying(1024);

COMMENT ON COLUMN public.profile_achievement.image_url IS 'Optional badge, certificate, or photo URL for the achievement.';
COMMENT ON COLUMN public.profile_media_asset.cover_image_url IS 'Optional cover/preview image for download listing and detail pages.';
