import type { EventMediaDTO } from '@/types';

/** True when the URL includes AWS SigV4 presign query parameters. */
export function isAwsPresignedQueryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.searchParams.has('X-Amz-Algorithm') || u.searchParams.has('X-Amz-Signature');
  } catch {
    return false;
  }
}

/**
 * SSRF guard for the thumbnail proxy's optional `src` hint: only allow S3 object URLs
 * (virtual-host or path-style) so the proxy can never be tricked into fetching an
 * internal host or metadata endpoint. Both presigned and plain S3 URLs are accepted.
 */
export function isAllowedS3ObjectUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') {
      return false;
    }
    const host = u.hostname.toLowerCase();
    return host.endsWith('.amazonaws.com') && host.includes('s3');
  } catch {
    return false;
  }
}

/**
 * Returns true if a presigned GET URL is expired (or cannot be parsed).
 * Uses preSignedUrlExpiresAt when present; otherwise parses X-Amz-Date + X-Amz-Expires.
 */
export function isPresignedUrlExpired(
  url: string,
  expiresAtIso?: string | null
): boolean {
  if (expiresAtIso) {
    const expiresAt = Date.parse(expiresAtIso);
    if (Number.isFinite(expiresAt)) {
      return Date.now() >= expiresAt;
    }
  }

  if (!isAwsPresignedQueryUrl(url)) {
    return false;
  }

  try {
    const u = new URL(url);
    const amzDate = u.searchParams.get('X-Amz-Date');
    const amzExpires = u.searchParams.get('X-Amz-Expires');
    if (!amzDate || !amzExpires) {
      return true;
    }
    const signedAt = Date.parse(
      `${amzDate.slice(0, 4)}-${amzDate.slice(4, 6)}-${amzDate.slice(6, 8)}T${amzDate.slice(9, 11)}:${amzDate.slice(11, 13)}:${amzDate.slice(13, 15)}Z`
    );
    const expiresSeconds = Number(amzExpires);
    if (!Number.isFinite(signedAt) || !Number.isFinite(expiresSeconds)) {
      return true;
    }
    return Date.now() >= signedAt + expiresSeconds * 1000;
  } catch {
    return true;
  }
}

/** Same-origin proxy route that mints a fresh presigned URL on each download. */
export function getOfficialDocumentProxyDownloadPath(mediaId: number | null | undefined): string | null {
  if (mediaId == null || !Number.isFinite(mediaId) || mediaId <= 0) {
    return null;
  }
  return `/api/public/official-documents/${mediaId}/download`;
}

/** Same-origin proxy route that resolves a fresh thumbnail/preview URL on each request. */
export function getOfficialDocumentProxyThumbnailPath(
  mediaId: number | null | undefined,
  cacheKey?: string | null,
  /**
   * Authoritative S3 object URL (e.g. from the upload write-response) the proxy should
   * stream directly, bypassing a possibly-stale `GET /api/event-medias/{id}` read.
   */
  srcHint?: string | null
): string | null {
  if (mediaId == null || !Number.isFinite(mediaId) || mediaId <= 0) {
    return null;
  }
  const base = `/api/public/official-documents/${mediaId}/thumbnail`;
  const params = new URLSearchParams();
  const key = cacheKey?.trim();
  if (key) {
    params.set('v', key);
  }
  const hint = srcHint?.trim();
  if (hint && isAllowedS3ObjectUrl(hint)) {
    params.set('src', hint);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Pick a download URL for list/card display.
 * Prefer the proxy path so clicks never use expired DB presigned URLs.
 */
/** How the browser is likely to deliver the file after the user clicks Download. */
export type OfficialDocumentDeliveryMode = 'new-tab' | 'downloads-folder';

const IN_BROWSER_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'txt',
  'html',
  'htm',
]);

export function getOfficialDocumentDeliveryMode(fileName: string): OfficialDocumentDeliveryMode {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return IN_BROWSER_EXTENSIONS.has(ext) ? 'new-tab' : 'downloads-folder';
}

export function resolveOfficialDocumentDownloadUrl(doc: EventMediaDTO): string | null {
  const proxyPath = getOfficialDocumentProxyDownloadPath(doc.id);
  if (proxyPath) {
    return proxyPath;
  }

  const preSigned = doc.preSignedUrl?.trim();
  if (preSigned && !isPresignedUrlExpired(preSigned, doc.preSignedUrlExpiresAt)) {
    return preSigned;
  }

  const fileUrl = doc.fileUrl?.trim();
  if (!fileUrl) {
    return null;
  }
  if (isAwsPresignedQueryUrl(fileUrl)) {
    return isPresignedUrlExpired(fileUrl, doc.preSignedUrlExpiresAt) ? null : fileUrl;
  }
  return fileUrl;
}
