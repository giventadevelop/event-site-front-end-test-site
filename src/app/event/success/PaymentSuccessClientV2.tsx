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
import type { PaymentTransactionDTO, EventTicketTransactionDTO, EventDetailsDTO } from '@/types';

interface PaymentSuccessClientProps {
  transactionId: string;
  eventId?: string;
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

// Helper to get ticket number
function getTicketNumber(transaction: PaymentTransactionDTO | EventTicketTransactionDTO | null): string {
  if (!transaction) return '';
  if ('transactionReference' in transaction) {
    return transaction.transactionReference || (transaction.id ? `TKTN${transaction.id}` : '');
  }
  return (transaction as any).transaction_reference || (transaction.id ? `TKTN${transaction.id}` : '');
}

export default function PaymentSuccessClientV2({ transactionId, eventId: eventIdParam }: PaymentSuccessClientProps) {
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
    const paymentRes = await fetch(`/api/proxy/payments/${transactionId}`, {
      cache: 'no-store',
    });

    if (!paymentRes.ok) {
      if (paymentRes.status === 400) {
        try {
          const errorData = await paymentRes.json();
          if (errorData.errorCode === 'STRIPE_PAYMENT_INTENT_NOT_FOUND' ||
              errorData.error?.includes('does not have a Stripe payment intent ID')) {
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
      console.log('[PaymentSuccessClientV2] Payment status response:', {
        status: responseData.status,
        transactionId: responseData.transactionId,
        qrCodeUrl: responseData.qrCodeUrl,
        ticketTransactionId: responseData.ticketTransactionId,
        emailSent: responseData.emailSent,
        eventId: responseData.eventId,
      });

      const mappedData: PaymentTransactionDTO = {
        transactionReference: responseData.transactionId || transactionId,
        tenantId: responseData.tenantId || '',
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
          qrCodeUrl: responseData.qrCodeUrl,
          ticketTransactionId: responseData.ticketTransactionId,
          emailSent: responseData.emailSent,
        },
        createdAt: responseData.createdAt || new Date().toISOString(),
        updatedAt: responseData.updatedAt || new Date().toISOString(),
      };

      // CRITICAL: If backend returns qrCodeUrl in payment status response, use it immediately
      if (responseData.qrCodeUrl && responseData.status === 'SUCCEEDED') {
        console.log('[PaymentSuccessClientV2] QR code URL received from payment status response:', responseData.qrCodeUrl);
        setQrCodeData({ qrCodeImageUrl: responseData.qrCodeUrl });
      }

      return mappedData;
    }
  }

  // Poll payment status until it reaches a terminal state
  async function pollPaymentStatus() {
    if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
      console.warn('[PaymentSuccessClientV2] Polling timeout reached');
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
    console.log(`[PaymentSuccessClientV2] Polling attempt ${pollingAttemptsRef.current}/${MAX_POLLING_ATTEMPTS}`);

    try {
      const paymentData = await fetchPaymentStatus();

      if (paymentData) {
        const normalizedStatus = paymentData.status?.toUpperCase() || paymentData.status;

        if (normalizedStatus === 'SUCCEEDED' || normalizedStatus === 'FAILED' || normalizedStatus === 'CANCELLED') {
          console.log(`[PaymentSuccessClientV2] Payment reached terminal state: ${normalizedStatus}`);
          setPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          if (normalizedStatus === 'SUCCEEDED') {
            const updatedPaymentData = { ...paymentData, status: 'SUCCEEDED' as const };
            setPaymentTransaction(updatedPaymentData);
            await fetchFullData(updatedPaymentData);
            setLoading(false);
          } else {
            setLoading(false);
            setError(`Payment ${normalizedStatus.toLowerCase()}. Please try again.`);
          }
        } else {
          console.log(`[PaymentSuccessClientV2] Payment still ${normalizedStatus}, continuing to poll...`);
        }
      }
    } catch (err: any) {
      console.error('[PaymentSuccessClientV2] Error polling payment status:', err);
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
      const eventId = paymentData?.eventId || (eventIdParam ? parseInt(eventIdParam) : null);
      if (!eventId) {
        throw new Error('Event ID not found in payment transaction');
      }

      // Fetch event details
      if (!eventDetails) {
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`, {
          cache: 'no-store',
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEventDetails(eventData);
        }
      }

      // Check if QR code URL is already in payment data metadata
      if (paymentData.metadata?.qrCodeUrl && !qrCodeData) {
        console.log('[PaymentSuccessClientV2] Using QR code URL from payment status response metadata');
        setQrCodeData({ qrCodeImageUrl: paymentData.metadata.qrCodeUrl });
      }

      // Fetch ticket transaction if ticketTransactionId is available
      let ticketTransactionId: number | null = paymentData.metadata?.ticketTransactionId || null;

      if (ticketTransactionId) {
        console.log('[PaymentSuccessClientV2] Using ticket transaction ID from payment status response:', ticketTransactionId);
        const ticketRes = await fetch(`/api/proxy/event-ticket-transactions/${ticketTransactionId}`, {
          cache: 'no-store',
        });
        if (ticketRes.ok) {
          const ticket = await ticketRes.json();
          setTicketTransaction(ticket);
        }
      } else if (paymentData.paymentReference) {
        // Try to find by Stripe payment intent ID
        const searchParams = new URLSearchParams();
        if (paymentData.paymentReference.startsWith('pi_')) {
          searchParams.append('stripePaymentIntentId.equals', paymentData.paymentReference);
        } else if (paymentData.paymentReference.startsWith('cs_')) {
          searchParams.append('stripeCheckoutSessionId.equals', paymentData.paymentReference);
        }

        if (searchParams.toString()) {
          const ticketRes = await fetch(`/api/proxy/event-ticket-transactions?${searchParams.toString()}`, {
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

      // Alternative: Try to find by transactionReference
      if (!ticketTransactionId && paymentData.transactionReference) {
        const ticketRes = await fetch(`/api/proxy/event-ticket-transactions?transactionReference.equals=${encodeURIComponent(paymentData.transactionReference)}`, {
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
      if (!qrCodeData && ticketTransactionId && eventId) {
        console.log('[PaymentSuccessClientV2] QR code not in payment status response, fetching separately...');
        try {
          const emailHostUrlPrefix = window.location.origin;
          const encodedEmailHostUrlPrefix = btoa(emailHostUrlPrefix);
          const qrRes = await fetch(
            `/api/proxy/events/${eventId}/transactions/${ticketTransactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/qrcode`,
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
        const itemsRes = await fetch(`/api/proxy/event-ticket-transaction-items?eventTicketTransactionId.equals=${ticketTransactionId}`, {
          cache: 'no-store',
        });
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setTransactionItems(Array.isArray(itemsData) ? itemsData : []);
        }
      }

      // Fetch hero image
      if (eventId && !heroImageUrl) {
        try {
          let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`, {
            cache: 'no-store',
          });
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
            if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
              setHeroImageUrl(mediaArray[0].fileUrl);
            } else {
              // Try regular hero image
              mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`, {
                cache: 'no-store',
              });
              if (mediaRes.ok) {
                const mediaData = await mediaRes.json();
                const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
                if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
                  setHeroImageUrl(mediaArray[0].fileUrl);
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch hero image:', err);
        }
      }
    } catch (err: any) {
      console.error('[PaymentSuccessClientV2] Error fetching full data:', err);
    }
  }

  // Initial data fetch and polling setup
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);
      pollingAttemptsRef.current = 0;

      try {
        // First, fetch event details to show hero image during loading
        const eventId = eventIdParam ? parseInt(eventIdParam) : null;
        if (eventId) {
          const eventRes = await fetch(`/api/proxy/event-details/${eventId}`, {
            cache: 'no-store',
          });
          if (eventRes.ok) {
            const eventData = await eventRes.json();
            setEventDetails(eventData);

            // Fetch hero image
            try {
              let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`, {
                cache: 'no-store',
              });
              if (mediaRes.ok) {
                const mediaData = await mediaRes.json();
                const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
                if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
                  setHeroImageUrl(mediaArray[0].fileUrl);
                } else {
                  mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`, {
                    cache: 'no-store',
                  });
                  if (mediaRes.ok) {
                    const mediaData = await mediaRes.json();
                    const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
                    if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
                      setHeroImageUrl(mediaArray[0].fileUrl);
                    }
                  }
                }
              }
            } catch (err) {
              console.error('Failed to fetch hero image:', err);
            }
          }
        }

        // Fetch payment status
        const paymentData = await fetchPaymentStatus();

        if (paymentData) {
          const normalizedStatus = paymentData.status?.toUpperCase() || paymentData.status;

          if (normalizedStatus === 'SUCCEEDED') {
            // Payment already succeeded, fetch full data
            const updatedPaymentData = { ...paymentData, status: 'SUCCEEDED' as const };
            setPaymentTransaction(updatedPaymentData);
            await fetchFullData(updatedPaymentData);
            setLoading(false);
          } else if (normalizedStatus === 'FAILED' || normalizedStatus === 'CANCELLED') {
            setLoading(false);
            setError(`Payment ${normalizedStatus.toLowerCase()}. Please try again.`);
          } else {
            // Start polling
            setPolling(true);
            pollingAttemptsRef.current = 0;
            pollingIntervalRef.current = setInterval(pollPaymentStatus, POLLING_INTERVAL);
            pollPaymentStatus();
          }
        } else {
          setLoading(false);
          setError('Payment transaction not found');
        }
      } catch (err: any) {
        console.error('[PaymentSuccessClientV2] Error fetching initial data:', err);
        setError(err.message || 'Failed to load payment details');
        setLoading(false);
      }
    }

    if (transactionId) {
      fetchInitialData();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [transactionId, eventIdParam]);

  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  if (loading || polling) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hero Image Section */}
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

        {/* Loading Message Overlay */}
        <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] p-6" style={{
          marginTop: '-300px',
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <FaInfoCircle className="text-4xl text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Error</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (!paymentTransaction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
        <FaInfoCircle className="text-4xl text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Payment Not Found</h1>
        <p className="text-gray-600 mt-2">Unable to find payment transaction with ID: {transactionId}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  const normalizedPaymentStatus = paymentTransaction.status?.toUpperCase();

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

  // Use ticket transaction if available, otherwise use payment transaction
  const transaction = ticketTransaction || paymentTransaction;
  const email = ticketTransaction?.email || paymentTransaction.metadata?.customerEmail || '';
  const customerName = ticketTransaction?.firstName && ticketTransaction?.lastName
    ? `${ticketTransaction.firstName} ${ticketTransaction.lastName}`
    : paymentTransaction.metadata?.customerName || '';
  const purchaseDate = ticketTransaction?.purchaseDate || paymentTransaction.createdAt;
  const finalAmount = ticketTransaction?.finalAmount ?? ticketTransaction?.totalAmount ?? paymentTransaction.amount ?? 0;
  const discountAmount = ticketTransaction?.discountAmount ?? 0;
  const totalAmount = ticketTransaction?.totalAmount ?? paymentTransaction.amount ?? 0;

  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION - styled to merge with header like TicketQrClient */}
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
        <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
      </section>

      {/* Main content container */}
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ marginTop: '80px' }}>
        {/* Payment Success Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-white -mt-16 mb-4">
              <FaCheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Payment Successful!</h1>
            <p className="mt-2 text-gray-600">
              Thank you for your purchase. {eventDetails && (
                <>Your tickets for <strong>{eventDetails.title}</strong> are confirmed.</>
              )}
              {email && (
                <> A confirmation is sent to your email: <strong>{email}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* Event Details Card */}
        {eventDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {eventDetails.title}
            </h2>
            {eventDetails.caption && (
              <div className="text-lg text-teal-700 font-semibold mb-4">{eventDetails.caption}</div>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-4">
              {eventDetails.startDate && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>{formatInTimeZone(eventDetails.startDate, eventDetails.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}</span>
                </div>
              )}
              {eventDetails.startTime && (
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span>
                    {formatTime(eventDetails.startTime)}{eventDetails.endTime ? ` - ${formatTime(eventDetails.endTime)}` : ''}
                    {' '}
                    ({formatInTimeZone(eventDetails.startDate || new Date().toISOString(), eventDetails.timezone || 'America/New_York', 'zzz')})
                  </span>
                </div>
              )}
              {eventDetails.location && (
                <div className="flex items-center gap-2">
                  <LocationDisplay location={eventDetails.location} />
                </div>
              )}
            </div>
            {eventDetails.description && <p className="text-gray-700 text-base">{eventDetails.description}</p>}
          </div>
        )}

        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          {!qrCodeData && !error && (
            <div className="text-lg text-teal-700 font-semibold flex items-center justify-center gap-2">
              <FaTicketAlt className="animate-bounce" />
              Please wait while your tickets are created…
            </div>
          )}
          {qrCodeData && (
            <>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-lg font-semibold text-gray-800">Your Ticket QR Code</div>
                {qrCodeData.qrCodeImageUrl ? (
                  <img
                    src={qrCodeData.qrCodeImageUrl}
                    alt="Ticket QR Code"
                    className="mx-auto w-48 h-48 object-contain border border-gray-300 rounded-lg shadow"
                  />
                ) : (
                  <div className="text-gray-500">QR code not available.</div>
                )}

                {/* Email Status Section */}
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
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <FaTicketAlt /> Ticket #
                </label>
                <p className="text-lg text-gray-800 font-medium">{getTicketNumber(transaction)}</p>
              </div>
            )}
            {customerName && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <FaUser /> Name
                </label>
                <p className="text-lg text-gray-800 font-medium">{customerName}</p>
              </div>
            )}
            {email && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <FaEnvelope /> Email
                </label>
                <p className="text-lg text-gray-800 font-medium">{email}</p>
              </div>
            )}
            {purchaseDate && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <FaCalendarAlt /> Date of Purchase
                </label>
                <p className="text-lg text-gray-800 font-medium">{new Date(purchaseDate).toLocaleString()}</p>
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                <FaMoneyBillWave /> Amount Paid
              </label>
              <p className="text-lg text-gray-800 font-medium">${finalAmount.toFixed(2)}</p>
            </div>
            {discountAmount > 0 && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <FaTags /> Discount Applied
                </label>
                <p className="text-lg text-green-600 font-medium">-${discountAmount.toFixed(2)}</p>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Amount:</span>
                    <span className="text-gray-800">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-800 font-semibold">Final Amount:</span>
                    <span className="text-gray-800 font-semibold">${finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

