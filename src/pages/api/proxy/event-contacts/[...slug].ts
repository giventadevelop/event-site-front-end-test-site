import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/event-contacts' });

export const config = {
  api: {
    bodyParser: false,
  },
};
