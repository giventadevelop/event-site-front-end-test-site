import Stripe from 'stripe';

const requiredStripeEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL'
] as const;

// Helper to get environment variables (process.env only; next/config deprecated in Next 16)
const getStripeEnvVar = (key: string, isPublic = false): string | undefined => {
  try {
    const prefixes = ['AMPLIFY_', 'AWS_AMPLIFY_', ''];
    for (const prefix of prefixes) {
      const value = process.env[`${prefix}${key}`];
      if (value) {
        if (process.env.AWS_LAMBDA_FUNCTION_NAME && prefix) {
          console.log(`[STRIPE-ENV] Found ${key} with prefix: ${prefix}`);
        }
        return value;
      }
    }
    return process.env[key];
  } catch (error) {
    console.error(`[STRIPE-ENV] Error getting environment variable ${key}:`, error);
    return undefined;
  }
};

export const initStripeConfig = () => {
  try {
    // Skip checks during build phase
    if (process.env.NEXT_PHASE === 'build') {
      console.log('[STRIPE] Skipping environment checks during build phase');
      return null;
    }

    // Log AWS Lambda context for debugging
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.log('[STRIPE] AWS Lambda context:', {
        functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
        functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
        region: process.env.AWS_REGION,
        runtime: process.env.AWS_EXECUTION_ENV,
      });
    }

    // Get required environment variables
    const secretKey = getStripeEnvVar('STRIPE_SECRET_KEY');
    const webhookSecret = getStripeEnvVar('STRIPE_WEBHOOK_SECRET');
    const appUrl = getStripeEnvVar('NEXT_PUBLIC_APP_URL', true);

    // Log environment state for debugging
    console.log('[STRIPE] Environment state:', {
      phase: process.env.NEXT_PHASE,
      nodeEnv: process.env.NODE_ENV,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      hasSecretKey: !!secretKey,
      hasWebhookSecret: !!webhookSecret,
      hasAppUrl: !!appUrl,
      runtime: typeof window === 'undefined' ? 'server' : 'client',
    });

    // Validate required environment variables
    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Please check AWS Amplify env vars (AMPLIFY_STRIPE_SECRET_KEY) or process.env.'
      );
    }

    // Initialize Stripe with the secret key
    return new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
    });
  } catch (error) {
    console.error('[STRIPE] Failed to initialize Stripe:', error);
    throw error;
  }
};

// Export the list of required env vars for use in other parts of the app
export const REQUIRED_STRIPE_ENV_VARS = requiredStripeEnvVars;

// Export the helper for use in other parts of the app
export { getStripeEnvVar };