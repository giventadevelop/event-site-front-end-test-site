-- Migration script to add payment_method_domain_id column and triple validation constraint
-- Run this on existing payment_provider_config tables

-- Step 1: Add payment_method_domain_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payment_provider_config'
        AND column_name = 'payment_method_domain_id'
    ) THEN
        ALTER TABLE public.payment_provider_config
        ADD COLUMN payment_method_domain_id varchar;

        RAISE NOTICE 'Added payment_method_domain_id column';
    ELSE
        RAISE NOTICE 'Column payment_method_domain_id already exists';
    END IF;
END $$;

-- Step 2: Update existing records with Payment Method Domain IDs
-- IMPORTANT: Update these values based on your actual Stripe Payment Method Domain IDs
-- You can find these in Stripe Dashboard > Settings > Payment methods > Payment method domains

UPDATE public.payment_provider_config
SET payment_method_domain_id = 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'
WHERE tenant_id = 'tenant_demo_001'
  AND provider_name = 'STRIPE'
  AND payment_method_domain_id IS NULL
  AND payment_method_domain = 'www.mosc-temp.com';

UPDATE public.payment_provider_config
SET payment_method_domain_id = 'pmd_1RuQeUK5BrggeAHMnD3Jejvh'
WHERE tenant_id = 'tenant_demo_002'
  AND provider_name = 'STRIPE'
  AND payment_method_domain_id IS NULL
  AND payment_method_domain = 'adwiise.com';

-- Add more UPDATE statements for other tenants as needed
-- Example:
-- UPDATE public.payment_provider_config
-- SET payment_method_domain_id = 'pmd_XXXXX'
-- WHERE tenant_id = 'tenant_demo_003'
--   AND provider_name = 'STRIPE'
--   AND payment_method_domain_id IS NULL;

-- Step 3: Add triple validation unique constraint
-- This will fail if there are duplicate combinations, so ensure all records have payment_method_domain_id set first

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
        AND constraint_name = 'unique_tenant_payment_domain_webhook'
    ) THEN
        -- Check for NULL values that would violate the constraint
        IF EXISTS (
            SELECT 1
            FROM public.payment_provider_config
            WHERE payment_method_domain_id IS NULL
            AND webhook_secret_encrypted IS NOT NULL
        ) THEN
            RAISE EXCEPTION 'Cannot add constraint: Some records have NULL payment_method_domain_id. Please update all records first.';
        END IF;

        -- Check for duplicate combinations
        IF EXISTS (
            SELECT tenant_id, payment_method_domain_id, webhook_secret_encrypted
            FROM public.payment_provider_config
            WHERE payment_method_domain_id IS NOT NULL
            AND webhook_secret_encrypted IS NOT NULL
            GROUP BY tenant_id, payment_method_domain_id, webhook_secret_encrypted
            HAVING COUNT(*) > 1
        ) THEN
            RAISE EXCEPTION 'Cannot add constraint: Duplicate combinations found. Please resolve duplicates first.';
        END IF;

        ALTER TABLE public.payment_provider_config
        ADD CONSTRAINT unique_tenant_payment_domain_webhook
        UNIQUE (tenant_id, payment_method_domain_id, webhook_secret_encrypted);

        RAISE NOTICE 'Added unique_tenant_payment_domain_webhook constraint';
    ELSE
        RAISE NOTICE 'Constraint unique_tenant_payment_domain_webhook already exists';
    END IF;
END $$;

-- Step 4: Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_payment_provider_config_triple_validation
ON public.payment_provider_config (tenant_id, payment_method_domain_id, webhook_secret_encrypted);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN public.payment_provider_config.payment_method_domain_id IS 'Stripe Payment Method Domain ID (pmd_*) - used for triple validation with tenant_id and webhook_secret_encrypted';
COMMENT ON CONSTRAINT unique_tenant_payment_domain_webhook ON public.payment_provider_config IS 'Ensures each combination of (tenant_id, payment_method_domain_id, webhook_secret_encrypted) is unique. Required for triple validation in webhook processing.';

-- Verification query: Check that all STRIPE records have payment_method_domain_id set
SELECT
    tenant_id,
    provider_name,
    payment_method_domain_id,
    CASE
        WHEN payment_method_domain_id IS NULL THEN 'MISSING - Update required'
        ELSE 'OK'
    END AS status
FROM public.payment_provider_config
WHERE provider_name = 'STRIPE'
ORDER BY tenant_id;

