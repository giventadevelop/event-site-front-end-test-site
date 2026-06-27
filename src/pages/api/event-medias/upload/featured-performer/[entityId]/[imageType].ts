import { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

const API_BASE_URL = getApiBaseUrl();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { entityId, imageType } = req.query;
    const { eventId, title, description, isPublic } = req.query;

    if (!entityId || !imageType || !eventId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const tenantId = getTenantId();
    const url = `${API_BASE_URL}/api/event-medias/upload/featured-performer/${entityId}/${imageType}?eventId=${eventId}&title=${title || imageType}&description=${description || 'Uploaded image'}&tenantId=${tenantId}&isPublic=${isPublic || 'true'}`;

    // Forward the multipart form data to the backend
    const response = await fetchWithJwtRetry(url, {
      method: 'POST',
      body: req,
      duplex: 'half', // Required for Node.js 18+ when sending a body
      headers: {
        'Content-Type': req.headers['content-type'] || 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Featured performer image upload error:', error);
    res.status(500).json({ error: 'Failed to upload featured performer image' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart form data
  },
};
