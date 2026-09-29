export const TENANT_SETTINGS_TABS = [
  'general',
  'integrations',
  'limits',
  'homepageHero',
  'customization',
] as const;

export type TenantSettingsTab = (typeof TENANT_SETTINGS_TABS)[number];

export function parseTenantSettingsTab(value: string | null | undefined): TenantSettingsTab {
  if (value && (TENANT_SETTINGS_TABS as readonly string[]).includes(value)) {
    return value as TenantSettingsTab;
  }
  return 'general';
}

export function tenantSettingsTabQuery(tab: TenantSettingsTab): string {
  return tab === 'general' ? '' : `?tab=${tab}`;
}
