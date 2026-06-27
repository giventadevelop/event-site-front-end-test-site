import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

function buildQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (typeof value !== 'undefined') {
      params.append(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_BASE_URL = getApiBaseUrl();
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured', code: 'MISSING_ENV' });
      return;
    }

    const token = await getCachedApiJwt();
    const { method, query, body } = req;
    const queryString = buildQueryString(query);

    const apiUrl = `${API_BASE_URL}/api/user-tasks${queryString}`;
    let apiRes;
    switch (method) {
      case 'GET':
        apiRes = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        break;
      case 'POST':
        apiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const data = await apiRes.text();
    res.status(apiRes.status).send(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PROXY user-tasks]', message);
    console.error('[PROXY user-tasks] stack:', err instanceof Error ? err.stack : 'n/a');
    res.status(500).json({
      error: 'Proxy error',
      code: 'PROXY_ERROR',
      message: message,
    });
  }
}