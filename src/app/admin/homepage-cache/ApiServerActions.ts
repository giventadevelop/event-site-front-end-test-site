'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';

/**
 * Refreshes the homepage cache for a tenant by bumping homepageCacheVersion
 * in tenant_settings (cache-busting). Backend must support PATCH with
 * homepageCacheVersion; see documentation/cloud_front/HOMEPAGE_CACHE_IMPLEMENTATION_PLAN.html.
 */
export async function refreshHomepageCacheServer(settingsId: number): Promise<{ version: number }> {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  // Fetch current setting to get existing version
  const getRes = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/tenant-settings/${settingsId}`,
    { cache: 'no-store' }
  );

  if (!getRes.ok) {
    if (getRes.status === 404) {
      throw new Error('Tenant setting not found');
    }
    throw new Error(`Failed to load tenant setting: ${getRes.statusText}`);
  }

  const existing = await getRes.json();
  const currentVersion = typeof existing.homepageCacheVersion === 'number' ? existing.homepageCacheVersion : 0;
  const newVersion = currentVersion + 1;

  const patchRes = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/tenant-settings/${settingsId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify({
        id: settingsId,
        tenantId: existing.tenantId,
        homepageCacheVersion: newVersion,
        updatedAt: new Date().toISOString(),
      }),
    }
  );

  if (!patchRes.ok) {
    const text = await patchRes.text();
    throw new Error(`Failed to refresh homepage cache: ${patchRes.statusText}. ${text}`);
  }

  return { version: newVersion };
}
