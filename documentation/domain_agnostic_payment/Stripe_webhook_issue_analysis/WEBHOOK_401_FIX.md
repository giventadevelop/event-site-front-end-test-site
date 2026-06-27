# Webhook 401 Unauthorized Fix

## Problem

Stripe webhook forwarding to backend was getting `401 Unauthorized` errors:

```
[STRIPE-WEBHOOK] Backend response status: 401
[STRIPE-WEBHOOK] Backend response: (empty)
```

**Root Cause**: The webhook route was forwarding requests to the backend **without JWT authentication**.

## Solution

### Fixed Webhook Forwarding (`src/app/api/webhooks/stripe/route.ts`)

**Before** (Missing JWT):
```typescript
const backendResponse = await fetch(backendWebhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Stripe-Signature': signature,
  },
  body: rawBody,
});
```

**After** (With JWT):
```typescript
// CRITICAL: Get JWT token for backend authentication
let jwt = await getCachedApiJwt();
if (!jwt) {
  jwt = await generateApiJwt();
}

const backendResponse = await fetch(backendWebhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Stripe-Signature': signature || '',
    'Authorization': `Bearer ${jwt}`, // CRITICAL: JWT authentication required
  },
  body: rawBody,
});
```

## Cursor Rules Compliance

### Rule: Webhooks REST API Call Pattern (`.cursor/rules/nextjs_api_routes.mdc`)

**Line 440-449** states:
> When making REST API calls from webhook files (such as Stripe webhooks in src/app/api/webhooks/stripe/route.ts), do NOT use the standard /api/proxy/... pattern or proxy API handler.
> Instead, call the backend Rust API directly from the webhook file using fetch, and:
> - Always include the JWT token in the Authorization header: 'Authorization: Bearer <token>'
> - Always pass the 'id' field and all required fields in the PATCH/PUT/POST payload, matching the backend DTO requirements.
> - Use 'Content-Type: application/merge-patch+json' for PATCH requests (or 'application/json' for POST/PUT as required).
> - Do not rely on Clerk session or cookies; use service JWT only.

### Rule: STRICT RULE: All Server Actions Must Use fetchWithJwtRetry (`.cursor/rules/nextjs_api_routes.mdc`)

**Line 623-664** states:
> **CRITICAL**: All server actions that make backend API calls MUST use `fetchWithJwtRetry` from `@/lib/proxyHandler`.
> **NEVER** use direct `fetch()` calls to backend APIs in server actions.
> **NEVER** implement custom JWT retry logic in server actions.

**Exception for Webhooks**: Webhooks use direct `fetch()` with manual JWT (as per webhook pattern rule), but still require JWT authentication.

## Implementation Details

### JWT Token Retrieval

```typescript
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';

// Try cached JWT first (faster)
let jwt = await getCachedApiJwt();

// Fallback to generating new JWT if cache miss
if (!jwt) {
  console.log('[STRIPE-WEBHOOK] No cached JWT, generating new one...');
  jwt = await generateApiJwt();
}
```

### Why Direct fetch() Instead of fetchWithJwtRetry?

1. **Webhook Pattern**: According to cursor rules, webhooks should use direct `fetch()` calls (not proxy pattern)
2. **Raw Body**: Webhooks need to forward raw body (Buffer) for signature verification
3. **Custom Headers**: Webhooks need to forward `Stripe-Signature` header
4. **Manual JWT**: Still requires JWT, but handles it manually (not via proxy handler)

### Alternative: Using fetchWithJwtRetry

If we wanted to use `fetchWithJwtRetry`, we'd need to:
1. Convert Buffer to string for JSON
2. Handle signature header forwarding
3. Ensure retry logic works with webhook context

**Current approach (manual JWT) is correct** per cursor rules for webhooks.

## Testing

After fix:
1. ✅ Webhook forwarding includes `Authorization: Bearer <JWT>` header
2. ✅ Backend receives authenticated request
3. ✅ Backend can verify webhook signature and process transaction
4. ✅ No more 401 errors

## References

- Webhook Route: `src/app/api/webhooks/stripe/route.ts` (Lines 396-413)
- Cursor Rules: `.cursor/rules/nextjs_api_routes.mdc` (Lines 440-449, 623-664)
- JWT Helper: `src/lib/api/jwt.ts` (`getCachedApiJwt`, `generateApiJwt`)









