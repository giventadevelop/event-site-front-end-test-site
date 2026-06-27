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

async function registerDomain(domainName) {
  try {
    console.log(`🔗 Registering domain: ${domainName}`);

    const paymentMethodDomain = await stripe.paymentMethodDomains.create({
      domain_name: domainName,
    });

    console.log(`✅ Successfully registered domain: ${domainName}`);
    console.log(`   Domain ID: ${paymentMethodDomain.id}`);
    console.log(`   Status: ${paymentMethodDomain.status}`);
    console.log(`   Created: ${new Date(paymentMethodDomain.created * 1000).toISOString()}`);

    return paymentMethodDomain;
  } catch (error) {
    if (error.code === 'resource_missing') {
      console.error(`❌ Domain registration failed: ${error.message}`);
      console.log('   This usually means the domain is already registered or invalid');
    } else {
      console.error(`❌ Error registering domain ${domainName}:`, error.message);
    }
    return null;
  }
}

async function listRegisteredDomains() {
  try {
    console.log('📋 Listing currently registered domains...');

    const domains = await stripe.paymentMethodDomains.list({
      limit: 100,
    });

    if (domains.data.length === 0) {
      console.log('   No domains currently registered');
    } else {
      console.log(`   Found ${domains.data.length} registered domain(s):`);
      domains.data.forEach((domain, index) => {
        console.log(`   ${index + 1}. ${domain.domain_name} (${domain.status})`);
      });
    }

    return domains.data;
  } catch (error) {
    console.error('❌ Error listing domains:', error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Stripe Google Pay Domain Registration Script');
  console.log('================================================\n');

  // Get domain from command line argument
  const domain = process.argv[2];

  if (!domain) {
    console.log('❌ Please provide a domain name as an argument');
    console.log('   Usage: node scripts/register-google-pay-domain.mjs yourdomain.com');
    console.log('\n   Example:');
    console.log('   node scripts/register-google-pay-domain.mjs example.com');
    console.log('   node scripts/register-google-pay-domain.mjs www.example.com');
    process.exit(1);
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain)) {
    console.error('❌ Invalid domain format. Please provide a valid domain name.');
    console.log('   Examples: example.com, www.example.com, sub.example.com');
    process.exit(1);
  }

  console.log(`🎯 Target domain: ${domain}`);
  console.log(`🔑 Using Stripe key: ${STRIPE_SECRET_KEY.substring(0, 12)}...`);
  console.log('');

  // List current domains first
  await listRegisteredDomains();
  console.log('');

  // Register the new domain
  const result = await registerDomain(domain);

  if (result) {
    console.log('\n🎉 Domain registration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Wait 24-48 hours for Google to verify your domain');
    console.log('   2. Deploy your updated StripeDesktopCheckout component');
    console.log('   3. Test Google Pay in production');
    console.log('\n⚠️  Note: Google Pay will not appear until domain verification is complete');
  } else {
    console.log('\n❌ Domain registration failed. Please check the error messages above.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - Ensure your domain is accessible via HTTPS');
    console.log('   - Check if the domain is already registered');
    console.log('   - Verify your Stripe account has Google Pay enabled');
  }
}

// Run the script
main().catch(console.error);
