import type { EventMediaDTO } from '@/types';

export const YOUTUBE_GALLERY_MEDIA_TYPE = 'video/youtube';

export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return parsed.pathname.replace(/^\//, '').split('/')[0] || null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null;
      }
      return parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

export function looksLikeYoutubeUrl(value: string): boolean {
  return youtubeVideoId(value.trim()) != null;
}

export function youtubeThumbnailUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeWatchUrl(media: Pick<EventMediaDTO, 'featuredVideoUrl' | 'fileUrl' | 'eventMediaType'>): string | null {
  const candidates = [media.featuredVideoUrl, media.fileUrl].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    if (youtubeVideoId(candidate)) return candidate;
  }
  return null;
}

export function isYoutubeGalleryMedia(
  media: Pick<EventMediaDTO, 'eventMediaType' | 'featuredVideoUrl' | 'fileUrl'>
): boolean {
  if (media.eventMediaType === YOUTUBE_GALLERY_MEDIA_TYPE) return true;
  return youtubeWatchUrl(media) != null && media.eventMediaType?.startsWith('video/') === true;
}
