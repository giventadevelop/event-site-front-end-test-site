# OAuth Client ID Mismatch - Critical Discovery

## Current Situation

**Observation**: Google Cloud Console OAuth Client ID has been configured with all required domains, but OAuth still fails with `authorization_invalid`.

**New Trace ID**: `28f03bf0e5514f66c6c959af7943a8f0`

## Critical Finding

The Google Cloud Console shows OAuth Client ID configuration for:
```
Client ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
Name: kcona_app
```

**Configured Origins** (Screenshot confirms):
- ✅ `https://www.adwiise.com`
- ✅ `https://humble-monkey-3.clerk.accounts.dev` (test instance)
- ✅ `http://localhost:3000`
- ✅ `http://localhost:8080`
- ✅ `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com` ← **ADDED**

**Configured Redirect URIs**:
- ✅ `https://clerk.adwiise.com/v1/oauth_callback`
- ✅ `https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback`
- ✅ `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback`

## The Real Problem

### Hypothesis: Clerk Dashboard Has Wrong Client ID

The production Clerk instance (`clerk.adwiise.com`) might be configured with a **DIFFERENT Google OAuth Client ID** than the one shown in Google Cloud Console.

### Evidence:
1. ✅ OAuth works on `www.adwiise.com`
2. ❌ OAuth fails on Amplify domain
3. ✅ Amplify domain IS in Google OAuth config
4. ❌ Still getting `authorization_invalid`

This pattern suggests: **Clerk is using a different Google Client ID**

## Required Verification Steps

### Step 1: Check Clerk Dashboard OAuth Configuration

1. **Go to**: https://dashboard.clerk.com/
2. **Select**: Production instance (`clerk.adwiise.com`)
3. **Navigate to**: Configure → SSO Connections → Google
4. **Verify**: What Google Client ID is configured?
5. **Check**: Is it `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`?

### Step 2: Compare Client IDs

**Expected in Clerk Dashboard**:
```
Client ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

**If Different**:
- Either update Clerk to use this Client ID
- OR add Amplify domain to the OTHER Client ID in Google Cloud Console

### Step 3: Check for Multiple Google OAuth Connections

In Clerk Dashboard, check if there are **multiple Google OAuth configurations**:
- One for production domain (`www.adwiise.com`)
- One for test instance (`humble-monkey-3.clerk.accounts.dev`)
- These might use different Client IDs

## Alternative: Check Clerk Logs

Use trace ID `28f03bf0e5514f66c6c959af7943a8f0` to get detailed error:

1. **Go to**: https://dashboard.clerk.com/logs
2. **Filter by**: Trace ID
3. **Search**: `28f03bf0e5514f66c6c959af7943a8f0`
4. **Look for**: "Google Client ID mismatch" or similar error
5. **Check**: Which Client ID does the log mention?

## Most Likely Scenarios

### Scenario 1: Test vs Production Client ID
You configured the test instance Client ID but production uses a different one.

**Fix**: Configure production Clerk instance with the correct Client ID

### Scenario 2: Multiple Google Providers
Clerk has multiple Google OAuth providers configured, using different Client IDs.

**Fix**: Update the correct provider with Amplify domain

### Scenario 3: Environment Variable Override
Amplify environment variables might specify a different Google Client ID.

**Check**: AWS Amplify Console → Environment Variables → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Quick Diagnostic Test

### Test 1: Check Which Client ID is Being Used

1. Open browser DevTools (F12) on Amplify domain
2. Start OAuth flow ("Sign in with Google")
3. In Network tab, find the Google OAuth request
4. Check the `client_id` parameter in the URL
5. Compare with `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`

**If Different**: That's your answer - Clerk is using a different Client ID

### Test 2: Check Clerk Environment Configuration

**In local `.env.production`**:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

**In Amplify Console** (check environment variables):
- Does `NEXT_PUBLIC_GOOGLE_CLIENT_ID` exist?
- Does it match the one you configured in Google Cloud?

## Expected Resolution

Once you identify which Client ID Clerk is **actually using**:

1. **Option A**: Update that Client ID in Google Cloud Console with Amplify domain
2. **Option B**: Update Clerk to use the Client ID you already configured

## Key Insight

The fact that OAuth works on `www.adwiise.com` but fails on Amplify domain (even after adding to Google Cloud Console) strongly suggests:

**Clerk is configured with TWO different Google Client IDs**:
- One for `www.adwiise.com` (which has all domains configured)
- One for Amplify domain (which is missing configuration)

OR

**Clerk is using a completely different Client ID** than `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`

---

**Created**: 2025-10-23
**Status**: NEEDS INVESTIGATION
**Priority**: CRITICAL
**Next Action**: Check Clerk Dashboard to identify which Google Client ID is configured
