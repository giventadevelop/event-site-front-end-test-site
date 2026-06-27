'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm } from '@/components/EventForm';
import type { EventDetailsDTO, EventTypeDetailsDTO } from '@/types';
import Link from 'next/link';
import { FaUsers, FaPhotoVideo, FaCalendarAlt, FaTags, FaTicketAlt, FaHome, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie, FaClipboardCheck, FaChartLine, FaDollarSign } from 'react-icons/fa';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;
  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

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
    setSaveStatus('saving');
    setSaveMessage('Please wait while we save your event details.');

    try {
      const res = await fetch(`/api/proxy/event-details/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to update event';
        try {
          const errorText = await res.text();
          // Try to parse as JSON (JHipster error format)
          try {
            const errorJson = JSON.parse(errorText);
            // Extract meaningful error message
            if (errorJson.detail) {
              // Parse JHipster error detail
              const detail = errorJson.detail;
              if (detail.includes('Unable to bind parameter')) {
                errorMessage = 'Invalid data format. Please check all fields and try again.';
              } else if (detail.includes('null') && detail.includes('Unknown Types value')) {
                errorMessage = 'Some required fields are missing or invalid. Please review your event configuration and try again.';
              } else if (detail.includes('recurrence_weekly_days') && detail.includes('integer[]')) {
                errorMessage = 'Recurrence configuration error. Please check your recurrence settings and try again.';
              } else if (detail.includes('could not execute batch')) {
                errorMessage = 'Database error occurred while saving. Please check all fields and try again.';
              } else {
                // Use detail but truncate if too long
                errorMessage = detail.length > 150 ? detail.substring(0, 150) + '...' : detail;
              }
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.title) {
              errorMessage = errorJson.title;
            }
          } catch {
            // Not JSON, use text as-is but make it more concise
            if (errorText.length > 200) {
              errorMessage = errorText.substring(0, 200) + '...';
            } else {
              errorMessage = errorText;
            }
          }
        } catch {
          errorMessage = 'Failed to update event. Please try again.';
        }
        throw new Error(errorMessage);
      }

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your event has been saved successfully. Redirecting to manage events...');

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/admin/manage-events');
      }, 1500);
    } catch (e: any) {
      setSaveStatus('error');
      const userMessage = e.message || 'Failed to update event. Please try again.';
      setSaveMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!event) return <div className="p-8">Loading event details...</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto" style={{ paddingTop: '118px' }}>
      {/* Dashboard Card with Grid Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/admin"
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Admin Home"
              aria-label="Admin Home"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaHome className="w-8 h-8 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Admin Home</span>
            </Link>
            <Link
              href="/admin/manage-usage"
              className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Manage Usage"
              aria-label="Manage Usage"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="w-8 h-8 text-indigo-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Usage</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/media/list`}
              className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Manage Media Files"
              aria-label="Manage Media Files"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaPhotoVideo className="w-8 h-8 text-yellow-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Media Files</span>
            </Link>
            <Link
              href="/admin/manage-events"
              className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Manage Events"
              aria-label="Manage Events"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="w-8 h-8 text-green-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Manage Events</span>
            </Link>
            {event?.admissionType === 'ticketed' && (
              <>
                <Link
                  href={`/admin/events/${eventId}/ticket-types/list`}
                  className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-3 text-xs transition-all group"
                  title="Manage Ticket Types"
                  aria-label="Manage Ticket Types"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <FaTags className="w-8 h-8 text-purple-500" />
                  </div>
                  <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
                </Link>
                <Link
                  href={`/admin/events/${eventId}/tickets/list`}
                  className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-3 text-xs transition-all group"
                  title="Manage Tickets"
                  aria-label="Manage Tickets"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <FaTicketAlt className="w-8 h-8 text-teal-500" />
                  </div>
                  <span className="font-semibold text-center leading-tight">Manage Tickets</span>
                </Link>
              </>
            )}
            <Link
              href={`/admin/check-in-analytics?eventId=${eventId}`}
              className="flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Check-In Analytics"
              aria-label="Check-In Analytics"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaClipboardCheck className="w-8 h-8 text-cyan-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Check-In Analytics</span>
            </Link>
            <Link
              href={`/admin/sales-analytics?eventId=${eventId}`}
              className="flex flex-col items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg shadow-md p-3 text-xs transition-all group"
              title="Sales Analytics"
              aria-label="Sales Analytics"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="w-8 h-8 text-sky-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Sales Analytics</span>
            </Link>
            {/* Manual Payment Button - Only show if event is manual payment type */}
            {event && (
              (event.paymentFlowMode === 'MANUAL_ONLY' || 
               (event.paymentFlowMode === 'HYBRID' && event.manualPaymentEnabled === true)) && (
                <Link
                  href={`/admin/manual-payments?eventId=${eventId}`}
                  className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg shadow-md p-3 text-xs transition-all group"
                  title="Manual Payments [Zelle, Venmo…]"
                  aria-label="Manual Payments [Zelle, Venmo…]"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <FaDollarSign className="w-8 h-8 text-emerald-500" />
                  </div>
                  <span className="font-semibold text-center leading-tight">Manual Payments [Zelle, Venmo…]</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Special Event Management Features Card */}
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-purple-800 mb-2">🎭 Event Management Features</h2>
            <p className="text-sm text-purple-600">Manage performers, contacts, sponsors, emails, and program directors for this event</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Event Emails"
              aria-label="Event Emails"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-10 h-10 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Emails</span>
            </Link>
            <Link
              href={`/admin/events/${eventId}/program-directors`}
              className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-4 text-xs transition-all group"
              title="Program Directors"
              aria-label="Program Directors"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaUserTie className="w-10 h-10 text-indigo-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Program Directors</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mb-8">
        <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 shadow-sm">
          <strong className="block font-semibold mb-1 text-blue-900">Tip:</strong>
          Use the management shortcuts above to add or associate performers, sponsors, contacts, emails,
          and program directors with this event.
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Edit Event - ID: {eventId}</h1>
      <div className="border rounded p-4 bg-white shadow-sm min-h-[200px]">
        <EventForm event={event} eventTypes={eventTypes} onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* Save Status Dialog */}
      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        message={saveMessage}
        onClose={() => {
          if (saveStatus === 'error') {
            setSaveStatus('idle');
            setSaveMessage('');
          }
        }}
      />
    </div>
  );
}
