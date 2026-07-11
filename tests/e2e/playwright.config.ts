import { defineConfig, devices } from 'playwright/test';

/**
 * Homepage hero slider QA — local Playwright config.
 * Run: npx playwright test tests/e2e/hero-slider-conditions.spec.ts --config=tests/e2e/playwright.config.ts
 */
export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
