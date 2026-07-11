'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl, getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import { applySiteTypePresetsToSettings } from '@/lib/siteTypePresets';
import { ensureProfileWritingSlug } from '@/lib/profileSlug';
import { fetchTenantSettingsByTenantId, patchTenantSetting } from '@/app/admin/tenant-management/settings/ApiServerActions';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
  ProfileAudienceContactDTO,
  ProfileAudienceBulkImportResultDTO,
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
  const slug = ensureProfileWritingSlug(data.title, data.slug);
  return createProfileResource('/api/profile-writings', { ...data, slug });
}

export async function updateProfileWritingServer(
  id: number,
  data: Partial<ProfileWritingDTO>
): Promise<ProfileWritingDTO | null> {
  const payload = { ...data };
  if (data.title && !data.slug?.trim()) {
    payload.slug = ensureProfileWritingSlug(data.title, data.slug);
  }
  return patchProfileResource('/api/profile-writings', id, payload);
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

export async function fetchProfileAudienceContactsServer(params?: {
  emailContains?: string;
  optInStatus?: string;
  page?: number;
  size?: number;
}): Promise<{ contacts: ProfileAudienceContactDTO[]; totalCount: number }> {
  try {
    const qs = new URLSearchParams({
      sort: 'createdAt,desc',
      size: String(params?.size ?? 20),
      page: String(params?.page ?? 0),
    });
    if (params?.emailContains?.trim()) {
      qs.append('email.contains', params.emailContains.trim());
    }
    if (params?.optInStatus) {
      qs.append('optInStatus.equals', params.optInStatus);
    }
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-audience-contacts?${qs}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { contacts: [], totalCount: 0 };
    const data = await res.json();
    const contacts = parseProfileSiteListResponse<ProfileAudienceContactDTO>(data);
    const totalCount =
      typeof data === 'object' && data !== null && 'totalElements' in data
        ? Number((data as { totalElements: number }).totalElements)
        : contacts.length;
    return { contacts, totalCount };
  } catch (error) {
    console.error('[fetchProfileAudienceContactsServer]', error);
    return { contacts: [], totalCount: 0 };
  }
}

export async function createProfileAudienceContactServer(
  data: Omit<ProfileAudienceContactDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<ProfileAudienceContactDTO | null> {
  try {
    const profile = await fetchPublicProfileServer();
    if (!profile?.id) {
      console.error('[createProfileAudienceContactServer] No public profile for tenant');
      return null;
    }
    const payload = withTenantId({
      ...data,
      publicProfileId: profile.id,
      source: data.source ?? 'ADMIN_MANUAL',
      optInStatus: data.optInStatus ?? 'OPTED_IN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-audience-contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[createProfileAudienceContactServer]', error);
    return null;
  }
}

export async function updateProfileAudienceContactServer(
  id: number,
  data: Partial<ProfileAudienceContactDTO>
): Promise<ProfileAudienceContactDTO | null> {
  try {
    const payload = withTenantId({ ...data, id, updatedAt: new Date().toISOString() });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-audience-contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[updateProfileAudienceContactServer]', error);
    return null;
  }
}

export async function deleteProfileAudienceContactServer(id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-audience-contacts/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('[deleteProfileAudienceContactServer]', error);
    return false;
  }
}

export async function bulkImportProfileAudienceServer(
  contacts: Partial<ProfileAudienceContactDTO>[]
): Promise<ProfileAudienceBulkImportResultDTO | null> {
  try {
    const profile = await fetchPublicProfileServer();
    if (!profile?.id) return null;
    const payload = contacts
      .filter((c) => c.email?.trim())
      .map((c) =>
        withTenantId({
          email: c.email!.trim(),
          firstName: c.firstName ?? '',
          lastName: c.lastName ?? '',
          notes: c.notes ?? '',
          publicProfileId: profile.id,
          source: 'CSV_IMPORT' as const,
          optInStatus: c.optInStatus ?? 'OPTED_IN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-audience-contacts/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[bulkImportProfileAudienceServer]', error);
    return null;
  }
}

export async function sendToProfileAudienceServer(
  templateId: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const baseUrl = getAppUrl();
    const url = `${baseUrl}/api/proxy/promotion-email-templates/${templateId}/send-to-profile-audience`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[sendToProfileAudienceServer]', res.status, text);
      return { success: false, message: text };
    }
    return { success: true };
  } catch (error) {
    console.error('[sendToProfileAudienceServer]', error);
    return { success: false, message: String(error) };
  }
}
