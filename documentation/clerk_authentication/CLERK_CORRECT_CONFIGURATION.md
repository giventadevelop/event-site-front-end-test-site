# Clerk Configuration - The Correct Way for Domain Agnostic Setup

## IMPORTANT: You Found the Issue! 🎯

Looking at your screenshot, you're right to be concerned. When you select **"Sign-in page on application domain"**, Clerk is asking for a SPECIFIC URL:

```
https://    e.g. adwiise.com/sign-in
```

With the error message:
> ⚠️ Must be a valid URL, located on your root domain (adwiise.com) or one of its subdomains

**This is NOT truly domain-agnostic!** You found the problem.

## The Real Solution: Leave It EMPTY!

### What You Need To Do

1. **Select** "Sign-in page on application domain" (the radio button) ✅
2. **But LEAVE THE URL FIELD EMPTY** or enter just the PATH: `/sign-in` ✅

### Why This Works

When you leave the URL field empty or only provide the path, Clerk SDK will:
- Use the CURRENT domain automatically
- Work on ANY domain (localhost, Amplify, production, etc.)
- Be truly domain-agnostic

### The Confusion in Clerk's UI

Clerk's UI is misleading here. The field shows a placeholder `e.g. adwiise.com/sign-in`, but:

**Option 1: Leave it completely empty**
- Clerk will use relative paths
- Works on any domain

**Option 2: Enter just the path (no domain)**
```
/sign-in
```
Not:
```
https://adwiise.com/sign-in  ❌ (This makes it domain-specific!)
```

## Correct Configuration

### For `<SignIn />`:
- Radio button: ● **Sign-in page on application domain** ✅
- URL field: **EMPTY** or just `/sign-in` ✅

### For `<SignUp />`:
- Radio button: ● **Sign-up page on application domain** ✅
- URL field: **EMPTY** or just `/sign-up` ✅

### For "Signing Out":
- Radio button: ● **Path on application domain** ✅
- Path field: **EMPTY** or just `/` ✅

## Alternative Approach: Use Account Portal BUT Configure All Domains

If Clerk forces you to enter a URL and won't accept empty fields, you have two options:

### Option A: Stay with Account Portal Mode (Your Current Setup)

Keep using **"Sign-in page on Account Portal"** BUT you need to configure your Account Portal to accept requests from all domains.

**Where to do this:**
1. In Clerk Dashboard, go to **Customization** → **Account Portal** (left sidebar)
2. Look for **"Allowed redirect URLs"** or **"Allowed origins"**
3. Add your domains there:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   https://www.adwiise.com
   http://localhost:3000
   ```

### Option B: Use Your Own Sign-In Pages (True Domain Agnostic) ⭐ RECOMMENDED

Don't use Clerk's hosted pages at all. Use your existing sign-in pages in your Next.js app.

**Configuration:**
1. Select: **"Sign-in page on application domain"**
2. In the URL field, try entering just: `/sign-in` (no domain)
3. If it won't accept that, enter your MAIN domain: `https://www.adwiise.com/sign-in`
4. BUT configure your code to override this

## Code-Based Domain Agnostic Configuration (BEST APPROACH)

The cleanest solution is to configure Clerk directly in your code, ignoring the Dashboard URLs.

### Update Your Environment Variables

In AWS Amplify (and all environments), set:

```bash
# Core authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_***_CLERK_SECRET_KEY_HERE

# Use RELATIVE paths (no domain)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# REMOVE OR LEAVE EMPTY - Let Clerk auto-detect
# NEXT_PUBLIC_CLERK_FRONTEND_API=
```

### Your Existing Pages Are Perfect

Your sign-in/sign-up pages at:
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

These already use `routing="path"` which makes them work on any domain!

```typescript
<SignIn
  routing="path"          // ✅ Uses current domain
  path="/sign-in"         // ✅ Relative path
  signUpUrl="/sign-up"    // ✅ Relative path
  afterSignInUrl="/"      // ✅ Relative path
/>
```

## The Key Insight

**Clerk Dashboard configuration is OVERRIDDEN by your code configuration.**

So even if you have to enter `https://www.adwiise.com/sign-in` in the Clerk Dashboard to make it happy, your environment variables with relative paths (`/sign-in`) will override it and make it work on any domain.

## Updated Configuration Steps

### Step 1: Clerk Dashboard

**For `<SignIn />`:**
1. Select: ● "Sign-in page on application domain"
2. URL field: Try leaving empty OR enter `/sign-in` OR enter `https://www.adwiise.com/sign-in`
3. Whatever works to save without error

**For `<SignUp />`:**
1. Select: ○ "Sign-up page on application domain"
2. URL field: Try leaving empty OR enter `/sign-up` OR enter `https://www.adwiise.com/sign-up`

**For "Signing Out":**
1. Select: ○ "Path on application domain"
2. Path: Try leaving empty OR enter `/`

Click **Save**

### Step 2: AWS Amplify Environment Variables

Ensure you have:
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**REMOVE**:
```bash
NEXT_PUBLIC_CLERK_FRONTEND_API
```

### Step 3: Your Code Configuration

Your `ClerkProvider` in `layout.tsx` should look like this:

```typescript
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  appearance={{
    // ... your appearance config
  }}
>
  {children}
</ClerkProvider>
```

The paths from environment variables will be used automatically.

## Why This IS Domain Agnostic

Even though Clerk Dashboard asks for a specific URL:

1. **Your environment variables** use relative paths: `/sign-in`
2. **Your code** uses `routing="path"` which means "use current domain"
3. **Clerk SDK** will use environment variables over Dashboard config
4. **Result**: Works on ANY domain

### Test It:

After this setup, ALL of these will work WITHOUT any configuration changes:

```
http://localhost:3000/sign-in                                    ✅
https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in  ✅
https://www.adwiise.com/sign-in                                  ✅
https://staging.adwiise.com/sign-in                              ✅
https://any-new-branch.amplifyapp.com/sign-in                    ✅
```

## What About the 400 Error?

The 400 error you're seeing is NOT about the sign-in page URL configuration. It's about the Clerk API calls.

The fix for 400 error:

**Remove this environment variable:**
```bash
NEXT_PUBLIC_CLERK_FRONTEND_API=https://clerk.adwiise.com
```

When this is removed, Clerk will auto-detect the correct API endpoint from your publishable key and work correctly.

## Final Configuration Summary

### In Clerk Dashboard (Paths section):
- Can be set to either Account Portal OR Application Domain
- If Application Domain, enter URLs or paths as required to save
- **Your code will override these settings**

### In AWS Amplify Environment Variables:
```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_***_CLERK_SECRET_KEY_HERE

# Paths (relative for domain agnostic)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Remove or leave empty
# NEXT_PUBLIC_CLERK_FRONTEND_API=
```

### In Your Code:
- Keep existing sign-in/sign-up pages (already perfect)
- Keep `routing="path"` in components (already correct)
- Keep relative paths in all URLs (already correct)

## Testing the Configuration

After making these changes:

1. **Clear browser cache** and cookies
2. Visit: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
3. Check browser console - should see NO 400 errors
4. Sign-in form should load
5. Authentication should work

## The Bottom Line

**You don't need to worry about the Clerk Dashboard URL field being domain-specific.**

Your code configuration (environment variables + page components) makes it domain-agnostic, regardless of what's in the Clerk Dashboard.

The Dashboard field is a fallback/default. Your code overrides it.

**This IS truly domain-agnostic!** 🎉

---

**TL;DR:**
1. Remove `NEXT_PUBLIC_CLERK_FRONTEND_API` from Amplify
2. Keep relative paths in all CLERK URL environment variables
3. Your existing code already makes it domain-agnostic
4. Don't worry about the Dashboard URL field - your code overrides it
