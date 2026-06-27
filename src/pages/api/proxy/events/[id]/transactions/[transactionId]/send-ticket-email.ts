import { createProxyHandler } from '@/lib/proxyHandler';
import { getEmailHostUrlPrefix } from '@/lib/env';

// Custom handler for send-ticket-email that includes emailHostUrlPrefix
// Uses Base64 encoding like the working QR code endpoint
export default async function handler(req: any, res: any) {
  const { id, transactionId } = req.query;

  // Get emailHostUrlPrefix from request headers or use default
  const emailHostUrlPrefix = req.headers['x-email-host-url-prefix'] as string ||
                           getEmailHostUrlPrefix();

  // Validate that we have a valid email host URL prefix
  if (!emailHostUrlPrefix) {
    console.error('[Send Ticket Email Proxy] No emailHostUrlPrefix available');
    return res.status(400).json({
      error: 'Email host URL prefix is required for proper email context',
      details: 'Please ensure NEXT_PUBLIC_APP_URL is set in environment variables or pass x-email-host-url-prefix header'
    });
  }

  // Use Base64 encoding like the working QR code endpoint
  const encodedEmailHostUrlPrefix = Buffer.from(emailHostUrlPrefix).toString('base64');

  // Create a custom backend path that includes the Base64-encoded emailHostUrlPrefix
  const customBackendPath = `/api/events/${id}/transactions/${transactionId}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/send-ticket-email`;

  console.log('[Send Ticket Email Proxy] Using Base64 encoding like QR code:', {
    eventId: id,
    transactionId: transactionId,
    emailHostUrlPrefix: emailHostUrlPrefix,
    encodedBase64: encodedEmailHostUrlPrefix,
    backendPath: customBackendPath
  });

  // Use the shared proxy handler with the custom backend path
  const proxyHandler = createProxyHandler({
    backendPath: customBackendPath,
    allowedMethods: ['POST', 'GET'],  // Allow both POST and GET like QR code
    injectTenantId: false  // Don't inject tenant ID as it's not needed for this endpoint
  });

  return proxyHandler(req, res);
}