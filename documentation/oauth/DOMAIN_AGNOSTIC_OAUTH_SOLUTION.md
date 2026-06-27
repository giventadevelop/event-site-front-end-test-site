# Domain-Agnostic OAuth Solution - Custom Credentials

**Date**: October 15, 2025
**Status**: Ready for Configuration (No Code Changes Needed)

---

## Summary

Your current backend OAuth implementation is **already domain-agnostic** ✅

The "invalid_client" error is a **configuration issue**, not an architecture problem. You just need to switch Clerk from "Shared Credentials" to "Custom Credentials" (5-minute fix).

---

## Why Your Current Architecture is Domain-Agnostic

### 1. Backend-Driven OAuth Flow ✅
All OAuth logic lives in backend:
- `OAuthController.java` - Handles OAuth initiation
- `ClerkIntegrationServiceImpl.java` - Generates OAuth URLs
- `OAuthStateService.java` - Manages CSRF protection
- `OAuthCallbackController.java` - Processes OAuth callbacks

**No frontend OAuth dependencies** - Frontend only redirects to backend endpoints.

### 2. Configuration-Based (Not Hardcoded) ✅
All Clerk settings in environment variables:
```yaml
# application-dev.yml
clerk:
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  secret-key: ${CLERK_SECRET_KEY}
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}
```

Different domains? Just change environment variables. Same backend code.

### 3. Generic Frontend Integration ✅
Frontend makes simple API calls:
```typescript
// GoogleSignInButton.tsx
const oauthUrl = `/api/oauth/google/initiate`;
window.location.href = oauthUrl;
```

No domain hardcoding. No Clerk SDK. Just a backend API call.

---

## The Issue: Clerk "Shared Credentials"

Clerk's "Shared Credentials" are development-only credentials designed for:
- **Frontend SDK OAuth** (using `@clerk/clerk-react`)
- **NOT** backend-initiated OAuth

Your backend-initiated OAuth needs **Custom Credentials**.

---

## Solution: Switch to Custom OAuth Credentials

### Step 1: Create Google OAuth App (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com

2. **Select or Create Project**
   - Project name: "MyApp OAuth" (or any name)

3. **Enable Google+ API**
   - Navigation: APIs & Services → Library
   - Search: "Google+ API"
   - Click: Enable

4. **Create OAuth 2.0 Client ID**
   - Navigation: APIs & Services → Credentials
   - Click: Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Name: "MyApp Google OAuth"

5. **Add Authorized Redirect URI**
   ```
   https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
   ```

   **Important**: This is Clerk's callback URL, not your backend URL. Clerk handles the OAuth flow and then redirects to your backend.

6. **Copy Credentials**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx-xxxxxx`

### Step 2: Add to Clerk Dashboard (2 minutes)

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com

2. **Select Application**: humble-monkey-3

3. **Navigate to Social Connections**
   - Sidebar: User & Authentication → Social Connections

4. **Configure Google**
   - Find: Google (should show as "Enabled" with "Shared Credentials")
   - Click: Settings icon or Edit

5. **Switch to Custom Credentials**
   - Select: **"Use custom credentials"** (instead of "Shared")
   - Enter:
     - **Client ID**: `xxxxx.apps.googleusercontent.com`
     - **Client Secret**: `xxxxx-xxxxxx`
   - Save

### Step 3: Test (1 minute)

1. Go to: `http://localhost:3000/sign-in`
2. Click: "Sign in with Google"
3. Should redirect to Google OAuth consent screen (not error)
4. Authorize
5. Redirect back to your app

---

## Why This Maintains Domain-Agnostic Architecture

### Configuration-Only Change ✅
- No backend code changes needed
- No frontend code changes needed
- Just environment variables and Clerk Dashboard configuration

### Backend Stays Generic ✅
```java
// ClerkIntegrationServiceImpl.java - Still domain-agnostic
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    String clerkFrontendApi = clerkProperties.getFrontendApi(); // From config
    String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";
    // ... same code, works with custom credentials
}
```

### Frontend Stays Generic ✅
```typescript
// GoogleSignInButton.tsx - Still domain-agnostic
const oauthUrl = `/api/oauth/google/initiate`;
window.location.href = oauthUrl;
```

### Different Domains? ✅
Deploy to new domain:
1. Create new Clerk application (or use same one)
2. Update environment variables:
   ```yaml
   clerk:
     frontend-api: ${CLERK_FRONTEND_API:https://new-domain.clerk.accounts.dev}
   ```
3. Same backend code, same frontend code

---

## Complete OAuth Flow (Domain-Agnostic)

```
User clicks "Sign in with Google"
    ↓
Frontend: /api/oauth/google/initiate (Generic API call)
    ↓
Next.js Proxy: Adds JWT + Tenant ID headers
    ↓
Backend: OAuthController.initiateOAuth() (Generic)
    ↓
Backend: Reads clerk.frontend-api from config (Environment variable)
    ↓
Backend: Generates OAuth URL using configured Clerk Frontend API
    ↓
Browser redirects to Clerk (Uses custom credentials now)
    ↓
Clerk redirects to Google OAuth
    ↓
User authorizes
    ↓
Google redirects to Clerk: https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback?code=...
    ↓
Clerk processes OAuth (Uses custom credentials)
    ↓
Clerk redirects to backend: http://localhost:8080/api/oauth/google/callback?code=...
    ↓
Backend: OAuthCallbackController.handleCallback() (Generic)
    ↓
Backend: Creates session, returns JWT
    ↓
Frontend: Receives authentication response
    ↓
User logged in! ✅
```

**Every step is domain-agnostic** - controlled by configuration, not hardcoded domains.

---

## Alternative: Direct OAuth (Skip Clerk)

If you want to **completely eliminate** the Clerk dependency, you can implement direct OAuth:

### Pros:
- ✅ No Clerk dependency at all
- ✅ Completely domain-agnostic
- ✅ Full control over OAuth flow

### Cons:
- ⚠️ More backend code to write
- ⚠️ Need to implement for each provider (Google, Facebook, GitHub)
- ⚠️ No Clerk user management features
- ⚠️ More complex session/token handling

### Implementation Complexity:
- **Custom Credentials (Current)**: 5-minute config change ✅
- **Direct OAuth**: 30-60 minutes per provider ⚠️

---

## Recommendation

**Use Custom Credentials (Solution 1)** ✅

**Why**:
1. ✅ **Already implemented** - Backend code is done
2. ✅ **Domain-agnostic** - Configuration-based, no hardcoding
3. ✅ **5-minute fix** - Just add Google OAuth credentials to Clerk
4. ✅ **Backend-driven** - No frontend SDK dependencies
5. ✅ **Scalable** - Add Facebook/GitHub by enabling in Clerk Dashboard

**Your architecture is perfect** - The only issue is a Clerk configuration setting.

---

## Quick Start: Apply Fix Now

### Option A: Use Custom Credentials (5 minutes)
1. Create Google OAuth app in Google Cloud Console
2. Get Client ID and Secret
3. Add to Clerk Dashboard (switch from "Shared" to "Custom")
4. Test OAuth flow

### Option B: Direct OAuth (30-60 minutes)
1. Remove Clerk OAuth dependency
2. Implement direct Google OAuth in backend
3. Update OAuth controllers to call Google APIs directly
4. Test OAuth flow

---

## Files to Reference

All backend OAuth implementation is complete and domain-agnostic:

### Backend (Already Done) ✅
- `src/main/java/com/nextjstemplate/web/rest/OAuthController.java`
- `src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`
- `src/main/java/com/nextjstemplate/service/OAuthStateService.java`
- `src/main/resources/config/application-dev.yml`

### Frontend (Already Done) ✅
- `src/app/api/oauth/[provider]/initiate/route.ts`
- `src/components/auth/GoogleSignInButton.tsx`
- `src/components/auth/FacebookSignInButton.tsx`
- `src/components/auth/GitHubSignInButton.tsx`

### Documentation
- `BACKEND_OAUTH_FIX_APPLIED.md` - Backend changes summary
- `CLERK_OAUTH_CONFIGURATION_GUIDE.md` - Clerk setup guide
- `CLERK_BACKEND_OAUTH_ISSUE.md` - Issue explanation

---

## Environment Variables (Domain-Agnostic)

```yaml
# Backend: application-dev.yml
clerk:
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  secret-key: ${CLERK_SECRET_KEY}
  webhook-secret: ${CLERK_WEBHOOK_SECRET}
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}

server:
  base-url: ${SERVER_BASE_URL:http://localhost:8080}

frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

**To deploy to new domain**:
- Change `CLERK_FRONTEND_API` environment variable
- Change `SERVER_BASE_URL` environment variable
- Change `FRONTEND_URL` environment variable
- Same code, different configuration ✅

---

## Summary

**Your Question**: "Is it easy to keep everything in the back end? Will frontend SDK be domain agnostic?"

**Answer**:
1. ✅ **Everything IS in the backend** - Already implemented correctly
2. ❌ **Frontend SDK is NOT domain-agnostic** - Don't use it
3. ✅ **Current implementation IS domain-agnostic** - Configuration-based
4. ✅ **5-minute fix** - Just add custom OAuth credentials to Clerk

**Next Step**: Create Google OAuth credentials and add to Clerk Dashboard (5 minutes).

**No code changes needed** - Your architecture is already perfect for domain-agnostic deployment.
