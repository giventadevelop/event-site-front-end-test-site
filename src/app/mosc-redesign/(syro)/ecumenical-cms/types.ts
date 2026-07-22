import type { DirectoryListPagination } from '../directory/types/listPagination';

export interface EcumenicalArticle {
  documentId: string;
  name: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface EcumenicalArticlesListOptions {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
}

export interface EcumenicalArticlesListResult {
  articles: EcumenicalArticle[];
  pagination: DirectoryListPagination;
}
