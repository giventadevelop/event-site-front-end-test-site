# Membership Subscription Feature - Product Requirements Document

## Document Information

- **Version**: 1.0
- **Date**: 2025-01-27
- **Status**: Draft
- **Author**: Development Team
- **Related Projects**:
  - Frontend: `E:\project_workspace\mosc-temp`
  - Backend: `E:\project_workspace\malayalees-us-site-boot`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals and Objectives](#goals-and-objectives)
4. [Current System Analysis](#current-system-analysis)
5. [Requirements](#requirements)
6. [Technical Architecture](#technical-architecture)
7. [User Stories](#user-stories)
8. [API Specifications](#api-specifications)
9. [Database Schema](#database-schema)
10. [UI/UX Design](#uiux-design)
11. [Implementation Plan](#implementation-plan)
12. [Testing Strategy](#testing-strategy)
13. [Security Considerations](#security-considerations)
14. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

This document outlines the requirements for implementing a **Membership Subscription** feature that allows users to subscribe to tiered membership plans with recurring monthly fees. The feature will leverage the existing Stripe payment infrastructure and support both desktop and mobile browsers.

### Key Features

- **Tiered Membership Plans**: Multiple membership tiers (e.g., Basic, Premium, Enterprise) with different pricing and features
- **Recurring Billing**: Monthly subscription fees automatically charged via Stripe
- **Cross-Platform Support**: Works seamlessly on desktop and mobile browsers
- **Tenant-Specific**: Each tenant can configure their own membership plans
- **Trial Periods**: Support for free trial periods before billing begins
- **Subscription Management**: Users can view, upgrade, downgrade, and cancel subscriptions

---

## 2. Problem Statement

### Current State

- Users can register and create profiles in the system
- Payment infrastructure exists for one-time payments (event tickets, donations)
- Database schema includes `membership_plan` and `membership_subscription` tables
- Stripe integration exists but is primarily used for one-time payments
- No user-facing membership subscription flow exists

### Problem

Organizations need a way to:
1. Offer tiered membership plans to their community members
2. Collect recurring monthly subscription fees
3. Manage member subscriptions (active, cancelled, expired)
4. Provide different features/benefits based on membership tier
5. Allow members to self-manage their subscriptions

### Solution

Implement a comprehensive membership subscription system that:
- Integrates with existing Stripe payment infrastructure
- Provides a user-friendly subscription management interface
- Supports multiple membership tiers with configurable pricing
- Handles recurring billing automatically
- Works on both desktop and mobile devices

---

## 3. Goals and Objectives

### Primary Goals

1. **Enable Membership Subscriptions**
   - Allow organizations to create and manage membership plans
   - Enable users to subscribe to membership plans
   - Process recurring monthly payments automatically

2. **Seamless Payment Experience**
   - Leverage existing Stripe payment infrastructure
   - Support Apple Pay, Google Pay, and credit card payments
   - Provide consistent experience across desktop and mobile

3. **Subscription Management**
   - Allow users to view their current subscription status
   - Enable subscription upgrades/downgrades
   - Support subscription cancellation with end-of-period billing

4. **Multi-Tenant Support**
   - Each tenant can configure their own membership plans
   - Tenant-specific pricing and features
   - Isolated subscription data per tenant

### Secondary Goals

1. **Trial Periods**: Support free trial periods for new members
2. **Feature Gating**: Restrict features based on membership tier
3. **Analytics**: Track subscription metrics and revenue
4. **Notifications**: Email notifications for subscription events

---

## 4. Current System Analysis

### Existing Infrastructure

#### Database Schema

**`membership_plan` Table**
```sql
CREATE TABLE public.membership_plan (
    id bigint PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    plan_code VARCHAR(100) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) DEFAULT 'SUBSCRIPTION' NOT NULL,
    billing_interval VARCHAR(20) DEFAULT 'MONTHLY' NOT NULL,
    price NUMERIC(21,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    trial_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    max_events_per_month INTEGER,
    max_attendees_per_event INTEGER,
    features_json JSONB,
    stripe_price_id VARCHAR(255),
    stripe_product_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT unique_tenant_plan_code UNIQUE (tenant_id, plan_code)
);
```

**`membership_subscription` Table**
```sql
CREATE TABLE public.membership_subscription (
    id bigint PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    user_profile_id BIGINT NOT NULL,
    membership_plan_id BIGINT NOT NULL,
    subscription_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    trial_start DATE,
    trial_end DATE,
    cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    payment_provider_config_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_profile_id) REFERENCES user_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_plan_id) REFERENCES membership_plan(id) ON DELETE RESTRICT
);
```

#### Payment Infrastructure

**Existing Components:**
- `UniversalPaymentCheckout` - Provider-agnostic payment wrapper
- `StripeDesktopCheckout` - Stripe Elements integration for desktop
- `StripePaymentRequestButton` - Apple Pay/Google Pay integration
- `/api/billing/manage-subscription` - Existing subscription management endpoint
- `/api/webhooks/stripe` - Stripe webhook handler

**Current Payment Flow:**
1. User selects items (tickets, donations)
2. Frontend calls `/api/stripe/payment-intent` or `/api/stripe/event-checkout`
3. Stripe Checkout Session created
4. User completes payment
5. Webhook handler processes payment success
6. Backend creates/updates records

#### API Endpoints

**Existing Subscription Endpoints:**
- `GET /api/user-subscriptions` - List user subscriptions
- `GET /api/user-subscriptions/{id}` - Get subscription details
- `POST /api/user-subscriptions` - Create subscription
- `PATCH /api/user-subscriptions/{id}` - Update subscription

**Note**: These endpoints exist but may need enhancement for membership-specific use cases.

### Gaps and Requirements

1. **Missing Membership Plan Management**
   - No API endpoints for CRUD operations on `membership_plan`
   - No admin interface for managing plans

2. **Missing Membership Subscription Flow**
   - No user-facing subscription signup page
   - No subscription management page for users
   - No integration between membership plans and subscriptions

3. **Stripe Integration Gaps**
   - Current implementation focuses on one-time payments
   - Need to create Stripe Products and Prices for membership plans
   - Need to handle subscription-specific webhook events

4. **Frontend Components Missing**
   - Membership plan selection page
   - Subscription status page
   - Subscription management interface

---

## 5. Requirements

### Functional Requirements

#### FR1: Membership Plan Management

**FR1.1**: Admin users must be able to create membership plans
- Plan name, code, description
- Pricing (monthly fee)
- Billing interval (MONTHLY, QUARTERLY, YEARLY)
- Trial period (days)
- Features/benefits (JSON)
- Stripe Price ID

**FR1.2**: Admin users must be able to update membership plans
- Update pricing, features, trial period
- Activate/deactivate plans
- Update Stripe Price ID

**FR1.3**: Admin users must be able to view all membership plans
- List all plans for tenant
- Filter by active/inactive status
- View plan details

**FR1.4**: Admin users must be able to delete membership plans
- Soft delete (set is_active = false)
- Prevent deletion if active subscriptions exist

#### FR2: User Subscription Signup

**FR2.1**: Users must be able to view available membership plans
- Display all active plans for tenant
- Show pricing, features, trial information
- Compare plans side-by-side

**FR2.2**: Users must be able to subscribe to a membership plan
- Select a plan
- Enter payment information
- Complete subscription via Stripe Checkout
- Support Apple Pay, Google Pay, credit cards

**FR2.3**: Users must be able to start a trial period
- If plan has trial_days > 0, start trial
- No payment required during trial
- Automatically convert to paid subscription after trial

**FR2.4**: Users must receive confirmation after subscription
- Email confirmation
- On-screen success message
- Redirect to subscription management page

#### FR3: Subscription Management

**FR3.1**: Users must be able to view their current subscription
- Current plan details
- Subscription status (ACTIVE, TRIAL, CANCELLED, etc.)
- Next billing date
- Billing amount

**FR3.2**: Users must be able to upgrade their subscription
- Select a higher-tier plan
- Prorate billing if applicable
- Update subscription immediately

**FR3.3**: Users must be able to downgrade their subscription
- Select a lower-tier plan
- Schedule downgrade at end of current period
- Continue access until period ends

**FR3.4**: Users must be able to cancel their subscription
- Cancel immediately or at end of period
- Provide cancellation reason (optional)
- Continue access until period ends (if cancel_at_period_end)

**FR3.5**: Users must be able to update payment method
- Access Stripe Customer Portal
- Update credit card
- Update billing address

#### FR4: Recurring Billing

**FR4.1**: System must automatically charge users monthly
- Stripe handles recurring billing
- Webhook handler processes payment success/failure
- Update subscription status accordingly

**FR4.2**: System must handle payment failures
- Retry failed payments (Stripe handles this)
- Notify user of payment failure
- Suspend subscription after multiple failures

**FR4.3**: System must handle subscription renewals
- Automatically renew at period end
- Update current_period_start and current_period_end
- Send renewal confirmation email

#### FR5: Multi-Tenant Support

**FR5.1**: Each tenant must have isolated membership plans
- Plans scoped by tenant_id
- Users can only see plans for their tenant
- Subscription data isolated by tenant

**FR5.2**: Tenant admins must manage their own plans
- Create/edit/delete plans for their tenant only
- Cannot access other tenants' plans

### Non-Functional Requirements

#### NFR1: Performance

- **NFR1.1**: Subscription signup must complete in < 5 seconds
- **NFR1.2**: Subscription management page must load in < 2 seconds
- **NFR1.3**: Webhook processing must complete in < 10 seconds

#### NFR2: Security

- **NFR2.1**: All payment data must be handled by Stripe (PCI compliance)
- **NFR2.2**: Subscription data must be encrypted at rest
- **NFR2.3**: API endpoints must require authentication
- **NFR2.4**: Tenant isolation must be enforced at database level

#### NFR3: Reliability

- **NFR3.1**: System must handle Stripe webhook failures gracefully
- **NFR3.2**: Subscription status must be eventually consistent
- **NFR3.3**: Payment failures must not cause data corruption

#### NFR4: Usability

- **NFR4.1**: Subscription flow must work on mobile browsers
- **NFR4.2**: UI must follow existing design system (MOSC styling)
- **NFR4.3**: Error messages must be clear and actionable

#### NFR5: Scalability

- **NFR5.1**: System must support 10,000+ subscriptions per tenant
- **NFR5.2**: Webhook processing must handle concurrent events
- **NFR5.3**: Database queries must be optimized for large datasets

---

## 6. Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Membership   │  │ Subscription│  │ Subscription│      │
│  │ Plans Page   │  │ Signup Page  │  │ Management  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │ UniversalPayment │                        │
│                  │    Checkout      │                        │
│                  └────────┬─────────┘                        │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼──────────────────────────────────┐
│              Next.js API Routes (Proxy)                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ /api/proxy/      │  │ /api/billing/    │                 │
│  │ membership-plans │  │ manage-          │                 │
│  │                  │  │ subscription     │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           │                     │                            │
│  ┌────────▼─────────────────────▼─────────┐                 │
│  │      /api/webhooks/stripe              │                 │
│  └────────┬──────────────────────────────┘                 │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ JWT Auth
            │
┌───────────▼──────────────────────────────────────────────────┐
│              Backend API (Spring Boot)                        │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Membership Plan │  │ Membership       │                 │
│  │ Controller      │  │ Subscription    │                 │
│  │                 │  │ Controller      │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           └──────────┬──────────┘                            │
│                      │                                        │
│              ┌───────▼────────┐                              │
│              │   PostgreSQL   │                              │
│              │   Database     │                              │
│              └────────────────┘                              │
└──────────────────────────────────────────────────────────────┘
            │
            │ API Calls
            │
┌───────────▼──────────────────────────────────────────────────┐
│                    Stripe API                                │
├──────────────────────────────────────────────────────────────┤
│  • Products & Prices                                         │
│  • Subscriptions                                             │
│  • Customers                                                 │
│  • Webhooks                                                  │
└──────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Components

**1. Membership Plans Page** (`/membership/plans`)
- Server component that fetches available plans
- Displays plan cards with pricing and features
- Client component for plan selection

**2. Subscription Signup Page** (`/membership/subscribe/[planId]`)
- Server component that fetches plan details
- Client component with payment form
- Uses `UniversalPaymentCheckout` for payment processing

**3. Subscription Management Page** (`/membership/manage`)
- Server component that fetches user's subscription
- Client component for subscription actions
- Displays current plan, billing info, next charge date

**4. Subscription Status Component**
- Reusable component to display subscription status
- Shows in user profile/dashboard
- Links to management page

#### Backend Components

**1. Membership Plan Controller**
- `GET /api/membership-plans` - List plans for tenant
- `GET /api/membership-plans/{id}` - Get plan details
- `POST /api/membership-plans` - Create plan (admin only)
- `PATCH /api/membership-plans/{id}` - Update plan (admin only)
- `DELETE /api/membership-plans/{id}` - Delete plan (admin only)

**2. Membership Subscription Controller**
- `GET /api/membership-subscriptions` - List user's subscriptions
- `GET /api/membership-subscriptions/{id}` - Get subscription details
- `POST /api/membership-subscriptions` - Create subscription
- `PATCH /api/membership-subscriptions/{id}` - Update subscription
- `DELETE /api/membership-subscriptions/{id}` - Cancel subscription

**3. Stripe Integration Service**
- Create Stripe Product and Price for membership plan
- Create Stripe Subscription
- Handle subscription webhooks
- Update subscription status

### Data Flow

#### Subscription Signup Flow

```
1. User visits /membership/plans
2. Frontend fetches plans: GET /api/proxy/membership-plans?tenantId.equals=xxx&isActive.equals=true
3. User selects a plan
4. User clicks "Subscribe"
5. Frontend redirects to /membership/subscribe/[planId]
6. Frontend fetches plan details: GET /api/proxy/membership-plans/[planId]
7. User enters payment info (via UniversalPaymentCheckout)
8. Frontend calls: POST /api/billing/manage-subscription
   Body: {
     stripePriceId: plan.stripePriceId,
     mode: 'subscription',
     membershipPlanId: plan.id
   }
9. Backend creates Stripe Checkout Session (mode: 'subscription')
10. User redirected to Stripe Checkout
11. User completes payment
12. Stripe webhook: checkout.session.completed
13. Webhook handler creates membership_subscription record
14. User redirected to /membership/manage?success=true
```

#### Recurring Billing Flow

```
1. Stripe charges customer automatically (monthly)
2. Stripe webhook: invoice.payment_succeeded
3. Webhook handler:
   - Updates membership_subscription.current_period_end
   - Updates membership_subscription.current_period_start
   - Sets subscription_status = 'ACTIVE'
   - Sends confirmation email
4. If payment fails:
   - Stripe webhook: invoice.payment_failed
   - Webhook handler:
     - Sets subscription_status = 'PAST_DUE'
     - Sends payment failure email
     - After 3 failures, sets status = 'CANCELLED'
```

#### Subscription Cancellation Flow

```
1. User visits /membership/manage
2. User clicks "Cancel Subscription"
3. Frontend calls: PATCH /api/proxy/membership-subscriptions/[id]
   Body: {
     cancelAtPeriodEnd: true,
     cancellationReason: "User requested"
   }
4. Backend updates membership_subscription:
   - Sets cancel_at_period_end = true
   - Sets cancellation_reason
   - Calls Stripe API: subscription.cancel({cancel_at_period_end: true})
5. User continues to have access until period_end
6. At period_end:
   - Stripe webhook: customer.subscription.deleted
   - Webhook handler:
     - Sets subscription_status = 'CANCELLED'
     - Sets cancelled_at = now()
     - Sends cancellation confirmation email
```

---

## 7. User Stories

### User Stories

#### US1: As a user, I want to view available membership plans so I can choose the right plan for me

**Acceptance Criteria:**
- User can see all active membership plans for their tenant
- Each plan displays: name, price, billing interval, features, trial period
- Plans are displayed in a clear, easy-to-compare format
- Mobile-responsive layout

#### US2: As a user, I want to subscribe to a membership plan so I can access member benefits

**Acceptance Criteria:**
- User can select a membership plan
- User can enter payment information securely
- User can complete subscription via Stripe Checkout
- User receives confirmation email
- User is redirected to subscription management page

#### US3: As a user, I want to start a free trial so I can try the membership before paying

**Acceptance Criteria:**
- If plan has trial_days > 0, user can start trial without payment
- Trial period is clearly indicated
- User receives email when trial starts
- User receives email before trial ends
- Subscription automatically converts to paid after trial

#### US4: As a user, I want to view my current subscription so I know my plan and billing details

**Acceptance Criteria:**
- User can see current plan name and tier
- User can see subscription status (ACTIVE, TRIAL, etc.)
- User can see next billing date
- User can see billing amount
- User can see payment method (last 4 digits)

#### US5: As a user, I want to upgrade my subscription so I can access more features

**Acceptance Criteria:**
- User can see available upgrade options
- User can select a higher-tier plan
- System prorates billing if applicable
- Subscription upgrades immediately
- User receives confirmation email

#### US6: As a user, I want to downgrade my subscription so I can reduce costs

**Acceptance Criteria:**
- User can see available downgrade options
- User can select a lower-tier plan
- Downgrade scheduled for end of current period
- User continues to have access until period ends
- User receives confirmation email

#### US7: As a user, I want to cancel my subscription so I can stop recurring charges

**Acceptance Criteria:**
- User can cancel subscription immediately or at period end
- User can provide cancellation reason (optional)
- If cancel_at_period_end, user continues access until period ends
- User receives confirmation email
- User can reactivate subscription before period ends

#### US8: As a user, I want to update my payment method so I can use a different card

**Acceptance Criteria:**
- User can access Stripe Customer Portal
- User can update credit card information
- User can update billing address
- Changes take effect immediately
- User receives confirmation email

#### US9: As an admin, I want to create membership plans so I can offer different membership tiers

**Acceptance Criteria:**
- Admin can create new membership plan
- Admin can set plan name, code, description
- Admin can set pricing and billing interval
- Admin can set trial period
- Admin can configure features/benefits
- Admin can link Stripe Price ID

#### US10: As an admin, I want to manage membership plans so I can update pricing and features

**Acceptance Criteria:**
- Admin can view all membership plans
- Admin can edit plan details
- Admin can activate/deactivate plans
- Admin can delete plans (if no active subscriptions)
- Changes are reflected immediately

---

## 8. API Specifications

### Membership Plan Endpoints

#### GET /api/membership-plans

**Description**: List all membership plans for the tenant

**Query Parameters:**
- `tenantId.equals` (required) - Tenant ID
- `isActive.equals` (optional) - Filter by active status
- `sort` (optional) - Sort order (e.g., `price,asc`)

**Response:**
```json
[
  {
    "id": 1,
    "tenantId": "tenant_demo_001",
    "planName": "Basic Membership",
    "planCode": "BASIC",
    "description": "Basic membership with standard features",
    "planType": "SUBSCRIPTION",
    "billingInterval": "MONTHLY",
    "price": 9.99,
    "currency": "USD",
    "trialDays": 7,
    "isActive": true,
    "maxEventsPerMonth": 5,
    "maxAttendeesPerEvent": 100,
    "featuresJson": {
      "features": ["Feature 1", "Feature 2"],
      "benefits": ["Benefit 1", "Benefit 2"]
    },
    "stripePriceId": "price_1234567890",
    "stripeProductId": "prod_1234567890",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

#### GET /api/membership-plans/{id}

**Description**: Get membership plan details

**Path Parameters:**
- `id` (required) - Plan ID

**Response:**
```json
{
  "id": 1,
  "tenantId": "tenant_demo_001",
  "planName": "Basic Membership",
  "planCode": "BASIC",
  "description": "Basic membership with standard features",
  "planType": "SUBSCRIPTION",
  "billingInterval": "MONTHLY",
  "price": 9.99,
  "currency": "USD",
  "trialDays": 7,
  "isActive": true,
  "maxEventsPerMonth": 5,
  "maxAttendeesPerEvent": 100,
  "featuresJson": {
    "features": ["Feature 1", "Feature 2"],
    "benefits": ["Benefit 1", "Benefit 2"]
  },
  "stripePriceId": "price_1234567890",
  "stripeProductId": "prod_1234567890",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### POST /api/membership-plans

**Description**: Create a new membership plan (admin only)

**Request Body:**
```json
{
  "tenantId": "tenant_demo_001",
  "planName": "Premium Membership",
  "planCode": "PREMIUM",
  "description": "Premium membership with advanced features",
  "planType": "SUBSCRIPTION",
  "billingInterval": "MONTHLY",
  "price": 19.99,
  "currency": "USD",
  "trialDays": 14,
  "isActive": true,
  "maxEventsPerMonth": 20,
  "maxAttendeesPerEvent": 500,
  "featuresJson": {
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "stripePriceId": "price_0987654321",
  "stripeProductId": "prod_0987654321"
}
```

**Response:**
```json
{
  "id": 2,
  "tenantId": "tenant_demo_001",
  "planName": "Premium Membership",
  "planCode": "PREMIUM",
  "description": "Premium membership with advanced features",
  "planType": "SUBSCRIPTION",
  "billingInterval": "MONTHLY",
  "price": 19.99,
  "currency": "USD",
  "trialDays": 14,
  "isActive": true,
  "maxEventsPerMonth": 20,
  "maxAttendeesPerEvent": 500,
  "featuresJson": {
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "stripePriceId": "price_0987654321",
  "stripeProductId": "prod_0987654321",
  "createdAt": "2025-01-27T00:00:00Z",
  "updatedAt": "2025-01-27T00:00:00Z"
}
```

#### PATCH /api/membership-plans/{id}

**Description**: Update a membership plan (admin only)

**Path Parameters:**
- `id` (required) - Plan ID

**Request Body:**
```json
{
  "price": 24.99,
  "trialDays": 30,
  "isActive": true
}
```

**Response:**
```json
{
  "id": 2,
  "tenantId": "tenant_demo_001",
  "planName": "Premium Membership",
  "planCode": "PREMIUM",
  "description": "Premium membership with advanced features",
  "planType": "SUBSCRIPTION",
  "billingInterval": "MONTHLY",
  "price": 24.99,
  "currency": "USD",
  "trialDays": 30,
  "isActive": true,
  "maxEventsPerMonth": 20,
  "maxAttendeesPerEvent": 500,
  "featuresJson": {
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "stripePriceId": "price_0987654321",
  "stripeProductId": "prod_0987654321",
  "createdAt": "2025-01-27T00:00:00Z",
  "updatedAt": "2025-01-27T12:00:00Z"
}
```

#### DELETE /api/membership-plans/{id}

**Description**: Delete a membership plan (admin only, soft delete)

**Path Parameters:**
- `id` (required) - Plan ID

**Response:**
```json
{
  "message": "Membership plan deleted successfully"
}
```

### Membership Subscription Endpoints

#### GET /api/membership-subscriptions

**Description**: List user's membership subscriptions

**Query Parameters:**
- `tenantId.equals` (required) - Tenant ID
- `userProfileId.equals` (required) - User profile ID
- `subscriptionStatus.equals` (optional) - Filter by status

**Response:**
```json
[
  {
    "id": 1,
    "tenantId": "tenant_demo_001",
    "userProfileId": 123,
    "membershipPlanId": 1,
    "subscriptionStatus": "ACTIVE",
    "currentPeriodStart": "2025-01-01",
    "currentPeriodEnd": "2025-02-01",
    "trialStart": null,
    "trialEnd": null,
    "cancelAtPeriodEnd": false,
    "cancelledAt": null,
    "cancellationReason": null,
    "stripeSubscriptionId": "sub_1234567890",
    "stripeCustomerId": "cus_1234567890",
    "paymentProviderConfigId": 1,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "membershipPlan": {
      "id": 1,
      "planName": "Basic Membership",
      "planCode": "BASIC",
      "price": 9.99
    }
  }
]
```

#### GET /api/membership-subscriptions/{id}

**Description**: Get membership subscription details

**Path Parameters:**
- `id` (required) - Subscription ID

**Response:**
```json
{
  "id": 1,
  "tenantId": "tenant_demo_001",
  "userProfileId": 123,
  "membershipPlanId": 1,
  "subscriptionStatus": "ACTIVE",
  "currentPeriodStart": "2025-01-01",
  "currentPeriodEnd": "2025-02-01",
  "trialStart": null,
  "trialEnd": null,
  "cancelAtPeriodEnd": false,
  "cancelledAt": null,
  "cancellationReason": null,
  "stripeSubscriptionId": "sub_1234567890",
  "stripeCustomerId": "cus_1234567890",
  "paymentProviderConfigId": 1,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "membershipPlan": {
    "id": 1,
    "planName": "Basic Membership",
    "planCode": "BASIC",
    "price": 9.99,
    "billingInterval": "MONTHLY"
  },
  "userProfile": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

#### POST /api/membership-subscriptions

**Description**: Create a new membership subscription

**Request Body:**
```json
{
  "tenantId": "tenant_demo_001",
  "userProfileId": 123,
  "membershipPlanId": 1,
  "stripeSubscriptionId": "sub_1234567890",
  "stripeCustomerId": "cus_1234567890",
  "subscriptionStatus": "ACTIVE",
  "currentPeriodStart": "2025-01-01",
  "currentPeriodEnd": "2025-02-01",
  "trialStart": "2025-01-01",
  "trialEnd": "2025-01-08"
}
```

**Response:**
```json
{
  "id": 1,
  "tenantId": "tenant_demo_001",
  "userProfileId": 123,
  "membershipPlanId": 1,
  "subscriptionStatus": "ACTIVE",
  "currentPeriodStart": "2025-01-01",
  "currentPeriodEnd": "2025-02-01",
  "trialStart": "2025-01-01",
  "trialEnd": "2025-01-08",
  "cancelAtPeriodEnd": false,
  "cancelledAt": null,
  "cancellationReason": null,
  "stripeSubscriptionId": "sub_1234567890",
  "stripeCustomerId": "cus_1234567890",
  "paymentProviderConfigId": 1,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### PATCH /api/membership-subscriptions/{id}

**Description**: Update a membership subscription

**Path Parameters:**
- `id` (required) - Subscription ID

**Request Body:**
```json
{
  "subscriptionStatus": "CANCELLED",
  "cancelAtPeriodEnd": true,
  "cancellationReason": "User requested cancellation"
}
```

**Response:**
```json
{
  "id": 1,
  "tenantId": "tenant_demo_001",
  "userProfileId": 123,
  "membershipPlanId": 1,
  "subscriptionStatus": "CANCELLED",
  "currentPeriodStart": "2025-01-01",
  "currentPeriodEnd": "2025-02-01",
  "trialStart": null,
  "trialEnd": null,
  "cancelAtPeriodEnd": true,
  "cancelledAt": "2025-01-15T10:00:00Z",
  "cancellationReason": "User requested cancellation",
  "stripeSubscriptionId": "sub_1234567890",
  "stripeCustomerId": "cus_1234567890",
  "paymentProviderConfigId": 1,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Enhanced Billing Endpoint

#### POST /api/billing/manage-subscription

**Description**: Create or manage Stripe subscription checkout session

**Request Body:**
```json
{
  "stripePriceId": "price_1234567890",
  "mode": "subscription",
  "membershipPlanId": 1,
  "isSubscribed": false,
  "stripeCustomerId": null,
  "stripeSubscriptionId": null
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

## 9. Database Schema

### Existing Tables

The database schema already includes the necessary tables. See [Current System Analysis](#current-system-analysis) for table structures.

### Required Indexes

Ensure the following indexes exist for optimal performance:

```sql
-- Membership Plan Indexes
CREATE INDEX IF NOT EXISTS idx_membership_plan_tenant_id ON membership_plan(tenant_id);
CREATE INDEX IF NOT EXISTS idx_membership_plan_code ON membership_plan(plan_code);
CREATE INDEX IF NOT EXISTS idx_membership_plan_active ON membership_plan(is_active) WHERE is_active = true;

-- Membership Subscription Indexes
CREATE INDEX IF NOT EXISTS idx_membership_subscription_tenant_id ON membership_subscription(tenant_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_user_profile_id ON membership_subscription(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_membership_plan_id ON membership_subscription(membership_plan_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_status ON membership_subscription(subscription_status);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_stripe_subscription_id ON membership_subscription(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_current_period_end ON membership_subscription(current_period_end);
```

### Data Relationships

```
user_profile (1) ──< (many) membership_subscription
membership_plan (1) ──< (many) membership_subscription
payment_provider_config (1) ──< (many) membership_subscription
```

---

## 10. UI/UX Design

### Design System

Follow the **MOSC Styling Standards** as defined in `.cursor/rules/mosc_styling_standards.mdc`:

- **Color Palette**: Warm earth tones (#F5F1E8 background, #8B7D6B primary)
- **Typography**: Crimson Text for headings, Source Sans Pro for body
- **Spacing**: Sacred spacing (2rem) for consistent vertical spacing
- **Components**: Use established card, button, and form patterns

### Page Layouts

#### Membership Plans Page (`/membership/plans`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│              Header/Navigation                  │
├─────────────────────────────────────────────────┤
│                                                 │
│         Membership Plans                        │
│    Choose the plan that's right for you        │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Basic   │  │ Premium  │  │Enterprise│    │
│  │  $9.99/mo│  │ $19.99/mo│  │ $49.99/mo│    │
│  │          │  │          │  │          │    │
│  │ Features │  │ Features │  │ Features │    │
│  │ • Feat 1 │  │ • Feat 1 │  │ • Feat 1 │    │
│  │ • Feat 2 │  │ • Feat 2 │  │ • Feat 2 │    │
│  │          │  │ • Feat 3 │  │ • Feat 3 │    │
│  │          │  │          │  │ • Feat 4 │    │
│  │          │  │          │  │ • Feat 5 │    │
│  │          │  │          │  │          │    │
│  │ [Select] │  │ [Select] │  │ [Select] │    │
│  └──────────┘  └──────────┘  └──────────┘    │
│                                                 │
│              Footer                            │
└─────────────────────────────────────────────────┘
```

**Components:**
- Plan cards with pricing, features, and CTA button
- Responsive grid layout (1 column mobile, 3 columns desktop)
- Highlight current plan if user is subscribed
- Show trial information prominently

#### Subscription Signup Page (`/membership/subscribe/[planId]`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│              Header/Navigation                  │
├─────────────────────────────────────────────────┤
│                                                 │
│    Subscribe to [Plan Name]                    │
│                                                 │
│  Plan Details:                                 │
│  • Price: $9.99/month                          │
│  • Trial: 7 days free                           │
│  • Billing: Monthly                            │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      Payment Information                │   │
│  │                                         │   │
│  │  [UniversalPaymentCheckout Component]   │   │
│  │                                         │   │
│  │  • Apple Pay / Google Pay               │   │
│  │  • Credit Card                          │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Subscribe] [Cancel]                          │
│                                                 │
│              Footer                            │
└─────────────────────────────────────────────────┘
```

**Components:**
- Plan summary card
- Payment form (UniversalPaymentCheckout)
- Terms and conditions checkbox
- Loading states during payment processing

#### Subscription Management Page (`/membership/manage`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│              Header/Navigation                  │
├─────────────────────────────────────────────────┤
│                                                 │
│         My Membership                          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Current Plan: Premium Membership       │   │
│  │  Status: Active                         │   │
│  │  Next Billing: February 1, 2025         │   │
│  │  Amount: $19.99                         │   │
│  │                                         │   │
│  │  Payment Method: •••• 4242            │   │
│  │                                         │   │
│  │  [Update Payment] [Change Plan]        │   │
│  │  [Cancel Subscription]                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Billing History:                               │
│  • January 1, 2025 - $19.99                    │
│  • December 1, 2024 - $19.99                   │
│                                                 │
│              Footer                            │
└─────────────────────────────────────────────────┘
```

**Components:**
- Current subscription card
- Subscription actions (upgrade, downgrade, cancel)
- Billing history list
- Payment method management link

### Mobile Responsiveness

- All pages must be mobile-responsive
- Use responsive grid layouts
- Touch-friendly button sizes (min 44x44px)
- Optimize for mobile payment flows (Apple Pay, Google Pay)

### Accessibility

- WCAG AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Clear focus indicators
- Descriptive error messages

---

## 11. Implementation Plan

### Phase 1: Backend API Development (Week 1-2)

**Tasks:**
1. Create Membership Plan Controller
   - CRUD endpoints for membership plans
   - Tenant isolation
   - Validation

2. Create Membership Subscription Controller
   - CRUD endpoints for subscriptions
   - User-specific queries
   - Status management

3. Enhance Stripe Integration
   - Create Stripe Products/Prices for plans
   - Handle subscription webhooks
   - Update subscription status

4. Database Migrations
   - Verify indexes exist
   - Add any missing constraints

**Deliverables:**
- Backend API endpoints tested
- Swagger documentation updated
- Database schema verified

### Phase 2: Frontend Components (Week 3-4)

**Tasks:**
1. Create Membership Plans Page
   - Server component for data fetching
   - Client component for plan selection
   - Responsive layout

2. Create Subscription Signup Page
   - Plan details display
   - Payment integration
   - Success/error handling

3. Create Subscription Management Page
   - Current subscription display
   - Subscription actions
   - Billing history

4. Create Reusable Components
   - SubscriptionStatus component
   - PlanCard component
   - BillingHistory component

**Deliverables:**
- Frontend pages implemented
- Components tested
- Mobile responsiveness verified

### Phase 3: Payment Integration (Week 5)

**Tasks:**
1. Enhance `/api/billing/manage-subscription`
   - Support membership subscription mode
   - Create Stripe Checkout Session
   - Handle trial periods

2. Enhance Stripe Webhook Handler
   - Handle `checkout.session.completed` for subscriptions
   - Handle `invoice.payment_succeeded`
   - Handle `invoice.payment_failed`
   - Handle `customer.subscription.deleted`
   - Handle `customer.subscription.updated`

3. Test Payment Flows
   - Subscription signup
   - Recurring billing
   - Payment failures
   - Cancellations

**Deliverables:**
- Payment flows working end-to-end
- Webhook handling tested
- Error handling verified

### Phase 4: Admin Interface (Week 6)

**Tasks:**
1. Create Admin Membership Plan Management
   - List plans
   - Create/edit/delete plans
   - Activate/deactivate plans

2. Create Admin Subscription Management
   - View all subscriptions
   - Filter by status
   - Manual subscription updates

**Deliverables:**
- Admin interface implemented
- Admin workflows tested

### Phase 5: Testing & Polish (Week 7-8)

**Tasks:**
1. End-to-End Testing
   - User subscription flow
   - Recurring billing
   - Subscription management
   - Admin workflows

2. Mobile Testing
   - Test on iOS Safari
   - Test on Android Chrome
   - Test Apple Pay/Google Pay

3. Performance Optimization
   - Database query optimization
   - Frontend performance
   - Webhook processing speed

4. Documentation
   - API documentation
   - User guides
   - Admin guides

**Deliverables:**
- All tests passing
- Performance benchmarks met
- Documentation complete

---

## 12. Testing Strategy

### Unit Testing

**Backend:**
- Membership Plan Service tests
- Membership Subscription Service tests
- Stripe Integration Service tests
- Validation tests

**Frontend:**
- Component rendering tests
- User interaction tests
- Form validation tests

### Integration Testing

**API Integration:**
- Test all API endpoints
- Test authentication/authorization
- Test tenant isolation
- Test error handling

**Payment Integration:**
- Test Stripe Checkout Session creation
- Test webhook processing
- Test subscription lifecycle
- Test payment failures

### End-to-End Testing

**User Flows:**
1. User subscribes to membership plan
2. User upgrades subscription
3. User downgrades subscription
4. User cancels subscription
5. User updates payment method

**Admin Flows:**
1. Admin creates membership plan
2. Admin updates membership plan
3. Admin deletes membership plan
4. Admin views all subscriptions

### Mobile Testing

**Devices:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Android Tablet (Chrome)

**Payment Methods:**
- Apple Pay (iOS)
- Google Pay (Android)
- Credit Card (all devices)

### Performance Testing

**Load Testing:**
- Test API endpoints under load
- Test webhook processing under load
- Test database queries under load

**Stress Testing:**
- Test with 10,000+ subscriptions
- Test concurrent webhook processing
- Test payment processing under stress

---

## 13. Security Considerations

### Payment Security

1. **PCI Compliance**
   - All payment data handled by Stripe
   - No credit card data stored in database
   - Use Stripe Elements for secure card input

2. **Webhook Security**
   - Verify Stripe webhook signatures
   - Validate webhook payloads
   - Idempotent webhook processing

3. **Authentication**
   - All API endpoints require JWT authentication
   - User can only access their own subscriptions
   - Admin endpoints require admin role

### Data Security

1. **Tenant Isolation**
   - All queries filtered by tenant_id
   - Database-level constraints
   - API-level validation

2. **Data Encryption**
   - Encrypt sensitive data at rest
   - Use HTTPS for all API calls
   - Secure session management

3. **Access Control**
   - Role-based access control (RBAC)
   - User can only manage own subscription
   - Admin can manage all subscriptions for tenant

### Fraud Prevention

1. **Rate Limiting**
   - Limit subscription creation attempts
   - Limit payment method updates
   - Limit cancellation requests

2. **Validation**
   - Validate all user inputs
   - Validate subscription data
   - Validate payment information

3. **Monitoring**
   - Monitor for suspicious activity
   - Alert on payment failures
   - Track subscription anomalies

---

## 14. Success Metrics

### Business Metrics

1. **Subscription Conversion Rate**
   - Target: 5% of registered users subscribe
   - Measure: Subscriptions / Total Users

2. **Monthly Recurring Revenue (MRR)**
   - Target: $10,000 MRR within 3 months
   - Measure: Sum of all active subscription fees

3. **Churn Rate**
   - Target: < 5% monthly churn
   - Measure: Cancelled subscriptions / Total subscriptions

4. **Trial Conversion Rate**
   - Target: 30% of trials convert to paid
   - Measure: Paid subscriptions / Trial subscriptions

### Technical Metrics

1. **API Performance**
   - Target: < 200ms average response time
   - Measure: API endpoint response times

2. **Webhook Processing**
   - Target: < 10 seconds webhook processing
   - Measure: Webhook processing time

3. **Payment Success Rate**
   - Target: > 95% payment success rate
   - Measure: Successful payments / Total attempts

4. **System Uptime**
   - Target: 99.9% uptime
   - Measure: System availability

### User Experience Metrics

1. **Subscription Signup Time**
   - Target: < 2 minutes from plan selection to completion
   - Measure: Time to complete subscription

2. **Mobile Conversion Rate**
   - Target: Mobile conversion = Desktop conversion
   - Measure: Mobile subscriptions / Mobile visitors

3. **Error Rate**
   - Target: < 1% error rate
   - Measure: Errors / Total requests

---

## Appendix A: DTOs

### MembershipPlanDTO

```typescript
export interface MembershipPlanDTO {
  id?: number;
  tenantId: string;
  planName: string;
  planCode: string;
  description?: string;
  planType: 'SUBSCRIPTION' | 'ONE_TIME' | 'FREEMIUM';
  billingInterval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  price: number;
  currency: string;
  trialDays: number;
  isActive: boolean;
  maxEventsPerMonth?: number;
  maxAttendeesPerEvent?: number;
  featuresJson?: Record<string, any>;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### MembershipSubscriptionDTO

```typescript
export interface MembershipSubscriptionDTO {
  id?: number;
  tenantId: string;
  userProfileId: number;
  membershipPlanId: number;
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  paymentProviderConfigId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  membershipPlan?: MembershipPlanDTO;
  userProfile?: UserProfileDTO;
}
```

---

## Appendix B: Stripe Webhook Events

### Required Webhook Events

1. **checkout.session.completed**
   - Triggered when user completes subscription checkout
   - Create membership_subscription record
   - Set subscription status to ACTIVE or TRIAL

2. **invoice.payment_succeeded**
   - Triggered when recurring payment succeeds
   - Update current_period_start and current_period_end
   - Set subscription status to ACTIVE
   - Send confirmation email

3. **invoice.payment_failed**
   - Triggered when recurring payment fails
   - Set subscription status to PAST_DUE
   - Send payment failure email
   - After 3 failures, set status to CANCELLED

4. **customer.subscription.updated**
   - Triggered when subscription is updated (upgrade/downgrade)
   - Update membership_subscription record
   - Update current_period_start and current_period_end
   - Send confirmation email

5. **customer.subscription.deleted**
   - Triggered when subscription is cancelled
   - Set subscription status to CANCELLED
   - Set cancelled_at timestamp
   - Send cancellation confirmation email

---

## Appendix C: Error Handling

### Common Errors and Solutions

1. **Stripe API Errors**
   - **Error**: Invalid Stripe Price ID
   - **Solution**: Validate price ID exists before creating checkout session
   - **User Message**: "Invalid plan configuration. Please contact support."

2. **Payment Failures**
   - **Error**: Card declined
   - **Solution**: Stripe handles retries automatically
   - **User Message**: "Payment failed. Please update your payment method."

3. **Subscription Not Found**
   - **Error**: Subscription ID doesn't exist
   - **Solution**: Validate subscription exists before operations
   - **User Message**: "Subscription not found. Please contact support."

4. **Plan Not Active**
   - **Error**: Trying to subscribe to inactive plan
   - **Solution**: Check plan.isActive before allowing subscription
   - **User Message**: "This plan is no longer available."

5. **Duplicate Subscription**
   - **Error**: User already has active subscription
   - **Solution**: Check for existing active subscription before creating new one
   - **User Message**: "You already have an active subscription. Please manage your existing subscription."

---

## Appendix D: References

### Documentation

- [Stripe Subscriptions Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [MOSC Styling Standards](.cursor/rules/mosc_styling_standards.mdc)
- [Next.js API Routes Rules](.cursor/rules/nextjs_api_routes.mdc)

### Code References

- Frontend Payment Components: `src/components/UniversalPaymentCheckout.tsx`
- Stripe Integration: `src/lib/stripe/`
- Billing API: `src/app/api/billing/manage-subscription/route.ts`
- Webhook Handler: `src/app/api/webhooks/stripe/route.ts`
- Database Schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- API Documentation: `documentation/Swagger_API_Docs/api-docs.json`

---

## Document Approval

- **Product Owner**: _________________ Date: ___________
- **Technical Lead**: _________________ Date: ___________
- **Backend Lead**: _________________ Date: ___________
- **Frontend Lead**: _________________ Date: ___________

---

**End of Document**





