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
export type ProfileMediaKind = 'DOCUMENT' | 'VIDEO' | 'PODCAST' | 'PRESS' | 'OTHER';

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
  /** Calendly / booking page URL for collaboration CTA */
  bookingUrl?: string;
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
  /** Badge, certificate, or photo URL (varchar 1024 in DB) */
  imageUrl?: string;
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
  /** Cover / preview image for the download card (varchar 1024 in DB) */
  coverImageUrl?: string;
  fileUrl: string;
  fileType?: string;
  /** Semantic kind for talks strip vs downloads (DOCUMENT default) */
  mediaKind?: ProfileMediaKind;
  fileSizeBytes?: number;
  displayOrder?: number;
  isDownloadable?: boolean;
  requiresEmail?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Case-study / project card for personal profile homepage */
export interface ProfileProjectDTO {
  id?: number | null;
  tenantId: string;
  title: string;
  slug?: string;
  summary?: string;
  coverImageUrl?: string;
  role?: string;
  /** JSON object or array of metric labels/values, e.g. [{"label":"Users","value":"10k"}] */
  outcomeMetricsJson?: string;
  projectUrl?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileOutcomeMetric {
  label: string;
  value: string;
}

export type ProfileAudienceContactSource =
  | 'SUBSCRIBE_FORM'
  | 'CONTACT_FORM'
  | 'CSV_IMPORT'
  | 'GATED_DOWNLOAD'
  | 'ADMIN_MANUAL';

export type ProfileAudienceContactOptInStatus = 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';

export interface ProfileAudienceContactDTO {
  id?: number | null;
  tenantId: string;
  publicProfileId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  source: ProfileAudienceContactSource;
  optInStatus: ProfileAudienceContactOptInStatus;
  unsubscribeToken?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileAudienceBulkImportResultDTO {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
}

export interface ProfileAudienceSubscribeRequestDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  message?: string;
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
