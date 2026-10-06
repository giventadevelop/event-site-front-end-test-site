'use client';

import { useState } from 'react';

function youtubeVideoId(url: string): string | null {
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

export function MoscGalleryVideoCard({
  youtubeUrl,
  title,
  description,
  onPlay,
}: {
  youtubeUrl: string;
  title?: string | null;
  description?: string | null;
  onPlay?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const play = () => {
    if (onPlay) {
      onPlay();
      return;
    }
    setOpen(true);
  };
  const videoId = youtubeVideoId(youtubeUrl);
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const label = title?.trim() || 'YouTube video';

  return (
    <>
      <article className="bg-white rounded-xl border border-syro-table-border shadow-sm overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={play}
          className="relative aspect-[4/3] bg-gray-100 block w-full"
          title={label}
          aria-label={`Play ${label}`}
        >
          {thumb ? (
            <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#be1929] text-white shadow-lg">
              <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
        <div className="p-5 flex flex-col gap-3 flex-1">
          <h3 className="font-syro-primary text-lg text-[#1f2937] leading-snug">{label}</h3>
          {description?.trim() ? (
            <p className="text-sm text-[#798daf] line-clamp-3">{description.trim()}</p>
          ) : null}
          <div className="mt-auto">
            <button
              type="button"
              onClick={play}
              className="syro-primary-button inline-flex items-center gap-2"
              title="Watch video"
              aria-label={`Watch ${label}`}
            >
              Watch video
            </button>
          </div>
        </div>
      </article>
      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              {videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={label}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a href={youtubeUrl} className="absolute inset-0 flex items-center justify-center text-white" target="_blank" rel="noreferrer">
                  Open video
                </a>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
