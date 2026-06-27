# Batch Job Fallback Logic: Database vs Stripe Date Handling

## Problem Statement

The subscription renewal batch job currently checks Stripe's `current_period_end` to determine if a subscription needs renewal. However, when Stripe dates are advanced for testing (via expedite scripts) or when webhooks are delayed, the database may have different dates than Stripe.

**Current Issue**:
- Database `current_period_end`: `2025-12-31` (within 7-day renewal window)
- Stripe `current_period_end`: `2026-01-26` (24 days away, outside renewal window)
- **Result**: Subscription is skipped even though database indicates it needs renewal

**Root Cause**: Batch job only checks Stripe dates, ignoring database dates when they differ significantly.

## Solution: Environment-Based Fallback Logic

Implement fallback logic that behaves differently based on environment:
- **Development/Testing**: Use database dates as fallback when Stripe dates are out of sync
- **Production**: Always use Stripe dates (source of truth), but log warnings for mismatches

## Implementation Details

### 1. Environment Variable Configuration

Add a new environment variable to control batch job behavior:

```properties
# application.properties or application.yml
subscription.renewal.use-database-fallback=${USE_DATABASE_FALLBACK:false}
```

**Default Behavior**: `false` (production-safe - always use Stripe dates)
**Testing Mode**: Set to `true` to enable database date fallback

### 2. Modified Processor Logic

**Location**: `SubscriptionRenewalProcessor.java`

**Current Logic** (Stripe-only check):
```java
// Current implementation - only checks Stripe dates
if (stripePeriodEnd.after(renewalWindowEnd)) {
    log.info("Subscription {} skipped - Stripe period_end {} is not within renewal window",
        subscriptionId, stripePeriodEnd);
    return null; // Skip subscription
}
```

**New Logic** (with fallback):
```java
/**
 * Determine if subscription needs renewal based on Stripe and database dates
 *
 * @param subscription Database subscription entity
 * @param stripeSubscription Stripe subscription object
 * @param renewalWindowEnd End date of renewal window (CURRENT_DATE + 7 days)
 * @return true if subscription should be processed, false if skipped
 */
private boolean shouldProcessSubscription(
    MembershipSubscription subscription,
    Subscription stripeSubscription,
    Date renewalWindowEnd
) {
    // Get dates
    Date stripePeriodEnd = new Date(stripeSubscription.getCurrentPeriodEnd() * 1000);
    Date databasePeriodEnd = subscription.getCurrentPeriodEnd();

    // Check if Stripe date is within renewal window
    boolean stripeWithinWindow = stripePeriodEnd.before(renewalWindowEnd) ||
                                  stripePeriodEnd.equals(renewalWindowEnd);

    if (stripeWithinWindow) {
        // Stripe date is within window - process subscription
        log.info("[SUBSCRIPTION-RENEWAL] Stripe period_end {} is within renewal window - processing",
            stripePeriodEnd);
        return true;
    }

    // Stripe date is outside window - check database date
    boolean databaseWithinWindow = databasePeriodEnd.before(renewalWindowEnd) ||
                                    databasePeriodEnd.equals(renewalWindowEnd);

    if (!databaseWithinWindow) {
        // Both dates are outside window - skip subscription
        log.info("[SUBSCRIPTION-RENEWAL] Subscription {} skipped - both Stripe ({}) and database ({}) " +
            "period_end are outside renewal window (window end: {})",
            subscription.getId(), stripePeriodEnd, databasePeriodEnd, renewalWindowEnd);
        return false;
    }

    // Database date is within window, but Stripe date is not - check fallback mode
    boolean useDatabaseFallback = Boolean.parseBoolean(
        environment.getProperty("subscription.renewal.use-database-fallback", "false")
    );

    if (useDatabaseFallback) {
        // DEVELOPMENT/TESTING MODE: Use database date as fallback
        long daysDifference = ChronoUnit.DAYS.between(
            databasePeriodEnd.toInstant(),
            stripePeriodEnd.toInstant()
        );

        log.warn("[SUBSCRIPTION-RENEWAL] ⚠️ DATE MISMATCH DETECTED (Testing Mode): " +
            "Subscription {} - Database period_end: {}, Stripe period_end: {}, " +
            "Difference: {} days. Using database date for processing.",
            subscription.getId(), databasePeriodEnd, stripePeriodEnd, daysDifference);

        // Update Stripe dates during processing (self-healing)
        log.info("[SUBSCRIPTION-RENEWAL] Will update database dates from Stripe during processing");
        return true; // Process subscription using database date
    } else {
        // PRODUCTION MODE: Always use Stripe dates (source of truth)
        long daysDifference = ChronoUnit.DAYS.between(
            databasePeriodEnd.toInstant(),
            stripePeriodEnd.toInstant()
        );

        log.warn("[SUBSCRIPTION-RENEWAL] ⚠️ DATE MISMATCH DETECTED (Production Mode): " +
            "Subscription {} - Database period_end: {}, Stripe period_end: {}, " +
            "Difference: {} days. Skipping subscription (Stripe is source of truth). " +
            "Consider running reconciliation job to sync dates.",
            subscription.getId(), databasePeriodEnd, stripePeriodEnd, daysDifference);

        return false; // Skip subscription - Stripe is source of truth
    }
}
```

### 3. Updated Processor Method

**Location**: `SubscriptionRenewalProcessor.java`

```java
@Override
public MembershipSubscription process(MembershipSubscription subscription) throws Exception {
    try {
        String stripeSubscriptionId = subscription.getStripeSubscriptionId();
        if (stripeSubscriptionId == null || stripeSubscriptionId.isEmpty()) {
            log.warn("[SUBSCRIPTION-RENEWAL] Subscription {} has no Stripe subscription ID - skipping",
                subscription.getId());
            return null;
        }

        // Calculate renewal window (7 days from now)
        LocalDate renewalWindowEnd = LocalDate.now().plusDays(7);
        Date renewalWindowEndDate = Date.from(renewalWindowEnd.atStartOfDay(ZoneId.systemDefault()).toInstant());

        // Fetch subscription from Stripe
        Subscription stripeSubscription = stripeService.retrieveSubscription(stripeSubscriptionId);

        // Get dates for logging
        Date stripePeriodEnd = new Date(stripeSubscription.getCurrentPeriodEnd() * 1000);
        Date databasePeriodEnd = subscription.getCurrentPeriodEnd();

        log.info("[SUBSCRIPTION-RENEWAL] Processing subscription ID: {}, Stripe ID: {}",
            subscription.getId(), stripeSubscriptionId);
        log.info("[SUBSCRIPTION-RENEWAL] Database period_end: {}, Stripe period_end: {}, Renewal window end: {}",
            databasePeriodEnd, stripePeriodEnd, renewalWindowEndDate);

        // CRITICAL: Check if subscription should be processed (with fallback logic)
        if (!shouldProcessSubscription(subscription, stripeSubscription, renewalWindowEndDate)) {
            return null; // Skip subscription
        }

        // Process subscription renewal
        // ... existing renewal logic ...

        // CRITICAL: Update database dates from Stripe (self-healing)
        // This ensures database stays in sync with Stripe after processing
        subscription.setCurrentPeriodStart(
            new Date(stripeSubscription.getCurrentPeriodStart() * 1000)
        );
        subscription.setCurrentPeriodEnd(stripePeriodEnd);
        subscription.setLastStripeSyncAt(new Date());

        log.info("[SUBSCRIPTION-RENEWAL] ✅ Subscription {} processed successfully. " +
            "Updated database dates from Stripe: period_start={}, period_end={}",
            subscription.getId(), subscription.getCurrentPeriodStart(), subscription.getCurrentPeriodEnd());

        return subscription;

    } catch (StripeException e) {
        log.error("[SUBSCRIPTION-RENEWAL] Error processing subscription {}: {}",
            subscription.getId(), e.getMessage(), e);
        return null;
    }
}
```

### 4. Environment Configuration Examples

**Development/Testing** (`application-dev.properties`):
```properties
# Enable database date fallback for testing
subscription.renewal.use-database-fallback=true
```

**Production** (`application-prod.properties`):
```properties
# Always use Stripe dates (source of truth)
subscription.renewal.use-database-fallback=false
```

**Local Testing** (`.env.local` or environment variables):
```bash
# Enable fallback for local testing
USE_DATABASE_FALLBACK=true
```

## Testing Scenarios

### Scenario 1: Normal Case (Dates Match)

**Setup**:
- Database `current_period_end`: `2026-01-02` (within 7 days)
- Stripe `current_period_end`: `2026-01-02` (within 7 days)

**Expected Behavior**:
- ✅ Subscription processed
- No warnings logged
- Database dates updated from Stripe (if different by seconds)

### Scenario 2: Database Date Within Window, Stripe Date Outside (Testing Mode)

**Setup**:
- Database `current_period_end`: `2025-12-31` (within 7 days)
- Stripe `current_period_end`: `2026-01-26` (outside window)
- Environment: `USE_DATABASE_FALLBACK=true`

**Expected Behavior**:
- ⚠️ Warning logged about date mismatch
- ✅ Subscription processed (using database date)
- Database dates updated from Stripe during processing
- Log: "Will update database dates from Stripe during processing"

### Scenario 3: Database Date Within Window, Stripe Date Outside (Production Mode)

**Setup**:
- Database `current_period_end`: `2025-12-31` (within 7 days)
- Stripe `current_period_end`: `2026-01-26` (outside window)
- Environment: `USE_DATABASE_FALLBACK=false`

**Expected Behavior**:
- ⚠️ Warning logged about date mismatch
- ❌ Subscription skipped (Stripe is source of truth)
- Log: "Skipping subscription (Stripe is source of truth). Consider running reconciliation job."

### Scenario 4: Both Dates Outside Window

**Setup**:
- Database `current_period_end`: `2026-01-26` (outside window)
- Stripe `current_period_end`: `2026-01-26` (outside window)

**Expected Behavior**:
- ❌ Subscription skipped
- Log: "Both Stripe and database period_end are outside renewal window"

## Benefits

### 1. Testing Flexibility
- **Development/Testing**: Can test batch job with database dates even when Stripe dates are out of sync
- **No Stripe API Changes Required**: Don't need to modify Stripe subscriptions for testing

### 2. Production Safety
- **Production**: Always uses Stripe dates (source of truth)
- **Self-Healing**: Updates database dates from Stripe during processing
- **Warning Logs**: Alerts when dates are out of sync

### 3. Debugging
- **Clear Logging**: Shows both database and Stripe dates
- **Mismatch Detection**: Warns when dates differ significantly
- **Environment Awareness**: Logs show which mode is active

## Implementation Checklist

- [ ] Add `subscription.renewal.use-database-fallback` property to `application.properties`
- [ ] Create `shouldProcessSubscription()` method with fallback logic
- [ ] Update `process()` method to use fallback logic
- [ ] Add date mismatch warning logs
- [ ] Update database dates from Stripe during processing (self-healing)
- [ ] Set `USE_DATABASE_FALLBACK=true` for development/testing environments
- [ ] Set `USE_DATABASE_FALLBACK=false` for production environment
- [ ] Test with database date within window, Stripe date outside (testing mode)
- [ ] Test with database date within window, Stripe date outside (production mode)
- [ ] Test with both dates matching (normal case)
- [ ] Test with both dates outside window (skip case)

## Code Example: Complete Processor

```java
package com.nextjstemplate.batch.subscription;

import com.nextjstemplate.domain.MembershipSubscription;
import com.stripe.model.Subscription;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class SubscriptionRenewalProcessor implements ItemProcessor<MembershipSubscription, MembershipSubscription> {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionRenewalProcessor.class);

    @Autowired
    private Environment environment;

    @Autowired
    private StripeService stripeService;

    @Override
    public MembershipSubscription process(MembershipSubscription subscription) throws Exception {
        try {
            String stripeSubscriptionId = subscription.getStripeSubscriptionId();
            if (stripeSubscriptionId == null || stripeSubscriptionId.isEmpty()) {
                log.warn("[SUBSCRIPTION-RENEWAL] Subscription {} has no Stripe subscription ID - skipping",
                    subscription.getId());
                return null;
            }

            // Calculate renewal window (7 days from now)
            LocalDate renewalWindowEnd = LocalDate.now().plusDays(7);
            Date renewalWindowEndDate = Date.from(renewalWindowEnd.atStartOfDay(ZoneId.systemDefault()).toInstant());

            // Fetch subscription from Stripe
            Subscription stripeSubscription = stripeService.retrieveSubscription(stripeSubscriptionId);

            // Get dates for logging
            Date stripePeriodEnd = new Date(stripeSubscription.getCurrentPeriodEnd() * 1000);
            Date databasePeriodEnd = subscription.getCurrentPeriodEnd();

            log.info("[SUBSCRIPTION-RENEWAL] Processing subscription ID: {}, Stripe ID: {}",
                subscription.getId(), stripeSubscriptionId);
            log.info("[SUBSCRIPTION-RENEWAL] Database period_end: {}, Stripe period_end: {}, Renewal window end: {}",
                databasePeriodEnd, stripePeriodEnd, renewalWindowEndDate);

            // CRITICAL: Check if subscription should be processed (with fallback logic)
            if (!shouldProcessSubscription(subscription, stripeSubscription, renewalWindowEndDate)) {
                return null; // Skip subscription
            }

            // Process subscription renewal
            // ... existing renewal logic ...

            // CRITICAL: Update database dates from Stripe (self-healing)
            subscription.setCurrentPeriodStart(
                new Date(stripeSubscription.getCurrentPeriodStart() * 1000)
            );
            subscription.setCurrentPeriodEnd(stripePeriodEnd);
            subscription.setLastStripeSyncAt(new Date());

            log.info("[SUBSCRIPTION-RENEWAL] ✅ Subscription {} processed successfully. " +
                "Updated database dates from Stripe: period_start={}, period_end={}",
                subscription.getId(), subscription.getCurrentPeriodStart(), subscription.getCurrentPeriodEnd());

            return subscription;

        } catch (StripeException e) {
            log.error("[SUBSCRIPTION-RENEWAL] Error processing subscription {}: {}",
                subscription.getId(), e.getMessage(), e);
            return null;
        }
    }

    /**
     * Determine if subscription needs renewal based on Stripe and database dates
     *
     * @param subscription Database subscription entity
     * @param stripeSubscription Stripe subscription object
     * @param renewalWindowEnd End date of renewal window (CURRENT_DATE + 7 days)
     * @return true if subscription should be processed, false if skipped
     */
    private boolean shouldProcessSubscription(
        MembershipSubscription subscription,
        Subscription stripeSubscription,
        Date renewalWindowEnd
    ) {
        // Get dates
        Date stripePeriodEnd = new Date(stripeSubscription.getCurrentPeriodEnd() * 1000);
        Date databasePeriodEnd = subscription.getCurrentPeriodEnd();

        // Check if Stripe date is within renewal window
        boolean stripeWithinWindow = stripePeriodEnd.before(renewalWindowEnd) ||
                                      stripePeriodEnd.equals(renewalWindowEnd);

        if (stripeWithinWindow) {
            // Stripe date is within window - process subscription
            log.info("[SUBSCRIPTION-RENEWAL] Stripe period_end {} is within renewal window - processing",
                stripePeriodEnd);
            return true;
        }

        // Stripe date is outside window - check database date
        boolean databaseWithinWindow = databasePeriodEnd.before(renewalWindowEnd) ||
                                        databasePeriodEnd.equals(renewalWindowEnd);

        if (!databaseWithinWindow) {
            // Both dates are outside window - skip subscription
            log.info("[SUBSCRIPTION-RENEWAL] Subscription {} skipped - both Stripe ({}) and database ({}) " +
                "period_end are outside renewal window (window end: {})",
                subscription.getId(), stripePeriodEnd, databasePeriodEnd, renewalWindowEnd);
            return false;
        }

        // Database date is within window, but Stripe date is not - check fallback mode
        boolean useDatabaseFallback = Boolean.parseBoolean(
            environment.getProperty("subscription.renewal.use-database-fallback", "false")
        );

        if (useDatabaseFallback) {
            // DEVELOPMENT/TESTING MODE: Use database date as fallback
            long daysDifference = ChronoUnit.DAYS.between(
                databasePeriodEnd.toInstant(),
                stripePeriodEnd.toInstant()
            );

            log.warn("[SUBSCRIPTION-RENEWAL] ⚠️ DATE MISMATCH DETECTED (Testing Mode): " +
                "Subscription {} - Database period_end: {}, Stripe period_end: {}, " +
                "Difference: {} days. Using database date for processing.",
                subscription.getId(), databasePeriodEnd, stripePeriodEnd, daysDifference);

            // Update Stripe dates during processing (self-healing)
            log.info("[SUBSCRIPTION-RENEWAL] Will update database dates from Stripe during processing");
            return true; // Process subscription using database date
        } else {
            // PRODUCTION MODE: Always use Stripe dates (source of truth)
            long daysDifference = ChronoUnit.DAYS.between(
                databasePeriodEnd.toInstant(),
                stripePeriodEnd.toInstant()
            );

            log.warn("[SUBSCRIPTION-RENEWAL] ⚠️ DATE MISMATCH DETECTED (Production Mode): " +
                "Subscription {} - Database period_end: {}, Stripe period_end: {}, " +
                "Difference: {} days. Skipping subscription (Stripe is source of truth). " +
                "Consider running reconciliation job to sync dates.",
                subscription.getId(), databasePeriodEnd, stripePeriodEnd, daysDifference);

            return false; // Skip subscription - Stripe is source of truth
        }
    }
}
```

## Production Safety Considerations

### 1. Default Behavior
- **Default**: `USE_DATABASE_FALLBACK=false` (production-safe)
- **Explicit Opt-In**: Must explicitly enable fallback mode for testing

### 2. Logging
- **Warning Logs**: All date mismatches are logged with warnings
- **Environment Awareness**: Logs clearly indicate which mode is active
- **Audit Trail**: All processing decisions are logged

### 3. Self-Healing
- **Automatic Sync**: Database dates are updated from Stripe during processing
- **No Data Loss**: Database dates are updated, not overwritten incorrectly
- **Reconciliation**: Production mode encourages running reconciliation job

## Testing Instructions

### 1. Enable Testing Mode

```bash
# Set environment variable
export USE_DATABASE_FALLBACK=true

# Or in application-dev.properties
subscription.renewal.use-database-fallback=true
```

### 2. Create Test Data

```sql
-- Update database date to be within 7 days
UPDATE membership_subscription
SET current_period_end = CURRENT_DATE + INTERVAL '5 days',
    updated_at = NOW()
WHERE stripe_subscription_id = 'sub_1SijZhK5BrggeAHMwPaKK3CQ'
  AND tenant_id = 'tenant_demo_002';
```

### 3. Run Batch Job

```bash
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SijZhK5BrggeAHMwPaKK3CQ
```

### 4. Verify Results

**Expected Logs (Testing Mode)**:
```
⚠️ DATE MISMATCH DETECTED (Testing Mode): Subscription 4505 - Database period_end: 2025-12-31, Stripe period_end: 2026-01-26, Difference: 26 days. Using database date for processing.
Will update database dates from Stripe during processing
✅ Subscription 4505 processed successfully. Updated database dates from Stripe: period_start=..., period_end=2026-01-26
```

**Expected Logs (Production Mode)**:
```
⚠️ DATE MISMATCH DETECTED (Production Mode): Subscription 4505 - Database period_end: 2025-12-31, Stripe period_end: 2026-01-26, Difference: 26 days. Skipping subscription (Stripe is source of truth). Consider running reconciliation job to sync dates.
```

## Summary

This implementation provides:
- ✅ **Testing Flexibility**: Can test with database dates when Stripe dates are out of sync
- ✅ **Production Safety**: Always uses Stripe dates in production (source of truth)
- ✅ **Self-Healing**: Updates database dates from Stripe during processing
- ✅ **Clear Logging**: Warns when dates are out of sync
- ✅ **Environment Control**: Easy to enable/disable fallback mode via environment variable

**Priority**: High
**Impact**: Enables testing while maintaining production safety
**Effort**: Medium - Requires modifying processor logic and adding environment configuration
**Risk**: Low - Default behavior is production-safe, fallback is opt-in

