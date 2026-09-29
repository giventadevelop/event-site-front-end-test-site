/**
 * Lazily loads API JWT user from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 */
export function getApiJwtUser() {
  return (
    process.env.AMPLIFY_API_JWT_USER ||
    process.env.API_JWT_USER ||
    process.env.NEXT_PUBLIC_API_JWT_USER
  );
}

/**
 * Lazily loads API JWT password from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 */
export function getApiJwtPass() {
  return (
    process.env.AMPLIFY_API_JWT_PASS ||
    process.env.API_JWT_PASS ||
    process.env.NEXT_PUBLIC_API_JWT_PASS
  );
}

/**
 * Lazily loads tenant ID from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 * Throws an error if not set.
 */
export function getTenantId() {
  const tenantId =
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_TENANT_ID or NEXT_PUBLIC_TENANT_ID');
  }
  return tenantId;
}

/**
 * Client-safe tenant ID for use in browser (cache keys, data attributes, etc.).
 * Returns empty string if not set; does not throw. Prefer getTenantId() server-side.
 */
export function getClientTenantId(): string {
  return (
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID ||
    ''
  );
}

/**
 * Lazily loads Payment Method Domain ID from environment variables, prioritizing AMPLIFY_ prefix for AWS Amplify.
 * Throws an error if not set.
 * This is used to identify the Stripe Payment Method Domain (pmd_*) associated with this tenant.
 */
export function getPaymentMethodDomainId() {
  const paymentMethodDomainId =
    process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ||
    process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID;
  if (!paymentMethodDomainId) {
    throw new Error('NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID');
  }
  return paymentMethodDomainId;
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  );
}

function hostnameFromHostHeader(host: string): string {
  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    return end > 0 ? host.slice(1, end) : host;
  }
  return host.split(':')[0] || host;
}

function parsePortFromProcessArgs(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '-p' || arg === '--port') && argv[i + 1] && /^\d+$/.test(argv[i + 1])) {
      return argv[i + 1];
    }
    const matched = arg.match(/^--port=(\d+)$/);
    if (matched) return matched[1];
  }
  return undefined;
}

function configuredPublicAppUrl(): string | undefined {
  return process.env.AMPLIFY_NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;
}

/**
 * Port this Next.js process is listening on.
 * Never read from NEXT_PUBLIC_APP_URL — that value is a stale snapshot (e.g. 3002)
 * while `npm run dev:clean -- -p 3003` binds a different port.
 */
export function getDevListenPort(): string {
  if (process.env.PORT && /^\d+$/.test(process.env.PORT)) {
    return process.env.PORT;
  }
  const argvPort = parsePortFromProcessArgs(process.argv);
  if (argvPort) return argvPort;
  if (process.env.npm_config_port && /^\d+$/.test(process.env.npm_config_port)) {
    return process.env.npm_config_port;
  }
  return '3000';
}

/** Build `http(s)://host[:port]` from a request Host header. */
export function originFromRequestHost(host: string, forwardedProto?: string | null): string {
  const hostname = hostnameFromHostHeader(host);
  const proto =
    forwardedProto?.split(',')[0]?.trim() ||
    (isLoopbackHostname(hostname) || hostname.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function getLocalDevAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  const nextPrivateOrigin = process.env['__NEXT_PRIVATE_ORIGIN'];
  if (nextPrivateOrigin) {
    return nextPrivateOrigin.replace(/\/$/, '');
  }
  return `http://localhost:${getDevListenPort()}`;
}

/**
 * Origin of this Next.js app.
 *
 * Local development never uses the port from NEXT_PUBLIC_APP_URL (it is ignored
 * when the host is localhost / 127.0.0.1). Resolution order:
 * 1. Browser tab origin (`window.location.origin`)
 * 2. Live listen port (`PORT`, `next dev -p`, or `__NEXT_PRIVATE_ORIGIN`)
 * Production still uses AMPLIFY_NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_APP_URL (real domain).
 *
 * Prefer {@link getAppUrlFromRequestHeaders} in server request context — that
 * follows the Host header (correct even when Next auto-picks 3001 because 3000 is busy).
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  const configured = configuredPublicAppUrl();

  if (process.env.NODE_ENV === 'production') {
    if (!configured) {
      console.error('[getAppUrl] CRITICAL: NEXT_PUBLIC_APP_URL not set in production. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
    }
    return configured?.replace(/\/$/, '') || '';
  }

  if (!configured) {
    return getLocalDevAppOrigin();
  }
  try {
    const parsed = new URL(configured);
    if (isLoopbackHostname(parsed.hostname)) {
      return getLocalDevAppOrigin();
    }
    return configured.replace(/\/$/, '');
  } catch {
    return getLocalDevAppOrigin();
  }
}

/**
 * Same-origin base for server fetches to this Next app (`/api/proxy/*`, emails, Clerk).
 * Uses the incoming request host/port so `next dev -p 3003` works regardless of .env.
 * Falls back to {@link getAppUrl} when `headers()` is not available.
 */
export async function getAppUrlFromRequestHeaders(): Promise<string> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (host) {
      return originFromRequestHost(host, headersList.get('x-forwarded-proto'));
    }
  } catch {
    // headers() unavailable outside a request (e.g. static generation)
  }
  return getAppUrl();
}

/**
 * Email / QR host prefix. Same resolution as {@link getAppUrl} so local ports stay live.
 */
export function getEmailHostUrlPrefix(): string {
  return getAppUrl();
}

/**
 * Get Clerk Backend API URL
 * Returns the Clerk API endpoint for backend authentication
 */
export function getClerkBackendUrl(): string {
  const raw = process.env.CLERK_BACKEND_API_URL || 'https://api.clerk.com';
  // Safety: only allow Clerk host and normalize to origin without path
  try {
    const u = new URL(raw);
    if (!/clerk\.com$/i.test(u.hostname)) return 'https://api.clerk.com';
    // Always force api.clerk.com origin, strip any path (/v1 etc.)
    return 'https://api.clerk.com';
  } catch {
    return 'https://api.clerk.com';
  }
}

/**
 * Get Clerk Secret Key for backend API authentication
 * Throws an error if not set as this is required for backend Clerk integration
 */
export function getClerkSecretKey(): string {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY is not set in environment variables');
  }
  return secretKey;
}

/**
 * Get Clerk Publishable Key for frontend (if needed for hybrid approach)
 */
export function getClerkPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

/**
 * Get Auth JWT Secret for signing access/refresh tokens
 * Prioritize Amplify prefixed vars in production
 */
export function getAuthJwtSecret(): string {
  const secret =
    process.env.AMPLIFY_JWT_SECRET ||
    process.env.JWT_SECRET ||
    process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not set. Configure AMPLIFY_JWT_SECRET or JWT_SECRET');
  }
  return secret;
}

/**
 * Get the API base URL, prioritizing AMPLIFY_ prefix for AWS Amplify production.
 * This should be used everywhere instead of reading process.env.NEXT_PUBLIC_API_BASE_URL directly.
 */
export function getApiBaseUrl(): string {
  const url =
    process.env.AMPLIFY_NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    console.error('[getApiBaseUrl] CRITICAL: API base URL not set. Check AMPLIFY_NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.');
  }
  return url || '';
}

/**
 * Get Backend API Base URL for OAuth and API calls
 * Returns the backend server URL (e.g., "http://localhost:8080" or "https://api.yourdomain.com")
 */
export function getBackendApiUrl(): string {
  return getApiBaseUrl() || 'http://localhost:8080';
}

/**
 * Get feature flag for Stripe Checkout migration
 * Returns true if we should use Stripe Checkout Sessions instead of Payment Intents
 * Defaults to false (use Payment Intent flow) for backward compatibility
 * Set NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true to enable Checkout Session flow
 */
export function useStripeCheckout(): boolean {
  return process.env.NEXT_PUBLIC_USE_STRIPE_CHECKOUT === 'true';
}