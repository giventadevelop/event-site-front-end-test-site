import type { EventMediaDTO } from '@/types';
import {
  getOfficialDocumentProxyThumbnailPath,
  isAwsPresignedQueryUrl,
  isPresignedUrlExpired,
} from '@/lib/officialDocumentDownload';

export type EventMediaThumbnailInput = Pick<
  EventMediaDTO,
  'fileUrl' | 'thumbnailUrl' | 'thumbnailPreSignedUrl' | 'fileDataContentType' | 'contentType' | 'title'
> & {
  fileName?: string;
  preSignedUrl?: string;
  eventMediaType?: string;
};

export type OfficialDocumentPlaceholderKind = 'pdf' | 'word' | 'excel' | 'image' | 'generic';

/** Card preview frame on /mosc-redesign/downloads (Tailwind aspect-[16/10]). */
export const OFFICIAL_DOCUMENT_CARD_THUMBNAIL_ASPECT = '16 / 10';

/** Recommended upload size for download card thumbnails (2× desktop ~400px width). */
export const OFFICIAL_DOCUMENT_CARD_THUMBNAIL_RECOMMENDED = {
  width: 800,
  height: 500,
  label: '800×500 px (16:10)',
} as const;

/** Plain-text spec for clipboard copy (excludes UI-only preview-frame intro copy). */
export const OFFICIAL_DOCUMENT_THUMBNAIL_COPY_SPEC = [
  'Aspect ratio: 16:10 (landscape)',
  `Recommended upload: ${OFFICIAL_DOCUMENT_CARD_THUMBNAIL_RECOMMENDED.label} (good for retina; minimum 640×400 px)`,
  'Format: JPG or PNG',
  'Display fit: object-cover — center important content; edges may crop slightly',
  '',
  'On desktop (~3 columns in max-w-7xl), each thumbnail is roughly 360 px wide × 225 px tall.',
  `Upload at ${OFFICIAL_DOCUMENT_CARD_THUMBNAIL_RECOMMENDED.label} so it stays sharp on high-DPI screens.`,
].join('\n');

function mimeFromMedia(media: EventMediaThumbnailInput): string {
  const mime = (media.fileDataContentType || media.contentType || '').toLowerCase();
  if (mime) return mime;
  const row = media as Record<string, unknown>;
  const eventMediaType =
    readStringField(row, 'eventMediaType', 'event_media_type') || media.eventMediaType?.trim() || '';
  if (eventMediaType.includes('/')) {
    return eventMediaType.toLowerCase();
  }
  const name = media.fileName || media.title || media.fileUrl || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'application/pdf';
  if (['doc', 'docx'].includes(ext)) return 'application/msword';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'application/vnd.ms-excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  return '';
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

function pickUsableUrl(
  preSigned?: string | null,
  stable?: string | null,
  expiresAtIso?: string | null
): string | null {
  const pre = preSigned?.trim();
  if (pre && !isPresignedUrlExpired(pre, expiresAtIso)) {
    return pre;
  }

  const stableUrl = stable?.trim();
  if (!stableUrl) {
    return null;
  }

  if (isAwsPresignedQueryUrl(stableUrl)) {
    return isPresignedUrlExpired(stableUrl, expiresAtIso) ? null : stableUrl;
  }

  return stableUrl;
}

/** S3 object key path used to detect stale cached presigns after thumbnail replace. */
export function storageObjectPathFromUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    return decodeURIComponent(new URL(trimmed).pathname);
  } catch {
    const withoutQuery = trimmed.split('?')[0] ?? '';
    try {
      return decodeURIComponent(new URL(withoutQuery).pathname);
    } catch {
      return withoutQuery;
    }
  }
}

/**
 * After thumbnail replace, backend updates `thumbnailUrl` to a new S3 key but may leave
 * a still-valid `thumbnailPreSignedUrl` pointing at the previous object.
 */
export function isThumbnailPresignStale(
  thumbnailUrl: string | null | undefined,
  thumbnailPreSignedUrl: string | null | undefined,
  expiresAtIso?: string | null
): boolean {
  const stable = thumbnailUrl?.trim();
  const presigned = thumbnailPreSignedUrl?.trim();
  if (!stable || !presigned || isPresignedUrlExpired(presigned, expiresAtIso)) {
    return false;
  }
  const stablePath = storageObjectPathFromUrl(stable);
  const presignedPath = storageObjectPathFromUrl(presigned);
  return Boolean(stablePath && presignedPath && stablePath !== presignedPath);
}

/** Resolved URL for card/list preview, or null when a placeholder should be shown. */
export function getEventMediaDisplayThumbnailUrl(
  media: EventMediaThumbnailInput,
  options?: {
    thumbnailExpiresAtIso?: string | null;
    fileExpiresAtIso?: string | null;
  }
): string | null {
  const fields = resolveEventMediaThumbnailFields(media);
  const stableThumb = fields.thumbnailUrl;
  const presignedThumb = fields.thumbnailPreSignedUrl;

  if (
    stableThumb &&
    isThumbnailPresignStale(stableThumb, presignedThumb, options?.thumbnailExpiresAtIso)
  ) {
    return stableThumb;
  }

  // Prefer stable object URL so the thumbnail proxy can append a cache-bust query param.
  // Presigned URLs cannot be mutated and may keep serving a replaced object from CDN cache.
  if (stableThumb && !isAwsPresignedQueryUrl(stableThumb)) {
    return stableThumb;
  }

  const uploadedThumb = pickUsableUrl(
    presignedThumb,
    stableThumb,
    options?.thumbnailExpiresAtIso
  );
  if (uploadedThumb) {
    return uploadedThumb;
  }

  const mime = mimeFromMedia(media);
  if (isImageMime(mime)) {
    const row = media as Record<string, unknown>;
    const preSigned =
      readStringField(row, 'preSignedUrl', 'pre_signed_url') || media.preSignedUrl?.trim() || '';
    const imageUrl = pickUsableUrl(preSigned, fields.fileUrl, options?.fileExpiresAtIso);
    if (imageUrl) {
      if (isAwsPresignedQueryUrl(imageUrl)) {
        return isPresignedUrlExpired(imageUrl, options?.fileExpiresAtIso) ? null : imageUrl;
      }
      return imageUrl;
    }
  }

  return null;
}

/** True when the record may have a preview image (uploaded thumb or image main file). */
export function hasOfficialDocumentDisplayThumbnail(
  media: EventMediaThumbnailInput,
  options?: {
    thumbnailExpiresAtIso?: string | null;
    fileExpiresAtIso?: string | null;
    /** When true, DB has a stored thumbnail path even if list presign is expired. */
    hasStoredThumbnail?: boolean;
  }
): boolean {
  if (options?.hasStoredThumbnail) {
    return true;
  }
  if (media.thumbnailUrl?.trim() || media.thumbnailPreSignedUrl?.trim()) {
    return true;
  }
  return isImageMime(mimeFromMedia(media));
}

type ThumbnailCacheKeySource = Pick<
  EventMediaDTO,
  'id' | 'updatedAt' | 'thumbnailUrl' | 'thumbnailPreSignedUrl' | 'thumbnailPreSignedUrlExpiresAt'
>;

function readStringField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

/** Read thumbnail fields from API rows that may use camelCase or snake_case. */
export function resolveEventMediaThumbnailFields(
  media: EventMediaThumbnailInput
): {
  fileUrl: string;
  thumbnailUrl: string;
  thumbnailPreSignedUrl: string;
  fileDataContentType: string;
  contentType: string;
  title: string;
  fileName?: string;
} {
  const row = media as Record<string, unknown>;
  return {
    fileUrl: readStringField(row, 'fileUrl', 'file_url') || media.fileUrl?.trim() || '',
    thumbnailUrl: readStringField(row, 'thumbnailUrl', 'thumbnail_url') || media.thumbnailUrl?.trim() || '',
    thumbnailPreSignedUrl:
      readStringField(row, 'thumbnailPreSignedUrl', 'thumbnail_pre_signed_url') ||
      media.thumbnailPreSignedUrl?.trim() ||
      '',
    fileDataContentType:
      readStringField(row, 'fileDataContentType', 'file_data_content_type') ||
      media.fileDataContentType?.trim() ||
      media.contentType?.trim() ||
      '',
    contentType: readStringField(row, 'contentType', 'content_type') || media.contentType?.trim() || '',
    title: readStringField(row, 'title') || media.title?.trim() || '',
    fileName: media.fileName,
  };
}

function readAmzDateFromPresignedUrl(url: string): string {
  try {
    return new URL(url).searchParams.get('X-Amz-Date')?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * Cache-bust token for card preview URLs. Combines metadata that changes when a thumbnail
 * is uploaded or replaced (updatedAt, presign expiry, Amz-Date, stable storage path).
 */
export function buildOfficialDocumentThumbnailCacheKey(
  doc: ThumbnailCacheKeySource
): string | null {
  const row = doc as Record<string, unknown>;
  const updatedAt = readStringField(row, 'updatedAt', 'updated_at');
  const thumbExpires = readStringField(
    row,
    'thumbnailPreSignedUrlExpiresAt',
    'thumbnail_pre_signed_url_expires_at'
  );
  const presigned = readStringField(row, 'thumbnailPreSignedUrl', 'thumbnail_pre_signed_url');
  const amzDate = presigned ? readAmzDateFromPresignedUrl(presigned) : '';
  const thumbPath = readStringField(row, 'thumbnailUrl', 'thumbnail_url').split('?')[0]?.trim() || '';

  const parts = [updatedAt, thumbExpires, amzDate, thumbPath].filter(Boolean);
  if (parts.length > 0) {
    return parts.join('|');
  }
  if (doc.id != null && Number.isFinite(doc.id)) {
    return String(doc.id);
  }
  return null;
}

function readUpdatedAtMs(doc: EventMediaDTO): number {
  const row = doc as Record<string, unknown>;
  const updatedAt = readStringField(row, 'updatedAt', 'updated_at');
  const ms = Date.parse(updatedAt);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * When list/RSC props lag behind a recent thumbnail upload, keep the fresher thumbnail
 * metadata already held in client state (newer path, newer updatedAt, or stale list presign).
 */
export function mergeEventMediaPreservingNewerThumbnail(
  preferred: EventMediaDTO,
  incoming: EventMediaDTO
): EventMediaDTO {
  const preferredFields = resolveEventMediaThumbnailFields(preferred);
  const incomingFields = resolveEventMediaThumbnailFields(incoming);

  if (!preferredFields.thumbnailUrl) {
    return incoming;
  }

  const preferredPath = storageObjectPathFromUrl(preferredFields.thumbnailUrl);
  const incomingPath = storageObjectPathFromUrl(incomingFields.thumbnailUrl);
  const preferredUpdated = readUpdatedAtMs(preferred);
  const incomingUpdated = readUpdatedAtMs(incoming);
  const incomingPresignStale = isThumbnailPresignStale(
    incomingFields.thumbnailUrl,
    incomingFields.thumbnailPreSignedUrl,
    incoming.thumbnailPreSignedUrlExpiresAt
  );

  const keepPreferredThumbnail =
    preferredUpdated > incomingUpdated ||
    incomingPresignStale ||
    (Boolean(preferredPath && incomingPath) &&
      preferredPath !== incomingPath &&
      preferredUpdated >= incomingUpdated);

  if (!keepPreferredThumbnail) {
    return incoming;
  }

  return {
    ...incoming,
    thumbnailUrl: preferred.thumbnailUrl ?? preferredFields.thumbnailUrl,
    thumbnailPreSignedUrl: preferred.thumbnailPreSignedUrl ?? preferredFields.thumbnailPreSignedUrl,
    thumbnailPreSignedUrlExpiresAt:
      preferred.thumbnailPreSignedUrlExpiresAt ?? incoming.thumbnailPreSignedUrlExpiresAt,
    updatedAt:
      preferredUpdated >= incomingUpdated
        ? preferred.updatedAt ?? incoming.updatedAt
        : incoming.updatedAt,
  };
}

export function mergeEventMediaListPreservingThumbnails(
  incoming: EventMediaDTO[],
  previous: EventMediaDTO[]
): EventMediaDTO[] {
  if (previous.length === 0) {
    return incoming;
  }
  const prevById = new Map(
    previous.filter((d) => d.id != null).map((d) => [d.id as number, d])
  );
  return incoming.map((doc) => {
    if (doc.id == null) {
      return doc;
    }
    const existing = prevById.get(doc.id);
    if (!existing) {
      return doc;
    }
    return mergeEventMediaPreservingNewerThumbnail(existing, doc);
  });
}

/** Merge server metadata cache key with a client revision (e.g. after thumbnail upload). */
export function composeOfficialDocumentThumbnailCacheKey(
  doc: ThumbnailCacheKeySource,
  options?: { revision?: number }
): string | null {
  const base = buildOfficialDocumentThumbnailCacheKey(doc);
  const revision = options?.revision;
  if (revision != null && revision > 0) {
    return base ? `${base}|rev:${revision}` : `rev:${revision}`;
  }
  return base;
}

/** True when event_media has a persisted thumbnail object (not only an image main file). */
export function hasStoredOfficialDocumentThumbnail(
  doc: Pick<EventMediaDTO, 'thumbnailUrl'>
): boolean {
  const row = doc as Record<string, unknown>;
  return Boolean(readStringField(row, 'thumbnailUrl', 'thumbnail_url'));
}

/**
 * Prefer the same-origin thumbnail proxy when a media id is available so cards never
 * rely on expired presigned URLs stored in event_media.
 */
export function getOfficialDocumentCardThumbnailSrc(
  mediaId: number | null | undefined,
  media: EventMediaThumbnailInput,
  options?: {
    thumbnailExpiresAtIso?: string | null;
    fileExpiresAtIso?: string | null;
    /** Bust browser/proxy cache when thumbnail metadata changes (e.g. updatedAt). */
    cacheKey?: string | null;
    hasStoredThumbnail?: boolean;
    /**
     * Authoritative S3 thumbnail URL (from the upload write-response / fresh server render)
     * the proxy should stream directly, bypassing a possibly-stale by-id metadata read.
     */
    srcHint?: string | null;
  }
): string | null {
  if (
    mediaId != null &&
    hasOfficialDocumentDisplayThumbnail(media, {
      thumbnailExpiresAtIso: options?.thumbnailExpiresAtIso,
      fileExpiresAtIso: options?.fileExpiresAtIso,
      hasStoredThumbnail: options?.hasStoredThumbnail,
    })
  ) {
    return getOfficialDocumentProxyThumbnailPath(mediaId, options?.cacheKey, options?.srcHint);
  }
  return getEventMediaDisplayThumbnailUrl(media, options);
}

export function getOfficialDocumentPlaceholderKind(
  media: EventMediaThumbnailInput
): OfficialDocumentPlaceholderKind {
  const mime = mimeFromMedia(media);
  if (isImageMime(mime)) return 'image';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('word') || mime.includes('msword') || mime.includes('document')) return 'word';
  if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv')) return 'excel';
  const name = (media.fileName || media.title || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  return 'generic';
}

export function placeholderGradient(kind: OfficialDocumentPlaceholderKind): string {
  switch (kind) {
    case 'pdf':
      return 'from-red-50 via-red-100 to-orange-50';
    case 'word':
      return 'from-blue-50 via-blue-100 to-indigo-50';
    case 'excel':
      return 'from-emerald-50 via-green-100 to-teal-50';
    case 'image':
      return 'from-violet-50 via-purple-100 to-fuchsia-50';
    default:
      return 'from-slate-50 via-gray-100 to-slate-100';
  }
}

export function placeholderLabel(kind: OfficialDocumentPlaceholderKind): string {
  switch (kind) {
    case 'pdf':
      return 'PDF';
    case 'word':
      return 'DOC';
    case 'excel':
      return 'XLS';
    case 'image':
      return 'IMG';
    default:
      return 'FILE';
  }
}
