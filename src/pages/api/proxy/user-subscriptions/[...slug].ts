import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

function buildQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  for (const key in query) {
    if (key !== 'id') params.append(key, query[key]);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Generalized fetch with JWT retry and debug logging
async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
  let token = await getCachedApiJwt();
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(`[${debugLabel}] First attempt:`, apiUrl, response.status);
  if (response.status === 401) {
    console.warn(`[${debugLabel}] JWT expired/invalid, regenerating and retrying...`);
    token = await generateApiJwt();
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[${debugLabel}] Second attempt:`, apiUrl, response.status);
  }
  return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!API_BASE_URL) {
    res.status(500).json({ error: 'API base URL not configured' });
    return;
  }

  const { method, query, body } = req;
  const slug = (req.query.slug || []) as string[];
  const queryString = buildQueryString(query);

  // Handle /by-profile/:profileId
  if (slug[0] === 'by-profile' && slug[1] && method === 'GET') {
    const profileId = slug[1];
    const apiUrl = `${API_BASE_URL}/api/user-subscriptions/by-profile/${profileId}`;
    const apiRes = await fetchWithJwtRetry(apiUrl, { method: 'GET' }, 'user-subscriptions-by-profile-GET');
    const data = await apiRes.text();
    res.status(apiRes.status).send(data);
    return;
  }

  // Handle /:id (single subscription CRUD)
  if (slug.length === 1 && slug[0] && method !== 'POST') {
    const id = slug[0];
    const apiUrl = `${API_BASE_URL}/api/user-subscriptions/${id}${queryString}`;
    let apiRes;
    switch (method) {
      case 'GET':
        apiRes = await fetchWithJwtRetry(apiUrl, { method: 'GET' }, 'user-subscriptions-id-GET');
        break;
      case 'PUT':
        apiRes = await fetchWithJwtRetry(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }, 'user-subscriptions-id-PUT');
        break;
      case 'DELETE':
        apiRes = await fetchWithJwtRetry(apiUrl, { method: 'DELETE' }, 'user-subscriptions-id-DELETE');
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
  if (slug.length === 0) {
    const apiUrl = `${API_BASE_URL}/api/user-subscriptions${queryString}`;
    let apiRes;
    switch (method) {
      case 'GET':
        apiRes = await fetchWithJwtRetry(apiUrl, { method: 'GET' }, 'user-subscriptions-root-GET');
        break;
      case 'POST':
        apiRes = await fetchWithJwtRetry(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }, 'user-subscriptions-root-POST');
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
}