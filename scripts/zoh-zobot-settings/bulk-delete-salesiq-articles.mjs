#!/usr/bin/env node
/**
 * Bulk delete SalesIQ articles via REST API.
 *
 * Requires in .env.local (mosc-temp or ../event-site-manager):
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *
 * Obtain refresh token: https://www.event-site-manager.com/oauth/zoho/start
 *
 * Usage:
 *   npm run zobot:bulk-delete-articles -- --dry-run
 *   npm run zobot:bulk-delete-articles -- --confirm
 *   npm run zobot:bulk-delete-articles -- --confirm --department-id 123 --category-id 456
 *   npm run zobot:bulk-delete-articles -- --env-file F:/project_workspace/event-site-manager/.env.local --dry-run
 */

import { loadZohoEnv, getSalesIqConfig } from './load-zoho-env.mjs';
import { deleteArticle, listAllArticles, sleep } from './zoho-salesiq-api.mjs';

function parseArgs(argv) {
  const out = {
    envFile: null,
    dryRun: false,
    confirm: false,
    departmentId: process.env.ZOHO_SALESIQ_DEPARTMENT_ID || '',
    categoryId: process.env.ZOHO_SALESIQ_CATEGORY_ID || '',
    titleContains: '',
    delayMs: 300,
    limit: null,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env-file' && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === '--department-id' && argv[i + 1]) out.departmentId = argv[++i];
    else if (arg === '--category-id' && argv[i + 1]) out.categoryId = argv[++i];
    else if (arg === '--title-contains' && argv[i + 1]) out.titleContains = argv[++i];
    else if (arg === '--delay-ms' && argv[i + 1]) out.delayMs = Number.parseInt(argv[++i], 10);
    else if (arg === '--limit' && argv[i + 1]) out.limit = Number.parseInt(argv[++i], 10);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--confirm') out.confirm = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
  }

  return out;
}

function printHelp() {
  console.log(`Bulk delete SalesIQ articles

Options:
  --dry-run              List articles that would be deleted (default if no --confirm)
  --confirm              Actually delete (required for destructive run)
  --env-file <path>      Load ZOHO_* from this .env.local
  --department-id <id>   Filter by SalesIQ department_id
  --category-id <id>     Filter by category_id
  --title-contains <s>   Extra client-side filter on title substring
  --delay-ms <n>         Pause between deletes (default: 300)
  --limit <n>            Max articles to delete after filters

Env (in .env.local):
  ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
  ZOHO_SALESIQ_SCREEN_NAME (default: giventainc)
`);
}

function filterArticles(articles, titleContains) {
  if (!titleContains) return articles;
  const needle = titleContains.toLowerCase();
  return articles.filter((a) => (a.title || '').toLowerCase().includes(needle));
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

  if (envPath) {
    console.log(`Loaded env from: ${envPath}`);
  }
  console.log(`Portal screen name: ${screenName}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'DELETE'}\n`);

  const listFilters = {};
  if (args.departmentId) listFilters.department_id = args.departmentId;
  if (args.categoryId) listFilters.category_id = args.categoryId;

  console.log('Fetching articles…');
  let articles = await listAllArticles(screenName, listFilters);
  articles = filterArticles(articles, args.titleContains);

  if (args.limit != null && args.limit > 0) {
    articles = articles.slice(0, args.limit);
  }

  console.log(`Found ${articles.length} article(s) matching filters.`);

  if (articles.length === 0) {
    process.exit(0);
  }

  for (const article of articles.slice(0, 10)) {
    console.log(`  - [${article.id}] ${article.title || '(no title)'}`);
  }
  if (articles.length > 10) {
    console.log(`  … and ${articles.length - 10} more`);
  }

  if (args.dryRun) {
    console.log('\nDry run complete. Re-run with --confirm to delete.');
    process.exit(0);
  }

  console.log('\nDeleting…');
  let deleted = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      await deleteArticle(screenName, article.id);
      deleted += 1;
      console.log(`Deleted [${article.id}] ${article.title || ''}`);
      if (args.delayMs > 0) await sleep(args.delayMs);
    } catch (error) {
      failed += 1;
      console.error(`Failed [${article.id}]: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\nDone. Deleted: ${deleted}, failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
