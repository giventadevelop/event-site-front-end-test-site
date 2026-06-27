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

/**
 * Get the app URL for port-agnostic configuration
 * This is used for server-side API calls to ensure the application works on any port
 * Returns the full URL including protocol (e.g., "http://localhost:3000" or "https://mcefee.org")
 *
 * IMPORTANT: This function should NOT have hardcoded fallbacks. The actual host should be
 * determined from the request context or environment variables to avoid hardcoding issues.
 *
 * CRITICAL: In AWS Amplify production, environment variables are prefixed with AMPLIFY_
 * This function prioritizes AMPLIFY_NEXT_PUBLIC_APP_URL for production compatibility.
 */
export function getAppUrl(): string {
  // Prioritize AMPLIFY_ prefix for AWS Amplify production (matches next.config.mjs pattern)
  const appUrl =
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  // In production, use the actual domain from environment variable
  if (process.env.NODE_ENV === 'production') {
    if (!appUrl) {
      console.error('[getAppUrl] CRITICAL: NEXT_PUBLIC_APP_URL not set in production. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
    }
    return appUrl || '';
  }
  // In development, use localhost with dynamic port detection
  return appUrl || 'http://localhost:3000';
}

/**
 * Base URL of this Next.js app for server-side fetches to same-origin routes (e.g. `/api/proxy/*`).
 * Uses the incoming request host/port when available so dev servers on non-default ports work.
 * Falls back to {@link getAppUrl} when `headers()` is not available.
 */
export async function getAppUrlFromRequestHeaders(): Promise<string> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (host) {
      const forwardedProto = headersList.get('x-forwarded-proto')?.split(',')[0]?.trim();
      const proto =
        forwardedProto ||
        (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  } catch {
    // headers() unavailable outside a request (e.g. static generation)
  }
  return getAppUrl();
}

/**
 * Get the email host URL prefix for QR code generation
 * This is used to ensure QR codes work properly in email contexts
 * Returns the full URL including protocol (e.g., "http://localhost:3000" or "https://mcefee.org")
 *
 * IMPORTANT: This function should NOT have hardcoded fallbacks. The actual host should be
 * determined from the request context or environment variables to avoid hardcoding issues.
 *
 * CRITICAL: In AWS Amplify production, environment variables are prefixed with AMPLIFY_
 * This function prioritizes AMPLIFY_NEXT_PUBLIC_APP_URL for production compatibility.
 */
export function getEmailHostUrlPrefix(): string {
  // Prioritize AMPLIFY_ prefix for AWS Amplify production (matches next.config.mjs pattern)
  const appUrl =
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  // In production, use the actual domain from environment variable
  if (process.env.NODE_ENV === 'production') {
    if (!appUrl) {
      console.error('[getEmailHostUrlPrefix] CRITICAL: NEXT_PUBLIC_APP_URL not set in production. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
    }
    return appUrl || '';
  }
  // In development, use localhost with dynamic port detection
  return appUrl || 'http://localhost:3000';
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