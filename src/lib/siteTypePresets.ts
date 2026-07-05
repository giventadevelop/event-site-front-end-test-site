import type { TenantSiteType } from '@/types/profileSite';
import type { TenantSettingsDTO } from '@/types';

export interface SiteTypePresetSettings {
  showEventsSectionInHomePage?: boolean;
  showTeamMembersSectionInHomePage?: boolean;
  showExecutiveCommitteeSectionInHomePage?: boolean;
  showSponsorsSectionInHomePage?: boolean;
  showPublicProfileHeroSection?: boolean;
  showProfileWritingsSection?: boolean;
  showProfileAchievementsSection?: boolean;
  showProfileAffiliationsSection?: boolean;
  showProfileMediaDownloadsSection?: boolean;
  showProfileContactSection?: boolean;
}

const EVENT_ORG_PRESET: SiteTypePresetSettings = {
  showEventsSectionInHomePage: true,
  showTeamMembersSectionInHomePage: false,
  showExecutiveCommitteeSectionInHomePage: false,
  showSponsorsSectionInHomePage: true,
  showPublicProfileHeroSection: false,
  showProfileWritingsSection: false,
  showProfileAchievementsSection: false,
  showProfileAffiliationsSection: false,
  showProfileMediaDownloadsSection: false,
  showProfileContactSection: false,
};

const SPORTS_PRESET: SiteTypePresetSettings = {
  ...EVENT_ORG_PRESET,
  showTeamMembersSectionInHomePage: true,
};

const CHURCH_PRESET: SiteTypePresetSettings = {
  ...EVENT_ORG_PRESET,
  showExecutiveCommitteeSectionInHomePage: true,
  showSponsorsSectionInHomePage: false,
};

const PERSONAL_PROFILE_PRESET: SiteTypePresetSettings = {
  showEventsSectionInHomePage: false,
  showTeamMembersSectionInHomePage: false,
  showExecutiveCommitteeSectionInHomePage: false,
  showSponsorsSectionInHomePage: false,
  showPublicProfileHeroSection: true,
  showProfileWritingsSection: true,
  showProfileAchievementsSection: true,
  showProfileAffiliationsSection: true,
  showProfileMediaDownloadsSection: true,
  showProfileContactSection: true,
};

const HYBRID_PRESET: SiteTypePresetSettings = {
  ...PERSONAL_PROFILE_PRESET,
  showEventsSectionInHomePage: true,
  showSponsorsSectionInHomePage: true,
};

// GAS_STATION tenants are dashboard-first: no public homepage sections.
const GAS_STATION_PRESET: SiteTypePresetSettings = {
  showEventsSectionInHomePage: false,
  showTeamMembersSectionInHomePage: false,
  showExecutiveCommitteeSectionInHomePage: false,
  showSponsorsSectionInHomePage: false,
  showPublicProfileHeroSection: false,
  showProfileWritingsSection: false,
  showProfileAchievementsSection: false,
  showProfileAffiliationsSection: false,
  showProfileMediaDownloadsSection: false,
  showProfileContactSection: false,
};

export function getSiteTypePresetSettings(siteType: TenantSiteType): SiteTypePresetSettings {
  switch (siteType) {
    case 'SPORTS_TEAM':
      return SPORTS_PRESET;
    case 'MUSIC_BAND':
      return { ...SPORTS_PRESET };
    case 'CHURCH_ORG':
      return CHURCH_PRESET;
    case 'PERSONAL_PROFILE':
      return PERSONAL_PROFILE_PRESET;
    case 'HYBRID':
      return HYBRID_PRESET;
    case 'GAS_STATION':
      return GAS_STATION_PRESET;
    case 'EVENT_ORG':
    default:
      return EVENT_ORG_PRESET;
  }
}

export function applySiteTypePresetsToSettings(
  siteType: TenantSiteType,
  current: Partial<TenantSettingsDTO>
): Partial<TenantSettingsDTO> {
  return {
    ...current,
    ...getSiteTypePresetSettings(siteType),
  };
}

export function isProfileSiteType(siteType?: TenantSiteType | string | null): boolean {
  return siteType === 'PERSONAL_PROFILE' || siteType === 'HYBRID';
}
