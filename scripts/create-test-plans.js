/**
 * Script to create test membership plans (Plan 2 and Plan 3)
 * Run with: node scripts/create-test-plans.js
 */

// Note: This script needs to be run in a Next.js environment where server actions can be called
// For now, we'll create a client-side helper that can be called from the browser console

const testPlans = [
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

// Browser console code to create plans
const browserConsoleCode = `
// Copy and paste this code into the browser console on http://localhost:3000/admin/membership/plans

async function createTestPlans() {
  const testPlans = ${JSON.stringify(testPlans, null, 2)};

  for (const plan of testPlans) {
    try {
      console.log('Creating plan:', plan.planName);

      const response = await fetch('/api/proxy/membership-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...plan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const createdPlan = await response.json();
        console.log('✅ Created plan:', createdPlan.planName, 'ID:', createdPlan.id);
      } else {
        const error = await response.text();
        console.error('❌ Failed to create plan:', plan.planName, error);
      }
    } catch (error) {
      console.error('❌ Error creating plan:', plan.planName, error);
    }

    // Wait 1 second between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Finished creating test plans. Refresh the page to see them.');
  window.location.reload();
}

createTestPlans();
`;

console.log('='.repeat(80));
console.log('Test Plans Creation Script');
console.log('='.repeat(80));
console.log('\nTo create test plans, copy and paste the following code into your browser console');
console.log('while on the page: http://localhost:3000/admin/membership/plans\n');
console.log(browserConsoleCode);
console.log('\n' + '='.repeat(80));

