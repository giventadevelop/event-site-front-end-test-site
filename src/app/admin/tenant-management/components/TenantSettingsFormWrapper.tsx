'use client';

import { useRouter } from 'next/navigation';
import TenantSettingsForm from './TenantSettingsForm';
import type { TenantSettingsDTO, TenantSettingsFormDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';
import {
  parseTenantSettingsTab,
  tenantSettingsTabQuery,
  type TenantSettingsTab,
} from '@/lib/tenantSettingsTabs';

interface TenantSettingsFormWrapperProps {
  initialData?: TenantSettingsDTO;
  onSubmit: (data: TenantSettingsFormDTO) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit';
  settingsId: number;
  organizations?: TenantOrganizationDTO[];
  initialTab?: TenantSettingsTab;
}

export default function TenantSettingsFormWrapper({
  initialData,
  onSubmit,
  loading = false,
  mode,
  settingsId,
  organizations = [],
  initialTab = 'general',
}: TenantSettingsFormWrapperProps) {
  const router = useRouter();

  const handleCancel = () => {
    const tab = parseTenantSettingsTab(
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('tab')
        : initialTab
    );
    router.push(`/admin/tenant-management/settings/${settingsId}${tenantSettingsTabQuery(tab)}`);
  };

  return (
    <TenantSettingsForm
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      loading={loading}
      mode={mode}
      availableOrganizations={organizations}
      settingsId={settingsId}
      initialTab={initialTab}
    />
  );
}
