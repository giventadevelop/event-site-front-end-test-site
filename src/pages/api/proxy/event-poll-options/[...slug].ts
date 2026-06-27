import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

const API_BASE_URL = getApiBaseUrl();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    const { method, query, body } = req;
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    if (!allowedMethods.includes(method!)) {
      res.setHeader('Allow', allowedMethods);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
    }

    const tenantId = getTenantId();
    const slug = query.slug;

    // Build the backend path
    let path = '/api/event-poll-options';
    if (slug) {
      if (Array.isArray(slug)) {
        path += '/' + slug.map(encodeURIComponent).join('/');
      } else if (typeof slug === 'string') {
        path += '/' + encodeURIComponent(slug);
      }
    }

    // Remove slug from query before building query string
    const { slug: _omit, ...restQuery } = query;
    const qs = new URLSearchParams(restQuery as Record<string, string>);

    // Only append tenantId.equals for GET/POST list endpoints, not for PATCH/PUT/DELETE by ID
    const isListEndpoint = (method === 'GET' || method === 'POST') && !/\/\d+(\/|$)/.test(path);
    if (isListEndpoint && !Array.from(qs.keys()).includes('tenantId.equals')) {
      qs.append('tenantId.equals', tenantId);
    }

    const queryString = qs.toString();
    const apiUrl = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    console.log('[EventPollOptions Proxy] Forwarding to backend URL:', apiUrl);

    // Handle PATCH requests with proper body parsing
    let bodyToSend: any = undefined;
    let contentType = 'application/json';
    
    if (method === 'PATCH') {
      // Read the raw body as text, parse, and re-stringify
      const rawBody = (await getRawBody(req)).toString('utf-8');
      let json: any;
      try {
        json = JSON.parse(rawBody);
      } catch (e) {
        console.error('[EventPollOptions Proxy] Failed to parse PATCH body:', e);
        json = {};
      }
      bodyToSend = JSON.stringify(json);
      contentType = req.headers['content-type'] || 'application/merge-patch+json';
    } else if (method !== 'GET' && method !== 'DELETE') {
      bodyToSend = JSON.stringify(body);
    }

    // Make the request
    const apiRes = await fetchWithJwtRetry(apiUrl, {
      method,
      headers: { 'Content-Type': contentType },
      ...(bodyToSend ? { body: bodyToSend } : {}),
    });

    // Forward x-total-count header for GET requests
    if (method === 'GET') {
      const totalCount = apiRes.headers.get('x-total-count');
      if (totalCount) {
        res.setHeader('x-total-count', totalCount);
      }
      const data = await apiRes.json();
      res.status(apiRes.status).json(data);
      return;
    }

    const data = await apiRes.text();
    res.status(apiRes.status).send(data);

  } catch (err) {
    console.error('[EventPollOptions Proxy ERROR]', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
  console.log('[fetchWithJwtRetry] Called with URL:', apiUrl);
  let token = await getCachedApiJwt();
  console.log('[fetchWithJwtRetry] Using JWT:', token);
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('[fetchWithJwtRetry] Response status:', response.status);
  if (response.status === 401) {
    token = await generateApiJwt();
    console.log('[fetchWithJwtRetry] Retrying with new JWT:', token);
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[fetchWithJwtRetry] Response status (after retry):', response.status);
  }
  return response;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

