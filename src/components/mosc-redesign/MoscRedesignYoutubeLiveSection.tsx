'use client';

import type { DevalokamAramanaStream } from '@/lib/youtube/devalokamAramanaLive';

type Props = {
  stream: DevalokamAramanaStream;
};

/**
 * Homepage section: embeds Devalokam Aramana current or recent livestream.
 */
export default function MoscRedesignYoutubeLiveSection({ stream }: Props) {
  const heading = stream.isLive ? 'Live Now' : 'Recent Live Stream';
  const sub =
    stream.title ||
    (stream.isLive
      ? 'Watch the live broadcast from Devalokam Aramana'
      : 'Latest livestream from Devalokam Aramana');

  return (
    <section
      className="py-16 md:py-24 bg-parchment border-b border-burgundy/15"
      aria-labelledby="mosc-youtube-live-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
            {stream.isLive ? (
              <>
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                </span>
                YouTube Live
              </>
            ) : (
              'YouTube Live'
            )}
          </span>
          <h2
            id="mosc-youtube-live-heading"
            className="text-3xl md:text-4xl font-bold text-warmBrown-dark mt-2"
          >
            Devalokam Aramana
            <br />
            <span className="text-burgundy">{heading}</span>
          </h2>
          <p className="text-warmGray-dark mt-3 text-sm max-w-2xl mx-auto line-clamp-2">
            {sub}
          </p>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-10">
          <div className="relative w-full overflow-hidden rounded-2xl border-2 border-burgundy/25 shadow-xl shadow-burgundy/15 bg-black aspect-[16/8.5] sm:aspect-[16/8.75] max-h-[18rem] sm:max-h-[22rem] md:max-h-[26rem]">
            <iframe
              key={stream.embedUrl}
              src={stream.embedUrl}
              title={stream.title || 'Devalokam Aramana YouTube live'}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={stream.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-burgundy/30 transition-all duration-200 hover:bg-burgundy-dark hover:shadow-lg"
          >
            Watch on YouTube
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href={stream.streamsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-burgundy/30 px-5 py-2.5 text-sm font-semibold text-warmBrown transition-all duration-200 hover:border-burgundy hover:bg-burgundy hover:text-white"
          >
            All streams
          </a>
        </div>
      </div>
    </section>
  );
}
