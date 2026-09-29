/**
 * Resolve the current or most recent YouTube live video for Devalokam Aramana
 * (@DevalokamAramana / streams tab). Prefer YouTube Data API when
 * YOUTUBE_API_KEY (or AMPLIFY_YOUTUBE_API_KEY) is set; otherwise scrape the
 * public /streams page for the first stream video ID, then enrich via oEmbed.
 */

export const DEVALOKAM_ARAMANA_CHANNEL_ID = 'UClNiCAK-01A3AnbHPbRS8ow';
export const DEVALOKAM_ARAMANA_HANDLE = 'DevalokamAramana';
export const DEVALOKAM_ARAMANA_STREAMS_URL =
  'https://www.youtube.com/@DevalokamAramana/streams';
export const DEVALOKAM_ARAMANA_CHANNEL_URL =
  'https://www.youtube.com/@DevalokamAramana';

export type DevalokamAramanaStream = {
  videoId: string | null;
  title: string | null;
  isLive: boolean;
  embedUrl: string;
  watchUrl: string;
  channelUrl: string;
  streamsUrl: string;
};

function getYoutubeApiKey(): string | undefined {
  return (
    process.env.AMPLIFY_YOUTUBE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    undefined
  );
}

async function searchChannelEvent(
  apiKey: string,
  eventType: 'live' | 'completed'
): Promise<{ videoId: string; title: string | null } | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', DEVALOKAM_ARAMANA_CHANNEL_ID);
  url.searchParams.set('type', 'video');
  url.searchParams.set('eventType', eventType);
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    console.warn(
      `[devalokam-youtube] search eventType=${eventType} failed:`,
      res.status,
      await res.text().catch(() => '')
    );
    return null;
  }
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string };
    }>;
  };
  const item = data.items?.[0];
  const videoId = item?.id?.videoId;
  if (!videoId) return null;
  return { videoId, title: item?.snippet?.title ?? null };
}

async function resolveViaApi(
  apiKey: string
): Promise<{ videoId: string; title: string | null; isLive: boolean } | null> {
  const live = await searchChannelEvent(apiKey, 'live');
  if (live) return { ...live, isLive: true };
  const completed = await searchChannelEvent(apiKey, 'completed');
  if (completed) return { ...completed, isLive: false };
  return null;
}

/**
 * Public /streams HTML lists live first, then recent past livestreams.
 * First videoId in page order is the best no-key fallback.
 */
async function resolveViaStreamsPage(): Promise<{
  videoId: string;
  isLive: boolean;
} | null> {
  try {
    const res = await fetch(DEVALOKAM_ARAMANA_STREAMS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MOSC-site/1.0; +https://www.mosc.in)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      console.warn('[devalokam-youtube] streams page fetch failed:', res.status);
      return null;
    }
    const html = await res.text();
    const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const m of matches) {
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
      if (ids.length >= 5) break;
    }
    const videoId = ids[0];
    if (!videoId) return null;

    // Heuristic: LIVE badge near the first occurrence of this video id
    const idx = html.indexOf(videoId);
    const window = idx >= 0 ? html.slice(Math.max(0, idx - 400), idx + 1200) : '';
    const isLive =
      /"text"\s*:\s*"LIVE"/i.test(window) ||
      /BADGE_STYLE_LIVE/i.test(window) ||
      /\bLIVE NOW\b/i.test(window);

    return { videoId, isLive };
  } catch (err) {
    console.error('[devalokam-youtube] streams page error:', err);
    return null;
  }
}

async function fetchOEmbedTitle(videoId: string): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

function channelLiveFallback(): DevalokamAramanaStream {
  return {
    videoId: null,
    title: null,
    isLive: true,
    embedUrl: `https://www.youtube.com/embed/live_stream?channel=${DEVALOKAM_ARAMANA_CHANNEL_ID}`,
    watchUrl: `${DEVALOKAM_ARAMANA_CHANNEL_URL}/live`,
    channelUrl: DEVALOKAM_ARAMANA_CHANNEL_URL,
    streamsUrl: DEVALOKAM_ARAMANA_STREAMS_URL,
  };
}

/**
 * Returns embed info for the channel's current live stream, or the most recent
 * completed livestream when nothing is live.
 */
export async function getDevalokamAramanaLiveOrRecent(): Promise<DevalokamAramanaStream> {
  const apiKey = getYoutubeApiKey();

  let videoId: string | null = null;
  let title: string | null = null;
  let isLive = false;

  if (apiKey) {
    try {
      const apiResult = await resolveViaApi(apiKey);
      if (apiResult) {
        videoId = apiResult.videoId;
        title = apiResult.title;
        isLive = apiResult.isLive;
      }
    } catch (err) {
      console.error('[devalokam-youtube] API resolve failed:', err);
    }
  }

  if (!videoId) {
    const scraped = await resolveViaStreamsPage();
    if (scraped) {
      videoId = scraped.videoId;
      isLive = scraped.isLive;
    }
  }

  if (!videoId) {
    return channelLiveFallback();
  }

  if (!title) {
    title = await fetchOEmbedTitle(videoId);
  }

  return {
    videoId,
    title,
    isLive,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    channelUrl: DEVALOKAM_ARAMANA_CHANNEL_URL,
    streamsUrl: DEVALOKAM_ARAMANA_STREAMS_URL,
  };
}
