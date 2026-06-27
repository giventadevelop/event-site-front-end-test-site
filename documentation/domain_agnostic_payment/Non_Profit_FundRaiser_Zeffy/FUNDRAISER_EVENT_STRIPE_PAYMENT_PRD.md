# Fundraiser Event with Stripe Payment - Product Requirements Document (PRD)

**Project:** MCEFEE Multi-Tenant Event Management Platform
**Document Version:** 1.0
**Date:** January 2025
**Status:** Ready for Implementation

---

## Executive Summary

This PRD outlines the implementation of **fundraiser events** that use **Stripe** as the payment provider, leveraging the existing domain-agnostic payment infrastructure. Fundraiser events allow organizations to collect variable-amount donations without ticket inventory management, while maintaining compatibility with the current ticket-based payment workflow.

### Key Objectives

1. **Enable Fundraiser Events**: Allow events to be marked as fundraisers (`admission_type = 'DONATION_BASED'`)
2. **Stripe Payment Integration**: Use Stripe as the payment provider for fundraiser donations
3. **Reuse Existing Payment Flow**: Leverage the domain-agnostic payment system without corrupting ticket workflows
4. **Variable Donation Amounts**: Support user-specified donation amounts with preset options
5. **Seamless User Experience**: Provide a consistent checkout experience for both tickets and donations

---

## Table of Contents

1. [Background & Context](#background--context)
2. [Current System Analysis](#current-system-analysis)
3. [Requirements](#requirements)
4. [Proposed Solution](#proposed-solution)
5. [Database Schema](#database-schema)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [API Specifications](#api-specifications)
9. [User Workflows](#user-workflows)
10. [Migration & Compatibility](#migration--compatibility)
11. [Testing Strategy](#testing-strategy)
12. [Success Metrics](#success-metrics)
13. [Timeline & Phases](#timeline--phases)

---

## 1. Background & Context

### Current System Capabilities

The MCEFEE platform already supports:

- **Domain-Agnostic Payment System**: Backend payment orchestration layer with provider abstraction
- **Stripe Integration**: Fully functional Stripe payment adapter
- **Event Types**: Support for `FREE`, `TICKETED`, `INVITATION_ONLY`, and `DONATION_BASED` admission types
- **Payment Types**: Support for `TICKET_SALE`, `DONATION`, `DONATION_CEFI`, `DONATION_ZERO_FEE`, `OFFERING`, `MEMBERSHIP_SUBSCRIPTION`
- **Universal Payment Checkout**: Frontend component (`UniversalPaymentCheckout`) that works with any payment provider

### Problem Statement

Currently, while the system supports `DONATION_BASED` admission type in the database schema, there is no complete implementation for:

1. **Fundraiser Event Configuration**: Admin UI to mark events as fundraisers
2. **Donation-Specific Checkout Flow**: Frontend components for variable-amount donations
3. **Stripe Donation Processing**: Backend logic to handle donation payments via Stripe
4. **Donation Transaction Tracking**: Proper recording of donation transactions (separate from ticket transactions)

### Business Value

- **Non-Profit Organizations**: Enable fundraising events for charities, religious organizations, and community groups
- **Flexible Donation Amounts**: Allow supporters to choose their contribution level
- **Unified Payment Experience**: Same Stripe checkout experience for tickets and donations
- **Revenue Diversification**: Support multiple revenue streams (tickets, donations, memberships)

---

## 2. Current System Analysis

### Database Schema

**`event_details` Table:**
```sql
CREATE TYPE event_admission_type AS ENUM (
    'FREE',
    'TICKETED',
    'INVITATION_ONLY',
    'DONATION_BASED'  -- ✅ Already exists
);

CREATE TABLE event_details (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    admission_type event_admission_type DEFAULT 'TICKETED',
    -- ... other fields
);
```

**`payment_transaction` Table (from domain-agnostic payment system):**
```sql
CREATE TYPE payment_type AS ENUM (
    'TICKET_SALE',
    'DONATION',           -- ✅ Already exists
    'DONATION_CEFI',
    'DONATION_ZERO_FEE',
    'OFFERING',
    'SUBSCRIPTION',
    'MERCHANDISE',
    'MEMBERSHIP',
    'REFUND'
);

CREATE TABLE payment_transaction (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    payment_type payment_type NOT NULL,
    amount_total NUMERIC(21,2) NOT NULL,
    event_id BIGINT,
    customer_email VARCHAR(255) NOT NULL,
    provider_type payment_provider_type NOT NULL,
    provider_transaction_id VARCHAR(500),
    status payment_status DEFAULT 'INITIATED',
    -- ... other fields
);
```

### Existing Payment Flow

**Current Ticket Purchase Flow:**
1. User selects tickets → adds to cart
2. User fills registration form (email, name, phone)
3. Frontend calls `/api/proxy/payments/initialize` with `paymentType: 'TICKET_SALE'`
4. Backend creates Stripe Payment Intent
5. Frontend displays Stripe payment UI
6. User completes payment
7. Webhook updates transaction status
8. QR code generated (for tickets)

**What Needs to Change for Fundraisers:**
- Step 1: No cart (variable donation amount)
- Step 3: `paymentType: 'DONATION'` instead of `'TICKET_SALE'`
- Step 8: No QR code (donations don't require check-in)

### Frontend Components

**Existing:**
- `UniversalPaymentCheckout.tsx` - Provider-agnostic payment wrapper
- `StripePaymentUI.tsx` - Stripe-specific payment UI
- Checkout page: `src/app/events/[id]/checkout/page.tsx`

**What's Missing:**
- Donation amount selector component
- Fundraiser-specific checkout page variant
- Admin UI to mark events as fundraisers

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: Fundraiser Event Configuration
- **FR-1.1**: Admin can mark an event as a fundraiser by setting `admission_type = 'DONATION_BASED'`
- **FR-1.2**: Admin can configure preset donation amounts (e.g., $25, $50, $100, $250, Custom)
- **FR-1.3**: Admin can set minimum donation amount
- **FR-1.4**: Admin can set suggested/default donation amount
- **FR-1.5**: Admin can enable/disable custom donation amounts

#### FR-2: Donation Checkout Flow
- **FR-2.1**: User can select from preset donation amounts or enter custom amount
- **FR-2.2**: User can enter donor information (name, email, phone, optional address for tax receipts)
- **FR-2.3**: User can add optional donation message/dedication
- **FR-2.4**: User can choose to make donation anonymous
- **FR-2.5**: User completes payment via Stripe (same UI as ticket purchases)
- **FR-2.6**: User receives confirmation email with donation receipt

#### FR-3: Payment Processing
- **FR-3.1**: Backend creates Stripe Payment Intent for donation amount
- **FR-3.2**: Payment Intent metadata includes `payment_type: 'DONATION'` and `event_id`
- **FR-3.3**: Payment transaction recorded in `payment_transaction` table with `payment_type = 'DONATION'`
- **FR-3.4**: No `payment_transaction_item` records created (donations don't have line items)
- **FR-3.5**: Webhook handler processes donation payments same as ticket payments

#### FR-4: Transaction Tracking
- **FR-4.1**: Donation transactions stored in `payment_transaction` table
- **FR-4.2**: Donation transactions linked to event via `event_id`
- **FR-4.3**: Donation amount stored in `amount_total` field
- **FR-4.4**: Donor information stored in customer fields (`customer_email`, `customer_first_name`, etc.)
- **FR-4.5**: Optional donation message stored in `metadata` JSONB field

#### FR-5: Reporting & Analytics
- **FR-5.1**: Admin can view total donations per event
- **FR-5.2**: Admin can view donation transaction list
- **FR-5.3**: Admin can export donation data for tax reporting
- **FR-5.4**: Admin can view donor list (with privacy controls)

### 3.2 Non-Functional Requirements

#### NFR-1: Compatibility
- **NFR-1.1**: Existing ticket purchase flow must remain unchanged
- **NFR-1.2**: Fundraiser events must not interfere with ticket events
- **NFR-1.3**: Payment provider abstraction must be maintained

#### NFR-2: Security
- **NFR-2.1**: Donation amounts validated (minimum, maximum if set)
- **NFR-2.2**: Stripe webhook signature verification required
- **NFR-2.3**: Donor information encrypted at rest

#### NFR-3: Performance
- **NFR-3.1**: Donation checkout should load in <2 seconds
- **NFR-3.2**: Payment processing should complete in <5 seconds

#### NFR-4: User Experience
- **NFR-4.1**: Donation flow should be intuitive and require minimal clicks
- **NFR-4.2**: Error messages should be clear and actionable
- **NFR-4.3**: Mobile-responsive design required

---

## 4. Proposed Solution

### 4.1 Architecture Overview

The solution leverages the existing domain-agnostic payment system:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────────┐   │
│  │ Ticket Checkout  │         │ Donation Checkout     │   │
│  │   (Existing)     │         │   (New Component)     │   │
│  └────────┬─────────┘         └──────────┬─────────────┘   │
│           │                              │                 │
│           └──────────────┬───────────────┘                 │
│                          │                                 │
│           ┌──────────────▼───────────────┐                 │
│           │ UniversalPaymentCheckout     │                 │
│           │  (paymentType: TICKET_SALE   │                 │
│           │   or DONATION)               │                 │
│           └──────────────┬───────────────┘                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           │ POST /api/proxy/payments/initialize
                           │ { paymentType: 'DONATION', amount: 50.00 }
                           │
┌──────────────────────────▼─────────────────────────────────┐
│              BACKEND (Spring Boot)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PaymentOrchestrationService                          │  │
│  │  - Detects paymentType: 'DONATION'                   │  │
│  │  - Routes to StripePaymentAdapter                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│           ┌─────────▼─────────┐                           │
│           │ StripePaymentAdapter│                          │
│           │  - Creates Payment Intent                      │
│           │  - Sets metadata: payment_type='DONATION'      │
│           │  - Returns clientSecret                        │
│           └─────────┬─────────┘                           │
│                     │                                      │
│           ┌─────────▼─────────┐                           │
│           │ PaymentTransaction │                           │
│           │  payment_type: DONATION                        │
│           │  amount_total: 50.00                           │
│           │  event_id: 123                                 │
│           └───────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Key Design Decisions

#### Decision 1: Reuse Existing Payment Infrastructure
**Rationale**: The domain-agnostic payment system already supports `DONATION` payment type. We only need to:
- Add donation-specific UI components
- Configure events as fundraisers
- Handle donation-specific business logic (no QR codes, no ticket generation)

**Benefits**:
- Faster implementation (reuse existing code)
- Consistent payment experience
- No risk of corrupting ticket workflow (separate payment types)

#### Decision 2: Use `payment_transaction` Table (Not `event_ticket_transaction`)
**Rationale**: Donations are not tickets. The unified `payment_transaction` table is designed for all payment types.

**Benefits**:
- Clean separation of concerns
- Proper data modeling
- Easier reporting and analytics

#### Decision 3: No Ticket Types for Fundraisers
**Rationale**: Fundraisers collect variable donations, not fixed-price tickets.

**Implementation**:
- `event_ticket_type` table not used for fundraisers
- Donation amounts configured in `event_details` metadata or separate `donation_preset` table
- Frontend displays donation amount selector instead of ticket selector

#### Decision 4: Stripe as Primary Provider
**Rationale**: Stripe is already integrated and supports variable-amount payments perfectly.

**Future Enhancement**: Can add PayPal, Zeffy, or other providers later using the same abstraction.

---

## 5. Database Schema

### 5.1 New Tables

#### `donation_preset` (Optional - Can use metadata instead)

```sql
CREATE TABLE donation_preset (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    event_id BIGINT NOT NULL,

    -- Preset amount
    amount NUMERIC(21,2) NOT NULL,

    -- Display label (e.g., "Supporter", "Patron", "Benefactor")
    label VARCHAR(100),

    -- Display order
    display_order INTEGER DEFAULT 0,

    -- Is active
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,

    -- Foreign key
    CONSTRAINT fk_event FOREIGN KEY (event_id)
        REFERENCES event_details(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT ck_amount_positive CHECK (amount > 0),
    CONSTRAINT uk_event_amount UNIQUE (event_id, amount)
);

CREATE INDEX idx_dp_event ON donation_preset(event_id);
CREATE INDEX idx_dp_tenant ON donation_preset(tenant_id);
```

**Alternative**: Store preset amounts in `event_details.metadata` JSONB field:
```json
{
  "donationPresets": [25.00, 50.00, 100.00, 250.00],
  "minDonationAmount": 10.00,
  "defaultDonationAmount": 50.00,
  "allowCustomAmount": true
}
```

### 5.2 Modified Tables

#### `event_details` (No schema changes needed)

The `admission_type` field already supports `'DONATION_BASED'`. We can add donation configuration to the `metadata` JSONB field:

```json
{
  "donationConfig": {
    "presets": [25.00, 50.00, 100.00, 250.00],
    "minAmount": 10.00,
    "defaultAmount": 50.00,
    "allowCustom": true,
    "requireAddressForTaxReceipt": false
  }
}
```

#### `payment_transaction` (No schema changes needed)

Already supports `payment_type = 'DONATION'`. We'll use:
- `payment_type`: `'DONATION'`
- `amount_total`: Donation amount
- `event_id`: Fundraiser event ID
- `metadata`: Optional donation message, anonymous flag, etc.

### 5.3 Migration Script

```sql
-- No migration needed - using existing schema
-- Optional: Create donation_preset table if using separate table approach

CREATE TABLE IF NOT EXISTS donation_preset (
    -- ... (see schema above)
);
```

---

## 6. Backend Implementation

### 6.1 Payment Initialization Logic

**File:** `PaymentOrchestrationService.java`

```java
@Service
@RequiredArgsConstructor
public class PaymentOrchestrationService {

    private final PaymentProviderFactory providerFactory;
    private final PaymentTransactionRepository transactionRepository;
    private final EventDetailsRepository eventRepository;

    public PaymentSession initializePayment(PaymentInitializeRequest request) {
        // 1. Validate request
        validatePaymentRequest(request);

        // 2. Determine payment provider (from tenant config or event config)
        PaymentProviderConfig providerConfig = getProviderConfig(request);
        PaymentAdapter adapter = providerFactory.getAdapter(providerConfig.getProviderType());

        // 3. For donations, validate amount
        if (PaymentType.DONATION.equals(request.getPaymentType())) {
            validateDonationAmount(request);
        }

        // 4. Initialize payment session via adapter
        PaymentSession session = adapter.initializePayment(request);

        // 5. Create payment transaction record
        PaymentTransaction transaction = createPaymentTransaction(request, session);
        transactionRepository.save(transaction);

        return session;
    }

    private void validateDonationAmount(PaymentInitializeRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PaymentException("Donation amount must be greater than zero");
        }

        // Get event donation config
        if (request.getEventId() != null) {
            EventDetails event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

            Map<String, Object> metadata = event.getMetadata();
            if (metadata != null && metadata.containsKey("donationConfig")) {
                Map<String, Object> donationConfig = (Map<String, Object>) metadata.get("donationConfig");

                // Check minimum amount
                if (donationConfig.containsKey("minAmount")) {
                    BigDecimal minAmount = new BigDecimal(donationConfig.get("minAmount").toString());
                    if (request.getAmount().compareTo(minAmount) < 0) {
                        throw new PaymentException(
                            "Donation amount must be at least $" + minAmount
                        );
                    }
                }
            }
        }
    }

    private PaymentTransaction createPaymentTransaction(
        PaymentInitializeRequest request,
        PaymentSession session
    ) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTenantId(request.getTenantId());
        transaction.setProviderType(session.getProviderType());
        transaction.setProviderTransactionId(session.getProviderTransactionId());
        transaction.setPaymentType(request.getPaymentType());
        transaction.setAmountTotal(request.getAmount());
        transaction.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        transaction.setCustomerEmail(request.getCustomerEmail());
        transaction.setCustomerFirstName(request.getCustomerFirstName());
        transaction.setCustomerLastName(request.getCustomerLastName());
        transaction.setCustomerPhone(request.getCustomerPhone());
        transaction.setEventId(request.getEventId());
        transaction.setStatus(PaymentStatus.INITIATED);

        // Store donation-specific metadata
        if (PaymentType.DONATION.equals(request.getPaymentType())) {
            Map<String, Object> metadata = new HashMap<>();
            if (request.getMetadata() != null) {
                metadata.putAll(request.getMetadata());
            }
            metadata.put("donationMessage", request.getDonationMessage());
            metadata.put("isAnonymous", request.isAnonymous());
            transaction.setMetadata(metadata);
        }

        return transaction;
    }
}
```

### 6.2 Stripe Payment Adapter (No Changes Needed)

The existing `StripePaymentAdapter` already handles variable amounts. We just need to ensure it sets the correct metadata:

```java
// In StripePaymentAdapter.initializePayment()
Map<String, String> metadata = new HashMap<>();
metadata.put("tenant_id", request.getTenantId());
metadata.put("payment_type", request.getPaymentType().name()); // 'DONATION'
metadata.put("customer_email", request.getCustomerEmail());
if (request.getEventId() != null) {
    metadata.put("event_id", request.getEventId().toString());
}
```

### 6.3 Webhook Handler (No Changes Needed)

The existing webhook handler already processes all payment types. For donations:
- Payment succeeds → Update `payment_transaction.status = 'SUCCEEDED'`
- No ticket generation (handled by `PostPaymentProcessingService`)
- Send donation confirmation email (instead of ticket email)

### 6.4 Post-Payment Processing

**File:** `PostPaymentProcessingService.java`

```java
@Service
@RequiredArgsConstructor
public class PostPaymentProcessingService {

    private final EmailService emailService;
    private final TicketGenerationService ticketGenerationService;

    public void handleSuccessfulPayment(PaymentTransaction transaction) {
        if (PaymentType.DONATION.equals(transaction.getPaymentType())) {
            handleDonationSuccess(transaction);
        } else if (PaymentType.TICKET_SALE.equals(transaction.getPaymentType())) {
            // Existing ticket generation logic
            ticketGenerationService.processTicketGenerationSync(transaction);
        }
    }

    private void handleDonationSuccess(PaymentTransaction transaction) {
        // Send donation confirmation email
        emailService.sendDonationConfirmationEmail(transaction);

        // No QR code generation for donations
        // No ticket transaction creation
    }
}
```

### 6.5 REST API Endpoints

**No new endpoints needed!** Use existing `/api/payments/initialize` with `paymentType: 'DONATION'`.

**Request Example:**
```json
POST /api/payments/initialize
{
  "tenantId": "tenant_demo_001",
  "eventId": 123,
  "paymentType": "DONATION",
  "amount": 50.00,
  "currency": "USD",
  "customerEmail": "donor@example.com",
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "customerPhone": "+1234567890",
  "metadata": {
    "donationMessage": "In memory of...",
    "isAnonymous": false
  }
}
```

**Response Example:**
```json
{
  "transactionId": 456,
  "providerType": "STRIPE",
  "clientSecret": "pi_xxx_secret_xxx",
  "publicKey": "pk_live_xxx",
  "metadata": {
    "payment_intent_id": "pi_xxx",
    "supports_wallets": true
  }
}
```

---

## 7. Frontend Implementation

### 7.1 Donation Amount Selector Component

**File:** `src/components/donation/DonationAmountSelector.tsx`

```typescript
"use client";

import React, { useState } from 'react';

type DonationPreset = {
  amount: number;
  label?: string;
};

type Props = {
  presets?: DonationPreset[];
  minAmount?: number;
  defaultAmount?: number;
  allowCustom?: boolean;
  onAmountChange: (amount: number) => void;
  className?: string;
};

export function DonationAmountSelector({
  presets = [
    { amount: 25, label: 'Supporter' },
    { amount: 50, label: 'Friend' },
    { amount: 100, label: 'Patron' },
    { amount: 250, label: 'Benefactor' },
  ],
  minAmount = 10,
  defaultAmount = 50,
  allowCustom = true,
  onAmountChange,
  className = '',
}: Props) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setIsCustom(false);
    setCustomAmount('');
    onAmountChange(amount);
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    setSelectedPreset(null);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= minAmount) {
      onAmountChange(numValue);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preset Amounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.amount}
            type="button"
            onClick={() => handlePresetClick(preset.amount)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${selectedPreset === preset.amount && !isCustom
                ? 'border-teal-600 bg-teal-50 text-teal-900'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="font-semibold text-lg">${preset.amount}</div>
            {preset.label && (
              <div className="text-xs text-gray-600 mt-1">{preset.label}</div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      {allowCustom && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Or enter custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              min={minAmount}
              step="0.01"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder={`Minimum $${minAmount}`}
              className={`
                w-full pl-8 pr-4 py-3 border-2 rounded-lg
                ${isCustom && customAmount
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200'
                }
                focus:outline-none focus:ring-2 focus:ring-teal-500
              `}
            />
          </div>
          {isCustom && customAmount && parseFloat(customAmount) < minAmount && (
            <p className="text-sm text-red-600">
              Minimum donation amount is ${minAmount}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 7.2 Donation Checkout Page

**File:** `src/app/events/[id]/donation/page.tsx`

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DonationAmountSelector } from '@/components/donation/DonationAmountSelector';
import { UniversalPaymentCheckout } from '@/components/payment/UniversalPaymentCheckout';
import type { EventDetailsDTO } from '@/types';

export default function DonationCheckoutPage() {
  const params = useParams();
  const eventId = params?.id ? parseInt(params.id as string) : null;

  const [eventDetails, setEventDetails] = useState<EventDetailsDTO | null>(null);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  async function fetchEventDetails() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setEventDetails(data);

        // Extract donation config from metadata
        const donationConfig = data.metadata?.donationConfig;
        if (donationConfig?.defaultAmount) {
          setDonationAmount(donationConfig.defaultAmount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setLoading(false);
    }
  }

  const donationConfig = eventDetails?.metadata?.donationConfig || {};
  const presets = donationConfig.presets || [25, 50, 100, 250];
  const minAmount = donationConfig.minAmount || 10;
  const defaultAmount = donationConfig.defaultAmount || 50;
  const allowCustom = donationConfig.allowCustom !== false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Event not found</p>
        </div>
      </div>
    );
  }

  const canProceed = donationAmount && donationAmount >= minAmount && email && firstName && lastName;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Support {eventDetails.title}
        </h1>
        <p className="text-gray-600 mb-8">{eventDetails.description}</p>

        {/* Donation Amount Selector */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Donation Amount
          </h2>
          <DonationAmountSelector
            presets={presets.map(amount => ({ amount }))}
            minAmount={minAmount}
            defaultAmount={defaultAmount}
            allowCustom={allowCustom}
            onAmountChange={setDonationAmount}
          />
        </section>

        {/* Donor Information Form */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Optional Donation Message */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donation Message (Optional)
            </label>
            <textarea
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Leave a message with your donation..."
            />
          </div>

          {/* Anonymous Donation Option */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Make this donation anonymous
              </span>
            </label>
          </div>
        </section>

        {/* Payment Section */}
        {canProceed && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Your Donation
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Donation Amount:</span>
                <span className="text-2xl font-bold text-teal-600">
                  ${donationAmount?.toFixed(2)}
                </span>
              </div>
            </div>
            <UniversalPaymentCheckout
              eventId={eventId || undefined}
              email={email}
              firstName={firstName}
              lastName={lastName}
              phone={phone || undefined}
              paymentType="DONATION"
              amount={donationAmount || undefined}
              onSuccess={(transactionId) => {
                window.location.href = `/event/donation/success?transactionId=${transactionId}&eventId=${eventId}`;
              }}
              onError={(error) => {
                console.error('Payment error:', error);
                alert('Payment failed: ' + error);
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
```

### 7.3 Update Event Details Page

**File:** `src/app/events/[id]/page.tsx`

Add a "Donate" button for fundraiser events:

```typescript
{eventDetails.admissionType === 'DONATION_BASED' && (
  <Link
    href={`/events/${eventId}/donation`}
    className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
  >
    Make a Donation
  </Link>
)}
```

### 7.4 Admin UI for Fundraiser Configuration

**File:** `src/app/admin/events/[id]/edit/page.tsx`

Add donation configuration section:

```typescript
{admissionType === 'DONATION_BASED' && (
  <section className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">Donation Configuration</h3>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Preset Donation Amounts (comma-separated)
        </label>
        <input
          type="text"
          value={donationPresets.join(', ')}
          onChange={(e) => setDonationPresets(
            e.target.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
          )}
          placeholder="25, 50, 100, 250"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Minimum Donation Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minDonationAmount}
            onChange={(e) => setMinDonationAmount(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Default Donation Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={defaultDonationAmount}
            onChange={(e) => setDefaultDonationAmount(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={allowCustomDonation}
            onChange={(e) => setAllowCustomDonation(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Allow custom donation amounts</span>
        </label>
      </div>
    </div>
  </section>
)}
```

---

## 8. API Specifications

### 8.1 Payment Initialization

**Endpoint:** `POST /api/payments/initialize`

**Request Body:**
```typescript
{
  tenantId: string;
  eventId?: number;  // Required for fundraiser events
  paymentType: 'DONATION';
  amount: number;    // Donation amount in dollars
  currency?: string; // Default: 'USD'
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  metadata?: {
    donationMessage?: string;
    isAnonymous?: boolean;
  };
}
```

**Response:**
```typescript
{
  transactionId: number;
  providerType: 'STRIPE';
  clientSecret: string;
  publicKey: string;
  metadata: {
    payment_intent_id: string;
    supports_wallets: boolean;
  };
}
```

### 8.2 Get Event Donation Configuration

**Endpoint:** `GET /api/event-details/{eventId}`

**Response:** (existing endpoint, includes `metadata.donationConfig`)

```typescript
{
  id: number;
  title: string;
  admissionType: 'DONATION_BASED';
  metadata: {
    donationConfig: {
      presets: number[];
      minAmount: number;
      defaultAmount: number;
      allowCustom: boolean;
    };
  };
  // ... other fields
}
```

---

## 9. User Workflows

### 9.1 Admin: Create Fundraiser Event

1. Admin navigates to Events → Create New Event
2. Admin fills in event details (title, description, dates, location)
3. Admin sets `admission_type = 'DONATION_BASED'`
4. Admin configures donation presets (e.g., $25, $50, $100, $250)
5. Admin sets minimum donation amount (e.g., $10)
6. Admin sets default donation amount (e.g., $50)
7. Admin saves event
8. Event is published and available for donations

### 9.2 User: Make Donation

1. User browses events and finds fundraiser event
2. User clicks "Make a Donation" button
3. User is redirected to donation checkout page (`/events/{id}/donation`)
4. User selects preset amount OR enters custom amount
5. User fills in donor information (name, email, phone)
6. User optionally adds donation message
7. User optionally checks "Make anonymous" checkbox
8. User clicks "Complete Donation"
9. Stripe payment UI loads (same as ticket checkout)
10. User completes payment via Stripe (card, Apple Pay, Google Pay, etc.)
11. Payment succeeds → User redirected to success page
12. User receives donation confirmation email

### 9.3 Admin: View Donations

1. Admin navigates to Events → Select Fundraiser Event
2. Admin clicks "View Donations" tab
3. Admin sees list of all donations for the event:
   - Donor name (or "Anonymous")
   - Donation amount
   - Date/time
   - Payment status
4. Admin can export donations for tax reporting
5. Admin can view total donations raised

---

## 10. Migration & Compatibility

### 10.1 Backward Compatibility

**✅ No Breaking Changes:**
- Existing ticket purchase flow remains unchanged
- Existing `payment_transaction` table supports donations
- Existing Stripe integration works for donations
- Existing webhook handlers process donations

**✅ Safe Implementation:**
- Fundraiser events use separate payment type (`DONATION` vs `TICKET_SALE`)
- No interference with ticket workflows
- Can coexist with ticket events

### 10.2 Data Migration

**No migration needed** - using existing schema.

**Optional Enhancement:**
- Migrate existing `DONATION_BASED` events to have donation configuration in metadata
- Add donation presets to existing fundraiser events

### 10.3 Rollout Strategy

**Phase 1: Backend (Week 1)**
- Verify `PaymentOrchestrationService` handles `DONATION` type
- Test Stripe payment intent creation for donations
- Test webhook processing for donations

**Phase 2: Frontend Components (Week 2)**
- Build `DonationAmountSelector` component
- Build donation checkout page
- Update event details page to show "Donate" button

**Phase 3: Admin UI (Week 3)**
- Add donation configuration to event edit form
- Add donation reporting/analytics

**Phase 4: Testing & Launch (Week 4)**
- End-to-end testing
- User acceptance testing
- Launch to production

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Backend:**
- `PaymentOrchestrationService.validateDonationAmount()`
- `PostPaymentProcessingService.handleDonationSuccess()`
- Stripe metadata setting for donations

**Frontend:**
- `DonationAmountSelector` component
- Donation amount validation
- Form validation

### 11.2 Integration Tests

- Complete donation flow: Amount selection → Payment → Confirmation
- Stripe webhook processing for donations
- Email sending for donation confirmations
- Admin donation configuration

### 11.3 End-to-End Tests

**Scenario 1: Successful Donation**
1. User selects $50 preset amount
2. User fills donor information
3. User completes Stripe payment
4. Payment succeeds
5. User receives confirmation email
6. Admin sees donation in dashboard

**Scenario 2: Custom Donation Amount**
1. User enters custom amount ($75)
2. User completes payment
3. Transaction recorded with correct amount

**Scenario 3: Anonymous Donation**
1. User checks "Make anonymous"
2. User completes payment
3. Admin sees "Anonymous" in donor list

### 11.4 Edge Cases

- Minimum amount validation
- Maximum amount (if configured)
- Invalid email format
- Stripe payment failure
- Webhook retry scenarios

---

## 12. Success Metrics

### 12.1 Technical Metrics

- **Payment Success Rate**: >99% for donation payments
- **Checkout Completion Time**: <5 seconds from amount selection to payment confirmation
- **Error Rate**: <1% for donation checkout flow

### 12.2 Business Metrics

- **Donation Conversion Rate**: % of visitors who complete donation
- **Average Donation Amount**: Track per event and overall
- **Donation Volume**: Total donations per event and per tenant

### 12.3 User Experience Metrics

- **User Satisfaction**: Survey donors about checkout experience
- **Mobile Usage**: % of donations completed on mobile devices
- **Abandonment Rate**: % of users who start but don't complete donation

---

## 13. Timeline & Phases

### Phase 1: Backend Foundation (Week 1)
- ✅ Verify payment orchestration supports donations
- ✅ Test Stripe payment intent creation
- ✅ Test webhook processing
- ✅ Add donation validation logic

### Phase 2: Frontend Components (Week 2)
- ✅ Build `DonationAmountSelector` component
- ✅ Build donation checkout page
- ✅ Update event details page
- ✅ Integrate with `UniversalPaymentCheckout`

### Phase 3: Admin Features (Week 3)
- ✅ Add donation configuration to event edit form
- ✅ Add donation reporting/analytics
- ✅ Add donation export functionality

### Phase 4: Testing & Launch (Week 4)
- ✅ Unit tests
- ✅ Integration tests
- ✅ End-to-end tests
- ✅ User acceptance testing
- ✅ Production launch

**Total Timeline:** 4 weeks

---

## Appendix

### A. Example Donation Configuration

```json
{
  "donationConfig": {
    "presets": [25.00, 50.00, 100.00, 250.00],
    "minAmount": 10.00,
    "defaultAmount": 50.00,
    "allowCustom": true,
    "requireAddressForTaxReceipt": false,
    "presetLabels": {
      "25": "Supporter",
      "50": "Friend",
      "100": "Patron",
      "250": "Benefactor"
    }
  }
}
```

### B. Example Payment Transaction Record

```sql
INSERT INTO payment_transaction (
    tenant_id,
    provider_type,
    provider_transaction_id,
    payment_type,
    amount_total,
    currency,
    customer_email,
    customer_first_name,
    customer_last_name,
    event_id,
    status,
    metadata
) VALUES (
    'tenant_demo_001',
    'STRIPE',
    'pi_xxx',
    'DONATION',
    50.00,
    'USD',
    'donor@example.com',
    'John',
    'Doe',
    123,
    'SUCCEEDED',
    '{"donationMessage": "In memory of...", "isAnonymous": false}'::jsonb
);
```

### C. References

- [Domain-Agnostic Payment PRD](./domain_agnostic_payment/PRD.md)
- [Database Schema Documentation](./domain_agnostic_payment/DATABASE_SCHEMA.md)
- [Backend Refactoring Guide](./domain_agnostic_payment/BACKEND_REFACTORING.md)
- [Frontend Refactoring Guide](./domain_agnostic_payment/FRONTEND_REFACTORING.md)

---

## Conclusion

This PRD outlines a complete implementation plan for fundraiser events with Stripe payment, leveraging the existing domain-agnostic payment infrastructure. The solution:

1. ✅ **Reuses existing payment flow** without corrupting ticket workflows
2. ✅ **Uses Stripe** as the payment provider (already integrated)
3. ✅ **Supports variable donation amounts** with preset options
4. ✅ **Maintains compatibility** with existing ticket events
5. ✅ **Provides seamless user experience** consistent with ticket checkout

**Next Steps:**
1. Review and approve this PRD
2. Break down into development tasks
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

