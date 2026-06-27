import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { PollList } from '@/components/polls/PollList';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import PollsPageBackground from './PollsPageBackground';
import { HomeSectionEyebrow } from '@/components/HomeSectionEyebrow';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

export default async function PollsPage() {
  // CRITICAL: Next.js 15+ requires headers() to be awaited before calling auth()
  await headers();
  // Ensure auth() is properly awaited
  const authResult = await auth();
  const { userId } = authResult;

  // Get user profile if logged in
  let userProfile = null;
  if (userId) {
    try {
      userProfile = await fetchUserProfileServer(userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  return (
    <>
      <PollsPageBackground />
      <div className="home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <HomeSectionEyebrow label="Community" className="mb-4" />
            <HomeSectionTitle className="mb-4">Polls</HomeSectionTitle>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
              Participate in interactive polls and share your opinions with our community
            </p>
          </div>

          <PollList userId={userProfile?.id} />
        </div>
      </div>
    </>
  );
}

