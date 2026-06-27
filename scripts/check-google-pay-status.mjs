#!/usr/bin/env node

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - prioritize .env.production
dotenv.config({ path: join(__dirname, '..', '.env.production') });
// Fallback to .env.local if .env.production doesn't exist
dotenv.config({ path: join(__dirname, '..', '.env.local') });
// Fallback to .env if neither exists
dotenv.config({ path: join(__dirname, '..', '.env') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.log('\n🔧 To fix this, create one of these files:');
  console.log('   .env.production (recommended for production keys)');
  console.log('   .env.local (for local development)');
  console.log('   .env (fallback)');
  console.log('\n📝 Add this line to your chosen file:');
  console.log('   STRIPE_SECRET_KEY=sk_live_...your_live_secret_key_here...');
  console.log('\n💡 For production Google Pay setup, use .env.production');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia' // Use latest API version
});

async function checkGooglePayStatus() {
  try {
    console.log('🔍 Google Pay Status Diagnostic');
    console.log('================================\n');

    // Check Stripe account capabilities
    console.log('📋 Checking Stripe account capabilities...');
    const account = await stripe.accounts.retrieve();
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    console.log(`   Payouts enabled: ${account.payouts_enabled}`);
    console.log('');

    // Check payment method domains
    console.log('🌐 Checking payment method domains...');
    const domains = await stripe.paymentMethodDomains.list({
      limit: 100,
    });

    if (domains.data.length === 0) {
      console.log('   ❌ No domains registered');
      return;
    }

    console.log(`   Found ${domains.data.length} domain(s):\n`);

    for (const domain of domains.data) {
      console.log(`   📍 Domain: ${domain.domain_name}`);
      console.log(`      ID: ${domain.id}`);
      console.log(`      Status: ${domain.status || 'unknown'}`);
      console.log(`      Created: ${new Date(domain.created * 1000).toLocaleString()}`);

      // Show detailed status
      if (domain.status === 'active') {
        console.log(`      ✅ Google Pay: ENABLED AND WORKING`);
      } else if (domain.status === 'pending') {
        console.log(`      ⏳ Google Pay: PENDING GOOGLE VERIFICATION`);
        console.log(`         This usually takes 24-48 hours`);
      } else if (domain.status === 'inactive') {
        console.log(`      ❌ Google Pay: DISABLED`);
      } else {
        console.log(`      ❓ Google Pay: STATUS UNKNOWN (${domain.status})`);
        console.log(`         This might indicate an API issue`);
      }

      // Show any additional properties
      if (domain.object === 'payment_method_domain') {
        console.log(`      Type: Payment Method Domain`);
        if (domain.enabled_payment_methods) {
          console.log(`      Enabled methods: ${domain.enabled_payment_methods.join(', ')}`);
        }
      }

      console.log('');
    }

    // Check if Google Pay is enabled for the account
    console.log('🔧 Checking Google Pay account settings...');
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        type: 'card',
        limit: 1
      });
      console.log(`   Payment methods available: ${paymentMethods.data.length > 0 ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log(`   Payment methods check: ${error.message}`);
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Check Stripe Dashboard → Settings → Payment methods → Google Pay');
    console.log('   2. Verify domain verification status');
    console.log('   3. Ensure Google Pay is enabled for your account');
    console.log('   4. Wait 24-48 hours for Google verification if status is "pending"');

  } catch (error) {
    console.error('❌ Error checking Google Pay status:', error.message);
    if (error.type === 'api_error') {
      console.log('\n💡 This might be an API version issue. Try updating the Stripe library.');
    }
  }
}

// Run the diagnostic
checkGooglePayStatus().catch(console.error);
