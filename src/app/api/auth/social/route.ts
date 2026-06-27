/**
 * Social Sign-In API Route (Backend-Only Proxy)
 *
 * Proxies social authentication to Spring Boot backend.
 * ALL social login logic (OAuth exchange, user reconciliation) occurs in the backend.
 * This is a pure proxy.
 *
 * Backend endpoint: POST /api/auth/sign-in/social
 * Request: { provider, idToken, tenantId }
 * Response: { accessToken, refreshToken, expiresIn, tokenType, user }
 *
 * Supported providers: google, facebook, github, apple
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

/**
 * Get backend API base URL
 */
function getBackendBaseUrl(): string {
  const url = getApiBaseUrl();
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  return url;
}

const SUPPORTED_PROVIDERS = ['google', 'facebook', 'github', 'apple'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, token, idToken } = body;

    // Use idToken if available, fallback to token for backward compatibility
    const authToken = idToken || token;

    // Validate required fields
    if (!provider || !authToken) {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Provider and token are required',
          message: 'Provider and idToken are required',
        },
        { status: 400 }
      );
    }

    // Validate provider
    if (!SUPPORTED_PROVIDERS.includes(provider.toLowerCase())) {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: `Invalid provider. Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}`,
          message: 'Invalid social login provider',
        },
        { status: 400 }
      );
    }

    // Get tenant ID from environment
    const tenantId = getTenantId();

    // Forward request to backend Spring Boot API
    const backendUrl = `${getBackendBaseUrl()}/api/auth/sign-in/social`;
    console.log('[AUTH PROXY] Forwarding social sign-in to backend:', backendUrl, 'Provider:', provider);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        provider: provider.toLowerCase(),
        idToken: authToken,
        tenantId,
      }),
    });

    // Read response body once
    const responseText = await backendResponse.text();
    let responseData: any;

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('[AUTH PROXY] Failed to parse backend response:', responseText);
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Invalid response from authentication service',
          message: 'Authentication service returned invalid response',
        },
        { status: 500 }
      );
    }

    // Forward backend response status and body
    if (!backendResponse.ok) {
      console.error('[AUTH PROXY] Backend social sign-in failed:', backendResponse.status, responseData);
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    // Success - return backend response with tokens and user info
    console.log('[AUTH PROXY] Social sign-in successful for user:', responseData.user?.email);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('[AUTH PROXY] Social sign-in error:', error);

    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Social authentication failed',
        message: 'An error occurred during social authentication',
        errorCode: 'AUTH_010',
      },
      { status: 401 }
    );
  }
}


