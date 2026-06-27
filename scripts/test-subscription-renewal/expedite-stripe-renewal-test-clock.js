/**
 * Expedite Stripe Test Mode Subscription Renewal Using Test Clocks
 *
 * This script uses Stripe Test Clocks to advance time for a subscription,
 * which is the proper way to test subscription renewals in Stripe test mode.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/expedite-stripe-renewal-test-clock.js \
 *     --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
 *     --days-to-advance=30
 *
 * Environment Variables Required:
 *   - STRIPE_SECRET_KEY (test mode key)
 */

import Stripe from 'stripe';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load environment variables from .env.local in project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const envLocalPath = join(projectRoot, '.env.local');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  // Fallback to .env if .env.local doesn't exist
  const envPath = join(projectRoot, '.env');
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    // Try default dotenv behavior (loads from current directory)
    dotenv.config();
  }
}

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value;
  return acc;
}, {});

const subscriptionId = args['subscription-id'] || args.subscriptionId;
const daysToAdvance = parseInt(args['days-to-advance'] || args.daysToAdvance || '30', 10);

if (!subscriptionId) {
  console.error('❌ Error: --subscription-id is required');
  console.log('Usage: node expedite-stripe-renewal-test-clock.js --subscription-id=sub_xxx --days-to-advance=30');
  process.exit(1);
}

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY ||
                  process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ||
                  process.env.STRIPE_SECRET_KEY_TEST;
if (!stripeKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  console.error('   Please add STRIPE_SECRET_KEY to your .env.local file in the project root');
  console.error('   Example: STRIPE_SECRET_KEY=sk_test_...');
  console.error(`   Checked: ${envLocalPath}`);
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
});

// Confirm action
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function expediteRenewalWithTestClock() {
  try {
    console.log('\n🔄 Expediting Stripe Subscription Renewal Using Test Clock');
    console.log('='.repeat(60));
    console.log(`Subscription ID: ${subscriptionId}`);
    console.log(`Days to Advance: ${daysToAdvance}`);
    console.log('='.repeat(60));

    // 1. Retrieve current subscription
    console.log('\n📋 Step 1: Retrieving current subscription...');
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product', 'customer'],
    });

    console.log('✅ Current subscription status:', subscription.status);
    console.log('   Current period start:', new Date(subscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(subscription.current_period_end * 1000).toISOString());
    console.log('   Test Clock ID:', subscription.test_clock || 'None (not attached to test clock)');

    // Check if subscription is already attached to a test clock
    let testClockId = subscription.test_clock;
    const subscriptionCreated = subscription.created;

    // Get customer ID for use throughout the function
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

    // 2. Get or create test clock
    if (!testClockId) {
      console.log('\n📅 Step 2: Finding or creating test clock...');

      // First, check if customer is attached to a test clock

      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.test_clock) {
            testClockId = customer.test_clock;
            console.log('✅ Found existing test clock from customer:', testClockId);
          }
        } catch (error) {
          console.log('⚠️  Note: Could not retrieve customer:', error.message);
        }
      }

      // If still no test clock, check for existing test clocks
      if (!testClockId) {
        console.log('   Checking for existing test clocks...');
        try {
          const existingTestClocks = await stripe.testHelpers.testClocks.list({ limit: 100 });

          if (existingTestClocks.data.length > 0) {
            // Find test clocks created before the subscription
            // Subscriptions created after a test clock should automatically attach to it
            const suitableClocks = existingTestClocks.data.filter(clock =>
              clock.created <= subscriptionCreated
            );

            if (suitableClocks.length > 0) {
              // Use the most recent test clock that was created before the subscription
              suitableClocks.sort((a, b) => b.created - a.created);
              testClockId = suitableClocks[0].id;
              console.log('✅ Found existing test clock created before subscription:', testClockId);
              console.log('   Test clock name:', suitableClocks[0].name || '(unnamed)');
              console.log('   Test clock created:', new Date(suitableClocks[0].created * 1000).toISOString());
              console.log('   Subscription created:', new Date(subscriptionCreated * 1000).toISOString());

              // CRITICAL: Check if customer is attached to this test clock
              if (customerId) {
                try {
                  const customer = await stripe.customers.retrieve(customerId);
                  if (customer.test_clock === testClockId) {
                    console.log('✅ Customer is attached to this test clock - subscription should advance.');
                  } else if (customer.test_clock) {
                    console.log('⚠️  Customer is attached to a different test clock:', customer.test_clock);
                    console.log('   This subscription may not advance with the selected test clock.');
                  } else {
                    console.log('⚠️  Customer is NOT attached to any test clock.');
                    console.log('   ⚠️  Cannot attach customer to test clock retroactively.');
                    console.log('   Stripe does not allow updating test_clock on existing customers.');
                    console.log('   The test_clock must be set when creating the customer or subscription.');
                    console.log('   Solution: Create a NEW subscription with customer already attached to test clock.');
                  }
                } catch (error) {
                  console.log('⚠️  Could not check customer test clock status:', error.message);
                }
              }
            } else {
              // All test clocks were created after the subscription
              // Use the oldest test clock (closest to subscription creation time)
              existingTestClocks.data.sort((a, b) => a.created - b.created);
              testClockId = existingTestClocks.data[0].id;
              console.log('⚠️  All test clocks were created after subscription.');
              console.log('   Using oldest test clock:', testClockId);
              console.log('   Note: This subscription may not advance with the test clock.');
              console.log('   For proper testing, create new subscriptions after setting up the test clock.');
            }
          }
        } catch (error) {
          console.log('⚠️  Note: Could not list existing test clocks:', error.message);
        }
      }

      // If still no test clock, create one
      if (!testClockId) {
        console.log('   No suitable test clock found. Creating new test clock...');
        const testClock = await stripe.testHelpers.testClocks.create({
          name: `Test Clock for Subscription ${subscriptionId}`,
          frozen_time: Math.floor(Date.now() / 1000), // Current time
        });
        testClockId = testClock.id;
        console.log('✅ Created new test clock:', testClockId);
        console.log('   Test clock time:', new Date(testClock.frozen_time * 1000).toISOString());
        console.log('⚠️  Note: This subscription was created before the test clock.');
        console.log('   Stripe Test Clocks work best for subscriptions created AFTER the test clock.');
        console.log('   For proper testing, create new subscriptions with the customer attached to test clock first.');
        console.log('   Attempting to advance anyway...');
      }
    } else {
      console.log('\n📅 Step 2: Using existing test clock:', testClockId);

      // Verify customer is attached to this test clock
      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.test_clock === testClockId) {
            console.log('✅ Customer is attached to this test clock - subscription should advance.');
          } else if (customer.test_clock) {
            console.log('⚠️  Customer is attached to a different test clock:', customer.test_clock);
            console.log('   Subscription may not advance with the current test clock.');
          } else {
            console.log('⚠️  Customer is NOT attached to any test clock.');
            console.log('   Subscription will not advance even if test clock is advanced.');
            console.log('   ⚠️  Cannot attach customer to test clock retroactively.');
            console.log('   Stripe does not allow updating test_clock on existing customers.');
            console.log('   Solution: Create a NEW subscription with customer already attached to test clock.');
          }
        } catch (error) {
          console.log('⚠️  Could not check customer test clock status:', error.message);
        }
      }
    }

    // 3. Get current test clock time
    const testClock = await stripe.testHelpers.testClocks.retrieve(testClockId);
    const currentTestClockTime = testClock.frozen_time;
    const targetTime = currentTestClockTime + (daysToAdvance * 24 * 60 * 60);

    console.log('\n📅 Step 3: Calculating time advancement...');
    console.log('   Current test clock time:', new Date(currentTestClockTime * 1000).toISOString());
    console.log('   Target time (after advance):', new Date(targetTime * 1000).toISOString());
    console.log('   Days to advance:', daysToAdvance);

    // 4. Confirm action
    let answer;
    try {
      answer = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          rl.close();
          reject(new Error('Timeout'));
        }, 30000); // 30 second timeout

        rl.question('\n⚠️  This will advance the test clock, which will trigger subscription renewals and webhooks. Continue? (yes/no): ', (input) => {
          clearTimeout(timeout);
          resolve(input);
        });
      });
    } catch (error) {
      // If readline fails or times out, default to 'yes' for non-interactive use
      console.log('⚠️  Readline unavailable or timed out, proceeding automatically...');
      answer = 'yes';
    }

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled by user');
      rl.close();
      return;
    }

    // 5. Advance test clock
    console.log('\n⏰ Step 4: Advancing test clock...');
    const advancedTestClock = await stripe.testHelpers.testClocks.advance(testClockId, {
      frozen_time: targetTime,
    });

    console.log('✅ Test clock advanced successfully');
    console.log('   New test clock time:', new Date(advancedTestClock.frozen_time * 1000).toISOString());
    console.log('   Time advanced by:', daysToAdvance, 'days');

    // 6. Wait a moment for Stripe to process the advancement
    console.log('\n⏳ Step 5: Waiting for Stripe to process subscription renewal...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

    // 7. Retrieve updated subscription
    console.log('\n📋 Step 6: Retrieving updated subscription...');
    const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    console.log('\n📊 Final Subscription State:');
    console.log('   Status:', updatedSubscription.status);
    console.log('   Current period start:', new Date(updatedSubscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(updatedSubscription.current_period_end * 1000).toISOString());

    // Calculate actual days advanced
    const originalPeriodEnd = subscription.current_period_end;
    const newPeriodEnd = updatedSubscription.current_period_end;
    const actualDaysAdvanced = Math.round((newPeriodEnd - originalPeriodEnd) / (24 * 60 * 60));

    console.log('\n📈 Period Advancement Summary:');
    console.log('   Original period end:', new Date(originalPeriodEnd * 1000).toISOString());
    console.log('   New period end:', new Date(newPeriodEnd * 1000).toISOString());
    console.log('   Actual days advanced:', actualDaysAdvanced);

    // Check if subscription is now attached to test clock
    const finalSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const isAttachedToTestClock = finalSubscription.test_clock === testClockId;

    if (actualDaysAdvanced >= daysToAdvance) {
      console.log(`\n✅ Successfully advanced subscription by ${actualDaysAdvanced} days!`);
    } else if (actualDaysAdvanced > 0) {
      console.log(`\n⚠️  Subscription advanced by ${actualDaysAdvanced} days (less than requested ${daysToAdvance} days).`);
      console.log('   This may be because the subscription renewed at its natural billing cycle.');
      console.log('   You can advance the test clock further to continue testing.');
    } else {
      console.log(`\n⚠️  Subscription period did not advance.`);

      if (!isAttachedToTestClock) {
        console.log('\n🔍 Root Cause Analysis:');
        console.log('   ❌ Subscription is NOT attached to the test clock.');
        console.log('   This is why the subscription did not advance.');
        console.log('\n   Why this happens:');
        console.log('   - The customer was not attached to the test clock when the subscription was created');
        console.log('   - Stripe cannot retroactively attach existing subscriptions to test clocks');
        console.log('   - Only subscriptions created AFTER the customer is attached to a test clock will advance');
        console.log('\n   Current Status:');
        console.log(`   - Subscription test clock: ${finalSubscription.test_clock || 'None'}`);
        console.log(`   - Selected test clock: ${testClockId}`);
        if (customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            console.log(`   - Customer test clock: ${customer.test_clock || 'None'}`);
          } catch (error) {
            // Ignore error
          }
        }
      } else {
        console.log('\n   Possible reasons:');
        console.log('   - Subscription billing cycle has not reached renewal point');
        console.log('   - Payment method issues preventing renewal');
        console.log('   - Subscription is in incomplete status (needs to be activated first)');
      }

      console.log('\n💡 Solution for existing subscriptions:');
      console.log('   1. ✅ Create a NEW subscription with customer attached to test clock from the start');
      console.log('      - Use setup-test-clock.js to attach customer to test clock first');
      console.log('      - Then create a new subscription (it will automatically use the test clock)');
      console.log('   2. OR use the invoice payment method (expedite-stripe-renewal.js) - has limitations');
      console.log('   3. OR manually update subscription period dates via Stripe API (not recommended)');
    }

    console.log('\n✅ Test clock advancement completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Wait 1-2 seconds for Stripe webhooks to be sent');
    console.log('   2. Run database verification script');
    console.log('   3. Run batch job execution script (if needed)');
    console.log('   4. Verify data accuracy');
    console.log(`\n💡 Tip: Test Clock ID: ${testClockId}`);
    console.log('   You can reuse this test clock for future tests by attaching new subscriptions to it.\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error expediting subscription renewal:', error.message);
    if (error.type) {
      console.error('   Error type:', error.type);
    }
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    rl.close();
    process.exit(1);
  }
}

expediteRenewalWithTestClock();

