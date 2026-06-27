export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/stripe/checkout';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, discountCodeId, eventId, email, phone } = body;

    if (!email) {
      return new NextResponse('Email is required for guest checkout', { status: 400 });
    }

    // Safely handle auth - allow both authenticated and guest users
    let userId = null;
    let clerkEmail = null;
    let clerkName = null;
    let clerkPhone = null;
    let clerkImageUrl = null;

    try {
      const authResult = await auth();
      userId = authResult?.userId || null;

      // Extract Clerk user data if authenticated
      if (authResult?.sessionClaims) {
        const claims = authResult.sessionClaims;
        clerkEmail = claims.email || null;
        clerkName = claims.firstName && claims.lastName
          ? `${claims.firstName} ${claims.lastName}`.trim()
          : claims.firstName || claims.lastName || null;
        clerkPhone = claims.phoneNumber || null;
        clerkImageUrl = claims.imageUrl || null;
      }
    } catch (authError) {
      // If auth fails (guest user), continue without userId
      console.log('Guest checkout - no authentication required');
      userId = null;
    }

    const userArg = {
      email,
      phone,
      ...(userId ? { clerkUserId: userId } : {}),
      ...(clerkEmail ? { clerkEmail } : {}),
      ...(clerkName ? { clerkName } : {}),
      ...(clerkPhone ? { clerkPhone } : {}),
      ...(clerkImageUrl ? { clerkImageUrl } : {}),
    } as {
      email: string;
      phone?: string;
      clerkUserId?: string;
      clerkEmail?: string;
      clerkName?: string;
      clerkPhone?: string;
      clerkImageUrl?: string;
    };

    const stripeSession = await createStripeCheckoutSession(cart, userArg, discountCodeId, eventId);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}