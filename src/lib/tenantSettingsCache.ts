import type { TenantSettingsDTO } from '@/types';
import { getAppUrl } from '@/lib/env';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const API_BASE_URL = getAppUrl();

interface TenantSettingsCacheEntry {
  settings: TenantSettingsDTO | null;
  fetchedAt: number;
}

const tenantSettingsCache: Record<string, TenantSettingsCacheEntry> = {};

export async function getTenantSettings(tenantId: string): Promise<TenantSettingsDTO | null> {
  const now = Date.now();
  const cacheEntry = tenantSettingsCache[tenantId];
  if (cacheEntry && now - cacheEntry.fetchedAt < CACHE_DURATION_MS) {
    return cacheEntry.settings;
  }
  // Fetch from proxy API
  const url = `${API_BASE_URL}/api/proxy/tenant-settings?tenantId.equals=${encodeURIComponent(tenantId)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`[tenantSettingsCache] Failed to fetch tenant settings for tenantId=${tenantId}:`, res.status, await res.text());
    return null;
  }
  const data = await res.json();
  // API may return an array or object
  const settings: TenantSettingsDTO | null = Array.isArray(data) ? data[0] : data;
  tenantSettingsCache[tenantId] = { settings, fetchedAt: now };
  return settings;
}
