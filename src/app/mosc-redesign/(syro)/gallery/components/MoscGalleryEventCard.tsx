'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { EventMediaSlideshow } from '@/app/gallery/components/EventMediaSlideshow';
import type { GalleryEventWithMedia } from '@/app/gallery/ApiServerActions';

interface MoscGalleryEventCardProps {
  eventWithMedia: GalleryEventWithMedia;
  gradientIndex?: number;
}

const MOSC_GRADIENTS = [
  'from-amber-100 via-orange-50 to-amber-100',
  'from-stone-100 via-amber-50 to-stone-100',
  'from-yellow-50 via-amber-100 to-yellow-50',
  'from-orange-50 via-stone-100 to-orange-50',
];

function formatEventDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch {
    return 'Date TBD';
  }
}

export function MoscGalleryEventCard({ eventWithMedia, gradientIndex = 0 }: MoscGalleryEventCardProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { event, media, totalMediaCount } = eventWithMedia;

  const heroImage =
    media.find((m) => m.isHomePageHeroImage) ||
    media.find((m) => m.isHeroImage) ||
    media.find((m) => m.fileUrl);

  const gradient = MOSC_GRADIENTS[gradientIndex % MOSC_GRADIENTS.length];
  const hasMedia = media.length > 0;

  return (
    <>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col h-full">
        <div
          className={`relative w-full aspect-[4/3] overflow-hidden bg-gray-50 ${hasMedia ? 'cursor-pointer' : ''}`}
          onClick={() => hasMedia && setShowSlideshow(true)}
          role={hasMedia ? 'button' : undefined}
          tabIndex={hasMedia ? 0 : undefined}
          onKeyDown={(e) => {
            if (hasMedia && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setShowSlideshow(true);
            }
          }}
          aria-label={hasMedia ? 'View gallery' : undefined}
        >
          {heroImage?.fileUrl ? (
            <Image
              src={heroImage.fileUrl}
              alt={heroImage.altText || event.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
              <svg
                className="w-16 h-16 text-syro-red/50 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {totalMediaCount > 0 && (
            <div className="absolute top-3 right-3 bg-[#be1929] px-3 py-1 rounded-full text-xs font-syro-primary font-medium shadow-md text-white">
              {totalMediaCount} {totalMediaCount === 1 ? 'photo' : 'photos'}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <h3 className="font-syro-display font-bold text-sm sm:text-base text-[#be1929] uppercase tracking-wide mb-2 line-clamp-2 group-hover:text-syro-red transition-colors duration-300">
            {event.title}
          </h3>

          <p className="text-sm font-syro-primary text-gray-500 mb-4">{formatEventDate(event.startDate)}</p>

          {event.caption && (
            <p className="text-sm font-syro-primary text-gray-600 mb-4 line-clamp-2">{event.caption}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <button
              type="button"
              onClick={() => setShowSlideshow(true)}
              disabled={!hasMedia}
              className="syro-primary-button inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="View Gallery"
              aria-label="View Gallery"
            >
              View Gallery
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-syro-table-border text-sm font-syro-primary font-semibold text-syro-blue hover:bg-syro-bg-gray/50 transition-colors duration-300"
              title="Event Details"
              aria-label="Event Details"
            >
              Event Details
            </Link>
          </div>
        </div>
      </div>

      {showSlideshow && (
        <EventMediaSlideshow event={event} media={media} onClose={() => setShowSlideshow(false)} />
      )}
    </>
  );
}
