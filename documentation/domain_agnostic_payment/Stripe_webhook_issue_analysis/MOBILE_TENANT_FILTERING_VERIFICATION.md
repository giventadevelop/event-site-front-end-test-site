# Mobile Payment Flow - Tenant ID Filtering Verification

## Summary

✅ **VERIFIED**: The mobile payment workflow (`/event/ticket-qr`) **DOES have tenant ID filtering**, but it's implemented at the **API route level** (`/api/event/success/process`), not in the client component. This is the correct architecture.

## Tenant ID Filtering Implementation

### ✅ POST Method - Has Filtering

**File**: `src/app/api/event/success/process/route.ts` (Lines 231-266)

**Implementation**:
```typescript
// CRITICAL: Extract tenantId and paymentMethodDomainId from PaymentIntent metadata
const metadataTenantId = metadata.tenantId || metadata.tenant_id;
const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;

// Get expected values from environment variables
const expectedTenantId = getTenantId();
const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

// CRITICAL: Validate metadata matches environment variables BEFORE making backend calls
if (metadataTenantId && metadataTenantId !== expectedTenantId) {
  console.error('[API POST CLIENT-CREATE] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
    metadataTenantId,
    expectedTenantId,
    paymentIntentId,
    timestamp: new Date().toISOString()
  });
  return NextResponse.json({
    transaction: null,
    error: 'Tenant ID mismatch',
    message: `Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`
  }, { status: 403 });
}

if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
  console.error('[API POST CLIENT-CREATE] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
    metadataPaymentMethodDomainId,
    expectedPaymentMethodDomainId,
    paymentIntentId,
    timestamp: new Date().toISOString()
  });
  return NextResponse.json({
    transaction: null,
    error: 'Payment Method Domain ID mismatch',
    message: `Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`
  }, { status: 403 });
}
```

**What This Does**:
- ✅ Extracts `tenantId` and `paymentMethodDomainId` from PaymentIntent metadata
- ✅ Compares against environment variables (`NEXT_PUBLIC_TENANT_ID` and `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`)
- ✅ **Rejects with 403 Forbidden** if metadata doesn't match environment variables
- ✅ **Prevents backend API call** if validation fails
- ✅ Only proceeds to `createTransactionFromPaymentIntent()` if validation passes

### ✅ createTransactionFromPaymentIntent() - Has Additional Filtering

**File**: `src/app/event/success/ApiServerActions.ts` (Lines 974-993)

**Implementation**:
```typescript
// CRITICAL: Validate metadata matches environment variables BEFORE making backend calls
if (metadataTenantId && metadataTenantId !== expectedTenantId) {
  console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
    metadataTenantId,
    expectedTenantId,
    paymentIntentId,
    timestamp: new Date().toISOString()
  });
  throw new Error(`Tenant ID mismatch: Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`);
}

if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
  console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
    metadataPaymentMethodDomainId,
    expectedPaymentMethodDomainId,
    paymentIntentId,
    timestamp: new Date().toISOString()
  });
  throw new Error(`Payment Method Domain ID mismatch: Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`);
}
```

**What This Does**:
- ✅ **Double validation** - validates again before creating transaction
- ✅ **Throws error** if validation fails (prevents transaction creation)
- ✅ Ensures environment variables are used, not metadata values

### ✅ createTransaction() - Has Additional Filtering

**File**: `src/app/event/success/ApiServerActions.ts` (Lines 148-168)

**Implementation**:
```typescript
// CRITICAL: Validate transactionData tenantId matches environment variable BEFORE backend call
const transactionTenantId = transactionData.tenantId;
if (transactionTenantId && transactionTenantId !== expectedTenantId) {
  console.error('[createTransaction] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
    transactionTenantId,
    expectedTenantId,
    timestamp: new Date().toISOString()
  });
  throw new Error(`Tenant ID mismatch: Transaction has tenantId=${transactionTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
}

// CRITICAL: Validate transactionData paymentMethodDomainId matches environment variable BEFORE backend call
const transactionPaymentMethodDomainId = transactionData.paymentMethodDomainId;
if (transactionPaymentMethodDomainId && transactionPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
  console.error('[createTransaction] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
    transactionPaymentMethodDomainId,
    expectedPaymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
  throw new Error(`Payment Method Domain ID mismatch: Transaction has paymentMethodDomainId=${transactionPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
}
```

**What This Does**:
- ✅ **Triple validation** - validates transaction data before sending to backend
- ✅ **Throws error** if validation fails
- ✅ Ensures payload uses environment variables, not transaction data values

### ❌ GET Method - No Filtering (But Safe)

**File**: `src/app/api/event/success/process/route.ts` (Lines 455-585)

**Implementation**:
- GET method only **looks up existing transactions**
- Does NOT create new transactions
- Does NOT validate tenant ID (relies on backend to filter by tenant ID in query)

**Why This Is Safe**:
- GET method uses `findTransactionByPaymentIntentId()` which includes `tenantId.equals` in query params
- Backend filters results by tenant ID automatically
- No new transactions are created, so no risk of wrong tenant ID

**Query Example**:
```typescript
const params = new URLSearchParams({
  'stripePaymentIntentId.equals': paymentIntentId,
  'tenantId.equals': tenantId,  // ✅ Backend filters by tenant ID
});
```

## Filtering Layers

The mobile workflow has **THREE layers of tenant ID filtering**:

### Layer 1: API Route POST Method (First Defense)
- **Location**: `/api/event/success/process` POST method
- **When**: Before retrieving PaymentIntent from Stripe
- **Action**: Returns 403 if metadata doesn't match environment variables
- **Prevents**: Backend API calls with wrong tenant ID

### Layer 2: createTransactionFromPaymentIntent() (Second Defense)
- **Location**: `ApiServerActions.ts` - `createTransactionFromPaymentIntent()`
- **When**: After retrieving PaymentIntent, before creating transaction data
- **Action**: Throws error if metadata doesn't match environment variables
- **Prevents**: Transaction data creation with wrong tenant ID

### Layer 3: createTransaction() (Third Defense)
- **Location**: `ApiServerActions.ts` - `createTransaction()`
- **When**: Before sending payload to backend
- **Action**: Throws error if transaction data doesn't match environment variables
- **Prevents**: Backend API calls with wrong tenant ID in payload

## Mobile Workflow Code Path with Filtering

```
TicketQrClient.tsx (Line 487)
  ↓
POST /api/event/success/process
  ↓
[LAYER 1] Extract metadata from PaymentIntent ✅
  ↓
[LAYER 1] Validate metadata vs environment variables ✅
  ↓
[LAYER 1] If mismatch → Return 403 Forbidden ✅
  ↓
[LAYER 1] If match → Call createTransactionFromPaymentIntent() ✅
  ↓
[LAYER 2] Validate metadata again ✅
  ↓
[LAYER 2] If mismatch → Throw error ✅
  ↓
[LAYER 2] If match → Create transaction data ✅
  ↓
[LAYER 2] Call createTransaction() ✅
  ↓
[LAYER 3] Validate transaction data ✅
  ↓
[LAYER 3] If mismatch → Throw error ✅
  ↓
[LAYER 3] If match → Build payload with environment variables ✅
  ↓
[LAYER 3] Send to backend ✅
```

## Conclusion

✅ **Tenant ID filtering IS implemented** in the mobile workflow:
- ✅ **API Route POST method** validates before creating transactions
- ✅ **createTransactionFromPaymentIntent()** validates before creating transaction data
- ✅ **createTransaction()** validates before sending to backend
- ✅ **Three layers of defense** prevent wrong tenant ID from reaching backend
- ✅ **GET method** is safe (only looks up existing transactions, backend filters by tenant ID)

The filtering is implemented at the **server-side API route level**, which is the correct architecture. The client component (`TicketQrClient.tsx`) doesn't need to filter because:
1. It's a client component (can't trust client-side filtering)
2. Server-side filtering is more secure
3. Multiple layers of validation ensure correctness

## What Happens If Wrong Tenant ID Detected

1. **API Route POST** (Layer 1):
   - Returns `403 Forbidden` with error message
   - `TicketQrClient.tsx` receives error response
   - User sees error message in UI

2. **createTransactionFromPaymentIntent()** (Layer 2):
   - Throws error
   - Error caught in API route try-catch
   - Returns `200 OK` with error message
   - `TicketQrClient.tsx` receives error response

3. **createTransaction()** (Layer 3):
   - Throws error
   - Error caught in `createTransactionFromPaymentIntent()` try-catch
   - Error propagated to API route
   - Returns error response to client

## References

- API Route: `src/app/api/event/success/process/route.ts` (Lines 231-266)
- Transaction Creation: `src/app/event/success/ApiServerActions.ts` (Lines 974-993, 148-168)
- Mobile Client: `src/app/event/ticket-qr/TicketQrClient.tsx` (Line 487)









