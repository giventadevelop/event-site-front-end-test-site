# Stripe Webhook Architecture Analysis - Multi-Tenant Payment Method Domains

## Problem Statement

You have multiple payment method domains registered in Stripe, each with its own webhook endpoint and webhook secret. However, you're receiving webhook events with tenant IDs that don't match your configured `NEXT_PUBLIC_TENANT_ID`.

## How Stripe Webhooks Work with Multiple Endpoints

### Key Understanding: Stripe DOES "Fan Out" Events

**Stripe's Behavior:**
- When you configure **multiple webhook endpoints** in Stripe Dashboard, Stripe sends the **same event** to **ALL endpoints** that match the event type
- Each webhook endpoint has its **own unique webhook secret**
- If multiple endpoints point to the **same URL** (your frontend endpoint), you'll receive **multiple copies** of the same event, each with a signature that matches its respective webhook secret

### Your Current Architecture

```
Stripe Account (Single Account)
├── Payment Method Domain 1 (tenant_demo_001)
│   └── Webhook Endpoint: https://yourdomain.com/api/webhooks/stripe
│       └── Webhook Secret: whsec_xxx_001
├── Payment Method Domain 2 (tenant_demo_002) ← Your configured tenant
│   └── Webhook Endpoint: https://yourdomain.com/api/webhooks/stripe (SAME URL!)
│       └── Webhook Secret: whsec_xxx_002
└── Payment Method Domain 3 (tenant_demo_003)
    └── Webhook Endpoint: https://yourdomain.com/api/webhooks/stripe (SAME URL!)
        └── Webhook Secret: whsec_xxx_003
```

**The Problem:**
- All webhook endpoints point to the **same URL** (`/api/webhooks/stripe`)
- Your frontend code only uses **ONE webhook secret** from `STRIPE_WEBHOOK_SECRET` environment variable
- When Stripe sends an event, it sends it to **ALL endpoints** (same URL, different secrets)
- Your code tries to verify with only **ONE secret**, so:
  - Events from `tenant_demo_002` (your configured tenant) → ✅ Signature matches → Processed
  - Events from `tenant_demo_001` or `tenant_demo_003` → ❌ Signature doesn't match → Should fail, but...

**Why Events with Wrong Tenant IDs Are Getting Through:**

1. **If signature verification fails**, the event should be rejected (400 error)
2. **If events are passing**, it means:
   - Either signature verification is passing (webhook secret matches)
   - Or tenant ID is coming from metadata, not from webhook secret verification
   - Or there's a bug in signature verification

## Solution: Multi-Secret Webhook Verification

### Approach 1: Try Multiple Webhook Secrets (Recommended)

Instead of using a single webhook secret from environment variable, retrieve webhook secrets from the database (`payment_provider_config` table) and try each one until signature verification succeeds.

**Benefits:**
- ✅ Automatically identifies which tenant the event belongs to
- ✅ Supports multiple tenants with different webhook secrets
- ✅ No need to rely on metadata tenant IDs

**Implementation:**
1. Query `payment_provider_config` table for all active Stripe configurations
2. Try each webhook secret until signature verification succeeds
3. Once verified, use the matching tenant's configuration
4. Filter events to only process those matching `NEXT_PUBLIC_TENANT_ID`

### Approach 2: Separate Webhook Endpoints Per Tenant

Configure different webhook URLs for each tenant:
- `https://yourdomain.com/api/webhooks/stripe/tenant_demo_001`
- `https://yourdomain.com/api/webhooks/stripe/tenant_demo_002`
- `https://yourdomain.com/api/webhooks/stripe/tenant_demo_003`

**Benefits:**
- ✅ Clear separation of webhook events
- ✅ Each endpoint uses its own webhook secret
- ✅ No need to try multiple secrets

**Drawbacks:**
- ❌ Requires multiple webhook endpoint configurations
- ❌ More complex routing logic

### Approach 3: Filter by Metadata Tenant ID (Current Partial Solution)

Your current code already filters by metadata tenant ID, but this is **not reliable** because:
- ❌ Metadata can be missing or incorrect
- ❌ Doesn't prevent signature verification issues
- ❌ Events might pass signature verification but belong to wrong tenant

## Recommended Implementation: Multi-Secret Verification

### Step 1: Retrieve Webhook Secrets from Database

Query `payment_provider_config` table to get all Stripe webhook secrets:

```typescript
// Query backend API to get all Stripe configurations
const stripeConfigs = await fetch(`${API_BASE_URL}/api/payment-provider-configs?providerType.equals=STRIPE&isActive.equals=true`);
```

### Step 2: Try Each Webhook Secret

Try each webhook secret until one matches:

```typescript
let verifiedEvent: Stripe.Event | null = null;
let matchingTenantId: string | null = null;

for (const config of stripeConfigs) {
  try {
    const webhookSecret = decryptWebhookSecret(config.webhookSecretEncrypted);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    verifiedEvent = event;
    matchingTenantId = config.tenantId;
    break; // Found matching secret
  } catch (err) {
    // Signature doesn't match, try next secret
    continue;
  }
}

if (!verifiedEvent) {
  return new NextResponse('Invalid webhook signature', { status: 400 });
}

// Now verify tenant ID matches configured tenant
if (matchingTenantId !== getTenantId()) {
  console.warn('[STRIPE-WEBHOOK] Event belongs to different tenant, ignoring');
  return new NextResponse('Event ignored - tenant mismatch', { status: 200 });
}
```

### Step 3: Process Event with Correct Tenant Context

Once verified, process the event using the matching tenant's configuration.

## Why This Happens: Payment Method Domains vs Webhook Endpoints

**Important Distinction:**
- **Payment Method Domains** are for Apple Pay/Google Pay domain verification
- **Webhook Endpoints** are separate configurations in Stripe Dashboard
- **They are NOT automatically linked** - you can have multiple webhook endpoints regardless of payment method domains

**What's Likely Happening:**
1. You registered multiple payment method domains (one per tenant)
2. You configured separate webhook endpoints in Stripe Dashboard (one per tenant)
3. All webhook endpoints point to the same URL (your frontend)
4. Stripe sends events to ALL endpoints (fan-out behavior)
5. Your code only verifies with ONE secret, so events from other tenants either:
   - Fail signature verification (should be rejected)
   - OR pass verification if the secret happens to match

## Next Steps

1. **Check Stripe Dashboard** - How many webhook endpoints are configured?
2. **Check Webhook Secrets** - Are they all different or the same?
3. **Implement Multi-Secret Verification** - Try all secrets from database
4. **Add Logging** - Track which webhook secret matches for each event
5. **Filter by Tenant ID** - Only process events matching `NEXT_PUBLIC_TENANT_ID`

