# Subscription Renewal Testing Scripts

Automated test scripts for expediting and testing subscription renewal in Stripe test mode.

## Overview

These scripts allow you to test subscription renewal functionality without waiting for the actual billing period to end. They work with Stripe test mode subscriptions to:

1. **Expedite renewal** - Advance subscription period dates in Stripe test mode
2. **Verify database** - Compare database state with Stripe subscription state
3. **Trigger batch job** - Execute batch job on demand for testing
4. **Full test suite** - Run all tests in sequence

## Prerequisites

### Environment Variables

```bash
# Required for all scripts
export STRIPE_SECRET_KEY="sk_test_..."  # Stripe test mode secret key
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"  # Backend API URL
export NEXT_PUBLIC_API_JWT_USER="jwtadmin"  # Backend JWT username
export NEXT_PUBLIC_API_JWT_PASS="jwtadmin"  # Backend JWT password
export NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Next.js app URL (for proxy)
export NEXT_PUBLIC_TENANT_ID="tenant_demo_002"  # Default tenant ID
```

**Note:** The `verify-database.js` script uses the API proxy endpoint instead of direct database access, so `DATABASE_URL` is no longer required.

### Node.js Dependencies

```bash
npm install --save-dev stripe dotenv
```

Or add to `package.json`:
```json
{
  "devDependencies": {
    "stripe": "^14.0.0",
    "dotenv": "^16.0.0"
  }
}
```

## Scripts

### 1. View Stripe Subscription Details

**File:** `view-stripe-subscription.js`

Retrieves and displays detailed information about a Stripe subscription including dates, status, billing information, and other attributes.

```bash
node scripts/test-subscription-renewal/view-stripe-subscription.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID

**What it displays:**
- Subscription status and customer information
- Current billing period dates (start, end, days until renewal)
- Billing cycle anchor
- Billing information (currency, collection method, interval, amount)
- Subscription items and pricing
- Cancellation settings
- Trial information (if applicable)
- Latest invoice details
- Payment method information
- Metadata
- Additional subscription attributes

**Output:**
- Comprehensive subscription details formatted for easy reading
- All dates in both ISO format and localized format
- Days until renewal calculation

### 2. Advance Existing Subscription (For Subscriptions Created Before Test Clock) ⚠️ **LIMITED EFFECTIVENESS**

**File:** `advance-existing-subscription.js`

**⚠️ CRITICAL LIMITATION:** This script has limited effectiveness for existing subscriptions. Stripe does not allow force-advancing subscriptions that are already active. When you create and pay an invoice for a subscription still in its current period, it only pays for that period - it does NOT advance the period.

**For subscriptions that were already created (before test clock setup)**, this script attempts to advance the subscription period, but may not work if the subscription is still in its current billing period.

```bash
node scripts/test-subscription-renewal/advance-existing-subscription.js \
  --subscription-id=sub_1Skv22K5BrggeAHMcbl3nErG \
  --days-to-advance=30
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--days-to-advance` (optional): Number of days to advance (default: 30)

**What it does:**
1. Retrieves current subscription
2. Calculates new period dates based on days to advance
3. Attempts to reset billing cycle anchor to 'now' (if possible)
4. Creates and pays invoices for the subscription
5. Verifies final subscription state

**When to use:**
- ⚠️ Subscription was created before test clock was set up
- ⚠️ Subscription is already `active` or `trialing`
- ⚠️ You need to advance an existing subscription's period
- ⚠️ **Note:** May not work if subscription is still in current period

**Limitations:**
- ❌ Cannot force-advance subscriptions that are still in their current period
- ❌ Paying invoices for current period doesn't advance the period
- ❌ Stripe API restrictions prevent direct period manipulation

**Recommended Solutions:**
1. **Wait for period to end naturally** - Let the current period complete
2. **Create NEW subscription with Test Clock** - Attach test clock before creating subscription
3. **Use Test Clock method** - Use `expedite-stripe-renewal-test-clock.js` for new subscriptions
4. **Cancel and recreate** - Cancel existing subscription and create new one with test clock

**Output:**
- Updated subscription period dates (if successful)
- Invoice creation and payment status
- Actual days advanced (may be 0 if period didn't advance)
- Clear error messages explaining limitations

### 2a. Setup Test Clock and Attach Customer ⭐ **REQUIRED FIRST STEP FOR NEW SUBSCRIPTIONS**

**File:** `setup-test-clock.js`

**This script MUST be run BEFORE creating a subscription if you want to use Test Clocks.** It creates a Stripe Test Clock and attaches a customer to it, ensuring that any new subscriptions created for that customer will automatically use the test clock.

**⚠️ CRITICAL:** The customer MUST be attached to the test clock BEFORE creating the subscription. If you create the subscription first, it cannot be attached to the test clock.

```bash
# Use existing customer
node scripts/test-subscription-renewal/setup-test-clock.js \
  --customer-id=cus_xxx \
  --test-clock-name="My Test Clock"

# OR create a new customer
node scripts/test-subscription-renewal/setup-test-clock.js \
  --customer-email=test@example.com \
  --customer-name="Test Customer" \
  --test-clock-name="My Test Clock"

# Reuse existing test clock by name
node scripts/test-subscription-renewal/setup-test-clock.js \
  --customer-id=cus_xxx \
  --test-clock-name="My Test Clock" \
  --reuse-test-clock=true
```

**Parameters:**
- `--customer-id` (optional): Existing Stripe customer ID
- `--customer-email` (optional): Email for new customer (required if customer-id not provided)
- `--customer-name` (optional): Name for new customer (default: "Test Customer")
- `--test-clock-name` (optional): Name for test clock (default: auto-generated timestamp)
- `--reuse-test-clock` (optional): Reuse existing test clock with same name (default: false)

**What it does:**
1. Creates or finds a test clock by name
2. Creates or retrieves a customer
3. Checks for existing subscriptions (warns if found)
4. Attaches customer to test clock
5. Provides next steps for creating subscription

**Why this is important:**
- ✅ **Order matters** - Customer must be attached to test clock BEFORE subscription creation
- ✅ **Automatic attachment** - New subscriptions will automatically use the test clock
- ✅ **Reusable** - Can reuse test clocks for multiple subscriptions
- ✅ **Validation** - Warns if customer has existing subscriptions that won't use test clock

**Output:**
- Test Clock ID and details
- Customer ID and details
- Confirmation of attachment
- Next steps for subscription creation
- Example code for creating subscription

**Next Steps:**
After running this script, create a NEW subscription for the customer. The subscription will automatically use the test clock. Then use `expedite-stripe-renewal-test-clock.js` to advance time.

### 2b. Expedite Stripe Renewal (Using Test Clocks) ⭐ **RECOMMENDED FOR NEW SUBSCRIPTIONS**

**File:** `expedite-stripe-renewal-test-clock.js`

**This is the proper way to test subscription renewals in Stripe test mode for NEW subscriptions.** Uses Stripe Test Clocks to simulate time passing, which automatically triggers subscription renewals, invoice creation, and webhooks.

**⚠️ IMPORTANT:** Test Clocks only work for subscriptions created AFTER the test clock is set up. **Run `setup-test-clock.js` first** to set up the test clock and attach the customer before creating the subscription. For existing subscriptions, use `advance-existing-subscription.js` instead.

```bash
node scripts/test-subscription-renewal/expedite-stripe-renewal-test-clock.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --days-to-advance=30
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--days-to-advance` (optional): Number of days to advance (default: 30)

**What it does:**
1. Retrieves current subscription from Stripe
2. Creates or finds existing test clock (attaches customer if needed)
3. Advances test clock by specified number of days
4. Stripe automatically processes subscription renewal
5. Verifies final subscription state

**Why Test Clocks?**
- ✅ **Proper Stripe feature** - Official way to test time-based events
- ✅ **Automatic processing** - Stripe handles renewals, invoices, and webhooks automatically
- ✅ **Works with incomplete subscriptions** - Can advance time even if subscription isn't fully active
- ✅ **Realistic testing** - Simulates real-world time passing
- ✅ **Webhook triggers** - Automatically sends webhooks as if time actually passed

**Output:**
- Test clock creation/retrieval status
- Time advancement confirmation
- Updated subscription period dates
- Actual days advanced

**Note:** If your subscription is in `incomplete` status, you may need to activate it first before using test clocks. Test clocks work best with `active` subscriptions.

### 2b. Expedite Stripe Renewal (Legacy Method - Limited)

**File:** `expedite-stripe-renewal.js`

**⚠️ WARNING:** This method has limitations and may not work for all subscription states. Use the Test Clock method above instead.

This script attempts to advance a subscription by creating and paying invoices, but:
- ❌ **Doesn't work with `incomplete` subscriptions** - Cannot update billing cycle anchor
- ❌ **Doesn't actually advance time** - Just completes current period
- ❌ **Requires multiple runs** - May need to run multiple times to advance by desired amount
- ❌ **Limited control** - Cannot precisely control advancement

```bash
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --days-to-advance=30
```

**When to use:** Only if Test Clocks are not available or you need to test invoice creation specifically.

### 3. Verify Database

**File:** `verify-database.js`

Compares database subscription record with Stripe subscription state.

```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--tenant-id` (optional): Tenant ID (defaults to NEXT_PUBLIC_TENANT_ID)

**What it does:**
1. Fetches subscription from Stripe
2. Fetches subscription from database via API proxy endpoint (`/api/proxy/membership-subscriptions`)
3. Compares:
   - `currentPeriodStart` (period start dates)
   - `currentPeriodEnd` (period end dates)
   - `subscriptionStatus` (subscription status)
   - `stripeCustomerId` (customer ID)
4. Reports discrepancies (warnings for minor differences, issues for significant differences)
5. Checks reconciliation status

**Output:**
- Comparison results (matches, warnings, issues)
- Reconciliation status
- Recommendations

### 4. Trigger Batch Job

**File:** `trigger-batch-job.js`

Triggers the subscription renewal batch job manually for testing.

```bash
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --batch-size=10 \
  --max-subscriptions=100
```

**Parameters:**
- `--tenant-id` (required): Tenant ID
- `--subscription-id` (optional): Filter by specific subscription
- `--batch-size` (optional): Batch size (default: 10)
- `--max-subscriptions` (optional): Max subscriptions to process (default: 100)

**What it does:**
1. Authenticates with backend API
2. Triggers batch job endpoint
3. Reports job execution results

**Output:**
- Job execution status
- Statistics (processed, updated, skipped, errors)
- Duration

### 5. Full Test Suite

**File:** `run-full-test.sh`

Runs all tests in sequence for complete end-to-end testing.

```bash
chmod +x scripts/test-subscription-renewal/run-full-test.sh
./scripts/test-subscription-renewal/run-full-test.sh \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002 \
  --days-to-advance=30
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--tenant-id` (optional): Tenant ID (defaults to NEXT_PUBLIC_TENANT_ID)
- `--days-to-advance` (optional): Days to advance (default: 30)

**What it does:**
1. Expedites Stripe subscription renewal
2. Waits for webhook processing
3. Verifies database state (before batch job)
4. Triggers batch job
5. Waits for batch job completion
6. Verifies final database state

**Output:**
- Complete test results
- Pass/fail status

## Quick Start Example

```bash
# Set environment variables
export STRIPE_SECRET_KEY="sk_test_..."
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"
export API_JWT_USER="jwtadmin"
export API_JWT_PASS="jwtadmin"
export NEXT_PUBLIC_TENANT_ID="tenant_demo_002"

# Run full test suite
./scripts/test-subscription-renewal/run-full-test.sh \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002 \
  --days-to-advance=30
```

## Testing Workflow

### Step 1: Prepare Test Subscription

Ensure you have a test subscription in the database:
```sql
SELECT id, tenant_id, user_profile_id, membership_plan_id,
       subscription_status, current_period_start, current_period_end,
       stripe_subscription_id, stripe_customer_id
FROM membership_subscription
WHERE stripe_subscription_id = 'sub_1SeifsK5BrggeAHMBvg2XE93'
  AND tenant_id = 'tenant_demo_002';
```

### Step 2: View Subscription Details (Optional)

To check current subscription state before testing:
```bash
node scripts/test-subscription-renewal/view-stripe-subscription.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
```

### Step 3: Run Expedited Renewal

```bash
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --days-to-advance=30
```

### Step 4: Verify Webhook Processing

Wait 5-10 seconds, then verify database:
```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

### Step 5: Trigger Batch Job

If webhook didn't update database, trigger batch job:
```bash
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
```

### Step 6: Final Verification

Verify database is in sync:
```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

## Troubleshooting

### Stripe API Errors

- **Error: "No such subscription"** - Check subscription ID is correct and in test mode
- **Error: "Invalid API key"** - Verify STRIPE_SECRET_KEY is set and is a test mode key
- **Error: "Cannot update subscription"** - Subscription may be canceled or in invalid state

### Database Connection Errors

- **Error: "Connection refused"** - Check DATABASE_URL and database is running
- **Error: "Authentication failed"** - Verify database credentials
- **Error: "Subscription not found"** - Check subscription exists in database with correct tenant_id

### Batch Job Errors

- **Error: "401 Unauthorized"** - Check API_JWT_USER and API_JWT_PASS
- **Error: "404 Not Found"** - Verify batch job endpoint exists in backend
- **Error: "500 Internal Server Error"** - Check backend logs for details

## Notes

- **Test Mode Only**: These scripts only work with Stripe test mode subscriptions
- **Database Safety**: Scripts are read-only for database (except batch job which updates)
- **Webhook Timing**: Allow 5-10 seconds for webhooks to process after expediting
- **Batch Job Timing**: Allow 10-30 seconds for batch job to complete

## Related Documentation

- [Subscription Renewal Batch Job Analysis](./documentation/domain_agnostic_payment/membership_susbscription/SUBSCRIPTION_RENEWAL_BATCH_JOB_ANALYSIS.html)
- [Stripe Test Mode Documentation](https://stripe.com/docs/testing)
- [Backend API Documentation](./documentation/Swagger_API_Docs/api-docs.json)




