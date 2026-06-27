# Subscription Renewal Webhook Handling - Batch Job Analysis Report

## Document Information

- **Version**: 1.0
- **Date**: 2025-01-27
- **Status**: Analysis Only - No Implementation Changes
- **Author**: Development Team Analysis
- **Related Projects**:
  - Frontend: `E:\project_workspace\mosc-temp`
  - Backend: `E:\project_workspace\malayalees-us-site-boot`

---

## Executive Summary

This analysis evaluates the current webhook-based subscription renewal handling approach and proposes a batch job alternative for scaling subscription renewals across multiple tenants. The current system relies on real-time Stripe webhook events (`invoice.payment_succeeded`, `customer.subscription.updated`) to update subscription periods. As the user base grows across multiple tenants, this approach may face scalability challenges.

**Key Findings:**
- Current webhook approach works well for low-to-medium volume
- Batch job approach offers better scalability and reliability for high-volume scenarios
- Hybrid approach (webhooks + batch reconciliation) provides best of both worlds
- Multi-tenant architecture requires careful consideration of tenant isolation

**Recommendation:** Implement a hybrid approach with batch job reconciliation as the primary mechanism, with webhooks serving as real-time updates and fallback.

---

## Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Scalability Concerns](#scalability-concerns)
3. [Batch Job Approach](#batch-job-approach)
4. [Hybrid Approach Recommendation](#hybrid-approach-recommendation)
5. [Implementation Architecture](#implementation-architecture)
6. [Database Schema Considerations](#database-schema-considerations)
7. [Stripe API Integration](#stripe-api-integration)
8. [Multi-Tenant Considerations](#multi-tenant-considerations)
9. [Performance Analysis](#performance-analysis)
10. [Risk Assessment](#risk-assessment)
11. [Testing Approach and Strategies](#testing-approach-and-strategies)
12. [Implementation Recommendations](#implementation-recommendations)

---

## 1. Current System Analysis

### 1.1 Current Webhook Flow

**Current Implementation:**
- Frontend webhook handler: `src/app/api/webhooks/stripe/route.ts`
- Backend webhook endpoint: `/api/webhooks/stripe` (Rust/Spring Boot)
- Webhook events processed:
  - `checkout.session.completed` - Initial subscription creation
  - `customer.subscription.created` - Subscription created
  - `customer.subscription.updated` - Subscription updated (renewal, upgrade, downgrade)
  - `customer.subscription.deleted` - Subscription cancelled
  - `invoice.payment_succeeded` - Successful recurring payment (renewal)
  - `invoice.payment_failed` - Failed payment

**Current Renewal Flow:**
```
1. Stripe charges customer automatically (monthly)
2. Stripe sends webhook: invoice.payment_succeeded
3. Frontend webhook handler receives event
4. Frontend forwards to backend with JWT authentication
5. Backend webhook handler processes event:
   - Finds subscription by stripe_subscription_id
   - Updates current_period_start and current_period_end
   - Sets subscription_status = 'ACTIVE'
   - Sends confirmation email (if applicable)
6. Database updated in real-time
```

### 1.2 Current Database Schema

**membership_subscription Table:**
```sql
CREATE TABLE public.membership_subscription (
    id bigint PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    user_profile_id BIGINT NOT NULL,
    membership_plan_id BIGINT NOT NULL,
    subscription_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    trial_start DATE,
    trial_end DATE,
    cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    payment_provider_config_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

**Key Fields for Renewal:**
- `current_period_start` - Start of current billing period
- `current_period_end` - End of current billing period (renewal date)
- `stripe_subscription_id` - Stripe subscription identifier
- `subscription_status` - Current subscription status

### 1.3 Current Backend Capabilities

**Backend Infrastructure:**
- **Framework**: Spring Boot (Java) or Rust (based on documentation)
- **Database**: PostgreSQL
- **Multi-Tenant**: Tenant isolation via `tenant_id` field
- **JWT Authentication**: Service-level JWT for backend API calls
- **Webhook Processing**: Real-time event processing

**Current Limitations:**
- Webhook processing is synchronous and blocking
- No batch processing capability
- No reconciliation mechanism for missed webhooks
- Limited retry logic for failed webhook processing
- No scheduled job infrastructure mentioned

---

## 2. Scalability Concerns

### 2.1 Webhook Volume Projections

**Current State:**
- Low-to-medium subscription volume
- Webhooks processed in real-time
- Single backend instance handling all tenants

**Growth Scenarios:**

**Scenario 1: Small Scale (Current)**
- 100 subscriptions per tenant
- 10 tenants
- 1,000 total subscriptions
- ~1,000 webhook events/month (renewals)
- ~33 webhook events/day average
- **Status**: ✅ Current approach handles this well

**Scenario 2: Medium Scale**
- 1,000 subscriptions per tenant
- 50 tenants
- 50,000 total subscriptions
- ~50,000 webhook events/month (renewals)
- ~1,667 webhook events/day average
- ~70 webhook events/hour average
- **Status**: ⚠️ Current approach may face bottlenecks

**Scenario 3: Large Scale**
- 10,000 subscriptions per tenant
- 100 tenants
- 1,000,000 total subscriptions
- ~1,000,000 webhook events/month (renewals)
- ~33,333 webhook events/day average
- ~1,389 webhook events/hour average
- ~23 webhook events/minute average
- **Status**: ❌ Current approach will struggle

### 2.2 Webhook Processing Challenges

**1. Webhook Delivery Reliability**
- Stripe webhooks can be delayed or missed
- Network issues can cause webhook failures
- Backend downtime results in missed webhooks
- Stripe retries webhooks, but not indefinitely

**2. Concurrent Processing**
- Multiple webhooks arriving simultaneously
- Database connection pool exhaustion
- Race conditions in subscription updates
- Lock contention on subscription records

**3. Multi-Tenant Isolation**
- Each tenant requires separate Stripe account/webhook secret
- Webhook signature verification per tenant
- Tenant-specific processing logic
- Tenant data isolation requirements

**4. Error Handling**
- Failed webhook processing requires retry logic
- Partial updates can cause data inconsistency
- Dead letter queue for failed webhooks
- Manual intervention for stuck subscriptions

**5. Backend Resource Constraints**
- CPU/memory usage for webhook processing
- Database connection pool limits
- API rate limits (Stripe API calls)
- Network bandwidth for webhook forwarding

---

## 3. Batch Job Approach

### 3.1 Batch Job Architecture

**Concept:**
Instead of relying solely on real-time webhooks, implement a scheduled batch job that:
1. Queries Stripe API for subscription status
2. Compares with local database records
3. Updates database for any discrepancies
4. Handles renewals, cancellations, and status changes

**Batch Job Flow:**
```
1. Scheduled job runs daily (or multiple times per day)
2. Query database for subscriptions with current_period_end approaching
3. For each subscription:
   a. Fetch latest status from Stripe API using stripe_subscription_id
   b. Compare Stripe data with database record
   c. Update database if discrepancies found:
      - Update current_period_start and current_period_end
      - Update subscription_status
      - Handle cancellations, upgrades, downgrades
   d. Log changes for audit trail
4. Send notifications for renewals, failures, etc.
5. Generate reconciliation report
```

### 3.2 Batch Job Advantages

**1. Reliability**
- ✅ Not dependent on webhook delivery
- ✅ Handles missed webhooks automatically
- ✅ Can reconcile historical discrepancies
- ✅ Works even if webhook infrastructure fails

**2. Scalability**
- ✅ Processes subscriptions in batches
- ✅ Can be parallelized across tenants
- ✅ Can be distributed across multiple workers
- ✅ Can handle millions of subscriptions

**3. Performance**
- ✅ Bulk API calls to Stripe (more efficient)
- ✅ Batch database updates
- ✅ Reduced database connection overhead
- ✅ Optimized query patterns

**4. Control**
- ✅ Can schedule during off-peak hours
- ✅ Can prioritize critical tenants
- ✅ Can throttle API calls to Stripe
- ✅ Can implement retry logic with backoff

**5. Auditability**
- ✅ Complete reconciliation logs
- ✅ Change history tracking
- ✅ Discrepancy reports
- ✅ Performance metrics

### 3.3 Batch Job Disadvantages

**1. Latency**
- ❌ Not real-time (updates happen on schedule)
- ❌ Delayed status updates
- ❌ Users may see stale subscription status

**2. Stripe API Rate Limits**
- ❌ Stripe API has rate limits (100 requests/second)
- ❌ Need to implement rate limiting
- ❌ May require multiple API calls per subscription

**3. Resource Usage**
- ❌ Requires scheduled job infrastructure
- ❌ Database load during batch processing
- ❌ Network bandwidth for API calls

**4. Complexity**
- ❌ More complex than webhook processing
- ❌ Requires job scheduling system
- ❌ Requires error handling and retry logic
- ❌ Requires monitoring and alerting

---

## 4. Hybrid Approach Recommendation

### 4.1 Recommended Architecture

**Primary Mechanism: Batch Job**
- Scheduled batch job runs multiple times per day (e.g., every 6 hours)
- Processes subscriptions approaching renewal date
- Updates database with latest Stripe subscription data
- Handles renewals, cancellations, and status changes

**Secondary Mechanism: Webhooks**
- Webhooks continue to process real-time events
- Provides immediate updates for critical events
- Serves as fallback for batch job failures
- Handles non-renewal events (cancellations, upgrades, etc.)

**Reconciliation Job**
- Daily reconciliation job compares all active subscriptions
- Identifies discrepancies between Stripe and database
- Updates database for any mismatches
- Generates discrepancy reports

### 4.2 Hybrid Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Stripe Subscriptions                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Webhooks (Real-time)
                        │
        ┌───────────────▼───────────────┐
        │   Webhook Handler (Primary)  │
        │   - Real-time updates        │
        │   - Critical events          │
        └───────────────┬───────────────┘
                        │
                        │ Updates Database
                        │
        ┌───────────────▼───────────────┐
        │      Database                 │
        │  membership_subscription     │
        └───────────────┬───────────────┘
                        │
                        │ Batch Job (Reconciliation)
                        │
        ┌───────────────▼───────────────┐
        │   Scheduled Batch Job         │
        │   - Every 6 hours             │
        │   - Processes renewals         │
        │   - Updates from Stripe API   │
        └───────────────┬───────────────┘
                        │
                        │ Daily Reconciliation
                        │
        ┌───────────────▼───────────────┐
        │   Daily Reconciliation Job    │
        │   - Compares all subscriptions │
        │   - Fixes discrepancies        │
        │   - Generates reports          │
        └───────────────────────────────┘
```

### 4.3 Event Handling Strategy

**Webhook Events (Real-time):**
- `checkout.session.completed` - Create subscription immediately
- `customer.subscription.deleted` - Cancel subscription immediately
- `invoice.payment_failed` - Update status immediately (critical)
- `customer.subscription.updated` (non-renewal) - Update immediately

**Batch Job Events (Scheduled):**
- `invoice.payment_succeeded` (renewal) - Process in batch
- `customer.subscription.updated` (renewal) - Process in batch
- Status reconciliation - Process in batch

**Reconciliation Job (Daily):**
- Compare all active subscriptions with Stripe
- Fix any discrepancies
- Handle missed renewals
- Update stale records

---

## 5. Implementation Architecture

### 5.1 Batch Job Components

**1. Subscription Renewal Batch Job**
```typescript
// Pseudo-code structure
class SubscriptionRenewalBatchJob {
  async execute() {
    // 1. Query subscriptions approaching renewal
    const subscriptions = await this.findSubscriptionsApproachingRenewal();

    // 2. Process in batches (e.g., 100 at a time)
    for (const batch of this.chunk(subscriptions, 100)) {
      await this.processBatch(batch);
    }
  }

  async processBatch(subscriptions: Subscription[]) {
    // 3. Fetch Stripe subscription data in parallel
    const stripeData = await Promise.all(
      subscriptions.map(sub => this.fetchStripeSubscription(sub.stripeSubscriptionId))
    );

    // 4. Compare and update database
    for (let i = 0; i < subscriptions.length; i++) {
      const local = subscriptions[i];
      const stripe = stripeData[i];

      if (this.needsUpdate(local, stripe)) {
        await this.updateSubscription(local, stripe);
      }
    }
  }
}
```

**2. Stripe API Integration**
```typescript
// Fetch subscription from Stripe
async function fetchStripeSubscription(
  stripeSubscriptionId: string,
  tenantId: string
): Promise<StripeSubscription> {
  // Get tenant-specific Stripe API key
  const stripe = getStripeClient(tenantId);

  // Fetch subscription with expanded data
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    {
      expand: ['latest_invoice', 'customer']
    }
  );

  return subscription;
}
```

**3. Database Update Logic**
```typescript
async function updateSubscriptionFromStripe(
  localSubscription: MembershipSubscriptionDTO,
  stripeSubscription: StripeSubscription
) {
  const updates: Partial<MembershipSubscriptionDTO> = {};

  // Update period dates
  if (stripeSubscription.current_period_start) {
    updates.currentPeriodStart = new Date(
      stripeSubscription.current_period_start * 1000
    );
  }

  if (stripeSubscription.current_period_end) {
    updates.currentPeriodEnd = new Date(
      stripeSubscription.current_period_end * 1000
    );
  }

  // Update status
  updates.subscriptionStatus = mapStripeStatusToLocal(
    stripeSubscription.status
  );

  // Update cancellation info
  if (stripeSubscription.cancel_at_period_end) {
    updates.cancelAtPeriodEnd = true;
  }

  // Apply updates
  await updateMembershipSubscription(
    localSubscription.id,
    updates
  );
}
```

### 5.2 Job Scheduling

**Option 1: Cron-based Scheduling (Backend)**
```rust
// Rust/Spring Boot scheduled job
#[tokio::main]
async fn main() {
    // Schedule job to run every 6 hours
    tokio::spawn(async {
        let mut interval = tokio::time::interval(Duration::from_secs(6 * 3600));
        loop {
            interval.tick().await;
            subscription_renewal_batch_job().await;
        }
    });
}
```

**Option 2: Next.js API Route with Cron Trigger**
```typescript
// Next.js API route: /api/cron/subscription-renewal
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Run batch job
  await runSubscriptionRenewalBatchJob();

  return new NextResponse('OK', { status: 200 });
}
```

**Option 3: External Cron Service (Vercel Cron, AWS EventBridge)**
- Use Vercel Cron for Next.js deployments
- Use AWS EventBridge for AWS deployments
- Trigger API endpoint on schedule

### 5.3 Database Query Optimization

**Query for Subscriptions Approaching Renewal:**
```sql
-- Find subscriptions that need renewal check
SELECT
    id,
    tenant_id,
    stripe_subscription_id,
    current_period_end,
    subscription_status
FROM membership_subscription
WHERE
    subscription_status IN ('ACTIVE', 'TRIAL')
    AND current_period_end <= CURRENT_DATE + INTERVAL '7 days'
    AND cancel_at_period_end = false
ORDER BY current_period_end ASC
LIMIT 1000;
```

**Indexes Required:**
```sql
-- Index for renewal query
CREATE INDEX IF NOT EXISTS idx_membership_subscription_renewal_check
ON membership_subscription(subscription_status, current_period_end, cancel_at_period_end)
WHERE subscription_status IN ('ACTIVE', 'TRIAL');

-- Index for Stripe subscription lookup
CREATE INDEX IF NOT EXISTS idx_membership_subscription_stripe_id
ON membership_subscription(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;
```

---

## 6. Database Schema Considerations

### 6.1 Additional Fields for Batch Job

**Recommended Additions:**
```sql
ALTER TABLE membership_subscription
ADD COLUMN last_reconciliation_at TIMESTAMP,
ADD COLUMN last_stripe_sync_at TIMESTAMP,
ADD COLUMN reconciliation_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN reconciliation_error TEXT;

-- Index for reconciliation
CREATE INDEX IF NOT EXISTS idx_membership_subscription_reconciliation
ON membership_subscription(reconciliation_status, last_reconciliation_at);
```

**Fields Purpose:**
- `last_reconciliation_at` - Track when subscription was last checked
- `last_stripe_sync_at` - Track when Stripe data was last fetched
- `reconciliation_status` - Track reconciliation state (PENDING, SUCCESS, FAILED)
- `reconciliation_error` - Store error messages for failed reconciliations

### 6.2 Audit Table for Batch Job

**Recommended Table:**
```sql
CREATE TABLE membership_subscription_reconciliation_log (
    id BIGINT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    reconciliation_type VARCHAR(50) NOT NULL, -- 'BATCH_RENEWAL', 'DAILY_RECONCILIATION', 'WEBHOOK'
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'SKIPPED'
    local_period_start DATE,
    local_period_end DATE,
    stripe_period_start DATE,
    stripe_period_end DATE,
    local_status VARCHAR(20),
    stripe_status VARCHAR(20),
    changes_json JSONB, -- Store what changed
    error_message TEXT,
    processed_at TIMESTAMP NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES membership_subscription(id)
);

CREATE INDEX idx_reconciliation_log_subscription
ON membership_subscription_reconciliation_log(subscription_id, processed_at DESC);

CREATE INDEX idx_reconciliation_log_tenant
ON membership_subscription_reconciliation_log(tenant_id, processed_at DESC);
```

---

## 7. Stripe API Integration

### 7.1 Stripe API Rate Limits

**Stripe Rate Limits:**
- **100 requests per second** (per API key)
- **Burst capacity**: Can handle short spikes
- **Rate limit headers**: `Stripe-RateLimit-Limit`, `Stripe-RateLimit-Remaining`

**Batch Job Considerations:**
- Process subscriptions in batches of 100
- Implement exponential backoff for rate limit errors
- Use Stripe's `expand` parameter to reduce API calls
- Cache Stripe data when possible

### 7.2 Multi-Tenant Stripe Integration

**Tenant-Specific Stripe Accounts:**
- Each tenant has its own Stripe account
- Each tenant has its own API keys
- Webhook secrets are tenant-specific

**Batch Job Implementation:**
```typescript
// Get Stripe client for tenant
function getStripeClient(tenantId: string): Stripe {
  const apiKey = getTenantStripeApiKey(tenantId);
  return new Stripe(apiKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

// Process subscriptions per tenant
async function processTenantSubscriptions(tenantId: string) {
  const stripe = getStripeClient(tenantId);
  const subscriptions = await getTenantSubscriptions(tenantId);

  for (const subscription of subscriptions) {
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    await updateSubscription(subscription, stripeSub);
  }
}
```

### 7.3 Stripe Webhook vs API Comparison

**Webhook Approach:**
- ✅ Real-time updates
- ✅ No API rate limit concerns
- ✅ Stripe pushes data to us
- ❌ Can be missed or delayed
- ❌ Requires webhook infrastructure
- ❌ No historical reconciliation

**API Approach (Batch Job):**
- ✅ Reliable (we control when to fetch)
- ✅ Can reconcile historical data
- ✅ Works even if webhooks fail
- ❌ Subject to API rate limits
- ❌ Requires API calls (cost)
- ❌ Not real-time

**Hybrid Approach:**
- ✅ Best of both worlds
- ✅ Real-time for critical events
- ✅ Batch for renewals and reconciliation
- ✅ Redundancy and reliability

---

## 8. Multi-Tenant Considerations

### 8.1 Tenant Isolation

**Database Level:**
- All queries must filter by `tenant_id`
- Indexes should include `tenant_id`
- Foreign key constraints respect tenant boundaries

**API Level:**
- Each tenant has separate Stripe account
- Tenant-specific API keys
- Tenant-specific webhook secrets

**Batch Job Level:**
- Process tenants sequentially or in parallel
- Tenant-specific error handling
- Tenant-specific rate limiting

### 8.2 Tenant Prioritization

**Priority Levels:**
1. **High Priority**: Large tenants with many subscriptions
2. **Medium Priority**: Medium-sized tenants
3. **Low Priority**: Small tenants with few subscriptions

**Implementation:**
```typescript
// Process tenants by priority
const tenants = await getTenantsByPriority();
for (const tenant of tenants) {
  await processTenantSubscriptions(tenant.id);

  // Rate limiting per tenant
  await delay(1000); // 1 second between tenants
}
```

### 8.3 Tenant-Specific Configuration

**Configuration Fields:**
- Stripe API key per tenant
- Webhook secret per tenant
- Batch job schedule per tenant (optional)
- Rate limit settings per tenant

---

## 9. Performance Analysis

### 9.1 Batch Job Performance

**Processing Time Estimates:**

**Small Scale (1,000 subscriptions):**
- Batch size: 100 subscriptions
- Batches: 10 batches
- API calls: ~10 calls (with expand)
- Processing time: ~30 seconds
- **Status**: ✅ Very fast

**Medium Scale (50,000 subscriptions):**
- Batch size: 100 subscriptions
- Batches: 500 batches
- API calls: ~500 calls (with expand)
- Processing time: ~15 minutes
- **Status**: ✅ Acceptable

**Large Scale (1,000,000 subscriptions):**
- Batch size: 100 subscriptions
- Batches: 10,000 batches
- API calls: ~10,000 calls
- Processing time: ~5 hours (with rate limiting)
- **Status**: ⚠️ Needs optimization

**Optimization Strategies:**
- Process only subscriptions approaching renewal (not all)
- Parallel processing across tenants
- Incremental processing (process in chunks over time)
- Cache Stripe data when possible

### 9.2 Database Performance

**Query Performance:**
- Indexed queries: < 10ms per query
- Batch updates: ~100ms per batch of 100
- Reconciliation query: ~1 second for 10,000 records

**Optimization:**
- Use batch updates instead of individual updates
- Use database transactions for consistency
- Index all query fields
- Partition by tenant_id (if needed)

### 9.3 API Rate Limiting

**Stripe Rate Limits:**
- 100 requests/second
- Batch job can process ~360,000 subscriptions/hour
- For 1M subscriptions: ~3 hours (theoretical)
- With overhead: ~5-6 hours (realistic)

**Rate Limiting Strategy:**
- Process in batches of 100
- 1 second delay between batches
- Exponential backoff on rate limit errors
- Distribute processing over time

---

## 10. Risk Assessment

### 10.1 Webhook-Only Approach Risks

**High Risk:**
- ❌ Missed webhooks → Stale subscription data
- ❌ Backend downtime → Missed renewals
- ❌ Network issues → Failed webhook processing
- ❌ Webhook delivery delays → Delayed updates

**Medium Risk:**
- ⚠️ Concurrent webhook processing → Race conditions
- ⚠️ Database connection exhaustion
- ⚠️ Stripe webhook retry exhaustion

**Low Risk:**
- ✅ Webhook signature verification failures (handled)

### 10.2 Batch Job Approach Risks

**High Risk:**
- ❌ Stripe API rate limits → Job failures
- ❌ Long processing time → Delayed updates
- ❌ Job failures → Missed renewals

**Medium Risk:**
- ⚠️ Database performance during batch processing
- ⚠️ Network issues during API calls
- ⚠️ Stripe API downtime

**Low Risk:**
- ✅ Job scheduling failures (can retry)
- ✅ Partial batch failures (can retry)

### 10.3 Hybrid Approach Risks

**Mitigated Risks:**
- ✅ Webhook failures → Batch job handles
- ✅ Batch job failures → Webhooks handle
- ✅ Missed renewals → Reconciliation job fixes
- ✅ Stale data → Daily reconciliation fixes

**Remaining Risks:**
- ⚠️ Both systems fail simultaneously (very low probability)
- ⚠️ Stripe API downtime (affects batch job only)
- ⚠️ Database downtime (affects both)

**Risk Mitigation:**
- Monitor both webhook and batch job systems
- Alert on failures
- Manual reconciliation process
- Disaster recovery plan

---

## 11. Testing Approach and Strategies

### 11.1 Overview

Testing subscription renewal functionality presents unique challenges because:
- **Monthly Renewal Cycle**: Waiting a full month to test renewals is impractical
- **Webhook Dependencies**: Testing requires simulating Stripe webhook events
- **Multi-Tenant Complexity**: Testing across multiple tenants adds complexity
- **Data Consistency**: Ensuring database updates match Stripe subscription state

This section provides comprehensive testing strategies that allow testing subscription renewals **without waiting a month**, using Stripe test mode, webhook simulation, and batch job testing.

### 11.2 Stripe Test Mode Setup

#### 11.2.1 Test Mode Configuration

**Environment Variables:**
```bash
# Test Mode Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Production Mode Stripe Keys (for comparison)
STRIPE_SECRET_KEY_PROD=sk_live_...
STRIPE_PUBLISHABLE_KEY_PROD=pk_live_...
```

**Test Mode Benefits:**
- ✅ No real charges (uses test cards)
- ✅ Can create subscriptions instantly
- ✅ Can advance subscription billing cycles
- ✅ Can simulate payment failures
- ✅ Can test webhooks locally

#### 11.2.2 Test Card Numbers

**Successful Payment Cards:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Payment Failure Cards:**
```
Card declined: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
Expired card: 4000 0000 0000 0069
```

**3D Secure Cards:**
```
Requires authentication: 4000 0027 6000 3184
```

### 11.3 Testing Subscription Renewals Without Waiting

#### 11.3.1 Method 1: Stripe CLI Webhook Forwarding

**Setup Stripe CLI:**
```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: Download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Trigger Test Subscription Renewal:**
```bash
# Create a test subscription with 1-day billing cycle
stripe subscriptions create \
  --customer cus_test_customer \
  --items[0][price]=price_test_monthly \
  --billing-cycle-anchor=now \
  --billing-cycle-anchor-behavior=now

# Advance subscription billing cycle (simulate renewal)
stripe subscriptions update sub_test_subscription \
  --billing-cycle-anchor=now \
  --proration-behavior=none

# Trigger invoice.payment_succeeded webhook manually
stripe trigger invoice.payment_succeeded \
  --override subscription=sub_test_subscription
```

#### 11.3.2 Method 2: Stripe Dashboard Test Mode

**Steps:**
1. Go to Stripe Dashboard → Test Mode
2. Create a test customer
3. Create a test subscription with **daily billing** (for faster testing)
4. Manually trigger renewal:
   - Go to Subscriptions → Select subscription
   - Click "..." → "Update subscription"
   - Change billing cycle anchor to "now"
   - Save (triggers renewal immediately)

**Daily Billing Setup:**
```typescript
// Create test price with daily billing
const price = await stripe.prices.create({
  unit_amount: 1000, // $10.00
  currency: 'usd',
  recurring: {
    interval: 'day', // Daily instead of monthly
    interval_count: 1,
  },
  product_data: {
    name: 'Test Monthly Plan (Daily Billing)',
  },
});
```

#### 11.3.3 Method 3: Programmatic Subscription Renewal

**Create Test Script:**
```typescript
// scripts/test-subscription-renewal.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function testSubscriptionRenewal(subscriptionId: string) {
  // 1. Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  console.log('Current subscription:', {
    id: subscription.id,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    status: subscription.status,
  });

  // 2. Advance billing cycle (simulate renewal)
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    billing_cycle_anchor: 'now', // Renew immediately
    proration_behavior: 'none', // Don't prorate
  });

  console.log('Updated subscription:', {
    id: updatedSubscription.id,
    current_period_start: new Date(updatedSubscription.current_period_start * 1000),
    current_period_end: new Date(updatedSubscription.current_period_end * 1000),
    status: updatedSubscription.status,
  });

  // 3. Trigger invoice creation (if needed)
  const invoice = await stripe.invoices.create({
    customer: subscription.customer as string,
    subscription: subscriptionId,
    auto_advance: true, // Automatically finalize invoice
  });

  // 4. Pay invoice (simulates successful payment)
  const paidInvoice = await stripe.invoices.pay(invoice.id);

  console.log('Invoice paid:', {
    id: paidInvoice.id,
    status: paidInvoice.status,
    amount_paid: paidInvoice.amount_paid,
  });

  return updatedSubscription;
}

// Run test
testSubscriptionRenewal('sub_test_subscription_id')
  .then(() => console.log('Test completed'))
  .catch(console.error);
```

#### 11.3.4 Method 4: Mock Webhook Events

**Create Mock Webhook Handler:**
```typescript
// scripts/mock-webhook-renewal.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function mockSubscriptionRenewalWebhook(subscriptionId: string) {
  // 1. Fetch subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  });

  // 2. Create mock webhook event payload
  const mockEvent: Stripe.Event = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2024-11-20.acacia',
    created: Math.floor(Date.now() / 1000),
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: subscription.latest_invoice as string,
        object: 'invoice',
        subscription: subscriptionId,
        customer: subscription.customer as string,
        status: 'paid',
        amount_paid: subscription.items.data[0].price.unit_amount || 0,
        period_start: subscription.current_period_start,
        period_end: subscription.current_period_end,
      } as Stripe.Invoice,
      previous_attributes: {},
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: `req_test_${Date.now()}`,
      idempotency_key: null,
    },
  };

  // 3. Send to webhook handler
  const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'mock_signature', // Will need proper signature for production
    },
    body: JSON.stringify(mockEvent),
  });

  console.log('Webhook response:', await response.text());
}

// Run mock webhook
mockSubscriptionRenewalWebhook('sub_test_subscription_id')
  .then(() => console.log('Mock webhook sent'))
  .catch(console.error);
```

### 11.4 Testing Batch Jobs

#### 11.4.1 Manual Batch Job Trigger

**Create Test Endpoint:**
```typescript
// src/app/api/test/subscription-renewal-batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';

export async function POST(req: NextRequest) {
  // Verify test secret (for security)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.TEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Trigger batch job manually
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const jwt = await getCachedApiJwt() || await generateApiJwt();

    const response = await fetch(`${API_BASE_URL}/api/cron/subscription-renewal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        tenantId: req.body?.tenantId, // Optional: test specific tenant
        batchSize: 10, // Small batch for testing
        maxSubscriptions: 100, // Limit for testing
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Batch job failed', details: String(error) },
      { status: 500 }
    );
  }
}
```

**Test Batch Job:**
```bash
# Trigger batch job manually
curl -X POST http://localhost:3000/api/test/subscription-renewal-batch \
  -H "Authorization: Bearer YOUR_TEST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "tenant_demo_001"}'
```

#### 11.4.2 Test Data Setup for Batch Job

**Create Test Subscriptions:**
```sql
-- Insert test subscriptions with different renewal dates
INSERT INTO membership_subscription (
  tenant_id,
  user_profile_id,
  membership_plan_id,
  subscription_status,
  current_period_start,
  current_period_end,
  stripe_subscription_id,
  stripe_customer_id,
  created_at,
  updated_at
) VALUES
-- Subscription renewing today
('tenant_demo_001', 1, 1, 'ACTIVE',
 CURRENT_DATE - INTERVAL '29 days',
 CURRENT_DATE, -- Renews today
 'sub_test_renew_today',
 'cus_test_customer_1',
 NOW(), NOW()),

-- Subscription renewing tomorrow
('tenant_demo_001', 2, 1, 'ACTIVE',
 CURRENT_DATE - INTERVAL '28 days',
 CURRENT_DATE + INTERVAL '1 day', -- Renews tomorrow
 'sub_test_renew_tomorrow',
 'cus_test_customer_2',
 NOW(), NOW()),

-- Subscription renewing in 7 days
('tenant_demo_001', 3, 1, 'ACTIVE',
 CURRENT_DATE - INTERVAL '21 days',
 CURRENT_DATE + INTERVAL '7 days', -- Renews in 7 days
 'sub_test_renew_week',
 'cus_test_customer_3',
 NOW(), NOW());
```

**Verify Batch Job Processing:**
```sql
-- Check which subscriptions were processed
SELECT
  id,
  stripe_subscription_id,
  current_period_end,
  last_reconciliation_at,
  reconciliation_status
FROM membership_subscription
WHERE tenant_id = 'tenant_demo_001'
ORDER BY current_period_end ASC;
```

### 11.5 Testing Webhook Processing

#### 11.5.1 Stripe CLI Webhook Testing

**Listen to Webhooks:**
```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe \
  --events invoice.payment_succeeded,customer.subscription.updated

# In another terminal, trigger test events
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.updated
```

**Test Specific Subscription:**
```bash
# Trigger renewal webhook for specific subscription
stripe trigger invoice.payment_succeeded \
  --override subscription=sub_test_subscription_id \
  --override customer=cus_test_customer_id
```

#### 11.5.2 Webhook Event Verification

**Check Webhook Processing:**
```typescript
// scripts/verify-webhook-processing.ts
async function verifyWebhookProcessing(subscriptionId: string) {
  // 1. Get subscription from database
  const dbSubscription = await fetch(
    `/api/proxy/membership-subscriptions?stripeSubscriptionId.equals=${subscriptionId}`
  ).then(r => r.json());

  // 2. Get subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // 3. Compare
  console.log('Database:', {
    current_period_start: dbSubscription[0].currentPeriodStart,
    current_period_end: dbSubscription[0].currentPeriodEnd,
    status: dbSubscription[0].subscriptionStatus,
  });

  console.log('Stripe:', {
    current_period_start: new Date(stripeSubscription.current_period_start * 1000),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000),
    status: stripeSubscription.status,
  });

  // 4. Verify match
  const matches =
    dbSubscription[0].currentPeriodEnd ===
    new Date(stripeSubscription.current_period_end * 1000).toISOString().split('T')[0];

  console.log('Match:', matches ? '✅' : '❌');
}
```

### 11.6 Testing Reconciliation Job

#### 11.6.1 Create Test Discrepancies

**Manually Create Discrepancies:**
```sql
-- Update database to create discrepancy with Stripe
UPDATE membership_subscription
SET
  current_period_end = CURRENT_DATE - INTERVAL '1 day', -- Outdated
  subscription_status = 'ACTIVE' -- Should be updated
WHERE stripe_subscription_id = 'sub_test_subscription_id';

-- Run reconciliation job
-- Verify it fixes the discrepancy
```

#### 11.6.2 Test Reconciliation Logic

**Reconciliation Test Script:**
```typescript
// scripts/test-reconciliation.ts
async function testReconciliation() {
  // 1. Get all active subscriptions
  const subscriptions = await fetch(
    '/api/proxy/membership-subscriptions?subscriptionStatus.equals=ACTIVE'
  ).then(r => r.json());

  // 2. For each subscription, compare with Stripe
  const discrepancies = [];

  for (const sub of subscriptions) {
    if (!sub.stripeSubscriptionId) continue;

    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);

    const dbPeriodEnd = new Date(sub.currentPeriodEnd);
    const stripePeriodEnd = new Date(stripeSub.current_period_end * 1000);

    if (dbPeriodEnd.getTime() !== stripePeriodEnd.getTime()) {
      discrepancies.push({
        subscriptionId: sub.id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        dbPeriodEnd: dbPeriodEnd.toISOString(),
        stripePeriodEnd: stripePeriodEnd.toISOString(),
      });
    }
  }

  console.log(`Found ${discrepancies.length} discrepancies:`, discrepancies);

  // 3. Trigger reconciliation job
  await fetch('/api/cron/subscription-reconciliation', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.TEST_SECRET}` },
  });

  // 4. Verify discrepancies fixed
  // (re-run comparison)
}
```

### 11.7 Integration Testing

#### 11.7.1 End-to-End Renewal Test

**Complete Test Flow:**
```typescript
// tests/integration/subscription-renewal.test.ts
describe('Subscription Renewal Integration', () => {
  let testSubscriptionId: string;
  let testCustomerId: string;

  beforeEach(async () => {
    // 1. Create test customer
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'true' },
    });
    testCustomerId = customer.id;

    // 2. Create test subscription with daily billing
    const subscription = await stripe.subscriptions.create({
      customer: testCustomerId,
      items: [{ price: 'price_test_daily' }],
      metadata: {
        tenantId: 'tenant_demo_001',
        userProfileId: '1',
        membershipPlanId: '1',
      },
    });
    testSubscriptionId = subscription.id;
  });

  afterEach(async () => {
    // Cleanup
    await stripe.subscriptions.del(testSubscriptionId);
    await stripe.customers.del(testCustomerId);
  });

  test('Subscription renewal updates database', async () => {
    // 1. Get initial state
    const initialDbSub = await getSubscriptionFromDb(testSubscriptionId);
    const initialStripeSub = await stripe.subscriptions.retrieve(testSubscriptionId);

    // 2. Advance billing cycle (simulate renewal)
    await stripe.subscriptions.update(testSubscriptionId, {
      billing_cycle_anchor: 'now',
    });

    // 3. Trigger payment webhook
    await triggerWebhook('invoice.payment_succeeded', {
      subscription: testSubscriptionId,
    });

    // 4. Wait for webhook processing
    await wait(2000);

    // 5. Verify database updated
    const updatedDbSub = await getSubscriptionFromDb(testSubscriptionId);
    const updatedStripeSub = await stripe.subscriptions.retrieve(testSubscriptionId);

    expect(updatedDbSub.currentPeriodEnd).toBe(
      formatDate(updatedStripeSub.current_period_end)
    );
    expect(updatedDbSub.subscriptionStatus).toBe('ACTIVE');
  });

  test('Batch job processes renewals', async () => {
    // 1. Set subscription to renew today
    await updateSubscriptionPeriodEnd(testSubscriptionId, new Date());

    // 2. Run batch job
    await triggerBatchJob();

    // 3. Verify database updated
    const dbSub = await getSubscriptionFromDb(testSubscriptionId);
    const stripeSub = await stripe.subscriptions.retrieve(testSubscriptionId);

    expect(dbSub.currentPeriodEnd).toBe(formatDate(stripeSub.current_period_end));
  });
});
```

### 11.8 Test Data Management

#### 11.8.1 Test Subscription Factory

**Create Test Data Helper:**
```typescript
// tests/helpers/subscription-factory.ts
export class SubscriptionTestFactory {
  static async createTestSubscription(options: {
    tenantId: string;
    userId: string;
    planId: number;
    billingInterval?: 'day' | 'month';
    trialDays?: number;
  }) {
    // 1. Create Stripe customer
    const customer = await stripe.customers.create({
      email: `test_${Date.now()}@example.com`,
      metadata: {
        tenantId: options.tenantId,
        userId: options.userId,
      },
    });

    // 2. Create Stripe price (if needed)
    const price = await stripe.prices.create({
      unit_amount: 1000, // $10.00
      currency: 'usd',
      recurring: {
        interval: options.billingInterval || 'month',
      },
      product_data: {
        name: 'Test Plan',
      },
    });

    // 3. Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: options.trialDays || 0,
      metadata: {
        tenantId: options.tenantId,
        userProfileId: options.userId,
        membershipPlanId: String(options.planId),
      },
    });

    // 4. Create database record
    const dbSubscription = await createMembershipSubscription({
      tenantId: options.tenantId,
      userProfileId: parseInt(options.userId),
      membershipPlanId: options.planId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customer.id,
      subscriptionStatus: options.trialDays ? 'TRIAL' : 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    return {
      stripe: subscription,
      database: dbSubscription,
      customer,
      price,
    };
  }

  static async cleanupTestSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await stripe.subscriptions.del(subscriptionId);
    await stripe.customers.del(subscription.customer as string);
    await deleteMembershipSubscription(subscriptionId);
  }
}
```

#### 11.8.2 Test Database Seeding

**Seed Test Data:**
```sql
-- scripts/seed-test-subscriptions.sql
-- Create test subscriptions with various states

-- Active subscription renewing today
INSERT INTO membership_subscription (
  tenant_id, user_profile_id, membership_plan_id,
  subscription_status, current_period_start, current_period_end,
  stripe_subscription_id, stripe_customer_id
) VALUES (
  'tenant_demo_001', 1, 1,
  'ACTIVE', CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE,
  'sub_test_renew_today_1', 'cus_test_1'
);

-- Active subscription renewing tomorrow
INSERT INTO membership_subscription (
  tenant_id, user_profile_id, membership_plan_id,
  subscription_status, current_period_start, current_period_end,
  stripe_subscription_id, stripe_customer_id
) VALUES (
  'tenant_demo_001', 2, 1,
  'ACTIVE', CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE + INTERVAL '1 day',
  'sub_test_renew_tomorrow_1', 'cus_test_2'
);

-- Trial subscription ending today
INSERT INTO membership_subscription (
  tenant_id, user_profile_id, membership_plan_id,
  subscription_status, current_period_start, current_period_end,
  trial_start, trial_end,
  stripe_subscription_id, stripe_customer_id
) VALUES (
  'tenant_demo_001', 3, 1,
  'TRIAL', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE,
  'sub_test_trial_ending', 'cus_test_3'
);
```

### 11.9 Testing Checklist

#### 11.9.1 Webhook Testing Checklist

- [ ] **Webhook Reception**
  - [ ] Webhook received from Stripe
  - [ ] Webhook signature verified
  - [ ] Webhook forwarded to backend
  - [ ] Webhook processed successfully

- [ ] **Subscription Renewal Webhook**
  - [ ] `invoice.payment_succeeded` webhook received
  - [ ] Database `current_period_start` updated
  - [ ] Database `current_period_end` updated
  - [ ] Database `subscription_status` set to ACTIVE
  - [ ] Reconciliation log created

- [ ] **Subscription Update Webhook**
  - [ ] `customer.subscription.updated` webhook received
  - [ ] Database updated with new period dates
  - [ ] Status changes handled correctly

- [ ] **Error Handling**
  - [ ] Failed webhook processing retries
  - [ ] Error logged correctly
  - [ ] Dead letter queue works

#### 11.9.2 Batch Job Testing Checklist

- [ ] **Batch Job Execution**
  - [ ] Job runs on schedule
  - [ ] Job processes subscriptions correctly
  - [ ] Job handles errors gracefully
  - [ ] Job logs execution details

- [ ] **Subscription Processing**
  - [ ] Subscriptions approaching renewal identified
  - [ ] Stripe API called for each subscription
  - [ ] Database updated with Stripe data
  - [ ] Discrepancies detected and fixed

- [ ] **Performance**
  - [ ] Batch job completes within time limit
  - [ ] API rate limits respected
  - [ ] Database queries optimized
  - [ ] Memory usage acceptable

#### 11.9.3 Reconciliation Testing Checklist

- [ ] **Reconciliation Job**
  - [ ] Job runs daily
  - [ ] All active subscriptions checked
  - [ ] Discrepancies identified
  - [ ] Discrepancies fixed automatically

- [ ] **Discrepancy Detection**
  - [ ] Period date mismatches detected
  - [ ] Status mismatches detected
  - [ ] Cancellation mismatches detected
  - [ ] Report generated correctly

### 11.10 Testing Tools and Utilities

#### 11.10.1 Stripe CLI Commands

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Create test subscription
stripe subscriptions create \
  --customer cus_test_customer \
  --items[0][price]=price_test_monthly

# Update subscription (simulate renewal)
stripe subscriptions update sub_test_subscription \
  --billing-cycle-anchor=now
```

#### 11.10.2 Test Scripts

**Create Test Scripts Directory:**
```
scripts/
  test-subscription-renewal.ts
  mock-webhook-renewal.ts
  verify-webhook-processing.ts
  test-reconciliation.ts
  seed-test-subscriptions.ts
```

**Run Test Scripts:**
```bash
# Run TypeScript test scripts
npx tsx scripts/test-subscription-renewal.ts

# Run SQL seed scripts
psql -d your_database -f scripts/seed-test-subscriptions.sql
```

### 11.11 Testing Best Practices

#### 11.11.1 Test Isolation

- ✅ Use separate test Stripe account
- ✅ Use test database (not production)
- ✅ Clean up test data after tests
- ✅ Use test-specific tenant IDs

#### 11.11.2 Test Data Management

- ✅ Create test subscriptions programmatically
- ✅ Use consistent naming conventions
- ✅ Tag test data with metadata
- ✅ Clean up test data automatically

#### 11.11.3 Test Automation

- ✅ Automate webhook testing
- ✅ Automate batch job testing
- ✅ Automate reconciliation testing
- ✅ Run tests in CI/CD pipeline

#### 11.11.4 Test Monitoring

- ✅ Log all test executions
- ✅ Track test success/failure rates
- ✅ Monitor test performance
- ✅ Alert on test failures

---

## 12. Implementation Recommendations

### 12.1 Phase 1: Enhance Current Webhook System (Week 1-2)

**Tasks:**
1. Add webhook event logging
2. Implement webhook retry logic
3. Add webhook failure alerts
4. Improve error handling

**Deliverables:**
- Enhanced webhook handler
- Webhook event log table
- Monitoring and alerting

### 12.2 Phase 2: Implement Batch Job (Week 3-4)

**Tasks:**
1. Create batch job infrastructure
2. Implement Stripe API integration
3. Create database update logic
4. Add job scheduling

**Deliverables:**
- Batch job service
- Scheduled job execution
- Database updates
- Job monitoring

### 12.3 Phase 3: Implement Reconciliation Job (Week 5)

**Tasks:**
1. Create daily reconciliation job
2. Implement discrepancy detection
3. Add reconciliation reporting
4. Create audit logs

**Deliverables:**
- Reconciliation job
- Discrepancy reports
- Audit log table
- Monitoring dashboard

### 12.4 Phase 4: Testing and Optimization (Week 6)

**Tasks:**
1. Load testing
2. Performance optimization
3. Error handling testing
4. Multi-tenant testing

**Deliverables:**
- Performance benchmarks
- Optimization recommendations
- Test results
- Documentation

### 12.5 Implementation Priority

**High Priority:**
1. ✅ Batch job for subscription renewals
2. ✅ Daily reconciliation job
3. ✅ Webhook event logging
4. ✅ Monitoring and alerting

**Medium Priority:**
1. ⚠️ Tenant prioritization
2. ⚠️ Performance optimization
3. ⚠️ Advanced error handling

**Low Priority:**
1. 📋 Historical reconciliation
2. 📋 Advanced reporting
3. 📋 Manual intervention tools

---

## 13. Technical Specifications

### 13.1 Batch Job API Endpoint

**Endpoint:** `POST /api/cron/subscription-renewal`

**Authentication:**
- Cron secret in Authorization header
- Or JWT authentication for manual triggers

**Request:**
```json
{
  "tenantId": "optional", // If provided, process only this tenant
  "batchSize": 100, // Default: 100
  "maxSubscriptions": 10000 // Default: 10000
}
```

**Response:**
```json
{
  "status": "success",
  "processed": 1000,
  "updated": 50,
  "skipped": 950,
  "errors": 0,
  "duration": "30s"
}
```

### 13.2 Reconciliation Job API Endpoint

**Endpoint:** `POST /api/cron/subscription-reconciliation`

**Authentication:**
- Cron secret in Authorization header

**Request:**
```json
{
  "tenantId": "optional", // If provided, reconcile only this tenant
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "checked": 5000,
  "discrepancies": 10,
  "fixed": 10,
  "errors": 0,
  "duration": "5m"
}
```

### 13.3 Database Migration Scripts

**Migration 1: Add Reconciliation Fields**
```sql
ALTER TABLE membership_subscription
ADD COLUMN last_reconciliation_at TIMESTAMP,
ADD COLUMN last_stripe_sync_at TIMESTAMP,
ADD COLUMN reconciliation_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN reconciliation_error TEXT;

CREATE INDEX idx_membership_subscription_reconciliation
ON membership_subscription(reconciliation_status, last_reconciliation_at);
```

**Migration 2: Create Reconciliation Log Table**
```sql
CREATE TABLE membership_subscription_reconciliation_log (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.sequence_generator'),
    subscription_id BIGINT NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    reconciliation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    local_period_start DATE,
    local_period_end DATE,
    stripe_period_start DATE,
    stripe_period_end DATE,
    local_status VARCHAR(20),
    stripe_status VARCHAR(20),
    changes_json JSONB,
    error_message TEXT,
    processed_at TIMESTAMP NOT NULL DEFAULT now(),
    FOREIGN KEY (subscription_id) REFERENCES membership_subscription(id)
);

CREATE INDEX idx_reconciliation_log_subscription
ON membership_subscription_reconciliation_log(subscription_id, processed_at DESC);

CREATE INDEX idx_reconciliation_log_tenant
ON membership_subscription_reconciliation_log(tenant_id, processed_at DESC);
```

---

## 14. Monitoring and Alerting

### 14.1 Key Metrics

**Webhook Metrics:**
- Webhook events received per hour
- Webhook processing success rate
- Webhook processing time
- Failed webhook count

**Batch Job Metrics:**
- Batch job execution time
- Subscriptions processed per batch
- Subscriptions updated per batch
- API call count
- Rate limit errors

**Reconciliation Metrics:**
- Subscriptions checked per day
- Discrepancies found per day
- Discrepancies fixed per day
- Reconciliation job duration

**Database Metrics:**
- Subscription update queries per second
- Database connection pool usage
- Query execution time
- Lock contention

### 14.2 Alerts

**Critical Alerts:**
- Batch job failure
- Reconciliation job failure
- High discrepancy rate (> 1%)
- Stripe API rate limit exceeded
- Database connection pool exhausted

**Warning Alerts:**
- Slow batch job execution (> 1 hour)
- High webhook failure rate (> 5%)
- Many subscriptions not updated (> 10%)

---

## 15. Conclusion

### 15.1 Summary

The current webhook-only approach works well for low-to-medium scale but will face scalability challenges as the user base grows. A hybrid approach combining webhooks with batch job reconciliation provides:

1. **Reliability**: Batch job handles missed webhooks
2. **Scalability**: Can process millions of subscriptions
3. **Real-time Updates**: Webhooks provide immediate updates
4. **Data Consistency**: Reconciliation job ensures accuracy
5. **Multi-Tenant Support**: Handles multiple tenants efficiently

### 15.2 Recommended Approach

**Implement Hybrid System:**
- ✅ Keep webhooks for real-time critical events
- ✅ Add batch job for subscription renewals (every 6 hours)
- ✅ Add daily reconciliation job for data consistency
- ✅ Add monitoring and alerting for both systems
- ✅ Add audit logging for all updates

### 15.3 Next Steps

1. **Review this analysis** with backend and frontend teams
2. **Design detailed implementation plan** based on this analysis
3. **Create technical specifications** for batch job components
4. **Implement Phase 1** (enhance webhook system)
5. **Implement Phase 2** (batch job)
6. **Implement Phase 3** (reconciliation job)
7. **Test and optimize** the system

---

## Appendix A: References

### Documentation
- [Stripe Subscriptions API](https://stripe.com/docs/api/subscriptions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Rate Limits](https://stripe.com/docs/rate-limits)
- [Membership Subscription PRD](./MEMBERSHIP_SUBSCRIPTION_PRD.md)
- [Backend PRD](./MEMBERSHIP_SUBSCRIPTION_BACKEND_PRD.html)

### Code References
- Frontend Webhook Handler: `src/app/api/webhooks/stripe/route.ts`
- Database Schema: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_11.sql`
- API Documentation: `documentation/Swagger_API_Docs/api-docs.json`
- Next.js API Rules: `.cursor/rules/nextjs_api_routes.mdc`

### Related Projects
- Frontend: `E:\project_workspace\mosc-temp`
- Backend: `E:\project_workspace\malayalees-us-site-boot`

---

## Document Approval

- **Product Owner**: _________________ Date: ___________
- **Technical Lead**: _________________ Date: ___________
- **Backend Lead**: _________________ Date: ___________
- **Frontend Lead**: _________________ Date: ___________

---

**End of Analysis Report**

