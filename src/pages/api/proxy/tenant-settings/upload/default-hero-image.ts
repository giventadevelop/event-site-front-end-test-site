import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

function resolveTenantId(req: NextApiRequest): string {
  const queryTenantId = req.query.tenantId;
  if (typeof queryTenantId === 'string' && queryTenantId.trim().length > 0) {
    return queryTenantId.trim();
  }
  return getTenantId();
}

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

    const tenantId = resolveTenantId(req);
    const url = `${API_BASE_URL}/api/tenant-settings/upload/default-hero-image`;

    const fetch = (await import('node-fetch')).default;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
    };
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
    }

    const apiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: req,
      duplex: 'half',
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      const data = await apiRes.text();
      res.status(apiRes.status).send(data);
    } else if (apiRes.status === 401) {
      token = await generateApiJwt();
      headers.Authorization = `Bearer ${token}`;
      const retryRes = await fetch(url, {
        method: 'POST',
        headers,
        body: req,
        duplex: 'half',
      });
      const data = await retryRes.text();
      res.status(retryRes.status).send(data);
    } else {
      const errorText = await apiRes.text();
      res.status(apiRes.status).json({ error: errorText });
    }
  } catch (err) {
    console.error('[default-hero-image upload] error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
