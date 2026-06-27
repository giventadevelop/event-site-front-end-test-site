import { NextRequest, NextResponse } from 'next/server';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * GiveButter Webhook Handler
 * 
 * Receives webhook events from GiveButter and forwards them to the backend
 * for processing. The backend will:
 * 1. Verify webhook signature against all tenant webhook secrets from payment_provider_config
 * 2. Identify tenant from matching webhook secret
 * 3. Create/update donation transactions with correct tenant ID
 * 4. Ignore requests that don't match any tenant's webhook secret
 * 
 * This follows the same pattern as the Stripe webhook handler.
 */
export async function POST(req: NextRequest) {
  // Skip processing during build phase
  if (process.env.NEXT_PHASE === 'build') {
    console.log('[GIVEBUTTER-WEBHOOK] Skipping during build phase');
    return new NextResponse(
      JSON.stringify({ error: 'Not available during build' }),
      { status: 503 }
    );
  }

  try {
    // Log environment state for debugging
    console.log('[GIVEBUTTER-WEBHOOK] Environment state:', {
      phase: process.env.NEXT_PHASE,
      nodeEnv: process.env.NODE_ENV,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      runtime: typeof window === 'undefined' ? 'server' : 'client',
    });

    // CRITICAL: Read raw body for signature verification
    // In AWS Lambda/Amplify, we need to ensure we get the raw body
    // For App Router in Lambda, use arrayBuffer() to get raw bytes
    let rawBody: Buffer;
    let signature: string | null;
    let bodyText: string = '';

    try {
      // Get signature header first (before reading body)
      // GiveButter uses X-Givebutter-Signature header
      signature = req.headers.get('x-givebutter-signature') || req.headers.get('X-Givebutter-Signature');
      if (!signature) {
        console.error('[GIVEBUTTER-WEBHOOK] Missing GiveButter signature header');
        return new NextResponse('Missing GiveButter signature', { status: 400 });
      }

      // In AWS Lambda/Amplify, read as ArrayBuffer first to preserve raw bytes
      // Then convert to Buffer for signature verification
      const arrayBuffer = await req.arrayBuffer();
      rawBody = Buffer.from(arrayBuffer);

      // Also get text version for logging (but don't use for verification)
      bodyText = rawBody.toString('utf8');

      console.log('[GIVEBUTTER-WEBHOOK] Raw body length:', rawBody.length);
      console.log('[GIVEBUTTER-WEBHOOK] Signature header:', signature.substring(0, 50) + '...');
      console.log('[GIVEBUTTER-WEBHOOK] Is Lambda:', !!process.env.AWS_LAMBDA_FUNCTION_NAME);

    } catch (bodyError) {
      console.error('[GIVEBUTTER-WEBHOOK] Error reading request body:', bodyError);
      return new NextResponse('Error reading request body', { status: 400 });
    }

    // CRITICAL: Get configured tenant ID early for logging
    const configuredTenantId = getTenantId();
    console.log('[GIVEBUTTER-WEBHOOK] ============================================');
    console.log('[GIVEBUTTER-WEBHOOK] WEBHOOK RECEIVED - TENANT ID CHECK');
    console.log('[GIVEBUTTER-WEBHOOK] Configured tenant ID:', configuredTenantId);
    console.log('[GIVEBUTTER-WEBHOOK] Environment:', process.env.NODE_ENV);
    console.log('[GIVEBUTTER-WEBHOOK] App URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('[GIVEBUTTER-WEBHOOK] API Base URL:', getApiBaseUrl());
    console.log('[GIVEBUTTER-WEBHOOK] ============================================');

    // CRITICAL: Forward webhook to backend for processing
    // Backend will:
    // 1. Verify webhook signature against all tenant webhook secrets from payment_provider_config
    // 2. Identify tenant from matching webhook secret
    // 3. Create/update donation transactions with correct tenant ID
    // 4. Ignore requests that don't match any tenant's webhook secret

    console.log('[GIVEBUTTER-WEBHOOK] Forwarding webhook to backend for processing...');
    console.log('[GIVEBUTTER-WEBHOOK] Backend will verify signature and identify tenant from payment_provider_config');

    // Get backend API base URL
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
    if (!getApiBase()) {
      console.error('[GIVEBUTTER-WEBHOOK] NEXT_PUBLIC_API_BASE_URL is not configured');
      return new NextResponse('Backend API URL not configured', { status: 500 });
    }

    try {
      // Forward webhook to backend
      // Backend endpoint: POST /api/webhooks/givebutter
      const backendWebhookUrl = `${getApiBase()}/api/webhooks/givebutter`;

      console.log('[GIVEBUTTER-WEBHOOK] Forwarding to backend:', backendWebhookUrl);
      console.log('[GIVEBUTTER-WEBHOOK] Body length:', rawBody.length);
      console.log('[GIVEBUTTER-WEBHOOK] Signature:', signature?.substring(0, 50) + '...');

      // CRITICAL: Get JWT token for backend authentication
      // According to cursor rules: Webhooks must use JWT for backend calls
      let jwt = await getCachedApiJwt();
      if (!jwt) {
        console.log('[GIVEBUTTER-WEBHOOK] No cached JWT, generating new one...');
        jwt = await generateApiJwt();
      }
      console.log('[GIVEBUTTER-WEBHOOK] Using JWT for backend authentication:', jwt ? 'JWT obtained' : 'FAILED');

      // Forward raw body and signature to backend with JWT authentication
      // CRITICAL: Backend requires JWT authentication (per cursor rules)
      const backendResponse = await fetch(backendWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Givebutter-Signature': signature || '', // Forward GiveButter signature header
          'Authorization': `Bearer ${jwt}`, // CRITICAL: JWT authentication required
        },
        body: rawBody, // Send raw body as-is (Buffer)
      });

      const responseText = await backendResponse.text();

      console.log('[GIVEBUTTER-WEBHOOK] Backend response status:', backendResponse.status);
      console.log('[GIVEBUTTER-WEBHOOK] Backend response:', responseText.substring(0, 500));

      // Return backend response to GiveButter
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('[GIVEBUTTER-WEBHOOK] Error forwarding webhook to backend:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Failed to forward webhook to backend',
          details: error?.message || 'Unknown error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('[GIVEBUTTER-WEBHOOK] Handler error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
