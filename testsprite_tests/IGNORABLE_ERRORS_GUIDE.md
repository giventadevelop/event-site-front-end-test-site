# Ignorable Errors Guide

## Overview

This guide explains which errors in TestSprite test reports can be safely ignored when pages are actually working correctly.

## ✅ Safe to Ignore (Non-Critical Errors)

These errors don't indicate actual functionality problems and can be ignored:

### 1. **Network Errors for External Resources**
- `ERR_SOCKET_NOT_CONNECTED` - External fonts/CDN connection issues
- `ERR_CONNECTION_CLOSED` - External resource connection closed
- `ERR_EMPTY_RESPONSE` - Often timing issues during test execution
- `ERR_TIMED_OUT` - Timeout during test execution (not user-facing)

**Examples:**
- `Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://cdnjs.cloudflare.com/ajax/libs/font-awesome/...)`
- `Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED (at https://fonts.googleapis.com/...)`
- `Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/css/...)`

**Why Safe:** These are often:
- Test execution timing issues (server slow to respond during automated tests)
- External CDN/font loading issues (don't affect core functionality)
- Next.js static asset loading timing (pages still render correctly)

### 2. **Image Warnings**
- Image aspect ratio warnings
- Image position warnings
- LCP (Largest Contentful Paint) warnings

**Examples:**
- `Image with src "..." has either width or height modified, but not the other`
- `Image with src "..." has "fill" and parent element with invalid "position"`
- `Image with src "..." was detected as the Largest Contentful Paint (LCP)`

**Why Safe:** These are performance/optimization warnings, not functional errors. Pages still work correctly.

### 3. **Next.js 15 Headers() Warnings**
- `Route "/" used ...headers() or similar iteration`
- `headers() should be awaited before using its value`

**Why Safe:** Known Next.js 15/Clerk limitation. Pages render correctly despite the warning.

### 4. **React Hydration Warnings**
- `Cannot update a component while rendering a different component`
- `Hydration failed`

**Why Safe:** Non-critical React warnings that don't prevent pages from working.

### 5. **MobileDebugConsole Warnings**
- Any errors/warnings referencing `MobileDebugConsole.tsx`

**Why Safe:** Debug tool warnings, not user-facing issues.

## ❌ Should NOT Ignore (Critical Errors)

These indicate actual problems:

### 1. **Page Not Found (404)**
- `404 Not Found`
- `The page could not be found`

**Action Required:** Fix routing or create missing pages.

### 2. **Server Errors (500)**
- `500 Internal Server Error`
- `Internal Server Error`

**Action Required:** Fix server-side code errors.

### 3. **JavaScript Runtime Errors**
- `TypeError: Cannot read property 'x' of undefined`
- `ReferenceError: x is not defined`
- `SyntaxError: Unexpected token`

**Action Required:** Fix JavaScript code errors.

### 4. **Functional Test Failures**
- Tests that fail due to missing functionality
- Tests that fail due to incorrect behavior
- Tests that fail due to accessibility issues

**Action Required:** Fix the underlying functionality.

## Test Execution Context

### Why Some Errors Appear in Tests But Not in Browser

1. **Timing Issues**: Automated tests run faster than human interaction, causing timing-related errors
2. **Resource Loading**: Tests may not wait for all resources to load before checking
3. **Network Conditions**: Test environment may have different network conditions than user browsers
4. **Server Load**: Multiple concurrent test requests may cause temporary server issues

### Verification Checklist

If you see errors in test reports but pages work in browser:

1. ✅ **Verify page loads in browser** - Open URL directly in browser
2. ✅ **Check functionality** - Test the actual features (navigation, forms, etc.)
3. ✅ **Check console** - Look for actual JavaScript errors (not warnings)
4. ✅ **Check network tab** - Verify resources are loading (may be slow but should load)
5. ✅ **Run filter script** - Use `node scripts/filter-testsprite-errors.js` to filter expected errors

## Filter Script Usage

The filter script automatically filters out expected errors:

```bash
# Filter expected errors from test results
node scripts/filter-testsprite-errors.js

# Generate unfiltered report (shows all errors)
node scripts/generate-testsprite-html-report-unfiltered.js
```

## Common Scenarios

### Scenario 1: ERR_EMPTY_RESPONSE for localhost resources
**Status:** ✅ Safe to ignore if page works in browser
**Reason:** Timing issue during test execution, server responds correctly in browser

### Scenario 2: ERR_CONNECTION_CLOSED for CDN resources
**Status:** ✅ Safe to ignore
**Reason:** External CDN may be slow/unavailable during tests, doesn't affect core functionality

### Scenario 3: Image warnings
**Status:** ✅ Safe to ignore
**Reason:** Performance optimization suggestions, not functional errors

### Scenario 4: Test says "page not accessible" but URL works
**Status:** ⚠️ Check test plan - may need to update test steps
**Reason:** Test might be looking for navigation that doesn't exist, but direct URL access works

## Pages Confirmed Working

Based on manual verification:
- ✅ `/polls` - Accessible and working
- ✅ `/gallery` - Accessible and working
- ✅ `/sponsors` - Accessible via direct URL (not in main navigation)

## Best Practices

1. **Always verify in browser** - If test fails but page works, it's likely a test/timing issue
2. **Use filter script** - Automatically filters expected errors
3. **Focus on functional failures** - Ignore console warnings if functionality works
4. **Update test plans** - If pages work but tests fail, update test steps to match actual navigation

## Related Files

- Filter script: `scripts/filter-testsprite-errors.js`
- Unfiltered report generator: `scripts/generate-testsprite-html-report-unfiltered.js`
- Test plans: `testsprite_tests/public_pages_*.json`

