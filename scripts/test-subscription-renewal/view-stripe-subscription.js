/**
 * View Stripe Subscription Details
 *
 * This script retrieves and displays detailed information about a Stripe subscription
 * including dates, status, billing information, and other attributes.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/view-stripe-subscription.js \
 *     --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
 *
 * Environment Variables Required:
 *   - STRIPE_SECRET_KEY (test mode key)
 */

import Stripe from 'stripe';
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

if (!subscriptionId) {
  console.error('❌ Error: --subscription-id is required');
  console.log('Usage: node view-stripe-subscription.js --subscription-id=sub_xxx');
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

async function viewSubscription() {
  try {
    console.log('\n📋 Retrieving Stripe Subscription Details');
    console.log('='.repeat(70));
    console.log(`Subscription ID: ${subscriptionId}`);
    console.log('='.repeat(70));

    // Retrieve subscription with expanded details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: [
        'customer',
        'items.data.price.product',
        'latest_invoice',
        'default_payment_method',
      ],
    });

    // Format dates
    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);
    const createdAt = new Date(subscription.created * 1000);
    const canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;
    const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null;
    const trialStart = subscription.trial_start ? new Date(subscription.trial_start * 1000) : null;
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    const billingCycleAnchor = subscription.billing_cycle_anchor
      ? new Date(subscription.billing_cycle_anchor * 1000)
      : null;
    const currentPeriodStartDate = periodStart.toISOString().split('T')[0];
    const currentPeriodEndDate = periodEnd.toISOString().split('T')[0];

    // Calculate days until renewal
    const now = new Date();
    const daysUntilRenewal = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));

    // Get customer info
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;
    const customerEmail = typeof subscription.customer === 'object' && subscription.customer
      ? subscription.customer.email
      : null;

    console.log('\n📊 Subscription Overview:');
    console.log('─'.repeat(70));
    console.log(`Status:              ${subscription.status.toUpperCase()}`);
    console.log(`Customer ID:         ${customerId || 'N/A'}`);
    if (customerEmail) {
      console.log(`Customer Email:      ${customerEmail}`);
    }
    console.log(`Created:             ${createdAt.toISOString()} (${createdAt.toLocaleDateString()})`);

    console.log('\n📅 Billing Period Dates:');
    console.log('─'.repeat(70));
    console.log(`Current Period Start: ${currentPeriodStartDate} (${periodStart.toLocaleDateString()})`);
    console.log(`Current Period End:   ${currentPeriodEndDate} (${periodEnd.toLocaleDateString()})`);
    console.log(`Days Until Renewal:   ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'day' : 'days'}`);

    if (billingCycleAnchor) {
      console.log(`Billing Cycle Anchor: ${billingCycleAnchor.toISOString().split('T')[0]} (${billingCycleAnchor.toLocaleDateString()})`);
    }

    console.log('\n💰 Billing Information:');
    console.log('─'.repeat(70));
    console.log(`Currency:            ${subscription.currency?.toUpperCase() || 'N/A'}`);
    console.log(`Collection Method:    ${subscription.collection_method || 'N/A'}`);
    console.log(`Billing Interval:    ${subscription.items.data[0]?.price?.recurring?.interval || 'N/A'}`);
    console.log(`Billing Count:       ${subscription.items.data[0]?.price?.recurring?.interval_count || 'N/A'}`);

    // Calculate total amount
    let totalAmount = 0;
    subscription.items.data.forEach(item => {
      const amount = item.price?.unit_amount || 0;
      totalAmount += amount;
    });
    console.log(`Total Amount:        $${(totalAmount / 100).toFixed(2)} ${subscription.currency?.toUpperCase() || ''}`);

    if (subscription.items.data.length > 0) {
      console.log('\n📦 Subscription Items:');
      console.log('─'.repeat(70));
      subscription.items.data.forEach((item, index) => {
        const price = item.price;
        const product = typeof price?.product === 'string' ? null : price?.product;
        console.log(`\n  Item ${index + 1}:`);
        console.log(`    Product ID:      ${product?.id || price?.product || 'N/A'}`);
        console.log(`    Product Name:    ${product?.name || 'N/A'}`);
        console.log(`    Price ID:        ${price?.id || 'N/A'}`);
        console.log(`    Amount:          $${((price?.unit_amount || 0) / 100).toFixed(2)} ${price?.currency?.toUpperCase() || ''}`);
        console.log(`    Interval:        ${price?.recurring?.interval || 'N/A'}`);
        console.log(`    Interval Count:  ${price?.recurring?.interval_count || 'N/A'}`);
        console.log(`    Quantity:        ${item.quantity || 1}`);
      });
    }

    console.log('\n🔄 Subscription Settings:');
    console.log('─'.repeat(70));
    console.log(`Cancel at Period End: ${subscription.cancel_at_period_end ? 'Yes' : 'No'}`);
    if (cancelAt) {
      console.log(`Cancel At:            ${cancelAt.toISOString().split('T')[0]} (${cancelAt.toLocaleDateString()})`);
    }
    if (canceledAt) {
      console.log(`Canceled At:         ${canceledAt.toISOString().split('T')[0]} (${canceledAt.toLocaleDateString()})`);
    }
    console.log(`Days Until Cancel:   ${subscription.days_until_due || 'N/A'}`);
    console.log(`Proration Behavior:  ${subscription.items.data[0]?.price?.recurring?.aggregate_usage || 'N/A'}`);

    if (trialStart && trialEnd) {
      console.log('\n⏱️  Trial Information:');
      console.log('─'.repeat(70));
      console.log(`Trial Start:         ${trialStart.toISOString().split('T')[0]} (${trialStart.toLocaleDateString()})`);
      console.log(`Trial End:           ${trialEnd.toISOString().split('T')[0]} (${trialEnd.toLocaleDateString()})`);
      const now = new Date();
      if (trialEnd > now) {
        const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        console.log(`Trial Days Remaining: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`);
      } else {
        console.log(`Trial Status:        Ended`);
      }
    }

    if (subscription.latest_invoice) {
      const invoice = typeof subscription.latest_invoice === 'string'
        ? await stripe.invoices.retrieve(subscription.latest_invoice)
        : subscription.latest_invoice;

      console.log('\n🧾 Latest Invoice:');
      console.log('─'.repeat(70));
      console.log(`Invoice ID:          ${invoice.id}`);
      console.log(`Invoice Status:      ${invoice.status.toUpperCase()}`);
      console.log(`Amount:              $${((invoice.amount_due || 0) / 100).toFixed(2)} ${invoice.currency?.toUpperCase() || ''}`);
      console.log(`Amount Paid:         $${((invoice.amount_paid || 0) / 100).toFixed(2)} ${invoice.currency?.toUpperCase() || ''}`);
      if (invoice.hosted_invoice_url) {
        console.log(`Invoice URL:         ${invoice.hosted_invoice_url}`);
      }
    }

    if (subscription.default_payment_method) {
      const paymentMethod = typeof subscription.default_payment_method === 'string'
        ? await stripe.paymentMethods.retrieve(subscription.default_payment_method)
        : subscription.default_payment_method;

      console.log('\n💳 Payment Method:');
      console.log('─'.repeat(70));
      console.log(`Payment Method ID:   ${paymentMethod.id}`);
      console.log(`Type:                ${paymentMethod.type || 'N/A'}`);
      if (paymentMethod.card) {
        console.log(`Card Brand:          ${paymentMethod.card.brand || 'N/A'}`);
        console.log(`Card Last 4:         ${paymentMethod.card.last4 || 'N/A'}`);
        console.log(`Card Expiry:         ${paymentMethod.card.exp_month || 'N/A'}/${paymentMethod.card.exp_year || 'N/A'}`);
      }
    }

    if (subscription.metadata && Object.keys(subscription.metadata).length > 0) {
      console.log('\n🏷️  Metadata:');
      console.log('─'.repeat(70));
      Object.entries(subscription.metadata).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    console.log('\n📈 Additional Information:');
    console.log('─'.repeat(70));
    console.log(`Application Fee Percent: ${subscription.application_fee_percent || 'N/A'}`);
    console.log(`Default Tax Rates:      ${subscription.default_tax_rates?.length || 0}`);
    console.log(`Pending Update:         ${subscription.pending_update ? 'Yes' : 'No'}`);
    console.log(`Pause Collection:       ${subscription.pause_collection ? 'Yes' : 'No'}`);
    console.log(`Start Date:            ${subscription.start_date ? new Date(subscription.start_date * 1000).toISOString().split('T')[0] : 'N/A'}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Subscription details retrieved successfully!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error retrieving subscription:', error.message);
    if (error.type) {
      console.error('   Error type:', error.type);
    }
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.statusCode) {
      console.error('   Status code:', error.statusCode);
    }
    if (error.stack) {
      console.error('\n   Stack trace:');
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  }
}

viewSubscription();












