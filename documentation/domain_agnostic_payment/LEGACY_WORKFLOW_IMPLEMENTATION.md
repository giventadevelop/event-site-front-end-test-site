# Legacy Workflow Implementation - Payment Success Page

## Overview

The payment success page (`PaymentSuccessClient.tsx`) has been updated to use the **legacy workflow** where QR code generation and email sending are handled via separate frontend API calls, rather than relying on backend async processing.

## Why Legacy Workflow?

**Problem:** Backend ticket generation happens asynchronously via event listeners. When the payment status response is returned, the ticket transaction may not be fully created yet, so:
- QR code URL is not available in payment status response
- Email sending status is not available
- Frontend shows "Please wait while your tickets are created..." indefinitely

**Solution:** Use the legacy workflow where:
1. Frontend receives ticket transaction ID
2. Frontend makes separate API call to generate/get QR code
3. Frontend makes separate API call to send email

This ensures QR code and email are generated/sent **on-demand** when the frontend requests them, rather than waiting for async backend processing.

---

## Implementation Details

### 1. QR Code Generation

**Endpoint:** `GET /api/proxy/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/qrcode`

**Implementation:**
```typescript
// After receiving ticket transaction ID
if (!qrCodeData && ticketTransactionId && eventId) {
  const emailHostUrlPrefix = window.location.origin;
  const encodedEmailHostUrlPrefix = btoa(emailHostUrlPrefix);
  const qrRes = await fetch(
    `${baseUrl}/api/proxy/events/${eventId}/transactions/${ticketTransactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/qrcode`,
    { cache: 'no-store' }
  );
  if (qrRes.ok) {
    const qrUrl = await qrRes.text();
    if (qrUrl && qrUrl.trim()) {
      setQrCodeData({ qrCodeImageUrl: qrUrl.trim() });
      // Email is sent after QR code is successfully fetched (see below)
    }
  }
}
```

**Backend Endpoint:** `GET /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/qrcode`

This endpoint:
- Generates QR code if it doesn't exist
- Returns the QR code image URL (S3 URL)
- Triggers email sending automatically (backend handles this)

---

### 2. Email Sending

**Endpoint:** `POST /api/proxy/events/{eventId}/transactions/{transactionId}/send-ticket-email?to={email}`

**Implementation:**
```typescript
// After QR code is successfully fetched
if (qrCodeData && ticketTransaction?.email) {
  sendTicketEmailAsync({
    eventId: eventId,
    transactionId: ticketTransactionId,
    email: ticketTransaction.email
  });
}
```

**Note:** The QR code endpoint (`/qrcode`) may already trigger email sending on the backend. The separate email call ensures email is sent even if the QR endpoint doesn't trigger it.

**Backend Endpoint:** `POST /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/send-ticket-email`

---

## Code Changes Made

### File: `src/app/event/success/PaymentSuccessClient.tsx`

1. **Added Import:**
   ```typescript
   import { sendTicketEmailAsync } from '@/lib/emailUtils';
   ```

2. **Removed Dependency on Payment Status Response:**
   - Removed code that checked for `qrCodeUrl` in payment status response
   - Removed code that checked for `ticketTransactionId` in payment status response metadata
   - Now always fetches QR code separately after getting ticket transaction ID

3. **Legacy Workflow Implementation:**
   - After finding ticket transaction ID, makes separate API call to `/qrcode` endpoint
   - After QR code is successfully fetched, calls `sendTicketEmailAsync()` to send email
   - This matches the pattern from `TicketQrClient.tsx`

---

## Workflow Flow

```
1. Payment succeeds → Frontend polls payment status
2. Payment status = SUCCEEDED → Frontend calls fetchFullData()
3. fetchFullData() finds ticket transaction ID (by stripePaymentIntentId or transactionReference)
4. Frontend calls GET /api/proxy/events/{eventId}/transactions/{ticketTransactionId}/emailHostUrlPrefix/{encoded}/qrcode
5. Backend generates QR code (if not exists) and returns QR code URL
6. Frontend displays QR code
7. Frontend calls sendTicketEmailAsync() → POST /api/proxy/events/{eventId}/transactions/{ticketTransactionId}/send-ticket-email
8. Backend sends ticket email
9. Frontend shows email confirmation message
```

---

## Benefits

1. **Reliable QR Code Display:** QR code is generated on-demand when frontend requests it, ensuring it's always available
2. **Reliable Email Sending:** Email is sent via explicit API call, ensuring it's sent even if backend async processing is delayed
3. **No Dependency on Backend Async Processing:** Frontend doesn't wait for backend event listeners to complete
4. **Matches Legacy Pattern:** Uses the same workflow as `TicketQrClient.tsx`, ensuring consistency

---

## Backend Requirements

The backend must support these endpoints:

1. **QR Code Endpoint:**
   ```
   GET /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/qrcode
   ```
   - Generates QR code if it doesn't exist
   - Returns QR code image URL (plain text response)
   - May trigger email sending automatically (backend implementation)

2. **Email Endpoint:**
   ```
   POST /api/events/{eventId}/transactions/{transactionId}/emailHostUrlPrefix/{emailHostUrlPrefix}/send-ticket-email
   ```
   - Sends ticket email to the specified email address
   - Uses `emailHostUrlPrefix` for proper email context

---

## Testing

1. **Make a test payment** through checkout
2. **Verify payment success page** shows:
   - ✅ QR code displays (fetched via legacy endpoint)
   - ✅ Email confirmation message shows
   - ✅ "Please wait while your tickets are created..." disappears

3. **Check browser console logs:**
   - Should see: `[PaymentSuccessClient] Fetching QR code using legacy workflow...`
   - Should see: `[PaymentSuccessClient] QR code fetched successfully via legacy endpoint`
   - Should see: `[PaymentSuccessClient] QR code loaded successfully, sending ticket email:`

4. **Check backend logs:**
   - Should see QR code generation logs
   - Should see email sending logs

---

## Related Files

- `src/app/event/success/PaymentSuccessClient.tsx` - Updated to use legacy workflow
- `src/app/event/ticket-qr/TicketQrClient.tsx` - Reference implementation (uses same pattern)
- `src/lib/emailUtils.ts` - Email sending utility (`sendTicketEmailAsync`)
- `src/pages/api/proxy/events/[id]/transactions/[transactionId]/emailHostUrlPrefix/[emailHostUrlPrefix]/qrcode.ts` - QR code proxy endpoint
- `src/pages/api/proxy/events/[id]/transactions/[transactionId]/send-ticket-email.ts` - Email sending proxy endpoint

---

## Summary

The payment success page now uses the **legacy workflow** where:
- ✅ QR code is fetched via separate API call after receiving ticket transaction ID
- ✅ Email is sent via separate API call after QR code is successfully fetched
- ✅ No dependency on backend async processing or payment status response fields
- ✅ Matches the pattern from `TicketQrClient.tsx` for consistency

This ensures reliable QR code display and email sending, even if backend async processing is delayed.

