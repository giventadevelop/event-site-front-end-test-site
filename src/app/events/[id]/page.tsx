"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventWithMedia, EventMediaDTO, EventDetailsDTO, EventFeaturedPerformersDTO, EventContactsDTO, EventProgramDirectorsDTO, EventSponsorsJoinDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { EventMediaSlideshow } from '@/app/gallery/components/EventMediaSlideshow';
import { Camera, Video, Eye } from 'lucide-react';
import styles from './GalleryThumbnails.module.css';
import cardGridStyles from './CenteredCardGrid.module.css';
import { SponsorCard } from '@/components/sponsors/SponsorCard';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { isDonationBasedEvent, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { isTicketedEventCube } from '@/lib/eventcube/utils';

// Helper function to get initials from a name
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Color palette for cards and placeholders (light versions of design system colors)
const cardColors = [
  { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
  { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
  { bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
  { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
  { bg: 'bg-teal-50', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
  { bg: 'bg-rose-50', border: 'border-rose-200', hover: 'hover:bg-rose-100' },
];

// Array of modern background colors for sponsor cards (matching homepage)
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

// Function to get random background color for each sponsor
const getSponsorBackground = (index: number) => {
  return cardBackgrounds[index % cardBackgrounds.length];
};

// Avatar gradient colors (matching design system with variations)
const avatarGradients = [
  { from: 'from-blue-500', to: 'to-blue-600' },
  { from: 'from-emerald-500', to: 'to-emerald-600' },
  { from: 'from-purple-500', to: 'to-purple-600' },
  { from: 'from-amber-500', to: 'to-amber-600' },
  { from: 'from-pink-500', to: 'to-pink-600' },
  { from: 'from-teal-500', to: 'to-teal-600' },
  { from: 'from-indigo-500', to: 'to-indigo-600' },
  { from: 'from-rose-500', to: 'to-rose-600' },
  { from: 'from-primary', to: 'to-secondary' },
  { from: 'from-accent', to: 'to-primary' },
];

// Button color variants
const buttonColors = [
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white', border: 'border-blue-400' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-white', border: 'border-emerald-400' },
  { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-white', border: 'border-purple-400' },
  { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white', border: 'border-amber-400' },
  { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', text: 'text-white', border: 'border-pink-400' },
  { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-white', border: 'border-teal-400' },
];

// Helper to get consistent color based on index or name hash
function getColorIndex(str: string | number, max: number): number {
  if (typeof str === 'number') return str % max;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
}

// Helper function to create a data URL for placeholder avatar with initials
function createPlaceholderAvatar(name: string, size: number = 64): string {
  const initials = getInitials(name);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#8B7D6B');
  gradient.addColorStop(1, '#A0926B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL();
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params?.id;
  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [featuredPerformers, setFeaturedPerformers] = useState<EventFeaturedPerformersDTO[]>([]);
  const [contacts, setContacts] = useState<EventContactsDTO[]>([]);
  const [programDirectors, setProgramDirectors] = useState<EventProgramDirectorsDTO[]>([]);
  const [sponsors, setSponsors] = useState<EventSponsorsJoinDTO[]>([]);
  const [sponsorBannerImages, setSponsorBannerImages] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowInitialIndex, setSlideshowInitialIndex] = useState(0);
  // Track failed images for placeholder fallback
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  // Focus group filter and options for gallery
  const [eventFocusGroupIdFilter, setEventFocusGroupIdFilter] = useState<number | null>(null);
  const [eventFocusGroupOptions, setEventFocusGroupOptions] = useState<{ id: number; name: string }[]>([]);
  const [focusGroupNameByAssociationId, setFocusGroupNameByAssociationId] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchEventDetails() {
      if (!eventId) return;
      setLoading(true);
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData: EventDetailsDTO = await eventRes.json();
        setEvent(eventData);

        // Fetch event focus groups and focus group names for filter/labels
        try {
          const efgRes = await fetch(`/api/proxy/event-focus-groups?eventId.equals=${eventId}`);
          const efgData = await efgRes.json();
          const eventFocusGroups = Array.isArray(efgData) ? efgData : [efgData];
          const fgRes = await fetch(`/api/proxy/focus-groups?size=500&sort=name,asc`);
          const fgData = await fgRes.json();
          const focusGroups = Array.isArray(fgData) ? fgData : [fgData];
          const byId = new Map<number, { name: string }>();
          focusGroups.forEach((f: { id?: number; name: string }) => { if (f.id != null) byId.set(f.id, { name: f.name }); });
          const names: Record<number, string> = {};
          const options: { id: number; name: string }[] = [];
          eventFocusGroups.forEach((efg: { id?: number; focusGroupId?: number }) => {
            if (efg.id != null && efg.focusGroupId != null) {
              const name = byId.get(efg.focusGroupId)?.name ?? `Focus group ${efg.id}`;
              names[efg.id] = name;
              options.push({ id: efg.id, name });
            }
          });
          setEventFocusGroupOptions(options);
          setFocusGroupNameByAssociationId(names);
        } catch (e) {
          console.warn('Failed to fetch event focus groups:', e);
        }

        // Media is fetched in a separate effect that respects focus group filter
        // Fetch featured performers
        try {
          const performersParams = new URLSearchParams({
            'eventId.equals': eventId.toString(),
            'isActive.equals': 'true'
            // Removed sort parameter to avoid backend parsing errors
          });
          const performersRes = await fetch(`/api/proxy/event-featured-performers?${performersParams.toString()}`);

          if (!performersRes.ok) {
            console.warn('Featured performers fetch failed:', performersRes.status, performersRes.statusText);
            setFeaturedPerformers([]);
          } else {
            const contentType = performersRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const performersData = await performersRes.json();
              setFeaturedPerformers(Array.isArray(performersData) ? performersData : [performersData]);
            } else {
              console.warn('Featured performers response is not JSON:', contentType);
              setFeaturedPerformers([]);
            }
          }
        } catch (err) {
          console.error('Error fetching featured performers:', err);
          setFeaturedPerformers([]);
        }

        // Fetch contacts
        try {
          const contactsParams = new URLSearchParams({
            'eventId.equals': eventId.toString()
          });
          const contactsRes = await fetch(`/api/proxy/event-contacts?${contactsParams.toString()}`);

          if (!contactsRes.ok) {
            console.warn('Contacts fetch failed:', contactsRes.status, contactsRes.statusText);
            setContacts([]);
          } else {
            const contentType = contactsRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const contactsData = await contactsRes.json();
              setContacts(Array.isArray(contactsData) ? contactsData : [contactsData]);
            } else {
              console.warn('Contacts response is not JSON:', contentType);
              setContacts([]);
            }
          }
        } catch (err) {
          console.error('Error fetching contacts:', err);
          setContacts([]);
        }

        // Fetch program directors
        try {
          const directorsParams = new URLSearchParams({
            'eventId.equals': eventId.toString()
          });
          const directorsRes = await fetch(`/api/proxy/event-program-directors?${directorsParams.toString()}`);

          if (!directorsRes.ok) {
            console.warn('Program directors fetch failed:', directorsRes.status, directorsRes.statusText);
            setProgramDirectors([]);
          } else {
            const contentType = directorsRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const directorsData = await directorsRes.json();
              setProgramDirectors(Array.isArray(directorsData) ? directorsData : [directorsData]);
            } else {
              console.warn('Program directors response is not JSON:', contentType);
              setProgramDirectors([]);
            }
          }
        } catch (err) {
          console.error('Error fetching program directors:', err);
          setProgramDirectors([]);
        }

        // Fetch sponsors from event-sponsors-join table
        try {
          const sponsorsRes = await fetch(`/api/proxy/event-sponsors-join/event/${eventId}`);

          if (!sponsorsRes.ok) {
            console.warn('Sponsors fetch failed:', sponsorsRes.status, sponsorsRes.statusText);
            setSponsors([]);
          } else {
            const contentType = sponsorsRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const sponsorsData = await sponsorsRes.json();
              let sponsorsArray = Array.isArray(sponsorsData) ? sponsorsData : [sponsorsData];

              // Populate sponsor details if they're missing (sponsor object might only have ID)
              console.log('🔄 Checking and populating sponsor details...');
              const populatedSponsors = await Promise.all(
                sponsorsArray.map(async (joinRecord: EventSponsorsJoinDTO) => {
                  // Skip if no sponsor reference
                  if (!joinRecord.sponsor) {
                    console.warn('⚠️ Join record missing sponsor reference:', joinRecord.id);
                    return joinRecord;
                  }

                  // Check if sponsor has ID but missing details (like name)
                  if (joinRecord.sponsor.id && !joinRecord.sponsor.name) {
                    console.log('🔍 Fetching sponsor details for ID:', joinRecord.sponsor.id);
                    try {
                      const sponsorDetailsRes = await fetch(`/api/proxy/event-sponsors/${joinRecord.sponsor.id}`, {
                        cache: 'no-store',
                      });

                      if (sponsorDetailsRes.ok) {
                        const sponsorDetails = await sponsorDetailsRes.json();
                        console.log('✅ Fetched sponsor details:', sponsorDetails);
                        return {
                          ...joinRecord,
                          sponsor: sponsorDetails
                        };
                      } else {
                        console.warn('⚠️ Failed to fetch sponsor details for ID:', joinRecord.sponsor.id, sponsorDetailsRes.status);
                        // Return original record even if fetch failed
                        return joinRecord;
                      }
                    } catch (error) {
                      console.warn('⚠️ Error fetching sponsor details:', error);
                      // Return original record even if fetch failed
                      return joinRecord;
                    }
                  } else if (joinRecord.sponsor.name) {
                    // Sponsor details already populated
                    console.log('✅ Sponsor details already populated for:', joinRecord.sponsor.name);
                  }
                  return joinRecord;
                })
              );

              console.log('✅ Populated sponsors:', populatedSponsors);
              setSponsors(populatedSponsors);

              // Fetch banner images for each sponsor from event_media table
              const bannerImageMap = new Map<number, string>();
              await Promise.all(
                populatedSponsors.map(async (joinRecord: EventSponsorsJoinDTO) => {
                  if (!joinRecord.sponsor?.id) return;

                  try {
                    // Build query parameters for banner image lookup
                    const params = new URLSearchParams();
                    params.append('eventId.equals', eventId.toString());
                    params.append('sponsorId.equals', joinRecord.sponsor.id.toString());
                    params.append('eventMediaType.equals', 'SPONSOR_BANNER');

                    // Add eventSponsorsJoinId if available
                    if (joinRecord.id) {
                      params.append('eventSponsorsJoinId.equals', joinRecord.id.toString());
                    }

                    // Sort by priority ranking (ascending - lower = higher priority)
                    params.append('sort', 'priorityRanking,asc');

                    const bannerRes = await fetch(`/api/proxy/event-medias?${params.toString()}`);
                    if (bannerRes.ok) {
                      const bannerData = await bannerRes.json();

                      // Handle paginated response (Spring Data REST format)
                      let bannerMedia: EventMediaDTO[] = [];
                      if (bannerData && typeof bannerData === 'object' && '_embedded' in bannerData && 'eventMedias' in bannerData._embedded) {
                        bannerMedia = Array.isArray(bannerData._embedded.eventMedias) ? bannerData._embedded.eventMedias : [];
                      } else {
                        bannerMedia = Array.isArray(bannerData) ? bannerData : [bannerData];
                      }

                      // Get the first (highest priority) banner image
                      const bannerImage = bannerMedia.find((m: EventMediaDTO) => m.fileUrl);
                      if (bannerImage?.fileUrl) {
                        bannerImageMap.set(joinRecord.sponsor.id, bannerImage.fileUrl);
                        console.log(`✅ Found banner image for sponsor ${joinRecord.sponsor.id}:`, bannerImage.fileUrl);
                      } else {
                        console.log(`⚠️ No banner image found for sponsor ${joinRecord.sponsor.id}`);
                      }
                    }
                  } catch (error) {
                    console.warn(`⚠️ Error fetching banner image for sponsor ${joinRecord.sponsor.id}:`, error);
                  }
                })
              );

              setSponsorBannerImages(bannerImageMap);
            } else {
              console.warn('Sponsors response is not JSON:', contentType);
              setSponsors([]);
            }
          }
        } catch (err) {
          console.error('Error fetching sponsors:', err);
          setSponsors([]);
        }
      } catch (err) {
        setEvent(null);
        setMedia([]);
        setFeaturedPerformers([]);
        setContacts([]);
        setProgramDirectors([]);
        setSponsors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [eventId]);

  // Fetch media (depends on focus group filter)
  useEffect(() => {
    async function fetchMedia() {
      if (!eventId) return;
      const params = new URLSearchParams({
        'eventId.equals': eventId.toString(),
        'isEventManagementOfficialDocument.equals': 'false',
        sort: 'updatedAt,desc',
      });
      if (eventFocusGroupIdFilter != null) {
        params.set('eventFocusGroupId.equals', String(eventFocusGroupIdFilter));
      }
      const mediaRes = await fetch(`/api/proxy/event-medias?${params.toString()}`);
      const mediaData = await mediaRes.json();
      setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);
    }
    fetchMedia();
  }, [eventId, eventFocusGroupIdFilter]);

  if (loading) return <div className="p-8 text-center">Loading event details...</div>;
  if (!event) return <div className="p-8 text-center text-red-500">Event not found.</div>;

  // Find hero image - Prioritize isHomePageHeroImage, then fallback to eventFlyer
  const heroImage = media.find((m) => m.isHomePageHeroImage && m.fileUrl) ||
                    media.find((m) => m.eventFlyer && m.fileUrl) ||
                    media.find((m) => m.fileUrl);
  // Use default hero image if no hero image found (same as events page)
  const heroImageUrl = heroImage?.fileUrl || "/images/default_placeholder_hero_image.jpeg";
  const gallery = media.filter((m) => m.fileUrl && (!heroImage || m.id !== heroImage.id));

  // Get preview images (first 12 media items for grid display)
  const previewMedia = gallery.slice(0, 12);
  const remainingCount = Math.max(0, gallery.length - 12);

  // Helper functions for media type display
  const getMediaTypeIcon = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return <Video className="w-4 h-4" />;
    }
    return <Camera className="w-4 h-4" />;
  };

  const getMediaTypeColor = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

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

  // Helper to format time with AM/PM
  function formatTime(time: string): string {
    if (!time) return '';
    // Accepts 'HH:mm' or 'hh:mm AM/PM' and returns 'hh:mm AM/PM'
    if (time.match(/AM|PM/i)) return time;
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute || '00'} ${ampm}`;
  }

  // Helper to format date
  function formatDate(dateString: string, timezone: string = 'America/New_York'): string {
    if (!dateString) return '';
    // Use formatInTimeZone to display the date in the event's timezone
    return formatInTimeZone(dateString, timezone, 'EEEE, MMMM d, yyyy');
  }

  const isUpcoming = (() => {
    const today = new Date();
    const eventDate = event.startDate ? new Date(event.startDate) : null;
    return eventDate && eventDate >= today;
  })();

  const calendarLink = (() => {
    if (!isUpcoming) return '';
    const start = toGoogleCalendarDate(event.startDate, event.startTime);
    const end = toGoogleCalendarDate(event.endDate, event.endTime);
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  })();

  // Get background color for event card (matching events page)
  const getRandomBackground = (eventId: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-blue-100',
      'bg-gradient-to-br from-green-50 to-green-100',
      'bg-gradient-to-br from-purple-50 to-purple-100',
      'bg-gradient-to-br from-pink-50 to-pink-100',
      'bg-gradient-to-br from-yellow-50 to-yellow-100',
      'bg-gradient-to-br from-indigo-50 to-indigo-100',
      'bg-gradient-to-br from-red-50 to-red-100',
      'bg-gradient-to-br from-teal-50 to-teal-100',
      'bg-gradient-to-br from-cyan-50 to-cyan-100',
      'bg-gradient-to-br from-rose-50 to-rose-100'
    ];
    return colors[eventId % colors.length];
  };

  return (
    <div>
      {/* Hero Section - Full width, no side image */}
      <section className="relative w-full bg-transparent" style={{ marginTop: '100px', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="w-full relative">
          {/* Main hero image container - Full image display with max height constraint */}
          <div className="relative w-full flex items-center justify-center" style={{ maxWidth: '100%', minHeight: '200px' }}>
            {/* Blurred background image for width fill - positioned behind main image */}
            <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <Image
                src={heroImageUrl}
                alt="Hero blurred background"
                fill
                className="object-cover w-full h-full blur-lg scale-105"
                style={{
                  filter: 'blur(24px) brightness(1.1)',
                  objectPosition: 'center',
                }}
                aria-hidden="true"
                priority
              />
            </div>

            {/* Main hero image - Full image display with max height constraint */}
            <div className="relative w-full flex items-center justify-center" style={{ zIndex: 1, maxWidth: '100%' }}>
              <Image
                src={heroImageUrl}
                alt="Event Hero"
                width={1920}
                height={1900}
                className="w-full h-auto"
                style={{
                  maxHeight: '1900px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                }}
                priority
              />
            </div>

            {/* Fade overlays for top and bottom borders */}
            <div className="pointer-events-none absolute left-0 top-0 w-full h-16" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
            <div className="pointer-events-none absolute left-0 bottom-0 w-full h-16" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
          </div>
        </div>
      </section>

      {/* Event Details - Styled like events page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`${getRandomBackground(event.id!)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Content Section - Styled like events page */}
            <div className="p-6 border-t border-white/20 relative">
              {/* Action Buttons - Register Here and Buy Tickets - Top Right Corner */}
              {(() => {
                if (!event.startDate) return null;

                // Get today's date in YYYY-MM-DD format using local timezone
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                // Compare dates as strings to avoid timezone parsing issues
                const eventDateStr = event.startDate ? event.startDate.split('T')[0] : null;

                if (!eventDateStr) return null;

                // Check if event date is today or in the future
                const isToday = eventDateStr === todayStr;
                const isFuture = eventDateStr > todayStr;
                const isUpcomingLocal = isToday || isFuture;
                const isPast = !isUpcomingLocal;

                // Determine which buttons to show
                const showRegisterButton = event.isRegistrationRequired === true && isUpcomingLocal;
                // Event Cube ticketed: link to eventcube-checkout (priority over Givebutter)
                const isTicketedEventCubeEvent = isTicketedEventCube(event) && isUpcomingLocal;
                // Check if event is ticketed fundraiser/charity (shows special fundraiser image)
                const isTicketedFundraiser = isTicketedFundraiserEvent(event) && isUpcomingLocal;
                // Only show Buy Tickets button for TICKETED events (case-insensitive check)
                // BUT NOT if Event Cube or ticketed fundraiser (use their dedicated links instead)
                const showBuyTicketsButton = event.admissionType?.toUpperCase() === 'TICKETED' && isUpcomingLocal && !isTicketedFundraiser && !isTicketedEventCubeEvent;
                // Show Make a Donation button for donation-based events
                // BUT NOT if it's a ticketed fundraiser (use fundraiser image instead)
                const showDonationButton = isDonationBasedEvent(event) && isUpcomingLocal && !isTicketedFundraiser;
                const showCompetitionLinks = event.isCompetitionEvent === true;

                // Don't render if no buttons should be shown
                if (
                  !showRegisterButton &&
                  !showBuyTicketsButton &&
                  !showDonationButton &&
                  !isTicketedFundraiser &&
                  !isTicketedEventCubeEvent &&
                  !showCompetitionLinks
                )
                  return null;

                return (
                  <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 flex flex-col gap-2">
                    {/* Register Here Button - Show if registration is required */}
                    {showRegisterButton && (
                      <Link
                        href={`/events/${event.id}/register`}
                        className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title="Register Here"
                        aria-label="Register Here"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-blue-700">Register Here</span>
                      </Link>
                    )}

                    {/* Event Cube: Buy Tickets → eventcube-checkout */}
                    {isTicketedEventCubeEvent && (
                    <Link
                      href={`/events/${event.id}/eventcube-checkout`}
                      className={`transition-transform hover:scale-105 ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Buy Tickets"
                      aria-label="Buy Tickets"
                    >
                      <img
                        alt="Buy Tickets"
                        className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                        src="/images/buy_tickets_click_here_red.webp"
                      />
                    </Link>
                    )}

                    {/* Fundraiser Image - Show for ticketed fundraiser/charity events (replaces both Buy Tickets and Make a Donation buttons) */}
                    {isTicketedFundraiser && (
                    <Link
                      href={`/events/${event.id}/givebutter-checkout`}
                      className={`transition-transform hover:scale-105 ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Buy Tickets"
                      aria-label="Buy Tickets"
                    >
                      <img
                        alt="Buy Tickets"
                        className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                        src="/images/buy_tickets_click_here_fundraiser.png"
                      />
                    </Link>
                    )}

                    {/* Buy Tickets Image - Show only for TICKETED events (not fundraiser) */}
                    {showBuyTicketsButton && (
                    <Link
                      href={`/events/${event.id}/tickets`}
                      className={`transition-transform hover:scale-105 ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Buy Tickets"
                      aria-label="Buy Tickets"
                    >
                      <img
                        alt="Buy Tickets"
                        className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                        src="/images/buy_tickets_click_here_red.webp"
                      />
                    </Link>
                    )}

                    {/* Make a Donation Button - Show for donation-based events (not ticketed fundraiser) */}
                    {showDonationButton && (
                      <Link
                        href={`/events/${event.id}/donation`}
                        className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title="Make a Donation"
                        aria-label="Make a Donation"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-teal-700">Make a Donation</span>
                      </Link>
                    )}

                    {showCompetitionLinks && (
                      <Link
                        href={`/events/${event.id}/competitions`}
                        className="flex-shrink-0 h-14 rounded-xl bg-rose-100 hover:bg-rose-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title="Competitions"
                        aria-label="Competitions"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-rose-700">Competitions</span>
                      </Link>
                    )}
                  </div>
                );
              })()}

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:pr-48 lg:pr-56">
                {event.title}
              </h1>

              {/* Caption */}
              {event.caption && (
                <p className="text-gray-600 text-lg mb-4 sm:pr-48 lg:pr-56">
                  {event.caption}
                </p>
              )}

              {/* Event Details - Centered flexbox layout */}
              <div className="flex flex-wrap justify-center gap-3 mb-6 lg:max-w-4xl lg:mx-auto">
                <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatDate(event.startDate || '', event.timezone || 'America/New_York')}
                  </span>
                </div>
                {event.startTime && event.endTime && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)} (EDT)
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {event.location}
                    </span>
                    {/* Copy and Navigate Icons */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(event.location || '');
                          alert('Address copied to clipboard!');
                        }}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                        title="Copy Address"
                      >
                        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                        title="Open in Google Maps"
                      >
                        <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-10 lg:max-w-4xl lg:mx-auto px-3">
                  <div className="relative rounded-3xl border border-white/70 bg-gradient-to-br from-sky-100 via-white to-sky-50 shadow-[0_22px_45px_-25px_rgba(15,23,42,0.35)] px-8 sm:px-12 py-10 text-center">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 40%, rgba(135,206,250,0.15) 100%)'
                    }}/>
                    <div className="relative z-10 text-left">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253l1.706 1.025a3.5 3.5 0 001.733.463h2.944a1.5 1.5 0 011.5 1.5V18a2 2 0 01-2 2H6.117a2 2 0 01-2-2V6.75a1.5 1.5 0 011.5-1.5h2.944a3.5 3.5 0 001.733-.463L12 3l1.706 1.788" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-heading text-[1.25rem] sm:text-[1.35rem] text-sky-900 font-semibold">
                            Event Overview
                          </h3>
                          <p className="text-sm text-sky-700/80">
                            A glimpse into the experience awaiting you at this gathering
                          </p>
                        </div>
                      </div>
                      {event.description.split(/\n{2,}|\r\n\r\n/).map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="font-heading text-[1.1rem] sm:text-[1.2rem] text-slate-700 leading-relaxed tracking-[0.01em] mb-4 last:mb-0"
                        >
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Directions to Venue */}
              {event.directionsToVenue && event.directionsToVenue.trim().length > 0 && (
                <div className="mb-10 lg:max-w-4xl lg:mx-auto px-3">
                  <div className="relative rounded-3xl border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 shadow-[0_22px_45px_-25px_rgba(15,23,42,0.35)] px-8 sm:px-12 py-10 text-center">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(214,247,234,0.25) 45%, rgba(58,162,125,0.2) 100%)'
                    }}/>
                    <div className="relative z-10 text-left">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5 2.22 5 4.958 0 2.089-1.27 4.99-3.76 8.695a1.25 1.25 0 01-2.08 0C8.67 12.948 7 10.047 7 7.958 7 5.22 9.245 3 12 3z" />
                            <circle cx="12" cy="8" r="1.8" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-heading text-[1.2rem] sm:text-[1.3rem] text-emerald-900 font-semibold">
                            Directions to the Venue
                          </h3>
                          <p className="text-sm text-emerald-700/80">
                            Helpful guidance to reach the celebration space
                          </p>
                        </div>
                      </div>
                      {event.directionsToVenue
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0)
                        .map((line, idx) => (
                          <p
                            key={idx}
                            className="font-heading text-[1.05rem] sm:text-[1.15rem] text-emerald-900 leading-relaxed tracking-[0.01em] mb-4 last:mb-0"
                          >
                            {line}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information Section */}
              {contacts.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    Contact Information
                  </h2>
                  <div className={`${cardGridStyles.centeredCardGrid} items-stretch`}>
                    {contacts.map((contact, index) => {
                      const gradientBackground = cardBackgrounds[getColorIndex(contact.id || contact.name || index, cardBackgrounds.length)];
                      return (
                      <div
                        key={contact.id}
                        className={`${cardGridStyles.cardItem} ${gradientBackground} group relative overflow-hidden rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full`}
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 bg-white/25 group-hover:opacity-100" />
                        <div className="relative z-10 flex flex-col h-full pl-3">
                          <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 shadow-sm">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10c0 6-9 13-9 13S3 16 3 10a8 8 0 1 1 16 0z" />
                              </svg>
                            </span>
                            {contact.name}
                          </h3>
                          <div className="space-y-4 text-sm text-gray-700">
                            {contact.phone && (
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shadow-sm">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 0 1 2-2h1.11a2 2 0 0 1 1.94 1.515l.72 2.878a2 2 0 0 1-.43 1.807l-.97 1.09a16 16 0 0 0 6.069 6.069l1.09-.97a2 2 0 0 1 1.807-.43l2.878.72A2 2 0 0 1 21 18.89V20a2 2 0 0 1-2 2h-.75C11.44 22 5 15.56 5 7.75V7a2 2 0 0 1 2-2h.25" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Phone</p>
                                  <a href={`tel:${contact.phone}`} className="text-base font-semibold text-emerald-700 hover:text-emerald-900 transition-colors duration-200">
                                    {contact.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-sky-100/90 text-sky-700 flex items-center justify-center shadow-sm">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 0 0 1.98 0L21 8m-2 8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Email</p>
                                  <a href={`mailto:${contact.email}`} className="text-base font-semibold text-sky-700 hover:text-sky-900 transition-colors duration-200">
                                    {contact.email}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/50 grid grid-cols-2 gap-3 text-center">
                          {contact.phone && (
                              <a href={`tel:${contact.phone}`} className="inline-flex items-center justify-center gap-2 bg-white/70 text-emerald-700 font-semibold py-2 rounded-xl shadow-sm hover:bg-white transition-colors duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 0 1 2-2h1.11a2 2 0 0 1 1.94 1.515l.72 2.878a2 2 0 0 1-.43 1.807l-.97 1.09a16 16 0 0 0 6.069 6.069l1.09-.97a2 2 0 0 1 1.807-.43l2.878.72A2 2 0 0 1 21 18.89V20a2 2 0 0 1-2 2h-.75C11.44 22 5 15.56 5 7.75V7a2 2 0 0 1 2-2h.25" />
                                </svg>
                                Call
                              </a>
                          )}
                          {contact.email && (
                              <a href={`mailto:${contact.email}`} className="inline-flex items-center justify-center gap-2 bg-white/70 text-sky-700 font-semibold py-2 rounded-xl shadow-sm hover:bg-white transition-colors duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 0 0 1.98 0L21 8m-2 8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8" />
                                </svg>
                                Email
                              </a>
                          )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Featured Performers Section */}
              {featuredPerformers.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    Featured Guests
                  </h2>
                  <div className={`${cardGridStyles.centeredCardGrid} items-stretch`}>
                    {featuredPerformers.map((performer, index) => {
                      const colorIndex = getColorIndex(performer.id || performer.name || index, cardColors.length);
                      const cardColor = cardColors[colorIndex];
                      const gradientBackground = cardBackgrounds[getColorIndex(performer.id || performer.name || index, cardBackgrounds.length)];
                      const avatarGradient = avatarGradients[getColorIndex(performer.id || performer.name || index, avatarGradients.length)];
                      return (
                      <div
                        key={performer.id}
                        className={`${cardGridStyles.cardItem} ${gradientBackground} group relative overflow-hidden rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full`}
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/30" />
                        <div className="flex items-start gap-4">
                          <div className={`relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden ring-4 ring-white/70 shadow-xl bg-gradient-to-br ${avatarGradient.from} ${avatarGradient.to}`}>
                            {performer.portraitImageUrl && !failedImages.has(`performer-${performer.id}`) ? (
                              <Image
                                src={performer.portraitImageUrl}
                                alt={performer.name}
                                fill
                                className="object-cover"
                                onError={() => {
                                  // Mark this image as failed
                                  setFailedImages(prev => new Set(prev).add(`performer-${performer.id}`));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {getInitials(performer.name || 'Guest')}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col h-full">
                            <h3 className="font-heading font-semibold text-gray-900 text-xl mb-2 tracking-tight">
                              {performer.name}
                              {performer.isHeadliner && (
                                <span className="ml-3 inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full shadow-sm">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 14.77l-4.78 2.53.91-5.32L2.27 7.62l5.34-.78L10 2z" />
                                  </svg>
                                  Headliner
                                </span>
                              )}
                            </h3>
                            {performer.stageName && (
                              <p className="text-sm text-gray-600 font-medium mb-1">Stage Name: <span className="font-semibold text-gray-800">{performer.stageName}</span></p>
                            )}
                            {performer.role && (
                              <p className="text-sm text-gray-600 font-medium mb-1">Role: <span className="font-semibold text-gray-800">{performer.role}</span></p>
                            )}
                            {performer.bio && (
                              <p className="text-sm text-gray-700 leading-relaxed mt-2" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>{performer.bio}</p>
                            )}
                            {/* Social Links - only show icons when URL is non-null and non-empty */}
                            {(performer.websiteUrl?.trim() || performer.facebookUrl?.trim() || performer.instagramUrl?.trim() || performer.twitterUrl?.trim() || performer.linkedinUrl?.trim() || performer.youtubeUrl?.trim() || performer.tiktokUrl?.trim()) && (
                              <div className="flex gap-2 pt-4 mt-auto border-t border-white/50">
                                {performer.websiteUrl?.trim() && (
                                  <a
                                    href={performer.websiteUrl!.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="Website"
                                  >
                                    <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                                    </svg>
                                  </a>
                                )}
                                {performer.facebookUrl?.trim() && (
                                  <a
                                    href={performer.facebookUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-blue-700 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="Facebook"
                                  >
                                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                  </a>
                                )}
                                {performer.instagramUrl?.trim() && (
                                  <a
                                    href={performer.instagramUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-pink-600 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="Instagram"
                                  >
                                    <InstagramIcon className="w-5 h-5 text-pink-700" />
                                  </a>
                                )}
                                {performer.youtubeUrl?.trim() && (
                                  <a
                                    href={performer.youtubeUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-red-600 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="YouTube"
                                  >
                                    <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                  </a>
                                )}
                                {performer.twitterUrl?.trim() && (
                                  <a
                                    href={performer.twitterUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-sky-600 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="X (Twitter)"
                                  >
                                    <svg className="w-5 h-5 text-sky-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                  </a>
                                )}
                                {performer.linkedinUrl?.trim() && (
                                  <a
                                    href={performer.linkedinUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-blue-700 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="LinkedIn"
                                  >
                                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                  </a>
                                )}
                                {performer.tiktokUrl?.trim() && (
                                  <a
                                    href={performer.tiktokUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/70 text-gray-800 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                    title="TikTok"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Program Directors Section */}
              {programDirectors.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Program Directors
                  </h2>
                  <div className="flex flex-col gap-3">
                    {programDirectors.map((director, index) => {
                      const gradientBackground = cardBackgrounds[getColorIndex(director.id || director.name || index, cardBackgrounds.length)];
                      const avatarGradient = avatarGradients[getColorIndex(director.id || director.name || index, avatarGradients.length)];
                      return (
                      <div
                        key={director.id}
                        className={`${gradientBackground} group relative overflow-hidden rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col w-full h-full`}
                        style={{ minHeight: '200px' }}
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 bg-white/25 group-hover:opacity-100" />
                        <div className="relative z-10 p-4 flex flex-col h-full">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden ring-4 ring-white/70 shadow-xl bg-gradient-to-br ${avatarGradient.from} ${avatarGradient.to}`}>
                              {director.photoUrl && !failedImages.has(`director-${director.id}`) ? (
                                <Image
                                  src={director.photoUrl}
                                  alt={director.name}
                                  fill
                                  className="object-cover"
                                  onError={() => {
                                    // Mark this image as failed
                                    setFailedImages(prev => new Set(prev).add(`director-${director.id}`));
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                  {getInitials(director.name || 'Director')}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col h-full">
                              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                                {director.name}
                              </h3>
                              {director.bio ? (
                                <div className="flex-1 flex flex-col min-h-0">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
                                    {director.bio}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex-1"></div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-white/50 text-xs uppercase tracking-wide text-gray-600">
                                <span className="inline-flex items-center gap-1 bg-white/70 text-gray-700 px-3 py-1 rounded-full">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                                  </svg>
                                  Program Director
                                </span>
                                {director.role && (
                                  <span className="inline-flex items-center gap-1 bg-white/70 text-gray-700 px-3 py-1 rounded-full">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m-7.5-7.5h15" />
                                    </svg>
                                    {director.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Calendar Link - Only for upcoming events */}
                {isUpcoming && calendarLink && (
                  <a
                    href={calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="Add to Calendar"
                    aria-label="Add to Calendar"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-orange-700">Add to Calendar</span>
                  </a>
                )}

                {/* Buy Tickets / Fundraiser Image - Same link (givebutter-checkout) for fundraiser events */}
                {(() => {
                  if (!event.startDate) return null;

                  // Get today's date in YYYY-MM-DD format using local timezone
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                  // Compare dates as strings to avoid timezone parsing issues
                  const eventDateStr = event.startDate ? event.startDate.split('T')[0] : null;

                  if (!eventDateStr) return null;

                  // Check if event date is today or in the future
                  const isToday = eventDateStr === todayStr;
                  const isFuture = eventDateStr > todayStr;
                  const isUpcomingLocal = isToday || isFuture;

                  // Event Cube ticketed: link to eventcube-checkout (priority over Givebutter)
                  const isTicketedEventCubeEvent = isTicketedEventCube(event) && isUpcomingLocal;
                  // Ticketed fundraiser: both Buy Tickets (center) and Fundraiser badge (top right) point to givebutter-checkout
                  const isTicketedFundraiser = isTicketedFundraiserEvent(event) && isUpcomingLocal;
                  // Only show red Buy Tickets for TICKETED events that are NOT Event Cube or ticketed fundraiser
                  const showBuyTicketsButton = event.admissionType?.toUpperCase() === 'TICKETED' && isUpcomingLocal && !isTicketedFundraiser && !isTicketedEventCubeEvent;
                  // Show Make a Donation for donation-based events that are NOT ticketed fundraiser
                  const showDonationButton = isDonationBasedEvent(event) && isUpcomingLocal && !isTicketedFundraiser;

                  if (!showBuyTicketsButton && !showDonationButton && !isTicketedFundraiser && !isTicketedEventCubeEvent) return null;

                  return (
                    <div className="flex flex-col gap-2">
                      {/* Event Cube: Buy Tickets → eventcube-checkout (red image) */}
                      {isTicketedEventCubeEvent && (
                        <Link
                          href={`/events/${event.id}/eventcube-checkout`}
                          className="transition-transform hover:scale-105"
                          title="Buy Tickets"
                          aria-label="Buy Tickets"
                        >
                          <img
                            alt="Buy Tickets"
                            className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                            src="/images/buy_tickets_click_here_red.webp"
                          />
                        </Link>
                      )}
                      {/* Fundraiser: same image and URL as top-right badge → givebutter-checkout */}
                      {isTicketedFundraiser && (
                        <Link
                          href={`/events/${event.id}/givebutter-checkout`}
                          className="transition-transform hover:scale-105"
                          title="Buy Tickets"
                          aria-label="Buy Tickets"
                        >
                          <img
                            alt="Buy Tickets"
                            className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                            src="/images/buy_tickets_click_here_fundraiser.png"
                          />
                        </Link>
                      )}
                      {showBuyTicketsButton && (
                        <Link
                          href={`/events/${event.id}/tickets`}
                          className="transition-transform hover:scale-105"
                          title="Buy Tickets"
                          aria-label="Buy Tickets"
                        >
                          <img
                            alt="Buy Tickets"
                            className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                            src="/images/buy_tickets_click_here_red.webp"
                          />
                        </Link>
                      )}
                      {showDonationButton && (
                        <Link
                          href={`/events/${event.id}/donation`}
                          className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                          title="Make a Donation"
                          aria-label="Make a Donation"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-teal-700">Make a Donation</span>
                        </Link>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Section - Matching homepage style */}
        {sponsors.length > 0 && (() => {
          // Sort sponsors by priority ranking (lower value = higher priority)
          // If priorityRanking is not set, treat it as lowest priority (sort to end)
          const sortedSponsors = [...sponsors].sort((a, b) => {
            const aPriority = a.sponsor?.priorityRanking ?? 999999;
            const bPriority = b.sponsor?.priorityRanking ?? 999999;
            return aPriority - bPriority; // Ascending order (lower = higher priority)
          });

          // Limit to maximum 12 sponsors
          const displayedSponsors = sortedSponsors.slice(0, 12);
          const hasMoreSponsors = sortedSponsors.length > 12;

          return (
            <div className="mb-8 mt-8">
              <div className={`${getRandomBackground(event.id!)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Our Sponsors
                  </h2>

                  {/* Sponsors List - Single column layout matching homepage */}
                  <div className="space-y-8 mb-8">
                    {displayedSponsors.map((sponsorJoin, index) => {
                      const sponsor = sponsorJoin.sponsor;
                      if (!sponsor) return null;
                      return (
                        <SponsorCard
                          key={sponsorJoin.id ?? `${sponsor.name ?? 'sponsor'}-${index}`}
                          sponsor={{
                            ...sponsor,
                            bannerImageUrl:
                              (sponsor.id && sponsorBannerImages.get(sponsor.id)) ||
                              sponsor.bannerImageUrl,
                          }}
                          backgroundClass={getSponsorBackground(index)}
                          onCardClick={() =>
                            sponsor.websiteUrl && window.open(sponsor.websiteUrl, '_blank')
                          }
                        />
                      );
                    })}
                  </div>

                  {/* See All Sponsors Button - Only show if there are more than 12 */}
                  {hasMoreSponsors && (
                    <div className="text-center">
                      <Link
                        href={`/events/${event.id}#sponsors`}
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span>See All Sponsors</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        {/* Gallery Section - Styled like gallery page */}
        {gallery.length > 0 && (
          <div className="mb-12 mt-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 border border-white/10 shadow-2xl">
              <div className="absolute inset-0 pointer-events-none opacity-70" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 55%)' }} />
              <div className="relative px-6 py-10 sm:px-10 lg:px-14">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-white mb-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Camera className="w-8 h-8 text-purple-200" />
                      <h2 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight">Event Gallery</h2>
                    </div>
                    <p className="text-lg text-purple-100 max-w-2xl">
                      {gallery.length} {gallery.length === 1 ? 'moment captured from this celebration.' : 'moments captured from this celebration.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {eventFocusGroupOptions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <label htmlFor="gallery-focus-group" className="text-sm font-medium text-purple-100 whitespace-nowrap">
                          Focus group
                        </label>
                        <select
                          id="gallery-focus-group"
                          value={eventFocusGroupIdFilter ?? ''}
                          onChange={(e) => setEventFocusGroupIdFilter(e.target.value === '' ? null : Number(e.target.value))}
                          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                        >
                          <option value="">All focus groups</option>
                          {eventFocusGroupOptions.map((opt) => (
                            <option key={opt.id} value={opt.id} className="text-gray-900">{opt.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSlideshowInitialIndex(0);
                        setShowSlideshow(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Eye className="w-5 h-5" />
                      View Full Gallery
                    </button>
                  </div>
                </div>

                {/* Preview thumbnails grid - Centered like TeamSection */}
                {previewMedia.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-inner">
                    <div className={styles.galleryThumbnailsGrid}>
                          {previewMedia.map((mediaItem) => (
                        <button
                          key={mediaItem.id}
                          onClick={() => {
                            const galleryIndex = gallery.findIndex(m => m.id === mediaItem.id);
                            if (galleryIndex !== -1) {
                              setSlideshowInitialIndex(galleryIndex);
                              setShowSlideshow(true);
                            }
                          }}
                          className={`${styles.galleryThumbnail} relative overflow-hidden cursor-pointer group`}
                        >
                          {mediaItem.fileUrl ? (
                            <Image
                              src={mediaItem.fileUrl}
                              alt={mediaItem.altText || mediaItem.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 200px, 160px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-white/60">
                              {getMediaTypeIcon(mediaItem.eventMediaType)}
                            </div>
                          )}
                          {(() => {
                            const fgId = (mediaItem as { event_focus_group_id?: number | null }).event_focus_group_id ?? mediaItem.eventFocusGroupId;
                            return fgId != null && focusGroupNameByAssociationId[fgId] ? (
                              <span className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white bg-black/50 rounded px-2 py-1 truncate">
                                {focusGroupNameByAssociationId[fgId]}
                              </span>
                            ) : null;
                          })()}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                      ))}

                      {/* Show remaining count */}
                      {remainingCount > 0 && (
                        <button
                          onClick={() => {
                            setSlideshowInitialIndex(previewMedia.length);
                            setShowSlideshow(true);
                          }}
                          className={`${styles.galleryThumbnail} flex items-center justify-center bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors`}
                        >
                          +{remainingCount} more
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slideshow Modal - Using gallery page component */}
        {showSlideshow && event && (
          <EventMediaSlideshow
            event={event}
            media={gallery}
            onClose={() => setShowSlideshow(false)}
            initialIndex={slideshowInitialIndex}
          />
        )}
        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="inline-flex flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="View All Events"
            aria-label="View All Events"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">View All Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
