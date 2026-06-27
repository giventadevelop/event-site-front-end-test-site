import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart form data
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

    const { eventId, title, description, isPublic, tenantId } = req.query;

    // Validate required parameters
    const eventIdValue = Array.isArray(eventId) ? eventId[0] : eventId;
    if (eventIdValue === undefined || eventIdValue === null || eventIdValue === '') {
      return res.status(400).json({ error: 'Missing required parameter: eventId' });
    }

    // Get tenantId from query or environment
    const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId || getTenantId();
    if (!tenantIdValue) {
      return res.status(400).json({ error: 'Missing required parameter: tenantId' });
    }

    // Get optional parameters with defaults
    const titleValue = Array.isArray(title) ? title[0] : title || 'Email Header Image';
    const descriptionValue = Array.isArray(description) ? description[0] || 'Email header image for ticket confirmation emails' : description || 'Email header image for ticket confirmation emails';
    const isPublicValue = Array.isArray(isPublic) ? isPublic[0] : isPublic;
    const isPublicBoolean = String(isPublicValue) === 'true';

    // Build backend API URL
    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/email-header-image`;

    // Build query string
    const queryParams = new URLSearchParams({
      eventId: eventIdValue,
      tenantId: tenantIdValue,
      title: titleValue,
      description: descriptionValue,
      isPublic: isPublicBoolean.toString(),
    });

    const apiUrlWithParams = `${apiUrl}?${queryParams.toString()}`;

    console.log('📧 Email Header Image Upload Proxy Debug:');
    console.log('📋 Values:', {
      eventId: eventIdValue,
      tenantId: tenantIdValue,
      title: titleValue,
      description: descriptionValue,
      isPublic: isPublicBoolean,
    });
    console.log('🔗 Backend URL with params:', apiUrlWithParams);

    // Use node-fetch for proper multipart form handling
    const fetch = (await import("node-fetch")).default;

    // Get JWT token
    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    // Copy headers from request, but sanitize them
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

    // Forward the request to the backend
    const apiRes = await fetch(apiUrlWithParams, {
      method: 'POST',
      headers: headers,
      body: req, // Forward the raw request stream
      duplex: 'half', // Required for streaming body in Node.js fetch
    });

    console.log('🔧 Backend response status:', apiRes.status);
    console.log('🔧 Backend response headers:', Object.fromEntries(apiRes.headers.entries()));

    // Check response status and handle accordingly
    if (apiRes.status >= 200 && apiRes.status < 300) {
      // Success - parse JSON response
      console.log('✅ Email Header Image Upload Proxy: Backend upload successful - HTTP status:', apiRes.status);
      res.status(apiRes.status);

      // Copy response headers
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }

      const data = await apiRes.json();
      console.log('📧 Email Header Image Upload success:', {
        id: data.id,
        fileUrl: data.fileUrl,
        eventId: data.eventId,
      });

      res.json(data);
    } else {
      // Error - forward error response
      console.error('❌ Email Header Image Upload Proxy: Backend upload failed - HTTP status:', apiRes.status);
      const errorText = await apiRes.text();
      console.error('📧 Email Header Image Upload failed:', errorText);
      res.status(apiRes.status).json({ error: errorText });
    }
  } catch (error: any) {
    console.error('Email header image upload error:', error);
    res.status(500).json({ error: 'Failed to upload email header image', details: error.message });
  }
}

