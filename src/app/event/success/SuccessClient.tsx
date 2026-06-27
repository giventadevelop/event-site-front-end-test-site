"use client";
import { useEffect, useState } from "react";
import LoadingTicket from "./LoadingTicket";
import Image from "next/image";
import {
  FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaUser, FaEnvelope,
  FaMoneyBillWave, FaInfoCircle, FaReceipt, FaMapPin, FaClock, FaTags
} from "react-icons/fa";
import { formatInTimeZone } from "date-fns-tz";
import LocationDisplay from '@/components/LocationDisplay';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendTicketEmailAsync } from '@/lib/emailUtils';
import MobileDebugConsole from '@/components/MobileDebugConsole';

interface SuccessClientProps {
  session_id: string;
  payment_intent?: string;
}

function formatTime(time: string): string {
  if (!time) return '';
  if (time.match(/AM|PM/i)) return time;
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export default function SuccessClient({ session_id, payment_intent }: SuccessClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [readyToShowNotFound, setReadyToShowNotFound] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mobile detection and redirect logic - show brief success then redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enhanced debug logging - now inside useEffect
    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] SuccessClient component mounted');
    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] Props:', { session_id, payment_intent });
    console.log('[MOBILE-DETECTION] User Agent:', navigator.userAgent);
    console.log('[MOBILE-DETECTION] URL:', window.location.href);
    console.log('[MOBILE-DETECTION] Referrer:', document.referrer);
    console.log('[MOBILE-DETECTION] Window dimensions:', {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
    });
    console.log('[MOBILE-DETECTION] Platform:', {
      platform: navigator.platform,
      userAgentData: (navigator as any).userAgentData,
    });

    // Enhanced mobile detection with multiple methods
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // Method 1: User agent regex (primary method) - ENHANCED with more patterns
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);

    // Method 2: Platform detection
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(platform);

    // Method 3: Screen width detection (only for mobile if ALSO has mobile user agent)
    // CRITICAL: Don't use screen width alone - desktop browsers can have narrow windows
    const narrowScreenMatch = window.innerWidth <= 768;
    const hasMobileUserAgent = mobileRegexMatch || platformMatch;

    // Method 4: Touch capability (only relevant if also has mobile user agent)
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Method 5: User agent data API (if available)
    const userAgentData = (navigator as any).userAgentData;
    const isMobileFromUA = userAgentData?.mobile || false;

    // CRITICAL: Desktop detection fix - Only consider mobile if:
    // 1. User agent indicates mobile (primary method), OR
    // 2. User agent data API says mobile, OR
    // 3. Narrow screen AND mobile user agent (not just narrow screen alone)
    // This prevents desktop browsers with narrow windows from being detected as mobile
    const isMobile = mobileRegexMatch || platformMatch || isMobileFromUA || (hasMobileUserAgent && narrowScreenMatch);

    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] Mobile Detection Analysis:');
    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] Method 1 - User Agent Regex:', {
      match: mobileRegexMatch,
      userAgent: userAgent.substring(0, 100),
      matchedPattern: mobileRegexMatch ? userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i)?.[0] : null,
    });
    console.log('[MOBILE-DETECTION] Method 2 - Platform Detection:', {
      match: platformMatch,
      platform: platform,
    });
    console.log('[MOBILE-DETECTION] Method 3 - Screen Width:', {
      match: narrowScreenMatch,
      innerWidth: window.innerWidth,
      threshold: 768,
    });
    console.log('[MOBILE-DETECTION] Method 4 - Touch Capability:', {
      hasTouchScreen,
      maxTouchPoints: navigator.maxTouchPoints,
    });
    console.log('[MOBILE-DETECTION] Method 5 - User Agent Data API:', {
      available: !!userAgentData,
      isMobileFromUA,
      userAgentData: userAgentData ? JSON.stringify(userAgentData) : 'N/A',
    });
    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] FINAL RESULT:', {
      isMobile,
      detectionMethods: {
        userAgentRegex: mobileRegexMatch,
        platformMatch: platformMatch,
        narrowScreen: narrowScreenMatch,
        touchScreen: hasTouchScreen && narrowScreenMatch,
        userAgentData: isMobileFromUA,
      },
      session_id,
      payment_intent,
      timestamp: new Date().toISOString(),
    });
    console.log('[MOBILE-DETECTION] ============================================');

    // Set mobile detection state immediately to prevent desktop data fetching
    setIsMobileDevice(isMobile);

    if (isMobile) {
      console.log('[MOBILE-DETECTION] ✅✅✅ MOBILE BROWSER DETECTED - Will redirect to /event/ticket-qr');

      // Determine which identifier to use and store, with robust URL/sessionStorage fallbacks
      let identifier: string | null = session_id || payment_intent || null;
      if (!identifier) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          identifier = urlParams.get('session_id') || urlParams.get('pi') || null;
        } catch { }
      }
      if (!identifier) {
        try {
          identifier = sessionStorage.getItem('stripe_session_id') || sessionStorage.getItem('stripe_payment_intent') || null;
        } catch { }
      }
      if (!identifier) {
        console.log('[SuccessClient] ERROR: Missing both session_id and payment_intent');
        setError('Missing session ID or payment intent');
        setLoading(false);
        return;
      }

      // Show brief success message then redirect after 2 seconds
      setLoading(false);
      const resolvedSessionId: string | undefined = session_id || (typeof identifier === 'string' && identifier.startsWith('cs_') ? (identifier as string) : undefined);
      const resolvedPi: string | undefined = payment_intent || (typeof identifier === 'string' && identifier.startsWith('pi_') ? (identifier as string) : undefined);

      setResult({
        isMobileBrief: true,
        identifier,
        session_id: resolvedSessionId,
        payment_intent: resolvedPi
      });

      setTimeout(() => {
        console.log('[MOBILE-DETECTION] ============================================');
        console.log('[MOBILE-DETECTION] About to redirect to /event/ticket-qr');
        console.log('[MOBILE-DETECTION] ============================================');
        console.log('[MOBILE-DETECTION] Redirect preparation:', {
          session_id,
          payment_intent,
          identifier,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString(),
        });

        // Store the identifier in sessionStorage for QR page
        if (session_id || (identifier && (identifier as string).startsWith('cs_'))) {
          const sid = session_id || (identifier as string);
          const redirectUrl = `/event/ticket-qr?session_id=${encodeURIComponent(sid)}`;
          console.log('[MOBILE-DETECTION] ✅ Redirecting with session_id:', {
            session_id: sid,
            redirectUrl,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString(),
          });
          try {
            sessionStorage.setItem('stripe_session_id', sid);
            console.log('[MOBILE-DETECTION] ✅ Stored session_id in sessionStorage');
          } catch (e) {
            console.error('[MOBILE-DETECTION] ⚠️ Failed to store in sessionStorage:', e);
          }
          console.log('[MOBILE-DETECTION] ✅ Calling router.replace()...');
          router.replace(redirectUrl);
          console.log('[MOBILE-DETECTION] ✅ router.replace() called - redirect should happen now');
        } else if (payment_intent || (identifier && (identifier as string).startsWith('pi_'))) {
          const pid = payment_intent || (identifier as string);
          const redirectUrl = `/event/ticket-qr?pi=${encodeURIComponent(pid)}`;
          console.log('[MOBILE-DETECTION] ✅ Redirecting with payment_intent:', {
            payment_intent: pid,
            redirectUrl,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString(),
          });
          try {
            sessionStorage.setItem('stripe_payment_intent', pid);
            console.log('[MOBILE-DETECTION] ✅ Stored payment_intent in sessionStorage');
          } catch (e) {
            console.error('[MOBILE-DETECTION] ⚠️ Failed to store in sessionStorage:', e);
          }
          console.log('[MOBILE-DETECTION] ✅ Calling router.replace()...');
          router.replace(redirectUrl);
          console.log('[MOBILE-DETECTION] ✅ router.replace() called - redirect should happen now');
        } else {
          console.error('[MOBILE-DETECTION] ⚠️⚠️⚠️ ERROR: No session_id or payment_intent to redirect with!', {
            session_id,
            payment_intent,
            identifier,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString(),
          });
        }
        console.log('[MOBILE-DETECTION] ============================================');
      }, 2000);

      return;
    }

    // Desktop flow - continue with normal success page
    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] ❌ DESKTOP BROWSER DETECTED - Staying on success page');
    console.log('[MOBILE-DETECTION] ============================================');
    console.log('[MOBILE-DETECTION] Desktop flow will continue with normal success page');
    console.log('[MOBILE-DETECTION] No redirect to /event/ticket-qr');
    console.log('[MOBILE-DETECTION] ============================================');
  }, [session_id, payment_intent, router]);

  // Email sending effect for desktop flow - trigger when QR code is successfully loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only send email in desktop flow when QR code is successfully loaded
    if (result?.transaction && result?.eventDetails && result?.qrCodeData && !result?.isMobileBrief) {
      const { transaction, eventDetails } = result;

      // Check if we have the required data for email sending
      if (transaction.id && eventDetails.id && transaction.email) {
        console.log('[DESKTOP SUCCESS] QR code loaded successfully, sending ticket email:', {
          eventId: eventDetails.id,
          transactionId: transaction.id,
          email: transaction.email
        });

        // Send email asynchronously after QR code is displayed
        sendTicketEmailAsync({
          eventId: eventDetails.id,
          transactionId: transaction.id,
          email: transaction.email
        });
      }
    }
  }, [result]);

  // Helper to get ticket number from either camelCase or snake_case, or fallback to 'TKTN'+id
  function getTicketNumber(transaction: any) {
    return (
      transaction?.transactionReference ||
      transaction?.transaction_reference ||
      (transaction?.id ? `TKTN${transaction.id}` : '')
    );
  }

  // Data fetching effect for desktop flow
  useEffect(() => {
    // Skip data fetching until mobile detection is complete
    if (isMobileDevice === null) {
      console.log('[SuccessClient] Waiting for mobile detection to complete');
      return;
    }

    // Skip data fetching for mobile users - they get the brief success page
    if (isMobileDevice === true) {
      console.log('[SuccessClient] Skipping data fetch for mobile user');
      return;
    }

    console.log('[SuccessClient] Desktop user confirmed - proceeding with data fetch');
    console.log('[DESKTOP FLOW] ============================================');
    console.log('[DESKTOP FLOW] Desktop browser detected - using GET-only flow');
    console.log('[DESKTOP FLOW] Desktop will NOT call POST endpoint (mobile-only)');
    console.log('[DESKTOP FLOW] Desktop will poll GET endpoint if transaction not found');
    console.log('[DESKTOP FLOW] Webhook should create transaction automatically');
    console.log('[DESKTOP FLOW] ============================================');

    // Desktop data fetching logic
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        console.log('[DESKTOP FLOW] Desktop - starting data fetch');
        console.log('[DESKTOP FLOW] Fetching with identifiers:', { session_id, payment_intent });
        // 1. Try to GET the transaction by session_id or payment_intent (PRB/mobile style)
        if (!session_id && !payment_intent) {
          console.error('[DESKTOP SUCCESS DEBUG] Missing both session_id and payment_intent');
          setError('Missing session ID or payment intent');
          setLoading(false);
          return;
        }
        const getQuery = session_id
          ? `session_id=${encodeURIComponent(session_id)}`
          : `pi=${encodeURIComponent(payment_intent as string)}`;
        const getUrl = `/api/event/success/process?${getQuery}&_t=${Date.now()}`;
        console.log('[DESKTOP FLOW] GET request URL:', getUrl);
        console.log('[DESKTOP FLOW] Desktop flow uses GET-only (no POST fallback)');

        const getRes = await fetch(getUrl, {
          cache: 'no-store'
        });

        console.log('[DESKTOP FLOW] GET response status:', getRes.status);

        if (getRes.ok) {
          const data = await getRes.json();
          console.log('[DESKTOP SUCCESS DEBUG] GET response data:', {
            hasTransaction: !!data.transaction,
            transactionId: data.transaction?.id,
            error: data.error,
            message: data.message,
            responseKeys: Object.keys(data),
            timestamp: new Date().toISOString()
          });

          if (data.transaction) {
            console.log('[DESKTOP FLOW] ✅ Transaction found in GET response:', data.transaction.id);
            console.log('[DESKTOP FLOW] ✅ Desktop flow successful - transaction loaded via GET');
            if (!cancelled) {
              setResult(data);
            }
            setLoading(false);
            return;
          } else {
            // Log why transaction wasn't found
            console.log('[DESKTOP FLOW] Initial GET: Transaction not found', {
              error: data.error,
              message: data.message,
              note: 'Will start polling for webhook-processed transaction'
            });
            // CRITICAL: Desktop flow should NOT create transactions - webhook handles that
            // If transaction not found, wait/poll for webhook to process it
            console.log('[DESKTOP FLOW] ⚠️ No transaction found - webhook may still be processing');
            console.log('[DESKTOP FLOW] Desktop flow will poll GET endpoint (webhook should create transaction)');
            console.log('[DESKTOP FLOW] Desktop will NOT call POST endpoint (mobile-only)');

            // CRITICAL: Desktop flow should NOT create transactions - webhook handles that
            // Poll GET endpoint to wait for webhook to create transaction
            // Increase polling attempts and interval for desktop (webhook may take longer)
            let pollAttempt = 0;
            const MAX_POLL_ATTEMPTS = 10; // Increased from 5 to 10 for desktop
            const POLL_INTERVAL = 3000; // Increased from 2s to 3s for desktop

            console.log(`[DESKTOP FLOW] Starting polling loop - waiting for webhook to create transaction...`);
            console.log(`[DESKTOP FLOW] Will poll up to ${MAX_POLL_ATTEMPTS} times with ${POLL_INTERVAL}ms intervals`);

            while (pollAttempt < MAX_POLL_ATTEMPTS && !cancelled) {
              pollAttempt++;
              console.log(`[DESKTOP FLOW] Polling attempt ${pollAttempt}/${MAX_POLL_ATTEMPTS} - waiting for webhook...`);

              // Wait before polling (except first attempt which already waited)
              if (pollAttempt > 1) {
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
              }

              // Update URL timestamp to prevent caching
              const pollUrl = `/api/event/success/process?${getQuery}&_t=${Date.now()}&_poll=${pollAttempt}`;
              console.log(`[DESKTOP FLOW] Polling URL: ${pollUrl}`);

              try {
                const pollRes = await fetch(pollUrl, { cache: 'no-store' });
                console.log(`[DESKTOP FLOW] Poll response status (attempt ${pollAttempt}):`, pollRes.status);

                if (pollRes.ok) {
                  const pollData = await pollRes.json();
                  console.log(`[DESKTOP FLOW] Poll response data (attempt ${pollAttempt}):`, {
                    hasTransaction: !!pollData.transaction,
                    transactionId: pollData.transaction?.id,
                    error: pollData.error,
                    message: pollData.message,
                    responseKeys: Object.keys(pollData),
                    timestamp: new Date().toISOString()
                  });

                  if (pollData.transaction) {
                    console.log('[DESKTOP FLOW] ✅ Transaction found after polling:', pollData.transaction.id);
                    console.log('[DESKTOP FLOW] ✅ Desktop flow successful - transaction loaded via GET polling');
                    if (!cancelled) {
                      setResult(pollData);
                    }
                    setLoading(false);
                    return;
                  } else {
                    // Log why transaction wasn't found
                    console.log(`[DESKTOP FLOW] Poll attempt ${pollAttempt}: Transaction not found yet`, {
                      error: pollData.error,
                      message: pollData.message,
                      note: 'Webhook may still be processing the transaction'
                    });
                  }
                } else {
                  const errorText = await pollRes.text();
                  console.warn(`[DESKTOP FLOW] Poll request failed (attempt ${pollAttempt}):`, {
                    status: pollRes.status,
                    statusText: pollRes.statusText,
                    errorText,
                    timestamp: new Date().toISOString()
                  });
                }
              } catch (pollErr: any) {
                console.warn(`[DESKTOP FLOW] Poll request error (attempt ${pollAttempt}):`, pollErr?.message);
                // Continue polling even if one request fails
              }
            }

            // If still not found after polling, show helpful error message
            console.error('[DESKTOP FLOW] ⚠️⚠️⚠️ Transaction not found after polling:', {
              pollAttempts: MAX_POLL_ATTEMPTS,
              pollInterval: POLL_INTERVAL,
              totalWaitTime: `${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds`,
              paymentIntentId: payment_intent || session_id,
              note: 'Webhook may be delayed or failed. Desktop flow did NOT call POST endpoint (correct behavior).',
              timestamp: new Date().toISOString()
            });
            if (!cancelled) {
              setError(
                `Your payment was successful, but we're still processing your ticket. ` +
                `We checked ${MAX_POLL_ATTEMPTS} times over ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds, ` +
                `but the transaction hasn't been created yet. ` +
                `This usually means the webhook is delayed. ` +
                `Please wait a moment and refresh this page, or check your email for confirmation. ` +
                `Payment Intent: ${payment_intent || session_id || 'N/A'}`
              );
            }
            setLoading(false);
            return;
          }
        } else {
          const errorText = await getRes.text();
          console.error('[DESKTOP FLOW] GET request failed:', getRes.status, errorText);
          console.error('[DESKTOP FLOW] Desktop flow did NOT call POST endpoint (correct behavior)');
          if (!cancelled) {
            setError(`Failed to fetch transaction: ${errorText}`);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('[DESKTOP FLOW] Error in fetchData:', err);
          console.error('[DESKTOP FLOW] Error details:', {
            message: err?.message,
            stack: err?.stack,
            session_id,
            payment_intent
          });
          console.error('[DESKTOP FLOW] Desktop flow did NOT call POST endpoint (correct behavior)');
          setError(err?.message || "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [session_id, isMobileDevice]);


  if (loading) {
    return <LoadingTicket sessionId={session_id} />;
  }
  if (error) {
    console.error('[SuccessClient] Error state:', error);
    console.error('[SuccessClient] Error context:', {
      session_id,
      payment_intent,
      isMobileDevice
    });

    // Check if this is a desktop flow transaction-not-found error
    const isTransactionNotFoundError = error.includes('Transaction is still being processed') ||
                                      error.includes('Transaction not found');

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <FaInfoCircle className={`text-4xl ${isTransactionNotFoundError ? 'text-yellow-500' : 'text-red-500'} mb-4`} />
        <h1 className="text-2xl font-bold text-gray-800">
          {isTransactionNotFoundError ? 'Processing Your Payment' : 'Error'}
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">{error}</p>

        {isTransactionNotFoundError && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-500">
              Your payment was successful, but we're still processing your ticket. This usually takes a few moments.
            </p>
            <button
              onClick={() => {
                console.log('[DESKTOP FLOW] User clicked refresh button');
                setError(null);
                setLoading(true);
                // Trigger re-fetch by updating a dependency
                window.location.reload();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Refresh Page
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Payment Intent: {payment_intent || session_id || 'N/A'}
            </p>
          </div>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return Home
        </button>

        {/* Mobile Debug Console */}
        <MobileDebugConsole />
      </div>
    );
  }

  // Handle mobile brief success display
  if (result?.isMobileBrief) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <FaCheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your tickets are confirmed.</p>
        <div className="flex items-center justify-center gap-2 text-teal-600">
          <FaTicketAlt className="animate-bounce" />
          <span className="text-lg font-semibold">Preparing your tickets...</span>
        </div>
        <p className="text-sm text-gray-500 mt-4">You will be redirected to view your tickets in a moment.</p>
      </div>
    );
  }

  const { transaction, userProfile, eventDetails, qrCodeData, transactionItems, heroImageUrl: fetchedHeroImageUrl } = result || {};

  // Clear hero image storage since we're on success page
  if (fetchedHeroImageUrl) {
    // Don't update heroImageUrl state, handled by component
    // Clear storage since we have the actual data now
    sessionStorage.removeItem('eventHeroImageUrl');
    sessionStorage.removeItem('eventId');
    localStorage.removeItem('eventHeroImageUrl');
    localStorage.removeItem('eventId');
  }
  if (!transaction) {
    console.error('[SuccessClient] Transaction not found');
    console.error('[SuccessClient] Transaction context:', {
      session_id,
      payment_intent,
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : []
    });

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <FaInfoCircle className="text-4xl text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Transaction Not Found</h1>
        <p className="text-gray-600 mt-2">We could not find the details for your transaction. Please check your email for a confirmation.</p>
        <p className="text-sm text-gray-500 mt-2">Payment Intent: {payment_intent || 'N/A'}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return Home
        </button>

        {/* Mobile Debug Console */}
        <MobileDebugConsole />
      </div>
    );
  }
  const displayName = transaction?.firstName || '';
  let qrError: string | null = null;
  // If qrCodeData is an error object, handle it
  if (qrCodeData && qrCodeData.error) qrError = qrCodeData.error;


  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>

      {/* HERO SECTION - Full width bleeding to header */}
      <section className="hero-section" style={{
        position: 'relative',
        marginTop: '0',
        backgroundColor: 'transparent',
        minHeight: '400px',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0 0 0'
      }}>
        <img
          src={fetchedHeroImageUrl || "/images/default_placeholder_hero_image.jpeg"}
          alt="Event Hero"
          className="hero-image"
          style={{
            margin: '0 auto',
            padding: '0',
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '0'
          }}
        />
        <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
      </section>

      {/* Responsive Hero Image CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center;
            display: block;
            margin: 0 auto;
            padding: 0;
            border-radius: 0;
          }

          .hero-section {
            min-height: 15vh;
            background-color: transparent !important;
            padding: 80px 0 0 0 !important;
            width: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          @media (max-width: 768px) {
            .hero-image {
              width: 100%;
              max-width: 100%;
              height: auto;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              padding: 80px 0 0 0 !important;
              min-height: 12vh !important;
            }
          }

          @media (max-width: 480px) {
            .hero-image {
              width: 100%;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              padding: 80px 0 0 0 !important;
              min-height: 10vh !important;
            }
          }
        `
      }} />

      {/* Main content container - ui_style_guide.mdc compliant */}
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ marginTop: '80px' }}>
        {/* Enhanced Warning Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> Please do not refresh this page, use the back button, or press F5.
                Your payment has been processed successfully. If you need to return to the home page,
                use the navigation menu above. Any attempt to refresh or go back will redirect you to the homepage.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Success Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-white -mt-16 mb-4">
              <FaCheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Payment Successful!</h1>
            <p className="mt-2 text-gray-600">
              Thank you for your purchase. Your tickets for <strong>{eventDetails.title}</strong> are confirmed.<br />
              A confirmation is sent to your email: <strong>{transaction.email}</strong>
            </p>
          </div>
        </div>

        {/* Event Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {eventDetails.title}
          </h2>
          {eventDetails.caption && (
            <div className="text-lg text-teal-700 font-semibold mb-4">{eventDetails.caption}</div>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>{formatInTimeZone(eventDetails.startDate, eventDetails.timezone, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>
                {formatTime(eventDetails.startTime)}{eventDetails.endTime ? ` - ${formatTime(eventDetails.endTime)}` : ''}
                {' '}
                ({formatInTimeZone(eventDetails.startDate, eventDetails.timezone, 'zzz')})
              </span>
            </div>
            {eventDetails.location && (
              <div className="flex items-center gap-2">
                <LocationDisplay location={eventDetails.location} />
              </div>
            )}
          </div>
          {eventDetails.description && <p className="text-gray-700 text-base">{eventDetails.description}</p>}
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          {!qrCodeData && !qrError && (
            <div className="text-lg text-teal-700 font-semibold flex items-center justify-center gap-2">
              <FaTicketAlt className="animate-bounce" />
              Please wait while your tickets are created…
            </div>
          )}
          {qrError && (
            <div className="text-red-500 font-semibold">{qrError}</div>
          )}
          {qrCodeData && (
            <>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-lg font-semibold text-gray-800">Your Ticket QR Code</div>
                {qrCodeData.qrCodeImageUrl ? (
                  <img src={qrCodeData.qrCodeImageUrl} alt="Ticket QR Code" className="mx-auto w-48 h-48 object-contain border border-gray-300 rounded-lg shadow" />
                ) : qrCodeData.qrCodeData ? (
                  <div className="bg-gray-100 p-4 rounded text-xs break-all max-w-full">{qrCodeData.qrCodeData}</div>
                ) : (
                  <div className="text-gray-500">QR code not available.</div>
                )}

                {/* Email Status Section */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaEnvelope className="text-sm" />
                    <span className="text-sm font-medium">Ticket email sent to {transaction.email}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Check your email for your tickets. If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-6">
            <FaReceipt className="text-teal-500" />
            Transaction Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {getTicketNumber(transaction) && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><FaTicketAlt /> Ticket #</label>
                <p className="text-lg text-gray-800 font-medium">{getTicketNumber(transaction)}</p>
              </div>
            )}
            {displayName && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><FaUser /> Name</label>
                <p className="text-lg text-gray-800 font-medium">{displayName}</p>
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><FaEnvelope /> Email</label>
              <p className="text-lg text-gray-800 font-medium">{transaction.email}</p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><FaCalendarAlt /> Date of Purchase</label>
              <p className="text-lg text-gray-800 font-medium">{new Date(transaction.purchaseDate).toLocaleString()}</p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><FaMoneyBillWave /> Amount Paid</label>
              <p className="text-lg text-gray-800 font-medium">${(transaction.finalAmount ?? transaction.totalAmount ?? 0).toFixed(2)}</p>
            </div>
            {(transaction.discountAmount ?? 0) > 0 && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><FaTags /> Discount Applied</label>
                <p className="text-lg text-green-600 font-medium">-${transaction.discountAmount.toFixed(2)}</p>
              </div>
            )}
            {(transaction.discountAmount ?? 0) > 0 && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Amount:</span>
                    <span className="text-gray-800">${(transaction.totalAmount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-${transaction.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-800 font-semibold">Final Amount:</span>
                    <span className="text-gray-800 font-semibold">${(transaction.finalAmount ?? transaction.totalAmount ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Item Breakdown */}
        {transactionItems && transactionItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-6">
              <FaTicketAlt className="text-teal-500" />
              Ticket Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ticket Type</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Price Per Unit</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactionItems.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.ticketTypeName || `Ticket Type #${item.ticketTypeId}`}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">${item.pricePerUnit.toFixed(2)}</td>
                      <td className="px-4 py-2">${item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}