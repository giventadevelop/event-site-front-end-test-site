#!/usr/bin/env node

/**
 * Contact form / HTML email send path (commit f52d81a2).
 *
 * Covers:
 *   - /mosc-redesign/contact-form-email page load + form fields
 *   - Client-side validation (empty submit)
 *   - API /api/proxy/contact-form-email/send-html validation (400) — no real email send
 *
 * Usage:
 *   node TestSprite/sanity-tests/run-contact-form-email-tests.js
 *   npm run test:contact-form
 */

import { chromium } from 'playwright';
import {
  assertDemoTenant,
  assertAppReachable,
  resolveBaseUrl,
  loadAuthJson,
  CoverageTracker,
} from '../lib/e2e-harness.js';

const PAGE_PATH = '/mosc-redesign/contact-form-email';
const API_PATH = '/api/proxy/contact-form-email/send-html';
const KIND = 'contact-form';

async function recordStep(tracker, name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    tracker.record({
      path: name,
      status: 'pass',
      kind: KIND,
      durationMs: Date.now() - t0,
    });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    tracker.record({
      path: name,
      status: 'fail',
      kind: KIND,
      message: err.message || String(err),
      durationMs: Date.now() - t0,
    });
    console.log(`  ✗ ${name}: ${err.message}`);
  }
}

async function main() {
  assertDemoTenant();
  const auth = loadAuthJson();
  const baseUrl = resolveBaseUrl(auth?.baseUrl || 'http://localhost:3000');
  await assertAppReachable(baseUrl);

  const tracker = new CoverageTracker('contact-form-email');
  const browser = await chromium.launch({ headless: auth?.headless !== false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const timeout = Math.max(auth?.timeout || 30000, 60000);

  console.log(`\n[contact-form] baseUrl=${baseUrl}`);
  console.log(`[contact-form] Testing ${PAGE_PATH} + ${API_PATH}\n`);

  // Next.js / Clerk can keep "domcontentloaded" hanging; commit + selector is more reliable.
  await recordStep(tracker, `${PAGE_PATH} loads`, async () => {
    const res = await page.goto(`${baseUrl}${PAGE_PATH}`, {
      waitUntil: 'commit',
      timeout,
    });
    if (!res || res.status() >= 500) {
      throw new Error(`HTTP ${res?.status() ?? 'no response'}`);
    }
    await page.locator('#name').waitFor({ state: 'visible', timeout });
    const heading = page.getByText('Send us a Message');
    if ((await heading.count()) === 0) {
      throw new Error('Expected "Send us a Message" heading');
    }
  });

  const contactForm = () => page.locator('form').filter({ has: page.locator('#name') }).first();

  await recordStep(tracker, `${PAGE_PATH} has name/email/message fields`, async () => {
    const form = contactForm();
    for (const id of ['name', 'email', 'message']) {
      if ((await form.locator(`#${id}`).count()) === 0) throw new Error(`Missing #${id}`);
    }
    const submit = form.getByRole('button', { name: /send message/i });
    if ((await submit.count()) === 0) throw new Error('Missing "Send Message" button');
  });

  await recordStep(tracker, `${PAGE_PATH} empty submit shows validation`, async () => {
    const form = contactForm();
    await form.locator('#name').fill('');
    await form.locator('#email').fill('');
    await form.locator('#message').fill('');
    await form.getByRole('button', { name: /send message/i }).click();
    await page.waitForTimeout(500);
    const nameErr = form.getByText('Name is required');
    const emailErr = form.getByText(/email.*(required|valid)/i);
    const msgErr = form.getByText('Message is required');
    if ((await nameErr.count()) === 0 && (await emailErr.count()) === 0 && (await msgErr.count()) === 0) {
      throw new Error('Expected client-side validation errors after empty submit');
    }
  });

  await recordStep(tracker, `${API_PATH} rejects empty body (400)`, async () => {
    const res = await page.request.post(`${baseUrl}${API_PATH}`, {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() !== 400) {
      throw new Error(`Expected 400, got ${res.status()}: ${await res.text()}`);
    }
    const body = await res.json();
    if (!body?.error) throw new Error('Expected error field in 400 response');
  });

  await recordStep(tracker, `${API_PATH} rejects invalid email (400)`, async () => {
    const res = await page.request.post(`${baseUrl}${API_PATH}`, {
      data: {
        firstName: 'E2E',
        lastName: 'Tester',
        senderEmail: 'not-an-email',
        message: 'This is a long enough message for validation.',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() !== 400) {
      throw new Error(`Expected 400, got ${res.status()}: ${await res.text()}`);
    }
  });

  await recordStep(tracker, `${API_PATH} rejects short message (400)`, async () => {
    const res = await page.request.post(`${baseUrl}${API_PATH}`, {
      data: {
        firstName: 'E2E',
        lastName: 'Tester',
        senderEmail: 'e2e-contact@example.com',
        message: 'short',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() !== 400) {
      throw new Error(`Expected 400, got ${res.status()}: ${await res.text()}`);
    }
    const body = await res.json();
    if (!/message/i.test(body?.error || '')) {
      throw new Error(`Expected message validation error, got: ${body?.error}`);
    }
  });

  await recordStep(tracker, `${API_PATH} rejects GET (405)`, async () => {
    const res = await page.request.get(`${baseUrl}${API_PATH}`);
    if (res.status() !== 405) {
      throw new Error(`Expected 405, got ${res.status()}`);
    }
  });

  await browser.close();
  tracker.write();
  const s = tracker.summary();
  if (s.fail > 0) {
    console.error(`\n[contact-form] ${s.fail} failure(s)`);
    process.exit(1);
  }
  console.log('\n[contact-form] All checks passed (no live email send).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
