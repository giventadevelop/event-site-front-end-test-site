import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

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
  if (!API_BASE_URL) {
    res.status(500).json({ error: 'API base URL not configured' });
    return;
  }

  const token = await getCachedApiJwt();
  const { method, query, body } = req;
  const queryString = buildQueryString(query);

  const apiUrl = `${API_BASE_URL}/api/events${queryString}`;
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
}