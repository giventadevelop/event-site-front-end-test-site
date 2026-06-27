import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAppUrl } from '@/lib/env';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventDetailsDTO, EventAttendeeDTO, EventAttendeeGuestDTO } from '@/types';
import SuccessClient from './SuccessClient';
import PaymentSuccessClient from './PaymentSuccessClient';
import { getEventAttendee, getEventAttendeeGuests } from './ApiServerActions';

interface SuccessPageProps {
  searchParams: {
    eventId?: string;
    session_id?: string;
    pi?: string;
    attendeeId?: string;
    transactionId?: string; // New: for backend payment flow
  };
}

async function fetchEventDetails(eventId: number): Promise<EventDetailsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch event details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse text-center">
          <div className="h-16 bg-gray-200 rounded-full w-16 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

async function findPaymentTransactionByPaymentIntentId(paymentIntentId: string): Promise<string | null> {
  try {
    const baseUrl = getAppUrl();
    // Query payment transactions by paymentReference (which contains the Payment Intent ID)
    const params = new URLSearchParams({
      'paymentReference.equals': paymentIntentId,
    });
    const response = await fetch(`${baseUrl}/api/proxy/payments?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[SuccessPage] Failed to find payment transaction by Payment Intent ID:', response.status);
      // Try alternative: look up via event-ticket-transactions (legacy flow)
      const ticketParams = new URLSearchParams({
        'stripePaymentIntentId.equals': paymentIntentId,
      });
      const ticketResponse = await fetch(`${baseUrl}/api/proxy/event-ticket-transactions?${ticketParams.toString()}`, {
        cache: 'no-store',
      });
      if (ticketResponse.ok) {
        const ticketTransactions = await ticketResponse.json();
        if (Array.isArray(ticketTransactions) && ticketTransactions.length > 0) {
          // For legacy flow, we can use the ticket transaction ID
          // But we need the payment transaction ID, so return null and let legacy flow handle it
          console.log('[SuccessPage] Found ticket transaction but need payment transaction ID');
          return null;
        }
      }
      return null;
    }

    const transactions = await response.json();
    if (Array.isArray(transactions) && transactions.length > 0) {
      const transaction = transactions[0];
      // Backend returns transactionId or transactionReference
      return transaction.transactionId || transaction.transactionReference || String(transaction.id) || null;
    }

    return null;
  } catch (error) {
    console.error('[SuccessPage] Error looking up payment transaction:', error);
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // Next.js 15+ requires awaiting searchParams
  const resolvedSearchParams = typeof searchParams.then === 'function' ? await searchParams : searchParams;
  const { eventId, session_id, pi, attendeeId, transactionId } = resolvedSearchParams;

  // If transactionId is present, use PaymentSuccessClient (new backend payment flow)
  if (transactionId) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <PaymentSuccessClient
          transactionId={transactionId}
          eventId={eventId}
        />
      </Suspense>
    );
  }

  // CRITICAL: For desktop flow with Payment Intent ID, do NOT look up transaction server-side
  // Desktop flow uses SuccessClient which handles GET-only lookup and polling
  // Server-side lookup would fail if webhook hasn't processed yet, causing errors
  // If session_id or pi parameters are present, use SuccessClient (Stripe flow)
  if (session_id || pi) {
    // Desktop flow: SuccessClient will handle GET-only lookup and polling
    // Mobile flow: SuccessClient will detect mobile and redirect to ticket-qr page
    // Do NOT try to look up transaction server-side - let client component handle it
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <SuccessClient
          session_id={session_id || ''}
          payment_intent={pi || ''}
        />
      </Suspense>
    );
  }

  // Event registration flow: require eventId parameter
  const parsedEventId = eventId ? parseInt(eventId) : null;
  if (!parsedEventId || isNaN(parsedEventId)) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuccessPageContent eventId={parsedEventId} attendeeId={attendeeId} />
    </Suspense>
  );
}

async function SuccessPageContent({ eventId, attendeeId }: { eventId: number; attendeeId?: string }) {
  const eventDetails = await fetchEventDetails(eventId);

  if (!eventDetails) {
    notFound();
  }

  // Fetch attendee and guest information if attendeeId is provided
  let attendee: EventAttendeeDTO | null = null;
  let guests: EventAttendeeGuestDTO[] = [];

  if (attendeeId) {
    try {
      const parsedAttendeeId = parseInt(attendeeId);
      if (!isNaN(parsedAttendeeId)) {
        attendee = await getEventAttendee(parsedAttendeeId);
        if (attendee) {
          guests = await getEventAttendeeGuests(parsedAttendeeId);
        }
      }
    } catch (error) {
      console.error('Error fetching attendee details:', error);
    }
  }

  const eventDate = formatInTimeZone(
    eventDetails.startDate,
    eventDetails.timezone,
    'EEEE, MMMM d, yyyy (zzz)'
  );

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Confirmed!</h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              {eventDetails.title}
            </h2>
            <p className="text-green-700 mb-2">
              <strong>Date:</strong> {eventDate}
            </p>
            {eventDetails.startTime && eventDetails.endTime && (
              <p className="text-green-700 mb-2">
                <strong>Time:</strong> {eventDetails.startTime} - {eventDetails.endTime}
              </p>
            )}
            {eventDetails.location && (
              <p className="text-green-700">
                <strong>Location:</strong> {eventDetails.location}
              </p>
            )}
          </div>

          {/* Registration Details */}
          {attendee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Registration Details</h3>
              <div className="text-left space-y-2">
                <p className="text-blue-700">
                  <strong>Primary Attendee:</strong> {attendee.firstName} {attendee.lastName}
                </p>
                <p className="text-blue-700">
                  <strong>Email:</strong> {attendee.email}
                </p>
                {attendee.phone && (
                  <p className="text-blue-700">
                    <strong>Phone:</strong> {attendee.phone}
                  </p>
                )}
                <p className="text-blue-700">
                  <strong>Registration Status:</strong> {attendee.registrationStatus}
                </p>
                {attendee.totalNumberOfGuests && attendee.totalNumberOfGuests > 0 && (
                  <p className="text-blue-700">
                    <strong>Total Guests:</strong> {attendee.totalNumberOfGuests}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Guest Information */}
          {guests.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Guest Information</h3>
              <div className="space-y-3">
                {guests.map((guest, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                    <p className="font-medium text-purple-800">
                      {guest.firstName} {guest.lastName}
                    </p>
                    <div className="text-sm text-purple-600 space-y-1">
                      <p><strong>Age Group:</strong> {guest.ageGroup}</p>
                      <p><strong>Relationship:</strong> {guest.relationship}</p>
                      {guest.email && <p><strong>Email:</strong> {guest.email}</p>}
                      {guest.phone && <p><strong>Phone:</strong> {guest.phone}</p>}
                      {guest.specialRequirements && (
                        <p><strong>Special Requirements:</strong> {guest.specialRequirements}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Section */}
          {attendee && attendee.qrCodeData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Your QR Code</h3>
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img
                    src={attendee.qrCodeData}
                    alt="Registration QR Code"
                    className="mx-auto"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Present this QR code at the event for check-in
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">What's Next?</h3>
            <ul className="text-blue-700 text-left space-y-2">
              <li>• You will receive a confirmation email shortly</li>
              <li>• Your registration is subject to approval</li>
              <li>• You will be notified of the final status</li>
              <li>• Check your email for any additional instructions</li>
              {attendee?.qrCodeData && (
                <li>• Save your QR code for easy check-in at the event</li>
              )}
            </ul>
          </div>

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
      </div>
    </div>
  );
}