import { createProxyHandler } from '@/lib/proxyHandler';
export default createProxyHandler({ backendPath: '/api/event-ticket-transaction-items/bulk' });