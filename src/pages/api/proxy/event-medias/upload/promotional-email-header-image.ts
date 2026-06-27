import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    // Get JWT token
    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const tenantId = getTenantId();
    const url = `${API_BASE_URL}/api/event-medias/upload/promotional-email-header-image`;

    // Use node-fetch for proper multipart form handling
    const fetch = (await import('node-fetch')).default;

    // Copy headers from request
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
    };
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
    }

    // Forward the request to the backend
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: req, // Forward the raw request stream
      duplex: 'half', // Required for streaming body in Node.js fetch
    });

    // Check response status and handle accordingly
    if (apiRes.status >= 200 && apiRes.status < 300) {
      // Success - pipe the response
      const data = await apiRes.text();
      res.status(apiRes.status).send(data);
    } else if (apiRes.status === 401) {
      // Retry with new token
      token = await generateApiJwt();
      headers.Authorization = `Bearer ${token}`;
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: req,
        duplex: 'half',
      });
      const data = await retryRes.text();
      res.status(retryRes.status).send(data);
    } else {
      // Error - forward error response
      const errorText = await apiRes.text();
      res.status(apiRes.status).json({ error: errorText });
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

