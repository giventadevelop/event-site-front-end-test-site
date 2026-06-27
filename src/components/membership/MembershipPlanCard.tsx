'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { MembershipPlanDTO } from '@/types';
import { PlanFeaturesList } from './PlanFeaturesList';

interface MembershipPlanCardProps {
  plan: MembershipPlanDTO;
  isCurrentPlan?: boolean;
  onSubscribe?: () => void;
}

export function MembershipPlanCard({ plan, isCurrentPlan = false, onSubscribe }: MembershipPlanCardProps) {
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

  const features = plan.featuresJson ? Object.entries(plan.featuresJson).map(([key, value]) => ({
    key,
    value: String(value),
  })) : [];

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-heading text-2xl text-foreground mb-2">
              {plan.planName}
            </CardTitle>
            {plan.description && (
              <CardDescription className="font-body text-muted-foreground">
                {plan.description}
              </CardDescription>
            )}
          </div>
          {isCurrentPlan && (
            <span className="ml-4 px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              Current Plan
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-sm text-muted-foreground">
              {getBillingIntervalLabel(plan.billingInterval)}
            </span>
          </div>
          {plan.trialDays > 0 && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded">
                {plan.trialDays} day{plan.trialDays !== 1 ? 's' : ''} free trial
              </span>
            </div>
          )}
        </div>
        {features.length > 0 && <PlanFeaturesList features={features} />}
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Link href={`/membership/subscribe/${plan.id}`} className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Subscribe
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}



