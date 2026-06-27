import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
  }
  return _stripe;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    console.log(`[VERIFY-PI] Verifying payment intent: ${paymentIntentId}`);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    console.log(`[VERIFY-PI] Payment intent ${paymentIntentId} status: ${paymentIntent.status}`);

    // Return the status
    res.status(200).json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      last_payment_error: paymentIntent.last_payment_error,
    });

  } catch (error: any) {
    console.error('[VERIFY-PI] Error verifying payment intent:', error);

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: 'Invalid payment intent ID' });
    }

    res.status(500).json({ error: 'Failed to verify payment intent', details: error.message });
  }
}
