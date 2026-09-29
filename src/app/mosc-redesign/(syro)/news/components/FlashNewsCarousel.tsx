'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { FlashNewsItemUI } from '../types';

interface FlashNewsCarouselProps {
  items: FlashNewsItemUI[];
}

function TickerItem({ item }: { item: FlashNewsItemUI }) {
  return (
    <span className="inline-flex items-center gap-6">
      {item.link ? (
        <a
          href={item.link}
          className="hover:underline focus:outline-none focus:underline text-inherit"
          {...(item.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {item.content}
        </a>
      ) : (
        <span>{item.content}</span>
      )}
      <span className="opacity-70" aria-hidden="true">
        •
      </span>
    </span>
  );
}

/**
 * Horizontal scrolling flash news ticker. Matches reference styling:
 * - Container: green bar (flash-news)
 * - Title: "Flash News" label with red background and clip-path (flash-title)
 * - Items: optional link to article or external URL; pause on hover
 * - Right-side Browse button: opens a list of all flash news items
 */
export function FlashNewsCarousel({ items }: FlashNewsCarouselProps) {
  const [paused, setPaused] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => setPaused(true), []);
  const handleMouseLeave = useCallback(() => setPaused(false), []);

  const tickerDurationSec = useMemo(() => {
    // ~8s per item, keep readable speed for short and long lists
    return Math.max(30, Math.min(90, items.length * 8));
  }, [items.length]);

  useEffect(() => {
    if (!browseOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setBrowseOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBrowseOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [browseOpen]);

  if (!items.length) return null;

  const tickerPaused = paused || browseOpen;

  return (
    <div
      ref={rootRef}
      className="flash-news relative flex items-stretch overflow-visible border-y border-[#3ab81c]"
      style={{ background: '#4ad822' }}
      role="region"
      aria-label="Flash News"
    >
      {/* Title label - reference: .flash-title (#db1111, clip-path) */}
      <div
        className="flash-title flex-shrink-0 flex items-center px-4 py-2 font-heading font-semibold text-white"
        style={{
          background: '#db1111',
          clipPath: 'polygon(0 0, 90% 0%, 100% 100%, 0% 100%)',
          minWidth: '140px',
        }}
      >
        Flash News
      </div>

      {/* Ticker track: duplicate content for seamless loop */}
      <div
        className="flex-1 min-w-0 overflow-hidden py-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex items-center gap-8 font-body text-sm font-medium text-[#1a1a1a] whitespace-nowrap flash-ticker-track${
            tickerPaused ? ' is-paused' : ''
          }`}
          style={
            {
              '--flash-ticker-duration': `${tickerDurationSec}s`,
              animationPlayState: tickerPaused ? 'paused' : 'running',
            } as React.CSSProperties
          }
        >
          {[...items, ...items].map((item, index) => (
            <TickerItem key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>

      {/* Browse button (right side) */}
      <div className="relative flex-shrink-0 flex items-stretch border-l border-[#3ab81c]/60">
        <button
          type="button"
          onClick={() => setBrowseOpen((open) => !open)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#db1111] hover:bg-[#be1929] text-white font-heading font-semibold text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4ad822]"
          aria-expanded={browseOpen}
          aria-controls="flash-news-browse-panel"
          aria-label={browseOpen ? 'Close flash news list' : 'Browse flash news'}
          title="Browse flash news"
        >
          <span>Browse</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {browseOpen && (
          <div
            id="flash-news-browse-panel"
            role="listbox"
            aria-label="All flash news"
            className="absolute right-0 top-full z-40 mt-1 w-[min(92vw,28rem)] max-h-80 overflow-y-auto rounded-md border border-syro-table-border bg-white shadow-lg"
          >
            <ul className="divide-y divide-syro-table-border py-1">
              {items.map((item) => (
                <li key={item.id} role="option">
                  {item.link ? (
                    <a
                      href={item.link}
                      className="block px-4 py-3 text-sm text-[#0b2848] hover:bg-[#f5f7fa] hover:text-[#dc3545] focus:outline-none focus:bg-[#f5f7fa]"
                      onClick={() => setBrowseOpen(false)}
                      {...(item.link.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {item.content}
                    </a>
                  ) : (
                    <span className="block px-4 py-3 text-sm text-[#0b2848]">{item.content}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
