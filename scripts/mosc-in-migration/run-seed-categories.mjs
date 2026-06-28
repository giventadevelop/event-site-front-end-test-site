#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { ensureRepoRoot, REPO_ROOT } from './lib/repo-root.mjs';

ensureRepoRoot();
config({ path: resolve(REPO_ROOT, '.env.local') });

const tenant = process.env.MOSC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || 'mosc_malankara_orthodox_2';
const sqlPath = resolve(
  REPO_ROOT,
  'documentation/mosc_document_downloads_page/upload_refactor/seed_missing_official_document_categories.sql',
);

let sql = await readFile(sqlPath, 'utf8');
sql = sql.replace(/tenant_demo_002/g, tenant);

const client = new pg.Client({
  host: process.env.MOSC_DB_HOST || process.env.RDS_ENDPOINT || 'localhost',
  database: process.env.MOSC_DB_NAME || process.env.DB_NAME || 'event_site_manager_db',
  user: process.env.MOSC_DB_USER || process.env.DB_USERNAME || 'postgres',
  password: process.env.MOSC_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  port: Number(process.env.MOSC_DB_PORT || process.env.DB_PORT || 5432),
  ssl:
    process.env.MOSC_DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
});

await client.connect();

async function syncSequenceFromTables(tableNames) {
  const maxIds = [];
  for (const table of tableNames) {
    try {
      const res = await client.query(`SELECT COALESCE(MAX(id), 0) AS max_id FROM ${table}`);
      maxIds.push(Number(res.rows[0]?.max_id || 0));
    } catch {
      /* table may not exist */
    }
  }
  const maxId = Math.max(1, ...maxIds);
  await client.query(`SELECT setval('public.sequence_generator'::regclass, $1)`, [maxId]);
  console.log(`Sequence synced to ${maxId} (from ${tableNames.join(', ')})`);
}

await syncSequenceFromTables([
  'public.official_document_category',
  'public.official_document_year_bundle',
  'public.tenant_official_document',
  'public.event_media',
]);
await client.query(sql);
console.log(`Seed OK for tenant: ${tenant}`);

const check = await client.query(
  `SELECT slug, display_name FROM official_document_category
   WHERE tenant_id = $1 AND slug IN ('malankara-association-2026', 'fcra-statements')
   ORDER BY slug`,
  [tenant],
);
console.log('Verified categories:', check.rows);
await client.end();
