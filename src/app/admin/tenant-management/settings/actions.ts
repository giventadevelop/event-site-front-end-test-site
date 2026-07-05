'use server';

import {
  patchTenantSetting,
  updateTenantSetting,
  createTenantSetting,
} from '@/app/admin/tenant-management/settings/ApiServerActions';
import type {
  TenantSettingsDTO,
  TenantSettingsFormDTO,
} from '@/app/admin/tenant-management/types';

export async function patchTenantSettingAction(
  id: number,
  data: Partial<TenantSettingsFormDTO>
): Promise<TenantSettingsDTO> {
  return patchTenantSetting(id, data);
}

export async function updateTenantSettingAction(
  settingsId: number,
  data: TenantSettingsFormDTO
): Promise<TenantSettingsDTO> {
  return updateTenantSetting(settingsId, data);
}

export async function createTenantSettingAction(
  data: TenantSettingsFormDTO
): Promise<TenantSettingsDTO> {
  return createTenantSetting(data);
}
