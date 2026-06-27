# OAuth Tenant ID Fix - HTTP 401 Error Resolution

## Problem

When clicking social login buttons (Google, Facebook, GitHub), the backend returned **HTTP 401 Unauthorized** error:

```
Error: This page isn't working
HTTP ERROR 401
```

**Backend logs showed**:
```
DEBUG [TenantContextFilter] No tenant ID found in request
DEBUG [TenantServiceImpl] Using default tenant: tenant_demo_001
```

**URL attempted**:
```
http://localhost:8080/api/oauth/google/initiate?tenantId=tenant_demo_001&redirectUrl=%2Fsign-in
```

## Root Cause

The social login buttons were making **direct browser redirects** to the backend OAuth endpoint, bypassing the frontend API proxy layer. This caused two critical issues:

1. **Missing JWT Authentication**: Direct browser requests don't include the JWT Bearer token required by backend
2. **Missing Tenant ID Header**: Tenant ID was passed as query parameter, but backend's `TenantContextFilter` expects it in the `X-Tenant-Id` request header

### Backend Architecture Requirement

All API requests to the backend must include:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Tenant ID Header** (for multi-tenant support): `X-Tenant-Id: tenant_demo_001`

The backend's `TenantContextFilter` validates these headers before allowing requests through.

## Solution

Created a **frontend API proxy layer** for OAuth that:
1. Accepts OAuth initiate requests from social login buttons
2. Adds JWT authentication (via `fetchWithJwtRetry`)
3. Injects tenant ID in the proper header format
4. Forwards authenticated request to backend
5. Returns redirect response to client

## Implementation

### 1. Created OAuth Proxy Route

**File**: `src/pages/api/oauth/[provider]/initiate.ts`

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract provider and redirect URL
  const { provider, redirectUrl = '/' } = req.query;

  // Get tenant ID from environment
  const tenantId = getTenantId();

  // Build backend URL with query parameters
  const backendOAuthUrl = `${API_BASE_URL}/api/oauth/${provider}/initiate`;
  const params = new URLSearchParams();
  params.append('tenantId', tenantId);
  params.append('redirectUrl', redirectUrl as string);

  // Make authenticated request with tenant ID header
  const backendResponse = await fetchWithJwtRetry(fullBackendUrl, {
    method: 'GET',
    headers: {
      'X-Tenant-Id': tenantId, // Critical: Add tenant ID header
    },
    redirect: 'manual',
  });

  // Forward backend's redirect response to client
  if (backendResponse.status === 302) {
    const location = backendResponse.headers.get('Location');
    return res.redirect(302, location);
  }
}
```

**Key Features**:
- Handles dynamic provider routing: `/api/oauth/google/initiate`, `/api/oauth/facebook/initiate`, etc.
- Validates provider against whitelist (google, facebook, github, apple, microsoft)
- Uses `fetchWithJwtRetry()` for automatic JWT token management
- Adds `X-Tenant-Id` header for backend multi-tenant routing
- Forwards redirect responses (302) to client browser

### 2. Updated Social Login Buttons

#### Before (BROKEN):
```typescript
export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const handleClick = () => {
    const tenantId = getTenantId();
    const backendUrl = getBackendApiUrl();
    const redirectUrl = window.location.pathname;

    // Direct call to backend - NO AUTH, NO HEADERS
    const oauthUrl = `${backendUrl}/api/oauth/google/initiate?tenantId=${encodeURIComponent(
      tenantId
    )}&redirectUrl=${encodeURIComponent(redirectUrl)}`;

    window.location.href = oauthUrl;
  };
}
```

#### After (FIXED):
```typescript
export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const handleClick = () => {
    const redirectUrl = window.location.pathname;

    // Use frontend proxy route (adds JWT + tenant header)
    const oauthUrl = `/api/oauth/google/initiate?redirectUrl=${encodeURIComponent(redirectUrl)}`;

    window.location.href = oauthUrl;
  };
}
```

**Changes**:
- ✅ Removed direct backend URL construction
- ✅ Removed manual tenant ID injection
- ✅ Changed to relative URL (`/api/oauth/...`) - goes through proxy
- ✅ Simplified button logic - tenant ID handled by proxy

**Files Updated**:
1. `src/components/auth/GoogleSignInButton.tsx`
2. `src/components/auth/FacebookSignInButton.tsx`
3. `src/components/auth/GitHubSignInButton.tsx`

## Flow Diagram

### Before (BROKEN):
```
User clicks button
    ↓
Browser redirects directly to backend
    http://localhost:8080/api/oauth/google/initiate?tenantId=...
    ↓
Backend receives request:
    ❌ No Authorization header
    ❌ No X-Tenant-Id header
    ↓
TenantContextFilter blocks request
    ↓
HTTP 401 Unauthorized
```

### After (FIXED):
```
User clicks button
    ↓
Browser redirects to frontend proxy
    /api/oauth/google/initiate?redirectUrl=...
    ↓
Frontend proxy route:
    ✅ Gets tenant ID from environment
    ✅ Calls fetchWithJwtRetry() to get JWT token
    ✅ Adds Authorization: Bearer <token>
    ✅ Adds X-Tenant-Id: tenant_demo_001
    ↓
Forwards to backend
    http://localhost:8080/api/oauth/google/initiate?tenantId=...&redirectUrl=...
    ↓
Backend receives authenticated request:
    ✅ Authorization header present
    ✅ X-Tenant-Id header present
    ↓
TenantContextFilter allows request
    ↓
Backend generates Clerk OAuth URL with state token
    ↓
Backend returns 302 redirect to Clerk
    ↓
Frontend proxy forwards 302 to browser
    ↓
Browser redirects to Clerk OAuth page
```

## Testing

### 1. Test Frontend Server
```bash
npm run dev
```

### 2. Test Backend Server
Ensure backend is running without YAML errors (apply YAML fix first if needed)

### 3. Test OAuth Flow

1. **Navigate to sign-in page**:
   ```
   http://localhost:3000/sign-in
   ```

2. **Click Google/Facebook/GitHub button**

3. **Check browser network tab**:
   - Should see redirect to `/api/oauth/{provider}/initiate`
   - Should see 302 response
   - Should redirect to Clerk OAuth page

4. **Check backend logs**:
   ```
   DEBUG [TenantContextFilter] Tenant ID found: tenant_demo_001
   DEBUG [OAuthController] Initiating OAuth for provider: google
   DEBUG [ClerkIntegrationService] Generating OAuth URL...
   ```

5. **Complete OAuth on Clerk**:
   - Should redirect back to backend callback
   - Backend processes OAuth code
   - Redirects to frontend callback page
   - Frontend shows success message and redirects

## Architecture Benefits

### 1. Security
- ✅ All backend requests authenticated with JWT
- ✅ Tenant ID properly validated
- ✅ OAuth state tokens prevent CSRF attacks

### 2. Maintainability
- ✅ Centralized authentication logic in proxy route
- ✅ Social buttons are simple and consistent
- ✅ Easy to add new OAuth providers

### 3. Multi-Tenant Support
- ✅ Tenant ID automatically injected by proxy
- ✅ No manual tenant ID handling in UI components
- ✅ Works with any tenant configuration

### 4. Domain-Agnostic
- ✅ Relative URLs in frontend (no hardcoded domains)
- ✅ Backend URL configured in environment variables
- ✅ Works in dev, staging, and production

## Environment Variables

No new environment variables needed. Uses existing:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_TENANT_ID=tenant_demo_001
API_JWT_USER=your_jwt_user
API_JWT_PASS=your_jwt_password
```

## Next Steps

1. ✅ **Test OAuth flow** with updated code
2. ⏳ **Configure Clerk Dashboard**:
   - Enable Google, Facebook, GitHub providers
   - Add redirect URIs: `http://localhost:8080/api/oauth/{provider}/callback`
3. ⏳ **Test end-to-end authentication**:
   - Complete OAuth flow
   - Verify user session created
   - Check header updates after login
4. ⏳ **Add error handling** for failed OAuth attempts
5. ⏳ **Add loading states** to social buttons during redirect

## Related Files

### New Files
- `src/pages/api/oauth/[provider]/initiate.ts` - OAuth proxy route

### Modified Files
- `src/components/auth/GoogleSignInButton.tsx` - Updated to use proxy
- `src/components/auth/FacebookSignInButton.tsx` - Updated to use proxy
- `src/components/auth/GitHubSignInButton.tsx` - Updated to use proxy

### Unchanged Files
- `src/app/auth/callback/page.tsx` - OAuth callback handler (already correct)
- `src/lib/proxyHandler.ts` - Shared proxy utilities
- `src/lib/env.ts` - Environment helpers

## Troubleshooting

### Still Getting 401 Error?

**Check**:
1. Backend is running and accessible at `http://localhost:8080`
2. JWT credentials configured in `.env.local`:
   ```
   API_JWT_USER=your_user
   API_JWT_PASS=your_password
   ```
3. Frontend dev server restarted after code changes
4. Browser cache cleared

### Backend Not Receiving Tenant ID?

**Check backend logs for**:
```
DEBUG [TenantContextFilter] Tenant ID found: tenant_demo_001
```

If not found, verify:
1. Proxy route is adding `X-Tenant-Id` header
2. `getTenantId()` returns correct value
3. Backend `TenantContextFilter` reads header correctly

### Redirect Not Working?

**Check**:
1. Backend returns 302 status with `Location` header
2. Proxy route forwards redirect with `res.redirect(302, location)`
3. Browser follows redirect (check network tab)

## Summary

The fix ensures OAuth requests follow the same authentication pattern as all other backend API calls:
- Go through frontend API proxy layer
- Include JWT authentication
- Include tenant ID header
- Properly handle backend responses

This maintains consistency with the existing architecture and ensures OAuth works correctly in the multi-tenant environment.
