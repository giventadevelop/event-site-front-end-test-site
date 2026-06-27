# URGENT: Backend Must Return stripePaymentIntentId in Payment Status Response

## Problem

The frontend **cannot poll for ticket transactions** because the backend is **not returning the `stripePaymentIntentId`** field in the payment status response from `/api/payments/{id}`.

### Evidence from Frontend Logs

```
[PaymentSuccessClient] Cannot poll for ticket - no Stripe payment intent ID available {}
  metadata: undefined
  paymentReference: undefined
```

### Evidence from Backend Logs

```
2025-11-15T13:36:56.904 c.n.s.p.adapter.StripePaymentAdapter : Using Stripe payment intent ID: pi_3SToKyK5BrggeAHM1arNAhzE for transaction: 5717
```

**The backend HAS the payment intent ID internally** (stored in `user_payment_transaction.stripe_payment_intent_id`), but **it's not being returned** in the API response.

---

## Root Cause

The `PaymentResource.getPaymentStatus()` method or `StripePaymentAdapter.getStatus()` method is not including the `stripe_payment_intent_id` field in the `PaymentStatusResponse` DTO.

---

## Required Backend Fix

### 1. Update PaymentStatusResponse DTO

**File:** `src/main/java/com/nextjstemplate/service/payment/dto/PaymentStatusResponse.java`

Ensure this DTO has the `stripePaymentIntentId` field:

```java
public class PaymentStatusResponse {
    private String transactionId;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String paymentReference;
    private Long eventId;
    private Map<String, Object> metadata;

    // CRITICAL: Add this field
    private String stripePaymentIntentId;

    // CRITICAL: Also add ticket-related fields for future optimization
    private Long ticketTransactionId;
    private String qrCodeUrl;
    private Boolean emailSent;

    // Getters and setters...
}
```

### 2. Update StripePaymentAdapter.getStatus()

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

In the `getStatus()` method, populate the `stripePaymentIntentId` field:

```java
@Override
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    log.debug("Getting Stripe payment status for internal transaction ID: {}", transactionId);

    // Find payment transaction
    Optional<UserPaymentTransaction> transactionOpt = userPaymentTransactionRepository.findById(transactionId);
    if (!transactionOpt.isPresent()) {
        log.error("Payment transaction not found: {}", transactionId);
        throw new IllegalArgumentException("Payment transaction not found: " + transactionId);
    }

    UserPaymentTransaction transaction = transactionOpt.get();
    log.debug("Found transaction {} for tenant: {}", transactionId, transaction.getTenantId());

    String stripePaymentIntentId = transaction.getStripePaymentIntentId();
    if (stripePaymentIntentId == null || stripePaymentIntentId.isEmpty()) {
        log.error("Transaction {} does not have a Stripe payment intent ID", transactionId);
        throw new IllegalArgumentException("Transaction " + transactionId + " does not have a Stripe payment intent ID");
    }

    log.debug("Using Stripe payment intent ID: {} for transaction: {}", stripePaymentIntentId, transactionId);

    // Retrieve payment intent from Stripe
    Stripe.apiKey = config.getSecretKey();
    PaymentIntent paymentIntent;
    try {
        paymentIntent = PaymentIntent.retrieve(stripePaymentIntentId);
        log.debug("Retrieved Stripe payment intent {} with status: {}", stripePaymentIntentId, paymentIntent.getStatus());
    } catch (StripeException e) {
        log.error("Failed to retrieve Stripe payment intent {}: {}", stripePaymentIntentId, e.getMessage());
        throw new RuntimeException("Failed to retrieve payment status from Stripe", e);
    }

    // Map Stripe status to our status enum
    String stripeStatus = paymentIntent.getStatus();
    String mappedStatus = mapStripeStatus(stripeStatus);

    // Extract customer email from payment intent
    String customerEmail = extractCustomerEmail(paymentIntent);

    // Update transaction if status changed
    if (!mappedStatus.equals(transaction.getStatus())) {
        // Store customer email in metadata if available
        if (customerEmail != null && !customerEmail.isEmpty()) {
            Map<String, Object> metadata = transaction.getMetadata() != null ?
                new HashMap<>(transaction.getMetadata()) : new HashMap<>();
            metadata.put("customerEmail", customerEmail);
            transaction.setMetadata(metadata);
            log.info("Stored customer email {} in transaction {} metadata (from polling)", customerEmail, transactionId);
        }

        transaction.setStatus(mappedStatus);
        userPaymentTransactionRepository.save(transaction);
        log.info("Updated transaction {} status from {} to {}", transactionId, transaction.getStatus(), mappedStatus);

        // If payment just succeeded via polling, publish event for async ticket generation
        if ("SUCCEEDED".equals(mappedStatus)) {
            log.info("Payment {} just succeeded via polling. Publishing PaymentSuccessEvent for async ticket generation", transactionId);
            applicationEventPublisher.publishEvent(new PaymentSuccessEvent(this, transactionId, transaction.getTenantId()));
            log.debug("Published PaymentSuccessEvent for transaction {} (async ticket generation)", transactionId);
        }
    }

    // Build response
    PaymentStatusResponse response = new PaymentStatusResponse();
    response.setTransactionId(String.valueOf(transactionId));
    response.setStatus(mappedStatus);
    response.setAmount(transaction.getAmount());
    response.setCurrency(transaction.getCurrency());
    response.setPaymentMethod(transaction.getPaymentMethod());
    response.setPaymentReference(stripePaymentIntentId);
    response.setEventId(transaction.getEvent() != null ? transaction.getEvent().getId() : null);
    response.setMetadata(transaction.getMetadata());
    response.setTenantId(transaction.getTenantId());
    response.setProviderType("STRIPE");
    response.setPaymentUseCase(transaction.getTransactionType());

    // ✅ CRITICAL FIX: Include stripePaymentIntentId in response
    response.setStripePaymentIntentId(stripePaymentIntentId);
    log.debug("Included stripePaymentIntentId in response: {}", stripePaymentIntentId);

    // ✅ BONUS: If payment succeeded and it's a ticket purchase, include ticket data
    if ("SUCCEEDED".equals(mappedStatus) && response.getEventId() != null) {
        populateTicketData(response, transaction, response.getEventId());
    }

    return response;
}
```

### 3. Add populateTicketData() Method (Optional but Recommended)

This method will also populate ticket transaction ID and QR code URL in the response, eliminating the need for frontend polling:

```java
private void populateTicketData(
    PaymentStatusResponse response,
    UserPaymentTransaction paymentTransaction,
    Long eventId
) {
    try {
        String stripePaymentIntentId = paymentTransaction.getStripePaymentIntentId();
        if (stripePaymentIntentId == null || stripePaymentIntentId.isEmpty()) {
            log.debug("Payment transaction {} has no Stripe payment intent ID, cannot find ticket transaction",
                paymentTransaction.getId());
            return;
        }

        // Find ticket transaction by Stripe payment intent ID
        List<EventTicketTransaction> ticketTransactions = eventTicketTransactionRepository
            .findByStripePaymentIntentId(stripePaymentIntentId);

        Optional<EventTicketTransaction> ticketTransactionOpt = ticketTransactions.stream()
            .filter(t -> eventId.equals(t.getEventId()))
            .findFirst();

        // Fallback: Try by transaction_reference
        if (!ticketTransactionOpt.isPresent()) {
            log.debug("Ticket transaction not found by stripePaymentIntentId {}, trying transaction_reference",
                stripePaymentIntentId);
            ticketTransactionOpt = eventTicketTransactionRepository
                .findByTransactionReference(String.valueOf(paymentTransaction.getId()))
                .stream()
                .filter(t -> eventId.equals(t.getEventId()))
                .findFirst();
        }

        if (ticketTransactionOpt.isPresent()) {
            EventTicketTransaction ticketTransaction = ticketTransactionOpt.get();

            response.setTicketTransactionId(ticketTransaction.getId());
            response.setQrCodeUrl(ticketTransaction.getQrCodeImageUrl());
            response.setEmailSent(ticketTransaction.getConfirmationSentAt() != null);

            log.info("Populated ticket data for payment {}: ticketTransactionId={}, qrCodeUrl={}, emailSent={}",
                paymentTransaction.getId(), ticketTransaction.getId(),
                ticketTransaction.getQrCodeImageUrl() != null ? "present" : "missing",
                ticketTransaction.getConfirmationSentAt() != null);
        } else {
            log.debug("No ticket transaction found for payment {} with Stripe payment intent ID {} and eventId {}",
                paymentTransaction.getId(), stripePaymentIntentId, eventId);
        }
    } catch (Exception e) {
        log.error("Failed to populate ticket data for payment {}: {}",
            paymentTransaction.getId(), e.getMessage(), e);
        // Don't fail the entire response - just log the error
    }
}
```

---

## Expected Backend API Response (After Fix)

### Request
```
GET /api/payments/5721
```

### Response (MUST include stripePaymentIntentId)
```json
{
  "transactionId": "5721",
  "status": "SUCCEEDED",
  "amount": 20.00,
  "currency": "USD",
  "paymentMethod": "card",
  "paymentReference": "pi_3SToKyK5BrggeAHM1arNAhzE",
  "eventId": 2,
  "tenantId": "tenant_demo_002",
  "providerType": "STRIPE",
  "paymentUseCase": "TICKET_SALE",
  "stripePaymentIntentId": "pi_3SToKyK5BrggeAHM1arNAhzE",
  "metadata": {
    "customerEmail": "giventauser@gmail.com"
  },
  "ticketTransactionId": 5756,
  "qrCodeUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/default/events/tenantId/tenant_demo_002/event-id/2/tickets/qrcode_5756_1763231817178_ee76a405.png",
  "emailSent": true
}
```

**CRITICAL FIELD:** `stripePaymentIntentId` - This is what the frontend needs to poll for tickets!

**BONUS FIELDS (Optional but Recommended):**
- `ticketTransactionId` - Eliminates need for frontend polling
- `qrCodeUrl` - Frontend can display QR code immediately
- `emailSent` - Frontend can show email confirmation status

---

## Frontend Will Then Work Automatically

Once the backend returns `stripePaymentIntentId`, the frontend will:

1. ✅ Extract `stripePaymentIntentId` from payment response (line 122 in PaymentSuccessClient.tsx)
2. ✅ Start polling for ticket transaction using `stripePaymentIntentId.equals=pi_3SToKyK5BrggeAHM1arNAhzE`
3. ✅ Find the ticket transaction (ID: 5756)
4. ✅ Fetch QR code from ticket transaction
5. ✅ Display QR code and ticket details
6. ✅ Send email confirmation

**Current Frontend Code (Already Implemented):**
```typescript
// Line 504-505: Extract stripePaymentIntentId
const stripePaymentIntentId = paymentTransaction.metadata?.stripePaymentIntentId ||
  (paymentTransaction.paymentReference?.startsWith('pi_') ? paymentTransaction.paymentReference : null);

// Line 551: Query by stripePaymentIntentId
searchParams.append('stripePaymentIntentId.equals', stripePaymentIntentId);

// Line 557: Fetch tickets
const ticketUrl = `${baseUrl}/api/proxy/event-ticket-transactions?${searchParams.toString()}`;
```

---

## Testing After Fix

1. **Make a test payment** (transaction ID will be auto-generated, e.g., 5721)

2. **Check backend logs** for:
   ```
   Included stripePaymentIntentId in response: pi_3SToKyK5BrggeAHM1arNAhzE
   ```

3. **Check browser console** for:
   ```
   [PaymentSuccessClient] Payment status response: {
     stripePaymentIntentId: "pi_3SToKyK5BrggeAHM1arNAhzE",
     ...
   }
   🔍 Polling for ticket transaction attempt 1/15
   Fetching ticket from: http://localhost:3000/api/proxy/event-ticket-transactions?stripePaymentIntentId.equals=pi_3SToKyK5BrggeAHM1arNAhzE&eventId.equals=2
   ✅ Ticket transaction found via polling: { ticketId: 5756, ... }
   ```

4. **Verify QR code displays** on payment success page

---

## Summary

**Required Change:** Add `stripePaymentIntentId` to `PaymentStatusResponse` DTO and populate it in `StripePaymentAdapter.getStatus()`

**Priority:** CRITICAL - Without this field, frontend cannot find ticket transactions and page stays stuck on "Please wait while your tickets are created..."

**Estimated Time:** 15 minutes

**Files to Modify:**
1. `PaymentStatusResponse.java` - Add `stripePaymentIntentId` field
2. `StripePaymentAdapter.java` - Populate `stripePaymentIntentId` in response
3. (Optional) `StripePaymentAdapter.java` - Add `populateTicketData()` method

**Frontend:** Already ready - no changes needed!
