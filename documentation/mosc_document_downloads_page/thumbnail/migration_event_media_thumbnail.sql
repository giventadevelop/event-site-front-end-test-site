-- Per-file thumbnail columns on event_media (official documents and future list previews)
-- Safe to run multiple times (PostgreSQL)
-- See: documentation/mosc_document_downloads_page/thumbnail/README.md

BEGIN;

ALTER TABLE IF EXISTS public.event_media
  ADD COLUMN IF NOT EXISTS thumbnail_url varchar(2048),
  ADD COLUMN IF NOT EXISTS thumbnail_pre_signed_url varchar(2048),
  ADD COLUMN IF NOT EXISTS thumbnail_pre_signed_url_expires_at timestamp;

COMMENT ON COLUMN public.event_media.thumbnail_url IS
  'Stable S3/object URL for optional card thumbnail (e.g. preview image for PDF official documents).';

COMMENT ON COLUMN public.event_media.thumbnail_pre_signed_url IS
  'Optional cached presigned URL for thumbnail access (mirrors pre_signed_url pattern).';

COMMENT ON COLUMN public.event_media.thumbnail_pre_signed_url_expires_at IS
  'Expiry timestamp for thumbnail_pre_signed_url.';

CREATE INDEX IF NOT EXISTS idx_event_media_official_has_thumbnail
  ON public.event_media (tenant_id, is_event_management_official_document)
  WHERE thumbnail_url IS NOT NULL;

COMMIT;
