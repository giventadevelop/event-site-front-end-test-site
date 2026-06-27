'use client';

import React, { useEffect, useState } from 'react';

/** Optional data-* attributes to pass to <givebutter-widget> (e.g. when GiveButter documents data-hide-donations) */
export type GivebutterWidgetDataAttrs = Record<string, string | undefined>;

interface GivebutterWidgetProps {
  campaignId?: string;
  widgetId?: string;
  className?: string;
  /** Optional data-* attributes for <givebutter-widget> (e.g. data-hide-donations="true" when supported by GiveButter) */
  dataAttrs?: GivebutterWidgetDataAttrs;
}

const DEFAULT_CAMPAIGN_ID = 'mhoZp0';

/**
 * Givebutter Widget Component
 * Embeds a Givebutter donation widget into the page.
 * Campaign ID is read from NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID (optional prop overrides).
 *
 * Usage:
 * <GivebutterWidget /> - For campaign form (uses env or fallback)
 * <GivebutterWidget campaignId="otherId" /> - Override campaign
 * <GivebutterWidget widgetId="your-widget-id" /> - For specific widget
 */
export default function GivebutterWidget({
  campaignId: campaignIdProp,
  widgetId,
  className = '',
  dataAttrs = {},
}: GivebutterWidgetProps) {
  const campaignId =
    campaignIdProp ??
    (typeof process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID === 'string' && process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID.trim()
      ? process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID.trim()
      : DEFAULT_CAMPAIGN_ID);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Givebutter script is already loaded
    if (typeof window !== 'undefined') {
      const script = document.querySelector('script[src*="widgets.givebutter.com"]');
      if (script) {
        setIsScriptLoaded(true);
        return;
      }

      // Wait for script to load from head
      const checkScript = setInterval(() => {
        const script = document.querySelector('script[src*="widgets.givebutter.com"]');
        if (script && (window as any).Givebutter) {
          setIsScriptLoaded(true);
          clearInterval(checkScript);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkScript), 10000);

      return () => clearInterval(checkScript);
    }
  }, []);

  // Use custom element approach - Givebutter will automatically initialize these
  if (widgetId) {
    const widgetDataAttrs = Object.fromEntries(
      Object.entries(dataAttrs).filter(
        ([k, v]) => (k.startsWith('data-') || k.startsWith('aria-')) && v != null && v !== ''
      )
    ) as Record<string, string>;
    return (
      <div className={`givebutter-widget-container ${className}`}>
        <givebutter-widget id={widgetId} {...widgetDataAttrs} />
      </div>
    );
  }

  // Use campaign form approach
  return (
    <div className={`givebutter-widget-container ${className}`}>
      <givebutter-form campaign={campaignId} />
      {!isScriptLoaded && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donation form...</p>
          </div>
        </div>
      )}
    </div>
  );
}
