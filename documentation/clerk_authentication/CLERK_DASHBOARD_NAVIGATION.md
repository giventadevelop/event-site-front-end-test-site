# Finding Domain Settings in Clerk Dashboard

## Where to Configure Domains in Clerk

Clerk's dashboard layout can vary, but here's where to find domain settings:

### Method 1: Check API Keys Section

1. **Left Sidebar** → Click **"Developers"**
2. Click **"API Keys"**
3. Look for:
   - **Frontend API** value (this is what you need for `NEXT_PUBLIC_CLERK_FRONTEND_API`)
   - Should show something like `clerk.adwiise.com` or `accounts.adwiise.com`

### Method 2: Check Instance Settings

1. **Top of page** → Click your instance name (currently shows "nextjs-template")
2. Look for **"Instance settings"** or **"Configure"**
3. Inside, find:
   - **"Domains"** section
   - **"Allowed origins"**
   - **"Application URLs"**

### Method 3: Look in Configure Menu

Since you're in the **"Configure"** section (I can see it's highlighted in your screenshot):

1. Stay in **Configure** tab (you're already there)
2. Look at the left sidebar under "Developers"
3. Click **"Domains"** (might be collapsed under Developers section)

If you don't see "Domains", try:
- Click **"Settings"** (in left sidebar under Application)
- Look for **"Instance"** or **"Domain settings"**

### Method 4: Check Sessions Settings

1. In **Configure** tab
2. Left sidebar → **"Sessions"**
3. Look for:
   - **"Allowed origins"**
   - **"Custom session token"**
   - **"Cross-origin settings"**

## What You Need to Add

Wherever you find the domain/origins settings, add:

```
https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
https://www.adwiise.com
http://localhost:3000
```

## If You Can't Find Domain Settings

This means one of two things:

### Possibility 1: Domains are Auto-Allowed
Your Clerk instance might be configured to allow all domains automatically. This is common in:
- Development/Test instances
- Instances created before Clerk enforced strict domain checking

**To verify**: Check if **Settings** → **Security** has an option like:
- ☑ "Allow requests from any origin"
- ☑ "Disable domain restrictions"

### Possibility 2: Your Frontend API URL is Wrong

The `https://clerk.adwiise.com` in your environment variables might not be the correct Frontend API.

**Solution**:
1. Go to **Developers** → **API Keys**
2. Find the exact **"Frontend API"** value shown there
3. Use that EXACT value (or leave it empty to auto-detect)

## Quick Test: Remove Frontend API Variable

The fastest way to test if this is a Frontend API URL issue:

### In AWS Amplify:

1. Go to **Environment variables**
2. **DELETE** or **CLEAR** the value of:
   ```
   NEXT_PUBLIC_CLERK_FRONTEND_API
   ```
3. Keep only:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY=sk_live_***_CLERK_SECRET_KEY_HERE
   ```
4. **Redeploy**

This lets Clerk SDK auto-detect the correct Frontend API from your publishable key.

## Decode Your Publishable Key

Your key `pk_live_***_CLERK_PUBLISHABLE_KEY` is base64 encoded.

To see what domain it points to:

```bash
# In a terminal or browser console
echo "Y2xlcmsuYWR3aWlzZS5jb20k" | base64 -d
# Output: clerk.adwiise.com$
```

This means your Clerk instance IS using `clerk.adwiise.com` as the domain.

## The Real Issue: Domain Not Whitelisted

Since the key decodes to `clerk.adwiise.com`, that IS the correct Frontend API.

The 400 error means **Clerk is rejecting requests from your Amplify domain**.

### Where to Whitelist in Newer Clerk Dashboards:

Look for one of these locations:

1. **Configure** → **Settings** → Scroll down to **"Allowed origins"**
2. **Configure** → **Instance** → **"Security"** → **"CORS origins"**
3. **Developers** → **"Domains"** (might be under a collapsed menu)

### What to Look For:

A text box or list where you can add:
- Origins/URLs
- Allowed domains
- Redirect URLs
- CORS origins

## Alternative: Check Account Portal Settings

I see in your screenshot the sign-in is set to `https://accounts.adwiise.com/sign-in`.

This means your Account Portal domain is `accounts.adwiise.com`.

Try this:

1. Look for **"Account Portal"** in left sidebar (under Customization)
2. Click it
3. Look for **"Domain settings"**
4. Check if there's a place to add application domains

## Still Can't Find It?

If you absolutely cannot find where to add domains, try this **workaround**:

### Test with Account Portal Domain

In AWS Amplify environment variables:

```bash
# Change FROM:
NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com

# Change TO:
NEXT_PUBLIC_CLERK_FRONTEND_API=https://accounts.adwiise.com
```

Then redeploy and test. The Account Portal might be configured to allow your domains already.

## Contact Clerk Support

If none of the above works, click the **chat/support icon** (usually bottom right) in Clerk Dashboard and ask:

> "Where do I configure allowed domains for my Clerk instance? I'm getting 400 errors from my domain: feature-common-clerk.d1508w3f27cyps.amplifyapp.com"

They can show you exactly where in your specific dashboard layout.
