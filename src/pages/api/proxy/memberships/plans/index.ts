import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for membership plans
 * GET /api/proxy/memberships/plans - List membership plans
 * POST /api/proxy/memberships/plans - Create membership plan
 *
 * Backend endpoint: /api/memberships/plans
 */
export default createProxyHandler({
  backendPath: '/api/memberships/plans',
  allowedMethods: ['GET', 'POST'],
  injectTenantId: true,
});









