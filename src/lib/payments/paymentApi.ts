/**
 * Payment API client
 *
 * Handles communication with payment proxy endpoints.
 * Supports both real backend calls and mock responses for development.
 */

import type {
  PaymentSessionResponse,
  PaymentStatusResponse,
  PaymentInitializeRequest,
  PaymentRefundRequest,
  PaymentProviderType,
} from '@/types';
import {
  isMockModeEnabled,
  mockPaymentSessionByProvider,
  mockPaymentStatus,
} from './mockResponses';

const API_BASE = '/api/proxy/payments';

/**
 * Initialize a payment session
 */
export async function initializePayment(
  request: PaymentInitializeRequest
): Promise<PaymentSessionResponse> {
  // Use mock in development if enabled
  if (isMockModeEnabled() && process.env.NEXT_PUBLIC_MOCK_PAYMENT_PROVIDER) {
    const mockProvider = process.env.NEXT_PUBLIC_MOCK_PAYMENT_PROVIDER as PaymentProviderType;
    console.log('[PaymentAPI] Using mock payment session for provider:', mockProvider);
    return mockPaymentSessionByProvider(mockProvider);
  }

  const response = await fetch(`${API_BASE}/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to initialize payment' }));
    throw new Error(errorData.error || `Payment initialization failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get payment status by transaction ID
 */
export async function getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
  // Use mock in development if enabled
  if (isMockModeEnabled()) {
    console.log('[PaymentAPI] Using mock payment status for transaction:', transactionId);
    return mockPaymentStatus(transactionId);
  }

  const response = await fetch(`${API_BASE}/${transactionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to get payment status' }));
    throw new Error(errorData.error || `Failed to get payment status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Issue a refund
 */
export async function refundPayment(request: PaymentRefundRequest): Promise<PaymentStatusResponse> {
  const response = await fetch(`${API_BASE}/${request.transactionId}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      reason: request.reason,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to process refund' }));
    throw new Error(errorData.error || `Refund failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Poll payment status until it reaches a terminal state
 */
export async function pollPaymentStatus(
  transactionId: string,
  options: {
    interval?: number; // Polling interval in ms (default: 2000)
    maxAttempts?: number; // Maximum polling attempts (default: 30)
    onStatusUpdate?: (status: PaymentStatusResponse) => void;
  } = {}
): Promise<PaymentStatusResponse> {
  const { interval = 2000, maxAttempts = 30, onStatusUpdate } = options;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await getPaymentStatus(transactionId);
    onStatusUpdate?.(status);

    // Terminal states
    if (
      status.status === 'SUCCEEDED' ||
      status.status === 'FAILED' ||
      status.status === 'CANCELLED' ||
      status.status === 'CONFIRMED'
    ) {
      return status;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error('Payment status polling timeout');
}









