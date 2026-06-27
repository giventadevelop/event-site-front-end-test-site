/**
 * Token Refresh API Route (Backend-Only Proxy)
 *
 * Proxies token refresh to Spring Boot backend.
 * ALL token refresh logic (verification, rotation) occurs in the backend.
 * This is a pure proxy.
 *
 * Backend endpoint: POST /api/auth/refresh-token
 * Request: { refreshToken }
 * Response: { accessToken, refreshToken, expiresIn, tokenType }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    // Validate required field
    if (!refreshToken) {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Refresh token is required',
          message: 'Refresh token is required',
        },
        { status: 400 }
      );
    }

    // Forward request to backend Spring Boot API
    const backendUrl = `${getBackendBaseUrl()}/api/auth/refresh-token`;
    console.log('[AUTH PROXY] Forwarding token refresh to backend:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
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
      console.error('[AUTH PROXY] Backend token refresh failed:', backendResponse.status, responseData);
      return NextResponse.json(
        responseData || {
          type: 'https://api.clerk.com/problem/authentication-error',
          title: 'Token Refresh Error',
          status: backendResponse.status,
          detail: 'Token refresh failed',
          errorCode: 'AUTH_002',
          message: 'error.clerk.tokenExpired',
        },
        { status: backendResponse.status }
      );
    }

    // Success - return backend response with new tokens
    console.log('[AUTH PROXY] Token refresh successful');
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('[AUTH PROXY] Token refresh error:', error);

    return NextResponse.json(
      {
        type: 'https://api.clerk.com/problem/authentication-error',
        title: 'Token Refresh Error',
        status: 401,
        detail: error instanceof Error ? error.message : 'Token refresh failed',
        message: 'Failed to refresh authentication token',
        errorCode: 'AUTH_002',
      },
      { status: 401 }
    );
  }
}


