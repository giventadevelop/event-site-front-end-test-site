'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantSettingsForm from '@/app/admin/tenant-management/components/TenantSettingsForm';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import { createTenantSettingAction } from '@/app/admin/tenant-management/settings/new/actions';
import type { TenantOrganizationDTO, TenantSettingsFormDTO } from '@/app/admin/tenant-management/types';

interface NewTenantSettingsClientProps {
  organizations: TenantOrganizationDTO[];
  initialTenantId?: string;
}

export default function NewTenantSettingsClient({
  organizations,
  initialTenantId,
}: NewTenantSettingsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  async function handleSubmit(data: TenantSettingsFormDTO) {
    setLoading(true);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we save your settings...');

    try {
      const created = await createTenantSettingAction(data);

      setSaveStatus('success');
      setSaveMessage('Settings saved successfully. Redirecting...');

      const redirectPath =
        created?.id != null
          ? `/admin/tenant-management/settings/${created.id}`
          : '/admin/tenant-management/settings';

      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (error: unknown) {
      setSaveStatus('error');
      const userMessage =
        error instanceof Error
          ? error.message
          : 'Failed to save settings. Please check your input and try again.';
      setSaveMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TenantSettingsForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/tenant-management/settings')}
        loading={loading}
        availableOrganizations={organizations}
        initialData={{
          tenantId: initialTenantId || '',
          allowUserRegistration: true,
          enableWhatsappIntegration: false,
          enableEmailMarketing: false,
          enableGoogleAdsense: false,
          googleAdsensePublisherId: '',
          googleAdsensePlacementsJson: '',
          enableEventManagement: true,
          enablePaymentProcessing: false,
          maxUsers: null,
          maxEvents: null,
          maxStorageGB: null,
          maxApiCallsPerMonth: null,
          customCss: '',
          customJs: '',
          emailProviderConfig: '{}',
        }}
      />

      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        message={saveMessage}
        title={
          saveStatus === 'saving'
            ? 'Saving...'
            : saveStatus === 'success'
              ? 'Saved Successfully!'
              : saveStatus === 'error'
                ? 'Save Failed'
                : undefined
        }
        onClose={() => {
          if (saveStatus === 'error') {
            setSaveStatus('idle');
            setSaveMessage('');
          }
        }}
      />
    </>
  );
}
