import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart form data
  },
};

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

    const { eventId, sponsorId, tenantId, isPublic, title, description, startDisplayingFromDate } = req.query;

    if (!eventId || !sponsorId || !tenantId) {
      return res.status(400).json({
        error: 'Missing required parameters: eventId, sponsorId, tenantId'
      });
    }

    // Extract values from query parameters
    const eventIdValue = Array.isArray(eventId) ? eventId[0] : String(eventId);
    const sponsorIdValue = Array.isArray(sponsorId) ? sponsorId[0] : String(sponsorId);
    const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : String(tenantId);
    const isPublicValue = Array.isArray(isPublic) ? isPublic[0] : isPublic;
    const isPublicBoolean = String(isPublicValue) === 'true';
    const titleValue = Array.isArray(title) ? title[0] : title;
    const descriptionValue = Array.isArray(description) ? description[0] : description;
    const startDisplayingFromDateValue = Array.isArray(startDisplayingFromDate) ? startDisplayingFromDate[0] : startDisplayingFromDate;

    // Build query string
    const params = new URLSearchParams();
    params.append('eventId', eventIdValue);
    params.append('sponsorId', sponsorIdValue);
    params.append('tenantId', tenantIdValue);
    params.append('isPublic', isPublicBoolean.toString());
    if (titleValue) {
      params.append('title', titleValue);
    }
    if (descriptionValue) {
      params.append('description', descriptionValue);
    }
    if (startDisplayingFromDateValue) {
      params.append('startDisplayingFromDate', startDisplayingFromDateValue);
    }

    // Backend endpoint: /api/event-medias/upload/event-sponsor-poster
    // NOTE: This endpoint must be implemented on the backend with the following requirements:
    // 1. Accept multipart/form-data with file upload
    // 2. Create EventMedia record with eventId, sponsorId, and eventSponsorsJoinId
    // 3. Update event_sponsors_join.custom_poster_url field
    // 4. Use S3 path format: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/event-sponsor-poster?${params.toString()}`;

    console.log('🔍 Event-Sponsor Poster Upload Proxy Debug:');
    console.log('📋 Values:', {
      eventId: eventIdValue,
      sponsorId: sponsorIdValue,
      tenantId: tenantIdValue,
      isPublic: isPublicBoolean,
      title: titleValue,
      description: descriptionValue,
      startDisplayingFromDate: startDisplayingFromDateValue
    });
    console.log('🔗 Backend URL:', apiUrl);

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
      console.log('🔧 Content-Type from request:', req.headers['content-type']);
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
      console.log('🔧 Content-Length from request:', req.headers['content-length']);
    }

    console.log('🔧 Final headers being sent to backend:', headers);

    // Forward the request to the backend
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: req, // Forward the raw request stream
      duplex: 'half', // Required for streaming body in Node.js fetch
    });

    console.log('🔧 Backend response status:', apiRes.status);
    console.log('🔧 Backend response headers:', Object.fromEntries(apiRes.headers.entries()));

    // Check response status and handle accordingly
    if (apiRes.status >= 200 && apiRes.status < 300) {
      // Success - pipe the response
      console.log('✅ Event-Sponsor Poster Upload Proxy: Backend upload successful - HTTP status:', apiRes.status);
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
      console.error('❌ Event-Sponsor Poster Upload Proxy: Backend upload failed - HTTP status:', apiRes.status);

      // Try to read error response body for better error messages
      let errorBody = '';
      try {
        const errorText = await apiRes.text();
        errorBody = errorText;
        console.error('❌ Backend error response:', errorBody);
      } catch (readError) {
        console.warn('Warning: Could not read error response body:', readError);
      }

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
        error: 'Event-sponsor poster upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}${errorBody ? `: ${errorBody}` : ''}`,
        success: false,
        backendError: errorBody || undefined
      });
    }
  } catch (err) {
    console.error('Event-sponsor poster upload proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}

