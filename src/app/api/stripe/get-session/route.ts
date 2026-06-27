export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return new NextResponse('Missing session_id', { status: 400 });
    }

    console.log('[GET_STRIPE_SESSION] Fetching session:', session_id);

    // Retrieve the session from Stripe
    const session = await stripe().checkout.sessions.retrieve(session_id);

    console.log('[GET_STRIPE_SESSION] Session metadata:', session.metadata);

    return NextResponse.json({
      id: session.id,
      metadata: session.metadata,
      payment_status: session.payment_status,
    });
  } catch (error) {
    console.error('[GET_STRIPE_SESSION_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}