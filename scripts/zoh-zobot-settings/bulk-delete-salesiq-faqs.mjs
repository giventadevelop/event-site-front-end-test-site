#!/usr/bin/env node
/**
 * Bulk delete SalesIQ FAQs via REST API v3.
 *
 * Requires OAuth scope: SalesIQ.faqs.READ, SalesIQ.faqs.DELETE
 *
 * Usage:
 *   npm run zobot:bulk-delete-faqs -- --dry-run
 *   npm run zobot:bulk-delete-faqs -- --confirm
 *   npm run zobot:bulk-delete-faqs -- --confirm --question-contains SalesIQ
 */

import { loadZohoEnv, getSalesIqConfig } from './load-zoho-env.mjs';
import { deleteFaq, listAllFaqs, sleep } from './zoho-salesiq-api.mjs';

function parseArgs(argv) {
  const out = {
    envFile: null,
    dryRun: false,
    confirm: false,
    departmentId: process.env.ZOHO_SALESIQ_DEPARTMENT_ID || '',
    categoryId: process.env.ZOHO_SALESIQ_FAQ_CATEGORY_ID || '',
    questionContains: '',
    answerContains: '',
    delayMs: 300,
    limit: null,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env-file' && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === '--department-id' && argv[i + 1]) out.departmentId = argv[++i];
    else if (arg === '--category-id' && argv[i + 1]) out.categoryId = argv[++i];
    else if (arg === '--question-contains' && argv[i + 1]) out.questionContains = argv[++i];
    else if (arg === '--answer-contains' && argv[i + 1]) out.answerContains = argv[++i];
    else if (arg === '--delay-ms' && argv[i + 1]) out.delayMs = Number.parseInt(argv[++i], 10);
    else if (arg === '--limit' && argv[i + 1]) out.limit = Number.parseInt(argv[++i], 10);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--confirm') out.confirm = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
  }

  return out;
}

function printHelp() {
  console.log(`Bulk delete SalesIQ FAQs

Options:
  --dry-run                  List FAQs that would be deleted (default if no --confirm)
  --confirm                  Actually delete (required for destructive run)
  --env-file <path>          Load ZOHO_* from this .env.local
  --department-id <id>       Filter by department_id
  --category-id <id>         Filter by FAQ category_id
  --question-contains <s>    Client-side filter on default/alternate questions
  --answer-contains <s>      Client-side filter on answer text
  --delay-ms <n>             Pause between deletes (default: 300)
  --limit <n>                Max FAQs to delete after filters

Examples:
  npm run zobot:bulk-delete-faqs -- --dry-run --question-contains SalesIQ
  npm run zobot:bulk-delete-faqs -- --confirm --question-contains SalesIQ

OAuth scopes required:
  SalesIQ.faqs.READ, SalesIQ.faqs.DELETE
`);
}

function getFaqQuestionsText(faq) {
  const questions = Array.isArray(faq?.questions) ? faq.questions : [];
  const fromArray = questions.map((q) => q.question || '').join(' ');
  const defaultQ = String(faq?.default_question || '');
  return `${defaultQ} ${fromArray}`.trim();
}

function getFaqLabel(faq) {
  if (faq?.default_question) return String(faq.default_question).trim();
  const questions = Array.isArray(faq?.questions) ? faq.questions : [];
  const defaultQ = questions.find((q) => q.default === true || q.default === 'true');
  return (defaultQ?.question || questions[0]?.question || '(no question)').trim();
}

function filterFaqs(faqs, questionContains, answerContains) {
  let filtered = faqs;
  if (questionContains) {
    const needle = questionContains.toLowerCase();
    filtered = filtered.filter((f) => getFaqQuestionsText(f).toLowerCase().includes(needle));
  }
  if (answerContains) {
    const needle = answerContains.toLowerCase();
    filtered = filtered.filter((f) => String(f.answer || '').toLowerCase().includes(needle));
  }
  return filtered;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const envPath = loadZohoEnv({ envFile: args.envFile });
  const { screenName } = getSalesIqConfig();

  if (!args.dryRun && !args.confirm) {
    console.log('No --confirm flag: running in --dry-run mode.\n');
    args.dryRun = true;
  }

  if (envPath) console.log(`Loaded env from: ${envPath}`);
  console.log(`Portal screen name: ${screenName}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'DELETE'}\n`);

  const listFilters = {};
  if (args.departmentId) listFilters.department_id = args.departmentId;
  if (args.categoryId) listFilters.category_id = args.categoryId;

  console.log('Fetching FAQs…');
  let faqs = await listAllFaqs(screenName, listFilters);
  faqs = filterFaqs(faqs, args.questionContains, args.answerContains);

  if (args.limit != null && args.limit > 0) {
    faqs = faqs.slice(0, args.limit);
  }

  console.log(`Found ${faqs.length} FAQ(s) matching filters.`);

  if (faqs.length === 0) {
    process.exit(0);
  }

  for (const faq of faqs.slice(0, 10)) {
    console.log(`  - [${faq.id}] ${getFaqLabel(faq)}`);
  }
  if (faqs.length > 10) {
    console.log(`  … and ${faqs.length - 10} more`);
  }

  if (args.dryRun) {
    console.log('\nDry run complete. Re-run with --confirm to delete.');
    process.exit(0);
  }

  console.log('\nDeleting…');
  let deleted = 0;
  let failed = 0;

  for (const faq of faqs) {
    try {
      await deleteFaq(screenName, faq.id);
      deleted += 1;
      console.log(`Deleted [${faq.id}] ${getFaqLabel(faq)}`);
      if (args.delayMs > 0) await sleep(args.delayMs);
    } catch (error) {
      failed += 1;
      console.error(`Failed [${faq.id}]: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\nDone. Deleted: ${deleted}, failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
