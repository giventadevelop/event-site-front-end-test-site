#!/usr/bin/env node

/**
 * Regenerate HTML coverage report(s) from existing coverage-*.json files.
 *
 * Usage:
 *   node TestSprite/tools/coverage-json-to-html.js
 *   node TestSprite/tools/coverage-json-to-html.js TestSprite/reports/coverage-smoke-….json
 *   npm run test:coverage:html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeHtmlFromCoverageJson, REPORTS_DIR } from '../lib/e2e-harness.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function listCoverageJson() {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.startsWith('coverage-') && f.endsWith('.json'))
    .map((f) => path.join(REPORTS_DIR, f))
    .sort();
}

function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const targets = args.length
    ? args.map((a) => (path.isAbsolute(a) ? a : path.join(ROOT, a)))
    : listCoverageJson();

  if (targets.length === 0) {
    console.error('[coverage-html] No coverage-*.json files found in TestSprite/reports/');
    process.exit(1);
  }

  let ok = 0;
  for (const jsonPath of targets) {
    if (!fs.existsSync(jsonPath)) {
      console.error(`[coverage-html] Missing: ${jsonPath}`);
      continue;
    }
    try {
      const html = writeHtmlFromCoverageJson(jsonPath);
      console.log(`[coverage-html] Wrote ${html}`);
      ok += 1;
    } catch (err) {
      console.error(`[coverage-html] Failed ${jsonPath}: ${err.message}`);
    }
  }
  console.log(`[coverage-html] Done: ${ok}/${targets.length}`);
  if (ok === 0) process.exit(1);
}

main();
