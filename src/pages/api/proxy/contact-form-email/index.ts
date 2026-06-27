import { createProxyHandler } from '@/lib/proxyHandler';

// Proxy handler for MOSC public contact form email endpoint.
// This forwards requests to the backend `/api/contact-form-email/send` endpoint
// and automatically injects `tenantId` into the request body.
export default createProxyHandler({
  // NOTE: The actual backend path includes `/send`
  // Full URL (in dev): http://localhost:8080/api/contact-form-email/send
  backendPath: '/api/contact-form-email/send',
  allowedMethods: ['POST'],
  injectTenantId: true,
});


