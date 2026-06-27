-- Full DDL for payment_provider_config table with triple validation unique constraint
-- This ensures that each combination of (tenant_id, payment_method_domain_id, webhook_secret_encrypted) is unique

CREATE TABLE IF NOT EXISTS public.payment_provider_config (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    provider_name character varying(50) NOT NULL,
    payment_use_case character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    supports_acp boolean DEFAULT false NOT NULL,
    supports_zeffy boolean DEFAULT false NOT NULL,
    supports_zelle boolean DEFAULT false NOT NULL,
    supports_revolut boolean DEFAULT false NOT NULL,
    provider_api_key_encrypted text,
    provider_secret_key_encrypted text,
    webhook_secret_encrypted text,
    payment_method_domain_id varchar,
    publishable_key character varying(500),
    fallback_order integer DEFAULT 0,
    configuration_json text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,

    -- Primary key constraint
    CONSTRAINT payment_provider_config_pkey PRIMARY KEY (id),

    -- Check constraints
    CONSTRAINT check_provider_name CHECK ((provider_name IN ('STRIPE', 'PAYPAL', 'ZEFFY', 'ZELLE_MANUAL', 'REVOLUT', 'CEFI_CHARITY', 'GIVEBUTTER'))),
    CONSTRAINT check_payment_use_case CHECK ((payment_use_case IS NULL OR payment_use_case IN ('TICKET_SALE', 'DONATION', 'DONATION_CEFI', 'DONATION_ZERO_FEE', 'OFFERING', 'MEMBERSHIP_SUBSCRIPTION'))),

    -- Unique constraints
    CONSTRAINT unique_tenant_provider UNIQUE (tenant_id, provider_name),

    -- CRITICAL: Triple validation unique constraint
    -- Ensures that each combination of (tenant_id, payment_method_domain_id, webhook_secret_encrypted) is unique
    -- This prevents duplicate webhook configurations and enables triple validation in webhook processing
    CONSTRAINT unique_tenant_payment_domain_webhook UNIQUE (tenant_id, payment_method_domain_id, webhook_secret_encrypted)
);

-- Create index for faster lookups on triple combination (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_payment_provider_config_triple_validation
ON public.payment_provider_config (tenant_id, payment_method_domain_id, webhook_secret_encrypted);

-- Comments for documentation
COMMENT ON TABLE public.payment_provider_config IS 'Stores payment provider configuration for each tenant, including Stripe webhook secrets and payment method domain IDs';
COMMENT ON COLUMN public.payment_provider_config.payment_method_domain_id IS 'Stripe Payment Method Domain ID (pmd_*) - used for triple validation with tenant_id and webhook_secret_encrypted';
COMMENT ON COLUMN public.payment_provider_config.webhook_secret_encrypted IS 'Encrypted Stripe webhook secret - used for triple validation with tenant_id and payment_method_domain_id';
COMMENT ON CONSTRAINT unique_tenant_payment_domain_webhook ON public.payment_provider_config IS 'Ensures each combination of (tenant_id, payment_method_domain_id, webhook_secret_encrypted) is unique. Required for triple validation in webhook processing.';

