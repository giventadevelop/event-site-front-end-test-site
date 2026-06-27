import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';

function parseMediaId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return Math.trunc(id);
}

/**
 * Public download redirect: mints a fresh S3 presigned URL via the backend on each request.
 * Avoids linking to expired preSignedUrl values stored in event_media at upload time.
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
    const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}/download-url?expirationHours=24`;
    const backendRes = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!backendRes.ok) {
      const details = await backendRes.text().catch(() => '');
      globalThis.console.error(
        '[official-documents download] backend error:',
        backendRes.status,
        details
      );
      res.status(backendRes.status === 404 ? 404 : 502).json({
        error: 'Unable to prepare download link',
        details: details || undefined,
      });
      return;
    }

    const payload = (await backendRes.json()) as { downloadUrl?: string };
    const downloadUrl = payload.downloadUrl?.trim();
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

    res.redirect(302, downloadUrl);
  } catch (error) {
    globalThis.console.error('[official-documents download] error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
