import { createProxyHandler } from '@/lib/proxyHandler';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createProxyHandler({
  backendPath: '/api/profile-media-assets',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
