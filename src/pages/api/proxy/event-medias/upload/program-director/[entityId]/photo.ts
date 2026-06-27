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
      res.status(500).json({ error: "API base URL not configured" });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { entityId } = req.query;
    const { eventId, title, description, isPublic, tenantId } = req.query;

    if (!entityId || !eventId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate entityId
    const entityIdStr = Array.isArray(entityId) ? entityId[0] : entityId;
    const entityIdInt = parseInt(entityIdStr);
    if (isNaN(entityIdInt)) {
      return res.status(400).json({ error: 'Invalid entityId: must be a valid integer' });
    }

    // Get values from query parameters
    const eventIdValue = Array.isArray(eventId) ? eventId[0] : eventId;
    const titleValue = Array.isArray(title) ? title[0] || 'photo' : title || 'photo';
    const descriptionValue = Array.isArray(description) ? description[0] || 'Uploaded photo' : description || 'Uploaded photo';
    const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId || process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_demo_001';
    const isPublicValue = Array.isArray(isPublic) ? isPublic[0] : isPublic;
    const isPublicBoolean = String(isPublicValue) === 'true';

    // Use the new Swagger API specification endpoint - entityId is now a query parameter
    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/program-director`;

    // Build query string according to new Swagger specification
    const queryParams = new URLSearchParams({
      eventId: eventIdValue,
      entityId: String(entityIdInt),
      title: titleValue,
      description: descriptionValue || 'Uploaded photo',
      tenantId: tenantIdValue,
      isPublic: isPublicBoolean.toString()
    });

    const apiUrlWithParams = `${apiUrl}?${queryParams.toString()}`;

    console.log('🔍 Program Director Photo Upload Proxy Debug:');
    console.log('📋 Values:', { entityId: entityIdInt, eventId: eventIdValue, title: titleValue, description: descriptionValue, isPublic: isPublicBoolean });
    console.log('🔗 Backend URL with params:', apiUrlWithParams);

    // Use node-fetch for proper multipart form handling like the working upload-multiple endpoint
    const fetch = (await import("node-fetch")).default;

    // Get JWT token
    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    // Copy headers from request, but sanitize them (same pattern as upload-multiple)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Only copy content-type and content-length if they exist
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
      console.log('🔧 Content-Type from request:', req.headers['content-type']);
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
      console.log('🔧 Content-Length from request:', req.headers['content-length']);
    }

    console.log('🔧 Final headers being sent to backend:', headers);
    console.log('🔧 Final URL being called:', apiUrlWithParams);

    // Forward the request to the backend using exact same pattern as upload-multiple
    const apiRes = await fetch(apiUrlWithParams, {
      method: 'POST',
      headers: headers,
      body: req, // Forward the raw request stream like upload-multiple does
      duplex: 'half', // Required for streaming body in Node.js fetch
    });

    console.log('🔧 Backend response status:', apiRes.status);
    console.log('🔧 Backend response headers:', Object.fromEntries(apiRes.headers.entries()));

    // Check response status and handle accordingly
    if (apiRes.status >= 200 && apiRes.status < 300) {
      // Success - pipe the response like upload-multiple does
      console.log('✅ Program Director Photo Upload Proxy: Backend upload successful - HTTP status:', apiRes.status);
      res.status(apiRes.status);

      // Copy response headers (same as upload-multiple)
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }

      apiRes.body.pipe(res);
    } else {
      // Error - return structured error response (same as upload-multiple)
      console.error('❌ Program Director Photo Upload Proxy: Backend upload failed - HTTP status:', apiRes.status);

      // Drain the error response to prevent processing (same as upload-multiple)
      try {
        // For node-fetch, we need to consume the body differently
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
        error: 'Program director photo upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}`,
        success: false
      });
    }
  } catch (err) {
    console.error('Program director photo upload proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
