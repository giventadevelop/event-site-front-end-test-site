"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlanFeaturesList } from '@/components/membership/PlanFeaturesList';
import type { MembershipSubscriptionDTO, MembershipPlanDTO } from '@/types';

interface MembershipQrClientProps {
  session_id?: string;
  payment_intent?: string;
}

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export function MembershipQrClient({ session_id, payment_intent }: MembershipQrClientProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<MembershipSubscriptionDTO | null>(null);
  const [plan, setPlan] = useState<MembershipPlanDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pollAttemptRef = useRef(0);
  const cancelledRef = useRef(false);
  const fetchedIdentifierRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get identifier from URL or sessionStorage
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
      console.error('[MEMBERSHIP-QR] No identifier found');
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (fetchedIdentifierRef.current === identifier) {
      console.log('[MEMBERSHIP-QR] Already fetched for this identifier, skipping');
      return;
    }

    fetchedIdentifierRef.current = identifier;

    // Poll for subscription data
    const pollForSubscription = async () => {
      if (cancelledRef.current) return;

      // CRITICAL: Ensure loading state is true during polling
      setLoading(true);

      pollAttemptRef.current += 1;
      const attempt = pollAttemptRef.current;

      console.log(`[MEMBERSHIP-QR] ✅ Poll attempt ${attempt}/${MAX_POLL_ATTEMPTS}`);

      try {
        // Build query params
        const params = new URLSearchParams();
        if (payment_intent || identifier?.startsWith('pi_')) {
          params.append('pi', payment_intent || identifier || '');
        } else if (session_id || identifier?.startsWith('cs_')) {
          params.append('session_id', session_id || identifier || '');
        }

        // Poll GET endpoint for existing subscription
        const response = await fetch(`/api/membership/success/process?${params.toString()}&_t=${Date.now()}&_poll=${attempt}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            // CRITICAL: Only accept ACTIVE or TRIAL subscriptions
            // If subscription is CANCELLED or EXPIRED, continue polling or show warning
            const subscriptionStatus = data.subscription.subscriptionStatus;
            if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
              console.log('[MEMBERSHIP-QR] ✅✅✅ SUCCESS! Active subscription found:', data.subscription.id, 'Status:', subscriptionStatus);
              setSubscription(data.subscription);
              setPlan(data.plan || null);
              setLoading(false);
              return; // Success - exit polling
            } else {
              console.warn('[MEMBERSHIP-QR] ⚠️ Subscription found but status is not ACTIVE/TRIAL:', {
                id: data.subscription.id,
                status: subscriptionStatus,
                note: 'This subscription may have been cancelled. Continuing to poll for active subscription...'
              });
              // Continue polling - don't set subscription if it's CANCELLED/EXPIRED
              // The user will see a warning if polling fails
            }
          } else {
            // Log why subscription wasn't found with detailed error information
            console.log(`[MEMBERSHIP-QR] Poll attempt ${attempt}: Subscription not found yet`, {
              error: data.error,
              errorType: data.errorType,
              message: data.message,
              paymentIntentStatus: data.paymentIntentStatus,
              hasMetadata: data.hasMetadata,
              membershipPlanId: data.membershipPlanId,
              note: 'Webhook may still be processing or GET endpoint will create it'
            });

            // If we have a specific error (not just "webhook processing"), log it for debugging
            if (data.error && data.error !== 'processMembershipSubscriptionFromPaymentIntent returned null') {
              console.error(`[MEMBERSHIP-QR] ⚠️ Subscription creation error detected (attempt ${attempt}):`, data.error);
            }
          }
        } else {
          // CRITICAL: Handle 400 error with "error.activesubscriptionexists" message
          // This happens when an active subscription already exists for the user
          // BUT: Only redirect if we truly don't have a subscription (after checking response)
          if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));

            // CRITICAL: Check if errorData actually contains a subscription (GET endpoint might return it)
            // Only accept ACTIVE or TRIAL subscriptions
            if (errorData.subscription) {
              const subscriptionStatus = errorData.subscription.subscriptionStatus;
              if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
                console.log('[MEMBERSHIP-QR] ✅✅✅ SUCCESS! Active subscription found in error response:', errorData.subscription.id, 'Status:', subscriptionStatus);
                setSubscription(errorData.subscription);
                setPlan(errorData.plan || null);
                setLoading(false);
                return; // Success - exit polling
              } else {
                console.warn('[MEMBERSHIP-QR] ⚠️ Subscription in error response is not ACTIVE/TRIAL:', {
                  id: errorData.subscription.id,
                  status: subscriptionStatus,
                  note: 'Continuing to poll for active subscription...'
                });
                // Continue polling - don't set subscription if it's CANCELLED/EXPIRED
              }
            }

            // Only redirect if we truly don't have a subscription and the error is "activesubscriptionexists"
            if (errorData.message === 'error.activesubscriptionexists') {
              console.log('[MEMBERSHIP-QR] Active subscription already exists but not returned - redirecting to membership page');
              // Stop polling and redirect after a short delay
              setLoading(false);
              setTimeout(() => {
                router.push('/membership');
              }, 2000);
              return; // Exit polling
            }
          }

          const errorText = await response.text();
          console.error(`[MEMBERSHIP-QR] GET request failed (attempt ${attempt}):`, {
            status: response.status,
            error: errorText,
          });
        }

        // CRITICAL: Try POST fallback after 3 attempts OR on final attempt
        // This ensures we attempt subscription creation even if webhook failed
        const shouldTryPost = (pollAttemptRef.current >= 3 && pollAttemptRef.current < MAX_POLL_ATTEMPTS) || pollAttemptRef.current === MAX_POLL_ATTEMPTS;

        if (shouldTryPost && !cancelledRef.current) {
          console.log(`[MEMBERSHIP-QR] Transaction not found after ${attempt} polling attempts, attempting POST to create subscription`);

          const postBody = session_id ? { session_id, skip_qr: true } : { pi: payment_intent || identifier, skip_qr: true };
          const postRes = await fetch('/api/membership/success/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postBody),
            cache: 'no-store',
          });

          if (postRes.ok) {
            const postData = await postRes.json();
            console.log('[MEMBERSHIP-QR] POST response data (FULL):', JSON.stringify(postData, null, 2));

            if (postData.subscription) {
              // CRITICAL: Only accept ACTIVE or TRIAL subscriptions
              // If subscription is CANCELLED or EXPIRED, continue polling or show warning
              const subscriptionStatus = postData.subscription.subscriptionStatus;
              if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
                console.log('[MEMBERSHIP-QR] ✅✅✅ POST FALLBACK SUCCESS! Active subscription created:', {
                  subscriptionId: postData.subscription.id,
                  status: subscriptionStatus,
                  hasPlan: !!postData.plan,
                  planId: postData.plan?.id,
                  planName: postData.plan?.planName,
                  amount: postData.amount,
                  currency: postData.currency,
                });

                // CRITICAL: Ensure plan is set - if not provided, try to fetch it
                let planToSet = postData.plan;
                if (!planToSet && postData.subscription.membershipPlanId) {
                  console.log('[MEMBERSHIP-QR] ⚠️ Plan not in response - attempting to fetch:', postData.subscription.membershipPlanId);
                  try {
                    // Fetch plan from backend
                    const planRes = await fetch(`/api/proxy/membership-plans/${postData.subscription.membershipPlanId}`, {
                      cache: 'no-store',
                    });
                    if (planRes.ok) {
                      planToSet = await planRes.json();
                      console.log('[MEMBERSHIP-QR] ✅ Fetched plan details:', {
                        planId: planToSet?.id,
                        planName: planToSet?.planName,
                      });
                    }
                  } catch (planError) {
                    console.error('[MEMBERSHIP-QR] ⚠️ Failed to fetch plan (non-fatal):', planError);
                  }
                }

                setSubscription(postData.subscription);
                setPlan(planToSet || null);
                setLoading(false);
                return; // Success - exit polling
              } else {
                console.warn('[MEMBERSHIP-QR] ⚠️ POST subscription created but status is not ACTIVE/TRIAL:', {
                  id: postData.subscription.id,
                  status: subscriptionStatus,
                  note: 'This subscription may have been cancelled. Continuing to poll for active subscription...'
                });
                // Continue polling - don't set subscription if it's CANCELLED/EXPIRED
              }
            } else {
              console.error('[MEMBERSHIP-QR] POST fallback returned OK but no subscription:', {
                error: postData.error,
                message: postData.message,
                responseKeys: Object.keys(postData),
              });
            }
          } else {
            // CRITICAL: Handle 400 error with "error.activesubscriptionexists" message
            // This happens when an active subscription already exists for the user
            // BUT: Only redirect if we truly don't have a subscription (after checking response)
            if (postRes.status === 400) {
              const errorData = await postRes.json().catch(() => ({}));

              // CRITICAL: Check if errorData actually contains a subscription (POST endpoint might return it)
              // Only accept ACTIVE or TRIAL subscriptions
              if (errorData.subscription) {
                const subscriptionStatus = errorData.subscription.subscriptionStatus;
                if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
                  console.log('[MEMBERSHIP-QR] ✅✅✅ POST FALLBACK SUCCESS! Active subscription found in error response:', {
                    subscriptionId: errorData.subscription.id,
                    status: subscriptionStatus,
                    hasPlan: !!errorData.plan,
                    planId: errorData.plan?.id,
                  });

                  // CRITICAL: Ensure plan is set - if not provided, try to fetch it
                  let planToSet = errorData.plan;
                  if (!planToSet && errorData.subscription.membershipPlanId) {
                    console.log('[MEMBERSHIP-QR] ⚠️ Plan not in error response - attempting to fetch:', errorData.subscription.membershipPlanId);
                    try {
                      const planRes = await fetch(`/api/proxy/membership-plans/${errorData.subscription.membershipPlanId}`, {
                        cache: 'no-store',
                      });
                      if (planRes.ok) {
                        planToSet = await planRes.json();
                        console.log('[MEMBERSHIP-QR] ✅ Fetched plan details from error response:', {
                          planId: planToSet?.id,
                          planName: planToSet?.planName,
                        });
                      }
                    } catch (planError) {
                      console.error('[MEMBERSHIP-QR] ⚠️ Failed to fetch plan from error response (non-fatal):', planError);
                    }
                  }

                  setSubscription(errorData.subscription);
                  setPlan(planToSet || null);
                  setLoading(false);
                  return; // Success - exit polling
                } else {
                  console.warn('[MEMBERSHIP-QR] ⚠️ POST subscription in error response is not ACTIVE/TRIAL:', {
                    id: errorData.subscription.id,
                    status: subscriptionStatus,
                    note: 'Continuing to poll for active subscription...'
                  });
                  // Continue polling - don't set subscription if it's CANCELLED/EXPIRED
                }
              }

              // Only redirect if we truly don't have a subscription and the error is "activesubscriptionexists"
              if (errorData.message === 'error.activesubscriptionexists') {
                console.log('[MEMBERSHIP-QR] Active subscription already exists (POST) but not returned - redirecting to membership page');
                // Stop polling and redirect after a short delay
                setLoading(false);
                setTimeout(() => {
                  router.push('/membership');
                }, 2000);
                return; // Exit polling
              }
            }

            const errorText = await postRes.text();
            let errorData: any = null;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              // Not JSON, use as string
            }
            console.error('[MEMBERSHIP-QR] POST fallback failed:', {
              status: postRes.status,
              statusText: postRes.statusText,
              error: errorText,
              errorData,
            });
          }
        }

        // If not found and we haven't reached max attempts, continue polling
        // CRITICAL: Keep loading state true during polling
        if (attempt < MAX_POLL_ATTEMPTS) {
          // Ensure loading state remains true for next poll
          setLoading(true);
          setTimeout(pollForSubscription, POLL_INTERVAL_MS);
        } else {
          // Get last error details before showing error
          let lastError: string | null = null;
          try {
            const lastParams = new URLSearchParams();
            if (payment_intent || identifier?.startsWith('pi_')) {
              lastParams.append('pi', payment_intent || identifier || '');
            } else if (session_id || identifier?.startsWith('cs_')) {
              lastParams.append('session_id', session_id || identifier || '');
            }
            const lastResponse = await fetch(`/api/membership/success/process?${lastParams.toString()}&_t=${Date.now()}&_poll=${MAX_POLL_ATTEMPTS}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
            });
            if (lastResponse.ok) {
              const lastData = await lastResponse.json();
              if (lastData.error) {
                lastError = lastData.error;
              }
            }
          } catch (err) {
            // Ignore errors in final check
          }

          console.error('[MEMBERSHIP-QR] ❌ Subscription not found after maximum polling attempts:', {
            attempts: MAX_POLL_ATTEMPTS,
            interval: POLL_INTERVAL_MS,
            totalWaitTime: `${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000} seconds`,
            lastError,
            identifier,
          });

          // Show detailed error message if available
          const errorMessage = lastError
            ? `Subscription processing encountered an issue: ${lastError}. Your payment was successful. Please check your membership page or contact support.`
            : 'Subscription not found. Please contact support if payment was successful.';
          setError(errorMessage);
          setLoading(false);
        }
      } catch (err) {
        console.error('[MEMBERSHIP-QR] Poll error:', err);
        if (attempt < MAX_POLL_ATTEMPTS) {
          // CRITICAL: Keep loading state true during polling even after error
          setLoading(true);
          setTimeout(pollForSubscription, POLL_INTERVAL_MS);
        } else {
          setError('Failed to load subscription. Please try again later.');
          setLoading(false);
        }
      }
    };

    // Start polling
    pollForSubscription();
  }, [session_id, payment_intent]);

  // Default hero image URL - same as desktop success page
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
        {/* Hero Image Section - Same as desktop success page */}
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/membership')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Membership
          </button>
        </div>
      </div>
    );
  }

  // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - only show ACTIVE/TRIAL
  const isActiveSubscription = subscription && (
    subscription.subscriptionStatus === 'ACTIVE' ||
    subscription.subscriptionStatus === 'TRIAL'
  );

  // If subscription is CANCELLED or EXPIRED, show warning
  if (subscription && !isActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>
        {/* Hero Image Section */}
        <section className="hero-section" style={{
          position: 'relative',
          marginTop: '0',
          backgroundColor: 'transparent',
          minHeight: '300px',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 0 0 0'
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

        {/* Warning Message */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
              Subscription Status: {subscription.subscriptionStatus}
            </h1>
            <p className="text-muted-foreground mb-6">
              Your subscription is currently {subscription.subscriptionStatus.toLowerCase()}. Please check your membership page for details.
            </p>
            <button
              onClick={() => router.push('/membership')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity w-full"
            >
              Go to Membership
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION - Full width bleeding to header - Same as desktop success page */}
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

      {/* Responsive Hero Image CSS - Same as desktop success page */}
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
              Your membership subscription has been activated successfully.
            </p>
          </div>
        </div>

        {/* Subscription Plan Summary */}
        {/* CRITICAL: Debug logging for production */}
        {typeof window !== 'undefined' && console.log('[MEMBERSHIP-QR UI] Rendering with subscription and plan:', {
          hasSubscription: !!subscription,
          hasPlan: !!plan,
          planId: plan?.id,
          planName: plan?.planName,
          subscriptionId: subscription?.id,
          subscriptionStatus: subscription?.subscriptionStatus,
        })}
        {plan && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-md p-8 border border-border">
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6 text-center">
                Your Subscription Plan
              </h2>

              {/* Plan Name */}
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {plan.planName}
                </h3>
                {plan.description && (
                  <p className="font-body text-muted-foreground">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Price and Billing */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: plan.currency || 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(plan.price || 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.billingInterval === 'MONTHLY' && 'per month'}
                    {plan.billingInterval === 'QUARTERLY' && 'per quarter'}
                    {plan.billingInterval === 'YEARLY' && 'per year'}
                    {plan.billingInterval === 'ONE_TIME' && 'one-time'}
                  </span>
                </div>
                {plan.trialDays != null && plan.trialDays > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {plan.trialDays} day{plan.trialDays !== 1 ? 's' : ''} free trial
                    </span>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              {plan.featuresJson && (() => {
                try {
                  const featuresObj = typeof plan.featuresJson === 'string'
                    ? JSON.parse(plan.featuresJson)
                    : plan.featuresJson;

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
                {plan.maxEventsPerMonth && plan.maxEventsPerMonth > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Max Events</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {plan.maxEventsPerMonth} per month
                      </p>
                    </div>
                  </div>
                )}

                {plan.maxAttendeesPerEvent && plan.maxAttendeesPerEvent > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Max Attendees</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {plan.maxAttendeesPerEvent} per event
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
                      {plan.billingInterval === 'MONTHLY' && 'Monthly'}
                      {plan.billingInterval === 'QUARTERLY' && 'Quarterly'}
                      {plan.billingInterval === 'YEARLY' && 'Yearly'}
                      {plan.billingInterval === 'ONE_TIME' && 'One-time'} • {plan.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status & Details */}
        {subscription && isActiveSubscription && (
          <div className="max-w-2xl mx-auto mb-8">
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
                    <p className="font-body text-sm text-green-600 capitalize">
                      {subscription.subscriptionStatus?.toLowerCase() || 'Active'}
                      {subscription.cancelAtPeriodEnd && ' (Cancels at period end)'}
                    </p>
                  </div>
                </div>

                {/* Current Period */}
                {subscription.currentPeriodStart && (
                  <div className="flex items-start gap-3 pb-4 border-b border-border">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Current Period</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} - {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Next Payment */}
                {subscription.currentPeriodEnd && plan && plan.billingInterval !== 'ONE_TIME' && (
                  <div className="flex items-start gap-3 pb-4 border-b border-border">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Next Payment</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stripe Subscription ID */}
                {subscription.stripeSubscriptionId && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l4-4-4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Subscription ID</p>
                      <p className="font-body text-xs text-muted-foreground font-mono break-all">
                        {subscription.stripeSubscriptionId}
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
      </div>
    </div>
  );
}
