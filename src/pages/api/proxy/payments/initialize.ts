import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for payment initialization endpoint
 * POST /api/proxy/payments/initialize
 *
 * Creates a payment session and returns provider-neutral session details.
 * Backend endpoint: /api/payments/initialize
 */
export default createProxyHandler({
  backendPath: '/api/payments/initialize',
  allowedMethods: ['POST'],
  injectTenantId: true,
});









