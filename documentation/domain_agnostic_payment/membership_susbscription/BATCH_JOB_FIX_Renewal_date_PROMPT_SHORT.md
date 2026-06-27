# Quick Fix Prompt for Backend Batch Job Team

## Problem

Batch job misses subscriptions for renewal because it only checks database `current_period_end`, not Stripe's actual dates. When Stripe dates are advanced (testing/expediting), database may not be updated immediately.

**Current Query**:
```sql
WHERE current_period_end <= CURRENT_DATE + INTERVAL '7 days'
```

**Issue**: Subscription has database date `2026-01-25` (22 days away) but Stripe date `2026-01-03` (7 days away). Batch job skips it.

## Solution

Modify batch job to check Stripe dates for subscriptions with `stripe_subscription_id`.

### 1. Update Query

```java
.sql("SELECT * FROM membership_subscription " +
     "WHERE subscription_status IN ('ACTIVE', 'TRIAL') " +
     "AND cancel_at_period_end = false " +
     "AND (" +
     "  current_period_end <= CURRENT_DATE + INTERVAL '7 days' " + // Database check
     "  OR stripe_subscription_id IS NOT NULL" + // Will check Stripe in processor
     ") " +
     "ORDER BY current_period_end ASC")
```

### 2. Update Processor

In `SubscriptionRenewalProcessor.process()`:

```java
if (subscription.getStripeSubscriptionId() != null) {
    // Fetch from Stripe
    Subscription stripeSub = stripeService.retrieveSubscription(
        subscription.getStripeSubscriptionId()
    );

    // Check Stripe's current_period_end
    Date stripePeriodEnd = new Date(stripeSub.getCurrentPeriodEnd() * 1000);
    Date renewalWindow = addDays(new Date(), 7);

    if (stripePeriodEnd.before(renewalWindow)) {
        // Update database dates from Stripe
        subscription.setCurrentPeriodStart(
            new Date(stripeSub.getCurrentPeriodStart() * 1000)
        );
        subscription.setCurrentPeriodEnd(stripePeriodEnd);
        return subscription; // Process it
    }
    return null; // Skip - not within window
}
// Existing logic for subscriptions without Stripe ID
```

## Testing

1. Expedite Stripe subscription: `expedite-stripe-renewal.js --subscription-id=sub_xxx`
2. Run batch job: Should find subscription even if database date is old
3. Verify: Database dates updated from Stripe during processing

## Benefits

- Finds subscriptions even when database is out of sync
- Self-healing: Updates database dates during processing
- Backward compatible: Still works for subscriptions without Stripe ID

See `BATCH_JOB_FIX_PROMPT.md` for detailed implementation guide.

