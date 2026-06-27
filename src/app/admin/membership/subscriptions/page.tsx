import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth } from '@/lib/safe-auth';
import { fetchAllSubscriptionsServer } from './ApiServerActions';
import { AdminSubscriptionsClient } from './AdminSubscriptionsClient';

export const metadata: Metadata = {
  title: 'Admin - Subscriptions',
  description: 'Manage user subscriptions',
};

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { userId } = await safeAuth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/membership/subscriptions');
  }

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 20;

  let result = { data: [], totalCount: 0 };
  let error = null;

  try {
    result = await fetchAllSubscriptionsServer({
      subscriptionStatus: params.status,
      page,
      pageSize,
    });
  } catch (err) {
    console.error('Failed to fetch subscriptions:', err);
    error = err instanceof Error ? err.message : 'Failed to load subscriptions';
  }

  return (
    <AdminSubscriptionsClient
      subscriptions={result.data}
      totalCount={result.totalCount}
      currentPage={page}
      pageSize={pageSize}
      error={error}
    />
  );
}

