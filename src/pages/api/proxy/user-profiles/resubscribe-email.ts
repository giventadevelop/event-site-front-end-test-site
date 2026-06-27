import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/user-profiles/resubscribe-email',
  allowedMethods: ['GET'],
  injectTenantId: false,
});