import type { DirectoryListPagination } from '@/app/mosc-redesign/(syro)/directory/types/listPagination';

export type ManagingCommitteeSection = 'elected' | 'nominated';

export interface ManagingCommitteeEntry {
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  website: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
  section: ManagingCommitteeSection;
  diocese: string;
  term: string | null;
}

export interface ManagingCommitteesListResult {
  entries: ManagingCommitteeEntry[];
  pagination: DirectoryListPagination;
}

export type ManagingCommitteesListOptions = {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
};
