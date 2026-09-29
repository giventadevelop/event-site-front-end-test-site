import type { DirectoryListPagination } from '../directory/types/listPagination';

export interface CatholicateEntry {
  documentId: string;
  name: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface CatholicateEntriesListOptions {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
  /** When true, exclude intro/hub-banner slugs from results. */
  excludeIntro?: boolean;
}

export interface CatholicateEntriesListResult {
  entries: CatholicateEntry[];
  pagination: DirectoryListPagination;
}

/** Slugs reserved for hub intro content (excluded from the card grid). */
export const CATHOLICATE_INTRO_SLUGS = new Set([
  'catholicate-intro',
  'catholicate-intro-mo2',
  'catholicate',
  'introduction',
  'the-catholicate-introduction',
]);

/** Strip env suffix (e.g. `-mo2`) so local/prod slug variants share the same order key. */
export function normalizeCatholicateSlug(slug: string): string {
  return slug.replace(/-mo2$/, '');
}

export function isCatholicateIntroEntry(entry: CatholicateEntry): boolean {
  if (CATHOLICATE_INTRO_SLUGS.has(entry.slug)) return true;
  const base = normalizeCatholicateSlug(entry.slug);
  return (
    CATHOLICATE_INTRO_SLUGS.has(base) ||
    base === 'catholicate-intro' ||
    base.startsWith('catholicate-intro-')
  );
}

/**
 * Hub card order — matches static `/mosc-redesign/catholicate` (catholicosCards array).
 * Keys are base slugs (without `-mo2`); see normalizeCatholicateSlug.
 */
export const CATHOLICATE_HUB_CARD_SLUG_ORDER: readonly string[] = [
  'his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara',
  'his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara',
  'his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara',
  'his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara',
  'his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara',
  'his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara',
  'his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara',
  'h-h-baselios-marthoma-paulose-ii',
];

function catholicateHubOrderIndex(slug: string): number {
  const orderBySlug = new Map(CATHOLICATE_HUB_CARD_SLUG_ORDER.map((s, index) => [s, index]));
  return (
    orderBySlug.get(slug) ??
    orderBySlug.get(normalizeCatholicateSlug(slug)) ??
    Number.MAX_SAFE_INTEGER
  );
}

export function sortCatholicateHubEntries(entries: CatholicateEntry[]): CatholicateEntry[] {
  return [...entries].sort((a, b) => {
    const aIndex = catholicateHubOrderIndex(a.slug);
    const bIndex = catholicateHubOrderIndex(b.slug);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.order - b.order || a.name.localeCompare(b.name);
  });
}

/** Sidebar / detail nav: intro first, then Catholicoi in chronological hub order. */
export function sortCatholicateSidebarEntries(entries: CatholicateEntry[]): CatholicateEntry[] {
  const intros = entries.filter(isCatholicateIntroEntry);
  const rest = sortCatholicateHubEntries(entries.filter((e) => !isCatholicateIntroEntry(e)));
  return [...intros, ...rest];
}
