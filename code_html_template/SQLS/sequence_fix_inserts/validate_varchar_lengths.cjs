#!/usr/bin/env node
/**
 * Find INSERT string values exceeding varchar limits (import failure diagnostic).
 */
const fs = require('fs');
const path = require('path');

const SQL_FILE = process.argv[2] || path.join(__dirname, 'corrected_event_media_inserts.renumbered.sql');
const SCHEMA_FILE = path.join(__dirname, '..', 'Current_Sqls', 'Latest_Schema_Post__Blob_Claude_12.sql');

/** table -> column -> max length (null = text/unlimited) */
function parseSchemaLimits(schemaSql) {
  const limits = {};
  const blocks = schemaSql.split(/(?=CREATE TABLE(?: IF NOT EXISTS)? public\.)/i);
  for (const block of blocks) {
    const tm = block.match(/^CREATE TABLE(?: IF NOT EXISTS)? public\.([a-zA-Z0-9_]+)/i);
    if (!tm) continue;
    const table = tm[1].toLowerCase();
    limits[table] = limits[table] || {};
    const colRe = /^\s+([a-zA-Z0-9_]+)\s+(?:character varying|varchar)\((\d+)\)/gim;
    let m;
    while ((m = colRe.exec(block))) {
      limits[table][m[1].toLowerCase()] = parseInt(m[2], 10);
    }
  }
  return limits;
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
      else if (s[i + 1] === "'") i++;
      else inString = false;
      continue;
    }
    if (inString) continue;
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0 && i === s.length - 1) return s.slice(1, i).trim();
    }
  }
  return s;
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
      tokens.push({ type: 'null' });
      i += 4;
      continue;
    }
    if (s[i] === "'") {
      let raw = "'";
      let content = '';
      i++;
      while (i < s.length) {
        if (s[i] === "'") {
          raw += "'";
          i++;
          if (i < s.length && s[i] === "'") {
            raw += "'";
            content += "'";
            i++;
            continue;
          }
          break;
        }
        raw += s[i];
        content += s[i];
        i++;
      }
      tokens.push({ type: 'string', content });
      continue;
    }
    if (/[-0-9.]/.test(s[i])) {
      let raw = '';
      while (i < s.length && /[-0-9.eE+]/.test(s[i])) {
        raw += s[i];
        i++;
      }
      tokens.push({ type: 'number' });
      continue;
    }
    if (/[a-zA-Z_]/.test(s[i])) {
      let raw = '';
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
        raw += s[i];
        i++;
      }
      tokens.push({ type: 'ident' });
      continue;
    }
    throw new Error(`Unexpected '${s[i]}' at ${i}`);
  }
  return tokens;
}

function parseInsert(stmt) {
  const headerMatch = stmt.match(/^INSERT INTO public\.([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*/is);
  if (!headerMatch) return null;
  const table = headerMatch[1].toLowerCase();
  const columns = headerMatch[2].split(',').map((c) => c.trim().toLowerCase());
  let valuesStr = stmt.slice(headerMatch[0].length).trim();
  if (valuesStr.endsWith(';')) valuesStr = valuesStr.slice(0, -1).trim();
  valuesStr = unwrapValuesTuple(valuesStr);
  const tokens = tokenizeValues(valuesStr);
  return { table, columns, tokens, stmt };
}

const limits = parseSchemaLimits(fs.readFileSync(SCHEMA_FILE, 'utf8'));
const sql = fs.readFileSync(SQL_FILE, 'utf8');
const stmts = parseInsertStatements(sql);
const violations = [];
let idx = 0;

for (const stmt of stmts) {
  idx++;
  const row = parseInsert(stmt);
  if (!row) continue;
  const tableLimits = limits[row.table];
  if (!tableLimits) continue;
  for (let ci = 0; ci < row.columns.length; ci++) {
    const col = row.columns[ci];
    const maxLen = tableLimits[col];
    if (!maxLen) continue;
    const tok = row.tokens[ci];
    if (tok?.type === 'string' && tok.content.length > maxLen) {
      violations.push({
        statementIndex: idx,
        table: row.table,
        column: col,
        maxLen,
        actualLen: tok.content.length,
        preview: tok.content.slice(0, 80) + (tok.content.length > 80 ? '...' : ''),
      });
    }
  }
}

console.log('File:', SQL_FILE);
console.log('Statements:', stmts.length);
console.log('Violations:', violations.length);
for (const v of violations.slice(0, 30)) {
  console.log(
    `#${v.statementIndex} ${v.table}.${v.column}: len=${v.actualLen} max=${v.maxLen} preview=${JSON.stringify(v.preview)}`
  );
}
if (violations.length > 30) console.log(`... and ${violations.length - 30} more`);
process.exit(violations.length ? 1 : 0);
