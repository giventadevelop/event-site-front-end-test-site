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

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function listRegisteredDomains() {
  try {
    console.log('📋 Currently registered Google Pay domains:');
    console.log('===========================================\n');

    const domains = await stripe.paymentMethodDomains.list({
      limit: 100,
    });

    if (domains.data.length === 0) {
      console.log('   No domains currently registered');
      console.log('\n💡 To register a domain, run:');
      console.log('   node scripts/register-google-pay-domain.mjs yourdomain.com');
    } else {
      console.log(`   Found ${domains.data.length} registered domain(s):\n`);
      domains.data.forEach((domain, index) => {
        const status = domain.status === 'active' ? '✅' : '⏳';
        const created = new Date(domain.created * 1000).toLocaleDateString();
        console.log(`   ${index + 1}. ${status} ${domain.domain_name}`);
        console.log(`      Status: ${domain.status || 'unknown'}`);
        console.log(`      Created: ${created}`);
        console.log(`      ID: ${domain.id}`);

        // Show verification details
        if (domain.status === 'active') {
          console.log(`      ✅ Google Pay: ENABLED`);
        } else if (domain.status === 'pending') {
          console.log(`      ⏳ Google Pay: PENDING VERIFICATION`);
          console.log(`         Google takes 24-48 hours to verify`);
        } else {
          console.log(`      ❓ Google Pay: STATUS UNKNOWN`);
          console.log(`         Check Stripe dashboard for details`);
        }
        console.log('');
      });

      console.log('💡 To register additional domains, run:');
      console.log('   node scripts/register-google-pay-domain.mjs yourdomain.com');
    }

    return domains.data;
  } catch (error) {
    console.error('❌ Error listing domains:', error.message);
    console.log('\n💡 Make sure your Stripe account has Google Pay enabled');
    return [];
  }
}

// Run the script
listRegisteredDomains().catch(console.error);
