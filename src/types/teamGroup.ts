/**
 * DTO for team group (squad / band roster metadata).
 */
export interface TeamGroupDTO {
  id: number | null;
  tenantId?: string;
  teamType: 'SPORTS' | 'MUSIC' | 'OTHER' | string;
  name: string;
  slug?: string;
  sectionLabel?: string;
  headline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
