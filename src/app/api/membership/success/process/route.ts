import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import {
  findSubscriptionBySessionId,
  findSubscriptionByPaymentIntentId,
  processMembershipSubscriptionSessionServer,
  processMembershipSubscriptionFromPaymentIntent,
  fetchMembershipSubscriptionDetailsServer,
} from '@/app/membership/success/ApiServerActions';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipSubscriptionDTO } from '@/types';

export const dynamic = 'force-dynamic';

// Function to get session_id from payment intent
async function getSessionIdFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  try {
    const { stripe } = await import('@/lib/stripe');
    console.log('[MEMBERSHIP-PROCESS] Looking up session for payment intent:', paymentIntentId);

    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata?.session_id) {
      console.log('[MEMBERSHIP-PROCESS] Found session_id in metadata:', paymentIntent.metadata.session_id);
      return paymentIntent.metadata.session_id;
    }

    const sessions = await stripe().checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1
    });

    if (sessions.data.length > 0) {
      const sessionId = sessions.data[0].id;
      console.log('[MEMBERSHIP-PROCESS] Found session_id via lookup:', sessionId);
      return sessionId;
    }

    console.log('[MEMBERSHIP-PROCESS] No session found for payment intent:', paymentIntentId);
    return null;
  } catch (error) {
    console.error('[MEMBERSHIP-PROCESS] Error looking up session:', error);
    return null;
  }
}

/**
 * GET /api/membership/success/process
 * Look up existing subscription by session_id or payment_intent
 * CRITICAL: Desktop flow - creates subscription immediately if payment succeeded (webhook fallback)
 */
export async function GET(req: NextRequest) {
  // CRITICAL: Log immediately when GET endpoint is called (before any processing)
  console.log('[MEMBERSHIP-PROCESS GET] ============================================');
  console.log('[MEMBERSHIP-PROCESS GET] ENDPOINT CALLED AT:', new Date().toISOString());
  console.log('[MEMBERSHIP-PROCESS GET] Request URL:', req.url);
  console.log('[MEMBERSHIP-PROCESS GET] Request method:', req.method);
  console.log('[MEMBERSHIP-PROCESS GET] ============================================');

  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const pi = searchParams.get('pi');
    const skip_qr = searchParams.get('skip_qr') === 'true';
    const _poll = searchParams.get('_poll'); // Polling attempt number (for logging)

    // CRITICAL: Server-side mobile detection for CloudWatch logging
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

    // Enhanced mobile detection (same logic as client-side)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    // CRITICAL: Log environment variables for debugging production issues
    const appUrl = getAppUrl();
    console.log('[MEMBERSHIP-PROCESS GET] ============================================');
    console.log('[MEMBERSHIP-PROCESS GET] Received:', { session_id, pi, skip_qr, _poll, isMobile });
    console.log('[MEMBERSHIP-PROCESS GET] Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      appUrl: appUrl || 'EMPTY',
      AMPLIFY_NEXT_PUBLIC_APP_URL: process.env.AMPLIFY_NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
    });
    console.log('[MEMBERSHIP-PROCESS GET] ============================================');

    if (!session_id && !pi) {
      return NextResponse.json({ error: 'Missing session_id or pi (payment_intent)' }, { status: 400 });
    }

    // First check if subscription already exists
    let existingSubscription = null;
    if (session_id) {
      if (session_id.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS GET] session_id parameter is actually a payment intent ID:', session_id);
        existingSubscription = await findSubscriptionByPaymentIntentId(session_id);
      } else {
        existingSubscription = await findSubscriptionBySessionId(session_id);

        // CRITICAL: If not found by session_id, try to look up by userProfileId (backend filter for stripeSubscriptionId doesn't work correctly)
        // This handles the case where Stripe subscription was created but database record creation failed
        if (!existingSubscription) {
          try {
            const { stripe } = await import('@/lib/stripe');
            const session = await stripe().checkout.sessions.retrieve(session_id, {
              expand: ['subscription'],
            });

            // Get userProfileId from session metadata and look up ACTIVE subscription for the user
            const userId = session.metadata?.userId;
            if (userId) {
              const { fetchUserProfileServer } = await import('@/app/profile/ApiServerActions');
              const userProfile = await fetchUserProfileServer(userId);

              if (userProfile?.id) {
                const tenantId = getTenantId();
                // CRITICAL: Do NOT add tenantId.equals when calling proxy - proxy handler adds it automatically
                // According to nextjs_api_routes.mdc: "Do NOT add tenantId.equals in your client/server code when calling the proxy"
                const params = new URLSearchParams({
                  'userProfileId.equals': String(userProfile.id),
                  // tenantId.equals removed - proxy handler will add it automatically
                  'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only look for active subscriptions
                  'sort': 'createdAt,desc', // Get most recent first
                  'size': '1', // Only need one result
                });

                console.log('[MEMBERSHIP-PROCESS GET] Trying early lookup by userProfileId:', userProfile.id);
                const lookupUrl = `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`;
                console.log('[MEMBERSHIP-PROCESS GET] Early lookup URL:', lookupUrl);
                const lookupRes = await fetchWithJwtRetry(
                  lookupUrl,
                  { cache: 'no-store' }
                );

                console.log('[MEMBERSHIP-PROCESS GET] Early lookup response status:', lookupRes.status);
                if (lookupRes.ok) {
                  const items: MembershipSubscriptionDTO[] = await lookupRes.json();
                  console.log('[MEMBERSHIP-PROCESS GET] Early lookup returned items:', items.length);
                  // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
                  const activeSubscriptions = items.filter(sub =>
                    sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
                  );
                  console.log('[MEMBERSHIP-PROCESS GET] Active subscriptions after filtering:', activeSubscriptions.length);
                  if (activeSubscriptions.length > 0) {
                    existingSubscription = activeSubscriptions[0]; // Get the most recent active one
                    console.log('[MEMBERSHIP-PROCESS GET] ✅✅✅ Found subscription by userProfileId (early lookup):', {
                      id: existingSubscription.id,
                      status: existingSubscription.subscriptionStatus,
                      planId: existingSubscription.membershipPlanId,
                      planIdType: typeof existingSubscription.membershipPlanId,
                      stripeSubscriptionId: existingSubscription.stripeSubscriptionId,
                      userProfileId: existingSubscription.userProfileId,
                      tenantId: existingSubscription.tenantId,
                    });

                    // CRITICAL: Verify payment status from Stripe if we have a stripeSubscriptionId
                    if (existingSubscription.stripeSubscriptionId) {
                      try {
                        const { stripe } = await import('@/lib/stripe');
                        const stripeSub = await stripe().subscriptions.retrieve(existingSubscription.stripeSubscriptionId);
                        console.log('[MEMBERSHIP-PROCESS GET] ✅ Payment verification from Stripe:', {
                          stripeSubscriptionId: existingSubscription.stripeSubscriptionId,
                          stripeStatus: stripeSub.status,
                          stripeCurrentPeriodEnd: new Date(stripeSub.current_period_end * 1000).toISOString(),
                          databaseStatus: existingSubscription.subscriptionStatus,
                          paymentVerified: stripeSub.status === 'active' || stripeSub.status === 'trialing',
                        });
                      } catch (stripeError) {
                        console.warn('[MEMBERSHIP-PROCESS GET] ⚠️ Could not verify payment status from Stripe:', stripeError);
                      }
                    }
                  }
                }
              }
            }
          } catch (earlyLookupError) {
            console.warn('[MEMBERSHIP-PROCESS GET] Early lookup by userProfileId failed (non-fatal):', earlyLookupError);
          }
        }
      }
    } else if (pi) {
      existingSubscription = await findSubscriptionByPaymentIntentId(pi);
    }

    // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions IMMEDIATELY after lookup
    // Backend queries may return CANCELLED subscriptions with expanded relations (membershipPlan, userProfile)
    // We must reject these and create a new subscription instead
    if (existingSubscription) {
      const subscriptionStatus = existingSubscription.subscriptionStatus;
      console.log('[MEMBERSHIP-PROCESS GET] 🔍 Checking subscription status after lookup:', {
        subscriptionId: existingSubscription.id,
        status: subscriptionStatus,
        statusType: typeof subscriptionStatus,
        hasMembershipPlan: !!existingSubscription.membershipPlan,
        hasUserProfile: !!existingSubscription.userProfile,
        note: 'Backend may return CANCELLED subscriptions with expanded relations - must filter here',
      });

      if (subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'EXPIRED') {
        console.log('[MEMBERSHIP-PROCESS GET] ⚠️⚠️⚠️ CRITICAL: Found CANCELLED/EXPIRED subscription - REJECTING and will create new one:', {
          subscriptionId: existingSubscription.id,
          status: subscriptionStatus,
          paymentIntentId: pi,
          sessionId: session_id,
          membershipPlanId: existingSubscription.membershipPlanId,
          note: 'This CANCELLED subscription will be ignored - a new ACTIVE subscription will be created if payment succeeded',
        });
        // CRITICAL: Reset to null so we proceed to create a new subscription
        // DO NOT return this CANCELLED subscription to the client
        existingSubscription = null;
      } else if (subscriptionStatus !== 'ACTIVE' && subscriptionStatus !== 'TRIAL') {
        console.error('[MEMBERSHIP-PROCESS GET] ⚠️⚠️⚠️ CRITICAL: Subscription found but status is not ACTIVE/TRIAL:', {
          subscriptionId: existingSubscription.id,
          status: subscriptionStatus,
          note: 'Unexpected status - setting to null to create new subscription',
        });
        existingSubscription = null;
      } else {
        console.log('[MEMBERSHIP-PROCESS GET] ✅ Subscription passed status check:', {
          subscriptionId: existingSubscription.id,
          status: subscriptionStatus,
          note: 'Subscription is ACTIVE or TRIAL - will proceed to return it',
        });
      }
    } else {
      console.log('[MEMBERSHIP-PROCESS GET] ℹ️ No existing subscription found - will create new one if payment succeeded');
    }

    // CRITICAL: Only proceed with existing subscription if it's ACTIVE or TRIAL
    // If existingSubscription is null (was CANCELLED/EXPIRED or not found), we'll create a new one below
    if (existingSubscription) {
      // Double-check status before proceeding (defensive programming)
      if (existingSubscription.subscriptionStatus === 'ACTIVE' || existingSubscription.subscriptionStatus === 'TRIAL') {
        console.log('[MEMBERSHIP-PROCESS GET] ============================================');
        console.log('[MEMBERSHIP-PROCESS GET] ✅✅✅ SUBSCRIPTION FOUND:', {
          subscriptionId: existingSubscription.id,
          status: existingSubscription.subscriptionStatus,
          membershipPlanId: existingSubscription.membershipPlanId,
          membershipPlanIdType: typeof existingSubscription.membershipPlanId,
          stripeSubscriptionId: existingSubscription.stripeSubscriptionId,
          userProfileId: existingSubscription.userProfileId,
          tenantId: existingSubscription.tenantId,
          amountPaid: existingSubscription.amountPaid,
          currency: existingSubscription.currency,
        });
        console.log('[MEMBERSHIP-PROCESS GET] ============================================');

        // CRITICAL: First check if the existing subscription's plan ID matches the session's plan ID
        // If they DON'T match, the existing subscription itself is for a different plan and should be cancelled
        // This handles plan switches (e.g., switching from Plan 2 to Plan 1)
        try {
          // Get plan ID from session if available
          let sessionPlanId: number | null = null;
          if (session_id && !session_id.startsWith('pi_')) {
            try {
              const { stripe } = await import('@/lib/stripe');
              const session = await stripe().checkout.sessions.retrieve(session_id);
              if (session.metadata?.membershipPlanId) {
                sessionPlanId = parseInt(session.metadata.membershipPlanId, 10);
              }
            } catch (sessionError) {
              console.warn('[MEMBERSHIP-PROCESS GET] Could not retrieve session to get plan ID:', sessionError);
            }
          }

          // CRITICAL: Check if existing subscription's plan ID matches session's plan ID
          if (sessionPlanId) {
            const existingPlanId = typeof existingSubscription.membershipPlanId === 'number'
              ? existingSubscription.membershipPlanId
              : parseInt(String(existingSubscription.membershipPlanId), 10);

            console.log('[MEMBERSHIP-PROCESS GET] Checking plan match:', {
              existingSubscriptionId: existingSubscription.id,
              existingPlanId,
              sessionPlanId,
              planIdsMatch: existingPlanId === sessionPlanId,
            });

            // If plan IDs DON'T match, the existing subscription is for a different plan - cancel it
            if (existingPlanId !== sessionPlanId) {
              console.log('[MEMBERSHIP-PROCESS GET] ⚠️ Existing subscription is for DIFFERENT plan - will cancel and proceed to create new one:', {
                existingSubscriptionId: existingSubscription.id,
                existingPlanId,
                sessionPlanId,
                message: 'Plan switch detected - will cancel old subscription and create new one'
              });

              // Cancel the existing subscription (it's for the wrong plan)
              try {
                const cancelPayload = withTenantId({
                  id: existingSubscription.id!,
                  cancelAtPeriodEnd: true,
                  cancellationReason: `Switched to plan ${sessionPlanId}`,
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
                  '[MEMBERSHIP-PROCESS GET] cancel-existing-wrong-plan-subscription'
                );

                console.log('[MEMBERSHIP-PROCESS GET] ✅ Cancelled existing subscription (wrong plan) in database:', existingSubscription.id);

                // Also cancel the Stripe subscription if it exists
                if (existingSubscription.stripeSubscriptionId) {
                  try {
                    const { stripe } = await import('@/lib/stripe');
                    const stripeSub = await stripe().subscriptions.retrieve(existingSubscription.stripeSubscriptionId);
                    if (stripeSub.status !== 'canceled' && stripeSub.status !== 'incomplete_expired') {
                      await stripe().subscriptions.update(existingSubscription.stripeSubscriptionId, {
                        cancel_at_period_end: true,
                        metadata: {
                          ...stripeSub.metadata,
                          cancellation_reason: `Switched to plan ${sessionPlanId}`,
                          cancelled_at: new Date().toISOString(),
                        },
                      });
                      console.log('[MEMBERSHIP-PROCESS GET] ✅ Cancelled Stripe subscription (wrong plan):', existingSubscription.stripeSubscriptionId);
                    } else {
                      console.log('[MEMBERSHIP-PROCESS GET] ⚠️ Stripe subscription already cancelled/incomplete_expired:', existingSubscription.stripeSubscriptionId);
                    }
                  } catch (stripeError) {
                    console.error('[MEMBERSHIP-PROCESS GET] ⚠️ Failed to cancel Stripe subscription (non-fatal):', stripeError);
                  }
                }

                // Reset to null so we proceed to create/find the subscription for the NEW plan
                existingSubscription = null;
              } catch (cancelError) {
                console.error('[MEMBERSHIP-PROCESS GET] ⚠️ Failed to cancel existing subscription (non-fatal):', cancelError);
                // Reset to null anyway so we proceed to create/find the subscription for the NEW plan
                existingSubscription = null;
              }
            } else {
              // Plan IDs match - this is the correct subscription
              console.log('[MEMBERSHIP-PROCESS GET] ✅ Existing subscription matches plan - will check for other subscriptions and return');

              // PERFORMANCE: Skip checking for other subscriptions if the current one matches the plan
              // The existing subscription already matches the session plan, so no need to cancel others
              // This avoids unnecessary queries and iterations
              console.log('[MEMBERSHIP-PROCESS GET] ✅ Existing subscription matches plan - no need to check for other subscriptions');
            }
          }
        } catch (error) {
          console.error('[MEMBERSHIP-PROCESS GET] Error checking for other plan subscriptions:', error);
          // Continue - subscription is still valid
        }

        // CRITICAL: Check if existingSubscription is still valid after cancellation logic
        if (!existingSubscription) {
          console.log('[MEMBERSHIP-PROCESS GET] ⚠️ existingSubscription became null after cancellation logic - will create new subscription');
          // Continue to creation logic below - skip the rest of this block
        } else {
          // Fetch plan details
          console.log('[MEMBERSHIP-PROCESS GET] Fetching subscription details for:', {
            session_id,
            pi,
            subscriptionId: existingSubscription.id,
            membershipPlanId: existingSubscription.membershipPlanId,
          });

          let details = await fetchMembershipSubscriptionDetailsServer(
            session_id || undefined,
            pi || undefined
          );

          console.log('[MEMBERSHIP-PROCESS GET] Subscription details result:', {
            hasDetails: !!details,
            hasPlan: !!details?.plan,
            planId: details?.plan?.id,
            planName: details?.plan?.name,
            amount: details?.amount,
            currency: details?.currency,
            sessionId: details?.sessionId,
          });

          // CRITICAL: Fallback - if fetchMembershipSubscriptionDetailsServer returns null but we have a subscription with membershipPlanId,
          // fetch the plan directly from the backend using the subscription's membershipPlanId
          if (!details?.plan && existingSubscription.membershipPlanId) {
            console.log('[MEMBERSHIP-PROCESS GET] ⚠️ Plan details fetch returned null, attempting fallback fetch using subscription.membershipPlanId:', existingSubscription.membershipPlanId);

            try {
              const planId = typeof existingSubscription.membershipPlanId === 'number'
                ? existingSubscription.membershipPlanId
                : parseInt(String(existingSubscription.membershipPlanId), 10);

              if (!isNaN(planId) && planId > 0) {
                const planUrl = `${getAppUrl()}/api/proxy/membership-plans/${planId}`;
                console.log('[MEMBERSHIP-PROCESS GET] Fallback: Fetching plan directly from:', planUrl);

                const planRes = await fetchWithJwtRetry(planUrl, { cache: 'no-store' });

                if (planRes.ok) {
                  const plan = await planRes.json();
                  console.log('[MEMBERSHIP-PROCESS GET] ✅ Fallback: Successfully fetched plan:', {
                    planId: plan.id,
                    planName: plan.name,
                    planPrice: plan.price,
                  });

                  // Use the fetched plan and subscription data to build details
                  details = {
                    plan,
                    sessionId: session_id || null,
                    amount: existingSubscription.amountPaid || plan.price || null,
                    currency: plan.currency || 'USD',
                  };
                } else {
                  const errorText = await planRes.text().catch(() => 'Unable to read error response');
                  console.error('[MEMBERSHIP-PROCESS GET] ❌ Fallback: Failed to fetch plan:', {
                    status: planRes.status,
                    error: errorText,
                    planId,
                    url: planUrl,
                  });
                }
              } else {
                console.error('[MEMBERSHIP-PROCESS GET] ❌ Fallback: Invalid membershipPlanId:', existingSubscription.membershipPlanId);
              }
            } catch (fallbackError) {
              console.error('[MEMBERSHIP-PROCESS GET] ❌ Fallback: Error fetching plan:', fallbackError);
            }
          }

          // CRITICAL: Final safety check - NEVER return CANCELLED/EXPIRED subscriptions
          // This prevents returning CANCELLED subscriptions even if they somehow passed earlier checks
          if (existingSubscription && (existingSubscription.subscriptionStatus === 'CANCELLED' || existingSubscription.subscriptionStatus === 'EXPIRED')) {
            console.error('[MEMBERSHIP-PROCESS GET] ⚠️⚠️⚠️ CRITICAL: Attempted to return CANCELLED/EXPIRED subscription - REJECTING:', {
              subscriptionId: existingSubscription.id,
              status: existingSubscription.subscriptionStatus,
              note: 'This should never happen - subscription was filtered earlier. Setting to null and will create new one.',
            });
            // Set to null so we proceed to create a new subscription
            existingSubscription = null;
          }

          // Only build and return response if we have a valid ACTIVE/TRIAL subscription
          if (!existingSubscription) {
            console.log('[MEMBERSHIP-PROCESS GET] No valid subscription to return - will proceed to create new one below');
            // Don't return here - let the code below handle creation of new subscription
          } else {
            // CRITICAL: Final check before returning - ensure subscription is ACTIVE or TRIAL
            // This is a safety net in case the subscription status changed or was not properly filtered
            const finalStatus = existingSubscription.subscriptionStatus;
            console.log('[MEMBERSHIP-PROCESS GET] 🔍 Final status check before returning:', {
              subscriptionId: existingSubscription.id,
              status: finalStatus,
              statusType: typeof finalStatus,
              isValid: finalStatus === 'ACTIVE' || finalStatus === 'TRIAL',
            });

            if (finalStatus !== 'ACTIVE' && finalStatus !== 'TRIAL') {
              console.error('[MEMBERSHIP-PROCESS GET] ⚠️⚠️⚠️ CRITICAL: Attempted to return subscription with invalid status - REJECTING:', {
                subscriptionId: existingSubscription.id,
                status: finalStatus,
                note: 'This should never happen - subscription was filtered earlier. Setting to null and will create new one.',
              });
              existingSubscription = null;
              console.log('[MEMBERSHIP-PROCESS GET] No valid subscription to return - will proceed to create new one below');
              // Don't return here - let the code below handle creation of new subscription
            } else {
              const responseData = {
                subscription: existingSubscription,
                plan: details?.plan || null,
                amount: details?.amount || null,
                currency: details?.currency || null,
              };

              console.log('[MEMBERSHIP-PROCESS GET] ============================================');
              console.log('[MEMBERSHIP-PROCESS GET] FINAL RESPONSE DATA:', JSON.stringify(responseData, null, 2));
              console.log('[MEMBERSHIP-PROCESS GET] Response summary:', {
                hasSubscription: !!responseData.subscription,
                subscriptionId: responseData.subscription?.id,
                subscriptionStatus: responseData.subscription?.subscriptionStatus,
                hasPlan: !!responseData.plan,
                planId: responseData.plan?.id,
                planName: responseData.plan?.planName,
                amount: responseData.amount,
                currency: responseData.currency,
              });
              console.log('[MEMBERSHIP-PROCESS GET] ============================================');

              return NextResponse.json(responseData);
            }
          }
        }
      }
    }

    // CRITICAL: Desktop flow - create subscription immediately if payment succeeded (webhook fallback)
    // This is separate from mobile workflow (which uses POST endpoint via /membership/qr page)
    // Desktop flow persists subscription from frontend when webhook hasn't processed yet
    if (!isMobile) {
      // Handle Checkout Session (cs_...)
      if (session_id && !session_id.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No subscription found - attempting to create from Checkout Session:', session_id);
        try {
          const { stripe } = await import('@/lib/stripe');
          const { processMembershipSubscriptionSessionServer } = await import('@/app/membership/success/ApiServerActions');

          // Retrieve Checkout Session from Stripe to validate payment succeeded
          const session = await stripe().checkout.sessions.retrieve(session_id, {
            expand: ['subscription', 'customer'],
          });

          // Only create subscription if payment succeeded
          if (session.payment_status !== 'paid') {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Checkout Session not paid:', session.payment_status);
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: `Payment not completed yet. Status: ${session.payment_status}`,
            }, { status: 200 });
          }

          // Validate metadata matches environment variables
          const metadata = session.metadata || {};
          const metadataTenantId = metadata.tenantId || metadata.tenant_id;
          const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;
          const { getTenantId, getPaymentMethodDomainId } = await import('@/lib/env');
          const expectedTenantId = getTenantId();
          const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

          if (metadataTenantId && metadataTenantId !== expectedTenantId) {
            console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️⚠️⚠️ TENANT ID MISMATCH:', {
              metadataTenantId,
              expectedTenantId,
              sessionId: session_id
            });
            return NextResponse.json({
              subscription: null,
              plan: null,
              error: 'Tenant ID mismatch',
              message: `Checkout Session tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}).`
            }, { status: 403 });
          }

          if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
            console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH:', {
              metadataPaymentMethodDomainId,
              expectedPaymentMethodDomainId,
              sessionId: session_id
            });
            return NextResponse.json({
              subscription: null,
              plan: null,
              error: 'Payment Method Domain ID mismatch',
              message: `Checkout Session Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}).`
            }, { status: 403 });
          }

          // Create subscription from session (same function used by POST endpoint)
          const result = await processMembershipSubscriptionSessionServer(session_id);

          if (result && result.subscription) {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Successfully created subscription:', result.subscription.id);

            // Fetch plan details
            const details = await fetchMembershipSubscriptionDetailsServer(
              session_id || undefined,
              pi || undefined
            );

            return NextResponse.json({
              subscription: result.subscription,
              plan: result.plan || details?.plan || null,
              amount: details?.amount || result.plan?.price || null,
              currency: details?.currency || result.plan?.currency || 'USD',
            });
          } else {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Failed to create subscription from session - attempting final lookup');

            // CRITICAL: Try multiple lookup methods to find the subscription
            // 1. First try by session ID
            let finalLookup = await findSubscriptionBySessionId(session_id);
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Lookup by session_id result:', finalLookup ? { id: finalLookup.id, status: finalLookup.subscriptionStatus } : 'not found');

            // 2. If not found, try by userProfileId (backend filter for stripeSubscriptionId doesn't work correctly)
            // Look up ACTIVE subscription for the user instead
            if (!finalLookup) {
              try {
                // Get userProfileId from session metadata
                const userId = session.metadata?.userId;
                if (userId) {
                  // Get user profile first to get userProfileId
                  const { fetchUserProfileServer } = await import('@/app/profile/ApiServerActions');
                  const userProfile = await fetchUserProfileServer(userId);

                  if (userProfile?.id) {
                    const tenantId = getTenantId();
                    // CRITICAL: Do NOT add tenantId.equals when calling proxy - proxy handler adds it automatically
                    // According to nextjs_api_routes.mdc: "Do NOT add tenantId.equals in your client/server code when calling the proxy"
                    const params = new URLSearchParams({
                      'userProfileId.equals': String(userProfile.id),
                      // tenantId.equals removed - proxy handler will add it automatically
                      'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only look for active subscriptions
                      'sort': 'createdAt,desc', // Get most recent first
                      'size': '1', // Only need one result
                    });

                    console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Trying lookup by userProfileId:', userProfile.id);
                    const lookupRes = await fetchWithJwtRetry(
                      `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
                      { cache: 'no-store' }
                    );

                    if (lookupRes.ok) {
                      const items: MembershipSubscriptionDTO[] = await lookupRes.json();
                      // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
                      const activeSubscriptions = items.filter(sub =>
                        sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
                      );
                      if (activeSubscriptions.length > 0) {
                        finalLookup = activeSubscriptions[0]; // Get the most recent active one
                        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing ACTIVE subscription for user:', {
                          id: finalLookup.id,
                          status: finalLookup.subscriptionStatus,
                          planId: finalLookup.membershipPlanId,
                        });
                      } else {
                        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No active subscription found for user');
                      }
                    }
                  }
                } else {
                  console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No userId in session metadata - cannot lookup by userProfileId');
                }
              } catch (userLookupError) {
                console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Error looking up subscription by userProfileId:', userLookupError);
              }
            }

            if (finalLookup) {
              // CRITICAL: Only return ACTIVE or TRIAL subscriptions
              // Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
              if (finalLookup.subscriptionStatus === 'ACTIVE' || finalLookup.subscriptionStatus === 'TRIAL') {
                console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing ACTIVE subscription on final lookup:', {
                  id: finalLookup.id,
                  status: finalLookup.subscriptionStatus,
                  planId: finalLookup.membershipPlanId,
                  stripeSubscriptionId: finalLookup.stripeSubscriptionId,
                });

                // CRITICAL: Final safety check - NEVER return CANCELLED/EXPIRED subscriptions
                if (finalLookup.subscriptionStatus === 'CANCELLED' || finalLookup.subscriptionStatus === 'EXPIRED') {
                  console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️⚠️⚠️ CRITICAL: finalLookup is CANCELLED/EXPIRED - REJECTING:', {
                    subscriptionId: finalLookup.id,
                    status: finalLookup.subscriptionStatus,
                    note: 'This should never happen - filter should have caught this. Will proceed to create new one.',
                  });
                  // Don't return - let code below handle creation
                } else {
                  const details = await fetchMembershipSubscriptionDetailsServer(
                    session_id || undefined,
                    pi || undefined
                  );

                  return NextResponse.json({
                    subscription: finalLookup,
                    plan: details?.plan || null,
                    amount: details?.amount || null,
                    currency: details?.currency || 'USD',
                  });
                }
              } else {
                console.warn('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Found subscription but status is not ACTIVE/TRIAL:', {
                  id: finalLookup.id,
                  status: finalLookup.subscriptionStatus,
                  note: 'Will continue to create new subscription or return error'
                });
                // Don't return CANCELLED/EXPIRED subscription - continue to create new one or return error
              }
            }

            // If still not found, return 400 error with "error.activesubscriptionexists" so client can detect it and stop polling
            // This happens when subscription creation fails because an active subscription already exists
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }
        } catch (createErr: any) {
          console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Error creating subscription:', createErr);

          // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
          if (createErr?.message?.includes('activesubscriptionexists') || createErr?.message?.includes('active subscription')) {
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }

          // Return null subscription but don't fail - allow polling to continue for other errors
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Subscription not found yet. Webhook may still be processing.',
          });
        }
      }

      // Handle Payment Intent (pi_...) - Desktop Stripe Elements flow
      if (pi && pi.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No active subscription found - attempting to create from Payment Intent:', pi);
        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Existing subscription was:', existingSubscription ? `${existingSubscription.id} (${existingSubscription.subscriptionStatus})` : 'null');
        try {
          // CRITICAL: This route is public (for polling), so we can't use auth()
          // Get userId from Payment Intent metadata (customerEmail) by looking up user profile
          // The processMembershipSubscriptionFromPaymentIntent function will handle this internally
          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Public route - will extract userId from Payment Intent metadata (customerEmail)');

          // First, verify Payment Intent status and metadata before attempting creation
          const { stripe } = await import('@/lib/stripe');
          const paymentIntent = await stripe().paymentIntents.retrieve(pi, {
            expand: ['payment_method'],
          });

          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Payment Intent status:', paymentIntent.status);
          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Payment Intent metadata:', paymentIntent.metadata);

          // Check if payment succeeded
          if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Payment Intent not in succeeded state:', paymentIntent.status);
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: `Payment not completed yet. Status: ${paymentIntent.status}`,
              error: `Payment Intent status: ${paymentIntent.status}`,
            });
          }

          // Check for required metadata
          if (!paymentIntent.metadata?.membershipPlanId) {
            console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ❌ Missing membershipPlanId in Payment Intent metadata');
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'Missing required payment information. Please contact support.',
              error: 'Missing membershipPlanId in Payment Intent metadata',
            });
          }

          // Pass undefined userId - function will extract from Payment Intent metadata (customerEmail)
          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Calling processMembershipSubscriptionFromPaymentIntent...', {
            paymentIntentId: pi,
            timestamp: new Date().toISOString(),
          });

          const result = await processMembershipSubscriptionFromPaymentIntent(pi, undefined);

          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] processMembershipSubscriptionFromPaymentIntent returned:', {
            hasResult: !!result,
            hasSubscription: !!(result?.subscription),
            hasPlan: !!(result?.plan),
            hasUserProfile: !!(result?.userProfile),
            subscriptionId: result?.subscription?.id,
            subscriptionStatus: result?.subscription?.subscriptionStatus,
            timestamp: new Date().toISOString(),
          });

          if (result && result.subscription) {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Successfully created/retrieved subscription from Payment Intent:', {
              subscriptionId: result.subscription.id,
              status: result.subscription.subscriptionStatus,
              paymentIntentId: pi,
            });

            return NextResponse.json({
              subscription: result.subscription,
              plan: result.plan || null,
              amount: result.plan?.price || null,
              currency: result.plan?.currency || 'USD',
            });
          } else {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Failed to create subscription from Payment Intent - result:', result);
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Payment Intent details:', {
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              metadata: paymentIntent.metadata,
              customer: paymentIntent.customer,
            });

            // CRITICAL: If subscription creation failed with "already exists" error,
            // the function should have returned the existing subscription, but if it didn't,
            // try one more lookup by payment intent ID (which may have been updated)
            const retryLookup = await findSubscriptionByPaymentIntentId(pi);
            if (retryLookup && (retryLookup.subscriptionStatus === 'ACTIVE' || retryLookup.subscriptionStatus === 'TRIAL')) {
              console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing subscription on retry lookup:', retryLookup.id);

              const details = await fetchMembershipSubscriptionDetailsServer(
                undefined,
                pi
              );

              return NextResponse.json({
                subscription: retryLookup,
                plan: details?.plan || null,
                amount: details?.amount || null,
                currency: details?.currency || 'USD',
              });
            }

            // CRITICAL: Before returning error, try one more lookup by payment intent ID
            // This handles the case where subscription exists but wasn't found in processMembershipSubscriptionFromPaymentIntent
            const finalLookup = await findSubscriptionByPaymentIntentId(pi);
            if (finalLookup && (finalLookup.subscriptionStatus === 'ACTIVE' || finalLookup.subscriptionStatus === 'TRIAL')) {
              console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing subscription on final lookup:', finalLookup.id);

              const details = await fetchMembershipSubscriptionDetailsServer(
                undefined,
                pi
              );

              return NextResponse.json({
                subscription: finalLookup,
                plan: details?.plan || null,
                amount: details?.amount || null,
                currency: details?.currency || 'USD',
              });
            }

            // If still not found, return 400 error with "error.activesubscriptionexists" so client can detect it and stop polling
            // This happens when subscription creation fails because an active subscription already exists
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
              paymentIntentStatus: paymentIntent.status,
              hasMetadata: !!paymentIntent.metadata,
              membershipPlanId: paymentIntent.metadata?.membershipPlanId || 'missing',
            }, { status: 400 });
          }
        } catch (createErr: any) {
          console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ❌ Error creating subscription from Payment Intent:', {
            error: createErr,
            message: createErr?.message,
            stack: createErr?.stack,
            paymentIntentId: pi,
            errorName: createErr?.name,
            errorCode: createErr?.code,
            errorType: createErr?.type,
            fullError: JSON.stringify(createErr, Object.getOwnPropertyNames(createErr)),
          });

          // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
          if (createErr?.message?.includes('activesubscriptionexists') || createErr?.message?.includes('active subscription')) {
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }

          // Return detailed error for debugging (but don't fail - allow polling to continue for other errors)
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Subscription not found yet. Webhook may still be processing.',
            error: createErr?.message || 'Unknown error during subscription creation',
            errorType: createErr?.name || 'Error',
            errorCode: createErr?.code,
            errorStack: createErr?.stack?.substring(0, 500), // First 500 chars of stack
          });
        }
      }
    }

    // Subscription not found yet (webhook may still be processing)
    // Desktop will poll, mobile will use POST endpoint
    return NextResponse.json({
      subscription: null,
      plan: null,
      message: 'Subscription not found yet. Webhook may still be processing.',
    });
  } catch (error) {
    console.error('[MEMBERSHIP-PROCESS GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/membership/success/process
 * Create subscription from Stripe session if webhook failed
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, pi, skip_qr } = body;

    console.log('[MEMBERSHIP-PROCESS POST] Received:', { session_id, pi, skip_qr });

    if (!session_id && !pi) {
      return NextResponse.json({ error: 'Missing session_id or pi (payment_intent)' }, { status: 400 });
    }

    // First check if subscription already exists
    let existingSubscription = null;
    let resolvedSessionId: string | null = null;

    if (session_id) {
      if (session_id.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS POST] session_id parameter is actually a payment intent ID:', session_id);
        existingSubscription = await findSubscriptionByPaymentIntentId(session_id);
        resolvedSessionId = await getSessionIdFromPaymentIntent(session_id);
      } else {
        existingSubscription = await findSubscriptionBySessionId(session_id);
        resolvedSessionId = session_id;
      }
    } else if (pi) {
      existingSubscription = await findSubscriptionByPaymentIntentId(pi);
      resolvedSessionId = await getSessionIdFromPaymentIntent(pi);
    }

    if (existingSubscription) {
      // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions IMMEDIATELY after lookup
      // Backend queries may return CANCELLED subscriptions with expanded relations (membershipPlan, userProfile)
      // We must reject these and create a new subscription instead
      const subscriptionStatus = existingSubscription.subscriptionStatus;
      if (subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'EXPIRED') {
        console.log('[MEMBERSHIP-PROCESS POST] ⚠️⚠️⚠️ CRITICAL: Found CANCELLED/EXPIRED subscription - REJECTING and will create new one:', {
          subscriptionId: existingSubscription.id,
          status: subscriptionStatus,
          paymentIntentId: pi,
          sessionId: session_id,
          membershipPlanId: existingSubscription.membershipPlanId,
          note: 'This CANCELLED subscription will be ignored - a new ACTIVE subscription will be created if payment succeeded',
        });
        // CRITICAL: Reset to null so we proceed to create a new subscription
        existingSubscription = null;
      } else if (subscriptionStatus !== 'ACTIVE' && subscriptionStatus !== 'TRIAL') {
        console.error('[MEMBERSHIP-PROCESS POST] ⚠️⚠️⚠️ CRITICAL: Subscription found but status is not ACTIVE/TRIAL:', {
          subscriptionId: existingSubscription.id,
          status: subscriptionStatus,
          note: 'Unexpected status - setting to null to create new subscription',
        });
        existingSubscription = null;
      }

      // Only proceed if subscription is ACTIVE or TRIAL
      if (!existingSubscription) {
        // Subscription was filtered out - will create new one below
      } else {
        console.log('[MEMBERSHIP-PROCESS POST] ✅ Valid subscription found (ACTIVE/TRIAL):', {
          subscriptionId: existingSubscription.id,
          status: existingSubscription.subscriptionStatus,
          membershipPlanId: existingSubscription.membershipPlanId,
        });

        const details = await fetchMembershipSubscriptionDetailsServer(
          resolvedSessionId || undefined,
          pi || undefined
        );

        // CRITICAL: Final safety check - NEVER return CANCELLED/EXPIRED subscriptions
        if (existingSubscription.subscriptionStatus === 'CANCELLED' || existingSubscription.subscriptionStatus === 'EXPIRED') {
          console.error('[MEMBERSHIP-PROCESS POST] ⚠️⚠️⚠️ CRITICAL: Attempted to return CANCELLED/EXPIRED subscription - REJECTING:', {
            subscriptionId: existingSubscription.id,
            status: existingSubscription.subscriptionStatus,
            note: 'This should never happen - subscription was filtered earlier. Setting to null and will create new one.',
          });
          existingSubscription = null;
        } else {
          // CRITICAL: Ensure plan is included in response for mobile flow
          let planDetails = details?.plan;
          if (!planDetails && existingSubscription.membershipPlanId) {
            // Fallback: Fetch plan directly if not included in details
            try {
              const { fetchMembershipPlanById } = await import('@/app/membership/success/ApiServerActions');
              planDetails = await fetchMembershipPlanById(existingSubscription.membershipPlanId);
              console.log('[MEMBERSHIP-PROCESS POST] Fetched plan details as fallback for existing subscription:', {
                planId: planDetails?.id,
                planName: planDetails?.planName,
              });
            } catch (planError) {
              console.error('[MEMBERSHIP-PROCESS POST] ⚠️ Failed to fetch plan details for existing subscription (non-fatal):', planError);
            }
          }

          return NextResponse.json({
            subscription: existingSubscription,
            plan: planDetails || details?.plan || null,
            amount: details?.amount || planDetails?.price || null,
            currency: details?.currency || planDetails?.currency || 'USD',
          });
        }
      }
    }

    // No existing subscription - try to create from Stripe session or Payment Intent
    if (!resolvedSessionId && pi) {
      // For Payment Intent flow, use processMembershipSubscriptionFromPaymentIntent
      console.log('[MEMBERSHIP-PROCESS POST] No session ID resolved, attempting to create from Payment Intent:', pi);
      try {
        // First verify Payment Intent status and metadata
        const { stripe } = await import('@/lib/stripe');
        const paymentIntent = await stripe().paymentIntents.retrieve(pi, {
          expand: ['payment_method'],
        });

        console.log('[MEMBERSHIP-PROCESS POST] Payment Intent status:', paymentIntent.status);
        console.log('[MEMBERSHIP-PROCESS POST] Payment Intent metadata:', paymentIntent.metadata);

        // Check if payment succeeded
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
          console.log('[MEMBERSHIP-PROCESS POST] ⚠️ Payment Intent not in succeeded state:', paymentIntent.status);
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: `Payment not completed yet. Status: ${paymentIntent.status}`,
            error: `Payment Intent status: ${paymentIntent.status}`,
          });
        }

        // Check for required metadata
        if (!paymentIntent.metadata?.membershipPlanId) {
          console.error('[MEMBERSHIP-PROCESS POST] ❌ Missing membershipPlanId in Payment Intent metadata');
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Missing required payment information. Please contact support.',
            error: 'Missing membershipPlanId in Payment Intent metadata',
          });
        }

        // Create subscription from Payment Intent
        const { processMembershipSubscriptionFromPaymentIntent } = await import('@/app/membership/success/ApiServerActions');
        const result = await processMembershipSubscriptionFromPaymentIntent(pi, undefined);

        if (result && result.subscription) {
          console.log('[MEMBERSHIP-PROCESS POST] ✅ Successfully created subscription from Payment Intent:', result.subscription.id);

          // CRITICAL: Final safety check - NEVER return CANCELLED/EXPIRED subscriptions
          if (result.subscription.subscriptionStatus === 'CANCELLED' || result.subscription.subscriptionStatus === 'EXPIRED') {
            console.error('[MEMBERSHIP-PROCESS POST] ⚠️⚠️⚠️ CRITICAL: Attempted to return CANCELLED/EXPIRED subscription - REJECTING:', {
              subscriptionId: result.subscription.id,
              status: result.subscription.subscriptionStatus,
              note: 'This should never happen - subscription was filtered earlier. Will return error.',
            });
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'Subscription was cancelled. Please try again.',
              error: 'Subscription status is CANCELLED or EXPIRED',
            }, { status: 400 });
          }

          // CRITICAL: Ensure plan is included in response for mobile flow
          let planDetails = result.plan;
          if (!planDetails && result.subscription.membershipPlanId) {
            // Fallback: Fetch plan directly if not included in result
            try {
              const { fetchMembershipPlanById } = await import('@/app/membership/success/ApiServerActions');
              planDetails = await fetchMembershipPlanById(result.subscription.membershipPlanId);
              console.log('[MEMBERSHIP-PROCESS POST] Fetched plan details as fallback:', {
                planId: planDetails?.id,
                planName: planDetails?.planName,
              });
            } catch (planError) {
              console.error('[MEMBERSHIP-PROCESS POST] ⚠️ Failed to fetch plan details (non-fatal):', planError);
            }
          }

          return NextResponse.json({
            subscription: result.subscription,
            plan: planDetails || null,
            userProfile: result.userProfile || null,
            amount: planDetails?.price || result.subscription.amount || null,
            currency: planDetails?.currency || result.subscription.currency || 'USD',
          });
        } else {
          console.error('[MEMBERSHIP-PROCESS POST] ❌ Failed to create subscription from Payment Intent:', {
            paymentIntentId: pi,
            result: result === null ? 'null' : 'no subscription',
          });

          // CRITICAL: Try final lookup by userProfileId if creation failed
          // This handles the case where subscription exists but wasn't found in processMembershipSubscriptionFromPaymentIntent
          try {
            const userId = paymentIntent.metadata?.userId;
            if (userId) {
              const { fetchUserProfileServer } = await import('@/app/profile/ApiServerActions');
              const userProfile = await fetchUserProfileServer(userId);

              if (userProfile?.id) {
                // CRITICAL: Do NOT add tenantId.equals when calling proxy - proxy handler adds it automatically
                // According to nextjs_api_routes.mdc: "Do NOT add tenantId.equals in your client/server code when calling the proxy"
                const params = new URLSearchParams({
                  'userProfileId.equals': String(userProfile.id),
                  // tenantId.equals removed - proxy handler will add it automatically
                  'subscriptionStatus.in': 'ACTIVE,TRIAL',
                  'sort': 'createdAt,desc',
                  'size': '1',
                });

                console.log('[MEMBERSHIP-PROCESS POST] Trying final lookup by userProfileId:', userProfile.id);
                const lookupRes = await fetchWithJwtRetry(
                  `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
                  { cache: 'no-store' }
                );

                if (lookupRes.ok) {
                  const items: MembershipSubscriptionDTO[] = await lookupRes.json();
                  // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
                  const activeSubscriptions = items.filter(sub =>
                    sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
                  );
                  if (activeSubscriptions.length > 0) {
                    const finalLookup = activeSubscriptions[0];
                    console.log('[MEMBERSHIP-PROCESS POST] ✅ Found existing ACTIVE subscription for user:', {
                      id: finalLookup.id,
                      status: finalLookup.subscriptionStatus,
                      planId: finalLookup.membershipPlanId,
                    });

                    // CRITICAL: Final safety check - NEVER return CANCELLED/EXPIRED subscriptions
                    if (finalLookup.subscriptionStatus === 'CANCELLED' || finalLookup.subscriptionStatus === 'EXPIRED') {
                      console.error('[MEMBERSHIP-PROCESS POST] ⚠️⚠️⚠️ CRITICAL: finalLookup is CANCELLED/EXPIRED - REJECTING:', {
                        subscriptionId: finalLookup.id,
                        status: finalLookup.subscriptionStatus,
                        note: 'This should never happen - filter should have caught this. Will proceed to create new one.',
                      });
                      // Don't return - let code below handle creation
                    } else {
                      const details = await fetchMembershipSubscriptionDetailsServer(
                        undefined,
                        pi
                      );

                      return NextResponse.json({
                        subscription: finalLookup,
                        plan: details?.plan || null,
                        amount: details?.amount || null,
                        currency: details?.currency || 'USD',
                      });
                    }
                  }
                }
              }
            }
          } catch (lookupErr) {
            console.error('[MEMBERSHIP-PROCESS POST] Error in final lookup:', lookupErr);
          }

          // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
          if (result === null || (result as any)?.error?.includes('activesubscriptionexists')) {
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }

          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Failed to create subscription. Please contact support.',
            error: result === null ? 'processMembershipSubscriptionFromPaymentIntent returned null' : 'Unknown error',
            paymentIntentStatus: paymentIntent.status,
            hasMetadata: !!paymentIntent.metadata,
            membershipPlanId: paymentIntent.metadata?.membershipPlanId || 'missing',
          });
        }
      } catch (createErr: any) {
        console.error('[MEMBERSHIP-PROCESS POST] ❌ Error creating subscription from Payment Intent:', {
          error: createErr,
          message: createErr?.message,
          stack: createErr?.stack,
          paymentIntentId: pi,
        });

        // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
        if (createErr?.message?.includes('activesubscriptionexists') || createErr?.message?.includes('active subscription')) {
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'error.activesubscriptionexists',
            error: 'An active subscription already exists for this user. Please check your membership page.',
          }, { status: 400 });
        }

        return NextResponse.json({
          subscription: null,
          plan: null,
          message: 'Failed to create subscription. Please contact support.',
          error: createErr?.message || 'Unknown error during subscription creation',
          errorType: createErr?.name || 'Error',
        }, { status: 500 });
      }
    }

    if (!resolvedSessionId) {
      console.log('[MEMBERSHIP-PROCESS POST] Could not resolve session ID from payment intent');
      return NextResponse.json({
        subscription: null,
        plan: null,
        message: 'Could not resolve session ID. Please wait for webhook processing.',
        error: 'Could not resolve session ID from payment intent',
      });
    }

    console.log('[MEMBERSHIP-PROCESS POST] No subscription found, creating from session:', resolvedSessionId);
    try {
      const result = await processMembershipSubscriptionSessionServer(resolvedSessionId);

      if (!result || !result.subscription) {
        console.error('[MEMBERSHIP-PROCESS POST] ❌ Failed to create subscription from session:', {
          sessionId: resolvedSessionId,
          result: result === null ? 'null' : 'no subscription',
        });

        // CRITICAL: Try final lookup by userProfileId if creation failed
        // This handles the case where subscription exists but wasn't found in processMembershipSubscriptionSessionServer
        try {
          const { stripe } = await import('@/lib/stripe');
          const session = await stripe().checkout.sessions.retrieve(resolvedSessionId, {
            expand: ['subscription'],
          });

          const userId = session.metadata?.userId;
          if (userId) {
            const { fetchUserProfileServer } = await import('@/app/profile/ApiServerActions');
            const userProfile = await fetchUserProfileServer(userId);

            if (userProfile?.id) {
              // CRITICAL: Do NOT add tenantId.equals when calling proxy - proxy handler adds it automatically
              // According to nextjs_api_routes.mdc: "Do NOT add tenantId.equals in your client/server code when calling the proxy"
              const params = new URLSearchParams({
                'userProfileId.equals': String(userProfile.id),
                // tenantId.equals removed - proxy handler will add it automatically
                'subscriptionStatus.in': 'ACTIVE,TRIAL',
                'sort': 'createdAt,desc',
                'size': '1',
              });

              console.log('[MEMBERSHIP-PROCESS POST] Trying final lookup by userProfileId:', userProfile.id);
              const lookupRes = await fetchWithJwtRetry(
                `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
                { cache: 'no-store' }
              );

              if (lookupRes.ok) {
                const items: MembershipSubscriptionDTO[] = await lookupRes.json();
                // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
                const activeSubscriptions = items.filter(sub =>
                  sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
                );
                if (activeSubscriptions.length > 0) {
                  const finalLookup = activeSubscriptions[0];
                  console.log('[MEMBERSHIP-PROCESS POST] ✅ Found existing ACTIVE subscription for user:', {
                    id: finalLookup.id,
                    status: finalLookup.subscriptionStatus,
                    planId: finalLookup.membershipPlanId,
                  });

                  // CRITICAL: Final safety check - NEVER return CANCELLED/EXPIRED subscriptions
                  if (finalLookup.subscriptionStatus === 'CANCELLED' || finalLookup.subscriptionStatus === 'EXPIRED') {
                    console.error('[MEMBERSHIP-PROCESS POST] ⚠️⚠️⚠️ CRITICAL: finalLookup is CANCELLED/EXPIRED - REJECTING:', {
                      subscriptionId: finalLookup.id,
                      status: finalLookup.subscriptionStatus,
                      note: 'This should never happen - filter should have caught this. Will proceed to create new one.',
                    });
                    // Don't return - let code below handle creation
                  } else {
                    const details = await fetchMembershipSubscriptionDetailsServer(
                      resolvedSessionId || undefined,
                      pi || undefined
                    );

                    return NextResponse.json({
                      subscription: finalLookup,
                      plan: details?.plan || null,
                      amount: details?.amount || null,
                      currency: details?.currency || 'USD',
                    });
                  }
                }
              }
            }
          }
        } catch (lookupErr) {
          console.error('[MEMBERSHIP-PROCESS POST] Error in final lookup:', lookupErr);
        }

        // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
        if (result === null || (result as any)?.error?.includes('activesubscriptionexists')) {
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'error.activesubscriptionexists',
            error: 'An active subscription already exists for this user. Please check your membership page.',
          }, { status: 400 });
        }

        return NextResponse.json({
          subscription: null,
          plan: null,
          message: 'Failed to create subscription. Please contact support.',
          error: result === null ? 'processMembershipSubscriptionSessionServer returned null' : 'Unknown error',
        });
      }

      // Fetch amount and currency from session details
      const details = await fetchMembershipSubscriptionDetailsServer(
        resolvedSessionId || undefined,
        pi || undefined
      );

      return NextResponse.json({
        subscription: result.subscription,
        plan: result.plan,
        userProfile: result.userProfile,
        amount: details?.amount || result.plan?.price || null,
        currency: details?.currency || result.plan?.currency || 'USD',
      });
    } catch (createErr: any) {
      console.error('[MEMBERSHIP-PROCESS POST] ❌ Error creating subscription from session:', {
        error: createErr,
        message: createErr?.message,
        stack: createErr?.stack,
        sessionId: resolvedSessionId,
      });

      // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
      if (createErr?.message?.includes('activesubscriptionexists') || createErr?.message?.includes('active subscription')) {
        return NextResponse.json({
          subscription: null,
          plan: null,
          message: 'error.activesubscriptionexists',
          error: 'An active subscription already exists for this user. Please check your membership page.',
        }, { status: 400 });
      }

      return NextResponse.json({
        subscription: null,
        plan: null,
        message: 'Failed to create subscription. Please contact support.',
        error: createErr?.message || 'Unknown error during subscription creation',
        errorType: createErr?.name || 'Error',
      }, { status: 500 });
    }

    // Fetch amount and currency from session details
    const details = await fetchMembershipSubscriptionDetailsServer(
      resolvedSessionId || undefined,
      pi || undefined
    );

    return NextResponse.json({
      subscription: result.subscription,
      plan: result.plan,
      userProfile: result.userProfile,
      amount: details?.amount || result.plan?.price || null,
      currency: details?.currency || result.plan?.currency || 'USD',
    });
  } catch (error) {
    console.error('[MEMBERSHIP-PROCESS POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

