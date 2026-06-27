'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { getOverlayInfo } from '@/lib/heroOverlay';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';
import {
  MAX_FEATURED_EVENTS_HOMEPAGE,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';
import { EventStripBannerImage } from '@/components/EventStripBannerImage';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

const MAX_FEATURED_EVENTS = MAX_FEATURED_EVENTS_HOMEPAGE;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes (same as UpcomingEventsSection)

type FeaturedEventsSectionProps = {
  /** SSR seed — same shape as client filter; shows in first paint when provided */
  initialFeaturedEvents?: FeaturedEventWithMedia[];
};

const FeaturedEventsSection: React.FC<FeaturedEventsSectionProps> = ({
  initialFeaturedEvents = [],
}) => {
  const [isVisible, setIsVisible] = useState(() => initialFeaturedEvents.length > 0);
  const [displayedEvents, setDisplayedEvents] = useState<FeaturedEventWithMedia[]>(() =>
    initialFeaturedEvents.slice(0, MAX_FEATURED_EVENTS)
  );
  const featuredFetchEnabled = useDeferredFetch(0);
  const { filteredEvents, isLoading } = useFilteredEvents('featured', featuredFetchEnabled);

  const CACHE_KEY = getHomepageCacheKey('homepage_featured_events_cache');

  // Run cache read before paint so cached data shows immediately (no delay on refresh)
  useLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_DURATION_MS && Array.isArray(data) && data.length > 0) {
        setDisplayedEvents(data.slice(0, MAX_FEATURED_EVENTS));
        setIsVisible(true);
      }
    } catch (_) {
      /* ignore */
    }
  }, [CACHE_KEY]);

  // When useFilteredEvents has data: update displayed list, write cache, show immediately (no 300ms delay)
  useEffect(() => {
    if (isLoading || filteredEvents.length === 0) return;

    const next = filteredEvents.slice(0, MAX_FEATURED_EVENTS);
    setDisplayedEvents(next);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, timestamp: Date.now() }));
    } catch (_) {
      /* ignore */
    }

    if (!isVisible) {
      setIsVisible(true);
    }
  }, [isLoading, filteredEvents, CACHE_KEY, isVisible]);

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

  // Don't render if no featured events to show (and not from cache)
  if (displayedEvents.length === 0) {
    return null;
  }

  // Don't render if not visible yet
  if (!isVisible) {
    return null;
  }

  return (
    <section className="featured-events-section py-0 md:py-1 bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40">
      <HomeSectionRail eyebrow="Featured" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="featured-events-section-header mb-5 mt-4 text-center md:mb-6">
          <HomeSectionTitle className="featured-events-title font-heading text-2xl font-bold md:text-3xl">
            Featured Events
          </HomeSectionTitle>
        </div>

        {/* Featured Events Strip - max 3 */}
        <div className="featured-events-list">
          {displayedEvents.map((featuredEvent, index) => (
            <div
              key={featuredEvent.event.id}
              className="featured-event-card homepage-glass-card services-glass-card-face group overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm transition-all duration-300 hover:border-emerald-200/60 hover:shadow-lg"
            >
              <div className="featured-event-card-inner flex flex-col md:flex-row md:items-stretch">
                <div className="featured-event-card-media relative w-full shrink-0 md:w-[70%]">
                  {featuredEvent.media.fileUrl ? (
                    <Link
                      href={`/events/${featuredEvent.event.id}`}
                      className="block h-full w-full min-h-0"
                      title={`View ${featuredEvent.event.title}`}
                      aria-label={`View ${featuredEvent.event.title}`}
                    >
                      <EventStripBannerImage
                        src={featuredEvent.media.fileUrl}
                        alt={featuredEvent.media.altText || featuredEvent.event.title}
                        priority={index === 0}
                        variant="featured"
                      />
                    </Link>
                  ) : (
                    <div className="event-card-banner-media event-card-banner-media--featured-strip flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Featured event pill — glass indigo + gold accent */}
                  <div className="absolute top-2.5 left-2.5 z-[5] md:top-3 md:left-3">
                    <div
                      className="featured-event-pill-badge featured-event-pill-badge--featured"
                      role="status"
                      aria-label="Featured event"
                    >
                      <span className="featured-event-pill-badge-icon" aria-hidden>
                        <svg
                          className="featured-event-pill-badge-star"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.9 5.7 21.1 8 14 2 9.4h7.6L12 2z" />
                        </svg>
                      </span>
                      <span className="featured-event-pill-badge-text">
                        <span className="featured-event-pill-badge-label">Featured event</span>
                      </span>
                    </div>
                  </div>

                  {/* Buy Ticket / Fundraiser overlay - bottom right (same logic as hero) */}
                  {(() => {
                    const overlay = getOverlayInfo(featuredEvent.event);
                    if (!overlay) return null;
                    return (
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                        <Link
                          href={overlay.href}
                          className="block cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={(e) => e.stopPropagation()}
                          title={overlay.alt}
                          aria-label={overlay.alt}
                        >
                          <img
                            src={overlay.image}
                            alt={overlay.alt}
                            className="object-contain w-[88px] h-[30px] sm:w-[100px] sm:h-[34px] md:w-[110px] md:h-[36px]"
                          />
                        </Link>
                      </div>
                    );
                  })()}
                </div>

                <div className="featured-event-card-details relative flex w-full min-h-0 flex-col md:w-[30%]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent md:block" aria-hidden />

                  <div className="featured-event-card-details-body">
                    <div className="featured-event-card-details-main">
                    <div>
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600/90">
                        Event details
                      </p>
                      <h3 className="font-heading line-clamp-2 text-sm font-semibold leading-snug text-slate-900 md:line-clamp-1 md:text-base">
                        {featuredEvent.event.title}
                      </h3>
                    </div>

                    <div className="featured-event-meta-list">
                      <div className="featured-event-meta-row text-slate-700">
                        <div className="featured-event-meta-row-icon bg-blue-100">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium truncate sm:text-sm">
                          {featuredEvent.event.timezone
                            ? formatInTimeZone(featuredEvent.event.startDate, featuredEvent.event.timezone, 'EEE, MMM d, yyyy')
                            : new Date(featuredEvent.event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>

                      {featuredEvent.event.startTime && (
                        <div className="featured-event-meta-row text-slate-700">
                          <div className="featured-event-meta-row-icon bg-green-100">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium sm:text-sm">{featuredEvent.event.startTime}</span>
                        </div>
                      )}

                      {featuredEvent.event.location && (
                        <div className="featured-event-meta-row text-slate-700">
                          <div className="featured-event-meta-row-icon bg-purple-100">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium truncate sm:text-sm">{featuredEvent.event.location}</span>
                        </div>
                      )}
                    </div>
                    </div>

                    <div className="featured-event-card-actions">
                      <Link
                        href={`/events/${featuredEvent.event.id}`}
                        className="flex h-9 min-w-0 flex-1 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-100 hover:shadow-md"
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
                        const eventDate = featuredEvent.event.startDate ? new Date(featuredEvent.event.startDate) : null;
                        if (eventDate) eventDate.setHours(0, 0, 0, 0);
                        const isUpcoming = eventDate && eventDate >= currentDate;

                        if (!isUpcoming || !featuredEvent.event.startDate || !featuredEvent.event.startTime) return null;

                        const start = toGoogleCalendarDate(featuredEvent.event.startDate, featuredEvent.event.startTime);
                        const end = toGoogleCalendarDate(featuredEvent.event.endDate || featuredEvent.event.startDate, featuredEvent.event.endTime || featuredEvent.event.startTime);
                        const text = encodeURIComponent(featuredEvent.event.title);
                        const details = encodeURIComponent(featuredEvent.event.description || '');
                        const location = encodeURIComponent(featuredEvent.event.location || '');
                        const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                        return (
                          <a
                            href={calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber-200/90 bg-amber-50 px-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-amber-100 hover:shadow-md"
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

      </HomeSectionRail>
    </section>
  );
};

export default FeaturedEventsSection;
