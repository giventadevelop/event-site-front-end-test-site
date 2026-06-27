# Backend Fix: Store Email in Payment Transaction Metadata

## Problem

The email entered in the checkout page is not being stored in the payment transaction metadata, causing ticket generation to fail with:

```
[WARN] No email found in payment transaction 5101 metadata
[WARN] No email found for payment transaction 5101, cannot send ticket email
[ERROR] ConstraintViolationException: Validation failed... email must not be null
```

**Root Cause:** When creating a `UserPaymentTransaction`, the backend is not storing the `customerEmail` from the payment initialization request in the transaction metadata.

---

## Solution

The backend must store the email in the payment transaction metadata when creating the transaction. This ensures the email is available during ticket generation.

---

## Required Backend Changes

### 1. Payment Initialization Endpoint (`PaymentResource.initializePayment()`)

**File:** `src/main/java/com/nextjstemplate/web/rest/PaymentResource.java`

**Find the method that handles payment initialization** (likely `initializePayment()` or `createPayment()`)

**Current Code Pattern:**
```java
@PostMapping("/payments/initialize")
public ResponseEntity<PaymentSessionResponse> initializePayment(
    @RequestBody PaymentInitializeRequest request
) {
    // ... create payment transaction ...
    UserPaymentTransaction transaction = new UserPaymentTransaction();
    transaction.setAmount(request.getAmount());
    transaction.setEvent(event);
    // ... other fields ...

    // ❌ MISSING: Email is not stored in metadata
    transactionRepository.save(transaction);

    return ResponseEntity.ok(response);
}
```

**Fix:**
```java
@PostMapping("/payments/initialize")
public ResponseEntity<PaymentSessionResponse> initializePayment(
    @RequestBody PaymentInitializeRequest request
) {
    // ... create payment transaction ...
    UserPaymentTransaction transaction = new UserPaymentTransaction();
    transaction.setAmount(request.getAmount());
    transaction.setEvent(event);
    // ... other fields ...

    // ✅ CRITICAL: Store customer email in transaction metadata
    if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("email", request.getCustomerEmail());
            metadata.put("customerEmail", request.getCustomerEmail());

            // Also store customer name and phone if available
            if (request.getCustomerName() != null && !request.getCustomerName().isEmpty()) {
                metadata.put("customerName", request.getCustomerName());
            }
            if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
                metadata.put("customerPhone", request.getCustomerPhone());
            }

            ObjectMapper objectMapper = new ObjectMapper();
            transaction.setMetadata(objectMapper.writeValueAsString(metadata));

            log.info("Stored customer email {} in payment transaction metadata during initialization", request.getCustomerEmail());
        } catch (Exception e) {
            log.warn("Failed to store customer email in transaction metadata during initialization: {}", e.getMessage());
            // Continue even if metadata storage fails - email can be extracted from Stripe later
        }
    } else {
        log.warn("Payment initialization request missing customerEmail - email may not be available for ticket generation");
    }

    transactionRepository.save(transaction);

    return ResponseEntity.ok(response);
}
```

---

### 2. Payment Session Creation (Stripe Checkout Session)

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Find the method that creates Stripe checkout sessions** (likely `initializePayment()` or `createCheckoutSession()`)

**Ensure email is passed to Stripe AND stored in transaction:**

```java
public PaymentSessionResponse initializePayment(PaymentInitializeRequest request, PaymentProviderConfig config) {
    // ... create Stripe checkout session ...

    Map<String, String> sessionMetadata = new HashMap<>();
    sessionMetadata.put("eventId", String.valueOf(request.getEventId()));
    sessionMetadata.put("customerEmail", request.getCustomerEmail()); // ✅ Store in Stripe metadata

    // ... other metadata ...

    SessionCreateParams params = SessionCreateParams.builder()
        .customerEmail(request.getCustomerEmail()) // ✅ Set customer email in Stripe
        .metadata(sessionMetadata)
        // ... other params ...
        .build();

    Session session = Session.create(params);

    // ✅ CRITICAL: Store email in transaction metadata BEFORE saving
    UserPaymentTransaction transaction = new UserPaymentTransaction();
    // ... set other fields ...

    if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
        try {
            Map<String, Object> transactionMetadata = new HashMap<>();
            transactionMetadata.put("email", request.getCustomerEmail());
            transactionMetadata.put("customerEmail", request.getCustomerEmail());

            if (request.getCustomerName() != null && !request.getCustomerName().isEmpty()) {
                transactionMetadata.put("customerName", request.getCustomerName());
            }
            if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
                transactionMetadata.put("customerPhone", request.getCustomerPhone());
            }

            ObjectMapper objectMapper = new ObjectMapper();
            transaction.setMetadata(objectMapper.writeValueAsString(transactionMetadata));

            log.info("Stored customer email {} in transaction {} metadata during Stripe session creation",
                request.getCustomerEmail(), transaction.getId());
        } catch (Exception e) {
            log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
        }
    }

    transactionRepository.save(transaction);

    return response;
}
```

---

### 3. Payment Intent Creation (Mobile/Wallet Payments)

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Find the method that creates Payment Intents** (likely `createPaymentIntent()` or similar)

**Ensure email is stored:**

```java
public PaymentSessionResponse createPaymentIntent(PaymentInitializeRequest request, PaymentProviderConfig config) {
    // ... create Stripe payment intent ...

    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        .amount(amountCents)
        .currency("usd")
        .receiptEmail(request.getCustomerEmail()) // ✅ Set receipt email in Stripe
        .metadata(Map.of(
            "eventId", String.valueOf(request.getEventId()),
            "customerEmail", request.getCustomerEmail() // ✅ Store in Stripe metadata
        ))
        // ... other params ...
        .build();

    PaymentIntent paymentIntent = PaymentIntent.create(params);

    // ✅ CRITICAL: Store email in transaction metadata
    UserPaymentTransaction transaction = new UserPaymentTransaction();
    // ... set other fields ...

    if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("email", request.getCustomerEmail());
            metadata.put("customerEmail", request.getCustomerEmail());

            if (request.getCustomerName() != null && !request.getCustomerName().isEmpty()) {
                metadata.put("customerName", request.getCustomerName());
            }
            if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
                metadata.put("customerPhone", request.getCustomerPhone());
            }

            ObjectMapper objectMapper = new ObjectMapper();
            transaction.setMetadata(objectMapper.writeValueAsString(metadata));

            log.info("Stored customer email {} in transaction {} metadata during PaymentIntent creation",
                request.getCustomerEmail(), transaction.getId());
        } catch (Exception e) {
            log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
        }
    }

    transactionRepository.save(transaction);

    return response;
}
```

---

## Verification

After implementing these changes:

1. **Make a test payment** through the checkout page
2. **Check database:**
   ```sql
   SELECT id, metadata FROM user_payment_transaction
   WHERE id = {PAYMENT_ID};
   ```
   - Metadata should contain `{"email": "...", "customerEmail": "..."}`

3. **Check backend logs:**
   ```
   [INFO] Stored customer email {EMAIL} in transaction {ID} metadata during initialization
   ```

4. **Verify ticket generation:**
   ```
   [INFO] Ticket email sent for transaction {TICKET_ID} to {EMAIL}
   ```
   - Should NOT see: "No email found in payment transaction metadata"

---

## Frontend Already Sends Email

The frontend is already sending the email correctly:

1. **Checkout Page** (`src/app/events/[id]/checkout/page.tsx`):
   - Collects email from user input
   - Passes to `UniversalPaymentCheckout` component

2. **UniversalPaymentCheckout** (`src/components/UniversalPaymentCheckout.tsx`):
   - Includes `customerEmail: email` in `PaymentInitializeRequest`

3. **Payment Intent API** (`src/app/api/stripe/payment-intent/route.ts`):
   - Sets `receipt_email: email` in Stripe PaymentIntent
   - Includes `customerEmail: email` in metadata

**The issue is purely backend - the email needs to be stored in the transaction metadata when the transaction is created.**

---

## Summary

**Problem:** Email from checkout page is not stored in payment transaction metadata.

**Solution:** Store `customerEmail` from `PaymentInitializeRequest` in transaction metadata when creating the transaction.

**Location:** Payment initialization endpoints in `PaymentResource` and `StripePaymentAdapter`.

**Priority:** HIGH - Required for ticket generation to work.

