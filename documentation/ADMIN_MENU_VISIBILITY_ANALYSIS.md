# Admin Menu Visibility Analysis

## 🔍 Current Criteria for Showing Admin Menu

### How Admin Menu Visibility is Determined

The admin menu in the Header component uses a **two-tier check**:

#### **Tier 1: Server-Side Check (Primary - Used if Available)**

**Location**: `src/app/layout.tsx` (lines 97-206)

**Query Logic**:
```typescript
// Step 1: Query by userId + tenantId
const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${userId}&tenantId.equals=${tenantId}&size=1`;

// Step 2: If not found, query by email + tenantId
const emailCheckUrl = `${baseUrl}/api/proxy/user-profiles?email.equals=${userEmail}&tenantId.equals=${tenantId}&size=1`;

// Step 3: Check admin status
isTenantAdmin = p?.userRole === 'ADMIN';
```

**Criteria**:
1. ✅ **Must match `userId`** (Clerk user ID: `user_2vVLxhPnsIPGYf6qpfozk383Slr`)
2. ✅ **Must match `tenantId`** (from `NEXT_PUBLIC_TENANT_ID` env var)
3. ✅ **Must have `userRole === 'ADMIN'`**
4. ❌ **`userStatus` does NOT matter** (PENDING_APPROVAL, APPROVED, etc. are all fine)

**Passed to Header**: `isTenantAdmin={isTenantAdmin}` prop

---

#### **Tier 2: Client-Side Fallback (If Server Check Not Available)**

**Location**: `src/components/Header.tsx` (lines 280-298)

**Fallback Logic**:
```typescript
// If isTenantAdmin prop is not provided, check Clerk metadata
const publicRole = user.publicMetadata?.role as string;
const orgRole = user.organizationMemberships?.[0]?.role;
const isAdminUser =
  publicRole === 'admin' ||
  publicRole === 'administrator' ||
  orgRole === 'admin' ||
  orgRole === 'org:admin';
```

**Criteria**:
- Checks Clerk's `publicMetadata.role` or Organization membership role
- **Does NOT check database** - only Clerk metadata

---

## 📊 Your Database Records Analysis

You have **3 records** for `giventauser@gmail.com`:

| tenant_id | user_id | user_role | user_status | Will Show Admin Menu? |
|-----------|---------|-----------|-------------|----------------------|
| `tenant_demo_001` | `user_2vVLxhPnsIPGYf6qpfozk383Slr` | `ADMIN` | `PENDING_APPROVAL` | ✅ **YES** (if tenantId matches) |
| `tenant_demo_002` | `user_2vVLxhPnsIPGYf6qpfozk383Slr` | `ADMIN` | `APPROVED` | ✅ **YES** (if tenantId matches) |
| `tenant_demo_003` | `user_2vVLxhPnsIPGYf6qpfozk383Slr` | `MEMBER` | `PENDING_APPROVAL` | ❌ **NO** (MEMBER role) |

---

## 🔎 Why Admin Menu is NOT Showing

### Most Likely Causes:

#### **1. Tenant ID Mismatch** ⚠️ **MOST LIKELY**

**Problem**: Your `NEXT_PUBLIC_TENANT_ID` environment variable doesn't match any of your database records.

**Check**:
```bash
# Check your .env.local file
echo $NEXT_PUBLIC_TENANT_ID
# Or check .env.local file directly
```

**Your Database Has**:
- `tenant_demo_001` ✅ (ADMIN role)
- `tenant_demo_002` ✅ (ADMIN role)
- `tenant_demo_003` ❌ (MEMBER role)

**If your env var is**:
- `tenant_demo_003` → ❌ No admin menu (MEMBER role)
- `tenant_demo_004` → ❌ No admin menu (no record found)
- `tenant_demo_001` → ✅ Should show admin menu
- `tenant_demo_002` → ✅ Should show admin menu

---

#### **2. Query Returning Wrong Record**

**Problem**: If multiple records exist with same `userId` but different `tenantId`, the query uses `tenantId.equals` filter, so it will only return the record matching your env var.

**Example**:
- If `NEXT_PUBLIC_TENANT_ID=tenant_demo_003` → Returns MEMBER record → No admin menu
- If `NEXT_PUBLIC_TENANT_ID=tenant_demo_001` → Returns ADMIN record → Should show admin menu

---

#### **3. Server-Side Query Failing**

**Problem**: The API call in `layout.tsx` might be failing silently.

**Check**: Look for console logs:
```
[Layout] Found existing profile. Admin status: true/false
```

If you don't see this log, the query might be failing.

---

#### **4. Clerk Metadata Fallback Not Working**

**Problem**: If server-side check fails, it falls back to Clerk metadata, but Clerk doesn't have admin role set.

**Check**: Clerk's `publicMetadata.role` or Organization membership role is not set to 'admin'.

---

## 🔍 How to Diagnose

### Step 1: Check Your Tenant ID

```bash
# Check what tenant ID is configured
grep NEXT_PUBLIC_TENANT_ID .env.local
```

### Step 2: Check Server Logs

Look for these logs in your server console:
```
[Layout] Found existing profile. Admin status: true
```
or
```
[Layout] Found existing profile. Admin status: false
```

### Step 3: Check Browser Console

Look for:
```
[Header] Auth state: {isLoaded: true, userId: 'user_2vVLxhPnsIPGYf6qpfozk383Slr', ...}
```

### Step 4: Verify Query

The query being made is:
```
GET /api/proxy/user-profiles?userId.equals=user_2vVLxhPnsIPGYf6qpfozk383Slr&tenantId.equals=<YOUR_TENANT_ID>&size=1
```

Check Network tab in browser DevTools to see:
1. What `tenantId` is being used
2. What record is being returned
3. What `userRole` value is in the response

---

## 📋 Summary

### Criteria Used (In Order):

1. **Server-Side Check** (Primary):
   - ✅ Query: `userId.equals` + `tenantId.equals`
   - ✅ Check: `userRole === 'ADMIN'`
   - ❌ **Does NOT check `userStatus`** (PENDING_APPROVAL is fine)

2. **Client-Side Fallback** (If server check unavailable):
   - ✅ Check: Clerk `publicMetadata.role === 'admin'`
   - ✅ Check: Organization `role === 'admin'`

### Why It's Not Showing:

**Most Likely**: Your `NEXT_PUBLIC_TENANT_ID` environment variable is set to:
- `tenant_demo_003` (MEMBER role) ❌
- Or a tenant ID that doesn't exist in your database ❌

**Solution**: Set `NEXT_PUBLIC_TENANT_ID` to either:
- `tenant_demo_001` ✅ (ADMIN role, PENDING_APPROVAL status)
- `tenant_demo_002` ✅ (ADMIN role, APPROVED status)

---

## 🎯 Key Points

1. **`userStatus` does NOT affect admin menu visibility** - Only `userRole` matters
2. **Tenant ID must match** - The query filters by `tenantId.equals`
3. **Multiple records are OK** - As long as the one matching your tenant ID has `ADMIN` role
4. **Server-side check takes precedence** - If `isTenantAdmin` prop is passed, it's used

---

## 🔧 To Fix (If Needed)

1. **Check your `.env.local`**:
   ```bash
   NEXT_PUBLIC_TENANT_ID=tenant_demo_001  # or tenant_demo_002
   ```

2. **Restart your dev server** after changing env vars

3. **Check server logs** for the admin status check

4. **Verify in browser Network tab** what record is being returned

---

**Last Updated**: 2025-01-22


