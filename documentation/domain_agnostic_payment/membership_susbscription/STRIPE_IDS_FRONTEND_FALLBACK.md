# Stripe Product ID and Price ID Frontend Fallback Implementation

## Problem Statement

When creating a new membership plan through the frontend (`/admin/membership/plans`), the Stripe Product ID (`stripe_product_id`) and Stripe Price ID (`stripe_price_id`) are not being persisted in the database, even though the backend PRD specifies that the backend should create these automatically.

**Example**: Plan created with `NULL` values:
```sql
INSERT INTO public.membership_plan
(id, tenant_id, plan_name, plan_code, description, plan_type, billing_interval, price, currency, trial_days, is_active, max_events_per_month, max_attendees_per_event, features_json, stripe_price_id, stripe_product_id, created_at, updated_at)
VALUES(4505, 'tenant_demo_002', 'plan 1', 'plan_1', 'sdssdss', 'SUBSCRIPTION', 'MONTHLY', 0.60, 'USD', 0, true, NULL, NULL, '{}', NULL, NULL, '2026-01-01 21:07:48.597', '2026-01-01 21:07:48.597');
```

## Root Cause Analysis

According to the backend PRD (`MEMBERSHIP_SUBSCRIPTION_BACKEND_PRD.html`), the backend endpoint `POST /api/membership-plans` should:
- ✅ Validate plan code uniqueness per tenant
- ✅ **Create Stripe Product and Price if not provided**
- ✅ **Store Stripe IDs in plan record**
- ✅ Set default values (isActive=true, currency=USD)

However, the backend implementation is not creating or persisting Stripe IDs, resulting in `NULL` values in the database.

## Solution: Frontend Fallback Mechanism

Since the backend is in a separate workspace (`E:\project_workspace\malayalees-us-site-boot`) and cannot be modified immediately, a **frontend fallback mechanism** has been implemented to ensure Stripe IDs are always created and persisted.

### Implementation Location

**File**: `src/app/admin/membership/plans/ApiServerActions.ts`

**Function**: `createMembershipPlanServer()`

### How It Works

1. **Create Plan via Backend API**: The plan is first created through the backend API endpoint (`POST /api/proxy/membership-plans`).

2. **Check for Stripe IDs**: After receiving the created plan response, the code checks if `stripeProductId` or `stripePriceId` are missing.

3. **Create Stripe Product** (if missing):
   - Uses Stripe API to create a product with:
     - Name: Plan name
     - Description: Plan description (if available)
     - Metadata: `membershipPlanId` and `tenantId`

4. **Create Stripe Price** (if missing):
   - Uses Stripe API to create a price with:
     - Product: The created/found Stripe Product ID
     - Unit Amount: Plan price converted to cents
     - Currency: Plan currency (defaults to USD)
     - **Recurring**: Only for `SUBSCRIPTION` plan types
     - **Interval**: Based on `billingInterval`:
       - `MONTHLY` → `month`
       - `QUARTERLY` → `month` with `interval_count: 3`
       - `YEARLY` → `year`
       - `ONE_TIME` → No recurring (one-time payment)
     - Metadata: `membershipPlanId` and `tenantId`

5. **Update Plan with Stripe IDs**: Uses `PATCH /api/proxy/membership-plans/{id}` to update the plan record with the created Stripe IDs.

6. **Error Handling**: If Stripe API calls fail, the plan creation still succeeds (non-fatal error). Stripe IDs can be created later during payment processing or manually.

### Code Flow

```typescript
// 1. Create plan via backend
const createdPlan = await fetch('/api/proxy/membership-plans', { method: 'POST', ... });

// 2. Check if Stripe IDs are missing
if (!finalPlan.stripeProductId || !finalPlan.stripePriceId) {
  try {
    // 3. Create Stripe Product
    const stripeProduct = await stripe().products.create({ ... });

    // 4. Create Stripe Price
    const stripePrice = await stripe().prices.create({ ... });

    // 5. Update plan with Stripe IDs
    await updateMembershipPlanServer(finalPlan.id, {
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });
  } catch (error) {
    // 6. Non-fatal error - plan is still created
    console.error('Failed to create Stripe IDs (non-fatal):', error);
  }
}
```

## Plan Type Handling

### SUBSCRIPTION Plans
- **Recurring**: Yes
- **Interval**: Based on `billingInterval`
- **Example**: Monthly subscription → `recurring: { interval: 'month' }`

### ONE_TIME Plans
- **Recurring**: No
- **Price Type**: One-time payment
- **Example**: One-time payment → No `recurring` field

### FREEMIUM Plans
- **Recurring**: No (free plans don't need Stripe IDs, but they're created for consistency)
- **Price**: $0.00

## Billing Interval Mapping

| Billing Interval | Stripe Interval | Interval Count | Notes |
|------------------|-----------------|----------------|-------|
| `MONTHLY` | `month` | 1 | Standard monthly subscription |
| `QUARTERLY` | `month` | 3 | Stripe doesn't support quarterly directly |
| `YEARLY` | `year` | 1 | Annual subscription |
| `ONE_TIME` | N/A | N/A | No recurring (one-time payment) |

## Logging

The implementation includes comprehensive logging for debugging:

- `[SERVER ACTION] Plan missing Stripe IDs - creating Stripe Product and Price as fallback`
- `[SERVER ACTION] Creating Stripe Product: {planName}`
- `[SERVER ACTION] ✅ Created Stripe Product: {productId}`
- `[SERVER ACTION] Creating Stripe Price for plan: {planId}`
- `[SERVER ACTION] ✅ Created Stripe Price: {priceId}`
- `[SERVER ACTION] Updating plan with Stripe IDs`
- `[SERVER ACTION] ✅ Plan updated with Stripe IDs`
- `[SERVER ACTION] Failed to create Stripe IDs (non-fatal): {error}`

## Testing

### Test Case 1: Create Plan Without Stripe IDs
1. Create a new plan through `/admin/membership/plans`
2. Check server logs for Stripe creation messages
3. Verify database: `SELECT stripe_product_id, stripe_price_id FROM membership_plan WHERE id = {planId}`
4. **Expected**: Both IDs should be populated

### Test Case 2: Create Plan with Backend Stripe IDs
1. If backend is fixed and creates Stripe IDs
2. Create a new plan
3. **Expected**: Frontend fallback should NOT run (IDs already exist)

### Test Case 3: Stripe API Failure
1. Simulate Stripe API failure (network error, invalid API key, etc.)
2. Create a new plan
3. **Expected**: Plan is still created, but Stripe IDs remain NULL (non-fatal)

## Backend Fix Required

**Long-term Solution**: The backend should be updated to create Stripe Product and Price during plan creation, as specified in the PRD:

```java
// Backend should implement:
POST /api/membership-plans
  - Create plan record
  - Create Stripe Product (if not provided)
  - Create Stripe Price (if not provided)
  - Update plan record with Stripe IDs
  - Return plan with Stripe IDs populated
```

**Backend Project Location**: `E:\project_workspace\malayalees-us-site-boot`

## Related Files

- **Frontend Implementation**: `src/app/admin/membership/plans/ApiServerActions.ts`
- **Backend PRD**: `documentation/domain_agnostic_payment/membership_susbscription/MEMBERSHIP_SUBSCRIPTION_BACKEND_PRD.html`
- **Database Schema**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **Stripe Integration**: `src/lib/stripe/index.ts`, `src/lib/stripe/init.ts`
- **Payment Success Fallback**: `src/app/membership/success/ApiServerActions.ts` (also creates Stripe IDs on-the-fly if missing)

## Notes

- The frontend fallback ensures **immediate functionality** while the backend issue is being resolved
- Stripe IDs are **public identifiers** and safe to display in admin interfaces
- The fallback is **non-blocking** - plan creation succeeds even if Stripe API fails
- Stripe IDs can be created later during payment processing if they're still missing
- The implementation follows the same pattern used in `processMembershipSubscriptionFromPaymentIntent()` for consistency

