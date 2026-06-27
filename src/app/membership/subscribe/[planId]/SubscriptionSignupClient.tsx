'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { PlanSummaryCard } from '@/components/membership/PlanSummaryCard';
import { Button } from '@/components/ui/button';
import { MembershipPaymentRequestButton } from '@/components/membership/MembershipPaymentRequestButton';
import MembershipDesktopCheckout from '@/components/membership/MembershipDesktopCheckout';
import { createSubscriptionCheckoutSessionServer, createUserProfileFromClerkUser } from './ApiServerActions';
import type { MembershipPlanDTO, UserProfileDTO } from '@/types';

interface SubscriptionSignupClientProps {
  plan: MembershipPlanDTO | null;
  error: string | null;
  userProfile?: UserProfileDTO | null; // User profile if registered
}

export function SubscriptionSignupClient({ plan, error, userProfile: initialUserProfile }: SubscriptionSignupClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileDTO | null>(initialUserProfile || null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [canEnablePayment, setCanEnablePayment] = useState(false);
  const [isPRBReady, setIsPRBReady] = useState(false); // Track when Payment Request Buttons are ready

  // Feature flag: Use Stripe Checkout Sessions instead of Payment Intents
  // Set NEXT_PUBLIC_USE_STRIPE_CHECKOUT=true to enable Checkout Session flow
  // This is a client-side check of the environment variable
  const useCheckoutFlow = process.env.NEXT_PUBLIC_USE_STRIPE_CHECKOUT === 'true';

  // Ensure user profile exists before enabling payment (RECOMMENDED SOLUTION)
  useEffect(() => {
    async function ensureUserProfile() {
      if (!userId || !isUserLoaded) {
        setCanEnablePayment(false);
        return;
      }

      // Check if profile already exists
      if (userProfile?.id) {
        console.log('[MEMBERSHIP-SUBSCRIBE] User profile confirmed:', userProfile.id);
        setCanEnablePayment(true);
        return;
      }

      // Try to fetch profile
      try {
        const response = await fetch(`/api/proxy/user-profiles/by-user/${userId}`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const profile = await response.json();
          if (profile?.id) {
            console.log('[MEMBERSHIP-SUBSCRIBE] User profile found via fetch:', profile.id);
            setUserProfile(profile);
            setCanEnablePayment(true);
            return;
          }
        }
      } catch (err) {
        console.error('[MEMBERSHIP-SUBSCRIBE] Error fetching profile:', err);
      }

      // Profile doesn't exist - check if we have email
      const email = user?.emailAddresses?.[0]?.emailAddress ||
                    user?.primaryEmailAddress?.emailAddress || '';

      if (!email) {
        console.log('[MEMBERSHIP-SUBSCRIBE] Email missing - cannot create profile');
        setProfileError('Email address is required to complete your subscription. Please update your account settings.');
        setCanEnablePayment(false);
        return;
      }

      // Create profile (with retry logic)
      if (retryCount < 3) {
        setIsCreatingProfile(true);
        setProfileError(null);

        try {
          const newProfile = await createUserProfileFromClerkUser({
            userId,
            email,
            firstName: user?.firstName || 'User',
            lastName: user?.lastName || '',
            phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
            imageUrl: user?.imageUrl || '',
          });

          if (newProfile?.id) {
            console.log('[MEMBERSHIP-SUBSCRIBE] User profile created successfully:', newProfile.id);
            setUserProfile(newProfile);
            setCanEnablePayment(true);
            setIsCreatingProfile(false);
            setRetryCount(0);
          } else {
            throw new Error('Profile creation returned no ID');
          }
        } catch (err) {
          setIsCreatingProfile(false);

          // Extract detailed error information
          const errorDetails = err instanceof Error ? {
            message: err.message,
            name: err.name,
            stack: err.stack,
          } : { error: String(err) };

          console.error('[MEMBERSHIP-SUBSCRIBE] Profile creation failed:', {
            error: errorDetails,
            userId,
            email,
            retryCount,
          });

          // Provide user-friendly error message
          let userErrorMessage = 'Unable to set up your account. ';
          if (errorDetails.message) {
            // Check for specific error types to provide better feedback
            if (errorDetails.message.includes('NEXT_PUBLIC_APP_URL')) {
              userErrorMessage += 'Configuration error. Please contact support.';
            } else if (errorDetails.message.includes('Network error')) {
              userErrorMessage += 'Network connection issue. Please check your internet and try again.';
            } else if (errorDetails.message.includes('Failed to create user profile')) {
              userErrorMessage += 'Server error. Please try again or contact support.';
            } else {
              userErrorMessage += errorDetails.message;
            }
          } else {
            userErrorMessage += 'Please try again or contact support.';
          }

          setProfileError(userErrorMessage);

          // Only retry for network errors or transient failures, not for validation errors
          const isRetryableError = errorDetails.message && (
            errorDetails.message.includes('Network error') ||
            errorDetails.message.includes('Failed to create user profile') ||
            errorDetails.message.includes('timeout') ||
            errorDetails.message.includes('ECONNREFUSED')
          );

          if (isRetryableError && retryCount < 2) {
            // Auto-retry after 2 seconds for retryable errors
            console.log(`[MEMBERSHIP-SUBSCRIBE] Retrying profile creation (attempt ${retryCount + 1}/3)...`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
          } else {
            // Don't retry for validation errors or after max retries
            if (retryCount >= 2) {
              setProfileError('Unable to set up your account after multiple attempts. Please contact support or try again later.');
            }
            // Error message already set above
          }
        }
      } else {
        setProfileError('Unable to set up your account after multiple attempts. Please contact support.');
        setCanEnablePayment(false);
      }
    }

    ensureUserProfile();
  }, [userId, isUserLoaded, userProfile, retryCount, user]);

  // Extract user data for payment
  const email = user?.emailAddresses?.[0]?.emailAddress ||
                user?.primaryEmailAddress?.emailAddress ||
                userProfile?.email || '';
  const customerName = user?.fullName ||
                       (userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : '') ||
                       undefined;
  const customerPhone = user?.phoneNumbers?.[0]?.phoneNumber || userProfile?.phone || undefined;

  // Debug logging
  useEffect(() => {
    console.log('[MEMBERSHIP-SUBSCRIBE] Payment state:', {
      userId,
      email,
      hasUserProfile: !!userProfile?.id,
      canEnablePayment,
      isMobile,
      isUserLoaded,
      isCreatingProfile,
      retryCount,
    });
  }, [userId, email, userProfile, canEnablePayment, isMobile, isUserLoaded, isCreatingProfile, retryCount]);

  // Detect mobile device
  // CRITICAL: Only detect mobile by user agent, not window width
  // Desktop browsers with narrow windows should still show Stripe Elements
  // The MembershipDesktopCheckout component handles hiding ExpressCheckoutElement internally
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      const userAgent = navigator.userAgent || '';
      const platform = navigator.platform || '';
      // CRITICAL: Only detect mobile by user agent, not window width
      // This matches the event checkout pattern where StripeDesktopCheckout always renders
      // and handles mobile detection internally
      const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
      const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(platform);
      setIsMobile(mobileRegexMatch || platformMatch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (error || !plan) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error || 'Plan not found'}
        </div>
      </div>
    );
  }

  // Show loading state while creating profile
  if (isCreatingProfile) {
    return (
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="font-heading font-semibold text-3xl text-foreground mb-4">Complete Your Subscription</h1>
          <p className="font-body text-lg text-muted-foreground mb-6">
            Review your plan details and proceed to checkout
          </p>
        </div>

        {/* Back to Plans Button - Left aligned, following admin action buttons pattern */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => router.push('/membership')}
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Membership Plans"
            aria-label="Back to Membership Plans"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Back to Plans</span>
          </button>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="font-heading font-semibold text-xl text-foreground mb-2">Setting up your account...</h2>
          <p className="font-body text-muted-foreground">Please wait while we prepare your subscription</p>
        </div>
      </div>
    );
  }

  // Show error state if profile creation failed
  if (profileError && !canEnablePayment) {
    const hasEmail = !!(user?.emailAddresses?.[0]?.emailAddress ||
                        user?.primaryEmailAddress?.emailAddress);

    return (
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="font-heading font-semibold text-3xl text-foreground mb-4">Complete Your Subscription</h1>
          <p className="font-body text-lg text-muted-foreground mb-6">
            Review your plan details and proceed to checkout
          </p>
        </div>

        {/* Back to Plans Button - Left aligned, following admin action buttons pattern */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => router.push('/membership')}
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Membership Plans"
            aria-label="Back to Membership Plans"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Back to Plans</span>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-md">
          <h3 className="font-semibold text-lg mb-2">Account Setup Required</h3>
          <p className="mb-4">{profileError}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {!hasEmail ? (
              <Button
                onClick={() => router.push(`/profile?redirect_url=/membership/subscribe/${plan.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Update Account Settings
              </Button>
            ) : (
              <>
                {retryCount < 3 && (
                  <Button
                    onClick={() => setRetryCount(0)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Try Again
                  </Button>
                )}
                <a
                  href="mailto:support@example.com"
                  className="px-4 py-2 text-blue-500 underline hover:text-blue-700"
                >
                  Contact Support
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setCheckoutError(null);

      // Use Checkout Session flow (recommended - simpler and more reliable)
      const successUrl = `${window.location.origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/membership?canceled=true`;

      console.log('[MEMBERSHIP-SUBSCRIBE] Creating Checkout Session (Phase 1 Migration)...', {
        planId: plan.id,
        useCheckoutFlow,
        timestamp: new Date().toISOString(),
      });

      const { sessionUrl } = await createSubscriptionCheckoutSessionServer(plan.id!, successUrl, cancelUrl);

      console.log('[MEMBERSHIP-SUBSCRIBE] Checkout Session created, redirecting to:', sessionUrl);
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('[MEMBERSHIP-SUBSCRIBE] Error creating checkout session:', err);
      setCheckoutError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 pt-24 pb-8">
      <div className="text-center mb-8">
        <h1 className="font-heading font-semibold text-3xl text-foreground mb-4">Complete Your Subscription</h1>
        <p className="font-body text-lg text-muted-foreground mb-6">
          Review your plan details and proceed to checkout
        </p>
      </div>

      {/* Back to Plans Button - Left aligned above plan summary, following admin action buttons pattern */}
      <div className="mb-6 flex justify-start">
        <button
          onClick={() => router.push('/membership')}
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Membership Plans"
          aria-label="Back to Membership Plans"
          type="button"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Back to Plans</span>
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <PlanSummaryCard plan={plan} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Payment</h2>
          {checkoutError && (
            <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md">
              {checkoutError}
            </div>
          )}
          {/* Phase 2/3: When useCheckoutFlow is true, Stripe Checkout is the ONLY payment option */}
          {/* Phase 1 (useCheckoutFlow=false): Show Stripe Elements inline payment form */}
          {!useCheckoutFlow && userId && canEnablePayment && (
            <>
              <p className="font-body text-muted-foreground mb-4">
                Complete your subscription using Apple Pay, Google Pay, Link, or card.
              </p>
              {/* Payment instructions - only show on desktop */}
              <div className="hidden md:block mt-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-700 text-sm">
                  <span className="mr-2">💳</span>
                  <span>Please select a payment method or click any of the payment buttons below</span>
                </div>
              </div>
              <MembershipDesktopCheckout
                membershipPlanId={plan.id!}
                amountCents={Math.round(plan.price * 100)}
                currency={plan.currency || 'USD'}
                email={email}
                customerName={customerName}
                customerPhone={customerPhone}
                enabled={canEnablePayment} // Only enable after profile is confirmed
                onInvalidClick={() => {
                  if (!userId) {
                    setCheckoutError('Please sign in to enable payment options');
                  } else if (!canEnablePayment) {
                    setCheckoutError('Account setup required. Please wait or contact support.');
                  }
                }}
                onLoadingChange={(loading) => {
                  setIsLoading(loading);
                  // When loading is false, PRB buttons are ready
                  setIsPRBReady(!loading);
                }}
              />
            </>
          )}

          {/* Mobile Payment Request Button - Phase 1 only (hidden in Phase 2/3) */}
          {!useCheckoutFlow && isMobile && userId && canEnablePayment && (
            <div className="mb-4">
              <p className="font-body text-muted-foreground mb-4">
                Use Apple Pay or Google Pay for quick checkout, or proceed to full checkout page.
              </p>
              <MembershipPaymentRequestButton
                membershipPlanId={plan.id!}
                amountCents={Math.round(plan.price * 100)}
                currency={plan.currency || 'USD'}
                email={email}
                customerName={customerName}
                enabled={canEnablePayment && !isLoading}
                showPlaceholder={!canEnablePayment}
                onInvalidClick={() => {
                  if (!userId) {
                    router.push(`/sign-in?redirect_url=/membership/subscribe/${plan.id}`);
                  } else if (!canEnablePayment) {
                    setCheckoutError('Account setup required. Please wait or contact support.');
                  }
                }}
              />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">or</span>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Checkout Session redirect button */}
          {/* Phase 1 (useCheckoutFlow=false): Show as fallback option with divider */}
          {/* Phase 2/3 (useCheckoutFlow=true): Show as PRIMARY/ONLY payment option */}
          {canEnablePayment && (
            <>
              {/* Show divider only in Phase 1 when Payment Intent flow was shown above */}
              {!useCheckoutFlow && (isMobile || isPRBReady) && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-muted-foreground">or</span>
                  </div>
                </div>
              )}

              {/* Phase 2/3: Checkout-only messaging */}
              {useCheckoutFlow ? (
                <>
                  <p className="font-body text-muted-foreground mb-6">
                    You will be redirected to our secure Stripe Checkout page to complete your subscription. Stripe Checkout automatically shows Apple Pay, Google Pay, and other payment methods based on your device and browser.
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full flex-shrink-0 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title={isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    aria-label={isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                      {isLoading ? (
                        <svg className="animate-spin w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-orange-700">{isLoading ? 'Processing...' : 'Proceed to Checkout'}</span>
                  </button>
                  <p className="mt-3 text-sm text-muted-foreground text-center">
                    Stripe Checkout automatically optimizes for your device and shows Apple Pay, Google Pay, and Link when available
                  </p>
                </>
              ) : (
                <>
                  {/* Phase 1: Fallback messaging */}
                  <p className="font-body text-muted-foreground mb-6">
                    You will be redirected to our secure payment processor to complete your subscription.
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full flex-shrink-0 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title={isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    aria-label={isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                      {isLoading ? (
                        <svg className="animate-spin w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-orange-700">{isLoading ? 'Processing...' : 'Proceed to Checkout'}</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* Show message if payment not enabled */}
          {!canEnablePayment && userId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please wait while we set up your account, or contact support if this message persists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



