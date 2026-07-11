#!/usr/bin/env node

/**
 * Public dynamic route smoke using discovered demo IDs (tenant_demo_002).
 * No checkout / payment submit.
 *
 * Usage: node TestSprite/sanity-tests/run-public-dynamic-demo-tests.js
 *        npm run test:public:dynamic
 */

import { chromium } from 'playwright';
import {
  assertDemoTenant,
  assertAppReachable,
  resolveBaseUrl,
  loadAuthJson,
  discoverDemoIds,
  smokeCheckPage,
  CoverageTracker,
} from '../lib/e2e-harness.js';

function buildRoutes(ids) {
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/events', name: 'Events list' },
    { path: '/gallery', name: 'Gallery' },
    { path: '/sponsors', name: 'Sponsors' },
    { path: '/polls', name: 'Polls' },
    { path: '/calendar', name: 'Calendar' },
    { path: '/membership', name: 'Membership' },
    { path: '/membership/plans', name: 'Membership plans' },
    { path: '/team', name: 'Team' },
    { path: '/focus-groups', name: 'Focus groups' },
    { path: '/donate', name: 'Donate' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/mosc-redesign', name: 'MOSC redesign home' },
  ];

  if (ids.eventId) {
    const id = ids.eventId;
    routes.push(
      { path: `/events/${id}`, name: `Event detail ${id}` },
      { path: `/events/${id}/tickets`, name: `Event tickets ${id}` },
      { path: `/events/${id}/register`, name: `Event register ${id}` },
      { path: `/events/${id}/competitions`, name: `Event competitions ${id}` },
      { path: `/events/${id}/competitions/rules`, name: `Competition rules ${id}` },
      { path: `/events/${id}/donation`, name: `Event donation ${id}` },
    );
  } else {
    routes.push({ path: null, name: 'Event dynamic routes', skip: 'No eventId' });
  }

  if (ids.planId) {
    routes.push({
      path: `/membership/subscribe/${ids.planId}`,
      name: `Subscribe plan ${ids.planId}`,
      allowSignIn: true,
    });
  } else {
    routes.push({ path: null, name: 'Membership subscribe', skip: 'No planId' });
  }

  if (ids.pollId) {
    routes.push({ path: `/polls/${ids.pollId}`, name: `Poll ${ids.pollId}` });
  }

  if (ids.sponsorId) {
    routes.push({ path: `/sponsors/${ids.sponsorId}`, name: `Sponsor ${ids.sponsorId}` });
  }

  if (ids.focusGroupSlug) {
    routes.push({
      path: `/focus-groups/${ids.focusGroupSlug}`,
      name: `Focus group ${ids.focusGroupSlug}`,
    });
  }

  return routes;
}

async function main() {
  assertDemoTenant();
  const auth = loadAuthJson();
  const baseUrl = resolveBaseUrl(auth?.baseUrl || 'http://localhost:3000');
  await assertAppReachable(baseUrl);
  const ids = await discoverDemoIds(baseUrl);
  const tracker = new CoverageTracker('public-dynamic');
  const routes = buildRoutes(ids);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  console.log('\n[public-dynamic] Smoking public routes with demo IDs…');

  for (const route of routes) {
    const start = Date.now();
    if (route.skip || !route.path) {
      tracker.record({
        path: route.name,
        status: 'skip',
        kind: 'public-dynamic',
        message: route.skip || 'No path',
      });
      console.log(`  ○ skip ${route.name}: ${route.skip}`);
      continue;
    }
    try {
      const res = await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      const status = res?.status?.() ?? 0;
      if (status >= 500) {
        tracker.record({
          path: route.path,
          status: 'fail',
          kind: 'public-dynamic',
          message: `HTTP ${status}`,
          durationMs: Date.now() - start,
        });
        console.log(`  ✗ ${route.path} HTTP ${status}`);
        continue;
      }
      const check = await smokeCheckPage(page, {
        allowSignInRedirect: true,
        urlHint: route.path,
      });
      const finalUrl = page.url();
      if (finalUrl.includes('/sign-in') && !route.path.includes('/sign-in')) {
        tracker.record({
          path: route.path,
          status: 'pass',
          kind: 'public-dynamic',
          message: 'auth-gated (redirect to sign-in)',
          durationMs: Date.now() - start,
          meta: { name: route.name },
        });
        console.log(`  ✓ ${route.path} [auth-gated]`);
        continue;
      }
      tracker.record({
        path: route.path,
        status: check.ok ? 'pass' : 'fail',
        kind: 'public-dynamic',
        message: check.message,
        durationMs: Date.now() - start,
        meta: { name: route.name },
      });
      console.log(`  ${check.ok ? '✓' : '✗'} ${route.path}`);
    } catch (err) {
      tracker.record({
        path: route.path,
        status: 'fail',
        kind: 'public-dynamic',
        message: err.message,
        durationMs: Date.now() - start,
      });
      console.log(`  ✗ ${route.path}: ${err.message}`);
    }
  }

  await page.close();
  await context.close();
  await browser.close();
  tracker.write();
  if (tracker.summary().fail > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
