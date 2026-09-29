'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantSettingsFormWrapper from '@/app/admin/tenant-management/components/TenantSettingsFormWrapper';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import { formatSaveErrorForDialog } from '@/lib/api/userFacingSaveError';
import { updateTenantSettingAction } from './actions';
import type { TenantSettingsFormDTO, TenantSettingsDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';
import { HOMEPAGE_CACHE_INVALIDATE_CHANNEL } from '@/lib/homepageCacheKeys';
import {
  parseTenantSettingsTab,
  tenantSettingsTabQuery,
  type TenantSettingsTab,
} from '@/lib/tenantSettingsTabs';

interface TenantSettingsEditClientProps {
  settings: TenantSettingsDTO;
  settingsId: number;
  organizations: TenantOrganizationDTO[];
  initialTab?: TenantSettingsTab;
}

export default function TenantSettingsEditClient({
  settings,
  settingsId,
  organizations,
  initialTab = 'general',
}: TenantSettingsEditClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveDetails, setSaveDetails] = useState<string[]>([]);

  async function handleSubmit(data: TenantSettingsFormDTO) {
    setLoading(true);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we save your settings...');

    try {
      await updateTenantSettingAction(settingsId, data);

      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel(HOMEPAGE_CACHE_INVALIDATE_CHANNEL).postMessage('invalidate');
      }

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your settings have been saved successfully. Redirecting to settings details...');

      // Redirect after a brief delay
      setTimeout(() => {
        const tab = parseTenantSettingsTab(
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('tab')
            : initialTab
        );
        router.push(`/admin/tenant-management/settings/${settingsId}${tenantSettingsTabQuery(tab)}`);
      }, 1500);
    } catch (error: unknown) {
      const { summary, details } = formatSaveErrorForDialog(
        error,
        'Failed to update settings. Please try again.'
      );
      setSaveStatus('error');
      setSaveMessage(summary);
      setSaveDetails(details);
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
        initialTab={initialTab}
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
          displayEventHeroImages: settings?.displayEventHeroImages ?? true,
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
        details={saveDetails}
        onClose={() => {
          if (saveStatus === 'error') {
            setSaveStatus('idle');
            setSaveMessage('');
            setSaveDetails([]);
          }
        }}
      />
    </>
  );
}

