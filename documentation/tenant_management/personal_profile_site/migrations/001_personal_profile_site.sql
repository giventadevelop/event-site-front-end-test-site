-- Personal profile site + site_type — incremental migration for existing deployments
-- Apply via Liquibase in event-site-manager-service; canonical DDL in Latest_Schema_Post__Blob_Claude_12.sql

-- tenant_organization.site_type
ALTER TABLE public.tenant_organization
  ADD COLUMN IF NOT EXISTS site_type character varying(32) DEFAULT 'EVENT_ORG' NOT NULL,
  ADD COLUMN IF NOT EXISTS site_template_version character varying(32);

ALTER TABLE public.tenant_organization
  DROP CONSTRAINT IF EXISTS chk_tenant_organization__site_type;

ALTER TABLE public.tenant_organization
  ADD CONSTRAINT chk_tenant_organization__site_type CHECK (
    site_type IN ('EVENT_ORG', 'SPORTS_TEAM', 'MUSIC_BAND', 'CHURCH_ORG', 'PERSONAL_PROFILE', 'HYBRID')
  );

-- tenant_settings profile homepage flags
ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS show_public_profile_hero_section boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_profile_writings_section boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_profile_achievements_section boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_profile_affiliations_section boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_profile_media_downloads_section boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_profile_contact_section boolean DEFAULT false NOT NULL;

-- Sequences
CREATE SEQUENCE IF NOT EXISTS public.public_profile_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.profile_writing_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.profile_achievement_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.profile_affiliation_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.profile_media_asset_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.public_profile (
  id bigint DEFAULT nextval('public.public_profile_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  display_name character varying(255) NOT NULL,
  tagline character varying(500),
  headline character varying(500),
  bio_markdown text,
  profile_image_url character varying(1024),
  cover_image_url character varying(1024),
  location character varying(255),
  languages character varying(255),
  public_slug character varying(100),
  contact_email character varying(255),
  contact_form_enabled boolean DEFAULT false NOT NULL,
  linkedin_url character varying(500),
  twitter_url character varying(500),
  facebook_url character varying(500),
  instagram_url character varying(500),
  youtube_url character varying(500),
  website_url character varying(500),
  cv_document_url character varying(1024),
  meta_title character varying(255),
  meta_description character varying(500),
  is_published boolean DEFAULT false NOT NULL,
  owner_user_profile_id bigint,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT public_profile_pkey PRIMARY KEY (id),
  CONSTRAINT public_profile_tenant_id_key UNIQUE (tenant_id),
  CONSTRAINT fk_public_profile__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_public_profile__owner_user_profile_id FOREIGN KEY (owner_user_profile_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_public_profile__tenant_slug ON public.public_profile (tenant_id, public_slug) WHERE public_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.profile_writing (
  id bigint DEFAULT nextval('public.profile_writing_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  title character varying(500) NOT NULL,
  slug character varying(150),
  excerpt character varying(2000),
  body text,
  featured_image_url character varying(1024),
  writing_type character varying(32) NOT NULL DEFAULT 'ORIGINAL',
  external_url character varying(1024),
  publication_name character varying(255),
  published_at date,
  status character varying(32) NOT NULL DEFAULT 'DRAFT',
  display_order integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT profile_writing_pkey PRIMARY KEY (id),
  CONSTRAINT chk_profile_writing__writing_type CHECK (writing_type IN ('ORIGINAL', 'REPUBLISHED', 'EXTERNAL_LINK')),
  CONSTRAINT chk_profile_writing__status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  CONSTRAINT fk_profile_writing__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_profile_writing__tenant_slug ON public.profile_writing (tenant_id, slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profile_writing_tenant_status ON public.profile_writing (tenant_id, status);

CREATE TABLE IF NOT EXISTS public.profile_achievement (
  id bigint DEFAULT nextval('public.profile_achievement_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  title character varying(500) NOT NULL,
  description character varying(2000),
  achievement_date date,
  category character varying(32) NOT NULL DEFAULT 'OTHER',
  issuer character varying(255),
  url character varying(500),
  display_order integer,
  is_featured boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT profile_achievement_pkey PRIMARY KEY (id),
  CONSTRAINT chk_profile_achievement__category CHECK (category IN ('AWARD', 'HONOR', 'SPEAKING', 'EDUCATION', 'OTHER')),
  CONSTRAINT fk_profile_achievement__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profile_achievement_tenant ON public.profile_achievement (tenant_id);

CREATE TABLE IF NOT EXISTS public.profile_affiliation (
  id bigint DEFAULT nextval('public.profile_affiliation_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  organization_name character varying(255) NOT NULL,
  role character varying(255),
  description character varying(2000),
  start_date date,
  end_date date,
  logo_url character varying(1024),
  url character varying(500),
  display_order integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT profile_affiliation_pkey PRIMARY KEY (id),
  CONSTRAINT fk_profile_affiliation__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profile_affiliation_tenant ON public.profile_affiliation (tenant_id);

CREATE TABLE IF NOT EXISTS public.profile_media_asset (
  id bigint DEFAULT nextval('public.profile_media_asset_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  title character varying(500) NOT NULL,
  description character varying(2000),
  file_url character varying(1024) NOT NULL,
  file_type character varying(64),
  file_size_bytes bigint,
  display_order integer,
  is_downloadable boolean DEFAULT true NOT NULL,
  requires_email boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT profile_media_asset_pkey PRIMARY KEY (id),
  CONSTRAINT fk_profile_media_asset__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profile_media_asset_tenant ON public.profile_media_asset (tenant_id);
