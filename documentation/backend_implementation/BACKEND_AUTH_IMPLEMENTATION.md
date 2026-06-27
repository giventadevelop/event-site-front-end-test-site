# Backend-Only Authentication Implementation

**Status**: ✅ COMPLETE
**Date**: October 14, 2025
**Implementation Type**: Backend-Only Authentication (Domain-Agnostic)

---

## Executive Summary

Successfully implemented a **backend-only authentication system** where ALL authentication operations (sign-up, sign-in, token generation, social OAuth, token refresh, user retrieval, and sign-out) occur exclusively in the **Spring Boot backend**. The Next.js frontend acts as a **pure proxy layer** with zero authentication logic.

### Key Principle
**The frontend NEVER calls Clerk or social providers directly. All authentication flows through the backend.**

---

## Architecture Overview

```
┌──────────────────┐
│   Next.js        │  Pure Proxy Layer
│   Frontend       │  - Validates input
│   (Port 3000)    │  - Forwards to backend
│                  │  - Returns backend response
└────────┬─────────┘
         │
         │ HTTP Proxy (All /api/auth/* routes)
         │
┌────────▼─────────┐
│   Spring Boot    │  Authentication Authority
│   Backend        │  - JWT minting & validation
│   (Port 8080)    │  - Clerk integration
│                  │  - Social OAuth exchange
│                  │  - User reconciliation
│                  │  - Token refresh/rotation
└────────┬─────────┘
         │
         │ Clerk REST API / OAuth Providers
         │
┌────────▼─────────┐
│   Clerk / OAuth  │
│   Services       │
└──────────────────┘
```

---

## Implementation Details

### 1. Frontend API Routes (Proxy Layer)

All routes in `src/app/api/auth/*` are pure proxies:

| Frontend Route | Backend Endpoint | Method | Purpose |
|---------------|------------------|--------|---------|
| `/api/auth/signin` | `/api/auth/sign-in` | POST | Email/password sign-in |
| `/api/auth/signup` | `/api/auth/sign-up` | POST | User registration |
| `/api/auth/social` | `/api/auth/sign-in/social` | POST | Social login (Google/Facebook/GitHub/Apple) |
| `/api/auth/refresh` | `/api/auth/refresh-token` | POST | Token refresh |
| `/api/auth/me` | `/api/auth/user` | GET | Get current user |
| `/api/auth/signout` | `/api/auth/sign-out` | POST | Sign out |

### 2. Proxy Pattern Implementation

Every auth route follows this pattern:

```typescript
// src/app/api/auth/{route}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/env';

function getBackendBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = getTenantId();

    // Forward to backend
    const backendUrl = `${getBackendBaseUrl()}/api/auth/{endpoint}`;
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'Authorization': req.headers.get('Authorization') // if authenticated
      },
      body: JSON.stringify({ ...body, tenantId })
    });

    // Parse and forward response
    const responseData = await backendResponse.text();
    const data = responseData ? JSON.parse(responseData) : {};

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Operation failed',
      message: 'An error occurred'
    }, { status: 500 });
  }
}
```

### 3. Multi-Tenant Support

Every backend request includes the tenant context:

```typescript
headers: {
  'X-Tenant-ID': getTenantId() // from NEXT_PUBLIC_TENANT_ID env var
}
```

The tenant ID is:
- Configured via environment variable `NEXT_PUBLIC_TENANT_ID`
- Automatically injected by all proxy routes
- Used by backend for data isolation

### 4. Authentication Flow

#### Sign-Up Flow
```
1. User submits email/password via SignUpForm
2. AuthContext.signUp() → authenticationService.signUp()
3. apiClient.post('/api/auth/signup')
4. Next.js proxy: POST to backend /api/auth/sign-up with tenantId
5. Backend: Creates user in Clerk, generates JWT tokens
6. Backend returns: { accessToken, refreshToken, expiresIn, user }
7. Frontend: Stores tokens via tokenService
8. User redirected to dashboard
```

#### Sign-In Flow
```
1. User submits email/password via SignInForm
2. AuthContext.signIn() → authenticationService.signIn()
3. apiClient.post('/api/auth/signin')
4. Next.js proxy: POST to backend /api/auth/sign-in with tenantId
5. Backend: Validates credentials with Clerk, generates JWT tokens
6. Backend returns: { accessToken, refreshToken, expiresIn, user }
7. Frontend: Stores tokens via tokenService
8. User redirected to dashboard
```

#### Social Login Flow
```
1. User clicks "Sign in with Google"
2. Frontend: Obtains idToken from Google OAuth SDK
3. AuthContext.socialSignIn() → authenticationService.socialSignIn()
4. apiClient.post('/api/auth/social', { provider: 'google', idToken })
5. Next.js proxy: POST to backend /api/auth/sign-in/social
6. Backend: Verifies idToken with Google, reconciles user, generates JWT
7. Backend returns: { accessToken, refreshToken, expiresIn, user }
8. Frontend: Stores tokens via tokenService
9. User redirected to dashboard
```

#### Token Refresh Flow
```
1. API request receives 401 Unauthorized
2. apiClient interceptor detects 401
3. apiClient.refreshToken() → POST /api/auth/refresh
4. Next.js proxy: POST to backend /api/auth/refresh-token
5. Backend: Validates refresh token, issues new access token (rotation)
6. Backend returns: { accessToken, refreshToken, expiresIn }
7. Frontend: Updates tokens via tokenService
8. Original request retried with new token
```

### 5. Token Management

**Token Service** (`src/services/auth/tokenService.ts`):
```typescript
// Store tokens from backend response
tokenService.setTokens({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  expiresAt: Date.now() + response.expiresIn * 1000
});

// Retrieve tokens
const accessToken = tokenService.getAccessToken();
const refreshToken = tokenService.getRefreshToken();

// Check authentication
const isAuth = tokenService.isAuthenticated(); // checks token & expiry

// Clear tokens (logout)
tokenService.clearTokens();
```

**Storage**: localStorage with keys:
- `clerk_access_token`
- `clerk_refresh_token`
- `clerk_token_expires_at`

### 6. API Client with Automatic Refresh

**API Client** (`src/services/api/apiClient.ts`):
- Automatically injects `Authorization: Bearer {token}` header
- Automatically injects `X-Tenant-ID` header
- Intercepts 401 responses → triggers token refresh
- Retries failed request with new token
- Redirects to `/sign-in` if refresh fails

```typescript
// Usage in services
import { apiClient } from '@/services/api';

// Authenticated request (token added automatically)
const user = await apiClient.get('/api/auth/me');

// Unauthenticated request (skip token)
const response = await apiClient.post('/api/auth/signin', data, { skipAuth: true });
```

### 7. Error Handling (RFC 7807)

All endpoints return RFC 7807 Problem Details format:

```typescript
{
  type: string,           // "about:blank" or error type URI
  title: string,          // "Unauthorized", "Bad Request", etc.
  status: number,         // HTTP status code
  detail: string,         // Detailed error description
  message: string,        // User-facing message
  errorCode?: string,     // Application code (AUTH_001, AUTH_002, etc.)
  fieldErrors?: Array<{   // Validation errors
    objectName: string,
    field: string,
    message: string
  }>
}
```

**Error Codes**:
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Invalid token
- `AUTH_004`: User not found
- `AUTH_005`: Email already exists
- `AUTH_010`: Social login failed

---

## Configuration

### Environment Variables

**Required**:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080  # Spring Boot backend URL
NEXT_PUBLIC_TENANT_ID=tenant_demo_001           # Tenant identifier
```

**Optional** (for social login):
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

### Backend Configuration

The Spring Boot backend must:
1. Expose endpoints per Swagger API spec (`documentation/Swagger_API_Docs/api-docs.json`)
2. Accept `X-Tenant-ID` header for multi-tenant support
3. Return JWT tokens in format: `{ accessToken, refreshToken, expiresIn, user }`
4. Support Clerk REST API integration
5. Handle social OAuth token verification

---

## Components Updated

### ✅ Frontend API Routes (100% Proxy)
- `src/app/api/auth/signin/route.ts` - Sign-in proxy
- `src/app/api/auth/signup/route.ts` - Sign-up proxy
- `src/app/api/auth/social/route.ts` - Social login proxy
- `src/app/api/auth/refresh/route.ts` - Token refresh proxy
- `src/app/api/auth/me/route.ts` - Current user proxy
- `src/app/api/auth/signout/route.ts` - Sign-out proxy

### ✅ Existing Services (Already Compatible)
- `src/services/auth/tokenService.ts` - Token storage/retrieval
- `src/services/auth/authenticationService.ts` - Auth service layer
- `src/services/api/apiClient.ts` - HTTP client with interceptors
- `src/contexts/AuthContext.tsx` - React auth context
- `src/components/auth/SignInForm.tsx` - Sign-in UI
- `src/components/auth/SignUpForm.tsx` - Sign-up UI

### 📝 No Changes Required
These components already support the backend-only flow:
- Authentication service layer
- Token management
- API client interceptors
- Auth context provider
- Form components

---

## Verification Checklist

### ✅ Implementation Complete
- [x] All auth routes proxy to backend
- [x] No Clerk client SDK calls in frontend
- [x] No JWT signing in frontend
- [x] Multi-tenant header injection
- [x] RFC 7807 error handling
- [x] Token refresh interceptor
- [x] Social login proxying
- [x] Sign-out backend call

### 🧪 Testing Needed
- [ ] Sign-up flow with valid credentials
- [ ] Sign-up with duplicate email (error handling)
- [ ] Sign-in with valid credentials
- [ ] Sign-in with invalid credentials (error handling)
- [ ] Token refresh on 401
- [ ] Token expiration handling
- [ ] Social login (Google/Facebook/GitHub)
- [ ] Sign-out flow
- [ ] Multi-tenant context enforcement

### 📋 Deployment Requirements
- [ ] `NEXT_PUBLIC_API_BASE_URL` configured
- [ ] `NEXT_PUBLIC_TENANT_ID` configured
- [ ] Backend accessible from frontend
- [ ] CORS configured on backend
- [ ] SSL/TLS certificates (production)

---

## Benefits Achieved

### ✅ Domain-Agnostic
Any frontend application can authenticate through the same Spring Boot backend. No frontend-specific configuration.

### ✅ Centralized Control
All authentication logic, user management, and security policies controlled in one place (backend).

### ✅ Security
- JWT signing keys never exposed to frontend
- Token minting only in backend
- No client-side cryptographic operations

### ✅ Multi-Tenant
Tenant context automatically enforced across all auth operations.

### ✅ Scalability
- Backend can serve multiple frontend applications
- Horizontal scaling of auth service
- Centralized audit logging

### ✅ Maintainability
- Single source of truth for auth logic
- Easier to update/patch security issues
- Consistent behavior across all frontends

---

## API Endpoints Reference

### Sign-Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response 201:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "rt_...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": 123,
    "userId": "user_abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userRole": "USER",
    "userStatus": "ACTIVE",
    "tenantId": "tenant_demo_001"
  }
}
```

### Sign-In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}

Response 200:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "rt_...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": { ... }
}
```

### Social Login
```http
POST /api/auth/social
Content-Type: application/json

{
  "provider": "google",
  "idToken": "eyJhbGci..."
}

Response 200:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "rt_...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": { ... }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "rt_..."
}

Response 200:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "rt_new...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGci...

Response 200:
{
  "id": 123,
  "userId": "user_abc123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "userRole": "USER",
  "userStatus": "ACTIVE",
  "tenantId": "tenant_demo_001"
}
```

### Sign-Out
```http
POST /api/auth/signout
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "refreshToken": "rt_..."
}

Response 200:
{
  "success": true,
  "message": "Successfully signed out"
}
```

---

## Troubleshooting

### Issue: CORS errors when calling backend
**Solution**: Configure CORS on Spring Boot backend to allow frontend domain.

### Issue: Tokens not persisting
**Solution**: Check browser localStorage. Ensure `tokenService.setTokens()` is called after successful auth.

### Issue: 401 on authenticated requests
**Solution**:
1. Check token expiration in localStorage
2. Verify `Authorization` header is sent
3. Ensure backend JWT validation is working
4. Check token refresh is triggering

### Issue: Tenant ID errors
**Solution**: Verify `NEXT_PUBLIC_TENANT_ID` is set in `.env.local`.

### Issue: Backend not receiving requests
**Solution**:
1. Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. Verify backend is running on expected port
3. Check network tab for actual request URL

---

## Next Steps

1. **Testing**: Run integration tests for all auth flows
2. **Social OAuth**: Configure Google/Facebook/GitHub OAuth clients
3. **Production**: Deploy backend and configure production URLs
4. **Monitoring**: Set up logging and error tracking
5. **Documentation**: Update team wiki with auth flow diagrams

---

## Support

For issues or questions:
- **PRD**: `.task-master/PRD.txt`
- **API Spec**: `documentation/Swagger_API_Docs/api-docs.json`
- **Backend Repo**: Check backend repository for Spring Boot implementation

---

**Implementation Status**: ✅ COMPLETE
**Next Action**: Testing & Deployment
