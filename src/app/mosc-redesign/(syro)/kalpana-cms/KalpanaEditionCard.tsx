'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { KalpanaEdition } from './types';

interface KalpanaEditionCardProps {
  edition: KalpanaEdition;
  defaultCardImage: string;
}

function isInternalHref(link: string): boolean {
  return link.startsWith('/');
}

function formatExternalHref(link: string): string {
  const trimmed = link.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

function resolveEditionHref(edition: KalpanaEdition): string | null {
  const link = edition.externalLink?.trim();
  if (link) return link;
  if (edition.slug) return `/mosc-redesign/kalpana-cms/${edition.slug}`;
  return null;
}

export default function KalpanaEditionCard({ edition, defaultCardImage }: KalpanaEditionCardProps) {
  const cardImageSrc = edition.cardImageUrl ?? defaultCardImage;
  const href = resolveEditionHref(edition);

  const cardContent = (
    <>
      <div className="relative w-28 h-28 mx-auto mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-syro-red/10 group-hover:bg-syro-red/20 transition-all duration-300 p-0">
        <Image
          src={cardImageSrc}
          alt={edition.cardImageAlt ?? edition.title}
          fill
          className="object-cover p-0"
          sizes="112px"
          unoptimized={Boolean(cardImageSrc.startsWith('http'))}
        />
      </div>
      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2 group-hover:text-syro-red transition-all duration-300">
        {edition.title}
      </h3>
      {edition.available ? (
        <span className="syro-read-more-btn font-syro-primary inline-flex items-center gap-2">
          View
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      ) : null}
    </>
  );

  if (edition.available && href) {
    if (isInternalHref(href)) {
      return (
        <Link
          href={href}
          className="group bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 p-6 text-center"
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <Link
        href={formatExternalHref(href)}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 p-6 text-center"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="group bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 p-6 text-center w-full"
      onClick={() => {
        alert(`Kalpana ${edition.year} PDF will be available for download soon.`);
      }}
    >
      {cardContent}
    </button>
  );
}
