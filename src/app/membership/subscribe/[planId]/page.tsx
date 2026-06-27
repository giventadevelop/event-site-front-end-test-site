import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchMembershipPlanServer } from './ApiServerActions';
import { SubscriptionSignupClient } from './SubscriptionSignupClient';
import { getAppUrl } from '@/lib/env';
import type { UserProfileDTO } from '@/types';

export const metadata: Metadata = {
  title: 'Subscribe to Membership',
  description: 'Complete your membership subscription',
};

export default async function SubscriptionSignupPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  // CRITICAL: Next.js 15+ requires headers() to be awaited before auth()
  // Store the result to ensure proper async context
  const headersList = await headers(); // CRITICAL: Fully await headers() before calling auth()

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/membership/subscribe');
  }

  const { planId } = await params;
  const planIdNum = parseInt(planId, 10);

  if (isNaN(planIdNum)) {
    redirect('/membership/plans');
  }

  let plan = null;
  let error = null;
  let userProfile: UserProfileDTO | null = null;

  try {
    plan = await fetchMembershipPlanServer(planIdNum);
    if (!plan) {
      redirect('/membership/plans');
    }
  } catch (err) {
    console.error('Failed to fetch membership plan:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plan';
  }

  // Fetch user profile to check if user is registered (not a visitor)
  // This enables payment buttons automatically if user profile exists
  if (userId && !error) {
    try {
      const baseUrl = getAppUrl();
      if (!baseUrl) {
        console.warn('[MEMBERSHIP-SUBSCRIBE] NEXT_PUBLIC_APP_URL not set - skipping user profile fetch');
        // Continue without user profile - client component will handle fallback
      } else {
        const profileUrl = `${baseUrl}/api/proxy/user-profiles/by-user/${userId}`;
        console.log('[MEMBERSHIP-SUBSCRIBE] Fetching user profile from:', profileUrl);

        const response = await fetch(profileUrl, {
          cache: 'no-store',
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const profile = await response.json();
              userProfile = Array.isArray(profile) ? profile[0] : profile;
              if (userProfile && userProfile.id) {
                console.log('[MEMBERSHIP-SUBSCRIBE] User profile found - user is registered:', userProfile.id);
              } else {
                console.log('[MEMBERSHIP-SUBSCRIBE] User profile response received but no ID found');
              }
            } catch (jsonErr) {
              console.error('[MEMBERSHIP-SUBSCRIBE] Failed to parse user profile JSON:', jsonErr);
              // Continue without user profile - client component will handle fallback
            }
          } else {
            console.warn('[MEMBERSHIP-SUBSCRIBE] User profile response is not JSON:', contentType);
            // Continue without user profile - client component will handle fallback
          }
        } else if (response.status === 404) {
          // 404 is expected if user profile doesn't exist yet
          console.log('[MEMBERSHIP-SUBSCRIBE] User profile not found (404) - will be created by client component');
        } else {
          console.warn(`[MEMBERSHIP-SUBSCRIBE] User profile fetch returned status ${response.status}`);
          // Continue without user profile - client component will handle fallback
        }
      }
    } catch (err) {
      // Log full error details for debugging
      const errorDetails = err instanceof Error ? {
        message: err.message,
        stack: err.stack,
        name: err.name,
      } : { error: String(err) };
      console.error('[MEMBERSHIP-SUBSCRIBE] Error fetching user profile:', errorDetails);
      // Continue without user profile - client component will handle fallback
    }
  }

  return <SubscriptionSignupClient plan={plan} error={error} userProfile={userProfile} />;
}


