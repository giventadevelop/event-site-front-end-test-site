'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { MembershipPlanDTO } from '@/types';

interface PlanSummaryCardProps {
  plan: MembershipPlanDTO;
}

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getBillingIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'MONTHLY':
        return 'per month';
      case 'QUARTERLY':
        return 'per quarter';
      case 'YEARLY':
        return 'per year';
      case 'ONE_TIME':
        return 'one-time';
      default:
        return '';
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl text-foreground">Plan Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-body text-sm text-muted-foreground">Plan</p>
          <p className="font-body text-lg font-semibold text-foreground">{plan.planName}</p>
        </div>
        <div>
          <p className="font-body text-sm text-muted-foreground">Billing Interval</p>
          <p className="font-body text-lg text-foreground">{getBillingIntervalLabel(plan.billingInterval)}</p>
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-baseline justify-between">
            <span className="font-body text-lg font-semibold text-foreground">Total</span>
            <span className="font-body text-2xl font-bold text-foreground">
              {formatPrice(plan.price, plan.currency)}
            </span>
          </div>
          {plan.trialDays > 0 && (
            <p className="font-body text-sm text-muted-foreground mt-2">
              {plan.trialDays} day{plan.trialDays !== 1 ? 's' : ''} free trial included
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



