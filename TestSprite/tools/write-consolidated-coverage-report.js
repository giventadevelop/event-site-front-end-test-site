#!/usr/bin/env node
/**
 * Write a global consolidated E2E coverage HTML/JSON from the latest
 * per-suite coverage-*.json files under TestSprite/reports/.
 *
 * Outputs:
 *   TestSprite/reports/coverage-global-consolidated-<stamp>.html
 *   TestSprite/reports/coverage-global-consolidated-<stamp>.json
 *   TestSprite/reports/coverage-global-latest.html   ← stable name
 *
 * Usage:
 *   node TestSprite/tools/write-consolidated-coverage-report.js
 *   node TestSprite/tools/write-consolidated-coverage-report.js --max-age-hours=48
 */

import {
  writeConsolidatedCoverageReport,
} from '../lib/e2e-harness.js';

const args = process.argv.slice(2);
const maxAgeArg = args.find((a) => a.startsWith('--max-age-hours='));
const maxAgeHours = maxAgeArg
  ? Number(maxAgeArg.slice('--max-age-hours='.length))
  : undefined;

try {
  const result = writeConsolidatedCoverageReport(
    Number.isFinite(maxAgeHours) ? { maxAgeHours } : {}
  );
  if (!result.overallSuccess) process.exitCode = 1;
} catch (err) {
  console.error(`[consolidated] ${err.message || err}`);
  process.exit(1);
}
