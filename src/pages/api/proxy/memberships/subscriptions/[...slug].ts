import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for membership subscription operations by ID
 * GET /api/proxy/memberships/subscriptions/{id} - Get subscription
 * PATCH /api/proxy/memberships/subscriptions/{id} - Update subscription (e.g., cancel)
 * DELETE /api/proxy/memberships/subscriptions/{id} - Delete subscription
 *
 * Backend endpoint: /api/memberships/subscriptions
 */
export default createProxyHandler({
  backendPath: '/api/memberships/subscriptions',
  allowedMethods: ['GET', 'PATCH', 'DELETE'],
  injectTenantId: true,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for PATCH requests with merge-patch+json
  },
};









