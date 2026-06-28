import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createLogger } from "@/lib/logger";
import { getClerkSatelliteHost, getPrimaryHost, isClerkSatelliteEnv, usesPrimaryClerkSignInUrl } from "@/lib/clerkSatellite";

const logger = createLogger('MIDDLEWARE');
const DEBUG_MIDDLEWARE = process.env.NEXT_PUBLIC_DEBUG_MIDDLEWARE === 'true';
const debugLog = (...args: unknown[]) => { if (DEBUG_MIDDLEWARE) console.log(...args); };

/**
 * Clerk v7 / Core 3 Middleware
 *
 * CRITICAL: Clerk 7 requires the default export to be the return value of clerkMiddleware()
 * so it can detect usage and allow auth() in layout.tsx. Do not wrap in a custom function.
 *
 * - Public routes: do not call auth.protect(), return NextResponse.next() with x-pathname.
 * - Protected routes: call auth.protect(), then return NextResponse.next() with x-pathname.
 * - x-pathname on request headers so layout can read it via headers() (Next.js 15+).
 * - frontendApiProxy handles FAPI proxying with proper headers (Clerk-Proxy-Url,
 *   Clerk-Secret-Key, X-Forwarded-For). Replaces old manual Next.js rewrite.
 *
 * See: .cursor/rules/clerk_auth_admin_user_lookup.mdc
 */

// Satellite config (disabled for localhost)
// Clerk v7: proxyUrl removed — frontendApiProxy in clerkMiddleware handles FAPI proxying.
const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                    process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1') ||
                    !process.env.NEXT_PUBLIC_APP_URL;
const isSatEnv = !isLocalhost && (
  isClerkSatelliteEnv() ||
  process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
);
const satDomain = getClerkSatelliteHost() || (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'www.mosc-temp.com' : undefined);
const satConfig: Record<string, unknown> = {};
if (isSatEnv && !isLocalhost) {
  if (satDomain) {
    Object.assign(satConfig, { isSatellite: true, domain: satDomain });
  }
}

// Clerk v6: public routes – do not call auth.protect() for these
const isPublicRouteClerk = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/proxy(.*)',
  '/api/liturgy(.*)',
  '/api/event/success(.*)',
  '/api/membership/success(.*)',
  '/api/events/donation/success(.*)',
  '/membership/success(.*)',
  '/membership/qr(.*)',
  '/api/diagnostic(.*)',
  '/api/logs(.*)',
  '/mosc-old(.*)',
  '/mosc(.*)',
  /** Rocket redesign + Syro mirror — distinct path segment from `/mosc`, must be listed explicitly */
  '/mosc-redesign(.*)',
  '/events(.*)',
  '/sponsors(.*)',
  '/team(.*)',
  '/gallery(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/polls(.*)',
  '/charity-theme(.*)',
  '/calendar(.*)',
  '/focus-groups(.*)',
  '/pricing(.*)',
  // Membership hub + sub-pages: call auth() in server components but do not auth.protect() here.
  // Matches /pricing — avoids satellite RSC prefetch CORS when signInUrl points at primary domain.
  // /membership/manage and /membership/subscribe redirect to same-origin /sign-in in page code.
  '/membership(.*)',
]);

// Clerk 6: default export MUST be clerkMiddleware() so auth() is detected in layout
export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    const needsCompetitionAuth = /^\/events\/[^/]+\/competitions\/(register|my-registrations)(\/|$)/.test(
      pathname
    );
    if (needsCompetitionAuth) {
      await auth.protect();
    }

    const isApiRoute = pathname.startsWith('/api/');
    const isApiProxy = pathname.startsWith('/api/proxy');
    const isDiagnostic = pathname.startsWith('/api/diagnostic');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Protect only non-public routes (v6: opt-in protection)
    if (!isPublicRouteClerk(req)) {
      await auth.protect();
    }

    // PERFORMANCE: Only resolve auth() for non-public routes.
    // auth() makes a network call to Clerk API (~300-800ms on Lambda cold start).
    // Public routes (/, /mosc-old, /mosc, /events, etc.) don't need auth state in middleware,
    // so skipping this call saves significant latency on the critical render path.
    let resolvedAuth: { userId?: string | null; sessionId?: string | null } | null = null;
    if (!isPublicRouteClerk(req)) {
      resolvedAuth = await auth();
    }
    debugLog('[MIDDLEWARE] afterAuth called for:', pathname);
    debugLog('[MIDDLEWARE] Auth state:', { userId: resolvedAuth?.userId ?? null, sessionId: resolvedAuth?.sessionId ?? null });

    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';
    const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    if (isApiRoute) {
      logger.info('API REQUEST DETECTED', {
        pathname,
        method: req.method,
        isMobile,
        isProxy: isApiProxy,
        isDiagnostic,
        userAgent: userAgent.substring(0, 150),
        timestamp: new Date().toISOString(),
      });
      debugLog('[MIDDLEWARE] ===== API REQUEST DETECTED =====');
      debugLog('[MIDDLEWARE] Pathname:', pathname);
      debugLog('[MIDDLEWARE] Method:', req.method);
      debugLog('[MIDDLEWARE] Is Mobile:', isMobile);
      debugLog('[MIDDLEWARE] Is Proxy:', isApiProxy);
      debugLog('[MIDDLEWARE] Is Diagnostic:', isDiagnostic);
      debugLog('[MIDDLEWARE] User-Agent:', userAgent.substring(0, 150));
      debugLog('[MIDDLEWARE] Timestamp:', new Date().toISOString());
      debugLog('[MIDDLEWARE] ===== END API REQUEST LOG =====');
    }

    // Next.js 15+: pass x-pathname so layout can read it via headers()
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);

    // Signal layout to skip heavy auth/profile work during Clerk satellite sync.
    // On the first load with ?__clerk_synced=true, the session cookie is being
    // established for SUBSEQUENT requests — auth() on the current request would
    // either hang or return null, causing unnecessary server delay.
    if (req.nextUrl.searchParams.has('__clerk_synced')) {
      requestHeaders.set('x-clerk-syncing', 'true');
      debugLog('[MIDDLEWARE] Clerk satellite sync detected (__clerk_synced=true), setting x-clerk-syncing header');
    }

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('x-pathname', pathname);
    return response;
  },
  {
    ...satConfig,
    // NOTE: frontendApiProxy intentionally NOT enabled. Enabling it routes Clerk's
    // satellite handshake through /__clerk/* on this domain, which requires the
    // proxy URL to be registered against the Clerk instance in the Dashboard.
    // That registration validation fails (host_invalid) — the chicken-and-egg
    // documented in the original comment — so the proxied handshake never works.
    // Instead, rely on Clerk's URL-handshake flow: clerk.redirectToSignIn() in the
    // satellite's sign-in page sends the browser to the primary, which signs the
    // user in and redirects back with __clerk_handshake=<token> in the URL. The
    // satellite SDK reads that token and establishes a first-party session cookie
    // — no proxy or Dashboard registration required.
    signInUrl: usesPrimaryClerkSignInUrl()
      ? `https://${getPrimaryHost()}/sign-in`
      : '/sign-in',
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals, static files, AND /__clerk.
    // __clerk is excluded because frontendApiProxy is not enabled — we don't want
    // Clerk middleware to intercept /__clerk/* on this domain. The satellite uses
    // the URL-handshake flow (browser redirects with __clerk_handshake token),
    // not the proxy flow.
    // Include video/audio (mp4, webm, …) — otherwise Clerk runs on /images/.../*.mp4 and auth.protect() returns 404 HTML instead of the file.
    '/((?!_next|__clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v|ogg|mp3|wav|aac|opus|pdf|map)).*)',
    '/(api|trpc)(.*)',
  ],
};
