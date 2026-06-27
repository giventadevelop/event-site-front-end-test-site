'use server';

import { getAppUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

export interface InitializeTicketedFundraiserPaymentRequest {
  eventId: number;
  items: Array<{
    itemType: string;
    itemId: number;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  givebutterCampaignId?: string;
  isFundraiser?: boolean;
  isCharity?: boolean;
  discountCodeId?: number | null;
  returnUrl: string;
  cancelUrl: string;
}

export interface InitializeTicketedFundraiserPaymentResponse {
  checkoutUrl?: string; // GiveButter checkout URL
  sessionUrl?: string; // Alternative field name (matches PaymentSessionResponse)
  transactionId?: string;
  /** Present when backend falls back to Stripe (GiveButter not configured); no redirect URL */
  clientSecret?: string;
}

/**
 * Initialize GiveButter payment for ticketed fundraiser events
 * Calls POST /api/proxy/payments/initialize with DONATION_ZERO_FEE payment type and GIVEBUTTER provider
 * Includes ticket items in the request
 */
export async function initializeTicketedFundraiserPayment(
  data: InitializeTicketedFundraiserPaymentRequest
): Promise<InitializeTicketedFundraiserPaymentResponse> {
  const baseUrl = getAppUrl();
  
  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/payments/initialize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: data.eventId,
        paymentUseCase: 'TICKET_SALE', // Required by backend PaymentSessionRequest @NotNull; routing uses paymentProvider
        paymentType: 'DONATION_ZERO_FEE', // CRITICAL: Explicitly request GiveButter donation flow
        paymentProvider: 'GIVEBUTTER', // CRITICAL: Explicitly request GiveButter provider
        amount: data.amount,
        currency: data.currency,
        items: data.items, // Ticket items for ticketed fundraisers
        customerEmail: data.email,
        customerName: `${data.firstName} ${data.lastName}`.trim(),
        customerPhone: data.phone || undefined,
        metadata: {
          givebutterCampaignId: data.givebutterCampaignId,
          isFundraiser: data.isFundraiser,
          isCharity: data.isCharity,
          // Include ticket items in metadata for backend processing
          cart: JSON.stringify(data.items.map(item => ({
            quantity: item.quantity,
            ticketTypeId: item.itemId,
          }))),
        },
        returnUrl: data.returnUrl, // CRITICAL: Frontend provides the donation success URL
        cancelUrl: data.cancelUrl,
        // Include discountCodeId if provided (for backend processing)
        ...(data.discountCodeId && { discountCodeId: data.discountCodeId }),
      }),
      cache: 'no-store',
    },
    'initializeTicketedFundraiserPayment'
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to initialize ticketed fundraiser payment');
  }

  return await response.json();
}
