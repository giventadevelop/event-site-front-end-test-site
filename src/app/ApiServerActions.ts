'use server';

import { TenantSettingsDTO } from '@/types';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

/**
 * Fetch tenant settings for the current tenant
 * Used by homepage to determine section visibility
 */
export async function fetchTenantSettingsServer(): Promise<TenantSettingsDTO | null> {
  try {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
    if (!getApiBase()) {
      console.error('[fetchTenantSettingsServer] API base URL not configured');
      return null;
    }

    const tenantId = getTenantId();
    console.log('[fetchTenantSettingsServer] 🔍 Fetching tenant settings for:', tenantId);

    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/tenant-settings?tenantId.equals=${encodeURIComponent(tenantId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.error('[fetchTenantSettingsServer] ❌ Failed to fetch tenant settings:', response.status);
      return null;
    }

    const data = await response.json();
    const settings = Array.isArray(data) ? data[0] : data;
    
    if (settings) {
      console.log('[fetchTenantSettingsServer] ✅ Tenant settings fetched:', {
        tenantId: settings.tenantId,
        showEvents: settings.showEventsSectionInHomePage,
        showTeam: settings.showTeamMembersSectionInHomePage,
        showSponsors: settings.showSponsorsSectionInHomePage
      });
    } else {
      console.warn('[fetchTenantSettingsServer] ⚠️ No tenant settings found for tenantId:', tenantId);
    }

    return settings || null;
  } catch (error) {
    console.error('[fetchTenantSettingsServer] ❌ Error fetching tenant settings:', error);
    return null;
  }
}