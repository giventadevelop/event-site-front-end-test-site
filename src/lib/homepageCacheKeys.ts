/**
 * Homepage cache key helpers for env-separated and optional versioned keys.
 * See documentation/cloud_front/HOMEPAGE_CACHE_IMPLEMENTATION_PLAN.html and feasibility plan.
 */

/** Prefix for all client-side homepage caches (local | development | staging | production). */
export function getHomepageCacheKeyPrefix(): string {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_ENV) || 'local';
}

/** Full cache key for a given suffix. Optionally include version for cache-busting after admin refresh. */
export function getHomepageCacheKey(suffix: string, version?: number): string {
  const prefix = getHomepageCacheKeyPrefix();
  if (version != null && typeof version === 'number') {
    return `${prefix}_v${version}_${suffix}`;
  }
  return `${prefix}_${suffix}`;
}

/** Suffixes used for homepage-related caches (for invalidation). */
export const HOMEPAGE_CACHE_KEY_SUFFIXES = [
  'homepage_tenant_settings_cache',
  'homepage_tenant_settings_version',
  'homepage_team_cache',
  'homepage_sponsors_cache',
  'homepage_events_cache',
  'homepage_featured_events_cache',
  'homepage_hero_section_cache',
  'team_page_cache',
  'manage_events_cache_future',
  'manage_events_cache_past',
] as const;

/** BroadcastChannel name for homepage cache invalidation (admin "Refresh cache" triggers this). */
export const HOMEPAGE_CACHE_INVALIDATE_CHANNEL = 'homepage-cache-invalidate';

/**
 * Removes all env-prefixed homepage caches from sessionStorage so next load refetches.
 * Call this when admin triggers "Refresh cache" (or listen for BroadcastChannel message).
 */
export function clearHomepageCaches(): void {
  if (typeof sessionStorage === 'undefined') return;
  const prefix = getHomepageCacheKeyPrefix() + '_';
  const toRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const hasMatch = HOMEPAGE_CACHE_KEY_SUFFIXES.some((s) => key.includes(s));
    if (hasMatch) toRemove.push(key);
  }
  toRemove.forEach((k) => sessionStorage.removeItem(k));
}
