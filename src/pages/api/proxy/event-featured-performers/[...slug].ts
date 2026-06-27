import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/event-featured-performers' });

export const config = {
  api: {
    bodyParser: false,
  },
};
