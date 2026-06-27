import React from 'react';

interface FlashBarProps {
  message: string;
}

/**
 * Red scrolling / ticker bar for flash/breaking news. Shown only when flash is active.
 */
export function FlashBar({ message }: FlashBarProps) {
  return (
    <div
      className="bg-destructive/90 text-destructive-foreground py-2 overflow-hidden border-y border-destructive"
      role="marquee"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-body text-sm font-medium truncate" title={message}>
          {message}
        </p>
      </div>
    </div>
  );
}
