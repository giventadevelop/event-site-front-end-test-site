# CORS Fixes - Testing Guide

## What Was Fixed

### Fix #1: Proxy Handler CORS Headers ✅
**File**: `src/lib/proxyHandler.ts`

**Changes**:
- Added CORS headers at the start of handler (before any processing)
- Added OPTIONS preflight request handling
- Headers applied to ALL proxy routes automatically

**Code**:
```typescript
// Set CORS headers IMMEDIATELY
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Max-Age', '86400');

// Handle OPTIONS preflight
if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```

### Fix #2: Client Log Endpoint CORS ✅
**File**: `src/app/api/logs/client/route.ts`

**Changes**:
- Added CORS headers to all responses
- Added OPTIONS handler for preflight requests
- Ensures mobile client logs can reach CloudWatch

**Code**:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  // ... handler code ...
  return NextResponse.json({ success: true }, { headers: corsHeaders });
}
```

### Fix #3: Global CORS Configuration ✅
**File**: `next.config.mjs`

**Changes**:
- Added global CORS headers for all `/api/*` routes
- Provides defense-in-depth CORS coverage

**Code**:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        { key: 'Access-Control-Max-Age', value: '86400' },
      ],
    },
  ];
}
```

---

## Testing Procedure

### Step 1: Rebuild and Deploy

```bash
# Build the application (required for next.config.mjs changes)
npm run build

# Deploy to AWS Amplify
# (or push to your git branch that auto-deploys)
```

**IMPORTANT**: The `next.config.mjs` changes require a full rebuild to take effect.

### Step 2: Test from Desktop Browser First

Open DevTools Console and run:

```javascript
// Test diagnostic endpoint (should already work)
fetch('/api/diagnostic/mobile-test')
  .then(res => {
    console.log('Status:', res.status);
    console.log('CORS Headers:', {
      origin: res.headers.get('access-control-allow-origin'),
      methods: res.headers.get('access-control-allow-methods'),
    });
    return res.json();
  })
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));

// Test proxy endpoint (this should NOW work with CORS)
fetch('/api/proxy/event-details/2')
  .then(res => {
    console.log('Status:', res.status);
    console.log('CORS Headers:', {
      origin: res.headers.get('access-control-allow-origin'),
      methods: res.headers.get('access-control-allow-methods'),
    });
    return res.json();
  })
  .then(data => console.log('Event Data:', data))
  .catch(err => console.error('Error:', err));

// Test client log endpoint
fetch('/api/logs/client', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'log',
    message: 'Test from desktop',
    data: { test: true },
  }),
})
  .then(res => {
    console.log('Log Status:', res.status);
    console.log('Log CORS Headers:', {
      origin: res.headers.get('access-control-allow-origin'),
    });
    return res.json();
  })
  .then(data => console.log('Log Response:', data))
  .catch(err => console.error('Log Error:', err));
```

**Expected Results**:
- All three requests should return status 200
- All responses should have `access-control-allow-origin: *`
- No CORS errors in console

### Step 3: Test from Mobile Browser

#### Option A: Direct Mobile Browser Testing

1. Open Safari (iOS) or Chrome (Android)
2. Navigate to checkout page: `https://your-domain.com/events/2/checkout`
3. Page should load successfully
4. Event details should appear (no "Event not found" error)

#### Option B: WhatsApp In-App Browser Testing

1. Send checkout link in WhatsApp message
2. Click link (opens in WhatsApp in-app browser)
3. Page should load successfully
4. Event details should appear

#### Option C: Mobile DevTools Testing

**iOS Safari**:
1. Enable "Web Inspector" on iPhone: Settings > Safari > Advanced
2. Connect iPhone to Mac
3. Open Safari on Mac > Develop > [Your iPhone] > [Your Page]
4. Run the same fetch tests from Step 2 in the console

**Android Chrome**:
1. Enable "USB Debugging" on Android device
2. Connect to computer
3. Open Chrome on computer > `chrome://inspect`
4. Inspect your page and run fetch tests

### Step 4: Check CloudWatch Logs

After mobile browser testing, check CloudWatch for:

```bash
# Search for these patterns:

# 1. Middleware received mobile request
[MIDDLEWARE] API REQUEST DETECTED
Is Mobile: true

# 2. Proxy handler invoked
[PROXY-HANDLER-START] HANDLER INVOKED

# 3. Client logs forwarded
[CLIENT-LOG-ENDPOINT] CLIENT LOG ENDPOINT CALLED
[CheckoutPage] MODULE LOADED

# 4. OPTIONS requests handled
[PROXY-HANDLER] Handling OPTIONS preflight request
[CLIENT-LOG-ENDPOINT] Handling OPTIONS preflight request
```

**Expected**: All log patterns should appear for mobile requests.

### Step 5: Verify Checkout Flow Works

1. Mobile browser loads checkout page ✅
2. Event details display ✅
3. Ticket selection works ✅
4. Form submission works ✅
5. Payment flow works ✅

---

## Common Issues and Solutions

### Issue: "Still getting CORS errors"

**Solution**: Rebuild and redeploy. The `next.config.mjs` changes require a full rebuild.

```bash
npm run build
# Then deploy
```

### Issue: "Headers not showing in response"

**Check**:
1. Clear browser cache
2. Hard reload (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if request is being cached (disable cache in DevTools)

### Issue: "OPTIONS request returns 404"

**Solution**: Ensure you've deployed ALL three fixes:
1. Proxy handler OPTIONS handling
2. Client log endpoint OPTIONS handler
3. Global CORS configuration

### Issue: "Mobile still shows 'Event not found'"

**Debug Steps**:
1. Check if page loads at all (hero image visible?)
2. Check CloudWatch for `[MIDDLEWARE]` logs
3. Check CloudWatch for `[PROXY-HANDLER-START]` logs
4. Check CloudWatch for `[CLIENT-LOG]` logs
5. Check browser console for errors (use remote debugging)

---

## Success Criteria

✅ Desktop browser can fetch `/api/proxy/event-details/2`
✅ Mobile browser can fetch `/api/proxy/event-details/2`
✅ WhatsApp in-app browser can load checkout page
✅ CloudWatch shows mobile requests reaching handlers
✅ Client logs appear in CloudWatch from mobile browsers
✅ Checkout page displays event details on mobile
✅ No CORS errors in any browser console

---

## Technical Explanation: Why This Works

### Before Fixes:
```
Mobile Browser → GET /api/proxy/event-details/2
Next.js Proxy → Fetches from backend → Returns 200 (NO CORS headers)
Mobile Browser → REJECTS response (CORS policy violation)
CheckoutPage → Fetch fails → "Event not found"
```

### After Fixes:
```
Mobile Browser → OPTIONS /api/proxy/event-details/2 (preflight)
Next.js Proxy → Returns 200 with CORS headers ✅
Mobile Browser → GET /api/proxy/event-details/2
Next.js Proxy → Fetches from backend → Returns 200 with CORS headers ✅
Mobile Browser → ACCEPTS response ✅
CheckoutPage → Renders event data ✅
```

### Key Points:

1. **Backend CORS is not enough** - Mobile browsers request Next.js proxy, not backend
2. **Frontend must add CORS** - Next.js API routes need their own CORS headers
3. **OPTIONS handling is critical** - Mobile browsers send preflight requests
4. **Global config is defense-in-depth** - Ensures all routes have CORS coverage

---

## Next Steps After Successful Testing

1. Monitor CloudWatch logs for mobile traffic patterns
2. Verify no CORS-related errors in logs
3. Test across different mobile browsers (Safari, Chrome, Firefox, WhatsApp, Facebook)
4. Test across different mobile OS versions (iOS 15+, Android 11+)
5. Consider adding rate limiting to public API routes

---

## Related Documentation

- `MOBILE_API_ANALYSIS_AND_MISSING_FIXES.md` - Root cause analysis
- `MOBILE_API_DEBUGGING_PROMPT.md` - Original debugging process
- `LATEST_FIXES_AND_EXPECTED_LOGS.md` - Previous fixes applied

---

## Contact

If issues persist after implementing these fixes:
1. Check CloudWatch logs first
2. Verify all three fixes are deployed
3. Try clearing build cache: `rm -rf .next && npm run build`
4. Check for any custom middleware that might be stripping headers
