'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { EventDetailsDTO } from '@/types';
import { proxyApiPath } from '@/lib/proxyApiPath';
import { isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { isTicketedEventCube } from '@/lib/eventcube/utils';

// Add EventWithMedia type for local use
interface EventWithMedia extends EventDetailsDTO {
  thumbnailUrl?: string;
  placeholderText?: string;
}

// Image rotation logic component with full event flyer implementation
const DynamicHeroImage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isShowingDefault, setIsShowingDefault] = useState(true);
  const [dynamicImages, setDynamicImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<EventWithMedia | null>(null);
  const [hasTicketedEvents, setHasTicketedEvents] = useState(false);

  // Default image path
  const defaultImage = "/images/hero_section/default_hero_section_second_column_poster.jpeg";

  // Fetch events with media function
  const fetchEventsWithMedia = async (): Promise<EventWithMedia[]> => {
    console.log('Fetching events from:', proxyApiPath('/api/proxy/event-details'));

    let eventsData: EventDetailsDTO[] = [];

    try {
      let eventsResponse = await fetch(
        proxyApiPath('/api/proxy/event-details?sort=startDate,asc'),
        { cache: 'no-store' }
      );

      console.log('Events response status:', eventsResponse.status);

      if (eventsResponse.ok) {
        try {
          eventsData = await eventsResponse.json();
          console.log('Successfully fetched events:', eventsData.length);
        } catch (err) {
          console.error('Failed to parse events JSON:', err);
          eventsData = [];
        }
      } else {
        console.log('Events fetch failed with status:', eventsResponse.status);
        // Try fallback
        try {
          eventsResponse = await fetch(
            proxyApiPath('/api/proxy/event-details?sort=startDate,desc'),
            { cache: 'no-store' }
          );
          if (eventsResponse.ok) {
            try {
              eventsData = await eventsResponse.json();
              console.log('Successfully fetched events (fallback):', eventsData.length);
            } catch (err) {
              console.error('Failed to parse events JSON (fallback):', err);
              eventsData = [];
            }
          } else {
            console.log('Fallback events fetch also failed with status:', eventsResponse.status);
          }
        } catch (fallbackErr) {
          console.error('Fallback events fetch error:', fallbackErr);
        }
      }
    } catch (fetchErr) {
      console.error('Events fetch error:', fetchErr);
      eventsData = [];
    }

    // Use Promise.allSettled instead of Promise.all to handle individual failures gracefully
    const eventsWithMediaResults = await Promise.allSettled(
      eventsData.map(async (event: EventDetailsDTO) => {
        try {
          console.log(`Fetching media for event ID: ${event.id}, title: ${event.title}`);

          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          try {
            const flyerRes = await fetch(
              proxyApiPath(`/api/proxy/event-medias?eventId.equals=${event.id}&eventFlyer.equals=true`),
              {
                cache: 'no-store',
                signal: controller.signal
              }
            );
            clearTimeout(timeoutId);

            let mediaArray: any[] = [];

            if (flyerRes.ok) {
              try {
                const flyerData = await flyerRes.json();
                mediaArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
                console.log(`Event ${event.id}: Found ${mediaArray.length} flyer media items`);
              } catch (jsonErr) {
                console.error(`Event ${event.id}: Failed to parse flyer JSON:`, jsonErr);
                mediaArray = [];
              }
            } else {
              console.log(`Event ${event.id}: Flyer fetch failed with status ${flyerRes.status}`);
            }

            if (!mediaArray.length) {
              const featuredController = new AbortController();
              const featuredTimeoutId = setTimeout(() => featuredController.abort(), 10000);

              try {
                const featuredRes = await fetch(
                  proxyApiPath(`/api/proxy/event-medias?eventId.equals=${event.id}&isFeaturedImage.equals=true`),
                  {
                    cache: 'no-store',
                    signal: featuredController.signal
                  }
                );
                clearTimeout(featuredTimeoutId);

                if (featuredRes.ok) {
                  try {
                    const featuredData = await featuredRes.json();
                    mediaArray = Array.isArray(featuredData) ? featuredData : (featuredData ? [featuredData] : []);
                    console.log(`Event ${event.id}: Found ${mediaArray.length} featured media items`);
                  } catch (jsonErr) {
                    console.error(`Event ${event.id}: Failed to parse featured JSON:`, jsonErr);
                    mediaArray = [];
                  }
                } else {
                  console.log(`Event ${event.id}: Featured image fetch failed with status ${featuredRes.status}`);
                }
              } catch (featuredErr) {
                clearTimeout(featuredTimeoutId);
                console.error(`Event ${event.id}: Featured image fetch error:`, featuredErr);
              }
            }

            if (mediaArray.length > 0) {
              const fileUrl = mediaArray[0].fileUrl;
              if (fileUrl) {
                return {
                  ...event,
                  thumbnailUrl: fileUrl,
                  placeholderText: mediaArray[0].altText || event.title
                };
              }
            }

            return {
              ...event,
              thumbnailUrl: undefined,
              placeholderText: event.title
            };
          } catch (mediaErr) {
            console.error(`Event ${event.id}: Media fetch error:`, mediaErr);
            return {
              ...event,
              thumbnailUrl: undefined,
              placeholderText: event.title
            };
          }
        } catch (eventErr) {
          console.error(`Event ${event.id}: General error:`, eventErr);
          return {
            ...event,
            thumbnailUrl: undefined,
            placeholderText: event.title
          };
        }
      })
    );

    // Filter out failed promises and return successful results
    const eventsWithMedia: EventWithMedia[] = eventsWithMediaResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<EventWithMedia>).value);

    console.log(`Successfully processed ${eventsWithMedia.length} events with media`);
    return eventsWithMedia;
  };

  // Fetch hero image for specific event function
  const fetchHeroImageForEvent = async (eventId: number): Promise<string | null> => {
    try {
      const mediaRes = await fetch(
        proxyApiPath(`/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`),
        { cache: 'no-store' }
      );
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
        if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
          return mediaArray[0].fileUrl;
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  useEffect(() => {
    const initializeHeroImages = async () => {
      try {
        setIsLoading(true);

        // Fetch events with media
        const events = await fetchEventsWithMedia();

        if (events && events.length > 0) {
          // Determine hero image based on upcoming events
          const today = new Date();
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(today.getMonth() + 3);

          let heroImageUrl = defaultImage;
          let nextEvent: EventWithMedia | null = null;

          // Find the next event with startDate >= today
          const upcomingEvents = events
            .filter(event => event.startDate && new Date(event.startDate) >= today)
            .sort((a, b) => {
              const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
              const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
              return aDate - bDate;
            });

          console.log(`Found ${upcomingEvents.length} upcoming events`);

          if (upcomingEvents.length > 0) {
            const event = upcomingEvents[0];
            const eventDate = event.startDate ? new Date(event.startDate) : null;
            if (eventDate && eventDate <= threeMonthsFromNow && event.thumbnailUrl) {
              heroImageUrl = event.thumbnailUrl;
              nextEvent = event;
              console.log(`Using hero image from event: ${event.title} (ID: ${event.id})`);
            }
          }

          // Fallback: If heroImageUrl is still default, try to fetch a hero image from event media
          if (!heroImageUrl || heroImageUrl === defaultImage) {
            // Find an event in the next 3 months
            const candidateEvent = events.find(event => {
              const eventDate = event.startDate ? new Date(event.startDate) : null;
              return eventDate && eventDate >= today && eventDate <= threeMonthsFromNow;
            });
            if (candidateEvent) {
              try {
                console.log(`Trying to fetch hero image for event: ${candidateEvent.title} (ID: ${candidateEvent.id})`);
                const heroUrl = await fetchHeroImageForEvent(candidateEvent.id!);
                if (heroUrl) {
                  heroImageUrl = heroUrl;
                  console.log(`Successfully fetched hero image: ${heroUrl}`);
                }
              } catch (err) {
                console.error('Failed to fetch hero image:', err);
              }
            }
          }

          // Build dynamic images array with multiple events
          const imageUrls: string[] = [];
          const eventData: EventWithMedia[] = [];

          // Add hero image if it's not the default
          if (heroImageUrl !== defaultImage) {
            imageUrls.push(heroImageUrl);
            if (nextEvent) {
              eventData.push(nextEvent);
            }
          }

          // Add more upcoming events with media (up to 3 total)
          const additionalEvents = upcomingEvents
            .filter(event => event.thumbnailUrl && event.id !== nextEvent?.id)
            .slice(0, 2); // Take up to 2 more events

          additionalEvents.forEach(event => {
            if (event.thumbnailUrl) {
              imageUrls.push(event.thumbnailUrl);
              eventData.push(event);
            }
          });

          // Add fallback to original image
          imageUrls.push("https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F67c8b636de774dd2bb5d7097f5fcc176?format=webp&width=800");

          setDynamicImages(imageUrls);

          // Check if any events have tickets (infer from admissionType or other fields)
          const hasTickets = upcomingEvents.some(event =>
            event.admissionType &&
            (event.admissionType.toLowerCase().includes('ticket') ||
              event.admissionType.toLowerCase().includes('paid') ||
              event.admissionType.toLowerCase().includes('fee'))
          );
          setHasTicketedEvents(hasTickets);

          // Set current event for display
          if (eventData.length > 0) {
            setCurrentEvent(eventData[0]);
          }
        }
      } catch (error) {
        console.error('Failed to initialize hero images:', error);
        // Fallback to original image
        setDynamicImages(["https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F67c8b636de774dd2bb5d7097f5fcc176?format=webp&width=800"]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeHeroImages();
  }, []);

  useEffect(() => {
    // Start with default image for 2 seconds (reduced from 4)
    const defaultTimer = setTimeout(() => {
      setIsShowingDefault(false);
    }, 2000);

    // If we have dynamic images, start rotating them
    if (dynamicImages.length > 0) {
      const dynamicTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const newIndex = (prev + 1) % dynamicImages.length;
            // Update current event when image changes
            if (newIndex < dynamicImages.length - 1) { // Skip the fallback image
              // This would need to be updated to match the actual event data
              // For now, we'll just rotate through the images
            }
            return newIndex;
          });
        }, 15000); // Change every 15 seconds

        return () => clearInterval(interval);
      }, 2000); // Start after 2 seconds

      return () => {
        clearTimeout(defaultTimer);
        clearTimeout(dynamicTimer);
      };
    }

    return () => clearTimeout(defaultTimer);
  }, [dynamicImages.length]);

  // Show default image for first 2 seconds
  if (isShowingDefault) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={defaultImage}
          alt="Default Hero Image"
          fill
          className="object-fill w-full h-full cursor-pointer"
          style={{
            filter: 'contrast(1.1) saturate(0.9)'
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onClick={() => {
            // Route to events page for default image
            window.location.href = '/events';
          }}
        />
        {/* No Buy Tickets overlay for default image */}
      </div>
    );
  }

  // Show dynamic images after 2 seconds
  if (dynamicImages.length > 0) {
    const isShowingEventFlyer = currentImageIndex < dynamicImages.length - 1; // Skip the fallback image

    return (
      <div className="relative w-full h-full">
        <Link
          href={isShowingEventFlyer && currentEvent && currentEvent.id ? `/events/${currentEvent.id}` : '/events'}
          className="block w-full h-full"
        >
          <Image
            src={dynamicImages[currentImageIndex]}
            alt="Dynamic Hero Image"
            fill
            className="object-fill w-full h-full cursor-pointer"
            style={{
              filter: 'contrast(1.1) saturate(0.9)'
            }}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </Link>

        {/* Buy Tickets Overlay - Show only for event flyers, not fallback image */}
        {hasTicketedEvents && currentEvent && isShowingEventFlyer && currentEvent.id && (
          <div className="absolute bottom-4 right-4 z-10">
            <Link
              href={
                isTicketedEventCube(currentEvent)
                  ? `/events/${currentEvent.id}/eventcube-checkout`
                  : isTicketedFundraiserEvent(currentEvent)
                    ? `/events/${currentEvent.id}/givebutter-checkout`
                    : `/events/${currentEvent.id}/checkout`
              }
              className="block cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src="/images/buy_tickets_click_here_red.webp"
                alt="Buy Tickets Click Here"
                width={180}
                height={90}
                className="cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Fallback to default image
  return (
    <div className="relative w-full h-full">
      <Link href="/events" className="block w-full h-full">
        <Image
          src={defaultImage}
          alt="Default Hero Image"
          fill
          className="object-fill w-full h-full cursor-pointer"
          style={{
            filter: 'contrast(1.1) saturate(0.9)'
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </Link>
      {/* No Buy Tickets overlay for fallback image */}
    </div>
  );
};

const HeroSection: React.FC = () => {
  return (
    <>
      <div className="min-h-[37.5vh] bg-white pt-20 pb-9 relative">
        {/* Donate Image - Top Right Corner - Positioned below header to avoid hamburger overlap */}
        <div className="absolute top-28 right-6 z-50 lg:top-28 lg:right-8">
          <div className="bg-transparent p-2 rounded-lg">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800"
              alt="Donate"
              width={120}
              height={60}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-lg"
              onClick={() => {
                // Add donate functionality here
                console.log('Donate button clicked');
                // You can add a link to a donation page or open a modal
              }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid Layout - Mobile: First column cells side by side, second column below; Desktop: custom columns */}
          <div className="grid gap-8 h-full min-h-[300px]">

            {/* Mobile layout: First column cells in same row */}
            <div className="grid grid-cols-2 gap-4 lg:hidden">
              {/* Cell 1: Logo - Simple image and text */}
              <div className="relative overflow-hidden group min-h-[187px] flex flex-col items-center justify-center p-4">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800"
                  alt="Malayalees Friends Logo"
                  width={180}
                  height={180}
                  className="mx-auto mb-3"
                  priority
                />
                <h2 className="text-lg font-bold text-gray-800 text-center">
                  Malayalees Friends
                </h2>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  Cultural Events Federation
                </p>
              </div>

              {/* Cell 3: Unite India Image - No text overlay */}
              <div className="relative overflow-hidden group min-h-[187px] rounded-[2rem]">
                <div
                  className="absolute inset-0 rounded-[2rem]"
                  style={{
                    background: `url('https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F7e04d4cf965b47f9b58322797a9f4ba2?format=webp&width=800') center/cover`,
                    filter: 'brightness(0.9) contrast(1.1)'
                  }}
                ></div>
              </div>

            </div>

            {/* Cell 2: Large Modern Image - Mobile - Bleed to edges */}
            <div className="relative overflow-hidden group min-h-[300px] lg:hidden -mx-4 sm:-mx-6">
              <DynamicHeroImage />
            </div>

            {/* Desktop layout: Original grid with modifications */}
            <div className="hidden lg:grid lg:grid-cols-[3fr_7fr] gap-8 items-end">

              {/* Cell 1: Logo - Simple image and text */}
              <div className="relative overflow-hidden group h-[262px] flex flex-col items-center justify-center">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800"
                  alt="Malayalees Friends Logo"
                  width={240}
                  height={240}
                  className="mx-auto mb-4"
                  priority
                />
                <h2 className="text-xl font-bold text-gray-800 text-center">
                  Malayalees Friends
                </h2>
                <p className="text-base text-gray-600 mt-2 text-center">
                  Cultural Events Federation
                </p>
              </div>

              {/* Cell 2: Large Modern Image - Dynamic image rotation */}
              <div className="relative lg:row-span-2 group h-[531px]">
                <DynamicHeroImage />
              </div>

              {/* Cell 3: Unite India Image - No text overlay */}
              <div className="relative overflow-hidden group h-[262px] rounded-[2rem]">
                <div
                  className="absolute inset-0 rounded-[2rem]"
                  style={{
                    background: `url('https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F7e04d4cf965b47f9b58322797a9f4ba2?format=webp&width=800') center/contain`,
                    backgroundRepeat: 'no-repeat',
                    filter: 'brightness(0.9) contrast(1.1)'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click to View All Events - Below Hero Section, Above What We Do Section */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
          <Image
            src="/images/click_to_view_all_events.png"
            alt="Click to View All Events"
            width={150}
            height={60}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => {
              // Route to events page
              window.location.href = '/events';
            }}
          />
        </div>
      </div>
    </>
  );
};

export default HeroSection;