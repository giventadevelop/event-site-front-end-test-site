#!/usr/bin/env node
/**
 * Append curated FAQ rows from salesiq-faq-supplement.csv into the main import CSV.
 *
 * Usage:
 *   node scripts/zoh-zobot-settings/merge-salesiq-faq-supplement.mjs
 *   node scripts/zoh-zobot-settings/merge-salesiq-faq-supplement.mjs --dry-run
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_MAIN = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-articles-import.csv');
const DEFAULT_SUPPLEMENT = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-faq-supplement.csv');

function parseArgs(argv) {
  const out = {
    main: DEFAULT_MAIN,
    supplement: DEFAULT_SUPPLEMENT,
    output: DEFAULT_MAIN,
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--main' && argv[i + 1]) out.main = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--supplement' && argv[i + 1]) out.supplement = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--output' && argv[i + 1]) out.output = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/zoh-zobot-settings/merge-salesiq-faq-supplement.mjs [--dry-run]

Appends rows from salesiq-faq-supplement.csv that are not already present (matched by Title).
`);
      process.exit(0);
    }
  }
  return out;
}

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

function normalizeTitle(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

async function main() {
  const args = parseArgs(process.argv);
  const mainText = (await readFile(args.main, 'utf8')).replace(/^\uFEFF/, '');
  const supplementText = (await readFile(args.supplement, 'utf8')).replace(/^\uFEFF/, '');

  const mainRows = parseCsv(mainText);
  const supplementRows = parseCsv(supplementText);
  if (!mainRows.length || !supplementRows.length) {
    throw new Error('Main or supplement CSV is empty');
  }

  const mainHeader = mainRows[0];
  const supHeader = supplementRows[0];
  const titleIdxMain = mainHeader.indexOf('Title');
  const titleIdxSup = supHeader.indexOf('Title');
  if (titleIdxMain < 0 || titleIdxSup < 0) {
    throw new Error('Both CSVs must include a Title column');
  }

  const existingTitles = new Set(
    mainRows.slice(1).map((row) => normalizeTitle(row[titleIdxMain])),
  );

  const toAppend = [];
  for (const row of supplementRows.slice(1)) {
    if (!row.length || !row[titleIdxSup]?.trim()) continue;
    const title = row[titleIdxSup];
    if (existingTitles.has(normalizeTitle(title))) continue;

    const record = {};
    supHeader.forEach((h, i) => {
      record[h] = row[i] ?? '';
    });
    toAppend.push(mainHeader.map((h) => record[h] ?? ''));
    existingTitles.add(normalizeTitle(title));
  }

  console.log(`Main CSV: ${mainRows.length - 1} articles`);
  console.log(`Supplement: ${supplementRows.length - 1} FAQ rows`);
  console.log(`To append: ${toAppend.length} new FAQ row(s)`);
  for (const row of toAppend) {
    console.log(`  + ${row[titleIdxMain]}`);
  }

  if (!toAppend.length) {
    console.log('Nothing to merge.');
    return;
  }

  if (args.dryRun) {
    console.log('Dry run — file not written.');
    return;
  }

  const outputRows = [toCsvRow(mainHeader), ...mainRows.slice(1).map((r) => toCsvRow(r)), ...toAppend.map((r) => toCsvRow(r))];
  await writeFile(args.output, outputRows.join('\r\n'), 'utf8');
  console.log(`Wrote: ${args.output} (${outputRows.length - 1} articles total)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
