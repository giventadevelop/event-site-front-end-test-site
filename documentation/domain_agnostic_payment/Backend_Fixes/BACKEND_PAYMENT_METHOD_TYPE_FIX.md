# Backend Fix: Extract Payment Method Type Instead of ID

## Problem

The `payment_method` field in `event_ticket_transaction` table is currently storing a **Stripe Payment Method ID** (e.g., `pm_1SXr2WK5BrggeAHMDfHuxpNL`) instead of a **payment method type** (e.g., `card`, `apple_pay`, `google_pay`).

## Current Behavior

```java
// ❌ WRONG: Storing Payment Method ID
ticketTransaction.setPaymentMethod(paymentIntent.getPaymentMethod());
// This stores: "pm_1SXr2WK5BrggeAHMDfHuxpNL"
```

## Expected Behavior

```java
// ✅ CORRECT: Store payment method type
ticketTransaction.setPaymentMethod("card");  // or "apple_pay", "google_pay", etc.
```

## Solution

Extract the payment method **type** from the Stripe Payment Intent object instead of storing the Payment Method ID.

### Implementation

In `TicketGenerationService.java` (or wherever `event_ticket_transaction` is created):

```java
// Extract payment method type from Payment Intent
String paymentMethodType = "card"; // Default fallback

// Option 1: Use payment_method_types array (simplest)
if (paymentIntent.getPaymentMethodTypes() != null &&
    !paymentIntent.getPaymentMethodTypes().isEmpty()) {
    paymentMethodType = paymentIntent.getPaymentMethodTypes().get(0);
}

// Option 2: Extract from charge details (more accurate, preferred)
if (paymentIntent.getCharges() != null &&
    !paymentIntent.getCharges().getData().isEmpty()) {
    Charge charge = paymentIntent.getCharges().getData().get(0);
    if (charge.getPaymentMethodDetails() != null) {
        String type = charge.getPaymentMethodDetails().getType();
        if (type != null && !type.isEmpty()) {
            paymentMethodType = type;
        }
    }
}

// Set the payment method type (not ID)
ticketTransaction.setPaymentMethod(paymentMethodType);
```

### Payment Method Type Values

Common values you'll see:
- `card` - Credit/debit card
- `apple_pay` - Apple Pay
- `google_pay` - Google Pay
- `link` - Stripe Link
- `us_bank_account` - US Bank Account (ACH)
- `sepa_debit` - SEPA Direct Debit

### If Payment Method ID is Needed

If you need to store the Payment Method ID for reference, add a separate field:

```java
// Store Payment Method ID separately (if needed)
if (paymentIntent.getPaymentMethod() != null) {
    ticketTransaction.setStripePaymentMethodId(paymentIntent.getPaymentMethod());
}
```

## Files to Update

1. **`TicketGenerationService.java`** - Extract payment method type when creating `EventTicketTransaction`
2. **`EventTicketTransaction.java`** (Entity) - Ensure `paymentMethod` field is VARCHAR(50) or similar (not VARCHAR(500) for IDs)
3. **Database Migration** (if needed) - Update column size if currently too large

## Testing

After implementing:
1. Process a payment with Apple Pay → Should store `apple_pay`
2. Process a payment with Google Pay → Should store `google_pay`
3. Process a payment with card → Should store `card`
4. Verify database shows type, not ID: `SELECT payment_method FROM event_ticket_transaction WHERE id = ?`

## Related Frontend Fix

The frontend webhook handler (`src/app/api/webhooks/stripe/route.ts`) will also be updated to send the correct payment method type, but the backend should extract it independently for reliability.





