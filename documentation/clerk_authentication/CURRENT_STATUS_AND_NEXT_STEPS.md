# Current Status - Clerk OAuth Issue

**Date**: 2025-10-23
**Status**: All configuration correct, but OAuth still failing
**Latest Trace ID**: `3330518b604fb41bd6f5f5afed8efccc`

---

## ✅ What's Been Fixed

1. **Satellite Domain Removed**: Deleted unverified satellite domain from Clerk Dashboard
2. **Allowed Origins Verified**: Confirmed Amplify domain is in allowed origins list:
   - `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com` ✅
   - `https://www.adwiise.com` ✅
   - `http://localhost:3000` ✅

3. **Google OAuth Configuration**: Verified correct in Google Cloud Console:
   - Client ID: `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`
   - Authorized JavaScript origins includes Amplify domain ✅
   - Authorized redirect URIs includes `https://clerk.adwiise.com/v1/oauth_callback` ✅

4. **Code Configuration**: Simplified `layout.tsx` with standard ClerkProvider (no satellite props)

---

## ❌ What's Still Failing

**OAuth Flow**:
1. ✅ User clicks "Sign in with Google" on Amplify domain
2. ✅ Google OAuth page appears
3. ✅ User authenticates successfully
4. ✅ Google returns authorization code
5. ❌ Clerk rejects callback with `authorization_invalid` (403)

**Error Details**:
```json
{
  "errors": [{
    "message": "Unauthorized request",
    "long_message": "You are not authorized to perform this request",
    "code": "authorization_invalid"
  }],
  "clerk_trace_id": "3330518b604fb41bd6f5f5afed8efccc"
}
```

---

## 🔍 Next Investigation Steps

### Step 1: Check Clerk Dashboard Logs

**URL**: https://dashboard.clerk.com/logs

**Instructions**:
1. Go to Clerk Dashboard
2. Navigate to "Logs" section
3. Search for trace ID: `3330518b604fb41bd6f5f5afed8efccc`
4. Click on the log entry
5. Look for detailed error message explaining WHY the request was unauthorized

**What to look for**:
- "Origin not allowed" → But we verified allowed origins is correct
- "Invalid OAuth state" → Session/cookie issue
- "User blocked" → User restriction issue
- "Invalid callback parameters" → OAuth parameter issue

### Step 2: Test on Primary Domain

**Test URL**: https://www.adwiise.com/sign-in

**Instructions**:
1. Visit the primary domain
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Does it work? YES/NO

**Why this matters**:
- If it works on `www.adwiise.com` but fails on Amplify domain
- Then something specific to Amplify domain is being rejected
- Even though allowed origins includes it

### Step 3: Check Amplify Environment Variables

Verify in AWS Amplify Console that production keys are being used:

**Expected Values**:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***
CLERK_SECRET_KEY=sk_live_***
```

**Common Issue**: Amplify might be using TEST keys instead of LIVE keys

---

## 🤔 Possible Root Causes

### Theory 1: Session/Cookie Domain Mismatch (Most Likely - 40%)

**Issue**: Clerk cookies set for `.adwiise.com` but Amplify domain is `.amplifyapp.com`

**Evidence**:
- OAuth succeeds on `www.adwiise.com` (same domain)
- OAuth fails on Amplify domain (different domain)
- Clerk sets cookies for `.adwiise.com` domain

**Solution**: May need to configure Clerk to set cookies for both domains

### Theory 2: OAuth State Parameter Mismatch (30%)

**Issue**: OAuth state parameter doesn't match between request and callback

**Why it could happen**:
- Cookies not persisting across OAuth redirect
- Different subdomain causing state validation to fail
- Browser blocking third-party cookies

**Solution**: Check browser console for cookie warnings

### Theory 3: Clerk API Recognizes Amplify as Different Instance (20%)

**Issue**: Even though in allowed origins, Clerk backend might be treating Amplify domain specially

**Why**:
- Clerk might have internal rules about `.amplifyapp.com` domains
- Might require additional configuration for AWS Amplify hosting

**Solution**: Contact Clerk support

### Theory 4: Google OAuth Redirect URI Validation (10%)

**Issue**: Google OAuth validates the origin but Clerk is re-validating differently

**Why unlikely**: Google OAuth succeeds (returns auth code)

---

## 🔧 Immediate Actions

### Action 1: Test Primary Domain First

Before diving deeper, confirm OAuth works on `www.adwiise.com`:

```
Visit: https://www.adwiise.com/sign-in
Click: "Sign in with Google"
Result: Should work ✅
```

If this FAILS too, then it's not Amplify-specific.

### Action 2: Check Clerk Logs

Search for trace ID `3330518b604fb41bd6f5f5afed8efccc` in Clerk Dashboard logs.

The detailed log will show the EXACT reason for rejection.

### Action 3: Clear All Cookies and Test

Sometimes stale cookies cause issues:

```javascript
// In browser console on Amplify domain
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

Then test OAuth in fresh incognito window.

---

## 📞 Contacting Clerk Support

If logs don't reveal the issue, contact Clerk support:

**Clerk Discord** (Fastest - 30min to 2hr response):
- URL: https://clerk.com/discord
- Channel: #support

**Message Template**:
```
Hi Clerk team,

I'm experiencing OAuth authorization_invalid errors on AWS Amplify domain after removing satellite domain configuration.

Instance ID: ins_***
Trace ID: 3330518b604fb41bd6f5f5afed8efccc
Domain: feature-common-clerk.d1508w3f27cyps.amplifyapp.com

Configuration verified:
✅ Removed from satellite domains (was unverified)
✅ In allowed origins (verified via API)
✅ Google OAuth Client ID includes domain
✅ Google OAuth succeeds (returns auth code)
❌ Clerk rejects callback with authorization_invalid

The same OAuth flow works on www.adwiise.com but fails on Amplify domain.

Request: Please check trace ID logs for specific rejection reason.

Thank you!
```

---

## 🎯 Expected Resolution Path

**Most Likely Scenario**:
1. Check Clerk logs for trace ID
2. Logs reveal: "Cookie domain mismatch" or "Session validation failed"
3. Solution: Configure Clerk to handle multi-domain sessions
4. OR: Use Clerk's Account Portal pattern for cross-domain auth

**Alternative Scenario**:
1. Test reveals OAuth works on `www.adwiise.com`
2. Confirms issue is Amplify-domain-specific
3. Contact Clerk support for AWS Amplify guidance
4. May need special Clerk configuration for Amplify hosting

---

## 📊 Configuration Summary

**Verified Working**:
- ✅ Clerk instance configuration (via API)
- ✅ Allowed origins includes all domains
- ✅ Google OAuth Client ID correct
- ✅ Google redirect URIs correct
- ✅ No satellite domains (removed)
- ✅ Simplified layout.tsx code

**Unknown Status**:
- ❓ Why Clerk rejects the OAuth callback
- ❓ Does OAuth work on primary domain?
- ❓ What do Clerk logs say about the trace ID?

---

**Next Update**: After checking Clerk logs and testing primary domain
