/** Normalized priest from Strapi GET /api/priests. */
export interface Priest {
  documentId: string;
  name: string;
  slug: string;
  title: string | null;
  dioceseName: string | null;
  parishName: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface StrapiPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface PriestsListResult {
  priests: Priest[];
  pagination: StrapiPagination;
}
