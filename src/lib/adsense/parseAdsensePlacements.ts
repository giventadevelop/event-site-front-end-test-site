export type AdsenseRegionId =
  | 'sidebar'
  | 'between_sections'
  | 'footer_strip'
  | 'article_inline';

export type AdsensePlacementsMap = Partial<Record<AdsenseRegionId, string>>;

/** Parse tenant_settings.googleAdsensePlacementsJson into region → slot id map. */
export function parseAdsensePlacements(json: string | null | undefined): AdsensePlacementsMap {
  if (!json?.trim()) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const result: AdsensePlacementsMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) {
        result[key as AdsenseRegionId] = value.trim();
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const ADSENSE_REGION_LABELS: Record<AdsenseRegionId, string> = {
  sidebar: 'Sidebar (desktop / long content)',
  between_sections: 'Between homepage sections (hero → events)',
  footer_strip: 'Footer strip (above copyright)',
  article_inline: 'Article inline (phase 2 — event/news detail)',
};

export const ADSENSE_PLACEMENTS_EXAMPLE = JSON.stringify(
  {
    sidebar: '1234567890',
    between_sections: '0987654321',
    footer_strip: '1122334455',
  },
  null,
  2
);
