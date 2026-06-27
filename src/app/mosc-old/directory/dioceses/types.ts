/** Normalized diocese from Strapi GET /api/dioceses. */
export interface Diocese {
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
}

export interface StrapiPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface DiocesesListResult {
  dioceses: Diocese[];
  pagination: StrapiPagination;
}
