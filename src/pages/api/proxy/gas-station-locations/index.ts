import { createProxyHandler } from '@/lib/proxyHandler';

export default createProxyHandler({ backendPath: '/api/gas-station-locations' });
