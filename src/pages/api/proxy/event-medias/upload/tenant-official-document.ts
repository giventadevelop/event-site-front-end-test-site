import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Proxies multipart single upload to Spring:
 * POST /api/event-medias/upload/tenant-official-document
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
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

    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/tenant-official-document`;
    const fetch = (await import('node-fetch')).default;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'] as string;
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'] as string;
    }
    const xTenant = req.headers['x-tenant-id'];
    if (xTenant) {
      headers['x-tenant-id'] = Array.isArray(xTenant) ? xTenant[0] : xTenant;
    }

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: req as unknown as import('node-fetch').BodyInit,
      duplex: 'half',
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      res.status(apiRes.status);
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }
      apiRes.body.pipe(res);
    } else {
      // Read backend body so clients see JHipster/Spring detail (proxy used to drop it).
      let backendPayload: unknown = null;
      try {
        const raw = await apiRes.text();
        if (raw) {
          try {
            backendPayload = JSON.parse(raw) as unknown;
          } catch {
            backendPayload = raw.length > 4000 ? `${raw.slice(0, 4000)}…` : raw;
          }
        }
      } catch {
        backendPayload = null;
      }

      res.status(apiRes.status >= 400 ? apiRes.status : 500);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: 'Upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}`,
        success: false,
        backend: backendPayload,
      });
    }
  } catch (err) {
    console.error('Proxy error (tenant-official-document):', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
