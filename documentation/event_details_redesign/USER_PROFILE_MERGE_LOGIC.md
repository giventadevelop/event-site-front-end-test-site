# User Profile Email-Based Merge Logic

## Overview

This document explains the user profile creation and merging logic that handles cases where users sign in with different authentication methods but use the same email address.

## Problem Statement

When a user signs in with different authentication providers (e.g., first with Google, then with email/password), Clerk creates a different `userId` for each authentication method. However, if both use the same email address, we want to treat them as the same user based on **email + tenant ID** as the unique identifier.

## Business Rules

1. **Primary Key**: `email + tenant_id` combination is the unique identifier for a user within a tenant
2. **User ID Update**: If a user signs in with a different auth method (different Clerk userId) but same email, we UPDATE the existing record's userId instead of creating a duplicate
3. **Admin Role Preservation**: When merging profiles, preserve the existing user's role (including admin status)
4. **Profile Data Update**: Update profile data (name, image) with latest data from Clerk

## Implementation Flow

### Step 1: Check userId + tenantId

```typescript
const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${userId}&tenantId.equals=${tenantId}&size=1`;
```

**If found**: User profile exists with this exact Clerk userId → Check admin status and return

**If not found**: Proceed to Step 2

### Step 2: Check email + tenantId

```typescript
const emailCheckUrl = `${baseUrl}/api/proxy/user-profiles?email.equals=${email}&tenantId.equals=${tenantId}&size=1`;
```

**If not found**: No profile exists → Proceed to Step 4 (Create new profile)

**If found**: Profile exists with same email but different userId → Proceed to Step 3

### Step 3: Update Existing Profile's userId

When a profile is found with same email + tenantId but different userId:

```typescript
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

// Use direct backend call with JWT (not proxy) for PATCH operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const updatePayload = {
  id: existingProfile.id,   // MUST include id in PATCH payload per backend requirements
  userId: userId,           // Update to new Clerk userId
  clerkUserId: userId,      // Also update clerkUserId
  tenantId: tenantId,       // Include tenantId
  updatedAt: new Date().toISOString(),
  // Update user data from Clerk
  email: userEmail,
  firstName: u?.firstName || existingProfile.firstName,
  lastName: u?.lastName || existingProfile.lastName,
  profileImageUrl: u?.imageUrl || existingProfile.profileImageUrl,
};

// PATCH request to update the profile (direct backend call with JWT)
const updateRes = await fetchWithJwtRetry(`${API_BASE_URL}/api/user-profiles/${existingProfile.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/merge-patch+json' },
  body: JSON.stringify(updatePayload),
});
```

**Important**: This UPDATE preserves:
- ✅ Existing `userRole` (including ADMIN status)
- ✅ Existing `userStatus` (APPROVED/PENDING)
- ✅ All other existing profile data
- ✅ Only updates userId and basic Clerk data

### Step 4: Create New Profile

If no profile exists for this email + tenantId:

```typescript
const payload = {
  userId,
  clerkUserId: userId,
  email: userEmail,
  firstName: u?.firstName || '',
  lastName: u?.lastName || '',
  profileImageUrl: u?.imageUrl || '',
  userRole: 'MEMBER',           // Default role
  userStatus: 'PENDING_APPROVAL', // Default status
  createdAt: now,
  updatedAt: now,
};

await fetch(`${baseUrl}/api/proxy/user-profiles`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

## Use Cases

### Use Case 1: User Signs In with Google First Time

**Scenario**:
1. User signs in with Google OAuth
2. Clerk userId: `user_ABC123`
3. Email: `john@example.com`

**Flow**:
- Step 1: No profile found (first time user)
- Step 2: No profile with email found
- Step 4: **CREATE** new profile with userId `user_ABC123`

**Result**: New profile created

```sql
user_id: 'user_ABC123'
email: 'john@example.com'
tenant_id: 'tenant_demo_001'
user_role: 'MEMBER'
user_status: 'PENDING_APPROVAL'
```

### Use Case 2: Admin User Switches to Email/Password Auth

**Scenario**:
1. User previously signed in with Google (userId: `user_ABC123`)
2. Admin approved them and set role to ADMIN
3. User now signs in with email/password
4. Clerk creates new userId: `user_XYZ789`
5. Same email: `john@example.com`

**Flow**:
- Step 1: No profile found for userId `user_XYZ789`
- Step 2: Profile FOUND with email `john@example.com` (userId: `user_ABC123`)
- Step 3: **UPDATE** existing profile's userId from `user_ABC123` → `user_XYZ789`

**Result**: Profile updated, ADMIN role preserved

```sql
-- Before
user_id: 'user_ABC123'
email: 'john@example.com'
user_role: 'ADMIN'         ← Preserved
user_status: 'APPROVED'    ← Preserved

-- After
user_id: 'user_XYZ789'     ← Updated
email: 'john@example.com'
user_role: 'ADMIN'         ← Preserved ✅
user_status: 'APPROVED'    ← Preserved ✅
```

### Use Case 3: User Has Multiple Auth Methods

**Scenario**:
1. User signs in with Google (userId: `user_001`)
2. Later signs in with GitHub (userId: `user_002`)
3. Later signs in with email/password (userId: `user_003`)
4. All use same email: `john@example.com`

**Flow** (for each sign-in):
- First sign-in (Google): Creates profile
- Second sign-in (GitHub): Updates userId from `user_001` → `user_002`
- Third sign-in (Email): Updates userId from `user_002` → `user_003`

**Result**: Single profile, userId reflects most recent auth method

## Console Logs

The implementation includes detailed console logs for debugging:

### Profile Found (Existing User)
```
[Layout] Found existing profile. Admin status: true
```

### Profile Update (Different Auth Method)
```
[Layout] Found existing profile with same email but different userId. Updating userId...
[Layout] Old userId: user_ABC123 → New userId: user_XYZ789
[Layout] Successfully updated userId. Admin status: true
```

### Profile Creation (New User)
```
[Layout] Creating new user profile for userId: user_ABC123
[Layout] Successfully created new user profile
```

### Error Cases
```
[Layout] Failed to update userId: 400
[Layout] Failed to create user profile: 500
[Layout] User has no email address, skipping profile creation
```

## Database Constraints

This logic relies on the following database constraints:

```sql
-- Unique constraint on email + tenant_id
CREATE UNIQUE INDEX idx_user_profile_email_tenant
ON user_profile(email, tenant_id);

-- Or as a unique constraint
ALTER TABLE user_profile
ADD CONSTRAINT uq_user_profile_email_tenant
UNIQUE (email, tenant_id);
```

**Important**: The database MUST enforce email + tenant_id uniqueness to prevent duplicate profiles.

## Security Considerations

1. **Email Verification**: The logic assumes Clerk has verified the email address. Unverified emails could allow profile hijacking.

2. **Admin Role Preservation**: When merging profiles, we preserve the existing role. This is secure because:
   - Admin roles are set by administrators, not users
   - Email + tenant is the source of truth
   - User can't escalate privileges by switching auth methods

3. **Tenant Isolation**: The logic always includes tenantId in queries, ensuring:
   - No cross-tenant profile access
   - Each tenant's users are isolated

## Testing Scenarios

### Test 1: New User Sign-In
1. Clear user profile table for test email
2. Sign in with Google OAuth
3. Verify new profile created
4. Check role is MEMBER, status is PENDING_APPROVAL

### Test 2: Admin User Switches Auth
1. Create profile with role ADMIN, status APPROVED
2. Sign out
3. Sign in with different auth method (same email)
4. Verify userId updated
5. Check role still ADMIN, status still APPROVED
6. Check admin menu appears

### Test 3: Profile Merge Preserves Data
1. Create profile with custom data (phone, address, etc.)
2. Set role to ADMIN
3. Sign in with different auth method
4. Verify userId updated
5. Check all custom data preserved
6. Check role still ADMIN

### Test 4: Multiple Auth Method Switches
1. Sign in with Google → verify profile created
2. Sign out, sign in with GitHub → verify userId updated
3. Sign out, sign in with email/password → verify userId updated again
4. Check only one profile exists in database
5. Check latest userId is email/password userId

## Implementation Location

**File**: `src/app/layout.tsx`

**Lines**: 45-150 (User profile creation/update logic)

## Related Documentation

- `AUTHENTICATION_GUIDE.md` - Overall authentication setup
- `CLERK_DOMAIN_FIX.md` - Clerk satellite domain configuration
- Database schema for `user_profile` table

## API Endpoints Used

1. **GET** `/api/proxy/user-profiles?userId.equals={userId}&tenantId.equals={tenantId}`
   - Check if profile exists by userId
   - Uses proxy route (public endpoint)

2. **GET** `/api/proxy/user-profiles?email.equals={email}&tenantId.equals={tenantId}`
   - Check if profile exists by email
   - Uses proxy route (public endpoint)

3. **PATCH** `${API_BASE_URL}/api/user-profiles/{id}`
   - Update existing profile's userId
   - **Direct backend call with JWT** (not via proxy)
   - Uses `fetchWithJwtRetry` for authentication

4. **POST** `/api/proxy/user-profiles`
   - Create new user profile
   - Uses proxy route

## Troubleshooting

### Admin Menu Not Showing After Auth Switch

**Check**:
1. Console logs show profile update succeeded
2. Database record has correct userId
3. Database record has userRole = 'ADMIN'
4. Database record has userStatus = 'APPROVED'

**Fix**:
```sql
-- Verify current state
SELECT id, user_id, clerk_user_id, email, user_role, user_status, tenant_id
FROM user_profile
WHERE email = 'your-email@example.com' AND tenant_id = 'tenant_demo_001';

-- If userId is wrong, update manually
UPDATE user_profile
SET user_id = 'current_clerk_user_id',
    clerk_user_id = 'current_clerk_user_id'
WHERE email = 'your-email@example.com' AND tenant_id = 'tenant_demo_001';
```

### Duplicate Profiles Created

**Cause**: Database lacks unique constraint on email + tenant_id

**Fix**:
```sql
-- Add unique constraint
ALTER TABLE user_profile
ADD CONSTRAINT uq_user_profile_email_tenant
UNIQUE (email, tenant_id);
```

### Profile Update Fails with 404

**Cause**: Profile ID not found or API route issue

**Check**:
1. Console log shows correct profile ID
2. API endpoint `/api/proxy/user-profiles/{id}` exists
3. Backend API is accessible

### Profile Update Fails with 400

**Error**: `[Layout] Failed to update userId: 400`

**Cause**: PATCH request not following backend requirements

**Common Issues**:
1. Missing `id` field in payload (backend requires it)
2. Using proxy route instead of direct backend call
3. Missing JWT authentication
4. Incorrect Content-Type header

**Fix**: Use direct backend call with `fetchWithJwtRetry`:
```typescript
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const updatePayload = {
  id: existingProfile.id,  // ✅ MUST include id
  userId: userId,
  clerkUserId: userId,
  tenantId: tenantId,
  // ... other fields
};

const updateRes = await fetchWithJwtRetry(`${API_BASE_URL}/api/user-profiles/${existingProfile.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/merge-patch+json' },
  body: JSON.stringify(updatePayload),
});
```

**Reference**: See `.cursor/rules/nextjs_api_routes.mdc` lines 407-437 for PATCH/PUT patterns

## Benefits

1. **No Duplicate Profiles**: Users can switch auth methods freely
2. **Admin Role Preserved**: No loss of privileges when switching auth
3. **Seamless UX**: Users don't notice auth method changes
4. **Single Source of Truth**: Email + tenant is the user identifier
5. **Data Continuity**: Profile data preserved across auth method changes
