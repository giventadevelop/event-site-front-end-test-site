const fs = require('fs');

const INPUT_FILE = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql';
const OUTPUT_FILE = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.ordered.sql';

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
  console.log('🚀 Starting SQL INSERT reordering...');

  // Read the input file
  const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
  const lines = fileContent.split(/\r?\n/);

  console.log(`📄 Read ${lines.length} lines from input file`);

  // Parse complete INSERT statements
  const insertStatements = [];
  let currentStatement = '';
  let inInsertStatement = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts an INSERT statement
    if (line.match(/^INSERT INTO public\./)) {
      // Save previous statement if exists
      if (currentStatement.trim()) {
        insertStatements.push(currentStatement.trim());
      }

      // Start new INSERT statement
      currentStatement = line;
      inInsertStatement = true;
    } else if (inInsertStatement) {
      // Continue building current statement
      currentStatement += '\n' + line;

      // Check if statement ends (line ends with semicolon)
      if (line.trim().endsWith(';')) {
        insertStatements.push(currentStatement.trim());
        currentStatement = '';
        inInsertStatement = false;
      }
    }
  }

  // Handle last statement if file doesn't end with semicolon
  if (currentStatement.trim()) {
    insertStatements.push(currentStatement.trim());
  }

  console.log(`🔍 Found ${insertStatements.length} complete INSERT statements`);

  // Group statements by table
  const tableInserts = {};

  for (const statement of insertStatements) {
    const match = statement.match(/^INSERT INTO public\.([a-zA-Z0-9_]+) /);
    if (match) {
      const tableName = match[1];
      if (!tableInserts[tableName]) {
        tableInserts[tableName] = [];
      }
      tableInserts[tableName].push(statement);
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

  // Build output in the correct order
  let output = [];
  let orderedCount = 0;

  // Add tables in the specified order
  for (const tableName of TABLE_ORDER) {
    if (tableInserts[tableName]) {
      output = output.concat(tableInserts[tableName]);
      orderedCount += tableInserts[tableName].length;
      console.log(`✅ Added ${tableInserts[tableName].length} INSERT(s) for table: ${tableName}`);
    }
  }

  // Add any tables not in the order list (before metadata tables)
  let extraCount = 0;
  if (extraTables.length > 0) {
    // Insert before metadata tables
    let insertIndex = output.length;
    for (let i = 0; i < output.length; i++) {
      if (output[i].includes('INSERT INTO public.bulk_operation_log') ||
          output[i].includes('INSERT INTO public.databasechangelog')) {
        insertIndex = i;
        break;
      }
    }

    const extraStatements = [];
    for (const tableName of extraTables) {
      extraStatements.push(...tableInserts[tableName]);
      extraCount += tableInserts[tableName].length;
    }

    output = [
      ...output.slice(0, insertIndex),
      ...extraStatements,
      ...output.slice(insertIndex)
    ];

    console.log(`📝 Added ${extraCount} extra INSERT(s) before metadata tables`);
  }

  // Write output file
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

main();



























