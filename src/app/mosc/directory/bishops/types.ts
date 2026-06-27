/**
 * Types for Directory Bishops (Strapi api/bishops).
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §3
 */

export type BishopType = 'catholicos' | 'diocesan' | 'retired';

/** Normalized bishop for list/detail (from Strapi). */
export interface Bishop {
  documentId: string;
  name: string;
  slug: string;
  bishopType: BishopType;
  imageUrl: string | null;
  imageAlt: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  dioceseName: string | null;
  order: number;
}

/** Strapi pagination meta. */
export interface StrapiPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface BishopsListResult {
  bishops: Bishop[];
  pagination: StrapiPagination;
}
