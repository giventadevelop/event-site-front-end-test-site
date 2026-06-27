import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * Proxy handler for manual payment summary report
 * Supports GET operations on summary report data
 * Backend endpoint: /api/manual-payment-summary
 */
export default createProxyHandler({
  backendPath: '/api/manual-payment-summary',
});
