# Payment Method Domain ID Null Fix

## Problem

The backend is receiving `paymentMethodDomainId=null` in transaction creation requests, causing backend validation to fail with:
```
Payment Method Domain ID is required for triple validation
```

**Backend Logs Show:**
- `tenantId='tenant_demo_001'` (wrong tenant)
- `paymentMethodDomainId=null` (missing)

**Root Cause:**
- `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` is not set in production environment variables
- Error handling was catching the error but requests were still being sent with `null`

## Solution

Added comprehensive error handling and validation to ensure `paymentMethodDomainId` is **always** set before sending requests to the backend:

### 1. Enhanced Error Handling in `createTransaction`

```typescript
// Get triple validation values from environment variables
// CRITICAL: getPaymentMethodDomainId() throws if not set - this ensures we fail fast
const expectedTenantId = getTenantId();
let expectedPaymentMethodDomainId: string;
try {
  expectedPaymentMethodDomainId = getPaymentMethodDomainId();
  console.log('[createTransaction] ✅ Payment Method Domain ID retrieved:', {
    paymentMethodDomainId: expectedPaymentMethodDomainId,
    hasValue: !!expectedPaymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error('[createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
  console.error('[createTransaction] Environment check:', {
    NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
    timestamp: new Date().toISOString()
  });
  throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Cannot create transaction without Payment Method Domain ID.`);
}

// CRITICAL: Double-check that paymentMethodDomainId is set before sending
if (!payload.paymentMethodDomainId) {
  console.error('[createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: paymentMethodDomainId is missing from payload:', {
    payload,
    expectedPaymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
  throw new Error(`Payment Method Domain ID is missing from payload. Cannot create transaction without Payment Method Domain ID.`);
}
```

### 2. Enhanced Error Handling in `createTransactionItemsBulk`

Same pattern applied to transaction items creation.

### 3. Enhanced Error Handling in `createEventTicketTransactionServer`

Same pattern applied to webhook transaction creation.

## Files Modified

1. **`src/app/event/success/ApiServerActions.ts`**:
   - Added try-catch around `getPaymentMethodDomainId()` in `createTransaction()`
   - Added try-catch around `getPaymentMethodDomainId()` in `createTransactionItemsBulk()`
   - Added double-check validation before sending payloads

2. **`src/app/api/webhooks/stripe/ApiServerActions.ts`**:
   - Added try-catch around `getPaymentMethodDomainId()` in `createEventTicketTransactionServer()`
   - Added enhanced logging

3. **`src/app/api/webhooks/stripe/route.ts`**:
   - Added metadata validation in `handleChargeFeeUpdate()`

## Required Action

**CRITICAL**: Set `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` in production environment variables:

1. **AWS Amplify Console**:
   - Go to App Settings → Environment Variables
   - Add: `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2`
   - Redeploy the application

2. **Local Development** (`.env.local`):
   ```env
   NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2
   ```

3. **Verify in `next.config.mjs`**:
   ```javascript
   env: {
     NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
     // ... other env vars
   }
   ```

## Expected Behavior After Fix

1. **If `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` is NOT set**:
   - Function throws error **before** sending request to backend
   - Error logged with detailed environment check
   - Request **never reaches backend**
   - User sees error message (500 Internal Server Error)

2. **If `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` IS set**:
   - Function retrieves value successfully
   - Value added to payload
   - Double-check validation passes
   - Request sent to backend with `paymentMethodDomainId` set
   - Backend validation passes

## Testing

1. **Test with missing env var**:
   - Remove `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` from `.env.local`
   - Attempt to create transaction
   - Should see error: "NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables"
   - Backend should NOT receive request

2. **Test with correct env var**:
   - Set `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2` in `.env.local`
   - Attempt to create transaction
   - Should succeed
   - Backend should receive request with `paymentMethodDomainId` set

## Related Issues

- Desktop browser workflow now also fails (was working before)
- Mobile workflow fails (was failing before)
- Both workflows require `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` to be set

## References

- See `PRODUCTION_ENV_VAR_SETUP.md` for environment variable setup instructions
- See `FRONTEND_BACKEND_TRIPLE_VALIDATION_IMPLEMENTATION.md` for triple validation details

