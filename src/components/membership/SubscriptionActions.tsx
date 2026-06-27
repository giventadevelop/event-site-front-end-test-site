'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { MembershipSubscriptionDTO } from '@/types';
import { cancelSubscriptionServer } from '@/app/membership/manage/ApiServerActions';
import { useRouter } from 'next/navigation';

interface SubscriptionActionsProps {
  subscription: MembershipSubscriptionDTO;
}

export function SubscriptionActions({ subscription }: SubscriptionActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!subscription.id) return;

    try {
      setIsLoading(true);
      setError(null);
      await cancelSubscriptionServer(subscription.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      {subscription.cancelAtPeriodEnd ? (
        <div className="p-3 text-sm text-orange-800 bg-orange-100 rounded-md">
          Your subscription is scheduled to be cancelled at the end of the current billing period.
        </div>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 items-center justify-center gap-3 px-6 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Cancel Subscription"
              aria-label="Cancel Subscription"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-red-700">Cancel Subscription</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your subscription? Your subscription will remain active until the end of
                the current billing period ({subscription.currentPeriodEnd}), after which you will lose access to
                premium features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
                {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}



