# Clerk Authentication OAuth Callback 403 & Backend 401 Fix

## Current Errors

### Error 1: OAuth Callback 403 (authorization_invalid)
```
GET https://clerk.adwiise.com/v1/oauth_callback?err_code=authorization_invalid 403 (Forbidden)
{
  "errors": [{
    "message": "Unauthorized request",
    "long_message": "You are not authorized to perform this request",
    "code": "authorization_invalid"
  }]
}
```

### Error 2: Backend API 401 (Unauthorized)
```
GET https://event-site-manager-dev.com/api/proxy/event-details?sort=startDate,asc 401 (Unauthorized)
GET https://event-site-manager-dev.com/api/proxy/tenant-settings 401 (Unauthorized)
GET https://event-site-manager-dev.com/api/proxy/executive-committee-team-members 401 (Unauthorized)
```

---

## Fix 1: OAuth Callback 403 Error

### Root Cause
The OAuth callback error occurs because Google Cloud Console doesn't have your Amplify domain configured as an authorized redirect URI.

### Solution: Add Redirect URIs to Google Cloud Console

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Select your project (the one used for OAuth)

2. **Navigate to OAuth 2.0 Credentials**:
   - In the left sidebar, go to: **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID (should be listed under "OAuth 2.0 Client IDs")
   - Click on the client ID to edit it

3. **Add Authorized Redirect URIs**:

   In the "Authorized redirect URIs" section, add these URIs:

   ```
   https://clerk.adwiise.com/v1/oauth_callback
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
   https://www.adwiise.com/sso-callback
   http://localhost:3000/sso-callback
   ```

4. **Click Save** at the bottom of the page

5. **Wait 2-5 minutes** for changes to propagate

### Verify Google OAuth Configuration in Clerk Dashboard

1. **Log in to Clerk Dashboard**: https://dashboard.clerk.com/
2. Go to: **User & Authentication** > **Social Connections**
3. Find **Google** in the list
4. Click **Settings** (gear icon)
5. Verify these settings:
   - **Status**: Enabled ✓
   - **Client ID**: Should match your Google Cloud Console OAuth 2.0 Client ID
   - **Client Secret**: Should be set (not visible for security)
   - **Scopes**: Should include at least `email` and `profile`

---

## Fix 2: Backend API 401 Errors

### Root Cause
The backend JWT authentication is failing, which is a **separate issue** from Clerk OAuth. Your frontend is unable to generate or pass valid JWT tokens to the backend API.

### Diagnosis Steps

#### Step 1: Check Amplify Environment Variables

Verify these environment variables are set in AWS Amplify Console:

1. Go to: AWS Amplify Console > Your App > Environment Variables
2. Ensure these are configured:

```bash
# Backend API JWT Credentials (CRITICAL)
API_JWT_USER=YOUR_JWT_USER
API_JWT_PASS=YOUR_JWT_PASSWORD

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://event-site-manager-dev.com

# Tenant ID
NEXT_PUBLIC_TENANT_ID=your_tenant_id_here
```

#### Step 2: Test JWT Token Generation Locally

Run this test to verify JWT token generation:

```typescript
// Create a test file: scripts/test-jwt.ts
import { generateApiJwt } from '../src/lib/api/jwt';

async function testJwt() {
  try {
    const token = await generateApiJwt();
    console.log('JWT Token Generated:', token);
    console.log('Token length:', token.length);

    // Decode JWT to inspect payload (base64 decode the middle part)
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('JWT Payload:', JSON.stringify(payload, null, 2));
    }
  } catch (error) {
    console.error('JWT Generation Failed:', error);
  }
}

testJwt();
```

Run locally:
```bash
tsx scripts/test-jwt.ts
```

#### Step 3: Check JWT Token in Browser Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by: `proxy`
4. Click on any failed request (401 error)
5. Check **Request Headers** section
6. Look for `Authorization` header:
   - Should be present: `Authorization: Bearer eyJ...`
   - If missing → Frontend not generating JWT
   - If present but still 401 → Backend rejecting JWT

#### Step 4: Verify Backend CORS Configuration

The backend needs to allow requests from your Amplify domain.

**Backend CORS should allow**:
```
Access-Control-Allow-Origin: https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Authorization, Content-Type, X-Tenant-Id
```

**Check backend logs** for CORS errors or JWT validation failures.

### Likely Solutions

#### Solution A: Missing Environment Variables in Amplify

If `API_JWT_USER` or `API_JWT_PASS` are not set in Amplify:

1. Go to: AWS Amplify Console
2. Your App > Environment Variables
3. Add:
   - `API_JWT_USER` = `YOUR_JWT_USER`
   - `API_JWT_PASS` = `YOUR_JWT_PASSWORD`
4. Redeploy the app

#### Solution B: JWT Token Caching Issue

If JWT token is cached with wrong credentials:

Clear the cache by restarting the Amplify app or clearing server-side cache.

**Code reference**: `src/lib/api/jwt.ts`
```typescript
// The getCachedApiJwt() function caches tokens for 50 minutes
// If credentials changed, token needs to be regenerated
```

#### Solution C: Backend Not Accepting Amplify Domain

If backend has domain whitelist:

1. Check backend Spring Security configuration
2. Ensure Amplify domain is in `allowedOrigins`:
   ```java
   .allowedOrigins(
     "http://localhost:3000",
     "https://www.adwiise.com",
     "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com" // ADD THIS
   )
   ```

---

## Verification Checklist

### OAuth Callback Fix
- [ ] Added redirect URIs to Google Cloud Console
- [ ] Waited 2-5 minutes for changes to propagate
- [ ] Verified Google OAuth is enabled in Clerk Dashboard
- [ ] Tested social login on: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
- [ ] No more 403 errors in browser console

### Backend API Fix
- [ ] Verified `API_JWT_USER` and `API_JWT_PASS` in Amplify environment variables
- [ ] Checked browser Network tab for `Authorization: Bearer` header
- [ ] Verified backend CORS allows Amplify domain
- [ ] Tested API calls: `/api/proxy/event-details`, `/api/proxy/tenant-settings`
- [ ] No more 401 errors in browser console

---

## Quick Test After Fixes

### Test OAuth Login
1. Go to: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
2. Click **Continue with Google**
3. Select Google account
4. Should redirect back successfully **without** 403 error
5. Should be logged in

### Test Backend API
1. Open browser DevTools (F12) > Network tab
2. Go to: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/`
3. Check Network tab for requests to `event-site-manager-dev.com/api/proxy/*`
4. All should return **200 OK** (not 401)
5. Data should load on the page

---

## Still Having Issues?

### Debug OAuth Callback
If still getting 403:
1. Check Clerk Dashboard logs: https://dashboard.clerk.com/logs
2. Look for OAuth callback errors
3. Verify the exact redirect URI being used
4. Compare with Google Cloud Console authorized URIs

### Debug Backend 401
If still getting 401:
1. Check backend server logs for JWT validation errors
2. Use `scripts/test-jwt.ts` to verify token generation locally
3. Compare local JWT token with Amplify JWT token (Network tab)
4. Verify backend is using same JWT credentials (`YOUR_JWT_USER` / `YOUR_JWT_PASSWORD`)

---

## Architecture Notes

### OAuth Flow (Clerk + Google)
```
1. User clicks "Continue with Google"
2. Clerk redirects to: accounts.google.com/oauth/authorize
3. User authenticates with Google
4. Google redirects to: clerk.adwiise.com/v1/oauth_callback  ← 403 ERROR HERE
5. Clerk processes OAuth callback
6. Clerk redirects to: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
7. User is authenticated
```

**Fix**: Add both Clerk and Amplify callback URIs to Google Cloud Console

### Backend API Flow (JWT Authentication)
```
1. Frontend needs data from backend
2. Frontend calls: /api/proxy/event-details  ← STARTS HERE
3. Next.js API route generates JWT token (src/lib/api/jwt.ts)
4. Proxy forwards request to: event-site-manager-dev.com/api/event-details
5. Proxy includes: Authorization: Bearer {JWT_TOKEN}
6. Backend validates JWT token  ← 401 ERROR HERE
7. Backend returns data
```

**Fix**: Ensure `API_JWT_USER` and `API_JWT_PASS` are in Amplify environment variables

---

## Contact Information

If you need further assistance:
- Clerk Support: https://clerk.com/support
- Clerk Discord: https://clerk.com/discord
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2

---

**Last Updated**: 2025-01-21
**Author**: Claude Code Assistant
**Status**: Active troubleshooting document
