# Environment Variable Verification - Desktop and Mobile Payment Workflows

## Problem

Backend is receiving `tenantId='tenant_demo_001'` (wrong tenant) and `paymentMethodDomainId=null` (missing) even though environment variables are set in production:
- `NEXT_PUBLIC_TENANT_ID=tenant_demo_002` ✅ Set
- `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2` ✅ Set

## Root Cause Analysis

The issue is that environment variables might not be accessible at runtime in production, or there's a code path that's not reading them correctly. We need to verify that both desktop and mobile workflows are correctly reading and passing these values.

## Verification Checklist

### ✅ 1. Environment Variables Declared in `next.config.mjs`

**Status**: ✅ **VERIFIED**

```javascript
env: {
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
  // ... other env vars
}
```

**Location**: `next.config.mjs` lines 158-159

### ✅ 2. Desktop Workflow (Checkout Session) - `src/lib/stripe/checkout.ts`

**Status**: ✅ **VERIFIED AND ENHANCED**

**Code Pattern**:
```typescript
// Get tenant ID and Payment Method Domain ID from environment variables
// CRITICAL: These must be set in production environment variables
let tenantId: string;
let paymentMethodDomainId: string;

try {
  tenantId = getTenantId();
  console.log('[STRIPE_CHECKOUT] ✅ Tenant ID retrieved:', {
    tenantId,
    hasValue: !!tenantId,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error('[STRIPE_CHECKOUT] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_TENANT_ID is not set:', error);
  throw new Error(`NEXT_PUBLIC_TENANT_ID is not set in environment variables. Cannot create checkout session without Tenant ID.`);
}

try {
  paymentMethodDomainId = getPaymentMethodDomainId();
  console.log('[STRIPE_CHECKOUT] ✅ Payment Method Domain ID retrieved:', {
    paymentMethodDomainId,
    hasValue: !!paymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error('[STRIPE_CHECKOUT] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
  throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Cannot create checkout session without Payment Method Domain ID.`);
}

// Add to metadata
metadata: {
  tenantId: tenantId, // CRITICAL: Add tenant ID to metadata
  paymentMethodDomainId: paymentMethodDomainId, // CRITICAL: Add Payment Method Domain ID
  // ... other metadata
},
payment_intent_data: {
  metadata: {
    tenantId: tenantId, // CRITICAL: Add tenant ID to PaymentIntent metadata
    paymentMethodDomainId: paymentMethodDomainId, // CRITICAL: Add Payment Method Domain ID
    // ... other metadata
  },
}
```

**Location**: `src/lib/stripe/checkout.ts` lines 41-74

### ✅ 3. Mobile Workflow (Payment Intent) - `src/app/api/stripe/payment-intent/route.ts`

**Status**: ✅ **VERIFIED**

**Code Pattern**:
```typescript
// Get tenant ID and Payment Method Domain ID from environment variables
// CRITICAL: These must be set in production environment variables
let tenantId: string;
let paymentMethodDomainId: string;

try {
  tenantId = getTenantId();
} catch (error) {
  console.error('[PI] Missing NEXT_PUBLIC_TENANT_ID environment variable:', error);
  return NextResponse.json({
    error: 'Server configuration error: Tenant ID not configured',
    details: 'NEXT_PUBLIC_TENANT_ID environment variable is required'
  }, { status: 500 });
}

try {
  paymentMethodDomainId = getPaymentMethodDomainId();
} catch (error) {
  console.error('[PI] Missing NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID environment variable:', error);
  return NextResponse.json({
    error: 'Server configuration error: Payment Method Domain ID not configured',
    details: 'NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID environment variable is required'
  }, { status: 500 });
}

// Create PaymentIntent with metadata
const pi = await stripe().paymentIntents.create({
  metadata: {
    tenantId: tenantId, // CRITICAL: Add tenant ID to metadata
    paymentMethodDomainId: paymentMethodDomainId, // CRITICAL: Add Payment Method Domain ID
    // ... other metadata
  },
});
```

**Location**: `src/app/api/stripe/payment-intent/route.ts` lines 119-154

### ✅ 4. Transaction Creation - `src/app/event/success/ApiServerActions.ts`

**Status**: ✅ **VERIFIED**

**Functions**:
- `createTransaction()` - Reads environment variables with error handling
- `createTransactionItemsBulk()` - Reads environment variables with error handling
- `createTransactionFromPaymentIntent()` - Validates metadata against environment variables

**Code Pattern**:
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
  throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Cannot create transaction without Payment Method Domain ID.`);
}

// Add to payload
const payload = {
  ...transactionData,
  tenantId: expectedTenantId, // ALWAYS use environment tenant ID
  paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
};

// CRITICAL: Double-check that paymentMethodDomainId is set before sending
if (!payload.paymentMethodDomainId) {
  throw new Error(`Payment Method Domain ID is missing from payload. Cannot create transaction without Payment Method Domain ID.`);
}
```

**Location**: `src/app/event/success/ApiServerActions.ts` lines 125-175

### ✅ 5. Webhook Handler - `src/app/api/webhooks/stripe/ApiServerActions.ts`

**Status**: ✅ **VERIFIED**

**Code Pattern**:
```typescript
// Get triple validation values from environment variables
// CRITICAL: getPaymentMethodDomainId() throws if not set - this ensures we fail fast
let expectedPaymentMethodDomainId: string;
try {
  expectedPaymentMethodDomainId = getPaymentMethodDomainId();
  console.log('[WEBHOOK DEBUG] ✅ Payment Method Domain ID retrieved:', {
    paymentMethodDomainId: expectedPaymentMethodDomainId,
    hasValue: !!expectedPaymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error('[WEBHOOK DEBUG] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
  throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Cannot create transaction without Payment Method Domain ID.`);
}

// Add to payload
const payload = {
  ...transaction,
  tenantId: expectedTenantId, // ALWAYS use environment tenant ID
  paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
};
```

**Location**: `src/app/api/webhooks/stripe/ApiServerActions.ts` lines 23-52

## Expected Behavior

### Desktop Workflow (Checkout Session)

1. **User completes checkout** → `createStripeCheckoutSession()` called
2. **Environment variables read**:
   - `tenantId = getTenantId()` → Should return `tenant_demo_002`
   - `paymentMethodDomainId = getPaymentMethodDomainId()` → Should return `pmd_1SWrMSK5BrggeAHMmHxUd9F2`
3. **Metadata added to Checkout Session**:
   - `sessionParams.metadata.tenantId = tenant_demo_002`
   - `sessionParams.metadata.paymentMethodDomainId = pmd_1SWrMSK5BrggeAHMmHxUd9F2`
   - `sessionParams.payment_intent_data.metadata.tenantId = tenant_demo_002`
   - `sessionParams.payment_intent_data.metadata.paymentMethodDomainId = pmd_1SWrMSK5BrggeAHMmHxUd9F2`
4. **Success page processes session** → Extracts metadata and validates
5. **Transaction created** → Uses environment variables (not metadata) for security

### Mobile Workflow (Payment Intent)

1. **User taps PRB** → `POST /api/stripe/payment-intent` called
2. **Environment variables read**:
   - `tenantId = getTenantId()` → Should return `tenant_demo_002`
   - `paymentMethodDomainId = getPaymentMethodDomainId()` → Should return `pmd_1SWrMSK5BrggeAHMmHxUd9F2`
3. **Metadata added to Payment Intent**:
   - `pi.metadata.tenantId = tenant_demo_002`
   - `pi.metadata.paymentMethodDomainId = pmd_1SWrMSK5BrggeAHMmHxUd9F2`
4. **Success page processes Payment Intent** → Extracts metadata and validates
5. **Transaction created** → Uses environment variables (not metadata) for security

## Debugging Steps

### 1. Check Production Logs

Look for these log messages in production:

**Desktop Workflow**:
```
[STRIPE_CHECKOUT] ✅ Tenant ID retrieved: { tenantId: 'tenant_demo_002', ... }
[STRIPE_CHECKOUT] ✅ Payment Method Domain ID retrieved: { paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2', ... }
```

**Mobile Workflow**:
```
[PI] Creating PaymentIntent: { ... }
```

**Transaction Creation**:
```
[createTransaction] ✅ Payment Method Domain ID retrieved: { paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2', ... }
[createTransaction] ✅ Triple validation passed, sending transaction with validated fields: { tenantId: 'tenant_demo_002', paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2', ... }
```

### 2. Check for Error Messages

If environment variables are not set, you should see:

```
[STRIPE_CHECKOUT] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_TENANT_ID is not set
[STRIPE_CHECKOUT] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set
[createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set
```

### 3. Verify Environment Variables in Production

**AWS Amplify Console**:
1. Go to App Settings → Environment Variables
2. Verify both variables are set:
   - `NEXT_PUBLIC_TENANT_ID=tenant_demo_002`
   - `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2`
3. **Redeploy** the application after setting/updating variables

### 4. Check Stripe Metadata

**Desktop Workflow**:
- Check Checkout Session metadata in Stripe Dashboard
- Should see: `tenantId=tenant_demo_002`, `paymentMethodDomainId=pmd_1SWrMSK5BrggeAHMmHxUd9F2`

**Mobile Workflow**:
- Check Payment Intent metadata in Stripe Dashboard
- Should see: `tenantId=tenant_demo_002`, `paymentMethodDomainId=pmd_1SWrMSK5BrggeAHMmHxUd9F2`

## Common Issues

### Issue 1: Environment Variables Not Accessible at Runtime

**Symptoms**:
- Variables set in AWS Amplify console
- But code throws "not set" errors

**Solution**:
- Ensure variables are declared in `next.config.mjs` `env` section
- Redeploy application after setting variables
- Check AWS Amplify build logs for variable availability

### Issue 2: Wrong Tenant ID in Backend

**Symptoms**:
- Backend receives `tenantId='tenant_demo_001'` instead of `tenant_demo_002`

**Possible Causes**:
1. Multiple deployments with different `NEXT_PUBLIC_TENANT_ID` values
2. Webhook handler from different deployment processing events
3. Cached environment variables

**Solution**:
- Verify all deployments have correct `NEXT_PUBLIC_TENANT_ID`
- Check webhook endpoints in Stripe Dashboard
- Clear AWS Amplify cache and redeploy

### Issue 3: Missing Payment Method Domain ID

**Symptoms**:
- Backend receives `paymentMethodDomainId=null`

**Possible Causes**:
1. `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` not set in production
2. Error being caught and request still sent
3. Different code path not reading environment variables

**Solution**:
- Set `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` in AWS Amplify
- Verify error handling prevents requests with missing values
- Check all code paths that create transactions

## Testing Checklist

- [ ] Desktop checkout session creates with correct `tenantId` and `paymentMethodDomainId` in metadata
- [ ] Mobile Payment Intent creates with correct `tenantId` and `paymentMethodDomainId` in metadata
- [ ] Transaction creation reads environment variables correctly
- [ ] Error handling prevents requests if environment variables are missing
- [ ] Backend receives correct `tenantId` and `paymentMethodDomainId` in transaction payload
- [ ] Both workflows validate metadata against environment variables before creating transactions

## References

- Desktop workflow: `src/lib/stripe/checkout.ts`
- Mobile workflow: `src/app/api/stripe/payment-intent/route.ts`
- Transaction creation: `src/app/event/success/ApiServerActions.ts`
- Webhook handler: `src/app/api/webhooks/stripe/ApiServerActions.ts`
- Environment variables: `src/lib/env.ts`
- Next.js config: `next.config.mjs`

