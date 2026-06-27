#!/usr/bin/env node

/**
 * Reusable TestScript for Running User Pages Tests
 *
 * This script executes TestSprite MCP tests for regular user pages.
 * It requires user credentials for authentication.
 *
 * Usage:
 *   node scripts/run-user-pages-tests.js [options]
 *
 * Options:
 *   --test-plan=<path>    Path to test plan file (default: testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json)
 *   --config=<path>       Path to test config file (optional, for reference only)
 *   --base-url=<url>      Base URL for testing (default: http://localhost:3000)
 *   --user-email=<email>  User email for authentication (or use TEST_USER_EMAIL env var)
 *   --user-password=<pwd> User password for authentication (or use TEST_USER_PASSWORD env var)
 *   --help                Show this help message
 *
 * Examples:
 *   # Run user pages comprehensive tests with environment variables
 *   TEST_USER_EMAIL=user@example.com TEST_USER_PASSWORD=password123 node scripts/run-user-pages-tests.js
 *
 *   # Run with command-line credentials
 *   node scripts/run-user-pages-tests.js --user-email=user@example.com --user-password=password123
 *
 *   # Run with custom test plan
 *   node scripts/run-user-pages-tests.js --test-plan=testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json
 *
 *   # Run with custom base URL
 *   node scripts/run-user-pages-tests.js --base-url=http://localhost:3001
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'; // For server connectivity check

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration
const DEFAULT_TEST_PLAN = 'testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json';
const DEFAULT_BASE_URL = 'http://localhost:3000';
const TESTSPRITE_MCP_PATH = 'E:\\.npm-cache\\_npx\\8ddf6bea01b2519d\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    testPlan: DEFAULT_TEST_PLAN,
    configFile: null,
    baseUrl: DEFAULT_BASE_URL,
    userEmail: process.env.TEST_USER_EMAIL || null,
    userPassword: process.env.TEST_USER_PASSWORD || null,
    help: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--test-plan=')) {
      config.testPlan = arg.split('=')[1];
    } else if (arg.startsWith('--config=')) {
      config.configFile = arg.split('=')[1];
    } else if (arg.startsWith('--base-url=')) {
      config.baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--user-email=')) {
      config.userEmail = arg.split('=')[1];
    } else if (arg.startsWith('--user-password=')) {
      config.userPassword = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      config.help = true;
    }
  });

  return config;
}

// Display help message
function showHelp() {
  console.log(`
📋 User Pages Test Script

Usage:
  node scripts/run-user-pages-tests.js [options]

Options:
  --test-plan=<path>      Path to test plan file
                          Default: ${DEFAULT_TEST_PLAN}

  --config=<path>         Path to test config file (optional, for reference only)
                          Note: TestSprite MCP uses the test plan file directly

  --base-url=<url>        Base URL for testing
                          Default: ${DEFAULT_BASE_URL}

  --user-email=<email>    User email for authentication
                          Alternative: Set TEST_USER_EMAIL environment variable

  --user-password=<pwd>   User password for authentication
                          Alternative: Set TEST_USER_PASSWORD environment variable

  --help, -h              Show this help message

Examples:
  # Run user pages comprehensive tests with environment variables (recommended)
  $env:TEST_USER_EMAIL="user@example.com"; $env:TEST_USER_PASSWORD="password123"
  node scripts/run-user-pages-tests.js

  # Run with command-line credentials
  node scripts/run-user-pages-tests.js --user-email=user@example.com --user-password=password123

  # Run with custom test plan
  node scripts/run-user-pages-tests.js --test-plan=testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json

  # Run with custom base URL
  node scripts/run-user-pages-tests.js --base-url=http://localhost:3001

Test Plan Files:
  - testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json  (Comprehensive - 20 tests)

Authentication:
  User credentials are required for all user page tests.
  The first test (USER-001) handles login authentication.
  Tests USER-002 through USER-016 assume user is authenticated.
  Test USER-017 handles logout.
  Tests USER-018 and USER-019 verify post-logout behavior and re-login.

  Credentials can be provided via:
  1. Environment variables: TEST_USER_EMAIL and TEST_USER_PASSWORD
  2. Command-line arguments: --user-email and --user-password

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

// Validate user credentials
function validateCredentials(config) {
  if (!config.userEmail || !config.userPassword) {
    console.error('\n❌ Error: User credentials are required for user page tests');
    console.error('\n💡 Provide credentials using one of these methods:');
    console.error('\n   1. Environment variables (recommended):');
    console.error('      $env:TEST_USER_EMAIL="user@example.com"');
    console.error('      $env:TEST_USER_PASSWORD="password123"');
    console.error('      node scripts/run-user-pages-tests.js');
    console.error('\n   2. Command-line arguments:');
    console.error('      node scripts/run-user-pages-tests.js --user-email=user@example.com --user-password=password123');
    console.error('\n   3. Create .env.local file (not recommended for security):');
    console.error('      TEST_USER_EMAIL=user@example.com');
    console.error('      TEST_USER_PASSWORD=password123');
    console.error('\n⚠️  Note: User credentials must be valid Clerk accounts.');
    console.error('   See testsprite_tests/USER_TEST_SETUP.md for details.\n');
    process.exit(1);
  }

  console.log(`✅ User credentials provided: ${config.userEmail}`);
  console.log(`   ⚠️  Note: Credentials will be used for Clerk authentication during tests\n`);
}

// Check server connectivity
async function checkServerConnectivity(baseUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: '/',
      method: 'HEAD',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Main execution function
async function main() {
  const config = parseArgs();

  if (config.help) {
    showHelp();
    return;
  }

  console.log('\n🚀 User Pages Test Execution');
  console.log('='.repeat(60));
  console.log(`Test Plan: ${config.testPlan}`);
  if (config.configFile) {
    console.log(`Config File: ${config.configFile} (reference only)`);
  }
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('='.repeat(60));
  console.log('');

  // Validate user credentials
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
  const isServerRunning = await checkServerConnectivity(config.baseUrl);
  if (isServerRunning) {
    console.log(`   ✅ Server is running at ${config.baseUrl}\n`);
  } else {
    console.error(`   ❌ Cannot connect to server at ${config.baseUrl}`);
    console.error(`   💡 Make sure your Next.js dev server is running:`);
    console.error(`      npm run dev`);
    console.error(`   💡 Verify the server is accessible in your browser`);
    console.error(`   💡 Check that the port matches your base URL\n`);
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
  process.env.TEST_USER_EMAIL = config.userEmail;
  process.env.TEST_USER_PASSWORD = config.userPassword;

  // Execute TestSprite MCP
  console.log('📝 Command: node "' + TESTSPRITE_MCP_PATH + '" generateCodeAndExecute');
  console.log(`📝 TestSprite MCP will use: ${DEFAULT_TEST_PLAN_PATH} (copied from ${config.testPlan})`);
  console.log(`📝 User credentials: ${config.userEmail} (password hidden)\n`);

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
    console.error('   3. Check that user credentials are correct');
    console.error('   4. Verify user account exists in Clerk');
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

