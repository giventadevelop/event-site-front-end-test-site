import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

const API_BASE_URL = getApiBaseUrl();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Template ID is required' });
      return;
    }

    const url = `${API_BASE_URL}/api/promotion-email-templates/${id}/send-bulk`;
    const response = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    }, `promotion-email-templates-${id}-send-bulk`);

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}







