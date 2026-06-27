import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/event-program-directors' });

export const config = {
  api: {
    bodyParser: false,
  },
};
