import { createProxyHandler } from '@/lib/proxyHandler';

// This handler proxies requests to the backend QR code scan API for ticket transactions
export default createProxyHandler({
  backendPath: '/api/qrcode-scan/tickets/events',
});