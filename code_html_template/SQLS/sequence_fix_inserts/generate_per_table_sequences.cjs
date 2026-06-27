#!/usr/bin/env node
/**
 * Per-table sequence migration tooling.
 *
 * Parses Latest_Schema_Post__Blob_Claude_12.sql for tables using sequence_generator,
 * emits sync_all_table_sequences.sql, entity-patch-map.json, and optionally patches schema + Java entities.
 *
 * Usage:
 *   node generate_per_table_sequences.cjs [--dry-run]
 *   node generate_per_table_sequences.cjs --apply-schema
 *   node generate_per_table_sequences.cjs --apply-java
 *   node generate_per_table_sequences.cjs --apply-schema --apply-java
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const SCHEMA_FILE = path.join(SCRIPT_DIR, '..', 'Current_Sqls', 'Latest_Schema_Post__Blob_Claude_12.sql');
const SYNC_OUT = path.join(SCRIPT_DIR, '..', 'Current_Sqls', 'sync_all_table_sequences.sql');
const PATCH_MAP_OUT = path.join(SCRIPT_DIR, 'entity-patch-map.json');
const DOMAIN_DIR = path.join(
  'F:',
  'project_workspace',
  'event-site-manager-service',
  'src',
  'main',
  'java',
  'com',
  'eventsitemanager',
  'domain'
);

/** Tables that already use a dedicated sequence in schema (do not create {table}_id_seq duplicate). */
const EXISTING_SEQ_BY_TABLE = {
  discount_code: 'discount_code_id_seq',
  event_live_update: 'event_live_update_id_seq',
  event_live_update_attachment: 'event_live_update_attachment_id_seq',
  event_score_card: 'event_score_card_id_seq',
  event_score_card_detail: 'event_score_card_detail_id_seq',
  batch_job_execution_log: 'batch_job_execution_log_id_seq',
};

/** Spring Batch framework — excluded from app per-table migration. */
const EXCLUDED_TABLES = new Set([
  'databasechangelog',
  'databasechangeloglock',
  'batch_job_instance',
  'batch_job_execution',
  'batch_step_execution',
  'batch_job_execution_context',
  'batch_job_execution_params',
  'batch_step_execution_context',
]);

/** Join tables with composite PK only — no surrogate id column. */
const JOIN_TABLES_NO_ID = new Set(['rel_event_details__discount_codes']);

/** Entity @Table name overrides (Java table name != inferred). */
const ENTITY_TABLE_OVERRIDES = {
  BatchJobExecution: { table: 'batch_job_execution_log', sequence: 'batch_job_execution_log_id_seq' },
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const applySchema = args.includes('--apply-schema');
const applyJava = args.includes('--apply-java');
const fixDefaults = args.includes('--fix-defaults');

function snakeToCamel(snake) {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function tableToSeqName(table) {
  if (EXISTING_SEQ_BY_TABLE[table]) return EXISTING_SEQ_BY_TABLE[table];
  return `${table}_id_seq`;
}

function tableToGeneratorName(table) {
  return `${snakeToCamel(table)}Seq`;
}

function tableHasSurrogateId(slice) {
  return /\bid\s+(?:bigint|int8)\s+DEFAULT\s+nextval\(/i.test(slice);
}

function parseSchemaTables(schemaText) {
  const tables = [];
  const createRe = /CREATE TABLE (?:IF NOT EXISTS )?public\.([a-z0-9_]+)\s*\(/gi;
  let m;
  while ((m = createRe.exec(schemaText)) !== null) {
    const table = m[1].toLowerCase();
    if (EXCLUDED_TABLES.has(table) || JOIN_TABLES_NO_ID.has(table)) continue;
    if (table.startsWith('batch_') && table !== 'batch_job_execution_log') continue;

    const slice = schemaText.slice(m.index, m.index + 4000);
    if (!tableHasSurrogateId(slice)) continue;

    const seqGen = /nextval\('public\.sequence_generator'::regclass\)/.test(slice);
    const dedicated = /nextval\('public\.([a-z0-9_]+(?:_id_seq|_seq))'::regclass\)/.exec(slice);
    const bigserial = /\bid\s+BIGSERIAL\b/i.test(slice);

    if (seqGen) {
      tables.push({ table, sequence: tableToSeqName(table), usesShared: true });
    } else if (dedicated) {
      tables.push({ table, sequence: tableToSeqName(table), usesShared: false });
    } else if (bigserial && table === 'batch_job_execution_log') {
      tables.push({ table, sequence: 'batch_job_execution_log_id_seq', usesShared: false });
    }
  }
  return tables;
}

function fixAllTableDefaults(schemaText, tables) {
  let out = schemaText;
  for (const t of tables) {
    const createRe = new RegExp(
      `(CREATE TABLE(?: IF NOT EXISTS)? public\\.${t.table}[\\s\\S]*?\\bid (?:bigint|int8) DEFAULT )nextval\\('public\\.[^']+'::regclass\\)`,
      'gi'
    );
    out = out.replace(createRe, `$1nextval('public.${t.sequence}'::regclass)`);
    const primaryRe = new RegExp(
      `(CREATE TABLE public\\.${t.table}[\\s\\S]*?\\bid bigint PRIMARY KEY DEFAULT )nextval\\('public\\.[^']+'::regclass\\)`,
      'gi'
    );
    out = out.replace(primaryRe, `$1nextval('public.${t.sequence}'::regclass)`);
  }
  // Remove orphan sequences for join tables
  for (const joinTable of JOIN_TABLES_NO_ID) {
    out = out.replace(
      new RegExp(`CREATE SEQUENCE IF NOT EXISTS public\\.${joinTable}_id_seq[\\s\\S]*?CACHE 1;\\r?\\n`, 'g'),
      ''
    );
    out = out.replace(
      new RegExp(`-- ${joinTable}[\\s\\S]*?SELECT pg_catalog\\.setval\\([\\s\\S]*?\\);\\r?\\n`, 'g'),
      ''
    );
  }
  return out;
}

function rebuildPerTableSetvalBlock(schemaText, tables) {
  const marker = '-- Per-table application sequences (synced from table MAX(id))';
  const endMarker = '-- Verify executive_committee_team_members sequence';
  const idxStart = schemaText.indexOf(marker);
  const idxEnd = schemaText.indexOf(endMarker);
  if (idxStart === -1 || idxEnd === -1) return schemaText;

  const perTableSetval = [
    marker,
    '-- =====================================================',
    '-- For full DB refresh after import, prefer sync_all_table_sequences.sql',
    '-- Spring Batch sequences below are unchanged.',
    '-- =====================================================',
    '',
    ...tables.map((t) => {
      return `-- ${t.table}
SELECT pg_catalog.setval(
    'public.${t.sequence}',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.${t.table}), 1), 1),
    true
);`;
    }),
    '',
  ].join('\n');

  return schemaText.slice(0, idxStart) + perTableSetval + schemaText.slice(idxEnd);
}

function buildSyncSql(tables) {
  const tableList = tables
    .map((t) => `        '${t.table}'`)
    .join(',\n');

  return `-- ===================================================
-- Sync all application table sequences (per-table id_seq)
-- ===================================================
-- Replaces sync_sequence_after_inserts.sql after per-table sequence migration.
-- Spring Batch framework sequences: use sync_spring_batch_sequences.sql (step 7b).
-- ===================================================

BEGIN;

DO $$
DECLARE
    tbl text;
    seq_name text;
    max_id bigint;
    new_val bigint;
    tables text[] := ARRAY[
${tableList}
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        seq_name := tbl || '_id_seq';
        IF tbl = 'discount_code' THEN seq_name := 'discount_code_id_seq';
        ELSIF tbl = 'event_live_update' THEN seq_name := 'event_live_update_id_seq';
        ELSIF tbl = 'event_live_update_attachment' THEN seq_name := 'event_live_update_attachment_id_seq';
        ELSIF tbl = 'event_score_card' THEN seq_name := 'event_score_card_id_seq';
        ELSIF tbl = 'event_score_card_detail' THEN seq_name := 'event_score_card_detail_id_seq';
        ELSIF tbl = 'batch_job_execution_log' THEN seq_name := 'batch_job_execution_log_id_seq';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname = seq_name
        ) THEN
            RAISE NOTICE 'Skip % — sequence % not found', tbl, seq_name;
            CONTINUE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            RAISE NOTICE 'Skip % — table not found', tbl;
            CONTINUE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'id'
        ) THEN
            RAISE NOTICE 'Skip % — no id column', tbl;
            CONTINUE;
        END IF;

        EXECUTE format('SELECT COALESCE(MAX(id), 0) FROM public.%I', tbl) INTO max_id;
        new_val := GREATEST(max_id, 1);
        EXECUTE format('SELECT pg_catalog.setval(%L, %s, true)', 'public.' || seq_name, new_val);
        RAISE NOTICE 'Synced % -> % (max id %)', seq_name, new_val, max_id;
    END LOOP;
END $$;

COMMIT;

-- Verification sample
SELECT sequencename, last_value
FROM pg_sequences
WHERE schemaname = 'public'
  AND sequencename LIKE '%_id_seq'
ORDER BY sequencename
LIMIT 20;
`;
}

function buildSequenceCreateBlock(tables) {
  const lines = [
    '-- Per-table application id sequences (replaces shared sequence_generator)',
    '-- =====================================================',
    '',
    'DROP SEQUENCE IF EXISTS public.sequence_generator CASCADE;',
  ];
  for (const t of tables) {
    if (EXISTING_SEQ_BY_TABLE[t.table]) continue;
    lines.push('');
    lines.push(`CREATE SEQUENCE IF NOT EXISTS public.${t.sequence}`);
    lines.push('    INCREMENT BY 1');
    lines.push('    NO MINVALUE');
    lines.push('    NO MAXVALUE');
    lines.push('    START WITH 1');
    lines.push('    CACHE 1;');
  }
  return lines.join('\n');
}

function applySchemaPatch(schemaText, tables) {
  let out = schemaText;

  // Remove legacy shared sequence_generator CREATE block only (keep explicit DROP)
  out = out.replace(
    /-- Name: sequence_generator; Type: SEQUENCE[\s\S]*?CREATE SEQUENCE public\.sequence_generator[\s\S]*?CACHE 1;\r?\n\r?\n/g,
    ''
  );

  // Replace nextval on each table
  for (const t of tables) {
    const re = new RegExp(
      `(CREATE TABLE (?:IF NOT EXISTS )?public\\.${t.table}[\\s\\S]*?\\bid bigint DEFAULT )nextval\\('public\\.sequence_generator'::regclass\\)`,
      'i'
    );
    out = out.replace(
      re,
      `$1nextval('public.${t.sequence}'::regclass)`
    );
    // int8 variant
    const re2 = new RegExp(
      `(CREATE TABLE (?:IF NOT EXISTS )?public\\.${t.table}[\\s\\S]*?\\bid int8 DEFAULT )nextval\\('public\\.sequence_generator'::regclass\\)`,
      'i'
    );
    out = out.replace(
      re2,
      `$1nextval('public.${t.sequence}'::regclass)`
    );
  }

  // Insert per-table CREATE SEQUENCE block after SET default_table_access_method
  const seqBlock = buildSequenceCreateBlock(tables);
  const anchor = 'SET default_table_access_method = heap;\r\n\r\n\r\n\r\n';
  const anchorLf = 'SET default_table_access_method = heap;\n\n\n\n';
  if (out.includes(anchor)) {
    out = out.replace(anchor, anchor + seqBlock + '\n\n\n');
  } else if (out.includes(anchorLf)) {
    out = out.replace(anchorLf, anchorLf + seqBlock + '\n\n\n');
  } else {
    throw new Error('Could not find anchor to insert per-table sequences');
  }

  // Replace end-of-file sequence_generator GREATEST block with per-table setvals (compact dynamic comment)
  const sharedBlockStart = '-- Main shared sequence_generator (for all tables using BIGINT with sequence_generator)';
  const verifyStart = '-- Verify sequence_generator is ahead of event_attendee';
  const idxStart = out.indexOf(sharedBlockStart);
  const idxEnd = out.indexOf(verifyStart);
  if (idxStart !== -1 && idxEnd !== -1) {
    const perTableSetval = [
      '-- Per-table application sequences (synced from table MAX(id))',
      '-- =====================================================',
      '-- For full DB refresh after import, prefer sync_all_table_sequences.sql',
      '-- Spring Batch sequences below are unchanged.',
      '-- =====================================================',
      '',
      ...tables.map((t) => {
        const seq = t.sequence;
        return `-- ${t.table}
SELECT pg_catalog.setval(
    'public.${seq}',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.${t.table}), 1), 1),
    true
);`;
      }),
      '',
    ].join('\n');
    out = out.slice(0, idxStart) + perTableSetval + out.slice(idxEnd);
  }

  // Update verification at end
  out = out.replace(
    /-- Verify sequence_generator is ahead of event_attendee[\s\S]*?END AS status;\r?\n/,
    `-- Verify executive_committee_team_members sequence (per-table model)
SELECT
    (SELECT last_value FROM pg_sequences WHERE sequencename = 'executive_committee_team_members_id_seq') AS seq_last_value,
    (SELECT MAX(id) FROM public.executive_committee_team_members) AS table_max_id,
    CASE
        WHEN (SELECT last_value FROM pg_sequences WHERE sequencename = 'executive_committee_team_members_id_seq')
             >= COALESCE((SELECT MAX(id) FROM public.executive_committee_team_members), 0)
        THEN 'OK: per-table sequence >= max(id)'
        ELSE 'WARNING: run sync_all_table_sequences.sql'
    END AS status;
`
  );

  return out;
}

function buildEntityPatchMap(tables) {
  const map = {};
  for (const t of tables) {
    map[t.table] = {
      sequence: t.sequence,
      generatorName: tableToGeneratorName(t.table),
      sequenceName: `public.${t.sequence}`,
    };
  }
  for (const [className, override] of Object.entries(ENTITY_TABLE_OVERRIDES)) {
    map[`@entity:${className}`] = {
      table: override.table,
      sequence: override.sequence,
      generatorName: tableToGeneratorName(override.table),
      sequenceName: `public.${override.sequence}`,
    };
  }
  return map;
}

function applyJavaEntities(patchMap) {
  if (!fs.existsSync(DOMAIN_DIR)) {
    console.warn('Domain dir not found:', DOMAIN_DIR);
    return 0;
  }

  const files = fs.readdirSync(DOMAIN_DIR).filter((f) => f.endsWith('.java'));
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(DOMAIN_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('sequence_generator')) continue;

    const className = file.replace('.java', '');
    let patch = null;

    if (ENTITY_TABLE_OVERRIDES[className]) {
      const o = ENTITY_TABLE_OVERRIDES[className];
      patch = {
        generatorName: tableToGeneratorName(o.table),
        sequenceName: `public.${o.sequence}`,
        table: o.table,
      };
    } else {
      const tableMatch = content.match(/name\s*=\s*"([^"]+)"/);
      if (!tableMatch) {
        console.warn('No @Table name for', file);
        continue;
      }
      let table = tableMatch[1];
      if (table === 'whats_app_log') table = 'whatsapp_log';
      patch = patchMap[table];
      if (!patch) {
        console.warn('No patch map entry for table', table, 'in', file);
        continue;
      }
    }

    const oldBlock =
      /@GeneratedValue\(strategy = GenerationType\.SEQUENCE, generator = "sequenceGenerator"\)\s*\n\s*@SequenceGenerator\(name = "sequenceGenerator", sequenceName = "public\.sequence_generator", allocationSize = 1\)/;

    const newBlock = `@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "${patch.generatorName}")\n    @SequenceGenerator(name = "${patch.generatorName}", sequenceName = "${patch.sequenceName}", allocationSize = 1)`;

    if (!oldBlock.test(content)) {
      console.warn('Pattern mismatch in', file);
      continue;
    }

    content = content.replace(oldBlock, newBlock);

    if (patch.table && className === 'BatchJobExecution') {
      content = content.replace(/@Table\(name = "batch_job_execution"\)/, `@Table(name = "${patch.table}")`);
    }

    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    updated++;
    console.log(`${dryRun ? '[dry-run] ' : ''}Updated ${file}`);
  }

  return updated;
}

function validateJavaCoverage(patchMap) {
  if (!fs.existsSync(DOMAIN_DIR)) return;
  const files = fs.readdirSync(DOMAIN_DIR).filter((f) => f.endsWith('.java'));
  const missing = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(DOMAIN_DIR, file), 'utf8');
    if (content.includes('sequence_generator')) {
      missing.push(file);
    }
  }
  if (missing.length) {
    console.warn('Entities still using sequence_generator:', missing.join(', '));
  }
}

function main() {
  const schemaText = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const tables = parseSchemaTables(schemaText);
  const sharedTables = tables.filter((t) => t.usesShared);

  console.log(`Found ${tables.length} application tables with id sequences (${sharedTables.length} migrating off sequence_generator)`);

  const syncSql = buildSyncSql(tables);
  const patchMap = buildEntityPatchMap(tables);

  if (!dryRun) {
    fs.writeFileSync(SYNC_OUT, syncSql, 'utf8');
    fs.writeFileSync(PATCH_MAP_OUT, JSON.stringify(patchMap, null, 2), 'utf8');
    console.log('Wrote', SYNC_OUT);
    console.log('Wrote', PATCH_MAP_OUT);
  }

  if (applySchema) {
    const patched = applySchemaPatch(schemaText, sharedTables);
    if (!dryRun) {
      fs.writeFileSync(SCHEMA_FILE, patched, 'utf8');
      console.log('Patched schema:', SCHEMA_FILE);
    } else {
      console.log('[dry-run] Would patch schema');
    }
  }

  if (fixDefaults) {
    let fixed = fs.readFileSync(SCHEMA_FILE, 'utf8');
    const freshTables = parseSchemaTables(fixed);
    fixed = fixAllTableDefaults(fixed, freshTables);
    fixed = rebuildPerTableSetvalBlock(fixed, freshTables);
    const syncSqlFixed = buildSyncSql(freshTables);
    if (!dryRun) {
      fs.writeFileSync(SCHEMA_FILE, fixed, 'utf8');
      fs.writeFileSync(SYNC_OUT, syncSqlFixed, 'utf8');
      fs.writeFileSync(PATCH_MAP_OUT, JSON.stringify(buildEntityPatchMap(freshTables), null, 2), 'utf8');
      console.log('Fixed per-table defaults in schema:', SCHEMA_FILE);
      console.log('Regenerated', SYNC_OUT);
    } else {
      console.log('[dry-run] Would fix table defaults for', freshTables.length, 'tables');
    }
  }

  if (applyJava) {
    const n = applyJavaEntities(patchMap);
    console.log(`${dryRun ? '[dry-run] ' : ''}Java entities updated: ${n}`);
    validateJavaCoverage(patchMap);
  }
}

main();
