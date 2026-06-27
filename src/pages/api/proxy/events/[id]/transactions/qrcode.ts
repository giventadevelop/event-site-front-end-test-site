import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getEmailHostUrlPrefix, getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[QR Code Proxy] Request received:', {
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  if (!API_BASE_URL) {
    res.status(500).json({ error: 'API base URL not configured' });
    return;
  }
  const { id, transactionId } = req.query;
  if (!id || !transactionId) {
    res.status(400).json({ error: 'Missing eventId or transactionId' });
    return;
  }

  // Get emailHostUrlPrefix from request headers or use default
  const emailHostUrlPrefix = req.headers['x-email-host-url-prefix'] as string ||
                           getEmailHostUrlPrefix();

  const apiUrl = `${API_BASE_URL}/api/events/${id}/transactions/${transactionId}/emailHostUrlPrefix/${encodeURIComponent(emailHostUrlPrefix)}/qrcode`;

  console.log('[QR Code Proxy] Backend URL:', apiUrl);

  try {
    const response = await fetchWithJwtRetry(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    }, 'event-transaction-qrcode');
    const data = await response.text();
    console.log('[QR Code Proxy] Backend response status:', response.status);
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Error in event transaction QR code proxy:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
}