#!/usr/bin/env node
/**
 * Repair SalesIQ import CSV: mojibake, generic descriptions, duplicate titles, content scrub.
 *
 * Usage:
 *   node scripts/zoh-zobot-settings/sanitize-salesiq-import-csv.mjs
 *   node scripts/zoh-zobot-settings/sanitize-salesiq-import-csv.mjs --dry-run
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  disambiguateDuplicateTitle,
  fixUtf8Mojibake,
  isGenericMetaDescription,
  sanitizeArticleRecord,
} from './salesiq-text-sanitize.mjs';

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
      console.log(`Usage: node scripts/zoh-zobot-settings/sanitize-salesiq-import-csv.mjs [--dry-run] [--input path] [--output path]`);
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

async function main() {
  const args = parseArgs(process.argv);
  const text = (await readFile(args.input, 'utf8')).replace(/^\uFEFF/, '');
  const rows = parseCsv(text);
  if (!rows.length) throw new Error('CSV is empty');

  const header = rows[0];
  const titleIdx = header.indexOf('Title');
  const contentIdx = header.indexOf('Content');
  const descIdx = header.indexOf('Description');
  const urlIdx = header.indexOf('Source URL');
  if (titleIdx < 0 || contentIdx < 0) {
    throw new Error('CSV must include Title and Content columns');
  }

  let mojibakeFixed = 0;
  let descriptionFixed = 0;
  let titleDisambiguated = 0;
  const samples = [];
  const seenTitleCounts = new Map();

  const sanitizedRecords = rows.slice(1).map((oldRow) => {
    const record = {};
    header.forEach((h, i) => {
      record[h] = oldRow[i] ?? '';
    });

    const hadMojibake =
      /[\u00C2\u00E2\u20AC]|â€/.test(record.Title || '') ||
      /[\u00C2\u00E2\u20AC]|â€/.test(record.Content || '') ||
      /[\u00C2\u00E2\u20AC]|â€/.test(record.Description || '');

    const hadGenericDesc = isGenericMetaDescription(record.Description);

    const next = sanitizeArticleRecord(record);
    const url = urlIdx >= 0 ? record['Source URL'] : '';
    const disambiguated = disambiguateDuplicateTitle(next.Title, url, seenTitleCounts);
    if (disambiguated !== next.Title) {
      next.Title = disambiguated;
      titleDisambiguated++;
    }

    if (hadMojibake) mojibakeFixed++;
    if (hadGenericDesc && next.Description !== record.Description) descriptionFixed++;

    if (samples.length < 6 && (hadMojibake || hadGenericDesc)) {
      samples.push({
        url,
        titleBefore: record.Title,
        titleAfter: next.Title,
        descBefore: (record.Description || '').slice(0, 80),
        descAfter: (next.Description || '').slice(0, 80),
      });
    }

    return next;
  });

  console.log(`Rows processed: ${sanitizedRecords.length}`);
  console.log(`  Mojibake rows touched: ${mojibakeFixed}`);
  console.log(`  Generic descriptions replaced: ${descriptionFixed}`);
  console.log(`  Duplicate titles disambiguated: ${titleDisambiguated}`);
  console.log(`  Remaining mojibake in output: ${sanitizedRecords.filter((r) => /[\u00C2\u00E2\u20AC]|â€/.test(r.Title + r.Content + r.Description)).length}`);

  for (const s of samples) {
    console.log(`\n  ${s.url || '(no url)'}`);
    if (s.titleBefore !== s.titleAfter) {
      console.log(`    Title: ${s.titleBefore}`);
      console.log(`      → ${s.titleAfter}`);
    }
    if (s.descBefore !== s.descAfter) {
      console.log(`    Desc:  ${s.descBefore}…`);
      console.log(`      → ${s.descAfter}…`);
    }
  }

  if (args.dryRun) {
    console.log('\nDry run — file not written.');
    return;
  }

  const newRows = [toCsvRow(header)];
  for (const record of sanitizedRecords) {
    newRows.push(toCsvRow(header.map((h) => record[h] ?? '')));
  }

  await writeFile(args.output, newRows.join('\r\n'), 'utf8');
  console.log(`\nWrote: ${args.output}`);
  console.log('Next: bulk-delete duplicate portal articles, then bulk-upload with --confirm (or update titles in SalesIQ).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
