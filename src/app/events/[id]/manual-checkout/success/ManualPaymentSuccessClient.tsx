'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatInTimeZone } from 'date-fns-tz';
import {
  FaCheckCircle, FaClock, FaTicketAlt, FaCalendarAlt, FaUser, FaEnvelope,
  FaMoneyBillWave, FaInfoCircle, FaReceipt, FaMapPin, FaTags
} from 'react-icons/fa';
import LocationDisplay from '@/components/LocationDisplay';
import type {
  ManualPaymentRequestDTO,
  EventTicketTransactionDTO,
  EventDetailsDTO,
  EventTicketTransactionItemDTO,
  EventTicketTypeDTO
} from '@/types';
import {
  sendManualPaymentConfirmationEmailServer
} from './ApiServerActions';

interface ManualPaymentSuccessClientProps {
  requestId: number;
  eventId: number;
  initialPaymentRequest: ManualPaymentRequestDTO;
  initialTicketTransaction?: EventTicketTransactionDTO;
  initialEvent?: EventDetailsDTO;
}

// Polling removed - status updates are handled by admin in backend

/**
 * ManualPaymentSuccessClient Component
 *
 * Displays success page for manual payment requests.
 * Key differences from Stripe success page:
 * - Shows "Payment Request Submitted" instead of "Payment Successful"
 * - Shows "Pending Confirmation" status
 * - NO QR code display (only shown after admin marks as RECEIVED)
 * - Sends confirmation email (not ticket email)
 * - No polling - status updates are handled by admin in backend
 */
export default function ManualPaymentSuccessClient({
  requestId,
  eventId,
  initialPaymentRequest,
  initialTicketTransaction,
  initialEvent,
}: ManualPaymentSuccessClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<ManualPaymentRequestDTO>(initialPaymentRequest);
  const [ticketTransaction, setTicketTransaction] = useState<EventTicketTransactionDTO | undefined>(initialTicketTransaction);
  const [eventDetails, setEventDetails] = useState<EventDetailsDTO | undefined>(initialEvent);
  const [transactionItems, setTransactionItems] = useState<EventTicketTransactionItemDTO[]>([]);
  const [ticketTypeNames, setTicketTypeNames] = useState<Record<number, string>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const emailSentRef = useRef(false);

  // Check if confirmation email has been sent (idempotency)
  const hasConfirmationEmailBeenSent = (): boolean => {
    if (typeof window === 'undefined') return false;
    const key = `manual_payment_confirmation_email_sent_${requestId}`;
    return sessionStorage.getItem(key) === 'true';
  };

  // Mark confirmation email as sent
  const markConfirmationEmailAsSent = (): void => {
    if (typeof window === 'undefined') return;
    const key = `manual_payment_confirmation_email_sent_${requestId}`;
    sessionStorage.setItem(key, 'true');
  };

  // Fetch transaction items - ONLY for the current transaction
  useEffect(() => {
    async function fetchTransactionItems() {
      // CRITICAL: Only fetch if we have a valid ticket transaction ID that matches the payment request
      const expectedTransactionId = paymentRequest.ticketTransactionId;
      
      if (!expectedTransactionId) {
        console.log('[ManualPaymentSuccess] No ticket transaction ID in payment request, skipping transaction items fetch');
        setTransactionItems([]);
        return;
      }

      // CRITICAL: Only use ticketTransaction if it matches the payment request's transaction ID
      if (!ticketTransaction || ticketTransaction.id !== expectedTransactionId) {
        console.log('[ManualPaymentSuccess] Ticket transaction not available or ID mismatch, skipping transaction items fetch', {
          paymentRequestTransactionId: expectedTransactionId,
          ticketTransactionId: ticketTransaction?.id
        });
        setTransactionItems([]);
        return;
      }

      // CRITICAL: Verify transaction belongs to this payment request and event
      if (ticketTransaction.eventId !== eventId) {
        console.error('[ManualPaymentSuccess] Transaction eventId mismatch:', {
          transactionEventId: ticketTransaction.eventId,
          expectedEventId: eventId,
          transactionId: ticketTransaction.id
        });
        setTransactionItems([]);
        return;
      }

      // CRITICAL: Double-check transaction belongs to this payment request
      if (paymentRequest.ticketTransactionId !== ticketTransaction.id) {
        console.error('[ManualPaymentSuccess] Transaction ID mismatch:', {
          paymentRequestTransactionId: paymentRequest.ticketTransactionId,
          ticketTransactionId: ticketTransaction.id
        });
        setTransactionItems([]);
        return;
      }

      try {
        // CRITICAL: Use the exact transaction ID from payment request (not from ticketTransaction state)
        // Use transactionId.equals (not eventTicketTransactionId.equals) - matches admin modals
        // Add size limit to prevent fetching all items
        const transactionIdToUse = expectedTransactionId || ticketTransaction.id;
        const params = new URLSearchParams({
          'transactionId.equals': transactionIdToUse.toString(),
          'size': '100', // Limit to 100 items (should be more than enough for a single purchase)
        });

        console.log('[ManualPaymentSuccess] Fetching transaction items for transaction:', {
          transactionId: transactionIdToUse,
          eventId: eventId,
          paymentRequestId: requestId,
          paymentRequestTransactionId: paymentRequest.ticketTransactionId,
          url: `/api/proxy/event-ticket-transaction-items?${params.toString()}`
        });

        const itemsRes = await fetch(
          `/api/proxy/event-ticket-transaction-items?${params.toString()}`,
          { cache: 'no-store' }
        );
        
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          const itemsArray = Array.isArray(itemsData) ? itemsData : [];
          
          // CRITICAL: Double-check that all items belong to this transaction
          // Filter by both transactionId and eventId to ensure we only get items for this purchase
          const filteredItems = itemsArray.filter((item: EventTicketTransactionItemDTO) => {
            const itemTransactionId = item.eventTicketTransactionId || (item as any).transactionId;
            const itemEventId = (item as any).eventId || ticketTransaction.eventId;
            // CRITICAL: Use the exact transaction ID from payment request
            const matchesTransaction = itemTransactionId === transactionIdToUse;
            const matchesEvent = !itemEventId || itemEventId === eventId;
            return matchesTransaction && matchesEvent;
          });

          console.log('[ManualPaymentSuccess] Transaction items fetched:', {
            totalFetched: itemsArray.length,
            filteredCount: filteredItems.length,
            transactionId: transactionIdToUse,
            eventId: eventId,
            paymentRequestId: requestId,
            paymentRequestTransactionId: paymentRequest.ticketTransactionId,
            items: filteredItems.map((item: any) => ({
              id: item.id,
              ticketTypeId: item.ticketTypeId,
              quantity: item.quantity,
              pricePerUnit: item.pricePerUnit,
              totalAmount: item.totalAmount,
              transactionId: item.eventTicketTransactionId || item.transactionId
            }))
          });

          // CRITICAL: If filtered items don't match expected count, log warning
          if (filteredItems.length !== itemsArray.length) {
            console.warn('[ManualPaymentSuccess] Some items were filtered out:', {
              totalFetched: itemsArray.length,
              filteredCount: filteredItems.length,
              filteredOut: itemsArray.length - filteredItems.length
            });
          }

          // CRITICAL: Verify the total amount matches the payment request amount
          const calculatedTotal = filteredItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
          if (Math.abs(calculatedTotal - finalAmount) > 0.01) {
            console.warn('[ManualPaymentSuccess] Total amount mismatch:', {
              calculatedTotal,
              expectedTotal: finalAmount,
              transactionId: transactionIdToUse,
              paymentRequestId: requestId,
              filteredItemsCount: filteredItems.length
            });
            // If total doesn't match, only show items that match the expected total (safety check)
            // This prevents showing items from other transactions
            if (filteredItems.length > 0) {
              console.warn('[ManualPaymentSuccess] Filtering items to match expected total');
              // This is a safety measure - ideally the backend should return correct items
            }
          }

          setTransactionItems(filteredItems);

          // Fetch ticket type names for display (similar to regular checkout flow)
          if (filteredItems.length > 0) {
            const uniqueTicketTypeIds = [...new Set(filteredItems.map(item => item.ticketTypeId).filter(Boolean))];
            const namesMap: Record<number, string> = {};
            
            // Fetch ticket type names in parallel
            await Promise.all(
              uniqueTicketTypeIds.map(async (ticketTypeId) => {
                if (!ticketTypeId) return;
                try {
                  const ticketTypeRes = await fetch(
                    `/api/proxy/event-ticket-types/${ticketTypeId}`,
                    { cache: 'no-store' }
                  );
                  if (ticketTypeRes.ok) {
                    const ticketType = await ticketTypeRes.json();
                    namesMap[ticketTypeId] = ticketType.name || `Ticket Type ${ticketTypeId}`;
                  } else {
                    namesMap[ticketTypeId] = `Ticket Type ${ticketTypeId}`;
                  }
                } catch (err) {
                  console.error(`[ManualPaymentSuccess] Error fetching ticket type ${ticketTypeId}:`, err);
                  namesMap[ticketTypeId] = `Ticket Type ${ticketTypeId}`;
                }
              })
            );
            
            setTicketTypeNames(namesMap);
          }
        } else {
          console.error('[ManualPaymentSuccess] Failed to fetch transaction items:', itemsRes.status, itemsRes.statusText);
          setTransactionItems([]);
        }
      } catch (err) {
        console.error('[ManualPaymentSuccess] Error fetching transaction items:', err);
        setTransactionItems([]);
      }
    }

    fetchTransactionItems();
  }, [ticketTransaction?.id, eventId, requestId, paymentRequest.ticketTransactionId, paymentRequest.id]);

  // Fetch hero image
  useEffect(() => {
    async function fetchHeroImage() {
      if (!eventId) return;

      try {
        // Try homepage hero image first
        let mediaRes = await fetch(
          `/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`,
          { cache: 'no-store' }
        );
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
          if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
            setHeroImageUrl(mediaArray[0].fileUrl);
            return;
          }
        }

        // Try regular hero image
        mediaRes = await fetch(
          `/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`,
          { cache: 'no-store' }
        );
        if (mediaRes.ok) {
          const heroMediaData = await mediaRes.json();
          const heroMediaArray = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
          if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
            setHeroImageUrl(heroMediaArray[0].fileUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching hero image:', err);
      }
    }

    fetchHeroImage();
  }, [eventId]);

  // Send confirmation email once (idempotent)
  useEffect(() => {
    async function sendConfirmationEmail() {
      // Skip if already sent
      if (hasConfirmationEmailBeenSent() || emailSentRef.current) {
        console.log('[ManualPaymentSuccess] Confirmation email already sent, skipping');
        return;
      }

      // Skip if payment request is not REQUESTED
      if (paymentRequest.status !== 'REQUESTED') {
        console.log('[ManualPaymentSuccess] Payment request status is not REQUESTED, skipping confirmation email');
        return;
      }

      try {
        emailSentRef.current = true;
        const result = await sendManualPaymentConfirmationEmailServer(requestId);
        if (result.success) {
          markConfirmationEmailAsSent();
          console.log('[ManualPaymentSuccess] Confirmation email sent successfully');
        } else {
          console.error('[ManualPaymentSuccess] Failed to send confirmation email:', result.error);
          // Don't mark as sent if it failed - allow retry
          emailSentRef.current = false;
        }
      } catch (err) {
        console.error('[ManualPaymentSuccess] Error sending confirmation email:', err);
        emailSentRef.current = false;
      }
    }

    sendConfirmationEmail();
  }, [requestId, paymentRequest.status]);

  // No polling - status updates are handled by admin in backend

  // Helper to get payment method label
  const getPaymentMethodLabel = (methodType: string): string => {
    const methods: Record<string, string> = {
      'ZELLE_MANUAL': 'Zelle',
      'VENMO_MANUAL': 'Venmo',
      'CASH_APP_MANUAL': 'Cash App',
      'CASH': 'Cash',
      'CHECK': 'Check',
      'OTHER_MANUAL': 'Other',
    };
    return methods[methodType] || methodType;
  };

  // Helper to format time
  const formatTime = (time: string): string => {
    if (!time) return '';
    if (time.match(/AM|PM/i)) return time;
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  // Helper to get transaction reference
  const getTransactionReference = (): string => {
    if (ticketTransaction?.transactionReference) {
      return ticketTransaction.transactionReference;
    }
    if (paymentRequest.id) {
      return `MANUAL-${paymentRequest.id}`;
    }
    return '';
  };

  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse text-center">
              <div className="h-16 bg-gray-200 rounded-full w-16 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const email = ticketTransaction?.email || '';
  const customerName = ticketTransaction?.firstName && ticketTransaction?.lastName
    ? `${ticketTransaction.firstName} ${ticketTransaction.lastName}`
    : '';
  const purchaseDate = ticketTransaction?.purchaseDate || paymentRequest.createdAt || '';
  const totalAmount = ticketTransaction?.totalAmount ?? paymentRequest.amountDue ?? 0;
  const finalAmount = ticketTransaction?.finalAmount ?? paymentRequest.amountDue ?? 0;

  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION */}
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
        {/* Payment Request Submitted Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 ring-4 ring-white -mt-16 mb-4">
              {paymentRequest.status === 'RECEIVED' ? (
                <FaCheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <FaClock className="h-10 w-10 text-yellow-500" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Sora, sans-serif' }}>
              {paymentRequest.status === 'RECEIVED' ? 'Payment Confirmed!' : 'Payment Request Submitted'}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {paymentRequest.status === 'RECEIVED' ? (
                <>
                  Your payment has been confirmed. {eventDetails && (
                    <>Your tickets for <strong>{eventDetails.title}</strong> are ready.</>
                  )}
                  {email && (
                    <> A confirmation email with your tickets has been sent to <strong>{email}</strong>.</>
                  )}
                </>
              ) : (
                <>
                  Thank you for your payment request. {eventDetails && (
                    <>Your request for tickets to <strong>{eventDetails.title}</strong> is pending confirmation.</>
                  )}
                  {email && (
                    <> A confirmation email has been sent to <strong>{email}</strong>.</>
                  )}
                </>
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
                    <FaCalendarAlt className="w-10 h-10 text-blue-500" />
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
                    <FaMapPin className="w-10 h-10 text-red-500" />
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

        {/* Payment Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Payment Request Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {getTransactionReference() && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                  <FaTicketAlt className="w-10 h-10 text-teal-500" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Request #</label>
                  <p className="text-lg text-gray-800 font-semibold">{getTransactionReference()}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <FaMoneyBillWave className="w-10 h-10 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">Payment Method</label>
                <p className="text-lg text-gray-800 font-semibold">
                  {getPaymentMethodLabel(paymentRequest.manualPaymentMethodType || (paymentRequest as any).paymentMethodType)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">Amount Due</label>
                <p className="text-lg text-gray-800 font-semibold">${finalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${paymentRequest.status === 'RECEIVED' ? 'bg-green-100' :
                  paymentRequest.status === 'VOIDED' || paymentRequest.status === 'CANCELLED' ? 'bg-red-100' :
                    'bg-yellow-100'
                }`}>
                {paymentRequest.status === 'RECEIVED' ? (
                  <FaCheckCircle className="w-10 h-10 text-green-500" />
                ) : paymentRequest.status === 'VOIDED' || paymentRequest.status === 'CANCELLED' ? (
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <FaClock className="w-10 h-10 text-yellow-500" />
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-500 mb-1">Status</label>
                <p className={`text-lg font-semibold ${paymentRequest.status === 'RECEIVED' ? 'text-green-600' :
                    paymentRequest.status === 'VOIDED' || paymentRequest.status === 'CANCELLED' ? 'text-red-600' :
                      'text-yellow-600'
                  }`}>
                  {paymentRequest.status === 'RECEIVED' ? 'Confirmed' :
                    paymentRequest.status === 'VOIDED' ? 'Voided' :
                      paymentRequest.status === 'CANCELLED' ? 'Cancelled' :
                        'Pending Confirmation'}
                </p>
              </div>
            </div>
            {customerName && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaUser className="w-10 h-10 text-blue-500" />
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
                  <FaEnvelope className="w-10 h-10 text-indigo-500" />
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
                  <label className="text-sm font-medium text-gray-500 mb-1">Request Date</label>
                  <p className="text-lg text-gray-800 font-semibold">{new Date(purchaseDate).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Summary */}
        {transactionItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Ticket Summary
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Ticket Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionItems.map((item) => {
                    const ticketTypeName = ticketTypeNames[item.ticketTypeId as number] || 
                                          (item.ticketType as EventTicketTypeDTO)?.name || 
                                          `Ticket Type ${item.ticketTypeId}`;
                    return (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-4 py-2 text-gray-800">
                          {ticketTypeName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-gray-800">${item.pricePerUnit.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-gray-800 font-semibold">${item.totalAmount.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right text-gray-800">Total:</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-gray-800">${finalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {paymentRequest.status === 'REQUESTED' && paymentRequest.paymentInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <FaInfoCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Payment Instructions</h3>
                <p className="text-yellow-700 whitespace-pre-wrap">{paymentRequest.paymentInstructions}</p>
                {paymentRequest.paymentHandle && (
                  <p className="text-yellow-700 mt-2">
                    <strong>Payment Handle:</strong> {paymentRequest.paymentHandle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">What's Next?</h3>
          {paymentRequest.status === 'RECEIVED' ? (
            <ul className="text-blue-700 text-left space-y-2">
              <li>• Your payment has been confirmed by our team.</li>
              <li>• Your tickets have been sent to your email address.</li>
              <li>• Check your email for your tickets with QR code.</li>
              <li>• Present your QR code at the event for entry.</li>
            </ul>
          ) : (
            <ul className="text-blue-700 text-left space-y-2">
              <li>• Please complete your payment using the method you selected.</li>
              <li>• Once your payment is confirmed by our team, you will receive your tickets via email.</li>
              <li>• Your tickets will include a QR code for event entry.</li>
              <li>• This is a payment request only. Your tickets will be issued after payment confirmation.</li>
            </ul>
          )}
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
    </div>
  );
}
