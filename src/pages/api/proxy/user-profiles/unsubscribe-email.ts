import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/user-profiles/unsubscribe-email',
  allowedMethods: ['GET'],
  injectTenantId: false,
});