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
  // Read the entire file content
  const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');

  // Split the content into individual INSERT statements
  // Each INSERT statement starts with "INSERT INTO public." and ends with ";"
  const insertStatements = [];

  // Use a more robust approach: split by INSERT and then reconstruct
  const parts = fileContent.split(/(?=INSERT INTO public\.)/);

  for (const part of parts) {
    if (part.trim() && part.includes('INSERT INTO public.')) {
      // Find the complete statement by looking for the last semicolon
      const lines = part.split('\n');
      let statement = '';
      let foundEnd = false;

      for (let i = 0; i < lines.length; i++) {
        statement += (i > 0 ? '\n' : '') + lines[i];

        // Check if this line ends the statement
        if (lines[i].trim().endsWith(';')) {
          foundEnd = true;
          break;
        }
      }

      if (foundEnd && statement.trim()) {
        insertStatements.push(statement.trim());
      }
    }
  }

  // Group statements by table name
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

  // Build the output in the correct order
  let output = [];

  // Add tables in the specified order
  for (const tableName of TABLE_ORDER) {
    if (tableInserts[tableName]) {
      output = output.concat(tableInserts[tableName]);
    }
  }

  // Add any extra tables (not in the order list) before metadata tables
  const allTables = Object.keys(tableInserts);
  const extraTables = allTables.filter(t => !TABLE_ORDER.includes(t));

  if (extraTables.length > 0) {
    // Find where to insert the extra tables (before metadata tables)
    let insertIndex = output.length;
    for (let i = 0; i < output.length; i++) {
      if (output[i].includes('INSERT INTO public.bulk_operation_log') ||
          output[i].includes('INSERT INTO public.databasechangelog')) {
        insertIndex = i;
        break;
      }
    }

    // Collect all extra statements
    const extraStatements = [];
    for (const tableName of extraTables) {
      extraStatements.push(...tableInserts[tableName]);
    }

    // Insert them at the correct position
    output = [
      ...output.slice(0, insertIndex),
      ...extraStatements,
      ...output.slice(insertIndex)
    ];
  }

  // Write the final output
  const finalOutput = output.join('\n\n') + '\n';
  fs.writeFileSync(OUTPUT_FILE, finalOutput, 'utf8');
}

main();



























