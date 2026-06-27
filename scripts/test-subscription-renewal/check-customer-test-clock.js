/**
 * Check if a customer is attached to a test clock
 *
 * Usage:
 *   node scripts/test-subscription-renewal/check-customer-test-clock.js --customer-id=cus_xxx
 */

import Stripe from 'stripe';
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

const customerId = args['customer-id'] || args.customerId;

if (!customerId) {
  console.error('❌ Error: --customer-id is required');
  console.log('\nUsage:');
  console.log('  node scripts/test-subscription-renewal/check-customer-test-clock.js --customer-id=cus_xxx');
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

async function checkCustomerTestClock() {
  try {
    console.log('🔍 Checking Customer Test Clock Status');
    console.log('======================================================================');
    console.log(`Customer ID: ${customerId}`);
    console.log('======================================================================\n');

    // Retrieve customer
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      console.error('❌ Error: Customer has been deleted');
      process.exit(1);
    }

    console.log('📋 Customer Details:');
    console.log(`   ID: ${customer.id}`);
    console.log(`   Email: ${customer.email || 'N/A'}`);
    console.log(`   Name: ${customer.name || 'N/A'}`);
    console.log(`   Test Clock: ${customer.test_clock || 'None (not attached)'}`);

    if (customer.test_clock) {
      // Get test clock details
      const testClock = await stripe.testHelpers.testClocks.retrieve(customer.test_clock);
      console.log('\n✅ Customer IS attached to a test clock:');
      console.log(`   Test Clock ID: ${testClock.id}`);
      console.log(`   Test Clock Name: ${testClock.name || '(unnamed)'}`);
      console.log(`   Current Time: ${new Date(testClock.frozen_time * 1000).toISOString()}`);
    } else {
      console.log('\n❌ Customer is NOT attached to any test clock');

      // Check for existing subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 10,
      });

      if (subscriptions.data.length > 0) {
        console.log('\n⚠️  Customer has existing subscription(s):');
        subscriptions.data.forEach(sub => {
          console.log(`   - ${sub.id} (Status: ${sub.status})`);
          console.log(`     Test Clock: ${sub.test_clock || 'None'}`);
        });
        console.log('\n💡 Why attachment might have failed:');
        console.log('   Stripe does not allow attaching customers with existing subscriptions to test clocks.');
        console.log('   The subscriptions were created BEFORE the test clock was set up.');
        console.log('\n💡 Solutions:');
        console.log('   1. Create a NEW customer without subscriptions');
        console.log('   2. Attach the new customer to test clock using:');
        console.log('      node scripts/test-subscription-renewal/list-test-clocks.js \\');
        console.log('        --attach-customer=cus_NEW_CUSTOMER_ID \\');
        console.log('        --attach-test-clock=clock_xxx');
        console.log('   3. Create subscriptions for the new customer (they will use the test clock)');
      } else {
        console.log('\n✅ Customer has no existing subscriptions - can be attached to test clock');
        console.log('\n💡 To attach this customer to a test clock:');
        console.log('   node scripts/test-subscription-renewal/list-test-clocks.js \\');
        console.log('     --attach-customer=' + customerId + ' \\');
        console.log('     --attach-test-clock=clock_xxx');
      }
    }

    console.log('\n======================================================================');
    console.log('✅ Check completed successfully!');
    console.log('======================================================================');
  } catch (error) {
    console.error('❌ Error checking customer:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

checkCustomerTestClock();





