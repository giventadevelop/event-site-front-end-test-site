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

/**
 * Build display name without duplicating a title prefix already present in `name`
 * (e.g. title "Dn." + name "Dn. Abin…" → "Dn. Abin…").
 */
export function formatPriestDisplayName(
  title: string | null | undefined,
  name: string
): string {
  const trimmedName = (name ?? '').trim();
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) return trimmedName;
  if (!trimmedName) return trimmedTitle;

  const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const withoutDuplicate = trimmedName
    .replace(new RegExp(`^${escapedTitle}\\s+`, 'i'), '')
    .trim();

  if (!withoutDuplicate) return trimmedTitle;
  return `${trimmedTitle} ${withoutDuplicate}`;
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
