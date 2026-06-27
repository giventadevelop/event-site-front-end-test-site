import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for manual payment requests
 * Supports GET, PATCH, DELETE operations on individual payment requests
 * Backend endpoint: /api/manual-payments
 */
export default createProxyHandler({
  backendPath: '/api/manual-payments',
});
