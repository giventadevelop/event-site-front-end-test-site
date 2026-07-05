import { integrationDisableHint } from '@/lib/integrations/validateTenantIntegrationsForSave';

export type AdsenseRegionId =
  | 'sidebar'
  | 'between_sections'
  | 'footer_strip'
  | 'article_inline';

export type AdsensePlacementsMap = Partial<Record<AdsenseRegionId, string>>;

export type AdsensePlacementFields = Record<AdsenseRegionId, string>;

export const ADSENSE_REGION_IDS: AdsenseRegionId[] = [
  'sidebar',
  'between_sections',
  'footer_strip',
  'article_inline',
];

export function emptyAdsensePlacementFields(): AdsensePlacementFields {
  return {
    sidebar: '',
    between_sections: '',
    footer_strip: '',
    article_inline: '',
  };
}

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

/** Map stored JSON into one string field per layout region (for admin form inputs). */
export function adsensePlacementFieldsFromJson(
  json: string | null | undefined
): AdsensePlacementFields {
  const map = parseAdsensePlacements(json);
  const fields = emptyAdsensePlacementFields();
  for (const id of ADSENSE_REGION_IDS) {
    fields[id] = map[id] ?? '';
  }
  return fields;
}

/** Serialize per-region slot inputs into googleAdsensePlacementsJson for the API. */
export function serializeAdsensePlacementFields(fields: AdsensePlacementFields): string {
  const obj: AdsensePlacementsMap = {};
  for (const id of ADSENSE_REGION_IDS) {
    const value = fields[id]?.trim();
    if (value) {
      obj[id] = value;
    }
  }
  if (Object.keys(obj).length === 0) {
    return '';
  }
  return JSON.stringify(obj);
}

export function validateAdsenseSlotId(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  if (!/^[0-9]+$/.test(trimmed)) {
    return 'Ad slot ID must contain digits only';
  }
  if (trimmed.length > 32) {
    return 'Ad slot ID must not exceed 32 characters';
  }
  return true;
}

export function collectAdsensePlacementFieldErrors(
  fields: AdsensePlacementFields
): Partial<Record<AdsenseRegionId, string>> {
  const nextErrors: Partial<Record<AdsenseRegionId, string>> = {};
  for (const regionId of ADSENSE_REGION_IDS) {
    const result = validateAdsenseSlotId(fields[regionId]);
    if (result !== true) {
      nextErrors[regionId] = result;
    }
  }
  return nextErrors;
}

export function validateAdsensePlacementFields(fields: AdsensePlacementFields): boolean {
  return Object.keys(collectAdsensePlacementFieldErrors(fields)).length === 0;
}

export type GoogleAdsenseSaveValidationResult =
  | { valid: true }
  | {
      valid: false;
      field: 'googleAdsensePublisherId' | 'placements';
      summary: string;
      details: string[];
    };

/** Validates AdSense config before save (runs even when Integrations tab is not mounted). */
export function validateGoogleAdsenseForSave(
  enableGoogleAdsense: boolean,
  googleAdsensePublisherId: string | null | undefined,
  placements: AdsensePlacementFields
): GoogleAdsenseSaveValidationResult {
  if (!enableGoogleAdsense) {
    return { valid: true };
  }

  const adsenseToggle = 'Enable Google AdSense';
  const publisherId = googleAdsensePublisherId?.trim() ?? '';
  if (!publisherId) {
    return {
      valid: false,
      field: 'googleAdsensePublisherId',
      summary: 'Google AdSense is enabled but Publisher ID is missing.',
      details: [
        `You turned on ${adsenseToggle}, so Publisher ID is required.`,
        'Enter your ca-pub-... ID on the Integrations tab.',
        integrationDisableHint(adsenseToggle),
      ],
    };
  }

  if (!/^ca-pub-[0-9]+$/.test(publisherId)) {
    return {
      valid: false,
      field: 'googleAdsensePublisherId',
      summary: 'Google AdSense publisher ID is invalid.',
      details: [
        'Use the format ca-pub-XXXXXXXXXXXXXXXX (digits only after ca-pub-).',
        integrationDisableHint(adsenseToggle),
      ],
    };
  }

  if (!validateAdsensePlacementFields(placements)) {
    return {
      valid: false,
      field: 'placements',
      summary: 'Google AdSense has invalid ad slot IDs.',
      details: [
        'Fix the highlighted ad region fields on the Integrations tab.',
        integrationDisableHint(adsenseToggle),
      ],
    };
  }

  return { valid: true };
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
