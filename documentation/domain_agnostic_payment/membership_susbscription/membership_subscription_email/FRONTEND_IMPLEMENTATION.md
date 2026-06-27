# Membership Subscription Email Notification - Frontend Implementation

**Generated:** December 6, 2025
**Status:** Implementation Plan

## Overview

This document outlines the frontend implementation for membership subscription email notifications. The implementation follows existing patterns from ticket emails and promotional emails to ensure consistency.

## Critical Requirements

- ✅ Follow existing email patterns (ticket emails and promotional emails)
- ✅ Use Base64 encoding for emailHostUrlPrefix (same as ticket emails)
- ✅ Non-blocking email sending (don't block UI)
- ✅ Prevent duplicate emails using sessionStorage
- ✅ Handle errors gracefully without breaking subscription flow

## Reference Patterns

### Ticket Email Pattern (Reference)
- **Frontend Utility:** `src/lib/emailUtils.ts`
- **Proxy Handler:** `src/pages/api/proxy/events/[id]/transactions/[transactionId]/send-ticket-email.ts`
- **Trigger:** `src/app/event/success/PaymentSuccessClient.tsx`

### Promotional Email Pattern (Reference)
- **Server Action:** `src/app/admin/promotion-emails/serverActions.ts`
- **Proxy Handler:** `src/pages/api/proxy/send-promotion-emails/index.ts`

## Implementation Tasks

### 1. Create Subscription Email Utility

**File:** `src/lib/subscriptionEmailUtils.ts` (NEW FILE)

```typescript
/**
 * Utility functions for sending subscription emails
 * Follows the same pattern as ticket emails (src/lib/emailUtils.ts)
 */

export interface SendSubscriptionEmailParams {
  subscriptionId: number;
  email: string;
  emailType: 'welcome' | 'payment-confirmation' | 'payment-failure' | 'cancellation' | 'updated';
  emailHostUrlPrefix?: string;
}

/**
 * Sends a subscription email for a completed subscription
 * Similar to sendTicketEmail() but for subscriptions
 */
export async function sendSubscriptionEmail({
  subscriptionId,
  email,
  emailType,
  emailHostUrlPrefix
}: SendSubscriptionEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current domain for email context if not provided
    const hostUrlPrefix = emailHostUrlPrefix ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    // Validate that we have a valid host URL prefix
    if (!hostUrlPrefix) {
      console.error('[SUBSCRIPTION EMAIL UTILS] No emailHostUrlPrefix provided');
      return {
        success: false,
        error: 'Email host URL prefix is required for proper email context'
      };
    }

    console.log('[SUBSCRIPTION EMAIL UTILS] Sending subscription email:', {
      subscriptionId,
      email,
      emailType,
      hostUrlPrefix
    });

    const response = await fetch(
      `/api/proxy/membership-subscriptions/${subscriptionId}/send-email?to=${encodeURIComponent(email)}&type=${emailType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-email-host-url-prefix': hostUrlPrefix
        },
      }
    );

    if (response.ok) {
      console.log('[SUBSCRIPTION EMAIL UTILS] Subscription email sent successfully');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('[SUBSCRIPTION EMAIL UTILS] Failed to send email:', response.status, errorText);
      return {
        success: false,
        error: `Failed to send email: ${response.status} - ${errorText}`
      };
    }
  } catch (error: any) {
    console.error('[SUBSCRIPTION EMAIL UTILS] Exception sending email:', error);
    return {
      success: false,
      error: `Email sending failed: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Sends subscription email asynchronously without blocking the UI
 * Similar to sendTicketEmailAsync() pattern
 */
export function sendSubscriptionEmailAsync(params: SendSubscriptionEmailParams): void {
  // Send email in background without blocking
  sendSubscriptionEmail(params).then(result => {
    if (result.success) {
      console.log('[SUBSCRIPTION EMAIL UTILS] Background email sent successfully');
    } else {
      console.warn('[SUBSCRIPTION EMAIL UTILS] Background email failed:', result.error);
    }
  }).catch(error => {
    console.error('[SUBSCRIPTION EMAIL UTILS] Background email exception:', error);
  });
}
```

**Key Points:**
- Follows same pattern as `sendTicketEmail()` and `sendTicketEmailAsync()`
- Uses `x-email-host-url-prefix` header
- Non-blocking async function
- Proper error handling

---

### 2. Create Proxy Handler for Subscription Emails

**File:** `src/pages/api/proxy/membership-subscriptions/[id]/send-email.ts` (NEW FILE)

```typescript
import { createProxyHandler } from '@/lib/proxyHandler';
import { getEmailHostUrlPrefix } from '@/lib/env';

// Custom handler for subscription email sending
// Follows the same pattern as send-ticket-email.ts
export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const { type } = req.query; // email type: welcome, payment-confirmation, etc.

  // Get emailHostUrlPrefix from request headers or use default
  const emailHostUrlPrefix = req.headers['x-email-host-url-prefix'] as string ||
                           getEmailHostUrlPrefix();

  // Validate that we have a valid host URL prefix
  if (!emailHostUrlPrefix) {
    console.error('[Send Subscription Email Proxy] No emailHostUrlPrefix available');
    return res.status(400).json({
      error: 'Email host URL prefix is required for proper email context',
      details: 'Please ensure NEXT_PUBLIC_APP_URL is set in environment variables or pass x-email-host-url-prefix header'
    });
  }

  // Use Base64 encoding like the working ticket email endpoint
  const encodedEmailHostUrlPrefix = Buffer.from(emailHostUrlPrefix).toString('base64');

  // Create a custom backend path that includes the Base64-encoded emailHostUrlPrefix
  const customBackendPath = `/api/membership-subscriptions/${id}/emailHostUrlPrefix/${encodedEmailHostUrlPrefix}/send-email?type=${type}`;

  console.log('[Send Subscription Email Proxy] Using Base64 encoding:', {
    subscriptionId: id,
    emailType: type,
    emailHostUrlPrefix: emailHostUrlPrefix,
    encodedBase64: encodedEmailHostUrlPrefix,
    backendPath: customBackendPath
  });

  // Use the shared proxy handler with the custom backend path
  const proxyHandler = createProxyHandler({
    backendPath: customBackendPath,
    allowedMethods: ['POST'],
    injectTenantId: false  // Don't inject tenant ID as it's in the subscription record
  });

  return proxyHandler(req, res);
}
```

**Key Points:**
- Follows same pattern as `send-ticket-email.ts`
- Base64 encodes `emailHostUrlPrefix` in URL path
- Uses `createProxyHandler()` for consistency
- Extracts email type from query parameters

---

### 3. Update Membership Success Page

**File:** `src/app/membership/success/MembershipSuccessClient.tsx` (MODIFY EXISTING)

**Changes Required:**

1. **Add import at top:**
```typescript
import { sendSubscriptionEmailAsync } from '@/lib/subscriptionEmailUtils';
```

2. **Add email sending effect after subscription is successfully created:**
```typescript
// Add email sending effect after subscription is successfully created
useEffect(() => {
  // Only send email if:
  // 1. Subscription is successfully created
  // 2. We have user profile with email
  // 3. Email hasn't been sent yet (check sessionStorage to prevent duplicates)
  if (
    subscriptionDetails?.subscription?.id &&
    subscriptionDetails?.userProfile?.email &&
    typeof window !== 'undefined'
  ) {
    // Check if email already sent (prevent duplicate sends on page refresh)
    const emailSentKey = `subscription_email_sent_${subscriptionDetails.subscription.id}`;
    if (sessionStorage.getItem(emailSentKey)) {
      console.log('[MEMBERSHIP-SUCCESS] Welcome email already sent, skipping');
      return;
    }

    // Mark as sent BEFORE sending to prevent race conditions
    sessionStorage.setItem(emailSentKey, 'true');

    console.log('[MEMBERSHIP-SUCCESS] Sending welcome email:', {
      subscriptionId: subscriptionDetails.subscription.id,
      email: subscriptionDetails.userProfile.email
    });

    // Send welcome email asynchronously (non-blocking)
    sendSubscriptionEmailAsync({
      subscriptionId: subscriptionDetails.subscription.id,
      email: subscriptionDetails.userProfile.email,
      emailType: 'welcome'
    });
  }
}, [subscriptionDetails?.subscription?.id, subscriptionDetails?.userProfile?.email]);
```

**Key Points:**
- Uses `sessionStorage` to prevent duplicate emails (same pattern as ticket emails)
- Non-blocking email sending
- Only sends if subscription and email are available
- Prevents race conditions by marking as sent before sending

---

### 4. Update Subscription Cancellation Flow

**File:** `src/app/admin/membership/subscriptions/ApiServerActions.ts` (MODIFY EXISTING)

**Add new function:**

```typescript
// Add import at top
import { getAppUrl, getEmailHostUrlPrefix } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

// Add new function after cancelUserSubscriptionServer()
export async function sendSubscriptionCancellationEmailServer(
  subscriptionId: number,
  userEmail: string
): Promise<{ success: boolean }> {
  const baseUrl = getAppUrl();
  const emailHostUrlPrefix = getEmailHostUrlPrefix();

  // Base64 encode emailHostUrlPrefix
  const encodedEmailHostUrlPrefix = Buffer.from(emailHostUrlPrefix).toString('base64');

  const url = `${baseUrl}/api/proxy/membership-subscriptions/${subscriptionId}/send-email?to=${encodeURIComponent(userEmail)}&type=cancellation`;

  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-email-host-url-prefix': emailHostUrlPrefix
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to send cancellation email:', res.status);
    return { success: false };
  }

  return { success: true };
}
```

**File:** `src/app/admin/membership/subscriptions/AdminSubscriptionsClient.tsx` (MODIFY EXISTING)

**Update handleCancelConfirm function:**

```typescript
// Update handleCancelConfirm function to send email after cancellation
const handleCancelConfirm = async () => {
  if (!cancelSubscriptionId) return;

  try {
    setIsLoading(cancelSubscriptionId);
    setCancelError(null);

    // Cancel subscription
    const cancelledSubscription = await cancelUserSubscriptionServer(cancelSubscriptionId);

    // Send cancellation email
    if (cancelledSubscription.userProfile?.email) {
      try {
        await sendSubscriptionCancellationEmailServer(
          cancelSubscriptionId,
          cancelledSubscription.userProfile.email
        );
      } catch (emailError) {
        // Log but don't fail the cancellation if email fails
        console.warn('Failed to send cancellation email:', emailError);
      }
    }

    setCancelSuccess(true);
    setTimeout(() => {
      setShowCancelModal(false);
      setCancelSubscriptionId(null);
      setCancelSuccess(false);
      router.refresh();
    }, 1500);
  } catch (err) {
    setCancelError(err instanceof Error ? err.message : 'Failed to cancel subscription');
  } finally {
    setIsLoading(null);
  }
};
```

**Key Points:**
- Email sending doesn't block cancellation
- Errors are logged but don't fail the operation
- Uses server action pattern for authenticated calls

---

## Integration Points

### Frontend Integration Points

| Location | Action | Email Type | Trigger |
|----------|--------|------------|---------|
| `src/app/membership/success/MembershipSuccessClient.tsx` | Send welcome email | `welcome` | After subscription creation |
| `src/app/admin/membership/subscriptions/AdminSubscriptionsClient.tsx` | Send cancellation email | `cancellation` | After admin cancels subscription |
| `src/app/membership/manage/page.tsx` (future) | Send cancellation email | `cancellation` | After user cancels subscription |

---

## Email Types Supported

1. **welcome** - Sent after successful subscription creation
2. **payment-confirmation** - Sent after recurring payment succeeds (webhook)
3. **payment-failure** - Sent after recurring payment fails (webhook)
4. **cancellation** - Sent after subscription cancellation
5. **updated** - Sent after plan upgrade/downgrade (future)

---

## Error Handling

### Email Sending Failures
- ✅ **Non-blocking:** Email failures should not block subscription creation or cancellation
- ✅ **Logging:** Log errors to console for debugging
- ✅ **User Feedback:** Don't show error to user if email fails (subscription still succeeds)
- ⏳ **Retry Logic:** Consider adding retry logic for failed emails (future enhancement)

### Duplicate Email Prevention
- ✅ **SessionStorage:** Use sessionStorage to track sent emails (like ticket emails)
- ✅ **Key Format:** `subscription_email_sent_{subscriptionId}`
- ✅ **Persistence:** Persists across page refreshes

---

## Testing Checklist

- [ ] Test welcome email after subscription creation
- [ ] Test cancellation email after admin cancellation
- [ ] Verify duplicate email prevention (sessionStorage)
- [ ] Test email sending from frontend
- [ ] Verify error handling doesn't break subscription flow
- [ ] Test email sending with missing emailHostUrlPrefix
- [ ] Test email sending with invalid subscription ID
- [ ] Verify email links work correctly

---

## Comparison with Existing Patterns

### Ticket Email vs Subscription Email

| Aspect | Ticket Email | Subscription Email |
|--------|--------------|-------------------|
| Frontend Utility | `src/lib/emailUtils.ts` | `src/lib/subscriptionEmailUtils.ts` (NEW) |
| Proxy Handler | `src/pages/api/proxy/events/[id]/transactions/[transactionId]/send-ticket-email.ts` | `src/pages/api/proxy/membership-subscriptions/[id]/send-email.ts` (NEW) |
| Backend Endpoint | `/api/events/{id}/transactions/{id}/emailHostUrlPrefix/{base64}/send-ticket-email` | `/api/membership-subscriptions/{id}/emailHostUrlPrefix/{base64}/send-email` |
| Email Host Prefix | Base64 encoded in URL path | Base64 encoded in URL path (same pattern) |
| Email Type | Single type (ticket confirmation) | Multiple types (welcome, payment-confirmation, etc.) |
| Query Parameters | `?to={email}` | `?to={email}&type={emailType}` |
| Trigger Location | Success page after QR code display | Success page + Webhook handlers |

---

## Implementation Checklist

### Frontend Implementation

- [x] Create `src/lib/subscriptionEmailUtils.ts` with email utility functions
- [x] Create `src/pages/api/proxy/membership-subscriptions/[id]/send-email.ts` proxy handler
- [ ] Update `src/app/membership/success/MembershipSuccessClient.tsx` to send welcome email
- [ ] Update `src/app/admin/membership/subscriptions/ApiServerActions.ts` to add cancellation email function
- [ ] Update `src/app/admin/membership/subscriptions/AdminSubscriptionsClient.tsx` to send cancellation email
- [ ] Add email sending to user subscription management page (future)
- [ ] Test email sending from frontend
- [ ] Verify duplicate email prevention (sessionStorage)

---

## Security Considerations

- ✅ **Authentication:** Email endpoints require JWT authentication via proxy handler
- ✅ **Tenant Isolation:** Tenant ID is automatically handled by backend
- ✅ **Email Validation:** Backend validates email addresses
- ✅ **Rate Limiting:** Consider rate limiting for email endpoints (future)

---

## Performance Considerations

- ✅ **Asynchronous:** Send emails asynchronously (non-blocking)
- ✅ **Background Processing:** Email sending doesn't block UI
- ✅ **Error Handling:** Failures don't affect subscription operations

---

## Notes

- This implementation follows all existing patterns in the codebase
- Subscription emails integrate seamlessly without breaking existing ticket email or promotional email functionality
- All code examples follow patterns established in `nextjs_api_routes.mdc` and project standards
- Email sending is non-blocking and failures don't affect subscription operations

