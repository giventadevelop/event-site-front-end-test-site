# Duplicate Transaction Prevention Fix

## Problem

Duplicate `event_ticket_transaction` records were being created for the same Payment Intent ID:
- Two records with the same `stripe_payment_intent_id` (`pi_3SXa51K5BrggeAHM1VTv9dw0`)
- Different `tenant_id` values (`tenant_demo_001` vs `tenant_demo_002`)
- One record has `qr_code_image_url` as NULL, one has a URL
- Different `created_at` timestamps (170ms difference)

## Root Cause Analysis

### Where Transactions Are Created

1. **Stripe Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`):
   - Handles `payment_intent.succeeded` events
   - Creates transaction at line 1342
   - **NO duplicate check before creation**

2. **Success Process Route Fallback** (`src/app/api/event/success/process/route.ts`):
   - Fallback when webhook fails or session not found
   - Creates transaction at line 235
   - **NO duplicate check before creation**

3. **Direct Payment Intent Creation** (`src/app/event/success/ApiServerActions.ts`):
   - `createTransactionFromPaymentIntent` function
   - Called by fallback route
   - **NO duplicate check before creation**

### Why Duplicates Occur

**Scenario 1: Webhook + Fallback Race Condition**
1. Payment succeeds → Stripe sends webhook
2. Webhook creates transaction (no QR code yet)
3. User navigates to success page → Fallback route checks for transaction
4. Transaction exists but QR code is NULL
5. Fallback route doesn't find transaction (race condition or tenant mismatch)
6. Fallback creates duplicate transaction

**Scenario 2: Multiple Webhook Deliveries**
1. Stripe sends webhook multiple times (retry mechanism)
2. Each webhook delivery creates a new transaction
3. No duplicate prevention logic

**Scenario 3: QR Code Generation Retry**
1. Transaction created without QR code
2. QR code generation fails or is delayed
3. Retry mechanism creates new transaction instead of updating existing

### Database Schema Issue

**No Unique Constraint:**
- Database schema has NO unique constraint on `stripe_payment_intent_id` + `tenant_id`
- Multiple transactions can exist for the same Payment Intent ID
- Different tenants can have separate transactions (intended behavior)
- Same tenant can have duplicates (unintended behavior)

## Solution

### 1. Webhook Handler Duplicate Prevention

**File**: `src/app/api/webhooks/stripe/route.ts`

**Added Check Before Creation:**
```typescript
// CRITICAL: Check if transaction already exists before creating (prevent duplicates)
const { findTransactionByPaymentIntentId } = await import('@/app/event/success/ApiServerActions');
const existingTransaction = await findTransactionByPaymentIntentId(pi.id);

if (existingTransaction) {
  console.log('[STRIPE-WEBHOOK] Transaction already exists for Payment Intent:', {
    paymentIntentId: pi.id,
    existingTransactionId: existingTransaction.id,
    existingQrCodeUrl: existingTransaction.qrCodeImageUrl || 'NULL',
    timestamp: now
  });

  // If QR code is missing, we might want to trigger QR generation, but don't create duplicate transaction
  if (!existingTransaction.qrCodeImageUrl) {
    console.log('[STRIPE-WEBHOOK] Existing transaction has no QR code URL - QR generation should happen separately');
  }

  // Skip transaction creation - already exists
  break;
}
```

### 2. Success Process Route Fallback Duplicate Prevention

**File**: `src/app/api/event/success/process/route.ts`

**Added Check Before Fallback Creation:**
```typescript
// CRITICAL: Check if transaction already exists before creating (prevent duplicates)
const { findTransactionByPaymentIntentId } = await import('@/app/event/success/ApiServerActions');
const existingTransaction = await findTransactionByPaymentIntentId(paymentIntentId);

if (existingTransaction) {
  console.log('[API POST FALLBACK] Transaction already exists for Payment Intent:', {
    paymentIntentId,
    existingTransactionId: existingTransaction.id,
    existingQrCodeUrl: existingTransaction.qrCodeImageUrl || 'NULL',
    timestamp: new Date().toISOString()
  });

  // Use existing transaction instead of creating duplicate
  result = { transaction: existingTransaction, userProfile: null };
} else {
  // No existing transaction, proceed with creation
  // ... existing creation logic ...
}
```

### 3. Direct Payment Intent Creation Duplicate Prevention

**File**: `src/app/event/success/ApiServerActions.ts`

**Added Check at Function Start:**
```typescript
export async function createTransactionFromPaymentIntent(
  paymentIntentId: string,
  eventId: number,
  customerEmail: string,
  cart: { ticketTypeId: number; quantity: number }[],
  amountPaid: number
): Promise<EventTicketTransactionDTO> {
  // CRITICAL: Check if transaction already exists before creating (prevent duplicates)
  const existingTransaction = await findTransactionByPaymentIntentId(paymentIntentId);
  if (existingTransaction) {
    console.log('[createTransactionFromPaymentIntent] Transaction already exists for Payment Intent:', {
      paymentIntentId,
      existingTransactionId: existingTransaction.id,
      existingQrCodeUrl: existingTransaction.qrCodeImageUrl || 'NULL',
      timestamp: new Date().toISOString()
    });

    // Return existing transaction instead of creating duplicate
    return existingTransaction;
  }

  // ... rest of creation logic ...
}
```

## How It Works

### Transaction Lookup Function

**File**: `src/app/event/success/ApiServerActions.ts`

```typescript
export async function findTransactionByPaymentIntentId(
  paymentIntentId: string,
): Promise<EventTicketTransactionDTO | null> {
  const tenantId = getTenantId();
  const params = new URLSearchParams({
    'stripePaymentIntentId.equals': paymentIntentId,
    'tenantId.equals': tenantId,
  });
  const response = await fetchWithJwtRetry(
    `${getAppUrl()}/api/proxy/event-ticket-transactions?${params.toString()}`,
  );
  if (!response.ok) return null;
  const items: EventTicketTransactionDTO[] = await response.json();
  return items.length > 0 ? items[0] : null;
}
```

**Key Points:**
- Uses `tenantId` filter to ensure tenant isolation
- Returns first matching transaction (should be only one)
- Returns `null` if no transaction found

## Expected Behavior After Fix

### Webhook Handler
- ✅ Checks for existing transaction before creating
- ✅ Skips creation if transaction exists
- ✅ Logs existing transaction details (including QR code status)
- ✅ Prevents duplicate creation on webhook retries

### Success Process Route
- ✅ Checks for existing transaction before fallback creation
- ✅ Uses existing transaction if found
- ✅ Only creates new transaction if none exists
- ✅ Prevents race condition duplicates

### Direct Payment Intent Creation
- ✅ Checks for existing transaction at function start
- ✅ Returns existing transaction if found
- ✅ Only creates new transaction if none exists
- ✅ Prevents duplicate creation from multiple callers

## QR Code Generation Handling

### Current Behavior
- Transaction created without QR code initially
- QR code generated separately (via `/api/event/ticket-qr` endpoint)
- QR code URL updated in transaction record

### After Fix
- If transaction exists but QR code is NULL:
  - Webhook handler: Logs warning, skips creation
  - Success route: Uses existing transaction, QR generation happens separately
  - No duplicate transaction created

### QR Code Generation Flow
1. Transaction created (webhook or fallback)
2. User navigates to `/event/ticket-qr?pi=pi_xxx`
3. QR page calls `/api/event/success/process?pi=pi_xxx&skip_qr=true`
4. Route finds existing transaction (no duplicate created)
5. QR code generated separately via QR endpoint
6. QR code URL updated in existing transaction

## Database Considerations

### Current Schema
- **NO unique constraint** on `stripe_payment_intent_id` + `tenant_id`
- Multiple transactions possible for same Payment Intent ID
- Different tenants can have separate transactions (intended)
- Same tenant can have duplicates (unintended - now prevented by code)

### Future Enhancement (Optional)
Consider adding unique constraint at database level:
```sql
ALTER TABLE event_ticket_transaction
ADD CONSTRAINT ux_event_ticket_transaction_payment_intent_tenant
UNIQUE (stripe_payment_intent_id, tenant_id)
WHERE stripe_payment_intent_id IS NOT NULL;
```

**Note**: This would prevent duplicates at database level, but code-level prevention is sufficient and more flexible.

## Testing

### Test Cases

1. **Webhook Retry Prevention**:
   - Send same webhook event twice
   - Verify only one transaction created
   - Check logs for "Transaction already exists" message

2. **Fallback Route Prevention**:
   - Create transaction via webhook
   - Call fallback route with same Payment Intent ID
   - Verify existing transaction returned (no duplicate)

3. **QR Code NULL Handling**:
   - Create transaction without QR code
   - Call fallback route
   - Verify existing transaction returned (no duplicate)
   - Verify QR code generation happens separately

4. **Tenant Isolation**:
   - Create transaction for tenant A
   - Call route for tenant B with same Payment Intent ID
   - Verify tenant B can create separate transaction (if needed)

## Related Files

- `src/app/api/webhooks/stripe/route.ts` - Webhook handler with duplicate prevention
- `src/app/api/event/success/process/route.ts` - Success route with duplicate prevention
- `src/app/event/success/ApiServerActions.ts` - Transaction creation functions with duplicate prevention
- `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql` - Database schema

## References

- [Mobile Payment Flow Documentation](./mobile_payment_flow.mdc)
- [Stripe Webhook Signature Fix](./STRIPE_WEBHOOK_SIGNATURE_FIX.md)
- [Mobile QR Page Stuck Fix](./MOBILE_QR_PAGE_STUCK_FIX.md)





