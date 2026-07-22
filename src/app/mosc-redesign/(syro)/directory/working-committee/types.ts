import type { DirectoryListPagination } from '@/app/mosc-redesign/(syro)/directory/types/listPagination';

export interface WorkingCommitteeEntry {
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
}

export interface WorkingCommitteesListResult {
  entries: WorkingCommitteeEntry[];
  pagination: DirectoryListPagination;
}

export type WorkingCommitteesListOptions = {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
};
