-- =============================================
-- Rollback: Gallery Category + Album Year (v1.0)
-- PRD: data_migration_enhancements_prd.html §7
-- WARNING: Destructive — drops category data and album FK columns.
-- =============================================

ALTER TABLE public.gallery_album
    DROP CONSTRAINT IF EXISTS fk_gallery_album_category;

ALTER TABLE public.gallery_album
    DROP CONSTRAINT IF EXISTS chk_gallery_album_year_range;

DROP INDEX IF EXISTS public.idx_gallery_album_category_id;
DROP INDEX IF EXISTS public.idx_gallery_album_album_year;

ALTER TABLE public.gallery_album
    DROP COLUMN IF EXISTS gallery_category_id,
    DROP COLUMN IF EXISTS album_year;

DROP INDEX IF EXISTS public.idx_gallery_category_tenant_active;

DROP TABLE IF EXISTS public.gallery_category CASCADE;
