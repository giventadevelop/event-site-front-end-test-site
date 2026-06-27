# Simple Fix: Configure Existing Google OAuth Client ID

## ✅ Good News: You DON'T Need a New Google Cloud Project!

You can use your **existing** Google OAuth Client ID (`303554160954`). The issue is just that it's not configured in your **LIVE Clerk instance**.

---

## 🎯 Simple 3-Step Fix

### Step 1: Verify Your Redirect URIs in Google Cloud (Already Done ✓)

Your current Google Cloud Console configuration looks **PERFECT**:

**Authorized redirect URIs** (from your screenshot):
```
✓ https://clerk.adwiise.com/v1/oauth_callback
✓ https://humble-monkey-3.clerk.accounts.dev/v1/auth_callback
✓ https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
```

**This is correct!** Google will accept redirects to any of these URIs.

---

### Step 2: Update Your LIVE Clerk Instance (THIS IS THE ACTUAL FIX)

The problem is that your **LIVE Clerk instance** (`clerk.adwiise.com`) doesn't have the Google OAuth credentials configured.

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/

2. **CRITICAL: Switch to LIVE Instance**
   - Look at the top-left corner of the dashboard
   - Make sure you're in the **PRODUCTION/LIVE** instance
   - It should show: `clerk.adwiise.com` or have a "LIVE" badge
   - If you see `humble-monkey-3.clerk.accounts.dev`, you're in the wrong instance!

3. **Navigate to Social Connections**:
   - Left sidebar: **User & Authentication** > **Social Connections**
   - Find **Google** in the list
   - Click the **gear icon** (Settings) or **Configure**

4. **Enter Your Google OAuth Credentials**:
   ```
   Client ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   Client Secret: [Your Client Secret from Google Cloud Console]
   ```

5. **Find Your Client Secret** (if you don't have it):
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find: `kccna_app` (Client ID: 303554160954...)
   - Click the **edit icon** (pencil)
   - You'll see the **Client Secret** on that page
   - Copy it

6. **Save in Clerk Dashboard**

---

### Step 3: Verify Configuration

After saving, verify that Google OAuth is enabled:

1. In Clerk Dashboard > Social Connections
2. Google should show as **Enabled** with a green checkmark ✓
3. The Client ID should match: `303554160954...`

---

## 🧪 Test the Fix

1. Go to: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
2. Click **"Continue with Google"**
3. Select your Google account
4. You should be redirected back **without** the 403 error ✓
5. You should be logged in successfully ✓

---

## 🤔 Why This Works

### Before (Broken):
```
Your App (.env.production)
  ↓ Uses LIVE Clerk keys
  ↓ pk_live_***_CLERK_PUBLISHABLE_KEY
  ↓
LIVE Clerk Instance (clerk.adwiise.com)
  ↓ Has NO Google OAuth configured ❌
  ↓
User clicks "Sign in with Google"
  ↓
Clerk says: "I don't have Google OAuth credentials!"
  ↓ Falls back to some default behavior or uses wrong instance
  ↓
403 Error ❌
```

### After (Fixed):
```
Your App (.env.production)
  ↓ Uses LIVE Clerk keys
  ↓ pk_live_***_CLERK_PUBLISHABLE_KEY
  ↓
LIVE Clerk Instance (clerk.adwiise.com)
  ↓ Has Google OAuth configured ✓
  ↓ Client ID: 303554160954
  ↓
User clicks "Sign in with Google"
  ↓
Clerk → Google → Authenticates → Redirects back
  ↓
clerk.adwiise.com/v1/oauth_callback
  ↓
Clerk validates OAuth response with Client ID 303554160954 ✓
  ↓
User logged in successfully ✓
```

---

## 📋 Visual Checklist

- [ ] Go to Google Cloud Console
- [ ] Copy Client Secret for Client ID: 303554160954
- [ ] Go to Clerk Dashboard: https://dashboard.clerk.com/
- [ ] **Switch to LIVE/Production instance** (check top-left)
- [ ] Navigate to: User & Authentication > Social Connections
- [ ] Click Google > Settings (gear icon)
- [ ] Enter Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
- [ ] Enter Client Secret: [paste from Google Cloud Console]
- [ ] Click Save
- [ ] Test on: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`

---

## 🆘 If Still Not Working

### Debug Steps:

1. **Verify You're in the Correct Clerk Instance**:
   - Clerk Dashboard top-left should show `clerk.adwiise.com` or "LIVE"
   - If it says `humble-monkey-3.clerk.accounts.dev`, you're in TEST

2. **Check Clerk Logs**:
   - Go to: https://dashboard.clerk.com/logs
   - Look for OAuth errors
   - Should show successful OAuth flow

3. **Verify Client Secret is Correct**:
   - The Client Secret is NOT the same as the Secret Key
   - It's specific to the Google OAuth Client
   - Must be copied from Google Cloud Console

---

## 🎯 You DO NOT Need To:

- ❌ Create a new Google Cloud project
- ❌ Create a new OAuth Client ID
- ❌ Change your redirect URIs (they're already correct)
- ❌ Modify your `.env.production` (keys are correct)
- ❌ Update Amplify environment variables

## ✅ You ONLY Need To:

- ✅ Configure the existing Client ID in your LIVE Clerk instance

---

**This is a 5-minute configuration fix, not a new setup!**
