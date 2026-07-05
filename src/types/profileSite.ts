/**
 * Site archetype for tenant_organization.site_type
 */
export type TenantSiteType =
  | 'EVENT_ORG'
  | 'SPORTS_TEAM'
  | 'MUSIC_BAND'
  | 'CHURCH_ORG'
  | 'PERSONAL_PROFILE'
  | 'HYBRID'
  | 'GAS_STATION';

export type ProfileWritingType = 'ORIGINAL' | 'REPUBLISHED' | 'EXTERNAL_LINK';
export type ProfileWritingStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProfileAchievementCategory = 'AWARD' | 'HONOR' | 'SPEAKING' | 'EDUCATION' | 'OTHER';

export interface PublicProfileDTO {
  id?: number | null;
  tenantId: string;
  displayName: string;
  tagline?: string;
  headline?: string;
  bioMarkdown?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  location?: string;
  languages?: string;
  publicSlug?: string;
  contactEmail?: string;
  contactFormEnabled?: boolean;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  cvDocumentUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  ownerUserProfileId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileWritingDTO {
  id?: number | null;
  tenantId: string;
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  featuredImageUrl?: string;
  writingType?: ProfileWritingType;
  externalUrl?: string;
  publicationName?: string;
  publishedAt?: string;
  status?: ProfileWritingStatus;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileAchievementDTO {
  id?: number | null;
  tenantId: string;
  title: string;
  description?: string;
  achievementDate?: string;
  category?: ProfileAchievementCategory;
  issuer?: string;
  url?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileAffiliationDTO {
  id?: number | null;
  tenantId: string;
  organizationName: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  logoUrl?: string;
  url?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileMediaAssetDTO {
  id?: number | null;
  tenantId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSizeBytes?: number;
  displayOrder?: number;
  isDownloadable?: boolean;
  requiresEmail?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const TENANT_SITE_TYPE_LABELS: Record<TenantSiteType, string> = {
  EVENT_ORG: 'Event organization',
  SPORTS_TEAM: 'Sports team',
  MUSIC_BAND: 'Music band',
  CHURCH_ORG: 'Church / organization',
  PERSONAL_PROFILE: 'Personal profile / portfolio',
  HYBRID: 'Hybrid (profile + events)',
  GAS_STATION: 'Gas station (AI COO)',
};
