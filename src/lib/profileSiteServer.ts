'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import type { ProfileWritingDTO, ProfileMediaAssetDTO } from '@/types/profileSite';

function getApiBase() {
  return getApiBaseUrl();
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
