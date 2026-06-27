import { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { EventDTO } from '@/types';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
  console.log('[fetchWithJwtRetry] Called with:', { apiUrl, debugLabel });
  let token = await getCachedApiJwt();
  console.log('[fetchWithJwtRetry] Using JWT token:', token ? 'present' : 'missing');
  
  let response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  
  console.log('[fetchWithJwtRetry] Response status:', response.status);
  
  if (response.status === 401) {
    console.log('[fetchWithJwtRetry] 401 detected, regenerating token');
    token = await generateApiJwt();
    console.log('[fetchWithJwtRetry] New token:', token ? 'present' : 'missing');
    response = await fetch(apiUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[fetchWithJwtRetry] Retry response status:', response.status);
  }
  return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!API_BASE_URL) {
    console.error('[Events Proxy] API_BASE_URL not configured');
    res.status(500).json({ error: 'API base URL not configured' });
    return;
  }
  try {
    const { slug } = req.query;
    const path = Array.isArray(slug) ? slug.join('/') : slug;
    const apiUrl = `${API_BASE_URL}/api/events/${path}`;
    
    console.log('[Events Proxy] Processing request:', {
      method: req.method,
      path,
      apiUrl,
      hasApiBaseUrl: !!API_BASE_URL,
      isQrCodeRequest: path.includes('qrcode')
    });
    
    const response = await fetchWithJwtRetry(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    }, 'events-proxy');

    console.log('[Events Proxy] Backend response:', {
      status: response.status,
      ok: response.ok,
      isQrCodeRequest: path.includes('qrcode')
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('[Events Proxy] Error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}