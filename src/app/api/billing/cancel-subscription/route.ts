import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getAppUrl, getApiBaseUrl } from '@/lib/env';

// Force Node.js runtime - Edge runtime is not compatible with Prisma
export const runtime = 'nodejs';

// Initialize Stripe lazily to prevent build-time errors
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
  });
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const stripe = getStripe(); // Initialize Stripe only when needed

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Missing required field: stripeSubscriptionId" },
        { status: 400 }
      );
    }

    try {
      // Get base URL from environment or request
      let baseUrl = getAppUrl();
      if (!baseUrl) {
        // Extract base URL from the request
        const url = new URL(req.url);
        baseUrl = `${url.protocol}//${url.host}`;
        console.warn('NEXT_PUBLIC_APP_URL not set, using request URL:', baseUrl);
      }
      if (!baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
      }
      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) {
        throw new Error('API base URL not configured');
      }

      // Get user profile
      let userProfile = null;
      try {
        const response = await fetch(`${baseUrl}/api/proxy/user-profiles/by-user/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          userProfile = await response.json();
        } else if (response.status !== 404) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      if (!userProfile || !userProfile.id) {
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 404 }
        );
      }

      // Get user subscriptions
      let subscription = null;
      try {
        const response = await fetch(`${baseUrl}/api/proxy/user-subscriptions/by-profile/${userProfile.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const subscriptions = await response.json();
          subscription = subscriptions.find((sub: any) => sub.stripeSubscriptionId === body.stripeSubscriptionId);
        } else if (response.status !== 404) {
          throw new Error(`Failed to fetch subscription: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        throw new Error('Failed to fetch subscription data');
      }

      if (!subscription || !subscription.id) {
        return NextResponse.json(
          { error: "Subscription not found or unauthorized" },
          { status: 404 }
        );
      }

      // Cancel the subscription in Stripe
      const canceledSubscription = await stripe.subscriptions.cancel(
        body.stripeSubscriptionId
      ) as any;

      // canceledSubscription is a Stripe.Subscription object, so current_period_end is valid
      const periodEnd = canceledSubscription.current_period_end
        ? new Date(canceledSubscription.current_period_end * 1000).toISOString()
        : null;

      // Update the subscription status in our database via API
      const updatedSubscription = {
        ...subscription,
        status: canceledSubscription.status,
        stripeCurrentPeriodEnd: periodEnd,
      };
      try {
        const updateResponse = await fetch(`${baseUrl}/api/proxy/user-subscriptions/${subscription.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSubscription),
        });
        if (!updateResponse.ok) {
          throw new Error(`Failed to update subscription: ${updateResponse.statusText}`);
        }
      } catch (error) {
        console.error('Error updating subscription:', error);
        throw new Error('Failed to update subscription');
      }

      return NextResponse.json({
        success: true,
        status: canceledSubscription.status,
        currentPeriodEnd: canceledSubscription.current_period_end
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { error: stripeError instanceof Error ? stripeError.message : 'Failed to cancel subscription' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}