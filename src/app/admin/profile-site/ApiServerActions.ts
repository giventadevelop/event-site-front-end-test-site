'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import { applySiteTypePresetsToSettings } from '@/lib/siteTypePresets';
import { fetchTenantSettingsByTenantId, patchTenantSetting } from '@/app/admin/tenant-management/settings/ApiServerActions';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
  TenantSiteType,
} from '@/types/profileSite';

function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchPublicProfileServer(): Promise<PublicProfileDTO | null> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      size: '1',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/public-profiles?${params}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const list = parseProfileSiteListResponse<PublicProfileDTO>(data);
    return list[0] ?? null;
  } catch (error) {
    console.error('[fetchPublicProfileServer]', error);
    return null;
  }
}

export async function upsertPublicProfileServer(
  payload: Partial<PublicProfileDTO> & { displayName: string }
): Promise<PublicProfileDTO | null> {
  try {
    const existing = await fetchPublicProfileServer();
    const body = withTenantId({
      ...payload,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });

    if (existing?.id) {
      const res = await fetchWithJwtRetry(`${getApiBase()}/api/public-profiles/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify({ ...body, id: existing.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }

    const res = await fetchWithJwtRetry(`${getApiBase()}/api/public-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[upsertPublicProfileServer]', error);
    return null;
  }
}

async function fetchProfileList<T>(path: string, publishedOnly = false): Promise<T[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'displayOrder,asc',
    });
    if (publishedOnly) {
      params.append('status.equals', 'PUBLISHED');
    }
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<T>(data);
  } catch (error) {
    console.error(`[fetchProfileList] ${path}`, error);
    return [];
  }
}

export async function fetchProfileWritingsServer(publishedOnly = false) {
  return fetchProfileList<ProfileWritingDTO>('/api/profile-writings', publishedOnly);
}

export async function fetchProfileAchievementsServer() {
  return fetchProfileList<ProfileAchievementDTO>('/api/profile-achievements');
}

export async function fetchProfileAffiliationsServer() {
  return fetchProfileList<ProfileAffiliationDTO>('/api/profile-affiliations');
}

export async function fetchProfileMediaAssetsServer() {
  return fetchProfileList<ProfileMediaAssetDTO>('/api/profile-media-assets');
}

export async function createProfileWritingServer(
  data: Omit<ProfileWritingDTO, 'id' | 'tenantId'>
): Promise<ProfileWritingDTO | null> {
  return createProfileResource('/api/profile-writings', data);
}

export async function updateProfileWritingServer(
  id: number,
  data: Partial<ProfileWritingDTO>
): Promise<ProfileWritingDTO | null> {
  return patchProfileResource('/api/profile-writings', id, data);
}

export async function deleteProfileWritingServer(id: number): Promise<boolean> {
  return deleteProfileResource('/api/profile-writings', id);
}

export async function createProfileAchievementServer(
  data: Omit<ProfileAchievementDTO, 'id' | 'tenantId'>
): Promise<ProfileAchievementDTO | null> {
  return createProfileResource('/api/profile-achievements', data);
}

export async function updateProfileAchievementServer(
  id: number,
  data: Partial<ProfileAchievementDTO>
): Promise<ProfileAchievementDTO | null> {
  return patchProfileResource('/api/profile-achievements', id, data);
}

export async function deleteProfileAchievementServer(id: number): Promise<boolean> {
  return deleteProfileResource('/api/profile-achievements', id);
}

export async function createProfileAffiliationServer(
  data: Omit<ProfileAffiliationDTO, 'id' | 'tenantId'>
): Promise<ProfileAffiliationDTO | null> {
  return createProfileResource('/api/profile-affiliations', data);
}

export async function updateProfileAffiliationServer(
  id: number,
  data: Partial<ProfileAffiliationDTO>
): Promise<ProfileAffiliationDTO | null> {
  return patchProfileResource('/api/profile-affiliations', id, data);
}

export async function deleteProfileAffiliationServer(id: number): Promise<boolean> {
  return deleteProfileResource('/api/profile-affiliations', id);
}

export async function createProfileMediaAssetServer(
  data: Omit<ProfileMediaAssetDTO, 'id' | 'tenantId'>
): Promise<ProfileMediaAssetDTO | null> {
  return createProfileResource('/api/profile-media-assets', data);
}

export async function updateProfileMediaAssetServer(
  id: number,
  data: Partial<ProfileMediaAssetDTO>
): Promise<ProfileMediaAssetDTO | null> {
  return patchProfileResource('/api/profile-media-assets', id, data);
}

export async function deleteProfileMediaAssetServer(id: number): Promise<boolean> {
  return deleteProfileResource('/api/profile-media-assets', id);
}

async function createProfileResource<T extends { id?: number | null }>(
  path: string,
  data: Omit<T, 'id' | 'tenantId'>
): Promise<T | null> {
  try {
    const payload = withTenantId({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[createProfileResource] ${path}`, error);
    return null;
  }
}

async function patchProfileResource<T>(
  path: string,
  id: number,
  data: Partial<T>
): Promise<T | null> {
  try {
    const payload = withTenantId({ ...data, id, updatedAt: new Date().toISOString() });
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[patchProfileResource] ${path}`, error);
    return null;
  }
}

async function deleteProfileResource(path: string, id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error(`[deleteProfileResource] ${path}`, error);
    return false;
  }
}

/** Apply homepage section presets when site type changes */
export async function applySiteTypePresetsForTenant(
  tenantId: string,
  siteType: TenantSiteType
): Promise<boolean> {
  try {
    const settings = await fetchTenantSettingsByTenantId(tenantId);
    if (!settings?.id) {
      console.warn('[applySiteTypePresetsForTenant] No settings for tenant', tenantId);
      return false;
    }
    const presetPatch = applySiteTypePresetsToSettings(siteType, settings);
    await patchTenantSetting(settings.id, presetPatch);
    return true;
  } catch (error) {
    console.error('[applySiteTypePresetsForTenant]', error);
    return false;
  }
}
