-- Migration script: Refactor discount_code for per-event, per-tenant support
-- This script migrates existing discount codes and relationships to the new structure

BEGIN;

-- 1. Add event_id and tenant_id columns to discount_code (if not already present)
ALTER TABLE public.discount_code ADD COLUMN IF NOT EXISTS event_id bigint;
ALTER TABLE public.discount_code ADD COLUMN IF NOT EXISTS tenant_id character varying(255);

-- 2. Populate event_id for each discount_code using event_discount_code (assumes 1:1 mapping)
UPDATE public.discount_code dc
SET event_id = edc.event_id
FROM public.event_discount_code edc
WHERE dc.id = edc.discount_code_id;

-- 3. Populate tenant_id for each discount_code using event_details
UPDATE public.discount_code dc
SET tenant_id = ed.tenant_id
FROM public.event_details ed
WHERE dc.event_id = ed.id;

-- 4. Set NOT NULL constraints (if all rows are now populated)
ALTER TABLE public.discount_code ALTER COLUMN event_id SET NOT NULL;
ALTER TABLE public.discount_code ALTER COLUMN tenant_id SET NOT NULL;

-- 5. Add foreign key constraints inline (if not already present)
ALTER TABLE public.discount_code
  ADD CONSTRAINT fk_discount_code_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_discount_code_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant_settings(tenant_id) ON DELETE CASCADE;

-- 6. Add unique constraint for (code, event_id, tenant_id)
ALTER TABLE public.discount_code
  ADD CONSTRAINT discount_code_code_event_tenant_unique UNIQUE (code, event_id, tenant_id);

-- 7. Drop old join tables
DROP TABLE IF EXISTS public.event_discount_code CASCADE;
DROP TABLE IF EXISTS public.rel_event_details__discount_codes CASCADE;

COMMIT;

-- End of migration script