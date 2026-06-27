import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

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

    const { albumId, title, description, isPublic, tenantId } = req.query;

    const albumIdValue = Array.isArray(albumId) ? albumId[0] : albumId;
    if (albumIdValue === undefined || albumIdValue === null || albumIdValue === '') {
      return res.status(400).json({ error: 'Missing required parameter: albumId' });
    }

    const tenantIdValue = Array.isArray(tenantId) ? tenantId[0] : tenantId || getTenantId();
    if (!tenantIdValue) {
      return res.status(400).json({ error: 'Missing required parameter: tenantId' });
    }

    const titleValue = Array.isArray(title) ? title[0] : title || 'Gallery Album Cover Image';
    const descriptionValue = Array.isArray(description)
      ? description[0] || 'Cover image for gallery album'
      : description || 'Cover image for gallery album';
    const isPublicValue = Array.isArray(isPublic) ? isPublic[0] : isPublic;
    const isPublicBoolean = String(isPublicValue) === 'true';

    const apiUrl = `${API_BASE_URL}/api/event-medias/upload/gallery-album-cover-image`;

    const queryParams = new URLSearchParams({
      albumId: albumIdValue,
      tenantId: tenantIdValue,
      title: titleValue,
      description: descriptionValue,
      isPublic: isPublicBoolean.toString(),
    });

    const apiUrlWithParams = `${apiUrl}?${queryParams.toString()}`;

    const fetch = (await import('node-fetch')).default;

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantIdValue,
    };

    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
    }

    const apiRes = await fetch(apiUrlWithParams, {
      method: 'POST',
      headers,
      body: req,
      duplex: 'half',
    });

    if (apiRes.status >= 200 && apiRes.status < 300) {
      res.status(apiRes.status);

      for (const [key, value] of Object.entries(apiRes.headers.raw())) {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      }

      const data = await apiRes.json();
      res.json(data);
    } else {
      const errorText = await apiRes.text();
      res.status(apiRes.status).json({ error: errorText });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Gallery album cover image upload error:', error);
    res.status(500).json({ error: 'Failed to upload gallery album cover image', details: message });
  }
}
