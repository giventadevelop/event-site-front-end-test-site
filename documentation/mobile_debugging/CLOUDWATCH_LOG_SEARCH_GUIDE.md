# CloudWatch Log Search Guide - Mobile API Failure Diagnosis

## Current Situation

**Problem**: CloudWatch shows Lambda START/REPORT entries but NO diagnostic logs, indicating requests are NOT reaching our handlers.

**Lambda Duration**: 5-20ms (too fast - suggests static file serving or early exit)

---

## What to Search For in CloudWatch

### 1. Client-Side Logs (Forwarded to Server)

**Search Term**: `[CheckoutPage]`

**Expected Logs**:
```
[CheckoutPage] [LOG] CheckoutPage useEffect started
[CheckoutPage] [LOG] Window object available
[CheckoutPage] [LOG] Testing Pages Router API route
[CheckoutPage] [LOG] Mobile browser detection
[CheckoutPage] [LOG] About to fetch event details
[CheckoutPage] [LOG] Fetch call initiated
```

**If you see these**: ✅ Client-side JavaScript IS executing

**If you DON'T see these**: ❌ Client-side JavaScript is NOT executing (check browser console, JS disabled)

---

### 2. Client Log Forwarding Endpoint

**Search Term**: `[CLIENT-LOG]`

**Expected Logs**:
```
[CLIENT-LOG] [LOG] CheckoutPage useEffect started
[CLIENT-LOG] [CRITICAL] Fetch call failed with exception
```

**If you see these**: ✅ Client logs are being forwarded to CloudWatch

**If you DON'T see these**: ❌ Client logs are NOT being forwarded (check `/api/logs/client` endpoint)

---

### 3. Middleware Logs

**Search Term**: `[MIDDLEWARE] API Proxy request detected`

**Expected Logs**:
```
[MIDDLEWARE] API Proxy request detected: {
  pathname: '/api/proxy/event-details/2',
  method: 'GET',
  isMobile: true,
  ...
}
```

**If you see these**: ✅ Requests are reaching middleware

**If you DON'T see these**: ❌ Requests are NOT reaching middleware (routing issue, static file serving)

---

### 4. Proxy Handler Logs (CRITICAL)

**Search Term**: `[PROXY-HANDLER-START]`

**Expected Logs**:
```
[PROXY-HANDLER-START] ============================================
[PROXY-HANDLER-START] HANDLER INVOKED AT: 2025-11-23T18:07:20.238Z
[PROXY-HANDLER-START] Backend Path: /api/event-details
[PROXY-HANDLER-START] Request URL: /api/proxy/event-details/2
[PROXY-HANDLER-START] Request Method: GET
[PROXY-HANDLER-START] Is Mobile: true
[PROXY-HANDLER-START] ============================================
```

**If you see these**: ✅ Requests ARE reaching proxy handlers (excellent!)

**If you DON'T see these**: ❌ Requests are NOT reaching handlers (critical routing issue)

---

### 5. Diagnostic Test Endpoint (Pages Router)

**Search Term**: `[MOBILE-DIAGNOSTIC-PAGES]`

**Expected Logs**:
```
[MOBILE-DIAGNOSTIC-PAGES] ===== MOBILE TEST ENDPOINT CALLED (PAGES ROUTER) =====
[MOBILE-DIAGNOSTIC-PAGES] Timestamp: 2025-11-23T18:07:20.238Z
[MOBILE-DIAGNOSTIC-PAGES] Is Mobile: true
[MOBILE-DIAGNOSTIC-PAGES] ===== END MOBILE TEST (PAGES ROUTER) =====
```

**If you see these**: ✅ Mobile CAN reach Pages Router API routes

**If you DON'T see these**: ❌ Mobile CANNOT reach Pages Router API routes (routing issue)

---

## Diagnosis Flow Chart

```
1. Search for [CheckoutPage]
   ├─ ✅ Found → Client JS executing
   │  └─ Continue to step 2
   └─ ❌ Not Found → Client JS NOT executing
      └─ Check browser console, verify JS enabled

2. Search for [CLIENT-LOG]
   ├─ ✅ Found → Log forwarding working
   │  └─ Continue to step 3
   └─ ❌ Not Found → Log forwarding NOT working
      └─ Check /api/logs/client endpoint

3. Search for [MIDDLEWARE] API Proxy request detected
   ├─ ✅ Found → Requests reaching middleware
   │  └─ Continue to step 4
   └─ ❌ Not Found → Requests NOT reaching middleware
      └─ Check routing, static file serving

4. Search for [PROXY-HANDLER-START]
   ├─ ✅ Found → Requests reaching handlers ✅
   │  └─ Problem is INSIDE handler (check further logs)
   └─ ❌ Not Found → Requests NOT reaching handlers ❌
      └─ CRITICAL: Routing issue, check route matching

5. Search for [MOBILE-DIAGNOSTIC-PAGES]
   ├─ ✅ Found → Pages Router routes accessible ✅
   └─ ❌ Not Found → Pages Router routes NOT accessible ❌
      └─ Check route file exists, Next.js routing config
```

---

## CloudWatch Log Insights Queries

### Query 1: Find All Diagnostic Logs
```sql
fields @timestamp, @message
| filter @message like /\[CheckoutPage\]/
   or @message like /\[CLIENT-LOG\]/
   or @message like /\[MIDDLEWARE\]/
   or @message like /\[PROXY-HANDLER-START\]/
   or @message like /\[MOBILE-DIAGNOSTIC-PAGES\]/
| sort @timestamp desc
| limit 100
```

### Query 2: Find Mobile-Specific Logs
```sql
fields @timestamp, @message
| filter @message like /mobile/i or @message like /Mobile/
| sort @timestamp desc
| limit 100
```

### Query 3: Find Proxy Handler Invocations
```sql
fields @timestamp, @message
| filter @message like /\[PROXY-HANDLER-START\]/
| sort @timestamp desc
| limit 50
```

### Query 4: Find Client-Side Errors
```sql
fields @timestamp, @message
| filter @message like /\[CheckoutPage\].*\[CRITICAL\]/
   or @message like /\[CLIENT-LOG\].*\[CRITICAL\]/
| sort @timestamp desc
| limit 50
```

---

## What the Current Logs Tell Us

**Current CloudWatch Logs Show**:
- ✅ Lambda functions ARE being invoked (START/REPORT entries)
- ❌ NO `[PROXY-HANDLER-START]` logs
- ❌ NO `[MIDDLEWARE]` logs
- ❌ NO `[CheckoutPage]` logs
- ❌ NO `[CLIENT-LOG]` logs
- ❌ NO `[MOBILE-DIAGNOSTIC-PAGES]` logs

**Conclusion**: Requests are hitting Lambda but NOT reaching our handlers.

**Possible Causes**:
1. **Static File Serving**: Requests being served as static files (5-7ms duration suggests this)
2. **Route Pattern Mismatch**: Requests not matching API route patterns
3. **CDN/Cache**: Requests being served from CloudFront/CDN cache
4. **Next.js Routing**: Next.js not routing to API handlers correctly

---

## Next Steps After Deployment

1. **Deploy the updated code** (with enhanced logging)
2. **Access checkout page from mobile**: `https://www.mosc-temp.com/events/2/checkout`
3. **Wait 30 seconds** for logs to appear in CloudWatch
4. **Search CloudWatch** using the queries above
5. **Report which logs appear** and which don't

---

## Expected Log Sequence (If Working)

```
[CheckoutPage] [LOG] CheckoutPage useEffect started
[CLIENT-LOG] [LOG] CheckoutPage useEffect started
[CheckoutPage] [LOG] Testing Pages Router API route
[MOBILE-DIAGNOSTIC-PAGES] ===== MOBILE TEST ENDPOINT CALLED =====
[MIDDLEWARE] API Proxy request detected: { pathname: '/api/proxy/event-details/2', ... }
[PROXY-HANDLER-START] ===== HANDLER INVOKED =====
[ProxyHandler] Method: GET
[ProxyHandler] Forwarding to backend URL: ...
```

---

## If Still No Logs Appear

**Possible Issues**:
1. **Code not deployed**: Verify latest code is deployed to Amplify
2. **Log group wrong**: Verify you're looking at the correct CloudWatch log group
3. **Log delay**: CloudWatch logs can take 30-60 seconds to appear
4. **Filter wrong**: Verify log filters/search terms are correct
5. **Static file serving**: Requests might be served from CDN/cache before reaching Lambda

**Debug Steps**:
1. Manually call diagnostic endpoint: `https://www.mosc-temp.com/api/diagnostic/mobile-test`
2. Check CloudWatch for `[MOBILE-DIAGNOSTIC-PAGES]` logs
3. If still no logs, check Amplify build logs to verify code was deployed
4. Check Next.js routing configuration

---

## Summary

The enhanced logging will show exactly where requests are failing:

- **No `[CheckoutPage]` logs** → Client JS not executing
- **No `[MIDDLEWARE]` logs** → Requests not reaching middleware
- **No `[PROXY-HANDLER-START]` logs** → Requests not reaching handlers (CRITICAL)
- **No `[MOBILE-DIAGNOSTIC-PAGES]` logs** → Pages Router routes not accessible

Once you identify which logs are missing, we can pinpoint the exact failure point and fix it.









