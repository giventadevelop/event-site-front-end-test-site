import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/user-profiles',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});