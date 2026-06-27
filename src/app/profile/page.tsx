import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfilePageWithLoading from '@/components/ProfilePageWithLoading';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <>
      <SubpageHomeDesignBackground bodyClass="profile-page-background" />
      <ProfilePageWithLoading initialUserId={userId} homepageDesign />
    </>
  );
}
