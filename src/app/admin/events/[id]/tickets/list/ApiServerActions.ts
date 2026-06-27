"use server";
import { stripe } from '@/lib/stripe';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { EventTicketTransactionDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

if (!getApiBase()) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

export async function refundTicketTransactionServer(ticket: EventTicketTransactionDTO, reason: string) {
  if (!ticket.stripePaymentIntentId) {
    throw new Error('No Stripe payment intent ID found for this ticket.');
  }
  // 1. Refund via Stripe
  const stripeClient = stripe();
  let refund;
  try {
    refund = await stripeClient.refunds.create({
      payment_intent: ticket.stripePaymentIntentId,
      reason: reason ? 'requested_by_customer' : undefined,
      metadata: {
        ticketTransactionId: ticket.id?.toString() || '',
        adminReason: reason,
      },
    });
  } catch (err: any) {
    throw new Error('Stripe refund failed: ' + (err.message || err.type || 'Unknown error'));
  }
  // 2. Update ticket transaction status via proxy
  const now = new Date().toISOString();
  const patchPayload: Partial<EventTicketTransactionDTO> = {
    id: ticket.id,
    tenantId: ticket.tenantId || getTenantId(),
    transactionReference: ticket.transactionReference,
    email: ticket.email,
    firstName: ticket.firstName,
    lastName: ticket.lastName,
    phone: ticket.phone,
    quantity: ticket.quantity,
    pricePerUnit: ticket.pricePerUnit,
    totalAmount: ticket.totalAmount,
    taxAmount: ticket.taxAmount,
    platformFeeAmount: ticket.platformFeeAmount,
    discountCodeId: ticket.discountCodeId,
    discountAmount: ticket.discountAmount,
    finalAmount: ticket.finalAmount,
    status: 'REFUNDED',
    paymentMethod: ticket.paymentMethod,
    paymentReference: ticket.paymentReference,
    purchaseDate: ticket.purchaseDate,
    confirmationSentAt: ticket.confirmationSentAt,
    refundAmount: refund.amount ? refund.amount / 100 : ticket.finalAmount,
    refundDate: now,
    refundReason: reason,
    stripeCheckoutSessionId: ticket.stripeCheckoutSessionId,
    stripePaymentIntentId: ticket.stripePaymentIntentId,
    stripeCustomerId: ticket.stripeCustomerId,
    stripePaymentStatus: 'refunded',
    stripeCustomerEmail: ticket.stripeCustomerEmail,
    stripePaymentCurrency: ticket.stripePaymentCurrency,
    stripeAmountDiscount: ticket.stripeAmountDiscount,
    stripeAmountTax: ticket.stripeAmountTax,
    stripeFeeAmount: ticket.stripeFeeAmount,
    eventId: ticket.eventId,
    userId: ticket.userId,
    createdAt: ticket.createdAt,
    updatedAt: now,
    checkInStatus: ticket.checkInStatus,
    numberOfGuestsCheckedIn: ticket.numberOfGuestsCheckedIn,
    checkInTime: ticket.checkInTime,
    checkOutTime: ticket.checkOutTime,
  };
  const appUrl = getAppUrl();
  const res = await fetch(`${appUrl}/api/proxy/event-ticket-transactions/${ticket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(patchPayload),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to update ticket transaction status after refund');
  }
  return true;
}

/**
 * Batch Job Request/Response Interfaces for Stripe Ticket Batch Refund
 */
export interface StripeTicketBatchRefundRequest {
  eventId: number; // Required: Event ID from URL params
  tenantId?: string; // Optional: Defaults to NEXT_PUBLIC_TENANT_ID
  startDate?: string; // Optional: ISO 8601 format (future enhancement)
  endDate?: string; // Optional: ISO 8601 format (future enhancement)
}

export interface StripeTicketBatchRefundResponse {
  jobId: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  tenantId: string | null;
  eventId: number | null;
  estimatedRecords: number | null;
  estimatedCompletionTime: string | null;
  message: string;
}

/**
 * Trigger Stripe Ticket Batch Refund Job
 * Calls the backend batch job endpoint to refund all eligible Stripe tickets for an event
 */
export async function triggerStripeTicketBatchRefundServer(
  request: StripeTicketBatchRefundRequest = {}
): Promise<StripeTicketBatchRefundResponse> {
  try {
    // Validate required parameters
    if (!request.eventId) {
      throw new Error('Event ID is required');
    }

    // Validate date range if both dates are provided
    if (request.startDate && request.endDate) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      if (start > end) {
        throw new Error('Start date must be before or equal to end date');
      }
    }

    // Prepare request payload (only include defined fields)
    const payload: StripeTicketBatchRefundRequest = {
      eventId: request.eventId,
    };
    
    if (request.tenantId) {
      payload.tenantId = request.tenantId;
    } else {
      // Use current tenant from environment
      payload.tenantId = getTenantId();
    }
    
    if (request.startDate) {
      payload.startDate = request.startDate;
    }
    
    if (request.endDate) {
      payload.endDate = request.endDate;
    }

    // Call backend batch job API endpoint (NOT a proxy endpoint - direct backend call)
    const url = `${getApiBase()}/api/cron/stripe-ticket-batch-refund`;
    const response = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Failed to trigger batch refund job. Please try again.';

      try {
        const errorData = await response.json();

        // Extract user-friendly error message from response
        if (errorData.message && typeof errorData.message === 'string') {
          // Check if it's a user-friendly message or a technical error code
          if (errorData.message.includes('error.') || errorData.message.includes('Error:') ||
              errorData.message.toLowerCase().includes('batchjob') ||
              errorData.message.toLowerCase().includes('batch')) {
            // Map technical error codes to user-friendly messages
            const messageLower = errorData.message.toLowerCase();
            if (messageLower.includes('batchjobhttperror') || messageLower.includes('batchjobunavailable')) {
              errorMessage = 'Unable to start the batch refund job. The batch job service may be unavailable. Please try again later or contact support.';
            } else if (messageLower.includes('batchjobsubmissionfailed')) {
              errorMessage = 'Failed to submit the batch refund job. The batch job service may be experiencing issues. Please try again in a few moments or contact support if the problem persists.';
            } else if (messageLower.includes('batchjob')) {
              errorMessage = 'An error occurred while starting the batch refund job. Please try again later or contact support.';
            } else if (errorData.message.includes('Invalid request')) {
              errorMessage = 'Invalid request parameters. Please check your input and try again.';
            } else if (errorData.message.includes('eventId') || errorData.message.includes('event')) {
              errorMessage = 'Invalid event ID. Please ensure the event exists and try again.';
            } else {
              // Try to extract a more user-friendly message
              errorMessage = errorData.message.replace(/error\./g, '').replace(/Error:/g, '').trim();
              if (!errorMessage || errorMessage.length < 10) {
                errorMessage = 'An error occurred while starting the batch refund job. Please try again.';
              }
            }
          } else {
            // Use the message as-is if it looks user-friendly
            errorMessage = errorData.message;
          }
        } else if (errorData.error && typeof errorData.error === 'string') {
          // Handle error field
          const errorLower = errorData.error.toLowerCase();
          if (errorData.error.includes('error.') || errorData.error.includes('Error:') ||
              errorLower.includes('batchjob') || errorLower.includes('batch')) {
            if (errorLower.includes('batchjobhttperror') || errorLower.includes('batchjobunavailable')) {
              errorMessage = 'Unable to start the batch refund job. The batch job service may be unavailable. Please try again later or contact support.';
            } else if (errorLower.includes('batchjobsubmissionfailed')) {
              errorMessage = 'Failed to submit the batch refund job. The batch job service may be experiencing issues. Please try again in a few moments or contact support if the problem persists.';
            } else if (errorLower.includes('batchjob')) {
              errorMessage = 'An error occurred while starting the batch refund job. Please try again later or contact support.';
            } else {
              errorMessage = errorData.error.replace(/error\./g, '').replace(/Error:/g, '').trim();
              if (!errorMessage || errorMessage.length < 10) {
                errorMessage = 'An error occurred while starting the batch refund job. Please try again.';
              }
            }
          } else {
            errorMessage = errorData.error;
          }
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch refund job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch refund job service not found. Please contact support.';
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        }
      } catch (parseError) {
        // If JSON parsing fails, use status-based error messages
        if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch refund job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch refund job service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else {
          errorMessage = `Failed to trigger batch refund job (${response.status}). Please try again.`;
        }
      }

      throw new Error(errorMessage);
    }

    // Parse and return response (should be 202 Accepted)
    const data: StripeTicketBatchRefundResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[triggerStripeTicketBatchRefundServer] Error:', error);
    throw error;
  }
}