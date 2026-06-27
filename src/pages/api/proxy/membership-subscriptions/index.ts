import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/membership-subscriptions',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});



