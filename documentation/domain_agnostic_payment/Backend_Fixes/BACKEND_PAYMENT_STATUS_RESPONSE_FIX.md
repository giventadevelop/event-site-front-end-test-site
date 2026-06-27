# Backend Fix: Payment Status Response Must Include QR Code and Ticket Transaction

## Problem

The backend logs show:
- ✅ QR code generated successfully: `QR code generated for ticket transaction 5251`
- ✅ Email sent successfully: `Ticket email sent successfully for transaction 5251 to giventauser@gmail.com`
- ✅ Ticket transaction created: `insert into event_ticket_transaction` succeeded
- ✅ Email extracted: `Extracted email from payment transaction metadata: giventauser@gmail.com`

**BUT:**
- ❌ Frontend query returns 0 results: `GET /api/event-ticket-transactions?transactionReference.equals=5201` → Page 1 of 0
- ❌ Payment status response (`GET /api/payments/5201`) likely doesn't include `qrCodeUrl` or `ticketTransactionId`
- ❌ Frontend can't find the ticket transaction to display QR code

**Root Cause:** The `PaymentStatusResponse` from `GET /api/payments/{transactionId}` is not including:
- `qrCodeUrl` (QR code URL) - **CRITICAL**: Frontend needs this to display QR code
- `ticketTransactionId` (ticket transaction ID) - **CRITICAL**: Frontend needs this to fetch ticket details
- `emailSent` (email sent status) - **CRITICAL**: Frontend needs this to show email confirmation

**Why Frontend Query Fails:**
- Frontend queries by `transactionReference.equals=5201` (payment transaction ID)
- But `transaction_reference` field in `EventTicketTransaction` is probably not set to 5201
- The ticket transaction (ID 5251) exists but isn't linked via `transaction_reference`
- **Solution**: Backend should return `ticketTransactionId` directly in payment status response, so frontend doesn't need to query

---

## Solution

The `StripePaymentAdapter.getStatus()` method must populate ticket data (QR code URL, ticket transaction ID, email sent status) when payment is SUCCEEDED and it's a ticket purchase.

---

## Required Backend Changes

### File: `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Find the `getStatus()` method** and ensure it calls `populateTicketData()` or includes ticket data in the response.

**Current Code Pattern (likely missing ticket data):**
```java
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    // ... retrieve transaction and payment intent ...

    PaymentStatusResponse response = new PaymentStatusResponse();
    response.setTransactionId(String.valueOf(transactionId));
    response.setStatus(mappedStatus);
    // ... set other basic fields ...

    // ❌ MISSING: Ticket data (qrCodeUrl, ticketTransactionId, emailSent) not included

    return response;
}
```

**Fix:**
```java
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    // ... retrieve transaction and payment intent ...

    PaymentStatusResponse response = new PaymentStatusResponse();
    response.setTransactionId(String.valueOf(transactionId));
    response.setStatus(mappedStatus);
    // ... set other basic fields ...

    // ✅ CRITICAL: If payment succeeded and it's a ticket purchase, include ticket data
    if ("SUCCEEDED".equals(mappedStatus)) {
        Long eventId = transaction.getEvent() != null ? transaction.getEvent().getId() : null;
        if (eventId != null) {
            // This is a ticket purchase - populate ticket data
            populateTicketData(response, transaction, eventId);
        }
    }

    return response;
}

/**
 * Populates ticket-related data (QR code URL, ticket transaction ID, email sent status)
 * in the payment status response.
 */
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
        // Note: The ticket transaction's stripe_payment_intent_id should match
        // CRITICAL: Query by stripePaymentIntentId since transaction_reference may not be set
        List<EventTicketTransaction> ticketTransactions = eventTicketTransactionRepository
            .findByStripePaymentIntentId(stripePaymentIntentId);

        Optional<EventTicketTransaction> ticketTransactionOpt = ticketTransactions.stream()
            .filter(t -> eventId.equals(t.getEventId())) // Ensure it's for the correct event
            .findFirst();

        // If not found by stripePaymentIntentId, try by transaction_reference as fallback
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

            // Set ticket transaction ID
            response.setTicketTransactionId(ticketTransaction.getId());
            response.setEventId(eventId);

            // Get QR code URL from ticket transaction
            String qrCodeUrl = ticketTransaction.getQrCodeImageUrl();
            if (qrCodeUrl != null && !qrCodeUrl.isEmpty()) {
                response.setQrCodeUrl(qrCodeUrl);
                log.debug("Included QR code URL in payment status response for transaction {}: {}",
                    paymentTransaction.getId(), qrCodeUrl);
            } else {
                log.warn("Ticket transaction {} exists but has no QR code URL", ticketTransaction.getId());
            }

            // Check if email was sent (check confirmation_sent_at or metadata)
            boolean emailSent = ticketTransaction.getConfirmationSentAt() != null;
            response.setEmailSent(emailSent);

            log.info("Populated ticket data for payment {}: ticketTransactionId={}, qrCodeUrl={}, emailSent={}",
                paymentTransaction.getId(), ticketTransaction.getId(),
                qrCodeUrl != null ? "present" : "missing", emailSent);
        } else {
            log.debug("No ticket transaction found for payment {} with Stripe payment intent ID {}",
                paymentTransaction.getId(), stripePaymentIntentId);

            // Alternative: Try finding by transaction_reference (if database trigger sets it)
            // This is a fallback in case stripe_payment_intent_id matching doesn't work
            Optional<EventTicketTransaction> ticketByReference = eventTicketTransactionRepository
                .findByTransactionReference(String.valueOf(paymentTransaction.getId()))
                .stream()
                .filter(t -> eventId.equals(t.getEventId()))
                .findFirst();

            if (ticketByReference.isPresent()) {
                EventTicketTransaction ticketTransaction = ticketByReference.get();
                response.setTicketTransactionId(ticketTransaction.getId());
                response.setEventId(eventId);

                String qrCodeUrl = ticketTransaction.getQrCodeImageUrl();
                if (qrCodeUrl != null && !qrCodeUrl.isEmpty()) {
                    response.setQrCodeUrl(qrCodeUrl);
                }

                boolean emailSent = ticketTransaction.getConfirmationSentAt() != null;
                response.setEmailSent(emailSent);

                log.info("Found ticket transaction by transaction_reference for payment {}: ticketTransactionId={}",
                    paymentTransaction.getId(), ticketTransaction.getId());
            }
        }
    } catch (Exception e) {
        log.error("Failed to populate ticket data for payment {}: {}",
            paymentTransaction.getId(), e.getMessage(), e);
        // Don't fail the entire response - just log the error
    }
}
```

---

## Alternative: Query by Transaction Reference

If the database trigger sets `transaction_reference` correctly, you can query by that:

```java
// In populateTicketData method
Optional<EventTicketTransaction> ticketTransactionOpt = eventTicketTransactionRepository
    .findByTransactionReference(String.valueOf(paymentTransaction.getId()))
    .stream()
    .filter(t -> eventId.equals(t.getEventId()))
    .findFirst();
```

**But based on logs, the query `transactionReference.equals=5201` returns 0 results**, which suggests:
1. The database trigger isn't setting `transaction_reference`, OR
2. The ticket transaction is being created but `transaction_reference` isn't being set

---

## Database Trigger Check

**Verify the trigger exists:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trg_set_transaction_reference';
```

**If trigger doesn't exist, create it:**
```sql
CREATE OR REPLACE FUNCTION set_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
    -- Set transaction_reference to the payment transaction ID
    -- This assumes the payment transaction ID is stored somewhere accessible
    -- You may need to adjust based on your schema

    -- Option 1: If payment transaction ID is in metadata
    -- NEW.transaction_reference := (NEW.metadata->>'paymentTransactionId')::text;

    -- Option 2: If you can derive it from stripe_payment_intent_id
    -- Find payment transaction by stripe_payment_intent_id and use its ID
    -- This requires a subquery

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_transaction_reference
BEFORE INSERT ON event_ticket_transaction
FOR EACH ROW
EXECUTE FUNCTION set_transaction_reference();
```

**OR: Update Ticket Generation Service to Set Transaction Reference**

In `TicketGenerationService.processTicketGenerationSync()`:

```java
// When creating EventTicketTransaction
EventTicketTransaction ticketTransaction = new EventTicketTransaction();
// ... set other fields ...

// ✅ CRITICAL: Set transaction_reference to payment transaction ID
// This ensures frontend can find the ticket transaction
ticketTransaction.setTransactionReference(String.valueOf(paymentTransaction.getId()));

eventTicketTransactionRepository.save(ticketTransaction);
```

**Note:** If `transaction_reference` is read-only (`insertable = false, updatable = false`), you'll need to either:
1. Make it writable in the entity, OR
2. Use the database trigger, OR
3. Query by `stripePaymentIntentId` instead

---

## Frontend Query Fix (Alternative Solution)

If the backend can't set `transaction_reference`, update the frontend to query by `stripePaymentIntentId` instead:

**File:** `src/app/event/success/PaymentSuccessClient.tsx`

**Current query:**
```typescript
const ticketRes = await fetch(
  `${baseUrl}/api/proxy/event-ticket-transactions?transactionReference.equals=${paymentTransaction.transactionReference}&tenantId.equals=${tenantId}`,
  { cache: 'no-store' }
);
```

**Fix:**
```typescript
// Try querying by stripePaymentIntentId instead
const stripePaymentIntentId = paymentTransaction.paymentReference; // or wherever it's stored
const ticketRes = await fetch(
  `${baseUrl}/api/proxy/event-ticket-transactions?stripePaymentIntentId.equals=${stripePaymentIntentId}&tenantId.equals=${tenantId}`,
  { cache: 'no-store' }
);
```

**OR: Use ticketTransactionId from payment status response (BEST SOLUTION):**

```typescript
// If payment status response includes ticketTransactionId, use it directly
if (paymentData.metadata?.ticketTransactionId) {
  const ticketRes = await fetch(
    `${baseUrl}/api/proxy/event-ticket-transactions/${paymentData.metadata.ticketTransactionId}`,
    { cache: 'no-store' }
  );
  if (ticketRes.ok) {
    const ticket = await ticketRes.json();
    setTicketTransaction(ticket);
  }
}
```

---

## Verification

After implementing the fix:

1. **Check payment status API response:**
   ```
   GET /api/payments/5403
   ```
   Should return:
   ```json
   {
     "transactionId": "5403",
     "status": "SUCCEEDED",
     "ticketTransactionId": 5451,
     "qrCodeUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/default/events/tenantId/tenant_demo_002/event-id/2/tickets/qrcode_5451_1763191061185_fb97bcbe.png",
     "emailSent": true,
     "eventId": 2
   }
   ```

   **CRITICAL:** The response MUST include these fields at the root level (not nested in `metadata`):
   - `ticketTransactionId`: The EventTicketTransaction ID (e.g., 5451)
   - `qrCodeUrl`: The full S3 URL to the QR code image
   - `emailSent`: Boolean indicating if email was sent
   - `eventId`: The event ID (e.g., 2)

2. **Check frontend logs:**
   - Should see `qrCodeUrl` in payment status response
   - Should see `ticketTransactionId` in payment status response
   - Frontend should display QR code immediately

3. **Check database:**
   ```sql
   SELECT id, transaction_reference, stripe_payment_intent_id, qr_code_image_url, confirmation_sent_at
   FROM event_ticket_transaction
   WHERE id = 5251;
   ```
   - `qr_code_image_url` should be populated
   - `confirmation_sent_at` should be populated (indicates email sent)

---

## Summary

**Problem:** Payment status response doesn't include ticket data (QR code URL, ticket transaction ID).

**Solution:**
1. **Backend:** Update `StripePaymentAdapter.getStatus()` to call `populateTicketData()` and include ticket data in response
2. **Backend:** Query ticket transaction by `stripePaymentIntentId` (since `transaction_reference` may not be set)
3. **Frontend:** Already ready - will use `ticketTransactionId` from payment status response if backend includes it

**Priority:** HIGH - Required for frontend to display QR code.

---

## Current Status from Latest Logs (Transaction 5403)

**✅ Working:**
- Ticket generation: `Ticket transaction 5451 created/found for payment 5403`
- QR code generation: `QR code generated for ticket transaction 5451`
- QR code URL: `https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/default/events/tenantId/tenant_demo_002/event-id/2/tickets/qrcode_5451_1763191061185_fb97bcbe.png`
- Email extraction: `Extracted email from payment transaction metadata: giventauser@gmail.com`
- Email sending: `Ticket email sent successfully for transaction 5451 to giventauser@gmail.com`

**❌ Not Working:**
- Payment status response (`GET /api/payments/5403`) doesn't include `ticketTransactionId` or `qrCodeUrl`
- Frontend query by `transactionReference.equals=5403` returns 0 results (because `transaction_reference` isn't set)
- Frontend shows "Please wait while your tickets are created..." indefinitely
- QR code exists but frontend can't find it

**Fix Required (URGENT):**
- Backend must query ticket transaction by `stripePaymentIntentId` in `populateTicketData()`
- Backend must return `ticketTransactionId: 5451` and `qrCodeUrl: "https://..."` in payment status response
- Frontend will then use these values directly (no query needed)

