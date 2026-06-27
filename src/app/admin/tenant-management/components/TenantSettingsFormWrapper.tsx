'use client';

import { useRouter } from 'next/navigation';
import TenantSettingsForm from './TenantSettingsForm';
import type { TenantSettingsDTO, TenantSettingsFormDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';

interface TenantSettingsFormWrapperProps {
  initialData?: TenantSettingsDTO;
  onSubmit: (data: TenantSettingsFormDTO) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit';
  settingsId: number;
  organizations?: TenantOrganizationDTO[];
}

export default function TenantSettingsFormWrapper({
  initialData,
  onSubmit,
  loading = false,
  mode,
  settingsId,
  organizations = []
}: TenantSettingsFormWrapperProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push(`/admin/tenant-management/settings/${settingsId}`);
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
    />
  );
}

