# Phase 1: Parallel Implementation Guide

## Overview
This guide implements Phase 1 of the Stripe Checkout migration: **Parallel Implementation (Low Risk)**. Both Payment Intent and Checkout Session flows will work simultaneously, controlled by a feature flag.

## Implementation Status

### ✅ Completed
1. **Feature Flag Added** (`src/lib/env.ts`)
   - Function: `useStripeCheckout()` - checks `NEXT_PUBLIC_USE_STRIPE_CHECKOUT` environment variable
   - Default: `false` (uses Payment Intent flow for backward compatibility)

2. **SubscriptionSignupClient Updated** (`src/app/membership/subscribe/[planId]/SubscriptionSignupClient.tsx`)
   - Added feature flag check: `useCheckoutFlow`
   - When `useCheckoutFlow === true`:
     - Hides Payment Intent flow (Stripe Elements, Payment Request Buttons)
     - Shows only "Proceed to Checkout" button
     - Uses `createSubscriptionCheckoutSessionServer` to create Checkout Session
   - When `useCheckoutFlow === false`:
     - Shows Payment Intent flow (existing behavior)
     - Shows "Proceed to Checkout" button as fallback

3. **Success Page Already Supports Both Flows**
   - `src/app/membership/success/page.tsx` accepts both `session_id` and `payment_intent`
   - `src/app/membership/success/MembershipSuccessClient.tsx` handles both parameters
   - `src/app/api/membership/success/process/route.ts` processes both flows

4. **Checkout Session Processing Already Implemented**
   - `processMembershipSubscriptionSessionServer` function exists and works
   - Handles subscription creation from Checkout Session
   - Includes duplicate prevention and error handling

## How to Enable Checkout Flow

### Step 1: Set Environment Variable

Add to `.env.local` (for local development):
```bash
NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true
```

Add to AWS Amplify Console (for production):
1. Go to App Settings → Environment Variables
2. Add: `NEXT_PUBLIC_USE_STRIPE_CHECKOUT` = `true`

### Step 2: Test Both Flows

#### Test Payment Intent Flow (Default)
1. Set `NEXT_PUBLIC_USE_STRIPE_CHECKOUT=false` (or don't set it)
2. Visit `/membership/subscribe/{planId}`
3. You should see:
   - Stripe Elements payment form (desktop)
   - Payment Request Buttons (mobile)
   - "Proceed to Checkout" button as fallback
4. Complete payment using Payment Intent flow
5. Verify success page shows subscription details

#### Test Checkout Session Flow (New)
1. Set `NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true`
2. Visit `/membership/subscribe/{planId}`
3. You should see:
   - Only "Proceed to Checkout" button
   - No Stripe Elements or Payment Request Buttons
4. Click "Proceed to Checkout"
5. You'll be redirected to Stripe's hosted Checkout page
6. Complete payment on Stripe's page
7. You'll be redirected back to `/membership/success?session_id={CHECKOUT_SESSION_ID}`
8. Verify success page shows subscription details

## Testing Checklist

### ✅ Payment Intent Flow (Default)
- [ ] Desktop: Stripe Elements form appears
- [ ] Desktop: Payment Request Buttons appear
- [ ] Desktop: "Proceed to Checkout" button appears
- [ ] Mobile: Payment Request Button appears
- [ ] Mobile: "Proceed to Checkout" button appears
- [ ] Payment completes successfully
- [ ] Success page shows subscription details
- [ ] Database record created with correct `stripe_subscription_id`

### ✅ Checkout Session Flow (New)
- [ ] Desktop: Only "Proceed to Checkout" button appears
- [ ] Mobile: Only "Proceed to Checkout" button appears
- [ ] Clicking button redirects to Stripe Checkout page
- [ ] Stripe Checkout page loads correctly
- [ ] Payment completes on Stripe's page
- [ ] Redirect back to success page with `session_id`
- [ ] Success page shows subscription details
- [ ] Database record created with correct `stripe_subscription_id`

## Code Changes Summary

### Files Modified
1. **`src/lib/env.ts`**
   - Added `useStripeCheckout()` function

2. **`src/app/membership/subscribe/[planId]/SubscriptionSignupClient.tsx`**
   - Added feature flag check
   - Conditionally shows/hides Payment Intent flow
   - Updated `handleSubscribe` to use Checkout Session

### Files Already Supporting Both Flows
1. **`src/app/membership/subscribe/[planId]/ApiServerActions.ts`**
   - `createSubscriptionCheckoutSessionServer` function exists

2. **`src/app/membership/success/ApiServerActions.ts`**
   - `processMembershipSubscriptionSessionServer` function exists

3. **`src/app/membership/success/page.tsx`**
   - Accepts both `session_id` and `payment_intent`

4. **`src/app/membership/success/MembershipSuccessClient.tsx`**
   - Handles both `session_id` and `payment_intent`

5. **`src/app/api/membership/success/process/route.ts`**
   - Processes both Checkout Session and Payment Intent flows

## Benefits of Phase 1

1. **Low Risk**: Both flows work simultaneously
2. **Easy Rollback**: Simply set `NEXT_PUBLIC_USE_STRIPE_CHECKOUT=false` to revert
3. **Gradual Testing**: Test Checkout flow with small user group
4. **No Breaking Changes**: Existing Payment Intent flow continues to work

## Next Steps (Phase 2)

Once Phase 1 is tested and verified:
1. Enable Checkout flow for 10% of users (via feature flag or user segmentation)
2. Monitor error rates and performance
3. Gradually increase to 50%, then 100%
4. After 2 weeks of successful operation, proceed to Phase 3 (cleanup)

## Troubleshooting

### Checkout Session Not Created
- Verify `NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true` is set
- Check browser console for errors
- Verify user is authenticated (userId exists)
- Check server logs for `[MEMBERSHIP-CHECKOUT]` messages

### Success Page Not Loading Subscription
- Verify `session_id` is in URL: `/membership/success?session_id=cs_...`
- Check CloudWatch logs for `processMembershipSubscriptionSessionServer`
- Verify Checkout Session has `payment_status: 'paid'`
- Check that metadata includes `membershipPlanId` and `userId`

### Payment Intent Flow Still Showing
- Verify `NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true` is set
- Clear browser cache
- Restart Next.js dev server (if local)
- Check that environment variable is loaded: `console.log(process.env.NEXT_PUBLIC_USE_STRIPE_CHECKOUT)`

## Monitoring

### Key Metrics to Track
1. **Error Rates**: Compare Payment Intent vs Checkout Session error rates
2. **Success Rates**: Percentage of successful subscriptions
3. **User Experience**: Time to complete payment
4. **Database Records**: Verify all subscriptions are created correctly

### Log Messages to Monitor
- `[MEMBERSHIP-CHECKOUT] Checkout session created` - Checkout Session created successfully
- `[MEMBERSHIP-SUCCESS] Subscription created successfully` - Database record created
- `[MEMBERSHIP-SUCCESS] Subscription already exists` - Duplicate prevented (good)

## Rollback Plan

If issues are found:
1. Set `NEXT_PUBLIC_USE_STRIPE_CHECKOUT=false` (or remove the variable)
2. Redeploy application
3. All users will automatically use Payment Intent flow
4. Investigate issues in Checkout flow
5. Fix and re-enable when ready

## Support

For questions or issues:
1. Check CloudWatch logs for detailed error messages
2. Review this guide and the main analysis document
3. Test both flows in parallel to compare behavior
4. Check Stripe Dashboard for Checkout Session status

