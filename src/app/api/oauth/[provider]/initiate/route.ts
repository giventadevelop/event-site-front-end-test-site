import { NextRequest, NextResponse } from 'next/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

/**
 * OAuth Initiate Proxy Route (App Router)
 *
 * This endpoint proxies OAuth initiation requests to the backend.
 * It adds proper authentication and tenant ID headers before forwarding.
 *
 * Query Parameters:
 * - provider: OAuth provider (google, facebook, github) - from URL path
 * - redirectUrl: Frontend URL to redirect to after OAuth completes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

    if (!getApiBase()) {
      console.error('[OAuth Initiate] API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'API base URL not configured' },
        { status: 500 }
      );
    }

    // Extract provider from URL path (await params in Next.js 15)
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get('redirectUrl') || '/';

    if (!provider) {
      console.error('[OAuth Initiate] Missing provider');
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders = ['google', 'facebook', 'github', 'apple', 'microsoft'];
    if (!validProviders.includes(provider.toLowerCase())) {
      console.error('[OAuth Initiate] Invalid provider:', provider);
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    // Get tenant ID
    const tenantId = getTenantId();

    // Build backend OAuth URL with query parameters
    const backendOAuthUrl = `${getApiBase()}/api/oauth/${provider}/initiate`;
    const backendParams = new URLSearchParams();
    backendParams.append('tenantId', tenantId);
    backendParams.append('redirectUrl', redirectUrl);

    const fullBackendUrl = `${backendOAuthUrl}?${backendParams.toString()}`;

    console.log('[OAuth Initiate] Forwarding to backend:', {
      provider,
      tenantId,
      redirectUrl,
      backendUrl: fullBackendUrl
    });

    // Make authenticated request to backend
    // Backend should return 302 redirect to Clerk OAuth page
    const backendResponse = await fetchWithJwtRetry(fullBackendUrl, {
      method: 'GET',
      headers: {
        'X-Tenant-Id': tenantId, // Add tenant ID header
      },
      redirect: 'manual', // Don't follow redirects automatically
    }, 'oauth-initiate');

    console.log('[OAuth Initiate] Backend response status:', backendResponse.status);

    // Backend should return 302 (Found) with Location header
    if (backendResponse.status === 302 || backendResponse.status === 301) {
      const location = backendResponse.headers.get('Location');

      if (!location) {
        console.error('[OAuth Initiate] Backend returned redirect without Location header');
        return NextResponse.json(
          { error: 'Backend redirect missing location' },
          { status: 500 }
        );
      }

      console.log('[OAuth Initiate] Redirecting to:', location);

      // Forward the redirect to the client
      return NextResponse.redirect(location, { status: 302 });
    }

    // If not a redirect, something went wrong
    const errorText = await backendResponse.text();
    console.error('[OAuth Initiate] Unexpected backend response:', {
      status: backendResponse.status,
      body: errorText
    });

    return NextResponse.json(
      {
        error: 'OAuth initiation failed',
        details: errorText
      },
      { status: backendResponse.status }
    );

  } catch (error) {
    console.error('[OAuth Initiate] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
