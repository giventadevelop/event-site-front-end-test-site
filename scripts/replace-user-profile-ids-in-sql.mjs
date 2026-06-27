#!/usr/bin/env node
/**
 * Copies corrected_event_media_inserts.ordered.sql to
 * corrected_event_media_inserts.ordered_PROD.sql, then replaces user_id and
 * clerk_user_id in user_profile INSERT statements in the PROD file.
 *
 * Mappings (from → to):
 *   user_2vVLxhPnsIPGYf6qpfozk383Slr → user_34rb3aLFAEudlfmG3xrDQIoX8Hg
 *   user_38nbubO0LEVuh1coatR0Rh4MEEa → user_37qATlmYSakWtYH962TYumZT01k
 *
 * Usage:
 *   node scripts/replace-user-profile-ids-in-sql.mjs [options] [sqlFile]
 *
 * Options:
 *   --dry-run    Print changed lines only; do not copy or write file.
 *   --out <path> Write result to <path> instead of modifying file in place.
 *
 * Default: copies code_html_template/SQLS/corrected_event_media_inserts.ordered.sql
 *           to corrected_event_media_inserts.ordered_PROD.sql, then runs replacements on PROD.
 */

import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  ['user_2vVLxhPnsIPGYf6qpfozk383Slr', 'user_34rb3aLFAEudlfmG3xrDQIoX8Hg'],
  ['user_38nbubO0LEVuh1coatR0Rh4MEEa', 'user_37qATlmYSakWtYH962TYumZT01k'],
];

const USER_PROFILE_INSERT = 'INSERT INTO public.user_profile ';
const TENANT_TYPO = 'mosc_malankara_orthodox_02';
const TENANT_CORRECT = 'mosc_malankara_orthodox_2';

const SOURCE_FILE = path.join(
  process.cwd(),
  'code_html_template',
  'SQLS',
  'corrected_event_media_inserts.ordered.sql'
);
const PROD_FILE = path.join(
  process.cwd(),
  'code_html_template',
  'SQLS',
  'corrected_event_media_inserts.ordered_PROD.sql'
);

function replaceInLine(line) {
  if (!line.includes(USER_PROFILE_INSERT)) return line;
  let out = line.split(`'${TENANT_TYPO}'`).join(`'${TENANT_CORRECT}'`);
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let outPath = null;
  const files = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--out' && args[i + 1]) {
      outPath = args[++i];
    } else if (!args[i].startsWith('-')) {
      files.push(args[i]);
    }
  }

  const useDefault = files.length === 0;
  const sqlFile = files[0] || PROD_FILE;

  // Step 1: When using default (no custom file) and not dry-run, copy source → PROD first
  if (useDefault && !dryRun) {
    if (!fs.existsSync(SOURCE_FILE)) {
      console.error('Source file not found:', SOURCE_FILE);
      process.exit(1);
    }
    fs.copyFileSync(SOURCE_FILE, PROD_FILE);
    console.log('Copied', SOURCE_FILE, '→', PROD_FILE);
  }

  const fileToRead = useDefault && dryRun ? SOURCE_FILE : sqlFile;
  if (!fs.existsSync(fileToRead)) {
    console.error('File not found:', fileToRead);
    process.exit(1);
  }

  const content = fs.readFileSync(fileToRead, 'utf8');
  const lines = content.split(/\r?\n/);
  const result = [];
  let changeCount = 0;

  for (const line of lines) {
    const newLine = replaceInLine(line);
    if (newLine !== line) changeCount++;
    result.push(newLine);
  }

  if (dryRun) {
    const changed = lines.filter((line, i) => replaceInLine(line) !== line);
    console.log('Lines that would be modified:', changed.length);
    changed.forEach((line, i) => {
      console.log('---');
      console.log('Before:', line.slice(0, 120) + (line.length > 120 ? '...' : ''));
      console.log('After :', replaceInLine(line).slice(0, 120) + (line.length > 120 ? '...' : ''));
    });
    process.exit(0);
  }

  const targetPath = outPath || sqlFile;
  fs.writeFileSync(targetPath, result.join('\n'), 'utf8');
  console.log('Replaced user_id/clerk_user_id in', changeCount, 'user_profile INSERT line(s).');
  console.log('Written to:', targetPath);
}

main();
