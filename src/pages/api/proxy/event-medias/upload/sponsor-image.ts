import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart form data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    // Forward all query params to the generic upload endpoint
    // This proxy is kept for backward compatibility but now forwards to /api/event-medias/upload
    const params = new URLSearchParams();
    for (const key in req.query) {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (typeof value !== 'undefined') {
        params.append(key, value);
      }
    }

    // Use the generic upload endpoint (same as executive team members)
    const apiUrl = `${API_BASE_URL}/api/event-medias/upload?${params.toString()}`;

    // Use node-fetch for proper multipart form handling
    const fetch = (await import('node-fetch')).default;

    // Get JWT token
    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    // Copy headers from request
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
    }

    // Forward the request to the backend
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: req, // Forward the raw request stream
      duplex: 'half', // Required for streaming body in Node.js fetch
    });

    // Check response status and handle accordingly
    if (apiRes.status >= 200 && apiRes.status < 300) {
      // Success - pipe the response
      res.status(apiRes.status);

      // Copy response headers
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }

      apiRes.body.pipe(res);
    } else {
      // Error - return structured error response
      // Drain the error response to prevent processing
      try {
        if (apiRes.body && typeof apiRes.body.destroy === 'function') {
          apiRes.body.destroy();
        } else if (apiRes.body && typeof apiRes.body.cancel === 'function') {
          apiRes.body.cancel();
        }
      } catch (drainError) {
        console.warn('Warning: Could not drain error response body:', drainError);
      }

      res.status(apiRes.status >= 400 ? apiRes.status : 500);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: 'Sponsor image upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}`,
        success: false
      });
    }
  } catch (err) {
    console.error('Sponsor image upload proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

