/**
 * Sync Database Subscription Dates from Stripe
 *
 * This script updates the database subscription's current_period_start and current_period_end
 * to match the actual dates from Stripe. This is useful when:
 * - Stripe subscription dates have been advanced (via expedite script)
 * - Database is out of sync with Stripe
 * - Testing batch job queries
 *
 * Usage:
 *   node scripts/test-subscription-renewal/sync-database-from-stripe.js \
 *     --subscription-id=sub_1SijZhK5BrggeAHMwPaKK3CQ \
 *     [--tenant-id=tenant_demo_002]
 *
 * Environment Variables Required:
 *   - STRIPE_SECRET_KEY (test mode key)
 *   - NEXT_PUBLIC_API_BASE_URL
 *   - API_JWT_USER
 *   - API_JWT_PASS
 *   - NEXT_PUBLIC_TENANT_ID (default tenant ID)
 */

import Stripe from 'stripe';
import https from 'https';
import http from 'http';
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
  console.log('Usage: node sync-database-from-stripe.js --subscription-id=sub_xxx [--tenant-id=tenant_xxx]');
  process.exit(1);
}

if (!tenantId) {
  console.error('❌ Error: --tenant-id is required');
  console.log('Usage: node sync-database-from-stripe.js --subscription-id=sub_xxx --tenant-id=tenant_xxx');
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const API_JWT_USER = process.env.API_JWT_USER ||
                     process.env.AMPLIFY_API_JWT_USER ||
                     process.env.NEXT_PUBLIC_API_JWT_USER;
const API_JWT_PASS = process.env.API_JWT_PASS ||
                     process.env.AMPLIFY_API_JWT_PASS ||
                     process.env.NEXT_PUBLIC_API_JWT_PASS;

if (!API_BASE_URL || !API_JWT_USER || !API_JWT_PASS) {
  console.error('❌ Error: API credentials are required');
  console.error('   Please add NEXT_PUBLIC_API_BASE_URL, API_JWT_USER, and API_JWT_PASS to your .env.local file');
  process.exit(1);
}

async function getJwtToken() {
  return new Promise((resolve, reject) => {
    const authUrl = `${API_BASE_URL}/api/authenticate`;
    const url = new URL(authUrl);

    const postData = JSON.stringify({
      username: API_JWT_USER,
      password: API_JWT_PASS,
      rememberMe: true,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            const token = res.headers['authorization']?.replace('Bearer ', '') || response.id_token;
            resolve(token);
          } catch (error) {
            reject(new Error(`Failed to parse JWT response: ${error.message}`));
          }
        } else {
          reject(new Error(`JWT authentication failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function findSubscriptionByStripeId(stripeSubscriptionId, jwt) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      'stripeSubscriptionId.equals': stripeSubscriptionId,
      'tenantId.equals': tenantId,
    });
    const apiUrl = `${API_BASE_URL}/api/membership-subscriptions?${params.toString()}`;
    const url = new URL(apiUrl);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'X-Tenant-Id': tenantId,
      },
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            const subscriptions = Array.isArray(response) ? response : (response.content || []);
            resolve(subscriptions.length > 0 ? subscriptions[0] : null);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`API request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function updateSubscription(subscriptionId, updates, jwt) {
  return new Promise((resolve, reject) => {
    const apiUrl = `${API_BASE_URL}/api/membership-subscriptions/${subscriptionId}`;
    const url = new URL(apiUrl);

    const postData = JSON.stringify(updates);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Authorization': `Bearer ${jwt}`,
        'X-Tenant-Id': tenantId,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          try {
            const response = data ? JSON.parse(data) : null;
            resolve(response);
          } catch (error) {
            resolve(null);
          }
        } else {
          reject(new Error(`Update failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function syncDatabaseFromStripe() {
  try {
    console.log('\n🔄 Syncing Database Subscription Dates from Stripe');
    console.log('='.repeat(60));
    console.log(`Stripe Subscription ID: ${subscriptionId}`);
    console.log(`Tenant ID: ${tenantId}`);
    console.log('='.repeat(60));

    // 1. Get JWT token
    console.log('\n🔐 Step 1: Authenticating...');
    const jwt = await getJwtToken();
    console.log('✅ Authentication successful');

    // 2. Fetch subscription from Stripe
    console.log('\n📋 Step 2: Fetching subscription from Stripe...');
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    const stripePeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const stripePeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    console.log('✅ Stripe subscription retrieved:');
    console.log('   Status:', stripeSubscription.status);
    console.log('   Current period start:', stripePeriodStart.toISOString().split('T')[0]);
    console.log('   Current period end:', stripePeriodEnd.toISOString().split('T')[0]);

    // 3. Find database subscription
    console.log('\n📋 Step 3: Finding database subscription...');
    const dbSubscription = await findSubscriptionByStripeId(subscriptionId, jwt);

    if (!dbSubscription) {
      console.error('❌ Error: Subscription not found in database');
      console.error(`   Searched for stripe_subscription_id: ${subscriptionId}`);
      console.error(`   Tenant ID: ${tenantId}`);
      process.exit(1);
    }

    console.log('✅ Database subscription found:');
    console.log('   Database ID:', dbSubscription.id);
    console.log('   Current period start:', dbSubscription.currentPeriodStart);
    console.log('   Current period end:', dbSubscription.currentPeriodEnd);
    console.log('   Subscription status:', dbSubscription.subscriptionStatus);

    // 4. Compare dates
    const dbPeriodStart = new Date(dbSubscription.currentPeriodStart);
    const dbPeriodEnd = new Date(dbSubscription.currentPeriodEnd);

    const periodStartDiff = Math.abs(stripePeriodStart.getTime() - dbPeriodStart.getTime());
    const periodEndDiff = Math.abs(stripePeriodEnd.getTime() - dbPeriodEnd.getTime());

    console.log('\n📊 Step 4: Comparing dates...');
    console.log('   Period start difference:', Math.round(periodStartDiff / (24 * 60 * 60 * 1000)), 'days');
    console.log('   Period end difference:', Math.round(periodEndDiff / (24 * 60 * 60 * 1000)), 'days');

    if (periodStartDiff < 1000 && periodEndDiff < 1000) {
      console.log('\n✅ Database is already in sync with Stripe - no update needed');
      return;
    }

    // 5. Update database
    console.log('\n🔄 Step 5: Updating database subscription...');
    const updates = {
      currentPeriodStart: stripePeriodStart.toISOString().split('T')[0], // YYYY-MM-DD format
      currentPeriodEnd: stripePeriodEnd.toISOString().split('T')[0], // YYYY-MM-DD format
      updatedAt: new Date().toISOString(),
    };

    console.log('   Updating with:');
    console.log('     currentPeriodStart:', updates.currentPeriodStart);
    console.log('     currentPeriodEnd:', updates.currentPeriodEnd);

    const updatedSubscription = await updateSubscription(dbSubscription.id, updates, jwt);

    console.log('\n✅ Database subscription updated successfully!');
    console.log('\n📊 Updated Subscription:');
    if (updatedSubscription) {
      console.log('   Current period start:', updatedSubscription.currentPeriodStart);
      console.log('   Current period end:', updatedSubscription.currentPeriodEnd);
    } else {
      console.log('   (Update successful, but response not available)');
    }

    console.log('\n📝 Next Steps:');
    console.log('   1. Verify the dates match Stripe');
    console.log('   2. Run batch job to test renewal processing');
    console.log('   3. Check batch job logs for subscription processing\n');

  } catch (error) {
    console.error('\n❌ Error syncing database from Stripe:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

syncDatabaseFromStripe();


