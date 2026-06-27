import { NextRequest, NextResponse } from 'next/server';
import { processStripeSessionServer, fetchTransactionQrCode } from '@/app/event/success/ApiServerActions';
import { fetchEventDetailsByIdServer } from '@/app/admin/events/[id]/media/ApiServerActions';
import Stripe from 'stripe';
import { getTenantId, getPaymentMethodDomainId, getAppUrl } from '@/lib/env';

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2025-03-31.basil' });
  }
  return _stripe;
}

const APP_URL = getAppUrl();

async function fetchTransactionItemsByTransactionId(transactionId: number) {
  const res = await fetch(`${APP_URL}/api/proxy/event-ticket-transaction-items?transactionId.equals=${transactionId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function fetchTicketTypeById(ticketTypeId: number) {
  const res = await fetch(`${APP_URL}/api/proxy/event-ticket-types/${ticketTypeId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function getHeroImageUrl(eventId: number) {
  const defaultHeroImageUrl = `/images/default_placeholder_hero_image.jpeg?v=${Date.now()}`;
  let imageUrl: string | null = null;
  try {
    const flyerRes = await fetch(`${APP_URL}/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`, { cache: 'no-store' });
    if (flyerRes.ok) {
      const flyerData = await flyerRes.json();
      if (Array.isArray(flyerData) && flyerData.length > 0 && flyerData[0].fileUrl) {
        imageUrl = flyerData[0].fileUrl;
      }
    }
    if (!imageUrl) {
      const featuredRes = await fetch(`${APP_URL}/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`, { cache: 'no-store' });
      if (featuredRes.ok) {
        const featuredData = await featuredRes.json();
        if (Array.isArray(featuredData) && featuredData.length > 0 && featuredData[0].fileUrl) {
          imageUrl = featuredData[0].fileUrl;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching hero image:', error);
  }
  return imageUrl || defaultHeroImageUrl;
}

// Function to get session_id from payment intent
async function getSessionIdFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  try {
    console.log('[Payment Intent] Looking up session for payment intent:', paymentIntentId);

    // Get the payment intent from Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    // The session ID should be in the metadata or we need to search for it
    if (paymentIntent.metadata?.session_id) {
      console.log('[Payment Intent] Found session_id in metadata:', paymentIntent.metadata.session_id);
      return paymentIntent.metadata.session_id;
    }

    // If not in metadata, we need to search checkout sessions
    // This is more expensive but necessary for mobile flows
    const sessions = await getStripe().checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1
    });

    if (sessions.data.length > 0) {
      const sessionId = sessions.data[0].id;
      console.log('[Payment Intent] Found session_id via lookup:', sessionId);
      return sessionId;
    }

    console.log('[Payment Intent] No session found for payment intent:', paymentIntentId);
    return null;
  } catch (error) {
    console.error('[Payment Intent] Error looking up session:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, pi, skip_qr } = body;

    // CRITICAL: Server-side mobile detection for CloudWatch logging
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

    // Enhanced mobile detection (same logic as client-side)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] API POST /api/event/success/process');
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] User-Agent:', userAgent.substring(0, 150));
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] CloudFront Headers:', {
      cloudfrontMobile,
      cloudfrontAndroid,
      cloudfrontIOS,
    });
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] Detection Methods:', {
      mobileRegexMatch,
      platformMatch,
      cloudfrontMobile,
      cloudfrontAndroid,
      cloudfrontIOS,
    });
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT:', {
      isMobile,
      session_id,
      pi,
      skip_qr,
      timestamp: new Date().toISOString(),
    });
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');

    console.log('[API POST] Received body:', {
      session_id,
      pi,
      skip_qr,
      body,
      isMobile, // Include mobile detection result
      userAgent: userAgent.substring(0, 100),
    });

    if (!session_id && !pi) {
      console.log('[API POST] Missing both session_id and pi parameters');
      return NextResponse.json({ error: 'Missing session_id or pi (payment_intent)' }, { status: 400 });
    }

    // Import the helper functions from server actions
    const { findTransactionBySessionId, findTransactionByPaymentIntentId } = await import('@/app/event/success/ApiServerActions');

    // First check if transaction already exists
    let existingTransaction = null;
    if (session_id) {
      // Check if session_id is actually a payment intent ID (starts with 'pi_')
      if (session_id.startsWith('pi_')) {
        console.log('[API POST] session_id parameter is actually a payment intent ID:', session_id);
        console.log('[API POST] Checking for existing transaction by payment_intent instead of session_id');
        existingTransaction = await findTransactionByPaymentIntentId(session_id);
      } else {
        console.log('[API POST] Checking for existing transaction by session_id:', session_id);
        existingTransaction = await findTransactionBySessionId(session_id);
      }
    } else if (pi) {
      console.log('[API POST] Checking for existing transaction by payment_intent:', pi);
      existingTransaction = await findTransactionByPaymentIntentId(pi);
    }

    if (existingTransaction) {
      console.log('[API POST] Transaction already exists:', existingTransaction.id);
      // Use the existing transaction instead of creating a new one

      // Get event details
      let eventDetails = existingTransaction.event;
      if (!eventDetails?.id && existingTransaction.eventId) {
        eventDetails = await fetchEventDetailsByIdServer(existingTransaction.eventId);
      }

      // Get QR code data - skip for mobile flows
      let qrCodeData = null;
      if (!skip_qr && existingTransaction.id && eventDetails?.id) {
        try {
          qrCodeData = await fetchTransactionQrCode(eventDetails.id, existingTransaction.id);
        } catch (err) {
          console.error('[API POST] Failed to fetch QR code:', err);
          qrCodeData = null;
        }
      } else if (skip_qr) {
        console.log('[API POST] Skipping QR code fetch - mobile flow detected (prevents duplicate emails)');
      }

      // Fetch transaction items and ticket type names
      let transactionItems = [];
      if (existingTransaction.id) {
        transactionItems = await fetchTransactionItemsByTransactionId(existingTransaction.id as number);
        const ticketTypeCache: Record<number, any> = {};
        for (const item of transactionItems) {
          if (!item.ticketTypeName && item.ticketTypeId) {
            if (!ticketTypeCache[item.ticketTypeId as number]) {
              const ticketType = await fetchTicketTypeById(item.ticketTypeId as number);
              ticketTypeCache[item.ticketTypeId as number] = ticketType;
            }
            item.ticketTypeName = ticketTypeCache[item.ticketTypeId as number]?.name || `Ticket Type #${item.ticketTypeId}`;
          }
        }
      }

      // Fetch hero image URL
      let heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id as number) : null;

      return NextResponse.json({
        transaction: existingTransaction,
        userProfile: null,
        eventDetails,
        qrCodeData,
        transactionItems,
        heroImageUrl
      });
    }

    // If no existing transaction, try to create via Stripe session processing
    let result = null;
    const paymentIntentId = pi || (session_id?.startsWith('pi_') ? session_id : null);

    if (session_id) {
      if (session_id.startsWith('pi_')) {
        // Payment intent processing - convert to session_id first
        console.log('[API POST] Processing payment intent from session_id parameter:', session_id);
        const sessionId = await getSessionIdFromPaymentIntent(session_id);
        if (!sessionId) {
          console.log('[API POST] Could not find session for payment intent - will try fallback creation');
          // Don't return error yet - try fallback below
        } else {
          result = await processStripeSessionServer(sessionId);
        }
      } else {
        result = await processStripeSessionServer(session_id);
      }
    } else if (pi) {
      // Payment intent processing - convert to session_id first
      console.log('[API POST] Processing payment intent:', pi);
      const sessionId = await getSessionIdFromPaymentIntent(pi);
      if (!sessionId) {
        console.log('[API POST] Could not find session for payment intent - will try fallback creation');
        // Don't return error yet - try fallback below
      } else {
        result = await processStripeSessionServer(sessionId);
      }
    }

    // CLIENT-SIDE TRANSACTION CREATION: Create transaction from Stripe data if not found
    // This follows the legacy pattern where browser acts as listener and creates transactions
    if (!result && paymentIntentId) {
      console.log('[API POST CLIENT-CREATE] No transaction found, creating from Payment Intent:', paymentIntentId);

      try {
        // Retrieve Payment Intent from Stripe
        const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
          expand: ['charges.data.balance_transaction']
        });

        // Check if payment is successful
        if (paymentIntent.status !== 'succeeded') {
          console.log('[API POST CLIENT-CREATE] Payment Intent not succeeded:', paymentIntent.status);
          return NextResponse.json({
            transaction: null,
            message: `Payment not completed yet. Status: ${paymentIntent.status}`
          }, { status: 200 });
        }

        // Extract metadata
        const metadata = paymentIntent.metadata || {};
        const cartJson = metadata.cart;
        const eventIdRaw = metadata.eventId;
        const discountCodeId = metadata.discountCodeId ? parseInt(metadata.discountCodeId, 10) : undefined;

        // CRITICAL: Extract tenantId and paymentMethodDomainId from PaymentIntent metadata
        const metadataTenantId = metadata.tenantId || metadata.tenant_id;
        const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;

        // Get expected values from environment variables
        const expectedTenantId = getTenantId();
        const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

        // CRITICAL: Validate metadata matches environment variables BEFORE making backend calls
        if (metadataTenantId && metadataTenantId !== expectedTenantId) {
          console.error('[API POST CLIENT-CREATE] ⚠️⚠️⚠️ TENANT ID MISMATCH - Rejecting request:', {
            metadataTenantId,
            expectedTenantId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
          return NextResponse.json({
            transaction: null,
            error: 'Tenant ID mismatch',
            message: `Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}). Request rejected.`
          }, { status: 403 });
        }

        if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
          console.error('[API POST CLIENT-CREATE] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH - Rejecting request:', {
            metadataPaymentMethodDomainId,
            expectedPaymentMethodDomainId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
          return NextResponse.json({
            transaction: null,
            error: 'Payment Method Domain ID mismatch',
            message: `Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}). Request rejected.`
          }, { status: 403 });
        }

        // Log successful validation
        if (metadataTenantId && metadataPaymentMethodDomainId) {
          console.log('[API POST CLIENT-CREATE] ✅ Triple validation passed:', {
            tenantId: metadataTenantId,
            paymentMethodDomainId: metadataPaymentMethodDomainId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
        } else {
          console.warn('[API POST CLIENT-CREATE] ⚠️ Missing metadata fields:', {
            hasTenantId: !!metadataTenantId,
            hasPaymentMethodDomainId: !!metadataPaymentMethodDomainId,
            paymentIntentId,
            timestamp: new Date().toISOString()
          });
        }

        if (!cartJson || !eventIdRaw) {
          console.error('[API POST CLIENT-CREATE] Missing cart or eventId in Payment Intent metadata');
          return NextResponse.json({
            transaction: null,
            message: 'Missing cart or eventId in payment metadata'
          }, { status: 200 });
        }

        const cart = JSON.parse(cartJson);
        const eventId = parseInt(eventIdRaw, 10);
        const email = paymentIntent.receipt_email || metadata.customerEmail || '';
        const customerName = metadata.customerName || '';
        const customerPhone = metadata.customerPhone || '';

        // Extract name parts
        const nameParts = customerName.trim().split(/\s+/).filter(part => part.length > 0);
        const firstName = nameParts.length > 0 ? nameParts[0] : '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Calculate totals
        const totalQuantity = Array.isArray(cart)
          ? cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0)
          : 0;
        const amountTotal = typeof paymentIntent.amount_received === 'number'
          ? paymentIntent.amount_received / 100
          : (typeof paymentIntent.amount === 'number' ? paymentIntent.amount / 100 : 0);

        // Extract payment method type
        let paymentMethodType = 'card';
        if (paymentIntent.payment_method_types && paymentIntent.payment_method_types.length > 0) {
          paymentMethodType = paymentIntent.payment_method_types[0];
        }

        // Get Stripe fee if available
        let stripeFeeAmount: number | undefined = undefined;
        try {
          if (paymentIntent.charges && Array.isArray(paymentIntent.charges.data) && paymentIntent.charges.data.length > 0) {
            const charge = paymentIntent.charges.data[0];
            if (charge.balance_transaction) {
              const balanceTx = typeof charge.balance_transaction === 'string'
                ? await getStripe().balanceTransactions.retrieve(charge.balance_transaction)
                : charge.balance_transaction;
              if (balanceTx && typeof balanceTx.fee === 'number') {
                stripeFeeAmount = balanceTx.fee / 100;
              }
            }
          }
        } catch (feeErr) {
          console.warn('[API POST CLIENT-CREATE] Could not fetch Stripe fee:', feeErr);
        }

        // Import server actions for transaction creation
        const { createTransactionFromPaymentIntent } = await import('@/app/event/success/ApiServerActions');

        console.log('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] About to call createTransactionFromPaymentIntent:', {
          paymentIntentId,
          eventId,
          email,
          cartItemsCount: cart?.length || 0,
          amountTotal,
          firstName,
          lastName,
          customerPhone,
          timestamp: new Date().toISOString()
        });

        // Create transaction with cart items
        const cartItems = Array.isArray(cart) ? cart.map((item: any) => ({
          ticketTypeId: item.ticketTypeId || item.ticketType?.id,
          quantity: Number(item.quantity) || 0
        })).filter((item: any) => item.ticketTypeId && item.quantity > 0) : [];

        console.log('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] Cart items prepared:', cartItems);

        let createdTransaction;
        try {
          createdTransaction = await createTransactionFromPaymentIntent(
            paymentIntentId,
            eventId,
            email,
            cartItems,
            amountTotal,
            firstName,
            lastName,
            customerPhone
          );

          console.log('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] ✅ Successfully created transaction:', {
            transactionId: createdTransaction.id,
            tenantId: createdTransaction.tenantId,
            paymentMethodDomainId: createdTransaction.paymentMethodDomainId,
            timestamp: new Date().toISOString()
          });
        } catch (createErr: any) {
          console.error('[MOBILE-WORKFLOW] [API POST CLIENT-CREATE] ⚠️⚠️⚠️ CRITICAL ERROR: createTransactionFromPaymentIntent failed:', {
            error: createErr?.message || String(createErr),
            stack: createErr?.stack,
            paymentIntentId,
            eventId,
            timestamp: new Date().toISOString()
          });
          throw createErr;
        }

        // Use the created transaction
        result = { transaction: createdTransaction, userProfile: null };
      } catch (createErr: any) {
        console.error('[API POST CLIENT-CREATE] Error creating transaction:', createErr);
        return NextResponse.json({
          transaction: null,
          error: createErr?.message || 'Failed to create transaction',
          message: 'Could not create transaction from payment data'
        }, { status: 200 });
      }
    }

    // FALLBACK: If still no result and we have session_id (not payment intent), try to create from session
    if (!result && session_id && !session_id.startsWith('pi_')) {
      console.log('[API POST CLIENT-CREATE] No result from session processing, attempting direct session creation:', session_id);
      try {
        // Retrieve session from Stripe
        const session = await getStripe().checkout.sessions.retrieve(session_id, {
          expand: ['line_items.data.price.product', 'customer']
        });

        if (session.payment_status !== 'paid') {
          console.log('[API POST CLIENT-CREATE] Session not paid:', session.payment_status);
          return NextResponse.json({
            transaction: null,
            message: `Payment not completed yet. Status: ${session.payment_status}`
          }, { status: 200 });
        }

        // Process session to create transaction
        result = await processStripeSessionServer(session_id);
        if (result) {
          console.log('[API POST CLIENT-CREATE] Successfully created transaction from session:', result.transaction?.id);
        }
      } catch (sessionErr: any) {
        console.error('[API POST CLIENT-CREATE] Error processing session:', sessionErr);
        // Continue to return null if creation fails
      }
    }
    const transaction = result?.transaction;
    const userProfile = result?.userProfile;
    if (!transaction) {
      return NextResponse.json({ transaction: null }, { status: 200 });
    }
    let eventDetails = transaction.event;
    if (!eventDetails?.id && transaction.eventId) {
      eventDetails = await fetchEventDetailsByIdServer(transaction.eventId);
    }
    // Check if this is a mobile request that should skip QR fetching (mobile uses separate QR flow)
    // IMPORTANT: Respect the POST body flag as sent by TicketQrClient
    // Using URL searchParams here caused duplicate emails because body flag was ignored
    const skipQr = !!skip_qr;

    let qrCodeData = null;
    if (!skipQr && transaction.id && eventDetails?.id) {
      try {
        console.log('[QR Code Debug] Attempting to fetch QR code for:', {
          eventId: eventDetails.id,
          transactionId: transaction.id
        });
        qrCodeData = await fetchTransactionQrCode(eventDetails.id, transaction.id);
        console.log('[QR Code Debug] QR code fetched successfully:', qrCodeData);
      } catch (err) {
        console.error('[QR Code Debug] Failed to fetch QR code:', err);
        qrCodeData = null;
      }
    } else if (skipQr) {
      console.log('[QR Code Debug] Skipping QR code fetch - mobile flow detected (prevents duplicate emails)');
    } else {
      console.log('[QR Code Debug] Skipping QR code fetch - missing IDs:', {
        transactionId: transaction.id,
        eventId: eventDetails?.id
      });
    }
    // Fetch transaction items and ticket type names
    let transactionItems = [];
    if (transaction.id) {
      transactionItems = await fetchTransactionItemsByTransactionId(transaction.id as number);
      const ticketTypeCache: Record<number, any> = {};
      for (const item of transactionItems) {
        if (!item.ticketTypeName && item.ticketTypeId) {
          if (!ticketTypeCache[item.ticketTypeId as number]) {
            const ticketType = await fetchTicketTypeById(item.ticketTypeId as number);
            ticketTypeCache[item.ticketTypeId as number] = ticketType;
          }
          item.ticketTypeName = ticketTypeCache[item.ticketTypeId as number]?.name || `Ticket Type #${item.ticketTypeId}`;
        }
      }
    }
    // Fetch hero image URL
    let heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id as number) : null;
    return NextResponse.json({ transaction, userProfile, eventDetails, qrCodeData, transactionItems, heroImageUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const pi = searchParams.get('pi');

    // CRITICAL: Server-side mobile detection for CloudWatch logging
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

    // Enhanced mobile detection (same logic as client-side)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] API GET /api/event/success/process');
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] User-Agent:', userAgent.substring(0, 150));
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] CloudFront Headers:', {
      cloudfrontMobile,
      cloudfrontAndroid,
      cloudfrontIOS,
    });
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] Detection Methods:', {
      mobileRegexMatch,
      platformMatch,
      cloudfrontMobile,
      cloudfrontAndroid,
      cloudfrontIOS,
    });
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] FINAL RESULT:', {
      isMobile,
      session_id,
      pi,
      url: req.url,
      timestamp: new Date().toISOString(),
    });
    console.log('[MOBILE-DETECTION] [SERVER-SIDE] ============================================');

    console.log('[API GET] Received parameters:', {
      session_id,
      pi,
      url: req.url,
      searchParams: Object.fromEntries(searchParams.entries()),
      isMobile, // Include mobile detection result
      userAgent: userAgent.substring(0, 100),
    });

    if (!session_id && !pi) {
      console.log('[API GET] Missing both session_id and pi parameters');
      return NextResponse.json({ error: 'Missing session_id or pi (payment_intent)' }, { status: 400 });
    }

    // Import the helper functions from server actions
    const { findTransactionBySessionId, findTransactionByPaymentIntentId } = await import('@/app/event/success/ApiServerActions');

    // Only look up existing transactions, do not create
    let transaction = null;
    let lookupError: string | null = null;

    try {
      if (session_id) {
        // Check if session_id is actually a payment intent ID (starts with 'pi_')
        if (session_id.startsWith('pi_')) {
          console.log('[API GET] session_id parameter is actually a payment intent ID:', session_id);
          console.log('[API GET] Looking up transaction by payment_intent instead of session_id');
          transaction = await findTransactionByPaymentIntentId(session_id);
        } else {
          console.log('[API GET] Looking up transaction by session_id:', session_id);
          transaction = await findTransactionBySessionId(session_id);
        }
      } else if (pi) {
        console.log('[API GET] Looking up transaction by payment_intent:', pi);
        transaction = await findTransactionByPaymentIntentId(pi);
      }
    } catch (err: any) {
      console.error('[API GET] Error during transaction lookup:', {
        error: err?.message || String(err),
        stack: err?.stack,
        session_id,
        pi,
        timestamp: new Date().toISOString()
      });
      lookupError = err?.message || 'Transaction lookup failed';
    }

    if (!transaction) {
      console.log('[API GET] No existing transaction found', {
        session_id,
        pi,
        lookupError,
        isMobile,
        timestamp: new Date().toISOString(),
        note: isMobile ? 'Mobile flow will handle transaction creation via POST' : 'Desktop flow will create transaction if payment succeeded'
      });

      // CRITICAL: Desktop flow - create transaction immediately if payment succeeded
      // This is separate from mobile workflow (which uses POST endpoint)
      // Desktop flow persists transaction from frontend when webhook hasn't processed yet
      if (!isMobile && pi) {
        console.log('[API GET] [DESKTOP FLOW] No transaction found - attempting to create from Payment Intent:', pi);
        try {
          // Retrieve Payment Intent from Stripe to validate payment succeeded
          const paymentIntent = await getStripe().paymentIntents.retrieve(pi, {
            expand: ['charges.data.balance_transaction']
          });

          // Only create transaction if payment succeeded
          if (paymentIntent.status !== 'succeeded') {
            console.log('[API GET] [DESKTOP FLOW] Payment Intent not succeeded:', paymentIntent.status);
            return NextResponse.json({
              transaction: null,
              error: 'Transaction not found',
              message: `Payment not completed yet. Status: ${paymentIntent.status}`,
              hasTransaction: false
            }, { status: 200 });
          }

          // Extract metadata from Payment Intent
          const metadata = paymentIntent.metadata || {};
          const cartJson = metadata.cart;
          const eventIdRaw = metadata.eventId;
          const customerEmail = paymentIntent.receipt_email || metadata.customerEmail || '';
          const customerName = metadata.customerName || '';
          const customerPhone = metadata.customerPhone || '';

          // Extract name parts
          const nameParts = customerName.trim().split(/\s+/).filter(part => part.length > 0);
          const firstName = nameParts.length > 0 ? nameParts[0] : '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          // Validate metadata matches environment variables
          const metadataTenantId = metadata.tenantId || metadata.tenant_id;
          const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;
          const expectedTenantId = getTenantId();
          const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

          if (metadataTenantId && metadataTenantId !== expectedTenantId) {
            console.error('[API GET] [DESKTOP FLOW] ⚠️⚠️⚠️ TENANT ID MISMATCH:', {
              metadataTenantId,
              expectedTenantId,
              paymentIntentId: pi
            });
            return NextResponse.json({
              transaction: null,
              error: 'Tenant ID mismatch',
              message: `Payment Intent tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}).`
            }, { status: 403 });
          }

          if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
            console.error('[API GET] [DESKTOP FLOW] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH:', {
              metadataPaymentMethodDomainId,
              expectedPaymentMethodDomainId,
              paymentIntentId: pi
            });
            return NextResponse.json({
              transaction: null,
              error: 'Payment Method Domain ID mismatch',
              message: `Payment Intent Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}).`
            }, { status: 403 });
          }

          if (!cartJson || !eventIdRaw) {
            console.error('[API GET] [DESKTOP FLOW] Missing cart or eventId in Payment Intent metadata');
            return NextResponse.json({
              transaction: null,
              error: 'Transaction not found',
              message: 'Missing cart or eventId in payment metadata'
            }, { status: 200 });
          }

          const cart = JSON.parse(cartJson);
          const eventId = parseInt(eventIdRaw, 10);

          // Calculate totals
          const totalQuantity = Array.isArray(cart)
            ? cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0)
            : 0;
          const amountTotal = typeof paymentIntent.amount_received === 'number'
            ? paymentIntent.amount_received / 100
            : (typeof paymentIntent.amount === 'number' ? paymentIntent.amount / 100 : 0);

          // Import server actions for transaction creation
          const { createTransactionFromPaymentIntent } = await import('@/app/event/success/ApiServerActions');

          console.log('[API GET] [DESKTOP FLOW] Creating transaction from Payment Intent:', {
            paymentIntentId: pi,
            eventId,
            email: customerEmail,
            cartItemsCount: cart?.length || 0,
            amountTotal,
            firstName,
            lastName,
            customerPhone,
            timestamp: new Date().toISOString()
          });

          // Create transaction with cart items
          const cartItems = Array.isArray(cart) ? cart.map((item: any) => ({
            ticketTypeId: item.ticketTypeId || item.ticketType?.id,
            quantity: Number(item.quantity) || 0
          })).filter((item: any) => item.ticketTypeId && item.quantity > 0) : [];

          console.log('[API GET] [DESKTOP FLOW] Cart items prepared:', cartItems);

          let createdTransaction;
          try {
            createdTransaction = await createTransactionFromPaymentIntent(
              pi,
              eventId,
              customerEmail,
              cartItems,
              amountTotal,
              firstName,
              lastName,
              customerPhone
            );

            console.log('[API GET] [DESKTOP FLOW] ✅ Successfully created transaction:', {
              transactionId: createdTransaction.id,
              tenantId: createdTransaction.tenantId,
              paymentMethodDomainId: createdTransaction.paymentMethodDomainId,
              timestamp: new Date().toISOString()
            });

            // Use the created transaction
            transaction = createdTransaction;
          } catch (createErr: any) {
            console.error('[API GET] [DESKTOP FLOW] ⚠️⚠️⚠️ CRITICAL ERROR: createTransactionFromPaymentIntent failed:', {
              error: createErr?.message || String(createErr),
              stack: createErr?.stack,
              paymentIntentId: pi,
              eventId,
              timestamp: new Date().toISOString()
            });
            // Return error but don't throw - let polling continue
            return NextResponse.json({
              transaction: null,
              error: 'Transaction creation failed',
              message: createErr?.message || 'Could not create transaction from payment data',
              hasTransaction: false
            }, { status: 200 });
          }
        } catch (createErr: any) {
          console.error('[API GET] [DESKTOP FLOW] Error creating transaction:', createErr);
          // Return error but don't throw - let polling continue
          return NextResponse.json({
            transaction: null,
            error: 'Transaction creation failed',
            message: createErr?.message || 'Could not create transaction from payment data',
            hasTransaction: false
          }, { status: 200 });
        }
      } else {
        // Mobile flow or no payment intent - return not found (mobile will use POST)
        return NextResponse.json({
          transaction: null,
          error: lookupError || 'Transaction not found',
          message: lookupError ? `Lookup failed: ${lookupError}` : 'Transaction not found. Webhook may still be processing.',
          hasTransaction: false
        }, { status: 200 });
      }
    }

    console.log('[API GET] Found existing transaction:', {
      id: transaction.id,
      eventId: transaction.eventId,
      paymentReference: transaction.paymentReference,
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      email: transaction.email
    });

    // Get event details
    let eventDetails = transaction.event;
    if (!eventDetails?.id && transaction.eventId) {
      console.log('[API GET] Fetching event details for eventId:', transaction.eventId);
      eventDetails = await fetchEventDetailsByIdServer(transaction.eventId);
      console.log('[API GET] Event details fetched:', {
        id: eventDetails?.id,
        title: eventDetails?.title
      });
    }

    // Check if this is a mobile request that should skip QR fetching
    // The skip_qr parameter prevents duplicate emails by ensuring QR is only fetched once
    const skipQr = searchParams.get('skip_qr') === 'true';

    // Get QR code data - skip for mobile flows
    let qrCodeData = null;
    if (!skipQr && transaction.id && eventDetails?.id) {
      console.log('[API GET] Attempting to fetch QR code:', {
        transactionId: transaction.id,
        eventId: eventDetails.id,
        hasRequiredIds: true
      });
      try {
        qrCodeData = await fetchTransactionQrCode(eventDetails.id, transaction.id);
        console.log('[API GET] QR code fetch SUCCESS:', {
          hasQrCodeData: !!qrCodeData,
          qrCodeImageUrl: qrCodeData?.qrCodeImageUrl?.substring(0, 100) + '...'
        });
      } catch (err: any) {
        console.error('[API GET] QR code fetch FAILED:', {
          error: err.message,
          transactionId: transaction.id,
          eventId: eventDetails.id,
          stack: err.stack
        });
        qrCodeData = null;
      }
    } else if (skipQr) {
      console.log('[API GET] Skipping QR code fetch - mobile flow detected (prevents duplicate emails)');
    } else {
      console.log('[API GET] Skipping QR code fetch - missing required IDs:', {
        hasTransactionId: !!transaction.id,
        hasEventId: !!eventDetails?.id,
        transactionId: transaction.id,
        eventId: eventDetails?.id
      });
    }

    // Fetch transaction items and ticket type names
    let transactionItems = [];
    if (transaction.id) {
      transactionItems = await fetchTransactionItemsByTransactionId(transaction.id as number);
      const ticketTypeCache: Record<number, any> = {};
      for (const item of transactionItems) {
        if (!item.ticketTypeName && item.ticketTypeId) {
          if (!ticketTypeCache[item.ticketTypeId as number]) {
            const ticketType = await fetchTicketTypeById(item.ticketTypeId as number);
            ticketTypeCache[item.ticketTypeId as number] = ticketType;
          }
          item.ticketTypeName = ticketTypeCache[item.ticketTypeId as number]?.name || `Ticket Type #${item.ticketTypeId}`;
        }
      }
    }

    // Fetch hero image URL
    let heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id as number) : null;

    return NextResponse.json({
      transaction,
      userProfile: null, // No user profile for GET requests
      eventDetails,
      qrCodeData,
      transactionItems,
      heroImageUrl
    });
  } catch (err: any) {
    console.error('[API GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}