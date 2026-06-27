import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import TicketTypeListClient from './TicketTypeListClient';
import type { EventDetailsDTO, EventTicketTypeDTO } from '@/types';
import Link from 'next/link';
import { FaUsers, FaPhotoVideo, FaCalendarAlt, FaTags, FaTicketAlt, FaPercent, FaHome } from 'react-icons/fa';
import { fetchEventDetailsForTicketListPage, fetchTicketTypesForTicketListPage } from './ApiServerActions';
import { formatInTimeZone } from 'date-fns-tz';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function TicketTypeListPage({ params }: PageProps) {
  // Fix for Next.js 15+: await auth() before using
  const { userId } = await safeAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Handle params for Next.js 15+ compatibility
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams.id;

  // Fetch the required data
  try {
    const eventDetails = await fetchEventDetailsForTicketListPage(parseInt(eventId));
    const ticketTypes = await fetchTicketTypesForTicketListPage(parseInt(eventId));

    return (
      <div className="max-w-6xl mx-auto px-4 pb-8" style={{ paddingTop: '180px' }}>
        {/* Concise Event Summary */}
        {eventDetails && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
              <div><span className="font-semibold text-gray-600">Event ID:</span> {eventDetails.id}</div>
              <div className="sm:col-span-2"><span className="font-semibold text-gray-600">Title:</span> {eventDetails.title}</div>
              <div><span className="font-semibold text-gray-600">Start Date:</span> {formatInTimeZone(eventDetails.startDate, eventDetails.timezone, 'EEEE, MMMM d, yyyy')}</div>
              <div><span className="font-semibold text-gray-600">End Date:</span> {formatInTimeZone(eventDetails.endDate || eventDetails.startDate, eventDetails.timezone, 'EEEE, MMMM d, yyyy')}</div>
              <div><span className="font-semibold text-gray-600">Time:</span> {eventDetails.startTime} {eventDetails.endTime ? `- ${eventDetails.endTime}` : ''} ({formatInTimeZone(eventDetails.startDate, eventDetails.timezone, 'zzz')})</div>
            </div>
          </div>
        )}

        {/* Responsive Button Group */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/admin"
              className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Admin Home"
              aria-label="Admin Home"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaHome className="w-10 h-10 text-gray-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Admin Home</span>
            </Link>
            <Link
              href="/admin/manage-usage"
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Usage"
              aria-label="Manage Usage"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="w-10 h-10 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Usage</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/media/list`}
              className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Media Files"
              aria-label="Manage Media Files"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaPhotoVideo className="w-10 h-10 text-yellow-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Media Files</span>
            </Link>
            <Link
              href="/admin/manage-events"
              className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Events"
              aria-label="Manage Events"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="w-10 h-10 text-green-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Events</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/ticket-types/list`}
              className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Ticket Types"
              aria-label="Manage Ticket Types"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaTags className="w-10 h-10 text-purple-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/tickets/list`}
              className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Tickets"
              aria-label="Manage Tickets"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaTicketAlt className="w-10 h-10 text-teal-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Tickets</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/discount-codes/list`}
              className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Discount Codes"
              aria-label="Manage Discount Codes"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaPercent className="w-10 h-10 text-pink-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
            </Link>
          </div>
        </div>

        <TicketTypeListClient
          eventId={eventId}
          eventDetails={eventDetails}
          ticketTypes={ticketTypes || []}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching data for ticket types list:', error);
    return (
      <div className="max-w-6xl mx-auto px-4 pb-8" style={{ paddingTop: '180px' }}>
        {/* Responsive Button Group */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/admin"
              className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Admin Home"
              aria-label="Admin Home"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaHome className="w-10 h-10 text-gray-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Admin Home</span>
            </Link>
            <Link
              href="/admin/manage-usage"
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Usage"
              aria-label="Manage Usage"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="w-10 h-10 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Usage</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/media/list`}
              className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Media Files"
              aria-label="Manage Media Files"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaPhotoVideo className="w-10 h-10 text-yellow-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Media Files</span>
            </Link>
            <Link
              href="/admin/manage-events"
              className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Events"
              aria-label="Manage Events"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="w-10 h-10 text-green-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Events</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/ticket-types/list`}
              className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Ticket Types"
              aria-label="Manage Ticket Types"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaTags className="w-10 h-10 text-purple-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/tickets/list`}
              className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Tickets"
              aria-label="Manage Tickets"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaTicketAlt className="w-10 h-10 text-teal-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Tickets</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/discount-codes/list`}
              className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Manage Discount Codes"
              aria-label="Manage Discount Codes"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaPercent className="w-10 h-10 text-pink-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
            </Link>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading ticket types
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was an error loading the ticket types for this event. Please try refreshing the page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}