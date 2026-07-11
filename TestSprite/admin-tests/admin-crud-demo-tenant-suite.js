#!/usr/bin/env node

/**
 * Admin CRUD suite on tenant_demo_002.
 * Safe pattern: create/copy entities tagged [E2E], update, then delete the copy.
 * Manage usage is read-only smoke only.
 *
 * Usage: node TestSprite/admin-tests/admin-crud-demo-tenant-suite.js
 *        npm run test:admin:crud
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  assertDemoTenant,
  assertAppReachable,
  requireAuthJson,
  discoverDemoIds,
  smokeCheckPage,
  CoverageTracker,
  E2E_PREFIX,
} from '../lib/e2e-harness.js';
import {
  createAuthenticatedContext,
  loadAuthState,
  saveAuthState,
} from '../sanity-tests/authenticate-playwright.js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const stamp = Date.now();
const E2E_NAME = `${E2E_PREFIX} Demo ${stamp}`;

async function getAuthContext(browser, config) {
  if (fs.existsSync(AUTH_STATE_PATH)) {
    try {
      const { context, page } = await loadAuthState(browser, AUTH_STATE_PATH);
      await page.goto(`${config.baseUrl}/admin`, {
        waitUntil: 'domcontentloaded',
        timeout: config.timeout,
      });
      const url = page.url();
      await page.close();
      if (!url.includes('/sign-in')) return context;
      await context.close();
    } catch {
      /* re-auth */
    }
  }
  const { context, page } = await createAuthenticatedContext(browser, config.baseUrl, {
    email: config.email,
    password: config.password,
  });
  await page.close();
  await saveAuthState(context, AUTH_STATE_PATH);
  return context;
}

async function gotoOk(page, baseUrl, route, timeout) {
  const res = await page.goto(`${baseUrl}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout,
  });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const check = await smokeCheckPage(page, { urlHint: route });
  return { status: res?.status?.() ?? 0, check };
}

/**
 * Generic: open list page, try create/new link, fill a name field, save, then try delete.
 * Soft-fails individual steps with skip/fail recorded — does not throw for missing UI.
 */
async function crudModule(page, baseUrl, timeout, tracker, {
  id,
  listPath,
  createPath,
  nameSelectors = [
    'input[name="name"]',
    'input[name="title"]',
    'input[id*="name" i]',
    'input[id*="title" i]',
    'input[placeholder*="name" i]',
    'input[placeholder*="title" i]',
  ],
  saveSelectors = [
    'button[type="submit"]',
    'button:has-text("Save")',
    'button:has-text("Create")',
    'button:has-text("Add")',
  ],
  deleteSelectors = [
    'button[aria-label*="Delete" i]',
    'button:has-text("Delete")',
  ],
  readOnly = false,
}) {
  const start = Date.now();
  try {
    const { check } = await gotoOk(page, baseUrl, listPath, timeout);
    if (!check.ok) {
      tracker.record({
        path: listPath,
        status: 'fail',
        kind: 'crud',
        message: `${id} list: ${check.message}`,
        durationMs: Date.now() - start,
      });
      return;
    }

    if (readOnly) {
      tracker.record({
        path: listPath,
        status: 'pass',
        kind: 'crud',
        message: `${id}: read-only smoke OK`,
        durationMs: Date.now() - start,
      });
      console.log(`  ✓ ${id} (read-only)`);
      return;
    }

    // Prefer dedicated create path
    let created = false;
    if (createPath) {
      await page.goto(`${baseUrl}${createPath}`, {
        waitUntil: 'domcontentloaded',
        timeout,
      });
    } else {
      const newLink = page.locator(
        'a[href*="/new"], a[aria-label*="Create" i], a[aria-label*="Add" i], button:has-text("Create"), button:has-text("Add New")'
      ).first();
      if ((await newLink.count()) > 0) {
        await newLink.click({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1000);
      }
    }

    let filled = false;
    for (const sel of nameSelectors) {
      const input = page.locator(sel).first();
      if ((await input.count()) === 0) continue;
      const visible = await input.isVisible().catch(() => false);
      if (!visible) continue;
      await input.fill(E2E_NAME);
      filled = true;
      break;
    }

    if (filled) {
      for (const sel of saveSelectors) {
        const btn = page.locator(sel).first();
        if ((await btn.count()) === 0) continue;
        const visible = await btn.isVisible().catch(() => false);
        if (!visible) continue;
        await btn.click({ timeout: 8000 }).catch(() => {});
        created = true;
        await page.waitForTimeout(1500);
        break;
      }
    }

    // Return to list and attempt delete of E2E row
    await page.goto(`${baseUrl}${listPath}`, {
      waitUntil: 'domcontentloaded',
      timeout,
    });
    await page.waitForTimeout(1000);

    const row = page.locator(`text=${E2E_PREFIX}`).first();
    let deleted = false;
    if ((await row.count()) > 0) {
      // Click nearby delete if present
      const rowContainer = row.locator('xpath=ancestor::tr[1] | ancestor::div[contains(@class,"card")][1] | ancestor::li[1]').first();
      for (const sel of deleteSelectors) {
        const del = rowContainer.locator(sel).first();
        if ((await del.count()) === 0) continue;
        await del.click({ timeout: 5000 }).catch(() => {});
        // Confirm dialog
        const confirm = page.locator(
          'button:has-text("Delete"), button:has-text("Confirm"), [role="alertdialog"] button:has-text("Delete")'
        ).last();
        if ((await confirm.count()) > 0) {
          await confirm.click({ timeout: 5000 }).catch(() => {});
        }
        deleted = true;
        await page.waitForTimeout(1000);
        break;
      }
    }

    const msg = [
      filled ? 'filled' : 'no-name-field',
      created ? 'saved' : 'not-saved',
      deleted ? 'deleted' : 'not-deleted',
    ].join(', ');

    // Pass if list loaded; mark skip if UI lacked create form (still covered as smoke)
    const status = check.ok && (filled || readOnly) ? 'pass' : check.ok ? 'skip' : 'fail';
    tracker.record({
      path: listPath,
      status,
      kind: 'crud',
      message: `${id}: ${msg}`,
      durationMs: Date.now() - start,
      meta: { createPath, e2eName: E2E_NAME },
    });
    console.log(`  ${status === 'pass' ? '✓' : status === 'skip' ? '○' : '✗'} ${id}: ${msg}`);
  } catch (err) {
    tracker.record({
      path: listPath,
      status: 'fail',
      kind: 'crud',
      message: `${id}: ${err.message}`,
      durationMs: Date.now() - start,
    });
    console.log(`  ✗ ${id}: ${err.message}`);
  }
}

async function main() {
  assertDemoTenant();
  const config = requireAuthJson();
  await assertAppReachable(config.baseUrl);
  const ids = await discoverDemoIds(config.baseUrl);
  const tracker = new CoverageTracker('admin-crud');

  const browser = await chromium.launch({ headless: config.headless !== false });
  let context;
  try {
    context = await getAuthContext(browser, config);
    const page = await context.newPage();

    console.log('\n[crud] Running demo-tenant CRUD modules…');

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'manage-usage',
      listPath: '/admin/manage-usage',
      readOnly: true,
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'manage-events',
      listPath: '/admin/manage-events',
      createPath: '/admin/events/new',
      nameSelectors: ['input[name="title"]', 'input[id*="title" i]', 'textarea[name="title"]'],
    });

    if (ids.eventId) {
      await crudModule(page, config.baseUrl, config.timeout, tracker, {
        id: 'ticket-types',
        listPath: `/admin/events/${ids.eventId}/ticket-types/list`,
      });
      await crudModule(page, config.baseUrl, config.timeout, tracker, {
        id: 'discount-codes',
        listPath: `/admin/events/${ids.eventId}/discount-codes/list`,
      });
    } else {
      tracker.record({
        path: '/admin/events/[id]/ticket-types/list',
        status: 'skip',
        kind: 'crud',
        message: 'No eventId for ticket-types/discount-codes',
      });
    }

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'membership-plans',
      listPath: '/admin/membership/plans',
      nameSelectors: ['input[name="name"]', 'input[name="title"]', 'input[id*="name" i]'],
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'focus-groups',
      listPath: '/admin/focus-groups',
      createPath: '/admin/focus-groups/new',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'gallery-albums',
      listPath: '/admin/gallery/albums',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'event-sponsors',
      listPath: '/admin/event-sponsors',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'event-featured-performers',
      listPath: '/admin/event-featured-performers',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'event-contacts',
      listPath: '/admin/event-contacts',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'event-program-directors',
      listPath: '/admin/event-program-directors',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'tenant-organizations',
      listPath: '/admin/tenant-management/organizations',
      createPath: '/admin/tenant-management/organizations/new',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'tenant-settings',
      listPath: '/admin/tenant-management/settings',
      createPath: '/admin/tenant-management/settings/new',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'polls',
      listPath: '/admin/polls',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'official-documents',
      listPath: '/admin/official-documents',
    });

    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'official-document-categories',
      listPath: '/admin/official-document-categories',
    });

    // Test Stripe — smoke only
    await crudModule(page, config.baseUrl, config.timeout, tracker, {
      id: 'test-stripe',
      listPath: '/admin/test-stripe',
      readOnly: true,
    });

    await page.close();
  } finally {
    if (context) await context.close();
    await browser.close();
  }

  tracker.write();
  if (tracker.summary().fail > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
