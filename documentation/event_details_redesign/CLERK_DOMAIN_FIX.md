# Clerk Satellite Domain Fix - www vs Bare Domain

## The Problem

You were experiencing authentication issues in production where:
1. `userId` was `null` even after sign-in
2. Admin menu wasn't showing despite having admin role in database
3. The sign-in redirect flow wasn't working

## Root Cause

**Clerk requires the BARE domain (without `www.`) for satellite configuration**, but your code had `www.mosc-temp.com` in multiple places.

According to Clerk documentation:
> For satellite domains, use the bare domain without subdomain prefix (e.g., `mosc-temp.com`, not `www.mosc-temp.com`)

## What Was Wrong

### 1. Environment Variable (.env.production) ❌
```bash
# WRONG - Had www prefix
NEXT_PUBLIC_CLERK_DOMAIN=www.mosc-temp.com

# Your own comment even said it should be without www!
#Clerk domain should be the bare domain, not www. Set NEXT_PUBLIC_CLERK_DOMAIN to mosc-temp.com (no www)
```

### 2. Layout Component (src/app/layout.tsx) ❌
```typescript
// WRONG - Hardcoded with www
const clerkProps = isSatellite
  ? {
    isSatellite: true,
    domain: 'www.mosc-temp.com',  // ❌ Should be bare domain
    ...
  }
```

### 3. Middleware Fallback (src/middleware.ts) ❌
```typescript
// WRONG - Fallback added www prefix
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN ||
  (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'www.mosc-temp.com' : undefined);
  //                                                              ^^^ WRONG
```

## The Fix

### 1. Environment Variable (.env.production) ✅
```bash
# CORRECT - Bare domain without www
NEXT_PUBLIC_CLERK_DOMAIN=mosc-temp.com
```

### 2. Layout Component (src/app/layout.tsx) ✅
```typescript
// CORRECT - Bare domain for Clerk configuration
const clerkProps = isSatellite
  ? {
    isSatellite: true,
    domain: 'mosc-temp.com', // ✅ Bare domain without www
    signInUrl: 'https://www.adwiise.com/sign-in',
    signUpUrl: 'https://www.adwiise.com/sign-up',
  }
  : {
    // Full URL with www is OK for allowedRedirectOrigins
    allowedRedirectOrigins: ['https://www.mosc-temp.com'],
  };
```

### 3. Middleware Fallback (src/middleware.ts) ✅
```typescript
// CORRECT - Fallback uses bare domain
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN ||
  (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'mosc-temp.com' : undefined);
  //                                                              ^^^ CORRECT
```

## Why This Matters

### Clerk's Domain Resolution

Clerk uses the `domain` property to:
1. **Identify the satellite domain** in its system
2. **Match against the configured domains** in your Clerk dashboard
3. **Establish session synchronization** between primary and satellite

When you use `www.mosc-temp.com` instead of `mosc-temp.com`:
- Clerk can't match it to the configured satellite domain
- Session synchronization fails
- User remains unauthenticated on satellite domain

### Important Distinction

| Property | Format | Example | Notes |
|----------|--------|---------|-------|
| `NEXT_PUBLIC_CLERK_DOMAIN` | **Bare domain** | `mosc-temp.com` | NO www prefix |
| `domain` (ClerkProvider) | **Bare domain** | `mosc-temp.com` | NO www prefix |
| `NEXT_PUBLIC_APP_URL` | **Full URL** | `https://www.mosc-temp.com` | www is OK |
| `allowedRedirectOrigins` | **Full URL** | `https://www.mosc-temp.com` | www is OK |

## The Authentication Flow (After Fix)

Now it should work as you expected:

```
1. User visits https://www.mosc-temp.com
   ↓
2. User clicks "Sign In"
   ↓
3. Clerk redirects to https://www.adwiise.com/sign-in (primary domain)
   ↓
4. User authenticates on primary domain
   ↓
5. Clerk establishes session on primary domain
   ↓
6. Clerk redirects back to https://www.mosc-temp.com
   ↓
7. Clerk syncs session to satellite domain (using bare domain: mosc-temp.com)
   ↓
8. User is now authenticated on www.mosc-temp.com
   ↓
9. Header shows userId: 'user_2vVLxhPnsIPGYf6qpfozk383Slr'
   ↓
10. Server-side admin check succeeds
   ↓
11. Admin menu appears ✅
```

## How This Was Working Before

This issue likely arose from:
1. **Environment variable change** - Someone updated the domain config
2. **Code refactoring** - The hardcoded domain was added during satellite setup
3. **Clerk configuration change** - Dashboard settings were updated

Previously, these settings might have been correctly set as bare domains, which is why it worked before.

## Deployment Steps

To deploy this fix to production:

### 1. Update Environment Variables in AWS Amplify

Go to AWS Amplify console for www.mosc-temp.com app:

```bash
# Update this environment variable:
NEXT_PUBLIC_CLERK_DOMAIN=mosc-temp.com  # Remove www. if present
```

### 2. Verify Clerk Dashboard Configuration

Go to https://dashboard.clerk.com:

1. Navigate to your application
2. Go to **Configure** → **Domains**
3. Ensure satellite domain is listed as: `mosc-temp.com` (not `www.mosc-temp.com`)
4. Verify primary domain is: `www.adwiise.com`

### 3. Deploy Code Changes

```bash
# Commit the fixed code
git add .
git commit -m "fix: Correct Clerk satellite domain from www.mosc-temp.com to mosc-temp.com

- Update .env.production: NEXT_PUBLIC_CLERK_DOMAIN=mosc-temp.com
- Update layout.tsx: Use bare domain for Clerk configuration
- Update middleware.ts: Fix fallback to use bare domain
- Update AUTHENTICATION_GUIDE.md: Clarify domain format requirements

Fixes authentication flow and admin menu visibility in production."

# Push to trigger deployment
git push origin feature_Common_Clerk
```

### 4. Verify After Deployment

After deployment completes:

1. **Clear browser data**: Clear cookies and localStorage for both domains
2. **Test authentication flow**:
   - Visit https://www.mosc-temp.com
   - Click "Sign In"
   - Should redirect to https://www.adwiise.com/sign-in
   - Sign in with your credentials
   - Should redirect back to https://www.mosc-temp.com
   - Check console: Should see `userId: 'user_...'`
   - Admin menu should be visible ✅

3. **Check console logs**:
   ```javascript
   [Header] Auth state: {
     isLoaded: true,
     userId: 'user_2vVLxhPnsIPGYf6qpfozk383Slr', // ✅ Should have userId
     userName: 'Gain Joseph',
     hostname: 'www.mosc-temp.com'
   }
   ```

4. **Verify 401 errors are reduced**: The middleware changes should also reduce prefetch 401 errors

## Testing Locally

To test this change locally:

```bash
# Start dev server
npm run dev

# The local environment doesn't use satellite configuration
# Authentication should work normally on localhost
```

## Additional Resources

- [Clerk Satellite Domains Documentation](https://clerk.com/docs/deployments/set-up-satellite-domains)
- [Clerk Domain Configuration](https://clerk.com/docs/deployments/domains)
- Project Documentation: `documentation/clerk_authentication/DOMAIN_REGN_AND_CLERK_SATELLITE_SET_UP_GUIDE.md`

## Files Changed

1. `.env.production` - Fixed `NEXT_PUBLIC_CLERK_DOMAIN`
2. `src/app/layout.tsx` - Fixed hardcoded `domain` property
3. `src/middleware.ts` - Fixed fallback domain computation
4. `AUTHENTICATION_GUIDE.md` - Updated documentation
5. This file - `CLERK_DOMAIN_FIX.md` - Explanation of the fix

## Key Takeaway

**For Clerk satellite domains, ALWAYS use the bare domain without `www.` prefix in:**
- ✅ `NEXT_PUBLIC_CLERK_DOMAIN` environment variable
- ✅ `domain` property in ClerkProvider props
- ✅ Clerk dashboard satellite domain configuration

**But you CAN use full URLs with `www.` in:**
- ✅ `NEXT_PUBLIC_APP_URL` (full URL)
- ✅ `allowedRedirectOrigins` (full URLs array)
- ✅ `signInUrl` / `signUpUrl` (full URLs)
