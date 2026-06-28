/**
 * Clerk satellite hostname detection (client + server).
 * Uses NEXT_PUBLIC_CLERK_IS_SATELLITE + NEXT_PUBLIC_CLERK_DOMAIN / APP_URL —
 * not hardcoded domain names — so new satellites work without code changes.
 */

function normalizeHostname(value: string): string {
  const withoutProtocol = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const withoutPort = withoutProtocol.split(':')[0];
  return withoutPort.toLowerCase();
}

export function getPrimaryHost(): string {
  const raw =
    process.env.NEXT_PUBLIC_PRIMARY_DOMAIN ||
    process.env.AMPLIFY_NEXT_PUBLIC_PRIMARY_DOMAIN ||
    'www.event-site-manager.com';
  return normalizeHostname(raw);
}

export function getClerkSatelliteHost(): string | null {
  const fromDomain =
    process.env.NEXT_PUBLIC_CLERK_DOMAIN || process.env.AMPLIFY_NEXT_PUBLIC_CLERK_DOMAIN;
  if (fromDomain) return normalizeHostname(fromDomain);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AMPLIFY_NEXT_PUBLIC_APP_URL || '';
  if (!appUrl) return null;
  try {
    return normalizeHostname(new URL(appUrl).hostname);
  } catch {
    return null;
  }
}

export function isClerkSatelliteEnv(): boolean {
  return (
    process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' ||
    process.env.AMPLIFY_NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true'
  );
}

export function isPrimaryHostname(hostname: string): boolean {
  const h = normalizeHostname(hostname);
  const primary = getPrimaryHost();
  const bare = primary.replace(/^www\./, '');
  return h === primary || h === bare || h.endsWith(`.${bare}`) || h === bare;
}

export function isSatelliteHostname(hostname: string): boolean {
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  if (isPrimaryHostname(hostname)) {
    return false;
  }

  // Legacy: mosc-temp satellite (predates env-driven detection)
  if (hostname.includes('mosc-temp.com')) {
    return true;
  }

  if (!isClerkSatelliteEnv()) {
    return false;
  }

  const satHost = getClerkSatelliteHost();
  if (!satHost) {
    return false;
  }

  const h = normalizeHostname(hostname);
  const satBare = satHost.replace(/^www\./, '');
  return h === satHost || h === satBare || h.endsWith(`.${satBare}`) || h === satBare;
}

export function usesPrimaryClerkSignInUrl(): boolean {
  const isLocalhost =
    process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1') ||
    !process.env.NEXT_PUBLIC_APP_URL;

  if (isLocalhost) {
    return false;
  }

  if (isClerkSatelliteEnv()) {
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AMPLIFY_NEXT_PUBLIC_APP_URL || '';
  return appUrl.includes('mosc-temp.com') || appUrl.includes('amplifyapp.com');
}

/** Primary sign-out redirect: allow return to configured satellite or localhost only. */
export function isAllowedSatelliteRedirectUrl(url: string): boolean {
  if (!url.startsWith('http')) {
    return false;
  }
  try {
    const host = normalizeHostname(new URL(url).hostname);
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }
    return isSatelliteHostname(host);
  } catch {
    return false;
  }
}
