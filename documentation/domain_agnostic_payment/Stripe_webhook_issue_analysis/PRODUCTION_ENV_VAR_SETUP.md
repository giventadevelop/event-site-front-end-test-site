# Production Environment Variable Setup - Payment Intent 500 Error Fix

## Problem

The `/api/stripe/payment-intent` endpoint returns `500 Internal Server Error` in production but works fine locally.

**Root Cause**: Missing `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` environment variable in AWS Amplify production environment.

## Error Details

When `getPaymentMethodDomainId()` is called, it throws an error if `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` is not set:

```typescript
export function getPaymentMethodDomainId() {
  const paymentMethodDomainId = process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID;
  if (!paymentMethodDomainId) {
    throw new Error('NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables');
  }
  return paymentMethodDomainId;
}
```

This error is caught by the catch block in `route.ts`, resulting in a generic `500 Internal Server Error` response.

## Solution

### 1. Add Environment Variable to AWS Amplify

**Required Environment Variable:**
- **Name**: `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`
- **Value**: Your Stripe Payment Method Domain ID (e.g., `pmd_1SWrMSK5BrggeAHMmHxUd9F2`)
- **Scope**: Production, Preview, Development (as needed)

**Steps:**
1. Go to AWS Amplify Console → Your App → Environment variables
2. Click "Manage variables"
3. Add new variable:
   - **Key**: `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`
   - **Value**: `pmd_1SWrMSK5BrggeAHMmHxUd9F2` (your actual Payment Method Domain ID)
   - **Branch**: Select branches (Production, Preview, etc.)
4. Save and redeploy

### 2. Verify Environment Variable in next.config.mjs

The environment variable should be declared in `next.config.mjs`:

```javascript
env: {
  // ... other variables
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
}
```

### 3. Enhanced Error Handling (Already Implemented)

The code now includes better error handling:

```typescript
try {
  paymentMethodDomainId = getPaymentMethodDomainId();
} catch (error) {
  console.error('[PI] Missing NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID environment variable:', error);
  return NextResponse.json({
    error: 'Server configuration error: Payment Method Domain ID not configured',
    details: 'NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID environment variable is required'
  }, { status: 500 });
}
```

This provides clearer error messages in logs, making debugging easier.

## Required Environment Variables for Payment Intent Creation

### Required Variables:
1. ✅ `STRIPE_SECRET_KEY` - Stripe secret key (already configured)
2. ✅ `NEXT_PUBLIC_TENANT_ID` - Tenant ID (already configured)
3. ❌ `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` - **MISSING IN PRODUCTION** ← **FIX THIS**

### Optional Variables:
- `NEXT_PUBLIC_APP_URL` - App URL (for server-side API calls)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for client-side)

## Verification Steps

### 1. Check AWS Amplify Environment Variables
```bash
# In AWS Amplify Console
# Go to: App Settings → Environment variables
# Verify NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is set
```

### 2. Check Production Logs
After adding the environment variable and redeploying, check logs for:
```
[PI] Creating PaymentIntent: {
  tenantId: 'tenant_demo_002',
  paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
  ...
}
```

### 3. Test Payment Intent Creation
1. Navigate to: `https://www.mosc-temp.com/events/2/tickets-stripe-web-client`
2. Add tickets to cart
3. Click "Pay" button
4. Verify PaymentIntent is created successfully (no 500 error)

## Common Issues

### Issue 1: Environment Variable Not Available at Runtime
**Symptom**: Variable is set in AWS Amplify but still returns 500 error.

**Solution**:
- Ensure variable is declared in `next.config.mjs` `env` section
- Redeploy the application after adding the variable
- Check AWS Amplify build logs for environment variable loading

### Issue 2: Wrong Variable Name
**Symptom**: Variable exists but with different name (e.g., `PAYMENT_METHOD_DOMAIN_ID` without `NEXT_PUBLIC_` prefix).

**Solution**:
- Use exact name: `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`
- `NEXT_PUBLIC_` prefix is required for client-accessible variables in Next.js

### Issue 3: AWS Amplify Prefix Issue
**Symptom**: Variable works locally but not in AWS Amplify.

**Solution**:
- AWS Amplify may prefix variables with `AMPLIFY_` in runtime
- Check if you need to use `AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` instead
- Or ensure `next.config.mjs` handles both prefixes:
  ```javascript
  NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID:
    process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ||
    process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
  ```

## Summary

**Fix**: Add `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` environment variable to AWS Amplify production environment.

**Value**: Your Stripe Payment Method Domain ID (e.g., `pmd_1SWrMSK5BrggeAHMmHxUd9F2`)

**After Fix**: Redeploy the application and verify PaymentIntent creation works in production.

