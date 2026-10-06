import type { ReactNode } from 'react';
import Link from 'next/link';
import { MoscHubCardMedia } from './MoscHubCardMedia';

const PLACEHOLDER_IMAGE = '/images/logos/Current_Edits/MOSC-Logo-only.png';

/** Holy Synod listing card shell — shared by CMS hub grids. */
export const MOSC_LISTING_CARD_CLASS =
  'bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden lg:overflow-visible mosc-hub-listing-card--desktop flex flex-col h-full';

export const MOSC_LISTING_GRID_CLASS =
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-4';

const LISTING_FRAME_CLASS =
  'max-w-none md:max-w-[220px] bg-white lg:!max-w-none lg:w-full lg:ring-0 lg:!aspect-auto lg:!h-[330px]';

/** Holy Synod detail sidebar shell. */
export const MOSC_CMS_SIDEBAR_CLASS =
  'bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6 lg:sticky lg:top-4';

export function moscCmsSidebarLinkClass(isActive: boolean): string {
  return isActive
    ? 'block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none'
    : 'block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none';
}

function CtaArrow() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export function cardExcerpt(text: string | null | undefined, max = 280): string {
  if (!text?.trim()) return '';
  const first = text.split('\n\n')[0]?.trim() ?? text.trim();
  return first.length > max ? `${first.slice(0, max - 3)}...` : first;
}

type MoscCmsHubCardProps = {
  href?: string;
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  ctaLabel?: string;
  external?: boolean;
  subtitle?: string | null;
  children?: ReactNode;
  /** Replaces the portrait photo (directory icons, roster placeholders). */
  media?: ReactNode;
  onCtaClick?: () => void;
};

/** Holy Synod portrait listing card. Pass `media` to replace the photo. Omit `href` when the card has no link. */
export function MoscCmsHubCard({
  href,
  title,
  excerpt,
  imageUrl,
  imageAlt,
  ctaLabel = 'Read More',
  external = false,
  subtitle,
  children,
  media,
  onCtaClick,
}: MoscCmsHubCardProps) {
  const src = imageUrl?.trim() ? imageUrl : PLACEHOLDER_IMAGE;
  const body = excerpt?.trim() ?? '';
  const ctaClass = 'syro-primary-button inline-flex items-center gap-2 mt-auto w-fit';
  const cta = (
    <>
      <span>{ctaLabel}</span>
      <CtaArrow />
    </>
  );

  return (
    <div className={MOSC_LISTING_CARD_CLASS}>
      {media ?? (
        <MoscHubCardMedia
          src={src}
          alt={imageAlt ?? title}
          frame="portraitUniform"
          objectPosition="top"
          padded={false}
          outerClassName="lg:-mx-1"
          frameClassName={LISTING_FRAME_CLASS}
          sizes="(max-width: 767px) 100vw, 220px"
          unoptimized={Boolean(src.startsWith('http'))}
        />
      )}
      <div className="mosc-hub-listing-card-body flex flex-col flex-1">
        <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
          {title}
        </h3>
        {subtitle?.trim() ? (
          <p className="font-syro-primary text-sm text-syro-red mb-3 -mt-2">{subtitle}</p>
        ) : null}
        {body ? (
          <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
            {body}
          </p>
        ) : (
          <div className="flex-1 mb-5" />
        )}
        {children}
        {href ? (
          external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className={ctaClass}>
              {cta}
            </a>
          ) : (
            <Link href={href} className={ctaClass}>
              {cta}
            </Link>
          )
        ) : onCtaClick ? (
          <button type="button" onClick={onCtaClick} className={ctaClass}>
            {cta}
          </button>
        ) : null}
      </div>
    </div>
  );
}
