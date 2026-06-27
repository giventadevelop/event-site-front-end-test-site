import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import { isAllowedS3ObjectUrl, isAwsPresignedQueryUrl } from '@/lib/officialDocumentDownload';
import {
  getEventMediaDisplayThumbnailUrl,
  isImageMime,
  resolveEventMediaThumbnailFields,
} from '@/lib/officialDocumentThumbnail';
import type { EventMediaDTO } from '@/types';

function setNoStoreHeaders(res: NextApiResponse): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

function parseMediaId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return Math.trunc(id);
}

function readCacheBustToken(query: NextApiRequest['query']): string | null {
  const raw = query.v;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) {
    return raw[0].trim();
  }
  return null;
}

/**
 * Optional authoritative S3 thumbnail URL the caller already resolved (e.g. from the upload
 * write-response). Streaming this bypasses the by-id metadata read, which can briefly return a
 * stale `thumbnailUrl` after a replace. Validated against an S3 allowlist to prevent SSRF.
 */
function readThumbnailSrcHint(query: NextApiRequest['query']): string | null {
  const raw = query.src;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value === 'string' && value.trim() && isAllowedS3ObjectUrl(value.trim())) {
    return value.trim();
  }
  return null;
}

function mimeFromDoc(doc: EventMediaDTO): string {
  const mime = (doc.fileDataContentType || doc.contentType || '').toLowerCase();
  if (mime) return mime;
  const name = doc.fileUrl || doc.title || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  }
  return '';
}

async function fetchFreshDownloadUrl(mediaId: number): Promise<string | null> {
  const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}/download-url?expirationHours=24`;
  const backendRes = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!backendRes.ok) {
    return null;
  }
  const payload = (await backendRes.json()) as { downloadUrl?: string };
  return payload.downloadUrl?.trim() || null;
}

function withUpstreamCacheBuster(previewUrl: string, cacheBustToken?: string | null): string {
  if (!cacheBustToken || isAwsPresignedQueryUrl(previewUrl)) {
    return previewUrl;
  }
  try {
    const upstream = new URL(previewUrl);
    upstream.searchParams.set('cb', cacheBustToken.slice(0, 120));
    return upstream.toString();
  } catch {
    return previewUrl;
  }
}

/** Stream bytes through this route so browsers never cache a stale S3 object after thumbnail replace. */
async function streamPreviewUrl(
  res: NextApiResponse,
  previewUrl: string,
  cacheBustToken?: string | null
): Promise<boolean> {
  try {
    const fetchUrl = withUpstreamCacheBuster(previewUrl, cacheBustToken);
    const imageRes = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (!imageRes.ok) {
      return false;
    }
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    setNoStoreHeaders(res);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(buffer.length));
    res.status(200).send(buffer);
    return true;
  } catch (error) {
    globalThis.console.error('[official-documents thumbnail] stream error:', error);
    return false;
  }
}

/**
 * Public thumbnail proxy: loads fresh event_media metadata (and download-url for image files)
 * on every request, then streams image bytes with no-store headers.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const mediaId = parseMediaId(req.query.id);
  if (mediaId == null) {
    res.status(400).json({ error: 'Invalid media id' });
    return;
  }

  const cacheBustToken = readCacheBustToken(req.query);

  // Prefer the caller-supplied authoritative S3 URL so the streamed bytes never depend on a
  // by-id metadata read that may still return the previous thumbnail right after a replace.
  const srcHint = readThumbnailSrcHint(req.query);
  if (srcHint && (await streamPreviewUrl(res, srcHint, cacheBustToken))) {
    return;
  }

  try {
    const mediaUrl = `${getApiBaseUrl()}/api/event-medias/${mediaId}`;
    const mediaRes = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });
    if (!mediaRes.ok) {
      res.status(mediaRes.status === 404 ? 404 : 502).json({ error: 'Unable to load document metadata' });
      return;
    }

    const doc = (await mediaRes.json()) as EventMediaDTO;
    const thumbFields = resolveEventMediaThumbnailFields({
      fileUrl: doc.fileUrl,
      thumbnailUrl: doc.thumbnailUrl,
      thumbnailPreSignedUrl: doc.thumbnailPreSignedUrl,
      fileDataContentType: doc.fileDataContentType || doc.contentType,
      contentType: doc.contentType,
      title: doc.title,
      fileName: doc.fileUrl?.split('/').pop(),
    });
    const previewUrl = getEventMediaDisplayThumbnailUrl(thumbFields, {
      thumbnailExpiresAtIso: doc.thumbnailPreSignedUrlExpiresAt,
      fileExpiresAtIso: doc.preSignedUrlExpiresAt,
    });

    if (previewUrl && (await streamPreviewUrl(res, previewUrl, cacheBustToken))) {
      return;
    }

    if (isImageMime(mimeFromDoc(doc))) {
      const downloadUrl = await fetchFreshDownloadUrl(mediaId);
      if (downloadUrl && (await streamPreviewUrl(res, downloadUrl, cacheBustToken))) {
        return;
      }
    }

    res.status(404).json({ error: 'No thumbnail available for this document' });
  } catch (error) {
    globalThis.console.error('[official-documents thumbnail] error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
