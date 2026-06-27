# Server-Side Mobile Detection Logging - CloudWatch Visibility

## Problem

The `[MOBILE-DETECTION]` logs we added to `SuccessClient.tsx` and `PaymentSuccessClient.tsx` are **client-side** (browser console) and **do not appear in CloudWatch logs**.

Production logs only show server-side API calls (proxy handler), making it impossible to debug mobile detection issues in production.

## Solution: Server-Side Mobile Detection Logging

Added server-side mobile detection logging to `/api/event/success/process` route (both GET and POST methods) so we can track mobile detection in CloudWatch.

### Implementation

**File**: `src/app/api/event/success/process/route.ts`

**Added to GET method** (Lines 486-520):
```typescript
// CRITICAL: Server-side mobile detection for CloudWatch logging
const userAgent = req.headers.get('user-agent') || 'unknown';
const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

// Enhanced mobile detection (same logic as client-side)
const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');
console.log('[MOBILE-DETECTION] [SERVER-SIDE] API GET /api/event/success/process');
console.log('[MOBILE-DETECTION] [SERVER-SIDE] User-Agent:', userAgent.substring(0, 150));
console.log('[MOBILE-DETECTION] [SERVER-SIDE] CloudFront Headers:', {
  cloudfrontMobile,
  cloudfrontAndroid,
  cloudfrontIOS,
});
console.log('[MOBILE-DETECTION] [SERVER-SIDE] Detection Methods:', {
  mobileRegexMatch,
  platformMatch,
  cloudfrontMobile,
  cloudfrontAndroid,
  cloudfrontIOS,
});
console.log('[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT:', {
  isMobile,
  session_id,
  pi,
  url: req.url,
  timestamp: new Date().toISOString(),
});
```

**Added to POST method** (Lines 86-120):
```typescript
// Same mobile detection logic as GET method
// Logs with [MOBILE-DETECTION] [SERVER-SIDE] prefix
```

## What You'll See in CloudWatch

### Mobile Browser Request

```
[MOBILE-DETECTION] [SERVER-SIDE] ============================================
[MOBILE-DETECTION] [SERVER-SIDE] API GET /api/event/success/process
[MOBILE-DETECTION] [SERVER-SIDE] User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15
[MOBILE-DETECTION] [SERVER-SIDE] CloudFront Headers: { cloudfrontMobile: true, cloudfrontAndroid: false, cloudfrontIOS: true }
[MOBILE-DETECTION] [SERVER-SIDE] Detection Methods: {
  mobileRegexMatch: true,
  platformMatch: true,
  cloudfrontMobile: true,
  cloudfrontAndroid: false,
  cloudfrontIOS: true
}
[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT: {
  isMobile: true,
  session_id: null,
  pi: 'pi_3SZa1iK5BrggeAHM1GsthpzO',
  url: '/api/event/success/process?pi=pi_3SZa1iK5BrggeAHM1GsthpzO&skip_qr=true',
  timestamp: '2025-12-01T16:33:13.000Z'
}
```

### Desktop Browser Request

```
[MOBILE-DETECTION] [SERVER-SIDE] ============================================
[MOBILE-DETECTION] [SERVER-SIDE] API GET /api/event/success/process
[MOBILE-DETECTION] [SERVER-SIDE] User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
[MOBILE-DETECTION] [SERVER-SIDE] CloudFront Headers: { cloudfrontMobile: false, cloudfrontAndroid: false, cloudfrontIOS: false }
[MOBILE-DETECTION] [SERVER-SIDE] Detection Methods: {
  mobileRegexMatch: false,
  platformMatch: false,
  cloudfrontMobile: false,
  cloudfrontAndroid: false,
  cloudfrontIOS: false
}
[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT: {
  isMobile: false,
  session_id: null,
  pi: 'pi_3SZa1iK5BrggeAHM1GsthpzO',
  url: '/api/event/success/process?pi=pi_3SZa1iK5BrggeAHM1GsthpzO',
  timestamp: '2025-12-01T16:33:13.000Z'
}
```

### Server-Side API Call (from Next.js server actions)

```
[MOBILE-DETECTION] [SERVER-SIDE] User-Agent: node
[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT: { isMobile: false, ... }
```

**Note**: Server-side calls from Next.js server actions will show `userAgent: "node"` and `isMobile: false`. This is expected - these are internal API calls, not browser requests.

## Why This Matters

1. **CloudWatch Visibility**: Server-side logs appear in CloudWatch, making production debugging possible
2. **User-Agent Tracking**: See actual user-agent strings from mobile browsers
3. **CloudFront Headers**: AWS CloudFront adds mobile detection headers that are more reliable than user-agent parsing
4. **Detection Method Analysis**: See which detection method(s) are matching/failing

## Client-Side vs Server-Side Logs

### Client-Side Logs (Browser Console)
- Prefix: `[MOBILE-DETECTION]` (without `[SERVER-SIDE]`)
- Location: Browser DevTools Console
- Visibility: Only visible to user/developer with browser open
- Examples:
  - `[MOBILE-DETECTION] SuccessClient component mounted`
  - `[MOBILE-DETECTION] ✅✅✅ MOBILE BROWSER DETECTED`
  - `[MOBILE-DETECTION] ✅ Redirecting with payment_intent`

### Server-Side Logs (CloudWatch)
- Prefix: `[MOBILE-DETECTION] [SERVER-SIDE]`
- Location: CloudWatch Logs
- Visibility: Available in production logs
- Examples:
  - `[MOBILE-DETECTION] [SERVER-SIDE] API GET /api/event/success/process`
  - `[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT: { isMobile: true }`

## Debugging Workflow

1. **Check CloudWatch** for `[MOBILE-DETECTION] [SERVER-SIDE]` logs
2. **Verify User-Agent** - Is it a mobile browser user-agent?
3. **Check CloudFront Headers** - Are mobile headers present?
4. **Verify Detection Methods** - Which method(s) matched?
5. **Check Client-Side Logs** - If possible, check browser console for `[MOBILE-DETECTION]` logs

## Expected Behavior

### Mobile Flow
1. Mobile browser → `/event/success?pi=pi_xxx`
2. **Client-side**: `SuccessClient` detects mobile → Logs `[MOBILE-DETECTION] ✅✅✅ MOBILE DETECTED`
3. **Client-side**: Redirects to `/event/ticket-qr?pi=pi_xxx`
4. **Server-side**: `/api/event/success/process` GET → Logs `[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT: { isMobile: true }`
5. **Server-side**: `/api/event/success/process` POST → Logs `[MOBILE-WORKFLOW]` logs

### Desktop Flow
1. Desktop browser → `/event/success?pi=pi_xxx`
2. **Client-side**: `SuccessClient` detects desktop → Logs `[MOBILE-DETECTION] ❌ DESKTOP DETECTED`
3. **Server-side**: `/api/event/success/process` GET → Logs `[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT: { isMobile: false }`
4. **Server-side**: Desktop flow continues (no redirect)

## References

- API Route: `src/app/api/event/success/process/route.ts` (Lines 486-520 for GET, Lines 86-120 for POST)
- Client Component: `src/app/event/success/SuccessClient.tsx` (Lines 40-241)
- Mobile Flow Rule: `.cursor/rules/mobile_payment_flow.mdc`









