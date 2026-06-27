import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({
  backendPath: '/api/event-medias/event-sponsor',
  allowedMethods: ['GET'],
});

