import Link from "next/link";
import { UserRoleDisplay } from "@/components/UserRoleDisplay";
// import { ProfileBootstrapper } from "@/components/ProfileBootstrapper"; // Remove client bootstrapper
import { EventCard } from "@/components/EventCard";
import Image from "next/image";
import type { EventDetailsDTO } from '@/types';
import { TeamImage } from '@/components/TeamImage';
import { getTenantId, getAppUrl } from '@/lib/env';
import { formatDateLocal } from '@/lib/date';
import { auth, currentUser } from '@clerk/nextjs/server';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

// Add EventWithMedia type for local use
interface EventWithMedia extends EventDetailsDTO {
  thumbnailUrl?: string;
  placeholderText?: string;
}

// Move all event fetching to the server component
async function fetchEventsWithMedia(): Promise<EventWithMedia[]> {
  const baseUrl = getAppUrl();
  console.log('Fetching events from:', `${baseUrl}/api/proxy/event-details`);

  let eventsData: EventDetailsDTO[] = [];

  try {
    let eventsResponse = await fetch(
      `${baseUrl}/api/proxy/event-details?sort=startDate,asc`,
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
          `${baseUrl}/api/proxy/event-details?sort=startDate,desc`,
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
            `${baseUrl}/api/proxy/event-medias?eventId.equals=${event.id}&eventFlyer.equals=true`,
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
                `${baseUrl}/api/proxy/event-medias?eventId.equals=${event.id}&isFeaturedImage.equals=true`,
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
    .filter((result): result is PromiseFulfilledResult<EventWithMedia> => result.status === 'fulfilled')
    .map(result => result.value);

  console.log(`Successfully processed ${eventsWithMedia.length} events with media`);
  return eventsWithMedia;
}

async function fetchHeroImageForEvent(eventId: number): Promise<string | null> {
  const baseUrl = getAppUrl();
  try {
    const mediaRes = await fetch(
      `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`,
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
}

export default async function HomeBackupPage() {
  /*
  const session = await auth();
  const userId = session?.userId;
  let user = null;
  if (userId) {
    user = await currentUser();
    if (user) {
      try {
        await bootstrapUserProfile({ userId, user });
      } catch (err) {
        console.error('SSR profile bootstrap failed:', err);
      }
    }
  }
  */

  let events: EventWithMedia[] = [];
  let fetchError = false;

  try {
    console.log('Starting to fetch events with media...');
    events = await fetchEventsWithMedia();
    console.log(`Successfully fetched ${events.length} events`);
  } catch (err) {
    console.error('Failed to fetch events with media:', err);
    fetchError = true;
    // Provide fallback events to prevent complete page failure
    events = [];
  }

  // Determine hero image based on upcoming events
  const today = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  let heroImageUrl = "/images/side_images/chilanka_2025.webp"; // default image
  // Add cache-busting query string to default image so it is never cached
  const defaultHeroImageUrl = `/images/side_images/chilanka_2025.webp?v=${Date.now()}`;

  let nextEvent: EventWithMedia | null = null;
  let mediaFetchError = false;

  if (!fetchError && events && events.length > 0) {
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
  }

  // Fallback: If heroImageUrl is still default, try to fetch a hero image from event media
  if (!heroImageUrl || heroImageUrl === "/images/side_images/chilanka_2025.webp") {
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
        mediaFetchError = true;
      }
    }
    // If still default, use cache-busting version
    if (heroImageUrl === "/images/side_images/chilanka_2025.webp") {
      heroImageUrl = defaultHeroImageUrl;
    }
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageUrl}
            alt="Malayalees US Hero"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Malayalees US
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Connecting Malayalees across the United States through culture, community, and shared heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Explore Events
            </Link>
            <Link
              href="/event"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
              Join Our Community
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="about-content">
              <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Preserving Our Heritage</h2>
              <p className="text-gray-600 mb-6">
                Malayalees US is dedicated to preserving and promoting the rich cultural heritage of Kerala
                across the United States. We bring together Malayalees from all walks of life to celebrate
                our traditions, language, and values.
              </p>
              <p className="text-gray-600 mb-8">
                Through cultural events, educational programs, and community initiatives, we create a strong
                network that supports our community while sharing the beauty of Malayali culture with the
                broader American society.
              </p>
              <Link
                href="/event"
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-block"
              >
                Learn More
              </Link>
            </div>
            <div className="about-image">
              <Image
                src="/images/side_images/kerala_coconut_tree_and_lake.avif"
                alt="Kerala Culture"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="section-title-wrapper mb-10 text-center">
            <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">Events</span>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Upcoming Cultural Events</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join us for exciting cultural events that celebrate our heritage and bring our community together.
            </p>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events scheduled at the moment.</p>
              <p className="text-gray-400 mt-2">Check back soon for upcoming cultural events!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/events"
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="section-title-wrapper mb-10 text-center">
            <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">Services</span>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">What We Offer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cultural Events */}
            <div className="service-item flex gap-6 items-start">
              <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                {/* Calendar Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-yellow-500"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg>
              </div>
              <div className="service-content">
                <h4 className="text-xl font-semibold mb-2">Cultural Events</h4>
                <p>Organize and participate in traditional festivals, music concerts, and cultural celebrations.</p>
              </div>
            </div>
            {/* Language Classes */}
            <div className="service-item flex gap-6 items-start">
              <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                {/* Language Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-blue-500"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM18.92 8h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zM5.08 16h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zM8.03 8L5.08 5.44C6.17 6.76 7.53 7.78 9.01 8.34c-.42.31-.83.65-1.23 1.04C7.27 9.06 6.73 8.03 6.14 7.01 7.27 8.03 8.03 9.27 8.03 10.66c0 1.39-.76 2.63-1.89 3.65.59-1.02 1.13-2.05 1.67-3.08.4.39.81.73 1.23 1.04-1.48.56-2.84 1.58-3.93 2.9L8.03 16c1.39-1.39 2.53-2.53 3.42-3.42.89.89 2.03 2.03 3.42 3.42l-1.67 1.67c-1.09-1.32-2.45-2.34-3.93-2.9.42-.31.83-.65 1.23-1.04.54 1.03 1.08 2.06 1.67 3.08-1.13-1.02-1.89-2.26-1.89-3.65 0-1.39.76-2.63 1.89-3.65-.59 1.02-1.13 2.05-1.67 3.08-.4-.39-.81-.73-1.23-1.04 1.48-.56 2.84-1.58 3.93-2.9L8.03 8z" /></svg>
              </div>
              <div className="service-content">
                <h4 className="text-xl font-semibold mb-2">Language Classes</h4>
                <p>Learn Malayalam through structured classes and cultural immersion programs.</p>
              </div>
            </div>
            {/* Dance & Music */}
            <div className="service-item flex gap-6 items-start">
              <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                {/* Music Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-green-500"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
              </div>
              <div className="service-content">
                <h4 className="text-xl font-semibold mb-2">Dance & Music</h4>
                <p>Master classical dance forms like Kathakali, Mohiniyattam, and traditional music.</p>
              </div>
            </div>
            {/* Art & Craft Workshops */}
            <div className="service-item flex gap-6 items-start">
              <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                {/* Art Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-purple-500"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              </div>
              <div className="service-content">
                <h4 className="text-xl font-semibold mb-2">Art & Craft Workshops</h4>
                <p>Learn traditional Kerala art forms and crafts through hands-on workshops.</p>
              </div>
            </div>
            {/* Kerala Folklore and Tribal Traditions */}
            <div className="service-item flex gap-6 items-start">
              <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                {/* Book Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-blue-500"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
              </div>
              <div className="service-content">
                <h4 className="text-xl font-semibold mb-2">Kerala Folklore and Tribal Traditions</h4>
                <p>Introduce lesser-known folk dances like Theyyam, Padayani, and Poothan Thira.</p>
              </div>
            </div>
            {/* Kerala Cuisine */}
            <div className="service-item flex gap-6 items-start">
              <div className="service-icon w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full">
                {/* Cuisine Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-yellow-500"><path fill="currentColor" d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" /></svg>
              </div>
              <div className="service-content">
                <h4 className="text-xl font-semibold mb-2">Kerala Cuisine Classes</h4>
                <p>Master the art of traditional Kerala cooking with expert chefs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker/Banner Section */}
      <section className="ticker-section bg-yellow-400 text-white py-2 overflow-hidden">
        <div className="ticker flex animate-marquee whitespace-nowrap">
          <div className="ticker-item px-8">Culture is the thread to thrive and ties generations to their roots !</div>
          <div className="ticker-item px-8">Culture is the thread to thrive and ties generations to their roots !</div>
          <div className="ticker-item px-8">Culture is the thread to thrive and ties generations to their roots !</div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-20 bg-white" id="team-section">
        <div className="container mx-auto px-4">
          <div className="section-title-wrapper mb-10 text-center">
            <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">Team</span>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Meet our best volunteers team</h3>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl">
              {/* Team members - use images from public/images/team_members/ */}
              <div className="team-item flex flex-col items-center">
                <TeamImage src="/images/team_members/Manoj_Kizhakkoot.png" name="Manoj Kizhakkoot" />
              </div>
              <div className="team-item flex flex-col items-center">
                <TeamImage src="/images/team_members/srk.png" name="SRK" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section py-20 bg-gray-50" id="contact">
        <div className="container mx-auto px-4">
          <div className="section-title-wrapper mb-10">
            <span className="section-subtitle text-yellow-500 font-semibold mb-2 block">Contact</span>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Get in touch</h3>
          </div>
          <p className="contact-description text-center max-w-2xl mx-auto mb-10 text-gray-600">Connect with us to learn more about our community initiatives and how you can get involved in preserving and promoting Malayali culture across the United States. Join us in fostering cultural exchange and building stronger connections within our diverse communities.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="contact-item">
              <h6 className="text-lg font-semibold mb-2">Location</h6>
              <p>Unite India
                <br />New Jersey, USA</p>
            </div>
            <div className="contact-item">
              <h6 className="text-lg font-semibold mb-2">Phone</h6>
              <p><a href="tel:+16317088442" className="text-blue-600 hover:underline">+1 (631) 708-8442</a></p>
            </div>
            <div className="contact-item">
              <h6 className="text-lg font-semibold mb-2">Social</h6>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=61573944338286" className="social-icon bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-yellow-400" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
              </div>
            </div>
            <div className="contact-item">
              <h6 className="text-lg font-semibold mb-2">Email</h6>
              <p><a href="mailto:Contactus@malyalees.org" className="text-blue-600 hover:underline">Contactus@malyalees.org</a></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

