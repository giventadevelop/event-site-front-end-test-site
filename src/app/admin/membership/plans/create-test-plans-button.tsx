'use client';

import { useState } from 'react';
import { createMembershipPlanServer } from './ApiServerActions';
import type { MembershipPlanDTO } from '@/types';

/**
 * Component to create test plans (Plan 2 and Plan 3) for testing
 * This can be added temporarily to the admin page for quick test data creation
 */
export function CreateTestPlansButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testPlans: Array<Omit<MembershipPlanDTO, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      planName: 'Plan 2',
      planCode: 'plan_2',
      description: 'Test plan 2 for membership subscription',
      planType: 'SUBSCRIPTION',
      billingInterval: 'MONTHLY',
      price: 0.70,
      currency: 'USD',
      trialDays: 0,
      isActive: true,
      maxEventsPerMonth: null,
      maxAttendeesPerEvent: null,
      featuresJson: {},
    },
    {
      planName: 'Plan 3',
      planCode: 'plan_3',
      description: 'Test plan 3 for membership subscription',
      planType: 'SUBSCRIPTION',
      billingInterval: 'MONTHLY',
      price: 0.80,
      currency: 'USD',
      trialDays: 0,
      isActive: true,
      maxEventsPerMonth: null,
      maxAttendeesPerEvent: null,
      featuresJson: {},
    },
  ];

  const handleCreateTestPlans = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setStatus('Creating test plans...');

    try {
      const results = [];
      for (const plan of testPlans) {
        try {
          setStatus(`Creating ${plan.planName}...`);
          const createdPlan = await createMembershipPlanServer(plan);
          results.push({ success: true, plan: createdPlan.planName, id: createdPlan.id });
          console.log('✅ Created plan:', createdPlan.planName, 'ID:', createdPlan.id);

          // Wait 1 second between creations to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.push({ success: false, plan: plan.planName, error: errorMessage });
          console.error('❌ Failed to create plan:', plan.planName, error);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        setStatus(`✅ Created ${successCount} plan(s) successfully. ${failCount > 0 ? `${failCount} failed.` : ''} Refresh the page to see them.`);
        // Auto-refresh after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus(`❌ Failed to create plans. Check console for details.`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">Create Test Plans</h3>
          <p className="text-xs text-yellow-700">
            Creates Plan 2 ($0.70) and Plan 3 ($0.80) for testing purposes
          </p>
          {status && (
            <p className={`text-xs mt-2 ${status.includes('✅') ? 'text-green-700' : status.includes('❌') ? 'text-red-700' : 'text-yellow-700'}`}>
              {status}
            </p>
          )}
        </div>
        <button
          onClick={handleCreateTestPlans}
          disabled={isCreating}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          type="button"
        >
          {isCreating ? 'Creating...' : 'Create Test Plans'}
        </button>
      </div>
    </div>
  );
}

