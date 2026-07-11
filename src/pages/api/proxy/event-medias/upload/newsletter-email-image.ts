import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { getRawBody } from '@/lib/getRawBody';

const API_BASE_URL = getApiBaseUrl();

export const config = {
  api: {
    bodyParser: false,
  },
};

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Upload newsletter email images (header, body, footer) for NEWS_LETTER templates
 * without an event. Uses generic event-medias upload — promotional-email-* endpoints
 * only support EVENT_PROMOTION templates and return 400 for newsletters.
 */
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

    const tenantIdValue = firstQueryValue(req.query.tenantId) || getTenantId();
    const title = firstQueryValue(req.query.title) || 'Newsletter Email Image';
    const description =
      firstQueryValue(req.query.description) || 'Newsletter email image';
    const isPublicValue = firstQueryValue(req.query.isPublic);
    const isPublicBoolean = isPublicValue === undefined ? true : String(isPublicValue) === 'true';

    const queryParams = new URLSearchParams({
      tenantId: tenantIdValue,
      title,
      description,
      isPublic: String(isPublicBoolean),
    });

    const apiUrl = `${API_BASE_URL}/api/event-medias/upload?${queryParams.toString()}`;
    const rawBody = await getRawBody(req);

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

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

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (apiRes.status === 401) {
      token = await generateApiJwt();
      headers.Authorization = `Bearer ${token}`;
      const retryRes = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: rawBody,
      });
      const data = await retryRes.text();
      res.status(retryRes.status).send(data);
      return;
    }

    const data = await apiRes.text();
    res.status(apiRes.status).send(data);
  } catch (err) {
    console.error('[newsletter-email-image upload] error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
