import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedApiJwt, generateApiJwt } from "@/lib/api/jwt";
import { getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

/**
 * Proxy handler for event media uploads
 *
 * 🎯 CRITICAL: This handler checks HTTP status codes before processing responses.
 * - 2xx status codes (200-299) = Success → Pipe response body
 * - Any other status code = Failure → Return simple error JSON (NO piping)
 *
 * This prevents issues with null responses or malformed JSON from backend errors.
 * The backend may return a 500 error with a null EventMediaDTO result, but we avoid
 * piping it to prevent getId() calls on null objects.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: "API base URL not configured" });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    // Forward all query params
    const params = new URLSearchParams();
    for (const key in req.query) {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (typeof value !== 'undefined') {
        params.append(key, value);
      }
    }

    let apiUrl = `${API_BASE_URL}/api/event-medias/upload`;
    const qs = params.toString();
    if (qs) apiUrl += `?${qs}`;

    const fetch = (await import("node-fetch")).default;
    const headers = { ...req.headers, authorization: `Bearer ${token}` };
    delete headers["host"];
    delete headers["connection"];

    // Sanitize headers
    const sanitizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (Array.isArray(value)) sanitizedHeaders[key] = value.join("; ");
      else if (typeof value === "string") sanitizedHeaders[key] = value;
    }

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: sanitizedHeaders,
      body: req,
      duplex: 'half', // Required for streaming body in Node.js fetch
    });

          // 🎯 CRITICAL: Check HTTP status code before processing response
      // This prevents issues with null responses or malformed JSON from backend errors
      // IMPORTANT: For error responses, DO NOT pipe the body to avoid getId() calls on null EventMediaDTO objects

    if (apiRes.status >= 200 && apiRes.status < 300) {
      // ✅ Success: Pipe the response body back to client
      console.log('✅ Proxy: Backend upload successful - HTTP status:', apiRes.status);
      res.status(apiRes.status);

      // Copy headers from backend response
      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }

      apiRes.body.pipe(res);
    } else {
      // ❌ Failure: DO NOT pipe error response body to avoid null pointer exceptions
      console.error('❌ Proxy: Backend upload failed - HTTP status:', apiRes.status);

      // CRITICAL: Consume and discard the error response body to prevent any processing
      // This ensures no getId() calls are made on potentially null objects
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

      // For error responses, return only a simple structured error message
      // DO NOT pipe or process the response body as it may contain null objects
      res.status(apiRes.status >= 400 ? apiRes.status : 500);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: 'Upload failed',
        status: apiRes.status,
        message: `Upload operation failed with HTTP status ${apiRes.status}`,
        // DO NOT include backend error details to prevent null object processing
        success: false
      });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
