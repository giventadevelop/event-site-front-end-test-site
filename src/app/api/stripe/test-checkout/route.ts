export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getTenantId, getAppUrl } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description } = await request.json();

    if (!amount || amount < 0.01) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Test Transaction',
              description: 'Test Stripe payment processing',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${getAppUrl()}/admin/test-stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/admin/test-stripe?canceled=true`,
      metadata: {
        test_transaction: 'true',
        user_id: userId,
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating test checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}