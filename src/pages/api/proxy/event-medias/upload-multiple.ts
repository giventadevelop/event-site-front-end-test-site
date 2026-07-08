import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

async function forwardUpload(
  apiUrl: string,
  rawBody: Buffer,
  contentType: string | undefined,
  token: string,
  tenantId: string
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-Tenant-ID': tenantId,
    'content-length': String(rawBody.length),
  };
  if (contentType) {
    headers['content-type'] = contentType;
  }
  return fetch(apiUrl, {
    method: 'POST',
    headers,
    body: rawBody,
  });
}

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

    const apiUrl = `${API_BASE_URL}/api/event-medias/upload-multiple`;
    const tenantId = getTenantId();
    const rawBody = await getRawBody(req);
    const contentType = Array.isArray(req.headers['content-type'])
      ? req.headers['content-type'][0]
      : req.headers['content-type'];

    let apiRes = await forwardUpload(apiUrl, rawBody, contentType, token, tenantId);

    if (apiRes.status === 401) {
      token = await generateApiJwt();
      apiRes = await forwardUpload(apiUrl, rawBody, contentType, token, tenantId);
    }

    const bodyText = await apiRes.text();

    if (apiRes.status >= 200 && apiRes.status < 300) {
      console.log('✅ Proxy: Backend upload-multiple successful - HTTP status:', apiRes.status);
      res.status(apiRes.status);
      const responseContentType = apiRes.headers.get('content-type');
      if (responseContentType) {
        res.setHeader('Content-Type', responseContentType);
      } else if (bodyText.trim().startsWith('[') || bodyText.trim().startsWith('{')) {
        res.setHeader('Content-Type', 'application/json');
      }
      // Buffer response — do not pipe (pipe can hang browser fetch in Next.js API routes).
      res.send(bodyText);
      return;
    }

    console.error('❌ Proxy: Backend upload-multiple failed - HTTP status:', apiRes.status);
    res.status(apiRes.status >= 400 ? apiRes.status : 500);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      error: 'Upload failed',
      status: apiRes.status,
      message: `Upload operation failed with HTTP status ${apiRes.status}`,
      details: bodyText || undefined,
      success: false,
    });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
