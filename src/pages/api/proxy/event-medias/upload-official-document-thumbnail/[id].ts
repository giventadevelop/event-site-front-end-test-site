import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getRawBody } from '@/lib/getRawBody';
import { getApiBaseUrl, getTenantId } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Proxies multipart thumbnail upload to Spring:
 * POST /api/event-medias/{id}/upload-official-document-thumbnail
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    const { id } = req.query;
    const mediaId = Array.isArray(id) ? id[0] : id;
    if (!mediaId) {
      res.status(400).json({ error: 'Media id is required' });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const apiUrl = `${API_BASE_URL}/api/event-medias/${mediaId}/upload-official-document-thumbnail`;

    // Buffer multipart body (more reliable than streaming IncomingMessage)
    const rawBody = await getRawBody(req);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': getTenantId(),
      'content-length': String(rawBody.length),
    };
    if (req.headers['content-type']) {
      headers['content-type'] = Array.isArray(req.headers['content-type'])
        ? req.headers['content-type'][0]
        : req.headers['content-type'];
    }

    // Native fetch (undici) — node-fetch can Premature-close on multipart responses
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      const text = await apiRes.text();
      res.status(apiRes.status);
      res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');
      res.send(text);
      return;
    }

    let backendDetail = '';
    try {
      backendDetail = await apiRes.text();
    } catch {
      /* ignore */
    }

    res.status(apiRes.status >= 400 ? apiRes.status : 500);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      error: 'Thumbnail upload failed',
      status: apiRes.status,
      message: `Thumbnail upload failed with HTTP status ${apiRes.status}`,
      details: backendDetail || undefined,
      success: false,
    });
  } catch (err) {
    console.error('Proxy error (upload-official-document-thumbnail):', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
