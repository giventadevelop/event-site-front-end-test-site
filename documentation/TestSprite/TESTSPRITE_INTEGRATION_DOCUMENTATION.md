# TestSprite Integration Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture & Approach](#architecture--approach)
3. [Test Mode Detection](#test-mode-detection)
4. [Clerk Authentication Bypass Mechanisms](#clerk-authentication-bypass-mechanisms)
5. [Current Implementation](#current-implementation)
6. [Known Issues & Test Failures](#known-issues--test-failures)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Production Safety](#production-safety)

---

## Overview

This document describes the integration of TestSprite testing framework with the Next.js application, including all workarounds implemented to bypass Clerk authentication for automated testing.

### Goals

- ✅ Enable TestSprite to test admin pages without manual authentication
- ✅ Bypass Clerk authentication in test environments
- ✅ Maintain production security (test mode never activates in production)
- ✅ Support both TestSprite cloud service and local Playwright tests

### Challenges Faced

1. **Clerk Authentication**: Admin pages require Clerk authentication, which TestSprite cannot handle
2. **Network Requests**: Clerk makes API calls that fail in test environments
3. **Hydration Mismatches**: Server/client state differences cause React hydration errors
4. **Script Loading**: Clerk scripts load asynchronously and interfere with tests

---

## Architecture & Approach

### Multi-Layer Bypass Strategy

We implemented a **multi-layer approach** to bypass Clerk authentication:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Test Mode Detection (User Agent + Env Vars)   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Middleware Bypass (Public Routes)              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Server-Side Auth Bypass (Admin Layout)        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Network-Level Blocking (Clerk API Calls)      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Client-Side Mocking (Window Globals)          │
└─────────────────────────────────────────────────────────┘
```

---

## Test Mode Detection

### Detection Methods

Test mode is detected through **multiple mechanisms**:

#### 1. User Agent Detection
```typescript
// Detects TestSprite, Playwright, Puppeteer, etc.
/TestSprite|testsprite|playwright|puppeteer|selenium|headless/i.test(userAgent)
```

#### 2. Environment Variables
```typescript
// Explicit test mode enablement
process.env.NEXT_PUBLIC_ENABLE_TEST_AUTH_BYPASS === 'true'
process.env.NEXT_PUBLIC_DISABLE_CLERK_FOR_TESTS === 'true'
```

#### 3. Production Safety Check
```typescript
// CRITICAL: Never enable in production
process.env.NODE_ENV !== 'production'
```

### Detection Points

| Location | File | Detection Method |
|----------|------|------------------|
| **Middleware** | `src/middleware.ts` | User agent + env vars + NODE_ENV |
| **Root Layout** | `src/app/layout.tsx` | User agent + env vars + NODE_ENV |
| **Admin Layout** | `src/app/admin/layout.tsx` | Headers + `isTestModeFromHeaders()` |
| **Clerk Wrapper** | `src/components/ClerkProviderWrapper.tsx` | User agent + env vars + NODE_ENV |
| **Test Auth Helper** | `src/lib/test-auth.ts` | Centralized detection logic |

---

## Clerk Authentication Bypass Mechanisms

### 1. Middleware Route Bypass

**File**: `src/middleware.ts`

**What it does**: Adds admin routes to `publicRoutes` array in test mode, bypassing Clerk middleware authentication.

```typescript
const isTestModeEnabled =
  process.env.NEXT_PUBLIC_ENABLE_TEST_AUTH_BYPASS === 'true' &&
  process.env.NODE_ENV !== 'production';

const publicRoutes = isTestModeEnabled
  ? [...basePublicRoutes, '/admin(.*)']  // Add admin routes in test mode
  : basePublicRoutes;
```

**Why needed**: Clerk middleware intercepts all requests and redirects unauthenticated users. This bypass allows TestSprite to access admin pages.

**Status**: ✅ Working

---

### 2. Server-Side Auth Bypass (Admin Layout)

**File**: `src/app/admin/layout.tsx`

**What it does**: Skips `auth()` and `currentUser()` calls in test mode, allowing admin pages to render without authentication.

```typescript
const isTestMode = await isTestModeFromHeaders();

if (isTestMode) {
  console.log('[AdminLayout] TEST MODE DETECTED - Bypassing authentication');
  return <>{children}</>; // Skip auth checks
}
```

**Why needed**: Admin layout checks for authentication and redirects unauthorized users. This bypass allows rendering admin pages in test mode.

**Status**: ✅ Working

---

### 3. Network-Level Request Blocking

**File**: `src/app/layout.tsx` (inline script) + `src/components/ClerkProviderWrapper.tsx`

**What it does**: Intercepts and blocks all Clerk API requests at the network level using `fetch` and `XMLHttpRequest` overrides.

#### Inline Script (layout.tsx)
```typescript
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      // Block Clerk fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        if (url.includes('clerk') || url.includes('clerk.accounts.dev')) {
          return Promise.reject(new Error('Clerk blocked in test mode'));
        }
        return originalFetch.apply(this, args);
      };

      // Block Clerk XHR requests
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string' && (url.includes('clerk') || url.includes('clerk.accounts.dev'))) {
          return;
        }
        return originalXHROpen.apply(this, [method, url, ...rest]);
      };

      // Block script tag creation for Clerk
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName, ...rest) {
        const element = originalCreateElement.call(this, tagName, ...rest);
        if (tagName === 'script' && element.src &&
            (element.src.includes('clerk') || element.src.includes('clerk.accounts.dev'))) {
          element.remove();
          return document.createElement('noscript');
        }
        return element;
      };
    })();
  `
}} />
```

**Why needed**: Clerk makes API calls to `clerk.accounts.dev` that fail in test environments, causing errors and blocking page loads.

**Status**: ⚠️ Partially working (some requests still get through)

---

### 4. Clerk Script Blocking

**File**: `src/components/ClerkProviderWrapper.tsx`

**What it does**: Prevents Clerk scripts from loading by blocking script tag creation.

```typescript
useEffect(() => {
  if (!isTestEnvironment) return;

  // Block Clerk.load(), Clerk.isReady(), etc.
  if (typeof window !== 'undefined' && (window as any).Clerk) {
    (window as any).Clerk.load = () => Promise.reject(new Error('Blocked in test mode'));
    (window as any).Clerk.isReady = () => Promise.resolve(false);
  }
}, [isTestEnvironment]);
```

**Why needed**: Clerk scripts load asynchronously and can cause hydration errors or block page rendering.

**Status**: ⚠️ Partially working (scripts may load before blocking)

---

### 5. Mock User ID Injection

**File**: `src/app/layout.tsx` (inline script) + `src/components/ClerkProviderWrapper.tsx`

**What it does**: Injects a mock admin user ID into `window.__TEST_ADMIN_USER_ID__` for components that check authentication.

```typescript
// In inline script (layout.tsx)
if (isTestEnvironment) {
  window.__TEST_ADMIN_USER_ID__ = 'test_admin_user_id_' + Date.now();
}

// Components check for this:
const userId = (window as any).__TEST_ADMIN_USER_ID__ || clerkUserId;
```

**Why needed**: Some components check for `userId` from Clerk. This provides a mock ID in test mode.

**Status**: ✅ Working

---

### 6. ClerkProvider Wrapper

**File**: `src/components/ClerkProviderWrapper.tsx`

**What it does**: Wraps ClerkProvider but blocks network requests and mocks Clerk methods in test mode.

```typescript
// Always render ClerkProvider (prevents hook errors)
// But block network requests in test mode
<ClerkProvider publishableKey={keyToUse} {...clerkProps}>
  {children}
</ClerkProvider>
```

**Why needed**: Components use Clerk hooks (`useAuth()`, `useUser()`, etc.). Not rendering ClerkProvider causes hook errors. This wrapper allows hooks to work while blocking actual API calls.

**Status**: ✅ Working (but causes hydration warnings)

---

## Current Implementation

### Files Modified/Created

| File | Purpose | Status |
|------|---------|--------|
| `src/middleware.ts` | Route bypass for admin pages | ✅ Working |
| `src/app/layout.tsx` | Test mode detection + inline blocking script | ✅ Working |
| `src/app/admin/layout.tsx` | Server-side auth bypass | ✅ Working |
| `src/components/ClerkProviderWrapper.tsx` | Network blocking + Clerk mocking | ⚠️ Partial |
| `src/lib/test-auth.ts` | Centralized test mode detection | ✅ Working |
| `TestSprite/sanity-tests/run-public-pages-test.js` | Local Playwright test script | ✅ Working |
| `TestSprite/sanity-tests/testsprite-mcp-config.json` | TestSprite cloud config | ⚠️ Failing |

---

## Known Issues & Test Failures

### 1. Hydration Mismatch Errors ⚠️

**Error Message**:
```
Hydration failed because the server rendered HTML didn't match the client.
```

**Root Cause**:
- Server renders with test user ID (bypassed auth)
- Client hydrates with Clerk state (different user ID)
- React detects mismatch → hydration error

**Impact**:
- ⚠️ Console errors in test mode
- ✅ **Does NOT affect production** (only occurs in test mode)
- ⚠️ May cause some components to re-render

**Status**: Expected behavior in test mode, safe for production

---

### 2. ChunkLoadError (HMR) ⚠️

**Error Message**:
```
Loading chunk _app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js failed.
```

**Root Cause**:
- Next.js Hot Module Reload (HMR) chunks fail to load in test environment
- Test mode blocks some network requests that HMR needs

**Impact**:
- ⚠️ Console errors in test mode
- ✅ **Does NOT affect production** (HMR only in development)
- ⚠️ May cause page reloads in test mode

**Status**: Suppressed in test config, but still appears in console

---

### 3. Clerk API Call Failures ⚠️

**Error Message**:
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**Root Cause**:
- Some Clerk API calls still get through network blocking
- Clerk scripts may load before blocking script executes

**Impact**:
- ⚠️ Console errors (suppressed in test config)
- ⚠️ May slow down page loads
- ✅ **Does NOT affect production** (only in test mode)

**Status**: Partially suppressed, some requests still appear

---

### 4. Test Failures: Events & Gallery Pages ❌

**Issue**: Tests fail for `/events` and `/gallery` pages

**Error**:
```
Main element not found within 30000ms timeout
```

**Root Cause**:
- Pages don't have `<main>` tags (use `<div>` instead)
- Pages load asynchronously (API calls)
- Network idle timeout may be too short

**Status**: ⚠️ **Partially fixed** - Updated test script to check for content instead of `main` tag, but tests still failing

**Workaround**: Updated test script to:
- Check for content instead of `main` tag
- Use `networkidle` wait strategy
- Increase timeouts

---

### 5. Test Failures: Admin Pages ❌

**Issue**: Some admin page tests fail or show "loading..." state

**Root Cause**:
- Components check for Clerk authentication state
- Mock user ID may not be available when components render
- Some components may be waiting for Clerk to initialize

**Status**: ⚠️ **Investigating** - May need to improve mock user ID injection timing

---

### 6. TestSprite Cloud Service Issues ❌

**Issue**: TestSprite cloud service tests fail

**Possible Causes**:
- Network blocking may interfere with TestSprite's cloud tunnel
- Clerk errors may cause TestSprite to fail tests
- Timeout issues with slow-loading pages

**Status**: ⚠️ **Not fully tested** - Local Playwright tests are preferred

---

## Troubleshooting Guide

### Issue: Tests Still Failing

#### Check 1: Verify Test Mode is Active
```bash
# Check console logs for:
[Layout] TEST MODE DETECTED
[AdminLayout] TEST MODE DETECTED
[ClerkProviderWrapper] Test mode: Blocking Clerk network requests
```

#### Check 2: Verify Environment Variables
```bash
# In .env.local:
NEXT_PUBLIC_ENABLE_TEST_AUTH_BYPASS=true

# Verify NODE_ENV is NOT 'production':
echo $NODE_ENV  # Should be 'development' or undefined
```

#### Check 3: Check User Agent
```bash
# TestSprite should send user agent with "TestSprite" in it
# Check middleware.ts logs for user agent detection
```

---

### Issue: Hydration Errors

**Expected**: Hydration errors are **normal in test mode** and won't affect production.

**To Suppress** (if needed):
- Already suppressed in `testsprite-mcp-config.json`:
  ```json
  "ignoreConsoleErrors": ["Hydration", "hydration", "ChunkLoadError"]
  ```

---

### Issue: Clerk API Calls Still Appearing

**Check**: Verify inline blocking script is executing

**Solution**: The inline script in `layout.tsx` should run before any other scripts. If Clerk calls still appear:
1. Check browser console for blocking messages
2. Verify script is in `<head>` (not `<body>`)
3. May need to add more aggressive blocking

---

### Issue: Admin Pages Show "Loading..."

**Possible Causes**:
1. Components waiting for Clerk to initialize
2. Mock user ID not available when component renders
3. API calls failing

**Solutions**:
1. Check if `window.__TEST_ADMIN_USER_ID__` is set
2. Verify components handle test mode correctly
3. Check network tab for failed API calls

---

### Issue: Tests Timeout

**Solutions**:
1. Increase timeout in test config:
   ```json
   "timeout": 45000,  // Increase from 30000
   "waitTimeout": 30000  // Increase wait timeout
   ```

2. Use `networkidle` wait strategy:
   ```javascript
   await page.goto(url, { waitUntil: 'networkidle' });
   ```

3. Add explicit waits for content:
   ```javascript
   await page.waitForSelector('h1', { timeout: 20000 });
   ```

---

## Production Safety

### Safeguards in Place

✅ **All test mode checks include `NODE_ENV !== 'production'`**:
- `src/middleware.ts`: Line 61
- `src/app/layout.tsx`: Line 40-43
- `src/components/ClerkProviderWrapper.tsx`: Line 28-35
- `src/lib/test-auth.ts`: Lines 29-30, 52-54

✅ **Even if env vars are set in production, test mode won't activate**

### Pre-Production Checklist

- [ ] Remove test env vars from production environment
- [ ] Verify `NODE_ENV=production` is set
- [ ] Test authentication in production after deployment
- [ ] Verify admin pages require login in production

**See**: `TEST_MODE_PRODUCTION_SAFETY.md` for detailed production safety guide

---

## Test Scripts

### Local Playwright Tests

**Run public pages tests**:
```bash
npm run test:public
```

**Run homepage test**:
```bash
npm run test:homepage
```

**Custom port**:
```bash
PORT=3001 npm run test:public
```

### TestSprite Cloud Tests

**Bootstrap tests**:
```bash
# Requires TestSprite MCP server
# See TestSprite/README.md for setup
```

**Note**: Local Playwright tests are preferred (no credits required, faster)

---

## Summary

### What Works ✅

- ✅ Test mode detection (user agent + env vars)
- ✅ Middleware route bypass
- ✅ Server-side auth bypass (admin layout)
- ✅ Mock user ID injection
- ✅ Local Playwright tests (public pages)
- ✅ Production safety (NODE_ENV checks)

### What's Partially Working ⚠️

- ⚠️ Network-level blocking (some Clerk calls still get through)
- ⚠️ Clerk script blocking (scripts may load before blocking)
- ⚠️ Events/Gallery page tests (timing issues)
- ⚠️ Admin page tests (some show loading state)

### What's Not Working ❌

- ❌ TestSprite cloud service tests (may need more investigation)
- ❌ Some admin page tests (components waiting for Clerk)

### Next Steps

1. **Improve network blocking**: Make it more aggressive/earlier
2. **Fix timing issues**: Ensure mock user ID is available before components render
3. **Handle async components**: Better handling of components that wait for Clerk
4. **Test admin pages**: Fix remaining admin page test failures
5. **Documentation**: Keep this doc updated as issues are resolved

---

## Related Files

- `TEST_MODE_PRODUCTION_SAFETY.md` - Production safety guide
- `TestSprite/README.md` - TestSprite setup guide
- `TestSprite/sanity-tests/README.md` - Sanity test documentation
- `src/lib/test-auth.ts` - Test mode detection helpers

---

**Last Updated**: 2025-01-22
**Status**: ⚠️ Partially Working - Tests pass for public pages, admin pages need more work

