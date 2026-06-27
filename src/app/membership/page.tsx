import { Metadata } from 'next';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { fetchMembershipPlansServer } from './plans/ApiServerActions';
import { fetchUserSubscriptionServer } from './manage/ApiServerActions';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import { MembershipClient } from './MembershipClient';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import type { MembershipPlanDTO, MembershipSubscriptionDTO } from '@/types';

export const metadata: Metadata = {
  title: 'Membership',
  description: 'Join our membership program and enjoy exclusive benefits',
};

export default async function MembershipPage() {
  // CRITICAL: Next.js 15+ requires headers() to be awaited and stored before auth()
  const headersList = await headers(); // Fully await headers() before calling auth()

  let plans: MembershipPlanDTO[] = [];
  let error: string | null = null;
  let userSubscription: MembershipSubscriptionDTO | null = null;
  let hasUserProfile = false;

  // Get auth status once (after headers() is awaited)
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  try {
    plans = await fetchMembershipPlansServer({ isActive: true, sort: 'price,asc' });

    // Fetch user subscription if authenticated
    if (userId) {
      try {
        const userProfile = await fetchUserProfileServer(userId);
        if (userProfile?.id) {
          hasUserProfile = true;
          userSubscription = await fetchUserSubscriptionServer(userProfile.id);
        }
      } catch (subErr) {
        // Non-fatal - subscription fetch failure shouldn't break the page
        console.error('Failed to fetch user subscription:', subErr);
      }
    }
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  return (
    <>
      <SubpageHomeDesignBackground bodyClass="membership-page-background" />
      <MembershipClient
        plans={plans}
        error={error}
        userSubscription={userSubscription}
        isAuthenticated={isAuthenticated}
        hasUserProfile={hasUserProfile}
        homepageDesign
      />
    </>
  );
}





