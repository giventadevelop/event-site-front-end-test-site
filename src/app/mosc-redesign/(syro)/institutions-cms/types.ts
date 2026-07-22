import type { DirectoryListPagination } from '@/app/mosc-redesign/(syro)/directory/types/listPagination';

export interface InstitutionEntry {
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

export interface InstitutionsListResult {
  entries: InstitutionEntry[];
  pagination: DirectoryListPagination;
}

export type InstitutionsListOptions = {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
  /** When true (default for no options), load every page for CMS hub grouping. */
  loadAll?: boolean;
};
