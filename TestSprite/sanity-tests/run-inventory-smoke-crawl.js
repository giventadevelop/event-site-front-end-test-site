#!/usr/bin/env node

/**
 * Inventory-driven smoke crawl for all routes (or a kind filter).
 *
 * Usage:
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --kind=admin
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --kind=mosc-redesign
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --kind=public,mosc,mosc-redesign
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --exclude=mosc-old
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --limit=50
 *
 * Admin kinds require auth.json. Public/MOSC kinds do not.
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  assertDemoTenant,
  assertAppReachable,
  loadInventory,
  resolveBaseUrl,
  requireAuthJson,
  loadAuthJson,
  discoverDemoIds,
  resolveDynamicPath,
  smokeCheckPage,
  CoverageTracker,
  ADMIN_HOME_BUTTONS,
  shouldSkipSmokePath,
} from '../lib/e2e-harness.js';
import {
  createAuthenticatedContext,
  loadAuthState,
  saveAuthState,
} from './authenticate-playwright.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_STATE_PATH = path.join(__dirname, '../admin-tests/.auth-state.json');
/** Log a heartbeat while a single route is still loading (ms). */
const ROUTE_HEARTBEAT_MS = 15000;

function startRouteHeartbeat(tested, total, target, start) {
  return setInterval(() => {
    const sec = Math.round((Date.now() - start) / 1000);
    console.log(`  … still on (${tested}/${total}) ${target} (${sec}s)`);
  }, ROUTE_HEARTBEAT_MS);
}

function parseListArg(prefix) {
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (!arg) return null;
  return arg
    .slice(prefix.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseKinds() {
  return parseListArg('--kind=');
}

function parseExclude() {
  return parseListArg('--exclude=') || [];
}

function parseLimit() {
  const arg = process.argv.find((a) => a.startsWith('--limit='));
  if (!arg) return Infinity;
  const n = parseInt(arg.slice('--limit='.length), 10);
  return Number.isFinite(n) && n > 0 ? n : Infinity;
}

function needsAuth(kinds, exclude) {
  // Full run (no --kind) includes admin unless excluded
  if (!kinds) return !exclude.includes('admin');
  return kinds.includes('admin');
}

async function getAuthContext(browser, config) {
  const fs = await import('fs');
  if (fs.existsSync(AUTH_STATE_PATH)) {
    try {
      const { context, page } = await loadAuthState(browser, AUTH_STATE_PATH);
      await page.goto(`${config.baseUrl}/admin`, {
        waitUntil: 'domcontentloaded',
        timeout: config.timeout,
      });
      const url = page.url();
      await page.close();
      if (!url.includes('/sign-in')) {
        console.log('[smoke] Reusing saved auth state');
        return context;
      }
      await context.close();
      console.log('[smoke] Saved auth invalid — re-authenticating');
    } catch (err) {
      console.log(`[smoke] Could not load auth state: ${err.message}`);
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

async function runAdminHomeButtons(page, baseUrl, tracker, timeout) {
  console.log('\n[smoke] Admin home button click-through…');
  for (const btn of ADMIN_HOME_BUTTONS) {
    const start = Date.now();
    try {
      await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded', timeout });
      const link = page.locator(`a[href="${btn.href}"]`).first();
      const count = await link.count();
      if (count === 0) {
        // Direct navigation fallback
        await page.goto(`${baseUrl}${btn.href}`, { waitUntil: 'domcontentloaded', timeout });
      } else {
        await Promise.all([
          page.waitForURL((u) => u.pathname.startsWith(btn.href.split('?')[0]) || true, {
            timeout: timeout,
          }).catch(() => {}),
          link.click({ timeout: 10000 }),
        ]);
        await page.waitForTimeout(500);
        if (!page.url().includes(btn.href.replace(/\/$/, ''))) {
          await page.goto(`${baseUrl}${btn.href}`, { waitUntil: 'domcontentloaded', timeout });
        }
      }
      const check = await smokeCheckPage(page, { urlHint: btn.href });
      tracker.record({
        path: btn.href,
        status: check.ok ? 'pass' : 'fail',
        kind: 'admin-home-button',
        message: check.ok ? `Button: ${btn.label}` : check.message,
        durationMs: Date.now() - start,
        meta: { label: btn.label },
      });
      console.log(`  ${check.ok ? '✓' : '✗'} ${btn.label} → ${btn.href}`);
    } catch (err) {
      tracker.record({
        path: btn.href,
        status: 'fail',
        kind: 'admin-home-button',
        message: err.message,
        durationMs: Date.now() - start,
        meta: { label: btn.label },
      });
      console.log(`  ✗ ${btn.label}: ${err.message}`);
    }
  }
}

async function main() {
  assertDemoTenant();
  const kinds = parseKinds();
  const exclude = parseExclude();
  const limit = parseLimit();
  const inventory = loadInventory();
  const authFile = loadAuthJson();
  const baseUrl = resolveBaseUrl(authFile?.baseUrl || 'http://localhost:3000');
  await assertAppReachable(baseUrl);

  const suiteLabel = kinds
    ? `smoke-${kinds.filter((k) => !exclude.includes(k)).join('+') || 'none'}`
    : exclude.length
      ? `smoke-all-except-${exclude.join('+')}`
      : 'smoke-all';
  const tracker = new CoverageTracker(suiteLabel);

  let routes = inventory.routes;
  if (kinds) {
    routes = routes.filter((r) => kinds.includes(r.kind));
  }
  if (exclude.length) {
    routes = routes.filter((r) => !exclude.includes(r.kind));
    console.log(`[smoke] Excluding kinds: ${exclude.join(', ')}`);
  }

  const authNeeded = needsAuth(kinds, exclude);
  let config = {
    baseUrl,
    timeout: 45000,
    headless: true,
    email: authFile?.email,
    password: authFile?.password,
  };
  if (authNeeded) {
    config = { ...requireAuthJson(), baseUrl, timeout: 45000 };
  }

  const ids = await discoverDemoIds(baseUrl);
  // Prefer event id for generic [id] on event-ish paths
  const idBag = {
    ...ids,
    id: ids.eventId || ids.planId || ids.pollId || ids.sponsorId,
    slug: ids.focusGroupSlug || 'demo',
  };

  const browser = await chromium.launch({ headless: config.headless !== false });
  let context;
  try {
    if (authNeeded) {
      context = await getAuthContext(browser, config);
    } else {
      context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
    }

    const page = await context.newPage();

    if ((!kinds || kinds.includes('admin')) && !exclude.includes('admin')) {
      await runAdminHomeButtons(page, baseUrl, tracker, config.timeout);
    }

    let tested = 0;
    const totalPlanned = Number.isFinite(limit)
      ? Math.min(routes.length, limit)
      : routes.length;
    console.log(
      `\n[smoke] Crawling ${routes.length} routes (limit=${limit}, planned≈${totalPlanned})…`
    );
    console.log(
      `[smoke] Progress: log every route; heartbeat every ${ROUTE_HEARTBEAT_MS / 1000}s while waiting`
    );

    for (const route of routes) {
      if (tested >= limit) break;

      if (shouldSkipSmokePath(route.path)) {
        tracker.record({
          path: route.path,
          status: 'skip',
          kind: route.kind,
          message: 'Excluded from smoke (redirect / non-content route)',
        });
        console.log(`  ○ skip ${route.path}`);
        continue;
      }

      let target = route.path;
      if (route.dynamic) {
        // Prefer event id for /events/[id] and /admin/events/[id]
        const localIds = { ...idBag };
        if (route.path.includes('/membership/subscribe')) {
          localIds.id = ids.planId;
          localIds.planId = ids.planId;
        } else if (route.path.includes('/polls/')) {
          localIds.id = ids.pollId;
        } else if (route.path.includes('/sponsors/')) {
          localIds.id = ids.sponsorId;
        } else if (route.path.includes('/focus-groups/')) {
          localIds.slug = ids.focusGroupSlug || 'demo';
        } else if (route.path.includes('/events/') || route.path.includes('/admin/events')) {
          localIds.id = ids.eventId;
          localIds.eventId = ids.eventId;
        }

        target = resolveDynamicPath(route.path, localIds);
        if (!target) {
          tracker.record({
            path: route.path,
            status: 'skip',
            kind: route.kind,
            message: 'Missing demo ID for dynamic segment',
          });
          console.log(`  ○ skip ${route.path} (missing demo ID)`);
          continue;
        }
      }

      // Skip heavy nested QR / downloads without real IDs already handled
      const start = Date.now();
      tested += 1;
      console.log(`  → (${tested}/${totalPlanned}) ${target}`);
      const heartbeat = startRouteHeartbeat(tested, totalPlanned, target, start);
      try {
        // Pace requests to avoid saturating the Next.js dev server
        if (tested > 1) {
          await page.waitForTimeout(150);
        }

        const allowSignIn =
          route.kind === 'public' ||
          target.includes('/sign-in') ||
          target.includes('/sign-up') ||
          target.includes('/pricing') ||
          target.includes('/profile') ||
          target.includes('/dashboard') ||
          target.includes('/membership/manage') ||
          target.includes('/auth/') ||
          target.includes('/sso-callback');

        let response = null;
        let lastErr = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            response = await page.goto(`${baseUrl}${target}`, {
              waitUntil: 'domcontentloaded',
              timeout: Math.min(config.timeout, 30000),
            });
            lastErr = null;
            break;
          } catch (err) {
            lastErr = err;
            await page.waitForTimeout(1000 * attempt);
          }
        }
        if (lastErr) throw lastErr;

        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const status = response?.status?.() ?? 0;
        const durationMs = Date.now() - start;
        if (status >= 500) {
          tracker.record({
            path: route.path,
            status: 'fail',
            kind: route.kind,
            message: `HTTP ${status}`,
            durationMs,
            meta: { resolved: target },
          });
          console.log(`  ✗ (${tested}/${totalPlanned}) [${status}] ${target} (${durationMs}ms)`);
          continue;
        }

        // Unauthenticated public crawl: redirect to sign-in counts as covered (auth gate)
        const finalUrl = page.url();
        if (
          route.kind === 'public' &&
          finalUrl.includes('/sign-in') &&
          !target.includes('/sign-in')
        ) {
          tracker.record({
            path: route.path,
            status: 'pass',
            kind: route.kind,
            message: 'auth-gated (redirect to sign-in)',
            durationMs,
            meta: { resolved: target, http: status },
          });
          console.log(
            `  ✓ (${tested}/${totalPlanned}) ${target} [auth-gated] (${durationMs}ms)`
          );
          continue;
        }

        const check = await smokeCheckPage(page, {
          allowSignInRedirect: allowSignIn,
          urlHint: target,
        });
        tracker.record({
          path: route.path,
          status: check.ok ? 'pass' : 'fail',
          kind: route.kind,
          message: check.message,
          durationMs,
          meta: { resolved: target, http: status },
        });
        console.log(
          `  ${check.ok ? '✓' : '✗'} (${tested}/${totalPlanned}) ${target} (${durationMs}ms)`
        );
      } catch (err) {
        const durationMs = Date.now() - start;
        tracker.record({
          path: route.path,
          status: 'fail',
          kind: route.kind,
          message: err.message,
          durationMs,
          meta: { resolved: target },
        });
        console.log(
          `  ✗ (${tested}/${totalPlanned}) ${target}: ${err.message} (${durationMs}ms)`
        );
      } finally {
        clearInterval(heartbeat);
      }
    }

    await page.close();
  } finally {
    if (context) await context.close();
    await browser.close();
  }

  tracker.write();
  const s = tracker.summary();
  if (s.fail > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
