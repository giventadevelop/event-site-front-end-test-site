# Google Cloud Console OAuth Configuration - Verification Guide

## 🎯 Current Status

✅ **Clerk Configuration - VERIFIED**:
- Allowed origins correctly configured (3 domains)
- Proxy configuration verified and working
- Satellite domain active

❌ **OAuth Still Failing**:
- Error: `authorization_invalid` at callback
- URL: `https://clerk.adwiise.com/v1/oauth_callback?err_code=authorization_invalid`

---

## 🔍 Root Cause Analysis

The issue is likely in **Google Cloud Console OAuth Client ID configuration**, specifically the **"Authorized JavaScript origins"** field.

### Why This Matters:

Google OAuth has TWO separate configuration fields:

1. **Authorized JavaScript origins** - WHERE the OAuth request originates from
2. **Authorized redirect URIs** - WHERE Google sends the callback to

You already have the redirect URIs configured correctly, but the **JavaScript origins** might be missing the Amplify domain.

---

## ✅ Verification Steps

### Step 1: Go to Google Cloud Console

1. **Navigate to**: https://console.cloud.google.com/apis/credentials
2. **Select Project**: `kccna_app` (or your project name)
3. **Find OAuth Client ID**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
4. **Click**: The edit icon (pencil) on the right side

---

### Step 2: Check "Authorized JavaScript origins"

This section should include **ALL domains** where your app runs:

**Expected Configuration**:
```
Authorized JavaScript origins:
✓ https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
✓ https://www.adwiise.com
✓ https://clerk.adwiise.com
✓ http://localhost:3000
```

**Missing Configuration (likely cause of error)**:
```
Authorized JavaScript origins:
✓ https://www.adwiise.com
✓ https://clerk.adwiise.com
✓ http://localhost:3000
❌ https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com  ← MISSING!
```

---

### Step 3: Check "Authorized redirect URIs"

This section should already be correct, but verify:

**Expected Configuration**:
```
Authorized redirect URIs:
✓ https://clerk.adwiise.com/v1/oauth_callback
✓ https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
✓ https://www.adwiise.com/sso-callback
✓ http://localhost:3000/sso-callback
```

---

## 🛠️ Fix Instructions

### If Amplify Domain is Missing from "Authorized JavaScript origins":

1. **Click**: "Add URI" under "Authorized JavaScript origins"
2. **Enter**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
3. **Click**: "Save" at the bottom of the page
4. **Wait**: 2-5 minutes for Google to propagate changes

---

### If Amplify Domain is Missing from "Authorized redirect URIs":

1. **Click**: "Add URI" under "Authorized redirect URIs"
2. **Enter**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback`
3. **Click**: "Save" at the bottom of the page
4. **Wait**: 2-5 minutes for Google to propagate changes

---

## 🧪 Testing After Fix

### Step 1: Wait for Propagation
- **Wait**: 5 minutes minimum after saving changes
- Google's OAuth configuration can take time to update globally

### Step 2: Clear Browser Session

Open browser console (F12) on your app and run:

```javascript
// Clear all cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Reload page
location.reload();
```

### Step 3: Test OAuth Flow

1. **Go to**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
2. **Click**: "Continue with Google"
3. **Select**: Your Google account
4. **Expected Result**:
   - ✅ No `authorization_invalid` error
   - ✅ Redirects back to your app successfully
   - ✅ User is logged in
   - ✅ User profile/avatar visible

---

## 🔍 How to Identify the Issue

### Scenario 1: JavaScript Origins Missing

**Symptoms**:
- OAuth flow starts (Google page appears)
- User selects account
- Google shows error: "Error 400: redirect_uri_mismatch" OR "Error 400: invalid_request"
- OR callback fails with `authorization_invalid`

**Fix**: Add Amplify domain to "Authorized JavaScript origins"

---

### Scenario 2: Redirect URI Missing

**Symptoms**:
- OAuth flow starts (Google page appears)
- User selects account
- Google shows error: "Error 400: redirect_uri_mismatch"
- Error message specifically mentions the redirect URI

**Fix**: Add Amplify domain callback URL to "Authorized redirect URIs"

---

### Scenario 3: Both Configurations Missing

**Symptoms**:
- OAuth flow fails immediately
- Multiple errors in different stages
- Inconsistent behavior

**Fix**: Add Amplify domain to BOTH fields

---

## 📋 Complete Configuration Checklist

### Google Cloud Console - OAuth Client ID: `303554160954`

**Authorized JavaScript origins**:
- [ ] `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
- [ ] `https://www.adwiise.com`
- [ ] `https://clerk.adwiise.com`
- [ ] `http://localhost:3000`

**Authorized redirect URIs**:
- [ ] `https://clerk.adwiise.com/v1/oauth_callback`
- [ ] `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback`
- [ ] `https://www.adwiise.com/sso-callback`
- [ ] `http://localhost:3000/sso-callback`

**Save and Wait**:
- [ ] Clicked "Save" button
- [ ] Waited 5 minutes for propagation
- [ ] Cleared browser cookies/session
- [ ] Tested OAuth flow

---

## 🎯 Expected Successful OAuth Flow

After fixing the configuration:

```
1. User visits: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in
2. Clicks: "Continue with Google"
3. Browser initiates OAuth from: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   ↓
4. Google checks: Is this origin in "Authorized JavaScript origins"? ✓
   ↓
5. Google shows: Account selection page ✓
   ↓
6. User selects account ✓
   ↓
7. Google redirects to: clerk.adwiise.com/v1/oauth_callback
   ↓
8. Google checks: Is this URI in "Authorized redirect URIs"? ✓
   ↓
9. Clerk verifies:
   - OAuth state parameter ✓
   - Origin is in allowed_origins (feature-common-clerk) ✓
   - Client ID matches ✓
   ↓
10. Clerk redirects to: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback ✓
    ↓
11. User is logged in successfully ✓
```

---

## 🆘 If Still Not Working

### Check Clerk Dashboard Logs

1. **Go to**: https://dashboard.clerk.com/logs
2. **Filter by**: "OAuth" or recent timestamp
3. **Look for**: Your failed authentication attempt
4. **Check error details**: Should show specific reason

**Common error messages**:
- `"origin not whitelisted"` → Clerk allowed_origins issue (already fixed ✓)
- `"invalid_request"` → Google Cloud Console configuration issue
- `"redirect_uri_mismatch"` → Google redirect URI configuration issue
- `"invalid_client"` → Client ID/Secret mismatch in Clerk

---

### Check Browser Console

1. **Open**: DevTools (F12)
2. **Go to**: Console tab
3. **Clear console**
4. **Try OAuth flow again**
5. **Look for errors**: CORS, redirect, or authentication errors

**Common console errors**:
- `CORS policy: No 'Access-Control-Allow-Origin'` → Clerk allowed_origins issue
- `Failed to fetch` → Network or proxy issue
- `redirect_uri_mismatch` → Google Cloud Console issue

---

## 💡 Why This Happens

### The OAuth Security Model

Google OAuth implements a multi-layer security model:

1. **JavaScript Origins Check** (BEFORE showing login page):
   - Google verifies: "Is the website requesting OAuth authorized?"
   - If NOT in list → Error before user even sees Google login

2. **Redirect URI Check** (AFTER authentication):
   - Google verifies: "Is the callback URL authorized?"
   - If NOT in list → Error after user authenticates

3. **Clerk Origin Check** (DURING callback):
   - Clerk verifies: "Is the original requesting origin allowed?"
   - If NOT in list → `authorization_invalid` error

### Why All Three Must Match

Your OAuth flow crosses multiple domains:
- **Originating domain**: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
- **Callback domain**: `clerk.adwiise.com`
- **Final redirect**: Back to `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

All three systems (Google, Clerk, your app) must allow this flow.

---

## 📚 Related Documentation

- [Google OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OAuth 2.0 Security Best Practices](https://oauth.net/2/security-best-practices/)
- [Clerk Multi-Domain Authentication](https://clerk.com/docs/deployments/set-up-multiple-domains)
- [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

---

## ✅ Success Indicators

After fixing the configuration, you should see:

1. ✅ Google OAuth page appears
2. ✅ User can select account without errors
3. ✅ No `redirect_uri_mismatch` error
4. ✅ No `authorization_invalid` error
5. ✅ User redirects back to app successfully
6. ✅ User is logged in
7. ✅ No errors in browser console
8. ✅ No errors in Clerk Dashboard logs

---

## 🎉 Final Notes

This Google Cloud Console configuration is the **most common cause** of the `authorization_invalid` error when:
- ✅ Clerk allowed origins are correct (verified ✓)
- ✅ Clerk proxy is working (verified ✓)
- ✅ OAuth credentials are configured in Clerk (verified ✓)
- ❌ OAuth still fails at callback

Adding the Amplify domain to **"Authorized JavaScript origins"** in Google Cloud Console should resolve the issue.

---

**Last Updated**: 2025-01-22
**Status**: ACTION REQUIRED - Verify Google Cloud Console OAuth configuration
**Priority**: CRITICAL - Most likely remaining cause of OAuth failure
