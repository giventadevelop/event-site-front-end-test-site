export interface ManagingCommitteeMember {
  documentId: string;
  name: string;
  slug: string;
  role: string | null;
  diocese: string | null;
  parish: string | null;
  /** Postal / contact address without phone numbers */
  address: string | null;
  /** Elected region / constituency from roster */
  electedRegion: string | null;
  serialNumber: number | null;
  order: number;
  isCurrent: boolean;
  termYear: number | null;
  notes: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
}

export interface ManagingCommitteeMembersListResult {
  members: ManagingCommitteeMember[];
  pagination: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
}

export interface ManagingCommitteeMembersListOptions {
  /** Free-text search (name only when using Strapi paginated path). Prefer loadAll + filterManagingCommitteeMembers for multi-field. */
  nameSearch?: string;
  termYear?: number;
  isCurrent?: boolean;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
}

/** Client/server filter for roster search (name, role, diocese, region, etc.). */
export interface ManagingCommitteeMembersFilterOptions {
  searchTerm?: string;
  /** Exact match on diocese (case-insensitive). */
  diocese?: string;
  /** Exact match on role (case-insensitive). */
  role?: string;
  /** Exact match on electedRegion (case-insensitive). */
  region?: string;
}
