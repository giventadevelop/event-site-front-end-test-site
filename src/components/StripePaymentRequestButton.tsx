"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import type { PaymentRequest as StripePaymentRequest, StripeElementsOptions } from '@stripe/stripe-js';

type CartItem = {
  ticketType: { id: number };
  quantity: number;
};

type Props = {
  cart: CartItem[];
  eventId: number | string;
  email?: string;
  customerName?: string;
  customerPhone?: string;
  discountCodeId?: number | null;
  enabled: boolean; // whether fields are valid; when false, we show disabled overlay/placeholder
  showPlaceholder?: boolean; // show a disabled-looking placeholder if not eligible yet
  amountCents?: number; // optional current total for display
  publishableKey?: string; // Backend-provided publishable key (domain-agnostic)
  onInvalidClick?: () => void; // called when user clicks placeholder/disabled state to surface validation
};

// Default Stripe promise (fallback for backward compatibility)
const defaultStripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function InnerPRB({ cart, eventId, email, customerName, customerPhone, discountCodeId, enabled, showPlaceholder, amountCents, onInvalidClick }: Props) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null);
  const [ready, setReady] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cachedAmount, setCachedAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [canMakePaymentResult, setCanMakePaymentResult] = useState<any>(null);

  // When validations become invalid, tear down the live PaymentRequest so we render the placeholder that surfaces validation
  useEffect(() => {
    if (!enabled) {
      console.log('[PRB VALIDATION] Disabling PRB due to invalid form. Tearing down PaymentRequest.');
      setReady(false);
      setEligible(false);
      setPaymentRequest(null);
      setClientSecret(null);
      setCachedAmount(null);
      setProcessing(false);
    }
  }, [enabled]);

  useEffect(() => {
    console.log('[PRB] INIT useEffect triggered:', { hasStripe: !!stripe, enabled, cart: cart.length, email });
    if (!stripe || !enabled) {
      console.log('[PRB] INIT blocked:', { hasStripe: !!stripe, enabled });
      return;
    }

    // Create PR only once per enable window
    const prConfig = {
      country: 'US',
      currency: 'usd',
      total: { label: 'Tickets', amount: typeof amountCents === 'number' ? amountCents : 0 },
      requestPayerEmail: true,
    };

    console.log('[PRB] Creating PaymentRequest with config:', prConfig);
    const pr = stripe.paymentRequest(prConfig);

    pr.canMakePayment().then((result) => {
      console.log('[PRB] canMakePayment() result:', result);
      console.log('[PRB] Environment info:', {
        userAgent: navigator.userAgent,
        domain: window.location.hostname,
        protocol: window.location.protocol,
        isHTTPS: window.location.protocol === 'https:',
        isChrome: /Chrome/.test(navigator.userAgent),
        isEdge: /Edge/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        isDesktop: !/Mobi|Android/i.test(navigator.userAgent),
        stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
        paymentRequestAmount: prConfig.total.amount,
        paymentRequestCountry: prConfig.country,
        paymentRequestCurrency: prConfig.currency
      });

      // Check native Google Pay API availability
      if ('PaymentRequest' in window) {
        try {
          const testPaymentRequest = new PaymentRequest([{
            supportedMethods: 'https://google.com/pay',
            data: {
              apiVersion: 2,
              apiVersionMinor: 0,
              merchantInfo: { merchantName: 'Test' },
              allowedPaymentMethods: [{
                type: 'CARD',
                parameters: { allowedAuthMethods: ['PAN_ONLY'], allowedCardNetworks: ['VISA', 'MASTERCARD'] }
              }]
            }
          }], { total: { label: 'Test', amount: { currency: 'USD', value: '1.00' } } });

          testPaymentRequest.canMakePayment().then(canPay => {
            console.log('[PRB] Native Google Pay API canMakePayment:', canPay);
          }).catch(err => {
            console.log('[PRB] Native Google Pay API check failed:', err.message);
          });
        } catch (err) {
          console.log('[PRB] Native Google Pay API not available:', err);
        }
      }

      if (!result) {
        console.warn('[PRB] canMakePayment() returned null - no payment methods available');
        setPaymentRequest(null);
        setReady(false);
        setEligible(false);
        return;
      }

      console.log('[PRB] Payment methods available:', {
        applePay: result.applePay || (result as any).apple_pay,
        googlePay: result.googlePay || (result as any).google_pay,
        link: (result as any).link
      });

      // Additional debugging for Google Pay specific issues
      if (!(result.googlePay || (result as any).google_pay)) {
        console.log('[PRB] Google Pay not available - potential causes:', {
          amountTooLow: prConfig.total.amount < 50, // Google Pay requires minimum $0.50
          notSignedIn: 'Check if user is signed into Google account',
          noCards: 'Check if user has cards saved in Google Pay',
          countryRestriction: prConfig.country !== 'US' ? 'Country might not support Google Pay' : false,
          browserIssue: !(/Chrome/.test(navigator.userAgent)) ? 'Google Pay works best in Chrome' : false
        });
      }

      setCanMakePaymentResult(result);
      pr.on('paymentmethod', async (ev) => {
        if (processing) {
          try { ev.complete('fail'); } catch { }
          return;
        }
        setProcessing(true);
        try {
          const isApplePay = !!(canMakePaymentResult && (canMakePaymentResult.applePay || (canMakePaymentResult as any).apple_pay));
          // For Apple Pay on iOS/Safari: immediately complete to prevent sheet timeout
          if (isApplePay) {
            try { ev.complete('success'); } catch { }
          }

          // Always create fresh PI on payment to avoid amount mismatch
          // Don't reuse cached clientSecret as cart/amount may have changed
          const res = await fetch('/api/stripe/payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cart,
              eventId,
              email,
              customerName,
              customerPhone,
              discountCodeId
            }),
          });
          if (!res.ok) {
            if (!isApplePay) { try { ev.complete('fail'); } catch { } }
            alert('Unable to start payment. Please try again.');
            setProcessing(false);
            return;
          }
          const data = await res.json();
          const secret = data.clientSecret as string;
          console.log('[PRB] Created fresh PI for payment:', { piId: data.paymentIntentId, amount: data.amount });

          // CRITICAL: Ensure Payment Request total matches PI amount before confirm
          // This prevents amount_mismatch errors in Stripe confirm
          if (typeof data.amount === 'number' && pr) {
            try {
              pr.update({ total: { label: 'Tickets', amount: data.amount } });
              console.log('[PRB] Updated Payment Request total to match PI:', { piAmount: data.amount, walletTotal: data.amount });
            } catch (updateErr) {
              console.warn('[PRB] Failed to update Payment Request total:', updateErr);
            }
          }

          const { error, paymentIntent } = await stripe.confirmCardPayment(secret, {
            payment_method: ev.paymentMethod.id,
            receipt_email: ev.payerEmail || email,
          });

          console.log('[PRB] Confirmation attempt:', {
            piId: paymentIntent?.id || 'unknown',
            status: paymentIntent?.status,
            amount: paymentIntent?.amount,
            walletAmount: (ev as any).total?.amount
          });
          if (error) {
            // Enhanced error logging for production debugging
            const errorDetails: any = {
              message: error.message,
              type: (error as any)?.type,
              code: (error as any)?.code,
              decline_code: (error as any)?.decline_code,
              payment_intent: (error as any)?.payment_intent,
              piId: (paymentIntent as any)?.id || (error as any)?.payment_intent?.id,
              // Additional context for debugging
              piAmount: data.amount,
              walletTotal: (ev as any).total?.amount,
              clientSecret: secret.substring(0, 20) + '...',
              paymentMethodId: ev.paymentMethod.id,
              timestamp: new Date().toISOString()
            };

            console.error('[PRB] confirmCardPayment error:', errorDetails);

            // Log to help identify specific Stripe 400 causes
            if (error.code === 'amount_mismatch') {
              console.error('[PRB] AMOUNT_MISMATCH: PI amount differs from wallet total');
            } else if (error.code === 'payment_intent_unexpected_state') {
              console.error('[PRB] UNEXPECTED_STATE: PI may be stale or already processed');
            } else if (error.code === 'parameter_invalid_empty') {
              console.error('[PRB] INVALID_PARAMETER: Required parameter missing or empty');
            }
            if (!isApplePay) { try { ev.complete('fail'); } catch { } }
            alert(error.message || 'Payment failed. Please try another method.');
            setProcessing(false);
          } else {
            console.log('[PRB] confirmCardPayment success:', { id: paymentIntent?.id, status: paymentIntent?.status });
            if (!isApplePay) { try { ev.complete('success'); } catch { } }
            const piId = paymentIntent?.id;
            window.location.href = piId ? `/event/success?pi=${encodeURIComponent(piId)}` : '/event/success';
          }
        } catch (e: any) {
          console.error('[PRB] confirmCardPayment thrown:', e);
          const isApplePay = !!(canMakePaymentResult && (canMakePaymentResult.applePay || (canMakePaymentResult as any).apple_pay));
          if (!isApplePay) { try { ev.complete('fail'); } catch { } }
          alert(e?.message || 'Payment failed. Please try again.');
          setProcessing(false);
        }
      });
      setPaymentRequest(pr);
      setReady(true);
      setEligible(true);
    }).catch(() => {
      setPaymentRequest(null);
      setReady(false);
      setEligible(false);
    });

    // No cleanup needed; PR button will be recreated when enabled changes
  }, [stripe, enabled]);

  // Update PaymentRequest total when amount changes
  useEffect(() => {
    if (!paymentRequest) return;
    const currentAmount = typeof amountCents === 'number' ? amountCents : 0;

    // Always sync PaymentRequest total with current amount
    try {
      paymentRequest.update({ total: { label: 'Tickets', amount: currentAmount } });
      console.log('[PRB] Updated PaymentRequest total:', { amount: currentAmount });
    } catch (e) {
      console.warn('[PRB] Failed to update PaymentRequest total:', e);
    }

    // Clear cached PI if amount changed to prevent stale reuse
    if (cachedAmount !== null && cachedAmount !== currentAmount) {
      console.log('[PRB] Amount changed, clearing cached PI:', { old: cachedAmount, new: currentAmount });
      setClientSecret(null);
    }
    setCachedAmount(currentAmount);
  }, [paymentRequest, amountCents, cachedAmount]);

  // If not ready yet or not enabled, show branded static image placeholder
  const renderPlaceholderImage = (
    <div
      role="button"
      aria-label="Apple Pay / Google Pay (disabled)"
      onClick={() => {
        if (onInvalidClick) onInvalidClick();
      }}
      style={{
        position: 'relative',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: '#fff',
        padding: 6,
        cursor: 'not-allowed',
      }}
      aria-disabled
    >
      <img
        src="/images/both_apple_google_pay_button.png"
        alt="Apple Pay / Google Pay"
        style={{
          width: '100%',
          height: 48,
          objectFit: 'contain',
          borderRadius: 4,
          display: 'block',
        }}
      />
      {/* Click-capturing overlay to surface validation */}
      <div
        onClick={() => { if (onInvalidClick) onInvalidClick(); }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          borderRadius: 8,
        }}
      />
    </div>
  );

  if (!stripe || !paymentRequest || !ready) {
    console.log('[PRB] RENDER: Showing placeholder or null', {
      hasStripe: !!stripe,
      hasPaymentRequest: !!paymentRequest,
      ready,
      showPlaceholder,
      eligible
    });
    return showPlaceholder ? renderPlaceholderImage : null;
  }

  // When enabled, render live PR button
  console.log('[PRB] RENDER: Rendering live PaymentRequestButtonElement', {
    hasStripe: !!stripe,
    hasPaymentRequest: !!paymentRequest,
    ready,
    eligible
  });

  return (
    <div id="prb-container" style={{ minHeight: 48, display: 'block', position: 'relative' }}>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: { paymentRequestButton: { theme: 'dark', height: '48px', type: 'default' } },
        }}
      />
    </div>
  );
}

export function StripePaymentRequestButton(props: Props) {
  // Use backend-provided publishable key or fallback to env var
  const publishableKey = props.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      console.warn('[StripePaymentRequestButton] No publishable key provided');
      return defaultStripePromise;
    }
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const elementsOptions = useMemo<StripeElementsOptions>(() => ({ appearance: { theme: 'stripe' } }), []);

  if (!stripePromise) {
    return (
      <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white opacity-60">
        Stripe wallet buttons are not available. Please provide a publishable key.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {/* @ts-ignore - stripe types at runtime */}
      <InnerPRB {...props} />
    </Elements>
  );
}

// Default export for backward compatibility
export default StripePaymentRequestButton;


