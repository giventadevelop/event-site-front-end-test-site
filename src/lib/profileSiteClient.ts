import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
  ProfileProjectDTO,
  ProfileOutcomeMetric,
} from '@/types/profileSite';

/**
 * Shared client-side fetch helpers for personal profile public pages.
 * Uses same-origin `/api/proxy/*` (do not use getAppUrl() from the browser).
 */

export async function fetchProfileProxyList<T>(
  path: string,
  options?: { publishedOnly?: boolean; sort?: string }
): Promise<T[]> {
  const params = new URLSearchParams({
    sort: options?.sort ?? 'displayOrder,asc',
  });
  if (options?.publishedOnly) params.append('status.equals', 'PUBLISHED');
  try {
    const res = await fetch(`/api/proxy/${path}?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<T>(data);
  } catch (error) {
    console.error(`[fetchProfileProxyList] ${path}`, error);
    return [];
  }
}

export async function fetchPublishedPublicProfileClient(): Promise<PublicProfileDTO | null> {
  try {
    const res = await fetch('/api/proxy/public-profiles?size=1', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const list = parseProfileSiteListResponse<PublicProfileDTO>(data);
    const profile = list[0] ?? null;
    if (profile && !profile.isPublished) return null;
    return profile;
  } catch (error) {
    console.error('[fetchPublishedPublicProfileClient]', error);
    return null;
  }
}

export function fetchPublishedWritingsClient() {
  return fetchProfileProxyList<ProfileWritingDTO>('profile-writings', { publishedOnly: true });
}

export function fetchAchievementsClient() {
  return fetchProfileProxyList<ProfileAchievementDTO>('profile-achievements');
}

export function fetchAffiliationsClient() {
  return fetchProfileProxyList<ProfileAffiliationDTO>('profile-affiliations');
}

export function fetchMediaAssetsClient() {
  return fetchProfileProxyList<ProfileMediaAssetDTO>('profile-media-assets');
}

export function fetchProjectsClient() {
  return fetchProfileProxyList<ProfileProjectDTO>('profile-projects');
}

const TALK_MEDIA_KINDS = new Set(['VIDEO', 'PODCAST', 'PRESS']);

/** Heuristic: video/podcast/press media kinds, or URLs that look like YouTube/Vimeo/podcast hosts */
export function isTalksMediaAsset(asset: ProfileMediaAssetDTO): boolean {
  if (asset.mediaKind && TALK_MEDIA_KINDS.has(asset.mediaKind)) return true;
  const url = (asset.fileUrl || '').toLowerCase();
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('spotify.com') ||
    url.includes('podcast') ||
    url.includes('soundcloud.com')
  );
}

export function isDownloadDocumentAsset(asset: ProfileMediaAssetDTO): boolean {
  if (asset.isDownloadable === false) return false;
  if (asset.mediaKind && TALK_MEDIA_KINDS.has(asset.mediaKind)) return false;
  return !isTalksMediaAsset(asset);
}

export function parseOutcomeMetrics(json?: string | null): ProfileOutcomeMetric[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m && typeof m === 'object' && (m.label || m.value))
      .map((m) => ({
        label: String(m.label ?? ''),
        value: String(m.value ?? ''),
      }))
      .filter((m) => m.label || m.value);
  } catch {
    return [];
  }
}
