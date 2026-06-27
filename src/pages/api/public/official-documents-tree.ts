import type { NextApiRequest, NextApiResponse } from 'next';
import type { EventMediaDTO } from '@/types';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { parseHierarchyDescription } from '@/lib/officialDocumentHierarchy';
import { resolveOfficialDocumentDownloadUrl } from '@/lib/officialDocumentDownload';

function parsePositiveInt(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.trunc(n);
}

function parseNonNegativeInt(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.trunc(n);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    const page = parseNonNegativeInt(req.query.page, 0);
    const size = Math.min(parsePositiveInt(req.query.size, 24), 100);
    const categoryId = parsePositiveInt(req.query.categoryId, 0);
    const year = parsePositiveInt(req.query.year, 0);

    const params = new globalThis.URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('isPublic.equals', 'true');
    if (categoryId > 0) params.append('officialDocumentCategoryId.equals', String(categoryId));
    if (year > 0) params.append('officialDocumentYear.equals', String(year));
    params.append('sort', 'priorityRanking,asc');
    params.append('sort', 'createdAt,desc');
    params.append('page', String(page));
    params.append('size', String(size));

    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const backendRes = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!backendRes.ok) {
      const details = await backendRes.text().catch(() => '');
      res.status(backendRes.status).json({ error: 'Failed to fetch documents', details });
      return;
    }

    const json = await backendRes.json();
    const rawItems = Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
    const totalElements = Array.isArray(json) ? rawItems.length : Number(json?.totalElements ?? rawItems.length);
    const totalPages = Array.isArray(json) ? 1 : Number(json?.totalPages ?? 1);
    const currentPage = Array.isArray(json) ? 0 : Number(json?.number ?? page);

    const items = (rawItems as EventMediaDTO[]).map((doc) => {
      const parsed = parseHierarchyDescription(doc.description);
      const fileName = (doc.fileUrl || '').split('/').pop() || doc.title || 'file';
      const fullPath = (doc.hierarchyPath && String(doc.hierarchyPath).trim()) || parsed.treePath || doc.title || fileName;
      const pathSegments = fullPath
        .split(/[\\/]+/)
        .map((x) => x.trim())
        .filter(Boolean);
      const inferredFileName = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : fileName;

      return {
        id: doc.id ?? null,
        title: doc.title,
        fileName: inferredFileName,
        treePath: fullPath,
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
      };
    });

    res.status(200).json({
      content: items,
      totalElements,
      totalPages,
      page: currentPage,
      size,
    });
  } catch (error) {
    globalThis.console.error('[public official-documents-tree] error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}

