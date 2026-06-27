"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

type Props = {
  membershipPlanId: number;
  email?: string;
  customerName?: string;
  customerPhone?: string;
  enabled: boolean;
  amountCents: number;
  currency?: string;
  publishableKey?: string;
  onInvalidClick?: () => void;
  onLoadingChange?: (loading: boolean) => void;
};

// Default Stripe promise (fallback for backward compatibility)
const defaultStripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// CRITICAL FIX: Memoize Inner component to prevent unnecessary re-renders
const InnerMembershipCheckout = React.memo(function InnerMembershipCheckout({
  membershipPlanId,
  email,
  customerName,
  customerPhone,
  amountCents,
  clientSecret,
  onLoadingChange,
}: Props & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // CRITICAL: Detect mobile to hide ExpressCheckoutElement (use PaymentRequestButton instead)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const mobileWidth = window.innerWidth <= 768;
      const isMobileDetected = mobileUA || mobileWidth;
      setIsMobile(isMobileDetected);
      console.log('[MEMBERSHIP-DESKTOP] Mobile detection:', { mobileUA, mobileWidth, isMobile: isMobileDetected });

      if (isMobileDetected) {
        console.log('[MEMBERSHIP-DESKTOP] Mobile detected - skipping ExpressCheckoutElement');
        setExpressCheckoutReady(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add timeout to prevent stuck loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!expressCheckoutReady) {
        console.warn('[MEMBERSHIP-DESKTOP] Express Checkout timeout, forcing ready state');
        setExpressCheckoutReady(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [expressCheckoutReady]);

  // Notify parent component of loading state changes
  const onLoadingChangeRef = useRef(onLoadingChange);
  useEffect(() => {
    onLoadingChangeRef.current = onLoadingChange;
  }, [onLoadingChange]);

  useEffect(() => {
    onLoadingChangeRef.current?.(!expressCheckoutReady);
  }, [expressCheckoutReady]);

  const handleConfirm = async () => {
    if (!stripe || !elements || !clientSecret) return;

    if (confirming) {
      console.log('[MEMBERSHIP-DESKTOP] Payment confirmation already in progress');
      return;
    }

    setConfirming(true);

    try {
      console.log('[MEMBERSHIP-DESKTOP] Submitting elements for validation...');
      const { error: submitError } = await elements.submit();

      if (submitError) {
        if (!submitError.type && !submitError.message) {
          console.warn("[MEMBERSHIP-DESKTOP] Payment validation failed: No payment method selected");
          setValidationErrors(['Please select a payment method before proceeding']);
          setShowValidationErrors(true);
          setConfirming(false);
          return;
        }

        console.error("[MEMBERSHIP-DESKTOP] Elements validation failed:", submitError);
        const errors: string[] = [];

        if (submitError.type === 'validation_error') {
          const message = submitError.message || '';
          if (message.toLowerCase().includes('card number')) {
            errors.push('Card number is required');
          }
          if (message.toLowerCase().includes('expir')) {
            errors.push('Expiration date is required');
          }
          if (message.toLowerCase().includes('cvc') || message.toLowerCase().includes('security')) {
            errors.push('Security code (CVC) is required');
          }
          if (message.toLowerCase().includes('postal') || message.toLowerCase().includes('zip')) {
            errors.push('ZIP code is required');
          }
          if (errors.length === 0) {
            errors.push(message || 'Please complete all required payment fields');
          }
        } else {
          errors.push(submitError.message || 'Please check your payment details and try again.');
        }

        setValidationErrors(errors);
        setShowValidationErrors(true);
        setConfirming(false);
        return;
      }

      console.log('[MEMBERSHIP-DESKTOP] Elements validation successful, confirming payment...');
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
      });

      if ((result as any)?.error) {
        console.error("[MEMBERSHIP-DESKTOP] confirmPayment error:", (result as any).error);
        const paymentError = (result as any).error;
        let errorMessage = "Payment failed. Please try again.";

        if (paymentError?.type === 'card_error') {
          errorMessage = paymentError.message || "Card payment failed. Please check your card details.";
        } else if (paymentError?.type === 'api_error') {
          errorMessage = "Payment service error. Please try again later.";
        }

        alert(errorMessage);
        setConfirming(false);
      } else {
        console.log("[MEMBERSHIP-DESKTOP] Payment confirmed successfully:", result);

        // Extract Payment Intent ID and redirect to membership success page
        const paymentIntent = (result as any)?.paymentIntent;
        if (paymentIntent?.id) {
          console.log("[MEMBERSHIP-DESKTOP] Redirecting to membership success page with Payment Intent ID:", paymentIntent.id);
          window.location.href = `/membership/success?pi=${paymentIntent.id}`;
          return;
        } else {
          // Fallback: extract from clientSecret
          const paymentIntentId = clientSecret?.split('_secret_')[0] || null;
          if (paymentIntentId) {
            console.log("[MEMBERSHIP-DESKTOP] Using clientSecret to extract Payment Intent ID:", paymentIntentId);
            window.location.href = `/membership/success?pi=${paymentIntentId}`;
            return;
          } else {
            console.warn("[MEMBERSHIP-DESKTOP] No Payment Intent ID found, redirecting to success page");
            window.location.href = '/membership/success';
            return;
          }
        }
      }
    } catch (e: any) {
      console.error("[MEMBERSHIP-DESKTOP] confirmPayment threw:", e);
      alert(e?.message || "Payment failed. Please try again.");
      setConfirming(false);
    }
  };

  // Render Express Checkout Element if available
  return (
    <div className="w-full relative">
      {/* Loading overlay while Express Checkout initializes - DESKTOP ONLY */}
      {!isMobile && !expressCheckoutReady && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-lg" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading payment options...</p>
            <p className="text-xs text-gray-500 mt-1">Apple Pay, Google Pay, Link, Cash App</p>
          </div>
        </div>
      )}

      {/* Express Checkout Section - DESKTOP ONLY */}
      {!isMobile && (
        <div className="relative">
          {/* Custom CSS for Stripe Link button to match admin action buttons pattern */}
          <style dangerouslySetInnerHTML={{
            __html: `
              #link-branded-root button {
                height: 56px !important;
                border-radius: 12px !important;
                background-color: rgb(254 243 199) !important; /* orange-100 */
                border: none !important;
                transition: all 0.3s ease !important;
              }
              #link-branded-root button:hover {
                background-color: rgb(253 230 138) !important; /* orange-200 */
                transform: scale(1.05) !important;
              }
              #link-branded-root button:active {
                transform: scale(0.98) !important;
              }
            `
          }} />
          {/* @ts-ignore */}
          <ExpressCheckoutElement
            onConfirm={async (event: any) => {
              console.log('[MEMBERSHIP-DESKTOP] ⚡ EXPRESS CHECKOUT onConfirm TRIGGERED');

              if (!elements) {
                console.error('[MEMBERSHIP-DESKTOP] ❌ Elements not available');
                alert("Payment system not ready. Please refresh the page and try again.");
                return;
              }

              try {
                const { error: submitError } = await elements.submit();

                if (submitError) {
                  console.error("[MEMBERSHIP-DESKTOP] Express Checkout validation failed:", submitError);
                  alert("Please check your payment details and try again.");
                  return;
                }

                console.log('[MEMBERSHIP-DESKTOP] Express Checkout validation successful, confirming payment...');
                const result = await stripe?.confirmPayment({
                  elements,
                  clientSecret,
                  redirect: 'if_required',
                });

                if ((result as any)?.error) {
                  console.error("[MEMBERSHIP-DESKTOP] Express Checkout payment failed:", (result as any).error);
                  alert((result as any).error?.message || "Payment failed. Please try again.");
                } else {
                  console.log("[MEMBERSHIP-DESKTOP] Express Checkout payment confirmed");
                  const paymentIntent = (result as any)?.paymentIntent;
                  if (paymentIntent?.id) {
                    window.location.href = `/membership/success?pi=${paymentIntent.id}`;
                  } else {
                    const paymentIntentId = clientSecret?.split('_secret_')[0];
                    if (paymentIntentId) {
                      window.location.href = `/membership/success?pi=${paymentIntentId}`;
                    } else {
                      window.location.href = '/membership/success';
                    }
                  }
                }
              } catch (e: any) {
                console.error("[MEMBERSHIP-DESKTOP] Express Checkout error:", e);
                alert(e?.message || "Payment failed. Please try again.");
              }
            }}
            onReady={() => {
              console.log('[MEMBERSHIP-DESKTOP] Express Checkout Element ready');
              setExpressCheckoutReady(true);
            }}
            onError={(event: any) => {
              console.error('[MEMBERSHIP-DESKTOP] Express Checkout Element error:', event);
            }}
          />
        </div>
      )}

      {/* Validation Errors */}
      {showValidationErrors && validationErrors.length > 0 && (
        <div className="validation-errors-container mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-sm text-red-700">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Payment Element (Card Form) */}
      <div className="mt-4">
        <PaymentElement
          onReady={() => {
            console.log('[MEMBERSHIP-DESKTOP] Payment Element ready');
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleConfirm}
        disabled={!stripe || !elements || confirming || !expressCheckoutReady}
        className={`mt-6 w-full flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
          !stripe || !elements || confirming || !expressCheckoutReady
            ? 'bg-gray-100 hover:bg-gray-200'
            : 'bg-orange-100 hover:bg-orange-200'
        }`}
        title={confirming ? 'Processing...' : 'Subscribe'}
        aria-label={confirming ? 'Processing...' : 'Subscribe'}
        type="button"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
          !stripe || !elements || confirming || !expressCheckoutReady
            ? 'bg-gray-200'
            : 'bg-orange-200'
        }`}>
          {confirming ? (
            <svg className="animate-spin w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className={`w-6 h-6 ${
              !stripe || !elements || confirming || !expressCheckoutReady
                ? 'text-gray-600'
                : 'text-orange-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <span className={`font-semibold ${
          !stripe || !elements || confirming || !expressCheckoutReady
            ? 'text-gray-700'
            : 'text-orange-700'
        }`}>
          {confirming ? 'Processing...' : (() => {
            const amount = amountCents / 100;
            return `Subscribe for ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(amount)}`;
          })()}
        </span>
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for membershipPlanId and amountCents
  return (
    prevProps.membershipPlanId === nextProps.membershipPlanId &&
    prevProps.amountCents === nextProps.amountCents &&
    prevProps.email === nextProps.email &&
    prevProps.enabled === nextProps.enabled &&
    prevProps.clientSecret === nextProps.clientSecret
  );
});

export default function MembershipDesktopCheckout(props: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showTimeoutError, setShowTimeoutError] = useState(false); // Timeout error state
  const createdPiRef = useRef<string | null>(null); // Track created Payment Intent ID to prevent duplicates
  const clientSecretRef = useRef<string | null>(null); // CRITICAL: Store clientSecret in ref to persist across re-renders

  // Use backend-provided publishable key or fallback to env var
  const publishableKey = props.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      console.warn('[MEMBERSHIP-DESKTOP] No publishable key provided');
      return defaultStripePromise;
    }
    return loadStripe(publishableKey);
  }, [publishableKey]);

  // CRITICAL: Restore clientSecret from ref on mount (handles React Strict Mode re-renders)
  useEffect(() => {
    if (!clientSecret && clientSecretRef.current && createdPiRef.current) {
      console.log("[MEMBERSHIP-DESKTOP] Restoring clientSecret from ref on mount");
      setClientSecret(clientSecretRef.current);
    }
  }, []); // Run only on mount

  // CRITICAL: Use ref for cancelled flag to persist across re-renders
  const cancelledRef = useRef(false);

  // Create Payment Intent for membership subscription
  // CRITICAL: Create Payment Intent only once when enabled becomes true
  // Don't recreate when email/customerName/customerPhone change (they're optional and don't affect idempotency)
  useEffect(() => {
    // Reset cancelled flag for this effect run
    cancelledRef.current = false;

    // CRITICAL: If Payment Intent already created and clientSecret exists (in state or ref), don't recreate
    // This prevents duplicate creation on re-renders (React Strict Mode, navigation, etc.)
    if (createdPiRef.current && (clientSecret || clientSecretRef.current)) {
      // Restore clientSecret from ref if state was lost
      if (!clientSecret && clientSecretRef.current) {
        console.log("[MEMBERSHIP-DESKTOP] Restoring clientSecret from ref after re-render");
        setClientSecret(clientSecretRef.current);
      }
      console.log("[MEMBERSHIP-DESKTOP] Payment Intent already created, skipping duplicate creation");
      return;
    }

    async function createPi() {
      if (!props.enabled) {
        setClientSecret(null);
        clientSecretRef.current = null;
        createdPiRef.current = null;
        return;
      }

      // CRITICAL: Prevent duplicate creation - check ref before starting
      // Use a more robust check that persists across re-renders
      // Check for any value (Payment Intent ID, 'creating', or 'created')
      if (createdPiRef.current) {
        console.log("[MEMBERSHIP-DESKTOP] Payment Intent creation already in progress or completed:", createdPiRef.current);
        return;
      }

      // CRITICAL: Don't wait for email - create Payment Intent immediately if enabled
      // Email can be empty initially and will be added when Clerk user loads
      // This matches the event checkout pattern where Payment Intent is created as soon as enabled=true

      // Mark as creating to prevent duplicate attempts
      createdPiRef.current = 'creating';
      setCreating(true);

      try {
        console.log("[MEMBERSHIP-DESKTOP] Creating Payment Intent:", {
          membershipPlanId: props.membershipPlanId,
          email: props.email || '(will be added when Clerk user loads)',
          amountCents: props.amountCents,
          enabled: props.enabled,
        });

        const res = await fetch("/api/stripe/membership-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            membershipPlanId: props.membershipPlanId,
            email: props.email || undefined, // Allow empty email - will be added later
            customerName: props.customerName,
            customerPhone: props.customerPhone,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[MEMBERSHIP-DESKTOP] PI creation failed:", res.status, errorText);
          if (!cancelledRef.current) {
            createdPiRef.current = null; // Reset on error so it can retry
          }
          throw new Error(`Failed to create payment intent: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        console.log("[MEMBERSHIP-DESKTOP] Payment Intent API response:", {
          hasClientSecret: !!data.clientSecret,
          hasPaymentIntentId: !!data.paymentIntentId,
          status: data.status,
          keys: Object.keys(data),
        });

        // CRITICAL: Validate response has required fields
        if (!data.clientSecret) {
          console.error("[MEMBERSHIP-DESKTOP] ❌ Response missing clientSecret:", data);
          if (!cancelledRef.current) {
            createdPiRef.current = null;
            setClientSecret(null);
            clientSecretRef.current = null;
            setCreating(false);
          }
          return;
        }

        if (!cancelledRef.current) {
          // CRITICAL: Store clientSecret in both state and ref to persist across re-renders
          setClientSecret(data.clientSecret);
          clientSecretRef.current = data.clientSecret; // Store in ref for persistence
          createdPiRef.current = data.paymentIntentId || 'created'; // Mark as created with Payment Intent ID
          setCreating(false); // Clear creating state immediately after setting clientSecret
          console.log("[MEMBERSHIP-DESKTOP] ✅ Payment Intent created successfully:", {
            paymentIntentId: data.paymentIntentId,
            clientSecret: data.clientSecret ? `${data.clientSecret.substring(0, 20)}...` : 'null',
            hasClientSecret: !!data.clientSecret,
            stateUpdated: true,
          });
        } else {
          console.log("[MEMBERSHIP-DESKTOP] Component cancelled before setting clientSecret");
          setCreating(false);
        }
      } catch (e) {
        if (!cancelledRef.current) {
          setClientSecret(null);
          clientSecretRef.current = null;
          createdPiRef.current = null; // Reset on error so it can retry
          console.error("[MEMBERSHIP-DESKTOP] ❌ PI creation failed:", e);
        }
      } finally {
        if (!cancelledRef.current) {
          setCreating(false);
        }
      }
    }
    createPi();
    return () => {
      cancelledRef.current = true;
      console.log("[MEMBERSHIP-DESKTOP] Effect cleanup - marking as cancelled");
    };
  }, [props.enabled, props.amountCents, props.membershipPlanId]); // CRITICAL: Removed email, customerName, customerPhone from dependencies to prevent duplicate creation

  const options = useMemo(
    () => ({ appearance: { theme: "stripe" }, clientSecret: clientSecret || undefined }),
    [clientSecret]
  );

  if (!props.enabled) {
    return (
      <div role="button" onClick={() => props.onInvalidClick?.()} className="opacity-60 cursor-not-allowed">
        <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white">
          Payment options unavailable until form is valid
        </div>
      </div>
    );
  }

  // CRITICAL: Add timeout fallback - if Payment Intent creation takes too long, show error
  useEffect(() => {
    if (creating && !clientSecret) {
      const timeout = setTimeout(() => {
        setShowTimeoutError(true);
        console.error("[MEMBERSHIP-DESKTOP] Payment Intent creation timeout - taking too long");
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    } else {
      setShowTimeoutError(false);
    }
  }, [creating, clientSecret]);

  if (!clientSecret) {
    return (
      <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white">
        {showTimeoutError ? (
          <div>
            <p className="text-red-600 font-semibold mb-2">Payment setup taking longer than expected</p>
            <p className="text-sm">Please refresh the page to retry.</p>
          </div>
        ) : creating ? (
          'Preparing payment…'
        ) : (
          'Payment not ready'
        )}
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white">
        Stripe is not configured. Please provide a publishable key.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options as any}>
      {/* @ts-ignore */}
      <InnerMembershipCheckout {...props} clientSecret={clientSecret || undefined} />
    </Elements>
  );
}


