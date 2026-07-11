-- Profile Audience CRM v2 — incremental migration
-- Apply via Liquibase in event-site-manager-service; canonical DDL in Latest_Schema_Post__Blob_Claude_12.sql

CREATE SEQUENCE IF NOT EXISTS public.profile_audience_contact_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.profile_audience_contact (
  id bigint DEFAULT nextval('public.profile_audience_contact_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  public_profile_id bigint NOT NULL,
  email character varying(255) NOT NULL,
  first_name character varying(255),
  last_name character varying(255),
  source character varying(32) NOT NULL DEFAULT 'ADMIN_MANUAL',
  opt_in_status character varying(32) NOT NULL DEFAULT 'OPTED_IN',
  unsubscribe_token character varying(64),
  notes character varying(500),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT profile_audience_contact_pkey PRIMARY KEY (id),
  CONSTRAINT profile_audience_contact_tenant_email_key UNIQUE (tenant_id, email),
  CONSTRAINT chk_profile_audience_contact__source CHECK (
    source IN ('SUBSCRIBE_FORM', 'CONTACT_FORM', 'CSV_IMPORT', 'GATED_DOWNLOAD', 'ADMIN_MANUAL')
  ),
  CONSTRAINT chk_profile_audience_contact__opt_in_status CHECK (
    opt_in_status IN ('OPTED_IN', 'OPTED_OUT', 'PENDING')
  ),
  CONSTRAINT fk_profile_audience_contact__tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_profile_audience_contact__public_profile_id FOREIGN KEY (public_profile_id)
    REFERENCES public.public_profile(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profile_audience_contact_profile ON public.profile_audience_contact (public_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_audience_contact_tenant_opt_in ON public.profile_audience_contact (tenant_id, opt_in_status);
