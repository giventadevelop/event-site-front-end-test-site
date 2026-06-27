'use server';

import {
  EventTicketTransactionDTO,
  EventTicketTypeDTO,
  UserProfileDTO,
  EventAttendeeDTO,
  EventAttendeeGuestDTO,
} from '@/types';
import { getTenantId, getPaymentMethodDomainId, getAppUrl, getAppUrlFromRequestHeaders, getEmailHostUrlPrefix } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import Stripe from 'stripe';
import { getTenantSettings } from '@/lib/tenantSettingsCache';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';


let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2025-03-31.basil' });
  }
  return _stripe;
}


// Define ShoppingCartItem locally (not in @/types)
export interface ShoppingCartItem {
  ticketTypeId: string;
  name: string;
  price: number;
  quantity: number;
}

async function fetchTicketTypeByIdServer(
  id: number,
): Promise<EventTicketTypeDTO | null> {
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/event-ticket-types/${id}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch ticket type ${id} via proxy:`, errorText);
    return null;
  }
  return response.json();
}

export async function findTransactionBySessionId(
  sessionId: string,
): Promise<EventTicketTransactionDTO | null> {
  const tenantId = getTenantId();
  const params = new URLSearchParams({
    'stripeCheckoutSessionId.equals': sessionId,
    'tenantId.equals': tenantId,
  });

  const response = await fetchWithJwtRetry(
    `${await getAppUrlFromRequestHeaders()}/api/proxy/event-ticket-transactions?${params.toString()}`,
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(
      `Failed to find transaction by session ID ${sessionId}: ${error}`,
    );
    return null;
  }

  const transactions: EventTicketTransactionDTO[] = await response.json();
  return transactions.length > 0 ? transactions[0] : null;
}

export async function findTransactionByPaymentIntentId(
  paymentIntentId: string,
): Promise<EventTicketTransactionDTO | null> {
  const tenantId = getTenantId();
  const paymentMethodDomainId = getPaymentMethodDomainId();

  console.log('[findTransactionByPaymentIntentId] Starting lookup:', {
    paymentIntentId,
    tenantId,
    paymentMethodDomainId,
    timestamp: new Date().toISOString()
  });

  // CRITICAL: Query with both tenantId and paymentMethodDomainId (backend requires both for triple validation)
  const tenantParams = new URLSearchParams({
    'stripePaymentIntentId.equals': paymentIntentId,
    'tenantId.equals': tenantId,
    'paymentMethodDomainId.equals': paymentMethodDomainId, // CRITICAL: Backend requires this for lookup
  });
  const tenantUrl = `${await getAppUrlFromRequestHeaders()}/api/proxy/event-ticket-transactions?${tenantParams.toString()}`;
  console.log('[findTransactionByPaymentIntentId] Querying with tenant and paymentMethodDomainId filter:', {
    url: tenantUrl,
    paymentIntentId,
    tenantId,
    paymentMethodDomainId
  });

  const tenantResponse = await fetchWithJwtRetry(tenantUrl);
  console.log('[findTransactionByPaymentIntentId] Tenant filter response:', {
    status: tenantResponse.status,
    ok: tenantResponse.ok,
    timestamp: new Date().toISOString()
  });

  if (tenantResponse.ok) {
    const tenantItems: EventTicketTransactionDTO[] = await tenantResponse.json();
    console.log('[findTransactionByPaymentIntentId] Tenant filter results:', {
      itemCount: tenantItems.length,
      hasItems: tenantItems.length > 0,
      firstItemId: tenantItems[0]?.id,
      timestamp: new Date().toISOString()
    });
    if (tenantItems.length > 0) {
      console.log('[findTransactionByPaymentIntentId] ✅ Found transaction with tenant filter:', tenantItems[0].id);
      return tenantItems[0];
    }
  } else {
    const errorText = await tenantResponse.text();
    console.warn('[findTransactionByPaymentIntentId] Tenant filter query failed:', {
      status: tenantResponse.status,
      errorText,
      timestamp: new Date().toISOString()
    });
  }

  // CRITICAL: If not found with tenant filter, check WITHOUT tenant filter but WITH paymentMethodDomainId
  // This detects cross-tenant duplicates caused by database constraint violations
  // The database constraint 'unique_stripe_payment_intent' is global (not per-tenant)
  // So if a transaction exists for another tenant, we need to detect it
  // However, we still include paymentMethodDomainId to ensure we're looking at the correct payment method domain
  const globalParams = new URLSearchParams({
    'stripePaymentIntentId.equals': paymentIntentId,
    'paymentMethodDomainId.equals': paymentMethodDomainId, // Include paymentMethodDomainId even for global check
  });
  const globalUrl = `${await getAppUrlFromRequestHeaders()}/api/proxy/event-ticket-transactions?${globalParams.toString()}`;
  console.log('[findTransactionByPaymentIntentId] Querying without tenant filter but with paymentMethodDomainId (global check):', {
    url: globalUrl,
    paymentIntentId,
    paymentMethodDomainId,
    note: 'Checking for cross-tenant duplicates within same payment method domain'
  });

  const globalResponse = await fetchWithJwtRetry(globalUrl);
  console.log('[findTransactionByPaymentIntentId] Global filter response:', {
    status: globalResponse.status,
    ok: globalResponse.ok,
    timestamp: new Date().toISOString()
  });

  if (globalResponse.ok) {
    const globalItems: EventTicketTransactionDTO[] = await globalResponse.json();
    console.log('[findTransactionByPaymentIntentId] Global filter results:', {
      itemCount: globalItems.length,
      hasItems: globalItems.length > 0,
      firstItemId: globalItems[0]?.id,
      firstItemTenantId: globalItems[0]?.tenantId,
      timestamp: new Date().toISOString()
    });
    if (globalItems.length > 0) {
      const existingTransaction = globalItems[0];
      console.warn('[findTransactionByPaymentIntentId] ⚠️ Found transaction for different tenant:', {
        paymentIntentId,
        configuredTenantId: tenantId,
        existingTransactionTenantId: existingTransaction.tenantId,
        existingTransactionId: existingTransaction.id,
        message: 'Transaction exists for different tenant - database constraint will prevent duplicate creation',
        note: 'This indicates a webhook may have created transaction for wrong tenant, or cross-tenant payment intent reuse'
      });
      // Return the existing transaction to prevent duplicate creation attempt
      // The database constraint will fail anyway, so return existing to avoid error
      return existingTransaction;
    }
  } else {
    const errorText = await globalResponse.text();
    console.warn('[findTransactionByPaymentIntentId] Global filter query failed:', {
      status: globalResponse.status,
      errorText,
      timestamp: new Date().toISOString()
    });
  }

  console.log('[findTransactionByPaymentIntentId] ❌ No transaction found:', {
    paymentIntentId,
    tenantId,
    timestamp: new Date().toISOString(),
    note: 'Transaction may not exist yet (webhook may still be processing)'
  });
  return null;
}

// Create a new transaction (POST)
async function createTransaction(transactionData: Omit<EventTicketTransactionDTO, 'id'>): Promise<EventTicketTransactionDTO> {
  // Import environment variable helpers
  const { getTenantId, getPaymentMethodDomainId } = await import('@/lib/env');

  // Get triple validation values from environment variables
  // CRITICAL: getPaymentMethodDomainId() throws if not set - this ensures we fail fast
  console.log('[MOBILE-WORKFLOW] [createTransaction] Reading environment variables...');
  console.log('[MOBILE-WORKFLOW] [createTransaction] Environment check BEFORE reading:', {
    AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
    NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
    AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
    NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
    timestamp: new Date().toISOString()
  });

  let expectedTenantId: string;
  try {
    expectedTenantId = getTenantId();
    console.log('[MOBILE-WORKFLOW] [createTransaction] ✅ Tenant ID retrieved:', {
      tenantId: expectedTenantId,
      hasValue: !!expectedTenantId,
      length: expectedTenantId?.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: getTenantId() failed:', error);
    throw error;
  }

  let expectedPaymentMethodDomainId: string;
  try {
    expectedPaymentMethodDomainId = getPaymentMethodDomainId();
    console.log('[MOBILE-WORKFLOW] [createTransaction] ✅ Payment Method Domain ID retrieved:', {
      paymentMethodDomainId: expectedPaymentMethodDomainId,
      hasValue: !!expectedPaymentMethodDomainId,
      length: expectedPaymentMethodDomainId?.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
    console.error('[MOBILE-WORKFLOW] [createTransaction] Environment check:', {
      AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    });
    throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID. Cannot create transaction without Payment Method Domain ID.`);
  }

  // CRITICAL: Validate transactionData tenantId matches environment variable BEFORE backend call
  console.log('[MOBILE-WORKFLOW] [createTransaction] Validating transactionData tenant ID:', {
    transactionDataTenantId: transactionData.tenantId,
    expectedTenantId,
    match: transactionData.tenantId === expectedTenantId,
    timestamp: new Date().toISOString()
  });
  const transactionTenantId = transactionData.tenantId;
  if (transactionTenantId && transactionTenantId !== expectedTenantId) {
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
      transactionTenantId,
      expectedTenantId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Tenant ID mismatch: Transaction has tenantId=${transactionTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
  }

  // CRITICAL: Validate transactionData paymentMethodDomainId matches environment variable BEFORE backend call
  console.log('[MOBILE-WORKFLOW] [createTransaction] Validating transactionData paymentMethodDomainId:', {
    transactionDataPaymentMethodDomainId: transactionData.paymentMethodDomainId,
    expectedPaymentMethodDomainId,
    match: transactionData.paymentMethodDomainId === expectedPaymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
  const transactionPaymentMethodDomainId = transactionData.paymentMethodDomainId;
  if (transactionPaymentMethodDomainId && transactionPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
      transactionPaymentMethodDomainId,
      expectedPaymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Payment Method Domain ID mismatch: Transaction has paymentMethodDomainId=${transactionPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
  }

  // Add triple validation fields to payload (use environment variables, not transactionData values)
  // Backend will validate the combination (tenantId, paymentMethodDomainId, webhookSecret) exists
  // CRITICAL: Explicitly set paymentMethodDomainId to ensure it's never null or undefined
  console.log('[MOBILE-WORKFLOW] [createTransaction] Building final payload with environment variables...');
  const payload = {
    ...transactionData,
    tenantId: expectedTenantId, // ALWAYS use environment tenant ID - ignore any tenantId from transactionData
    paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID - NEVER null/undefined
  };

  console.log('[MOBILE-WORKFLOW] [createTransaction] Final payload built:', {
    tenantId: payload.tenantId,
    paymentMethodDomainId: payload.paymentMethodDomainId,
    email: payload.email,
    stripePaymentIntentId: payload.stripePaymentIntentId,
    eventId: payload.eventId,
    timestamp: new Date().toISOString()
  });

  // CRITICAL: Double-check that paymentMethodDomainId is set before sending
  if (!payload.paymentMethodDomainId) {
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: paymentMethodDomainId is missing from payload:', {
      payloadTenantId: payload.tenantId,
      payloadPaymentMethodDomainId: payload.paymentMethodDomainId,
      expectedPaymentMethodDomainId,
      payloadKeys: Object.keys(payload),
      timestamp: new Date().toISOString()
    });
    throw new Error(`Payment Method Domain ID is missing from payload. Cannot create transaction without Payment Method Domain ID.`);
  }

  // CRITICAL: Double-check that tenantId is set correctly
  if (payload.tenantId !== expectedTenantId) {
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ CRITICAL ERROR: payload tenantId does not match expected:', {
      payloadTenantId: payload.tenantId,
      expectedTenantId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Tenant ID mismatch: Payload has tenantId=${payload.tenantId} but expected ${expectedTenantId}.`);
  }

  console.log('[MOBILE-WORKFLOW] [createTransaction] ✅ Triple validation passed, sending transaction with validated fields:', {
    tenantId: payload.tenantId,
    paymentMethodDomainId: payload.paymentMethodDomainId,
    hasWebhookSecret: false, // Not passed from frontend - backend looks it up
    timestamp: new Date().toISOString()
  });

  console.log('[MOBILE-WORKFLOW] [createTransaction] Full payload being sent to backend:', JSON.stringify({
    tenantId: payload.tenantId,
    paymentMethodDomainId: payload.paymentMethodDomainId,
    email: payload.email,
    stripePaymentIntentId: payload.stripePaymentIntentId,
    eventId: payload.eventId,
    totalAmount: payload.totalAmount,
    status: payload.status,
    // Include all other fields but truncate long values
  }, null, 2));

  const backendUrl = `${await getAppUrlFromRequestHeaders()}/api/proxy/event-ticket-transactions`;
  console.log('[MOBILE-WORKFLOW] [createTransaction] Backend URL:', backendUrl);
  console.log('[MOBILE-WORKFLOW] [createTransaction] About to call fetchWithJwtRetry...');

  const response = await fetchWithJwtRetry(
    backendUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  console.log('[MOBILE-WORKFLOW] [createTransaction] Response received:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    timestamp: new Date().toISOString()
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[MOBILE-WORKFLOW] [createTransaction] ⚠️⚠️⚠️ Failed to create transaction:', {
      status: response.status,
      statusText: response.statusText,
      errorBody,
      payloadTenantId: payload.tenantId,
      payloadPaymentMethodDomainId: payload.paymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to create transaction: ${errorBody}`);
  }

  const result = await response.json();
  console.log('[MOBILE-WORKFLOW] [createTransaction] ✅ Transaction created successfully, response:', {
    transactionId: result.id,
    tenantId: result.tenantId,
    paymentMethodDomainId: result.paymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
  return result;
}

// Helper to bulk create transaction items
async function createTransactionItemsBulk(items: any[]): Promise<any[]> {
  const baseUrl = await getAppUrlFromRequestHeaders();

  // Import environment variable helpers
  const { getTenantId, getPaymentMethodDomainId } = await import('@/lib/env');

  // Get triple validation values from environment variables
  // CRITICAL: getPaymentMethodDomainId() throws if not set - this ensures we fail fast
  const expectedTenantId = getTenantId();
  let expectedPaymentMethodDomainId: string;
  try {
    expectedPaymentMethodDomainId = getPaymentMethodDomainId();
    console.log('[createTransactionItemsBulk] ✅ Payment Method Domain ID retrieved:', {
      paymentMethodDomainId: expectedPaymentMethodDomainId,
      hasValue: !!expectedPaymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[createTransactionItemsBulk] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
    console.error('[createTransactionItemsBulk] Environment check:', {
      AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    });
    throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID. Cannot create transaction items without Payment Method Domain ID.`);
  }

  // CRITICAL: Validate each item's tenantId and paymentMethodDomainId match environment variables BEFORE backend call
  for (const item of items) {
    const itemTenantId = item.tenantId;
    if (itemTenantId && itemTenantId !== expectedTenantId) {
      console.error('[createTransactionItemsBulk] ⚠️⚠️⚠️ TENANT ID MISMATCH in item - Rejecting request:', {
        itemTenantId,
        expectedTenantId,
        transactionId: item.transactionId,
        ticketTypeId: item.ticketTypeId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Tenant ID mismatch: Item has tenantId=${itemTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
    }

    const itemPaymentMethodDomainId = item.paymentMethodDomainId;
    if (itemPaymentMethodDomainId && itemPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
      console.error('[createTransactionItemsBulk] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH in item - Rejecting request:', {
        itemPaymentMethodDomainId,
        expectedPaymentMethodDomainId,
        transactionId: item.transactionId,
        ticketTypeId: item.ticketTypeId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Payment Method Domain ID mismatch: Item has paymentMethodDomainId=${itemPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
    }
  }

  // Add triple validation fields to each item (use environment variables, not item values)
  // Backend will validate the combination (tenantId, paymentMethodDomainId, webhookSecret) exists
  // CRITICAL: Explicitly set paymentMethodDomainId to ensure it's never null or undefined
  const payload = items.map(item => ({
    ...item,
    tenantId: expectedTenantId, // ALWAYS use environment tenant ID - ignore any tenantId from item
    paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID - NEVER null/undefined
  }));

  // CRITICAL: Double-check that paymentMethodDomainId is set in all items before sending
  for (const item of payload) {
    if (!item.paymentMethodDomainId) {
      console.error('[createTransactionItemsBulk] ⚠️⚠️⚠️ CRITICAL ERROR: paymentMethodDomainId is missing from item:', {
        item,
        expectedPaymentMethodDomainId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Payment Method Domain ID is missing from transaction item. Cannot create transaction items without Payment Method Domain ID.`);
    }
  }

  console.log('[createTransactionItemsBulk] ✅ Triple validation passed, sending transaction items with validated fields:', {
    itemCount: payload.length,
    tenantId: payload[0]?.tenantId,
    paymentMethodDomainId: payload[0]?.paymentMethodDomainId,
    hasWebhookSecret: false, // Not passed from frontend - backend looks it up
  });

  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/event-ticket-transaction-items/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // Use payload with triple validation fields
    }
  );
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to bulk create transaction items:', response.status, errorBody);
    throw new Error(`Failed to bulk create transaction items: ${errorBody}`);
  }
  return response.json();
}

// Utility to omit id from an object
function omitId<T extends object>(obj: T): Omit<T, 'id'> {
  const { id, ...rest } = obj as any;
  return rest;
}

// Utility to fetch Stripe fee for a paymentIntentId
async function fetchStripeFeeAmount(paymentIntentId: string): Promise<number | null> {
  try {
    // Retrieve the PaymentIntent and expand charges
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId, { expand: ['charges'] });
    const charges = (paymentIntent as any).charges;
    const charge = (charges && Array.isArray(charges.data)) ? charges.data[0] : undefined;
    if (charge && charge.balance_transaction) {
      const balanceTx = await getStripe().balanceTransactions.retrieve(charge.balance_transaction as string);
      if (balanceTx && typeof balanceTx.fee === 'number') {
        return balanceTx.fee / 100;
      }
    }
    return null;
  } catch (err) {
    console.error('[fetchStripeFeeAmount] Error fetching Stripe fee:', err);
    return null;
  }
}

export async function processStripeSessionServer(
  sessionId: string,
  clerkUserInfo?: {
    userId?: string;
    email?: string;
    name?: string;
    phone?: string;
    imageUrl?: string;
  }
): Promise<{ transaction: any, userProfile: any, attendee: any } | null> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'customer'],
    });

    if (
      session.payment_status !== 'paid' ||
      !session.payment_intent ||
      !session.metadata
    ) {
      console.error(
        'Stripe session not paid or missing essential data.',
        session,
      );
      return null;
    }

    // CRITICAL: Check if transaction already exists (backend webhook may have created it)
    // This prevents duplicate transactions and transaction items
    const paymentIntentId = session.payment_intent as string;
    const existingTransaction = await findTransactionByPaymentIntentId(paymentIntentId);

    if (existingTransaction) {
      console.log('[processStripeSessionServer] Transaction already exists for Payment Intent:', {
        paymentIntentId,
        existingTransactionId: existingTransaction.id,
        existingQrCodeUrl: existingTransaction.qrCodeImageUrl || 'NULL',
        hasFirstName: !!existingTransaction.firstName,
        hasLastName: !!existingTransaction.lastName,
        hasPhone: !!existingTransaction.phone,
        timestamp: new Date().toISOString(),
        message: 'Backend webhook already created transaction - returning existing transaction'
      });

      // Return existing transaction - do NOT create duplicate transaction or items
      // Backend webhook handles all transaction and item creation
      return { transaction: existingTransaction, userProfile: null, attendee: null };
    }

    const cart: ShoppingCartItem[] = JSON.parse(session.metadata.cart || '[]');
    const eventId = parseInt(session.metadata.eventId, 10);
    if (!eventId || cart.length === 0) {
      throw new Error('Invalid metadata in Stripe session.');
    }

    const totalQuantity = cart.reduce(
      (acc: number, item: ShoppingCartItem) => acc + (item.quantity || 0),
      0,
    );
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
    const now = new Date().toISOString();

    // Stripe details (type-safe)
    const totalDetails = session.total_details || {};
    const stripeAmountDiscount = (totalDetails as any).amount_discount ? (totalDetails as any).amount_discount / 100 : 0;
    const stripeAmountTax = (totalDetails as any).amount_tax ? (totalDetails as any).amount_tax / 100 : 0;

    // Build transaction DTO (flat fields, all required fields, all stripe fields)
    let transactionData: Omit<EventTicketTransactionDTO, 'id'> = withTenantId({
      email: session.customer_details?.email || session.customer_email || '',
      firstName: '',
      lastName: '',
      phone: session.customer_details?.phone || '',
      quantity: totalQuantity,
      pricePerUnit: totalQuantity > 0 ? amountTotal / totalQuantity : 0,
      totalAmount: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
      taxAmount: stripeAmountTax,
      platformFeeAmount: undefined, // Will be set below
      netAmount: undefined, // Add if you have this info
      discountCodeId: session.metadata.discountCodeId ? parseInt(session.metadata.discountCodeId, 10) : undefined,
      discountAmount: stripeAmountDiscount,
      finalAmount: amountTotal, // Will be set below
      status: 'COMPLETED',
      paymentMethod: session.payment_method_types?.[0] || undefined,
      paymentReference: session.payment_intent as string,
      purchaseDate: now,
      confirmationSentAt: undefined,
      refundAmount: undefined,
      refundDate: undefined,
      refundReason: undefined,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCustomerId: session.customer as string,
      stripePaymentStatus: session.payment_status,
      stripeCustomerEmail: session.customer_details?.email ?? undefined,
      stripePaymentCurrency: session.currency || 'usd',
      stripeAmountDiscount,
      stripeAmountTax,
      eventId: eventId,
      userId: undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Parse name from Stripe customer details
    const customerName = session.customer_details?.name || '';
    if (customerName) {
      const nameParts = customerName.trim().split(' ');
      if (nameParts.length > 0) {
        transactionData.firstName = nameParts[0];
        transactionData.lastName = nameParts.slice(1).join(' ') || '';
      }
    }

    // Stripe fee will be set by the webhook after charge.succeeded
    let stripeFeeAmount = 0;

    // --- PLATFORM FEE CALCULATION ---
    const tenantId = getTenantId();
    const tenantSettings = await getTenantSettings(tenantId);
    const platformFeePercentage = tenantSettings?.platformFeePercentage || 0;
    const totalAmount = typeof transactionData.totalAmount === 'number' ? transactionData.totalAmount : 0;
    const platformFeeAmount = Number(((totalAmount * platformFeePercentage) / 100).toFixed(2));
    (transactionData as any).platformFeeAmount = platformFeeAmount;
    (transactionData as any).stripeFeeAmount = stripeFeeAmount;
    // Use the actual final amount from Stripe session (after discount)
    (transactionData as any).finalAmount = amountTotal;
    // --- END PLATFORM FEE CALCULATION ---

    console.log('[DEBUG] Outgoing transactionData payload:', JSON.stringify(transactionData, null, 2));
    console.log('[DEBUG] finalAmount being sent to backend:', transactionData.finalAmount);

    // Create the main transaction (omit id if present)
    const newTransaction = await createTransaction(omitId(transactionData));

    console.log('[DEBUG] Transaction created with finalAmount:', newTransaction.finalAmount);

    // If the backend overrode our finalAmount, log a warning
    if (newTransaction.finalAmount !== transactionData.finalAmount) {
      console.warn('[ServerAction] WARNING: Backend overrode finalAmount from', transactionData.finalAmount, 'to', newTransaction.finalAmount);
      console.warn('[ServerAction] This indicates the backend is recalculating finalAmount instead of preserving the Stripe amount.');
    }

    // Bulk create transaction items
    // CRITICAL: Check if transaction items already exist before creating (prevent duplicates)
    // Backend webhook may have already created items
    if (!newTransaction.id) {
      throw new Error('Transaction ID missing after creation');
    }

    // CRITICAL: Enhanced idempotency check - verify items don't exist for this transaction
    // Check each cart item individually to prevent duplicates even if partial items exist
    // IMPORTANT: This check is NOT atomic - backend should enforce uniqueness at DB level
    const baseUrl = await getAppUrlFromRequestHeaders();
    const itemsCheckUrl = `${baseUrl}/api/proxy/event-ticket-transaction-items?transactionId.equals=${newTransaction.id}&tenantId.equals=${getTenantId()}`;

    // Retry logic to handle race conditions: check multiple times with small delay
    let existingItems: any[] = [];
    const maxRetries = 3;
    for (let retry = 0; retry < maxRetries; retry++) {
      if (retry > 0) {
        // Small delay between retries to allow concurrent requests to complete
        await new Promise(resolve => setTimeout(resolve, 100 * retry));
      }

      const itemsCheckRes = await fetchWithJwtRetry(itemsCheckUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' // Ensure fresh data on every check
      });

      if (itemsCheckRes.ok) {
        const itemsData = await itemsCheckRes.json();
        existingItems = Array.isArray(itemsData) ? itemsData : [];
        // If we found items, break early (no need to retry)
        if (existingItems.length > 0) break;
      } else {
        console.warn(`[processStripeSessionServer] Failed to check existing items (attempt ${retry + 1}/${maxRetries}):`, itemsCheckRes.status, itemsCheckRes.statusText);
      }
    }

    console.log('[processStripeSessionServer] Transaction items check:', {
      transactionId: newTransaction.id,
      existingItemsCount: existingItems.length,
      existingItems: existingItems.map(item => ({ id: item.id, ticketTypeId: item.ticketTypeId, quantity: item.quantity })),
      cartItemsCount: cart.length
    });

    // Filter out items that already exist (by transactionId + ticketTypeId combination)
    const itemsToCreate: ShoppingCartItem[] = [];
    for (const cartItem of cart) {
      const ticketTypeId = parseInt(cartItem.ticketTypeId, 10);
      const existingItem = existingItems.find(
        (item: any) => item.ticketTypeId === ticketTypeId && item.transactionId === newTransaction.id
      );

      if (!existingItem) {
        itemsToCreate.push(cartItem);
        console.log('[processStripeSessionServer] Item needs to be created:', {
          ticketTypeId,
          quantity: cartItem.quantity
        });
      } else {
        console.log('[processStripeSessionServer] Item already exists - skipping:', {
          ticketTypeId,
          existingItemId: existingItem.id,
          existingQuantity: existingItem.quantity
        });
      }
    }

    // Only create items that don't already exist
    if (itemsToCreate.length > 0) {
      console.log('[processStripeSessionServer] Creating transaction items (none exist yet for these ticket types):', itemsToCreate.length);
      const itemsPayload = itemsToCreate.map((item: ShoppingCartItem) => withTenantId({
        transactionId: newTransaction.id as number,
        ticketTypeId: parseInt(item.ticketTypeId, 10),
        quantity: item.quantity,
        pricePerUnit: item.price,
        totalAmount: item.price * item.quantity,
        // Add discountAmount, serviceFee, etc. if available
        createdAt: now,
        updatedAt: now,
      }));
      await createTransactionItemsBulk(itemsPayload);
      console.log('[processStripeSessionServer] Successfully created transaction items:', itemsPayload.length);
    } else if (existingItems.length > 0) {
      console.log('[processStripeSessionServer] All transaction items already exist - skipping creation to prevent duplicates');
    } else {
      console.log('[processStripeSessionServer] No cart items to create transaction items for');
    }

    // --- Event Attendee Upsert Logic ---
    // Look up attendee by email and eventId
    const attendeeLookupParams = new URLSearchParams({
      'email.equals': transactionData.email,
      'eventId.equals': String(eventId),
      'tenantId.equals': getTenantId(),
    });
    const attendeeLookupRes = await fetchWithJwtRetry(
      `${await getAppUrlFromRequestHeaders()}/api/proxy/event-attendees?${attendeeLookupParams.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    let attendee = null;
    if (attendeeLookupRes.ok) {
      const attendees = await attendeeLookupRes.json();
      if (Array.isArray(attendees) && attendees.length > 0) {
        attendee = attendees[0];
      }
    }
    if (!attendee) {
      // Insert new attendee
      const attendeePayload = withTenantId({
        firstName: transactionData.firstName,
        lastName: transactionData.lastName,
        email: transactionData.email,
        phone: transactionData.phone,
        eventId: eventId,
        registrationStatus: 'REGISTERED',
        registrationDate: now,
        createdAt: now,
        updatedAt: now,
      });
      const attendeeInsertRes = await fetchWithJwtRetry(
        `${await getAppUrlFromRequestHeaders()}/api/proxy/event-attendees`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attendeePayload),
        }
      );
      if (attendeeInsertRes.ok) {
        attendee = await attendeeInsertRes.json();
      } else {
        const errorBody = await attendeeInsertRes.text();
        console.error('Failed to insert event attendee:', attendeeInsertRes.status, errorBody);
      }
    }
    // --- End Event Attendee Upsert Logic ---

    // --- Create/Update User Profile with Correct Name Data ---
    // Create or update user profile with the parsed name data from transaction
    try {
      const tenantId = getTenantId();
      const now = new Date().toISOString();

      // Determine userId - use Clerk userId if available, otherwise create guest userId
      let userId = session.metadata?.userId;
      if (!userId) {
        // For guest users, create a guest userId
        userId = `guest_${transactionData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }

      // Look up existing user profile by userId or email
      let existingProfile = null;
      if (userId) {
        const userProfileParams = new URLSearchParams({
          'userId.equals': userId,
          'tenantId.equals': tenantId,
        });
        const userProfileRes = await fetchWithJwtRetry(
          `${await getAppUrlFromRequestHeaders()}/api/proxy/user-profiles?${userProfileParams.toString()}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        if (userProfileRes.ok) {
          const userProfiles = await userProfileRes.json();
          if (Array.isArray(userProfiles) && userProfiles.length > 0) {
            existingProfile = userProfiles[0];
          }
        }
      }

      // If not found by userId, try by email
      if (!existingProfile) {
        const emailParams = new URLSearchParams({
          'email.equals': transactionData.email,
          'tenantId.equals': tenantId,
        });
        const emailRes = await fetchWithJwtRetry(
          `${await getAppUrlFromRequestHeaders()}/api/proxy/user-profiles?${emailParams.toString()}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        if (emailRes.ok) {
          const userProfiles = await emailRes.json();
          if (Array.isArray(userProfiles) && userProfiles.length > 0) {
            existingProfile = userProfiles[0];
          }
        }
      }

      // Create or update user profile with correct name data
      const userProfileData = {
        userId,
        email: transactionData.email,
        firstName: transactionData.firstName,
        lastName: transactionData.lastName,
        phone: transactionData.phone,
        createdAt: now,
        updatedAt: now,
        tenantId,
        userStatus: 'ACTIVE',
        userRole: 'MEMBER',
      };

      if (existingProfile) {
        // Update existing profile
        const updatedProfile = {
          ...existingProfile,
          firstName: transactionData.firstName,
          lastName: transactionData.lastName,
          email: transactionData.email,
          phone: transactionData.phone,
          updatedAt: now,
        };

        const updateRes = await fetchWithJwtRetry(
          `${await getAppUrlFromRequestHeaders()}/api/proxy/user-profiles/${existingProfile.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile),
          }
        );

        if (updateRes.ok) {
          console.log('[ServerAction] Successfully updated user profile with transaction data:', existingProfile.id);
        } else {
          console.error('[ServerAction] Failed to update user profile:', await updateRes.text());
        }
      } else {
        // Create new profile
        const createRes = await fetchWithJwtRetry(
          `${await getAppUrlFromRequestHeaders()}/api/proxy/user-profiles`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userProfileData),
          }
        );

        if (createRes.ok) {
          console.log('[ServerAction] Successfully created user profile with transaction data');
        } else {
          console.error('[ServerAction] Failed to create user profile:', await createRes.text());
        }
      }
    } catch (error) {
      console.error('[ServerAction] Error creating/updating user profile:', error);
    }
    // --- End Create/Update User Profile Logic ---

    // After creation, fetch the Stripe fee and PATCH the transaction (single attempt, no retry)
    /* if (newTransaction && newTransaction.id && session.payment_intent) {
      stripeFeeAmount = 0;
      // Wait 4 seconds before first attempt
      await new Promise(res => setTimeout(res, 4000));
      for (let i = 0; i < 2; i++) {
        const fee = await fetchStripeFeeAmount(session.payment_intent as string);
        stripeFeeAmount = fee ?? 0;
        if (stripeFeeAmount > 0) break;
        if (i < 1) await new Promise(res => setTimeout(res, 4000));
      }
      if (stripeFeeAmount > 0) {
        const patchUrl = `${await getAppUrlFromRequestHeaders()}/api/proxy/event-ticket-transactions/${newTransaction.id}`;
        const patchRes = await fetchWithJwtRetry(patchUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/merge-patch+json' },
          body: JSON.stringify({ stripeFeeAmount }),
        });
        if (patchRes.ok) {
          console.log('[ServerAction] Successfully updated ticket transaction with stripeFeeAmount:', newTransaction.id, stripeFeeAmount);
        } else {
          const errorText = await patchRes.text();
          console.error('[ServerAction] Failed to PATCH ticket transaction with stripeFeeAmount:', newTransaction.id, errorText);
        }
      } else {
        console.warn('[ServerAction] Stripe fee not available for transaction', newTransaction.id, stripeFeeAmount);
      }
    } */

    return { transaction: newTransaction, userProfile: null, attendee };
  } catch (error) {
    console.error('Error processing Stripe session:', error);
    return null;
  }
}

export async function fetchTransactionQrCode(eventId: number, transactionId: number): Promise<{ qrCodeImageUrl: string }> {
  const baseUrl = await getAppUrlFromRequestHeaders();

  // Get the current domain/host URL prefix for email context
  const emailHostUrlPrefix = getEmailHostUrlPrefix();

  // Validate that we have a valid email host URL prefix
  if (!emailHostUrlPrefix) {
    console.error('[fetchTransactionQrCode] No emailHostUrlPrefix available');
    throw new Error('Email host URL prefix is required for QR code generation');
  }

  // Backend expects Base64 encoded emailHostUrlPrefix in URL path
  const encodedEmailHostUrlPrefix = Buffer.from(emailHostUrlPrefix).toString('base64');

  const fullApiUrl = `${baseUrl}/api/proxy/events/${eventId}/transactions/${transactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/qrcode`;

  console.log('[fetchTransactionQrCode] DETAILED QR code fetch debug:', {
    eventId: eventId,
    transactionId: transactionId,
    emailHostUrlPrefix: emailHostUrlPrefix,
    encodedEmailHostUrlPrefix: encodedEmailHostUrlPrefix,
    baseUrl: baseUrl,
    fullApiUrl: fullApiUrl,
    decodedBack: Buffer.from(encodedEmailHostUrlPrefix, 'base64').toString()
  });

  console.log('[fetchTransactionQrCode] About to call fetchWithJwtRetry with URL:', fullApiUrl);

  try {
    const response = await fetchWithJwtRetry(fullApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[fetchTransactionQrCode] Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[fetchTransactionQrCode] ERROR Response body:', errorBody);
      console.error('[fetchTransactionQrCode] Full error details:', {
        status: response.status,
        statusText: response.statusText,
        url: fullApiUrl,
        eventId,
        transactionId,
        errorBody
      });
      throw new Error(`QR code fetch failed: ${response.status} - ${errorBody}`);
    }

    // Always treat as plain text URL
    const url = await response.text();
    console.log('[fetchTransactionQrCode] SUCCESS - QR code URL received:', url);
    console.log('[fetchTransactionQrCode] QR URL length:', url.length);
    console.log('[fetchTransactionQrCode] QR URL starts with:', url.substring(0, 100));

    // Check for empty response from backend
    if (!url || url.trim().length === 0) {
      console.error('[fetchTransactionQrCode] CRITICAL: Backend returned empty QR URL!', {
        rawUrl: JSON.stringify(url),
        urlLength: url.length,
        eventId,
        transactionId,
        fullApiUrl: fullApiUrl,
        emailHostUrlPrefix,
        encodedEmailHostUrlPrefix
      });
      // Still return the empty string but log the critical issue
      return { qrCodeImageUrl: '' };
    }

    return { qrCodeImageUrl: url.trim() };
  } catch (error: any) {
    console.error('[fetchTransactionQrCode] EXCEPTION during QR fetch:', {
      message: error.message,
      stack: error.stack,
      eventId,
      transactionId,
      fullApiUrl
    });
    throw error;
  }
}

/**
 * Get event attendee by ID
 */
export async function getEventAttendee(attendeeId: number): Promise<EventAttendeeDTO | null> {
  try {
    const baseUrl = await getAppUrlFromRequestHeaders();
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/event-attendees/${attendeeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch event attendee: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event attendee:', error);
    return null;
  }
}

/**
 * Get event attendee guests by attendee ID
 */
export async function getEventAttendeeGuests(attendeeId: number): Promise<EventAttendeeGuestDTO[]> {
  try {
    const baseUrl = await getAppUrlFromRequestHeaders();
    const params = new URLSearchParams({ 'eventAttendeeId.equals': attendeeId.toString() });
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/event-attendee-guests?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event attendee guests: ${response.status}`);
    }

    const guests = await response.json();
    return Array.isArray(guests) ? guests : [];
  } catch (error) {
    console.error('Error fetching event attendee guests:', error);
    return [];
  }
}

/**
 * Create transaction directly from payment intent (client-side creation)
 * This handles browser-based transaction creation where browser acts as listener
 */
export async function createTransactionFromPaymentIntent(
  paymentIntentId: string,
  eventId: number,
  customerEmail: string,
  cart: { ticketTypeId: number; quantity: number }[],
  amountPaid: number,
  firstName?: string,
  lastName?: string,
  phone?: string
): Promise<EventTicketTransactionDTO> {
  console.log('[MOBILE-WORKFLOW] ============================================');
  console.log('[MOBILE-WORKFLOW] createTransactionFromPaymentIntent CALLED');
  console.log('[MOBILE-WORKFLOW] ============================================');
  console.log('[MOBILE-WORKFLOW] Input parameters:', {
    paymentIntentId,
    eventId,
    customerEmail,
    cart,
    amountPaid,
    firstName,
    lastName,
    phone,
    timestamp: new Date().toISOString()
  });

  // CRITICAL: Retrieve PaymentIntent from Stripe to validate metadata
  const { getTenantId, getPaymentMethodDomainId } = await import('@/lib/env');
  const { stripe } = await import('@/lib/stripe');

  let paymentIntent;
  try {
    paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error('[createTransactionFromPaymentIntent] Failed to retrieve PaymentIntent:', err);
    throw new Error(`Failed to retrieve PaymentIntent: ${err instanceof Error ? err.message : String(err)}`);
  }

  // CRITICAL: Extract tenantId and paymentMethodDomainId from PaymentIntent metadata
  const metadata = paymentIntent.metadata || {};
  const metadataTenantId = metadata.tenantId || metadata.tenant_id;
  const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;

  // Get triple validation values from environment variables
  // CRITICAL: getPaymentMethodDomainId() throws if not set - this ensures we fail fast
  console.log('[MOBILE-WORKFLOW] Reading environment variables...');
  console.log('[MOBILE-WORKFLOW] Environment variable check BEFORE reading:', {
    AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
    NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? `SET (${process.env.NEXT_PUBLIC_TENANT_ID.substring(0, 20)}...)` : 'NOT SET',
    AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
    NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? `SET (${process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID.substring(0, 20)}...)` : 'NOT SET',
    timestamp: new Date().toISOString()
  });

  let expectedTenantId: string;
  try {
    expectedTenantId = getTenantId();
    console.log('[MOBILE-WORKFLOW] ✅ Tenant ID retrieved from environment:', {
      tenantId: expectedTenantId,
      hasValue: !!expectedTenantId,
      length: expectedTenantId?.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: getTenantId() failed:', error);
    console.error('[MOBILE-WORKFLOW] Environment check:', {
      AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    });
    throw new Error(`NEXT_PUBLIC_TENANT_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_TENANT_ID or NEXT_PUBLIC_TENANT_ID. Cannot create transaction without Tenant ID.`);
  }

  let expectedPaymentMethodDomainId: string;
  try {
    expectedPaymentMethodDomainId = getPaymentMethodDomainId();
    console.log('[MOBILE-WORKFLOW] ✅ Payment Method Domain ID retrieved from environment:', {
      paymentMethodDomainId: expectedPaymentMethodDomainId,
      hasValue: !!expectedPaymentMethodDomainId,
      length: expectedPaymentMethodDomainId?.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
    console.error('[createTransactionFromPaymentIntent] Environment check:', {
      AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    });
    throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID. Cannot create transaction without Payment Method Domain ID.`);
  }

  // CRITICAL: Validate metadata matches environment variables BEFORE making backend calls
  if (metadataTenantId && metadataTenantId !== expectedTenantId) {
    console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
      metadataTenantId,
      expectedTenantId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Tenant ID mismatch: Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`);
  }

  if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
    console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
      metadataPaymentMethodDomainId,
      expectedPaymentMethodDomainId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Payment Method Domain ID mismatch: Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`);
  }

  // Log successful validation
  if (metadataTenantId && metadataPaymentMethodDomainId) {
    console.log('[createTransactionFromPaymentIntent] ✅ Triple validation passed:', {
      tenantId: metadataTenantId,
      paymentMethodDomainId: metadataPaymentMethodDomainId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn('[createTransactionFromPaymentIntent] ⚠️ Missing metadata fields (will use environment variables):', {
      hasTenantId: !!metadataTenantId,
      hasPaymentMethodDomainId: !!metadataPaymentMethodDomainId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
  }

  // CRITICAL: Check if transaction already exists before creating (prevent duplicates)
  const existingTransaction = await findTransactionByPaymentIntentId(paymentIntentId);
  if (existingTransaction) {
    console.log('[createTransactionFromPaymentIntent] Transaction already exists for Payment Intent:', {
      paymentIntentId,
      existingTransactionId: existingTransaction.id,
      existingQrCodeUrl: existingTransaction.qrCodeImageUrl || 'NULL',
      timestamp: new Date().toISOString()
    });

    // Return existing transaction instead of creating duplicate
    return existingTransaction;
  }

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const now = new Date().toISOString();

  // Fetch Stripe fee
  let stripeFeeAmount = null;
  try {
    stripeFeeAmount = await fetchStripeFeeAmount(paymentIntentId);
  } catch (err) {
    console.error('[createTransactionFromPaymentIntent] Failed to fetch Stripe fee:', err);
  }

  // Build transaction data
  // CRITICAL: ALWAYS use environment variable for paymentMethodDomainId (never use metadata)
  // This ensures consistent tenant filtering - reject if metadata doesn't match, but always use environment variable
  // If metadata doesn't match, we've already rejected above, so we can safely use environment variable here
  const finalPaymentMethodDomainId = expectedPaymentMethodDomainId;

  console.log('[createTransactionFromPaymentIntent] Setting paymentMethodDomainId (ALWAYS from environment):', {
    fromMetadata: metadataPaymentMethodDomainId,
    fromEnvironment: expectedPaymentMethodDomainId,
    finalValue: finalPaymentMethodDomainId,
    usingEnvironmentVariable: true, // Always use environment variable for consistency
    paymentIntentId,
    timestamp: new Date().toISOString()
  });

  // CRITICAL: Verify withTenantId() returns the correct tenant ID from environment variable
  const tenantIdFromHelper = getTenantId();
  if (tenantIdFromHelper !== expectedTenantId) {
    console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: getTenantId() returned wrong tenant ID:', {
      tenantIdFromHelper,
      expectedTenantId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Tenant ID mismatch: getTenantId() returned ${tenantIdFromHelper} but expected ${expectedTenantId}. Environment variable mismatch.`);
  }

  const transactionData: Omit<EventTicketTransactionDTO, 'id'> = withTenantId({
    email: customerEmail,
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || '',
    quantity: totalQuantity,
    pricePerUnit: totalQuantity > 0 ? amountPaid / totalQuantity : 0,
    totalAmount: amountPaid,
    taxAmount: 0,
    platformFeeAmount: stripeFeeAmount || undefined,
    netAmount: stripeFeeAmount ? amountPaid - stripeFeeAmount : undefined,
    discountCodeId: undefined,
    discountAmount: 0,
    finalAmount: amountPaid,
    status: 'COMPLETED',
    paymentMethod: 'card', // Mobile payments are card-based
    paymentReference: paymentIntentId,
    purchaseDate: now,
    confirmationSentAt: undefined,
    refundAmount: undefined,
    refundDate: undefined,
    refundReason: undefined,
    stripeCheckoutSessionId: undefined, // No session for direct payment intent
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId: undefined,
    stripePaymentStatus: 'paid',
    stripeCustomerEmail: customerEmail,
    stripePaymentCurrency: 'usd',
    stripeAmountDiscount: 0,
    stripeAmountTax: 0,
    eventId,
    userId: undefined,
    createdAt: now,
    updatedAt: now,
    // CRITICAL: Always set paymentMethodDomainId - ALWAYS use environment variable (never use metadata)
    // Metadata is validated above, but we always use environment variable for consistency
    paymentMethodDomainId: finalPaymentMethodDomainId,
  });

  // CRITICAL: Verify transactionData has correct tenant ID (from withTenantId)
  console.log('[MOBILE-WORKFLOW] Verifying transactionData tenant ID:', {
    transactionDataTenantId: transactionData.tenantId,
    expectedTenantId,
    match: transactionData.tenantId === expectedTenantId,
    timestamp: new Date().toISOString()
  });
  if (transactionData.tenantId !== expectedTenantId) {
    console.error('[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: transactionData has wrong tenant ID:', {
      transactionDataTenantId: transactionData.tenantId,
      expectedTenantId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Tenant ID mismatch: transactionData has tenantId=${transactionData.tenantId} but expected ${expectedTenantId}. withTenantId() returned wrong value.`);
  }

  // CRITICAL: Verify transactionData has paymentMethodDomainId set
  console.log('[MOBILE-WORKFLOW] Verifying transactionData paymentMethodDomainId:', {
    transactionDataPaymentMethodDomainId: transactionData.paymentMethodDomainId,
    expectedPaymentMethodDomainId,
    hasValue: !!transactionData.paymentMethodDomainId,
    match: transactionData.paymentMethodDomainId === expectedPaymentMethodDomainId,
    timestamp: new Date().toISOString()
  });
  if (!transactionData.paymentMethodDomainId) {
    console.error('[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: transactionData missing paymentMethodDomainId:', {
      transactionDataKeys: Object.keys(transactionData),
      transactionDataTenantId: transactionData.tenantId,
      expectedPaymentMethodDomainId,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Payment Method Domain ID is missing from transactionData. Cannot create transaction without Payment Method Domain ID.`);
  }

  console.log('[MOBILE-WORKFLOW] Transaction data prepared BEFORE calling createTransaction():', {
    tenantId: transactionData.tenantId,
    paymentMethodDomainId: transactionData.paymentMethodDomainId,
    email: transactionData.email,
    stripePaymentIntentId: transactionData.stripePaymentIntentId,
    eventId: transactionData.eventId,
    totalAmount: transactionData.totalAmount,
    timestamp: new Date().toISOString()
  });

  console.log('[MOBILE-WORKFLOW] Calling createTransaction() with transactionData...');
  console.log('[MOBILE-WORKFLOW] Full transactionData object:', JSON.stringify(transactionData, null, 2));

  // Create transaction
  let transaction: EventTicketTransactionDTO;
  try {
    transaction = await createTransaction(transactionData);
    console.log('[MOBILE-WORKFLOW] ✅ Transaction created successfully:', {
      transactionId: transaction.id,
      tenantId: transaction.tenantId,
      paymentMethodDomainId: transaction.paymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
  } catch (createError) {
    console.error('[MOBILE-WORKFLOW] ⚠️⚠️⚠️ CRITICAL ERROR: createTransaction() failed:', createError);
    console.error('[MOBILE-WORKFLOW] Error details:', {
      message: createError instanceof Error ? createError.message : String(createError),
      stack: createError instanceof Error ? createError.stack : undefined,
      transactionDataTenantId: transactionData.tenantId,
      transactionDataPaymentMethodDomainId: transactionData.paymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
    throw createError;
  }

  // Create transaction items
  const transactionItems = [];
  for (const cartItem of cart) {
    // Fetch ticket type to get price
    const ticketType = await fetchTicketTypeByIdServer(cartItem.ticketTypeId);
    if (!ticketType) {
      console.error('[createTransactionFromPaymentIntent] Could not find ticket type:', cartItem.ticketTypeId);
      continue;
    }

    const itemData = withTenantId({
      transactionId: transaction.id,
      ticketTypeId: cartItem.ticketTypeId,
      quantity: cartItem.quantity,
      pricePerUnit: ticketType.price,
      totalAmount: ticketType.price * cartItem.quantity,
      ticketTypeName: ticketType.name,
      createdAt: now,
      updatedAt: now,
      // CRITICAL: Always set paymentMethodDomainId - use metadata if available, otherwise use environment variable
      paymentMethodDomainId: finalPaymentMethodDomainId,
    });

    transactionItems.push(itemData);
  }

  // CRITICAL: Check if transaction items already exist before creating (prevent duplicates)
  // Backend webhook may have already created items
  // NOTE: This function should not be called anymore since we disabled fallback creation,
  // but keeping the check as a safety measure
  if (transactionItems.length > 0) {
    try {
      // CRITICAL: Enhanced idempotency check - verify items don't exist for this transaction
      // Check each item individually to prevent duplicates even if partial items exist
      // IMPORTANT: This check is NOT atomic - backend should enforce uniqueness at DB level
      const baseUrl = await getAppUrlFromRequestHeaders();
      const itemsCheckUrl = `${baseUrl}/api/proxy/event-ticket-transaction-items?transactionId.equals=${transaction.id}&tenantId.equals=${getTenantId()}`;

      // Retry logic to handle race conditions: check multiple times with small delay
      let existingItems: any[] = [];
      const maxRetries = 3;
      for (let retry = 0; retry < maxRetries; retry++) {
        if (retry > 0) {
          // Small delay between retries to allow concurrent requests to complete
          await new Promise(resolve => setTimeout(resolve, 100 * retry));
        }

        const itemsCheckRes = await fetchWithJwtRetry(itemsCheckUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store' // Ensure fresh data on every check
        });

        if (itemsCheckRes.ok) {
          const itemsData = await itemsCheckRes.json();
          existingItems = Array.isArray(itemsData) ? itemsData : [];
          // If we found items, break early (no need to retry)
          if (existingItems.length > 0) break;
        } else {
          console.warn(`[createTransactionFromPaymentIntent] Failed to check existing items (attempt ${retry + 1}/${maxRetries}):`, itemsCheckRes.status, itemsCheckRes.statusText);
        }
      }

      console.log('[createTransactionFromPaymentIntent] Transaction items check:', {
        transactionId: transaction.id,
        existingItemsCount: existingItems.length,
        existingItems: existingItems.map(item => ({ id: item.id, ticketTypeId: item.ticketTypeId, quantity: item.quantity })),
        cartItemsCount: transactionItems.length
      });

      // Filter out items that already exist (by transactionId + ticketTypeId combination)
      const itemsToCreate = transactionItems.filter((item: any) => {
        const ticketTypeId = item.ticketTypeId;
        const existingItem = existingItems.find(
          (existing: any) => existing.ticketTypeId === ticketTypeId && existing.transactionId === transaction.id
        );

        if (!existingItem) {
          console.log('[createTransactionFromPaymentIntent] Item needs to be created:', {
            ticketTypeId,
            quantity: item.quantity
          });
          return true;
        } else {
          console.log('[createTransactionFromPaymentIntent] Item already exists - skipping:', {
            ticketTypeId,
            existingItemId: existingItem.id,
            existingQuantity: existingItem.quantity
          });
          return false;
        }
      });

      // Only create items that don't already exist
      if (itemsToCreate.length > 0) {
        console.log('[createTransactionFromPaymentIntent] Creating transaction items (none exist yet for these ticket types):', itemsToCreate.length);
        console.log('[createTransactionFromPaymentIntent] Items to create:', itemsToCreate.map(item => ({
          transactionId: item.transactionId,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          tenantId: item.tenantId,
          paymentMethodDomainId: item.paymentMethodDomainId
        })));
        try {
          const createdItems = await createTransactionItemsBulk(itemsToCreate);
          console.log('[createTransactionFromPaymentIntent] ✅ Successfully created transaction items:', {
            itemsCreated: createdItems?.length || itemsToCreate.length,
            transactionId: transaction.id,
            timestamp: new Date().toISOString()
          });
          console.log('[createTransactionFromPaymentIntent] Created items response:', createdItems);
        } catch (bulkErr: any) {
          console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: Failed to create transaction items:', {
            error: bulkErr?.message || String(bulkErr),
            stack: bulkErr?.stack,
            itemsToCreateCount: itemsToCreate.length,
            transactionId: transaction.id,
            timestamp: new Date().toISOString()
          });
          // Re-throw to surface the error (transaction items are critical)
          throw new Error(`Failed to create transaction items: ${bulkErr?.message || String(bulkErr)}`);
        }
      } else if (existingItems.length > 0) {
        console.log('[createTransactionFromPaymentIntent] All transaction items already exist - skipping creation to prevent duplicates');
      } else {
        console.log('[createTransactionFromPaymentIntent] No transaction items to create (transactionItems.length === 0)');
      }
    } catch (err) {
      console.error('[createTransactionFromPaymentIntent] ⚠️⚠️⚠️ CRITICAL ERROR: Failed to create transaction items:', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        transactionId: transaction.id,
        timestamp: new Date().toISOString()
      });
      // Re-throw to surface the error (transaction items are critical)
      throw err;
    }
  }

  return transaction;
}