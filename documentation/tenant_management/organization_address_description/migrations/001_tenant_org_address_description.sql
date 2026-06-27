-- Organization Address & Description — schema migration v2.0
-- Source of truth: tenant_organization ONLY
-- See documentation/tenant_management/organization_address_description/database_schema_enhancements_prd.html

-- Step 1: Add identity columns to tenant_organization (canonical)
ALTER TABLE public.tenant_organization
    ADD COLUMN IF NOT EXISTS description varchar(1000) NULL,
    ADD COLUMN IF NOT EXISTS address_line_1 varchar(255) NULL,
    ADD COLUMN IF NOT EXISTS address_line_2 varchar(255) NULL,
    ADD COLUMN IF NOT EXISTS city varchar(255) NULL,
    ADD COLUMN IF NOT EXISTS state_province varchar(255) NULL,
    ADD COLUMN IF NOT EXISTS zip_code varchar(20) NULL,
    ADD COLUMN IF NOT EXISTS country varchar(100) NULL,
    ADD COLUMN IF NOT EXISTS website_url varchar(1024) NULL;

COMMENT ON COLUMN public.tenant_organization.description IS
    'Canonical long-form organization description (max 1000 chars). Source of truth — do not duplicate on tenant_settings.';
COMMENT ON COLUMN public.tenant_organization.address_line_1 IS 'Canonical primary street address line.';
COMMENT ON COLUMN public.tenant_organization.address_line_2 IS 'Canonical secondary address line.';
COMMENT ON COLUMN public.tenant_organization.city IS 'Canonical city or locality.';
COMMENT ON COLUMN public.tenant_organization.state_province IS 'Canonical state, province, or region.';
COMMENT ON COLUMN public.tenant_organization.zip_code IS 'Canonical ZIP or postal code.';
COMMENT ON COLUMN public.tenant_organization.country IS 'Canonical country name (free text).';
COMMENT ON COLUMN public.tenant_organization.website_url IS 'Canonical public website URL for the organization.';

-- Step 2: Migrate legacy tenant_settings identity data into tenant_organization (fill gaps only)
UPDATE public.tenant_organization o
SET
    address_line_1 = COALESCE(o.address_line_1, s.address_line_1),
    address_line_2 = COALESCE(o.address_line_2, s.address_line_2),
    city = COALESCE(o.city, s.city),
    state_province = COALESCE(o.state_province, s.state_province),
    zip_code = COALESCE(o.zip_code, s.zip_code),
    country = COALESCE(o.country, s.country),
    description = COALESCE(o.description, s.description),
    updated_at = NOW()
FROM public.tenant_settings s
WHERE s.tenant_id = o.tenant_id
  AND (
    o.address_line_1 IS NULL OR o.address_line_2 IS NULL OR o.city IS NULL
    OR o.state_province IS NULL OR o.zip_code IS NULL OR o.country IS NULL
    OR o.description IS NULL
  )
  AND (
    s.address_line_1 IS NOT NULL OR s.address_line_2 IS NOT NULL OR s.city IS NOT NULL
    OR s.state_province IS NOT NULL OR s.zip_code IS NOT NULL OR s.country IS NOT NULL
    OR s.description IS NOT NULL
  );

-- Step 3: Mark tenant_settings identity columns as deprecated (columns retained for read fallback until v2.1 DROP)
COMMENT ON COLUMN public.tenant_settings.address_line_1 IS 'DEPRECATED v2.0 — use tenant_organization.address_line_1. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.address_line_2 IS 'DEPRECATED v2.0 — use tenant_organization.address_line_2. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.city IS 'DEPRECATED v2.0 — use tenant_organization.city. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.state_province IS 'DEPRECATED v2.0 — use tenant_organization.state_province. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.zip_code IS 'DEPRECATED v2.0 — use tenant_organization.zip_code. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.country IS 'DEPRECATED v2.0 — use tenant_organization.country. Read fallback only; do not PATCH.';

-- If v1.0 added description on tenant_settings, deprecate it (column may not exist on all envs)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tenant_settings' AND column_name = 'description'
    ) THEN
        EXECUTE $c$COMMENT ON COLUMN public.tenant_settings.description IS
            'DEPRECATED v2.0 — use tenant_organization.description. Read fallback only; do not PATCH.'$c$;
    END IF;
END $$;
