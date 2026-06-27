import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[HEALTH] Health check endpoint called');
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasApiBaseUrl: !!(process.env.AMPLIFY_NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL),
      hasTenantId: !!(process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID),
      hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    },
  });
}
