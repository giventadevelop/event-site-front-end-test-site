#!/usr/bin/env node
import pg from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ensureRepoRoot, REPO_ROOT } from './lib/repo-root.mjs';

ensureRepoRoot();
config({ path: resolve(REPO_ROOT, '.env.local') });

const tenant = process.env.MOSC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || 'mosc_malankara_orthodox_2';
const client = new pg.Client({
  host: process.env.MOSC_DB_HOST || 'localhost',
  database: process.env.MOSC_DB_NAME || 'event_site_manager_db',
  user: process.env.MOSC_DB_USER || 'postgres',
  password: process.env.MOSC_DB_PASSWORD || 'postgres',
  port: Number(process.env.MOSC_DB_PORT || 5432),
});

await client.connect();
await client.query(
  `INSERT INTO official_document_category
    (id, tenant_id, slug, display_name, description, sort_order, is_active, created_at, updated_at)
   VALUES (nextval('sequence_generator'), $1, $2, $3, 'manifest seed', 1400, true, now(), now())
   ON CONFLICT (tenant_id, slug) DO NOTHING`,
  [
    tenant,
    'charge-handing-over-taking-over-report-for-new-trustees-and-secretary-of-the-parish',
    'Charge handing over taking over Report for new Trustees and Secretary of the Parish',
  ],
);
console.log('inserted charge category');
await client.end();
