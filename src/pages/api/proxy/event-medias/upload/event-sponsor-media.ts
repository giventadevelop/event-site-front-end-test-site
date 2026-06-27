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

    const { eventId, sponsorId, tenantId, isPublic, title, description, priorityRanking, startDisplayingFromDate } = req.query;

    if (!eventId || !sponsorId || !tenantId) {
      return res.status(400).json({
        error: 'Missing required parameters: eventId, sponsorId, tenantId'
      });
    }

    // Build query string
    const params = new URLSearchParams();
    params.append('eventId', Array.isArray(eventId) ? eventId[0] : String(eventId));
    params.append('sponsorId', Array.isArray(sponsorId) ? sponsorId[0] : String(sponsorId));
    params.append('tenantId', Array.isArray(tenantId) ? tenantId[0] : String(tenantId));
    if (isPublic) {
      params.append('isPublic', Array.isArray(isPublic) ? isPublic[0] : String(isPublic));
    }
    if (title) {
      params.append('title', Array.isArray(title) ? title[0] : String(title));
    }
    if (description) {
      params.append('description', Array.isArray(description) ? description[0] : String(description));
    }
    if (priorityRanking) {
      params.append('priorityRanking', Array.isArray(priorityRanking) ? priorityRanking[0] : String(priorityRanking));
    }
    if (startDisplayingFromDate) {
      params.append('startDisplayingFromDate', Array.isArray(startDisplayingFromDate) ? startDisplayingFromDate[0] : String(startDisplayingFromDate));
    }

    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/event-sponsor-media?${params.toString()}`;

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
        error: 'Event-sponsor media upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}`,
        success: false
      });
    }
  } catch (err) {
    console.error('Event-sponsor media upload proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

