import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for creating donation transaction from GiveButter data
 * POST /api/proxy/donations/create-from-givebutter
 *
 * Backend endpoint: /api/donations/create-from-givebutter
 */
export default createProxyHandler({
  backendPath: '/api/donations/create-from-givebutter',
  allowedMethods: ['POST'],
  injectTenantId: true,
});
