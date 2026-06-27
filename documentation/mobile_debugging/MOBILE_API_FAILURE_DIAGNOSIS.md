# Mobile API Failure Diagnosis Guide

## Problem Summary

**Symptom**: Mobile browsers show "Event not found" error, but CloudWatch logs show:
- ✅ Lambda functions are invoked (START/REPORT entries)
- ❌ NO proxy handler logs (`[ProxyHandler]` messages)
- ❌ Requests complete in 5-7ms (too fast for actual processing)

**Desktop**: Works fine - shows full proxy handler logs in CloudWatch.

**Root Cause Hypothesis**: Client-side JavaScript fetch calls are NOT reaching the API route handlers on mobile.

---

## Enhanced Logging Added

### 1. Client-Side Logging (Forwards to CloudWatch)

**Location**: `src/app/events/[id]/checkout/page.tsx`

**What to Look For in CloudWatch**:
```
[CheckoutPage] [LOG] CheckoutPage useEffect started
[CheckoutPage] [LOG] Mobile browser detection
[CheckoutPage] [LOG] About to fetch event details
[CheckoutPage] [LOG] Fetch call initiated
[CheckoutPage] [CRITICAL] Fetch call failed with exception  <-- If fetch fails
```

**If you see these logs**: Client-side JavaScript IS executing, but fetch is failing.

**If you DON'T see these logs**: Client-side JavaScript is NOT executing (page not loading, JS disabled, etc.)

### 2. Middleware Logging

**Location**: `src/middleware.ts`

**What to Look For in CloudWatch**:
```
[MIDDLEWARE] API Proxy request detected: {
  pathname: '/api/proxy/event-details/2',
  method: 'GET',
  isMobile: true,
  ...
}
```

**If you see this log**: Request reached middleware (good sign).

**If you DON'T see this log**: Request is being blocked before middleware OR not matching route pattern.

### 3. Proxy Handler Logging

**Location**: `src/lib/proxyHandler.ts`

**What to Look For in CloudWatch**:
```
[ProxyHandler] ===== HANDLER INVOKED =====
[ProxyHandler] Timestamp: 2025-11-23T...
[ProxyHandler] Backend Path: /api/event-details
[ProxyHandler] Request URL: /api/proxy/event-details/2
[ProxyHandler] Is Mobile: true
[ProxyHandler] ===== END HANDLER INVOKE LOG =====
```

**If you see this log**: Request reached the proxy handler (excellent!).

**If you DON'T see this log**: Request is NOT reaching the handler (routing issue).

### 4. Diagnostic Test Endpoint

**Location**: `src/app/api/diagnostic/mobile-test/route.ts`

**What to Look For in CloudWatch**:
```
[MOBILE-DIAGNOSTIC] ===== MOBILE TEST ENDPOINT CALLED =====
[MOBILE-DIAGNOSTIC] Is Mobile: true
[MOBILE-DIAGNOSTIC] ===== END MOBILE TEST =====
```

**If you see this log**: Mobile CAN reach API routes (routing works).

**If you DON'T see this log**: Mobile CANNOT reach API routes (routing/middleware issue).

---

## Diagnostic Steps

### Step 1: Check Client-Side Logs

**In CloudWatch**, search for:
```
[CheckoutPage]
```

**Expected Results**:
- ✅ If logs appear: Client-side JS is executing
- ❌ If no logs: Client-side JS is NOT executing (check browser console, JS disabled, etc.)

### Step 2: Check Middleware Logs

**In CloudWatch**, search for:
```
[MIDDLEWARE] API Proxy request detected
```

**Expected Results**:
- ✅ If logs appear: Requests are reaching middleware
- ❌ If no logs: Requests are NOT reaching middleware (routing issue, static file serving, etc.)

### Step 3: Check Proxy Handler Logs

**In CloudWatch**, search for:
```
[ProxyHandler] ===== HANDLER INVOKED =====
```

**Expected Results**:
- ✅ If logs appear: Requests are reaching proxy handler
- ❌ If no logs: Requests are NOT reaching handler (middleware blocking, route mismatch, etc.)

### Step 4: Test Diagnostic Endpoint

**From Mobile Browser**, manually call:
```
https://www.mosc-temp.com/api/diagnostic/mobile-test
```

**In CloudWatch**, search for:
```
[MOBILE-DIAGNOSTIC]
```

**Expected Results**:
- ✅ If logs appear: Mobile CAN reach API routes
- ❌ If no logs: Mobile CANNOT reach API routes (critical routing issue)

---

## Possible Root Causes

### 1. Client-Side JavaScript Not Executing

**Symptoms**:
- No `[CheckoutPage]` logs in CloudWatch
- Page shows "Event not found" immediately
- No network requests in mobile browser DevTools

**Possible Causes**:
- JavaScript disabled on mobile browser
- Content Security Policy blocking scripts
- Network error preventing JS from loading
- Page rendering error before JS executes

**Solution**: Check mobile browser console, verify JS is enabled, check CSP headers.

### 2. Fetch Requests Failing Before Reaching Server

**Symptoms**:
- `[CheckoutPage]` logs appear (JS executing)
- `[CheckoutPage] [CRITICAL] Fetch call failed with exception` logs appear
- NO middleware or proxy handler logs

**Possible Causes**:
- CORS issue blocking requests
- Network connectivity problem
- Fetch API not supported
- Request being blocked by browser security

**Solution**: Check error details in `[CRITICAL]` logs, verify CORS headers, check network tab.

### 3. Middleware Blocking Requests

**Symptoms**:
- `[CheckoutPage]` logs appear
- NO `[MIDDLEWARE]` logs
- Lambda START/REPORT entries exist (5-7ms duration)

**Possible Causes**:
- Middleware matcher not matching mobile requests
- Middleware returning early response
- Route pattern mismatch

**Solution**: Check middleware matcher pattern, verify route is in `publicRoutes`, check middleware logs.

### 4. Route Not Matching

**Symptoms**:
- `[MIDDLEWARE]` logs appear
- NO `[ProxyHandler]` logs
- Lambda START/REPORT entries exist (5-7ms duration)

**Possible Causes**:
- API route file not matching request path
- Next.js routing issue
- File system case sensitivity
- Route handler not exported correctly

**Solution**: Verify route file exists at correct path, check Next.js routing, verify handler export.

### 5. Static File Serving Intercepting Requests

**Symptoms**:
- Lambda START/REPORT entries exist (5-7ms duration)
- NO handler logs at all
- Requests completing too quickly

**Possible Causes**:
- Next.js serving static files instead of API routes
- Amplify configuration serving static files
- Route pattern matching static files

**Solution**: Check Next.js config, verify API routes are not being served as static files.

---

## Next Steps After Deployment

1. **Deploy these changes** to Amplify
2. **Access checkout page from mobile**: `https://www.mosc-temp.com/events/2/checkout`
3. **Check CloudWatch logs** for the new log entries
4. **Identify which logs appear** and which don't
5. **Use the diagnostic steps above** to narrow down the root cause

---

## Expected CloudWatch Log Flow (Working)

```
[CheckoutPage] [LOG] CheckoutPage useEffect started
[CheckoutPage] [LOG] Mobile browser detection
[CheckoutPage] [LOG] About to fetch event details
[CheckoutPage] [LOG] Fetch call initiated
[MIDDLEWARE] API Proxy request detected: { pathname: '/api/proxy/event-details/2', ... }
[ProxyHandler] ===== HANDLER INVOKED =====
[ProxyHandler] Method: GET
[ProxyHandler] Forwarding to backend URL: ...
[fetchWithJwtRetry] Called with URL: ...
[CheckoutPage] [LOG] Fetch response received
```

---

## Expected CloudWatch Log Flow (Failing - Client-Side)

```
[CheckoutPage] [LOG] CheckoutPage useEffect started
[CheckoutPage] [LOG] Mobile browser detection
[CheckoutPage] [LOG] About to fetch event details
[CheckoutPage] [LOG] Fetch call initiated
[CheckoutPage] [CRITICAL] Fetch call failed with exception: { error: 'NetworkError', ... }
```

**Diagnosis**: Fetch is failing before reaching server (CORS, network, etc.)

---

## Expected CloudWatch Log Flow (Failing - Routing)

```
[CheckoutPage] [LOG] CheckoutPage useEffect started
[CheckoutPage] [LOG] Mobile browser detection
[CheckoutPage] [LOG] About to fetch event details
[CheckoutPage] [LOG] Fetch call initiated
```

**NO middleware or proxy handler logs**

**Diagnosis**: Request not reaching server-side handlers (routing issue)

---

## Files Modified

1. `src/app/events/[id]/checkout/page.tsx` - Enhanced client-side logging
2. `src/lib/clientLogger.ts` - Always forwards logs in production
3. `src/middleware.ts` - Added API proxy request logging
4. `src/lib/proxyHandler.ts` - Added immediate handler invocation logging
5. `src/app/api/diagnostic/mobile-test/route.ts` - New diagnostic endpoint
6. `src/app/api/logs/client/route.ts` - Client log forwarding endpoint (already exists)

---

## Quick Test Commands

### Test Diagnostic Endpoint (from mobile browser)
```
https://www.mosc-temp.com/api/diagnostic/mobile-test
```

### Test Client Log Forwarding (from mobile browser console)
```javascript
fetch('/api/logs/client', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'log',
    message: 'Test log from mobile',
    component: 'Test',
  }),
});
```

Then check CloudWatch for `[CLIENT-LOG]` entries.

---

## Summary

The enhanced logging will help identify exactly where the mobile requests are failing:

1. **Client-side execution**: Check `[CheckoutPage]` logs
2. **Middleware routing**: Check `[MIDDLEWARE]` logs
3. **API handler routing**: Check `[ProxyHandler]` logs
4. **General API routing**: Check `[MOBILE-DIAGNOSTIC]` logs

Once deployed, check CloudWatch logs to see which logs appear and which don't - this will pinpoint the exact failure point.









