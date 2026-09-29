-- Personal profile Phase B — booking_url, media_kind, profile_project, projects section flag
-- Apply via Liquibase in event-site-manager-service; canonical DDL in Event_Site_Manager_Latest_Schema.sql

ALTER TABLE public.public_profile
  ADD COLUMN IF NOT EXISTS booking_url character varying(1024);

ALTER TABLE public.profile_media_asset
  ADD COLUMN IF NOT EXISTS media_kind character varying(32) NOT NULL DEFAULT 'DOCUMENT';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_profile_media_asset__media_kind'
  ) THEN
    ALTER TABLE public.profile_media_asset
      ADD CONSTRAINT chk_profile_media_asset__media_kind CHECK (
        media_kind IN ('DOCUMENT', 'VIDEO', 'PODCAST', 'PRESS', 'OTHER')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profile_media_asset_tenant_kind
  ON public.profile_media_asset (tenant_id, media_kind);

ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS show_profile_projects_section boolean DEFAULT false NOT NULL;

CREATE SEQUENCE IF NOT EXISTS public.profile_project_id_seq
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  START WITH 1
  CACHE 1;

CREATE TABLE IF NOT EXISTS public.profile_project (
  id bigint DEFAULT nextval('public.profile_project_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  title character varying(500) NOT NULL,
  slug character varying(150),
  summary character varying(2000),
  cover_image_url character varying(1024),
  role character varying(255),
  outcome_metrics_json text,
  project_url character varying(1024),
  display_order integer,
  is_featured boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT profile_project_pkey PRIMARY KEY (id),
  CONSTRAINT fk_profile_project__tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_profile_project__tenant_slug
  ON public.profile_project (tenant_id, slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profile_project_tenant ON public.profile_project (tenant_id);

COMMENT ON COLUMN public.public_profile.booking_url IS
  'Calendly or external booking URL shown on contact / hero CTAs.';
COMMENT ON COLUMN public.profile_media_asset.media_kind IS
  'Semantic kind for talks strip vs downloads: DOCUMENT, VIDEO, PODCAST, PRESS, OTHER.';
COMMENT ON COLUMN public.tenant_settings.show_profile_projects_section IS
  'When true, homepage shows profile project / case-study cards.';
COMMENT ON TABLE public.profile_project IS
  'Case-study / project cards for PERSONAL_PROFILE and HYBRID tenants.';
