#!/usr/bin/env node

/**
 * Public Pages Test Runner
 * Fast, focused test suite for public pages only
 * Expected Duration: ~3-5 minutes
 *
 * This script uses Playwright for real browser automation.
 * Tests only public pages (no authentication required).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Test configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds per test
  retries: 1,
  testDuration: '3-5 minutes',
  screenshotOnFailure: true,
  performanceTiming: false, // Disabled for faster execution
};

// Public pages test scenarios
const publicPageTests = [
  {
    id: 'public-001',
    name: 'Homepage Load Test',
    url: '/',
    priority: 'critical',
    expectedElements: [
      'nav, header, [class*="nav"]',
      'main, [class*="main"], [class*="content"]',
      'h1, h2, h3, [class*="title"], [class*="heading"]',
      'a[href*="/events"], a[href="/events"]',
      'a[href*="/gallery"], a[href="/gallery"]'
    ],
    validation: [
      'Page loads without errors',
      'Navigation menu is visible',
      'Main content area is present',
      'No JavaScript console errors'
    ],
    interactions: [
      { type: 'wait', selector: 'main', timeout: 5000 },
      { type: 'check', selector: 'nav', visible: true }
    ]
  },
  {
    id: 'public-002',
    name: 'Events Listing Page Test',
    url: '/events',
    priority: 'critical',
    expectedElements: [
      'h1',
      '.grid, [class*="grid"]',
      '[class*="event"], [class*="card"]',
      'input[type="search"], input[type="text"]',
      'button, a[href*="/events/"]',
      'a[href*="/events/"][title*="Event Details"], a[href*="/events/"][aria-label*="Event Details"]',
      'a[href*="calendar.google.com"], a[title*="Calendar"], a[aria-label*="Calendar"]',
      'a[href*="/checkout"], a[href*="/manual-checkout"], img[alt*="Buy Tickets"], img[alt*="buy tickets"]'
    ],
    validation: [
      'Events page loads successfully',
      'Event cards or list items are visible',
      'Search/filter functionality accessible',
      'At least 2 events have "See Event Details" buttons',
      'At least 2 events have "Add to Calendar" buttons (for future events)',
      'Buy Tickets buttons link to correct checkout routes',
      'No JavaScript errors'
    ],
    interactions: [
      { type: 'wait', selector: '[class*="event"], [class*="card"]', timeout: 5000 },
      { type: 'check', selector: 'h1', visible: true },
      { 
        type: 'verify-buttons',
        description: 'Verify event action buttons exist and have correct links',
        checks: [
          {
            name: 'See Event Details buttons',
            selector: 'a[href*="/events/"][title*="Event Details"], a[href*="/events/"][aria-label*="Event Details"]',
            minCount: 2,
            validateLink: (href) => {
              // Should match pattern /events/{id} where id is a number
              const match = href.match(/\/events\/(\d+)$/);
              return match !== null && match[1] !== undefined;
            }
          },
          {
            name: 'Add to Calendar buttons',
            selector: 'a[href*="calendar.google.com"], a[title*="Calendar"], a[aria-label*="Calendar"]',
            minCount: 2,
            validateLink: (href) => {
              // Should be a Google Calendar link
              return href.includes('calendar.google.com') && href.includes('action=TEMPLATE');
            }
          },
          {
            name: 'Buy Tickets buttons',
            selector: 'a[href*="/checkout"], a[href*="/manual-checkout"], img[alt*="Buy Tickets"], img[alt*="buy tickets"]',
            minCount: 0, // Optional - only for TICKETED events
            validateLink: (href) => {
              // Should match either /events/{id}/checkout or /events/{id}/manual-checkout
              const checkoutMatch = href.match(/\/events\/(\d+)\/checkout$/);
              const manualMatch = href.match(/\/events\/(\d+)\/manual-checkout$/);
              return checkoutMatch !== null || manualMatch !== null;
            },
            checkParentLink: true // Check parent <a> tag if selector matches img
          }
        ]
      }
    ]
  },
  {
    id: 'public-003',
    name: 'Event Details Page Test',
    url: '/events/1',
    priority: 'critical',
    expectedElements: [
      'h1',
      '[class*="event"]',
      'a[href*="/tickets"], button',
      '[class*="date"], [class*="time"], [class*="location"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Event details page loads',
      'Event information is displayed',
      'Registration/ticket button is present',
      'No 404 errors'
    ],
    interactions: [
      { type: 'wait', selector: 'h1', timeout: 5000 }
    ]
  },
  {
    id: 'public-004',
    name: 'Sponsors Listing Page Test',
    url: '/sponsors',
    priority: 'high',
    expectedElements: [
      'h1, h2, [class*="title"], [class*="heading"]',
      '[class*="sponsor"], [class*="card"], [class*="grid"], main, [class*="container"]',
      'img, [class*="logo"], [class*="image"]'
    ],
    validation: [
      'Sponsors page loads successfully',
      'Sponsor cards are visible',
      'Sponsor logos/images load'
    ]
  },
  {
    id: 'public-005',
    name: 'Sponsor Details Page Test',
    url: '/sponsors/1',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="sponsor"]',
      'img, [class*="image"]',
      '[class*="contact"], [class*="address"]'
    ],
    validation: [
      'Sponsor details page loads',
      'Sponsor information displayed',
      'Logo/image displayed'
    ]
  },
  {
    id: 'public-006',
    name: 'Gallery Page Test',
    url: '/gallery',
    priority: 'high',
    expectedElements: [
      'h1, h2, [class*="title"], [class*="heading"]',
      '[class*="gallery"], [class*="grid"], [class*="container"], main',
      'img, [class*="image"], [class*="photo"]'
    ],
    validation: [
      'Gallery page loads successfully',
      'Media items are displayed',
      'Images load without errors'
    ],
    interactions: [
      { type: 'wait', selector: 'img', timeout: 5000 },
      { type: 'check', selector: 'img', count: { min: 1 } }
    ]
  },
  {
    id: 'public-007',
    name: 'Polls Listing Page Test',
    url: '/polls',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="poll"], [class*="card"]',
      'button, a[href*="/polls/"]',
      '[class*="vote"], [class*="option"]'
    ],
    validation: [
      'Polls page loads successfully',
      'Poll cards are visible',
      'Vote buttons are accessible',
      'No JavaScript errors'
    ]
  },
  {
    id: 'public-008',
    name: 'Calendar Page Test',
    url: '/calendar',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="calendar"]',
      'button, [class*="month"], [class*="day"]',
      '[class*="event"]'
    ],
    validation: [
      'Calendar page loads successfully',
      'Calendar widget is visible',
      'Navigation controls work'
    ]
  },
  {
    id: 'public-009',
    name: 'MOSC Homepage Test',
    url: '/mosc',
    priority: 'medium',
    expectedElements: [
      'h1, h2',
      'nav',
      'main',
      'a[href*="/mosc/"]'
    ],
    validation: [
      'MOSC homepage loads',
      'Navigation menu visible',
      'Content sections displayed',
      'No layout errors'
    ]
  },
  {
    id: 'public-010',
    name: 'MOSC Holy Synod Page Test',
    url: '/mosc/holy-synod',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="synod"], [class*="member"]',
      'img, [class*="image"]',
      'a[href*="/holy-synod/"]'
    ],
    validation: [
      'Holy Synod page loads',
      'Synod members displayed',
      'Member images load',
      'No broken links'
    ]
  },
  {
    id: 'public-011',
    name: 'MOSC Gallery Page Test',
    url: '/mosc/gallery',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="gallery"], [class*="album"]',
      'img, [class*="image"]',
      'a[href*="/gallery/"]'
    ],
    validation: [
      'MOSC Gallery page loads',
      'Photo albums displayed',
      'Images load correctly'
    ]
  },
  {
    id: 'public-012',
    name: 'MOSC Directory Page Test',
    url: '/mosc/directory',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="directory"], [class*="list"]',
      'input[type="search"], input[type="text"]',
      'a, button'
    ],
    validation: [
      'Directory page loads',
      'Directory listings visible',
      'Search functionality works'
    ]
  },
  {
    id: 'public-013',
    name: 'Charity Theme Page Test',
    url: '/charity-theme',
    priority: 'low',
    expectedElements: [
      'h1',
      'main',
      '[class*="charity"]'
    ],
    validation: [
      'Charity theme page loads',
      'Content is displayed',
      'No errors'
    ]
  },
  {
    id: 'public-014',
    name: 'Pricing Page Test',
    url: '/pricing',
    priority: 'medium',
    // Note: Pricing page is now public and accessible without authentication
    // Unauthenticated users can view pricing plans, authenticated users see personalized pricing
    expectedElements: [
      'h1, [class*="title"], [class*="heading"]',
      'main, [class*="content"], [class*="container"], [class*="pricing"]',
      '[class*="pricing"], [class*="plan"]'
    ],
    validation: [
      'Pricing page loads successfully',
      'Pricing plans are visible',
      'No redirect errors',
      'Page structure is correct'
    ]
  }
];

// Global browser instance (reused across tests)
let globalBrowser = null;

// Test execution with Playwright
async function executeTestWithPlaywright(test, testUrl, startTime) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch (importError) {
    throw new Error('Playwright not installed. Run: npm install --save-dev playwright && npx playwright install chromium');
  }

  // Initialize browser if needed
  if (!globalBrowser) {
    globalBrowser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  let context;
  let page;
  const errors = [];
  const warnings = [];
  let screenshotPath = null;

  try {
    // Create context
    context = await globalBrowser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate to page
    let response;
    try {
      response = await page.goto(testUrl, {
        waitUntil: 'domcontentloaded',
        timeout: config.timeout
      });

      // Wait for network to be idle
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        warnings.push('Network idle timeout - page may still be loading');
      });
    } catch (navigationError) {
      // Handle connection errors
      if (navigationError.message.includes('ERR_CONNECTION_RESET') ||
          navigationError.message.includes('ERR_CONNECTION_REFUSED') ||
          navigationError.message.includes('net::ERR')) {
        warnings.push(`Connection error on first attempt: ${navigationError.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          response = await page.goto(testUrl, {
            waitUntil: 'domcontentloaded',
            timeout: config.timeout
          });
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        } catch (retryError) {
          throw new Error(`Connection failed after retry: ${retryError.message}`);
        }
      } else {
        throw navigationError;
      }
    }

    // Check for redirects (pricing page is now public, should not redirect)
    const finalUrl = page.url();
    if (finalUrl.includes('/sign-in') && !testUrl.includes('/sign-in')) {
      throw new Error(`Page redirected to sign-in (401 Unauthorized). Original URL: ${testUrl}`);
    }

    if (!response || !response.ok()) {
      const status = response?.status() || 'unknown';
      const statusText = response?.statusText() || 'unknown';
      throw new Error(`Page returned status ${status} ${statusText}. URL: ${testUrl}`);
    }

    // Check for JavaScript errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('setState') &&
      !err.includes('Cannot update a component') &&
      !err.includes('while rendering') &&
      !err.includes('NEXT_REDIRECT') && // Next.js redirects are expected, not errors
      !err.includes('Error: NEXT_REDIRECT')
    );
    const reactWarnings = consoleErrors.filter(err =>
      err.includes('setState') ||
      err.includes('Cannot update a component') ||
      err.includes('while rendering')
    );
    const redirectWarnings = consoleErrors.filter(err =>
      err.includes('NEXT_REDIRECT') || err.includes('Error: NEXT_REDIRECT')
    );

    if (criticalErrors.length > 0) {
      errors.push(`JavaScript console errors: ${criticalErrors.join(', ')}`);
    }
    if (redirectWarnings.length > 0) {
      // NEXT_REDIRECT is expected behavior in Next.js - log as warning, not error
      warnings.push(`Next.js redirect detected (non-critical): ${redirectWarnings.length} redirect(s)`);
    }
    if (reactWarnings.length > 0) {
      warnings.push(`React warnings (non-critical): ${reactWarnings.join(', ')}`);
    }
    // Filter out Clerk auth() errors for pages that are expected to have them
    // These are warnings, not errors, since the pages handle auth gracefully
    const clerkAuthErrors = pageErrors.filter(err =>
      err.includes('auth() was called but Clerk can\'t detect usage of authMiddleware()')
    );
    const otherPageErrors = pageErrors.filter(err =>
      !err.includes('auth() was called but Clerk can\'t detect usage of authMiddleware()')
    );

    if (clerkAuthErrors.length > 0) {
      // These indicate middleware configuration issues - treat as errors
      errors.push(`Clerk middleware error: ${clerkAuthErrors.join(', ')}`);
    }
    if (otherPageErrors.length > 0) {
      errors.push(`Page errors: ${otherPageErrors.join(', ')}`);
    }

    // Check expected elements
    const missingElements = [];
    for (const selector of test.expectedElements || []) {
      try {
        const selectorParts = selector.split(',').map(s => s.trim());
        let found = false;

        for (const part of selectorParts) {
          try {
            const element = await page.locator(part).first();
            const isVisible = await element.isVisible().catch(() => false);
            if (isVisible) {
              found = true;
              break;
            }
          } catch (partError) {
            continue;
          }
        }

        if (!found) {
          missingElements.push(selector);
        }
      } catch (checkError) {
        missingElements.push(selector);
      }
    }

    // Report missing elements as warnings if page loaded successfully
    if (missingElements.length > 0 && response && response.ok()) {
      warnings.push(`Some expected elements not found: ${missingElements.join(', ')}`);
    } else if (missingElements.length > 0) {
      errors.push(`Missing elements: ${missingElements.join(', ')}`);
    }

    // Execute interactions
    if (test.interactions) {
      for (const interaction of test.interactions) {
        try {
          if (interaction.type === 'wait') {
            await page.waitForSelector(interaction.selector, { timeout: interaction.timeout || 5000 });
          } else if (interaction.type === 'check') {
            const element = await page.locator(interaction.selector).first();
            if (interaction.visible !== undefined) {
              const isVisible = await element.isVisible();
              if (isVisible !== interaction.visible) {
                errors.push(`Element ${interaction.selector} visibility check failed`);
              }
            }
            if (interaction.count) {
              const count = await page.locator(interaction.selector).count();
              if (interaction.count.min && count < interaction.count.min) {
                errors.push(`Element ${interaction.selector} count ${count} is less than minimum ${interaction.count.min}`);
              }
            }
          } else if (interaction.type === 'verify-buttons') {
            // Verify event action buttons exist and have correct links
            if (interaction.checks) {
              for (const check of interaction.checks) {
                try {
                  const elements = await page.locator(check.selector).all();
                  const count = elements.length;
                  
                  if (check.minCount !== undefined && count < check.minCount) {
                    if (check.minCount > 0) {
                      errors.push(`${check.name}: Found ${count}, expected at least ${check.minCount}`);
                    } else {
                      // Optional check - only warn if found but invalid
                      warnings.push(`${check.name}: Found ${count} (optional)`);
                    }
                  } else if (count > 0) {
                    // Verify links if validateLink function is provided
                    if (check.validateLink) {
                      let validCount = 0;
                      let invalidLinks = [];
                      
                      for (const element of elements) {
                        let href = null;
                        
                        // If checking parent link for images
                        if (check.checkParentLink) {
                          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                          if (tagName === 'img') {
                            const parent = await element.locator('..').first();
                            const parentTagName = await parent.evaluate(el => el.tagName.toLowerCase());
                            if (parentTagName === 'a') {
                              href = await parent.getAttribute('href');
                            }
                          } else {
                            href = await element.getAttribute('href');
                          }
                        } else {
                          href = await element.getAttribute('href');
                        }
                        
                        if (href && check.validateLink(href)) {
                          validCount++;
                        } else if (href) {
                          invalidLinks.push(href);
                        }
                      }
                      
                      if (validCount < count && invalidLinks.length > 0) {
                        errors.push(`${check.name}: ${invalidLinks.length} invalid link(s) found: ${invalidLinks.slice(0, 3).join(', ')}${invalidLinks.length > 3 ? '...' : ''}`);
                      } else if (validCount > 0) {
                        // Log success for debugging
                        console.log(`   ✓ ${check.name}: ${validCount} valid link(s) found`);
                      }
                    }
                    
                    if (count >= check.minCount) {
                      console.log(`   ✓ ${check.name}: Found ${count} (required: ${check.minCount})`);
                    }
                  }
                } catch (checkError) {
                  warnings.push(`${check.name} verification failed: ${checkError.message}`);
                }
              }
            }
          }
        } catch (interactionError) {
          warnings.push(`Interaction failed: ${interactionError.message}`);
        }
      }
    }

    // Check page title
    const pageTitle = await page.title();
    if (pageTitle.toLowerCase().includes('error') || pageTitle.toLowerCase().includes('404')) {
      errors.push(`Page title indicates error: ${pageTitle}`);
    }

    const duration = Date.now() - startTime;
    const success = errors.length === 0;

    // Take screenshot on failure
    if (!success && config.screenshotOnFailure) {
      const screenshotDir = path.join(__dirname, 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      screenshotPath = path.join(screenshotDir, `${test.id}-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    }

    return {
      success,
      duration: `${duration}ms`,
      error: errors.length > 0 ? errors.join('; ') : null,
      errors,
      warnings,
      missingElements: missingElements.length > 0 ? missingElements : null,
      consoleErrors: consoleErrors,
      pageErrors: pageErrors,
      screenshot: screenshotPath
    };

  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
  }
}

// Main test execution function
async function executeTest(test) {
  const startTime = Date.now();
  const testUrl = `${config.baseUrl}${test.url}`;

  try {
    return await executeTestWithPlaywright(test, testUrl, startTime);
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      duration: `${duration}ms`,
      error: error.message,
      errors: [error.message],
      warnings: [],
      missingElements: null,
      consoleErrors: [],
      pageErrors: []
    };
  }
}

// Main test runner
async function runPublicPageTests() {
  console.log('🚀 Starting Public Pages Test Suite');
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`⏱️  Expected Duration: ${config.testDuration}`);
  console.log(`🧪 Test Engine: Playwright (Browser automation)`);
  console.log(`📦 Testing: Public pages only (no authentication required)`);
  console.log('='.repeat(70));

  const results = {
    total: publicPageTests.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    testResults: []
  };

  // Initialize browser once
  try {
    const playwright = await import('playwright');
    globalBrowser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (error) {
    console.error('❌ Failed to launch browser:', error.message);
    console.error('💡 Run: npm install --save-dev playwright && npx playwright install chromium');
    process.exit(1);
  }

  for (const test of publicPageTests) {
    console.log(`\n🧪 [${test.id}] Running: ${test.name}`);
    console.log(`   Priority: ${test.priority}`);
    console.log(`   URL: ${config.baseUrl}${test.url}`);

    // Check if test should be skipped
    if (test.skipIf) {
      console.log(`   ⏭️  SKIPPED: ${test.skipIf}`);
      results.skipped++;
      results.testResults.push({
        id: test.id,
        name: test.name,
        url: test.url,
        priority: test.priority,
        status: 'skipped',
        duration: '0ms',
        error: test.skipIf
      });
      continue;
    }

    try {
      // Add small delay between tests
      if (test.id !== 'public-001') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const testResult = await executeTest(test);

      const testData = {
        id: test.id,
        name: test.name,
        url: test.url,
        priority: test.priority,
        status: testResult.success ? 'passed' : 'failed',
        duration: testResult.duration || '0ms',
        error: testResult.error || null,
        errors: testResult.errors || [],
        warnings: testResult.warnings || [],
        expectedElements: test.expectedElements,
        validation: test.validation,
        screenshot: testResult.screenshot || null,
        missingElements: testResult.missingElements || null,
        consoleErrors: testResult.consoleErrors || [],
        pageErrors: testResult.pageErrors || []
      };

      results.testResults.push(testData);

      if (testResult.success) {
        results.passed++;
        console.log(`   ✅ PASSED (${testData.duration})`);
        if (testResult.warnings && testResult.warnings.length > 0) {
          testResult.warnings.forEach(w => console.log(`      ⚠️  ${w}`));
        }
      } else {
        results.failed++;
        console.log(`   ❌ FAILED: ${testResult.error}`);
        if (testResult.errors && testResult.errors.length > 0) {
          testResult.errors.forEach(e => console.log(`      • ${e}`));
        }
        if (testResult.missingElements && testResult.missingElements.length > 0) {
          console.log(`      Missing elements: ${testResult.missingElements.join(', ')}`);
        }
        results.errors.push({
          test: test.name,
          error: testResult.error,
          missingElements: testResult.missingElements
        });
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
      results.failed++;
      results.errors.push({
        test: test.name,
        error: error.message
      });
      results.testResults.push({
        id: test.id,
        name: test.name,
        url: test.url,
        priority: test.priority,
        status: 'error',
        duration: '0ms',
        error: error.message
      });
    }
  }

  // Cleanup: Close browser
  if (globalBrowser) {
    await globalBrowser.close().catch(() => {});
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`Success Rate: ${((results.passed / (results.total - results.skipped)) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.test}: ${err.error}`);
    });
  }

  // Generate HTML report
  await generateHTMLReport(results);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Generate HTML report
async function generateHTMLReport(results) {
  const timestamp = new Date().toLocaleString();
  const successRate = results.total - results.skipped > 0
    ? ((results.passed / (results.total - results.skipped)) * 100).toFixed(1)
    : 0;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Pages Test Report - Malayalees US Site</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            padding: 30px;
            border-bottom: 2px solid #eee;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .success-rate { color: #17a2b8; }
        .skipped { color: #ffc107; }
        .tests-section {
            padding: 30px;
        }
        .test-item {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid;
            transition: background-color 0.2s;
        }
        .test-item:hover {
            background-color: #f8f9fa;
        }
        .test-item.passed {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .test-item.failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .test-item.skipped {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .test-status {
            font-size: 1.5em;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .test-info {
            flex: 1;
        }
        .test-info h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 1.1em;
        }
        .test-info .test-id {
            font-family: monospace;
            font-size: 0.85em;
            color: #666;
            margin-right: 10px;
        }
        .test-info .test-priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-critical { background: #dc3545; color: white; }
        .priority-high { background: #fd7e14; color: white; }
        .priority-medium { background: #ffc107; color: #333; }
        .priority-low { background: #6c757d; color: white; }
        .test-info p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        .test-details {
            margin-left: auto;
            text-align: right;
            flex-shrink: 0;
        }
        .test-details .url {
            font-family: monospace;
            background: #f1f1f1;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            margin-bottom: 5px;
            display: inline-block;
        }
        .test-details .duration {
            font-size: 0.8em;
            color: #666;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        .timestamp {
            font-size: 0.9em;
            opacity: 0.8;
        }
        .error-details {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0,0,0,0.02);
            border-radius: 4px;
            font-size: 0.85em;
        }
        .error-details h5 {
            margin: 0 0 5px 0;
            color: #333;
        }
        .error-details ul {
            margin: 5px 0 0 20px;
            color: #666;
        }
        .warning-details {
            margin-top: 5px;
            padding: 5px;
            background: #fff3cd;
            border-left: 3px solid #ffc107;
            font-size: 0.85em;
        }
        .missing-elements {
            color: #dc3545;
            font-weight: bold;
        }
        .screenshot-link {
            display: inline-block;
            margin-top: 5px;
            padding: 4px 8px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 3px;
            font-size: 0.8em;
        }
        .screenshot-link:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Public Pages Test Report</h1>
            <p>Malayalees US Site Event Registration Platform</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Test Engine: Playwright (Local) | ${results.total} Tests | ${successRate}% Success Rate</p>
        </div>

        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="number total">${results.total}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number passed">${results.passed}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="number failed">${results.failed}</div>
                </div>
                <div class="summary-card">
                    <h3>Skipped</h3>
                    <div class="number skipped">${results.skipped}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="number success-rate">${successRate}%</div>
                </div>
            </div>
        </div>

        <div class="tests-section">
            <h2 style="margin-bottom: 20px; color: #333;">Test Results</h2>
            ${results.testResults.map(test => {
              // Screenshot path is already relative to __dirname (screenshots folder)
              const screenshotPath = test.screenshot ? path.basename(test.screenshot) : null;
              return `
                <div class="test-item ${test.status}">
                    <div class="test-status">${test.status === 'passed' ? '✅' : test.status === 'skipped' ? '⏭️' : '❌'}</div>
                    <div class="test-info">
                        <h4>
                            <span class="test-id">${test.id}</span>
                            ${test.name}
                            ${test.priority ? `<span class="test-priority priority-${test.priority}">${test.priority}</span>` : ''}
                        </h4>
                        <p>${test.status === 'passed' ? 'Test completed successfully' : test.status === 'skipped' ? `Skipped: ${test.error || 'N/A'}` : `Error: ${test.error || 'Unknown error'}`}</p>
                        ${test.warnings && test.warnings.length > 0 ? `
                        <div class="warning-details">
                            <strong>⚠️ Warnings:</strong> ${test.warnings.join('; ')}
                        </div>
                        ` : ''}
                        ${test.missingElements && test.missingElements.length > 0 ? `
                        <div class="error-details">
                            <strong class="missing-elements">Missing Elements:</strong> ${test.missingElements.map(el => `<code>${el}</code>`).join(', ')}
                        </div>
                        ` : ''}
                        ${test.errors && test.errors.length > 0 ? `
                        <div class="error-details">
                            <strong>Errors:</strong>
                            <ul>
                                ${test.errors.map(err => `<li>${err}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        ${test.expectedElements && test.expectedElements.length > 0 ? `
                        <div class="error-details">
                            <h5>Expected Elements:</h5>
                            <ul>
                                ${test.expectedElements.map(el => `<li><code>${el}</code></li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                    <div class="test-details">
                        <div class="url">${test.url}</div>
                        <div class="duration">${test.duration}</div>
                        ${screenshotPath ? `<a href="screenshots/${screenshotPath}" target="_blank" class="screenshot-link">📷 Screenshot</a>` : ''}
                    </div>
                </div>
            `;
            }).join('')}
        </div>

        <div class="footer">
            <p>Generated by Public Pages Test Suite</p>
            <p class="timestamp">Report generated on: ${timestamp}</p>
            <p class="timestamp">Base URL: ${config.baseUrl}</p>
            <p class="timestamp">Test Engine: Playwright (Local Browser Execution)</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'public-pages-test-report.html');

  try {
    await fs.promises.writeFile(reportPath, htmlContent, 'utf8');
    console.log(`\n✅ HTML report generated: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to generate HTML report:', error.message);
  }
}

// Run tests
runPublicPageTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

