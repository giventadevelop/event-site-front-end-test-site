# Backend API URLs Analysis - Ticket Transaction Persistence

## Overview
This document analyzes all backend API URLs that the frontend calls to persist ticket transactions, either from:
1. **Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`)
2. **Event Success Page** (`src/app/event/success/ApiServerActions.ts`)

---

## 1. Webhook Handler (`src/app/api/webhooks/stripe/route.ts`)

### Current Implementation (After Simplification)
The webhook handler now **forwards all webhook events to the backend**:

**Endpoint Called:**
- **`POST ${API_BASE_URL}/api/webhooks/stripe`**
  - **Method**: POST
  - **Headers**:
    - `Content-Type: application/json`
    - `Stripe-Signature: <signature>` (forwarded from Stripe)
  - **Body**: Raw webhook body (Buffer) as received from Stripe
  - **Purpose**: Backend handles all webhook processing, signature verification, and transaction creation
  - **Location**: Lines 335-349

### Legacy Code (Still Present but Not Used)
The webhook handler still contains legacy code in `handleChargeFeeUpdate` function that makes direct backend calls:

**1. Query Transaction by Payment Intent ID**
- **`GET ${API_BASE_URL}/api/event-ticket-transactions?stripePaymentIntentId.equals={paymentIntentId}&tenantId.equals={tenantId}`**
  - **Method**: GET
  - **Purpose**: Find existing transaction for fee update
  - **Location**: Line 97
  - **Note**: Direct backend call (not via proxy), uses JWT from `getCachedApiJwt()`

**2. Update Transaction with Stripe Fee**
- **`PATCH ${API_BASE_URL}/api/event-ticket-transactions/{transactionId}`**
  - **Method**: PATCH
  - **Headers**:
    - `Content-Type: application/merge-patch+json`
    - `Authorization: Bearer {jwt}`
  - **Body**: `{ id: transactionId, stripeFeeAmount: feeAmount }`
  - **Purpose**: Update transaction with Stripe fee amount
  - **Location**: Line 211
  - **Note**: Direct backend call (not via proxy), uses JWT from `getCachedApiJwt()`

**3. Create Transaction (Fallback)**
- **Called via**: `createEventTicketTransactionServer()` from `ApiServerActions.ts`
- **Endpoint**: See Section 2.1 below
- **Location**: Line 167
- **Purpose**: Fallback creation if transaction not found for fee update

---

## 2. Event Success Page (`src/app/event/success/ApiServerActions.ts`)

### 2.1 Create Transaction

**Endpoint:**
- **`POST ${getAppUrl()}/api/proxy/event-ticket-transactions`**
  - **Method**: POST
  - **Headers**: `Content-Type: application/json`
  - **Body**: `EventTicketTransactionDTO` (without `id`)
  - **Purpose**: Create new ticket transaction
  - **Location**: Line 123 (`createTransaction` function)
  - **Used By**:
    - `processStripeSessionServer()` (Line 318)
    - `createTransactionFromPaymentIntent()` (Line 844)

**Note**: This goes through the proxy handler at `src/pages/api/proxy/event-ticket-transactions/index.ts`, which forwards to backend `POST /api/event-ticket-transactions`

### 2.2 Query Transaction by Session ID

**Endpoint:**
- **`GET ${getAppUrl()}/api/proxy/event-ticket-transactions?stripeCheckoutSessionId.equals={sessionId}&tenantId.equals={tenantId}`**
  - **Method**: GET
  - **Purpose**: Find existing transaction by Stripe checkout session ID
  - **Location**: Line 54 (`findTransactionBySessionId` function)
  - **Used By**: Event success page to check if transaction already exists

**Note**: Proxy handler forwards to backend `GET /api/event-ticket-transactions` with query parameters

### 2.3 Query Transaction by Payment Intent ID

**Endpoint:**
- **`GET ${getAppUrl()}/api/proxy/event-ticket-transactions?stripePaymentIntentId.equals={paymentIntentId}&tenantId.equals={tenantId}`**
  - **Method**: GET
  - **Purpose**: Find existing transaction by Stripe payment intent ID (with tenant filter)
  - **Location**: Line 80 (`findTransactionByPaymentIntentId` function)
  - **Used By**:
    - `processStripeSessionServer()` (Line 215)
    - `createTransactionFromPaymentIntent()` (Line 780)

**Fallback Query (Global, No Tenant Filter):**
- **`GET ${getAppUrl()}/api/proxy/event-ticket-transactions?stripePaymentIntentId.equals={paymentIntentId}`**
  - **Method**: GET
  - **Purpose**: Find existing transaction globally (detects cross-tenant duplicates)
  - **Location**: Line 97 (`findTransactionByPaymentIntentId` function)
  - **Note**: Used when tenant-filtered query returns no results

### 2.4 Create Transaction Items (Bulk)

**Endpoint:**
- **`POST ${getAppUrl()}/api/proxy/event-ticket-transaction-items/bulk`**
  - **Method**: POST
  - **Headers**: `Content-Type: application/json`
  - **Body**: Array of `EventTicketTransactionItemDTO` objects
  - **Purpose**: Bulk create transaction items for a transaction
  - **Location**: Line 144 (`createTransactionItemsBulk` function)
  - **Used By**:
    - `processStripeSessionServer()` (Line 409)
    - `createTransactionFromPaymentIntent()` (Line 941)

**Note**: Proxy handler forwards to backend `POST /api/event-ticket-transaction-items/bulk`

### 2.5 Query Transaction Items

**Endpoint:**
- **`GET ${getAppUrl()}/api/proxy/event-ticket-transaction-items?transactionId.equals={transactionId}&tenantId.equals={tenantId}`**
  - **Method**: GET
  - **Purpose**: Check if transaction items already exist (idempotency check)
  - **Location**:
    - Line 339 (`processStripeSessionServer` function)
    - Line 881 (`createTransactionFromPaymentIntent` function)
  - **Used By**: Both transaction creation functions to prevent duplicate items

**Note**: Proxy handler forwards to backend `GET /api/event-ticket-transaction-items` with query parameters

### 2.6 Update Transaction (Stripe Fee - Commented Out)

**Endpoint (Currently Commented Out):**
- **`PATCH ${getAppUrl()}/api/proxy/event-ticket-transactions/{transactionId}`**
  - **Method**: PATCH
  - **Headers**: `Content-Type: application/merge-patch+json`
  - **Body**: `{ stripeFeeAmount: feeAmount }`
  - **Purpose**: Update transaction with Stripe fee (handled by webhook instead)
  - **Location**: Line 590 (commented out)
  - **Note**: This functionality is now handled by the webhook `charge.succeeded` event

---

## 3. Webhook Server Actions (`src/app/api/webhooks/stripe/ApiServerActions.ts`)

### 3.1 Create Transaction (Webhook Context)

**Endpoint:**
- **`POST ${API_BASE_URL}/api/event-ticket-transactions`**
  - **Method**: POST
  - **Headers**: `Content-Type: application/json`
  - **Body**: `EventTicketTransactionDTO` (without `id`)
  - **Purpose**: Create transaction from webhook handler
  - **Location**: Line 10 (`createEventTicketTransactionServer` function)
  - **Used By**: Webhook handler (legacy code, now forwarded to backend)
  - **Note**: **Direct backend call** (not via proxy), uses `fetchWithJwtRetry` from `@/lib/proxyHandler`

### 3.2 Create Transaction Items (Bulk - Webhook Context)

**Endpoint:**
- **`POST ${API_BASE_URL}/api/event-ticket-transaction-items/bulk`**
  - **Method**: POST
  - **Headers**: `Content-Type: application/json`
  - **Body**: Array of `EventTicketTransactionItemDTO` objects
  - **Purpose**: Bulk create transaction items from webhook handler
  - **Location**: Line 79 (`createTransactionItemsBulkServer` function)
  - **Used By**: Webhook handler (legacy code, now forwarded to backend)
  - **Note**: **Direct backend call** (not via proxy), uses `fetchWithJwtRetry` from `@/lib/proxyHandler`

### 3.3 Update Ticket Type Inventory

**Endpoint:**
- **`GET ${API_BASE_URL}/api/event-ticket-types/{ticketTypeId}`** (to fetch current state)
- **`PUT ${API_BASE_URL}/api/event-ticket-types/{ticketTypeId}`** (to update)
  - **Method**: GET then PUT
  - **Headers**: `Content-Type: application/json`
  - **Body**: Updated `EventTicketTypeDTO` with incremented `soldQuantity`
  - **Purpose**: Update ticket type inventory after purchase
  - **Location**: Lines 158-179 (`updateTicketTypeInventoryServer` function)
  - **Used By**: Webhook handler (legacy code, now forwarded to backend)
  - **Note**: **Direct backend call** (not via proxy), uses `fetchWithJwtRetry` from `@/lib/proxyHandler`

---

## 4. Summary Table

| Source File | Endpoint | Method | Purpose | Via Proxy? |
|------------|----------|--------|---------|------------|
| **Webhook Handler** | | | | |
| `route.ts` (current) | `/api/webhooks/stripe` | POST | Forward webhook to backend | No (direct) |
| `route.ts` (legacy) | `/api/event-ticket-transactions?stripePaymentIntentId.equals={id}&tenantId.equals={tid}` | GET | Find transaction for fee update | No (direct) |
| `route.ts` (legacy) | `/api/event-ticket-transactions/{id}` | PATCH | Update transaction with fee | No (direct) |
| **Webhook Server Actions** | | | | |
| `ApiServerActions.ts` | `/api/event-ticket-transactions` | POST | Create transaction | No (direct) |
| `ApiServerActions.ts` | `/api/event-ticket-transaction-items/bulk` | POST | Bulk create items | No (direct) |
| `ApiServerActions.ts` | `/api/event-ticket-types/{id}` | GET/PUT | Update inventory | No (direct) |
| **Event Success Page** | | | | |
| `ApiServerActions.ts` | `/api/proxy/event-ticket-transactions` | POST | Create transaction | Yes |
| `ApiServerActions.ts` | `/api/proxy/event-ticket-transactions?stripeCheckoutSessionId.equals={id}&tenantId.equals={tid}` | GET | Find by session ID | Yes |
| `ApiServerActions.ts` | `/api/proxy/event-ticket-transactions?stripePaymentIntentId.equals={id}&tenantId.equals={tid}` | GET | Find by payment intent ID | Yes |
| `ApiServerActions.ts` | `/api/proxy/event-ticket-transactions?stripePaymentIntentId.equals={id}` | GET | Find globally (fallback) | Yes |
| `ApiServerActions.ts` | `/api/proxy/event-ticket-transaction-items/bulk` | POST | Bulk create items | Yes |
| `ApiServerActions.ts` | `/api/proxy/event-ticket-transaction-items?transactionId.equals={id}&tenantId.equals={tid}` | GET | Check existing items | Yes |

---

## 5. Key Observations

### 5.1 Proxy vs Direct Backend Calls

**Via Proxy (`/api/proxy/...`):**
- Event success page uses proxy routes for all transaction operations
- Proxy routes handle JWT authentication, tenant ID injection, and error handling
- Proxy routes are defined in `src/pages/api/proxy/event-ticket-transactions/` and `src/pages/api/proxy/event-ticket-transaction-items/`

**Direct Backend Calls:**
- Webhook handler makes direct backend calls (not via proxy)
- Uses `fetchWithJwtRetry` from `@/lib/proxyHandler` for JWT handling
- Uses `API_BASE_URL` environment variable directly
- **Note**: After simplification, webhook handler now forwards to backend webhook endpoint instead

### 5.2 Transaction Creation Flow

**Desktop Flow (Checkout Session):**
1. User completes Stripe checkout session
2. Stripe sends `checkout.session.completed` webhook → **Backend processes** (after simplification)
3. User redirected to success page
4. Success page calls `processStripeSessionServer()` → Creates transaction via proxy if not exists

**Mobile Flow (Payment Intent):**
1. User completes mobile payment (Apple Pay/Google Pay)
2. Stripe sends `payment_intent.succeeded` webhook → **Backend processes** (after simplification)
3. Browser listens for payment success
4. Browser calls `createTransactionFromPaymentIntent()` → Creates transaction via proxy if not exists

### 5.3 Idempotency Checks

Both flows check for existing transactions before creating:
- **By Payment Intent ID**: `findTransactionByPaymentIntentId()`
- **By Session ID**: `findTransactionBySessionId()`
- **Transaction Items**: Check existing items before bulk creation

### 5.4 Current State After Simplification

**Webhook Handler:**
- **Current**: Forwards all webhook events to `POST /api/webhooks/stripe` (backend handles everything)
- **Legacy Code**: Still contains `handleChargeFeeUpdate` function with direct backend calls (may be removed in future)

**Event Success Page:**
- **Unchanged**: Still uses proxy routes for all transaction operations
- **Idempotency**: Checks for existing transactions before creating

---

## 6. Backend Endpoints Summary

The frontend calls these backend endpoints (either directly or via proxy):

### Transaction Endpoints:
1. `POST /api/event-ticket-transactions` - Create transaction
2. `GET /api/event-ticket-transactions?{filters}` - Query transactions
3. `GET /api/event-ticket-transactions/{id}` - Get transaction by ID
4. `PATCH /api/event-ticket-transactions/{id}` - Update transaction (fee, etc.)

### Transaction Item Endpoints:
1. `POST /api/event-ticket-transaction-items/bulk` - Bulk create items
2. `GET /api/event-ticket-transaction-items?{filters}` - Query items

### Webhook Endpoint:
1. `POST /api/webhooks/stripe` - Process Stripe webhook events (new, after simplification)

### Ticket Type Endpoints:
1. `GET /api/event-ticket-types/{id}` - Get ticket type
2. `PUT /api/event-ticket-types/{id}` - Update ticket type (inventory)

---

## 7. Recommendations

1. **Remove Legacy Code**: The `handleChargeFeeUpdate` function in webhook handler can be removed once backend handles fee updates
2. **Consistent Proxy Usage**: Consider moving all direct backend calls to use proxy routes for consistency
3. **Backend Webhook Implementation**: Ensure backend webhook endpoint (`POST /api/webhooks/stripe`) handles:
   - Multi-secret signature verification
   - Transaction creation with correct tenant ID
   - Transaction item creation
   - Fee updates
   - Idempotency checks

