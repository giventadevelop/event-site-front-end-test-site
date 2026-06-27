# OAuth Callback Authorization Error - Final Fix

## 🔍 Current Issue

**Error**: `authorization_invalid` at OAuth callback
**URL**: `https://clerk.adwiise.com/v1/oauth_callback?err_code=authorization_invalid`

**What's Happening**:
1. ✅ User clicks "Sign in with Google" on Amplify domain
2. ✅ Google authentication page appears
3. ✅ User selects Google account
4. ❌ **Callback fails** with `authorization_invalid`

---

## 🎯 Root Cause

The OAuth callback is going to `clerk.adwiise.com` (your primary domain), but Google OAuth is configured with a Client ID that may have origin restrictions.

### The OAuth Flow:

```
User on: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
  ↓
Clicks "Sign in with Google"
  ↓
Redirects to: accounts.google.com (with origin info)
  ↓
User authenticates ✓
  ↓
Google tries to callback to: clerk.adwiise.com/v1/oauth_callback
  ↓
Clerk checks if the original request origin is authorized
  ↓
Original origin was: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
  ↓
❌ Clerk says: "This origin is not authorized for this OAuth flow"
```

---

## ✅ Solution: Add Amplify Domain to Clerk's Allowed Origins

Clerk needs to explicitly allow OAuth callbacks from your Amplify satellite domain.

### Option 1: Use PowerShell Script (Recommended)

You already have the script! Let's use it:

#### Step 1: Run the Script

```powershell
cd documentation/clerk_authentication
.\Add-ClerkAllowedOrigins.ps1
```

#### Step 2: Add These Origins

When prompted, add:
```
https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
https://www.adwiise.com
http://localhost:3000
```

#### Step 3: Verify

```powershell
.\Get-ClerkAllowedOrigins.ps1
```

Should show all three origins listed.

---

### Option 2: Use Clerk API Directly

If you prefer to use the API directly:

```powershell
$secretKey = "sk_live_***_CLERK_SECRET_KEY_HERE"

$headers = @{
    "Authorization" = "Bearer $secretKey"
    "Content-Type" = "application/json"
}

$body = @{
    allowed_origins = @(
        "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com",
        "https://www.adwiise.com",
        "http://localhost:3000"
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Method PATCH -Headers $headers -Body $body
```

---

### Option 3: Check Clerk Dashboard (if available in UI)

Some Clerk plans have a UI option:

1. Go to: Clerk Dashboard > **Configure** > **Settings**
2. Look for: **"Allowed Origins"** or **"CORS Origins"**
3. Add: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

**Note**: This option may not be visible in all Clerk plans.

---

## 🔍 Verification Steps

### Step 1: Verify Origins Are Whitelisted

Run this PowerShell command:

```powershell
cd documentation/clerk_authentication
.\Get-ClerkAllowedOrigins.ps1
```

**Expected Output**:
```
Allowed Origins: 3

  - https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
  - https://www.adwiise.com
  - http://localhost:3000
```

---

### Step 2: Wait for Propagation

Clerk configuration changes can take **2-5 minutes** to propagate.

**Wait time**: 5 minutes after adding origins

---

### Step 3: Clear Browser Session

Before testing again, clear Clerk cookies:

```javascript
// Open browser console (F12) on your app
// Paste this code:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Then refresh the page
location.reload();
```

---

### Step 4: Test OAuth Again

1. Go to: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
2. Click "Continue with Google"
3. Select Google account
4. Should redirect back **successfully** ✓
5. Should be logged in ✓
6. **No authorization_invalid error** ✓

---

## 🆘 If Still Not Working

### Check 1: Verify Google Cloud Console

The issue might also be with Google OAuth configuration.

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Find**: OAuth Client ID `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m...`
3. **Check "Authorized JavaScript origins"**:

   Should include:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   https://www.adwiise.com
   https://clerk.adwiise.com
   http://localhost:3000
   ```

4. **Check "Authorized redirect URIs"**:

   Should include:
   ```
   https://clerk.adwiise.com/v1/oauth_callback
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
   https://www.adwiise.com/sso-callback
   http://localhost:3000/sso-callback
   ```

5. **If anything is missing**, add it and **Save**
6. **Wait 2-5 minutes** for Google changes to propagate

---

### Check 2: Verify Clerk Middleware

Make sure your middleware allows the satellite domain.

**File**: `src/middleware.ts`

Should have the satellite domain in `authorizedParties` (optional but recommended):

```typescript
export default authMiddleware({
  // ... other config ...

  // Optional: Add authorized parties for additional security
  authorizedParties: [
    'https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com',
    'https://www.adwiise.com',
    'http://localhost:3000',
  ],

  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
    // ... other public routes
  ],
});
```

**Note**: This is optional for satellite domains, but adds extra CSRF protection.

---

### Check 3: Clerk Dashboard Logs

Check for more detailed error information:

1. **Go to**: https://dashboard.clerk.com/logs
2. **Filter by**: "OAuth" or time of your test
3. **Look for**: The failed OAuth attempt
4. **Check error details**: Should show specific reason for failure

**Common error reasons**:
- "Origin not whitelisted" → Need to add to allowed_origins
- "Invalid redirect URI" → Check Google Cloud Console
- "Client ID mismatch" → Verify Google Client ID in Clerk
- "Invalid state parameter" → Session/cookie issue

---

## 🔧 Quick Fix Commands

### Add Allowed Origins (PowerShell)

```powershell
# Navigate to scripts directory
cd C:\Users\gain\git\malayalees-us-site\documentation\clerk_authentication

# Run the script
.\Add-ClerkAllowedOrigins.ps1 -Origins @(
    "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com",
    "https://www.adwiise.com",
    "http://localhost:3000"
)

# Verify
.\Get-ClerkAllowedOrigins.ps1
```

### Clear Browser Cookies (JavaScript)

```javascript
// In browser console on your app
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

## 📋 Complete Checklist

**Clerk Configuration**:
- [ ] Run PowerShell script to add allowed origins
- [ ] Verify origins with Get-ClerkAllowedOrigins.ps1
- [ ] Wait 5 minutes for propagation

**Google Cloud Console**:
- [ ] Verify JavaScript origins include Amplify domain
- [ ] Verify redirect URIs include all callback URLs
- [ ] Wait 5 minutes for propagation

**Testing**:
- [ ] Clear browser cookies/session
- [ ] Test OAuth on Amplify domain
- [ ] Verify successful callback (no 403 error)
- [ ] User is logged in successfully

**Verification**:
- [ ] Check Clerk Dashboard logs for successful OAuth
- [ ] Verify session persists across page refreshes
- [ ] Test on multiple browsers if needed

---

## 🎯 Expected Behavior After Fix

### Successful OAuth Flow:

```
1. User visits: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in
2. Clicks: "Continue with Google"
3. Clerk SDK redirects to: accounts.google.com
4. User authenticates with Google ✓
5. Google redirects to: clerk.adwiise.com/v1/oauth_callback
6. Clerk verifies:
   - OAuth state parameter ✓
   - Origin: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   - Is origin in allowed_origins? YES ✓
   - Is redirect URI valid? YES ✓
7. Clerk processes OAuth callback ✓
8. Clerk redirects to: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
9. User is logged in ✓
10. Session cookie is set ✓
```

### Success Indicators:

- ✅ No `authorization_invalid` error
- ✅ User redirected back to app successfully
- ✅ User profile/avatar visible
- ✅ No errors in browser console
- ✅ Clerk session cookie present (check DevTools > Application > Cookies)

---

## 💡 Why This Happens

**The Issue**:
Clerk's security model requires **all origins** that initiate OAuth flows to be explicitly whitelisted in `allowed_origins`.

**Why It's Needed**:
1. Prevents CSRF attacks
2. Ensures only authorized domains can use your Clerk instance
3. Protects against OAuth token theft

**Why Satellite Domains Need It**:
Even though you configured the satellite domain with a proxy, Clerk still checks if the **original requesting origin** is in the allowed list when processing OAuth callbacks.

---

## 📚 Related Documentation

- [Clerk Allowed Origins API](https://clerk.com/docs/reference/backend-api/tag/Instance#operation/UpdateInstance)
- [OAuth Security Best Practices](https://oauth.net/2/security-best-practices/)
- [Clerk Multi-Domain Setup](https://clerk.com/docs/deployments/set-up-multiple-domains)

---

## 🎉 Final Notes

This is likely the **last configuration step** needed for your multi-domain OAuth setup!

Once you add the Amplify domain to `allowed_origins`, the OAuth flow should complete successfully without any authorization errors.

---

**Last Updated**: 2025-01-21
**Status**: ACTION REQUIRED - Run PowerShell script to add allowed origins
**Priority**: CRITICAL - Blocking OAuth authentication
