import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import {
  DEVALOKAM_ARAMANA_CHANNEL_URL,
  DEVALOKAM_ARAMANA_STREAMS_URL,
  getDevalokamAramanaLiveOrRecent,
  type DevalokamAramanaStream,
} from '@/lib/youtube/devalokamAramanaLive';

type HomepageYoutubeOverrideRow = {
  youtubeUrl?: string | null;
  title?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

function parseList(data: unknown): HomepageYoutubeOverrideRow[] {
  if (Array.isArray(data)) return data as HomepageYoutubeOverrideRow[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: HomepageYoutubeOverrideRow[] }).content;
  }
  return [];
}

function isCurrentOverride(row: HomepageYoutubeOverrideRow | undefined, now: number): boolean {
  if (!row || row.isActive === false) return false;
  if (!row.youtubeUrl?.trim()) return false;
  if (row.endsAt) {
    const end = new Date(row.endsAt).getTime();
    if (!Number.isNaN(end) && end <= now) return false;
  }
  return true;
}

function videoIdFromPath(pathname: string, index: number): string | null {
  const part = pathname.split('/').filter(Boolean)[index];
  if (!part || !/^[A-Za-z0-9_-]{6,}$/.test(part)) return null;
  return part;
}

/**
 * Turn a watch, live, short, youtu.be, or embed URL into the homepage player shape.
 * Returns null when the URL cannot be embedded.
 */
export function streamFromYoutubeUrl(
  rawUrl: string,
  options: { title?: string | null; description?: string | null; startsAt?: string | null }
): DevalokamAramanaStream | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  const isYoutube =
    host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com');
  if (!isYoutube) return null;

  let videoId: string | null = null;
  let embedUrl: string | null = null;

  if (host === 'youtu.be') {
    videoId = videoIdFromPath(parsed.pathname, 0);
  } else if (parsed.pathname === '/watch') {
    const id = parsed.searchParams.get('v');
    videoId = id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
  } else if (parsed.pathname.startsWith('/live/')) {
    videoId = videoIdFromPath(parsed.pathname, 1);
  } else if (parsed.pathname.startsWith('/shorts/')) {
    videoId = videoIdFromPath(parsed.pathname, 1);
  } else if (parsed.pathname.startsWith('/embed/')) {
    const embedPart = parsed.pathname.split('/').filter(Boolean)[1];
    if (embedPart === 'live_stream') {
      const channel = parsed.searchParams.get('channel');
      if (channel) {
        embedUrl = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channel)}`;
        videoId = channel;
      }
    } else {
      videoId = videoIdFromPath(parsed.pathname, 1);
    }
  } else if (parsed.pathname.includes('/live')) {
    const channel = parsed.pathname.split('/').filter(Boolean).find((part) => part.startsWith('UC'));
    if (channel) {
      embedUrl = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channel)}`;
      videoId = channel;
    }
  }

  if (!embedUrl && videoId) {
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }
  if (!embedUrl) return null;

  const start = options.startsAt ? new Date(options.startsAt).getTime() : NaN;
  const upcoming = !Number.isNaN(start) && start > Date.now();
  const title = options.title?.trim() || null;

  return {
    videoId,
    title,
    isLive: !upcoming,
    embedUrl,
    watchUrl: videoId && !embedUrl.includes('live_stream')
      ? `https://www.youtube.com/watch?v=${videoId}`
      : rawUrl.trim(),
    channelUrl: DEVALOKAM_ARAMANA_CHANNEL_URL,
    streamsUrl: DEVALOKAM_ARAMANA_STREAMS_URL,
    sectionTitle: title,
    description: options.description?.trim() || null,
    phase: upcoming ? 'upcoming' : 'live',
  };
}

async function loadCurrentOverride(): Promise<DevalokamAramanaStream | null> {
  const tenantId = getTenantId();
  const params = new URLSearchParams();
  params.set('tenantId.equals', tenantId);
  params.set('isActive.equals', 'true');
  params.set('size', '1');
  const res = await fetchWithJwtRetry(
    `${getApiBaseUrl()}/api/homepage-youtube-overrides?${params.toString()}`,
    { method: 'GET', cache: 'no-store' },
    'homepage-youtube-override'
  );
  if (!res.ok) {
    console.warn('[homepage-youtube] override lookup failed:', res.status);
    return null;
  }
  const row = parseList(await res.json())[0];
  if (!isCurrentOverride(row, Date.now())) return null;
  const stream = streamFromYoutubeUrl(row.youtubeUrl || '', {
    title: row.title,
    description: row.description,
    startsAt: row.startsAt,
  });
  if (!stream) {
    console.warn('[homepage-youtube] override URL could not be embedded:', row.youtubeUrl);
  }
  return stream;
}

/**
 * Admin override wins while it is active and not past endsAt, including a future start.
 * Otherwise the Devalokam Aramana live-or-recent resolver runs.
 */
export async function resolveHomepageYoutubeStream(): Promise<DevalokamAramanaStream | null> {
  try {
    const override = await loadCurrentOverride();
    if (override) return override;
  } catch (error) {
    console.error('[homepage-youtube] Failed to load admin override:', error);
  }
  return getDevalokamAramanaLiveOrRecent();
}
