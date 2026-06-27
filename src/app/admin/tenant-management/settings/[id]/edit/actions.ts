'use server';

import { updateTenantSetting } from '@/app/admin/tenant-management/settings/ApiServerActions';
import type { TenantSettingsFormDTO } from '@/app/admin/tenant-management/types';

export async function updateTenantSettingAction(settingsId: number, data: TenantSettingsFormDTO) {
  return await updateTenantSetting(settingsId, data);
}







