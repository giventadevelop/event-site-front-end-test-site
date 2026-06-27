import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for membership subscriptions
 * GET /api/proxy/memberships/subscriptions - List subscriptions
 * POST /api/proxy/memberships/subscriptions - Create subscription
 *
 * Backend endpoint: /api/memberships/subscriptions
 */
export default createProxyHandler({
  backendPath: '/api/memberships/subscriptions',
  allowedMethods: ['GET', 'POST'],
  injectTenantId: true,
});









