/**
 * List and Look Up Stripe Test Clocks
 *
 * This script lists all Stripe Test Clocks or looks up a specific one by name.
 *
 * Usage:
 *   # List all test clocks:
 *   node scripts/test-subscription-renewal/list-test-clocks.js
 *
 *   # Look up a specific test clock by name:
 *   node scripts/test-subscription-renewal/list-test-clocks.js --name="Subscription Test Clock"
 *
 *   # List with limit (default is 100):
 *   node scripts/test-subscription-renewal/list-test-clocks.js --limit=50
 *
 *   # Attach a customer to a test clock:
 *   node scripts/test-subscription-renewal/list-test-clocks.js --attach-customer=cus_xxx --attach-test-clock=clock_xxx
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

const testClockName = args.name || args['test-clock-name'] || args.testClockName;
const limit = parseInt(args.limit || '100', 10);
const attachCustomerId = args['attach-customer'] || args.attachCustomer;
const attachTestClockId = args['attach-test-clock'] || args.attachTestClock;

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

/**
 * Get customers attached to a test clock
 * Note: Stripe's filter might not work reliably, so we check customer.test_clock property directly
 */
async function getCustomersForTestClock(testClockId) {
  try {
    // Method 1: Try using the filter (might work in some cases)
    try {
      const customers = await stripe.customers.list({
        test_clock: testClockId,
        limit: 100,
      });
      if (customers.data.length > 0) {
        return customers.data;
      }
    } catch (filterError) {
      // Filter might not work, continue to method 2
    }

    // Method 2: List recent customers and check their test_clock property
    // This is more reliable but slower for accounts with many customers
    const allCustomers = await stripe.customers.list({
      limit: 100, // Check up to 100 most recent customers
    });

    const attachedCustomers = allCustomers.data.filter(customer => {
      const customerTestClock = customer.test_clock;
      return customerTestClock === testClockId;
    });

    return attachedCustomers;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not fetch customers for test clock ${testClockId}:`, error.message);
    return [];
  }
}

/**
 * Get subscriptions using a test clock
 */
async function getSubscriptionsForTestClock(testClockId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      test_clock: testClockId,
      limit: 100,
    });
    return subscriptions.data;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not fetch subscriptions for test clock ${testClockId}:`, error.message);
    return [];
  }
}

/**
 * List all test clocks or find by name
 */
async function listTestClocks() {
  try {
    console.log('📋 Listing Stripe Test Clocks');
    console.log('======================================================================');
    if (testClockName) {
      console.log(`Searching for test clock with name: "${testClockName}"`);
    } else {
      console.log('Listing all test clocks (limit:', limit, ')');
    }
    console.log('======================================================================\n');

    // List all test clocks
    const testClocks = await stripe.testHelpers.testClocks.list({ limit });

    if (testClocks.data.length === 0) {
      console.log('📭 No test clocks found.');
      console.log('\n💡 Tip: Create a test clock using:');
      console.log('   node scripts/test-subscription-renewal/setup-test-clock.js \\');
      console.log('     --customer-id=cus_xxx \\');
      console.log('     --test-clock-name="My Test Clock"');
      return;
    }

    // Filter by name if provided
    let filteredClocks = testClocks.data;
    if (testClockName) {
      filteredClocks = testClocks.data.filter(clock =>
        clock.name && clock.name.toLowerCase().includes(testClockName.toLowerCase())
      );

      if (filteredClocks.length === 0) {
        console.log(`❌ No test clock found with name containing: "${testClockName}"`);
        console.log('\n📋 Available test clocks:');
        testClocks.data.forEach(clock => {
          console.log(`   - ${clock.name || '(unnamed)'} (${clock.id})`);
        });
        return;
      }
    }

    console.log(`✅ Found ${filteredClocks.length} test clock(s):\n`);

    // Display details for each test clock
    for (let i = 0; i < filteredClocks.length; i++) {
      const clock = filteredClocks[i];
      const clockTime = new Date(clock.frozen_time * 1000);

      console.log('──────────────────────────────────────────────────────────────────────');
      console.log(`Test Clock ${i + 1} of ${filteredClocks.length}:`);
      console.log('──────────────────────────────────────────────────────────────────────');
      console.log(`ID:              ${clock.id}`);
      console.log(`Name:            ${clock.name || '(unnamed)'}`);
      console.log(`Current Time:    ${clockTime.toISOString()}`);
      console.log(`                (${clockTime.toLocaleString()})`);

      // Get customers attached to this test clock
      console.log('\n👤 Attached Customers:');
      try {
        const customers = await getCustomersForTestClock(clock.id);
        if (customers.length === 0) {
          console.log('   (No customers attached)');
        } else {
          customers.forEach(customer => {
            console.log(`   - ${customer.id}`);
            console.log(`     Email: ${customer.email || 'N/A'}`);
            console.log(`     Name: ${customer.name || 'N/A'}`);
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Error fetching customers: ${error.message}`);
      }

      // Get subscriptions using this test clock
      console.log('\n📦 Subscriptions Using This Test Clock:');
      try {
        const subscriptions = await getSubscriptionsForTestClock(clock.id);
        if (subscriptions.length === 0) {
          console.log('   (No subscriptions found)');
        } else {
          subscriptions.forEach(sub => {
            const status = sub.status;
            const statusColor = status === 'active' ? '✅' : status === 'incomplete' ? '⚠️' : '❌';
            console.log(`   ${statusColor} ${sub.id}`);
            console.log(`     Status: ${sub.status}`);
            console.log(`     Customer: ${sub.customer}`);
            if (sub.items?.data?.[0]?.price?.product) {
              const productId = typeof sub.items.data[0].price.product === 'string'
                ? sub.items.data[0].price.product
                : sub.items.data[0].price.product.id;
              console.log(`     Product: ${productId}`);
            }
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Error fetching subscriptions: ${error.message}`);
      }

      console.log('');
    }

    console.log('======================================================================');
    console.log('✅ Test clock listing completed successfully!');
    console.log('======================================================================\n');

    // Show usage tips
    if (!testClockName) {
      console.log('💡 Usage Tips:');
      console.log('   # Look up a specific test clock by name:');
      console.log('   node scripts/test-subscription-renewal/list-test-clocks.js --name="Subscription Test Clock"');
      console.log('\n   # Advance a test clock:');
      console.log('   node scripts/test-subscription-renewal/expedite-stripe-renewal-test-clock.js \\');
      console.log('     --subscription-id=sub_xxx \\');
      console.log('     --customer-id=cus_xxx \\');
      console.log('     --test-clock-id=' + (filteredClocks[0]?.id || 'clock_xxx') + ' \\');
      console.log('     --days-to-advance=30');
    }

  } catch (error) {
    console.error('❌ Error listing test clocks:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   Error code:', error.code);
      console.error('   Error type:', error.type);
    }
    process.exit(1);
  }
}

/**
 * Attach a customer to a test clock
 */
async function attachCustomerToTestClock(customerId, testClockId) {
  try {
    console.log('🔗 Attaching Customer to Test Clock');
    console.log('======================================================================');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Test Clock ID: ${testClockId}`);
    console.log('======================================================================\n');

    // Check if customer exists
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error('❌ Error: Customer has been deleted');
      process.exit(1);
    }

    // Check if customer has existing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    if (subscriptions.data.length > 0) {
      console.warn('⚠️  Warning: Customer has existing subscription(s):');
      subscriptions.data.forEach(sub => {
        console.warn(`   - ${sub.id} (Status: ${sub.status})`);
      });
      console.warn('\n⚠️  IMPORTANT: If these subscriptions were created BEFORE the test clock,');
      console.warn('   they will NOT be affected by the test clock advancement.');
      console.warn('   Only NEW subscriptions created AFTER attaching to test clock will use it.\n');
    }

    // Check if test clock exists
    const testClock = await stripe.testHelpers.testClocks.retrieve(testClockId);
    console.log(`✅ Test Clock found: ${testClock.name || '(unnamed)'}`);
    console.log(`   Current time: ${new Date(testClock.frozen_time * 1000).toISOString()}\n`);

    // Attach customer to test clock
    console.log('🔗 Attaching customer to test clock...');
    try {
      const updatedCustomer = await stripe.customers.update(customerId, {
        test_clock: testClockId,
      });

      console.log('✅ Customer attached to test clock successfully!');
      console.log(`   Customer ID: ${updatedCustomer.id}`);
      console.log(`   Customer test clock: ${updatedCustomer.test_clock || 'None'}`);
      console.log('\n📝 Next Steps:');
      console.log('   1. Create a NEW subscription for this customer');
      console.log('      (The subscription will automatically use the test clock)');
      console.log('   2. Verify the subscription has test_clock set to your test clock ID');
      console.log('   3. Use expedite-stripe-renewal-test-clock.js to advance time');
    } catch (attachError) {
      if (attachError.code === 'parameter_unknown' && attachError.message.includes('test_clock')) {
        console.error('❌ Error: Cannot attach customer to test clock');
        console.error('   This customer has existing subscriptions created before the test clock.');
        console.error('   Stripe does not allow attaching customers with existing subscriptions to test clocks.');
        console.error('\n💡 Solutions:');
        console.error('   1. Create a new customer without subscriptions');
        console.error('   2. Cancel all existing subscriptions for this customer first');
        console.error('   3. Create new subscriptions AFTER attaching to test clock');
        process.exit(1);
      } else {
        throw attachError;
      }
    }
  } catch (error) {
    console.error('❌ Error attaching customer to test clock:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   Error code:', error.code);
      console.error('   Error type:', error.type);
    }
    process.exit(1);
  }
}

// Main execution
if (attachCustomerId && attachTestClockId) {
  // Attach customer to test clock mode
  attachCustomerToTestClock(attachCustomerId, attachTestClockId);
} else {
  // List test clocks mode
  listTestClocks();
}

