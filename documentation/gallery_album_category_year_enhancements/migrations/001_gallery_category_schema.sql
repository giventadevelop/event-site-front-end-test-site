-- =============================================
-- Migration: Gallery Category + Album Year (v1.0)
-- Date: 2026-06-17
-- PRD: documentation/gallery_album_category_year_enhancements/data_migration_enhancements_prd.html
-- Canonical sync: code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql
-- Apply order: 001 → 002 → (003 optional) → 004 → 005
-- =============================================

-- 1. gallery_category lookup table
CREATE TABLE IF NOT EXISTS public.gallery_category (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    slug character varying(64) NOT NULL,
    display_name character varying(128) NOT NULL,
    description character varying(512) NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT gallery_category_pkey PRIMARY KEY (id),
    CONSTRAINT ux_gallery_category_tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT check_gallery_category_slug_format CHECK (
        slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
    CONSTRAINT check_gallery_category_sort_non_negative CHECK (sort_order >= 0)
);

COMMENT ON TABLE public.gallery_category IS
    'Tenant-scoped categories for gallery albums (e.g. Ecumenical Visits, Major Events).';
COMMENT ON COLUMN public.gallery_category.slug IS
    'URL-safe identifier; unique per tenant. Used for filters and admin keys.';
COMMENT ON COLUMN public.gallery_category.display_name IS
    'Human-readable label shown on album card category pill.';

CREATE INDEX IF NOT EXISTS idx_gallery_category_tenant_active
    ON public.gallery_category (tenant_id, is_active, sort_order);

-- 2. gallery_album new columns
ALTER TABLE public.gallery_album
    ADD COLUMN IF NOT EXISTS gallery_category_id bigint NULL,
    ADD COLUMN IF NOT EXISTS album_year integer NULL;

ALTER TABLE public.gallery_album
    DROP CONSTRAINT IF EXISTS fk_gallery_album_category;

ALTER TABLE public.gallery_album
    ADD CONSTRAINT fk_gallery_album_category
        FOREIGN KEY (gallery_category_id)
        REFERENCES public.gallery_category(id)
        ON DELETE SET NULL;

ALTER TABLE public.gallery_album
    DROP CONSTRAINT IF EXISTS chk_gallery_album_year_range;

ALTER TABLE public.gallery_album
    ADD CONSTRAINT chk_gallery_album_year_range
        CHECK (album_year IS NULL OR (album_year >= 1900 AND album_year <= 2100));

COMMENT ON COLUMN public.gallery_album.gallery_category_id IS
    'Optional FK to gallery_category; drives category pill on public album cards.';
COMMENT ON COLUMN public.gallery_album.album_year IS
    'Calendar year of the visit/event shown on cards (e.g. 2019). Not the same as created_at.';

CREATE INDEX IF NOT EXISTS idx_gallery_album_category_id
    ON public.gallery_album (gallery_category_id)
    WHERE gallery_category_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_album_album_year
    ON public.gallery_album (tenant_id, album_year)
    WHERE album_year IS NOT NULL;

-- 3. Keep shared sequence ahead of new table ids
SELECT pg_catalog.setval(
    'public.sequence_generator',
    GREATEST(
        COALESCE((SELECT MAX(id) FROM public.gallery_album), 0),
        COALESCE((SELECT MAX(id) FROM public.gallery_category), 0),
        1
    ),
    true
);
