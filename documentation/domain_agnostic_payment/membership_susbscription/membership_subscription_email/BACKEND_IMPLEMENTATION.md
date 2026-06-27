# Membership Subscription Email Notification - Backend Implementation

**Generated:** December 6, 2025
**Status:** Implementation Plan

## Overview

This document outlines the backend implementation for membership subscription email notifications. The implementation follows existing patterns from ticket emails to ensure consistency.

## Critical Requirements

- ✅ Follow existing ticket email patterns
- ✅ Use Base64 decoding for emailHostUrlPrefix (same as ticket emails)
- ✅ Support multiple email types (welcome, payment-confirmation, payment-failure, cancellation, updated)
- ✅ Log all emails to `email_log` table
- ✅ Handle errors gracefully without failing webhooks

## Reference Patterns

### Ticket Email Pattern (Reference)
- **Backend Endpoint:** `POST /api/events/{id}/transactions/{transactionId}/emailHostUrlPrefix/{base64}/send-ticket-email`
- **Controller:** `EventTicketTransactionResource.java`
- **Service:** `EmailService.java` - `sendTicketEmail()`
- **Template:** Ticket email HTML template

## Backend Endpoint Structure

**Endpoint Pattern:**
```
POST /api/membership-subscriptions/{id}/emailHostUrlPrefix/{base64EncodedUrlPrefix}/send-email?type={emailType}&to={email}
```

**Parameters:**
- `{id}` - Subscription ID (Long)
- `{base64EncodedUrlPrefix}` - Base64 encoded email host URL prefix (String)
- `type` - Email type: `welcome`, `payment-confirmation`, `payment-failure`, `cancellation`, `updated` (String)
- `to` - Recipient email address (String)

## Implementation Tasks

### 1. Add Email Endpoint to MembershipSubscriptionResource

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\...\web\rest\MembershipSubscriptionResource.java` (ADD NEW METHOD)

```java
/**
 * Send subscription email
 * POST /api/membership-subscriptions/{id}/emailHostUrlPrefix/{emailHostUrlPrefix}/send-email
 *
 * Follows the same pattern as EventTicketTransactionResource.sendTicketEmail()
 */
@PostMapping("/membership-subscriptions/{id}/emailHostUrlPrefix/{emailHostUrlPrefix}/send-email")
public ResponseEntity<Void> sendSubscriptionEmail(
    @PathVariable Long id,
    @PathVariable String emailHostUrlPrefix,
    @RequestParam String type,
    @RequestParam String to
) {
    log.debug("REST request to send subscription email: subscriptionId={}, type={}, to={}", id, type, to);

    // Decode Base64 emailHostUrlPrefix
    String decodedEmailHostUrlPrefix;
    try {
        byte[] decodedBytes = Base64.getDecoder().decode(emailHostUrlPrefix);
        decodedEmailHostUrlPrefix = new String(decodedBytes, StandardCharsets.UTF_8);
    } catch (IllegalArgumentException e) {
        log.error("Failed to decode emailHostUrlPrefix: {}", emailHostUrlPrefix);
        return ResponseEntity.badRequest().build();
    }

    // Find subscription
    MembershipSubscriptionDTO subscription = membershipSubscriptionService.findOne(id)
        .orElseThrow(() -> new BadRequestAlertException(
            "Subscription not found", "membershipSubscription", "notfound"
        ));

    // Find user profile
    UserProfileDTO userProfile = userProfileService.findOne(subscription.getUserProfileId())
        .orElseThrow(() -> new BadRequestAlertException(
            "User profile not found", "userProfile", "notfound"
        ));

    // Find membership plan
    MembershipPlanDTO plan = membershipPlanService.findOne(subscription.getMembershipPlanId())
        .orElseThrow(() -> new BadRequestAlertException(
            "Membership plan not found", "membershipPlan", "notfound"
        ));

    // Send email based on type
    try {
        switch (type) {
            case "welcome":
                emailService.sendSubscriptionWelcomeEmail(
                    userProfile,
                    subscription,
                    plan,
                    decodedEmailHostUrlPrefix
                );
                break;
            case "payment-confirmation":
                emailService.sendSubscriptionPaymentConfirmation(
                    userProfile,
                    subscription,
                    plan,
                    decodedEmailHostUrlPrefix
                );
                break;
            case "payment-failure":
                emailService.sendSubscriptionPaymentFailure(
                    userProfile,
                    subscription,
                    plan,
                    decodedEmailHostUrlPrefix
                );
                break;
            case "cancellation":
                emailService.sendSubscriptionCancellationEmail(
                    userProfile,
                    subscription,
                    plan,
                    decodedEmailHostUrlPrefix
                );
                break;
            case "updated":
                emailService.sendSubscriptionUpdatedEmail(
                    userProfile,
                    subscription,
                    plan,
                    decodedEmailHostUrlPrefix
                );
                break;
            default:
                log.warn("Unknown email type: {}", type);
                return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    } catch (Exception e) {
        log.error("Failed to send subscription email", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

**Key Points:**
- Follows same pattern as `EventTicketTransactionResource.sendTicketEmail()`
- Base64 decodes `emailHostUrlPrefix` from URL path
- Validates subscription, user profile, and plan exist
- Routes to appropriate email service method based on type
- Returns appropriate HTTP status codes

---

### 2. Implement Email Service Methods

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\...\service\EmailService.java` (ADD NEW METHODS)

#### 2.1 Welcome Email Method

```java
/**
 * Send subscription welcome email
 * Similar to sendTicketEmail() but for subscriptions
 */
public void sendSubscriptionWelcomeEmail(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    try {
        // Build email subject
        String subject = String.format("Welcome to %s - Your Subscription is Active", plan.getPlanName());

        // Build email body HTML using template
        String emailBody = buildSubscriptionWelcomeEmailTemplate(
            userProfile,
            subscription,
            plan,
            emailHostUrlPrefix
        );

        // Send email via AWS SES or configured email service
        sendEmail(
            userProfile.getEmail(),
            subject,
            emailBody,
            "SUBSCRIPTION_WELCOME",
            subscription.getTenantId()
        );

        // Log email in email_log table
        logEmailSent(
            subscription.getTenantId(),
            userProfile.getEmail(),
            subject,
            emailBody,
            "SENT",
            "TRANSACTIONAL",
            null,
            Map.of(
                "subscriptionId", String.valueOf(subscription.getId()),
                "emailType", "welcome",
                "membershipPlanId", String.valueOf(plan.getId()),
                "userProfileId", String.valueOf(userProfile.getId())
            )
        );

        log.info("Subscription welcome email sent to: {}", userProfile.getEmail());
    } catch (Exception e) {
        log.error("Failed to send subscription welcome email", e);
        throw new RuntimeException("Failed to send subscription welcome email", e);
    }
}
```

#### 2.2 Payment Confirmation Email Method

```java
/**
 * Send subscription payment confirmation email
 */
public void sendSubscriptionPaymentConfirmation(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    try {
        String subject = String.format("Payment Received - %s Subscription", plan.getPlanName());

        String emailBody = buildSubscriptionPaymentConfirmationTemplate(
            userProfile,
            subscription,
            plan,
            emailHostUrlPrefix
        );

        sendEmail(
            userProfile.getEmail(),
            subject,
            emailBody,
            "SUBSCRIPTION_PAYMENT_CONFIRMATION",
            subscription.getTenantId()
        );

        logEmailSent(
            subscription.getTenantId(),
            userProfile.getEmail(),
            subject,
            emailBody,
            "SENT",
            "TRANSACTIONAL",
            null,
            Map.of(
                "subscriptionId", String.valueOf(subscription.getId()),
                "emailType", "payment-confirmation",
                "membershipPlanId", String.valueOf(plan.getId()),
                "userProfileId", String.valueOf(userProfile.getId())
            )
        );

        log.info("Subscription payment confirmation email sent to: {}", userProfile.getEmail());
    } catch (Exception e) {
        log.error("Failed to send subscription payment confirmation email", e);
        throw new RuntimeException("Failed to send subscription payment confirmation email", e);
    }
}
```

#### 2.3 Payment Failure Email Method

```java
/**
 * Send subscription payment failure email
 */
public void sendSubscriptionPaymentFailure(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    try {
        String subject = String.format("Payment Failed - Action Required for %s", plan.getPlanName());

        String emailBody = buildSubscriptionPaymentFailureTemplate(
            userProfile,
            subscription,
            plan,
            emailHostUrlPrefix
        );

        sendEmail(
            userProfile.getEmail(),
            subject,
            emailBody,
            "SUBSCRIPTION_PAYMENT_FAILURE",
            subscription.getTenantId()
        );

        logEmailSent(
            subscription.getTenantId(),
            userProfile.getEmail(),
            subject,
            emailBody,
            "SENT",
            "TRANSACTIONAL",
            null,
            Map.of(
                "subscriptionId", String.valueOf(subscription.getId()),
                "emailType", "payment-failure",
                "membershipPlanId", String.valueOf(plan.getId()),
                "userProfileId", String.valueOf(userProfile.getId())
            )
        );

        log.info("Subscription payment failure email sent to: {}", userProfile.getEmail());
    } catch (Exception e) {
        log.error("Failed to send subscription payment failure email", e);
        throw new RuntimeException("Failed to send subscription payment failure email", e);
    }
}
```

#### 2.4 Cancellation Email Method

```java
/**
 * Send subscription cancellation email
 */
public void sendSubscriptionCancellationEmail(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    try {
        String subject = String.format("Subscription Cancelled - %s", plan.getPlanName());

        String emailBody = buildSubscriptionCancellationTemplate(
            userProfile,
            subscription,
            plan,
            emailHostUrlPrefix
        );

        sendEmail(
            userProfile.getEmail(),
            subject,
            emailBody,
            "SUBSCRIPTION_CANCELLATION",
            subscription.getTenantId()
        );

        logEmailSent(
            subscription.getTenantId(),
            userProfile.getEmail(),
            subject,
            emailBody,
            "SENT",
            "TRANSACTIONAL",
            null,
            Map.of(
                "subscriptionId", String.valueOf(subscription.getId()),
                "emailType", "cancellation",
                "membershipPlanId", String.valueOf(plan.getId()),
                "userProfileId", String.valueOf(userProfile.getId())
            )
        );

        log.info("Subscription cancellation email sent to: {}", userProfile.getEmail());
    } catch (Exception e) {
        log.error("Failed to send subscription cancellation email", e);
        throw new RuntimeException("Failed to send subscription cancellation email", e);
    }
}
```

#### 2.5 Updated Email Method

```java
/**
 * Send subscription updated email (for plan upgrades/downgrades)
 */
public void sendSubscriptionUpdatedEmail(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    try {
        String subject = String.format("Subscription Updated - %s", plan.getPlanName());

        String emailBody = buildSubscriptionUpdatedTemplate(
            userProfile,
            subscription,
            plan,
            emailHostUrlPrefix
        );

        sendEmail(
            userProfile.getEmail(),
            subject,
            emailBody,
            "SUBSCRIPTION_UPDATED",
            subscription.getTenantId()
        );

        logEmailSent(
            subscription.getTenantId(),
            userProfile.getEmail(),
            subject,
            emailBody,
            "SENT",
            "TRANSACTIONAL",
            null,
            Map.of(
                "subscriptionId", String.valueOf(subscription.getId()),
                "emailType", "updated",
                "membershipPlanId", String.valueOf(plan.getId()),
                "userProfileId", String.valueOf(userProfile.getId())
            )
        );

        log.info("Subscription updated email sent to: {}", userProfile.getEmail());
    } catch (Exception e) {
        log.error("Failed to send subscription updated email", e);
        throw new RuntimeException("Failed to send subscription updated email", e);
    }
}
```

---

### 3. Implement Email Template Builders

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\...\service\EmailService.java` (ADD NEW METHODS)

#### 3.1 Welcome Email Template Builder

```java
/**
 * Build subscription welcome email HTML template
 * Similar to buildTicketEmailTemplate() but for subscriptions
 */
private String buildSubscriptionWelcomeEmailTemplate(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    // Use Thymeleaf or similar template engine
    // Include:
    // - Tenant branding (logo, colors)
    // - User name
    // - Plan details
    // - Billing information
    // - Period dates
    // - Manage subscription link
    // - Support contact

    return emailTemplateService.renderTemplate(
        "subscription-welcome",
        Map.of(
            "userName", userProfile.getFirstName() + " " + userProfile.getLastName(),
            "planName", plan.getPlanName(),
            "planDescription", plan.getDescription(),
            "billingAmount", plan.getPrice(),
            "currency", plan.getCurrency(),
            "periodStart", subscription.getCurrentPeriodStart(),
            "periodEnd", subscription.getCurrentPeriodEnd(),
            "nextBillingDate", subscription.getCurrentPeriodEnd(),
            "billingInterval", plan.getBillingInterval(),
            "manageSubscriptionUrl", emailHostUrlPrefix + "/membership/manage",
            "supportEmail", getTenantSupportEmail(subscription.getTenantId()),
            "tenantLogo", getTenantLogoUrl(subscription.getTenantId())
        )
    );
}
```

#### 3.2 Payment Confirmation Template Builder

```java
private String buildSubscriptionPaymentConfirmationTemplate(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    return emailTemplateService.renderTemplate(
        "subscription-payment-confirmation",
        Map.of(
            "userName", userProfile.getFirstName() + " " + userProfile.getLastName(),
            "planName", plan.getPlanName(),
            "paymentAmount", plan.getPrice(),
            "currency", plan.getCurrency(),
            "paymentDate", LocalDate.now(),
            "periodStart", subscription.getCurrentPeriodStart(),
            "periodEnd", subscription.getCurrentPeriodEnd(),
            "nextBillingDate", subscription.getCurrentPeriodEnd(),
            "receiptUrl", emailHostUrlPrefix + "/membership/receipt/" + subscription.getId(),
            "manageSubscriptionUrl", emailHostUrlPrefix + "/membership/manage",
            "supportEmail", getTenantSupportEmail(subscription.getTenantId()),
            "tenantLogo", getTenantLogoUrl(subscription.getTenantId())
        )
    );
}
```

#### 3.3 Payment Failure Template Builder

```java
private String buildSubscriptionPaymentFailureTemplate(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    return emailTemplateService.renderTemplate(
        "subscription-payment-failure",
        Map.of(
            "userName", userProfile.getFirstName() + " " + userProfile.getLastName(),
            "planName", plan.getPlanName(),
            "amountDue", plan.getPrice(),
            "currency", plan.getCurrency(),
            "updatePaymentMethodUrl", emailHostUrlPrefix + "/membership/manage/payment",
            "retryPaymentUrl", emailHostUrlPrefix + "/membership/manage/retry-payment",
            "supportEmail", getTenantSupportEmail(subscription.getTenantId()),
            "tenantLogo", getTenantLogoUrl(subscription.getTenantId())
        )
    );
}
```

#### 3.4 Cancellation Template Builder

```java
private String buildSubscriptionCancellationTemplate(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    return emailTemplateService.renderTemplate(
        "subscription-cancellation",
        Map.of(
            "userName", userProfile.getFirstName() + " " + userProfile.getLastName(),
            "planName", plan.getPlanName(),
            "accessUntilDate", subscription.getCurrentPeriodEnd(),
            "reactivateUrl", emailHostUrlPrefix + "/membership/reactivate",
            "supportEmail", getTenantSupportEmail(subscription.getTenantId()),
            "tenantLogo", getTenantLogoUrl(subscription.getTenantId())
        )
    );
}
```

#### 3.5 Updated Template Builder

```java
private String buildSubscriptionUpdatedTemplate(
    UserProfileDTO userProfile,
    MembershipSubscriptionDTO subscription,
    MembershipPlanDTO plan,
    String emailHostUrlPrefix
) {
    return emailTemplateService.renderTemplate(
        "subscription-updated",
        Map.of(
            "userName", userProfile.getFirstName() + " " + userProfile.getLastName(),
            "planName", plan.getPlanName(),
            "planDescription", plan.getDescription(),
            "billingAmount", plan.getPrice(),
            "currency", plan.getCurrency(),
            "effectiveDate", LocalDate.now(),
            "manageSubscriptionUrl", emailHostUrlPrefix + "/membership/manage",
            "supportEmail", getTenantSupportEmail(subscription.getTenantId()),
            "tenantLogo", getTenantLogoUrl(subscription.getTenantId())
        )
    );
}
```

---

### 4. Update Stripe Webhook Handler

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\...\webhook\StripeWebhookHandler.java` (MODIFY EXISTING)

#### 4.1 Handle Invoice Payment Succeeded

```java
/**
 * Handle invoice.payment_succeeded webhook for subscription recurring payments
 * ADD THIS METHOD to existing webhook handler
 */
private void handleInvoicePaymentSucceeded(Invoice invoice) {
    String stripeSubscriptionId = invoice.getSubscription();

    // Find subscription by Stripe subscription ID
    MembershipSubscription subscription = membershipSubscriptionRepository
        .findByStripeSubscriptionId(stripeSubscriptionId)
        .orElse(null);

    if (subscription == null) {
        log.warn("Subscription not found for Stripe subscription: {}", stripeSubscriptionId);
        return;
    }

    // Update period dates (existing logic)
    // ... update subscription dates ...

    // Send payment confirmation email
    try {
        UserProfile userProfile = userProfileRepository.findById(subscription.getUserProfileId())
            .orElse(null);
        MembershipPlan plan = membershipPlanRepository.findById(subscription.getMembershipPlanId())
            .orElse(null);

        if (userProfile != null && plan != null) {
            String emailHostUrlPrefix = getEmailHostUrlPrefix(); // Get from config

            emailService.sendSubscriptionPaymentConfirmation(
                userProfileMapper.toDto(userProfile),
                membershipSubscriptionMapper.toDto(subscription),
                membershipPlanMapper.toDto(plan),
                emailHostUrlPrefix
            );

            log.info("Payment confirmation email sent for subscription: {}", subscription.getId());
        }
    } catch (Exception e) {
        log.error("Failed to send payment confirmation email", e);
        // Don't fail webhook if email fails
    }
}
```

#### 4.2 Handle Invoice Payment Failed

```java
/**
 * Handle invoice.payment_failed webhook
 * ADD THIS METHOD to existing webhook handler
 */
private void handleInvoicePaymentFailed(Invoice invoice) {
    String stripeSubscriptionId = invoice.getSubscription();

    MembershipSubscription subscription = membershipSubscriptionRepository
        .findByStripeSubscriptionId(stripeSubscriptionId)
        .orElse(null);

    if (subscription == null) {
        return;
    }

    // Update status to PAST_DUE (existing logic)
    // ... update subscription status ...

    // Send payment failure email
    try {
        UserProfile userProfile = userProfileRepository.findById(subscription.getUserProfileId())
            .orElse(null);
        MembershipPlan plan = membershipPlanRepository.findById(subscription.getMembershipPlanId())
            .orElse(null);

        if (userProfile != null && plan != null) {
            String emailHostUrlPrefix = getEmailHostUrlPrefix();

            emailService.sendSubscriptionPaymentFailure(
                userProfileMapper.toDto(userProfile),
                membershipSubscriptionMapper.toDto(subscription),
                membershipPlanMapper.toDto(plan),
                emailHostUrlPrefix
            );

            log.info("Payment failure email sent for subscription: {}", subscription.getId());
        }
    } catch (Exception e) {
        log.error("Failed to send payment failure email", e);
        // Don't fail webhook if email fails
    }
}
```

---

## Email Template Design

### Template Files Required

1. `subscription-welcome.html`
2. `subscription-payment-confirmation.html`
3. `subscription-payment-failure.html`
4. `subscription-cancellation.html`
5. `subscription-updated.html`

### Template Location

**Backend templates directory** (similar to ticket email templates)

### Template Engine

**Thymeleaf or similar** (match existing ticket email template system)

### Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{userName}}` | UserProfile.firstName + lastName | "John Doe" |
| `{{planName}}` | MembershipPlan.planName | "Premium Plan" |
| `{{billingAmount}}` | MembershipPlan.price | 29.99 |
| `{{currency}}` | MembershipPlan.currency | "USD" |
| `{{periodStart}}` | MembershipSubscription.currentPeriodStart | "2025-12-05" |
| `{{periodEnd}}` | MembershipSubscription.currentPeriodEnd | "2026-01-04" |
| `{{nextBillingDate}}` | MembershipSubscription.currentPeriodEnd | "2026-01-04" |
| `{{billingInterval}}` | MembershipPlan.billingInterval | "MONTHLY" |
| `{{manageSubscriptionUrl}}` | emailHostUrlPrefix + "/membership/manage" | "https://example.com/membership/manage" |
| `{{tenantLogo}}` | TenantSettings.logoUrl | "https://example.com/logo.png" |
| `{{supportEmail}}` | TenantSettings.supportEmail | "support@example.com" |

### Template Design Guidelines

- ✅ Use same HTML structure and CSS styling as ticket emails
- ✅ Include tenant branding (logo, colors)
- ✅ Responsive design for mobile and desktop
- ✅ Clear call-to-action buttons
- ✅ Footer with support information

**Key Sections:**
1. **Header:** Tenant logo and branding
2. **Greeting:** Personalized message
3. **Main Content:** Subscription details, billing info
4. **Action Buttons:** Manage subscription, update payment method
5. **Footer:** Support contact, unsubscribe link

---

## Database Considerations

### Email Logging

**Use Existing Table:** `email_log` table (already exists in schema)

**Table Structure:**
```sql
CREATE TABLE email_log (
    id bigint PRIMARY KEY,
    tenant_id varchar(255) NOT NULL,
    recipient_email varchar(255) NOT NULL,
    subject varchar(255),
    body VARCHAR(32768),
    sent_at timestamp NOT NULL,
    status varchar(50), -- SENT, FAILED, etc.
    type varchar(50), -- TRANSACTIONAL, BULK
    campaign_id bigint,
    metadata VARCHAR(8192) -- JSON with subscriptionId, emailType, etc.
);
```

**Metadata JSON Structure:**
```json
{
  "subscriptionId": 7453,
  "emailType": "welcome",
  "membershipPlanId": 4051,
  "userProfileId": 4651
}
```

**No Schema Changes Required:** The existing `email_log` table is sufficient for logging subscription emails.

---

## Integration Points

### Backend Integration Points

| Location | Action | Email Type | Trigger |
|----------|--------|------------|---------|
| `StripeWebhookHandler.java` | Send payment confirmation | `payment-confirmation` | `invoice.payment_succeeded` webhook |
| `StripeWebhookHandler.java` | Send payment failure | `payment-failure` | `invoice.payment_failed` webhook |
| `StripeWebhookHandler.java` | Send cancellation email | `cancellation` | `customer.subscription.deleted` webhook |
| `MembershipSubscriptionResource.java` | Send updated email | `updated` | After plan upgrade/downgrade |

---

## Error Handling

### Email Service Failures
- ✅ **Webhook Processing:** Don't fail webhook if email sending fails
- ✅ **Logging:** Log all email failures with details
- ⏳ **Retry:** Consider implementing retry logic for transient failures
- ✅ **Fallback:** Log to database even if email sending fails

### Missing Data
- ✅ **User Profile:** Skip email if user profile not found
- ✅ **Email Address:** Skip email if user email is missing or invalid
- ✅ **Subscription:** Return 404 if subscription not found

---

## Security Considerations

- ✅ **Tenant Isolation:** Ensure emails only sent to users in correct tenant
- ✅ **Email Validation:** Validate email addresses before sending
- ⏳ **Rate Limiting:** Consider rate limiting for email endpoints
- ✅ **Template Sanitization:** Sanitize user data in email templates
- ✅ **Authentication:** Email endpoints require JWT authentication
- ⏳ **SPF/DKIM:** Configure email authentication (backend responsibility)

---

## Performance Considerations

- ✅ **Asynchronous:** Send emails asynchronously (non-blocking)
- ⏳ **Queue System:** Consider using email queue for high volume (future)
- ⏳ **Batch Processing:** For bulk operations, use batch email sending
- ⏳ **Caching:** Cache tenant settings and templates
- ⏳ **Database:** Use async logging for email_log entries

---

## Implementation Checklist

### Backend Implementation

- [ ] Add email endpoint to `MembershipSubscriptionResource.java`
- [ ] Implement `sendSubscriptionWelcomeEmail()` in `EmailService.java`
- [ ] Implement `sendSubscriptionPaymentConfirmation()` in `EmailService.java`
- [ ] Implement `sendSubscriptionPaymentFailure()` in `EmailService.java`
- [ ] Implement `sendSubscriptionCancellationEmail()` in `EmailService.java`
- [ ] Implement `sendSubscriptionUpdatedEmail()` in `EmailService.java`
- [ ] Create email template files (HTML)
- [ ] Add template rendering logic
- [ ] Update `StripeWebhookHandler.java` to send emails on webhook events
- [ ] Add email logging to `email_log` table
- [ ] Test email delivery
- [ ] Verify tenant branding in emails

---

## Testing Requirements

- [ ] Test welcome email after subscription creation
- [ ] Test payment confirmation email via webhook
- [ ] Test payment failure email via webhook
- [ ] Test cancellation email
- [ ] Test email template rendering
- [ ] Test email logging
- [ ] Test email delivery in production
- [ ] Verify email links work correctly
- [ ] Test email rendering in different email clients

---

## Comparison with Existing Patterns

### Ticket Email vs Subscription Email

| Aspect | Ticket Email | Subscription Email |
|--------|--------------|-------------------|
| Backend Endpoint | `/api/events/{id}/transactions/{id}/emailHostUrlPrefix/{base64}/send-ticket-email` | `/api/membership-subscriptions/{id}/emailHostUrlPrefix/{base64}/send-email` |
| Email Host Prefix | Base64 encoded in URL path | Base64 encoded in URL path (same pattern) |
| Email Type | Single type (ticket confirmation) | Multiple types (welcome, payment-confirmation, etc.) |
| Query Parameters | `?to={email}` | `?to={email}&type={emailType}` |
| Trigger Location | Success page after QR code display | Success page + Webhook handlers |

---

## Notes

- This implementation follows all existing patterns in the codebase
- Subscription emails integrate seamlessly without breaking existing ticket email functionality
- All code examples follow patterns established in backend Java codebase
- Email sending is non-blocking and failures don't affect subscription operations
- Webhook email sending doesn't fail webhook processing if email fails

