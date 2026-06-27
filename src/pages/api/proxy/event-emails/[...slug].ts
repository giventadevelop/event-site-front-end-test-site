import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/event-emails' });

export const config = {
  api: {
    bodyParser: false,
  },
};
