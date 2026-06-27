import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/event-competition-group-members' });

export const config = {
  api: {
    bodyParser: false,
  },
};
