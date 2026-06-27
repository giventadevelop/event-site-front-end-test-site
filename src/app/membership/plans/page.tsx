import { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { fetchMembershipPlansServer } from './ApiServerActions';
import { fetchUserSubscriptionServer } from '../manage/ApiServerActions';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import { MembershipPlansClient } from './MembershipPlansClient';
import type { MembershipPlanDTO, MembershipSubscriptionDTO } from '@/types';

export const metadata: Metadata = {
  title: 'Membership Plans',
  description: 'Choose the membership plan that works best for you',
};

async function MembershipPlansPageContent() {
  // CRITICAL: Next.js 15+ requires headers() to be awaited before auth()
  await headers(); // Fully await headers() before calling auth()

  let plans: MembershipPlanDTO[] = [];
  let error: string | null = null;
  let userSubscription: MembershipSubscriptionDTO | null = null;
  let hasUserProfile = false;

  try {
    plans = await fetchMembershipPlansServer({ isActive: true, sort: 'price,asc' });

    // Fetch user subscription if authenticated
    try {
      const { userId } = await auth();
      if (userId) {
        const userProfile = await fetchUserProfileServer(userId);
        if (userProfile?.id) {
          hasUserProfile = true;
          userSubscription = await fetchUserSubscriptionServer(userProfile.id);
        }
      }
    } catch (subErr) {
      // Non-fatal - subscription fetch failure shouldn't break the page
      console.error('Failed to fetch user subscription:', subErr);
    }
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  // Check authentication status
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <MembershipPlansClient
      plans={plans}
      error={error}
      userSubscription={userSubscription}
      isAuthenticated={isAuthenticated}
      hasUserProfile={hasUserProfile}
    />
  );
}

export default function MembershipPlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="text-center">
            <p className="font-body text-muted-foreground">Loading membership plans...</p>
          </div>
        </div>
      </div>
    }>
      <MembershipPlansPageContent />
    </Suspense>
  );
}



