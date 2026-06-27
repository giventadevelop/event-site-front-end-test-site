/**
 * Diagnostic Script for Event Discovery
 *
 * Runs in NON-HEADLESS mode to visually debug why event discovery is failing.
 * This script will:
 * 1. Navigate to /admin/manage-events
 * 2. Take screenshots at each step
 * 3. Dump full HTML structure
 * 4. Check for authentication issues
 * 5. Try to find tables and event IDs
 *
 * Usage:
 *   node TestSprite/admin-tests/diagnose-event-discovery.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { authenticatePage, createAuthenticatedContext, loadAuthState } from '../sanity-tests/authenticate-playwright.js';
import { resolveAdminTestBaseUrl } from './resolve-admin-test-base-url.js';

const AUTH_CONFIG_PATH = path.join(__dirname, 'auth.json');
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const DIAGNOSTIC_DIR = path.join(__dirname, 'diagnostic-output');

function loadAuthConfig() {
  if (!fs.existsSync(AUTH_CONFIG_PATH)) {
    console.error(`❌ Auth config file not found: ${AUTH_CONFIG_PATH}`);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(AUTH_CONFIG_PATH, 'utf8'));
  return {
    email: config.email,
    password: config.password,
    baseUrl: resolveAdminTestBaseUrl(config.baseUrl) || 'http://localhost:3000',
  };
}

async function main() {
  console.log('🔍 Starting Event Discovery Diagnostic...\n');
  console.log('⚠️  Running in NON-HEADLESS mode so you can see what\'s happening\n');

  const config = loadAuthConfig();

  // Create diagnostic output directory
  if (!fs.existsSync(DIAGNOSTIC_DIR)) {
    fs.mkdirSync(DIAGNOSTIC_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false, // NON-HEADLESS for visual debugging
    slowMo: 1000 // Slow down actions so you can see what's happening
  });

  let context = null;
  let page = null;

  try {
    // Load or create auth
    let authState = null;
    if (fs.existsSync(AUTH_STATE_PATH)) {
      try {
        authState = JSON.parse(fs.readFileSync(AUTH_STATE_PATH, 'utf8'));
        console.log('✅ Loaded saved authentication state');
      } catch (e) {
        console.warn('⚠️  Could not load auth state, will authenticate fresh');
      }
    }

    // Try to load existing auth state
    if (authState) {
      try {
        context = await browser.newContext({ storageState: authState });
        page = await context.newPage();

        // Verify auth by checking if we can access admin page
        console.log('🔍 Verifying existing authentication...');
        await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for any redirects

        const currentUrl = page.url();
        console.log(`   Current URL after /admin: ${currentUrl}`);

        if (currentUrl.includes('/sign-in') || currentUrl === config.baseUrl + '/' || !currentUrl.includes('/admin')) {
          console.log('⚠️  Auth state expired or invalid, will re-authenticate...');
          await context.close();
          context = null;
          page = null;
          authState = null;
        } else {
          console.log('✅ Authentication verified - can access admin page');
        }
      } catch (e) {
        console.warn(`⚠️  Error verifying auth state: ${e.message}`);
        if (context) await context.close();
        context = null;
        page = null;
        authState = null;
      }
    }

    // If no valid auth state, authenticate fresh
    if (!authState || !context) {
      console.log('\n🔐 Authenticating fresh...');
      console.log(`   Email: ${config.email}`);
      console.log(`   Base URL: ${config.baseUrl}`);

      // Create authenticated context (this will handle the login flow)
      const authResult = await createAuthenticatedContext(
        browser,
        config.baseUrl,
        { email: config.email, password: config.password }
      );

      context = authResult.context;
      page = authResult.page;

      // Verify we're authenticated
      console.log('\n🔍 Verifying authentication after login...');
      await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      if (currentUrl.includes('/sign-in') || currentUrl === config.baseUrl + '/') {
        console.error('\n❌ Authentication failed - still redirected to sign-in or homepage');
        console.error('   Please check:');
        console.error('   1. Credentials in auth.json are correct');
        console.error('   2. User has ADMIN role in database');
        console.error('   3. Clerk is configured correctly');
        await page.screenshot({ path: path.join(DIAGNOSTIC_DIR, 'auth-failed.png'), fullPage: true });
        process.exit(1);
      } else {
        console.log('✅ Authentication successful - can access admin page');

        // Save auth state for next time
        const newAuthState = await context.storageState();
        fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(newAuthState, null, 2));
        console.log('💾 Auth state saved');
      }
    }

    // CRITICAL: After login, we may be redirected to homepage
    // We need to explicitly navigate to /admin/manage-events
    console.log('\n📍 Navigating to /admin/manage-events...');

    // Check current URL first
    const initialUrl = page.url();
    console.log(`   Current URL: ${initialUrl}`);

    if (initialUrl === config.baseUrl + '/' || initialUrl === config.baseUrl) {
      console.log('   ℹ️  Currently on homepage, navigating to admin page first...');
      await page.goto(`${config.baseUrl}/admin`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      await page.waitForTimeout(2000);
      console.log(`   Current URL after /admin: ${page.url()}`);
    }

    // Now navigate to manage-events
    console.log('   📍 Navigating to manage-events page...');
    await page.goto(`${config.baseUrl}/admin/manage-events`, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(2000);
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);

    if (!finalUrl.includes('/admin/manage-events')) {
      console.error(`   ❌ Failed to navigate to manage-events page! Current URL: ${finalUrl}`);
      console.error('   💡 This might indicate an authentication or routing issue.');
      await page.screenshot({ path: path.join(DIAGNOSTIC_DIR, '00-navigation-failed.png'), fullPage: true });
      process.exit(1);
    }

    console.log('📸 Taking screenshot 1: Initial page load...');
    await page.screenshot({ path: path.join(DIAGNOSTIC_DIR, '01-initial-load.png'), fullPage: true });

    console.log('⏳ Waiting 10 seconds for page to fully render...');
    await page.waitForTimeout(10000);

    console.log('📸 Taking screenshot 2: After 10 second wait...');
    await page.screenshot({ path: path.join(DIAGNOSTIC_DIR, '02-after-wait.png'), fullPage: true });

    // Check what's actually on the page
    console.log('\n🔍 Analyzing page content...');
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        url: window.location.href,
        title: document.title,
        bodyText: document.body ? document.body.innerText.substring(0, 1000) : 'No body',
        hasLoadingText: document.body ? document.body.innerText.includes('Loading events...') : false,
        hasEventContent: document.body ? (document.body.innerText.includes('Event ID') || document.body.innerText.includes('Create Event')) : false,
        tables: document.querySelectorAll('table').length,
        tableRows: document.querySelectorAll('table tbody tr').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        eventLinks: document.querySelectorAll('a[href*="/admin/events/"]').length,
        mediaLinks: document.querySelectorAll('a[href*="/admin/events/"][href*="/media"]').length,
        bodyChildren: document.body ? document.body.children.length : 0,
        bodyChildrenDetails: []
      };

      // Get details of first 10 body children
      if (document.body) {
        for (let i = 0; i < Math.min(document.body.children.length, 10); i++) {
          const child = document.body.children[i];
          analysis.bodyChildrenDetails.push({
            index: i,
            tagName: child.tagName,
            className: child.className,
            id: child.id,
            textContent: child.textContent ? child.textContent.substring(0, 200) : '',
            childrenCount: child.children.length
          });
        }
      }

      // Try to find event IDs in text
      const bodyText = document.body ? document.body.innerText : '';
      const eventIdMatches = bodyText.match(/Event ID[:\s]+(\d+)/g);
      analysis.eventIdsInText = eventIdMatches ? eventIdMatches.map(m => {
        const match = m.match(/(\d+)/);
        return match ? match[1] : null;
      }).filter(Boolean) : [];

      return analysis;
    });

    console.log('\n📊 Page Analysis Results:');
    console.log(JSON.stringify(pageAnalysis, null, 2));

    // Save analysis to file
    fs.writeFileSync(
      path.join(DIAGNOSTIC_DIR, 'page-analysis.json'),
      JSON.stringify(pageAnalysis, null, 2)
    );

    // Try to find toggle button
    console.log('\n🔍 Looking for toggle button...');
    const toggleButton = await page.evaluate(() => {
      // Try multiple strategies
      const strategies = [
        () => document.querySelector('button[aria-label*="Show Future Events"], button[aria-label*="Show Past Events"]'),
        () => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(b => {
            const text = b.textContent || '';
            return text.includes('Future Events') || text.includes('Past Events');
          });
        },
        () => {
          // Check for toggle structure
          const body = document.body;
          if (body && body.children.length >= 3) {
            const thirdDiv = body.children[2];
            if (thirdDiv && thirdDiv.children.length > 0) {
              const innerDiv = thirdDiv.children[0];
              if (innerDiv && innerDiv.children.length >= 5) {
                const fifthDiv = innerDiv.children[4];
                if (fifthDiv && fifthDiv.children.length > 0) {
                  const innerFifthDiv = fifthDiv.children[0];
                  if (innerFifthDiv && innerFifthDiv.children.length >= 3) {
                    const thirdInnerDiv = innerFifthDiv.children[2];
                    return thirdInnerDiv ? thirdInnerDiv.querySelector('button') : null;
                  }
                }
              }
            }
          }
          return null;
        }
      ];

      for (const strategy of strategies) {
        const button = strategy();
        if (button) {
          return {
            found: true,
            text: button.textContent,
            ariaLabel: button.getAttribute('aria-label'),
            className: button.className
          };
        }
      }

      return { found: false };
    });

    console.log('Toggle button:', JSON.stringify(toggleButton, null, 2));

    // Try to find table
    console.log('\n🔍 Looking for table...');
    const tableInfo = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) {
        return { found: false, reason: 'No table element found' };
      }

      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');
      const rows = tbody ? tbody.querySelectorAll('tr') : [];

      return {
        found: true,
        hasThead: !!thead,
        hasTbody: !!tbody,
        rowCount: rows.length,
        headerText: thead ? thead.innerText.substring(0, 200) : '',
        firstRowText: rows.length > 0 ? rows[0].innerText.substring(0, 200) : ''
      };
    });

    console.log('Table info:', JSON.stringify(tableInfo, null, 2));

    // Try to extract event IDs
    console.log('\n🔍 Extracting event IDs...');
    const eventIds = await page.evaluate(() => {
      const ids = [];

      // Strategy 1: From links
      const links = Array.from(document.querySelectorAll('a[href*="/admin/events/"]'));
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/\/admin\/events\/(\d+)/);
          if (match) ids.push(match[1]);
        }
      });

      // Strategy 2: From text content
      const bodyText = document.body ? document.body.innerText : '';
      const textMatches = bodyText.match(/Event ID[:\s]+(\d+)/g);
      if (textMatches) {
        textMatches.forEach(match => {
          const idMatch = match.match(/(\d+)/);
          if (idMatch) ids.push(idMatch[1]);
        });
      }

      return [...new Set(ids)];
    });

    console.log(`✅ Found ${eventIds.length} event ID(s): ${eventIds.join(', ')}`);

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      url: pageAnalysis.url,
      pageAnalysis,
      toggleButton,
      tableInfo,
      eventIds
    };

    fs.writeFileSync(
      path.join(DIAGNOSTIC_DIR, 'diagnostic-results.json'),
      JSON.stringify(results, null, 2)
    );

    console.log('\n✅ Diagnostic complete!');
    console.log(`📁 Results saved to: ${DIAGNOSTIC_DIR}`);
    console.log(`📸 Screenshots: ${DIAGNOSTIC_DIR}/*.png`);
    console.log(`📊 Analysis: ${DIAGNOSTIC_DIR}/page-analysis.json`);
    console.log(`📋 Results: ${DIAGNOSTIC_DIR}/diagnostic-results.json`);

    // Keep browser open for 30 seconds so you can inspect
    console.log('\n⏳ Keeping browser open for 30 seconds for inspection...');
    console.log('   (Close manually or wait for auto-close)');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Diagnostic error:', error);
    if (page) {
      await page.screenshot({ path: path.join(DIAGNOSTIC_DIR, 'error-screenshot.png'), fullPage: true });
    }
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

main().catch(console.error);
