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

export interface CatholicateEntriesListResult {
  entries: CatholicateEntry[];
}

/** Slugs reserved for hub intro content (excluded from the card grid). */
export const CATHOLICATE_INTRO_SLUGS = new Set([
  'catholicate-intro',
  'catholicate',
  'introduction',
  'the-catholicate-introduction',
]);

export function isCatholicateIntroEntry(entry: CatholicateEntry): boolean {
  return CATHOLICATE_INTRO_SLUGS.has(entry.slug);
}

/**
 * Hub card order — matches static `/mosc-redesign/catholicate` (catholicosCards array).
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

export function sortCatholicateHubEntries(entries: CatholicateEntry[]): CatholicateEntry[] {
  const orderBySlug = new Map(CATHOLICATE_HUB_CARD_SLUG_ORDER.map((slug, index) => [slug, index]));
  return [...entries].sort((a, b) => {
    const aIndex = orderBySlug.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderBySlug.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.order - b.order || a.name.localeCompare(b.name);
  });
}
