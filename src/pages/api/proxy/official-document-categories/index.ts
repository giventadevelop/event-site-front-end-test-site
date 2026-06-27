import { createProxyHandler } from '@/lib/proxyHandler';

/**
 * List/create categories: GET/POST /api/official-document-categories
 * (Catch-all [...slug].ts handles /:id paths only.)
 */
export default createProxyHandler({
  backendPath: '/api/official-document-categories',
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
