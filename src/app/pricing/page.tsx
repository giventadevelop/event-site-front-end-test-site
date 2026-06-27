import { auth, currentUser } from "@clerk/nextjs/server";
import { Metadata } from 'next';
import { PricingPlans } from '@/components/subscription/PricingPlans';
import { redirect } from 'next/navigation';
import type { UserProfileDTO, UserSubscriptionDTO } from '@/types';




const messages = {
  'subscription-required': {
    type: 'warning',
    text: 'A subscription is required to access the dashboard. Please subscribe to continue.',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
  'subscription-pending': {
    type: 'info',
    text: 'Your subscription is being processed. Please wait a moment and try accessing the dashboard again.',
    className: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  'subscription-failed': {
    type: 'error',
    text: 'There was an issue activating your subscription. Please try again or contact support if the problem persists.',
    className: 'bg-red-50 border-red-200 text-red-800',
  },
} as const;

type MessageType = keyof typeof messages;

interface PageProps {
  searchParams: {
    message?: string;
    success?: string;
    session_id?: string;
  };
}

export const metadata: Metadata = {
  title: "Pricing - TaskMngr",
  description: "Choose the right plan for your needs",
};

// Force Node.js runtime
export const runtime = 'nodejs';

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null || value === undefined ? undefined : value;
}

export default async function PricingPage(props: any) {
  let userProfile: UserProfileDTO | null = null;
  let subscription: UserSubscriptionDTO | null = null;
  let userProfileError = false;
  let subscriptionError = false;

  try {
    // Await searchParams if it is a Promise (Next.js dynamic API)
    const searchParams = await Promise.resolve(props.searchParams);
    const messageParam = searchParams?.message;
    const success = searchParams?.success;
    const sessionId = searchParams?.session_id;
    const isReturnFromStripe = Boolean(success === 'true' || sessionId);

    // Initialize auth at runtime
    const session = await auth();
    const userId = session?.userId;
    const clerkUser = await currentUser();

    // Allow unauthenticated users to view pricing (public page)
    // Only fetch user profile and subscription if user is authenticated
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Only fetch user profile and subscription if user is authenticated
    if (userId && email && baseUrl) {
      // Try to get existing user profile with proper no-store caching
      try {
        const response = await fetch(`${baseUrl}/api/proxy/user-profiles/by-user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: isReturnFromStripe ? 'no-store' : 'default',
          next: { revalidate: 0 }
        });
        if (response.ok) {
          userProfile = await response.json();
        } else if (response.status !== 404) {
          userProfileError = true;
        }
      } catch (error) {
        userProfileError = true;
      }

      // If userProfile is missing, show error (don't redirect)
      if (!userProfile || !userProfile.id) {
        userProfileError = true;
      }

      // Check for existing subscription for this user profile
      if (!userProfileError && userProfile) {
        try {
          const response = await fetch(
            `${baseUrl}/api/proxy/user-subscriptions/by-profile/${userProfile.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
              next: { revalidate: 0 }
            }
          );
          if (response.ok) {
            const subscriptions: UserSubscriptionDTO[] = await response.json();
            subscription = Array.isArray(subscriptions) ? subscriptions[0] : subscriptions;
          } else {
            subscriptionError = true;
          }
        } catch (error) {
          subscriptionError = true;
        }
      }

      // Only POST to create a new subscription if none exists and no errors
      if (!subscription && !userProfileError && userProfile && !subscriptionError) {
        try {
          const newSubscription: UserSubscriptionDTO = {
            status: 'pending',
            stripeCustomerId: undefined,
            stripeSubscriptionId: undefined,
            stripePriceId: undefined,
            stripeCurrentPeriodEnd: undefined,
            userProfile: userProfile!,
          };

          const response = await fetch(`${baseUrl}/api/proxy/user-subscriptions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSubscription),
          });

          if (!response.ok) {
            subscriptionError = true;
          } else {
            const responseData = await response.json();
            subscription = {
              ...responseData,
              stripeCustomerId: nullToUndefined(responseData.stripeCustomerId),
              stripeSubscriptionId: nullToUndefined(responseData.stripeSubscriptionId),
              stripePriceId: nullToUndefined(responseData.stripePriceId),
              stripeCurrentPeriodEnd: nullToUndefined(responseData.stripeCurrentPeriodEnd)
                ? new Date(responseData.stripeCurrentPeriodEnd)
                : undefined,
            };
          }
        } catch (error) {
          subscriptionError = true;
        }
      }
    }
    // If user is not authenticated, userProfile and subscription remain null
    // This allows the page to render pricing plans for unauthenticated users

    // Determine appropriate message based on subscription state
    let message = messageParam;
    if (isReturnFromStripe) {
      if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        message = undefined; // Clear any error message if subscription is active
      } else {
        message = 'subscription-pending';
      }
    }

    const messageConfig = message && Object.keys(messages).includes(message)
      ? messages[message as MessageType]
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4">
          {userProfileError ? (
            <div className="bg-red-50 p-4 rounded-md mb-8">
              <h2 className="text-red-800">Error loading your profile</h2>
              <p className="text-red-600">We couldn't load your profile. Please try again later or contact support.</p>
            </div>
          ) : subscriptionError ? (
            <div className="bg-red-50 p-4 rounded-md mb-8">
              <h2 className="text-red-800">Error loading your subscription</h2>
              <p className="text-red-600">We couldn't load your subscription. Please try again later.</p>
            </div>
          ) : null}
          {messageConfig && (
            <div className={`mb-8 p-4 border rounded-lg text-center ${messageConfig.className}`}>
              <p>{messageConfig.text}</p>
            </div>
          )}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600">
              Choose the plan that best fits your needs
            </p>
          </div>
          {/* Only show PricingPlans if no errors */}
          {!userProfileError && !subscriptionError && (
            <PricingPlans currentSubscription={subscription} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in pricing page:', error);
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-red-800">Error loading pricing information</h2>
          <p className="text-red-600">Please try again later</p>
        </div>
      </div>
    );
  }
}