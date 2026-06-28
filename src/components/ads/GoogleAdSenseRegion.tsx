'use client';

import GoogleAdSenseSlot from '@/components/ads/GoogleAdSenseSlot';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import type { AdsenseRegionId } from '@/lib/adsense/parseAdsensePlacements';

interface GoogleAdSenseRegionProps {
  region: AdsenseRegionId;
  className?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  minHeight?: number;
}

/** Renders an AdSense unit when tenant settings enable ads and the region has a slot mapping. */
export default function GoogleAdSenseRegion({
  region,
  className,
  format,
  minHeight,
}: GoogleAdSenseRegionProps) {
  const { showGoogleAdsense, adsensePublisherId, adsensePlacements } = useTenantSettings();

  if (!showGoogleAdsense || !adsensePublisherId) {
    return null;
  }

  const slotId = adsensePlacements[region];
  if (!slotId) {
    return null;
  }

  return (
    <GoogleAdSenseSlot
      publisherId={adsensePublisherId}
      slotId={slotId}
      region={region}
      className={className}
      format={format}
      minHeight={minHeight}
    />
  );
}
