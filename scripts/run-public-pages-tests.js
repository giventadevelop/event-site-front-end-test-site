#!/usr/bin/env node

/**
 * Reusable TestScript for Running Public Pages Tests
 *
 * This script executes TestSprite MCP tests for public pages only.
 * It uses the comprehensive public pages test plan by default.
 *
 * Usage:
 *   node scripts/run-public-pages-tests.js [options]
 *
 * Options:
 *   --test-plan=<path>    Path to test plan file (default: testsprite_tests/public_pages_comprehensive_test_plan.json)
 *   --config=<path>       Path to test config file (optional, for reference only)
 *   --base-url=<url>      Base URL for testing (default: http://localhost:3000)
 *   --help                Show this help message
 *
 * Examples:
 *   # Run comprehensive public pages tests
 *   node scripts/run-public-pages-tests.js
 *
 *   # Run with custom test plan
 *   node scripts/run-public-pages-tests.js --test-plan=testsprite_tests/public_pages_sanity_test_plan.json
 *
 *   # Run with custom base URL
 *   node scripts/run-public-pages-tests.js --base-url=http://localhost:3001
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration
const DEFAULT_TEST_PLAN = 'testsprite_tests/public_pages_comprehensive_test_plan.json';
const DEFAULT_BASE_URL = 'http://localhost:3000';
const TESTSPRITE_MCP_PATH = 'E:\\.npm-cache\\_npx\\8ddf6bea01b2519d\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    testPlan: DEFAULT_TEST_PLAN,
    configFile: null,
    baseUrl: DEFAULT_BASE_URL,
    help: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--test-plan=')) {
      config.testPlan = arg.split('=')[1];
    } else if (arg.startsWith('--config=')) {
      config.configFile = arg.split('=')[1];
    } else if (arg.startsWith('--base-url=')) {
      config.baseUrl = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      config.help = true;
    }
  });

  return config;
}

// Display help message
function showHelp() {
  console.log(`
📋 Public Pages Test Script

Usage:
  node scripts/run-public-pages-tests.js [options]

Options:
  --test-plan=<path>    Path to test plan file
                        Default: ${DEFAULT_TEST_PLAN}

  --config=<path>       Path to test config file (optional, for reference only)
                        Note: TestSprite MCP uses the test plan file directly

  --base-url=<url>      Base URL for testing
                        Default: ${DEFAULT_BASE_URL}

  --help, -h            Show this help message

Examples:
  # Run comprehensive public pages tests (default)
  node scripts/run-public-pages-tests.js

  # Run sanity tests only
  node scripts/run-public-pages-tests.js --test-plan=testsprite_tests/public_pages_sanity_test_plan.json

  # Run with custom base URL
  node scripts/run-public-pages-tests.js --base-url=http://localhost:3001

  # Run with config file reference (for documentation)
  node scripts/run-public-pages-tests.js --config=testsprite_tests/public_pages_test_config.json

Test Plan Files:
  - testsprite_tests/public_pages_comprehensive_test_plan.json  (Comprehensive - 25 tests)
  - testsprite_tests/public_pages_sanity_test_plan.json         (Sanity - 8 tests)

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

// Main execution function
async function main() {
  const config = parseArgs();

  if (config.help) {
    showHelp();
    return;
  }

  console.log('\n🚀 Public Pages Test Execution');
  console.log('='.repeat(60));
  console.log(`Test Plan: ${config.testPlan}`);
  if (config.configFile) {
    console.log(`Config File: ${config.configFile} (reference only)`);
  }
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('='.repeat(60));
  console.log('');

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
  console.log('   ℹ️  Note: This script does NOT start or stop the dev server.');
  console.log('   ℹ️  Make sure you have started it manually with: npm run dev');
  console.log('   ℹ️  This check may take up to 15 seconds (allowing for cold start)...\n');

  let serverResponding = false;
  let lastError = null;

  // Try up to 3 times with increasing timeouts (for cold start scenarios)
  const retries = [
    { timeout: 10000, label: '10 seconds' },
    { timeout: 15000, label: '15 seconds' },
    { timeout: 20000, label: '20 seconds' }
  ];

  for (let i = 0; i < retries.length; i++) {
    const retry = retries[i];
    try {
      const url = new URL(config.baseUrl);
      const http = await import('http');

      console.log(`   Attempting connection (timeout: ${retry.label})...`);

      const serverCheck = new Promise((resolve, reject) => {
        const req = http.default.get({
          hostname: url.hostname,
          port: url.port || 3000,
          path: '/',
          timeout: retry.timeout
        }, (res) => {
          res.on('data', () => {}); // Consume response
          res.on('end', () => resolve(res.statusCode));
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Server connection timeout after ${retry.timeout}ms`));
        });
      });

      const statusCode = await serverCheck;
      console.log(`   ✅ Server is responding (HTTP ${statusCode})`);
      console.log(`   ✅ Ready to run tests\n`);
      serverResponding = true;
      break;
    } catch (error) {
      lastError = error;
      if (i < retries.length - 1) {
        console.log(`   ⚠️  Connection failed: ${error.message}`);
        console.log(`   Retrying with longer timeout...\n`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  if (!serverResponding) {
    console.error(`   ❌ Server not responding after ${retries.length} attempts`);
    console.error(`   Last error: ${lastError?.message || 'Unknown error'}`);
    console.error(`\n💡 IMPORTANT: This script does NOT start/stop the server.`);
    console.error(`   You must start it manually in a separate terminal:\n`);
    console.error(`   npm run dev\n`);
    console.error(`💡 Troubleshooting Steps:`);
    console.error(`   1. Verify server is running:`);
    console.error(`      - Check the terminal where you ran "npm run dev"`);
    console.error(`      - Look for "Ready in Xs" message`);
    console.error(`   2. Test server manually:`);
    console.error(`      - Open ${config.baseUrl} in your browser`);
    console.error(`      - If it works in browser, server is running`);
    console.error(`   3. Check for port conflicts:`);
    console.error(`      netstat -ano | findstr :3000`);
    console.error(`   4. Check server logs for errors or crashes`);
    console.error(`   5. Try increasing timeout if server is slow to start`);
    console.error(`   6. If server works in browser but not here, it might be a network/firewall issue\n`);
    process.exit(1);
  }

  // Execute TestSprite MCP
  console.log('⚡ Executing TestSprite MCP tests...');
  console.log('   This may take 5-15 minutes depending on the number of tests');
  console.log('   Please wait...\n');

  // CRITICAL: TestSprite MCP defaults to testsprite_tests/testsprite_frontend_test_plan.json
  // We need to copy the specified test plan to that location
  const DEFAULT_TEST_PLAN_PATH = 'testsprite_tests/testsprite_frontend_test_plan.json';
  const BACKUP_TEST_PLAN_PATH = 'testsprite_tests/testsprite_frontend_test_plan.json.backup';

  // Backup existing default test plan if it exists
  let backupExists = false;
  if (fs.existsSync(DEFAULT_TEST_PLAN_PATH)) {
    console.log(`📋 Backing up existing default test plan...`);
    fs.copyFileSync(DEFAULT_TEST_PLAN_PATH, BACKUP_TEST_PLAN_PATH);
    backupExists = true;
    console.log(`   ✅ Backup created: ${BACKUP_TEST_PLAN_PATH}\n`);
  }

  // Copy specified test plan to default location
  console.log(`📋 Copying test plan to default location...`);
  console.log(`   From: ${config.testPlan}`);
  console.log(`   To:   ${DEFAULT_TEST_PLAN_PATH}\n`);
  fs.copyFileSync(config.testPlan, DEFAULT_TEST_PLAN_PATH);

  try {
    const command = `node "${TESTSPRITE_MCP_PATH}" generateCodeAndExecute`;

    console.log(`📝 Command: ${command}`);
    console.log(`📝 TestSprite MCP will use: ${DEFAULT_TEST_PLAN_PATH} (copied from ${config.testPlan})\n`);

    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        // You can set environment variables here if needed
        // NEXT_PUBLIC_APP_URL: config.baseUrl,
      }
    });

    console.log('\n✅ Test execution completed!');

    // Restore backup if it existed
    if (backupExists && fs.existsSync(BACKUP_TEST_PLAN_PATH)) {
      console.log('\n📋 Restoring original default test plan...');
      fs.copyFileSync(BACKUP_TEST_PLAN_PATH, DEFAULT_TEST_PLAN_PATH);
      fs.unlinkSync(BACKUP_TEST_PLAN_PATH);
      console.log(`   ✅ Restored: ${DEFAULT_TEST_PLAN_PATH}`);
    } else {
      // If no backup existed, remove the copied test plan (cleanup)
      // Actually, let's keep it so user knows what was used
      console.log(`\n📋 Note: Default test plan remains at ${DEFAULT_TEST_PLAN_PATH}`);
      console.log(`   (Copied from ${config.testPlan})`);
    }

    console.log('\n📊 Next Steps:');
    console.log('   1. Filter expected errors: node scripts/filter-testsprite-errors.js');
    console.log('   2. View HTML report: start testsprite_tests\\tmp\\test_report.html');
    console.log('   3. Review test results: testsprite_tests\\tmp\\test_results.json');

  } catch (error) {
    console.error('\n❌ Test execution failed!');
    console.error(`   Error: ${error.message}`);

    // Restore backup on error
    if (backupExists && fs.existsSync(BACKUP_TEST_PLAN_PATH)) {
      console.log('\n📋 Restoring original default test plan due to error...');
      fs.copyFileSync(BACKUP_TEST_PLAN_PATH, DEFAULT_TEST_PLAN_PATH);
      fs.unlinkSync(BACKUP_TEST_PLAN_PATH);
      console.log(`   ✅ Restored: ${DEFAULT_TEST_PLAN_PATH}`);
    }

    console.error('\n💡 Troubleshooting ERR_EMPTY_RESPONSE:');
    console.error('   This error means TestSprite cannot connect to your server.');
    console.error('   The server might be crashing under load during tests.\n');
    console.error('   Steps to diagnose:');
    console.error('   1. Check server logs in the terminal where you ran "npm run dev"');
    console.error('      Look for crashes, errors, or memory issues');
    console.error('   2. Verify server is still running:');
    console.error('      - Check if the "npm run dev" process is still active');
    console.error('      - Test manually: Open ' + config.baseUrl + ' in browser');
    console.error('   3. Check for memory issues:');
    console.error('      Get-Process node | Select-Object Id, ProcessName, @{N="Memory(MB)";E={[math]::Round($_.WS/1MB,2)}}');
    console.error('   4. Try running sanity tests first (fewer tests = less load):');
    console.error('      node scripts/run-public-pages-tests.js --test-plan=testsprite_tests/public_pages_sanity_test_plan.json');
    console.error('   5. Check TestSprite lock file: ' + LOCK_FILE_PATH);
    console.error('\n💡 Common Causes:');
    console.error('   - Server crashes during test execution (check Next.js logs)');
    console.error('   - Too many concurrent requests from TestSprite');
    console.error('   - Memory leaks in Next.js dev server');
    console.error('   - Server needs more time between requests');
    console.error('\n💡 Note: This script does NOT manage the server.');
    console.error('   You must start/stop it manually with: npm run dev');
    process.exit(1);
  }
}

// Run if executed directly
// Check if this file is being run directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || !process.argv[1] || process.argv[1].includes('run-public-pages-tests.js')) {
  main();
}

export { main, parseArgs, validateTestPlan };

