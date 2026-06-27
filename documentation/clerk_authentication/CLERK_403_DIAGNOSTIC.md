# Clerk OAuth 403 Error - Advanced Diagnostics

## ✅ Configuration Confirmed Correct

Based on your screenshot, the Google OAuth configuration in Clerk Dashboard is **perfect**:
- Client ID: Matches Google Cloud Console ✓
- Client Secret: Configured ✓
- Redirect URI: `https://clerk.adwiise.com/v1/oauth_callback` ✓
- Enabled for sign-up and sign-in ✓

**So why is OAuth still failing with 403?**

---

## 🔍 Possible Root Causes

### Cause 1: Domain Not Whitelisted in Clerk Instance Settings

Even though OAuth is configured, Clerk might be blocking requests from your Amplify domain.

#### Fix: Whitelist Amplify Domain in Clerk

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/
2. **Ensure you're in LIVE instance** (top-left)
3. **Navigate to**: **Settings** (gear icon in left sidebar) > **Domains**
4. **Check "Development domains" or "Production domains"**:
   - Should include: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
   - Should include: `https://www.adwiise.com`
5. **If not listed, add them**:
   - Click **"Add domain"**
   - Enter: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
   - Click **Save**

---

### Cause 2: Clerk SDK Version or API Mismatch

You're using `@clerk/nextjs@4.31.8`, which uses the older `authMiddleware`. Clerk v5 changed significantly.

#### Check: Are you using the correct API version?

The error might be from Clerk's API expecting v5 format but receiving v4 format.

#### Potential Fix: Update Clerk SDK

```bash
npm install @clerk/nextjs@latest
```

**⚠️ Warning**: Clerk v5 has breaking changes. Your middleware will need updates.

---

### Cause 3: Cookie/Session Domain Mismatch

Clerk sets cookies for `clerk.adwiise.com`, but your app runs on `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`.

#### Symptoms:
- OAuth works on `www.adwiise.com` ✓
- OAuth fails on `feature-common-clerk.d1508w3f27cyps.amplifyapp.com` ❌

#### Fix: Check Clerk Cookie Settings

1. Go to: Clerk Dashboard > **Settings** > **Sessions**
2. Check **"Session lifetime"** and **"Inactivity timeout"**
3. Look for: **"Cookie domain"** or **"Cross-domain settings"**
4. Ensure cross-domain sessions are enabled

---

### Cause 4: Google OAuth Consent Screen Issue

The OAuth consent screen might have restrictions.

#### Fix: Verify Google OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Check **"Publishing status"**:
   - Should be: **"In production"** or **"Testing"** ✓
3. Check **"Authorized domains"**:
   - Should include: `adwiise.com` ✓
   - Should include: `amplifyapp.com` (if available) ✓
4. Check **"Test users"** (if in Testing mode):
   - Your Google account should be listed ✓

---

### Cause 5: Clerk Instance Environment Mismatch

You might be accidentally using TEST keys in Amplify but LIVE keys locally.

#### Verify: Check Amplify Environment Variables

1. Go to: AWS Amplify Console > Your App > **Environment variables**
2. Verify these match your `.env.production`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY=sk_live_***_CLERK_SECRET_KEY_HERE
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   ```
3. **CRITICAL**: Ensure these are **exactly** the same, no typos

---

## 🧪 Diagnostic Tests

### Test 1: Check Exact Error Response

Open browser DevTools when you get the 403 error:

1. **Network Tab** > Filter: `oauth_callback`
2. Click the failed request
3. Go to **Response** tab
4. Look for the **exact error message**

**Expected patterns**:

**Pattern A**: `"code": "authorization_invalid"`
- Meaning: Google Client ID mismatch
- **But this shouldn't happen since your config is correct!**

**Pattern B**: `"code": "session_not_found"`
- Meaning: Cookie/session issue
- Fix: Check Cause 3 (Cookie domain)

**Pattern C**: `"code": "instance_not_found"`
- Meaning: Amplify domain not whitelisted
- Fix: Check Cause 1 (Domain whitelist)

**Pattern D**: `"code": "forbidden_oauth_redirect"`
- Meaning: Redirect URI mismatch
- This would be surprising given your correct config

---

### Test 2: Test OAuth on Different Domains

Try Google OAuth on:

1. **Localhost**: `http://localhost:3000/sign-in` → Click Google sign-in
   - ✅ Works? Domain whitelist is OK
   - ❌ Fails? Google OAuth config issue

2. **Production**: `https://www.adwiise.com/sign-in` → Click Google sign-in
   - ✅ Works? Amplify-specific issue
   - ❌ Fails? Clerk configuration issue

3. **Amplify**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
   - ❌ Fails? This is what we're troubleshooting

**This will tell us if it's domain-specific or global.**

---

### Test 3: Check Clerk Logs for Detailed Error

1. Go to: https://dashboard.clerk.com/logs
2. Filter by: **"OAuth"** or **"Sign-in"**
3. Look for entries around the time you tried to sign in
4. Click on the failed OAuth attempt
5. Look for detailed error message

**Common errors in logs**:

- `"Unauthorized domain"` → Domain whitelist issue (Cause 1)
- `"Invalid OAuth state"` → Session/cookie issue (Cause 3)
- `"Client ID mismatch"` → Shouldn't happen with your config
- `"Redirect URI not whitelisted"` → Check Google Cloud Console

---

## 🎯 Step-by-Step Diagnosis Process

### Step 1: Verify Domain Whitelist

**Action**: Check Clerk Dashboard > Settings > Domains

**Expected**:
```
feature-common-clerk.d1508w3f27cyps.amplifyapp.com ✓
www.adwiise.com ✓
localhost:3000 (for development) ✓
```

**If missing**: Add Amplify domain

---

### Step 2: Test on Localhost

**Action**: Run app locally, try Google OAuth

```bash
npm run dev
# Open: http://localhost:3000/sign-in
# Click: "Continue with Google"
```

**Result**:
- ✅ **Works on localhost** → Amplify-specific issue (check environment variables)
- ❌ **Fails on localhost** → Global Clerk/Google config issue

---

### Step 3: Check Amplify Environment Variables

**Action**: AWS Amplify Console > Environment Variables

**Verify exact matches**:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

**Look for**:
- Extra spaces
- Wrong keys (TEST instead of LIVE)
- Missing variables

---

### Step 4: Check Google OAuth Consent Screen

**Action**: https://console.cloud.google.com/apis/credentials/consent

**Verify**:
- Publishing status: **"In production"** or **"Testing"** ✓
- Authorized domains: `adwiise.com`, `amplifyapp.com` ✓
- If "Testing": Your email is in test users list ✓

---

### Step 5: Check Clerk Logs

**Action**: https://dashboard.clerk.com/logs

**Look for**: Failed OAuth attempts with detailed error codes

**This is the most important diagnostic step!**

---

## 🔧 Quick Fixes to Try

### Fix 1: Add Amplify Domain to Clerk (Most Likely Fix)

```
Clerk Dashboard > Settings > Domains
Add: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
```

### Fix 2: Verify Amplify Environment Variables

```
AWS Amplify Console > Environment Variables
Ensure CLERK keys match .env.production EXACTLY
```

### Fix 3: Update Clerk SDK (if using older version)

```bash
npm install @clerk/nextjs@latest
```

**⚠️ Note**: Clerk v5 has breaking changes, test locally first

### Fix 4: Clear Clerk Session and Try Again

```javascript
// In browser console on your app:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
// Then refresh and try OAuth again
```

---

## 📧 Email Verification Code Issue

You're right that Clerk's email service **should** work, even if it's slow. If codes aren't arriving after 30+ minutes, there might be an issue.

### Diagnostic Steps for Email:

1. **Check Clerk Email Logs**:
   - Dashboard > Logs > Filter: "Email"
   - Look for: `email.sent`, `email.bounced`, `email.failed`

2. **Verify Email Address**:
   - Try a different email provider (Gmail vs Yahoo vs Outlook)
   - Check for typos in email address

3. **Check Spam Folder**:
   - Search for: `noreply@clerk.com`
   - Mark as "Not spam" if found

4. **Check Clerk Email Settings**:
   - Dashboard > User & Authentication > Email, phone, username
   - Verify email verification is enabled
   - Check for custom email provider configuration

**If email logs show `email.sent` but you're not receiving**:
- It's an email deliverability issue (spam filter, email provider blocking)
- Solution: Set up custom email provider (Resend/SendGrid)

**If email logs show `email.failed` or no logs at all**:
- It's a Clerk configuration issue
- Check if email verification is enabled
- Check for rate limiting

---

## 📋 Action Plan

1. ✅ **Check Clerk Dashboard Logs** (Most important!)
2. ✅ **Verify domain whitelist** in Clerk Settings > Domains
3. ✅ **Test OAuth on localhost** to isolate issue
4. ✅ **Verify Amplify environment variables** match exactly
5. ✅ **Check Google OAuth consent screen** status
6. ✅ **Check email logs** for verification code issues

---

## 🆘 If Still Stuck

Please provide:

1. **Exact error message** from browser DevTools > Network tab > Response
2. **Clerk Dashboard logs** screenshot for the failed OAuth attempt
3. **Test results**: Does OAuth work on localhost? On www.adwiise.com?
4. **Email logs**: Does Clerk show emails as sent?

This will help pinpoint the exact issue!

---

**Last Updated**: 2025-01-21
**Status**: Diagnostic guide for correct configuration with 403 error
