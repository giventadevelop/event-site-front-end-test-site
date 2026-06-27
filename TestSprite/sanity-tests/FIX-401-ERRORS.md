# Fix 401 Errors in TestSprite Comprehensive Tests

## 🔴 Problem

All pages are returning **401 Unauthorized** errors when running `npm run test:comprehensive`, even for public pages that shouldn't require authentication.

## ✅ Root Cause

1. **Missing `/pricing` route** in `publicRoutes` - Fixed ✅
2. **Clerk middleware blocking** requests without session cookies
3. **Playwright requests** don't have authentication cookies

## 🛠️ Fixes Applied

### 1. Added `/pricing` to Public Routes

**File:** `src/middleware.ts`

```typescript
publicRoutes: [
  // ... existing routes ...
  '/pricing(.*)',  // Public pricing page (no auth required for viewing)
],
```

### 2. Enhanced Playwright Error Handling

**File:** `TestSprite/sanity-tests/run-comprehensive-sanity-tests-with-testsprite.js`

- Added redirect detection (checks if redirected to `/sign-in`)
- Better error messages with URL information
- Added user agent to make requests look like real browser

### 3. Improved Browser Context

Added realistic browser headers:
- User agent: Chrome on Windows
- Locale: en-US
- Timezone: America/New_York

## 🚀 Next Steps

### **CRITICAL: Restart Dev Server**

After updating `src/middleware.ts`, you **MUST** restart your Next.js dev server:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### **Verify Middleware Configuration**

Check that all public routes are in `publicRoutes`:

```typescript
publicRoutes: [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/proxy(.*)',
  '/mosc(.*)',
  '/events(.*)',
  '/sponsors(.*)',
  '/gallery(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/polls(.*)',
  '/charity-theme(.*)',
  '/calendar(.*)',
  '/focus-groups(.*)',
  '/pricing(.*)',  // ✅ Added
],
```

## 🔍 Debugging

If 401 errors persist after restart:

### 1. Check Clerk Configuration

Verify Clerk environment variables are set:
```bash
# Check .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### 2. Test Public Route Manually

Open browser and visit:
- http://localhost:3000/ (should work without login)
- http://localhost:3000/events (should work without login)
- http://localhost:3000/pricing (should work without login)

If these work in browser but fail in Playwright, it's a Playwright configuration issue.

### 3. Check Middleware Logs

Look for middleware logs in terminal where `npm run dev` is running:
```
[MIDDLEWARE] ===== API REQUEST DETECTED =====
[MIDDLEWARE] Pathname: /events
[MIDDLEWARE] Method: GET
```

### 4. Verify Public Routes Pattern

Clerk uses regex patterns. Make sure patterns match:
- `/events(.*)` matches `/events`, `/events/1`, `/events/1/edit`
- `/pricing(.*)` matches `/pricing`, `/pricing/plans`

## 📋 Test Checklist

After fixes:

- [ ] Restart dev server (`npm run dev`)
- [ ] Verify public pages work in browser (no login required)
- [ ] Run `npm run test:comprehensive`
- [ ] Check that public pages pass (not 401)
- [ ] Admin pages should still require auth (expected 401 for admin)

## 🎯 Expected Results

### **Public Pages (Should Pass):**
- ✅ Homepage (`/`)
- ✅ Events (`/events`)
- ✅ Gallery (`/gallery`)
- ✅ Polls (`/polls`)
- ✅ Calendar (`/calendar`)
- ✅ MOSC pages (`/mosc/*`)
- ✅ Pricing (`/pricing`) - **Fixed**

### **Admin Pages (Expected 401 - Need Auth):**
- ❌ `/admin` - Requires login
- ❌ `/admin/manage-events` - Requires login
- ❌ `/admin/membership/plans` - Requires login

## 🔧 Additional Fixes (If Still Failing)

If 401 errors persist, try:

### Option 1: Add Routes to `ignoredRoutes`

For complete bypass of Clerk middleware:

```typescript
ignoredRoutes: [
  // ... existing routes ...
  '/(.*)',  // Ignore all routes (not recommended - breaks auth)
],
```

**⚠️ Warning:** This will disable authentication entirely. Only use for testing.

### Option 2: Disable Clerk Middleware Temporarily

For testing only, comment out middleware:

```typescript
// export default authMiddleware({ ... });
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}
```

**⚠️ Warning:** This disables all authentication. Only for debugging.

### Option 3: Add Authentication to Playwright

If you need to test authenticated pages:

```javascript
// In test script, add authentication
await page.goto('http://localhost:3000/sign-in');
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password');
await page.click('button[type="submit"]');
// Wait for redirect
await page.waitForURL('http://localhost:3000/**');
```

## 📝 Summary

**Fixes Applied:**
1. ✅ Added `/pricing` to `publicRoutes`
2. ✅ Enhanced Playwright error handling
3. ✅ Added realistic browser headers

**Next Steps:**
1. ⚠️ **RESTART DEV SERVER** (required!)
2. ✅ Run tests again
3. ✅ Verify public pages pass

**If Still Failing:**
- Check Clerk environment variables
- Verify middleware configuration
- Test pages manually in browser
- Check middleware logs

---

**Key Takeaway:** After changing `src/middleware.ts`, always restart the dev server! 🔄

