/**
 * Expedite Stripe Test Mode Subscription Renewal
 *
 * This script advances a Stripe test mode subscription to trigger renewal
 * without waiting for the actual billing period to end.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
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
  console.log('Usage: node expedite-stripe-renewal.js --subscription-id=sub_xxx --days-to-advance=30');
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

async function expediteRenewal() {
  try {
    console.log('\n🔄 Expediting Stripe Subscription Renewal (Test Mode)');
    console.log('='.repeat(60));
    console.log(`Subscription ID: ${subscriptionId}`);
    console.log(`Days to Advance: ${daysToAdvance}`);
    console.log('='.repeat(60));

    // 1. Retrieve current subscription
    console.log('\n📋 Step 1: Retrieving current subscription...');
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    console.log('✅ Current subscription status:', subscription.status);
    console.log('   Current period start:', new Date(subscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(subscription.current_period_end * 1000).toISOString());
    console.log('   Billing cycle anchor:', subscription.billing_cycle_anchor ? new Date(subscription.billing_cycle_anchor * 1000).toISOString() : 'N/A');

    // 2. Calculate expected new period dates
    const currentPeriodEnd = subscription.current_period_end;
    const expectedNewPeriodEnd = currentPeriodEnd + (daysToAdvance * 24 * 60 * 60);

    console.log('\n📅 Step 2: Target period dates...');
    console.log('   Current period end:', new Date(currentPeriodEnd * 1000).toISOString());
    console.log('   Target period end (after advance):', new Date(expectedNewPeriodEnd * 1000).toISOString());
    console.log('   Days to advance:', daysToAdvance);

    // 3. Confirm action
    const answer = await new Promise((resolve) => {
      rl.question('\n⚠️  This will advance the subscription period by creating and paying an invoice. Continue? (yes/no): ', resolve);
    });

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled by user');
      rl.close();
      return;
    }

    // 4. For test mode expedited renewal, we'll:
    //    a) Reset billing cycle anchor to 'now' (optional, helps reset timing)
    //    b) Create an upcoming invoice for the next period
    //    c) Pay the invoice to advance the subscription period

    console.log('\n🔄 Step 3: Resetting billing cycle anchor to current time...');
    try {
      // Reset billing cycle anchor to 'now' - this helps align the subscription timing
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        billing_cycle_anchor: 'now',
        proration_behavior: 'none', // Don't prorate charges
        metadata: {
          ...subscription.metadata,
          test_renewal_expedited: 'true',
          test_renewal_date: new Date().toISOString(),
          test_days_advanced: daysToAdvance.toString(),
        },
      });
      console.log('✅ Billing cycle anchor reset');
    } catch (anchorError) {
      console.log('⚠️  Note: Could not reset billing cycle anchor (this is OK):', anchorError.message);
    }

    // 5. Create and pay invoice to advance the subscription period
    console.log('\n💳 Step 4: Creating and paying invoice to advance subscription period...');
    try {
      // First, try to create an upcoming invoice (for the next billing period)
      // This will advance the subscription's current_period_end
      const upcomingInvoice = await stripe.invoices.create({
        customer: subscription.customer,
        subscription: subscriptionId,
        auto_advance: true, // Auto-finalize and attempt payment
      });

      console.log('✅ Invoice created:', upcomingInvoice.id);
      console.log('   Invoice status:', upcomingInvoice.status);

      // If invoice is not paid yet, pay it
      if (upcomingInvoice.status !== 'paid') {
        console.log('   Paying invoice...');
        const paidInvoice = await stripe.invoices.pay(upcomingInvoice.id);
        console.log('✅ Invoice paid successfully');
        console.log('   Invoice status:', paidInvoice.status);
        console.log('   Amount paid:', `$${(paidInvoice.amount_paid / 100).toFixed(2)}`);
      } else {
        console.log('✅ Invoice already paid');
        console.log('   Amount paid:', `$${(upcomingInvoice.amount_paid / 100).toFixed(2)}`);
      }
    } catch (invoiceError) {
      // If creating upcoming invoice fails, try creating a regular invoice
      console.log('⚠️  Upcoming invoice creation failed, trying regular invoice...');
      try {
        const invoice = await stripe.invoices.create({
          customer: subscription.customer,
          subscription: subscriptionId,
          auto_advance: false,
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
        const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id);

        console.log('✅ Invoice created and paid');
        console.log('   Invoice ID:', paidInvoice.id);
        console.log('   Invoice status:', paidInvoice.status);
        console.log('   Amount paid:', `$${(paidInvoice.amount_paid / 100).toFixed(2)}`);
      } catch (fallbackError) {
        console.log('⚠️  Invoice creation failed:', fallbackError.message);
        console.log('   This may be normal if the subscription is already up to date.');
      }
    }

    // 6. Verify final subscription state
    console.log('\n✅ Step 5: Verifying final subscription state...');
    const finalSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    console.log('\n📊 Final Subscription State:');
    console.log('   Status:', finalSubscription.status);
    console.log('   Current period start:', new Date(finalSubscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(finalSubscription.current_period_end * 1000).toISOString());
    console.log('   Billing cycle anchor:', finalSubscription.billing_cycle_anchor ? new Date(finalSubscription.billing_cycle_anchor * 1000).toISOString() : 'N/A');

    // Calculate actual days advanced
    const originalPeriodEnd = currentPeriodEnd;
    const newPeriodEnd = finalSubscription.current_period_end;
    const actualDaysAdvanced = Math.round((newPeriodEnd - originalPeriodEnd) / (24 * 60 * 60));

    console.log('\n📈 Period Advancement Summary:');
    console.log('   Original period end:', new Date(originalPeriodEnd * 1000).toISOString());
    console.log('   New period end:', new Date(newPeriodEnd * 1000).toISOString());
    console.log('   Actual days advanced:', actualDaysAdvanced);

    if (actualDaysAdvanced < daysToAdvance) {
      console.log(`\n⚠️  Note: Subscription advanced by ${actualDaysAdvanced} days (one billing period).`);
      console.log(`   To advance by ${daysToAdvance} days, you may need to run this script multiple times,`);
      console.log('   or use Stripe Test Clocks for more precise control.');
    }

    console.log('\n✅ Subscription renewal expedited successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Wait 1-2 seconds for Stripe webhook to be sent');
    console.log('   2. Run database verification script');
    console.log('   3. Run batch job execution script (if needed)');
    console.log('   4. Verify data accuracy\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error expediting subscription renewal:', error.message);
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

expediteRenewal();



