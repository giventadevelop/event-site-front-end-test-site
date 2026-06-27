import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { initStripeConfig, getStripeEnvVar } from '@/lib/stripe/init';
import Stripe from 'stripe';
import type { UserProfileDTO, UserSubscriptionDTO, EventTicketTransactionDTO } from '@/types';
import { NextRequest } from 'next/server';
import getRawBody from 'raw-body';
import { fetchUserProfileServer } from '@/app/admin/ApiServerActions';
import { createEventTicketTransactionServer, updateTicketTypeInventoryServer } from './ApiServerActions';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getPaymentMethodDomainId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

// Force Node.js runtime
export const runtime = 'nodejs';

// Helper function for updating subscriptions (unchanged)
async function updateSubscriptionWithRetry(
  baseUrl: string,
  subscriptionId: number,
  subscriptionData: UserSubscriptionDTO,
  maxRetries = 3
): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[STRIPE-WEBHOOK] Attempting to update subscription (attempt ${attempt + 1}/${maxRetries})`, {
        subscriptionId,
        status: subscriptionData.status
      });

      const response = await fetch(
        `${baseUrl}/api/proxy/user-subscriptions/${subscriptionId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscriptionData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update subscription: ${response.statusText}`);
      }

      const updatedSubscription = await response.json();
      console.log('[STRIPE-WEBHOOK] Successfully updated subscription:', {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        attempt: attempt + 1
      });

      return true;
    } catch (error) {
      console.error(`[STRIPE-WEBHOOK] Error updating subscription (attempt ${attempt + 1}):`, error);
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  return false;
}

// Helper to process charge fee update
async function handleChargeFeeUpdate(charge: Stripe.Charge) {
  console.log(`[STRIPE-WEBHOOK] Processing fee update for charge:`, charge.id);
  if (!charge.balance_transaction) {
    console.warn('[STRIPE-WEBHOOK] Charge missing balance_transaction, will retry later', charge);
    return new NextResponse('Charge missing balance_transaction, will retry', { status: 200 });
  }

  try {
    const stripe = initStripeConfig();
    if (!stripe) {
      throw new Error('[STRIPE-WEBHOOK] Failed to initialize Stripe configuration');
    }
    const balanceTx = await stripe.balanceTransactions.retrieve(charge.balance_transaction as string);
    const feeAmount = balanceTx.fee / 100; // Stripe fee is in cents
    const paymentIntentId = charge.payment_intent;
    if (!paymentIntentId) {
      console.error('[STRIPE-WEBHOOK] No payment_intent on charge');
      return new NextResponse('No payment_intent on charge', { status: 200 });
    }
    // Direct backend call (not proxy)
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
    const jwt = await getCachedApiJwt();
    let txnData = null;
    let found = false;
    const maxRetries = 5;
    const delayMs = 4000;
    for (let i = 0; i < maxRetries; i++) {
      const txnRes = await fetch(
        `${getApiBase()}/api/event-ticket-transactions?stripePaymentIntentId.equals=${paymentIntentId}&tenantId.equals=${getTenantId()}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        }
      );
      try {
        txnData = await txnRes.json();
      } catch (err) {
        console.error('[STRIPE-WEBHOOK] Failed to parse backend response as JSON:', err);
        return new NextResponse('Failed to parse backend response', { status: 200 });
      }
      if (Array.isArray(txnData) && txnData.length > 0) {
        found = true;
        break;
      }
      if (i < maxRetries - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    if (!found) {
      console.warn(`[STRIPE-WEBHOOK] No ticket transaction found for paymentIntentId: ${paymentIntentId} after ${maxRetries} retries. Attempting create from PI metadata...`);
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId as string);
        const md = (pi.metadata || {}) as any;
        const cartJson = md.cart;
        const eventIdRaw = md.eventId;
        const discountCodeId = md.discountCodeId ? Number(md.discountCodeId) : undefined;
        const email = (pi.receipt_email as string) || '';

        // CRITICAL: Extract tenantId and paymentMethodDomainId from PaymentIntent metadata
        const metadataTenantId = md.tenantId || md.tenant_id;
        const metadataPaymentMethodDomainId = md.paymentMethodDomainId || md.payment_method_domain_id;

        // Get expected values from environment variables
        const expectedTenantId = getTenantId();
        const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

        // CRITICAL: Validate metadata matches environment variables BEFORE creating transaction
        if (metadataTenantId && metadataTenantId !== expectedTenantId) {
          console.error('[STRIPE-WEBHOOK] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting transaction creation:', {
            metadataTenantId,
            expectedTenantId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
          return new NextResponse(`Tenant ID mismatch: Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`, { status: 403 });
        }

        if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
          console.error('[STRIPE-WEBHOOK] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting transaction creation:', {
            metadataPaymentMethodDomainId,
            expectedPaymentMethodDomainId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
          return new NextResponse(`Payment Method Domain ID mismatch: Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`, { status: 403 });
        }

        // Log successful validation
        if (metadataTenantId && metadataPaymentMethodDomainId) {
          console.log('[STRIPE-WEBHOOK] ✅ Triple validation passed:', {
            tenantId: metadataTenantId,
            paymentMethodDomainId: metadataPaymentMethodDomainId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
        } else {
          console.warn('[STRIPE-WEBHOOK] ⚠️ Missing metadata fields (will use environment variables):', {
            hasTenantId: !!metadataTenantId,
            hasPaymentMethodDomainId: !!metadataPaymentMethodDomainId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
        }

        if (cartJson && eventIdRaw) {
          const cart = JSON.parse(cartJson);
          const now = new Date().toISOString();
          const totalQuantity = Array.isArray(cart) ? cart.reduce((s: number, it: any) => s + (it.quantity || 0), 0) : 0;
          const amountTotal = typeof pi.amount_received === 'number' ? pi.amount_received / 100 : (typeof pi.amount === 'number' ? pi.amount / 100 : 0);

          // CRITICAL: ALWAYS use environment variable for paymentMethodDomainId (never use metadata)
          // This ensures consistent tenant filtering - reject if metadata doesn't match, but always use environment variable
          // If metadata doesn't match, we've already rejected above, so we can safely use environment variable here
          const finalPaymentMethodDomainId = expectedPaymentMethodDomainId;

          console.log('[STRIPE-WEBHOOK] Setting paymentMethodDomainId (ALWAYS from environment):', {
            fromMetadata: metadataPaymentMethodDomainId,
            fromEnvironment: expectedPaymentMethodDomainId,
            finalValue: finalPaymentMethodDomainId,
            usingEnvironmentVariable: true, // Always use environment variable for consistency
            paymentIntentId,
            timestamp: new Date().toISOString()
          });

          const txPayload: Omit<EventTicketTransactionDTO, 'id'> = {
            email,
            firstName: '',
            lastName: '',
            phone: '',
            quantity: totalQuantity,
            pricePerUnit: 0,
            totalAmount: amountTotal,
            taxAmount: undefined,
            platformFeeAmount: undefined,
            discountCodeId,
            discountAmount: undefined,
            finalAmount: amountTotal,
            status: 'COMPLETED',
            paymentMethod: 'wallet',
            paymentReference: paymentIntentId as string,
            purchaseDate: now as any,
            confirmationSentAt: undefined as any,
            refundAmount: undefined as any,
            refundDate: undefined as any,
            refundReason: undefined as any,
            stripeCheckoutSessionId: undefined as any,
            stripePaymentIntentId: paymentIntentId as string,
            stripeCustomerId: (pi.customer as string) || undefined,
            stripePaymentStatus: pi.status,
            stripeCustomerEmail: email,
            stripePaymentCurrency: (pi.currency || 'usd') as any,
            stripeAmountDiscount: undefined as any,
            stripeAmountTax: undefined as any,
            stripeFeeAmount: undefined as any,
            eventId: Number(eventIdRaw) as any,
            userId: undefined as any,
            createdAt: now as any,
            updatedAt: now as any,
            // CRITICAL: Always set paymentMethodDomainId - use metadata if available, otherwise use environment variable
            paymentMethodDomainId: finalPaymentMethodDomainId,
          };
          const created = await createEventTicketTransactionServer(withTenantId(txPayload as any) as any);
          console.log('[STRIPE-WEBHOOK] Created missing PI transaction:', created?.id);
          // Update inventory
          if (Array.isArray(cart)) {
            for (const item of cart) {
              if (item.ticketType && item.ticketType.id) {
                try { await updateTicketTypeInventoryServer(item.ticketType.id, item.quantity); } catch {}
              }
            }
          }
          // Continue with fee patch on the newly created transaction
          txnData = [created];
          found = true;
        } else {
          console.warn('[STRIPE-WEBHOOK] Cannot create PI-based transaction: missing cart or eventId metadata');
          return new NextResponse('Missing metadata to create transaction', { status: 200 });
        }
      } catch (createErr) {
        console.error('[STRIPE-WEBHOOK] Failed to create PI-based transaction after retries:', createErr);
        return new NextResponse('Failed to create transaction', { status: 200 });
      }
    }
    // PATCH all matching transactions
    let allPatched = true;
    for (const transaction of txnData) {
      if (!transaction.id) continue;
      // Calculate finalAmount if possible
      let finalAmount = undefined;
      if (
        typeof transaction.totalAmount === 'number' &&
        typeof transaction.platformFeeAmount === 'number' &&
        typeof feeAmount === 'number'
      ) {
        // Don't recalculate finalAmount - it should be the actual amount from Stripe
        // The backend should preserve the original finalAmount from the transaction
        console.log(`[STRIPE-WEBHOOK] Preserving original finalAmount for transaction ${transaction.id}`);
      } else {
        console.warn(`[STRIPE-WEBHOOK] Missing fields for finalAmount calculation on transaction ${transaction.id}`);
      }
      const patchPayload = {
        id: transaction.id,
        stripeFeeAmount: feeAmount,
        // Don't override finalAmount - preserve the original amount from Stripe
      };
      const patchRes = await fetch(`${getApiBase()}/api/event-ticket-transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(patchPayload),
      });
      if (!patchRes.ok) {
        const errorText = await patchRes.text();
        console.error(`[STRIPE-WEBHOOK] Failed to PATCH transaction ${transaction.id}:`, errorText);
        allPatched = false;
      } else {
        console.log(`[STRIPE-WEBHOOK] Successfully updated stripeFeeAmount for transaction ${transaction.id}`);
      }
    }
    if (allPatched) {
      return new NextResponse('Stripe fee updated', { status: 200 });
    } else {
      return new NextResponse('Some transactions failed to update', { status: 200 });
    }
  } catch (err) {
    console.error('[STRIPE-WEBHOOK] Error updating stripe fee:', err);
    return new NextResponse('Error updating stripe fee', { status: 200 });
  }
}

async function handleCompetitionPaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<NextResponse | null> {
  const md = (paymentIntent.metadata || {}) as Record<string, string>;
  if (md.registrationType !== 'event_competition') {
    return null;
  }

  const ids = (md.competitionRegistrationIds || '')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((id) => !Number.isNaN(id));

  if (ids.length === 0) {
    console.warn('[STRIPE-WEBHOOK] [COMPETITION] No registration IDs in metadata');
    return new NextResponse('No competition registration IDs', { status: 200 });
  }

  let token = await getCachedApiJwt();
  if (!token) token = await generateApiJwt();

  const now = new Date().toISOString();
  const apiBase = getApiBaseUrl();

  for (const registrationId of ids) {
    const patchPayload = {
      id: registrationId,
      registrationStatus: 'CONFIRMED',
      stripePaymentIntentId: paymentIntent.id,
      updatedAt: now,
    };
    const patchRes = await fetch(`${apiBase}/api/event-competition-registrations/${registrationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patchPayload),
    });
    if (!patchRes.ok) {
      const text = await patchRes.text();
      console.error('[STRIPE-WEBHOOK] [COMPETITION] Failed to confirm registration', {
        registrationId,
        status: patchRes.status,
        text,
      });
    } else {
      console.log('[STRIPE-WEBHOOK] [COMPETITION] Confirmed registration', registrationId);
    }
  }

  return new NextResponse(JSON.stringify({ ok: true, confirmed: ids.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Disable body parsing for App Router (not needed, but kept for reference)
// App Router doesn't parse body by default for POST requests

export async function POST(req: NextRequest) {
  // Skip processing during build phase
  if (process.env.NEXT_PHASE === 'build') {
    console.log('[STRIPE-WEBHOOK] Skipping during build phase');
    return new NextResponse(
      JSON.stringify({ error: 'Not available during build' }),
      { status: 503 }
    );
  }

  try {
    // Log environment state for debugging
    console.log('[STRIPE-WEBHOOK] Environment state:', {
      phase: process.env.NEXT_PHASE,
      nodeEnv: process.env.NODE_ENV,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      hasSecretKey: !!getStripeEnvVar('STRIPE_SECRET_KEY'),
      hasWebhookSecret: !!getStripeEnvVar('STRIPE_WEBHOOK_SECRET'),
      hasAppUrl: !!getStripeEnvVar('NEXT_PUBLIC_APP_URL'),
      runtime: typeof window === 'undefined' ? 'server' : 'client',
      // Log some environment variable keys for debugging (DO NOT log values)
      envKeys: Object.keys(process.env).filter(key =>
        key.includes('STRIPE') ||
        key.includes('NEXT_PUBLIC') ||
        key.includes('AWS_') ||
        key.includes('AMPLIFY_')
      )
    });

    // CRITICAL: Read raw body for signature verification
    // In AWS Lambda/Amplify, we need to ensure we get the raw body
    // For App Router in Lambda, use arrayBuffer() to get raw bytes
    let rawBody: Buffer;
    let signature: string | null;
    let bodyText: string = '';

    try {
      // Get signature header first (before reading body)
      signature = req.headers.get('stripe-signature');
      if (!signature) {
        console.error('[STRIPE-WEBHOOK] Missing Stripe signature header');
        return new NextResponse('Missing Stripe signature', { status: 400 });
      }

      // In AWS Lambda/Amplify, read as ArrayBuffer first to preserve raw bytes
      // Then convert to Buffer for Stripe verification
      const arrayBuffer = await req.arrayBuffer();
      rawBody = Buffer.from(arrayBuffer);

      // Also get text version for logging (but don't use for verification)
      bodyText = rawBody.toString('utf8');

      console.log('[STRIPE-WEBHOOK] Raw body length:', rawBody.length);
      console.log('[STRIPE-WEBHOOK] Signature header:', signature.substring(0, 50) + '...');
      console.log('[STRIPE-WEBHOOK] Is Lambda:', !!process.env.AWS_LAMBDA_FUNCTION_NAME);

    } catch (bodyError) {
      console.error('[STRIPE-WEBHOOK] Error reading request body:', bodyError);
      return new NextResponse('Error reading request body', { status: 400 });
    }

    // CRITICAL: Get configured tenant ID early for logging and filtering
    const configuredTenantId = getTenantId();
    console.log('[STRIPE-WEBHOOK] ============================================');
    console.log('[STRIPE-WEBHOOK] WEBHOOK RECEIVED - TENANT ID CHECK');
    console.log('[STRIPE-WEBHOOK] Configured tenant ID:', configuredTenantId);
    console.log('[STRIPE-WEBHOOK] Environment:', process.env.NODE_ENV);
    console.log('[STRIPE-WEBHOOK] App URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('[STRIPE-WEBHOOK] API Base URL:', getApiBaseUrl());
    console.log('[STRIPE-WEBHOOK] NEXT_PUBLIC_TENANT_ID from env:', process.env.NEXT_PUBLIC_TENANT_ID);
    console.log('[STRIPE-WEBHOOK] ============================================');

    const webhookSecret = getStripeEnvVar('STRIPE_WEBHOOK_SECRET');
    const stripeClient = initStripeConfig();
    if (stripeClient && webhookSecret && signature) {
      try {
        const stripeEvent = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
        if (stripeEvent.type === 'payment_intent.succeeded') {
          const competitionResponse = await handleCompetitionPaymentIntentSucceeded(
            stripeEvent.data.object as Stripe.PaymentIntent
          );
          if (competitionResponse) {
            return competitionResponse;
          }
        }
      } catch (verifyErr) {
        console.warn('[STRIPE-WEBHOOK] Local event verification skipped or failed:', verifyErr);
      }
    }

    // CRITICAL: Forward webhook to backend for processing
    // Backend will:
    // 1. Verify webhook signature against all tenant webhook secrets from payment_provider_config
    // 2. Identify tenant from matching webhook secret
    // 3. Create transactions with correct tenant ID
    // 4. Ignore requests that don't match any tenant's webhook secret

    console.log('[STRIPE-WEBHOOK] Forwarding webhook to backend for processing...');
    console.log('[STRIPE-WEBHOOK] Backend will verify signature and identify tenant from payment_provider_config');

    // Get backend API base URL
    // Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
    if (!getApiBase()) {
      console.error('[STRIPE-WEBHOOK] NEXT_PUBLIC_API_BASE_URL is not configured');
      return new NextResponse('Backend API URL not configured', { status: 500 });
    }

    try {
      // Forward webhook to backend
      // Backend endpoint: POST /api/webhooks/stripe
      const backendWebhookUrl = `${getApiBase()}/api/webhooks/stripe`;

      console.log('[STRIPE-WEBHOOK] Forwarding to backend:', backendWebhookUrl);
      console.log('[STRIPE-WEBHOOK] Body length:', rawBody.length);
      console.log('[STRIPE-WEBHOOK] Signature:', signature?.substring(0, 50) + '...');

      // CRITICAL: Get JWT token for backend authentication
      // According to cursor rules: Webhooks must use JWT for backend calls
      let jwt = await getCachedApiJwt();
      if (!jwt) {
        console.log('[STRIPE-WEBHOOK] No cached JWT, generating new one...');
        jwt = await generateApiJwt();
      }
      console.log('[STRIPE-WEBHOOK] Using JWT for backend authentication:', jwt ? 'JWT obtained' : 'FAILED');

      // Forward raw body and signature to backend with JWT authentication
      // CRITICAL: Backend requires JWT authentication (per cursor rules)
      const backendResponse = await fetch(backendWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': signature || '', // Forward Stripe signature header
          'Authorization': `Bearer ${jwt}`, // CRITICAL: JWT authentication required
        },
        body: rawBody, // Send raw body as-is (Buffer)
      });

      const responseText = await backendResponse.text();

      console.log('[STRIPE-WEBHOOK] Backend response status:', backendResponse.status);
      console.log('[STRIPE-WEBHOOK] Backend response:', responseText.substring(0, 500));

      // Return backend response to Stripe
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'application/json',
                },
              });
    } catch (error: any) {
      console.error('[STRIPE-WEBHOOK] Error forwarding webhook to backend:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Failed to forward webhook to backend',
          details: error?.message || 'Unknown error'
        }),
        {
          status: 500,
                        headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('[STRIPE-WEBHOOK] Handler error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
