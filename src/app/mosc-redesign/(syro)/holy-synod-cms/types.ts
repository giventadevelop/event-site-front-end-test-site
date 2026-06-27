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
}
