#!/usr/bin/env node

/**
 * Shared E2E harness for TestSprite Playwright suites.
 * - tenant_demo_002 assertion
 * - auth config / base URL helpers
 * - ID discovery via /api/proxy
 * - coverage reporting
 * - standard smoke page checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const DEFAULT_TENANT = 'tenant_demo_002';
const REPORTS_DIR = path.join(ROOT, 'TestSprite', 'reports');
const GENERATED_DIR = path.join(ROOT, 'TestSprite', 'generated');
const INVENTORY_PATH = path.join(GENERATED_DIR, 'route-inventory.json');

export { DEFAULT_TENANT, REPORTS_DIR, GENERATED_DIR, INVENTORY_PATH, ROOT };

/** Load .env.local once */
export function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

/**
 * Assert app tenant is demo (or E2E_ALLOW_ANY_TENANT=1 to skip).
 * Expected tenant defaults to tenant_demo_002; override with E2E_EXPECTED_TENANT.
 * @returns {string} tenant id in use
 */
export function assertDemoTenant() {
  loadEnvLocal();
  const expected = process.env.E2E_EXPECTED_TENANT || DEFAULT_TENANT;
  const tenant =
    process.env.E2E_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID ||
    DEFAULT_TENANT;

  if (process.env.E2E_ALLOW_ANY_TENANT === '1') {
    console.warn(
      `[harness] E2E_ALLOW_ANY_TENANT=1 — using tenant "${tenant}" (expected default "${expected}")`
    );
    return tenant;
  }

  if (tenant !== expected) {
    console.error(
      `[harness] HARD BLOCKER: NEXT_PUBLIC_TENANT_ID is "${tenant}", expected "${expected}".\n` +
        `  Set NEXT_PUBLIC_TENANT_ID=${expected} for demo CRUD, or E2E_ALLOW_ANY_TENANT=1 to override,\n` +
        `  or E2E_EXPECTED_TENANT=<your-tenant> if intentionally testing another tenant.`
    );
    process.exit(1);
  }
  console.log(`[harness] Tenant OK: ${tenant}`);
  return tenant;
}

export function stripTrailingSlash(url) {
  if (!url || typeof url !== 'string') return url;
  return url.trim().replace(/\/+$/, '') || url.trim();
}

export function resolveBaseUrl(fallback = 'http://localhost:3000') {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--base-url=')) {
      const u = stripTrailingSlash(arg.slice('--base-url='.length));
      if (u) return u;
    }
    if (arg.startsWith('--port=')) {
      const p = arg.slice('--port='.length).trim();
      if (/^\d{1,5}$/.test(p)) return `http://localhost:${p}`;
    }
  }
  const full =
    process.env.TEST_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.ADMIN_TEST_BASE_URL?.trim();
  if (full) return stripTrailingSlash(full);
  const portRaw = process.env.TEST_PORT?.trim() || process.env.PORT?.trim();
  if (portRaw && /^\d{1,5}$/.test(portRaw)) return `http://localhost:${portRaw}`;
  return stripTrailingSlash(fallback);
}

export function loadAuthJson() {
  const authPath = path.join(ROOT, 'TestSprite', 'admin-tests', 'auth.json');
  if (!fs.existsSync(authPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(authPath, 'utf8'));
  } catch {
    return null;
  }
}

export function requireAuthJson() {
  const config = loadAuthJson();
  if (!config?.email || !config?.password) {
    console.error(
      '[harness] HARD BLOCKER: TestSprite/admin-tests/auth.json missing or incomplete.\n' +
        '  Copy auth.json.example → auth.json and set email/password for an ADMIN on tenant_demo_002.'
    );
    process.exit(1);
  }
  return {
    email: config.email,
    password: config.password,
    baseUrl: resolveBaseUrl(config.baseUrl || 'http://localhost:3000'),
    timeout: config.timeout || 30000,
    headless: config.headless !== undefined ? config.headless : true,
    screenshotOnFailure: config.screenshotOnFailure !== false,
  };
}

export function loadInventory() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`[harness] Inventory not found: ${INVENTORY_PATH}. Run npm run test:inventory first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Coverage tracker — accumulates route results and writes JSON + appends LOOP_LOG.
 */
export class CoverageTracker {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.startedAt = new Date().toISOString();
    this.results = [];
  }

  record({ path: routePath, status, kind, message = '', durationMs = 0, meta = {} }) {
    this.results.push({
      path: routePath,
      status, // pass | fail | skip | todo
      kind: kind || 'unknown',
      message,
      durationMs,
      meta,
      at: new Date().toISOString(),
    });
  }

  summary() {
    const counts = { pass: 0, fail: 0, skip: 0, todo: 0 };
    for (const r of this.results) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  }

  write() {
    ensureDir(REPORTS_DIR);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(REPORTS_DIR, `coverage-${this.suiteName}-${stamp}.json`);
    const finishedAt = new Date().toISOString();
    const payload = {
      suite: this.suiteName,
      startedAt: this.startedAt,
      finishedAt,
      summary: this.summary(),
      results: this.results,
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');

    const htmlFile = writeCoverageHtmlReport(payload, this.suiteName, stamp);

    const logPath = path.join(REPORTS_DIR, 'LOOP_LOG.md');
    const s = this.summary();
    const line =
      `\n## ${new Date().toISOString()} — ${this.suiteName}\n` +
      `- pass: ${s.pass} | fail: ${s.fail} | skip: ${s.skip} | todo: ${s.todo}\n` +
      `- report: \`${path.relative(ROOT, file)}\`\n` +
      `- html: \`${path.relative(ROOT, htmlFile)}\`\n`;
    fs.appendFileSync(logPath, line, 'utf8');

    const pruned = pruneReportsDir();
    if (pruned > 0) {
      console.log(`[harness] Pruned ${pruned} old coverage file(s) from reports/`);
    }

    console.log(`[harness] Coverage written: ${file}`);
    console.log(`[harness] HTML report: ${htmlFile}`);
    console.log(`[harness] Summary:`, s);
    return file;
  }
}

/**
 * Rotate old coverage reports under TestSprite/reports/.
 * Keeps LOOP_LOG.md. Per suite, keeps the newest N JSON + HTML pairs
 * (E2E_REPORT_KEEP, default 5) and deletes files older than E2E_REPORT_MAX_AGE_DAYS (default 5).
 * @returns {number} files deleted
 */
export function pruneReportsDir(options = {}) {
  ensureDir(REPORTS_DIR);
  const keepPerSuite = Math.max(
    1,
    Number(process.env.E2E_REPORT_KEEP || options.keepPerSuite || 5)
  );
  const maxAgeDays = Number(
    process.env.E2E_REPORT_MAX_AGE_DAYS || options.maxAgeDays || 5
  );
  const maxAgeMs = maxAgeDays > 0 ? maxAgeDays * 24 * 60 * 60 * 1000 : 0;
  const now = Date.now();

  let deleted = 0;
  /** @type {Map<string, { file: string, mtime: number }[]>} */
  const bySuiteExt = new Map();

  for (const name of fs.readdirSync(REPORTS_DIR)) {
    if (name === 'LOOP_LOG.md' || name.startsWith('.')) continue;
    if (name === 'coverage-global-latest.html') continue;
    const full = path.join(REPORTS_DIR, name);
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;

    if (maxAgeMs > 0 && now - st.mtimeMs > maxAgeMs) {
      try {
        fs.unlinkSync(full);
        deleted += 1;
      } catch {
        /* ignore */
      }
      continue;
    }

    const m = name.match(/^coverage-(.+)-(\d{4}-\d{2}-\d{2}T.+)\.(json|html)$/);
    if (!m) continue;
    const key = `${m[1]}::${m[3]}`;
    if (!bySuiteExt.has(key)) bySuiteExt.set(key, []);
    bySuiteExt.get(key).push({ file: full, mtime: st.mtimeMs });
  }

  for (const files of bySuiteExt.values()) {
    files.sort((a, b) => b.mtime - a.mtime);
    for (const old of files.slice(keepPerSuite)) {
      try {
        fs.unlinkSync(old.file);
        deleted += 1;
      } catch {
        /* ignore */
      }
    }
  }

  return deleted;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDuration(ms) {
  const n = Number(ms) || 0;
  if (n < 1000) return `${Math.round(n)}ms`;
  if (n < 60000) return `${(n / 1000).toFixed(1)}s`;
  const mins = Math.floor(n / 60000);
  const secs = ((n % 60000) / 1000).toFixed(1);
  return `${mins}m ${secs}s`;
}

/**
 * Format an ISO timestamp in the local machine timezone for HTML reports.
 * Example: "Jul 15, 2026, 9:15:35 PM EDT (America/New_York, UTC-04:00)"
 */
function formatLocalDateTime(isoOrDate) {
  if (!isoOrDate) return '';
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return String(isoOrDate);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
  const localStamp = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);

  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const utcOffset =
    offsetParts.find((p) => p.type === 'timeZoneName')?.value ||
    (() => {
      const mins = -date.getTimezoneOffset();
      const sign = mins >= 0 ? '+' : '-';
      const abs = Math.abs(mins);
      const hh = String(Math.floor(abs / 60)).padStart(2, '0');
      const mm = String(abs % 60).padStart(2, '0');
      return `UTC${sign}${hh}:${mm}`;
    })();

  return `${localStamp} (${timeZone}, ${utcOffset})`;
}

function getLocalTimezoneLabel() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
  const now = new Date();
  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'longOffset',
  }).formatToParts(now);
  const utcOffset =
    offsetParts.find((p) => p.type === 'timeZoneName')?.value || 'local offset';
  return `${timeZone} (${utcOffset})`;
}

/**
 * Build module (kind) rollups from coverage results.
 */
export function buildModuleStats(results = []) {
  const byKind = new Map();
  for (const r of results) {
    const kind = r.kind || 'unknown';
    if (!byKind.has(kind)) {
      byKind.set(kind, { kind, pass: 0, fail: 0, skip: 0, todo: 0, durationMs: 0, count: 0 });
    }
    const row = byKind.get(kind);
    row.count += 1;
    row.durationMs += Number(r.durationMs) || 0;
    if (r.status === 'pass') row.pass += 1;
    else if (r.status === 'fail') row.fail += 1;
    else if (r.status === 'skip') row.skip += 1;
    else if (r.status === 'todo') row.todo += 1;
  }
  return [...byKind.values()].sort((a, b) => a.kind.localeCompare(b.kind));
}

/**
 * Write HTML coverage report next to JSON. Returns absolute HTML path.
 */
export function writeCoverageHtmlReport(payload, suiteName, stamp) {
  ensureDir(REPORTS_DIR);
  const htmlFile = path.join(REPORTS_DIR, `coverage-${suiteName}-${stamp}.html`);
  const summary = payload.summary || { pass: 0, fail: 0, skip: 0, todo: 0 };
  const results = Array.isArray(payload.results) ? payload.results : [];
  const modules = buildModuleStats(results);
  const totalDurationMs = results.reduce((sum, r) => sum + (Number(r.durationMs) || 0), 0);
  const wallMs =
    payload.startedAt && payload.finishedAt
      ? Math.max(0, new Date(payload.finishedAt).getTime() - new Date(payload.startedAt).getTime())
      : totalDurationMs;
  const failures = results.filter((r) => r.status === 'fail');
  const total = summary.pass + summary.fail + summary.skip + summary.todo;

  const moduleRows = modules
    .map(
      (m) => `<tr>
      <td><code>${escapeHtml(m.kind)}</code></td>
      <td>${m.count}</td>
      <td class="pass">${m.pass}</td>
      <td class="fail">${m.fail}</td>
      <td>${m.skip}</td>
      <td>${formatDuration(m.durationMs)}</td>
    </tr>`
    )
    .join('\n');

  const failureRows =
    failures.length === 0
      ? `<tr><td colspan="4" class="muted">No failures</td></tr>`
      : failures
          .map(
            (r) => `<tr>
      <td><code>${escapeHtml(r.path)}</code></td>
      <td><code>${escapeHtml(r.kind)}</code></td>
      <td>${formatDuration(r.durationMs)}</td>
      <td>${escapeHtml(r.message || '')}</td>
    </tr>`
          )
          .join('\n');

  const resultRows = results
    .map(
      (r) => `<tr class="status-${escapeHtml(r.status)}">
      <td><span class="badge ${escapeHtml(r.status)}">${escapeHtml(r.status)}</span></td>
      <td><code>${escapeHtml(r.kind)}</code></td>
      <td><code>${escapeHtml(r.path)}</code></td>
      <td>${formatDuration(r.durationMs)}</td>
      <td>${escapeHtml(r.message || '')}</td>
    </tr>`
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E2E Coverage — ${escapeHtml(suiteName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; background: #f5f7fa; color: #1f2937; }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 24px; }
    h1 { color: #0066cc; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0052a3; margin-top: 28px; border-left: 4px solid #0066cc; padding-left: 10px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 16px 0 24px; }
    .card { background: #fff; border-radius: 10px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-left: 4px solid #0066cc; }
    .card.pass { border-left-color: #28a745; }
    .card.fail { border-left-color: #dc3545; }
    .card.skip { border-left-color: #ff9800; }
    .card .label { font-size: .8em; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
    .card .value { font-size: 1.6em; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.08); margin: 12px 0 20px; }
    th, td { border: 1px solid #b8d4e3; padding: 10px 12px; text-align: left; vertical-align: top; font-size: .92em; }
    th { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: #fff; }
    tr:nth-child(even) { background: #f8fbfd; }
    tr:hover { background: #e3f2fd; }
    code { background: #e8f4f8; color: #0d3b66; padding: 2px 6px; border-radius: 3px; border: 1px solid #b8d4e3; font-size: .88em; }
    .pass { color: #166534; font-weight: 600; }
    .fail { color: #991b1b; font-weight: 600; }
    .muted { color: #64748b; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: .75em; font-weight: 700; text-transform: uppercase; }
    .badge.pass { background: #dcfce7; color: #166534; }
    .badge.fail { background: #fee2e2; color: #991b1b; }
    .badge.skip { background: #ffedd5; color: #9a3412; }
    .badge.todo { background: #e0e7ff; color: #3730a3; }
    .meta { background: #e8f4f8; border-left: 4px solid #0066cc; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>E2E Coverage Report</h1>
    <div class="meta">
      <div><strong>Suite:</strong> <code>${escapeHtml(suiteName)}</code></div>
      <div><strong>Timezone:</strong> ${escapeHtml(getLocalTimezoneLabel())} <span class="muted">(machine local)</span></div>
      <div><strong>Started:</strong> ${escapeHtml(formatLocalDateTime(payload.startedAt))}</div>
      <div><strong>Finished:</strong> ${escapeHtml(formatLocalDateTime(payload.finishedAt))}</div>
      <div><strong>Wall clock:</strong> ${formatDuration(wallMs)} · <strong>Sum of step durations:</strong> ${formatDuration(totalDurationMs)}</div>
    </div>

    <div class="cards">
      <div class="card"><div class="label">Total</div><div class="value">${total}</div></div>
      <div class="card pass"><div class="label">Passed</div><div class="value">${summary.pass || 0}</div></div>
      <div class="card fail"><div class="label">Failed</div><div class="value">${summary.fail || 0}</div></div>
      <div class="card skip"><div class="label">Skipped</div><div class="value">${summary.skip || 0}</div></div>
      <div class="card"><div class="label">Todo</div><div class="value">${summary.todo || 0}</div></div>
      <div class="card"><div class="label">Duration</div><div class="value" style="font-size:1.2em">${formatDuration(wallMs)}</div></div>
    </div>

    <h2>Modules / kinds</h2>
    <p class="muted">Time per component group (admin, public, mosc-redesign, contact-form, etc.).</p>
    <table>
      <thead>
        <tr><th>Module</th><th>Tests</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Duration</th></tr>
      </thead>
      <tbody>
        ${moduleRows || '<tr><td colspan="6" class="muted">No module data</td></tr>'}
      </tbody>
    </table>

    <h2>Failures</h2>
    <table>
      <thead>
        <tr><th>Path</th><th>Module</th><th>Duration</th><th>Message</th></tr>
      </thead>
      <tbody>
        ${failureRows}
      </tbody>
    </table>

    <h2>All results</h2>
    <table>
      <thead>
        <tr><th>Status</th><th>Module</th><th>Path</th><th>Duration</th><th>Message</th></tr>
      </thead>
      <tbody>
        ${resultRows || '<tr><td colspan="5" class="muted">No results</td></tr>'}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlFile, html, 'utf8');
  return htmlFile;
}

/**
 * Build a global consolidated coverage report from the latest coverage-*.json
 * per suite under TestSprite/reports/ (excludes prior global-consolidated files).
 *
 * Writes:
 *   - coverage-global-consolidated-<stamp>.json
 *   - coverage-global-consolidated-<stamp>.html
 *   - coverage-global-latest.html  (stable name for the newest rollup)
 *
 * @param {{ maxAgeHours?: number }} [options]
 * @returns {{ jsonPath: string, htmlPath: string, latestPath: string, suites: string[] }}
 */
export function writeConsolidatedCoverageReport(options = {}) {
  ensureDir(REPORTS_DIR);
  const maxAgeHours = Number(
    process.env.E2E_CONSOLIDATED_MAX_AGE_HOURS || options.maxAgeHours || 36
  );
  const maxAgeMs = maxAgeHours > 0 ? maxAgeHours * 60 * 60 * 1000 : 0;
  const now = Date.now();

  /** @type {Map<string, { file: string, mtime: number }>} */
  const latestBySuite = new Map();

  for (const name of fs.readdirSync(REPORTS_DIR)) {
    if (!name.startsWith('coverage-') || !name.endsWith('.json')) continue;
    if (name.startsWith('coverage-global-consolidated-')) continue;
    const m = name.match(/^coverage-(.+)-(\d{4}-\d{2}-\d{2}T.+)\.json$/);
    if (!m) continue;
    const suite = m[1];
    const full = path.join(REPORTS_DIR, name);
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      continue;
    }
    if (maxAgeMs > 0 && now - st.mtimeMs > maxAgeMs) continue;
    const prev = latestBySuite.get(suite);
    if (!prev || st.mtimeMs > prev.mtime) {
      latestBySuite.set(suite, { file: full, mtime: st.mtimeMs });
    }
  }

  if (latestBySuite.size === 0) {
    throw new Error(
      `No recent coverage-*.json files found in ${REPORTS_DIR} (maxAgeHours=${maxAgeHours}). ` +
        'Run CRUD/smoke (or other harness suites) first.'
    );
  }

  const suitePayloads = [];
  for (const [suite, meta] of [...latestBySuite.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const payload = JSON.parse(fs.readFileSync(meta.file, 'utf8'));
    const summary = payload.summary || { pass: 0, fail: 0, skip: 0, todo: 0 };
    const results = Array.isArray(payload.results) ? payload.results : [];
    const durationMs = results.reduce((sum, r) => sum + (Number(r.durationMs) || 0), 0);
    const wallMs =
      payload.startedAt && payload.finishedAt
        ? Math.max(
            0,
            new Date(payload.finishedAt).getTime() - new Date(payload.startedAt).getTime()
          )
        : durationMs;
    const htmlSibling = meta.file.replace(/\.json$/i, '.html');
    suitePayloads.push({
      suite,
      sourceJson: path.relative(ROOT, meta.file),
      sourceHtml: fs.existsSync(htmlSibling) ? path.relative(ROOT, htmlSibling) : null,
      summary,
      results,
      startedAt: payload.startedAt,
      finishedAt: payload.finishedAt,
      durationMs: wallMs,
      ok: (summary.fail || 0) === 0,
    });
  }

  const mergedResults = [];
  const totals = { pass: 0, fail: 0, skip: 0, todo: 0 };
  let startedAt = null;
  let finishedAt = null;
  for (const sp of suitePayloads) {
    totals.pass += sp.summary.pass || 0;
    totals.fail += sp.summary.fail || 0;
    totals.skip += sp.summary.skip || 0;
    totals.todo += sp.summary.todo || 0;
    if (sp.startedAt && (!startedAt || sp.startedAt < startedAt)) startedAt = sp.startedAt;
    if (sp.finishedAt && (!finishedAt || sp.finishedAt > finishedAt)) finishedAt = sp.finishedAt;
    for (const r of sp.results) {
      mergedResults.push({
        ...r,
        kind: r.kind ? `${sp.suite}/${r.kind}` : sp.suite,
        path: r.path,
        message: r.message
          ? `[${sp.suite}] ${r.message}`
          : undefined,
      });
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const suiteName = 'global-consolidated';
  const overallOk = totals.fail === 0;
  const payload = {
    suite: suiteName,
    reportType: 'global-consolidated',
    overallSuccess: overallOk,
    startedAt,
    finishedAt: finishedAt || new Date().toISOString(),
    summary: totals,
    suites: suitePayloads.map((sp) => ({
      suite: sp.suite,
      ok: sp.ok,
      summary: sp.summary,
      durationMs: sp.durationMs,
      sourceJson: sp.sourceJson,
      sourceHtml: sp.sourceHtml,
      startedAt: sp.startedAt,
      finishedAt: sp.finishedAt,
    })),
    results: mergedResults,
  };

  const jsonPath = path.join(REPORTS_DIR, `coverage-${suiteName}-${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

  // Reuse standard HTML writer for modules / failures / all results
  const htmlPath = writeCoverageHtmlReport(payload, suiteName, stamp);

  // Enrich with suite rollup section near the top (inject after first meta block)
  const suiteRows = suitePayloads
    .map(
      (sp) => `<tr>
      <td><span class="badge ${sp.ok ? 'pass' : 'fail'}">${sp.ok ? 'pass' : 'fail'}</span></td>
      <td><code>${escapeHtml(sp.suite)}</code></td>
      <td class="pass">${sp.summary.pass || 0}</td>
      <td class="fail">${sp.summary.fail || 0}</td>
      <td>${sp.summary.skip || 0}</td>
      <td>${formatDuration(sp.durationMs)}</td>
      <td>${
        sp.sourceHtml
          ? `<a href="${escapeHtml(path.basename(sp.sourceHtml))}">module HTML</a>`
          : '—'
      }</td>
    </tr>`
    )
    .join('\n');

  const overallBanner = `<div class="meta" style="border-left-color:${overallOk ? '#28a745' : '#dc3545'};background:${overallOk ? '#dcfce7' : '#fee2e2'}">
      <div style="font-size:1.25em;font-weight:700">${
        overallOk ? 'OVERALL SUCCESS' : 'OVERALL FAILED'
      }</div>
      <div class="muted">Global rollup of ${suitePayloads.length} suite(s) · fail=${totals.fail}</div>
    </div>
    <h2>Suites in this run</h2>
    <p class="muted">Individual harness modules included in this consolidated report.</p>
    <table>
      <thead>
        <tr><th>Status</th><th>Suite / module</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Duration</th><th>Detail</th></tr>
      </thead>
      <tbody>
        ${suiteRows}
      </tbody>
    </table>`;

  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html
    .replace(
      '<title>E2E Coverage — global-consolidated</title>',
      '<title>E2E Global Consolidated Coverage</title>'
    )
    .replace(
      '<h1>E2E Coverage Report</h1>',
      '<h1>E2E Global Consolidated Report</h1>'
    )
    .replace(
      '<div class="meta">',
      `${overallBanner}\n    <div class="meta">`
    );
  fs.writeFileSync(htmlPath, html, 'utf8');

  const latestPath = path.join(REPORTS_DIR, 'coverage-global-latest.html');
  fs.writeFileSync(latestPath, html, 'utf8');

  const logPath = path.join(REPORTS_DIR, 'LOOP_LOG.md');
  fs.appendFileSync(
    logPath,
    `\n## ${new Date().toISOString()} — global-consolidated\n` +
      `- overall: ${overallOk ? 'SUCCESS' : 'FAILED'} | pass: ${totals.pass} | fail: ${totals.fail} | skip: ${totals.skip}\n` +
      `- suites: ${suitePayloads.map((s) => s.suite).join(', ')}\n` +
      `- html: \`${path.relative(ROOT, htmlPath)}\`\n` +
      `- latest: \`${path.relative(ROOT, latestPath)}\`\n`,
    'utf8'
  );

  pruneReportsDir();

  console.log(`[harness] Global consolidated JSON: ${jsonPath}`);
  console.log(`[harness] Global consolidated HTML: ${htmlPath}`);
  console.log(`[harness] Global latest (stable name): ${latestPath}`);
  console.log(
    `[harness] Overall: ${overallOk ? 'SUCCESS' : 'FAILED'} across ${suitePayloads.length} suite(s)`
  );

  return {
    jsonPath,
    htmlPath,
    latestPath,
    suites: suitePayloads.map((s) => s.suite),
    overallSuccess: overallOk,
  };
}

/**
 * Regenerate HTML from an existing coverage-*.json file.
 * For global-consolidated payloads, also restores the suite rollup banner
 * and refreshes coverage-global-latest.html.
 */
export function writeHtmlFromCoverageJson(jsonPath) {
  const abs = path.isAbsolute(jsonPath) ? jsonPath : path.join(ROOT, jsonPath);
  const payload = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const base = path.basename(abs, '.json');
  const stamp = base.replace(/^coverage-[^-]+-?/, '') || new Date().toISOString().replace(/[:.]/g, '-');
  // Prefer suite from payload; stamp from filename when possible
  const suiteName = payload.suite || 'coverage';
  const match = base.match(/^coverage-(.+)-(\d{4}-\d{2}-\d{2}T.+)$/);
  const suite = match ? match[1] : suiteName;
  const fileStamp = match ? match[2] : stamp;
  const htmlPath = writeCoverageHtmlReport(payload, suite, fileStamp);

  const isGlobal =
    payload.reportType === 'global-consolidated' || suite === 'global-consolidated';
  if (isGlobal && Array.isArray(payload.suites) && payload.suites.length > 0) {
    const suitePayloads = payload.suites;
    const totals = payload.summary || { pass: 0, fail: 0, skip: 0, todo: 0 };
    const overallOk = payload.overallSuccess !== false && (totals.fail || 0) === 0;
    const suiteRows = suitePayloads
      .map(
        (sp) => `<tr>
      <td><span class="badge ${sp.ok ? 'pass' : 'fail'}">${sp.ok ? 'pass' : 'fail'}</span></td>
      <td><code>${escapeHtml(sp.suite)}</code></td>
      <td class="pass">${sp.summary?.pass || 0}</td>
      <td class="fail">${sp.summary?.fail || 0}</td>
      <td>${sp.summary?.skip || 0}</td>
      <td>${formatDuration(sp.durationMs)}</td>
      <td>${
        sp.sourceHtml
          ? `<a href="${escapeHtml(path.basename(sp.sourceHtml))}">module HTML</a>`
          : '—'
      }</td>
    </tr>`
      )
      .join('\n');

    const overallBanner = `<div class="meta" style="border-left-color:${overallOk ? '#28a745' : '#dc3545'};background:${overallOk ? '#dcfce7' : '#fee2e2'}">
      <div style="font-size:1.25em;font-weight:700">${
        overallOk ? 'OVERALL SUCCESS' : 'OVERALL FAILED'
      }</div>
      <div class="muted">Global rollup of ${suitePayloads.length} suite(s) · fail=${totals.fail || 0}</div>
    </div>
    <h2>Suites in this run</h2>
    <p class="muted">Individual harness modules included in this consolidated report.</p>
    <table>
      <thead>
        <tr><th>Status</th><th>Suite / module</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Duration</th><th>Detail</th></tr>
      </thead>
      <tbody>
        ${suiteRows}
      </tbody>
    </table>`;

    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html
      .replace(
        '<title>E2E Coverage — global-consolidated</title>',
        '<title>E2E Global Consolidated Coverage</title>'
      )
      .replace('<h1>E2E Coverage Report</h1>', '<h1>E2E Global Consolidated Report</h1>')
      .replace('<div class="meta">', `${overallBanner}\n    <div class="meta">`);
    fs.writeFileSync(htmlPath, html, 'utf8');

    const latestPath = path.join(REPORTS_DIR, 'coverage-global-latest.html');
    fs.writeFileSync(latestPath, html, 'utf8');
    console.log(`[harness] Regenerated global latest: ${latestPath}`);
  }

  return htmlPath;
}

/**
 * Probe that the app is reachable.
 */
export async function assertAppReachable(baseUrl, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(baseUrl, { signal: controller.signal, redirect: 'manual' });
    // Any HTTP response means the server is up (even 307/401)
    if (res.status === 0) throw new Error('No response');
    console.log(`[harness] App reachable at ${baseUrl} (status ${res.status})`);
    return true;
  } catch (err) {
    console.error(
      `[harness] HARD BLOCKER: App not reachable at ${baseUrl}.\n` +
        `  Start the Next.js app (npm run dev) and ensure backend is up.\n` +
        `  Detail: ${err.message}`
    );
    process.exit(1);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Discover demo IDs via public proxy endpoints (no Clerk required for public list GETs).
 */
export async function discoverDemoIds(baseUrl) {
  const ids = {
    eventId: null,
    planId: null,
    pollId: null,
    focusGroupSlug: null,
    sponsorId: null,
  };

  async function tryJson(urlPath) {
    try {
      const res = await fetch(`${baseUrl}${urlPath}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function firstId(data) {
    if (!data) return null;
    const arr = Array.isArray(data)
      ? data
      : data.content || data._embedded?.['event-details'] || data._embedded?.['membership-plans'] || Object.values(data._embedded || {})[0] || [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const row = arr[0];
    return row?.id ?? row?.eventId ?? null;
  }

  const events = await tryJson('/api/proxy/event-details?size=5&sort=id,desc');
  ids.eventId = firstId(events);

  const plans = await tryJson('/api/proxy/membership-plans?size=5&sort=id,desc');
  ids.planId = firstId(plans);

  const polls = await tryJson('/api/proxy/polls?size=5&sort=id,desc');
  ids.pollId = firstId(polls);

  const sponsors = await tryJson('/api/proxy/event-sponsors?size=5&sort=id,desc');
  ids.sponsorId = firstId(sponsors);

  const fgs = await tryJson('/api/proxy/focus-groups?size=5&sort=id,desc');
  if (fgs) {
    const arr = Array.isArray(fgs) ? fgs : fgs.content || [];
    if (arr[0]?.slug) ids.focusGroupSlug = arr[0].slug;
    else if (arr[0]?.id) ids.focusGroupSlug = String(arr[0].id);
  }

  console.log('[harness] Discovered demo IDs:', ids);
  return ids;
}

/**
 * Replace dynamic segments in a route template using discovered IDs.
 * Returns null if required IDs are missing.
 */
export function resolveDynamicPath(routePath, ids = {}) {
  let out = routePath;
  const map = {
    id: ids.eventId || ids.planId || ids.pollId || ids.sponsorId || ids.id,
    eventId: ids.eventId,
    planId: ids.planId,
    pollId: ids.pollId,
    slug: ids.focusGroupSlug || ids.slug || 'demo',
    compId: ids.compId || '1',
    documentId: ids.documentId || '1',
    transactionId: ids.transactionId || '1',
  };

  // Optional catch-alls → drop segment for smoke (sign-in root)
  out = out.replace(/\/\[\[\.\.\.[^\]]+\]\]/g, '');
  out = out.replace(/\/\[\.\.\.[^\]]+\]/g, '');

  const needed = [...out.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  for (const name of needed) {
    const val = map[name] ?? ids[name];
    if (val == null || val === '') return null;
    out = out.replace(`[${name}]`, String(val));
  }
  if (!out || out === '') out = '/';
  return out;
}

/**
 * page.evaluate has NO built-in timeout — a navigation/HMR reload racing the call
 * can drop the CDP response and hang the await forever (observed as a suite stuck
 * for hours with an idle renderer). Always race page evaluations with a cap.
 */
async function evaluateWithTimeout(page, fn, timeoutMs) {
  let timer;
  const timedOut = Symbol('evaluate-timeout');
  try {
    const result = await Promise.race([
      page.evaluate(fn),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(timedOut), timeoutMs);
      }),
    ]);
    return result === timedOut ? { timedOut: true } : { value: result };
  } catch (err) {
    return { error: err };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Standard smoke check on an already-open Playwright page after goto.
 */
export async function smokeCheckPage(page, { allowSignInRedirect = false, urlHint = '' } = {}) {
  const finalUrl = page.url();
  if (finalUrl.includes('/sign-in') && !urlHint.includes('/sign-in') && !allowSignInRedirect) {
    return { ok: false, message: `Redirected to sign-in: ${finalUrl}` };
  }

  const contentCheck = await evaluateWithTimeout(
    page,
    () => {
      const body = document.body;
      if (!body) return false;
      const text = (body.innerText || '').trim();
      return !!(
        document.querySelector('main') ||
        document.querySelector('h1') ||
        document.querySelector('h2') ||
        document.querySelector('[class*="container"]') ||
        document.querySelector('nav') ||
        text.length > 40
      );
    },
    15000
  );
  if (contentCheck.timedOut) {
    return { ok: false, message: 'Content check timed out after 15s (page unresponsive or mid-reload)' };
  }
  if (contentCheck.error) {
    return { ok: false, message: `Content check failed: ${contentCheck.error.message}` };
  }
  const hasContent = contentCheck.value;

  if (!hasContent) {
    return { ok: false, message: 'Page appears empty / no content' };
  }

  // Visible auth error only
  const errorSelectors = [
    '[role="alert"]',
    '[class*="error"][class*="message"]',
    'div[class*="cl-error"]',
  ];
  for (const selector of errorSelectors) {
    const el = await page.$(selector);
    if (!el) continue;
    const visible = await el.isVisible().catch(() => false);
    if (!visible) continue;
    const text = (await el.textContent().catch(() => '')) || '';
    const lower = text.toLowerCase();
    if (
      lower.includes('unauthorized') ||
      lower.includes('forbidden') ||
      lower.includes('access denied') ||
      lower.includes('401') ||
      lower.includes('403')
    ) {
      return { ok: false, message: `Visible auth error: ${text.trim().slice(0, 120)}` };
    }
  }

  return { ok: true, message: 'OK' };
}

/** Admin home button destinations (from src/app/admin/page.tsx) */
export const ADMIN_HOME_BUTTONS = [
  { label: 'Admin Home', href: '/admin' },
  { label: 'Manage Users', href: '/admin/manage-usage' },
  { label: 'Manage Events', href: '/admin/manage-events' },
  { label: 'Event Analytics', href: '/admin/events/dashboard' },
  { label: 'Event Attendee Registrations', href: '/admin/events/registrations' },
  { label: 'Poll Management', href: '/admin/polls' },
  { label: 'Focus Groups', href: '/admin/focus-groups' },
  { label: 'Membership Plans', href: '/admin/membership/plans' },
  { label: 'Membership Subscriptions', href: '/admin/membership/subscriptions' },
  { label: 'Email Addresses', href: '/admin/tenant-email-addresses' },
  { label: 'Bulk Email', href: '/admin/bulk-email' },
  { label: 'Test Stripe', href: '/admin/test-stripe' },
  { label: 'Media Management', href: '/admin/media' },
  { label: 'Gallery Albums', href: '/admin/gallery/albums' },
  { label: 'Executive Committee', href: '/admin/executive-committee' },
  { label: 'Squad groups', href: '/admin/team-groups' },
  { label: 'Squad roster', href: '/admin/team-members' },
  { label: 'Global Sponsors', href: '/admin/event-sponsors' },
  { label: 'Organizations', href: '/admin/tenant-management/organizations' },
  { label: 'Tenant Settings', href: '/admin/tenant-management/settings' },
  { label: 'Profile Site', href: '/admin/profile-site' },
  { label: 'Gas Station COO', href: '/admin/gas-station' },
  { label: 'Cache records', href: '/admin/homepage-cache' },
  { label: 'Test CRUD', href: '/admin/tenant-management/test' },
  { label: 'Global Performers', href: '/admin/event-featured-performers' },
  { label: 'Global Contacts', href: '/admin/event-contacts' },
  { label: 'Global Emails', href: '/admin/event-emails' },
  { label: 'Global Directors', href: '/admin/event-program-directors' },
  { label: 'QR Scanner', href: '/admin/qr-scanner' },
  { label: 'Check-In Analytics', href: '/admin/check-in-analytics' },
  { label: 'Sales Analytics', href: '/admin/sales-analytics' },
  { label: 'Manual Payments', href: '/admin/manual-payments' },
  { label: 'Official Documents', href: '/admin/official-documents' },
  { label: 'Document categories', href: '/admin/official-document-categories' },
];

/** Paths that must not be inventory-smoked (redirect loops / intentional navigations). */
export const SMOKE_SKIP_PATH_PREFIXES = [
  '/auth/signout-redirect',
];

/**
 * Whether an inventory / smoke path should be skipped (prefix match, query stripped).
 * @param {string} routePath
 */
export function shouldSkipSmokePath(routePath) {
  const p = String(routePath || '').split('?')[0].replace(/\/$/, '') || '/';
  return SMOKE_SKIP_PATH_PREFIXES.some((prefix) => {
    const norm = prefix.replace(/\/$/, '');
    return p === norm || p.startsWith(`${norm}/`);
  });
}

export const E2E_PREFIX = '[E2E]';
