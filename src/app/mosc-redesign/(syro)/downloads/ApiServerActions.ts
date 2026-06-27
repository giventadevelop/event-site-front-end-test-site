'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventMediaDTO } from '@/types';
import { parseHierarchyDescription } from '@/lib/officialDocumentHierarchy';
import { resolveOfficialDocumentDownloadUrl } from '@/lib/officialDocumentDownload';
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
  const batchSize = 100;
  let page = 0;
  let totalElements = Number.POSITIVE_INFINITY;

  while (all.length < totalElements && page < 50) {
    const params = new globalThis.URLSearchParams();
    params.set('tenantId', tenantId);
    if (input?.categoryId) {
      params.set('officialDocumentCategoryId', String(input.categoryId));
    }
    params.set('page', String(page));
    params.set('size', String(batchSize));

    const url = buildPublicOfficialDocumentsUrl(params);
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) break;

    const batch = (await res.json()) as EventMediaDTO[];
    if (!Array.isArray(batch)) break;

    totalElements = parseSpringTotalCountHeader(res, all.length + batch.length);
    all.push(...batch);
    page += 1;
    if (batch.length === 0) break;
  }

  return all;
}

function extractYearOptionsFromDocs(docs: EventMediaDTO[], categoryId?: number): number[] {
  const years = new Set<number>();
  for (const row of docs) {
    if (categoryId && row.officialDocumentCategoryId !== categoryId) {
      continue;
    }
    const y = row.officialDocumentYear;
    if (typeof y === 'number' && Number.isFinite(y) && y >= 1900 && y <= 2100) {
      years.add(y);
    }
  }
  return [...years].sort((a, b) => b - a);
}

async function fetchPublicOfficialDocumentYearOptionsServer(input?: {
  categoryId?: number;
  docs?: EventMediaDTO[];
}): Promise<number[]> {
  try {
    const docs = input?.docs ?? (await fetchAllPublicOfficialDocumentsRaw({ categoryId: input?.categoryId }));
    return extractYearOptionsFromDocs(docs, input?.categoryId);
  } catch {
    return [];
  }
}

export async function fetchPublicOfficialDocumentsTreeServer(input?: {
  page?: number;
  size?: number;
  categoryId?: number;
  year?: number;
}): Promise<PublicOfficialDocumentTreePage> {
  const page = Math.max(0, input?.page ?? 0);
  const size = Math.min(Math.max(1, input?.size ?? 24), 100);

  try {
    const tenantId = getTenantId();
    const baseParams = new globalThis.URLSearchParams();
    baseParams.set('tenantId', tenantId);
    if (input?.categoryId) {
      baseParams.set('officialDocumentCategoryId', String(input.categoryId));
    }
    if (input?.year) {
      baseParams.set('officialDocumentYear', String(input.year));
    }
    baseParams.set('page', String(page));
    baseParams.set('size', String(size));

    const docsUrl = buildPublicOfficialDocumentsUrl(baseParams);

    const [docsRes, yearOptions, allYearOptions] = await Promise.all([
      fetchWithJwtRetry(docsUrl, { cache: 'no-store' }),
      fetchPublicOfficialDocumentYearOptionsServer({ categoryId: input?.categoryId }),
      fetchPublicOfficialDocumentYearOptionsServer(),
    ]);

    if (!docsRes.ok) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        page,
        size,
        categoryOptions: [],
        yearOptions,
        allYearOptions,
      };
    }

    const docsRaw = (await docsRes.json()) as EventMediaDTO[];
    const docsList = Array.isArray(docsRaw) ? docsRaw : [];
    const totalElements = parseSpringTotalCountHeader(docsRes, docsList.length);
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const currentPage = page;

    const content = docsList.map(mapEventMediaToTreeItem);

    const catParams = new globalThis.URLSearchParams();
    catParams.append('tenantId.equals', getTenantId());
    catParams.append('isActive.equals', 'true');
    catParams.append('sort', 'sortOrder,asc');
    catParams.append('size', '200');
    const catsUrl = `${getApiBaseUrl()}/api/official-document-categories?${catParams.toString()}`;
    const catsRes = await fetchWithJwtRetry(catsUrl, { cache: 'no-store' });
    const catJson = catsRes.ok ? await catsRes.json() : [];
    const catRaw = Array.isArray(catJson) ? catJson : Array.isArray(catJson?.content) ? catJson.content : [];
    const categoryOptions = (catRaw as Array<Record<string, unknown>>)
      .map((row) => ({
        id: Number(row.id),
        slug: String(row.slug ?? ''),
        displayName: String(row.displayName ?? row.display_name ?? row.slug ?? ''),
      }))
      .filter((x) => Number.isFinite(x.id) && x.id > 0);

    return {
      content,
      totalElements,
      totalPages: Math.max(totalPages, 1),
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
