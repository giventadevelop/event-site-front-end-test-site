# Multi-Tenant OAuth Analysis: Same Email, Different Domains

**Date**: October 16, 2025
**Status**: Critical Architecture Decision Required

---

## Your Scenario

You have:
- **One shared backend** (domain-agnostic) ✅
- **Two separate frontend domains**:
  - `www.xyz.com` → Tenant ID: `tenant_001`
  - `www.abc.com` → Tenant ID: `tenant_002`
- **Same user email**: `giventa@gmail.com` tries to:
  1. Register on `www.xyz.com` with password
  2. Register on `www.abc.com` with same email/password
  3. Use Google OAuth to login to both domains

**Question**: Will the same email work across both domains with current infrastructure?

---

## Answer: **NO - Current Implementation Will NOT Work** ❌

### Critical Issue: Clerk Email Uniqueness

**Clerk enforces email uniqueness per Clerk application instance.**

Since you're using:
```yaml
# application-dev.yml
clerk:
  frontend-api: https://humble-monkey-3.clerk.accounts.dev  # SINGLE Clerk app
```

**Problem**: `giventa@gmail.com` can only exist **ONCE** in the `humble-monkey-3` Clerk application.

### What Happens in Your Scenario:

1. **User registers on `www.xyz.com`**:
   - Clerk creates user: `giventa@gmail.com`
   - User associated with `tenant_001` (via your backend)
   - ✅ Success

2. **User tries to register on `www.abc.com` with same email**:
   - Clerk checks: `giventa@gmail.com` already exists
   - ❌ **Error**: "Email already in use"
   - User cannot create a second account

3. **User tries Google OAuth on `www.abc.com`**:
   - Google returns: `giventa@gmail.com`
   - Clerk finds existing user from `www.xyz.com`
   - User logged in as the `tenant_001` user (NOT `tenant_002`)
   - ❌ **Wrong tenant association**

---

## Root Cause Analysis

### Current Architecture:

```
www.xyz.com (tenant_001) ──┐
                            ├──→ Backend ──→ Clerk (humble-monkey-3)
www.abc.com (tenant_002) ──┘
```

**Single Clerk Application** = **Single User Pool**

Users are **globally unique by email** across all tenants using the same Clerk app.

---

## The Architecture Decision: Choose Your Approach

You have **THREE** options for multi-tenant user isolation:

---

## ✅ Option 1: Shared User Pool with Tenant Memberships (Recommended)

**Model**: One user account, multiple tenant associations

### How It Works:

```
User: giventa@gmail.com
  ├─ Tenant Membership: tenant_001 (www.xyz.com)
  └─ Tenant Membership: tenant_002 (www.abc.com)
```

**User Experience**:
- User registers ONCE (on any domain)
- User can login to ANY domain with same credentials
- Backend tracks which tenants the user belongs to
- User can switch between tenants

**Example Flow**:

1. User registers on `www.xyz.com`:
   - Clerk creates: `giventa@gmail.com`
   - Backend creates: User record + Tenant membership (`tenant_001`)

2. User goes to `www.abc.com` and logs in:
   - Clerk authenticates: `giventa@gmail.com` (exists)
   - Backend checks: User has NO membership in `tenant_002`
   - Backend creates: New tenant membership for `tenant_002`
   - OR: Shows "Access Denied" if tenant requires invitation

3. User can now access both domains with same login

**Implementation Requirements**:

### Database Schema Change Needed:

```sql
-- Current (likely single tenant per user)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE,
  tenant_id VARCHAR(255),  -- ❌ Single tenant per user
  email VARCHAR(255),
  -- ...
);

-- NEW: Multi-tenant memberships
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE,  -- ✅ No tenant_id here
  email VARCHAR(255),
  -- ...
);

CREATE TABLE tenant_memberships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tenant_id VARCHAR(255),
  role VARCHAR(50),  -- admin, member, etc.
  joined_at TIMESTAMP,
  UNIQUE(user_id, tenant_id)  -- User can belong to each tenant once
);
```

### Backend Changes Needed:

1. **OAuth Callback** (`OAuthController.java:line 204`):
```java
// CURRENT: Assumes single tenant per user
String tenantId = stateData.getTenantId();  // From OAuth state

// NEW: Check/create tenant membership
String clerkUserId = (String) userData.get("id");
String tenantId = stateData.getTenantId();

// Check if user exists
User user = userRepository.findByClerkUserId(clerkUserId)
    .orElseGet(() -> createUserFromClerkData(clerkUserId, userData));

// Check if user has membership in this tenant
TenantMembership membership = tenantMembershipRepository
    .findByUserIdAndTenantId(user.getId(), tenantId)
    .orElseGet(() -> createTenantMembership(user.getId(), tenantId, "member"));

// Continue with JWT generation including tenant context
```

2. **JWT Token** should include:
```json
{
  "user_id": "user_123",
  "email": "giventa@gmail.com",
  "tenant_id": "tenant_001",  // Current active tenant
  "tenant_memberships": ["tenant_001", "tenant_002"]  // All tenants user belongs to
}
```

**Pros**:
- ✅ One login, multiple tenants
- ✅ User convenience (single identity)
- ✅ Matches Clerk's architecture model
- ✅ Works with current single Clerk app

**Cons**:
- ⚠️ Requires database schema changes
- ⚠️ User data shared across tenants (not fully isolated)
- ⚠️ Need tenant membership management logic

**Use Case**:
- SaaS platforms where users collaborate across multiple organizations
- B2B products where consultants work with multiple clients
- Internal tools where employees access multiple departments

---

## ⚠️ Option 2: Separate Clerk Applications per Tenant (True Isolation)

**Model**: Complete user isolation - same email can exist separately per tenant

### How It Works:

```
www.xyz.com (tenant_001) ──→ Backend ──→ Clerk App 1 (xyz-tenant-3.clerk.accounts.dev)
www.abc.com (tenant_002) ──→ Backend ──→ Clerk App 2 (abc-tenant-7.clerk.accounts.dev)
```

**User Experience**:
- User registers separately on each domain
- Same email can have DIFFERENT passwords per domain
- Completely isolated identities
- User must login separately to each domain

**Example Flow**:

1. User registers on `www.xyz.com`:
   - Backend determines tenant: `tenant_001`
   - Uses Clerk App 1 for authentication
   - Clerk App 1 creates: `giventa@gmail.com` (password: `abc123`)

2. User registers on `www.abc.com` with same email:
   - Backend determines tenant: `tenant_002`
   - Uses Clerk App 2 for authentication
   - Clerk App 2 creates: `giventa@gmail.com` (password: `xyz789` - can be different!)

3. OAuth works independently:
   - Google OAuth on `www.xyz.com` → Clerk App 1
   - Google OAuth on `www.abc.com` → Clerk App 2
   - Separate OAuth sessions

**Implementation Requirements**:

### Backend Configuration:

```yaml
# application-dev.yml - OLD (single Clerk app)
clerk:
  frontend-api: https://humble-monkey-3.clerk.accounts.dev

# NEW: Multiple Clerk apps per tenant
clerk:
  tenants:
    tenant_001:
      frontend-api: https://xyz-tenant-3.clerk.accounts.dev
      publishable-key: pk_test_***...
      secret-key: sk_test_***...
    tenant_002:
      frontend-api: https://abc-tenant-7.clerk.accounts.dev
      publishable-key: pk_test_***...
      secret-key: sk_test_***...
```

### Backend Changes:

```java
// ClerkIntegrationServiceImpl.java
public String generateOAuthUrl(String provider, String redirectUri, String state, String tenantId) {
    // Dynamically select Clerk app based on tenant
    ClerkTenantConfig tenantConfig = clerkProperties.getTenantConfig(tenantId);
    String clerkFrontendApi = tenantConfig.getFrontendApi();

    // Generate OAuth URL using tenant-specific Clerk app
    String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";
    // ...
}
```

**Pros**:
- ✅ Complete user isolation per tenant
- ✅ Same email can exist separately per tenant
- ✅ Independent passwords per tenant
- ✅ Maximum data security/privacy

**Cons**:
- ❌ **Cost**: Each Clerk app requires separate subscription
- ❌ **Complexity**: Manage multiple Clerk apps
- ❌ User inconvenience (separate logins per domain)
- ❌ More backend complexity (tenant-to-Clerk routing)

**Use Case**:
- Healthcare/financial apps requiring strict data isolation
- White-label products where tenants are competitors
- Regulatory requirements for separate user databases

---

## ❌ Option 3: Email Prefixing (NOT Recommended)

**Model**: Artificially make emails unique per tenant

### How It Works:

```
User enters: giventa@gmail.com on www.xyz.com
Backend stores in Clerk: tenant_001.giventa@gmail.com

User enters: giventa@gmail.com on www.abc.com
Backend stores in Clerk: tenant_002.giventa@gmail.com
```

**Why This is Bad**:
- ❌ Breaks OAuth (Google returns real email, not prefixed)
- ❌ Confusing for users
- ❌ Email verification issues (sends to wrong address)
- ❌ Hacky workaround, not a real solution

**Verdict**: ❌ **Do NOT use this approach**

---

## Recommendation Based on Your Requirements

### Analysis of Your Use Case:

Based on your question, you seem to expect:
> "Same email can register separately on both domains"

This suggests you want **Option 2: Separate Clerk Applications**

**However**, consider:

### Questions to Answer:

1. **User Expectation**:
   - Should `giventa@gmail.com` be treated as the SAME person across both domains?
   - Or are they potentially DIFFERENT people with the same email? (unlikely)

2. **Business Model**:
   - Are `www.xyz.com` and `www.abc.com` completely separate products?
   - Or are they different "workspaces" of the same product?

3. **User Convenience**:
   - Should users login once and access both domains?
   - Or should they maintain separate accounts per domain?

4. **Data Sharing**:
   - Should user profile data (name, preferences) be shared across domains?
   - Or completely isolated?

---

## Recommended Approach: **Option 1** (Shared User Pool)

**Why**:
1. ✅ **Cost-effective**: One Clerk subscription
2. ✅ **User-friendly**: Single login for multiple domains
3. ✅ **Standard pattern**: Matches how most SaaS products work (Slack, GitHub, etc.)
4. ✅ **Your backend is already domain-agnostic**: Just add tenant membership logic
5. ✅ **OAuth works seamlessly**: Google returns email, matches existing user

**When User Does This**:
```
1. Register on www.xyz.com with giventa@gmail.com
   → Creates user + tenant_001 membership

2. Login on www.abc.com with giventa@gmail.com
   → Recognizes existing user
   → Option A: Auto-create tenant_002 membership
   → Option B: Show "Request Access" (requires invitation)

3. Google OAuth on either domain
   → Recognizes user by email
   → Associates with correct tenant based on domain
```

**Implementation Complexity**: Medium (database changes + membership logic)

---

## If You Need True Isolation: **Option 2**

**When to use**:
- Legal/regulatory requirements for data separation
- Different products under different brands
- Competitors using same white-label platform

**Implementation Complexity**: High (multiple Clerk apps + routing logic)

**Cost Impact**: $25-$299/month per Clerk application (based on Clerk pricing)

---

## Required Changes for Option 1 (Recommended)

### 1. Database Migration

```sql
-- Add tenant_memberships table
CREATE TABLE tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  permissions JSONB,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  invited_by UUID REFERENCES users(id),
  CONSTRAINT unique_user_tenant UNIQUE(user_id, tenant_id)
);

-- Remove tenant_id from users table (if exists)
ALTER TABLE users DROP COLUMN IF EXISTS tenant_id;
```

### 2. Backend Service Changes

**New Service**: `TenantMembershipService.java`

```java
public interface TenantMembershipService {
    TenantMembership getOrCreateMembership(String userId, String tenantId, String role);
    boolean userHasAccessToTenant(String userId, String tenantId);
    List<TenantMembership> getUserTenants(String userId);
    void revokeAccess(String userId, String tenantId);
}
```

### 3. OAuth Callback Update

Update `OAuthController.java` line 204-211:

```java
// After getting user data from Clerk
String clerkUserId = (String) userData.get("id");
String email = extractEmail(userData);
String tenantId = stateData.getTenantId();

// Check if user exists in our system
User user = userService.findByClerkUserId(clerkUserId)
    .orElseGet(() -> userService.createFromOAuth(clerkUserId, email, firstName, lastName));

// Ensure user has access to this tenant
TenantMembership membership = tenantMembershipService.getOrCreateMembership(
    user.getId(),
    tenantId,
    "member"  // Default role for OAuth sign-ups
);

// Generate JWT with tenant context
String jwt = jwtService.generateToken(user, tenantId, membership.getRole());
```

### 4. Frontend Changes

**Minimal** - Just handle JWT token and tenant context:

```typescript
// After OAuth callback
const { token, user, tenant_id } = authResponse;

// Store in client
localStorage.setItem('auth_token', token);
localStorage.setItem('tenant_id', tenant_id);

// Use in API calls
headers: {
  'Authorization': `Bearer ${token}`,
  'X-Tenant-Id': tenant_id
}
```

---

## Testing Your Scenario with Option 1

### Test Case 1: Email/Password Registration

```
1. User goes to www.xyz.com
2. Registers with: giventa@gmail.com / password123
   Backend:
   - Creates Clerk user (if not exists)
   - Creates tenant_001 membership
   - Returns JWT with tenant_001 context

3. User goes to www.abc.com
4. Logs in with: giventa@gmail.com / password123
   Backend:
   - Authenticates via Clerk (user exists)
   - Checks tenant_002 membership (doesn't exist)
   - Creates tenant_002 membership automatically
   - Returns JWT with tenant_002 context

Result: ✅ User can access both domains with same credentials
```

### Test Case 2: Google OAuth

```
1. User goes to www.xyz.com
2. Clicks "Sign in with Google"
3. Google returns: giventa@gmail.com
   Backend:
   - Gets Clerk user by email (if exists) OR creates new
   - Creates tenant_001 membership
   - Returns JWT with tenant_001 context

4. User goes to www.abc.com
5. Clicks "Sign in with Google"
6. Google returns: giventa@gmail.com
   Backend:
   - Gets Clerk user by email (exists from step 3)
   - Checks tenant_002 membership (doesn't exist)
   - Creates tenant_002 membership
   - Returns JWT with tenant_002 context

Result: ✅ OAuth works across both domains with same Google account
```

---

## Configuration Stays Domain-Agnostic ✅

With Option 1, your configuration remains domain-agnostic:

```yaml
# Backend: application-dev.yml - NO CHANGES NEEDED
clerk:
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}

# Same Clerk app serves both domains
# Tenant differentiation via X-Tenant-Id header (already implemented)
```

**Frontend Environment Variables** (per domain):

```env
# www.xyz.com
NEXT_PUBLIC_TENANT_ID=tenant_001
NEXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com

# www.abc.com
NEXT_PUBLIC_TENANT_ID=tenant_002
NEXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com
```

Same backend code, same Clerk app, different tenant contexts ✅

---

## Summary

### Current Infrastructure:
- ❌ **Does NOT support same email across different tenant IDs**
- Single Clerk app = single user pool
- Email uniqueness enforced by Clerk

### Solution (Recommended):
- ✅ **Implement tenant membership system**
- Allow one user to belong to multiple tenants
- Track tenant memberships in backend database
- OAuth works seamlessly across domains

### Changes Required:
1. Add `tenant_memberships` table
2. Update OAuth callback to create/check memberships
3. Update JWT to include tenant context
4. Handle tenant membership logic

### Result:
- ✅ Same email works across all domains
- ✅ Same OAuth account works across all domains
- ✅ Backend remains domain-agnostic
- ✅ Single Clerk application (cost-effective)
- ✅ User convenience (one login, multiple tenants)

---

## Next Steps

**Decision Required**: Choose your multi-tenant strategy:

**Option A**: Shared user pool with memberships (Recommended)
- Implementation time: 2-4 hours
- Cost: No additional Clerk fees
- User experience: Best (single login)

**Option B**: Separate Clerk apps per tenant
- Implementation time: 4-8 hours
- Cost: Additional Clerk subscriptions
- User experience: Separate logins per domain

Let me know which approach fits your business requirements, and I can provide detailed implementation steps.
