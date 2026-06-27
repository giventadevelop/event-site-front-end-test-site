import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for Zeffy donation initialization
 * POST /api/proxy/payments/zeffy/initialize
 *
 * Returns Zeffy campaign info/embedded URL for zero-fee fundraisers.
 * Backend endpoint: /api/payments/zeffy/initialize
 */
export default createProxyHandler({
  backendPath: '/api/payments/zeffy/initialize',
  allowedMethods: ['POST'],
  injectTenantId: true,
});









