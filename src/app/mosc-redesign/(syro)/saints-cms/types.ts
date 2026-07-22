import type { DirectoryListPagination } from '../directory/types/listPagination';

export interface SaintEntry {
  documentId: string;
  name: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface SaintEntriesListOptions {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
}

export interface SaintEntriesListResult {
  entries: SaintEntry[];
  pagination: DirectoryListPagination;
}
