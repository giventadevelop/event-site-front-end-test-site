#!/usr/bin/env node
/**
 * Add SalesIQ import columns to an existing articles CSV (no HTTP fetch).
 *
 * Usage (from repo root):
 *   node scripts/zoh-zobot-settings/patch-salesiq-import-csv.mjs --department "General" --channels Web
 *
 * Options:
 *   --input / --output   Paths (default: documentation/zoh_zobot_settings/salesiq-articles-import.csv)
 *   --department         Exact department name from Settings → Departments (required)
 *   --channels           Channel label (default: Web — globe icon in Edit info; not "Website")
 *   --is-public          Value for every row (default: true)
 *   --status             Value for every row (default: Published)
 *   --language           Language label (default: English — not ISO code en)
 *   --flatten-categories Strip "MOSC Redesign > " prefix from Category (create shorter names in SalesIQ)
 *   --category "Name"    Set every row to one category (e.g. General — create it once in SalesIQ)
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CSV = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-articles-import.csv');

const SALESIQ_COLUMNS = {
  'Resource ID': '',
  'Group ID': '',
  Department: null,
  Channels: null,
  'Is Public': 'true',
  Status: 'Published',
  Language: null,
};

function parseArgs(argv) {
  const out = {
    input: DEFAULT_CSV,
    output: DEFAULT_CSV,
    department: process.env.ZOBOT_SALESIQ_DEPARTMENT || '',
    channels: process.env.ZOBOT_SALESIQ_CHANNELS || 'Web',
    isPublic: process.env.ZOBOT_SALESIQ_IS_PUBLIC || 'true',
    status: process.env.ZOBOT_SALESIQ_STATUS || 'Published',
    language: process.env.ZOBOT_SALESIQ_LANGUAGE || 'English',
    flattenCategories: false,
    category: '',
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' && argv[i + 1]) out.input = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--output' && argv[i + 1]) out.output = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--department' && argv[i + 1]) out.department = argv[++i];
    else if (arg === '--channels' && argv[i + 1]) out.channels = argv[++i];
    else if (arg === '--is-public' && argv[i + 1]) out.isPublic = argv[++i];
    else if (arg === '--status' && argv[i + 1]) out.status = argv[++i];
    else if (arg === '--language' && argv[i + 1]) out.language = argv[++i];
    else if (arg === '--flatten-categories') out.flattenCategories = true;
    else if (arg === '--category' && argv[i + 1]) out.category = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/zoh-zobot-settings/patch-salesiq-import-csv.mjs --department "Your Dept Name" [options]

Required:
  --department "Name"   Exact name from SalesIQ Settings → Departments

Optional:
  --channels "Web"      Default: Web (globe channel in import Edit info; not Website)
  --is-public true      Default: true
  --status Published    Default: Published
  --language English    Default: English (fixes "Invalid article language" if CSV had en)
  --flatten-categories  Use short category names (strip "MOSC Redesign > " prefix)
  --category "General"  Set every row to one category (create that name in SalesIQ first)
  --input / --output    CSV paths
`);
      process.exit(0);
    }
  }
  if (!out.department.trim()) {
    console.error('Error: --department is required (exact name from Settings → Departments).');
    process.exit(1);
  }
  SALESIQ_COLUMNS.Department = out.department;
  SALESIQ_COLUMNS.Channels = out.channels;
  SALESIQ_COLUMNS['Is Public'] = out.isPublic;
  SALESIQ_COLUMNS.Status = out.status;
  SALESIQ_COLUMNS.Language = out.language;
  return out;
}

/** Minimal CSV parse: handles quoted fields with commas and newlines. */
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

function flattenCategory(value) {
  const prefix = 'MOSC Redesign > ';
  const s = value == null ? '' : String(value).trim();
  return s.startsWith(prefix) ? s.slice(prefix.length).trim() : s;
}

function main() {
  const args = parseArgs(process.argv);
  return readFile(args.input, 'utf8').then((text) => {
    const rows = parseCsv(text.replace(/^\uFEFF/, ''));
    if (!rows.length) throw new Error('CSV is empty');

    const header = rows[0];
    const dataRows = rows.slice(1);

    const newHeader = [...header];
    for (const col of Object.keys(SALESIQ_COLUMNS)) {
      if (!newHeader.includes(col)) newHeader.push(col);
    }

    const newRows = [toCsvRow(newHeader)];
    for (const oldRow of dataRows) {
      const record = {};
      header.forEach((h, i) => {
        record[h] = oldRow[i] ?? '';
      });
      for (const [col, defaultVal] of Object.entries(SALESIQ_COLUMNS)) {
        if (col === 'Resource ID' || col === 'Group ID') {
          if (record[col] == null || record[col] === '') record[col] = '';
        } else {
          record[col] = defaultVal;
        }
      }
      if (args.flattenCategories && record.Category) {
        record.Category = flattenCategory(record.Category);
      }
      if (args.category.trim()) {
        record.Category = args.category.trim();
      }
      newRows.push(toCsvRow(newHeader.map((h) => record[h] ?? '')));
    }

    return writeFile(args.output, newRows.join('\r\n'), 'utf8').then(() => {
      console.log(`Patched ${dataRows.length} row(s): ${args.output}`);
      console.log(`  Department: ${SALESIQ_COLUMNS.Department}`);
      console.log(`  Channels: ${SALESIQ_COLUMNS.Channels}`);
      console.log(`  Is Public: ${SALESIQ_COLUMNS['Is Public']}`);
      console.log(`  Status: ${SALESIQ_COLUMNS.Status}`);
      console.log(`  Language: ${SALESIQ_COLUMNS.Language}`);
      console.log(`  Resource ID / Group ID: empty (new articles)`);
      if (args.flattenCategories) console.log(`  Categories: flattened (removed "MOSC Redesign > " prefix)`);
      if (args.category.trim()) console.log(`  Category (all rows): ${args.category.trim()}`);
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
