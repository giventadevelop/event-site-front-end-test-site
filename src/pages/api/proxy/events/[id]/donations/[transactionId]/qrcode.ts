import { createProxyHandler } from '@/lib/proxyHandler';
import { getEmailHostUrlPrefix } from '@/lib/env';

/**
 * Proxy handler for donation QR code generation
 * POST /api/proxy/events/{id}/donations/{transactionId}/qrcode
 *
 * Backend endpoint: /api/events/{id}/donations/{transactionId}/qrcode
 * Uses Base64 encoding for emailHostUrlPrefix like ticket QR code endpoint
 */
export default async function handler(req: any, res: any) {
  const { id, transactionId } = req.query;

  // Get emailHostUrlPrefix from request headers or use default
  const emailHostUrlPrefix = req.headers['x-email-host-url-prefix'] as string ||
                           getEmailHostUrlPrefix();

  // Validate that we have a valid email host URL prefix
  if (!emailHostUrlPrefix) {
    console.error('[Donation QR Code Proxy] No emailHostUrlPrefix available');
    return res.status(400).json({
      error: 'Email host URL prefix is required for proper QR code context',
      details: 'Please ensure NEXT_PUBLIC_APP_URL is set in environment variables or pass x-email-host-url-prefix header'
    });
  }

  // Use Base64 encoding like the working QR code endpoint
  const encodedEmailHostUrlPrefix = Buffer.from(emailHostUrlPrefix).toString('base64');

  // Create a custom backend path that includes the Base64-encoded emailHostUrlPrefix
  const customBackendPath = `/api/events/${id}/donations/${transactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/qrcode`;

  console.log('[Donation QR Code Proxy] Using Base64 encoding:', {
    eventId: id,
    transactionId: transactionId,
    emailHostUrlPrefix: emailHostUrlPrefix,
    encodedBase64: encodedEmailHostUrlPrefix,
    backendPath: customBackendPath
  });

  // Use the shared proxy handler with the custom backend path
  const proxyHandler = createProxyHandler({
    backendPath: customBackendPath,
    allowedMethods: ['POST', 'GET'],
    injectTenantId: false
  });

  return proxyHandler(req, res);
}
