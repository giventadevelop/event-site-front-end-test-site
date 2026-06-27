'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { getOverlayInfo } from '@/lib/heroOverlay';

/**
 * Single featured-event banner shown directly under the hero when:
 * - There is a future event marked as isFeaturedEvent, and
 * - That event has at least one media marked as isFeaturedEventImage.
 * Renders one image (no rotation) with the same "Buy ticket" / "Fundraiser ticket" overlay
 * at bottom-right as the hero section.
 */
const FeaturedEventBannerSection: React.FC = () => {
  const { filteredEvents, isLoading, error } = useFilteredEvents('featured');

  const featured = useMemo(() => {
    if (isLoading || error || !filteredEvents?.length) return null;
    const withEventFlag = filteredEvents.filter(({ event }) => event.isFeaturedEvent === true);
    if (withEventFlag.length === 0) return null;
    const sorted = [...withEventFlag].sort(
      (a, b) => (a.event.featuredEventPriorityRanking ?? 0) - (b.event.featuredEventPriorityRanking ?? 0)
    );
    const { event, media } = sorted[0];
    const imageUrl = media?.fileUrl;
    if (!imageUrl) return null;
    return { event, media, imageUrl };
  }, [filteredEvents, isLoading, error]);

  if (!featured) return null;

  const { event, imageUrl } = featured;
  const overlayInfo = getOverlayInfo(event);

  return (
    <section className="featured-event-banner-section w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative w-full h-auto rounded-2xl overflow-hidden bg-transparent">
          <Link href={`/events/${event.id}`} className="block relative w-full h-auto">
            <Image
              src={imageUrl}
              alt={event.title}
              width={1200}
              height={480}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
              style={{ backgroundColor: 'transparent', borderRadius: '1rem' }}
            />
          </Link>
          {overlayInfo && (
            <div className="hero-ticket-overlay">
              <Link
                href={overlayInfo.href}
                className="block cursor-pointer hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                onClick={(e) => e.stopPropagation()}
                title={overlayInfo.alt}
                aria-label={overlayInfo.alt}
              >
                <img
                  src={overlayInfo.image}
                  alt={overlayInfo.alt}
                  className="object-contain w-[140px] h-[48px] sm:w-[180px] sm:h-[62px] md:w-[200px] md:h-[70px]"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventBannerSection;
