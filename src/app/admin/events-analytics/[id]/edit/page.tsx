'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm } from '@/components/EventForm';
import type { EventDetailsDTO, EventTypeDetailsDTO } from '@/types';
import Link from 'next/link';
import { FaUsers, FaPhotoVideo, FaCalendarAlt, FaTags, FaTicketAlt, FaHome, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;
  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/proxy/event-details/${eventId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setEvent(data));
    fetch('/api/proxy/event-type-details')
      .then(res => res.ok ? res.json() : [])
      .then(data => setEventTypes(Array.isArray(data) ? data : []));
  }, [eventId]);

  async function handleSubmit(updatedEvent: EventDetailsDTO) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/event-details/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) throw new Error('Failed to update event');
      router.push('/admin');
    } catch (e: any) {
      setError(e.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  }

  if (!event) return <div className="p-8">Loading event details...</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto" style={{ paddingTop: '118px' }}>
      {/* Dashboard Card with Grid Buttons */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaHome className="w-10 h-10 text-blue-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="w-10 h-10 text-indigo-500" />
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
            href="/admin"
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Events"
            aria-label="Manage Events"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaCalendarAlt className="w-10 h-10 text-green-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
          {event?.admissionType === 'ticketed' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Special Event Management Features Card */}
      <div className="w-full mb-8">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-purple-800 mb-2">🎭 Event Management Features</h2>
          <p className="text-sm text-purple-600">Manage performers, contacts, sponsors, emails, and program directors for this event</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href={`/admin/events/${eventId}/performers`}
            className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Featured Performers"
            aria-label="Featured Performers"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaMicrophone className="w-10 h-10 text-pink-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Featured Performers</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/contacts`}
            className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Event Contacts"
            aria-label="Event Contacts"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaAddressBook className="w-10 h-10 text-emerald-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Event Contacts</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/sponsors`}
            className="flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Event Sponsors"
            aria-label="Event Sponsors"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaHandshake className="w-10 h-10 text-amber-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Event Sponsors</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/emails`}
            className="flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Event Emails"
            aria-label="Event Emails"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaEnvelope className="w-10 h-10 text-cyan-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Event Emails</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/program-directors`}
            className="flex flex-col items-center justify-center bg-violet-50 hover:bg-violet-100 text-violet-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Program Directors"
            aria-label="Program Directors"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FaUserTie className="w-10 h-10 text-violet-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Program Directors</span>
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Edit Event - ID: {eventId}</h1>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <div className="border rounded p-4 bg-white shadow-sm min-h-[200px]">
        <EventForm event={event} eventTypes={eventTypes} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}