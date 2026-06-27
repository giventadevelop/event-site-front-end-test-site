# Clerk 400 Error Fix - Domain Configuration Issue

## Problem Identified

The error `GET https://clerk.adwiise.com/v1/client?_clerk_js_version=4.73.14 400 (Bad Request)` is happening because:

1. **Your frontend is using the wrong Clerk Frontend API URL**
2. The publishable key `pk_live_***_CLERK_PUBLISHABLE_KEY` is associated with a specific Clerk instance domain
3. The domain configuration in Clerk needs to be updated

## Key Issue

When you decode your publishable key `pk_live_***_CLERK_PUBLISHABLE_KEY`, it contains `clerk.adwiise.com`. However:

- Your **Account Portal** is at: `accounts.adwiise.com`
- Your **Frontend API** should likely be: Your Clerk instance URL (NOT a custom domain)

## Solution Steps

### Step 1: Find Your Correct Clerk Frontend API URL

In Clerk Dashboard:

1. Go to **Developers** → **API Keys** (left sidebar)
2. Look for the **"Frontend API"** value
3. It should look like one of these:
   - `https://your-app-name.clerk.accounts.dev` (for test/dev)
   - `https://clerk.your-domain.com` (if using custom domain)
   - Or just the instance identifier

### Step 2: Check Where to Add Domains

The domain configuration is usually in one of these places in Clerk Dashboard:

#### Option A: In Settings → Domains
1. Go to **Configure** → **Settings**
2. Look for **Domains** or **Domain settings**
3. Add your Amplify domain: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

#### Option B: In Developers → Allowed Origins
1. Go to **Developers** section (left sidebar)
2. Look for **Allowed origins** or **CORS settings**
3. Add your Amplify domain

#### Option C: Automatically Allowed by Default
Some Clerk instances automatically allow all origins. If you don't see a domains section, check:
1. Go to **Configure** → **Settings**
2. Look for **Security** settings
3. Check if **"Allow requests from any origin"** is enabled

### Step 3: Update Frontend Environment Variables

Your frontend needs to use the CORRECT Clerk Frontend API.

**Option 1: Remove Custom Frontend API** (Recommended)

In your AWS Amplify environment variables, **REMOVE** or leave empty:
```bash
# REMOVE THIS LINE OR SET TO EMPTY
NEXT_PUBLIC_CLERK_FRONTEND_API=
```

When this is not set, Clerk will automatically derive the correct Frontend API from your publishable key.

**Option 2: Use Account Portal Domain**

If you must specify it, use your Account Portal domain:
```bash
NEXT_PUBLIC_CLERK_FRONTEND_API=https://accounts.adwiise.com
```

### Step 4: Update Backend Environment (Already Done)

You've already updated this, but verify in your Fargate task:
```properties
CLERK_PUBLISHABLE_KEY=pk_live_***_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_***_CLERK_SECRET_KEY_HERE
```

### Step 5: Check Clerk Instance Configuration

In Clerk Dashboard → **Configure** → **Settings**:

1. **Instance domain**: Should match your publishable key
2. **Home URL**: Set to `https://www.adwiise.com` (your production URL)
3. **Allowed redirect URLs**: Should include:
   - `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/*`
   - `https://www.adwiise.com/*`
   - `http://localhost:3000/*` (for local dev)

## Quick Fix to Try First

### Update AWS Amplify Environment Variables

1. Go to AWS Amplify Console
2. Select your app
3. Go to **Environment variables**
4. **CHANGE**:
   ```
   NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com
   ```
   **TO** (leave empty):
   ```
   NEXT_PUBLIC_CLERK_FRONTEND_API=
   ```
   Or delete this variable entirely

5. **Alternatively, try using the Account Portal domain**:
   ```
   NEXT_PUBLIC_CLERK_FRONTEND_API=https://accounts.adwiise.com
   ```

6. Redeploy your Amplify app

### Why This Works

Clerk publishable keys are encoded with the correct Frontend API endpoint. By removing the custom `NEXT_PUBLIC_CLERK_FRONTEND_API`, Clerk's SDK will automatically:
1. Decode your publishable key
2. Extract the correct Frontend API URL
3. Use the proper endpoint for API calls

## Verify Configuration

After making changes, check browser console:

```javascript
// Open browser console on your Amplify URL
console.log('Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
console.log('Frontend API:', process.env.NEXT_PUBLIC_CLERK_FRONTEND_API);

// After Clerk loads
window.Clerk.getFrontendApi();
```

## Alternative: Check if Domain is the Issue

To test if domain is the issue, try accessing your Clerk endpoints directly:

```bash
# Check if the publishable key works
curl https://clerk.adwiise.com/v1/client?_clerk_js_version=4.73.14 \
  -H "Authorization: Bearer pk_live_***_CLERK_PUBLISHABLE_KEY"

# Or try with accounts subdomain
curl https://accounts.adwiise.com/v1/client?_clerk_js_version=4.73.14 \
  -H "Authorization: Bearer pk_live_***_CLERK_PUBLISHABLE_KEY"
```

## Check Clerk Dashboard for Actual Frontend API

1. Go to: **Developers** → **API Keys**
2. Under your publishable key, you should see a field labeled **"Frontend API"**
3. Copy that EXACT value
4. Use it in your environment variables

## If Still Not Working: Contact Clerk Support

If the above doesn't work, you may need to:

1. Go to Clerk Dashboard → **Support** (bottom left)
2. Ask: "How do I whitelist my custom domain `feature-common-clerk.d1508w3f27cyps.amplifyapp.com` for my Clerk instance?"
3. Provide:
   - Your publishable key: `pk_live_***_CLERK_PUBLISHABLE_KEY`
   - The domain causing 400 errors
   - Screenshot of the error

## Expected Behavior After Fix

✅ No 400 errors in console
✅ Clerk loads successfully
✅ Sign-in page displays properly
✅ Authentication flow works
✅ User sessions persist

## Most Likely Fix

Based on typical Clerk configurations, the fix is:

**In AWS Amplify Environment Variables**:
```bash
# Remove or leave empty - let Clerk auto-detect
NEXT_PUBLIC_CLERK_FRONTEND_API=
```

**Or use Account Portal domain**:
```bash
NEXT_PUBLIC_CLERK_FRONTEND_API=https://accounts.adwiise.com
```

Then redeploy and test.
