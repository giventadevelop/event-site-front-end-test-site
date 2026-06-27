#!/usr/bin/env node
/**
 * Repair double-encoded UTF-8 (mojibake) in official_document_category.display_name.
 * Original titles used an en-dash; export mangled them into 400+ char strings (varchar 255 limit).
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_FILES = [
  path.join(__dirname, 'corrected_event_media_inserts.renumbered.sql'),
  path.join(__dirname, '..', 'corrected_event_media_inserts.ordered.sql'),
];

/** slug -> clean display_name */
const SLUG_DISPLAY_NAMES = {
  'malankara-association-2022-2027': 'Malankara Association (2022 - 2027)',
  'malankara-association-2017-agenda-nominated-members-list':
    'Malankara Association 2017 - Agenda & Nominated Members List',
  'local-body-election-winners-award-ceremony-photos':
    'Local Body Election Winners Award Ceremony - Photos',
};

const MOJIBAKE_PATTERNS = [
  [
    /'Malankara Association \(2022 [^']+ 2027\)'/g,
    "'Malankara Association (2022 - 2027)'",
  ],
  [
    /'Malankara Association 2017 [^']+ Agenda & Nominated Members List'/g,
    "'Malankara Association 2017 - Agenda & Nominated Members List'",
  ],
  [
    /'local body Election winners award ceremony [^']+ Photos'/g,
    "'Local Body Election Winners Award Ceremony - Photos'",
  ],
];

function fixSqlContent(sql) {
  let count = 0;
  let out = sql;
  for (const [re, replacement] of MOJIBAKE_PATTERNS) {
    const before = out;
    out = out.replace(re, () => {
      count++;
      return replacement;
    });
    if (before === out && re.test(before)) {
      // reset lastIndex if global
    }
  }
  return { sql: out, count };
}

function fixBySlug(sql) {
  let count = 0;
  let out = sql;
  for (const [slug, displayName] of Object.entries(SLUG_DISPLAY_NAMES)) {
    const re = new RegExp(
      `(INSERT INTO public\\.official_document_category \\([^)]+\\) VALUES \\([^,]+, '[^']+', '${slug}', ')[^']+(')`,
      'g'
    );
    out = out.replace(re, (_, prefix, suffix) => {
      count++;
      return `${prefix}${displayName}${suffix}`;
    });
  }
  return { sql: out, count };
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Skip (not found): ${filePath}`);
    return 0;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  let { sql, count } = fixSqlContent(original);
  const slugFix = fixBySlug(sql);
  sql = slugFix.sql;
  count += slugFix.count;
  if (sql !== original) {
    fs.writeFileSync(filePath, sql, 'utf8');
    console.log(`Fixed ${filePath} (${count} replacement(s))`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
  return count;
}

const files = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_FILES;
let total = 0;
for (const f of files) total += processFile(path.resolve(f));
process.exit(total > 0 ? 0 : 0);
