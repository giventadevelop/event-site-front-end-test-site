'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import type { AdsenseRegionId } from '@/lib/adsense/parseAdsensePlacements';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const loadedPublisherScripts = new Set<string>();

interface GoogleAdSenseSlotProps {
  publisherId: string;
  slotId: string;
  region: AdsenseRegionId;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  minHeight?: number;
}

export default function GoogleAdSenseSlot({
  publisherId,
  slotId,
  region,
  format = 'auto',
  className = '',
  minHeight = 90,
}: GoogleAdSenseSlotProps) {
  const pushedRef = useRef(false);
  const shouldLoadScript = !loadedPublisherScripts.has(publisherId);

  useEffect(() => {
    if (pushedRef.current || !publisherId || !slotId) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (error) {
      console.warn('[GoogleAdSenseSlot] Failed to initialize ad region:', region, error);
    }
  }, [publisherId, slotId, region]);

  if (!publisherId?.trim() || !slotId?.trim()) {
    return null;
  }

  if (shouldLoadScript) {
    loadedPublisherScripts.add(publisherId);
  }

  return (
    <div
      className={`google-adsense-region google-adsense-region--${region} ${className}`.trim()}
      data-ad-region={region}
      style={{ minHeight }}
      aria-hidden="true"
    >
      {shouldLoadScript && (
        <Script
          id={`adsense-script-${publisherId.replace(/[^a-zA-Z0-9-]/g, '-')}`}
          strategy="afterInteractive"
          async
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`}
        />
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
