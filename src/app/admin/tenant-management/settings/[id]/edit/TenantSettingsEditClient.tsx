'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantSettingsFormWrapper from '@/app/admin/tenant-management/components/TenantSettingsFormWrapper';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import { updateTenantSettingAction } from './actions';
import type { TenantSettingsFormDTO, TenantSettingsDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';

interface TenantSettingsEditClientProps {
  settings: TenantSettingsDTO;
  settingsId: number;
  organizations: TenantOrganizationDTO[];
}

export default function TenantSettingsEditClient({
  settings,
  settingsId,
  organizations
}: TenantSettingsEditClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  async function handleSubmit(data: TenantSettingsFormDTO) {
    setLoading(true);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we save your settings...');

    try {
      await updateTenantSettingAction(settingsId, data);

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your settings have been saved successfully. Redirecting to settings details...');

      // Redirect after a brief delay
      setTimeout(() => {
        router.push(`/admin/tenant-management/settings/${settingsId}`);
      }, 1500);
    } catch (error: any) {
      setSaveStatus('error');
      const userMessage = error?.message || 'Failed to update settings. Please try again.';
      setSaveMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TenantSettingsFormWrapper
        mode="edit"
        onSubmit={handleSubmit}
        settingsId={settingsId}
        organizations={organizations}
        loading={loading}
        initialData={{
          ...settings,
          tenantId: settings?.tenantId || '',
          allowUserRegistration: settings?.allowUserRegistration ?? true,
          requireAdminApproval: settings?.requireAdminApproval ?? false,
          enableWhatsappIntegration: settings?.enableWhatsappIntegration ?? false,
          enableEmailMarketing: settings?.enableEmailMarketing ?? false,
          whatsappApiKey: settings?.whatsappApiKey || '',
          emailProviderConfig: settings?.emailProviderConfig || '{}',
          maxEventsPerMonth: settings?.maxEventsPerMonth || undefined,
          maxAttendeesPerEvent: settings?.maxAttendeesPerEvent || undefined,
          enableGuestRegistration: settings?.enableGuestRegistration ?? true,
          maxGuestsPerAttendee: settings?.maxGuestsPerAttendee || 5,
          defaultEventCapacity: settings?.defaultEventCapacity || 100,
          platformFeePercentage: settings?.platformFeePercentage || undefined,
          customCss: settings?.customCss || '',
          customJs: settings?.customJs || '',
          showEventsSectionInHomePage: settings?.showEventsSectionInHomePage ?? true,
          showTeamMembersSectionInHomePage: settings?.showTeamMembersSectionInHomePage ?? true,
          showSponsorsSectionInHomePage: settings?.showSponsorsSectionInHomePage ?? true,
          isMembershipSubscriptionEnabled: settings?.isMembershipSubscriptionEnabled ?? false,
          emailFooterHtmlUrl: settings?.emailFooterHtmlUrl || '',
          emailHeaderImageUrl: settings?.emailHeaderImageUrl || '',
          logoImageUrl: settings?.logoImageUrl || '',
          defaultHeroImageUrlsJson: settings?.defaultHeroImageUrlsJson || '',
          defaultHeroDisplayMode: settings?.defaultHeroDisplayMode || 'slideshow',
          defaultHeroIncludeWithEvents: settings?.defaultHeroIncludeWithEvents ?? true,
          defaultHeroMaxDisplayCount: settings?.defaultHeroMaxDisplayCount ?? 6,
          // Contact and Address Fields
          description: settings?.description || '',
          addressLine1: settings?.addressLine1 || '',
          addressLine2: settings?.addressLine2 || '',
          city: settings?.city || '',
          phoneNumber: settings?.phoneNumber || '',
          zipCode: settings?.zipCode || '',
          country: settings?.country || '',
          stateProvince: settings?.stateProvince || '',
          email: settings?.email || ''
        }}
      />

      {/* Save Status Dialog */}
      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        message={saveMessage}
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

