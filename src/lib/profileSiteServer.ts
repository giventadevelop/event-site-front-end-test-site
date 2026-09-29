'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import type { PublicProfileDTO, ProfileWritingDTO, ProfileMediaAssetDTO, ProfileAffiliationDTO } from '@/types/profileSite';
import type { TenantOrganizationDTO } from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Published public profile for the current tenant (About / Contact pages).
 */
export async function fetchPublishedPublicProfileForPagesServer(): Promise<PublicProfileDTO | null> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      size: '1',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/public-profiles?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = parseProfileSiteListResponse<PublicProfileDTO>(data);
    const profile = list[0] ?? null;
    if (!profile || profile.isPublished === false) return null;
    return profile;
  } catch (error) {
    console.error('[fetchPublishedPublicProfileForPagesServer]', error);
    return null;
  }
}

/**
 * Tenant organization address fields for Contact page footer block.
 */
export async function fetchTenantOrganizationForProfilePagesServer(): Promise<TenantOrganizationDTO | null> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      size: '1',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : [];
    return (list[0] as TenantOrganizationDTO) ?? null;
  } catch (error) {
    console.error('[fetchTenantOrganizationForProfilePagesServer]', error);
    return null;
  }
}

/**
 * Fetch a published profile writing by URL slug (public detail pages).
 */
export async function fetchProfileWritingBySlugServer(slug: string): Promise<ProfileWritingDTO | null> {
  if (!slug?.trim()) return null;
  try {
    const params = new URLSearchParams({
      'slug.equals': slug.trim(),
      'status.equals': 'PUBLISHED',
      size: '1',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-writings?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = parseProfileSiteListResponse<ProfileWritingDTO>(data);
    return list[0] ?? null;
  } catch (error) {
    console.error('[fetchProfileWritingBySlugServer]', error);
    return null;
  }
}

/**
 * Fetch a published profile writing by database id (fallback when slug is missing).
 */
export async function fetchProfileWritingByIdServer(id: number): Promise<ProfileWritingDTO | null> {
  if (!id || Number.isNaN(id)) return null;
  try {
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-writings/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const writing = (await res.json()) as ProfileWritingDTO;
    if (writing.status && writing.status !== 'PUBLISHED') return null;
    return writing;
  } catch (error) {
    console.error('[fetchProfileWritingByIdServer]', error);
    return null;
  }
}

/**
 * Fetch a profile media asset by id (public download detail pages).
 */
export async function fetchProfileMediaAssetByIdServer(id: number): Promise<ProfileMediaAssetDTO | null> {
  if (!id || Number.isNaN(id)) return null;
  try {
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-media-assets/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as ProfileMediaAssetDTO;
  } catch (error) {
    console.error('[fetchProfileMediaAssetByIdServer]', error);
    return null;
  }
}

/**
 * Published profile writings for the current tenant (News / Perspectives list).
 */
export async function fetchPublishedProfileWritingsServer(): Promise<ProfileWritingDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      'status.equals': 'PUBLISHED',
      sort: 'displayOrder,asc',
      size: '100',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-writings?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<ProfileWritingDTO>(data);
  } catch (error) {
    console.error('[fetchPublishedProfileWritingsServer]', error);
    return [];
  }
}

/**
 * Downloadable profile media assets for the current tenant.
 */
export async function fetchDownloadableProfileMediaAssetsServer(): Promise<ProfileMediaAssetDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'displayOrder,asc',
      size: '100',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-media-assets?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = parseProfileSiteListResponse<ProfileMediaAssetDTO>(data);
    return list.filter((a) => a.isDownloadable !== false);
  } catch (error) {
    console.error('[fetchDownloadableProfileMediaAssetsServer]', error);
    return [];
  }
}

/**
 * Profile affiliations for Links page (optional org URLs).
 */
export async function fetchProfileAffiliationsForLinksServer(): Promise<ProfileAffiliationDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      sort: 'displayOrder,asc',
      size: '100',
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/profile-affiliations?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<ProfileAffiliationDTO>(data);
  } catch (error) {
    console.error('[fetchProfileAffiliationsForLinksServer]', error);
    return [];
  }
}
