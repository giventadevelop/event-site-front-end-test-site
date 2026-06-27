'use client';

import React, { useState, useCallback } from 'react';
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
 * - Items: optional link to article or external URL; pause on hover.
 */
export function FlashNewsCarousel({ items }: FlashNewsCarouselProps) {
  const [paused, setPaused] = useState(false);

  const handleMouseEnter = useCallback(() => setPaused(true), []);
  const handleMouseLeave = useCallback(() => setPaused(false), []);

  if (!items.length) return null;

  return (
    <div
      className="flash-news flex items-stretch overflow-hidden border-y border-[#3ab81c]"
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
          className="flex items-center gap-8 font-body text-sm font-medium text-[#1a1a1a] whitespace-nowrap flash-ticker-track"
          style={{
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {[...items, ...items].map((item, index) => (
            <TickerItem key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
