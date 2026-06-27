"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { ManualPaymentRequestDTO, EventTicketTransactionDTO, EventDetailsDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

if (!getApiBase()) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

/**
 * Fetch manual payment request with related ticket transaction and items
 */
export async function fetchManualPaymentRequestServer(
  requestId: number
): Promise<{
  paymentRequest: ManualPaymentRequestDTO;
  ticketTransaction?: EventTicketTransactionDTO;
  event?: EventDetailsDTO;
} | null> {
  try {
    const baseUrl = getAppUrl();

    // Fetch payment request
    const paymentRes = await fetch(`${baseUrl}/api/proxy/manual-payments/${requestId}`, {
      cache: 'no-store',
    });

    if (!paymentRes.ok) {
      if (paymentRes.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch manual payment request: ${paymentRes.status}`);
    }

    const paymentRequest: ManualPaymentRequestDTO = await paymentRes.json();

    // Fetch ticket transaction if available
    // CRITICAL: Only fetch the specific transaction linked to this payment request
    let ticketTransaction: EventTicketTransactionDTO | undefined;
    if (paymentRequest.ticketTransactionId) {
      try {
        // CRITICAL: Fetch by ID to ensure we get the exact transaction for this payment request
        const ticketRes = await fetch(
          `${baseUrl}/api/proxy/event-ticket-transactions/${paymentRequest.ticketTransactionId}`,
          { cache: 'no-store' }
        );
        if (ticketRes.ok) {
          const fetchedTransaction = await ticketRes.json();
          
          // CRITICAL: Verify transaction belongs to this payment request and event
          if (fetchedTransaction.id === paymentRequest.ticketTransactionId && 
              fetchedTransaction.eventId === paymentRequest.eventId) {
            ticketTransaction = fetchedTransaction;
            console.log('[fetchManualPaymentRequestServer] Transaction verified:', {
              transactionId: fetchedTransaction.id,
              eventId: fetchedTransaction.eventId,
              paymentRequestId: paymentRequest.id
            });
          } else {
            console.error('[fetchManualPaymentRequestServer] Transaction verification failed:', {
              fetchedTransactionId: fetchedTransaction.id,
              expectedTransactionId: paymentRequest.ticketTransactionId,
              fetchedEventId: fetchedTransaction.eventId,
              expectedEventId: paymentRequest.eventId
            });
          }
        }
      } catch (err) {
        console.error('[fetchManualPaymentRequestServer] Error fetching ticket transaction:', err);
      }
    }

    // Fetch event details
    let event: EventDetailsDTO | undefined;
    try {
      const eventRes = await fetch(
        `${baseUrl}/api/proxy/event-details/${paymentRequest.eventId}`,
        { cache: 'no-store' }
      );
      if (eventRes.ok) {
        event = await eventRes.json();
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    }

    return {
      paymentRequest,
      ticketTransaction,
      event,
    };
  } catch (error) {
    console.error('Error fetching manual payment request:', error);
    return null;
  }
}

/**
 * Fetch ticket transaction linked to manual payment request
 */
export async function fetchManualPaymentTicketTransactionServer(
  requestId: number
): Promise<EventTicketTransactionDTO | null> {
  try {
    const paymentRequestData = await fetchManualPaymentRequestServer(requestId);
    if (!paymentRequestData?.ticketTransaction) {
      return null;
    }
    return paymentRequestData.ticketTransaction;
  } catch (error) {
    console.error('Error fetching ticket transaction:', error);
    return null;
  }
}

/**
 * Trigger confirmation email sending for manual payment request
 * This is idempotent - safe to call multiple times
 */
export async function sendManualPaymentConfirmationEmailServer(
  requestId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(
      `${baseUrl}/api/proxy/manual-payments/${requestId}/send-confirmation-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Failed to send confirmation email: ${response.status}`,
      };
    }
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send confirmation email',
    };
  }
}
