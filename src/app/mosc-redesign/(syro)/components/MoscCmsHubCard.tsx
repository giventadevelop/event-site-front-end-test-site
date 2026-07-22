import React from 'react';
import Link from 'next/link';
import { MoscHubCardMedia } from './MoscHubCardMedia';

const PLACEHOLDER = '/images/logos/Current_Edits/MOSC-Logo-only.png';

export type MoscCmsHubCardProps = {
  href: string;
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string;
};

/** Lectionary / publications-cms style hub card (MoscHubCardMedia + Read More). */
export function MoscCmsHubCard({
  href,
  title,
  excerpt,
  imageUrl,
  imageAlt,
  ctaLabel = 'Read More',
}: MoscCmsHubCardProps) {
  const src = imageUrl?.trim() ? imageUrl : PLACEHOLDER;
  const unoptimized = Boolean(imageUrl?.startsWith('http'));
  const body = excerpt?.trim() ?? '';

  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <MoscHubCardMedia src={src} alt={imageAlt ?? title} unoptimized={unoptimized} />
      <div className="p-8 pt-0 flex flex-col flex-1">
        <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">{title}</h3>
        {body ? (
          <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
            {body}
          </p>
        ) : (
          <div className="flex-1 mb-5" />
        )}
        <Link href={href} className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit">
          <span>{ctaLabel}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export function cardExcerpt(text: string | null | undefined, max = 280): string {
  if (!text?.trim()) return '';
  const firstBlock = text.split('\n\n')[0]?.trim() ?? text.trim();
  return firstBlock.length > max ? `${firstBlock.slice(0, max - 3)}...` : firstBlock;
}
