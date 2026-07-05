-- Gas station subscription billing — incremental migration
-- See gas_station_subscription_billing.md. One Stripe subscription per tenant;
-- quantity = COUNT of stations WHERE is_active AND included_in_subscription.

ALTER TABLE public.tenant_organization
  ADD COLUMN IF NOT EXISTS stripe_subscription_id character varying(255);

COMMENT ON COLUMN public.tenant_organization.stripe_subscription_id IS 'Stripe subscription id for the tenant platform subscription (gas station per-location billing). Customer id lives in stripe_customer_id.';

ALTER TABLE public.gas_station_location
  ADD COLUMN IF NOT EXISTS included_in_subscription boolean DEFAULT true NOT NULL;

COMMENT ON COLUMN public.gas_station_location.included_in_subscription IS 'Owner opt-in: when true and is_active, this location counts toward the Stripe subscription quantity (graduated per-location pricing).';
