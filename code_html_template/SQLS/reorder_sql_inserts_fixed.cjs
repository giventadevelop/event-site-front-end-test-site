const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql');
const OUTPUT_FILE = path.join(__dirname, 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.ordered.sql');

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
  'qr_code_usage',
  'rel_event_detailsdiscount_codes',
  'tenant_organization',
  'tenant_settings',
  'user_payment_transaction',
  'user_subscription',
  'user_task',
  'event_contacts',
  'event_emails',
  'event_featured_performers',
  'event_program_directors',
  'event_sponsors',
  'event_sponsors_join',
  'executive_committee_team_members',
  'bulk_operation_log',
  'databasechangelog',
  'databasechangeloglock',
];

function main() {
  console.log('🚀 Starting SQL INSERT reordering process...');
  console.log('📁 Input file:', INPUT_FILE);
  console.log('📁 Output file:', OUTPUT_FILE);

  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file does not exist: ${INPUT_FILE}`);
  }

  const sql = fs.readFileSync(INPUT_FILE, 'utf8');
  const lines = sql.split(/\r?\n/);

  console.log(`📄 Read ${lines.length} lines from input file`);

  // Parse complete INSERT statements (multi-line)
  const insertStatements = [];
  let currentStatement = '';
  let inInsertStatement = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts an INSERT statement
    if (line.match(/^INSERT INTO public\.([a-zA-Z0-9_]+) /)) {
      // If we were already building a statement, save it
      if (currentStatement.trim()) {
        insertStatements.push(currentStatement.trim());
      }

      // Start new INSERT statement
      currentStatement = line;
      inInsertStatement = true;
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

  console.log(`🔍 Found ${insertStatements.length} INSERT statements`);

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

  // Find all tables present in the file
  const allTables = Object.keys(tableInserts);
  console.log(`📊 Found tables: ${allTables.join(', ')}`);

  // Find tables not in TABLE_ORDER
  const extraTables = allTables.filter(t => !TABLE_ORDER.includes(t));
  if (extraTables.length > 0) {
    console.log(`⚠️  Extra tables not in order: ${extraTables.join(', ')}`);
  }

  // Compose output in the required order
  let output = [];
  let orderedCount = 0;

  for (const table of TABLE_ORDER) {
    if (tableInserts[table]) {
      output = output.concat(tableInserts[table]);
      orderedCount += tableInserts[table].length;
      console.log(`✅ Added ${tableInserts[table].length} INSERT(s) for table: ${table}`);
    }
  }

  // Add any extra tables before the last three (metadata tables)
  const lastThree = TABLE_ORDER.slice(-3);
  let extraInserts = [];
  let extraCount = 0;

  for (const table of extraTables) {
    extraInserts = extraInserts.concat(tableInserts[table]);
    extraCount += tableInserts[table].length;
  }

  // Insert extra tables before the last three
  if (extraInserts.length > 0) {
    console.log(`📝 Adding ${extraCount} extra INSERT(s) before metadata tables`);

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

  console.log('\n🎉 SQL reordering completed successfully!');
  console.log(`📈 Summary:`);
  console.log(`   • Total INSERT statements: ${insertStatements.length}`);
  console.log(`   • Ordered INSERT statements: ${orderedCount}`);
  console.log(`   • Extra INSERT statements: ${extraCount}`);
  console.log(`   • Output file: ${OUTPUT_FILE}`);
  console.log(`   • Output lines: ${outputContent.split('\n').length}`);
}

// Error handling
try {
  main();
} catch (error) {
  console.error('❌ Error occurred:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
