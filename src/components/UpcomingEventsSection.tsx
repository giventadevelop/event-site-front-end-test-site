'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import Link from 'next/link';
import Image from 'next/image';
import type { EventWithMedia, EventDetailsDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { isDonationBasedEvent, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { isTicketedEventCube } from '@/lib/eventcube/utils';
import { getTenantId } from '@/lib/env';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';

// Component to handle event image loading errors and hide container when image fails
function EventImageWithErrorHandling({
  src,
  alt,
  isPastEvent,
}: {
  src: string;
  alt: string;
  isPastEvent: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Don't render if image fails to load or src is empty
  if (imageError || !src) {
    return isPastEvent ? (
      <div className="event-card-banner-media event-card-banner-media--upcoming relative flex items-start justify-end pt-3 pr-3">
        <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
          Past Event
        </span>
      </div>
    ) : (
      <div className="event-card-banner-media event-card-banner-media--upcoming" aria-hidden />
    );
  }

  return (
    <div className="event-card-banner-media event-card-banner-media--upcoming">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="event-card-banner-image transition-transform duration-300 group-hover:scale-105"
        onError={() => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
      {/* Past Event Badge */}
      {isPastEvent && imageLoaded && !imageError && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
            Past Event
          </span>
        </div>
      )}
    </div>
  );
}

const UPCOMING_TILT_MAX_RX = 6;
const UPCOMING_TILT_MAX_RY = 8;

function UpcomingEventGlassCard({
  event,
  index,
  isUpcomingEvents,
  cardTintClass,
  formatDate,
  formatTime,
}: {
  event: EventWithMedia;
  index: number;
  isUpcomingEvents: boolean;
  cardTintClass: string;
  formatDate: (dateString: string, timezone?: string) => string;
  formatTime: (time: string) => string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, z: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setInView(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const ry = Math.max(-UPCOMING_TILT_MAX_RY, Math.min(UPCOMING_TILT_MAX_RY, x * 2 * UPCOMING_TILT_MAX_RY));
      const rx = Math.max(-UPCOMING_TILT_MAX_RX, Math.min(UPCOMING_TILT_MAX_RX, -y * 2 * UPCOMING_TILT_MAX_RX));
      const z = 10 + (Math.abs(x) + Math.abs(y)) * 14;
      setTilt({ rx, ry, z: Math.min(26, z) });
    },
    [reducedMotion]
  );

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, z: 0 });
  }, []);

  const faceStyle: React.CSSProperties | undefined = reducedMotion
    ? undefined
    : {
        transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.z}px)`,
      };

  return (
    <div
      ref={wrapRef}
      className={`upcoming-events-glass-card-wrap h-full min-w-0${inView ? ' upcoming-events-glass-card-wrap--visible' : ''}`}
      style={{ ['--upcoming-events-reveal-delay' as string]: `${index * 80}ms` }}
    >
      <div
        className="upcoming-events-glass-card-face group relative flex h-full min-h-0 flex-col rounded-2xl"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={faceStyle}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-[0.14] ${cardTintClass}`}
          aria-hidden
        />
        <div
          className="upcoming-events-glass-card-shine pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-2xl"
          aria-hidden
        />
        <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
          {event.thumbnailUrl ? (
            <Link
              href={`/events/${event.id}/checkout`}
              className="block shrink-0 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <EventImageWithErrorHandling
                src={event.thumbnailUrl}
                alt={event.title}
                isPastEvent={!isUpcomingEvents}
              />
            </Link>
          ) : (
            <div
              className="event-card-banner-media event-card-banner-media--upcoming w-full shrink-0"
              aria-hidden
            />
          )}
          {!event.thumbnailUrl && !isUpcomingEvents && (
            <div className="pointer-events-none absolute right-3 top-3 z-10">
              <span className="rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white">Past Event</span>
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col border-t border-white/25 p-5">
            <h2 className="mb-2 text-xl font-bold text-gray-800">{event.title}</h2>

            {event.caption && <p className="mb-3 text-base text-gray-600">{event.caption}</p>}

            <div className="mb-2 flex w-full flex-col items-start gap-3">
              <div className="flex w-full items-start gap-3 text-gray-700">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold">{formatDate(event.startDate, event.timezone)}</span>
              </div>
              <div className="flex w-full items-start gap-3 text-gray-700">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
              {event.location && (
                <div className="flex w-full items-start gap-3 text-gray-700">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 transition-transform duration-300 group-hover:scale-110">
                    <svg className="h-10 w-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">{event.location}</span>
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/events/${event.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex h-14 flex-shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-green-100 px-6 transition-all duration-300 hover:scale-105 hover:bg-green-200"
                title="See Event Details"
                aria-label="See Event Details"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-200">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-green-700">See Event Details</span>
              </Link>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {isUpcomingEvents && event.isRegistrationRequired === true && (
                  <Link
                    href={`/events/${event.id}/register`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block transition-transform hover:scale-105"
                  >
                    <img
                      src="/images/register_here_button.jpg"
                      alt="Register Here"
                      className="h-[70px] w-[200px] max-w-full object-contain"
                      width={200}
                      height={70}
                    />
                  </Link>
                )}

                {isUpcomingEvents && isTicketedFundraiserEvent(event) && (
                  <Link
                    href={`/events/${event.id}/givebutter-checkout`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block transition-transform hover:scale-105"
                    title="Buy Tickets"
                    aria-label="Buy Tickets"
                  >
                    <img
                      src="/images/buy_tickets_click_here_fundraiser.png"
                      alt="Buy Tickets"
                      className="h-[70px] w-[200px] max-w-full object-contain"
                      width={200}
                      height={70}
                    />
                  </Link>
                )}

                {isUpcomingEvents && isTicketedEventCube(event) && (
                  <Link
                    href={`/events/${event.id}/eventcube-checkout`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block transition-transform hover:scale-105"
                    title="Buy Tickets"
                    aria-label="Buy Tickets"
                  >
                    <img
                      src="/images/buy_tickets_click_here_red.webp"
                      alt="Buy Tickets"
                      className="h-[70px] w-[200px] max-w-full object-contain"
                      width={200}
                      height={70}
                    />
                  </Link>
                )}

                {isUpcomingEvents &&
                  event.admissionType?.toUpperCase() === 'TICKETED' &&
                  !isTicketedFundraiserEvent(event) &&
                  !isTicketedEventCube(event) && (
                    <Link
                      href={
                        event.manualPaymentEnabled === true &&
                        (event.paymentFlowMode === 'MANUAL_ONLY' || event.paymentFlowMode === 'HYBRID')
                          ? `/events/${event.id}/manual-checkout`
                          : `/events/${event.id}/checkout`
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block transition-transform hover:scale-105"
                      title="Buy Tickets"
                      aria-label="Buy Tickets"
                    >
                      <img
                        src="/images/buy_tickets_click_here_red.webp"
                        alt="Buy Tickets"
                        className="h-[70px] w-[200px] max-w-full object-contain"
                        width={200}
                        height={70}
                      />
                    </Link>
                  )}

                {isUpcomingEvents && isDonationBasedEvent(event) && !isTicketedFundraiserEvent(event) && (
                  <Link
                    href={`/events/${event.id}/donation`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-14 flex-shrink-0 items-center justify-center gap-3 rounded-xl bg-teal-100 px-6 transition-all duration-300 hover:scale-105 hover:bg-teal-200"
                    title="Make a Donation"
                    aria-label="Make a Donation"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-200">
                      <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-teal-700">Make a Donation</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const UpcomingEventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isUpcomingEvents, setIsUpcomingEvents] = useState(true);

  // Defer upcoming events API call until page ready + 300ms
  // This section mounts after TenantSettings loads, adding natural delay on top
  const shouldFetch = useDeferredFetch(300);

  // Cache key for sessionStorage (env-prefixed so local/dev/prod are separate)
  const CACHE_KEY = getHomepageCacheKey('homepage_events_cache');
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Run cache read before paint so cached data shows immediately (no delay on refresh)
  useLayoutEffect(() => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp, isUpcoming } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setEvents(data ?? []);
          setIsUpcomingEvents(isUpcoming !== false);
          setLoading(false);
        }
      }
    } catch (_) { /* ignore */ }
  }, [CACHE_KEY, CACHE_DURATION]);

  // Array of modern background colors (same as events page)
  const cardBackgrounds = [
    'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-gradient-to-br from-green-50 to-green-100',
    'bg-gradient-to-br from-purple-50 to-purple-100',
    'bg-gradient-to-br from-pink-50 to-pink-100',
    'bg-gradient-to-br from-yellow-50 to-yellow-100',
    'bg-gradient-to-br from-indigo-50 to-indigo-100',
    'bg-gradient-to-br from-teal-50 to-teal-100',
    'bg-gradient-to-br from-orange-50 to-orange-100',
    'bg-gradient-to-br from-cyan-50 to-cyan-100',
    'bg-gradient-to-br from-rose-50 to-rose-100'
  ];

  // Function to get random background color for each event
  const getRandomBackground = (index: number) => {
    return cardBackgrounds[index % cardBackgrounds.length];
  };

  useEffect(() => {
    async function fetchEvents() {
      // Check cache first (instant, no deferral needed for cached data)
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp, isUpcoming } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached events data');
            setEvents(data);
            setIsUpcomingEvents(isUpcoming);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read events cache:', error);
      }

      // Defer network request until page is ready + delay
      if (!shouldFetch) return;

      setLoading(true);
      setFetchError(false);
      try {
        // First try to get upcoming events
        // Fetch more events (15) to account for recurring events being grouped into single occurrences
        // After processing, we'll limit to 6 events for display
        const today = new Date().toISOString().split('T')[0];
        const tenantId = getTenantId();
        const upcomingParams = new URLSearchParams({
          'tenantId.equals': tenantId,
          sort: 'startDate,asc',
          page: '0',
          size: '15', // Increased from 6 to 15 to ensure we have enough after recurring event grouping
          'startDate.greaterThanOrEqual': today,
          'isActive.equals': 'true' // Only show active events
        });

        const upcomingRes = await fetch(`/api/proxy/event-details?${upcomingParams.toString()}`);
        if (!upcomingRes.ok) throw new Error('Failed to fetch upcoming events');
        const upcomingEvents: EventDetailsDTO[] = await upcomingRes.json();
        let upcomingEventList = Array.isArray(upcomingEvents) ? upcomingEvents : [upcomingEvents];

        // If we have upcoming events, use them
        if (upcomingEventList.length > 0) {
          // Process recurring events to show only next occurrence (same logic as HeroSection)
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(todayDate.getFullYear() + 1);
          oneYearFromNow.setHours(23, 59, 59, 999);

          const processedEvents: EventDetailsDTO[] = [];
          const recurringSeriesMap = new Map<number, EventDetailsDTO>(); // Map seriesId -> event with earliest next occurrence

          // Process events and filter recurring events to show only next occurrence
          upcomingEventList.forEach((event) => {
            // Handle recurring events
            if (isRecurringEvent(event)) {
              const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;

              // Calculate next occurrence date
              const nextOccurrence = getNextOccurrenceDate(event, todayDate);

              if (!nextOccurrence) {
                console.log(`[UpcomingEventsSection] Skipping recurring event ${event.id}: No next occurrence found`);
                return; // Skip if no next occurrence
              }

              // Check if next occurrence is within 1 year
              if (nextOccurrence > oneYearFromNow) {
                console.log(`[UpcomingEventsSection] Skipping recurring event ${event.id}: Next occurrence ${nextOccurrence.toISOString()} is beyond 1 year`);
                return; // Skip if beyond 1 year
              }

              // Update event startDate to next occurrence for display
              const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
              const eventWithNextOccurrence = { ...event, startDate: nextOccurrenceStr };

              // Check if we already have an event from this series
              const existingSeriesEvent = recurringSeriesMap.get(seriesId);
              if (!existingSeriesEvent) {
                // First event from this series - add it
                recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                console.log(`[UpcomingEventsSection] Added recurring event series ${seriesId}: ${event.title} (Next occurrence: ${nextOccurrenceStr})`);
              } else {
                // Compare dates - keep the one with earlier next occurrence
                const existingDate = new Date(existingSeriesEvent.startDate!);
                if (nextOccurrence < existingDate) {
                  recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                  console.log(`[UpcomingEventsSection] Updated recurring event series ${seriesId}: ${event.title} (Earlier occurrence: ${nextOccurrenceStr})`);
                }
              }
            } else {
              // Check if this is a child event (has parentEventId or recurrenceSeriesId but isRecurring = false)
              const seriesId = event.recurrenceSeriesId || event.parentEventId;
              if (seriesId) {
                // This is a child event - skip it (we'll use the parent event instead)
                console.log(`[UpcomingEventsSection] Skipping child event ${event.id} (series ${seriesId}) - will use parent event`);
                return;
              }
              // Non-recurring event - add directly
              processedEvents.push(event);
            }
          });

          // Add recurring events (only one per series - the next occurrence)
          recurringSeriesMap.forEach((event) => {
            processedEvents.push(event);
          });

          // Sort by startDate to show earliest events first
          processedEvents.sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          });

          // Limit to 6 events for display after processing
          const limitedEvents = processedEvents.slice(0, 6);

          console.log(`[UpcomingEventsSection] Processed ${processedEvents.length} events (${recurringSeriesMap.size} recurring series, ${processedEvents.length - recurringSeriesMap.size} non-recurring), displaying ${limitedEvents.length} events`);

          const eventsWithMedia = await Promise.all(
            limitedEvents.map(async (event: EventDetailsDTO) => {
              try {
                // First try to find homepage hero image (tenant-scoped)
                let mediaRes = await fetch(`/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHomePageHeroImage.equals=true`);
                let mediaData = await mediaRes.json();

                // If no homepage hero image found, try regular hero image
                if (!mediaData || mediaData.length === 0) {
                  mediaRes = await fetch(`/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHeroImage.equals=true`);
                  mediaData = await mediaRes.json();
                }

                if (mediaData && mediaData.length > 0) {
                  return { ...event, thumbnailUrl: mediaData[0].fileUrl };
                }
                return { ...event, thumbnailUrl: undefined };
              } catch {
                return { ...event, thumbnailUrl: undefined };
              }
            })
          );

          // Cache the upcoming events data
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: eventsWithMedia,
              timestamp: Date.now(),
              isUpcoming: true
            }));
          } catch (error) {
            console.warn('Failed to cache events data:', error);
          }

          setEvents(eventsWithMedia);
          setIsUpcomingEvents(true);
        } else {
          // No upcoming events, try to get past events
          // Fetch more events (15) to account for recurring events being grouped into single occurrences
          // After processing, we'll limit to 6 events for display
          const pastParams = new URLSearchParams({
            'tenantId.equals': tenantId,
            sort: 'startDate,desc',
            page: '0',
            size: '15', // Increased from 6 to 15 to ensure we have enough after recurring event grouping
            'endDate.lessThan': today,
            'isActive.equals': 'true' // Only show active events
          });

          const pastRes = await fetch(`/api/proxy/event-details?${pastParams.toString()}`);
          if (!pastRes.ok) throw new Error('Failed to fetch past events');
          const pastEvents: EventDetailsDTO[] = await pastRes.json();
          let pastEventList = Array.isArray(pastEvents) ? pastEvents : [pastEvents];

          // Process recurring events to show only next occurrence (same logic as upcoming events)
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(todayDate.getFullYear() + 1);
          oneYearFromNow.setHours(23, 59, 59, 999);

          const processedPastEvents: EventDetailsDTO[] = [];
          const recurringSeriesMap = new Map<number, EventDetailsDTO>(); // Map seriesId -> event with earliest next occurrence

          // Process events and filter recurring events to show only next occurrence
          pastEventList.forEach((event) => {
            // Handle recurring events
            if (isRecurringEvent(event)) {
              const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;

              // Calculate next occurrence date
              const nextOccurrence = getNextOccurrenceDate(event, todayDate);

              if (!nextOccurrence) {
                console.log(`[UpcomingEventsSection] Skipping recurring past event ${event.id}: No next occurrence found`);
                return; // Skip if no next occurrence
              }

              // Check if next occurrence is within 1 year
              if (nextOccurrence > oneYearFromNow) {
                console.log(`[UpcomingEventsSection] Skipping recurring past event ${event.id}: Next occurrence ${nextOccurrence.toISOString()} is beyond 1 year`);
                return; // Skip if beyond 1 year
              }

              // Update event startDate to next occurrence for display
              const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
              const eventWithNextOccurrence = { ...event, startDate: nextOccurrenceStr };

              // Check if we already have an event from this series
              const existingSeriesEvent = recurringSeriesMap.get(seriesId);
              if (!existingSeriesEvent) {
                // First event from this series - add it
                recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                console.log(`[UpcomingEventsSection] Added recurring past event series ${seriesId}: ${event.title} (Next occurrence: ${nextOccurrenceStr})`);
              } else {
                // Compare dates - keep the one with earlier next occurrence
                const existingDate = new Date(existingSeriesEvent.startDate!);
                if (nextOccurrence < existingDate) {
                  recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                  console.log(`[UpcomingEventsSection] Updated recurring past event series ${seriesId}: ${event.title} (Earlier occurrence: ${nextOccurrenceStr})`);
                }
              }
            } else {
              // Check if this is a child event (has parentEventId or recurrenceSeriesId but isRecurring = false)
              const seriesId = event.recurrenceSeriesId || event.parentEventId;
              if (seriesId) {
                // This is a child event - skip it (we'll use the parent event instead)
                console.log(`[UpcomingEventsSection] Skipping child past event ${event.id} (series ${seriesId}) - will use parent event`);
                return;
              }
              // Non-recurring event - add directly
              processedPastEvents.push(event);
            }
          });

          // Add recurring events (only one per series - the next occurrence)
          recurringSeriesMap.forEach((event) => {
            processedPastEvents.push(event);
          });

          // Sort by startDate descending (most recent first for past events)
          processedPastEvents.sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          });

          // Limit to 6 events for display after processing
          const limitedPastEvents = processedPastEvents.slice(0, 6);

          console.log(`[UpcomingEventsSection] Processed ${processedPastEvents.length} past events (${recurringSeriesMap.size} recurring series, ${processedPastEvents.length - recurringSeriesMap.size} non-recurring), displaying ${limitedPastEvents.length} events`);

          const eventsWithMedia = await Promise.all(
            limitedPastEvents.map(async (event: EventDetailsDTO) => {
              try {
                // First try to find homepage hero image (tenant-scoped)
                let mediaRes = await fetch(`/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHomePageHeroImage.equals=true`);
                let mediaData = await mediaRes.json();

                // If no homepage hero image found, try regular hero image
                if (!mediaData || mediaData.length === 0) {
                  mediaRes = await fetch(`/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHeroImage.equals=true`);
                  mediaData = await mediaRes.json();
                }

                if (mediaData && mediaData.length > 0) {
                  return { ...event, thumbnailUrl: mediaData[0].fileUrl };
                }
                return { ...event, thumbnailUrl: undefined };
              } catch {
                return { ...event, thumbnailUrl: undefined };
              }
            })
          );

          // Cache the past events data
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: eventsWithMedia,
              timestamp: Date.now(),
              isUpcoming: false
            }));
          } catch (error) {
            console.warn('Failed to cache events data:', error);
          }

          setEvents(eventsWithMedia);
          setIsUpcomingEvents(false);
        }
      } catch (err) {
        setFetchError(true);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [shouldFetch]);

  // Helper to format time with AM/PM
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

  // Helper to format date
  function formatDate(dateString: string, timezone: string = 'America/New_York'): string {
    if (!dateString) return '';
    return formatInTimeZone(dateString, timezone, 'EEEE, MMMM d, yyyy');
  }

  // isUpcomingEvents state is managed in useEffect based on which type of events were fetched

  // Don't render anything while loading - section will appear only when fully loaded
  if (loading) {
    return null;
  }

  // Handle fetch error state - return complete section with header
  if (fetchError) {
    return (
      <section className="py-24 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
              Our Upcoming Events
            </HomeSectionTitle>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-lg p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Events Information Temporarily Unavailable</h3>
              <p className="text-gray-500">We're currently updating our upcoming events information. Please check back later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Handle no events state - return complete section with header
  if (events.length === 0) {
    return (
      <section className="py-24 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
              Our Upcoming Events
            </HomeSectionTitle>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-lg p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Events Information Temporarily Unavailable</h3>
              <p className="text-gray-500">We're currently updating our upcoming events information. Please check back later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Normal render with events
  return (
    <section className="py-16 bg-green-50">
      <HomeSectionRail eyebrow="Events" containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <HomeSectionTitle
            className="text-3xl md:text-4xl font-bold mb-4"
            text={isUpcomingEvents ? 'Upcoming Events' : 'Recent Events'}
          />
          <p className="home-section-body-text text-lg text-gray-600 max-w-2xl mx-auto">
            {isUpcomingEvents
              ? 'Join us for our upcoming cultural celebrations and community events (showing up to 6 events)'
              : 'Take a look at our recent events and community gatherings (showing up to 6 events)'
            }
          </p>
        </div>

        {/* Events grid — two cards per row on large screens; equal-height rows */}
        <div className="mb-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {events.map((event, index) => (
            <UpcomingEventGlassCard
              key={event.id}
              event={event}
              index={index}
              isUpcomingEvents={isUpcomingEvents}
              cardTintClass={getRandomBackground(index)}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))}
        </div>

        {/* View All Events Button */}
        <div className="text-center">
          <Link
            href="/events"
            className="hero-browse-link hero-browse-link-neon"
            title="View All Events"
            aria-label="View All Events"
          >
            <span>View All Events</span>
            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </HomeSectionRail>

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        /* Events Grid with Perfect Centering like TeamSection */
        .events-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          width: 100%;
          justify-content: center;
          align-items: flex-start;
          margin: 0 auto;
        }

        /* Desktop: 3 columns with centered alignment (for up to 6 events) */
        @media (min-width: 1200px) {
          .events-grid {
            max-width: calc(3 * 300px + 2 * 1.5rem);
          }
        }

        /* Large tablet: 2 columns with centered alignment */
        @media (min-width: 900px) and (max-width: 1199px) {
          .events-grid {
            max-width: calc(2 * 300px + 1 * 1.5rem);
          }
        }

        /* Tablet: 2 columns with centered alignment */
        @media (min-width: 600px) and (max-width: 899px) {
          .events-grid {
            max-width: calc(2 * 300px + 1 * 1.5rem);
          }
        }

        /* Mobile: 1 column with centered alignment */
        @media (max-width: 599px) {
          .events-grid {
            max-width: 320px;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};

export default UpcomingEventsSection;
