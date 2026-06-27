import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchUserSubscriptionServer } from './ApiServerActions';
import { fetchAdminProfileServer } from '@/app/admin/manage-usage/ApiServerActions';
import { SubscriptionManagementClient } from './SubscriptionManagementClient';

export const metadata: Metadata = {
  title: 'Manage Subscription',
  description: 'Manage your membership subscription',
};

export default async function SubscriptionManagementPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/membership/manage');
  }

  let subscription = null;
  let userProfile = null;
  let error = null;

  try {
    userProfile = await fetchAdminProfileServer(userId);
    if (userProfile?.id) {
      subscription = await fetchUserSubscriptionServer(userProfile.id);
    }
  } catch (err) {
    console.error('Failed to fetch subscription:', err);
    error = err instanceof Error ? err.message : 'Failed to load subscription';
  }

  return <SubscriptionManagementClient subscription={subscription} error={error} />;
}


