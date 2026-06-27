import { createProxyHandler } from '@/lib/proxyHandler';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[BULK PROXY] method:', req.method, 'url:', req.url, 'body is array:', Array.isArray(req.body), 'typeof body:', typeof req.body, 'body:', req.body);
  const proxy = createProxyHandler({ backendPath: '/api/user-profiles/bulk', allowedMethods: ['POST'] });
  return proxy(req, res);
}