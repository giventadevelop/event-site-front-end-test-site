"use server";
import { stripe } from '@/lib/stripe';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipPlanDTO, MembershipSubscriptionDTO, UserProfileDTO } from '@/types';

/**
 * Get session ID from payment intent
 */
async function getSessionIdFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  try {
    console.log('[MEMBERSHIP-SUCCESS] Looking up session for payment intent:', paymentIntentId);

    // Get the payment intent from Stripe
    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId);

    // The session ID should be in the metadata or we need to search for it
    if (paymentIntent.metadata?.session_id) {
      console.log('[MEMBERSHIP-SUCCESS] Found session_id in metadata:', paymentIntent.metadata.session_id);
      return paymentIntent.metadata.session_id;
    }

    // If not in metadata, we need to search checkout sessions
    const sessions = await stripe().checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1
    });

    if (sessions.data.length > 0) {
      const sessionId = sessions.data[0].id;
      console.log('[MEMBERSHIP-SUCCESS] Found session_id via lookup:', sessionId);
      return sessionId;
    }

    console.log('[MEMBERSHIP-SUCCESS] No session found for payment intent:', paymentIntentId);
    return null;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error looking up session:', error);
    return null;
  }
}

/**
 * Find subscription by Stripe checkout session ID
 * Looks up subscription by retrieving session from Stripe, then finding by stripeSubscriptionId
 */
export async function findSubscriptionBySessionId(
  sessionId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    // First, get the Stripe subscription ID from the checkout session
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const stripeSubscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id;

    if (!stripeSubscriptionId) {
      console.log('[MEMBERSHIP-SUCCESS] No Stripe subscription ID in session:', sessionId);
      return null;
    }

    // Look up subscription by Stripe subscription ID
    return await findSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error finding subscription by session ID:', error);
    return null;
  }
}

/**
 * Find subscription by Stripe payment intent ID
 * First tries to find by stripePaymentIntentId field, then falls back to session lookup
 */
export async function findSubscriptionByPaymentIntentId(
  paymentIntentId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    // First, try to find by stripePaymentIntentId field (for Payment Intents created directly)
    // CRITICAL: Do NOT add tenantId.equals when calling proxy - proxy handler adds it automatically
    // According to nextjs_api_routes.mdc: "Do NOT add tenantId.equals in your client/server code when calling the proxy"
    const params = new URLSearchParams({
      'stripePaymentIntentId.equals': paymentIntentId,
      // CRITICAL: Filter by status on server side - don't fetch all records and filter in memory
      'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only fetch ACTIVE or TRIAL subscriptions
      'size': '1', // Only need one result
      'sort': 'createdAt,desc', // Get most recent first
    });
    const response = await fetchWithJwtRetry(
      `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (response.ok) {
      // Handle both array and paginated response formats
      const data = await response.json();
      const items: MembershipSubscriptionDTO[] = Array.isArray(data) ? data : (data.content || []);

      if (items.length > 0) {
        // CRITICAL: Server-side filtering should have already filtered out CANCELLED/EXPIRED
        // But add safety check in case backend doesn't honor the filter
        const activeSubscriptions = items.filter(sub =>
          sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
        );

        if (activeSubscriptions.length > 0) {
          const foundSubscription = activeSubscriptions[0];

          // CRITICAL: Verify that the found subscription actually has the matching payment intent ID
          // The backend query might return subscriptions with null/undefined stripePaymentIntentId
          if (foundSubscription.stripePaymentIntentId && foundSubscription.stripePaymentIntentId === paymentIntentId) {
            console.log('[MEMBERSHIP-SUCCESS] Found active subscription by stripePaymentIntentId:', {
              subscriptionId: foundSubscription.id,
              paymentIntentId: foundSubscription.stripePaymentIntentId,
              planId: foundSubscription.membershipPlanId,
              status: foundSubscription.subscriptionStatus,
            });
            return foundSubscription;
          } else if (!foundSubscription.stripePaymentIntentId) {
            // CRITICAL: Subscription exists but stripePaymentIntentId is NULL
            // DO NOT update and return it here - we can't verify it's the correct subscription
            // The backend query might be returning subscriptions incorrectly (e.g., by user/tenant instead of payment intent)
            // Let the caller (processMembershipSubscriptionFromPaymentIntent) handle plan matching
            console.log('[MEMBERSHIP-SUCCESS] ⚠️ Found subscription with NULL stripePaymentIntentId - NOT updating (caller will verify plan):', {
              subscriptionId: foundSubscription.id,
              searchedPaymentIntentId: paymentIntentId,
              planId: foundSubscription.membershipPlanId,
              status: foundSubscription.subscriptionStatus,
              message: 'Backend query may have returned wrong subscription - caller will verify plan match before updating'
            });
            // Return null so caller can check for existing subscriptions by user/plan and handle plan switching
            return null;
          } else {
            console.log('[MEMBERSHIP-SUCCESS] ⚠️ Backend returned subscription but payment intent ID does not match:', {
              subscriptionId: foundSubscription.id,
              storedPaymentIntentId: foundSubscription.stripePaymentIntentId,
              searchedPaymentIntentId: paymentIntentId,
              planId: foundSubscription.membershipPlanId,
              message: 'Different payment intent ID - ignoring this result'
            });
            // Don't return this subscription - it's a false match
            // Continue to fallback lookup or return null
          }
        } else {
          console.log('[MEMBERSHIP-SUCCESS] Found cancelled/expired subscription by stripePaymentIntentId - will be ignored:', items[0].id);
          return null; // Return null so caller creates a new subscription
        }
      }
    }

    // Fallback: Get session ID from payment intent (for Payment Intents created via Checkout Session)
    const sessionId = await getSessionIdFromPaymentIntent(paymentIntentId);
    if (!sessionId) {
      console.log('[MEMBERSHIP-SUCCESS] No session ID found for payment intent:', paymentIntentId);
      return null;
    }

    // Use session ID lookup
    return await findSubscriptionBySessionId(sessionId);
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error finding subscription by payment intent ID:', error);
    return null;
  }
}

/**
 * Find subscription by Stripe subscription ID (backend field: stripeSubscriptionId)
 * CRITICAL: Filters out CANCELLED and EXPIRED subscriptions - they should not be returned
 * Caller should create a new subscription instead
 */
export async function findSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    // CRITICAL: Do NOT add tenantId.equals when calling proxy - proxy handler adds it automatically
    // According to nextjs_api_routes.mdc: "Do NOT add tenantId.equals in your client/server code when calling the proxy"
    const params = new URLSearchParams({
      'stripeSubscriptionId.equals': stripeSubscriptionId,
      // CRITICAL: Filter by status on server side - don't fetch all records and filter in memory
      'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only fetch ACTIVE or TRIAL subscriptions
      'size': '1', // Only need one result
      'sort': 'createdAt,desc', // Get most recent first
    });
    const response = await fetchWithJwtRetry(
      `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!response.ok) {
      console.log('[MEMBERSHIP-SUCCESS] Lookup by stripeSubscriptionId failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('[MEMBERSHIP-SUCCESS] Lookup by stripeSubscriptionId response:', {
      isArray: Array.isArray(data),
      dataType: typeof data,
      hasContent: 'content' in data,
      dataKeys: Object.keys(data),
      itemCount: Array.isArray(data) ? data.length : (data.content ? data.content.length : 0),
    });

    // Handle both array and paginated response formats
    const items: MembershipSubscriptionDTO[] = Array.isArray(data) ? data : (data.content || []);

    if (items.length === 0) {
      console.log('[MEMBERSHIP-SUCCESS] No ACTIVE/TRIAL subscriptions found by stripeSubscriptionId:', stripeSubscriptionId);
      return null;
    }

    // CRITICAL: Server-side filtering should have already filtered out CANCELLED/EXPIRED
    // But add safety check in case backend doesn't honor the filter
    const activeSubscriptions = items.filter(sub =>
      sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
    );

    if (activeSubscriptions.length > 0) {
      console.log('[MEMBERSHIP-SUCCESS] ✅ Returning active subscription:', {
        id: activeSubscriptions[0].id,
        status: activeSubscriptions[0].subscriptionStatus,
        planId: activeSubscriptions[0].membershipPlanId,
        stripeSubscriptionId: activeSubscriptions[0].stripeSubscriptionId,
      });
      return activeSubscriptions[0];
    }

    // No active subscription found (backend may have returned CANCELLED despite filter)
    console.log('[MEMBERSHIP-SUCCESS] ⚠️ No ACTIVE/TRIAL subscriptions found (backend may have returned CANCELLED despite filter)');
    return null;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error finding subscription by Stripe subscription ID:', error);
    return null;
  }
}

/**
 * Fetch user profile by Clerk userId
 */
async function fetchUserProfileByUserId(userId: string): Promise<UserProfileDTO | null> {
  try {
    const url = `${getAppUrl()}/api/proxy/user-profiles/by-user/${userId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Process Stripe checkout session and create subscription
 */
export async function processMembershipSubscriptionSessionServer(
  sessionId: string,
): Promise<{ subscription: MembershipSubscriptionDTO | null; plan: MembershipPlanDTO | null; userProfile: UserProfileDTO | null } | null> {
  console.log('[MEMBERSHIP-SUCCESS] 🔵 START: processMembershipSubscriptionSessionServer', {
    sessionId,
    timestamp: new Date().toISOString(),
  });

  try {
    console.log('[MEMBERSHIP-SUCCESS] Step 1: Retrieving Checkout Session from Stripe...', { sessionId });
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription', 'customer'],
    });

    console.log('[MEMBERSHIP-SUCCESS] Step 1: Checkout Session retrieved:', {
      sessionId: session.id,
      payment_status: session.payment_status,
      hasMetadata: !!session.metadata,
      metadata: session.metadata,
    });

    if (session.payment_status !== 'paid' || !session.metadata) {
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #1: Session not paid or missing metadata:', {
        payment_status: session.payment_status,
        hasMetadata: !!session.metadata,
      });
      return null;
    }

    // Extract metadata FIRST (before checking for existing subscriptions)
    const membershipPlanId = session.metadata.membershipPlanId;
    const userId = session.metadata.userId;
    const tenantId = session.metadata.tenantId || getTenantId();

    if (!membershipPlanId || !userId) {
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #2: Missing required metadata:', { membershipPlanId, userId });
      return null;
    }

    // CRITICAL: Check if subscription already exists (backend webhook may have created it)
    // But we must verify it's for the SAME plan - if it's for a different plan, we need to handle plan switch
    const existingSubscription = await findSubscriptionBySessionId(sessionId);
    if (existingSubscription) {
      // CRITICAL: Verify that the existing subscription is for the SAME plan as the session
      const existingPlanId = typeof existingSubscription.membershipPlanId === 'number'
        ? existingSubscription.membershipPlanId
        : parseInt(String(existingSubscription.membershipPlanId), 10);
      const newPlanId = parseInt(membershipPlanId, 10);

      console.log('[MEMBERSHIP-SUCCESS] Step 2: Found existing subscription, checking plan match...', {
        sessionId,
        existingSubscriptionId: existingSubscription.id,
        existingPlanId,
        newPlanId,
        planIdsMatch: existingPlanId === newPlanId,
        timestamp: new Date().toISOString(),
      });

      if (existingPlanId === newPlanId) {
        // Same plan - this is the correct subscription
        console.log('[MEMBERSHIP-SUCCESS] ✅ Step 2: Existing subscription matches plan - returning existing subscription');
        // Fetch plan and user profile for return
        const plan = existingSubscription.membershipPlan || await fetchMembershipPlanById(existingSubscription.membershipPlanId);
        const userProfile = existingSubscription.userProfile || await fetchUserProfileById(existingSubscription.userProfileId);
        return { subscription: existingSubscription, plan, userProfile };
      } else {
        // DIFFERENT plan - this is a plan switch, so we should NOT return the existing subscription
        // We'll cancel it and create a new one below
        console.log('[MEMBERSHIP-SUCCESS] ⚠️ Step 2: Existing subscription is for DIFFERENT plan - will cancel and create new one:', {
          existingSubscriptionId: existingSubscription.id,
          existingPlanId,
          newPlanId,
          message: 'Plan switch detected - will cancel old subscription and create new one'
        });
        // Don't return - continue to plan switch handling logic below
      }
    } else {
      console.log('[MEMBERSHIP-SUCCESS] Step 2: No existing subscription found for session ID');
    }

    // Fetch user profile
    const userProfile = await fetchUserProfileByUserId(userId);
    if (!userProfile?.id) {
      console.error('[MEMBERSHIP-SUCCESS] User profile not found for userId:', userId);
      return null;
    }

    // Fetch membership plan
    const plan = await fetchMembershipPlanById(parseInt(membershipPlanId, 10));
    if (!plan) {
      console.error('[MEMBERSHIP-SUCCESS] Membership plan not found:', membershipPlanId);
      return null;
    }

    // Get Stripe subscription from session
    const stripeSubscription = session.subscription as any;
    const stripeSubscriptionId = stripeSubscription?.id || null;
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id || null;

    // NOTE: Test clocks should be managed via scripts, not in application code
    // See documentation/domain_agnostic_payment/membership_susbscription/STRIPE_TEST_CLOCKS_GUIDE.html
    // Stripe Checkout will automatically use the test clock if the customer is attached to one
    // Use setup-test-clock.js to attach customers to test clocks before creating subscriptions

    // CRITICAL: If subscription from session is incomplete, try to complete it
    // This can happen if the checkout session was created but payment wasn't fully processed
    if (stripeSubscription && (stripeSubscription.status === 'incomplete' || stripeSubscription.status === 'incomplete_expired')) {
      console.log('[MEMBERSHIP-SUCCESS] ⚠️ Subscription from session is incomplete, attempting to complete...');
      try {
        // Retrieve subscription with expanded invoice
        const subscriptionWithInvoice = await stripe().subscriptions.retrieve(stripeSubscriptionId, {
          expand: ['latest_invoice', 'latest_invoice.payment_intent'],
        });

        const latestInvoice = subscriptionWithInvoice.latest_invoice;
        if (latestInvoice && typeof latestInvoice !== 'string' && (latestInvoice.status === 'draft' || latestInvoice.status === 'open')) {
          // Try to pay the invoice
          const paidInvoice = await stripe().invoices.pay(latestInvoice.id);
          console.log('[MEMBERSHIP-SUCCESS] ✅ Completed subscription by paying invoice:', {
            invoiceId: paidInvoice.id,
            invoiceStatus: paidInvoice.status,
          });

          // Wait for Stripe to process
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Retrieve updated subscription
          const updatedSubscription = await stripe().subscriptions.retrieve(stripeSubscriptionId);
          if (updatedSubscription.status === 'active') {
            console.log('[MEMBERSHIP-SUCCESS] ✅ Subscription is now ACTIVE');
            // Update the stripeSubscription object with new status
            stripeSubscription.status = 'active';
            stripeSubscription.current_period_start = updatedSubscription.current_period_start;
            stripeSubscription.current_period_end = updatedSubscription.current_period_end;
          }
        }
      } catch (completeError: any) {
        console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not complete subscription from session:', completeError.message);
        // Continue - subscription will still be created in database
      }
    }

    // CRITICAL: Double-check by userProfileId before creating (race condition fix)
    // This prevents duplicates when multiple requests come in simultaneously
    // CRITICAL: Also verify plan ID matches - if it's different, we need to handle plan switch
    // NOTE: We use userProfileId instead of stripeSubscriptionId because the backend filter for stripeSubscriptionId doesn't work correctly
    if (userProfile.id) {
      try {
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'userProfileId.equals': String(userProfile.id),
          'tenantId.equals': tenantId, // Explicitly include tenantId (proxy handler also adds it, but explicit is fine)
          'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only look for active subscriptions
          'sort': 'createdAt,desc', // Get most recent first
          'size': '1', // Only need one result
        });

        const lookupRes = await fetchWithJwtRetry(
          `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
          { cache: 'no-store' }
        );

        if (lookupRes.ok) {
          const items: MembershipSubscriptionDTO[] = await lookupRes.json();
          if (items.length > 0) {
            const existingByUserId = items[0];

            // CRITICAL: Verify that the existing subscription is for the SAME plan as the session
            const existingPlanId = typeof existingByUserId.membershipPlanId === 'number'
              ? existingByUserId.membershipPlanId
              : parseInt(String(existingByUserId.membershipPlanId), 10);
            const newPlanId = parseInt(membershipPlanId, 10);

            console.log('[MEMBERSHIP-SUCCESS] Step 8: Found existing subscription by userProfileId, checking plan match...', {
              existingSubscriptionId: existingByUserId.id,
              existingPlanId,
              newPlanId,
              planIdsMatch: existingPlanId === newPlanId,
              stripeSubscriptionId: existingByUserId.stripeSubscriptionId,
              timestamp: new Date().toISOString(),
            });

            if (existingPlanId === newPlanId) {
              // Same plan - this is the correct subscription
              console.log('[MEMBERSHIP-SUCCESS] ✅ Step 8: Existing subscription matches plan - returning existing subscription');
              // Fetch plan and user profile for return
              const plan = existingByUserId.membershipPlan || await fetchMembershipPlanById(existingByUserId.membershipPlanId);
              const userProfile = existingByUserId.userProfile || await fetchUserProfileById(existingByUserId.userProfileId);
              return { subscription: existingByUserId, plan, userProfile };
            } else {
              // DIFFERENT plan - this is a plan switch, so we should NOT return the existing subscription
              // We'll cancel it and create a new one below
              console.log('[MEMBERSHIP-SUCCESS] ⚠️ Step 8: Existing subscription is for DIFFERENT plan - will cancel and create new one:', {
                existingSubscriptionId: existingByUserId.id,
                existingPlanId,
                newPlanId,
                message: 'Plan switch detected - will cancel old subscription and create new one'
              });
              // Don't return - continue to plan switch handling logic below
            }
          } else {
            console.log('[MEMBERSHIP-SUCCESS] Step 8: No existing subscription found by userProfileId');
          }
        }
      } catch (lookupError) {
        console.warn('[MEMBERSHIP-SUCCESS] Step 8: Error looking up existing subscription by userProfileId (non-fatal):', lookupError);
      }
    }

    // CRITICAL: Before creating new subscription, check if user has ONE active subscription for a DIFFERENT plan
    // If found, cancel ONLY that one subscription (both database and Stripe)
    // This handles plan switches (e.g., switching from Plan 1 to Plan 2)
    // PERFORMANCE: Use size=1 to get only the most recent active subscription - don't iterate through all records
    console.log('[MEMBERSHIP-SUCCESS] Step 9: Checking for active subscription for different plan...', {
      userProfileId: userProfile.id,
      newPlanId: parseInt(membershipPlanId, 10),
    });
    if (userProfile.id) {
      try {
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'userProfileId.equals': String(userProfile.id),
          'tenantId.equals': tenantId,
          'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only check for active or trial subscriptions
          'size': '1', // CRITICAL: Only get one result - the most recent
          'sort': 'createdAt,desc', // Get the most recent one
        });
        const response = await fetchWithJwtRetry(
          `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
          { cache: 'no-store' }
        );
        if (response.ok) {
          const items: MembershipSubscriptionDTO[] = await response.json();

          // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
          // Only process ACTIVE or TRIAL subscriptions
          const activeSubscriptions = items.filter(sub =>
            sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
          );

          if (activeSubscriptions.length > 0) {
            const activeSub = activeSubscriptions[0]; // Only process the first (most recent) one
            const activePlanId = typeof activeSub.membershipPlanId === 'number'
              ? activeSub.membershipPlanId
              : parseInt(String(activeSub.membershipPlanId), 10);
            const newPlanId = parseInt(membershipPlanId, 10);

            // Only cancel if it's for a DIFFERENT plan
            if (activePlanId !== newPlanId) {
              console.log('[MEMBERSHIP-SUCCESS] ⚠️ Step 9: Found active subscription for different plan - will cancel:', {
                subscriptionId: activeSub.id,
                existingPlanId: activePlanId,
                newPlanId: newPlanId,
                status: activeSub.subscriptionStatus,
                stripeSubscriptionId: activeSub.stripeSubscriptionId,
              });

              try {
                // Cancel in database
                const cancelPayload = withTenantId({
                  id: activeSub.id!,
                  cancelAtPeriodEnd: true,
                  cancellationReason: `Switched to plan ${membershipPlanId}`,
                  subscriptionStatus: 'CANCELLED',
                  cancelledAt: new Date().toISOString(),
                });

                await fetchWithJwtRetry(
                  `${getAppUrl()}/api/proxy/membership-subscriptions/${activeSub.id}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify(cancelPayload),
                    cache: 'no-store',
                  },
                  '[MEMBERSHIP-SUCCESS] cancel-other-plan-subscription-session'
                );

                console.log('[MEMBERSHIP-SUCCESS] ✅ Step 9: Cancelled active subscription in database:', activeSub.id);

                // Also cancel the Stripe subscription if it exists and is not already cancelled/expired
                if (activeSub.stripeSubscriptionId) {
                  try {
                    const stripeSub = await stripe().subscriptions.retrieve(activeSub.stripeSubscriptionId);
                    // Only cancel if subscription is not already cancelled or incomplete_expired
                    if (stripeSub.status !== 'canceled' && stripeSub.status !== 'incomplete_expired') {
                      await stripe().subscriptions.update(activeSub.stripeSubscriptionId, {
                        cancel_at_period_end: true,
                        metadata: {
                          ...stripeSub.metadata,
                          cancellation_reason: `Switched to plan ${membershipPlanId}`,
                          cancelled_at: new Date().toISOString(),
                        },
                      });
                      console.log('[MEMBERSHIP-SUCCESS] ✅ Step 9: Cancelled Stripe subscription:', activeSub.stripeSubscriptionId);
                    } else {
                      console.log('[MEMBERSHIP-SUCCESS] ⚠️ Step 9: Stripe subscription already cancelled/incomplete_expired:', activeSub.stripeSubscriptionId);
                    }
                  } catch (stripeError: any) {
                    console.error('[MEMBERSHIP-SUCCESS] ⚠️ Step 9: Failed to cancel Stripe subscription (non-fatal):', stripeError.message);
                  }
                }
              } catch (cancelError: any) {
                console.error('[MEMBERSHIP-SUCCESS] ⚠️ Step 9: Failed to cancel active subscription (non-fatal):', cancelError.message);
                // Continue - will still create new subscription
              }
            } else {
              console.log('[MEMBERSHIP-SUCCESS] Step 9: Active subscription found but for same plan - no cancellation needed.');
            }
          } else {
            console.log('[MEMBERSHIP-SUCCESS] Step 9: No active subscriptions found.');
          }
        }
      } catch (error: any) {
        console.error('[MEMBERSHIP-SUCCESS] ⚠️ Step 9: Error checking for active subscription (non-fatal):', error.message);
        // Continue with creation if check fails
      }
    }

    // Calculate trial dates if applicable
    const trialStart = plan.trialDays && plan.trialDays > 0 ? new Date().toISOString() : undefined;
    const trialEnd = plan.trialDays && plan.trialDays > 0
      ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Get current period dates from Stripe subscription
    const currentPeriodStart = stripeSubscription?.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const currentPeriodEnd = stripeSubscription?.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days

    // Determine subscription status
    const subscriptionStatus = plan.trialDays && plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';

    // Create subscription payload
    const subscriptionPayload = withTenantId({
      userProfileId: userProfile.id,
      membershipPlanId: plan.id!,
      subscriptionStatus,
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId,
      stripeCustomerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create subscription via backend API
    const baseUrl = getAppUrl();
    const createRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/membership-subscriptions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionPayload),
        cache: 'no-store',
      }
    );

    if (!createRes.ok) {
      const errorBody = await createRes.text();
      console.error('[MEMBERSHIP-SUCCESS] Failed to create subscription:', createRes.status, errorBody);
      return null;
    }

    const createdSubscription: MembershipSubscriptionDTO = await createRes.json();

    console.log('[MEMBERSHIP-SUCCESS] Subscription created successfully:', {
      subscriptionId: createdSubscription.id,
      sessionId,
      userId,
      membershipPlanId,
      timestamp: new Date().toISOString(),
    });

    return { subscription: createdSubscription, plan, userProfile };
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error processing subscription session:', error);
    return null;
  }
}

/**
 * Fetch user profile by email (for public routes where userId is not available)
 */
async function fetchUserProfileByEmail(email: string): Promise<UserProfileDTO | null> {
  try {
    if (!email) return null;
    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'email.equals': email,
      'tenantId.equals': tenantId,
      'size': '1',
    });
    const url = `${getAppUrl()}/api/proxy/user-profiles?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.content || []);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching user profile by email:', error);
    return null;
  }
}

/**
 * Process Payment Intent and create subscription (for desktop Stripe Elements flow)
 */
export async function processMembershipSubscriptionFromPaymentIntent(
  paymentIntentId: string,
  userId?: string | null,
): Promise<{ subscription: MembershipSubscriptionDTO | null; plan: MembershipPlanDTO | null; userProfile: UserProfileDTO | null } | null> {
  const functionStartTime = Date.now();
  console.log('[MEMBERSHIP-SUCCESS] 🔵 START: processMembershipSubscriptionFromPaymentIntent', {
    paymentIntentId,
    userId: userId || 'will be extracted from email',
    timestamp: new Date().toISOString()
  });

  try {
    // Retrieve Payment Intent from Stripe (expand payment_method to get payment method details)
    console.log('[MEMBERSHIP-SUCCESS] Step 1: Retrieving Payment Intent from Stripe...', { paymentIntentId });
    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
    console.log('[MEMBERSHIP-SUCCESS] Step 1 ✅: Payment Intent retrieved', {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer,
      hasMetadata: !!paymentIntent.metadata,
      metadataKeys: paymentIntent.metadata ? Object.keys(paymentIntent.metadata) : [],
    });

    // Check if payment succeeded or requires capture (both indicate successful payment)
    // Payment Intents can be in 'succeeded' or 'requires_capture' status after successful payment
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #1: Payment Intent not in succeeded state:', {
        status: paymentIntent.status,
        paymentIntentId,
        expectedStatuses: ['succeeded', 'requires_capture'],
      });
      return null;
    }

    // Extract metadata
    console.log('[MEMBERSHIP-SUCCESS] Step 2: Extracting metadata...');
    const metadata = paymentIntent.metadata || {};
    const membershipPlanId = metadata.membershipPlanId;
    const tenantId = metadata.tenantId || getTenantId();
    const customerEmail = metadata.customerEmail || paymentIntent.receipt_email || '';

    console.log('[MEMBERSHIP-SUCCESS] Step 2 ✅: Metadata extracted', {
      membershipPlanId,
      tenantId,
      customerEmail: customerEmail ? `${customerEmail.substring(0, 5)}...` : 'missing',
      hasMetadata: !!metadata,
      metadataKeys: Object.keys(metadata),
      fullMetadata: metadata, // Log full metadata for debugging
    });

    if (!membershipPlanId) {
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #2: Missing membershipPlanId in Payment Intent metadata:', {
        paymentIntentId,
        metadata,
        allMetadataKeys: Object.keys(metadata),
        fullMetadata: metadata,
      });
      return null;
    }

    // CRITICAL: Get userId from email if not provided (for public routes)
    console.log('[MEMBERSHIP-SUCCESS] Step 3: Getting userId and user profile...');
    let finalUserId = userId;
    let userProfile: UserProfileDTO | null = null;

    if (!finalUserId && customerEmail) {
      console.log('[MEMBERSHIP-SUCCESS] Step 3a: userId not provided - looking up by email:', customerEmail);
      userProfile = await fetchUserProfileByEmail(customerEmail);
      if (userProfile?.userId) {
        finalUserId = userProfile.userId;
        console.log('[MEMBERSHIP-SUCCESS] Step 3a ✅: Found userId from email lookup:', {
          userId: finalUserId,
          profileId: userProfile.id,
        });
      } else {
        console.error('[MEMBERSHIP-SUCCESS] Step 3a ⚠️: User profile not found for email:', {
          email: customerEmail,
          paymentIntentId,
          note: 'Will attempt fallback profile creation',
        });
        // Don't return null yet - try fallback creation below
      }
    } else if (finalUserId) {
      // Fetch user profile by userId
      console.log('[MEMBERSHIP-SUCCESS] Step 3b: Fetching user profile by userId:', finalUserId);
      userProfile = await fetchUserProfileByUserId(finalUserId);
      if (userProfile) {
        console.log('[MEMBERSHIP-SUCCESS] Step 3b ✅: User profile found by userId:', {
          profileId: userProfile.id,
          userId: finalUserId,
        });
      } else {
        console.error('[MEMBERSHIP-SUCCESS] Step 3b ❌: User profile not found for userId:', finalUserId);
      }
    } else {
      console.error('[MEMBERSHIP-SUCCESS] Step 3 ❌: No userId and no customerEmail available');
    }

    // FALLBACK: If profile doesn't exist, create it from payment data
    if (!userProfile?.id) {
      console.log('[MEMBERSHIP-SUCCESS] User profile not found - attempting fallback creation:', {
        userId: finalUserId,
        email: customerEmail
      });

      // Only create profile if we have both userId and email
      if (finalUserId && customerEmail) {
        try {
          console.log('[MEMBERSHIP-SUCCESS] Creating user profile from payment data');
          const now = new Date().toISOString();
          const profileData = withTenantId({
            userId: finalUserId,
            email: customerEmail,
            firstName: metadata.customerName?.split(' ')[0] || 'User',
            lastName: metadata.customerName?.split(' ').slice(1).join(' ') || '',
            phone: metadata.customerPhone || '',
            userRole: 'MEMBER',
            userStatus: 'PENDING_APPROVAL',
            createdAt: now,
            updatedAt: now,
          });

          const createRes = await fetchWithJwtRetry(
            `${getAppUrl()}/api/proxy/user-profiles`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(profileData),
            },
            '[MEMBERSHIP-SUCCESS] fallback-create-profile'
          );

          if (createRes.ok) {
            userProfile = await createRes.json();
            console.log('[MEMBERSHIP-SUCCESS] ✅ Fallback profile created successfully:', userProfile.id);
          } else {
            const errorText = await createRes.text();
            console.error('[MEMBERSHIP-SUCCESS] ❌ Failed to create fallback profile:', {
              status: createRes.status,
              error: errorText,
            });
            // Don't return null yet - log error but continue to show error message
          }
        } catch (createError) {
          console.error('[MEMBERSHIP-SUCCESS] ❌ Error creating fallback profile:', createError);
        }
      }

      // If still no profile after fallback attempt, log error and return null
      if (!userProfile?.id) {
        console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #3: User profile not found and fallback creation failed:', {
          userId: finalUserId,
          email: customerEmail,
          paymentIntentId,
          step: 'After fallback profile creation attempt',
        });
        // Return null - caller will handle error display
        // This is an edge case that should rarely happen if we enforce profile before payment
        return null;
      }
    }

    if (!finalUserId) {
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #4: Missing userId - could not determine from email or provided value', {
        providedUserId: userId,
        customerEmail,
        paymentIntentId,
      });
      return null;
    }

    // Fetch membership plan
    console.log('[MEMBERSHIP-SUCCESS] Step 4: Fetching membership plan...', { membershipPlanId });
    const plan = await fetchMembershipPlanById(parseInt(membershipPlanId, 10));
    if (!plan) {
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #5: Membership plan not found:', {
        membershipPlanId,
        paymentIntentId,
        parsedPlanId: parseInt(membershipPlanId, 10),
      });
      return null;
    }
    console.log('[MEMBERSHIP-SUCCESS] Step 4 ✅: Membership plan found', {
      planId: plan.id,
      planName: plan.planName,
    });

    // CRITICAL: Verify plan has required Stripe fields
    console.log('[MEMBERSHIP-SUCCESS] Plan details:', {
      planId: plan.id,
      planName: plan.planName,
      stripePriceId: plan.stripePriceId,
      stripeProductId: plan.stripeProductId,
      billingInterval: plan.billingInterval,
      price: plan.price,
      currency: plan.currency,
      trialDays: plan.trialDays,
    });

    if (!plan.stripePriceId) {
      console.error('[MEMBERSHIP-SUCCESS] ⚠️ Plan missing stripePriceId - cannot create Stripe Subscription:', {
        planId: plan.id,
        planName: plan.planName,
      });
    }

    // CRITICAL: Check if subscription already exists (backend webhook may have created it)
    // First try to find by Payment Intent ID (if stored)
    console.log('[MEMBERSHIP-SUCCESS] Step 5: Checking for existing subscription by Payment Intent ID...', { paymentIntentId });
    let existingSubscription = await findSubscriptionByPaymentIntentId(paymentIntentId);
    console.log('[MEMBERSHIP-SUCCESS] Step 5 ✅: Existing subscription check complete', {
      found: !!existingSubscription,
      subscriptionId: existingSubscription?.id,
      status: existingSubscription?.subscriptionStatus,
    });

    // CRITICAL: Verify that the found subscription actually matches this payment intent AND plan
    // If the payment intent ID doesn't match, it might be a false match
    if (existingSubscription) {
      const paymentIntentMatch = existingSubscription.stripePaymentIntentId === paymentIntentId;
      // CRITICAL: Ensure both plan IDs are numbers for proper comparison
      const existingPlanIdForCheck = typeof existingSubscription.membershipPlanId === 'number'
        ? existingSubscription.membershipPlanId
        : parseInt(String(existingSubscription.membershipPlanId), 10);
      const newPlanIdForCheck = parseInt(membershipPlanId, 10);
      const planIdMatch = existingPlanIdForCheck === newPlanIdForCheck;

      console.log('[MEMBERSHIP-SUCCESS] Verifying found subscription:', {
        subscriptionId: existingSubscription.id,
        storedPaymentIntentId: existingSubscription.stripePaymentIntentId || 'NULL/UNDEFINED',
        currentPaymentIntentId: paymentIntentId,
        paymentIntentMatch,
        storedPlanId: existingSubscription.membershipPlanId,
        storedPlanIdType: typeof existingSubscription.membershipPlanId,
        convertedStoredPlanId: existingPlanIdForCheck,
        currentPlanId: newPlanIdForCheck,
        planIdMatch,
        status: existingSubscription.subscriptionStatus,
      });

      // If payment intent ID doesn't match, it's a false match from backend
      if (!paymentIntentMatch) {
        console.log('[MEMBERSHIP-SUCCESS] ⚠️ Found subscription but payment intent ID mismatch - ignoring:', {
          subscriptionId: existingSubscription.id,
          storedPaymentIntentId: existingSubscription.stripePaymentIntentId || 'NULL/UNDEFINED',
          currentPaymentIntentId: paymentIntentId,
          message: 'Payment intent ID mismatch - will create new subscription'
        });
        existingSubscription = null; // Reset to null so we create a new subscription
      }
      // If plan ID doesn't match, it's a plan switch scenario
      // CRITICAL: Even if payment intent ID matches, if plan ID doesn't match, we need to cancel old and create new
      else if (!planIdMatch) {
        console.log('[MEMBERSHIP-SUCCESS] ⚠️ CRITICAL: Payment intent ID matches but plan ID mismatch (plan switch detected):', {
          subscriptionId: existingSubscription.id,
          storedPlanId: existingSubscription.membershipPlanId,
          storedPlanIdType: typeof existingSubscription.membershipPlanId,
          convertedStoredPlanId: existingPlanIdForCheck,
          currentPlanId: newPlanIdForCheck,
          storedPaymentIntentId: existingSubscription.stripePaymentIntentId,
          currentPaymentIntentId: paymentIntentId,
          status: existingSubscription.subscriptionStatus,
          message: 'Plan switch detected - will cancel old subscription and create new one. Keeping existingSubscription set so plan switch logic can cancel it.'
        });
        // Keep existingSubscription set so the plan switch logic at line 644+ can cancel it
        // Don't set to null here - the plan switch logic will handle cancellation and then set it to null
      }
    }

    // CRITICAL: Only accept ACTIVE or TRIAL subscriptions - ignore CANCELLED ones
    // If a cancelled subscription is found, we need to create a new one
    if (existingSubscription && (existingSubscription.subscriptionStatus === 'CANCELLED' || existingSubscription.subscriptionStatus === 'EXPIRED')) {
      console.log('[MEMBERSHIP-SUCCESS] Found cancelled/expired subscription - will create new one:', {
        subscriptionId: existingSubscription.id,
        status: existingSubscription.subscriptionStatus,
        paymentIntentId,
      });
      existingSubscription = null; // Reset to null so we create a new subscription
    }

    // If not found by Payment Intent ID, check for active subscription for this user and plan
    // (prevents duplicates when Payment Intent ID isn't stored)
    console.log('[MEMBERSHIP-SUCCESS] Step 6: Checking for existing subscription by user and plan...', {
      userProfileId: userProfile.id,
      membershipPlanId,
      hasExistingSubscription: !!existingSubscription,
    });
    if (!existingSubscription && userProfile.id && membershipPlanId) {
      try {
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'userProfileId.equals': String(userProfile.id),
          'membershipPlanId.equals': String(membershipPlanId),
          'tenantId.equals': tenantId,
          'subscriptionStatus.in': 'ACTIVE,TRIAL', // Check for active or trial subscriptions only
          'size': '1', // CRITICAL: Only get one result - the most recent
          'sort': 'createdAt,desc', // Get the most recent one
        });
        const response = await fetchWithJwtRetry(
          `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
          { cache: 'no-store' }
        );
        if (response.ok) {
          const items: MembershipSubscriptionDTO[] = await response.json();
          // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
          const activeSubscriptions = items.filter(sub =>
            sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
          );
          if (activeSubscriptions.length > 0) {
            // Get the most recent subscription (created within last 10 minutes to avoid old subscriptions)
            const mostRecent = activeSubscriptions[0]; // Already sorted by createdAt,desc
            if (mostRecent.createdAt) {
              const createdAt = new Date(mostRecent.createdAt);
              const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
              if (createdAt > tenMinutesAgo) {
                existingSubscription = mostRecent;
                console.log('[MEMBERSHIP-SUCCESS] Found existing active subscription by user and plan:', {
                  subscriptionId: existingSubscription.id,
                  paymentIntentId,
                  timestamp: new Date().toISOString(),
                });

            // CRITICAL: If the found subscription has NULL stripePaymentIntentId, update it
            // This ensures the payment intent ID is properly linked to the subscription
            if (!existingSubscription.stripePaymentIntentId) {
              console.log('[MEMBERSHIP-SUCCESS] Updating subscription with payment intent ID:', {
                subscriptionId: existingSubscription.id,
                paymentIntentId,
              });
              try {
                const updatePayload = withTenantId({
                  id: existingSubscription.id!,
                  stripePaymentIntentId: paymentIntentId,
                });

                await fetchWithJwtRetry(
                  `${getAppUrl()}/api/proxy/membership-subscriptions/${existingSubscription.id}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify(updatePayload),
                    cache: 'no-store',
                  },
                  '[MEMBERSHIP-SUCCESS] update-payment-intent-id-for-existing'
                );

                // Update the subscription object with the new payment intent ID
                existingSubscription.stripePaymentIntentId = paymentIntentId;
                console.log('[MEMBERSHIP-SUCCESS] ✅ Updated existing subscription with payment intent ID');
              } catch (updateError) {
                console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Failed to update payment intent ID (non-fatal):', updateError);
                // Continue - subscription is still valid
              }
            }
              } else {
                console.log('[MEMBERSHIP-SUCCESS] Found subscription but it was created more than 10 minutes ago - will create new one');
              }
            } else {
              console.log('[MEMBERSHIP-SUCCESS] Found subscription but it has no createdAt date - will create new one');
            }
          } else {
            console.log('[MEMBERSHIP-SUCCESS] No active subscriptions found for this user and plan');
          }
        }
      } catch (error) {
        console.error('[MEMBERSHIP-SUCCESS] Error checking for existing subscription by user and plan:', error);
        // Continue with creation if check fails
      }
    }

    if (existingSubscription && (existingSubscription.subscriptionStatus === 'ACTIVE' || existingSubscription.subscriptionStatus === 'TRIAL')) {
      // CRITICAL: Check if existing subscription is for the SAME plan as the payment intent
      // If it's for a DIFFERENT plan, we need to cancel the old subscription and create a new one
      // CRITICAL: Ensure both are numbers for proper comparison
      const existingPlanId = typeof existingSubscription.membershipPlanId === 'number'
        ? existingSubscription.membershipPlanId
        : parseInt(String(existingSubscription.membershipPlanId), 10);
      const newPlanId = parseInt(membershipPlanId, 10);

      console.log('[MEMBERSHIP-SUCCESS] 🔍 Checking plan switch scenario:', {
        existingSubscriptionId: existingSubscription.id,
        existingPlanId,
        existingPlanIdType: typeof existingSubscription.membershipPlanId,
        newPlanId,
        planIdsMatch: existingPlanId === newPlanId,
        subscriptionStatus: existingSubscription.subscriptionStatus,
        paymentIntentId,
      });

      if (existingPlanId !== newPlanId) {
        console.log('[MEMBERSHIP-SUCCESS] ⚠️ Plan switch detected - existing subscription is for different plan:', {
          existingSubscriptionId: existingSubscription.id,
          existingPlanId,
          newPlanId,
          paymentIntentId,
          message: 'Will cancel old subscription and create new one for new plan'
        });

        // Cancel the old subscription (cancel at period end to maintain access until new subscription starts)
        try {
          const cancelPayload = withTenantId({
            id: existingSubscription.id!,
            cancelAtPeriodEnd: true,
            cancellationReason: `Switched to plan ${newPlanId}`,
            subscriptionStatus: 'CANCELLED',
            cancelledAt: new Date().toISOString(),
          });

          await fetchWithJwtRetry(
            `${getAppUrl()}/api/proxy/membership-subscriptions/${existingSubscription.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/merge-patch+json' },
              body: JSON.stringify(cancelPayload),
              cache: 'no-store',
            },
            '[MEMBERSHIP-SUCCESS] cancel-old-subscription-for-plan-switch'
          );

          console.log('[MEMBERSHIP-SUCCESS] ✅ Cancelled old subscription for plan switch:', existingSubscription.id);

          // Also cancel the Stripe subscription if it exists
          if (existingSubscription.stripeSubscriptionId) {
            try {
              await stripe().subscriptions.update(existingSubscription.stripeSubscriptionId, {
                cancel_at_period_end: true,
                metadata: {
                  ...(await stripe().subscriptions.retrieve(existingSubscription.stripeSubscriptionId)).metadata,
                  cancellation_reason: `Switched to plan ${newPlanId}`,
                  cancelled_at: new Date().toISOString(),
                },
              });
              console.log('[MEMBERSHIP-SUCCESS] ✅ Cancelled Stripe subscription for plan switch:', existingSubscription.stripeSubscriptionId);
            } catch (stripeError) {
              console.error('[MEMBERSHIP-SUCCESS] ⚠️ Failed to cancel Stripe subscription (non-fatal):', stripeError);
            }
          }
        } catch (cancelError) {
          console.error('[MEMBERSHIP-SUCCESS] ⚠️ Failed to cancel old subscription (non-fatal, will still create new one):', cancelError);
        }

        // Reset existingSubscription to null so we create a new subscription
        existingSubscription = null;
      } else {
        // Same plan - return existing subscription (webhook may have already created it)
        console.log('[MEMBERSHIP-SUCCESS] Subscription already exists for Payment Intent (same plan):', {
          paymentIntentId,
          subscriptionId: existingSubscription.id,
          planId: existingPlanId,
          status: existingSubscription.subscriptionStatus,
          timestamp: new Date().toISOString(),
          message: 'Backend webhook already created subscription - returning existing subscription'
        });
        // Fetch plan and user profile for return (already fetched above)
        const plan = existingSubscription.membershipPlan || plan;
        const userProfile = existingSubscription.userProfile || userProfile;
        return { subscription: existingSubscription, plan, userProfile };
      }
    }

    // CRITICAL: Before creating new subscription, check if user has ONE active subscription for a DIFFERENT plan
    // If found, cancel ONLY that one subscription (both database and Stripe)
    // PERFORMANCE: Use size=1 to get only the most recent active subscription - don't iterate through all records
    if (userProfile.id && !existingSubscription) {
      try {
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'userProfileId.equals': String(userProfile.id),
          'tenantId.equals': tenantId,
          'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only check for active or trial subscriptions
          'size': '1', // CRITICAL: Only get one result - the most recent
          'sort': 'createdAt,desc', // Get the most recent one
        });
        const response = await fetchWithJwtRetry(
          `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
          { cache: 'no-store' }
        );
        if (response.ok) {
          const items: MembershipSubscriptionDTO[] = await response.json();

          // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
          // Only process ACTIVE or TRIAL subscriptions
          const activeSubscriptions = items.filter(sub =>
            sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
          );

          if (activeSubscriptions.length > 0) {
            const activeSub = activeSubscriptions[0]; // Only process the first (most recent) one
            const activePlanId = typeof activeSub.membershipPlanId === 'number'
              ? activeSub.membershipPlanId
              : parseInt(String(activeSub.membershipPlanId), 10);
            const newPlanId = parseInt(membershipPlanId, 10);

            // Only cancel if it's for a DIFFERENT plan
            if (activePlanId !== newPlanId) {
              console.log('[MEMBERSHIP-SUCCESS] ⚠️ Found active subscription for different plan - will cancel:', {
                subscriptionId: activeSub.id,
                existingPlanId: activePlanId,
                newPlanId: newPlanId,
                status: activeSub.subscriptionStatus,
                stripeSubscriptionId: activeSub.stripeSubscriptionId,
              });

              try {
                const cancelPayload = withTenantId({
                  id: activeSub.id!,
                  cancelAtPeriodEnd: true,
                  cancellationReason: `Switched to plan ${membershipPlanId}`,
                  subscriptionStatus: 'CANCELLED',
                  cancelledAt: new Date().toISOString(),
                });

                await fetchWithJwtRetry(
                  `${getAppUrl()}/api/proxy/membership-subscriptions/${activeSub.id}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify(cancelPayload),
                    cache: 'no-store',
                  },
                  '[MEMBERSHIP-SUCCESS] cancel-other-plan-subscription'
                );

                console.log('[MEMBERSHIP-SUCCESS] ✅ Cancelled active subscription in database:', activeSub.id);

                // Also cancel the Stripe subscription if it exists and is not already cancelled/expired
                if (activeSub.stripeSubscriptionId) {
                  try {
                    const stripeSub = await stripe().subscriptions.retrieve(activeSub.stripeSubscriptionId);
                    // Only cancel if subscription is not already cancelled or incomplete_expired
                    if (stripeSub.status !== 'canceled' && stripeSub.status !== 'incomplete_expired') {
                      await stripe().subscriptions.update(activeSub.stripeSubscriptionId, {
                        cancel_at_period_end: true,
                        metadata: {
                          ...stripeSub.metadata,
                          cancellation_reason: `Switched to plan ${membershipPlanId}`,
                          cancelled_at: new Date().toISOString(),
                        },
                      });
                      console.log('[MEMBERSHIP-SUCCESS] ✅ Cancelled Stripe subscription:', activeSub.stripeSubscriptionId);
                    } else {
                      console.log('[MEMBERSHIP-SUCCESS] ⚠️ Stripe subscription already cancelled/incomplete_expired:', activeSub.stripeSubscriptionId);
                    }
                  } catch (stripeError) {
                    console.error('[MEMBERSHIP-SUCCESS] ⚠️ Failed to cancel Stripe subscription (non-fatal):', stripeError);
                  }
                }
              } catch (cancelError) {
                console.error('[MEMBERSHIP-SUCCESS] ⚠️ Failed to cancel active subscription (non-fatal):', cancelError);
                // Continue - will still create new subscription
              }
            } else {
              console.log('[MEMBERSHIP-SUCCESS] Active subscription found but for same plan - no cancellation needed.');
            }
          } else {
            console.log('[MEMBERSHIP-SUCCESS] No active subscriptions found.');
          }
        }
      } catch (error) {
        console.error('[MEMBERSHIP-SUCCESS] Error checking for active subscription:', error);
        // Continue with creation if check fails
      }
    }

    // CRITICAL: Get or create Stripe Customer from Payment Intent
    // Payment Intents may not have a customer attached initially, so we need to create/get one
    let stripeCustomerId: string | null = null;

    if (paymentIntent.customer) {
      // Customer already attached to Payment Intent
      stripeCustomerId = typeof paymentIntent.customer === 'string'
        ? paymentIntent.customer
        : (paymentIntent.customer as any)?.id || null;
      console.log('[MEMBERSHIP-SUCCESS] Found customer on Payment Intent:', stripeCustomerId);
    } else {
      // No customer attached - create/get customer from email
      console.log('[MEMBERSHIP-SUCCESS] No customer on Payment Intent - creating/getting customer from email:', customerEmail);
      try {
        // Search for existing customer by email
        const existingCustomers = await stripe().customers.list({
          email: customerEmail,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          stripeCustomerId = existingCustomers.data[0].id;
          console.log('[MEMBERSHIP-SUCCESS] Found existing Stripe customer:', stripeCustomerId);
        } else {
          // Create new customer
          const newCustomer = await stripe().customers.create({
            email: customerEmail,
            name: userProfile.firstName && userProfile.lastName
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : undefined,
            phone: userProfile.phone || undefined,
            metadata: {
              userId: finalUserId,
              tenantId: tenantId,
              userProfileId: String(userProfile.id),
            },
          });
          stripeCustomerId = newCustomer.id;
          console.log('[MEMBERSHIP-SUCCESS] Created new Stripe customer:', stripeCustomerId);
        }
      } catch (customerError) {
        console.error('[MEMBERSHIP-SUCCESS] Error creating/getting Stripe customer:', customerError);
        // Continue without customer ID - subscription will still be created
      }
    }

    // CRITICAL: Attach payment method from payment intent to customer
    // This ensures the customer has a payment method before creating the subscription
    // This prevents the subscription from being created as 'incomplete'
    if (stripeCustomerId && paymentIntent.payment_method) {
      try {
        const pmId = typeof paymentIntent.payment_method === 'string'
          ? paymentIntent.payment_method
          : (paymentIntent.payment_method as any)?.id;

        if (pmId) {
          // Check if payment method is already attached to this customer
          const paymentMethod = await stripe().paymentMethods.retrieve(pmId);

          if (paymentMethod.customer !== stripeCustomerId) {
            // Payment method exists but isn't attached to this customer - attach it
            console.log('[MEMBERSHIP-SUCCESS] Attaching payment method from payment intent to customer...');
            try {
              await stripe().paymentMethods.attach(pmId, {
                customer: stripeCustomerId,
              });
              console.log('[MEMBERSHIP-SUCCESS] ✅ Attached payment method to customer:', pmId);

              // Set it as the default payment method for the customer
              await stripe().customers.update(stripeCustomerId, {
                invoice_settings: {
                  default_payment_method: pmId,
                },
              });
              console.log('[MEMBERSHIP-SUCCESS] ✅ Set payment method as default for customer');
            } catch (attachError: any) {
              if (attachError.code === 'resource_already_exists') {
                console.log('[MEMBERSHIP-SUCCESS] Payment method already attached to customer');
              } else {
                console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not attach payment method to customer:', attachError.message);
                // Continue - we'll try to attach it later when paying the invoice
              }
            }
          } else {
            console.log('[MEMBERSHIP-SUCCESS] Payment method already attached to customer:', pmId);
          }
        }
      } catch (pmError: any) {
        console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not attach payment method from payment intent:', pmError.message);
        // Continue - we'll try to attach it later when paying the invoice
      }
    }

    // Calculate trial dates if applicable
    const trialStart = plan.trialDays && plan.trialDays > 0 ? new Date().toISOString() : undefined;
    const trialEnd = plan.trialDays && plan.trialDays > 0
      ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Calculate current period dates based on billing interval (fallback if Stripe Subscription not created)
    let currentPeriodStart = new Date().toISOString();
    let periodDays = 30; // Default to 30 days (monthly)
    if (plan.billingInterval === 'QUARTERLY') {
      periodDays = 90; // 3 months
    } else if (plan.billingInterval === 'YEARLY') {
      periodDays = 365; // 1 year
    } else if (plan.billingInterval === 'MONTHLY') {
      periodDays = 30; // 1 month
    }
    let currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    // CRITICAL: Create Stripe Subscription for recurring billing
    // For membership subscriptions, we need a Stripe Subscription object for recurring charges
    let stripeSubscriptionId: string | null = null;
    let finalStripePriceId: string | null = plan.stripePriceId || null;

    // CRITICAL: If plan doesn't have stripePriceId, create/get Stripe Price on the fly
    if (!finalStripePriceId && stripeCustomerId) {
      console.log('[MEMBERSHIP-SUCCESS] Plan missing stripePriceId - creating Stripe Price on the fly:', {
        planId: plan.id,
        planName: plan.planName,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
      });

      try {
        // Determine Stripe Price interval based on billing interval
        let priceInterval: 'month' | 'year' = 'month';
        if (plan.billingInterval === 'YEARLY') {
          priceInterval = 'year';
        } else if (plan.billingInterval === 'QUARTERLY') {
          // Stripe doesn't support quarterly directly - use monthly with interval_count
          priceInterval = 'month';
        }

        // Get or create Stripe Product
        let stripeProductId = plan.stripeProductId;
        if (!stripeProductId) {
          console.log('[MEMBERSHIP-SUCCESS] Creating Stripe Product:', plan.planName);
          const stripeProduct = await stripe().products.create({
            name: plan.planName || `Membership Plan ${plan.id}`,
            description: plan.description || undefined,
            metadata: {
              membershipPlanId: String(membershipPlanId),
              tenantId: tenantId,
            },
          });
          stripeProductId = stripeProduct.id;
          console.log('[MEMBERSHIP-SUCCESS] ✅ Created Stripe Product:', stripeProductId);
        }

        // Create Stripe Price
        const priceParams: any = {
          product: stripeProductId,
          unit_amount: Math.round((plan.price || 0) * 100), // Convert to cents
          currency: (plan.currency || 'USD').toLowerCase(),
          recurring: {
            interval: priceInterval,
            ...(plan.billingInterval === 'QUARTERLY' ? { interval_count: 3 } : {}),
          },
          metadata: {
            membershipPlanId: String(membershipPlanId),
            tenantId: tenantId,
          },
        };

        const stripePrice = await stripe().prices.create(priceParams);
        finalStripePriceId = stripePrice.id;
        console.log('[MEMBERSHIP-SUCCESS] ✅ Created Stripe Price:', {
          priceId: finalStripePriceId,
          productId: stripeProductId,
          amount: plan.price,
          currency: plan.currency,
          interval: priceInterval,
        });
      } catch (priceError: any) {
        console.error('[MEMBERSHIP-SUCCESS] ❌ Error creating Stripe Price:', {
          error: priceError.message,
          type: priceError.type,
          code: priceError.code,
          planId: plan.id,
        });
        // Continue without Stripe Price - subscription will be created without Stripe Subscription
      }
    }

    if (stripeCustomerId && finalStripePriceId) {
      try {
        // CRITICAL: Payment methods from confirmed Payment Intents cannot be reused
        // Instead, we'll create the subscription and let Stripe handle payment method collection
        // Check if customer has any existing payment methods
        let hasPaymentMethod = false;
        try {
          const paymentMethods = await stripe().paymentMethods.list({
            customer: stripeCustomerId,
            limit: 1,
          });
          hasPaymentMethod = paymentMethods.data.length > 0;

          if (hasPaymentMethod) {
            console.log('[MEMBERSHIP-SUCCESS] Customer has existing payment methods:', {
              customerId: stripeCustomerId,
              paymentMethodCount: paymentMethods.data.length,
              defaultPaymentMethod: paymentMethods.data[0]?.id,
            });
          } else {
            console.log('[MEMBERSHIP-SUCCESS] Customer has no existing payment methods - will create subscription with default_incomplete behavior:', {
              customerId: stripeCustomerId,
            });
          }
        } catch (pmListError: any) {
          console.warn('[MEMBERSHIP-SUCCESS] Could not list customer payment methods:', pmListError.message);
        }

        // NOTE: Test clocks should be managed via scripts, not in application code
        // See documentation/domain_agnostic_payment/membership_susbscription/STRIPE_TEST_CLOCKS_GUIDE.html
        // Use setup-test-clock.js to attach customers to test clocks before creating subscriptions
        // If a customer is already attached to a test clock, Stripe will automatically use it for new subscriptions

        console.log('[MEMBERSHIP-SUCCESS] Step 8: Creating Stripe Subscription for recurring billing:', {
          customerId: stripeCustomerId,
          priceId: finalStripePriceId,
          trialDays: plan.trialDays,
          hasPaymentMethod,
          paymentIntentId,
        });

        const subscriptionParams: any = {
          customer: stripeCustomerId,
          items: [{ price: finalStripePriceId }],
          metadata: {
            membershipPlanId: String(membershipPlanId),
            tenantId: tenantId,
            userId: finalUserId,
            userProfileId: String(userProfile.id),
            paymentIntentId: paymentIntentId,
          },
          expand: ['latest_invoice.payment_intent'],
        };

        // CRITICAL: Use the payment intent's payment method for the subscription
        // If Payment Intent was created with customer parameter, payment method should be automatically attached
        // Check if payment method is attached and use it for subscription
        if (paymentIntent.payment_method && stripeCustomerId) {
          const pmId = typeof paymentIntent.payment_method === 'string'
            ? paymentIntent.payment_method
            : (paymentIntent.payment_method as any)?.id;

          if (pmId) {
            try {
              // Check if payment method is already attached to customer
              // If Payment Intent was created with customer, it should be attached automatically
              const paymentMethod = await stripe().paymentMethods.retrieve(pmId);

              if (paymentMethod.customer === stripeCustomerId) {
                // Payment method is already attached - use it for subscription
                subscriptionParams.default_payment_method = pmId;
                console.log('[MEMBERSHIP-SUCCESS] ✅ Payment method already attached to customer, using for subscription:', pmId);

                // Ensure it's set as default
                await stripe().customers.update(stripeCustomerId, {
                  invoice_settings: {
                    default_payment_method: pmId,
                  },
                });
                console.log('[MEMBERSHIP-SUCCESS] ✅ Set payment method as default for customer');
              } else {
                // Payment method exists but isn't attached - try to attach it
                console.log('[MEMBERSHIP-SUCCESS] Payment method not attached to customer, attempting to attach...');
                try {
                  await stripe().paymentMethods.attach(pmId, {
                    customer: stripeCustomerId,
                  });
                  console.log('[MEMBERSHIP-SUCCESS] ✅ Attached payment method to customer:', pmId);

                  subscriptionParams.default_payment_method = pmId;

                  await stripe().customers.update(stripeCustomerId, {
                    invoice_settings: {
                      default_payment_method: pmId,
                    },
                  });
                  console.log('[MEMBERSHIP-SUCCESS] ✅ Set payment method as default for customer');
                } catch (attachError: any) {
                  // If attachment fails (payment method was used without attachment), use default_incomplete
                  console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not attach payment method (payment method was used without attachment):', attachError.message);
                  subscriptionParams.payment_behavior = 'default_incomplete';
                  subscriptionParams.payment_settings = {
                    save_default_payment_method: 'on_subscription',
                  };
                }
              }
            } catch (pmError: any) {
              console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not retrieve payment method, using default_incomplete:', pmError.message);
              subscriptionParams.payment_behavior = 'default_incomplete';
              subscriptionParams.payment_settings = {
                save_default_payment_method: 'on_subscription',
              };
            }
          } else {
            // No payment method ID - use default_incomplete
            subscriptionParams.payment_behavior = 'default_incomplete';
            subscriptionParams.payment_settings = {
              save_default_payment_method: 'on_subscription',
            };
          }
        } else {
          // No payment method or customer - use default_incomplete
          subscriptionParams.payment_behavior = 'default_incomplete';
          subscriptionParams.payment_settings = {
            save_default_payment_method: 'on_subscription',
          };
        }

        // Add trial period if applicable
        if (plan.trialDays && plan.trialDays > 0) {
          subscriptionParams.trial_period_days = plan.trialDays;
        }

        // CRITICAL: Create subscription with payment method from payment intent
        // If the payment method cannot be attached, we'll create with default_incomplete and pay the invoice manually
        console.log('[MEMBERSHIP-SUCCESS] Step 8a: Creating Stripe Subscription with params:', {
          customer: subscriptionParams.customer,
          priceId: subscriptionParams.items[0]?.price,
          hasDefaultPaymentMethod: !!subscriptionParams.default_payment_method,
          paymentBehavior: subscriptionParams.payment_behavior,
          trialDays: subscriptionParams.trial_period_days,
        });
        let stripeSubscription;
        try {
          stripeSubscription = await stripe().subscriptions.create(subscriptionParams);
          console.log('[MEMBERSHIP-SUCCESS] Step 8a ✅: Stripe Subscription created:', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
          });
        } catch (createError: any) {
          console.error('[MEMBERSHIP-SUCCESS] Step 8a ❌: Stripe Subscription creation failed:', {
            error: createError.message,
            errorCode: createError.code,
            errorType: createError.type,
          });

          // Check if error is due to price mode mismatch (test price with live key or vice versa)
          // NOTE: This fix primarily affects mobile flow (payment intent), but desktop flow can also use payment intents in some cases
          // Desktop flow typically uses checkout sessions (processMembershipSubscriptionSessionServer), which doesn't create new subscriptions
          if (createError?.code === 'resource_missing' &&
              createError?.type === 'StripeInvalidRequestError' &&
              (createError.message?.includes('No such price') ||
               createError.message?.includes('test mode') ||
               createError.message?.includes('live mode'))) {
            console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Price ID mode mismatch detected, creating new price with correct mode:', {
              oldPriceId: finalStripePriceId,
              error: createError.message,
              membershipPlanId: plan.id,
              flow: 'payment_intent', // This fix is for payment intent flow (primarily mobile, but desktop can use it too)
            });

            try {
              // Get or create Stripe Product
              let stripeProductId: string;
              try {
                const existingProducts = await stripe().products.search({
                  query: `metadata['membershipPlanId']:'${membershipPlanId}' AND metadata['tenantId']:'${tenantId}'`,
                  limit: 1,
                });
                if (existingProducts.data.length > 0) {
                  stripeProductId = existingProducts.data[0].id;
                  console.log('[MEMBERSHIP-SUCCESS] Found existing Stripe Product:', stripeProductId);
                } else {
                  // Create new product
                  const product = await stripe().products.create({
                    name: plan.planName || `Membership Plan ${membershipPlanId}`,
                    description: `Membership subscription - ${plan.billingInterval || 'Monthly'}`,
                    metadata: {
                      membershipPlanId: String(membershipPlanId),
                      tenantId: tenantId,
                    },
                  });
                  stripeProductId = product.id;
                  console.log('[MEMBERSHIP-SUCCESS] Created new Stripe Product:', stripeProductId);
                }
              } catch (productError: any) {
                console.error('[MEMBERSHIP-SUCCESS] ❌ Error getting/creating Stripe Product:', productError.message);
                throw new Error(`Failed to get/create Stripe Product: ${productError.message}`);
              }

              // Determine billing interval
              const priceInterval = plan.billingInterval === 'YEARLY' ? 'year' :
                                   plan.billingInterval === 'QUARTERLY' ? 'month' : 'month';

              // Create new Stripe Price with correct mode
              const priceParams: any = {
                product: stripeProductId,
                unit_amount: Math.round((plan.price || 0) * 100), // Convert to cents
                currency: (plan.currency || 'USD').toLowerCase(),
                recurring: {
                  interval: priceInterval,
                  ...(plan.billingInterval === 'QUARTERLY' ? { interval_count: 3 } : {}),
                },
                metadata: {
                  membershipPlanId: String(membershipPlanId),
                  tenantId: tenantId,
                },
              };

              const newStripePrice = await stripe().prices.create(priceParams);
              const newPriceId = newStripePrice.id;
              console.log('[MEMBERSHIP-SUCCESS] ✅ Created new Stripe Price with correct mode:', {
                newPriceId,
                productId: stripeProductId,
                amount: plan.price,
                currency: plan.currency,
                interval: priceInterval,
              });

              // Update subscription params with new price ID
              subscriptionParams.items[0].price = newPriceId;
              finalStripePriceId = newPriceId; // Update for later use

              // Retry subscription creation with new price
              stripeSubscription = await stripe().subscriptions.create(subscriptionParams);
              console.log('[MEMBERSHIP-SUCCESS] ✅ Created subscription with new price after mode mismatch retry:', {
                subscriptionId: stripeSubscription.id,
                newPriceId,
                status: stripeSubscription.status,
                customerId: stripeCustomerId,
                note: 'Price mode mismatch resolved - subscription created successfully',
              });
              // CRITICAL: Ensure stripeSubscriptionId is set for database persistence
              // This will be set again below, but set it here to ensure it's available
              stripeSubscriptionId = stripeSubscription.id;
            } catch (retryError: any) {
              console.error('[MEMBERSHIP-SUCCESS] ❌ Failed to create new price and retry subscription:', {
                error: retryError.message,
                errorCode: retryError.code,
                errorType: retryError.type,
                oldPriceId: finalStripePriceId,
                membershipPlanId: plan.id,
                customerId: stripeCustomerId,
              });
              throw new Error(`Failed to create Stripe subscription after price mode mismatch: ${retryError.message}`);
            }
          }
          // If subscription creation fails because payment method isn't attached, retry with default_incomplete
          else if (createError.message?.includes('payment method') || createError.message?.includes('must be attached')) {
            console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Subscription creation failed with payment method, retrying with default_incomplete:', createError.message);
            // Remove default_payment_method and use default_incomplete instead
            delete subscriptionParams.default_payment_method;
            subscriptionParams.payment_behavior = 'default_incomplete';
            subscriptionParams.payment_settings = {
              save_default_payment_method: 'on_subscription',
            };
            stripeSubscription = await stripe().subscriptions.create(subscriptionParams);
            console.log('[MEMBERSHIP-SUCCESS] ✅ Created subscription with default_incomplete after retry');
          } else {
            // Re-throw if it's a different error
            throw createError;
          }
        }

        // Update current period dates from Stripe Subscription (more accurate than calculated dates)
        if (stripeSubscription.current_period_start) {
          currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
        }
        if (stripeSubscription.current_period_end) {
          currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
        }

        stripeSubscriptionId = stripeSubscription.id;
        console.log('[MEMBERSHIP-SUCCESS] ✅ Created Stripe Subscription:', {
          subscriptionId: stripeSubscriptionId,
          status: stripeSubscription.status,
          latestInvoiceStatus: (stripeSubscription.latest_invoice as any)?.status || 'N/A',
          currentPeriodStart,
          currentPeriodEnd,
          customerId: stripeCustomerId,
          priceId: finalStripePriceId,
          hasPaymentMethod: hasPaymentMethod,
          paymentBehavior: 'default_incomplete',
        });

        // CRITICAL: Complete incomplete subscription by paying its invoice with the confirmed payment intent
        // This ensures the subscription becomes 'active' immediately after creation
        if (stripeSubscription.status === 'incomplete' || stripeSubscription.status === 'incomplete_expired') {
          console.log('[MEMBERSHIP-SUCCESS] 🔄 Completing incomplete subscription by paying invoice...');

          try {
            // Retrieve subscription with expanded latest invoice to get invoice details
            const subscriptionWithInvoice = await stripe().subscriptions.retrieve(stripeSubscriptionId, {
              expand: ['latest_invoice', 'latest_invoice.payment_intent'],
            });

            const latestInvoice = subscriptionWithInvoice.latest_invoice;
            if (latestInvoice && typeof latestInvoice !== 'string') {
              const invoiceId = latestInvoice.id;
              const invoiceStatus = latestInvoice.status;

              console.log('[MEMBERSHIP-SUCCESS] Invoice details:', {
                invoiceId,
                invoiceStatus,
                amountDue: latestInvoice.amount_due,
                paymentIntentId: typeof latestInvoice.payment_intent === 'string'
                  ? latestInvoice.payment_intent
                  : latestInvoice.payment_intent?.id,
              });

              // If invoice is draft or open, try to pay it using the customer's payment method
              if (invoiceStatus === 'draft' || invoiceStatus === 'open') {
                // CRITICAL: Use the customer's existing default payment method to pay the invoice
                // The payment method from the payment intent may not be reusable, so we use the customer's default
                let paymentMethodId: string | null = null;

                try {
                  // Get customer's default payment method
                  const customer = await stripe().customers.retrieve(stripeCustomerId!, {
                    expand: ['invoice_settings.default_payment_method'],
                  });

                  if (customer && typeof customer !== 'string') {
                    // Try to get default payment method from invoice_settings
                    const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;
                    if (defaultPaymentMethod) {
                      paymentMethodId = typeof defaultPaymentMethod === 'string'
                        ? defaultPaymentMethod
                        : (defaultPaymentMethod as any)?.id;
                      console.log('[MEMBERSHIP-SUCCESS] Found customer default payment method:', paymentMethodId);
                    }

                    // If no default, get any payment method from customer
                    if (!paymentMethodId) {
                      const paymentMethods = await stripe().paymentMethods.list({
                        customer: stripeCustomerId!,
                        limit: 1,
                      });
                      if (paymentMethods.data.length > 0) {
                        paymentMethodId = paymentMethods.data[0].id;
                        console.log('[MEMBERSHIP-SUCCESS] Found customer payment method:', paymentMethodId);
                      }
                    }
                  }
                } catch (customerError: any) {
                  console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not retrieve customer payment method:', customerError.message);

                  // Fallback: Try to get payment method from the confirmed payment intent
                  // CRITICAL: If payment method exists but isn't attached, attach it to the customer
                  try {
                    const confirmedPaymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId, {
                      expand: ['payment_method'],
                    });

                    if (confirmedPaymentIntent.payment_method) {
                      const pmId = typeof confirmedPaymentIntent.payment_method === 'string'
                        ? confirmedPaymentIntent.payment_method
                        : (confirmedPaymentIntent.payment_method as any)?.id;

                      if (pmId) {
                        try {
                          const paymentMethod = await stripe().paymentMethods.retrieve(pmId);

                          // Check if payment method is already attached to this customer
                          if (paymentMethod.customer === stripeCustomerId) {
                            paymentMethodId = pmId;
                            console.log('[MEMBERSHIP-SUCCESS] Using payment method from payment intent (already attached):', paymentMethodId);
                          } else {
                            // CRITICAL: Payment method exists but isn't attached - attach it to the customer
                            console.log('[MEMBERSHIP-SUCCESS] Payment method from payment intent not attached to customer, attaching now...');
                            try {
                              // Attach the payment method to the customer
                              await stripe().paymentMethods.attach(pmId, {
                                customer: stripeCustomerId!,
                              });
                              console.log('[MEMBERSHIP-SUCCESS] ✅ Attached payment method to customer:', pmId);

                              // Set it as the default payment method for the customer
                              await stripe().customers.update(stripeCustomerId!, {
                                invoice_settings: {
                                  default_payment_method: pmId,
                                },
                              });
                              console.log('[MEMBERSHIP-SUCCESS] ✅ Set payment method as default for customer');

                              // Now use it to pay the invoice
                              paymentMethodId = pmId;
                              console.log('[MEMBERSHIP-SUCCESS] Using attached payment method to pay invoice:', paymentMethodId);
                            } catch (attachError: any) {
                              console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not attach payment method to customer:', attachError.message);
                              // If attachment fails, still try to use it (it might work for one-time payment)
                              if (attachError.code !== 'resource_already_exists') {
                                paymentMethodId = pmId;
                                console.log('[MEMBERSHIP-SUCCESS] Attempting to use payment method despite attachment failure:', paymentMethodId);
                              }
                            }
                          }
                        } catch (pmRetrieveError: any) {
                          console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not retrieve payment method from payment intent:', pmRetrieveError.message);
                        }
                      }
                    }
                  } catch (pmError: any) {
                    console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not retrieve payment method from payment intent:', pmError.message);
                  }
                }

                // Try to finalize invoice if it's in draft status
                if (invoiceStatus === 'draft') {
                  try {
                    const finalizedInvoice = await stripe().invoices.finalizeInvoice(invoiceId);
                    console.log('[MEMBERSHIP-SUCCESS] ✅ Finalized draft invoice:', {
                      invoiceId: finalizedInvoice.id,
                      status: finalizedInvoice.status,
                    });
                  } catch (finalizeError: any) {
                    console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not finalize invoice:', finalizeError.message);
                  }
                }

                // CRITICAL: Pay the invoice using a payment method attached to the customer
                // Since the payment method from the payment intent cannot be reused, we need to create a new one
                // However, we cannot create a new payment method without full card details (which we don't have)
                // The solution: Use the payment intent's charges to get payment method details and create a setup intent
                // OR: Use the payment intent's payment method by cloning it (if possible)
                // OR: Create subscription with payment method at creation time (best approach)
                //
                // ACTUAL SOLUTION: Since we can't attach the old payment method, we need to create the subscription
                // WITH a payment method attached at creation time. But we're creating it with default_incomplete.
                //
                // WORKAROUND: Use the payment intent's payment method by setting it on the subscription's default_payment_method
                // before paying the invoice, OR use invoices.pay() with the payment intent directly
                try {
                  console.log('[MEMBERSHIP-SUCCESS] Attempting to pay invoice using payment intent...');

                  // Get the payment method from the confirmed payment intent
                  const confirmedPaymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId, {
                    expand: ['payment_method'],
                  });

                  const pmIdFromPI = typeof confirmedPaymentIntent.payment_method === 'string'
                    ? confirmedPaymentIntent.payment_method
                    : (confirmedPaymentIntent.payment_method as any)?.id;

                  if (!pmIdFromPI) {
                    throw new Error('No payment method found in payment intent');
                  }

                  // CRITICAL: Try to attach the payment method to the customer first
                  // If it fails (because it was previously used), we'll try a different approach
                  let attachedPaymentMethodId: string | null = null;

                  try {
                    // Try to attach the payment method
                    await stripe().paymentMethods.attach(pmIdFromPI, {
                      customer: stripeCustomerId!,
                    });
                    console.log('[MEMBERSHIP-SUCCESS] ✅ Attached payment method to customer:', pmIdFromPI);

                    // Set it as default
                    await stripe().customers.update(stripeCustomerId!, {
                      invoice_settings: {
                        default_payment_method: pmIdFromPI,
                      },
                    });
                    console.log('[MEMBERSHIP-SUCCESS] ✅ Set payment method as default');

                    attachedPaymentMethodId = pmIdFromPI;
                  } catch (attachError: any) {
                    console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not attach payment method (expected if previously used):', attachError.message);

                    // If attachment fails, try to create a new payment method from the charge details
                    // This only works if we have access to the charge's payment method details
                    if (confirmedPaymentIntent.charges && confirmedPaymentIntent.charges.data.length > 0) {
                      const charge = confirmedPaymentIntent.charges.data[0];
                      const chargePaymentMethodId = typeof charge.payment_method === 'string'
                        ? charge.payment_method
                        : (charge.payment_method as any)?.id;

                      if (chargePaymentMethodId && chargePaymentMethodId !== pmIdFromPI) {
                        // Try to attach the charge's payment method instead
                        try {
                          await stripe().paymentMethods.attach(chargePaymentMethodId, {
                            customer: stripeCustomerId!,
                          });
                          await stripe().customers.update(stripeCustomerId!, {
                            invoice_settings: {
                              default_payment_method: chargePaymentMethodId,
                            },
                          });
                          attachedPaymentMethodId = chargePaymentMethodId;
                          console.log('[MEMBERSHIP-SUCCESS] ✅ Attached charge payment method to customer:', chargePaymentMethodId);
                        } catch (chargeAttachError: any) {
                          console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not attach charge payment method:', chargeAttachError.message);
                        }
                      }
                    }
                  }

                  // Now try to pay the invoice
                  if (attachedPaymentMethodId) {
                    // We have an attached payment method - use it to pay the invoice
                    const paidInvoice = await stripe().invoices.pay(invoiceId, {
                      payment_method: attachedPaymentMethodId,
                    });
                    console.log('[MEMBERSHIP-SUCCESS] ✅ Invoice paid successfully using attached payment method:', {
                      invoiceId: paidInvoice.id,
                      invoiceStatus: paidInvoice.status,
                      amountPaid: paidInvoice.amount_paid,
                      paymentMethodId: attachedPaymentMethodId,
                    });
                  } else if (paymentMethodId) {
                    // Fallback: Use customer's existing payment method
                    const paidInvoice = await stripe().invoices.pay(invoiceId, {
                      payment_method: paymentMethodId,
                    });
                    console.log('[MEMBERSHIP-SUCCESS] ✅ Invoice paid successfully using customer payment method:', {
                      invoiceId: paidInvoice.id,
                      invoiceStatus: paidInvoice.status,
                      amountPaid: paidInvoice.amount_paid,
                      paymentMethodId,
                    });
                  } else {
                    // Last resort: Try to pay with the payment intent's payment method directly
                    // This might work if Stripe allows it for one-time payments
                    console.log('[MEMBERSHIP-SUCCESS] Attempting to pay invoice with payment intent payment method (may fail)...');
                    try {
                      const paidInvoice = await stripe().invoices.pay(invoiceId, {
                        payment_method: pmIdFromPI,
                      });
                      console.log('[MEMBERSHIP-SUCCESS] ✅ Invoice paid successfully (direct payment method):', {
                        invoiceId: paidInvoice.id,
                        invoiceStatus: paidInvoice.status,
                        amountPaid: paidInvoice.amount_paid,
                      });
                    } catch (directPayError: any) {
                      throw new Error(`Cannot pay invoice: Payment method must be attached to customer. Error: ${directPayError.message}`);
                    }
                  }
                } catch (payError: any) {
                  console.error('[MEMBERSHIP-SUCCESS] ❌ Could not pay invoice:', {
                    error: payError.message,
                    type: payError.type,
                    code: payError.code,
                    invoiceId,
                    paymentIntentId,
                    customerId: stripeCustomerId,
                    message: 'Invoice payment failed - subscription will remain incomplete. The payment method from the payment intent cannot be reused. User may need to add a payment method manually in Stripe dashboard.',
                  });
                  // Don't throw - continue to check subscription status
                }

                // Wait a moment for Stripe to process the payment
                await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time

                // Retrieve updated subscription to get final status
                const updatedSubscription = await stripe().subscriptions.retrieve(stripeSubscriptionId);
                console.log('[MEMBERSHIP-SUCCESS] Updated subscription status:', {
                  subscriptionId: updatedSubscription.id,
                  status: updatedSubscription.status,
                  currentPeriodStart: updatedSubscription.current_period_start
                    ? new Date(updatedSubscription.current_period_start * 1000).toISOString()
                    : 'N/A',
                  currentPeriodEnd: updatedSubscription.current_period_end
                    ? new Date(updatedSubscription.current_period_end * 1000).toISOString()
                    : 'N/A',
                });

                // Update period dates if subscription is now active
                if (updatedSubscription.status === 'active') {
                  if (updatedSubscription.current_period_start) {
                    currentPeriodStart = new Date(updatedSubscription.current_period_start * 1000).toISOString();
                  }
                  if (updatedSubscription.current_period_end) {
                    currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000).toISOString();
                  }
                  console.log('[MEMBERSHIP-SUCCESS] ✅ Subscription is now ACTIVE');
                } else {
                  console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Subscription status is still:', updatedSubscription.status);
                  // CRITICAL: If still incomplete, log detailed error for debugging
                  if (updatedSubscription.status === 'incomplete' || updatedSubscription.status === 'incomplete_expired') {
                    const invoiceCheck = await stripe().invoices.retrieve(invoiceId);
                    console.error('[MEMBERSHIP-SUCCESS] ❌ Subscription still incomplete after payment attempt:', {
                      subscriptionId: updatedSubscription.id,
                      subscriptionStatus: updatedSubscription.status,
                      invoiceId: invoiceCheck.id,
                      invoiceStatus: invoiceCheck.status,
                      invoiceAmountDue: invoiceCheck.amount_due,
                      invoiceAmountPaid: invoiceCheck.amount_paid,
                      invoicePaymentIntent: typeof invoiceCheck.payment_intent === 'string'
                        ? invoiceCheck.payment_intent
                        : invoiceCheck.payment_intent?.id,
                      confirmedPaymentIntentId: paymentIntentId,
                    });
                  }
                }
              } else if (invoiceStatus === 'paid') {
                console.log('[MEMBERSHIP-SUCCESS] ✅ Invoice is already paid');
              } else {
                console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Invoice status is:', invoiceStatus, '- may need manual intervention');
              }
            } else {
              console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Could not retrieve invoice from subscription');
            }
          } catch (completeError: any) {
            console.error('[MEMBERSHIP-SUCCESS] ❌ Error completing subscription:', {
              error: completeError.message,
              type: completeError.type,
              code: completeError.code,
              stack: completeError.stack?.substring(0, 500),
            });
            // Continue - subscription will still be created in database, can be completed later
          }
        }
      } catch (subscriptionError: any) {
        console.error('[MEMBERSHIP-SUCCESS] ❌ Error creating Stripe Subscription:', {
          error: subscriptionError.message,
          type: subscriptionError.type,
          code: subscriptionError.code,
          statusCode: subscriptionError.statusCode,
          customerId: stripeCustomerId,
          priceId: finalStripePriceId,
          planId: plan.id,
          planName: plan.planName,
          stack: subscriptionError.stack?.substring(0, 500), // Limit stack trace length
        });
        // CRITICAL: Do not create database record if Stripe subscription creation failed
        // The subscription must be created in Stripe first before we can store it in the database
        // Return null to indicate failure - user will need to retry or add payment method manually
        throw new Error(`Failed to create Stripe subscription: ${subscriptionError.message}. Subscription cannot be created without a valid Stripe subscription ID.`);
      }
    } else {
      console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Skipping Stripe Subscription creation - missing requirements:', {
        hasCustomerId: !!stripeCustomerId,
        hasPriceId: !!finalStripePriceId,
        customerId: stripeCustomerId || 'MISSING',
        priceId: finalStripePriceId || 'MISSING',
        planId: plan.id,
        planName: plan.planName,
      });
    }

    // CRITICAL: Do not create database record if Stripe subscription was not created
    // The subscription must exist in Stripe before we can store it in the database
    if (!stripeSubscriptionId) {
      const functionEndTime = Date.now();
      const duration = functionEndTime - functionStartTime;
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #7: Cannot create database record: Stripe subscription ID is missing', {
        paymentIntentId,
        userId: finalUserId,
        membershipPlanId,
        stripeCustomerId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        note: 'This usually means Stripe subscription creation failed or was skipped',
      });
      throw new Error('Stripe subscription was not created successfully. Cannot create database record without Stripe subscription ID.');
    }
    console.log('[MEMBERSHIP-SUCCESS] Step 9 ✅: Stripe subscription ID available, proceeding to database creation', {
      stripeSubscriptionId,
    });

    // Determine subscription status based on Stripe subscription status
    // If subscription was completed and is now active, use ACTIVE
    // Otherwise, use TRIAL if trial days exist, or map Stripe status to database status
    let subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED' = 'ACTIVE';

    // Check if we have a Stripe subscription and its status
    if (stripeSubscriptionId) {
      try {
        const finalSubscription = await stripe().subscriptions.retrieve(stripeSubscriptionId);
        if (finalSubscription.status === 'active') {
          // If subscription is active and has trial, check if it's in trial period
          if (plan.trialDays && plan.trialDays > 0) {
            const now = Math.floor(Date.now() / 1000);
            const trialEnd = finalSubscription.trial_end;
            if (trialEnd && now < trialEnd) {
              subscriptionStatus = 'TRIAL';
            } else {
              subscriptionStatus = 'ACTIVE';
            }
          } else {
            subscriptionStatus = 'ACTIVE';
          }
        } else if (finalSubscription.status === 'trialing') {
          subscriptionStatus = 'TRIAL';
        } else if (finalSubscription.status === 'incomplete' || finalSubscription.status === 'incomplete_expired') {
          // CRITICAL: Map incomplete subscriptions to PAST_DUE (payment not completed)
          // This accurately reflects that the subscription exists but payment hasn't been completed
          subscriptionStatus = 'PAST_DUE';
          console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Subscription is incomplete - setting status to PAST_DUE:', {
            stripeSubscriptionId,
            stripeStatus: finalSubscription.status,
            databaseStatus: subscriptionStatus,
          });
        } else if (finalSubscription.status === 'past_due') {
          subscriptionStatus = 'PAST_DUE';
        } else if (finalSubscription.status === 'canceled' || finalSubscription.status === 'unpaid') {
          subscriptionStatus = 'CANCELLED';
        } else if (finalSubscription.status === 'paused') {
          subscriptionStatus = 'SUSPENDED';
        } else {
          // For any other status, default based on plan (will be updated by webhook)
          subscriptionStatus = plan.trialDays && plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';
          console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Unknown subscription status, using default:', {
            stripeStatus: finalSubscription.status,
            databaseStatus: subscriptionStatus,
          });
        }
      } catch (statusError: any) {
        console.warn('[MEMBERSHIP-SUCCESS] Could not retrieve final subscription status, using default:', statusError.message);
        subscriptionStatus = plan.trialDays && plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';
      }
    } else {
      // No Stripe subscription ID, use default based on plan
      subscriptionStatus = plan.trialDays && plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';
    }

    // Create subscription payload
    const subscriptionPayload = withTenantId({
      userProfileId: userProfile.id,
      membershipPlanId: plan.id!,
      subscriptionStatus,
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId,
      stripeCustomerId,
      stripePaymentIntentId: paymentIntentId, // CRITICAL: Store Payment Intent ID for tracking
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create subscription via backend API
    console.log('[MEMBERSHIP-SUCCESS] Step 10: Creating database record for subscription...', {
      stripeSubscriptionId,
      userProfileId: userProfile.id,
      membershipPlanId,
    });
    console.log('[MEMBERSHIP-SUCCESS] Step 10: Creating database record for subscription...', {
      stripeSubscriptionId,
      userProfileId: userProfile.id,
      membershipPlanId,
    });
    const baseUrl = getAppUrl();
    console.log('[MEMBERSHIP-SUCCESS] Creating subscription with payload (all fields):', {
      // Required fields
      tenantId: subscriptionPayload.tenantId,
      userProfileId: subscriptionPayload.userProfileId,
      membershipPlanId: subscriptionPayload.membershipPlanId,
      subscriptionStatus: subscriptionPayload.subscriptionStatus,
      currentPeriodStart: subscriptionPayload.currentPeriodStart,
      currentPeriodEnd: subscriptionPayload.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionPayload.cancelAtPeriodEnd,
      // Stripe fields
      stripeSubscriptionId: subscriptionPayload.stripeSubscriptionId || 'NULL (will be set if Stripe Subscription created)',
      stripeCustomerId: subscriptionPayload.stripeCustomerId || 'NULL',
      stripePaymentIntentId: subscriptionPayload.stripePaymentIntentId || 'NULL',
      // Optional fields
      trialStart: subscriptionPayload.trialStart || 'NULL',
      trialEnd: subscriptionPayload.trialEnd || 'NULL',
      createdAt: subscriptionPayload.createdAt,
      updatedAt: subscriptionPayload.updatedAt,
    });

    const createRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/membership-subscriptions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionPayload),
        cache: 'no-store',
      }
    );

    if (!createRes.ok) {
      const errorBody = await createRes.text();
      let errorData: any = null;
      try {
        errorData = JSON.parse(errorBody);
      } catch {
        // Not JSON, use as string
      }

      // CRITICAL: Handle "active subscription exists" error - look up existing subscription
      if (createRes.status === 400 && errorData?.message === 'error.activesubscriptionexists') {
        console.log('[MEMBERSHIP-SUCCESS] ⚠️ Subscription already exists (400 error) - looking up ACTIVE subscription for user:', {
          userProfileId: userProfile.id,
          membershipPlanId,
          paymentIntentId,
        });

        // CRITICAL: Look up ACTIVE/TRIAL subscription for this user (by userProfileId, not by stripeSubscriptionId)
        // The backend filter for stripeSubscriptionId doesn't work correctly, so we use userProfileId instead
        let existingSub: MembershipSubscriptionDTO | null = null;

        try {
          const tenantId = getTenantId();
          const params = new URLSearchParams({
            'userProfileId.equals': String(userProfile.id),
            'tenantId.equals': tenantId,
            'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only look for active subscriptions
            'sort': 'createdAt,desc', // Get most recent first
            'size': '1', // Only need one result
          });
          const lookupRes = await fetchWithJwtRetry(
            `${baseUrl}/api/proxy/membership-subscriptions?${params.toString()}`,
            { cache: 'no-store' }
          );

          if (lookupRes.ok) {
            const items: MembershipSubscriptionDTO[] = await lookupRes.json();
            // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
            const activeSubscriptions = items.filter(sub =>
              sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
            );
            if (activeSubscriptions.length > 0) {
              // Get the first (most recent) active subscription
              existingSub = activeSubscriptions[0];
              console.log('[MEMBERSHIP-SUCCESS] ✅ Found existing ACTIVE subscription for user:', {
                subscriptionId: existingSub.id,
                planId: existingSub.membershipPlanId,
                status: existingSub.subscriptionStatus,
                stripeSubscriptionId: existingSub.stripeSubscriptionId,
              });
            } else {
              console.log('[MEMBERSHIP-SUCCESS] ⚠️ No active subscription found for user (backend returned empty array)');
            }
          } else {
            console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Lookup failed:', lookupRes.status, lookupRes.statusText);
          }
        } catch (lookupError) {
          console.error('[MEMBERSHIP-SUCCESS] Error looking up existing subscription:', lookupError);
        }

        if (existingSub) {
          console.log('[MEMBERSHIP-SUCCESS] ✅ Found existing subscription:', {
            subscriptionId: existingSub.id,
            planId: existingSub.membershipPlanId,
            status: existingSub.subscriptionStatus,
            paymentIntentId,
            note: existingSub.membershipPlanId !== membershipPlanId ? 'Existing subscription is for different plan - will be handled by GET endpoint' : 'Existing subscription matches requested plan',
          });

          // Update the subscription with the payment intent ID if it's missing
          if (!existingSub.stripePaymentIntentId && paymentIntentId) {
            try {
              const updatePayload = withTenantId({
                id: existingSub.id!,
                stripePaymentIntentId: paymentIntentId,
              });

              await fetchWithJwtRetry(
                `${baseUrl}/api/proxy/membership-subscriptions/${existingSub.id}`,
                {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/merge-patch+json' },
                  body: JSON.stringify(updatePayload),
                  cache: 'no-store',
                }
              );

              console.log('[MEMBERSHIP-SUCCESS] ✅ Updated existing subscription with payment intent ID');
              return { subscription: { ...existingSub, stripePaymentIntentId: paymentIntentId } as MembershipSubscriptionDTO, plan, userProfile };
            } catch (updateError) {
              console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Failed to update payment intent ID (non-fatal):', updateError);
            }
          }

          // CRITICAL: Return the existing subscription even if it's for a different plan
          // The GET endpoint will handle cancelling it and creating a new one if needed
          return { subscription: existingSub, plan, userProfile };
        }
      }

      const functionEndTime = Date.now();
      const duration = functionEndTime - functionStartTime;
      console.error('[MEMBERSHIP-SUCCESS] ❌ RETURN NULL #6: Failed to create subscription:', {
        status: createRes.status,
        statusText: createRes.statusText,
        errorBody,
        errorData,
        paymentIntentId,
        userId: finalUserId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    const createdSubscription: MembershipSubscriptionDTO = await createRes.json();

    console.log('[MEMBERSHIP-SUCCESS] ✅ Subscription created successfully from Payment Intent:', {
      subscriptionId: createdSubscription.id,
      subscriptionStatus: createdSubscription.subscriptionStatus,
      paymentIntentId,
      userId: finalUserId,
      stripePaymentIntentId: createdSubscription.stripePaymentIntentId,
      stripeCustomerId: createdSubscription.stripeCustomerId,
      stripeSubscriptionId: createdSubscription.stripeSubscriptionId,
      currentPeriodStart: createdSubscription.currentPeriodStart,
      currentPeriodEnd: createdSubscription.currentPeriodEnd,
      membershipPlanId,
      timestamp: new Date().toISOString(),
    });

    const functionEndTime = Date.now();
    const duration = functionEndTime - functionStartTime;
    console.log('[MEMBERSHIP-SUCCESS] 🟢 SUCCESS: processMembershipSubscriptionFromPaymentIntent completed', {
      subscriptionId: createdSubscription.id,
      paymentIntentId,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return { subscription: createdSubscription, plan, userProfile };
  } catch (error) {
    const functionEndTime = Date.now();
    const duration = functionEndTime - functionStartTime;
    console.error('[MEMBERSHIP-SUCCESS] 🔴 ERROR: processMembershipSubscriptionFromPaymentIntent failed', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      paymentIntentId,
      userId,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * Fetch membership plan by ID
 */
async function fetchMembershipPlanById(planId: number): Promise<MembershipPlanDTO | null> {
  try {
    const url = `${getAppUrl()}/api/proxy/membership-plans/${planId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching membership plan:', error);
    return null;
  }
}

/**
 * Fetch user profile by ID
 */
async function fetchUserProfileById(userProfileId: number): Promise<UserProfileDTO | null> {
  try {
    const url = `${getAppUrl()}/api/proxy/user-profiles/${userProfileId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetch membership subscription details from Stripe session or payment intent
 */
export async function fetchMembershipSubscriptionDetailsServer(
  sessionId?: string,
  paymentIntentId?: string
): Promise<{
  plan: MembershipPlanDTO | null;
  sessionId: string | null;
  amount: number | null;
  currency: string | null;
} | null> {
  try {
    console.log('[MEMBERSHIP-SUCCESS] fetchMembershipSubscriptionDetailsServer called:', {
      sessionId,
      paymentIntentId,
      hasSessionId: !!sessionId,
      hasPaymentIntentId: !!paymentIntentId,
    });

    let resolvedSessionId: string | null = null;

    // Resolve session ID from payment intent if needed
    if (paymentIntentId && !sessionId) {
      resolvedSessionId = await getSessionIdFromPaymentIntent(paymentIntentId);
    } else if (sessionId) {
      resolvedSessionId = sessionId;
    }

    if (!resolvedSessionId) {
      console.error('[MEMBERSHIP-SUCCESS] No session ID available');
      return null;
    }

    // Retrieve the Stripe checkout session
    const session = await stripe().checkout.sessions.retrieve(resolvedSessionId, {
      expand: ['line_items', 'subscription'],
    });

    // Get membership plan ID from metadata
    const membershipPlanId = session.metadata?.membershipPlanId ||
                             (session.subscription as any)?.metadata?.membershipPlanId;

    if (!membershipPlanId) {
      console.error('[MEMBERSHIP-SUCCESS] No membershipPlanId in session metadata');
      return null;
    }

    // Fetch membership plan details from backend
    const baseUrl = getAppUrl();

    // CRITICAL: Log baseUrl in production to debug empty URL issues
    if (!baseUrl || baseUrl === '') {
      console.error('[MEMBERSHIP-SUCCESS] CRITICAL: getAppUrl() returned empty string. Check AMPLIFY_NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL environment variable.');
      console.error('[MEMBERSHIP-SUCCESS] Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        AMPLIFY_NEXT_PUBLIC_APP_URL: process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
      });
      return null;
    }

    const planUrl = `${baseUrl}/api/proxy/membership-plans/${membershipPlanId}`;
    console.log('[MEMBERSHIP-SUCCESS] Fetching plan from:', planUrl);

    const planRes = await fetchWithJwtRetry(
      planUrl,
      { cache: 'no-store' }
    );

    if (!planRes.ok) {
      const errorText = await planRes.text().catch(() => 'Unable to read error response');
      console.error('[MEMBERSHIP-SUCCESS] Failed to fetch membership plan:', {
        status: planRes.status,
        statusText: planRes.statusText,
        url: planUrl,
        error: errorText,
        membershipPlanId,
      });
      return null;
    }

    const plan: MembershipPlanDTO = await planRes.json();

    if (!plan || !plan.id) {
      console.error('[MEMBERSHIP-SUCCESS] Invalid plan data received:', {
        plan,
        membershipPlanId,
        url: planUrl,
      });
      return null;
    }

    console.log('[MEMBERSHIP-SUCCESS] Successfully fetched plan:', {
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      planCurrency: plan.currency,
    });

    // Get amount and currency from session
    // For subscriptions, amount_total might be 0 if it's a free trial or first payment deferred
    // Use plan price as fallback
    const amountTotal = session.amount_total || 0;
    const amountInDollars = amountTotal / 100; // Convert from cents
    const currency = session.currency?.toUpperCase() || 'USD';

    return {
      plan,
      sessionId: resolvedSessionId,
      amount: amountInDollars > 0 ? amountInDollars : plan.price || null, // Use plan price if session amount is 0
      currency: currency || plan.currency || 'USD',
    };
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching subscription details:', error);
    return null;
  }
}
