'use client';

import { MoscCmsHubCard } from '../components/MoscCmsHubCard';
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

  if (edition.available && href) {
    return (
      <MoscCmsHubCard
        href={isInternalHref(href) ? href : formatExternalHref(href)}
        external={!isInternalHref(href)}
        title={edition.title}
        imageUrl={cardImageSrc}
        imageAlt={edition.cardImageAlt ?? edition.title}
        ctaLabel="View"
      />
    );
  }

  return (
    <MoscCmsHubCard
      title={edition.title}
      imageUrl={cardImageSrc}
      imageAlt={edition.cardImageAlt ?? edition.title}
      ctaLabel="View"
      onCtaClick={() => {
        alert(`Kalpana ${edition.year} PDF will be available for download soon.`);
      }}
    />
  );
}
