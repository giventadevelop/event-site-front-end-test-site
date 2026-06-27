import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for payment operations by transaction ID
 * GET /api/proxy/payments/{transactionId} - Fetch payment status
 * POST /api/proxy/payments/{transactionId}/refund - Issue refund
 *
 * Backend endpoints:
 * - GET /api/payments/{transactionId}
 * - POST /api/payments/{transactionId}/refund
 */
export default createProxyHandler({
  backendPath: '/api/payments',
  allowedMethods: ['GET', 'POST', 'PATCH'],
  injectTenantId: true,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for PATCH requests with merge-patch+json
  },
};









