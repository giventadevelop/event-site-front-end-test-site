'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlanFeaturesList } from '@/components/membership/PlanFeaturesList';
import { MembershipPaymentRequestButton } from '@/components/membership/MembershipPaymentRequestButton';
import { createSubscriptionCheckoutSessionServer } from '../subscribe/[planId]/ApiServerActions';
import { cancelSubscriptionServer } from '../manage/ApiServerActions';
import type { MembershipPlanDTO, MembershipSubscriptionDTO } from '@/types';

interface MembershipPlansClientProps {
  plans: MembershipPlanDTO[];
  error: string | null;
  userSubscription?: MembershipSubscriptionDTO | null;
  isAuthenticated?: boolean;
  hasUserProfile?: boolean;
}

export function MembershipPlansClient({ plans, error, userSubscription, isAuthenticated: serverIsAuthenticated = false, hasUserProfile: serverHasUserProfile = false }: MembershipPlansClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cancelingSubscriptionId, setCancelingSubscriptionId] = useState<number | null>(null);
  const [clientHasUserProfile, setClientHasUserProfile] = useState<boolean | null>(null);
  const [showCanceledMessage, setShowCanceledMessage] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<number | null>(null);

  // Check for canceled parameter in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canceled = searchParams?.get('canceled');
      if (canceled === 'true') {
        setShowCanceledMessage(true);
        // Clear the URL parameter after showing the message
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('canceled');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams]);

  // Check user profile status client-side (in case user signs in after page load)
  useEffect(() => {
    async function checkUserProfile() {
      if (userId && isUserLoaded) {
        try {
          const response = await fetch(`/api/proxy/user-profiles/by-user/${userId}`, {
            cache: 'no-store',
          });
          if (response.ok) {
            const profile = await response.json();
            setClientHasUserProfile(!!profile?.id);
          } else {
            setClientHasUserProfile(false);
          }
        } catch (err) {
          console.error('[MEMBERSHIP] Error checking user profile:', err);
          setClientHasUserProfile(false);
        }
      } else {
        setClientHasUserProfile(false);
      }
    }

    if (isUserLoaded) {
      checkUserProfile();
    }
  }, [userId, isUserLoaded]);

  // Determine authentication and profile status (prefer client-side if available)
  const isAuthenticated = userId !== null || serverIsAuthenticated;
  const hasUserProfile = clientHasUserProfile !== null ? clientHasUserProfile : serverHasUserProfile;

  // Detect mobile device
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      const userAgent = navigator.userAgent || '';
      const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
      const narrowScreenMatch = window.innerWidth <= 768;
      setIsMobile(mobileRegexMatch || narrowScreenMatch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getBillingIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'MONTHLY':
        return 'per month';
      case 'QUARTERLY':
        return 'per quarter';
      case 'YEARLY':
        return 'per year';
      case 'ONE_TIME':
        return 'one-time';
      default:
        return '';
    }
  };

  const handleSubscribe = async (plan: MembershipPlanDTO) => {
    try {
      setIsLoading(plan.id!);
      setCheckoutError(null);

      // Check if user is authenticated
      if (!userId) {
        router.push(`/sign-in?redirect_url=/membership/plans`);
        return;
      }

      const successUrl = `${window.location.origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/membership/plans?canceled=true`;

      const { sessionUrl } = await createSubscriptionCheckoutSessionServer(
        plan.id!,
        successUrl,
        cancelUrl
      );
      window.location.href = sessionUrl;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setIsLoading(null);
    }
  };

  const toggleExpand = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleCancelClick = (subscriptionId: number) => {
    setSubscriptionToCancel(subscriptionId);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel) return;

    try {
      setCancelingSubscriptionId(subscriptionToCancel);
      setShowCancelDialog(false);
      await cancelSubscriptionServer(subscriptionToCancel, 'Cancelled by user from membership page');
      router.refresh();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelingSubscriptionId(null);
      setSubscriptionToCancel(null);
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setSubscriptionToCancel(null);
  };

  // Check if user is subscribed to a specific plan
  const isSubscribedToPlan = (planId: number | null | undefined): boolean => {
    if (!planId || !userSubscription) return false;
    return userSubscription.membershipPlanId === planId &&
      userSubscription.subscriptionStatus === 'ACTIVE' &&
      !userSubscription.cancelAtPeriodEnd;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
    <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header Section */}
      <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Membership Plans
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-3xl mx-auto">
          Choose the membership plan that works best for you. All plans include access to our premium features.
        </p>
      </div>

        {/* Canceled Message */}
        {showCanceledMessage && (
          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Payment Canceled
                </h3>
                <p className="text-amber-800 mb-4">
                  Your payment was canceled. No charges were made. You can try again by selecting a plan below.
                </p>
                <button
                  onClick={() => setShowCanceledMessage(false)}
                  className="text-amber-700 hover:text-amber-900 font-medium underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informational Box: Authentication & Registration Status */}
        {isUserLoaded && (
          <div className="mb-8">
            {!isAuthenticated ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Sign In Required to Subscribe
                    </h3>
                    <p className="text-blue-800 mb-4">
                      To subscribe to a membership plan, you need to be signed in. If you don't have an account yet, you'll be redirected to the sign-up page when you click "Subscribe". You can also sign in or create an account now using the buttons below.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => router.push('/sign-in?redirect_url=/membership/plans')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => router.push('/sign-up?redirect_url=/membership/plans')}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !hasUserProfile ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                      Complete Your Registration
                    </h3>
                    <p className="text-amber-800 mb-4">
                      You're signed in, but your account registration is not complete. Please complete your profile registration before subscribing to a membership plan. You'll be redirected to complete your registration when you click "Subscribe", or you can complete it now using the button below.
                    </p>
                    <Button
                      onClick={() => router.push(`/profile?redirect_url=/membership/plans`)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Complete Registration
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Error Message */}
        {checkoutError && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-body">{checkoutError}</p>
          </div>
        )}

        {/* Membership Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="font-body text-muted-foreground">No membership plans available at this time.</p>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => {
              // Parse features and filter out invalid entries (like curly braces, empty values, "0", etc.)
              let features: Array<{ key: string; value: string }> = [];
              if (plan.featuresJson) {
                try {
                  const featuresObj = typeof plan.featuresJson === 'string'
                    ? JSON.parse(plan.featuresJson)
                    : plan.featuresJson;

                  features = Object.entries(featuresObj)
                    .filter(([key, value]) => {
                      // Filter out invalid entries
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
                } catch (e) {
                  console.error('Error parsing featuresJson:', e);
                  features = [];
                }
              }

              const isEgyptPlan = plan.planCode?.toLowerCase().includes('egypt') ||
                plan.planName?.toLowerCase().includes('egypt');
              const isExpanded = expandedPlanId === plan.id;
              const isLoadingPlan = isLoading === plan.id;

              // Color scheme based on plan type or index
              const colorSchemes = [
                { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200', accent: 'bg-blue-500', text: 'text-blue-700' },
                { bg: 'bg-gradient-to-br from-green-50 to-green-100', border: 'border-green-200', accent: 'bg-green-500', text: 'text-green-700' },
                { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-200', accent: 'bg-purple-500', text: 'text-purple-700' },
                { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-200', accent: 'bg-orange-500', text: 'text-orange-700' },
              ];
              const colorScheme = colorSchemes[(plan.id || 0) % colorSchemes.length];

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col h-full hover:shadow-xl transition-all duration-300 ${colorScheme.bg} ${colorScheme.border} border-2 rounded-xl shadow-md overflow-hidden`}
                >
                  <CardHeader className={`${colorScheme.accent} bg-opacity-10 pb-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className={`font-heading text-2xl ${colorScheme.text} mb-2`}>
                          {plan.planName}
                        </CardTitle>
                        {plan.description && (
                          <CardDescription className="font-body text-muted-foreground">
                            {plan.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-6">
                    {/* Price Section */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${colorScheme.text}`}>
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getBillingIntervalLabel(plan.billingInterval)}
                        </span>
                      </div>
                      {/* Only show trial days if > 0 */}
                      {plan.trialDays != null && plan.trialDays > 0 ? (
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold ${colorScheme.accent} text-white rounded-full`}>
                            {plan.trialDays} day{plan.trialDays !== 1 ? 's' : ''} free trial
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Features List */}
                    {features.length > 0 && (
                      <div className="mb-4">
                        <PlanFeaturesList features={features} />
                      </div>
                    )}

                    {/* Additional Details for Egypt Plan or Expanded Plans */}
                    {(isEgyptPlan || isExpanded) && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-body text-sm font-semibold text-foreground">Plan Type</p>
                              <p className="font-body text-sm text-muted-foreground">{plan.planType}</p>
                            </div>
                          </div>

                          {plan.maxEventsPerMonth && plan.maxEventsPerMonth > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                                {getBillingIntervalLabel(plan.billingInterval)} • {plan.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show More/Less Button for Non-Egypt Plans */}
                    {!isEgyptPlan && (
                      <button
                        onClick={() => toggleExpand(plan.id!)}
                        className="mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                            Show Less
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            Show More Details
                          </>
                        )}
                      </button>
                    )}
                  </CardContent>

                  <CardFooter className="pt-6 px-6 pb-6 flex flex-col gap-4">
                    {/* Check if user is subscribed to this plan */}
                    {isSubscribedToPlan(plan.id) && userSubscription?.id ? (
                      <>
                        {/* Already Subscribed - Show Info Box */}
                        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-body text-green-800 text-center">
                              You are currently subscribed to this plan
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCancelClick(userSubscription.id!)}
                          disabled={cancelingSubscriptionId === userSubscription.id}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                          variant="destructive"
                        >
                          {cancelingSubscriptionId === userSubscription.id ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Canceling...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Subscription
                            </span>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Mobile Payment Request Button */}
                        {isMobile && userId && (
                          <MembershipPaymentRequestButton
                            membershipPlanId={plan.id!}
                            amountCents={Math.round(plan.price * 100)}
                            currency={plan.currency || 'USD'}
                            email={user?.emailAddresses?.[0]?.emailAddress}
                            customerName={user?.fullName || undefined}
                            enabled={!!userId && !isLoadingPlan}
                            showPlaceholder={!userId}
                            onInvalidClick={() => {
                              if (!userId) {
                                router.push(`/sign-in?redirect_url=/membership/plans`);
                              }
                            }}
                          />
                        )}

                        {/* Desktop Subscribe Button - Navigate to subscribe page with Stripe Elements */}
                        <button
                          onClick={() => {
                            // Check if user is authenticated
                            if (!userId) {
                              router.push(`/sign-in?redirect_url=/membership/subscribe/${plan.id}`);
                              return;
                            }
                            // Navigate to subscribe page where Stripe Elements are shown inline
                            router.push(`/membership/subscribe/${plan.id}`);
                          }}
                          disabled={isLoadingPlan}
                          className="w-full flex-shrink-0 h-14 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 border-2 border-orange-600 hover:border-orange-700 shadow-md hover:shadow-lg"
                          title="Subscribe Now"
                          aria-label="Subscribe Now"
                          type="button"
                        >
                          {isLoadingPlan ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="font-semibold text-white">Processing...</span>
                            </span>
                          ) : (
                            <>
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-white">Subscribe Now</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      )}

        {/* Membership Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-border">
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
            Membership Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Exclusive Access
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Get early access to events, workshops, and special programs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Member Discounts
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Enjoy special pricing on events, merchandise, and services
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Community Network
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Connect with like-minded individuals and expand your network
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Priority Support
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Receive priority customer support and assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period, after which you will lose access to premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 sm:gap-4">
            <AlertDialogCancel
              onClick={handleCancelDialogClose}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">Keep Subscription</span>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={cancelingSubscriptionId !== null}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                {cancelingSubscriptionId ? (
                  <svg className="animate-spin w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-red-700">{cancelingSubscriptionId ? 'Cancelling...' : 'Cancel Subscription'}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
