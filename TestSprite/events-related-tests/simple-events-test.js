#!/usr/bin/env node

/**
 * Simple TestSprite Events Test
 * Quick test script for admin events functionality
 * No external dependencies - uses Node.js built-in fetch
 */

const baseUrl = 'http://localhost:3000';

async function testPageAccessibility(url, testName) {
  console.log(`🧪 Testing: ${testName}`);
  console.log(`📍 URL: ${url}`);

  try {
    const response = await fetch(url);
    const isAccessible = response.ok;
    const contentType = response.headers.get('content-type');
    const isHtml = contentType?.includes('text/html');

    if (isAccessible && isHtml) {
      console.log(`✅ PASSED: ${testName} - Page accessible (${response.status})`);
      return { passed: true, status: response.status };
    } else if (isAccessible) {
      console.log(`⚠️ WARNING: ${testName} - Page accessible but not HTML (${response.status})`);
      return { passed: true, status: response.status, warning: 'Not HTML content' };
    } else {
      console.log(`❌ FAILED: ${testName} - Page not accessible (${response.status})`);
      return { passed: false, status: response.status, error: response.statusText };
    }
  } catch (error) {
    console.log(`❌ FAILED: ${testName} - Network error: ${error.message}`);
    return { passed: false, status: 0, error: error.message };
  }
}

async function runEventsTests() {
  console.log('🚀 TestSprite Simple Events Test');
  console.log('=================================');
  console.log(`📍 Testing: ${baseUrl}`);
  console.log('');

  const tests = [
    {
      url: `${baseUrl}/admin/events`,
      name: 'Admin Events Analytics Dashboard'
    },
    {
      url: `${baseUrl}/admin/events/1`,
      name: 'Event Overview Page'
    },
    {
      url: `${baseUrl}/admin/events/1/edit`,
      name: 'Event Edit Page'
    },
    {
      url: `${baseUrl}/admin/events/1/ticket-types/list`,
      name: 'Ticket Types Management'
    },
    {
      url: `${baseUrl}/admin/events/1/performers`,
      name: 'Performers Management'
    },
    {
      url: `${baseUrl}/admin/events/1/sponsors`,
      name: 'Sponsors Management'
    },
    {
      url: `${baseUrl}/admin/events/1/contacts`,
      name: 'Contacts Management (AE007)'
    },
    {
      url: `${baseUrl}/admin/events/1/media`,
      name: 'Media Management'
    },
    {
      url: `${baseUrl}/admin/events/registrations`,
      name: 'Registration Management'
    },
    {
      url: `${baseUrl}/admin/events/dashboard`,
      name: 'Event Dashboard Analytics'
    },
    {
      url: `${baseUrl}/admin/events/new`,
      name: 'New Event Creation'
    },
    {
      url: `${baseUrl}/admin/events/settings`,
      name: 'Event Settings'
    },
    {
      url: `${baseUrl}/admin/events/reports`,
      name: 'Event Reports'
    }
  ];

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const test of tests) {
    const result = await testPageAccessibility(test.url, test.name);
    results.push({ ...test, ...result });

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedCount}/${tests.length}`);
  console.log(`❌ Failed: ${failedCount}/${tests.length}`);
  console.log(`📈 Success Rate: ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log('');

  if (failedCount > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(test => {
      console.log(`   • ${test.name} (${test.status}) - ${test.error || 'Unknown error'}`);
    });
    console.log('');
  }

  // Test specific API endpoint for contacts (the problematic one)
  console.log('🔍 Testing Contacts API Endpoint:');
  try {
    const apiResponse = await fetch(`${baseUrl}/api/proxy/event-contacts?eventId.equals=1`);
    console.log(`📡 API Status: ${apiResponse.status} ${apiResponse.statusText}`);

    if (apiResponse.status === 401) {
      console.log('ℹ️ 401 Unauthorized - Expected for unauthenticated request');
    } else if (apiResponse.ok) {
      console.log('✅ API endpoint accessible');
    } else {
      const errorText = await apiResponse.text();
      console.log(`❌ API Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ API Network Error: ${error.message}`);
  }

  console.log('');
  console.log('🎯 Test Execution Complete!');

  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: tests.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${((passedCount / tests.length) * 100).toFixed(1)}%`
    },
    results: results
  };

  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, 'simple-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 Results saved to: ${reportPath}`);
}

// Run the tests
if (require.main === module) {
  runEventsTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runEventsTests, testPageAccessibility };
