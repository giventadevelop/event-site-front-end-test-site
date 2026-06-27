## User Profile Management: Multi‑Tenant Mapping, Status/Roles, and Admin Scoping

### Purpose
Concise reference for how the app maps users to tenants, manages per‑tenant activation/suspension and roles, and how admin access is determined across satellite domains.

### What exists today

- **Tenant mapping via DTO + proxies**
  - `tenantId` is present on DTOs and injected automatically in API bodies; list queries automatically add `tenantId.equals`.
  - Code references:

```51:57:src/lib/proxyHandler.ts
        if (isListEndpoint && !Array.from(qs.keys()).includes('tenantId.equals')) {
          qs.append('tenantId.equals', tenantId);
        }
```

```124:136:src/lib/proxyHandler.ts
        if (injectTenantId && payload && typeof payload === 'object') {
          if (Array.isArray(payload)) {
            payload = payload.map(item =>
              typeof item === 'object' && item !== null ? withTenantId(item) : item
            );
          } else {
            payload = withTenantId(payload);
          }
        }
```

```19:27:src/types/index.ts
export interface UserProfileDTO {
  id: number;
  tenantId?: string;
  userId: string;
```

- **Per‑tenant activation/suspension and role editing (Admin UI)**
  - Admin page updates `userStatus` and `userRole` for the current tenant; server actions always include `tenantId`.
  - Code references:

```199:217:src/app/admin/manage-usage/ManageUsageClient.tsx
            <label className="block font-semibold mb-1">Role</label>
            <select className="w-full border rounded px-3 py-2" value={form.userRole || ''} onChange={e => setForm(f => ({ ...f, userRole: e.target.value }))}>
              <option value="">Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
```

```64:71:src/app/admin/manage-usage/ApiServerActions.ts
  const finalPayload = {
    ...payload,
    id: userId,
    tenantId: getTenantId(),
  };
```

- **Clerk webhooks seed defaults**
  - New/updated users default to `userRole: 'MEMBER'`, `userStatus: 'pending'`, with the current `tenantId`.
  - Code reference:

```249:256:src/app/api/webhooks/clerk/route.ts
            userRole: 'MEMBER',
            userStatus: 'pending',
            tenantId: getTenantId(),
            updatedAt: new Date().toISOString(),
```

### Current admin gating

- **Client header uses Clerk role/org (not tenant‑aware)**
  - Admin menu visibility is determined from Clerk `publicMetadata.role` or the first Organization membership.

```124:131:src/components/Header.tsx
      const isAdminUser =
        publicRole === 'admin' ||
        publicRole === 'administrator' ||
        orgRole === 'admin' ||
        orgRole === 'org:admin';
      setIsAdmin(isAdminUser);
```

### Important limitation (cross‑tenant roles)

- The database enforces a global unique constraint on `user_id` in `user_profile`. This blocks having separate per‑tenant profiles (and thus per‑tenant roles) for the same Clerk user under a single backend.

```2150:2155:code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql
ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT ux_user_profile__user_id UNIQUE (user_id);
```

### What this means

- If each domain is a separate frontend deployment with a different `NEXT_PUBLIC_TENANT_ID`, current behavior works per deployment: status/role updates apply to that deployment’s tenant.
- If a single backend must support multiple tenants with the same Clerk user having different roles per tenant, the current unique constraint prevents separate rows by tenant.

### Recommendations (to support per‑tenant admin for the same user)

1) Backend schema change (in malayalees-us-site-boot)
   - Replace the global unique on `user_id` with a composite unique on `(tenant_id, user_id)`.

```sql
-- Example migration (PostgreSQL)
ALTER TABLE public.user_profile
  DROP CONSTRAINT IF EXISTS ux_user_profile__user_id;

-- Optional: backfill or validate tenant_id NOT NULL if required by your model
-- ALTER TABLE public.user_profile ALTER COLUMN tenant_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_profile__tenant_user
  ON public.user_profile(tenant_id, user_id);
```

2) Frontend admin gating by tenant‑scoped profile (server‑verified)
   - Prefer checking the user’s `userRole` for the current tenant on the server and pass that to the client UI.
   - Example lookup: `/api/proxy/user-profiles/by-user/${userId}?tenantId.equals=<currentTenantId>` and check `userRole==='ADMIN'`.

3) Optional Clerk alignment per domain
   - If you rely on Clerk Organizations per domain, map each domain to its own Organization, and persist `clerk_org_id`/`clerk_org_role` in the profile on webhook update for audit/visibility.

### Quick references

- Tenant ID utilities and proxy handler: `src/lib/env.ts`, `src/lib/withTenantId.ts`, `src/lib/proxyHandler.ts`
- Admin manage users: `src/app/admin/manage-usage/`
- Clerk webhooks: `src/app/api/webhooks/clerk/route.ts`
- SQL schema snapshot: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

### Summary

- Per‑tenant activation/suspension and role editing are implemented and tenant‑scoped in proxies/DTOs.
- Admin visibility currently uses Clerk metadata/organization on the client and is not tenant‑aware by default.
- To differentiate roles for the same user across tenants under one backend, adopt a composite unique `(tenant_id, user_id)` and gate admin access via the tenant‑scoped profile.


