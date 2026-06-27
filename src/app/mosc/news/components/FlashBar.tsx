import React from 'react';

interface FlashBarProps {
  message: string;
}

/**
 * Red scrolling / ticker bar for flash/breaking news. Shown only when flash is active.
 */
/** Design system: primary red for flash/breaking news bar */
export function FlashBar({ message }: FlashBarProps) {
  return (
    <div
      className="bg-syro-red text-white py-syro-sm overflow-hidden border-y border-syro-red-darker font-syro-primary"
      role="marquee"
      aria-live="polite"
    >
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <p className="text-syro-small font-medium truncate" title={message}>
          {message}
        </p>
      </div>
    </div>
  );
}
