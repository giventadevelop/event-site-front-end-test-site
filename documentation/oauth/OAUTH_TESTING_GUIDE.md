# OAuth Testing Guide

## Current Status

✅ **Backend**: Running and ready
✅ **Frontend**: Running but needs restart
✅ **Code**: All OAuth proxy code implemented

## Issue

The frontend dev server needs to be **restarted** to pick up the new App Router API route:
- `src/app/api/oauth/[provider]/initiate/route.ts`

Next.js App Router requires a server restart when new route handlers are added.

## Step 1: Restart Frontend Server

### Stop the current dev server:
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### Start it again:
```bash
npm run dev
```

**Wait for**: `✓ Ready in Xms`

## Step 2: Test OAuth Proxy Endpoint

### Test using curl:
```bash
curl -v "http://localhost:3000/api/oauth/google/initiate?redirectUrl=%2Fsign-in"
```

### Expected Response:
```
< HTTP/1.1 302 Found
< Location: https://clerk.your-domain.com/oauth/authorize?provider=google&...
```

**If you see 302 redirect** ✅ - OAuth proxy is working!

**If you see 500 error** ❌ - Server needs restart or check logs

### Check Console Logs:

Frontend should show:
```
[OAuth Initiate] Forwarding to backend: {
  provider: 'google',
  tenantId: 'tenant_demo_001',
  redirectUrl: '/sign-in',
  backendUrl: 'http://localhost:8080/api/oauth/google/initiate?...'
}
[fetchWithJwtRetry] Called with URL: http://localhost:8080/api/oauth/google/initiate?...
[OAuth Initiate] Backend response status: 302
[OAuth Initiate] Redirecting to: https://clerk...
```

Backend should show:
```
DEBUG [TenantContextFilter] Tenant ID found: tenant_demo_001
DEBUG [OAuthController] Initiating OAuth for provider: google
DEBUG [ClerkIntegrationService] Generating OAuth URL for provider: google
```

## Step 3: Test in Browser

### Option A: Direct URL Test
1. Open browser
2. Navigate to: `http://localhost:3000/api/oauth/google/initiate?redirectUrl=%2Fsign-in`
3. Should redirect to Clerk OAuth page

### Option B: Social Button Test
1. Navigate to: `http://localhost:3000/sign-in`
2. Click "Sign in with Google" button
3. Should redirect through `/api/oauth/google/initiate`
4. Should then redirect to Clerk OAuth page

## Step 4: Check Network Tab

Open browser DevTools → Network tab:

### Expected Flow:
1. **Request**: `GET /api/oauth/google/initiate?redirectUrl=%2Fsign-in`
   - Status: `302 Found`
   - Response Headers: `Location: https://clerk...`

2. **Browser follows redirect**: `GET https://clerk.../oauth/authorize?...`
   - Clerk OAuth page loads

3. **User authenticates** on Clerk

4. **Clerk redirects back**: `GET http://localhost:8080/api/oauth/google/callback?code=...&state=...`
   - Backend processes OAuth code

5. **Backend redirects to frontend**: `GET http://localhost:3000/auth/callback?success=true&...`
   - Frontend callback page loads

6. **Frontend redirects**: `GET http://localhost:3000/sign-in` (or wherever user came from)
   - User is now logged in!

## Common Issues and Fixes

### Issue 1: 500 Internal Server Error
**Cause**: Frontend server hasn't picked up new route
**Fix**: Restart frontend dev server

### Issue 2: 401 Unauthorized from Backend
**Cause**: JWT token not working or tenant ID missing
**Fix**: Check backend logs - should see "Tenant ID found: tenant_demo_001"

### Issue 3: 404 Not Found
**Cause**: Route file not in correct location
**Fix**: Verify file exists at `src/app/api/oauth/[provider]/initiate/route.ts`

### Issue 4: Backend Returns Error Instead of Redirect
**Cause**: Backend OAuth controller or Clerk integration issue
**Fix**: Check backend logs for detailed error messages

## Backend Logs to Monitor

While testing, watch backend console for these log messages:

### ✅ Good Logs (Success):
```
DEBUG [TenantContextFilter] Tenant ID found: tenant_demo_001
DEBUG [OAuthController] Initiating OAuth for provider: google, tenantId: tenant_demo_001
DEBUG [OAuthStateService] Created state token: xyz... for provider: google
DEBUG [ClerkIntegrationService] Generated OAuth URL: https://clerk.../oauth/authorize?...
INFO [OAuthController] OAuth initiation successful, redirecting to Clerk
```

### ❌ Bad Logs (Failure):
```
DEBUG [TenantContextFilter] No tenant ID found in request
ERROR [OAuthController] OAuth initiation failed: ...
WARN [ClerkIntegrationService] Failed to generate OAuth URL: ...
```

## Frontend Logs to Monitor

Watch frontend terminal for these log messages:

### ✅ Good Logs (Success):
```
[OAuth Initiate] Forwarding to backend: { provider: 'google', tenantId: '...', ... }
[fetchWithJwtRetry] Called with URL: http://localhost:8080/api/oauth/google/initiate?...
[fetchWithJwtRetry] Using JWT: eyJ...
[OAuth Initiate] Backend response status: 302
[OAuth Initiate] Redirecting to: https://clerk.your-domain.com/oauth/authorize?...
```

### ❌ Bad Logs (Failure):
```
[OAuth Initiate] API_BASE_URL not configured
[OAuth Initiate] Invalid provider: xyz
[fetchWithJwtRetry] Response status: 401
[OAuth Initiate] Unexpected backend response: { status: 500, body: '...' }
```

## Quick Test Checklist

- [ ] Backend server running on port 8080
- [ ] Frontend server running on port 3000
- [ ] Frontend server restarted after code changes
- [ ] Can access `http://localhost:3000/sign-in` in browser
- [ ] Social login buttons visible on sign-in page
- [ ] Click Google button triggers redirect
- [ ] Check browser DevTools Network tab shows 302 redirect
- [ ] Check frontend console for OAuth logs
- [ ] Check backend console for tenant ID log

## Success Criteria

**You'll know it's working when**:
1. ✅ Clicking social button redirects to Clerk OAuth page
2. ✅ Backend logs show "Tenant ID found: tenant_demo_001"
3. ✅ No 401 or 500 errors in browser or console
4. ✅ OAuth state token is created and validated
5. ✅ After OAuth completes, user is redirected back to site

## Next Steps After Success

Once OAuth proxy is working:

1. **Configure Clerk Dashboard**:
   - Enable Google OAuth provider
   - Add redirect URI: `http://localhost:8080/api/oauth/google/callback`
   - Get Client ID and Client Secret

2. **Complete OAuth Flow**:
   - Test full authentication cycle
   - Verify user session is created
   - Check that Header component updates to show logged-in state

3. **Test Other Providers**:
   - Facebook: `http://localhost:3000/api/oauth/facebook/initiate?redirectUrl=%2Fsign-in`
   - GitHub: `http://localhost:3000/api/oauth/github/initiate?redirectUrl=%2Fsign-in`

4. **Add Error Handling**:
   - Handle failed OAuth attempts
   - Show user-friendly error messages
   - Add retry logic

## Files to Check

### Frontend Files:
- `src/app/api/oauth/[provider]/initiate/route.ts` - OAuth proxy route (NEW)
- `src/components/auth/GoogleSignInButton.tsx` - Updated to use proxy
- `src/components/auth/FacebookSignInButton.tsx` - Updated to use proxy
- `src/components/auth/GitHubSignInButton.tsx` - Updated to use proxy
- `src/app/auth/callback/page.tsx` - OAuth callback handler (unchanged)

### Backend Files (in backend repo):
- `OAuthController.java` - OAuth endpoints
- `OAuthStateServiceImpl.java` - State token management
- `ClerkIntegrationServiceImpl.java` - Clerk API integration
- `TenantContextFilter.java` - Tenant ID validation
- `application-dev.yml` - Configuration (fix YAML duplicate key first!)

## Environment Variables

Verify these are set in `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_TENANT_ID=tenant_demo_001

# JWT for backend authentication
API_JWT_USER=your_jwt_user
API_JWT_PASS=your_jwt_password
```

## Troubleshooting Commands

### Check if frontend is running:
```bash
curl -I http://localhost:3000
```

### Check if backend is running:
```bash
curl -I http://localhost:8080
```

### Test OAuth proxy directly:
```bash
curl -v "http://localhost:3000/api/oauth/google/initiate?redirectUrl=%2Fsign-in"
```

### Check frontend dev server logs:
Look for `[OAuth Initiate]` prefixed messages in terminal

### Check backend logs:
Look for `[TenantContextFilter]`, `[OAuthController]`, `[ClerkIntegrationService]` messages

## Support

If issues persist after following this guide:
1. Check both frontend and backend console logs
2. Verify all environment variables are set
3. Ensure backend YAML configuration is fixed (no duplicate keys)
4. Try clearing browser cache and cookies
5. Test with curl first before testing in browser

---

**Remember**: The most common issue is forgetting to restart the frontend dev server after adding new App Router API routes!
