/**
 * Verify Database Subscription State After Renewal
 *
 * This script verifies that the database subscription record matches
 * the Stripe subscription state after renewal.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/verify-database.js \
 *     --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
 *     --tenant-id=tenant_demo_002
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_API_BASE_URL (Backend API base URL)
 *   - NEXT_PUBLIC_API_JWT_USER (API JWT username)
 *   - NEXT_PUBLIC_API_JWT_PASS (API JWT password)
 *   - NEXT_PUBLIC_TENANT_ID (default tenant ID)
 *   - STRIPE_SECRET_KEY (Stripe secret key)
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

const subscriptionId = args['subscription-id'] || args.subscriptionId;
const tenantId = args['tenant-id'] || args.tenantId || process.env.NEXT_PUBLIC_TENANT_ID;

if (!subscriptionId) {
  console.error('❌ Error: --subscription-id is required');
  console.log('Usage: node verify-database.js --subscription-id=sub_xxx --tenant-id=tenant_demo_002');
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

// Initialize API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_JWT_USER = process.env.NEXT_PUBLIC_API_JWT_USER || process.env.AMPLIFY_API_JWT_USER;
const API_JWT_PASS = process.env.NEXT_PUBLIC_API_JWT_PASS || process.env.AMPLIFY_API_JWT_PASS;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!API_BASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_API_BASE_URL environment variable is required');
  console.error('   Please add NEXT_PUBLIC_API_BASE_URL to your .env.local file');
  console.error(`   Checked: ${envLocalPath}`);
  process.exit(1);
}

if (!API_JWT_USER || !API_JWT_PASS) {
  console.error('❌ Error: API JWT credentials are required');
  console.error('   Please add NEXT_PUBLIC_API_JWT_USER and NEXT_PUBLIC_API_JWT_PASS to your .env.local file');
  console.error(`   Checked: ${envLocalPath}`);
  process.exit(1);
}

/**
 * Generate API JWT token for authentication
 */
async function generateApiJwt() {
  const apiUrl = `${API_BASE_URL}/api/authenticate`;
  const body = {
    username: API_JWT_USER,
    password: API_JWT_PASS,
    rememberMe: true,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.id_token;
}

/**
 * Fetch subscription from API by Stripe subscription ID
 */
async function fetchSubscriptionFromApi(stripeSubscriptionId, tenantId) {
  let token = await generateApiJwt();

  const params = new URLSearchParams({
    'stripeSubscriptionId.equals': stripeSubscriptionId,
    'tenantId.equals': tenantId,
  });

  const url = `${APP_URL}/api/proxy/membership-subscriptions?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorText = await response.text();
    throw new Error(`Failed to fetch subscription: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function verifyDatabase() {
  try {
    console.log('\n🔍 Verifying Database Subscription State');
    console.log('='.repeat(60));
    console.log(`Subscription ID: ${subscriptionId}`);
    console.log(`Tenant ID: ${tenantId}`);
    console.log('='.repeat(60));

    // 1. Fetch from Stripe
    console.log('\n📋 Step 1: Fetching subscription from Stripe...');
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'items.data.price.product'],
    });

    const stripePeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const stripePeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    const stripeStatus = stripeSubscription.status;

    console.log('✅ Stripe subscription retrieved');
    console.log('   Status:', stripeStatus);
    console.log('   Period start:', stripePeriodStart.toISOString());
    console.log('   Period end:', stripePeriodEnd.toISOString());
    console.log('   Customer ID:', typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id);

    // 2. Fetch from API (which queries the database)
    console.log('\n📋 Step 2: Fetching subscription from API...');
    const dbSubscription = await fetchSubscriptionFromApi(subscriptionId, tenantId);

    if (!dbSubscription) {
      console.error('❌ Error: Subscription not found in database');
      console.log(`   Searched for: stripeSubscriptionId = '${subscriptionId}', tenantId = '${tenantId}'`);
      process.exit(1);
    }
    console.log('✅ Database subscription retrieved');
    console.log('   Database ID:', dbSubscription.id);
    console.log('   Status:', dbSubscription.subscriptionStatus);
    console.log('   Period start:', dbSubscription.currentPeriodStart);
    console.log('   Period end:', dbSubscription.currentPeriodEnd);

    // 3. Compare and verify
    console.log('\n🔍 Step 3: Comparing Stripe vs Database...');

    const issues = [];
    const warnings = [];

    // Compare period start
    const dbPeriodStart = new Date(dbSubscription.currentPeriodStart);
    const periodStartDiff = Math.abs(stripePeriodStart.getTime() - dbPeriodStart.getTime());
    if (periodStartDiff > 60000) { // More than 1 minute difference
      issues.push({
        field: 'current_period_start',
        stripe: stripePeriodStart.toISOString(),
        database: dbPeriodStart.toISOString(),
        difference: `${Math.round(periodStartDiff / 1000)} seconds`,
      });
    } else if (periodStartDiff > 1000) {
      warnings.push({
        field: 'current_period_start',
        stripe: stripePeriodStart.toISOString(),
        database: dbPeriodStart.toISOString(),
        difference: `${Math.round(periodStartDiff / 1000)} seconds`,
      });
    }

    // Compare period end
    const dbPeriodEnd = new Date(dbSubscription.currentPeriodEnd);
    const periodEndDiff = Math.abs(stripePeriodEnd.getTime() - dbPeriodEnd.getTime());
    if (periodEndDiff > 60000) { // More than 1 minute difference
      issues.push({
        field: 'current_period_end',
        stripe: stripePeriodEnd.toISOString(),
        database: dbPeriodEnd.toISOString(),
        difference: `${Math.round(periodEndDiff / 1000)} seconds`,
      });
    } else if (periodEndDiff > 1000) {
      warnings.push({
        field: 'current_period_end',
        stripe: stripePeriodEnd.toISOString(),
        database: dbPeriodEnd.toISOString(),
        difference: `${Math.round(periodEndDiff / 1000)} seconds`,
      });
    }

    // Compare status
    const statusMap = {
      'active': 'ACTIVE',
      'trialing': 'TRIAL',
      'past_due': 'PAST_DUE',
      'canceled': 'CANCELLED',
      'unpaid': 'EXPIRED',
      'incomplete': 'ACTIVE',
      'incomplete_expired': 'EXPIRED',
      'paused': 'SUSPENDED',
    };
    const expectedStatus = statusMap[stripeStatus.toLowerCase()] || 'ACTIVE';
    if (dbSubscription.subscriptionStatus !== expectedStatus) {
      issues.push({
        field: 'subscriptionStatus',
        stripe: stripeStatus,
        expected: expectedStatus,
        database: dbSubscription.subscriptionStatus,
      });
    }

    // Compare customer ID
    const stripeCustomerId = typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;
    if (dbSubscription.stripeCustomerId !== stripeCustomerId) {
      issues.push({
        field: 'stripeCustomerId',
        stripe: stripeCustomerId,
        database: dbSubscription.stripeCustomerId,
      });
    }

    // 4. Report results
    console.log('\n📊 Verification Results:');
    console.log('='.repeat(60));

    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ All fields match perfectly!');
    } else {
      if (warnings.length > 0) {
        console.log('\n⚠️  Warnings (minor differences):');
        warnings.forEach((warning) => {
          console.log(`   ${warning.field}:`);
          console.log(`     Stripe:   ${warning.stripe}`);
          console.log(`     Database: ${warning.database}`);
          console.log(`     Difference: ${warning.difference}`);
        });
      }

      if (issues.length > 0) {
        console.log('\n❌ Issues (significant differences):');
        issues.forEach((issue) => {
          console.log(`   ${issue.field}:`);
          if (issue.expected) {
            console.log(`     Stripe:   ${issue.stripe} (expected: ${issue.expected})`);
            console.log(`     Database: ${issue.database}`);
          } else {
            console.log(`     Stripe:   ${issue.stripe}`);
            console.log(`     Database: ${issue.database}`);
          }
          if (issue.difference) {
            console.log(`     Difference: ${issue.difference}`);
          }
        });
      }
    }

    // 5. Reconciliation status check
    console.log('\n📋 Step 4: Checking reconciliation status...');
    console.log('   Reconciliation status:', dbSubscription.reconciliationStatus || 'PENDING');
    console.log('   Last reconciliation:', dbSubscription.lastReconciliationAt || 'Never');
    console.log('   Last Stripe sync:', dbSubscription.lastStripeSyncAt || 'Never');
    if (dbSubscription.reconciliationError) {
      console.log('   ⚠️  Reconciliation error:', dbSubscription.reconciliationError);
    }

    // 6. Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(60));
    if (issues.length === 0) {
      console.log('✅ Database is in sync with Stripe');
      if (warnings.length > 0) {
        console.log(`⚠️  ${warnings.length} minor warning(s) (acceptable)`);
      }
    } else {
      console.log(`❌ ${issues.length} issue(s) found - database needs reconciliation`);
      console.log('\n💡 Recommendation: Run batch job to sync database with Stripe');
    }

    // Exit with error code if issues found
    if (issues.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error verifying database:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

verifyDatabase();



