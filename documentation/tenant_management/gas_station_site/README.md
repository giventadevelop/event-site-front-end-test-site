# Gas Station AI COO — Site Type Documentation

Feasibility assessment and database design for onboarding gas-station / convenience-store clients (the "AI Gas Station COO" concept from `E:\Categories\Categories\Software_Projects\Gas_Station_AI`) as `GAS_STATION` tenants in this platform.

| Document | Contents |
|---|---|
| [`gas_station_site_feasibility.md`](gas_station_site_feasibility.md) | Verdict, architecture split (platform vs external AI engine), two-layer site-type mapping, schema summary, **multi-station (chain) design** (section 4.4), backend/frontend plan, iterative loops, risks |
| [`migrations/001_gas_station_site.sql`](migrations/001_gas_station_site.sql) | Incremental DDL against `Latest_Schema_Post__Blob_Claude_12.sql`: `GAS_STATION` in `site_type` enum, `tenant_settings` engine-config columns, and 4 new tables (`gas_station_location`, `gas_station_integration`, `gas_station_daily_metrics`, `gas_station_recommendation`) |
| [`gas_station_subscription_billing.md`](gas_station_subscription_billing.md) | Per-location subscription requirement (graduated volume tiers, location selection), Stripe vs Zoho/Chargebee/Paddle analysis, ACH support, billing dashboard spec |
| [`migrations/002_gas_station_billing.sql`](migrations/002_gas_station_billing.sql) | `tenant_organization.stripe_subscription_id` + `gas_station_location.included_in_subscription` |

**Core decision:** client management, subscription billing, and the daily dashboard UI live in this platform; data connectors, forecasting models, and the LLM run in a separately deployed AI engine that writes curated results back through the tenant-scoped REST API.

## Implementation status (2026-07-03)

| Layer | Status |
|---|---|
| Canonical schema (`Latest_Schema_Post__Blob_Claude_12.sql`) | ✅ site_type incl. GAS_STATION, tenant_settings gas + profile columns, 4 gas tables + 5 profile tables, sequences + setvals folded in |
| Backend (`event-site-manager-service`) | ✅ SiteType enum, TenantSettings gas fields, 4 vertical slices (entity/repo/service/criteria/queryService/DTO/mapper/resource), Liquibase `20260703130000_gas_station_module.xml` |
| Frontend types + proxy | ✅ `src/types/gasStation.ts`, GAS_STATION in `TenantSiteType`, 4 proxy route pairs under `src/pages/api/proxy/gas-station-*` |
| Tenant-management UI | ✅ Site Type dropdown on org form (presets auto-applied on change), profile section toggles + Gas Station AI Engine config in settings form |
| Admin module `/admin/gas-station` | ✅ Daily brief dashboard (date + station switcher with All-stations rollup, chain-level recs first, Accept/Dismiss/Done + feedback), Stations CRUD, Integrations registry, Compare view; hub tile gated by `enableGasStationModule` |
| External AI engine | ⬜ Separate project — writes back via `/api/gas-station-daily-metrics` and `/api/gas-station-recommendations` with a service JWT |
