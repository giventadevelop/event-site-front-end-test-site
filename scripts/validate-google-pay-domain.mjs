#!/usr/bin/env node

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.production') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });
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
  apiVersion: '2024-12-18.acacia'
});

async function validateGooglePayDomains() {
  try {
    console.log('🔧 Validating Google Pay Domains');
    console.log('==================================\n');

    console.log('📋 Listing current domains...');
    const domains = await stripe.paymentMethodDomains.list({
      limit: 100,
    });

    if (domains.data.length === 0) {
      console.log('   ❌ No domains found');
      return;
    }

    console.log(`   Found ${domains.data.length} domain(s):\n`);

    for (const domain of domains.data) {
      console.log(`   📍 Domain: ${domain.domain_name}`);
      console.log(`      ID: ${domain.id}`);
      console.log(`      Current Status: ${domain.status || 'unknown'}`);

      if (domain.google_pay) {
        console.log(`      Google Pay Status: ${domain.google_pay.status || 'unknown'}`);
      } else {
        console.log(`      Google Pay Status: Not configured`);
      }

      // Validate the domain
      try {
        console.log(`      🔧 Validating domain...`);
        const validatedDomain = await stripe.paymentMethodDomains.validate(domain.id);

        console.log(`      ✅ Validation successful!`);
        console.log(`      New Status: ${validatedDomain.status || 'unknown'}`);

        if (validatedDomain.google_pay) {
          console.log(`      Google Pay Status: ${validatedDomain.google_pay.status || 'unknown'}`);
        }

        if (validatedDomain.status === 'active') {
          console.log(`      🎉 Domain is now ACTIVE!`);
        } else if (validatedDomain.status === 'pending') {
          console.log(`      ⏳ Domain is PENDING verification (24-48 hours)`);
        } else {
          console.log(`      ❓ Domain status: ${validatedDomain.status}`);
        }

      } catch (validationError) {
        console.log(`      ❌ Validation failed: ${validationError.message}`);

        if (validationError.type === 'invalid_request_error') {
          console.log(`         This usually means the domain requirements aren't met`);
          console.log(`         Check Stripe Dashboard for specific requirements`);
        }
      }

      console.log('');
    }

    console.log('💡 Next Steps:');
    console.log('   1. Check Stripe Dashboard → Settings → Payment method domains');
    console.log('   2. Verify domain status changed from "unknown" to "active"');
    console.log('   3. Wait 24-48 hours for Google verification if status is "pending"');
    console.log('   4. Test Google Pay button in your Express Checkout');

  } catch (error) {
    console.error('❌ Error validating domains:', error.message);
    if (error.type === 'api_error') {
      console.log('\n💡 This might be an API version issue. Try updating the Stripe library.');
    }
  }
}

validateGooglePayDomains().catch(console.error);
