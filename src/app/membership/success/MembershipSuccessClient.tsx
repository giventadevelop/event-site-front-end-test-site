"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchMembershipSubscriptionDetailsServer } from './ApiServerActions';
import { PlanFeaturesList } from '@/components/membership/PlanFeaturesList';
import type { MembershipPlanDTO, MembershipSubscriptionDTO } from '@/types';

interface MembershipSuccessClientProps {
  session_id?: string;
  payment_intent?: string;
}

export function MembershipSuccessClient({ session_id, payment_intent }: MembershipSuccessClientProps) {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    plan: MembershipPlanDTO | null;
    amount: number | null;
    currency: string | null;
    subscription: any | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cancelledRef = useRef(false);
  const isPostingRef = useRef(false); // CRITICAL: Prevent duplicate POST requests
  const processedRef = useRef(false); // CRITICAL: Prevent duplicate processing on refresh

  // SessionStorage keys for duplicate prevention (persists across page refreshes)
  const getProcessedKey = () => {
    const identifier = payment_intent || session_id || 'unknown';
    return `membership_subscription_processed_${identifier}`;
  };

  const hasBeenProcessed = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(getProcessedKey()) === 'true';
  };

  const markAsProcessed = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(getProcessedKey(), 'true');
  };

  // Default hero image URL - same as event success page
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  // Combined mobile detection and data fetching in a single useEffect
  useEffect(() => {
    // Reset cancelled flag at the start of each effect run
    cancelledRef.current = false;
    // Reset posting flag at the start (but will be set during POST)
    isPostingRef.current = false;

    if (typeof window === 'undefined') return;

    console.log('[MEMBERSHIP-SUCCESS] Component mounted:', { session_id, payment_intent });

    // Enhanced mobile detection (synchronous)
    const userAgent = navigator.userAgent || '';
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const narrowScreenMatch = window.innerWidth <= 768;
    const isMobile = mobileRegexMatch || narrowScreenMatch;

    console.log('[MEMBERSHIP-SUCCESS] Mobile detection:', {
      isMobile,
      userAgent: userAgent.substring(0, 50),
      windowWidth: window.innerWidth,
    });

    setIsMobileDevice(isMobile);

    // Handle mobile redirect
    if (isMobile) {
      console.log('[MEMBERSHIP-SUCCESS] ✅ MOBILE BROWSER DETECTED - Will redirect to /membership/qr');

      // Determine which identifier to use
      let identifier: string | null = session_id || payment_intent || null;
      if (!identifier) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          identifier = urlParams.get('session_id') || urlParams.get('pi') || null;
        } catch { }
      }
      if (!identifier) {
        try {
          identifier = sessionStorage.getItem('membership_session_id') || sessionStorage.getItem('membership_payment_intent') || null;
        } catch { }
      }

      if (!identifier) {
        console.log('[MEMBERSHIP-SUCCESS] ERROR: Missing both session_id and payment_intent');
        setLoading(false);
        return;
      }

      // Store in sessionStorage as fallback
      if (session_id) {
        sessionStorage.setItem('membership_session_id', session_id);
      } else if (payment_intent) {
        sessionStorage.setItem('membership_payment_intent', payment_intent);
      }

      // Show brief success message then redirect after 2 seconds
      const resolvedPi: string | undefined = payment_intent || (identifier.startsWith('pi_') ? identifier : undefined);
      const resolvedSessionId: string | undefined = session_id || (identifier.startsWith('cs_') ? identifier : undefined);

      setTimeout(() => {
        if (resolvedPi) {
          router.replace(`/membership/qr?pi=${encodeURIComponent(resolvedPi)}`);
        } else if (resolvedSessionId) {
          router.replace(`/membership/qr?session_id=${encodeURIComponent(resolvedSessionId)}`);
        } else {
          router.replace('/membership/qr');
        }
      }, 2000);
      return; // Exit early for mobile
    }

    // Desktop: Fetch subscription data
    console.log('[MEMBERSHIP-SUCCESS] ❌ DESKTOP DETECTED - Fetching subscription data');
    console.log('[DESKTOP FLOW] ============================================');
    console.log('[DESKTOP FLOW] Desktop browser detected - using GET-only flow');
    console.log('[DESKTOP FLOW] Desktop will NOT call POST endpoint (mobile-only)');
    console.log('[DESKTOP FLOW] Desktop will poll GET endpoint if subscription not found');
    console.log('[DESKTOP FLOW] GET endpoint will create subscription if payment succeeded (webhook fallback)');
    console.log('[DESKTOP FLOW] ============================================');

    // Ensure we have at least one identifier
    if (!session_id && !payment_intent) {
      console.log('[MEMBERSHIP-SUCCESS] No session_id or payment_intent, skipping data fetch');
      setLoading(false);
      return;
    }

    async function fetchSubscriptionData() {
      if (cancelledRef.current) return;

      // CRITICAL: Check sessionStorage to prevent duplicate processing on page refresh
      if (hasBeenProcessed() && processedRef.current) {
        console.log('[MEMBERSHIP-SUCCESS] Subscription already processed (from sessionStorage), redirecting to membership page:', {
          session_id,
          payment_intent,
          processedKey: getProcessedKey()
        });
        // If already processed, redirect to membership page instead of polling
        if (!cancelledRef.current) {
          setTimeout(() => {
            router.push('/membership');
          }, 2000); // Show success message for 2 seconds, then redirect
        }
        setLoading(false);
        return;
      }

      console.log('[MEMBERSHIP-SUCCESS] Starting data fetch...', { session_id, payment_intent });
      setLoading(true);
      setError(null);

      try {

        // Build GET query parameters
        const params = new URLSearchParams();
        if (payment_intent) {
          params.append('pi', payment_intent);
        } else if (session_id) {
          params.append('session_id', session_id);
        }
        const getQuery = params.toString();
        const getUrl = `/api/membership/success/process?${getQuery}&_t=${Date.now()}`;

        console.log('[DESKTOP FLOW] GET request URL:', getUrl);
        console.log('[DESKTOP FLOW] Desktop flow uses GET-only (no POST fallback)');
        console.log('[DESKTOP FLOW] Already processed:', hasBeenProcessed());

        console.log('[DESKTOP FLOW] About to fetch:', getUrl);
        const getRes = await fetch(getUrl, {
          cache: 'no-store',
        });

        console.log('[DESKTOP FLOW] GET response status:', getRes.status);
        console.log('[DESKTOP FLOW] GET response headers:', {
          contentType: getRes.headers.get('content-type'),
          statusText: getRes.statusText,
        });

        if (getRes.ok) {
          const data = await getRes.json();
          console.log('[DESKTOP FLOW] ============================================');
          console.log('[DESKTOP FLOW] GET response data (FULL):', JSON.stringify(data, null, 2));
          console.log('[DESKTOP FLOW] GET response data (SUMMARY):', {
            hasSubscription: !!data.subscription,
            subscriptionId: data.subscription?.id,
            subscriptionStatus: data.subscription?.subscriptionStatus,
            hasPlan: !!data.plan,
            planId: data.plan?.id,
            planName: data.plan?.planName,
            planPrice: data.plan?.price,
            amount: data.amount,
            currency: data.currency,
            error: data.error,
            message: data.message,
            responseKeys: Object.keys(data),
            timestamp: new Date().toISOString()
          });
          console.log('[DESKTOP FLOW] ============================================');

          if (data.subscription) {
            // CRITICAL: Only accept ACTIVE or TRIAL subscriptions
            // Filter out CANCELLED/EXPIRED subscriptions
            const subscriptionStatus = data.subscription.subscriptionStatus;
            if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
              console.log('[DESKTOP FLOW] ✅ Active subscription found in GET response:', data.subscription.id, 'Status:', subscriptionStatus);
              console.log('[DESKTOP FLOW] ✅ Desktop flow successful - subscription loaded via GET');

              // CRITICAL: Mark as processed in sessionStorage to prevent duplicate processing on refresh
              if (!hasBeenProcessed()) {
                markAsProcessed();
                processedRef.current = true;
                console.log('[MEMBERSHIP-SUCCESS] Marked subscription as processed in sessionStorage');
              }

              if (!cancelledRef.current) {
                // CRITICAL: Log plan details before setting state
                console.log('[DESKTOP FLOW] Setting subscription details:', {
                  hasPlan: !!data.plan,
                  planId: data.plan?.id,
                  planName: data.plan?.planName,
                  planPrice: data.plan?.price,
                  amount: data.amount,
                  currency: data.currency,
                  hasSubscription: !!data.subscription,
                  subscriptionId: data.subscription?.id,
                });

                // CRITICAL: If plan is null but subscription exists, log error and try to fetch plan separately
                if (!data.plan && data.subscription) {
                  console.error('[DESKTOP FLOW] ⚠️ CRITICAL: Subscription exists but plan is null!', {
                    subscriptionId: data.subscription.id,
                    membershipPlanId: data.subscription.membershipPlanId,
                    note: 'Plan details fetch may have failed - subscription details will be incomplete',
                  });
                }

                setSubscriptionDetails({
                  plan: data.plan,
                  amount: data.amount || data.plan?.price || null,
                  currency: data.currency || data.plan?.currency || 'USD',
                  subscription: data.subscription,
                });
              }
              setLoading(false);
              return;
            } else {
              console.warn('[DESKTOP FLOW] ⚠️ Subscription found but status is not ACTIVE/TRIAL:', {
                id: data.subscription.id,
                status: subscriptionStatus,
                note: 'Will continue polling for active subscription'
              });
              // Continue polling - don't set subscription if it's CANCELLED/EXPIRED
            }
          } else {
            // Log why subscription wasn't found
            console.log('[DESKTOP FLOW] Initial GET: Subscription not found', {
              error: data.error,
              message: data.message,
              note: 'Will start polling - GET endpoint will create subscription if payment succeeded'
            });
            console.log('[DESKTOP FLOW] ⚠️ No subscription found - webhook may still be processing or GET will create it');

            // CRITICAL: Desktop flow polls GET endpoint (which creates subscription if payment succeeded)
            // Poll GET endpoint to wait for webhook or GET endpoint to create subscription
            let pollAttempt = 0;
            const MAX_POLL_ATTEMPTS = 8; // Reduced from 10 to 8 for faster failure detection
            const POLL_INTERVAL = 2000; // Reduced from 3000ms to 2000ms (2 seconds) for faster polling

            console.log(`[DESKTOP FLOW] Starting polling loop - waiting for subscription...`);
            console.log(`[DESKTOP FLOW] Will poll up to ${MAX_POLL_ATTEMPTS} times with ${POLL_INTERVAL}ms intervals (total max wait: ${MAX_POLL_ATTEMPTS * POLL_INTERVAL / 1000}s)`);

            while (pollAttempt < MAX_POLL_ATTEMPTS && !cancelledRef.current) {
              pollAttempt++;
              console.log(`[DESKTOP FLOW] Polling attempt ${pollAttempt}/${MAX_POLL_ATTEMPTS}...`);

              // Wait before polling (except first attempt which already waited)
              if (pollAttempt > 1) {
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
              }

              // Update URL timestamp to prevent caching
              const pollUrl = `/api/membership/success/process?${getQuery}&_t=${Date.now()}&_poll=${pollAttempt}`;
              console.log(`[DESKTOP FLOW] Polling URL: ${pollUrl}`);

              try {
                const pollRes = await fetch(pollUrl, { cache: 'no-store' });
                console.log(`[DESKTOP FLOW] Poll response status (attempt ${pollAttempt}):`, pollRes.status);

                if (pollRes.ok) {
                  const pollData = await pollRes.json();
                  console.log(`[DESKTOP FLOW] Poll response data (attempt ${pollAttempt}):`, {
                    hasSubscription: !!pollData.subscription,
                    subscriptionId: pollData.subscription?.id,
                    error: pollData.error,
                    message: pollData.message,
                    responseKeys: Object.keys(pollData),
                    timestamp: new Date().toISOString()
                  });

                  if (pollData.subscription) {
                    // CRITICAL: Only accept ACTIVE or TRIAL subscriptions
                    // Filter out CANCELLED/EXPIRED subscriptions
                    const subscriptionStatus = pollData.subscription.subscriptionStatus;
                    if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
                      console.log('[DESKTOP FLOW] ✅ Active subscription found after polling:', pollData.subscription.id, 'Status:', subscriptionStatus);
                      console.log('[DESKTOP FLOW] ✅ Desktop flow successful - subscription loaded via GET polling');

                      // CRITICAL: Mark as processed in sessionStorage to prevent duplicate processing on refresh
                      if (!hasBeenProcessed()) {
                        markAsProcessed();
                        processedRef.current = true;
                        console.log('[MEMBERSHIP-SUCCESS] Marked subscription as processed in sessionStorage (from polling)');
                      }

                      if (!cancelledRef.current) {
                        // CRITICAL: Log plan details before setting state
                        console.log('[DESKTOP FLOW] Setting subscription details (from polling):', {
                          hasPlan: !!pollData.plan,
                          planId: pollData.plan?.id,
                          planName: pollData.plan?.planName,
                          planPrice: pollData.plan?.price,
                          amount: pollData.amount,
                          currency: pollData.currency,
                          hasSubscription: !!pollData.subscription,
                          subscriptionId: pollData.subscription?.id,
                        });

                        // CRITICAL: If plan is null but subscription exists, log error
                        if (!pollData.plan && pollData.subscription) {
                          console.error('[DESKTOP FLOW] ⚠️ CRITICAL: Subscription exists but plan is null (from polling)!', {
                            subscriptionId: pollData.subscription.id,
                            membershipPlanId: pollData.subscription.membershipPlanId,
                            note: 'Plan details fetch may have failed - subscription details will be incomplete',
                          });
                        }

                        setSubscriptionDetails({
                          plan: pollData.plan,
                          amount: pollData.amount || pollData.plan?.price || null,
                          currency: pollData.currency || pollData.plan?.currency || 'USD',
                          subscription: pollData.subscription,
                        });
                      }
                      setLoading(false);
                      return;
                    } else {
                      console.warn('[DESKTOP FLOW] ⚠️ Subscription found after polling but status is not ACTIVE/TRIAL:', {
                        id: pollData.subscription.id,
                        status: subscriptionStatus,
                        note: 'Will continue polling for active subscription'
                      });
                      // Continue polling - don't set subscription if it's CANCELLED/EXPIRED
                    }
                  } else {
                    // Log why subscription wasn't found with detailed error information
                    console.log(`[DESKTOP FLOW] Poll attempt ${pollAttempt}: Subscription not found yet`, {
                      error: pollData.error,
                      errorType: pollData.errorType,
                      message: pollData.message,
                      paymentIntentStatus: pollData.paymentIntentStatus,
                      hasMetadata: pollData.hasMetadata,
                      membershipPlanId: pollData.membershipPlanId,
                      note: 'Webhook may still be processing or GET endpoint will create it'
                    });

                    // If we have a specific error (not just "webhook processing"), log it for debugging
                    if (pollData.error && pollData.error !== 'processMembershipSubscriptionFromPaymentIntent returned null') {
                      console.error(`[DESKTOP FLOW] ⚠️ Subscription creation error detected (attempt ${pollAttempt}):`, pollData.error);
                    }
                  }
                } else {
                  const errorText = await pollRes.text();
                  let errorData: any = null;
                  try {
                    errorData = JSON.parse(errorText);
                  } catch {
                    // Not JSON, use as string
                  }

                  // CRITICAL: If we get a 400 error indicating subscription already exists, stop polling and redirect
                  if (pollRes.status === 400 && errorData?.message === 'error.activesubscriptionexists') {
                    console.log('[DESKTOP FLOW] Subscription already exists (400 error) - stopping polling and redirecting:', {
                      pollAttempt,
                      errorData,
                      timestamp: new Date().toISOString()
                    });

                    // Mark as processed
                    markAsProcessed();
                    processedRef.current = true;

                    if (!cancelledRef.current) {
                      // Redirect to membership page where subscription will be visible
                      setTimeout(() => {
                        router.push('/membership');
                      }, 2000);
                    }
                    setLoading(false);
                    return;
                  }

                  console.warn(`[DESKTOP FLOW] Poll request failed (attempt ${pollAttempt}):`, {
                    status: pollRes.status,
                    statusText: pollRes.statusText,
                    errorText,
                    errorData,
                    timestamp: new Date().toISOString()
                  });
                }
              } catch (pollErr: any) {
                console.warn(`[DESKTOP FLOW] Poll request error (attempt ${pollAttempt}):`, pollErr?.message);
                // Continue polling even if one request fails
              }
            }

            // If still not found after polling, check last poll response for error details
            let lastPollError: string | null = null;
            try {
              const lastPollUrl = `/api/membership/success/process?${getQuery}&_t=${Date.now()}&_poll=${MAX_POLL_ATTEMPTS}`;
              const lastPollRes = await fetch(lastPollUrl, { cache: 'no-store' });
              if (lastPollRes.ok) {
                const lastPollData = await lastPollRes.json();
                if (lastPollData.error) {
                  lastPollError = lastPollData.error;
                  console.error('[DESKTOP FLOW] ❌ Last poll attempt error:', lastPollError);
                }
              }
            } catch (err) {
              // Ignore errors in final check
            }

            // If still not found after polling, redirect to membership page (similar to ticket success page)
            console.log('[DESKTOP FLOW] Subscription not found after polling - redirecting to membership page:', {
              pollAttempts: MAX_POLL_ATTEMPTS,
              pollInterval: POLL_INTERVAL,
              totalWaitTime: `${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds`,
              sessionId: session_id || payment_intent,
              lastError: lastPollError,
              note: 'Payment was successful. Redirecting to membership page where subscription will be visible once processed.',
              timestamp: new Date().toISOString()
            });

            // Mark as processed to prevent further attempts
            markAsProcessed();
            processedRef.current = true;

            if (!cancelledRef.current) {
              // Show error message if we have one, otherwise show success message
              if (lastPollError) {
                setError(`Subscription processing encountered an issue: ${lastPollError}. Your payment was successful. Please check your membership page or contact support.`);
              }

              // Show success message briefly, then redirect to membership page
              setSubscriptionDetails({
                plan: null,
                amount: null,
                currency: null,
                subscription: null,
              });
              setError(null);

              // Redirect after 3 seconds
              setTimeout(() => {
                router.push('/membership');
              }, 3000);
            }
          }
        } else {
          const errorText = await getRes.text();
          let errorData: any = null;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // Not JSON, use as string
          }

          // CRITICAL: Handle "active subscription exists" error gracefully - redirect to membership page
          if (getRes.status === 400 && (errorData?.message === 'error.activesubscriptionexists' || errorText.includes('error.activesubscriptionexists'))) {
            console.log('[DESKTOP FLOW] Active subscription already exists - redirecting to membership page:', {
              errorData,
              timestamp: new Date().toISOString()
            });

            // Mark as processed
            markAsProcessed();
            processedRef.current = true;

            if (!cancelledRef.current) {
              // Redirect to membership page where subscription will be visible
              setTimeout(() => {
                router.push('/membership');
              }, 2000);
            }
            setLoading(false);
            return;
          }

          console.error('[DESKTOP FLOW] ❌ GET request failed:', getRes.status, errorText);
          if (!cancelledRef.current) {
            setError(`Failed to load subscription details: ${errorText || 'Unknown error'}`);
          }
        }
      } catch (err: any) {
        if (!cancelledRef.current) {
          console.error('[MEMBERSHIP-SUCCESS] Error fetching subscription data:', err);
          setError(err.message || 'Failed to load subscription details');
        }
      } finally {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      }
    }

    fetchSubscriptionData();

    // Cleanup function: set cancelled flag when component unmounts
    return () => {
      console.log('[MEMBERSHIP-SUCCESS] Cleanup: Setting cancelled flag');
      cancelledRef.current = true;
    };
  }, [session_id, payment_intent, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
        {/* Hero Image Section - Same as event success page */}
        <section className="hero-section" style={{
          position: 'relative',
          marginTop: '0',
          backgroundColor: 'transparent',
          minHeight: '400px',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 0 0 0'
        }}>
          <img
            src={defaultHeroImageUrl}
            alt="Membership Hero"
            className="hero-image"
            style={{
              margin: '0 auto',
              padding: '0',
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '0'
            }}
          />
        </section>

        {/* Loading Animation in Body - Below Hero Section */}
        <div className="flex justify-center items-center min-h-[600px] w-full py-12 px-4" style={{ position: 'relative' }}>
          <div className="relative w-full max-w-6xl">
            <Image
              src="/images/loading_events.jpg"
              alt="Loading membership subscription..."
              width={800}
              height={600}
              className="w-full h-auto rounded-lg shadow-2xl animate-pulse zoom-loading"
              priority
            />
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="wavy-animation"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION - Full width bleeding to header - Same as event success page */}
      <section className="hero-section" style={{
        position: 'relative',
        marginTop: '0',
        backgroundColor: 'transparent',
        minHeight: '400px',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0 0 0'
      }}>
        <img
          src={defaultHeroImageUrl}
          alt="Membership Hero"
          className="hero-image"
          style={{
            margin: '0 auto',
            padding: '0',
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '0'
          }}
        />
        <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
      </section>

      {/* Responsive Hero Image CSS - Same as event success page */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center;
            display: block;
            margin: 0 auto;
          }
          @media (max-width: 768px) {
            .hero-section {
              min-height: 300px;
              padding-top: 60px !important;
            }
            .hero-image {
              min-height: 300px;
            }
          }
        `
      }} />

      {/* Main content container */}
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ marginTop: '80px' }}>
        {/* Success Message */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
              Subscription Successful!
            </h1>
            <p className="text-lg font-body text-muted-foreground">
              {isMobileDevice
                ? 'Redirecting to your membership details...'
                : 'Your membership subscription has been activated successfully.'}
            </p>
          </div>
        </div>

        {/* Subscription Plan Summary */}
        {/* CRITICAL: Debug logging for production */}
        {typeof window !== 'undefined' && console.log('[MEMBERSHIP-SUCCESS UI] Rendering with subscriptionDetails:', {
          hasSubscriptionDetails: !!subscriptionDetails,
          hasPlan: !!subscriptionDetails?.plan,
          planId: subscriptionDetails?.plan?.id,
          planName: subscriptionDetails?.plan?.planName,
          hasSubscription: !!subscriptionDetails?.subscription,
          subscriptionId: subscriptionDetails?.subscription?.id,
          amount: subscriptionDetails?.amount,
          currency: subscriptionDetails?.currency,
          isMobileDevice,
        })}
        {subscriptionDetails?.plan && !isMobileDevice && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 border border-border">
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6 text-center">
                Your Subscription Plan
              </h2>

              {/* Plan Name */}
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {subscriptionDetails.plan.planName}
                </h3>
                {subscriptionDetails.plan.description && (
                  <p className="font-body text-muted-foreground">
                    {subscriptionDetails.plan.description}
                  </p>
                )}
              </div>

              {/* Price and Billing */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {(() => {
                      // Use amount from subscription if available, otherwise use plan price
                      // For subscriptions, amount_total might be 0 if it's a free trial or first payment deferred
                      const displayAmount = subscriptionDetails.amount !== null && subscriptionDetails.amount > 0
                        ? subscriptionDetails.amount
                        : subscriptionDetails.plan.price || 0;
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: subscriptionDetails.currency || subscriptionDetails.plan.currency || 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(displayAmount);
                    })()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionDetails.plan.billingInterval === 'MONTHLY' && 'per month'}
                    {subscriptionDetails.plan.billingInterval === 'QUARTERLY' && 'per quarter'}
                    {subscriptionDetails.plan.billingInterval === 'YEARLY' && 'per year'}
                    {subscriptionDetails.plan.billingInterval === 'ONE_TIME' && 'one-time'}
                  </span>
                </div>
                {subscriptionDetails.plan.trialDays != null && subscriptionDetails.plan.trialDays > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {subscriptionDetails.plan.trialDays} day{subscriptionDetails.plan.trialDays !== 1 ? 's' : ''} free trial
                    </span>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              {subscriptionDetails.plan.featuresJson && (() => {
                try {
                  const featuresObj = typeof subscriptionDetails.plan.featuresJson === 'string'
                    ? JSON.parse(subscriptionDetails.plan.featuresJson)
                    : subscriptionDetails.plan.featuresJson;

                  const features = Object.entries(featuresObj)
                    .filter(([key, value]) => {
                      const valueStr = String(value).trim();
                      return (
                        valueStr !== '' &&
                        valueStr !== '0' &&
                        valueStr !== '{' &&
                        valueStr !== '}' &&
                        valueStr !== '[]' &&
                        valueStr !== '{}' &&
                        valueStr !== 'null' &&
                        valueStr !== 'undefined' &&
                        !key.startsWith('_') &&
                        value !== null &&
                        value !== undefined &&
                        value !== 0
                      );
                    })
                    .map(([key, value]) => ({
                      key,
                      value: String(value),
                    }));

                  if (features.length > 0) {
                    return (
                      <div className="mb-6">
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                          Plan Features
                        </h3>
                        <PlanFeaturesList features={features} />
                      </div>
                    );
                  }
                } catch (e) {
                  console.error('Error parsing featuresJson:', e);
                }
                return null;
              })()}

              {/* Additional Plan Details */}
              <div className="space-y-4 pt-6 border-t border-border">
                {subscriptionDetails.plan.maxEventsPerMonth && subscriptionDetails.plan.maxEventsPerMonth > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Max Events</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {subscriptionDetails.plan.maxEventsPerMonth} per month
                      </p>
                    </div>
                  </div>
                )}

                {subscriptionDetails.plan.maxAttendeesPerEvent && subscriptionDetails.plan.maxAttendeesPerEvent > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Max Attendees</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {subscriptionDetails.plan.maxAttendeesPerEvent} per event
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-foreground">Billing</p>
                    <p className="font-body text-sm text-muted-foreground">
                      {subscriptionDetails.plan.billingInterval === 'MONTHLY' && 'Monthly'}
                      {subscriptionDetails.plan.billingInterval === 'QUARTERLY' && 'Quarterly'}
                      {subscriptionDetails.plan.billingInterval === 'YEARLY' && 'Yearly'}
                      {subscriptionDetails.plan.billingInterval === 'ONE_TIME' && 'One-time'} • {subscriptionDetails.plan.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status & Billing Details */}
        {subscriptionDetails?.subscription && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-8 border border-border">
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6 text-center">
                Subscription Details
              </h2>

              <div className="space-y-4">
                {/* Subscription Status */}
                <div className="flex items-start gap-3 pb-4 border-b border-border">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-foreground">Status</p>
                    <p className="font-body text-sm text-muted-foreground capitalize">
                      {subscriptionDetails.subscription.subscriptionStatus?.toLowerCase() || 'Active'}
                      {subscriptionDetails.subscription.cancelAtPeriodEnd && ' (Cancels at period end)'}
                    </p>
                  </div>
                </div>

                {/* Current Period */}
                {subscriptionDetails.subscription.currentPeriodStart && (
                  <div className="flex items-start gap-3 pb-4 border-b border-border">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Current Period</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {new Date(subscriptionDetails.subscription.currentPeriodStart).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} - {subscriptionDetails.subscription.currentPeriodEnd ? new Date(subscriptionDetails.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Next Payment */}
                {subscriptionDetails.subscription.currentPeriodEnd && subscriptionDetails?.plan && subscriptionDetails.plan.billingInterval !== 'ONE_TIME' && (
                  <div className="flex items-start gap-3 pb-4 border-b border-border">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Next Payment</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {new Date(subscriptionDetails.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stripe Subscription ID */}
                {subscriptionDetails.subscription.stripeSubscriptionId && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l4-4-4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Subscription ID</p>
                      <p className="font-body text-xs text-muted-foreground font-mono break-all">
                        {subscriptionDetails.subscription.stripeSubscriptionId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md p-8 border border-border">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-6 text-center">
              What's Next?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Manage Subscription Button (Blue) */}
              <button
                onClick={() => router.push('/membership')}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Manage Subscription"
                aria-label="Manage Subscription"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Manage Subscription</span>
              </button>

              {/* View All Plans Button (Green) */}
              <button
                onClick={() => router.push('/membership')}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="View All Plans"
                aria-label="View All Plans"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-semibold text-green-700">View All Plans</span>
              </button>

              {/* My Profile Button (Purple) */}
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="My Profile"
                aria-label="My Profile"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-purple-700">My Profile</span>
              </button>

              {/* Go Home Button (Indigo) */}
              <button
                onClick={() => router.push('/')}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Go Home"
                aria-label="Go Home"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-semibold text-indigo-700">Go Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Processing Issue</h3>
                  <p className="text-red-800 text-sm mb-4">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300"
                    >
                      Refresh Page
                    </button>
                    <a
                      href="mailto:support@example.com"
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold transition-all duration-300 text-center"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

