# Clerk Custom Domain Configuration - The Complete Fix

## Great News! Your DNS is Correct! ✅

Looking at your Route 53 screenshot, I can see:

```
clerk.adwiise.com → CNAME → frontend-api.clerk.services
```

This means `clerk.adwiise.com` IS properly set up as a custom Clerk Frontend API domain!

## Why You're Still Getting 400 Errors

The DNS is correct, but Clerk needs to know which domains are allowed to USE `clerk.adwiise.com`.

Your Amplify domain `feature-common-clerk.d1508w3f27cyps.amplifyapp.com` is not whitelisted.

## Where to Whitelist Domains in Clerk Dashboard

Since you're using a custom Frontend API domain (`clerk.adwiise.com`), you need to configure allowed origins.

### Option 1: Check Instance Settings

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your Production instance** (the one using `clerk.adwiise.com`)
3. **Look for one of these locations**:

   **A) Configure → Settings → Security**
   - Look for: "Allowed origins" or "CORS origins"
   - Add: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

   **B) Developers → Domains**
   - Look for: "Authorized domains" or "Application domains"
   - Add your Amplify URL

   **C) Configure → Settings → Instance**
   - Scroll down to "Security" or "Domain restrictions"
   - Add your Amplify domain

### Option 2: Check Frontend API Settings

1. In Clerk Dashboard, go to **Developers** → **Frontend API**
2. If you see `clerk.adwiise.com` listed there
3. Click on it or expand it
4. Look for **"Allowed origins"** or **"Authorized domains"**
5. Add: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

### Option 3: Application Settings

1. Go to **Configure** → **Settings** (in left sidebar)
2. Under **"Application URLs"** or **"Home URL"** section
3. Look for **"Allowed callback URLs"** or **"Authorized redirect URLs"**
4. Add:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/*
   ```

## If You Can't Find Domain Settings

If you absolutely cannot find where to add allowed origins in the Clerk Dashboard, this means:

### Your Clerk instance might be using an older configuration method

Try this:

1. **Contact Clerk Support** via the chat icon in the dashboard
2. Tell them:
   > "I'm using a custom Frontend API domain (clerk.adwiise.com) and need to whitelist my application domain: feature-common-clerk.d1508w3f27cyps.amplifyapp.com. Where do I configure allowed origins?"

3. They can either:
   - Show you where to configure it
   - Or whitelist it for you on the backend

## Alternative: Verify Your Keys Are for the Right Instance

Your LIVE keys might be for a DIFFERENT Clerk instance than the one with `clerk.adwiise.com` configured.

### Check This:

1. In Clerk Dashboard, go to **Developers** → **API Keys**
2. Look at the **Frontend API** shown there
3. Does it say `clerk.adwiise.com`?
   - ✅ **YES**: Then your keys are correct, you just need to whitelist the domain
   - ❌ **NO**: Then you're using keys from a different instance!

If it shows something else (like `humble-monkey-3.clerk.accounts.dev`), then your DNS configuration is separate from your actual Clerk instance.

## Quick Test: Use Your TEST Keys First

While figuring out the domain whitelisting, let's get your app working NOW with TEST keys:

### In AWS Amplify Environment Variables:

```bash
# Temporarily use TEST keys (these work without domain restrictions)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
CLERK_WEBHOOK_SECRET=whsec_***

# Keep these
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Make sure this is NOT set
# NEXT_PUBLIC_CLERK_FRONTEND_API=
```

**Redeploy and test**. This will:
- ✅ Make authentication work immediately
- ✅ Use `humble-monkey-3.clerk.accounts.dev` (which has no domain restrictions)
- ✅ Let you test everything while figuring out the LIVE keys

Then you can switch back to LIVE keys once domain whitelisting is configured.

## Understanding Your Clerk Setup

Based on your Route 53, you have:

```
DNS Setup (Route 53):
clerk.adwiise.com → frontend-api.clerk.services ✅
accounts.adwiise.com → accounts.clerk.services ✅
```

This means you've configured:
1. **Custom Frontend API**: `clerk.adwiise.com`
2. **Custom Account Portal**: `accounts.adwiise.com`

Both are correct! But Clerk still needs to know which application domains can USE these APIs.

## The Complete Configuration

For your setup to work, you need:

### 1. DNS (Already Done ✅)
```
clerk.adwiise.com → CNAME → frontend-api.clerk.services
```

### 2. Clerk Dashboard - Allowed Origins (Need to Configure)
```
Allowed domains:
- https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
- https://www.adwiise.com
- http://localhost:3000
```

### 3. Environment Variables (Already Correct ✅)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_***_CLERK_SECRET_KEY_HERE
```

Once you add the Amplify domain to Clerk's allowed origins, the 400 errors will stop.

## How to Find Allowed Origins Setting

Look for these keywords in Clerk Dashboard:
- "Allowed origins"
- "CORS"
- "Authorized domains"
- "Application domains"
- "Allowed callback URLs"
- "Domain whitelist"
- "Security settings"

Usually in:
- Configure → Settings → Security
- Developers → Domains
- Developers → CORS
- Instance settings

## Recommended Action Plan

### Step 1: Get It Working Now (5 minutes)
- Switch to TEST keys in Amplify
- Redeploy
- Test - should work!

### Step 2: Find Domain Whitelisting (10 minutes)
- Search Clerk Dashboard for "allowed origins"
- Or contact Clerk support
- Add your Amplify domain

### Step 3: Switch to LIVE Keys (5 minutes)
- Once domain is whitelisted
- Switch back to LIVE keys
- Redeploy
- Test with custom domain

## Summary

**Your DNS is perfect!** ✅ The issue is just that Clerk needs to be told "allow requests from Amplify domain".

**Quick fix**: Use TEST keys now, find domain settings later.

**Proper fix**: Find where to whitelist domains in Clerk Dashboard for your production instance.

The authentication is almost working - you're just one configuration step away! 🚀
