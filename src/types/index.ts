export interface UserTaskDTO {
  id: number;
  tenantId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string; // ISO date-time string
  completed: boolean;
  assigneeName?: string;
  assigneeContactPhone?: string;
  assigneeContactEmail?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserProfileDTO;
  event?: EventDetailsDTO;
}

export interface UserProfileDTO {
  id: number;
  tenantId?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  familyName?: string;
  cityTown?: string;
  district?: string;
  educationalInstitution?: string;
  profileImageUrl?: string;
  isEmailSubscribed?: boolean;
  emailSubscriptionToken?: string;
  isEmailSubscriptionTokenUsed?: boolean;
  userStatus?: string; // varchar(50)
  userRole?: string;   // varchar(50)
  reviewedByAdminAt?: string; // ISO date string (date)
  reviewedByAdminId?: number; // int8, references admin user id
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscriptionDTO {
  id?: number;
  tenantId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: string;
  status: string;
  userProfile?: UserProfileDTO;
}

/**
 * DTO for event details, matches backend OpenAPI schema.
 */
export interface EventDetailsDTO {
  /** Unique event ID */
  id?: number;
  /** Tenant ID */
  tenantId?: string;
  /** Event title */
  title: string;
  /** Event caption */
  caption?: string;
  /** Event description */
  description?: string;
  /** Event start date (YYYY-MM-DD) */
  startDate: string;
  /** Event end date (YYYY-MM-DD) */
  endDate: string;
  /** Event promotion start date (YYYY-MM-DD) */
  promotionStartDate: string;
  /** Event start time (e.g., 18:00) */
  startTime: string;
  /** Event end time (e.g., 21:00) */
  endTime: string;
  /** IANA timezone name (e.g., 'America/New_York') */
  timezone: string;
  /** Event location */
  location?: string;
  /** Directions to venue */
  directionsToVenue?: string;
  /** Event capacity */
  capacity?: number;
  /** Admission type */
  admissionType?: string;
  /** Is event active */
  isActive?: boolean;
  /** Max guests per attendee */
  maxGuestsPerAttendee?: number;
  /** Allow guests */
  allowGuests?: boolean;
  /** Require guest approval */
  requireGuestApproval?: boolean;
  /** Enable guest pricing */
  enableGuestPricing?: boolean;
  /** Enable QR code */
  enableQrCode?: boolean;
  /** Is registration required */
  isRegistrationRequired?: boolean;
  /** Is sports event */
  isSportsEvent?: boolean;
  /** Is competition event (Kanj-style competitions) */
  isCompetitionEvent?: boolean;
  /** Is event live */
  isLive?: boolean;
  /** Is featured event */
  isFeaturedEvent: boolean;
  /** Featured event priority ranking */
  featuredEventPriorityRanking: number;
  /** Live event priority ranking */
  liveEventPriorityRanking: number;
  /** Metadata - DEPRECATED: Use donationMetadata and eventRecurrenceMetadata instead.
   * Flexible TEXT field for event configuration stored as JSON string.
   * Stores fundraiser settings, donation config, etc.
   * Parse JSON in application code using JSON.parse() */
  metadata?: string;
  /** Donation metadata - For fundraiser/charity configuration (JSON string) */
  donationMetadata?: string;
  /** Event Cube embed URL - iframe src for event page (when admission is TICKETED) */
  eventcubeEmbedUrl?: string;
  /** Event Cube order/checkout URL - when set, can be loaded in same iframe so checkout stays embedded (workaround when event page opens order in new tab) */
  eventcubeOrderUrl?: string;
  /** Event recurrence metadata - For recurrence configuration (JSON string) */
  eventRecurrenceMetadata?: string;
  /** Is recurring event */
  isRecurring?: boolean;
  /** Parent event ID (NULL for parent events, set to parent ID for child occurrences) */
  parentEventId?: number;
  /** Recurrence series ID (set to parent event ID for ALL events in series) */
  recurrenceSeriesId?: number;
  /** Email header image URL for ticket confirmation emails */
  emailHeaderImageUrl?: string;
  /** From email address for event-related emails */
  fromEmail?: string;
  /** Payment flow mode: STRIPE_ONLY, MANUAL_ONLY, or HYBRID */
  paymentFlowMode?: 'STRIPE_ONLY' | 'MANUAL_ONLY' | 'HYBRID';
  /** Is manual payment enabled for this event */
  manualPaymentEnabled?: boolean;
  /** Created at (ISO date-time) */
  createdAt: string;
  /** Updated at (ISO date-time) */
  updatedAt: string;
  /** Created by user profile */
  createdBy?: UserProfileDTO;
  /** Event type details */
  eventType?: EventTypeDetailsDTO;
  /** Discount codes */
  discountCodes?: DiscountCodeDTO[];
}

/**
 * DTO for event type data exchanged with the backend.
 */
export interface EventTypeDetailsDTO {
  id?: number;
  tenantId?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for event media data exchanged with the backend.
 * Matches backend OpenAPI schema.
 */
export interface EventMediaDTO {
  id?: number;
  tenantId?: string;
  title: string;
  description?: string;
  eventMediaType: string;
  storageType: string;
  fileUrl?: string;
  fileDataContentType?: string;
  contentType?: string;
  fileSize?: number;
  isPublic?: boolean;
  eventFlyer?: boolean;
  isEventManagementOfficialDocument?: boolean;
  preSignedUrl?: string;
  preSignedUrlExpiresAt?: string;
  /** Optional card thumbnail for non-image files (e.g. PDF official documents). */
  thumbnailUrl?: string;
  thumbnailPreSignedUrl?: string;
  thumbnailPreSignedUrlExpiresAt?: string;
  altText?: string;
  displayOrder?: number;
  downloadCount?: number;
  isFeaturedVideo?: boolean;
  featuredVideoUrl?: string;
  isHeroImage?: boolean;
  isActiveHeroImage?: boolean;
  isHomePageHeroImage: boolean;
  /**
   * Duration in seconds to display this image in the homepage hero slider when isHomePageHeroImage is true.
   * Stored as total seconds (e.g. 50, 80 for 1m20s). Null = use app default (8 seconds). Valid range: 1–600.
   */
  homePageHeroDisplayDurationSeconds?: number | null;
  isFeaturedEventImage: boolean;
  isLiveEventImage: boolean;
  eventId?: number;
  uploadedById?: number;
  createdAt: string;
  updatedAt: string;
  /** Start displaying from date (YYYY-MM-DD) */
  startDisplayingFromDate?: string;
  /**
   * Reference to sponsor for sponsor-specific media files
   */
  sponsorId?: number;
  /**
   * Reference to event-sponsor join record for custom posters
   */
  eventSponsorsJoinId?: number;
  /**
   * Reference to performer for performer-specific media files
   */
  performerId?: number;
  /**
   * Reference to director for director-specific media files
   */
  directorId?: number;
  /**
   * Priority ranking for media files (sponsor or event-sponsor).
   * Lower values indicate higher priority (0 = highest priority).
   * Default: 0
   */
  priorityRanking?: number;
  /**
   * Canonical hierarchy path for official document tree rendering.
   * Example: "Kalpana 2023\\Kalpana 110 Commission\\Kalpana-Commission-1.pdf"
   */
  hierarchyPath?: string | null;
  /**
   * Human-friendly top-level category label derived from the legacy folder hierarchy.
   */
  hierarchyCategoryLabel?: string | null;
  /**
   * Dedicated display priority for official documents.
   * Lower values indicate higher priority (shown first in paginated list).
   */
  displayPriority?: number | null;
  /**
   * Reference to gallery album. Mutually exclusive with eventId (media belongs to either an event OR an album, not both).
   */
  albumId?: number;
  /**
   * Reference to event_focus_groups association (event-focus-group link). Optional; when set, media is scoped to that focus group for this event.
   */
  eventFocusGroupId?: number | null;
  /** FK to public.official_document_category when isEventManagementOfficialDocument is true (tenant library). */
  officialDocumentCategoryId?: number | null;
  /** Calendar year segment for official-document S3 path (e.g. 2025). */
  officialDocumentYear?: number | null;
}

/**
 * Tenant-scoped official document category lookup (Church Resources).
 */
export interface OfficialDocumentCategoryDTO {
  id?: number;
  tenantId?: string;
  slug: string;
  displayName: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Per-tenant, per-category, per-year bundle for official document library cover (see official_document_year_bundle).
 */
export interface OfficialDocumentYearBundleDTO {
  id?: number;
  tenantId?: string;
  officialDocumentCategoryId: number;
  documentYear: number;
  coverEventMediaId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  /** When API embeds the cover media row */
  coverEventMedia?: Partial<EventMediaDTO> | null;
}

/**
 * DTO for gallery category (tenant-scoped lookup table).
 */
export interface GalleryCategoryDTO {
  id: number;
  tenantId?: string;
  slug: string;
  displayName: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO for gallery album, matches backend schema.
 */
export interface GalleryAlbumDTO {
  id?: number;
  tenantId?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  displayOrder?: number;
  albumYear?: number | null;
  galleryCategoryId?: number | null;
  galleryCategory?: GalleryCategoryDTO | null;
  /** ISO date YYYY-MM-DD — event/visit start */
  eventDateStart?: string | null;
  /** ISO date YYYY-MM-DD — optional end for multi-day events */
  eventDateEnd?: string | null;
  /** City/venue shown after formatted date on cards, e.g. "Indore" */
  eventLocation?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
}

/**
 * Album with associated media for gallery display.
 */
export interface GalleryAlbumWithMedia {
  album: GalleryAlbumDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}

export interface EventCalendarEntryDTO {
  id?: number;
  tenantId?: string;
  calendarProvider: string;
  externalEventId?: string;
  calendarLink: string;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  createdBy?: UserProfileDTO;
}

export interface EventWithMedia extends EventDetailsDTO {
  thumbnailUrl?: string;
  startTime: string;
  endTime: string;
}

/**
 * DTO for event ticket type, matches backend schema.
 */
export interface EventTicketTypeDTO {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  isServiceFeeIncluded?: boolean;
  serviceFee?: number;
  price: number;
  code: string;
  availableQuantity?: number;
  soldQuantity?: number;
  remainingQuantity?: number;
  isActive?: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  minQuantityPerOrder?: number;
  maxQuantityPerOrder?: number;
  requiresApproval?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
}

/**
 * DTO for the event ticket type creation form.
 * Omits fields that are auto-generated or supplied by the system.
 */
export type EventTicketTypeFormDTO = Omit<EventTicketTypeDTO, 'id' | 'event' | 'tenantId' | 'createdAt' | 'updatedAt'>;

/**
 * DTO for event attendee, matches backend OpenAPI schema.
 */
export type EventAttendeeDTO = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isMember?: boolean;
  eventId: number;
  userId?: number;
  tenantId?: string;
  registrationStatus: string;
  registrationDate: string;
  confirmationDate?: string;
  cancellationDate?: string;
  cancellationReason?: string;
  attendeeType?: string;
  specialRequirements?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  checkInStatus?: string;
  checkInTime?: string;
  totalNumberOfGuests?: number;
  numberOfGuestsCheckedIn?: number;
  notes?: string; // Supports up to 1500 chars
  /** Admin-only notes; not shown to attendee on registration. */
  adminNotes?: string;
  qrCodeData?: string;
  qrCodeGenerated?: boolean;
  qrCodeGeneratedAt?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  emergencyContactRelationship?: string;
  checkOutTime?: string;
  attendanceRating?: number;
  feedback?: string;
  registrationSource?: string;
  waitListPosition?: number;
  priorityScore?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
};

/**
 * DTO for attendee registration file attachments.
 */
export type EventAttendeeAttachmentDTO = {
  id?: number;
  tenantId?: string;
  attendeeId: number;
  eventId: number;
  title?: string;
  description?: string;
  fileUrl?: string;
  contentType?: string;
  fileSize?: number;
  originalFilename?: string;
  storageType?: string;
  eventMediaType?: string;
  isPublic?: boolean;
  uploadedById?: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * DTO for event attendee guest management.
 * Matches backend OpenAPI schema.
 */
export type EventAttendeeGuestDTO = {
  id?: number;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ageGroup?: string;
  relationship?: string;
  specialRequirements?: string;
  registrationStatus?: string;
  checkInStatus?: string;
  checkInTime?: string;
  createdAt: string;
  updatedAt: string;
  primaryAttendee?: EventAttendeeDTO;
};

export interface EventPollDTO {
  id?: number;
  tenantId?: string;
  title: string;
  description?: string;
  isActive?: boolean;
  startDate: string;
  endDate?: string;
  maxResponsesPerUser?: number; // Maximum number of responses allowed per user
  allowMultipleChoices?: boolean; // Whether multiple poll options can be selected
  isAnonymous?: boolean; // Whether responses are anonymous by default
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  createdBy?: UserProfileDTO;
}

export interface EventPollOptionDTO {
  id?: number;
  tenantId?: string;
  optionText: string;
  createdAt: string;
  updatedAt: string;
  poll?: EventPollDTO;
}

export interface BulkOperationLogDTO {
  id?: number;
  tenantId?: string;
  operationType: string;
  targetCount: number;
  successCount?: number;
  errorCount?: number;
  operationDetails?: string;
  createdAt: string;
  performedBy?: UserProfileDTO;
}

export interface EventAdminAuditLogDTO {
  id?: number;
  tenantId?: string;
  action: string;
  tableName: string;
  recordId: string;
  changes?: string;
  createdAt: string;
  admin?: UserProfileDTO;
}

export interface EventAdminDTO {
  id?: number;
  tenantId?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user?: UserProfileDTO;
  createdBy?: UserProfileDTO;
}

export interface EventOrganizerDTO {
  id?: number;
  tenantId?: string;
  title: string;
  designation?: string;
  contactEmail?: string;
  contactPhone?: string;
  isPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  organizer?: UserProfileDTO;
}

export interface EventPollResponseDTO {
  id?: number;
  tenantId?: string;
  comment?: string;
  responseValue?: string; // varchar(1000) - Custom response value for rating/custom responses
  isAnonymous?: boolean; // boolean - Anonymous response flag, overrides poll-level setting
  createdAt: string;
  updatedAt: string;
  pollId?: number;
  pollOptionId?: number;
  userId?: number;
  poll?: EventPollDTO;
  pollOption?: EventPollOptionDTO;
  user?: UserProfileDTO;
}

/**
 * DTO for event ticket transactions, matches backend OpenAPI schema.
 */
export interface EventTicketTransactionDTO {
  id?: number;
  tenantId?: string;
  transactionReference?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  taxAmount?: number;
  platformFeeAmount?: number;
  discountCodeId?: number;
  discountAmount?: number;
  finalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentReference?: string;
  purchaseDate: string;
  confirmationSentAt?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripePaymentStatus?: string;
  stripeCustomerEmail?: string;
  stripePaymentCurrency?: string;
  stripeAmountDiscount?: number;
  stripeAmountTax?: number;
  stripeFeeAmount?: number;
  netPayoutAmount?: number; // Net payout to bank (finalAmount - stripeFeeAmount - stripeAmountTax)
  eventId?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  user?: UserProfileDTO;
  /** New check-in fields */
  checkInStatus?: string;
  numberOfGuestsCheckedIn?: number;
  checkInTime?: string;
  checkOutTime?: string;
  /** Triple validation fields - backend will validate combination exists in payment_provider_config */
  paymentMethodDomainId?: string; // Stripe Payment Method Domain ID (pmd_*) - used for triple validation
}

export interface EventTicketTransactionItemDTO {
  id?: number;
  tenantId?: string;
  transactionId: number;
  ticketTypeId: number;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  discountAmount?: number;
  serviceFee?: number;
  createdAt: string;
  updatedAt: string;
  transaction?: EventTicketTransactionDTO;
  ticketType?: EventTicketTypeDTO;
  /** Triple validation fields - backend will validate combination exists in payment_provider_config */
  paymentMethodDomainId?: string; // Stripe Payment Method Domain ID (pmd_*) - used for triple validation
}

/**
 * DTO for QR code usage, matches backend OpenAPI schema.
 */
export interface QrCodeUsageDTO {
  id?: number;
  tenantId?: string;
  qrCodeData: string;
  generatedAt: string;
  usedAt?: string;
  usageCount?: number;
  lastScannedBy?: string;
  createdAt: string;
  attendee?: EventAttendeeDTO;
  transaction?: EventTicketTransactionDTO;
  items?: EventTicketTransactionItemDTO[];
  eventDetails?: EventDetailsDTO;
  eventTicketTypes?: EventTicketTypeDTO[];
}

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
  subscriptionStartDate?: string; // date (YYYY-MM-DD)
  subscriptionEndDate?: string;   // date (YYYY-MM-DD)
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
  createdAt: string; // date-time
  updatedAt: string; // date-time
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
  /** When true, homepage shows executive committee TeamSection (migrated from legacy team flag). */
  showExecutiveCommitteeSectionInHomePage?: boolean;
  showSponsorsSectionInHomePage?: boolean;
  isMembershipSubscriptionEnabled?: boolean;
  homepageCacheVersion?: number;
  /** @deprecated v2.0 — canonical source is tenant_organization.description */
  description?: string;
  defaultHeroImageUrlsJson?: string;
  defaultHeroDisplayMode?: 'slideshow' | 'random' | 'single';
  defaultHeroIncludeWithEvents?: boolean;
  defaultHeroMaxDisplayCount?: number;
  /** When true, render Google AdSense regions on public satellite pages */
  enableGoogleAdsense?: boolean;
  /** AdSense publisher ID (ca-pub-...) */
  googleAdsensePublisherId?: string;
  /** JSON map of layout region id → ad slot id */
  googleAdsensePlacementsJson?: string;
  // Deprecated identity fields (read fallback only — use tenant_organization)
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
  createdAt: string; // date-time
  updatedAt: string; // date-time
  tenantOrganization?: TenantOrganizationDTO;
}

export interface UserPaymentTransactionDTO {
  id?: number;
  tenantId: string;
  transactionType: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeTransferGroup?: string;
  platformFeeAmount?: number;
  tenantAmount?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  ticketTransaction?: EventTicketTransactionDTO;
}

export interface UserRegistrationRequestDTO {
  id?: number;
  tenantId: string;
  requestId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  familyName?: string;
  cityTown?: string;
  district?: string;
  educationalInstitution?: string;
  profileImageUrl?: string;
  requestReason?: string;
  status: string;
  adminComments?: string;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: UserProfileDTO;
}

/**
 * DTO for discount codes, matches backend schema.
 */
export interface DiscountCodeDTO {
  id?: number;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  maxUses?: number;
  usesCount?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  eventId: number;
  tenantId: string;
}

// Focus Groups
export interface FocusGroupDTO {
  id?: number;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusGroupMemberDTO {
  id?: number;
  tenantId?: string;
  focusGroupId: number;
  userProfileId: number;
  role: string;   // MEMBER | LEAD | ADMIN (uppercase)
  status: string; // ACTIVE | INACTIVE | PENDING (uppercase)
  createdAt: string;
  updatedAt: string;
}

export interface EventFocusGroupDTO {
  id?: number;
  tenantId?: string;
  eventId: number;
  focusGroupId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for event ticket transaction statistics, matches backend OpenAPI schema.
 * Used for /api/event-ticket-transactions/statistics/{eventId} endpoint.
 */
export interface EventTicketTransactionStatisticsDTO {
  /** Event ID for which statistics are calculated */
  eventId: number;
  /** Total number of tickets sold for the event */
  totalTicketsSold: number;
  /** Total amount collected for the event */
  totalAmount: number;

  netAmount: number;
  /** Map of ticket status to count (e.g., { COMPLETED: 26 }) */
  ticketsByStatus: Record<string, number>;
  /** Map of ticket status to total amount (e.g., { COMPLETED: 444 }) */
  amountByStatus: Record<string, number>;
}

/**
 * DTO for sending promotion emails, matches backend OpenAPI schema.
 * Required fields: bodyHtml, tenantId
 */
export interface PromotionEmailRequestDTO {
  /** Tenant ID (required) */
  tenantId: string;
  /** Recipient email address */
  to?: string;

  isTestEmail?: boolean;
  /** Email subject */
  subject?: string;
  /** Promo code to include in the email */
  promoCode?: string;
  /** HTML body of the email (required) */
  bodyHtml: string;
  /** Path to header image (optional) */
  headerImagePath?: string;
  /** Path to footer image or content (optional) */
  footerPath?: string;
  /** Email host URL prefix for email context */
  emailHostUrlPrefix?: string;
}

/**
 * DTO for promotion email template, matches backend OpenAPI schema.
 */
export interface PromotionEmailTemplateDTO {
  id?: number;
  tenantId: string;
  eventId: number;
  templateName: string;
  /**
   * Template type discriminator.
   * EVENT_PROMOTION = event-specific promotional emails
   * NEWS_LETTER = general/newsletter emails
   */
  templateType: 'EVENT_PROMOTION' | 'NEWS_LETTER';
  subject: string;
  fromEmail: string;
  bodyHtml: string;
  footerHtml: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  promotionCode?: string;
  discountCodeId?: number;
  isActive?: boolean;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  discountCode?: DiscountCodeDTO;
  createdBy?: UserProfileDTO;
}

/**
 * DTO for creating/updating promotion email template.
 */
export interface PromotionEmailTemplateFormDTO {
  eventId: number;
  templateName: string;
  /**
   * Template type discriminator used by the backend to distinguish between
   * event promotion emails and newsletter emails.
   *
   * - EVENT_PROMOTION → used on `/admin/promotion-emails`
   * - NEWS_LETTER     → used on `/admin/newsletter-emails`
   */
  templateType?: 'EVENT_PROMOTION' | 'NEWS_LETTER';
  subject: string;
  fromEmail: string;
  bodyHtml: string;
  footerHtml: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  discountCodeId?: number;
  isActive?: boolean;
}

/**
 * DTO for sending promotion email (bulk or test).
 */
export interface SendPromotionEmailDTO {
  templateId: number;
  recipientEmail?: string; // Required for test emails
  isTestEmail: boolean;
  // Optional overrides
  subjectOverride?: string;
  bodyHtmlOverride?: string;
}

/**
 * DTO for promotion email sent log entry.
 */
export interface PromotionEmailSentLogDTO {
  id?: number;
  tenantId: string;
  templateId: number;
  eventId: number;
  recipientEmail: string;
  subject: string;
  promotionCode?: string;
  discountCodeId?: number;
  sentAt: string;
  isTestEmail: boolean;
  emailStatus: 'SENT' | 'FAILED' | 'BOUNCED';
  errorMessage?: string;
  sentById?: number;
  template?: PromotionEmailTemplateDTO;
  event?: EventDetailsDTO;
}

/**
 * Payload for public contact form submissions (footer, contact page).
 * SES from/to addresses are resolved server-side from tenant_email_addresses by emailType.
 */
export interface ContactFormSubmitDTO {
  firstName: string;
  lastName: string;
  messageBody: string;
  /** Visitor email (Reply-To and confirmation recipient). */
  senderEmail: string;
  /** Tenant email type used to look up verified from/copy-to addresses (e.g. CONTACT). */
  emailType: TenantEmailAddressDTO['emailType'];
  tenantId?: string;
}

/**
 * DTO for tenant email addresses, matching `tenant_email_addresses` table / backend schema.
 * Stores per-tenant "from" addresses categorized by type (INFO, SALES, TICKETS, CONTACT, etc.).
 */
export interface TenantEmailAddressDTO {
  id?: number;
  tenantId: string;
  emailAddress: string;
  /**
   * Optional copy-to address that will be placed in the CC header for outgoing emails.
   * Maps to the `copy_to_email_address` column in the `tenant_email_addresses` table.
   */
  copyToEmailAddress?: string | null;
  /**
   * Optional Reply-To address for outbound emails of this type.
   * When set, recipients reply to this address instead of the visitor/sender.
   * Maps to the `reply_to_email_address` column in the `tenant_email_addresses` table.
   */
  replyToEmailAddress?: string | null;
  /**
   * Email address type:
   * INFO, SALES, TICKETS, CONTACT, SUPPORT, MARKETING, NOREPLY, ADMIN.
   */
  emailType: 'INFO' | 'SALES' | 'TICKETS' | 'CONTACT' | 'SUPPORT' | 'MARKETING' | 'NOREPLY' | 'ADMIN';
  displayName?: string;
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for executive committee team member data, matches backend OpenAPI schema.
 */
export interface ExecutiveCommitteeTeamMemberDTO {
  id: number | null;
  firstName: string;
  lastName: string;
  title: string;
  designation?: string;
  bio?: string;
  email?: string;
  profileImageUrl?: string;
  expertise?: string;
  imageBackground?: string;
  imageStyle?: string;
  department?: string;
  joinDate?: string; // ISO date string
  isActive?: boolean;
  linkedinUrl?: string;
  twitterUrl?: string;
  priorityOrder?: number;
  websiteUrl?: string;
}

/**
 * DTO for event featured performers, matches backend OpenAPI schema.
 */
export interface EventFeaturedPerformersDTO {
  id?: number;
  tenantId?: string;
  name: string;
  stageName?: string;
  role?: string;
  bio?: string;
  nationality?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  portraitImageUrl?: string;
  performanceImageUrl?: string;
  galleryImageUrls?: string;
  performanceDurationMinutes?: number;
  performanceOrder?: number;
  isHeadliner: boolean;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  isActive: boolean;
  priorityRanking?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
}

/**
 * DTO for event contacts, matches backend OpenAPI schema.
 */
export interface EventContactsDTO {
  id?: number;
  tenantId?: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
}

/**
 * DTO for event sponsors, matches backend OpenAPI schema.
 */
export interface EventSponsorsDTO {
  id?: number;
  tenantId?: string;
  name: string;
  type: string;
  companyName?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  bannerImageUrl?: string;
  isActive: boolean;
  priorityRanking: number; // Required field based on database constraint
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for event sponsors join (many-to-many relationship), matches backend OpenAPI schema.
 */
export interface EventSponsorsJoinDTO {
  id?: number;
  tenantId?: string;
  createdAt: string;
  /**
   * Custom poster image URL for this specific event-sponsor combination
   */
  customPosterUrl?: string;
  event?: EventDetailsDTO;
  sponsor?: EventSponsorsDTO;
}

/**
 * DTO for event emails, matches backend OpenAPI schema.
 */
export interface EventEmailsDTO {
  id?: number;
  tenantId?: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
}

/**
 * DTO for event program directors, matches backend OpenAPI schema.
 */
export interface EventProgramDirectorsDTO {
  id?: number;
  tenantId?: string;
  name: string;
  photoUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
}

// WhatsApp Integration Types

/**
 * Twilio credentials for WhatsApp integration
 */
export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  whatsappFrom: string;
  webhookUrl?: string;
  webhookToken?: string;
}

/**
 * WhatsApp message request for sending individual messages
 */
export interface WhatsAppMessageRequest {
  recipientPhone: string;
  messageBody: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  type: 'TRANSACTIONAL' | 'MARKETING';
}

/**
 * Bulk WhatsApp message request for sending to multiple recipients
 */
export interface BulkWhatsAppRequest {
  recipients: Array<{
    phone: string;
    name?: string;
    customParams?: Record<string, string>;
  }>;
  messageBody: string;
  templateName?: string;
  scheduledAt?: string;
  type: 'TRANSACTIONAL' | 'MARKETING';
}

/**
 * WhatsApp message template
 */
export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER';
    text?: string;
    format?: string;
  }>;
}

/**
 * WhatsApp analytics data
 */
export interface WhatsAppAnalytics {
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  readMessages: number;
  deliveryRate: number;
  readRate: number;
  periodStart: string;
  periodEnd: string;
  dailyVolume?: Array<{
    date: string;
    count: number;
  }>;
  maxDailyVolume?: number;
  costData?: {
    totalCost: number;
    costPerMessage: number;
    currency: string;
  };
  performanceMetrics?: {
    averageDeliveryTime: number;
    errorRate: number;
    responseRate: number;
  };
}

/**
 * Connection test result for WhatsApp integration
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: {
    accountStatus: string;
    whatsappStatus: string;
    webhookStatus: string;
  };
}

/**
 * Bulk message progress tracking
 */
export interface BulkMessageProgress {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  inProgress: boolean;
  estimatedTimeRemaining?: string;
}

/**
 * WhatsApp message delivery status
 */
export interface WhatsAppMessageStatus {
  id: string;
  recipientPhone: string;
  messageBody: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  templateId?: string;
}

/**
 * WhatsApp usage statistics
 */
export interface WhatsAppUsageStats {
  period: string;
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  totalCost: number;
  costPerMessage: number;
  deliveryRate: number;
  readRate: number;
}

/**
 * WhatsApp webhook payload
 */
export interface WhatsAppWebhookPayload {
  MessageSid: string;
  From: string;
  To: string;
  Body?: string;
  Status: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  Timestamp: string;
}

/**
 * Payment Provider Types
 */
export enum PaymentProviderType {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  REVOLUT = 'REVOLUT',
  ZEFFY = 'ZEFFY',
  ZELLE = 'ZELLE',
  CEFI = 'CEFI',
  GIVEBUTTER = 'GIVEBUTTER',
}

/**
 * Payment Use Case Types
 * Matches backend enum: PaymentUseCase
 * Note: DONATION_ZERO_FEE is also supported (may need backend update)
 */
export enum PaymentUseCase {
  TICKET_SALE = 'TICKET_SALE',
  DONATION = 'DONATION',
  DONATION_CEFI = 'DONATION_CEFI',
  DONATION_ZERO_FEE = 'DONATION_ZERO_FEE',
  OFFERING = 'OFFERING',
  MEMBERSHIP_SUBSCRIPTION = 'MEMBERSHIP_SUBSCRIPTION',
}

/**
 * Payment Status Types
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CONFIRMED = 'CONFIRMED', // For manual payments like Zelle
}

/**
 * Payment Session Response - returned by /api/payments/initialize
 * Matches backend PaymentSessionResponse structure
 */
export interface PaymentSessionResponse {
  transactionId: string;
  provider?: PaymentProviderType | string; // Backend returns PaymentProvider enum/string
  providerType?: PaymentProviderType; // Normalized field (mapped from provider)
  status?: string; // Payment status
  clientSecret?: string; // For Stripe PaymentIntent
  sessionUrl?: string; // For hosted checkouts (Stripe Instant Checkout, PayPal, Revolut)
  publishableKey?: string; // For Stripe Elements (REQUIRED for Stripe)
  supportedMethods?: string[]; // List of supported payment methods
  amount?: number; // Payment amount
  currency?: string; // Payment currency
  providerMetadata?: Record<string, any>; // Provider-specific metadata
  requiresAction?: boolean; // Whether payment requires additional action
  actionType?: string; // Type of action required (e.g., 'redirect', '3ds')
  actionData?: Record<string, any>; // Data for required action
  failureReason?: string; // Failure reason if payment failed
  metadata?: Record<string, any>; // Additional metadata
  // Legacy fields (for backward compatibility)
  paymentMethod?: string; // Payment method hint (e.g., 'card', 'wallet', 'zelle')
  expiresAt?: string; // ISO date-time when session expires
}

/**
 * Payment Status Response - returned by /api/payments/{transactionId}
 */
export interface PaymentStatusResponse {
  transactionId: string;
  status: PaymentStatus;
  providerType: PaymentProviderType;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  paymentReference?: string; // Provider transaction ID
  failureReason?: string;
  settlementInfo?: PaymentSettlementInfo;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Ticket purchase fields (only populated when status=SUCCEEDED and it's a ticket purchase)
  ticketTransactionId?: number; // EventTicketTransaction ID
  qrCodeUrl?: string; // QR code image URL - REQUIRED for frontend display
  emailSent?: boolean; // Whether ticket email was sent
  eventId?: number; // Event ID for ticket purchases
}

/**
 * Payment Settlement Information
 */
export interface PaymentSettlementInfo {
  settlementBatchId?: string;
  platformInvoiceId?: string;
  platformFeeAmount?: number;
  processingFeeAmount?: number;
  netAmount?: number;
  settlementDate?: string;
}

/**
 * Payment Provider Configuration
 */
export interface PaymentProviderConfigDTO {
  id?: number;
  tenantId: string;
  providerType: PaymentProviderType;
  paymentUseCase?: PaymentUseCase;
  isActive: boolean;
  supportsAcp?: boolean; // Stripe Instant Checkout / ACP
  supportsZeffy?: boolean;
  supportsZelle?: boolean;
  supportsRevolut?: boolean;
  priorityOrder?: number; // Fallback ordering
  configJson?: Record<string, any>; // Encrypted provider credentials
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payment Transaction - unified payment record
 */
export interface PaymentTransactionDTO {
  id?: number;
  tenantId: string;
  transactionReference: string; // Generated unique reference
  providerType: PaymentProviderType;
  paymentUseCase: PaymentUseCase;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string; // Provider transaction ID
  providerCustomerId?: string; // Provider customer ID (e.g., Stripe customer ID)
  providerSessionId?: string; // Provider session ID (e.g., Stripe checkout session ID)
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  // Removed deprecated fields: settlementBatchId, platformInvoiceId, manualPaymentReference
  metadata?: Record<string, any>;
  // Related entities
  eventId?: number;
  userId?: number;
  membershipSubscriptionId?: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Relations
  event?: EventDetailsDTO;
  user?: UserProfileDTO;
}

/**
 * Payment Transaction Item - line items for a payment
 */
export interface PaymentTransactionItemDTO {
  id?: number;
  transactionId: number;
  itemType: string; // 'TICKET', 'DONATION', 'MEMBERSHIP', etc.
  itemId?: number; // Reference to ticket type, membership plan, etc.
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxAmount?: number;
  discountAmount?: number;
  platformFeeAmount?: number;
  processingFeeAmount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Donation Transaction DTO - Matches backend donation_transaction table schema
 */
export interface DonationTransactionDTO {
  id?: number;
  tenantId?: string;
  eventId?: number;
  paymentTransactionId?: number;
  transactionReference: string;
  givebutterDonationId?: string;
  amount: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  prayerIntention?: string;
  isRecurring?: boolean;
  isAnonymous?: boolean;
  status: string; // 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'
  qrCodeUrl?: string;
  qrCodeImageUrl?: string;
  emailSent?: boolean;
  metadata?: string; // JSON string
  createdAt: string;
  updatedAt: string;
  // Relations
  event?: EventDetailsDTO;
}

/**
 * Payment Initialization Request
 */
export interface PaymentInitializeRequest {
  paymentUseCase: PaymentUseCase;
  amount: number;
  currency: string;
  items: PaymentItem[];
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  returnUrl?: string; // For redirect-based flows
  cancelUrl?: string; // For redirect-based flows
  metadata?: Record<string, any>;
  // Context-specific fields
  eventId?: number;
  membershipPlanId?: number;
  discountCode?: string;
}

/**
 * Payment Item for initialization
 */
export interface PaymentItem {
  itemType: string;
  itemId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Payment Refund Request
 */
export interface PaymentRefundRequest {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason?: string;
}

/**
 * Membership Plan DTO - Matches backend schema from PRD
 */
export interface MembershipPlanDTO {
  id?: number;
  tenantId: string;
  planName: string;
  planCode: string;
  description?: string;
  planType: 'SUBSCRIPTION' | 'ONE_TIME' | 'FREEMIUM';
  billingInterval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  price: number;
  currency: string;
  trialDays?: number;
  isActive: boolean;
  maxEventsPerMonth?: number;
  maxAttendeesPerEvent?: number;
  featuresJson?: Record<string, any>;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Membership Subscription DTO - Matches backend schema from PRD
 */
export interface MembershipSubscriptionDTO {
  id?: number;
  tenantId: string;
  userProfileId: number;
  membershipPlanId: number;
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
  currentPeriodStart: string; // ISO date string (YYYY-MM-DD)
  currentPeriodEnd: string; // ISO date string (YYYY-MM-DD)
  trialStart?: string; // ISO date string (YYYY-MM-DD)
  trialEnd?: string; // ISO date string (YYYY-MM-DD)
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string; // ISO timestamp string
  cancellationReason?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  paymentProviderConfigId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Relations (optional, for expanded responses)
  userProfile?: UserProfileDTO;
  membershipPlan?: MembershipPlanDTO;
}

/**
 * Platform Settlement DTO
 */
export interface PlatformSettlementDTO {
  id?: number;
  tenantId: string;
  providerType: PaymentProviderType;
  settlementDate: string; // Date of settlement
  grossAmount: number;
  processingFeeAmount: number;
  platformFeeAmount: number;
  netAmount: number;
  transactionCount: number;
  status: 'PENDING' | 'SETTLED' | 'INVOICED';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Platform Invoice DTO
 */
export interface PlatformInvoiceDTO {
  id?: number;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  settlementBatchIds?: string[]; // Related settlement batches
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Manual Payment Method Type
 */
export type ManualPaymentMethodType =
  | 'ZELLE_MANUAL'
  | 'VENMO_MANUAL'
  | 'CASH_APP_MANUAL'
  | 'CASH'
  | 'CHECK'
  | 'OTHER_MANUAL';

/**
 * Manual Payment Status
 */
export type ManualPaymentStatus = 'REQUESTED' | 'RECEIVED' | 'VOIDED' | 'CANCELLED';

/**
 * Manual Payment Request DTO
 */
export interface ManualPaymentRequestDTO {
  id?: number;
  tenantId?: string;
  eventId: number;
  ticketTransactionId?: number;
  amountDue: number;
  manualPaymentMethodType: ManualPaymentMethodType;
  paymentHandle?: string;
  paymentInstructions?: string;
  status: ManualPaymentStatus;
  proofOfPaymentFileKey?: string;
  proofOfPaymentFileUrl?: string;
  proofOfPaymentUploadedAt?: string;
  receivedAt?: string;
  receivedBy?: string;
  voidReason?: string;
  createdAt?: string;
  updatedAt?: string;
  // Requester information (sent to backend but may not be in response DTO)
  requesterEmail?: string;
  requesterName?: string;
  requesterPhone?: string;
  // Backend supports selectedTickets as JSON string for transaction item creation
  // Format: '[{"ticketTypeId": 4151, "quantity": 1}, {"ticketTypeId": 4152, "quantity": 2}]'
  selectedTickets?: string;
  // Backend also supports cart array format (alternative to selectedTickets)
  cart?: Array<{ ticketTypeId: number; quantity: number }>;
}

/**
 * Manual Payment Summary Report DTO
 */
export interface ManualPaymentSummaryReportDTO {
  id?: number;
  tenantId: string;
  eventId: number;
  snapshotDate: string; // DATE format: YYYY-MM-DD
  manualPaymentMethodType: ManualPaymentMethodType;
  status: ManualPaymentStatus;
  totalAmount: number;
  requestCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// --- Event Competitions ---

export type CompetitionAudienceMode = 'YOUTH' | 'ADULT' | 'MIXED';
export type CompetitionRegistrationMode = 'PARENT_CHILD' | 'SELF' | 'TEAM_CAPTAIN' | 'MIXED';
export type CompetitionResultsDisplayMode = 'FULL_NAME' | 'INITIALS' | 'ANONYMOUS';
export type CompetitionType = 'INDIVIDUAL' | 'GROUP';
export type CompetitionEligibleAudience = 'YOUTH_ONLY' | 'ADULT_ONLY' | 'ALL';
export type CompetitionParticipantType = 'CHILD' | 'ADULT' | 'TEAM_MEMBER';
export type CompetitionRegistrationStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
export type CompetitionDisciplineCode =
  | 'SONG'
  | 'SPEECH'
  | 'DANCE'
  | 'MUSIC'
  | 'SPORTS'
  | 'ART'
  | 'OTHER';
export type CompetitionGroupMemberRole = 'CAPTAIN' | 'MEMBER';
export type RegistrationActorMode = 'PARENT' | 'SELF' | 'TEAM_CAPTAIN';

export interface EventCompetitionSettingsDTO {
  id?: number | null;
  tenantId?: string;
  audienceMode: CompetitionAudienceMode;
  registrationMode: CompetitionRegistrationMode;
  registrationDeadline?: string | null;
  registrationOpen: boolean;
  allowTicketSales: boolean;
  pointsFirst: number;
  pointsSecond: number;
  pointsThird: number;
  pointsFourth?: number;
  defaultMaxPlacements?: number;
  championEnabled: boolean;
  championExcludeGroupPoints: boolean;
  championMaxCategory?: number | null;
  resultsDisplayMode?: CompetitionResultsDisplayMode | null;
  eligibilityText?: string | null;
  winnersPublishedEmailSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  event?: EventDetailsDTO;
}

export interface EventCompetitionDayDTO {
  id?: number | null;
  tenantId?: string;
  dayLabel: string;
  eventDate: string;
  venueName: string;
  venueAddress?: string | null;
  sortOrder: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  event?: EventDetailsDTO;
}

export interface EventCompetitionDTO {
  id?: number | null;
  tenantId?: string;
  name: string;
  description?: string | null;
  competitionType: CompetitionType;
  eligibleAudience: CompetitionEligibleAudience;
  categoryCode?: string | null;
  divisionLabel?: string | null;
  track?: string | null;
  feeAmount: number;
  maxParticipants?: number | null;
  minGroupSize?: number | null;
  maxGroupSize?: number | null;
  timeLimitMinutes?: number | null;
  requiresSoundtrack: boolean;
  judgmentCriteriaJson?: string | null;
  disciplineCode?: CompetitionDisciplineCode | null;
  minAge?: number | null;
  maxAge?: number | null;
  minGrade?: number | null;
  maxGrade?: number | null;
  maxPlacements?: number | null;
  registrationDeadline?: string | null;
  rulesMarkdown?: string | null;
  requiresTeamName?: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  event?: EventDetailsDTO;
  competitionDay?: EventCompetitionDayDTO;
}

export interface EventCompetitionParticipantDTO {
  id?: number | null;
  tenantId?: string;
  participantType: CompetitionParticipantType;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  dateOfBirth?: string | null;
  currentGrade?: number | null;
  schoolName?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  userProfile?: UserProfileDTO;
  guardianUserProfile?: UserProfileDTO;
}

export interface EventCompetitionRegistrationDTO {
  id?: number | null;
  tenantId?: string;
  registrationStatus: CompetitionRegistrationStatus;
  feeAmount: number;
  effectiveCategory?: string | null;
  stripePaymentIntentId?: string | null;
  teamName?: string | null;
  teamDisplayName?: string | null;
  confirmationEmailSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  event?: EventDetailsDTO;
  competition?: EventCompetitionDTO;
  participantProfile?: EventCompetitionParticipantDTO;
  groupLeaderRegistration?: EventCompetitionRegistrationDTO | null;
  registeredByUserProfile?: UserProfileDTO;
}

export interface EventCompetitionGroupMemberDTO {
  id?: number | null;
  tenantId?: string;
  memberRole: CompetitionGroupMemberRole;
  sortOrder: number;
  createdAt?: string;
  registration?: EventCompetitionRegistrationDTO;
  participantProfile?: EventCompetitionParticipantDTO;
}

export interface CompetitionEligibilityCheckDTO {
  eligible: boolean;
  reasons: string[];
}

export interface TeamRegistrationRequestDTO {
  leaderRegistration: Partial<EventCompetitionRegistrationDTO>;
  memberParticipantIds: number[];
  teamName?: string;
  teamDisplayName?: string;
  groupMembers?: EventCompetitionGroupMemberDTO[];
}

export interface EventCompetitionResultDTO {
  id?: number | null;
  tenantId?: string;
  displayName: string;
  placement?: number | null;
  placementLabel?: string | null;
  prizeTitle?: string | null;
  prizeDetails?: string | null;
  pointsAwarded: number;
  winnerPhotoUrl?: string | null;
  notes?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  event?: EventDetailsDTO;
  competition?: EventCompetitionDTO;
  participantProfile?: EventCompetitionParticipantDTO;
  registration?: EventCompetitionRegistrationDTO;
  winnerMedia?: EventMediaDTO;
}

export interface EventCompetitionContentBlockDTO {
  id?: number | null;
  tenantId?: string;
  blockType: string;
  title?: string | null;
  bodyMarkdown: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  event?: EventDetailsDTO;
}
