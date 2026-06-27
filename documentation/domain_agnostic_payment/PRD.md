# Product Requirements Document: Domain-Agnostic Payment System

**Project:** MCEFEE Multi-Tenant Event Management Platform
**Document Version:** 1.0
**Date:** October 20, 2025
**Status:** Draft

---

## Executive Summary

This PRD outlines the transformation of the MCEFEE event management platform from a single-domain, Stripe-centric payment implementation to a **domain-agnostic, multi-tenant payment architecture** that supports multiple payment providers (Stripe, PayPal, and future providers) while maintaining a consistent, user-friendly checkout experience across all client domains.

### Current Pain Points
- Each domain requires separate Stripe account configuration
- Payment processing logic is tightly coupled to frontend (client-side Stripe integration)
- Limited payment provider flexibility
- Inconsistent payment flows for different use cases (tickets, donations, offerings)
- Manual domain-specific setup for each new tenant

### Proposed Solution
Backend-centric payment orchestration layer that abstracts payment provider logic, enabling any client domain to process payments through the centralized backend API without provider-specific frontend code.

---

## Table of Contents

1. [Background & Context](#background--context)
2. [Goals & Objectives](#goals--objectives)
3. [Current System Analysis](#current-system-analysis)
4. [Proposed Architecture](#proposed-architecture)
5. [Technology Stack & Standards](#technology-stack--standards)
6. [Payment Flow Scenarios](#payment-flow-scenarios)
7. [Database Schema Changes](#database-schema-changes)
8. [Backend Implementation Requirements](#backend-implementation-requirements)
9. [Frontend Implementation Requirements](#frontend-implementation-requirements)
10. [Security & Compliance](#security--compliance)
11. [Migration Strategy](#migration-strategy)
12. [Success Metrics](#success-metrics)
13. [Timeline & Phases](#timeline--phases)
14. [Appendix](#appendix)

---

## 1. Background & Context

### Current Architecture

The MCEFEE platform uses a multi-tenant architecture where:
- **Frontend:** Next.js 15+ application (this repository at `C:\Users\gain\git\malayalees-us-site`)
- **Backend:** Spring Boot application (located at `C:\Users\gain\git\malayalees-us-site-boot`)
- **Authentication:** JWT-based API authentication with tenant ID injection
- **Database:** PostgreSQL with tenant isolation via `tenant_id` columns
- **Payment Processing:** Client-side Stripe integration via `@stripe/stripe-js` and `@stripe/react-stripe-js`

### Current Payment Implementation

**Frontend Components:**
- `StripeDesktopCheckout.tsx` - Express Checkout Element with PaymentElement fallback
- `StripePaymentRequestButton.tsx` - Apple Pay/Google Pay integration
- API Routes:
  - `/api/stripe/payment-intent` - Creates Stripe Payment Intents
  - `/api/stripe/verify-payment-intent` - Verifies payment status
  - `/api/stripe/event-checkout` - Checkout session creation
  - `/api/stripe/test-checkout` - Testing endpoint

**Database Tables:**
- `event_ticket_transaction` - Stores ticket purchase transactions
- `event_ticket_transaction_item` - Line items for transactions
- `user_payment_transaction` - Platform-level payment tracking

**Key Limitations:**
1. Stripe-specific code in frontend (tight coupling)
2. Each domain needs separate Stripe publishable/secret keys
3. Payment Intent creation happens in Next.js API routes (not backend)
4. Limited support for alternative payment methods
5. No unified abstraction for different payment types (tickets, donations, offerings)

---

## 2. Goals & Objectives

### Primary Goals

1. **Domain Agnosticism**
   - Support multiple client domains pointing to single backend
   - Zero frontend changes when adding new domains
   - Tenant-specific payment provider configuration

2. **Provider Abstraction**
   - Support multiple payment providers (Stripe, PayPal, future providers)
   - Unified payment API regardless of provider
   - Easy provider switching per tenant

3. **Consistent User Experience**
   - One-click checkout where possible
   - Consistent flow for tickets, donations, and offerings
   - Modern payment methods (Apple Pay, Google Pay, Link, Crypto)

4. **Backend-Centric Processing**
   - Move payment logic from frontend to backend
   - Frontend becomes thin presentation layer
   - Backend maintains payment provider credentials

5. **Future-Ready Architecture**
   - Support for emerging standards (ACP, AP2)
   - Webhook-driven state management
   - Extensible for new payment types

### Secondary Goals

1. Improved payment analytics and reporting
2. Better refund and chargeback handling
3. Support for recurring payments (subscriptions)
4. Multi-currency support
5. Enhanced fraud detection

---

## 3. Current System Analysis

### Frontend Payment Flow

```
User fills cart → Frontend creates Payment Intent (Stripe API) →
Stripe Elements collect payment → Frontend confirms payment →
Success page with verification
```

**Current Implementation Details:**

**File:** `src/app/api/stripe/payment-intent/route.ts`
- Creates Stripe Payment Intent directly
- Fetches ticket prices from backend
- Applies discount codes
- Returns `clientSecret` to frontend

**File:** `src/components/StripeDesktopCheckout.tsx`
- Client-side Stripe.js integration
- ExpressCheckoutElement for wallet payments
- PaymentElement for card payments
- Confirms payment using `stripe.confirmPayment()`

**File:** `src/components/StripePaymentRequestButton.tsx`
- Apple Pay / Google Pay button
- Creates Payment Request object
- Handles payment confirmation client-side

### Database Schema (Relevant Tables)

**`event_ticket_transaction`**
```sql
CREATE TABLE event_ticket_transaction (
    id bigint PRIMARY KEY,
    tenant_id varchar(255),
    transaction_reference varchar(255) GENERATED,
    email varchar(255) NOT NULL,
    first_name varchar(255),
    last_name varchar(255),
    phone varchar(255),
    quantity INTEGER NOT NULL,
    total_amount numeric(21,2) NOT NULL,
    discount_amount numeric(21,2) DEFAULT 0,
    final_amount numeric(21,2) NOT NULL,
    status varchar(255) DEFAULT 'PENDING',
    payment_method varchar(100),
    payment_reference varchar(255),
    stripe_checkout_session_id varchar(255),
    stripe_payment_intent_id varchar(255),
    stripe_customer_id varchar(255),
    stripe_payment_status varchar(50),
    purchase_date timestamp NOT NULL,
    -- ... other fields
);
```

**Issues:**
- Stripe-specific columns (`stripe_*`) hardcoded
- No support for other payment providers
- No payment provider configuration table

---

## 4. Proposed Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT DOMAINS (Multi-Tenant)                 │
│  domain1.com, domain2.org, domain3.net → All use same frontend  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS/JWT Auth
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND (Thin Layer)                 │
│  - Provider-agnostic checkout UI                                 │
│  - Universal payment components                                  │
│  - No provider-specific API keys                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (with tenant_id)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SPRING BOOT BACKEND (Payment Orchestrator)          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Payment Orchestration Layer                         │       │
│  │  - PaymentService (interface)                       │       │
│  │  - PaymentProviderFactory                           │       │
│  │  - Tenant configuration resolver                    │       │
│  └──────────────────┬───────────────────────────────────┘       │
│                     │                                            │
│       ┌─────────────┼─────────────┬──────────────┐             │
│       │             │             │              │             │
│  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  ┌──────▼──────┐     │
│  │ Stripe  │  │ PayPal  │  │  ACP    │  │   AP2       │     │
│  │Adapter  │  │Adapter  │  │Adapter  │  │  Adapter    │     │
│  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘     │
│       │            │            │               │             │
└───────┼────────────┼────────────┼───────────────┼─────────────┘
        │            │            │               │
        ▼            ▼            ▼               ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Stripe  │  │  PayPal  │  │ OpenAI   │  │  Google  │
│   API    │  │   API    │  │   ACP    │  │   AP2    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Key Architectural Principles

1. **Backend-Centric Payment Processing**
   - All payment provider interactions happen in backend
   - Frontend only receives generic payment tokens/sessions
   - Payment provider credentials stored securely in backend

2. **Provider Adapter Pattern**
   - Each payment provider has dedicated adapter implementing `PaymentService` interface
   - Adapters translate generic payment requests to provider-specific API calls
   - New providers can be added without changing core logic

3. **Tenant Configuration**
   - Each tenant configured with preferred payment provider(s)
   - Multiple providers per tenant for fallback/routing
   - Configuration stored in database, cached for performance

4. **Webhook-Driven State Management**
   - All payment state changes driven by provider webhooks
   - Idempotent webhook processing
   - Reliable eventual consistency

5. **Frontend Provider Agnosticism**
   - Single universal checkout component
   - Dynamic loading of provider-specific UI elements (if needed)
   - Consistent UX regardless of backend provider

---

## 5. Technology Stack & Standards

### Emerging Payment Standards (2025)

#### 5.1 Agentic Commerce Protocol (ACP)

**Developed by:** OpenAI & Stripe
**Announced:** September 2025
**Status:** Open source, production-ready

**Key Features:**
- Enables AI agents to complete purchases on behalf of users
- **Shared Payment Token (SPT):** New payment primitive scoped to merchant and cart total
- Agent initiates payment without exposing payment credentials
- Minimal integration (as little as one line of code for Stripe merchants)
- Merchant maintains customer relationship and control

**Use Cases for MCEFEE:**
- Voice/chat-based ticket purchases via ChatGPT
- AI-assisted donation flows
- Automated event registration via AI agents

**Implementation Path:**
- Phase 3 of roadmap (future enhancement)
- Requires Stripe integration first
- Potential partnership with OpenAI/ChatGPT

#### 5.2 Agent Payments Protocol (AP2)

**Developed by:** Google
**Announced:** September 16, 2025
**Status:** Developer preview, not yet consumer-ready

**Key Features:**
- Cryptographically signed digital mandates (tamper-proof authorization records)
- Two-step approval: Intent Mandate → Cart Mandate
- Supports cards, crypto (stablecoins), real-time bank transfers
- A2A x402 extension for crypto payments (with Coinbase, Ethereum Foundation)
- 60+ partners including Adyen, Mastercard, PayPal, Salesforce

**Key Components:**
- **Authorization:** User proves they gave agent authority
- **Authenticity:** Merchant verifies agent request reflects user intent
- **Accountability:** Clear fraud/error responsibility

**Use Cases for MCEFEE:**
- Future-proofing for AI-driven commerce
- Crypto payment support for international events
- Budget-based event booking ("Book me tickets under $200")

**Implementation Path:**
- Phase 4 (research/pilot)
- Monitoring for consumer availability
- Potential crypto payment support

### Current Technology Stack

**Backend (Spring Boot):**
- Java 17+ / Spring Boot 3.x
- PostgreSQL database
- JPA/Hibernate for ORM
- REST API with JWT authentication

**Frontend (Next.js):**
- Next.js 15+ with App Router
- TypeScript 5.3.3
- Stripe.js (current, to be abstracted)
- TanStack Query for state management

**Payment Providers (Planned Support):**
1. **Stripe** (Phase 1 - refactor current implementation)
2. **PayPal** (Phase 2)
3. **ACP/Stripe Instant Checkout** (Phase 3)
4. **AP2/Google Agent Payments** (Phase 4)

---

## 6. Payment Flow Scenarios

### 6.1 Event Ticket Purchase (Primary Use Case)

**Current Flow:**
1. User selects tickets and adds to cart
2. User fills out registration form (email, name, phone)
3. Frontend calls `/api/stripe/payment-intent` (Next.js API route)
4. Next.js creates Stripe Payment Intent
5. Frontend loads Stripe Elements with `clientSecret`
6. User completes payment via Stripe Elements
7. Frontend confirms payment via `stripe.confirmPayment()`
8. Redirect to success page

**Proposed Flow:**
1. User selects tickets and adds to cart
2. User fills out registration form
3. Frontend calls backend `/api/payments/initialize`
   - Payload: `{ tenantId, eventId, cart, userInfo, paymentType: "TICKET_SALE" }`
4. Backend:
   - Resolves tenant payment provider configuration
   - Calls appropriate payment adapter (e.g., StripeAdapter)
   - Creates payment session/intent
   - Returns generic payment token + provider hint
5. Frontend receives: `{ paymentToken, provider: "stripe", sessionUrl?, clientSecret? }`
6. Frontend dynamically loads appropriate payment UI component
7. User completes payment (process varies by provider)
8. Provider webhook notifies backend of payment success
9. Backend creates transaction records, updates inventory
10. Backend notifies frontend via polling/websocket (optional)
11. Redirect to success page

### 6.2 Charity Donation

**Requirements:**
- No ticket inventory management
- Variable amount (user-specified)
- Optional recurring donations
- Tax receipt generation
- Donation allocation (specific fund/cause)

**Proposed Flow:**
1. User navigates to donation page for event/organization
2. User selects donation amount or enters custom amount
3. User optionally selects recurring schedule
4. User optionally designates donation allocation
5. Frontend calls `/api/payments/initialize`
   - Payload: `{ tenantId, eventId?, amount, paymentType: "DONATION", recurringSchedule?, allocationId? }`
6. Backend creates donation-specific payment intent
7. Backend marks transaction as tax-deductible
8. Payment processing continues similar to ticket purchase
9. Post-payment: Generate tax receipt PDF, send via email

### 6.3 Votive Offering (Church/Religious Context)

**Requirements:**
- During live-streamed Mass/service
- Quick, low-friction payment
- Pre-defined amounts + custom option
- Optional prayer intention submission
- Real-time acknowledgment display

**Proposed Flow:**
1. User watches live-stream, clicks "Donate" button
2. Modal displays offering amounts ($5, $10, $25, $50, custom)
3. User selects amount, optionally enters prayer intention
4. Frontend calls `/api/payments/initialize`
   - Payload: `{ tenantId, eventId, amount, paymentType: "OFFERING", prayerIntention? }`
5. Backend optimizes for speed (uses saved payment methods if available)
6. One-click confirmation via Apple Pay/Google Pay/Link
7. Real-time webhook updates offering counter on live-stream
8. Optional: Display prayer intention anonymously on stream

### 6.4 Multi-Provider Fallback

**Scenario:** Primary payment provider fails or unavailable

**Flow:**
1. User attempts payment via Stripe (tenant's primary provider)
2. Stripe returns error (e.g., "card_declined")
3. Frontend displays error message
4. Frontend calls `/api/payments/alternative-providers`
5. Backend returns list of alternative providers: `[ "paypal", "crypto" ]`
6. User selects PayPal
7. Frontend re-initializes payment with provider hint
8. Backend creates PayPal payment session
9. User completes payment via PayPal redirect flow

---

## 7. Database Schema Changes

### 7.1 New Tables

#### `payment_provider_config`

Stores tenant-specific payment provider configurations.

```sql
CREATE TABLE payment_provider_config (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- 'STRIPE', 'PAYPAL', 'ACP', 'AP2'
    provider_name VARCHAR(100) NOT NULL, -- Display name
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0, -- For fallback ordering

    -- Encrypted configuration JSON
    config_data TEXT NOT NULL, -- Encrypted JSON blob

    -- Provider-specific identifiers (examples)
    public_key VARCHAR(500), -- Publishable key (if needed in frontend)
    webhook_secret VARCHAR(500), -- For webhook signature verification

    -- Feature flags
    supports_wallets BOOLEAN DEFAULT false,
    supports_subscriptions BOOLEAN DEFAULT false,
    supports_refunds BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    created_by VARCHAR(255),

    CONSTRAINT uk_tenant_provider UNIQUE (tenant_id, provider_type),
    CONSTRAINT ck_one_primary_per_tenant
        CHECK (NOT is_primary OR
               (SELECT COUNT(*) FROM payment_provider_config
                WHERE tenant_id = payment_provider_config.tenant_id
                AND is_primary = true) = 1)
);

CREATE INDEX idx_ppc_tenant ON payment_provider_config(tenant_id);
CREATE INDEX idx_ppc_active ON payment_provider_config(is_active);
```

**Example Row:**
```json
{
  "id": 1,
  "tenant_id": "mcefee_main",
  "provider_type": "STRIPE",
  "provider_name": "Stripe Payments",
  "is_active": true,
  "is_primary": true,
  "priority": 1,
  "config_data": "{\"secret_key\":\"sk_live_***\",\"webhook_secret\":\"whsec_***\"}",
  "public_key": "pk_live_***",
  "supports_wallets": true,
  "supports_subscriptions": true
}
```

#### `payment_transaction`

New unified payment transaction table (replaces separate ticket/donation tracking).

```sql
CREATE TYPE payment_type AS ENUM (
    'TICKET_SALE',
    'DONATION',
    'OFFERING',
    'SUBSCRIPTION',
    'REFUND'
);

CREATE TYPE payment_status AS ENUM (
    'INITIATED',      -- Payment session created
    'PENDING',        -- User redirected/processing
    'PROCESSING',     -- Payment submitted to provider
    'SUCCEEDED',      -- Payment confirmed
    'FAILED',         -- Payment failed
    'CANCELLED',      -- User cancelled
    'REFUNDED',       -- Full refund issued
    'PARTIALLY_REFUNDED' -- Partial refund
);

CREATE TABLE payment_transaction (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,

    -- Transaction identification
    transaction_reference VARCHAR(255) GENERATED ALWAYS AS ('PAY' || id::text) STORED,
    external_transaction_id VARCHAR(500), -- Provider's transaction ID
    idempotency_key VARCHAR(255) UNIQUE,

    -- Payment provider info
    provider_type VARCHAR(50) NOT NULL, -- 'STRIPE', 'PAYPAL', etc.
    provider_transaction_id VARCHAR(500), -- e.g., Stripe Payment Intent ID
    provider_session_id VARCHAR(500), -- e.g., Stripe Checkout Session ID
    provider_customer_id VARCHAR(500), -- e.g., Stripe Customer ID

    -- Transaction type and amounts
    payment_type payment_type NOT NULL,
    amount_subtotal NUMERIC(21,2) NOT NULL,
    amount_tax NUMERIC(21,2) DEFAULT 0,
    amount_discount NUMERIC(21,2) DEFAULT 0,
    amount_platform_fee NUMERIC(21,2) DEFAULT 0,
    amount_processing_fee NUMERIC(21,2) DEFAULT 0,
    amount_total NUMERIC(21,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Customer information
    customer_email VARCHAR(255) NOT NULL,
    customer_first_name VARCHAR(255),
    customer_last_name VARCHAR(255),
    customer_phone VARCHAR(100),

    -- Related entities
    event_id BIGINT, -- NULL for non-event payments
    discount_code_id BIGINT,

    -- Payment method details
    payment_method_type VARCHAR(100), -- 'card', 'apple_pay', 'paypal', etc.
    payment_method_last4 VARCHAR(10), -- Last 4 digits of card
    payment_method_brand VARCHAR(50), -- 'visa', 'mastercard', etc.

    -- Status tracking
    status payment_status DEFAULT 'INITIATED' NOT NULL,
    failure_reason TEXT,
    failure_code VARCHAR(100),

    -- Timestamps
    initiated_at TIMESTAMP DEFAULT now() NOT NULL,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,

    -- Refund tracking
    refund_amount NUMERIC(21,2) DEFAULT 0,
    refund_reason VARCHAR(2048),

    -- Metadata
    metadata JSONB, -- Flexible storage for provider-specific data
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,

    -- Foreign keys
    CONSTRAINT fk_event FOREIGN KEY (event_id)
        REFERENCES event_details(id) ON DELETE SET NULL,
    CONSTRAINT fk_discount_code FOREIGN KEY (discount_code_id)
        REFERENCES discount_code(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT ck_amounts CHECK (
        amount_total >= 0 AND
        amount_subtotal >= 0 AND
        amount_discount >= 0
    )
);

CREATE INDEX idx_pt_tenant ON payment_transaction(tenant_id);
CREATE INDEX idx_pt_status ON payment_transaction(status);
CREATE INDEX idx_pt_provider_tx ON payment_transaction(provider_transaction_id);
CREATE INDEX idx_pt_customer_email ON payment_transaction(customer_email);
CREATE INDEX idx_pt_event ON payment_transaction(event_id);
CREATE INDEX idx_pt_created ON payment_transaction(created_at DESC);
CREATE INDEX idx_pt_idempotency ON payment_transaction(idempotency_key);
```

#### `payment_transaction_item`

Line items for transactions (tickets, merchandise, etc.).

```sql
CREATE TABLE payment_transaction_item (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    payment_transaction_id BIGINT NOT NULL,

    -- Item details
    item_type VARCHAR(50) NOT NULL, -- 'TICKET', 'MERCHANDISE', 'DONATION_ALLOCATION'
    item_id BIGINT, -- ticket_type_id, product_id, etc.
    item_name VARCHAR(500) NOT NULL,
    item_description TEXT,

    -- Quantities and amounts
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(21,2) NOT NULL,
    total_amount NUMERIC(21,2) NOT NULL,

    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP DEFAULT now() NOT NULL,

    -- Foreign key
    CONSTRAINT fk_payment_transaction
        FOREIGN KEY (payment_transaction_id)
        REFERENCES payment_transaction(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_pti_transaction ON payment_transaction_item(payment_transaction_id);
CREATE INDEX idx_pti_item ON payment_transaction_item(item_type, item_id);
```

#### `payment_webhook_log`

Logs all incoming webhook events for debugging and reconciliation.

```sql
CREATE TABLE payment_webhook_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255),

    -- Webhook identification
    provider_type VARCHAR(50) NOT NULL,
    webhook_id VARCHAR(500), -- Provider's webhook event ID
    webhook_type VARCHAR(200) NOT NULL, -- e.g., 'payment_intent.succeeded'

    -- Request details
    raw_payload TEXT NOT NULL, -- Full JSON payload
    signature VARCHAR(1000), -- Webhook signature for verification
    signature_verified BOOLEAN,

    -- Processing status
    processed BOOLEAN DEFAULT false,
    processing_attempted_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Related transaction
    payment_transaction_id BIGINT,

    -- Timestamps
    received_at TIMESTAMP DEFAULT now() NOT NULL,

    -- Foreign key
    CONSTRAINT fk_payment_transaction_webhook
        FOREIGN KEY (payment_transaction_id)
        REFERENCES payment_transaction(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_pwl_provider ON payment_webhook_log(provider_type);
CREATE INDEX idx_pwl_webhook_id ON payment_webhook_log(webhook_id);
CREATE INDEX idx_pwl_processed ON payment_webhook_log(processed, received_at);
CREATE INDEX idx_pwl_transaction ON payment_webhook_log(payment_transaction_id);
```

### 7.2 Modified Tables

#### `event_ticket_transaction` (Legacy)

**Option A: Deprecate and migrate to `payment_transaction`**
- Add migration script to copy existing data
- Keep table for historical reference
- New transactions go to `payment_transaction`

**Option B: Add provider abstraction columns**
```sql
ALTER TABLE event_ticket_transaction
ADD COLUMN provider_type VARCHAR(50) DEFAULT 'STRIPE',
ADD COLUMN provider_transaction_id VARCHAR(500),
ADD COLUMN payment_transaction_id BIGINT
    REFERENCES payment_transaction(id);
```

**Recommendation:** Option A (migrate to new unified table)

---

## 8. Backend Implementation Requirements

### 8.1 Core Payment Service Interface

**File:** `PaymentService.java`

```java
public interface PaymentService {
    /**
     * Initialize a payment session for given transaction
     * @return PaymentSession with provider-specific details
     */
    PaymentSession initializePayment(PaymentRequest request)
        throws PaymentException;

    /**
     * Confirm/capture a pending payment
     */
    PaymentResult confirmPayment(String transactionId, Map<String, Object> confirmationData)
        throws PaymentException;

    /**
     * Cancel an initiated payment
     */
    boolean cancelPayment(String transactionId)
        throws PaymentException;

    /**
     * Issue full or partial refund
     */
    RefundResult refundPayment(String transactionId, BigDecimal amount, String reason)
        throws PaymentException;

    /**
     * Retrieve current payment status from provider
     */
    PaymentStatus getPaymentStatus(String providerTransactionId)
        throws PaymentException;

    /**
     * Process incoming webhook from provider
     */
    WebhookResult processWebhook(WebhookPayload payload)
        throws PaymentException;

    /**
     * Get supported payment method types
     */
    List<PaymentMethodType> getSupportedPaymentMethods();

    /**
     * Get provider name
     */
    String getProviderType();
}
```

### 8.2 Payment Adapter Implementations

#### StripePaymentAdapter.java

```java
@Service
@ConditionalOnProperty(name = "payment.providers.stripe.enabled", havingValue = "true")
public class StripePaymentAdapter implements PaymentService {

    private final StripeClient stripeClient;
    private final PaymentProviderConfigRepository configRepository;

    @Override
    public PaymentSession initializePayment(PaymentRequest request) {
        // 1. Resolve tenant's Stripe configuration
        PaymentProviderConfig config = configRepository
            .findByTenantIdAndProviderType(request.getTenantId(), "STRIPE")
            .orElseThrow(() -> new PaymentException("Stripe not configured for tenant"));

        // 2. Decrypt Stripe secret key
        String secretKey = encryptionService.decrypt(config.getConfigData(), "secret_key");

        // 3. Create Payment Intent via Stripe API
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(request.getAmountCents())
            .setCurrency(request.getCurrency())
            .setReceiptEmail(request.getCustomerEmail())
            .setAutomaticPaymentMethods(
                AutomaticPaymentMethodsParams.builder().setEnabled(true).build()
            )
            .putMetadata("tenant_id", request.getTenantId())
            .putMetadata("payment_type", request.getPaymentType().name())
            .putMetadata("event_id", String.valueOf(request.getEventId()))
            .build();

        PaymentIntent intent = PaymentIntent.create(params,
            RequestOptions.builder().setApiKey(secretKey).build());

        // 4. Create local payment_transaction record
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTenantId(request.getTenantId());
        transaction.setProviderType("STRIPE");
        transaction.setProviderTransactionId(intent.getId());
        transaction.setPaymentType(request.getPaymentType());
        transaction.setAmountTotal(request.getAmount());
        transaction.setStatus(PaymentStatus.INITIATED);
        transaction.setCustomerEmail(request.getCustomerEmail());
        // ... set other fields
        paymentTransactionRepository.save(transaction);

        // 5. Return session details to frontend
        return PaymentSession.builder()
            .transactionId(transaction.getId())
            .providerType("STRIPE")
            .clientSecret(intent.getClientSecret())
            .publicKey(config.getPublicKey())
            .metadata(Map.of(
                "payment_intent_id", intent.getId(),
                "supports_wallets", config.isSupportsWallets()
            ))
            .build();
    }

    @Override
    public WebhookResult processWebhook(WebhookPayload payload) {
        // 1. Verify webhook signature
        String signature = payload.getSignature();
        String webhookSecret = getWebhookSecret(payload.getTenantId());

        Event event = Webhook.constructEvent(
            payload.getRawPayload(), signature, webhookSecret
        );

        // 2. Log webhook
        PaymentWebhookLog log = new PaymentWebhookLog();
        log.setProviderType("STRIPE");
        log.setWebhookId(event.getId());
        log.setWebhookType(event.getType());
        log.setRawPayload(payload.getRawPayload());
        log.setSignatureVerified(true);
        webhookLogRepository.save(log);

        // 3. Handle event types
        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentFailed(event);
                break;
            case "charge.refunded":
                handleRefund(event);
                break;
            // ... other event types
        }

        return WebhookResult.success();
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
            .getObject().orElseThrow();

        // Find local transaction
        PaymentTransaction transaction = paymentTransactionRepository
            .findByProviderTransactionId(intent.getId())
            .orElseThrow();

        // Update transaction status
        transaction.setStatus(PaymentStatus.SUCCEEDED);
        transaction.setCompletedAt(Instant.now());
        transaction.setPaymentMethodType(intent.getPaymentMethodTypes().get(0));

        // Extract payment method details
        if (intent.getCharges() != null && !intent.getCharges().getData().isEmpty()) {
            Charge charge = intent.getCharges().getData().get(0);
            PaymentMethod pm = charge.getPaymentMethod();
            if (pm != null && pm.getCard() != null) {
                transaction.setPaymentMethodLast4(pm.getCard().getLast4());
                transaction.setPaymentMethodBrand(pm.getCard().getBrand());
            }
        }

        paymentTransactionRepository.save(transaction);

        // Trigger post-payment actions
        postPaymentService.handleSuccessfulPayment(transaction);
    }
}
```

#### PayPalPaymentAdapter.java

```java
@Service
@ConditionalOnProperty(name = "payment.providers.paypal.enabled", havingValue = "true")
public class PayPalPaymentAdapter implements PaymentService {

    @Override
    public PaymentSession initializePayment(PaymentRequest request) {
        // 1. Get PayPal configuration
        PaymentProviderConfig config = configRepository
            .findByTenantIdAndProviderType(request.getTenantId(), "PAYPAL")
            .orElseThrow();

        // 2. Create PayPal order
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.intent("CAPTURE");
        orderRequest.purchaseUnits(List.of(
            new PurchaseUnitRequest()
                .amount(new AmountWithBreakdown()
                    .currencyCode(request.getCurrency())
                    .value(request.getAmount().toString()))
                .description("Event tickets - " + request.getEventId())
        ));

        OrdersCreateRequest ordersCreateRequest = new OrdersCreateRequest();
        ordersCreateRequest.requestBody(orderRequest);

        HttpResponse<Order> response = payPalClient.execute(ordersCreateRequest);
        Order order = response.result();

        // 3. Create local transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setProviderType("PAYPAL");
        transaction.setProviderTransactionId(order.id());
        // ... set other fields
        paymentTransactionRepository.save(transaction);

        // 4. Return session (PayPal uses redirect flow)
        String approvalUrl = order.links().stream()
            .filter(link -> link.rel().equals("approve"))
            .findFirst()
            .map(LinkDescription::href)
            .orElseThrow();

        return PaymentSession.builder()
            .transactionId(transaction.getId())
            .providerType("PAYPAL")
            .sessionUrl(approvalUrl) // Frontend redirects to this
            .publicKey(config.getPublicKey()) // PayPal client ID
            .build();
    }

    // ... implement other methods
}
```

### 8.3 REST API Endpoints

#### PaymentController.java

```java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentOrchestrationService orchestrationService;

    /**
     * Initialize payment session
     * POST /api/payments/initialize
     */
    @PostMapping("/initialize")
    public ResponseEntity<PaymentSessionResponse> initializePayment(
        @RequestBody PaymentInitializeRequest request,
        @RequestHeader("X-Tenant-ID") String tenantId
    ) {
        request.setTenantId(tenantId);

        PaymentSession session = orchestrationService.initializePayment(request);

        return ResponseEntity.ok(PaymentSessionResponse.from(session));
    }

    /**
     * Confirm payment (for server-side confirmation flows)
     * POST /api/payments/{transactionId}/confirm
     */
    @PostMapping("/{transactionId}/confirm")
    public ResponseEntity<PaymentResult> confirmPayment(
        @PathVariable Long transactionId,
        @RequestBody Map<String, Object> confirmationData
    ) {
        PaymentResult result = orchestrationService.confirmPayment(
            transactionId, confirmationData
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Get payment status
     * GET /api/payments/{transactionId}
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
        @PathVariable Long transactionId
    ) {
        PaymentTransaction transaction = paymentTransactionRepository
            .findById(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        return ResponseEntity.ok(PaymentStatusResponse.from(transaction));
    }

    /**
     * Issue refund
     * POST /api/payments/{transactionId}/refund
     */
    @PostMapping("/{transactionId}/refund")
    public ResponseEntity<RefundResult> refundPayment(
        @PathVariable Long transactionId,
        @RequestBody RefundRequest request
    ) {
        RefundResult result = orchestrationService.refundPayment(
            transactionId, request.getAmount(), request.getReason()
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Get alternative payment providers for tenant
     * GET /api/payments/providers/alternatives
     */
    @GetMapping("/providers/alternatives")
    public ResponseEntity<List<PaymentProviderInfo>> getAlternativeProviders(
        @RequestHeader("X-Tenant-ID") String tenantId,
        @RequestParam(required = false) String excludeProvider
    ) {
        List<PaymentProviderConfig> providers = configRepository
            .findByTenantIdAndIsActiveTrue(tenantId);

        List<PaymentProviderInfo> providerInfos = providers.stream()
            .filter(p -> !p.getProviderType().equals(excludeProvider))
            .map(PaymentProviderInfo::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(providerInfos);
    }
}
```

#### WebhookController.java

```java
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final PaymentOrchestrationService orchestrationService;

    /**
     * Stripe webhook endpoint
     * POST /api/webhooks/stripe
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String signature
    ) {
        WebhookPayload webhookPayload = WebhookPayload.builder()
            .rawPayload(payload)
            .signature(signature)
            .providerType("STRIPE")
            .build();

        orchestrationService.processWebhook(webhookPayload);

        return ResponseEntity.ok("Webhook received");
    }

    /**
     * PayPal webhook endpoint
     * POST /api/webhooks/paypal
     */
    @PostMapping("/paypal")
    public ResponseEntity<String> handlePayPalWebhook(
        @RequestBody String payload,
        @RequestHeader(value = "PAYPAL-TRANSMISSION-ID") String transmissionId,
        @RequestHeader(value = "PAYPAL-TRANSMISSION-SIG") String signature
    ) {
        WebhookPayload webhookPayload = WebhookPayload.builder()
            .rawPayload(payload)
            .signature(signature)
            .metadata(Map.of("transmission_id", transmissionId))
            .providerType("PAYPAL")
            .build();

        orchestrationService.processWebhook(webhookPayload);

        return ResponseEntity.ok("Webhook received");
    }
}
```

### 8.4 Configuration Management

#### PaymentProviderConfigService.java

```java
@Service
public class PaymentProviderConfigService {

    private final PaymentProviderConfigRepository configRepository;
    private final EncryptionService encryptionService;

    // Cache configurations per tenant (invalidate on update)
    private final LoadingCache<String, List<PaymentProviderConfig>> configCache;

    public PaymentProviderConfigService() {
        this.configCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(15))
            .build(this::loadConfigForTenant);
    }

    /**
     * Get active payment provider configuration for tenant
     */
    public PaymentProviderConfig getPrimaryProvider(String tenantId) {
        return configCache.get(tenantId).stream()
            .filter(PaymentProviderConfig::isPrimary)
            .findFirst()
            .orElseThrow(() -> new PaymentException(
                "No primary payment provider configured for tenant: " + tenantId
            ));
    }

    /**
     * Get specific provider configuration
     */
    public PaymentProviderConfig getProviderConfig(String tenantId, String providerType) {
        return configCache.get(tenantId).stream()
            .filter(c -> c.getProviderType().equals(providerType))
            .findFirst()
            .orElseThrow(() -> new PaymentException(
                "Provider " + providerType + " not configured for tenant: " + tenantId
            ));
    }

    /**
     * Decrypt and retrieve provider credentials
     */
    public Map<String, String> getProviderCredentials(PaymentProviderConfig config) {
        String decryptedData = encryptionService.decrypt(config.getConfigData());
        return objectMapper.readValue(decryptedData, new TypeReference<>() {});
    }

    /**
     * Create or update provider configuration
     */
    @Transactional
    public PaymentProviderConfig saveProviderConfig(
        String tenantId,
        String providerType,
        Map<String, String> credentials,
        boolean isPrimary
    ) {
        // If setting as primary, unset existing primary
        if (isPrimary) {
            configRepository.unsetPrimaryForTenant(tenantId);
        }

        PaymentProviderConfig config = configRepository
            .findByTenantIdAndProviderType(tenantId, providerType)
            .orElse(new PaymentProviderConfig());

        config.setTenantId(tenantId);
        config.setProviderType(providerType);
        config.setPrimary(isPrimary);

        // Encrypt sensitive credentials
        String encryptedData = encryptionService.encrypt(
            objectMapper.writeValueAsString(credentials)
        );
        config.setConfigData(encryptedData);

        // Extract public key if present (for frontend use)
        if (credentials.containsKey("publishable_key")) {
            config.setPublicKey(credentials.get("publishable_key"));
        }

        PaymentProviderConfig saved = configRepository.save(config);

        // Invalidate cache
        configCache.invalidate(tenantId);

        return saved;
    }

    private List<PaymentProviderConfig> loadConfigForTenant(String tenantId) {
        return configRepository.findByTenantIdAndIsActiveTrue(tenantId);
    }
}
```

---

## 9. Frontend Implementation Requirements

### 9.1 Universal Payment Component

**File:** `src/components/UniversalPaymentCheckout.tsx`

```typescript
"use client";

import React, { useEffect, useState } from 'react';
import { StripePaymentUI } from './payment-providers/StripePaymentUI';
import { PayPalPaymentUI } from './payment-providers/PayPalPaymentUI';

type PaymentSession = {
  transactionId: number;
  providerType: 'STRIPE' | 'PAYPAL' | 'ACP' | 'AP2';
  clientSecret?: string;
  sessionUrl?: string;
  publicKey?: string;
  metadata?: Record<string, any>;
};

type Props = {
  cart: Array<{ ticketTypeId: number; quantity: number }>;
  eventId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  discountCodeId?: number;
  paymentType?: 'TICKET_SALE' | 'DONATION' | 'OFFERING';
  onSuccess?: (transactionId: number) => void;
  onError?: (error: string) => void;
};

export function UniversalPaymentCheckout({
  cart,
  eventId,
  email,
  firstName,
  lastName,
  phone,
  discountCodeId,
  paymentType = 'TICKET_SALE',
  onSuccess,
  onError
}: Props) {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePayment();
  }, [cart, email, discountCodeId]);

  async function initializePayment() {
    setLoading(true);
    setError(null);

    try {
      // Call backend to initialize payment
      const response = await fetch('/api/proxy/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          cart: cart.map(item => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity
          })),
          customerEmail: email,
          customerFirstName: firstName,
          customerLastName: lastName,
          customerPhone: phone,
          discountCodeId,
          paymentType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const paymentSession: PaymentSession = await response.json();
      setSession(paymentSession);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <p className="ml-3 text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={initializePayment}
          className="mt-2 text-sm text-red-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Dynamically render provider-specific UI
  switch (session.providerType) {
    case 'STRIPE':
      return (
        <StripePaymentUI
          clientSecret={session.clientSecret!}
          publicKey={session.publicKey!}
          transactionId={session.transactionId}
          onSuccess={() => onSuccess?.(session.transactionId)}
          onError={onError}
        />
      );

    case 'PAYPAL':
      return (
        <PayPalPaymentUI
          sessionUrl={session.sessionUrl!}
          clientId={session.publicKey!}
          transactionId={session.transactionId}
          onSuccess={() => onSuccess?.(session.transactionId)}
          onError={onError}
        />
      );

    default:
      return (
        <div className="text-red-600">
          Unsupported payment provider: {session.providerType}
        </div>
      );
  }
}
```

### 9.2 Provider-Specific UI Components

#### StripePaymentUI.tsx

```typescript
"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

type Props = {
  clientSecret: string;
  publicKey: string;
  transactionId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

function CheckoutForm({ transactionId, onSuccess, onError }: Omit<Props, 'clientSecret' | 'publicKey'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded - redirect to success page
        window.location.href = `/event/success?transactionId=${transactionId}`;
        onSuccess?.();
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <ExpressCheckoutElement
        onConfirm={handleSubmit}
        options={{ layout: 'horizontal' }}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or pay with card</span>
        </div>
      </div>

      <PaymentElement />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={processing || !stripe}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}

export function StripePaymentUI({ clientSecret, publicKey, transactionId, onSuccess, onError }: Props) {
  const stripePromise = loadStripe(publicKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutForm transactionId={transactionId} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
```

#### PayPalPaymentUI.tsx

```typescript
"use client";

import React, { useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

type Props = {
  sessionUrl: string; // Not used in embedded flow, but kept for redirect fallback
  clientId: string;
  transactionId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function PayPalPaymentUI({ clientId, transactionId, onSuccess, onError }: Props) {
  return (
    <PayPalScriptProvider options={{ 'client-id': clientId, currency: 'USD' }}>
      <div className="space-y-4">
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
          createOrder={async () => {
            // This would normally be handled by backend, but PayPal's SDK requires it here
            // Alternative: Use server-side PayPal order creation and pass order ID
            const response = await fetch('/api/proxy/payments/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId })
            });
            const data = await response.json();
            return data.orderId;
          }}
          onApprove={async (data) => {
            // Capture order on backend
            const response = await fetch('/api/proxy/payments/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderID,
                transactionId
              })
            });

            if (response.ok) {
              window.location.href = `/event/success?transactionId=${transactionId}`;
              onSuccess?.();
            } else {
              const error = await response.json();
              onError?.(error.message || 'PayPal payment failed');
            }
          }}
          onError={(err) => {
            onError?.(err.message || 'PayPal error');
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
```

### 9.3 API Proxy Routes

Frontend calls backend via proxy routes (maintains existing pattern).

**File:** `src/pages/api/proxy/payments/initialize.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  path: '/payments/initialize',
  allowedMethods: ['POST']
});
```

**File:** `src/pages/api/proxy/payments/[transactionId]/status.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  path: (req) => `/payments/${req.query.transactionId}`,
  allowedMethods: ['GET']
});
```

---

## 10. Security & Compliance

### 10.1 PCI DSS Compliance

**Current State:**
- Stripe.js tokenization keeps card data out of frontend/backend
- No card data stored in database
- PCI SAQ A compliance (lowest level)

**With Domain-Agnostic Architecture:**
- Continue using tokenization for all providers
- Backend NEVER handles raw card data
- Payment provider SDKs handle PCI compliance
- Maintain SAQ A compliance level

**Action Items:**
1. Document that backend only stores tokenized payment method IDs
2. Ensure all provider credentials encrypted at rest
3. Regular security audits of encryption implementation
4. SSL/TLS for all API communication

### 10.2 Data Encryption

**Encryption Requirements:**

1. **Payment Provider Credentials** (in `payment_provider_config.config_data`)
   - Algorithm: AES-256-GCM
   - Key management: AWS KMS or HashiCorp Vault
   - Rotate keys annually

2. **Database Encryption**
   - Enable PostgreSQL transparent data encryption
   - Encrypted backups

3. **Transit Encryption**
   - TLS 1.3 for all API calls
   - Certificate pinning for mobile apps (future)

### 10.3 Webhook Security

**Verification Steps:**

1. **Signature Verification** (for each provider)
   ```java
   // Stripe example
   Event event = Webhook.constructEvent(
       payload, sigHeader, webhookSecret
   );
   ```

2. **Idempotency**
   - Check `payment_webhook_log.webhook_id` for duplicates
   - Handle retries gracefully

3. **Timing Attack Protection**
   - Use constant-time comparison for signatures
   - Rate limiting on webhook endpoints

4. **IP Allowlisting** (optional)
   - Restrict webhook endpoints to provider IPs
   - Stripe: https://stripe.com/docs/ips
   - PayPal: https://www.paypal.com/webapps/mpp/webhook-ips

### 10.4 Fraud Prevention

**Strategies:**

1. **Stripe Radar** (if using Stripe)
   - Automatic fraud detection
   - Configurable rules for high-risk transactions

2. **Velocity Checks**
   - Limit transactions per user per time period
   - Alert on unusual patterns

3. **Address Verification Service (AVS)**
   - Enabled for card payments
   - Decline mismatched addresses

4. **3D Secure (SCA)**
   - Required for European customers (PSD2)
   - Stripe handles automatically

5. **Transaction Monitoring**
   - Dashboard for reviewing flagged transactions
   - Manual review workflow for high-value purchases

---

## 11. Migration Strategy

### Phase 1: Foundation (Weeks 1-4)

**Backend:**
1. Create new database tables (`payment_provider_config`, `payment_transaction`, etc.)
2. Implement `PaymentService` interface
3. Implement `StripePaymentAdapter` (refactor existing Stripe logic)
4. Create `PaymentOrchestrationService`
5. Build REST endpoints (`/api/payments/*`)

**Frontend:**
1. Create `UniversalPaymentCheckout` component
2. Refactor `StripePaymentUI` component
3. Create API proxy routes

**Migration:**
1. Run database migration scripts
2. Copy existing `event_ticket_transaction` data to `payment_transaction`
3. Configure Stripe for existing tenants via admin panel

**Testing:**
1. Unit tests for payment adapters
2. Integration tests for payment flow
3. Test with Stripe test mode

### Phase 2: Multi-Provider Support (Weeks 5-8)

**Backend:**
1. Implement `PayPalPaymentAdapter`
2. Add PayPal webhook handling
3. Create provider fallback logic

**Frontend:**
1. Create `PayPalPaymentUI` component
2. Add provider selection UI (if needed)
3. Update success/failure pages to handle both providers

**Migration:**
1. Configure PayPal for pilot tenants
2. A/B test with subset of users

### Phase 3: Full Rollout (Weeks 9-12)

**Deployment:**
1. Enable new payment system for all tenants
2. Deprecate old Stripe-specific API routes (keep for 90 days)
3. Monitor error rates, conversion rates

**Documentation:**
1. Admin guide for configuring payment providers
2. Tenant onboarding documentation
3. Developer API documentation

**Monitoring:**
1. Set up alerts for payment failures
2. Dashboard for payment analytics
3. Weekly review meetings

### Phase 4: Advanced Features (Future)

**Agentic Commerce Protocol (ACP):**
1. Research OpenAI partnership requirements
2. Implement ACP adapter
3. Beta test with ChatGPT users

**Agent Payments Protocol (AP2):**
1. Monitor AP2 consumer availability
2. Implement crypto payment support (via Coinbase integration)
3. Pilot with tech-savvy user segment

**Other Enhancements:**
1. Recurring payments for subscriptions
2. Multi-currency support
3. Installment plans
4. Gift cards / vouchers

---

## 12. Success Metrics

### Key Performance Indicators (KPIs)

1. **Payment Conversion Rate**
   - Target: Maintain or improve current rate (measure before/after)
   - Track by provider

2. **Payment Success Rate**
   - Target: >99% for successful transactions
   - Track failed payments by reason

3. **Average Payment Processing Time**
   - Target: <5 seconds from submission to confirmation
   - Track by provider

4. **Provider Uptime**
   - Target: 99.9% availability
   - Monitor via health checks

5. **Multi-Tenant Scalability**
   - Target: Support 100+ tenants without performance degradation
   - Track API response times

### Business Metrics

1. **Time to Onboard New Domain**
   - Current: Several days (manual Stripe setup)
   - Target: <1 hour (self-service configuration)

2. **Payment Provider Flexibility**
   - Current: 1 provider (Stripe)
   - Target: 2+ providers by end of Phase 2

3. **Developer Efficiency**
   - Current: Provider-specific code per feature
   - Target: Single implementation for all providers

4. **User Satisfaction**
   - NPS score for checkout experience
   - Abandoned cart rate

---

## 13. Timeline & Phases

### Phase 1: Foundation (4 weeks)
- **Week 1-2:** Database schema, backend interfaces
- **Week 3:** Stripe adapter implementation
- **Week 4:** Frontend components, testing

**Deliverables:**
- Working domain-agnostic payment system with Stripe
- Migration of existing data
- Admin panel for provider configuration

### Phase 2: Multi-Provider (4 weeks)
- **Week 5-6:** PayPal adapter implementation
- **Week 7:** Provider fallback logic
- **Week 8:** Testing, bug fixes

**Deliverables:**
- PayPal support
- Provider selection UI
- Comprehensive test suite

### Phase 3: Rollout (4 weeks)
- **Week 9-10:** Pilot with select tenants
- **Week 11:** Full production rollout
- **Week 12:** Monitoring, optimization

**Deliverables:**
- Production-ready system
- Documentation
- Monitoring dashboards

### Phase 4: Future Enhancements (TBD)
- ACP integration
- AP2 research/pilot
- Advanced payment features

**Total Timeline:** 12 weeks for core implementation (Phases 1-3)

---

## 14. Appendix

### A. Glossary

- **ACP:** Agentic Commerce Protocol (OpenAI + Stripe)
- **AP2:** Agent Payments Protocol (Google)
- **Multi-Tenant:** Single application serving multiple organizations
- **Payment Intent:** Stripe's object tracking payment lifecycle
- **Payment Session:** Generic abstraction for payment initiation
- **Provider Adapter:** Implementation of payment provider interface
- **SPT:** Shared Payment Token (ACP primitive)
- **Webhook:** HTTP callback from payment provider on event

### B. References

**Standards & Protocols:**
- [Agentic Commerce Protocol GitHub](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol)
- [Google AP2 Announcement](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)
- [Stripe ACP Blog Post](https://stripe.com/blog/developing-an-open-standard-for-agentic-commerce)

**Payment Provider Documentation:**
- [Stripe API Reference](https://stripe.com/docs/api)
- [PayPal REST API](https://developer.paypal.com/api/rest/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/)

**Architecture Patterns:**
- [Multi-Tenant Architecture Best Practices](https://www.datamation.com/big-data/what-is-multi-tenant-architecture/)
- [Payment Gateway Architecture](https://codewave.com/insights/payment-gateway-design-system-architecture/)

### C. Sample Configuration

**Stripe Configuration Example:**
```json
{
  "provider_type": "STRIPE",
  "config_data": {
    "secret_key": "sk_live_***",
    "webhook_secret": "whsec_***",
    "connect_account_id": "acct_xxxxxxxxxxxxx"
  },
  "public_key": "pk_live_***",
  "supports_wallets": true,
  "supports_subscriptions": true,
  "webhook_url": "https://api.example.com/api/webhooks/stripe"
}
```

**PayPal Configuration Example:**
```json
{
  "provider_type": "PAYPAL",
  "config_data": {
    "client_id": "xxxxxxxxxxxxx",
    "client_secret": "xxxxxxxxxxxxx",
    "mode": "live"
  },
  "public_key": "xxxxxxxxxxxxx",
  "supports_wallets": false,
  "supports_subscriptions": true,
  "webhook_url": "https://api.example.com/api/webhooks/paypal"
}
```

### D. Database Migration Scripts

**Create New Tables:**
```sql
-- See Section 7.1 for full CREATE TABLE statements

-- Migration: Copy existing data
INSERT INTO payment_transaction (
    tenant_id,
    provider_type,
    provider_transaction_id,
    payment_type,
    amount_subtotal,
    amount_discount,
    amount_total,
    currency,
    customer_email,
    customer_first_name,
    customer_last_name,
    customer_phone,
    event_id,
    discount_code_id,
    status,
    completed_at,
    created_at
)
SELECT
    tenant_id,
    'STRIPE' as provider_type,
    stripe_payment_intent_id,
    'TICKET_SALE' as payment_type,
    total_amount,
    discount_amount,
    final_amount,
    stripe_payment_currency,
    email,
    first_name,
    last_name,
    phone,
    -- event_id: Extract from related ticket type
    (SELECT event_id FROM event_ticket_transaction_item etti
     LEFT JOIN event_ticket_type ett ON etti.ticket_type_id = ett.id
     WHERE etti.transaction_id = event_ticket_transaction.id
     LIMIT 1) as event_id,
    discount_code_id,
    CASE
        WHEN status = 'COMPLETED' THEN 'SUCCEEDED'::payment_status
        WHEN status = 'REFUNDED' THEN 'REFUNDED'::payment_status
        WHEN status = 'FAILED' THEN 'FAILED'::payment_status
        ELSE 'PENDING'::payment_status
    END as status,
    purchase_date,
    purchase_date
FROM event_ticket_transaction
WHERE stripe_payment_intent_id IS NOT NULL;
```

---

## Conclusion

This PRD outlines a comprehensive transformation from a single-domain, Stripe-centric payment system to a **domain-agnostic, multi-provider payment architecture**. The proposed solution:

1. **Centralizes** payment logic in the backend
2. **Abstracts** payment provider implementations via adapter pattern
3. **Enables** multi-tenant flexibility with per-tenant provider configuration
4. **Maintains** user-friendly checkout experience
5. **Future-proofs** for emerging standards (ACP, AP2)

**Next Steps:**
1. Review and approve this PRD
2. Break down into task-master tasks
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

**Questions/Feedback:**
Please direct all questions to the development team via project management system.
