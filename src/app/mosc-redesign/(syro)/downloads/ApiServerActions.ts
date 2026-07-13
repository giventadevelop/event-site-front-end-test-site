'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventMediaDTO } from '@/types';
import { parseHierarchyDescription } from '@/lib/officialDocumentHierarchy';
import { resolveOfficialDocumentDownloadUrl } from '@/lib/officialDocumentDownload';
import {
  compareDownloadsNewestFirst,
  extractDownloadItemYears,
  matchesDownloadSearchQuery,
  matchesDownloadYearFilter,
} from '@/lib/downloads/downloadSearch';
import { deduplicateOfficialDocumentTreeItems } from '@/lib/downloads/deduplicateOfficialDocuments';
import {
  buildOfficialDocumentThumbnailCacheKey,
  getEventMediaDisplayThumbnailUrl,
  hasStoredOfficialDocumentThumbnail,
} from '@/lib/officialDocumentThumbnail';

/** Parse Spring Data REST pagination from response headers (body is a plain array). */
function parseSpringTotalCountHeader(res: Response, fallback: number): number {
  const raw = res.headers.get('X-Total-Count') ?? res.headers.get('x-total-count');
  if (raw == null || raw.trim() === '') {
    return fallback;
  }
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function buildPublicOfficialDocumentsUrl(params: globalThis.URLSearchParams): string {
  return `${getApiBaseUrl()}/api/event-medias/public-official-documents?${params.toString()}`;
}

/** Public tenant official documents for the downloads page (server-side JWT). */
export async function fetchPublicOfficialDocumentsForDownloadsServer(): Promise<EventMediaDTO[]> {
  try {
    return await fetchAllPublicOfficialDocumentsRaw();
  } catch (e) {
    globalThis.console.error('[downloads] fetchPublicOfficialDocumentsForDownloadsServer:', e);
    return [];
  }
}

export type PublicOfficialDocumentTreeItem = {
  id: number | null;
  title: string;
  fileName: string;
  treePath: string;
  pathSegments: string[];
  categoryLabel: string | null;
  officialDocumentCategoryId: number | null;
  officialDocumentYear: number | null;
  priorityRanking: number;
  description: string | null;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  fileDataContentType: string | null;
  createdAt: string;
  /** Stable storage path for uploaded card thumbnail (not a presigned URL). */
  thumbnailStorageUrl: string | null;
  /** True when a custom thumbnail exists in storage (proxy can resolve fresh presign). */
  hasCustomThumbnail: boolean;
  /** Changes when thumbnail/metadata updates — used to bust card preview cache. */
  thumbnailCacheKey: string | null;
};

export type PublicOfficialDocumentTreePage = {
  content: PublicOfficialDocumentTreeItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  categoryOptions: Array<{ id: number; slug: string; displayName: string }>;
  /** Distinct years for the active category filter (newest first) */
  yearOptions: number[];
  /** All distinct years across public official documents — used for the year typeahead (always populated) */
  allYearOptions: number[];
};

function mapEventMediaToTreeItem(doc: EventMediaDTO): PublicOfficialDocumentTreeItem {
  const parsed = parseHierarchyDescription(doc.description);
  const fallbackName = (doc.fileUrl || '').split('/').pop() || doc.title || 'file';
  const treePath =
    (doc.hierarchyPath && String(doc.hierarchyPath).trim()) ||
    parsed.treePath ||
    doc.title ||
    fallbackName;
  const pathSegments = treePath.split(/[\\/]+/).map((x) => x.trim()).filter(Boolean);
  return {
    id: doc.id ?? null,
    title: doc.title,
    fileName: pathSegments[pathSegments.length - 1] || fallbackName,
    treePath,
    pathSegments,
    categoryLabel:
      (doc.hierarchyCategoryLabel && String(doc.hierarchyCategoryLabel).trim()) ||
      parsed.categoryLabel ||
      null,
    officialDocumentCategoryId: doc.officialDocumentCategoryId ?? null,
    officialDocumentYear: doc.officialDocumentYear ?? null,
    priorityRanking: doc.displayPriority ?? parsed.priority ?? doc.priorityRanking ?? 999999,
    description: parsed.cleanDescription || null,
    downloadUrl: resolveOfficialDocumentDownloadUrl(doc),
    thumbnailUrl: getEventMediaDisplayThumbnailUrl(
      {
        fileUrl: doc.fileUrl,
        thumbnailUrl: doc.thumbnailUrl,
        thumbnailPreSignedUrl: doc.thumbnailPreSignedUrl,
        fileDataContentType: doc.fileDataContentType || doc.contentType,
        title: doc.title,
        fileName: (doc.fileUrl || '').split('/').pop() || doc.title,
      },
      {
        thumbnailExpiresAtIso: doc.thumbnailPreSignedUrlExpiresAt,
        fileExpiresAtIso: doc.preSignedUrlExpiresAt,
      }
    ),
    thumbnailStorageUrl: doc.thumbnailUrl?.split('?')[0]?.trim() || null,
    hasCustomThumbnail: hasStoredOfficialDocumentThumbnail(doc),
    fileUrl: doc.fileUrl || null,
    fileDataContentType: doc.fileDataContentType || doc.contentType || null,
    createdAt: doc.createdAt,
    thumbnailCacheKey: buildOfficialDocumentThumbnailCacheKey(doc),
  };
}

async function fetchAllPublicOfficialDocumentsRaw(input?: {
  categoryId?: number;
}): Promise<EventMediaDTO[]> {
  const tenantId = getTenantId();
  const all: EventMediaDTO[] = [];
  // Keep batches small: concurrent size=100 loads OOM the Java heap / Postgres
  // result buffer (SQLState 53200). size=50 is usually fine alone; 25 is safer
  // when the page also loads categories in parallel.
  const batchSize = 25;
  let page = 0;
  let totalElements = Number.POSITIVE_INFINITY;

  while (all.length < totalElements && page < 100) {
    const params = new globalThis.URLSearchParams();
    params.set('tenantId', tenantId);
    if (input?.categoryId) {
      params.set('officialDocumentCategoryId', String(input.categoryId));
    }
    params.set('page', String(page));
    params.set('size', String(batchSize));

    const url = buildPublicOfficialDocumentsUrl(params);
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      globalThis.console.error(
        '[downloads] public-official-documents page failed',
        { page, status: res.status, tenantId }
      );
      break;
    }

    const batch = (await res.json()) as EventMediaDTO[];
    if (!Array.isArray(batch)) break;

    totalElements = parseSpringTotalCountHeader(res, all.length + batch.length);
    all.push(...batch);
    page += 1;
    if (batch.length === 0) break;
  }

  return all;
}

function sortDownloadTreeItemsNewestFirst(
  items: PublicOfficialDocumentTreeItem[]
): PublicOfficialDocumentTreeItem[] {
  return [...items].sort((a, b) =>
    compareDownloadsNewestFirst(
      { ...toDownloadSearchItem(a), priorityRanking: a.priorityRanking },
      { ...toDownloadSearchItem(b), priorityRanking: b.priorityRanking }
    )
  );
}

function toDownloadSearchItem(item: PublicOfficialDocumentTreeItem): Parameters<typeof extractDownloadItemYears>[0] {
  return {
    title: item.title,
    fileName: item.fileName,
    treePath: item.treePath,
    pathSegments: item.pathSegments,
    categoryLabel: item.categoryLabel,
    description: item.description,
    officialDocumentYear: item.officialDocumentYear,
  };
}

function extractYearOptionsFromDocs(docs: EventMediaDTO[], categoryId?: number): number[] {
  const years = new Set<number>();
  for (const row of docs) {
    if (categoryId && row.officialDocumentCategoryId !== categoryId) {
      continue;
    }
    for (const year of extractDownloadItemYears(toDownloadSearchItem(mapEventMediaToTreeItem(row)))) {
      years.add(year);
    }
  }
  return [...years].sort((a, b) => b - a);
}

async function fetchOfficialDocumentCategoryOptionsServer(): Promise<
  Array<{ id: number; slug: string; displayName: string }>
> {
  try {
    const catParams = new globalThis.URLSearchParams();
    catParams.append('tenantId.equals', getTenantId());
    catParams.append('isActive.equals', 'true');
    catParams.append('sort', 'sortOrder,asc');
    catParams.append('size', '200');
    const catsUrl = `${getApiBaseUrl()}/api/official-document-categories?${catParams.toString()}`;
    const catsRes = await fetchWithJwtRetry(catsUrl, { cache: 'no-store' });
    const catJson = catsRes.ok ? await catsRes.json() : [];
    const catRaw = Array.isArray(catJson) ? catJson : Array.isArray(catJson?.content) ? catJson.content : [];
    return (catRaw as Array<Record<string, unknown>>)
      .map((row) => ({
        id: Number(row.id),
        slug: String(row.slug ?? ''),
        displayName: String(row.displayName ?? row.display_name ?? row.slug ?? ''),
      }))
      .filter((x) => Number.isFinite(x.id) && x.id > 0);
  } catch {
    return [];
  }
}

export async function fetchPublicOfficialDocumentCategoriesServer(): Promise<
  Array<{ id: number; slug: string; displayName: string }>
> {
  return fetchOfficialDocumentCategoryOptionsServer();
}

export async function fetchPublicOfficialDocumentsTreeServer(input?: {
  page?: number;
  size?: number;
  categoryId?: number;
  year?: number;
  search?: string;
}): Promise<PublicOfficialDocumentTreePage> {
  const page = Math.max(0, input?.page ?? 0);
  const size = Math.min(Math.max(1, input?.size ?? 24), 100);
  const searchQuery = input?.search?.trim() ?? '';

  try {
    // Load the full public document list once (small batches), then filter and
    // derive year options in memory. Never issue a second parallel full-list
    // fetch for yearOptions — that OOMed the JVM with concurrent large pages.
    const [allDocs, categoryOptions] = await Promise.all([
      fetchAllPublicOfficialDocumentsRaw(),
      fetchOfficialDocumentCategoryOptionsServer(),
    ]);

    const allYearOptions = extractYearOptionsFromDocs(allDocs);
    const scopedDocs = input?.categoryId
      ? allDocs.filter((doc) => doc.officialDocumentCategoryId === input.categoryId)
      : allDocs;
    const yearOptions = extractYearOptionsFromDocs(scopedDocs, input?.categoryId);

    const filteredDocs = scopedDocs.filter((doc) => {
      const item = mapEventMediaToTreeItem(doc);
      const searchItem = toDownloadSearchItem(item);
      if (input?.year && !matchesDownloadYearFilter(searchItem, input.year)) {
        return false;
      }
      if (searchQuery && !matchesDownloadSearchQuery(searchItem, searchQuery)) {
        return false;
      }
      return true;
    });

    const dedupedDocs = sortDownloadTreeItemsNewestFirst(
      deduplicateOfficialDocumentTreeItems(filteredDocs.map(mapEventMediaToTreeItem))
    );
    const totalElements = dedupedDocs.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const currentPage = Math.min(page, totalPages - 1);
    const content = dedupedDocs.slice(currentPage * size, currentPage * size + size);

    return {
      content,
      totalElements,
      totalPages,
      page: currentPage,
      size,
      categoryOptions,
      yearOptions,
      allYearOptions,
    };
  } catch (e) {
    globalThis.console.error('[downloads] fetchPublicOfficialDocumentsTreeServer:', e);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page,
      size,
      categoryOptions: [],
      yearOptions: [],
      allYearOptions: [],
    };
  }
}
