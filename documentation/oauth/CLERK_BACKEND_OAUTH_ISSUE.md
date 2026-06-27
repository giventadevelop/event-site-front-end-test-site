# Clerk Backend OAuth Issue - "invalid_client" Error

## Current Situation

✅ **Backend Code**: Working correctly - generating proper Clerk URLs
✅ **Clerk Configuration**: Google enabled with "Shared Credentials"
❌ **OAuth Flow**: Failing with "invalid_client" error

## The Problem

**Error**:
```json
{
  "error": "invalid_client",
  "error_description": "The requested OAuth 2.0 Client does not exist."
}
```

**Root Cause**: Clerk's "Shared Credentials" are designed for **frontend-only OAuth** using Clerk's JavaScript SDK (`@clerk/clerk-react`, `@clerk/nextjs`), not for **backend-initiated OAuth flows**.

When you use "Shared Credentials", Clerk expects:
- OAuth to be initiated from the frontend using Clerk Components (`<SignIn />`, `<SignUp />`)
- Clerk's JavaScript SDK to handle the OAuth flow
- NOT custom backend OAuth endpoints

## Why Our Approach Doesn't Work with Shared Credentials

Our implementation:
1. Frontend button → Backend OAuth endpoint
2. Backend generates Clerk OAuth URL
3. Backend redirects user to Clerk
4. Clerk needs to know which "OAuth client" made the request

With "Shared Credentials", Clerk doesn't recognize requests from custom backends because:
- No OAuth Client ID/Secret registered for backend
- Clerk expects requests from their own JavaScript SDK
- The "client" Clerk is looking for is the SDK, not your backend

## Solutions

### Solution 1: Use Custom Google OAuth Credentials (Recommended)

This allows your backend to initiate OAuth directly through Clerk.

#### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create or select a project**
3. **Enable Google+ API**:
   - APIs & Services → Library
   - Search "Google+ API" → Enable

4. **Create OAuth 2.0 Client ID**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: "MyApp Google OAuth"

5. **Add Authorized Redirect URIs**:
   ```
   https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
   ```

6. **Get Credentials**:
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx-xxxxxx`

#### Step 2: Add Credentials to Clerk

1. Go to Clerk Dashboard
2. SSO connections → Google → Settings icon
3. Switch from "Shared Credentials" to **"Use custom credentials"**
4. Enter:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
5. Save

#### Step 3: Test

Click social login button - should now work!

---

### Solution 2: Use Clerk's Frontend Components (Alternative)

Instead of custom backend OAuth, use Clerk's built-in components.

#### Update Frontend to Use Clerk Components

**Install Clerk React**:
```bash
npm install @clerk/clerk-react
```

**Update `src/app/layout.tsx`**:
```typescript
import { ClerkProvider } from '@clerk/clerk-react';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Update Sign-In Page**:
```typescript
import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return <SignIn routing="path" path="/sign-in" />;
}
```

**Benefits**:
- Works immediately with "Shared Credentials"
- No backend OAuth code needed
- Handles all OAuth flows automatically
- Clerk-hosted UI components

**Drawbacks**:
- Less control over UI/flow
- Requires frontend Clerk SDK
- Not domain-agnostic (tied to Clerk)

---

### Solution 3: Hybrid Approach

Use Clerk Components for OAuth, but keep your custom backend authentication.

1. **Use Clerk Components for social login** (Google, Facebook, GitHub)
2. **Use your custom backend for email/password authentication**
3. **Backend validates Clerk session tokens** after OAuth completes

---

## Recommendation

**For your use case** (domain-agnostic, backend-driven approach):

➡️ **Use Solution 1: Custom Google OAuth Credentials**

**Why**:
- ✅ Maintains your backend-driven architecture
- ✅ Domain-agnostic (not tied to Clerk's frontend SDK)
- ✅ Full control over OAuth flow
- ✅ Works with your existing backend OAuth implementation
- ⚠️ Requires creating Google OAuth app (one-time setup, ~5 minutes)

**Steps**:
1. Create Google OAuth credentials (see Solution 1 above)
2. Add credentials to Clerk Dashboard
3. Test - should work immediately

---

## Alternative: Skip Clerk for OAuth Entirely

If Clerk's OAuth limitations are problematic, consider:

**Direct Google OAuth** (without Clerk):
1. Your backend initiates OAuth with Google directly
2. Google redirects back to your backend
3. Backend exchanges code for Google user data
4. Backend creates local user session
5. No Clerk involved in OAuth flow

**Pros**:
- Complete control
- No Clerk limitations
- Truly domain-agnostic

**Cons**:
- More code to write/maintain
- Need to implement OAuth for each provider (Google, Facebook, GitHub)
- No Clerk's user management features

---

## What We've Accomplished

✅ **Backend OAuth Infrastructure**: Complete and working
✅ **Frontend Proxy Layer**: Adds JWT and tenant ID correctly
✅ **Domain-Agnostic Architecture**: Ready for multi-domain deployment
⏳ **Clerk Configuration**: Needs custom OAuth credentials

---

## Quick Fix Summary

**Option A: Use Custom Credentials** (5 minutes):
1. Create Google OAuth app in Google Cloud Console
2. Get Client ID and Secret
3. Add to Clerk Dashboard (switch from "Shared" to "Custom")
4. Test

**Option B: Use Clerk Frontend SDK** (10 minutes):
1. Install `@clerk/clerk-react`
2. Wrap app in `<ClerkProvider>`
3. Use `<SignIn />` component
4. Test

**Option C: Remove Clerk from OAuth** (30 minutes):
1. Implement direct Google OAuth in backend
2. Remove Clerk OAuth code
3. Update frontend to call your backend directly
4. Test

---

## Decision Point

**Question**: Do you want to:
1. ✅ **Continue with Clerk** → Need custom OAuth credentials
2. ❌ **Skip Clerk for OAuth** → Implement direct OAuth

Let me know which direction you'd like to go, and I can help implement it!
