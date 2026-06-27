# URGENT: Backend Fix Required - Payment Status Response Missing Ticket Data

## Problem Summary

**Frontend Status:** Shows "Please wait while your tickets are created..." indefinitely, even though:
- ✅ QR code is generated successfully
- ✅ Email is sent successfully
- ✅ Ticket transaction is created successfully

**Root Cause:** Payment status response (`GET /api/payments/{transactionId}`) doesn't include ticket data.

---

## What's Working ✅

From backend logs (transaction 5403):
- Ticket transaction 5451 created successfully
- QR code generated: `https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/default/events/tenantId/tenant_demo_002/event-id/2/tickets/qrcode_5451_1763191061185_fb97bcbe.png`
- Email sent: `giventauser@gmail.com`
- Email extraction from payment metadata: Working

---

## What's NOT Working ❌

1. **Payment Status Response Missing Fields:**
   - `GET /api/payments/5403` doesn't return `ticketTransactionId`
   - `GET /api/payments/5403` doesn't return `qrCodeUrl`
   - `GET /api/payments/5403` doesn't return `emailSent`

2. **Frontend Query Fails:**
   - Query: `GET /api/event-ticket-transactions?transactionReference.equals=5403`
   - Result: `Page 1 of 0 containing UNKNOWN instances` (0 results)
   - Reason: `transaction_reference` field in `EventTicketTransaction` is not set to payment transaction ID

---

## Required Backend Fix

### File: `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Method:** `getStatus(Long transactionId, PaymentProviderConfig config)`

**Add this code BEFORE returning the response:**

```java
// ✅ CRITICAL: If payment succeeded and it's a ticket purchase, populate ticket data
if ("SUCCEEDED".equals(mappedStatus)) {
    Long eventId = transaction.getEvent() != null ? transaction.getEvent().getId() : null;
    if (eventId != null) {
        // This is a ticket purchase - populate ticket data
        populateTicketData(response, transaction, eventId);
    }
}
```

**Add this new method:**

```java
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
                log.info("Included QR code URL in payment status response for transaction {}: {}",
                    paymentTransaction.getId(), qrCodeUrl);
            } else {
                log.warn("Ticket transaction {} exists but has no QR code URL", ticketTransaction.getId());
            }

            // Check if email was sent (check confirmation_sent_at)
            boolean emailSent = ticketTransaction.getConfirmationSentAt() != null;
            response.setEmailSent(emailSent);

            log.info("Populated ticket data for payment {}: ticketTransactionId={}, qrCodeUrl={}, emailSent={}",
                paymentTransaction.getId(), ticketTransaction.getId(),
                qrCodeUrl != null ? "present" : "missing", emailSent);
        } else {
            log.warn("No ticket transaction found for payment {} with Stripe payment intent ID {} or transaction_reference {}",
                paymentTransaction.getId(), stripePaymentIntentId, paymentTransaction.getId());
        }
    } catch (Exception e) {
        log.error("Failed to populate ticket data for payment {}: {}",
            paymentTransaction.getId(), e.getMessage(), e);
        // Don't fail the entire response - just log the error
    }
}
```

**Required Dependencies:**

```java
// Add these imports
import com.nextjstemplate.domain.EventTicketTransaction;
import com.nextjstemplate.repository.EventTicketTransactionRepository;
import java.util.List;
import java.util.Optional;

// Inject EventTicketTransactionRepository in constructor
private final EventTicketTransactionRepository eventTicketTransactionRepository;

// Constructor injection
public StripePaymentAdapter(
    // ... existing parameters ...
    EventTicketTransactionRepository eventTicketTransactionRepository
) {
    // ... existing assignments ...
    this.eventTicketTransactionRepository = eventTicketTransactionRepository;
}
```

---

## Expected Response Format

After fix, `GET /api/payments/5403` should return:

```json
{
  "transactionId": "5403",
  "status": "SUCCEEDED",
  "providerType": "STRIPE",
  "amount": 20.00,
  "currency": "USD",
  "paymentMethod": "card",
  "paymentReference": "pi_xxxxx",
  "ticketTransactionId": 5451,
  "qrCodeUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/default/events/tenantId/tenant_demo_002/event-id/2/tickets/qrcode_5451_1763191061185_fb97bcbe.png",
  "emailSent": true,
  "eventId": 2,
  "createdAt": "2025-11-15T02:17:40Z",
  "updatedAt": "2025-11-15T02:17:42Z"
}
```

**CRITICAL:** These fields must be at the root level of the response, NOT nested in `metadata`.

---

## Verification Steps

1. **Test Payment:**
   - Make a test payment through checkout
   - Note the payment transaction ID (e.g., 5403)

2. **Check Payment Status API:**
   ```
   GET /api/payments/5403
   ```
   - Verify `ticketTransactionId` is present
   - Verify `qrCodeUrl` is present and accessible
   - Verify `emailSent` is `true`

3. **Check Frontend:**
   - Visit success page: `/event/success?transactionId=5403&eventId=2`
   - QR code should display immediately
   - Email confirmation should show
   - "Please wait while your tickets are created..." should disappear

---

## Priority

**URGENT** - This blocks users from seeing their tickets and QR codes after successful payment.

---

## Related Files

- `BACKEND_PAYMENT_STATUS_RESPONSE_FIX.md` - Detailed implementation guide
- `BACKEND_EMAIL_STORAGE_FIX.md` - Email storage fix (already working)
- `BACKEND_COMPILATION_FIXES.md` - Compilation error fixes (already applied)

