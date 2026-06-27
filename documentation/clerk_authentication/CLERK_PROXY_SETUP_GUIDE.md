# Clerk Proxy Setup Guide - Satellite Domain Configuration

## ✅ Congratulations on Upgrading to Clerk Pro!

You now have access to **satellite domain** support, which allows you to use Clerk authentication across multiple domains without DNS configuration.

---

## 🎯 What Was Done

### File Updated: `next.config.mjs`

Added Clerk proxy configuration to the `rewrites()` function:

```javascript
// Configure rewrites for Clerk proxy (satellite domain support)
async rewrites() {
  return [
    {
      source: '/__clerk/:path*',
      destination: 'https://frontend-api.clerk.services/__clerk/:path*',
    },
  ];
},
```

**What this does**:
- Proxies all requests from `/__clerk/*` to Clerk's Frontend API
- Allows Clerk to verify domain ownership without DNS changes
- Enables satellite domain authentication

---

## 📋 Complete Setup Steps

### Step 1: Commit and Push Changes ✅

```bash
# Add the modified file
git add next.config.mjs

# Commit with descriptive message
git commit -m "Add Clerk proxy configuration for satellite domain support"

# Push to repository
git push origin feature_Common_Clerk
```

### Step 2: Wait for Amplify to Deploy

1. Go to: **AWS Amplify Console**
2. Your App > **Deployments**
3. Wait for the build to complete (usually 5-10 minutes)
4. Verify status shows: **"Deployed"** ✓

### Step 3: Configure Proxy in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/

2. **Navigate to Satellites**:
   - Ensure you're in **Production** instance (top-left)
   - Go to: **Configure** > **Domains** or **Satellites**
   - Find: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

3. **Set Proxy Configuration**:
   - Click: **"Set proxy configuration"** button
   - A modal will appear (as shown in your screenshot)

4. **Enter Proxy URL**:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/__clerk/
   ```

   **Important**: Include the trailing slash `/` after `__clerk/`

5. **Click "Use proxy"** button

### Step 4: Verify Configuration

1. Clerk will now attempt to verify the proxy
2. It should show: **"Verified"** ✓ (may take 1-2 minutes)
3. Status should change from **"Unverified"** to **"Active"** or **"Verified"**

---

## 🧪 Testing the Setup

### Test 1: Verify Proxy Endpoint

Open browser and visit:
```
https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/__clerk/v1/environment
```

**Expected Response**:
- Should return JSON data from Clerk's API ✓
- Should NOT return 404 error
- Should NOT return Next.js 404 page

**If you get 404**:
- Proxy rewrites not working yet
- Wait for Amplify deployment to complete
- Clear browser cache and try again

### Test 2: Test OAuth on Amplify Domain

1. **Go to sign-in page**:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in
   ```

2. **Click "Continue with Google"**

3. **Expected Result**:
   - Google OAuth popup appears ✓
   - User authenticates with Google ✓
   - Redirects back to your app ✓
   - **NO 403 error** ✓
   - User is logged in successfully ✓

### Test 3: Test Email/Password Authentication

1. **Try email/password sign-up** on Amplify domain
2. **Verification code should arrive**:
   - If you configured Resend: 1-5 seconds ⚡
   - If using Clerk default: 10-30 minutes 🐌
3. **Complete authentication flow** ✓

---

## 🔍 How Clerk Proxy Works

### The Flow:

```
User visits Amplify domain
  ↓
App loads Clerk SDK
  ↓
Clerk SDK needs to call: clerk.adwiise.com/v1/client
  ↓
Because we're on a satellite domain, Clerk SDK detects proxy
  ↓
Clerk SDK calls: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/__clerk/v1/client
  ↓
Next.js rewrites() forwards to: frontend-api.clerk.services/__clerk/v1/client
  ↓
Clerk API responds ✓
  ↓
Authentication works across all domains ✓
```

### Why This Method?

**Traditional DNS Method**:
- Requires adding CNAME record: `clerk.feature-common-clerk → frontend-api.clerk.services`
- ❌ Not possible with `*.amplifyapp.com` domains (you don't control DNS)

**Proxy Method** (What we're using):
- Uses Next.js rewrites to proxy requests
- ✅ Works with any domain (including Amplify URLs)
- ✅ No DNS changes needed
- ✅ Clerk verifies by making test requests to `/__clerk/` path

---

## ✅ Verification Checklist

After setup, verify these items:

**Amplify Deployment**:
- [ ] Changes committed and pushed to repository
- [ ] Amplify build completed successfully
- [ ] Deployment status shows "Deployed"

**Clerk Configuration**:
- [ ] Satellite domain added in Clerk Dashboard
- [ ] Proxy URL configured: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/__clerk/`
- [ ] Domain status shows "Verified" or "Active"

**Functionality Tests**:
- [ ] `/__clerk/v1/environment` returns JSON (not 404)
- [ ] Google OAuth works on Amplify domain (no 403 error)
- [ ] Email/password authentication works
- [ ] Users can sign in and sign up successfully
- [ ] No authentication errors in browser console

---

## 🆘 Troubleshooting

### Issue 1: Proxy Verification Fails in Clerk

**Error**: Clerk shows "Unable to verify proxy configuration"

**Solutions**:

1. **Check Amplify Deployment**:
   - Ensure build completed successfully
   - Check build logs for errors
   - Verify app is accessible

2. **Verify Proxy URL**:
   - Must end with `/__clerk/` (with trailing slash)
   - Must use HTTPS
   - Must match exact Amplify URL

3. **Test Proxy Manually**:
   - Visit: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/__clerk/v1/environment`
   - Should return JSON, not 404
   - If 404, proxy rewrites not working

4. **Check next.config.mjs**:
   - Verify rewrites section is correct
   - Ensure file is `.mjs` extension
   - Verify syntax (no typos)

5. **Wait and Retry**:
   - Amplify deployment can take 5-10 minutes
   - Clerk verification can take 1-2 minutes
   - Try clicking "Verify configuration" again

---

### Issue 2: 404 Error on /__clerk/ Path

**Error**: Visiting `/__clerk/v1/environment` returns Next.js 404 page

**Solutions**:

1. **Deployment Not Complete**:
   - Check Amplify Console > Deployments
   - Wait for build to finish
   - Redeploy if needed

2. **Caching Issue**:
   - Clear browser cache
   - Try in incognito/private window
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **next.config.mjs Not Applied**:
   - Verify file was committed
   - Check git status: `git status`
   - Verify it's pushed: `git log --oneline -5`
   - Redeploy in Amplify Console

4. **Syntax Error in next.config.mjs**:
   - Check build logs in Amplify Console
   - Look for syntax errors
   - Test build locally: `npm run build`

---

### Issue 3: OAuth Still Returns 403

**Error**: Google OAuth still fails with 403 `authorization_invalid`

**Solutions**:

1. **Verify Domain in Clerk**:
   - Go to: Clerk Dashboard > Domains/Satellites
   - Ensure Amplify domain shows as "Verified" ✓
   - If "Unverified", proxy setup incomplete

2. **Check Google Cloud Console**:
   - Redirect URI must include Amplify domain
   - Should have: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback`
   - Add if missing

3. **Clear Clerk Session**:
   ```javascript
   // In browser console on your app:
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   // Refresh and try OAuth again
   ```

4. **Check Clerk Logs**:
   - Go to: https://dashboard.clerk.com/logs
   - Look for OAuth errors
   - Should show successful authentication

---

### Issue 4: Email Verification Codes Not Arriving

**Solutions**:

1. **Check Clerk Email Logs**:
   - Dashboard > Logs > Filter: "Email"
   - Should show `email.sent` events

2. **If Using Clerk Default Email**:
   - Check spam folder
   - Wait 10-30 minutes (Clerk's default is slow)
   - Add `noreply@clerk.com` to safe senders

3. **Configure Custom Email Provider** (Recommended):
   - Sign up: https://resend.com/ (free tier available)
   - Get API key
   - Configure in: Clerk Dashboard > Email delivery
   - Emails will arrive in 1-5 seconds ⚡

---

## 📊 Expected Timeline

| Step | Time Required |
|------|--------------|
| Commit and push changes | 1 minute |
| Amplify build and deployment | 5-10 minutes |
| Configure proxy in Clerk | 2 minutes |
| Clerk verification | 1-2 minutes |
| Test OAuth and authentication | 3 minutes |
| **Total** | **~15-20 minutes** |

---

## 🎯 Next Steps After Setup

1. **Test on Multiple Browsers**:
   - Chrome, Firefox, Safari, Edge
   - Verify OAuth works consistently

2. **Test on Mobile**:
   - iOS Safari
   - Android Chrome
   - Ensure responsive authentication flow

3. **Monitor Clerk Logs**:
   - Check for any authentication errors
   - Monitor successful sign-ins
   - Verify email delivery

4. **Configure Custom Email** (If not done yet):
   - Set up Resend for instant email delivery
   - Much better user experience

5. **Update Documentation**:
   - Document the satellite domain setup
   - Add to team knowledge base
   - Update deployment guides

---

## 📝 Configuration Summary

### What Changed:

**File**: `next.config.mjs`
- **Added**: Clerk proxy rewrites
- **Purpose**: Enable satellite domain support
- **Impact**: Clerk authentication works on Amplify domain

### Clerk Dashboard Configuration:

**Satellite Domain**: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
- **Method**: Proxy (not DNS)
- **Proxy URL**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/__clerk/`
- **Status**: Should show "Verified" after setup

### Google Cloud Console:

**Authorized Redirect URIs**: Already configured ✓
- `https://clerk.adwiise.com/v1/oauth_callback`
- `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback`

---

## 🔗 Quick Reference Links

- **Clerk Dashboard**: https://dashboard.clerk.com/
- **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Resend (Email Provider)**: https://resend.com/
- **Clerk Proxy Documentation**: https://clerk.com/docs/deployments/proxy-configuration

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Amplify deployment shows "Deployed" status
2. ✅ `/__clerk/v1/environment` returns JSON (not 404)
3. ✅ Clerk Dashboard shows satellite domain as "Verified"
4. ✅ Google OAuth works on Amplify domain (no 403 error)
5. ✅ Email/password authentication works
6. ✅ Users can sign in and sign up successfully
7. ✅ No authentication errors in browser console
8. ✅ Clerk logs show successful authentication events

---

**Last Updated**: 2025-01-21
**Status**: Ready for implementation
**Priority**: HIGH - Enables multi-domain authentication

---

## 🎉 You're All Set!

Once you've completed these steps, your Clerk authentication will work seamlessly across:
- ✅ Primary domain: `www.adwiise.com`
- ✅ Custom domain: `clerk.adwiise.com`
- ✅ Satellite domain: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
- ✅ Localhost: `http://localhost:3000`

Multi-domain authentication achieved! 🚀
