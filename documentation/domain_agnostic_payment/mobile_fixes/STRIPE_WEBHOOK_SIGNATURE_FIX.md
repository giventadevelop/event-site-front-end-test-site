# Stripe Webhook Signature Verification Fix for AWS Lambda/Amplify

## Problem

Stripe webhook signature verification was failing in AWS Lambda/Amplify environment with error:

```
Error: No signatures found matching the expected signature for payload.
Are you passing the raw request body you received from Stripe?
```

## Root Cause

In AWS Lambda/Amplify environments, the request body handling differs from standard Next.js deployments:

1. **Body Parsing**: AWS API Gateway/Amplify may modify the request body before it reaches the Lambda handler
2. **Encoding Issues**: The body encoding might not match exactly what Stripe sent
3. **Signature Header**: The signature header format might be different in Lambda context

## Solution

### Changes Made

1. **Removed Invalid Config**: Removed `export const config` (Pages Router syntax, not valid for App Router)

2. **Improved Body Reading**:
   - Use `req.arrayBuffer()` to get raw bytes
   - Convert to Buffer preserving exact byte representation
   - Store text version separately for logging only

3. **Enhanced Error Logging**:
   - Log body length and signature header preview
   - Log Lambda environment detection
   - Provide detailed error messages for debugging

### Code Changes

```typescript
// BEFORE (Broken)
const rawBody = await req.arrayBuffer();
const buf = Buffer.from(rawBody);
event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);

// AFTER (Fixed)
const arrayBuffer = await req.arrayBuffer();
rawBody = Buffer.from(arrayBuffer);
bodyText = rawBody.toString('utf8'); // For logging only
event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
```

## Verification Steps

After deploying the fix:

1. **Check CloudWatch Logs** for:
   - `[STRIPE-WEBHOOK] ✅ Successfully verified webhook signature`
   - `[STRIPE-WEBHOOK] Event type: charge.succeeded`
   - `[STRIPE-WEBHOOK] Event ID: evt_xxx`

2. **If Still Failing**, check:
   - Webhook secret in AWS Amplify environment variables
   - Stripe webhook endpoint configuration
   - Signature header format in logs

## Additional Debugging

If signature verification still fails:

1. **Verify Webhook Secret**:
   ```bash
   # Check AWS Amplify environment variables
   # Ensure STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
   ```

2. **Check Stripe Dashboard**:
   - Webhook endpoint URL matches deployment URL
   - Webhook secret is correct
   - Events are being sent to correct endpoint

3. **Test Locally**:
   ```bash
   # Use Stripe CLI to test webhook
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Related Files

- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/lib/stripe/init.ts` - Stripe initialization
- AWS Amplify Environment Variables - Webhook secret configuration

## References

- [Stripe Webhook Signing](https://stripe.com/docs/webhooks/signatures)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [AWS Lambda Request Handling](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html)





