# Frontend & Backend Issues Analysis - Fundraiser Event Payment Flow

## Date: 2025-11-17
## Event ID: 4101 (Fundraiser Event)

## Issues Identified

### 1. Payment Provider Routing Issue (Backend)

**Problem**: Event 4101 is marked as a fundraiser event but is still using Stripe instead of Givebutter.

**Root Cause**: The backend `PaymentOrchestrationService.determineProvider()` method needs to check event metadata to route fundraiser events to Givebutter.

**Expected Behavior**:
- Frontend calls `/api/proxy/payments/initialize` with `eventId: 4101` and `paymentUseCase: TICKET_SALE`
- Backend should:
  1. Fetch event details for eventId 4101
  2. Parse `event_details.metadata` JSON string
  3. Check if `isFundraiserEvent: true` and `donationConfig.useZeroFeeProvider: true` and `donationConfig.zeroFeeProvider: "GIVEBUTTER"`
  4. If conditions met, route to `GivebutterPaymentAdapter` instead of `StripePaymentAdapter`

**Backend Fix Required** (in `E:\project_workspace\malayalees-us-site-boot`):
- Update `PaymentOrchestrationService.determineProvider()` method
- Add event metadata parsing logic
- Check fundraiser configuration before defaulting to Stripe
- See: `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_BACKEND_PRD.html` lines 232-340

**Frontend Status**: ✅ Frontend is correctly sending `eventId` in payment initialization request.

---

### 2. QR Code Not Displaying (Backend + Frontend)

**Problem**: QR code is not appearing on success page after payment.

**Root Cause Analysis**:
1. **Backend Issue**: Ticket transaction is not being created/found
   - Logs show: `Page 1 of 0 containing UNKNOWN instances` when querying by `stripePaymentIntentId`
   - Query: `stripePaymentIntentId.equals=pi_3SULY2K5BrggeAHM0mJtXf84&eventId.equals=4101`
   - Result: Empty array (0 results)

2. **Frontend Issue**: QR code fetch depends on ticket transaction existing
   - `PaymentSuccessClient.tsx` lines 643-756: QR code fetch requires `ticketTransaction.id`
   - If ticket transaction doesn't exist, QR code can't be fetched

**Expected Flow**:
1. Payment succeeds → Backend creates `user_payment_transaction` record
2. Backend webhook handler creates `event_ticket_transaction` record
3. Frontend polls for ticket transaction by `stripePaymentIntentId`
4. Once found, frontend fetches QR code from `/api/proxy/events/{eventId}/transactions/{ticketId}/qrcode`
5. QR code displays on success page

**Current Issue**: Step 2 (ticket transaction creation) is failing or delayed.

**Backend Fix Required**:
- Verify webhook handler creates ticket transaction after payment succeeds
- Ensure `stripePaymentIntentId` is correctly stored in `event_ticket_transaction` table
- Check if Givebutter webhook handler creates ticket transactions (may be missing)

**Frontend Status**: ✅ QR code fetching logic is correct, but depends on ticket transaction existing.

---

### 3. Email Confirmation Not Sending (Frontend)

**Problem**: Email confirmation is not being sent after successful payment.

**Root Cause**: Email sending logic depends on QR code being fetched first.

**Code Location**: `src/app/event/success/PaymentSuccessClient.tsx` lines 714-730

```typescript
// Send email after QR code is successfully fetched
const emailToUse = ticketTransaction?.email || paymentTransaction?.metadata?.customerEmail;
if (emailToUse) {
  if (eventId && ticketId) {
    sendTicketEmailAsync({
      eventId: eventId,
      transactionId: ticketId,
      email: emailToUse
    });
  }
}
```

**Issue**: This code only runs if:
1. QR code fetch succeeds (`qrRes.ok === true`)
2. QR code URL is not empty (`qrUrlText.trim()`)
3. Ticket transaction exists (`ticketId`)

**Fix Required**:
- Email should be sent even if QR code fetch fails (as a fallback)
- Add retry logic for email sending
- Consider sending email immediately after ticket transaction is found, not waiting for QR code

**Frontend Fix**:
- Move email sending to trigger when ticket transaction is found, not when QR code is fetched
- Add fallback email sending if QR code fetch fails

---

### 4. Multiple API Calls (Frontend Polling)

**Problem**: Logs show repeated calls to `/api/proxy/event-ticket-transactions` every 2 seconds.

**Root Cause**: Polling logic is working as designed, but ticket transaction is never found.

**Code Location**: `src/app/event/success/PaymentSuccessClient.tsx` lines 498-623

**Current Behavior**:
- Polls every 2 seconds for up to 30 seconds (15 attempts)
- Stops when ticket transaction is found OR max attempts reached
- Logs show polling continues because ticket transaction is never found

**Fix Required**:
- This is expected behavior, but the root cause (ticket transaction not being created) needs to be fixed
- Consider increasing polling timeout for Givebutter payments (may take longer)
- Add better error messaging when ticket transaction is not found after max attempts

---

## Summary of Required Fixes

### Backend Fixes (E:\project_workspace\malayalees-us-site-boot)

1. **Payment Provider Routing**:
   - Update `PaymentOrchestrationService.determineProvider()` to check event metadata
   - Parse `event_details.metadata` JSON string
   - Route to Givebutter if fundraiser event with Givebutter configured

2. **Ticket Transaction Creation**:
   - Verify webhook handler creates `event_ticket_transaction` after payment succeeds
   - Ensure `stripePaymentIntentId` is stored correctly
   - For Givebutter payments: Ensure Givebutter webhook handler creates ticket transactions

3. **QR Code Generation**:
   - Ensure QR code endpoint works for Givebutter transactions
   - Verify ticket transaction has correct `stripePaymentIntentId` or equivalent identifier

### Frontend Fixes (Current Project)

1. **Email Sending Logic**:
   - Move email sending to trigger when ticket transaction is found (not when QR code is fetched)
   - Add fallback email sending if QR code fetch fails
   - Add retry logic for email sending

2. **Error Handling**:
   - Add better error messages when ticket transaction is not found
   - Show user-friendly message if QR code can't be generated
   - Consider increasing polling timeout for Givebutter payments

3. **Payment Provider Display**:
   - Add UI indicator showing which payment provider is being used
   - Show "Processing with Givebutter" message for fundraiser events

---

## Testing Checklist

### For Fundraiser Events (Event ID 4101):

- [ ] Payment initialization routes to Givebutter (not Stripe)
- [ ] User is redirected to Givebutter checkout page
- [ ] After payment, ticket transaction is created
- [ ] QR code displays on success page
- [ ] Email confirmation is sent
- [ ] Success page shows correct event details

### For Regular Events:

- [ ] Payment initialization routes to Stripe
- [ ] User completes payment via Stripe
- [ ] Ticket transaction is created
- [ ] QR code displays on success page
- [ ] Email confirmation is sent

---

## References

- Backend PRD: `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_BACKEND_PRD.html`
- Frontend PRD: `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_FRONTEND_PRD.html`
- Database Schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- Event Utils: `src/lib/eventUtils.ts`
- Payment Success Client: `src/app/event/success/PaymentSuccessClient.tsx`
- Email Utils: `src/lib/emailUtils.ts`



