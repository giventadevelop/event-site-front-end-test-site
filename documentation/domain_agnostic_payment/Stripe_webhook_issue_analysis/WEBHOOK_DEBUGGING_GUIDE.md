# Webhook Debugging Guide - Multi-Tenant Stripe Webhooks

## Understanding Why You're Receiving Events with Wrong Tenant IDs

### The Root Cause: Stripe's Fan-Out Behavior

**Stripe sends webhook events to ALL configured webhook endpoints** that match the event type. This is called "fan-out" behavior.

### Your Current Setup

```
Stripe Dashboard → Webhooks
├── Endpoint 1: https://yourdomain.com/api/webhooks/stripe
│   └── Secret: whsec_xxx_001 (tenant_demo_001)
├── Endpoint 2: https://yourdomain.com/api/webhooks/stripe (SAME URL!)
│   └── Secret: whsec_xxx_002 (tenant_demo_002) ← Your configured tenant
└── Endpoint 3: https://yourdomain.com/api/webhooks/stripe (SAME URL!)
    └── Secret: whsec_xxx_003 (tenant_demo_003)
```

**What Happens:**
1. A payment is made for `tenant_demo_001`
2. Stripe sends the `payment_intent.succeeded` event to **ALL 3 endpoints**
3. Your frontend receives **3 copies** of the same event
4. Each copy has a signature that matches its respective webhook secret
5. Your code only verifies with `whsec_xxx_002` (from environment variable)
6. Events from `tenant_demo_001` and `tenant_demo_003` **fail signature verification** → Should be rejected ✅
7. Event from `tenant_demo_002` **passes signature verification** → Processed ✅

### Why Events with Wrong Tenant IDs Might Be Getting Through

**Scenario 1: Signature Verification is Passing (Most Likely)**
- If events are passing signature verification, it means the webhook secret matches
- This suggests you might be using the same webhook secret for multiple tenants
- **Check:** Are all webhook secrets in Stripe Dashboard different or the same?

**Scenario 2: Tenant ID in Metadata**
- Events might have tenant IDs in metadata that don't match your configured tenant
- These events pass signature verification but belong to wrong tenant
- **Solution:** Filter by metadata tenant ID (already implemented)

**Scenario 3: Payment Method Domains Confusion**
- Payment method domains are for Apple Pay/Google Pay verification
- They are **NOT** automatically linked to webhook endpoints
- You can have multiple webhook endpoints regardless of payment method domains

## How to Debug

### Step 1: Check Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Count how many webhook endpoints are configured
3. Check if they all point to the same URL
4. Note each endpoint's webhook secret

### Step 2: Check Your Logs

Look for these log messages:

```
[STRIPE-WEBHOOK] ✅ Successfully verified webhook signature
[STRIPE-WEBHOOK] Configured tenant ID: tenant_demo_002
[STRIPE-WEBHOOK] Event metadata tenant ID: tenant_demo_001  ← Wrong tenant!
[STRIPE-WEBHOOK] ⚠️ Rejecting webhook event - tenant ID mismatch
```

**If you see signature verification failures:**
```
[STRIPE-WEBHOOK] ❌ Error verifying webhook signature: StripeSignatureVerificationError
[STRIPE-WEBHOOK] Signature verification failed - possible causes:
[STRIPE-WEBHOOK] 1. Webhook secret mismatch (most likely if you have multiple webhook endpoints)
```

This is **EXPECTED** - events from other tenants should fail signature verification.

### Step 3: Verify Webhook Secrets

Check your environment variable:
```bash
echo $STRIPE_WEBHOOK_SECRET
```

Compare with webhook secrets in Stripe Dashboard. They should match.

### Step 4: Check Backend Database

Query `payment_provider_config` table:
```sql
SELECT tenant_id, provider_name, webhook_secret_encrypted
FROM payment_provider_config
WHERE provider_name = 'STRIPE' AND is_active = true;
```

Verify each tenant has its own webhook secret.

## Solutions

### Solution 1: Use Single Webhook Endpoint (Simplest)

**If all tenants share the same Stripe account:**
- Configure **ONE** webhook endpoint in Stripe Dashboard
- Use **ONE** webhook secret
- Filter events by tenant ID in metadata (already implemented)

**Benefits:**
- ✅ Simple configuration
- ✅ No signature verification issues
- ✅ Tenant filtering handles multi-tenant

**Drawbacks:**
- ❌ All tenants must share same Stripe account
- ❌ Can't use separate Stripe accounts per tenant

### Solution 2: Separate Webhook URLs Per Tenant

Configure different URLs for each tenant:
- `https://yourdomain.com/api/webhooks/stripe/tenant_demo_001`
- `https://yourdomain.com/api/webhooks/stripe/tenant_demo_002`
- `https://yourdomain.com/api/webhooks/stripe/tenant_demo_003`

**Benefits:**
- ✅ Clear separation
- ✅ Each endpoint uses its own secret
- ✅ No fan-out issues

**Drawbacks:**
- ❌ Requires multiple route handlers
- ❌ More complex routing

### Solution 3: Multi-Secret Verification (Advanced)

Try multiple webhook secrets until one matches:

```typescript
// Query backend for all Stripe configs
const configs = await fetchStripeConfigs();

// Try each secret
for (const config of configs) {
  try {
    const secret = decrypt(config.webhookSecret);
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    // Found matching secret - this is the tenant
    if (config.tenantId === configuredTenantId) {
      // Process event
    } else {
      // Reject - wrong tenant
    }
  } catch (err) {
    // Try next secret
  }
}
```

**Benefits:**
- ✅ Supports multiple tenants with different secrets
- ✅ Automatically identifies tenant from webhook secret

**Drawbacks:**
- ❌ Requires backend API access
- ❌ Requires decryption of webhook secrets
- ❌ More complex implementation

## Current Implementation Status

✅ **Signature Verification:** Uses single webhook secret from environment variable
✅ **Tenant ID Filtering:** Filters events by metadata tenant ID
✅ **Logging:** Enhanced logging to track tenant ID mismatches
✅ **Error Handling:** Rejects events with wrong tenant IDs

## Next Steps

1. **Check Stripe Dashboard** - How many webhook endpoints are configured?
2. **Review Logs** - Are signature verifications failing or passing?
3. **Verify Secrets** - Are all webhook secrets different?
4. **Choose Solution** - Based on your architecture, choose Solution 1, 2, or 3

