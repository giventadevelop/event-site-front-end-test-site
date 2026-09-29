import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/event-agenda-items' });

export const config = {
  api: {
    bodyParser: false,
  },
};
