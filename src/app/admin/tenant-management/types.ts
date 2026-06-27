/**
 * DTO for tenant organization details.
 * Matches backend OpenAPI schema.
 */
export interface TenantOrganizationDTO {
  id?: number;
  tenantId: string;
  organizationName: string;
  domain?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string; // YYYY-MM-DD
  subscriptionEndDate?: string;   // YYYY-MM-DD
  monthlyFeeUsd?: number;
  stripeCustomerId?: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  zipCode?: string;
  country?: string;
  websiteUrl?: string;
  isActive?: boolean;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

/**
 * DTO for tenant settings.
 * Matches backend OpenAPI schema.
 */
export interface TenantSettingsDTO {
  id?: number;
  tenantId: string;
  allowUserRegistration?: boolean;
  requireAdminApproval?: boolean;
  enableWhatsappIntegration?: boolean;
  enableEmailMarketing?: boolean;
  whatsappApiKey?: string;
  emailProviderConfig?: string;
  maxEventsPerMonth?: number;
  maxAttendeesPerEvent?: number;
  enableGuestRegistration?: boolean;
  maxGuestsPerAttendee?: number;
  defaultEventCapacity?: number;
  platformFeePercentage?: number;
  customCss?: string;
  customJs?: string;
  showEventsSectionInHomePage?: boolean;
  showTeamMembersSectionInHomePage?: boolean;
  showSponsorsSectionInHomePage?: boolean;
  isMembershipSubscriptionEnabled?: boolean;
  // Enhanced WhatsApp Integration Fields
  whatsappPhoneNumber?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  enableWhatsappNotifications?: boolean;
  enableWhatsappMarketing?: boolean;
  whatsappDefaultTemplate?: string;
  whatsappMaxMessagesPerDay?: number;
  whatsappRateLimit?: number;
  whatsappWebhookUrl?: string;
  whatsappWebhookToken?: string;
  emailFooterHtmlUrl?: string; // S3 URL for email footer HTML file
  emailHeaderImageUrl?: string; // S3 URL for email header image
  logoImageUrl?: string; // S3 URL for tenant logo image
  /** JSON array of HTTPS URLs for tenant default homepage hero slideshow */
  defaultHeroImageUrlsJson?: string;
  /** slideshow | random | single */
  defaultHeroDisplayMode?: 'slideshow' | 'random' | 'single';
  /** When true, append tenant default slides after upcoming event hero images */
  defaultHeroIncludeWithEvents?: boolean;
  /** Max active slides shown on homepage rotation (1–6, default 6) */
  defaultHeroMaxDisplayCount?: number;
  // Homepage edge cache version (cache-busting; bump to refresh CDN cache)
  homepageCacheVersion?: number;
  /** @deprecated v2.0 — canonical source is tenant_organization.description */
  description?: string;
  /** @deprecated v2.0 — use tenant_organization.addressLine1 */
  addressLine1?: string;
  /** @deprecated v2.0 — use tenant_organization.addressLine2 */
  addressLine2?: string;
  /** @deprecated v2.0 — use tenant_organization.city */
  city?: string;
  phoneNumber?: string;
  /** @deprecated v2.0 — use tenant_organization.zipCode */
  zipCode?: string;
  /** @deprecated v2.0 — use tenant_organization.country */
  country?: string;
  /** @deprecated v2.0 — use tenant_organization.stateProvince */
  stateProvince?: string;
  email?: string;
  // Social media URLs (Follow our journey / organization links)
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
  tenantOrganization?: TenantOrganizationDTO;
}

/**
 * Form DTO for tenant organization creation/editing.
 * Omits fields that are auto-generated or supplied by the system.
 */
export type TenantOrganizationFormDTO = Omit<TenantOrganizationDTO, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Form DTO for tenant settings creation/editing.
 * Omits fields that are auto-generated or supplied by the system.
 */
export type TenantSettingsFormDTO = Omit<TenantSettingsDTO, 'id' | 'createdAt' | 'updatedAt' | 'tenantOrganization'>;

/**
 * Filter options for tenant organization list
 */
export interface TenantOrganizationFilters {
  search?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
  sortBy?: 'organizationName' | 'createdAt' | 'subscriptionStatus';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter options for tenant settings list
 */
export interface TenantSettingsFilters {
  search?: string;
  tenantId?: string;
  sortBy?: 'tenantId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * API response for paginated lists
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

