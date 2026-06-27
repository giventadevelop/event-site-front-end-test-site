'use server';

import { createTenantSetting } from '@/app/admin/tenant-management/settings/ApiServerActions';
import type { TenantSettingsFormDTO, TenantSettingsDTO } from '@/app/admin/tenant-management/types';

export async function createTenantSettingAction(
  data: TenantSettingsFormDTO,
): Promise<TenantSettingsDTO> {
  return createTenantSetting(data);
}
