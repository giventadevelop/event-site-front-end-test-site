import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { stripe } from '@/lib/stripe';
import { getTenantId, getPaymentMethodDomainId } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventIdRaw = body.eventId;
    const registrationIds: number[] = Array.isArray(body.registrationIds)
      ? body.registrationIds.filter((id: unknown) => typeof id === 'number' && !Number.isNaN(id))
      : [];
    const email: string | undefined = body.email;
    const amountCentsRaw = body.amountCents;

    if (!eventIdRaw || registrationIds.length === 0) {
      return NextResponse.json({ error: 'eventId and registrationIds are required' }, { status: 400 });
    }

    let totalCents = typeof amountCentsRaw === 'number' ? Math.round(amountCentsRaw) : 0;
    if (totalCents <= 0 && typeof body.totalAmount === 'number') {
      totalCents = Math.round(body.totalAmount * 100);
    }
    if (totalCents <= 0) {
      return NextResponse.json({ error: 'Total must be greater than zero' }, { status: 400 });
    }

    const tenantId = getTenantId();
    const paymentMethodDomainId = getPaymentMethodDomainId();

    const idemSource = `${eventIdRaw}|${registrationIds.join(',')}|${totalCents}|${email || ''}`;
    const idempotencyKey = crypto.createHash('sha256').update(idemSource).digest('hex');

    const pi = await stripe().paymentIntents.create(
      {
        amount: totalCents,
        currency: 'usd',
        receipt_email: email,
        automatic_payment_methods: { enabled: true },
        metadata: {
          registrationType: 'event_competition',
          eventId: String(eventIdRaw),
          competitionRegistrationIds: registrationIds.join(','),
          tenantId,
          paymentMethodDomainId,
          customerEmail: email || '',
          metadataSource: 'competition_payment_intent',
          timestamp: new Date().toISOString(),
        },
      },
      { idempotencyKey }
    );

    return NextResponse.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      amount: totalCents,
      currency: 'usd',
      status: pi.status,
    });
  } catch (err) {
    console.error('[COMPETITION-PI] Error creating PaymentIntent:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
