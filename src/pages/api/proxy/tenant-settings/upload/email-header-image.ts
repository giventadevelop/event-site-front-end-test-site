import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const tenantId = getTenantId();
    const url = `${API_BASE_URL}/api/tenant-settings/upload/email-header-image?tenantId=${encodeURIComponent(tenantId)}`;

    const rawBody = await getRawBody(req);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
      'content-length': String(rawBody.length),
    };

    if (req.headers['content-type']) {
      headers['content-type'] = Array.isArray(req.headers['content-type'])
        ? req.headers['content-type'][0]
        : req.headers['content-type'];
    }

    const apiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (apiRes.status === 401) {
      token = await generateApiJwt();
      headers.Authorization = `Bearer ${token}`;
      const retryRes = await fetch(url, {
        method: 'POST',
        headers,
        body: rawBody,
      });
      const data = await retryRes.text();
      res.status(retryRes.status).send(data);
      return;
    }

    const data = await apiRes.text();
    res.status(apiRes.status).send(data);
  } catch (err: unknown) {
    console.error('[Proxy] Error uploading email header image:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
