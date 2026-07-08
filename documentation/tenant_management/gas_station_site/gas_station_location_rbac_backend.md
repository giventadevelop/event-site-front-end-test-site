# Gas Station Location RBAC — Backend Handoff

**Version:** 1.0 · **2026-07-07  
**Repo:** `event-site-manager-service` (Spring Boot / JHipster)  
**Frontend:** `mosc-temp` (already implements client-side filtering + assignment UI)

## Summary

Location-scoped access for the gas station COO module was **not** in v1 schema. Migration `003_gas_station_location_rbac.sql` adds a junction table and two new `user_role` values used by the frontend.

## Role matrix (per tenant)

| `user_profile.user_role` | Gas module access | Locations visible |
|--------------------------|-------------------|-------------------|
| `SUPER_ADMIN` | Yes (+ full admin) | All in tenant |
| `ADMIN` | Yes (+ full admin) | All in tenant |
| `GAS_STATION_ADMIN` | Yes (gas module only*) | All in tenant |
| `GAS_STATION_MANAGER` | Yes (gas module only*) | Rows in `gas_station_user_station_assignment` only |
| Other roles | No | — |

\*Gas-only roles are routed to `/admin/gas-station/*` by the Next.js admin layout; they cannot open other admin pages.

**No junction rows** are required for all-locations roles. Managers **must** have ≥1 assignment row to see station data (empty assignment = empty dashboard).

## Database

Apply `documentation/tenant_management/gas_station_site/migrations/003_gas_station_location_rbac.sql` via Liquibase after `001_gas_station_site.sql`.

### Table: `gas_station_user_station_assignment`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | sequence `gas_station_user_station_assignment_id_seq` |
| `tenant_id` | varchar(255) FK → `tenant_organization` | required |
| `user_profile_id` | bigint FK → `user_profile` | required |
| `station_id` | bigint FK → `gas_station_location` | required |
| `assigned_by_user_profile_id` | bigint FK → `user_profile` | nullable audit |
| `notes` | varchar(500) | optional |
| `created_at`, `updated_at` | timestamptz | required |

**Unique:** `(tenant_id, user_profile_id, station_id)`

## REST API (new resource)

Base path: `/api/gas-station-user-station-assignments`

Standard JHipster vertical slice (entity → repository → criteria → DTO → mapper → REST), matching existing gas station resources.

### DTO (camelCase — mirror `src/types/gasStation.ts`)

```typescript
interface GasStationUserStationAssignmentDTO {
  id?: number | null;
  tenantId: string;
  userProfileId: number;
  stationId: number;
  assignedByUserProfileId?: number | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Criteria filters (GET list)

- `tenantId.equals` (required for multi-tenant)
- `userProfileId.equals`
- `stationId.equals`

### Authorization (backend — **required**)

Service layer must enforce location scope on **all** gas station read/write endpoints when the authenticated Clerk user maps to a profile with `user_role = GAS_STATION_MANAGER`:

1. Resolve `user_profile` from Clerk user id + `X-Tenant-ID` / tenant context.
2. If role ∈ `{SUPER_ADMIN, ADMIN, GAS_STATION_ADMIN}` → allow all tenant locations.
3. If role = `GAS_STATION_MANAGER` → load assignment `station_id` set; **reject** (403) or filter list results to assigned stations only.
4. If role is anything else → 403 on gas station admin APIs.

Apply the same rule to:

- `/api/gas-station-locations`
- `/api/gas-station-integrations`
- `/api/gas-station-daily-metrics`
- `/api/gas-station-recommendations`
- `/api/gas-station-user-station-assignments` (managers: read own rows only; mutations forbidden)

Assignment **create/update/delete** → only roles with all-locations scope.

### Validation rules

- `user_profile_id` and `station_id` must belong to the same `tenant_id`.
- On POST, reject duplicate `(tenant_id, user_profile_id, station_id)`.
- On POST/PATCH, verify target user's `user_role` is `GAS_STATION_MANAGER` (optional but recommended).

## Frontend integration (already in `mosc-temp`)

| File | Purpose |
|------|---------|
| `src/lib/gasStationAccess.ts` | Role helpers + list filters |
| `src/app/admin/gas-station/gasStationAccessServer.ts` | Resolve access + CRUD assignments |
| `src/app/admin/gas-station/access/` | Admin UI to map managers → stations |
| `src/pages/api/proxy/gas-station-user-station-assignments/` | Proxy routes |
| `src/app/admin/layout.tsx` | Gas staff allowed on `/admin/gas-station/*` only |

**Note:** Frontend filters data defensively; **backend enforcement is mandatory** for security.

## Liquibase suggestion

```xml
<changeSet id="20260707120000_gas_station_location_rbac" author="mosc-temp">
  <sqlFile path="documentation/tenant_management/gas_station_site/migrations/003_gas_station_location_rbac.sql"
           relativeToChangelogFile="false" splitStatements="false"/>
</changeSet>
```

## Testing checklist

1. Seed `demo_gas_station_001` with 3 stations.
2. Create user A: `GAS_STATION_ADMIN` → GET all locations/metrics.
3. Create user B: `GAS_STATION_MANAGER` + assign stations 1,2 → GET only those; station 3 → 403 on direct id.
4. User B cannot POST new location or assignment for another user.
5. User B cannot access non-gas admin routes (Clerk + Next layout).
