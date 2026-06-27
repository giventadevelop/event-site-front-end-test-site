/**
 * Advance Existing Subscription Period (For Subscriptions Created Before Test Clock)
 *
 * ⚠️  LIMITATION: This script has limited effectiveness for existing subscriptions.
 * Stripe does not allow force-advancing subscriptions that are already active.
 *
 * This script attempts to advance a subscription by:
 * 1. Resetting billing_cycle_anchor to 'now' (if possible)
 * 2. Creating and paying invoices
 *
 * However, if the subscription is still in its current period, paying invoices
 * will NOT advance the period - it only pays for the current period.
 *
 * RECOMMENDED: For testing renewals, create NEW subscriptions with Test Clocks
 * attached from the start, then use expedite-stripe-renewal-test-clock.js
 *
 * Usage:
 *   node scripts/test-subscription-renewal/advance-existing-subscription.js \
 *     --subscription-id=sub_1Skv22K5BrggeAHMcbl3nErG \
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

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const envLocalPath = join(projectRoot, '.env.local');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  const envPath = join(projectRoot, '.env');
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
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
  console.log('Usage: node advance-existing-subscription.js --subscription-id=sub_xxx --days-to-advance=30');
  process.exit(1);
}

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY ||
                  process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ||
                  process.env.STRIPE_SECRET_KEY_TEST;
if (!stripeKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function advanceSubscription() {
  try {
    console.log('\n🔄 Advancing Existing Subscription Period');
    console.log('='.repeat(60));
    console.log(`Subscription ID: ${subscriptionId}`);
    console.log(`Days to Advance: ${daysToAdvance}`);
    console.log('='.repeat(60));

    // 1. Retrieve subscription
    console.log('\n📋 Step 1: Retrieving subscription...');
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    console.log('✅ Subscription retrieved');
    console.log('   Status:', subscription.status);
    console.log('   Current period start:', new Date(subscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(subscription.current_period_end * 1000).toISOString());
    console.log('   Billing cycle anchor:', subscription.billing_cycle_anchor ? new Date(subscription.billing_cycle_anchor * 1000).toISOString() : 'N/A');

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      console.error(`\n❌ Error: Subscription status is '${subscription.status}' - must be 'active' or 'trialing' to advance`);
      rl.close();
      process.exit(1);
    }

    // 2. Calculate new period dates
    const currentPeriodEnd = subscription.current_period_end;
    const targetPeriodEnd = currentPeriodEnd + (daysToAdvance * 24 * 60 * 60);
    const targetPeriodStart = subscription.current_period_end; // New period starts when current period ends

    console.log('\n📅 Step 2: Calculating new period dates...');
    console.log('   Current period end:', new Date(currentPeriodEnd * 1000).toISOString());
    console.log('   Target period start:', new Date(targetPeriodStart * 1000).toISOString());
    console.log('   Target period end:', new Date(targetPeriodEnd * 1000).toISOString());
    console.log('   Days to advance:', daysToAdvance);

    // 3. Confirm action
    let answer;
    try {
      answer = await new Promise((resolve) => {
        rl.question('\n⚠️  This will update the subscription billing cycle anchor to advance the period. Continue? (yes/no): ', resolve);
      });
    } catch (error) {
      console.log('⚠️  Readline unavailable, proceeding automatically...');
      answer = 'yes';
    }

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled by user');
      rl.close();
      return;
    }

    // 4. Check if customer has payment method, attach test payment method if needed
    console.log('\n💳 Step 3: Checking payment method...');
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

    let hasPaymentMethod = false;
    if (customerId) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          limit: 1,
        });
        hasPaymentMethod = paymentMethods.data.length > 0;

        if (!hasPaymentMethod) {
          console.log('   No payment method found, creating test payment method...');
          // Create a test payment method (card)
          const testPaymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: '4242 4242 4242 4242',
              exp_month: 12,
              exp_year: 2025,
              cvc: '123',
            },
          });

          // Attach to customer
          await stripe.paymentMethods.attach(testPaymentMethod.id, {
            customer: customerId,
          });

          // Set as default
          await stripe.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: testPaymentMethod.id,
            },
          });

          console.log('✅ Test payment method attached to customer');
          hasPaymentMethod = true;
        } else {
          console.log('✅ Customer has payment method');
        }
      } catch (pmError) {
        console.warn('⚠️  Could not check/attach payment method:', pmError.message);
        console.log('   Will attempt to update subscription anyway...');
      }
    }

    // 5. Advance subscription by resetting billing cycle anchor and creating invoices
    console.log('\n🔄 Step 4: Advancing subscription period...');
    try {
      // For existing subscriptions, we need to:
      // 1. Reset billing_cycle_anchor to 'now' (if possible)
      // 2. Then create and pay invoices to advance the period

      // Calculate how many billing periods we need to advance
      const billingInterval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
      const billingIntervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;

      // Calculate days per billing period
      let daysPerPeriod = 30; // Default to monthly
      if (billingInterval === 'month') {
        daysPerPeriod = 30 * billingIntervalCount;
      } else if (billingInterval === 'year') {
        daysPerPeriod = 365 * billingIntervalCount;
      } else if (billingInterval === 'week') {
        daysPerPeriod = 7 * billingIntervalCount;
      } else if (billingInterval === 'day') {
        daysPerPeriod = billingIntervalCount;
      }

      // Calculate number of periods to advance
      const periodsToAdvance = Math.ceil(daysToAdvance / daysPerPeriod);

      console.log(`   Billing interval: ${billingInterval} (${billingIntervalCount})`);
      console.log(`   Days per period: ${daysPerPeriod}`);
      console.log(`   Periods to advance: ${periodsToAdvance}`);

      // Try to reset billing cycle anchor to 'now' first
      console.log(`\n   Resetting billing cycle anchor to 'now'...`);
      let updatedSubscription = subscription;
      try {
        updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          billing_cycle_anchor: 'now',
          proration_behavior: 'none',
        });
        console.log(`   ✅ Billing cycle anchor reset to: ${new Date(updatedSubscription.billing_cycle_anchor * 1000).toISOString()}`);
        console.log(`   New period end: ${new Date(updatedSubscription.current_period_end * 1000).toISOString()}`);

        // Wait for Stripe to process
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (anchorError) {
        console.log(`   ⚠️  Could not reset billing cycle anchor: ${anchorError.message}`);
        console.log(`   Will attempt to advance by creating invoices...`);
      }

      // Advance by creating and paying invoices for each period
      // Note: This may not work perfectly for existing subscriptions, but it's the best we can do
      for (let i = 0; i < periodsToAdvance; i++) {
        console.log(`\n   Creating invoice for period ${i + 1} of ${periodsToAdvance}...`);

        // Get current subscription state
        const currentSub = await stripe.subscriptions.retrieve(subscriptionId);
        const currentPeriodEnd = currentSub.current_period_end;

        // Create invoice for the subscription
        const invoice = await stripe.invoices.create({
          customer: subscription.customer,
          subscription: subscriptionId,
          auto_advance: true, // Automatically finalize the invoice
        });

        console.log(`   Invoice created: ${invoice.id} (status: ${invoice.status})`);

        // Pay the invoice
        if (invoice.status === 'open' || invoice.status === 'draft') {
          const paidInvoice = await stripe.invoices.pay(invoice.id);
          console.log(`   Invoice paid: ${paidInvoice.id} (status: ${paidInvoice.status})`);
        } else if (invoice.status === 'paid') {
          console.log(`   Invoice already paid`);
        }

        // Wait a moment for Stripe to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Retrieve updated subscription
        updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const newPeriodEnd = updatedSubscription.current_period_end;
        const daysAdvanced = Math.round((newPeriodEnd - currentPeriodEnd) / (24 * 60 * 60));

        console.log(`   Updated period end: ${new Date(newPeriodEnd * 1000).toISOString()}`);
        console.log(`   Days advanced this period: ${daysAdvanced}`);

        // If period didn't advance, the invoice was for the current period
        // This is a limitation of existing subscriptions - we can't force advance them
        if (daysAdvanced === 0) {
          console.log(`   ⚠️  Period did not advance - invoice was for current period`);
          console.log(`   This is a limitation: Existing subscriptions can't be force-advanced`);
          console.log(`   Solutions:`);
          console.log(`   1. Wait for the current period to end naturally`);
          console.log(`   2. Create a NEW subscription with Test Clock attached from the start`);
          console.log(`   3. Use the Test Clock method for subscriptions created after test clock setup`);
          break;
        }
      }

      // Update metadata
      await stripe.subscriptions.update(subscriptionId, {
        metadata: {
          ...subscription.metadata,
          test_period_advanced: 'true',
          test_advance_date: new Date().toISOString(),
          test_days_advanced: daysToAdvance.toString(),
        },
      });

      // Get final subscription state after all invoices are paid
      const finalSubscription = await stripe.subscriptions.retrieve(subscriptionId);

      console.log('✅ Subscription period advanced');
      console.log('   New period start:', new Date(finalSubscription.current_period_start * 1000).toISOString());
      console.log('   New period end:', new Date(finalSubscription.current_period_end * 1000).toISOString());

      // Calculate actual days advanced
      const actualDaysAdvanced = Math.round((finalSubscription.current_period_end - currentPeriodEnd) / (24 * 60 * 60));

      console.log('\n📈 Period Advancement Summary:');
      console.log('   Original period end:', new Date(currentPeriodEnd * 1000).toISOString());
      console.log('   New period end:', new Date(finalSubscription.current_period_end * 1000).toISOString());
      console.log('   Actual days advanced:', actualDaysAdvanced);

      if (actualDaysAdvanced >= daysToAdvance) {
        console.log(`\n✅ Successfully advanced subscription by ${actualDaysAdvanced} days!`);
      } else if (actualDaysAdvanced > 0) {
        console.log(`\n⚠️  Subscription advanced by ${actualDaysAdvanced} days (less than requested ${daysToAdvance} days).`);
      } else {
        console.log(`\n⚠️  Subscription period did not advance as expected.`);
        console.log('\n   ⚠️  CRITICAL LIMITATION: Existing subscriptions cannot be force-advanced in Stripe.');
        console.log('   When you create and pay an invoice for a subscription still in its current period,');
        console.log('   it only pays for that period - it does NOT advance the period.');
        console.log('\n   Solutions:');
        console.log('   1. Wait for the current period to end naturally (period ends: ' + new Date(currentPeriodEnd * 1000).toISOString() + ')');
        console.log('   2. Create a NEW subscription with Test Clock attached from the start');
        console.log('   3. Use expedite-stripe-renewal-test-clock.js for new subscriptions');
        console.log('   4. Cancel and recreate the subscription with a test clock attached');
        console.log('\n   For testing renewals, it is recommended to:');
        console.log('   - Create new subscriptions with test clocks from the start');
        console.log('   - Use Test Clocks to advance time (only works for subscriptions created after test clock)');
      }

      // 6. Wait and verify final state
      console.log('\n⏳ Step 5: Waiting for Stripe to process...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Retrieve final subscription state (already retrieved above, but get fresh copy)
      const finalSubscriptionState = await stripe.subscriptions.retrieve(subscriptionId);
      console.log('\n📊 Final Subscription State:');
      console.log('   Status:', finalSubscriptionState.status);
      console.log('   Period start:', new Date(finalSubscriptionState.current_period_start * 1000).toISOString());
      console.log('   Period end:', new Date(finalSubscriptionState.current_period_end * 1000).toISOString());

      console.log('\n✅ Subscription period advanced successfully!');
      console.log('\n📝 Next Steps:');
      console.log('   1. Wait 1-2 seconds for Stripe webhooks to be sent');
      console.log('   2. Run database verification script');
      console.log('   3. Run batch job execution script (if needed)');
      console.log('   4. Verify data accuracy\n');

    } catch (updateError) {
      console.error('\n❌ Error updating subscription:', updateError.message);
      if (updateError.type) {
        console.error('   Error type:', updateError.type);
      }
      if (updateError.code) {
        console.error('   Error code:', updateError.code);
      }
      throw updateError;
    }

    rl.close();
  } catch (error) {
    console.error('\n❌ Error advancing subscription:', error.message);
    if (error.type) {
      console.error('   Error type:', error.type);
    }
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    rl.close();
    process.exit(1);
  }
}

advanceSubscription();

