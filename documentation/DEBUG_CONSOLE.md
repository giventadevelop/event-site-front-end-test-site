# Mobile Debug Instructions

## To see browser console logs on mobile:

1. Add this script to capture console logs:
   - Edit page.tsx to add a console interceptor
   - OR use remote debugging tools

2. Look for these specific log messages in browser console (NOT server logs):

### Expected logs when form is filled:
```
[UniversalPaymentCheckout] CRITICAL FIX: Auto-activating payment section (form is valid)
[UniversalPaymentCheckout] EFFECT TRIGGERED - Dependencies changed
[UniversalPaymentCheckout] ⚡ INITIALIZING PAYMENT SESSION
```

### Expected logs when buttons load:
```
[DESKTOP ECE] ⚡ EXPRESS CHECKOUT READY
[DESKTOP ECE] ========== PAYMENT METHODS DEBUG ==========
[DESKTOP ECE] ✅ Apple Pay: Available
[DESKTOP ECE] ✅ Google Pay: Available
```

### Expected logs when clicking Apple Pay:
```
[DESKTOP ECE] ⚡ EXPRESS CHECKOUT BUTTON CLICKED
[DESKTOP ECE] ⚡ EXPRESS CHECKOUT onConfirm TRIGGERED
```

## Fixes Applied

### 1. Payment Flickering (FIXED ✅)
**Root Cause**: customerName and customerPhone in useEffect dependencies
- Every keystroke in name/phone fields triggered payment re-initialization
- Server logs showed duplicate initializations 59ms apart

**Solution**: Removed customerName and customerPhone from useEffect dependency array
- Customer info doesn't need to trigger re-initialization
- It's just passed in the payment session request

### 2. Payment Options Not Showing (FIXED ✅)
**Root Cause**: IntersectionObserver only activated payment section when scrolled into view
- If form was completed before scrolling, payment options never appeared

**Solution**: Auto-activate payment section when form is valid
- No longer waits for scroll position
- Activates immediately when tickets selected + email entered

### 3. Debug Log Viewer Infinite Re-render (FIXED ✅)
**Root Cause**: setState inside console.log interceptor
- console.log → setState → render → console.log → infinite loop

**Solution**: Use ref to store logs instead of state
- Logs stored in debugLogsRef (doesn't trigger re-renders)
- Only convert to state when user opens the debug panel

### 4. Payment Flickering v2 - enabled Prop Transition (FIXED ✅)
**Root Cause**: `enabled` prop changing from false to true during initial validation
- Debug logs showed: `enabled: ""` → `enabled: true`
- `UniversalPaymentCheckout` cleared session on EVERY `!enabled` check
- This caused session clear → re-initialization cycle
- Result: Visible flickering during form validation

**Solution**: Track previous enabled state with ref
- Added `enabledRef` to track previous enabled value
- Only clear session when going from `true` → `false` (form becomes invalid)
- Skip session clear when going from `false` → `true` (initial validation)
- Session preserved during initial form completion

**Code Location**: `src/components/UniversalPaymentCheckout.tsx:174-199`

### 6. Payment Flickering v3 - CSS Manipulation of Stripe Elements (FIXED ✅)
**Root Cause**: 104 lines of CSS with `!important` flags forcefully overriding Stripe's internal styles
- CSS targeted `.ElementsApp`, `.ExpressCheckoutElement`, `.Tab`, `.PaymentElement`
- Stripe Elements render in iframes - external CSS causes rendering conflicts
- Our CSS fought with Stripe's internal layout calculations
- Result: Flickering as Stripe tried to render and our CSS overrode it

**Solution**: Removed ALL CSS manipulation of Stripe Elements
- Deleted 67 lines of ExpressCheckoutElement CSS (lines 491-559)
- Deleted 37 lines of PaymentElement CSS (lines 535-572)
- Removed all !important flags targeting Stripe internals
- Let Stripe handle all internal styling automatically

**Why This Matters**:
- Stripe Elements are isolated in iframes for security
- External CSS with !important creates race conditions during initialization
- Proper approach: Use wrapper divs for positioning, let Stripe handle internal styling
- Use Stripe's options API for legitimate customization

**Code Location**: `src/components/StripeDesktopCheckout.tsx:491-559 (removed)`

### 5. Apple Pay Not Available (REQUIRES CONFIGURATION ⚠️)
**Root Cause**: Domain not registered in Stripe Dashboard
- Debug logs showed: `[PRB] canMakePayment() result: null`
- `[PRB] Native Google Pay API canMakePayment: false`
- Apple Pay requires domain verification

**Required Steps** (User must complete in Stripe Dashboard):
1. Go to: https://dashboard.stripe.com/settings/payment_methods/apple_pay
2. Add domain: `www.mosc-temp.com`
3. Download Apple Pay verification file
4. Upload to: `https://www.mosc-temp.com/.well-known/apple-developer-merchantid-domain-association`

**Note**: This is NOT a code issue - it's a Stripe configuration requirement

## Testing the Fixes

### What Should Work Now:
1. **NO MORE FLICKERING** when filling out the form ✅
   - Payment section loads smoothly as you complete the form
   - No more session clear/re-init cycle

2. **Payment options appear immediately** ✅
   - As soon as tickets selected + email entered
   - No need to scroll or reselect tickets

3. **Debug log viewer works in production** ✅
   - Click "Show Debug Logs" button (bottom-right corner)
   - View real-time browser console logs on mobile

### Testing Steps:
1. Clear browser cache and refresh: https://www.mosc-temp.com/events/2/checkout
2. Fill out the form - watch for smooth loading (no flickering)
3. Click "Show Debug Logs" to verify payment initialization logs
4. Look for these logs to confirm fix:
   ```
   [UniversalPaymentCheckout] Form not yet valid, skipping session clear (prevent initial flicker)
   [UniversalPaymentCheckout] ⚡ INITIALIZING PAYMENT SESSION
   ```

### Known Issue - Apple Pay Not Available:
- **Apple Pay buttons will NOT be clickable** until domain is registered in Stripe
- Debug logs will show: `[PRB] canMakePayment() result: null`
- This requires Stripe Dashboard configuration (see Fix #5 above)
- **This is expected and NOT a code bug**
