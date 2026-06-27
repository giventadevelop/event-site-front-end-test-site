import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for manual payment requests list
 * Supports GET (list) and POST (create) operations
 * Backend endpoint: /api/manual-payments
 */
export default createProxyHandler({
  backendPath: '/api/manual-payments',
});
