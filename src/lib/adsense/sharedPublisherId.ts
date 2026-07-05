/**
 * Model A — Shared Publisher ID registered with giventa.com (Google AdSense owner account).
 * Use on satellite domains that do not have their own per-tenant Publisher ID.
 *
 * @see documentation/tenant_management/google_adsense_integration/google_adsense_shared_publisher_giventa.html
 */
export const GIVENTA_SHARED_ADSENSE_PUBLISHER_ID = 'ca-pub-1016198353275904';

/** Numeric form for ads.txt (no `ca-` prefix). */
export const GIVENTA_SHARED_ADSENSE_PUBLISHER_ID_NUMERIC = 'pub-1016198353275904';

export const GIVENTA_SHARED_ADSENSE_ACCOUNT_DOMAIN = 'giventa.com';

/** ads.txt line for Google AdSense (Model A / shared owner ID). */
export const GIVENTA_SHARED_ADSENSE_ADS_TXT_LINE = `google.com, ${GIVENTA_SHARED_ADSENSE_PUBLISHER_ID_NUMERIC}, DIRECT, f08c47fec0942fa0`;

/**
 * Publisher ID for the <meta name="google-adsense-account"> tag on satellite deploys.
 * Override with NEXT_PUBLIC_GOOGLE_ADSENSE_SHARED_PUBLISHER_ID in Amplify when needed.
 */
export function getSharedAdsensePublisherIdForMeta(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SHARED_PUBLISHER_ID ||
    process.env.AMPLIFY_NEXT_PUBLIC_GOOGLE_ADSENSE_SHARED_PUBLISHER_ID ||
    GIVENTA_SHARED_ADSENSE_PUBLISHER_ID
  );
}
