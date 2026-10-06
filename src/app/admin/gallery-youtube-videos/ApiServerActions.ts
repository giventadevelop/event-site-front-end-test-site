'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import type { GalleryYoutubeVideoDTO } from '@/types';

export type GalleryYoutubeVideoListResult = {
  records: GalleryYoutubeVideoDTO[];
  error: string | null;
};

export type GalleryYoutubeVideoSaveResult = {
  record: GalleryYoutubeVideoDTO | null;
  error: string | null;
};

function parseList(data: unknown): GalleryYoutubeVideoDTO[] {
  if (Array.isArray(data)) return data as GalleryYoutubeVideoDTO[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: GalleryYoutubeVideoDTO[] }).content;
  }
  return [];
}

export async function fetchGalleryYoutubeVideosAdmin(): Promise<GalleryYoutubeVideoListResult> {
  try {
    const params = new URLSearchParams();
    params.set('tenantId.equals', getTenantId());
    params.set('sort', 'displayOrder,asc');
    params.set('size', '100');
    const res = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/gallery-youtube-videos?${params.toString()}`,
      { method: 'GET', cache: 'no-store' },
      'gallery-youtube-video-list'
    );
    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return { records: [], error: `Could not load gallery videos (${res.status}). ${details}`.trim() };
    }
    return { records: parseList(await res.json()), error: null };
  } catch (error) {
    return { records: [], error: error instanceof Error ? error.message : 'Could not load gallery videos.' };
  }
}

export async function saveGalleryYoutubeVideo(
  payload: GalleryYoutubeVideoDTO
): Promise<GalleryYoutubeVideoSaveResult> {
  try {
    const body: GalleryYoutubeVideoDTO = {
      ...payload,
      tenantId: getTenantId(),
      youtubeUrl: payload.youtubeUrl?.trim() || '',
      title: payload.title?.trim() || null,
      description: payload.description?.trim() || null,
      displayOrder: payload.displayOrder ?? 0,
      isActive: payload.isActive !== false,
    };
    const isUpdate = typeof body.id === 'number';
    const url = isUpdate
      ? `${getApiBaseUrl()}/api/gallery-youtube-videos/${body.id}`
      : `${getApiBaseUrl()}/api/gallery-youtube-videos`;
    const res = await fetchWithJwtRetry(
      url,
      {
        method: isUpdate ? 'PATCH' : 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': isUpdate ? 'application/merge-patch+json' : 'application/json',
        },
        body: JSON.stringify(body),
      },
      isUpdate ? 'gallery-youtube-video-patch' : 'gallery-youtube-video-create'
    );
    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return { record: null, error: `Could not save a gallery video (${res.status}). ${details}`.trim() };
    }
    return { record: (await res.json()) as GalleryYoutubeVideoDTO, error: null };
  } catch (error) {
    return { record: null, error: error instanceof Error ? error.message : 'Could not save a gallery video.' };
  }
}

export async function deleteGalleryYoutubeVideo(id: number): Promise<{ error: string | null }> {
  try {
    const res = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/gallery-youtube-videos/${id}`,
      { method: 'DELETE', cache: 'no-store' },
      'gallery-youtube-video-delete'
    );
    if (!res.ok && res.status !== 204) {
      const details = await res.text().catch(() => '');
      return { error: `Could not remove a gallery video (${res.status}). ${details}`.trim() };
    }
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not remove a gallery video.' };
  }
}
