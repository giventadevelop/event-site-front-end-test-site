#!/usr/bin/env node
/**
 * Bulk create SalesIQ articles from salesiq-articles-import.csv via REST API.
 *
 * Requires OAuth scope: SalesIQ.articles.CREATE (and READ for category lookup).
 * Optional: SalesIQ.departments.READ when resolving department by name.
 *
 * Usage:
 *   npm run zobot:bulk-upload-articles -- --dry-run
 *   npm run zobot:bulk-upload-articles -- --confirm --limit 5
 *   npm run zobot:bulk-upload-articles -- --confirm
 *   npm run zobot:bulk-upload-articles -- --confirm --start 50 --limit 20
 *
 * Env (.env.local):
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *   ZOHO_SALESIQ_DEPARTMENT_ID / ZOHO_SALESIQ_CATEGORY_ID (or pass --department-name / --category-name)
 *   ZOHO_INSECURE_TLS=1  (only if HTTPS fails with certificate errors)
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadZohoEnv, getSalesIqConfig } from './load-zoho-env.mjs';
import {
  createArticle,
  findIdByName,
  listAllArticles,
  listArticleCategories,
  listDepartments,
  sleep,
} from './zoho-salesiq-api.mjs';
import { isGenericSiteTitle, resolveArticleTitle } from './salesiq-title-utils.mjs';
import { sanitizeTextField } from './salesiq-text-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CSV = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-articles-import.csv');

function parseArgs(argv) {
  const out = {
    envFile: null,
    input: DEFAULT_CSV,
    dryRun: false,
    confirm: false,
    departmentId: process.env.ZOHO_SALESIQ_DEPARTMENT_ID || '',
    categoryId: process.env.ZOHO_SALESIQ_CATEGORY_ID || '',
    departmentName: process.env.ZOBOT_SALESIQ_DEPARTMENT || 'MOSC Connect',
    categoryName: process.env.ZOBOT_SALESIQ_CATEGORY || 'General',
    delayMs: 400,
    limit: null,
    start: 0,
    skipExisting: true,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env-file' && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === '--input' && argv[i + 1]) out.input = path.resolve(REPO_ROOT, argv[++i]);
    else if (arg === '--department-id' && argv[i + 1]) out.departmentId = argv[++i];
    else if (arg === '--category-id' && argv[i + 1]) out.categoryId = argv[++i];
    else if (arg === '--department-name' && argv[i + 1]) out.departmentName = argv[++i];
    else if (arg === '--category-name' && argv[i + 1]) out.categoryName = argv[++i];
    else if (arg === '--delay-ms' && argv[i + 1]) out.delayMs = Number.parseInt(argv[++i], 10);
    else if (arg === '--limit' && argv[i + 1]) out.limit = Number.parseInt(argv[++i], 10);
    else if (arg === '--start' && argv[i + 1]) out.start = Number.parseInt(argv[++i], 10);
    else if (arg === '--no-skip-existing') out.skipExisting = false;
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--confirm') out.confirm = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
  }

  return out;
}

function printHelp() {
  console.log(`Bulk upload SalesIQ articles from CSV

Options:
  --dry-run                 Preview rows to upload (default without --confirm)
  --confirm                 POST articles to SalesIQ
  --input <path>            CSV path (default: documentation/.../salesiq-articles-import.csv)
  --department-id <id>      SalesIQ department_id (or use --department-name)
  --category-id <id>        SalesIQ category_id (or use --category-name)
  --department-name <name>  Resolve department id (default: MOSC Connect)
  --category-name <name>    Resolve category id (default: General)
  --start <n>               Skip first n data rows (resume)
  --limit <n>               Max rows to upload after --start
  --delay-ms <n>            Pause between creates (default: 400)
  --no-skip-existing        Upload even if an article with the same title exists
  --env-file <path>         Load ZOHO_* from this .env.local

OAuth scopes required:
  SalesIQ.articles.CREATE, SalesIQ.articles.READ
  SalesIQ.departments.READ (when resolving department by name)

Re-authorize if CREATE scope missing:
  Set ZOHO_OAUTH_SCOPES in event-site-manager .env.local, restart dev server,
  visit http://localhost:3000/oauth/zoho/start, update ZOHO_REFRESH_TOKEN.
`);
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

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildArticleHtml(record) {
  const parts = [];
  const description = (record.Description || '').trim();
  const content = (record.Content || '').trim();
  const sourceUrl = (record['Source URL'] || '').trim();
  const tags = (record.Tags || '').trim();

  if (description) {
    parts.push(`<p><strong>${escapeHtml(description)}</strong></p>`);
  }
  if (content) {
    parts.push(`<div>${escapeHtml(content).replace(/\r\n|\n|\r/g, '<br/>')}</div>`);
  }
  if (sourceUrl) {
    parts.push(`<p><a href="${escapeHtml(sourceUrl)}" rel="noopener noreferrer">Source: ${escapeHtml(sourceUrl)}</a></p>`);
  }
  if (tags) {
    parts.push(`<p><em>Tags: ${escapeHtml(tags)}</em></p>`);
  }

  return parts.length ? parts.join('\n') : '<div>(empty)</div>';
}

function isPublishedStatus(status) {
  const s = String(status || '').trim().toLowerCase();
  return s === 'published' || s === 'publish' || s === 'true' || s === '';
}

async function resolveDepartmentAndCategory(screenName, args) {
  let departmentId = args.departmentId?.trim() || '';
  let categoryId = args.categoryId?.trim() || '';

  if (!categoryId && args.categoryName) {
    console.log('Resolving category by name…');
    const categories = await listArticleCategories(screenName);
    const matched = categories.find(
      (c) => String(c.name || '').trim().toLowerCase() === String(args.categoryName).trim().toLowerCase(),
    );
    categoryId = matched?.id ? String(matched.id) : findIdByName(categories, args.categoryName) || '';
    if (!categoryId) {
      const names = categories.map((c) => c.name).filter(Boolean).join(', ') || '(none)';
      throw new Error(
        `Category "${args.categoryName}" not found. Available: ${names}. Create it in SalesIQ or pass --category-id.`,
      );
    }
    console.log(`  category "${args.categoryName}" → ${categoryId}`);
    if (!departmentId && matched?.department_id) {
      departmentId = String(matched.department_id);
      console.log(`  department (from category) → ${departmentId}`);
    }
  }

  if (!departmentId && args.departmentName) {
    console.log('Resolving department by name…');
    try {
      const departments = await listDepartments(screenName);
      departmentId =
        findIdByName(departments, args.departmentName) ||
        findIdByName(
          departments.map((d) => ({ ...d, name: d.display_name || d.name })),
          args.departmentName,
        ) ||
        '';
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Invalid OAuthScope') || msg.includes('1009')) {
        throw new Error(
          `${msg}\nAdd SalesIQ.departments.READ to ZOHO_OAUTH_SCOPES and re-authorize, or set ZOHO_SALESIQ_DEPARTMENT_ID in .env.local.`,
        );
      }
      throw error;
    }
    if (!departmentId) {
      throw new Error(
        `Department "${args.departmentName}" not found. Set ZOHO_SALESIQ_DEPARTMENT_ID in .env.local or pass --department-id.`,
      );
    }
    console.log(`  department "${args.departmentName}" → ${departmentId}`);
  }

  if (!departmentId || !categoryId) {
    throw new Error(
      'Missing department_id or category_id. Set ZOHO_SALESIQ_DEPARTMENT_ID and ZOHO_SALESIQ_CATEGORY_ID, or use --department-name / --category-name.',
    );
  }

  return { departmentId, categoryId };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const envPath = loadZohoEnv({ envFile: args.envFile });
  const { screenName } = getSalesIqConfig();
  const destructive = args.confirm && !args.dryRun;

  if (!args.dryRun && !args.confirm) {
    console.log('No --confirm flag: running in --dry-run mode.\n');
    args.dryRun = true;
  }

  if (envPath) console.log(`Loaded env from: ${envPath}`);
  console.log(`Portal screen name: ${screenName}`);
  console.log(`CSV: ${args.input}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'UPLOAD'}\n`);

  const csvText = (await readFile(args.input, 'utf8')).replace(/^\uFEFF/, '');
  const rows = parseCsv(csvText);
  if (!rows.length) throw new Error('CSV is empty');

  const header = rows[0];
  const titleIdx = header.indexOf('Title');
  const contentIdx = header.indexOf('Content');
  const urlIdx = header.indexOf('Source URL');
  const statusIdx = header.indexOf('Status');
  if (titleIdx < 0 || contentIdx < 0) {
    throw new Error('CSV must include Title and Content columns');
  }

  let dataRows = rows.slice(1).map((oldRow) => {
    const record = {};
    header.forEach((h, i) => {
      record[h] = oldRow[i] ?? '';
    });
    return record;
  });

  if (args.start > 0) {
    dataRows = dataRows.slice(args.start);
  }
  if (args.limit != null && args.limit > 0) {
    dataRows = dataRows.slice(0, args.limit);
  }

  const { departmentId, categoryId } = await resolveDepartmentAndCategory(screenName, args);

  let existingTitles = new Set();
  if (args.skipExisting && destructive) {
    console.log('Loading existing article titles (skip duplicates)…');
    const existing = await listAllArticles(screenName);
    existingTitles = new Set(existing.map((a) => (a.title || '').trim().toLowerCase()));
    console.log(`  ${existingTitles.size} existing article(s) in portal\n`);
  }

  const planned = [];
  for (const record of dataRows) {
    const title = sanitizeTextField(
      resolveArticleTitle({
        title: record.Title,
        content: record.Content,
        sourceUrl: urlIdx >= 0 ? record['Source URL'] : '',
        mainHtml: null,
      }),
    );
    if (!title.trim()) continue;

    const titleKey = title.trim().toLowerCase();
    if (args.skipExisting && existingTitles.has(titleKey)) {
      planned.push({ record, title, skip: true });
      continue;
    }

    planned.push({
      record,
      title,
      skip: false,
      payload: {
        department_id: departmentId,
        category_id: categoryId,
        title,
        content: buildArticleHtml(record),
        published: isPublishedStatus(statusIdx >= 0 ? record.Status : 'Published'),
      },
    });
  }

  const toUpload = planned.filter((p) => !p.skip);
  const skipped = planned.filter((p) => p.skip);

  console.log(`Rows in batch: ${planned.length}`);
  console.log(`  To upload: ${toUpload.length}`);
  console.log(`  Skip (duplicate title): ${skipped.length}`);
  console.log(`  Generic titles remaining: ${toUpload.filter((p) => isGenericSiteTitle(p.title)).length}\n`);

  for (const item of toUpload.slice(0, 8)) {
    console.log(`  + ${item.title}`);
    if (item.record['Source URL']) console.log(`    ${item.record['Source URL']}`);
  }
  if (toUpload.length > 8) {
    console.log(`  … and ${toUpload.length - 8} more`);
  }

  if (args.dryRun) {
    console.log('\nDry run complete. Re-run with --confirm to upload.');
    process.exit(0);
  }

  console.log('\nUploading…');
  let created = 0;
  let failed = 0;

  for (const item of toUpload) {
    try {
      const result = await createArticle(screenName, item.payload);
      const id = result?.data?.id || result?.data?.article_id || '?';
      created += 1;
      console.log(`Created [${id}] ${item.title}`);
      if (args.delayMs > 0) await sleep(args.delayMs);
    } catch (error) {
      failed += 1;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Failed: ${item.title}\n  ${msg}`);
      if (msg.includes('Invalid OAuthScope') || msg.includes('1009')) {
        console.error(
          '\nYour refresh token lacks SalesIQ.articles.CREATE. Re-authorize with expanded scopes (see --help).',
        );
        process.exit(1);
      }
    }
  }

  console.log(`\nDone. Created: ${created}, failed: ${failed}, skipped duplicates: ${skipped.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
