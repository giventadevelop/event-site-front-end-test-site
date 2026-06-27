'use server';

import { getAppUrlFromRequestHeaders } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

export interface InitializeDonationPaymentRequest {
  eventId: number;
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  givebutterCampaignId?: string;
  isFundraiser?: boolean;
  isCharity?: boolean;
  prayerIntention?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface InitializeDonationPaymentResponse {
  checkoutUrl?: string; // GiveButter checkout URL
  sessionUrl?: string; // Alternative field name (matches PaymentSessionResponse)
  transactionId?: string;
  donationId?: string;
}

/**
 * Initialize GiveButter donation payment
 * Calls POST /api/proxy/payments/initialize with DONATION_ZERO_FEE payment type
 */
export async function initializeDonationPayment(
  data: InitializeDonationPaymentRequest
): Promise<InitializeDonationPaymentResponse> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  
  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/payments/initialize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: data.eventId,
        paymentType: 'DONATION_ZERO_FEE',
        paymentProvider: 'GIVEBUTTER',
        amount: data.amount,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        metadata: {
          givebutterCampaignId: data.givebutterCampaignId,
          isFundraiser: data.isFundraiser,
          isCharity: data.isCharity,
          prayerIntention: data.prayerIntention,
        },
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl,
      }),
      cache: 'no-store',
    },
    'initializeDonationPayment'
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to initialize donation');
  }

  return await response.json();
}

/**
 * Get donation transaction by ID
 */
export async function getDonationTransaction(
  transactionId: string,
  eventId: string
): Promise<any> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  
  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/donation-transactions/${transactionId}?eventId=${eventId}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
    'getDonationTransaction'
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch donation transaction: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get payment transaction status (for polling)
 */
export async function getPaymentTransactionStatus(
  transactionId: string
): Promise<any> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  
  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/payments/${transactionId}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
    'getPaymentTransactionStatus'
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch payment status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Generate QR code for donation
 */
export async function generateDonationQRCode(
  eventId: string,
  transactionId: number
): Promise<{ qrCodeUrl: string }> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  
  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/events/${eventId}/donations/${transactionId}/qrcode`,
    {
      method: 'POST',
      cache: 'no-store',
    },
    'generateDonationQRCode'
  );

  if (!response.ok) {
    throw new Error(`Failed to generate QR code: ${response.status}`);
  }

  return await response.json();
}

/**
 * Send donation confirmation email
 */
export async function sendDonationConfirmationEmail(
  eventId: string,
  transactionId: number,
  email: string
): Promise<void> {
  const baseUrl = await getAppUrlFromRequestHeaders();
  
  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/events/${eventId}/donations/${transactionId}/send-email?to=${encodeURIComponent(email)}`,
    {
      method: 'POST',
      cache: 'no-store',
    },
    'sendDonationConfirmationEmail'
  );

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.status}`);
  }
}
