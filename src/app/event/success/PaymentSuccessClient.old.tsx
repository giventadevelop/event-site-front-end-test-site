'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaUser, FaEnvelope,
  FaMoneyBillWave, FaInfoCircle, FaReceipt, FaMapPin, FaClock, FaTags
} from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { getAppUrl } from '@/lib/env';
import type { PaymentTransactionDTO, EventTicketTransactionDTO, EventDetailsDTO } from '@/types';

interface PaymentSuccessClientProps {
  transactionId: string;
  eventId?: string;
}

export default function PaymentSuccessClient({ transactionId, eventId: eventIdParam }: PaymentSuccessClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentTransaction, setPaymentTransaction] = useState<PaymentTransactionDTO | null>(null);
  const [ticketTransaction, setTicketTransaction] = useState<EventTicketTransactionDTO | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetailsDTO | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ qrCodeImageUrl: string } | null>(null);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);
  const MAX_POLLING_ATTEMPTS = 30; // 30 attempts * 2 seconds = 60 seconds max
  const POLLING_INTERVAL = 2000; // 2 seconds

  // Fetch payment status function
  async function fetchPaymentStatus(): Promise<PaymentTransactionDTO | null> {
    const baseUrl = getAppUrl();
    const paymentRes = await fetch(`${baseUrl}/api/proxy/payments/${transactionId}`, {
      cache: 'no-store',
    });

    if (!paymentRes.ok) {
      // Handle 400 Bad Request for PENDING transactions without Stripe payment intent ID
      if (paymentRes.status === 400) {
        try {
          const errorData = await paymentRes.json();
          // If transaction exists but is PENDING without payment intent, create a minimal payment object
          if (errorData.errorCode === 'STRIPE_PAYMENT_INTENT_NOT_FOUND' ||
              errorData.error?.includes('does not have a Stripe payment intent ID')) {
            console.warn('[PaymentSuccessClient] Payment transaction is PENDING without Stripe payment intent ID:', errorData);
            // Create a minimal payment transaction object for PENDING transactions
            const pendingPayment: Partial<PaymentTransactionDTO> = {
              transactionId: transactionId,
              transactionReference: transactionId,
              status: 'PENDING',
              amount: 0,
              currency: 'USD',
              eventId: eventIdParam ? parseInt(eventIdParam) : undefined,
            };
            return pendingPayment as PaymentTransactionDTO;
          } else {
            throw new Error(errorData.error || `Failed to fetch payment transaction: ${paymentRes.status}`);
          }
        } catch (parseError) {
          throw new Error(`Failed to fetch payment transaction: ${paymentRes.status}`);
        }
      } else {
        throw new Error(`Failed to fetch payment transaction: ${paymentRes.status}`);
      }
    } else {
      const responseData = await paymentRes.json();
      console.log('[PaymentSuccessClient] Payment status response:', {
        status: responseData.status,
        transactionId: responseData.transactionId,
        qrCodeUrl: responseData.qrCodeUrl, // Check if backend returns QR code URL
        ticketTransactionId: responseData.ticketTransactionId, // Check if backend returns ticket transaction ID
        emailSent: responseData.emailSent, // Check if backend returns email sent status
        eventId: responseData.eventId, // Check if backend returns event ID
        fullResponse: responseData
      });
      // Map PaymentStatusResponse to PaymentTransactionDTO format
      // Backend returns PaymentStatusResponse with transactionId (string) and status fields
      // PaymentTransactionDTO expects transactionReference (string) and status fields
      const mappedData: PaymentTransactionDTO = {
        transactionReference: responseData.transactionId || transactionId,
        tenantId: responseData.tenantId || '', // Required field, will be set by backend
        providerType: responseData.providerType || 'STRIPE',
        paymentUseCase: responseData.paymentUseCase || 'TICKET_SALE',
        status: responseData.status || 'PENDING',
        amount: responseData.amount ?? 0,
        currency: responseData.currency || 'USD',
        paymentMethod: responseData.paymentMethod,
        paymentReference: responseData.paymentReference || responseData.transactionId,
        eventId: responseData.eventId || (eventIdParam ? parseInt(eventIdParam) : undefined),
        metadata: {
          ...responseData.metadata,
          // Store ticket purchase fields in metadata for easy access
          qrCodeUrl: responseData.qrCodeUrl,
          ticketTransactionId: responseData.ticketTransactionId,
          emailSent: responseData.emailSent,
        },
        createdAt: responseData.createdAt || new Date().toISOString(),
        updatedAt: responseData.updatedAt || new Date().toISOString(),
      };

      // CRITICAL: If backend returns qrCodeUrl in payment status response, use it immediately
      if (responseData.qrCodeUrl && responseData.status === 'SUCCEEDED') {
        console.log('[PaymentSuccessClient] QR code URL received from payment status response:', responseData.qrCodeUrl);
        setQrCodeData({ qrCodeImageUrl: responseData.qrCodeUrl });
      }

      // If backend returns ticketTransactionId, use it instead of searching
      if (responseData.ticketTransactionId) {
        console.log('[PaymentSuccessClient] Ticket transaction ID received from payment status response:', responseData.ticketTransactionId);
        // We'll fetch ticket transaction details in fetchFullData if needed
      }
      console.log('[PaymentSuccessClient] Mapped payment data:', {
        status: mappedData.status,
        transactionReference: mappedData.transactionReference,
        amount: mappedData.amount
      });
      return mappedData;
    }
  }

  // Poll payment status until it reaches a terminal state
  async function pollPaymentStatus() {
    if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
      console.warn('[PaymentSuccessClient] Polling timeout reached');
      setPolling(false);
      setLoading(false);
      setError('Payment status check timed out. Please check your payment status manually.');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    pollingAttemptsRef.current++;
    console.log(`[PaymentSuccessClient] Polling attempt ${pollingAttemptsRef.current}/${MAX_POLLING_ATTEMPTS}`);

    try {
      const paymentData = await fetchPaymentStatus();

      if (paymentData) {
        console.log(`[PaymentSuccessClient] Poll ${pollingAttemptsRef.current}: Received payment data:`, {
          status: paymentData.status,
          transactionId: paymentData.transactionId,
          previousStatus: paymentTransaction?.status
        });

        setPaymentTransaction(paymentData);

        // Normalize status to uppercase for comparison (backend may return lowercase from Stripe)
        const normalizedStatus = paymentData.status?.toUpperCase() || paymentData.status;

        // Check if payment reached a terminal state
        if (normalizedStatus === 'SUCCEEDED' || normalizedStatus === 'FAILED' || normalizedStatus === 'CANCELLED') {
          console.log(`[PaymentSuccessClient] Payment reached terminal state: ${normalizedStatus} (original: ${paymentData.status})`);
          setPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // If succeeded, fetch full data and stop loading
          if (normalizedStatus === 'SUCCEEDED') {
            // Update payment data with normalized status
            const updatedPaymentData = { ...paymentData, status: 'SUCCEEDED' as const };
            setPaymentTransaction(updatedPaymentData);
            await fetchFullData(updatedPaymentData);
            setLoading(false);
          } else {
            // FAILED or CANCELLED - stop loading and show error
            setLoading(false);
            setError(`Payment ${normalizedStatus.toLowerCase()}. Please try again.`);
          }
        } else {
          // Normalize status for comparison
          const normalizedStatus = paymentData.status?.toUpperCase() || paymentData.status;

          if (normalizedStatus === 'PENDING' || normalizedStatus === 'PROCESSING' || normalizedStatus === 'INITIATED') {
            // Continue polling - keep loading and polling states active
            // Interval is already set up, so just continue
            console.log(`[PaymentSuccessClient] Payment still ${normalizedStatus} (attempt ${pollingAttemptsRef.current}/${MAX_POLLING_ATTEMPTS}), will check again in ${POLLING_INTERVAL}ms...`);
          } else {
            // Unknown status - log it but continue polling
            console.warn(`[PaymentSuccessClient] Unknown payment status: ${paymentData.status} (normalized: ${normalizedStatus}), continuing to poll...`);
          }
        }
      }
    } catch (err: any) {
      console.error('[PaymentSuccessClient] Error polling payment status:', err);
      setPolling(false);
      setLoading(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setError(err.message || 'Failed to check payment status');
    }
  }

  // Fetch full data after payment succeeds
  async function fetchFullData(paymentData: PaymentTransactionDTO) {
    try {
      const baseUrl = getAppUrl();

      // Get eventId from payment transaction or parameter
      const eventId = paymentData?.eventId || (eventIdParam ? parseInt(eventIdParam) : null);
      if (!eventId) {
        throw new Error('Event ID not found in payment transaction');
      }

      // Fetch event details if not already fetched
      if (!eventDetails) {
        const eventRes = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
          cache: 'no-store',
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEventDetails(eventData);
        }
      }

      // CRITICAL: Check if QR code URL is already in payment data metadata (from payment status response)
      if (paymentData.metadata?.qrCodeUrl && !qrCodeData) {
        console.log('[PaymentSuccessClient] Using QR code URL from payment status response metadata');
        setQrCodeData({ qrCodeImageUrl: paymentData.metadata.qrCodeUrl });
      }

      // Find corresponding EventTicketTransaction by payment reference
      let ticketTransactionId: number | null = paymentData.metadata?.ticketTransactionId || null;

      // If ticketTransactionId is already in metadata, use it
      if (ticketTransactionId) {
        console.log('[PaymentSuccessClient] Using ticket transaction ID from payment status response:', ticketTransactionId);
        // Fetch ticket transaction details
        const ticketRes = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions/${ticketTransactionId}`, {
          cache: 'no-store',
        });
        if (ticketRes.ok) {
          const ticket = await ticketRes.json();
          setTicketTransaction(ticket);
        }
      } else if (paymentData.paymentReference) {
        // Try to find by Stripe payment intent ID or session ID
        const searchParams = new URLSearchParams();
        if (paymentData.paymentReference.startsWith('pi_')) {
          searchParams.append('stripePaymentIntentId.equals', paymentData.paymentReference);
        } else if (paymentData.paymentReference.startsWith('cs_')) {
          searchParams.append('stripeCheckoutSessionId.equals', paymentData.paymentReference);
        }

        if (searchParams.toString()) {
          const ticketRes = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions?${searchParams.toString()}`, {
            cache: 'no-store',
          });
          if (ticketRes.ok) {
            const ticketData = await ticketRes.json();
            if (Array.isArray(ticketData) && ticketData.length > 0) {
              const ticket = ticketData[0];
              setTicketTransaction(ticket);
              ticketTransactionId = ticket.id;
            }
          }
        }
      }

      // Alternative: Try to find by transactionReference if paymentReference doesn't work
      if (!ticketTransactionId && paymentData.transactionReference) {
        const ticketRes = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions?transactionReference.equals=${encodeURIComponent(paymentData.transactionReference)}`, {
          cache: 'no-store',
        });
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          if (Array.isArray(ticketData) && ticketData.length > 0) {
            const ticket = ticketData[0];
            setTicketTransaction(ticket);
            ticketTransactionId = ticket.id;
          }
        }
      }

      // Fetch QR code ONLY if we don't already have it from payment status response
      // This is a fallback for when backend hasn't implemented automatic QR code generation yet
      if (!qrCodeData && ticketTransactionId && eventId) {
        console.log('[PaymentSuccessClient] QR code not in payment status response, fetching separately...');
        try {
          const emailHostUrlPrefix = window.location.origin;
          // Use browser-compatible base64 encoding
          const encodedEmailHostUrlPrefix = btoa(emailHostUrlPrefix);
          const qrRes = await fetch(
            `${baseUrl}/api/proxy/events/${eventId}/transactions/${ticketTransactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/qrcode`,
            { cache: 'no-store' }
          );
          if (qrRes.ok) {
            const qrUrl = await qrRes.text();
            if (qrUrl && qrUrl.trim()) {
              setQrCodeData({ qrCodeImageUrl: qrUrl.trim() });
            }
          }
        } catch (err) {
          console.error('Failed to fetch QR code:', err);
        }
      }

      // Fetch transaction items
      if (ticketTransactionId) {
        const itemsRes = await fetch(`${baseUrl}/api/proxy/event-ticket-transaction-items?eventTicketTransactionId.equals=${ticketTransactionId}`, {
          cache: 'no-store',
        });
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setTransactionItems(Array.isArray(itemsData) ? itemsData : []);
        }
      }
    } catch (err: any) {
      console.error('[PaymentSuccessClient] Error fetching full data:', err);
      // Don't set error here, just log it
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);
      pollingAttemptsRef.current = 0;

      try {
        // First, fetch event details to show hero image during loading
        const eventId = eventIdParam ? parseInt(eventIdParam) : null;
        if (eventId) {
          const baseUrl = getAppUrl();
          const eventRes = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
            cache: 'no-store',
          });
          if (eventRes.ok) {
            const eventData = await eventRes.json();
            setEventDetails(eventData);

            // Fetch hero image from event-medias API
            try {
              // Try homepage hero image first
              let mediaRes = await fetch(`${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`, {
                cache: 'no-store',
              });
              if (mediaRes.ok) {
                const mediaData = await mediaRes.json();
                const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
                if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
                  setHeroImageUrl(mediaArray[0].fileUrl);
                } else {
                  // Try regular hero image
                  mediaRes = await fetch(`${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`, {
                    cache: 'no-store',
                  });
                  if (mediaRes.ok) {
                    const heroMediaData = await mediaRes.json();
                    const heroMediaArray = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
                    if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
                      setHeroImageUrl(heroMediaArray[0].fileUrl);
                    }
                  }
                }
              }
            } catch (mediaErr) {
              console.error('[PaymentSuccessClient] Error fetching hero image:', mediaErr);
              // Continue without hero image
            }
          }
        }

        // Fetch initial payment status
        const paymentData = await fetchPaymentStatus();

        if (paymentData) {
          setPaymentTransaction(paymentData);

          // If payment is PENDING, start polling (keep loading=true)
          if (paymentData.status === 'PENDING') {
            console.log('[PaymentSuccessClient] Payment is PENDING, starting polling...');
            setPolling(true);
            // Keep loading=true while polling
            // Set up interval for polling (only if not already set)
            if (!pollingIntervalRef.current) {
              pollingIntervalRef.current = setInterval(() => {
                pollPaymentStatus();
              }, POLLING_INTERVAL);
            }
            // Poll immediately (first check)
            pollPaymentStatus();
          } else {
            // Normalize status to uppercase for comparison
            const normalizedStatus = paymentData.status?.toUpperCase() || paymentData.status;

            if (normalizedStatus === 'SUCCEEDED') {
              // Payment already succeeded, fetch full data
              const updatedPaymentData = { ...paymentData, status: 'SUCCEEDED' as const };
              setPaymentTransaction(updatedPaymentData);
              await fetchFullData(updatedPaymentData);
              setLoading(false);
            } else if (normalizedStatus === 'FAILED' || normalizedStatus === 'CANCELLED') {
              // FAILED or CANCELLED - show error
              setLoading(false);
              setError(`Payment ${normalizedStatus.toLowerCase()}. Please try again.`);
            } else {
              // Unknown status - treat as pending and start polling
              console.warn(`[PaymentSuccessClient] Unknown status: ${paymentData.status}, treating as PENDING`);
              setPolling(true);
              pollingAttemptsRef.current = 0;
              pollingIntervalRef.current = setInterval(pollPaymentStatus, POLLING_INTERVAL);
              pollPaymentStatus();
            }
          }
        } else {
          setLoading(false);
          setError('Payment transaction not found');
        }
      } catch (err: any) {
        console.error('[PaymentSuccessClient] Error fetching initial data:', err);
        setError(err.message || 'Failed to load payment details');
        setLoading(false);
      }
    }

    if (transactionId) {
      fetchInitialData();
    }

    // Cleanup polling interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [transactionId, eventIdParam]);

  // Update loading state when polling completes successfully
  useEffect(() => {
    // Only stop loading if polling is complete AND payment succeeded
    const normalizedStatus = paymentTransaction?.status?.toUpperCase();
    if (!polling && normalizedStatus === 'SUCCEEDED' && loading) {
      setLoading(false);
    }
  }, [polling, paymentTransaction, loading]);

  const defaultHeroImageUrl = '/images/default-event-hero.jpg';

  if (loading || polling) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hero Image Section */}
        {heroImageUrl && (
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
            padding: '80px 0 0 0',
            opacity: 0.7
          }}>
            <img
              src={heroImageUrl || defaultHeroImageUrl}
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
          </section>
        )}

        {/* Loading Message Overlay */}
        <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] p-6" style={{
          marginTop: heroImageUrl ? '-300px' : '0',
          position: 'relative',
          zIndex: 10
        }}>
          <Image
            src="/images/selling-tickets-vector-loading-image.jpg"
            alt="Payment Processing"
            width={180}
            height={180}
            className="mb-4 rounded shadow-lg bg-white p-4"
            priority
          />
          <div className="text-xl font-bold text-teal-700 mb-2 bg-white px-4 py-2 rounded shadow">
            {polling ? 'Processing your payment...' : 'Please wait while your payment is being verified...'}
          </div>
          <div className="text-gray-600 text-base text-center bg-white px-4 py-2 rounded shadow">
            {polling ? (
              <>
                This may take a few moments.<br />
                Please do not close or refresh this page.
              </>
            ) : (
              <>
                Loading your payment details...<br />
                Please wait.
              </>
            )}
          </div>
          {polling && (
            <div className="mt-4 bg-white px-4 py-2 rounded shadow">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                <span>Checking payment status...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentTransaction) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Payment Not Found</h2>
          <p className="text-yellow-600">Unable to find payment transaction with ID: {transactionId}</p>
        </div>
      </div>
    );
  }

  // Normalize status for comparison
  const normalizedPaymentStatus = paymentTransaction.status?.toUpperCase();

  // Don't show success page if payment is still pending
  if (normalizedPaymentStatus === 'PENDING' || normalizedPaymentStatus === 'PROCESSING' || normalizedPaymentStatus === 'INITIATED') {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Payment Pending</h2>
          <p className="text-yellow-600">
            Your payment is still being processed. Please wait a moment and refresh this page.
          </p>
        </div>
      </div>
    );
  }

  // Don't show success page if payment failed or was cancelled
  if (normalizedPaymentStatus === 'FAILED' || normalizedPaymentStatus === 'CANCELLED') {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Payment {normalizedPaymentStatus}</h2>
          <p className="text-red-600">
            Your payment was not successful. Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  // Only show success page if payment succeeded
  if (normalizedPaymentStatus !== 'SUCCEEDED') {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Payment Status: {normalizedPaymentStatus || paymentTransaction.status}</h2>
          <p className="text-yellow-600">
            Your payment is being processed. Please wait a moment and refresh this page.
          </p>
        </div>
      </div>
    );
  }

  const transaction = ticketTransaction || paymentTransaction;
  const email = ticketTransaction?.email || paymentTransaction.metadata?.customerEmail || '';
  const customerName = ticketTransaction?.firstName && ticketTransaction?.lastName
    ? `${ticketTransaction.firstName} ${ticketTransaction.lastName}`
    : paymentTransaction.metadata?.customerName || '';

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Payment Success Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-white -mt-16 mb-4">
            <FaCheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase.{eventDetails && (
              <> Your tickets for <strong>{eventDetails.title}</strong> are confirmed.</>
            )}
            {email && (
              <> A confirmation email has been sent to <strong>{email}</strong>.</>
            )}
          </p>
        </div>
      </div>

      {/* Event Details Card */}
      {eventDetails && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{eventDetails.title}</h2>

          <div className="space-y-4">
            {eventDetails.startDate && (
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-teal-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Date</p>
                  <p className="text-gray-600">
                    {formatInTimeZone(eventDetails.startDate, eventDetails.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {eventDetails.startTime && eventDetails.endTime && (
              <div className="flex items-start gap-3">
                <FaClock className="text-teal-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Time</p>
                  <p className="text-gray-600">{eventDetails.startTime} - {eventDetails.endTime}</p>
                </div>
              </div>
            )}

            {eventDetails.location && (
              <div className="flex items-start gap-3">
                <FaMapPin className="text-teal-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Location</p>
                  <LocationDisplay location={eventDetails.location} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Section */}
      {qrCodeData && qrCodeData.qrCodeImageUrl && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <div className="text-lg font-semibold text-gray-800 mb-4">Your Ticket QR Code</div>
          <div className="flex flex-col items-center justify-center gap-4">
            <img
              src={qrCodeData.qrCodeImageUrl}
              alt="Ticket QR Code"
              className="mx-auto w-48 h-48 object-contain border border-gray-300 rounded-lg shadow"
            />
            {email && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <FaEnvelope className="text-sm" />
                  <span className="text-sm font-medium">Ticket email sent to {email}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Check your email for your tickets. If you don't see it, check your spam folder.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction Summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-semibold">{paymentTransaction.transactionReference || transactionId}</span>
          </div>

          {customerName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{customerName}</span>
            </div>
          )}

          {email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{email}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-green-600">
              ${paymentTransaction.amount.toFixed(2)} {paymentTransaction.currency}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${
              paymentTransaction.status?.toUpperCase() === 'SUCCEEDED' ? 'text-green-600' :
              paymentTransaction.status?.toUpperCase() === 'PENDING' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {paymentTransaction.status?.toUpperCase() || paymentTransaction.status}
            </span>
          </div>

          {paymentTransaction.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold">{paymentTransaction.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Transaction Items */}
        {transactionItems.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tickets Purchased</h3>
            <div className="space-y-2">
              {transactionItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.ticketTypeName || `Ticket Type #${item.ticketTypeId}`} x {item.quantity}</span>
                  <span>${item.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <a
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md"
        >
          Return to Home
        </a>
        <a
          href="/events"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md"
        >
          View All Events
        </a>
      </div>
    </div>
  );
}

