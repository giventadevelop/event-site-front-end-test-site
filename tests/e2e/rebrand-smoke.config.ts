import { defineConfig, devices } from 'playwright/test';

/**
 * Post-rebrand production smoke (hub www.adwiiseagent.ai + satellites, backend api.adwiiseagent.ai).
 * Run: npx playwright test --config=tests/e2e/rebrand-smoke.config.ts
 * Limit sites: SMOKE_SITES=www.adwiiseagent.ai,www.mosc-temp.com npx playwright test --config=tests/e2e/rebrand-smoke.config.ts
 */
export default defineConfig({
  testDir: '.',
  testMatch: 'rebrand-smoke.spec.ts',
  timeout: 90_000,
  expect: { timeout: 25_000 },
  fullyParallel: true,
  workers: 4,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-rebrand', open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
