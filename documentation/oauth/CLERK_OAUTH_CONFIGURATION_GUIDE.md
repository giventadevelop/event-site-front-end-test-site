# Clerk OAuth Configuration Guide

## Current Status

✅ **Backend Fixed**: Generating correct Clerk URL
✅ **Frontend Fixed**: Properly forwarding OAuth requests
❌ **Clerk Not Configured**: OAuth providers need to be enabled in Clerk Dashboard

## Error You're Seeing

```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method). The requested OAuth 2.0 Client does not exist."
}
```

**This means**: Google OAuth is not configured in your Clerk application.

---

## How to Fix: Configure Clerk Dashboard

### Step 1: Go to Clerk Dashboard

Visit: https://dashboard.clerk.com

### Step 2: Select Your Application

Select: **humble-monkey-3** (your application)

### Step 3: Enable Social Connections

1. In the left sidebar, click **"User & Authentication"**
2. Click **"Social Connections"** (or **"SSO"** → **"Social Connections"**)
3. You should see a list of OAuth providers

### Step 4: Enable Google OAuth

1. Find **"Google"** in the list
2. Click **"Enable"** or the toggle switch
3. A configuration modal will appear

### Step 5: Configure Google OAuth

You have two options:

#### Option A: Use Clerk's Development Credentials (Easiest for Testing)

1. Select **"Use Clerk's development credentials"**
2. Click **"Save"**
3. ✅ Done! This works for testing but has limitations

#### Option B: Use Your Own Google OAuth Credentials (Recommended for Production)

1. Select **"Use custom credentials"**
2. You'll need to create a Google OAuth 2.0 Client ID:

   **a. Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Select or create a project

   **b. Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

   **c. Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add these **Authorized redirect URIs**:
     ```
     https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
     ```

   **d. Get Client ID and Secret**:
   - After creating, you'll see:
     - Client ID: `xxxxx.apps.googleusercontent.com`
     - Client Secret: `xxxxx`

   **e. Enter in Clerk Dashboard**:
   - Paste Client ID into Clerk
   - Paste Client Secret into Clerk
   - Click "Save"

### Step 6: Configure Redirect URLs (Important!)

In Clerk Dashboard, under the Google OAuth settings:

1. **Authorized Redirect URI**: Should be automatically set by Clerk
   ```
   https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
   ```

2. **Your Application Callback**: Configure where Clerk redirects after OAuth
   - This is handled by your backend: `http://localhost:8080/api/oauth/google/callback`
   - Clerk will redirect here after successful OAuth

---

## Step 7: Test Again

After configuring Clerk:

1. **Go to frontend**: `http://localhost:3000/sign-in`
2. **Click "Sign in with Google"**
3. **Should now see**: Google OAuth consent screen (not error)

---

## Configure Additional OAuth Providers (Optional)

### Facebook

1. Enable **Facebook** in Clerk Social Connections
2. Use Clerk's dev credentials OR:
   - Go to Facebook Developers: https://developers.facebook.com
   - Create an app
   - Add Facebook Login product
   - Get App ID and App Secret
   - Add redirect URI: `https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback`
   - Enter credentials in Clerk

### GitHub

1. Enable **GitHub** in Clerk Social Connections
2. Use Clerk's dev credentials OR:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Authorization callback URL: `https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback`
   - Get Client ID and Client Secret
   - Enter in Clerk

---

## Important Notes

### Development vs Production

**Development** (current setup):
- Using Clerk's development credentials is fine for testing
- URL: `https://humble-monkey-3.clerk.accounts.dev`
- Works with `localhost` redirects

**Production** (when deploying):
- Must use your own OAuth credentials
- Configure production redirect URIs
- Update backend callback URLs to production domain

### Redirect URI Format

Clerk expects callbacks in this format:
```
https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
```

Your backend receives callbacks at:
```
http://localhost:8080/api/oauth/google/callback
```

Clerk handles the OAuth flow and forwards to your backend.

---

## Troubleshooting

### Issue: "invalid_client" error (current issue)

**Cause**: OAuth provider not enabled in Clerk

**Fix**: Enable and configure the OAuth provider in Clerk Dashboard

### Issue: "redirect_uri_mismatch" error

**Cause**: Redirect URI not authorized in Google Cloud Console

**Fix**: Add the correct redirect URI in Google Cloud Console:
```
https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
```

### Issue: "access_denied" error

**Cause**: User canceled the OAuth consent screen

**Fix**: This is normal - user chose not to authorize

### Issue: Still getting 404

**Cause**: Clerk application not found or URL incorrect

**Fix**: Verify your Clerk Frontend API URL:
1. Go to Clerk Dashboard
2. Go to "API Keys"
3. Check "Frontend API" value
4. Should be: `humble-monkey-3.clerk.accounts.dev`

---

## Quick Start: Minimal Configuration

For quick testing, do this:

1. ✅ Go to Clerk Dashboard
2. ✅ Select **humble-monkey-3** application
3. ✅ Go to **Social Connections**
4. ✅ Enable **Google**
5. ✅ Choose **"Use Clerk's development credentials"**
6. ✅ Save
7. ✅ Test OAuth flow again

Total time: ~2 minutes

---

## Complete OAuth Flow After Configuration

```
User clicks "Sign in with Google"
    ↓
Frontend: /api/oauth/google/initiate
    ↓
Backend generates: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?...
    ↓
Browser redirects to Clerk
    ↓
Clerk redirects to Google OAuth ✅
    ↓
User sees Google consent screen ✅
    ↓
User authorizes
    ↓
Google redirects to Clerk: https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback?code=...
    ↓
Clerk processes OAuth
    ↓
Clerk redirects to backend: http://localhost:8080/api/oauth/google/callback?code=...&state=...
    ↓
Backend exchanges code for user data
    ↓
Backend redirects to frontend: /auth/callback?success=true&...
    ↓
User is logged in! ✅
```

---

## Summary

**Current Status**: Backend and frontend code is working correctly! ✅

**Next Step**: Configure OAuth providers in Clerk Dashboard

**Quickest Fix**: Enable Google with Clerk's development credentials (2 minutes)

**Then**: Test OAuth flow - should work!

---

## Screenshots to Look For

In Clerk Dashboard, you should see:

1. **Social Connections page** with list of providers
2. **Google toggle** (currently off, needs to be on)
3. **Configuration modal** when clicking Google
4. **"Use Clerk's development credentials"** option (easiest)
5. **Save button** to enable

After saving, the Google toggle should be **green/enabled**.
