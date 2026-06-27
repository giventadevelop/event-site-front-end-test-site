#!/usr/bin/env node

/**
 * TestSprite Events Test Runner
 * Focused testing for admin events management functionality
 * Usage: node run-events-tests.js [--category=<category>] [--test=<testId>]
 */

const AdminEventsTestSuite = require('./admin-events-test-suite');
const fs = require('fs');
const path = require('path');

class EventsTestRunner {
  constructor() {
    this.config = this.loadConfig();
    this.args = this.parseArgs();
  }

  loadConfig() {
    const configPath = path.join(__dirname, 'test-config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {};

    args.forEach(arg => {
      if (arg.startsWith('--category=')) {
        parsed.category = arg.split('=')[1];
      } else if (arg.startsWith('--test=')) {
        parsed.testId = arg.split('=')[1];
      } else if (arg === '--help' || arg === '-h') {
        parsed.help = true;
      }
    });

    return parsed;
  }

  showHelp() {
    console.log(`
🧪 TestSprite Events Test Runner

Usage:
  node run-events-tests.js [options]

Options:
  --category=<name>    Run tests from specific category
                      (core-functionality, crud-operations, media-management, etc.)

  --test=<id>         Run specific test by ID (AE001, AE002, etc.)

  --help, -h          Show this help message

Categories:
  - core-functionality: Basic page loads and navigation
  - crud-operations: Create, Read, Update, Delete operations
  - media-management: File upload and media handling
  - registration-management: Registration and attendee management
  - analytics-reporting: Dashboard analytics and reports

Examples:
  node run-events-tests.js                           # Run all tests
  node run-events-tests.js --category=crud-operations # Run only CRUD tests
  node run-events-tests.js --test=AE001              # Run specific test
    `);
  }

  getTestsToRun() {
    if (this.args.help) {
      this.showHelp();
      process.exit(0);
    }

    let testsToRun = [];

    if (this.args.testId) {
      // Run specific test
      for (const category of this.config.testCategories) {
        const test = category.tests.find(t => t.id === this.args.testId);
        if (test) {
          testsToRun.push({ category: category.category, test });
          break;
        }
      }
    } else if (this.args.category) {
      // Run tests from specific category
      const category = this.config.testCategories.find(c => c.category === this.args.category);
      if (category) {
        testsToRun = category.tests.map(test => ({ category: category.category, test }));
      }
    } else {
      // Run all tests
      for (const category of this.config.testCategories) {
        testsToRun.push(...category.tests.map(test => ({ category: category.category, test })));
      }
    }

    return testsToRun;
  }

  async runTests() {
    const testsToRun = this.getTestsToRun();

    if (testsToRun.length === 0) {
      console.log('❌ No tests found to run');
      return;
    }

    console.log(`🎯 Running ${testsToRun.length} admin events tests...`);
    console.log(`📍 Base URL: ${this.config.baseUrl}`);
    console.log(`🔐 Authentication: ${this.config.authentication.type}`);

    const testSuite = new AdminEventsTestSuite();

    try {
      await testSuite.runAllTests();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating test environment...');

    // Check if backend is running
    try {
      const response = await fetch(`${this.config.baseUrl}/api/health`);
      if (!response.ok) {
        console.warn('⚠️ Backend health check failed');
      }
    } catch (error) {
      console.warn('⚠️ Could not reach backend API');
    }

    // Check if frontend is running
    try {
      const response = await fetch(this.config.baseUrl);
      if (!response.ok) {
        throw new Error('Frontend not accessible');
      }
      console.log('✅ Frontend is running');
    } catch (error) {
      console.error('❌ Frontend not accessible:', error.message);
      process.exit(1);
    }

    console.log('✅ Environment validation complete');
  }
}

// Main execution
async function main() {
  const runner = new EventsTestRunner();

  console.log('🚀 TestSprite Admin Events Test Runner');
  console.log('=====================================');

  await runner.validateEnvironment();
  await runner.runTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}
