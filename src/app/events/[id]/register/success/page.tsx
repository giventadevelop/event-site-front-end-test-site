"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventDetailsDTO, EventMediaDTO, EventAttendeeDTO, EventAttendeeGuestDTO, EventAttendeeAttachmentDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaUsers, FaEnvelope, FaPhone, FaPaperclip } from 'react-icons/fa';

export default function RegistrationSuccessPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const eventId = Number(id);
  const searchParams = useSearchParams();
  const attendeeId = searchParams.get('attendeeId');

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [attendee, setAttendee] = useState<EventAttendeeDTO | null>(null);
  const [guests, setGuests] = useState<EventAttendeeGuestDTO[]>([]);
  const [attachments, setAttachments] = useState<EventAttendeeAttachmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;
      setLoading(true);
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData: EventDetailsDTO = await eventRes.json();
        setEvent(eventData);

        // Fetch media
        const mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isEventManagementOfficialDocument.equals=false&sort=updatedAt,desc`);
        const mediaData = await mediaRes.json();
        setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);

        // Fetch attendee details if attendeeId is provided
        if (attendeeId) {
          try {
            const attendeeRes = await fetch(`/api/proxy/event-attendees/${attendeeId}`);
            if (attendeeRes.ok) {
              const attendeeData: EventAttendeeDTO = await attendeeRes.json();
              setAttendee(attendeeData);

              // Fetch guests for this attendee
              const guestsRes = await fetch(`/api/proxy/event-attendee-guests?eventAttendeeId.equals=${attendeeId}`);
              if (guestsRes.ok) {
                const guestsData = await guestsRes.json();
                setGuests(Array.isArray(guestsData) ? guestsData : []);
              }

              const attachmentRes = await fetch(`/api/proxy/event-attendee-attachments?attendeeId.equals=${attendeeId}&sort=createdAt,desc`);
              if (attachmentRes.ok) {
                const attachmentData = await attachmentRes.json();
                setAttachments(Array.isArray(attachmentData) ? attachmentData : []);
              }
            }
          } catch (err) {
            console.error('Error fetching attendee details:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId, attendeeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px] w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative w-full max-w-6xl">
          <Image
            src="/images/loading_events.jpg"
            alt="Loading registration details..."
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-2xl animate-pulse zoom-loading"
            priority
          />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="wavy-animation"></div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-blue-100">
            <p className="text-sm font-semibold text-blue-700">Loading registration details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Event not found. Please check the event ID.</p>
          <Link href="/events" className="text-blue-600 hover:underline mt-4 inline-block">
            View All Events
          </Link>
        </div>
      </div>
    );
  }

  // Find flyer/hero image
  const flyer = media.find((m) => m.eventFlyer && m.fileUrl) || media.find((m) => m.fileUrl);

  // Format date
  const formatDate = (dateStr: string, timezone: string) => {
    if (!dateStr) return '';
    try {
      return formatInTimeZone(new Date(dateStr), timezone || 'America/New_York', 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    // Convert 24-hour to 12-hour format if needed
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatAttachmentSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    return ` • ${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50">
      {/* Success Header Section */}
      <div className="bg-gradient-to-r from-emerald-100 via-blue-100 to-indigo-100 py-20 pb-[116px] border-b border-blue-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 ring-4 ring-white shadow-lg mb-6">
              <FaCheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-indigo-900 mb-4">
              Registration Successful!
            </h1>
            <p className="text-xl text-emerald-800 font-semibold mb-2">
              Thank you for registering!
            </p>
            <p className="text-lg text-blue-800">
              You are registered for this event. See you at the event!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[116px] pb-16">
        {/* Registration Details Card */}
        {attendee && (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
              <span className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FaUser className="text-indigo-600" />
              </span>
              Your Registration Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">First Name</label>
                <p className="text-lg text-indigo-900 font-medium">{attendee.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Last Name</label>
                <p className="text-lg text-indigo-900 font-medium">{attendee.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Email</label>
                <p className="text-lg text-blue-800 font-medium flex items-center gap-2">
                  <FaEnvelope className="text-blue-500" />
                  {attendee.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Phone</label>
                <p className="text-lg text-teal-800 font-medium flex items-center gap-2">
                  <FaPhone className="text-teal-500" />
                  {attendee.phone || 'N/A'}
                </p>
              </div>
              {attendee.registrationStatus && (
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Registration Status</label>
                  <p className="text-lg">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {attendee.registrationStatus}
                    </span>
                  </p>
                </div>
              )}
              {attendee.registrationDate && (
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Registration Date</label>
                  <p className="text-lg text-indigo-900 font-medium">
                    {formatInTimeZone(new Date(attendee.registrationDate), event.timezone || 'America/New_York', 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {attendee.notes && attendee.notes.trim().length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-indigo-900 mb-3">Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-gray-800 whitespace-pre-wrap">
                  {attendee.notes}
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <span className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FaPaperclip className="text-indigo-600" />
                  </span>
                  Uploaded Attachments ({attachments.length})
                </h3>
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-indigo-900 truncate">
                          {attachment.originalFilename || attachment.title || "Attachment"}
                        </p>
                        <p className="text-xs text-indigo-700">
                          {attachment.contentType || "Unknown type"}{formatAttachmentSize(attachment.fileSize)}
                        </p>
                      </div>
                      {attachment.fileUrl && (
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-4 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-semibold transition-colors"
                        >
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guests Section */}
            {guests.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <span className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FaUsers className="text-purple-600" />
                  </span>
                  Guests ({guests.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guests.map((guest, idx) => (
                    <div key={idx} className="bg-purple-50/70 rounded-xl p-4 border border-purple-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="block text-xs font-semibold text-purple-700 mb-1">Name</label>
                          <p className="text-indigo-900 font-medium">
                            {guest.firstName} {guest.lastName}
                          </p>
                        </div>
                        {guest.ageGroup && (
                          <div>
                            <label className="block text-xs font-semibold text-purple-700 mb-1">Age Group</label>
                            <p className="text-indigo-900">{guest.ageGroup}</p>
                          </div>
                        )}
                        {guest.email && (
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-purple-700 mb-1">Email</label>
                            <p className="text-blue-800">{guest.email}</p>
                          </div>
                        )}
                        {guest.phone && (
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-purple-700 mb-1">Phone</label>
                            <p className="text-teal-800">{guest.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Details Card - Styled like event details page */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Event Image */}
          {flyer && flyer.fileUrl && (
            <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
              <Image
                src={flyer.fileUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Event Content */}
          <div className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-indigo-900 mb-6">{event.title}</h2>

            {event.caption && (
              <p className="text-lg text-blue-800 mb-6">{event.caption}</p>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Date</label>
                    <p className="text-lg font-semibold text-indigo-900">
                    {formatDate(event.startDate, event.timezone || 'America/New_York')}
                  </p>
                </div>
              </div>

              {/* Time */}
              {event.startTime && event.endTime && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-1">Time</label>
                    <p className="text-lg font-semibold text-indigo-900">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Location</label>
                    <div className="text-lg font-semibold text-indigo-900">
                      <LocationDisplay location={event.location} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">About This Event</h3>
                <p className="text-blue-900/90 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Link
                href={`/events/${eventId}`}
                className="flex-1 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              >
                <span className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
                <span className="font-semibold text-blue-700">View Event Details</span>
              </Link>
              <Link
                href="/events"
                className="flex-1 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              >
                <span className="w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span className="font-semibold text-teal-700">Browse More Events</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

