import { createProxyHandler } from '@/lib/proxyHandler';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createProxyHandler({
  backendPath: '/api/membership-plans',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});


