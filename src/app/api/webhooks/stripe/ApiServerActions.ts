"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { EventTicketTransactionDTO, EventTicketTypeDTO } from '@/types';
import { getTenantId, getPaymentMethodDomainId, getApiBaseUrl } from '@/lib/env';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export async function createEventTicketTransactionServer(transaction: Omit<EventTicketTransactionDTO, 'id'>): Promise<EventTicketTransactionDTO> {
  const url = `${getApiBase()}/api/event-ticket-transactions`;

  // CRITICAL: Verify tenant ID before sending to backend
  const expectedTenantId = getTenantId();
  const transactionTenantId = transaction.tenantId;

  console.log('[WEBHOOK DEBUG] ============================================');
  console.log('[WEBHOOK DEBUG] TRANSACTION CREATION - TENANT ID VERIFICATION');
  console.log('[WEBHOOK DEBUG] Expected tenant ID (from env):', expectedTenantId);
  console.log('[WEBHOOK DEBUG] Transaction tenant ID (in payload):', transactionTenantId);
  console.log('[WEBHOOK DEBUG] NEXT_PUBLIC_TENANT_ID env var:', process.env.NEXT_PUBLIC_TENANT_ID);
  console.log('[WEBHOOK DEBUG] Tenant ID match:', transactionTenantId === expectedTenantId);

  // Get triple validation values from environment variables
  // CRITICAL: getPaymentMethodDomainId() throws if not set - this ensures we fail fast
  let expectedPaymentMethodDomainId: string;
  try {
    expectedPaymentMethodDomainId = getPaymentMethodDomainId();
    console.log('[WEBHOOK DEBUG] ✅ Payment Method Domain ID retrieved:', {
      paymentMethodDomainId: expectedPaymentMethodDomainId,
      hasValue: !!expectedPaymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[WEBHOOK DEBUG] ⚠️⚠️⚠️ CRITICAL ERROR: NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set:', error);
    console.error('[WEBHOOK DEBUG] Environment check:', {
      AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ? 'SET' : 'NOT SET',
      AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    });
    throw new Error(`NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID. Cannot create transaction without Payment Method Domain ID.`);
  }

  // CRITICAL: Validate transaction tenantId matches environment variable BEFORE backend call
  if (transactionTenantId && transactionTenantId !== expectedTenantId) {
    console.error('[WEBHOOK DEBUG] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
      transactionTenantId,
      expectedTenantId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Tenant ID mismatch: Transaction has tenantId=${transactionTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
  }

  // CRITICAL: Validate transaction paymentMethodDomainId matches environment variable BEFORE backend call
  const transactionPaymentMethodDomainId = transaction.paymentMethodDomainId;
  if (transactionPaymentMethodDomainId && transactionPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
    console.error('[WEBHOOK DEBUG] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
      transactionPaymentMethodDomainId,
      expectedPaymentMethodDomainId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Payment Method Domain ID mismatch: Transaction has paymentMethodDomainId=${transactionPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
  }

  // Add triple validation fields to payload (use environment variables, not transaction values)
  // Backend will validate the combination (tenantId, paymentMethodDomainId, webhookSecret) exists
  const payload = {
    ...transaction,
    tenantId: expectedTenantId, // ALWAYS use environment tenant ID - ignore any tenantId from transaction
    paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
  };

  console.log('[WEBHOOK DEBUG] ✅ Triple validation passed, adding validated fields:', {
    tenantId: payload.tenantId,
    paymentMethodDomainId: payload.paymentMethodDomainId,
    hasWebhookSecret: false, // Not passed from frontend - backend looks it up
  });

  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[WEBHOOK ERROR] Failed to create event ticket transaction:', {
      status: res.status,
      statusText: res.statusText,
      url,
      errorBody,
      transactionPayload: transaction
    });

    // Don't throw error - let webhook succeed even if backend transaction creation fails
    // This prevents Stripe from retrying the webhook indefinitely
    console.warn('[WEBHOOK WARN] Webhook will succeed despite transaction creation failure');

    // Return a minimal transaction object to prevent downstream errors
    return {
      id: -1, // Indicates failed creation
      ...transaction,
      status: 'FAILED_CREATION'
    } as EventTicketTransactionDTO;
  }

  const result = await res.json();
  console.log('[WEBHOOK DEBUG] Transaction created successfully:', result.id);
  return result;
}

// Helper to bulk create transaction items
export async function createTransactionItemsBulkServer(items: any[]): Promise<any[]> {
  const url = `${getApiBase()}/api/event-ticket-transaction-items/bulk`;

  // Get triple validation values from environment variables
  const expectedTenantId = getTenantId();
  const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

  // Validate all items have required non-null fields before sending to backend
  const validatedItems = items.map(item => {
    if (!item.transactionId || !item.ticketTypeId ||
        typeof item.quantity !== 'number' || typeof item.pricePerUnit !== 'number' ||
        typeof item.totalAmount !== 'number') {
      throw new Error(`Invalid transaction item: ${JSON.stringify(item)}`);
    }

    // CRITICAL: Validate item tenantId matches environment variable BEFORE backend call
    const itemTenantId = item.tenantId;
    if (itemTenantId && itemTenantId !== expectedTenantId) {
      console.error('[WEBHOOK DEBUG] ⚠️⚠️⚠️ TENANT ID MISMATCH in item - Rejecting request:', {
        itemTenantId,
        expectedTenantId,
        transactionId: item.transactionId,
        ticketTypeId: item.ticketTypeId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Tenant ID mismatch: Item has tenantId=${itemTenantId} but environment is configured for tenantId=${expectedTenantId}. Request rejected.`);
    }

    // CRITICAL: Validate item paymentMethodDomainId matches environment variable BEFORE backend call
    const itemPaymentMethodDomainId = item.paymentMethodDomainId;
    if (itemPaymentMethodDomainId && itemPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
      console.error('[WEBHOOK DEBUG] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH in item - Rejecting request:', {
        itemPaymentMethodDomainId,
        expectedPaymentMethodDomainId,
        transactionId: item.transactionId,
        ticketTypeId: item.ticketTypeId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Payment Method Domain ID mismatch: Item has paymentMethodDomainId=${itemPaymentMethodDomainId} but environment is configured for paymentMethodDomainId=${expectedPaymentMethodDomainId}. Request rejected.`);
    }

    // CRITICAL: ALWAYS use tenantId from environment variable - NEVER trust tenantId from item
    // This prevents duplicate calls with wrong tenant IDs from other tenants' webhook events
    const validatedItem = {
      ...item,
      tenantId: expectedTenantId, // ALWAYS use environment tenant ID - ignore any tenantId from item
      paymentMethodDomainId: expectedPaymentMethodDomainId, // ALWAYS use environment Payment Method Domain ID
      // Ensure BigDecimal-compatible numbers (backend expects precision)
      pricePerUnit: Number(item.pricePerUnit.toFixed(2)),
      totalAmount: Number(item.totalAmount.toFixed(2))
    };

    // Log if item had a different tenantId (potential security issue)
    if (item.tenantId && item.tenantId !== expectedTenantId) {
      console.warn('[WEBHOOK SECURITY] Transaction item had different tenantId - ignoring:', {
        itemTenantId: item.tenantId,
        configuredTenantId: expectedTenantId,
        transactionId: item.transactionId,
        ticketTypeId: item.ticketTypeId
      });
    }

    // Validate tenantId is present
    if (!validatedItem.tenantId) {
      throw new Error(`Missing tenantId in transaction item: ${JSON.stringify(validatedItem)}`);
    }

    return validatedItem;
  });

  console.log('[WEBHOOK DEBUG] ✅ Triple validation passed, creating bulk transaction items:', {
    url,
    tenantId: expectedTenantId,
    paymentMethodDomainId: expectedPaymentMethodDomainId,
    itemCount: validatedItems.length,
    items: validatedItems.map(item => ({
      tenantId: item.tenantId,
      transactionId: item.transactionId,
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      totalAmount: item.totalAmount
    }))
  });

  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedItems),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[WEBHOOK ERROR] Failed to bulk create transaction items:', {
      status: res.status,
      statusText: res.statusText,
      url,
      errorBody,
      itemsPayload: validatedItems
    });
    throw new Error(`Failed to bulk create transaction items: ${errorBody}`);
  }

  const result = await res.json();
  console.log('[WEBHOOK DEBUG] Bulk transaction items created successfully:', result.length);
  return result;
}

export async function updateTicketTypeInventoryServer(ticketTypeId: number, quantityPurchased: number): Promise<void> {
  const getUrl = `${getApiBase()}/api/event-ticket-types/${ticketTypeId}`;

  // 1. Get the current ticket type
  const getRes = await fetchWithJwtRetry(getUrl);
  if (!getRes.ok) {
    throw new Error(`Failed to fetch ticket type ${ticketTypeId}: ${getRes.statusText}`);
  }
  const ticketType: EventTicketTypeDTO = await getRes.json();

  // 2. Update the sold quantity
  const updatedTicketType = {
    ...ticketType,
    soldQuantity: (ticketType.soldQuantity || 0) + quantityPurchased,
  };

  // 3. PUT the updated ticket type back
  const putUrl = `${getApiBase()}/api/event-ticket-types/${ticketTypeId}`;
  const putRes = await fetchWithJwtRetry(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTicketType),
  });

  if (!putRes.ok) {
    const errorBody = await putRes.text();
    console.error(`Failed to update inventory for ticket type ${ticketTypeId}:`, putRes.status, errorBody);
    throw new Error(`Failed to update inventory: ${putRes.statusText}`);
  }
}