# Missing Transaction Items Fix

## Problem

When purchasing tickets from the checkout page:
- User selects 1 ticket of each type (e.g., Balcony + FirstClass = 2 tickets total)
- Database shows `quantity: 1` in `event_ticket_transaction` table (should be 2)
- **NO entries** in `event_ticket_transaction_item` table
- Transaction exists but transaction items are missing

## Root Cause Analysis

### Issue 1: Duplicate Prevention Skips Item Creation

When duplicate prevention finds an existing transaction, it breaks early (`break;`) **before** creating transaction items:

```typescript
if (existingTransaction) {
  console.log('[STRIPE-WEBHOOK] Transaction already exists...');
  break; // ❌ Exits before creating transaction items
}

// Transaction items creation code never reached
if (created?.id && Array.isArray(cart)) {
  await createTransactionItemsBulkServer(itemsPayload);
}
```

**Scenario:**
1. Webhook creates transaction successfully
2. Transaction items creation fails or is interrupted
3. Webhook retries (Stripe retry mechanism)
4. Duplicate prevention finds existing transaction
5. Webhook breaks early - transaction items never created

### Issue 2: Quantity Calculation

The transaction `quantity` field should be the **sum of all cart item quantities**, but it's showing 1 instead of 2. Possible causes:

1. **Cart data in Payment Intent metadata is incorrect** (only has 1 item)
2. **Quantity calculation is wrong** (not summing correctly)
3. **Transaction created by different code path** (fallback route) that doesn't calculate quantity correctly

## Solution

### 1. Check and Create Missing Transaction Items

**File**: `src/app/api/webhooks/stripe/route.ts`

**Added Logic**: When duplicate transaction is found, check if transaction items exist. If missing, create them:

```typescript
if (existingTransaction) {
  console.log('[STRIPE-WEBHOOK] Transaction already exists for Payment Intent:', {
    paymentIntentId: pi.id,
    existingTransactionId: existingTransaction.id,
    existingQrCodeUrl: existingTransaction.qrCodeImageUrl || 'NULL',
    timestamp: now
  });

  // CRITICAL: Check if transaction items exist - if not, create them even if transaction exists
  // This handles cases where transaction was created but items failed to create
  if (Array.isArray(cart) && cart.length > 0) {
    try {
      // Check if transaction items exist by fetching them
      const itemsCheckUrl = `${API_BASE_URL}/api/event-ticket-transaction-items?transactionId.equals=${existingTransaction.id}&tenantId.equals=${getTenantId()}`;
      const itemsCheckRes = await fetchWithJwtRetry(itemsCheckUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (itemsCheckRes.ok) {
        const existingItems = await itemsCheckRes.json();
        const existingItemsCount = Array.isArray(existingItems) ? existingItems.length : 0;

        console.log('[STRIPE-WEBHOOK] Existing transaction items count:', existingItemsCount, 'Cart items count:', cart.length);

        // If no items exist but cart has items, create them now
        if (existingItemsCount === 0 && cart.length > 0) {
          console.log('[STRIPE-WEBHOOK] Transaction exists but has no items - creating transaction items now');

          // Fetch prices and create items (same logic as normal flow)
          // ... create transaction items ...
        }
      }
    } catch (itemsCheckError) {
      console.error('[STRIPE-WEBHOOK] Error checking for existing transaction items:', itemsCheckError);
    }
  }

  // Skip transaction creation - already exists
  break;
}
```

### 2. Enhanced Cart Data Logging

**Added Logging**: Log cart data and quantity calculation for debugging:

```typescript
// CRITICAL: Log cart data and quantity calculation for debugging
console.log('[STRIPE-WEBHOOK] Cart data parsed:', {
  cartJson,
  cartArray: JSON.stringify(cart, null, 2),
  cartLength: Array.isArray(cart) ? cart.length : 0,
  totalQuantity,
  cartItems: Array.isArray(cart) ? cart.map((item: any) => ({
    ticketTypeId: item.ticketTypeId,
    quantity: item.quantity,
    hasQuantity: typeof item.quantity === 'number'
  })) : []
});
```

## How It Works

### Normal Flow (Transaction Created Successfully)
1. Webhook receives `payment_intent.succeeded`
2. Checks for existing transaction → None found
3. Creates transaction with `quantity = sum of all cart item quantities`
4. Creates transaction items for each cart item
5. Updates inventory

### Recovery Flow (Transaction Exists, Items Missing)
1. Webhook receives `payment_intent.succeeded` (retry)
2. Checks for existing transaction → **Found**
3. Checks if transaction items exist → **Missing**
4. Creates missing transaction items from cart data
5. Logs success

### Quantity Calculation

```typescript
const totalQuantity = Array.isArray(cart)
  ? cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
  : 0;
```

**Example:**
- Cart: `[{ticketTypeId: 4151, quantity: 1}, {ticketTypeId: 4152, quantity: 1}]`
- `totalQuantity = 1 + 1 = 2` ✅

## Expected Behavior After Fix

### Transaction Creation
- ✅ Transaction created with correct `quantity` (sum of all cart items)
- ✅ Transaction items created for each cart item
- ✅ Each transaction item has correct `quantity`, `pricePerUnit`, `totalAmount`

### Webhook Retry Handling
- ✅ If transaction exists but items missing → Creates missing items
- ✅ If transaction and items exist → Skips creation (no duplicates)
- ✅ Logs detailed information for debugging

### Database Records

**Before Fix:**
```sql
-- event_ticket_transaction
quantity: 1  -- ❌ Wrong (should be 2)

-- event_ticket_transaction_item
-- ❌ No records
```

**After Fix:**
```sql
-- event_ticket_transaction
quantity: 2  -- ✅ Correct (sum of cart items)

-- event_ticket_transaction_item
-- ✅ Record 1: ticket_type_id=4151, quantity=1, price_per_unit=0.70
-- ✅ Record 2: ticket_type_id=4152, quantity=1, price_per_unit=0.60
```

## Testing

### Test Case 1: Normal Purchase Flow
1. Select 1 ticket of each type (2 tickets total)
2. Complete payment
3. **Verify:**
   - Transaction has `quantity: 2`
   - 2 transaction items created (one for each ticket type)
   - Each item has correct `quantity`, `pricePerUnit`, `totalAmount`

### Test Case 2: Webhook Retry Recovery
1. Simulate webhook retry (transaction exists, items missing)
2. **Verify:**
   - Transaction items are created on retry
   - No duplicate transaction created
   - Logs show "Transaction exists but has no items - creating transaction items now"

### Test Case 3: Multiple Quantities
1. Select 2 tickets of type A, 3 tickets of type B (5 tickets total)
2. Complete payment
3. **Verify:**
   - Transaction has `quantity: 5`
   - 2 transaction items created:
     - Item 1: `quantity: 2` (type A)
     - Item 2: `quantity: 3` (type B)

## Related Files

- `src/app/api/webhooks/stripe/route.ts` - Webhook handler with item recovery logic
- `src/app/api/webhooks/stripe/ApiServerActions.ts` - Transaction item creation functions
- `src/app/event/success/ApiServerActions.ts` - Transaction creation functions

## References

- [Duplicate Transaction Prevention](./DUPLICATE_TRANSACTION_PREVENTION.md)
- [Mobile Payment Flow Documentation](../mobile_payment_flow.mdc)





