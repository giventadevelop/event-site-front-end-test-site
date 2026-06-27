#!/usr/bin/env node
/**
 * Fetch mosc-redesign URLs and export a SalesIQ Articles import CSV (Step 2).
 *
 * Reads:  documentation/zoh_zobot_settings/mosc-redesign-urls.txt
 * Writes: documentation/zoh_zobot_settings/salesiq-articles-import.csv
 *
 * Usage (from repository root):
 *   node scripts/zoh-zobot-settings/export-salesiq-articles.mjs
 *   node scripts/zoh-zobot-settings/export-salesiq-articles.mjs --limit 10
 *   node scripts/zoh-zobot-settings/export-salesiq-articles.mjs --dry-run
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveArticleTitle } from './salesiq-title-utils.mjs';
import {
  deriveDescription,
  sanitizeTextField,
  scrubArticleContent,
} from './salesiq-text-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

const DEFAULT_INPUT = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/mosc-redesign-urls.txt');
const DEFAULT_OUTPUT = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-articles-import.csv');
const DEFAULT_ERRORS = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-articles-export-errors.json');
const USER_AGENT = 'MOSC-SalesIQ-Export/1.0 (+https://www.mosc-temp.com)';
const DEFAULT_DELAY_MS = 400;

const CATEGORY_MAP = {
  saints: 'MOSC Redesign > Saints',
  directory: 'MOSC Redesign > Directory',
  catholicate: 'MOSC Redesign > Catholicate',
  administration: 'MOSC Redesign > Administration',
  'faith-and-teaching': 'MOSC Redesign > Faith & Teaching',
  'faith-teaching': 'MOSC Redesign > Faith & Teaching',
  organisations: 'MOSC Redesign > Organisations & Education',
  organizations: 'MOSC Redesign > Organisations & Education',
  'contact-form-email': 'MOSC Redesign > Contact',
  contact: 'MOSC Redesign > Contact',
  calendar: 'MOSC Redesign > Community & Resources',
  gallery: 'MOSC Redesign > Community & Resources',
  sitemap: 'MOSC Redesign > Main Navigation',
};

function parseArgs(argv) {
  const out = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    errorsPath: DEFAULT_ERRORS,
    limit: null,
    dryRun: false,
    delayMs: DEFAULT_DELAY_MS,
    includeTemplates: false,
    department: process.env.ZOBOT_SALESIQ_DEPARTMENT || '',
    channels: process.env.ZOBOT_SALESIQ_CHANNELS || 'Web',
    isPublic: process.env.ZOBOT_SALESIQ_IS_PUBLIC || 'true',
    status: process.env.ZOBOT_SALESIQ_STATUS || 'Published',
    language: process.env.ZOBOT_SALESIQ_LANGUAGE || 'English',
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' && argv[i + 1]) out.input = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--output' && argv[i + 1]) out.output = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--limit' && argv[i + 1]) out.limit = Number.parseInt(argv[++i], 10);
    else if (arg === '--delay-ms' && argv[i + 1]) out.delayMs = Number.parseInt(argv[++i], 10);
    else if (arg === '--department' && argv[i + 1]) out.department = argv[++i];
    else if (arg === '--channels' && argv[i + 1]) out.channels = argv[++i];
    else if (arg === '--is-public' && argv[i + 1]) out.isPublic = argv[++i];
    else if (arg === '--status' && argv[i + 1]) out.status = argv[++i];
    else if (arg === '--language' && argv[i + 1]) out.language = argv[++i];
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--include-templates') out.includeTemplates = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/zoh-zobot-settings/export-salesiq-articles.mjs [options]

Options:
  --input <path>     URL list (default: documentation/zoh_zobot_settings/mosc-redesign-urls.txt)
  --output <path>    CSV output (default: documentation/zoh_zobot_settings/salesiq-articles-import.csv)
  --department "X"   SalesIQ department name (Settings → Departments; or ZOBOT_SALESIQ_DEPARTMENT)
  --channels "X"     SalesIQ channel label (default: Web — globe icon in import)
  --is-public true   Is Public column (default: true)
  --status Published Status column (default: Published)
  --language English  Language column — use English not en (default: English)
  --limit <n>        Process first N URLs only (test batch)
  --delay-ms <ms>    Pause between HTTP requests (default: ${DEFAULT_DELAY_MS})
  --dry-run          Parse URLs only; do not fetch or write CSV
  --include-templates  Include dynamic route placeholders (e.g. .../news/[slug])
`);
      process.exit(0);
    }
  }
  return out;
}

const CSV_HEADERS = [
  'Resource ID',
  'Group ID',
  'Title',
  'Content',
  'Department',
  'Category',
  'Channels',
  'Is Public',
  'Status',
  'Language',
  'Description',
  'Source URL',
  'Tags',
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Fix legacy generator lines like https://www.mosc-temp.comF:/project/.../mosc-redesign/foo */
export function normalizeMoscUrl(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (/^https:\/\/www\.mosc-temp\.com\/mosc-redesign/i.test(trimmed)) {
    return trimmed.split(/\s/)[0];
  }

  const lower = trimmed.toLowerCase();
  const marker = '/mosc-redesign';
  const idx = lower.indexOf(marker);
  if (idx >= 0) {
    const pathPart = trimmed.slice(idx).replace(/\\/g, '/').split(/\s/)[0];
    return `https://www.mosc-temp.com${pathPart.startsWith('/') ? pathPart : `/${pathPart}`}`;
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed.split(/\s/)[0];
  return null;
}

function decodeHtmlEntities(text) {
  return sanitizeTextField(decodeHtmlEntitiesRaw(text));
}

function decodeHtmlEntitiesRaw(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
}

function stripHtml(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function removeScriptStyleBlocks(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

function extractMainHtml(html) {
  const cleaned = removeScriptStyleBlocks(html);
  const candidates = [];

  const mainContentRe = /<main[^>]*\bid=["']mainContent["'][^>]*>([\s\S]*)<\/main>/gi;
  let match;
  while ((match = mainContentRe.exec(cleaned)) !== null) {
    candidates.push(match[1]);
  }

  const divMain = cleaned.match(/<div[^>]*\bid=["']mainContent["'][^>]*>([\s\S]*?)<\/div>/i);
  if (divMain?.[1]) candidates.push(divMain[1]);

  for (const re of [
    /<main[^>]*class=["'][^"']*syro-main[^"']*["'][^>]*>([\s\S]*)<\/main>/i,
    /<main[^>]*class=["'][^"']*mosc-main[^"']*["'][^>]*>([\s\S]*)<\/main>/i,
  ]) {
    const m = cleaned.match(re);
    if (m?.[1]) candidates.push(m[1]);
  }

  if (candidates.length === 0) return cleaned;

  let best = candidates[0];
  let bestLen = stripHtml(best).length;
  for (const candidate of candidates.slice(1)) {
    const len = stripHtml(candidate).length;
    if (len > bestLen) {
      best = candidate;
      bestLen = len;
    }
  }
  return best;
}

function extractMetaDescription(html) {
  const patterns = [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]?.trim()) return decodeHtmlEntities(m[1].trim());
  }
  return '';
}

function isDynamicTemplateUrl(url) {
  try {
    return /\[|\]/.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

function extractTitle(html, mainHtml, content, sourceUrl) {
  let raw = '';
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) raw = decodeHtmlEntities(og[1].trim());
  else {
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (title?.[1]) raw = decodeHtmlEntities(title[1].replace(/\s+/g, ' ').trim());
    else {
      const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1?.[1]) raw = stripHtml(h1[1]).slice(0, 250);
    }
  }
  return resolveArticleTitle({
    title: raw,
    content,
    sourceUrl,
    mainHtml,
  });
}

function categoryFromUrl(urlStr) {
  try {
    const parts = new URL(urlStr).pathname.split('/').filter(Boolean);
    const section = parts[1] || 'general';
    if (CATEGORY_MAP[section]) return CATEGORY_MAP[section];
    const label = section
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `MOSC Redesign > ${label}`;
  } catch {
    return 'MOSC Redesign > General';
  }
}

function slugTagFromUrl(urlStr) {
  try {
    const parts = new URL(urlStr).pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'mosc-redesign';
  } catch {
    return 'mosc-redesign';
  }
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsvRow(cells) {
  return cells.map(csvEscape).join(',');
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.text();
}

export async function buildArticleRow(url, salesiqMeta) {
  const html = await fetchPage(url);
  const mainHtml = extractMainHtml(html);
  let content = stripHtml(mainHtml);
  const metaDescription = extractMetaDescription(html);
  let title = extractTitle(html, mainHtml, content, url);
  title = sanitizeTextField(title);
  content = scrubArticleContent(content, title);

  if (content.length < 40) {
    content = [title, metaDescription, content]
      .filter(Boolean)
      .join('. ')
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim();
    content = scrubArticleContent(content, title);
  }

  const description = deriveDescription({
    description: metaDescription,
    content,
    title,
  });

  if (!content || content.length < 40) {
    throw new Error('Extracted content too short (check page HTML or selectors)');
  }

  return {
    'Resource ID': '',
    'Group ID': '',
    Title: title.slice(0, 250),
    Content: content.slice(0, 50000),
    Department: salesiqMeta.department,
    Category: categoryFromUrl(url),
    Channels: salesiqMeta.channels,
    'Is Public': salesiqMeta.isPublic,
    Status: salesiqMeta.status,
    Language: salesiqMeta.language,
    Description: description.slice(0, 500),
    'Source URL': url,
    Tags: slugTagFromUrl(url),
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const raw = await readFile(args.input, 'utf8');
  const lines = raw.split(/\r?\n/);

  const urls = [];
  const skipped = [];
  for (const line of lines) {
    const url = normalizeMoscUrl(line);
    if (url) urls.push(url);
    else if (line.trim()) skipped.push(line.trim());
  }

  const uniqueUrls = [...new Set(urls)];
  const skippedTemplates = args.includeTemplates
    ? []
    : uniqueUrls.filter(isDynamicTemplateUrl);
  const exportUrls = args.includeTemplates
    ? uniqueUrls
    : uniqueUrls.filter((u) => !isDynamicTemplateUrl(u));
  const toProcess = args.limit ? exportUrls.slice(0, args.limit) : exportUrls;

  console.log(`Input: ${args.input}`);
  console.log(`URLs parsed: ${uniqueUrls.length}${skipped.length ? ` (${skipped.length} lines skipped)` : ''}`);
  if (skippedTemplates.length) {
    console.log(`Dynamic route templates skipped: ${skippedTemplates.length} (use --include-templates to fetch them anyway)`);
  }
  console.log(`URLs to export: ${exportUrls.length}`);
  if (args.limit) console.log(`Limit: processing first ${toProcess.length} URL(s)`);
  if (args.dryRun) {
    toProcess.slice(0, 5).forEach((u) => console.log(`  ${u}`));
    if (toProcess.length > 5) console.log(`  ... and ${toProcess.length - 5} more`);
    return;
  }

  if (!args.department.trim()) {
    console.warn(
      'Warning: --department not set. Department column will be empty; patch or re-export with --department "Name".',
    );
  }

  const salesiqMeta = {
    department: args.department,
    channels: args.channels,
    isPublic: args.isPublic,
    status: args.status,
    language: args.language,
  };

  const rows = [toCsvRow(CSV_HEADERS)];
  const errors = [];

  for (let i = 0; i < toProcess.length; i++) {
    const url = toProcess[i];
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${url} … `);
    try {
      const article = await buildArticleRow(url, salesiqMeta);
      rows.push(toCsvRow(CSV_HEADERS.map((h) => article[h] ?? '')));
      console.log('ok');
    } catch (err) {
      console.log(`FAIL (${err.message})`);
      errors.push({ url, error: err.message });
    }
    if (i < toProcess.length - 1) await sleep(args.delayMs);
  }

  await mkdir(path.dirname(args.output), { recursive: true });
  await writeFile(args.output, rows.join('\r\n'), 'utf8');
  await writeFile(
    args.errorsPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        errors,
        skippedLines: skipped,
        skippedTemplateUrls: skippedTemplates,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`\nWrote CSV: ${args.output} (${rows.length - 1} articles)`);
  console.log(`Errors log: ${args.errorsPath} (${errors.length} failed)`);
  if (errors.length) process.exitCode = 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
