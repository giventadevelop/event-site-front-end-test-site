import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/DashboardContent";
import { Suspense } from "react";
import { UserTaskDTO, UserProfileDTO, UserSubscriptionDTO } from "@/types";
import { getAppUrlFromRequestHeaders } from "@/lib/env";

interface PageProps {
  searchParams: {
    success?: string;
    session_id?: string;
    page?: string;
    size?: string;
  };
}

async function checkSubscriptionStatus(userProfile: UserProfileDTO, isReturnFromStripe: boolean = false): Promise<UserSubscriptionDTO | null> {
  // If returning from Stripe, try up to 3 times with a 1-second delay
  const maxAttempts = isReturnFromStripe ? 3 : 1;
  const delayMs = 1000; // 1 second
  const baseUrl = await getAppUrlFromRequestHeaders();

  // Check subscription status with more retries if returning from Stripe
  const maxRetries = isReturnFromStripe ? 5 : 1;
  let subscription = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(
        `${baseUrl}/api/proxy/user-subscriptions/by-profile/${userProfile.id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // Always bypass cache
          next: { revalidate: 0 } // Ensure fresh data
        }
      );

      if (response.ok) {
        const subscriptions = await response.json();
        subscription = Array.isArray(subscriptions) ? subscriptions[0] : subscriptions;

        // Log subscription state
        console.log('Dashboard subscription check:', {
          attempt: attempt + 1,
          status: subscription?.status,
          returnFromStripe: isReturnFromStripe,
          subscriptionId: subscription?.id,
          currentPeriodEnd: subscription?.stripeCurrentPeriodEnd
        });

        if (isReturnFromStripe && subscription) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            break;
          }
        } else {
          break;
        }
      }

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
      attempt++;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      attempt++;
    }
  }

  return subscription;
}

async function getUserProfile(userId: string): Promise<UserProfileDTO | null> {
  try {
    const baseUrl = await getAppUrlFromRequestHeaders();
    const response = await fetch(`${baseUrl}/api/proxy/user-profiles/by-user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      // Log the error as a warning, but never throw
      console.warn(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.warn('Error fetching user profile:', error);
    return null;
  }
}

export default async function DashboardPage(props: PageProps) {
  try {
    // Await searchParams if it is a Promise (Next.js dynamic API)
    const searchParams = await Promise.resolve(props.searchParams);

    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      redirect('/sign-in');
    }

    // Get search params
    const success = searchParams?.success;
    const sessionId = searchParams?.session_id;
    const isReturnFromStripe = Boolean(success === 'true' || sessionId);
    const page = typeof searchParams?.page !== 'undefined' ? Number(searchParams.page) : 0;
    const size = typeof searchParams?.size !== 'undefined' ? Number(searchParams.size) : 20;

    // Get user profile once and use it throughout
    let userProfileError = false;
    let userProfile: UserProfileDTO | null = null;
    try {
      userProfile = await getUserProfile(userId);
      if (!userProfile) userProfileError = true;
    } catch (err) {
      userProfileError = true;
    }

    // Check subscription status with retry logic for Stripe returns
    let subscriptionError = false;
    let subscription: UserSubscriptionDTO | null = null;
    if (userProfile && !userProfileError) {
      try {
        subscription = await checkSubscriptionStatus(userProfile, isReturnFromStripe);
      } catch (err) {
        subscriptionError = true;
      }
    }

    // If no subscription or not active/trialing, handle pending state if returning from Stripe
    let pendingSubscription = false;
    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      if (isReturnFromStripe) {
        pendingSubscription = true;
      } else if (!userProfileError) {
        redirect('/pricing?message=subscription-required');
      }
    }

    // Get all tasks for the user using userProfile.id
    let tasks = [];
    let tasksError = false;
    if (userProfile && !userProfileError) {
      try {
        const baseUrl = await getAppUrlFromRequestHeaders();
        const response = await fetch(
          `${baseUrl}/api/proxy/user-tasks?userId.equals=${userProfile.id}&page=${page}&size=${size}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store', // Disable caching to always get fresh data
          }
        );

        if (response.status === 404) {
          tasks = []; // No tasks found, not an error
        } else if (!response.ok) {
          tasksError = true;
          tasks = [];
        } else {
          tasks = await response.json();
          // Sort tasks by createdAt in descending order
          tasks.sort((a: UserTaskDTO, b: UserTaskDTO) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      } catch (error) {
        tasksError = true;
        tasks = [];
      }
    }

    // Calculate stats
    const stats = {
      total: tasks.length,
      completed: tasks.filter((task: UserTaskDTO) => task.status === 'completed').length,
      inProgress: tasks.filter((task: UserTaskDTO) => task.status === 'in_progress').length,
      pending: tasks.filter((task: UserTaskDTO) => task.status === 'pending').length,
      highPriority: tasks.filter((task: UserTaskDTO) => task.priority === 'high').length,
    };

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent
          tasks={tasks}
          stats={stats}
          subscription={subscription}
          pendingSubscription={pendingSubscription}
          userProfileId={userProfile?.id}
          errorBanner={
            userProfileError ? (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <h2 className="text-red-800">Error loading your profile</h2>
                <p className="text-red-600">We couldn't load your profile. Please try again later or contact support.</p>
              </div>
            ) : subscriptionError ? (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <h2 className="text-red-800">Error loading your subscription</h2>
                <p className="text-red-600">We couldn't load your subscription. Please try again later.</p>
              </div>
            ) : tasksError ? (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <h2 className="text-red-800">Error loading your tasks</h2>
                <p className="text-red-600">We couldn't load your tasks. Please try again later.</p>
              </div>
            ) : null
          }
        />
      </Suspense>
    );
  } catch (err) {
    // Catch any unhandled error and show a friendly error banner with fallback dashboard
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent
          tasks={[]}
          stats={{ total: 0, completed: 0, inProgress: 0, pending: 0, highPriority: 0 }}
          subscription={null}
          pendingSubscription={false}
          userProfileId={undefined}
          errorBanner={
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <h2 className="text-red-800">Error loading your dashboard</h2>
              <p className="text-red-600">Something went wrong. Please try again later or contact support.</p>
            </div>
          }
        />
      </Suspense>
    );
  }
}
