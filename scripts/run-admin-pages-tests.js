#!/usr/bin/env node

/**
 * Reusable TestScript for Running Admin Pages Tests
 *
 * This script executes TestSprite MCP tests for admin pages only.
 * It requires admin credentials for authentication.
 *
 * Usage:
 *   node scripts/run-admin-pages-tests.js [options]
 *
 * Options:
 *   --test-plan=<path>    Path to test plan file (default: testsprite_tests/admin_pages_sanity_test_plan.json)
 *   --config=<path>       Path to test config file (optional, for reference only)
 *   --base-url=<url>      Base URL for testing (default: http://localhost:3000)
 *   --admin-email=<email> Admin email for authentication (or use TEST_ADMIN_EMAIL env var)
 *   --admin-password=<pwd> Admin password for authentication (or use TEST_ADMIN_PASSWORD env var)
 *   --help                Show this help message
 *
 * Examples:
 *   # Run admin pages sanity tests with environment variables
 *   TEST_ADMIN_EMAIL=admin@example.com TEST_ADMIN_PASSWORD=password123 node scripts/run-admin-pages-tests.js
 *
 *   # Run with command-line credentials
 *   node scripts/run-admin-pages-tests.js --admin-email=admin@example.com --admin-password=password123
 *
 *   # Run with custom test plan
 *   node scripts/run-admin-pages-tests.js --test-plan=testsprite_tests/admin_pages_comprehensive_test_plan.json
 *
 *   # Run with custom base URL
 *   node scripts/run-admin-pages-tests.js --base-url=http://localhost:3001
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration
const DEFAULT_TEST_PLAN = 'testsprite_tests/admin_pages_sanity_test_plan.json';
const DEFAULT_BASE_URL = 'http://localhost:3000';
const TESTSPRITE_MCP_PATH = 'E:\\.npm-cache\\_npx\\8ddf6bea01b2519d\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    testPlan: DEFAULT_TEST_PLAN,
    configFile: null,
    baseUrl: DEFAULT_BASE_URL,
    adminEmail: process.env.TEST_ADMIN_EMAIL || null,
    adminPassword: process.env.TEST_ADMIN_PASSWORD || null,
    help: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--test-plan=')) {
      config.testPlan = arg.split('=')[1];
    } else if (arg.startsWith('--config=')) {
      config.configFile = arg.split('=')[1];
    } else if (arg.startsWith('--base-url=')) {
      config.baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--admin-email=')) {
      config.adminEmail = arg.split('=')[1];
    } else if (arg.startsWith('--admin-password=')) {
      config.adminPassword = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      config.help = true;
    }
  });

  return config;
}

// Display help message
function showHelp() {
  console.log(`
📋 Admin Pages Test Script

Usage:
  node scripts/run-admin-pages-tests.js [options]

Options:
  --test-plan=<path>      Path to test plan file
                          Default: ${DEFAULT_TEST_PLAN}

  --config=<path>         Path to test config file (optional, for reference only)
                          Note: TestSprite MCP uses the test plan file directly

  --base-url=<url>        Base URL for testing
                          Default: ${DEFAULT_BASE_URL}

  --admin-email=<email>   Admin email for authentication
                          Alternative: Set TEST_ADMIN_EMAIL environment variable

  --admin-password=<pwd>  Admin password for authentication
                          Alternative: Set TEST_ADMIN_PASSWORD environment variable

  --help, -h              Show this help message

Examples:
  # Run admin pages sanity tests with environment variables (recommended)
  $env:TEST_ADMIN_EMAIL="admin@example.com"; $env:TEST_ADMIN_PASSWORD="password123"
  node scripts/run-admin-pages-tests.js

  # Run with command-line credentials
  node scripts/run-admin-pages-tests.js --admin-email=admin@example.com --admin-password=password123

  # Run sanity tests only
  node scripts/run-admin-pages-tests.js --test-plan=testsprite_tests/admin_pages_sanity_test_plan.json

  # Run with custom base URL
  node scripts/run-admin-pages-tests.js --base-url=http://localhost:3001

  # Run with config file reference (for documentation)
  node scripts/run-admin-pages-tests.js --config=testsprite_tests/admin_pages_test_config.json

Test Plan Files:
  - testsprite_tests/admin_pages_sanity_test_plan.json  (Sanity - 17 tests)

Authentication:
  Admin credentials are required for all admin page tests.
  The first test (ADMIN-001) handles login authentication.
  All subsequent tests assume user is already authenticated.

  Credentials can be provided via:
  1. Environment variables: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD
  2. Command-line arguments: --admin-email and --admin-password

Output:
  Test results are saved to:
  - testsprite_tests/tmp/test_results.json
  - testsprite_tests/tmp/test_report.html

After running tests:
  # Filter expected errors (Next.js 15 warnings)
  node scripts/filter-testsprite-errors.js

  # View HTML report
  start testsprite_tests\\tmp\\test_report.html
`);
}

// Validate test plan file exists
function validateTestPlan(testPlanPath) {
  if (!fs.existsSync(testPlanPath)) {
    console.error(`❌ Error: Test plan file not found: ${testPlanPath}`);
    console.error(`\n💡 Available test plans:`);

    const testPlanDir = path.dirname(testPlanPath);
    if (fs.existsSync(testPlanDir)) {
      const files = fs.readdirSync(testPlanDir)
        .filter(f => f.includes('test_plan.json'))
        .map(f => `  - ${path.join(testPlanDir, f)}`);

      if (files.length > 0) {
        console.error(files.join('\n'));
      } else {
        console.error(`  No test plan files found in ${testPlanDir}`);
      }
    }

    process.exit(1);
  }

  // Validate JSON structure
  try {
    const content = fs.readFileSync(testPlanPath, 'utf8');
    const testPlan = JSON.parse(content);

    if (!Array.isArray(testPlan)) {
      console.error(`❌ Error: Test plan must be an array of test objects`);
      process.exit(1);
    }

    console.log(`✅ Test plan validated: ${testPlan.length} test cases found`);
    return testPlan;
  } catch (error) {
    console.error(`❌ Error: Invalid JSON in test plan file: ${error.message}`);
    process.exit(1);
  }
}

// Read config file if provided (for reference)
function readConfigFile(configPath) {
  if (!configPath) return null;

  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  Warning: Config file not found: ${configPath}`);
    console.warn(`   Continuing without config file (test plan file is sufficient)`);
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);
    return config;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not parse config file: ${error.message}`);
    console.warn(`   Continuing without config file (test plan file is sufficient)`);
    return null;
  }
}

// Validate admin credentials
function validateCredentials(config) {
  if (!config.adminEmail || !config.adminPassword) {
    console.error('\n❌ Error: Admin credentials are required for admin page tests');
    console.error('\n💡 Provide credentials using one of these methods:');
    console.error('\n   1. Environment variables (recommended):');
    console.error('      $env:TEST_ADMIN_EMAIL="admin@example.com"');
    console.error('      $env:TEST_ADMIN_PASSWORD="password123"');
    console.error('      node scripts/run-admin-pages-tests.js');
    console.error('\n   2. Command-line arguments:');
    console.error('      node scripts/run-admin-pages-tests.js --admin-email=admin@example.com --admin-password=password123');
    console.error('\n   3. Create .env.local file (not recommended for security):');
    console.error('      TEST_ADMIN_EMAIL=admin@example.com');
    console.error('      TEST_ADMIN_PASSWORD=password123');
    console.error('\n⚠️  Note: Admin credentials must have ADMIN role in the database.');
    console.error('   See testsprite_tests/ADMIN_TEST_SETUP.md for details.\n');
    process.exit(1);
  }

  console.log(`✅ Admin credentials provided: ${config.adminEmail}`);
  console.log(`   ⚠️  Note: Credentials will be used for Clerk authentication during tests\n`);
}

// Main execution function
async function main() {
  const config = parseArgs();

  if (config.help) {
    showHelp();
    return;
  }

  console.log('\n🚀 Admin Pages Test Execution');
  console.log('='.repeat(60));
  console.log(`Test Plan: ${config.testPlan}`);
  if (config.configFile) {
    console.log(`Config File: ${config.configFile} (reference only)`);
  }
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('='.repeat(60));
  console.log('');

  // Validate admin credentials
  validateCredentials(config);

  // Validate test plan
  const testPlan = validateTestPlan(config.testPlan);

  // Read config file if provided (for reference/documentation)
  const testConfig = config.configFile ? readConfigFile(config.configFile) : null;

  if (testConfig) {
    console.log(`📋 Test Suite: ${testConfig.testPlanName || 'N/A'}`);
    console.log(`📝 Description: ${testConfig.testPlanDescription || 'N/A'}`);
    console.log('');
  }

  // Display test plan summary
  console.log(`📊 Test Plan Summary:`);
  console.log(`   Total Tests: ${testPlan.length}`);

  const byCategory = testPlan.reduce((acc, test) => {
    acc[test.category] = (acc[test.category] || 0) + 1;
    return acc;
  }, {});

  console.log(`   Categories:`);
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`     - ${cat}: ${count} tests`);
  });

  const byPriority = testPlan.reduce((acc, test) => {
    acc[test.priority] = (acc[test.priority] || 0) + 1;
    return acc;
  }, {});

  console.log(`   Priorities:`);
  Object.entries(byPriority).forEach(([pri, count]) => {
    console.log(`     - ${pri}: ${count} tests`);
  });
  console.log('');

  // Clean up lock file from interrupted test runs
  const LOCK_FILE_PATH = 'testsprite_tests/tmp/execution.lock';
  if (fs.existsSync(LOCK_FILE_PATH)) {
    console.log('🧹 Cleaning up lock file from previous test run...');
    try {
      fs.unlinkSync(LOCK_FILE_PATH);
      console.log('   ✅ Lock file removed\n');
    } catch (error) {
      console.warn(`   ⚠️  Could not remove lock file: ${error.message}`);
      console.warn('   💡 You may need to manually delete: ' + LOCK_FILE_PATH);
      console.warn('   💡 Or wait for any running tests to complete\n');
    }
  }

  // Check server connectivity (read-only check - does NOT start/stop server)
  console.log('🔍 Checking server connectivity...');
  try {
    const response = await fetch(`${config.baseUrl}/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok || response.status === 200 || response.status === 401) {
      console.log(`   ✅ Server is running at ${config.baseUrl}\n`);
    } else {
      console.warn(`   ⚠️  Server responded with status ${response.status}`);
      console.warn(`   💡 Tests may fail if server is not fully ready\n`);
    }
  } catch (error) {
    console.error(`   ❌ Cannot connect to server at ${config.baseUrl}`);
    console.error(`   💡 Make sure your Next.js dev server is running:`);
    console.error(`      npm run dev`);
    console.error(`   💡 Verify the server is accessible in your browser\n`);
    process.exit(1);
  }

  // Backup and copy test plan to default location
  const DEFAULT_TEST_PLAN_PATH = 'testsprite_tests/testsprite_frontend_test_plan.json';
  const BACKUP_PATH = DEFAULT_TEST_PLAN_PATH + '.backup';
  const testPlanPath = path.resolve(config.testPlan);

  console.log('📋 Backing up existing default test plan...');
  if (fs.existsSync(DEFAULT_TEST_PLAN_PATH)) {
    try {
      fs.copyFileSync(DEFAULT_TEST_PLAN_PATH, BACKUP_PATH);
      console.log(`   ✅ Backup created: ${BACKUP_PATH}`);
    } catch (error) {
      console.warn(`   ⚠️  Could not create backup: ${error.message}`);
      console.warn(`   💡 Continuing anyway...`);
    }
  } else {
    console.log(`   ℹ️  No existing default test plan found (this is OK for first run)`);
  }

  console.log('\n📋 Copying test plan to default location...');
  console.log(`   From: ${testPlanPath}`);
  console.log(`   To: ${DEFAULT_TEST_PLAN_PATH}`);
  try {
    fs.copyFileSync(testPlanPath, DEFAULT_TEST_PLAN_PATH);
    console.log(`   ✅ Test plan copied successfully\n`);
  } catch (error) {
    console.error(`   ❌ Error copying test plan: ${error.message}`);
    process.exit(1);
  }

  // Set environment variables for TestSprite (credentials)
  const originalEnv = { ...process.env };
  process.env.TEST_ADMIN_EMAIL = config.adminEmail;
  process.env.TEST_ADMIN_PASSWORD = config.adminPassword;

  // Execute TestSprite MCP
  console.log('📝 Command: node "' + TESTSPRITE_MCP_PATH + '" generateCodeAndExecute');
  console.log(`📝 TestSprite MCP will use: ${DEFAULT_TEST_PLAN_PATH} (copied from ${config.testPlan})`);
  console.log(`📝 Admin credentials: ${config.adminEmail} (password hidden)\n`);

  console.log('⚡ Executing TestSprite MCP tests...');
  console.log('   This may take 5-15 minutes depending on the number of tests');
  console.log('   Please wait...\n');

  try {
    execSync(
      `node "${TESTSPRITE_MCP_PATH}" generateCodeAndExecute`,
      {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: process.env
      }
    );

    console.log('\n✅ Test execution completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('   1. Filter expected errors:');
    console.log('      node scripts/filter-testsprite-errors.js');
    console.log('   2. View HTML report:');
    console.log('      start testsprite_tests\\tmp\\test_report.html');
    console.log('   3. Share report with Cursor AI to fix any failures\n');

  } catch (error) {
    console.error('\n❌ Test execution failed!');
    console.error(`   Error: ${error.message}`);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure TestSprite MCP is installed');
    console.error('   2. Ensure Next.js dev server is running');
    console.error('   3. Check that admin credentials are correct');
    console.error('   4. Verify admin user has ADMIN role in database');
    console.error('   5. Check that test plan file is valid JSON');
    console.error('   6. Verify base URL is correct');
    console.error('\n📋 Restoring original default test plan due to error...');

    // Restore original test plan
    if (fs.existsSync(BACKUP_PATH)) {
      try {
        fs.copyFileSync(BACKUP_PATH, DEFAULT_TEST_PLAN_PATH);
        fs.unlinkSync(BACKUP_PATH);
        console.log(`   ✅ Restored: ${DEFAULT_TEST_PLAN_PATH}`);
      } catch (restoreError) {
        console.warn(`   ⚠️  Could not restore original test plan: ${restoreError.message}`);
      }
    }

    // Restore environment variables
    process.env = originalEnv;

    process.exit(1);
  }

  // Restore original test plan
  console.log('\n📋 Restoring original default test plan...');
  if (fs.existsSync(BACKUP_PATH)) {
    try {
      fs.copyFileSync(BACKUP_PATH, DEFAULT_TEST_PLAN_PATH);
      fs.unlinkSync(BACKUP_PATH);
      console.log(`   ✅ Restored: ${DEFAULT_TEST_PLAN_PATH}`);
    } catch (restoreError) {
      console.warn(`   ⚠️  Could not restore original test plan: ${restoreError.message}`);
      console.warn(`   💡 You may need to manually restore from: ${BACKUP_PATH}`);
    }
  } else {
    console.log(`   ℹ️  No backup found - keeping copied test plan`);
  }

  // Restore environment variables
  process.env = originalEnv;
}

// Run main function
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

