# Clerk: Satellite Domains vs Allowed Origins

## Current Issue

The Amplify domain `feature-common-clerk.d1508w3f27cyps.amplifyapp.com` is configured as a **Satellite Domain** but shows **"Unverified"** status.

**Result**: OAuth fails with `authorization_invalid` even though all other configuration is correct.

---

## Understanding the Difference

### Satellite Domains (What You're Currently Using)
- **Purpose**: Host Clerk auth UI on multiple custom domains
- **Requires**: DNS CNAME configuration pointing to `clerk.adwiise.com`
- **Requires**: Verification before OAuth works
- **Use Case**: When you want `clerk.yourapp.com` to show Clerk sign-in pages
- **Status**: ❌ **UNVERIFIED** → OAuth will NOT work

### Allowed Origins (What You Should Use Instead)
- **Purpose**: Allow your app domains to use Clerk authentication
- **Requires**: NO DNS configuration
- **Requires**: NO verification
- **Use Case**: When your app at `yourapp.com` uses Clerk for auth
- **Status**: ✅ **Instant** → OAuth works immediately

---

## Recommended Solution

### Stop Using Satellite Domain Mode

The Amplify domain should be in **"Allowed Origins"**, NOT **"Satellite Domains"**.

### Why?

1. **Amplify domains change frequently**: Every branch gets a new URL
2. **DNS verification fails**: Can't add CNAME records to Amplify domains
3. **Simpler configuration**: No proxy needed, no verification needed
4. **Works immediately**: Just add to allowed origins list

---

## Step-by-Step Fix

### Step 1: Remove from Satellite Domains

1. **Go to**: Clerk Dashboard → Domains → Satellites
2. **Find**: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
3. **Click**: "Delete Domain" button (red button at bottom of screenshot)
4. **Confirm deletion**

### Step 2: Add to Allowed Origins

1. **Go to**: Clerk Dashboard → Configure → **Settings**
2. **Find**: "Allowed origins" section
3. **Click**: "Add origin"
4. **Enter**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
5. **Save**

### Step 3: Test OAuth

1. **Wait**: 1-2 minutes for propagation
2. **Clear**: Browser cookies
3. **Visit**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
4. **Click**: "Continue with Google"
5. **Expected**: ✅ OAuth works successfully!

---

## Current Code Configuration

### layout.tsx (src/app/layout.tsx) - Already Correct!

Your current simplified configuration is **perfect** for allowed origins mode:

```typescript
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  telemetry={false}
>
```

**No changes needed** - this works with allowed origins.

### Proxy Route (src/app/__clerk/[...path]/route.ts)

You can **DELETE this file** - it's only needed for satellite domains.

Or keep it for future use, it won't hurt anything.

---

## When to Use Satellite Domains

Only use satellite domains if:
- ✅ You OWN the domain (not Amplify/Vercel preview URLs)
- ✅ You can add DNS CNAME records
- ✅ You want Clerk sign-in pages hosted on your custom domain
- ✅ You need Account Portal pattern

**For Amplify preview branches**: Use allowed origins instead!

---

## Expected Outcome

After switching to allowed origins:

### Before (Satellite Domain - Unverified):
```
❌ OAuth fails with authorization_invalid
❌ Domain shows "Unverified"
❌ Requires DNS configuration
❌ Requires proxy setup
```

### After (Allowed Origins):
```
✅ OAuth works immediately
✅ No verification needed
✅ No DNS configuration needed
✅ No proxy needed
✅ Simple configuration
```

---

## Production vs Preview Environments

### For Production Domain (`www.adwiise.com`):
- ✅ Use as **Primary Domain** in Clerk
- ✅ Add to Google OAuth "Authorized JavaScript origins"
- ✅ OAuth works perfectly

### For Amplify Preview Branches:
- ✅ Add each branch URL to **Allowed Origins**
- ✅ Add to Google OAuth "Authorized JavaScript origins"
- ✅ OAuth works without verification

### For Development (`localhost`):
- ✅ Add `http://localhost:3000` to **Allowed Origins**
- ✅ Add to Google OAuth "Authorized JavaScript origins"
- ✅ OAuth works locally

---

## Quick Fix Summary

1. **Delete** satellite domain `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
2. **Add** same URL to "Allowed Origins" instead
3. **Wait** 1-2 minutes
4. **Test** OAuth again
5. **Should work!** ✅

---

**Created**: 2025-10-23
**Status**: ACTION REQUIRED
**Priority**: CRITICAL
**Next Action**: Remove from Satellite Domains, add to Allowed Origins
