'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { TenantSettingsDTO, TenantSettingsFormDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';
import {
  uploadEmailFooterHtmlClient,
  uploadTenantLogoClient,
  uploadEmailHeaderImageClient,
} from '@/app/admin/tenant-management/settings/uploadClients';
import { patchTenantSettingAction } from '@/app/admin/tenant-management/settings/actions';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import { formatSaveErrorForDialog } from '@/lib/api/userFacingSaveError';
import TenantDefaultHeroManager from '@/app/admin/tenant-management/components/TenantDefaultHeroManager';
import TenantOrganizationSearchSelect from '@/app/admin/tenant-management/components/TenantOrganizationSearchSelect';
import { stripDeprecatedSettingsIdentityFields } from '@/lib/resolveTenantOrganizationIdentity';
import {
  DEFAULT_HERO_MAX_DISPLAY_COUNT,
  normalizeDefaultHeroDisplayMode,
  normalizeMaxDisplayCount,
  normalizeDefaultHeroImageUrlsJsonForApi,
  type DefaultHeroDisplayMode,
} from '@/lib/hero/defaultHeroImages';
import GoogleAdsensePlacementsFields from '@/app/admin/tenant-management/components/GoogleAdsensePlacementsFields';
import {
  adsensePlacementFieldsFromJson,
  serializeAdsensePlacementFields,
  validateAdsenseSlotId,
  collectAdsensePlacementFieldErrors,
  validateGoogleAdsenseForSave,
  type AdsensePlacementFields,
  type AdsenseRegionId,
} from '@/lib/adsense/parseAdsensePlacements';
import {
  validateWhatsappIntegrationForSave,
  type WhatsappIntegrationField,
} from '@/lib/integrations/validateTenantIntegrationsForSave';

interface TenantSettingsFormProps {
  initialData?: TenantSettingsDTO;
  onSubmit: (data: TenantSettingsFormDTO) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
  availableOrganizations?: TenantOrganizationDTO[];
  settingsId?: number; // Pass settingsId explicitly for uploads
}

export default function TenantSettingsForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode,
  availableOrganizations = [],
  settingsId: propSettingsId
}: TenantSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<
    'general' | 'integrations' | 'limits' | 'homepageHero' | 'customization'
  >('general');
  const [uploadingFooterHtml, setUploadingFooterHtml] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeaderImage, setUploadingHeaderImage] = useState(false);
  const [isDraggingFooterHtml, setIsDraggingFooterHtml] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingHeaderImage, setIsDraggingHeaderImage] = useState(false);
  const [footerHtmlUploadStatus, setFooterHtmlUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [footerHtmlUploadMessage, setFooterHtmlUploadMessage] = useState<string>('');
  const [logoUploadStatus, setLogoUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [logoUploadMessage, setLogoUploadMessage] = useState<string>('');
  const [headerImageUploadStatus, setHeaderImageUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [headerImageUploadMessage, setHeaderImageUploadMessage] = useState<string>('');
  const [heroSaveStatus, setHeroSaveStatus] = useState<SaveStatus>('idle');
  const [formSaveValidationDialog, setFormSaveValidationDialog] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [heroSaveMessage, setHeroSaveMessage] = useState('');
  const [heroSaveDetails, setHeroSaveDetails] = useState<string[]>([]);
  const [adsensePlacements, setAdsensePlacements] = useState<AdsensePlacementFields>(() =>
    adsensePlacementFieldsFromJson(initialData?.googleAdsensePlacementsJson)
  );
  const [adsensePlacementErrors, setAdsensePlacementErrors] = useState<
    Partial<Record<AdsenseRegionId, string>>
  >({});
  const [adsensePlacementsFormError, setAdsensePlacementsFormError] = useState('');
  const footerHtmlFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const headerImageFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
    reset
  } = useForm<TenantSettingsFormDTO>({
    defaultValues: {
      tenantId: initialData?.tenantId || '',
      allowUserRegistration: initialData?.allowUserRegistration ?? true,
      requireAdminApproval: initialData?.requireAdminApproval ?? false,
      enableWhatsappIntegration: initialData?.enableWhatsappIntegration ?? false,
      enableEmailMarketing: initialData?.enableEmailMarketing ?? false,
      enableGoogleAdsense: initialData?.enableGoogleAdsense ?? false,
      googleAdsensePublisherId: initialData?.googleAdsensePublisherId || '',
      googleAdsensePlacementsJson: initialData?.googleAdsensePlacementsJson || '',
      whatsappApiKey: initialData?.whatsappApiKey || '',
      emailProviderConfig: initialData?.emailProviderConfig || '',
      maxEventsPerMonth: initialData?.maxEventsPerMonth || undefined,
      maxAttendeesPerEvent: initialData?.maxAttendeesPerEvent || undefined,
      enableGuestRegistration: initialData?.enableGuestRegistration ?? true,
      maxGuestsPerAttendee: initialData?.maxGuestsPerAttendee || 5,
      defaultEventCapacity: initialData?.defaultEventCapacity || 100,
      platformFeePercentage: initialData?.platformFeePercentage || undefined,
      customCss: initialData?.customCss || '',
      customJs: initialData?.customJs || '',
      showEventsSectionInHomePage: initialData?.showEventsSectionInHomePage ?? true,
      showTeamMembersSectionInHomePage: initialData?.showTeamMembersSectionInHomePage ?? true,
      showSponsorsSectionInHomePage: initialData?.showSponsorsSectionInHomePage ?? true,
      isMembershipSubscriptionEnabled: initialData?.isMembershipSubscriptionEnabled ?? false,
      // Personal profile homepage sections (PERSONAL_PROFILE / HYBRID site types)
      showPublicProfileHeroSection: initialData?.showPublicProfileHeroSection ?? false,
      showProfileWritingsSection: initialData?.showProfileWritingsSection ?? false,
      showProfileAchievementsSection: initialData?.showProfileAchievementsSection ?? false,
      showProfileAffiliationsSection: initialData?.showProfileAffiliationsSection ?? false,
      showProfileMediaDownloadsSection: initialData?.showProfileMediaDownloadsSection ?? false,
      showProfileContactSection: initialData?.showProfileContactSection ?? false,
      // Gas station COO module (GAS_STATION site type)
      enableGasStationModule: initialData?.enableGasStationModule ?? false,
      gasAiEngineBaseUrl: initialData?.gasAiEngineBaseUrl || '',
      gasAiEngineApiKeyRef: initialData?.gasAiEngineApiKeyRef || '',
      gasAiEngineWebhookToken: initialData?.gasAiEngineWebhookToken || '',
      gasDailyBriefHourLocal: initialData?.gasDailyBriefHourLocal ?? undefined,
      // Enhanced WhatsApp Integration Fields
      whatsappPhoneNumber: initialData?.whatsappPhoneNumber || '',
      twilioAccountSid: initialData?.twilioAccountSid || '',
      twilioAuthToken: initialData?.twilioAuthToken || '',
      enableWhatsappNotifications: initialData?.enableWhatsappNotifications ?? false,
      enableWhatsappMarketing: initialData?.enableWhatsappMarketing ?? false,
      whatsappDefaultTemplate: initialData?.whatsappDefaultTemplate || '',
      whatsappMaxMessagesPerDay: initialData?.whatsappMaxMessagesPerDay || 1000,
      whatsappRateLimit: initialData?.whatsappRateLimit || 10,
      whatsappWebhookUrl: initialData?.whatsappWebhookUrl || '',
      whatsappWebhookToken: initialData?.whatsappWebhookToken || '',
      emailFooterHtmlUrl: initialData?.emailFooterHtmlUrl || '',
      emailHeaderImageUrl: initialData?.emailHeaderImageUrl || '',
      logoImageUrl: initialData?.logoImageUrl || '',
      defaultHeroImageUrlsJson: initialData?.defaultHeroImageUrlsJson || '',
      defaultHeroDisplayMode: normalizeDefaultHeroDisplayMode(initialData?.defaultHeroDisplayMode),
      defaultHeroIncludeWithEvents: initialData?.defaultHeroIncludeWithEvents ?? true,
      defaultHeroMaxDisplayCount:
        initialData?.defaultHeroMaxDisplayCount ?? DEFAULT_HERO_MAX_DISPLAY_COUNT,
      displayEventHeroImages: initialData?.displayEventHeroImages ?? true,
      // Operational contact (identity fields live on tenant_organization)
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      // Social media URLs (Follow our journey)
      facebookUrl: initialData?.facebookUrl || '',
      instagramUrl: initialData?.instagramUrl || '',
      twitterUrl: initialData?.twitterUrl || '',
      linkedinUrl: initialData?.linkedinUrl || '',
      youtubeUrl: initialData?.youtubeUrl || '',
      tiktokUrl: initialData?.tiktokUrl || ''
    }
  });

  register('defaultHeroDisplayMode');
  register('defaultHeroIncludeWithEvents');
  register('defaultHeroMaxDisplayCount');
  register('displayEventHeroImages');

  // Get settings ID from prop or initialData (for edit mode)
  const settingsId = propSettingsId || initialData?.id;

  // Watch form values for real-time updates
  const watchedValues = watch();
  const emailFooterHtmlUrl = watch('emailFooterHtmlUrl');
  const emailHeaderImageUrl = watch('emailHeaderImageUrl');
  const logoImageUrl = watch('logoImageUrl');
  const defaultHeroImageUrlsJson = watch('defaultHeroImageUrlsJson');
  const defaultHeroDisplayMode = watch('defaultHeroDisplayMode');
  const defaultHeroIncludeWithEvents = watch('defaultHeroIncludeWithEvents');
  const defaultHeroMaxDisplayCount = watch('defaultHeroMaxDisplayCount');
  const displayEventHeroImages = watch('displayEventHeroImages');
  const tenantIdForUpload =
    watch('tenantId')?.trim() || initialData?.tenantId?.trim() || undefined;

  useEffect(() => {
    setAdsensePlacements(adsensePlacementFieldsFromJson(initialData?.googleAdsensePlacementsJson));
    setAdsensePlacementErrors({});
    setAdsensePlacementsFormError('');
  }, [initialData?.id, initialData?.googleAdsensePlacementsJson]);

  const persistHeroSlides = async (json: string) => {
    if (!settingsId) return;
    setValue('defaultHeroImageUrlsJson', json);
    const maxCount = normalizeMaxDisplayCount(
      defaultHeroMaxDisplayCount ?? DEFAULT_HERO_MAX_DISPLAY_COUNT
    );
    try {
      setHeroSaveStatus('saving');
      setHeroSaveMessage('Saving homepage hero slides...');
      setHeroSaveDetails([]);
      await patchTenantSettingAction(settingsId, {
        defaultHeroImageUrlsJson: json,
        defaultHeroMaxDisplayCount: maxCount,
      });
      setHeroSaveStatus('success');
      setHeroSaveMessage('Homepage hero slides saved.');
      setTimeout(() => {
        setHeroSaveStatus('idle');
        setHeroSaveMessage('');
        setHeroSaveDetails([]);
      }, 1500);
    } catch (err: unknown) {
      const { summary, details } = formatSaveErrorForDialog(
        err,
        'Failed to save homepage hero slides.'
      );
      setHeroSaveStatus('error');
      setHeroSaveMessage(summary);
      setHeroSaveDetails(details);
      throw err;
    }
  };

  const handleMaxDisplayCountChange = async (count: number) => {
    const normalized = normalizeMaxDisplayCount(count);
    setValue('defaultHeroMaxDisplayCount', normalized);
    if (settingsId) {
      await patchTenantSettingAction(settingsId, { defaultHeroMaxDisplayCount: normalized });
    }
  };

  const validateAdsensePlacementFields = (fields: AdsensePlacementFields): boolean => {
    const nextErrors = collectAdsensePlacementFieldErrors(fields);
    setAdsensePlacementErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const showIntegrationSaveValidationError = (summary: string, details: string[]) => {
    setFormSaveValidationDialog({ message: summary, details });
  };

  const handleAdsensePlacementBlur = (regionId: AdsenseRegionId) => {
    const result = validateAdsenseSlotId(adsensePlacements[regionId]);
    setAdsensePlacementErrors((prev) => {
      const next = { ...prev };
      if (result === true) {
        delete next[regionId];
      } else {
        next[regionId] = result;
      }
      return next;
    });
  };

  // Handle form submission
  const onFormSubmit = async (data: TenantSettingsFormDTO) => {
    try {
      const whatsappValidation = validateWhatsappIntegrationForSave({
        enableWhatsappIntegration: data.enableWhatsappIntegration,
        whatsappPhoneNumber: data.whatsappPhoneNumber,
        twilioAccountSid: data.twilioAccountSid,
        twilioAuthToken: data.twilioAuthToken,
      });
      if (!whatsappValidation.valid) {
        setActiveTab('integrations');
        for (const [field, message] of Object.entries(whatsappValidation.fieldErrors)) {
          setError(field as WhatsappIntegrationField, { type: 'manual', message });
        }
        showIntegrationSaveValidationError(whatsappValidation.summary, whatsappValidation.details);
        return;
      }

      const adsenseValidation = validateGoogleAdsenseForSave(
        Boolean(data.enableGoogleAdsense),
        data.googleAdsensePublisherId,
        adsensePlacements
      );
      if (!adsenseValidation.valid) {
        setActiveTab('integrations');
        if (adsenseValidation.field === 'googleAdsensePublisherId') {
          setError('googleAdsensePublisherId', {
            type: 'manual',
            message: adsenseValidation.details[0] ?? adsenseValidation.summary,
          });
          setAdsensePlacementsFormError('');
        } else {
          validateAdsensePlacementFields(adsensePlacements);
          setAdsensePlacementsFormError(adsenseValidation.summary);
        }
        showIntegrationSaveValidationError(adsenseValidation.summary, adsenseValidation.details);
        return;
      }

      const placementsJson = serializeAdsensePlacementFields(adsensePlacements);
      if (placementsJson.length > 8192) {
        setActiveTab('integrations');
        setAdsensePlacementsFormError('Combined placements exceed the maximum allowed size.');
        showIntegrationSaveValidationError('Ad placement configuration is too large.', [
          'Remove unused slot IDs or shorten values, then try again.',
        ]);
        return;
      }
      setAdsensePlacementsFormError('');

      const payload = stripDeprecatedSettingsIdentityFields(data) as TenantSettingsFormDTO;
      payload.defaultHeroImageUrlsJson = normalizeDefaultHeroImageUrlsJsonForApi(
        payload.defaultHeroImageUrlsJson
      );
      payload.googleAdsensePlacementsJson = placementsJson;
      if (!payload.enableGoogleAdsense) {
        payload.googleAdsensePublisherId = '';
        payload.googleAdsensePlacementsJson = '';
      }
      if (!payload.enableWhatsappIntegration) {
        payload.whatsappPhoneNumber = '';
        payload.twilioAccountSid = '';
        payload.twilioAuthToken = '';
      }
      await onSubmit(payload);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  };

  // Process email footer HTML upload
  const processFooterHtmlUpload = async (file: File) => {
    if (!file || !settingsId) return;

    setUploadingFooterHtml(true);
    setFooterHtmlUploadStatus('uploading');
    setFooterHtmlUploadMessage('Uploading email footer HTML file...');

    try {
      const result = await uploadEmailFooterHtmlClient(file);

      setValue('emailFooterHtmlUrl', result.url);

      // Automatically update the settings with the new URL
      if (settingsId) {
        await patchTenantSettingAction(settingsId, {
          emailFooterHtmlUrl: result.url,
        });
      }

      setFooterHtmlUploadStatus('success');
      setFooterHtmlUploadMessage('Email footer HTML uploaded and saved successfully!');

      // Auto-close success dialog after 2 seconds
      setTimeout(() => {
        setFooterHtmlUploadStatus('idle');
        setFooterHtmlUploadMessage('');
      }, 2000);
    } catch (err: unknown) {
      setFooterHtmlUploadStatus('error');
      setFooterHtmlUploadMessage(
        formatSaveErrorForDialog(err, 'Failed to upload email footer HTML').summary
      );
    } finally {
      setUploadingFooterHtml(false);
      if (footerHtmlFileInputRef.current) {
        footerHtmlFileInputRef.current.value = '';
      }
    }
  };

  // Process email header image upload
  const processHeaderImageUpload = async (file: File) => {
    if (!file || !settingsId) return;

    setUploadingHeaderImage(true);
    setHeaderImageUploadStatus('uploading');
    setHeaderImageUploadMessage('Uploading email header image...');

    try {
      const result = await uploadEmailHeaderImageClient(file);

      setValue('emailHeaderImageUrl', result.url);

      // Automatically update the settings with the new URL
      if (settingsId) {
        await patchTenantSettingAction(settingsId, {
          emailHeaderImageUrl: result.url,
        });
      }

      setHeaderImageUploadStatus('success');
      setHeaderImageUploadMessage('Email header image uploaded and saved successfully!');

      // Auto-close success dialog after 2 seconds
      setTimeout(() => {
        setHeaderImageUploadStatus('idle');
        setHeaderImageUploadMessage('');
      }, 2000);
    } catch (err: unknown) {
      setHeaderImageUploadStatus('error');
      setHeaderImageUploadMessage(
        formatSaveErrorForDialog(err, 'Failed to upload email header image').summary
      );
    } finally {
      setUploadingHeaderImage(false);
      if (headerImageFileInputRef.current) {
        headerImageFileInputRef.current.value = '';
      }
    }
  };

  // Process tenant logo upload
  const processLogoUpload = async (file: File) => {
    if (!file || !settingsId) return;

    setUploadingLogo(true);
    setLogoUploadStatus('uploading');
    setLogoUploadMessage('Uploading logo image...');

    try {
      const result = await uploadTenantLogoClient(file);

      setValue('logoImageUrl', result.url);

      // Automatically update the settings with the new URL
      if (settingsId) {
        await patchTenantSettingAction(settingsId, {
          logoImageUrl: result.url,
        });
      }

      setLogoUploadStatus('success');
      setLogoUploadMessage('Logo image uploaded and saved successfully!');

      // Auto-close success dialog after 2 seconds
      setTimeout(() => {
        setLogoUploadStatus('idle');
        setLogoUploadMessage('');
      }, 2000);
    } catch (err: unknown) {
      setLogoUploadStatus('error');
      setLogoUploadMessage(formatSaveErrorForDialog(err, 'Failed to upload logo image').summary);
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  // Footer HTML upload handlers
  const handleFooterHtmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFooterHtmlUpload(file);
    }
  };

  const handleFooterHtmlDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingFooterHtml && settingsId) {
      setIsDraggingFooterHtml(true);
    }
  };

  const handleFooterHtmlDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFooterHtml(false);
  };

  const handleFooterHtmlDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFooterHtml(false);

    if (uploadingFooterHtml || !settingsId) return;

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/html' || file.name.endsWith('.html'))) {
      await processFooterHtmlUpload(file);
    } else {
      setFooterHtmlUploadStatus('error');
      setFooterHtmlUploadMessage('Please drop a valid HTML file');
    }
  };

  // Header image upload handlers
  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processHeaderImageUpload(file);
    }
  };

  const handleHeaderImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingHeaderImage && settingsId) {
      setIsDraggingHeaderImage(true);
    }
  };

  const handleHeaderImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeaderImage(false);
  };

  const handleHeaderImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeaderImage(false);

    if (uploadingHeaderImage || !settingsId) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processHeaderImageUpload(file);
    } else {
      setHeaderImageUploadStatus('error');
      setHeaderImageUploadMessage('Please drop a valid image file');
    }
  };

  // Logo upload handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processLogoUpload(file);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingLogo && settingsId) {
      setIsDraggingLogo(true);
    }
  };

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(false);
  };

  const handleLogoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(false);

    if (uploadingLogo || !settingsId) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processLogoUpload(file);
    } else {
      setLogoUploadStatus('error');
      setLogoUploadMessage('Please drop a valid image file');
    }
  };

  // Remove handlers
  const handleRemoveFooterHtml = async () => {
    if (!settingsId) return;
    setValue('emailFooterHtmlUrl', '');
    setFooterHtmlUploadStatus('uploading');
    setFooterHtmlUploadMessage('Removing email footer HTML...');
    try {
      await patchTenantSettingAction(settingsId, {
        emailFooterHtmlUrl: '',
      });
      setFooterHtmlUploadStatus('success');
      setFooterHtmlUploadMessage('Email footer HTML removed successfully!');
      setTimeout(() => {
        setFooterHtmlUploadStatus('idle');
        setFooterHtmlUploadMessage('');
      }, 2000);
    } catch (err: unknown) {
      setFooterHtmlUploadStatus('error');
      setFooterHtmlUploadMessage(
        formatSaveErrorForDialog(err, 'Failed to remove email footer HTML').summary
      );
    }
  };

  const handleRemoveLogo = async () => {
    if (!settingsId) return;
    setValue('logoImageUrl', '');
    setLogoUploadStatus('uploading');
    setLogoUploadMessage('Removing logo image...');
    try {
      await patchTenantSettingAction(settingsId, {
        logoImageUrl: '',
      });
      setLogoUploadStatus('success');
      setLogoUploadMessage('Logo image removed successfully!');
      setTimeout(() => {
        setLogoUploadStatus('idle');
        setLogoUploadMessage('');
      }, 2000);
    } catch (err: unknown) {
      setLogoUploadStatus('error');
      setLogoUploadMessage(formatSaveErrorForDialog(err, 'Failed to remove logo image').summary);
    }
  };

  const handleRemoveHeaderImage = async () => {
    if (!settingsId) return;
    setValue('emailHeaderImageUrl', '');
    setHeaderImageUploadStatus('uploading');
    setHeaderImageUploadMessage('Removing email header image...');
    try {
      await patchTenantSettingAction(settingsId, {
        emailHeaderImageUrl: '',
      });
      setHeaderImageUploadStatus('success');
      setHeaderImageUploadMessage('Email header image removed successfully!');
      setTimeout(() => {
        setHeaderImageUploadStatus('idle');
        setHeaderImageUploadMessage('');
      }, 2000);
    } catch (err: unknown) {
      setHeaderImageUploadStatus('error');
      setHeaderImageUploadMessage(
        formatSaveErrorForDialog(err, 'Failed to remove email header image').summary
      );
    }
  };

  // Toggle switch component
  const ToggleSwitch = ({
    name,
    label,
    description,
    checked,
    onChange
  }: {
    name: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );

  // Tab navigation with colorful icons
  const tabs = [
    { 
      id: 'general', 
      label: 'General', 
      icon: 'cog', 
      color: 'blue',
      svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      icon: 'code', 
      color: 'green',
      svgPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    },
    { 
      id: 'limits', 
      label: 'Limits', 
      icon: 'chart', 
      color: 'purple',
      svgPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      id: 'homepageHero',
      label: 'Homepage Hero',
      icon: 'photo',
      color: 'teal',
      svgPath:
        'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    { 
      id: 'customization', 
      label: 'Customization', 
      icon: 'paint', 
      color: 'orange',
      svgPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tab Navigation */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <nav className="flex flex-wrap gap-2 w-full" aria-label="Settings sections">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const getColorClasses = (color: string) => {
              if (color === 'blue') {
                return {
                  active: 'bg-blue-100 text-blue-600 border-blue-500 ring-1 ring-blue-200',
                  inactive: 'bg-white text-blue-400 border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300',
                  iconBgActive: 'bg-blue-100',
                  iconBgInactive: 'bg-blue-50',
                  iconTextActive: 'text-blue-500',
                  iconTextInactive: 'text-blue-400',
                  textActive: 'text-blue-700',
                  textInactive: 'text-blue-500'
                };
              } else if (color === 'green') {
                return {
                  active: 'bg-green-100 text-green-600 border-green-500 ring-1 ring-green-200',
                  inactive: 'bg-white text-green-400 border-gray-200 hover:bg-green-50 hover:text-green-500 hover:border-green-300',
                  iconBgActive: 'bg-green-100',
                  iconBgInactive: 'bg-green-50',
                  iconTextActive: 'text-green-500',
                  iconTextInactive: 'text-green-400',
                  textActive: 'text-green-700',
                  textInactive: 'text-green-500'
                };
              } else if (color === 'purple') {
                return {
                  active: 'bg-purple-100 text-purple-600 border-purple-500 ring-1 ring-purple-200',
                  inactive: 'bg-white text-purple-400 border-gray-200 hover:bg-purple-50 hover:text-purple-500 hover:border-purple-300',
                  iconBgActive: 'bg-purple-100',
                  iconBgInactive: 'bg-purple-50',
                  iconTextActive: 'text-purple-500',
                  iconTextInactive: 'text-purple-400',
                  textActive: 'text-purple-700',
                  textInactive: 'text-purple-500'
                };
              } else if (color === 'teal') {
                return {
                  active: 'bg-teal-100 text-teal-600 border-teal-500 ring-1 ring-teal-200',
                  inactive: 'bg-white text-teal-400 border-gray-200 hover:bg-teal-50 hover:text-teal-500 hover:border-teal-300',
                  iconBgActive: 'bg-teal-100',
                  iconBgInactive: 'bg-teal-50',
                  iconTextActive: 'text-teal-500',
                  iconTextInactive: 'text-teal-400',
                  textActive: 'text-teal-700',
                  textInactive: 'text-teal-500',
                };
              } else {
                return {
                  active: 'bg-orange-100 text-orange-600 border-orange-500 ring-1 ring-orange-200',
                  inactive: 'bg-white text-orange-400 border-gray-200 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300',
                  iconBgActive: 'bg-orange-100',
                  iconBgInactive: 'bg-orange-50',
                  iconTextActive: 'text-orange-500',
                  iconTextInactive: 'text-orange-400',
                  textActive: 'text-orange-700',
                  textInactive: 'text-orange-500'
                };
              }
            };
            const colors = getColorClasses(tab.color);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3 sm:px-4 border-2 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3 rounded-lg transition-all duration-300 flex-[1_1_11rem] sm:flex-[1_1_auto] min-w-[11rem] max-w-full ${
                  isActive ? colors.active : colors.inactive
                }`}
              >
                <div className={`flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                } ${isActive ? colors.iconBgActive : colors.iconBgInactive}`}>
                  <svg className={`w-8 h-8 sm:w-10 sm:h-10 ${isActive ? colors.iconTextActive : colors.iconTextInactive}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.svgPath} />
                  </svg>
                </div>
                <span className={`whitespace-nowrap ${isActive ? colors.textActive : colors.textInactive}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Organization description, mailing address, and website are managed under{' '}
              <strong>Tenant Organization → Edit</strong>, not tenant settings.
            </div>

            {/* Tenant Selection (for create mode) */}
            {mode === 'create' && (
              <div>
                <input
                  type="hidden"
                  {...register('tenantId', { required: 'Please select a tenant organization' })}
                />
                <TenantOrganizationSearchSelect
                  value={watch('tenantId') || ''}
                  onChange={(tenantId) =>
                    setValue('tenantId', tenantId, { shouldValidate: true, shouldDirty: true })
                  }
                  initialOrganizations={availableOrganizations}
                  error={errors.tenantId?.message}
                />
              </div>
            )}

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Contact Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="contact@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber', {
                    maxLength: {
                      value: 50,
                      message: 'Phone number must be 50 characters or less'
                    }
                  })}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Social Media URLs (Follow our journey) */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Social Media URLs</h4>
              <p className="text-sm text-gray-600">Organization links for Follow our journey. Leave blank to hide the icon on the site.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                  <input type="url" {...register('facebookUrl', { maxLength: { value: 1024, message: 'Max 1024 characters' } })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                  <input type="url" {...register('instagramUrl', { maxLength: { value: 1024, message: 'Max 1024 characters' } })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">X (Twitter) URL</label>
                  <input type="url" {...register('twitterUrl', { maxLength: { value: 1024, message: 'Max 1024 characters' } })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base" placeholder="https://x.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                  <input type="url" {...register('linkedinUrl', { maxLength: { value: 1024, message: 'Max 1024 characters' } })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base" placeholder="https://linkedin.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                  <input type="url" {...register('youtubeUrl', { maxLength: { value: 1024, message: 'Max 1024 characters' } })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base" placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok URL</label>
                  <input type="url" {...register('tiktokUrl', { maxLength: { value: 1024, message: 'Max 1024 characters' } })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base" placeholder="https://tiktok.com/..." />
                </div>
              </div>
            </div>

            {/* User Registration Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">User Registration</h4>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="allowUserRegistration"
                  label="Allow User Registration"
                  description="Enable users to register themselves on the platform"
                  checked={watchedValues.allowUserRegistration || false}
                  onChange={(checked) => setValue('allowUserRegistration', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="requireAdminApproval"
                  label="Require Admin Approval"
                  description="New user registrations must be approved by an admin"
                  checked={watchedValues.requireAdminApproval || false}
                  onChange={(checked) => setValue('requireAdminApproval', checked)}
                />
              </div>
            </div>

            {/* Guest Registration Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Guest Registration</h4>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="enableGuestRegistration"
                  label="Enable Guest Registration"
                  description="Allow attendees to bring guests to events"
                  checked={watchedValues.enableGuestRegistration || false}
                  onChange={(checked) => setValue('enableGuestRegistration', checked)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests Per Attendee
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  {...register('maxGuestsPerAttendee', {
                    min: { value: 0, message: 'Must be at least 0' },
                    max: { value: 20, message: 'Must be at most 20' }
                  })}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
                {errors.maxGuestsPerAttendee && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxGuestsPerAttendee.message}</p>
                )}
              </div>
            </div>

            {/* Homepage Display Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Homepage Display Settings</h4>
              <p className="text-sm text-gray-600">Control which sections are displayed on the homepage</p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showEventsSectionInHomePage"
                  label="Show Events Section"
                  description="Display the events section on the homepage"
                  checked={watchedValues.showEventsSectionInHomePage || false}
                  onChange={(checked) => setValue('showEventsSectionInHomePage', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showTeamMembersSectionInHomePage"
                  label="Show Team Members Section"
                  description="Display the team members section on the homepage"
                  checked={watchedValues.showTeamMembersSectionInHomePage || false}
                  onChange={(checked) => setValue('showTeamMembersSectionInHomePage', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showSponsorsSectionInHomePage"
                  label="Show Sponsors Section"
                  description="Display the sponsors section on the homepage"
                  checked={watchedValues.showSponsorsSectionInHomePage || false}
                  onChange={(checked) => setValue('showSponsorsSectionInHomePage', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="isMembershipSubscriptionEnabled"
                  label="Enable Membership Subscription"
                  description="Enable membership subscription functionality"
                  checked={watchedValues.isMembershipSubscriptionEnabled || false}
                  onChange={(checked) => setValue('isMembershipSubscriptionEnabled', checked)}
                />
              </div>
            </div>

            {/* Personal Profile Homepage Sections */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Personal Profile Sections</h4>
              <p className="text-sm text-gray-600">
                Homepage sections for Personal Profile / Hybrid site types (auto-set by the organization&apos;s Site Type preset)
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showPublicProfileHeroSection"
                  label="Show Profile Hero Section"
                  description="Display the personal profile hero on the homepage"
                  checked={watchedValues.showPublicProfileHeroSection || false}
                  onChange={(checked) => setValue('showPublicProfileHeroSection', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showProfileWritingsSection"
                  label="Show Writings Section"
                  description="Display the writings / portfolio section"
                  checked={watchedValues.showProfileWritingsSection || false}
                  onChange={(checked) => setValue('showProfileWritingsSection', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showProfileAchievementsSection"
                  label="Show Achievements Section"
                  description="Display the achievements timeline section"
                  checked={watchedValues.showProfileAchievementsSection || false}
                  onChange={(checked) => setValue('showProfileAchievementsSection', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showProfileAffiliationsSection"
                  label="Show Affiliations Section"
                  description="Display the community / board affiliations section"
                  checked={watchedValues.showProfileAffiliationsSection || false}
                  onChange={(checked) => setValue('showProfileAffiliationsSection', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showProfileMediaDownloadsSection"
                  label="Show Media Downloads Section"
                  description="Display the downloadable media / documents section"
                  checked={watchedValues.showProfileMediaDownloadsSection || false}
                  onChange={(checked) => setValue('showProfileMediaDownloadsSection', checked)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="showProfileContactSection"
                  label="Show Profile Contact Section"
                  description="Display the profile contact section"
                  checked={watchedValues.showProfileContactSection || false}
                  onChange={(checked) => setValue('showProfileContactSection', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>

            {/* Gas Station AI Engine (GAS_STATION site type) */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <span className="mr-2">⛽</span>
                      Gas Station AI Engine
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable the gas station COO module and connect the external AI engine (GAS_STATION site type)
                    </p>
                  </div>
                  <a
                    href="/admin/gas-station"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Gas Station Dashboard →
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="enableGasStationModule"
                  label="Enable Gas Station Module"
                  description="Show the gas station COO admin module for this tenant"
                  checked={watchedValues.enableGasStationModule || false}
                  onChange={(checked) => setValue('enableGasStationModule', checked)}
                />
              </div>

              {watchedValues.enableGasStationModule && (
                <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Engine Base URL
                    </label>
                    <input
                      type="url"
                      {...register('gasAiEngineBaseUrl', {
                        maxLength: { value: 1024, message: 'Base URL must be 1024 characters or less' }
                      })}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="https://engine.example.com"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Invoked server-side only; never exposed to the browser
                    </p>
                    {errors.gasAiEngineBaseUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.gasAiEngineBaseUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key Reference
                    </label>
                    <input
                      type="text"
                      {...register('gasAiEngineApiKeyRef', {
                        maxLength: { value: 512, message: 'API key reference must be 512 characters or less' }
                      })}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="secrets-manager reference, e.g. arn:aws:secretsmanager:..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Secrets-manager reference only — never paste the raw API key
                    </p>
                    {errors.gasAiEngineApiKeyRef && (
                      <p className="mt-1 text-sm text-red-600">{errors.gasAiEngineApiKeyRef.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook Token
                    </label>
                    <input
                      type="password"
                      {...register('gasAiEngineWebhookToken', {
                        maxLength: { value: 1048, message: 'Webhook token must be 1048 characters or less' }
                      })}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="Token the engine presents on write-back callbacks"
                    />
                    {errors.gasAiEngineWebhookToken && (
                      <p className="mt-1 text-sm text-red-600">{errors.gasAiEngineWebhookToken.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Brief Hour (local)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      {...register('gasDailyBriefHourLocal', {
                        min: { value: 0, message: 'Hour must be between 0 and 23' },
                        max: { value: 23, message: 'Hour must be between 0 and 23' },
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="6"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Hour (0–23) the morning brief is expected; interpreted per station timezone
                    </p>
                    {errors.gasDailyBriefHourLocal && (
                      <p className="mt-1 text-sm text-red-600">{errors.gasDailyBriefHourLocal.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Integration */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <span className="mr-2">📱</span>
                      WhatsApp Integration
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure WhatsApp Business API integration for automated messaging
                    </p>
                  </div>
                  <a
                    href="/admin/whatsapp-settings"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Advanced Settings →
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="enableWhatsappIntegration"
                  label="Enable WhatsApp Integration"
                  description="Allow sending notifications via WhatsApp"
                  checked={watchedValues.enableWhatsappIntegration || false}
                  onChange={(checked) => setValue('enableWhatsappIntegration', checked)}
                />
              </div>

              {watchedValues.enableWhatsappIntegration && (
                <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
                  {/* Basic Configuration */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-900">Basic Configuration</h5>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Business Phone Number
                      </label>
                      <input
                        type="text"
                        {...register('whatsappPhoneNumber', {
                          validate: (value) => {
                            if (!watch('enableWhatsappIntegration')) {
                              return true;
                            }
                            const trimmed = value?.trim() ?? '';
                            if (!trimmed) {
                              return 'Phone number is required when WhatsApp Integration is enabled';
                            }
                            if (!/^\+[1-9]\d{1,14}$/.test(trimmed)) {
                              return 'Please enter a valid international phone number (e.g., +1234567890)';
                            }
                            return true;
                          },
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="+1234567890"
                      />
                      {errors.whatsappPhoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsappPhoneNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twilio Account SID
                      </label>
                      <input
                        type="text"
                        {...register('twilioAccountSid', {
                          validate: (value) => {
                            if (!watch('enableWhatsappIntegration')) {
                              return true;
                            }
                            const trimmed = value?.trim() ?? '';
                            if (!trimmed) {
                              return 'Account SID is required when WhatsApp Integration is enabled';
                            }
                            if (!/^AC[a-f0-9]{32}$/.test(trimmed)) {
                              return 'Please enter a valid Twilio Account SID';
                            }
                            return true;
                          },
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                      {errors.twilioAccountSid && (
                        <p className="mt-1 text-sm text-red-600">{errors.twilioAccountSid.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twilio Auth Token
                      </label>
                      <input
                        type="password"
                        {...register('twilioAuthToken', {
                          validate: (value) => {
                            if (!watch('enableWhatsappIntegration')) {
                              return true;
                            }
                            const trimmed = value?.trim() ?? '';
                            if (!trimmed) {
                              return 'Auth Token is required when WhatsApp Integration is enabled';
                            }
                            if (trimmed.length < 32) {
                              return 'Auth Token must be at least 32 characters';
                            }
                            return true;
                          },
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="Enter your Twilio Auth Token"
                      />
                      {errors.twilioAuthToken && (
                        <p className="mt-1 text-sm text-red-600">{errors.twilioAuthToken.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message Settings */}
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <h5 className="text-sm font-medium text-gray-900">Message Settings</h5>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ToggleSwitch
                        name="enableWhatsappNotifications"
                        label="Enable WhatsApp Notifications"
                        description="Send automated notifications for events, payments, and updates"
                        checked={watchedValues.enableWhatsappNotifications || false}
                        onChange={(checked) => setValue('enableWhatsappNotifications', checked)}
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ToggleSwitch
                        name="enableWhatsappMarketing"
                        label="Enable WhatsApp Marketing"
                        description="Allow sending marketing messages and promotional content"
                        checked={watchedValues.enableWhatsappMarketing || false}
                        onChange={(checked) => setValue('enableWhatsappMarketing', checked)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Message Template
                      </label>
                      <select
                        {...register('whatsappDefaultTemplate')}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      >
                        <option value="">Select a template</option>
                        <option value="welcome_template">Welcome Template</option>
                        <option value="event_reminder">Event Reminder</option>
                        <option value="payment_confirmation">Payment Confirmation</option>
                        <option value="ticket_confirmation">Ticket Confirmation</option>
                      </select>
                      {errors.whatsappDefaultTemplate && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsappDefaultTemplate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Settings */}
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <h5 className="text-sm font-medium text-gray-900">Delivery Settings</h5>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Messages Per Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        {...register('whatsappMaxMessagesPerDay', {
                          min: { value: 1, message: 'Must be at least 1' },
                          max: { value: 10000, message: 'Must be at most 10,000' }
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="1000"
                      />
                      {errors.whatsappMaxMessagesPerDay && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsappMaxMessagesPerDay.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Set a daily limit to control costs and prevent abuse
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Rate Limit (per minute)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        {...register('whatsappRateLimit', {
                          min: { value: 1, message: 'Must be at least 1' },
                          max: { value: 100, message: 'Must be at most 100' }
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="10"
                      />
                      {errors.whatsappRateLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsappRateLimit.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum number of messages that can be sent per minute
                      </p>
                    </div>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <h5 className="text-sm font-medium text-gray-900">Webhook Configuration</h5>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        {...register('whatsappWebhookUrl', {
                          pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'Please enter a valid webhook URL'
                          }
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="https://yourdomain.com/api/webhooks/whatsapp"
                      />
                      {errors.whatsappWebhookUrl && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsappWebhookUrl.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Token
                      </label>
                      <input
                        type="password"
                        {...register('whatsappWebhookToken', {
                          minLength: {
                            value: 16,
                            message: 'Webhook token must be at least 16 characters'
                          }
                        })}
                        className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                        placeholder="Enter webhook verification token"
                      />
                      {errors.whatsappWebhookToken && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsappWebhookToken.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Quick Actions</h5>
                        <p className="text-xs text-gray-600 mt-1">
                          Test your configuration or access advanced settings
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            // Test connection functionality would be implemented here
                            alert('Test connection functionality will be implemented');
                          }}
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="Test Connection"
                          aria-label="Test Connection"
                        >
                          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                        <a
                          href="/admin/whatsapp-settings"
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="Advanced Settings"
                          aria-label="Advanced Settings"
                        >
                          <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Marketing Integration */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Email Marketing</h4>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="enableEmailMarketing"
                  label="Enable Email Marketing"
                  description="Allow sending promotional emails to users"
                  checked={watchedValues.enableEmailMarketing || false}
                  onChange={(checked) => setValue('enableEmailMarketing', checked)}
                />
              </div>

              {watchedValues.enableEmailMarketing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Provider Configuration (JSON)
                  </label>
                  <textarea
                    {...register('emailProviderConfig', {
                      maxLength: {
                        value: 2048,
                        message: 'Configuration must be less than 2048 characters'
                      }
                    })}
                    rows={6}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm"
                    placeholder='{"provider": "sendgrid", "apiKey": "your-api-key", "fromEmail": "noreply@example.com"}'
                  />
                  {errors.emailProviderConfig && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailProviderConfig.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Google AdSense Integration */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <span className="mr-2">📢</span>
                  Google AdSense
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Enable programmatic ad regions on this tenant&apos;s satellite site. Each region maps to an AdSense ad unit slot ID.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ToggleSwitch
                  name="enableGoogleAdsense"
                  label="Enable Google AdSense"
                  description="Show configured ad regions on public pages for this tenant"
                  checked={watchedValues.enableGoogleAdsense || false}
                  onChange={(checked) => setValue('enableGoogleAdsense', checked)}
                />
              </div>

              {watchedValues.enableGoogleAdsense && (
                <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher ID *
                    </label>
                    <input
                      type="text"
                      {...register('googleAdsensePublisherId', {
                        validate: (value) => {
                          if (!watch('enableGoogleAdsense')) {
                            return true;
                          }
                          const trimmed = value?.trim() ?? '';
                          if (!trimmed) {
                            return 'Publisher ID is required when Google AdSense is enabled';
                          }
                          if (!/^ca-pub-[0-9]+$/.test(trimmed)) {
                            return 'Publisher ID must start with ca-pub- followed by digits';
                          }
                          if (trimmed.length > 32) {
                            return 'Publisher ID must not exceed 32 characters';
                          }
                          return true;
                        },
                      })}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm"
                      placeholder="ca-pub-1234567890123456"
                    />
                    {errors.googleAdsensePublisherId && (
                      <p className="mt-1 text-sm text-red-600">{errors.googleAdsensePublisherId.message}</p>
                    )}
                  </div>

                  <GoogleAdsensePlacementsFields
                    value={adsensePlacements}
                    onChange={(fields) => {
                      setAdsensePlacements(fields);
                      if (adsensePlacementsFormError) {
                        setAdsensePlacementsFormError('');
                      }
                    }}
                    fieldErrors={adsensePlacementErrors}
                    onFieldBlur={handleAdsensePlacementBlur}
                  />
                  {adsensePlacementsFormError && (
                    <p className="mt-1 text-sm text-red-600">{adsensePlacementsFormError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Usage Limits</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Events Per Month
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('maxEventsPerMonth', {
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="Unlimited if empty"
                />
                {errors.maxEventsPerMonth && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxEventsPerMonth.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Leave empty for unlimited events</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attendees Per Event
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('maxAttendeesPerEvent', {
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="Unlimited if empty"
                />
                {errors.maxAttendeesPerEvent && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAttendeesPerEvent.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Leave empty for unlimited attendees</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Event Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('defaultEventCapacity', {
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="100"
                />
                {errors.defaultEventCapacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.defaultEventCapacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="100"
                    {...register('platformFeePercentage', {
                      min: { value: 0, message: 'Must be at least 0%' },
                      max: { value: 100, message: 'Must be at most 100%' }
                    })}
                    className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base pr-8"
                    placeholder="0.0000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                {errors.platformFeePercentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.platformFeePercentage.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Platform fee as a percentage (e.g., 2.5 for 2.5%)</p>
              </div>
            </div>
          </div>
        )}

        {/* Homepage Hero Tab */}
        {activeTab === 'homepageHero' && (
          <div className="space-y-6">
            <input type="hidden" {...register('defaultHeroImageUrlsJson')} />
            <input type="hidden" {...register('defaultHeroMaxDisplayCount')} />

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <ToggleSwitch
                name="displayEventHeroImages"
                label="Show event hero images"
                description="When enabled, upcoming events with hero media appear in the homepage hero slideshow. When disabled, only tenant default hero slides (if configured) or the fallback image are shown."
                checked={displayEventHeroImages ?? true}
                onChange={(checked) => setValue('displayEventHeroImages', checked)}
              />
            </div>

            <TenantDefaultHeroManager
              settingsId={settingsId}
              mode={mode}
              tenantIdForUpload={tenantIdForUpload}
              initialUrlsJson={defaultHeroImageUrlsJson}
              displayMode={normalizeDefaultHeroDisplayMode(defaultHeroDisplayMode)}
              includeWithEvents={defaultHeroIncludeWithEvents ?? true}
              maxDisplayCount={
                defaultHeroMaxDisplayCount ?? DEFAULT_HERO_MAX_DISPLAY_COUNT
              }
              onUrlsJsonChange={(json) => setValue('defaultHeroImageUrlsJson', json)}
              onDisplayModeChange={(m: DefaultHeroDisplayMode) =>
                setValue('defaultHeroDisplayMode', m)
              }
              onIncludeWithEventsChange={(v) => setValue('defaultHeroIncludeWithEvents', v)}
              onMaxDisplayCountChange={(count) => void handleMaxDisplayCountChange(count)}
              onPersistSlides={persistHeroSlides}
            />
          </div>
        )}

        {/* Customization Tab */}
        {activeTab === 'customization' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Custom Styling</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom CSS
              </label>
              <textarea
                {...register('customCss', {
                  maxLength: {
                    value: 8192,
                    message: 'CSS must be less than 8192 characters'
                  }
                })}
                rows={12}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm"
                placeholder="/* Add your custom CSS here */"
              />
              {errors.customCss && (
                <p className="mt-1 text-sm text-red-600">{errors.customCss.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Custom CSS will be applied to all pages. Use with caution.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom JavaScript
              </label>
              <textarea
                {...register('customJs', {
                  maxLength: {
                    value: 16384,
                    message: 'JavaScript must be less than 16384 characters'
                  }
                })}
                rows={12}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm"
                placeholder="// Add your custom JavaScript here"
              />
              {errors.customJs && (
                <p className="mt-1 text-sm text-red-600">{errors.customJs.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Custom JavaScript will be loaded on all pages. Use with extreme caution.
              </p>
            </div>

            {/* Email Header Image Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Email Header Image</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Header Image File
                </label>
                {emailHeaderImageUrl ? (
                  <div className="relative inline-block">
                    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                      <img
                        src={emailHeaderImageUrl}
                        alt="Email header image"
                        className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300 object-contain"
                      />
                      <p className="text-sm text-gray-700 mt-2 mb-2">Current image:</p>
                      <a
                        href={emailHeaderImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        {emailHeaderImageUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveHeaderImage}
                      className="mt-2 flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Remove header image"
                      aria-label="Remove header image"
                    >
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={headerImageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeaderImageUpload}
                      disabled={uploadingHeaderImage || !settingsId}
                      className="hidden"
                    />
                    <div
                      onDragOver={handleHeaderImageDragOver}
                      onDragLeave={handleHeaderImageDragLeave}
                      onDrop={handleHeaderImageDrop}
                      onClick={() => !uploadingHeaderImage && settingsId && headerImageFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${
                        isDraggingHeaderImage
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-500'
                      } ${uploadingHeaderImage || !settingsId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${
                        isDraggingHeaderImage ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-10 h-10 ${isDraggingHeaderImage ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className={`text-sm ${
                        isDraggingHeaderImage ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}>
                        {uploadingHeaderImage
                          ? 'Uploading...'
                          : isDraggingHeaderImage
                            ? 'Drop image here'
                            : 'Click to upload or drag and drop email header image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Image files only (PNG, JPG, GIF, etc.)
                      </p>
                    </div>
                  </div>
                )}
                {headerImageUploadStatus !== 'idle' && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    headerImageUploadStatus === 'success' ? 'bg-green-100 text-green-800' :
                    headerImageUploadStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {headerImageUploadMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Email Footer HTML Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Email Footer HTML</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Footer HTML File
                </label>
                {emailFooterHtmlUrl ? (
                  <div className="relative inline-block">
                    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">Current file:</p>
                      <a
                        href={emailFooterHtmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        {emailFooterHtmlUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFooterHtml}
                      className="mt-2 flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Remove footer HTML"
                      aria-label="Remove footer HTML"
                    >
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={footerHtmlFileInputRef}
                      type="file"
                      accept=".html,text/html"
                      onChange={handleFooterHtmlUpload}
                      disabled={uploadingFooterHtml || !settingsId}
                      className="hidden"
                    />
                    <div
                      onDragOver={handleFooterHtmlDragOver}
                      onDragLeave={handleFooterHtmlDragLeave}
                      onDrop={handleFooterHtmlDrop}
                      onClick={() => !uploadingFooterHtml && settingsId && footerHtmlFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${
                        isDraggingFooterHtml
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-500'
                      } ${uploadingFooterHtml || !settingsId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${
                        isDraggingFooterHtml ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-10 h-10 ${isDraggingFooterHtml ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className={`text-sm ${
                        isDraggingFooterHtml ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}>
                        {uploadingFooterHtml
                          ? 'Uploading...'
                          : isDraggingFooterHtml
                            ? 'Drop HTML file here'
                            : 'Click to upload or drag and drop email footer HTML file'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        HTML files only (.html)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tenant Logo Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Tenant Logo</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Image
                </label>
                {logoImageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={logoImageUrl}
                      alt="Tenant logo"
                      className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                      title="Remove logo"
                      aria-label="Remove logo"
                    >
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo || !settingsId}
                      className="hidden"
                    />
                    <div
                      onDragOver={handleLogoDragOver}
                      onDragLeave={handleLogoDragLeave}
                      onDrop={handleLogoDrop}
                      onClick={() => !uploadingLogo && settingsId && logoFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${
                        isDraggingLogo
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-500'
                      } ${uploadingLogo || !settingsId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${
                        isDraggingLogo ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-10 h-10 ${isDraggingLogo ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className={`text-sm ${
                        isDraggingLogo ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}>
                        {uploadingLogo
                          ? 'Uploading...'
                          : isDraggingLogo
                            ? 'Drop image here'
                            : 'Click to upload or drag and drop tenant logo image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-row flex-wrap justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || loading}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 px-6 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Cancel"
            aria-label="Cancel"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 px-6 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={isSubmitting || loading ? 'Saving...' : 'Save'}
            aria-label={isSubmitting || loading ? 'Saving...' : 'Save'}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              {isSubmitting || loading ? (
                <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="font-semibold text-green-700">{isSubmitting || loading ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </form>

      {/* Email Footer HTML Upload Status Dialog */}
      <SaveStatusDialog
        isOpen={footerHtmlUploadStatus !== 'idle'}
        status={footerHtmlUploadStatus === 'uploading' ? 'saving' : footerHtmlUploadStatus === 'success' ? 'success' : 'error'}
        title={
          footerHtmlUploadStatus === 'uploading'
            ? 'Uploading...'
            : footerHtmlUploadStatus === 'success'
            ? 'Uploaded Successfully!'
            : 'Upload Failed'
        }
        message={footerHtmlUploadMessage}
        onClose={() => {
          if (footerHtmlUploadStatus === 'error') {
            setFooterHtmlUploadStatus('idle');
            setFooterHtmlUploadMessage('');
          }
        }}
      />

      {/* Logo Upload Status Dialog */}
      <SaveStatusDialog
        isOpen={logoUploadStatus !== 'idle'}
        status={logoUploadStatus === 'uploading' ? 'saving' : logoUploadStatus === 'success' ? 'success' : 'error'}
        title={
          logoUploadStatus === 'uploading'
            ? 'Uploading...'
            : logoUploadStatus === 'success'
            ? 'Uploaded Successfully!'
            : 'Upload Failed'
        }
        message={logoUploadMessage}
        onClose={() => {
          if (logoUploadStatus === 'error') {
            setLogoUploadStatus('idle');
            setLogoUploadMessage('');
          }
        }}
      />

      {/* Email Header Image Upload Status Dialog */}
      <SaveStatusDialog
        isOpen={headerImageUploadStatus !== 'idle'}
        status={headerImageUploadStatus === 'uploading' ? 'saving' : headerImageUploadStatus === 'success' ? 'success' : 'error'}
        title={
          headerImageUploadStatus === 'uploading'
            ? 'Uploading...'
            : headerImageUploadStatus === 'success'
            ? 'Uploaded Successfully!'
            : 'Upload Failed'
        }
        message={headerImageUploadMessage}
        onClose={() => {
          if (headerImageUploadStatus === 'error') {
            setHeaderImageUploadStatus('idle');
            setHeaderImageUploadMessage('');
          }
        }}
      />
      <SaveStatusDialog
        isOpen={heroSaveStatus !== 'idle'}
        status={heroSaveStatus}
        message={heroSaveMessage}
        details={heroSaveDetails}
        title={
          heroSaveStatus === 'saving'
            ? 'Saving hero slides...'
            : heroSaveStatus === 'success'
              ? 'Hero slides saved'
              : 'Could not save hero slides'
        }
        onClose={() => {
          if (heroSaveStatus === 'error') {
            setHeroSaveStatus('idle');
            setHeroSaveMessage('');
            setHeroSaveDetails([]);
          }
        }}
      />

      <SaveStatusDialog
        isOpen={formSaveValidationDialog !== null}
        status="error"
        title="Cannot save settings"
        message={formSaveValidationDialog?.message ?? ''}
        details={formSaveValidationDialog?.details ?? []}
        onClose={() => setFormSaveValidationDialog(null)}
      />
    </div>
  );
}
