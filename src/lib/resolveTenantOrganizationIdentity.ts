import type { TenantOrganizationDTO, TenantSettingsDTO } from '@/types';

export type TenantOrganizationIdentity = Pick<
  TenantOrganizationDTO,
  | 'description'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'stateProvince'
  | 'zipCode'
  | 'country'
  | 'websiteUrl'
>;

const IDENTITY_KEYS: (keyof TenantOrganizationIdentity)[] = [
  'description',
  'addressLine1',
  'addressLine2',
  'city',
  'stateProvince',
  'zipCode',
  'country',
  'websiteUrl',
];

/** Deprecated tenant_settings identity fields — must not be sent on PATCH/POST (v2.0). */
export const DEPRECATED_SETTINGS_IDENTITY_KEYS = [
  'description',
  'addressLine1',
  'addressLine2',
  'city',
  'stateProvince',
  'zipCode',
  'country',
] as const;

function pickIdentityValue(
  key: keyof TenantOrganizationIdentity,
  org: TenantOrganizationDTO | null | undefined,
  settings: TenantSettingsDTO | null | undefined
): string | null {
  const orgVal = org?.[key];
  if (orgVal != null && String(orgVal).trim() !== '') {
    return String(orgVal).trim();
  }
  const settingsVal = settings?.[key as keyof TenantSettingsDTO];
  if (settingsVal != null && String(settingsVal).trim() !== '') {
    return String(settingsVal).trim();
  }
  return null;
}

/** Org-first; settings columns are legacy read fallback until v2.1 DROP. */
export function resolveTenantOrganizationIdentity(
  org: TenantOrganizationDTO | null | undefined,
  settings: TenantSettingsDTO | null | undefined
): TenantOrganizationIdentity {
  const resolved = {} as TenantOrganizationIdentity;
  for (const key of IDENTITY_KEYS) {
    resolved[key] = pickIdentityValue(key, org, settings);
  }
  return resolved;
}

/** Strip deprecated identity fields before tenant-settings create/update payloads. */
export function stripDeprecatedSettingsIdentityFields<T extends Record<string, unknown>>(
  data: T
): Omit<T, (typeof DEPRECATED_SETTINGS_IDENTITY_KEYS)[number]> {
  const result = { ...data };
  for (const key of DEPRECATED_SETTINGS_IDENTITY_KEYS) {
    delete result[key];
  }
  return result as Omit<T, (typeof DEPRECATED_SETTINGS_IDENTITY_KEYS)[number]>;
}
