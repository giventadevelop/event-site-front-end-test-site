/**
 * Mock payment responses for development
 *
 * These mock responses match the backend API schema and can be used
 * for frontend development before backend endpoints are ready.
 */

import type {
  PaymentSessionResponse,
  PaymentStatusResponse,
  PaymentProviderType,
  PaymentUseCase,
  PaymentStatus,
} from '@/types';

/**
 * Mock PaymentSessionResponse for Stripe
 */
export function mockStripePaymentSession(): PaymentSessionResponse {
  return {
    transactionId: 'mock_txn_' + Date.now(),
    providerType: PaymentProviderType.STRIPE,
    clientSecret: 'pi_mock_' + Date.now() + '_secret_mock',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
    paymentMethod: 'card',
    metadata: {
      eventId: 1,
      cart: JSON.stringify([{ ticketTypeId: 1, quantity: 2 }]),
    },
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  };
}

/**
 * Mock PaymentSessionResponse for Stripe Instant Checkout (ACP)
 */
export function mockStripeAcpPaymentSession(): PaymentSessionResponse {
  return {
    transactionId: 'mock_txn_acp_' + Date.now(),
    providerType: PaymentProviderType.STRIPE,
    sessionUrl: 'https://checkout.stripe.com/c/pay/mock_session_' + Date.now(),
    paymentMethod: 'wallet',
    metadata: {
      eventId: 1,
      acpEnabled: true,
    },
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

/**
 * Mock PaymentSessionResponse for PayPal
 */
export function mockPayPalPaymentSession(): PaymentSessionResponse {
  return {
    transactionId: 'mock_txn_paypal_' + Date.now(),
    providerType: PaymentProviderType.PAYPAL,
    sessionUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=mock_token_' + Date.now(),
    paymentMethod: 'paypal',
    metadata: {
      eventId: 1,
      orderId: 'mock_order_' + Date.now(),
    },
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  };
}

/**
 * Mock PaymentSessionResponse for Revolut
 */
export function mockRevolutPaymentSession(): PaymentSessionResponse {
  return {
    transactionId: 'mock_txn_revolut_' + Date.now(),
    providerType: PaymentProviderType.REVOLUT,
    sessionUrl: 'https://pay.revolut.com/checkout/mock_session_' + Date.now(),
    paymentMethod: 'card',
    metadata: {
      eventId: 1,
      requiresSca: true,
    },
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  };
}

/**
 * Mock PaymentSessionResponse for Zeffy
 */
export function mockZeffyPaymentSession(): PaymentSessionResponse {
  return {
    transactionId: 'mock_txn_zeffy_' + Date.now(),
    providerType: PaymentProviderType.ZEFFY,
    sessionUrl: 'https://www.zeffy.com/donation-form/mock_campaign_' + Date.now(),
    paymentMethod: 'donation',
    metadata: {
      eventId: 1,
      campaignId: 'mock_campaign_' + Date.now(),
      zeroFee: true,
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
}

/**
 * Mock PaymentSessionResponse for Zelle manual payment
 */
export function mockZellePaymentSession(): PaymentSessionResponse {
  return {
    transactionId: 'mock_txn_zelle_' + Date.now(),
    providerType: PaymentProviderType.ZELLE,
    paymentMethod: 'zelle',
    metadata: {
      eventId: 1,
      zelleEmail: 'payments@example.com',
      zellePhone: '+1234567890',
      instructions: 'Please send payment to payments@example.com with event ID in memo',
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
}

/**
 * Mock PaymentStatusResponse
 */
export function mockPaymentStatus(
  transactionId: string,
  status: PaymentStatus = PaymentStatus.PENDING,
  providerType: PaymentProviderType = PaymentProviderType.STRIPE
): PaymentStatusResponse {
  return {
    transactionId,
    status,
    providerType,
    amount: 100.00,
    currency: 'USD',
    paymentMethod: 'card',
    paymentReference: 'mock_ref_' + Date.now(),
    failureReason: status === PaymentStatus.FAILED ? 'Mock failure reason' : undefined,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mock payment session based on provider type
 */
export function mockPaymentSessionByProvider(providerType: PaymentProviderType): PaymentSessionResponse {
  switch (providerType) {
    case PaymentProviderType.STRIPE:
      return mockStripePaymentSession();
    case PaymentProviderType.PAYPAL:
      return mockPayPalPaymentSession();
    case PaymentProviderType.REVOLUT:
      return mockRevolutPaymentSession();
    case PaymentProviderType.ZEFFY:
      return mockZeffyPaymentSession();
    case PaymentProviderType.ZELLE:
      return mockZellePaymentSession();
    default:
      return mockStripePaymentSession(); // Default fallback
  }
}

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'development';
}









