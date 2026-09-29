import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Proxies multipart focus-group cover upload to Spring:
 * POST /api/event-medias/upload/focus-group-cover-image
 *
 * Buffers the body + uses native fetch — streaming `req` through node-fetch
 * causes "Premature close" on this route.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_BASE_URL = getApiBaseUrl();
    if (!API_BASE_URL) {
      res.status(500).json({ error: 'API base URL not configured' });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { focusGroupId, title, description, isPublic, tenantId } = req.query;

    const focusGroupIdValue = Array.isArray(focusGroupId) ? focusGroupId[0] : focusGroupId;
    if (focusGroupIdValue === undefined || focusGroupIdValue === null || focusGroupIdValue === '') {
      return res.status(400).json({ error: 'Missing required parameter: focusGroupId' });
    }

    const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId || getTenantId();
    if (!tenantIdValue) {
      return res.status(400).json({ error: 'Missing required parameter: tenantId' });
    }

    const titleValue = Array.isArray(title) ? title[0] : title || 'Focus Group Cover Image';
    const descriptionValue = Array.isArray(description)
      ? description[0] || 'Cover image for focus group'
      : description || 'Cover image for focus group';
    const isPublicValue = Array.isArray(isPublic) ? isPublic[0] : isPublic;
    const isPublicBoolean = String(isPublicValue) === 'true';

    const queryParams = new URLSearchParams({
      focusGroupId: focusGroupIdValue,
      tenantId: tenantIdValue,
      title: titleValue,
      description: descriptionValue,
      isPublic: isPublicBoolean.toString(),
    });

    const apiUrlWithParams = `${API_BASE_URL}/api/event-medias/upload/focus-group-cover-image?${queryParams.toString()}`;

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const rawBody = await getRawBody(req);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantIdValue,
      'content-length': String(rawBody.length),
    };

    if (req.headers['content-type']) {
      headers['content-type'] = Array.isArray(req.headers['content-type'])
        ? req.headers['content-type'][0]
        : req.headers['content-type'];
    }

    console.log('[focus-group-cover-image] Uploading', {
      focusGroupId: focusGroupIdValue,
      tenantId: tenantIdValue,
      bytes: rawBody.length,
    });

    const apiRes = await fetch(apiUrlWithParams, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      const text = await apiRes.text();
      res.status(apiRes.status);
      res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');
      res.send(text);
      return;
    }

    let backendDetail = '';
    try {
      backendDetail = await apiRes.text();
    } catch {
      /* ignore */
    }

    console.error('[focus-group-cover-image] Backend upload failed', {
      status: apiRes.status,
      detail: backendDetail.slice(0, 1000),
    });

    res.status(apiRes.status >= 400 ? apiRes.status : 500).json({
      error: backendDetail || 'Failed to upload focus group cover image',
      status: apiRes.status,
      details: backendDetail || undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[focus-group-cover-image] Proxy error:', error);
    res.status(500).json({ error: 'Failed to upload focus group cover image', details: message });
  }
}
