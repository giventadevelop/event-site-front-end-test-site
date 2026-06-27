/** Normalized parish from Strapi GET /api/parishes. */
export interface Parish {
  documentId: string;
  name: string;
  slug: string;
  dioceseName: string | null;
  /** Current vicar name when Strapi populates `vicar`. */
  vicarName: string | null;
  address: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  email: string | null;
  phones: string | null;
  phoneSecondary: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  /** Resolved image URL when parish has image media (populate image). */
  imageUrl: string | null;
  /** Alt text for parish image. */
  imageAlt: string | null;
}

export interface StrapiPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface ParishesListResult {
  parishes: Parish[];
  pagination: StrapiPagination;
}
