import { isClerkSatelliteEnv, getClerkSatelliteHost } from '@/lib/clerkSatellite';
import { getTenantId } from '@/lib/env';

/**
 * Satellite deployments manage a single tenant (NEXT_PUBLIC_TENANT_ID).
 * Primary (event-site-manager) may list and edit settings for any tenant.
 */
export function isSatelliteTenantSettingsScope(): boolean {
  if (isClerkSatelliteEnv()) {
    return true;
  }

  const appUrl = (
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ''
  ).toLowerCase();

  if (appUrl.includes('mosc-temp.com')) {
    return true;
  }

  const satHost = getClerkSatelliteHost();
  if (satHost) {
    const bare = satHost.replace(/^www\./, '');
    if (appUrl.includes(satHost) || appUrl.includes(bare)) {
      return true;
    }
  }

  return false;
}

/** Tenant ID this app instance is allowed to read/write for tenant settings. */
export function getAppScopedTenantId(): string {
  return getTenantId();
}
