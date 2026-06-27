import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for donation transactions
 * GET /api/proxy/donation-transactions/{id} - Get donation transaction
 * POST /api/proxy/donation-transactions - Create donation transaction
 * PATCH /api/proxy/donation-transactions/{id} - Update donation transaction
 *
 * Backend endpoints:
 * - GET /api/donation-transactions/{id}
 * - POST /api/donation-transactions
 * - PATCH /api/donation-transactions/{id}
 */
export default createProxyHandler({
  backendPath: '/api/donation-transactions',
  allowedMethods: ['GET', 'POST', 'PATCH', 'PUT'],
  injectTenantId: true,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for PATCH requests with merge-patch+json
  },
};
