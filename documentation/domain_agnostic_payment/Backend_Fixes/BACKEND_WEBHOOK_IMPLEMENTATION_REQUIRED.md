# 🚨 CRITICAL: Backend Webhook Handler Implementation Required

## Problem Statement

**Current Status:** The backend webhook handler for `payment_intent.succeeded` events is **NOT IMPLEMENTED** or **NOT CREATING TICKET TRANSACTIONS**.

**Evidence:**
- Frontend polls for ticket transactions but receives empty arrays `[]`
- Payment transactions exist and are marked as `SUCCEEDED`
- No `EventTicketTransaction` records are created when payments succeed
- Frontend cannot display QR codes because ticket transactions don't exist

**Root Cause:** The backend webhook handler (`handlePaymentIntentSucceeded()` or `handlePaymentSucceeded()`) either:
1. Does not exist
2. Exists but doesn't create `EventTicketTransaction` records
3. Exists but isn't being called (webhook not configured in Stripe Dashboard)

---

## Required Implementation

### 1. Webhook Endpoint Structure

The backend MUST have a webhook endpoint that:
- Receives Stripe webhook events at `POST /api/webhooks/stripe` (or `/api/payments/webhooks/stripe`)
- Verifies webhook signature using Stripe webhook secret
- Handles `payment_intent.succeeded` events
- Creates `EventTicketTransaction` records for ticket purchases

### 2. Webhook Handler Implementation

**File:** `StripeWebhookHandler.java` or `StripePaymentAdapter.java` (or equivalent)

**Required Method:** `handlePaymentIntentSucceeded()` or `handlePaymentSucceeded()`

**Required Actions:**
1. ✅ Update `UserPaymentTransaction` status to `SUCCEEDED`
2. ✅ **CRITICAL:** Create `EventTicketTransaction` if `paymentUseCase = TICKET_SALE` or `eventId != null`
3. ✅ **CRITICAL:** Generate QR code for the ticket transaction
4. ✅ **CRITICAL:** Send ticket email to customer
5. ✅ Store customer email in `UserPaymentTransaction.metadata`

---

## Complete Implementation Template

### Option 1: Using TicketGenerationService (Recommended)

```java
package com.nextjstemplate.service.payment.adapter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.nextjstemplate.domain.UserPaymentTransaction;
import com.nextjstemplate.repository.UserPaymentTransactionRepository;
import com.nextjstemplate.service.payment.TicketGenerationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StripePaymentAdapter {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentAdapter.class);

    @Autowired
    private UserPaymentTransactionRepository transactionRepository;

    @Autowired
    private TicketGenerationService ticketGenerationService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Handles payment_intent.succeeded webhook event from Stripe.
     *
     * CRITICAL: This method MUST create EventTicketTransaction for ticket purchases.
     */
    public void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
            .getObject()
            .orElseThrow(() -> new RuntimeException("Failed to deserialize PaymentIntent from webhook event"));

        String stripePaymentIntentId = paymentIntent.getId();
        log.info("[StripePaymentAdapter] Processing payment_intent.succeeded webhook for payment intent: {}", stripePaymentIntentId);

        // Find the payment transaction by Stripe payment intent ID
        UserPaymentTransaction transaction = transactionRepository
            .findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException(
                "Payment transaction not found for Stripe payment intent: " + stripePaymentIntentId
            ));

        log.info("[StripePaymentAdapter] Found payment transaction: id={}, eventId={}, paymentUseCase={}",
            transaction.getId(),
            transaction.getEvent() != null ? transaction.getEvent().getId() : null,
            transaction.getPaymentUseCase());

        // Update transaction status to SUCCEEDED
        String oldStatus = transaction.getStatus();
        transaction.setStatus("SUCCEEDED");
        transaction.setUpdatedAt(ZonedDateTime.now());

        // CRITICAL: Extract and store customer email from PaymentIntent
        String customerEmail = paymentIntent.getReceiptEmail();
        if (customerEmail == null || customerEmail.isEmpty()) {
            // Try to get from metadata
            Map<String, String> metadata = paymentIntent.getMetadata();
            if (metadata != null) {
                customerEmail = metadata.get("customerEmail");
                if (customerEmail == null || customerEmail.isEmpty()) {
                    customerEmail = metadata.get("email");
                }
            }
        }

        // Store customer email in transaction metadata
        if (customerEmail != null && !customerEmail.isEmpty()) {
            try {
                Map<String, Object> metadataMap = new HashMap<>();
                if (transaction.getMetadata() != null && !transaction.getMetadata().isEmpty()) {
                    try {
                        metadataMap = objectMapper.readValue(transaction.getMetadata(), Map.class);
                    } catch (Exception e) {
                        log.debug("Failed to parse existing metadata, creating new metadata map");
                    }
                }
                metadataMap.put("email", customerEmail);
                metadataMap.put("customerEmail", customerEmail);
                transaction.setMetadata(objectMapper.writeValueAsString(metadataMap));
                log.info("[StripePaymentAdapter] Stored customer email {} in transaction {} metadata",
                    customerEmail, transaction.getId());
            } catch (Exception e) {
                log.warn("[StripePaymentAdapter] Failed to store customer email in transaction metadata: {}",
                    e.getMessage());
            }
        }

        // Save updated transaction
        transactionRepository.save(transaction);
        log.info("[StripePaymentAdapter] Updated transaction {} status from {} to SUCCEEDED",
            transaction.getId(), oldStatus);

        // CRITICAL: If this is a ticket purchase, create EventTicketTransaction and generate QR code
        Long eventId = transaction.getEvent() != null ? transaction.getEvent().getId() : null;
        if (eventId != null || "TICKET_SALE".equals(transaction.getPaymentUseCase())) {
            log.info("[StripePaymentAdapter] This is a ticket purchase (eventId={}), triggering ticket generation", eventId);

            try {
                // Call synchronous ticket generation service
                // This will:
                // 1. Create or find EventTicketTransaction
                // 2. Generate QR code
                // 3. Send ticket email
                ticketGenerationService.processTicketGenerationSync(transaction, stripePaymentIntentId);

                log.info("[StripePaymentAdapter] Successfully processed ticket generation for transaction {}",
                    transaction.getId());
            } catch (Exception e) {
                log.error("[StripePaymentAdapter] Failed to process ticket generation for transaction {}: {}",
                    transaction.getId(), e.getMessage(), e);
                // Don't fail the webhook - ticket generation can be retried
                // But log the error for monitoring
            }
        } else {
            log.debug("[StripePaymentAdapter] Payment {} succeeded but is not a ticket purchase (no eventId), skipping ticket generation",
                transaction.getId());
        }

        log.info("[StripePaymentAdapter] Completed processing payment_intent.succeeded webhook for transaction {}",
            transaction.getId());
    }
}
```

### Option 2: Direct Implementation (If TicketGenerationService doesn't exist)

```java
/**
 * Handles payment_intent.succeeded webhook event from Stripe.
 *
 * CRITICAL: This method MUST create EventTicketTransaction for ticket purchases.
 */
public void handlePaymentIntentSucceeded(Event event) {
    PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
        .getObject()
        .orElseThrow(() -> new RuntimeException("Failed to deserialize PaymentIntent from webhook event"));

    String stripePaymentIntentId = paymentIntent.getId();
    log.info("[StripeWebhookHandler] Processing payment_intent.succeeded webhook for payment intent: {}",
        stripePaymentIntentId);

    // Find the payment transaction by Stripe payment intent ID
    UserPaymentTransaction paymentTransaction = transactionRepository
        .findByStripePaymentIntentId(stripePaymentIntentId)
        .orElseThrow(() -> new RuntimeException(
            "Payment transaction not found for Stripe payment intent: " + stripePaymentIntentId
        ));

    // Update transaction status
    paymentTransaction.setStatus("SUCCEEDED");
    paymentTransaction.setUpdatedAt(ZonedDateTime.now());

    // Extract and store customer email
    String customerEmail = paymentIntent.getReceiptEmail();
    if (customerEmail != null && !customerEmail.isEmpty()) {
        // Store in metadata (see Option 1 for metadata handling code)
    }

    transactionRepository.save(paymentTransaction);

    // CRITICAL: Create EventTicketTransaction if this is a ticket purchase
    Long eventId = paymentTransaction.getEvent() != null ? paymentTransaction.getEvent().getId() : null;
    if (eventId != null || "TICKET_SALE".equals(paymentTransaction.getPaymentUseCase())) {
        log.info("[StripeWebhookHandler] Creating EventTicketTransaction for payment {}", paymentTransaction.getId());

        // Create EventTicketTransaction
        EventTicketTransaction ticketTransaction = new EventTicketTransaction();
        ticketTransaction.setEventId(eventId);
        ticketTransaction.setStripePaymentIntentId(stripePaymentIntentId);
        ticketTransaction.setTransactionReference(String.valueOf(paymentTransaction.getId()));
        ticketTransaction.setEmail(customerEmail);
        ticketTransaction.setTotalAmount(paymentTransaction.getAmount());
        ticketTransaction.setFinalAmount(paymentTransaction.getAmount());
        ticketTransaction.setPurchaseDate(ZonedDateTime.now());
        ticketTransaction.setStatus("CONFIRMED");
        ticketTransaction.setCreatedAt(ZonedDateTime.now());
        ticketTransaction.setUpdatedAt(ZonedDateTime.now());

        // Save ticket transaction
        EventTicketTransaction savedTicket = eventTicketTransactionRepository.save(ticketTransaction);
        log.info("[StripeWebhookHandler] Created EventTicketTransaction: id={}", savedTicket.getId());

        // Generate QR code
        try {
            String qrCodeUrl = qrCodeService.generateQrCodeForTransaction(
                eventId,
                savedTicket.getId(),
                getEmailHostUrlPrefix()
            );
            savedTicket.setQrCodeImageUrl(qrCodeUrl);
            eventTicketTransactionRepository.save(savedTicket);
            log.info("[StripeWebhookHandler] Generated QR code for ticket transaction {}", savedTicket.getId());
        } catch (Exception e) {
            log.error("[StripeWebhookHandler] Failed to generate QR code: {}", e.getMessage(), e);
        }

        // Send ticket email
        if (customerEmail != null && !customerEmail.isEmpty()) {
            try {
                ticketEmailService.sendTicketEmail(
                    eventId,
                    savedTicket.getId(),
                    customerEmail
                );
                savedTicket.setConfirmationSentAt(ZonedDateTime.now());
                eventTicketTransactionRepository.save(savedTicket);
                log.info("[StripeWebhookHandler] Sent ticket email to {}", customerEmail);
            } catch (Exception e) {
                log.error("[StripeWebhookHandler] Failed to send ticket email: {}", e.getMessage(), e);
            }
        }
    }
}
```

---

## Required Dependencies

### Repository Methods Required

```java
// In UserPaymentTransactionRepository
Optional<UserPaymentTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);

// In EventTicketTransactionRepository
List<EventTicketTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);
List<EventTicketTransaction> findByTransactionReference(String transactionReference);
EventTicketTransaction save(EventTicketTransaction transaction);
```

### Service Methods Required

```java
// In TicketGenerationService (if using Option 1)
void processTicketGenerationSync(UserPaymentTransaction paymentTransaction, String stripePaymentIntentId);

// OR direct methods (if using Option 2)
// In QrCodeService
String generateQrCodeForTransaction(Long eventId, Long transactionId, String emailHostUrlPrefix);

// In TicketEmailService
void sendTicketEmail(Long eventId, Long transactionId, String email);
```

---

## Webhook Endpoint Registration

### Controller Method

```java
@RestController
@RequestMapping("/api/webhooks/stripe")  // OR "/api/payments/webhooks/stripe"
public class StripeWebhookController {

    @Autowired
    private StripePaymentAdapter stripePaymentAdapter;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            // Verify webhook signature
            String webhookSecret = getStripeWebhookSecret(); // From environment/config
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            log.info("[StripeWebhookController] Received webhook event: type={}, id={}",
                event.getType(), event.getId());

            // Handle payment_intent.succeeded event
            if ("payment_intent.succeeded".equals(event.getType())) {
                stripePaymentAdapter.handlePaymentIntentSucceeded(event);
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[StripeWebhookController] Webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook processing failed");
        }
    }
}
```

---

## Stripe Dashboard Configuration

### Required Setup

1. **Webhook Endpoint URL:** `https://your-backend-domain.com/api/webhooks/stripe`
2. **Webhook Secret:** Copy from Stripe Dashboard → Webhooks → Your endpoint → Signing secret
3. **Events to Subscribe:**
   - ✅ `payment_intent.succeeded` (REQUIRED)
   - ✅ `payment_intent.payment_failed` (optional)
   - ✅ `payment_intent.canceled` (optional)

### Verification Steps

1. Go to Stripe Dashboard → Webhooks
2. Check if endpoint exists and is active
3. Check "Recent deliveries" to see if webhooks are being received
4. If no deliveries, webhook is not configured or URL is incorrect

---

## Testing Checklist

### 1. Verify Webhook Endpoint Exists

**Action:** Search codebase for webhook handler
```bash
# Search for webhook endpoint
grep -r "payment_intent.succeeded" src/
grep -r "@PostMapping.*webhook" src/
grep -r "StripeWebhook" src/
```

**Expected:** Find webhook handler class and method

### 2. Verify Webhook is Being Called

**Action:** Check backend logs during test payment

**Expected Logs:**
```
[StripeWebhookController] Received webhook event: type=payment_intent.succeeded, id=evt_...
[StripePaymentAdapter] Processing payment_intent.succeeded webhook for payment intent: pi_...
[StripePaymentAdapter] Found payment transaction: id=5523, eventId=2, paymentUseCase=TICKET_SALE
[StripePaymentAdapter] This is a ticket purchase (eventId=2), triggering ticket generation
[TicketGenerationService] Processing ticket generation synchronously for payment 5523
[TicketGenerationService] Created EventTicketTransaction: id=...
[TicketGenerationService] Generated QR code for ticket transaction ...
[TicketGenerationService] Sent ticket email to customer@example.com
```

**If NO logs appear:** Webhook handler is not being called (check Stripe Dashboard configuration)

### 3. Verify Ticket Transaction is Created

**Action:** Query database after test payment

**SQL Query:**
```sql
SELECT id, event_id, stripe_payment_intent_id, transaction_reference, email, qr_code_image_url, confirmation_sent_at
FROM event_ticket_transaction
WHERE stripe_payment_intent_id = 'pi_...'
   OR transaction_reference = '5523';
```

**Expected:** At least one `EventTicketTransaction` record exists

**If NO records:** Ticket transaction creation is not implemented

### 4. Verify QR Code is Generated

**Action:** Check `qr_code_image_url` field in `EventTicketTransaction`

**Expected:** `qr_code_image_url` is populated with a valid URL

**If NULL:** QR code generation is not implemented or failing

### 5. Verify Email is Sent

**Action:** Check `confirmation_sent_at` field or email service logs

**Expected:** `confirmation_sent_at` is populated OR email service logs show email sent

**If NULL:** Email sending is not implemented or failing

---

## Integration with Existing Code

### If Using StripePaymentAdapter.getStatus() (Polling Fallback)

The `getStatus()` method should also trigger ticket generation as a fallback if webhook doesn't fire:

```java
// In StripePaymentAdapter.getStatus() method
if ("SUCCEEDED".equals(mappedStatus) && !"SUCCEEDED".equals(oldStatus)) {
    // Payment just succeeded - trigger ticket generation as fallback
    Long eventId = transaction.getEvent() != null ? transaction.getEvent().getId() : null;
    if (eventId != null) {
        log.info("Payment {} just succeeded via polling, triggering ticket generation (webhook fallback)", transactionId);
        try {
            ticketGenerationService.processTicketGenerationSync(transaction, stripePaymentIntentId);
        } catch (Exception e) {
            log.error("Failed to process ticket generation via polling fallback: {}", e.getMessage(), e);
        }
    }
}
```

---

## Critical Requirements Summary

### ✅ MUST IMPLEMENT

1. **Webhook Endpoint:** `POST /api/webhooks/stripe` (or `/api/payments/webhooks/stripe`)
2. **Webhook Handler Method:** `handlePaymentIntentSucceeded(Event event)` or `handlePaymentSucceeded(Event event)`
3. **Ticket Transaction Creation:** Create `EventTicketTransaction` when `eventId != null` or `paymentUseCase = TICKET_SALE`
4. **QR Code Generation:** Generate QR code and store URL in `EventTicketTransaction.qrCodeImageUrl`
5. **Email Sending:** Send ticket email and set `EventTicketTransaction.confirmationSentAt`
6. **Email Storage:** Store customer email in `UserPaymentTransaction.metadata` as JSON: `{"email": "...", "customerEmail": "..."}`

### ✅ MUST CONFIGURE

1. **Stripe Dashboard:** Webhook endpoint URL configured
2. **Stripe Dashboard:** `payment_intent.succeeded` event subscribed
3. **Environment Variable:** `STRIPE_WEBHOOK_SECRET` configured

### ✅ MUST LOG

1. Webhook event received: `[StripeWebhookHandler] Received payment_intent.succeeded event`
2. Payment transaction found: `[StripeWebhookHandler] Found payment transaction: id=...`
3. Ticket generation started: `[StripeWebhookHandler] Creating EventTicketTransaction...`
4. QR code generated: `[StripeWebhookHandler] Generated QR code for ticket transaction...`
5. Email sent: `[StripeWebhookHandler] Sent ticket email to...`

---

## Verification Commands

### Check if Webhook Handler Exists

```bash
# Search for webhook handler
find . -name "*Webhook*.java" -o -name "*Stripe*Adapter.java" | xargs grep -l "payment_intent.succeeded"

# Search for handlePaymentIntentSucceeded method
find . -name "*.java" | xargs grep -l "handlePaymentIntentSucceeded\|handlePaymentSucceeded"
```

### Check if Ticket Transaction Creation Exists

```bash
# Search for EventTicketTransaction creation
find . -name "*.java" | xargs grep -l "EventTicketTransaction" | xargs grep -l "new EventTicketTransaction\|save.*EventTicketTransaction"
```

### Check if QR Code Generation Exists

```bash
# Search for QR code generation
find . -name "*.java" | xargs grep -l "generateQrCode\|qrCode\|QR.*code"
```

---

## Next Steps

1. **Backend Team:** Search codebase for existing webhook handler
2. **Backend Team:** If handler exists, verify it creates `EventTicketTransaction`
3. **Backend Team:** If handler doesn't exist, implement using template above
4. **Backend Team:** Configure webhook endpoint in Stripe Dashboard
5. **Backend Team:** Test with Stripe CLI: `stripe trigger payment_intent.succeeded`
6. **Backend Team:** Verify logs show ticket transaction creation
7. **Backend Team:** Verify database has `EventTicketTransaction` records after payment

---

## Frontend Readiness

✅ **Frontend is READY** - It will automatically:
- Poll for ticket transactions
- Fetch QR code when ticket transaction is found
- Display QR code automatically
- Send email confirmation

**Frontend will work correctly once backend:**
1. Creates `EventTicketTransaction` in webhook handler
2. Generates QR code and stores URL
3. Sends ticket email

---

## Related Documents

- `BACKEND_FIX_PROMPT.md` - Complete backend implementation guide
- `BACKEND_WEBHOOK_VERIFICATION.md` - Webhook verification checklist
- `BACKEND_PAYMENT_STATUS_RESPONSE_FIX.md` - Payment status response implementation
- `BACKEND_EMAIL_STORAGE_FIX.md` - Email storage in metadata

