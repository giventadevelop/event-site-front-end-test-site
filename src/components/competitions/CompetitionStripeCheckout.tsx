'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

type Props = {
  eventId: string;
  registrationIds: number[];
  email?: string;
  amountCents: number;
  returnUrl: string;
  enabled: boolean;
};

function CheckoutForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    if (submitError) setError(submitError.message || 'Payment failed');
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || busy}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50"
      >
        {busy ? 'Processing…' : 'Pay now'}
      </button>
    </div>
  );
}

export default function CompetitionStripeCheckout({
  eventId,
  registrationIds,
  email,
  amountCents,
  returnUrl,
  enabled,
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripePromise = useMemo(
    () =>
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        : null,
    []
  );

  useEffect(() => {
    if (!enabled || amountCents <= 0 || registrationIds.length === 0) {
      setClientSecret(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/stripe/competition-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, registrationIds, email, amountCents }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (e) {
        console.error('[CompetitionStripeCheckout]', e);
        if (!cancelled) setClientSecret(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, eventId, registrationIds.join(','), email, amountCents]);

  if (!enabled) return null;
  if (!clientSecret || !stripePromise) {
    return <p className="text-sm text-muted-foreground">Preparing payment…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm returnUrl={returnUrl} />
    </Elements>
  );
}
