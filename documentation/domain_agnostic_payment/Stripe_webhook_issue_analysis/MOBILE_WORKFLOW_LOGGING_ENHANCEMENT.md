# Mobile Workflow Logging Enhancement - Production Debugging

## Problem

In production, mobile browser workflow is receiving:
- `tenantId='tenant_demo_001'` (wrong tenant - should be `tenant_demo_002`)
- `paymentMethodDomainId=null` (missing - should be `pmd_1SWrMSK5BrggeAHMmHxUd9F2`)

Desktop browser workflow works correctly with correct values.

**Backend Logs**:
```
tenantId: tenant_demo_001  // ❌ Wrong tenant
paymentMethodDomainId: null  // ❌ Missing
```

## Root Cause Analysis Needed

The issue could be:
1. **Environment variables not accessible** in mobile workflow code path
2. **Different code path** being executed (webhook vs success page)
3. **Webhook creating transaction first** with wrong values before success page
4. **Backend TenantContextFilter** using default tenant instead of DTO values

## Solution: Comprehensive Logging

Added extensive logging throughout the mobile workflow to trace:
1. Environment variable reading
2. Transaction data preparation
3. Payload construction
4. Backend API calls

### Logging Locations

#### 1. Entry Point - `createTransactionFromPaymentIntent()`

**Location**: `src/app/event/success/ApiServerActions.ts` line 916-932

**Logs Added**:
```typescript
console.log('[MOBILE-WORKFLOW] ============================================');
console.log('[MOBILE-WORKFLOW] createTransactionFromPaymentIntent CALLED');
console.log('[MOBILE-WORKFLOW] ============================================');
console.log('[MOBILE-WORKFLOW] Input parameters:', {
  paymentIntentId,
  eventId,
  customerEmail,
  cart,
  amountPaid,
  firstName,
  lastName,
  phone,
  timestamp: new Date().toISOString()
});
```

#### 2. Environment Variable Reading

**Location**: `src/app/event/success/ApiServerActions.ts` line 951-972

**Logs Added**:
```typescript
console.log('[MOBILE-WORKFLOW] Reading environment variables...');
console.log('[MOBILE-WORKFLOW] Environment variable check BEFORE reading:', {
  AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
  AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
  NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] ✅ Tenant ID retrieved from environment:', {
  tenantId: expectedTenantId,
  hasValue: !!expectedTenantId,
  length: expectedTenantId?.length,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] ✅ Payment Method Domain ID retrieved from environment:', {
  paymentMethodDomainId: expectedPaymentMethodDomainId,
  hasValue: !!expectedPaymentMethodDomainId,
  length: expectedPaymentMethodDomainId?.length,
  timestamp: new Date().toISOString()
});
```

#### 3. Transaction Data Preparation

**Location**: `src/app/event/success/ApiServerActions.ts` line 1124-1143

**Logs Added**:
```typescript
console.log('[MOBILE-WORKFLOW] Verifying withTenantId() helper...');
console.log('[MOBILE-WORKFLOW] withTenantId() helper returned:', {
  tenantIdFromHelper,
  expectedTenantId,
  match: tenantIdFromHelper === expectedTenantId,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] Verifying transactionData tenant ID:', {
  transactionDataTenantId: transactionData.tenantId,
  expectedTenantId,
  match: transactionData.tenantId === expectedTenantId,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] Verifying transactionData paymentMethodDomainId:', {
  transactionDataPaymentMethodDomainId: transactionData.paymentMethodDomainId,
  expectedPaymentMethodDomainId,
  hasValue: !!transactionData.paymentMethodDomainId,
  match: transactionData.paymentMethodDomainId === expectedPaymentMethodDomainId,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] Transaction data prepared BEFORE calling createTransaction():', {
  tenantId: transactionData.tenantId,
  paymentMethodDomainId: transactionData.paymentMethodDomainId,
  email: transactionData.email,
  stripePaymentIntentId: transactionData.stripePaymentIntentId,
  eventId: transactionData.eventId,
  totalAmount: transactionData.totalAmount,
  timestamp: new Date().toISOString()
});
```

#### 4. `createTransaction()` Function

**Location**: `src/app/event/success/ApiServerActions.ts` line 121-175

**Logs Added**:
```typescript
console.log('[MOBILE-WORKFLOW] [createTransaction] ============================================');
console.log('[MOBILE-WORKFLOW] [createTransaction] FUNCTION CALLED');
console.log('[MOBILE-WORKFLOW] [createTransaction] ============================================');
console.log('[MOBILE-WORKFLOW] [createTransaction] Input transactionData:', {
  tenantId: transactionData.tenantId,
  paymentMethodDomainId: transactionData.paymentMethodDomainId,
  email: transactionData.email,
  stripePaymentIntentId: transactionData.stripePaymentIntentId,
  eventId: transactionData.eventId,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] [createTransaction] Reading environment variables...');
console.log('[MOBILE-WORKFLOW] [createTransaction] Environment check BEFORE reading:', {
  AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
  AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
  NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] [createTransaction] Final payload built:', {
  tenantId: payload.tenantId,
  paymentMethodDomainId: payload.paymentMethodDomainId,
  email: payload.email,
  stripePaymentIntentId: payload.stripePaymentIntentId,
  eventId: payload.eventId,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] [createTransaction] Full payload being sent to backend:', JSON.stringify({
  tenantId: payload.tenantId,
  paymentMethodDomainId: payload.paymentMethodDomainId,
  email: payload.email,
  stripePaymentIntentId: payload.stripePaymentIntentId,
  eventId: payload.eventId,
  totalAmount: payload.totalAmount,
  status: payload.status,
}, null, 2));

console.log('[MOBILE-WORKFLOW] [createTransaction] Backend URL:', backendUrl);
console.log('[MOBILE-WORKFLOW] [createTransaction] About to call fetchWithJwtRetry...');

console.log('[MOBILE-WORKFLOW] [createTransaction] Response received:', {
  status: response.status,
  statusText: response.statusText,
  ok: response.ok,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] [createTransaction] ✅ Transaction created successfully, response:', {
  transactionId: result.id,
  tenantId: result.tenantId,
  paymentMethodDomainId: result.paymentMethodDomainId,
  timestamp: new Date().toISOString()
});
```

#### 5. `withTenantId()` Helper

**Location**: `src/lib/withTenantId.ts` line 10-15

**Logs Added**:
```typescript
export function withTenantId<T extends object>(dto: T): T & { tenantId: string } {
  const tenantId = getTenantId();
  console.log('[MOBILE-WORKFLOW] [withTenantId] Injecting tenantId:', {
    tenantId,
    hasValue: !!tenantId,
    length: tenantId?.length,
    timestamp: new Date().toISOString()
  });
  return {
    ...dto,
    tenantId: tenantId,
  };
}
```

#### 6. API Route Entry Point

**Location**: `src/app/api/event/success/process/route.ts` line 336-356

**Logs Added**:
```typescript
console.log('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] About to call createTransactionFromPaymentIntent:', {
  paymentIntentId,
  eventId,
  email,
  cartItemsCount: cart?.length || 0,
  amountTotal,
  firstName,
  lastName,
  customerPhone,
  timestamp: new Date().toISOString()
});

console.log('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] Cart items prepared:', cartItems);

console.log('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] ✅ Successfully created transaction:', {
  transactionId: createdTransaction.id,
  tenantId: createdTransaction.tenantId,
  paymentMethodDomainId: createdTransaction.paymentMethodDomainId,
  timestamp: new Date().toISOString()
});
```

## What to Look For in Production Logs

### Expected Log Flow

1. **Entry Point**:
   ```
   [MOBILE-WORKFLOW] ============================================
   [MOBILE-WORKFLOW] createTransactionFromPaymentIntent CALLED
   ```

2. **Environment Variables**:
   ```
   [MOBILE-WORKFLOW] Environment variable check BEFORE reading: {
     AMPLIFY_NEXT_PUBLIC_TENANT_ID: 'SET (tenant_demo_002...)',
     NEXT_PUBLIC_TENANT_ID: 'NOT SET',
     AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: 'SET (pmd_1SWrMSK5BrggeAH...)',
     NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: 'NOT SET'
   }
   ```

3. **Tenant ID Retrieved**:
   ```
   [MOBILE-WORKFLOW] ✅ Tenant ID retrieved from environment: {
     tenantId: 'tenant_demo_002',
     hasValue: true,
     length: 15
   }
   ```

4. **Payment Method Domain ID Retrieved**:
   ```
   [MOBILE-WORKFLOW] ✅ Payment Method Domain ID retrieved from environment: {
     paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
     hasValue: true,
     length: 28
   }
   ```

5. **Transaction Data Prepared**:
   ```
   [MOBILE-WORKFLOW] Transaction data prepared BEFORE calling createTransaction(): {
     tenantId: 'tenant_demo_002',
     paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
     ...
   }
   ```

6. **Payload Sent to Backend**:
   ```
   [MOBILE-WORKFLOW] [createTransaction] Full payload being sent to backend: {
     tenantId: 'tenant_demo_002',
     paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
     ...
   }
   ```

### Error Indicators

**If environment variables are NOT SET**:
```
[MOBILE-WORKFLOW] Environment variable check BEFORE reading: {
  AMPLIFY_NEXT_PUBLIC_TENANT_ID: 'NOT SET',
  NEXT_PUBLIC_TENANT_ID: 'NOT SET',
  ...
}
[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: getTenantId() failed
```

**If tenant ID mismatch**:
```
[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: transactionData has wrong tenant ID: {
  transactionDataTenantId: 'tenant_demo_001',
  expectedTenantId: 'tenant_demo_002'
}
```

**If paymentMethodDomainId missing**:
```
[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: transactionData missing paymentMethodDomainId: {
  transactionDataKeys: [...],
  expectedPaymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'
}
```

## Debugging Steps

1. **Check Amplify Logs** for `[MOBILE-WORKFLOW]` prefix
2. **Verify Environment Variables** are being read correctly
3. **Check Transaction Data** before calling `createTransaction()`
4. **Verify Payload** being sent to backend
5. **Check Backend Response** to see what was actually created

## Next Steps

After deploying with enhanced logging:
1. Test mobile payment flow in production
2. Check Amplify CloudWatch logs for `[MOBILE-WORKFLOW]` entries
3. Identify where the wrong values are being set
4. Fix the root cause based on log evidence

## References

- Mobile workflow entry: `src/app/api/event/success/process/route.ts`
- Transaction creation: `src/app/event/success/ApiServerActions.ts` - `createTransactionFromPaymentIntent()`
- Transaction helper: `src/app/event/success/ApiServerActions.ts` - `createTransaction()`
- Tenant ID helper: `src/lib/withTenantId.ts`
- Environment variables: `src/lib/env.ts`









