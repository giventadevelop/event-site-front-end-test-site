import type { GalleryAlbumDTO } from '@/types';

const STATIC_SLUG_PREFIX = 'static_slug=';

/** Known static album id → route slug (v1.0 until album.slug column exists). */
const TITLE_TO_STATIC_SLUG: Record<string, string> = {
  'Russia visit of H.H Baselios Marthoma Mathews III': 'russia-visit',
  'VATICAN VISIT OF HIS HOLINESS': 'vatican-visit',
  'ENTHRONEMENT CEREMONY OF HIS HOLINESS BASELIOS MARTHOMA MATHEWS III': 'enthronement-mathews-iii',
  'RECEPTION TO HIS HOLINESS BASELIOS MARTHOMA MATHEWS III': 'reception-mathews-iii',
};

/**
 * Resolve MOSC redesign gallery href for a DB album.
 * Prefers `description` marker from migration import (`static_slug=russia-visit`).
 */
export function resolveMoscGalleryAlbumHref(album: GalleryAlbumDTO): string | undefined {
  const description = album.description?.trim();
  if (description?.startsWith(STATIC_SLUG_PREFIX)) {
    const slug = description.slice(STATIC_SLUG_PREFIX.length).split(/[\s,]/)[0];
    if (slug) {
      return `/mosc-redesign/gallery/${slug}`;
    }
  }

  const mappedSlug = TITLE_TO_STATIC_SLUG[album.title];
  if (mappedSlug) {
    return `/mosc-redesign/gallery/${mappedSlug}`;
  }

  return undefined;
}
