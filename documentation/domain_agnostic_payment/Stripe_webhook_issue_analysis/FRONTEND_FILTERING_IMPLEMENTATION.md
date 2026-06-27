# Frontend Filtering Implementation - Triple Validation

## Overview

This document describes the frontend filtering implementation that validates `tenantId` and `paymentMethodDomainId` from PaymentIntent/CheckoutSession metadata against environment variables **BEFORE** making any backend API calls. This prevents requests with mismatched tenant IDs or payment method domain IDs from reaching the backend.

## Problem Solved

**Issue**: Event success page was receiving requests with `tenantId = tenant_demo_001` and `paymentMethodDomainId = pmd_1SWrMSK5BrggeAHMmHxUd9F2`, but environment variables were set to different values (e.g., `tenant_demo_002`).

**Solution**: Frontend now validates metadata against environment variables and rejects requests early if they don't match, preventing unnecessary backend calls.

## Implementation Locations

### 1. PaymentIntent Processing (`src/app/api/event/success/process/route.ts`)

**Location**: When processing PaymentIntent from event success page

**Validation Logic**:
```typescript
// Extract metadata from PaymentIntent
const metadata = paymentIntent.metadata || {};
const metadataTenantId = metadata.tenantId || metadata.tenant_id;
const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;

// Get expected values from environment variables
const expectedTenantId = getTenantId();
const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

// CRITICAL: Validate metadata matches environment variables BEFORE making backend calls
if (metadataTenantId && metadataTenantId !== expectedTenantId) {
  console.error('[API POST CLIENT-CREATE] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request');
  return NextResponse.json({
    transaction: null,
    error: 'Tenant ID mismatch',
    message: `Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`
  }, { status: 403 });
}

if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
  console.error('[API POST CLIENT-CREATE] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request');
  return NextResponse.json({
    transaction: null,
    error: 'Payment Method Domain ID mismatch',
    message: `Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`
  }, { status: 403 });
}
```

### 2. Transaction Creation (`src/app/event/success/ApiServerActions.ts`)

**Location**: `createTransaction()` function

**Validation Logic**:
```typescript
async function createTransaction(transactionData: Omit<EventTicketTransactionDTO, 'id'>): Promise<EventTicketTransactionDTO> {
  const expectedTenantId = getTenantId();
  const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

  // CRITICAL: Validate transactionData tenantId matches environment variable BEFORE backend call
  const transactionTenantId = transactionData.tenantId;
  if (transactionTenantId && transactionTenantId !== expectedTenantId) {
    throw new Error(`Tenant ID mismatch: Transaction has tenantId=${transactionTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
  }

  // CRITICAL: Validate transactionData paymentMethodDomainId matches environment variable BEFORE backend call
  const transactionPaymentMethodDomainId = transactionData.paymentMethodDomainId;
  if (transactionPaymentMethodDomainId && transactionPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
    throw new Error(`Payment Method Domain ID mismatch: Transaction has paymentMethodDomainId=${transactionPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
  }

  // Use environment variables (not transactionData values) for payload
  const payload = {
    ...transactionData,
    tenantId: expectedTenantId, // ALWAYS use environment tenant ID
    paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
  };

  // Make backend call with validated payload
  // ...
}
```

### 3. Transaction Items Creation (`src/app/event/success/ApiServerActions.ts`)

**Location**: `createTransactionItemsBulk()` function

**Validation Logic**:
```typescript
async function createTransactionItemsBulk(items: any[]): Promise<any[]> {
  const expectedTenantId = getTenantId();
  const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

  // CRITICAL: Validate each item's tenantId and paymentMethodDomainId match environment variables BEFORE backend call
  for (const item of items) {
    const itemTenantId = item.tenantId;
    if (itemTenantId && itemTenantId !== expectedTenantId) {
      throw new Error(`Tenant ID mismatch: Item has tenantId=${itemTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
    }

    const itemPaymentMethodDomainId = item.paymentMethodDomainId;
    if (itemPaymentMethodDomainId && itemPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
      throw new Error(`Payment Method Domain ID mismatch: Item has paymentMethodDomainId=${itemPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
    }
  }

  // Use environment variables (not item values) for payload
  const payload = items.map(item => ({
    ...item,
    tenantId: expectedTenantId, // ALWAYS use environment tenant ID
    paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
  }));

  // Make backend call with validated payload
  // ...
}
```

### 4. Webhook Transaction Creation (`src/app/api/webhooks/stripe/ApiServerActions.ts`)

**Location**: `createEventTicketTransactionServer()` and `createTransactionItemsBulkServer()` functions

**Validation Logic**: Same pattern as above - validate before backend calls, use environment variables in payload.

## Validation Flow

```
PaymentIntent/CheckoutSession Received
    ↓
Extract metadata (tenantId, paymentMethodDomainId)
    ↓
Get expected values from environment variables
    ↓
Compare metadata with environment variables
    ↓
┌─────────────────────────────────────┐
│  Match?                              │
└─────────────────────────────────────┘
    │                    │
   YES                  NO
    │                    │
    ↓                    ↓
Continue          Reject (403 Forbidden)
    │                    │
    ↓                    │
Use environment         │
variables in payload     │
    │                    │
    ↓                    │
Make backend call        │
    │                    │
    └────────────────────┘
```

## Error Responses

### Tenant ID Mismatch (403 Forbidden)
```json
{
  "transaction": null,
  "error": "Tenant ID mismatch",
  "message": "Payment Intent tenant ID (tenant_demo_001) does not match configured tenant ID (tenant_demo_002). Request rejected."
}
```

### Payment Method Domain ID Mismatch (403 Forbidden)
```json
{
  "transaction": null,
  "error": "Payment Method Domain ID mismatch",
  "message": "Payment Intent Payment Method Domain ID (pmd_XXXXX) does not match configured Payment Method Domain ID (pmd_YYYYY). Request rejected."
}
```

## Security Benefits

1. ✅ **Early Rejection**: Requests with mismatched values are rejected before backend calls
2. ✅ **Prevents Backend Load**: Invalid requests don't reach backend
3. ✅ **Clear Error Messages**: Users see why their request was rejected
4. ✅ **Environment Variable Enforcement**: Only requests matching environment configuration are processed
5. ✅ **Logging**: All mismatches are logged for security monitoring

## Testing

### Test Case 1: Valid Metadata
```typescript
// Environment: NEXT_PUBLIC_TENANT_ID=tenant_demo_002
// PaymentIntent metadata: { tenantId: 'tenant_demo_002', paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2' }
// Expected: ✅ Request proceeds to backend
```

### Test Case 2: Invalid Tenant ID
```typescript
// Environment: NEXT_PUBLIC_TENANT_ID=tenant_demo_002
// PaymentIntent metadata: { tenantId: 'tenant_demo_001', paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2' }
// Expected: ❌ Request rejected with 403 Forbidden
```

### Test Case 3: Invalid Payment Method Domain ID
```typescript
// Environment: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2
// PaymentIntent metadata: { tenantId: 'tenant_demo_002', paymentMethodDomainId: 'pmd_INVALID' }
// Expected: ❌ Request rejected with 403 Forbidden
```

### Test Case 4: Missing Metadata
```typescript
// Environment: NEXT_PUBLIC_TENANT_ID=tenant_demo_002
// PaymentIntent metadata: { } (no tenantId or paymentMethodDomainId)
// Expected: ⚠️ Warning logged, request proceeds (backward compatibility)
```

## Summary

**Frontend Filtering**: ✅ **COMPLETE**
- PaymentIntent metadata validation in `process/route.ts`
- Transaction creation validation in `ApiServerActions.ts`
- Transaction items validation in `ApiServerActions.ts`
- Webhook transaction validation in webhook `ApiServerActions.ts`

**Key Points**:
- ✅ All validation happens **BEFORE** backend calls
- ✅ Environment variables are **ALWAYS** used in payload (not metadata values)
- ✅ Mismatched requests are rejected with `403 Forbidden`
- ✅ All mismatches are logged for security monitoring

