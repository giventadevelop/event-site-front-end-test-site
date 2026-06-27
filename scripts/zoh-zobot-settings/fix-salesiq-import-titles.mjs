#!/usr/bin/env node
/**
 * Fix generic SalesIQ article titles in an existing import CSV (Answer Bot retrieval).
 *
 * Usage:
 *   node scripts/zoh-zobot-settings/fix-salesiq-import-titles.mjs
 *   node scripts/zoh-zobot-settings/fix-salesiq-import-titles.mjs --dry-run
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { isGenericSiteTitle, resolveArticleTitle } from './salesiq-title-utils.mjs';
import { sanitizeTextField } from './salesiq-text-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CSV = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-articles-import.csv');

function parseArgs(argv) {
  const out = { input: DEFAULT_CSV, output: DEFAULT_CSV, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' && argv[i + 1]) out.input = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--output' && argv[i + 1]) out.output = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/zoh-zobot-settings/fix-salesiq-import-titles.mjs [--dry-run] [--input path] [--output path]`);
      process.exit(0);
    }
  }
  return out;
}

/** Minimal CSV parse (quoted fields). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\r' && next === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
    } else if (c === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsvRow(cells) {
  return cells.map(csvEscape).join(',');
}

async function main() {
  const args = parseArgs(process.argv);
  const text = (await readFile(args.input, 'utf8')).replace(/^\uFEFF/, '');
  const rows = parseCsv(text);
  if (!rows.length) throw new Error('CSV is empty');

  const header = rows[0];
  const titleIdx = header.indexOf('Title');
  const contentIdx = header.indexOf('Content');
  const urlIdx = header.indexOf('Source URL');
  if (titleIdx < 0 || contentIdx < 0) {
    throw new Error('CSV must include Title and Content columns');
  }

  let fixed = 0;
  let unchanged = 0;
  let stillGeneric = 0;
  const samples = [];

  const newRows = [toCsvRow(header)];
  for (const oldRow of rows.slice(1)) {
    const record = {};
    header.forEach((h, i) => {
      record[h] = oldRow[i] ?? '';
    });

    const oldTitle = record.Title || '';
    record.Title = sanitizeTextField(oldTitle);
    record.Content = sanitizeTextField(record.Content || '');
    record.Description = sanitizeTextField(record.Description || '');

    if (isGenericSiteTitle(record.Title)) {
      const nextTitle = resolveArticleTitle({
        title: oldTitle,
        content: record.Content,
        sourceUrl: urlIdx >= 0 ? record['Source URL'] : '',
        mainHtml: null,
      });
      if (nextTitle && !isGenericSiteTitle(nextTitle) && nextTitle !== record.Title) {
        record.Title = sanitizeTextField(nextTitle);
        fixed++;
        if (samples.length < 8) {
          samples.push({ url: record['Source URL'], from: oldTitle, to: nextTitle });
        }
      } else {
        stillGeneric++;
      }
    } else {
      unchanged++;
    }

    newRows.push(toCsvRow(header.map((h) => record[h] ?? '')));
  }

  console.log(`Titles: ${fixed} fixed, ${unchanged} already specific, ${stillGeneric} still generic`);
  for (const s of samples) {
    console.log(`  → ${s.to}\n     ${s.url || '(no url)'}`);
  }

  if (args.dryRun) {
    console.log('Dry run — file not written.');
    return;
  }

  await writeFile(args.output, newRows.join('\r\n'), 'utf8');
  console.log(`Wrote: ${args.output}`);
  console.log('Re-import updated rows in SalesIQ (or update articles in portal) and re-train Answer Bot.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
