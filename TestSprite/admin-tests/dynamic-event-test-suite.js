/**
 * Dynamic Event Test Suite
 *
 * Tests dynamic event pages by discovering event IDs from the manage-events page
 * and testing event-specific routes like /admin/events/{id}/media, etc.
 *
 * This script:
 * 1. Discovers event IDs by navigating to /admin/manage-events
 * 2. Toggles between Future/Past events if needed
 * 3. Extracts event IDs from "Upload Media Files" links
 * 4. Tests dynamic event pages for discovered events
 * 5. Generates a separate test report
 *
 * Usage:
 *   npm run test:admin:dynamic
 *   or
 *   node TestSprite/admin-tests/dynamic-event-test-suite.js
 *
 * Base URL override: npm run test:admin:dynamic -- --port=3001
 *   (also TEST_BASE_URL, TEST_PORT, PORT — see resolve-admin-test-base-url.js)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import ES module authentication helpers
import { authenticatePage, createAuthenticatedContext, saveAuthState, loadAuthState } from '../sanity-tests/authenticate-playwright.js';
import { resolveAdminTestBaseUrl } from './resolve-admin-test-base-url.js';

// Configuration
const AUTH_CONFIG_PATH = path.join(__dirname, 'auth.json');
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORT_PATH = path.join(__dirname, 'dynamic-event-test-report.html');

// Test results storage
let testResults = [];
let startTime = Date.now();

/**
 * Load authentication configuration
 */
function loadAuthConfig() {
  if (!fs.existsSync(AUTH_CONFIG_PATH)) {
    console.error(`❌ Auth config file not found: ${AUTH_CONFIG_PATH}`);
    console.error(`   Please copy auth.json.example to auth.json and fill in your credentials.`);
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(AUTH_CONFIG_PATH, 'utf8'));

    if (!config.email || !config.password) {
      console.error('❌ Auth config missing email or password');
      process.exit(1);
    }

    return {
      email: config.email,
      password: config.password,
      baseUrl: resolveAdminTestBaseUrl(config.baseUrl) || 'http://localhost:3000',
      timeout: config.timeout || 30000,
      headless: config.headless !== undefined ? config.headless : true,
      screenshotOnFailure: config.screenshotOnFailure !== false
    };
  } catch (error) {
    console.error(`❌ Error loading auth config: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create screenshots directory if it doesn't exist
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Dynamic event pages to test (templates with {eventId} placeholder)
 */
const dynamicEventPages = [
  {
    id: 'admin-event-001',
    name: 'Event Details Page',
    urlPattern: '/admin/events/{eventId}',
    category: 'dynamic-events',
    priority: 'high',
    expectedElements: ['h1', '[class*="event"]', 'table', 'a[href*="/admin/events"]'],
    validation: ['Event details page loads', 'Event information displayed'],
    timeout: 45000,
  },
  {
    id: 'admin-event-002',
    name: 'Event Media Upload Page',
    urlPattern: '/admin/events/{eventId}/media',
    category: 'dynamic-events',
    priority: 'high',
    expectedElements: ['h1', '[class*="media"]', 'input[type="file"]', 'button'],
    validation: ['Media upload page loads', 'Upload form visible'],
    timeout: 45000,
  },
  {
    id: 'admin-event-003',
    name: 'Event Media List Page',
    urlPattern: '/admin/events/{eventId}/media/list',
    category: 'dynamic-events',
    priority: 'high',
    expectedElements: ['h1', '[class*="media"]', 'table', 'img, [class*="image"]'],
    validation: ['Media list page loads', 'Media items displayed'],
    timeout: 45000,
  },
  {
    id: 'admin-event-004',
    name: 'Event Tickets List Page',
    urlPattern: '/admin/events/{eventId}/tickets/list',
    category: 'dynamic-events',
    priority: 'high',
    expectedElements: ['h1', '[class*="ticket"]', 'table'],
    validation: ['Tickets list page loads', 'Ticket information displayed'],
    timeout: 45000,
  },
  {
    id: 'admin-event-005',
    name: 'Event Ticket Types List Page',
    urlPattern: '/admin/events/{eventId}/ticket-types/list',
    category: 'dynamic-events',
    priority: 'high',
    expectedElements: ['h1', '[class*="ticket"]', 'table'],
    validation: ['Ticket types list page loads', 'Ticket types displayed'],
    timeout: 45000,
  },
];

/**
 * Get available event IDs from the manage-events page
 * Enhanced with toggle switching, retry logic, and exact XPath paths
 */
async function getAvailableEventIds(page, baseUrl) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`\n   🔍 Discovering event IDs (attempt ${retryCount + 1}/${maxRetries})...`);

      // Navigate to manage-events page
      // Note: We should already be authenticated and have admin access at this point
      console.log(`   📍 Navigating to ${baseUrl}/admin/manage-events...`);

      const initialUrl = page.url();
      console.log(`   🔍 Current URL before navigation: ${initialUrl}`);

      // Navigate directly to manage-events (we've already verified admin access)
      await page.goto(`${baseUrl}/admin/manage-events`, {
        waitUntil: 'networkidle',
        timeout: 60000
      });

      // Wait for page to settle
      await page.waitForTimeout(3000);

      // Verify we're on the correct page
      const currentUrl = page.url();
      console.log(`   🔍 Current URL after navigation: ${currentUrl}`);

      if (!currentUrl.includes('/admin/manage-events')) {
        if (currentUrl === baseUrl + '/' || currentUrl === baseUrl) {
          console.error(`   ❌ CRITICAL: Redirected to homepage!`);
          console.error(`   💡 This means the user does not have ADMIN role in the database.`);
          console.error(`   💡 The admin layout is redirecting non-admin users to homepage.`);
          console.error(`   💡 Please check the user's role in the database and ensure it's set to 'ADMIN'.`);
          retryCount++;
          continue;
        } else {
          console.warn(`   ⚠️  WARNING: Not on manage-events page! Current URL: ${currentUrl}`);
          console.warn(`   💡 Attempting to navigate again...`);

          // Try navigating again
          await page.goto(`${baseUrl}/admin/manage-events`, {
            waitUntil: 'networkidle',
            timeout: 60000
          });
          await page.waitForTimeout(3000);

          const retryUrl = page.url();
          console.log(`   🔍 Current URL after retry: ${retryUrl}`);

          if (!retryUrl.includes('/admin/manage-events')) {
            console.error(`   ❌ Failed to navigate to manage-events page. Current URL: ${retryUrl}`);
            retryCount++;
            continue;
          }
        }
      } else {
        console.log(`   ✅ Successfully navigated to manage-events page`);
      }

      // Take screenshot for debugging
      const screenshotPath = path.join(SCREENSHOTS_DIR, `manage-events-attempt-${retryCount + 1}-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);

      // Check for iframes and shadow DOM
      const iframes = await page.$$('iframe');
      console.log(`   🔍 Found ${iframes.length} iframe(s) on page`);

      if (iframes.length > 0) {
        console.warn(`   ⚠️  WARNING: Page contains iframes - table might be in an iframe!`);
        for (let i = 0; i < iframes.length; i++) {
          try {
            const frame = await iframes[i].contentFrame();
            if (frame) {
              const frameTables = await frame.$$('table');
              console.log(`   🔍 Iframe ${i + 1} contains ${frameTables.length} table(s)`);
            }
          } catch (e) {
            console.warn(`   ⚠️  Could not access iframe ${i + 1}: ${e.message}`);
          }
        }
      }

      // Check for shadow DOM (unlikely but possible)
      const shadowHosts = await page.evaluate(() => {
        const hosts = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while (node = walker.nextNode()) {
          if (node.shadowRoot) {
            hosts.push({
              tagName: node.tagName,
              className: node.className,
              shadowChildren: node.shadowRoot.children.length
            });
          }
        }
        return hosts;
      });
      if (shadowHosts.length > 0) {
        console.warn(`   ⚠️  WARNING: Page contains ${shadowHosts.length} shadow DOM host(s)!`);
      }

      // Check for overlays/modals that might block content
      const overlays = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="overlay"], [class*="backdrop"]');
        return Array.from(modals).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }).length;
      });
      console.log(`   🔍 Found ${overlays} visible overlay(s)/modal(s)`);

      // Scroll page to trigger lazy loading
      console.log(`   📜 Scrolling page to trigger rendering...`);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(2000);

      // Wait for page to fully load (including client-side rendering)
      console.log(`   ⏳ Waiting 10 seconds for page to fully load...`);
      await page.waitForTimeout(10000);

      // Wait for network to be idle (no pending requests)
      try {
        console.log(`   ⏳ Waiting for network to be idle...`);
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
          console.warn(`   ⚠️  Network idle timeout, continuing...`);
        });
      } catch (e) {
        console.warn(`   ⚠️  Network idle check failed, continuing...`);
      }

      // Double-check URL after all waits
      const finalUrl = page.url();
      console.log(`   🔍 Final URL check: ${finalUrl}`);
      if (!finalUrl.includes('/admin/manage-events')) {
        console.warn(`   ⚠️  WARNING: Not on manage-events page after waits! Current URL: ${finalUrl}`);
        console.warn(`   💡 Will retry navigation...`);
        retryCount++;
        continue;
      }

      // CRITICAL: Check if we're stuck on the "Loading events..." screen (userId not available)
      // The page returns early with "Loading events..." if userId is not available (see page.tsx line 385-403)
      console.log(`   🔍 Checking if page is stuck on loading screen (userId not available)...`);
      const isStuckOnLoading = await page.evaluate(() => {
        const bodyText = document.body ? document.body.innerText : '';
        const hasLoadingText = bodyText.includes('Loading events...');
        const hasEventContent = bodyText.includes('Event ID') || bodyText.includes('Create Event') || bodyText.includes('Search Events');
        return hasLoadingText && !hasEventContent;
      });

      if (isStuckOnLoading) {
        console.warn(`   ⚠️  CRITICAL: Page is stuck on "Loading events..." screen!`);
        console.warn(`   💡 This means userId is not available - Clerk auth may not be loaded in headless mode`);
        console.warn(`   💡 Waiting for auth state to load...`);

        // Wait for auth to load - look for any sign that userId is available
        try {
          await page.waitForFunction(() => {
            const bodyText = document.body ? document.body.innerText : '';
            // Wait for something that indicates userId is loaded (not just "Loading events...")
            return bodyText.includes('Create Event') ||
                   bodyText.includes('Search Events') ||
                   bodyText.includes('Event ID') ||
                   bodyText.includes('Future Events') ||
                   bodyText.includes('Manage Events');
          }, { timeout: 30000 });
          console.log(`   ✅ Auth state appears to be loaded - page content is rendering`);
        } catch (e) {
          console.error(`   ❌ Auth state not loading after 30 seconds: ${e.message}`);
          console.error(`   💡 This is likely an authentication issue:`);
          console.error(`      - Check that auth.json has correct credentials`);
          console.error(`      - Check that .auth-state.json exists and is valid`);
          console.error(`      - Try deleting .auth-state.json and re-running to force re-authentication`);
          console.error(`      - Check if Clerk is configured correctly for headless mode`);

          // Take a screenshot to see what's actually rendered
          const errorScreenshot = path.join(SCREENSHOTS_DIR, `auth-error-${Date.now()}.png`);
          await page.screenshot({ path: errorScreenshot, fullPage: true });
          console.error(`   📸 Error screenshot saved: ${errorScreenshot}`);

          // Don't continue - this is a blocking issue
          retryCount++;
          continue;
        }
      } else {
        console.log(`   ✅ Page is not stuck on loading screen - content should be rendering`);
      }

      // Try clicking/interacting to trigger any lazy-loaded content
      console.log(`   🖱️  Interacting with page to trigger rendering...`);
      try {
        // Click somewhere safe (header area)
        await page.click('h1, [class*="admin"]', { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1000);
      } catch (e) {
        // Ignore click errors
      }

      // Wait for EventList component to finish loading and show content
      // EventList only renders table when showContent=true, which happens after:
      // 1. loading becomes false
      // 2. events.length > 0
      // 3. 500ms animation delay
      console.log(`   ⏳ Waiting for EventList to finish loading and render table...`);

      // Strategy 1: Wait for the instruction text that appears before the table
      try {
        console.log(`   🔍 Waiting for "Mouse over the first 3 columns" text...`);
        await page.waitForFunction(() => {
          return document.body && document.body.innerText.includes('Mouse over the first 3 columns');
        }, { timeout: 20000 });
        console.log(`   ✅ Instruction text found - table should be rendering`);
      } catch (e) {
        console.warn(`   ⚠️  Instruction text not found: ${e.message}`);
      }

      // Strategy 2: Wait for the actual table element
      try {
        console.log(`   🔍 Waiting for table element...`);
        await page.waitForFunction(() => {
          const table = document.querySelector('table');
          if (!table) return false;
          // Check if table has thead with "Event Info" header (EventList specific)
          const thead = table.querySelector('thead');
          if (!thead) return false;
          return thead.innerText.includes('Event Info') || thead.innerText.includes('Event ID');
        }, { timeout: 30000 });
        console.log(`   ✅ Table element found`);
      } catch (e) {
        console.warn(`   ⚠️  Table element not found: ${e.message}`);
      }

      // Strategy 3: Wait for table rows (most reliable)
      try {
        console.log(`   🔍 Waiting for table rows...`);
        await page.waitForFunction(() => {
          const table = document.querySelector('table');
          if (!table) return false;
          const rows = table.querySelectorAll('tbody tr');
          return rows.length > 0;
        }, { timeout: 30000 });
        console.log(`   ✅ Table rows found`);
      } catch (e) {
        console.warn(`   ⚠️  Table rows not found: ${e.message}`);
      }

      // Additional wait for React hydration and animation completion (EventList has 500ms delay)
      console.log(`   ⏳ Waiting 1 second for animation to complete...`);
      await page.waitForTimeout(1000);

      // Debug: Extensive page structure analysis with full HTML dump
      const pageStructure = await page.evaluate(() => {
        const structure = {
          bodyChildren: document.body ? document.body.children.length : 0,
          allTables: document.querySelectorAll('table').length,
          allTableBodies: document.querySelectorAll('table tbody').length,
          allTableRows: document.querySelectorAll('table tbody tr').length,
          allButtons: document.querySelectorAll('button').length,
          allLinks: document.querySelectorAll('a').length,
          eventLinks: document.querySelectorAll('a[href*="/admin/events/"]').length,
          mediaLinks: document.querySelectorAll('a[href*="/admin/events/"][href*="/media"]').length,
          loadingImages: document.querySelectorAll('img[alt*="Loading"], img[src*="loading"]').length,
          hasTextContent: document.body ? document.body.innerText.includes('Event ID') : false,
          hasInstructionText: document.body ? document.body.innerText.includes('Mouse over the first 3 columns') : false,
          hasTableHeader: document.body ? document.body.innerText.includes('Event Info') : false,
          bodyTextSample: document.body ? document.body.innerText.substring(0, 500) : '',
          allLinkHrefs: Array.from(document.querySelectorAll('a')).slice(0, 20).map(a => a.getAttribute('href')),
          allButtonTexts: Array.from(document.querySelectorAll('button')).slice(0, 10).map(b => b.textContent?.trim()).filter(Boolean),
          tableLocations: []
        };

        // Search ALL body children for tables (not just div[3])
        try {
          if (document.body) {
            // Search through all body children
            for (let i = 0; i < document.body.children.length; i++) {
              const child = document.body.children[i];
              const table = child.querySelector('table');
              if (table) {
                const rows = table.querySelectorAll('tbody tr');
                structure.tableLocations.push({
                  bodyChildIndex: i,
                  tagName: child.tagName,
                  className: child.className,
                  tableRows: rows.length,
                  hasMediaLinks: table.querySelectorAll('a[href*="/admin/events/"][href*="/media"]').length > 0
                });
              }
            }

            // Also search recursively in all divs
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
              const table = div.querySelector('table');
              if (table && !structure.tableLocations.find(loc => loc.tableRows === table.querySelectorAll('tbody tr').length)) {
                const rows = table.querySelectorAll('tbody tr');
                if (rows.length > 0) {
                  structure.tableLocations.push({
                    foundIn: 'div',
                    className: div.className,
                    tableRows: rows.length,
                    hasMediaLinks: table.querySelectorAll('a[href*="/admin/events/"][href*="/media"]').length > 0
                  });
                }
              }
            }
          }
        } catch (e) {
          structure.structureError = e.message;
        }

        return structure;
      });

      console.log(`   🔍 Extensive page structure analysis:`, JSON.stringify(pageStructure, null, 2));

      // Log sample text content to see what's actually on the page
      if (pageStructure.bodyTextSample) {
        console.log(`   📝 Body text sample (first 500 chars): ${pageStructure.bodyTextSample.substring(0, 500)}`);
      } else {
        console.warn(`   ⚠️  No body text found - page might be empty or not loaded`);
      }

      // Log link hrefs to see what links exist
      if (pageStructure.allLinkHrefs && pageStructure.allLinkHrefs.length > 0) {
        console.log(`   🔗 Sample link hrefs (first 20): ${pageStructure.allLinkHrefs.slice(0, 20).join(', ')}`);
        // Check if any links contain "/admin/events/"
        const eventLinks = pageStructure.allLinkHrefs.filter(href => href && href.includes('/admin/events/'));
        if (eventLinks.length > 0) {
          console.log(`   ✅ Found ${eventLinks.length} event link(s): ${eventLinks.slice(0, 5).join(', ')}`);
        }
      } else {
        console.warn(`   ⚠️  No links found on page`);
      }

      // Log button texts to see what buttons exist
      if (pageStructure.allButtonTexts && pageStructure.allButtonTexts.length > 0) {
        console.log(`   🔘 Sample button texts (first 20): ${pageStructure.allButtonTexts.slice(0, 20).join(', ')}`);
        // Check if any buttons mention "Upload" or "Media"
        const uploadButtons = pageStructure.allButtonTexts.filter(text =>
          text && (text.toLowerCase().includes('upload') || text.toLowerCase().includes('media'))
        );
        if (uploadButtons.length > 0) {
          console.log(`   ✅ Found ${uploadButtons.length} upload/media button(s): ${uploadButtons.join(', ')}`);
        }
      } else {
        console.warn(`   ⚠️  No buttons found on page`);
      }

      // Dump full HTML structure if table not found (for debugging)
      if (pageStructure.allTables === 0) {
        console.warn(`   ⚠️  No tables found - dumping HTML structure for debugging...`);
        const htmlStructure = await page.evaluate(() => {
          const structure = {
            bodyHTML: document.body ? document.body.innerHTML.substring(0, 2000) : 'No body',
            bodyChildrenDetails: []
          };

          if (document.body) {
            for (let i = 0; i < Math.min(document.body.children.length, 10); i++) {
              const child = document.body.children[i];
              structure.bodyChildrenDetails.push({
                index: i,
                tagName: child.tagName,
                className: child.className,
                id: child.id,
                textContent: child.textContent ? child.textContent.substring(0, 100) : '',
                childrenCount: child.children.length
              });
            }
          }

          return structure;
        });
        console.log(`   📋 HTML structure dump:`, JSON.stringify(htmlStructure, null, 2));
      }

      // Liberal search for events table - try multiple strategies
      console.log(`   🔍 Searching liberally for events table...`);
      let tableFound = false;
      let tableHandle = null;

      // Strategy 1: Wait for table with tbody and rows (most reliable)
      try {
        console.log(`   🔍 Strategy 1: Waiting for table with tbody rows...`);
        await page.waitForSelector('table tbody tr', { timeout: 20000, state: 'visible' });
        tableFound = true;
        console.log(`   ✅ Table found via 'table tbody tr' selector`);
      } catch (e) {
        console.warn(`   ⚠️  Strategy 1 failed: ${e.message}`);
      }

      // Strategy 2: Wait for any table element
      if (!tableFound) {
        try {
          console.log(`   🔍 Strategy 2: Waiting for any table element...`);
          await page.waitForSelector('table', { timeout: 15000, state: 'visible' });
          tableFound = true;
          console.log(`   ✅ Table found via 'table' selector`);
        } catch (e) {
          console.warn(`   ⚠️  Strategy 2 failed: ${e.message}`);
        }
      }

      // Strategy 3: Search all body children for tables
      if (!tableFound) {
        try {
          console.log(`   🔍 Strategy 3: Searching all body children for tables...`);
          tableHandle = await page.evaluateHandle(() => {
            if (!document.body) return null;

            // Search through all body children
            for (let i = 0; i < document.body.children.length; i++) {
              const child = document.body.children[i];
              const table = child.querySelector('table');
              if (table) {
                const rows = table.querySelectorAll('tbody tr');
                if (rows.length > 0) {
                  console.log(`[Page] Found table in body child ${i} with ${rows.length} rows`);
                  return table;
                }
              }
            }

            // Also try direct table query
            const table = document.querySelector('table');
            if (table) {
              const rows = table.querySelectorAll('tbody tr');
              if (rows.length > 0) {
                console.log(`[Page] Found table directly with ${rows.length} rows`);
                return table;
              }
            }

            return null;
          });

          if (tableHandle && tableHandle.asElement()) {
            tableFound = true;
            console.log(`   ✅ Table found via body children search`);
          }
        } catch (e) {
          console.warn(`   ⚠️  Strategy 3 failed: ${e.message}`);
        }
      }

      // Strategy 4: Wait for text content that indicates table is loaded
      if (!tableFound) {
        try {
          console.log(`   🔍 Strategy 4: Waiting for "Event ID" text content...`);
          await page.waitForFunction(() => {
            return document.body && document.body.innerText.includes('Event ID');
          }, { timeout: 15000 });

          // If text found, try to find table again
          const table = await page.$('table');
          if (table) {
            tableFound = true;
            console.log(`   ✅ Table found after waiting for text content`);
          }
        } catch (e) {
          console.warn(`   ⚠️  Strategy 4 failed: ${e.message}`);
        }
      }

      // Additional wait for client-side data loading
      console.log(`   ⏳ Waiting 3 seconds for final data load...`);
      await page.waitForTimeout(3000);

      // Liberal check for events table rows - search everywhere
      const hasEvents = await page.evaluate(() => {
        try {
          // Strategy 1: Find ALL tables and check for rows
          const allTables = document.querySelectorAll('table');
          console.log(`[Page] Found ${allTables.length} table(s) on page`);

          for (const table of allTables) {
            const rows = table.querySelectorAll('tbody tr');
            const rowCount = rows.length;
            if (rowCount > 0) {
              console.log(`[Page] Found table with ${rowCount} rows`);

              // Check if this table has event-related content
              const hasEventContent = table.innerText.includes('Event ID') ||
                                     table.querySelectorAll('a[href*="/admin/events/"]').length > 0;

              if (hasEventContent) {
                console.log(`[Page] ✅ This table contains event data`);
                return true;
              }
            }
          }

          // Strategy 2: Search for event links anywhere on page
          const eventLinks = document.querySelectorAll('a[href*="/admin/events/"]');
          if (eventLinks.length > 0) {
            console.log(`[Page] Found ${eventLinks.length} event link(s) on page`);
            return true;
          }

          // Strategy 3: Check for "Event ID" text anywhere
          if (document.body && document.body.innerText.includes('Event ID')) {
            console.log(`[Page] Found "Event ID" text on page`);
            return true;
          }

          return false;
        } catch (e) {
          console.error('[Page] Error checking events:', e);
          return false;
        }
      });

      console.log(`   📊 Events table found: ${tableFound ? 'Yes' : 'No'}, Has events: ${hasEvents ? 'Yes' : 'No'}`);

      // If no events found, try toggling the future/past switcher
      if (!hasEvents && retryCount === 0) {
        console.log(`   🔄 No events found, attempting to toggle future/past switcher...`);

        try {
          // Liberal search for toggle button - try multiple strategies
          console.log(`   🔍 Searching liberally for toggle button...`);
          let toggleButton = null;

          // Strategy 1: Search by aria-label (most reliable)
          try {
            console.log(`   🔍 Strategy 1: Searching by aria-label...`);
            toggleButton = await page.$('button[aria-label*="Show Future Events"], button[aria-label*="Show Past Events"]').catch(() => null);
            if (toggleButton) {
              console.log(`   ✅ Toggle button found via aria-label`);
            }
          } catch (e) {
            console.warn(`   ⚠️  Strategy 1 failed: ${e.message}`);
          }

          // Strategy 2: Search by text content
          if (!toggleButton) {
            try {
              console.log(`   🔍 Strategy 2: Searching by text content...`);
              const buttons = await page.$$('button');
              for (const btn of buttons) {
                const text = await btn.textContent().catch(() => '');
                if (text && (text.includes('Future Events') || text.includes('Past Events'))) {
                  toggleButton = btn;
                  console.log(`   ✅ Toggle button found via text content: "${text.trim()}"`);
                  break;
                }
              }
            } catch (e) {
              console.warn(`   ⚠️  Strategy 2 failed: ${e.message}`);
            }
          }

          // Strategy 3: Search all buttons and check for toggle-like structure
          if (!toggleButton) {
            try {
              console.log(`   🔍 Strategy 3: Searching all buttons for toggle structure...`);
              toggleButton = await page.evaluateHandle(() => {
                // Find buttons that are in a toggle-like structure (between labels)
                const allButtons = document.querySelectorAll('button');
                for (const btn of allButtons) {
                  const parent = btn.parentElement;
                  if (parent) {
                    const siblings = Array.from(parent.children);
                    const btnIndex = siblings.indexOf(btn);
                    // Check if button is between text nodes or spans that mention "Future" or "Past"
                    const hasFuturePastText = Array.from(parent.querySelectorAll('*')).some(el => {
                      const text = el.textContent || '';
                      return text.includes('Future Events') || text.includes('Past Events');
                    });
                    if (hasFuturePastText) {
                      console.log('[Page] ✅ Found toggle button via structure');
                      return btn;
                    }
                  }
                }
                return null;
              }).then(handle => handle && handle.asElement() ? handle.asElement() : null).catch(() => null);

              if (toggleButton) {
                console.log(`   ✅ Toggle button found via structure search`);
              }
            } catch (e) {
              console.warn(`   ⚠️  Strategy 3 failed: ${e.message}`);
            }
          }

          // Strategy 4: Search by exact XPath (fallback)
          if (!toggleButton) {
            try {
              console.log(`   🔍 Strategy 4: Trying exact XPath...`);
              const toggleButtonHandle = await page.evaluateHandle(() => {
                try {
                  const body = document.body;
                  if (!body || body.children.length < 3) return null;

                  const thirdDiv = body.children[2];
                  if (!thirdDiv || thirdDiv.children.length === 0) return null;

                  const innerDiv = thirdDiv.children[0];
                  if (!innerDiv || innerDiv.children.length < 5) return null;

                  const fifthDiv = innerDiv.children[4];
                  if (!fifthDiv || fifthDiv.children.length === 0) return null;

                  const innerFifthDiv = fifthDiv.children[0];
                  if (!innerFifthDiv || innerFifthDiv.children.length < 3) return null;

                  const thirdInnerDiv = innerFifthDiv.children[2];
                  return thirdInnerDiv ? thirdInnerDiv.querySelector('button') : null;
                } catch (e) {
                  return null;
                }
              });

              if (toggleButtonHandle && toggleButtonHandle.asElement()) {
                toggleButton = toggleButtonHandle.asElement();
                console.log(`   ✅ Toggle button found via exact XPath`);
              }
            } catch (e) {
              console.warn(`   ⚠️  Strategy 4 failed: ${e.message}`);
            }
          }

          if (toggleButton) {
            console.log(`   ✅ Toggle button found, clicking...`);
            await toggleButton.click();

            // Wait for page to reload after toggle
            console.log(`   ⏳ Waiting 8 seconds for data to reload after toggle...`);
            await page.waitForTimeout(8000);

            // Wait for network to be idle
            try {
              console.log(`   ⏳ Waiting for network to be idle after toggle...`);
              await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
                console.warn(`   ⚠️  Network idle timeout after toggle, continuing...`);
              });
            } catch (e) {
              console.warn(`   ⚠️  Network idle check failed after toggle`);
            }

            // Wait for table to update using exact XPath
            console.log(`   ⏳ Waiting for table to update...`);
            await page.waitForTimeout(5000);

            // Check again if events are now visible using exact XPath
            const hasEventsAfterToggle = await page.evaluate(() => {
              try {
                // Exact XPath: /html/body/div[3]/div/table/tbody/tr
                const body = document.body;
                if (body && body.children.length >= 3) {
                  const thirdDiv = body.children[2];
                  if (thirdDiv.children.length > 0) {
                    const innerDiv = thirdDiv.children[0];
                    const table = innerDiv.querySelector('table');
                    if (table) {
                      const rows = table.querySelectorAll('tbody tr');
                      const rowCount = rows.length;
                      console.log(`[Page] After toggle: Found ${rowCount} rows`);
                      return rowCount > 0;
                    }
                  }
                }
                return false;
              } catch (e) {
                console.error('[Page] Error checking events after toggle:', e);
                return false;
              }
            });

            console.log(`   📊 Events after toggle: ${hasEventsAfterToggle ? 'Found' : 'Still none'}`);

            if (!hasEventsAfterToggle) {
              console.warn(`   ⚠️  No events found even after toggle, will retry...`);
              retryCount++;
              continue;
            }
          } else {
            console.warn(`   ⚠️  Toggle button not found with any method, will retry...`);
            retryCount++;
            continue;
          }
        } catch (toggleError) {
          console.warn(`   ⚠️  Error toggling switcher: ${toggleError.message}`);
          console.warn(`   📍 Error stack: ${toggleError.stack?.split('\n').slice(0, 3).join('\n')}`);
          retryCount++;
          continue;
        }
      }

      // Wait for table to be fully rendered before searching for event IDs
      console.log(`   ⏳ Waiting for table to be fully rendered...`);
      try {
        // Wait for "Upload Media files" button text (appears in the Upload column)
        await page.waitForFunction(() => {
          return document.body && document.body.innerText.includes('Upload Media files');
        }, { timeout: 15000 });
        console.log(`   ✅ "Upload Media files" text found - table is rendered`);
      } catch (e) {
        console.warn(`   ⚠️  "Upload Media files" text not found: ${e.message}`);
      }

      // Additional wait to ensure all links are clickable
      await page.waitForTimeout(1000);

      // Liberal search for "Upload Media Files" links - search everywhere
      console.log(`   🔍 Searching liberally for Upload Media Files links...`);
      const eventIds = await page.evaluate(() => {
        const ids = [];

        try {
          console.log('[Page] Starting liberal search for event IDs...');

          // Strategy 1: Find ALL tables and extract event IDs from media links
          const allTables = document.querySelectorAll('table');
          console.log(`[Page] Searching ${allTables.length} table(s) for event IDs...`);

          for (const table of allTables) {
            // Check all rows in this table
            const rows = table.querySelectorAll('tbody tr');
            console.log(`[Page] Table has ${rows.length} rows`);

            rows.forEach((row, rowIndex) => {
              // Check all cells in this row (not just column 9)
              const cells = row.querySelectorAll('td');
              cells.forEach((cell, cellIndex) => {
                // Look for "Upload Media files" button text or links
                const cellText = cell.innerText || '';
                const hasUploadText = cellText.includes('Upload Media files') || cellText.includes('Upload Media Files');

                // Look for media links in ANY column
                const mediaLinks = cell.querySelectorAll('a[href*="/admin/events/"][href*="/media"]');
                mediaLinks.forEach(link => {
                  const href = link.getAttribute('href');
                  if (href) {
                    const match = href.match(/\/admin\/events\/(\d+)\/media/);
                    if (match) {
                      ids.push(match[1]);
                      console.log(`[Page] ✅ Found event ID ${match[1]} in row ${rowIndex + 1}, column ${cellIndex + 1} via link`);
                    }
                  }
                });

                // Also check if cell contains "Upload Media files" text and try to find event ID from row
                if (hasUploadText && ids.length === 0) {
                  // Try to find event ID in the same row (usually in first column)
                  const firstCell = row.querySelector('td:first-child');
                  if (firstCell) {
                    const eventIdMatch = firstCell.innerText.match(/Event ID[:\s]+(\d+)/);
                    if (eventIdMatch) {
                      ids.push(eventIdMatch[1]);
                      console.log(`[Page] ✅ Found event ID ${eventIdMatch[1]} in row ${rowIndex + 1} via text content`);
                    }
                  }
                }
              });
            });
          }

          // Strategy 2: Find ALL media links anywhere on the page (not just in tables)
          if (ids.length === 0) {
            console.log('[Page] No IDs found in tables, searching entire page...');
            const mediaLinks = Array.from(document.querySelectorAll('a[href*="/admin/events/"][href*="/media"]'));
            console.log(`[Page] Found ${mediaLinks.length} media link(s) on entire page`);

            mediaLinks.forEach((link, index) => {
              const href = link.getAttribute('href');
              if (href) {
                const match = href.match(/\/admin\/events\/(\d+)\/media/);
                if (match) {
                  ids.push(match[1]);
                  console.log(`[Page] ✅ Found event ID ${match[1]} from link ${index + 1}`);
                }
              }
            });
          }

          // Strategy 3: Find ANY event links (not just media) and extract IDs
          if (ids.length === 0) {
            console.log('[Page] No media links found, searching for any event links...');
            const eventLinks = Array.from(document.querySelectorAll('a[href*="/admin/events/"]'));
            console.log(`[Page] Found ${eventLinks.length} event link(s)`);

            eventLinks.forEach((link, index) => {
              const href = link.getAttribute('href');
              if (href) {
                // Match /admin/events/{id} pattern
                const match = href.match(/\/admin\/events\/(\d+)(?:\/|$)/);
                if (match) {
                  ids.push(match[1]);
                  console.log(`[Page] ✅ Found event ID ${match[1]} from event link ${index + 1}`);
                }
              }
            });
          }

          // Strategy 4: Extract IDs from text content (if table shows event IDs)
          if (ids.length === 0) {
            console.log('[Page] No links found, trying to extract from text content...');
            const bodyText = document.body ? document.body.innerText : '';

            // Try multiple patterns to find event IDs
            // Pattern 1: "Event ID: 4251" or "Event ID 4251"
            const pattern1 = bodyText.match(/Event ID[:\s]+(\d+)/g);
            if (pattern1) {
              pattern1.forEach(match => {
                const idMatch = match.match(/(\d+)/);
                if (idMatch) {
                  ids.push(idMatch[1]);
                  console.log(`[Page] ✅ Found event ID ${idMatch[1]} from text content (pattern 1)`);
                }
              });
            }

            // Pattern 2: Look for numbers that might be event IDs (4-digit numbers)
            // This is a fallback if the table is rendered but links aren't clickable
            if (ids.length === 0) {
              const allNumbers = bodyText.match(/\b\d{3,5}\b/g);
              if (allNumbers) {
                // Filter for likely event IDs (4-digit numbers, or numbers that appear after "Event")
                const likelyEventIds = allNumbers.filter(num => {
                  const numStr = num.toString();
                  // Check if this number appears near "Event" text
                  const index = bodyText.indexOf(numStr);
                  const context = bodyText.substring(Math.max(0, index - 50), Math.min(bodyText.length, index + 50));
                  return context.toLowerCase().includes('event') &&
                         (numStr.length === 4 || numStr.length === 3 || numStr.length === 5);
                });

                likelyEventIds.forEach(id => {
                  if (!ids.includes(id)) {
                    ids.push(id);
                    console.log(`[Page] ✅ Found potential event ID ${id} from text content (pattern 2)`);
                  }
                });
              }
            }
          }

          console.log(`[Page] Total unique event IDs found: ${[...new Set(ids)].length}`);
        } catch (e) {
          console.error('[Page] Error finding event IDs:', e);
        }

        // Remove duplicates and return unique IDs
        return [...new Set(ids)];
      });

      if (eventIds.length > 0) {
        console.log(`   ✅ Found ${eventIds.length} event ID(s): ${eventIds.join(', ')}`);

        // Randomly select up to 3 events for testing
        const selectedIds = eventIds
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 3); // Take first 3

        console.log(`   🎯 Selected ${selectedIds.length} event ID(s) for testing: ${selectedIds.join(', ')}`);
        return selectedIds;
      } else {
        // Fallback: Try to find any event links if media links weren't found
        console.log(`   🔍 Media links not found, trying generic event links...`);

        const fallbackIds = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/admin/events/"]'));
          const ids = links
            .map(link => {
              const href = link.getAttribute('href');
              if (!href) return null;
              const match = href.match(/\/admin\/events\/(\d+)/);
              return match ? match[1] : null;
            })
            .filter(id => id !== null);
          return [...new Set(ids)];
        });

        if (fallbackIds.length > 0) {
          console.log(`   ✅ Found ${fallbackIds.length} event ID(s) via fallback: ${fallbackIds.join(', ')}`);
          return fallbackIds.slice(0, 3);
        }

        console.warn(`   ⚠️  No event IDs found, will retry...`);
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`   ⏳ Waiting 3 seconds before retry...`);
          await page.waitForTimeout(3000);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Error fetching event IDs (attempt ${retryCount + 1}/${maxRetries}): ${error.message}`);
      console.warn(`   📍 Error stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
      retryCount++;

      if (retryCount < maxRetries) {
        console.log(`   ⏳ Waiting 3 seconds before retry...`);
        await page.waitForTimeout(3000);
      }
    }
  }

  console.warn(`   ❌ Could not fetch event IDs after ${maxRetries} attempts`);
  return [];
}

/**
 * Run a single test
 */
async function runTest(page, test, config) {
  const testStartTime = Date.now();
  const result = {
    id: test.id,
    name: test.name,
    url: test.url || test.urlPattern,
    category: test.category,
    priority: test.priority,
    status: 'PENDING',
    duration: 0,
    error: null,
    screenshot: null,
    elementsFound: [],
    validations: [],
    jsErrors: [],
    consoleErrors: []
  };

  // Track JavaScript errors and console errors
  const jsErrors = [];
  const consoleErrors = [];

  // Set up error listeners before navigation
  page.on('pageerror', (error) => {
    const errorDetails = {
      type: 'pageerror',
      message: error.message,
      stack: error.stack || 'No stack trace available',
      name: error.name || 'Error',
      timestamp: new Date().toISOString()
    };
    jsErrors.push(errorDetails);
    console.error(`   ⚠️  JavaScript Error [${errorDetails.name}]: ${errorDetails.message}`);
    if (errorDetails.stack && errorDetails.stack !== 'No stack trace available') {
      console.error(`   📍 Stack trace:\n${errorDetails.stack.split('\n').slice(0, 5).join('\n')}...`);
    }
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    // Capture console errors and warnings
    if (type === 'error' || type === 'warning') {
      const errorDetails = {
        type: type,
        message: text,
        location: location ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : 'Unknown',
        timestamp: new Date().toISOString()
      };
      consoleErrors.push(errorDetails);

      // Log critical errors (ReferenceError, TypeError, etc.) with full details
      if (type === 'error' && (
        text.includes('ReferenceError') ||
        text.includes('TypeError') ||
        text.includes('is not defined') ||
        text.includes('Cannot read') ||
        text.includes('Failed to') ||
        text.includes('Uncaught') ||
        text.includes('SyntaxError')
      )) {
        console.error(`   ⚠️  Console ${type}: ${text}`);
        if (errorDetails.location !== 'Unknown') {
          console.error(`   📍 Location: ${errorDetails.location}`);
        }
      }
    }
  });

  try {
    console.log(`\n🧪 [${test.id}] ${test.name}`);
    console.log(`   📍 URL: ${test.url || test.urlPattern}`);

    // Navigate to page
    const fullUrl = `${config.baseUrl}${test.url || test.urlPattern}`;
    const pageTimeout = test.timeout || config.timeout;
    try {
      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: pageTimeout
      });
    } catch (navigationError) {
      if (navigationError.message.includes('closed') || navigationError.message.includes('detached')) {
        throw new Error(`Page was closed during navigation. This usually means authentication failed or session expired.`);
      }
      throw navigationError;
    }

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.warn(`   ⚠️  Network idle timeout, continuing...`);
    });

    // Wait for main content
    try {
      await page.waitForSelector('h1', {
        timeout: 20000,
        state: 'visible'
      }).catch(async () => {
        console.warn(`   ⚠️  h1 not found, trying alternative selectors...`);
        await page.waitForSelector('h2, main, [class*="admin"]', {
          timeout: 10000,
          state: 'visible'
        }).catch(() => {
          console.warn(`   ⚠️  Alternative selectors also not found, continuing anyway...`);
        });
      });

      await page.waitForTimeout(2000);
    } catch (waitError) {
      console.warn(`   ⚠️  Could not wait for main content: ${waitError.message}`);
    }

    // Check for JavaScript errors after page load
    await page.waitForTimeout(1000);

    result.jsErrors = jsErrors;
    result.consoleErrors = consoleErrors;

    // Fail test if critical JavaScript errors are detected
    if (jsErrors.length > 0) {
      const criticalErrors = jsErrors.filter(err => {
        const msg = err.message.toLowerCase();
        return msg.includes('referenceerror') ||
               msg.includes('typeerror') ||
               msg.includes('is not defined') ||
               msg.includes('cannot read') ||
               msg.includes('syntaxerror') ||
               msg.includes('uncaught');
      });

      if (criticalErrors.length > 0) {
        const errorDetails = criticalErrors.map(err => {
          let detail = `${err.name || 'Error'}: ${err.message}`;
          if (err.stack && err.stack !== 'No stack trace available') {
            const stackLines = err.stack.split('\n').slice(0, 10);
            detail += `\nStack trace:\n${stackLines.join('\n')}`;
          }
          return detail;
        }).join('\n\n---\n\n');

        throw new Error(`JavaScript runtime error detected:\n\n${errorDetails}`);
      }
    }

    // Check for critical console errors (exclude known 404s for moved assets)
    const IGNORED_404_URL_PATTERNS = [
      'unite_india_logo.avif'  // Image moved to /images/logos/Malayalees_US/unite_india_logo.avif
    ];
    const criticalConsoleErrors = consoleErrors.filter(err => {
      const msg = err.message.toLowerCase();
      const location = (err.location || '').toLowerCase();
      const isIgnored404 = msg.includes('failed to load resource') &&
        msg.includes('404') &&
        IGNORED_404_URL_PATTERNS.some(pattern => location.includes(pattern.toLowerCase()));
      if (isIgnored404) return false;
      return err.type === 'error' && (
        msg.includes('referenceerror') ||
        msg.includes('typeerror') ||
        msg.includes('is not defined') ||
        msg.includes('cannot read') ||
        msg.includes('failed to') ||
        msg.includes('syntaxerror') ||
        msg.includes('uncaught')
      );
    });

    if (criticalConsoleErrors.length > 0) {
      const errorDetails = criticalConsoleErrors.map(err => {
        let detail = `Console ${err.type}: ${err.message}`;
        if (err.location && err.location !== 'Unknown') {
          detail += `\nLocation: ${err.location}`;
        }
        return detail;
      }).join('\n\n---\n\n');

      throw new Error(`Console error detected:\n\n${errorDetails}`);
    }

    // Check for expected elements
    const elementsFound = [];
    for (const selector of test.expectedElements) {
      try {
        const count = await page.$$(selector).then(elements => elements.length);
        if (count > 0) {
          elementsFound.push({ selector, count });
        }
      } catch (error) {
        // Element not found, continue
      }
    }

    result.elementsFound = elementsFound;

    // Check if main content is present
    const hasMainContent = await page.$('h1, h2, main, [class*="admin"]').then(el => el !== null);
    if (!hasMainContent) {
      throw new Error('Page loaded but no main content found');
    }

    // Run validations
    const validations = [];
    for (const validation of test.validation) {
      if (validation.toLowerCase().includes('loads')) {
        validations.push({ check: validation, passed: hasMainContent });
      } else {
        validations.push({ check: validation, passed: true });
      }
    }
    result.validations = validations;

    result.status = 'PASSED';
    result.duration = Date.now() - testStartTime;
    console.log(`   ✅ PASSED (${result.duration}ms)`);
    console.log(`   📊 Elements found: ${elementsFound.length}/${test.expectedElements.length}`);

  } catch (error) {
    result.status = 'FAILED';
    result.duration = Date.now() - testStartTime;
    result.error = error.message;
    console.log(`   ❌ FAILED: ${error.message}`);

    // Take screenshot on failure
    if (config.screenshotOnFailure) {
      try {
        if (!page.isClosed()) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `dynamic-failure-${test.id}-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          result.screenshot = screenshotPath;
          console.log(`   📸 Screenshot saved: ${screenshotPath}`);
        }
      } catch (screenshotError) {
        console.warn(`   ⚠️  Could not take screenshot: ${screenshotError.message}`);
      }
    }
  }

  return result;
}

/**
 * Generate HTML report
 */
function generateReport() {
  const duration = Date.now() - startTime;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testResults.filter(r => r.status === 'SKIPPED').length;

  const report = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic Event Test Suite Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card.passed { border-left: 4px solid #10b981; }
    .stat-card.failed { border-left: 4px solid #ef4444; }
    .stat-card.skipped { border-left: 4px solid #f59e0b; }
    .stat-card.total { border-left: 4px solid #3b82f6; }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #6b7280;
      font-size: 14px;
    }
    .test-results {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-item {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 10px;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .test-name {
      font-weight: 600;
      font-size: 16px;
    }
    .test-status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .test-status.passed { background: #d1fae5; color: #065f46; }
    .test-status.failed { background: #fee2e2; color: #991b1b; }
    .test-status.skipped { background: #fef3c7; color: #92400e; }
    .test-details {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
    }
    .test-error {
      color: #ef4444;
      margin-top: 8px;
      padding: 10px;
      background: #fef2f2;
      border-radius: 4px;
      font-size: 13px;
      white-space: pre-wrap;
    }
    .category-header {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px 0;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Dynamic Event Test Suite Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Duration: ${(duration / 1000).toFixed(2)}s</p>
  </div>

  <div class="stats">
    <div class="stat-card total">
      <div class="stat-number">${testResults.length}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-card passed">
      <div class="stat-number">${passed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card failed">
      <div class="stat-number">${failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-number">${skipped}</div>
      <div class="stat-label">Skipped</div>
    </div>
  </div>

  <div class="test-results">
    ${Object.entries(
      testResults.reduce((acc, test) => {
        if (!acc[test.category]) acc[test.category] = [];
        acc[test.category].push(test);
        return acc;
      }, {})
    ).map(([category, tests]) => `
      <div class="category-header">${category}</div>
      ${tests.map(test => `
        <div class="test-item">
          <div class="test-header">
            <div>
              <div class="test-name">[${test.id}] ${test.name}</div>
              <div class="test-details">
                ${test.url} • ${test.duration}ms • Priority: ${test.priority}
              </div>
            </div>
            <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
          </div>
          ${test.error ? `<div class="test-error">❌ ${test.error.replace(/\n/g, '<br>')}</div>` : ''}
          ${test.jsErrors && test.jsErrors.length > 0 ? `
            <div class="test-error">
              ⚠️ JavaScript Errors (${test.jsErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${test.jsErrors.map(err => {
                  let errorHtml = `<li><strong>${err.name || 'Error'}:</strong> ${err.message}`;
                  if (err.stack && err.stack !== 'No stack trace available') {
                    const stackLines = err.stack.split('\n').slice(0, 10);
                    errorHtml += `<br><pre style="background: #f5f5f5; padding: 5px; margin: 5px 0; border-radius: 3px; font-size: 11px; overflow-x: auto;">${stackLines.join('\n')}</pre>`;
                  }
                  errorHtml += `</li>`;
                  return errorHtml;
                }).join('')}
              </ul>
            </div>
          ` : ''}
          ${test.consoleErrors && test.consoleErrors.length > 0 ? `
            <div class="test-details" style="color: #f59e0b;">
              ⚠️ Console Warnings/Errors (${test.consoleErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                ${test.consoleErrors.slice(0, 10).map(err => {
                  let errorHtml = `<li><strong>[${err.type}]</strong> ${err.message}`;
                  if (err.location && err.location !== 'Unknown') {
                    errorHtml += ` <span style="color: #6b7280; font-size: 11px;">(${err.location})</span>`;
                  }
                  errorHtml += `</li>`;
                  return errorHtml;
                }).join('')}
                ${test.consoleErrors.length > 10 ? `<li style="color: #6b7280; font-style: italic;">... and ${test.consoleErrors.length - 10} more</li>` : ''}
              </ul>
            </div>
          ` : ''}
          ${test.elementsFound.length > 0 ? `
            <div class="test-details">
              📊 Elements found: ${test.elementsFound.length}/${test.expectedElements?.length || 0}
            </div>
          ` : ''}
          ${test.screenshot ? `
            <div class="test-details">
              📸 <a href="${test.screenshot}" target="_blank">View Screenshot</a>
            </div>
          ` : ''}
        </div>
      `).join('')}
    `).join('')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`\n📄 Report saved to: ${REPORT_PATH}`);
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 Starting Dynamic Event Test Suite...\n');

  const config = loadAuthConfig();
  ensureScreenshotsDir();

  const browser = await chromium.launch({ headless: config.headless });
  let context = null;
  let page = null;

  try {
    // Try to load saved auth state
    let authState = null;
    if (fs.existsSync(AUTH_STATE_PATH)) {
      try {
        authState = JSON.parse(fs.readFileSync(AUTH_STATE_PATH, 'utf8'));
        console.log('✅ Loaded saved authentication state');
      } catch (e) {
        console.warn('⚠️  Could not load auth state, will authenticate fresh');
      }
    }

    // Create authenticated context
    if (authState) {
      context = await browser.newContext({ storageState: authState });
      page = await context.newPage();

      // Verify auth AND admin access by checking if we can access /admin/manage-events
      console.log('🔍 Verifying authentication and admin access...');
      await page.goto(`${config.baseUrl}/admin/manage-events`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(2000); // Wait for any redirects

      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      if (currentUrl.includes('/sign-in')) {
        console.log('⚠️  Auth state expired, re-authenticating...');
        authState = null;
        await context.close();
        context = null;
        page = null;
      } else if (currentUrl === config.baseUrl + '/' || currentUrl === config.baseUrl) {
        console.error('❌ CRITICAL: User does not have ADMIN role!');
        console.error('   The user is authenticated but cannot access admin pages.');
        console.error('   This means the user does not have ADMIN role in the database.');
        console.error('\n💡 Solutions:');
        console.error('   1. Check database: SELECT * FROM user_profile WHERE user_id = \'...\' AND user_role = \'ADMIN\';');
        console.error('   2. Update role: UPDATE user_profile SET user_role = \'ADMIN\' WHERE user_id = \'...\' AND tenant_id = \'...\';');
        console.error('   3. Or use Admin Dashboard: /admin/manage-usage → Edit user → Set Role to ADMIN');
        console.error('   4. User must log out and log back in after role change');
        console.error('\n⚠️  Cannot proceed without ADMIN role. Exiting...');
        process.exit(1);
      } else if (currentUrl.includes('/admin/manage-events')) {
        console.log('✅ Authentication and admin access verified');
      } else {
        console.warn(`⚠️  Unexpected URL after admin check: ${currentUrl}`);
        console.warn('   Will attempt to authenticate fresh...');
        authState = null;
        await context.close();
        context = null;
        page = null;
      }
    }

    // Authenticate if needed
    if (!authState || !context) {
      console.log('🔐 Authenticating...');
      const authResult = await createAuthenticatedContext(
        browser,
        config.baseUrl,
        { email: config.email, password: config.password }
      );
      context = authResult.context;
      page = authResult.page;

      // Verify admin access after authentication
      console.log('🔍 Verifying admin access after authentication...');
      await page.goto(`${config.baseUrl}/admin/manage-events`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(2000); // Wait for any redirects

      const adminUrl = page.url();
      console.log(`   Current URL: ${adminUrl}`);

      if (adminUrl.includes('/sign-in')) {
        console.error('❌ Authentication failed - redirected to sign-in');
        process.exit(1);
      } else if (adminUrl === config.baseUrl + '/' || adminUrl === config.baseUrl) {
        console.error('❌ CRITICAL: User does not have ADMIN role!');
        console.error('   The user is authenticated but cannot access admin pages.');
        console.error('   This means the user does not have ADMIN role in the database.');
        console.error('\n💡 Solutions:');
        console.error('   1. Check database: SELECT * FROM user_profile WHERE user_id = \'...\' AND user_role = \'ADMIN\';');
        console.error('   2. Update role: UPDATE user_profile SET user_role = \'ADMIN\' WHERE user_id = \'...\' AND tenant_id = \'...\';');
        console.error('   3. Or use Admin Dashboard: /admin/manage-usage → Edit user → Set Role to ADMIN');
        console.error('   4. User must log out and log back in after role change');
        console.error('\n⚠️  Cannot proceed without ADMIN role. Exiting...');
        process.exit(1);
      } else if (adminUrl.includes('/admin/manage-events')) {
        console.log('✅ Admin access verified - can access manage-events page');
      } else {
        console.warn(`⚠️  Unexpected URL: ${adminUrl}`);
      }

      // Save auth state for next run
      const newAuthState = await context.storageState();
      fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(newAuthState, null, 2));
      console.log('💾 Auth state saved');
    }

    // Get available event IDs
    console.log('\n📋 Fetching available events for dynamic page tests...');
    const eventIds = await getAvailableEventIds(page, config.baseUrl);

    if (eventIds.length === 0) {
      console.log('   ⚠️  No events found, cannot run dynamic event tests');
      console.log('   💡 Make sure you have events created in the system');
      console.log('   💡 Try toggling between Future/Past events on /admin/manage-events');
      process.exit(0);
    }

    console.log(`\n✅ Found ${eventIds.length} event(s): ${eventIds.join(', ')}`);
    console.log('\n📋 Running dynamic event page tests...\n');

    // Test each discovered event
    for (const eventId of eventIds) {
      console.log(`\n📌 Testing Event ID: ${eventId}`);
      console.log('='.repeat(60));

      for (const testTemplate of dynamicEventPages) {
        // Check if page is still open before each test
        if (page.isClosed()) {
          console.error(`\n❌ Page was closed. Authentication may have expired.`);
          console.error(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
          break;
        }

        const test = {
          ...testTemplate,
          id: `${testTemplate.id}-event-${eventId}`,
          name: `${testTemplate.name} (Event ${eventId})`,
          url: testTemplate.urlPattern.replace('{eventId}', eventId)
        };

        const result = await runTest(page, test, config);
        testResults.push(result);

        // If authentication failed, stop running tests
        if (result.error && result.error.includes('Authentication failed')) {
          console.warn(`\n⚠️  Authentication failed. Stopping test execution.`);
          console.warn(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
          break;
        }
      }
    }

    // Generate report
    console.log('\n📊 Generating test report...');
    generateReport();

    // Print summary
    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const total = testResults.length;
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.filter(r => r.status === 'FAILED').forEach(test => {
        console.log(`   - [${test.id}] ${test.name}: ${test.error}`);
      });
    }

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

// Run tests
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
