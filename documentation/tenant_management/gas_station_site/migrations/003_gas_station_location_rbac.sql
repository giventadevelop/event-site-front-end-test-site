-- Gas station location-scoped RBAC — incremental migration
-- Links user_profile rows to gas_station_location for GAS_STATION_MANAGER access.
-- SUPER_ADMIN / ADMIN / GAS_STATION_ADMIN: all locations in tenant (no junction rows required).
-- Apply via Liquibase in event-site-manager-service after 001_gas_station_site.sql.

CREATE SEQUENCE IF NOT EXISTS public.gas_station_user_station_assignment_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.gas_station_user_station_assignment (
  id bigint DEFAULT nextval('public.gas_station_user_station_assignment_id_seq'::regclass) NOT NULL,
  tenant_id character varying(255) NOT NULL,
  user_profile_id bigint NOT NULL,
  station_id bigint NOT NULL,
  assigned_by_user_profile_id bigint,
  notes character varying(500),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT gas_station_user_station_assignment_pkey PRIMARY KEY (id),
  CONSTRAINT ux_gas_station_user_station_assignment__tenant_user_station UNIQUE (tenant_id, user_profile_id, station_id),
  CONSTRAINT fk_gas_station_user_station_assignment__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_gas_station_user_station_assignment__user_profile FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE,
  CONSTRAINT fk_gas_station_user_station_assignment__station FOREIGN KEY (station_id) REFERENCES public.gas_station_location(id) ON DELETE CASCADE,
  CONSTRAINT fk_gas_station_user_station_assignment__assigned_by FOREIGN KEY (assigned_by_user_profile_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gas_station_user_station_assignment_tenant_user
  ON public.gas_station_user_station_assignment (tenant_id, user_profile_id);

CREATE INDEX IF NOT EXISTS idx_gas_station_user_station_assignment_tenant_station
  ON public.gas_station_user_station_assignment (tenant_id, station_id);

COMMENT ON TABLE public.gas_station_user_station_assignment IS
  'Junction: which gas_station_location rows a GAS_STATION_MANAGER may access. Tenant owners (SUPER_ADMIN, ADMIN, GAS_STATION_ADMIN) see all locations without rows here.';

COMMENT ON COLUMN public.gas_station_user_station_assignment.assigned_by_user_profile_id IS
  'Admin who granted this assignment (audit).';
