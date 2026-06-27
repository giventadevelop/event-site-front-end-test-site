import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for GiveButter donation API calls
 * GET /api/proxy/givebutter/donations/{donationId}/status - Check donation status
 * GET /api/proxy/givebutter/donations/{donationId} - Get donation details
 *
 * Backend endpoints:
 * - GET /api/givebutter/donations/{donationId}/status
 * - GET /api/givebutter/donations/{donationId}
 */
export default createProxyHandler({
  backendPath: '/api/givebutter/donations',
  allowedMethods: ['GET'],
  injectTenantId: true,
});
