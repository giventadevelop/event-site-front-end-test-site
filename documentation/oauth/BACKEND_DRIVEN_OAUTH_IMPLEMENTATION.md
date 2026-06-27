# Backend-Driven OAuth Implementation Guide

**Date**: 2025-10-15
**Status**: 🔧 IN PROGRESS
**Priority**: 🔴 P0 - Critical for Social Login

---

## Problem Statement

### Current Issue
Social login buttons (Google, Facebook, GitHub) are using **frontend SDKs** that connect directly to OAuth providers. This causes:

1. **Origin Mismatch Errors**: `Error 400: origin_mismatch` from Google OAuth
2. **Clerk Configuration Issues**: OAuth must be initiated from Clerk's domain, not custom domains
3. **Domain-Agnostic Violation**: Frontend directly connects to auth providers, breaking the domain-agnostic architecture

### Current Flow (BROKEN)
```
User clicks "Sign in with Google"
  ↓
Frontend loads Google SDK (accounts.google.com/gsi/client)
  ↓
Google OAuth popup opens
  ↓
ERROR: origin_mismatch (Google expects Clerk's domain)
```

---

## Solution: Backend-Driven OAuth Flow

### Architecture Overview

```
User clicks "Sign in with Google"
  ↓
Frontend redirects to: /api/oauth/google/initiate
  ↓
Backend redirects to: Clerk's OAuth URL
  ↓
User authenticates with Google on Clerk's domain
  ↓
Clerk redirects back to: /api/oauth/google/callback?code=xxx
  ↓
Backend exchanges code for Clerk session token
  ↓
Backend creates JWT and stores session
  ↓
Backend redirects to: Frontend with JWT token
  ↓
Frontend stores token and redirects to dashboard
```

### Key Benefits

✅ **Domain-Agnostic**: All OAuth flows go through backend
✅ **No Frontend SDK**: No Google/Facebook/GitHub SDKs on client
✅ **Clerk Compatible**: OAuth initiated from backend using Clerk's API
✅ **Secure**: Tokens never exposed to client during OAuth flow
✅ **Multi-Tenant**: Tenant ID passed throughout the flow

---

## Implementation Plan

### Backend Changes

#### 1. Create OAuth Initiate Endpoints

**File**: `src/main/java/com/nextjstemplate/web/rest/OAuthController.java`

```java
@RestController
@RequestMapping("/api/oauth")
public class OAuthController {

    @GetMapping("/{provider}/initiate")
    public ResponseEntity<Void> initiateOAuth(
        @PathVariable String provider,
        @RequestParam String tenantId,
        @RequestParam(required = false) String redirectUrl
    ) {
        // Generate OAuth URL using Clerk's OAuth endpoints
        // Redirect user to Clerk's OAuth flow
        String clerkOAuthUrl = buildClerkOAuthUrl(provider, tenantId, redirectUrl);
        return ResponseEntity.status(HttpStatus.FOUND)
            .header(HttpHeaders.LOCATION, clerkOAuthUrl)
            .build();
    }

    @GetMapping("/{provider}/callback")
    public ResponseEntity<Void> handleOAuthCallback(
        @PathVariable String provider,
        @RequestParam String code,
        @RequestParam String state
    ) {
        // Exchange code for Clerk session token
        // Create JWT for frontend
        // Redirect to frontend with JWT
    }
}
```

#### 2. Update ClerkIntegrationService

Add methods for OAuth flow:

```java
public interface ClerkIntegrationService {
    /**
     * Generate Clerk OAuth URL for social provider
     */
    String generateOAuthUrl(String provider, String tenantId, String redirectUrl);

    /**
     * Exchange OAuth code for Clerk session token
     */
    Optional<String> exchangeOAuthCode(String provider, String code);

    /**
     * Get user details from Clerk session token
     */
    Optional<Map<String, Object>> getUserFromSessionToken(String sessionToken);
}
```

### Frontend Changes

#### 1. Remove SDK-Based Social Login Components

**Delete/Deprecate**:
- `src/components/auth/GoogleSignInButton.tsx` (current implementation)
- `src/components/auth/FacebookSignInButton.tsx` (current implementation)
- `src/components/auth/GitHubSignInButton.tsx` (current implementation)

#### 2. Create Simple Redirect-Based Components

**File**: `src/components/auth/GoogleSignInButton.tsx`

```typescript
'use client';

import React from 'react';
import { getTenantId } from '@/lib/env';
import { getAppUrl } from '@/lib/env';

export function GoogleSignInButton() {
  const handleClick = () => {
    const tenantId = getTenantId();
    const redirectUrl = window.location.pathname; // Return here after login
    const backendUrl = getAppUrl();

    // Redirect to backend OAuth initiate endpoint
    window.location.href = `${backendUrl}/api/oauth/google/initiate?tenantId=${tenantId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 font-medium text-gray-700"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      Sign in with Google
    </button>
  );
}
```

**Similar components for Facebook and GitHub** with provider-specific styling.

#### 3. Create OAuth Callback Handler Page

**File**: `src/app/api/auth/callback/[provider]/route.ts`

This is just a pass-through - backend handles the real callback.

---

## Detailed OAuth Flow

### Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌────────┐         ┌─────────┐
│ Browser │         │ Frontend │         │Backend │         │  Clerk  │
└────┬────┘         └────┬─────┘         └───┬────┘         └────┬────┘
     │                   │                   │                    │
     │  Click "Sign in   │                   │                    │
     │  with Google"     │                   │                    │
     ├──────────────────>│                   │                    │
     │                   │                   │                    │
     │                   │ GET /api/oauth/   │                    │
     │                   │ google/initiate   │                    │
     │                   ├──────────────────>│                    │
     │                   │                   │                    │
     │                   │                   │ Generate OAuth URL │
     │                   │                   │ with redirect_uri  │
     │                   │                   │                    │
     │                   │ 302 Redirect to   │                    │
     │                   │ Clerk OAuth URL   │                    │
     │<──────────────────┴───────────────────┤                    │
     │                                       │                    │
     │ GET https://clerk.com/oauth/google?...│                    │
     ├───────────────────────────────────────┴───────────────────>│
     │                                                             │
     │                    User authenticates with Google on Clerk │
     │<────────────────────────────────────────────────────────────┤
     │                                                             │
     │ 302 Redirect to                                             │
     │ /api/oauth/google/callback?code=xxx                         │
     ├──────────────────────────────────────>│                    │
     │                                       │                    │
     │                                       │ Exchange code for  │
     │                                       │ session token      │
     │                                       ├───────────────────>│
     │                                       │                    │
     │                                       │ session_token      │
     │                                       │<───────────────────┤
     │                                       │                    │
     │                                       │ Create JWT token   │
     │                                       │ Store in database  │
     │                                       │                    │
     │ 302 Redirect to                       │                    │
     │ frontend with JWT                     │                    │
     │<──────────────────────────────────────┤                    │
     │                                       │                    │
     │ Store JWT in                          │                    │
     │ localStorage                          │                    │
     │                                       │                    │
```

### Step-by-Step Flow

#### Step 1: User Clicks Social Login Button
- **Trigger**: User clicks "Sign in with Google" button
- **Frontend Action**: Constructs backend OAuth URL with tenant ID and redirect URL
- **URL**: `${BACKEND_URL}/api/oauth/google/initiate?tenantId=tenant_001&redirectUrl=/dashboard`

#### Step 2: Backend Initiates OAuth
- **Backend Receives**: GET `/api/oauth/google/initiate`
- **Backend Action**:
  1. Validates tenant ID
  2. Generates state token (CSRF protection)
  3. Stores state in session/database
  4. Constructs Clerk OAuth URL:
     ```
     https://api.clerk.com/v1/oauth_authorizations?
       provider=google&
       redirect_uri=https://YOUR_BACKEND/api/oauth/google/callback&
       state=RANDOM_STATE_TOKEN
     ```
  5. Returns 302 redirect to Clerk OAuth URL

#### Step 3: Clerk Handles Social OAuth
- **User Redirected**: To Clerk's OAuth page
- **Clerk**: Opens Google OAuth popup/redirect
- **User**: Authenticates with Google
- **Google**: Returns to Clerk with authorization code
- **Clerk**: Exchanges code for Google access token
- **Clerk**: Creates Clerk session
- **Clerk**: Redirects back to your backend callback URL with code

#### Step 4: Backend Handles OAuth Callback
- **Backend Receives**: GET `/api/oauth/google/callback?code=xxx&state=yyy`
- **Backend Action**:
  1. Validates state token (CSRF protection)
  2. Exchanges Clerk authorization code for session token:
     ```java
     POST https://api.clerk.com/v1/oauth_tokens
     {
       "code": "clerk_oauth_code_xxx",
       "grant_type": "authorization_code"
     }
     ```
  3. Gets Clerk session token from response
  4. Validates session token with Clerk
  5. Gets user details from Clerk
  6. Creates/updates user in local database
  7. Generates JWT token for frontend
  8. Returns 302 redirect to frontend with JWT:
     ```
     https://FRONTEND_URL/auth/callback?token=JWT_TOKEN&redirect=/dashboard
     ```

#### Step 5: Frontend Receives JWT
- **Frontend Receives**: Redirect to `/auth/callback?token=JWT_TOKEN`
- **Frontend Action**:
  1. Extracts JWT from query parameter
  2. Stores JWT in localStorage
  3. Loads user profile
  4. Redirects to intended page (dashboard, profile, etc.)
  5. Header updates to show authenticated state

---

## Configuration Required

### Backend Configuration

**application-dev.yml**:
```yaml
clerk:
  api:
    base-url: https://api.clerk.com/v1
    secret-key: ${CLERK_SECRET_KEY}
  oauth:
    callback-base-url: http://localhost:8080  # Your backend URL
    google:
      enabled: true
    facebook:
      enabled: true
    github:
      enabled: true
```

### Frontend Configuration

**/.env.local**:
```bash
# Backend API URL (domain-agnostic)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Tenant ID
NEXT_PUBLIC_TENANT_ID=tenant_demo_001

# NO NEED FOR THESE ANYMORE (remove):
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
# NEXT_PUBLIC_FACEBOOK_APP_ID=xxx
# NEXT_PUBLIC_GITHUB_CLIENT_ID=xxx
```

### Clerk Dashboard Configuration

1. **Navigate to**: https://dashboard.clerk.com
2. **Go to**: Your Application → Social Connections
3. **Enable Providers**: Google, Facebook, GitHub
4. **Configure Redirect URIs**:
   ```
   http://localhost:8080/api/oauth/google/callback
   http://localhost:8080/api/oauth/facebook/callback
   http://localhost:8080/api/oauth/github/callback
   https://YOUR_PRODUCTION_BACKEND/api/oauth/google/callback
   https://YOUR_PRODUCTION_BACKEND/api/oauth/facebook/callback
   https://YOUR_PRODUCTION_BACKEND/api/oauth/github/callback
   ```

---

## Security Considerations

### CSRF Protection
- Use **state parameter** in OAuth flow
- Generate random state token before redirect
- Store state in session/database
- Validate state in callback

### Token Security
- JWT tokens only transmitted via secure HTTPS
- Short-lived access tokens (15 minutes)
- Refresh tokens for extended sessions
- HttpOnly cookies for token storage (optional, more secure)

### Tenant Isolation
- Tenant ID validated on every request
- OAuth flow includes tenant context
- User-tenant mapping validated before session creation

---

## Error Handling

### Common Errors

**1. OAuth Initiate Fails**
```
Error: Invalid tenant ID
Response: 400 Bad Request
Action: User shown error message to contact support
```

**2. OAuth Callback Fails**
```
Error: Invalid authorization code
Response: Frontend shows "Authentication failed, please try again"
Action: User redirected back to sign-in page
```

**3. State Mismatch (CSRF)**
```
Error: State token mismatch
Response: 403 Forbidden
Action: User shown security error and redirected to sign-in
```

---

## Testing Plan

### Manual Testing

#### Test 1: Google OAuth Flow
1. Start backend: `./mvnw spring-boot:run`
2. Start frontend: `npm run dev`
3. Go to: http://localhost:3000/sign-in
4. Click "Sign in with Google"
5. **Verify**: Redirected to Clerk's OAuth page
6. Authenticate with Google
7. **Verify**: Redirected back to frontend with JWT
8. **Verify**: Header shows "Profile" and "Sign Out"

#### Test 2: Multi-Domain Support
1. Deploy to production with custom domain
2. Configure Clerk redirect URI with production URL
3. Test social login from custom domain
4. **Verify**: OAuth flow works without origin mismatch

### Automated Testing

**Backend Integration Test**:
```java
@Test
public void testGoogleOAuthInitiate() {
    // Mock Clerk API
    // Call /api/oauth/google/initiate
    // Verify redirect to Clerk OAuth URL
}

@Test
public void testGoogleOAuthCallback() {
    // Mock Clerk token exchange
    // Call /api/oauth/google/callback with code
    // Verify JWT token generated
    // Verify user created in database
}
```

---

## Migration Path

### Phase 1: Backend Implementation (1-2 days)
- [ ] Create OAuthController with initiate endpoints
- [ ] Implement OAuth callback handler
- [ ] Add Clerk OAuth integration methods
- [ ] Configure redirect URIs in Clerk dashboard
- [ ] Test backend OAuth flow with Postman

### Phase 2: Frontend Updates (1 day)
- [ ] Remove Google/Facebook/GitHub SDK scripts
- [ ] Update social login buttons to redirect to backend
- [ ] Create OAuth callback page
- [ ] Test full flow end-to-end

### Phase 3: Deployment (1 day)
- [ ] Update production environment variables
- [ ] Configure Clerk redirect URIs for production
- [ ] Deploy backend and frontend
- [ ] Test in production

---

## Comparison: Old vs New Flow

| Aspect | Old Flow (Frontend SDK) | New Flow (Backend OAuth) |
|--------|------------------------|--------------------------|
| **OAuth Initiation** | Frontend loads provider SDK | Backend generates OAuth URL |
| **User Redirect** | Direct to provider (Google, etc.) | To Clerk → Provider |
| **Callback Handler** | Frontend JavaScript | Backend API endpoint |
| **Token Exchange** | Client-side (insecure) | Server-side (secure) |
| **Domain Issues** | ❌ origin_mismatch errors | ✅ No domain restrictions |
| **Security** | ⚠️ Tokens exposed to client | ✅ Tokens stay on server |
| **Multi-Tenant** | ⚠️ Complex tenant handling | ✅ Seamless tenant support |
| **Maintenance** | ⚠️ Multiple SDK versions | ✅ Single Clerk integration |

---

## Advantages of Backend-Driven Approach

### 1. **Domain-Agnostic Architecture**
- Backend handles all OAuth flows
- No hardcoded domains in frontend
- Works with any custom domain without reconfiguration

### 2. **Security**
- Authorization codes never exposed to client
- Tokens exchanged server-side
- CSRF protection with state parameter
- No client-side SDK vulnerabilities

### 3. **Simplified Frontend**
- No Google/Facebook/GitHub SDKs to load
- Simple redirect-based buttons
- Smaller bundle size
- Faster page loads

### 4. **Centralized Control**
- All authentication logic in backend
- Easy to add new providers
- Consistent error handling
- Unified logging and monitoring

### 5. **Multi-Tenant Support**
- Tenant ID passed throughout flow
- Tenant-specific OAuth configurations
- Proper user-tenant mapping

---

## Next Steps

1. **Review this document** with the team
2. **Approve architecture** before implementation
3. **Create Jira tickets** for each phase
4. **Implement Phase 1** (backend endpoints)
5. **Test backend** with Postman/curl
6. **Implement Phase 2** (frontend updates)
7. **Test end-to-end** flow
8. **Deploy to staging** for UAT
9. **Deploy to production**

---

## Status

**Current Status**: 📋 DESIGN COMPLETE - Ready for implementation
**Estimated Time**: 3-4 days
**Priority**: P0 - Blocking social login feature

**Decision Required**: Approve this design before proceeding with implementation.

---
