/**
 * Server-side data layer for the News Portal homepage.
 * Fetches from Strapi Content API and returns normalized data for the UI.
 *
 * API reference: documentation/news_portal/strapi/api_reference.md
 */

import { fetchStrapi, getStrapiUrl, getStrapiTenantId } from '@/lib/strapi';
import {
  STRAPI_NEWS_CATEGORY_SLUGS,
  buildCategorySlugFilter,
} from '@/lib/strapi/newsCategorySlugs';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import type { NewsHomePageData, NewsArticle, FlashNews, FlashNewsItemUI, SidebarPromoBlock, AdSlot } from './types';

/** Strapi 5: Array-style populate; comma-separated populate triggers 400. */
const POPULATE = 'populate[0]=cover&populate[1]=category&populate[2]=author';

/**
 * Extracts media URL from Strapi 4 or Strapi 5 response structure.
 * Strapi 4: media.data.attributes.url
 * Strapi 5: media.url or media.data.url (flattened)
 * Also handles: formats.thumbnail.url, array of media (takes first).
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
    // Strapi 4: data.attributes.url
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url && m?.formats) {
    // Fallback: formats.thumbnail.url or formats.small.url
    const formats = m.formats as Record<string, { url?: string }>;
    url = formats?.thumbnail?.url ?? formats?.small?.url ?? formats?.medium?.url;
  }
  if (!url || typeof url !== 'string') return null;
  return url.startsWith('http') ? url : `${baseUrl}${url}`;
}

/**
 * Extracts alternativeText/caption from Strapi 4 or 5 media structure.
 */
function getMediaAlt(media: unknown): string | undefined {
  if (!media) return undefined;
  const m = media as Record<string, unknown>;
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
 * Strapi 5: Use filters[publishedAt][$notNull]=true (status=published can cause validation errors).
 */
function buildArticleQuery(filters: string, sort: string, limit: number): string {
  const tenantId = getStrapiTenantId();
  const parts = [
    `filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}`,
    'filters[publishedAt][$notNull]=true',
    POPULATE,
    `sort=${sort}`,
    `pagination[limit]=${limit}`,
  ];
  if (filters) parts.unshift(filters);
  return `/articles?${parts.join('&')}`;
}

function normalizeArticle(raw: { id?: number; documentId?: string; attributes?: Record<string, unknown> }): NewsArticle {
  // Strapi 4: raw.attributes; Strapi 5: raw has fields at top level
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const cover = attrs?.cover;
  const category = attrs?.category as { data?: { attributes?: { slug?: string; name?: string } }; documentId?: string; slug?: string; name?: string } | undefined;
  const author = attrs?.author as { data?: { attributes?: { name?: string } }; name?: string } | undefined;
  const baseUrl = getStrapiUrl();
  const coverUrl = getMediaUrl(cover, baseUrl) ?? undefined;
  const coverAlt = getMediaAlt(cover);
  // Category: Strapi 4 data.attributes.slug; Strapi 5 slug at top level
  const categorySlug = category?.data?.attributes?.slug ?? category?.slug;
  const categoryName = category?.data?.attributes?.name ?? category?.name;
  const authorName = author?.data?.attributes?.name ?? author?.name;
  const descRaw = attrs?.description;
  const descriptionBlocks: BlocksContent | undefined =
    Array.isArray(descRaw) && descRaw.length > 0 ? (descRaw as BlocksContent) : undefined;
  const descStr = typeof descRaw === 'string' ? (descRaw as string).trim() : '';
  const bodyRaw = attrs?.body;
  const bodyStr = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';
  return {
    id: (raw?.id ?? attrs?.id ?? 0) as number,
    documentId: raw?.documentId as string | undefined,
    title: (attrs?.title ?? '') as string,
    slug: (attrs?.slug ?? '') as string,
    excerpt: (attrs?.excerpt ?? (descStr ? descStr.slice(0, 300) + (descStr.length > 300 ? '…' : '') : undefined)) as string | undefined,
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
        ? `/mosc-old/news/${encodeURIComponent(slug)}`
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

/**
 * Fetches all data needed for the news homepage. Returns empty sections if Strapi is unavailable or on error.
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

  console.info(`[STRAPI-NEWS] Fetching news homepage data (tenant: ${tenantId}, Strapi: ${strapiUrl})`);
  try {
  const flashNewsPath = `/flash-news-items?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&populate[0]=article&pagination[limit]=20`;

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
    fetchStrapi<unknown[]>(buildArticleQuery(buildCategorySlugFilter(STRAPI_NEWS_CATEGORY_SLUGS.featuredNews), 'publishedAt:desc', 6)),
    fetchStrapi<unknown[]>(buildArticleQuery(buildCategorySlugFilter(STRAPI_NEWS_CATEGORY_SLUGS.mainNews), 'publishedAt:desc', 10)),
    fetchStrapi<unknown[]>(buildArticleQuery(buildCategorySlugFilter(STRAPI_NEWS_CATEGORY_SLUGS.pressRelease), 'publishedAt:desc', 10)),
    fetchStrapi<unknown[]>(buildArticleQuery('', 'views:desc', 5)),
    fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/sidebar-promotional-block?populate=*'),
    fetchStrapi<unknown[]>(`/advertisement-slots?filters[$or][0][position][$eq]=sidebar&filters[$or][1][position][$eq]=top&filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&populate=media`),
  ]);

  const flashList = Array.isArray(flashRes?.data) ? flashRes.data : [];
  const featuredList = Array.isArray(featuredRes?.data) ? featuredRes.data : [];
  const mainList = Array.isArray(mainRes?.data) ? mainRes.data : [];
  const pressList = Array.isArray(pressRes?.data) ? pressRes.data : [];
  const mostReadList = Array.isArray(mostReadRes?.data) ? mostReadRes.data : [];
  const adsList = Array.isArray(adsRes?.data) ? adsRes.data : [];

  const allFlashItems = (flashList ?? [])
    .map((f) => normalizeFlashNewsItem(f as RawFlashNewsItem))
    .filter((f) => f.content && f.content.length > 0);
  const flashNewsItems = filterFlashNewsByDate(allFlashItems);

  const allAds = (adsList ?? []).map((a) => normalizeAdSlot(a as { id?: number; attributes?: Record<string, unknown> }));
  const sidebarSlots = allAds.filter((a) => (a.position ?? '').toLowerCase() === 'sidebar');
  const topSlots = allAds.filter((a) => (a.position ?? '').toLowerCase() === 'top');

  const result = {
    flash: normalizeHomepage(homepageRes?.data ?? null),
    flashNewsItems,
    featured: (featuredList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
    mainNews: (mainList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
    pressRelease: (pressList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
    mostRead: (mostReadList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
    sidebarPromo: normalizeSidebarPromo(sidebarRes?.data ?? null),
    adSlots: sidebarSlots,
    topAdSlots: topSlots,
  };
  const totalArticles = result.featured.length + result.mainNews.length + result.pressRelease.length + result.mostRead.length;
  console.info(`[STRAPI-NEWS] Homepage data loaded: ${totalArticles} articles, flash=${!!result.flash?.active}, flashItems=${result.flashNewsItems.length}, sidebar=${!!result.sidebarPromo}, sidebarAds=${result.adSlots.length}, topAds=${result.topAdSlots.length}`);
  return result;
  } catch (e) {
    console.warn('[STRAPI-NEWS] getNewsHomePageData failed:', e);
    return empty;
  }
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
    const flashNewsPath = `/flash-news-items?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&populate[0]=article&pagination[limit]=20`;
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
  const base = `filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&${POPULATE}`;
  const param = slugOrId.trim();
  try {
    let path: string;
    let res: { data: unknown } | null;
    let list: unknown[];
    let first: { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;

    // 1. If param looks like Strapi 5 documentId (admin URLs, links), try documentId first
    if (DOCUMENT_ID_PATTERN.test(param)) {
      path = `/articles?filters[documentId][$eq]=${encodeURIComponent(param)}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }

    // 2. If not found, try slug (text) — use $eqi for case-insensitive match
    if (!first) {
      path = `/articles?filters[slug][$eqi]=${encodeURIComponent(param)}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }

    // 3. If not found and param looks numeric, try by id (Strapi v4 or when id is used)
    if (!first && /^\d+$/.test(param)) {
      const id = parseInt(param, 10);
      path = `/articles?filters[id][$eq]=${id}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }

    // 4. Fallback: try documentId for non-numeric params (e.g. long alphanumeric that didn't match pattern)
    if (!first && param.length > 10 && !DOCUMENT_ID_PATTERN.test(param)) {
      path = `/articles?filters[documentId][$eq]=${encodeURIComponent(param)}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
    }

    // 5. When tenant-scoped queries return 0, retry without tenant filter (article may have no tenant set in Strapi)
    const baseNoTenant = `filters[publishedAt][$notNull]=true&${POPULATE}`;
    if (!first && DOCUMENT_ID_PATTERN.test(param)) {
      path = `/articles?filters[documentId][$eq]=${encodeURIComponent(param)}&${baseNoTenant}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
      if (first) {
        console.warn(`[STRAPI-NEWS] Article ${param} found without tenant filter. Add tenant (${tenantId}) in Strapi for proper scoping.`);
      }
    }
    if (!first) {
      path = `/articles?filters[slug][$eqi]=${encodeURIComponent(param)}&${baseNoTenant}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as typeof first;
      if (first) {
        console.warn(`[STRAPI-NEWS] Article slug ${param} found without tenant filter. Add tenant (${tenantId}) in Strapi for proper scoping.`);
      }
    }

    if (!first) return null;
    return normalizeArticle(first);
  } catch {
    return null;
  }
}
