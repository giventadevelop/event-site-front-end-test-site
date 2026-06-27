# Mobile Payment Workflow - Payment Method Domain ID Fix

## Problem

The mobile payment workflow was not sending `paymentMethodDomainId` to the backend, causing backend validation errors:

```
Payment Method Domain ID is required for triple validation
```

**Backend Logs**:
```
EventTicketTransactionDTO{
  tenantId='tenant_demo_001',
  paymentMethodDomainId=null,  // ❌ Missing!
  ...
}
```

## Root Cause

The `createTransactionFromPaymentIntent()` function was:
1. ✅ Extracting `paymentMethodDomainId` from PaymentIntent metadata
2. ✅ Validating it against environment variables
3. ❌ **NOT** adding it to the `transactionData` object before calling `createTransaction()`
4. ❌ **NOT** adding it to transaction items

Even though `createTransaction()` adds `paymentMethodDomainId` from environment variables, the mobile workflow needed explicit handling to ensure it's always set, especially when metadata is missing.

## Solution

### 1. Added `paymentMethodDomainId` to Transaction Data

**Location**: `src/app/event/success/ApiServerActions.ts` line 1031-1080

**Change**:
```typescript
// CRITICAL: Use paymentMethodDomainId from metadata if available, otherwise use environment variable
// This ensures mobile workflow always has paymentMethodDomainId set
const finalPaymentMethodDomainId = metadataPaymentMethodDomainId || expectedPaymentMethodDomainId;

console.log('[createTransactionFromPaymentIntent] Setting paymentMethodDomainId:', {
  fromMetadata: metadataPaymentMethodDomainId,
  fromEnvironment: expectedPaymentMethodDomainId,
  finalValue: finalPaymentMethodDomainId,
  paymentIntentId,
  timestamp: new Date().toISOString()
});

const transactionData: Omit<EventTicketTransactionDTO, 'id'> = withTenantId({
  // ... other fields ...
  // CRITICAL: Always set paymentMethodDomainId - use metadata if available, otherwise use environment variable
  paymentMethodDomainId: finalPaymentMethodDomainId,
});
```

### 2. Added `paymentMethodDomainId` to Transaction Items

**Location**: `src/app/event/success/ApiServerActions.ts` line 1098-1108

**Change**:
```typescript
const itemData = withTenantId({
  transactionId: transaction.id,
  ticketTypeId: cartItem.ticketTypeId,
  quantity: cartItem.quantity,
  pricePerUnit: ticketType.price,
  totalAmount: ticketType.price * cartItem.quantity,
  ticketTypeName: ticketType.name,
  createdAt: now,
  updatedAt: now,
  // CRITICAL: Always set paymentMethodDomainId - use metadata if available, otherwise use environment variable
  paymentMethodDomainId: finalPaymentMethodDomainId,
});
```

## How It Works

### Mobile Payment Flow

1. **User completes payment** → Payment Intent created with metadata (if available)
2. **Success page processes** → `createTransactionFromPaymentIntent()` called
3. **Extract metadata**:
   - `metadataPaymentMethodDomainId` from PaymentIntent metadata
   - `expectedPaymentMethodDomainId` from environment variable `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`
4. **Set final value**:
   - Use `metadataPaymentMethodDomainId` if available
   - Fallback to `expectedPaymentMethodDomainId` from environment variable
5. **Create transaction**:
   - Add `paymentMethodDomainId: finalPaymentMethodDomainId` to transaction data
   - Add `paymentMethodDomainId: finalPaymentMethodDomainId` to each transaction item
6. **Backend receives**:
   - `tenantId` from environment variable (via `withTenantId()`)
   - `paymentMethodDomainId` from metadata or environment variable
   - Backend validates triple combination: `(tenantId, paymentMethodDomainId, webhookSecret)`

## Fallback Logic

The fix implements a fallback strategy:

1. **First Priority**: Use `paymentMethodDomainId` from PaymentIntent metadata (if available)
2. **Second Priority**: Use `paymentMethodDomainId` from environment variable `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`

This ensures:
- ✅ If PaymentIntent metadata has `paymentMethodDomainId`, use it (validated against environment)
- ✅ If PaymentIntent metadata is missing `paymentMethodDomainId`, use environment variable
- ✅ Backend always receives `paymentMethodDomainId` (never null)

## Validation Flow

### Before Transaction Creation

1. **Extract metadata** from PaymentIntent
2. **Read environment variables** (`NEXT_PUBLIC_TENANT_ID`, `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`)
3. **Validate metadata** (if present) matches environment variables
4. **Set final values**:
   - `finalTenantId = metadataTenantId || expectedTenantId`
   - `finalPaymentMethodDomainId = metadataPaymentMethodDomainId || expectedPaymentMethodDomainId`

### During Transaction Creation

1. **Transaction data** includes `paymentMethodDomainId: finalPaymentMethodDomainId`
2. **Transaction items** include `paymentMethodDomainId: finalPaymentMethodDomainId`
3. **Backend validation** receives both values and validates triple combination

## Expected Behavior

### Success Case

**PaymentIntent Metadata Present**:
```
PaymentIntent.metadata = {
  tenantId: 'tenant_demo_002',
  paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'
}

Environment Variables:
NEXT_PUBLIC_TENANT_ID = 'tenant_demo_002'
NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID = 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'

Result:
- Metadata validated against environment ✅
- Transaction created with paymentMethodDomainId from metadata ✅
- Backend receives paymentMethodDomainId ✅
```

**PaymentIntent Metadata Missing**:
```
PaymentIntent.metadata = {
  tenantId: 'tenant_demo_002'
  // paymentMethodDomainId missing
}

Environment Variables:
NEXT_PUBLIC_TENANT_ID = 'tenant_demo_002'
NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID = 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'

Result:
- Metadata missing paymentMethodDomainId (warning logged) ⚠️
- Transaction created with paymentMethodDomainId from environment variable ✅
- Backend receives paymentMethodDomainId ✅
```

### Error Cases

**Environment Variable Missing**:
```
Error: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables
Cannot create transaction without Payment Method Domain ID.
```
- Transaction creation fails immediately
- No backend call made

**Metadata Mismatch**:
```
Error: Payment Method Domain ID mismatch: Payment Intent Payment Method Domain ID (pmd_xxx) does not match configured Payment Method Domain ID (pmd_yyy)
```
- Transaction creation fails immediately
- No backend call made

## Testing Checklist

- [x] Mobile payment flow includes `paymentMethodDomainId` in transaction data
- [x] Mobile payment flow includes `paymentMethodDomainId` in transaction items
- [x] Fallback to environment variable when metadata is missing
- [x] Validation prevents mismatched metadata values
- [x] Error handling prevents creation if environment variable is missing
- [x] Backend receives `paymentMethodDomainId` (never null)

## References

- Mobile payment flow: `.cursor/rules/mobile_payment_flow.mdc`
- Transaction creation: `src/app/event/success/ApiServerActions.ts`
- Payment Intent API: `src/app/api/stripe/payment-intent/route.ts`
- Environment variables: `src/lib/env.ts`









