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

console.log('user-tasks proxy handler loaded (single segment test)');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[proxy] user-tasks:', { method: req.method, slug: req.query.slug, query: req.query });
    const API_BASE_URL = getApiBaseUrl();
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured', code: 'MISSING_ENV' });
      return;
    }

    const token = await getCachedApiJwt();
    const { method, query, body } = req;
    const slug = req.query.slug as string | string[] | undefined;
    const slugStr = Array.isArray(slug) ? slug.join('/') : slug;
    const queryString = buildQueryString(query);

    // Handle /:id (single task CRUD)
    if (slugStr && method !== 'POST') {
      const id = slugStr;
      const apiUrl = `${API_BASE_URL}/api/user-tasks/${id}${queryString}`;
      let apiRes;
      switch (method) {
        case 'GET':
          apiRes = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        case 'PUT':
          apiRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });
          break;
        case 'DELETE':
          apiRes = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        default:
          res.status(405).json({ error: 'Method not allowed' });
          return;
      }
      const data = await apiRes.text();
      res.status(apiRes.status).send(data);
      return;
    }

    // Handle / (list, create, filter)
    if (!slugStr) {
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
      return;
    }

    // Fallback: Not found
    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PROXY user-tasks/[...slug]]', message);
    console.error('[PROXY user-tasks/[...slug]] stack:', err instanceof Error ? err.stack : 'n/a');
    res.status(500).json({
      error: 'Proxy error',
      code: 'PROXY_ERROR',
      message: message,
    });
  }
}