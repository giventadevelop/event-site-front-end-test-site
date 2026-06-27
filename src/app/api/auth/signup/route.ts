/**
 * Sign Up API Route (Backend-Only Proxy)
 *
 * Proxies user registration to Spring Boot backend.
 * ALL sign-up logic occurs in the backend - this is a pure proxy.
 *
 * Backend endpoint: POST /api/auth/sign-up
 * Request: { email, password, firstName, lastName, tenantId }
 * Response: { accessToken, refreshToken, expiresIn, tokenType, user }
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Email and password are required',
          message: 'Email and password are required',
          fieldErrors: [
            !email && {
              objectName: 'signUpRequest',
              field: 'email',
              message: 'Email is required',
            },
            !password && {
              objectName: 'signUpRequest',
              field: 'password',
              message: 'Password is required',
            },
          ].filter(Boolean),
        },
        { status: 400 }
      );
    }

    // Get tenant ID from environment
    const tenantId = getTenantId();

    // Forward request to backend Spring Boot API
    const backendUrl = `${getBackendBaseUrl()}/api/auth/sign-up`;
    console.log('[AUTH PROXY] Forwarding sign-up to backend:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
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
      console.error('[AUTH PROXY] Backend sign-up failed:', backendResponse.status, responseData);
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    // Success - return backend response with tokens and user info
    console.log('[AUTH PROXY] Sign-up successful for user:', responseData.user?.email);
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('[AUTH PROXY] Sign-up error:', error);

    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'User registration failed',
        message: 'An error occurred during user registration',
      },
      { status: 500 }
    );
  }
}

