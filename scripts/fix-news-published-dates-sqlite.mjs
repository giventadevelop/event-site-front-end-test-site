/**
 * Fix news article published_at in local Strapi SQLite (.tmp/data.db).
 *
 * REST PUT resets publishedAt to "now" and can leave tenant only on the draft
 * row. This script:
 *  1) Restores historical published_at from older same-title articles
 *  2) Ensures articles_tenant_lnk exists for the published row
 *
 * Usage:
 *   node scripts/fix-news-published-dates-sqlite.mjs           # dry-run
 *   node scripts/fix-news-published-dates-sqlite.mjs --apply
 */
import { createRequire } from 'module';
import path from 'path';

const APPLY = process.argv.includes('--apply');
const STRAPI_ROOT = 'C:/project_workspace/strapi-editorial-template';
const require = createRequire(path.join(STRAPI_ROOT, 'package.json'));
const Database = require('better-sqlite3');
const dbPath = path.join(STRAPI_ROOT, '.tmp/data.db');

const TENANT_ID_STRING = 'mosc_malankara_orthodox_2';
/** Prefer dates older than the June 2026 bulk import */
const BULK_CUTOFF_MS = Date.parse('2026-06-01T00:00:00.000Z');
const TODAY_PREFIX_MS = Date.parse('2026-07-21T00:00:00.000Z');

function normTitle(t) {
  return String(t || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toIso(ms) {
  if (ms == null) return null;
  return new Date(Number(ms)).toISOString();
}

const db = new Database(dbPath, { readonly: !APPLY });

const tenantRow = db
  .prepare('SELECT id, tenant_id FROM tenants WHERE tenant_id = ?')
  .get(TENANT_ID_STRING);
if (!tenantRow) {
  console.error('Tenant not found:', TENANT_ID_STRING);
  process.exit(1);
}
const tenantPk = tenantRow.id;
console.log(`Tenant ${TENANT_ID_STRING} → pk ${tenantPk}`);
console.log(`DB: ${dbPath}`);
console.log(APPLY ? 'MODE: APPLY' : 'MODE: dry-run');

const articles = db
  .prepare(
    `SELECT a.id, a.document_id, a.title, a.published_at, a.created_at, a.updated_at,
            t.tenant_id AS linked_tenant_pk
     FROM articles a
     LEFT JOIN articles_tenant_lnk t ON t.article_id = a.id`
  )
  .all();

console.log(`Loaded ${articles.length} article rows`);

const byTitle = new Map();
for (const a of articles) {
  const key = normTitle(a.title);
  if (!key) continue;
  if (!byTitle.has(key)) byTitle.set(key, []);
  byTitle.get(key).push(a);
}

/** Oldest published_at for a title that is before the bulk cutoff */
function historicalMsForTitle(title) {
  const versions = byTitle.get(normTitle(title)) || [];
  const older = versions
    .filter((v) => v.published_at != null && Number(v.published_at) < BULK_CUTOFF_MS)
    .sort((a, b) => Number(a.published_at) - Number(b.published_at));
  return older[0] ? Number(older[0].published_at) : null;
}

/** Group by document_id */
const byDoc = new Map();
for (const a of articles) {
  if (!byDoc.has(a.document_id)) byDoc.set(a.document_id, []);
  byDoc.get(a.document_id).push(a);
}

const plans = [];
for (const [documentId, rows] of byDoc) {
  const published = rows
    .filter((r) => r.published_at != null)
    .sort((a, b) => Number(b.updated_at) - Number(a.updated_at))[0];
  const draft = rows.find((r) => r.published_at == null);
  if (!published) continue;

  const hasTenantOnPublished = published.linked_tenant_pk === tenantPk;
  const hasTenantOnDraft = draft?.linked_tenant_pk === tenantPk;
  const isOurTenant = hasTenantOnPublished || hasTenantOnDraft;
  if (!isOurTenant) continue;

  const publishedMs = Number(published.published_at);
  const needsDateFix =
    publishedMs >= TODAY_PREFIX_MS || publishedMs >= Date.parse('2026-06-21T00:00:00.000Z');

  const restoreMs = historicalMsForTitle(published.title);
  if (!needsDateFix && hasTenantOnPublished) continue;
  if (needsDateFix && !restoreMs) {
    // Still fix tenant even if we cannot restore a historical date
  }

  plans.push({
    documentId,
    publishedId: published.id,
    draftId: draft?.id ?? null,
    title: String(published.title || '').slice(0, 50),
    currentIso: toIso(published.published_at),
    restoreIso: restoreMs ? toIso(restoreMs) : null,
    restoreMs,
    needsDateFix: Boolean(needsDateFix && restoreMs),
    needsTenantLink: !hasTenantOnPublished,
  });
}

console.log(`Planned fixes: ${plans.length}`);
for (const p of plans.slice(0, 12)) {
  console.log(
    `  ${p.currentIso?.slice(0, 10)} → ${p.restoreIso?.slice(0, 10) || '(keep)'}  tenantFix=${p.needsTenantLink}  ${p.title}`
  );
}
if (plans.length > 12) console.log(`  …and ${plans.length - 12} more`);

if (!APPLY) {
  console.log('\nDry-run complete. Re-run with --apply to write.');
  process.exit(0);
}

const updateDate = db.prepare(
  'UPDATE articles SET published_at = ?, updated_at = updated_at WHERE id = ?'
);
const hasTenantLink = db.prepare(
  'SELECT id FROM articles_tenant_lnk WHERE article_id = ? AND tenant_id = ?'
);
const insertTenantLink = db.prepare(
  'INSERT INTO articles_tenant_lnk (article_id, tenant_id) VALUES (?, ?)'
);

const tx = db.transaction((items) => {
  let dateOk = 0;
  let tenantOk = 0;
  for (const p of items) {
    if (p.needsDateFix && p.restoreMs != null) {
      updateDate.run(p.restoreMs, p.publishedId);
      dateOk += 1;
    }
    if (p.needsTenantLink) {
      const existing = hasTenantLink.get(p.publishedId, tenantPk);
      if (!existing) {
        insertTenantLink.run(p.publishedId, tenantPk);
        tenantOk += 1;
      }
    }
  }
  return { dateOk, tenantOk };
});

const result = tx(plans);
console.log(`\nDone. Dates updated: ${result.dateOk}, tenant links added: ${result.tenantOk}`);
console.log('Restart or refresh the news page to see restored dates.');
