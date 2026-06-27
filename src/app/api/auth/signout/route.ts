/**
 * Sign Out API Route (Backend-Only Proxy)
 *
 * Proxies sign-out to Spring Boot backend.
 * ALL sign-out logic (token revocation, session invalidation) occurs in the backend.
 * This is a pure proxy.
 *
 * Backend endpoint: POST /api/auth/sign-out
 * Headers: Authorization: Bearer <accessToken>
 * Request: { refreshToken }
 * Response: { success: true, message: "Successfully signed out" }
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

    // Get Authorization header
    const authHeader = req.headers.get('Authorization');

    // Forward request to backend Spring Boot API
    const backendUrl = `${getBackendBaseUrl()}/api/auth/sign-out`;
    console.log('[AUTH PROXY] Forwarding sign-out to backend:', backendUrl);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if available
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        refreshToken: refreshToken || '',
      }),
    });

    // Read response body once
    const responseText = await backendResponse.text();
    let responseData: any;

    try {
      responseData = responseText ? JSON.parse(responseText) : { success: true };
    } catch (parseError) {
      // If parsing fails but request was successful, return success
      if (backendResponse.ok) {
        return NextResponse.json(
          {
            success: true,
            message: 'Successfully signed out',
          },
          { status: 200 }
        );
      }

      console.error('[AUTH PROXY] Failed to parse backend response:', responseText);
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Invalid response from authentication service',
          message: 'Sign-out service returned invalid response',
        },
        { status: 500 }
      );
    }

    // Forward backend response status and body
    if (!backendResponse.ok) {
      console.error('[AUTH PROXY] Backend sign-out failed:', backendResponse.status, responseData);
      // Even if backend fails, we return success for sign-out since frontend will clear tokens anyway
      return NextResponse.json(
        {
          success: true,
          message: 'Signed out (backend sign-out failed but local logout completed)',
        },
        { status: 200 }
      );
    }

    // Success - return backend response
    console.log('[AUTH PROXY] Sign-out successful');
    return NextResponse.json(
      responseData || { success: true, message: 'Successfully signed out' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AUTH PROXY] Sign-out error:', error);

    // For sign-out, always return success even if backend fails
    // Frontend will clear local tokens regardless
    return NextResponse.json(
      {
        success: true,
        message: 'Signed out locally',
      },
      { status: 200 }
    );
  }
}


