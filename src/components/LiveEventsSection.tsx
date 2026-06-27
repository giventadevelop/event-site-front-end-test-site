'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { EventStripBannerImage } from '@/components/EventStripBannerImage';

interface LiveEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

const LiveEventsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  // Defer live event data fetching until after initial paint + 500ms
  const liveFetchEnabled = useDeferredFetch(500);
  const { filteredEvents, isLoading, error } = useFilteredEvents('live', liveFetchEnabled);

  // Helper to generate Google Calendar URL
  function toGoogleCalendarDate(date: string, time: string) {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-');
    let [hour, minute] = time.split(':');
    let ampm = '';
    if (minute && minute.includes(' ')) {
      [minute, ampm] = minute.split(' ');
    }
    let h = parseInt(hour, 10);
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute || '00'}00`;
  }

  // Show section after hero section is loaded (2 second delay)
  useEffect(() => {
    if (!isLoading && filteredEvents.length > 0) {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [isLoading, filteredEvents.length]);

  // Don't render anything if loading or no events
  if (isLoading || !isVisible || filteredEvents.length === 0) {
    return null;
  }

  return (
    <section className="pt-0 md:pt-0 pb-0 md:pb-0.5 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Events Strip */}
        <div className="space-y-4 md:space-y-6">
          {filteredEvents.map((liveEvent, index) => (
            <div
              key={liveEvent.event.id}
              className="homepage-glass-card services-glass-card-face group rounded-2xl shadow-md border border-gray-200/80 hover:shadow-lg transition-all duration-300 overflow-hidden h-auto md:h-[200px]"
            >
              <div className="flex flex-col md:flex-row h-full md:items-stretch">
                <div className="relative h-48 w-full shrink-0 md:h-full md:w-[70%]">
                  {liveEvent.media.fileUrl ? (
                    <EventStripBannerImage
                      src={liveEvent.media.fileUrl}
                      alt={liveEvent.media.altText || liveEvent.event.title}
                      priority={index === 0}
                    />
                  ) : (
                    <div className="event-card-banner-media event-card-banner-media--strip flex h-full min-h-[12rem] items-center justify-center bg-gray-200 md:min-h-0">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Same height as image (200px); compact content, no scrollbar */}
                <div className="live-event-details-panel w-full md:w-[30%] md:h-full min-h-0 flex flex-col rounded-b-2xl md:rounded-b-none md:rounded-r-2xl relative">
                  {/* Subtle decorative accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-3 md:p-4 overflow-hidden">
                    <div className="space-y-1.5 min-w-0">
                    {/* Event Title - compact, single line on desktop */}
                    <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-1 leading-tight tracking-tight">
                      {liveEvent.event.title}
                    </h3>

                    {/* Event Meta - compact icons and text */}
                    <div className="space-y-1">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium truncate">
                          {liveEvent.event.timezone
                            ? formatInTimeZone(liveEvent.event.startDate, liveEvent.event.timezone, 'EEE, MMM d, yyyy')
                            : new Date(liveEvent.event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>

                      {/* Time */}
                      {liveEvent.event.startTime && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">{liveEvent.event.startTime}</span>
                        </div>
                      )}

                      {/* Location */}
                      {liveEvent.event.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium truncate">{liveEvent.event.location}</span>
                        </div>
                      )}
                    </div>
                    </div>

                    {/* Action Buttons - compact */}
                    <div className="relative z-10 pt-2 flex flex-col sm:flex-row gap-2 flex-shrink-0">
                      <Link
                        href={`/events/${liveEvent.event.id}`}
                        className="flex-1 flex-shrink-0 h-9 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 min-w-0"
                        title="View Event Details"
                        aria-label="View Event Details"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded bg-green-200 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-green-700 truncate">View</span>
                      </Link>
                      {(() => {
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        const eventDate = liveEvent.event.startDate ? new Date(liveEvent.event.startDate) : null;
                        if (eventDate) eventDate.setHours(0, 0, 0, 0);
                        const isUpcoming = eventDate && eventDate >= currentDate;

                        if (!isUpcoming || !liveEvent.event.startDate || !liveEvent.event.startTime) return null;

                        const start = toGoogleCalendarDate(liveEvent.event.startDate, liveEvent.event.startTime);
                        const end = toGoogleCalendarDate(liveEvent.event.endDate || liveEvent.event.startDate, liveEvent.event.endTime || liveEvent.event.startTime);
                        const text = encodeURIComponent(liveEvent.event.title);
                        const details = encodeURIComponent(liveEvent.event.description || '');
                        const location = encodeURIComponent(liveEvent.event.location || '');
                        const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                        return (
                          <a
                            href={calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 h-9 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3"
                            title="Add to Calendar"
                            aria-label="Add to Calendar"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded bg-orange-200 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs font-semibold text-orange-700">Calendar</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveEventsSection;
