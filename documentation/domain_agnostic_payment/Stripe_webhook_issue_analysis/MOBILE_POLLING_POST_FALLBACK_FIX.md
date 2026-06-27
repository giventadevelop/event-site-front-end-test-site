# Mobile Polling POST Fallback Fix

## Problem

Mobile payment flow was polling for transactions 15 times but **never attempting POST fallback** to create the transaction, resulting in:

```
Transaction not found after maximum polling attempts. Please refresh the page in a moment.
CRITICAL: Never attempted POST - backend webhook must create transaction
```

**Root Cause**: The POST fallback logic had a critical bug:
- POST fallback condition: `if (pollAttempt >= 3 && pollAttempt < MAX_POLL_ATTEMPTS)`
- This condition was inside an `else` block that only executes when `pollAttempt >= MAX_POLL_ATTEMPTS`
- When `pollAttempt = 15` (MAX_POLL_ATTEMPTS), the condition `pollAttempt < MAX_POLL_ATTEMPTS` is **false**
- Result: POST fallback **never triggers** on the final attempt

## Solution

### Fixed POST Fallback Logic (`src/app/event/ticket-qr/TicketQrClient.tsx`)

**Before** (Buggy Logic):
```typescript
if (pollAttempt < MAX_POLL_ATTEMPTS) {
  // Wait and continue polling
  await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  continue;
} else {
  // This else block only executes when pollAttempt >= MAX_POLL_ATTEMPTS (i.e., 15)
  if (pollAttempt >= 3 && pollAttempt < MAX_POLL_ATTEMPTS) {
    // This condition is NEVER true when pollAttempt = 15!
    // POST fallback never triggers
  }
}
```

**After** (Fixed Logic):
```typescript
// CRITICAL: Try POST fallback after 3 attempts OR on final attempt
// This ensures we attempt transaction creation even if webhook failed
const shouldTryPost = (pollAttempt >= 3 && pollAttempt < MAX_POLL_ATTEMPTS) || pollAttempt === MAX_POLL_ATTEMPTS;

if (shouldTryPost && !cancelled) {
  // Attempt POST to create transaction
  // ... POST logic ...

  // If POST succeeds, return success
  // If POST fails on final attempt, throw error
  // If POST fails before final attempt, continue polling
}
```

### Key Changes

1. **POST Fallback Triggers**:
   - After 3 attempts (attempts 3-14): Try POST fallback
   - On final attempt (attempt 15): **ALSO try POST fallback** (NEW)
   - Ensures transaction creation is attempted even if webhook failed

2. **Enhanced Error Handling**:
   - Logs POST request body and response status
   - Handles POST errors gracefully
   - Only throws error on final attempt if POST fails

3. **Better Logging**:
   - Logs POST request body for debugging
   - Logs POST response status and data
   - Logs POST errors with details

## How It Works Now

### Polling Flow

1. **Attempts 1-2**: Poll GET endpoint only (wait for webhook)
2. **Attempts 3-14**: Poll GET, and if no transaction found, **try POST fallback**
3. **Attempt 15**: Poll GET, and if no transaction found, **try POST fallback** (final attempt)

### POST Fallback Behavior

**When POST is attempted**:
- Sends `{ pi: payment_intent, skip_qr: true }` or `{ session_id, skip_qr: true }`
- Calls `/api/event/success/process` POST endpoint
- POST endpoint calls `createTransactionFromPaymentIntent()` if no transaction exists
- Returns transaction data if successful

**Success Path**:
- POST creates transaction → Returns transaction data → Shows QR code → Success!

**Failure Path**:
- POST fails → Logs error → Continues polling (if attempts remain) OR throws error (on final attempt)

## Why This Fixes the Issue

1. **Webhook May Fail**: Even with JWT fix, backend webhook might fail to create transaction
2. **POST Fallback Needed**: Frontend POST fallback ensures transaction is created even if webhook fails
3. **Final Attempt Coverage**: Now POST is attempted even on the final polling attempt (attempt 15)
4. **Better UX**: Users get their tickets even if webhook processing fails

## Expected Behavior After Fix

1. **First 2 attempts**: Poll GET only (wait for webhook)
2. **Attempts 3-15**: Poll GET, then try POST if no transaction found
3. **POST Success**: Transaction created → QR code displayed → Success!
4. **POST Failure (Final)**: Error message shown → User can refresh

## Testing

After deployment, verify:
1. ✅ POST fallback triggers after 3 attempts
2. ✅ POST fallback triggers on final attempt (15)
3. ✅ POST creates transaction successfully
4. ✅ QR code displays after POST success
5. ✅ Error message shows if POST fails on final attempt

## References

- Component: `src/app/event/ticket-qr/TicketQrClient.tsx` (Lines 470-543)
- POST Endpoint: `src/app/api/event/success/process/route.ts` (Lines 86-522)
- Mobile Payment Flow Rule: `.cursor/rules/mobile_payment_flow.mdc`









