-- =============================================================================
-- Incremental migration: official_document_year_bundle (option B cover image)
-- Run ONCE per database that already exists and does not include this table yet.
-- Do NOT run on a DB created from Latest_Schema_Post__Blob_Claude_12.sql after
-- the table was added to that file (would fail: relation already exists).
--
-- Prerequisite: PostgreSQL requires FK targets to have PRIMARY KEY or UNIQUE.
-- If your dump never added one, add PK on event_media.id before creating the FK:
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.event_media'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.event_media ADD CONSTRAINT event_media_pkey PRIMARY KEY (id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.official_document_year_bundle (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    official_document_category_id bigint NOT NULL,
    document_year integer NOT NULL,
    cover_event_media_id bigint NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT official_document_year_bundle_pkey PRIMARY KEY (id),
    CONSTRAINT ux_official_document_year_bundle_tenant_category_year UNIQUE (tenant_id, official_document_category_id, document_year),
    CONSTRAINT fk_official_document_year_bundle_category FOREIGN KEY (official_document_category_id) REFERENCES public.official_document_category(id) ON DELETE CASCADE,
    CONSTRAINT fk_official_document_year_bundle_cover_media FOREIGN KEY (cover_event_media_id) REFERENCES public.event_media(id) ON DELETE SET NULL,
    CONSTRAINT check_official_document_year_bundle_year CHECK (document_year >= 1900 AND document_year <= 2100)
);

COMMENT ON TABLE public.official_document_year_bundle IS 'Per-tenant, per-category, per-calendar-year grouping; optional cover points to event_media for UI thumbnails.';

CREATE INDEX IF NOT EXISTS idx_official_document_year_bundle_tenant_category_year
    ON public.official_document_year_bundle (tenant_id, official_document_category_id, document_year);

DROP TRIGGER IF EXISTS update_official_document_year_bundle_updated_at ON public.official_document_year_bundle;
CREATE TRIGGER update_official_document_year_bundle_updated_at
    BEFORE UPDATE ON public.official_document_year_bundle
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep shared sequence ahead of new IDs (same pattern as canonical schema file)
SELECT pg_catalog.setval(
    'public.sequence_generator',
    GREATEST(
        (SELECT last_value FROM public.sequence_generator),
        COALESCE((SELECT MAX(id) FROM public.official_document_year_bundle), 0)
    ),
    true
);
