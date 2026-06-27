/**
 * Complete Incomplete Stripe Subscription
 *
 * This script completes an incomplete Stripe subscription by paying its invoice
 * using the payment intent that was already confirmed.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/complete-incomplete-subscription.js \
 *     --subscription-id=sub_1Skv22K5BrggeAHMcbl3nErG \
 *     --payment-intent-id=pi_3SkwCmK5BrggeAHM0zAU4EZU
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
const paymentIntentId = args['payment-intent-id'] || args.paymentIntentId;

if (!subscriptionId) {
  console.error('❌ Error: --subscription-id is required');
  console.log('Usage: node complete-incomplete-subscription.js --subscription-id=sub_xxx [--payment-intent-id=pi_xxx]');
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

async function completeSubscription() {
  try {
    console.log('\n🔄 Completing Incomplete Stripe Subscription');
    console.log('='.repeat(60));
    console.log(`Subscription ID: ${subscriptionId}`);
    if (paymentIntentId) {
      console.log(`Payment Intent ID: ${paymentIntentId}`);
    }
    console.log('='.repeat(60));

    // 1. Retrieve subscription
    console.log('\n📋 Step 1: Retrieving subscription...');
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'latest_invoice.payment_intent'],
    });

    console.log('✅ Subscription retrieved');
    console.log('   Status:', subscription.status);
    console.log('   Current period start:', new Date(subscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(subscription.current_period_end * 1000).toISOString());

    if (subscription.status !== 'incomplete' && subscription.status !== 'incomplete_expired') {
      console.log(`\n✅ Subscription is already ${subscription.status} - no action needed`);
      rl.close();
      return;
    }

    const latestInvoice = subscription.latest_invoice;
    if (!latestInvoice || typeof latestInvoice === 'string') {
      console.error('❌ Error: Could not retrieve latest invoice');
      rl.close();
      process.exit(1);
    }

    console.log('\n📋 Step 2: Checking invoice status...');
    console.log('   Invoice ID:', latestInvoice.id);
    console.log('   Invoice status:', latestInvoice.status);
    console.log('   Invoice amount:', `$${(latestInvoice.amount_due / 100).toFixed(2)}`);

    const invoicePaymentIntent = latestInvoice.payment_intent;
    const invoicePaymentIntentId = typeof invoicePaymentIntent === 'string'
      ? invoicePaymentIntent
      : invoicePaymentIntent?.id;

    console.log('   Invoice payment intent:', invoicePaymentIntentId || 'None');

    // 2. Pay the invoice
    if (latestInvoice.status === 'draft' || latestInvoice.status === 'open') {
      console.log('\n💳 Step 3: Paying invoice...');

      // If payment intent ID is provided and different from invoice's payment intent, use it
      if (paymentIntentId && paymentIntentId !== invoicePaymentIntentId) {
        console.log('   Using provided payment intent to pay invoice...');
        try {
          // Update invoice to use the provided payment intent
          const updatedInvoice = await stripe.invoices.update(latestInvoice.id, {
            payment_intent: paymentIntentId,
          });
          console.log('✅ Updated invoice to use payment intent:', paymentIntentId);

          // Pay the invoice
          const paidInvoice = await stripe.invoices.pay(updatedInvoice.id);
          console.log('✅ Invoice paid successfully');
          console.log('   Invoice status:', paidInvoice.status);
        } catch (error) {
          console.log('⚠️  Could not use provided payment intent, trying direct payment...');
          const paidInvoice = await stripe.invoices.pay(latestInvoice.id);
          console.log('✅ Invoice paid successfully');
          console.log('   Invoice status:', paidInvoice.status);
        }
      } else {
        // Pay invoice directly
        const paidInvoice = await stripe.invoices.pay(latestInvoice.id);
        console.log('✅ Invoice paid successfully');
        console.log('   Invoice status:', paidInvoice.status);
      }
    } else if (latestInvoice.status === 'paid') {
      console.log('\n✅ Invoice is already paid');
    } else {
      console.log(`\n⚠️  Invoice status is ${latestInvoice.status} - may need manual intervention`);
    }

    // 3. Wait a moment for Stripe to process
    console.log('\n⏳ Step 4: Waiting for Stripe to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Retrieve updated subscription
    console.log('\n📋 Step 5: Retrieving updated subscription...');
    const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    console.log('\n📊 Final Subscription State:');
    console.log('   Status:', updatedSubscription.status);
    console.log('   Current period start:', new Date(updatedSubscription.current_period_start * 1000).toISOString());
    console.log('   Current period end:', new Date(updatedSubscription.current_period_end * 1000).toISOString());

    if (updatedSubscription.status === 'active') {
      console.log('\n✅ Subscription is now ACTIVE!');
    } else {
      console.log(`\n⚠️  Subscription status is still ${updatedSubscription.status}`);
      console.log('   You may need to:');
      console.log('   1. Check if payment method is attached to customer');
      console.log('   2. Verify invoice payment intent was confirmed');
      console.log('   3. Wait a few more seconds for Stripe to process');
    }

    rl.close();
  } catch (error) {
    console.error('\n❌ Error completing subscription:', error.message);
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

completeSubscription();





