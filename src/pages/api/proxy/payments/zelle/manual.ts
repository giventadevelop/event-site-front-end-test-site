import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for Zelle manual payment creation
 * POST /api/proxy/payments/zelle/manual
 *
 * Creates a pending transaction for Zelle instructions.
 * Backend endpoint: /api/payments/zelle/manual
 */
export default createProxyHandler({
  backendPath: '/api/payments/zelle/manual',
  allowedMethods: ['POST'],
  injectTenantId: true,
});









