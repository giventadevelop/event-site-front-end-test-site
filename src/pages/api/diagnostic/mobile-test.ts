import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Mobile Diagnostic Test Endpoint (Pages Router)
 *
 * This endpoint is designed to verify that mobile browsers can reach API routes.
 * It logs immediately and returns diagnostic information.
 *
 * CRITICAL: This uses Pages Router to match the proxy routes pattern.
 *
 * Usage: Call from mobile browser: /api/diagnostic/mobile-test
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CRITICAL: Log IMMEDIATELY at the very start - before ANY other code
  console.log('[MOBILE-DIAGNOSTIC-PAGES] ===== HANDLER FUNCTION CALLED =====');
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Handler invoked at:', new Date().toISOString());
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Request method:', req.method);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Request URL:', req.url);

  // Handle CORS preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    console.log('[MOBILE-DIAGNOSTIC-PAGES] Handling OPTIONS preflight request');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Enhanced mobile detection: Include WhatsApp, mobile browsers, and CloudFront headers
  const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
  const cloudfrontMobile = req.headers['cloudfront-is-mobile-viewer'] === 'true';
  const cloudfrontAndroid = req.headers['cloudfront-is-android-viewer'] === 'true';
  const cloudfrontIOS = req.headers['cloudfront-is-ios-viewer'] === 'true';
  const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

  // CRITICAL: Log immediately to verify this endpoint is being called
  console.log('[MOBILE-DIAGNOSTIC-PAGES] ===== MOBILE TEST ENDPOINT CALLED (PAGES ROUTER) =====');
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Timestamp:', timestamp);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] User-Agent:', userAgent);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] User-Agent Mobile Match:', userAgentMobile);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] CloudFront Mobile:', cloudfrontMobile);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] CloudFront Android:', cloudfrontAndroid);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] CloudFront iOS:', cloudfrontIOS);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Final Is Mobile:', isMobile);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Request URL:', req.url);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Request Method:', req.method);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] ===== END MOBILE TEST (PAGES ROUTER) =====');

  // Set CORS headers for mobile browsers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json({
    success: true,
    message: 'Mobile diagnostic endpoint reached successfully (Pages Router)',
    diagnostic: {
      timestamp,
      userAgent,
      isMobile,
      userAgentMobile,
      cloudfrontMobile,
      cloudfrontAndroid,
      cloudfrontIOS,
      url: req.url,
      method: req.method,
    },
    instructions: 'If you see [MOBILE-DIAGNOSTIC-PAGES] in CloudWatch logs, mobile can reach Pages Router API routes.',
  });
}

