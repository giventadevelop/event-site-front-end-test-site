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

    const { eventId, title, description, isPublic, tenantId } = req.query;

    const eventIdValue = Array.isArray(eventId) ? eventId[0] : eventId;
    if (eventIdValue === undefined || eventIdValue === null || eventIdValue === '') {
      return res.status(400).json({ error: 'Missing required parameter: eventId' });
    }

    const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId || getTenantId();
    if (!tenantIdValue) {
      return res.status(400).json({ error: 'Missing required parameter: tenantId' });
    }

    const titleValue = Array.isArray(title) ? title[0] : title || 'Email Header Image';
    const descriptionValue = Array.isArray(description)
      ? description[0] || 'Email header image for ticket confirmation emails'
      : description || 'Email header image for ticket confirmation emails';
    const isPublicValue = Array.isArray(isPublic) ? isPublic[0] : isPublic;
    const isPublicBoolean = String(isPublicValue) === 'true';

    const queryParams = new URLSearchParams({
      eventId: eventIdValue,
      tenantId: tenantIdValue,
      title: titleValue,
      description: descriptionValue,
      isPublic: isPublicBoolean.toString(),
    });

    const apiUrlWithParams = `${API_BASE_URL}/api/event-medias/upload/email-header-image?${queryParams.toString()}`;

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

    const apiRes = await fetch(apiUrlWithParams, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      const data = await apiRes.text();
      res.status(apiRes.status).send(data);
      return;
    }

    if (apiRes.status === 401) {
      token = await generateApiJwt();
      headers.Authorization = `Bearer ${token}`;
      const retryRes = await fetch(apiUrlWithParams, {
        method: 'POST',
        headers,
        body: rawBody,
      });
      const data = await retryRes.text();
      res.status(retryRes.status).send(data);
      return;
    }

    const errorText = await apiRes.text();
    res.status(apiRes.status).json({ error: errorText });
  } catch (error: unknown) {
    console.error('Email header image upload error:', error);
    res.status(500).json({
      error: 'Failed to upload email header image',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
