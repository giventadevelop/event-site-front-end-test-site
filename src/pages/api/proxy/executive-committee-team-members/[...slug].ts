import { createProxyHandler } from '@/lib/proxyHandler';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createProxyHandler({
  backendPath: '/api/executive-committee-team-members',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
});


