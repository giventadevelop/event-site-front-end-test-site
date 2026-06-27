const fs = require('fs');
const path = require('path');

// Use path.join to ensure correct path resolution regardless of where script is run from
const SCRIPT_DIR = __dirname;
const INPUT_FILE = path.join(SCRIPT_DIR, 'export.sql');
const OUTPUT_FILE = path.join(SCRIPT_DIR, 'corrected_event_media_inserts.ordered.sql');

const TABLE_ORDER = [
  'event_type_details',
  'user_profile',
  'event_details',
  'event_guest_pricing',
  'event_admin',
  'event_admin_audit_log',
  'event_attendee',
  'event_attendee_guest',
  'event_calendar_entry',
  'event_live_update',
  'event_live_update_attachment',
  'event_sponsors',      // parent of event_media.sponsor_id (fk_event_media_sponsor_id)
  'event_sponsors_join',
  'gallery_category', // parent of gallery_album.gallery_category_id (fk_gallery_album_category)
  'gallery_album',   // parent of event_media.album_id (fk_event_media_album_id)
  'official_document_category', // parent of event_media.official_document_category_id (fk_event_media_official_document_category_id); see Latest_Schema_Post__Blob_Claude_12.sql
  'official_document_year_bundle', // parent rows for year bundles; must precede event_media rows that reference bundles
  'event_media',
  'event_organizer',
  'event_poll',
  'event_poll_option',
  'event_poll_response',
  'event_score_card',
  'event_score_card_detail',
  'discount_code',
  'event_ticket_type',
  'event_ticket_transaction',
  'event_ticket_transaction_item',
  'qr_code_usage',
  'rel_event_details__discount_codes',
  'tenant_organization',
  'tenant_settings',
  'tenant_email_addresses',
  'satellite_domain',
  'user_payment_transaction',
  'user_subscription',
  'user_task',
  'event_contacts',
  'event_emails',
  'event_featured_performers',
  'event_program_directors',
  'executive_committee_team_members',
  'event_recurrence_series',
  'focus_group',
  'focus_group_members',
  'event_focus_groups',
  'membership_plan',
  'membership_subscription',
  'payment_provider_config',
  'promotion_email_template',
  'promotion_email_sent_log',
  'manual_payment_request',
  'manual_payment_summary_report',
  'clerk_organization_role',
  'batch_job_instance',
  'batch_job_execution',
  'batch_job_execution_context',
  'batch_job_execution_params',
  'batch_step_execution',
  'batch_step_execution_context',
  'batch_job_execution_log',
  'bulk_operation_log',
  'databasechangelog',
  'databasechangeloglock',
];

function main() {
  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Error: Input file not found: ${INPUT_FILE}`);
    console.error(`   Please ensure the file exists in the same directory as this script.`);
    process.exit(1);
  }

  console.log(`📁 Reading input file: ${INPUT_FILE}`);

  // Read the file as buffer first to detect encoding
  const buffer = fs.readFileSync(INPUT_FILE);

  // Check for UTF-16 LE BOM (FF FE)
  let sql;
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    // UTF-16 LE encoding
    sql = buffer.toString('utf16le').slice(1); // Remove BOM
  } else if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    // UTF-8 BOM
    sql = buffer.toString('utf8').slice(1);
  } else {
    // Try UTF-8 first, fallback to UTF-16 LE if it looks like UTF-16
    sql = buffer.toString('utf8');
    // Check if it looks like UTF-16 (every other byte is 0)
    if (sql.length > 0 && sql.charCodeAt(0) === 0 && sql.charCodeAt(1) !== 0) {
      sql = buffer.toString('utf16le');
    }
  }

  const lines = sql.split(/\r?\n/);

  // Parse complete INSERT statements (multi-line)
  const insertStatements = [];
  let currentStatement = '';
  let inInsertStatement = false;

  for (let i = 0; i < lines.length; i++) {
    // Remove \r characters that might interfere with matching
    let line = lines[i].replace(/\r/g, '');

    // Check if this line starts an INSERT statement
    const insertMatch = line.match(/^INSERT INTO public\.([a-zA-Z0-9_]+) /);
    if (insertMatch) {
      // If we were already building a statement, save it
      if (currentStatement.trim()) {
        insertStatements.push(currentStatement.trim());
      }

      // Start new INSERT statement
      currentStatement = line;
      inInsertStatement = true;

      // Check if this single-line INSERT statement ends with semicolon
      if (line.trim().endsWith(';')) {
        insertStatements.push(currentStatement.trim());
        currentStatement = '';
        inInsertStatement = false;
      }
    } else if (inInsertStatement) {
      // Continue building the current INSERT statement
      currentStatement += '\n' + line;

      // Check if this line ends the INSERT statement (ends with semicolon)
      if (line.trim().endsWith(';')) {
        insertStatements.push(currentStatement.trim());
        currentStatement = '';
        inInsertStatement = false;
      }
    }
  }

  // Don't forget the last statement if file doesn't end with semicolon
  if (currentStatement.trim()) {
    insertStatements.push(currentStatement.trim());
  }

  // Group INSERT statements by table
  const tableInserts = {};
  const insertRegex = /^INSERT INTO public\.([a-zA-Z0-9_]+) /;

  for (const statement of insertStatements) {
    const match = statement.match(insertRegex);
    if (match) {
      const table = match[1];
      if (!tableInserts[table]) {
        tableInserts[table] = [];
      }
      tableInserts[table].push(statement);
    }
  }

  // Deduplicate by primary key (first value in VALUES) for tables that can have duplicate ids in export
  const TABLES_DEDUPE_BY_ID = ['satellite_domain'];
  const valuesIdRegex = /VALUES\s*\(\s*(\d+)/;
  for (const table of TABLES_DEDUPE_BY_ID) {
    if (!tableInserts[table] || tableInserts[table].length <= 1) continue;
    const byId = new Map(); // id -> statement (last occurrence wins)
    for (const stmt of tableInserts[table]) {
      const m = stmt.match(valuesIdRegex);
      const id = m ? m[1] : null;
      if (id != null) byId.set(id, stmt);
      else byId.set(stmt, stmt);
    }
    const before = tableInserts[table].length;
    tableInserts[table] = Array.from(byId.values());
    const after = tableInserts[table].length;
    if (before > after) {
      console.log(`   • Deduplicated ${table}: ${before} → ${after} insert(s) by id`);
    }
  }

  // Find all tables present in the file
  const allTables = Object.keys(tableInserts);

  // Find tables not in TABLE_ORDER
  const extraTables = allTables.filter(t => !TABLE_ORDER.includes(t));

  // Compose output in the required order
  let output = [];

  for (const table of TABLE_ORDER) {
    if (tableInserts[table]) {
      output = output.concat(tableInserts[table]);
    }
  }

  // Add any extra tables before the last three (metadata tables)
  const lastThree = TABLE_ORDER.slice(-3);
  let extraInserts = [];

  for (const table of extraTables) {
    extraInserts = extraInserts.concat(tableInserts[table]);
  }

  // Insert extra tables before the last three
  if (extraInserts.length > 0) {
    // Find where to insert: before the first of the last three
    let insertIdx = output.length;
    for (let i = 0; i < output.length; i++) {
      if (lastThree.some(t => output[i].includes(`INSERT INTO public.${t} `))) {
        insertIdx = i;
        break;
      }
    }

    output = [
      ...output.slice(0, insertIdx),
      ...extraInserts,
      ...output.slice(insertIdx),
    ];
  }

  // Write the reordered SQL to output file
  const outputContent = output.join('\n\n') + '\n';
  fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');

  console.log(`✅ Success! Output written to: ${OUTPUT_FILE}`);
  console.log(`📊 Summary:`);
  console.log(`   • Total INSERT statements: ${insertStatements.length}`);
  console.log(`   • Tables found: ${allTables.join(', ')}`);
  console.log(`   • Extra tables (not in order): ${extraTables.length > 0 ? extraTables.join(', ') : 'none'}`);
}

// Run the script
main();



























