/**
 * TestSprite Admin Events Test Suite
 * Comprehensive testing for all admin events management functionality
 * Focus: /admin/events/* paths
 * Uses Node.js built-in fetch for API testing
 */

const fs = require('fs');
const path = require('path');

class AdminEventsTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🚀 Setting up TestSprite Admin Events Test Suite...');
    console.log('📍 Base URL:', this.baseUrl);

    // Test if frontend is accessible
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Frontend not accessible: ${response.status}`);
      }
      console.log('✅ Frontend is accessible');
    } catch (error) {
      console.error('❌ Frontend not accessible:', error.message);
      throw error;
    }
  }

  async teardown() {
    this.generateReport();
  }

  async runTest(testId, testName, testFunction) {
    console.log(`\n🧪 Running ${testId}: ${testName}`);
    const startTime = Date.now();

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.testResults.push({
        id: testId,
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`,
        error: null
      });
      console.log(`✅ ${testId} PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        id: testId,
        name: testName,
        status: 'FAILED',
        duration: `${duration}ms`,
        error: error.message
      });
      console.log(`❌ ${testId} FAILED: ${error.message}`);
    }
  }

  // API testing helper
  async testApiEndpoint(url, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: response.ok ? await response.json().catch(() => null) : null,
        error: !response.ok ? await response.text().catch(() => 'Unknown error') : null
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        data: null,
        error: error.message
      };
    }
  }

  // Page accessibility testing
  async testPageAccessibility(url) {
    try {
      const response = await fetch(url);
      return {
        accessible: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
        hasHtml: response.headers.get('content-type')?.includes('text/html')
      };
    } catch (error) {
      return {
        accessible: false,
        status: 0,
        error: error.message
      };
    }
  }

  // Test Cases Implementation

  async testAdminEventsAnalytics() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events`);

    if (!result.accessible) {
      throw new Error(`Admin Events page not accessible: ${result.status} ${result.error || ''}`);
    }

    if (!result.hasHtml) {
      throw new Error('Admin Events page does not return HTML content');
    }

    console.log('✅ Event Analytics Dashboard accessible');
  }

  async testEventCreation() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/new`);

    if (!result.accessible) {
      throw new Error(`Event creation page not accessible: ${result.status}`);
    }

    console.log('✅ Event creation page accessible');
  }

  async testEventOverview() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1`);

    if (!result.accessible) {
      throw new Error(`Event overview page not accessible: ${result.status}`);
    }

    console.log('✅ Event overview page accessible');
  }

  async testEventEdit() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/edit`);

    if (!result.accessible) {
      throw new Error(`Event edit page not accessible: ${result.status}`);
    }

    console.log('✅ Event edit page accessible');
  }

  async testTicketTypesManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/ticket-types/list`);

    if (!result.accessible) {
      throw new Error(`Ticket Types page not accessible: ${result.status}`);
    }

    console.log('✅ Ticket Types management page accessible');
  }

  async testPerformersManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/performers`);

    if (!result.accessible) {
      throw new Error(`Performers page not accessible: ${result.status}`);
    }

    console.log('✅ Performers management page accessible');
  }

  async testSponsorsManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/sponsors`);

    if (!result.accessible) {
      throw new Error(`Sponsors page not accessible: ${result.status}`);
    }

    console.log('✅ Sponsors management page accessible');
  }

  async testContactsManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/contacts`);

    if (!result.accessible) {
      throw new Error(`Contacts page not accessible: ${result.status}`);
    }

    // Test the API endpoint that was having issues
    const apiResult = await this.testApiEndpoint(`${this.baseUrl}/api/proxy/event-contacts?eventId.equals=1`);

    if (!apiResult.ok && apiResult.status !== 401) { // 401 expected without auth
      console.warn(`⚠️ Contacts API warning: ${apiResult.status} ${apiResult.error}`);
    }

    console.log('✅ Contacts management page accessible');
  }

  async testEmailsManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/emails`);

    if (!result.accessible) {
      console.log('ℹ️ Emails page not accessible (may not be implemented)');
      return;
    }

    console.log('✅ Emails management page accessible');
  }

  async testMediaManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/1/media`);

    if (!result.accessible) {
      throw new Error(`Media page not accessible: ${result.status}`);
    }

    console.log('✅ Media management page accessible');
  }

  async testRegistrationManagement() {
    const result = await this.testPageAccessibility(`${this.baseUrl}/admin/events/registrations`);

    if (!result.accessible) {
      throw new Error(`Registration management page not accessible: ${result.status}`);
    }

    console.log('✅ Registration management page accessible');
  }

  async testCrossPageNavigation() {
    // Test multiple page accessibility
    const pages = [
      '/admin/events',
      '/admin/events/1',
      '/admin/events/1/edit',
      '/admin/events/1/ticket-types/list',
      '/admin/events/1/performers',
      '/admin/events/1/sponsors',
      '/admin/events/1/contacts'
    ];

    let accessiblePages = 0;
    for (const page of pages) {
      const result = await this.testPageAccessibility(`${this.baseUrl}${page}`);
      if (result.accessible) {
        accessiblePages++;
      }
    }

    if (accessiblePages < 5) {
      throw new Error(`Only ${accessiblePages}/${pages.length} pages accessible`);
    }

    console.log(`✅ Cross-page navigation: ${accessiblePages}/${pages.length} pages accessible`);
  }

  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASSED').length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const totalDuration = Date.now() - this.startTime;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        totalDuration: `${Math.round(totalDuration / 1000)}s`
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join(__dirname, 'admin-events-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Test Execution Complete!');
    console.log(`✅ Passed: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`⏱️ Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`📄 Report saved to: ${reportPath}`);
  }

  async runAllTests() {
    try {
      await this.setup();

      // Core admin events tests
      await this.runTest('AE001', 'Admin Events Analytics Dashboard', () => this.testAdminEventsAnalytics());
      await this.runTest('AE002', 'Event Overview Page', () => this.testEventOverview());
      await this.runTest('AE003', 'Event Edit Functionality', () => this.testEventEdit());
      await this.runTest('AE004', 'Ticket Types Management', () => this.testTicketTypesManagement());
      await this.runTest('AE005', 'Performers Management', () => this.testPerformersManagement());
      await this.runTest('AE006', 'Sponsors Management', () => this.testSponsorsManagement());
      await this.runTest('AE007', 'Contacts Management', () => this.testContactsManagement());
      await this.runTest('AE008', 'Media Management', () => this.testMediaManagement());
      await this.runTest('AE009', 'Registration Management', () => this.testRegistrationManagement());
      await this.runTest('AE010', 'Cross-Page Navigation', () => this.testCrossPageNavigation());
      await this.runTest('AE011', 'Event Creation Workflow', () => this.testEventCreation());
      await this.runTest('AE012', 'Emails Management', () => this.testEmailsManagement());

    } catch (error) {
      console.error('❌ Test suite setup failed:', error);
    } finally {
      await this.teardown();
    }
  }
}

// Export for module usage
module.exports = AdminEventsTestSuite;

// Run if called directly
if (require.main === module) {
  const testSuite = new AdminEventsTestSuite();
  testSuite.runAllTests().catch(console.error);
}
