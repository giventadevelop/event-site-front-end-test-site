# Fundraiser Event Implementation - Quick Summary

**For:** Backend & Frontend Teams
**Date:** January 2025
**Status:** Ready for Implementation

---

## Overview

This document provides a quick reference for implementing fundraiser events with Stripe payment, reusing the existing domain-agnostic payment infrastructure.

---

## Key Points

### ✅ What Already Exists

1. **Database Schema**: `event_details.admission_type` already supports `'DONATION_BASED'`
2. **Payment System**: Domain-agnostic payment system supports `payment_type = 'DONATION'`
3. **Stripe Integration**: Fully functional Stripe payment adapter
4. **Payment Tables**: `payment_transaction` table supports all payment types including donations

### 🎯 What Needs to Be Built

1. **Frontend Components**:
   - Donation amount selector component
   - Donation checkout page (`/events/{id}/donation`)
   - Admin UI for donation configuration

2. **Backend Logic**:
   - Donation amount validation
   - Donation-specific post-payment processing (no QR codes, no tickets)
   - Donation confirmation email sending

3. **Admin Features**:
   - UI to mark events as fundraisers
   - UI to configure donation presets and amounts

---

## Implementation Steps

### Step 1: Mark Event as Fundraiser

**Admin Action:**
- Set `event_details.admission_type = 'DONATION_BASED'`
- Configure donation presets in `event_details.metadata.donationConfig`

**Database:**
```sql
UPDATE event_details
SET admission_type = 'DONATION_BASED',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{donationConfig}',
      '{
        "presets": [25, 50, 100, 250],
        "minAmount": 10,
        "defaultAmount": 50,
        "allowCustom": true
      }'::jsonb
    )
WHERE id = {event_id};
```

### Step 2: Frontend - Donation Checkout

**User Flow:**
1. User visits event page
2. If `admission_type = 'DONATION_BASED'`, show "Make a Donation" button
3. User clicks → redirects to `/events/{id}/donation`
4. User selects donation amount (preset or custom)
5. User fills donor information
6. User completes payment via Stripe (same UI as tickets)

**API Call:**
```typescript
POST /api/proxy/payments/initialize
{
  "eventId": 123,
  "paymentType": "DONATION",
  "amount": 50.00,
  "customerEmail": "donor@example.com",
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "metadata": {
    "donationMessage": "Optional message",
    "isAnonymous": false
  }
}
```

### Step 3: Backend - Payment Processing

**Backend Flow:**
1. `PaymentOrchestrationService.initializePayment()` receives request with `paymentType: 'DONATION'`
2. Validates donation amount (checks minimum if configured)
3. Creates `PaymentTransaction` with `payment_type = 'DONATION'`
4. Calls `StripePaymentAdapter.initializePayment()` (no changes needed)
5. Returns `PaymentSession` with Stripe `clientSecret`

**Webhook Processing:**
- Stripe webhook → `StripeWebhookHandler.handlePaymentSucceeded()`
- Updates `payment_transaction.status = 'SUCCEEDED'`
- Calls `PostPaymentProcessingService.handleSuccessfulPayment()`
- For donations: Sends confirmation email (no QR code, no ticket generation)

---

## Code Changes Required

### Backend (Minimal Changes)

**File:** `PaymentOrchestrationService.java`
- Add `validateDonationAmount()` method
- Ensure donation transactions are created correctly

**File:** `PostPaymentProcessingService.java`
- Add `handleDonationSuccess()` method
- Send donation confirmation email (no ticket generation)

**No changes needed:**
- `StripePaymentAdapter` (already handles variable amounts)
- `PaymentTransaction` entity (already supports donations)
- Webhook handlers (already process all payment types)

### Frontend (New Components)

**New Files:**
1. `src/components/donation/DonationAmountSelector.tsx`
2. `src/app/events/[id]/donation/page.tsx`
3. `src/app/event/donation/success/page.tsx`

**Modified Files:**
1. `src/app/events/[id]/page.tsx` - Add "Donate" button for fundraiser events
2. `src/app/admin/events/[id]/edit/page.tsx` - Add donation configuration UI

---

## Testing Checklist

- [ ] Admin can mark event as fundraiser (`admission_type = 'DONATION_BASED'`)
- [ ] Admin can configure donation presets
- [ ] User can select preset donation amount
- [ ] User can enter custom donation amount
- [ ] Minimum donation amount is enforced
- [ ] Stripe payment UI loads correctly
- [ ] Payment succeeds and transaction is recorded
- [ ] Donation confirmation email is sent
- [ ] No QR code is generated for donations
- [ ] No ticket transaction is created for donations
- [ ] Admin can view donation list
- [ ] Admin can export donations

---

## Database Schema (No Changes Needed)

**Tables Used:**
- `event_details` - Already has `admission_type` enum including `'DONATION_BASED'`
- `payment_transaction` - Already supports `payment_type = 'DONATION'`
- `payment_provider_config` - Already configured for Stripe

**Optional Enhancement:**
- Create `donation_preset` table (or use `event_details.metadata` JSONB)

---

## API Endpoints (No New Endpoints Needed)

**Use Existing:**
- `POST /api/payments/initialize` - With `paymentType: 'DONATION'`
- `GET /api/payments/{transactionId}` - Get donation status
- `GET /api/event-details/{eventId}` - Get event (includes donation config)

---

## Key Differences: Donations vs Tickets

| Aspect | Tickets | Donations |
|--------|---------|-----------|
| Payment Type | `TICKET_SALE` | `DONATION` |
| Amount | Fixed (from ticket type) | Variable (user-specified) |
| Cart | Yes (multiple tickets) | No (single amount) |
| QR Code | Yes (for check-in) | No |
| Ticket Transaction | Yes (`event_ticket_transaction`) | No |
| Payment Transaction | Yes (`payment_transaction`) | Yes (`payment_transaction`) |
| Email | Ticket confirmation + QR | Donation receipt only |

---

## References

- **Full PRD**: [FUNDRAISER_EVENT_STRIPE_PAYMENT_PRD.md](./FUNDRAISER_EVENT_STRIPE_PAYMENT_PRD.md)
- **Domain-Agnostic Payment PRD**: [domain_agnostic_payment/PRD.md](./domain_agnostic_payment/PRD.md)
- **Database Schema**: [domain_agnostic_payment/DATABASE_SCHEMA.md](./domain_agnostic_payment/DATABASE_SCHEMA.md)

---

## Questions?

For detailed implementation guidance, refer to the full PRD document.

