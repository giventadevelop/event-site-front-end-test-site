# Next Steps After Removing Satellite Domain

## Current Status

✅ **Completed**:
1. Removed Amplify domain from Satellite Domains
2. Google OAuth Client ID configured with Amplify domain
3. Clerk Dashboard shows "No satellite domains"

❌ **Still Failing**:
- OAuth returns `authorization_invalid` after Google auth succeeds
- Latest trace ID: `3330518b604fb41bd6f5f5afed8efccc`

---

## Next Steps

### Step 1: Verify Allowed Origins (IN PROGRESS)

Running PowerShell script to check current allowed origins configuration.

**Expected Output**:
```powershell
Instance ID: ins_***
Environment: production

Current allowed origins:
  - https://www.adwiise.com
  - https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
  - http://localhost:3000
```

**If Amplify domain is MISSING**:
- Add it using Clerk API
- Wait 2 minutes
- Test OAuth again

**If Amplify domain is PRESENT**:
- Investigate other potential causes (see below)

---

### Step 2: Alternative Causes to Investigate

If allowed origins is correct but OAuth still fails, check:

#### A. Clerk Environment in Amplify

Verify AWS Amplify environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_***`
- `CLERK_SECRET_KEY` = `sk_live_***`

**Common issue**: Amplify might be using test keys instead of production keys.

#### B. Clerk Dashboard - Check Instance Settings

1. Go to: https://dashboard.clerk.com/
2. Select: Production instance
3. Check: **Configure → Sessions → Session management**
4. Verify: "Allow sessions from" is NOT restricted to specific domains

#### C. Check Clerk Restrictions

1. Go to: Clerk Dashboard → **Configure → Restrictions**
2. Check: "Block disposable email domains" or other restrictions
3. Verify: No IP restrictions blocking Amplify's infrastructure

#### D. Check OAuth Provider Settings

1. Go to: Clerk Dashboard → **Configure → SSO connections → Google**
2. Verify: Status shows "Connected" or "Active"
3. Check: No domain restrictions on the OAuth provider itself

---

### Step 3: Test with Clerk Logs

Use the trace ID to see detailed error information:

1. **Go to**: https://dashboard.clerk.com/logs
2. **Search**: `3330518b604fb41bd6f5f5afed8efccc`
3. **Look for**: Specific error message beyond "authorization_invalid"
4. **Check**: What Clerk is actually rejecting (origin, user, OAuth state, etc.)

**Common log messages**:
- "Origin not in allowed origins" → Allowed origins issue
- "OAuth state mismatch" → Session/cookie issue
- "User blocked" → User restriction issue
- "Invalid OAuth callback" → OAuth provider configuration issue

---

### Step 4: Nuclear Option - Clear All Clerk Sessions

If nothing else works, try clearing ALL Clerk sessions:

```javascript
// In browser console on Amplify domain
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.adwiise.com");
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.amplifyapp.com");
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

location.reload();
```

Then test OAuth again in fresh incognito window.

---

### Step 5: Contact Clerk Support (Last Resort)

If all else fails, contact Clerk support with:

**Subject**: OAuth authorization_invalid after satellite domain removal

**Message**:
```
Hi Clerk team,

I'm experiencing OAuth authorization_invalid errors on production instance after removing satellite domain configuration.

Instance ID: ins_***
Latest Trace ID: 3330518b604fb41bd6f5f5afed8efccc
Domain: feature-common-clerk.d1508w3f27cyps.amplifyapp.com

Configuration:
✅ Google OAuth Client ID includes domain in authorized origins
✅ Clerk allowed origins should include domain (verifying via API)
✅ Removed from satellite domains (showed "Unverified")
✅ Google OAuth succeeds and returns authorization code
❌ Clerk rejects callback with authorization_invalid

Request: Please check trace ID logs for specific rejection reason.

Thank you!
```

**Clerk Support**:
- Discord: https://clerk.com/discord (fastest - 30min response)
- Dashboard: https://dashboard.clerk.com/support (24-48hr response)

---

## Most Likely Issue

Based on error pattern, the most likely causes in order:

1. **Amplify domain not in allowed origins** (70% probability)
   - Fix: Add via API, wait 2min, test

2. **Environment variables mismatch** (20% probability)
   - Amplify using test keys instead of production keys
   - Fix: Verify Amplify env vars match production keys

3. **Clerk session/cookie issue** (5% probability)
   - Stale Clerk session blocking new OAuth
   - Fix: Clear all cookies, test in incognito

4. **Clerk internal issue** (5% probability)
   - Platform bug after satellite domain removal
   - Fix: Contact Clerk support

---

## Current Action

**Waiting for**: PowerShell script output showing current allowed origins

**Next**: Based on output, either:
- Add Amplify domain to allowed origins
- OR investigate alternative causes

---

**Created**: 2025-10-23
**Status**: IN PROGRESS
**Priority**: HIGH
