#!/usr/bin/env node
/**
 * SQL export/import guardrails for mosc-temp.
 *
 * Phases:
 *   backup        Rotate timestamped copies of export/ordered/renumbered/PROD + canonical schema (keep N)
 *   post-export   Validate export.sql after pg_dump (+ optional live Docker agenda URL compare)
 *   post-prepare  Validate ordered + renumbered (+ PROD if present) after reorder/PROD steps
 *   pre-import    Validate SQL files + schema CREATE TABLE vs INSERT columns before schema/data apply
 *   update-manifest  Refresh trackedTables + critical mins from a validated export.sql
 *
 * Agenda / media URLs:
 *   pg_dump already exports event_agenda_item.image_url and event_media.file_url (S3 URL strings, not blobs).
 *   Content checks + optional --docker-container live compare catch stale dumps exported before re-upload.
 *
 * Exit 0 = OK, 1 = FAIL (batch must stop), 2 = OK with warnings only (still exit 0 unless --strict-warnings)
 *
 * Usage:
 *   node scripts/sql_export_import_guardrails.cjs backup [--sqls-dir PATH] [--keep 5]
 *   node scripts/sql_export_import_guardrails.cjs post-export [--sqls-dir PATH] [--docker-container ID]
 *   node scripts/sql_export_import_guardrails.cjs post-prepare [--sqls-dir PATH] [--docker-container ID]
 *   node scripts/sql_export_import_guardrails.cjs pre-import [--sqls-dir PATH] [--import-file PATH]
 *   node scripts/sql_export_import_guardrails.cjs update-manifest [--sqls-dir PATH]
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const INSERT_RE = /INSERT\s+INTO\s+public\.([a-zA-Z0-9_]+)\s*\(([^)]*)\)/gi;
const AGENDA_INSERT_RE =
  /INSERT\s+INTO\s+public\.event_agenda_item\s*\(([^)]*)\)\s*VALUES\s*\(([\s\S]*?)\);/gi;
const CONFLICT_RE = /^(<<<<<<<|=======|>>>>>>>)/m;

function parseArgs(argv) {
  const out = {
    cmd: null,
    sqlsDir: null,
    keep: null,
    importFile: null,
    strictWarnings: false,
    dockerContainer: null,
    dbUser: 'event_site_admin',
    dbName: 'event_site_manager_db',
  };
  const args = argv.slice(2);
  if (!args.length) return out;
  out.cmd = args[0];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--sqls-dir' && args[i + 1]) {
      out.sqlsDir = args[++i];
    } else if (a.startsWith('--sqls-dir=')) {
      out.sqlsDir = a.slice('--sqls-dir='.length);
    } else if (a === '--keep' && args[i + 1]) {
      out.keep = Number(args[++i]);
    } else if (a.startsWith('--keep=')) {
      out.keep = Number(a.slice('--keep='.length));
    } else if (a === '--import-file' && args[i + 1]) {
      out.importFile = args[++i];
    } else if (a.startsWith('--import-file=')) {
      out.importFile = a.slice('--import-file='.length);
    } else if (a === '--docker-container' && args[i + 1]) {
      out.dockerContainer = args[++i];
    } else if (a.startsWith('--docker-container=')) {
      out.dockerContainer = a.slice('--docker-container='.length);
    } else if (a === '--db-user' && args[i + 1]) {
      out.dbUser = args[++i];
    } else if (a.startsWith('--db-user=')) {
      out.dbUser = a.slice('--db-user='.length);
    } else if (a === '--db-name' && args[i + 1]) {
      out.dbName = args[++i];
    } else if (a.startsWith('--db-name=')) {
      out.dbName = a.slice('--db-name='.length);
    } else if (a === '--strict-warnings') {
      out.strictWarnings = true;
    }
  }
  return out;
}

function resolveSqlsDir(cliDir) {
  if (cliDir) return path.resolve(cliDir);
  // scripts/ -> mosc-temp/code_html_template/SQLS
  return path.resolve(__dirname, '..', 'code_html_template', 'SQLS');
}

function loadManifest(sqlsDir) {
  const manifestPath = path.join(sqlsDir, 'guardrails', 'sql_export_import_guardrails.manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  return { manifest: JSON.parse(fs.readFileSync(manifestPath, 'utf8')), manifestPath };
}

function absFromSqls(sqlsDir, relativePath) {
  return path.join(sqlsDir, ...relativePath.split(/[/\\]/));
}

function analyzeSqlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, path: filePath };
  }
  const stat = fs.statSync(filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const counts = Object.create(null);
  const columnsByTable = Object.create(null);
  let m;
  INSERT_RE.lastIndex = 0;
  while ((m = INSERT_RE.exec(text)) !== null) {
    const table = m[1].toLowerCase();
    counts[table] = (counts[table] || 0) + 1;
    if (!columnsByTable[table]) {
      columnsByTable[table] = m[2]
        .split(',')
        .map((c) => c.trim().replace(/^"|"$/g, '').toLowerCase())
        .filter(Boolean);
    }
  }
  const tables = Object.keys(counts);
  const totalInserts = tables.reduce((s, t) => s + counts[t], 0);
  return {
    exists: true,
    path: filePath,
    bytes: stat.size,
    counts,
    columnsByTable,
    tables,
    totalInserts,
    distinctTables: tables.length,
    hasConflictMarkers: CONFLICT_RE.test(text),
  };
}

function parseSchemaCreateColumns(schemaPath) {
  if (!fs.existsSync(schemaPath)) return {};
  const text = fs.readFileSync(schemaPath, 'utf8');
  const byTable = Object.create(null);
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const table = m[1].toLowerCase();
    const body = m[2];
    const cols = [];
    for (const line of body.split('\n')) {
      const trimmed = line.trim().replace(/,$/, '');
      if (!trimmed || /^CONSTRAINT\b/i.test(trimmed) || /^CHECK\b/i.test(trimmed) || /^PRIMARY\b/i.test(trimmed) || /^UNIQUE\b/i.test(trimmed) || /^FOREIGN\b/i.test(trimmed) || /^REFERENCES\b/i.test(trimmed)) {
        continue;
      }
      // Support quoted identifiers: "location" varchar(...)
      const colMatch = trimmed.match(/^"?([a-zA-Z0-9_]+)"?\s+/i);
      if (colMatch) cols.push(colMatch[1].toLowerCase());
    }
    byTable[table] = cols;
  }
  return byTable;
}

function pushIssue(issues, level, message) {
  issues.push({ level, message });
  const tag = level === 'FAIL' ? 'FAIL' : level === 'WARN' ? 'WARN' : 'OK';
  console.log(` [GUARDRAIL ${tag}] ${message}`);
}

function validateFileAgainstSpec(label, analysis, spec, issues) {
  if (!analysis.exists) {
    pushIssue(issues, 'FAIL', `${label}: file missing (${analysis.path})`);
    return;
  }
  if (analysis.hasConflictMarkers) {
    pushIssue(issues, 'FAIL', `${label}: unresolved git conflict markers found`);
  }
  if (spec.minBytes != null && analysis.bytes < spec.minBytes) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: size ${analysis.bytes} bytes < min ${spec.minBytes} (possible truncated/corrupt dump)`
    );
  }
  if (spec.minTotalInserts != null && analysis.totalInserts < spec.minTotalInserts) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: total INSERTs ${analysis.totalInserts} < min ${spec.minTotalInserts}`
    );
  }
  if (spec.minDistinctTables != null && analysis.distinctTables < spec.minDistinctTables) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: distinct tables ${analysis.distinctTables} < min ${spec.minDistinctTables}`
    );
  }
  console.log(
    ` [GUARDRAIL OK] ${label}: ${analysis.bytes} bytes, ${analysis.totalInserts} INSERTs, ${analysis.distinctTables} tables`
  );
}

function validateCriticalAndTracked(label, analysis, manifest, issues) {
  if (!analysis.exists) return;
  const critical = manifest.criticalTables || {};
  for (const [table, minCount] of Object.entries(critical)) {
    if (table.startsWith('_')) continue;
    const count = analysis.counts[table] || 0;
    if (count < minCount) {
      pushIssue(
        issues,
        'FAIL',
        `${label}: critical table "${table}" has ${count} INSERT(s), required >= ${minCount}`
      );
    }
  }

  const tracked = manifest.trackedTables || [];
  const present = new Set(analysis.tables);
  const missingTracked = tracked.filter((t) => !present.has(t));
  if (missingTracked.length) {
    const level = manifest.failOnMissingTrackedTables ? 'FAIL' : 'WARN';
    pushIssue(
      issues,
      level,
      `${label}: ${missingTracked.length} tracked table(s) have zero INSERTs: ${missingTracked.slice(0, 12).join(', ')}${missingTracked.length > 12 ? ', ...' : ''}`
    );
  }

  const known = new Set([...tracked, ...Object.keys(critical).filter((k) => !k.startsWith('_'))]);
  const unknown = analysis.tables.filter((t) => !known.has(t));
  if (unknown.length) {
    const level = manifest.failOnUnknownTables ? 'FAIL' : 'WARN';
    pushIssue(
      issues,
      level,
      `${label}: ${unknown.length} new/untracked table(s): ${unknown.join(', ')} — run update-manifest after confirming export is good`
    );
  }
}

function resolveSchemaSyncTables(manifest, sqlAnalysis) {
  const raw = manifest.schemaColumnSyncTables;
  if (!raw || raw.length === 0 || raw.includes('*') || raw.includes('all')) {
    return [...(sqlAnalysis.tables || [])].sort();
  }
  return raw;
}

function validateSchemaColumnSync(sqlAnalysis, schemaCols, tables, issues, schemaLabel) {
  if (!sqlAnalysis.exists) return;
  const label = schemaLabel || 'Event_Site_Manager_Latest_Schema.sql';
  let checked = 0;
  for (const table of tables) {
    const insertCols = sqlAnalysis.columnsByTable[table];
    if (!insertCols || !insertCols.length) {
      pushIssue(issues, 'WARN', `schema sync: no INSERT sample for "${table}"`);
      continue;
    }
    const createCols = schemaCols[table];
    if (!createCols || !createCols.length) {
      pushIssue(
        issues,
        'FAIL',
        `schema sync: table "${table}" has INSERTs but no CREATE TABLE in ${label} — update canonical schema`
      );
      continue;
    }
    const createSet = new Set(createCols);
    const missing = insertCols.filter((c) => !createSet.has(c));
    if (missing.length) {
      pushIssue(
        issues,
        'FAIL',
        `schema sync: "${table}" INSERT columns missing from ${label}: ${missing.join(', ')}`
      );
    } else {
      checked += 1;
    }
  }
  console.log(` [GUARDRAIL OK] schema sync: ${checked}/${tables.length} table(s) INSERT cols ⊆ CREATE TABLE`);
}

/** Parse a single pg_dump VALUES (...) tuple into JS values (strings, null, bare tokens). */
function parseSqlValueList(valuesClause) {
  const values = [];
  let i = 0;
  const s = valuesClause;
  while (i < s.length) {
    while (i < s.length && /[\s,]/.test(s[i])) i += 1;
    if (i >= s.length || s[i] === ')') break;
    if (/^NULL\b/i.test(s.slice(i))) {
      values.push(null);
      i += 4;
      continue;
    }
    if (s[i] === "'") {
      i += 1;
      let out = '';
      while (i < s.length) {
        if (s[i] === "'" && s[i + 1] === "'") {
          out += "'";
          i += 2;
          continue;
        }
        if (s[i] === "'") {
          i += 1;
          break;
        }
        out += s[i];
        i += 1;
      }
      values.push(out);
      continue;
    }
    const start = i;
    while (i < s.length && !/[\s,]/.test(s[i]) && s[i] !== ')') i += 1;
    values.push(s.slice(start, i));
  }
  return values;
}

/**
 * Extract event_agenda_item rows from column-INSERT SQL (image_url / is_published / id).
 * Returns { rows, fingerprints: Set("id|image_url") }.
 */
function extractAgendaItemRowsFromSql(text) {
  const rows = [];
  const fingerprints = new Set();
  AGENDA_INSERT_RE.lastIndex = 0;
  let m;
  while ((m = AGENDA_INSERT_RE.exec(text)) !== null) {
    const cols = m[1]
      .split(',')
      .map((c) => c.trim().replace(/^"|"$/g, '').toLowerCase())
      .filter(Boolean);
    const vals = parseSqlValueList(m[2]);
    const get = (name) => {
      const idx = cols.indexOf(name);
      return idx >= 0 ? vals[idx] : undefined;
    };
    const id = get('id');
    const imageUrl = get('image_url');
    const isPublishedRaw = get('is_published');
    const isPublished =
      isPublishedRaw === true ||
      isPublishedRaw === 'true' ||
      isPublishedRaw === 't' ||
      isPublishedRaw === 'TRUE';
    const urlStr = imageUrl == null ? '' : String(imageUrl).trim();
    rows.push({
      id: id != null ? String(id) : '',
      eventId: get('event_id') != null ? String(get('event_id')) : '',
      imageUrl: urlStr,
      isPublished,
      hasImageUrl: urlStr.length > 0,
    });
    if (id != null) fingerprints.add(`${String(id)}|${urlStr}`);
  }
  return { rows, fingerprints };
}

function validateAgendaMediaContent(label, filePath, manifest, issues) {
  const checks = manifest.contentChecks?.eventAgendaItemImageUrls;
  if (!checks || checks.enabled === false) return null;
  if (!fs.existsSync(filePath)) return null;

  const text = fs.readFileSync(filePath, 'utf8');
  const { rows, fingerprints } = extractAgendaItemRowsFromSql(text);
  const withUrl = rows.filter((r) => r.hasImageUrl);
  const publishedMissing = rows.filter((r) => r.isPublished && !r.hasImageUrl);
  const minWithUrl = checks.minRowsWithNonEmptyImageUrl ?? 1;

  if (checks.requireImageUrlColumn !== false && rows.length > 0) {
    // Column presence is implied by successful parse of image_url; if zero rows parsed
    // but INSERT count exists, fail hard (parser / dump format drift).
    const agendaInsertCount = (text.match(/INSERT\s+INTO\s+public\.event_agenda_item\b/gi) || []).length;
    if (agendaInsertCount > 0 && rows.length === 0) {
      pushIssue(
        issues,
        'FAIL',
        `${label}: could not parse event_agenda_item INSERT rows (expected image_url column) — dump format changed?`
      );
      return { rows, fingerprints };
    }
  }

  if (withUrl.length < minWithUrl) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: event_agenda_item rows with non-empty image_url = ${withUrl.length}, required >= ${minWithUrl} (re-export after uploading agenda images; SQL stores S3 URL strings, not blobs)`
    );
  } else {
    console.log(
      ` [GUARDRAIL OK] ${label}: event_agenda_item image_url — ${withUrl.length}/${rows.length} row(s) have URLs`
    );
  }

  if (checks.failIfPublishedMissingImageUrl !== false && publishedMissing.length) {
    const sample = publishedMissing
      .slice(0, 5)
      .map((r) => `id=${r.id}/event=${r.eventId}`)
      .join(', ');
    pushIssue(
      issues,
      'FAIL',
      `${label}: ${publishedMissing.length} published event_agenda_item row(s) missing image_url (${sample}${publishedMissing.length > 5 ? ', ...' : ''})`
    );
  }

  return { rows, fingerprints };
}

function fetchLiveAgendaFingerprints(containerId, dbUser, dbName) {
  const sql =
    "SELECT id::text || '|' || COALESCE(image_url, '') FROM event_agenda_item ORDER BY id;";
  const out = execFileSync(
    'docker',
    ['exec', containerId, 'psql', '-U', dbUser, '-d', dbName, '-t', '-A', '-c', sql],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
  return new Set(
    out
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
  );
}

/**
 * Compare SQL dump agenda id|image_url fingerprints to live Docker Postgres.
 * Catches "exported before re-upload" stale dumps.
 */
function validateAgendaUrlsMatchLiveDocker(label, sqlFingerprints, args, manifest, issues) {
  const liveCfg = manifest.contentChecks?.liveDockerCompare;
  if (!liveCfg || liveCfg.enabled === false || liveCfg.compareAgendaImageUrls === false) return;
  if (!args.dockerContainer) {
    console.log(
      ` [GUARDRAIL OK] ${label}: live Docker agenda URL compare skipped (no --docker-container)`
    );
    return;
  }
  if (!sqlFingerprints) {
    pushIssue(issues, 'WARN', `${label}: live Docker compare skipped (no SQL fingerprints)`);
    return;
  }

  let live;
  try {
    live = fetchLiveAgendaFingerprints(args.dockerContainer, args.dbUser, args.dbName);
  } catch (err) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: live Docker agenda URL compare failed: ${err.message || err}`
    );
    return;
  }

  const onlyLive = [...live].filter((f) => !sqlFingerprints.has(f));
  const onlySql = [...sqlFingerprints].filter((f) => !live.has(f));
  if (onlyLive.length || onlySql.length) {
    const sampleLive = onlyLive.slice(0, 3).join(' || ');
    const sampleSql = onlySql.slice(0, 3).join(' || ');
    pushIssue(
      issues,
      'FAIL',
      `${label}: event_agenda_item image_url mismatch vs live Docker DB (live-only=${onlyLive.length}, sql-only=${onlySql.length}). Re-export after media/agenda uploads before copying SQL. samples live-only=[${sampleLive}] sql-only=[${sampleSql}]`
    );
  } else {
    console.log(
      ` [GUARDRAIL OK] ${label}: event_agenda_item image_url fingerprints match live Docker (${live.size} row(s))`
    );
  }
}

function summarizeAndExit(issues, strictWarnings) {
  const fails = issues.filter((i) => i.level === 'FAIL');
  const warns = issues.filter((i) => i.level === 'WARN');
  console.log('');
  console.log(` Guardrail summary: ${fails.length} FAIL, ${warns.length} WARN`);
  if (fails.length) {
    console.log(' Guardrails FAILED — fix export/schema/manifest before continuing import.');
    process.exit(1);
  }
  if (strictWarnings && warns.length) {
    console.log(' Guardrails failed due to --strict-warnings.');
    process.exit(1);
  }
  console.log(' Guardrails PASSED.');
  process.exit(0);
}

function backupFiles(sqlsDir, keep) {
  const { manifest } = loadManifest(sqlsDir);
  const keepN = keep || manifest.backupKeep || 5;
  const backupRoot = path.join(sqlsDir, 'guardrails', 'backups');
  fs.mkdirSync(backupRoot, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  // Include canonical schema so Event_Site_Manager_Latest_Schema.sql also keeps last N stamped copies
  const keys = ['export.sql', 'ordered.sql', 'renumbered.sql', 'ordered_PROD.sql', 'schema.sql'];
  const copied = [];
  for (const key of keys) {
    const rel = manifest.files[key]?.relativePath;
    if (!rel) continue;
    const src = absFromSqls(sqlsDir, rel);
    if (!fs.existsSync(src)) {
      console.log(` [GUARDRAIL OK] backup skip (missing): ${rel}`);
      continue;
    }
    const base = path.basename(rel);
    const dest = path.join(backupRoot, `${stamp}__${base}`);
    fs.copyFileSync(src, dest);
    // Touch dest mtime so prune-by-mtime keeps the newest stamp even when copy preserves source mtime
    const now = new Date();
    fs.utimesSync(dest, now, now);
    copied.push(dest);
    console.log(` [GUARDRAIL OK] backed up -> ${path.relative(sqlsDir, dest)}`);
  }
  if (copied.length === 0) {
    throw new Error(
      `backup copied 0 files under ${backupRoot} — check SQLS paths in manifest (expected export/ordered/renumbered/PROD/schema)`
    );
  }

  // Auto-delete older than keepN per logical file basename
  const byBase = Object.create(null);
  for (const name of fs.readdirSync(backupRoot)) {
    const full = path.join(backupRoot, name);
    if (!fs.statSync(full).isFile()) continue;
    const m = name.match(/^\d{4}-\d{2}-\d{2}T.+?__(.+)$/);
    if (!m) continue;
    const base = m[1];
    if (!byBase[base]) byBase[base] = [];
    byBase[base].push({ name, full, mtime: fs.statSync(full).mtimeMs });
  }
  for (const [base, list] of Object.entries(byBase)) {
    list.sort((a, b) => b.mtime - a.mtime);
    const drop = list.slice(keepN);
    for (const d of drop) {
      fs.unlinkSync(d.full);
      console.log(` [GUARDRAIL OK] pruned old backup: ${d.name}`);
    }
    console.log(` [GUARDRAIL OK] retaining ${Math.min(list.length, keepN)} backup(s) for ${base}`);
  }
  return copied;
}

function cmdPostExport(sqlsDir, args) {
  const { manifest } = loadManifest(sqlsDir);
  const issues = [];
  const exportPath = absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath);
  const analysis = analyzeSqlFile(exportPath);
  validateFileAgainstSpec('export.sql', analysis, manifest.files['export.sql'], issues);
  validateCriticalAndTracked('export.sql', analysis, manifest, issues);
  const agenda = validateAgendaMediaContent('export.sql', exportPath, manifest, issues);
  validateAgendaUrlsMatchLiveDocker(
    'export.sql',
    agenda?.fingerprints,
    args,
    manifest,
    issues
  );
  summarizeAndExit(issues, args.strictWarnings);
}

function cmdPostPrepare(sqlsDir, args) {
  const { manifest } = loadManifest(sqlsDir);
  const issues = [];
  for (const key of ['ordered.sql', 'renumbered.sql', 'ordered_PROD.sql']) {
    const spec = manifest.files[key];
    const filePath = absFromSqls(sqlsDir, spec.relativePath);
    const analysis = analyzeSqlFile(filePath);
    // PROD may be absent mid-pipeline; only fail if missing when validating after step 3
    if (key === 'ordered_PROD.sql' && !analysis.exists) {
      pushIssue(issues, 'WARN', 'ordered_PROD.sql not present yet (OK mid-pipeline)');
      continue;
    }
    validateFileAgainstSpec(key, analysis, spec, issues);
    validateCriticalAndTracked(key, analysis, manifest, issues);
    validateAgendaMediaContent(key, filePath, manifest, issues);
  }
  // Live id|url compare must use export/ordered (pre-renumber) — renumbered PKs differ from live
  const exportPath = absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath);
  const orderedPath = absFromSqls(sqlsDir, manifest.files['ordered.sql'].relativePath);
  const liveSourcePath = fs.existsSync(exportPath) ? exportPath : orderedPath;
  const liveSourceLabel = fs.existsSync(exportPath) ? 'export.sql' : 'ordered.sql';
  const fingerprints = fs.existsSync(liveSourcePath)
    ? extractAgendaItemRowsFromSql(fs.readFileSync(liveSourcePath, 'utf8')).fingerprints
    : null;
  validateAgendaUrlsMatchLiveDocker(liveSourceLabel, fingerprints, args, manifest, issues);
  summarizeAndExit(issues, args.strictWarnings);
}

function cmdPreImport(sqlsDir, importFile, args) {
  const { manifest } = loadManifest(sqlsDir);
  const issues = [];

  const schemaPath = absFromSqls(sqlsDir, manifest.files['schema.sql'].relativePath);
  const schemaSpec = manifest.files['schema.sql'];
  if (!fs.existsSync(schemaPath)) {
    pushIssue(issues, 'FAIL', `schema file missing: ${schemaPath}`);
  } else {
    const bytes = fs.statSync(schemaPath).size;
    if (bytes < (schemaSpec.minBytes || 0)) {
      pushIssue(issues, 'FAIL', `schema file too small: ${bytes} < ${schemaSpec.minBytes}`);
    } else {
      console.log(` [GUARDRAIL OK] schema.sql: ${bytes} bytes (${schemaPath})`);
    }
  }

  // Always validate export + ordered baselines when present
  const exportPath = absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath);
  const exportAnalysis = analyzeSqlFile(exportPath);
  for (const key of ['export.sql', 'ordered.sql']) {
    const spec = manifest.files[key];
    const filePath = absFromSqls(sqlsDir, spec.relativePath);
    const analysis = key === 'export.sql' ? exportAnalysis : analyzeSqlFile(filePath);
    validateFileAgainstSpec(key, analysis, spec, issues);
    validateCriticalAndTracked(key, analysis, manifest, issues);
    validateAgendaMediaContent(key, filePath, manifest, issues);
  }

  let importAnalysis = null;
  if (importFile) {
    const resolvedImport = path.resolve(importFile);
    importAnalysis = analyzeSqlFile(resolvedImport);
    const base = path.basename(resolvedImport).toLowerCase();
    const isFullDump =
      base === 'export.sql' ||
      base.includes('corrected_event_media_inserts.ordered') ||
      base.includes('corrected_event_media_inserts.renumbered') ||
      base.includes('ordered_prod');
    validateFileAgainstSpec(`import-file(${path.basename(resolvedImport)})`, importAnalysis, {
      minBytes: isFullDump ? 1000000 : 1000,
      minTotalInserts: isFullDump ? 1000 : 1,
      minDistinctTables: isFullDump ? 20 : 1,
    }, issues);
    // Tenant/MOSC partial dumps: do not enforce full critical table set on the import file itself
    if (isFullDump) {
      validateCriticalAndTracked(`import-file(${path.basename(resolvedImport)})`, importAnalysis, manifest, issues);
      validateAgendaMediaContent(`import-file(${path.basename(resolvedImport)})`, resolvedImport, manifest, issues);
    } else {
      console.log(
        ` [GUARDRAIL OK] import-file is a partial/custom dump (${path.basename(resolvedImport)}); critical-table mins applied to export/ordered only`
      );
    }
  } else {
    // Prefer renumbered for local, else ordered
    const renPath = absFromSqls(sqlsDir, manifest.files['renumbered.sql'].relativePath);
    const ordPath = absFromSqls(sqlsDir, manifest.files['ordered.sql'].relativePath);
    const ren = analyzeSqlFile(renPath);
    const ord = analyzeSqlFile(ordPath);
    importAnalysis = ren.exists ? ren : ord;
    const key = ren.exists ? 'renumbered.sql' : 'ordered.sql';
    const importPathForAgenda = ren.exists ? renPath : ordPath;
    validateFileAgainstSpec(key, importAnalysis, manifest.files[key], issues);
    validateCriticalAndTracked(key, importAnalysis, manifest, issues);
    validateAgendaMediaContent(key, importPathForAgenda, manifest, issues);
  }

  // Live compare uses export.sql ids (never renumbered PKs); skipped when no --docker-container
  if (exportAnalysis.exists) {
    const fingerprints = extractAgendaItemRowsFromSql(fs.readFileSync(exportPath, 'utf8')).fingerprints;
    validateAgendaUrlsMatchLiveDocker('export.sql', fingerprints, args, manifest, issues);
  }

  const schemaCols = parseSchemaCreateColumns(schemaPath);
  const syncSource = exportAnalysis.exists ? exportAnalysis : importAnalysis;
  const syncTables = resolveSchemaSyncTables(manifest, syncSource);
  const schemaRel = manifest.files['schema.sql']?.relativePath || 'Current_Sqls/Event_Site_Manager_Latest_Schema.sql';
  validateSchemaColumnSync(syncSource, schemaCols, syncTables, issues, path.basename(schemaRel));

  summarizeAndExit(issues, args.strictWarnings);
}

function cmdUpdateManifest(sqlsDir) {
  const { manifest, manifestPath } = loadManifest(sqlsDir);
  const exportPath = absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath);
  const analysis = analyzeSqlFile(exportPath);
  if (!analysis.exists) throw new Error(`export.sql not found: ${exportPath}`);
  if (analysis.hasConflictMarkers) throw new Error('export.sql has conflict markers — resolve before update-manifest');

  const sortedTables = [...analysis.tables].sort();
  manifest.trackedTables = sortedTables;
  manifest.updatedAt = new Date().toISOString().slice(0, 10);

  // Refresh critical mins to current counts (floor) for known critical keys only
  for (const table of Object.keys(manifest.criticalTables || {})) {
    if (table.startsWith('_')) continue;
    const count = analysis.counts[table] || 0;
    if (count > 0) {
      manifest.criticalTables[table] = count;
    }
  }

  // Nudge file floors to ~70% of current size/inserts
  const floor = (n, ratio = 0.7) => Math.max(1, Math.floor(n * ratio));
  manifest.files['export.sql'].minBytes = floor(analysis.bytes);
  manifest.files['export.sql'].minTotalInserts = floor(analysis.totalInserts);
  manifest.files['export.sql'].minDistinctTables = Math.max(20, floor(analysis.distinctTables, 0.85));

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(` [GUARDRAIL OK] updated manifest: ${manifestPath}`);
  console.log(` [GUARDRAIL OK] trackedTables=${sortedTables.length}, critical mins refreshed from export.sql`);
  process.exit(0);
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.cmd || ['-h', '--help', 'help'].includes(args.cmd)) {
    console.log(`Usage:
  node scripts/sql_export_import_guardrails.cjs backup [--sqls-dir PATH] [--keep 5]
  node scripts/sql_export_import_guardrails.cjs post-export [--sqls-dir PATH] [--docker-container ID]
  node scripts/sql_export_import_guardrails.cjs post-prepare [--sqls-dir PATH] [--docker-container ID]
  node scripts/sql_export_import_guardrails.cjs pre-import [--sqls-dir PATH] [--import-file PATH] [--docker-container ID]
  node scripts/sql_export_import_guardrails.cjs update-manifest [--sqls-dir PATH]`);
    process.exit(args.cmd ? 0 : 1);
  }

  const sqlsDir = resolveSqlsDir(args.sqlsDir);
  if (!fs.existsSync(sqlsDir)) {
    console.error(`SQLS dir not found: ${sqlsDir}`);
    process.exit(1);
  }

  try {
    switch (args.cmd) {
      case 'backup':
        backupFiles(sqlsDir, args.keep);
        console.log(' Guardrails backup complete.');
        process.exit(0);
        break;
      case 'post-export':
        cmdPostExport(sqlsDir, args);
        break;
      case 'post-prepare':
        cmdPostPrepare(sqlsDir, args);
        break;
      case 'pre-import':
        cmdPreImport(sqlsDir, args.importFile, args);
        break;
      case 'update-manifest':
        cmdUpdateManifest(sqlsDir);
        break;
      default:
        console.error(`Unknown command: ${args.cmd}`);
        process.exit(1);
    }
  } catch (err) {
    console.error(` [GUARDRAIL FAIL] ${err.message || err}`);
    process.exit(1);
  }
}

main();
