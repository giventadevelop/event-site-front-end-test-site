# Mobile QR Page Stuck on Loading Screen - Fix

## Problem Summary

After fixing the Stripe webhook signature verification, two issues remain:

1. **Webhook Event Issue**: Webhook receives `payment_intent.created` (unhandled) instead of `payment_intent.succeeded` or `charge.succeeded`, so no transaction is created
2. **Mobile Hydration Issue**: TicketQrClient component isn't logging, suggesting hydration failure, causing the page to stay stuck on loading screen

## Root Causes

### Issue 1: Webhook Event Handling

**Problem**:
- Webhook receives `payment_intent.created` event
- Handler only processes `payment_intent.succeeded` and `charge.succeeded`
- No transaction is created in the backend
- Mobile browser tries to fetch transaction that doesn't exist

**Why Desktop Works**:
- Desktop flow may use Checkout Session completion (`checkout.session.completed`)
- Different event flow creates transactions successfully

**Why Mobile Fails**:
- Mobile uses Payment Request Button (PRB) flow
- PRB creates Payment Intent, but webhook receives `created` event before `succeeded`
- Transaction creation depends on `succeeded` event

### Issue 2: Mobile Hydration Failure

**Problem**:
- TicketQrClient component's `useEffect` hooks aren't executing
- No console logs appear from TicketQrClient (but MobileDebugConsole works)
- Component stays stuck on loading screen because `mounted` state never becomes `true`

**Root Cause**:
- Early return check: `if (!mounted || loading)` prevents component from progressing
- If hydration fails silently, `mounted` never becomes `true`
- Component stays in loading state indefinitely

## Fixes Applied

### Fix 1: Enhanced Mount Detection with Fallback

**File**: `src/app/event/ticket-qr/TicketQrClient.tsx`

**Changes**:
1. Added `setTimeout` wrapper to ensure `useEffect` runs even if hydration has issues
2. Added fallback `useEffect` that sets `mounted=true` after 100ms if not already set
3. Ensures component progresses even if primary mount detection fails

**Code**:
```typescript
// Primary mount detection with setTimeout
useEffect(() => {
  const timeoutId = setTimeout(() => {
    // ... logging and setMounted(true)
  }, 0);
  return () => clearTimeout(timeoutId);
}, [initialPi, initialSessionId]);

// Fallback: Ensure mounted is set even if primary fails
useEffect(() => {
  const fallbackTimeout = setTimeout(() => {
    if (!mounted) {
      console.warn('[QR CLIENT] Fallback: Setting mounted=true after delay');
      setMounted(true);
    }
  }, 100);
  return () => clearTimeout(fallbackTimeout);
}, [mounted]);
```

### Fix 2: Webhook Event Handling (Future Enhancement)

**Note**: The webhook handler already processes `payment_intent.succeeded` correctly. The issue is that Stripe may send `payment_intent.created` before `payment_intent.succeeded`.

**Recommendation**:
- Monitor webhook logs to confirm `payment_intent.succeeded` is received
- If `payment_intent.succeeded` is not received, check Stripe webhook configuration
- Ensure webhook endpoint is configured to receive both `payment_intent.created` and `payment_intent.succeeded` events

## Verification Steps

After deploying the fix:

1. **Check Mobile Browser Console**:
   - Should see: `[QR CLIENT VERSION] v2025-11-26-02:48 - Mobile hydration fix applied`
   - Should see: `[QR CLIENT] ===== CLIENT-SIDE RENDER =====`
   - Should see: `[MOBILE QR] TicketQrClient mounted`

2. **Check CloudWatch Logs**:
   - Should see: `[STRIPE-WEBHOOK] ✅ Successfully verified webhook signature`
   - Should see: `[STRIPE-WEBHOOK] Event type: payment_intent.succeeded` (not just `created`)
   - Should see transaction creation logs

3. **Test Mobile Flow**:
   - Complete payment on mobile browser
   - Should see success page briefly
   - Should redirect to QR page
   - Should see transaction loading logs
   - Should see QR code appear (or error message if transaction not found)

## Expected Behavior After Fix

### If Transaction Exists:
- Component mounts successfully
- Transaction data loads
- QR code displays
- Success page shows

### If Transaction Doesn't Exist:
- Component mounts successfully (hydration fix)
- Transaction fetch fails
- Error message displays: "Transaction Not Found"
- API logs show fetch attempts

## Related Files

- `src/app/event/ticket-qr/TicketQrClient.tsx` - Main component with hydration fix
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler (already handles `payment_intent.succeeded`)
- `src/app/event/success/SuccessClient.tsx` - Success page client component
- `src/app/event/success/page.tsx` - Success page server component

## Next Steps

1. **Deploy Fix**: Deploy the hydration fix to production
2. **Monitor Webhooks**: Check if `payment_intent.succeeded` events are being received
3. **Test Mobile Flow**: Verify mobile browser can now progress past loading screen
4. **If Still Stuck**: Check if transaction is being created (webhook logs)
5. **If Transaction Missing**: Verify Stripe webhook configuration includes `payment_intent.succeeded` event

## References

- [React Hydration Documentation](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Stripe Webhook Events](https://stripe.com/docs/api/events/types)
- [Mobile Payment Flow Documentation](./mobile_payment_flow.mdc)
- [React Hydration Fixes Documentation](./REACT_HYDRATION_FIXES_AND_MOBILE_FLOW.md)





