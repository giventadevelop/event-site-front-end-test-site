# 🚨 URGENT: Backend Webhook Handler Implementation Required

## Problem Confirmed

**Status:** The backend webhook handler method `handlePaymentIntentSucceeded()` **DOES NOT EXIST** or **IS NOT IMPLEMENTED**.

**Evidence:**
- Global search found NO Java backend code in this workspace
- Frontend receives empty arrays `[]` when querying for ticket transactions
- Payment transactions exist and are `SUCCEEDED`, but no `EventTicketTransaction` records are created
- Frontend cannot display QR codes because ticket transactions don't exist

---

## What Needs to Be Implemented

### 1. Webhook Endpoint (REQUIRED)

**Endpoint:** `POST /api/webhooks/stripe` (or `/api/payments/webhooks/stripe`)

**Purpose:** Receive Stripe webhook events and process `payment_intent.succeeded` events

**Required:**
- Verify webhook signature using Stripe webhook secret
- Handle `payment_intent.succeeded` event type
- Call ticket generation service when payment succeeds for ticket purchases

### 2. Webhook Handler Method (REQUIRED)

**Method Name:** `handlePaymentIntentSucceeded(Event event)` or `handlePaymentSucceeded(Event event)`

**Location:** `StripeWebhookHandler.java`, `StripePaymentAdapter.java`, or equivalent webhook handler class

**Required Actions:**
1. ✅ Find `UserPaymentTransaction` by Stripe payment intent ID
2. ✅ Update transaction status to `SUCCEEDED`
3. ✅ **CRITICAL:** Store customer email in transaction metadata as JSON: `{"email": "...", "customerEmail": "..."}`
4. ✅ **CRITICAL:** Check if `eventId != null` or `paymentUseCase = TICKET_SALE`
5. ✅ **CRITICAL:** Create `EventTicketTransaction` if it's a ticket purchase
6. ✅ **CRITICAL:** Generate QR code and store URL in `EventTicketTransaction.qrCodeImageUrl`
7. ✅ **CRITICAL:** Send ticket email and set `EventTicketTransaction.confirmationSentAt`

### 3. Ticket Generation Service (REQUIRED)

**Service:** `TicketGenerationService.java` (or equivalent)

**Method:** `processTicketGenerationSync(UserPaymentTransaction paymentTransaction, String stripePaymentIntentId)`

**Purpose:** Synchronously create ticket transaction, generate QR code, and send email

**Required:**
- Create or find `EventTicketTransaction`
- Generate QR code using existing QR code service
- Send ticket email using existing email service
- Handle errors gracefully (log but don't fail webhook)

---

## Implementation Template

### Complete Webhook Handler Implementation

```java
@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    @Autowired
    private StripePaymentAdapter stripePaymentAdapter;

    @Autowired
    private String stripeWebhookSecret; // From environment/config

    @PostMapping
    public ResponseEntity<String> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);

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

### Complete handlePaymentIntentSucceeded Implementation

```java
@Service
public class StripePaymentAdapter {

    @Autowired
    private UserPaymentTransactionRepository transactionRepository;

    @Autowired
    private TicketGenerationService ticketGenerationService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * CRITICAL: This method MUST be implemented to create ticket transactions.
     */
    public void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
            .getObject()
            .orElseThrow(() -> new RuntimeException("Failed to deserialize PaymentIntent"));

        String stripePaymentIntentId = paymentIntent.getId();
        log.info("[StripePaymentAdapter] Processing payment_intent.succeeded webhook: {}", stripePaymentIntentId);

        // Find payment transaction
        UserPaymentTransaction transaction = transactionRepository
            .findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException(
                "Payment transaction not found for: " + stripePaymentIntentId
            ));

        // Update status
        transaction.setStatus("SUCCEEDED");
        transaction.setUpdatedAt(ZonedDateTime.now());

        // Store customer email in metadata
        String customerEmail = paymentIntent.getReceiptEmail();
        if (customerEmail != null && !customerEmail.isEmpty()) {
            Map<String, Object> metadataMap = new HashMap<>();
            if (transaction.getMetadata() != null) {
                try {
                    metadataMap = objectMapper.readValue(transaction.getMetadata(), Map.class);
                } catch (Exception e) {
                    log.debug("Failed to parse metadata, creating new map");
                }
            }
            metadataMap.put("email", customerEmail);
            metadataMap.put("customerEmail", customerEmail);
            transaction.setMetadata(objectMapper.writeValueAsString(metadataMap));
        }

        transactionRepository.save(transaction);

        // CRITICAL: Create ticket transaction if this is a ticket purchase
        Long eventId = transaction.getEvent() != null ? transaction.getEvent().getId() : null;
        if (eventId != null || "TICKET_SALE".equals(transaction.getPaymentUseCase())) {
            log.info("[StripePaymentAdapter] Creating ticket transaction for payment {}", transaction.getId());
            try {
                ticketGenerationService.processTicketGenerationSync(transaction, stripePaymentIntentId);
                log.info("[StripePaymentAdapter] Successfully created ticket transaction");
            } catch (Exception e) {
                log.error("[StripePaymentAdapter] Failed to create ticket transaction: {}", e.getMessage(), e);
                // Don't fail webhook - payment is still successful
            }
        }
    }
}
```

---

## Required Repository Methods

```java
// In UserPaymentTransactionRepository
Optional<UserPaymentTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);

// In EventTicketTransactionRepository
List<EventTicketTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);
List<EventTicketTransaction> findByTransactionReference(String transactionReference);
EventTicketTransaction save(EventTicketTransaction transaction);
```

---

## Required Service Methods

```java
// In TicketGenerationService
void processTicketGenerationSync(UserPaymentTransaction paymentTransaction, String stripePaymentIntentId) {
    // 1. Create or find EventTicketTransaction
    // 2. Generate QR code
    // 3. Send ticket email
    // 4. Store QR code URL and email sent status
}
```

---

## Stripe Dashboard Configuration

### Required Setup

1. **Webhook Endpoint URL:** `https://your-backend-domain.com/api/webhooks/stripe`
2. **Webhook Secret:** Copy from Stripe Dashboard → Webhooks → Signing secret
3. **Events:** Subscribe to `payment_intent.succeeded`

### Verification

1. Go to Stripe Dashboard → Webhooks
2. Check if endpoint exists and is active
3. Check "Recent deliveries" - should show webhook events being received
4. If no deliveries, webhook is not configured correctly

---

## Testing Checklist

### 1. Verify Webhook Handler Exists

```bash
# Search for webhook handler
find . -name "*Webhook*.java" -o -name "*Stripe*Adapter.java" | xargs grep -l "payment_intent.succeeded"
```

**Expected:** Find webhook handler class

**If NOT found:** Webhook handler needs to be implemented

### 2. Verify Webhook is Being Called

**Action:** Make test payment and check backend logs

**Expected Logs:**
```
[StripeWebhookController] Received webhook event: type=payment_intent.succeeded
[StripePaymentAdapter] Processing payment_intent.succeeded webhook: pi_...
[StripePaymentAdapter] Found payment transaction: id=5523
[TicketGenerationService] Creating EventTicketTransaction...
[TicketGenerationService] Generated QR code for ticket transaction...
[TicketGenerationService] Sent ticket email to customer@example.com
```

**If NO logs:** Webhook handler is not being called (check Stripe Dashboard configuration)

### 3. Verify Ticket Transaction is Created

**SQL Query:**
```sql
SELECT id, event_id, stripe_payment_intent_id, transaction_reference, qr_code_image_url
FROM event_ticket_transaction
WHERE stripe_payment_intent_id = 'pi_...'
   OR transaction_reference = '5523';
```

**Expected:** At least one `EventTicketTransaction` record exists

**If NO records:** Ticket transaction creation is not implemented

---

## Critical Requirements Summary

### ✅ MUST IMPLEMENT

1. **Webhook Endpoint:** `POST /api/webhooks/stripe`
2. **Webhook Handler:** `handlePaymentIntentSucceeded(Event event)`
3. **Ticket Transaction Creation:** Create `EventTicketTransaction` when `eventId != null`
4. **QR Code Generation:** Generate and store QR code URL
5. **Email Sending:** Send ticket email to customer
6. **Email Storage:** Store customer email in `UserPaymentTransaction.metadata`

### ✅ MUST CONFIGURE

1. **Stripe Dashboard:** Webhook endpoint URL configured
2. **Stripe Dashboard:** `payment_intent.succeeded` event subscribed
3. **Environment:** `STRIPE_WEBHOOK_SECRET` configured

### ✅ MUST LOG

1. `[StripeWebhookController] Received webhook event: type=payment_intent.succeeded`
2. `[StripePaymentAdapter] Processing payment_intent.succeeded webhook: pi_...`
3. `[StripePaymentAdapter] Creating ticket transaction for payment...`
4. `[TicketGenerationService] Generated QR code for ticket transaction...`
5. `[TicketGenerationService] Sent ticket email to...`

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

## Related Documents

- `BACKEND_WEBHOOK_IMPLEMENTATION_REQUIRED.md` - Complete implementation guide with code templates
- `BACKEND_FIX_PROMPT.md` - Detailed backend fixes and status mapping
- `BACKEND_WEBHOOK_VERIFICATION.md` - Webhook verification checklist

---

## Frontend Status

✅ **Frontend is READY** - It will automatically:
- Poll for ticket transactions
- Fetch QR code when ticket transaction is found
- Display QR code automatically
- Show email confirmation

**Frontend will work correctly once backend creates `EventTicketTransaction` records.**

