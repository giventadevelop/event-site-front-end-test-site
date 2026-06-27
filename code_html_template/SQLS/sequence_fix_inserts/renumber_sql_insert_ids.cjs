#!/usr/bin/env node
/**
 * Renumbers INSERT primary keys per table (1, 2, 3, …) and rewrites FK columns.
 * Trims Spring Batch data to the first N job executions (+ related rows) and first N batch_job_execution_log rows.
 *
 * Usage:
 *   node renumber_sql_insert_ids.cjs [--dry-run] [--start-id=1] [--batch-executions=3] [--batch-logs=3]
 *     [--input=path] [--output=path]
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
/** Canonical import file (batch import uses SQLS/corrected_event_media_inserts.ordered.sql). */
const DEFAULT_INPUT = path.join(SCRIPT_DIR, '..', 'corrected_event_media_inserts.ordered.sql');
const DEFAULT_OUTPUT = path.join(SCRIPT_DIR, 'corrected_event_media_inserts.renumbered.sql');
const SCHEMA_FILE = path.join(SCRIPT_DIR, '..', 'Current_Sqls', 'Latest_Schema_Post__Blob_Claude_12.sql');

const MANUAL_FK = {
  event_live_update: { event_id: 'event_details' },
  event_score_card: { event_id: 'event_details' },
  event_media: { uploaded_by_id: 'user_profile' },
  rel_event_details__discount_codes: {
    event_details_id: 'event_details',
    discount_codes_id: 'discount_code',
  },
  batch_job_execution: { job_instance_id: 'batch_job_instance' },
  batch_job_execution_context: { job_execution_id: 'batch_job_execution' },
  batch_job_execution_params: { job_execution_id: 'batch_job_execution' },
  batch_step_execution: { job_execution_id: 'batch_job_execution' },
  batch_step_execution_context: { step_execution_id: 'batch_step_execution' },
};

/** Non-FK numeric columns that may legitimately exceed 100000 (do not treat as stale IDs). */
const NON_ID_NUMERIC_COLUMNS = new Set([
  'file_size',
  'total_amount',
  'price_per_unit',
  'tax_amount',
  'platform_fee_amount',
  'discount_amount',
  'service_fee',
  'final_amount',
  'net_payout_amount',
  'refund_amount',
  'stripe_amount_discount',
  'stripe_amount_tax',
  'stripe_fee_amount',
  'home_page_hero_display_duration_seconds',
  'display_order',
  'download_count',
  'priority_ranking',
  'transaction_count',
]);

const FK_FALLBACK = {
  event_details: { recurrence_series_id: ['event_recurrence_series', 'event_details'] },
};

const BATCH_SPRING_TABLES = new Set([
  'batch_job_instance',
  'batch_job_execution',
  'batch_job_execution_context',
  'batch_job_execution_params',
  'batch_step_execution',
  'batch_step_execution_context',
]);

const PK_COLUMN = {
  batch_job_instance: 'job_instance_id',
  batch_job_execution: 'job_execution_id',
  batch_step_execution: 'step_execution_id',
  batch_job_execution_context: 'job_execution_id',
  batch_step_execution_context: 'step_execution_id',
};

const SKIP_PK_TABLES = new Set(['databasechangelog']);

/** Demo/orphan event_details IDs in source data with no matching parent row */
const SYNTHETIC_EVENT_DETAILS_ALIASES = {
  500001: 1,
  500002: 2,
  500003: 3,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    dryRun: false,
    startId: 1,
    batchExecutions: 3,
    batchLogs: 3,
  };
  for (const arg of args) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--input=')) opts.input = path.resolve(arg.slice(8));
    else if (arg.startsWith('--output=')) opts.output = path.resolve(arg.slice(9));
    else if (arg.startsWith('--start-id=')) opts.startId = parseInt(arg.slice(11), 10);
    else if (arg.startsWith('--batch-executions=')) opts.batchExecutions = parseInt(arg.slice(19), 10);
    else if (arg.startsWith('--batch-logs=')) opts.batchLogs = parseInt(arg.slice(13), 10);
  }
  return opts;
}

function readSqlFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le').slice(1);
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.toString('utf8').slice(1);
  }
  let sql = buffer.toString('utf8');
  if (sql.length > 0 && sql.charCodeAt(0) === 0 && sql.charCodeAt(1) !== 0) {
    sql = buffer.toString('utf16le');
  }
  return sql;
}

function parseInsertStatements(sql) {
  const lines = sql.split(/\r?\n/);
  const statements = [];
  let current = '';
  let inInsert = false;

  for (let line of lines) {
    line = line.replace(/\r/g, '');
    if (/^INSERT INTO public\.[a-zA-Z0-9_]+ /.test(line)) {
      if (current.trim()) statements.push(current.trim());
      current = line;
      inInsert = true;
      if (line.trim().endsWith(';')) {
        statements.push(current.trim());
        current = '';
        inInsert = false;
      }
    } else if (inInsert) {
      current += '\n' + line;
      if (line.trim().endsWith(';')) {
        statements.push(current.trim());
        current = '';
        inInsert = false;
      }
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function unwrapValuesTuple(s) {
  s = s.trim();
  if (!s.startsWith('(')) return s;
  let depth = 0;
  let inString = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'") {
      if (!inString) inString = true;
      else if (s[i + 1] === "'") {
        i++;
      } else {
        inString = false;
      }
      continue;
    }
    if (inString) continue;
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0 && i === s.length - 1) {
        return s.slice(1, i).trim();
      }
    }
  }
  return s;
}

function parseInsert(stmt) {
  const headerMatch = stmt.match(
    /^INSERT INTO public\.([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*/is
  );
  if (!headerMatch) return null;
  const table = headerMatch[1];
  const columns = headerMatch[2].split(',').map((c) => c.trim().toLowerCase());
  const valuesStart = headerMatch[0].length;
  let valuesStr = stmt.slice(valuesStart).trim();
  if (valuesStr.endsWith(';')) valuesStr = valuesStr.slice(0, -1).trim();
  valuesStr = unwrapValuesTuple(valuesStr);
  const tokens = tokenizeValues(valuesStr);
  return { table, columns, tokens, raw: stmt };
}

function tokenizeValues(valuesStr) {
  const tokens = [];
  let i = 0;
  const s = valuesStr;

  function skipWs() {
    while (i < s.length && /\s/.test(s[i])) i++;
  }

  while (i < s.length) {
    skipWs();
    if (i >= s.length) break;
    if (s[i] === ',') {
      i++;
      continue;
    }
    if (s.substring(i, i + 4).toUpperCase() === 'NULL') {
      tokens.push({ type: 'null', raw: 'NULL' });
      i += 4;
      continue;
    }
    if (s[i] === "'") {
      let raw = "'";
      i++;
      while (i < s.length) {
        if (s[i] === "'") {
          raw += "'";
          i++;
          if (i < s.length && s[i] === "'") {
            raw += "'";
            i++;
            continue;
          }
          break;
        }
        raw += s[i];
        i++;
      }
      tokens.push({ type: 'string', raw });
      continue;
    }
    if (/[-0-9.]/.test(s[i])) {
      let raw = '';
      while (i < s.length && /[-0-9.eE+]/.test(s[i])) {
        raw += s[i];
        i++;
      }
      tokens.push({ type: 'number', raw, value: Number(raw) });
      continue;
    }
    if (/[a-zA-Z_]/.test(s[i])) {
      let raw = '';
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
        raw += s[i];
        i++;
      }
      const lower = raw.toLowerCase();
      if (lower === 'true' || lower === 'false') {
        tokens.push({ type: 'bool', raw: lower });
      } else {
        tokens.push({ type: 'ident', raw });
      }
      continue;
    }
    throw new Error(`Unexpected char '${s[i]}' at ${i}: ${s.slice(0, 100)}...`);
  }
  return tokens;
}

function buildFkMapFromSchema(schemaPath) {
  const fk = {};
  if (!fs.existsSync(schemaPath)) {
    console.warn(`Schema not found: ${schemaPath}`);
    return { ...MANUAL_FK };
  }
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const tableBlocks = sql.split(/(?=CREATE TABLE(?: IF NOT EXISTS)? public\.)/i);
  for (const block of tableBlocks) {
    const tm = block.match(/^CREATE TABLE(?: IF NOT EXISTS)? public\.([a-zA-Z0-9_]+)/i);
    if (!tm) continue;
    const table = tm[1].toLowerCase();
    const fkRegex = /FOREIGN KEY\s*\((\w+)\)\s*REFERENCES public\.(\w+)\s*\(/gi;
    let m;
    while ((m = fkRegex.exec(block)) !== null) {
      const col = m[1].toLowerCase();
      const refTable = m[2].toLowerCase();
      if (col === 'tenant_id' && refTable === 'tenant_organization') continue;
      if (!fk[table]) fk[table] = {};
      fk[table][col] = refTable;
    }
    const inlineFk = /(\w+)\s+[A-Z]+[^,]*REFERENCES public\.(\w+)\s*\(/gi;
    while ((m = inlineFk.exec(block)) !== null) {
      const col = m[1].toLowerCase();
      const refTable = m[2].toLowerCase();
      if (col === 'tenant_id') continue;
      if (!fk[table]) fk[table] = {};
      if (!fk[table][col]) fk[table][col] = refTable;
    }
  }
  for (const [table, cols] of Object.entries(MANUAL_FK)) {
    if (!fk[table]) fk[table] = {};
    Object.assign(fk[table], cols);
  }
  return fk;
}

function getPkColumn(table) {
  if (SKIP_PK_TABLES.has(table)) return null;
  return PK_COLUMN[table] || 'id';
}

function tokenNumericValue(tok) {
  if (!tok || tok.type === 'null') return null;
  if (tok.type === 'number') return tok.value;
  return null;
}

function trimBatchData(parsed, batchExecutions, batchLogs) {
  const byTable = {};
  for (const row of parsed) {
    if (!byTable[row.table]) byTable[row.table] = [];
    byTable[row.table].push(row);
  }

  const executions = byTable.batch_job_execution || [];
  const keepExecutionIds = new Set();
  for (let i = 0; i < Math.min(batchExecutions, executions.length); i++) {
    const pkCol = getPkColumn('batch_job_execution');
    const idx = executions[i].columns.indexOf(pkCol);
    const v = tokenNumericValue(executions[i].tokens[idx]);
    if (v != null) keepExecutionIds.add(v);
  }

  const keepInstanceIds = new Set();
  for (const ex of executions) {
    const execIdx = ex.columns.indexOf('job_execution_id');
    const execId = tokenNumericValue(ex.tokens[execIdx]);
    if (keepExecutionIds.has(execId)) {
      const instIdx = ex.columns.indexOf('job_instance_id');
      const instId = tokenNumericValue(ex.tokens[instIdx]);
      if (instId != null) keepInstanceIds.add(instId);
    }
  }

  const steps = byTable.batch_step_execution || [];
  const keepStepIds = new Set();
  for (const step of steps) {
    const execIdx = step.columns.indexOf('job_execution_id');
    const execId = tokenNumericValue(step.tokens[execIdx]);
    if (keepExecutionIds.has(execId)) {
      const stepIdx = step.columns.indexOf('step_execution_id');
      const stepId = tokenNumericValue(step.tokens[stepIdx]);
      if (stepId != null) keepStepIds.add(stepId);
    }
  }

  let logKept = 0;
  const trimmed = [];
  let springBefore = 0;
  let springAfter = 0;
  let logBefore = 0;

  for (const row of parsed) {
    if (row.table === 'batch_job_execution_log') {
      logBefore++;
      if (logKept < batchLogs) {
        trimmed.push(row);
        logKept++;
      }
      continue;
    }
    if (!BATCH_SPRING_TABLES.has(row.table)) {
      trimmed.push(row);
      continue;
    }
    springBefore++;
    let keep = false;
    switch (row.table) {
      case 'batch_job_instance': {
        const idx = row.columns.indexOf('job_instance_id');
        keep = keepInstanceIds.has(tokenNumericValue(row.tokens[idx]));
        break;
      }
      case 'batch_job_execution': {
        const idx = row.columns.indexOf('job_execution_id');
        keep = keepExecutionIds.has(tokenNumericValue(row.tokens[idx]));
        break;
      }
      case 'batch_job_execution_context':
      case 'batch_job_execution_params': {
        const idx = row.columns.indexOf('job_execution_id');
        keep = keepExecutionIds.has(tokenNumericValue(row.tokens[idx]));
        break;
      }
      case 'batch_step_execution': {
        const idx = row.columns.indexOf('step_execution_id');
        keep = keepStepIds.has(tokenNumericValue(row.tokens[idx]));
        break;
      }
      case 'batch_step_execution_context': {
        const idx = row.columns.indexOf('step_execution_id');
        keep = keepStepIds.has(tokenNumericValue(row.tokens[idx]));
        break;
      }
      default:
        keep = true;
    }
    if (keep) {
      trimmed.push(row);
      springAfter++;
    }
  }

  console.log('Batch trim:');
  console.log(`  job_execution ids kept: ${[...keepExecutionIds].join(', ')}`);
  console.log(`  job_instance ids kept: ${[...keepInstanceIds].join(', ')}`);
  console.log(`  step_execution ids kept: ${[...keepStepIds].join(', ')}`);
  console.log(`  batch_job_execution_log: ${logBefore} → ${logKept}`);
  console.log(`  spring batch tables: ${springBefore} → ${springAfter}`);

  return trimmed;
}

function resolveFkValue(col, table, oldVal, fkMap, idMaps) {
  const fallbacks = FK_FALLBACK[table]?.[col];
  const parentTables = fallbacks || (fkMap[table]?.[col] ? [fkMap[table][col]] : []);
  for (const parent of parentTables) {
    const mapped = idMaps[parent]?.get(oldVal);
    if (mapped != null) return mapped;
  }
  // Source rows may already reference compact target IDs (e.g. uploaded_by_id=20 after partial export).
  for (const parent of parentTables) {
    const map = idMaps[parent];
    if (!map) continue;
    for (const newId of map.values()) {
      if (newId === oldVal) return oldVal;
    }
  }
  return null;
}

function buildGlobalOldToNewLookup(idMaps) {
  const lookup = new Map();
  for (const map of Object.values(idMaps)) {
    for (const [oldId, newId] of map.entries()) {
      lookup.set(oldId, newId);
    }
  }
  return lookup;
}

function applyGlobalIdSweep(row, idMaps, globalLookup) {
  const pkCol = getPkColumn(row.table);
  const pkIdx = pkCol ? row.columns.indexOf(pkCol) : -1;
  for (let ci = 0; ci < row.columns.length; ci++) {
    if (ci === pkIdx) continue;
    const col = row.columns[ci];
    if (NON_ID_NUMERIC_COLUMNS.has(col)) continue;
    const tok = row.tokens[ci];
    if (tok?.type !== 'number' || tok.value == null) continue;
    const isIdColumn =
      col === 'id' ||
      col.endsWith('_id') ||
      col === 'created_by_id' ||
      col === 'reviewed_by_admin_id' ||
      col === 'parent_event_id';
    if (!isIdColumn) continue;
    if (tok.value < 100000) continue;
    const mapped = globalLookup.get(tok.value);
    if (mapped != null) {
      row.tokens[ci] = { type: 'number', raw: String(mapped), value: mapped };
    }
  }
}

function buildDiscountCodeIndex(parsed) {
  const byId = new Map();
  for (const row of parsed) {
    if (row.table !== 'discount_code') continue;
    const idIdx = row.columns.indexOf('id');
    const oldId = tokenNumericValue(row.tokens[idIdx]);
    if (oldId != null) byId.set(oldId, row);
  }
  return byId;
}

function applySyntheticFkAliases(idMaps) {
  const eventMap = idMaps.event_details;
  if (!eventMap) return;
  for (const [oldSynthetic, newId] of Object.entries(SYNTHETIC_EVENT_DETAILS_ALIASES)) {
    const oldNum = Number(oldSynthetic);
    if (!eventMap.has(oldNum)) {
      eventMap.set(oldNum, newId);
    }
  }
}

function resolveRelEventDetailsId(row, tokens, idMaps, discountCodeById) {
  const eventColIdx = row.columns.indexOf('event_details_id');
  if (eventColIdx < 0) return null;
  const oldEventId = tokenNumericValue(tokens[eventColIdx]);
  if (oldEventId == null) return null;
  if (idMaps.event_details?.has(oldEventId)) {
    return idMaps.event_details.get(oldEventId);
  }
  const discColIdx = row.columns.indexOf('discount_codes_id');
  if (discColIdx < 0) return null;
  const discOld = tokenNumericValue(tokens[discColIdx]);
  const discRow = discountCodeById.get(discOld);
  if (!discRow) return null;
  const eventIdIdx = discRow.columns.indexOf('event_id');
  const linkedEventOld = tokenNumericValue(discRow.tokens[eventIdIdx]);
  if (linkedEventOld == null) return null;
  return idMaps.event_details?.get(linkedEventOld) ?? null;
}

function renumberRows(parsed, fkMap, startId) {
  const idMaps = {};
  const counters = {};
  const warnings = [];
  const report = {};
  const discountCodeById = buildDiscountCodeIndex(parsed);

  for (const row of parsed) {
    const pkCol = getPkColumn(row.table);
    if (!pkCol) continue;
    const pkIdx = row.columns.indexOf(pkCol);
    if (pkIdx < 0) continue;
    const oldId = tokenNumericValue(row.tokens[pkIdx]);
    if (oldId == null) continue;
    if (!idMaps[row.table]) idMaps[row.table] = new Map();
    if (!counters[row.table]) counters[row.table] = startId;
    if (!idMaps[row.table].has(oldId)) {
      idMaps[row.table].set(oldId, counters[row.table]);
      counters[row.table]++;
    }
  }

  applySyntheticFkAliases(idMaps);

  const rewritten = parsed.map((row) => {
    const pkCol = getPkColumn(row.table);
    const newTokens = row.tokens.map((t) => ({ ...t }));

    if (pkCol) {
      const pkIdx = row.columns.indexOf(pkCol);
      if (pkIdx >= 0) {
        const oldId = tokenNumericValue(newTokens[pkIdx]);
        if (oldId != null) {
          const newId = idMaps[row.table]?.get(oldId);
          if (newId != null) {
            newTokens[pkIdx] = { type: 'number', raw: String(newId), value: newId };
          }
        }
      }
    }

    const tableFk = { ...(fkMap[row.table] || {}), ...(MANUAL_FK[row.table] || {}) };
    for (const [col, parentTable] of Object.entries(tableFk)) {
      const colIdx = row.columns.indexOf(col);
      if (colIdx < 0) continue;
      const oldVal = tokenNumericValue(newTokens[colIdx]);
      if (oldVal == null) continue;
      let newVal = resolveFkValue(col, row.table, oldVal, fkMap, idMaps);
      if (
        newVal == null &&
        row.table === 'rel_event_details__discount_codes' &&
        col === 'event_details_id'
      ) {
        newVal = resolveRelEventDetailsId(row, newTokens, idMaps, discountCodeById);
      }
      if (newVal != null) {
        newTokens[colIdx] = { type: 'number', raw: String(newVal), value: newVal };
      } else {
        warnings.push({ table: row.table, column: col, oldValue: oldVal, expectedParent: parentTable });
      }
    }

    for (const [col] of Object.entries(FK_FALLBACK[row.table] || {})) {
      if (tableFk[col]) continue;
      const colIdx = row.columns.indexOf(col);
      if (colIdx < 0) continue;
      const oldVal = tokenNumericValue(newTokens[colIdx]);
      if (oldVal == null) continue;
      const newVal = resolveFkValue(col, row.table, oldVal, fkMap, idMaps);
      if (newVal != null) {
        newTokens[colIdx] = { type: 'number', raw: String(newVal), value: newVal };
      }
    }

    return { ...row, tokens: newTokens };
  });

  const globalLookup = buildGlobalOldToNewLookup(idMaps);
  for (const row of rewritten) {
    applyGlobalIdSweep(row, idMaps, globalLookup);
  }

  for (const [table, map] of Object.entries(idMaps)) {
    const vals = [...map.values()];
    report[table] = {
      rows: map.size,
      minNewId: vals.length ? Math.min(...vals) : null,
      maxNewId: vals.length ? Math.max(...vals) : null,
      sample: [...map.entries()].slice(0, 5).map(([o, n]) => ({ old: o, new: n })),
    };
  }

  return { rewritten, report, warnings };
}

function validateNoHighIds(rewritten) {
  const issues = [];
  for (const row of rewritten) {
    const pkCol = getPkColumn(row.table);
    const pkIdx = pkCol ? row.columns.indexOf(pkCol) : -1;
    for (let ci = 0; ci < row.columns.length; ci++) {
      const col = row.columns[ci];
      if (NON_ID_NUMERIC_COLUMNS.has(col)) continue;
      const tok = row.tokens[ci];
      if (tok?.type !== 'number' || tok.value < 600000) continue;
      const isIdColumn =
        ci === pkIdx ||
        col.endsWith('_id') ||
        col === 'created_by_id' ||
        col === 'reviewed_by_admin_id' ||
        col === 'parent_event_id';
      if (isIdColumn) {
        issues.push({ table: row.table, column: col, value: tok.value });
      }
    }
  }
  return issues;
}

function serializeInsert(row) {
  const headerMatch = row.raw.match(
    /^INSERT INTO public\.([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*/is
  );
  const header = headerMatch[0];
  const valuesPart = row.tokens.map((t) => t.raw).join(', ');
  return `${header}(${valuesPart});`;
}

function main() {
  const opts = parseArgs();
  if (!fs.existsSync(opts.input)) {
    console.error(`Input not found: ${opts.input}`);
    process.exit(1);
  }

  console.log(`Reading: ${opts.input}`);
  const sql = readSqlFile(opts.input);
  const statements = parseInsertStatements(sql);
  console.log(`Parsed ${statements.length} INSERT statement(s)`);

  let parsed = [];
  let parseErrors = 0;
  for (const stmt of statements) {
    try {
      const p = parseInsert(stmt);
      if (p) parsed.push(p);
      else parseErrors++;
    } catch (e) {
      parseErrors++;
      console.error(`Parse error: ${e.message}`);
    }
  }
  if (parseErrors) console.warn(`Parse errors: ${parseErrors}`);

  const beforeCount = parsed.length;
  parsed = trimBatchData(parsed, opts.batchExecutions, opts.batchLogs);
  console.log(`After batch trim: ${parsed.length} rows (removed ${beforeCount - parsed.length})`);

  const fkMap = buildFkMapFromSchema(SCHEMA_FILE);
  const { rewritten, report, warnings } = renumberRows(parsed, fkMap, opts.startId);

  const reportPath = path.join(SCRIPT_DIR, 'id-mapping-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        input: opts.input,
        output: opts.output,
        startId: opts.startId,
        batchExecutionsKept: opts.batchExecutions,
        batchLogsKept: opts.batchLogs,
        statementCount: rewritten.length,
        tables: report,
        fkWarningCount: warnings.length,
        fkWarnings: warnings.slice(0, 200),
      },
      null,
      2
    ),
    'utf8'
  );
  console.log(`Report: ${reportPath}`);
  console.log(`FK warnings: ${warnings.length}`);

  const highIdIssues = validateNoHighIds(rewritten);
  if (highIdIssues.length) {
    console.error(`ERROR: ${highIdIssues.length} ID/FK value(s) still in 600000+ range:`);
    for (const issue of highIdIssues.slice(0, 30)) {
      console.error(`  ${issue.table}.${issue.column} = ${issue.value}`);
    }
    process.exit(1);
  }
  console.log('Validation: no primary keys or *_id columns >= 600000');

  if (opts.dryRun) {
    console.log('Dry run — no SQL file written.');
    return;
  }

  const outputSql = rewritten.map(serializeInsert).join('\n\n') + '\n';
  fs.writeFileSync(opts.output, outputSql, 'utf8');
  console.log(`Written: ${opts.output} (${rewritten.length} INSERTs)`);
}

main();
