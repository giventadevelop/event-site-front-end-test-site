# Backend Changes Summary - Ticket Generation Fix

## Changes Made Directly in Backend Code

I've made the following changes directly in the backend codebase to fix the ticket generation issue:

### 1. **Added Synchronous Ticket Generation Method** (`TicketGenerationService.java`)

**File:** `src/main/java/com/nextjstemplate/service/payment/TicketGenerationService.java`

**Change:** Added a new `processTicketGenerationSync()` method that processes ticket generation synchronously (without `@Async`). This ensures ticket creation happens immediately when called from the webhook handler.

**Key Features:**
- Creates `EventTicketTransaction` immediately
- Generates QR code synchronously
- Sends email synchronously
- No dependency on async event listeners

### 2. **Updated Webhook Handler to Call Ticket Generation Synchronously** (`StripePaymentAdapter.java`)

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Changes:**
1. **Injected `TicketGenerationService`** into `StripePaymentAdapter` constructor
2. **Extract email from PaymentIntent** (`paymentIntent.getReceiptEmail()`) and store it in transaction metadata
3. **Call `ticketGenerationService.processTicketGenerationSync()`** directly from webhook handler (synchronously)
4. **Store customer email in metadata** before calling ticket generation, so email is available for ticket email sending
5. **CRITICAL: Added polling fallback** - When `getStatus()` detects payment changed from PENDING to SUCCEEDED, it also triggers ticket generation (in case webhooks don't fire)

**Key Code Changes:**
- Line ~656-664: Extract email from PaymentIntent (webhook handler)
- Line ~689-709: Store email in transaction metadata (webhook handler)
- Line ~715-725: Call ticket generation synchronously (webhook handler)
- Line ~768-786: Same changes for fallback path (when transaction found by external ID)
- **NEW:** Line ~350-408: Added ticket generation trigger in `getStatus()` method when status changes to SUCCEEDED (polling fallback)

### 3. **Improved Email Extraction** (`TicketGenerationService.java`)

**Change:** Enhanced `extractEmailFromPayment()` method to:
- Check both `email` and `customerEmail` fields in metadata
- Add better logging for debugging

## What These Changes Fix

1. **✅ Ticket Transaction Creation:** Now happens synchronously in webhook handler AND polling path, ensuring it's created immediately
2. **✅ QR Code Generation:** Happens synchronously as part of ticket generation
3. **✅ Email Sending:** Happens synchronously as part of ticket generation
4. **✅ Email Availability:** Email is extracted from Stripe PaymentIntent and stored in transaction metadata
5. **✅ Polling Fallback:** Ticket generation also triggers when payment status changes to SUCCEEDED via polling (in case webhooks don't fire)

## What Still Needs Verification

### 1. **Webhook Endpoint Configuration**

**Check:** Is Stripe configured to send webhooks to the backend endpoint?

**Backend Endpoint:** `POST /api/payments/webhooks/stripe`

**Required Stripe Configuration:**
- Stripe Dashboard → Developers → Webhooks
- Endpoint URL: `https://your-backend-url/api/payments/webhooks/stripe`
- Events to listen for: `payment_intent.succeeded`
- Webhook secret: Must match `webhookSecret` in `payment_provider_config` table

**How to Verify:**
1. Check Stripe Dashboard → Webhooks → Recent deliveries
2. Look for webhook events being sent to your backend
3. Check backend logs for webhook handler execution logs

### 2. **Database Trigger for `transaction_reference`**

**Issue:** The `transaction_reference` field in `EventTicketTransaction` is read-only (`insertable = false, updatable = false`), which means it must be set by a database trigger.

**Check:** Does the database trigger `trg_set_transaction_reference` exist?

**SQL to Check:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trg_set_transaction_reference';
```

**If Trigger Doesn't Exist:**
The trigger should set `transaction_reference` to the payment transaction ID when a ticket transaction is created. You may need to create this trigger or update the frontend to query by `stripePaymentIntentId` instead.

**Alternative Solution:**
Update frontend to query ticket transactions by `stripePaymentIntentId` instead of `transactionReference`:
```typescript
// Instead of: transactionReference.equals=4901
// Use: stripePaymentIntentId.equals=pi_3STbVpK5BrggeAHM1uexCsev
```

### 3. **Email Host URL Prefix Configuration**

**Check:** Is `app.email-host-url-prefix` environment variable set correctly?

**Current Code:** `@Value("${app.email-host-url-prefix:${NEXT_PUBLIC_APP_URL:http://localhost:3000}}")`

**Required:** Set `app.email-host-url-prefix` in `application.yml` or environment variables to your frontend URL (e.g., `http://localhost:3000` or production URL).

### 4. **Payment Status Response Includes QR Code**

**Status:** ✅ Already implemented

The `populateTicketData()` method in `StripePaymentAdapter` already:
- Finds ticket transaction by `stripePaymentIntentId`
- Includes `qrCodeUrl` in response if available
- Includes `ticketTransactionId` in response
- Includes `emailSent` status in response

## Testing Checklist

After deploying these changes:

1. **Make a test payment**
2. **Check backend logs for ONE of these scenarios:**

   **If webhook fires:**
   - `Processing payment_intent.succeeded webhook for payment intent: pi_...`
   - `Synchronously processed ticket generation for transaction ...`

   **OR if webhook doesn't fire (polling fallback):**
   - `Payment ... just succeeded via polling, triggering ticket generation (webhook fallback)`
   - `Successfully processed ticket generation for transaction ... via polling fallback`

   **Both scenarios should show:**
   - `Ticket transaction ... created/found for payment ...`
   - `QR code generated for ticket transaction ...`
   - `Ticket email sent for transaction ...`

3. **Verify database:**
   - `EventTicketTransaction` is created
   - `qr_code_image_url` field is populated
   - `confirmation_sent_at` field is populated (indicates email sent)

4. **Verify payment status endpoint:**
   - `GET /api/payments/{transactionId}` returns:
     - `status: "SUCCEEDED"`
     - `qrCodeUrl: "https://..."`
     - `ticketTransactionId: <number>`
     - `emailSent: true`

5. **Verify frontend:**
   - Success page displays QR code
   - Email confirmation message appears

## Expected Log Flow After Fix

### Scenario 1: Webhook Handler Executes (Preferred)
```
[Webhook Handler] Processing payment_intent.succeeded webhook for payment intent: pi_...
[Webhook Handler] Found transaction 4951 for payment intent pi_...
[Webhook Handler] Updated transaction 4951 status to SUCCEEDED
[Webhook Handler] Stored customer email ... in transaction 4951 metadata
[Webhook Handler] Synchronously processed ticket generation for transaction 4951
[Ticket Generation] Processing ticket generation synchronously for transaction: 4951
[Ticket Generation] Payment 4951 is a ticket purchase for event 2, proceeding with ticket generation
[Ticket Generation] Ticket transaction 4502 created/found for payment 4951
[Ticket Generation] QR code generated for ticket transaction 4502
[Ticket Generation] Ticket email sent for transaction 4502 to ...
[Ticket Generation] Successfully processed ticket generation for payment transaction 4951
[Payment Status] Included QR code URL in payment status response for transaction 4951: https://...
```

### Scenario 2: Polling Fallback (When Webhooks Don't Fire)
```
[Payment Status] Retrieved Stripe payment intent pi_... with status: succeeded
[Payment Status] Updated transaction 4951 status from PENDING to SUCCEEDED
[Payment Status] Stored customer email ... in transaction 4951 metadata (from polling)
[Payment Status] Payment 4951 just succeeded via polling, triggering ticket generation (webhook fallback)
[Ticket Generation] Processing ticket generation synchronously for transaction: 4951
[Ticket Generation] Payment 4951 is a ticket purchase for event 2, proceeding with ticket generation
[Ticket Generation] Ticket transaction 4502 created/found for payment 4951
[Ticket Generation] QR code generated for ticket transaction 4502
[Ticket Generation] Ticket email sent for transaction 4502 to ...
[Ticket Generation] Successfully processed ticket generation for payment transaction 4951
[Payment Status] Successfully processed ticket generation for transaction 4951 via polling fallback
[Payment Status] Included QR code URL in payment status response for transaction 4951: https://...
```

## Files Modified

1. `src/main/java/com/nextjstemplate/service/payment/TicketGenerationService.java`
   - Added `processTicketGenerationSync()` method

2. `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`
   - Injected `TicketGenerationService`
   - Added email extraction from PaymentIntent
   - Added email storage in transaction metadata
   - Added synchronous ticket generation call in webhook handler

## Next Steps

1. **Rebuild and restart backend** to apply changes
2. **Verify webhook endpoint** is configured in Stripe Dashboard
3. **Test payment flow** and check logs
4. **Verify database trigger** exists for `transaction_reference` (or update frontend query)
5. **Set `app.email-host-url-prefix`** environment variable if not already set

## If Issues Persist

1. **Check webhook logs:** Verify Stripe is sending webhooks to backend
2. **Check database trigger:** Verify `transaction_reference` is being set
3. **Check email configuration:** Verify email service is working
4. **Check QR code service:** Verify QR code generation service is working
5. **Check frontend query:** Verify frontend is querying by correct field

