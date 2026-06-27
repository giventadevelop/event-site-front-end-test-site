# Mobile Browser API Call Failure - Debugging Prompt

## Context and Problem Statement

### Initial Symptoms
- **Mobile browsers** (WhatsApp, Safari iOS, Chrome Android) cannot load checkout page data
- Page loads successfully but shows "Event not found" error
- **No backend logs** appear when mobile browsers access the page
- Desktop browsers work perfectly - same URL, same backend, same code
- URL sometimes gets `?__clerk_synced=true` appended (Clerk authentication sync)
- CloudWatch logs show Lambda invocations (5-84ms duration) but **NO console.log output**

### Root Cause Hypothesis
The issue appeared to be a **complete failure of API requests from mobile browsers**, with requests either:
1. Not reaching the server-side handlers
2. Being blocked by middleware/authentication
3. Failing silently before reaching API routes
4. Being served as static files instead of API routes

---

## Investigation Approach

### Phase 1: Add Comprehensive Logging

**Goal**: Add logging at every stage of the request flow to identify where requests fail.

**Key Insight**: If we can't see logs, we can't diagnose the problem. We need visibility at:
- Client-side (JavaScript execution)
- Middleware (request interception)
- API handlers (request processing)
- Proxy handlers (backend forwarding)

### Phase 2: Fix Route Configuration

**Goal**: Ensure diagnostic and logging endpoints are accessible from mobile browsers.

**Key Insight**: Clerk middleware was blocking diagnostic endpoints because they weren't in `publicRoutes`.

### Phase 3: Fix Client-Side Log Forwarding

**Goal**: Ensure client-side logs reach CloudWatch for mobile debugging.

**Key Insight**: Client logger had bugs preventing log forwarding, and production detection was incorrect.

---

## Fixes Applied

### Fix 1: Added Diagnostic Routes to Public Routes ✅

**Problem**: `/api/diagnostic/mobile-test` endpoint was blocked by Clerk middleware.

**Solution**: Added to `publicRoutes` in `src/middleware.ts`:
```typescript
publicRoutes: [
  // ... existing routes ...
  '/api/diagnostic(.*)',  // Diagnostic endpoints for debugging
  '/api/logs(.*)',  // Client log forwarding endpoint
]
```

**Why This Matters**: Mobile browsers need unauthenticated access to diagnostic endpoints to verify API route accessibility.

### Fix 2: Enhanced Middleware Logging ✅

**Problem**: No visibility into which requests reach middleware.

**Solution**: Added comprehensive logging for ALL API requests in `src/middleware.ts`:
```typescript
afterAuth(auth, req) {
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    console.log('[MIDDLEWARE] ===== API REQUEST DETECTED =====');
    console.log('[MIDDLEWARE] Pathname:', pathname);
    console.log('[MIDDLEWARE] Method:', req.method);
    console.log('[MIDDLEWARE] Is Mobile:', isMobile);
    console.log('[MIDDLEWARE] User-Agent:', userAgent.substring(0, 150));
    console.log('[MIDDLEWARE] Timestamp:', new Date().toISOString());
  }
}
```

**Why This Matters**: Middleware is the first server-side code that executes. If we don't see middleware logs, requests aren't reaching the server.

### Fix 3: Enhanced Diagnostic Endpoint Logging ✅

**Problem**: No way to verify diagnostic endpoint is being called.

**Solution**: Added immediate logging at handler start in `src/pages/api/diagnostic/mobile-test.ts`:
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CRITICAL: Log IMMEDIATELY at the very start
  console.log('[MOBILE-DIAGNOSTIC-PAGES] ===== HANDLER FUNCTION CALLED =====');
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Handler invoked at:', new Date().toISOString());
  // ... rest of handler
}
```

**Why This Matters**: If handler logs don't appear, the handler isn't being called (routing issue).

### Fix 4: Fixed Client Logger ✅

**Problem**: Client-side logs weren't reaching CloudWatch, making mobile debugging impossible.

**Solution**: Fixed `src/lib/clientLogger.ts`:
- Fixed production detection (check `window.location.hostname`, not `process.env.NODE_ENV`)
- Fixed critical/error log forwarding (was commented out)
- Added logging when attempting to forward logs
- Added error logging even in production

**Before**:
```typescript
// Bug: Critical logs weren't being forced to forward
if (logData.level === 'critical' || logData.level === 'error') {
  // Force forward critical errors regardless of environment check
  // But nothing actually happened here!
}
```

**After**:
```typescript
const forceForward = logData.level === 'critical' || logData.level === 'error';

if (!shouldForward && !forceForward) {
  return; // Only skip if not production AND not critical/error
}

// Log that we're attempting to forward
if (isProduction || forceForward) {
  console.log('[ClientLogger] Attempting to forward log:', {
    level: logData.level,
    message: logData.message.substring(0, 100),
  });
}
```

**Why This Matters**: Without client-side logs in CloudWatch, we can't see what's happening in mobile browsers.

### Fix 5: Added Module-Level Logging ✅

**Problem**: No way to verify JavaScript loads and React renders on mobile.

**Solution**: Added logging at module load and component render in `src/app/events/[id]/checkout/page.tsx`:
```typescript
// At module level (runs when JS file loads)
if (typeof window !== 'undefined') {
  console.log('[CheckoutPage] ===== MODULE LOADED =====');
  logger.log('CheckoutPage module loaded', {
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
}

export default function CheckoutPage() {
  // At component level (runs when React renders)
  if (typeof window !== 'undefined') {
    console.log('[CheckoutPage] ===== COMPONENT RENDERING =====');
    logger.log('CheckoutPage component rendering');
  }
  // ... rest of component
}
```

**Why This Matters**: If module logs don't appear, JavaScript isn't loading (network/CDN issue). If component logs don't appear, React isn't rendering (JS error).

---

## Expected Log Flow (If Working)

### Successful Request Flow:
```
1. [CheckoutPage] ===== MODULE LOADED =====
   → JavaScript file loaded successfully

2. [CLIENT-LOG] [CheckoutPage] [LOG] CheckoutPage module loaded
   → Client logger forwarding works

3. [MIDDLEWARE] ===== API REQUEST DETECTED =====
   [MIDDLEWARE] Pathname: /api/logs/client
   → Request reaches middleware

4. [CLIENT-LOG-ENDPOINT] ===== CLIENT LOG ENDPOINT CALLED =====
   → Client log endpoint handler invoked

5. [CheckoutPage] ===== COMPONENT RENDERING =====
   → React component rendering

6. [CLIENT-LOG] [CheckoutPage] [LOG] Testing Pages Router API route
   → useEffect executing, attempting API call

7. [MIDDLEWARE] ===== API REQUEST DETECTED =====
   [MIDDLEWARE] Pathname: /api/diagnostic/mobile-test
   → Diagnostic API request reaches middleware

8. [MOBILE-DIAGNOSTIC-PAGES] ===== HANDLER FUNCTION CALLED =====
   → Diagnostic handler invoked

9. [MIDDLEWARE] ===== API REQUEST DETECTED =====
   [MIDDLEWARE] Pathname: /api/proxy/event-details/2
   → Proxy API request reaches middleware

10. [PROXY-HANDLER-START] ===== HANDLER INVOKED =====
    → Proxy handler invoked, forwards to backend
```

### Failed Request Flow (JavaScript Not Loading):
```
(No logs at all)
Only Lambda START/REPORT logs with 5-7ms duration
→ Static file requests, not API routes
```

### Failed Request Flow (Middleware Blocking):
```
[CheckoutPage] ===== MODULE LOADED =====
[CheckoutPage] ===== COMPONENT RENDERING =====
[CLIENT-LOG] [CheckoutPage] [LOG] Testing Pages Router API route
(No [MIDDLEWARE] logs)
(No handler logs)
→ Requests not reaching middleware (routing/CDN issue)
```

### Failed Request Flow (Handler Not Called):
```
[MIDDLEWARE] ===== API REQUEST DETECTED =====
[MIDDLEWARE] Pathname: /api/diagnostic/mobile-test
(No [MOBILE-DIAGNOSTIC-PAGES] HANDLER FUNCTION CALLED logs)
→ Middleware allows request but handler not invoked (Next.js routing issue)
```

---

## CloudWatch Search Strategy

### Step 1: Verify JavaScript Loads
**Search**: `[CheckoutPage] MODULE LOADED`

**Expected**: Should see logs immediately when page loads

**If Missing**: JavaScript file not loading (network/CDN/CSP issue)

### Step 2: Verify Middleware Receives Requests
**Search**: `[MIDDLEWARE] API REQUEST DETECTED`

**Expected**: Should see logs for ALL API requests (`/api/diagnostic`, `/api/proxy`, `/api/logs`)

**If Missing**: Requests not reaching middleware (routing/CDN/static file serving issue)

### Step 3: Verify Diagnostic Endpoint Called
**Search**: `[MOBILE-DIAGNOSTIC-PAGES] HANDLER FUNCTION CALLED`

**Expected**: Should see logs when diagnostic endpoint is accessed

**If Missing**: Handler not being called (Next.js routing issue)

### Step 4: Verify Client Logs Forwarded
**Search**: `[CLIENT-LOG-ENDPOINT] CLIENT LOG ENDPOINT CALLED`

**Expected**: Should see logs when client-side code forwards logs to server

**If Missing**: Client logger not working or requests blocked

### Step 5: Verify Proxy Handler Called
**Search**: `[PROXY-HANDLER-START] HANDLER INVOKED`

**Expected**: Should see logs when proxy routes are accessed

**If Missing**: Proxy handler not being called (routing issue)

---

## Key Insights and Lessons Learned

### 1. **Logging is Critical for Mobile Debugging**
- Mobile browsers don't have accessible DevTools
- Client-side logs must be forwarded to CloudWatch
- Server-side logs must be comprehensive and immediate

### 2. **Middleware is the Entry Point**
- Middleware executes before API handlers
- If middleware doesn't log, requests aren't reaching the server
- Middleware logging reveals routing issues immediately

### 3. **Route Configuration Matters**
- Clerk middleware blocks routes not in `publicRoutes`
- Diagnostic endpoints must be public for debugging
- Client log forwarding endpoints must be public

### 4. **Production Detection is Tricky**
- `process.env.NODE_ENV` doesn't work in browser
- Must check `window.location.hostname` for production detection
- Client-side code runs in browser, not Node.js

### 5. **Lambda Invocations ≠ Handler Execution**
- Lambda can be invoked for static files (5-7ms duration)
- API handlers take longer (50-300ms typical)
- No console.log output = handler not executing

### 6. **Mobile Detection Requires Multiple Methods**
- User-Agent string detection (WhatsApp, Mobile, etc.)
- CloudFront headers (`cloudfront-is-mobile-viewer`)
- Screen width detection (client-side only)
- All methods needed for comprehensive detection

---

## Debugging Checklist

When investigating mobile API call failures:

- [ ] **Verify JavaScript loads**: Check for `[CheckoutPage] MODULE LOADED` logs
- [ ] **Verify React renders**: Check for `[CheckoutPage] COMPONENT RENDERING` logs
- [ ] **Verify middleware receives requests**: Check for `[MIDDLEWARE] API REQUEST DETECTED` logs
- [ ] **Verify handlers are called**: Check for handler-specific logs (`[MOBILE-DIAGNOSTIC-PAGES]`, `[PROXY-HANDLER-START]`)
- [ ] **Verify client logs forwarded**: Check for `[CLIENT-LOG-ENDPOINT] CLIENT LOG ENDPOINT CALLED` logs
- [ ] **Check route configuration**: Verify routes are in `publicRoutes` if needed
- [ ] **Check mobile detection**: Verify `isMobile: true` in logs for mobile browsers
- [ ] **Check Lambda duration**: API handlers should take 50-300ms, not 5-7ms
- [ ] **Check for errors**: Look for `[CRITICAL]` or `[ERROR]` logs
- [ ] **Compare desktop vs mobile**: Same code should produce similar logs

---

## Future Improvements

### 1. **Automated Log Analysis**
- Create script to analyze CloudWatch logs automatically
- Identify missing log patterns
- Generate diagnostic reports

### 2. **Enhanced Error Handling**
- Catch and log all fetch errors
- Include error details in client logs
- Forward network errors to CloudWatch

### 3. **Performance Monitoring**
- Track API call durations
- Identify slow endpoints
- Monitor mobile vs desktop performance differences

### 4. **Mobile-Specific Testing**
- Automated mobile browser testing
- Test on real devices (not just emulators)
- Monitor mobile-specific issues

---

## Related Documentation

- `LATEST_FIXES_AND_EXPECTED_LOGS.md` - Detailed fix documentation
- `CLOUDWATCH_LOG_SEARCH_GUIDE.md` - How to search CloudWatch logs
- `MOBILE_API_FAILURE_DIAGNOSIS.md` - Original diagnosis document

---

## Summary

This debugging session revealed that mobile API call failures were caused by:
1. **Missing route configuration** (diagnostic endpoints blocked)
2. **Insufficient logging** (no visibility into request flow)
3. **Client logger bugs** (logs not reaching CloudWatch)
4. **Missing entry-point logging** (no way to verify JavaScript loads)

The fixes add comprehensive logging at every stage of the request flow, enabling precise diagnosis of where requests fail. After deployment, CloudWatch logs will show exactly where mobile requests are failing, making it possible to fix the root cause.

**Key Takeaway**: When debugging mobile issues, you need logging at every stage - client-side, middleware, and handlers. Without comprehensive logging, mobile debugging is impossible.








