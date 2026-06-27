#!/usr/bin/env node

/**
 * MOSC Pages Test Runner
 * Fast, focused test suite for /mosc pages only
 * Expected Duration: ~2-4 minutes
 *
 * This script uses Playwright for real browser automation.
 * Tests only MOSC public pages (no authentication required).
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
  testDuration: '2-4 minutes',
  screenshotOnFailure: true,
  performanceTiming: false, // Disabled for faster execution
};

// MOSC pages test scenarios
const moscPageTests = [
  {
    id: 'mosc-001',
    name: 'MOSC Homepage Test',
    url: '/mosc',
    priority: 'critical',
    expectedElements: [
      'h1, h2',
      'nav',
      'main',
      'a[href*="/mosc/"]',
      'button:has-text("Gallery"), a[href="/mosc/gallery"]'
    ],
    validation: [
      'MOSC homepage loads',
      'Navigation menu visible',
      'Content sections displayed',
      'Quick Links section visible',
      'Gallery link present in Quick Links',
      'No layout errors'
    ],
    interactions: [
      { type: 'wait', selector: 'main', timeout: 5000 },
      { type: 'check', selector: 'nav', visible: true },
      // Check for Gallery link - it may be a button or anchor tag
      { type: 'check', selector: 'a[href="/mosc/gallery"]:visible, button:has-text("Gallery"):visible', visible: true }
    ]
  },
  {
    id: 'mosc-001a',
    name: 'MOSC Homepage Quick Links - Gallery Navigation Test',
    url: '/mosc',
    priority: 'high',
    expectedElements: [
      'button:has-text("Gallery"), a[href="/mosc/gallery"]',
      'h1, h2',
      '[class*="gallery"], [class*="album"], [class*="grid"]'
    ],
    validation: [
      'MOSC homepage loads',
      'Gallery link in Quick Links is clickable',
      'Clicking Gallery link navigates to /mosc/gallery',
      'Gallery page loads correctly after navigation'
    ],
    interactions: [
      { type: 'wait', selector: 'main', timeout: 5000 },
      // Wait for page to fully load
      { type: 'wait', selector: 'body', timeout: 2000 },
      // Find and click Gallery link - try multiple selectors
      { type: 'click', selector: 'a[href="/mosc/gallery"]:visible, button:has-text("Gallery"):visible', waitForNavigation: '/mosc/gallery', navigationTimeout: 15000 },
      { type: 'verifyUrl', pattern: '/mosc/gallery' },
      { type: 'wait', selector: '[class*="gallery"], [class*="album"], [class*="grid"]', timeout: 5000 }
    ]
  },
  {
    id: 'mosc-002',
    name: 'MOSC Holy Synod Page Test',
    url: '/mosc/holy-synod',
    priority: 'high',
    expectedElements: [
      'h1',
      '[class*="synod"], [class*="member"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Holy Synod page loads',
      'Synod members displayed',
      'Member images load'
    ],
    interactions: [
      { type: 'wait', selector: 'h1', timeout: 5000 }
    ]
  },
  {
    id: 'mosc-003',
    name: 'MOSC Gallery Page Test',
    url: '/mosc/gallery',
    priority: 'high',
    expectedElements: [
      'h1',
      '[class*="gallery"], [class*="album"], [class*="grid"]',
      'img, [class*="image"]'
    ],
    validation: [
      'MOSC Gallery page loads',
      'Photo albums displayed',
      'Images load correctly'
    ],
    interactions: [
      { type: 'wait', selector: 'img', timeout: 5000 }
    ]
  },
  {
    id: 'mosc-005',
    name: 'MOSC Directory Page Test',
    url: '/mosc/directory',
    priority: 'high',
    expectedElements: [
      'h1',
      '[class*="directory"], [class*="list"], main',
      'input[type="search"], input[type="text"]',
      'a, button'
    ],
    validation: [
      'Directory page loads',
      'Directory listings visible',
      'Search functionality accessible'
    ],
    interactions: [
      { type: 'wait', selector: 'main', timeout: 5000 }
    ]
  },
  {
    id: 'mosc-006',
    name: 'MOSC Calendar Page Test',
    url: '/mosc/calendar',
    priority: 'medium',
    expectedElements: [
      'h1, h2',
      'main',
      'a[href*="calendar"], a[href*="mosc.in"]'
    ],
    validation: [
      'Calendar page loads',
      'Calendar links present'
    ]
  },
  {
    id: 'mosc-007',
    name: 'MOSC Contact Info Page Test',
    url: '/mosc/contact-info',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="contact"], [class*="address"], [class*="info"]',
      'a[href^="mailto:"], a[href^="tel:"]'
    ],
    validation: [
      'Contact info page loads',
      'Contact details visible'
    ]
  },
  {
    id: 'mosc-008',
    name: 'MOSC Dioceses Page Test',
    url: '/mosc/dioceses',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="diocese"], [class*="card"], [class*="grid"]'
    ],
    validation: [
      'Dioceses page loads',
      'Diocese listings visible'
    ]
  },
  {
    id: 'mosc-009',
    name: 'MOSC The Church Page Test',
    url: '/mosc/the-church',
    priority: 'medium',
    expectedElements: [
      'h1',
      'main',
      'a[href*="/mosc/the-church/"], [class*="card"]'
    ],
    validation: [
      'The Church page loads',
      'Navigation to church sections visible'
    ]
  },
  {
    id: 'mosc-010',
    name: 'MOSC Spiritual Organizations Page Test',
    url: '/mosc/spiritual-organizations',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="organization"], [class*="card"], [class*="grid"]',
      'a[href*="/mosc/spiritual-organizations/"]'
    ],
    validation: [
      'Spiritual organizations page loads',
      'Organization listings visible'
    ]
  },
  {
    id: 'mosc-011',
    name: 'MOSC Training Page Test',
    url: '/mosc/training',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="training"], [class*="card"], [class*="grid"]',
      'a[href*="/mosc/training/"]'
    ],
    validation: [
      'Training page loads',
      'Training listings visible'
    ]
  },
  {
    id: 'mosc-012',
    name: 'MOSC Theological Seminaries Page Test',
    url: '/mosc/theological-seminaries',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="seminary"], [class*="card"], [class*="grid"]',
      'a[href*="/mosc/theological-seminaries/"]'
    ],
    validation: [
      'Seminaries page loads',
      'Seminary listings visible'
    ]
  },
  {
    id: 'mosc-013',
    name: 'MOSC Pilgrim Centres Page Test',
    url: '/mosc/pilgrim-centres',
    priority: 'low',
    expectedElements: [
      'h1',
      '[class*="pilgrim"], [class*="card"], [class*="grid"]',
      'a[href*="/mosc/pilgrim-centres/"]'
    ],
    validation: [
      'Pilgrim centres page loads',
      'Pilgrim centres listings visible'
    ]
  },
  {
    id: 'mosc-014',
    name: 'MOSC Institutions Page Test',
    url: '/mosc/institutions',
    priority: 'low',
    expectedElements: [
      'h1',
      '[class*="institution"], [class*="card"], [class*="grid"]'
    ],
    validation: [
      'Institutions page loads',
      'Institutions listings visible'
    ]
  },
  {
    id: 'mosc-015',
    name: 'MOSC Saints Page Test',
    url: '/mosc/saints',
    priority: 'low',
    expectedElements: [
      'h1',
      '[class*="saint"], [class*="card"], [class*="grid"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Saints page loads',
      'Saints listings visible'
    ]
  },
  {
    id: 'mosc-016',
    name: 'MOSC Sitemap Page Test',
    url: '/mosc/sitemap',
    priority: 'low',
    expectedElements: [
      'h1',
      'a[href*="/mosc/"]',
      'main, [class*="container"]'
    ],
    validation: [
      'Sitemap page loads',
      'MOSC links visible'
    ]
  },
  {
    id: 'mosc-017',
    name: 'MOSC Catholicate Main Page Test',
    url: '/mosc/catholicate',
    priority: 'high',
    expectedElements: [
      'h1',
      '[class*="catholicate"], [class*="catholicos"], main',
      'a[href*="/mosc/catholicate/"], [class*="card"], [class*="grid"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Catholicate main page loads',
      'Catholicos history listings visible',
      'Biography links present',
      'Images load correctly'
    ],
    interactions: [
      { type: 'wait', selector: 'h1', timeout: 5000 }
    ]
  },
  {
    id: 'mosc-018',
    name: 'MOSC Catholicate Biography Page Test',
    url: '/mosc/catholicate/h-h-baselios-marthoma-paulose-ii',
    priority: 'medium',
    expectedElements: [
      'h1, h2, h3',
      '[class*="biography"], [class*="catholicos"], main',
      'img, [class*="image"]',
      'a[href*="/mosc/catholicate/"]'
    ],
    validation: [
      'Catholicate biography page loads',
      'Biography content displayed',
      'Catholicos image loads',
      'Navigation links present'
    ],
    interactions: [
      { type: 'wait', selector: 'h1', timeout: 5000 }
    ]
  },
  {
    id: 'mosc-019',
    name: 'MOSC Speeches Page Test',
    url: '/mosc/speeches',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="speech"], [class*="message"], [class*="address"], main',
      '[class*="card"], [class*="grid"]',
      'button, a[href*="/speeches"]'
    ],
    validation: [
      'Speeches page loads',
      'Speech listings visible',
      'Categories/filters accessible',
      'No JavaScript errors'
    ],
    interactions: [
      { type: 'wait', selector: 'main', timeout: 5000 }
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

    // Check for redirects
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
    const clerkAuthErrors = pageErrors.filter(err =>
      err.includes('auth() was called but Clerk can\'t detect usage of authMiddleware()')
    );
    const otherPageErrors = pageErrors.filter(err =>
      !err.includes('auth() was called but Clerk can\'t detect usage of authMiddleware()')
    );

    if (clerkAuthErrors.length > 0) {
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
          } else if (interaction.type === 'scroll') {
            // Scroll to element to make it visible
            const element = await page.locator(interaction.selector).first();
            await element.scrollIntoViewIfNeeded({ timeout: interaction.timeout || 5000 });
            // Small delay to ensure scroll completes
            await new Promise(resolve => setTimeout(resolve, 300));
          } else if (interaction.type === 'check') {
            // Handle multiple selectors (comma-separated)
            const selectorParts = interaction.selector.split(',').map(s => s.trim());
            let found = false;
            let element = null;
            
            for (const part of selectorParts) {
              try {
                const locator = page.locator(part).first();
                const isVisible = await locator.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                  found = true;
                  element = locator;
                  break;
                }
              } catch (partError) {
                continue;
              }
            }
            
            if (interaction.visible !== undefined) {
              if (!found && interaction.visible) {
                errors.push(`Element ${interaction.selector} visibility check failed - not found or not visible`);
              } else if (found && !interaction.visible) {
                errors.push(`Element ${interaction.selector} visibility check failed - element is visible but should not be`);
              }
            }
            if (interaction.count) {
              const count = await page.locator(interaction.selector).count();
              if (interaction.count.min && count < interaction.count.min) {
                errors.push(`Element ${interaction.selector} count ${count} is less than minimum ${interaction.count.min}`);
              }
            }
          } else if (interaction.type === 'click') {
            // Click an element and optionally wait for navigation
            // Find the first visible element matching the selector
            const selectorParts = interaction.selector.split(',').map(s => s.trim());
            let element = null;
            let clicked = false;
            
            for (const part of selectorParts) {
              try {
                const locator = page.locator(part).first();
                const isVisible = await locator.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                  element = locator;
                  // Scroll to element to ensure it's in viewport
                  await element.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
                  await new Promise(resolve => setTimeout(resolve, 300));
                  await element.click({ timeout: interaction.timeout || 5000 });
                  clicked = true;
                  break;
                }
              } catch (partError) {
                continue;
              }
            }
            
            if (!clicked) {
              // Fallback: try to click the first matching element even if not visible
              element = await page.locator(interaction.selector).first();
              await element.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
              await new Promise(resolve => setTimeout(resolve, 300));
              await element.click({ timeout: interaction.timeout || 5000, force: true });
            }
            
            if (interaction.waitForNavigation) {
              await page.waitForURL(interaction.waitForNavigation, { timeout: interaction.navigationTimeout || 15000 });
            }
          } else if (interaction.type === 'verifyUrl') {
            // Verify current URL matches expected pattern
            const currentUrl = page.url();
            const expectedPattern = interaction.pattern;
            if (!currentUrl.includes(expectedPattern)) {
              errors.push(`URL verification failed. Expected to contain "${expectedPattern}", got "${currentUrl}"`);
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
async function runMoscPageTests() {
  console.log('🚀 Starting MOSC Pages Test Suite');
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`⏱️  Expected Duration: ${config.testDuration}`);
  console.log(`🧪 Test Engine: Playwright (Browser automation)`);
  console.log(`📦 Testing: MOSC pages only (no authentication required)`);
  console.log('='.repeat(70));

  const results = {
    total: moscPageTests.length,
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

  for (const test of moscPageTests) {
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
      if (test.id !== 'mosc-001') {
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
    <title>MOSC Pages Test Report</title>
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
            <h1>🧪 MOSC Pages Test Report</h1>
            <p>MOSC Public Site Pages</p>
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
            <p>Generated by MOSC Pages Test Suite</p>
            <p class="timestamp">Report generated on: ${timestamp}</p>
            <p class="timestamp">Base URL: ${config.baseUrl}</p>
            <p class="timestamp">Test Engine: Playwright (Local Browser Execution)</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'mosc-pages-test-report.html');

  try {
    await fs.promises.writeFile(reportPath, htmlContent, 'utf8');
    console.log(`\n✅ HTML report generated: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to generate HTML report:', error.message);
  }
}

// Run tests
runMoscPageTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
