import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { withTenantId } from '@/lib/withTenantId';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_BASE_URL = getApiBaseUrl();
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    const { method, query } = req;
    const tenantId = getTenantId();

    // Build query string with proper pagination parameters
    const qs = new URLSearchParams();

    // Add all query parameters from the request
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => qs.append(key, String(v)));
        } else {
          qs.append(key, String(value));
        }
      }
    });

    // Add tenantId.equals for list endpoints (GET)
    if (method === 'GET' && !qs.has('tenantId.equals')) {
      qs.append('tenantId.equals', tenantId);
    }

    const queryString = qs.toString();
    const apiUrl = `${API_BASE_URL}/api/event-sponsors${queryString ? `?${queryString}` : ''}`;

    console.log('[EventSponsorsProxy] Forwarding to backend URL:', apiUrl);

    if (!['GET', 'POST'].includes(method!)) {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
    }

    // Handle different methods
    let response;
    if (method === 'GET') {
      response = await fetchWithJwtRetry(apiUrl, { method: 'GET' });
    } else if (method === 'POST') {
      // Read the raw body since bodyParser is disabled
      const rawBody = await getRawBody(req);
      let requestData;

      try {
        requestData = JSON.parse(rawBody.toString('utf-8'));
        console.log('[EventSponsorsProxy] Parsed request data:', JSON.stringify(requestData, null, 2));
      } catch (parseError) {
        console.error('[EventSponsorsProxy] Failed to parse request body:', parseError);
        res.status(400).json({ error: 'Invalid JSON in request body' });
        return;
      }

      // Apply tenantId injection
      const payload = withTenantId(requestData);
      console.log('[EventSponsorsProxy] Final payload with tenantId:', JSON.stringify(payload, null, 2));

      response = await fetchWithJwtRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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
    console.error('EventSponsorsProxy index error:', err);
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
