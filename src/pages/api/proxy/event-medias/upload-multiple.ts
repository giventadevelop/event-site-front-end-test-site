import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: "API base URL not configured" });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    // Get JWT token
    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    // Construct the backend API URL
    const apiUrl = `${API_BASE_URL}/api/event-medias/upload-multiple`;

    // Use node-fetch for proper multipart form handling
    const fetch = (await import("node-fetch")).default;

    const tenantId = getTenantId();

    // Buffer multipart body (more reliable on Amplify/Lambda than streaming IncomingMessage)
    const rawBody = await getRawBody(req);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
      'content-length': String(rawBody.length),
    };

    if (req.headers['content-type']) {
      headers['content-type'] = Array.isArray(req.headers['content-type'])
        ? req.headers['content-type'][0]
        : req.headers['content-type'];
    }

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    // Check response status and handle accordingly
    if (apiRes.status >= 200 && apiRes.status < 300) {
      // Success - pipe the response
      console.log('✅ Proxy: Backend upload successful - HTTP status:', apiRes.status);
      res.status(apiRes.status);

      // Copy response headers
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }

      apiRes.body.pipe(res);
    } else {
      console.error('❌ Proxy: Backend upload failed - HTTP status:', apiRes.status);

      let backendDetail = '';
      try {
        backendDetail = await apiRes.text();
      } catch {
        /* ignore */
      }

      res.status(apiRes.status >= 400 ? apiRes.status : 500);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: 'Upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}`,
        details: backendDetail || undefined,
        success: false,
      });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}