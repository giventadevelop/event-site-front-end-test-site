import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { withTenantId } from '@/lib/withTenantId';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_BASE_URL = getApiBaseUrl();
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    const { method, query } = req;
    const tenantId = getTenantId();

    // Build the backend path
    let path = '/api/event-sponsors';
    const slug = query.slug;
    if (slug) {
      if (Array.isArray(slug)) {
        path += '/' + slug.map(encodeURIComponent).join('/');
      } else if (typeof slug === 'string') {
        path += '/' + encodeURIComponent(slug);
      }
    }

    // Build query string with proper pagination parameters
    const { slug: _omit, ...restQuery } = query;
    const qs = new URLSearchParams();

    // Add all query parameters from the request
    Object.entries(restQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => qs.append(key, String(v)));
        } else {
          qs.append(key, String(value));
        }
      }
    });

    // Add tenantId.equals for list endpoints (GET without specific ID)
    const isListEndpoint = method === 'GET' && !slug;
    if (isListEndpoint && !qs.has('tenantId.equals')) {
      qs.append('tenantId.equals', tenantId);
    }

    const queryString = qs.toString();
    const apiUrl = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    console.log('[EventSponsorsProxy] Forwarding to backend URL:', apiUrl);

    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method!)) {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
    }

    // Handle different methods
    let response;
    if (method === 'GET') {
      response = await fetchWithJwtRetry(apiUrl, { method: 'GET' });
    } else if (method === 'POST') {
      const payload = withTenantId(req.body);
      response = await fetchWithJwtRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else if (method === 'PUT') {
      const payload = withTenantId(req.body);
      response = await fetchWithJwtRetry(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else if (method === 'PATCH') {
      const payload = withTenantId(req.body);
      response = await fetchWithJwtRetry(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(payload),
      });
    } else if (method === 'DELETE') {
      response = await fetchWithJwtRetry(apiUrl, { method: 'DELETE' });
    }

    // Forward x-total-count header for GET requests
    if (method === 'GET') {
      const totalCount = response.headers.get('x-total-count');
      if (totalCount) {
        res.setHeader('x-total-count', totalCount);
      }
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (err) {
    console.error('EventSponsorsProxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

async function fetchWithJwtRetry(apiUrl: string, options: any = {}) {
  let token = await getCachedApiJwt();
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    token = await generateApiJwt();
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return response;
}

export const config = {
  api: {
    bodyParser: false,
  },
};
