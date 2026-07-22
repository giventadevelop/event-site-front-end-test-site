export type HolySynodMemberType = 'catholicos' | 'metropolitan';

export interface HolySynodMember {
  documentId: string;
  name: string;
  slug: string;
  memberType: HolySynodMemberType;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  order: number;
}

export interface HolySynodMembersListResult {
  members: HolySynodMember[];
  pagination: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
}

export type HolySynodCategoryFilter = 'all' | HolySynodMemberType;

export interface HolySynodMembersListOptions {
  nameSearch?: string;
  /** Filter by memberType; omit or `all` for every member. */
  memberType?: HolySynodMemberType;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
}
