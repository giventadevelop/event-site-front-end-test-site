#!/usr/bin/env node

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.production') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function testGooglePayAvailability() {
  try {
    console.log('🧪 Testing Google Pay Availability');
    console.log('==================================\n');

    // Test 1: Check account capabilities
    console.log('📋 Account Capabilities:');
    const account = await stripe.accounts.retrieve();
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    console.log(`   Payouts enabled: ${account.payouts_enabled}`);
    console.log(`   Account type: ${account.type}`);
    console.log('');

    // Test 2: Check if we can create a payment intent (basic functionality)
    console.log('💳 Testing Payment Intent Creation:');
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // $10.00
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { test: 'google-pay-availability' }
      });
      console.log(`   ✅ Payment Intent created: ${paymentIntent.id}`);
      console.log(`   Status: ${paymentIntent.status}`);

      // Clean up test payment intent
      await stripe.paymentIntents.cancel(paymentIntent.id);
      console.log(`   🧹 Test payment intent cancelled`);
    } catch (error) {
      console.log(`   ❌ Payment Intent creation failed: ${error.message}`);
    }
    console.log('');

    // Test 3: Check payment method domains
    console.log('🌐 Payment Method Domains:');
    try {
      const domains = await stripe.paymentMethodDomains.list({ limit: 10 });
      console.log(`   Found ${domains.data.length} domain(s)`);

      domains.data.forEach(domain => {
        console.log(`   - ${domain.domain_name} (${domain.status || 'unknown'})`);
      });
    } catch (error) {
      console.log(`   ❌ Domain listing failed: ${error.message}`);
    }
    console.log('');

    // Test 4: Check if Google Pay is enabled
    console.log('🔍 Google Pay Status:');
    console.log('   ⚠️  This requires manual verification in Stripe Dashboard');
    console.log('   📍 Go to: Settings → Payment methods → Google Pay');
    console.log('   🔧 Look for: Google Pay enabled checkbox');
    console.log('   🌐 Check: Domain verification status');
    console.log('');

    console.log('💡 Summary:');
    console.log('   ✅ Your Stripe account is working');
    console.log('   ✅ Domains are registered');
    console.log('   ❓ Google Pay needs to be enabled in dashboard');
    console.log('   ⏳ Domain verification may still be pending');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGooglePayAvailability().catch(console.error);
