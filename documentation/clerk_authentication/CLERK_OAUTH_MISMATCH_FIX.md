# Clerk OAuth Client ID Mismatch - CRITICAL FIX

## 🚨 Problem Identified

You have **TWO different Clerk instances**, and your Google OAuth Client ID is registered for the **WRONG** Clerk instance.

### Current Situation:

1. **Your Application (.env.production)**: Using LIVE/Production Clerk
   - Publishable Key: `pk_live_***_CLERK_PUBLISHABLE_KEY`
   - Frontend API: `clerk.adwiise.com`
   - Secret Key: `sk_live_***_CLERK_SECRET_KEY_HERE`

2. **Your Google OAuth (Cloud Console)**: Registered for TEST/Development Clerk
   - Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - Redirect URIs include: `https://humble-monkey-3.clerk.accounts.dev/v1/auth_callback`

### Why OAuth Fails:

```
User clicks "Sign in with Google"
  ↓
Clerk (clerk.adwiise.com) redirects to Google with Client ID 303554160954
  ↓
Google authenticates user successfully ✓
  ↓
Google tries to redirect to: clerk.adwiise.com/v1/oauth_callback
  ↓
BUT Client ID 303554160954 is registered for: humble-monkey-3.clerk.accounts.dev
  ↓
❌ 403 Forbidden: authorization_invalid
```

---

## ✅ Solution: Two Options

### Option 1: Use LIVE Clerk with a NEW Google OAuth Client (Recommended)

**Best for production deployment.**

#### Step 1: Create New Google OAuth Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Application type: **Web application**
4. Name: `Clerk Production (clerk.adwiise.com)`

5. **Authorized JavaScript origins**:
   ```
   https://www.adwiise.com
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   http://localhost:3000
   http://localhost:8080
   ```

6. **Authorized redirect URIs**:
   ```
   https://clerk.adwiise.com/v1/oauth_callback
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
   https://www.adwiise.com/sso-callback
   http://localhost:3000/sso-callback
   ```

7. Click **CREATE**
8. **Copy the new Client ID and Client Secret**

#### Step 2: Update Clerk Dashboard (LIVE Instance)

1. Go to: https://dashboard.clerk.com/
2. **Make sure you're in the LIVE/Production instance** (check the environment indicator)
3. Navigate to: **User & Authentication** > **Social Connections**
4. Find **Google** and click **Settings** (gear icon)
5. Update:
   - **Client ID**: Paste the NEW Client ID from Step 1
   - **Client Secret**: Paste the NEW Client Secret from Step 1
6. Click **Save**

#### Step 3: Update .env.production

```bash
# Update Google Client ID to the NEW one
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

#### Step 4: Update AWS Amplify Environment Variables

1. Go to: AWS Amplify Console > Your App > Environment Variables
2. Update:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Your new Client ID
3. Redeploy

#### Step 5: Wait and Test

- Wait 2-5 minutes for changes to propagate
- Test social login on: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`

---

### Option 2: Switch to TEST/Development Clerk (Faster but Not Recommended)

**Only use this for testing, NOT for production.**

#### Step 1: Decode Your TEST Clerk Keys

You need to find your TEST Clerk instance keys. Based on the redirect URI, your TEST instance is:
- Frontend API: `humble-monkey-3.clerk.accounts.dev`

#### Step 2: Update .env.production to TEST Keys

```bash
# Change from LIVE to TEST
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***_test_secret_key_here

# Keep existing Google Client ID (it's already configured for TEST)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

#### Step 3: Update AWS Amplify Environment Variables

1. Go to: AWS Amplify Console > Your App > Environment Variables
2. Update:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_***`
   - `CLERK_SECRET_KEY` = Your TEST secret key
3. Redeploy

**⚠️ Warning**: TEST instance has limitations and is NOT suitable for production use.

---

## 📧 Email Verification Code Not Received

### Root Cause:

Clerk's default email provider (Clerk's own service) may have delivery issues or delays.

### Solution:

#### Option A: Check Spam Folder
- Check your spam/junk folder
- Add `noreply@clerk.com` to your email whitelist

#### Option B: Wait and Retry
- Email codes can take 1-5 minutes to arrive
- Click "Resend code" after 2 minutes

#### Option C: Configure Custom Email Provider (Recommended for Production)

1. Go to: Clerk Dashboard > **User & Authentication** > **Email, phone, username**
2. Scroll to: **Email settings**
3. Click **Add email service**
4. Choose a provider:
   - **Resend** (easiest, free tier available)
   - **SendGrid**
   - **Mailgun**
   - **AWS SES**

5. Follow the setup wizard to configure your email provider

**Why this matters**: Custom email providers have better deliverability and allow you to:
- Use your own domain (`noreply@adwiise.com`)
- Customize email templates
- View delivery logs
- Avoid Clerk's email rate limits

---

## 🎯 Recommended Action Plan

### For Production Deployment (Recommended):

1. ✅ **Create a NEW Google OAuth Client ID** for your LIVE Clerk instance
2. ✅ **Update Clerk Dashboard** (LIVE) with new Google credentials
3. ✅ **Update .env.production** with new Google Client ID
4. ✅ **Update AWS Amplify** environment variables
5. ✅ **Configure custom email provider** (Resend or SendGrid)
6. ✅ **Test authentication** on Amplify domain

### For Quick Testing (NOT Production):

1. ✅ **Switch to TEST Clerk keys** in .env.production
2. ✅ **Update AWS Amplify** with TEST keys
3. ✅ **Test with existing Google OAuth** (already configured for TEST)

---

## 📋 Verification Checklist

### After Applying Fix:

- [ ] Google OAuth Client ID matches Clerk instance (LIVE with LIVE, TEST with TEST)
- [ ] Clerk Dashboard shows correct Google Client ID
- [ ] Amplify environment variables match .env.production
- [ ] Social login works without 403 error
- [ ] Email verification codes arrive within 2 minutes
- [ ] Users can complete full sign-up flow

### To Verify Clerk Instance:

**Decode your publishable key to see which instance you're using:**

```bash
# LIVE instance (clerk.adwiise.com):
pk_live_***_CLERK_PUBLISHABLE_KEY

# TEST instance (humble-monkey-3.clerk.accounts.dev):
pk_test_***
```

Decode online: https://www.base64decode.org/

---

## 🔧 Quick Commands

### Check Current Clerk Instance
```bash
# Decode publishable key
echo "pk_live_***_CLERK_PUBLISHABLE_KEY" | base64 -d
# Output: clerk.adwiise.com$

echo "pk_test_***" | base64 -d
# Output: humble-monkey-3.clerk.accounts.dev$
```

### Verify Amplify Environment
```bash
# SSH into Amplify build logs or check Amplify Console > Environment Variables
# Ensure these match:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

---

## 🆘 Still Having Issues?

### Debug Steps:

1. **Check Clerk Dashboard Logs**:
   - Go to: https://dashboard.clerk.com/logs
   - Look for OAuth errors
   - Check which Client ID is being used

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for errors containing `authorization_invalid`
   - Check the full OAuth redirect URL

3. **Verify Google Cloud Console**:
   - Ensure redirect URIs exactly match (no trailing slashes)
   - Check that Client ID and Secret are correct
   - Verify OAuth consent screen is published

4. **Check Email Deliverability**:
   - Go to: Clerk Dashboard > **Email logs**
   - Check if emails are being sent
   - Look for bounce/delivery errors

---

## 📚 Related Documentation

- [Google OAuth Configuration](documentation/clerk_authentication/README.md)
- [Clerk Multi-Domain Setup](CLERK_APPLICATION_DOMAIN_SETUP.md)
- [AWS Amplify Environment Variables](documentation/AWS_AMPLIFY_ENV_VARS.md)

---

**Last Updated**: 2025-01-21
**Status**: CRITICAL - Requires immediate action
**Impact**: Blocks all social authentication
