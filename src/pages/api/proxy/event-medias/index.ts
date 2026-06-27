import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedApiJwt } from "@/lib/api/jwt";
import { fetchWithJwtRetry } from "@/lib/proxyHandler";
import { getApiBaseUrl, getTenantId } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

function buildBackendUrl(method: string | undefined, query: NextApiRequest['query']): string {
  let apiUrl = `${API_BASE_URL}/api/event-medias`;
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) value.forEach(v => params.append(key, v));
    else if (typeof value !== 'undefined') params.append(key, value);
  }
  if (method === 'GET' && !params.has('tenantId.equals')) {
    try {
      params.append('tenantId.equals', getTenantId());
    } catch (e) {
      console.warn('Event media proxy: tenantId not set, list may be empty');
    }
  }
  const qs = params.toString();
  if (qs) apiUrl += `?${qs}`;
  return apiUrl;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!API_BASE_URL) {
    console.error("API base URL not configured");
    res.status(500).json({ error: "API base URL not configured" });
    return;
  }

  try {
    const token = await getCachedApiJwt();
    const { method, query } = req;
    const apiUrl = buildBackendUrl(method, query);

    console.log(`Event media proxy: ${method} ${apiUrl}`);

    if (method === "POST") {
      // Forward multipart/form-data (streaming body)
      const fetch = (await import("node-fetch")).default;
      const headers = { ...req.headers, authorization: `Bearer ${token}` };
      delete headers["host"];
      delete headers["connection"];
      const sanitizedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(headers)) {
        if (Array.isArray(value)) sanitizedHeaders[key] = value.join("; ");
        else if (typeof value === "string") sanitizedHeaders[key] = value;
      }
      try {
        sanitizedHeaders['X-Tenant-ID'] = getTenantId();
      } catch {
        /* tenant optional for some upload paths */
      }
      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers: sanitizedHeaders,
        body: req,
      });
      res.status(apiRes.status);
      apiRes.body.pipe(res);
      return;
    }

    if (method === "GET") {
      const apiRes = await fetchWithJwtRetry(apiUrl, { method: 'GET' }, 'event-medias-GET');

      console.log(`Event media proxy response: ${apiRes.status} ${apiRes.statusText}`);

      const totalHeader = apiRes.headers.get('x-total-count');
      if (totalHeader) res.setHeader('x-total-count', totalHeader);

      const text = await apiRes.text();

      if (!text || text.trim() === '') {
        if (!apiRes.ok) {
          res.status(apiRes.status).json({
            error: `Backend API error: ${apiRes.status} ${apiRes.statusText}`,
            details: 'Empty response from backend',
          });
          return;
        }
        res.status(apiRes.status).json([]);
        return;
      }

      if (!apiRes.ok) {
        console.error(`Event media proxy error: ${apiRes.status} ${apiRes.statusText}`);
        console.error(`Event media proxy error body: ${text}`);
        res.status(apiRes.status).json({
          error: `Backend API error: ${apiRes.status} ${apiRes.statusText}`,
          details: text,
        });
        return;
      }

      try {
        const data = JSON.parse(text);
        const count = Array.isArray(data) ? data.length : (data?.content?.length ?? 1);
        console.log(`Event media proxy success: JSON response with ${count} items${totalHeader ? `, x-total-count: ${totalHeader}` : ''}`);
        res.status(apiRes.status).json(data);
      } catch {
        console.log(`Event media proxy success: Text response with ${text.length} characters`);
        res.status(apiRes.status).send(text);
      }
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Event media proxy error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
