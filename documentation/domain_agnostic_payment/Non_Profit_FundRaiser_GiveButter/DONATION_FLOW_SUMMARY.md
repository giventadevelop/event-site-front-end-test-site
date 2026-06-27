# GiveButter Donation Flow - Control Flow Summary

## Overview
This document explains how events are determined as donation-based and how the payment flow is routed from admin setup to end-user purchase.

---

## 1. Event Configuration (Admin Setup)

### 1.1 Admin Configures Event in EventForm

**Location**: `src/components/EventForm.tsx`

**Configuration Fields**:
1. **Admission Type** (`admissionType`):
   - Options: `FREE`, `TICKETED`, `INVITATION_ONLY`, `DONATION_BASED`
   - If set to `DONATION_BASED` → Event is automatically donation-based

2. **Fundraiser/Charity Checkboxes**:
   - `isFundraiserEvent` checkbox
   - `isCharityEvent` checkbox
   - **Mutually exclusive** (checking one unchecks the other)

3. **Zero-Fee Provider Configuration**:
   - `useZeroFeeProvider` checkbox (auto-enabled when fundraiser/charity is checked)
   - `zeroFeeProvider` dropdown (auto-set to `GIVEBUTTER` when fundraiser/charity is checked)
   - `givebutterCampaignId` text field (optional)

**Data Storage**:
- `admissionType` → Stored in `event_details.admission_type` (enum)
- `isFundraiserEvent`, `isCharityEvent`, `zeroFeeProvider`, `givebutterCampaignId` → Stored in `event_details.donation_metadata` (JSON string)

**Example donationMetadata JSON**:
```json
{
  "isFundraiserEvent": true,
  "isCharityEvent": false,
  "zeroFeeProvider": "GIVEBUTTER",
  "givebutterCampaignId": "campaign_12345"
}
```

---

## 2. Event Detection Logic

### 2.1 Frontend Detection Function

**Location**: `src/lib/donation/utils.ts` → `isDonationBasedEvent()`

**Detection Rules**:
```typescript
Event is donation-based if:
1. admissionType === 'DONATION_BASED' 
   OR
2. (isFundraiserEvent === true OR isCharityEvent === true) 
   AND zeroFeeProvider === 'GIVEBUTTER'
```

**Usage**:
- Used in event list pages (`/events`, `/events/[id]`) to show "Make a Donation" button
- Used in donation checkout page to verify event supports donations

---

## 3. User-Facing Flow Decision Tree

### 3.1 Event Page Display Logic

**Location**: `src/app/events/[id]/page.tsx` and `src/app/events/page.tsx`

**Button Display Rules**:

```
IF event.admissionType === 'TICKETED' AND event is upcoming:
  → Show "Buy Tickets" button → Routes to /events/[id]/checkout (existing Stripe flow)

IF isDonationBasedEvent(event) === true AND event is upcoming:
  → Show "Make a Donation" button → Routes to /events/[id]/donation (new GiveButter flow)

IF event.isRegistrationRequired === true AND event is upcoming:
  → Show "Register Here" button → Routes to /events/[id]/register
```

**Key Point**: An event can be BOTH ticketed AND donation-based:
- If `admissionType === 'TICKETED'` AND `isFundraiserEvent === true` with `zeroFeeProvider === 'GIVEBUTTER'`
- User sees "Buy Tickets" button
- Backend automatically routes payment to GiveButter (not Stripe)
- Frontend uses existing checkout flow (`/events/[id]/checkout`)

---

## 4. Payment Flow Routing

### 4.1 Donation-Only Events (admissionType === 'DONATION_BASED')

**User Flow**:
1. User visits event page → Sees "Make a Donation" button
2. User clicks "Make a Donation" → Routes to `/events/[id]/donation`
3. User fills donation form (amount, email, name, phone, prayer intention)
4. User clicks "Donate" → Frontend calls `POST /api/proxy/payments/initialize` with:
   ```json
   {
     "eventId": 123,
     "paymentType": "DONATION_ZERO_FEE",
     "paymentProvider": "GIVEBUTTER",
     "amount": 25.00,
     "email": "donor@example.com",
     "firstName": "John",
     "lastName": "Doe",
     "metadata": {
       "givebutterCampaignId": "campaign_12345",
       "isFundraiser": true,
       "isCharity": false,
       "prayerIntention": "For my family"
     },
     "returnUrl": "http://localhost:3000/events/123/donation/success",
     "cancelUrl": "http://localhost:3000/events/123"
   }
   ```
5. Backend returns GiveButter checkout URL → Frontend redirects user to GiveButter
6. User completes payment on GiveButter → GiveButter redirects to `/events/[id]/donation/success?transactionId=xxx`
7. Success page polls payment status → Creates donation transaction → Generates QR code → Sends email

---

### 4.2 Ticketed Fundraiser Events (admissionType === 'TICKETED' + isFundraiserEvent === true)

**User Flow**:
1. User visits event page → Sees "Buy Tickets" button (NOT "Make a Donation")
2. User clicks "Buy Tickets" → Routes to `/events/[id]/checkout` (existing checkout flow)
3. User selects tickets and fills form
4. User clicks "Checkout" → Frontend calls `POST /api/proxy/payments/initialize` with:
   ```json
   {
     "paymentUseCase": "TICKET_SALE",
     "eventId": 123,
     "amount": 50.00,
     "items": [
       {
         "itemType": "TICKET",
         "itemId": 456,
         "quantity": 2,
         "unitPrice": 25.00
       }
     ],
     "customerEmail": "buyer@example.com"
   }
   ```
5. **Backend Routing Logic** (in backend service):
   - Backend receives `eventId` in request
   - Backend queries event metadata from database
   - Backend checks: `isFundraiserEvent === true` AND `zeroFeeProvider === 'GIVEBUTTER'`
   - **If true**: Backend routes to GiveButter adapter (returns GiveButter checkout URL)
   - **If false**: Backend routes to Stripe adapter (returns Stripe checkout URL)
6. Frontend receives checkout URL (GiveButter or Stripe) → Redirects user
7. User completes payment → Redirects to success page
8. Success page polls payment status → Creates ticket transaction → Generates QR code → Sends email

**Key Point**: Frontend doesn't know which provider will be used. Backend makes the routing decision based on event metadata.

---

## 5. Backend Payment Routing Logic

### 5.1 Backend Decision Flow (Backend Implementation Required)

**Location**: Backend service (`E:\project_workspace\malayalees-us-site-boot`)

**Routing Logic** (pseudo-code):
```java
private ProviderType determineProvider(PaymentInitializeRequest request) {
    // For TICKET_SALE payments, check event metadata
    if (request.getPaymentUseCase() == PaymentUseCase.TICKET_SALE) {
        if (request.getEventId() != null) {
            EventDetails event = eventRepository.findById(request.getEventId());
            
            if (event != null && event.getDonationMetadata() != null) {
                // Parse donationMetadata JSON string
                Map<String, Object> donationMeta = parseJSON(event.getDonationMetadata());
                
                Boolean isFundraiser = (Boolean) donationMeta.get("isFundraiserEvent");
                Boolean isCharity = (Boolean) donationMeta.get("isCharityEvent");
                String zeroFeeProvider = (String) donationMeta.get("zeroFeeProvider");
                
                // Route to GiveButter if fundraiser/charity with GIVEBUTTER provider
                if ((isFundraiser == true || isCharity == true) 
                    && "GIVEBUTTER".equals(zeroFeeProvider)) {
                    return ProviderType.GIVEBUTTER;
                }
            }
        }
    }
    
    // For DONATION_ZERO_FEE payments, always use GiveButter
    if (request.getPaymentType() == PaymentType.DONATION_ZERO_FEE) {
        return ProviderType.GIVEBUTTER;
    }
    
    // Default: Stripe
    return ProviderType.STRIPE;
}
```

**Critical Backend Requirements**:
1. Backend must check `event.donationMetadata` (JSON string) for fundraiser/charity flags
2. Backend must parse JSON string (not JSONB) - use Jackson ObjectMapper
3. Backend must check `zeroFeeProvider === 'GIVEBUTTER'` before routing
4. Backend must verify tenant has GiveButter configured in `payment_provider_config` table

---

## 6. Complete Control Flow Diagram

### 6.1 Admin Setup Flow

```
Admin → EventForm.tsx
  ├─ Sets admissionType = 'DONATION_BASED' OR
  ├─ Checks isFundraiserEvent = true
  ├─ (Auto-enables useZeroFeeProvider)
  ├─ (Auto-sets zeroFeeProvider = 'GIVEBUTTER')
  └─ Saves to database:
      ├─ event_details.admission_type = 'DONATION_BASED' (if set)
      └─ event_details.donation_metadata = JSON string:
          {
            "isFundraiserEvent": true,
            "zeroFeeProvider": "GIVEBUTTER",
            "givebutterCampaignId": "..."
          }
```

### 6.2 User Purchase Flow - Donation-Only Event

```
User → Event Page (/events/[id])
  ├─ Frontend calls isDonationBasedEvent(event)
  ├─ Returns true (admissionType === 'DONATION_BASED')
  ├─ Shows "Make a Donation" button
  └─ User clicks → Routes to /events/[id]/donation

User → Donation Checkout Page
  ├─ Selects donation amount ($5, $10, $25, $50, $100, or custom)
  ├─ Enters email, name, phone (optional)
  ├─ Enters prayer intention (optional)
  ├─ Clicks "Donate"
  └─ Frontend calls initializeDonationPayment() server action
      ├─ POST /api/proxy/payments/initialize
      ├─ Body: { paymentType: 'DONATION_ZERO_FEE', paymentProvider: 'GIVEBUTTER', ... }
      └─ Backend returns: { checkoutUrl: "https://givebutter.com/..." }
          └─ Frontend redirects to GiveButter checkout

User → GiveButter Checkout
  ├─ Completes payment on GiveButter
  └─ GiveButter redirects to /events/[id]/donation/success?transactionId=xxx

User → Donation Success Page
  ├─ Frontend polls payment status (every 2 seconds, max 30 attempts)
  ├─ Polls: GET /api/proxy/payments/{transactionId}
  ├─ When status === 'SUCCEEDED':
  │   ├─ Fetches donation transaction: GET /api/proxy/donation-transactions/{transactionId}
  │   ├─ Generates QR code: POST /api/proxy/events/{id}/donations/{transactionId}/qrcode
  │   └─ Sends email: POST /api/proxy/events/{id}/donations/{transactionId}/send-email
  └─ Displays success page with QR code and confirmation
```

### 6.3 User Purchase Flow - Ticketed Fundraiser Event

```
User → Event Page (/events/[id])
  ├─ Frontend checks: event.admissionType === 'TICKETED'
  ├─ Returns true
  ├─ Shows "Buy Tickets" button (NOT "Make a Donation")
  └─ User clicks → Routes to /events/[id]/checkout (existing checkout)

User → Ticket Checkout Page
  ├─ Selects tickets
  ├─ Enters email, name, phone
  ├─ Applies discount code (optional)
  ├─ Clicks "Checkout"
  └─ Frontend calls UniversalPaymentCheckout component
      ├─ POST /api/proxy/payments/initialize
      ├─ Body: { paymentUseCase: 'TICKET_SALE', eventId: 123, items: [...], ... }
      └─ Backend routing decision:
          ├─ Backend queries event metadata
          ├─ Checks: isFundraiserEvent === true AND zeroFeeProvider === 'GIVEBUTTER'
          ├─ If true: Routes to GiveButter → Returns GiveButter checkout URL
          └─ If false: Routes to Stripe → Returns Stripe checkout URL
              └─ Frontend redirects to returned checkout URL

User → Payment Provider Checkout (GiveButter or Stripe)
  ├─ Completes payment
  └─ Redirects to /event/success?transactionId=xxx

User → Success Page
  ├─ Frontend polls payment status
  ├─ When status === 'SUCCEEDED':
  │   ├─ Fetches ticket transaction
  │   ├─ Generates QR code
  │   └─ Sends email
  └─ Displays success page with QR code and confirmation
```

---

## 7. Key Differences Between Flows

### 7.1 Donation-Only Flow vs Ticketed Fundraiser Flow

| Aspect | Donation-Only Flow | Ticketed Fundraiser Flow |
|--------|-------------------|-------------------------|
| **Button Shown** | "Make a Donation" | "Buy Tickets" |
| **Route** | `/events/[id]/donation` | `/events/[id]/checkout` |
| **Frontend Component** | `DonationCheckoutClient` | `CheckoutClient` (existing) |
| **Payment Type** | `DONATION_ZERO_FEE` | `TICKET_SALE` |
| **Payment Provider** | Always `GIVEBUTTER` | Backend decides (GiveButter or Stripe) |
| **Backend Routing** | Always GiveButter (explicit) | Conditional (based on event metadata) |
| **Transaction Table** | `donation_transaction` | `event_ticket_transaction` |
| **Success Route** | `/events/[id]/donation/success` | `/event/success` |

---

## 8. Event Configuration Examples

### Example 1: Pure Donation Event (No Tickets)

**Admin Configuration**:
- `admissionType` = `'DONATION_BASED'`
- `isFundraiserEvent` = `false` (not needed)
- `isCharityEvent` = `false` (not needed)

**User Experience**:
- Event page shows "Make a Donation" button
- Routes to `/events/[id]/donation`
- Always uses GiveButter

---

### Example 2: Fundraiser Event with Tickets

**Admin Configuration**:
- `admissionType` = `'TICKETED'`
- `isFundraiserEvent` = `true`
- `zeroFeeProvider` = `'GIVEBUTTER'`
- `givebutterCampaignId` = `'campaign_12345'`

**User Experience**:
- Event page shows "Buy Tickets" button
- Routes to `/events/[id]/checkout` (existing flow)
- Backend automatically routes to GiveButter (not Stripe)
- User purchases tickets, but payment goes through GiveButter

---

### Example 3: Charity Event with Tickets

**Admin Configuration**:
- `admissionType` = `'TICKETED'`
- `isCharityEvent` = `true`
- `zeroFeeProvider` = `'GIVEBUTTER'`

**User Experience**:
- Same as Example 2 (fundraiser with tickets)

---

## 9. Database Schema Reference

### 9.1 Event Details Table

```sql
event_details:
  - id: BIGINT
  - admission_type: ENUM('FREE', 'TICKETED', 'INVITATION_ONLY', 'DONATION_BASED')
  - donation_metadata: TEXT (JSON string)
```

### 9.2 Donation Metadata JSON Structure

```json
{
  "isFundraiserEvent": true,
  "isCharityEvent": false,
  "zeroFeeProvider": "GIVEBUTTER",
  "givebutterCampaignId": "campaign_12345"
}
```

### 9.3 Donation Transaction Table

```sql
donation_transaction:
  - id: BIGINT
  - tenant_id: VARCHAR(255)
  - event_id: BIGINT (nullable)
  - payment_transaction_id: BIGINT (links to payment orchestration)
  - transaction_reference: VARCHAR(255) UNIQUE
  - givebutter_donation_id: VARCHAR(255)
  - amount: DECIMAL(10,2)
  - email: VARCHAR(255)
  - first_name: VARCHAR(255)
  - last_name: VARCHAR(255)
  - phone: VARCHAR(50)
  - prayer_intention: TEXT
  - is_recurring: BOOLEAN
  - status: VARCHAR(50) ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
  - qr_code_url: TEXT
  - email_sent: BOOLEAN
```

---

## 10. API Endpoints Summary

### 10.1 Frontend → Backend API Calls

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/api/proxy/payments/initialize` | POST | Initialize payment (GiveButter or Stripe) | Donation checkout, Ticket checkout |
| `/api/proxy/payments/{transactionId}` | GET | Poll payment status | Donation success page |
| `/api/proxy/donation-transactions/{id}` | GET | Get donation transaction | Donation success page |
| `/api/proxy/events/{id}/donations/{transactionId}/qrcode` | POST | Generate QR code | Donation success page |
| `/api/proxy/events/{id}/donations/{transactionId}/send-email` | POST | Send confirmation email | Donation success page |
| `/api/proxy/givebutter/donations/{donationId}/status` | GET | Check GiveButter donation status | Donation success page (polling) |
| `/api/proxy/donations/create-from-givebutter` | POST | Create donation from GiveButter data | Donation success page |

---

## 11. Critical Implementation Notes

### 11.1 Frontend Detection vs Backend Routing

- **Frontend Detection** (`isDonationBasedEvent()`): Used to show/hide "Make a Donation" button
- **Backend Routing**: Used to determine which payment provider to use (GiveButter vs Stripe)

**Important**: These are separate decisions:
- Frontend decides which button to show based on `admissionType` and `donationMetadata`
- Backend decides which provider to use based on event metadata when processing payment

### 11.2 Ticketed Fundraiser Events

For ticketed fundraiser events:
- Frontend shows "Buy Tickets" button (uses existing checkout flow)
- Backend automatically routes to GiveButter based on event metadata
- **No frontend changes needed** - backend handles routing transparently

### 11.3 Donation-Only Events

For donation-only events:
- Frontend shows "Make a Donation" button (uses new donation flow)
- Frontend explicitly sets `paymentType: 'DONATION_ZERO_FEE'` and `paymentProvider: 'GIVEBUTTER'`
- Backend always uses GiveButter (no routing decision needed)

---

## 12. Summary

### Admin Setup Flow:
1. Admin opens EventForm
2. Sets `admissionType` to `'DONATION_BASED'` OR checks `isFundraiserEvent`/`isCharityEvent`
3. System auto-enables `useZeroFeeProvider` and sets `zeroFeeProvider` to `'GIVEBUTTER'`
4. Admin optionally enters `givebutterCampaignId`
5. Admin saves event → Data stored in `event_details.donation_metadata` (JSON string)

### User Purchase Flow - Donation Event:
1. User sees "Make a Donation" button on event page
2. Clicks button → Routes to `/events/[id]/donation`
3. Fills donation form → Submits
4. Frontend calls `/api/proxy/payments/initialize` with `DONATION_ZERO_FEE` type
5. Backend returns GiveButter checkout URL
6. User completes payment on GiveButter
7. Redirects to success page → Polls status → Shows QR code and sends email

### User Purchase Flow - Ticketed Fundraiser:
1. User sees "Buy Tickets" button on event page
2. Clicks button → Routes to `/events/[id]/checkout` (existing flow)
3. Selects tickets → Submits
4. Frontend calls `/api/proxy/payments/initialize` with `TICKET_SALE` type
5. **Backend checks event metadata** → Routes to GiveButter (if fundraiser configured)
6. Backend returns GiveButter checkout URL (or Stripe if not fundraiser)
7. User completes payment → Redirects to success page → Shows QR code and sends email

---

## 13. Backend Requirements

**CRITICAL**: The backend must implement the routing logic described in section 5.1. Without this, ticketed fundraiser events will route to Stripe instead of GiveButter.

**Backend Files to Update**:
- `PaymentOrchestrationService.java` (or equivalent)
- `determineProvider()` method must check event metadata
- Must parse `donationMetadata` JSON string (not JSONB)
- Must verify GiveButter provider is configured for tenant

**Reference Documentation**:
- `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/BACKEND_ROUTING_PROMPT.md`
- `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/BACKEND_IMPLEMENTATION_PRD.html`
