/**
 * Server-side data for Kalpana CMS (Strapi kalpana-page + kalpana-editions).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import {
  findByStrapiSlug,
  normalizeStrapiSlug,
  unwrapStrapiRecord,
} from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { KalpanaCmsData, KalpanaEdition, KalpanaPageContent } from './types';

const DEFAULT_HERO_IMAGE = '/images/downloads/kalpana.png';
const DEFAULT_CARD_IMAGE = '/images/downloads/kalapana_card_logo.png';

const DEFAULT_INTRO_1 =
  'The official annual calendar and directory of the Malankara Orthodox Syrian Church.';
const DEFAULT_INTRO_2 =
  'The Kalpana contains important liturgical dates, feast days, fasts, parish directories, and essential church information for the year.';

const DEFAULT_ABOUT_TITLE = 'About Kalpana';
const DEFAULT_ABOUT_DESCRIPTION =
  'The Kalpana is an indispensable resource for every Orthodox faithful, providing a comprehensive guide to the liturgical year and church administration.';
const DEFAULT_ABOUT_FEATURES = [
  'Complete liturgical calendar with feast days and fasts',
  'Directory of parishes, priests, and church officials',
  'Important church announcements and guidelines',
  'Contact information for dioceses and institutions',
];

const editionDetailPath = (year: string) => `/mosc-redesign/kalpana-cms/kalpana-${year}`;

const DEFAULT_EDITIONS: KalpanaEdition[] = [
  { documentId: '2026', title: 'Kalpana 2026', slug: 'kalpana-2026', year: '2026', externalLink: editionDetailPath('2026'), available: true, cardImageUrl: null, cardImageAlt: null, order: 12 },
  { documentId: '2025', title: 'Kalpana 2025', slug: 'kalpana-2025', year: '2025', externalLink: editionDetailPath('2025'), available: true, cardImageUrl: null, cardImageAlt: null, order: 11 },
  { documentId: '2024', title: 'Kalpana 2024', slug: 'kalpana-2024', year: '2024', externalLink: editionDetailPath('2024'), available: true, cardImageUrl: null, cardImageAlt: null, order: 10 },
  { documentId: '2023', title: 'Kalpana 2023', slug: 'kalpana-2023', year: '2023', externalLink: editionDetailPath('2023'), available: true, cardImageUrl: null, cardImageAlt: null, order: 9 },
  { documentId: '2022', title: 'Kalpana 2022', slug: 'kalpana-2022', year: '2022', externalLink: editionDetailPath('2022'), available: true, cardImageUrl: null, cardImageAlt: null, order: 8 },
  { documentId: '2021', title: 'Kalpana- 2021', slug: 'kalpana-2021', year: '2021', externalLink: editionDetailPath('2021'), available: true, cardImageUrl: null, cardImageAlt: null, order: 7 },
  { documentId: '2020', title: 'Kalpana 2020', slug: 'kalpana-2020', year: '2020', externalLink: editionDetailPath('2020'), available: true, cardImageUrl: null, cardImageAlt: null, order: 6 },
  { documentId: '2019', title: 'Kalpana- 2019', slug: 'kalpana-2019', year: '2019', externalLink: editionDetailPath('2019'), available: true, cardImageUrl: null, cardImageAlt: null, order: 5 },
  { documentId: '2018', title: 'Kalpana 2018', slug: 'kalpana-2018', year: '2018', externalLink: editionDetailPath('2018'), available: true, cardImageUrl: null, cardImageAlt: null, order: 4 },
  { documentId: '2017', title: 'Kalpana 2017', slug: 'kalpana-2017', year: '2017', externalLink: editionDetailPath('2017'), available: true, cardImageUrl: null, cardImageAlt: null, order: 3 },
  { documentId: '2016', title: 'Kalpana 2016', slug: 'kalpana-2016', year: '2016', externalLink: editionDetailPath('2016'), available: true, cardImageUrl: null, cardImageAlt: null, order: 2 },
  { documentId: '2015', title: 'Kalpana 2015', slug: 'kalpana-2015', year: '2015', externalLink: editionDetailPath('2015'), available: true, cardImageUrl: null, cardImageAlt: null, order: 1 },
];

const DEFAULT_PAGE: KalpanaPageContent = {
  heroImageUrl: DEFAULT_HERO_IMAGE,
  heroImageAlt: 'Kalpana',
  introParagraph1: DEFAULT_INTRO_1,
  introParagraph2: DEFAULT_INTRO_2,
  aboutTitle: DEFAULT_ABOUT_TITLE,
  aboutDescription: DEFAULT_ABOUT_DESCRIPTION,
  aboutFeatures: DEFAULT_ABOUT_FEATURES,
};

function parseAboutFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      return [];
    }
  }
  return DEFAULT_ABOUT_FEATURES;
}

function resolveEditionSlug(raw: Record<string, unknown>): string {
  const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
  if (slug) return slug;
  const yearRaw = raw.year;
  const year =
    typeof yearRaw === 'string' ? yearRaw.trim() : typeof yearRaw === 'number' ? String(yearRaw) : '';
  if (year) return `kalpana-${year}`;
  return '';
}

function findEditionBySlug(editions: KalpanaEdition[], editionSlug: string): KalpanaEdition | undefined {
  const bySlug = findByStrapiSlug(editions, editionSlug);
  if (bySlug) return bySlug;
  const target = normalizeStrapiSlug(editionSlug);
  return editions.find((e) => e.year && target === normalizeStrapiSlug(`kalpana-${e.year}`));
}

export function synthesizeKalpanaEditionFromSlug(editionSlug: string): KalpanaEdition | null {
  const trimmed = editionSlug.trim();
  const match = /^kalpana-(\d{4})$/i.exec(trimmed);
  if (!match) return null;
  const year = match[1];
  const slug = `kalpana-${year}`;
  return {
    documentId: year,
    title: `Kalpana ${year}`,
    slug,
    year,
    externalLink: editionDetailPath(year),
    available: true,
    cardImageUrl: null,
    cardImageAlt: null,
    order: 0,
  };
}

function parseEdition(raw: Record<string, unknown>, baseUrl: string): KalpanaEdition {
  const item = unwrapStrapiRecord(raw);
  const documentId =
    typeof item.documentId === 'string'
      ? item.documentId
      : typeof item.id === 'number'
        ? String(item.id)
        : '';
  const title = typeof item.title === 'string' ? item.title : '';
  const slug = resolveEditionSlug(item);
  const yearRaw = item.year;
  const year =
    typeof yearRaw === 'string' ? yearRaw : typeof yearRaw === 'number' ? String(yearRaw) : '';
  const externalLinkRaw =
    typeof item.externalLink === 'string' && item.externalLink.trim() ? item.externalLink.trim() : null;
  const externalLink =
    externalLinkRaw ?? (slug ? `/mosc-redesign/kalpana-cms/${slug}` : year ? editionDetailPath(year) : null);
  const available = typeof item.available === 'boolean' ? item.available : true;
  const order = typeof item.order === 'number' ? item.order : 0;
  const cardImage = item.cardImage;
  const cardImageUrl = cardImage ? getMediaUrl(cardImage, baseUrl) : null;
  const cardImageAlt = cardImage ? getMediaAlt(cardImage) ?? null : null;

  return {
    documentId,
    title,
    slug,
    year,
    externalLink,
    available,
    cardImageUrl,
    cardImageAlt,
    order,
  };
}

function parsePage(raw: Record<string, unknown>, baseUrl: string): KalpanaPageContent {
  const item = unwrapStrapiRecord(raw);
  const heroImage = item.heroImage;
  const heroImageUrl = heroImage ? getMediaUrl(heroImage, baseUrl) : null;

  return {
    heroImageUrl: heroImageUrl ?? DEFAULT_HERO_IMAGE,
    heroImageAlt: heroImage ? getMediaAlt(heroImage) ?? 'Kalpana' : 'Kalpana',
    introParagraph1:
      typeof item.introParagraph1 === 'string' && item.introParagraph1.trim()
        ? item.introParagraph1.trim()
        : DEFAULT_INTRO_1,
    introParagraph2:
      typeof item.introParagraph2 === 'string' && item.introParagraph2.trim()
        ? item.introParagraph2.trim()
        : DEFAULT_INTRO_2,
    aboutTitle:
      typeof item.aboutTitle === 'string' && item.aboutTitle.trim()
        ? item.aboutTitle.trim()
        : DEFAULT_ABOUT_TITLE,
    aboutDescription:
      typeof item.aboutDescription === 'string' && item.aboutDescription.trim()
        ? item.aboutDescription.trim()
        : DEFAULT_ABOUT_DESCRIPTION,
    aboutFeatures: parseAboutFeatures(item.aboutFeatures),
  };
}

async function fetchKalpanaEditionBySlugDirect(
  editionSlug: string,
  baseUrl: string,
  base: string,
  tenantId: string
): Promise<KalpanaEdition | null> {
  const tryFetch = async (params: URLSearchParams): Promise<KalpanaEdition | null> => {
    const url = `${base}/kalpana-editions?${params.toString()}`;
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const raw = list[0];
    if (!raw || typeof raw !== 'object') return null;
    const edition = parseEdition(raw as Record<string, unknown>, baseUrl);
    return edition.slug || edition.year ? edition : null;
  };

  const slugParams = new URLSearchParams();
  slugParams.set('filters[tenant][tenantId][$eq]', tenantId);
  slugParams.set('filters[slug][$eqi]', editionSlug);
  slugParams.set('populate[0]', 'cardImage');
  slugParams.set('pagination[pageSize]', '1');

  const bySlug = await tryFetch(slugParams);
  if (bySlug) return bySlug;

  const yearMatch = /^kalpana-(\d{4})$/i.exec(editionSlug.trim());
  if (!yearMatch) return null;

  const yearParams = new URLSearchParams();
  yearParams.set('filters[tenant][tenantId][$eq]', tenantId);
  yearParams.set('filters[year][$eq]', yearMatch[1]);
  yearParams.set('populate[0]', 'cardImage');
  yearParams.set('pagination[pageSize]', '1');

  return tryFetch(yearParams);
}

async function fetchKalpanaPage(baseUrl: string, base: string, tenantId: string): Promise<KalpanaPageContent> {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('populate[0]', 'heroImage');

  const url = `${base}/kalpana-page?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return DEFAULT_PAGE;
    }
    const json = (await res.json()) as { data?: unknown };
    const raw = json?.data;
    if (!raw || typeof raw !== 'object') {
      return DEFAULT_PAGE;
    }
    return parsePage(raw as Record<string, unknown>, baseUrl);
  } catch {
    return DEFAULT_PAGE;
  }
}

async function fetchKalpanaEditions(baseUrl: string, base: string, tenantId: string): Promise<KalpanaEdition[]> {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('sort', 'order:desc,year:desc');
  params.set('populate[0]', 'cardImage');
  params.set('pagination[pageSize]', '100');

  const url = `${base}/kalpana-editions?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return DEFAULT_EDITIONS;
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const editions = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseEdition(item, baseUrl));
    return editions.length > 0 ? editions : DEFAULT_EDITIONS;
  } catch {
    return DEFAULT_EDITIONS;
  }
}

export async function getKalpanaCmsData(): Promise<KalpanaCmsData> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();

  if (!baseUrl || !base || !tenantId) {
    return { page: DEFAULT_PAGE, editions: DEFAULT_EDITIONS };
  }

  const [page, editions] = await Promise.all([
    fetchKalpanaPage(baseUrl, base, tenantId),
    fetchKalpanaEditions(baseUrl, base, tenantId),
  ]);

  return { page, editions };
}

export { DEFAULT_CARD_IMAGE, DEFAULT_EDITIONS, findEditionBySlug, fetchKalpanaEditionBySlugDirect };
