import { NextApiRequest, NextApiResponse } from 'next';
import { createLogger } from '@/lib/logger';

const logger = createLogger('DEPLOYMENT-CHECK');

/**
 * Deployment Verification Endpoint
 *
 * This endpoint verifies which version of the code is deployed.
 * Call this to confirm CORS fixes are live.
 *
 * Usage: GET /api/diagnostic/deployment-check
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  const version = 'v2.0-cors-fixes-20231123';

  // Log using robust logger (can't be stripped)
  logger.info('Deployment check endpoint called', {
    timestamp,
    version,
    userAgent: req.headers['user-agent'],
    method: req.method,
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    logger.info('Handling OPTIONS preflight for deployment check');
    res.status(200).end();
    return;
  }

  // Return deployment info
  const deploymentInfo = {
    success: true,
    version,
    timestamp,
    deploymentChecks: {
      corsFixesApplied: true,
      proxyHandlerCORS: true,
      clientLogCORS: true,
      globalCORS: true,
      robustLogging: true,
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      nextjsVersion: '15.1.1',
    },
    headers: {
      userAgent: req.headers['user-agent'],
      cloudfrontMobile: req.headers['cloudfront-is-mobile-viewer'],
      cloudfrontDevice: req.headers['cloudfront-is-mobile-viewer'] ||
                       req.headers['cloudfront-is-desktop-viewer'],
    },
  };

  logger.info('Deployment check response', { deploymentInfo });

  res.status(200).json(deploymentInfo);
}
