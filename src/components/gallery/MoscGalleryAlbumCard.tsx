'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatGalleryAlbumEventDate } from '@/lib/gallery/formatGalleryAlbumEventDate';

export interface MoscGalleryAlbumCardProps {
  title: string;
  coverImageUrl?: string | null;
  totalMediaCount: number;
  categoryDisplayName?: string | null;
  albumYear?: number | null;
  eventDateStart?: string | null;
  eventDateEnd?: string | null;
  eventLocation?: string | null;
  /** Static-only fallback when API event fields are not yet backfilled */
  eventDateDisplay?: string | null;
  description?: string | null;
  href?: string;
  onViewAlbum?: () => void;
  viewDisabled?: boolean;
  variant?: 'mosc-redesign' | 'main-gallery';
  /** MOSC static fallback: decorative gradient index */
  gradientIndex?: number;
}

const MOSC_GRADIENTS = [
  'from-amber-100 via-orange-50 to-amber-100',
  'from-stone-100 via-amber-50 to-stone-100',
  'from-yellow-50 via-amber-100 to-yellow-50',
  'from-orange-50 via-stone-100 to-orange-50',
];

function ViewAlbumCta({
  variant,
  onViewAlbum,
  disabled,
}: {
  variant: 'mosc-redesign' | 'main-gallery';
  onViewAlbum?: () => void;
  disabled?: boolean;
}) {
  if (variant === 'mosc-redesign') {
    if (onViewAlbum) {
      return (
        <button
          type="button"
          onClick={onViewAlbum}
          disabled={disabled}
          className="syro-primary-button inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="View Album"
          aria-label="View Album"
        >
          View Album
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
    }
    return (
      <span className="syro-primary-button inline-flex items-center gap-2">
        View Album
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    );
  }

  return (
    <button
      onClick={onViewAlbum}
      disabled={disabled}
      className="flex-shrink-0 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      title="View Album"
      aria-label="View Album"
      type="button"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <span className="font-semibold text-blue-700">View Album</span>
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export function MoscGalleryAlbumCard({
  title,
  coverImageUrl,
  totalMediaCount,
  categoryDisplayName,
  albumYear,
  eventDateStart,
  eventDateEnd,
  eventLocation,
  eventDateDisplay,
  description,
  href,
  onViewAlbum,
  viewDisabled = false,
  variant = 'mosc-redesign',
  gradientIndex = 0,
}: MoscGalleryAlbumCardProps) {
  const isMosc = variant === 'mosc-redesign';
  const eventDateLine = formatGalleryAlbumEventDate({
    eventDateStart,
    eventDateEnd,
    eventLocation,
    albumYear,
    eventDateDisplay,
  });
  const badgeClass = isMosc
    ? 'absolute top-3 right-3 bg-[#be1929] px-3 py-1 rounded-full text-xs font-syro-primary font-medium shadow-md text-white'
    : 'absolute top-3 right-3 bg-violet-600 px-3 py-1 rounded-full text-xs font-medium shadow-md text-white';

  const cardOuterClass = isMosc
    ? 'group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col h-full'
    : 'group homepage-glass-card services-glass-card-face rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-all duration-300';

  const bodyPadding = isMosc ? 'p-5 sm:p-6' : 'p-6 sm:p-8';
  const titleClass = isMosc
    ? 'font-syro-display font-bold text-sm sm:text-base text-[#be1929] uppercase tracking-wide mb-2 line-clamp-2 group-hover:text-syro-red transition-colors duration-300'
    : 'font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-violet-700 transition-all duration-300';

  const gradient = MOSC_GRADIENTS[gradientIndex % MOSC_GRADIENTS.length];

  const cardContent = (
    <>
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isMosc ? `bg-gradient-to-br ${gradient}` : 'bg-gradient-to-br from-violet-100/80 via-purple-50/60 to-violet-100/80'}`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className={`w-32 h-32 ${isMosc ? 'text-syro-red' : 'text-violet-600'}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 2h4v7h7v4h-7v9h-4v-9H3v-4h7V2z" />
              </svg>
            </div>
            <svg className={`w-16 h-16 relative z-10 ${isMosc ? 'text-syro-red/50' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {totalMediaCount > 0 && (
          <div className={badgeClass}>
            {totalMediaCount} {totalMediaCount === 1 ? 'photo' : 'photos'}
          </div>
        )}
      </div>

      <div className={`${bodyPadding} flex flex-col flex-1`}>
        {categoryDisplayName && (
          <div className="mb-2.5">
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isMosc ? 'bg-[#fce4ec] text-[#be1929] font-syro-primary' : 'bg-violet-100 text-violet-700'}`}>
              {categoryDisplayName}
            </span>
          </div>
        )}

        <h3 className={titleClass}>{title}</h3>

        {eventDateLine && (
          <p className={`text-sm mb-4 ${isMosc ? 'font-syro-primary text-gray-500' : 'text-gray-600'}`}>
            {eventDateLine}
          </p>
        )}

        {!isMosc && description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center mt-auto">
          <ViewAlbumCta variant={variant} onViewAlbum={onViewAlbum} disabled={viewDisabled} />
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardOuterClass} style={isMosc ? undefined : { padding: 0 }}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardOuterClass} style={isMosc ? undefined : { padding: 0 }}>
      {cardContent}
    </div>
  );
}
