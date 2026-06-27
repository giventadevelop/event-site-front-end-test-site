# Manual Payment Data Persistence Analysis

## Overview
This document analyzes which tables are populated during manual payment flow and why Sales Analytics shows zeros for manual payments.

## Tables Populated During Manual Payment Request Creation

### 1. `manual_payment_request` Table
**Status:** ✅ **POPULATED**
- Created when user submits manual checkout form
- Status: `REQUESTED`
- Fields populated:
  - `id` (auto-generated)
  - `event_id` (from form)
  - `tenant_id` (injected via `withTenantId`)
  - `manual_payment_method_type` (ZELLE_MANUAL, VENMO_MANUAL, etc.)
  - `amount_due` (from cart total)
  - `status` = `REQUESTED`
  - `requester_email` (from form)
  - `requester_name` (from form)
  - `requester_phone` (from form, optional)
  - `created_at` (current timestamp)
  - `updated_at` (current timestamp)
  - `ticket_transaction_id` = NULL initially (linked after transaction creation)

**Verification Query:**
```sql
SELECT r.id, r.event_id, r.tenant_id, r.status,
       e.manual_payment_enabled
FROM manual_payment_request r
LEFT JOIN event_details e ON e.id = r.event_id
WHERE r.id IN (7451, 7452);
```

**Expected Result:** ✅ Records exist with `status = 'REQUESTED'`

---

### 2. `event_ticket_transaction` Table
**Status:** ⚠️ **SHOULD BE POPULATED** (Backend Implementation Required)
- Should be created automatically by backend when manual payment request is created
- Status: `PENDING` (NOT `COMPLETED`)
- Fields that should be populated:
  - `id` (auto-generated)
  - `event_id` (from payment request)
  - `tenant_id` (from payment request)
  - `email` (from `requester_email`)
  - `first_name` (extracted from `requester_name`)
  - `last_name` (extracted from `requester_name`)
  - `phone` (from `requester_phone`)
  - `total_amount` (from `amount_due`)
  - `final_amount` (equal to `total_amount`)
  - `quantity` (sum of cart item quantities)
  - `status` = `PENDING` ⚠️ **CRITICAL: PENDING, not COMPLETED**
  - `transaction_reference` = `"MANUAL-{manualPaymentRequestId}"`
  - `purchase_date` (current timestamp)
  - `created_at` (current timestamp)
  - `updated_at` (current timestamp)
  - `qr_code_image_url` = NULL (only set after RECEIVED status)
  - `stripe_payment_intent_id` = NULL (manual payments don't use Stripe)

**Verification Query:**
```sql
SELECT t.id, t.event_id, t.status, t.transaction_reference,
       t.total_amount, t.final_amount, t.email,
       r.id as payment_request_id
FROM event_ticket_transaction t
LEFT JOIN manual_payment_request r ON r.ticket_transaction_id = t.id
WHERE t.transaction_reference LIKE 'MANUAL-%'
  AND t.event_id = 4201;
```

**Expected Result:** ⚠️ Records should exist with `status = 'PENDING'` and `transaction_reference = 'MANUAL-7451'` or `'MANUAL-7452'`

---

### 3. `event_ticket_transaction_item` Table
**Status:** ⚠️ **SHOULD BE POPULATED** (Backend Implementation Required)
- Should be created automatically by backend for each ticket type in cart
- Fields that should be populated:
  - `id` (auto-generated)
  - `transaction_id` (from created `event_ticket_transaction.id`)
  - `ticket_type_id` (from cart item)
  - `quantity` (from cart item)
  - `price_per_unit` (from `EventTicketType.price`)
  - `total_amount` = `price_per_unit * quantity`
  - `created_at` (current timestamp)
  - `updated_at` (current timestamp)

**Verification Query:**
```sql
SELECT i.id, i.transaction_id, i.ticket_type_id, i.quantity,
       i.price_per_unit, i.total_amount,
       t.transaction_reference
FROM event_ticket_transaction_item i
JOIN event_ticket_transaction t ON t.id = i.transaction_id
WHERE t.transaction_reference LIKE 'MANUAL-%'
  AND t.event_id = 4201;
```

**Expected Result:** ⚠️ Records should exist for each ticket type purchased

---

## Why Sales Analytics Shows Zeros

### Root Cause
The Sales Analytics page (`/admin/sales-analytics`) queries `event-ticket-transactions` with **status filter = `COMPLETED` only**:

```typescript
// From src/app/admin/sales-analytics/ApiServerActions.ts:157-159
const confirmedTransactions = allTransactions.filter(
  t => t.status === 'COMPLETED'
);
```

### Manual Payment Status Flow
1. **Request Created:** `event_ticket_transaction.status = 'PENDING'`
2. **Admin Confirms Payment:** `event_ticket_transaction.status = 'COMPLETED'`
3. **Sales Analytics Query:** Only shows `COMPLETED` transactions

**Result:** Manual payment transactions with `PENDING` status are **excluded** from Sales Analytics until admin marks them as `RECEIVED`.

---

## Correct Pages for Manual Payment Data

### 1. Manual Payment Requests (Primary)
**URL:** `/admin/manual-payments?eventId=4201`
**Purpose:** View and manage manual payment requests
**Data Source:** `manual_payment_request` table
**Status Filter:** `REQUESTED`, `RECEIVED`, `VOIDED`, `CANCELLED`

**This is the correct page for:**
- Viewing all manual payment requests
- Filtering by status, payment method, date range
- Updating payment status (Mark as Received, Void, Cancel)
- Viewing payment summary reports

---

### 2. Sales Analytics (After Confirmation)
**URL:** `/admin/sales-analytics?eventId=4201`
**Purpose:** View completed sales transactions
**Data Source:** `event_ticket_transaction` table
**Status Filter:** `COMPLETED` only

**This page shows:**
- Only transactions with `status = 'COMPLETED'`
- Manual payments appear here **only after** admin marks payment as `RECEIVED`
- Stripe payments appear here immediately (status is `COMPLETED` on creation)

---

### 3. Event Tickets List (All Statuses)
**URL:** `/admin/events-analytics/[id]/tickets/list`
**Purpose:** View all ticket transactions (all statuses)
**Data Source:** `event_ticket_transaction` table
**Status Filter:** None (shows all statuses)

**This page shows:**
- All transactions including `PENDING`, `COMPLETED`, `CANCELLED`, etc.
- Manual payments with `PENDING` status will appear here

---

## Success Page Data Display

### Tables Displayed on Success Page
The success page (`/events/[id]/manual-checkout/success?requestId=7451`) displays data from:

1. ✅ **`manual_payment_request`** (via `paymentRequest` prop)
   - Shows payment request details, status, amount, payment method

2. ⚠️ **`event_ticket_transaction`** (via `ticketTransaction` prop)
   - Shows transaction details, customer info, purchase date
   - **May be NULL if backend hasn't created transaction yet**

3. ⚠️ **`event_ticket_transaction_item`** (fetched separately)
   - Shows ticket summary table with ticket types and quantities
   - **May be empty if transaction doesn't exist**

4. ✅ **`event_details`** (via `event` prop)
   - Shows event information

---

## Verification Checklist

### Step 1: Verify Manual Payment Request Created
```sql
SELECT id, event_id, tenant_id, status, amount_due,
       requester_email, manual_payment_method_type,
       ticket_transaction_id
FROM manual_payment_request
WHERE id IN (7451, 7452);
```

**Expected:** ✅ Records exist with `status = 'REQUESTED'`

---

### Step 2: Verify Ticket Transaction Created
```sql
SELECT id, event_id, status, transaction_reference,
       total_amount, final_amount, email,
       purchase_date
FROM event_ticket_transaction
WHERE transaction_reference IN ('MANUAL-7451', 'MANUAL-7452');
```

**Expected:** ⚠️ Records exist with `status = 'PENDING'` and `transaction_reference = 'MANUAL-{id}'`

**If NULL:** Backend hasn't implemented automatic transaction creation yet.

---

### Step 3: Verify Transaction Items Created
```sql
SELECT i.id, i.transaction_id, i.ticket_type_id, i.quantity,
       i.price_per_unit, i.total_amount
FROM event_ticket_transaction_item i
JOIN event_ticket_transaction t ON t.id = i.transaction_id
WHERE t.transaction_reference IN ('MANUAL-7451', 'MANUAL-7452');
```

**Expected:** ⚠️ Records exist for each ticket type purchased

**If Empty:** Backend hasn't implemented automatic item creation yet.

---

### Step 4: Verify Link Between Tables
```sql
SELECT r.id as payment_request_id,
       r.ticket_transaction_id,
       t.id as transaction_id,
       t.transaction_reference,
       t.status as transaction_status
FROM manual_payment_request r
LEFT JOIN event_ticket_transaction t ON t.id = r.ticket_transaction_id
WHERE r.id IN (7451, 7452);
```

**Expected:** ✅ `ticket_transaction_id` is populated and links to transaction

---

## Backend Implementation Status

### ✅ Implemented
- Manual payment request creation (`manual_payment_request` table)

### ⚠️ Needs Verification
- Automatic `event_ticket_transaction` creation with `PENDING` status
- Automatic `event_ticket_transaction_item` creation
- Linking `manual_payment_request.ticket_transaction_id` to created transaction

### 📋 Reference Documentation
- Backend Implementation Guide: `documentation/domain_agnostic_payment/fee_free_direct_manual_pay_like_zelle/success_flow/backend_implementation.html`
- Frontend Requirements: `documentation/domain_agnostic_payment/fee_free_direct_manual_pay_like_zelle/frontend_requirements.html`

---

## Recommendations

### 1. Fix Sales Analytics to Include PENDING Transactions
Update Sales Analytics to show manual payment transactions with `PENDING` status:
- Add filter option: "All Statuses" vs "Completed Only"
- Or create separate section for "Pending Manual Payments"

### 2. Verify Backend Implementation
Check if backend automatically creates:
- `event_ticket_transaction` records when manual payment request is created
- `event_ticket_transaction_item` records for each ticket type
- Links `manual_payment_request.ticket_transaction_id` to created transaction

### 3. Use Correct Page for Manual Payments
- **For viewing/managing manual payments:** Use `/admin/manual-payments?eventId=4201`
- **For viewing completed sales:** Use `/admin/sales-analytics?eventId=4201` (after confirmation)
- **For viewing all transactions:** Use `/admin/events-analytics/[id]/tickets/list`

---

## Summary

| Table | Status | When Populated | Verification |
|-------|--------|----------------|--------------|
| `manual_payment_request` | ✅ Populated | On form submission | ✅ Verified (IDs 7451, 7452 exist) |
| `event_ticket_transaction` | ⚠️ Should be populated | On request creation (backend) | ⚠️ Needs verification |
| `event_ticket_transaction_item` | ⚠️ Should be populated | On request creation (backend) | ⚠️ Needs verification |

**Sales Analytics shows zeros because:**
- It filters for `status = 'COMPLETED'` only
- Manual payment transactions are `PENDING` until admin confirms
- Use `/admin/manual-payments` to view manual payment requests
