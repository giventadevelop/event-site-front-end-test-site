import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getAppUrl, getTenantId } from '@/lib/env';
import type { TenantOrganizationDTO } from '@/types';

export const runtime = 'nodejs';

/**
 * Gas station subscription billing (see
 * documentation/tenant_management/gas_station_site/gas_station_subscription_billing.md).
 *
 * POST { action: 'checkout', quantity }  → Stripe Checkout Session (mode: subscription,
 *   graduated-tier price STRIPE_GAS_STATION_PRICE_ID, quantity = billable locations)
 * POST { action: 'portal' }              → Stripe Customer Portal session
 * POST { action: 'sync-quantity', quantity } → update existing subscription quantity (prorated)
 */

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
  });
};

async function fetchTenantOrganization(): Promise<TenantOrganizationDTO | null> {
  const params = new URLSearchParams({ 'tenantId.equals': getTenantId(), size: '1' });
  const res = await fetchWithJwtRetry(
    `${getApiBaseUrl()}/api/tenant-organizations?${params}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const list = Array.isArray(data) ? data : [];
  return (list[0] as TenantOrganizationDTO) ?? null;
}

async function patchTenantOrganization(
  id: number,
  patch: Partial<TenantOrganizationDTO>
): Promise<void> {
  const res = await fetchWithJwtRetry(`${getApiBaseUrl()}/api/tenant-organizations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({ ...patch, id, tenantId: getTenantId(), updatedAt: new Date().toISOString() }),
  });
  if (!res.ok) {
    console.error('[gas-station-billing] failed to patch tenant organization', await res.text());
  }
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const action: string = body.action;

    const organization = await fetchTenantOrganization();
    if (!organization?.id) {
      return NextResponse.json({ error: 'Tenant organization not found' }, { status: 404 });
    }

    const baseUrl = getAppUrl();
    const billingUrl = `${baseUrl}/admin/gas-station/billing`;

    // Resolve / create the Stripe customer for this tenant
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.contactEmail,
        name: organization.organizationName,
        metadata: { tenantId: organization.tenantId },
      });
      customerId = customer.id;
      await patchTenantOrganization(organization.id, { stripeCustomerId: customerId });
    }

    if (action === 'portal') {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: billingUrl,
      });
      return NextResponse.json({ url: session.url });
    }

    if (action === 'sync-quantity') {
      const quantity = Math.max(1, Number(body.quantity) || 1);
      if (!organization.stripeSubscriptionId) {
        return NextResponse.json({ error: 'No active subscription to update' }, { status: 400 });
      }
      const subscription = await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
      const item = subscription.items.data[0];
      if (!item) {
        return NextResponse.json({ error: 'Subscription has no items' }, { status: 400 });
      }
      await stripe.subscriptions.update(organization.stripeSubscriptionId, {
        items: [{ id: item.id, quantity }],
        proration_behavior: 'create_prorations',
      });
      return NextResponse.json({ ok: true, quantity });
    }

    if (action === 'checkout') {
      const priceId = process.env.STRIPE_GAS_STATION_PRICE_ID;
      if (!priceId) {
        return NextResponse.json(
          { error: 'STRIPE_GAS_STATION_PRICE_ID is not configured — create the graduated-tier price in Stripe first' },
          { status: 400 }
        );
      }
      const quantity = Math.max(1, Number(body.quantity) || 1);

      const paymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
        process.env.STRIPE_GAS_ENABLE_ACH === 'true'
          ? ['card', 'link', 'us_bank_account']
          : ['card', 'link'];

      const session = await stripe.checkout.sessions.create({
        success_url: `${billingUrl}?checkout=success`,
        cancel_url: `${billingUrl}?checkout=cancelled`,
        payment_method_types: paymentMethods,
        mode: 'subscription',
        billing_address_collection: 'auto',
        customer: customerId,
        line_items: [{ price: priceId, quantity }],
        subscription_data: {
          metadata: { tenantId: organization.tenantId, module: 'GAS_STATION' },
        },
        metadata: { tenantId: organization.tenantId, module: 'GAS_STATION' },
      });

      if (!session.url) {
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
      }
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[gas-station-billing]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
