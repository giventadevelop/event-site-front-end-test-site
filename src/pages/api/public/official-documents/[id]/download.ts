import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
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

function contentDisposition(fileName: string, contentType: string): string {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_') || 'download';
  const encoded = encodeURIComponent(fileName);
  const isPdf =
    contentType.toLowerCase().includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
  const disposition = isPdf ? 'inline' : 'attachment';
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

function resolveDownloadFileName(doc: EventMediaDTO | null, mediaId: number): string {
  if (!doc) {
    return `official-document-${mediaId}`;
  }
  const fromPath = doc.fileUrl?.split('/').pop()?.split('?')[0]?.trim();
  if (fromPath) {
    return fromPath;
  }
  const title = doc.title?.trim();
  if (title) {
    return title.includes('.') ? title : `${title}.pdf`;
  }
  return `official-document-${mediaId}`;
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

async function fetchMediaDoc(mediaId: number): Promise<EventMediaDTO | null> {
  const mediaUrl = `${getApiBaseUrl()}/api/event-medias/${mediaId}`;
  const mediaRes = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });
  if (!mediaRes.ok) {
    return null;
  }
  return (await mediaRes.json()) as EventMediaDTO;
}

/** Stream file bytes through this route (server fetches S3; browser stays same-origin). */
async function streamDownloadUrl(
  res: NextApiResponse,
  downloadUrl: string,
  fileName: string
): Promise<boolean> {
  try {
    const fileRes = await fetch(downloadUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (!fileRes.ok) {
      return false;
    }
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    setNoStoreHeaders(res);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Content-Disposition', contentDisposition(fileName, contentType));
    res.status(200).send(buffer);
    return true;
  } catch (error) {
    globalThis.console.error('[official-documents download] stream error:', error);
    return false;
  }
}

/**
 * Public download proxy: mints a fresh S3 presigned URL via the backend on each request,
 * then streams bytes through this route (repeat-safe) or returns JSON / redirect when asked.
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

  try {
    const downloadUrl = await fetchFreshDownloadUrl(mediaId);
    if (!downloadUrl) {
      res.status(404).json({ error: 'No download URL available for this document' });
      return;
    }

    const wantsJson =
      req.query.format === 'json' ||
      (Array.isArray(req.headers.accept) ? req.headers.accept.join(',') : req.headers.accept)?.includes(
        'application/json'
      );

    if (wantsJson) {
      res.status(200).json({ downloadUrl, mediaId });
      return;
    }

    if (req.query.format === 'redirect') {
      res.redirect(302, downloadUrl);
      return;
    }

    const doc = await fetchMediaDoc(mediaId);
    const fileName = resolveDownloadFileName(doc, mediaId);
    const streamed = await streamDownloadUrl(res, downloadUrl, fileName);
    if (streamed) {
      return;
    }

    res.status(502).json({ error: 'Unable to stream download' });
  } catch (error) {
    globalThis.console.error('[official-documents download] error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
