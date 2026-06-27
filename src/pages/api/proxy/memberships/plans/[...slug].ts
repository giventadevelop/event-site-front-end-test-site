import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for membership plan operations by ID
 * GET /api/proxy/memberships/plans/{id} - Get plan
 * PATCH /api/proxy/memberships/plans/{id} - Update plan
 * DELETE /api/proxy/memberships/plans/{id} - Delete plan
 *
 * Backend endpoint: /api/memberships/plans
 */
export default createProxyHandler({
  backendPath: '/api/memberships/plans',
  allowedMethods: ['GET', 'PATCH', 'DELETE'],
  injectTenantId: true,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for PATCH requests with merge-patch+json
  },
};









