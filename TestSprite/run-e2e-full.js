#!/usr/bin/env node

/**
 * Full E2E orchestrator for tenant_demo_002.
 *
 * Steps:
 *   1. Generate route inventory
 *   2. Public dynamic demo smoke
 *   3. Admin static + dynamic (existing suites)
 *   4. Admin CRUD demo tenant
 *   5. Inventory smoke: admin + public (core)
 *   6. Inventory smoke: mosc-redesign
 *   7. Inventory smoke: mosc + mosc-old
 *
 * Flags:
 *   --skip-mosc          Skip all MOSC tree crawls (/mosc, /mosc-redesign, /mosc-old)
 *   --skip-mosc-old      Skip only /mosc-old (keep /mosc + /mosc-redesign)
 *   --skip-crud          Skip CRUD suite
 *   --skip-legacy-admin  Skip comprehensive + dynamic admin suites
 *   --mosc-limit=N       Cap MOSC crawl size (default unlimited)
 *   --quick              = --skip-mosc --skip-legacy-admin (inventory admin+public + dynamic + crud)
 *
 * Usage: node TestSprite/run-e2e-full.js
 *        npm run test:e2e:full
 */

import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  assertDemoTenant,
  assertAppReachable,
  resolveBaseUrl,
  loadAuthJson,
  requireAuthJson,
  REPORTS_DIR,
  ensureDir,
  writeConsolidatedCoverageReport,
} from './lib/e2e-harness.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const skipMosc = args.includes('--skip-mosc') || args.includes('--quick');
const skipMoscOld = args.includes('--skip-mosc-old') || skipMosc;
const skipCrud = args.includes('--skip-crud');
const skipLegacyAdmin = args.includes('--skip-legacy-admin') || args.includes('--quick');
const moscLimitArg = args.find((a) => a.startsWith('--mosc-limit='));
const moscLimit = moscLimitArg ? moscLimitArg.slice('--mosc-limit='.length) : null;

function run(label, scriptRel, extra = []) {
  console.log(`\n${'='.repeat(60)}\n▶ ${label}\n${'='.repeat(60)}`);
  const scriptPath = path.join(__dirname, scriptRel);
  const result = spawnSync(process.execPath, [scriptPath, ...extra, ...args.filter((a) => a.startsWith('--base-url=') || a.startsWith('--port='))], {
    stdio: 'inherit',
    cwd: ROOT,
    shell: false,
    env: process.env,
  });
  const code = result.status ?? 1;
  return { label, code };
}

async function main() {
  ensureDir(REPORTS_DIR);
  const logPath = path.join(REPORTS_DIR, 'LOOP_LOG.md');
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(
      logPath,
      '# E2E Loop Log\n\nAppend-only progress for full-site E2E on tenant_demo_002.\n',
      'utf8'
    );
  }

  assertDemoTenant();
  const auth = loadAuthJson();
  const baseUrl = resolveBaseUrl(auth?.baseUrl || 'http://localhost:3000');
  // Auth required for full run
  requireAuthJson();
  await assertAppReachable(baseUrl);

  const results = [];
  const started = new Date().toISOString();
  fs.appendFileSync(
    logPath,
    `\n# Full run started ${started}\n- baseUrl: ${baseUrl}\n- skipMosc: ${skipMosc} skipMoscOld: ${skipMoscOld} skipCrud: ${skipCrud} skipLegacyAdmin: ${skipLegacyAdmin}\n`,
    'utf8'
  );

  results.push(run('Generate inventory', 'tools/generate-route-inventory.js'));
  results.push(run('Public dynamic demo', 'sanity-tests/run-public-dynamic-demo-tests.js'));
  results.push(run('Contact form email', 'sanity-tests/run-contact-form-email-tests.js'));

  if (!skipLegacyAdmin) {
    results.push(run('Admin comprehensive', 'admin-tests/comprehensive-admin-test-suite.js'));
    results.push(run('Admin dynamic events', 'admin-tests/dynamic-event-test-suite.js'));
  }

  if (!skipCrud) {
    results.push(run('Admin CRUD demo tenant', 'admin-tests/admin-crud-demo-tenant-suite.js'));
  }

  results.push(
    run('Inventory smoke: admin', 'sanity-tests/run-inventory-smoke-crawl.js', ['--kind=admin'])
  );
  results.push(
    run('Inventory smoke: public', 'sanity-tests/run-inventory-smoke-crawl.js', ['--kind=public'])
  );

  if (!skipMosc) {
    const limitArgs = moscLimit ? [`--limit=${moscLimit}`] : [];
    results.push(
      run('Inventory smoke: mosc-redesign', 'sanity-tests/run-inventory-smoke-crawl.js', [
        '--kind=mosc-redesign',
        ...limitArgs,
      ])
    );
    results.push(
      run('Inventory smoke: mosc', 'sanity-tests/run-inventory-smoke-crawl.js', [
        '--kind=mosc',
        ...limitArgs,
      ])
    );
    if (!skipMoscOld) {
      results.push(
        run('Inventory smoke: mosc-old', 'sanity-tests/run-inventory-smoke-crawl.js', [
          '--kind=mosc-old',
          ...limitArgs,
        ])
      );
    } else {
      console.log('\n⏭ Skipping /mosc-old (--skip-mosc-old)');
    }
  }

  console.log(`\n${'='.repeat(60)}\nE2E FULL SUMMARY\n${'='.repeat(60)}`);
  let failed = 0;
  for (const r of results) {
    const ok = r.code === 0;
    if (!ok) failed += 1;
    console.log(`  ${ok ? '✓' : '✗'} ${r.label} (exit ${r.code})`);
  }

  fs.appendFileSync(
    logPath,
    `\n## Full run finished ${new Date().toISOString()}\n` +
      results.map((r) => `- ${r.code === 0 ? 'PASS' : 'FAIL'} ${r.label} (${r.code})`).join('\n') +
      `\n`,
    'utf8'
  );

  // Always try to write a global rollup of whatever harness JSON exists from this session
  try {
    writeConsolidatedCoverageReport();
  } catch (err) {
    console.warn(`[e2e-full] Consolidated report skipped: ${err.message || err}`);
  }

  if (failed > 0) {
    console.error(`\n${failed} suite(s) failed. See TestSprite/reports/ (coverage-global-latest.html)`);
    process.exit(1);
  }
  console.log('\nAll orchestrated suites completed successfully.');
  console.log('Open TestSprite/reports/coverage-global-latest.html for the global rollup.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
