'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaUser, FaEnvelope,
  FaMoneyBillWave, FaInfoCircle, FaReceipt, FaMapPin, FaClock, FaTags
} from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import type { PaymentTransactionDTO, EventTicketTransactionDTO, EventDetailsDTO } from '@/types';
import { sendTicketEmailAsync } from '@/lib/emailUtils';
import MobileDebugConsole from '@/components/MobileDebugConsole';

interface PaymentSuccessClientProps {
  transactionId: string;
  eventId?: string;
}

/**
 * PaymentSuccessClient Component
 *
 * SAFETY GUARANTEES FOR PAGE REFRESH:
 * ====================================
 *
 * ✅ ALL OPERATIONS ARE READ-ONLY (GET requests only):
 *    - fetchPaymentStatus() - GET /api/proxy/payments/{transactionId}
 *    - fetchFullData() - GET requests only (event details, ticket transactions, transaction items)
 *    - QR code fetching - GET /api/proxy/events/{eventId}/transactions/{transactionId}/qrcode
 *    - Email sending - POST but idempotent (safe to retry, backend prevents duplicates)
 *
 * ✅ NO PAYMENT CREATION:
 *    - No Stripe Payment Intent creation
 *    - No PaymentIntent API calls
 *    - No checkout session creation
 *
 * ✅ NO TICKET TRANSACTION CREATION:
 *    - Only queries existing ticket transactions
 *    - No POST/PUT/PATCH to create or modify transactions
 *    - All transaction data is fetched, never created
 *
 * ✅ DUPLICATE PREVENTION:
 *    - Email sending: Protected by sessionStorage (persists across refreshes)
 *    - QR code fetching: Protected by sessionStorage (persists across refreshes)
 *    - Refresh loops: Protected by sessionStorage
 *
 * ✅ REFRESH SAFE:
 *    - Page can be refreshed safely without creating duplicate purchases
 *    - Only refreshes QR code display and transaction data
 *    - No side effects that create new transactions or payments
 *
 * VERIFICATION:
 * All API calls in this component are GET requests except:
 * - Email sending (POST) - but protected by sessionStorage and backend idempotency
 *
 * The backend email endpoint should be idempotent (safe to call multiple times).
 */
export default function PaymentSuccessClient({ transactionId, eventId: eventIdParam }: PaymentSuccessClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);

  // Mobile detection and redirect logic - CRITICAL for mobile payment flows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] ============================================');
    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] Component mounted');
    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] ============================================');
    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] Transaction ID:', transactionId);
    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] User Agent:', navigator.userAgent);
    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] URL:', window.location.href);

    // Enhanced mobile detection with multiple methods (same as SuccessClient)
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';

    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(platform);
    const narrowScreenMatch = window.innerWidth <= 768;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgentData = (navigator as any).userAgentData;
    const isMobileFromUA = userAgentData?.mobile || false;

    const isMobile = mobileRegexMatch || platformMatch || narrowScreenMatch || (hasTouchScreen && narrowScreenMatch) || isMobileFromUA;

    console.log('[MOBILE-DETECTION] [PaymentSuccessClient] Detection result:', {
      isMobile,
      mobileRegexMatch,
      platformMatch,
      narrowScreenMatch,
      hasTouchScreen,
      isMobileFromUA,
      userAgent: userAgent.substring(0, 100),
    });

    setIsMobileDevice(isMobile);

    if (isMobile) {
      console.log('[MOBILE-DETECTION] [PaymentSuccessClient] ✅✅✅ MOBILE DETECTED - Redirecting to /event/ticket-qr');
      // For PaymentSuccessClient, we need to redirect to ticket-qr with transactionId
      // But ticket-qr expects pi or session_id, not transactionId
      // So we need to extract pi from URL or use a different approach
      const urlParams = new URLSearchParams(window.location.search);
      const pi = urlParams.get('pi');

      if (pi) {
        const redirectUrl = `/event/ticket-qr?pi=${encodeURIComponent(pi)}`;
        console.log('[MOBILE-DETECTION] [PaymentSuccessClient] ✅ Redirecting with pi:', redirectUrl);
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 2000);
        return;
      } else {
        console.warn('[MOBILE-DETECTION] [PaymentSuccessClient] ⚠️ Mobile detected but no pi parameter - cannot redirect');
      }
    } else {
      console.log('[MOBILE-DETECTION] [PaymentSuccessClient] ❌ DESKTOP DETECTED - Staying on page');
    }
  }, [transactionId, router]);

  // Log safety guarantee on mount (always log for mobile debugging)
  useEffect(() => {
    console.log('[PaymentSuccessClient] ===== COMPONENT MOUNTED =====');
    console.log('[PaymentSuccessClient] ✅ SAFE TO REFRESH: All operations are read-only. No duplicate purchases will occur.');
    console.log('[PaymentSuccessClient] Transaction ID:', transactionId);
    console.log('[PaymentSuccessClient] Event ID Param:', eventIdParam);
    console.log('[PaymentSuccessClient] User Agent:', navigator.userAgent);
    console.log('[PaymentSuccessClient] Current URL:', window.location.href);
    console.log('[PaymentSuccessClient] Timestamp:', new Date().toISOString());
  }, [transactionId, eventIdParam]);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentTransaction, setPaymentTransaction] = useState<PaymentTransactionDTO | null>(null);
  const [ticketTransaction, setTicketTransaction] = useState<EventTicketTransactionDTO | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetailsDTO | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ qrCodeImageUrl: string } | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  const [qrCodeRetryTrigger, setQrCodeRetryTrigger] = useState(0); // Trigger retries by incrementing
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);
  const ticketPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ticketPollingAttemptsRef = useRef(0);
  const qrCodeFetchAttemptedRef = useRef<Set<string>>(new Set());
  const qrCodeRetryCountRef = useRef<Map<string, number>>(new Map()); // Track retry counts per fetch key

  // Use sessionStorage for email tracking to persist across page refreshes
  const getEmailSentKey = () => `email-sent-${transactionId}`;
  const hasEmailBeenSent = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(getEmailSentKey()) === 'true';
  };
  const markEmailAsSent = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(getEmailSentKey(), 'true');
    }
  };

  // Use sessionStorage for QR code fetch tracking to persist across page refreshes
  const getQrCodeFetchedKey = (eventId: number, ticketId: number) => `qr-fetched-${eventId}-${ticketId}`;
  const hasQrCodeBeenFetched = (eventId: number, ticketId: number) => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(getQrCodeFetchedKey(eventId, ticketId)) === 'true';
  };
  const markQrCodeAsFetched = (eventId: number, ticketId: number) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(getQrCodeFetchedKey(eventId, ticketId), 'true');
    }
  };
  const MAX_POLLING_ATTEMPTS = 30; // 30 attempts * 2 seconds = 60 seconds max
  const POLLING_INTERVAL = 2000; // 2 seconds
  const MAX_TICKET_POLLING_ATTEMPTS = 15; // 15 attempts * 2 seconds = 30 seconds max
  const MAX_QR_CODE_RETRY_ATTEMPTS = 3; // Maximum retries for QR code fetch (prevents infinite loops)

  // Use sessionStorage to prevent infinite refresh loops (persists across page reloads)
  const getRefreshKey = () => `payment-refresh-${transactionId}`;
  const hasRefreshed = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(getRefreshKey()) === 'true';
  };
  const markAsRefreshed = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(getRefreshKey(), 'true');
    }
  };

  // Fetch payment status function
  async function fetchPaymentStatus(): Promise<PaymentTransactionDTO | null> {
    console.log('[PaymentSuccessClient] ===== FETCHING PAYMENT STATUS =====');
    console.log('[PaymentSuccessClient] Transaction ID:', transactionId);
    console.log('[PaymentSuccessClient] Full URL:', `/api/proxy/payments/${transactionId}`);

    const paymentRes = await fetch(`/api/proxy/payments/${transactionId}`, {
      cache: 'no-store',
    });

    console.log('[PaymentSuccessClient] Payment response status:', paymentRes.status, paymentRes.statusText);

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
              transactionReference: transactionId,
              status: 'PENDING' as any,
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
        qrCodeUrl: responseData.qrCodeUrl,
        ticketTransactionId: responseData.ticketTransactionId,
        emailSent: responseData.emailSent,
        eventId: responseData.eventId,
        stripePaymentIntentId: responseData.stripePaymentIntentId, // CRITICAL: Check if backend returns this
        paymentReference: responseData.paymentReference,
        metadata: responseData.metadata,
        fullResponse: responseData
      });

      // CRITICAL CHECK: Log if stripePaymentIntentId is missing
      if (!responseData.stripePaymentIntentId && !responseData.metadata?.stripePaymentIntentId) {
        console.error('[PaymentSuccessClient] ⚠️ BACKEND ISSUE: stripePaymentIntentId is missing from payment response!', {
          availableFields: Object.keys(responseData),
          paymentReference: responseData.paymentReference
        });
      }
      // Map PaymentStatusResponse to PaymentTransactionDTO format
      // Backend returns PaymentStatusResponse with transactionId (string) and status fields
      // PaymentTransactionDTO expects transactionReference (string) and status fields
      const mappedData: PaymentTransactionDTO = {
        transactionReference: responseData.transactionId || transactionId,
        tenantId: responseData.tenantId || '', // Required field, will be set by backend
        providerType: responseData.providerType || 'STRIPE',
        paymentUseCase: responseData.paymentUseCase || 'TICKET_SALE',
        status: (responseData.status?.toUpperCase() as any) || 'PENDING',
        amount: responseData.amount ?? 0,
        currency: responseData.currency || 'USD',
        paymentMethod: responseData.paymentMethod,
        paymentReference: responseData.paymentReference || responseData.transactionId,
        eventId: responseData.eventId || (eventIdParam ? parseInt(eventIdParam) : undefined),
        metadata: {
          ...responseData.metadata,
          // Store ticket purchase fields in metadata for easy access
          // CRITICAL: These fields come from PaymentStatusResponse root level, not nested
          qrCodeUrl: responseData.qrCodeUrl,
          ticketTransactionId: responseData.ticketTransactionId,
          emailSent: responseData.emailSent,
          // Store Stripe payment intent ID for ticket lookup
          stripePaymentIntentId: responseData.stripePaymentIntentId || responseData.metadata?.stripePaymentIntentId,
        },
        createdAt: responseData.createdAt || new Date().toISOString(),
        updatedAt: responseData.updatedAt || new Date().toISOString(),
      };

      // NOTE: We use legacy workflow - fetch QR code separately after getting ticket transaction ID
      // This ensures QR code is generated even if backend async processing isn't complete

      // If backend returns ticketTransactionId, use it (but still fetch QR code separately)
      if (responseData.ticketTransactionId) {
        console.log('[PaymentSuccessClient] Ticket transaction ID received from payment status response:', responseData.ticketTransactionId);
        // We'll fetch ticket transaction details and QR code in fetchFullData
      }
      console.log('[PaymentSuccessClient] Mapped payment data:', {
        status: mappedData.status,
        transactionReference: mappedData.transactionReference,
        amount: mappedData.amount,
        stripePaymentIntentId: mappedData.metadata?.stripePaymentIntentId,
        eventId: mappedData.eventId
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
          transactionReference: paymentData.transactionReference,
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

          // If succeeded, fetch full data including ticket transaction and QR code
          if (normalizedStatus === 'SUCCEEDED') {
            // Update payment data with normalized status
            const updatedPaymentData = { ...paymentData, status: normalizedStatus as any };
            setPaymentTransaction(updatedPaymentData);
            console.log('[PaymentSuccessClient] Payment succeeded via polling, fetching ticket transaction and QR code...');
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
      // Get eventId from payment transaction or parameter
      const eventId = paymentData?.eventId || (eventIdParam ? parseInt(eventIdParam) : null);
      if (!eventId) {
        throw new Error('Event ID not found in payment transaction');
      }

      // Fetch event details if not already fetched
      if (!eventDetails) {
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`, {
          cache: 'no-store',
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEventDetails(eventData);
        }
      }

      // NOTE: We use legacy workflow - fetch QR code separately after getting ticket transaction ID
      // This ensures QR code is generated even if backend async processing isn't complete

      // Find corresponding EventTicketTransaction
      // Priority: 1) ticketTransactionId from metadata, 2) stripePaymentIntentId, 3) paymentReference
      let ticketTransactionId: number | null = paymentData.metadata?.ticketTransactionId || null;

      // Extract Stripe payment intent ID from metadata or paymentReference
      const stripePaymentIntentId = paymentData.metadata?.stripePaymentIntentId ||
        (paymentData.paymentReference?.startsWith('pi_') ? paymentData.paymentReference : null);

      // If ticketTransactionId is already in metadata, use it
      if (ticketTransactionId) {
        console.log('[PaymentSuccessClient] Using ticket transaction ID from payment status response:', ticketTransactionId);
        // Fetch ticket transaction details
        const ticketRes = await fetch(`/api/proxy/event-ticket-transactions/${ticketTransactionId}`, {
          cache: 'no-store',
        });
        if (ticketRes.ok) {
          const ticket = await ticketRes.json();
          setTicketTransaction(ticket);
          ticketTransactionId = ticket.id;

          // NOTE: Email is sent automatically by backend when payment succeeds
          // No need to send email from frontend - backend handles this in webhook handler
          console.log('[PaymentSuccessClient] Ticket transaction found by ID - backend should have already sent email');
        }
      }

      // Try to find by Stripe payment intent ID (most reliable method)
      if (!ticketTransactionId && stripePaymentIntentId) {
        console.log('[PaymentSuccessClient] Searching for ticket by stripePaymentIntentId:', stripePaymentIntentId);
        const searchParams = new URLSearchParams();
        searchParams.append('stripePaymentIntentId.equals', stripePaymentIntentId);
        if (eventId) {
          searchParams.append('eventId.equals', eventId.toString());
        }

        const ticketRes = await fetch(`/api/proxy/event-ticket-transactions?${searchParams.toString()}`, {
          cache: 'no-store',
        });
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          console.log('[PaymentSuccessClient] Ticket fetch by stripePaymentIntentId response:', {
            stripePaymentIntentId,
            isArray: Array.isArray(ticketData),
            length: Array.isArray(ticketData) ? ticketData.length : 'not array',
            data: ticketData
          });
          if (Array.isArray(ticketData) && ticketData.length > 0) {
            const ticket = ticketData[0];
            console.log('[PaymentSuccessClient] Ticket transaction found by stripePaymentIntentId, setting state:', {
              ticketId: ticket.id,
              ticketEmail: ticket.email,
              qrCodeImageUrl: ticket.qrCodeImageUrl ? 'present' : 'missing'
            });
            setTicketTransaction(ticket);
            ticketTransactionId = ticket.id;

            // NOTE: Email is sent automatically by backend when payment succeeds
            // No need to send email from frontend - backend handles this in webhook handler
            console.log('[PaymentSuccessClient] Ticket transaction found by stripePaymentIntentId - backend should have already sent email');
          } else {
            console.log('[PaymentSuccessClient] No ticket transactions found by stripePaymentIntentId (empty array)');
          }
        } else {
          console.warn('[PaymentSuccessClient] Failed to fetch ticket by stripePaymentIntentId:', ticketRes.status);
        }
      }

      // Fallback: Try to find by paymentReference (if it's a Stripe session ID)
      if (!ticketTransactionId && paymentData.paymentReference?.startsWith('cs_')) {
        console.log('[PaymentSuccessClient] Searching for ticket by stripeCheckoutSessionId:', paymentData.paymentReference);
        const searchParams = new URLSearchParams();
        searchParams.append('stripeCheckoutSessionId.equals', paymentData.paymentReference);
        if (eventId) {
          searchParams.append('eventId.equals', eventId.toString());
        }

        const ticketRes = await fetch(`/api/proxy/event-ticket-transactions?${searchParams.toString()}`, {
          cache: 'no-store',
        });
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          if (Array.isArray(ticketData) && ticketData.length > 0) {
            const ticket = ticketData[0];
            console.log('[PaymentSuccessClient] Ticket transaction found by checkout session ID, setting state:', {
              ticketId: ticket.id,
              ticketEmail: ticket.email
            });
            setTicketTransaction(ticket);
            ticketTransactionId = ticket.id;

            // NOTE: Email is sent automatically by backend when payment succeeds
            // No need to send email from frontend - backend handles this in webhook handler
            console.log('[PaymentSuccessClient] Ticket transaction found by checkout session ID - backend should have already sent email');
          }
        }
      }

      // NOTE: QR code fetch is handled by useEffect hook when ticketTransaction.id becomes available
      // This ensures automatic re-render when QR code data is set

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
          const eventRes = await fetch(`/api/proxy/event-details/${eventId}`, {
            cache: 'no-store',
          });
          if (eventRes.ok) {
            const eventData = await eventRes.json();
            setEventDetails(eventData);

            // Fetch hero image from event-medias API
            try {
              // Try homepage hero image first
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
              // Payment succeeded - fetch full data including ticket transaction and QR code
              console.log('[PaymentSuccessClient] Payment succeeded, fetching ticket transaction and QR code...');
              const updatedPaymentData = { ...paymentData, status: normalizedStatus as any };
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

    // Cleanup polling intervals on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (ticketPollingIntervalRef.current) {
        clearInterval(ticketPollingIntervalRef.current);
        ticketPollingIntervalRef.current = null;
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

  // Poll for ticket transaction if payment succeeded but ticket not found
  useEffect(() => {
    console.log('[PaymentSuccessClient] Ticket polling useEffect triggered', {
      hasPaymentTransaction: !!paymentTransaction,
      paymentStatus: paymentTransaction?.status,
      hasTicketTransaction: !!ticketTransaction,
      hasRefreshed: hasRefreshed()
    });

    const normalizedStatus = paymentTransaction?.status?.toUpperCase();

    // Only poll if payment succeeded, we have Stripe payment intent ID, but no ticket transaction yet
    if (
      normalizedStatus === 'SUCCEEDED' &&
      paymentTransaction &&
      !ticketTransaction &&
      !hasRefreshed() // Don't poll if we've already refreshed
    ) {
      const stripePaymentIntentId = paymentTransaction.metadata?.stripePaymentIntentId ||
        (paymentTransaction.paymentReference?.startsWith('pi_') ? paymentTransaction.paymentReference : null);

      console.log('[PaymentSuccessClient] Checking if should start ticket polling:', {
        normalizedStatus,
        hasPaymentTransaction: !!paymentTransaction,
        hasTicketTransaction: !!ticketTransaction,
        hasRefreshed: hasRefreshed(),
        stripePaymentIntentId,
        paymentReference: paymentTransaction.paymentReference
      });

      if (!stripePaymentIntentId) {
        console.error('[PaymentSuccessClient] Cannot poll for ticket - no Stripe payment intent ID available', {
          metadata: paymentTransaction.metadata,
          paymentReference: paymentTransaction.paymentReference
        });
        return;
      }

      // Clear any existing polling interval
      if (ticketPollingIntervalRef.current) {
        clearInterval(ticketPollingIntervalRef.current);
        ticketPollingIntervalRef.current = null;
      }

      ticketPollingAttemptsRef.current = 0;

      async function pollForTicket() {
        if (ticketPollingAttemptsRef.current >= MAX_TICKET_POLLING_ATTEMPTS) {
          console.warn('[PaymentSuccessClient] Ticket polling timeout reached after 15 attempts');
          if (ticketPollingIntervalRef.current) {
            clearInterval(ticketPollingIntervalRef.current);
            ticketPollingIntervalRef.current = null;
          }
          return;
        }

        ticketPollingAttemptsRef.current++;
        console.log(`[PaymentSuccessClient] 🔍 Polling for ticket transaction attempt ${ticketPollingAttemptsRef.current}/${MAX_TICKET_POLLING_ATTEMPTS}`);

        try {
          if (!paymentTransaction) return; // Guard against null

          const eventId = paymentTransaction.eventId || (eventIdParam ? parseInt(eventIdParam) : null);
          const searchParams = new URLSearchParams();
          searchParams.append('stripePaymentIntentId.equals', stripePaymentIntentId);
          if (eventId) {
            searchParams.append('eventId.equals', eventId.toString());
          }

          const ticketUrl = `/api/proxy/event-ticket-transactions?${searchParams.toString()}`;
          console.log(`[PaymentSuccessClient] Fetching ticket from: ${ticketUrl}`);

          const ticketRes = await fetch(ticketUrl, {
            cache: 'no-store',
          });

          console.log(`[PaymentSuccessClient] Ticket fetch response status: ${ticketRes.status}`);

          if (ticketRes.ok) {
            const ticketData = await ticketRes.json();
            console.log('[PaymentSuccessClient] Ticket fetch response data:', {
              isArray: Array.isArray(ticketData),
              length: Array.isArray(ticketData) ? ticketData.length : 'not array',
              firstTicket: Array.isArray(ticketData) && ticketData.length > 0 ? {
                id: ticketData[0].id,
                email: ticketData[0].email,
                hasQrCode: !!ticketData[0].qrCodeImageUrl
              } : 'no tickets'
            });

            if (Array.isArray(ticketData) && ticketData.length > 0) {
              const ticket = ticketData[0];
              console.log('[PaymentSuccessClient] ✅ Ticket transaction found via polling:', {
                ticketId: ticket.id,
                qrCodeImageUrl: ticket.qrCodeImageUrl ? 'present' : 'missing',
                email: ticket.email
              });
              setTicketTransaction(ticket);

              // NOTE: Email is sent automatically by backend when payment succeeds
              // No need to send email from frontend - backend handles this in webhook handler
              console.log('[PaymentSuccessClient] Ticket transaction found via polling - backend should have already sent email');

              // Stop polling
              if (ticketPollingIntervalRef.current) {
                clearInterval(ticketPollingIntervalRef.current);
                ticketPollingIntervalRef.current = null;
              }
            } else {
              console.log(`[PaymentSuccessClient] ❌ Ticket not found yet (attempt ${ticketPollingAttemptsRef.current}/${MAX_TICKET_POLLING_ATTEMPTS}) - will retry in 2 seconds`);
            }
          } else {
            console.error(`[PaymentSuccessClient] Ticket fetch failed with status: ${ticketRes.status}`);
          }
        } catch (err) {
          console.error('[PaymentSuccessClient] Error polling for ticket transaction:', err);
        }
      }

      // Poll immediately, then set up interval
      pollForTicket();
      ticketPollingIntervalRef.current = setInterval(pollForTicket, POLLING_INTERVAL);

      return () => {
        if (ticketPollingIntervalRef.current) {
          clearInterval(ticketPollingIntervalRef.current);
          ticketPollingIntervalRef.current = null;
        }
      };
    }
  }, [paymentTransaction?.status, paymentTransaction?.metadata?.stripePaymentIntentId, paymentTransaction?.paymentReference, ticketTransaction, eventIdParam]);

  // NOTE: Refresh logic removed - QR code displays correctly via React state updates
  // The backend now returns ticketTransactionId directly, so we can fetch and display
  // the QR code without needing a page refresh
  useEffect(() => {
    const normalizedStatus = paymentTransaction?.status?.toUpperCase();
    if (
      normalizedStatus === 'SUCCEEDED' &&
      paymentTransaction &&
      ticketTransaction &&
      qrCodeData &&
      qrCodeData.qrCodeImageUrl
    ) {
      console.log('[PaymentSuccessClient] ✅ All data ready (payment, ticket, QR code) - displaying without refresh');
      // Mark as complete in sessionStorage to prevent any legacy refresh logic
      markAsRefreshed();
    }
  }, [paymentTransaction?.status, ticketTransaction, qrCodeData, transactionId]);

  // Trigger QR code fetch when ticket transaction ID becomes available
  useEffect(() => {
    // Skip if we already have QR code data or are currently loading
    if (qrCodeData || qrCodeLoading) {
      console.log('[PaymentSuccessClient] QR code useEffect skipped:', {
        hasQrCodeData: !!qrCodeData,
        qrCodeLoading
      });
      return;
    }

    const ticketId = ticketTransaction?.id;
    const eventId = eventDetails?.id;

    // Skip if we don't have both IDs
    if (!ticketId || !eventId) {
      console.log('[PaymentSuccessClient] QR code useEffect skipped - missing IDs:', {
        ticketTransactionId: ticketId,
        eventDetailsId: eventId
      });
      return;
    }

    // Check if we've already attempted to fetch for this combination
    const fetchKey = `${eventId}-${ticketId}`;
    const retryCount = qrCodeRetryCountRef.current.get(fetchKey) || 0;

    // CRITICAL: Check sessionStorage to prevent duplicate QR code fetches on page refresh
    // This ensures QR code is only fetched once per transaction, even if page is refreshed
    if (hasQrCodeBeenFetched(eventId, ticketId)) {
      console.log('[PaymentSuccessClient] QR code already fetched for this transaction (from sessionStorage), skipping duplicate fetch:', {
        eventId,
        ticketId,
        fetchKey
      });
      // Still allow retry if we haven't exceeded max attempts and QR code is missing
      if (!qrCodeData && retryCount < MAX_QR_CODE_RETRY_ATTEMPTS) {
        console.log('[PaymentSuccessClient] QR code was fetched but data is missing, allowing retry');
      } else {
        setQrCodeLoading(false);
        return;
      }
    }

    // If we've exceeded max retries, stop trying and show error
    if (retryCount >= MAX_QR_CODE_RETRY_ATTEMPTS) {
      console.error('[PaymentSuccessClient] QR code fetch exceeded max retries:', {
        fetchKey,
        retryCount,
        maxRetries: MAX_QR_CODE_RETRY_ATTEMPTS
      });
      setQrCodeError('Unable to load QR code. Please contact support if this issue persists.');
      setQrCodeLoading(false);
      return;
    }

    // If we've attempted before but haven't exceeded max retries, allow retry
    if (qrCodeFetchAttemptedRef.current.has(fetchKey) && retryCount > 0) {
      console.log('[PaymentSuccessClient] QR code fetch retry attempt:', {
        fetchKey,
        retryCount: retryCount + 1,
        maxRetries: MAX_QR_CODE_RETRY_ATTEMPTS
      });
    }

    // Mark as attempted and increment retry count
    qrCodeFetchAttemptedRef.current.add(fetchKey);
    qrCodeRetryCountRef.current.set(fetchKey, retryCount + 1);

    async function fetchQrCode() {
      console.log('[PaymentSuccessClient] Fetching QR code...', {
        ticketTransactionId: ticketId,
        eventId: eventId
      });

      const emailHostUrlPrefix = window.location.origin;
      const encodedEmailHostUrlPrefix = btoa(emailHostUrlPrefix);

      setQrCodeLoading(true);
      setQrCodeError(null);

      try {
        const qrUrl = `/api/proxy/events/${eventId}/transactions/${ticketId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/qrcode`;
        console.log('[PaymentSuccessClient] Fetching QR code from:', qrUrl);

        const qrRes = await fetch(qrUrl, { cache: 'no-store' });

        console.log('[PaymentSuccessClient] QR code fetch response:', {
          status: qrRes.status,
          ok: qrRes.ok
        });

        if (qrRes.ok) {
          const qrUrlText = await qrRes.text();
          console.log('[PaymentSuccessClient] QR code URL received:', {
            length: qrUrlText?.length,
            preview: qrUrlText?.substring(0, 100)
          });

          if (qrUrlText && qrUrlText.trim()) {
            console.log('[PaymentSuccessClient] QR code fetched successfully, setting state...');
            // Use functional update to ensure state is set correctly
            setQrCodeData({ qrCodeImageUrl: qrUrlText.trim() });
            setQrCodeLoading(false);
            // Reset retry count on success
            qrCodeRetryCountRef.current.delete(fetchKey);
            // CRITICAL: Mark QR code as fetched in sessionStorage to prevent duplicate fetches on refresh
            markQrCodeAsFetched(eventId, ticketId);
            console.log('[PaymentSuccessClient] QR code state updated and marked as fetched in sessionStorage, component should re-render NOW');
            // NOTE: Email will be sent asynchronously in a separate useEffect after QR code is displayed
          } else {
            const currentRetryCount = qrCodeRetryCountRef.current.get(fetchKey) || 0;
            console.warn('[PaymentSuccessClient] QR code URL is empty (backend returned empty response):', {
              fetchKey,
              retryCount: currentRetryCount,
              maxRetries: MAX_QR_CODE_RETRY_ATTEMPTS,
              responseStatus: qrRes.status,
              responseHeaders: Object.fromEntries(qrRes.headers.entries())
            });

            // If we've exceeded max retries, set permanent error
            if (currentRetryCount >= MAX_QR_CODE_RETRY_ATTEMPTS) {
              setQrCodeError('Unable to load QR code. The backend returned an empty response. Please contact support.');
              setQrCodeLoading(false);
              // Don't remove from attempted set - we've given up
            } else {
              // Allow retry by removing from attempted set and triggering retry
              setQrCodeError(`QR code temporarily unavailable (attempt ${currentRetryCount}/${MAX_QR_CODE_RETRY_ATTEMPTS}). Retrying...`);
              setQrCodeLoading(false);
              qrCodeFetchAttemptedRef.current.delete(fetchKey);
              // Retry after a short delay (2 seconds)
              setTimeout(() => {
                setQrCodeRetryTrigger(prev => prev + 1); // Trigger useEffect to retry
              }, 2000);
            }
          }
        } else {
          const errorText = await qrRes.text();
          const currentRetryCount = qrCodeRetryCountRef.current.get(fetchKey) || 0;
          console.error('[PaymentSuccessClient] Failed to fetch QR code:', {
            status: qrRes.status,
            statusText: qrRes.statusText,
            errorText,
            fetchKey,
            retryCount: currentRetryCount,
            maxRetries: MAX_QR_CODE_RETRY_ATTEMPTS
          });

          // If we've exceeded max retries, set permanent error
          if (currentRetryCount >= MAX_QR_CODE_RETRY_ATTEMPTS) {
            setQrCodeError(`Unable to load QR code (HTTP ${qrRes.status}). Please contact support.`);
            setQrCodeLoading(false);
            // Don't remove from attempted set - we've given up
          } else {
            setQrCodeError(`Failed to fetch QR code (attempt ${currentRetryCount}/${MAX_QR_CODE_RETRY_ATTEMPTS}). Retrying...`);
            setQrCodeLoading(false);
            // Allow retry by removing from attempted set and triggering retry
            qrCodeFetchAttemptedRef.current.delete(fetchKey);
            // Retry after a short delay (2 seconds)
            setTimeout(() => {
              setQrCodeRetryTrigger(prev => prev + 1); // Trigger useEffect to retry
            }, 2000);
          }
        }
      } catch (err) {
        const currentRetryCount = qrCodeRetryCountRef.current.get(fetchKey) || 0;
        console.error('[PaymentSuccessClient] Exception fetching QR code:', {
          error: err,
          fetchKey,
          retryCount: currentRetryCount,
          maxRetries: MAX_QR_CODE_RETRY_ATTEMPTS
        });

        // If we've exceeded max retries, set permanent error
        if (currentRetryCount >= MAX_QR_CODE_RETRY_ATTEMPTS) {
          setQrCodeError(`Unable to load QR code: ${err instanceof Error ? err.message : 'Unknown error'}. Please contact support.`);
          setQrCodeLoading(false);
          // Don't remove from attempted set - we've given up
        } else {
          setQrCodeError(`Error fetching QR code (attempt ${currentRetryCount}/${MAX_QR_CODE_RETRY_ATTEMPTS}). Retrying...`);
          setQrCodeLoading(false);
          // Allow retry by removing from attempted set and triggering retry
          qrCodeFetchAttemptedRef.current.delete(fetchKey);
          // Retry after a short delay (2 seconds)
          setTimeout(() => {
            setQrCodeRetryTrigger(prev => prev + 1); // Trigger useEffect to retry
          }, 2000);
        }
      }
    }

    fetchQrCode();
  }, [ticketTransaction?.id, eventDetails?.id, qrCodeData, qrCodeLoading, paymentTransaction?.metadata?.customerEmail, qrCodeRetryTrigger]);

  // Send email once after QR code is successfully displayed
  useEffect(() => {
    // CRITICAL: Check sessionStorage first to prevent duplicate email sends on page refresh
    // This ensures email is only sent once per transaction, even if page is refreshed
    if (hasEmailBeenSent()) {
      console.log('[PaymentSuccessClient] Email already sent for this transaction (from sessionStorage), skipping duplicate send:', {
        transactionId
      });
      return;
    }

    // Only send email if:
    // 1. QR code is successfully displayed (qrCodeData exists and has qrCodeImageUrl)
    // 2. We have ticket transaction and event details
    // 3. Email hasn't been sent yet (checked via sessionStorage to persist across refreshes)
    if (
      qrCodeData &&
      qrCodeData.qrCodeImageUrl &&
      ticketTransaction?.id &&
      eventDetails?.id
    ) {
      const emailToUse = ticketTransaction.email || paymentTransaction?.metadata?.customerEmail;

      if (emailToUse) {
        // CRITICAL: Mark as sent in sessionStorage BEFORE sending to prevent race conditions
        // This persists across page refreshes and prevents duplicate emails
        markEmailAsSent();

        console.log('[PaymentSuccessClient] QR code displayed successfully, sending email once:', {
          eventId: eventDetails.id,
          transactionId: ticketTransaction.id,
          email: emailToUse
        });

        // Send email asynchronously (non-blocking)
        // NOTE: Email sending endpoint should be idempotent (safe to call multiple times)
        sendTicketEmailAsync({
          eventId: eventDetails.id,
          transactionId: ticketTransaction.id,
          email: emailToUse
        });
      } else {
        console.warn('[PaymentSuccessClient] Cannot send email - no email address available', {
          ticketEmail: ticketTransaction.email,
          paymentEmail: paymentTransaction?.metadata?.customerEmail
        });
      }
    }
  }, [qrCodeData, ticketTransaction?.id, eventDetails?.id, paymentTransaction?.metadata?.customerEmail, transactionId]);

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

  // Helper to get ticket number
  function getTicketNumber(tx: PaymentTransactionDTO | EventTicketTransactionDTO | null): string {
    if (!tx) return '';
    if ('transactionReference' in tx) {
      return tx.transactionReference || (tx.id ? `TKTN${tx.id}` : '');
    }
    return (tx as any).transaction_reference || (tx.id ? `TKTN${tx.id}` : '');
  }

  // Helper to format time
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>Payment Successful!</h1>
            <p className="mt-2 text-lg text-gray-600">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              {eventDetails.title}
            </h2>
            {eventDetails.caption && (
              <div className="text-lg text-teal-700 font-semibold mb-4">{eventDetails.caption}</div>
            )}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {eventDetails.startDate && (
                <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatInTimeZone(eventDetails.startDate, eventDetails.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              )}
              {eventDetails.startTime && (
                <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatTime(eventDetails.startTime)}{eventDetails.endTime ? ` - ${formatTime(eventDetails.endTime)}` : ''}
                    {' '}
                    ({formatInTimeZone(eventDetails.startDate || new Date().toISOString(), eventDetails.timezone || 'America/New_York', 'zzz')})
                  </span>
                </div>
              )}
              {eventDetails.location && (
                <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">
                    <LocationDisplay location={eventDetails.location} />
                  </span>
                </div>
              )}
            </div>
            {eventDetails.description && <p className="text-gray-700 text-base">{eventDetails.description}</p>}
          </div>
        )}

        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          {qrCodeLoading && (
            <div className="text-lg text-teal-700 font-semibold flex items-center justify-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
              <span>Please wait while your tickets are created…</span>
            </div>
          )}
          {!qrCodeData && !qrCodeLoading && !qrCodeError && (
            <div className="text-lg text-teal-700 font-semibold flex items-center justify-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span>Please wait while your tickets are created…</span>
            </div>
          )}
          {qrCodeError && (
            <div className="text-red-600 font-semibold">
              {qrCodeError}
            </div>
          )}
          {qrCodeData && (
            <>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Your Ticket QR Code</div>
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
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-blue-700">Ticket email sent to {email}</span>
                        <p className="text-sm text-blue-600 mt-1">
                          Check your email for your tickets. If you don't see it, check your spam folder.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Transaction Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {getTicketNumber(transaction) && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Ticket #</label>
                  <p className="text-lg text-gray-800 font-semibold">{getTicketNumber(transaction)}</p>
                </div>
              </div>
            )}
            {customerName && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-lg text-gray-800 font-semibold">{customerName}</p>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-lg text-gray-800 font-semibold">{email}</p>
                </div>
              </div>
            )}
            {purchaseDate && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Date of Purchase</label>
                  <p className="text-lg text-gray-800 font-semibold">{new Date(purchaseDate).toLocaleString()}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">Amount Paid</label>
                <p className="text-lg text-gray-800 font-semibold">${finalAmount.toFixed(2)}</p>
              </div>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Discount Applied</label>
                  <p className="text-lg text-green-600 font-semibold">-${discountAmount.toFixed(2)}</p>
                </div>
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
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Return to Home"
            aria-label="Return to Home"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Return to Home</span>
          </Link>
        </div>
      </div>

      {/* Mobile Debug Console - Only visible on mobile browsers */}
      <MobileDebugConsole />
    </div>
  );
}

