"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getAppUrlFromRequestHeaders, getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipSubscriptionDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch user's current subscription
 */
export async function fetchUserSubscriptionServer(
  userProfileId: number
): Promise<MembershipSubscriptionDTO | null> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  if (!userProfileId) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('userProfileId.equals', String(userProfileId));
  params.append('tenantId.equals', getTenantId());
  // Include ACTIVE, TRIAL, and CANCELLED subscriptions (CANCELLED for subscriptions scheduled to cancel)
  params.append('subscriptionStatus.in', 'ACTIVE,TRIAL,CANCELLED');
  params.append('sort', 'createdAt,desc');
  params.append('size', '1');

  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-subscriptions?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    console.error('Failed to fetch user subscription:', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data[0] as MembershipSubscriptionDTO;
  }
  return null;
}

/**
 * Update subscription (e.g., upgrade, downgrade)
 */
export async function updateSubscriptionServer(
  subscriptionId: number,
  payload: Partial<MembershipSubscriptionDTO>
): Promise<MembershipSubscriptionDTO> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  const finalPayload = withTenantId({
    ...payload,
    id: subscriptionId,
  });

  // Use proxy API route instead of direct backend call
  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-subscriptions/${subscriptionId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(finalPayload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to update subscription:', res.status, errorBody);
    throw new Error('Failed to update subscription');
  }

  return res.json();
}

/**
 * Cancel subscription
 */
export async function cancelSubscriptionServer(
  subscriptionId: number,
  cancellationReason?: string
): Promise<MembershipSubscriptionDTO> {
  return updateSubscriptionServer(subscriptionId, {
    cancelAtPeriodEnd: true,
    cancellationReason,
    subscriptionStatus: 'CANCELLED',
    cancelledAt: new Date().toISOString(),
  });
}

/**
 * Update payment method for subscription
 * This would typically involve creating a new Stripe setup intent or payment method
 */
export async function updatePaymentMethodServer(
  subscriptionId: number,
  paymentMethodId: string
): Promise<MembershipSubscriptionDTO> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  // This would call a backend endpoint to update the payment method
  // The backend would handle Stripe payment method update
  const payload = withTenantId({
    id: subscriptionId,
    stripePaymentMethodId: paymentMethodId,
  });

  const url = `${getApiBase()}/api/membership-subscriptions/${subscriptionId}/payment-method`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to update payment method:', res.status, errorBody);
    throw new Error('Failed to update payment method');
  }

  return res.json();
}



