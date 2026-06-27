/**
 * Server-side data layer for the News Portal homepage.
 * Fetches from Strapi Content API and returns normalized data for the UI.
 *
 * API reference: documentation/news_portal/strapi/api_reference.md
 */

import { fetchStrapi, getStrapiTenantDocumentId, getStrapiUrl, getStrapiTenantId } from '@/lib/strapi';
import {
  STRAPI_NEWS_CATEGORY_SLUGS,
  buildCategorySlugFilter,
} from '@/lib/strapi/newsCategorySlugs';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import type { NewsHomePageData, NewsArticle, FlashNews, FlashNewsItemUI, SidebarPromoBlock, AdSlot } from './types';

/** Strapi 5: Array-style populate; comma-separated populate triggers 400. Include cover so list/detail show images. */
const POPULATE = 'populate[0]=cover&populate[1]=category&populate[2]=author';

/**
 * Extracts media URL from Strapi 4 or Strapi 5 response structure.
 * Handles: populated relation (data.attributes.url), flattened (url, data.url),
 * formats.thumbnail, and relative URLs (prepends Strapi base URL).
 * baseUrl should be Strapi server root (no trailing slash, no /api).
 */
function getMediaUrl(media: unknown, baseUrl: string): string | null {
  if (!media || !baseUrl) return null;
  // Handle array (e.g. multiple media) — use first item
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) {
    m = media[0] as Record<string, unknown>;
  }
  let url: string | undefined;
  // Strapi 5 flattened: url at top level
  url = m?.url as string | undefined;
  if (!url) {
    // Strapi 5 with data wrapper: data.url
    const data = m?.data as Record<string, unknown> | undefined;
    url = data?.url as string | undefined;
  }
  if (!url) {
    // Strapi 4 / Strapi 5 populated relation: data.attributes.url (common after imports)
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url && m?.formats) {
    const formats = m.formats as Record<string, { url?: string }>;
    url = formats?.thumbnail?.url ?? formats?.small?.url ?? formats?.medium?.url;
  }
  if (!url || typeof url !== 'string') return null;
  // Relative URLs: prepend base URL; ensure one slash between base and path
  if (url.startsWith('http')) return url;
  const base = baseUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

/**
 * Extracts alternativeText/caption from Strapi 4 or 5 media structure.
 * Handles populated relation: data.attributes.alternativeText.
 */
function getMediaAlt(media: unknown): string | undefined {
  if (!media) return undefined;
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) m = media[0] as Record<string, unknown>;
  let alt = m?.alternativeText as string | undefined;
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    alt = data?.alternativeText as string | undefined;
  }
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    alt = attrs?.alternativeText as string | undefined;
  }
  return alt;
}

/** Builds article query path (relative to Content API base /api).
 * Same tenant filter pattern as bishops: filters[tenant][tenantId][$eq]=tenantId.
 * Strapi 5 list endpoints: use pagination[page] and pagination[pageSize] (not pagination[limit]).
 * See .cursor/rules/strapi_5_api_patterns.mdc and bishops getBishopsData.ts.
 */
function buildArticleQuery(filters: string, sort: string, pageSize: number, tenantFilter: string): string {
  const parts = [
    'filters[publishedAt][$notNull]=true',
    POPULATE,
    `sort=${sort}`,
    'pagination[page]=1',
    `pagination[pageSize]=${pageSize}`,
  ];
  parts.unshift(tenantFilter);
  if (filters) parts.unshift(filters);
  return `/articles?${parts.join('&')}`;
}

/**
 * Builds a tenant filter that works across Strapi relation shapes:
 * - local: filters[tenant][tenantId][$eq]=tenant_demo_002
 * - some prod datasets: filters[tenant][documentId][$eq]=<tenant_document_id>
 */
async function buildTenantFilterQuery(tenantId: string): Promise<string> {
  const tenantDocumentId = await getStrapiTenantDocumentId();
  if (tenantDocumentId) {
    return [
      `filters[$or][0][tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}`,
      `filters[$or][1][tenant][documentId][$eq]=${encodeURIComponent(tenantDocumentId)}`,
    ].join('&');
  }
  return `filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}`;
}

function getArticleCountFromResult(result: NewsHomePageData): number {
  return (
    result.featured.length +
    result.mainNews.length +
    result.pressRelease.length +
    result.mostRead.length
  );
}

function normalizeArticle(raw: { id?: number; documentId?: string; attributes?: Record<string, unknown> }): NewsArticle {
  // Strapi 4: raw.attributes; Strapi 5: raw has fields at top level
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const cover = attrs?.cover;
  const category = attrs?.category as { data?: Record<string, unknown> | { attributes?: { slug?: string; name?: string } }; attributes?: { slug?: string; name?: string }; documentId?: string; slug?: string; name?: string } | undefined;
  const author = attrs?.author as { data?: { attributes?: { name?: string } }; name?: string } | undefined;
  const baseUrl = getStrapiUrl();
  const coverUrl = getMediaUrl(cover, baseUrl) ?? undefined;
  const coverAlt = getMediaAlt(cover);
  // Category: Strapi 4 data.attributes; Strapi 5 top-level or category.data (object) slug/name
  const catData = category?.data as Record<string, unknown> | undefined;
  const categorySlug =
    category?.data?.attributes?.slug ??
    (catData && typeof catData.slug === 'string' ? catData.slug : undefined) ??
    category?.slug;
  const categoryName =
    category?.data?.attributes?.name ??
    (catData && typeof catData.name === 'string' ? catData.name : undefined) ??
    category?.name;
  const authorName = author?.data?.attributes?.name ?? author?.name;
  // Strapi "Editorial - Article" uses "description" as Rich Text (Blocks) or legacy string
  const descRaw = attrs?.description;
  const descStr = typeof descRaw === 'string' ? (descRaw as string).trim() : '';
  const descriptionBlocks: BlocksContent | undefined =
    Array.isArray(descRaw) && descRaw.length > 0 ? (descRaw as BlocksContent) : undefined;
  const bodyRaw = attrs?.body;
  const bodyStr = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';
  const excerptStr = typeof attrs?.excerpt === 'string' ? (attrs.excerpt as string).trim() : '';
  return {
    id: (raw?.id ?? attrs?.id ?? 0) as number,
    documentId: raw?.documentId as string | undefined,
    title: (attrs?.title ?? '') as string,
    slug: (attrs?.slug ?? '') as string,
    excerpt: excerptStr || (descStr ? descStr.slice(0, 300) + (descStr.length > 300 ? '…' : '') : undefined),
    description: descriptionBlocks,
    body: bodyStr || descStr || undefined,
    publishedAt: (attrs?.publishedAt ?? undefined) as string | undefined,
    views: (attrs?.views ?? undefined) as number | undefined,
    coverUrl,
    coverAlt,
    categorySlug: categorySlug as string | undefined,
    categoryName: categoryName as string | undefined,
    authorName: authorName as string | undefined,
  };
}

function normalizeHomepage(raw: { attributes?: Record<string, unknown> } | null): FlashNews | null {
  if (!raw) return null;
  const attrs = raw?.attributes ?? raw;
  const active = attrs?.flashNewsActive === true;
  const message = (attrs?.flashNewsMessage ?? '') as string;
  if (!message && !active) return null;
  return { message, active };
}

function normalizeSidebarPromo(raw: { attributes?: Record<string, unknown> } | null): SidebarPromoBlock | null {
  if (!raw) return null;
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const blockType = attrs?.blockType as string | undefined;
  const embedCode = attrs?.embedCode as string | null | undefined;
  const videoUrl = attrs?.videoUrl as string | null | undefined;
  const thumbnail = attrs?.thumbnail;
  const baseUrl = getStrapiUrl();
  const thumbnailUrl = getMediaUrl(thumbnail, baseUrl);
  return {
    blockType,
    embedCode: embedCode ?? null,
    videoUrl: videoUrl ?? null,
    thumbnailUrl: thumbnailUrl ?? null,
    title: (attrs?.title ?? null) as string | null,
  };
}

function normalizeAdSlot(raw: { id?: number; documentId?: string; attributes?: Record<string, unknown> }): AdSlot {
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const media = attrs?.media;
  const baseUrl = getStrapiUrl();
  const mediaUrl = getMediaUrl(media, baseUrl);
  return {
    id: (raw?.id ?? attrs?.id) as number,
    position: (attrs?.position ?? undefined) as string | undefined,
    embedHtml: (attrs?.embedHtml ?? null) as string | null | undefined,
    mediaUrl: mediaUrl ?? null,
    linkUrl: (attrs?.linkUrl ?? null) as string | null | undefined,
  };
}

/** Raw flash-news-item from Strapi (with optional populated article). */
interface RawFlashNewsItem {
  id?: number;
  documentId?: string;
  attributes?: Record<string, unknown>;
  content?: string;
  title?: string;
  externalUrl?: string | null;
  order?: number;
  startDate?: string | null;
  endDate?: string | null;
  publishedAt?: string | null;
  article?: { slug?: string; id?: number; documentId?: string } | { data?: { attributes?: { slug?: string }; slug?: string } } | null;
}

function normalizeFlashNewsItem(raw: RawFlashNewsItem): FlashNewsItemUI {
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const content = (attrs?.content ?? raw?.content ?? '') as string;
  const externalUrl = (attrs?.externalUrl ?? raw?.externalUrl ?? null) as string | null | undefined;
  const article = (attrs?.article ?? raw?.article) as RawFlashNewsItem['article'];
  const slug =
    article && typeof article === 'object'
      ? (article as { slug?: string }).slug ?? (article as { data?: { attributes?: { slug?: string }; slug?: string } })?.data?.attributes?.slug ?? (article as { data?: { slug?: string } })?.data?.slug
      : undefined;
  const link =
    externalUrl && externalUrl.trim()
      ? externalUrl
      : slug
        ? `/mosc-redesign/news/${encodeURIComponent(slug)}`
        : undefined;
  return {
    id: (raw?.id ?? attrs?.id ?? 0) as number,
    content: content.trim() || (raw?.title ?? attrs?.title ?? '') as string,
    link: link ?? null,
    startDate: (attrs?.startDate ?? raw?.startDate ?? null) as string | null | undefined,
    endDate: (attrs?.endDate ?? raw?.endDate ?? null) as string | null | undefined,
  };
}

function filterFlashNewsByDate(items: FlashNewsItemUI[]): FlashNewsItemUI[] {
  const today = new Date().toISOString().split('T')[0];
  return items.filter((item) => {
    if (item.startDate && item.startDate > today) return false;
    if (item.endDate && item.endDate < today) return false;
    return true;
  });
}

/** Max fetch attempts when Strapi returns errors (e.g. 401, network). No retry when Strapi succeeds with 0 articles. */
const MAX_STRAPI_ATTEMPTS = 5;

/** Delay in ms before retrying after a failed attempt. */
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches all data needed for the news homepage. Returns empty sections if Strapi is unavailable or on error.
 * Retries up to MAX_STRAPI_ATTEMPTS times only when Strapi requests fail (401, network, etc.). Does not retry
 * when Strapi succeeds and returns 0 articles (valid empty state).
 */
export async function getNewsHomePageData(): Promise<NewsHomePageData> {
  const empty: NewsHomePageData = {
    flash: null,
    flashNewsItems: [],
    featured: [],
    mainNews: [],
    pressRelease: [],
    mostRead: [],
    sidebarPromo: null,
    adSlots: [],
    topAdSlots: [],
    betweenSectionsAdSlots: [],
  };

  let tenantId: string;
  try {
    tenantId = getStrapiTenantId();
  } catch (e) {
    console.warn('[STRAPI-NEWS] Tenant ID not set (NEXT_PUBLIC_TENANT_ID). Returning empty news data.', e);
    return empty;
  }

  const strapiUrl = getStrapiUrl();
  if (!strapiUrl) {
    console.warn('[STRAPI-NEWS] NEXT_PUBLIC_STRAPI_URL not set. Returning empty news data.');
    return empty;
  }

  const tenantDocumentId = await getStrapiTenantDocumentId();
  const tenantFilterQuery = await buildTenantFilterQuery(tenantId);

  let lastResult: NewsHomePageData = empty;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_STRAPI_ATTEMPTS; attempt++) {
    try {
      console.info(
        `[STRAPI-NEWS] Fetching news homepage data attempt ${attempt}/${MAX_STRAPI_ATTEMPTS}`,
        {
          tenantId,
          tenantDocumentId: tenantDocumentId ?? null,
          strapiUrl,
          tenantFilterQuery,
        }
      );

      const loadWithFilter = async (filterLabel: string, activeTenantFilter: string) => {
        const flashNewsPath = `/flash-news-items?${activeTenantFilter}&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&populate[0]=article&pagination[limit]=20`;
        const adsPath = `/advertisement-slots?filters[$or][0][position][$eq]=sidebar&filters[$or][1][position][$eq]=top&filters[$or][2][position][$eq]=between_sections&${activeTenantFilter}&populate=media`;

        const [
          homepageRes,
          flashRes,
          featuredRes,
          mainRes,
          pressRes,
          mostReadRes,
          sidebarRes,
          adsRes,
        ] = await Promise.all([
          fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/homepage?populate=*'),
          fetchStrapi<unknown[]>(flashNewsPath),
          fetchStrapi<unknown[]>(buildArticleQuery(buildCategorySlugFilter(STRAPI_NEWS_CATEGORY_SLUGS.featuredNews), 'publishedAt:desc', 6, activeTenantFilter)),
          fetchStrapi<unknown[]>(buildArticleQuery(buildCategorySlugFilter(STRAPI_NEWS_CATEGORY_SLUGS.mainNews), 'publishedAt:desc', 10, activeTenantFilter)),
          fetchStrapi<unknown[]>(buildArticleQuery(buildCategorySlugFilter(STRAPI_NEWS_CATEGORY_SLUGS.pressRelease), 'publishedAt:desc', 10, activeTenantFilter)),
          fetchStrapi<unknown[]>(buildArticleQuery('', 'views:desc', 5, activeTenantFilter)),
          fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/sidebar-promotional-block?populate=*'),
          fetchStrapi<unknown[]>(adsPath),
        ]);

        const featuredList = Array.isArray(featuredRes?.data) ? featuredRes.data : [];
        const mainList = Array.isArray(mainRes?.data) ? mainRes.data : [];
        const pressList = Array.isArray(pressRes?.data) ? pressRes.data : [];
        const mostReadList = Array.isArray(mostReadRes?.data) ? mostReadRes.data : [];

        // Single types (homepage, sidebar-promotional-block) may not exist in every Strapi project (e.g. prod 404).
        // Only treat collection endpoint failures as hard errors for retries.
        const hadOptionalMissing = homepageRes == null || sidebarRes == null;
        if (hadOptionalMissing) {
          console.info('[STRAPI-NEWS] Optional single-type(s) missing (homepage and/or sidebar-promotional-block). Add them in Strapi if needed; continuing with other data.');
        }
        const hadRequiredError = flashRes == null || adsRes == null;
        const hadError = hadRequiredError;

        const flashList = Array.isArray(flashRes?.data) ? flashRes.data : [];
        const adsList = Array.isArray(adsRes?.data) ? adsRes.data : [];

        const allFlashItems = (flashList ?? [])
          .map((f) => normalizeFlashNewsItem(f as RawFlashNewsItem))
          .filter((f) => f.content && f.content.length > 0);
        const flashNewsItems = filterFlashNewsByDate(allFlashItems);

        const allAds = (adsList ?? []).map((a) => normalizeAdSlot(a as { id?: number; attributes?: Record<string, unknown> }));
        const sidebarSlots = allAds.filter((a) => (a.position ?? '').toLowerCase() === 'sidebar');
        const topSlots = allAds.filter((a) => (a.position ?? '').toLowerCase() === 'top');
        const betweenSectionsSlots = allAds.filter((a) => (a.position ?? '').toLowerCase().replace(/-/g, '_') === 'between_sections');

        const result: NewsHomePageData = {
          flash: normalizeHomepage(homepageRes?.data ?? null),
          flashNewsItems,
          featured: (featuredList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
          mainNews: (mainList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
          pressRelease: (pressList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
          mostRead: (mostReadList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
          sidebarPromo: normalizeSidebarPromo(sidebarRes?.data ?? null),
          adSlots: sidebarSlots,
          topAdSlots: topSlots,
          betweenSectionsAdSlots: betweenSectionsSlots,
        };

        const totalArticles = getArticleCountFromResult(result);
        console.info(`[STRAPI-NEWS] (${filterLabel}) Homepage data loaded: ${totalArticles} articles, flash=${!!result.flash?.active}, flashItems=${result.flashNewsItems.length}, sidebar=${!!result.sidebarPromo}, sidebarAds=${result.adSlots.length}, topAds=${result.topAdSlots.length}, betweenSectionsAds=${result.betweenSectionsAdSlots.length}`);
        if (totalArticles === 0 && !hadError) {
          console.info(`[STRAPI-NEWS] (${filterLabel}) 0 articles with successful responses.`);
        }

        return { result, hadError };
      };

      // Strategy 1: primary tenant query
      let loaded = await loadWithFilter('tenant-primary', tenantFilterQuery);
      let totalArticles = getArticleCountFromResult(loaded.result);
      if (totalArticles > 0 && !loaded.hadError) {
        return loaded.result;
      }

      // Strategy 2: strict documentId relation query if available
      if (tenantDocumentId) {
        const documentIdFilter = `filters[tenant][documentId][$eq]=${encodeURIComponent(tenantDocumentId)}`;
        console.warn('[STRAPI-NEWS] tenant-primary returned empty/partial, trying tenant-documentId fallback.', {
          tenantDocumentId,
        });
        loaded = await loadWithFilter('tenant-documentId', documentIdFilter);
        totalArticles = getArticleCountFromResult(loaded.result);
        if (totalArticles > 0 && !loaded.hadError) {
          return loaded.result;
        }
      }

      // Strategy 3: no-tenant fallback (last resort; keeps site usable in misconfigured production)
      // NOTE: This should be temporary until tenant relations are corrected in Strapi data.
      console.warn('[STRAPI-NEWS] Tenant-scoped strategies returned empty/partial. Trying no-tenant fallback.');
      loaded = await loadWithFilter('no-tenant', '');
      totalArticles = getArticleCountFromResult(loaded.result);
      if (totalArticles > 0 && !loaded.hadError) {
        console.warn('[STRAPI-NEWS] no-tenant fallback returned articles. Verify tenant relation mapping in Strapi production data.');
        return loaded.result;
      }

      lastResult = loaded.result;
      if (!loaded.hadError && totalArticles === 0) {
        return loaded.result;
      }

      if (attempt < MAX_STRAPI_ATTEMPTS) {
        console.warn(`[STRAPI-NEWS] Some Strapi requests failed (attempt ${attempt}/${MAX_STRAPI_ATTEMPTS}). Retrying in ${RETRY_DELAY_MS}ms.`);
        await sleep(RETRY_DELAY_MS);
      }
    } catch (e) {
      lastError = e;
      console.warn(`[STRAPI-NEWS] getNewsHomePageData attempt ${attempt}/${MAX_STRAPI_ATTEMPTS} failed:`, e);
      if (attempt < MAX_STRAPI_ATTEMPTS) {
        console.warn(`[STRAPI-NEWS] Retrying in ${RETRY_DELAY_MS}ms.`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  if (lastError) {
    console.warn('[STRAPI-NEWS] All attempts failed. Returning empty news data.', lastError);
    return empty;
  }
  console.warn(`[STRAPI-NEWS] All ${MAX_STRAPI_ATTEMPTS} attempts had partial/failed Strapi responses. Returning last result.`);
  return lastResult;
}

/** Result for shared news layout (header + flash) on index and article detail pages. */
export interface FlashNewsForPage {
  flashNewsItems: FlashNewsItemUI[];
  flash: FlashNews | null;
}

/**
 * Fetches only flash news (carousel items + legacy homepage flash) for use on news index and article detail pages.
 * Lighter than getNewsHomePageData when only header + flash bar are needed.
 */
export async function getFlashNewsForNewsPages(): Promise<FlashNewsForPage> {
  const empty: FlashNewsForPage = { flashNewsItems: [], flash: null };
  let tenantId: string;
  try {
    tenantId = getStrapiTenantId();
  } catch {
    return empty;
  }
  if (!getStrapiUrl()) return empty;
  try {
    const tenantFilterQuery = await buildTenantFilterQuery(tenantId);
    const flashNewsPath = `/flash-news-items?${tenantFilterQuery}&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&populate[0]=article&pagination[limit]=20`;
    const [homepageRes, flashRes] = await Promise.all([
      fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/homepage?populate=*'),
      fetchStrapi<unknown[]>(flashNewsPath),
    ]);
    const flashList = Array.isArray(flashRes?.data) ? flashRes.data : [];
    const allFlashItems = (flashList ?? [])
      .map((f) => normalizeFlashNewsItem(f as RawFlashNewsItem))
      .filter((f) => f.content && f.content.length > 0);
    const flashNewsItems = filterFlashNewsByDate(allFlashItems);
    return {
      flashNewsItems,
      flash: normalizeHomepage(homepageRes?.data ?? null),
    };
  } catch (e) {
    console.warn('[STRAPI-NEWS] getFlashNewsForNewsPages failed:', e);
    return empty;
  }
}

/** Strapi 5 documentId pattern: lowercase alphanumeric, 15–35 chars (e.g. o42fs0slvzzj9os0g9xtc11d). */
const DOCUMENT_ID_PATTERN = /^[a-z0-9]{15,35}$/;

/**
 * Fetches a single article by slug or id for the detail page. Returns null if not found or Strapi unavailable.
 * Supports: text slug, numeric id (legacy), or documentId (Strapi 5).
 * When the param matches Strapi 5 documentId pattern (e.g. from admin URL), tries documentId first so
 * links like /mosc/news/o42fs0slvzzj9os0g9xtc11d work even when slug differs from documentId.
 */
export async function getArticleBySlug(slugOrId: string): Promise<NewsArticle | null> {
  if (!getStrapiUrl() || !slugOrId?.trim()) return null;
  let tenantId: string;
  try {
    tenantId = getStrapiTenantId();
  } catch {
    return null;
  }
  const tenantFilterQuery = await buildTenantFilterQuery(tenantId);
  const base = `${tenantFilterQuery}&filters[publishedAt][$notNull]=true&${POPULATE}&pagination[page]=1&pagination[pageSize]=1`;
  const param = slugOrId.trim();
  try {
    let path: string;
    let res: { data: unknown } | null;
    let list: unknown[];
    let first: { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;

    // Tenant filter only (no fallback). Same as bishops — only return article when it belongs to tenant.
    if (DOCUMENT_ID_PATTERN.test(param)) {
      path = `/articles?filters[documentId][$eq]=${encodeURIComponent(param)}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }
    if (!first) {
      path = `/articles?filters[slug][$eqi]=${encodeURIComponent(param)}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }
    if (!first && /^\d+$/.test(param)) {
      const id = parseInt(param, 10);
      path = `/articles?filters[id][$eq]=${id}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }
    if (!first && param.length > 10 && !DOCUMENT_ID_PATTERN.test(param)) {
      path = `/articles?filters[documentId][$eq]=${encodeURIComponent(param)}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }
    if (!first) return null;
    return normalizeArticle(first);
  } catch {
    return null;
  }
}

/**
 * Fetches recent articles (by publishedAt desc) for sidebar "Recent Posts".
 * Uses same pattern as bishops: filters[tenant][tenantId][$eq], pagination[pageSize].
 */
export async function getRecentArticles(limit: number = 5): Promise<NewsArticle[]> {
  if (!getStrapiUrl()) return [];
  try {
    const tenantId = getStrapiTenantId();
    const tenantFilterQuery = await buildTenantFilterQuery(tenantId);
    const path = `/articles?${tenantFilterQuery}&filters[publishedAt][$notNull]=true&${POPULATE}&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=${limit}`;
    const res = await fetchStrapi<unknown[]>(path);
    const list = Array.isArray(res?.data) ? res.data : [];
    return list.map((raw) => normalizeArticle(raw as { id?: number; documentId?: string; attributes?: Record<string, unknown> }));
  } catch {
    return [];
  }
}

/**
 * Fetches the article published immediately before the given date (for "Previous Post" link).
 */
export async function getPreviousArticle(beforePublishedAt: string): Promise<NewsArticle | null> {
  if (!getStrapiUrl() || !beforePublishedAt) return null;
  try {
    const tenantId = getStrapiTenantId();
    const tenantFilterQuery = await buildTenantFilterQuery(tenantId);
    const path = `/articles?${tenantFilterQuery}&filters[publishedAt][$notNull]=true&filters[publishedAt][$lt]=${encodeURIComponent(beforePublishedAt)}&${POPULATE}&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=1`;
    const res = await fetchStrapi<unknown[]>(path);
    const list = Array.isArray(res?.data) ? res.data : [];
    const first = list[0] as { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;
    return first ? normalizeArticle(first) : null;
  } catch {
    return null;
  }
}
