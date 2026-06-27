# Payment Method Field Explanation and Fix

## Problem Statement

The `payment_method` field in the `event_ticket_transaction` table is currently storing a **Stripe Payment Method ID** (e.g., `pm_1SXr2WK5BrggeAHMDfHuxpNL`) instead of a **payment method type** (e.g., `card`, `apple_pay`, `google_pay`, `bank_account`).

## What is `pm_` (Payment Method ID)?

The value `pm_1SXr2WK5BrggeAHMDfHuxpNL` is a **Stripe Payment Method ID**, not a payment method type. This is a unique identifier for a specific payment method object in Stripe's system.

### Stripe Payment Method Object Structure

```json
{
  "id": "pm_1SXr2WK5BrggeAHMDfHuxpNL",
  "object": "payment_method",
  "type": "card",  // ← This is what we want!
  "card": {
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2025
  },
  "created": 1234567890
}
```

### Key Fields in Stripe Payment Intent

When working with a Stripe Payment Intent (`pi_`), you have access to:

1. **`pi.payment_method`** (string): The Payment Method ID (e.g., `pm_1SXr2WK5BrggeAHMDfHuxpNL`)
   - This is a **reference** to a Payment Method object
   - Not human-readable
   - Used for API calls to retrieve the Payment Method details

2. **`pi.payment_method_types`** (array): List of payment method types (e.g., `["card"]`, `["card", "apple_pay"]`)
   - This tells you **what types** of payment methods were used
   - Values: `card`, `apple_pay`, `google_pay`, `link`, `us_bank_account`, etc.

3. **`pi.charges.data[0].payment_method_details.type`** (string): The actual payment method type used
   - This is the **most accurate** source for the payment method type
   - Available after the payment is completed
   - Values: `card`, `apple_pay`, `google_pay`, `link`, `us_bank_account`, etc.

## Current Implementation Issue

### Frontend Webhook Handler (`src/app/api/webhooks/stripe/route.ts`)

Currently, the webhook handler sets:
```typescript
paymentMethod: 'wallet',  // Hardcoded value (line 1470)
```

However, the backend is likely overriding this with:
```java
paymentMethod = pi.getPaymentMethod();  // This returns the Payment Method ID (pm_...)
```

### What Should Be Stored

The `payment_method` field should store the **payment method type**, not the ID:

- ✅ **Correct**: `card`, `apple_pay`, `google_pay`, `link`, `us_bank_account`, `wallet`
- ❌ **Incorrect**: `pm_1SXr2WK5BrggeAHMDfHuxpNL` (Payment Method ID)

## Solution: Extract Payment Method Type

### Option 1: Use `payment_method_types` Array (Simplest)

```typescript
// In webhook handler (src/app/api/webhooks/stripe/route.ts)
const paymentMethodType = pi.payment_method_types?.[0] || 'card';
// This gives us: 'card', 'apple_pay', 'google_pay', etc.

paymentMethod: paymentMethodType,  // Instead of 'wallet' or pi.payment_method
```

### Option 2: Extract from Charge Details (Most Accurate)

```typescript
// In webhook handler, after payment succeeds
let paymentMethodType = 'card'; // Default fallback

if (pi.charges && pi.charges.data && pi.charges.data.length > 0) {
  const charge = pi.charges.data[0];
  if (charge.payment_method_details) {
    paymentMethodType = charge.payment_method_details.type || 'card';
  }
}

paymentMethod: paymentMethodType,
```

### Option 3: Retrieve Payment Method Object (Most Complete)

```typescript
// If you need full details (brand, last4, etc.)
if (pi.payment_method) {
  const pm = await stripe().paymentMethods.retrieve(pi.payment_method);
  const paymentMethodType = pm.type; // 'card', 'apple_pay', etc.

  paymentMethod: paymentMethodType,
  // Optionally store additional details:
  // paymentMethodBrand: pm.card?.brand,
  // paymentMethodLast4: pm.card?.last4,
}
```

## Backend Fix Required

The backend should also extract the payment method type instead of storing the Payment Method ID.

### Current Backend Code (Likely)

```java
// ❌ WRONG: Storing Payment Method ID
ticketTransaction.setPaymentMethod(paymentIntent.getPaymentMethod());
```

### Correct Backend Code

```java
// ✅ CORRECT: Extract payment method type
String paymentMethodType = "card"; // Default fallback

// Option 1: Use payment_method_types array
if (paymentIntent.getPaymentMethodTypes() != null &&
    !paymentIntent.getPaymentMethodTypes().isEmpty()) {
    paymentMethodType = paymentIntent.getPaymentMethodTypes().get(0);
}

// Option 2: Extract from charge details (more accurate)
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

ticketTransaction.setPaymentMethod(paymentMethodType);
```

## Payment Method Type Values

Common Stripe payment method types:

| Type | Description | Example |
|------|-------------|---------|
| `card` | Credit/debit card | Visa, Mastercard, Amex |
| `apple_pay` | Apple Pay | Mobile wallet |
| `google_pay` | Google Pay | Mobile wallet |
| `link` | Stripe Link | Saved payment method |
| `us_bank_account` | US Bank Account | ACH transfer |
| `sepa_debit` | SEPA Direct Debit | European bank transfer |
| `ideal` | iDEAL | Dutch payment method |
| `sofort` | SOFORT | German payment method |

## Database Schema Consideration

The `payment_method` column in `event_ticket_transaction` should be:

```sql
payment_method VARCHAR(50)  -- Store type: 'card', 'apple_pay', etc.
```

**NOT**:
```sql
payment_method VARCHAR(500)  -- Don't store Payment Method IDs here
```

If you need to store the Payment Method ID for reference, consider adding a separate column:
```sql
stripe_payment_method_id VARCHAR(255)  -- Store pm_... here
```

## Recommended Implementation

### Frontend Webhook Handler Fix

```typescript
// src/app/api/webhooks/stripe/route.ts (around line 1470)

// Extract payment method type from Payment Intent
let paymentMethodType = 'card'; // Default fallback

// Option 1: Use payment_method_types array (simplest)
if (pi.payment_method_types && pi.payment_method_types.length > 0) {
  paymentMethodType = pi.payment_method_types[0];
}

// Option 2: Extract from charge details (more accurate, if available)
if (pi.charges && pi.charges.data && pi.charges.data.length > 0) {
  const charge = pi.charges.data[0];
  if (charge.payment_method_details && charge.payment_method_details.type) {
    paymentMethodType = charge.payment_method_details.type;
  }
}

// Use the extracted type
const txPayload: Omit<EventTicketTransactionDTO, 'id'> = {
  // ... other fields ...
  paymentMethod: paymentMethodType,  // 'card', 'apple_pay', etc.
  paymentReference: pi.id,
  // ... rest of fields ...
};
```

### Backend Fix Prompt

See `BACKEND_PAYMENT_METHOD_TYPE_FIX.md` for a concise prompt for the backend team.

## Summary

- **Current Issue**: `payment_method` field stores Payment Method ID (`pm_...`) instead of type (`card`, `apple_pay`, etc.)
- **Root Cause**: Backend is storing `pi.payment_method` (ID) instead of extracting the type
- **Solution**: Extract payment method type from `pi.payment_method_types[0]` or `charge.payment_method_details.type`
- **Database**: Should store human-readable types, not IDs
- **Reference**: If Payment Method ID is needed, store it in a separate field like `stripe_payment_method_id`





