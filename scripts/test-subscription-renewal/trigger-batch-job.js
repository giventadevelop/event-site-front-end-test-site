/**
 * Trigger Subscription Renewal Batch Job On Demand
 *
 * This script triggers the subscription renewal batch job manually
 * for testing purposes.
 *
 * Usage:
 *   node scripts/test-subscription-renewal/trigger-batch-job.js \
 *     --tenant-id=tenant_demo_002 \
 *     --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_API_BASE_URL
 *   - API_JWT_USER
 *   - API_JWT_PASS
 *   - NEXT_PUBLIC_TENANT_ID (default tenant ID)
 */

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

const tenantId = args['tenant-id'] || args.tenantId || process.env.NEXT_PUBLIC_TENANT_ID;
const subscriptionId = args['subscription-id'] || args.subscriptionId;
const batchSize = parseInt(args['batch-size'] || args.batchSize || '10', 10);
const maxSubscriptions = parseInt(args['max-subscriptions'] || args.maxSubscriptions || '100', 10);

if (!tenantId) {
  console.error('❌ Error: --tenant-id is required');
  console.log('Usage: node trigger-batch-job.js --tenant-id=tenant_demo_002 [--subscription-id=sub_xxx]');
  process.exit(1);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const API_JWT_USER = process.env.API_JWT_USER ||
                     process.env.AMPLIFY_API_JWT_USER ||
                     process.env.NEXT_PUBLIC_API_JWT_USER;
const API_JWT_PASS = process.env.API_JWT_PASS ||
                     process.env.AMPLIFY_API_JWT_PASS ||
                     process.env.NEXT_PUBLIC_API_JWT_PASS;

if (!API_BASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_API_BASE_URL environment variable is required');
  console.error('   Please add NEXT_PUBLIC_API_BASE_URL to your .env.local file in the project root');
  console.error('   Example: NEXT_PUBLIC_API_BASE_URL=http://localhost:8080');
  console.error(`   Checked: ${envLocalPath}`);
  process.exit(1);
}

if (!API_JWT_USER || !API_JWT_PASS) {
  console.error('❌ Error: API_JWT_USER and API_JWT_PASS environment variables are required');
  console.error('   Please add API_JWT_USER and API_JWT_PASS to your .env.local file in the project root');
  console.error('   Example: API_JWT_USER=jwtadmin');
  console.error('   Example: API_JWT_PASS=jwtadmin');
  console.error(`   Checked: ${envLocalPath}`);
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

async function triggerBatchJob() {
  try {
    console.log('\n🚀 Triggering Subscription Renewal Batch Job');
    console.log('='.repeat(60));
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Tenant ID: ${tenantId}`);
    if (subscriptionId) {
      console.log(`Subscription ID (filter): ${subscriptionId}`);
    }
    console.log(`Batch Size: ${batchSize}`);
    console.log(`Max Subscriptions: ${maxSubscriptions}`);
    console.log('='.repeat(60));

    // 1. Get JWT token
    console.log('\n🔐 Step 1: Authenticating...');
    const jwt = await getJwtToken();
    console.log('✅ Authentication successful');

    // 2. Prepare batch job request
    console.log('\n📋 Step 2: Preparing batch job request...');
    const batchJobUrl = `${API_BASE_URL}/api/cron/subscription-renewal`;
    const url = new URL(batchJobUrl);

    const requestBody = {
      tenantId: tenantId,
      batchSize: batchSize,
      maxSubscriptions: maxSubscriptions,
    };

    if (subscriptionId) {
      requestBody.stripeSubscriptionId = subscriptionId;
    }

    const postData = JSON.stringify(requestBody);

    // 3. Trigger batch job
    console.log('\n🔄 Step 3: Triggering batch job...');
    console.log(`   Endpoint: ${batchJobUrl}`);
    console.log(`   Request body:`, JSON.stringify(requestBody, null, 2));

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          try {
            const response = {
              status: res.statusCode,
              headers: res.headers,
              body: data ? JSON.parse(data) : null,
            };
            resolve(response);
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data,
            });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    // 4. Report results
    console.log('\n📊 Step 4: Batch Job Results');
    console.log('='.repeat(60));
    console.log(`Status Code: ${result.status}`);

    if (result.status === 200 || result.status === 201) {
      console.log('✅ Batch job triggered successfully');
      if (result.body) {
        console.log('\n📈 Job Statistics:');
        if (result.body.processed !== undefined) {
          console.log(`   Processed: ${result.body.processed}`);
        }
        if (result.body.updated !== undefined) {
          console.log(`   Updated: ${result.body.updated}`);
        }
        if (result.body.skipped !== undefined) {
          console.log(`   Skipped: ${result.body.skipped}`);
        }
        if (result.body.errors !== undefined) {
          console.log(`   Errors: ${result.body.errors}`);
        }
        if (result.body.duration) {
          console.log(`   Duration: ${result.body.duration}`);
        }
        if (result.body.message) {
          console.log(`   Message: ${result.body.message}`);
        }
      }
    } else {
      console.log('❌ Batch job failed');
      console.log('   Response:', JSON.stringify(result.body, null, 2));
    }

    console.log('\n📝 Next Steps:');
    console.log('   1. Wait 5-10 seconds for batch job to complete');
    console.log('   2. Run database verification script');
    console.log('   3. Check batch job logs for details\n');

  } catch (error) {
    console.error('\n❌ Error triggering batch job:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

triggerBatchJob();



