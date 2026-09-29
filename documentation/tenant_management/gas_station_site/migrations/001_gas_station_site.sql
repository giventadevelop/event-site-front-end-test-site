-- Gas Station AI COO site type — incremental migration for existing deployments
-- Written against code_html_template/SQLS/Current_Sqls/Event_Site_Manager_Latest_Schema.sql
-- Composes with documentation/tenant_management/personal_profile_site/migrations/001_personal_profile_site.sql:
--   both add tenant_organization.site_type idempotently; this migration recreates the CHECK
--   constraint with the superset enum, so apply order does not matter.
-- Apply via Liquibase in event-site-manager-service; fold into the canonical schema file once approved.

-- =====================================================================
-- 1. tenant_organization.site_type — add GAS_STATION to the archetype enum
-- =====================================================================

ALTER TABLE public.tenant_organization
  ADD COLUMN IF NOT EXISTS site_type character varying(32) DEFAULT 'EVENT_ORG' NOT NULL,
  ADD COLUMN IF NOT EXISTS site_template_version character varying(32);

ALTER TABLE public.tenant_organization
  DROP CONSTRAINT IF EXISTS chk_tenant_organization__site_type;

ALTER TABLE public.tenant_organization
  ADD CONSTRAINT chk_tenant_organization__site_type CHECK (
    site_type IN ('EVENT_ORG', 'SPORTS_TEAM', 'MUSIC_BAND', 'CHURCH_ORG', 'PERSONAL_PROFILE', 'HYBRID', 'GAS_STATION')
  );

-- =====================================================================
-- 2. tenant_settings — gas station module enablement + AI engine config
--    (credentials stored as secrets-manager references, not raw secrets)
-- =====================================================================

ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS enable_gas_station_module boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS gas_ai_engine_base_url character varying(1024),
  ADD COLUMN IF NOT EXISTS gas_ai_engine_api_key_ref character varying(512),
  ADD COLUMN IF NOT EXISTS gas_ai_engine_webhook_token character varying(1048),
  ADD COLUMN IF NOT EXISTS gas_daily_brief_hour_local smallint;

ALTER TABLE public.tenant_settings
  DROP CONSTRAINT IF EXISTS chk_tenant_settings__gas_brief_hour;

ALTER TABLE public.tenant_settings
  ADD CONSTRAINT chk_tenant_settings__gas_brief_hour CHECK (
    gas_daily_brief_hour_local IS NULL OR (gas_daily_brief_hour_local >= 0 AND gas_daily_brief_hour_local <= 23)
  );

COMMENT ON COLUMN public.tenant_settings.enable_gas_station_module IS 'Master on/off for the gas station COO admin module for this tenant.';
COMMENT ON COLUMN public.tenant_settings.gas_ai_engine_base_url IS 'Base URL of the external AI engine deployment serving this tenant (invoked server-side only).';
COMMENT ON COLUMN public.tenant_settings.gas_ai_engine_api_key_ref IS 'Secrets-manager reference to the API key for calling the AI engine. Never store the raw key.';
COMMENT ON COLUMN public.tenant_settings.gas_ai_engine_webhook_token IS 'Token the AI engine presents on write-back callbacks for verification.';
COMMENT ON COLUMN public.tenant_settings.gas_daily_brief_hour_local IS 'Local hour (0-23) the morning brief is expected/delivered for this tenant.';

-- =====================================================================
-- 3. Sequences
-- =====================================================================

CREATE SEQUENCE IF NOT EXISTS public.gas_station_location_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.gas_station_integration_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.gas_station_daily_metrics_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.gas_station_recommendation_id_seq START WITH 1 INCREMENT BY 1;

-- =====================================================================
-- 4. gas_station_location — 1..N stores per tenant (single owner or chain)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.gas_station_location (
  id bigint DEFAULT nextval('public.gas_station_location_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  station_name character varying(255) NOT NULL,
  station_code character varying(64) NOT NULL,
  brand character varying(255),
  region character varying(255),
  address_line_1 character varying(255),
  address_line_2 character varying(255),
  city character varying(255),
  state_province character varying(255),
  zip_code character varying(20),
  country character varying(100),
  latitude numeric(10,7),
  longitude numeric(10,7),
  timezone character varying(64) DEFAULT 'America/New_York' NOT NULL,
  sells_fuel boolean DEFAULT true NOT NULL,
  fuel_dispenser_count integer,
  has_car_wash boolean DEFAULT false NOT NULL,
  has_foodservice boolean DEFAULT false NOT NULL,
  has_lottery boolean DEFAULT false NOT NULL,
  is_24_hours boolean DEFAULT false NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT gas_station_location_pkey PRIMARY KEY (id),
  CONSTRAINT ux_gas_station_location__tenant_code UNIQUE (tenant_id, station_code),
  CONSTRAINT chk_gas_station_location__dispensers CHECK ((fuel_dispenser_count IS NULL) OR (fuel_dispenser_count >= 0)),
  CONSTRAINT fk_gas_station_location__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gas_station_location_tenant ON public.gas_station_location (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gas_station_location_tenant_region ON public.gas_station_location (tenant_id, region);

COMMENT ON TABLE public.gas_station_location IS 'Physical store locations owned by a GAS_STATION tenant. One tenant (paying customer) owns 1..N stations; all dashboards are station-scoped or tenant-rollup.';
COMMENT ON COLUMN public.gas_station_location.region IS 'Free-text region/district label for chain grouping and rollups (e.g. "North Bay"). Promote to a dedicated table only if per-region settings are ever needed.';
COMMENT ON COLUMN public.gas_station_location.latitude IS 'Geo latitude for competitor-proximity, weather and local-event signals used by the AI engine.';
COMMENT ON COLUMN public.gas_station_location.longitude IS 'Geo longitude — see latitude.';

-- =====================================================================
-- 5. gas_station_integration — registry of connected systems per station
--    Metadata only; the external AI engine performs the actual ingestion.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.gas_station_integration (
  id bigint DEFAULT nextval('public.gas_station_integration_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  station_id bigint NOT NULL,
  system_type character varying(32) NOT NULL,
  provider_name character varying(255),
  connection_mode character varying(32) DEFAULT 'MANUAL' NOT NULL,
  config_json text,
  credentials_ref character varying(512),
  sync_frequency character varying(32),
  last_sync_at timestamp with time zone,
  last_sync_status character varying(32),
  is_enabled boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT gas_station_integration_pkey PRIMARY KEY (id),
  CONSTRAINT chk_gas_station_integration__system_type CHECK (
    system_type IN ('POS', 'FUEL_CONTROLLER', 'INVENTORY', 'PAYROLL_SCHEDULING', 'ACCOUNTING', 'LOTTERY', 'CAR_WASH', 'FOODSERVICE', 'OTHER')
  ),
  CONSTRAINT chk_gas_station_integration__connection_mode CHECK (
    connection_mode IN ('API', 'FILE_UPLOAD', 'SFTP', 'MANUAL')
  ),
  CONSTRAINT fk_gas_station_integration__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_gas_station_integration__station_id FOREIGN KEY (station_id) REFERENCES public.gas_station_location(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gas_station_integration_tenant ON public.gas_station_integration (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gas_station_integration_station ON public.gas_station_integration (station_id);

COMMENT ON TABLE public.gas_station_integration IS 'Registry of a station''s connected source systems (POS, fuel controller, ...). Connection metadata only — raw ingestion and credentials live with the external AI engine / secrets manager.';
COMMENT ON COLUMN public.gas_station_integration.credentials_ref IS 'Secrets-manager reference for connection credentials. Never store raw credentials.';

-- =====================================================================
-- 6. gas_station_daily_metrics — curated daily aggregates per station,
--    written back by the AI engine (or entered manually pre-integration)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.gas_station_daily_metrics (
  id bigint DEFAULT nextval('public.gas_station_daily_metrics_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  station_id bigint NOT NULL,
  metric_date date NOT NULL,
  fuel_gallons_sold numeric(21,2),
  fuel_revenue_usd numeric(21,2),
  fuel_margin_cents_per_gallon numeric(8,2),
  in_store_sales_usd numeric(21,2),
  foodservice_sales_usd numeric(21,2),
  lottery_sales_usd numeric(21,2),
  transactions_count integer,
  labor_hours numeric(10,2),
  labor_cost_usd numeric(21,2),
  waste_cost_usd numeric(21,2),
  shrink_cost_usd numeric(21,2),
  expected_profit_usd numeric(21,2),
  actual_profit_usd numeric(21,2),
  metrics_json text,
  source_model_run_id character varying(128),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT gas_station_daily_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT ux_gas_station_daily_metrics__station_date UNIQUE (station_id, metric_date),
  CONSTRAINT fk_gas_station_daily_metrics__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_gas_station_daily_metrics__station_id FOREIGN KEY (station_id) REFERENCES public.gas_station_location(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gas_station_daily_metrics_tenant_date ON public.gas_station_daily_metrics (tenant_id, metric_date);

COMMENT ON TABLE public.gas_station_daily_metrics IS 'Curated per-station daily aggregates written back by the external AI engine. Raw transaction/time-series data is NOT stored in this schema.';
COMMENT ON COLUMN public.gas_station_daily_metrics.metrics_json IS 'JSON object for additional curated metrics, allowing engine payload growth without schema migrations.';

-- =====================================================================
-- 7. gas_station_recommendation — the prescriptive morning action list
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.gas_station_recommendation (
  id bigint DEFAULT nextval('public.gas_station_recommendation_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  station_id bigint,
  recommendation_date date NOT NULL,
  category character varying(32) NOT NULL,
  title character varying(500) NOT NULL,
  detail text,
  estimated_impact_usd numeric(21,2),
  priority integer,
  confidence_pct numeric(5,2),
  explanation text,
  status character varying(32) DEFAULT 'NEW' NOT NULL,
  owner_feedback character varying(2000),
  source_model_run_id character varying(128),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT gas_station_recommendation_pkey PRIMARY KEY (id),
  CONSTRAINT chk_gas_station_recommendation__category CHECK (
    category IN ('FUEL_PRICING', 'ORDERING', 'STAFFING', 'INVENTORY', 'LOSS_PREVENTION', 'MAINTENANCE', 'ANOMALY', 'COMPLIANCE', 'OTHER')
  ),
  CONSTRAINT chk_gas_station_recommendation__status CHECK (
    status IN ('NEW', 'VIEWED', 'ACCEPTED', 'DISMISSED', 'COMPLETED')
  ),
  CONSTRAINT chk_gas_station_recommendation__confidence CHECK (
    (confidence_pct IS NULL) OR (confidence_pct >= 0 AND confidence_pct <= 100)
  ),
  CONSTRAINT fk_gas_station_recommendation__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_gas_station_recommendation__station_id FOREIGN KEY (station_id) REFERENCES public.gas_station_location(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gas_station_recommendation_tenant_date ON public.gas_station_recommendation (tenant_id, recommendation_date);
CREATE INDEX IF NOT EXISTS idx_gas_station_recommendation_station_date ON public.gas_station_recommendation (station_id, recommendation_date);

COMMENT ON TABLE public.gas_station_recommendation IS 'Prescriptive daily action items produced by the external AI engine. The morning brief = rows grouped by (station_id, recommendation_date) plus the matching daily_metrics expected_profit_usd headline.';
COMMENT ON COLUMN public.gas_station_recommendation.station_id IS 'NULL = tenant/chain-level recommendation (cross-store comparison, portfolio anomaly, consolidated ordering). Non-null = specific to one station.';
COMMENT ON COLUMN public.gas_station_recommendation.explanation IS 'Plain-language "why am I being told this?" justification shown to the owner.';
COMMENT ON COLUMN public.gas_station_recommendation.owner_feedback IS 'Owner''s free-text feedback on accept/dismiss — read by the engine for its learning loop.';
