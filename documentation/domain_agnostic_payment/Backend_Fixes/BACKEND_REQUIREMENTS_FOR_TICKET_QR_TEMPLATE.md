# Backend Requirements for Ticket QR Template Success Page

## Overview

The frontend uses the `TicketQrClient.tsx` template as the final success page after ticket purchase. This document outlines what the backend needs to provide to display this page correctly.

---

## Required Backend Data Structure

### 1. **Payment Status Response** (`GET /api/payments/{transactionId}`)

**Required Fields:**
```json
{
  "transactionId": "4802",
  "status": "SUCCEEDED",
  "providerType": "STRIPE",
  "amount": 20.00,
  "currency": "USD",
  "paymentMethod": "card",
  "paymentReference": "pi_3STadhK5BrggeAHM0ZZPuBSo",
  "createdAt": "2025-11-14T22:59:14.967-05:00",
  "updatedAt": "2025-11-14T22:59:17.480-05:00",

  // CRITICAL: Ticket purchase fields (only when status=SUCCEEDED and it's a ticket purchase)
  "ticketTransactionId": 12345,           // EventTicketTransaction ID
  "qrCodeUrl": "https://example.com/qr/abc123.png",  // QR code image URL - REQUIRED
  "emailSent": true,                       // Whether ticket email was sent
  "eventId": 2                             // Event ID
}
```

### 2. **Event Ticket Transaction** (`GET /api/event-ticket-transactions/{ticketTransactionId}`)

**Required Fields:**
```json
{
  "id": 12345,
  "transactionReference": "4802",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "quantity": 1,
  "pricePerUnit": 20.00,
  "totalAmount": 20.00,
  "discountAmount": 0.00,
  "finalAmount": 20.00,
  "status": "CONFIRMED",
  "paymentMethod": "card",
  "paymentReference": "pi_3STadhK5BrggeAHM0ZZPuBSo",
  "purchaseDate": "2025-11-14T22:59:14.967-05:00",
  "qrCodeImageUrl": "https://example.com/qr/abc123.png",  // QR code URL (if stored in transaction)
  "eventId": 2,
  "createdAt": "2025-11-14T22:59:14.967-05:00",
  "updatedAt": "2025-11-14T22:59:17.480-05:00"
}
```

### 3. **Event Details** (`GET /api/event-details/{eventId}`)

**Required Fields:**
```json
{
  "id": 2,
  "title": "MCEFEE Spark of Kerala",
  "caption": "A Showcase Of Performance Arts & Rhythm.",
  "description": "Event description...",
  "startDate": "2025-12-02",
  "endDate": "2025-12-18",
  "startTime": "05:00 PM",
  "endTime": "09:00 PM",
  "timezone": "America/New_York",
  "location": "Breslin Performing Arts Center, 262 S Main St, Lodi, NJ 07644"
}
```

### 4. **Event Hero Image** (`GET /api/event-medias?eventId.equals={eventId}&isHomePageHeroImage.equals=true`)

**Required Fields:**
```json
[
  {
    "id": 5350,
    "fileUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/events/...",
    "isHomePageHeroImage": true
  }
]
```

### 5. **Transaction Items** (`GET /api/event-ticket-transaction-items?eventTicketTransactionId.equals={ticketTransactionId}`)

**Required Fields:**
```json
[
  {
    "id": 1,
    "ticketTypeId": 4151,
    "ticketTypeName": "Balcony",
    "quantity": 1,
    "unitPrice": 20.00,
    "totalAmount": 20.00
  }
]
```

---

## Backend Implementation Requirements

### 1. **Webhook Handler** (CRITICAL - Currently Missing)

**When:** Stripe sends `payment_intent.succeeded` webhook

**Required Actions:**
1. ✅ Update payment transaction status to `SUCCEEDED` (already working)
2. ❌ **Create EventTicketTransaction** (if it doesn't exist)
3. ❌ **Generate QR code automatically** using `QrCodeService`
4. ❌ **Store QR code URL** in `EventTicketTransaction.qrCodeImageUrl` or metadata
5. ❌ **Send ticket email automatically** using `TicketEmailService`
6. ❌ **Store email sent status** in `EventTicketTransaction.metadata["emailSent"]`

**See:** `BACKEND_FIX_PROMPT.md` Section 1 for complete implementation

### 2. **Payment Status Endpoint** (`GET /api/payments/{transactionId}`)

**Required Changes:**
1. ✅ Return `status: "SUCCEEDED"` (uppercase) - already working
2. ❌ **Return `qrCodeUrl`** when payment is succeeded and it's a ticket purchase
3. ❌ **Return `ticketTransactionId`** when payment is succeeded and it's a ticket purchase
4. ❌ **Return `emailSent`** when payment is succeeded and it's a ticket purchase
5. ❌ **Return `eventId`** when payment is succeeded and it's a ticket purchase

**Implementation:**
```java
// In PaymentResource.getPaymentStatus()
if (paymentStatus.getStatus().equals("SUCCEEDED") && paymentTransaction.getEventId() != null) {
    // Find ticket transaction
    EventTicketTransaction ticketTransaction = eventTicketTransactionRepository
        .findByTransactionReference(paymentTransaction.getTransactionReference())
        .orElse(null);

    if (ticketTransaction != null) {
        response.setTicketTransactionId(ticketTransaction.getId());
        response.setQrCodeUrl(ticketTransaction.getQrCodeImageUrl());
        response.setEmailSent(getEmailSentStatus(ticketTransaction));
        response.setEventId(paymentTransaction.getEventId());
    }
}
```

**See:** `BACKEND_FIX_PROMPT.md` Section 2 for complete implementation

### 3. **QR Code Generation**

**Required:**
- QR code must be generated **automatically** in webhook handler
- QR code URL must be stored in `EventTicketTransaction`
- QR code URL must be returned in payment status response

**Current Issue:**
- ❌ QR code is NOT being generated automatically
- ❌ Frontend has to make separate API call to generate QR code
- ❌ This causes delays and potential duplicate email sending

**Solution:**
- Generate QR code in webhook handler when payment succeeds
- Store URL in `EventTicketTransaction.qrCodeImageUrl`
- Return URL in payment status response

### 4. **Email Sending**

**Required:**
- Ticket email must be sent **automatically** in webhook handler
- Email sent status must be stored in `EventTicketTransaction.metadata["emailSent"]`
- Email sent status must be returned in payment status response

**Current Issue:**
- ❌ Email is NOT being sent automatically
- ❌ Frontend has to trigger email sending separately
- ❌ This causes delays and potential duplicate email sending

**Solution:**
- Send ticket email in webhook handler when payment succeeds
- Store email sent status in `EventTicketTransaction.metadata`
- Return email sent status in payment status response

---

## Frontend Display Requirements

### Success Page Layout (Based on TicketQrClient Template)

1. **Hero Image Section**
   - Full-width hero image at top
   - Fetched from `/api/event-medias?eventId.equals={eventId}&isHomePageHeroImage.equals=true`

2. **Payment Success Card**
   - Green checkmark icon
   - "Payment Successful!" heading
   - Thank you message with event title and email confirmation

3. **Event Details Card**
   - Event title (large, bold)
   - Event caption (if available)
   - Date, time, location with icons
   - Event description

4. **QR Code Section**
   - "Your Ticket QR Code" heading
   - QR code image (48x48, centered)
   - Email confirmation message
   - Loading state: "Please wait while your tickets are created…"

5. **Transaction Summary Card**
   - Grid layout (2 columns on desktop, 1 on mobile)
   - Ticket # (transaction reference)
   - Name (firstName + lastName)
   - Email
   - Date of Purchase
   - Amount Paid
   - Discount Applied (if applicable)
   - Price Breakdown (if discount applied)

6. **Action Button**
   - "Return to Home" button (teal color)

---

## Data Flow

### Current Flow (Broken)
```
1. Payment succeeds → Stripe webhook sent
2. Backend updates payment status to SUCCEEDED ✅
3. Backend does NOT create ticket transaction ❌
4. Backend does NOT generate QR code ❌
5. Backend does NOT send email ❌
6. Frontend polls payment status → Gets SUCCEEDED but no qrCodeUrl ❌
7. Frontend tries to find ticket transaction → 0 results ❌
8. Frontend tries to generate QR code → No ticket transaction exists ❌
9. Success page shows WITHOUT QR code ❌
```

### Required Flow (After Backend Implementation)
```
1. Payment succeeds → Stripe webhook sent
2. Backend webhook handler:
   - Updates payment status to SUCCEEDED ✅
   - Creates EventTicketTransaction ✅
   - Generates QR code automatically ✅
   - Stores QR code URL in ticket transaction ✅
   - Sends ticket email automatically ✅
   - Stores email sent status ✅
3. Frontend polls payment status → Gets SUCCEEDED with qrCodeUrl ✅
4. Frontend displays success page WITH QR code immediately ✅
```

---

## Testing Checklist

### Backend Testing

1. **Webhook Handler**
   - [ ] Webhook handler receives `payment_intent.succeeded` event
   - [ ] Ticket transaction is created automatically
   - [ ] QR code is generated automatically
   - [ ] QR code URL is stored in ticket transaction
   - [ ] Email is sent automatically
   - [ ] Email sent status is stored in ticket transaction

2. **Payment Status Endpoint**
   - [ ] Returns `status: "SUCCEEDED"` (uppercase)
   - [ ] Returns `qrCodeUrl` when payment succeeded and it's a ticket purchase
   - [ ] Returns `ticketTransactionId` when payment succeeded and it's a ticket purchase
   - [ ] Returns `emailSent` when payment succeeded and it's a ticket purchase
   - [ ] Returns `eventId` when payment succeeded and it's a ticket purchase

3. **Ticket Transaction**
   - [ ] Ticket transaction exists after payment succeeds
   - [ ] QR code URL is stored in `qrCodeImageUrl` field
   - [ ] Email sent status is stored in metadata

### Frontend Testing

1. **Success Page Display**
   - [ ] Hero image displays correctly
   - [ ] Payment success card shows with checkmark
   - [ ] Event details display correctly
   - [ ] QR code displays immediately (from payment status response)
   - [ ] Transaction summary shows all details
   - [ ] Email confirmation message shows

2. **Data Loading**
   - [ ] Payment status is polled correctly
   - [ ] QR code URL is received from payment status response
   - [ ] Ticket transaction is fetched correctly
   - [ ] Event details are fetched correctly
   - [ ] Hero image is fetched correctly

---

## Summary

**Current Status:**
- ✅ Frontend template is ready (`TicketQrClient.tsx` layout)
- ✅ Frontend is ready to receive `qrCodeUrl` from payment status response
- ❌ Backend webhook handler is NOT implemented (no QR code generation, no email sending)
- ❌ Backend payment status endpoint does NOT return `qrCodeUrl`

**Required Backend Changes:**
1. Implement webhook handler to generate QR code and send email automatically
2. Update payment status endpoint to return `qrCodeUrl`, `ticketTransactionId`, `emailSent`, `eventId`
3. Store QR code URL and email sent status in ticket transaction

**See:**
- `BACKEND_FIX_PROMPT.md` - Complete backend implementation guide
- `BACKEND_WEBHOOK_VERIFICATION.md` - Webhook verification checklist
- `FRONTEND_READY_SUMMARY.md` - Frontend readiness summary

