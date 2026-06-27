import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/event-medias/sponsor',
  allowedMethods: ['GET'],
});

