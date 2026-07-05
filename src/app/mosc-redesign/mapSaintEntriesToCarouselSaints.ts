import type { MoscRedesignSaint } from '@/components/mosc-redesign/MoscRedesignSaintsCarousel';
import type { SaintEntry } from '@/app/mosc-redesign/(syro)/saints-cms/types';

const PLACEHOLDER_IMAGE = '/images/saints/st-mary-mother-of-god.jpg';

/** Homepage carousel shows only Strapi saint-entries with order 1–4 (lower = higher priority). */
export const HOMEPAGE_CAROUSEL_ORDER_MIN = 1;
export const HOMEPAGE_CAROUSEL_ORDER_MAX = 4;

export function pickHomepageCarouselSaintEntries(entries: SaintEntry[]): SaintEntry[] {
  return entries
    .filter(
      (entry) =>
        entry.order >= HOMEPAGE_CAROUSEL_ORDER_MIN && entry.order <= HOMEPAGE_CAROUSEL_ORDER_MAX,
    )
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function mapSaintEntriesToCarouselSaints(entries: SaintEntry[]): MoscRedesignSaint[] {
  return entries.map((entry) => {
    const baseSlug = entry.slug.replace(/-mo2$/, '');
    const isBaselios = baseSlug === 'st-baselios-yeldho-kothamangalam-bava';

    return {
      name: entry.name,
      href: entry.slug ? `/mosc-redesign/saints-cms/${entry.slug}` : '/mosc-redesign/saints-cms',
      image: entry.imageUrl ?? PLACEHOLDER_IMAGE,
      alt: entry.imageAlt ?? entry.name,
      ...(isBaselios ? { imageClassName: 'scale-y-90 origin-top' as const } : {}),
    };
  });
}
