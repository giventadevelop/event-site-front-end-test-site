/**
 * Get Current User API Route (Backend-Only Proxy)
 *
 * Proxies current user retrieval to Spring Boot backend.
 * ALL user retrieval logic occurs in the backend.
 * This is a pure proxy.
 *
 * Backend endpoint: GET /api/auth/user
 * Headers: Authorization: Bearer <accessToken>, X-Tenant-ID
 * Response: User object with profile information
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

export async function GET(req: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          detail: 'Missing or invalid authorization header',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get tenant ID from environment
    const tenantId = getTenantId();

    // Forward request to backend Spring Boot API
    const backendUrl = `${getBackendBaseUrl()}/api/auth/user`;
    console.log('[AUTH PROXY] Forwarding get current user to backend:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
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
      console.error('[AUTH PROXY] Backend get user failed:', backendResponse.status, responseData);
      return NextResponse.json(
        responseData || {
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          detail: 'Invalid or expired token',
          message: 'Authentication failed',
        },
        { status: backendResponse.status }
      );
    }

    // Success - return backend response with user info
    console.log('[AUTH PROXY] Get current user successful:', responseData.email);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('[AUTH PROXY] Get current user error:', error);

    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: error instanceof Error ? error.message : 'Failed to retrieve user',
        message: 'Authentication failed',
      },
      { status: 401 }
    );
  }
}

