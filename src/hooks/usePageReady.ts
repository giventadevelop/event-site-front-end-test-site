import { useState, useEffect } from 'react';

/**
 * DEFERRED DATA FETCHING HOOKS
 *
 * These hooks ensure API calls don't fire until after the initial page paint,
 * preventing network requests from competing with static content rendering.
 * Critical for AWS Amplify Lambda deployments where cold starts + burst API
 * calls cause perceived slowness on first load.
 *
 * Pattern:
 *   1. Static content renders immediately (no data dependency)
 *   2. Browser completes initial paint (usePageReady)
 *   3. API calls fire in staggered order (useDeferredFetch with delays)
 *   4. Sections populate progressively as data arrives
 *
 * Cache behavior: Components should ALWAYS check sessionStorage cache
 * before consulting the deferred flag. Cached data loads instantly
 * regardless of deferral state.
 */

/**
 * Returns true once the browser has completed its initial paint cycle.
 * Uses nested requestAnimationFrame to ensure the first paint has occurred.
 *
 * This hook is safe to call from 'use client' components only.
 */
export function usePageReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Nested rAF: the outer rAF fires before the next repaint,
    // the inner rAF fires after that repaint completes.
    // This guarantees the initial paint has occurred.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    });

    return () => { cancelled = true; };
  }, []);

  return ready;
}

/**
 * Returns true after the page is ready + an additional configurable delay.
 * Use different delays for different sections to stagger API calls and
 * prevent network request bursts.
 *
 * Recommended delay tiers for the home page:
 *   - 0ms:    TenantSettingsProvider (gate for section visibility)
 *   - 500ms:  Hero / Live / Featured events (above the fold)
 *   - 300ms:  Upcoming Events (below fold, mounts after TenantSettings)
 *   - 800ms:  Team Section (further down, mounts after TenantSettings)
 *   - 1500ms: Sponsors (bottom of page)
 *
 * @param delayMs Additional delay in ms after page ready (default: 0)
 */
export function useDeferredFetch(delayMs: number = 0): boolean {
  const pageReady = usePageReady();
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (!pageReady) return;

    if (delayMs <= 0) {
      setShouldFetch(true);
      return;
    }

    const timer = setTimeout(() => setShouldFetch(true), delayMs);
    return () => clearTimeout(timer);
  }, [pageReady, delayMs]);

  return shouldFetch;
}
