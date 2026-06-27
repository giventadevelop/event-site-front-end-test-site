"use server";
import { getAppUrlFromRequestHeaders, getTenantId, getApiBaseUrl } from '@/lib/env';
import type { MembershipPlanDTO } from '@/types';
import { stripe } from '@/lib/stripe';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch all membership plans for admin with pagination support
 */
export async function fetchAllMembershipPlansServer(
  options: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}
): Promise<{ plans: MembershipPlanDTO[]; totalCount: number }> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());
  params.append('sort', options.sort || 'createdAt,desc');

  // Add pagination parameters
  if (options.page !== undefined) {
    params.append('page', String(options.page));
  }
  if (options.size !== undefined) {
    params.append('size', String(options.size));
  }

  // Use regular fetch for proxy endpoints (proxy handler handles JWT)
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-plans?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch membership plans:', res.status, await res.text());
    return { plans: [], totalCount: 0 };
  }

  // Get total count from x-total-count header
  const totalCountHeader = res.headers.get('x-total-count');
  const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;

  const plans = await res.json();

  // Convert featuresJson from string to object for frontend use
  const plansWithParsedFeatures = plans.map((plan: any) => ({
    ...plan,
    featuresJson: typeof plan.featuresJson === 'string'
      ? (plan.featuresJson ? JSON.parse(plan.featuresJson) : {})
      : plan.featuresJson || {}
  }));

  return { plans: plansWithParsedFeatures, totalCount };
}

/**
 * Create a new membership plan
 */
export async function createMembershipPlanServer(
  plan: Omit<MembershipPlanDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MembershipPlanDTO> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  // Omit id field entirely for create operations - backend will generate it
  const { id, ...planWithoutId } = plan as any;

  // Convert featuresJson from object to JSON string (backend expects String, not JsonB)
  const featuresJsonString = typeof planWithoutId.featuresJson === 'string'
    ? planWithoutId.featuresJson
    : JSON.stringify(planWithoutId.featuresJson || {});

  // Build payload - proxy handler will inject tenantId automatically via withTenantId
  // Do NOT call withTenantId here - proxy handler does it
  const payload = {
    ...planWithoutId,
    featuresJson: featuresJsonString,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('[SERVER ACTION] Creating membership plan with payload:', payload);
  console.log('[SERVER ACTION] Payload keys:', Object.keys(payload));

  // Use regular fetch for proxy endpoints (proxy handler handles JWT and tenantId)
  // fetchWithJwtRetry is only for direct backend API calls
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-plans`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload), // CRITICAL: Must include body
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[SERVER ACTION] Failed to create membership plan:', res.status, errorBody);
    throw new Error(`Failed to create membership plan: ${errorBody}`);
  }

  const createdPlan = await res.json();

  // Convert featuresJson from string to object for frontend use
  let finalPlan: MembershipPlanDTO = {
    ...createdPlan,
    featuresJson: typeof createdPlan.featuresJson === 'string'
      ? (createdPlan.featuresJson ? JSON.parse(createdPlan.featuresJson) : {})
      : createdPlan.featuresJson || {}
  };

  // CRITICAL: Frontend fallback - Create Stripe Product and Price if backend didn't create them
  // According to backend PRD, backend should create Stripe IDs, but if it doesn't, we create them here
  if (!finalPlan.stripeProductId || !finalPlan.stripePriceId) {
    console.log('[SERVER ACTION] Plan missing Stripe IDs - creating Stripe Product and Price as fallback:', {
      planId: finalPlan.id,
      planName: finalPlan.planName,
      hasProductId: !!finalPlan.stripeProductId,
      hasPriceId: !!finalPlan.stripePriceId,
    });

    try {
      const tenantId = getTenantId();

      // Determine Stripe Price interval based on billing interval
      let priceInterval: 'month' | 'year' = 'month';
      if (finalPlan.billingInterval === 'YEARLY') {
        priceInterval = 'year';
      } else if (finalPlan.billingInterval === 'QUARTERLY') {
        // Stripe doesn't support quarterly directly - use monthly with interval_count
        priceInterval = 'month';
      }

      // Get or create Stripe Product
      let stripeProductId = finalPlan.stripeProductId;
      if (!stripeProductId) {
        console.log('[SERVER ACTION] Creating Stripe Product:', finalPlan.planName);
        const stripeProduct = await stripe().products.create({
          name: finalPlan.planName || `Membership Plan ${finalPlan.id}`,
          description: finalPlan.description || undefined,
          metadata: {
            membershipPlanId: String(finalPlan.id),
            tenantId: tenantId,
          },
        });
        stripeProductId = stripeProduct.id;
        console.log('[SERVER ACTION] ✅ Created Stripe Product:', stripeProductId);
      }

      // Create Stripe Price
      let stripePriceId = finalPlan.stripePriceId;
      if (!stripePriceId) {
        console.log('[SERVER ACTION] Creating Stripe Price for plan:', finalPlan.id);
        const priceParams: any = {
          product: stripeProductId,
          unit_amount: Math.round((finalPlan.price || 0) * 100), // Convert to cents
          currency: (finalPlan.currency || 'USD').toLowerCase(),
          metadata: {
            membershipPlanId: String(finalPlan.id),
            tenantId: tenantId,
          },
        };

        // Only add recurring for subscription plans
        if (finalPlan.planType === 'SUBSCRIPTION') {
          priceParams.recurring = {
            interval: priceInterval,
            ...(finalPlan.billingInterval === 'QUARTERLY' ? { interval_count: 3 } : {}),
          };
        }

        const stripePrice = await stripe().prices.create(priceParams);
        stripePriceId = stripePrice.id;
        console.log('[SERVER ACTION] ✅ Created Stripe Price:', stripePriceId);
      }

      // Update the plan with Stripe IDs via PATCH
      if (stripeProductId && stripePriceId) {
        console.log('[SERVER ACTION] Updating plan with Stripe IDs:', {
          planId: finalPlan.id,
          stripeProductId,
          stripePriceId,
        });

        const updatedPlan = await updateMembershipPlanServer(finalPlan.id!, {
          stripeProductId,
          stripePriceId,
        });

        finalPlan = updatedPlan;
        console.log('[SERVER ACTION] ✅ Plan updated with Stripe IDs');
      }
    } catch (stripeError) {
      // Log error but don't fail the plan creation - plan is already created in database
      console.error('[SERVER ACTION] Failed to create Stripe IDs (non-fatal):', stripeError);
      console.warn('[SERVER ACTION] Plan created but Stripe IDs are missing. Plan ID:', finalPlan.id);
      // Continue with plan creation - Stripe IDs can be created later or during payment
    }
  }

  return finalPlan;
}

/**
 * Update an existing membership plan
 */
export async function updateMembershipPlanServer(
  planId: number,
  plan: Partial<MembershipPlanDTO>
): Promise<MembershipPlanDTO> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  // Convert featuresJson from object to JSON string if present (backend expects String, not JsonB)
  const featuresJsonString = plan.featuresJson !== undefined
    ? (typeof plan.featuresJson === 'string'
        ? plan.featuresJson
        : JSON.stringify(plan.featuresJson))
    : undefined;

  // Build payload - proxy handler will inject tenantId automatically via withTenantId
  // Do NOT call withTenantId here - proxy handler does it
  const finalPayload = {
    ...plan,
    ...(featuresJsonString !== undefined && { featuresJson: featuresJsonString }),
    id: planId,
    updatedAt: new Date().toISOString(),
  };

  // Use regular fetch for proxy endpoints (proxy handler handles JWT and tenantId)
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-plans/${planId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(finalPayload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to update membership plan:', res.status, errorBody);
    throw new Error('Failed to update membership plan');
  }

  const updatedPlan = await res.json();

  // Convert featuresJson from string to object for frontend use
  return {
    ...updatedPlan,
    featuresJson: typeof updatedPlan.featuresJson === 'string'
      ? (updatedPlan.featuresJson ? JSON.parse(updatedPlan.featuresJson) : {})
      : updatedPlan.featuresJson || {}
  };
}

/**
 * Delete a membership plan
 */
export async function deleteMembershipPlanServer(planId: number): Promise<void> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  // Use regular fetch for proxy endpoints (proxy handler handles JWT)
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-plans/${planId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to delete membership plan:', res.status, errorBody);
    throw new Error('Failed to delete membership plan');
  }
}

/**
 * Toggle plan active status
 */
export async function togglePlanActiveStatusServer(
  planId: number,
  isActive: boolean
): Promise<MembershipPlanDTO> {
  return updateMembershipPlanServer(planId, { isActive });
}


