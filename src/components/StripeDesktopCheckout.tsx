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

type CartItem = {
  ticketType: { id: number };
  quantity: number;
};

type Props = {
  cart: CartItem[];
  eventId: number | string;
  email?: string;
  discountCodeId?: number | null;
  enabled: boolean;
  amountCents: number;
  publishableKey?: string; // Backend-provided publishable key (domain-agnostic)
  clientSecret?: string; // Backend-provided client secret (skip PaymentIntent creation)
  transactionId?: string; // Backend transaction ID for success page lookup
  onInvalidClick?: () => void;
  onLoadingChange?: (loading: boolean) => void;
};

// Default Stripe promise (fallback for backward compatibility)
const defaultStripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// CRITICAL FIX: Memoize Inner component to prevent unnecessary re-renders and flickering
// React.memo prevents this component from re-rendering when parent re-renders
// unless the actual props have changed (deep comparison for cart, shallow for others)
const InnerDesktopCheckout = React.memo(function InnerDesktopCheckout({ cart, eventId, email, discountCodeId, clientSecret, transactionId, onLoadingChange }: Props & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState(false);
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
      console.log('[DESKTOP ECE] Mobile detection:', { mobileUA, mobileWidth, isMobile: isMobileDetected });

      // CRITICAL: On mobile, skip ExpressCheckoutElement loading - set ready immediately
      if (isMobileDetected) {
        console.log('[DESKTOP ECE] Mobile detected - skipping ExpressCheckoutElement, setting ready state');
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
        console.warn('[DESKTOP ECE] Express Checkout timeout, forcing ready state');
        setExpressCheckoutReady(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [expressCheckoutReady]);

  // Notify parent component of loading state changes
  // CRITICAL FIX: Use ref to prevent callback dependency from causing re-runs
  // onLoadingChange callback reference might change, but we only care about expressCheckoutReady
  const onLoadingChangeRef = useRef(onLoadingChange);
  useEffect(() => {
    onLoadingChangeRef.current = onLoadingChange;
  }, [onLoadingChange]);

  useEffect(() => {
    onLoadingChangeRef.current?.(!expressCheckoutReady);
  }, [expressCheckoutReady]); // Only depend on expressCheckoutReady, not the callback

  const handleConfirm = async () => {
    if (!stripe || !elements || !clientSecret) return;

    // Prevent double submission
    if (confirming) {
      console.log('[DESKTOP ECE] Payment confirmation already in progress, ignoring duplicate click');
      return;
    }

    setConfirming(true);

    try {
      // CRITICAL: Call elements.submit() first for validation
      console.log('[DESKTOP ECE] Submitting elements for validation...');
      const { error: submitError } = await elements.submit();

      if (submitError) {
        // Handle empty error object case (common when no payment method selected)
        if (!submitError.type && !submitError.message) {
          console.warn("[DESKTOP ECE] Payment validation failed: No payment method selected");
          setValidationErrors(['Please select a payment method before proceeding']);
          setShowValidationErrors(true);
          setConfirming(false);
          return;
        }

        // Log the actual error details for debugging
        console.error("[DESKTOP ECE] Elements validation failed:", {
          type: submitError.type || 'unknown',
          message: submitError.message || 'No message provided',
          code: submitError.code || 'No code provided',
          fullError: submitError
        });

        // Parse validation errors to provide specific field feedback
        const errors: string[] = [];

        if (submitError.type === 'validation_error') {
          const message = submitError.message || '';

          // Check for common missing fields based on error message
          if (message.toLowerCase().includes('card number') || message.toLowerCase().includes('card_number')) {
            errors.push('Card number is required');
          }
          if (message.toLowerCase().includes('expir') || message.toLowerCase().includes('expiry')) {
            errors.push('Expiration date is required');
          }
          if (message.toLowerCase().includes('cvc') || message.toLowerCase().includes('security') || message.toLowerCase().includes('cvv')) {
            errors.push('Security code (CVC) is required');
          }
          if (message.toLowerCase().includes('postal') || message.toLowerCase().includes('zip') || message.toLowerCase().includes('postal_code')) {
            errors.push('ZIP code is required');
          }
          if (message.toLowerCase().includes('payment_method') || message.toLowerCase().includes('method')) {
            errors.push('Please select a payment method before proceeding');
          }

          // If no specific errors found, use generic message
          if (errors.length === 0) {
            errors.push(message || 'Please complete all required payment fields');
          }
        } else if (submitError.type === 'card_error') {
          errors.push(submitError.message || 'Card validation failed. Please check your details.');
        } else if (submitError.type === 'api_error') {
          errors.push('Payment service error. Please try again.');
        } else {
          errors.push(submitError.message || 'Please check your payment details and try again.');
        }

        // Show validation errors in UI instead of alert
        // CRITICAL FIX: Removed manual DOM manipulation of Stripe Elements
        // Stripe Elements are in an iframe - we can't access their internal DOM
        // Let Stripe handle its own validation and error display
        setValidationErrors(errors);
        setShowValidationErrors(true);

        // Scroll to validation errors container
        setTimeout(() => {
          const errorElement = document.querySelector('.validation-errors-container');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);

        setConfirming(false);
        return;
      }

      console.log('[DESKTOP ECE] Elements validation successful, confirming payment...');
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required', // Use redirect: 'if_required' instead of return_url
      });

      if ((result as any)?.error) {
        console.error("[DESKTOP ECE] confirmPayment error:", (result as any).error || result);

        // Provide more specific error messages for payment confirmation failures
        let errorMessage = "Payment failed. Please try again.";
        const paymentError = (result as any).error;

        if (paymentError?.type === 'card_error') {
          errorMessage = paymentError.message || "Card payment failed. Please check your card details.";
        } else if (paymentError?.type === 'validation_error') {
          errorMessage = paymentError.message || "Payment validation failed. Please check your details.";
        } else if (paymentError?.type === 'api_error') {
          errorMessage = "Payment service error. Please try again later.";
        } else if (paymentError?.code === 'payment_intent_unexpected_state') {
          // Payment already processed - try to redirect to success page
          errorMessage = "Payment already processed. Please check your email for confirmation.";

          // Build success URL with transactionId if available (preferred), otherwise use Payment Intent ID
          const params = new URLSearchParams();
          if (transactionId) {
            params.set('transactionId', transactionId);
            console.log("[DESKTOP ECE] Payment already processed, redirecting with transactionId:", transactionId);
          } else {
            // Extract Payment Intent ID from clientSecret if available
            const paymentIntentId = clientSecret?.split('_secret_')[0] || null;
            if (paymentIntentId) {
              params.set('pi', paymentIntentId);
              console.log("[DESKTOP ECE] Payment already processed, redirecting with Payment Intent ID:", paymentIntentId);
            }
          }
          if (eventId) params.set('eventId', String(eventId));
          if (params.toString()) {
            // Keep confirming state true during redirect
            window.location.href = `/event/success?${params.toString()}`;
            return; // Don't reset confirming state, redirect will happen
          }
        }

        alert(errorMessage);
        setConfirming(false);
      } else {
        console.log("[DESKTOP ECE] Payment confirmed successfully:", result);

        // Extract Payment Intent ID from result and redirect to success page
        const paymentIntent = (result as any)?.paymentIntent;
        if (paymentIntent?.id) {
          console.log("[DESKTOP ECE] Payment confirmed successfully, redirecting to success page with Payment Intent ID:", paymentIntent.id);
          // Build success URL with transactionId if available (preferred), otherwise use Payment Intent ID
          const params = new URLSearchParams();
          if (transactionId) {
            params.set('transactionId', transactionId);
            console.log("[DESKTOP ECE] Using transactionId for success page:", transactionId);
          } else {
            params.set('pi', paymentIntent.id);
            console.log("[DESKTOP ECE] Using Payment Intent ID for success page lookup:", paymentIntent.id);
          }
          if (eventId) params.set('eventId', String(eventId));
          // CRITICAL: Keep confirming state true during redirect - don't reset it
          // The redirect will happen immediately, keeping the button in "Processing" state
          window.location.href = `/event/success?${params.toString()}`;
          // Don't reset confirming state here - let redirect happen while button shows "Processing"
          return;
        } else {
          // Fallback: try to extract from clientSecret
          const paymentIntentIdFromSecret = clientSecret?.split('_secret_')[0] || null;
          if (paymentIntentIdFromSecret) {
            console.log("[DESKTOP ECE] No Payment Intent in result, using clientSecret to extract ID:", paymentIntentIdFromSecret);
            const params = new URLSearchParams();
            if (transactionId) {
              params.set('transactionId', transactionId);
            } else {
              params.set('pi', paymentIntentIdFromSecret);
            }
            if (eventId) params.set('eventId', String(eventId));
            // Keep confirming state during redirect
            window.location.href = `/event/success?${params.toString()}`;
            return;
          } else {
            console.warn("[DESKTOP ECE] No Payment Intent ID found in result or clientSecret");
            if (transactionId) {
              // If we have transactionId, use it directly
              const params = new URLSearchParams({ transactionId });
              if (eventId) params.set('eventId', String(eventId));
              // Keep confirming state during redirect
              window.location.href = `/event/success?${params.toString()}`;
              return;
            } else {
              console.warn("[DESKTOP ECE] No transactionId or Payment Intent ID, redirecting without parameters");
              // Keep confirming state during redirect
              window.location.href = '/event/success';
              return;
            }
          }
        }
      }
    } catch (e: any) {
      console.error("[DESKTOP ECE] confirmPayment threw:", e);

      // Handle specific error types
      let errorMessage = "Payment failed. Please try again.";

      if (e?.type === 'StripeInvalidRequestError') {
        errorMessage = "Invalid payment request. Please check your details.";
      } else if (e?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (e?.message) {
        errorMessage = e.message;
      }

      alert(errorMessage);
      setConfirming(false);
    }
    // Note: We don't reset confirming state in finally block for successful redirects
    // This keeps the button in "Processing" state until the redirect completes
  };

  // Handle cancellation more robustly
  const handleCancel = () => {
    console.log('[DESKTOP ECE] Payment cancelled by user');

    // Clear any pending payment state
    if (elements) {
      try {
        // Note: elements.clear() doesn't exist, we'll just reset the confirmation state
        console.log('[DESKTOP ECE] Elements state reset after cancellation');
      } catch (e) {
        console.log('[DESKTOP ECE] Error resetting elements state:', e);
      }
    }

    // Reset confirmation state
    setConfirming(false);

    // Prevent any redirects by updating the URL without navigation
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('cancelled', 'true');
      currentUrl.searchParams.set('timestamp', Date.now().toString());

      // Update URL without triggering navigation
      window.history.replaceState({}, '', currentUrl.toString());
      console.log('[DESKTOP ECE] URL updated to prevent redirect after cancellation');
    }

    // Optionally show a message to the user
    console.log('[DESKTOP ECE] Payment cancelled - user can try again');
  };

  // Render Express Checkout Element if available; provide a fallback Pay button using PaymentElement
  return (
    <div className="w-full relative">
      {/* Loading overlay while Express Checkout initializes - DESKTOP ONLY */}
      {/* CRITICAL: Don't show loading overlay on mobile - PaymentRequestButton handles its own loading */}
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
      {/* CRITICAL FIX: Hide ExpressCheckoutElement on mobile - use PaymentRequestButton instead */}
      {!isMobile && (
        <div className="relative">
          {/* @ts-ignore - element may lack TS in some versions */}
          <ExpressCheckoutElement
            onConfirm={async (event: any) => {
            console.log('[DESKTOP ECE] ⚡ EXPRESS CHECKOUT onConfirm TRIGGERED', {
              hasElements: !!elements,
              hasStripe: !!stripe,
              hasClientSecret: !!clientSecret,
              event,
              timestamp: new Date().toISOString(),
            });

            // CRITICAL: Call elements.submit() first for validation
            if (!elements) {
              console.error('[DESKTOP ECE] ❌ Elements not available for validation');
              alert("Payment system not ready. Please refresh the page and try again.");
              return;
            }

            try {
              console.log('[DESKTOP ECE] Express Checkout onConfirm - validating elements...');
              const { error: submitError } = await elements.submit();

              if (submitError) {
                // Handle empty error object case (common when no payment method selected)
                if (!submitError.type && !submitError.message) {
                  console.warn("[DESKTOP ECE] Express Checkout validation failed: No payment method selected");
                  alert("Please select a payment method before proceeding. You can choose from the Link, Cash App, or credit card options below.");
                  return;
                }

                // Log the actual error details for debugging
                console.error("[DESKTOP ECE] Express Checkout validation failed:", {
                  type: submitError.type || 'unknown',
                  message: submitError.message || 'No message provided',
                  code: submitError.code || 'No code provided',
                  fullError: submitError
                });

                // Provide specific error message for validation failures
                let errorMessage = "Please check your payment details and try again.";

                if (submitError.type === 'validation_error') {
                  if (submitError.message?.includes('payment_method') || submitError.message?.includes('method')) {
                    errorMessage = "Please select a payment method before proceeding.";
                  } else if (submitError.message?.includes('card')) {
                    errorMessage = "Please check your card details and try again.";
                  } else {
                    errorMessage = submitError.message || "Please complete all required fields.";
                  }
                } else if (submitError.type === 'card_error') {
                  errorMessage = submitError.message || "Card payment failed. Please check your card details.";
                } else if (submitError.type === 'api_error') {
                  errorMessage = "Payment service error. Please try again.";
                }

                alert(errorMessage);
                return;
              }

              console.log('[DESKTOP ECE] Elements validation successful for Express Checkout');
            } catch (e) {
              console.error("[DESKTOP ECE] Elements validation error for Express Checkout:", e);
              alert("Payment validation failed. Please try again.");
              return;
            }

            // Now proceed with the Express Checkout confirmation
            await handleConfirm();
          }}
          onCancel={handleCancel}
          onReady={({ availablePaymentMethods }) => {
            console.log('[DESKTOP ECE] ⚡ EXPRESS CHECKOUT READY', {
              timestamp: new Date().toISOString(),
              hasAvailablePaymentMethods: !!availablePaymentMethods,
              paymentMethodKeys: availablePaymentMethods ? Object.keys(availablePaymentMethods) : [],
            });
            console.log('[DESKTOP ECE] Available payment methods:', availablePaymentMethods);
            setExpressCheckoutReady(true);

            // Enhanced debugging for payment methods
            if (availablePaymentMethods) {
              console.log('[DESKTOP ECE] ========== PAYMENT METHODS DEBUG ==========');
              console.log('[DESKTOP ECE] Available methods:', Object.keys(availablePaymentMethods));

              // Check specific payment methods
              if (availablePaymentMethods.applePay) {
                console.log('[DESKTOP ECE] ✅ Apple Pay: Available');
              } else {
                console.log('[DESKTOP ECE] ❌ Apple Pay: Not available');
                console.log('[DESKTOP ECE]    - Requires HTTPS in production');
                console.log('[DESKTOP ECE]    - Requires supported browser (Safari, Chrome on MacOS)');
              }

              if (availablePaymentMethods.googlePay) {
                console.log('[DESKTOP ECE] ✅ Google Pay: Available');
              } else {
                console.log('[DESKTOP ECE] ❌ Google Pay: Not available');
                console.log('[DESKTOP ECE]    - Requires domain verification in Stripe Dashboard');
                console.log('[DESKTOP ECE]    - Requires HTTPS in production');
                console.log('[DESKTOP ECE]    - Requires supported browser (Chrome, Edge, Firefox)');
              }

              if (availablePaymentMethods.link) {
                console.log('[DESKTOP ECE] ✅ Link: Available');
              } else {
                console.log('[DESKTOP ECE] ❌ Link: Not available');
              }

              if (availablePaymentMethods.cashApp) {
                console.log('[DESKTOP ECE] ✅ Cash App: Available');
              } else {
                console.log('[DESKTOP ECE] ❌ Cash App: Not available');
              }

              if (availablePaymentMethods.amazonPay) {
                console.log('[DESKTOP ECE] ✅ Amazon Pay: Available');
              } else {
                console.log('[DESKTOP ECE] ❌ Amazon Pay: Not available');
              }

              console.log('[DESKTOP ECE] ============================================');
            } else {
              console.log('[DESKTOP ECE] ⚠️ WARNING: No payment methods available');
              console.log('[DESKTOP ECE] Check Stripe Dashboard → Settings → Payment methods');
            }

            // Log available payment methods for debugging
            console.log('[DESKTOP ECE] Note: Google Pay manifest errors in console are expected if domain not verified in Stripe');

            // Debug: Check what payment methods are available
            console.log('[DESKTOP ECE] Expected payment methods: Apple Pay, Google Pay, Link, Cash App, Amazon Pay');
            console.log('[DESKTOP ECE] If only Link/Cash App show, check Stripe domain verification for Google Pay');
          }}
          onClick={(event: any) => {
            console.log('[DESKTOP ECE] ⚡ EXPRESS CHECKOUT BUTTON CLICKED', {
              event,
              timestamp: new Date().toISOString(),
              eventType: event?.resolve ? 'resolve function available' : 'no resolve function',
            });
          }}
          options={{
            layout: 'horizontal' as any
          }}
        />
      </div>
      )}

      {/* PaymentElement Section */}
      <div className="mt-3 bg-white border rounded-lg p-3 relative">
        {/* Payment method selection status */}
        <div className="mb-3 text-sm">
          {paymentMethodSelected ? (
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              Payment method selected - Ready to proceed
            </div>
          ) : (
            <div className="flex items-center text-orange-600">
              <span className="mr-2">⚠️</span>
              Please select a pay method or click any of the payment buttons
            </div>
          )}
        </div>

        {/* Validation Errors Container */}
        <div className="validation-errors-container">
          {showValidationErrors && validationErrors.length > 0 && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <span className="text-red-600 mr-2">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Please complete the following fields:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PaymentElement with improved styling for better visibility */}
        <div className={`payment-element-container ${showValidationErrors ? 'field-validation-active' : ''}`} style={{
          minHeight: '200px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* CRITICAL FIX: Removed ALL CSS manipulation of Stripe Elements
               * Stripe Elements render in an iframe and handle their own styling
               * CSS with !important flags causes flickering and layout conflicts
               * Let Stripe handle all internal styling automatically
               */}
          <PaymentElement
            onReady={() => {
              console.log('[DESKTOP ECE] PaymentElement ready');
              console.log('[DESKTOP ECE] PaymentElement should show: Credit Card, Link, Cash App Pay');
            }}
            onChange={async (event) => {
              console.log('[DESKTOP ECE] PaymentElement changed:', event);
              console.log('[DESKTOP ECE] PaymentElement complete status:', event.complete);
              console.log('[DESKTOP ECE] PaymentElement value:', event.value);
              console.log('[DESKTOP ECE] PaymentElement error:', event.error);

              // Track if a payment method is selected
              if (event.complete) {
                setPaymentMethodSelected(true);
                setValidationErrors([]);
                setShowValidationErrors(false);
                console.log('[DESKTOP ECE] ✅ Payment method selected and complete');
              } else {
                setPaymentMethodSelected(false);

                // CRITICAL FIX: Simplified to only use Stripe's built-in validation
                // Removed all DOM manipulation - Stripe Elements are in an iframe and handle their own validation

                // Clear validation errors when user starts typing (form is being edited)
                if (showValidationErrors && event.value?.type) {
                  // User is actively editing, clear error display
                  setShowValidationErrors(false);
                  setValidationErrors([]);
                }

                console.log('[DESKTOP ECE] ⚠️ Payment method not complete or not selected');
              }
            }}
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
                spacedAccordionItems: false
              },
              paymentMethodOrder: ['card', 'link', 'cashapp']
            }}
          />
        </div>
        <button
          type="button"
          onClick={paymentMethodSelected ? handleConfirm : async () => {
            // When button is clicked but disabled, check validation and show specific errors
            if (!elements) {
              alert("Payment system not ready. Please refresh the page and try again.");
              return;
            }

            try {
              // Try to submit to get specific validation errors
              const { error: submitError } = await elements.submit();

              if (submitError) {
                const errors: string[] = [];

                // Parse validation errors to provide specific field feedback
                if (submitError.type === 'validation_error') {
                  const message = submitError.message || '';

                  // Check for common missing fields based on error message
                  if (message.toLowerCase().includes('card number') || message.toLowerCase().includes('card_number')) {
                    errors.push('Card number is required');
                  }
                  if (message.toLowerCase().includes('expir') || message.toLowerCase().includes('expiry')) {
                    errors.push('Expiration date is required');
                  }
                  if (message.toLowerCase().includes('cvc') || message.toLowerCase().includes('security') || message.toLowerCase().includes('cvv')) {
                    errors.push('Security code (CVC) is required');
                  }
                  if (message.toLowerCase().includes('postal') || message.toLowerCase().includes('zip') || message.toLowerCase().includes('postal_code')) {
                    errors.push('ZIP code is required');
                  }
                  if (message.toLowerCase().includes('payment_method') || message.toLowerCase().includes('method')) {
                    errors.push('Please select a payment method first');
                  }

                  // If no specific errors found, use generic message
                  if (errors.length === 0) {
                    errors.push('Please complete all required payment fields');
                  }
                } else {
                  errors.push(submitError.message || 'Please check your payment details');
                }

                // CRITICAL FIX: Removed manual DOM manipulation of Stripe Elements
                // Let Stripe handle its own field validation and error display
                setValidationErrors(errors);
                setShowValidationErrors(true);

                // Scroll to validation errors container
                setTimeout(() => {
                  const errorElement = document.querySelector('.validation-errors-container');
                  if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }, 100);
              } else {
                // If validation passes but button is still disabled, it might be a state issue
                alert("Please select a payment method first. You can choose from the Link, Cash App, or credit card options below.");
              }
            } catch (e) {
              console.error('[DESKTOP ECE] Error checking validation:', e);
              alert("Please select a payment method first. You can choose from the Link, Cash App, or credit card options below.");
            }
          }}
          className="mt-3 w-full inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-3 px-4 rounded-md hover:from-teal-600 hover:to-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={confirming || !paymentMethodSelected || !expressCheckoutReady}
        >
          {confirming ? 'Processing…' :
            !expressCheckoutReady ? 'Loading payment options...' :
            !paymentMethodSelected ? 'Select a payment method first' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders
  // Only re-render if these specific props change
  return (
    prevProps.clientSecret === nextProps.clientSecret &&
    prevProps.enabled === nextProps.enabled &&
    prevProps.amountCents === nextProps.amountCents &&
    prevProps.email === nextProps.email &&
    prevProps.eventId === nextProps.eventId &&
    prevProps.discountCodeId === nextProps.discountCodeId &&
    JSON.stringify(prevProps.cart) === JSON.stringify(nextProps.cart) // Deep comparison for cart
  );
});

export default function StripeDesktopCheckout(props: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(props.clientSecret || null);
  const [creating, setCreating] = useState(false);

  // Use backend-provided publishable key or fallback to env var
  const publishableKey = props.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      console.warn('[StripeDesktopCheckout] No publishable key provided');
      return defaultStripePromise;
    }
    return loadStripe(publishableKey);
  }, [publishableKey]);

  // Only create PaymentIntent if clientSecret is not provided (backward compatibility)
  useEffect(() => {
    if (props.clientSecret) {
      // Backend-provided client secret, skip PaymentIntent creation
      setClientSecret(props.clientSecret);
      return;
    }

    let cancelled = false;
    async function createPi() {
      if (!props.enabled) { setClientSecret(null); return; }
      setCreating(true);
      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: props.cart,
            eventId: props.eventId,
            email: props.email,
            discountCodeId: props.discountCodeId,
          }),
        });
        if (!res.ok) throw new Error("Failed to create payment intent");
        const data = await res.json();
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (e) {
        if (!cancelled) setClientSecret(null);
        console.error("[DESKTOP ECE] PI creation failed:", e);
      } finally {
        if (!cancelled) setCreating(false);
      }
    }
    createPi();
    return () => { cancelled = true; };
  }, [props.enabled, props.amountCents, JSON.stringify(props.cart), props.eventId, props.email, props.discountCodeId, props.clientSecret]);

  const options = useMemo(() => ({ appearance: { theme: "stripe" }, clientSecret: clientSecret || undefined }), [clientSecret]);

  if (!props.enabled) {
    return (
      <div role="button" onClick={() => props.onInvalidClick?.()} className="opacity-60 cursor-not-allowed">
        <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white">
          Wallets (Apple/Google/Link) unavailable until form is valid
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white">
        {creating ? 'Preparing payment…' : 'Payment not ready'}
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
      <InnerDesktopCheckout {...props} clientSecret={clientSecret || undefined} />
    </Elements>
  );
}


