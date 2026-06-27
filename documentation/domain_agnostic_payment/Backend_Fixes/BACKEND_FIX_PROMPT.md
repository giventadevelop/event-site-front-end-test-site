# Backend Fix Required: Payment Status Endpoint Must Return Database Status for Polling

## ⚠️ COMPILATION ERROR FIX REQUIRED (IMMEDIATE)

### Error 1: Missing ObjectMapper Import

**Error:** `cannot find symbol: class ObjectMapper` in `StripePaymentAdapter.java:43`

**Fix:** Add the missing import statement at the top of `StripePaymentAdapter.java`:

```java
import com.fasterxml.jackson.databind.ObjectMapper;
```

**Location:** Add this import with the other imports at the top of the file (around line 1-20).

**Why:** The code uses `ObjectMapper` to serialize/deserialize JSON metadata, but the import statement is missing.

---

### Error 2: Lambda Expression Variable Must Be Final (CRITICAL)

**Error:** `local variables referenced from a lambda expression must be final or effectively final` at lines 744, 754, 755, 757, 820, 830, 831, 833 in `StripePaymentAdapter.java`

**Problem:** Variables used inside lambda expressions must be `final` or effectively final (not reassigned). The code modifies variables like `customerEmail`, `metadataMap`, `transaction`, `eventId`, `stripePaymentIntentId` and then uses them in lambdas.

**Fix:** Create final copies of variables before using them in lambda expressions. Here's the corrected code pattern:

**For the polling fallback section (around line 350-408):**

```java
// CRITICAL: Update database transaction status if it changed
String oldStatus = transaction.getStatus();
boolean statusChanged = !mappedStatus.equals(oldStatus);
if (statusChanged) {
    transaction.setStatus(mappedStatus);
    transaction.setUpdatedAt(ZonedDateTime.now());

    // CRITICAL: Store customer email from PaymentIntent if payment succeeded
    if ("SUCCEEDED".equals(mappedStatus)) {
        // Create final copy of customerEmail before using in lambda
        final String customerEmailFinal;
        if (paymentIntent.getReceiptEmail() != null && !paymentIntent.getReceiptEmail().isEmpty()) {
            customerEmailFinal = paymentIntent.getReceiptEmail();
        } else {
            customerEmailFinal = null;
        }

        if (customerEmailFinal != null && !customerEmailFinal.isEmpty()) {
            try {
                Map<String, Object> metadataMap = new HashMap<>();
                if (transaction.getMetadata() != null && !transaction.getMetadata().isEmpty()) {
                    try {
                        metadataMap = objectMapper.readValue(transaction.getMetadata(), Map.class);
                    } catch (Exception e) {
                        log.debug("Failed to parse existing metadata, creating new metadata map");
                    }
                }
                metadataMap.put("email", customerEmailFinal);
                metadataMap.put("customerEmail", customerEmailFinal);
                transaction.setMetadata(objectMapper.writeValueAsString(metadataMap));
                log.info("Stored customer email {} in transaction {} metadata (from polling)", customerEmailFinal, transactionId);
            } catch (Exception e) {
                log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
            }
        }

        // Create final copies for lambda usage
        final UserPaymentTransaction transactionFinal = transaction;
        final String stripePaymentIntentIdFinal = stripePaymentIntentId;

        transactionRepository.save(transaction);
        log.info("Updated transaction {} status from {} to {}", transactionId, oldStatus, mappedStatus);

        // CRITICAL: If payment just succeeded and it's a ticket purchase, trigger ticket generation
        if ("SUCCEEDED".equals(mappedStatus) && !"SUCCEEDED".equals(oldStatus)) {
            // Check if this is a ticket purchase (has eventId)
            Long eventId = transactionFinal.getEvent() != null ? transactionFinal.getEvent().getId() : null;
            if (eventId != null) {
                log.info("Payment {} just succeeded via polling, triggering ticket generation (webhook fallback)", transactionId);
                try {
                    ticketGenerationService.processTicketGenerationSync(transactionFinal, stripePaymentIntentIdFinal);
                    log.info("Successfully processed ticket generation for transaction {} via polling fallback", transactionId);
                } catch (Exception e) {
                    log.error("Failed to process ticket generation for transaction {} via polling fallback: {}",
                        transactionId, e.getMessage(), e);
                    // Don't fail status check - ticket generation can be retried
                }
            } else {
                log.debug("Payment {} succeeded but is not a ticket purchase (no eventId), skipping ticket generation", transactionId);
            }
        }
    } else {
        transactionRepository.save(transaction);
        log.info("Updated transaction {} status from {} to {}", transactionId, oldStatus, mappedStatus);
    }
}
```

**For the webhook handler section (around line 656-786):**

Apply the same pattern - create final copies before using in lambdas:

```java
// Extract email and create final copy
final String customerEmailFinal;
if (paymentIntent.getReceiptEmail() != null && !paymentIntent.getReceiptEmail().isEmpty()) {
    customerEmailFinal = paymentIntent.getReceiptEmail();
} else {
    customerEmailFinal = null;
}

// Create final copies for lambda usage
final UserPaymentTransaction transactionFinal = transaction;
final String stripePaymentIntentIdFinal = stripePaymentIntentId;

// Now use the final copies in lambdas or method calls
if (customerEmailFinal != null && !customerEmailFinal.isEmpty()) {
    // ... metadata handling code ...
}

// Use final copies in method calls
ticketGenerationService.processTicketGenerationSync(transactionFinal, stripePaymentIntentIdFinal);
```

**Key Changes:**
1. Create `final` copies of variables before using them in lambdas: `final String customerEmailFinal = customerEmail;`
2. Use the final copies in lambda expressions or method calls
3. Don't reassign variables that will be used in lambdas

**Why:** Java requires variables used in lambda expressions to be effectively final (not reassigned after initialization). Creating final copies ensures the lambda can capture the variable value safely.

---

## 🚨🚨🚨 CRITICAL: Webhook Handler NOT Creating Ticket Transactions (URGENT)

**IMMEDIATE ISSUE:** Backend logs show payment status is updating to SUCCEEDED, but **NO EventTicketTransaction is being created**. This means:
- ❌ No ticket transaction exists (query returns 0 results)
- ❌ QR code cannot be generated (no ticket transaction to generate QR for)
- ❌ Email cannot be sent (no ticket transaction to send email for)
- ❌ Frontend shows "Please wait while your tickets are created…" indefinitely

**Backend Logs Show:**
```
Updated transaction 4851 status from PENDING to SUCCEEDED ✅
Query: transactionReference.equals=4851 → Page 1 of 0 containing UNKNOWN instances ❌
```

**Problem:** The Stripe webhook handler is **NOT being triggered** OR **NOT creating EventTicketTransaction** when payment succeeds.

**Required Fix:**
1. **Verify webhook handler exists** and is configured in Stripe Dashboard
2. **Implement webhook handler** to create EventTicketTransaction when `payment_intent.succeeded` is received
3. **Generate QR code automatically** in webhook handler
4. **Send email automatically** in webhook handler
5. **Return qrCodeUrl in payment status response** so frontend can display it immediately

**See Section "CRITICAL: Automatic Ticket Generation" below for complete implementation.**

---

## 🚨 CRITICAL: Payment Status Mapping Issue (Causing Timeout)

**IMMEDIATE ISSUE:** The backend is returning Stripe's lowercase status (`"succeeded"`) but the frontend expects uppercase enum (`"SUCCEEDED"`). This causes the frontend polling to timeout because it never recognizes the payment as successful.

**Backend Logs Show:**
```
Retrieved Stripe payment intent pi_3STZZEK5BrggeAHM077SZGGD with status: succeeded
Exit: getPaymentStatus() with result = <200 OK OK,PaymentSessionResponse@...>
```

**Problem:** Backend returns `status: "succeeded"` (lowercase) but frontend expects `status: "SUCCEEDED"` (uppercase).

**Required Fix:** The `StripePaymentAdapter.getStatus()` method MUST map Stripe's status to uppercase:
- `"succeeded"` → `"SUCCEEDED"`
- `"processing"` → `"PROCESSING"`
- `"canceled"` → `"CANCELLED"`
- `"payment_failed"` → `"FAILED"`

**See Section "CRITICAL: Status Mapping" below for implementation details.**

---

## Problem Summary

The `PaymentResource.getPaymentStatus()` endpoint currently returns a **400 Bad Request error** when a payment transaction exists but doesn't have a Stripe payment intent ID. This prevents the frontend from polling and detecting when payment status changes from PENDING to SUCCEEDED.

## Critical Issue: Polling Cannot Detect Status Changes

**Current Behavior:**
- Frontend polls `/api/payments/{transactionId}` every 2 seconds
- Backend returns 400 Bad Request for PENDING transactions without Stripe payment intent ID
- Frontend treats 400 as PENDING status and continues polling
- Backend keeps returning 400 errors, so status never appears to change
- Frontend times out after 60 seconds with "Payment status check timed out"

**Required Behavior:**
- Backend should return **200 OK** with transaction status from database when Stripe payment intent ID is missing
- Frontend can then poll and see status change from PENDING → SUCCEEDED when Stripe processes the payment
- Polling works correctly and users see success page when payment completes

## Error Details

**Backend Error Log:**
```
2025-11-14T13:38:15.461-05:00  WARN  --- [  XNIO-1 task-5] c.n.s.p.adapter.StripePaymentAdapter     : Transaction 4453 does not have a Stripe payment intent ID
2025-11-14T13:38:15.462-05:00 ERROR  --- [  XNIO-1 task-5] c.n.s.p.adapter.StripePaymentAdapter     : Exception in getStatus() with cause = 'NULL' and exception = 'Payment transaction 4453 does not have a Stripe payment intent ID'
com.nextjstemplate.service.payment.PaymentException: Payment transaction 4453 does not have a Stripe payment intent ID
```

**Frontend Error:**
```
[ProxyHandler ERROR] SyntaxError: Unexpected end of JSON input
    at JSON.parse (<anonymous>)
    at async handler (src\lib\proxyHandler.ts:209:24)
GET /api/proxy/payments/4453 500 in 1075ms
```

**Request Flow:**
1. Frontend calls: `GET /api/proxy/payments/4453` (where `4453` is the internal transaction ID)
2. Backend receives: `GET /api/payments/4453`
3. Backend calls: `PaymentOrchestrationService.getStatus(4453)`
4. Backend calls: `StripePaymentAdapter.getStatus(4453, config)`
5. Backend finds transaction 4453 but it has no `stripePaymentIntentId`
6. **BUG**: Backend throws `PaymentException` but returns 404 with empty body ❌
7. Frontend tries to parse empty body as JSON and fails

## Root Cause

The `PaymentResource.getPaymentStatus()` endpoint is catching the `PaymentException` but returning a 404 response with an empty body instead of a proper JSON error response. The frontend expects a JSON response even for error cases.

## Expected Behavior

1. **First**: Look up the internal payment transaction by ID (`4453`)
2. **Extract**: Get the `stripePaymentIntentId` field from the transaction record
3. **If missing**: **CRITICAL**: Return the transaction status from the database directly (200 OK with PaymentStatusResponse), NOT an error response. This allows the frontend to poll and see status changes.
4. **If present**: Use that Stripe payment intent ID to query Stripe's API and return the Stripe payment status

## Database Schema Reference

The `user_payment_transaction` table has:
- `id` (BIGINT) - Internal transaction ID (e.g., `4408`)
- `stripe_payment_intent_id` (VARCHAR) - Stripe payment intent ID (e.g., `pi_1A2B3C4D5E6F7G8H`)

## Code Location

**File:** `StripePaymentAdapter.java` (or equivalent)
**Method:** `getStatus(Long transactionId, PaymentProviderConfig config)`

**Current Implementation (Incorrect):**
```java
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    // BUG: Using transactionId directly as Stripe payment intent ID
    PaymentIntent paymentIntent = PaymentIntent.retrieve(String.valueOf(transactionId));
    // ...
}
```

## Required Fix

### Fix 1: PaymentResource.getPaymentStatus() - Return Transaction Status Directly

**File:** `PaymentResource.java`

**Current Implementation (Incorrect):**
```java
@GetMapping("/{transactionId}")
public ResponseEntity<?> getPaymentStatus(@PathVariable Long transactionId) {
    try {
        PaymentStatusResponse status = paymentOrchestrationService.getStatus(transactionId);
        return ResponseEntity.ok(status);
    } catch (PaymentException e) {
        // BUG: Returns 404 with empty body OR 400 with error
        // This prevents frontend polling from seeing status changes
        return ResponseEntity.notFound().build();
    }
}
```

**Correct Implementation:**
```java
@GetMapping("/{transactionId}")
public ResponseEntity<?> getPaymentStatus(@PathVariable Long transactionId) {
    try {
        PaymentStatusResponse status = paymentOrchestrationService.getStatus(transactionId);
        return ResponseEntity.ok(status);
    } catch (PaymentException e) {
        // Only return error if transaction truly doesn't exist
        if (e.getMessage().contains("not found")) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("transactionId", transactionId);
            errorResponse.put("errorCode", "TRANSACTION_NOT_FOUND");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        // For other PaymentExceptions (e.g., missing Stripe payment intent),
        // the adapter should return database status, not throw exception
        // But if it does throw, return 500 with error details
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", e.getMessage());
        errorResponse.put("transactionId", transactionId);
        errorResponse.put("errorCode", "PAYMENT_STATUS_ERROR");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    } catch (Exception e) {
        // Handle other exceptions
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Failed to get payment status");
        errorResponse.put("details", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
```

### Fix 2: StripePaymentAdapter.getStatus() - Better Error Messages

**File:** `StripePaymentAdapter.java`

**Current Implementation (Incorrect):**
```java
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    // Finds transaction but throws exception if no Stripe payment intent ID
    UserPaymentTransaction transaction = paymentTransactionRepository
        .findById(transactionId)
        .orElseThrow(() -> new PaymentException("Transaction not found: " + transactionId));

    String stripePaymentIntentId = transaction.getStripePaymentIntentId();
    if (stripePaymentIntentId == null || stripePaymentIntentId.isEmpty()) {
        throw new PaymentException(
            "Payment transaction " + transactionId +
            " does not have a Stripe payment intent ID");
    }
    // ... rest of implementation
}
```

**Correct Implementation:**
```java
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    // Step 1: Look up the internal payment transaction
    UserPaymentTransaction transaction = paymentTransactionRepository
        .findById(transactionId)
        .orElseThrow(() -> new PaymentException(
            "Payment transaction not found: " + transactionId));

    // Step 2: Extract the Stripe payment intent ID
    String stripePaymentIntentId = transaction.getStripePaymentIntentId();

    if (stripePaymentIntentId == null || stripePaymentIntentId.isEmpty()) {
        // CRITICAL: Return transaction status from database directly, don't throw error
        // This allows frontend polling to see status changes (PENDING -> SUCCEEDED)
        PaymentStatusResponse response = new PaymentStatusResponse();
        response.setTransactionId(transactionId);
        response.setStatus(transaction.getStatus()); // Return status from DB (PENDING, SUCCEEDED, etc.)
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setEventId(transaction.getEventId());
        // Set any other fields from transaction that are needed
        return response;
    }

    // Step 3: Use the Stripe payment intent ID to query Stripe
    try {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(stripePaymentIntentId);
        // Step 4: Map Stripe response to PaymentStatusResponse
        PaymentStatusResponse response = new PaymentStatusResponse();
        response.setTransactionId(transactionId);
        // CRITICAL: Map Stripe payment intent status to uppercase enum (succeeded → SUCCEEDED)
        String stripeStatus = paymentIntent.getStatus(); // e.g., "succeeded" (lowercase)
        String mappedStatus = mapStripeStatusToPaymentStatus(stripeStatus); // e.g., "SUCCEEDED" (uppercase)
        response.setStatus(mappedStatus);
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setEventId(transaction.getEventId());
        // Set payment reference from Stripe payment intent
        response.setPaymentReference(paymentIntent.getId());

        // CRITICAL: Also update database transaction status if it's different
        // This ensures future calls return the correct status even if Stripe API is unavailable
        if (!mappedStatus.equals(transaction.getStatus())) {
            transaction.setStatus(mappedStatus);
            paymentTransactionRepository.save(transaction);
            log.info("Updated transaction {} status from {} to {}", transactionId, transaction.getStatus(), mappedStatus);
        }

        return response;
    } catch (StripeException e) {
        // If Stripe API fails, fall back to database status
        PaymentStatusResponse response = new PaymentStatusResponse();
        response.setTransactionId(transactionId);
        response.setStatus(transaction.getStatus()); // Return status from DB
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setEventId(transaction.getEventId());
        // Log the Stripe error but return database status
        log.warn("Failed to retrieve Stripe payment intent {} for transaction {}: {}. Returning database status.",
            stripePaymentIntentId, transactionId, e.getMessage());
        return response;
    }
}
```

## Additional Considerations

1. **Null Check**: Handle cases where `stripePaymentIntentId` is null (e.g., for non-Stripe payments, manual payments, or incomplete transactions)

2. **Error Handling**: Return appropriate HTTP status codes:
   - `404` with JSON body if transaction not found
   - `200` with PaymentStatusResponse if transaction exists but has no Stripe payment intent ID (return database status)
   - `200` with PaymentStatusResponse if Stripe API call fails (fall back to database status)
   - `500` with JSON body only for unexpected errors
   - **CRITICAL**: Never return empty response body, always return JSON
   - **CRITICAL**: Never return 400 for PENDING transactions without Stripe payment intent ID - return 200 with database status instead. This allows frontend polling to work correctly.

3. **Provider Abstraction**: Ensure this pattern is consistent across all payment provider adapters (not just Stripe)

4. **Logging**: Add debug logging to track:
   - Internal transaction ID received
   - Stripe payment intent ID extracted
   - Stripe API call made

## Testing

**Test Cases:**
1. ✅ Valid transaction with Stripe payment intent ID → Should return Stripe payment status (200 OK)
2. ✅ Transaction not found → Should return 404 with JSON error
3. ✅ Transaction exists but no Stripe payment intent ID → Should return 200 OK with database transaction status (PENDING, SUCCEEDED, etc.)
4. ✅ Stripe payment intent ID exists but Stripe API fails → Should return 200 OK with database transaction status (fallback)
5. ✅ PENDING transaction without Stripe payment intent ID → Should return 200 OK with status=PENDING, allowing frontend polling to detect when status changes to SUCCEEDED

## Related Files

- `PaymentResource.java` - REST controller endpoint
- `PaymentOrchestrationService.java` - Orchestration layer
- `StripePaymentAdapter.java` - Stripe-specific adapter (needs fix)
- `UserPaymentTransaction.java` - Entity class
- `PaymentTransactionRepository.java` - Repository interface

## Impact

**Current Impact:**
- Payment status lookup fails for all transactions
- Frontend receives 500 errors instead of proper payment status
- Users cannot verify payment status after checkout

**After Fix:**
- Payment status lookup works correctly
- Frontend receives proper payment status responses
- Users can verify payment status successfully

## Priority

**HIGH** - This is blocking payment status verification functionality.

---

## Frontend Polling Behavior

**Note:** The frontend has been updated to:
1. Handle empty/error responses gracefully (returns JSON error objects instead of crashing)
2. Handle 400 Bad Request responses for PENDING transactions without Stripe payment intent IDs
3. **Poll the payment status endpoint every 2 seconds** when a transaction is in PENDING state
4. Show a continuous loading message with the event's hero image while polling
5. Automatically stop polling when payment reaches a terminal state (SUCCEEDED, FAILED, CANCELLED) or after 60 seconds

**Frontend Polling Details:**
- Polls `/api/proxy/payments/{transactionId}` every 2 seconds
- Maximum 30 polling attempts (60 seconds total)
- Shows loading UI with hero image during polling
- Only shows success page when status is SUCCEEDED

**Backend Requirements:**
- **CRITICAL**: The backend MUST return transaction status from the database (200 OK) when there's no Stripe payment intent ID, NOT a 400 error. This is essential for polling to work.
- Backend should return proper JSON responses (not empty bodies)
- Backend should handle PENDING transactions gracefully by returning database status directly (200 OK with status=PENDING), allowing frontend polling to detect status changes
- When Stripe payment intent ID is missing, return the transaction status from the database so frontend can see when it changes from PENDING to SUCCEEDED
- Only return 400/404 errors when the transaction truly doesn't exist or there's an unexpected error

## 🚨🚨🚨 CRITICAL WEBHOOK ISSUE: No Ticket Transaction Being Created (VERIFIED FROM LOGS)

**VERIFIED ISSUE FROM BACKEND LOGS:**
```
✅ Payment Status Update: Updated transaction 4851 status from PENDING to SUCCEEDED
❌ Ticket Transaction Query: GET /api/event-ticket-transactions?transactionReference.equals=4851
   → Page 1 of 0 containing UNKNOWN instances (NO RESULTS)
❌ Webhook Handler Logs: NONE FOUND
```

**Current Problem:**
- ✅ Payment status IS updating to SUCCEEDED (working correctly)
- ❌ **NO EventTicketTransaction is being created** (webhook handler NOT working)
- ❌ **NO QR code generation** (no ticket transaction exists)
- ❌ **NO email sending** (no ticket transaction exists)
- ❌ Frontend shows "Please wait while your tickets are created…" indefinitely

**Root Cause:**
The Stripe webhook handler is either:
1. **NOT receiving webhook events** (webhook not configured in Stripe Dashboard)
2. **NOT processing `payment_intent.succeeded` events** (webhook handler not implemented)
3. **NOT creating EventTicketTransaction** (webhook handler exists but doesn't create tickets)

**Required Webhook Fix (URGENT):**
1. **Verify webhook endpoint exists** and is configured in Stripe Dashboard
2. **Check webhook logs** to see if events are being received
3. **Implement webhook handler** to create EventTicketTransaction when `payment_intent.succeeded` is received
4. **Generate QR code automatically** in webhook handler
5. **Send email automatically** in webhook handler
6. **Update payment status endpoint** to return `qrCodeUrl` when ticket transaction exists

**See Section "CRITICAL: Automatic Ticket Generation" below for complete implementation code.**

**Testing:**
1. Make a test payment through Stripe
2. Check Stripe Dashboard → Webhooks → Recent deliveries (verify webhook is being sent)
3. Check backend logs for webhook handler execution
4. Verify EventTicketTransaction is created (query should return 1 result, not 0)
5. Verify QR code is generated (check ticket transaction `qrCodeImageUrl` field)
6. Verify email is sent (check ticket transaction metadata `emailSent` field)
7. Verify payment status endpoint returns `qrCodeUrl` when ticket transaction exists

---

## CRITICAL: Automatic Ticket Generation, QR Code Creation, and Email Sending on Payment Success

### Problem Summary

After payment succeeds, users are seeing "Payment completed. Please try again." instead of the success page with QR code. The frontend workflow previously made separate API calls to generate tickets, QR codes, and send emails, but this should happen automatically in the backend when payment succeeds.

### Current Workflow (Frontend-Based - Needs to Move to Backend)

**Frontend currently does:**
1. Payment succeeds → Frontend detects SUCCEEDED status
2. Frontend calls `/api/proxy/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/qrcode` to generate QR code
3. Frontend calls `/api/proxy/events/{eventId}/transactions/{transactionId}/send-ticket-email?to={email}` to send email

**Problem:** This requires multiple frontend API calls and can fail if the user navigates away or if there are network issues.

### Required Backend Workflow (Automatic)

**Backend should automatically:**
1. When payment succeeds (`payment_intent.succeeded` webhook received)
2. Check if `paymentUseCase = TICKET_SALE` (or check if transaction has `eventId`)
3. **Automatically generate ticket transaction** (already done ✅)
4. **Automatically generate QR code** by calling the QR code generation endpoint internally
5. **Automatically send ticket email** by calling the email sending endpoint internally
6. Return success response with all data ready

### Implementation Requirements

#### 1. Update Stripe Webhook Handler (`StripeWebhookHandler.java` or equivalent)

**File:** `StripeWebhookHandler.java` or webhook processing service

**When to Trigger:**
- On `payment_intent.succeeded` event
- On `checkout.session.completed` event (if not already handled)
- **CRITICAL**: Only for ticket purchases (`paymentUseCase = TICKET_SALE` or transaction has `eventId`)

**Required Actions:**

```java
@EventListener
public void handlePaymentIntentSucceeded(PaymentIntentSucceededEvent event) {
    PaymentIntent paymentIntent = event.getPaymentIntent();

    // Step 1: Find the payment transaction
    UserPaymentTransaction paymentTransaction = paymentTransactionRepository
        .findByStripePaymentIntentId(paymentIntent.getId())
        .orElse(null);

    if (paymentTransaction == null) {
        log.warn("Payment transaction not found for payment intent: {}", paymentIntent.getId());
        return;
    }

    // Step 2: Check if this is a ticket purchase
    if (paymentTransaction.getPaymentUseCase() != PaymentUseCase.TICKET_SALE) {
        log.debug("Payment {} is not a ticket purchase, skipping ticket generation", paymentTransaction.getId());
        return;
    }

    Long eventId = paymentTransaction.getEventId();
    if (eventId == null) {
        log.warn("Payment transaction {} has no eventId, cannot generate ticket", paymentTransaction.getId());
        return;
    }

    // Step 3: Find or create EventTicketTransaction
    EventTicketTransaction ticketTransaction = findOrCreateTicketTransaction(paymentTransaction);

    if (ticketTransaction == null || ticketTransaction.getId() == null) {
        log.error("Failed to create ticket transaction for payment {}", paymentTransaction.getId());
        return;
    }

    // Step 4: Generate QR code automatically and store URL in ticket transaction
    String qrCodeUrl = null;
    try {
        String emailHostUrlPrefix = getEmailHostUrlPrefix(); // Get from config or environment
        qrCodeUrl = generateQrCodeForTransaction(eventId, ticketTransaction.getId(), emailHostUrlPrefix);

        // CRITICAL: Store QR code URL in ticket transaction so it can be returned in payment status response
        if (qrCodeUrl != null && !qrCodeUrl.isEmpty()) {
            // Option 1: Store in dedicated field (if available)
            if (ticketTransaction.getQrCodeUrl() == null) {
                ticketTransaction.setQrCodeUrl(qrCodeUrl);
            }

            // Option 2: Store in metadata (fallback if no dedicated field)
            Map<String, Object> metadata = ticketTransaction.getMetadata();
            if (metadata == null) {
                metadata = new HashMap<>();
            }
            metadata.put("qrCodeUrl", qrCodeUrl);
            ticketTransaction.setMetadata(metadata);

            // Save updated ticket transaction
            eventTicketTransactionRepository.save(ticketTransaction);

            log.info("QR code generated and stored for transaction {}: {}", ticketTransaction.getId(), qrCodeUrl);
        } else {
            log.warn("QR code generation returned empty URL for transaction {}", ticketTransaction.getId());
        }
    } catch (Exception e) {
        log.error("Failed to generate QR code for transaction {}: {}", ticketTransaction.getId(), e.getMessage());
        // Continue even if QR generation fails - email can still be sent
    }

    // Step 5: Send ticket email automatically
    try {
        String email = paymentTransaction.getMetadata() != null
            ? extractEmailFromMetadata(paymentTransaction.getMetadata())
            : null;

        if (email == null || email.isEmpty()) {
            log.warn("No email found for payment transaction {}, cannot send ticket email", paymentTransaction.getId());
            return;
        }

        boolean emailSent = sendTicketEmailForTransaction(eventId, ticketTransaction.getId(), email, emailHostUrlPrefix);

        // CRITICAL: Store email sent status in ticket transaction metadata
        Map<String, Object> metadata = ticketTransaction.getMetadata();
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        metadata.put("emailSent", emailSent);
        ticketTransaction.setMetadata(metadata);
        eventTicketTransactionRepository.save(ticketTransaction);

        log.info("Ticket email sent for transaction {} to {}: {}", ticketTransaction.getId(), email, emailSent ? "SUCCESS" : "FAILED");
    } catch (Exception e) {
        log.error("Failed to send ticket email for transaction {}: {}", ticketTransaction.getId(), e.getMessage());
        // Log error but don't fail webhook - payment is still successful
        // Mark email as not sent in metadata
        Map<String, Object> metadata = ticketTransaction.getMetadata();
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        metadata.put("emailSent", false);
        ticketTransaction.setMetadata(metadata);
        eventTicketTransactionRepository.save(ticketTransaction);
    }
}

private EventTicketTransaction findOrCreateTicketTransaction(UserPaymentTransaction paymentTransaction) {
    // Try to find existing ticket transaction by payment reference
    EventTicketTransaction existing = eventTicketTransactionRepository
        .findByStripePaymentIntentId(paymentTransaction.getStripePaymentIntentId())
        .orElse(null);

    if (existing != null) {
        return existing;
    }

    // Create new ticket transaction from payment transaction
    EventTicketTransaction ticketTransaction = new EventTicketTransaction();
    ticketTransaction.setEmail(extractEmailFromPayment(paymentTransaction));
    ticketTransaction.setFirstName(extractFirstNameFromPayment(paymentTransaction));
    ticketTransaction.setLastName(extractLastNameFromPayment(paymentTransaction));
    ticketTransaction.setPhone(extractPhoneFromPayment(paymentTransaction));
    ticketTransaction.setEventId(paymentTransaction.getEventId());
    ticketTransaction.setStatus("COMPLETED");
    ticketTransaction.setFinalAmount(paymentTransaction.getAmount());
    ticketTransaction.setStripePaymentIntentId(paymentTransaction.getStripePaymentIntentId());
    ticketTransaction.setPaymentReference(paymentTransaction.getPaymentReference());
    ticketTransaction.setPurchaseDate(paymentTransaction.getCreatedAt());
    // Set other required fields...

    return eventTicketTransactionRepository.save(ticketTransaction);
}

private String generateQrCodeForTransaction(Long eventId, Long transactionId, String emailHostUrlPrefix) {
    // Call the existing QR code generation endpoint internally
    // This should use the same logic as GET /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/qrcode
    try {
        QrCodeService qrCodeService = applicationContext.getBean(QrCodeService.class);
        return qrCodeService.generateQrCodeForTransaction(eventId, transactionId, emailHostUrlPrefix);
    } catch (Exception e) {
        log.error("QR code generation failed: {}", e.getMessage());
        throw e;
    }
}

private boolean sendTicketEmailForTransaction(Long eventId, Long transactionId, String email, String emailHostUrlPrefix) {
    // Call the existing email sending endpoint internally
    // This should use the same logic as POST /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/send-ticket-email?to={email}
    try {
        TicketEmailService emailService = applicationContext.getBean(TicketEmailService.class);
        emailService.sendTicketEmail(eventId, transactionId, email, emailHostUrlPrefix);
        return true; // Email sent successfully
    } catch (Exception e) {
        log.error("Ticket email sending failed: {}", e.getMessage());
        return false; // Email sending failed
    }
}
```

#### 2. Update Payment Status Endpoint to Return Complete Ticket Data (Including QR Code URL)

**File:** `PaymentResource.java` or `PaymentStatusResponse.java`

**CRITICAL: Status Mapping**
- Stripe returns `status: "succeeded"` (lowercase)
- Frontend expects `status: "SUCCEEDED"` (uppercase enum)
- Backend MUST map Stripe status to uppercase: `"succeeded" → "SUCCEEDED"`

**CRITICAL: QR Code URL Must Be Returned in Payment Status Response**

**When payment status is SUCCEEDED and it's a ticket purchase, the response MUST include:**
- Ticket transaction ID (`ticketTransactionId`)
- **QR code URL (`qrCodeUrl`)** - **REQUIRED** for frontend to display QR code immediately
- Email sent status (`emailSent`)
- Event ID (`eventId`)

**Why This Is Critical:**
- Frontend currently makes a separate API call to fetch QR code after payment succeeds
- This causes delay and potential failures if user navigates away
- **Backend should return QR code URL immediately in payment status response** so frontend can display it right away
- QR code should already be generated by webhook handler (see Section 1 above)

**Example Response Structure:**
```java
{
  "transactionId": "4606",
  "status": "SUCCEEDED", // MUST be uppercase, not "succeeded"
  "amount": 20.00,
  "currency": "USD",
  "ticketTransactionId": 12345, // EventTicketTransaction ID
  "qrCodeUrl": "https://example.com/qr/abc123.png", // QR code image URL - REQUIRED for ticket purchases
  "emailSent": true, // Whether ticket email was sent
  "eventId": 2
}
```

**Required Changes to PaymentStatusResponse DTO:**

```java
@Data
@Builder
public class PaymentStatusResponse {
    private String transactionId;
    private String status; // e.g., "SUCCEEDED", "PENDING", "FAILED"
    private PaymentProviderType providerType;
    private Double amount;
    private String currency;
    private String paymentMethod;
    private String paymentReference;
    private String failureReason;
    private PaymentSettlementInfo settlementInfo;
    private Map<String, Object> metadata;
    private String createdAt;

    // NEW FIELDS FOR TICKET PURCHASES (only populated when status=SUCCEEDED and it's a ticket purchase)
    private Long ticketTransactionId; // EventTicketTransaction ID
    private String qrCodeUrl; // QR code image URL - REQUIRED for frontend display
    private Boolean emailSent; // Whether ticket email was sent
    private Long eventId; // Event ID for ticket purchases
}
```

**Implementation in StripePaymentAdapter.getStatus():**

```java
public PaymentStatusResponse getStatus(Long transactionId, PaymentProviderConfig config) {
    // ... existing code to retrieve transaction and payment intent ...

    PaymentStatusResponse response = new PaymentStatusResponse();
    response.setTransactionId(String.valueOf(transactionId));
    response.setStatus(mappedStatus); // Already mapped to uppercase

    // ... set other fields ...

    // CRITICAL: If payment succeeded and it's a ticket purchase, include QR code URL
    if ("SUCCEEDED".equals(mappedStatus)) {
        Long eventId = transaction.getEventId();
        if (eventId != null) {
            // This is a ticket purchase - include ticket data
            response.setEventId(eventId);

            // Find the EventTicketTransaction associated with this payment
            EventTicketTransaction ticketTransaction = eventTicketTransactionRepository
                .findByStripePaymentIntentId(transaction.getStripePaymentIntentId())
                .orElse(null);

            if (ticketTransaction != null && ticketTransaction.getId() != null) {
                response.setTicketTransactionId(ticketTransaction.getId());

                // Get QR code URL from ticket transaction (should be set by webhook handler)
                // QR code URL might be stored in ticket transaction metadata or a separate field
                String qrCodeUrl = extractQrCodeUrlFromTicketTransaction(ticketTransaction);
                response.setQrCodeUrl(qrCodeUrl);

                // Check if email was sent (might be stored in metadata or a separate field)
                Boolean emailSent = checkIfEmailWasSent(ticketTransaction);
                response.setEmailSent(emailSent);
            }
        }
    }

    return response;
}

private String extractQrCodeUrlFromTicketTransaction(EventTicketTransaction ticketTransaction) {
    // Option 1: QR code URL is stored in a dedicated field
    if (ticketTransaction.getQrCodeUrl() != null) {
        return ticketTransaction.getQrCodeUrl();
    }

    // Option 2: QR code URL is stored in metadata
    if (ticketTransaction.getMetadata() != null) {
        Object qrCodeUrl = ticketTransaction.getMetadata().get("qrCodeUrl");
        if (qrCodeUrl != null) {
            return qrCodeUrl.toString();
        }
    }

    // Option 3: Generate QR code URL on-the-fly if not stored
    // This should only be a fallback - webhook handler should have generated it
    try {
        String emailHostUrlPrefix = getEmailHostUrlPrefix();
        return qrCodeService.generateQrCodeForTransaction(
            ticketTransaction.getEventId(),
            ticketTransaction.getId(),
            emailHostUrlPrefix
        );
    } catch (Exception e) {
        log.warn("Failed to generate QR code URL for transaction {}: {}",
            ticketTransaction.getId(), e.getMessage());
        return null;
    }
}

private Boolean checkIfEmailWasSent(EventTicketTransaction ticketTransaction) {
    // Check metadata or a dedicated field for email sent status
    if (ticketTransaction.getMetadata() != null) {
        Object emailSent = ticketTransaction.getMetadata().get("emailSent");
        if (emailSent != null) {
            return Boolean.parseBoolean(emailSent.toString());
        }
    }
    // Default to false if not found
    return false;
}
```

**Status Mapping Code (REQUIRED in StripePaymentAdapter.getStatus()):**
```java
/**
 * Maps Stripe payment intent status (lowercase) to our PaymentStatus enum (uppercase).
 * CRITICAL: Frontend expects uppercase enum values (SUCCEEDED, FAILED, etc.)
 *
 * @param stripeStatus Stripe payment intent status (e.g., "succeeded", "processing")
 * @return Uppercase status enum (e.g., "SUCCEEDED", "PROCESSING")
 */
private String mapStripeStatusToPaymentStatus(String stripeStatus) {
    if (stripeStatus == null || stripeStatus.isEmpty()) {
        return "PENDING";
    }

    // Normalize to lowercase for case-insensitive comparison
    String normalizedStatus = stripeStatus.toLowerCase().trim();

    switch (normalizedStatus) {
        case "succeeded":
            return "SUCCEEDED"; // CRITICAL: Uppercase for frontend enum
        case "processing":
            return "PROCESSING";
        case "requires_payment_method":
        case "requires_confirmation":
        case "requires_action":
        case "requires_capture":
            return "PENDING";
        case "canceled":
        case "cancelled":
            return "CANCELLED";
        case "payment_failed":
        case "failed":
            return "FAILED";
        default:
            log.warn("Unknown Stripe payment status: {}, defaulting to PENDING", stripeStatus);
            return "PENDING";
    }
}
```

**Where to Add This Method:**
- **File:** `StripePaymentAdapter.java`
- **Location:** Add as a private helper method in the same class
- **Usage:** Call `mapStripeStatusToPaymentStatus(paymentIntent.getStatus())` when building `PaymentStatusResponse`

**Example Usage in getStatus() method:**
```java
PaymentIntent paymentIntent = PaymentIntent.retrieve(stripePaymentIntentId);
String stripeStatus = paymentIntent.getStatus(); // e.g., "succeeded"
String mappedStatus = mapStripeStatusToPaymentStatus(stripeStatus); // e.g., "SUCCEEDED"
response.setStatus(mappedStatus); // Set uppercase status
```

### Backend Endpoints to Use Internally

The backend should call these endpoints internally (or use the same service methods):

1. **QR Code Generation:**
   - Endpoint: `GET /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/qrcode`
   - Service Method: `QrCodeService.generateQrCodeForTransaction(eventId, transactionId, emailHostUrlPrefix)`

2. **Email Sending:**
   - Endpoint: `POST /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/send-ticket-email?to={email}`
   - Service Method: `TicketEmailService.sendTicketEmail(eventId, transactionId, email, emailHostUrlPrefix)`

### Conditional Logic

**Only perform automatic ticket generation if:**
- `paymentUseCase == TICKET_SALE` OR
- `eventId != null` (transaction is associated with an event)

**Skip automatic generation if:**
- `paymentUseCase == MEMBERSHIP_SUBSCRIPTION` (membership payments)
- `paymentUseCase == DONATION` (donation payments)
- `eventId == null` (not an event-related payment)

### Error Handling

- **QR Code Generation Failure:** Log error but don't fail webhook. Payment is still successful.
- **Email Sending Failure:** Log error but don't fail webhook. Payment is still successful.
- **Ticket Transaction Creation Failure:** Log error but don't fail webhook. Payment is still successful.

**Rationale:** Webhook failures cause Stripe to retry, which can cause duplicate transactions. It's better to log errors and handle them separately than to fail the webhook.

### Email Host URL Prefix

The backend needs to determine the `emailHostUrlPrefix` for QR code generation and email sending. Options:

1. **From Environment Variable:** `NEXT_PUBLIC_APP_URL` or `APP_URL`
2. **From Payment Metadata:** Store `emailHostUrlPrefix` in payment transaction metadata
3. **From Configuration:** Store in tenant configuration or application config

**Recommended:** Use environment variable with fallback to metadata.

### Testing Requirements

1. **Test Payment Success Flow:**
   - Make a test payment for tickets
   - Verify webhook is received
   - Verify ticket transaction is created
   - Verify QR code is generated (check database or logs)
   - Verify email is sent (check email logs or test email inbox)

2. **Test Non-Ticket Payments:**
   - Make a membership subscription payment
   - Verify webhook is received
   - Verify ticket generation is **skipped** (no ticket transaction created)

3. **Test Error Scenarios:**
   - Payment succeeds but QR generation fails → Verify payment still succeeds, error is logged
   - Payment succeeds but email sending fails → Verify payment still succeeds, error is logged

### Frontend Impact

**After backend implementation:**
- Frontend will receive payment status with `status=SUCCEEDED`
- **Frontend will receive `qrCodeUrl` in payment status response** - can display QR code immediately ✅
- Frontend will receive `ticketTransactionId` - can fetch additional ticket details if needed
- Frontend will receive `emailSent` status - can show confirmation message
- **Frontend no longer needs to make separate API calls for QR code generation** ✅
- **Frontend no longer needs to make separate API calls for email sending** ✅
- User experience is smoother - everything happens automatically in the backend
- QR code displays immediately on success page without additional loading time

**Frontend Code Changes Required:**
- Update `PaymentSuccessClient.tsx` to use `qrCodeUrl` from payment status response instead of making separate API call
- Remove separate QR code fetching logic (lines 250-266 in current implementation)
- Display QR code directly from `paymentTransaction.qrCodeUrl` if available

### Priority

**HIGH** - This is blocking the payment success flow and causing user confusion with "Payment completed. Please try again." message.

---

## Summary: Required Backend Changes

### 1. **CRITICAL: Fix Status Mapping in StripePaymentAdapter.getStatus()**

**File:** `StripePaymentAdapter.java`

**Action:** Add `mapStripeStatusToPaymentStatus()` method and use it when building `PaymentStatusResponse`

**Why:** Backend returns `"succeeded"` (lowercase) but frontend expects `"SUCCEEDED"` (uppercase), causing polling timeout.

**Code Location:** In `getStatus()` method, when retrieving Stripe payment intent:
```java
PaymentIntent paymentIntent = PaymentIntent.retrieve(stripePaymentIntentId);
String stripeStatus = paymentIntent.getStatus(); // Returns "succeeded" (lowercase)
String mappedStatus = mapStripeStatusToPaymentStatus(stripeStatus); // Returns "SUCCEEDED" (uppercase)
response.setStatus(mappedStatus); // Use mapped status, not raw Stripe status
```

### 2. **CRITICAL: Automatic QR Code Generation and Email Sending in Webhook Handler**

**File:** Stripe webhook handler (e.g., `StripeWebhookHandler.java`)

**Action:** When `payment_intent.succeeded` event is received for ticket purchases:
1. Generate QR code automatically
2. Store QR code URL in `EventTicketTransaction` metadata or dedicated field
3. Send ticket email automatically
4. Store email sent status in `EventTicketTransaction` metadata

**Why:** Frontend currently makes separate API calls which can fail or delay QR code display. Backend should handle this automatically.

**Code Location:** In webhook handler `handlePaymentIntentSucceeded()` method:
```java
// Generate QR code
String qrCodeUrl = generateQrCodeForTransaction(eventId, ticketTransaction.getId(), emailHostUrlPrefix);
// Store QR code URL in ticket transaction
ticketTransaction.setQrCodeUrl(qrCodeUrl); // or store in metadata
eventTicketTransactionRepository.save(ticketTransaction);

// Send email
boolean emailSent = sendTicketEmailForTransaction(eventId, ticketTransaction.getId(), email, emailHostUrlPrefix);
// Store email sent status
metadata.put("emailSent", emailSent);
ticketTransaction.setMetadata(metadata);
eventTicketTransactionRepository.save(ticketTransaction);
```

### 3. **CRITICAL: Return QR Code URL in Payment Status Response**

**File:** `PaymentStatusResponse.java` and `StripePaymentAdapter.java`

**Action:**
1. Add `qrCodeUrl`, `ticketTransactionId`, `emailSent`, and `eventId` fields to `PaymentStatusResponse` DTO
2. In `StripePaymentAdapter.getStatus()`, when payment status is `SUCCEEDED` and it's a ticket purchase, populate these fields from the `EventTicketTransaction`

**Why:** Frontend needs QR code URL immediately in payment status response to display it without making additional API calls.

**Code Location:** In `getStatus()` method, after setting status:
```java
if ("SUCCEEDED".equals(mappedStatus)) {
    Long eventId = transaction.getEventId();
    if (eventId != null) {
        // Find EventTicketTransaction
        EventTicketTransaction ticketTransaction = eventTicketTransactionRepository
            .findByStripePaymentIntentId(transaction.getStripePaymentIntentId())
            .orElse(null);

        if (ticketTransaction != null) {
            response.setTicketTransactionId(ticketTransaction.getId());
            response.setQrCodeUrl(extractQrCodeUrlFromTicketTransaction(ticketTransaction));
            response.setEmailSent(checkIfEmailWasSent(ticketTransaction));
            response.setEventId(eventId);
        }
    }
}
```

### 4. **Update Database Transaction Status When Status Changes**

**File:** `StripePaymentAdapter.java`

**Action:** After mapping Stripe status, update database transaction if status changed

**Why:** Ensures database reflects current payment status, even if Stripe API is unavailable later.

**Code Location:** After mapping status in `getStatus()` method:
```java
if (!mappedStatus.equals(transaction.getStatus())) {
    transaction.setStatus(mappedStatus);
    paymentTransactionRepository.save(transaction);
}
```

### 5. **Test Complete Flow**

**Test Cases:**
1. ✅ Payment succeeds → Backend returns `status: "SUCCEEDED"` (uppercase)
2. ✅ Webhook handler generates QR code and stores URL in ticket transaction
3. ✅ Webhook handler sends ticket email and stores status
4. ✅ Payment status response includes `qrCodeUrl` for ticket purchases
5. ✅ Frontend polling recognizes `SUCCEEDED` status and shows success page
6. ✅ Frontend displays QR code immediately from payment status response (no separate API call needed)
7. ✅ Database transaction status is `SUCCEEDED` (uppercase) after webhook processing

### Expected Behavior After Fix

**Before Fix:**
- Backend returns: `{ "status": "succeeded" }` (lowercase, no QR code URL)
- Frontend polling: Times out after 60 seconds ❌
- Frontend makes separate API call to fetch QR code ❌
- User sees: "Payment status check timed out" or missing QR code ❌

**After Fix:**
- Backend returns: `{ "status": "SUCCEEDED", "qrCodeUrl": "https://...", "ticketTransactionId": 12345, "emailSent": true }` ✅
- Webhook handler automatically generates QR code and sends email ✅
- Frontend polling: Recognizes `SUCCEEDED` immediately ✅
- Frontend displays QR code immediately from response (no separate API call) ✅
- User sees: Success page with QR code displayed immediately ✅


