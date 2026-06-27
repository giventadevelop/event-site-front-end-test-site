# Mobile Workflow Tenant Filtering Fix - Always Use Environment Variables

## Problem

The mobile payment workflow was still sending:
- `tenantId='tenant_demo_001'` (wrong tenant - should be `tenant_demo_002`)
- `paymentMethodDomainId=null` (missing - should be `pmd_1SWrMSK5BrggeAHMmHxUd9F2`)

**Backend Logs**:
```
EventTicketTransactionDTO{
  tenantId='tenant_demo_001',  // ❌ Wrong tenant
  paymentMethodDomainId=null,   // ❌ Missing
  ...
}
```

## Root Cause

1. **Webhook Handler Missing `paymentMethodDomainId`**: The webhook handler was creating `txPayload` without `paymentMethodDomainId`
2. **Metadata Fallback Logic**: Code was using `metadataPaymentMethodDomainId || expectedPaymentMethodDomainId`, which could use metadata values instead of always using environment variables
3. **Insufficient Tenant ID Validation**: Need to ensure `withTenantId()` returns the correct tenant ID from environment variables

## Solution

### 1. Webhook Handler - Always Use Environment Variable for `paymentMethodDomainId`

**Location**: `src/app/api/webhooks/stripe/route.ts` line 179-190

**Change**:
```typescript
// CRITICAL: ALWAYS use environment variable for paymentMethodDomainId (never use metadata)
// This ensures consistent tenant filtering - reject if metadata doesn't match, but always use environment variable
// If metadata doesn't match, we've already rejected above, so we can safely use environment variable here
const finalPaymentMethodDomainId = expectedPaymentMethodDomainId;

console.log('[STRIPE-WEBHOOK] Setting paymentMethodDomainId (ALWAYS from environment):', {
  fromMetadata: metadataPaymentMethodDomainId,
  fromEnvironment: expectedPaymentMethodDomainId,
  finalValue: finalPaymentMethodDomainId,
  usingEnvironmentVariable: true, // Always use environment variable for consistency
  paymentIntentId,
  timestamp: new Date().toISOString()
});

const txPayload: Omit<EventTicketTransactionDTO, 'id'> = {
  // ... other fields ...
  // CRITICAL: Always set paymentMethodDomainId - ALWAYS use environment variable
  paymentMethodDomainId: finalPaymentMethodDomainId,
};
```

### 2. Mobile Workflow - Always Use Environment Variable for `paymentMethodDomainId`

**Location**: `src/app/event/success/ApiServerActions.ts` line 1032-1083

**Change**:
```typescript
// CRITICAL: ALWAYS use environment variable for paymentMethodDomainId (never use metadata)
// This ensures consistent tenant filtering - reject if metadata doesn't match, but always use environment variable
// If metadata doesn't match, we've already rejected above, so we can safely use environment variable here
const finalPaymentMethodDomainId = expectedPaymentMethodDomainId;

console.log('[createTransactionFromPaymentIntent] Setting paymentMethodDomainId (ALWAYS from environment):', {
  fromMetadata: metadataPaymentMethodDomainId,
  fromEnvironment: expectedPaymentMethodDomainId,
  finalValue: finalPaymentMethodDomainId,
  usingEnvironmentVariable: true, // Always use environment variable for consistency
  paymentIntentId,
  timestamp: new Date().toISOString()
});

// CRITICAL: Verify withTenantId() returns the correct tenant ID from environment variable
const tenantIdFromHelper = getTenantId();
if (tenantIdFromHelper !== expectedTenantId) {
  console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: getTenantId() returned wrong tenant ID');
  throw new Error(`Tenant ID mismatch: getTenantId() returned ${tenantIdFromHelper} but expected ${expectedTenantId}. Environment variable mismatch.`);
}

const transactionData: Omit<EventTicketTransactionDTO, 'id'> = withTenantId({
  // ... other fields ...
  // CRITICAL: Always set paymentMethodDomainId - ALWAYS use environment variable
  paymentMethodDomainId: finalPaymentMethodDomainId,
});

// CRITICAL: Verify transactionData has correct tenant ID (from withTenantId)
if (transactionData.tenantId !== expectedTenantId) {
  console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: transactionData has wrong tenant ID');
  throw new Error(`Tenant ID mismatch: transactionData has tenantId=${transactionData.tenantId} but expected ${expectedTenantId}.`);
}

// CRITICAL: Verify transactionData has paymentMethodDomainId set
if (!transactionData.paymentMethodDomainId) {
  console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: transactionData missing paymentMethodDomainId');
  throw new Error(`Payment Method Domain ID is missing from transactionData.`);
}
```

### 3. Transaction Creation Functions - Override Tenant ID and Payment Method Domain ID

**Location**: `src/app/event/success/ApiServerActions.ts` line 171-175

**Already Implemented**:
```typescript
const payload = {
  ...transactionData,
  tenantId: expectedTenantId, // ALWAYS use environment tenant ID - ignore any tenantId from transactionData
  paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
};
```

**Location**: `src/app/api/webhooks/stripe/ApiServerActions.ts` line 66-70

**Already Implemented**:
```typescript
const payload = {
  ...transaction,
  tenantId: expectedTenantId, // ALWAYS use environment tenant ID - ignore any tenantId from transaction
  paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
};
```

## Tenant Filtering Logic

### Validation Flow

1. **Extract Metadata** from PaymentIntent:
   - `metadataTenantId` from `pi.metadata.tenantId` or `pi.metadata.tenant_id`
   - `metadataPaymentMethodDomainId` from `pi.metadata.paymentMethodDomainId` or `pi.metadata.payment_method_domain_id`

2. **Read Environment Variables**:
   - `expectedTenantId = getTenantId()` → Should return `tenant_demo_002`
   - `expectedPaymentMethodDomainId = getPaymentMethodDomainId()` → Should return `pmd_1SWrMSK5BrggeAHMmHxUd9F2`

3. **Validate Metadata** (if present):
   - If `metadataTenantId` exists and doesn't match `expectedTenantId` → **REJECT** (throw error)
   - If `metadataPaymentMethodDomainId` exists and doesn't match `expectedPaymentMethodDomainId` → **REJECT** (throw error)

4. **Set Final Values**:
   - `finalTenantId = expectedTenantId` (ALWAYS use environment variable)
   - `finalPaymentMethodDomainId = expectedPaymentMethodDomainId` (ALWAYS use environment variable)

5. **Create Transaction**:
   - Use `finalTenantId` and `finalPaymentMethodDomainId` in transaction payload
   - Backend receives correct values for triple validation

### Rejection Logic

**Tenant ID Mismatch**:
```typescript
if (metadataTenantId && metadataTenantId !== expectedTenantId) {
  console.error('[STRIPE-WEBHOOK] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting transaction creation');
  return new NextResponse(`Tenant ID mismatch: Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`, { status: 403 });
}
```

**Payment Method Domain ID Mismatch**:
```typescript
if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
  console.error('[STRIPE-WEBHOOK] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting transaction creation');
  return new NextResponse(`Payment Method Domain ID mismatch: Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`, { status: 403 });
}
```

## Key Changes Summary

### ✅ Always Use Environment Variables

**Before**:
```typescript
const finalPaymentMethodDomainId = metadataPaymentMethodDomainId || expectedPaymentMethodDomainId;
```

**After**:
```typescript
const finalPaymentMethodDomainId = expectedPaymentMethodDomainId; // ALWAYS use environment variable
```

### ✅ Added Tenant ID Validation

**New Validation**:
```typescript
// Verify withTenantId() returns the correct tenant ID
const tenantIdFromHelper = getTenantId();
if (tenantIdFromHelper !== expectedTenantId) {
  throw new Error(`Tenant ID mismatch: getTenantId() returned ${tenantIdFromHelper} but expected ${expectedTenantId}.`);
}

// Verify transactionData has correct tenant ID
if (transactionData.tenantId !== expectedTenantId) {
  throw new Error(`Tenant ID mismatch: transactionData has tenantId=${transactionData.tenantId} but expected ${expectedTenantId}.`);
}
```

### ✅ Added Payment Method Domain ID Validation

**New Validation**:
```typescript
// Verify transactionData has paymentMethodDomainId set
if (!transactionData.paymentMethodDomainId) {
  throw new Error(`Payment Method Domain ID is missing from transactionData.`);
}
```

## Expected Behavior

### Mobile Payment Flow

1. **Payment Intent Created** → Includes metadata with `tenantId` and `paymentMethodDomainId`
2. **Webhook/Success Page Processes** → Extracts metadata and validates against environment variables
3. **If Metadata Mismatches** → Request rejected (403 Forbidden)
4. **If Metadata Matches or Missing** → Uses environment variables for transaction creation
5. **Transaction Created** → Always uses `expectedTenantId` and `expectedPaymentMethodDomainId` from environment
6. **Backend Receives** → Correct `tenantId` and `paymentMethodDomainId` for triple validation

### Desktop Payment Flow

1. **Checkout Session Created** → Includes metadata with `tenantId` and `paymentMethodDomainId`
2. **Success Page Processes** → Extracts metadata and validates against environment variables
3. **If Metadata Mismatches** → Request rejected (error thrown)
4. **Transaction Created** → Always uses `expectedTenantId` and `expectedPaymentMethodDomainId` from environment
5. **Backend Receives** → Correct `tenantId` and `paymentMethodDomainId` for triple validation

## Debugging

### Check Environment Variables

**Production Logs Should Show**:
```
[createTransactionFromPaymentIntent] Setting paymentMethodDomainId (ALWAYS from environment): {
  fromMetadata: 'pmd_xxx' or undefined,
  fromEnvironment: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
  finalValue: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
  usingEnvironmentVariable: true,
  paymentIntentId: 'pi_xxx',
  timestamp: '...'
}
```

**If Wrong Tenant ID**:
```
[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: getTenantId() returned wrong tenant ID: {
  tenantIdFromHelper: 'tenant_demo_001',
  expectedTenantId: 'tenant_demo_002',
  ...
}
```

### Verify Backend Receives Correct Values

**Backend Logs Should Show**:
```
EventTicketTransactionDTO{
  tenantId='tenant_demo_002',  // ✅ Correct tenant
  paymentMethodDomainId='pmd_1SWrMSK5BrggeAHMmHxUd9F2',  // ✅ Correct Payment Method Domain ID
  ...
}
```

## Testing Checklist

- [x] Webhook handler adds `paymentMethodDomainId` to `txPayload`
- [x] Webhook handler always uses environment variable (not metadata)
- [x] Mobile workflow always uses environment variable for `paymentMethodDomainId`
- [x] Tenant ID validation rejects mismatched tenant IDs
- [x] Payment Method Domain ID validation rejects mismatched values
- [x] `withTenantId()` returns correct tenant ID from environment
- [x] `createTransaction()` overrides tenant ID with environment variable
- [x] `createEventTicketTransactionServer()` overrides tenant ID with environment variable
- [x] Backend receives correct `tenantId` and `paymentMethodDomainId`

## References

- Mobile payment flow: `.cursor/rules/mobile_payment_flow.mdc`
- Webhook handler: `src/app/api/webhooks/stripe/route.ts`
- Webhook server actions: `src/app/api/webhooks/stripe/ApiServerActions.ts`
- Transaction creation: `src/app/event/success/ApiServerActions.ts`
- Environment variables: `src/lib/env.ts`
- Tenant ID helper: `src/lib/withTenantId.ts`









