import { NextRequest, NextResponse } from 'next/server';
import { getTenantId, getAppUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

const APP_URL = getAppUrl();

/**
 * Donation Success Processing Route
 * 
 * Similar to /api/event/success/process, but for donation-based checkout flows.
 * Handles both desktop and mobile flows for donation transactions.
 * 
 * GET: Lookup existing donation transaction or create if webhook hasn't processed (desktop only)
 * POST: Create donation transaction from GiveButter data (mobile fallback)
 */

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

/**
 * POST Handler - Create donation transaction from GiveButter data
 * Used by mobile flow as fallback if webhook hasn't processed yet
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, donationId, eventId, skip_qr } = body;

    // CRITICAL: Server-side mobile detection for CloudWatch logging
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

    // Enhanced mobile detection (same logic as client-side)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    console.log('[DONATION-SUCCESS-PROCESS] [SERVER-SIDE] POST request:', {
      transactionId,
      donationId,
      eventId,
      skip_qr,
      isMobile,
      userAgent: userAgent.substring(0, 100),
    });

    if (!transactionId && !donationId) {
      return NextResponse.json({ error: 'Missing transactionId or donationId' }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Import donation transaction lookup functions
    const { findDonationTransactionByTransactionId, findDonationTransactionByDonationId } = await import('@/app/events/[id]/donation/success/ApiServerActions');

    // First check if transaction already exists
    let existingTransaction = null;
    if (transactionId) {
      existingTransaction = await findDonationTransactionByTransactionId(transactionId, eventId);
    } else if (donationId) {
      existingTransaction = await findDonationTransactionByDonationId(donationId, eventId);
    }

    if (existingTransaction) {
      console.log('[DONATION-SUCCESS-PROCESS] Transaction already exists:', existingTransaction.id);
      
      // Get event details
      const eventRes = await fetch(`${APP_URL}/api/proxy/event-details/${eventId}`, { cache: 'no-store' });
      const eventDetails = eventRes.ok ? await eventRes.json() : null;

      // Get QR code data - skip for mobile flows
      let qrCodeData = null;
      if (!skip_qr && existingTransaction.id && eventDetails?.id) {
        try {
          const qrRes = await fetchWithJwtRetry(
            `${APP_URL}/api/proxy/events/${eventId}/donations/${existingTransaction.id}/qrcode`,
            { method: 'POST', cache: 'no-store' },
            'fetchDonationQRCode'
          );
          if (qrRes.ok) {
            qrCodeData = await qrRes.json();
          }
        } catch (err) {
          console.error('[DONATION-SUCCESS-PROCESS] Failed to fetch QR code:', err);
        }
      }

      // Fetch hero image URL
      const heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id) : null;

      return NextResponse.json({
        transaction: existingTransaction,
        eventDetails,
        qrCodeData,
        heroImageUrl,
        hasTransaction: true
      });
    }

    // If no existing transaction, try to create from GiveButter data
    // This is a fallback if webhook hasn't processed yet
    if (donationId) {
      console.log('[DONATION-SUCCESS-PROCESS] No transaction found, creating from GiveButter donation:', donationId);
      
      try {
        // Fetch donation status from GiveButter API via backend
        const statusRes = await fetchWithJwtRetry(
          `${APP_URL}/api/proxy/givebutter/donations/${donationId}/status`,
          { method: 'GET', cache: 'no-store' },
          'getGiveButterDonationStatus'
        );

        if (statusRes.ok) {
          const givebutterData = await statusRes.json();
          
          if (givebutterData.status === 'completed' || givebutterData.status === 'succeeded') {
            // Create donation transaction from GiveButter data
            const createRes = await fetchWithJwtRetry(
              `${APP_URL}/api/proxy/donations/create-from-givebutter`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventId: parseInt(eventId),
                  givebutterDonationId: donationId,
                  givebutterData: givebutterData,
                }),
                cache: 'no-store',
              },
              'createDonationFromGiveButter'
            );

            if (createRes.ok) {
              const createdTransaction = await createRes.json();
              
              // Get event details
              const eventRes = await fetch(`${APP_URL}/api/proxy/event-details/${eventId}`, { cache: 'no-store' });
              const eventDetails = eventRes.ok ? await eventRes.json() : null;

              // Get QR code data - skip for mobile flows
              let qrCodeData = null;
              if (!skip_qr && createdTransaction.id && eventDetails?.id) {
                try {
                  const qrRes = await fetchWithJwtRetry(
                    `${APP_URL}/api/proxy/events/${eventId}/donations/${createdTransaction.id}/qrcode`,
                    { method: 'POST', cache: 'no-store' },
                    'fetchDonationQRCode'
                  );
                  if (qrRes.ok) {
                    qrCodeData = await qrRes.json();
                  }
                } catch (err) {
                  console.error('[DONATION-SUCCESS-PROCESS] Failed to fetch QR code:', err);
                }
              }

              // Fetch hero image URL
              const heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id) : null;

              return NextResponse.json({
                transaction: createdTransaction,
                eventDetails,
                qrCodeData,
                heroImageUrl,
                hasTransaction: true
              });
            }
          }
        }
      } catch (createErr: any) {
        console.error('[DONATION-SUCCESS-PROCESS] Error creating donation transaction:', createErr);
        return NextResponse.json({
          transaction: null,
          error: createErr?.message || 'Failed to create transaction',
          message: 'Could not create transaction from GiveButter data'
        }, { status: 200 });
      }
    }

    return NextResponse.json({
      transaction: null,
      error: 'Transaction not found',
      message: 'Could not find or create donation transaction'
    }, { status: 200 });

  } catch (err: any) {
    console.error('[DONATION-SUCCESS-PROCESS] POST handler error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET Handler - Lookup existing donation transaction or create if webhook hasn't processed (desktop only)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');
    const donationId = searchParams.get('donationId');
    const eventId = searchParams.get('eventId');
    const _poll = searchParams.get('_poll');

    // CRITICAL: Server-side mobile detection for CloudWatch logging
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

    // Enhanced mobile detection (same logic as client-side)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    console.log('[DONATION-SUCCESS-PROCESS] [SERVER-SIDE] GET request:', {
      transactionId,
      donationId,
      eventId,
      _poll,
      isMobile,
      userAgent: userAgent.substring(0, 100),
    });

    if (!transactionId && !donationId) {
      return NextResponse.json({ error: 'Missing transactionId or donationId' }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Import donation transaction lookup functions
    const { findDonationTransactionByTransactionId, findDonationTransactionByDonationId } = await import('@/app/events/[id]/donation/success/ApiServerActions');

    // Only look up existing transactions, do not create
    let transaction = null;

    try {
      if (transactionId) {
        transaction = await findDonationTransactionByTransactionId(transactionId, eventId);
      } else if (donationId) {
        transaction = await findDonationTransactionByDonationId(donationId, eventId);
      }
    } catch (err: any) {
      console.error('[DONATION-SUCCESS-PROCESS] Error during transaction lookup:', err);
    }

    if (transaction) {
      console.log('[DONATION-SUCCESS-PROCESS] Transaction found:', transaction.id);
      
      // Get event details
      const eventRes = await fetch(`${APP_URL}/api/proxy/event-details/${eventId}`, { cache: 'no-store' });
      const eventDetails = eventRes.ok ? await eventRes.json() : null;

      // Get QR code data
      let qrCodeData = null;
      if (transaction.id && eventDetails?.id) {
        try {
          const qrRes = await fetchWithJwtRetry(
            `${APP_URL}/api/proxy/events/${eventId}/donations/${transaction.id}/qrcode`,
            { method: 'POST', cache: 'no-store' },
            'fetchDonationQRCode'
          );
          if (qrRes.ok) {
            qrCodeData = await qrRes.json();
          }
        } catch (err) {
          console.error('[DONATION-SUCCESS-PROCESS] Failed to fetch QR code:', err);
        }
      }

      // Fetch hero image URL
      const heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id) : null;

      return NextResponse.json({
        transaction,
        eventDetails,
        qrCodeData,
        heroImageUrl,
        hasTransaction: true
      });
    }

    // No transaction found
    console.log('[DONATION-SUCCESS-PROCESS] No existing transaction found', {
      transactionId,
      donationId,
      eventId,
      isMobile,
      note: isMobile ? 'Mobile flow will handle transaction creation via POST' : 'Desktop flow will poll for webhook-processed transaction'
    });

    // CRITICAL: Desktop flow - create transaction immediately if webhook hasn't processed
    // This follows the same pattern as Stripe checkout flow
    if (!isMobile && donationId) {
      console.log('[DONATION-SUCCESS-PROCESS] [DESKTOP FLOW] No transaction found - attempting to create from GiveButter donation:', donationId);
      
      try {
        // Fetch donation status from GiveButter API via backend
        const statusRes = await fetchWithJwtRetry(
          `${APP_URL}/api/proxy/givebutter/donations/${donationId}/status`,
          { method: 'GET', cache: 'no-store' },
          'getGiveButterDonationStatus'
        );

        if (statusRes.ok) {
          const givebutterData = await statusRes.json();
          
          // Only create transaction if donation is completed
          if (givebutterData.status === 'completed' || givebutterData.status === 'succeeded') {
            // Create donation transaction from GiveButter data
            const createRes = await fetchWithJwtRetry(
              `${APP_URL}/api/proxy/donations/create-from-givebutter`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventId: parseInt(eventId),
                  givebutterDonationId: donationId,
                  givebutterData: givebutterData,
                }),
                cache: 'no-store',
              },
              'createDonationFromGiveButter'
            );

            if (createRes.ok) {
              const createdTransaction = await createRes.json();
              
              // Get event details
              const eventRes = await fetch(`${APP_URL}/api/proxy/event-details/${eventId}`, { cache: 'no-store' });
              const eventDetails = eventRes.ok ? await eventRes.json() : null;

              // Get QR code data
              let qrCodeData = null;
              if (createdTransaction.id && eventDetails?.id) {
                try {
                  const qrRes = await fetchWithJwtRetry(
                    `${APP_URL}/api/proxy/events/${eventId}/donations/${createdTransaction.id}/qrcode`,
                    { method: 'POST', cache: 'no-store' },
                    'fetchDonationQRCode'
                  );
                  if (qrRes.ok) {
                    qrCodeData = await qrRes.json();
                  }
                } catch (err) {
                  console.error('[DONATION-SUCCESS-PROCESS] Failed to fetch QR code:', err);
                }
              }

              // Fetch hero image URL
              const heroImageUrl = eventDetails?.id ? await getHeroImageUrl(eventDetails.id) : null;

              return NextResponse.json({
                transaction: createdTransaction,
                eventDetails,
                qrCodeData,
                heroImageUrl,
                hasTransaction: true
              });
            }
          } else {
            console.log('[DONATION-SUCCESS-PROCESS] [DESKTOP FLOW] Donation not completed yet:', givebutterData.status);
            return NextResponse.json({
              transaction: null,
              error: 'Transaction not found',
              message: `Donation not completed yet. Status: ${givebutterData.status}`,
              hasTransaction: false
            }, { status: 200 });
          }
        }
      } catch (createErr: any) {
        console.error('[DONATION-SUCCESS-PROCESS] [DESKTOP FLOW] Error creating transaction:', createErr);
        // Don't return error - let client continue polling
      }
    }

    // Return not found - client will continue polling
    return NextResponse.json({
      transaction: null,
      error: 'Transaction not found',
      message: 'Transaction not found. Webhook may still be processing.',
      hasTransaction: false
    }, { status: 200 });

  } catch (err: any) {
    console.error('[DONATION-SUCCESS-PROCESS] GET handler error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
