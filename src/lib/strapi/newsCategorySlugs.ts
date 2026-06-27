/**
 * Canonical Strapi news category slugs for Content API filters.
 * @see documentation/strapi/strapi_frontend_slug_contract.md
 */

export const STRAPI_NEWS_CATEGORY_SLUGS = {
  mainNews: 'main-news',
  featuredNews: 'featured-news',
  pressRelease: 'press-release',
  mostRead: 'most-read',
} as const;

export type StrapiNewsCategorySlug =
  (typeof STRAPI_NEWS_CATEGORY_SLUGS)[keyof typeof STRAPI_NEWS_CATEGORY_SLUGS];

/**
 * Builds `filters[category][slug][$eq]=...` (default) for article list queries.
 * Use `caseInsensitive: true` only when legacy Strapi data still has mixed-case slugs.
 */
export function buildCategorySlugFilter(
  slug: StrapiNewsCategorySlug | string,
  options?: { caseInsensitive?: boolean }
): string {
  const op = options?.caseInsensitive ? '$eqi' : '$eq';
  return `filters[category][slug][${op}]=${encodeURIComponent(slug)}`;
}

/**
 * Optional kebab normalization when the frontend POSTs slugs to Strapi.
 * Do not use on API responses when building links — use `article.slug` as returned.
 */
export function toKebabSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
