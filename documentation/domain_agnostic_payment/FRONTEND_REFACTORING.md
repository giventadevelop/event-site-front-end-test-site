# Frontend Refactoring Guide: Domain-Agnostic Payment System

**Project:** MCEFEE Payment System Refactoring
**Frontend Location:** `C:\Users\gain\git\malayalees-us-site`
**Document Version:** 1.0
**Date:** October 20, 2025

---

## Overview

This document details the frontend refactoring required to implement provider-agnostic payment UI components that work seamlessly with the new backend payment orchestration layer.

---

## Table of Contents

1. [Current Frontend State](#current-frontend-state)
2. [Refactoring Strategy](#refactoring-strategy)
3. [New Component Architecture](#new-component-architecture)
4. [Universal Payment Component](#universal-payment-component)
5. [Provider-Specific Components](#provider-specific-components)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Migration Plan](#migration-plan)
9. [Testing Approach](#testing-approach)

---

## 1. Current Frontend State

### Existing Payment Components

**Location:** `src/components/`

1. **StripeDesktopCheckout.tsx** (558 lines)
   - Express Checkout Element (Apple Pay, Google Pay, Link)
   - PaymentElement fallback
   - Client-side Payment Intent creation
   - Tight coupling to Stripe APIs

2. **StripePaymentRequestButton.tsx** (331 lines)
   - Payment Request Button for wallets
   - Client-side payment confirmation
   - Stripe-specific error handling

### Current API Routes

**Location:** `src/app/api/stripe/` and `src/pages/api/stripe/`

1. **payment-intent/route.ts** - Creates Stripe Payment Intent
2. **verify-payment-intent.ts** - Verifies payment status
3. **event-checkout/route.ts** - Checkout session creation

### Issues with Current Implementation

1. **Provider Lock-in:** All components hardcoded for Stripe
2. **Client-Side Logic:** Payment Intent creation in Next.js API routes
3. **Credential Exposure:** Stripe publishable key in environment variables
4. **Duplication:** Similar logic repeated across components
5. **Limited Flexibility:** Cannot easily add PayPal, other providers

---

## 2. Refactoring Strategy

### Goals

1. **Provider Abstraction:** Components work with any payment provider
2. **Backend-Driven:** Payment initialization happens in backend
3. **Dynamic Loading:** Provider-specific UI loaded based on backend response
4. **Consistent UX:** Same checkout flow regardless of provider
5. **Easy Extensibility:** New providers require minimal frontend changes

### Approach

**Phase 1: Create Abstraction Layer**
- Build `UniversalPaymentCheckout` wrapper component
- Extract provider-specific logic into separate components
- Create unified state management

**Phase 2: Refactor Existing Components**
- Convert `StripeDesktopCheckout` to `StripePaymentUI`
- Remove client-side Payment Intent creation
- Update to use backend APIs

**Phase 3: Add New Providers**
- Implement `PayPalPaymentUI` component
- Add provider selection UI (if needed)
- Test with multiple providers

**Phase 4: Deprecate Old Components**
- Update all pages to use new components
- Remove old Stripe-specific code
- Clean up unused API routes

---

## 3. New Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── payment/
│   │   ├── UniversalPaymentCheckout.tsx       # Main wrapper component
│   │   ├── PaymentProviderSelector.tsx        # Provider selection UI
│   │   ├── PaymentStatusDisplay.tsx           # Status indicators
│   │   │
│   │   ├── providers/
│   │   │   ├── StripePaymentUI.tsx           # Stripe-specific UI
│   │   │   ├── PayPalPaymentUI.tsx           # PayPal-specific UI
│   │   │   ├── ACPPaymentUI.tsx              # Future: ACP integration
│   │   │   └── AP2PaymentUI.tsx              # Future: AP2 integration
│   │   │
│   │   └── hooks/
│   │       ├── usePaymentSession.ts          # Initialize payment
│   │       ├── usePaymentStatus.ts           # Poll/check status
│   │       └── usePaymentProviders.ts        # Get available providers
│   │
│   ├── StripeDesktopCheckout.tsx             # DEPRECATED (keep for migration)
│   └── StripePaymentRequestButton.tsx        # DEPRECATED
│
├── lib/
│   ├── payment/
│   │   ├── paymentClient.ts                  # API client
│   │   ├── providerRegistry.ts               # Provider component mapping
│   │   └── types.ts                          # TypeScript types
│   │
│   └── ...
│
└── pages/api/proxy/payments/                 # Proxy routes to backend
    ├── initialize.ts
    ├── [transactionId]/
    │   ├── status.ts
    │   └── confirm.ts
    └── providers/alternatives.ts
```

---

## 4. Universal Payment Component

### UniversalPaymentCheckout.tsx

**Purpose:** Main component that orchestrates payment flow regardless of provider

**File:** `src/components/payment/UniversalPaymentCheckout.tsx`

```typescript
"use client";

import React, { useEffect, useState } from 'react';
import { PaymentProviderSelector } from './PaymentProviderSelector';
import { PaymentStatusDisplay } from './PaymentStatusDisplay';
import { providerRegistry } from '@/lib/payment/providerRegistry';
import type {
  PaymentSession,
  CartItem,
  PaymentType,
  PaymentProvider
} from '@/lib/payment/types';

export type UniversalPaymentCheckoutProps = {
  // Required props
  cart: CartItem[];
  eventId?: number;
  email: string;
  firstName: string;
  lastName: string;

  // Optional props
  phone?: string;
  discountCodeId?: number;
  paymentType?: PaymentType;
  amount?: number; // For donations where amount is user-specified

  // Callbacks
  onSuccess?: (transactionId: number) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;

  // UI customization
  showProviderSelector?: boolean; // Allow user to choose provider
  preferredProvider?: PaymentProvider; // Hint for provider selection
  className?: string;
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
  amount,
  onSuccess,
  onError,
  onCancel,
  showProviderSelector = false,
  preferredProvider,
  className = ''
}: UniversalPaymentCheckoutProps) {

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(
    preferredProvider || null
  );

  // Initialize payment session
  useEffect(() => {
    if (email && (cart.length > 0 || amount)) {
      initializePayment();
    }
  }, [cart, email, amount, discountCodeId, selectedProvider]);

  async function initializePayment() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          cart: cart.map(item => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            ticketTypeName: item.ticketTypeName,
            unitPrice: item.unitPrice,
            totalAmount: item.totalAmount
          })),
          customerEmail: email,
          customerFirstName: firstName,
          customerLastName: lastName,
          customerPhone: phone,
          discountCodeId,
          paymentType,
          amount, // For donations
          preferredProvider: selectedProvider // Hint to backend
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const paymentSession: PaymentSession = await response.json();

      console.log('[UniversalPayment] Session initialized:', {
        transactionId: paymentSession.transactionId,
        provider: paymentSession.providerType
      });

      setSession(paymentSession);
    } catch (err: any) {
      console.error('[UniversalPayment] Initialization failed:', err);
      setError(err.message || 'Failed to initialize payment');
      onError?.(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  }

  // Handle provider selection change
  const handleProviderChange = (provider: PaymentProvider) => {
    console.log('[UniversalPayment] Provider changed to:', provider);
    setSelectedProvider(provider);
    setSession(null); // Reset session to re-initialize with new provider
  };

  // Handle successful payment
  const handlePaymentSuccess = (transactionId: number) => {
    console.log('[UniversalPayment] Payment successful:', transactionId);
    onSuccess?.(transactionId);

    // Redirect to success page
    const successUrl = `/event/success?transactionId=${transactionId}`;
    window.location.href = successUrl;
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    console.error('[UniversalPayment] Payment error:', errorMessage);
    setError(errorMessage);
    onError?.(errorMessage);
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600 font-medium">Initializing payment...</p>
        <p className="mt-1 text-sm text-gray-500">Please wait</p>
      </div>
    );
  }

  // Render error state
  if (error && !session) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Payment Initialization Failed</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={initializePayment}
              className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render provider selector if enabled and no session
  if (showProviderSelector && !session) {
    return (
      <PaymentProviderSelector
        onSelect={handleProviderChange}
        className={className}
      />
    );
  }

  // Render payment UI based on provider
  if (session) {
    const ProviderComponent = providerRegistry.getComponent(session.providerType);

    if (!ProviderComponent) {
      return (
        <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
          <p className="text-yellow-800">
            Unsupported payment provider: <strong>{session.providerType}</strong>
          </p>
          <p className="mt-2 text-sm text-yellow-700">
            Please contact support or try a different payment method.
          </p>
        </div>
      );
    }

    return (
      <div className={className}>
        {/* Show payment status if there's an error */}
        {error && (
          <div className="mb-4">
            <PaymentStatusDisplay status="error" message={error} />
          </div>
        )}

        {/* Render provider-specific payment UI */}
        <ProviderComponent
          session={session}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return null;
}
```

### usePaymentSession Hook

**File:** `src/components/payment/hooks/usePaymentSession.ts`

```typescript
import { useState, useCallback } from 'react';
import type { PaymentSession, PaymentInitializeRequest } from '@/lib/payment/types';

export function usePaymentSession() {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = useCallback(async (request: PaymentInitializeRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const paymentSession = await response.json();
      setSession(paymentSession);
      return paymentSession;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    loading,
    error,
    initializePayment,
    resetSession
  };
}
```

---

## 5. Provider-Specific Components

### StripePaymentUI.tsx (Refactored)

**File:** `src/components/payment/providers/StripePaymentUI.tsx`

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import type { PaymentSession } from '@/lib/payment/types';

type StripePaymentUIProps = {
  session: PaymentSession;
  onSuccess?: (transactionId: number) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
};

function StripeCheckoutForm({
  transactionId,
  onSuccess,
  onError,
  onCancel
}: Omit<StripePaymentUIProps, 'session'> & { transactionId: number }) {

  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [expressReady, setExpressReady] = useState(false);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState(false);

  // Timeout for express checkout loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!expressReady) {
        console.warn('[Stripe] Express Checkout timeout');
        setExpressReady(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [expressReady]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!stripe || !elements) {
      console.error('[Stripe] Stripe.js has not loaded');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Validate payment details
      const { error: submitError } = await elements.submit();

      if (submitError) {
        console.error('[Stripe] Validation error:', submitError);

        let userMessage = 'Please check your payment details.';
        if (submitError.type === 'validation_error') {
          if (submitError.message?.includes('payment_method')) {
            userMessage = 'Please select a payment method first.';
          } else {
            userMessage = submitError.message || userMessage;
          }
        }

        onError?.(userMessage);
        setProcessing(false);
        return;
      }

      console.log('[Stripe] Payment validation successful');

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        console.error('[Stripe] Payment confirmation error:', error);
        onError?.(error.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('[Stripe] Payment succeeded:', paymentIntent.id);
        onSuccess?.(transactionId);
      } else {
        console.warn('[Stripe] Unexpected payment status:', paymentIntent?.status);
        onError?.('Payment is being processed. Please check your email for confirmation.');
        setProcessing(false);
      }

    } catch (err: any) {
      console.error('[Stripe] Payment error:', err);
      onError?.(err.message || 'An unexpected error occurred.');
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    console.log('[Stripe] Payment cancelled');
    setProcessing(false);
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      {/* Loading overlay for Express Checkout */}
      {!expressReady && (
        <div className="bg-white bg-opacity-90 flex items-center justify-center p-6 rounded-lg border-2 border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading Express Checkout...</p>
            <p className="text-xs text-gray-500 mt-1">Apple Pay • Google Pay • Link</p>
          </div>
        </div>
      )}

      {/* Express Checkout Element */}
      <div className={!expressReady ? 'hidden' : ''}>
        <ExpressCheckoutElement
          onConfirm={handleSubmit}
          onCancel={handleCancel}
          onReady={({ availablePaymentMethods }) => {
            console.log('[Stripe] Express Checkout ready:', availablePaymentMethods);
            setExpressReady(true);
          }}
          options={{ layout: { maxColumns: 3, maxRows: 1 } as any }}
        />
      </div>

      {/* Divider */}
      {expressReady && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 font-medium">Or pay with card</span>
          </div>
        </div>
      )}

      {/* Payment Element */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <PaymentElement
          onReady={() => console.log('[Stripe] PaymentElement ready')}
          onChange={(event) => {
            setPaymentMethodSelected(event.complete);
            console.log('[Stripe] Payment method:', event.complete ? 'selected' : 'incomplete');
          }}
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false
            },
            paymentMethodOrder: ['card', 'link', 'cashapp']
          }}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={processing || !stripe || !paymentMethodSelected}
          className="mt-4 w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-teal-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : !paymentMethodSelected ? (
            'Select payment method'
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </div>
  );
}

export function StripePaymentUI({ session, onSuccess, onError, onCancel }: StripePaymentUIProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (session.publicKey) {
      console.log('[Stripe] Loading Stripe.js with key:', session.publicKey.substring(0, 12) + '...');
      setStripePromise(loadStripe(session.publicKey));
    }
  }, [session.publicKey]);

  if (!stripePromise || !session.clientSecret) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Loading Stripe payment form...</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: session.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0d9488',
            borderRadius: '8px'
          }
        }
      }}
    >
      <StripeCheckoutForm
        transactionId={session.transactionId}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
}
```

### PayPalPaymentUI.tsx (New)

**File:** `src/components/payment/providers/PayPalPaymentUI.tsx`

```typescript
"use client";

import React, { useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import type { PaymentSession } from '@/lib/payment/types';

type PayPalPaymentUIProps = {
  session: PaymentSession;
  onSuccess?: (transactionId: number) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
};

export function PayPalPaymentUI({ session, onSuccess, onError, onCancel }: PayPalPaymentUIProps) {

  if (!session.publicKey) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-lg">
        PayPal configuration error: Missing client ID
      </div>
    );
  }

  // If backend provided a session URL (redirect flow), show button to open
  if (session.sessionUrl) {
    return (
      <div className="space-y-4">
        <p className="text-gray-700">Click below to complete payment with PayPal:</p>
        <button
          onClick={() => {
            window.location.href = session.sessionUrl!;
          }}
          className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Continue to PayPal
        </button>
        <button
          onClick={onCancel}
          className="w-full text-gray-600 hover:text-gray-800 text-sm underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Otherwise, use PayPal SDK buttons (embedded flow)
  return (
    <PayPalScriptProvider
      options={{
        'client-id': session.publicKey,
        currency: 'USD',
        intent: 'capture'
      }}
    >
      <div className="space-y-4">
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }}
          createOrder={async () => {
            // Backend should create PayPal order and return order ID
            // For now, we'll call a proxy endpoint
            try {
              const response = await fetch('/api/proxy/payments/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transactionId: session.transactionId
                })
              });

              if (!response.ok) {
                throw new Error('Failed to create PayPal order');
              }

              const data = await response.json();
              return data.orderId;
            } catch (err: any) {
              console.error('[PayPal] Create order error:', err);
              onError?.(err.message);
              throw err;
            }
          }}
          onApprove={async (data) => {
            console.log('[PayPal] Payment approved:', data.orderID);

            try {
              // Capture payment on backend
              const response = await fetch('/api/proxy/payments/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  transactionId: session.transactionId
                })
              });

              if (!response.ok) {
                throw new Error('Failed to capture PayPal payment');
              }

              const result = await response.json();
              console.log('[PayPal] Payment captured:', result);

              onSuccess?.(session.transactionId);
            } catch (err: any) {
              console.error('[PayPal] Capture error:', err);
              onError?.(err.message);
            }
          }}
          onCancel={() => {
            console.log('[PayPal] Payment cancelled by user');
            onCancel?.();
          }}
          onError={(err) => {
            console.error('[PayPal] Button error:', err);
            onError?.(err.message || 'PayPal error occurred');
          }}
        />

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by PayPal
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
```

---

## 6. State Management

### Provider Registry

**File:** `src/lib/payment/providerRegistry.ts`

```typescript
import type { PaymentProvider } from './types';
import { StripePaymentUI } from '@/components/payment/providers/StripePaymentUI';
import { PayPalPaymentUI } from '@/components/payment/providers/PayPalPaymentUI';
// Import future providers...

type ProviderComponent = React.ComponentType<any>;

class PaymentProviderRegistry {
  private providers: Map<PaymentProvider, ProviderComponent> = new Map();

  constructor() {
    // Register default providers
    this.register('STRIPE', StripePaymentUI);
    this.register('PAYPAL', PayPalPaymentUI);
  }

  register(provider: PaymentProvider, component: ProviderComponent) {
    this.providers.set(provider, component);
  }

  getComponent(provider: PaymentProvider): ProviderComponent | undefined {
    return this.providers.get(provider);
  }

  isSupported(provider: PaymentProvider): boolean {
    return this.providers.has(provider);
  }

  getAllProviders(): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = new PaymentProviderRegistry();
```

---

## 7. API Integration

### API Proxy Routes

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const proxyHandler = createProxyHandler({
    path: (req) => `/payments/${req.query.transactionId}`,
    allowedMethods: ['GET']
  });

  return proxyHandler(req, res);
}
```

---

## 8. Migration Plan

### Step 1: Deploy New Components (Week 1)

1. Create new `payment/` directory structure
2. Implement `UniversalPaymentCheckout` component
3. Refactor `StripePaymentUI` to use backend API
4. Create API proxy routes
5. Test with existing Stripe configuration

### Step 2: Update Ticket Purchase Page (Week 2)

**Before:**
```typescript
import StripeDesktopCheckout from '@/components/StripeDesktopCheckout';

<StripeDesktopCheckout
  cart={cart}
  eventId={eventId}
  email={email}
  enabled={formValid}
  amountCents={totalCents}
/>
```

**After:**
```typescript
import { UniversalPaymentCheckout } from '@/components/payment/UniversalPaymentCheckout';

<UniversalPaymentCheckout
  cart={cart}
  eventId={eventId}
  email={email}
  firstName={firstName}
  lastName={lastName}
  phone={phone}
  onSuccess={(txId) => console.log('Success:', txId)}
  onError={(err) => console.error('Error:', err)}
/>
```

### Step 3: Add PayPal Support (Week 3)

1. Implement `PayPalPaymentUI` component
2. Configure PayPal in backend for test tenant
3. Add provider selection UI (optional)
4. Test full flow with PayPal

### Step 4: Deprecate Old Components (Week 4)

1. Add deprecation warnings to old components
2. Update all remaining pages
3. Remove old API routes (after 30-day grace period)
4. Delete deprecated components

---

## 9. Testing Approach

### Unit Tests

**File:** `src/components/payment/__tests__/UniversalPaymentCheckout.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UniversalPaymentCheckout } from '../UniversalPaymentCheckout';

// Mock fetch
global.fetch = jest.fn();

describe('UniversalPaymentCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes payment session on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactionId: 123,
        providerType: 'STRIPE',
        clientSecret: 'pi_test_secret',
        publicKey: 'pk_test_***'
      })
    });

    render(
      <UniversalPaymentCheckout
        cart={[{ ticketTypeId: 1, quantity: 2 }]}
        eventId={1}
        email="test@example.com"
        firstName="John"
        lastName="Doe"
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/payments/initialize',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('displays error when initialization fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <UniversalPaymentCheckout
        cart={[{ ticketTypeId: 1, quantity: 2 }]}
        eventId={1}
        email="test@example.com"
        firstName="John"
        lastName="Doe"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/initialization failed/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

Test complete flow from cart to payment success using Playwright or Cypress.

### Browser Compatibility

- Chrome/Edge: Full support (all payment methods)
- Safari: Apple Pay + card
- Firefox: Card + PayPal
- Mobile browsers: Test wallet availability

---

## Summary

This frontend refactoring creates a flexible, provider-agnostic payment UI layer that:

1. **Abstracts provider complexity** behind universal components
2. **Delegates business logic** to backend
3. **Supports dynamic provider loading**
4. **Maintains consistent UX** across providers
5. **Enables easy testing** through separation of concerns

The new architecture positions the frontend as a thin presentation layer while the backend handles payment orchestration.
