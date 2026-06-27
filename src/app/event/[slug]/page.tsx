import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAppUrl } from '@/lib/env';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventDetailsDTO } from '@/types';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaUserPlus, FaLock } from 'react-icons/fa';
import MemberOnlyGuard from '@/components/auth/MemberOnlyGuard';

interface EventPageProps {
  params: {
    slug: string;
  };
}

async function fetchEventBySlug(slug: string): Promise<EventDetailsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    // For now, we'll use a simple approach - in a real app, you'd have a slug-based lookup
    // This assumes the slug is actually an event ID for now
    const eventId = parseInt(slug);
    if (isNaN(eventId)) {
      return null;
    }

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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EventPageContent slug={slug} />
    </Suspense>
  );
}

async function EventPageContent({ slug }: { slug: string }) {
  const eventDetails = await fetchEventBySlug(slug);

  if (!eventDetails) {
    notFound();
  }

  const eventDate = formatInTimeZone(
    eventDetails.startDate,
    eventDetails.timezone,
    'EEEE, MMMM d, yyyy (zzz)'
  );

  const isFreeEvent = eventDetails.admissionType === 'FREE' || !eventDetails.admissionType;
  const isRegistrationRequired = eventDetails.isRegistrationRequired !== false;
  const isMemberOnly = eventDetails.isMemberOnly === true;

  return (
    <div className="max-w-5xl mx-auto px-8 pt-20 pb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Event Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {isFreeEvent && (
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                FREE EVENT
              </span>
            )}
            {eventDetails.isFeaturedEvent && (
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                FEATURED
              </span>
            )}
            {eventDetails.isLive && (
              <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                LIVE
              </span>
            )}
            {isMemberOnly && (
              <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <FaLock className="w-3 h-3" />
                MEMBERS ONLY
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 break-words overflow-wrap-anywhere">{eventDetails.title}</h1>
          {eventDetails.caption && (
            <p className="text-lg text-gray-600 mb-4 break-words overflow-wrap-anywhere">{eventDetails.caption}</p>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Event Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Date</p>
                <p className="text-gray-600">{eventDate}</p>
              </div>
            </div>

            {eventDetails.startTime && eventDetails.endTime && (
              <div className="flex items-center gap-3">
                <FaClock className="text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Time</p>
                  <p className="text-gray-600">
                    {eventDetails.startTime} - {eventDetails.endTime}
                  </p>
                </div>
              </div>
            )}

            {eventDetails.location && (
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">{eventDetails.location}</p>
                </div>
              </div>
            )}

            {eventDetails.capacity && (
              <div className="flex items-center gap-3">
                <FaUsers className="text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Capacity</p>
                  <p className="text-gray-600">{eventDetails.capacity} attendees</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Description */}
          <div>
            {eventDetails.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{eventDetails.description}</p>
              </div>
            )}

            {eventDetails.directionsToVenue && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Directions</h3>
                <p className="text-gray-600">{eventDetails.directionsToVenue}</p>
              </div>
            )}
          </div>
        </div>

        {/* Guest Policy */}
        {eventDetails.allowGuests && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Guest Policy</h3>
            <div className="text-blue-700 space-y-1">
              <p>• You may bring up to {eventDetails.maxGuestsPerAttendee || 'unlimited'} guests</p>
              {eventDetails.requireGuestApproval && (
                <p>• Guest registrations require approval</p>
              )}
              {eventDetails.enableGuestPricing && (
                <p>• Additional fees may apply for guests</p>
              )}
            </div>
          </div>
        )}

        {/* Registration Section */}
        {isRegistrationRequired && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Registration</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <p className="text-green-700 mb-2">
                  {isFreeEvent
                    ? 'This is a free event. Registration is required to attend.'
                    : 'Registration is required for this event.'
                  }
                  {isMemberOnly && ' This event is restricted to members only.'}
                </p>
                {eventDetails.specialRequirements && (
                  <p className="text-sm text-green-600">
                    Special requirements: {eventDetails.specialRequirements}
                  </p>
                )}
              </div>
              {isMemberOnly ? (
                <MemberOnlyGuard event={eventDetails}>
                  <Link
                    href={`/event/registration?eventId=${eventDetails.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center gap-2 font-semibold transition-colors"
                  >
                    <FaUserPlus />
                    Register Now
                  </Link>
                </MemberOnlyGuard>
              ) : (
                <Link
                  href={`/event/registration?eventId=${eventDetails.id}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center gap-2 font-semibold transition-colors"
                >
                  <FaUserPlus />
                  Register Now
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {(eventDetails.specialRequirements || eventDetails.dietaryRestrictions || eventDetails.accessibilityNeeds) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Information</h3>
            <div className="text-yellow-700 space-y-2">
              {eventDetails.specialRequirements && (
                <p><strong>Special Requirements:</strong> {eventDetails.specialRequirements}</p>
              )}
              {eventDetails.dietaryRestrictions && (
                <p><strong>Dietary Restrictions:</strong> {eventDetails.dietaryRestrictions}</p>
              )}
              {eventDetails.accessibilityNeeds && (
                <p><strong>Accessibility:</strong> {eventDetails.accessibilityNeeds}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events"
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Events"
            aria-label="Back to Events"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Back to Events</span>
          </Link>
          {isRegistrationRequired && (
            <Link
              href={`/event/registration?eventId=${eventDetails.id}`}
              className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Register for Event"
              aria-label="Register for Event"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">Register for Event</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}