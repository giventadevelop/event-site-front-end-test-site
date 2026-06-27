'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MembershipSubscriptionDTO } from '@/types';
import { formatInTimeZone } from 'date-fns-tz';

interface CurrentSubscriptionCardProps {
  subscription: MembershipSubscriptionDTO;
}

export function CurrentSubscriptionCard({ subscription }: CurrentSubscriptionCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatInTimeZone(new Date(dateString), Intl.DateTimeFormat().resolvedOptions().timeZone, 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'TRIAL':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      case 'PAST_DUE':
        return 'destructive';
      case 'EXPIRED':
        return 'outline';
      case 'SUSPENDED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'PAST_DUE':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'TRIAL':
        return 'Trial';
      case 'CANCELLED':
        return 'Cancelled';
      case 'PAST_DUE':
        return 'Past Due';
      case 'EXPIRED':
        return 'Expired';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return status;
    }
  };

  const isTrial = subscription.subscriptionStatus === 'TRIAL';
  const nextBillingDate = isTrial && subscription.trialEnd
    ? subscription.trialEnd
    : subscription.currentPeriodEnd;

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl text-foreground">Current Subscription</CardTitle>
          <Badge
            variant={getStatusBadgeVariant(subscription.subscriptionStatus)}
            className={`${getStatusBadgeClassName(subscription.subscriptionStatus)} font-semibold px-3 py-1 border`}
          >
            {getStatusLabel(subscription.subscriptionStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.membershipPlan && (
          <div>
            <p className="font-body text-sm text-muted-foreground">Plan</p>
            <p className="font-body text-lg font-semibold text-foreground">
              {subscription.membershipPlan.planName}
            </p>
          </div>
        )}
        <div>
          <p className="font-body text-sm text-muted-foreground">Current Period</p>
          <p className="font-body text-base text-foreground">
            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>
        {isTrial && subscription.trialEnd && (
          <div>
            <p className="font-body text-sm text-muted-foreground">Trial Ends</p>
            <p className="font-body text-base text-foreground">{formatDate(subscription.trialEnd)}</p>
          </div>
        )}
        <div>
          <p className="font-body text-sm text-muted-foreground">
            {isTrial ? 'Trial ends' : 'Next billing date'}
          </p>
          <p className="font-body text-base font-semibold text-foreground">
            {formatDate(nextBillingDate)}
          </p>
        </div>
        {subscription.cancelAtPeriodEnd && (
          <div className="pt-4 border-t">
            <p className="font-body text-sm text-orange-600">
              Your subscription will be cancelled at the end of the current billing period.
            </p>
            {subscription.cancellationReason && (
              <p className="font-body text-xs text-muted-foreground mt-1">
                Reason: {subscription.cancellationReason}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



