import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import TrpcProvider from "@/lib/trpc/Provider";
import Script from "next/script";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConditionalLayout from "../components/ConditionalLayout";
import ClerkSyncUrlCleanup from "../components/ClerkSyncUrlCleanup";
import ClerkSatelliteSyncGate from "../components/ClerkSatelliteSyncGate";
import MobileDebugConsole from "../components/MobileDebugConsole";
import TenantIdInjector from "../components/TenantIdInjector";
import { TenantSettingsProvider } from "../components/TenantSettingsProvider";
import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAppUrl, getTenantId, getApiBaseUrl } from "@/lib/env";
import { fetchWithJwtRetry } from "@/lib/proxyHandler";
import { isAdminRole } from "@/lib/utils";

const DEBUG_LAYOUT = process.env.NEXT_PUBLIC_DEBUG_LAYOUT === 'true';
const debugLog = (...args: unknown[]) => { if (DEBUG_LAYOUT) console.log(...args); };

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.AMPLIFY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

const inter = Inter({ subsets: ["latin"] });

// CRITICAL: Mark layout as dynamic to prevent Next.js 15+ from detecting headers() access during static analysis
// This allows headers() to be called without triggering the "headers() should be awaited" error
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  debugLog('[LAYOUT] Root layout executing');
  let isTenantAdmin = false;
  const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || process.env.AMPLIFY_NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';
  const satelliteDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || process.env.AMPLIFY_NEXT_PUBLIC_CLERK_DOMAIN || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AMPLIFY_NEXT_PUBLIC_APP_URL || '';
  let clerkProps: { isSatellite?: boolean; domain?: string; signInUrl?: string; signUpUrl?: string; allowedRedirectOrigins?: string[] } = appUrl ? { allowedRedirectOrigins: [appUrl] } : {};

  try {
  // CRITICAL: Next.js 15+ - await headers() first before any other async or header-dependent code (e.g. auth()).
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const pathname = headersList.get('x-pathname') || '';

  // Define public routes that don't require authentication checks
  // These routes can skip auth() calls to avoid Next.js 15+ headers() async errors
  const publicRoutePatterns = [
    /^\/$/,
    /^\/sign-in/,
    /^\/sign-up/,
    /^\/sso-callback/,
    /^\/api\/webhooks/,
    /^\/api\/public/,
    /^\/api\/proxy/,
    /^\/api\/event\/success/,
    /^\/api\/membership\/success/,
    /^\/membership\/success/,
    /^\/membership\/qr/,
    /^\/api\/diagnostic/,
    /^\/api\/logs/,
    /^\/mosc-old/,
    /^\/mosc(?!-old)/,  // /mosc, /mosc/..., /mosc-redesign/... (Syro + rocket redesign; not /mosc-old)
    /^\/events/,
    /^\/sponsors/,
    /^\/gallery/,
    /^\/about/,
    /^\/contact/,
    /^\/polls/,
    /^\/charity-theme/,
    /^\/calendar/,
    /^\/focus-groups/,
    /^\/pricing/,
    /^\/membership/,
  ];

  // Check if this is a public route
  // If pathname is empty (header not set) or headers() failed, default to treating as public route to avoid auth errors
  // This ensures TestSprite/Playwright tests can run on public pages without headers() errors
  const isPublicRoute = !pathname || publicRoutePatterns.some(pattern => pattern.test(pathname));

  // Detect if this is a satellite domain (check if hostname matches satellite domain or APP_URL)
  const isSatellite =
    process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' &&
    Boolean(satelliteDomain) &&
    hostname.includes(satelliteDomain.replace('www.', ''));

  // Satellite domains must redirect to primary domain for authentication
  // Clerk v7: proxyUrl removed — frontendApiProxy in clerkMiddleware handles it.
  // afterSignOutUrl moved from UserButton to provider level.
  clerkProps = isSatellite
    ? {
      isSatellite: true,
      domain: satelliteDomain,
      signInUrl: `https://${primaryDomain}/sign-in`,
      signUpUrl: `https://${primaryDomain}/sign-up`,
      afterSignOutUrl: '/',
    }
    : {
      allowedRedirectOrigins: appUrl ? [appUrl] : [],
      afterSignOutUrl: '/',
    };

  // Determine tenant-scoped admin flag on the server
  // Run auth + profile lookup on all routes that show the main Header (including /) so Admin menu appears for admins (per clerk_auth rule).
  // Only skip /mosc-old, /mosc, /mosc-redesign — ConditionalLayout does not render the main Header there.
  // CRITICAL: Also skip during Clerk satellite sync (?__clerk_synced=true). On the first
  // load after redirect from primary, the session cookie is being established for SUBSEQUENT
  // requests. Calling auth() now would either hang (blocking the entire server response for
  // seconds on Lambda cold start) or return null. Skip auth on this request so the server
  // responds fast; the client-side ClerkProvider will process the sync and establish the session.
  const skipAuthForRoute = pathname.startsWith('/mosc-old') || pathname.startsWith('/mosc');
  const isClerkSyncing = headersList.get('x-clerk-syncing') === 'true';
  if (isClerkSyncing) {
    debugLog('[Layout] ⏳ Skipping auth/profile work during Clerk satellite sync — session not yet established on this request');
  }
  if (pathname && !skipAuthForRoute && !isClerkSyncing) {
    try {
      // CRITICAL: Call auth() immediately after awaiting headers() to ensure proper async context
      // Do not call any other async functions before auth() completes
      let userId: string | null = null;
      let currentUserData: any = null;
      try {
        // Call auth() first - it internally uses headers() which we've already awaited
        const authResult = CLERK_KEY ? await auth() : null;
        userId = authResult?.userId || null;
        debugLog('[Layout] 🔍 Auth check result:', { userId, hasUserId: !!userId });

        // CRITICAL: Only call currentUser() after auth() completes successfully
        // This ensures headers() async context is properly maintained
        if (userId) {
          try {
            currentUserData = CLERK_KEY ? await currentUser() : null;
          } catch (currentUserError: any) {
            // Handle currentUser() errors gracefully - it also uses headers() internally
            if (currentUserError?.message?.includes('headers()') || currentUserError?.message?.includes('sync-dynamic-apis')) {
              console.warn('[Layout] currentUser() skipped due to Next.js 15+ headers() async requirement:', currentUserError.message);
              currentUserData = null;
            } else {
              throw currentUserError;
            }
          }
        }
      } catch (authError: any) {
        // Handle Next.js 15+ headers() await error gracefully
        if (authError?.message?.includes('headers()') || authError?.message?.includes('sync-dynamic-apis')) {
          console.warn('[Layout] Auth check skipped due to Next.js 15+ headers() async requirement:', authError.message);
          userId = null;
          currentUserData = null;
        } else {
          throw authError;
        }
      }

      if (userId) {
        const baseUrl = getAppUrl();
        const tenantId = getTenantId();
        debugLog('[Layout] 🔍 Fetching user profile:', { userId, tenantId, baseUrl });

        // Step 1: Check if userId + tenantId combination exists
        const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${encodeURIComponent(userId)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`;
        debugLog('[Layout] 🔍 Profile fetch URL:', url);
        const resp = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
        debugLog('[Layout] 🔍 Profile fetch response:', { status: resp.status, ok: resp.ok });

        if (resp.ok) {
          const arr = await resp.json();
          // Handle both raw array and paginated { content: [...] } responses
          let p;
          if (Array.isArray(arr)) {
            p = arr[0];
          } else if (arr?.content && Array.isArray(arr.content)) {
            p = arr.content[0];
          } else {
            p = arr;
          }

          if (!p) {
            // Step 2: Profile not found by userId + tenantId
            // Check if email + tenantId combination exists (different userId case)
            // CRITICAL: Use currentUserData from above instead of calling currentUser() again
            // This prevents multiple headers() calls in Next.js 15+
            try {
              const u = currentUserData; // Use already-fetched currentUser data
              const userEmail = u?.emailAddresses?.[0]?.emailAddress || '';

              if (userEmail) {
                // Check for existing profile with same email + tenantId but different userId
                const emailCheckUrl = `${baseUrl}/api/proxy/user-profiles?email.equals=${encodeURIComponent(userEmail)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`;
                const emailResp = await fetch(emailCheckUrl, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });

                if (emailResp.ok) {
                  const emailArr = await emailResp.json();
                  // Handle both raw array and paginated { content: [...] } responses
                  let existingProfile;
                  if (Array.isArray(emailArr)) {
                    existingProfile = emailArr[0];
                  } else if (emailArr?.content && Array.isArray(emailArr.content)) {
                    existingProfile = emailArr.content[0];
                  } else {
                    existingProfile = emailArr;
                  }

                  if (existingProfile && existingProfile.userId !== userId) {
                    // Step 3: Email + tenantId exists but with different userId
                    // UPDATE the existing record's userId to match current Clerk userId
                    // CRITICAL: Preserve all existing fields - only update userId and clerkUserId
                    // DO NOT overwrite firstName, lastName, email if they already have values
                    debugLog('[Layout] Found existing profile with same email but different userId. Updating userId...');
                    debugLog('[Layout] Old userId:', existingProfile.userId, '→ New userId:', userId);
                    debugLog('[Layout] Preserving existing profile data:', {
                      firstName: existingProfile.firstName,
                      lastName: existingProfile.lastName,
                      email: existingProfile.email
                    });

                    // Use direct backend call with JWT (not proxy) for PATCH operations
                    const apiBaseUrl = getApiBaseUrl();
                    // CRITICAL: Build update payload that ONLY updates userId/clerkUserId
                    // Preserve ALL existing fields - do NOT include fields that might overwrite existing data
                    const updatePayload: any = {
                      id: existingProfile.id, // MUST include id in PATCH payload per backend requirements
                      userId: userId, // Update to current Clerk userId
                      clerkUserId: userId, // Also update clerkUserId
                      tenantId: tenantId, // Include tenantId
                      updatedAt: new Date().toISOString(),
                    };

                    // ONLY update firstName/lastName/email if they are missing/empty in existing profile
                    // This prevents overwriting existing data with empty values from Clerk
                    if (!existingProfile.firstName || existingProfile.firstName.trim() === '') {
                      if (u?.firstName && u.firstName.trim() !== '') {
                        updatePayload.firstName = u.firstName;
                      }
                    }
                    // Preserve existing firstName - do NOT update

                    if (!existingProfile.lastName || existingProfile.lastName.trim() === '') {
                      if (u?.lastName && u.lastName.trim() !== '') {
                        updatePayload.lastName = u.lastName;
                      }
                    }
                    // Preserve existing lastName - do NOT update

                    if (!existingProfile.email || existingProfile.email.trim() === '') {
                      if (userEmail && userEmail.trim() !== '') {
                        updatePayload.email = userEmail;
                      }
                    }
                    // Preserve existing email - do NOT update

                    if (!existingProfile.profileImageUrl || existingProfile.profileImageUrl.trim() === '') {
                      if (u?.imageUrl && u.imageUrl.trim() !== '') {
                        updatePayload.profileImageUrl = u.imageUrl;
                      }
                    }
                    // Preserve existing profileImageUrl - do NOT update

                    debugLog('[Layout] Sending PATCH request with payload:', JSON.stringify(updatePayload, null, 2));

                    const updateRes = await fetchWithJwtRetry(`${apiBaseUrl}/api/user-profiles/${existingProfile.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/merge-patch+json' },
                      body: JSON.stringify(updatePayload),
                    });

                    if (updateRes.ok) {
                      const updated = await updateRes.json();
                      debugLog('[Layout] 🔍 Updated profile data:', {
                        id: updated?.id,
                        userId: updated?.userId,
                        email: updated?.email,
                        userRole: updated?.userRole,
                        userStatus: updated?.userStatus,
                        tenantId: updated?.tenantId,
                        rawProfile: JSON.stringify(updated, null, 2)
                      });
                      isTenantAdmin = isAdminRole(updated?.userRole);
                      debugLog('[Layout] ✅ Successfully updated userId. Admin status:', {
                        isTenantAdmin,
                        userRole: updated?.userRole,
                        roleMatch: isAdminRole(updated?.userRole),
                        roleType: typeof updated?.userRole,
                        roleValue: JSON.stringify(updated?.userRole)
                      });
                    } else {
                      const errorText = await updateRes.text();
                      console.error('[Layout] Failed to update userId:', updateRes.status);
                      console.error('[Layout] Error response:', errorText);
                    }
                  } else {
                    // Step 4: No existing profile found - Create new profile
                    debugLog('[Layout] Creating new user profile for userId:', userId);
                    const now = new Date().toISOString();
                    const payload = {
                      userId,
                      clerkUserId: userId,
                      email: userEmail,
                      firstName: u?.firstName || '',
                      lastName: u?.lastName || '',
                      profileImageUrl: u?.imageUrl || '',
                      userRole: 'MEMBER',
                      userStatus: 'PENDING_APPROVAL',
                      createdAt: now,
                      updatedAt: now,
                    };

                    const createRes = await fetch(`${baseUrl}/api/proxy/user-profiles`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    if (!createRes.ok) {
                      console.error('[Layout] Failed to create user profile:', createRes.status);
                    } else {
                      debugLog('[Layout] Successfully created new user profile');
                    }
                  }
                }
              } else {
                // No email available, cannot check or create profile
                console.warn('[Layout] User has no email address, skipping profile creation');
              }
            } catch (err) {
              console.error('[Layout] Error in user profile creation/update logic:', err);
            }
          } else {
            // Step 5: Profile found by userId + tenantId - check admin status
            debugLog('[Layout] 🔍 Profile data:', {
              id: p?.id,
              userId: p?.userId,
              email: p?.email,
              userRole: p?.userRole,
              userStatus: p?.userStatus,
              tenantId: p?.tenantId,
              rawProfile: JSON.stringify(p, null, 2)
            });
            isTenantAdmin = isAdminRole(p?.userRole);
            debugLog('[Layout] ✅ Found existing profile. Admin status:', {
              isTenantAdmin,
              userRole: p?.userRole,
              roleMatch: isAdminRole(p?.userRole),
              roleType: typeof p?.userRole,
              roleValue: JSON.stringify(p?.userRole)
            });
          }
        }
      }
    } catch (e) {
      // Fail closed (no admin) on error
      console.error('[Layout] ❌ Error determining admin status:', e);
      isTenantAdmin = false;
    }
  } else {
    // pathname empty - skip auth to avoid edge cases
    debugLog('[Layout] 🔍 No pathname, skipping auth checks');
    isTenantAdmin = false;
  }

  debugLog('[Layout] 🔍 Final admin status:', { isTenantAdmin, isPublicRoute, pathname });
  } catch (layoutError: unknown) {
    const err = layoutError instanceof Error ? layoutError : new Error(String(layoutError));
    console.error('[LAYOUT-ERROR] Root layout failed:', err.message);
    console.error('[LAYOUT-ERROR] Stack:', err.stack);
    isTenantAdmin = false;
  }

  // Clerk v7 / Core 3: ClerkProvider must be inside <body>, not wrapping <html>.
  // We inline the ClerkProvider wrapping instead of using a separate layoutContent variable.
  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Header Design System Fonts - DM Serif Display + Plus Jakarta Sans */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Epilogue:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
        </head>
        <body className={inter.className + " flex flex-col min-h-screen"} suppressHydrationWarning>
          {CLERK_KEY ? (
          <ClerkProvider publishableKey={CLERK_KEY} {...clerkProps}>
          <ClerkSyncUrlCleanup />
          <ClerkSatelliteSyncGate />
          <TenantIdInjector />
          <TrpcProvider>
            <TenantSettingsProvider>
              <ConditionalLayout
                header={<Header hideMenuItems={false} isTenantAdmin={isTenantAdmin} />}
                footer={<Footer />}
              >
                {children}
              </ConditionalLayout>
            </TenantSettingsProvider>
          </TrpcProvider>
          <Script
            id="hcaptcha-config"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.hcaptchaConfig = {
                  passive: true,
                  usePassiveEventListeners: true
                };
              `,
            }}
          />
          {/* Givebutter Widget Script */}
          <Script
            id="givebutter-widget"
            src="https://widgets.givebutter.com/latest.umd.cjs?acct=mKoUpYQebNsn6RqA&p=other"
            strategy="afterInteractive"
            async
          />
          {/* Mobile Debug Console - Always available for log copying, even on error pages */}
          <MobileDebugConsole />
          </ClerkProvider>
          ) : (
          <>
          <ClerkSyncUrlCleanup />
          <ClerkSatelliteSyncGate />
          <TenantIdInjector />
          <TrpcProvider>
            <TenantSettingsProvider>
              <ConditionalLayout
                header={<Header hideMenuItems={false} isTenantAdmin={isTenantAdmin} />}
                footer={<Footer />}
              >
                {children}
              </ConditionalLayout>
            </TenantSettingsProvider>
          </TrpcProvider>
          <Script
            id="hcaptcha-config"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.hcaptchaConfig = {
                  passive: true,
                  usePassiveEventListeners: true
                };
              `,
            }}
          />
          <Script
            id="givebutter-widget"
            src="https://widgets.givebutter.com/latest.umd.cjs?acct=mKoUpYQebNsn6RqA&p=other"
            strategy="afterInteractive"
            async
          />
          <MobileDebugConsole />
          </>
          )}
        </body>
      </html>
  );
}
