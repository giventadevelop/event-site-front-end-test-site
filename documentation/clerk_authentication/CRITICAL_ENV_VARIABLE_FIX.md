# CRITICAL: Missing Environment Variable Causing Authorization Invalid

## 🚨 ROOT CAUSE FOUND

In your `.env.production` file, line 33:

```bash
#NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com
```

This variable is **COMMENTED OUT**! This is why you're getting `authorization_invalid` errors.

---

## 🎯 Why This Causes `authorization_invalid`

### Without `NEXT_PUBLIC_CLERK_FRONTEND_API`:

```
User on Amplify domain clicks "Sign in with Google"
  ↓
Clerk SDK doesn't know which Frontend API to use
  ↓
Defaults to trying clerk.accounts.dev (development URL)
  ↓
OAuth callback goes to WRONG domain
  ↓
Clerk rejects with: authorization_invalid ❌
```

### With `NEXT_PUBLIC_CLERK_FRONTEND_API` set correctly:

```
User on Amplify domain clicks "Sign in with Google"
  ↓
Clerk SDK knows to use: clerk.adwiise.com
  ↓
OAuth callback goes to: clerk.adwiise.com/v1/oauth_callback
  ↓
Clerk processes callback successfully ✓
  ↓
User is authenticated ✓
```

---

## ✅ Fix #1: Uncomment and Set Correctly in `.env.production`

### Current (BROKEN):
```bash
#NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com
```

### Fixed:
```bash
NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com
```

**Action**: Remove the `#` at the beginning of line 33

---

## ✅ Fix #2: Add to AWS Amplify Environment Variables

After uncommenting in `.env.production`, you MUST also add it to Amplify:

### Steps:

1. **Go to AWS Amplify Console**
2. **Your App** > **Environment variables**
3. **Add new variable**:
   - **Key**: `NEXT_PUBLIC_CLERK_FRONTEND_API`
   - **Value**: `https://clerk.adwiise.com`
4. **Click**: Save
5. **Redeploy**: Trigger new deployment

---

## 🔍 Why This Variable is Critical for Satellite Domains

When using satellite domains (like your Amplify URL), Clerk needs to know:
1. **Primary domain** for Frontend API: `clerk.adwiise.com`
2. **Satellite domain** for the app: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
3. **Proxy URL** for API calls: `/__clerk/`

Without `NEXT_PUBLIC_CLERK_FRONTEND_API`, the Clerk SDK can't properly:
- Route OAuth callbacks
- Handle authentication requests
- Manage sessions across domains

---

## 📋 Complete Fix Steps

### Step 1: Update `.env.production` (1 minute)

```bash
# Open file in editor
# Find line 33
# Change from:
#NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com

# To:
NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com
```

---

### Step 2: Verify All Clerk Variables Are Set

Make sure these are ALL uncommented and correct:

```bash
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***
CLERK_SECRET_KEY=sk_live_***

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# CRITICAL: Frontend API URL (MUST BE UNCOMMENTED)
NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com

# Webhook secret
CLERK_WEBHOOK_SECRET=whsec_***
```

---

### Step 3: Add to AWS Amplify Environment Variables

**In Amplify Console**, add these variables if not already present:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_***
CLERK_SECRET_KEY = sk_live_***
NEXT_PUBLIC_CLERK_FRONTEND_API = https://clerk.adwiise.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /
```

**CRITICAL**: Make sure `NEXT_PUBLIC_CLERK_FRONTEND_API` is added!

---

### Step 4: Commit and Push Changes

```bash
# In git repository
git add .env.production
git commit -m "Fix: Uncomment NEXT_PUBLIC_CLERK_FRONTEND_API for satellite domain support"
git push origin feature_Common_Clerk
```

**Note**: Since `.env.production` contains secrets, it should be in `.gitignore`. If it is, you'll need to manually update Amplify environment variables instead (Step 3 above).

---

### Step 5: Redeploy in Amplify

1. **Go to Amplify Console**
2. **Your App** > **Deployments**
3. **Click**: "Redeploy this version" OR wait for auto-deploy from git push
4. **Wait**: 5-10 minutes for deployment to complete

---

### Step 6: Test Authentication

After deployment completes:

1. **Visit**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
2. **Click**: "Continue with Google"
3. **Select**: Google account
4. **Expected**: Should redirect back successfully WITHOUT `authorization_invalid` error
5. **Verify**: User is logged in ✓

---

## 🧪 How to Verify Variable is Set

### Check in Browser Console:

After deployment, visit your app and open browser console (F12):

```javascript
// Check if variable is set
console.log('NEXT_PUBLIC_CLERK_FRONTEND_API:', process.env.NEXT_PUBLIC_CLERK_FRONTEND_API);

// Should output:
// NEXT_PUBLIC_CLERK_FRONTEND_API: https://clerk.adwiise.com

// If outputs 'undefined', variable is not set correctly
```

---

## 📊 Expected Behavior After Fix

### Before Fix (BROKEN):
```
OAuth Callback URL: undefined or wrong domain
Result: authorization_invalid ❌
User Experience: Error page after Google login
```

### After Fix (WORKING):
```
OAuth Callback URL: https://clerk.adwiise.com/v1/oauth_callback
Result: Success ✓
User Experience: Logged in immediately after Google login
```

---

## 🎯 Why This Was Missed

Looking at your `next.config.mjs` (line 119):

```javascript
NEXT_PUBLIC_CLERK_FRONTEND_API: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
```

The variable IS included in `next.config.mjs`, but since it's commented out in `.env.production`, it's being set to `undefined`.

**Result**: Clerk SDK receives `undefined` for Frontend API URL and falls back to incorrect default.

---

## ✅ Additional Fix: Email Delivery

While fixing the above, also set up email delivery for email/password authentication:

### Quick Resend Setup (10 minutes):

1. **Sign up**: https://resend.com/ (100 free emails/day)
2. **Get API key**: https://resend.com/api-keys
3. **Configure in Clerk**: Dashboard > User & authentication > Email
4. **Scroll down** to "Email delivery" section
5. **Select**: Resend
6. **Enter**: API key
7. **Save**

This will fix email verification code delivery.

---

## 📋 Quick Fix Checklist

**Environment Variables**:
- [ ] Uncomment `NEXT_PUBLIC_CLERK_FRONTEND_API` in `.env.production`
- [ ] Verify value is `https://clerk.adwiise.com`
- [ ] Add to AWS Amplify environment variables
- [ ] Commit and push (if not in .gitignore)

**Deployment**:
- [ ] Trigger Amplify redeploy
- [ ] Wait for deployment to complete (5-10 min)
- [ ] Verify deployment status: "Deployed"

**Testing**:
- [ ] Open app in browser
- [ ] Check console for NEXT_PUBLIC_CLERK_FRONTEND_API value
- [ ] Test Google OAuth sign-in
- [ ] Verify no `authorization_invalid` error
- [ ] Confirm user is logged in

**Email Setup** (if not done yet):
- [ ] Set up Resend account
- [ ] Get API key
- [ ] Configure in Clerk Dashboard
- [ ] Test email delivery

---

## 🎉 Expected Outcome

After uncommenting `NEXT_PUBLIC_CLERK_FRONTEND_API` and redeploying:

- ✅ Google OAuth will work correctly
- ✅ OAuth callback will go to correct domain
- ✅ No more `authorization_invalid` errors
- ✅ Users can sign in with Google successfully

**AND** after setting up Resend:

- ✅ Email verification codes will be sent instantly
- ✅ Users can sign up with email/password
- ✅ Both authentication methods will work

---

## 🆘 If Still Not Working After This Fix

If `authorization_invalid` persists after:
1. Uncommenting variable
2. Adding to Amplify environment variables
3. Redeploying
4. Waiting 10 minutes

Then check:
1. **Browser console**: Does `process.env.NEXT_PUBLIC_CLERK_FRONTEND_API` show correct value?
2. **Clerk logs**: https://dashboard.clerk.com/logs - What does the error show?
3. **Google Cloud Console**: Are "Authorized JavaScript origins" correct?

---

**Last Updated**: 2025-01-22
**Status**: CRITICAL FIX IDENTIFIED - Uncomment environment variable
**Priority**: URGENT - This is the root cause of authorization_invalid
**Estimated Fix Time**: 15 minutes (5 min change + 10 min redeploy)
