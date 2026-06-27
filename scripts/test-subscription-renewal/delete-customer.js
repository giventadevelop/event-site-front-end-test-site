/**
 * Delete Stripe Customer (Test Script Only)
 *
 * This script deletes a Stripe customer after canceling all their subscriptions.
 * WARNING: This is a destructive operation. Use only in test mode.
 *
 * Usage:
 *   # Delete a customer by ID:
 *   node scripts/test-subscription-renewal/delete-customer.js --customer-id=cus_xxx
 *
 *   # Delete a customer by email (deletes the FIRST customer found with that email):
 *   node scripts/test-subscription-renewal/delete-customer.js --customer-email=test@example.com
 *
 *   # Delete ALL customers with a given email (use with caution):
 *   node scripts/test-subscription-renewal/delete-customer.js --customer-email=test@example.com --delete-all=true
 *
 * Environment Variables Required:
 *   - STRIPE_SECRET_KEY (test mode key)
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import readline from 'readline';

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
const deleteAll = args['delete-all'] === 'true' || args.deleteAll === 'true';

if (!customerId && !customerEmail) {
  console.error('❌ Error: Either --customer-id or --customer-email is required');
  console.log('\nUsage Examples:');
  console.log('  # Delete customer by ID:');
  console.log('  node scripts/test-subscription-renewal/delete-customer.js --customer-id=cus_xxx');
  console.log('\n  # Delete first customer with email:');
  console.log('  node scripts/test-subscription-renewal/delete-customer.js --customer-email=test@example.com');
  console.log('\n  # Delete ALL customers with email (use with caution):');
  console.log('  node scripts/test-subscription-renewal/delete-customer.js --customer-email=test@example.com --delete-all=true');
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

// Verify we're in test mode
if (!stripeKey.startsWith('sk_test_')) {
  console.error('❌ ERROR: This script should ONLY be used with test mode Stripe keys (sk_test_...)');
  console.error('   Production keys (sk_live_...) are not allowed for safety.');
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
 * Cancel all subscriptions for a customer
 */
async function cancelAllSubscriptions(customerId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    });

    if (subscriptions.data.length === 0) {
      console.log('   ✅ Customer has no subscriptions to cancel');
      return;
    }

    console.log(`   📋 Found ${subscriptions.data.length} subscription(s) to cancel:`);
    for (const sub of subscriptions.data) {
      if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'incomplete') {
        console.log(`   ⏳ Canceling subscription: ${sub.id} (Status: ${sub.status})`);
        try {
          await stripe.subscriptions.cancel(sub.id);
          console.log(`   ✅ Canceled subscription: ${sub.id}`);
        } catch (error) {
          console.error(`   ❌ Error canceling subscription ${sub.id}:`, error.message);
          // Continue with other subscriptions
        }
      } else {
        console.log(`   ⏭️  Skipping subscription: ${sub.id} (Status: ${sub.status} - already canceled/ended)`);
      }
    }
  } catch (error) {
    console.error('   ❌ Error listing subscriptions:', error.message);
    throw error;
  }
}

/**
 * Delete a customer
 */
async function deleteCustomer(customerId) {
  try {
    // First, cancel all subscriptions
    console.log('\n📋 Step 1: Canceling all subscriptions...');
    await cancelAllSubscriptions(customerId);

    // Then delete the customer
    console.log('\n🗑️  Step 2: Deleting customer...');
    const deletedCustomer = await stripe.customers.del(customerId);
    console.log('✅ Customer deleted successfully');
    console.log(`   Customer ID: ${deletedCustomer.id}`);
    console.log(`   Email: ${deletedCustomer.email || 'N/A'}`);
    console.log(`   Deleted: ${deletedCustomer.deleted}`);
  } catch (error) {
    console.error('❌ Error deleting customer:', error.message);
    throw error;
  }
}

/**
 * Find customers by email
 */
async function findCustomersByEmail(email) {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 100,
    });
    return customers.data;
  } catch (error) {
    console.error('❌ Error finding customers:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n🗑️  Delete Stripe Customer (Test Mode Only)');
    console.log('='.repeat(60));

    let customersToDelete = [];

    if (customerId) {
      // Delete specific customer by ID
      console.log(`Customer ID: ${customerId}`);
      console.log('='.repeat(60));

      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        console.log('❌ Customer is already deleted');
        process.exit(1);
      }
      customersToDelete = [customer];
    } else if (customerEmail) {
      // Find customers by email
      console.log(`Customer Email: ${customerEmail}`);
      console.log('='.repeat(60));

      const customers = await findCustomersByEmail(customerEmail);

      if (customers.length === 0) {
        console.log('❌ No customers found with that email');
        process.exit(1);
      }

      console.log(`\n📋 Found ${customers.length} customer(s) with email "${customerEmail}":`);
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.id} - Name: ${customer.name || 'N/A'} - Test Clock: ${customer.test_clock || 'None'}`);
      });

      if (deleteAll) {
        customersToDelete = customers;
        console.log('\n⚠️  WARNING: Will delete ALL customers listed above');
      } else {
        // Delete only the first one
        customersToDelete = [customers[0]];
        console.log(`\n💡 Will delete the FIRST customer: ${customers[0].id}`);
        console.log('   To delete ALL customers, use: --delete-all=true');
      }
    }

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete the customer(s) and cancel all subscriptions!');
    console.log(`   ${customersToDelete.length} customer(s) will be deleted:`);
    customersToDelete.forEach(c => console.log(`   - ${c.id} (${c.email || 'N/A'})`));

    let answer;
    try {
      answer = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          rl.close();
          reject(new Error('Timeout'));
        }, 30000);

        rl.question('\n⚠️  Are you sure you want to delete? Type "DELETE" to confirm: ', (input) => {
          clearTimeout(timeout);
          resolve(input);
        });
      });
    } catch (error) {
      console.log('\n❌ Operation cancelled (timeout or error)');
      rl.close();
      process.exit(1);
    }

    if (answer !== 'DELETE') {
      console.log('\n❌ Operation cancelled');
      rl.close();
      process.exit(0);
    }

    // Delete each customer
    for (let i = 0; i < customersToDelete.length; i++) {
      const customer = customersToDelete[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Deleting Customer ${i + 1} of ${customersToDelete.length}:`);
      console.log(`ID: ${customer.id}`);
      console.log(`Email: ${customer.email || 'N/A'}`);
      console.log(`Name: ${customer.name || 'N/A'}`);
      console.log(`Test Clock: ${customer.test_clock || 'None'}`);
      console.log('='.repeat(60));

      await deleteCustomer(customer.id);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All customers deleted successfully!');
    console.log('='.repeat(60) + '\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();





