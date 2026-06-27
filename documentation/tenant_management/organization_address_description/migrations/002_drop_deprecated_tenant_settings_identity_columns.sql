-- Organization Address & Description — v2.1 cleanup (run AFTER v2.0 deploy + verification window)
-- Prerequisites:
--   1. All tenants have org address/description populated OR public UI uses org-first fallback verified
--   2. No clients PATCH tenant_settings address/description fields
-- See database_schema_enhancements_prd.html §7

ALTER TABLE public.tenant_settings
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS city,
    DROP COLUMN IF EXISTS address_line_1,
    DROP COLUMN IF EXISTS address_line_2,
    DROP COLUMN IF EXISTS state_province,
    DROP COLUMN IF EXISTS zip_code,
    DROP COLUMN IF EXISTS country;
