"use server";
import { stripe } from '@/lib/stripe';
import { getTenantId, getAppUrl } from '@/lib/env';
import type { EventTicketTransactionDTO } from '@/types';

const API_BASE_URL = getAppUrl();

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
  const res = await fetch(`${API_BASE_URL}/api/proxy/event-ticket-transactions/${ticket.id}`, {
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