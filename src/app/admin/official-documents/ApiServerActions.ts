'use server';

import { revalidatePath } from 'next/cache';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type {
  EventMediaDTO,
  OfficialDocumentCategoryDTO,
  OfficialDocumentYearBundleDTO,
} from '@/types';
import { withTenantId } from '@/lib/withTenantId';
import { OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK } from '@/data/officialDocumentCategoriesFallback';

function revalidateOfficialDocumentPublicPages(): void {
  revalidatePath('/mosc-redesign/downloads');
}

/** Spring Data REST page or raw array */
function parseSpringPage<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

function parseSpringPageMeta(data: unknown): {
  content: unknown[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
} {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length || 20,
    };
  }
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    const content = Array.isArray(o.content) ? o.content : [];
    const size = typeof o.size === 'number' && o.size > 0 ? o.size : 20;
    const number = typeof o.number === 'number' ? o.number : 0;
    const totalElements =
      typeof o.totalElements === 'number' ? o.totalElements : content.length;
    const totalPages =
      typeof o.totalPages === 'number'
        ? o.totalPages
        : Math.max(1, Math.ceil(totalElements / size));
    return { content, totalElements, totalPages, number, size };
  }
  return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
}

function normalizeOfficialDocumentCategory(row: Record<string, unknown>): OfficialDocumentCategoryDTO {
  return {
    id: typeof row.id === 'number' ? row.id : undefined,
    tenantId: String(row.tenantId ?? row.tenant_id ?? ''),
    slug: String(row.slug ?? ''),
    displayName: String(row.displayName ?? row.display_name ?? ''),
    description:
      row.description === null || row.description === undefined
        ? null
        : String(row.description),
    sortOrder:
      typeof row.sortOrder === 'number'
        ? row.sortOrder
        : typeof row.sort_order === 'number'
          ? row.sort_order
          : undefined,
    isActive:
      typeof row.isActive === 'boolean'
        ? row.isActive
        : typeof row.is_active === 'boolean'
          ? row.is_active
          : undefined,
    createdAt:
      row.createdAt != null
        ? String(row.createdAt)
        : row.created_at != null
          ? String(row.created_at)
          : undefined,
    updatedAt:
      row.updatedAt != null
        ? String(row.updatedAt)
        : row.updated_at != null
          ? String(row.updated_at)
          : undefined,
  };
}

/** Set NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK=false to never use built-in slugs when API is missing */
function allowCategoryFallback(): boolean {
  return process.env.NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK !== 'false';
}

export type OfficialDocumentCategoriesFetchResult = {
  categories: OfficialDocumentCategoryDTO[];
  source: 'api' | 'fallback';
  /** Shown in admin UI when using fallback or on error */
  message?: string;
};

/**
 * Lists official document categories via GET /api/official-document-categories (fetchWithJwtRetry + tenant criteria).
 * If the backend returns 404 (endpoint not implemented), returns a built-in slug list so admin upload still works.
 */
export async function fetchOfficialDocumentCategoriesServer(): Promise<OfficialDocumentCategoriesFetchResult> {
  const fallback404 = (): OfficialDocumentCategoriesFetchResult =>
    allowCategoryFallback()
      ? {
          categories: OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK,
          source: 'fallback',
          message:
            'The backend returned 404 for GET /api/official-document-categories — that REST endpoint is not registered on your Spring app yet. Showing a built-in slug list that matches typical DB seeds. After you add the controller/resource, categories will load from the API.',
        }
      : {
          categories: [],
          source: 'api',
          message:
            'Categories API returned 404. Implement GET /api/official-document-categories on the backend, or set NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK to use built-in slugs (default is on; set to false only to hide them).',
        };

  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isActive.equals', 'true');
    params.append('sort', 'sortOrder,asc');
    params.append('size', '200');
    const url = `${getApiBaseUrl()}/api/official-document-categories?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (res.status === 404) {
      console.warn('[official-documents] GET /api/official-document-categories → 404 (using fallback if enabled)');
      return fallback404();
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[official-documents] categories HTTP', res.status, errText.slice(0, 400));
      return {
        categories: [],
        source: 'api',
        message: `Categories request failed (HTTP ${res.status}).`,
      };
    }

    const data = await res.json();
    const rows = parseSpringPage<Record<string, unknown>>(data)
      .map(normalizeOfficialDocumentCategory)
      .filter((c) => c.slug);

    return { categories: rows, source: 'api' };
  } catch (e) {
    console.error('[official-documents] fetchOfficialDocumentCategoriesServer:', e);
    if (allowCategoryFallback()) {
      return {
        categories: OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK,
        source: 'fallback',
        message: 'Could not reach the categories API; showing built-in slug list.',
      };
    }
    return { categories: [], source: 'api', message: String(e) };
  }
}

/** All matching rows (up to `size`) — used for cover picker and legacy refresh. */
export async function fetchTenantOfficialDocumentsServer(filters?: {
  year?: number;
  officialDocumentCategoryId?: number;
  size?: number;
}): Promise<EventMediaDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('sort', 'createdAt,desc');
    params.append('size', String(filters?.size ?? 500));
    if (filters?.year != null) params.append('officialDocumentYear.equals', String(filters.year));
    if (filters?.officialDocumentCategoryId != null) {
      params.append('officialDocumentCategoryId.equals', String(filters.officialDocumentCategoryId));
    }
    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return parseSpringPage<EventMediaDTO>(data);
  } catch (e) {
    console.error('[official-documents] fetchTenantOfficialDocumentsServer:', e);
    return [];
  }
}

export type OfficialDocumentsPageResult = {
  content: EventMediaDTO[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

/** Criteria fields supported for admin document search (Spring Data REST). */
export type OfficialDocumentSearchField = 'title' | 'description' | 'id' | 'eventMediaType';

function appendOfficialDocumentSearchCriteria(
  params: URLSearchParams,
  searchField: OfficialDocumentSearchField | undefined,
  searchTerm: string | undefined
) {
  const term = searchTerm?.trim();
  if (!term) return;

  const field = searchField ?? 'title';
  switch (field) {
    case 'title':
      params.append('title.contains', term);
      break;
    case 'description':
      params.append('description.contains', term);
      break;
    case 'eventMediaType':
      params.append('eventMediaType.contains', term);
      break;
    case 'id': {
      const id = parseInt(term, 10);
      if (!Number.isNaN(id)) params.append('id.equals', String(id));
      break;
    }
    default:
      break;
  }
}

/** Paginated list for admin table (Spring `page` / `size`). */
export async function fetchTenantOfficialDocumentsPagedServer(filters: {
  year?: number;
  officialDocumentCategoryId?: number;
  page?: number;
  size?: number;
  searchField?: OfficialDocumentSearchField;
  searchTerm?: string;
  isPublic?: boolean;
}): Promise<OfficialDocumentsPageResult> {
  const page = filters.page ?? 0;
  const size = filters.size ?? 20;
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('sort', 'createdAt,desc');
    params.append('page', String(page));
    params.append('size', String(size));
    if (filters.year != null) params.append('officialDocumentYear.equals', String(filters.year));
    if (filters.officialDocumentCategoryId != null) {
      params.append('officialDocumentCategoryId.equals', String(filters.officialDocumentCategoryId));
    }
    if (filters.isPublic === true) params.append('isPublic.equals', 'true');
    if (filters.isPublic === false) params.append('isPublic.equals', 'false');
    appendOfficialDocumentSearchCriteria(params, filters.searchField, filters.searchTerm);
    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      return { content: [], totalElements: 0, totalPages: 0, page, size };
    }
    const data = await res.json();
    const meta = parseSpringPageMeta(data);
    const content = meta.content as EventMediaDTO[];
    return {
      content,
      totalElements: meta.totalElements,
      totalPages: meta.totalPages,
      page: meta.number,
      size: meta.size,
    };
  } catch (e) {
    console.error('[official-documents] fetchTenantOfficialDocumentsPagedServer:', e);
    return { content: [], totalElements: 0, totalPages: 0, page, size };
  }
}

export async function patchOfficialDocumentMediaServer(
  mediaId: number,
  existing: EventMediaDTO,
  updates: {
    title: string;
    description?: string;
    isPublic: boolean;
    officialDocumentYear: number;
    officialDocumentCategoryId: number | null;
  }
): Promise<{ ok: true; media: EventMediaDTO } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}`;
    const finalPayload = withTenantId({
      id: mediaId,
      title: updates.title,
      description: updates.description ?? '',
      isPublic: updates.isPublic,
      officialDocumentYear: updates.officialDocumentYear,
      officialDocumentCategoryId: updates.officialDocumentCategoryId,
      eventMediaType: existing.eventMediaType || 'gallery',
      storageType: existing.storageType || 's3',
      // Backend EventMediaDTO marks these as @NotNull; merge-patch validation rejects
      // the request if they are absent, so carry them over from the existing record.
      isHomePageHeroImage: existing.isHomePageHeroImage ?? false,
      isFeaturedEventImage: existing.isFeaturedEventImage ?? false,
      isLiveEventImage: existing.isLiveEventImage ?? false,
      createdAt: existing.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(finalPayload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const media = (await res.json()) as EventMediaDTO;
    revalidateOfficialDocumentPublicPages();
    return { ok: true, media };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** POST multipart thumbnail to backend (direct — avoids node-fetch proxy Premature close). */
export async function uploadOfficialDocumentThumbnailServer(
  mediaId: number,
  thumbnailFile: File
): Promise<{ ok: true; media: EventMediaDTO } | { ok: false; message: string }> {
  try {
    const formData = new FormData();
    formData.append('thumbnailFile', thumbnailFile);

    const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}/upload-official-document-thumbnail`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }

    const media = (await res.json()) as EventMediaDTO;
    revalidateOfficialDocumentPublicPages();
    return { ok: true, media };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** Reload a single official document after thumbnail upload (fresh presign + updatedAt). */
export async function fetchOfficialDocumentMediaByIdServer(
  mediaId: number
): Promise<EventMediaDTO | null> {
  try {
    const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as EventMediaDTO;
  } catch (e) {
    console.error('[official-documents] fetchOfficialDocumentMediaByIdServer:', e);
    return null;
  }
}

export async function deleteOfficialDocumentMediaServer(
  mediaId: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}`;
    const res = await fetchWithJwtRetry(url, { method: 'DELETE', cache: 'no-store' });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    revalidateOfficialDocumentPublicPages();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

function normalizeOfficialDocumentYearBundle(row: Record<string, unknown>): OfficialDocumentYearBundleDTO {
  const catId = row.officialDocumentCategoryId ?? row.official_document_category_id;
  const coverId = row.coverEventMediaId ?? row.cover_event_media_id;
  const coverRaw = row.coverEventMedia ?? row.cover_event_media;
  const nestedCover =
    coverRaw && typeof coverRaw === 'object'
      ? (coverRaw as Partial<EventMediaDTO>)
      : undefined;
  return {
    id: typeof row.id === 'number' ? row.id : row.id != null ? Number(row.id) : undefined,
    tenantId: row.tenantId != null ? String(row.tenantId) : row.tenant_id != null ? String(row.tenant_id) : undefined,
    officialDocumentCategoryId: Number(catId),
    documentYear: Number(row.documentYear ?? row.document_year),
    coverEventMediaId:
      coverId === null || coverId === undefined ? null : Number(coverId),
    createdAt:
      row.createdAt != null
        ? String(row.createdAt)
        : row.created_at != null
          ? String(row.created_at)
          : undefined,
    updatedAt:
      row.updatedAt != null
        ? String(row.updatedAt)
        : row.updated_at != null
          ? String(row.updated_at)
          : undefined,
    coverEventMedia: nestedCover ?? undefined,
  };
}

/** Lists year bundles for the tenant (GET /api/official-document-year-bundles). Returns [] if backend 404 or error. */
export async function fetchOfficialDocumentYearBundlesServer(): Promise<OfficialDocumentYearBundleDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('sort', 'documentYear,desc');
    params.append('size', '500');
    const url = `${getApiBaseUrl()}/api/official-document-year-bundles?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (res.status === 404) return [];
    if (!res.ok) return [];
    const data = await res.json();
    return parseSpringPage<Record<string, unknown>>(data)
      .map(normalizeOfficialDocumentYearBundle)
      .filter((b) => b.officialDocumentCategoryId != null && !Number.isNaN(b.officialDocumentCategoryId));
  } catch (e) {
    console.error('[official-documents] fetchOfficialDocumentYearBundlesServer:', e);
    return [];
  }
}

/** POST create bundle (tenant + category + year). */
export async function createOfficialDocumentYearBundleServer(
  officialDocumentCategoryId: number,
  documentYear: number
): Promise<{ ok: true; bundle: OfficialDocumentYearBundleDTO } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/official-document-year-bundles`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withTenantId({ officialDocumentCategoryId, documentYear })),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const data = await res.json();
    const bundle = normalizeOfficialDocumentYearBundle(data as Record<string, unknown>);
    return { ok: true, bundle };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** PATCH bundle cover (merge-patch). */
export async function patchOfficialDocumentYearBundleServer(
  bundleId: number,
  patch: { coverEventMediaId?: number | null }
): Promise<{ ok: true; bundle: OfficialDocumentYearBundleDTO } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/official-document-year-bundles/${bundleId}`;
    const finalPayload = { ...patch, id: bundleId };
    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(finalPayload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const data = await res.json();
    const bundle = normalizeOfficialDocumentYearBundle(data as Record<string, unknown>);
    return { ok: true, bundle };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

// --- Official document categories (admin CRUD + pagination) ---

export type OfficialDocumentCategoriesPageResult = {
  content: OfficialDocumentCategoryDTO[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

/**
 * Paginated categories for admin. Returns `ok: false` when GET /api/official-document-categories is missing (404).
 */
export async function fetchOfficialDocumentCategoriesPagedServer(filters: {
  page?: number;
  size?: number;
  /** If true, only active categories. If false, omit filter (tenant-wide list for admin). */
  activeOnly?: boolean;
}): Promise<
  | { ok: true; data: OfficialDocumentCategoriesPageResult }
  | { ok: false; reason: 'not_found' | 'error'; message?: string }
> {
  const page = filters.page ?? 0;
  const size = filters.size ?? 20;
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('sort', 'sortOrder,asc');
    params.append('page', String(page));
    params.append('size', String(size));
    if (filters.activeOnly === true) {
      params.append('isActive.equals', 'true');
    }
    const url = `${getApiBaseUrl()}/api/official-document-categories?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (res.status === 404) {
      return { ok: false, reason: 'not_found' };
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, reason: 'error', message: t || `HTTP ${res.status}` };
    }

    const json = await res.json();
    const meta = parseSpringPageMeta(json);
    const content = (meta.content as Record<string, unknown>[])
      .map(normalizeOfficialDocumentCategory)
      .filter((c) => c.slug);

    return {
      ok: true,
      data: {
        content,
        totalElements: meta.totalElements,
        totalPages: meta.totalPages,
        page: meta.number,
        size: meta.size,
      },
    };
  } catch (e) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function createOfficialDocumentCategoryServer(payload: {
  slug: string;
  displayName: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<{ ok: true; category: OfficialDocumentCategoryDTO } | { ok: false; message: string }> {
  try {
    const now = new Date().toISOString();
    const body = withTenantId({
      slug: payload.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      displayName: payload.displayName.trim(),
      description: payload.description?.trim() ?? '',
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive !== false,
      createdAt: now,
      updatedAt: now,
    });
    const url = `${getApiBaseUrl()}/api/official-document-categories`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const row = (await res.json()) as Record<string, unknown>;
    return { ok: true, category: normalizeOfficialDocumentCategory(row) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function patchOfficialDocumentCategoryServer(
  categoryId: number,
  updates: {
    slug: string;
    displayName: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<{ ok: true; category: OfficialDocumentCategoryDTO } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/official-document-categories/${categoryId}`;
    const finalPayload = withTenantId({
      id: categoryId,
      slug: updates.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      displayName: updates.displayName.trim(),
      description: updates.description?.trim() ?? '',
      sortOrder: updates.sortOrder ?? 0,
      isActive: updates.isActive !== false,
      updatedAt: new Date().toISOString(),
    });
    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(finalPayload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const row = (await res.json()) as Record<string, unknown>;
    return { ok: true, category: normalizeOfficialDocumentCategory(row) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteOfficialDocumentCategoryServer(
  categoryId: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/official-document-categories/${categoryId}?tenantId.equals=${encodeURIComponent(getTenantId())}`;
    const res = await fetchWithJwtRetry(url, { method: 'DELETE', cache: 'no-store' });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
