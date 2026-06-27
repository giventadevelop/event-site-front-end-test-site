"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getAppUrlFromRequestHeaders, getTenantId, getPaymentMethodDomainId, getApiBaseUrl } from '@/lib/env';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipPlanDTO, UserProfileDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch a specific membership plan by ID
 */
export async function fetchMembershipPlanServer(planId: number): Promise<MembershipPlanDTO | null> {
  if (!getApiBase()) {
    throw new Error('API base URL not configured');
  }

  if (!planId) {
    return null;
  }

  const url = `${await getAppUrlFromRequestHeaders()}/api/proxy/membership-plans/${planId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    console.error('Failed to fetch membership plan:', res.status, await res.text());
    throw new Error('Failed to fetch membership plan');
  }

  return res.json();
}

/**
 * Create a Stripe checkout session for subscription signup
 * CRITICAL: This is a server action - auth() works directly here
 */
export async function createSubscriptionCheckoutSessionServer(
  planId: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionUrl: string }> {
  // Get authenticated user - auth() works directly in server actions
  // Next.js 15+ requires headers() to be awaited before auth() uses it
  const { headers } = await import('next/headers');
  await headers(); // Ensure headers() is awaited before auth()
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized - Please sign in');
  }

  const baseUrl = await getAppUrlFromRequestHeaders();

  // Fetch membership plan details from backend
  const planRes = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/membership-plans/${planId}`,
    { cache: 'no-store' }
  );

  if (!planRes.ok) {
    const msg = await planRes.text();
    console.error('[MEMBERSHIP-CHECKOUT] Failed to fetch membership plan:', planRes.status, msg);
    throw new Error('Failed to fetch membership plan');
  }

  const plan: {
    id: number;
    price: number;
    currency: string;
    planName?: string;
    stripePriceId?: string;
    billingInterval?: string;
  } = await planRes.json();

  // Get tenant ID and Payment Method Domain ID
  let tenantId: string;
  let paymentMethodDomainId: string;

  try {
    tenantId = getTenantId();
  } catch (error) {
    console.error('[MEMBERSHIP-CHECKOUT] Missing NEXT_PUBLIC_TENANT_ID:', error);
    throw new Error('Server configuration error: Tenant ID not configured');
  }

  try {
    paymentMethodDomainId = getPaymentMethodDomainId();
  } catch (error) {
    console.error('[MEMBERSHIP-CHECKOUT] Missing NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID:', error);
    throw new Error('Server configuration error: Payment Method Domain ID not configured');
  }

  // Determine payment methods based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const paymentMethods: ('card' | 'link' | 'cashapp')[] = isProduction
    ? ['card', 'link', 'cashapp']
    : ['card', 'link'];

  // Convert billing interval to Stripe interval
  const stripeInterval = plan.billingInterval === 'MONTHLY' ? 'month' :
                        plan.billingInterval === 'QUARTERLY' ? 'month' :
                        plan.billingInterval === 'YEARLY' ? 'year' :
                        'month';
  const intervalCount = plan.billingInterval === 'QUARTERLY' ? 3 : 1;

  // Create Stripe Checkout Session
  // Note: Stripe Checkout automatically enables Apple Pay and Google Pay on mobile devices
  // when the device/browser supports it and the customer has cards in their wallet.
  // No additional configuration needed - Stripe handles this automatically.
  const sessionParams: any = {
    payment_method_types: paymentMethods,
    // automatic_payment_methods is not needed for Checkout Sessions - Stripe handles this automatically
    // Apple Pay and Google Pay will appear automatically on supported devices
    mode: 'subscription',
    success_url: successUrl || `${baseUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${baseUrl}/membership?canceled=true`,
    billing_address_collection: 'auto',
    metadata: {
      membershipPlanId: String(planId),
      userId: userId,
      tenantId: tenantId,
      paymentMethodDomainId: paymentMethodDomainId,
      metadataSource: 'membership_checkout',
      timestamp: new Date().toISOString(),
    },
    subscription_data: {
      metadata: {
        membershipPlanId: String(planId),
        userId: userId,
        tenantId: tenantId,
        paymentMethodDomainId: paymentMethodDomainId,
      },
    },
  };

  // Helper function to create price_data inline
  const createPriceData = () => ({
    price_data: {
      currency: plan.currency?.toLowerCase() || 'usd',
      product_data: {
        name: plan.planName || `Membership Plan ${planId}`,
        description: `Membership subscription - ${plan.billingInterval || 'Monthly'}`,
      },
      unit_amount: Math.round(plan.price * 100), // Convert to cents
      recurring: {
        interval: stripeInterval,
        interval_count: intervalCount,
      },
    },
    quantity: 1,
  });

  // If plan has stripePriceId, try to use it; fall back to price_data on mode mismatch
  if (plan.stripePriceId) {
    try {
      // First attempt: Use the stored price ID
      sessionParams.line_items = [{
        price: plan.stripePriceId,
        quantity: 1,
      }];

      // Try to create session with price ID
      const session = await stripe().checkout.sessions.create(sessionParams);

      if (!session.url) {
        throw new Error('Failed to create checkout session URL');
      }

      console.log('[MEMBERSHIP-CHECKOUT] Checkout session created with price ID:', {
        sessionId: session.id,
        url: session.url,
        membershipPlanId: planId,
        priceId: plan.stripePriceId,
        userId,
      });

      return { sessionUrl: session.url };
    } catch (error: any) {
      // Check if error is due to mode mismatch (test price with live key or vice versa)
      if (error?.code === 'resource_missing' && error?.type === 'StripeInvalidRequestError') {
        console.warn('[MEMBERSHIP-CHECKOUT] Price ID mode mismatch detected, falling back to price_data:', {
          priceId: plan.stripePriceId,
          error: error.message,
          membershipPlanId: planId,
        });

        // Fall back to creating price_data inline
        sessionParams.line_items = [createPriceData()];
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  } else {
    // Create price_data inline (for plans without Stripe Price ID)
    sessionParams.line_items = [createPriceData()];
  }

  // Create session (either with price_data fallback or if no price ID was provided)
  const session = await stripe().checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  console.log('[MEMBERSHIP-CHECKOUT] Checkout session created:', {
    sessionId: session.id,
    url: session.url,
    membershipPlanId: planId,
    userId,
  });

  return { sessionUrl: session.url };
}

/**
 * Create user profile from Clerk user data
 * Used when profile doesn't exist before subscription payment
 */
export async function createUserProfileFromClerkUser({
  userId,
  email,
  firstName,
  lastName,
  phone,
  imageUrl,
}: {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  imageUrl?: string;
}): Promise<UserProfileDTO> {
  if (!userId) {
    const error = new Error('UserId is required to create user profile');
    console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser validation failed:', {
      error: error.message,
      userId: userId || 'missing',
    });
    throw error;
  }

  if (!email) {
    const error = new Error('Email is required to create user profile');
    console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser validation failed:', {
      error: error.message,
      email: email || 'missing',
      userId,
    });
    throw error;
  }

  const baseUrl = await getAppUrlFromRequestHeaders();
  if (!baseUrl) {
    const error = new Error('NEXT_PUBLIC_APP_URL is not configured. Cannot create user profile.');
    console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser configuration error:', {
      error: error.message,
      userId,
      email,
    });
    throw error;
  }

  const now = new Date().toISOString();

  let profileData;
  try {
    profileData = withTenantId({
      userId,
      email,
      firstName: firstName || 'User',
      lastName: lastName || '',
      phone: phone || '',
      profileImageUrl: imageUrl || '',
      userRole: 'MEMBER',
      userStatus: 'PENDING_APPROVAL',
      createdAt: now,
      updatedAt: now,
    });
  } catch (tenantErr) {
    const error = tenantErr instanceof Error
      ? new Error(`Failed to prepare profile data: ${tenantErr.message}`)
      : new Error('Failed to prepare profile data: Unknown error');
    console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser tenant ID error:', {
      error: error.message,
      originalError: tenantErr instanceof Error ? tenantErr.message : String(tenantErr),
      userId,
      email,
    });
    throw error;
  }

  console.log('[MEMBERSHIP-SUBSCRIBE] Creating user profile:', {
    userId,
    email,
    tenantId: profileData.tenantId,
    baseUrl,
  });

  let response;
  try {
    const profileUrl = `${baseUrl}/api/proxy/user-profiles`;
    console.log('[MEMBERSHIP-SUBSCRIBE] POST request to:', profileUrl);

    response = await fetchWithJwtRetry(
      profileUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      },
      '[MEMBERSHIP-SUBSCRIBE] create-user-profile'
    );
  } catch (fetchErr) {
    const error = fetchErr instanceof Error
      ? new Error(`Network error while creating user profile: ${fetchErr.message}`)
      : new Error('Network error while creating user profile: Unknown error');
    console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser fetch error:', {
      error: error.message,
      originalError: fetchErr instanceof Error ? {
        message: fetchErr.message,
        stack: fetchErr.stack,
        name: fetchErr.name,
      } : String(fetchErr),
      userId,
      email,
      baseUrl,
    });
    throw error;
  }

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (textErr) {
      errorText = `Failed to read error response: ${textErr instanceof Error ? textErr.message : String(textErr)}`;
    }

    const error = new Error(`Failed to create user profile: ${response.status} - ${errorText}`);
    console.error('[MEMBERSHIP-SUBSCRIBE] Failed to create user profile:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      userId,
      email,
      tenantId: profileData.tenantId,
    });
    throw error;
  }

  let createdProfile;
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      const error = new Error(`Invalid response format: expected JSON, got ${contentType}`);
      console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser invalid response format:', {
        error: error.message,
        contentType,
        responseBody: errorText.substring(0, 500), // First 500 chars
        userId,
        email,
      });
      throw error;
    }

    createdProfile = await response.json();

    if (!createdProfile || !createdProfile.id) {
      const error = new Error('Profile creation succeeded but response missing ID');
      console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser invalid response:', {
        error: error.message,
        response: createdProfile,
        userId,
        email,
      });
      throw error;
    }
  } catch (jsonErr) {
    const error = jsonErr instanceof Error
      ? new Error(`Failed to parse profile creation response: ${jsonErr.message}`)
      : new Error('Failed to parse profile creation response: Unknown error');
    console.error('[MEMBERSHIP-SUBSCRIBE] createUserProfileFromClerkUser JSON parse error:', {
      error: error.message,
      originalError: jsonErr instanceof Error ? {
        message: jsonErr.message,
        stack: jsonErr.stack,
        name: jsonErr.name,
      } : String(jsonErr),
      userId,
      email,
      status: response.status,
    });
    throw error;
  }

  console.log('[MEMBERSHIP-SUBSCRIBE] User profile created successfully:', {
    profileId: createdProfile.id,
    userId,
    email,
    tenantId: profileData.tenantId,
  });

  return createdProfile;
}



