'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventMediaDTO } from '@/types';
import { parseHierarchyDescription } from '@/lib/officialDocumentHierarchy';
import { resolveOfficialDocumentDownloadUrl } from '@/lib/officialDocumentDownload';

/** Public tenant official documents for the downloads page (server-side JWT). */
export async function fetchPublicOfficialDocumentsForDownloadsServer(): Promise<EventMediaDTO[]> {
  try {
    const params = new globalThis.URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('isPublic.equals', 'true');
    params.append('sort', 'createdAt,desc');
    params.append('size', '200');
    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    globalThis.console.error('[downloads-old] fetchPublicOfficialDocumentsForDownloadsServer:', e);
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
  createdAt: string;
};

export type PublicOfficialDocumentTreePage = {
  content: PublicOfficialDocumentTreeItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  categoryOptions: Array<{ id: number; slug: string; displayName: string }>;
};

export async function fetchPublicOfficialDocumentsTreeServer(input?: {
  page?: number;
  size?: number;
  categoryId?: number;
  year?: number;
}): Promise<PublicOfficialDocumentTreePage> {
  const page = Math.max(0, input?.page ?? 0);
  const size = Math.min(Math.max(1, input?.size ?? 24), 100);

  try {
    const baseParams = new globalThis.URLSearchParams();
    baseParams.append('tenantId.equals', getTenantId());
    baseParams.append('isEventManagementOfficialDocument.equals', 'true');
    baseParams.append('isPublic.equals', 'true');
    if (input?.categoryId) baseParams.append('officialDocumentCategoryId.equals', String(input.categoryId));
    if (input?.year) baseParams.append('officialDocumentYear.equals', String(input.year));
    baseParams.append('sort', 'priorityRanking,asc');
    baseParams.append('sort', 'createdAt,desc');
    baseParams.append('page', String(page));
    baseParams.append('size', String(size));

    const docsUrl = `${getApiBaseUrl()}/api/event-medias?${baseParams.toString()}`;
    const docsRes = await fetchWithJwtRetry(docsUrl, { cache: 'no-store' });
    if (!docsRes.ok) {
      return { content: [], totalElements: 0, totalPages: 0, page, size, categoryOptions: [] };
    }
    const docsJson = await docsRes.json();
    const docsRaw = Array.isArray(docsJson) ? docsJson : Array.isArray(docsJson?.content) ? docsJson.content : [];
    const totalElements = Array.isArray(docsJson) ? docsRaw.length : Number(docsJson?.totalElements ?? docsRaw.length);
    const totalPages = Array.isArray(docsJson) ? 1 : Number(docsJson?.totalPages ?? 1);
    const currentPage = Array.isArray(docsJson) ? 0 : Number(docsJson?.number ?? page);

    const content = (docsRaw as EventMediaDTO[]).map((doc) => {
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
        createdAt: doc.createdAt,
      } satisfies PublicOfficialDocumentTreeItem;
    });

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
      totalPages,
      page: currentPage,
      size,
      categoryOptions,
    };
  } catch (e) {
    globalThis.console.error('[downloads-old] fetchPublicOfficialDocumentsTreeServer:', e);
    return { content: [], totalElements: 0, totalPages: 0, page, size, categoryOptions: [] };
  }
}
