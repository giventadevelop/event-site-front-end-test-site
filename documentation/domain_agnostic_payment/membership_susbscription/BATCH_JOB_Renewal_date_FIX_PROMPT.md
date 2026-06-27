# Batch Job Fix: Check Stripe Dates for Subscription Renewal

## Problem Statement

The subscription renewal batch job currently only queries subscriptions based on the database `current_period_end` field:

```sql
WHERE current_period_end <= CURRENT_DATE + INTERVAL '7 days'
```

**Issue**: When Stripe subscription dates are advanced (via expedite scripts or manual Stripe operations), the database may not be immediately updated. This causes the batch job to miss subscriptions that need renewal processing because:

1. Stripe subscription `current_period_end` has been advanced (e.g., within 7 days)
2. Database `current_period_end` still has the old date (e.g., 22 days away)
3. Batch job query filters out the subscription because database date is too far in the future
4. Result: "No subscriptions found for renewal processing"

## Current Implementation

**Location**: `E:\project_workspace\event-site-manager-batch-jobs`

**Current Query** (from `SubscriptionRenewalBatchJobConfig.java`):
```java
.sql("SELECT * FROM membership_subscription " +
     "WHERE subscription_status IN ('ACTIVE', 'TRIAL') " +
     "AND current_period_end <= CURRENT_DATE + INTERVAL '7 days' " +
     "AND cancel_at_period_end = false " +
     "ORDER BY current_period_end ASC")
```

**Current Processor**: `SubscriptionRenewalProcessor` - Processes subscriptions from the reader

## Required Fix

### Option 1: Two-Phase Query (Recommended)

Modify the batch job to use a two-phase approach:

1. **Phase 1**: Query subscriptions with `stripe_subscription_id IS NOT NULL` that are candidates for renewal check
2. **Phase 2**: In the processor, fetch each subscription from Stripe and check Stripe's `current_period_end`
3. **Phase 3**: Only process subscriptions where Stripe's `current_period_end` is within the renewal window

### Option 2: Expanded Query with Stripe Check

Modify the query to include subscriptions that:
- Have `stripe_subscription_id IS NOT NULL` (can check Stripe)
- Are `ACTIVE` or `TRIAL`
- Have `cancel_at_period_end = false`
- Either database `current_period_end <= CURRENT_DATE + INTERVAL '7 days'` OR `stripe_subscription_id IS NOT NULL` (will check Stripe in processor)

Then in the processor, fetch from Stripe and filter based on Stripe's actual dates.

## Implementation Details

### Modified Query (Option 1 - Recommended)

```java
@Bean
public ItemReader<MembershipSubscription> subscriptionReader() {
    return new JdbcCursorItemReaderBuilder<MembershipSubscription>()
        .dataSource(dataSource)
        .sql("SELECT * FROM membership_subscription " +
             "WHERE subscription_status IN ('ACTIVE', 'TRIAL') " +
             "AND cancel_at_period_end = false " +
             "AND (" +
             "  current_period_end <= CURRENT_DATE + INTERVAL '7 days' " + // Database date check
             "  OR stripe_subscription_id IS NOT NULL" + // Will check Stripe dates in processor
             ") " +
             "ORDER BY current_period_end ASC")
        .rowMapper(new BeanPropertyRowMapper<>(MembershipSubscription.class))
        .build();
}
```

### Modified Processor Logic

```java
public class SubscriptionRenewalProcessor implements ItemProcessor<MembershipSubscription, MembershipSubscription> {

    private final StripeService stripeService;

    @Override
    public MembershipSubscription process(MembershipSubscription subscription) throws Exception {
        // If subscription has Stripe subscription ID, check Stripe dates
        if (subscription.getStripeSubscriptionId() != null && !subscription.getStripeSubscriptionId().isEmpty()) {
            try {
                // Fetch subscription from Stripe
                Subscription stripeSubscription = stripeService.retrieveSubscription(
                    subscription.getStripeSubscriptionId()
                );

                // Get Stripe's current_period_end (Unix timestamp)
                long stripePeriodEnd = stripeSubscription.getCurrentPeriodEnd();
                Date stripePeriodEndDate = new Date(stripePeriodEnd * 1000);

                // Calculate renewal window (7 days from now)
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DAY_OF_YEAR, 7);
                Date renewalWindowEnd = cal.getTime();

                // Check if Stripe's period_end is within renewal window
                if (stripePeriodEndDate.after(new Date()) && stripePeriodEndDate.before(renewalWindowEnd)) {
                    // Subscription needs renewal - update database dates from Stripe
                    subscription.setCurrentPeriodStart(
                        new Date(stripeSubscription.getCurrentPeriodStart() * 1000)
                    );
                    subscription.setCurrentPeriodEnd(stripePeriodEndDate);

                    // Log for debugging
                    log.info("Subscription {} needs renewal - Stripe period_end: {}, Database period_end: {}",
                        subscription.getId(),
                        stripePeriodEndDate,
                        subscription.getCurrentPeriodEnd()
                    );

                    return subscription; // Process this subscription
                } else {
                    // Stripe date is not within renewal window - skip
                    log.debug("Subscription {} skipped - Stripe period_end {} is not within renewal window",
                        subscription.getId(),
                        stripePeriodEndDate
                    );
                    return null; // Skip this subscription
                }
            } catch (StripeException e) {
                log.error("Error fetching Stripe subscription {}: {}",
                    subscription.getStripeSubscriptionId(),
                    e.getMessage()
                );
                // Fallback: use database date if Stripe fetch fails
                if (subscription.getCurrentPeriodEnd().before(renewalWindowEnd)) {
                    return subscription;
                }
                return null;
            }
        } else {
            // No Stripe subscription ID - use database date check (existing logic)
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, 7);
            Date renewalWindowEnd = cal.getTime();

            if (subscription.getCurrentPeriodEnd().before(renewalWindowEnd)) {
                return subscription;
            }
            return null;
        }
    }
}
```

### Alternative: Simpler Query Modification

If you prefer a simpler approach, modify the query to include subscriptions that might need checking:

```java
.sql("SELECT * FROM membership_subscription " +
     "WHERE subscription_status IN ('ACTIVE', 'TRIAL') " +
     "AND cancel_at_period_end = false " +
     "AND (" +
     "  current_period_end <= CURRENT_DATE + INTERVAL '7 days' " + // Database check
     "  OR (stripe_subscription_id IS NOT NULL " +
     "      AND current_period_end <= CURRENT_DATE + INTERVAL '30 days')" + // Extended window for Stripe-checked subscriptions
     ") " +
     "ORDER BY current_period_end ASC")
```

Then in the processor, always fetch from Stripe for subscriptions with `stripe_subscription_id` and use Stripe's dates.

## Testing Steps

### 1. Test with Expedited Subscription

```bash
# Step 1: Expedite Stripe subscription (advances Stripe dates)
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id=sub_1SijZhK5BrggeAHMwPaKK3CQ \
  --days-to-advance=30

# Step 2: Verify database still has old dates
# (Database current_period_end should be ~22 days away)

# Step 3: Run batch job
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SijZhK5BrggeAHMwPaKK3CQ

# Expected Result: Batch job should find and process the subscription
# even though database date is outside the 7-day window
```

### 2. Test with Normal Subscription

```bash
# Subscription with database current_period_end within 7 days
# Should work as before (no change in behavior)
```

### 3. Test with Subscription Without Stripe ID

```bash
# Subscription without stripe_subscription_id
# Should use database date check (existing behavior)
```

## Expected Behavior After Fix

### Before Fix:
```
Batch Job Query: current_period_end <= CURRENT_DATE + 7 days
Database: current_period_end = 2026-01-25 (22 days away)
Stripe: current_period_end = 2026-01-03 (7 days away)
Result: ❌ Subscription NOT found (database date too far)
```

### After Fix:
```
Batch Job Query: Includes subscriptions with stripe_subscription_id
Processor: Fetches from Stripe, checks Stripe's current_period_end
Stripe: current_period_end = 2026-01-03 (7 days away)
Result: ✅ Subscription FOUND and processed
Database: Updated with Stripe's dates during processing
```

## Benefits

1. **Handles Expedited Renewals**: Batch job finds subscriptions even when Stripe dates are advanced
2. **Handles Webhook Delays**: If webhook fails to update database, batch job still processes renewal
3. **Source of Truth**: Stripe becomes the source of truth for subscription dates
4. **Backward Compatible**: Subscriptions without Stripe ID still use database dates
5. **Self-Healing**: Database dates are updated during batch processing if they're out of sync

## Error Handling

- **Stripe API Failures**: Log error and fallback to database date check
- **Missing Stripe Subscription**: Log warning and skip subscription
- **Rate Limiting**: Implement retry logic with exponential backoff
- **Network Timeouts**: Set appropriate timeout values (e.g., 10 seconds)

## Performance Considerations

- **Stripe API Calls**: Each subscription with `stripe_subscription_id` requires one Stripe API call
- **Batch Size**: Consider reducing batch size if Stripe API rate limits are a concern
- **Caching**: Consider caching Stripe subscription data if processing multiple batches
- **Parallel Processing**: Fetch Stripe data in parallel for better performance

## Logging Requirements

Add detailed logging for:

1. **Stripe Fetch**: Log when fetching subscription from Stripe
2. **Date Comparison**: Log database vs Stripe date comparison
3. **Skip Reasons**: Log why subscriptions are skipped (date outside window, etc.)
4. **Database Updates**: Log when database dates are updated from Stripe

Example log format:
```
[SUBSCRIPTION-RENEWAL] Processing subscription ID: 4504, Stripe ID: sub_1SijZhK5BrggeAHMwPaKK3CQ
[SUBSCRIPTION-RENEWAL] Database period_end: 2026-01-25, Stripe period_end: 2026-01-03
[SUBSCRIPTION-RENEWAL] Stripe date within renewal window - processing subscription
[SUBSCRIPTION-RENEWAL] Updating database dates from Stripe: period_start=2025-12-27, period_end=2026-01-03
```

## Database Update Strategy

When Stripe dates differ from database dates:

1. **Update During Processing**: Update `current_period_start` and `current_period_end` from Stripe
2. **Update `last_stripe_sync_at`**: Track when database was last synced with Stripe
3. **Update `reconciliation_status`**: Set to 'SYNCED' if dates match, 'UPDATED' if updated

## Rollback Plan

If issues occur:

1. Revert query to original (only database date check)
2. Processor will continue to work with database dates only
3. No data loss - subscriptions will be processed on next run when database dates are within window

## Questions for Backend Team

1. **Stripe API Client**: What Stripe client library is used? (Stripe Java SDK?)
2. **Error Handling**: Preferred error handling strategy for Stripe API failures?
3. **Logging Framework**: What logging framework is used? (SLF4J, Log4j?)
4. **Performance**: What's the acceptable batch size considering Stripe API calls?
5. **Testing**: How should we test this in the batch job project?

## Related Files

- **Batch Job Config**: `SubscriptionRenewalBatchJobConfig.java`
- **Processor**: `SubscriptionRenewalProcessor.java`
- **Stripe Service**: `StripeService.java` (if exists)
- **Entity**: `MembershipSubscription.java`

## Additional Notes

- This fix ensures the batch job is resilient to database/Stripe sync issues
- The batch job becomes self-healing by updating database dates during processing
- Consider adding a separate reconciliation job that syncs all subscriptions periodically
- Monitor Stripe API usage to ensure rate limits are not exceeded

---

**Priority**: High
**Impact**: Critical - Fixes issue where batch job misses subscriptions needing renewal
**Effort**: Medium - Requires modifying query and processor logic
**Risk**: Low - Backward compatible, can fallback to database dates if Stripe fetch fails

