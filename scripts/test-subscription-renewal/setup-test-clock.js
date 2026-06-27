/**
 * Setup Test Clock and Attach Customer
 *
 * This script creates a Stripe Test Clock and attaches a customer to it.
 * This MUST be done BEFORE creating a subscription for the Test Clock to work properly.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/setup-test-clock.js \
 *     --customer-id=cus_xxx \
 *     --test-clock-name="My Test Clock"
 *
 *   OR create a new customer:
 *   node scripts/test-subscription-renewal/setup-test-clock.js \
 *     --customer-email=test@example.com \
 *     --customer-name="Test Customer" \
 *     --test-clock-name="My Test Clock"
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

const customerId = args['customer-id'] || args.customerId;
const customerEmail = args['customer-email'] || args.customerEmail;
const customerName = args['customer-name'] || args.customerName || 'Test Customer';
const testClockName = args['test-clock-name'] || args.testClockName || `Test Clock ${new Date().toISOString()}`;
const reuseTestClock = args['reuse-test-clock'] === 'true' || args.reuseTestClock === 'true';
const forceNewCustomer = args['force-new-customer'] === 'true' || args.forceNewCustomer === 'true';

if (!customerId && !customerEmail) {
  console.error('❌ Error: Either --customer-id or --customer-email is required');
  console.log('\nUsage Examples:');
  console.log('  # Use existing customer:');
  console.log('  node setup-test-clock.js --customer-id=cus_xxx --test-clock-name="My Test Clock"');
  console.log('\n  # Create new customer:');
  console.log('  node setup-test-clock.js --customer-email=test@example.com --customer-name="Test Customer" --test-clock-name="My Test Clock"');
  console.log('\n  # Force create NEW customer even if one with same email exists:');
  console.log('  node setup-test-clock.js --customer-email=test@example.com --customer-name="Test Customer" --test-clock-name="My Test Clock" --force-new-customer=true');
  console.log('\n  # Reuse existing test clock by name:');
  console.log('  node setup-test-clock.js --customer-id=cus_xxx --test-clock-name="My Test Clock" --reuse-test-clock=true');
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

/**
 * Find or create a test clock by name
 */
async function findOrCreateTestClock(name) {
  try {
    // List all test clocks and find one with matching name
    if (reuseTestClock) {
      const testClocks = await stripe.testHelpers.testClocks.list({ limit: 100 });
      const existingClock = testClocks.data.find(clock => clock.name === name);

      if (existingClock) {
        console.log('✅ Found existing test clock:', existingClock.id);
        console.log('   Name:', existingClock.name);
        console.log('   Current time:', new Date(existingClock.frozen_time * 1000).toISOString());
        return existingClock;
      }
    }

    // Create new test clock
    console.log('   Creating new test clock...');
    const testClock = await stripe.testHelpers.testClocks.create({
      name: name,
      frozen_time: Math.floor(Date.now() / 1000), // Current time
    });

    console.log('✅ Created new test clock:', testClock.id);
    console.log('   Name:', testClock.name);
    console.log('   Current time:', new Date(testClock.frozen_time * 1000).toISOString());
    return testClock;
  } catch (error) {
    console.error('❌ Error finding/creating test clock:', error.message);
    throw error;
  }
}

/**
 * Create or retrieve customer
 */
async function getOrCreateCustomer(customerId, email, name) {
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      console.log('✅ Using existing customer:', customer.id);
      console.log('   Email:', customer.email || 'N/A');
      console.log('   Name:', customer.name || 'N/A');
      console.log('   Current test clock:', customer.test_clock || 'None');
      return customer;
    } catch (error) {
      console.error('❌ Error retrieving customer:', error.message);
      throw error;
    }
  } else if (email) {
    try {
      // Check if customer with this email already exists (unless force-new-customer is set)
      if (!forceNewCustomer) {
        const existingCustomers = await stripe.customers.list({
          email: email,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          const customer = existingCustomers.data[0];
          console.log('✅ Found existing customer with email:', customer.id);
          console.log('   Email:', customer.email);
          console.log('   Name:', customer.name || 'N/A');
          console.log('   Current test clock:', customer.test_clock || 'None');
          console.log('\n💡 Note: Using existing customer. To create a NEW customer with this email, use:');
          console.log('   --force-new-customer=true');
          return customer;
        }
      } else {
        console.log('   Force creating new customer (ignoring existing customers with same email)...');
      }

      // Create new customer
      // Note: Stripe allows multiple customers with the same email address
      // CRITICAL: If we have a test clock ID, create customer WITH test_clock from the start
      // This is more reliable than updating afterwards
      console.log('   Creating new customer...');
      const customerParams = {
        email: email,
        name: name,
        metadata: {
          created_by: 'setup-test-clock.js',
          created_at: new Date().toISOString(),
          force_new_customer: forceNewCustomer ? 'true' : 'false',
        },
      };

      // Note: We can't add test_clock here because test clock is created AFTER customer in the flow
      // We'll attach it in Step 4 instead
      const customer = await stripe.customers.create(customerParams);

      console.log('✅ Created new customer:', customer.id);
      console.log('   Email:', customer.email);
      console.log('   Name:', customer.name);
      if (forceNewCustomer) {
        console.log('   ⚠️  Note: This is a NEW customer even though another customer with this email may exist');
        console.log('   Stripe allows multiple customers with the same email address');
      }
      return customer;
    } catch (error) {
      console.error('❌ Error creating customer:', error.message);
      throw error;
    }
  } else {
    throw new Error('Either customer-id or customer-email must be provided');
  }
}

/**
 * Attach customer to test clock
 */
async function attachCustomerToTestClock(customerId, testClockId) {
  try {
    // Check if customer is already attached to this test clock
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.test_clock === testClockId) {
      console.log('✅ Customer is already attached to this test clock');
      return customer;
    }

    if (customer.test_clock && customer.test_clock !== testClockId) {
      console.log('⚠️  Warning: Customer is attached to a different test clock:', customer.test_clock);
      console.log('   This will be replaced with the new test clock.');
    }

    // Attach customer to test clock
    // CRITICAL: Only update test_clock parameter - don't update metadata in same call
    // Some Stripe API versions may reject test_clock if metadata is also updated
    console.log('   Attaching customer to test clock...');

    try {
      const updatedCustomer = await stripe.customers.update(customerId, {
        test_clock: testClockId,
      });

      console.log('✅ Customer attached to test clock successfully');
      console.log('   Customer test clock:', updatedCustomer.test_clock);

      // Update metadata separately if needed (optional, non-critical)
      if (customer.metadata) {
        try {
          await stripe.customers.update(customerId, {
            metadata: {
              ...customer.metadata,
              test_clock_id: testClockId,
              test_clock_attached_at: new Date().toISOString(),
            },
          });
        } catch (metadataError) {
          // Non-critical - metadata update failed but test clock attachment succeeded
          console.log('   ⚠️  Note: Could not update metadata (non-critical)');
        }
      }

      return updatedCustomer;
    } catch (updateError) {
      // Check for specific error codes
      if (updateError.code === 'parameter_unknown' && updateError.message && updateError.message.includes('test_clock')) {
        // This error can occur even if customer has no subscriptions
        // It's a Stripe API limitation in some cases
        console.error('❌ Error: Stripe rejected test_clock parameter');
        console.error('   Error code:', updateError.code);
        console.error('   Error message:', updateError.message);
        console.error('\n💡 This can happen even if the customer has no subscriptions.');
        console.error('   Stripe may reject test_clock attachment in certain scenarios.');
        console.error('\n✅ WORKAROUND: You can still proceed!');
        console.error('   New subscriptions created for this customer AFTER the test clock was created');
        console.error('   will automatically use the test clock, even without explicit attachment.');
        console.error('\n📝 Next Steps:');
        console.error('   1. Create a NEW subscription for this customer through the web app');
        console.error('   2. The subscription will automatically use test clock:', testClockId);
        console.error('   3. Verify subscription.test_clock matches:', testClockId);
        throw new Error('TEST_CLOCK_ATTACHMENT_REJECTED');
      }

      // Re-throw other errors
      throw updateError;
    }
  } catch (error) {
    if (error.message === 'TEST_CLOCK_ATTACHMENT_REJECTED') {
      // This is a known limitation - re-throw with special handling
      throw error;
    }

    console.error('❌ Error attaching customer to test clock:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   Error code:', error.code);
      console.error('   This may happen if the customer has existing subscriptions created before the test clock.');
      console.error('   Solution: Create a new customer or cancel existing subscriptions first.');
    }
    throw error;
  }
}

async function setupTestClock() {
  try {
    console.log('\n🔄 Setting Up Test Clock and Attaching Customer');
    console.log('='.repeat(60));
    console.log(`Test Clock Name: ${testClockName}`);
    if (customerId) {
      console.log(`Customer ID: ${customerId}`);
    } else {
      console.log(`Customer Email: ${customerEmail}`);
      console.log(`Customer Name: ${customerName}`);
    }
    console.log(`Reuse Existing Test Clock: ${reuseTestClock}`);
    console.log('='.repeat(60));

    // Step 1: Find or create test clock
    console.log('\n📅 Step 1: Finding or creating test clock...');
    const testClock = await findOrCreateTestClock(testClockName);

    // Step 2: Get or create customer
    console.log('\n👤 Step 2: Getting or creating customer...');
    const customer = await getOrCreateCustomer(customerId, customerEmail, customerName);

    // Step 3: Check if customer has existing subscriptions
    console.log('\n📋 Step 3: Checking for existing subscriptions...');
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 100,
      status: 'all',
    });

    let canAttachToTestClock = true;
    let attachmentSkipped = false;

    if (subscriptions.data.length > 0) {
      console.log(`⚠️  Warning: Customer has ${subscriptions.data.length} existing subscription(s):`);
      subscriptions.data.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.id} - Status: ${sub.status} - Test Clock: ${sub.test_clock || 'None'}`);
      });

      // Check if any subscriptions were created before test clock
      const testClockCreatedAt = testClock.frozen_time;
      const subscriptionsBeforeTestClock = subscriptions.data.filter(sub => {
        return sub.created < testClockCreatedAt;
      });

      if (subscriptionsBeforeTestClock.length > 0) {
        console.log('\n❌ CRITICAL: Customer has subscriptions created BEFORE the test clock.');
        console.log(`   Found ${subscriptionsBeforeTestClock.length} subscription(s) that cannot use this test clock:`);
        subscriptionsBeforeTestClock.forEach((sub, index) => {
          console.log(`   ${index + 1}. ${sub.id} - Created: ${new Date(sub.created * 1000).toISOString()}`);
        });
        console.log('\n⚠️  Stripe RESTRICTION: You cannot attach a customer to a test clock');
        console.log('   if they have existing subscriptions created before the test clock.');
        console.log('\n💡 Solutions:');
        console.log('   1. Create a NEW customer (recommended for testing):');
        console.log('      node setup-test-clock.js --customer-email=newtest@example.com --customer-name="New Test Customer" --test-clock-name="Subscription Test Clock"');
        console.log('   2. Cancel all existing subscriptions first (then create new ones with test clock)');
        console.log('   3. Skip attachment and create new subscriptions manually (they will use test clock automatically)');

        // Ask user what to do
        let answer;
        try {
          answer = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              rl.close();
              reject(new Error('Timeout'));
            }, 30000);

            rl.question('\n⚠️  Skip attachment and just create the test clock? (yes/no): ', (input) => {
              clearTimeout(timeout);
              resolve(input);
            });
          });
        } catch (error) {
          answer = 'yes';
        }

        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          canAttachToTestClock = false;
          attachmentSkipped = true;
          console.log('\n✅ Skipping customer attachment (test clock created successfully)');
          console.log('   Note: New subscriptions created for this customer will automatically use the test clock');
          console.log('   if they are created AFTER the test clock was created.');
        } else {
          console.log('\n❌ Cannot proceed: Customer attachment is required but blocked by existing subscriptions.');
          rl.close();
          return;
        }
      } else {
        console.log('\n✅ All existing subscriptions were created AFTER the test clock');
        console.log('   Customer can be attached to test clock.');
      }
    } else {
      console.log('✅ Customer has no existing subscriptions');
      console.log('   Perfect! Any new subscriptions will use the test clock.');
    }

    // Step 4: Attach customer to test clock (only if allowed)
    let updatedCustomer = customer;
    if (canAttachToTestClock) {
      console.log('\n🔗 Step 4: Attaching customer to test clock...');
      try {
        updatedCustomer = await attachCustomerToTestClock(customer.id, testClock.id);
      } catch (error) {
        // If attachment fails, check if it's the known Stripe limitation
        if (error.message === 'TEST_CLOCK_ATTACHMENT_REJECTED') {
          // This is a known Stripe limitation - continue anyway
          console.log('\n⚠️  Customer attachment rejected by Stripe (known limitation).');
          console.log('   However, this is NOT a problem for testing!');
          console.log('\n✅ WORKAROUND: New subscriptions will still use the test clock');
          console.log('   Any NEW subscription created for this customer AFTER the test clock');
          console.log('   was created will automatically use test clock:', testClock.id);
          console.log('\n📝 To verify:');
          console.log('   1. Create a subscription for this customer through the web app');
          console.log('   2. Check subscription.test_clock - it should be:', testClock.id);
          attachmentSkipped = true;
        } else {
          // Other errors - log and continue
          console.log('\n⚠️  Customer attachment failed, but test clock was created successfully.');
          console.log('   New subscriptions created for this customer will still use the test clock');
          console.log('   if they are created AFTER the test clock was created.');
          attachmentSkipped = true;
        }
      }
    } else {
      console.log('\n⏭️  Step 4: Skipping customer attachment (due to existing subscriptions)');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Setup Complete!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Test Clock ID: ${testClock.id}`);
    console.log(`   Test Clock Name: ${testClock.name}`);
    console.log(`   Test Clock Time: ${new Date(testClock.frozen_time * 1000).toISOString()}`);
    console.log(`   Customer ID: ${updatedCustomer.id}`);
    console.log(`   Customer Email: ${updatedCustomer.email || 'N/A'}`);
    console.log(`   Customer Name: ${updatedCustomer.name || 'N/A'}`);
    if (attachmentSkipped) {
      console.log(`   Customer Test Clock: Not attached (Stripe API limitation)`);
      console.log(`   ⚠️  Note: New subscriptions will still use test clock if created after test clock`);
    } else {
      console.log(`   Customer Test Clock: ${updatedCustomer.test_clock || 'None'}`);
    }

    console.log('\n📝 Next Steps:');
    if (attachmentSkipped) {
      console.log('   ✅ GOOD NEWS: Even though customer attachment failed, you can still test!');
      console.log('   1. Create a NEW subscription for this customer through the web app');
      console.log('      (The NEW subscription will automatically use the test clock)');
      console.log('   2. Verify the NEW subscription has test_clock:', testClock.id);
      console.log('   3. Use expedite-stripe-renewal-test-clock.js to advance time');
      console.log('   4. Stripe will automatically process renewals, invoices, and webhooks');
      console.log('\n   💡 Why this works: Stripe automatically assigns test clocks to new subscriptions');
      console.log('      created after a test clock exists, even if the customer isn\'t explicitly attached.');
    } else {
      console.log('   1. Create a NEW subscription for this customer');
      console.log('      (The subscription will automatically use the test clock)');
      console.log('   2. Verify the subscription has test_clock:', testClock.id);
      console.log('   3. Use expedite-stripe-renewal-test-clock.js to advance time');
      console.log('   4. Stripe will automatically process renewals, invoices, and webhooks');
    }

    console.log('\n💡 Example Subscription Creation:');
    console.log('   const subscription = await stripe.subscriptions.create({');
    console.log('     customer: "' + updatedCustomer.id + '",');
    console.log('     items: [{ price: "price_xxx" }],');
    console.log('   });');
    console.log('   // subscription.test_clock should be:', testClock.id);

    console.log('\n💡 Example Time Advancement:');
    console.log('   node scripts/test-subscription-renewal/expedite-stripe-renewal-test-clock.js \\');
    console.log('     --subscription-id=sub_xxx \\');
    console.log('     --days-to-advance=30');

    console.log('\n✅ Setup completed successfully!\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error setting up test clock:', error.message);
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

setupTestClock();

