import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/gallery-categories',
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
