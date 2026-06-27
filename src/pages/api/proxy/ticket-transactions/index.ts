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
  const queryString = buildQueryString(query);
  const apiUrl = `${API_BASE_URL}/api/ticket-transactions${queryString}`;

  let apiRes;
  switch (method) {
    case 'GET':
      apiRes = await fetchWithJwtRetry(apiUrl, { method: 'GET' }, 'ticket-transactions-GET');
      break;
    case 'POST':
      apiRes = await fetchWithJwtRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 'ticket-transactions-POST');
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
      return;
  }
  const data = await apiRes.text();
  res.status(apiRes.status).send(data);
}