import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for Stripe Instant Checkout (ACP) session creation
 * POST /api/proxy/payments/providers/stripe/instant-checkout
 *
 * Creates a Stripe Instant Checkout session if tenant enabled.
 * Backend endpoint: /api/payments/providers/stripe/instant-checkout
 */
export default createProxyHandler({
  backendPath: '/api/payments/providers/stripe/instant-checkout',
  allowedMethods: ['POST'],
  injectTenantId: true,
});









