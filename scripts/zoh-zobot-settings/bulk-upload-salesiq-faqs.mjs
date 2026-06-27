#!/usr/bin/env node
/**
 * Bulk create SalesIQ FAQs from salesiq-faq-supplement.csv via REST API v3.
 *
 * Requires OAuth scopes: SalesIQ.faqs.READ, SalesIQ.faqs.CREATE
 * Optional: SalesIQ.departments.READ when resolving department by name.
 *
 * Usage:
 *   npm run zobot:bulk-upload-faqs -- --dry-run
 *   npm run zobot:bulk-upload-faqs -- --confirm --limit 2
 *   npm run zobot:bulk-upload-faqs -- --confirm
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadZohoEnv, getSalesIqConfig } from './load-zoho-env.mjs';
import {
  createFaq,
  findIdByName,
  listAllFaqs,
  listDepartments,
  listFaqCategories,
  sleep,
} from './zoho-salesiq-api.mjs';
import { sanitizeTextField } from './salesiq-text-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CSV = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/salesiq-faq-supplement.csv');

function parseArgs(argv) {
  const out = {
    envFile: null,
    input: DEFAULT_CSV,
    dryRun: false,
    confirm: false,
    departmentId: process.env.ZOHO_SALESIQ_DEPARTMENT_ID || '',
    categoryId: process.env.ZOHO_SALESIQ_FAQ_CATEGORY_ID || '',
    departmentName: process.env.ZOBOT_SALESIQ_DEPARTMENT || 'MOSC Connect',
    categoryName: process.env.ZOBOT_SALESIQ_FAQ_CATEGORY || 'General',
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
  console.log(`Bulk upload SalesIQ FAQs from CSV

Options:
  --dry-run                 Preview rows to upload (default without --confirm)
  --confirm                 POST FAQs to SalesIQ
  --input <path>            CSV path (default: documentation/.../salesiq-faq-supplement.csv)
  --department-id <id>      SalesIQ department_id (or use --department-name)
  --category-id <id>        FAQ category_id (or use --category-name; NOT article category)
  --department-name <name>  Resolve department id (default: MOSC Connect)
  --category-name <name>    Resolve FAQ category id (default: General)
  --start <n>               Skip first n data rows (resume)
  --limit <n>               Max rows to upload after --start
  --delay-ms <n>            Pause between creates (default: 400)
  --no-skip-existing        Upload even if default question already exists
  --env-file <path>         Load ZOHO_* from this .env.local

OAuth scopes required:
  SalesIQ.faqs.READ, SalesIQ.faqs.CREATE
  SalesIQ.departments.READ (when resolving department by name)

Re-authorize if CREATE scope missing:
  Add faqs scopes to ZOHO_OAUTH_SCOPES, restart event-site-manager,
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

function isPublishedStatus(status) {
  const s = String(status || '').trim().toLowerCase();
  return s === 'published' || s === 'publish' || s === 'true' || s === '';
}

/**
 * Parse QUESTION:/ANSWER: blocks and tag variants from FAQ supplement CSV rows.
 */
export function buildFaqPayloadFromRecord(record) {
  const title = sanitizeTextField(record.Title || '').trim();
  const content = sanitizeTextField(record.Content || '').trim();
  const statusIdx = record.Status;

  let defaultQuestion = title;
  let answer = content;

  const questionMatch = content.match(/QUESTION:\s*(.+?)(?:\s+ANSWER:|\s*$)/is);
  const answerMatch = content.match(/ANSWER:\s*(.+)/is);
  if (questionMatch) defaultQuestion = questionMatch[1].trim();
  if (answerMatch) answer = answerMatch[1].trim();

  if (!defaultQuestion) defaultQuestion = title;
  if (!answer) answer = content || title;

  const questions = [{ question: defaultQuestion, default: 'true' }];
  const seen = new Set([defaultQuestion.toLowerCase()]);

  const tags = String(record.Tags || '')
    .split(',')
    .map((t) => sanitizeTextField(t).trim())
    .filter(Boolean);

  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    questions.push({ question: tag, default: 'false' });
    if (questions.length >= 5) break;
  }

  return {
    label: defaultQuestion,
    payload: {
      questions,
      answer,
      published: isPublishedStatus(statusIdx),
      type: 'external',
    },
  };
}

function getFaqDefaultQuestion(faq) {
  if (faq?.default_question) return String(faq.default_question).trim().toLowerCase();
  const questions = Array.isArray(faq?.questions) ? faq.questions : [];
  const defaultQ = questions.find((q) => q.default === true || q.default === 'true');
  return (defaultQ?.question || questions[0]?.question || '').trim().toLowerCase();
}

async function resolveDepartmentAndFaqCategory(screenName, args) {
  let departmentId = args.departmentId?.trim() || '';
  let categoryId = args.categoryId?.trim() || '';

  if (!categoryId && args.categoryName) {
    console.log('Resolving FAQ category by name…');
    try {
      const categories = await listFaqCategories(screenName);
      categoryId = findIdByName(categories, args.categoryName) || '';
      if (!categoryId) {
        const names = categories.map((c) => c.name).filter(Boolean).join(', ') || '(none)';
        throw new Error(
          `FAQ category "${args.categoryName}" not found. Available: ${names}. Create it under Resources → FAQs or pass --category-id.`,
        );
      }
      console.log(`  FAQ category "${args.categoryName}" → ${categoryId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const existingFaqs = await listAllFaqs(screenName);
      const match = existingFaqs.find(
        (f) => String(f?.category?.name || '').trim().toLowerCase() === String(args.categoryName).trim().toLowerCase(),
      );
      if (match?.category?.id) {
        categoryId = String(match.category.id);
        console.log(`  FAQ category "${args.categoryName}" → ${categoryId} (from existing FAQ)`);
      } else {
        throw new Error(`${msg}\nPass --category-id or set ZOHO_SALESIQ_FAQ_CATEGORY_ID in .env.local.`);
      }
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
      'Missing department_id or FAQ category_id. Set ZOHO_SALESIQ_DEPARTMENT_ID and ZOHO_SALESIQ_FAQ_CATEGORY_ID, or use --department-name / --category-name.',
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

  if (args.start > 0) dataRows = dataRows.slice(args.start);
  if (args.limit != null && args.limit > 0) dataRows = dataRows.slice(0, args.limit);

  let departmentId = args.departmentId?.trim() || '';
  let categoryId = args.categoryId?.trim() || '';

  if (!departmentId || !categoryId) {
    try {
      const resolved = await resolveDepartmentAndFaqCategory(screenName, args);
      departmentId = resolved.departmentId;
      categoryId = resolved.categoryId;
    } catch (error) {
      if (!args.dryRun) throw error;
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`Could not resolve FAQ category/department (preview only): ${msg}\n`);
    }
  }

  let existingQuestions = new Set();
  if (args.skipExisting && destructive) {
    console.log('Loading existing FAQ default questions (skip duplicates)…');
    const existing = await listAllFaqs(screenName);
    existingQuestions = new Set(existing.map(getFaqDefaultQuestion).filter(Boolean));
    console.log(`  ${existingQuestions.size} existing FAQ(s) in portal\n`);
  }

  const planned = [];
  for (const record of dataRows) {
    const built = buildFaqPayloadFromRecord(record);
    if (!built.label.trim()) continue;

    const questionKey = built.label.trim().toLowerCase();
    if (args.skipExisting && existingQuestions.has(questionKey)) {
      planned.push({ record, ...built, skip: true });
      continue;
    }

    planned.push({
      record,
      ...built,
      skip: false,
      payload: {
        ...built.payload,
        ...(departmentId ? { department_id: departmentId } : {}),
        ...(categoryId ? { category_id: categoryId } : {}),
      },
    });
  }

  const toUpload = planned.filter((p) => !p.skip);
  const skipped = planned.filter((p) => p.skip);

  console.log(`Rows in batch: ${planned.length}`);
  console.log(`  To upload: ${toUpload.length}`);
  console.log(`  Skip (duplicate question): ${skipped.length}\n`);

  for (const item of toUpload) {
    const variantCount = item.payload.questions?.length || 0;
    console.log(`  + ${item.label} (${variantCount} question variant(s))`);
  }

  if (args.dryRun) {
    if (departmentId && categoryId) {
      console.log(`Resolved department_id=${departmentId}, FAQ category_id=${categoryId}\n`);
    }
    console.log('\nDry run complete. Re-run with --confirm to upload.');
    process.exit(0);
  }

  if (!departmentId || !categoryId) {
    throw new Error(
      'Missing department_id or FAQ category_id. Set ZOHO_SALESIQ_DEPARTMENT_ID and ZOHO_SALESIQ_FAQ_CATEGORY_ID, or use --department-name / --category-name.',
    );
  }

  console.log('\nUploading…');
  let created = 0;
  let failed = 0;

  for (const item of toUpload) {
    try {
      const result = await createFaq(screenName, item.payload);
      const id = result?.data?.id || '?';
      created += 1;
      console.log(`Created FAQ [${id}] ${item.label}`);
      if (args.delayMs > 0) await sleep(args.delayMs);
    } catch (error) {
      failed += 1;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Failed: ${item.label}\n  ${msg}`);
      if (msg.includes('Invalid OAuthScope') || msg.includes('1009')) {
        console.error(
          '\nYour refresh token lacks SalesIQ.faqs.CREATE. Re-authorize with expanded scopes (see --help).',
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
