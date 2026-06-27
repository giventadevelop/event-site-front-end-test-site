import { createProxyHandler } from '@/lib/proxyHandler';
import { getEmailHostUrlPrefix } from '@/lib/env';

/**
 * Proxy handler for donation confirmation email
 * POST /api/proxy/events/{id}/donations/{transactionId}/send-email?to={email}
 *
 * Backend endpoint: /api/events/{id}/donations/{transactionId}/send-email
 * Uses Base64 encoding for emailHostUrlPrefix like ticket email endpoint
 */
export default async function handler(req: any, res: any) {
  const { id, transactionId, to } = req.query;

  // Get emailHostUrlPrefix from request headers or use default
  const emailHostUrlPrefix = req.headers['x-email-host-url-prefix'] as string ||
                           getEmailHostUrlPrefix();

  // Validate that we have a valid email host URL prefix
  if (!emailHostUrlPrefix) {
    console.error('[Donation Send Email Proxy] No emailHostUrlPrefix available');
    return res.status(400).json({
      error: 'Email host URL prefix is required for proper email context',
      details: 'Please ensure NEXT_PUBLIC_APP_URL is set in environment variables or pass x-email-host-url-prefix header'
    });
  }

  // Use Base64 encoding like the working email endpoint
  const encodedEmailHostUrlPrefix = Buffer.from(emailHostUrlPrefix).toString('base64');

  // Create a custom backend path that includes the Base64-encoded emailHostUrlPrefix
  const customBackendPath = `/api/events/${id}/donations/${transactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/send-email`;

  // Add 'to' query parameter if provided
  const queryParams = new URLSearchParams();
  if (to) {
    queryParams.append('to', to as string);
  }
  const queryString = queryParams.toString();

  console.log('[Donation Send Email Proxy] Using Base64 encoding:', {
    eventId: id,
    transactionId: transactionId,
    email: to,
    emailHostUrlPrefix: emailHostUrlPrefix,
    encodedBase64: encodedEmailHostUrlPrefix,
    backendPath: customBackendPath
  });

  // Use the shared proxy handler with the custom backend path
  const proxyHandler = createProxyHandler({
    backendPath: customBackendPath + (queryString ? `?${queryString}` : ''),
    allowedMethods: ['POST', 'GET'],
    injectTenantId: false
  });

  return proxyHandler(req, res);
}
