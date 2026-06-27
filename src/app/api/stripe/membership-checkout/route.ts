import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAppUrl, getTenantId, getPaymentMethodDomainId } from '@/lib/env';
import { auth } from '@clerk/nextjs/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const membershipPlanId: number = body.membershipPlanId;
    const successUrl: string = body.successUrl;
    const cancelUrl: string = body.cancelUrl;

    if (!membershipPlanId) {
      return NextResponse.json({ error: 'Membership plan ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = getAppUrl();

    // Fetch membership plan details from backend
    const planRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/membership-plans/${membershipPlanId}`,
      { cache: 'no-store' }
    );

    if (!planRes.ok) {
      const msg = await planRes.text();
      console.error('[MEMBERSHIP-CHECKOUT] Failed to fetch membership plan:', planRes.status, msg);
      return NextResponse.json({ error: 'Failed to fetch membership plan' }, { status: 500 });
    }

    const plan: {
      id: number;
      price: number;
      currency: string;
      planName?: string;
      stripePriceId?: string;
      billingInterval?: string;
    } = await planRes.json();

    // Get tenant ID and Payment Method Domain ID
    let tenantId: string;
    let paymentMethodDomainId: string;

    try {
      tenantId = getTenantId();
    } catch (error) {
      console.error('[MEMBERSHIP-CHECKOUT] Missing NEXT_PUBLIC_TENANT_ID:', error);
      return NextResponse.json({
        error: 'Server configuration error: Tenant ID not configured'
      }, { status: 500 });
    }

    try {
      paymentMethodDomainId = getPaymentMethodDomainId();
    } catch (error) {
      console.error('[MEMBERSHIP-CHECKOUT] Missing NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID:', error);
      return NextResponse.json({
        error: 'Server configuration error: Payment Method Domain ID not configured'
      }, { status: 500 });
    }

    // Determine payment methods based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const paymentMethods: ('card' | 'link' | 'cashapp')[] = isProduction
      ? ['card', 'link', 'cashapp']
      : ['card', 'link'];

    // Convert billing interval to Stripe interval
    const stripeInterval = plan.billingInterval === 'MONTHLY' ? 'month' :
                          plan.billingInterval === 'QUARTERLY' ? 'month' :
                          plan.billingInterval === 'YEARLY' ? 'year' :
                          'month';
    const intervalCount = plan.billingInterval === 'QUARTERLY' ? 3 : 1;

    // Create Stripe Checkout Session
    const sessionParams: any = {
      payment_method_types: paymentMethods,
      mode: 'subscription',
      success_url: successUrl || `${baseUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/membership?canceled=true`,
      billing_address_collection: 'auto',
      metadata: {
        membershipPlanId: String(membershipPlanId),
        userId: userId,
        tenantId: tenantId,
        paymentMethodDomainId: paymentMethodDomainId,
        metadataSource: 'membership_checkout',
        timestamp: new Date().toISOString(),
      },
      subscription_data: {
        metadata: {
          membershipPlanId: String(membershipPlanId),
          userId: userId,
          tenantId: tenantId,
          paymentMethodDomainId: paymentMethodDomainId,
        },
      },
    };

    // If plan has stripePriceId, use it; otherwise create price_data
    if (plan.stripePriceId) {
      sessionParams.line_items = [{
        price: plan.stripePriceId,
        quantity: 1,
      }];
    } else {
      // Create price_data inline (for plans without Stripe Price ID)
      sessionParams.line_items = [{
        price_data: {
          currency: plan.currency?.toLowerCase() || 'usd',
          product_data: {
            name: plan.planName || `Membership Plan ${membershipPlanId}`,
            description: `Membership subscription - ${plan.billingInterval || 'Monthly'}`,
          },
          unit_amount: Math.round(plan.price * 100), // Convert to cents
          recurring: {
            interval: stripeInterval,
            interval_count: intervalCount,
          },
        },
        quantity: 1,
      }];
    }

    const session = await stripe().checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    console.log('[MEMBERSHIP-CHECKOUT] Checkout session created:', {
      sessionId: session.id,
      url: session.url,
      membershipPlanId,
      userId,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err) {
    console.error('[MEMBERSHIP-CHECKOUT] Error creating checkout session:', err);
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}








