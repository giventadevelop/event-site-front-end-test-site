/**
 * Clerk Proxy Route for Satellite Domain Support
 *
 * This API route proxies requests from /__clerk/* to the primary Clerk domain.
 * Required for Clerk Pro satellite domain configuration on AWS Amplify.
 *
 * @see https://clerk.com/docs/deployments/proxy-configuration
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Primary Clerk domain for Frontend API
 * Read from environment variable for flexibility across environments
 */
const CLERK_FRONTEND_API = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL || 'https://clerk.event-site-manager.com';

/**
 * Handles all HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToClerk(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToClerk(request, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToClerk(request, params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToClerk(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToClerk(request, params.path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Handle OPTIONS (CORS preflight) directly without proxying
  // This is required for Clerk's verification system to work
  const origin = request.headers.get('origin') || '*';

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

/**
 * Proxy requests to Clerk Frontend API
 */
async function proxyToClerk(request: NextRequest, pathSegments: string[]) {
  try {
    // Construct the target URL
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${CLERK_FRONTEND_API}/${path}${searchParams ? `?${searchParams}` : ''}`;

    // Prepare headers for the proxied request
    const headers = new Headers();

    // Copy relevant headers from the original request
    const headersToProxy = [
      'content-type',
      'authorization',
      'user-agent',
      'accept',
      'accept-language',
      'cache-control',
    ];

    headersToProxy.forEach((headerName) => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });

    // Get request body if present
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (error) {
        // Body might not be available or already consumed
        console.error('Error reading request body:', error);
      }
    }

    // Make the proxied request
    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
      // Don't follow redirects automatically
      redirect: 'manual',
    });

    // Prepare response headers
    const responseHeaders = new Headers();

    // Copy relevant response headers
    const responseHeadersToProxy = [
      'content-type',
      'cache-control',
      'expires',
      'pragma',
      'set-cookie',
      'vary',
    ];

    responseHeadersToProxy.forEach((headerName) => {
      const headerValue = proxyResponse.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    });

    // Add CORS headers for Clerk
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    // Handle redirects
    if (proxyResponse.status >= 300 && proxyResponse.status < 400) {
      const location = proxyResponse.headers.get('location');
      if (location) {
        responseHeaders.set('location', location);
      }
    }

    // Return the proxied response
    const responseBody = await proxyResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Clerk proxy error:', error);

    return new NextResponse(
      JSON.stringify({
        error: 'Proxy request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
