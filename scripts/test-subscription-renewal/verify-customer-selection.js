/**
 * Verify Customer Selection for Email (Test Script Only)
 *
 * This script helps verify which customer ID will be used when the application
 * creates a checkout session or processes a payment with a given email address.
 *
 * The application uses `customers.list({ email })` which returns the FIRST customer
 * found. If multiple customers exist with the same email, this script helps identify
 * which one will be selected and provides guidance on ensuring the correct one is used.
 *
 * Usage:
 *   # Check which customer will be used for an email:
 *   node scripts/test-subscription-renewal/verify-customer-selection.js --email=test@example.com
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

const email = args.email || args['customer-email'];

if (!email) {
  console.error('❌ Error: --email is required');
  console.log('\nUsage Example:');
  console.log('  node scripts/test-subscription-renewal/verify-customer-selection.js --email=test@example.com');
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

/**
 * Get subscriptions for a customer
 */
async function getCustomerSubscriptions(customerId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    });
    return subscriptions.data;
  } catch (error) {
    console.warn(`   ⚠️  Warning: Could not fetch subscriptions: ${error.message}`);
    return [];
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n🔍 Verify Customer Selection for Email');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log('='.repeat(60));
    console.log('\n💡 How the Application Selects Customers:');
    console.log('   The application uses: stripe.customers.list({ email: "${email}", limit: 1 })');
    console.log('   This returns the FIRST customer found with that email.');
    console.log('   If multiple customers exist, the selection is NOT guaranteed to be the newest one.\n');

    // Find all customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 100,
    });

    if (customers.data.length === 0) {
      console.log('✅ No customers found with this email');
      console.log('   When the application creates a checkout session, it will create a NEW customer.');
      console.log('   This is safe for testing.\n');
      return;
    }

    console.log(`📋 Found ${customers.data.length} customer(s) with email "${email}":\n`);

    // Sort by creation date (newest first) for display
    const sortedCustomers = [...customers.data].sort((a, b) => b.created - a.created);

    for (let i = 0; i < sortedCustomers.length; i++) {
      const customer = sortedCustomers[i];
      const subscriptions = await getCustomerSubscriptions(customer.id);
      const activeSubscriptions = subscriptions.filter(sub =>
        sub.status === 'active' || sub.status === 'trialing' || sub.status === 'incomplete'
      );

      console.log('─'.repeat(60));
      console.log(`Customer ${i + 1} of ${sortedCustomers.length}:`);
      console.log('─'.repeat(60));
      console.log(`ID:              ${customer.id}`);
      console.log(`Email:           ${customer.email || 'N/A'}`);
      console.log(`Name:            ${customer.name || 'N/A'}`);
      console.log(`Created:         ${new Date(customer.created * 1000).toISOString()}`);
      console.log(`Test Clock:      ${customer.test_clock || 'None (not attached)'}`);
      console.log(`Subscriptions:   ${subscriptions.length} total, ${activeSubscriptions.length} active`);

      if (subscriptions.length > 0) {
        console.log(`   Active subscriptions:`);
        activeSubscriptions.forEach(sub => {
          console.log(`     - ${sub.id} (Status: ${sub.status}, Test Clock: ${sub.test_clock || 'None'})`);
        });
      }

      // Mark which one will be selected (first in list from Stripe API)
      if (i === 0 && customer.id === customers.data[0].id) {
        console.log(`\n   ⚠️  ⚠️  ⚠️  THIS CUSTOMER WILL BE SELECTED BY THE APPLICATION ⚠️  ⚠️  ⚠️`);
        console.log(`   (First customer returned by stripe.customers.list({ email: "${email}", limit: 1 }))`);

        if (!customer.test_clock) {
          console.log(`\n   ❌ PROBLEM: This customer is NOT attached to a test clock!`);
          console.log(`   New subscriptions created through the web app will NOT use a test clock.`);
        } else {
          console.log(`\n   ✅ GOOD: This customer IS attached to test clock: ${customer.test_clock}`);
          console.log(`   New subscriptions will automatically use this test clock.`);
        }
      } else if (customer.test_clock) {
        console.log(`\n   ⚠️  This customer IS attached to test clock but will NOT be selected`);
        console.log(`   (Not the first customer returned by the API)`);
      }
      console.log('');
    }

    // Summary and recommendations
    console.log('='.repeat(60));
    console.log('📊 Summary and Recommendations:');
    console.log('='.repeat(60));

    const selectedCustomer = customers.data[0];
    const hasTestClock = selectedCustomer.test_clock !== null && selectedCustomer.test_clock !== undefined;

    if (customers.data.length === 1) {
      console.log('✅ Only one customer exists - no selection ambiguity');
      if (hasTestClock) {
        console.log('✅ Customer is attached to test clock - ready for testing');
      } else {
        console.log('❌ Customer is NOT attached to test clock');
        console.log('\n💡 Solution: Attach customer to test clock:');
        console.log(`   node scripts/test-subscription-renewal/setup-test-clock.js \\`);
        console.log(`     --customer-id=${selectedCustomer.id} \\`);
        console.log(`     --test-clock-name="Subscription Test Clock" \\`);
        console.log(`     --reuse-test-clock=true`);
      }
    } else {
      console.log(`⚠️  Multiple customers exist (${customers.data.length} total)`);
      console.log(`   Selected customer: ${selectedCustomer.id}`);

      if (hasTestClock) {
        console.log('✅ Selected customer IS attached to test clock');
        console.log('\n💡 Recommendation: Delete other customers to avoid confusion:');
        customers.data.slice(1).forEach(c => {
          console.log(`   node scripts/test-subscription-renewal/delete-customer.js --customer-id=${c.id}`);
        });
      } else {
        console.log('❌ Selected customer is NOT attached to test clock');
        console.log('\n💡 Solutions:');
        console.log('   1. Attach selected customer to test clock:');
        console.log(`      node scripts/test-subscription-renewal/setup-test-clock.js \\`);
        console.log(`        --customer-id=${selectedCustomer.id} \\`);
        console.log(`        --test-clock-name="Subscription Test Clock" \\`);
        console.log(`        --reuse-test-clock=true`);
        console.log('\n   2. OR delete old customers and create a new one with test clock:');
        customers.data.forEach(c => {
          console.log(`      node scripts/test-subscription-renewal/delete-customer.js --customer-id=${c.id}`);
        });
        console.log(`      node scripts/test-subscription-renewal/setup-test-clock.js \\`);
        console.log(`        --customer-email=${email} \\`);
        console.log(`        --customer-name="Test Customer" \\`);
        console.log(`        --test-clock-name="Subscription Test Clock"`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification completed!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();





